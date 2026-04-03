/**
 * Posts validation schemas
 * Validates user input for posts endpoints using Joi
 */

const Joi = require("joi");

/**
 * Create post validation schema
 */
const createPostSchema = Joi.object({
  content: Joi.string().min(1).max(5000).required().trim().messages({
    "string.min": "Post content cannot be empty",
    "string.max": "Post content cannot be longer than 5000 characters",
    "any.required": "Post content is required",
  }),

  imageUrl: Joi.string().uri().optional().messages({
    "string.uri": "Image URL must be a valid URL",
  }),

  images: Joi.array().items(Joi.string().uri()).max(10).optional().messages({
    "array.max": "You can upload at most 10 images per post",
  }),

  visibility: Joi.string()
    .valid("PUBLIC", "PRIVATE")
    .optional()
    .default("PUBLIC")
    .messages({
      "any.only": "Visibility must be either PUBLIC or PRIVATE",
    }),
});

/**
 * Update post validation schema
 */
const updatePostSchema = Joi.object({
  content: Joi.string().min(1).max(5000).optional().trim().messages({
    "string.min": "Post content cannot be empty",
    "string.max": "Post content cannot be longer than 5000 characters",
  }),

  imageUrl: Joi.string().uri().optional().allow(null).messages({
    "string.uri": "Image URL must be a valid URL",
  }),

  images: Joi.array().items(Joi.string().uri()).max(10).optional().messages({
    "array.max": "You can upload at most 10 images per post",
  }),

  visibility: Joi.string().valid("PUBLIC", "PRIVATE").optional().messages({
    "any.only": "Visibility must be either PUBLIC or PRIVATE",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

module.exports = {
  createPostSchema,
  updatePostSchema,
};
