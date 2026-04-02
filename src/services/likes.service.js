/**
 * Likes Service
 * Business logic for likes operations
 */

const LikesRepository = require("../repositories/likes.repository");
const { NotFoundError } = require("../middlewares/errorHandler");
const { createNotification } = require("../utils/notificationHelper");
const logger = require("../utils/logger");
const { getPrismaClient } = require("../config/database");

const prisma = getPrismaClient();

class LikesService {
  constructor() {
    this.likesRepository = new LikesRepository();
  }

  /**
   * Toggle like on a post
   */
  async togglePostLike(userId, postId) {
    try {
      // Verify post exists
      const post = await prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        throw new NotFoundError("Post not found");
      }

      const result = await this.likesRepository.togglePostLike(userId, postId);

      if (result.action === "liked" && post.userId !== userId) {
        await createNotification({
          userId: post.userId,
          type: "LIKE",
          referenceId: postId,
          content: "liked your post",
        });
      }

      logger.info("Post like toggled successfully", {
        postId,
        userId,
        action: result.action,
      });
      return result;
    } catch (error) {
      logger.error("Error toggling post like:", error);
      throw error;
    }
  }

  /**
   * Toggle like on a comment
   */
  async toggleCommentLike(userId, commentId) {
    try {
      // Verify comment exists
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
      });

      if (!comment) {
        throw new NotFoundError("Comment not found");
      }

      const result = await this.likesRepository.toggleCommentLike(
        userId,
        commentId,
      );

      if (result.action === "liked" && comment.userId !== userId) {
        await createNotification({
          userId: comment.userId,
          type: "LIKE",
          referenceId: commentId,
          content: "liked your comment",
        });
      }

      logger.info("Comment like toggled successfully", {
        commentId,
        userId,
        action: result.action,
      });
      return result;
    } catch (error) {
      logger.error("Error toggling comment like:", error);
      throw error;
    }
  }

  /**
   * Get all likes for a post
   */
  async getPostLikes(postId, options = {}) {
    try {
      // Verify post exists
      const post = await prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        throw new NotFoundError("Post not found");
      }

      const result = await this.likesRepository.getPostLikes(postId, {
        page: options.page || 1,
        limit: options.limit || 10,
      });

      return result;
    } catch (error) {
      logger.error("Error fetching post likes:", error);
      throw error;
    }
  }

  /**
   * Get all likes for a comment
   */
  async getCommentLikes(commentId, options = {}) {
    try {
      // Verify comment exists
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
      });

      if (!comment) {
        throw new NotFoundError("Comment not found");
      }

      const result = await this.likesRepository.getCommentLikes(commentId, {
        page: options.page || 1,
        limit: options.limit || 10,
      });

      return result;
    } catch (error) {
      logger.error("Error fetching comment likes:", error);
      throw error;
    }
  }

  /**
   * Get like statistics for a post
   */
  async getPostLikeStats(postId) {
    try {
      // Verify post exists
      const post = await prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        throw new NotFoundError("Post not found");
      }

      const count = await this.likesRepository.getPostLikeCount(postId);

      return {
        postId,
        likeCount: count,
      };
    } catch (error) {
      logger.error("Error fetching post statistics:", error);
      throw error;
    }
  }

  /**
   * Get like statistics for a comment
   */
  async getCommentLikeStats(commentId) {
    try {
      // Verify comment exists
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
      });

      if (!comment) {
        throw new NotFoundError("Comment not found");
      }

      const count = await this.likesRepository.getCommentLikeCount(commentId);

      return {
        commentId,
        likeCount: count,
      };
    } catch (error) {
      logger.error("Error fetching comment statistics:", error);
      throw error;
    }
  }
}

module.exports = LikesService;
