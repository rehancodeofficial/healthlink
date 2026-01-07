const express = require("express");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();

// ✅ System Reports Summary
router.get("/summary", async (req, res) => {
  try {
    const [
      totalUsers,
      totalDoctors,
      totalPatients,
      totalAdmins,
      suspendedAdmins,
      totalConsultations,
      completedConsultations,
      cancelledConsultations,
      avgConsultation,
      totalPrescriptions,
      monthlyPrescriptions,
      totalTickets,
      openTickets,
      resolvedTickets,
      activeSubscriptions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "DOCTOR" } }),
      prisma.user.count({ where: { role: "PATIENT" } }),
      prisma.admin.count(),
      prisma.admin.count({ where: { isSuspended: true } }),
      prisma.videoConsultation.count(),
      prisma.videoConsultation.count({ where: { status: "COMPLETED" } }),
      prisma.videoConsultation.count({ where: { status: "CANCELLED" } }),
      prisma.videoConsultation.aggregate({ _avg: { durationMinutes: true } }),
      prisma.prescription.count(),
      prisma.prescription.count({
        where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
      }),
      prisma.supportTicket.count(),
      prisma.supportTicket.count({ where: { status: "OPEN" } }),
      prisma.supportTicket.count({ where: { status: "RESOLVED" } }),
      prisma.user.count({ where: { subscription: "SUBSCRIBED" } }),
    ]);

    res.json({
      users: { total: totalUsers, doctors: totalDoctors, patients: totalPatients },
      admins: { total: totalAdmins, suspended: suspendedAdmins },
      consultations: {
        total: totalConsultations,
        completed: completedConsultations,
        cancelled: cancelledConsultations,
        avgDuration: avgConsultation._avg.durationMinutes || 0,
      },
      prescriptions: { total: totalPrescriptions, thisMonth: monthlyPrescriptions },
      support: { total: totalTickets, open: openTickets, resolved: resolvedTickets },
      subscriptions: { active: activeSubscriptions },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load reports" });
  }
});

module.exports = router;
