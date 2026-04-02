/**
 * Likes Repository
 * Handles all database operations for likes (on posts and comments)
 */

const { getPrismaClient } = require("../config/database");
const logger = require("../utils/logger");

const prisma = getPrismaClient();

class LikesRepository {
  /**
   * Toggle like on a post
   */
  async togglePostLike(userId, postId) {
    try {
      // Check if like already exists
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      if (existingLike) {
        // Unlike
        await prisma.like.delete({
          where: {
            id: existingLike.id,
          },
        });

        logger.debug("Post unliked successfully", { postId, userId });
        return { action: "unliked", liked: false };
      } else {
        // Like
        await prisma.like.create({
          data: {
            userId,
            postId,
          },
        });

        logger.debug("Post liked successfully", { postId, userId });
        return { action: "liked", liked: true };
      }
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
      // Check if like already exists
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_commentId: {
            userId,
            commentId,
          },
        },
      });

      if (existingLike) {
        // Unlike
        await prisma.like.delete({
          where: {
            id: existingLike.id,
          },
        });

        logger.debug("Comment unliked successfully", { commentId, userId });
        return { action: "unliked", liked: false };
      } else {
        // Like
        await prisma.like.create({
          data: {
            userId,
            commentId,
          },
        });

        logger.debug("Comment liked successfully", { commentId, userId });
        return { action: "liked", liked: true };
      }
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
      const { page = 1, limit = 10 } = options;

      const skip = (page - 1) * limit;

      const [likes, total] = await Promise.all([
        prisma.like.findMany({
          where: { postId },
          skip,
          take: limit,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        }),
        prisma.like.count({ where: { postId } }),
      ]);

      return {
        data: likes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
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
      const { page = 1, limit = 10 } = options;

      const skip = (page - 1) * limit;

      const [likes, total] = await Promise.all([
        prisma.like.findMany({
          where: { commentId },
          skip,
          take: limit,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        }),
        prisma.like.count({ where: { commentId } }),
      ]);

      return {
        data: likes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error("Error fetching comment likes:", error);
      throw error;
    }
  }

  /**
   * Get like count for a post
   */
  async getPostLikeCount(postId) {
    try {
      const count = await prisma.like.count({
        where: { postId },
      });

      return count;
    } catch (error) {
      logger.error("Error fetching post like count:", error);
      throw error;
    }
  }

  /**
   * Get like count for a comment
   */
  async getCommentLikeCount(commentId) {
    try {
      const count = await prisma.like.count({
        where: { commentId },
      });

      return count;
    } catch (error) {
      logger.error("Error fetching comment like count:", error);
      throw error;
    }
  }

  /**
   * Check if user liked a post
   */
  async hasUserLikedPost(userId, postId) {
    try {
      const like = await prisma.like.findUnique({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      return like !== null;
    } catch (error) {
      logger.error("Error checking if user liked post:", error);
      throw error;
    }
  }

  /**
   * Check if user liked a comment
   */
  async hasUserLikedComment(userId, commentId) {
    try {
      const like = await prisma.like.findUnique({
        where: {
          userId_commentId: {
            userId,
            commentId,
          },
        },
      });

      return like !== null;
    } catch (error) {
      logger.error("Error checking if user liked comment:", error);
      throw error;
    }
  }
}

module.exports = LikesRepository;
