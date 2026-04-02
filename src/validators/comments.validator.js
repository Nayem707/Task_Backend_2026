/**
 * Comments validation schemas
 * Validates user input for comments and replies endpoints using Joi
 */

const Joi = require("joi");

/**
 * Create comment/reply validation schema
 */
const createCommentSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required().trim().messages({
    "string.min": "Comment content cannot be empty",
    "string.max": "Comment content cannot be longer than 2000 characters",
    "any.required": "Comment content is required",
  }),
});

/**
 * Update comment validation schema
 */
const updateCommentSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required().trim().messages({
    "string.min": "Comment content cannot be empty",
    "string.max": "Comment content cannot be longer than 2000 characters",
    "any.required": "Comment content is required",
  }),
});

module.exports = {
  createCommentSchema,
  updateCommentSchema,
};
