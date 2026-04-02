const GroupsService = require("../services/groups.service");
const { asyncHandler } = require("../middlewares/errorHandler");
const {
  createGroupSchema,
  updateGroupSchema,
  updateRoleSchema,
  groupPostSchema,
  groupCommentSchema,
} = require("../validators/groups.validator");
const { uploadSingle, handleUploadError } = require("../middlewares/upload");

class GroupsController {
  constructor() {
    this.groupsService = new GroupsService();
  }

  listGroups = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await this.groupsService.listGroups(req.user?.id, {
      page,
      limit,
    });
    res.sendSuccess(result, "Groups retrieved successfully");
  });

  createGroup = asyncHandler(async (req, res) => {
    const { error, value } = createGroupSchema.validate(req.body);
    if (error) return res.sendValidationError(error.details);
    const group = await this.groupsService.createGroup(req.user.id, value);
    res
      .status(201)
      .json({
        success: true,
        statusCode: 201,
        data: group,
        message: "Group created successfully",
      });
  });

  getGroup = asyncHandler(async (req, res) => {
    const group = await this.groupsService.getGroup(req.params.id);
    res.sendSuccess(group, "Group retrieved successfully");
  });

  updateGroup = asyncHandler(async (req, res) => {
    const { error, value } = updateGroupSchema.validate(req.body);
    if (error) return res.sendValidationError(error.details);
    const group = await this.groupsService.updateGroup(
      req.params.id,
      req.user.id,
      value,
    );
    res.sendSuccess(group, "Group updated successfully");
  });

  deleteGroup = asyncHandler(async (req, res) => {
    await this.groupsService.deleteGroup(req.params.id, req.user.id);
    res.sendSuccess(null, "Group deleted successfully");
  });

  toggleMembership = asyncHandler(async (req, res) => {
    const result = await this.groupsService.toggleMembership(
      req.params.id,
      req.user.id,
    );
    res.sendSuccess(result, `Successfully ${result.action} group`);
  });

  getMembers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await this.groupsService.getMembers(req.params.id, {
      page,
      limit,
    });
    res.sendSuccess(result, "Members retrieved successfully");
  });

  updateMemberRole = asyncHandler(async (req, res) => {
    const { error, value } = updateRoleSchema.validate(req.body);
    if (error) return res.sendValidationError(error.details);
    const result = await this.groupsService.updateMemberRole(
      req.params.id,
      req.params.userId,
      req.user.id,
      value.role,
    );
    res.sendSuccess(result, "Member role updated successfully");
  });

  getGroupFeed = asyncHandler(async (req, res) => {
    const cursor = req.query.cursor || undefined;
    const limit = parseInt(req.query.limit) || 20;
    const result = await this.groupsService.getGroupFeed(
      req.params.id,
      req.user.id,
      { cursor, limit },
    );
    res.sendSuccess(result, "Group feed retrieved successfully");
  });

  createGroupPost = asyncHandler(async (req, res) => {
    const data = { ...req.body };
    if (req.file) data.imageUrl = `/uploads/${req.file.filename}`;
    const { error, value } = groupPostSchema.validate(data);
    if (error) return res.sendValidationError(error.details);
    const post = await this.groupsService.createPost(
      req.params.id,
      req.user.id,
      value,
    );
    res
      .status(201)
      .json({
        success: true,
        statusCode: 201,
        data: post,
        message: "Post created successfully",
      });
  });

  deleteGroupPost = asyncHandler(async (req, res) => {
    await this.groupsService.deletePost(req.params.postId, req.user.id);
    res.sendSuccess(null, "Post deleted successfully");
  });

  togglePostLike = asyncHandler(async (req, res) => {
    const result = await this.groupsService.togglePostLike(
      req.params.postId,
      req.user.id,
    );
    res.sendSuccess(result, `Post ${result.action} successfully`);
  });

  addComment = asyncHandler(async (req, res) => {
    const { error, value } = groupCommentSchema.validate(req.body);
    if (error) return res.sendValidationError(error.details);
    const comment = await this.groupsService.addComment(
      req.params.postId,
      req.user.id,
      value.content,
    );
    res
      .status(201)
      .json({
        success: true,
        statusCode: 201,
        data: comment,
        message: "Comment added successfully",
      });
  });

  getPostComments = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await this.groupsService.getPostComments(
      req.params.postId,
      req.user.id,
      { page, limit },
    );
    res.sendSuccess(result, "Comments retrieved successfully");
  });

  addReply = asyncHandler(async (req, res) => {
    const { error, value } = groupCommentSchema.validate(req.body);
    if (error) return res.sendValidationError(error.details);
    const reply = await this.groupsService.addReply(
      req.params.commentId,
      req.user.id,
      value.content,
    );
    res
      .status(201)
      .json({
        success: true,
        statusCode: 201,
        data: reply,
        message: "Reply added successfully",
      });
  });

  deleteComment = asyncHandler(async (req, res) => {
    await this.groupsService.deleteComment(req.params.commentId, req.user.id);
    res.sendSuccess(null, "Comment deleted successfully");
  });

  toggleCommentLike = asyncHandler(async (req, res) => {
    const result = await this.groupsService.toggleCommentLike(
      req.params.commentId,
      req.user.id,
    );
    res.sendSuccess(result, `Comment ${result.action} successfully`);
  });
}

module.exports = GroupsController;
