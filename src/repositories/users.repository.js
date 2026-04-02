const { getPrismaClient } = require("../config/database");
const logger = require("../utils/logger");

const prisma = getPrismaClient();

const USER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  bio: true,
  avatarUrl: true,
  coverUrl: true,
  isActive: true,
  createdAt: true,
};

class UsersRepository {
  async findById(userId) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: USER_SELECT,
    });
  }

  async findByIdWithStats(userId, viewerId = null) {
    const user = await prisma.user.findUnique({
      where: { id: userId, isActive: true },
      select: {
        ...USER_SELECT,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) return null;

    let isFollowing = false;
    if (viewerId && viewerId !== userId) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: { followerId: viewerId, followingId: userId },
        },
      });
      isFollowing = !!follow;
    }

    return { ...user, isFollowing };
  }

  async update(userId, data) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: USER_SELECT,
    });
  }

  async toggleFollow(followerId, followingId) {
    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });

    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      return { action: "unfollowed" };
    } else {
      await prisma.follow.create({ data: { followerId, followingId } });
      return { action: "followed" };
    }
  }

  async getFollowers(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followingId: userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { follower: { select: USER_SELECT } },
      }),
      prisma.follow.count({ where: { followingId: userId } }),
    ]);
    return { data: items.map((f) => f.follower), total, page, limit };
  }

  async getFollowing(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { following: { select: USER_SELECT } },
      }),
      prisma.follow.count({ where: { followerId: userId } }),
    ]);
    return { data: items.map((f) => f.following), total, page, limit };
  }

  async search(query, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const where = {
      isActive: true,
      OR: [
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    };
    const [items, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take: limit, select: USER_SELECT }),
      prisma.user.count({ where }),
    ]);
    return { data: items, total, page, limit };
  }
}

module.exports = UsersRepository;
