import { prisma } from '@common/database/prisma.client.js';
import { storageService } from '@common/storage/minio.client.js';
import { queueService } from '@common/queue/bullmq.client.js';
import { paginate, paginationMeta } from '@common/utils/helpers.js';
import { NotFoundError, BadRequestError } from '@common/errors/custom-errors.js';
import type { CreateQuoteInput, AcceptQuoteInput, ListQuotesQuery, CarrierOption } from './quotes.schemas.js';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import emailService from '@services/email.service.js';
import { config } from '@config/index.js';

export class QuotesService {
  /**
   * Create new quote with carrier options
   */
  async createQuote(userId: string, data: CreateQuoteInput) {
    // Get user with profile and email preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        emailPreference: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify all packages belong to user and are eligible for quote
    const packages = await prisma.package.findMany({
      where: {
        id: { in: data.packageIds },
        userId,
      },
    });

    if (packages.length !== data.packageIds.length) {
      throw new BadRequestError('One or more packages not found or do not belong to you');
    }

    // Check if packages are in valid status for quote
    const invalidPackages = packages.filter(
      (pkg) => !['RECEIVED', 'STORED', 'QUOTE_REQUESTED'].includes(pkg.status)
    );

    if (invalidPackages.length > 0) {
      throw new BadRequestError('Some packages are not eligible for quote. They must be received or stored.');
    }

    // Calculate total weight and dimensions
    const totalWeight = packages.reduce((sum, pkg) => sum + (Number(pkg.weight) || 0), 0);

    // Get carrier options (simulated - in production, call real carrier APIs)
    const carrierOptions = this.getCarrierOptions(totalWeight, data.destinationAddress.territory);

    // Calculate total amount (lowest carrier price + storage fees)
    const lowestPrice = Math.min(...carrierOptions.map((c) => c.price));
    const storageFees = packages.reduce((sum, pkg) => sum + Number(pkg.storageFees || 0), 0);
    const totalAmount = lowestPrice + storageFees;

    // Set validity (7 days)
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 7);

    // Create quote
    const quote = await prisma.quote.create({
      data: {
        userId,
        destinationAddress: data.destinationAddress,
        carrierOptions,
        totalAmount,
        status: 'PENDING',
        validUntil,
      },
      include: {
        packages: true,
      },
    });

    // Link packages to quote and update their status
    await prisma.package.updateMany({
      where: { id: { in: data.packageIds } },
      data: {
        quoteId: quote.id,
        status: 'QUOTE_READY',
      },
    });

    // Send notification
    await queueService.sendNotification({
      userId,
      type: 'QUOTE_READY',
      title: 'Your quote is ready',
      message: `Your shipping quote for ${packages.length} package(s) is ready. Total: €${totalAmount.toFixed(2)}`,
      link: `/quotes/${quote.id}`,
    });

    // Send email if user has enabled quote notifications
    if (user.emailPreference?.quoteCreated) {
      const destination = typeof data.destinationAddress === 'object' && 'territory' in data.destinationAddress
        ? data.destinationAddress.territory
        : 'Votre destination';

      await emailService.sendQuoteCreatedEmail(user.email, {
        firstName: user.profile?.firstName || '',
        quoteId: quote.id,
        destination,
        amount: totalAmount,
        quoteLink: `${config.frontend.url}/quotes/${quote.id}`,
      });
    }

    // Log creation
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'QUOTE_CREATED',
        resourceType: 'QUOTE',
        resourceId: quote.id,
        metadata: {
          packageCount: packages.length,
          totalAmount,
        },
      },
    });

    return quote;
  }

  /**
   * Get carrier options (simulated)
   * In production, this would call real carrier APIs
   */
  private getCarrierOptions(weight: number, territory: string): CarrierOption[] {
    const basePrice = 15;
    const weightFactor = weight * 2;

    // Simulate different carriers with different pricing
    const carriers: CarrierOption[] = [
      {
        name: 'Colissimo',
        price: basePrice + weightFactor,
        transitTime: '3-5 business days',
        serviceLevel: 'Standard',
        trackingIncluded: true,
        features: ['Door-to-door delivery', 'Signature required', 'Insurance included'],
      },
      {
        name: 'Chronopost',
        price: basePrice + weightFactor * 1.5,
        transitTime: '1-2 business days',
        serviceLevel: 'Express',
        trackingIncluded: true,
        features: ['Express delivery', 'Door-to-door', 'Real-time tracking', 'Premium insurance'],
      },
      {
        name: 'DHL Express',
        price: basePrice + weightFactor * 2,
        transitTime: '1-3 business days',
        serviceLevel: 'Premium',
        trackingIncluded: true,
        features: ['International express', 'Customs clearance', 'Full insurance', 'SMS notifications'],
      },
      {
        name: 'UPS Standard',
        price: basePrice + weightFactor * 1.3,
        transitTime: '2-4 business days',
        serviceLevel: 'Standard',
        trackingIncluded: true,
        features: ['Reliable delivery', 'Tracking', 'Basic insurance'],
      },
    ];

    // Add territory-specific pricing
    const territoryMultiplier = this.getTerritoryMultiplier(territory);
    return carriers.map((carrier) => ({
      ...carrier,
      price: Number((carrier.price * territoryMultiplier).toFixed(2)),
    }));
  }

  /**
   * Get territory price multiplier
   */
  private getTerritoryMultiplier(territory: string): number {
    const multipliers: Record<string, number> = {
      Guadeloupe: 1.2,
      Martinique: 1.2,
      Guyane: 1.5,
      Réunion: 1.8,
      Mayotte: 1.9,
      'Nouvelle-Calédonie': 2.5,
      'Polynésie française': 3.0,
    };

    return multipliers[territory] || 1.0;
  }

  /**
   * List quotes with pagination and filters
   */
  async listQuotes(userId: string, query: ListQuotesQuery) {
    const { page, limit, status, sortBy, sortOrder } = query;

    // Build where clause
    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    // Count total
    const total = await prisma.quote.count({ where });

    // Get quotes
    const quotes = await prisma.quote.findMany({
      where,
      ...paginate(page, limit),
      orderBy: { [sortBy]: sortOrder },
      include: {
        packages: {
          select: {
            id: true,
            trackingNumber: true,
            description: true,
            weight: true,
            status: true,
          },
        },
      },
    });

    return {
      data: quotes,
      meta: paginationMeta(total, page, limit),
    };
  }

  /**
   * Get quote by ID
   */
  async getQuote(userId: string, quoteId: string) {
    const quote = await prisma.quote.findFirst({
      where: {
        id: quoteId,
        userId,
      },
      include: {
        packages: true,
        payments: true,
      },
    });

    if (!quote) {
      throw new NotFoundError('Quote not found');
    }

    return quote;
  }

  /**
   * Accept quote and select carrier
   */
  async acceptQuote(userId: string, quoteId: string, data: AcceptQuoteInput) {
    // Get quote
    const quote = await prisma.quote.findFirst({
      where: {
        id: quoteId,
        userId,
      },
    });

    if (!quote) {
      throw new NotFoundError('Quote not found');
    }

    // Check if quote is still valid
    if (quote.status !== 'PENDING') {
      throw new BadRequestError('Quote has already been accepted or is no longer valid');
    }

    if (quote.validUntil && new Date() > quote.validUntil) {
      await prisma.quote.update({
        where: { id: quoteId },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestError('Quote has expired');
    }

    // Verify carrier exists in options
    const carrierOptions = quote.carrierOptions as any[];
    const selectedCarrierOption = carrierOptions.find((c) => c.name === data.selectedCarrier);

    if (!selectedCarrierOption) {
      throw new BadRequestError('Invalid carrier selection');
    }

    // Update quote
    const updatedQuote = await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: 'ACCEPTED',
        selectedCarrier: data.selectedCarrier,
      },
      include: {
        packages: true,
      },
    });

    // Update packages status
    await prisma.package.updateMany({
      where: { quoteId },
      data: { status: 'QUOTE_READY' },
    });

    // Send notification
    await queueService.sendNotification({
      userId,
      type: 'QUOTE_READY',
      title: 'Quote accepted',
      message: `You have selected ${data.selectedCarrier}. Please proceed to payment.`,
      link: `/quotes/${quoteId}`,
    });

    // Log acceptance
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'QUOTE_ACCEPTED',
        resourceType: 'QUOTE',
        resourceId: quoteId,
        metadata: {
          selectedCarrier: data.selectedCarrier,
          amount: selectedCarrierOption.price,
        },
      },
    });

    return updatedQuote;
  }

  /**
   * Generate PDF for quote
   */
  async generateQuotePDF(userId: string, quoteId: string): Promise<Buffer> {
    // Get quote with details
    const quote = await prisma.quote.findFirst({
      where: {
        id: quoteId,
        userId,
      },
      include: {
        packages: true,
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!quote) {
      throw new NotFoundError('Quote not found');
    }

    // Create PDF
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(20)
        .text('ReExpressTrack', { align: 'center' })
        .fontSize(16)
        .text('Shipping Quote', { align: 'center' })
        .moveDown();

      // Quote info
      doc
        .fontSize(10)
        .text(`Quote ID: ${quote.id}`)
        .text(`Date: ${quote.createdAt.toLocaleDateString()}`)
        .text(`Valid until: ${quote.validUntil?.toLocaleDateString() || 'N/A'}`)
        .text(`Status: ${quote.status}`)
        .moveDown();

      // Customer info
      doc
        .fontSize(12)
        .text('Customer Information', { underline: true })
        .fontSize(10)
        .text(`Name: ${quote.user.profile?.firstName || ''} ${quote.user.profile?.lastName || ''}`)
        .text(`Email: ${quote.user.email}`)
        .moveDown();

      // Destination
      const dest = quote.destinationAddress as any;
      doc
        .fontSize(12)
        .text('Destination Address', { underline: true })
        .fontSize(10)
        .text(dest.addressLine1)
        .text(dest.addressLine2 || '')
        .text(`${dest.postalCode} ${dest.city}`)
        .text(dest.territory)
        .moveDown();

      // Packages
      doc.fontSize(12).text('Packages', { underline: true }).fontSize(10);

      quote.packages.forEach((pkg, index) => {
        doc.text(`${index + 1}. ${pkg.description || 'Package'}`);
        doc.text(`   Tracking: ${pkg.trackingNumber || 'N/A'}`);
        doc.text(`   Weight: ${pkg.weight || 'N/A'} kg`);
      });

      doc.moveDown();

      // Carrier options
      doc.fontSize(12).text('Carrier Options', { underline: true }).fontSize(10);

      const carriers = quote.carrierOptions as any[];
      carriers.forEach((carrier) => {
        doc.text(`${carrier.name} - €${carrier.price.toFixed(2)}`);
        doc.text(`   Transit time: ${carrier.transitTime}`, { indent: 20 });
        doc.text(`   Service: ${carrier.serviceLevel}`, { indent: 20 });
      });

      doc.moveDown();

      // Total
      doc
        .fontSize(14)
        .text(`Total Amount: €${Number(quote.totalAmount).toFixed(2)}`, { bold: true });

      if (quote.selectedCarrier) {
        doc.fontSize(10).text(`Selected carrier: ${quote.selectedCarrier}`);
      }

      // Footer
      doc
        .moveDown(2)
        .fontSize(8)
        .text('Thank you for choosing ReExpressTrack!', { align: 'center' })
        .text('For any questions, contact support@reexpresstrack.com', { align: 'center' });

      doc.end();
    });
  }

  /**
   * Get quote PDF URL
   */
  async getQuotePDF(userId: string, quoteId: string) {
    // Generate PDF
    const pdfBuffer = await this.generateQuotePDF(userId, quoteId);

    // Upload to MinIO
    const pdfUrl = await storageService.uploadFile(
      pdfBuffer,
      `quotes/${quoteId}/quote.pdf`,
      'application/pdf',
      { userId, quoteId }
    );

    // Update quote with PDF URL
    await prisma.quote.update({
      where: { id: quoteId },
      data: { pdfUrl },
    });

    return { pdfUrl };
  }

  /**
   * Cancel quote
   */
  async cancelQuote(userId: string, quoteId: string) {
    const quote = await prisma.quote.findFirst({
      where: {
        id: quoteId,
        userId,
      },
    });

    if (!quote) {
      throw new NotFoundError('Quote not found');
    }

    if (quote.status === 'PAID') {
      throw new BadRequestError('Cannot cancel a paid quote');
    }

    // Update quote
    await prisma.quote.update({
      where: { id: quoteId },
      data: { status: 'CANCELLED' },
    });

    // Update packages status back to STORED
    await prisma.package.updateMany({
      where: { quoteId },
      data: { status: 'STORED' },
    });

    // Log cancellation
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'QUOTE_CANCELLED',
        resourceType: 'QUOTE',
        resourceId: quoteId,
      },
    });

    return { success: true };
  }
}
