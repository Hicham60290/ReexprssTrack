import pino from 'pino';
import { config } from '@config/index.js';

export const logger = pino({
  level: config.logging.level,
  transport:
    config.isDevelopment
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  base: {
    env: config.env,
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
});
