// src/modules/auth/auth.service.ts

import { FastifyRequest } from 'fastify'
import bcrypt from 'bcryptjs'
import { prisma } from '../../common/database/prisma.js'
import { redis } from '../../common/cache/redis.js'
import { BadRequestError, UnauthorizedError } from '../../common/errors/index.js'
import type { RegisterDto, LoginDto, TokenPair } from './auth.dto.js'

export class AuthService {
  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(data: RegisterDto): Promise<{ user: any; tokens: TokenPair }> {
    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      throw new BadRequestError('Cet email est déjà utilisé')
    }

    // Hash du mot de passe
    const passwordHash = await bcrypt.hash(data.password, 12)

    // Créer l'utilisateur et son profil en transaction
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        profile: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            address: data.address,
            postalCode: data.postalCode,
            city: data.city,
            territory: data.territory
          }
        },
        frenchAddresses: {
          create: {
            addressLine1: '12 Rue de la Réexpédition',
            addressLine2: `Casier ${this.generateCasierNumber()}`,
            postalCode: '75001',
            city: 'Paris',
            referenceCode: await this.generateReferenceCode(data.email)
          }
        }
      },
      include: {
        profile: true,
        frenchAddresses: true
      }
    })

    // Générer les tokens
    const tokens = await this.generateTokenPair(user.id, user.role)

    // Log d'audit
    await this.createAuditLog({
      userId: user.id,
      action: 'USER_REGISTERED',
      metadata: { email: user.email }
    })

    return {
      user: this.sanitizeUser(user),
      tokens
    }
  }

  /**
   * Connexion d'un utilisateur
   */
  async login(data: LoginDto): Promise<{ user: any; tokens: TokenPair }> {
    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        profile: true,
        frenchAddresses: {
          where: { isActive: true },
          take: 1
        }
      }
    })

    if (!user) {
      throw new UnauthorizedError('Email ou mot de passe incorrect')
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash)

    if (!isPasswordValid) {
      throw new UnauthorizedError('Email ou mot de passe incorrect')
    }

    // Générer les tokens
    const tokens = await this.generateTokenPair(user.id, user.role)

    // Log d'audit
    await this.createAuditLog({
      userId: user.id,
      action: 'USER_LOGIN',
      metadata: { email: user.email }
    })

    return {
      user: this.sanitizeUser(user),
      tokens
    }
  }

  /**
   * Rafraîchir les tokens
   */
  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    // Vérifier si le refresh token existe en Redis
    const userId = await redis.get(`refresh_token:${refreshToken}`)

    if (!userId) {
      throw new UnauthorizedError('Refresh token invalide ou expiré')
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new UnauthorizedError('Utilisateur non trouvé')
    }

    // Supprimer l'ancien refresh token
    await redis.del(`refresh_token:${refreshToken}`)

    // Générer de nouveaux tokens
    return this.generateTokenPair(user.id, user.role)
  }

  /**
   * Déconnexion
   */
  async logout(refreshToken: string): Promise<void> {
    // Supprimer le refresh token de Redis
    await redis.del(`refresh_token:${refreshToken}`)
  }

  /**
   * Générer une paire de tokens (access + refresh)
   */
  private async generateTokenPair(userId: string, role: string): Promise<TokenPair> {
    const accessToken = this.app.jwt.sign(
      { userId, role },
      { expiresIn: '15m' }
    )

    const refreshToken = this.app.jwt.sign(
      { userId, type: 'refresh' },
      { expiresIn: '7d' }
    )

    // Stocker le refresh token dans Redis avec expiration de 7 jours
    await redis.setex(
      `refresh_token:${refreshToken}`,
      7 * 24 * 60 * 60,
      userId
    )

    return { accessToken, refreshToken }
  }

  /**
   * Générer un numéro de casier unique
   */
  private generateCasierNumber(): string {
    return `REEX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
  }

  /**
   * Générer un code de référence unique basé sur l'email
   */
  private async generateReferenceCode(email: string): Promise<string> {
    const prefix = email.substring(0, 3).toUpperCase()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    const code = `${prefix}-${random}`

    // Vérifier l'unicité
    const existing = await prisma.frenchAddress.findUnique({
      where: { referenceCode: code }
    })

    if (existing) {
      // Récursif si le code existe déjà
      return this.generateReferenceCode(email)
    }

    return code
  }

  /**
   * Nettoyer les données utilisateur (retirer le hash du mot de passe)
   */
  private sanitizeUser(user: any) {
    const { passwordHash, ...sanitized } = user
    return sanitized
  }

  /**
   * Créer un log d'audit
   */
  private async createAuditLog(data: {
    userId: string
    action: string
    metadata?: any
  }) {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        metadata: data.metadata
      }
    })
  }

  // Référence à l'instance Fastify (injectée)
  constructor(private app: any) {}
}


// src/modules/auth/auth.routes.ts

import { FastifyInstance } from 'fastify'
import { AuthController } from './auth.controller.js'
import { registerSchema, loginSchema, refreshSchema } from './auth.schema.js'

export async function authRoutes(app: FastifyInstance) {
  const controller = new AuthController(app)

  // Inscription
  app.post('/register', {
    schema: registerSchema,
    handler: controller.register.bind(controller)
  })

  // Connexion
  app.post('/login', {
    schema: loginSchema,
    handler: controller.login.bind(controller)
  })

  // Rafraîchir les tokens
  app.post('/refresh', {
    schema: refreshSchema,
    handler: controller.refresh.bind(controller)
  })

  // Déconnexion
  app.post('/logout', {
    onRequest: [app.authenticate],
    handler: controller.logout.bind(controller)
  })

  // Obtenir le profil de l'utilisateur connecté
  app.get('/me', {
    onRequest: [app.authenticate],
    handler: controller.me.bind(controller)
  })
}


// src/modules/auth/auth.controller.ts

import { FastifyRequest, FastifyReply } from 'fastify'
import { AuthService } from './auth.service.js'
import type { RegisterDto, LoginDto } from './auth.dto.js'

export class AuthController {
  private service: AuthService

  constructor(private app: any) {
    this.service = new AuthService(app)
  }

  async register(
    request: FastifyRequest<{ Body: RegisterDto }>,
    reply: FastifyReply
  ) {
    const result = await this.service.register(request.body)
    
    return reply.status(201).send({
      success: true,
      message: 'Inscription réussie',
      data: result
    })
  }

  async login(
    request: FastifyRequest<{ Body: LoginDto }>,
    reply: FastifyReply
  ) {
    const result = await this.service.login(request.body)
    
    return reply.send({
      success: true,
      message: 'Connexion réussie',
      data: result
    })
  }

  async refresh(
    request: FastifyRequest<{ Body: { refreshToken: string } }>,
    reply: FastifyReply
  ) {
    const tokens = await this.service.refreshTokens(request.body.refreshToken)
    
    return reply.send({
      success: true,
      data: tokens
    })
  }

  async logout(
    request: FastifyRequest<{ Body: { refreshToken: string } }>,
    reply: FastifyReply
  ) {
    await this.service.logout(request.body.refreshToken)
    
    return reply.send({
      success: true,
      message: 'Déconnexion réussie'
    })
  }

  async me(request: any, reply: FastifyReply) {
    const userId = request.user.userId

    const user = await this.app.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        frenchAddresses: {
          where: { isActive: true }
        }
      }
    })

    return reply.send({
      success: true,
      data: user
    })
  }
}


// src/modules/auth/auth.dto.ts

import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
    ),
  firstName: z.string().min(2, 'Prénom trop court'),
  lastName: z.string().min(2, 'Nom trop court'),
  phone: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  territory: z.string().optional()
})

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis')
})

export type RegisterDto = z.infer<typeof registerSchema>
export type LoginDto = z.infer<typeof loginSchema>

export interface TokenPair {
  accessToken: string
  refreshToken: string
}


// src/modules/auth/auth.schema.ts (pour Swagger)

export const registerSchema = {
  description: 'Inscription d\'un nouvel utilisateur',
  tags: ['Auth'],
  body: {
    type: 'object',
    required: ['email', 'password', 'firstName', 'lastName'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8 },
      firstName: { type: 'string', minLength: 2 },
      lastName: { type: 'string', minLength: 2 },
      phone: { type: 'string' },
      address: { type: 'string' },
      postalCode: { type: 'string' },
      city: { type: 'string' },
      territory: { type: 'string' }
    }
  },
  response: {
    201: {
      description: 'Succès',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            user: { type: 'object' },
            tokens: {
              type: 'object',
              properties: {
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }
}

export const loginSchema = {
  description: 'Connexion d\'un utilisateur',
  tags: ['Auth'],
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' }
    }
  },
  response: {
    200: {
      description: 'Succès',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            user: { type: 'object' },
            tokens: {
              type: 'object',
              properties: {
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }
}

export const refreshSchema = {
  description: 'Rafraîchir les tokens',
  tags: ['Auth'],
  body: {
    type: 'object',
    required: ['refreshToken'],
    properties: {
      refreshToken: { type: 'string' }
    }
  }
}
