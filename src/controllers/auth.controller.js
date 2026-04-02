/**
 * Authentication Controller
 * Handles HTTP requests for authentication endpoints
 */

const AuthService = require("../services/auth.service");
const { asyncHandler } = require("../middlewares/errorHandler");
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} = require("../validators/auth.validator");
const { authResponse } = require("../utils/apiResponse");
const logger = require("../utils/logger");

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register a new user
   * POST /api/v1/auth/register
   */
  register = asyncHandler(async (req, res) => {
    // Validate request body
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.sendValidationError(error.details);
    }

    // Get device info from request
    const deviceInfo = {
      userAgent: req.get("User-Agent"),
      ipAddress: req.ip,
    };

    // Register user
    const result = await this.authService.register(value, deviceInfo);

    // Log audit event
    logger.logAudit(
      "USER_REGISTER",
      result.user.id,
      "User",
      result.user.id,
      null,
      { email: result.user.email },
    );

    // Send response - authResponse already includes complete formatting
    const response = authResponse(
      result.user,
      result.tokens.accessToken,
      result.tokens.refreshToken,
      "User registered successfully",
      201,
    );

    // Send the formatted response directly with correct status code
    res.status(201).json(response);
  });

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  login = asyncHandler(async (req, res) => {
    // Validate request body
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.sendValidationError(error.details);
    }

    // Get device info from request
    const deviceInfo = {
      userAgent: req.get("User-Agent"),
      ipAddress: req.ip,
    };

    // Login user
    const result = await this.authService.login(value, deviceInfo);

    // Log audit event
    logger.logAudit("USER_LOGIN", result.user.id, "User", result.user.id);

    // Send response
    const response = authResponse(
      result.user,
      result.tokens.accessToken,
      result.tokens.refreshToken,
      "Login successful",
    );
    res.status(200).json(response);
  });

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh-token
   */
  refreshToken = asyncHandler(async (req, res) => {
    // Validate request body
    const { error, value } = refreshTokenSchema.validate(req.body);
    if (error) {
      return res.sendValidationError(error.details);
    }

    // Refresh tokens
    const result = await this.authService.refreshToken(value.refreshToken);

    // Send response
    const response = authResponse(
      result.user,
      result.tokens.accessToken,
      result.tokens.refreshToken,
      "Token refreshed successfully",
    );
    res.status(200).json(response);
  });

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  logout = asyncHandler(async (req, res) => {
    // Extract refresh token from request body or authorization header
    const refreshToken =
      req.body.refreshToken ||
      req.get("X-Refresh-Token") ||
      (req.user && req.user.refreshToken);

    // Logout user
    await this.authService.logout(refreshToken);

    // Log audit event
    if (req.user) {
      logger.logAudit("USER_LOGOUT", req.user.id, "User", req.user.id);
    }

    // Send response
    res.sendSuccess(null, "Logged out successfully");
  });

  /**
   * Get user profile
   * GET /api/v1/auth/profile
   */
  getProfile = asyncHandler(async (req, res) => {
    // Get user profile
    const user = await this.authService.getProfile(req.user.id);

    // Send response
    res.sendSuccess(user, "Profile retrieved successfully");
  });

  /**
   * Request password reset
   * POST /api/v1/auth/forgot-password
   */
  forgotPassword = asyncHandler(async (req, res) => {
    // Validate request body
    const { error, value } = forgotPasswordSchema.validate(req.body);
    if (error) {
      return res.sendValidationError(error.details);
    }

    // Request password reset
    const result = await this.authService.forgotPassword(value.email);

    // Log audit event (without sensitive info)
    logger.logAudit("PASSWORD_RESET_REQUEST", null, "User", null, null, {
      email: value.email,
      ipAddress: req.ip,
    });

    // Send response
    res.sendSuccess(result, "Password reset instructions sent");
  });

  /**
   * Reset password
   * POST /api/v1/auth/reset-password
   */
  resetPassword = asyncHandler(async (req, res) => {
    // Validate request body
    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error) {
      return res.sendValidationError(error.details);
    }

    // Reset password
    const result = await this.authService.resetPassword(
      value.token,
      value.newPassword,
    );

    // Log audit event
    logger.logAudit("PASSWORD_RESET", null, "User", null, null, {
      resetToken: value.token.substring(0, 8) + "...",
      ipAddress: req.ip,
    });

    // Send response
    res.sendSuccess(result, "Password reset successfully");
  });

  /**
   * Change password (for authenticated users)
   * POST /api/v1/auth/change-password
   */
  changePassword = asyncHandler(async (req, res) => {
    // Validate request body
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      return res.sendValidationError(error.details);
    }

    // Change password
    const result = await this.authService.changePassword(
      req.user.id,
      value.currentPassword,
      value.newPassword,
    );

    // Log audit event
    logger.logAudit("PASSWORD_CHANGE", req.user.id, "User", req.user.id);

    // Send response
    res.sendSuccess(result, "Password changed successfully");
  });

  /**
   * Get user sessions
   * GET /api/v1/auth/sessions
   */
  getSessions = asyncHandler(async (req, res) => {
    // Get user sessions
    const sessions = await this.authService.getUserSessions(req.user.id);

    // Send response
    res.sendSuccess(sessions, "Sessions retrieved successfully");
  });

  /**
   * Logout from all devices
   * POST /api/v1/auth/logout-all
   */
  logoutAll = asyncHandler(async (req, res) => {
    // Logout from all devices
    const result = await this.authService.logoutAll(req.user.id);

    // Log audit event
    logger.logAudit("USER_LOGOUT_ALL", req.user.id, "User", req.user.id);

    // Send response
    res.sendSuccess(result, "Logged out from all devices successfully");
  });
}

module.exports = new AuthController();
