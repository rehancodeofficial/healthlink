const express = require("express");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();

// ✅ Fetch logs (with optional role filter, pagination)
router.get("/", async (req, res) => {
  try {
    const { role, limit = 20 } = req.query;
    const logs = await prisma.activityLog.findMany({
      where: role ? { actorRole: role } : {},
      orderBy: { createdAt: "desc" },
      take: Number(limit),
    });
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch activity logs" });
  }
});

// ✅ Add log entry
router.post("/", async (req, res) => {
  try {
    const { actorId, actorRole, action, entity } = req.body;
    const log = await prisma.activityLog.create({
      data: { actorId, actorRole, action, entity },
    });
    res.json(log);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add activity log" });
  }
});

module.exports = router;
