const UsersService = require("../services/users.service");
const { asyncHandler } = require("../middlewares/errorHandler");
const { updateProfileSchema } = require("../validators/users.validator");
const { uploadSingle, handleUploadError } = require("../middlewares/upload");
const path = require("path");

class UsersController {
  constructor() {
    this.usersService = new UsersService();
  }

  getMe = asyncHandler(async (req, res) => {
    const user = await this.usersService.getMe(req.user.id);
    res.sendSuccess(user, "Profile retrieved successfully");
  });

  updateMe = asyncHandler(async (req, res) => {
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) return res.sendValidationError(error.details);

    if (req.file) {
      value.avatarUrl = `/uploads/${req.file.filename}`;
    }

    const user = await this.usersService.updateMe(req.user.id, value);
    res.sendSuccess(user, "Profile updated successfully");
  });

  getUserById = asyncHandler(async (req, res) => {
    const user = await this.usersService.getUserById(
      req.params.id,
      req.user?.id,
    );
    res.sendSuccess(user, "User profile retrieved successfully");
  });

  toggleFollow = asyncHandler(async (req, res) => {
    const result = await this.usersService.toggleFollow(
      req.user.id,
      req.params.id,
    );
    res.sendSuccess(result, `User ${result.action} successfully`);
  });

  getFollowers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await this.usersService.getFollowers(req.params.id, {
      page,
      limit,
    });
    res.sendSuccess(result, "Followers retrieved successfully");
  });

  getFollowing = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await this.usersService.getFollowing(req.params.id, {
      page,
      limit,
    });
    res.sendSuccess(result, "Following list retrieved successfully");
  });

  searchUsers = asyncHandler(async (req, res) => {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await this.usersService.searchUsers(q, { page, limit });
    res.sendSuccess(result, "Users retrieved successfully");
  });
}

module.exports = UsersController;
