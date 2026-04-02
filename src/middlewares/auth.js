/**
 * Authentication middleware
 * Handles JWT token verification and user authentication
 */

const { verifyAccessToken } = require("../utils/jwt");
const { getPrismaClient } = require("../config/database");
const { AuthenticationError, AuthorizationError } = require("./errorHandler");
const logger = require("../utils/logger");
const { asyncHandler } = require("./errorHandler");
const cache = require("../utils/cache");

const prisma = getPrismaClient();

// Cache TTL matches the access-token lifetime (15 min = 900 s)
const USER_CACHE_TTL = 14 * 60 * 1000; // 14 minutes

/**
 * Fetch user from DB or return cached version.
 * Keyed by JWT token so expiry is automatic when the token rotates.
 */
async function resolveUser(token, userId) {
  const cacheKey = `auth:user:${token.slice(-32)}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  const user = await prisma.user.findUnique({
    where: { id: userId, isActive: true },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
    },
  });

  if (user) cache.set(cacheKey, user, USER_CACHE_TTL);
  return user;
}

/**
 * Verify JWT token and authenticate user
 * Middleware to verify access token and attach user to request
 */
const authenticate = asyncHandler(async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AuthenticationError("Access token required");
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new AuthenticationError("Access token required");
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Get user from cache or database
    const user = await resolveUser(token, decoded.id);

    if (!user) {
      throw new AuthenticationError("Invalid token - user not found");
    }

    // Attach user to request
    req.user = user;

    // Log successful authentication
    logger.debug("User authenticated successfully", {
      userId: user.id,
      email: user.email,
    });

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }

    // Handle JWT specific errors
    if (error.message.includes("expired")) {
      throw new AuthenticationError("Token expired");
    } else if (error.message.includes("invalid")) {
      throw new AuthenticationError("Invalid token");
    }

    logger.error("Authentication error:", error);
    throw new AuthenticationError("Authentication failed");
  }
});

/**
 * Optional authentication - doesn't fail if no token provided
 * Useful for endpoints that work for both authenticated and anonymous users
 */
const optionalAuthenticate = asyncHandler(async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // If no auth header, continue without user
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return next();
    }

    // Try to verify token
    const decoded = verifyAccessToken(token);

    // Try to get user (cache-backed)
    const user = await resolveUser(token, decoded.id);

    // If user found, attach to request
    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    // If optional auth fails, continue without user
    logger.debug("Optional authentication failed, continuing without user");
    next();
  }
});

/**
 * Role-based authorization - no-op in this schema (no role field)
 */
const authorize = (allowedRoles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new AuthenticationError("Authentication required");
    }
    next();
  });
};

/**
 * Admin only middleware (no-op - no role in schema)
 */
const adminOnly = (req, res, next) => {
  if (!req.user) throw new AuthenticationError("Authentication required");
  next();
};

/**
 * Admin or Moderator middleware (no-op - no role in schema)
 */
const adminOrModerator = (req, res, next) => {
  if (!req.user) throw new AuthenticationError("Authentication required");
  next();
};

/**
 * Resource ownership check middleware
 */
const checkOwnership = (resourceIdParam = "id") => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new AuthenticationError("Authentication required");
    }

    const resourceId = req.params[resourceIdParam];
    const userId = req.user.id;

    if (resourceId !== userId) {
      throw new AuthorizationError("Access denied - not your resource");
    }

    next();
  });
};

/**
 * Rate limiting by user
 * Additional rate limiting based on authenticated user
 */
const userRateLimit = asyncHandler(async (req, res, next) => {
  if (req.user) {
    // Could implement user-specific rate limiting here
    // For now, just log the user activity
    logger.debug("Authenticated user request", {
      userId: req.user.id,
      endpoint: req.originalUrl,
      method: req.method,
    });
  }

  next();
});

module.exports = {
  authenticate,
  optionalAuthenticate,
  authorize,
  adminOnly,
  adminOrModerator,
  checkOwnership,
  userRateLimit,
};
