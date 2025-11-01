import { FastifyInstance } from 'fastify';
import { PackagesService } from './packages.service.js';
import {
  createPackageSchema,
  updatePackageSchema,
  listPackagesQuerySchema,
  packageIdParamSchema,
  updateTrackingSchema,
  photoCaptionSchema,
} from './packages.schemas.js';
import { validateBody, validateQuery, validateParams } from '@common/middleware/validation.middleware.js';
import { authenticate, AuthenticatedRequest } from '@common/middleware/auth.middleware.js';

const packagesService = new PackagesService();

export async function packagesRoutes(app: FastifyInstance) {
  /**
   * Create new package
   */
  app.post(
    '/',
    {
      schema: {
        tags: ['packages'],
        summary: 'Create new package',
        security: [{ Bearer: [] }],
        body: {
          type: 'object',
          properties: {
            trackingNumber: { type: 'string' },
            description: { type: 'string' },
            weight: { type: 'number' },
            dimensions: {
              type: 'object',
              properties: {
                length: { type: 'number' },
                width: { type: 'number' },
                height: { type: 'number' },
              },
            },
          },
        },
      },
      preHandler: [authenticate, validateBody(createPackageSchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const data = createPackageSchema.parse(request.body);
      const pkg = await packagesService.createPackage(request.user!.id, data);
      return reply.code(201).send(pkg);
    }
  );

  /**
   * List packages with pagination and filters
   */
  app.get(
    '/',
    {
      schema: {
        tags: ['packages'],
        summary: 'List user packages',
        security: [{ Bearer: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', minimum: 1, default: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
            status: { type: 'string', enum: ['ANNOUNCED', 'IN_TRANSIT', 'RECEIVED', 'STORED', 'QUOTE_REQUESTED', 'QUOTE_READY', 'PAID', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'] },
            search: { type: 'string' },
            sortBy: { type: 'string', enum: ['createdAt', 'receivedAt', 'weight'], default: 'createdAt' },
            sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          },
        },
      },
      preHandler: [authenticate, validateQuery(listPackagesQuerySchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const query = listPackagesQuerySchema.parse(request.query);
      const result = await packagesService.listPackages(request.user!.id, query);
      return reply.send(result);
    }
  );

  /**
   * Get package by ID
   */
  app.get(
    '/:packageId',
    {
      schema: {
        tags: ['packages'],
        summary: 'Get package by ID',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          required: ['packageId'],
          properties: {
            packageId: { type: 'string', format: 'uuid' },
          },
        },
      },
      preHandler: [authenticate, validateParams(packageIdParamSchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const { packageId } = packageIdParamSchema.parse(request.params);
      const pkg = await packagesService.getPackage(request.user!.id, packageId);
      return reply.send(pkg);
    }
  );

  /**
   * Update package
   */
  app.put(
    '/:packageId',
    {
      schema: {
        tags: ['packages'],
        summary: 'Update package',
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
          properties: {
            trackingNumber: { type: 'string' },
            description: { type: 'string' },
            weight: { type: 'number' },
            dimensions: {
              type: 'object',
              properties: {
                length: { type: 'number' },
                width: { type: 'number' },
                height: { type: 'number' },
              },
            },
            status: { type: 'string' },
          },
        },
      },
      preHandler: [authenticate, validateParams(packageIdParamSchema), validateBody(updatePackageSchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const { packageId } = packageIdParamSchema.parse(request.params);
      const data = updatePackageSchema.parse(request.body);
      const pkg = await packagesService.updatePackage(request.user!.id, packageId, data);
      return reply.send(pkg);
    }
  );

  /**
   * Delete package
   */
  app.delete(
    '/:packageId',
    {
      schema: {
        tags: ['packages'],
        summary: 'Delete package',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          required: ['packageId'],
          properties: {
            packageId: { type: 'string', format: 'uuid' },
          },
        },
      },
      preHandler: [authenticate, validateParams(packageIdParamSchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const { packageId } = packageIdParamSchema.parse(request.params);
      const result = await packagesService.deletePackage(request.user!.id, packageId);
      return reply.send(result);
    }
  );

  /**
   * Upload photos to package
   */
  app.post(
    '/:packageId/photos',
    {
      schema: {
        tags: ['packages'],
        summary: 'Upload photos to package',
        security: [{ Bearer: [] }],
        consumes: ['multipart/form-data'],
        params: {
          type: 'object',
          required: ['packageId'],
          properties: {
            packageId: { type: 'string', format: 'uuid' },
          },
        },
      },
      preHandler: [authenticate, validateParams(packageIdParamSchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const { packageId } = packageIdParamSchema.parse(request.params);

      // Get all uploaded files
      const files = await request.files();
      const uploadFiles: Array<{ buffer: Buffer; filename: string; mimetype: string }> = [];
      const captions: string[] = [];

      for await (const file of files) {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
          return reply.code(400).send({ error: 'Only JPEG, PNG and WebP images are allowed' });
        }

        // Validate file size (max 10MB)
        const buffer = await file.toBuffer();
        if (buffer.length > 10 * 1024 * 1024) {
          return reply.code(400).send({ error: 'File size must be less than 10MB' });
        }

        uploadFiles.push({
          buffer,
          filename: file.filename,
          mimetype: file.mimetype,
        });

        // Get caption if provided
        if ((file.fields as any).caption?.value) {
          captions.push((file.fields as any).caption.value);
        }
      }

      if (uploadFiles.length === 0) {
        return reply.code(400).send({ error: 'No files provided' });
      }

      const photos = await packagesService.uploadPhotos(
        request.user!.id,
        packageId,
        uploadFiles,
        captions
      );

      return reply.send({ photos });
    }
  );

  /**
   * Delete photo from package
   */
  app.delete(
    '/:packageId/photos/:photoUrl',
    {
      schema: {
        tags: ['packages'],
        summary: 'Delete photo from package',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          required: ['packageId', 'photoUrl'],
          properties: {
            packageId: { type: 'string', format: 'uuid' },
            photoUrl: { type: 'string' },
          },
        },
      },
      preHandler: authenticate,
    },
    async (request: AuthenticatedRequest, reply) => {
      const { packageId, photoUrl } = request.params as { packageId: string; photoUrl: string };
      const result = await packagesService.deletePhoto(
        request.user!.id,
        packageId,
        decodeURIComponent(photoUrl)
      );
      return reply.send(result);
    }
  );

  /**
   * Update tracking number
   */
  app.post(
    '/:packageId/tracking',
    {
      schema: {
        tags: ['packages'],
        summary: 'Update tracking number and fetch tracking info',
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
          required: ['trackingNumber'],
          properties: {
            trackingNumber: { type: 'string' },
          },
        },
      },
      preHandler: [authenticate, validateParams(packageIdParamSchema), validateBody(updateTrackingSchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const { packageId } = packageIdParamSchema.parse(request.params);
      const data = updateTrackingSchema.parse(request.body);
      const result = await packagesService.updateTracking(request.user!.id, packageId, data);
      return reply.send(result);
    }
  );

  /**
   * Get tracking events
   */
  app.get(
    '/:packageId/tracking',
    {
      schema: {
        tags: ['packages'],
        summary: 'Get package tracking events',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          required: ['packageId'],
          properties: {
            packageId: { type: 'string', format: 'uuid' },
          },
        },
      },
      preHandler: [authenticate, validateParams(packageIdParamSchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const { packageId } = packageIdParamSchema.parse(request.params);
      const events = await packagesService.getTracking(request.user!.id, packageId);
      return reply.send(events);
    }
  );

  /**
   * Sync tracking from 17Track
   */
  app.post(
    '/:packageId/tracking/sync',
    {
      schema: {
        tags: ['packages'],
        summary: 'Sync tracking events from 17Track',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          required: ['packageId'],
          properties: {
            packageId: { type: 'string', format: 'uuid' },
          },
        },
      },
      preHandler: [authenticate, validateParams(packageIdParamSchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const { packageId } = packageIdParamSchema.parse(request.params);
      const result = await packagesService.syncTrackingFrom17Track(request.user!.id, packageId);
      return reply.send(result);
    }
  );
}
