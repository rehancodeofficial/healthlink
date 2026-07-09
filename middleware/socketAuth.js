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
 */
module.exports = (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    console.warn(`⚠️ Socket connection attempt without token: ${socket.id}`);
    return next(new Error("Authentication required"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to socket (JWT signs as { id, role, type })
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    socket.userEmail = decoded.email || null;

    console.log(
      `✅ Socket authenticated: ${socket.id} (User: ${socket.userId}, Role: ${socket.userRole})`,
    );
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      console.warn(`⚠️ Token expired for socket: ${socket.id}`);
      return next(new Error("Token expired"));
    }
    console.error(`❌ Socket authentication failed:`, err.message);
    next(new Error("Invalid token"));
  }
};
