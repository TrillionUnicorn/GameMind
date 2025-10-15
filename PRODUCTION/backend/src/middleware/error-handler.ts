/**
 * Global Error Handler Middleware
 * Handles all errors and returns consistent error responses
 */

import type { Context } from 'hono';
import { ZodError } from 'zod';
import { getEnv, isDevelopment } from '../config/env';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super(400, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super(404, message);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(409, message);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation Error', public errors?: any) {
    super(422, message);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too Many Requests') {
    super(429, message);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error') {
    super(500, message);
  }
}

export function errorHandler(err: Error, c: Context) {
  // Log error
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: isDevelopment() ? err.stack : undefined,
    path: c.req.path,
    method: c.req.method,
  });

  // Zod validation errors
  if (err instanceof ZodError) {
    return c.json({
      error: 'Validation Error',
      message: 'Invalid request data',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    }, 422);
  }

  // Application errors
  if (err instanceof AppError) {
    const response: any = {
      error: err.name,
      message: err.message,
    };

    if (err instanceof ValidationError && err.errors) {
      response.details = err.errors;
    }

    return c.json(response, err.statusCode);
  }

  // Database errors
  if (err.message.includes('duplicate key')) {
    return c.json({
      error: 'Conflict',
      message: 'Resource already exists',
    }, 409);
  }

  if (err.message.includes('foreign key')) {
    return c.json({
      error: 'Bad Request',
      message: 'Invalid reference',
    }, 400);
  }

  // Default error response
  const statusCode = 500;
  const response: any = {
    error: 'Internal Server Error',
    message: isDevelopment() ? err.message : 'An unexpected error occurred',
  };

  if (isDevelopment()) {
    response.stack = err.stack;
  }

  return c.json(response, statusCode);
}

