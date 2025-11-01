import { FastifyInstance } from 'fastify';
import { AuthService } from './auth.service.js';
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from './auth.schemas.js';
import { validateBody } from '@common/middleware/validation.middleware.js';
import { authenticate, AuthenticatedRequest } from '@common/middleware/auth.middleware.js';

const authService = new AuthService();

export async function authRoutes(app: FastifyInstance) {
  /**
   * Register new user
   */
  app.post(
    '/register',
    {
      schema: {
        tags: ['auth'],
        summary: 'Register a new user',
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              user: { type: 'object' },
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
            },
          },
        },
      },
      preHandler: validateBody(registerSchema),
    },
    async (request, reply) => {
      const data = registerSchema.parse(request.body);
      const result = await authService.register(data);
      return reply.send(result);
    }
  );

  /**
   * Login
   */
  app.post(
    '/login',
    {
      schema: {
        tags: ['auth'],
        summary: 'Login user',
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              user: { type: 'object' },
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
            },
          },
        },
      },
      preHandler: validateBody(loginSchema),
    },
    async (request, reply) => {
      const data = loginSchema.parse(request.body);
      const result = await authService.login(data);
      return reply.send(result);
    }
  );

  /**
   * Refresh token
   */
  app.post(
    '/refresh',
    {
      schema: {
        tags: ['auth'],
        summary: 'Refresh access token',
        body: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
            },
          },
        },
      },
      preHandler: validateBody(refreshTokenSchema),
    },
    async (request, reply) => {
      const { refreshToken } = refreshTokenSchema.parse(request.body);
      const result = await authService.refreshToken(refreshToken);
      return reply.send(result);
    }
  );

  /**
   * Logout
   */
  app.post(
    '/logout',
    {
      schema: {
        tags: ['auth'],
        summary: 'Logout user',
        security: [{ Bearer: [] }],
      },
      preHandler: authenticate,
    },
    async (request: AuthenticatedRequest, reply) => {
      const refreshToken = (request.body as any)?.refreshToken;
      const result = await authService.logout(request.user!.id, refreshToken);
      return reply.send(result);
    }
  );

  /**
   * Get current user
   */
  app.get(
    '/me',
    {
      schema: {
        tags: ['auth'],
        summary: 'Get current user information',
        security: [{ Bearer: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              role: { type: 'string' },
              emailVerified: { type: 'boolean' },
              profile: { type: 'object' },
            },
          },
        },
      },
      preHandler: authenticate,
    },
    async (request: AuthenticatedRequest, reply) => {
      const result = await authService.getCurrentUser(request.user!.id);
      return reply.send(result);
    }
  );

  /**
   * Verify email
   */
  app.post(
    '/verify-email',
    {
      schema: {
        tags: ['auth'],
        summary: 'Verify user email',
        body: {
          type: 'object',
          required: ['token'],
          properties: {
            token: { type: 'string' },
          },
        },
      },
      preHandler: validateBody(verifyEmailSchema),
    },
    async (request, reply) => {
      const { token } = verifyEmailSchema.parse(request.body);
      const result = await authService.verifyEmail(token);
      return reply.send(result);
    }
  );

  /**
   * Forgot password
   */
  app.post(
    '/forgot-password',
    {
      schema: {
        tags: ['auth'],
        summary: 'Request password reset',
        body: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email' },
          },
        },
      },
      preHandler: validateBody(forgotPasswordSchema),
    },
    async (request, reply) => {
      const { email } = forgotPasswordSchema.parse(request.body);
      const result = await authService.forgotPassword(email);
      return reply.send(result);
    }
  );

  /**
   * Reset password
   */
  app.post(
    '/reset-password',
    {
      schema: {
        tags: ['auth'],
        summary: 'Reset user password',
        body: {
          type: 'object',
          required: ['token', 'password'],
          properties: {
            token: { type: 'string' },
            password: { type: 'string', minLength: 8 },
          },
        },
      },
      preHandler: validateBody(resetPasswordSchema),
    },
    async (request, reply) => {
      const { token, password } = resetPasswordSchema.parse(request.body);
      const result = await authService.resetPassword(token, password);
      return reply.send(result);
    }
  );
}
