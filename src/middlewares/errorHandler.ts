import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';
import logger from '../utils/logger';
import config from '../config/config';

/**
 * Global error handling middleware
 * Handles all errors thrown in the application
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Handle ApiError instances
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // Handle Mongoose duplicate key error
  if ((err as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value entered';
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Log error
  logger.error(`[${statusCode}] ${message}`, {
    error: err.message,
    stack: config.env === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
  });

  // Send error response
  const response: any = {
    success: false,
    message,
  };

  // Include stack trace in development
  if (config.env === 'development') {
    response.error = err.message;
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * Handle 404 errors - route not found
 */
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`);
  next(error);
}; 