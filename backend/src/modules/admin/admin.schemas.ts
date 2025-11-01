import { z } from 'zod';
import { UserRole, PackageStatus, QuoteStatus, PaymentStatus, KycStatus } from '@prisma/client';

// ============================================
// LIST USERS QUERY SCHEMA
// ============================================

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  role: z.nativeEnum(UserRole).optional(),
  emailVerified: z.coerce.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'email']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

// ============================================
// UPDATE USER ROLE SCHEMA
// ============================================

export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(UserRole),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

// ============================================
// UPDATE KYC STATUS SCHEMA
// ============================================

export const updateKycStatusSchema = z.object({
  kycStatus: z.nativeEnum(KycStatus),
  notes: z.string().optional(),
});

export type UpdateKycStatusInput = z.infer<typeof updateKycStatusSchema>;

// ============================================
// LIST PACKAGES ADMIN QUERY SCHEMA
// ============================================

export const listPackagesAdminQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.nativeEnum(PackageStatus).optional(),
  userId: z.string().uuid().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'receivedAt', 'weight']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ListPackagesAdminQuery = z.infer<typeof listPackagesAdminQuerySchema>;

// ============================================
// UPDATE PACKAGE STATUS SCHEMA
// ============================================

export const updatePackageStatusSchema = z.object({
  status: z.nativeEnum(PackageStatus),
  notes: z.string().optional(),
});

export type UpdatePackageStatusInput = z.infer<typeof updatePackageStatusSchema>;

// ============================================
// LIST QUOTES ADMIN QUERY SCHEMA
// ============================================

export const listQuotesAdminQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.nativeEnum(QuoteStatus).optional(),
  userId: z.string().uuid().optional(),
  sortBy: z.enum(['createdAt', 'totalAmount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ListQuotesAdminQuery = z.infer<typeof listQuotesAdminQuerySchema>;

// ============================================
// LIST PAYMENTS ADMIN QUERY SCHEMA
// ============================================

export const listPaymentsAdminQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.nativeEnum(PaymentStatus).optional(),
  userId: z.string().uuid().optional(),
  sortBy: z.enum(['createdAt', 'amount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ListPaymentsAdminQuery = z.infer<typeof listPaymentsAdminQuerySchema>;

// ============================================
// AUDIT LOGS QUERY SCHEMA
// ============================================

export const listAuditLogsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  resourceType: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ListAuditLogsQuery = z.infer<typeof listAuditLogsQuerySchema>;

// ============================================
// PARAMS SCHEMAS
// ============================================

export const userIdParamSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

export type UserIdParam = z.infer<typeof userIdParamSchema>;

export const packageIdParamSchema = z.object({
  packageId: z.string().uuid('Invalid package ID'),
});

export type PackageIdParam = z.infer<typeof packageIdParamSchema>;

export const quoteIdParamSchema = z.object({
  quoteId: z.string().uuid('Invalid quote ID'),
});

export type QuoteIdParam = z.infer<typeof quoteIdParamSchema>;

export const paymentIdParamSchema = z.object({
  paymentId: z.string().uuid('Invalid payment ID'),
});

export type PaymentIdParam = z.infer<typeof paymentIdParamSchema>;
