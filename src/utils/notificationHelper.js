const { getPrismaClient } = require("../config/database");
const logger = require("./logger");

const prisma = getPrismaClient();

/**
 * Create a notification record and push it to the recipient via Socket.IO.
 * Silently swallows errors so it never breaks the main request flow.
 *
 * @param {Object} opts
 * @param {string} opts.userId       - Recipient user ID
 * @param {string} opts.type         - NotificationType enum value
 * @param {string} [opts.referenceId]- Related entity ID
 * @param {string} [opts.content]    - Short description text
 */
async function createNotification({ userId, type, referenceId, content }) {
  try {
    const notification = await prisma.notification.create({
      data: { userId, type, referenceId, content },
    });

    // Push real-time notification to the recipient's socket room
    try {
      const { emitNotification } = require("./socketEmit");
      emitNotification(userId, notification);
    } catch (_) {
      // Socket not yet initialised or user offline — safe to ignore
    }
  } catch (err) {
    logger.error("Failed to create notification:", err);
  }
}

module.exports = { createNotification };
