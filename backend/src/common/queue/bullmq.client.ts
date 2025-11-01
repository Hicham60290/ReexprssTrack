import { Queue, Worker, QueueEvents } from 'bullmq';
import { config } from '@config/index.js';
import { logger } from '@common/utils/logger.js';

const connection = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password || undefined,
};

// Email Queue
export const emailQueue = new Queue('email', { connection });

// Tracking Queue (for 17Track updates)
export const trackingQueue = new Queue('tracking', { connection });

// Notification Queue
export const notificationQueue = new Queue('notification', { connection });

// Storage Fee Calculation Queue
export const storageFeeQueue = new Queue('storage-fee', { connection });

// Queue Events for monitoring
const emailQueueEvents = new QueueEvents('email', { connection });
const trackingQueueEvents = new QueueEvents('tracking', { connection });

emailQueueEvents.on('completed', ({ jobId }) => {
  logger.info({ jobId }, 'Email job completed');
});

emailQueueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error({ jobId, failedReason }, 'Email job failed');
});

trackingQueueEvents.on('completed', ({ jobId }) => {
  logger.info({ jobId }, 'Tracking job completed');
});

trackingQueueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error({ jobId, failedReason }, 'Tracking job failed');
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await emailQueue.close();
  await trackingQueue.close();
  await notificationQueue.close();
  await storageFeeQueue.close();
  await emailQueueEvents.close();
  await trackingQueueEvents.close();
  logger.info('Queues closed');
});

// Queue job types
export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface TrackingJobData {
  packageId: string;
  trackingNumber: string;
}

export interface NotificationJobData {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}

export interface StorageFeeJobData {
  packageId: string;
}

export const queueService = {
  /**
   * Add email to queue
   */
  async sendEmail(data: EmailJobData) {
    await emailQueue.add('send-email', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  },

  /**
   * Add tracking update to queue
   */
  async updateTracking(data: TrackingJobData) {
    await trackingQueue.add('update-tracking', data, {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });
  },

  /**
   * Add notification to queue
   */
  async sendNotification(data: NotificationJobData) {
    await notificationQueue.add('send-notification', data);
  },

  /**
   * Calculate storage fee for package
   */
  async calculateStorageFee(data: StorageFeeJobData) {
    await storageFeeQueue.add('calculate-fee', data);
  },

  /**
   * Schedule recurring tracking updates
   */
  async scheduleTrackingUpdates() {
    await trackingQueue.add(
      'schedule-updates',
      {},
      {
        repeat: {
          pattern: '0 */6 * * *', // Every 6 hours
        },
      }
    );
  },

  /**
   * Schedule storage fee calculations
   */
  async scheduleStorageFeeCalculations() {
    await storageFeeQueue.add(
      'schedule-calculations',
      {},
      {
        repeat: {
          pattern: '0 0 * * *', // Daily at midnight
        },
      }
    );
  },
};
