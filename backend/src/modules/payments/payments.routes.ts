import { FastifyInstance, FastifyRequest } from 'fastify';
import { PaymentsService } from './payments.service.js';
import {
  createPaymentIntentSchema,
  confirmPaymentSchema,
  refundPaymentSchema,
  listPaymentsQuerySchema,
  paymentIdParamSchema,
} from './payments.schemas.js';
import { validateBody, validateQuery, validateParams } from '@common/middleware/validation.middleware.js';
import { authenticate, AuthenticatedRequest } from '@common/middleware/auth.middleware.js';
import { config } from '@config/index.js';
import Stripe from 'stripe';

const paymentsService = new PaymentsService();
const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2024-11-20.acacia',
});

export async function paymentsRoutes(app: FastifyInstance) {
  /**
   * Create payment intent
   */
  app.post(
    '/create-intent',
    {
      schema: {
        tags: ['payments'],
        summary: 'Create payment intent for quote',
        security: [{ Bearer: [] }],
        body: {
          type: 'object',
          required: ['quoteId'],
          properties: {
            quoteId: { type: 'string', format: 'uuid' },
            paymentMethodId: { type: 'string' },
            savePaymentMethod: { type: 'boolean', default: false },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              paymentId: { type: 'string' },
              clientSecret: { type: 'string' },
              amount: { type: 'number' },
            },
          },
        },
      },
      preHandler: [authenticate, validateBody(createPaymentIntentSchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const data = createPaymentIntentSchema.parse(request.body);
      const result = await paymentsService.createPaymentIntent(request.user!.id, data);
      return reply.send(result);
    }
  );

  /**
   * Confirm payment
   */
  app.post(
    '/confirm',
    {
      schema: {
        tags: ['payments'],
        summary: 'Confirm payment',
        security: [{ Bearer: [] }],
        body: {
          type: 'object',
          required: ['paymentIntentId'],
          properties: {
            paymentIntentId: { type: 'string' },
          },
        },
      },
      preHandler: [authenticate, validateBody(confirmPaymentSchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const data = confirmPaymentSchema.parse(request.body);
      const payment = await paymentsService.confirmPayment(request.user!.id, data);
      return reply.send(payment);
    }
  );

  /**
   * Stripe webhook handler
   */
  app.post(
    '/webhook',
    {
      schema: {
        tags: ['payments'],
        summary: 'Stripe webhook handler',
        hide: true, // Hide from Swagger as it's not for client use
      },
      config: {
        // Disable body parsing for webhook signature verification
        rawBody: true,
      },
    },
    async (request: FastifyRequest, reply) => {
      const sig = request.headers['stripe-signature'];

      if (!sig) {
        return reply.code(400).send({ error: 'No signature provided' });
      }

      try {
        // Get raw body for signature verification
        const rawBody = (request as any).rawBody || request.body;

        // Verify webhook signature
        const event = stripe.webhooks.constructEvent(
          rawBody,
          sig as string,
          config.stripe.webhookSecret
        );

        // Handle the event
        await paymentsService.handleWebhook(event);

        return reply.send({ received: true });
      } catch (err) {
        request.log.error(err);
        return reply.code(400).send({ error: 'Webhook signature verification failed' });
      }
    }
  );

  /**
   * List payments
   */
  app.get(
    '/',
    {
      schema: {
        tags: ['payments'],
        summary: 'List user payments',
        security: [{ Bearer: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', minimum: 1, default: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
            status: {
              type: 'string',
              enum: ['PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'REFUNDED'],
            },
            sortBy: { type: 'string', enum: ['createdAt', 'amount'], default: 'createdAt' },
            sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          },
        },
      },
      preHandler: [authenticate, validateQuery(listPaymentsQuerySchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const query = listPaymentsQuerySchema.parse(request.query);
      const result = await paymentsService.listPayments(request.user!.id, query);
      return reply.send(result);
    }
  );

  /**
   * Get payment by ID
   */
  app.get(
    '/:paymentId',
    {
      schema: {
        tags: ['payments'],
        summary: 'Get payment by ID',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          required: ['paymentId'],
          properties: {
            paymentId: { type: 'string', format: 'uuid' },
          },
        },
      },
      preHandler: [authenticate, validateParams(paymentIdParamSchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const { paymentId } = paymentIdParamSchema.parse(request.params);
      const payment = await paymentsService.getPayment(request.user!.id, paymentId);
      return reply.send(payment);
    }
  );

  /**
   * Refund payment
   */
  app.post(
    '/:paymentId/refund',
    {
      schema: {
        tags: ['payments'],
        summary: 'Refund payment',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          required: ['paymentId'],
          properties: {
            paymentId: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          properties: {
            amount: { type: 'number', minimum: 0 },
            reason: {
              type: 'string',
              enum: ['duplicate', 'fraudulent', 'requested_by_customer'],
              default: 'requested_by_customer',
            },
          },
        },
      },
      preHandler: [authenticate, validateParams(paymentIdParamSchema), validateBody(refundPaymentSchema)],
    },
    async (request: AuthenticatedRequest, reply) => {
      const { paymentId } = paymentIdParamSchema.parse(request.params);
      const data = refundPaymentSchema.parse(request.body);
      const result = await paymentsService.refundPayment(request.user!.id, paymentId, data);
      return reply.send(result);
    }
  );

  /**
   * Get payment statistics
   */
  app.get(
    '/stats/summary',
    {
      schema: {
        tags: ['payments'],
        summary: 'Get payment statistics',
        security: [{ Bearer: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              totalSpent: { type: 'number' },
              successfulPayments: { type: 'number' },
              pendingPayments: { type: 'number' },
              refundedAmount: { type: 'number' },
            },
          },
        },
      },
      preHandler: authenticate,
    },
    async (request: AuthenticatedRequest, reply) => {
      const stats = await paymentsService.getPaymentStats(request.user!.id);
      return reply.send(stats);
    }
  );
}
