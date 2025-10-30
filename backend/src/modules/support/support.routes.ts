import { FastifyInstance } from 'fastify';
import { SupportService } from './support.service.js';
import {
  createTicketSchema,
  updateTicketSchema,
  addMessageSchema,
  listTicketsQuerySchema,
  listAdminTicketsQuerySchema,
  ticketIdParamSchema,
  closeTicketSchema,
} from './support.schemas.js';
import { validateBody, validateQuery, validateParams } from '@common/middleware/validation.middleware.js';
import { authenticate, requireRole, AuthenticatedRequest } from '@common/middleware/auth.middleware.js';
import { UserRole } from '@prisma/client';

const supportService = new SupportService();

export async function supportRoutes(app: FastifyInstance) {
  /**
   * Create a new ticket
   */
  app.post(
    '/',
    {
      schema: {
        tags: ['support'],
        summary: 'Create a new support ticket',
        description: 'Create a new support ticket with an initial message',
        security: [{ Bearer: [] }],
        body: {
          type: 'object',
          required: ['subject', 'message'],
          properties: {
            subject: { type: 'string', minLength: 5, maxLength: 200 },
            message: { type: 'string', minLength: 10, maxLength: 5000 },
            priority: { type: 'string', enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'], default: 'NORMAL' },
            packageId: { type: 'string', format: 'uuid' },
            quoteId: { type: 'string', format: 'uuid' },
            paymentId: { type: 'string', format: 'uuid' },
          },
        },
      },
      preHandler: [authenticate, validateBody(createTicketSchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const data = createTicketSchema.parse(request.body);
      const ticket = await supportService.createTicket(request.user!.id, data);
      return reply.status(201).send(ticket);
    }
  );

  /**
   * Get user's tickets
   */
  app.get(
    '/my-tickets',
    {
      schema: {
        tags: ['support'],
        summary: 'Get my tickets',
        description: 'Get paginated list of current user\'s support tickets',
        security: [{ Bearer: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', minimum: 1, default: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
            status: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED'] },
            priority: { type: 'string', enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'] },
            search: { type: 'string' },
            sortBy: { type: 'string', enum: ['createdAt', 'updatedAt', 'priority'], default: 'createdAt' },
            sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          },
        },
      },
      preHandler: [authenticate, validateQuery(listTicketsQuerySchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const query = listTicketsQuerySchema.parse(request.query);
      const result = await supportService.getUserTickets(request.user!.id, query);
      return reply.send(result);
    }
  );

  /**
   * Get ticket details
   */
  app.get(
    '/:ticketId',
    {
      schema: {
        tags: ['support'],
        summary: 'Get ticket details',
        description: 'Get complete ticket information including full conversation history',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          required: ['ticketId'],
          properties: {
            ticketId: { type: 'string', format: 'uuid' },
          },
        },
      },
      preHandler: [authenticate, validateParams(ticketIdParamSchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const { ticketId } = ticketIdParamSchema.parse(request.params);
      const ticket = await supportService.getTicketDetails(request.user!.id, ticketId, request.user!.role);
      return reply.send(ticket);
    }
  );

  /**
   * Add message to ticket
   */
  app.post(
    '/:ticketId/messages',
    {
      schema: {
        tags: ['support'],
        summary: 'Add message to ticket',
        description: 'Add a new message to an existing ticket',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          required: ['ticketId'],
          properties: {
            ticketId: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          required: ['message'],
          properties: {
            message: { type: 'string', minLength: 1, maxLength: 5000 },
            attachments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: { type: 'string', format: 'uri' },
                  filename: { type: 'string' },
                  size: { type: 'number' },
                },
              },
            },
          },
        },
      },
      preHandler: [authenticate, validateParams(ticketIdParamSchema), validateBody(addMessageSchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const { ticketId } = ticketIdParamSchema.parse(request.params);
      const data = addMessageSchema.parse(request.body);
      const message = await supportService.addMessage(request.user!.id, ticketId, data, request.user!.role);
      return reply.status(201).send(message);
    }
  );

  /**
   * Upload attachment
   */
  app.post(
    '/attachments/upload',
    {
      schema: {
        tags: ['support'],
        summary: 'Upload attachment',
        description: 'Upload a file attachment for support tickets',
        security: [{ Bearer: [] }],
        consumes: ['multipart/form-data'],
      },
      preHandler: [authenticate],
    },
    async (request: AuthenticatedRequest, reply) => {
      const data = await request.file();

      if (!data) {
        return reply.status(400).send({ error: 'No file uploaded' });
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      const buffer = await data.toBuffer();

      if (buffer.length > maxSize) {
        return reply.status(400).send({ error: 'File size exceeds 10MB limit' });
      }

      // Validate file type (allow common document and image types)
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ];

      if (!allowedTypes.includes(data.mimetype)) {
        return reply.status(400).send({ error: 'File type not allowed' });
      }

      const attachment = await supportService.uploadAttachment(buffer, data.filename, data.mimetype);

      return reply.send(attachment);
    }
  );

  /**
   * Reopen ticket
   */
  app.post(
    '/:ticketId/reopen',
    {
      schema: {
        tags: ['support'],
        summary: 'Reopen ticket',
        description: 'Reopen a closed or resolved ticket',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          required: ['ticketId'],
          properties: {
            ticketId: { type: 'string', format: 'uuid' },
          },
        },
      },
      preHandler: [authenticate, validateParams(ticketIdParamSchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const { ticketId } = ticketIdParamSchema.parse(request.params);
      const ticket = await supportService.reopenTicket(request.user!.id, ticketId);
      return reply.send(ticket);
    }
  );

  // ============================================
  // ADMIN ROUTES
  // ============================================

  /**
   * List all tickets (admin)
   */
  app.get(
    '/admin/tickets',
    {
      schema: {
        tags: ['support'],
        summary: 'List all tickets (Admin)',
        description: 'Get paginated list of all support tickets (admin only)',
        security: [{ Bearer: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', minimum: 1, default: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
            status: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED'] },
            priority: { type: 'string', enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'] },
            userId: { type: 'string', format: 'uuid' },
            search: { type: 'string' },
            sortBy: { type: 'string', enum: ['createdAt', 'updatedAt', 'priority'], default: 'createdAt' },
            sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          },
        },
      },
      preHandler: [authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), validateQuery(listAdminTicketsQuerySchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const query = listAdminTicketsQuerySchema.parse(request.query);
      const result = await supportService.listAllTickets(query);
      return reply.send(result);
    }
  );

  /**
   * Update ticket (admin)
   */
  app.put(
    '/admin/tickets/:ticketId',
    {
      schema: {
        tags: ['support'],
        summary: 'Update ticket (Admin)',
        description: 'Update ticket status or priority (admin only)',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          required: ['ticketId'],
          properties: {
            ticketId: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED'] },
            priority: { type: 'string', enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'] },
          },
        },
      },
      preHandler: [
        authenticate,
        requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
        validateParams(ticketIdParamSchema),
        validateBody(updateTicketSchema),
      ],
    },
    async (request: AuthenticatedRequest, reply) => {
      const { ticketId } = ticketIdParamSchema.parse(request.params);
      const data = updateTicketSchema.parse(request.body);
      const ticket = await supportService.updateTicket(request.user!.id, ticketId, data);
      return reply.send(ticket);
    }
  );

  /**
   * Close ticket with resolution (admin)
   */
  app.post(
    '/admin/tickets/:ticketId/close',
    {
      schema: {
        tags: ['support'],
        summary: 'Close ticket (Admin)',
        description: 'Close a ticket with a resolution note (admin only)',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          required: ['ticketId'],
          properties: {
            ticketId: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          required: ['resolutionNote'],
          properties: {
            resolutionNote: { type: 'string', minLength: 10, maxLength: 1000 },
          },
        },
      },
      preHandler: [
        authenticate,
        requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
        validateParams(ticketIdParamSchema),
        validateBody(closeTicketSchema),
      ],
    },
    async (request: AuthenticatedRequest, reply) => {
      const { ticketId } = ticketIdParamSchema.parse(request.params);
      const data = closeTicketSchema.parse(request.body);
      const ticket = await supportService.closeTicket(request.user!.id, ticketId, data);
      return reply.send(ticket);
    }
  );

  /**
   * Get ticket statistics (admin)
   */
  app.get(
    '/admin/stats',
    {
      schema: {
        tags: ['support'],
        summary: 'Get ticket statistics (Admin)',
        description: 'Get support ticket statistics (admin only)',
        security: [{ Bearer: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              total: { type: 'number' },
              byStatus: { type: 'array', items: { type: 'object' } },
              byPriority: { type: 'array', items: { type: 'object' } },
              recentTickets: { type: 'array', items: { type: 'object' } },
            },
          },
        },
      },
      preHandler: [authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const stats = await supportService.getTicketStats();
      return reply.send(stats);
    }
  );
}
