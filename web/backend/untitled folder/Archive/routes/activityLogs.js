// FILE: backend/routes/activityLogs.js
const express = require("express");
const prisma = require("../prisma/prismaClient.js");

const router = express.Router();

// ✅ Get all activity logs
router.get("/", async (req, res) => {
  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50, // latest 50 logs
    });
    res.json(logs);
  } catch (err) {
    console.error("Error fetching activity logs:", err);
    res.status(500).json({ error: "Failed to fetch activity logs" });
  }
});

// ✅ Get logs by actor
router.get("/actor/:id", async (req, res) => {
  try {
    const logs = await prisma.activityLog.findMany({
      where: { actorId: req.params.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(logs);
  } catch (err) {
    console.error("Error fetching actor logs:", err);
    res.status(500).json({ error: "Failed to fetch actor logs" });
  }
});

module.exports = router;
