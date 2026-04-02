const { getPrismaClient } = require("../config/database");
const logger = require("../utils/logger");

const prisma = getPrismaClient();

const STORY_SELECT = {
  id: true,
  mediaUrl: true,
  caption: true,
  expiresAt: true,
  createdAt: true,
  user: {
    select: { id: true, firstName: true, lastName: true, avatarUrl: true },
  },
  _count: { select: { reactions: true } },
};

class StoriesRepository {
  async create(data) {
    return prisma.story.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async findById(id) {
    return prisma.story.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        _count: { select: { reactions: true } },
      },
    });
  }

  async getActiveStoriesFromFollowed(userId) {
    const now = new Date();
    const followedIds = await prisma.follow
      .findMany({
        where: { followerId: userId },
        select: { followingId: true },
      })
      .then((rows) => rows.map((r) => r.followingId));

    return prisma.story.findMany({
      where: { userId: { in: followedIds }, expiresAt: { gt: now } },
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
        _count: { select: { reactions: true } },
      },
    });
  }

  async deleteById(id) {
    return prisma.story.delete({ where: { id } });
  }

  async upsertReaction(userId, storyId, reaction) {
    return prisma.storyReaction.upsert({
      where: { userId_storyId: { userId, storyId } },
      create: { userId, storyId, reaction },
      update: { reaction },
    });
  }

  async getReactions(storyId) {
    return prisma.storyReaction.findMany({
      where: { storyId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

module.exports = StoriesRepository;
