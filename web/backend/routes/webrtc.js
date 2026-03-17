// FILE: routes/webrtc.js
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");

/**
 * GET /api/webrtc/ice-servers
 *
 * Returns ICE server configuration including STUN and TURN servers
 * Generates time-limited TURN credentials for the authenticated user
 *
 * Authentication: Required (JWT)
 * Rate limit: 100 requests per 15 minutes
 */
router.get("/ice-servers", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID not found in token",
      });
    }

    let iceServers = [];

    // Check if Twilio is configured
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const client = require("twilio")(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
      );

      const token = await client.tokens.create();
      iceServers = token.iceServers;
    } else {
      console.warn("⚠️ TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN missing.");
      iceServers = [{ urls: "stun:stun.l.google.com:19302" }];
    }

    res.json({
      success: true,
      iceServers: iceServers,
      expiresAt: new Date(Date.now() + 86400 * 1000).toISOString(), // 24 hours
    });
  } catch (error) {
    console.error("Error generating ICE servers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate ICE server configuration",
    });
  }
});

module.exports = router;
