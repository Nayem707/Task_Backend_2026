const NotificationsRepository = require("../repositories/notifications.repository");

class NotificationsService {
  constructor() {
    this.notificationsRepository = new NotificationsRepository();
  }

  async getNotifications(userId, options) {
    return this.notificationsRepository.getForUser(userId, options);
  }

  async markAsRead(notificationId, userId) {
    await this.notificationsRepository.markAsRead(notificationId, userId);
    return { message: "Notification marked as read" };
  }

  async markAllAsRead(userId) {
    await this.notificationsRepository.markAllAsRead(userId);
    return { message: "All notifications marked as read" };
  }
}

module.exports = NotificationsService;
