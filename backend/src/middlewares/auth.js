// FILE: middleware/auth.js
const jwt = require("jsonwebtoken");

/**
 * Middleware to authenticate JWT tokens in HTTP requests
 * Expects 'Authorization: Bearer <token>' header
 * Attaches decoded user info to req.user
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res.status(403).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
}

module.exports = { authenticateToken };
