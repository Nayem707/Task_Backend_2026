/**
 * Application configuration module
 * Centralizes all environment variables and application settings
 * with validation and default values
 */

const dotenv = require("dotenv");
const logger = require("../utils/logger");

// Load environment variables
dotenv.config();

/**
 * Validate required environment variables
 */
const requiredEnvVars = [
  "DATABASE_URL",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`,
  );
  process.exit(1);
}

/**
 * Application configuration object
 */
const config = {
  // Server Configuration
  PORT: parseInt(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || "dev",
  API_VERSION: process.env.API_VERSION || "v1",

  // Database Configuration
  DATABASE_URL: process.env.DATABASE_URL,

  // JWT Configuration
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  // Security Configuration
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 1800000, // 30 minutes
  RATE_LIMIT_MAX_REQUESTS:
    parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 2000,

  // Game Configuration
  MAX_ROUNDS_PER_GAME: parseInt(process.env.MAX_ROUNDS_PER_GAME) || 5,
  ROUND_DURATION_SECONDS: parseInt(process.env.ROUND_DURATION_SECONDS) || 15,
  MAX_POINTS_PER_ROUND: parseInt(process.env.MAX_POINTS_PER_ROUND) || 1000,

  // Redis Configuration
  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  REDIS_PORT: parseInt(process.env.REDIS_PORT) || 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || "",

  // Logging Configuration
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  LOG_FILE_PATH: process.env.LOG_FILE_PATH || "logs/app.log",

  // Analytics Configuration
  ANALYTICS_CRON_SCHEDULE: process.env.ANALYTICS_CRON_SCHEDULE || "0 0 * * *", // Daily at midnight
};

// Log configuration on startup (without sensitive data)
const logConfig = { ...config };
delete logConfig.JWT_ACCESS_SECRET;
delete logConfig.JWT_REFRESH_SECRET;
delete logConfig.DATABASE_URL;
delete logConfig.EMAIL_PASS;

logger.info("Config loaded:", {
  env: config.NODE_ENV,
  port: config.PORT,
  v: config.API_VERSION,
});

module.exports = config;
