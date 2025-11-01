import { prisma } from '@common/database/prisma.client.js';
import { SupportStatus, SupportPriority, UserRole } from '@prisma/client';
import { AppError } from '@common/middleware/error.middleware.js';
import { storageService } from '@common/storage/minio.client.js';
import { queueService } from '@common/queue/bullmq.client.js';
import {
  CreateTicketInput,
  UpdateTicketInput,
  AddMessageInput,
  ListTicketsQuery,
  ListAdminTicketsQuery,
  CloseTicketInput,
} from './support.schemas.js';

export class SupportService {
  /**
   * Create a new support ticket
   */
  async createTicket(userId: string, data: CreateTicketInput) {
    // Verify related resources if provided
    if (data.packageId) {
      const pkg = await prisma.package.findFirst({
        where: { id: data.packageId, userId },
      });
      if (!pkg) {
        throw new AppError('Package not found', 404);
      }
    }

    if (data.quoteId) {
      const quote = await prisma.quote.findFirst({
        where: { id: data.quoteId, userId },
      });
      if (!quote) {
        throw new AppError('Quote not found', 404);
      }
    }

    if (data.paymentId) {
      const payment = await prisma.payment.findFirst({
        where: { id: data.paymentId, userId },
      });
      if (!payment) {
        throw new AppError('Payment not found', 404);
      }
    }

    // Create ticket with initial message
    const ticket = await prisma.supportMessage.create({
      data: {
        userId,
        subject: data.subject,
        priority: data.priority,
        status: SupportStatus.OPEN,
        history: {
          create: {
            senderType: 'user',
            senderId: userId,
            content: data.message,
            attachments: [],
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        history: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'TICKET_CREATED',
        resourceType: 'SupportMessage',
        resourceId: ticket.id,
        metadata: {
          subject: data.subject,
          priority: data.priority,
          packageId: data.packageId,
          quoteId: data.quoteId,
          paymentId: data.paymentId,
        },
      },
    });

    // Send notification to admins
    await queueService.sendNotification({
      userId,
      type: 'SYSTEM',
      title: 'New Support Ticket',
      message: `New support ticket: ${data.subject}`,
    });

    return ticket;
  }

  /**
   * Get user's tickets
   */
  async getUserTickets(userId: string, query: ListTicketsQuery) {
    const { page, limit, status, priority, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (search) {
      where.subject = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [tickets, total] = await Promise.all([
      prisma.supportMessage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          history: {
            orderBy: { createdAt: 'desc' },
            take: 1, // Last message
          },
        },
      }),
      prisma.supportMessage.count({ where }),
    ]);

    return {
      data: tickets,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get ticket details (with full conversation history)
   */
  async getTicketDetails(userId: string, ticketId: string, userRole: UserRole) {
    const ticket = await prisma.supportMessage.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        history: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }

    // Users can only view their own tickets, admins can view all
    if (userRole === UserRole.USER && ticket.userId !== userId) {
      throw new AppError('Access denied', 403);
    }

    return ticket;
  }

  /**
   * Add message to ticket
   */
  async addMessage(userId: string, ticketId: string, data: AddMessageInput, userRole: UserRole) {
    const ticket = await prisma.supportMessage.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }

    // Users can only reply to their own tickets
    if (userRole === UserRole.USER && ticket.userId !== userId) {
      throw new AppError('Access denied', 403);
    }

    // Determine sender type
    const senderType = userRole === UserRole.USER ? 'user' : 'admin';

    // Create message in history
    const message = await prisma.supportMessageHistory.create({
      data: {
        messageId: ticketId,
        senderType,
        senderId: userId,
        content: data.message,
        attachments: data.attachments || [],
      },
    });

    // Update ticket status if needed
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (senderType === 'user' && ticket.status === SupportStatus.WAITING_CUSTOMER) {
      updateData.status = SupportStatus.IN_PROGRESS;
    } else if (senderType === 'admin' && ticket.status === SupportStatus.OPEN) {
      updateData.status = SupportStatus.IN_PROGRESS;
    }

    await prisma.supportMessage.update({
      where: { id: ticketId },
      data: updateData,
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'TICKET_MESSAGE_ADDED',
        resourceType: 'SupportMessage',
        resourceId: ticketId,
        metadata: {
          messageId: message.id,
          senderType,
        },
      },
    });

    // Send notification to the other party
    if (senderType === 'admin') {
      await queueService.sendNotification({
        userId: ticket.userId,
        type: 'SYSTEM',
        title: 'New Reply to Your Ticket',
        message: `You have a new reply to your ticket: ${ticket.subject}`,
      });
    }

    return message;
  }

  /**
   * Update ticket (admin only)
   */
  async updateTicket(adminId: string, ticketId: string, data: UpdateTicketInput) {
    const ticket = await prisma.supportMessage.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }

    const updatedTicket = await prisma.supportMessage.update({
      where: { id: ticketId },
      data: {
        status: data.status,
        priority: data.priority,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        history: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'TICKET_UPDATED',
        resourceType: 'SupportMessage',
        resourceId: ticketId,
        metadata: {
          changes: data,
          previousStatus: ticket.status,
          previousPriority: ticket.priority,
        },
      },
    });

    // Notify user if status changed to resolved or closed
    if (data.status && [SupportStatus.RESOLVED, SupportStatus.CLOSED].includes(data.status)) {
      await queueService.sendNotification({
        userId: ticket.userId,
        type: 'SYSTEM',
        title: 'Ticket Status Updated',
        message: `Your ticket "${ticket.subject}" has been ${data.status.toLowerCase()}`,
      });
    }

    return updatedTicket;
  }

  /**
   * Close ticket with resolution note
   */
  async closeTicket(adminId: string, ticketId: string, data: CloseTicketInput) {
    const ticket = await prisma.supportMessage.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }

    // Add resolution note
    await prisma.supportMessageHistory.create({
      data: {
        messageId: ticketId,
        senderType: 'admin',
        senderId: adminId,
        content: `**Resolution Note:**\n${data.resolutionNote}`,
        attachments: [],
      },
    });

    // Update ticket status
    const updatedTicket = await prisma.supportMessage.update({
      where: { id: ticketId },
      data: {
        status: SupportStatus.CLOSED,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        history: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'TICKET_CLOSED',
        resourceType: 'SupportMessage',
        resourceId: ticketId,
        metadata: {
          resolutionNote: data.resolutionNote,
        },
      },
    });

    // Notify user
    await queueService.sendNotification({
      userId: ticket.userId,
      type: 'SYSTEM',
      title: 'Ticket Closed',
      message: `Your ticket "${ticket.subject}" has been closed`,
    });

    return updatedTicket;
  }

  /**
   * Reopen ticket
   */
  async reopenTicket(userId: string, ticketId: string) {
    const ticket = await prisma.supportMessage.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }

    // Only ticket owner can reopen
    if (ticket.userId !== userId) {
      throw new AppError('Access denied', 403);
    }

    // Can only reopen closed or resolved tickets
    if (![SupportStatus.CLOSED, SupportStatus.RESOLVED].includes(ticket.status)) {
      throw new AppError('Ticket cannot be reopened', 400);
    }

    const updatedTicket = await prisma.supportMessage.update({
      where: { id: ticketId },
      data: {
        status: SupportStatus.OPEN,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        history: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'TICKET_REOPENED',
        resourceType: 'SupportMessage',
        resourceId: ticketId,
        metadata: {
          previousStatus: ticket.status,
        },
      },
    });

    return updatedTicket;
  }

  /**
   * List all tickets (admin view)
   */
  async listAllTickets(query: ListAdminTicketsQuery) {
    const { page, limit, status, priority, search, userId, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (userId) {
      where.userId = userId;
    }

    if (search) {
      where.subject = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [tickets, total] = await Promise.all([
      prisma.supportMessage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          history: {
            orderBy: { createdAt: 'desc' },
            take: 1, // Last message
          },
        },
      }),
      prisma.supportMessage.count({ where }),
    ]);

    return {
      data: tickets,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get ticket statistics (admin)
   */
  async getTicketStats() {
    const [total, byStatus, byPriority, recentTickets] = await Promise.all([
      prisma.supportMessage.count(),
      prisma.supportMessage.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.supportMessage.groupBy({
        by: ['priority'],
        _count: { id: true },
      }),
      prisma.supportMessage.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      total,
      byStatus: byStatus.map((item) => ({
        status: item.status,
        count: item._count.id,
      })),
      byPriority: byPriority.map((item) => ({
        priority: item.priority,
        count: item._count.id,
      })),
      recentTickets,
    };
  }

  /**
   * Upload attachment for ticket message
   */
  async uploadAttachment(file: Buffer, filename: string, contentType: string) {
    const timestamp = Date.now();
    const objectName = `support-attachments/${timestamp}-${filename}`;

    const url = await storageService.uploadFile(file, objectName, contentType);

    return {
      url,
      filename,
      size: file.length,
    };
  }
}
