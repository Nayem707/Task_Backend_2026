/**
 * Authentication Repository
 * Handles database operations for user authentication and session management
 */

const { getPrismaClient } = require("../config/database");
const logger = require("../utils/logger");

class AuthRepository {
  constructor() {
    this.prisma = getPrismaClient();
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async createUser(userData) {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          bio: true,
          isActive: true,
          createdAt: true,
        },
      });

      logger.debug("User created successfully", { userId: user.id });
      return user;
    } catch (error) {
      logger.error("Error creating user:", error);
      throw error;
    }
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @param {boolean} includePassword - Whether to include password in result
   * @returns {Promise<Object|null>} User or null if not found
   */
  async findUserByEmail(email, includePassword = false) {
    try {
      const selectFields = {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        bio: true,
        isActive: true,
        createdAt: true,
        lastSeen: true,
      };

      if (includePassword) {
        selectFields.password = true;
      }

      const user = await this.prisma.user.findUnique({
        where: { email },
        select: selectFields,
      });

      return user;
    } catch (error) {
      logger.error("Error finding user by email:", error);
      throw error;
    }
  }

  /**
   * Find user by username
   * @param {string} username - Username
   * @returns {Promise<Object|null>} User or null if not found
   */
  async findUserByUsername(username) {
    // No username field in schema
    return null;
  }

  /**
   * Find user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} User or null if not found
   */
  async findUserById(userId) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId, isActive: true },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          coverUrl: true,
          bio: true,
          isActive: true,
          lastSeen: true,
          createdAt: true,
        },
      });

      return user;
    } catch (error) {
      logger.error("Error finding user by ID:", error);
      throw error;
    }
  }

  /**
   * Update user's last login timestamp
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async updateLastLogin(userId) {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { lastSeen: new Date() },
      });
      logger.debug("Updated lastSeen", { userId });
    } catch (error) {
      logger.error("Error updating lastSeen:", error);
      throw error;
    }
  }

  /**
   * Update user password
   * @param {string} userId - User ID
   * @param {string} hashedPassword - New hashed password
   * @returns {Promise<void>}
   */
  async updatePassword(userId, hashedPassword) {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      logger.debug("User password updated", { userId });
    } catch (error) {
      logger.error("Error updating user password:", error);
      throw error;
    }
  }
}

module.exports = AuthRepository;
