import { prisma } from '@common/database/prisma.client.js';
import { paginate, paginationMeta } from '@common/utils/helpers.js';
import { NotFoundError, ForbiddenError } from '@common/errors/custom-errors.js';
import type {
  ListUsersQuery,
  UpdateUserRoleInput,
  UpdateKycStatusInput,
  ListPackagesAdminQuery,
  UpdatePackageStatusInput,
  ListQuotesAdminQuery,
  ListPaymentsAdminQuery,
  ListAuditLogsQuery,
} from './admin.schemas.js';
import emailService from '@services/email.service.js';
import { config } from '@config/index.js';

export class AdminService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      totalPackages,
      pendingPackages,
      totalQuotes,
      pendingQuotes,
      totalRevenue,
      monthlyRevenue,
      recentActivity,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Active users (logged in last 30 days)
      prisma.user.count({
        where: {
          auditLogs: {
            some: {
              action: 'USER_LOGIN',
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          },
        },
      }),

      // Total packages
      prisma.package.count(),

      // Pending packages
      prisma.package.count({
        where: {
          status: { in: ['ANNOUNCED', 'IN_TRANSIT', 'QUOTE_REQUESTED'] },
        },
      }),

      // Total quotes
      prisma.quote.count(),

      // Pending quotes
      prisma.quote.count({
        where: { status: 'PENDING' },
      }),

      // Total revenue
      prisma.payment.aggregate({
        where: { status: 'SUCCEEDED' },
        _sum: { amount: true },
      }),

      // Monthly revenue (last 30 days)
      prisma.payment.aggregate({
        where: {
          status: 'SUCCEEDED',
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        _sum: { amount: true },
      }),

      // Recent activity (last 20 audit logs)
      prisma.auditLog.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
      },
      packages: {
        total: totalPackages,
        pending: pendingPackages,
      },
      quotes: {
        total: totalQuotes,
        pending: pendingQuotes,
      },
      revenue: {
        total: totalRevenue._sum.amount || 0,
        monthly: monthlyRevenue._sum.amount || 0,
      },
      recentActivity,
    };
  }

  /**
   * List all users
   */
  async listUsers(query: ListUsersQuery) {
    const { page, limit, role, emailVerified, search, sortBy, sortOrder } = query;

    // Build where clause
    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (emailVerified !== undefined) {
      where.emailVerified = emailVerified;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        {
          profile: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    // Count total
    const total = await prisma.user.count({ where });

    // Get users
    const users = await prisma.user.findMany({
      where,
      ...paginate(page, limit),
      orderBy: { [sortBy]: sortOrder },
      include: {
        profile: true,
        _count: {
          select: {
            packages: true,
            quotes: true,
            payments: true,
          },
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
        _count: true,
      },
    });

    return {
      data: users,
      meta: paginationMeta(total, page, limit),
    };
  }

  /**
   * Get user details
   */
  async getUserDetails(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        frenchAddresses: true,
        packages: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        quotes: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        auditLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  /**
   * Update user role
   */
  async updateUserRole(adminId: string, userId: string, data: UpdateUserRoleInput) {
    // Prevent updating own role
    if (adminId === userId) {
      throw new ForbiddenError('Cannot change your own role');
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: data.role },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'USER_ROLE_UPDATED',
        resourceType: 'USER',
        resourceId: userId,
        metadata: { newRole: data.role },
      },
    });

    return user;
  }

  /**
   * Update KYC status
   */
  async updateKycStatus(adminId: string, userId: string, data: UpdateKycStatusInput) {
    const profile = await prisma.profile.update({
      where: { id: userId },
      data: { kycStatus: data.kycStatus },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'KYC_STATUS_UPDATED',
        resourceType: 'PROFILE',
        resourceId: userId,
        metadata: {
          newStatus: data.kycStatus,
          notes: data.notes,
        },
      },
    });

    return profile;
  }

  /**
   * List all packages (admin view)
   */
  async listPackages(query: ListPackagesAdminQuery) {
    const { page, limit, status, userId, search, sortBy, sortOrder } = query;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
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
        user: {
          select: {
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        quote: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
          },
        },
      },
    });

    return {
      data: packages,
      meta: paginationMeta(total, page, limit),
    };
  }

  /**
   * Update package status
   */
  async updatePackageStatus(adminId: string, packageId: string, data: UpdatePackageStatusInput) {
    // Get package with user info before update
    const oldPkg = await prisma.package.findUnique({
      where: { id: packageId },
      include: {
        user: {
          include: {
            profile: true,
            emailPreference: true,
          },
        },
      },
    });

    if (!oldPkg) {
      throw new NotFoundError('Package not found');
    }

    const oldStatus = oldPkg.status;

    // Update package status
    const pkg = await prisma.package.update({
      where: { id: packageId },
      data: {
        status: data.status,
        // Set receivedAt timestamp if status is RECEIVED and not already set
        ...(data.status === 'RECEIVED' && !oldPkg.receivedAt ? { receivedAt: new Date() } : {}),
      },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'PACKAGE_STATUS_UPDATED',
        resourceType: 'PACKAGE',
        resourceId: packageId,
        metadata: {
          oldStatus,
          newStatus: data.status,
          notes: data.notes,
        },
      },
    });

    // Send email notifications based on status change
    const user = oldPkg.user;
    const emailPrefs = user.emailPreference;
    const trackingLink = `${config.frontend.url}/packages/${packageId}`;

    // Send email notification based on new status
    if (data.status === 'RECEIVED' && emailPrefs?.packageReceived) {
      await emailService.sendPackageReceivedEmail(user.email, {
        firstName: user.profile?.firstName || '',
        trackingNumber: pkg.trackingNumber || '',
        status: 'Reçu à notre entrepôt',
        description: pkg.description || 'Votre colis',
        trackingLink,
      });
    } else if (data.status === 'SHIPPED' && emailPrefs?.packageShipped) {
      await emailService.sendPackageShippedEmail(user.email, {
        firstName: user.profile?.firstName || '',
        trackingNumber: pkg.trackingNumber || '',
        status: 'Expédié',
        description: pkg.description || 'Votre colis',
        trackingLink,
      });
    } else if (data.status === 'DELIVERED' && emailPrefs?.packageDelivered) {
      await emailService.sendPackageDeliveredEmail(user.email, {
        firstName: user.profile?.firstName || '',
        trackingNumber: pkg.trackingNumber || '',
        status: 'Livré',
        description: pkg.description || 'Votre colis',
        trackingLink,
      });
    }

    return pkg;
  }

  /**
   * List all quotes (admin view)
   */
  async listQuotes(query: ListQuotesAdminQuery) {
    const { page, limit, status, userId, sortBy, sortOrder } = query;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    // Count total
    const total = await prisma.quote.count({ where });

    // Get quotes
    const quotes = await prisma.quote.findMany({
      where,
      ...paginate(page, limit),
      orderBy: { [sortBy]: sortOrder },
      include: {
        user: {
          select: {
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        packages: {
          select: {
            id: true,
            trackingNumber: true,
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
   * List all payments (admin view)
   */
  async listPayments(query: ListPaymentsAdminQuery) {
    const { page, limit, status, userId, sortBy, sortOrder } = query;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    // Count total
    const total = await prisma.payment.count({ where });

    // Get payments
    const payments = await prisma.payment.findMany({
      where,
      ...paginate(page, limit),
      orderBy: { [sortBy]: sortOrder },
      include: {
        user: {
          select: {
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
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
   * Get audit logs
   */
  async getAuditLogs(query: ListAuditLogsQuery) {
    const { page, limit, userId, action, resourceType, sortOrder } = query;

    // Build where clause
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = { contains: action, mode: 'insensitive' };
    }

    if (resourceType) {
      where.resourceType = resourceType;
    }

    // Count total
    const total = await prisma.auditLog.count({ where });

    // Get logs
    const logs = await prisma.auditLog.findMany({
      where,
      ...paginate(page, limit),
      orderBy: { createdAt: sortOrder },
      include: {
        user: {
          select: {
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return {
      data: logs,
      meta: paginationMeta(total, page, limit),
    };
  }

  /**
   * Get system statistics
   */
  async getSystemStats() {
    const [
      usersByRole,
      packagesByStatus,
      quotesByStatus,
      paymentsByStatus,
      revenueByMonth,
    ] = await Promise.all([
      // Users by role
      prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),

      // Packages by status
      prisma.package.groupBy({
        by: ['status'],
        _count: true,
      }),

      // Quotes by status
      prisma.quote.groupBy({
        by: ['status'],
        _count: true,
      }),

      // Payments by status
      prisma.payment.groupBy({
        by: ['status'],
        _count: true,
        _sum: {
          amount: true,
        },
      }),

      // Revenue by month (last 12 months)
      this.getRevenueByMonth(),
    ]);

    return {
      usersByRole,
      packagesByStatus,
      quotesByStatus,
      paymentsByStatus,
      revenueByMonth,
    };
  }

  /**
   * Get revenue by month (last 12 months)
   */
  private async getRevenueByMonth() {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const payments = await prisma.payment.findMany({
      where: {
        status: 'SUCCEEDED',
        createdAt: {
          gte: twelveMonthsAgo,
        },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    });

    // Group by month
    const revenueByMonth: Record<string, number> = {};

    payments.forEach((payment) => {
      const month = payment.createdAt.toISOString().slice(0, 7); // YYYY-MM
      revenueByMonth[month] = (revenueByMonth[month] || 0) + Number(payment.amount);
    });

    return Object.entries(revenueByMonth).map(([month, revenue]) => ({
      month,
      revenue,
    }));
  }
}
