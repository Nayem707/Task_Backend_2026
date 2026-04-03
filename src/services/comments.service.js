/**
 * Comments Service
 * Business logic for comments and replies operations
 */

const CommentsRepository = require("../repositories/comments.repository");
const {
  NotFoundError,
  AuthorizationError,
  ValidationError,
} = require("../middlewares/errorHandler");
const { createNotification } = require("../utils/notificationHelper");
const logger = require("../utils/logger");
const { getPrismaClient } = require("../config/database");

const prisma = getPrismaClient();

class CommentsService {
  constructor() {
    this.commentsRepository = new CommentsRepository();
  }

  /**
   * Create a new comment on a post
   */
  async createComment(userId, postId, content) {
    try {
      if (!content || content.trim().length === 0) {
        throw new ValidationError("Comment content cannot be empty");
      }

      // Verify post exists
      const post = await prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        throw new NotFoundError("Post not found");
      }

      const comment = await this.commentsRepository.createComment({
        content: content.trim(),
        userId,
        postId,
        parentId: null,
      });

      if (post.userId !== userId) {
        await createNotification({
          userId: post.userId,
          type: "COMMENT",
          referenceId: postId,
          content: "commented on your post",
        });
      }

      logger.info("Comment created successfully", {
        commentId: comment.id,
        postId,
        userId,
      });
      return comment;
    } catch (error) {
      logger.error("Error creating comment:", error);
      throw error;
    }
  }

  /**
   * Create a reply to a comment
   */
  async createReply(userId, parentCommentId, content) {
    try {
      if (!content || content.trim().length === 0) {
        throw new ValidationError("Reply content cannot be empty");
      }

      // Verify parent comment exists and get its postId
      const parentComment =
        await this.commentsRepository.getCommentById(parentCommentId);

      logger.debug("Parent comment retrieved:", {
        parentCommentId,
        found: !!parentComment,
        postId: parentComment?.postId,
      });

      if (!parentComment) {
        throw new NotFoundError("Parent comment not found");
      }

      const reply = await this.commentsRepository.createComment({
        content: content.trim(),
        userId,
        postId: parentComment.postId,
        parentId: parentCommentId,
      });

      logger.info("Reply created successfully", {
        replyId: reply.id,
        parentCommentId,
        userId,
      });

      return reply;
    } catch (error) {
      logger.error("Error creating reply:", error);
      throw error;
    }
  }

  /**
   * Get all comments for a post
   */
  async getPostComments(postId, options = {}) {
    try {
      // Verify post exists
      const post = await prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        throw new NotFoundError("Post not found");
      }

      const result = await this.commentsRepository.getPostComments(postId, {
        page: options.page || 1,
        limit: options.limit || 10,
        sortBy: options.sortBy || "createdAt",
        sortOrder: options.sortOrder || "desc",
        viewerId: options.viewerId ?? null,
      });

      return result;
    } catch (error) {
      logger.error("Error fetching post comments:", error);
      throw error;
    }
  }

  /**
   * Get all replies for a comment
   */
  async getCommentReplies(commentId, options = {}) {
    try {
      // Verify comment exists
      const comment = await this.commentsRepository.getCommentById(commentId);

      if (!comment) {
        throw new NotFoundError("Comment not found");
      }

      const result = await this.commentsRepository.getCommentReplies(
        commentId,
        {
          page: options.page || 1,
          limit: options.limit || 10,
          sortBy: options.sortBy || "createdAt",
          sortOrder: options.sortOrder || "desc",
        },
      );

      return result;
    } catch (error) {
      logger.error("Error fetching comment replies:", error);
      throw error;
    }
  }

  /**
   * Get a single comment by ID
   */
  async getCommentById(commentId) {
    try {
      const comment = await this.commentsRepository.getCommentById(commentId);

      if (!comment) {
        throw new NotFoundError("Comment not found");
      }

      return comment;
    } catch (error) {
      logger.error("Error fetching comment:", error);
      throw error;
    }
  }

  /**
   * Update a comment
   */
  async updateComment(commentId, userId, content) {
    try {
      if (!content || content.trim().length === 0) {
        throw new ValidationError("Comment content cannot be empty");
      }

      const comment = await this.commentsRepository.getCommentById(commentId);

      if (!comment) {
        throw new NotFoundError("Comment not found");
      }

      // Check if user owns the comment
      if (comment.userId !== userId) {
        throw new AuthorizationError(
          "You do not have permission to update this comment",
        );
      }

      const updatedComment = await this.commentsRepository.updateComment(
        commentId,
        content.trim(),
      );

      logger.info("Comment updated successfully", { commentId, userId });
      return updatedComment;
    } catch (error) {
      logger.error("Error updating comment:", error);
      throw error;
    }
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId, userId) {
    try {
      const comment = await this.commentsRepository.getCommentById(commentId);

      if (!comment) {
        throw new NotFoundError("Comment not found");
      }

      // Check if user owns the comment
      if (comment.userId !== userId) {
        throw new AuthorizationError(
          "You do not have permission to delete this comment",
        );
      }

      await this.commentsRepository.deleteComment(commentId);

      logger.info("Comment deleted successfully", { commentId, userId });
      return { message: "Comment deleted successfully" };
    } catch (error) {
      logger.error("Error deleting comment:", error);
      throw error;
    }
  }
}

module.exports = CommentsService;
