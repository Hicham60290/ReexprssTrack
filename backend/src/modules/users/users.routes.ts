import { FastifyInstance } from 'fastify';
import { UsersService } from './users.service.js';
import {
  updateProfileSchema,
  createFrenchAddressSchema,
  updateFrenchAddressSchema,
  changePasswordSchema,
  addressIdParamSchema,
} from './users.schemas.js';
import { validateBody, validateParams } from '@common/middleware/validation.middleware.js';
import { authenticate, AuthenticatedRequest } from '@common/middleware/auth.middleware.js';
import emailPreferencesRoutes from './users.email-preferences.routes.js';

const usersService = new UsersService();

export async function usersRoutes(app: FastifyInstance) {
  // Register email preferences routes
  await app.register(emailPreferencesRoutes);
  /**
   * Get current user profile
   */
  app.get(
    '/me',
    {
      schema: {
        tags: ['users'],
        summary: 'Get current user profile',
        security: [{ Bearer: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              role: { type: 'string' },
              emailVerified: { type: 'boolean' },
              profile: { type: 'object' },
              frenchAddresses: { type: 'array' },
            },
          },
        },
      },
      preHandler: authenticate,
    },
    async (request: AuthenticatedRequest, reply) => {
      const profile = await usersService.getProfile(request.user!.id);
      return reply.send(profile);
    }
  );

  /**
   * Update user profile
   */
  app.put(
    '/me',
    {
      schema: {
        tags: ['users'],
        summary: 'Update user profile',
        security: [{ Bearer: [] }],
        body: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string' },
            company: { type: 'string' },
            address: { type: 'string' },
            postalCode: { type: 'string' },
            city: { type: 'string' },
            territory: { type: 'string' },
            language: { type: 'string', enum: ['fr', 'en'] },
            timezone: { type: 'string' },
            currency: { type: 'string', enum: ['EUR', 'USD'] },
            acceptMarketing: { type: 'boolean' },
          },
        },
      },
      preHandler: [authenticate, validateBody(updateProfileSchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const data = updateProfileSchema.parse(request.body);
      const profile = await usersService.updateProfile(request.user!.id, data);
      return reply.send(profile);
    }
  );

  /**
   * Upload avatar
   */
  app.post(
    '/me/avatar',
    {
      schema: {
        tags: ['users'],
        summary: 'Upload user avatar',
        security: [{ Bearer: [] }],
        consumes: ['multipart/form-data'],
      },
      preHandler: authenticate,
    },
    async (request: AuthenticatedRequest, reply) => {
      const data = await request.file();

      if (!data) {
        return reply.code(400).send({ error: 'No file provided' });
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(data.mimetype)) {
        return reply.code(400).send({ error: 'Only JPEG, PNG and WebP images are allowed' });
      }

      // Read file buffer
      const buffer = await data.toBuffer();

      // Upload avatar
      const result = await usersService.uploadAvatar(
        request.user!.id,
        buffer,
        data.filename,
        data.mimetype
      );

      return reply.send(result);
    }
  );

  /**
   * Change password
   */
  app.post(
    '/me/password',
    {
      schema: {
        tags: ['users'],
        summary: 'Change user password',
        security: [{ Bearer: [] }],
        body: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: { type: 'string' },
            newPassword: { type: 'string', minLength: 8 },
          },
        },
      },
      preHandler: [authenticate, validateBody(changePasswordSchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const data = changePasswordSchema.parse(request.body);
      const result = await usersService.changePassword(request.user!.id, data);
      return reply.send(result);
    }
  );

  /**
   * Get user statistics
   */
  app.get(
    '/me/stats',
    {
      schema: {
        tags: ['users'],
        summary: 'Get user statistics',
        security: [{ Bearer: [] }],
      },
      preHandler: authenticate,
    },
    async (request: AuthenticatedRequest, reply) => {
      const stats = await usersService.getUserStats(request.user!.id);
      return reply.send(stats);
    }
  );

  // ============================================
  // FRENCH ADDRESSES
  // ============================================

  /**
   * Get all French addresses
   */
  app.get(
    '/me/french-addresses',
    {
      schema: {
        tags: ['users'],
        summary: 'Get all French addresses',
        security: [{ Bearer: [] }],
      },
      preHandler: authenticate,
    },
    async (request: AuthenticatedRequest, reply) => {
      const addresses = await usersService.getFrenchAddresses(request.user!.id);
      return reply.send(addresses);
    }
  );

  /**
   * Get single French address
   */
  app.get(
    '/me/french-addresses/:addressId',
    {
      schema: {
        tags: ['users'],
        summary: 'Get single French address',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          required: ['addressId'],
          properties: {
            addressId: { type: 'string', format: 'uuid' },
          },
        },
      },
      preHandler: [authenticate, validateParams(addressIdParamSchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const { addressId } = addressIdParamSchema.parse(request.params);
      const address = await usersService.getFrenchAddress(request.user!.id, addressId);
      return reply.send(address);
    }
  );

  /**
   * Create French address
   */
  app.post(
    '/me/french-addresses',
    {
      schema: {
        tags: ['users'],
        summary: 'Create new French address',
        security: [{ Bearer: [] }],
        body: {
          type: 'object',
          required: ['addressLine1', 'postalCode', 'city'],
          properties: {
            addressLine1: { type: 'string' },
            addressLine2: { type: 'string' },
            postalCode: { type: 'string', pattern: '^\\d{5}$' },
            city: { type: 'string' },
          },
        },
      },
      preHandler: [authenticate, validateBody(createFrenchAddressSchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const data = createFrenchAddressSchema.parse(request.body);
      const address = await usersService.createFrenchAddress(request.user!.id, data);
      return reply.code(201).send(address);
    }
  );

  /**
   * Update French address
   */
  app.put(
    '/me/french-addresses/:addressId',
    {
      schema: {
        tags: ['users'],
        summary: 'Update French address',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          required: ['addressId'],
          properties: {
            addressId: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          properties: {
            addressLine1: { type: 'string' },
            addressLine2: { type: 'string' },
            postalCode: { type: 'string', pattern: '^\\d{5}$' },
            city: { type: 'string' },
            isActive: { type: 'boolean' },
          },
        },
      },
      preHandler: [
        authenticate,
        validateParams(addressIdParamSchema),
        validateBody(updateFrenchAddressSchema),
      ],
    },
    async (request: AuthenticatedRequest, reply) => {
      const { addressId } = addressIdParamSchema.parse(request.params);
      const data = updateFrenchAddressSchema.parse(request.body);
      const address = await usersService.updateFrenchAddress(request.user!.id, addressId, data);
      return reply.send(address);
    }
  );

  /**
   * Delete French address
   */
  app.delete(
    '/me/french-addresses/:addressId',
    {
      schema: {
        tags: ['users'],
        summary: 'Delete French address',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          required: ['addressId'],
          properties: {
            addressId: { type: 'string', format: 'uuid' },
          },
        },
      },
      preHandler: [authenticate, validateParams(addressIdParamSchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const { addressId } = addressIdParamSchema.parse(request.params);
      const result = await usersService.deleteFrenchAddress(request.user!.id, addressId);
      return reply.send(result);
    }
  );

  /**
   * Set active French address
   */
  app.post(
    '/me/french-addresses/:addressId/activate',
    {
      schema: {
        tags: ['users'],
        summary: 'Set active French address',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          required: ['addressId'],
          properties: {
            addressId: { type: 'string', format: 'uuid' },
          },
        },
      },
      preHandler: [authenticate, validateParams(addressIdParamSchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const { addressId } = addressIdParamSchema.parse(request.params);
      const result = await usersService.setActiveFrenchAddress(request.user!.id, addressId);
      return reply.send(result);
    }
  );
}
