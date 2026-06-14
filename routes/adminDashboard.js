// adminRoutes.js (or wherever your admin router lives)
const express = require("express");
const prisma = require("../prisma/prismaClient.js");
const router = express.Router();

const hasModel = (m) => m && typeof m.count === "function";
const safeCount = async (fn) => { try { return await fn(); } catch (_) { return 0; } };

router.get("/dashboard-stats", async (req, res) => {
  try {
    const users         = await safeCount(() => prisma.user.count());
    const doctors       = await safeCount(() => prisma.user.count({ where: { role: "DOCTOR" } }));
    const patients      = await safeCount(() => prisma.user.count({ where: { role: "PATIENT" } }));
    const subscriptions = hasModel(prisma.subscription) ? await safeCount(() => prisma.subscription.count()) : 0;
    const messages      = hasModel(prisma.message) ? await safeCount(() => prisma.message.count()) : 0;

    // If you track appointments as a separate model; otherwise you used videoConsultation earlier
    const appointments  = hasModel(prisma.appointment)
      ? await safeCount(() => prisma.appointment.count())
      : (hasModel(prisma.videoConsultation)
          ? await safeCount(() => prisma.videoConsultation.count())
          : 0);

    // Status summary from whichever model you actually use
    let statusSummary = {};
    if (hasModel(prisma.appointment)) {
      const by = await prisma.appointment.groupBy({ by: ["status"], _count: { status: true } });
      statusSummary = by.reduce((acc, cur) => { acc[cur.status] = cur._count.status; return acc; }, {});
    } else if (hasModel(prisma.videoConsultation)) {
      const by = await prisma.videoConsultation.groupBy({ by: ["status"], _count: { status: true } });
      statusSummary = by.reduce((acc, cur) => { acc[cur.status] = cur._count.status; return acc; }, {});
    }

    res.json({
      users,
      doctors,
      patients,
      appointments,
      subscriptions,
      messages,
      statusSummary,
    });
  } catch (err) {
    console.error("❌ Failed to fetch admin dashboard stats:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

module.exports = router;
