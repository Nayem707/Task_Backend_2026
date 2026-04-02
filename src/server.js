#!/usr/bin/env node

/**
 * Freelancerluxe Basketball Player Guessing Game API Server
 * Entry point for the Express.js application
 *
 * This file initializes the application and starts the server
 * with proper error handling and environment setup
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
const App = require("./app");
const logger = require("./utils/logger");

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

/**
 * Start the application server
 */
async function startServer() {
  try {
    const app = new App();
    await app.start();
  } catch (error) {
    logger.error("Failed to start application:", error);
    process.exit(1);
  }
}

// Start the server
startServer();
