/**
 * Comments Repository
 * Handles all database operations for comments and replies
 */

const { getPrismaClient } = require("../config/database");
const logger = require("../utils/logger");

const prisma = getPrismaClient();

class CommentsRepository {
  /**
   * Create a new comment or reply
   */
  async createComment(data) {
    try {
      const comment = await prisma.comment.create({
        data: {
          content: data.content,
          userId: data.userId,
          postId: data.postId,
          parentId: data.parentId || null,
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
          _count: {
            select: {
              replies: true,
              likes: true,
            },
          },
        },
      });

      logger.debug("Comment created successfully", { commentId: comment.id });
      return comment;
    } catch (error) {
      logger.error("Error creating comment:", error);
      throw error;
    }
  }

  /**
   * Get all comments for a post
   */
  async getPostComments(postId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;

      const skip = (page - 1) * limit;

      const [comments, total] = await Promise.all([
        prisma.comment.findMany({
          where: {
            postId,
            parentId: null, // Only top-level comments
          },
          skip,
          take: limit,
          orderBy: {
            [sortBy]: sortOrder,
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
            replies: {
              take: 3,
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
                _count: {
                  select: {
                    likes: true,
                  },
                },
              },
            },
            _count: {
              select: {
                replies: true,
                likes: true,
              },
            },
          },
        }),
        prisma.comment.count({
          where: {
            postId,
            parentId: null,
          },
        }),
      ]);

      return {
        data: comments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
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
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;

      const skip = (page - 1) * limit;

      const [replies, total] = await Promise.all([
        prisma.comment.findMany({
          where: {
            parentId: commentId,
          },
          skip,
          take: limit,
          orderBy: {
            [sortBy]: sortOrder,
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
            _count: {
              select: {
                likes: true,
              },
            },
          },
        }),
        prisma.comment.count({
          where: {
            parentId: commentId,
          },
        }),
      ]);

      return {
        data: replies,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
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
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
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
          _count: {
            select: {
              replies: true,
              likes: true,
            },
          },
        },
      });

      return comment;
    } catch (error) {
      logger.error("Error fetching comment:", error);
      throw error;
    }
  }

  /**
   * Update a comment
   */
  async updateComment(commentId, content) {
    try {
      const comment = await prisma.comment.update({
        where: { id: commentId },
        data: {
          content,
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
          _count: {
            select: {
              replies: true,
              likes: true,
            },
          },
        },
      });

      logger.debug("Comment updated successfully", { commentId });
      return comment;
    } catch (error) {
      logger.error("Error updating comment:", error);
      throw error;
    }
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId) {
    try {
      const comment = await prisma.comment.delete({
        where: { id: commentId },
      });

      logger.debug("Comment deleted successfully", { commentId });
      return comment;
    } catch (error) {
      logger.error("Error deleting comment:", error);
      throw error;
    }
  }

  /**
   * Check if user owns the comment
   */
  async isCommentOwner(commentId, userId) {
    try {
      const comment = await prisma.comment.findFirst({
        where: {
          id: commentId,
          userId,
        },
      });

      return comment !== null;
    } catch (error) {
      logger.error("Error checking comment ownership:", error);
      throw error;
    }
  }

  /**
   * Check if comment exists
   */
  async commentExists(commentId) {
    try {
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
      });

      return comment !== null;
    } catch (error) {
      logger.error("Error checking comment existence:", error);
      throw error;
    }
  }
}

module.exports = CommentsRepository;
