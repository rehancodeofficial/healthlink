const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { verifyToken } = require("../middleware/rbac");

// ZEGO Token Generation Logic (Token04)
// Based on ZEGO documentation for Node.js implementation
function generateToken04(appId, userId, serverSecret, effectiveTimeInSeconds, payload) {
  const createTime = Math.floor(Date.now() / 1000);
  const expireTime = createTime + effectiveTimeInSeconds;
  const nonce = crypto.randomInt(100000000, 999999999);

  const tokenInfo = {
    app_id: Number(appId),
    user_id: userId,
    nonce: nonce,
    ctime: createTime,
    expire: expireTime,
    payload: payload || "",
  };

  const plaintext = JSON.stringify(tokenInfo);
  const iv = crypto.randomBytes(16);

  // ZEGO expects the secret itself as the key (32 bytes for AES-256)
  // Ensure the secret is exactly 32 bytes.
  let key = Buffer.from(serverSecret, "utf8");
  if (key.length > 32) {
    key = key.slice(0, 32);
  } else if (key.length < 32) {
    // Pad with zeros if it's shorter (though it should be 32 in .env)
    const paddedKey = Buffer.alloc(32, 0);
    key.copy(paddedKey);
    key = paddedKey;
  }

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let ciphertext = cipher.update(plaintext, "utf8", "binary");
  ciphertext += cipher.final("binary");

  // Combine IV and Ciphertext
  const binData = Buffer.concat([iv, Buffer.from(ciphertext, "binary")]);

  // Prepend version (04)
  const result = Buffer.concat([Buffer.from([0x04]), Buffer.from(binData)]);

  return result.toString("base64");
}

/**
 * @route   GET /api/zego/token
 * @desc    Generate a ZEGO token for video calling
 * @access  Private
 */
router.get("/token", verifyToken, (req, res) => {
  try {
    const { roomId, userId, userName } = req.query;

    if (!roomId || !userId) {
      return res.status(400).json({ error: "roomId and userId are required" });
    }

    const appId = process.env.ZEGO_APP_ID;
    const serverSecret = process.env.ZEGO_SERVER_SECRET;

    if (!appId || !serverSecret) {
      console.error("ZEGO credentials missing in .env");
      return res.status(500).json({ error: "ZEGO configuration error" });
    }

    // Token validity: 1 hour (3600 seconds)
    const effectiveTimeInSeconds = 3600;

    // Optional payload (can include room permissions if needed)
    const payload = JSON.stringify({
      room_id: roomId,
      privilege: {
        1: 1, // login
        2: 1, // publish
      },
    });

    const token = generateToken04(appId, userId, serverSecret, effectiveTimeInSeconds, payload);

    // Build the Kit Token object as a base64 string for the UI Kit
    // This is what the UI Kit expect in ZegoUIKitPrebuilt.create()
    const kitTokenObj = {
      appID: Number(appId),
      roomID: roomId,
      userID: userId,
      userName: userName || "User",
      token: token,
    };

    const kitToken = Buffer.from(JSON.stringify(kitTokenObj)).toString("base64");

    res.json({
      success: true,
      token, // Keep for debugging if needed
      kitToken,
      appId: Number(appId),
    });
  } catch (error) {
    console.error("Error generating ZEGO token:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

module.exports = router;
