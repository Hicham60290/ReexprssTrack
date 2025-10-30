import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { config } from './config/index.js';
import { logger } from './common/utils/logger.js';
import { prisma } from './common/database/prisma.client.js';
import { redis } from './common/cache/redis.client.js';
import { initMinIO } from './common/storage/minio.client.js';
import { errorHandler } from './common/middleware/error.middleware.js';

// Import routes
import { authRoutes } from './modules/auth/auth.routes.js';
import { usersRoutes } from './modules/users/users.routes.js';
import { packagesRoutes } from './modules/packages/packages.routes.js';
import { quotesRoutes } from './modules/quotes/quotes.routes.js';
import { paymentsRoutes } from './modules/payments/payments.routes.js';
import { adminRoutes } from './modules/admin/admin.routes.js';
import { supportRoutes } from './modules/support/support.routes.js';

async function buildServer() {
  const app = Fastify({
    logger: logger,
    trustProxy: true,
    requestIdLogLabel: 'reqId',
    disableRequestLogging: false,
  });

  // ============================================
  // PLUGINS
  // ============================================

  // CORS
  await app.register(cors, {
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  // Security Headers
  await app.register(helmet, {
    contentSecurityPolicy: config.isProduction
      ? undefined
      : false,
  });

  // JWT
  await app.register(jwt, {
    secret: config.jwt.secret,
    sign: {
      expiresIn: config.jwt.accessTokenExpiry,
    },
  });

  // Rate Limiting
  await app.register(rateLimit, {
    max: config.isProduction ? 100 : 1000,
    timeWindow: '1 minute',
    redis: redis,
    skipOnError: true,
  });

  // Multipart/Form-data
  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 10,
      fields: 20,
    },
  });

  // Swagger Documentation (Development only)
  if (config.isDevelopment) {
    await app.register(swagger, {
      swagger: {
        info: {
          title: 'ReExpressTrack API',
          description: 'API Documentation for ReExpressTrack - Package Forwarding Platform',
          version: '1.0.0',
          contact: {
            name: 'API Support',
            email: 'support@reexpresstrack.com',
          },
        },
        host: `localhost:${config.server.port}`,
        schemes: ['http', 'https'],
        consumes: ['application/json', 'multipart/form-data'],
        produces: ['application/json'],
        tags: [
          { name: 'auth', description: 'Authentication endpoints' },
          { name: 'users', description: 'User management' },
          { name: 'packages', description: 'Package management' },
          { name: 'quotes', description: 'Quote management' },
          { name: 'payments', description: 'Payment processing' },
          { name: 'admin', description: 'Admin operations' },
          { name: 'support', description: 'Support tickets' },
        ],
        securityDefinitions: {
          Bearer: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
            description: 'Enter your Bearer token in the format: Bearer <token>',
          },
        },
      },
    });

    await app.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: true,
        displayRequestDuration: true,
      },
      staticCSP: true,
    });
  }

  // ============================================
  // DECORATORS
  // ============================================

  app.decorate('prisma', prisma);
  app.decorate('redis', redis);

  // ============================================
  // HOOKS
  // ============================================

  // Request logging
  app.addHook('onRequest', async (request, reply) => {
    request.log.info({
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    }, 'Incoming request');
  });

  // Response time header
  app.addHook('onRequest', async (request) => {
    (request as any).startTime = Date.now();
  });

  app.addHook('onResponse', async (request, reply) => {
    const duration = Date.now() - (request as any).startTime;
    reply.header('X-Response-Time', `${duration}ms`);

    request.log.info({
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      duration: `${duration}ms`,
    }, 'Request completed');
  });

  // ============================================
  // HEALTH & INFO ROUTES
  // ============================================

  app.get('/health', async () => {
    try {
      // Check database
      await prisma.$queryRaw`SELECT 1`;

      // Check Redis
      await redis.ping();

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.env,
        services: {
          database: 'connected',
          redis: 'connected',
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  app.get('/', async () => {
    return {
      name: 'ReExpressTrack API',
      version: '1.0.0',
      environment: config.env,
      documentation: config.isDevelopment ? '/docs' : null,
      endpoints: {
        health: '/health',
        api: '/api/v1',
      },
    };
  });

  // ============================================
  // API ROUTES (v1)
  // ============================================

  await app.register(async (api) => {
    // Register all API routes
    await api.register(authRoutes, { prefix: '/auth' });
    await api.register(usersRoutes, { prefix: '/users' });
    await api.register(packagesRoutes, { prefix: '/packages' });
    await api.register(quotesRoutes, { prefix: '/quotes' });
    await api.register(paymentsRoutes, { prefix: '/payments' });
    await api.register(adminRoutes, { prefix: '/admin' });
    await api.register(supportRoutes, { prefix: '/support' });

    // API status route
    api.get('/status', async () => {
      return {
        message: 'API v1 is ready',
        modules: {
          auth: 'active',
          users: 'active',
          packages: 'active',
          quotes: 'active',
          payments: 'active',
          admin: 'active',
          support: 'active',
        },
      };
    });
  }, { prefix: '/api/v1' });

  // ============================================
  // 404 Handler
  // ============================================

  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      statusCode: 404,
      error: 'Not Found',
      message: `Route ${request.method} ${request.url} not found`,
    });
  });

  // ============================================
  // ERROR HANDLER
  // ============================================

  app.setErrorHandler(errorHandler);

  return app;
}

// ============================================
// START SERVER
// ============================================

async function start() {
  try {
    // Initialize MinIO
    await initMinIO();
    logger.info('MinIO initialized');

    // Build Fastify app
    const app = await buildServer();

    // Start server
    await app.listen({
      port: config.server.port,
      host: config.server.host,
    });

    logger.info(`
    🚀 ReExpressTrack Backend Started Successfully!

    📝 Environment: ${config.env}
    🌐 Server: http://${config.server.host}:${config.server.port}
    📚 API Documentation: http://${config.server.host}:${config.server.port}/docs
    💾 Database: PostgreSQL Connected
    📮 Redis: Connected
    📦 MinIO: Connected
    `);

  } catch (error) {
    logger.error(error, 'Failed to start server');
    process.exit(1);
  }
}

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

const signals = ['SIGINT', 'SIGTERM', 'SIGUSR2'];

signals.forEach((signal) => {
  process.on(signal, async () => {
    logger.info(`Received ${signal}, shutting down gracefully...`);

    try {
      await prisma.$disconnect();
      await redis.quit();
      logger.info('Connections closed successfully');
      process.exit(0);
    } catch (error) {
      logger.error(error, 'Error during shutdown');
      process.exit(1);
    }
  });
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.fatal(error, 'Uncaught Exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.fatal({ reason, promise }, 'Unhandled Rejection');
  process.exit(1);
});

// Start the server
start();
