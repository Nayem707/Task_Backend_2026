/**
 * Authentication Service
 * Handles authentication business logic including user registration, login, token management
 */

const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const AuthRepository = require("../repositories/auth.repository");
const { generateTokenPair, verifyRefreshToken } = require("../utils/jwt");
const {
  AuthenticationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} = require("../middlewares/errorHandler");
const logger = require("../utils/logger");
const config = require("../config");

class AuthService {
  constructor() {
    this.authRepository = new AuthRepository();
  }

  /**
   * Register a new user
   * POST /api/v1/auth/register
   * Handles user registration with email and password
   */
  async register(userData, deviceInfo = {}) {
    try {
      const { email, password, firstName, lastName } = userData;

      const existingUser = await this.authRepository.findUserByEmail(email);
      if (existingUser) {
        throw new ConflictError("User with this email already exists");
      }

      const hashedPassword = await bcrypt.hash(password, config.BCRYPT_ROUNDS);

      const newUser = await this.authRepository.createUser({
        email,
        password: hashedPassword,
        firstName: firstName || "",
        lastName: lastName || "",
      });

      // Generate tokens
      const tokens = generateTokenPair(newUser);

      // Update last login
      await this.authRepository.updateLastLogin(newUser.id);

      logger.info("User registered successfully", {
        userId: newUser.id,
        email: newUser.email,
      });

      return {
        user: newUser,
        tokens,
      };
    } catch (error) {
      logger.error("Registration failed:", error);
      throw error;
    }
  }

  /**
   * Login user
   * POST /api/v1/auth/login
   * Authenticates user with email and password
   */
  async login(credentials, deviceInfo = {}) {
    try {
      const { email, password } = credentials;

      // Find user by email (include password)
      const user = await this.authRepository.findUserByEmail(email, true);
      if (!user) {
        throw new AuthenticationError("Invalid email or password");
      }

      // Check if user is active
      if (!user.isActive) {
        throw new AuthenticationError("Account has been deactivated");
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new AuthenticationError("Invalid email or password");
      }

      // Remove password from user object
      delete user.password;

      // Generate tokens
      const tokens = generateTokenPair(user);

      // Update last login
      await this.authRepository.updateLastLogin(user.id);

      logger.info("User logged in successfully", {
        userId: user.id,
        email: user.email,
      });

      return {
        user,
        tokens,
      };
    } catch (error) {
      logger.error("Login failed:", error);
      throw error;
    }
  }

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh-token
   * Generates new access token using refresh token
   */
  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      let decoded;
      try {
        decoded = verifyRefreshToken(refreshToken);
      } catch (error) {
        throw new AuthenticationError("Invalid or expired refresh token");
      }

      // Find user by ID from decoded token
      const user = await this.authRepository.findUserById(decoded.id);
      if (!user) {
        throw new AuthenticationError("User not found");
      }

      // Check if user is still active
      if (!user.isActive) {
        throw new AuthenticationError("Account has been deactivated");
      }

      // Generate new token pair (token rotation)
      const tokens = generateTokenPair(user);

      logger.debug("Tokens refreshed successfully", { userId: user.id });

      return { user, tokens };
    } catch (error) {
      logger.error("Token refresh failed:", error);
      throw error;
    }
  }

  /**
   * Logout user
   * POST /api/v1/auth/logout
   * Invalidates user session and refresh token
   */
  async logout(refreshToken) {
    try {
      // With stateless JWT, logout is handled client-side by discarding tokens.
      // This endpoint acknowledges the logout request.
      logger.info("User logout requested (stateless JWT)");
      return { message: "Logged out successfully" };
    } catch (error) {
      logger.error("Logout failed:", error);
      throw error;
    }
  }

  /**
   * Get user profile
   * GET /api/v1/auth/profile
   * Returns current user profile information
   */
  async getProfile(userId) {
    try {
      const user = await this.authRepository.findUserById(userId);
      if (!user) {
        throw new NotFoundError("User not found");
      }

      return user;
    } catch (error) {
      logger.error("Get profile failed:", error);
      throw error;
    }
  }

  /**
   * Request password reset
   * POST /api/v1/auth/forgot-password
   * Initiates password reset process (placeholder implementation)
   */
  async forgotPassword(email) {
    try {
      // Find user by email
      const user = await this.authRepository.findUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        logger.warn(
          `Password reset requested for non-existent email: ${email}`,
        );
        return { message: "If the email exists, a reset link has been sent" };
      }

      if (!user.isActive) {
        throw new AuthenticationError("Account has been deactivated");
      }

      // Generate reset token (in production, this would be stored and emailed)
      const resetToken = crypto.randomBytes(32).toString("hex");

      // TODO: Store reset token with expiration in database
      // TODO: Send email with reset link

      logger.info("Password reset requested", {
        userId: user.id,
        email: user.email,
        resetToken, // In production, don't log the token
      });

      return {
        message: "If the email exists, a reset link has been sent",
        // For dev only - remove in production
        resetToken: config.NODE_ENV === "dev" ? resetToken : undefined,
      };
    } catch (error) {
      logger.error("Forgot password failed:", error);
      throw error;
    }
  }

  /**
   * Reset password
   * POST /api/v1/auth/reset-password
   * Resets user password using reset token (placeholder implementation)
   */
  async resetPassword(resetToken, newPassword) {
    try {
      // TODO: Implement token verification and password reset
      // For now, this is a placeholder implementation

      logger.warn("Password reset attempted but not fully implemented", {
        resetToken: resetToken.substring(0, 8) + "...", // Log partial token
      });

      throw new Error("Password reset functionality not yet implemented");
    } catch (error) {
      logger.error("Reset password failed:", error);
      throw error;
    }
  }

  /**
   * Change password (for authenticated users)
   * POST /api/v1/auth/change-password
   * Changes user password after verifying current password
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Get user with password
      const user = await this.authRepository.findUserByEmail(
        (await this.authRepository.findUserById(userId)).email,
        true,
      );

      if (!user) {
        throw new NotFoundError("User not found");
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );
      if (!isCurrentPasswordValid) {
        throw new AuthenticationError("Current password is incorrect");
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(
        newPassword,
        config.BCRYPT_ROUNDS,
      );

      // Update password
      await this.authRepository.updatePassword(userId, hashedNewPassword);

      // Optionally, invalidate all sessions except current one
      // await this.authRepository.deactivateAllUserSessions(userId);

      logger.info("Password changed successfully", { userId });

      return { message: "Password changed successfully" };
    } catch (error) {
      logger.error("Change password failed:", error);
      throw error;
    }
  }

  /**
   * Get user sessions
   * GET /api/v1/auth/sessions
   * Returns user's active sessions
   */
  async getUserSessions(userId) {
    // Stateless JWT: no server-side sessions
    return [];
  }

  async logoutAll(userId) {
    // Stateless JWT: client discards all tokens
    logger.info("Logout all requested (stateless JWT)", { userId });
    return { message: "Logged out from all devices successfully" };
  }
}

module.exports = AuthService;
