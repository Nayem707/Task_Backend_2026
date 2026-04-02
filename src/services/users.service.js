const UsersRepository = require("../repositories/users.repository");
const {
  NotFoundError,
  AuthorizationError,
  ConflictError,
} = require("../middlewares/errorHandler");
const logger = require("../utils/logger");
const { createNotification } = require("../utils/notificationHelper");

class UsersService {
  constructor() {
    this.usersRepository = new UsersRepository();
  }

  async getMe(userId) {
    const user = await this.usersRepository.findByIdWithStats(userId, null);
    if (!user) throw new NotFoundError("User");
    return user;
  }

  async updateMe(userId, data) {
    const updated = await this.usersRepository.update(userId, data);
    logger.info("User profile updated", { userId });
    return updated;
  }

  async getUserById(userId, viewerId) {
    const user = await this.usersRepository.findByIdWithStats(userId, viewerId);
    if (!user) throw new NotFoundError("User");
    return user;
  }

  async toggleFollow(followerId, followingId) {
    if (followerId === followingId) {
      throw new AuthorizationError("You cannot follow yourself");
    }
    const target = await this.usersRepository.findById(followingId);
    if (!target) throw new NotFoundError("User");

    const result = await this.usersRepository.toggleFollow(
      followerId,
      followingId,
    );

    if (result.action === "followed") {
      await createNotification({
        userId: followingId,
        type: "FOLLOW",
        referenceId: followerId,
        content: "started following you",
      });
    }

    return result;
  }

  async getFollowers(userId, options) {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundError("User");
    return this.usersRepository.getFollowers(userId, options);
  }

  async getFollowing(userId, options) {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundError("User");
    return this.usersRepository.getFollowing(userId, options);
  }

  async searchUsers(query, options) {
    if (!query || query.trim().length < 2) {
      throw new Error("Search query must be at least 2 characters");
    }
    return this.usersRepository.search(query.trim(), options);
  }
}

module.exports = UsersService;
