const express = require("express");
const xss = require("xss");
const { verifyToken, requireRole } = require("../middleware/rbac"); // ✅ Correct import
const prisma = require("../prisma/prismaClient.js");

const router = express.Router();

// ✅ Apply verification to all routes
router.use(verifyToken);

// ✅ Utility for creating logs
async function addLog(actorId, actorRole, action, entity) {
  try {
    await prisma.activityLog.create({
      data: { actorId, actorRole, action, entity },
    });
  } catch (err) {
    console.error("Failed to write activity log:", err);
  }
}

// ✅ Get all admins (filter by role optional)
// ✅ Get all admins (exclude SUPERADMIN)
router.get("/", requireRole("SUPERADMIN"), async (req, res) => {
  try {
    const { role } = req.query;

    const admins = await prisma.admin.findMany({
      where: {
        // Filter by role if provided, otherwise include all EXCEPT SUPERADMIN
        AND: [
          role ? { role } : {},
          { role: { not: "SUPERADMIN" } }, // 🚫 exclude superadmin
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(admins);
  } catch (err) {
    console.error("Error fetching admins:", err);
    res.status(500).json({ error: "Failed to fetch admins" });
  }
});

// router.get("/", async (req, res) => {
//   try {
//     const { role } = req.query;
//     const admins = await prisma.admin.findMany({
//       where: role ? { role } : {},
//       orderBy: { createdAt: "desc" },
//     });
//     res.json(admins);
//   } catch (err) {
//     console.error("Error fetching admins:", err);
//     res.status(500).json({ error: "Failed to fetch admins" });
//   }
// });

// ✅ Create new admin
router.post("/", requireRole("SUPERADMIN"), async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const admin = await prisma.admin.create({
      data: {
        name: xss(name),
        email: xss(email),
        password: "123456", // ❗ hash in production
        role,
      },
    });

    await addLog(req.user?.id || null, req.user?.role || "SYSTEM", "Created Admin", `Admin: ${name}`);
    res.json(admin);
  } catch (err) {
    console.error("Error creating admin:", err);
    res.status(500).json({ error: "Failed to create admin" });
  }
});

// ✅ Edit admin
router.put("/:id", requireRole("SUPERADMIN"), async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const admin = await prisma.admin.update({
      where: { id: parseInt(req.params.id) },
      data: { name: xss(name), email: xss(email), role },
    });

    await addLog(req.user?.id || null, req.user?.role || "SYSTEM", "Edited Admin", `Admin: ${name}`);
    res.json(admin);
  } catch (err) {
    console.error("Error editing admin:", err);
    res.status(500).json({ error: "Failed to edit admin" });
  }
});

// ✅ Suspend admin
router.patch("/:id/suspend", requireRole("SUPERADMIN"), async (req, res) => {
  try {
    const admin = await prisma.admin.update({
      where: { id: parseInt(req.params.id) },
      data: { isSuspended: true },
    });

    await addLog(req.user?.id || null, req.user?.role || "SYSTEM", "Suspended Admin", `Admin: ${admin.name}`);
    res.json(admin);
  } catch (err) {
    console.error("Error suspending admin:", err);
    res.status(500).json({ error: "Failed to suspend admin" });
  }
});

// ✅ Delete admin
router.delete("/:id", requireRole("SUPERADMIN"), async (req, res) => {
  try {
    const admin = await prisma.admin.delete({
      where: { id: parseInt(req.params.id) },
    });

    await addLog(req.user?.id || null, req.user?.role || "SYSTEM", "Deleted Admin", `Admin: ${admin.name}`);
    res.json({ message: "Admin deleted successfully" });
  } catch (err) {
    console.error("Error deleting admin:", err);
    res.status(500).json({ error: "Failed to delete admin" });
  }
});


/**
 * ✅ Get all appointments (admin view)
 * GET /api/admin/appointments
 */
router.get("/appointments", async (_req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        doctor: {
          include: { user: { select: { firstName: true, lastName: true, email: true } } },
        },
        patient: {
          include: { user: { select: { firstName: true, lastName: true, email: true } } },
        },
      },
      orderBy: { appointmentDate: "desc" },
    });

    res.json(appointments);
  } catch (err) {
    console.error("❌ Error fetching appointments:", err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

/**
 * ✅ Update appointment status (Approve / Cancel / Complete)
 * PATCH /api/admin/appointments/:id
 */
router.patch("/appointments/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updated = await prisma.appointment.update({
      where: { id },
      data: { status },
    });
    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating appointment:", err);
    res.status(500).json({ error: "Failed to update appointment" });
  }
});

// ✅ Fetch users (optionally by role)
router.get("/users", async (req, res) => {
  try {
    const { role } = req.query;

    const users = await prisma.user.findMany({
      where: role ? { role } : undefined,
      select: {
        id: true,
        firstName: true, lastName: true,
        email: true,
        role: true,
      },
    });

    res.json(users);
  } catch (err) {
    console.error("❌ Admin /users error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});


module.exports = router;
