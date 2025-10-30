import { prisma } from '@common/database/prisma.client.js';
import { storageService } from '@common/storage/minio.client.js';
import { queueService } from '@common/queue/bullmq.client.js';
import { config } from '@config/index.js';
import { paginate, paginationMeta, calculateStorageFees } from '@common/utils/helpers.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '@common/errors/custom-errors.js';
import type {
  CreatePackageInput,
  UpdatePackageInput,
  ListPackagesQuery,
  UpdateTrackingInput,
} from './packages.schemas.js';
import axios from 'axios';

export class PackagesService {
  /**
   * Create new package
   */
  async createPackage(userId: string, data: CreatePackageInput) {
    const packageData = await prisma.package.create({
      data: {
        userId,
        trackingNumber: data.trackingNumber,
        description: data.description,
        weight: data.weight,
        dimensions: data.dimensions,
        status: 'ANNOUNCED',
        photos: [],
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    // If tracking number provided, queue tracking update
    if (data.trackingNumber) {
      await queueService.updateTracking({
        packageId: packageData.id,
        trackingNumber: data.trackingNumber,
      });
    }

    // Send notification
    await queueService.sendNotification({
      userId,
      type: 'PACKAGE_ANNOUNCED',
      title: 'Package Announced',
      message: `Your package has been announced and is waiting to be received.`,
      link: `/packages/${packageData.id}`,
    });

    // Log creation
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PACKAGE_CREATED',
        resourceType: 'PACKAGE',
        resourceId: packageData.id,
        metadata: data,
      },
    });

    return packageData;
  }

  /**
   * List packages with pagination and filters
   */
  async listPackages(userId: string, query: ListPackagesQuery) {
    const { page, limit, status, search, sortBy, sortOrder } = query;

    // Build where clause
    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { trackingNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Count total
    const total = await prisma.package.count({ where });

    // Get packages
    const packages = await prisma.package.findMany({
      where,
      ...paginate(page, limit),
      orderBy: { [sortBy]: sortOrder },
      include: {
        quote: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
          },
        },
      },
    });

    // Calculate storage fees for each package
    const packagesWithFees = packages.map((pkg) => {
      let storageFees = 0;
      if (pkg.receivedAt && pkg.status === 'STORED') {
        storageFees = calculateStorageFees(
          pkg.receivedAt,
          config.storage.freeStorageDays,
          config.storage.feePerDay
        );
      }
      return {
        ...pkg,
        storageFees,
      };
    });

    return {
      data: packagesWithFees,
      meta: paginationMeta(total, page, limit),
    };
  }

  /**
   * Get package by ID
   */
  async getPackage(userId: string, packageId: string) {
    const pkg = await prisma.package.findFirst({
      where: {
        id: packageId,
        userId,
      },
      include: {
        quote: true,
        trackingEvents: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!pkg) {
      throw new NotFoundError('Package not found');
    }

    // Calculate storage fees
    let storageFees = 0;
    if (pkg.receivedAt && pkg.status === 'STORED') {
      storageFees = calculateStorageFees(
        pkg.receivedAt,
        config.storage.freeStorageDays,
        config.storage.feePerDay
      );
    }

    return {
      ...pkg,
      storageFees,
    };
  }

  /**
   * Update package
   */
  async updatePackage(userId: string, packageId: string, data: UpdatePackageInput) {
    // Check ownership
    const pkg = await prisma.package.findFirst({
      where: {
        id: packageId,
        userId,
      },
    });

    if (!pkg) {
      throw new NotFoundError('Package not found');
    }

    // Update package
    const updatedPackage = await prisma.package.update({
      where: { id: packageId },
      data,
    });

    // Log update
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PACKAGE_UPDATED',
        resourceType: 'PACKAGE',
        resourceId: packageId,
        metadata: data,
      },
    });

    return updatedPackage;
  }

  /**
   * Delete package
   */
  async deletePackage(userId: string, packageId: string) {
    // Check ownership
    const pkg = await prisma.package.findFirst({
      where: {
        id: packageId,
        userId,
      },
    });

    if (!pkg) {
      throw new NotFoundError('Package not found');
    }

    // Don't allow deletion if package has been paid
    if (pkg.status === 'PAID' || pkg.status === 'SHIPPED' || pkg.status === 'DELIVERED') {
      throw new BadRequestError('Cannot delete package that has been paid or shipped');
    }

    // Delete photos from MinIO
    if (Array.isArray(pkg.photos)) {
      const photoUrls = (pkg.photos as any[]).map((p: any) => p.url);
      const filenames = photoUrls.map((url) => url.split('/').pop()).filter(Boolean);
      if (filenames.length > 0) {
        await storageService.deleteFiles(filenames);
      }
    }

    // Delete package
    await prisma.package.delete({
      where: { id: packageId },
    });

    // Log deletion
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PACKAGE_DELETED',
        resourceType: 'PACKAGE',
        resourceId: packageId,
      },
    });

    return { success: true };
  }

  /**
   * Upload photos to package
   */
  async uploadPhotos(
    userId: string,
    packageId: string,
    files: Array<{ buffer: Buffer; filename: string; mimetype: string }>,
    captions?: string[]
  ) {
    // Check ownership
    const pkg = await prisma.package.findFirst({
      where: {
        id: packageId,
        userId,
      },
    });

    if (!pkg) {
      throw new NotFoundError('Package not found');
    }

    // Upload photos to MinIO
    const uploadPromises = files.map(async (file, index) => {
      const url = await storageService.uploadFile(
        file.buffer,
        `packages/${packageId}/${file.filename}`,
        file.mimetype,
        { userId, packageId }
      );

      return {
        url,
        caption: captions?.[index],
        uploadedAt: new Date(),
      };
    });

    const uploadedPhotos = await Promise.all(uploadPromises);

    // Add photos to package
    const currentPhotos = (pkg.photos as any[]) || [];
    const updatedPhotos = [...currentPhotos, ...uploadedPhotos];

    await prisma.package.update({
      where: { id: packageId },
      data: {
        photos: updatedPhotos,
      },
    });

    // Log upload
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PACKAGE_PHOTOS_UPLOADED',
        resourceType: 'PACKAGE',
        resourceId: packageId,
        metadata: { photoCount: uploadedPhotos.length },
      },
    });

    return uploadedPhotos;
  }

  /**
   * Delete photo from package
   */
  async deletePhoto(userId: string, packageId: string, photoUrl: string) {
    // Check ownership
    const pkg = await prisma.package.findFirst({
      where: {
        id: packageId,
        userId,
      },
    });

    if (!pkg) {
      throw new NotFoundError('Package not found');
    }

    // Remove photo from array
    const currentPhotos = (pkg.photos as any[]) || [];
    const updatedPhotos = currentPhotos.filter((p: any) => p.url !== photoUrl);

    await prisma.package.update({
      where: { id: packageId },
      data: {
        photos: updatedPhotos,
      },
    });

    // Delete from MinIO
    const filename = photoUrl.split('/').pop();
    if (filename) {
      await storageService.deleteFile(`packages/${packageId}/${filename}`);
    }

    // Log deletion
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PACKAGE_PHOTO_DELETED',
        resourceType: 'PACKAGE',
        resourceId: packageId,
        metadata: { photoUrl },
      },
    });

    return { success: true };
  }

  /**
   * Update tracking number and fetch tracking info
   */
  async updateTracking(userId: string, packageId: string, data: UpdateTrackingInput) {
    // Check ownership
    const pkg = await prisma.package.findFirst({
      where: {
        id: packageId,
        userId,
      },
    });

    if (!pkg) {
      throw new NotFoundError('Package not found');
    }

    // Update tracking number
    await prisma.package.update({
      where: { id: packageId },
      data: {
        trackingNumber: data.trackingNumber,
      },
    });

    // Queue tracking update
    await queueService.updateTracking({
      packageId,
      trackingNumber: data.trackingNumber,
    });

    return { success: true, message: 'Tracking update queued' };
  }

  /**
   * Get tracking events for package
   */
  async getTracking(userId: string, packageId: string) {
    // Check ownership
    const pkg = await prisma.package.findFirst({
      where: {
        id: packageId,
        userId,
      },
      include: {
        trackingEvents: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!pkg) {
      throw new NotFoundError('Package not found');
    }

    return pkg.trackingEvents;
  }

  /**
   * Fetch tracking from 17Track API and update events
   */
  async fetchTracking(packageId: string, trackingNumber: string) {
    try {
      // Call 17Track API
      const response = await axios.post(
        config.track17.apiUrl + '/gettrackinfo',
        {
          number: trackingNumber,
        },
        {
          headers: {
            '17token': config.track17.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.data?.accepted?.[0]?.track?.z0) {
        const events = response.data.data.accepted[0].track.z0;

        // Save tracking events
        for (const event of events) {
          await prisma.trackingEvent.create({
            data: {
              packageId,
              eventType: event.z || 'UPDATE',
              description: event.a || '',
              location: event.c || null,
              timestamp: new Date(event.z1),
              rawData: event,
            },
          });
        }

        return { success: true, eventsCount: events.length };
      }

      return { success: true, eventsCount: 0 };
    } catch (error) {
      console.error('17Track API error:', error);
      return { success: false, error: 'Failed to fetch tracking' };
    }
  }

  /**
   * Calculate and update storage fees
   */
  async calculateStorageFees(packageId: string) {
    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
    });

    if (!pkg || !pkg.receivedAt || pkg.status !== 'STORED') {
      return { fees: 0 };
    }

    const fees = calculateStorageFees(
      pkg.receivedAt,
      config.storage.freeStorageDays,
      config.storage.feePerDay
    );

    // Update package with calculated fees
    await prisma.package.update({
      where: { id: packageId },
      data: { storageFees: fees },
    });

    return { fees };
  }
}
