const MessagesService = require("../services/messages.service");
const { asyncHandler } = require("../middlewares/errorHandler");
const { emitMessage } = require("../socket");
const Joi = require("joi");

const sendMessageSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
});

class MessagesController {
  constructor() {
    this.messagesService = new MessagesService();
  }

  getConversations = asyncHandler(async (req, res) => {
    const conversations = await this.messagesService.getRecentConversations(
      req.user.id,
    );
    res.sendSuccess(conversations, "Conversations retrieved successfully");
  });

  getConversation = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const cursor = req.query.cursor || undefined;
    const limit = parseInt(req.query.limit) || 20;
    const result = await this.messagesService.getConversation(
      req.user.id,
      userId,
      { cursor, limit },
    );
    res.sendSuccess(result, "Messages retrieved successfully");
  });

  sendMessage = asyncHandler(async (req, res) => {
    const { error, value } = sendMessageSchema.validate(req.body);
    if (error) return res.sendValidationError(error.details);
    const message = await this.messagesService.sendMessage(
      req.user.id,
      req.params.userId,
      value.content,
    );
    // Push to recipient in real-time
    emitMessage(req.params.userId, message);
    res.status(201).json({
      success: true,
      statusCode: 201,
      data: message,
      message: "Message sent successfully",
    });
  });

  markAsRead = asyncHandler(async (req, res) => {
    const msg = await this.messagesService.markAsRead(
      req.params.id,
      req.user.id,
    );
    res.sendSuccess(msg, "Message marked as read");
  });
}

module.exports = MessagesController;
