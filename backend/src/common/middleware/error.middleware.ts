import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '@common/errors/custom-errors.js';
import { logger } from '@common/utils/logger.js';
import { ZodError } from 'zod';

export async function errorHandler(
  error: FastifyError | AppError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Log error
  logger.error(
    {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      request: {
        method: request.method,
        url: request.url,
        params: request.params,
        query: request.query,
        ip: request.ip,
      },
    },
    'Request error'
  );

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return reply.status(422).send({
      statusCode: 422,
      error: 'Validation Error',
      message: 'Validation failed',
      errors: error.errors,
    });
  }

  // Handle custom AppErrors
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.name,
      message: error.message,
    });
  }

  // Handle Fastify errors
  if ('statusCode' in error && error.statusCode) {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.name || 'Error',
      message: error.message,
    });
  }

  // Default to 500 Internal Server Error
  return reply.status(500).send({
    statusCode: 500,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : error.message,
  });
}
