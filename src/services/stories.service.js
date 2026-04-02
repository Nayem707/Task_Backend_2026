const StoriesRepository = require("../repositories/stories.repository");
const {
  NotFoundError,
  AuthorizationError,
} = require("../middlewares/errorHandler");
const { createNotification } = require("../utils/notificationHelper");
const logger = require("../utils/logger");

class StoriesService {
  constructor() {
    this.storiesRepository = new StoriesRepository();
  }

  async createStory(userId, data) {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    const story = await this.storiesRepository.create({
      ...data,
      userId,
      expiresAt,
    });
    logger.info("Story created", { storyId: story.id, userId });
    return story;
  }

  async getStories(userId) {
    return this.storiesRepository.getActiveStoriesFromFollowed(userId);
  }

  async deleteStory(storyId, userId) {
    const story = await this.storiesRepository.findById(storyId);
    if (!story) throw new NotFoundError("Story");
    if (story.userId !== userId) throw new AuthorizationError("Not your story");
    await this.storiesRepository.deleteById(storyId);
  }

  async reactToStory(storyId, userId, reaction) {
    const story = await this.storiesRepository.findById(storyId);
    if (!story) throw new NotFoundError("Story");

    const result = await this.storiesRepository.upsertReaction(
      userId,
      storyId,
      reaction,
    );

    if (story.userId !== userId) {
      await createNotification({
        userId: story.userId,
        type: "STORY_REACTION",
        referenceId: storyId,
        content: `reacted ${reaction} to your story`,
      });
    }
    return result;
  }

  async getReactions(storyId) {
    const story = await this.storiesRepository.findById(storyId);
    if (!story) throw new NotFoundError("Story");
    return this.storiesRepository.getReactions(storyId);
  }
}

module.exports = StoriesService;
