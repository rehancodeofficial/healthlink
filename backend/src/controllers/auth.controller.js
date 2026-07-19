const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const login = asyncHandler(async (req, res) => {
  sendSuccess(res, { message: "Auth login endpoint active" }, "Login endpoint initialized");
});

const register = asyncHandler(async (req, res) => {
  sendSuccess(res, { message: "Auth register endpoint active" }, "Register endpoint initialized", 201);
});

module.exports = {
  login,
  register,
};
