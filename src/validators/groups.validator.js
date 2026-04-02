const Joi = require("joi");

const createGroupSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(1000).optional().allow("", null),
  visibility: Joi.string().valid("PUBLIC", "PRIVATE").default("PUBLIC"),
  avatarUrl: Joi.string().uri().optional().allow("", null),
  coverUrl: Joi.string().uri().optional().allow("", null),
});

const updateGroupSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().max(1000).optional().allow("", null),
  visibility: Joi.string().valid("PUBLIC", "PRIVATE").optional(),
}).min(1);

const updateRoleSchema = Joi.object({
  role: Joi.string().valid("MEMBER", "ADMIN").required(),
});

const groupPostSchema = Joi.object({
  content: Joi.string().min(1).max(5000).required(),
  imageUrl: Joi.string().uri().optional().allow("", null),
});

const groupCommentSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
});

module.exports = {
  createGroupSchema,
  updateGroupSchema,
  updateRoleSchema,
  groupPostSchema,
  groupCommentSchema,
};
