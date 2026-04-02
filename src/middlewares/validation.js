/**
 * Validation Middleware
 * Handles request validation using Joi schemas
 */

const logger = require("../utils/logger");

/**
 * Validate request data against Joi schema
 * @param {Object} schema - Joi validation schema
 * @param {any} data - Data to validate
 * @returns {Object} Validation result
 */
function validateRequest(schema, data) {
  try {
    const { error, value } = schema.validate(data, {
      abortEarly: false, // Return all errors
      stripUnknown: true, // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
        type: detail.type,
      }));

      return {
        isValid: false,
        errors,
        value: null,
      };
    }

    return {
      isValid: true,
      errors: [],
      value,
    };
  } catch (err) {
    logger.error("Validation error:", err);
    return {
      isValid: false,
      errors: [
        {
          field: "validation",
          message: "Internal validation error",
          type: "internal",
        },
      ],
      value: null,
    };
  }
}

/**
 * Express middleware factory for request validation
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Request property to validate ('body', 'query', 'params')
 * @returns {Function} Express middleware function
 */
function validateMiddleware(schema, property = "body") {
  return (req, res, next) => {
    const data = req[property];
    const validation = validateRequest(schema, data);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        statusCode: 400,
        data: null,
        errors: validation.errors,
        timestamp: new Date().toISOString(),
      });
    }

    // Replace the property with validated and sanitized data
    req[property] = validation.value;
    next();
  };
}

/**
 * Validate body middleware
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
function validateBody(schema) {
  return validateMiddleware(schema, "body");
}

/**
 * Validate query middleware
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
function validateQuery(schema) {
  return validateMiddleware(schema, "query");
}

/**
 * Validate params middleware
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
function validateParams(schema) {
  return validateMiddleware(schema, "params");
}

module.exports = {
  validateMiddleware,
  validateRequest,
  validateParams,
  validateQuery,
  validateBody,
};
