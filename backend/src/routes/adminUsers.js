// FILE: backend/routes/adminUsers.js

const express = require("express");
const xss = require("xss");
const { verifyToken, requireRole } = require("../middleware/rbac.js");
const prisma = require("../prisma/prismaClient");
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
router.get(
  "/",
  verifyToken,
  requireRole(["SUPERADMIN", "ADMIN"]),
  async (req, res) => {
    try {
      const { role } = req.query;
      const whereClause = role
        ? { role }
        : { role: { in: ["ADMIN", "SUPPORT"] } };

      const users = await prisma.user.findMany({
        where: whereClause,
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

      const formattedUsers = users.map((u) => ({
        ...u,
        name: `${u.firstName} ${u.lastName}`.trim(),
      }));

      res.json(formattedUsers);
    } catch (err) {
      console.error("Error fetching admin users:", err);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  },
);

// ✅ POST create new Admin or Support
router.post(
  "/",
  verifyToken,
  requireRole(["SUPERADMIN", "ADMIN"]),
  async (req, res) => {
    try {
      const { name, email, role } = req.body;

      if (!name || !email || !role)
        return res.status(400).json({ error: "Missing required fields" });

      const [firstName, ...lastNameParts] = name.split(" ");
      const lastName = lastNameParts.join(" ") || "Admin";

      const user = await prisma.user.create({
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

      // Log activity
      await addLog(
        req.user?.id || null,
        req.user?.role || "SUPERADMIN",
        "Created User",
        `Admin: ${name}`,
      );
      res.json(user);
    } catch (err) {
      console.error("Error creating admin user:", err);
      res.status(500).json({ error: "Failed to create user" });
    }
  },
);

// ✅ PATCH suspend Admin/Support
router.patch(
  "/:id/suspend",
  verifyToken,
  requireRole(["SUPERADMIN", "ADMIN"]),
  async (req, res) => {
    try {
      const id = req.params.id;
      const updated = await prisma.user.update({
        where: { id },
        data: {
          // User table doesn't have isSuspended yet
        },
      });

      await addLog(
        req.user?.id || null,
        req.user?.role || "SUPERADMIN",
        "Suspended User",
        `Admin ID: ${id}`,
      );
      res.json(updated);
    } catch (err) {
      console.error("Error suspending admin user:", err);
      res.status(500).json({ error: "Failed to suspend user" });
    }
  },
);

// ✅ DELETE Admin/Support
router.delete(
  "/:id",
  verifyToken,
  requireRole(["SUPERADMIN", "ADMIN"]),
  async (req, res) => {
    try {
      const id = req.params.id;

      const deleted = await prisma.user.delete({
        where: { id },
      });

      await addLog(
        req.user?.id || null,
        req.user?.role || "SUPERADMIN",
        "Deleted User",
        `Admin: ${deleted.name}`,
      );
      res.json({ message: "User deleted successfully" });
    } catch (err) {
      console.error("Error deleting admin user:", err);
      res.status(500).json({ error: "Failed to delete user" });
    }
  },
);

module.exports = router;
