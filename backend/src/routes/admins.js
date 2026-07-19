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

    const admins = await prisma.user.findMany({
      where: {
        AND: [
          role ? { role } : { role: { in: ["ADMIN", "SUPPORT"] } },
          { role: { not: "SUPERADMIN" } },
        ],
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
      orderBy: { createdAt: "desc" },
    });

    const formattedAdmins = admins.map((a) => ({
      ...a,
      name: `${a.firstName} ${a.lastName}`.trim(),
    }));

    res.json(formattedAdmins);
  } catch (err) {
    console.error("Error fetching admins:", err);
    res.status(500).json({ error: "Failed to fetch admins" });
  }
});

// ✅ Create new admin
router.post("/", requireRole("SUPERADMIN"), async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const [firstName, ...lastNameParts] = name.split(" ");
    const lastName = lastNameParts.join(" ") || "Admin";

    const admin = await prisma.user.create({
      data: {
        firstName: xss(firstName),
        lastName: xss(lastName),
        email: xss(email),
        password: "123456", // ❗ hash in production
        role,
        dateOfBirth: new Date("1970-01-01"),
        gender: "PREFER_NOT_TO_SAY",
      },
    });

    await addLog(
      req.user?.id || null,
      req.user?.role || "SYSTEM",
      "Created Admin",
      `Admin: ${name}`,
    );
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
    const [firstName, ...lastNameParts] = name.split(" ");
    const lastName = lastNameParts.join(" ") || "";

    const admin = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        firstName: xss(firstName),
        lastName: xss(lastName),
        email: xss(email),
        role,
      },
    });

    await addLog(
      req.user?.id || null,
      req.user?.role || "SYSTEM",
      "Edited Admin",
      `Admin: ${name}`,
    );
    res.json(admin);
  } catch (err) {
    console.error("Error editing admin:", err);
    res.status(500).json({ error: "Failed to edit admin" });
  }
});

// ✅ Suspend admin
router.patch("/:id/suspend", requireRole("SUPERADMIN"), async (req, res) => {
  try {
    const admin = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        // User table doesn't have isSuspended yet
      },
    });

    await addLog(
      req.user?.id || null,
      req.user?.role || "SYSTEM",
      "Suspended Admin",
      `Admin: ${admin.name}`,
    );
    res.json(admin);
  } catch (err) {
    console.error("Error suspending admin:", err);
    res.status(500).json({ error: "Failed to suspend admin" });
  }
});

// ✅ Delete admin
router.delete("/:id", requireRole("SUPERADMIN"), async (req, res) => {
  try {
    const admin = await prisma.user.delete({
      where: { id: req.params.id },
    });

    await addLog(
      req.user?.id || null,
      req.user?.role || "SYSTEM",
      "Deleted Admin",
      `Admin: ${admin.name}`,
    );
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
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        patient: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
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
        firstName: true,
        lastName: true,
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
