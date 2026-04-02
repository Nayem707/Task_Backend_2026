const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");
const rateLimit = require("express-rate-limit");

const config = require("./config");
const routes = require("./routes");
const logger = require("./utils/logger");
const {
  globalErrorHandler,
  notFoundHandler,
} = require("./middlewares/errorHandler");
const { responseFormatter } = require("./middlewares/responseFormatter");
const { connectDatabase, disconnectDatabase } = require("./config/database");
const { initSocket } = require("./socket");

/**
 * Express application setup with middleware configuration
 * Implements security, CORS, rate limiting, and global error handling
 */
class App {
  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize all middleware in correct order
   */
  initializeMiddlewares() {
    // Security middleware
    this.app.use(helmet());

    // CORS configuration
    const allowedOrigins = config.CORS_ORIGIN.split(",");

    this.app.use(
      cors({
        origin: allowedOrigins,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
      }),
    );

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.RATE_LIMIT_WINDOW_MS,
      max: config.RATE_LIMIT_MAX_REQUESTS,
      message: {
        success: false,
        message: "Too many requests, please try again later",
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

    this.app.use("/api", limiter);
    // Body parsing middleware
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Response formatter middleware
    this.app.use(responseFormatter);

    // Request logging - colorized by method and status
    this.app.use((req, res, next) => {
      const start = Date.now();
      res.on("finish", () => logger.logRequest(req, res, Date.now() - start));
      next();
    });
  }

  /**
   * Initialize all application routes
   */
  initializeRoutes() {
    // Serve uploaded files as static assets at /uploads/<filename>
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    this.app.use(
      "/uploads",
      // Allow cross-origin loading of static images.
      // Helmet sets Cross-Origin-Resource-Policy: same-origin by default which
      // blocks <img> tags on a different origin (e.g. frontend at :5173) from
      // loading files served by this API (at :3000).
      (req, res, next) => {
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        next();
      },
      express.static(uploadDir),
    );

    this.app.use("/", routes);
  }

  /**
   * Initialize error handling middleware (must be last)
   */
  initializeErrorHandling() {
    // Handle 404 errors
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(globalErrorHandler);
  }

  /**
   * Connect to database and start server
   */
  async start() {
    try {
      await connectDatabase();
      logger.info("DB connected successfully");

      const PORT = config.PORT || 3000;
      this.server = this.app.listen(PORT, () => {
        logger.info(`Server running on port = ${PORT}`);
        logger.info(`API Documentation: http://localhost:${PORT}/api/docs`);
      });

      // Attach Socket.IO to the HTTP server
      initSocket(this.server);

      // Graceful shutdown handling
      process.on("SIGTERM", this.gracefulShutdown.bind(this));
      process.on("SIGINT", this.gracefulShutdown.bind(this));
    } catch (error) {
      logger.error("Failed to start server:", error);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown handler
   */
  async gracefulShutdown(signal) {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    if (this.server) {
      // Close Socket.IO before shutting down the HTTP server
      try {
        const { getIO } = require("./socket");
        getIO().close();
      } catch (_) {}
      this.server.close(async () => {
        logger.info("HTTP server closed");

        try {
          await disconnectDatabase();
          logger.info("Database disconnected");
          logger.info("Graceful shutdown completed");
          process.exit(0);
        } catch (error) {
          logger.error("Error during graceful shutdown:", error);
          process.exit(1);
        }
      });
    }
  }

  getExpressApp() {
    return this.app;
  }
}

module.exports = App;
