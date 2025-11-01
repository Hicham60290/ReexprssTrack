import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Server
  server: {
    host: process.env.HOST || '0.0.0.0',
    port: parseInt(process.env.PORT || '3000', 10),
  },

  // Database
  database: {
    url: process.env.DATABASE_URL || '',
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || '',
    refreshSecret: process.env.JWT_REFRESH_SECRET || '',
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d',
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  },

  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  },

  // MinIO
  minio: {
    endpoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000', 10),
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    bucket: process.env.MINIO_BUCKET || 'reexpresstrack',
    useSSL: process.env.MINIO_USE_SSL === 'true',
  },

  // Email
  email: {
    smtp: {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
    from: process.env.EMAIL_FROM || 'noreply@reexpresstrack.com',
  },

  // 17Track
  track17: {
    apiKey: process.env.TRACK17_API_KEY || '',
    apiUrl: 'https://api.17track.net/track/v2.2',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  // Frontend
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
  },

  // Storage fees (per day in EUR)
  storage: {
    freeStorageDays: 7,
    feePerDay: 0.50,
  },
};

// Validate critical config
if (config.isProduction) {
  if (!config.jwt.secret || config.jwt.secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
  if (!config.database.url) {
    throw new Error('DATABASE_URL is required in production');
  }
}
