
const express = require("express");
const router = express.Router();
const { AccessToken } = require("twilio").jwt;
const VideoGrant = AccessToken.VideoGrant;
const { verifyToken, requireRole } = require("../middleware/rbac.js");
require("dotenv").config();


/**
 * @route POST /api/token
 * @desc Generate Twilio video access token
 * @body { identity, room }
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { identity, room } = req.body;

    if (!identity || !room) {
      return res.status(400).json({ error: "Missing identity or room name" });
    }

    // ✅ Validate Twilio credentials
    const { TWILIO_ACCOUNT_SID, TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET } = process.env;
    if (!TWILIO_ACCOUNT_SID || !TWILIO_API_KEY_SID || !TWILIO_API_KEY_SECRET) {
      return res.status(500).json({ error: "Twilio credentials missing" });
    }

    // Create a new access token
    const token = new AccessToken(
      TWILIO_ACCOUNT_SID,
      TWILIO_API_KEY_SID,
      TWILIO_API_KEY_SECRET,
      { identity }
    );

    // Grant access to a specific room
    const videoGrant = new VideoGrant({ room });
    token.addGrant(videoGrant);

    // Token is valid for 1 hour
    token.ttl = 3600;

    res.json({
      token: token.toJwt(),
      identity,
      room,
      expiresIn: token.ttl,
    });
  } catch (err) {
    console.error("❌ Error generating Twilio token:", err);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

module.exports = router;
