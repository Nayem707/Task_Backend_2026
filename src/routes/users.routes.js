const express = require("express");
const UsersController = require("../controllers/users.controller");
const { authenticate, optionalAuthenticate } = require("../middlewares/auth");
const { uploadSingle, handleUploadError } = require("../middlewares/upload");

const router = express.Router();
const usersController = new UsersController();

router.get("/me", authenticate, usersController.getMe);
router.patch(
  "/me",
  authenticate,
  uploadSingle("avatar"),
  handleUploadError,
  usersController.updateMe,
);
router.get("/search", optionalAuthenticate, usersController.searchUsers);
router.get("/:id", optionalAuthenticate, usersController.getUserById);
router.post("/:id/follow", authenticate, usersController.toggleFollow);
router.get(
  "/:id/followers",
  optionalAuthenticate,
  usersController.getFollowers,
);
router.get(
  "/:id/following",
  optionalAuthenticate,
  usersController.getFollowing,
);

module.exports = router;
