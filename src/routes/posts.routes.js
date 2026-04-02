/**
 * Posts Routes
 */

const express = require("express");
const PostsController = require("../controllers/posts.controller");
const { authenticate, optionalAuthenticate } = require("../middlewares/auth");
const { uploadSingle, handleUploadError } = require("../middlewares/upload");

const router = express.Router();
const postsController = new PostsController();

// Global feed (cursor-based)
router.get("/", optionalAuthenticate, postsController.getAllPosts);

// Create post (with optional image upload)
router.post(
  "/",
  authenticate,
  uploadSingle("image"),
  handleUploadError,
  postsController.createPost,
);

// Individual post
router.get("/:id", optionalAuthenticate, postsController.getPostById);
router.delete("/:id", authenticate, postsController.deletePost);

// Like/unlike post
router.post("/:id/like", authenticate, postsController.togglePostLike);
router.get("/:id/likes", optionalAuthenticate, postsController.getPostLikes);

module.exports = router;
