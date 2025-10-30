import { z } from 'zod';
import { PaymentStatus } from '@prisma/client';

// ============================================
// CREATE PAYMENT INTENT SCHEMA
// ============================================

export const createPaymentIntentSchema = z.object({
  quoteId: z.string().uuid('Invalid quote ID'),
  paymentMethodId: z.string().optional(),
  savePaymentMethod: z.boolean().default(false),
});

export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;

// ============================================
// CONFIRM PAYMENT SCHEMA
// ============================================

export const confirmPaymentSchema = z.object({
  paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
});

export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;

// ============================================
// REFUND PAYMENT SCHEMA
// ============================================

export const refundPaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive').optional(),
  reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']).default('requested_by_customer'),
});

export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;

// ============================================
// LIST PAYMENTS QUERY SCHEMA
// ============================================

export const listPaymentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.nativeEnum(PaymentStatus).optional(),
  sortBy: z.enum(['createdAt', 'amount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ListPaymentsQuery = z.infer<typeof listPaymentsQuerySchema>;

// ============================================
// PARAMS SCHEMAS
// ============================================

export const paymentIdParamSchema = z.object({
  paymentId: z.string().uuid('Invalid payment ID'),
});

export type PaymentIdParam = z.infer<typeof paymentIdParamSchema>;

// ============================================
// STRIPE WEBHOOK EVENT SCHEMA
// ============================================

export const stripeWebhookEventSchema = z.object({
  type: z.string(),
  data: z.object({
    object: z.any(),
  }),
});

export type StripeWebhookEvent = z.infer<typeof stripeWebhookEventSchema>;
