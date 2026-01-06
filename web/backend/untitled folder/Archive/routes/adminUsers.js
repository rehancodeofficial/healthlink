// FILE: backend/routes/adminUsers.js

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { verifyToken, requireRole } = require("../middleware/rbac.js");
const prisma = new PrismaClient();
const router = express.Router();

// ✅ Utility: Add to activity log
async function addLog(actorId, actorRole, action, entity) {
  try {
    await prisma.activityLog.create({
      data: { actorId, actorRole, action, entity },
    });
  } catch (err) {
    console.error("Activity log failed:", err.message);
  }
}


// ✅ GET all users (Admins + Support)
router.get("/", verifyToken, requireRole("SUPERADMIN"), async (req, res) => {
  try {
    const { role } = req.query;
    const whereClause = role ? { role } : { role: { in: ["ADMIN", "SUPPORT"] } };

    const users = await prisma.admin.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    res.json(users);
  } catch (err) {
    console.error("Error fetching admin users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});


// ✅ POST create new Admin or Support
router.post("/", verifyToken, requireRole("SUPERADMIN"), async (req, res) => {
  try {
    const { name, email, role } = req.body;

    if (!name || !email || !role)
      return res.status(400).json({ error: "Missing required fields" });

    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing)
      return res.status(400).json({ error: "Email already exists" });

    const user = await prisma.admin.create({
      data: {
        name,
        email,
        password: "123456", // ⚠️ In production: hash with bcrypt
        role,
      },
    });

    // Log activity
    await addLog(req.user?.id || null, req.user?.role || "SUPERADMIN", "Created User", `Admin: ${name}`);
    res.json(user);
  } catch (err) {
    console.error("Error creating admin user:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
});


// ✅ PATCH suspend Admin/Support
router.patch("/:id/suspend", verifyToken, requireRole("SUPERADMIN"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await prisma.admin.update({
      where: { id },
      data: { isSuspended: true },
    });

    await addLog(req.user?.id || null, req.user?.role || "SUPERADMIN", "Suspended User", `Admin ID: ${id}`);
    res.json(updated);
  } catch (err) {
    console.error("Error suspending admin user:", err);
    res.status(500).json({ error: "Failed to suspend user" });
  }
});


// ✅ DELETE Admin/Support
router.delete("/:id", verifyToken, requireRole("SUPERADMIN"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const deleted = await prisma.admin.delete({
      where: { id },
    });

    await addLog(req.user?.id || null, req.user?.role || "SUPERADMIN", "Deleted User", `Admin: ${deleted.name}`);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting admin user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

module.exports = router;
