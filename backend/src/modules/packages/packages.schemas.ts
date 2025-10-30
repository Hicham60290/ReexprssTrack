import { z } from 'zod';
import { PackageStatus } from '@prisma/client';

// ============================================
// CREATE PACKAGE SCHEMA
// ============================================

export const createPackageSchema = z.object({
  trackingNumber: z.string().min(5, 'Tracking number must be at least 5 characters').optional(),
  description: z.string().min(3, 'Description must be at least 3 characters').optional(),
  weight: z.number().positive('Weight must be positive').optional(),
  dimensions: z
    .object({
      length: z.number().positive('Length must be positive'),
      width: z.number().positive('Width must be positive'),
      height: z.number().positive('Height must be positive'),
    })
    .optional(),
});

export type CreatePackageInput = z.infer<typeof createPackageSchema>;

// ============================================
// UPDATE PACKAGE SCHEMA
// ============================================

export const updatePackageSchema = z.object({
  trackingNumber: z.string().min(5, 'Tracking number must be at least 5 characters').optional(),
  description: z.string().min(3, 'Description must be at least 3 characters').optional(),
  weight: z.number().positive('Weight must be positive').optional(),
  dimensions: z
    .object({
      length: z.number().positive('Length must be positive'),
      width: z.number().positive('Width must be positive'),
      height: z.number().positive('Height must be positive'),
    })
    .optional(),
  status: z.nativeEnum(PackageStatus).optional(),
});

export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;

// ============================================
// PHOTO CAPTION SCHEMA
// ============================================

export const photoCaptionSchema = z.object({
  caption: z.string().max(200, 'Caption must be less than 200 characters').optional(),
});

export type PhotoCaptionInput = z.infer<typeof photoCaptionSchema>;

// ============================================
// LIST PACKAGES QUERY SCHEMA
// ============================================

export const listPackagesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.nativeEnum(PackageStatus).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'receivedAt', 'weight']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ListPackagesQuery = z.infer<typeof listPackagesQuerySchema>;

// ============================================
// PARAMS SCHEMAS
// ============================================

export const packageIdParamSchema = z.object({
  packageId: z.string().uuid('Invalid package ID'),
});

export type PackageIdParam = z.infer<typeof packageIdParamSchema>;

export const photoIdParamSchema = z.object({
  packageId: z.string().uuid('Invalid package ID'),
  photoId: z.string().uuid('Invalid photo ID'),
});

export type PhotoIdParam = z.infer<typeof photoIdParamSchema>;

// ============================================
// UPDATE TRACKING SCHEMA
// ============================================

export const updateTrackingSchema = z.object({
  trackingNumber: z.string().min(5, 'Tracking number must be at least 5 characters'),
});

export type UpdateTrackingInput = z.infer<typeof updateTrackingSchema>;
