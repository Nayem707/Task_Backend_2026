/**
 * JWT token utilities for authentication
 * Handles token generation, verification, and refresh logic
 */

const jwt = require("jsonwebtoken");
const config = require("../config");
const logger = require("./logger");

/**
 * Generate JWT access token
 * @param {Object} payload - Token payload (user data)
 * @returns {string} JWT access token
 */
const generateAccessToken = (payload) => {
  try {
    const tokenPayload = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      type: "access",
    };

    return jwt.sign(tokenPayload, config.JWT_ACCESS_SECRET, {
      expiresIn: config.JWT_ACCESS_EXPIRES_IN,
      issuer: "freelancerluxe-api",
      audience: "freelancerluxe-client",
    });
  } catch (error) {
    logger.error("Error generating access token:", error);
    throw new Error("Token generation failed");
  }
};

/**
 * Generate JWT refresh token
 * @param {Object} payload - Token payload (user data)
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (payload) => {
  try {
    const tokenPayload = {
      id: payload.id,
      email: payload.email,
      type: "refresh",
    };

    return jwt.sign(tokenPayload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN,
      issuer: "freelancerluxe-api",
      audience: "freelancerluxe-client",
    });
  } catch (error) {
    logger.error("Error generating refresh token:", error);
    throw new Error("Token generation failed");
  }
};

/**
 * Generate both access and refresh tokens
 * @param {Object} user - User object
 * @returns {Object} Object containing both tokens
 */
const generateTokenPair = (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    accessToken,
    refreshToken,
    tokenType: "Bearer",
    expiresIn: config.JWT_ACCESS_EXPIRES_IN,
  };
};

/**
 * Verify JWT access token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET, {
      issuer: "freelancerluxe-api",
      audience: "freelancerluxe-client",
    });

    if (decoded.type !== "access") {
      throw new Error("Invalid token type");
    }

    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      logger.warn("Access token expired");
      throw new Error("Token expired");
    } else if (error.name === "JsonWebTokenError") {
      logger.warn("Invalid access token");
      throw new Error("Invalid token");
    } else if (error.name === "NotBeforeError") {
      logger.warn("Access token not active yet");
      throw new Error("Token not active");
    }

    logger.error("Access token verification failed:", error);
    throw new Error("Token verification failed");
  }
};

/**
 * Verify JWT refresh token
 * @param {string} token - JWT refresh token to verify
 * @returns {Object} Decoded token payload
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET, {
      issuer: "freelancerluxe-api",
      audience: "freelancerluxe-client",
    });

    if (decoded.type !== "refresh") {
      throw new Error("Invalid token type");
    }

    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      logger.warn("Refresh token expired");
      throw new Error("Refresh token expired");
    } else if (error.name === "JsonWebTokenError") {
      logger.warn("Invalid refresh token");
      throw new Error("Invalid refresh token");
    } else if (error.name === "NotBeforeError") {
      logger.warn("Refresh token not active yet");
      throw new Error("Refresh token not active");
    }

    logger.error("Refresh token verification failed:", error);
    throw new Error("Refresh token verification failed");
  }
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Extracted token
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
};

/**
 * Decode token without verification (for inspection)
 * @param {string} token - JWT token to decode
 * @returns {Object} Decoded token payload
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    logger.error("Token decode failed:", error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} True if token is expired
 */
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    logger.error("Token expiration check failed:", error);
    return true;
  }
};

/**
 * Get token expiration date
 * @param {string} token - JWT token
 * @returns {Date|null} Expiration date
 */
const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return null;
    }

    return new Date(decoded.exp * 1000);
  } catch (error) {
    logger.error("Get token expiration failed:", error);
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  extractTokenFromHeader,
  decodeToken,
  isTokenExpired,
  getTokenExpiration,
};
