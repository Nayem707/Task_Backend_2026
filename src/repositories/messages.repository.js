const { getPrismaClient } = require("../config/database");
const logger = require("../utils/logger");

const prisma = getPrismaClient();

const USER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
};

class MessagesRepository {
  async sendMessage(senderId, receiverId, content) {
    return prisma.message.create({
      data: { senderId, receiverId, content },
      include: {
        sender: { select: USER_SELECT },
        receiver: { select: USER_SELECT },
      },
    });
  }

  async getConversation(userA, userB, { cursor, limit = 20 } = {}) {
    const where = {
      OR: [
        { senderId: userA, receiverId: userB },
        { senderId: userB, receiverId: userA },
      ],
    };

    const messages = await prisma.message.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: USER_SELECT },
        receiver: { select: USER_SELECT },
      },
    });

    const hasNextPage = messages.length > limit;
    const items = hasNextPage ? messages.slice(0, limit) : messages;
    const nextCursor = hasNextPage ? items[items.length - 1].id : null;

    return { data: items, nextCursor };
  }

  async getRecentConversations(userId) {
    // Get the latest message per conversation partner
    const sent = await prisma.message.findMany({
      where: { senderId: userId },
      orderBy: { createdAt: "desc" },
      distinct: ["receiverId"],
      include: { receiver: { select: USER_SELECT } },
    });

    const received = await prisma.message.findMany({
      where: { receiverId: userId },
      orderBy: { createdAt: "desc" },
      distinct: ["senderId"],
      include: { sender: { select: USER_SELECT } },
    });

    // Merge and deduplicate by conversation partner
    const partnerMap = new Map();

    for (const msg of sent) {
      const partner = msg.receiver;
      if (
        !partnerMap.has(partner.id) ||
        msg.createdAt > partnerMap.get(partner.id).lastMessage.createdAt
      ) {
        partnerMap.set(partner.id, { partner, lastMessage: msg });
      }
    }
    for (const msg of received) {
      const partner = msg.sender;
      if (
        !partnerMap.has(partner.id) ||
        msg.createdAt > partnerMap.get(partner.id).lastMessage.createdAt
      ) {
        partnerMap.set(partner.id, { partner, lastMessage: msg });
      }
    }

    return Array.from(partnerMap.values()).sort(
      (a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt,
    );
  }

  async markAsRead(messageId, userId) {
    const msg = await prisma.message.findUnique({ where: { id: messageId } });
    if (!msg || msg.receiverId !== userId) return null;
    return prisma.message.update({
      where: { id: messageId },
      data: { status: "READ", readAt: new Date() },
    });
  }
}

module.exports = MessagesRepository;
