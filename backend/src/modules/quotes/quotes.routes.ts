import { FastifyInstance } from 'fastify';
import { QuotesService } from './quotes.service.js';
import {
  createQuoteSchema,
  acceptQuoteSchema,
  listQuotesQuerySchema,
  quoteIdParamSchema,
} from './quotes.schemas.js';
import { validateBody, validateQuery, validateParams } from '@common/middleware/validation.middleware.js';
import { authenticate, AuthenticatedRequest } from '@common/middleware/auth.middleware.js';

const quotesService = new QuotesService();

export async function quotesRoutes(app: FastifyInstance) {
  /**
   * Create new quote
   */
  app.post(
    '/',
    {
      schema: {
        tags: ['quotes'],
        summary: 'Create new quote',
        security: [{ Bearer: [] }],
        body: {
          type: 'object',
          required: ['packageIds', 'destinationAddress'],
          properties: {
            packageIds: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
              minItems: 1,
            },
            destinationAddress: {
              type: 'object',
              required: ['addressLine1', 'postalCode', 'city', 'territory'],
              properties: {
                addressLine1: { type: 'string' },
                addressLine2: { type: 'string' },
                postalCode: { type: 'string' },
                city: { type: 'string' },
                territory: { type: 'string' },
              },
            },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              carrierOptions: { type: 'array' },
              totalAmount: { type: 'number' },
              status: { type: 'string' },
              validUntil: { type: 'string' },
            },
          },
        },
      },
      preHandler: [authenticate, validateBody(createQuoteSchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const data = createQuoteSchema.parse(request.body);
      const quote = await quotesService.createQuote(request.user!.id, data);
      return reply.code(201).send(quote);
    }
  );

  /**
   * List quotes with pagination
   */
  app.get(
    '/',
    {
      schema: {
        tags: ['quotes'],
        summary: 'List user quotes',
        security: [{ Bearer: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', minimum: 1, default: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
            status: {
              type: 'string',
              enum: ['PENDING', 'ACCEPTED', 'PAID', 'EXPIRED', 'CANCELLED'],
            },
            sortBy: { type: 'string', enum: ['createdAt', 'totalAmount'], default: 'createdAt' },
            sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          },
        },
      },
      preHandler: [authenticate, validateQuery(listQuotesQuerySchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const query = listQuotesQuerySchema.parse(request.query);
      const result = await quotesService.listQuotes(request.user!.id, query);
      return reply.send(result);
    }
  );

  /**
   * Get quote by ID
   */
  app.get(
    '/:quoteId',
    {
      schema: {
        tags: ['quotes'],
        summary: 'Get quote by ID',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          required: ['quoteId'],
          properties: {
            quoteId: { type: 'string', format: 'uuid' },
          },
        },
      },
      preHandler: [authenticate, validateParams(quoteIdParamSchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const { quoteId } = quoteIdParamSchema.parse(request.params);
      const quote = await quotesService.getQuote(request.user!.id, quoteId);
      return reply.send(quote);
    }
  );

  /**
   * Accept quote and select carrier
   */
  app.post(
    '/:quoteId/accept',
    {
      schema: {
        tags: ['quotes'],
        summary: 'Accept quote and select carrier',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          required: ['quoteId'],
          properties: {
            quoteId: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          required: ['selectedCarrier'],
          properties: {
            selectedCarrier: { type: 'string' },
          },
        },
      },
      preHandler: [authenticate, validateParams(quoteIdParamSchema), validateBody(acceptQuoteSchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const { quoteId } = quoteIdParamSchema.parse(request.params);
      const data = acceptQuoteSchema.parse(request.body);
      const quote = await quotesService.acceptQuote(request.user!.id, quoteId, data);
      return reply.send(quote);
    }
  );

  /**
   * Generate and get quote PDF
   */
  app.get(
    '/:quoteId/pdf',
    {
      schema: {
        tags: ['quotes'],
        summary: 'Generate and get quote PDF',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          required: ['quoteId'],
          properties: {
            quoteId: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              pdfUrl: { type: 'string' },
            },
          },
        },
      },
      preHandler: [authenticate, validateParams(quoteIdParamSchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const { quoteId } = quoteIdParamSchema.parse(request.params);
      const result = await quotesService.getQuotePDF(request.user!.id, quoteId);
      return reply.send(result);
    }
  );

  /**
   * Download quote PDF directly
   */
  app.get(
    '/:quoteId/download',
    {
      schema: {
        tags: ['quotes'],
        summary: 'Download quote PDF',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          required: ['quoteId'],
          properties: {
            quoteId: { type: 'string', format: 'uuid' },
          },
        },
      },
      preHandler: [authenticate, validateParams(quoteIdParamSchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const { quoteId } = quoteIdParamSchema.parse(request.params);

      // Generate PDF
      const pdfBuffer = await quotesService.generateQuotePDF(request.user!.id, quoteId);

      // Send as download
      reply.header('Content-Type', 'application/pdf');
      reply.header('Content-Disposition', `attachment; filename="quote-${quoteId}.pdf"`);
      return reply.send(pdfBuffer);
    }
  );

  /**
   * Cancel quote
   */
  app.post(
    '/:quoteId/cancel',
    {
      schema: {
        tags: ['quotes'],
        summary: 'Cancel quote',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          required: ['quoteId'],
          properties: {
            quoteId: { type: 'string', format: 'uuid' },
          },
        },
      },
      preHandler: [authenticate, validateParams(quoteIdParamSchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const { quoteId } = quoteIdParamSchema.parse(request.params);
      const result = await quotesService.cancelQuote(request.user!.id, quoteId);
      return reply.send(result);
    }
  );
}
