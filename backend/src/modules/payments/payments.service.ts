import { prisma } from '@common/database/prisma.client.js';
import { queueService } from '@common/queue/bullmq.client.js';
import { config } from '@config/index.js';
import { paginate, paginationMeta } from '@common/utils/helpers.js';
import { NotFoundError, BadRequestError } from '@common/errors/custom-errors.js';
import type {
  CreatePaymentIntentInput,
  ConfirmPaymentInput,
  RefundPaymentInput,
  ListPaymentsQuery,
} from './payments.schemas.js';
import Stripe from 'stripe';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2024-11-20.acacia',
});

export class PaymentsService {
  /**
   * Create payment intent for quote
   */
  async createPaymentIntent(userId: string, data: CreatePaymentIntentInput) {
    // Get quote
    const quote = await prisma.quote.findFirst({
      where: {
        id: data.quoteId,
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

    // Validate quote status
    if (quote.status !== 'ACCEPTED') {
      throw new BadRequestError('Quote must be accepted before payment');
    }

    // Check if quote is already paid
    const existingPayment = await prisma.payment.findFirst({
      where: {
        quoteId: data.quoteId,
        status: { in: ['SUCCEEDED', 'PROCESSING'] },
      },
    });

    if (existingPayment) {
      throw new BadRequestError('Quote has already been paid');
    }

    // Calculate amount in cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(Number(quote.totalAmount) * 100);

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      customer: await this.getOrCreateStripeCustomer(userId, quote.user.email),
      metadata: {
        userId,
        quoteId: quote.id,
        packageIds: quote.packages.map((p) => p.id).join(','),
      },
      description: `Payment for quote ${quote.id} - ${quote.packages.length} package(s)`,
      ...(data.paymentMethodId && { payment_method: data.paymentMethodId }),
      setup_future_usage: data.savePaymentMethod ? 'off_session' : undefined,
    });

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        quoteId: quote.id,
        stripePaymentId: paymentIntent.id,
        amount: quote.totalAmount,
        currency: 'EUR',
        status: 'PENDING',
        paymentMethod: data.paymentMethodId || null,
        metadata: {
          stripeClientSecret: paymentIntent.client_secret,
        },
      },
    });

    // Log creation
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PAYMENT_INTENT_CREATED',
        resourceType: 'PAYMENT',
        resourceId: payment.id,
        metadata: {
          quoteId: quote.id,
          amount: quote.totalAmount,
        },
      },
    });

    return {
      paymentId: payment.id,
      clientSecret: paymentIntent.client_secret,
      amount: quote.totalAmount,
    };
  }

  /**
   * Get or create Stripe customer
   */
  private async getOrCreateStripeCustomer(userId: string, email: string): Promise<string> {
    // Check if user already has a Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    // In production, you'd store stripeCustomerId in user profile
    // For now, we'll create a new customer each time
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId,
      },
      name: user?.profile?.firstName
        ? `${user.profile.firstName} ${user.profile.lastName || ''}`
        : undefined,
    });

    return customer.id;
  }

  /**
   * Confirm payment
   */
  async confirmPayment(userId: string, data: ConfirmPaymentInput) {
    // Get payment
    const payment = await prisma.payment.findFirst({
      where: {
        userId,
        stripePaymentId: data.paymentIntentId,
      },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    // Get payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(data.paymentIntentId);

    // Update payment status based on Stripe status
    let status: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' = 'PENDING';

    if (paymentIntent.status === 'succeeded') {
      status = 'SUCCEEDED';
    } else if (paymentIntent.status === 'processing') {
      status = 'PROCESSING';
    } else if (paymentIntent.status === 'requires_payment_method') {
      status = 'FAILED';
    }

    // Update payment
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: { status },
    });

    // If succeeded, update quote and packages
    if (status === 'SUCCEEDED') {
      await this.handlePaymentSuccess(payment.id);
    }

    return updatedPayment;
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentSuccess(paymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        quote: {
          include: {
            packages: true,
          },
        },
      },
    });

    if (!payment || !payment.quote) {
      return;
    }

    // Update quote status
    await prisma.quote.update({
      where: { id: payment.quoteId! },
      data: { status: 'PAID' },
    });

    // Update packages status
    await prisma.package.updateMany({
      where: { quoteId: payment.quoteId! },
      data: { status: 'PAID' },
    });

    // Send notification
    await queueService.sendNotification({
      userId: payment.userId,
      type: 'PAYMENT_SUCCESS',
      title: 'Payment successful',
      message: `Your payment of €${payment.amount} has been processed successfully.`,
      link: `/quotes/${payment.quoteId}`,
    });

    // Send email
    await queueService.sendEmail({
      to: payment.quote.user?.email || '',
      subject: 'Payment Confirmation - ReExpressTrack',
      html: `
        <h1>Payment Successful!</h1>
        <p>Your payment of €${payment.amount} has been processed.</p>
        <p>Your packages will be prepared for shipping shortly.</p>
        <p>Quote ID: ${payment.quoteId}</p>
        <p>Thank you for using ReExpressTrack!</p>
      `,
    });

    // Log success
    await prisma.auditLog.create({
      data: {
        userId: payment.userId,
        action: 'PAYMENT_SUCCEEDED',
        resourceType: 'PAYMENT',
        resourceId: paymentId,
        metadata: {
          amount: payment.amount,
          quoteId: payment.quoteId,
        },
      },
    });
  }

  /**
   * Handle Stripe webhook
   */
  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await this.handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  /**
   * Handle payment intent succeeded webhook
   */
  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentId: paymentIntent.id },
    });

    if (!payment) {
      return;
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'SUCCEEDED' },
    });

    await this.handlePaymentSuccess(payment.id);
  }

  /**
   * Handle payment intent failed webhook
   */
  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentId: paymentIntent.id },
    });

    if (!payment) {
      return;
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED' },
    });

    // Send notification
    await queueService.sendNotification({
      userId: payment.userId,
      type: 'PAYMENT_SUCCESS', // Using existing type
      title: 'Payment failed',
      message: 'Your payment could not be processed. Please try again.',
      link: `/quotes/${payment.quoteId}`,
    });
  }

  /**
   * Handle charge refunded webhook
   */
  private async handleChargeRefunded(charge: Stripe.Charge) {
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentId: charge.payment_intent as string },
    });

    if (!payment) {
      return;
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'REFUNDED' },
    });

    // Send notification
    await queueService.sendNotification({
      userId: payment.userId,
      type: 'PAYMENT_SUCCESS',
      title: 'Payment refunded',
      message: `Your payment of €${payment.amount} has been refunded.`,
    });
  }

  /**
   * List payments
   */
  async listPayments(userId: string, query: ListPaymentsQuery) {
    const { page, limit, status, sortBy, sortOrder } = query;

    // Build where clause
    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    // Count total
    const total = await prisma.payment.count({ where });

    // Get payments
    const payments = await prisma.payment.findMany({
      where,
      ...paginate(page, limit),
      orderBy: { [sortBy]: sortOrder },
      include: {
        quote: {
          select: {
            id: true,
            status: true,
            selectedCarrier: true,
          },
        },
      },
    });

    return {
      data: payments,
      meta: paginationMeta(total, page, limit),
    };
  }

  /**
   * Get payment by ID
   */
  async getPayment(userId: string, paymentId: string) {
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        userId,
      },
      include: {
        quote: {
          include: {
            packages: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    return payment;
  }

  /**
   * Refund payment
   */
  async refundPayment(userId: string, paymentId: string, data: RefundPaymentInput) {
    // Get payment
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        userId,
      },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    if (payment.status !== 'SUCCEEDED') {
      throw new BadRequestError('Only succeeded payments can be refunded');
    }

    // Calculate refund amount in cents
    const refundAmount = data.amount
      ? Math.round(data.amount * 100)
      : Math.round(Number(payment.amount) * 100);

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentId!,
      amount: refundAmount,
      reason: data.reason,
      metadata: {
        userId,
        paymentId: payment.id,
      },
    });

    // Update payment status
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'REFUNDED' },
    });

    // Update quote and packages status
    if (payment.quoteId) {
      await prisma.quote.update({
        where: { id: payment.quoteId },
        data: { status: 'CANCELLED' },
      });

      await prisma.package.updateMany({
        where: { quoteId: payment.quoteId },
        data: { status: 'STORED' },
      });
    }

    // Log refund
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PAYMENT_REFUNDED',
        resourceType: 'PAYMENT',
        resourceId: paymentId,
        metadata: {
          refundId: refund.id,
          amount: refundAmount / 100,
          reason: data.reason,
        },
      },
    });

    return {
      success: true,
      refundId: refund.id,
      amount: refundAmount / 100,
    };
  }

  /**
   * Get payment statistics for user
   */
  async getPaymentStats(userId: string) {
    const [totalSpent, successfulPayments, pendingPayments, refundedAmount] = await Promise.all([
      prisma.payment.aggregate({
        where: { userId, status: 'SUCCEEDED' },
        _sum: { amount: true },
      }),
      prisma.payment.count({
        where: { userId, status: 'SUCCEEDED' },
      }),
      prisma.payment.count({
        where: { userId, status: { in: ['PENDING', 'PROCESSING'] } },
      }),
      prisma.payment.aggregate({
        where: { userId, status: 'REFUNDED' },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalSpent: totalSpent._sum.amount || 0,
      successfulPayments,
      pendingPayments,
      refundedAmount: refundedAmount._sum.amount || 0,
    };
  }
}
