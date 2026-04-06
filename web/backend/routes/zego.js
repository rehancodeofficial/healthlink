const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/rbac");
const { generateToken04 } = require("../utils/zegoServerAssistant");

/**
 * @route   GET /api/zego/token
 * @desc    Generate a ZEGO token for video calling
 * @access  Private
 */
router.get("/token", verifyToken, (req, res) => {
  try {
    const { roomId, userId } = req.query;

    if (!roomId || !userId) {
      return res.status(400).json({ error: "roomId and userId are required" });
    }

    const appId = Number(process.env.ZEGO_APP_ID);
    const serverSecret = process.env.ZEGO_SERVER_SECRET;

    if (!appId || !serverSecret) {
      console.error("ZEGO credentials missing in .env");
      return res.status(500).json({ error: "ZEGO configuration error" });
    }

    // Token validity: 1 hour (3600 seconds)
    const effectiveTimeInSeconds = 3600;

    // Optional payload
    const payload = JSON.stringify({
      room_id: roomId,
      privilege: {
        1: 1, // login
        2: 1, // publish
      },
    });

    // Generate standard token using official library
    const token = generateToken04(appId, userId, serverSecret, effectiveTimeInSeconds, payload);

    res.json({
      success: true,
      token,
      appId,
    });
  } catch (error) {
    console.error("Error generating ZEGO token:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

module.exports = router;
