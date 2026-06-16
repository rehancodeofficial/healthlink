
// FILE: backend/routes/notifications.js (CommonJS)
const express = require("express");
const prisma = require("../prisma/prismaClient.js");
const { verifyToken } = require("../middleware/rbac.js");
const router = express.Router();


/**
 * GET /api/notifications/count/:userId
 * Returns { notifications: <number> }
 * Counts unread messages for the user.
 */
router.get("/count/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const unread = await prisma.message.count({
      where: { receiverId: userId, readAt: null },
    });

    return res.json({ notifications: unread });
  } catch (err) {
    console.error("❌ /notifications/count error:", err);
    return res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

module.exports = router;
