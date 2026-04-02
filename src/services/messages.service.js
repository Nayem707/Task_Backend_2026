const MessagesRepository = require("../repositories/messages.repository");
const {
  NotFoundError,
  AuthorizationError,
} = require("../middlewares/errorHandler");
const UsersRepository = require("../repositories/users.repository");
const logger = require("../utils/logger");

class MessagesService {
  constructor() {
    this.messagesRepository = new MessagesRepository();
    this.usersRepository = new UsersRepository();
  }

  async sendMessage(senderId, receiverId, content) {
    if (senderId === receiverId) {
      throw new AuthorizationError("You cannot message yourself");
    }
    const receiver = await this.usersRepository.findById(receiverId);
    if (!receiver) throw new NotFoundError("User");

    const message = await this.messagesRepository.sendMessage(
      senderId,
      receiverId,
      content,
    );
    logger.info("Message sent", {
      messageId: message.id,
      senderId,
      receiverId,
    });
    return message;
  }

  async getConversation(userId, otherId, options) {
    const other = await this.usersRepository.findById(otherId);
    if (!other) throw new NotFoundError("User");
    return this.messagesRepository.getConversation(userId, otherId, options);
  }

  async getRecentConversations(userId) {
    return this.messagesRepository.getRecentConversations(userId);
  }

  async markAsRead(messageId, userId) {
    const msg = await this.messagesRepository.markAsRead(messageId, userId);
    if (!msg) throw new NotFoundError("Message");
    return msg;
  }
}

module.exports = MessagesService;
