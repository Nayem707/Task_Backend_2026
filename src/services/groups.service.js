const GroupsRepository = require("../repositories/groups.repository");
const {
  NotFoundError,
  AuthorizationError,
  ConflictError,
} = require("../middlewares/errorHandler");
const logger = require("../utils/logger");

class GroupsService {
  constructor() {
    this.groupsRepository = new GroupsRepository();
  }

  async createGroup(userId, data) {
    const group = await this.groupsRepository.create({
      ...data,
      ownerId: userId,
    });
    // Add owner as OWNER member
    await this.groupsRepository.addMember(group.id, userId, "OWNER");
    logger.info("Group created", { groupId: group.id, userId });
    return group;
  }

  async listGroups(userId, options) {
    return this.groupsRepository.listGroups({ ...options, userId });
  }

  async getGroup(groupId) {
    const group = await this.groupsRepository.findById(groupId);
    if (!group) throw new NotFoundError("Group");
    return group;
  }

  async updateGroup(groupId, userId, data) {
    const group = await this.groupsRepository.findById(groupId);
    if (!group) throw new NotFoundError("Group");

    const membership = await this.groupsRepository.getMembership(
      groupId,
      userId,
    );
    if (!membership || !["ADMIN", "OWNER"].includes(membership.role)) {
      throw new AuthorizationError("Only admins or owners can update group");
    }

    return this.groupsRepository.update(groupId, data);
  }

  async deleteGroup(groupId, userId) {
    const group = await this.groupsRepository.findById(groupId);
    if (!group) throw new NotFoundError("Group");
    if (group.ownerId !== userId)
      throw new AuthorizationError("Only owner can delete group");
    await this.groupsRepository.deleteById(groupId);
  }

  async toggleMembership(groupId, userId) {
    const group = await this.groupsRepository.findById(groupId);
    if (!group) throw new NotFoundError("Group");

    const existing = await this.groupsRepository.getMembership(groupId, userId);
    if (existing) {
      if (existing.role === "OWNER")
        throw new AuthorizationError("Owner cannot leave the group");
      await this.groupsRepository.removeMember(groupId, userId);
      return { action: "left" };
    }

    if (group.visibility === "PRIVATE") {
      throw new AuthorizationError("This group requires an invitation");
    }

    await this.groupsRepository.addMember(groupId, userId, "MEMBER");
    return { action: "joined" };
  }

  async getMembers(groupId, options) {
    const group = await this.groupsRepository.findById(groupId);
    if (!group) throw new NotFoundError("Group");
    return this.groupsRepository.getMembers(groupId, options);
  }

  async updateMemberRole(groupId, targetUserId, requesterId, role) {
    const group = await this.groupsRepository.findById(groupId);
    if (!group) throw new NotFoundError("Group");

    const requesterMembership = await this.groupsRepository.getMembership(
      groupId,
      requesterId,
    );
    if (
      !requesterMembership ||
      !["ADMIN", "OWNER"].includes(requesterMembership.role)
    ) {
      throw new AuthorizationError("Only admins or owners can change roles");
    }

    const targetMembership = await this.groupsRepository.getMembership(
      groupId,
      targetUserId,
    );
    if (!targetMembership) throw new NotFoundError("Member");

    return this.groupsRepository.updateMemberRole(groupId, targetUserId, role);
  }

  // Group Posts
  async createPost(groupId, authorId, data) {
    const group = await this.groupsRepository.findById(groupId);
    if (!group) throw new NotFoundError("Group");

    const membership = await this.groupsRepository.getMembership(
      groupId,
      authorId,
    );
    if (!membership)
      throw new AuthorizationError("You must be a member to post");

    return this.groupsRepository.createPost({ ...data, groupId, authorId });
  }

  async getGroupFeed(groupId, userId, options) {
    const group = await this.groupsRepository.findById(groupId);
    if (!group) throw new NotFoundError("Group");

    if (group.visibility !== "PUBLIC") {
      const membership = await this.groupsRepository.getMembership(
        groupId,
        userId,
      );
      if (!membership)
        throw new AuthorizationError("You must be a member to view this group");
    }

    return this.groupsRepository.getGroupFeed(groupId, options);
  }

  async deletePost(postId, userId) {
    const post = await this.groupsRepository.getPostById(postId);
    if (!post) throw new NotFoundError("Post");

    const membership = await this.groupsRepository.getMembership(
      post.groupId,
      userId,
    );
    if (
      post.authorId !== userId &&
      (!membership || !["ADMIN", "OWNER"].includes(membership.role))
    ) {
      throw new AuthorizationError("Not authorized to delete this post");
    }

    await this.groupsRepository.deletePost(postId);
  }

  async togglePostLike(postId, userId) {
    const post = await this.groupsRepository.getPostById(postId);
    if (!post) throw new NotFoundError("Post");

    const membership = await this.groupsRepository.getMembership(
      post.groupId,
      userId,
    );
    if (!membership)
      throw new AuthorizationError("You must be a member to like posts");

    return this.groupsRepository.togglePostLike(userId, postId);
  }

  // Group Comments
  async addComment(postId, userId, content, parentId = null) {
    const post = await this.groupsRepository.getPostById(postId);
    if (!post) throw new NotFoundError("Post");

    const membership = await this.groupsRepository.getMembership(
      post.groupId,
      userId,
    );
    if (!membership)
      throw new AuthorizationError("You must be a member to comment");

    return this.groupsRepository.createComment({
      content,
      userId,
      postId,
      parentId,
    });
  }

  async addReply(commentId, userId, content) {
    const comment = await this.groupsRepository.getCommentById(commentId);
    if (!comment) throw new NotFoundError("Comment");
    return this.addComment(comment.postId, userId, content, commentId);
  }

  async getPostComments(postId, userId, options) {
    const post = await this.groupsRepository.getPostById(postId);
    if (!post) throw new NotFoundError("Post");

    const membership = await this.groupsRepository.getMembership(
      post.groupId,
      userId,
    );
    if (!membership)
      throw new AuthorizationError("You must be a member to view comments");

    return this.groupsRepository.getPostComments(postId, options);
  }

  async deleteComment(commentId, userId) {
    const comment = await this.groupsRepository.getCommentById(commentId);
    if (!comment) throw new NotFoundError("Comment");

    const post = await this.groupsRepository.getPostById(comment.postId);
    const membership = await this.groupsRepository.getMembership(
      post.groupId,
      userId,
    );

    if (
      comment.userId !== userId &&
      (!membership || !["ADMIN", "OWNER"].includes(membership.role))
    ) {
      throw new AuthorizationError("Not authorized to delete this comment");
    }

    await this.groupsRepository.deleteComment(commentId);
  }

  async toggleCommentLike(commentId, userId) {
    const comment = await this.groupsRepository.getCommentById(commentId);
    if (!comment) throw new NotFoundError("Comment");
    return this.groupsRepository.toggleCommentLike(userId, commentId);
  }
}

module.exports = GroupsService;
