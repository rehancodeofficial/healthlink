// FILE: routes/webrtc.js
const express = require("express");
const router = express.Router();
const { getIceServers } = require("../lib/turnCredentials");
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
      // Fallback to local Coturn or Public STUN
      const iceConfig = getIceServers(userId);
      iceServers = iceConfig.iceServers;
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

/**
 * GET /api/webrtc/test-turn
 *
 * Test endpoint to verify TURN server configuration
 * Only available in development mode
 */
if (process.env.NODE_ENV !== "production") {
  router.get("/test-turn", authenticateToken, (req, res) => {
    const { generateTurnCredentials } = require("../lib/turnCredentials");

    try {
      const credentials = generateTurnCredentials(req.user.userId);

      res.json({
        success: true,
        message: "TURN credentials generated successfully",
        credentials,
        testInstructions:
          "Use https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/ to test connectivity",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });
}

module.exports = router;
