import { FastifyInstance } from 'fastify';
import { AdminService } from './admin.service.js';
import {
  listUsersQuerySchema,
  updateUserRoleSchema,
  updateKycStatusSchema,
  listPackagesAdminQuerySchema,
  updatePackageStatusSchema,
  listQuotesAdminQuerySchema,
  listPaymentsAdminQuerySchema,
  listAuditLogsQuerySchema,
  userIdParamSchema,
  packageIdParamSchema,
} from './admin.schemas.js';
import { validateBody, validateQuery, validateParams } from '@common/middleware/validation.middleware.js';
import { authenticate, requireRole, AuthenticatedRequest } from '@common/middleware/auth.middleware.js';
import { UserRole } from '@prisma/client';

const adminService = new AdminService();

export async function adminRoutes(app: FastifyInstance) {
  /**
   * Get dashboard statistics
   */
  app.get(
    '/dashboard',
    {
      schema: {
        tags: ['admin'],
        summary: 'Get admin dashboard statistics',
        description: 'Get overview statistics for the admin dashboard including users, packages, quotes, revenue, and recent activity',
        security: [{ Bearer: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              users: {
                type: 'object',
                properties: {
                  total: { type: 'number' },
                  active: { type: 'number' },
                },
              },
              packages: {
                type: 'object',
                properties: {
                  total: { type: 'number' },
                  pending: { type: 'number' },
                },
              },
              quotes: {
                type: 'object',
                properties: {
                  total: { type: 'number' },
                  pending: { type: 'number' },
                },
              },
              revenue: {
                type: 'object',
                properties: {
                  total: { type: 'number' },
                  monthly: { type: 'number' },
                },
              },
              recentActivity: {
                type: 'array',
                items: { type: 'object' },
              },
            },
          },
        },
      },
      preHandler: [authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const stats = await adminService.getDashboardStats();
      return reply.send(stats);
    }
  );

  /**
   * List all users
   */
  app.get(
    '/users',
    {
      schema: {
        tags: ['admin'],
        summary: 'List all users',
        description: 'Get paginated list of all users with optional filters',
        security: [{ Bearer: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', minimum: 1, default: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
            role: { type: 'string', enum: ['USER', 'ADMIN', 'SUPER_ADMIN'] },
            emailVerified: { type: 'boolean' },
            search: { type: 'string' },
            sortBy: { type: 'string', enum: ['createdAt', 'email'], default: 'createdAt' },
            sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          },
        },
      },
      preHandler: [authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), validateQuery(listUsersQuerySchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const query = listUsersQuerySchema.parse(request.query);
      const result = await adminService.listUsers(query);
      return reply.send(result);
    }
  );

  /**
   * Get user details
   */
  app.get(
    '/users/:userId',
    {
      schema: {
        tags: ['admin'],
        summary: 'Get user details',
        description: 'Get complete user information including profile, addresses, packages, quotes, payments, and audit logs',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: { type: 'string', format: 'uuid' },
          },
        },
      },
      preHandler: [authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), validateParams(userIdParamSchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const { userId } = userIdParamSchema.parse(request.params);
      const user = await adminService.getUserDetails(userId);
      return reply.send(user);
    }
  );

  /**
   * Update user role
   */
  app.put(
    '/users/:userId/role',
    {
      schema: {
        tags: ['admin'],
        summary: 'Update user role',
        description: 'Change a user\'s role. Admins cannot change their own role.',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          required: ['role'],
          properties: {
            role: { type: 'string', enum: ['USER', 'ADMIN', 'SUPER_ADMIN'] },
          },
        },
      },
      preHandler: [
        authenticate,
        requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
        validateParams(userIdParamSchema),
        validateBody(updateUserRoleSchema),
      ],
    },
    async (request: AuthenticatedRequest, reply) => {
      const { userId } = userIdParamSchema.parse(request.params);
      const data = updateUserRoleSchema.parse(request.body);
      const user = await adminService.updateUserRole(request.user!.id, userId, data);
      return reply.send(user);
    }
  );

  /**
   * Update KYC status
   */
  app.put(
    '/users/:userId/kyc',
    {
      schema: {
        tags: ['admin'],
        summary: 'Update user KYC status',
        description: 'Update the KYC verification status for a user',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          required: ['kycStatus'],
          properties: {
            kycStatus: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
            notes: { type: 'string' },
          },
        },
      },
      preHandler: [
        authenticate,
        requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
        validateParams(userIdParamSchema),
        validateBody(updateKycStatusSchema),
      ],
    },
    async (request: AuthenticatedRequest, reply) => {
      const { userId } = userIdParamSchema.parse(request.params);
      const data = updateKycStatusSchema.parse(request.body);
      const profile = await adminService.updateKycStatus(request.user!.id, userId, data);
      return reply.send(profile);
    }
  );

  /**
   * List all packages (admin view)
   */
  app.get(
    '/packages',
    {
      schema: {
        tags: ['admin'],
        summary: 'List all packages',
        description: 'Get paginated list of all packages with optional filters',
        security: [{ Bearer: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', minimum: 1, default: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
            status: {
              type: 'string',
              enum: [
                'ANNOUNCED',
                'IN_TRANSIT',
                'RECEIVED',
                'STORED',
                'QUOTE_REQUESTED',
                'QUOTE_READY',
                'PAID',
                'PREPARING',
                'SHIPPED',
                'DELIVERED',
                'CANCELLED',
                'RETURNED',
              ],
            },
            userId: { type: 'string', format: 'uuid' },
            search: { type: 'string' },
            sortBy: { type: 'string', enum: ['createdAt', 'receivedAt', 'weight'], default: 'createdAt' },
            sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          },
        },
      },
      preHandler: [authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), validateQuery(listPackagesAdminQuerySchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const query = listPackagesAdminQuerySchema.parse(request.query);
      const result = await adminService.listPackages(query);
      return reply.send(result);
    }
  );

  /**
   * Update package status
   */
  app.put(
    '/packages/:packageId/status',
    {
      schema: {
        tags: ['admin'],
        summary: 'Update package status',
        description: 'Manually update the status of a package',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          required: ['packageId'],
          properties: {
            packageId: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: [
                'ANNOUNCED',
                'IN_TRANSIT',
                'RECEIVED',
                'STORED',
                'QUOTE_REQUESTED',
                'QUOTE_READY',
                'PAID',
                'PREPARING',
                'SHIPPED',
                'DELIVERED',
                'CANCELLED',
                'RETURNED',
              ],
            },
            notes: { type: 'string' },
          },
        },
      },
      preHandler: [
        authenticate,
        requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
        validateParams(packageIdParamSchema),
        validateBody(updatePackageStatusSchema),
      ],
    },
    async (request: AuthenticatedRequest, reply) => {
      const { packageId } = packageIdParamSchema.parse(request.params);
      const data = updatePackageStatusSchema.parse(request.body);
      const pkg = await adminService.updatePackageStatus(request.user!.id, packageId, data);
      return reply.send(pkg);
    }
  );

  /**
   * List all quotes (admin view)
   */
  app.get(
    '/quotes',
    {
      schema: {
        tags: ['admin'],
        summary: 'List all quotes',
        description: 'Get paginated list of all quotes with optional filters',
        security: [{ Bearer: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', minimum: 1, default: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
            status: { type: 'string', enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'PAID'] },
            userId: { type: 'string', format: 'uuid' },
            sortBy: { type: 'string', enum: ['createdAt', 'totalAmount'], default: 'createdAt' },
            sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          },
        },
      },
      preHandler: [authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), validateQuery(listQuotesAdminQuerySchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const query = listQuotesAdminQuerySchema.parse(request.query);
      const result = await adminService.listQuotes(query);
      return reply.send(result);
    }
  );

  /**
   * List all payments (admin view)
   */
  app.get(
    '/payments',
    {
      schema: {
        tags: ['admin'],
        summary: 'List all payments',
        description: 'Get paginated list of all payments with optional filters',
        security: [{ Bearer: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', minimum: 1, default: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
            status: { type: 'string', enum: ['PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'] },
            userId: { type: 'string', format: 'uuid' },
            sortBy: { type: 'string', enum: ['createdAt', 'amount'], default: 'createdAt' },
            sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          },
        },
      },
      preHandler: [authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), validateQuery(listPaymentsAdminQuerySchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const query = listPaymentsAdminQuerySchema.parse(request.query);
      const result = await adminService.listPayments(query);
      return reply.send(result);
    }
  );

  /**
   * Get audit logs
   */
  app.get(
    '/audit-logs',
    {
      schema: {
        tags: ['admin'],
        summary: 'Get audit logs',
        description: 'Get paginated audit logs with optional filters',
        security: [{ Bearer: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', minimum: 1, default: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
            userId: { type: 'string', format: 'uuid' },
            action: { type: 'string' },
            resourceType: { type: 'string' },
            sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          },
        },
      },
      preHandler: [authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), validateQuery(listAuditLogsQuerySchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const query = listAuditLogsQuerySchema.parse(request.query);
      const result = await adminService.getAuditLogs(query);
      return reply.send(result);
    }
  );

  /**
   * Get system statistics
   */
  app.get(
    '/stats',
    {
      schema: {
        tags: ['admin'],
        summary: 'Get system statistics',
        description: 'Get advanced system statistics including groupings by role, status, and revenue trends',
        security: [{ Bearer: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              usersByRole: { type: 'array', items: { type: 'object' } },
              packagesByStatus: { type: 'array', items: { type: 'object' } },
              quotesByStatus: { type: 'array', items: { type: 'object' } },
              paymentsByStatus: { type: 'array', items: { type: 'object' } },
              revenueByMonth: { type: 'array', items: { type: 'object' } },
            },
          },
        },
      },
      preHandler: [authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const stats = await adminService.getSystemStats();
      return reply.send(stats);
    }
  );
}
