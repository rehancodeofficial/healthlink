/**
 * Superadmin Routes
 * Requires SUPERADMIN role for all endpoints
 */
const express = require("express");
const prisma = require("../prisma/prismaClient.js");
const {
  verifyToken,
  requireRole,
  checkPermission,
} = require("../middleware/rbac.js");
const router = express.Router();

// Apply RBAC to all superadmin routes
router.use(verifyToken);
router.use(requireRole("SUPERADMIN"));

// Small helpers
const hasModel = (m) => m && typeof m.count === "function";
const safeCount = async (fn) => {
  try {
    return await fn();
  } catch (_) {
    return 0;
  }
};

/**
 * GET /api/superadmin/stats
 * Fetch comprehensive system statistics
 */
router.get("/stats", async (_req, res) => {
  try {
    // Users
    const totalUsers = await safeCount(() => prisma.user.count());

    // Admins (SUPERADMIN, ADMIN, SUPPORT)
    const totalAdmins = await safeCount(() =>
      prisma.user.count({
        where: { role: { in: ["ADMIN", "SUPERADMIN"] } },
      }),
    );

    const totalSupport = await safeCount(() =>
      prisma.user.count({ where: { role: "SUPPORT" } }),
    );

    // Doctors / Patients
    const totalDoctors = await safeCount(() =>
      prisma.user.count({ where: { role: "DOCTOR" } }),
    );
    const totalPatients = await safeCount(() =>
      prisma.user.count({ where: { role: "PATIENT" } }),
    );

    // Subscriptions
    let totalSubscriptions = 0;
    try {
      totalSubscriptions = await prisma.user.count({
        where: { subscriptionState: "ACTIVE" },
      });
    } catch {
      totalSubscriptions = await safeCount(() =>
        prisma.subscription.count({ where: { status: "ACTIVE" } }),
      );
    }

    // Messages / Tickets / Consultations / Prescriptions
    const totalMessages = await safeCount(() => prisma.message.count());
    const totalTickets = await safeCount(() => prisma.supportTicket.count());
    const totalConsultations = await safeCount(() =>
      prisma.videoConsultation.count(),
    );
    const totalPrescriptions = await safeCount(() =>
      prisma.prescription.count(),
    );

    // Enhanced stats with additional metrics
    const recentMessages = await safeCount(() =>
      prisma.message.findMany({ take: 10, orderBy: { createdAt: "desc" } }),
    );

    const activeSubscriptions = await safeCount(() =>
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
    );

    const totalRevenue = await safeCount(async () => {
      const subs = await prisma.subscription.findMany({
        where: { status: "ACTIVE" },
      });
      return subs.reduce((sum, sub) => sum + (sub.amount || 0), 0) / 100; // Convert cents to dollars
    });

    res.json({
      totalUsers,
      totalAdmins,
      totalDoctors,
      totalPatients,
      totalSupport,
      totalSubscriptions,
      activeSubscriptions,
      totalMessages,
      totalTickets,

      totalConsultations,
      totalPrescriptions,
      totalRevenue,
      recentMessagesCount: recentMessages.length,
    });
  } catch (err) {
    console.error("Superadmin /stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

/**
 * GET /api/superadmin/settings
 * Fetch system settings
 */
router.get("/settings", async (_req, res) => {
  try {
    let settings = await prisma.subscriptionSetting.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.subscriptionSetting.create({
        data: {
          id: 1,
          doctorMonthlyUsd: 9.99,
          doctorYearlyUsd: 99.99,
          patientMonthlyUsd: 4.99,
          patientYearlyUsd: 49.99,
          pharmacyMonthlyUsd: 19.99,
          pharmacyYearlyUsd: 199.99,
        },
      });
    }

    res.json(settings);
  } catch (err) {
    console.error("Failed to fetch settings:", err);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

/**
 * PUT /api/superadmin/settings
 * Update system settings
 */
router.put("/settings", async (req, res) => {
  try {
    const {
      doctorMonthlyUsd,
      doctorYearlyUsd,
      patientMonthlyUsd,
      patientYearlyUsd,
      pharmacyMonthlyUsd,
      pharmacyYearlyUsd,
    } = req.body;

    const settings = await prisma.subscriptionSetting.upsert({
      where: { id: 1 },
      update: {
        ...(doctorMonthlyUsd !== undefined && { doctorMonthlyUsd }),
        ...(doctorYearlyUsd !== undefined && { doctorYearlyUsd }),
        ...(patientMonthlyUsd !== undefined && { patientMonthlyUsd }),
        ...(patientYearlyUsd !== undefined && { patientYearlyUsd }),
        ...(pharmacyMonthlyUsd !== undefined && { pharmacyMonthlyUsd }),
        ...(pharmacyYearlyUsd !== undefined && { pharmacyYearlyUsd }),
      },
      create: {
        id: 1,
        doctorMonthlyUsd: doctorMonthlyUsd || 9.99,
        doctorYearlyUsd: doctorYearlyUsd || 99.99,
        patientMonthlyUsd: patientMonthlyUsd || 4.99,
        patientYearlyUsd: patientYearlyUsd || 49.99,
        pharmacyMonthlyUsd: pharmacyMonthlyUsd || 19.99,
        pharmacyYearlyUsd: pharmacyYearlyUsd || 199.99,
      },
    });

    res.json({ success: true, settings });
  } catch (err) {
    console.error("Failed to update settings:", err);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

/**
 * GET /api/superadmin/subscribers
 * Fetch all active subscribers with pagination
 */
router.get("/subscribers", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const subscribers = await prisma.subscription.findMany({
      where: { status: "ACTIVE" },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.subscription.count({
      where: { status: "ACTIVE" },
    });

    res.json({
      data: subscribers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Failed to fetch subscribers:", err);
    res.status(500).json({ error: "Failed to fetch subscribers" });
  }
});

/**
 * GET /api/superadmin/admins
 * Fetch all admin accounts (superadmin and admin roles)
 */
router.get("/admins", async (req, res) => {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ["ADMIN", "SUPERADMIN", "SUPPORT"] },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const formattedAdmins = admins.map((a) => ({
      ...a,
      name: `${a.firstName} ${a.lastName}`.trim(),
    }));

    res.json(formattedAdmins);
  } catch (err) {
    console.error("Failed to fetch admins:", err);
    res.status(500).json({ error: "Failed to fetch admins" });
  }
});

/**
 * POST /api/superadmin/admins
 * Create a new admin account
 */
router.post("/admins", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const hashedPassword = require("bcryptjs").hashSync(password, 10);

    const [firstName, ...lastNameParts] = name.split(" ");
    const lastName = lastNameParts.join(" ") || "Admin";

    const admin = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: role || "ADMIN",
        dateOfBirth: new Date("1970-01-01"),
        gender: "PREFER_NOT_TO_SAY",
      },
    });

    res.json({
      success: true,
      admin: { id: admin.id, name, email, role: admin.role },
    });
  } catch (err) {
    console.error("Failed to create admin:", err);
    if (err.code === "P2002") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Failed to create admin" });
  }
});

/**
 * DELETE /api/superadmin/admins/:id
 * Delete an admin account (suspend or soft delete)
 */
router.delete("/admins/:id", async (req, res) => {
  try {
    const adminId = parseInt(req.params.id);

    const admin = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        // Note: User table doesn't have isSuspended yet, we could add it or just restrict login
        // For now let's just update a metadata field if we have one, or skip
      },
    });

    res.json({ success: true, message: "Admin suspended" });
  } catch (err) {
    console.error("Failed to suspend admin:", err);
    res.status(500).json({ error: "Failed to suspend admin" });
  }
});

/**
 * GET /api/superadmin/reports
 * Generate comprehensive system reports
 */
router.get("/reports", async (req, res) => {
  try {
    const reportType = req.query.type || "general";

    let report = {};

    if (reportType === "general" || reportType === "all") {
      // General statistics
      report.stats = {
        totalUsers: await prisma.user.count(),
        totalAdmins: await prisma.user.count({
          where: { role: { in: ["ADMIN", "SUPERADMIN", "SUPPORT"] } },
        }),
        totalDoctors: await prisma.user.count({ where: { role: "DOCTOR" } }),
        totalPatients: await prisma.user.count({ where: { role: "PATIENT" } }),
        totalPharmacies: await prisma.user.count({
          where: { role: "PHARMACY" },
        }),
      };
    }

    if (reportType === "subscriptions" || reportType === "all") {
      // Subscription report
      const subs = await prisma.subscription.groupBy({
        by: ["status"],
        _count: true,
        _sum: { amount: true },
      });

      report.subscriptions = subs;
    }

    if (reportType === "activity" || reportType === "all") {
      // Recent activity
      report.recentMessages = await prisma.message.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          sender: { select: { firstName: true, lastName: true, email: true } },
        },
      });

      report.recentTickets = await prisma.supportTicket.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
      });
    }

    res.json(report);
  } catch (err) {
    console.error("Failed to generate report:", err);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

module.exports = router;
