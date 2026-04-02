/**
 * Upload Middleware
 * Configures Multer for handling image file uploads.
 *
 * - Stores files locally in /uploads with UUID-based unique filenames
 * - Accepts only image types: jpg, jpeg, png, gif, webp
 * - Enforces a 2 MB per-file size limit
 * - Exports ready-to-use middleware for single and multiple image uploads
 * - Exports a handleUploadError helper to be used in route error handling
 */

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// ─── Storage Engine ───────────────────────────────────────────────────────────

/**
 * Disk storage configuration.
 * Files are saved to <project-root>/uploads/ with a UUID + original extension
 * so filenames never collide, even when the same file is uploaded twice.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads");

    // Create the directory lazily so the app starts without manual setup
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    // <16-byte-hex-uuid>-<timestamp>.<ext>  →  guaranteed unique
    const uniqueId = crypto.randomBytes(16).toString("hex");
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueId}-${timestamp}${ext}`);
  },
});

// ─── File Filter ──────────────────────────────────────────────────────────────

/** Allowed MIME types. Adjust as needed. */
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

/**
 * Rejects any file whose MIME type is not in the allow-list.
 * The error message is picked up by handleUploadError below.
 */
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      Object.assign(
        new Error("Only image files are allowed (jpg, jpeg, png, gif, webp)"),
        {
          code: "INVALID_FILE_TYPE",
        },
      ),
      false,
    );
  }
};

// ─── Multer Instance ──────────────────────────────────────────────────────────

/** 2 MB expressed in bytes */
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB (to support video stories)

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10, // hard cap on number of files per request
  },
});

// ─── Exported Middleware ──────────────────────────────────────────────────────

/**
 * uploadSingle(fieldName)
 * Middleware that accepts one file from <fieldName>.
 *
 * Usage in a route:
 *   router.post("/avatar", uploadSingle("avatar"), controller.uploadAvatar);
 */
const uploadSingle = (fieldName = "image") => upload.single(fieldName);

/**
 * uploadMultiple(fieldName, maxCount)
 * Middleware that accepts up to maxCount files from <fieldName>.
 *
 * Usage in a route:
 *   router.post("/gallery", uploadMultiple("images", 5), controller.uploadGallery);
 */
const uploadMultiple = (fieldName = "images", maxCount = 5) =>
  upload.array(fieldName, maxCount);

// ─── Error Handler ────────────────────────────────────────────────────────────

/**
 * handleUploadError(err, req, res, next)
 * Must be added as the LAST middleware in a route that uses Multer so that
 * Multer-specific errors (size exceeded, invalid type, unexpected field) are
 * returned as clean JSON instead of crashing the server.
 *
 * Usage in a route:
 *   router.post("/avatar", uploadSingle("avatar"), controller.uploadAvatar, handleUploadError);
 *
 * Or wrap it around the upload middleware inline — see upload.routes.js.
 */
const handleUploadError = (err, req, res, next) => {
  if (!err) return next();

  // Multer's own error codes
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large",
        errors: [
          { field: err.field, message: "File must be 50 MB or smaller" },
        ],
      });
    }

    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files",
        errors: [{ message: "Maximum number of files exceeded" }],
      });
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected field",
        errors: [
          { field: err.field, message: `Unexpected form field: ${err.field}` },
        ],
      });
    }

    // Any other MulterError
    return res.status(400).json({
      success: false,
      message: "File upload error",
      errors: [{ message: err.message }],
    });
  }

  // Custom INVALID_FILE_TYPE error thrown by fileFilter
  if (err.code === "INVALID_FILE_TYPE") {
    return res.status(400).json({
      success: false,
      message: "Invalid file type",
      errors: [{ message: err.message }],
    });
  }

  // Unknown error — pass to the global error handler
  next(err);
};

module.exports = { uploadSingle, uploadMultiple, handleUploadError };
