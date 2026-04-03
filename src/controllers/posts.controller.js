/**
 * Posts Controller
 * Handles HTTP requests for posts endpoints
 */

const PostsService = require("../services/posts.service");
const { asyncHandler } = require("../middlewares/errorHandler");
const {
  createPostSchema,
  updatePostSchema,
} = require("../validators/posts.validator");
const logger = require("../utils/logger");

class PostsController {
  constructor() {
    this.postsService = new PostsService();
  }

  /**
   * Create a new post
   * POST /api/v1/posts
   */
  createPost = asyncHandler(async (req, res) => {
    const body = { ...req.body };
    const files = req.files ?? (req.file ? [req.file] : []);
    if (files.length > 0) {
      body.images = files.map(
        (f) => `${req.protocol}://${req.get("host")}/uploads/${f.filename}`,
      );
      body.imageUrl = body.images[0];
    }

    const { error, value } = createPostSchema.validate(body);
    if (error) {
      return res.sendValidationError(error.details);
    }

    const post = await this.postsService.createPost(req.user.id, value);

    logger.logAudit("POST_CREATE", req.user.id, "Post", post.id, null, {
      content: value.content.substring(0, 50).concat("..."),
    });

    res.status(201).json({
      success: true,
      statusCode: 201,
      data: post,
      message: "Post created successfully",
    });
  });

  /**
   * Get all posts (feed)
   * GET /api/v1/posts
   */
  getAllPosts = asyncHandler(async (req, res) => {
    const cursor = req.query.cursor || undefined;
    const limit = parseInt(req.query.limit) || 10;

    const result = await this.postsService.getGlobalFeed({
      cursor,
      limit,
      viewerId: req.user?.id,
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: result.data,
      nextCursor: result.nextCursor,
      message: "Posts retrieved successfully",
    });
  });

  /**
   * Get a single post by ID
   * GET /api/v1/posts/:id
   */
  getPostById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const post = await this.postsService.getPostById(id);

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: post,
      message: "Post retrieved successfully",
    });
  });

  /**
   * Update a post
   * PUT /api/v1/posts/:id
   */
  updatePost = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { error, value } = updatePostSchema.validate(req.body);
    if (error) {
      return res.sendValidationError(error.details);
    }

    const post = await this.postsService.updatePost(id, req.user.id, value);

    logger.logAudit("POST_UPDATE", req.user.id, "Post", id, null, {
      content: value.content
        ? value.content.substring(0, 50).concat("...")
        : null,
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: post,
      message: "Post updated successfully",
    });
  });

  /**
   * Delete a post
   * DELETE /api/v1/posts/:id
   */
  deletePost = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await this.postsService.deletePost(id, req.user.id);

    logger.logAudit("POST_DELETE", req.user.id, "Post", id);

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: null,
      message: "Post deleted successfully",
    });
  });

  /**
   * Get user's posts
   * GET /api/v1/posts/user/:userId
   */
  getUserPosts = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await this.postsService.getUserPosts(userId, {
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: result.data,
      pagination: result.pagination,
      message: "User posts retrieved successfully",
    });
  });

  /**
   * Get current user's feed
   * GET /api/v1/posts/feed/me
   */
  getMyFeed = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await this.postsService.getFeedPosts(req.user.id, {
      page,
      limit,
      viewerId: req.user.id,
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: result.data,
      pagination: result.pagination,
      message: "Feed retrieved successfully",
    });
  });

  togglePostLike = asyncHandler(async (req, res) => {
    const LikesService = require("../services/likes.service");
    const likesService = new LikesService();
    const result = await likesService.togglePostLike(
      req.user.id,
      req.params.id,
    );
    res.sendSuccess(result, `Post ${result.action} successfully`);
  });

  getPostLikes = asyncHandler(async (req, res) => {
    const LikesService = require("../services/likes.service");
    const likesService = new LikesService();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await likesService.getPostLikes(req.params.id, {
      page,
      limit,
    });
    res.sendSuccess(result, "Post likes retrieved successfully");
  });
}

module.exports = PostsController;
