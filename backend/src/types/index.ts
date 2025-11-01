import { UserRole, PackageStatus, QuoteStatus, PaymentStatus } from '@prisma/client';

// ============================================
// Request/Response Types
// ============================================

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ============================================
// Auth Types
// ============================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
}

// ============================================
// User Types
// ============================================

export interface UserProfileUpdate {
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  territory?: string;
  language?: string;
  timezone?: string;
  currency?: string;
}

export interface FrenchAddressCreate {
  addressLine1: string;
  addressLine2?: string;
  postalCode: string;
  city: string;
}

// ============================================
// Package Types
// ============================================

export interface PackageCreate {
  trackingNumber?: string;
  description?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

export interface PackageUpdate {
  trackingNumber?: string;
  description?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  status?: PackageStatus;
}

export interface PackagePhoto {
  url: string;
  caption?: string;
  uploadedAt: Date;
}

export interface PackageFilters {
  status?: PackageStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
}

// ============================================
// Quote Types
// ============================================

export interface QuoteCreate {
  packageIds: string[];
  destinationAddress: {
    addressLine1: string;
    addressLine2?: string;
    postalCode: string;
    city: string;
    territory: string;
  };
}

export interface CarrierOption {
  name: string;
  price: number;
  transitTime: string;
  serviceLevel: string;
  trackingIncluded: boolean;
}

export interface QuoteAccept {
  selectedCarrier: string;
}

// ============================================
// Payment Types
// ============================================

export interface PaymentIntentCreate {
  quoteId: string;
  amount: number;
  currency?: string;
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: unknown;
  };
}

// ============================================
// Admin Types
// ============================================

export interface AdminStats {
  totalUsers: number;
  activePackages: number;
  totalRevenue: number;
  pendingQuotes: number;
  recentActivity: unknown[];
}

export interface UserFilters {
  role?: UserRole;
  emailVerified?: boolean;
  search?: string;
}

export interface PackageAdminFilters extends PackageFilters {
  userId?: string;
}

// ============================================
// Support Types
// ============================================

export interface SupportTicketCreate {
  subject: string;
  message: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
}

export interface SupportMessageCreate {
  content: string;
  attachments?: string[];
}

// ============================================
// Notification Types
// ============================================

export interface NotificationCreate {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}

// ============================================
// 17Track Types
// ============================================

export interface TrackingInfo {
  trackingNumber: string;
  carrier: string;
  status: string;
  events: TrackingEvent[];
}

export interface TrackingEvent {
  timestamp: Date;
  location?: string;
  description: string;
  eventType: string;
}
