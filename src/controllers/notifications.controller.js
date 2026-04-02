const NotificationsService = require("../services/notifications.service");
const { asyncHandler } = require("../middlewares/errorHandler");

class NotificationsController {
  constructor() {
    this.notificationsService = new NotificationsService();
  }

  getNotifications = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await this.notificationsService.getNotifications(
      req.user.id,
      { page, limit },
    );
    res.sendSuccess(result, "Notifications retrieved successfully");
  });

  markAsRead = asyncHandler(async (req, res) => {
    const result = await this.notificationsService.markAsRead(
      req.params.id,
      req.user.id,
    );
    res.sendSuccess(result, "Notification marked as read");
  });

  markAllAsRead = asyncHandler(async (req, res) => {
    const result = await this.notificationsService.markAllAsRead(req.user.id);
    res.sendSuccess(result, "All notifications marked as read");
  });
}

module.exports = NotificationsController;
