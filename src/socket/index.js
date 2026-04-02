/**
 * Socket.IO server
 *
 * Events emitted TO clients:
 *   "new_message"        – { message }   private DM received
 *   "new_notification"   – { notification } new notification received
 *
 * Events received FROM clients:
 *   "join"               – client joins its own user room on connect
 *   "typing"             – { toUserId }  typing indicator for DMs
 *   "stop_typing"        – { toUserId }  stop typing indicator
 */

const { Server } = require("socket.io");
const { verifyAccessToken } = require("../utils/jwt");
const logger = require("../utils/logger");
const config = require("../config");

let io = null;

/**
 * Initialise Socket.IO on top of an existing HTTP server.
 * Call once from App.start().
 *
 * @param {http.Server} httpServer
 * @returns {import("socket.io").Server}
 */
function initSocket(httpServer) {
  const allowedOrigins = config.CORS_ORIGIN.split(",");

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // ── JWT authentication middleware ──────────────────────────────────────────
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) return next(new Error("Authentication required"));

      const decoded = verifyAccessToken(token);
      socket.userId = decoded.id;
      socket.userEmail = decoded.email;
      return next();
    } catch (err) {
      return next(new Error("Invalid or expired token"));
    }
  });

  // ── Connection handler ─────────────────────────────────────────────────────
  io.on("connection", (socket) => {
    const userId = socket.userId;
    logger.info(`Socket connected: user=${userId} socket=${socket.id}`);

    // Each authenticated user has a private room named by their user ID.
    // Server emits to this room to push messages/notifications to that user.
    socket.join(userId);

    // ── Typing indicators ────────────────────────────────────────────────────
    socket.on("typing", ({ toUserId }) => {
      if (!toUserId) return;
      socket.to(toUserId).emit("typing", { fromUserId: userId });
    });

    socket.on("stop_typing", ({ toUserId }) => {
      if (!toUserId) return;
      socket.to(toUserId).emit("stop_typing", { fromUserId: userId });
    });

    socket.on("disconnect", (reason) => {
      logger.info(`Socket disconnected: user=${userId} reason=${reason}`);
    });
  });

  logger.info("Socket.IO initialised");
  return io;
}

/**
 * Return the Socket.IO instance (must call initSocket first).
 * @returns {import("socket.io").Server}
 */
function getIO() {
  if (!io) throw new Error("Socket.IO not initialised — call initSocket first");
  return io;
}

/**
 * Emit a new_message event to the recipient's private room.
 *
 * @param {string} recipientId  - user ID of the message recipient
 * @param {object} message      - the full message object to push
 */
function emitMessage(recipientId, message) {
  try {
    getIO().to(recipientId).emit("new_message", { message });
  } catch (err) {
    logger.error("emitMessage failed:", err);
  }
}

/**
 * Emit a new_notification event to the recipient's private room.
 *
 * @param {string} recipientId    - user ID of the notification recipient
 * @param {object} notification   - the full notification object to push
 */
function emitNotification(recipientId, notification) {
  try {
    getIO().to(recipientId).emit("new_notification", { notification });
  } catch (err) {
    logger.error("emitNotification failed:", err);
  }
}

module.exports = { initSocket, getIO, emitMessage, emitNotification };
