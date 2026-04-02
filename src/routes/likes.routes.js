/**
 * Likes Routes
 * Defines all endpoints for likes operations
 */

const express = require("express");
const LikesController = require("../controllers/likes.controller");
const { authenticate } = require("../middlewares/auth");

const router = express.Router();
const likesController = new LikesController();

/**
 * Post Likes Endpoints
 */

// Toggle like on a post - Requires authentication
router.post(
  "/posts/:postId/toggle",
  authenticate,
  likesController.togglePostLike,
);

// Get all likes for a post - Public
router.get("/posts/:postId", likesController.getPostLikes);

// Get post like statistics - Public
router.get("/posts/:postId/stats", likesController.getPostLikeStats);

/**
 * Comment Likes Endpoints
 */

// Toggle like on a comment - Requires authentication
router.post(
  "/comments/:commentId/toggle",
  authenticate,
  likesController.toggleCommentLike,
);

// Get all likes for a comment - Public
router.get("/comments/:commentId", likesController.getCommentLikes);

// Get comment like statistics - Public
router.get("/comments/:commentId/stats", likesController.getCommentLikeStats);

module.exports = router;
