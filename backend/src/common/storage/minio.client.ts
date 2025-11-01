import { Client } from 'minio';
import { config } from '@config/index.js';
import { logger } from '@common/utils/logger.js';
import { Readable } from 'stream';

export const minioClient = new Client({
  endPoint: config.minio.endpoint,
  port: config.minio.port,
  useSSL: config.minio.useSSL,
  accessKey: config.minio.accessKey,
  secretKey: config.minio.secretKey,
});

// Initialize bucket on startup
export async function initMinIO() {
  try {
    const bucketExists = await minioClient.bucketExists(config.minio.bucket);

    if (!bucketExists) {
      await minioClient.makeBucket(config.minio.bucket, 'eu-west-1');
      logger.info(`MinIO bucket '${config.minio.bucket}' created`);

      // Set public read policy for images (optional, adjust as needed)
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${config.minio.bucket}/*`],
          },
        ],
      };

      await minioClient.setBucketPolicy(config.minio.bucket, JSON.stringify(policy));
    }

    logger.info('MinIO initialized successfully');
  } catch (error) {
    logger.error({ error }, 'MinIO initialization error');
    throw error;
  }
}

export const storageService = {
  /**
   * Upload file to MinIO
   */
  async uploadFile(
    file: Buffer | Readable,
    fileName: string,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<string> {
    try {
      const objectName = `${Date.now()}-${fileName}`;

      await minioClient.putObject(
        config.minio.bucket,
        objectName,
        file,
        {
          'Content-Type': contentType,
          ...metadata,
        }
      );

      // Generate URL
      const url = await this.getFileUrl(objectName);
      return url;
    } catch (error) {
      logger.error({ error, fileName }, 'File upload error');
      throw error;
    }
  },

  /**
   * Get file URL
   */
  async getFileUrl(objectName: string): Promise<string> {
    try {
      // For public buckets, construct direct URL
      const protocol = config.minio.useSSL ? 'https' : 'http';
      return `${protocol}://${config.minio.endpoint}:${config.minio.port}/${config.minio.bucket}/${objectName}`;
    } catch (error) {
      logger.error({ error, objectName }, 'Get file URL error');
      throw error;
    }
  },

  /**
   * Get presigned URL for temporary access (7 days)
   */
  async getPresignedUrl(objectName: string, expirySeconds = 604800): Promise<string> {
    try {
      return await minioClient.presignedGetObject(
        config.minio.bucket,
        objectName,
        expirySeconds
      );
    } catch (error) {
      logger.error({ error, objectName }, 'Get presigned URL error');
      throw error;
    }
  },

  /**
   * Delete file from MinIO
   */
  async deleteFile(objectName: string): Promise<void> {
    try {
      await minioClient.removeObject(config.minio.bucket, objectName);
      logger.info({ objectName }, 'File deleted');
    } catch (error) {
      logger.error({ error, objectName }, 'File delete error');
      throw error;
    }
  },

  /**
   * Delete multiple files
   */
  async deleteFiles(objectNames: string[]): Promise<void> {
    try {
      await minioClient.removeObjects(config.minio.bucket, objectNames);
      logger.info({ count: objectNames.length }, 'Files deleted');
    } catch (error) {
      logger.error({ error }, 'Bulk file delete error');
      throw error;
    }
  },

  /**
   * Check if file exists
   */
  async fileExists(objectName: string): Promise<boolean> {
    try {
      await minioClient.statObject(config.minio.bucket, objectName);
      return true;
    } catch {
      return false;
    }
  },
};
