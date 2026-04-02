const express = require("express");
const MessagesController = require("../controllers/messages.controller");
const { authenticate } = require("../middlewares/auth");

const router = express.Router();
const messagesController = new MessagesController();

router.get("/conversations", authenticate, messagesController.getConversations);
router.get("/:userId", authenticate, messagesController.getConversation);
router.post("/:userId", authenticate, messagesController.sendMessage);
router.patch("/:id/read", authenticate, messagesController.markAsRead);

module.exports = router;
