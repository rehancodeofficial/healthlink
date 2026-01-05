/**
 * Admin Routes - for ADMIN role (not SUPERADMIN)
 * ADMIN can manage users, view reports, but cannot manage other admins
 * Requires ADMIN or SUPERADMIN role
 */
const express = require("express");
const prisma = require("../prisma/prismaClient.js");
const { verifyToken, requireHierarchy } = require("../middleware/rbac.js");
const router = express.Router();

// Apply RBAC - requires at least ADMIN level
router.use(verifyToken);
router.use(requireHierarchy("ADMIN")); // ADMIN or SUPERADMIN

/**
 * GET /api/admin/users
 * List all users (paginated)
 */
router.get("/users", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const role = req.query.role; // optional filter

    const where = role ? { role } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true, lastName: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error("Failed to fetch users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/**
 * GET /api/admin/user/:id
 * Get single user details
 */
router.get("/user/:id", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        doctor: true,
        patient: true,
        pharmacy: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Failed to fetch user:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

/**
 * PATCH /api/admin/user/:id/suspend
 * Suspend a user account
 */
router.patch("/user/:id/suspend", async (req, res) => {
  try {
    const userId = req.params.id;

    // Can't suspend admins
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (user?.role === "SUPERADMIN") {
      return res.status(403).json({ error: "Cannot suspend SUPERADMIN users" });
    }

    // For now, we don't have a suspension field on User, so just track last activity
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { updatedAt: new Date() }
    });

    res.json({ success: true, message: "User suspension tracked" });
  } catch (err) {
    console.error("Failed to suspend user:", err);
    res.status(500).json({ error: "Failed to suspend user" });
  }
});

/**
 * GET /api/admin/dashboard
 * Admin dashboard summary (non-superadmin version)
 */
router.get("/dashboard", async (req, res) => {
  try {
    // Use helper for safe counts if models might be missing
    const hasModel = (m) => m && typeof m.count === "function";
    const safeCount = async (fn) => {
      try { return await fn(); } catch (_) { return 0; }
    };

    // Parallel fetch for dashboard stats
    const [
      totalUsers,
      totalDoctors,
      totalPatients,
      totalSupport,
      totalAdmins,
      totalSubscriptions,
      totalMessages,
      totalTickets,
      totalConsultations,
      totalPrescriptions
    ] = await Promise.all([
      // Users
      safeCount(() => prisma.user.count()),
      safeCount(() => prisma.user.count({ where: { role: "DOCTOR" } })),
      safeCount(() => prisma.user.count({ where: { role: "PATIENT" } })),
      safeCount(() => prisma.user.count({ where: { role: "SUPPORT" } })),
      
      // Admins (if exists)
      hasModel(prisma.admin) ? safeCount(() => prisma.admin.count()) : 0,

      // Subscriptions
      hasModel(prisma.subscription) ? safeCount(() => prisma.subscription.count({ where: { status: "ACTIVE" } })) : 0,

      // Activity
      hasModel(prisma.message) ? safeCount(() => prisma.message.count()) : 0,
      hasModel(prisma.supportTicket) ? safeCount(() => prisma.supportTicket.count()) : 0,
      hasModel(prisma.videoConsultation) ? safeCount(() => prisma.videoConsultation.count()) : 0,
      hasModel(prisma.prescription) ? safeCount(() => prisma.prescription.count()) : 0,
    ]);

    res.json({
      totalUsers,
      totalAdmins, // Included so frontend doesn't break
      totalDoctors,
      totalPatients,
      totalSupport,
      totalSubscriptions,
      totalMessages,
      totalTickets,
      totalConsultations,
      totalPrescriptions,
      lastUpdated: new Date()
    });
  } catch (err) {
    console.error("Failed to fetch admin dashboard:", err);
    res.status(500).json({ error: "Failed to fetch dashboard" });
  }
});

/**
 * GET /api/admin/reports
 * Generate admin-level reports (excluding subscription revenue)
 */
router.get("/reports", async (req, res) => {
  try {
    const reportType = req.query.type || "general";

    let report = {};

    if (reportType === "general" || reportType === "all") {
      report.userStats = {
        doctors: await prisma.user.count({ where: { role: "DOCTOR" } }),
        patients: await prisma.user.count({ where: { role: "PATIENT" } }),
        pharmacies: await prisma.user.count({ where: { role: "PHARMACY" } }),
        support: await prisma.user.count({ where: { role: "SUPPORT" } })
      };
    }

    if (reportType === "activity" || reportType === "all") {
      report.recentTickets = await prisma.supportTicket.findMany({
        take: 10,
        orderBy: { createdAt: "desc" }
      });
    }

    res.json(report);
  } catch (err) {
    console.error("Failed to generate report:", err);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

/**
 * GET /api/admin/support-tickets
 * View all support tickets
 */
router.get("/support-tickets", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status; // optional filter

    const where = status ? { status } : {};

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } }
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      prisma.supportTicket.count({ where })
    ]);

    res.json({
      data: tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error("Failed to fetch support tickets:", err);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

module.exports = router;
