import { z } from 'zod';
import { SupportStatus, SupportPriority } from '@prisma/client';

/**
 * Create Ticket Schema
 */
export const createTicketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200, 'Subject too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000, 'Message too long'),
  priority: z.nativeEnum(SupportPriority).default(SupportPriority.NORMAL),
  packageId: z.string().uuid().optional(),
  quoteId: z.string().uuid().optional(),
  paymentId: z.string().uuid().optional(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;

/**
 * Update Ticket Schema
 */
export const updateTicketSchema = z.object({
  status: z.nativeEnum(SupportStatus).optional(),
  priority: z.nativeEnum(SupportPriority).optional(),
});

export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;

/**
 * Add Message to Ticket Schema
 */
export const addMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(5000, 'Message too long'),
  attachments: z.array(z.object({
    url: z.string().url(),
    filename: z.string(),
    size: z.number(),
  })).optional(),
});

export type AddMessageInput = z.infer<typeof addMessageSchema>;

/**
 * List Tickets Query Schema
 */
export const listTicketsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: z.nativeEnum(SupportStatus).optional(),
  priority: z.nativeEnum(SupportPriority).optional(),
  search: z.string().optional(), // Search in subject
  sortBy: z.enum(['createdAt', 'updatedAt', 'priority']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ListTicketsQuery = z.infer<typeof listTicketsQuerySchema>;

/**
 * List Admin Tickets Query Schema (extended)
 */
export const listAdminTicketsQuerySchema = listTicketsQuerySchema.extend({
  userId: z.string().uuid().optional(), // Filter by user
});

export type ListAdminTicketsQuery = z.infer<typeof listAdminTicketsQuerySchema>;

/**
 * Ticket ID Param Schema
 */
export const ticketIdParamSchema = z.object({
  ticketId: z.string().uuid(),
});

export type TicketIdParam = z.infer<typeof ticketIdParamSchema>;

/**
 * Message ID Param Schema
 */
export const messageIdParamSchema = z.object({
  messageId: z.string().uuid(),
});

export type MessageIdParam = z.infer<typeof messageIdParamSchema>;

/**
 * Close Ticket Schema
 */
export const closeTicketSchema = z.object({
  resolutionNote: z.string().min(10, 'Resolution note must be at least 10 characters').max(1000),
});

export type CloseTicketInput = z.infer<typeof closeTicketSchema>;

/**
 * Assign Ticket Schema
 */
export const assignTicketSchema = z.object({
  assignedToId: z.string().uuid(),
});

export type AssignTicketInput = z.infer<typeof assignTicketSchema>;
