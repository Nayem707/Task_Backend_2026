const express = require("express");
const StoriesController = require("../controllers/stories.controller");
const { authenticate } = require("../middlewares/auth");
const { uploadSingle, handleUploadError } = require("../middlewares/upload");

const router = express.Router();
const storiesController = new StoriesController();

router.get("/", authenticate, storiesController.getStories);
router.post(
  "/",
  authenticate,
  uploadSingle("media"),
  handleUploadError,
  storiesController.createStory,
);
router.delete("/:id", authenticate, storiesController.deleteStory);
router.post("/:id/reaction", authenticate, storiesController.reactToStory);
router.get("/:id/reactions", authenticate, storiesController.getReactions);

module.exports = router;
