import { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError, ForbiddenError } from '@common/errors/custom-errors.js';
import { UserRole } from '@prisma/client';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export async function authenticate(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();

    // User info is automatically attached to request.user by fastify-jwt
    if (!request.user) {
      throw new UnauthorizedError('Authentication required');
    }
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

export function requireRole(...roles: UserRole[]) {
  return async (request: AuthenticatedRequest, reply: FastifyReply) => {
    await authenticate(request, reply);

    if (!request.user || !roles.includes(request.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }
  };
}

export const requireAdmin = requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN);
export const requireSuperAdmin = requireRole(UserRole.SUPER_ADMIN);
