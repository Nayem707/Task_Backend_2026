/**
 * Likes validation schemas
 * Validates user input for likes endpoints using Joi
 */

const Joi = require("joi");

/**
 * ID validation schema (for route parameters)
 */
const idSchema = Joi.object({
  id: Joi.string().required().messages({
    "any.required": "ID is required",
  }),
});

module.exports = {
  idSchema,
};
