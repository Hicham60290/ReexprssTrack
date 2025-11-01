import { FastifyRequest } from 'fastify';
import { ZodSchema } from 'zod';
import { ValidationError } from '@common/errors/custom-errors.js';

export function validateBody<T>(schema: ZodSchema<T>) {
  return async (request: FastifyRequest) => {
    try {
      request.body = schema.parse(request.body);
    } catch (error) {
      throw error;
    }
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return async (request: FastifyRequest) => {
    try {
      request.query = schema.parse(request.query);
    } catch (error) {
      throw error;
    }
  };
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return async (request: FastifyRequest) => {
    try {
      request.params = schema.parse(request.params);
    } catch (error) {
      throw error;
    }
  };
}
