/**
 * Global error handling middleware
 * Centralizes error processing and provides consistent error responses
 */

const logger = require("../utils/logger");
const { errorResponse } = require("../utils/apiResponse");

/**
 * Global error handler middleware
 * Processes all errors and sends appropriate responses
 */
const globalErrorHandler = (error, req, res, next) => {
  // Default error values
  let statusCode = 500;
  let message = "Internal server error";
  let errors = null;

  // Log the error - use simplified logging for dev
  if (process.env.NODE_ENV === "dev") {
    // Use simplified logging for Prisma errors
    if (error.code && error.code.startsWith("P")) {
      logger.logPrismaError(error, `${req.method} ${req.originalUrl}`);
    } else {
      logger.error(`${error.message}`);
    }
  } else {
    // Full logging for production
    logger.error("Global error handler triggered:", {
      error: error.message,
      stack: error.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      userId: req.user?.id || "anonymous",
    });
  }

  // Handle specific error types
  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(error.errors).map((err) => ({
      field: err.path,
      message: err.message,
      value: err.value,
    }));
  }

  // Prisma errors
  else if (error.code && error.code.startsWith("P")) {
    statusCode = 400;

    switch (error.code) {
      case "P2002":
        message = "Duplicate entry found";
        const field = error.meta?.target?.[0] || "field";
        errors = [{ field, message: `${field} already exists` }];
        break;
      case "P2025":
        statusCode = 404;
        message = "Record not found";
        break;
      case "P2003":
        message = "Foreign key constraint violation";
        break;
      case "P2014":
        message = "Invalid relation data provided";
        break;
      default:
        message = "Database operation failed";
    }
  }

  // JWT errors
  else if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  } else if (error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  } else if (error.name === "NotBeforeError") {
    statusCode = 401;
    message = "Token not active";
  }

  // Custom application errors
  else if (error.statusCode) {
    statusCode = error.statusCode;
    message = error.message;
    errors = error.errors;
  }

  // Mongoose/MongoDB errors
  else if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // Joi validation errors
  else if (error.isJoi) {
    statusCode = 400;
    message = "Validation failed";
    errors = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
      value: detail.context?.value,
    }));
  }

  // Rate limiting errors
  else if (error.type === "RateLimitError") {
    statusCode = 429;
    message = "Too many requests, please try again later";
  }

  // File upload errors
  else if (error.code === "LIMITE_FILE_SIZE") {
    statusCode = 413;
    message = "File size too large";
  }

  // Network/timeout errors
  else if (error.code === "ECONNREFUSED") {
    statusCode = 503;
    message = "Service temporarily unavailable";
  } else if (error.code === "ETIMEDOUT") {
    statusCode = 408;
    message = "Request timeout";
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === "production" && statusCode === 500) {
    message = "Internal server error";
    errors = null;
  }

  // Send error response
  const response = errorResponse(message, statusCode, errors);
  res.status(statusCode).json(response);
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
  const message = `Route ${req.originalUrl} not found`;

  logger.warn("404 Not Found:", {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  const response = errorResponse(message, 404);
  res.status(404).json(response);
};

/**
 * Async error wrapper
 * Wraps async functions to catch errors automatically
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom error class for application-specific errors
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Custom error classes for specific scenarios
 */
class ValidationError extends AppError {
  constructor(errors) {
    super("Validation failed", 400, errors);
  }
}

class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401);
  }
}

class AuthorizationError extends AppError {
  constructor(message = "Insufficient permissions") {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404);
  }
}

class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409);
  }
}

class RateLimitError extends AppError {
  constructor(message = "Too many requests") {
    super(message, 429);
  }
}

module.exports = {
  globalErrorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
};
