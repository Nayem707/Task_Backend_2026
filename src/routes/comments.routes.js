/**
 * Comments Routes
 * Defines all endpoints for comments and replies operations
 */

const express = require("express");
const CommentsController = require("../controllers/comments.controller");
const { authenticate, optionalAuthenticate } = require("../middlewares/auth");

const router = express.Router({ mergeParams: true });
const commentsController = new CommentsController();

/**
 * Post Comments Endpoints
 * Routes: /api/v1/posts/:postId/comments
 */

// Get all comments for a post - Public with optional auth for likedByMe
router.get("/", optionalAuthenticate, commentsController.getPostComments);

// Create a comment on a post - Requires authentication
router.post("/", authenticate, commentsController.createComment);

/**
 * Comment Replies Endpoints
 * Routes: /api/v1/comments/:commentId/replies
 */

// Get all replies for a comment - Public with optional auth for likedByMe
router.get(
  "/:commentId/replies",
  optionalAuthenticate,
  commentsController.getCommentReplies,
);

// Create a reply to a comment - Requires authentication
router.post(
  "/:commentId/replies",
  authenticate,
  commentsController.createReply,
);

/**
 * Individual Comment Endpoints
 * Routes: /api/v1/comments/:commentId
 */

// Get a single comment - Public with optional auth for likedByMe
router.get("/:commentId", optionalAuthenticate, commentsController.getComment);

// Update a comment - Requires authentication (must be owner)
router.put("/:commentId", authenticate, commentsController.updateComment);

// Delete a comment - Requires authentication (must be owner)
router.delete("/:commentId", authenticate, commentsController.deleteComment);

// Like / unlike a comment
router.post(
  "/:commentId/like",
  authenticate,
  commentsController.toggleCommentLike,
);
router.get("/:commentId/likes", commentsController.getCommentLikes);

module.exports = router;
