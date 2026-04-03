/**
 * Comments Controller
 * Handles HTTP requests for comments and replies endpoints
 */

const CommentsService = require("../services/comments.service");
const { asyncHandler } = require("../middlewares/errorHandler");
const {
  createCommentSchema,
  updateCommentSchema,
} = require("../validators/comments.validator");
const logger = require("../utils/logger");

class CommentsController {
  constructor() {
    this.commentsService = new CommentsService();
  }

  /**
   * Create a comment on a post
   * POST /api/v1/posts/:postId/comments
   */
  createComment = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    const { error, value } = createCommentSchema.validate(req.body);
    if (error) {
      return res.sendValidationError(error.details);
    }

    const comment = await this.commentsService.createComment(
      req.user.id,
      postId,
      value.content,
    );

    logger.logAudit(
      "COMMENT_CREATE",
      req.user.id,
      "Comment",
      comment.id,
      null,
      {
        postId,
        content: value.content.substring(0, 50).concat("..."),
      },
    );

    res.status(201).json({
      success: true,
      statusCode: 201,
      data: comment,
      message: "Comment created successfully",
    });
  });

  /**
   * Get all comments for a post
   * GET /api/v1/posts/:postId/comments
   */
  getPostComments = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder || "desc";

    const result = await this.commentsService.getPostComments(postId, {
      page,
      limit,
      sortBy,
      sortOrder,
      viewerId: req.user?.id ?? null,
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: result.data,
      pagination: result.pagination,
      message: "Comments retrieved successfully",
    });
  });

  /**
   * Create a reply to a comment
   * POST /api/v1/comments/:commentId/replies
   */
  createReply = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const { error, value } = createCommentSchema.validate(req.body);
    if (error) {
      return res.sendValidationError(error.details);
    }

    const reply = await this.commentsService.createReply(
      req.user.id,
      commentId,
      value.content,
    );

    logger.logAudit("REPLY_CREATE", req.user.id, "Reply", reply.id, null, {
      commentId,
      content: value.content.substring(0, 50).concat("..."),
    });

    res.status(201).json({
      success: true,
      statusCode: 201,
      data: reply,
      message: "Reply created successfully",
    });
  });

  /**
   * Get all replies for a comment
   * GET /api/v1/comments/:commentId/replies
   */
  getCommentReplies = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder || "desc";

    const result = await this.commentsService.getCommentReplies(commentId, {
      page,
      limit,
      sortBy,
      sortOrder,
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: result.data,
      pagination: result.pagination,
      message: "Replies retrieved successfully",
    });
  });

  /**
   * Get a single comment
   * GET /api/v1/comments/:commentId
   */
  getComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const comment = await this.commentsService.getCommentById(commentId);

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: comment,
      message: "Comment retrieved successfully",
    });
  });

  /**
   * Update a comment
   * PUT /api/v1/comments/:commentId
   */
  updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const { error, value } = updateCommentSchema.validate(req.body);
    if (error) {
      return res.sendValidationError(error.details);
    }

    const comment = await this.commentsService.updateComment(
      commentId,
      req.user.id,
      value.content,
    );

    logger.logAudit("COMMENT_UPDATE", req.user.id, "Comment", commentId, null, {
      content: value.content.substring(0, 50).concat("..."),
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: comment,
      message: "Comment updated successfully",
    });
  });

  /**
   * Delete a comment
   * DELETE /api/v1/comments/:commentId
   */
  deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    await this.commentsService.deleteComment(commentId, req.user.id);

    logger.logAudit("COMMENT_DELETE", req.user.id, "Comment", commentId);

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: null,
      message: "Comment deleted successfully",
    });
  });

  toggleCommentLike = asyncHandler(async (req, res) => {
    const LikesService = require("../services/likes.service");
    const likesService = new LikesService();
    const result = await likesService.toggleCommentLike(
      req.user.id,
      req.params.commentId,
    );
    res.sendSuccess(result, `Comment ${result.action} successfully`);
  });

  getCommentLikes = asyncHandler(async (req, res) => {
    const LikesService = require("../services/likes.service");
    const likesService = new LikesService();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await likesService.getCommentLikes(req.params.commentId, {
      page,
      limit,
    });
    res.sendSuccess(result, "Comment likes retrieved successfully");
  });
}

module.exports = CommentsController;
