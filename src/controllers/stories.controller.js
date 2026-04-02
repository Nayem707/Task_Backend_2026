const StoriesService = require("../services/stories.service");
const { asyncHandler } = require("../middlewares/errorHandler");
const {
  createStorySchema,
  storyReactionSchema,
} = require("../validators/stories.validator");
const { uploadSingle, handleUploadError } = require("../middlewares/upload");

class StoriesController {
  constructor() {
    this.storiesService = new StoriesService();
  }

  getStories = asyncHandler(async (req, res) => {
    const stories = await this.storiesService.getStories(req.user.id);
    res.sendSuccess(stories, "Stories retrieved successfully");
  });

  createStory = asyncHandler(async (req, res) => {
    const data = { ...req.body };
    if (req.file) {
      data.mediaUrl = `/uploads/${req.file.filename}`;
    }
    const { error, value } = createStorySchema.validate(data);
    if (error) return res.sendValidationError(error.details);

    const story = await this.storiesService.createStory(req.user.id, value);
    res
      .status(201)
      .json({
        success: true,
        statusCode: 201,
        data: story,
        message: "Story created successfully",
      });
  });

  deleteStory = asyncHandler(async (req, res) => {
    await this.storiesService.deleteStory(req.params.id, req.user.id);
    res.sendSuccess(null, "Story deleted successfully");
  });

  reactToStory = asyncHandler(async (req, res) => {
    const { error, value } = storyReactionSchema.validate(req.body);
    if (error) return res.sendValidationError(error.details);
    const result = await this.storiesService.reactToStory(
      req.params.id,
      req.user.id,
      value.reaction,
    );
    res.sendSuccess(result, "Reaction added successfully");
  });

  getReactions = asyncHandler(async (req, res) => {
    const reactions = await this.storiesService.getReactions(req.params.id);
    res.sendSuccess(reactions, "Reactions retrieved successfully");
  });
}

module.exports = StoriesController;
