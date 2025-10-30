import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate random string
 */
export function generateRandomString(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate unique reference code (e.g., REEXPR-XXXX)
 */
export function generateReferenceCode(): string {
  const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  return `REEXPR-${timestamp}${randomPart}`;
}

/**
 * Calculate storage fees based on days
 */
export function calculateStorageFees(receivedAt: Date, freeStorageDays: number, feePerDay: number): number {
  const now = new Date();
  const daysStored = Math.floor((now.getTime() - receivedAt.getTime()) / (1000 * 60 * 60 * 24));
  const chargeableDays = Math.max(0, daysStored - freeStorageDays);
  return chargeableDays * feePerDay;
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Paginate results
 */
export function paginate(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return {
    skip,
    take: limit,
  };
}

/**
 * Build pagination metadata
 */
export function paginationMeta(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extract filename from URL
 */
export function extractFilename(url: string): string {
  return url.split('/').pop() || '';
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (basic)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s+()-]{10,}$/;
  return phoneRegex.test(phone);
}

/**
 * Generate random 6-digit code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Mask email for privacy
 */
export function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  const maskedName = name.charAt(0) + '***' + name.charAt(name.length - 1);
  return `${maskedName}@${domain}`;
}
