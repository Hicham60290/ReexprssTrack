import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { authenticate, AuthenticatedRequest } from '@common/middleware/auth.middleware.js';
import prisma from '@common/lib/prisma.js';

const emailPreferencesSchema = z.object({
  packageReceived: z.boolean(),
  packageShipped: z.boolean(),
  packageDelivered: z.boolean(),
  quoteCreated: z.boolean(),
  quoteUpdated: z.boolean(),
  paymentReceived: z.boolean(),
  paymentFailed: z.boolean(),
  accountUpdates: z.boolean(),
  promotionalEmails: z.boolean(),
  weeklyDigest: z.boolean(),
});

const emailPreferencesRoutes: FastifyPluginAsync = async (app) => {
  /**
   * Get current user's email preferences
   */
  app.get(
    '/email-preferences',
    {
      schema: {
        summary: 'Get email preferences',
        description: 'Get the current user email notification preferences',
        tags: ['users'],
      },
      preHandler: [authenticate],
    },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.user!.id;

      // Get user's email preferences
      let emailPrefs = await prisma.emailPreference.findUnique({
        where: { userId },
      });

      // If no preferences exist, create default ones
      if (!emailPrefs) {
        emailPrefs = await prisma.emailPreference.create({
          data: {
            userId,
            packageReceived: true,
            packageShipped: true,
            packageDelivered: true,
            quoteCreated: true,
            quoteUpdated: true,
            paymentReceived: true,
            paymentFailed: true,
            accountUpdates: true,
            promotionalEmails: false,
            weeklyDigest: false,
          },
        });
      }

      return reply.send({
        packageReceived: emailPrefs.packageReceived,
        packageShipped: emailPrefs.packageShipped,
        packageDelivered: emailPrefs.packageDelivered,
        quoteCreated: emailPrefs.quoteCreated,
        quoteUpdated: emailPrefs.quoteUpdated,
        paymentReceived: emailPrefs.paymentReceived,
        paymentFailed: emailPrefs.paymentFailed,
        accountUpdates: emailPrefs.accountUpdates,
        promotionalEmails: emailPrefs.promotionalEmails,
        weeklyDigest: emailPrefs.weeklyDigest,
      });
    }
  );

  /**
   * Update email preferences
   */
  app.put(
    '/email-preferences',
    {
      schema: {
        summary: 'Update email preferences',
        description: 'Update the current user email notification preferences',
        tags: ['users'],
        body: emailPreferencesSchema,
      },
      preHandler: [authenticate],
    },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.user!.id;
      const preferences = emailPreferencesSchema.parse(request.body);

      // Upsert (update or create) email preferences
      const emailPrefs = await prisma.emailPreference.upsert({
        where: { userId },
        update: preferences,
        create: {
          userId,
          ...preferences,
        },
      });

      // Log the action
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'EMAIL_PREFERENCES_UPDATED',
          resourceType: 'USER',
          resourceId: userId,
          metadata: preferences,
        },
      });

      return reply.send({
        success: true,
        message: 'Email preferences updated successfully',
        preferences: {
          packageReceived: emailPrefs.packageReceived,
          packageShipped: emailPrefs.packageShipped,
          packageDelivered: emailPrefs.packageDelivered,
          quoteCreated: emailPrefs.quoteCreated,
          quoteUpdated: emailPrefs.quoteUpdated,
          paymentReceived: emailPrefs.paymentReceived,
          paymentFailed: emailPrefs.paymentFailed,
          accountUpdates: emailPrefs.accountUpdates,
          promotionalEmails: emailPrefs.promotionalEmails,
          weeklyDigest: emailPrefs.weeklyDigest,
        },
      });
    }
  );
};

export default emailPreferencesRoutes;
