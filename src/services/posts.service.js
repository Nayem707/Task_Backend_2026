/**
 * Posts Service
 * Business logic for posts operations
 */

const PostsRepository = require("../repositories/posts.repository");
const {
  NotFoundError,
  AuthorizationError,
  ValidationError,
} = require("../middlewares/errorHandler");
const { createNotification } = require("../utils/notificationHelper");
const logger = require("../utils/logger");

class PostsService {
  constructor() {
    this.postsRepository = new PostsRepository();
  }

  /**
   * Create a new post
   */
  async createPost(userId, data) {
    try {
      if (!data.content || data.content.trim().length === 0) {
        throw new ValidationError("Post content cannot be empty");
      }

      const post = await this.postsRepository.createPost({
        content: data.content.trim(),
        imageUrl: data.imageUrl,
        visibility: data.visibility || "PUBLIC",
        userId,
      });

      logger.info("Post created successfully", { postId: post.id, userId });
      return post;
    } catch (error) {
      logger.error("Error creating post:", error);
      throw error;
    }
  }

  /**
   * Get all posts
   */
  async getGlobalFeed({ cursor, limit = 10, viewerId } = {}) {
    try {
      return this.postsRepository.getCursorFeed({ cursor, limit, viewerId });
    } catch (error) {
      logger.error("Error fetching global feed:", error);
      throw error;
    }
  }

  async getAllPosts(options = {}) {
    try {
      const result = await this.postsRepository.getAllPosts({
        page: options.page || 1,
        limit: options.limit || 10,
        sortBy: options.sortBy || "createdAt",
        sortOrder: options.sortOrder || "desc",
        visibility: "PUBLIC",
      });

      return result;
    } catch (error) {
      logger.error("Error fetching all posts:", error);
      throw error;
    }
  }

  /**
   * Get a single post by ID
   */
  async getPostById(postId) {
    try {
      const post = await this.postsRepository.getPostById(postId);

      if (!post) {
        throw new NotFoundError("Post not found");
      }

      return post;
    } catch (error) {
      logger.error("Error fetching post:", error);
      throw error;
    }
  }

  /**
   * Update a post
   */
  async updatePost(postId, userId, data) {
    try {
      const post = await this.postsRepository.getPostById(postId);

      if (!post) {
        throw new NotFoundError("Post not found");
      }

      // Check if user owns the post
      if (post.userId !== userId) {
        throw new AuthorizationError(
          "You do not have permission to update this post",
        );
      }

      if (data.content && data.content.trim().length === 0) {
        throw new ValidationError("Post content cannot be empty");
      }

      const updatedPost = await this.postsRepository.updatePost(postId, {
        content: data.content ? data.content.trim() : post.content,
        imageUrl: data.imageUrl !== undefined ? data.imageUrl : post.imageUrl,
        visibility: data.visibility || post.visibility,
      });

      logger.info("Post updated successfully", { postId, userId });
      return updatedPost;
    } catch (error) {
      logger.error("Error updating post:", error);
      throw error;
    }
  }

  /**
   * Delete a post
   */
  async deletePost(postId, userId) {
    try {
      const post = await this.postsRepository.getPostById(postId);

      if (!post) {
        throw new NotFoundError("Post not found");
      }

      // Check if user owns the post
      if (post.userId !== userId) {
        throw new AuthorizationError(
          "You do not have permission to delete this post",
        );
      }

      await this.postsRepository.deletePost(postId);

      logger.info("Post deleted successfully", { postId, userId });
      return { message: "Post deleted successfully" };
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
      const result = await this.postsRepository.getUserPosts(userId, {
        page: options.page || 1,
        limit: options.limit || 10,
        sortBy: options.sortBy || "createdAt",
        sortOrder: options.sortOrder || "desc",
      });

      return result;
    } catch (error) {
      logger.error("Error fetching user posts:", error);
      throw error;
    }
  }

  /**
   * Get feed posts (mix of own posts and followed users' posts)
   */
  async getFeedPosts(userId, options = {}) {
    try {
      const result = await this.postsRepository.getAllPosts({
        page: options.page || 1,
        limit: options.limit || 10,
        sortBy: options.sortBy || "createdAt",
        sortOrder: options.sortOrder || "desc",
        visibility: "PUBLIC",
      });

      return result;
    } catch (error) {
      logger.error("Error fetching feed posts:", error);
      throw error;
    }
  }
}

module.exports = PostsService;
