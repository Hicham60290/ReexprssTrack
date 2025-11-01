import Redis from 'ioredis';
import { config } from '@config/index.js';
import { logger } from '@common/utils/logger.js';

export const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('error', (error) => {
  logger.error({ error }, 'Redis error');
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await redis.quit();
  logger.info('Redis disconnected');
});

// Cache helper functions
export const cacheService = {
  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error({ error, key }, 'Cache get error');
      return null;
    }
  },

  /**
   * Set value in cache with optional TTL (in seconds)
   */
  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      if (ttl) {
        await redis.setex(key, ttl, stringValue);
      } else {
        await redis.set(key, stringValue);
      }
    } catch (error) {
      logger.error({ error, key }, 'Cache set error');
    }
  },

  /**
   * Delete key from cache
   */
  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error({ error, key }, 'Cache delete error');
    }
  },

  /**
   * Delete multiple keys matching pattern
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      logger.error({ error, pattern }, 'Cache delete pattern error');
    }
  },

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error({ error, key }, 'Cache exists error');
      return false;
    }
  },
};
