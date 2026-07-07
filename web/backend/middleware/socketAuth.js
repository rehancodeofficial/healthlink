// FILE: middleware/socketAuth.js
const jwt = require("jsonwebtoken");

/**
 * Socket.io authentication middleware
 * Validates JWT token from socket handshake and attaches user info to socket
 *
 * Usage:
 *   io.use(socketAuth);
 *
 * Client must send token in handshake:
 *   io('url', { auth: { token: 'jwt_token' } })
 *
 * NOTE: JWT tokens are signed as { id, role, type } — NOT { userId, role }.
 * Always read decoded.id for the user ID.
 */
module.exports = (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    console.warn(`⚠️ Socket connection attempt without token: ${socket.id}`);
    return next(new Error("Authentication required"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate token expiry explicitly (jwt.verify already does this, but keep for clarity)
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      console.warn(`⚠️ Expired token for socket: ${socket.id}`);
      return next(new Error("Token expired"));
    }

    // ✅ FIX: JWT tokens are signed with { id, role, type } — read decoded.id (not decoded.userId)
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    socket.userType = decoded.type || "USER";
    socket.userEmail = decoded.email || null;

    console.log(
      `✅ Socket authenticated: ${socket.id} (User: ${socket.userId}, Role: ${socket.userRole})`,
    );
    next();
  } catch (err) {
    console.error(`❌ Socket authentication failed: ${err.message}`);
    if (err.name === "TokenExpiredError") {
      return next(new Error("Token expired"));
    }
    return next(new Error("Invalid token"));
  }
};
