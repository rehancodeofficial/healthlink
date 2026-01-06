const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { verifyToken, requireHierarchy } = require("../middleware/rbac.js");
const router = express.Router();
const prisma = new PrismaClient();

// Apply RBAC to all routes in this file
router.use(verifyToken);
router.use(requireHierarchy("ADMIN")); // Requires ADMIN or SUPERADMIN role

/**
 * Ensure a singleton row exists. We call this helper from GET/PUT so the first call
 * self-heals the config if the row isn't there yet.
 */
async function ensureSingleton() {
  let row = await prisma.subscriptionSetting.findUnique({ where: { id: 1 } });
  if (!row) {
    row = await prisma.subscriptionSetting.create({
      data: { id: 1, monthlyUsd: 9.99, yearlyUsd: 99.99 },
    });
  }
  return row;
}

// GET /api/admin/subscription-prices
router.get("/subscription-prices", async (_req, res) => {
  try {
    const row = await ensureSingleton();
    return res.json({
      success: true,
      data: {
        monthlyUsd: row.monthlyUsd,
        yearlyUsd: row.yearlyUsd,
        updatedAt: row.updatedAt,
      },
    });
  } catch (err) {
    console.error(
      "❌ GET /admin/subscription-prices error:",
      err?.message,
      err
    );
    return res
      .status(500)
      .json({ error: "Failed to load subscription prices" });
  }
});

// PUT /api/admin/subscription-prices
// Body: { monthlyUsd: number, yearlyUsd: number }
router.put("/subscription-prices", async (req, res) => {
  try {
    const { monthlyUsd, yearlyUsd } = req.body || {};

    // Basic validation
    const m = Number(monthlyUsd);
    const y = Number(yearlyUsd);
    if (
      typeof monthlyUsd === "undefined" ||
      typeof yearlyUsd === "undefined" ||
      Number.isNaN(m) ||
      Number.isNaN(y) ||
      m <= 0 ||
      y <= 0
    ) {
      return res
        .status(400)
        .json({ error: "monthlyUsd and yearlyUsd must be positive numbers" });
    }

    // Upsert singleton
    const updated = await prisma.subscriptionSetting.upsert({
      where: { id: 1 },
      update: { monthlyUsd: m, yearlyUsd: y },
      create: { id: 1, monthlyUsd: m, yearlyUsd: y },
    });

    return res.json({
      success: true,
      data: {
        monthlyUsd: updated.monthlyUsd,
        yearlyUsd: updated.yearlyUsd,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (err) {
    console.error(
      "❌ PUT /admin/subscription-prices error:",
      err?.message,
      err
    );
    return res
      .status(500)
      .json({ error: "Failed to save subscription prices" });
  }
});

// --- Add at bottom of adminSubscription.js ---
/** GET /api/admin/subscribers?status=(ACTIVE|EXPIRED|DEACTIVATED|PENDING) */
router.get("/subscribers", async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = String(status);

    const items = await prisma.subscription.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
      },
    });

    const data = items.map((s) => ({
      ...s,
      computedStatus: (function () {
        if (s.status === "DEACTIVATED") return "DEACTIVATED";
        if (!s.startDate || !s.endDate) return s.status;
        return new Date() > s.endDate ? "EXPIRED" : "ACTIVE";
      })(),
    }));

    return res.json({ success: true, data });
  } catch (err) {
    console.error("❌ GET /admin/subscribers", err);
    return res.status(500).json({ error: "Failed to fetch subscribers" });
  }
});

/** PUT /api/admin/subscribers/:userId/deactivate */
router.put("/subscribers/:userId/deactivate", async (req, res) => {
  try {
    const { userId } = req.params;
    // Mark the latest subscription as DEACTIVATED
    const latest = await prisma.subscription.findFirst({
      where: { userId: String(userId) },
      orderBy: { createdAt: "desc" },
    });
    if (!latest)
      return res.status(404).json({ error: "No subscription found" });

    const updated = await prisma.subscription.update({
      where: { id: latest.id },
      data: { status: "DEACTIVATED" },
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error("❌ PUT /admin/subscribers/:userId/deactivate", err);
    return res.status(500).json({ error: "Failed to deactivate" });
  }
});

module.exports = router;
