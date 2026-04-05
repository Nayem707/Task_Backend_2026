/**
 * Posts Routes
 */

const express = require("express");
const PostsController = require("../controllers/posts.controller");
const { authenticate, optionalAuthenticate } = require("../middlewares/auth");
const { uploadMultiple, handleUploadError } = require("../middlewares/upload");

const router = express.Router();
const postsController = new PostsController();

// Global feed (cursor-based)
router.get("/", optionalAuthenticate, postsController.getAllPosts);

// Authenticated timeline and my posts
router.get("/feed/me", authenticate, postsController.getMyFeed);
router.get("/timeline", authenticate, postsController.getMyFeed);
router.get(
  "/me",
  authenticate,
  (req, _res, next) => {
    req.params.userId = req.user.id;
    next();
  },
  postsController.getUserPosts,
);

// Public posts by user
router.get("/user/:userId", optionalAuthenticate, postsController.getUserPosts);

// Create post (with optional image upload)
router.post(
  "/",
  authenticate,
  uploadMultiple("image", 5),
  handleUploadError,
  postsController.createPost,
);

// Individual post
router.get("/:id", optionalAuthenticate, postsController.getPostById);
router.put("/:id", authenticate, postsController.updatePost);
router.delete("/:id", authenticate, postsController.deletePost);

// Like/unlike post
router.post("/:id/like", authenticate, postsController.togglePostLike);
router.get("/:id/likes", optionalAuthenticate, postsController.getPostLikes);

module.exports = router;
