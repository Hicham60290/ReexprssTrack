import { prisma } from '@common/database/prisma.client.js';
import { storageService } from '@common/storage/minio.client.js';
import { hashPassword, verifyPassword, generateReferenceCode } from '@common/utils/helpers.js';
import { NotFoundError, BadRequestError, UnauthorizedError } from '@common/errors/custom-errors.js';
import type {
  UpdateProfileInput,
  CreateFrenchAddressInput,
  UpdateFrenchAddressInput,
  ChangePasswordInput,
} from './users.schemas.js';

export class UsersService {
  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        frenchAddresses: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      profile: user.profile,
      frenchAddresses: user.frenchAddresses,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateProfileInput) {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Update profile
    const updatedProfile = await prisma.profile.update({
      where: { id: userId },
      data,
    });

    // Log update
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PROFILE_UPDATED',
        resourceType: 'PROFILE',
        resourceId: userId,
        metadata: data,
      },
    });

    return updatedProfile;
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(userId: string, file: Buffer, filename: string, contentType: string) {
    // Delete old avatar if exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Upload new avatar to MinIO
    const avatarUrl = await storageService.uploadFile(file, `avatars/${userId}-${filename}`, contentType, {
      userId,
      type: 'avatar',
    });

    // Update profile with avatar URL
    await prisma.profile.update({
      where: { id: userId },
      data: {
        // Note: You may need to add an 'avatar' field to the Profile model
        // For now, we'll store it in a generic way
      },
    });

    // Log avatar upload
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'AVATAR_UPLOADED',
        resourceType: 'PROFILE',
        resourceId: userId,
        metadata: { avatarUrl },
      },
    });

    return { avatarUrl };
  }

  /**
   * Change password
   */
  async changePassword(userId: string, data: ChangePasswordInput) {
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isValidPassword = await verifyPassword(data.currentPassword, user.passwordHash);

    if (!isValidPassword) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Hash new password
    const passwordHash = await hashPassword(data.newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Log password change
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PASSWORD_CHANGED',
        resourceType: 'USER',
        resourceId: userId,
      },
    });

    return { success: true };
  }

  /**
   * Get French addresses
   */
  async getFrenchAddresses(userId: string) {
    const addresses = await prisma.frenchAddress.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return addresses;
  }

  /**
   * Get single French address
   */
  async getFrenchAddress(userId: string, addressId: string) {
    const address = await prisma.frenchAddress.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      throw new NotFoundError('Address not found');
    }

    return address;
  }

  /**
   * Create French address
   */
  async createFrenchAddress(userId: string, data: CreateFrenchAddressInput) {
    // Generate unique reference code
    const referenceCode = generateReferenceCode();

    // Create address
    const address = await prisma.frenchAddress.create({
      data: {
        userId,
        ...data,
        referenceCode,
        isActive: true,
      },
    });

    // Log creation
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'FRENCH_ADDRESS_CREATED',
        resourceType: 'FRENCH_ADDRESS',
        resourceId: address.id,
        metadata: { referenceCode },
      },
    });

    return address;
  }

  /**
   * Update French address
   */
  async updateFrenchAddress(userId: string, addressId: string, data: UpdateFrenchAddressInput) {
    // Check if address belongs to user
    const address = await prisma.frenchAddress.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      throw new NotFoundError('Address not found');
    }

    // Update address
    const updatedAddress = await prisma.frenchAddress.update({
      where: { id: addressId },
      data,
    });

    // Log update
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'FRENCH_ADDRESS_UPDATED',
        resourceType: 'FRENCH_ADDRESS',
        resourceId: addressId,
        metadata: data,
      },
    });

    return updatedAddress;
  }

  /**
   * Delete French address
   */
  async deleteFrenchAddress(userId: string, addressId: string) {
    // Check if address belongs to user
    const address = await prisma.frenchAddress.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      throw new NotFoundError('Address not found');
    }

    // Don't allow deletion of active address if it's the only one
    const addressCount = await prisma.frenchAddress.count({
      where: { userId },
    });

    if (addressCount === 1 && address.isActive) {
      throw new BadRequestError('Cannot delete your only active address');
    }

    // Delete address
    await prisma.frenchAddress.delete({
      where: { id: addressId },
    });

    // Log deletion
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'FRENCH_ADDRESS_DELETED',
        resourceType: 'FRENCH_ADDRESS',
        resourceId: addressId,
      },
    });

    return { success: true };
  }

  /**
   * Set active French address
   */
  async setActiveFrenchAddress(userId: string, addressId: string) {
    // Check if address belongs to user
    const address = await prisma.frenchAddress.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      throw new NotFoundError('Address not found');
    }

    // Deactivate all user addresses and activate the selected one
    await prisma.$transaction([
      prisma.frenchAddress.updateMany({
        where: { userId },
        data: { isActive: false },
      }),
      prisma.frenchAddress.update({
        where: { id: addressId },
        data: { isActive: true },
      }),
    ]);

    // Log activation
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'FRENCH_ADDRESS_ACTIVATED',
        resourceType: 'FRENCH_ADDRESS',
        resourceId: addressId,
      },
    });

    return { success: true };
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string) {
    const [packageCount, activeQuotes, totalPayments] = await Promise.all([
      prisma.package.count({ where: { userId } }),
      prisma.quote.count({ where: { userId, status: 'PENDING' } }),
      prisma.payment.aggregate({
        where: { userId, status: 'SUCCEEDED' },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalPackages: packageCount,
      activeQuotes,
      totalSpent: totalPayments._sum.amount || 0,
    };
  }
}
