const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const usersRepository = require("../repositories/users.repository");

const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.params.id;
  if (!userId) return sendError(res, "User ID parameter is required", 400);
  const user = await usersRepository.findById(userId);
  if (!user) return sendError(res, "User profile not found", 404);
  return sendSuccess(res, user, "User profile retrieved successfully");
});

module.exports = {
  getUserProfile,
};
