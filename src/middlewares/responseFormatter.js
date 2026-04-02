/**
 * Response formatter middleware
 * Standardizes all API responses and adds helper methods to res object
 */

const { successResponse, errorResponse } = require("../utils/apiResponse");
const logger = require("../utils/logger");

/**
 * Response formatter middleware
 * Adds standard response methods to Express response object
 */
const responseFormatter = (req, res, next) => {
  // Track response time
  const startTime = Date.now();

  /**
   * Send success response
   * @param {*} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code
   */
  res.sendSuccess = function (
    data = null,
    message = "Operation successful",
    statusCode = 200,
  ) {
    const response = successResponse(data, message, statusCode);

    // Log successful response
    const responseTime = Date.now() - startTime;
    logger.logRequest(req, res, responseTime);

    this.status(statusCode).json(response);
  };

  /**
   * Send error response
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {*} errors - Detailed error information
   */
  res.sendError = function (
    message = "Operation failed",
    statusCode = 500,
    errors = null,
  ) {
    const response = errorResponse(message, statusCode, errors);

    // Log error response
    const responseTime = Date.now() - startTime;
    logger.logRequest(req, res, responseTime);

    this.status(statusCode).json(response);
  };

  /**
   * Send validation error response
   * @param {Array} validationErrors - Array of validation errors
   */
  res.sendValidationError = function (validationErrors) {
    const errors = validationErrors.map((error) => ({
      field: error.path || error.field,
      message: error.message,
      value: error.value,
    }));

    this.sendError("Validation failed", 400, errors);
  };

  /**
   * Send pagination response
   * @param {Array} data - Array of items
   * @param {number} page - Current page number
   * @param {number} limit - Items per page
   * @param {number} total - Total number of items
   * @param {string} message - Success message
   */
  res.sendPagination = function (
    data,
    page,
    limit,
    total,
    message = "Data retrieved successfully",
  ) {
    const totalPages = Math.ceil(total / limit);

    const response = successResponse(
      {
        items: data,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          nextPage: page < totalPages ? page + 1 : null,
          prevPage: page > 1 ? page - 1 : null,
        },
      },
      message,
    );

    // Log successful response
    const responseTime = Date.now() - startTime;
    logger.logRequest(req, res, responseTime);

    this.status(200).json(response);
  };

  /**
   * Send created response (201)
   * @param {*} data - Created resource data
   * @param {string} message - Success message
   */
  res.sendCreated = function (data, message = "Resource created successfully") {
    this.sendSuccess(data, message, 201);
  };

  /**
   * Send accepted response (202)
   * @param {*} data - Response data
   * @param {string} message - Accepted message
   */
  res.sendAccepted = function (data, message = "Request accepted") {
    this.sendSuccess(data, message, 202);
  };

  /**
   * Send no content response (204)
   */
  res.sendNoContent = function () {
    // Log successful response
    const responseTime = Date.now() - startTime;
    logger.logRequest(req, res, responseTime);

    this.status(204).send();
  };

  /**
   * Send unauthorized response (401)
   * @param {string} message - Error message
   */
  res.sendUnauthorized = function (message = "Authentication required") {
    this.sendError(message, 401);
  };

  /**
   * Send forbidden response (403)
   * @param {string} message - Error message
   */
  res.sendForbidden = function (message = "Insufficient permissions") {
    this.sendError(message, 403);
  };

  /**
   * Send not found response (404)
   * @param {string} message - Error message
   */
  res.sendNotFound = function (message = "Resource not found") {
    this.sendError(message, 404);
  };

  /**
   * Send conflict response (409)
   * @param {string} message - Error message
   */
  res.sendConflict = function (message = "Resource already exists") {
    this.sendError(message, 409);
  };

  /**
   * Send rate limit response (429)
   * @param {string} message - Error message
   */
  res.sendRateLimit = function (message = "Too many requests") {
    this.sendError(message, 429);
  };

  /**
   * Send internal server error response (500)
   * @param {string} message - Error message
   */
  res.sendInternalError = function (message = "Internal server error") {
    this.sendError(message, 500);
  };

  next();
};

module.exports = {
  responseFormatter,
};
