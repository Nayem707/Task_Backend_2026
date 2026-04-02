/**
 * Likes Controller
 * Handles HTTP requests for likes endpoints
 */

const LikesService = require("../services/likes.service");
const { asyncHandler } = require("../middlewares/errorHandler");
const logger = require("../utils/logger");

class LikesController {
  constructor() {
    this.likesService = new LikesService();
  }

  /**
   * Toggle like on a post
   * POST /api/v1/likes/posts/:postId/toggle
   */
  togglePostLike = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    const result = await this.likesService.togglePostLike(req.user.id, postId);

    logger.logAudit(
      `POST_LIKE_${result.action.toUpperCase()}`,
      req.user.id,
      "Post",
      postId,
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: result,
      message: `Post ${result.action === "liked" ? "liked" : "unliked"} successfully`,
    });
  });

  /**
   * Toggle like on a comment
   * POST /api/v1/likes/comments/:commentId/toggle
   */
  toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const result = await this.likesService.toggleCommentLike(
      req.user.id,
      commentId,
    );

    logger.logAudit(
      `COMMENT_LIKE_${result.action.toUpperCase()}`,
      req.user.id,
      "Comment",
      commentId,
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: result,
      message: `Comment ${result.action === "liked" ? "liked" : "unliked"} successfully`,
    });
  });

  /**
   * Get all likes for a post
   * GET /api/v1/likes/posts/:postId
   */
  getPostLikes = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await this.likesService.getPostLikes(postId, {
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: result.data,
      pagination: result.pagination,
      message: "Post likes retrieved successfully",
    });
  });

  /**
   * Get all likes for a comment
   * GET /api/v1/likes/comments/:commentId
   */
  getCommentLikes = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await this.likesService.getCommentLikes(commentId, {
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: result.data,
      pagination: result.pagination,
      message: "Comment likes retrieved successfully",
    });
  });

  /**
   * Get post like statistics
   * GET /api/v1/likes/posts/:postId/stats
   */
  getPostLikeStats = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    const stats = await this.likesService.getPostLikeStats(postId);

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: stats,
      message: "Post like statistics retrieved successfully",
    });
  });

  /**
   * Get comment like statistics
   * GET /api/v1/likes/comments/:commentId/stats
   */
  getCommentLikeStats = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const stats = await this.likesService.getCommentLikeStats(commentId);

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: stats,
      message: "Comment like statistics retrieved successfully",
    });
  });
}

module.exports = LikesController;
