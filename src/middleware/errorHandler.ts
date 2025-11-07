import { Request, Response, NextFunction } from 'express';
import logger from '../services/logger';
import errorTracker from '../services/errorTracker';

// -----------------------------------------------------------------------------
// 🧩 Custom Error Class
// -----------------------------------------------------------------------------
export class CustomError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// -----------------------------------------------------------------------------
// 🧩 Async Handler Wrapper (for async route controllers)
// -----------------------------------------------------------------------------
export const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// -----------------------------------------------------------------------------
// 🧩 Centralized Error Handler
// -----------------------------------------------------------------------------
export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  let statusCode = error.statusCode || 500;

  // 🔹 Handle known Mongoose & JWT errors gracefully
  if (err.name === 'CastError') {
    error = { ...error, message: 'Resource not found', statusCode: 404 };
    statusCode = 404;
  }

  if (err.name === 'MongoError' && (err as any).code === 11000) {
    error = { ...error, message: 'Duplicate field value entered', statusCode: 400 };
    statusCode = 400;
  }

  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors)
      .map((val: any) => val.message)
      .join(', ');
    error = { ...error, message, statusCode: 400 };
    statusCode = 400;
  }

  if (err.name === 'JsonWebTokenError') {
    error = { ...error, message: 'Invalid token', statusCode: 401 };
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error = { ...error, message: 'Token expired', statusCode: 401 };
    statusCode = 401;
  }

  // 🔹 Track & log error with context
  const errorId = errorTracker.trackError(err, req, { statusCode });
  const context = logger.createRequestContext(req, {
    statusCode,
    errorId,
    userAction: 'error_occurred',
  });

  logger.error(`${err.name}: ${error.message}`, err, context, {
    errorId,
    isOperational: error.isOperational,
    originalError: err.name,
  });

  // 🔹 User-friendly message
  let userMessage = error.message || 'Server Error';
  if (process.env.NODE_ENV === 'production' && statusCode >= 500) {
    userMessage = 'Internal Server Error';
  }

  const errorResponse: any = {
    success: false,
    error: userMessage,
    errorId,
  };

  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = {
      name: err.name,
      originalMessage: err.message,
    };
  }

  res.status(statusCode).json(errorResponse);
};

// -----------------------------------------------------------------------------
// 🧩 Validation Error Handler (express-validator)
// -----------------------------------------------------------------------------
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  next();
};

// -----------------------------------------------------------------------------
// 🧩 Audit Logger Middleware
// -----------------------------------------------------------------------------
export const auditLogger = (action: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const context = logger.createRequestContext(req, { userAction: action });
    logger.logUserAction(action, req, {
      timestamp: new Date().toISOString(),
      success: true,
    });
    next();
  };
};

// -----------------------------------------------------------------------------
// 🧩 404 Not Found Handler
// -----------------------------------------------------------------------------
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: `Not Found - ${req.originalUrl}`,
  });
};

// -----------------------------------------------------------------------------
// 🧩 Global Error Handler Wrapper
// -----------------------------------------------------------------------------
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Simply delegate to your centralized handler above
  return errorHandler(err, req, res, next);
};
