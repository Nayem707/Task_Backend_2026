const express = require("express");
const GroupsController = require("../controllers/groups.controller");
const { authenticate, optionalAuthenticate } = require("../middlewares/auth");
const { uploadSingle, handleUploadError } = require("../middlewares/upload");

const router = express.Router();
const groupsController = new GroupsController();

// Group CRUD
router.get("/", optionalAuthenticate, groupsController.listGroups);
router.post("/", authenticate, groupsController.createGroup);
router.get("/:id", optionalAuthenticate, groupsController.getGroup);
router.patch("/:id", authenticate, groupsController.updateGroup);
router.delete("/:id", authenticate, groupsController.deleteGroup);

// Membership
router.post("/:id/join", authenticate, groupsController.toggleMembership);
router.get("/:id/members", authenticate, groupsController.getMembers);
router.patch(
  "/:id/members/:userId",
  authenticate,
  groupsController.updateMemberRole,
);

// Group Feed & Posts
router.get("/:id/posts", authenticate, groupsController.getGroupFeed);
router.post(
  "/:id/posts",
  authenticate,
  uploadSingle("image"),
  handleUploadError,
  groupsController.createGroupPost,
);

// Group post operations
router.delete("/posts/:postId", authenticate, groupsController.deleteGroupPost);
router.post(
  "/posts/:postId/like",
  authenticate,
  groupsController.togglePostLike,
);
router.get(
  "/posts/:postId/comments",
  authenticate,
  groupsController.getPostComments,
);
router.post(
  "/posts/:postId/comments",
  authenticate,
  groupsController.addComment,
);

// Group comment operations
router.post(
  "/comments/:commentId/replies",
  authenticate,
  groupsController.addReply,
);
router.delete(
  "/comments/:commentId",
  authenticate,
  groupsController.deleteComment,
);
router.post(
  "/comments/:commentId/like",
  authenticate,
  groupsController.toggleCommentLike,
);

module.exports = router;
