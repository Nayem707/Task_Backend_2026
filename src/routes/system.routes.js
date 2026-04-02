/**
 * System Routes
 * Defines system and monitoring endpoints
 */

const express = require("express");
const router = express.Router();

/**
 * Health check endpoint
 */
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      environment: process.env.NODE_ENV || "production",
      uptime: process.uptime(),
    },
    message: "Service is healthy",
  });
});

/**
 * Status endpoint
 */
router.get("/status", (req, res) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    data: {
      status: "running",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    },
    message: "API is running",
  });
});

module.exports = router;
