// FILE: lib/turnCredentials.js
const crypto = require("crypto");

/**
 * Generate time-limited TURN credentials using HMAC-SHA1
 * Compatible with Coturn's REST API authentication
 *
 * @param {string} userId - Unique user identifier
 * @param {number} ttl - Time-to-live in seconds (default: 24 hours)
 * @returns {Object} TURN credentials with username, password, and URIs
 */
function generateTurnCredentials(userId, ttl = 86400) {
  const timestamp = Math.floor(Date.now() / 1000) + ttl;
  const username = `${timestamp}:${userId}`;
  const secret = process.env.TURN_SECRET_KEY;

  if (!secret) {
    throw new Error("TURN_SECRET_KEY environment variable not set");
  }

  // Generate HMAC-SHA1 credential
  const hmac = crypto.createHmac("sha1", secret);
  hmac.update(username);
  const credential = hmac.digest("base64");

  const turnServerUrl = process.env.TURN_SERVER_URL || "turn.example.com";

  return {
    username,
    credential,
    ttl,
    uris: [
      `turn:${turnServerUrl}:3478`,
      `turn:${turnServerUrl}:3478?transport=tcp`,
      `turns:${turnServerUrl}:5349?transport=tcp`,
    ],
  };
}

/**
 * Generate complete ICE server configuration including STUN and TURN
 *
 * @param {string} userId - User identifier for TURN credentials
 * @returns {Object} Complete ICE servers configuration for RTCPeerConnection
 */
function getIceServers(userId) {
  const iceServers = [
    // Public STUN servers
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" },
  ];

  // Add TURN server if configured
  if (process.env.TURN_SERVER_URL && process.env.TURN_SECRET_KEY) {
    const turnCreds = generateTurnCredentials(userId);
    iceServers.push({
      urls: turnCreds.uris,
      username: turnCreds.username,
      credential: turnCreds.credential,
    });
  } else {
    console.warn(
      "⚠️ TURN server not configured. WebRTC may fail on restrictive networks.",
    );
  }

  return { iceServers };
}

module.exports = {
  generateTurnCredentials,
  getIceServers,
};
