const { verifyToken } = require("./rbac");
const { authenticateToken } = require("./auth");

module.exports = {
  authMiddleware: verifyToken,
  authenticateToken,
  verifyToken,
};
