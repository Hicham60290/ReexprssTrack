// src/server.ts

import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import multipart from '@fastify/multipart'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'

import { config } from './config/index.js'
import { prisma } from './common/database/prisma.js'
import { redis } from './common/cache/redis.js'
import { errorHandler } from './common/errors/handler.js'
import { authenticate } from './common/middleware/auth.js'

// Importation des routes
import { authRoutes } from './modules/auth/auth.routes.js'
import { packagesRoutes } from './modules/packages/packages.routes.js'
import { quotesRoutes } from './modules/quotes/quotes.routes.js'
import { usersRoutes } from './modules/users/users.routes.js'
import { adminRoutes } from './modules/admin/admin.routes.js'

async function buildServer() {
  const app = Fastify({
    logger: {
      level: config.logLevel,
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname'
        }
      }
    }
  })

  // ===========================
  // PLUGINS
  // ===========================

  // CORS
  await app.register(cors, {
    origin: config.corsOrigin,
    credentials: true
  })

  // Helmet (Sécurité)
  await app.register(helmet, {
    contentSecurityPolicy: false
  })

  // JWT
  await app.register(jwt, {
    secret: config.jwtSecret,
    sign: {
      expiresIn: '15m'
    }
  })

  // Rate Limiting
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    redis: redis
  })

  // Multipart (Upload de fichiers)
  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 10
    }
  })

  // Swagger Documentation
  if (config.nodeEnv === 'development') {
    await app.register(swagger, {
      swagger: {
        info: {
          title: 'ReExpressTrack API',
          description: 'API Documentation pour ReExpressTrack',
          version: '1.0.0'
        },
        host: `localhost:${config.port}`,
        schemes: ['http', 'https'],
        consumes: ['application/json', 'multipart/form-data'],
        produces: ['application/json'],
        securityDefinitions: {
          Bearer: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header'
          }
        }
      }
    })

    await app.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false
      }
    })
  }

  // ===========================
  // DÉCORATEURS
  // ===========================

  // Ajouter Prisma et Redis à l'instance Fastify
  app.decorate('prisma', prisma)
  app.decorate('redis', redis)
  app.decorate('authenticate', authenticate)

  // ===========================
  // HOOKS
  // ===========================

  // Hook de pré-validation pour logger les requêtes
  app.addHook('preValidation', async (request, reply) => {
    request.log.info({
      url: request.url,
      method: request.method,
      ip: request.ip
    })
  })

  // Hook pour ajouter le temps de traitement dans les headers
  app.addHook('onRequest', async (request, reply) => {
    request.startTime = Date.now()
  })

  app.addHook('onSend', async (request, reply) => {
    const duration = Date.now() - request.startTime
    reply.header('X-Response-Time', `${duration}ms`)
  })

  // ===========================
  // ROUTES
  // ===========================

  // Health check
  app.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  })

  // Routes API v1
  await app.register(async (api) => {
    // Auth
    await api.register(authRoutes, { prefix: '/auth' })

    // Packages
    await api.register(packagesRoutes, { prefix: '/packages' })

    // Quotes
    await api.register(quotesRoutes, { prefix: '/quotes' })

    // Users
    await api.register(usersRoutes, { prefix: '/users' })

    // Admin
    await api.register(adminRoutes, { prefix: '/admin' })
  }, { prefix: '/api/v1' })

  // 404 Handler
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      success: false,
      error: 'Route non trouvée',
      path: request.url
    })
  })

  // ===========================
  // ERROR HANDLER
  // ===========================

  app.setErrorHandler(errorHandler)

  return app
}

async function start() {
  try {
    const app = await buildServer()

    // Démarrage du serveur
    await app.listen({
      port: config.port,
      host: config.host
    })

    console.log(`
    🚀 ReExpressTrack Backend démarré avec succès!
    
    📝 Environnement: ${config.nodeEnv}
    🌐 Serveur: http://${config.host}:${config.port}
    📚 Documentation: http://${config.host}:${config.port}/docs
    💾 Database: Connected to PostgreSQL
    📮 Redis: Connected
    `)

    // Graceful shutdown
    const signals = ['SIGINT', 'SIGTERM']
    signals.forEach((signal) => {
      process.on(signal, async () => {
        console.log(`\n⏹️  Signal ${signal} reçu, arrêt du serveur...`)
        
        await app.close()
        await prisma.$disconnect()
        await redis.quit()
        
        console.log('👋 Serveur arrêté proprement')
        process.exit(0)
      })
    })

  } catch (error) {
    console.error('❌ Erreur au démarrage du serveur:', error)
    process.exit(1)
  }
}

// Lancement du serveur
start()


// src/config/index.ts

import dotenv from 'dotenv'

dotenv.config()

export const config = {
  // Environment
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Server
  host: process.env.HOST || '0.0.0.0',
  port: parseInt(process.env.PORT || '3000', 10),
  
  // Database
  databaseUrl: process.env.DATABASE_URL!,
  
  // Redis
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
  redisPassword: process.env.REDIS_PASSWORD,
  
  // JWT
  jwtSecret: process.env.JWT_SECRET!,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  
  // MinIO (S3)
  minioEndpoint: process.env.MINIO_ENDPOINT || 'localhost',
  minioPort: parseInt(process.env.MINIO_PORT || '9000', 10),
  minioAccessKey: process.env.MINIO_ACCESS_KEY!,
  minioSecretKey: process.env.MINIO_SECRET_KEY!,
  minioBucket: process.env.MINIO_BUCKET || 'reexpresstrack',
  
  // Email
  smtpHost: process.env.SMTP_HOST!,
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER!,
  smtpPass: process.env.SMTP_PASS!,
  emailFrom: process.env.EMAIL_FROM || 'noreply@reexpresstrack.com',
  
  // 17Track API
  track17ApiKey: process.env.TRACK17_API_KEY!,
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info'
}

// Validation de la configuration
function validateConfig() {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'STRIPE_SECRET_KEY',
    'MINIO_ACCESS_KEY',
    'MINIO_SECRET_KEY',
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASS',
    'TRACK17_API_KEY'
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Configuration manquante: ${missing.join(', ')}\n` +
      'Veuillez vérifier votre fichier .env'
    )
  }
}

validateConfig()


// src/common/database/prisma.ts

import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
  errorFormat: 'pretty'
})


// src/common/cache/redis.ts

import Redis from 'ioredis'
import { config } from '../../config/index.js'

export const redis = new Redis({
  host: config.redisHost,
  port: config.redisPort,
  password: config.redisPassword,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000)
    return delay
  }
})

redis.on('connect', () => {
  console.log('✅ Redis connecté')
})

redis.on('error', (err) => {
  console.error('❌ Erreur Redis:', err)
})


// src/common/middleware/auth.ts

import { FastifyRequest, FastifyReply } from 'fastify'
import { UnauthorizedError } from '../errors/index.js'

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify()
  } catch (error) {
    throw new UnauthorizedError('Token invalide ou expiré')
  }
}

export async function requireAdmin(
  request: any,
  reply: FastifyReply
) {
  await authenticate(request, reply)
  
  if (request.user.role !== 'ADMIN' && request.user.role !== 'SUPER_ADMIN') {
    throw new UnauthorizedError('Accès réservé aux administrateurs')
  }
}


// src/common/errors/index.ts

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, code?: string) {
    super(message, 400, code)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Non autorisé', code?: string) {
    super(message, 401, code)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Accès interdit', code?: string) {
    super(message, 403, code)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Ressource non trouvée', code?: string) {
    super(message, 404, code)
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code?: string) {
    super(message, 409, code)
  }
}


// src/common/errors/handler.ts

import { FastifyRequest, FastifyReply } from 'fastify'
import { AppError } from './index.js'
import { ZodError } from 'zod'

export function errorHandler(
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Log de l'erreur
  request.log.error(error)

  // Erreur personnalisée
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      success: false,
      error: error.message,
      code: error.code
    })
  }

  // Erreur de validation Zod
  if (error instanceof ZodError) {
    return reply.status(400).send({
      success: false,
      error: 'Validation échouée',
      details: error.errors
    })
  }

  // Erreur JWT
  if (error.name === 'JsonWebTokenError') {
    return reply.status(401).send({
      success: false,
      error: 'Token invalide'
    })
  }

  // Erreur par défaut
  return reply.status(500).send({
    success: false,
    error: 'Erreur interne du serveur'
  })
}
