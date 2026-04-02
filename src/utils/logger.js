/**
 * Colorized logger utility
 * Lightweight custom logger using ANSI color codes
 */

// Matches both NODE_ENV="dev" and NODE_ENV="development"
const isDev = () => ["dev", "development"].includes(process.env.NODE_ENV);

/**
 * Returns a formatted timestamp string: [DD/MM/YYYY HH:MM:SS]
 */
const formatTimestamp = () => {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  const HH = String(now.getHours()).padStart(2, "0");
  const MM = String(now.getMinutes()).padStart(2, "0");
  const SS = String(now.getSeconds()).padStart(2, "0");
  return `[${dd}/${mm}/${yyyy} ${HH}:${MM}:${SS}]`;
};

/**
 * ANSI color codes for terminal output
 */
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",

  // Foreground colors
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",

  // Background colors
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
};

/**
 * Colorized logger utility
 */
class Logger {
  static info(message, ...args) {
    const timestamp = formatTimestamp();
    console.log(
      `${colors.dim}${timestamp}${colors.reset} ${colors.cyan}${colors.bright}INFO:${colors.reset}`,
      message,
      ...args,
    );
  }

  static error(message, ...args) {
    const timestamp = formatTimestamp();
    console.error(
      `${colors.dim}${timestamp}${colors.reset} ${colors.red}${colors.bright}ERROR:${colors.reset}`,
      message,
      ...args,
    );
  }

  static warn(message, ...args) {
    const timestamp = formatTimestamp();
    console.warn(
      `${colors.dim}${timestamp}${colors.reset} ${colors.yellow}${colors.bright}WARN:${colors.reset}`,
      message,
      ...args,
    );
  }

  static debug(message, ...args) {
    if (isDev()) {
      const timestamp = formatTimestamp();
      console.log(
        `${colors.dim}${timestamp}${colors.reset} ${colors.magenta}${colors.bright}DEBUG:${colors.reset}`,
        message,
        ...args,
      );
    }
  }

  static success(message, ...args) {
    const timestamp = formatTimestamp();
    console.log(
      `${colors.dim}${timestamp}${colors.reset} ${colors.green}${colors.bright}SUCCESS:${colors.reset}`,
      message,
      ...args,
    );
  }

  /**
   * HTTP request logger - colorized by method and status code
   */
  static logRequest(req, res, responseTime) {
    if (isDev()) {
      const methodColors = {
        GET: colors.cyan,
        POST: colors.green,
        PUT: colors.yellow,
        PATCH: colors.magenta,
        DELETE: colors.red,
      };
      const mc = methodColors[req.method] || colors.white;
      const method = `${mc}${colors.bright}${req.method.padEnd(6)}${colors.reset}`;

      let sc = colors.green;

      if (res.statusCode >= 500) sc = colors.red;
      else if (res.statusCode >= 400) sc = colors.yellow;
      else if (res.statusCode >= 300) sc = colors.cyan;

      const status = `${sc}${colors.bright}${res.statusCode}${colors.reset}`;

      let tc = colors.gray;

      if (responseTime >= 200) tc = colors.red;
      else if (responseTime >= 100) tc = colors.yellow;

      const time = `${tc}${responseTime}ms${colors.reset}`;
      const ts = `${colors.dim}${formatTimestamp()}${colors.reset}`;
      const url = `${colors.cyan}${req.originalUrl}${colors.reset}`;

      process.stdout.write(`${ts} ${method} ${status} ${url} | ${time}\n`);
    } else {
      const logData = {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        userId: req.user?.id || "anonymous",
      };

      if (res.statusCode >= 400) {
        Logger.warn("HTTP Request Failed", logData);
      } else {
        Logger.info("HTTP Request Success", logData);
      }
    }
  }

  /**
   * Audit event logger
   */
  static logAudit(
    action,
    userId,
    resourceType,
    resourceId,
    oldData = null,
    newData = null,
  ) {
    Logger.info("Audit Log", {
      action,
      userId,
      resourceType,
      resourceId,
      oldData,
      newData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Database operation logger
   */
  static logDatabaseOperation(operation, table, duration, error = null) {
    if (error) {
      if (isDev()) {
        let errorMessage = error.message;
        if (error.code === "P2002") {
          errorMessage = `Duplicate entry: ${error.meta?.target?.join(", ") || "unknown field"}`;
        } else if (error.code === "P2025") {
          errorMessage = `Record not found`;
        } else if (error.code === "P2021") {
          errorMessage = `Table ${error.meta?.table} does not exist`;
        }
        Logger.error(
          `Database Error (${operation} on ${table}): ${errorMessage}`,
        );
      } else {
        Logger.error("Database Operation Failed", {
          operation,
          table,
          duration: `${duration}ms`,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    } else if (!isDev()) {
      Logger.debug("Database Operation Completed", {
        operation,
        table,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Prisma-specific error logger
   */
  static logPrismaError(error, operation = "") {
    if (isDev()) {
      let message = "";
      if (error.code === "P2002") {
        message = `Duplicate entry error: ${error.meta?.target?.join(", ") || "unique constraint failed"}`;
      } else if (error.code === "P2025") {
        message = `Record not found`;
      } else if (error.code === "P2021") {
        message = `Table not found: ${error.meta?.table || "unknown table"}`;
      } else if (error.code === "P2003") {
        message = `Foreign key constraint failed`;
      } else {
        message = `Database error: ${error.message.split("\n")[0]}`;
      }
      Logger.error(`${operation ? `[${operation}] ` : ""}${message}`);
    } else {
      Logger.error("Database Error", {
        code: error.code,
        operation,
        message: error.message,
        meta: error.meta,
      });
    }
  }
}

module.exports = Logger;
