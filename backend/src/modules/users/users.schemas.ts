import { z } from 'zod';

// ============================================
// PROFILE UPDATE SCHEMA
// ============================================

export const updateProfileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
  phone: z.string().regex(/^[\d\s+()-]{10,}$/, 'Invalid phone number').optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  territory: z.string().optional(),
  language: z.enum(['fr', 'en']).optional(),
  timezone: z.string().optional(),
  currency: z.enum(['EUR', 'USD']).optional(),
  acceptMarketing: z.boolean().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ============================================
// FRENCH ADDRESS SCHEMAS
// ============================================

export const createFrenchAddressSchema = z.object({
  addressLine1: z.string().min(5, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  postalCode: z.string().regex(/^\d{5}$/, 'Invalid French postal code'),
  city: z.string().min(2, 'City is required'),
});

export type CreateFrenchAddressInput = z.infer<typeof createFrenchAddressSchema>;

export const updateFrenchAddressSchema = z.object({
  addressLine1: z.string().min(5, 'Address line 1 is required').optional(),
  addressLine2: z.string().optional(),
  postalCode: z.string().regex(/^\d{5}$/, 'Invalid French postal code').optional(),
  city: z.string().min(2, 'City is required').optional(),
  isActive: z.boolean().optional(),
});

export type UpdateFrenchAddressInput = z.infer<typeof updateFrenchAddressSchema>;

// ============================================
// CHANGE PASSWORD SCHEMA
// ============================================

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// ============================================
// PARAMS SCHEMAS
// ============================================

export const addressIdParamSchema = z.object({
  addressId: z.string().uuid('Invalid address ID'),
});

export type AddressIdParam = z.infer<typeof addressIdParamSchema>;
