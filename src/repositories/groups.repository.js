const { getPrismaClient } = require("../config/database");
const logger = require("../utils/logger");

const prisma = getPrismaClient();

const USER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
};
const GROUP_SELECT = {
  id: true,
  name: true,
  description: true,
  avatarUrl: true,
  coverUrl: true,
  visibility: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { members: true, posts: true } },
};

class GroupsRepository {
  async create(data) {
    return prisma.group.create({
      data,
      include: {
        owner: { select: USER_SELECT },
        _count: { select: { members: true, posts: true } },
      },
    });
  }

  async findById(id) {
    return prisma.group.findUnique({
      where: { id },
      include: {
        owner: { select: USER_SELECT },
        _count: { select: { members: true, posts: true } },
      },
    });
  }

  async listGroups({ page = 1, limit = 20, userId } = {}) {
    const skip = (page - 1) * limit;
    const where = userId
      ? { OR: [{ visibility: "PUBLIC" }, { members: { some: { userId } } }] }
      : { visibility: "PUBLIC" };

    const [groups, total] = await Promise.all([
      prisma.group.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: GROUP_SELECT,
      }),
      prisma.group.count({ where }),
    ]);
    return { data: groups, total, page, limit };
  }

  async update(id, data) {
    return prisma.group.update({ where: { id }, data, select: GROUP_SELECT });
  }

  async deleteById(id) {
    return prisma.group.delete({ where: { id } });
  }

  async getMembership(groupId, userId) {
    return prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
  }

  async addMember(groupId, userId, role = "MEMBER") {
    return prisma.groupMember.create({ data: { groupId, userId, role } });
  }

  async removeMember(groupId, userId) {
    return prisma.groupMember.delete({
      where: { groupId_userId: { groupId, userId } },
    });
  }

  async updateMemberRole(groupId, userId, role) {
    return prisma.groupMember.update({
      where: { groupId_userId: { groupId, userId } },
      data: { role },
    });
  }

  async getMembers(groupId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.groupMember.findMany({
        where: { groupId },
        skip,
        take: limit,
        include: { user: { select: USER_SELECT } },
      }),
      prisma.groupMember.count({ where: { groupId } }),
    ]);
    return { data: items, total, page, limit };
  }

  // Group Posts
  async createPost(data) {
    return prisma.groupPost.create({
      data,
      include: {
        author: { select: USER_SELECT },
        _count: { select: { comments: true, likes: true } },
      },
    });
  }

  async getPostById(id) {
    return prisma.groupPost.findUnique({
      where: { id },
      include: {
        author: { select: USER_SELECT },
        group: { select: { id: true, name: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });
  }

  async getGroupFeed(groupId, { cursor, limit = 20 } = {}) {
    const posts = await prisma.groupPost.findMany({
      where: { groupId },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: USER_SELECT },
        _count: { select: { comments: true, likes: true } },
      },
    });
    const hasNextPage = posts.length > limit;
    const items = hasNextPage ? posts.slice(0, limit) : posts;
    return {
      data: items,
      nextCursor: hasNextPage ? items[items.length - 1].id : null,
    };
  }

  async deletePost(id) {
    return prisma.groupPost.delete({ where: { id } });
  }

  async togglePostLike(userId, postId) {
    const existing = await prisma.groupLike.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    if (existing) {
      await prisma.groupLike.delete({ where: { id: existing.id } });
      return { action: "unliked", liked: false };
    }
    await prisma.groupLike.create({ data: { userId, postId } });
    return { action: "liked", liked: true };
  }

  // Group Comments
  async createComment(data) {
    return prisma.groupComment.create({
      data,
      include: {
        user: { select: USER_SELECT },
        _count: { select: { likes: true, replies: true } },
      },
    });
  }

  async getCommentById(id) {
    return prisma.groupComment.findUnique({
      where: { id },
      include: { user: { select: USER_SELECT } },
    });
  }

  async getPostComments(postId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.groupComment.findMany({
        where: { postId, parentId: null },
        skip,
        take: limit,
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: USER_SELECT },
          replies: {
            take: 3,
            include: {
              user: { select: USER_SELECT },
              _count: { select: { likes: true } },
            },
          },
          _count: { select: { likes: true, replies: true } },
        },
      }),
      prisma.groupComment.count({ where: { postId, parentId: null } }),
    ]);
    return { data: items, total, page, limit };
  }

  async deleteComment(id) {
    return prisma.groupComment.delete({ where: { id } });
  }

  async toggleCommentLike(userId, commentId) {
    const existing = await prisma.groupLike.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });
    if (existing) {
      await prisma.groupLike.delete({ where: { id: existing.id } });
      return { action: "unliked", liked: false };
    }
    await prisma.groupLike.create({ data: { userId, commentId } });
    return { action: "liked", liked: true };
  }
}

module.exports = GroupsRepository;
