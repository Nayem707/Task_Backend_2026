/**
 * Posts Repository
 * Handles all database operations for posts
 */

const { getPrismaClient } = require("../config/database");
const logger = require("../utils/logger");

const prisma = getPrismaClient();

class PostsRepository {
  /**
   * Create a new post
   */
  async createPost(data) {
    try {
      const post = await prisma.post.create({
        data: {
          content: data.content,
          imageUrl: data.images?.[0] ?? data.imageUrl ?? null,
          visibility: data.visibility || "PUBLIC",
          userId: data.userId,
          ...(data.images?.length
            ? {
                images: {
                  create: data.images.map((url, idx) => ({ url, order: idx })),
                },
              }
            : {}),
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
          images: { orderBy: { order: "asc" } },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
      });

      logger.debug("Post created successfully", { postId: post.id });
      return post;
    } catch (error) {
      logger.error("Error creating post:", error);
      throw error;
    }
  }

  /**
   * Cursor-based feed for global or user feed
   */
  async getCursorFeed({ cursor, limit = 10, viewerId = null } = {}) {
    try {
      const where = {
        OR: [
          { visibility: "PUBLIC" },
          ...(viewerId ? [{ userId: viewerId, visibility: "PRIVATE" }] : []),
        ],
      };

      const posts = await prisma.post.findMany({
        where,
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          images: { orderBy: { order: "asc" } },
          _count: { select: { comments: true, likes: true } },
        },
      });

      const hasNextPage = posts.length > limit;
      const items = hasNextPage ? posts.slice(0, limit) : posts;

      // Attach likedByMe for the authenticated viewer
      if (viewerId && items.length > 0) {
        const postIds = items.map((p) => p.id);
        const likedRows = await prisma.like.findMany({
          where: { userId: viewerId, postId: { in: postIds } },
          select: { postId: true },
        });
        const likedSet = new Set(likedRows.map((r) => r.postId));
        items.forEach((p) => {
          p.likedByMe = likedSet.has(p.id);
        });
      } else {
        items.forEach((p) => {
          p.likedByMe = false;
        });
      }

      return {
        data: items,
        nextCursor: hasNextPage ? items[items.length - 1].id : null,
      };
    } catch (error) {
      logger.error("Error fetching cursor feed:", error);
      throw error;
    }
  }

  /**
   * Get all posts with pagination and filtering
   */
  async getAllPosts(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        userId = null,
        visibility = "PUBLIC",
      } = options;

      const skip = (page - 1) * limit;

      // Build where clause
      const where = {
        visibility: visibility,
      };

      if (userId) {
        where.userId = userId;
      }

      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where,
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
            images: { orderBy: { order: "asc" } },
            _count: {
              select: {
                comments: true,
                likes: true,
              },
            },
          },
        }),
        prisma.post.count({ where }),
      ]);

      return {
        data: posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error("Error fetching posts:", error);
      throw error;
    }
  }

  /**
   * Get a single post by ID
   */
  async getPostById(postId) {
    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
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
          comments: {
            where: {
              parentId: null,
            },
            take: 5,
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
                  replies: true,
                  likes: true,
                },
              },
            },
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
          images: { orderBy: { order: "asc" } },
        },
      });

      return post;
    } catch (error) {
      logger.error("Error fetching post:", error);
      throw error;
    }
  }

  /**
   * Update a post
   */
  async updatePost(postId, data) {
    try {
      const post = await prisma.post.update({
        where: { id: postId },
        data: {
          content: data.content,
          imageUrl: data.imageUrl,
          visibility: data.visibility,
          ...(data.images?.length
            ? {
                images: {
                  deleteMany: {},
                  create: data.images.map((url, idx) => ({ url, order: idx })),
                },
              }
            : {}),
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
          images: { orderBy: { order: "asc" } },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
      });

      logger.debug("Post updated successfully", { postId: post.id });
      return post;
    } catch (error) {
      logger.error("Error updating post:", error);
      throw error;
    }
  }

  /**
   * Delete a post
   */
  async deletePost(postId) {
    try {
      const post = await prisma.post.delete({
        where: { id: postId },
      });

      logger.debug("Post deleted successfully", { postId: post.id });
      return post;
    } catch (error) {
      logger.error("Error deleting post:", error);
      throw error;
    }
  }

  /**
   * Get user's posts
   */
  async getUserPosts(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;

      const skip = (page - 1) * limit;

      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where: { userId },
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
            images: { orderBy: { order: "asc" } },
            _count: {
              select: {
                comments: true,
                likes: true,
              },
            },
          },
        }),
        prisma.post.count({ where: { userId } }),
      ]);

      return {
        data: posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error("Error fetching user posts:", error);
      throw error;
    }
  }

  /**
   * Get network feed posts for a user (self + followers + following)
   */
  async getNetworkFeedPosts(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;

      const skip = (page - 1) * limit;

      const [followers, following] = await Promise.all([
        prisma.follow.findMany({
          where: { followingId: userId },
          select: { followerId: true },
        }),
        prisma.follow.findMany({
          where: { followerId: userId },
          select: { followingId: true },
        }),
      ]);

      const networkUserIds = [
        userId,
        ...followers.map((item) => item.followerId),
        ...following.map((item) => item.followingId),
      ];

      const uniqueNetworkUserIds = [...new Set(networkUserIds)];

      const where = {
        userId: { in: uniqueNetworkUserIds },
        OR: [{ visibility: "PUBLIC" }, { userId }],
      };

      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where,
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
            images: { orderBy: { order: "asc" } },
            _count: {
              select: {
                comments: true,
                likes: true,
              },
            },
          },
        }),
        prisma.post.count({ where }),
      ]);

      return {
        data: posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error("Error fetching network feed posts:", error);
      throw error;
    }
  }

  /**
   * Check if user owns the post
   */
  async isPostOwner(postId, userId) {
    try {
      const post = await prisma.post.findFirst({
        where: {
          id: postId,
          userId: userId,
        },
      });

      return post !== null;
    } catch (error) {
      logger.error("Error checking post ownership:", error);
      throw error;
    }
  }
}

module.exports = PostsRepository;
