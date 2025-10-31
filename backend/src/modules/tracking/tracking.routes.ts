/**
 * Tracking Routes
 * Endpoints for 17Track integration
 */

import { FastifyInstance } from 'fastify'
import TrackingService from './tracking.service'
import { verifyAuth } from '@/shared/middleware/auth.middleware'
import { config } from '@/config/index.js'

export default async function trackingRoutes(app: FastifyInstance) {
  if (!config.track17.apiKey) {
    app.log.warn('TRACK17_API_KEY not configured - tracking features will be disabled')
  }

  const trackingService = new TrackingService(config.track17.apiKey, app.log)

  /**
   * Register tracking numbers
   */
  app.post(
    '/register',
    {
      preHandler: verifyAuth,
      schema: {
        tags: ['tracking'],
        summary: 'Register tracking numbers for monitoring',
        description: 'Register one or more tracking numbers with 17Track API',
        body: {
          type: 'object',
          required: ['trackingNumbers'],
          properties: {
            trackingNumbers: {
              type: 'array',
              items: {
                type: 'object',
                required: ['number'],
                properties: {
                  number: { type: 'string', minLength: 5, maxLength: 50 },
                  carrier: { type: 'number' },
                  tag: { type: 'string', maxLength: 100 },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { trackingNumbers } = request.body as any

      try {
        const result = await trackingService.registerTracking({ trackingNumbers })
        return reply.status(200).send({
          success: true,
          data: result,
        })
      } catch (error: any) {
        app.log.error({ error: error.message }, 'Failed to register tracking')
        return reply.status(500).send({
          success: false,
          message: error.message,
        })
      }
    }
  )

  /**
   * Get tracking information
   */
  app.post(
    '/info',
    {
      preHandler: verifyAuth,
      schema: {
        tags: ['tracking'],
        summary: 'Get tracking information',
        description: 'Get detailed tracking information for registered numbers',
        body: {
          type: 'object',
          required: ['trackingNumbers'],
          properties: {
            trackingNumbers: {
              type: 'array',
              items: { type: 'string' },
              minItems: 1,
              maxItems: 40,
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { trackingNumbers } = request.body as any

      try {
        const trackingInfo = await trackingService.getTrackingInfo({ trackingNumbers })
        return reply.status(200).send({
          success: true,
          data: trackingInfo,
        })
      } catch (error: any) {
        app.log.error({ error: error.message }, 'Failed to get tracking info')
        return reply.status(500).send({
          success: false,
          message: error.message,
        })
      }
    }
  )

  /**
   * Detect carrier for tracking number
   */
  app.post(
    '/detect-carrier',
    {
      preHandler: verifyAuth,
      schema: {
        tags: ['tracking'],
        summary: 'Detect carrier for tracking number',
        description: 'Auto-detect possible carriers for a tracking number',
        body: {
          type: 'object',
          required: ['trackingNumber'],
          properties: {
            trackingNumber: { type: 'string', minLength: 5, maxLength: 50 },
          },
        },
      },
    },
    async (request, reply) => {
      const { trackingNumber } = request.body as any

      try {
        const carriers = await trackingService.detectCarrier(trackingNumber)
        return reply.status(200).send({
          success: true,
          data: { carriers },
        })
      } catch (error: any) {
        app.log.error({ error: error.message }, 'Failed to detect carrier')
        return reply.status(500).send({
          success: false,
          message: error.message,
        })
      }
    }
  )

  /**
   * Delete tracking numbers
   */
  app.delete(
    '/',
    {
      preHandler: verifyAuth,
      schema: {
        tags: ['tracking'],
        summary: 'Delete tracking numbers',
        description: 'Remove tracking numbers from monitoring',
        body: {
          type: 'object',
          required: ['trackingNumbers'],
          properties: {
            trackingNumbers: {
              type: 'array',
              items: { type: 'string' },
              minItems: 1,
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { trackingNumbers } = request.body as any

      try {
        const result = await trackingService.deleteTracking(trackingNumbers)
        return reply.status(200).send({
          success: true,
          data: result,
        })
      } catch (error: any) {
        app.log.error({ error: error.message }, 'Failed to delete tracking')
        return reply.status(500).send({
          success: false,
          message: error.message,
        })
      }
    }
  )
}
