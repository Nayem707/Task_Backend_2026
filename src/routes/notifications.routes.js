const express = require("express");
const NotificationsController = require("../controllers/notifications.controller");
const { authenticate } = require("../middlewares/auth");

const router = express.Router();
const notificationsController = new NotificationsController();

router.get("/", authenticate, notificationsController.getNotifications);
router.patch("/read-all", authenticate, notificationsController.markAllAsRead);
router.patch("/:id/read", authenticate, notificationsController.markAsRead);

module.exports = router;
