const Joi = require("joi");

const createStorySchema = Joi.object({
  mediaUrl: Joi.string()
    .required()
    .messages({ "any.required": "Media URL is required" }),
  caption: Joi.string().max(500).optional().allow("", null),
});

const storyReactionSchema = Joi.object({
  reaction: Joi.string()
    .min(1)
    .max(10)
    .required()
    .messages({ "any.required": "Reaction is required" }),
});

module.exports = { createStorySchema, storyReactionSchema };
