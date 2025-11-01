import { prisma } from '@common/database/prisma.client.js';
import { cacheService } from '@common/cache/redis.client.js';
import { hashPassword, verifyPassword, generateRandomString, generateReferenceCode } from '@common/utils/helpers.js';
import { queueService } from '@common/queue/bullmq.client.js';
import { config } from '@config/index.js';
import { UnauthorizedError, ConflictError, NotFoundError } from '@common/errors/custom-errors.js';
import type { LoginInput, RegisterInput } from './auth.schemas.js';
import jwt from 'jsonwebtoken';
import emailService from '@services/email.service.js';

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterInput) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Generate unique reference code for French address
    const referenceCode = generateReferenceCode();

    // Create user and profile in transaction
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: 'USER',
        emailVerified: false,
        profile: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
          },
        },
        frenchAddresses: {
          create: {
            addressLine1: '12 Rue de la Réexpédition',
            addressLine2: `Casier ${referenceCode.substring(7)}`,
            postalCode: '75001',
            city: 'Paris',
            referenceCode,
            isActive: true,
          },
        },
      },
      include: {
        profile: true,
        frenchAddresses: true,
      },
    });

    // Generate verification token
    const verificationToken = generateRandomString(32);
    await cacheService.set(
      `email-verification:${verificationToken}`,
      { userId: user.id, email: user.email },
      3600 * 24 // 24 hours
    );

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, {
      firstName: user.profile?.firstName || '',
      email: user.email,
    });

    // Send email verification
    const verificationLink = `${config.frontend.url}/verify-email?token=${verificationToken}`;
    await emailService.sendEmailVerification(
      user.email,
      verificationLink,
      user.profile?.firstName || ''
    );

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Log registration
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        resourceType: 'USER',
        resourceId: user.id,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        profile: user.profile,
        frenchAddresses: user.frenchAddresses,
      },
      ...tokens,
    };
  }

  /**
   * Login user
   */
  async login(data: LoginInput) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        profile: true,
        frenchAddresses: {
          where: { isActive: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await verifyPassword(data.password, user.passwordHash);

    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Log login
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        resourceType: 'USER',
        resourceId: user.id,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        profile: user.profile,
        frenchAddresses: user.frenchAddresses,
      },
      ...tokens,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as {
        id: string;
        email: string;
        role: string;
      };

      // Check if refresh token is blacklisted
      const isBlacklisted = await cacheService.exists(`blacklist:${refreshToken}`);
      if (isBlacklisted) {
        throw new UnauthorizedError('Token has been revoked');
      }

      // Check if token exists in Redis
      const storedToken = await cacheService.get<string>(`refresh-token:${decoded.id}`);
      if (storedToken !== refreshToken) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(decoded.id, decoded.email, decoded.role);

      // Blacklist old refresh token
      await cacheService.set(`blacklist:${refreshToken}`, true, 7 * 24 * 3600);

      return tokens;
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  /**
   * Logout user
   */
  async logout(userId: string, refreshToken?: string) {
    // Remove refresh token from Redis
    await cacheService.del(`refresh-token:${userId}`);

    // Blacklist refresh token if provided
    if (refreshToken) {
      await cacheService.set(`blacklist:${refreshToken}`, true, 7 * 24 * 3600);
    }

    // Log logout
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'USER_LOGOUT',
        resourceType: 'USER',
        resourceId: userId,
      },
    });

    return { success: true };
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string) {
    const data = await cacheService.get<{ userId: string; email: string }>(
      `email-verification:${token}`
    );

    if (!data) {
      throw new NotFoundError('Invalid or expired verification token');
    }

    // Update user
    await prisma.user.update({
      where: { id: data.userId },
      data: { emailVerified: true },
    });

    // Delete token
    await cacheService.del(`email-verification:${token}`);

    return { success: true };
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return { success: true };
    }

    // Generate reset token
    const resetToken = generateRandomString(32);
    await cacheService.set(
      `password-reset:${resetToken}`,
      { userId: user.id, email: user.email },
      3600 // 1 hour
    );

    // Send password reset email
    const resetLink = `${config.frontend.url}/reset-password?token=${resetToken}`;
    await emailService.sendPasswordReset(user.email, {
      firstName: user.profile?.firstName || '',
      resetLink,
      expiresIn: '1 heure',
    });

    return { success: true };
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string) {
    const data = await cacheService.get<{ userId: string; email: string }>(
      `password-reset:${token}`
    );

    if (!data) {
      throw new NotFoundError('Invalid or expired reset token');
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update user password
    await prisma.user.update({
      where: { id: data.userId },
      data: { passwordHash },
    });

    // Delete reset token
    await cacheService.del(`password-reset:${token}`);

    // Invalidate all refresh tokens
    await cacheService.del(`refresh-token:${data.userId}`);

    // Log password change
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: 'PASSWORD_RESET',
        resourceType: 'USER',
        resourceId: data.userId,
      },
    });

    return { success: true };
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(id: string, email: string, role: string) {
    const payload = { id, email, role };

    // Generate access token
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.accessTokenExpiry,
    });

    // Generate refresh token
    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshTokenExpiry,
    });

    // Store refresh token in Redis
    await cacheService.set(`refresh-token:${id}`, refreshToken, 7 * 24 * 3600); // 7 days

    return { accessToken, refreshToken };
  }

  /**
   * Get current user info
   */
  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        frenchAddresses: {
          where: { isActive: true },
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
    };
  }
}
