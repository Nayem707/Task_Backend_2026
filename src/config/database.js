/**
 * Database configuration and connection management
 * Handles Prisma client initialization and connection lifecycle
 */

const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");
const config = require("./index");

let prismaClient = null;

/**
 * Create and configure Prisma client instance
 */
function createPrismaClient() {
  const prisma = new PrismaClient({
    log: config.NODE_ENV === "dev" ? ["warn", "error"] : ["error"],
    errorFormat: "pretty",
  });

  // Add query logging middleware in dev
  if (config.NODE_ENV === "dev") {
    prisma.$use(async (params, next) => {
      const before = Date.now();
      const result = await next(params);
      const after = Date.now();
      logger.debug(
        `Query ${params.model ?? "db"}.${params.action} took | ${after - before}ms`,
      );
      return result;
    });
  }

  return prisma;
}

/**
 * Get the Prisma client instance (singleton)
 */
function getPrismaClient() {
  if (!prismaClient) {
    prismaClient = createPrismaClient();
  }
  return prismaClient;
}

/**
 * Connect to the database
 */
async function connectDatabase() {
  try {
    const prisma = getPrismaClient();

    // Test the connection
    await prisma.$connect();

    // Run a simple query to verify connection
    await prisma.$queryRaw`SELECT 1`;

    logger.info("DB connection established ");
    return prisma;
  } catch (error) {
    logger.error("Failed to connect to database:", error);
    throw error;
  }
}

/**
 * Disconnect from the database
 */
async function disconnectDatabase() {
  try {
    if (prismaClient) {
      await prismaClient.$disconnect();
      prismaClient = null;
      logger.info("Database disconnected successfully");
    }
  } catch (error) {
    logger.error("Error disconnecting from database:", error);
    throw error;
  }
}

/**
 * Handle database connection errors and retries
 */
function handleDatabaseError(error) {
  logger.error("Database error occurred:", error);

  // Log specific error types
  if (error.code === "P1001") {
    logger.error("Database server is not reachable");
  } else if (error.code === "P1008") {
    logger.error("Database operations timed out");
  } else if (error.code === "P1017") {
    logger.error("Database connection lost");
  }

  return error;
}

/**
 * Execute database transaction with proper error handling
 */
async function executeTransaction(callback) {
  const prisma = getPrismaClient();

  try {
    return await prisma.$transaction(callback);
  } catch (error) {
    handleDatabaseError(error);
    throw error;
  }
}

/**
 * Health check for database connection
 */
async function checkDatabaseHealth() {
  try {
    const prisma = getPrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    return { status: "healthy", message: "Database connection is working" };
  } catch (error) {
    return { status: "unhealthy", message: error.message };
  }
}

module.exports = {
  getPrismaClient,
  connectDatabase,
  disconnectDatabase,
  executeTransaction,
  checkDatabaseHealth,
  handleDatabaseError,
};
