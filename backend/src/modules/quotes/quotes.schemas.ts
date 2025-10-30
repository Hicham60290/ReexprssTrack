import { z } from 'zod';
import { QuoteStatus } from '@prisma/client';

// ============================================
// CREATE QUOTE SCHEMA
// ============================================

export const createQuoteSchema = z.object({
  packageIds: z.array(z.string().uuid('Invalid package ID')).min(1, 'At least one package is required'),
  destinationAddress: z.object({
    addressLine1: z.string().min(5, 'Address line 1 is required'),
    addressLine2: z.string().optional(),
    postalCode: z.string().min(3, 'Postal code is required'),
    city: z.string().min(2, 'City is required'),
    territory: z.string().min(2, 'Territory is required'),
  }),
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;

// ============================================
// ACCEPT QUOTE SCHEMA
// ============================================

export const acceptQuoteSchema = z.object({
  selectedCarrier: z.string().min(1, 'Carrier selection is required'),
});

export type AcceptQuoteInput = z.infer<typeof acceptQuoteSchema>;

// ============================================
// LIST QUOTES QUERY SCHEMA
// ============================================

export const listQuotesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.nativeEnum(QuoteStatus).optional(),
  sortBy: z.enum(['createdAt', 'totalAmount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ListQuotesQuery = z.infer<typeof listQuotesQuerySchema>;

// ============================================
// PARAMS SCHEMAS
// ============================================

export const quoteIdParamSchema = z.object({
  quoteId: z.string().uuid('Invalid quote ID'),
});

export type QuoteIdParam = z.infer<typeof quoteIdParamSchema>;

// ============================================
// CARRIER OPTION INTERFACE
// ============================================

export interface CarrierOption {
  name: string;
  price: number;
  transitTime: string;
  serviceLevel: string;
  trackingIncluded: boolean;
  features?: string[];
}
