export enum UserRole {
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN',
}

export enum PackageStatus {
  ANNOUNCED = 'ANNOUNCED',
  RECEIVED = 'RECEIVED',
  PROCESSING = 'PROCESSING',
  READY_TO_SHIP = 'READY_TO_SHIP',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum QuoteStatus {
  PENDING = 'PENDING',
  READY = 'READY',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: UserRole
  emailVerified: boolean
  createdAt: string
}

export interface Package {
  id: string
  trackingNumber: string
  description?: string
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  status: PackageStatus
  receivedAt?: string
  shippedAt?: string
  deliveredAt?: string
  createdAt: string
  updatedAt: string
}

export interface Quote {
  id: string
  packageId: string
  carrier: string
  serviceName: string
  price: number
  estimatedDays: number
  status: QuoteStatus
  expiresAt: string
  createdAt: string
}

export interface Payment {
  id: string
  quoteId: string
  amount: number
  status: PaymentStatus
  stripePaymentIntentId?: string
  createdAt: string
  updatedAt: string
}

export interface Ticket {
  id: string
  subject: string
  status: TicketStatus
  priority: TicketPriority
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  statusCode: number
  error: string
  message: string
}
