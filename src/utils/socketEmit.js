/**
 * Thin re-export of Socket.IO emit helpers.
 * Used by notificationHelper to avoid circular-dependency at module load time
 * (notificationHelper is loaded before Socket.IO is initialised).
 * Each helper guards against the IO not being ready yet.
 */
const { emitNotification, emitMessage } = require("../socket");

module.exports = { emitNotification, emitMessage };
