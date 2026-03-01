// FILE: backend/routes/messages.js
const prisma = require("../prisma/prismaClient");
const express = require("express");
const {
  verifyToken,
  requireRole,
  verifyOwnerOrAdmin,
} = require("../middleware/rbac.js");

const router = express.Router();

// ------------------------------------------------------------------
// Constants & helpers
// ------------------------------------------------------------------
const PAGE_SIZE_DEFAULT = 20;
const VALID_FOLDERS = new Set(["inbox", "sent", "unread", "all"]);

function buildWhere(folder, userId, q) {
  const userUuid = String(userId);

  const receiverCheck = { receiverId: userUuid };
  const senderCheck = { senderId: userUuid };
  const involvedCheck = {
    OR: [{ receiverId: userUuid }, { senderId: userUuid }],
  };

  const search = q
    ? {
        OR: [{ content: { contains: q, mode: "insensitive" } }],
      }
    : {};

  switch (folder) {
    case "inbox":
      return { AND: [receiverCheck, search] };
    case "sent":
      return { AND: [senderCheck, search] };
    case "unread":
      return { AND: [receiverCheck, { readAt: null }, search] };
    case "all":
    default:
      return { AND: [involvedCheck, search] };
  }
}

// Shared handler for list endpoints
async function listMessages(req, res) {
  try {
    const folder = String(req.params.folder || "inbox").toLowerCase();
    if (!VALID_FOLDERS.has(folder))
      return res.status(400).json({ error: "Invalid folder" });

    // SECURITY: If not Admin/SuperAdmin, you can ONLY view your own messages.
    let targetUserId = req.query.userId || req.headers["x-user-id"];
    const isAdmin = ["ADMIN", "SUPERADMIN"].includes(req.user.role);

    if (!isAdmin) {
      // Force usage of own ID
      targetUserId = req.user.id;
    } else {
      // If admin doesn't specify legitimate userId, default to themselves
      if (!targetUserId) targetUserId = req.user.id;
    }

    if (!targetUserId)
      return res.status(400).json({ error: "userId is required" });

    const page = Math.max(
      parseInt(req.params.page || req.query.page || "1", 10) || 1,
      1,
    );
    const take = Math.max(
      parseInt(req.query.pageSize || PAGE_SIZE_DEFAULT, 10) ||
        PAGE_SIZE_DEFAULT,
      1,
    );
    const skip = (page - 1) * take;
    const q = req.query.q || "";

    const where = buildWhere(folder, targetUserId, q);

    const [total, rows] = await Promise.all([
      prisma.message.count({ where }),
      prisma.message.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
          receiver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      }),
    ]);

    // Normalize output for frontend
    const data = rows.map((msg) => ({
      ...msg,
      sender: msg.sender
        ? {
            ...msg.sender,
            name: `${msg.sender.firstName} ${msg.sender.lastName}`.trim(),
          }
        : null,
      receiver: msg.receiver
        ? {
            ...msg.receiver,
            name: `${msg.receiver.firstName} ${msg.receiver.lastName}`.trim(),
          }
        : null,
    }));

    return res.json({
      data,
      page,
      pageSize: take,
      total,
      totalPages: Math.max(Math.ceil(total / take), 1),
      folder: folder.toUpperCase(),
    });
  } catch (e) {
    console.error("❌ messages list error:", e);
    return res.status(500).json({ error: "Failed to load messages" });
  }
}

// ------------------------------------------------------------------
// Routes
// ------------------------------------------------------------------

// ✅ Get all contacts for messaging (All users in User table)
router.get("/contacts/all", verifyToken, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        email: true,
      },
    });

    const all = users.map((u) => ({
      ...u,
      name: `${u.firstName} ${u.lastName}`.trim(),
    }));

    return res.json({ data: all });
  } catch (err) {
    console.error("❌ Failed to fetch contacts:", err);
    return res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

// Unread count for a user: GET /api/messages/unread-count?userId=UUID
router.get("/unread-count", verifyToken, async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId required" });
  try {
    const count = await prisma.message.count({
      where: { receiverId: userId, readAt: null },
    });
    return res.json({ data: { count } });
  } catch (err) {
    console.error("❌ unread count error:", err);
    return res.status(500).json({ error: "Failed to fetch unread count" });
  }
});

// Bulk mark read: POST /api/messages/mark-read  { userId, folder? }
// folder: "inbox" (default) | "all"
router.post("/mark-read", verifyToken, async (req, res) => {
  try {
    const { userId, folder = "inbox" } = req.body || {};
    if (!userId) return res.status(400).json({ error: "userId is required" });

    let where;
    if (String(folder).toLowerCase() === "all") {
      where = {
        OR: [{ receiverId: userId }, { senderId: userId }],
        readAt: null,
      };
    } else {
      where = { receiverId: userId, readAt: null };
    }

    const result = await prisma.message.updateMany({
      where,
      data: { readAt: new Date() },
    });
    return res.json({ success: true, updated: result.count });
  } catch (e) {
    console.error("❌ mark-read error:", e);
    return res.status(500).json({ error: "Failed to mark as read" });
  }
});

// Mark one as read: PATCH /api/messages/:id/read
router.patch("/:id/read", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const msg = await prisma.message.update({
      where: { id },
      data: { readAt: new Date() },
      select: { id: true, readAt: true },
    });
    return res.json({ data: msg });
  } catch (e) {
    console.error("❌ mark single read error:", e);
    return res.status(500).json({ error: "Failed to mark message read" });
  }
});

// List messages (two explicit routes to avoid optional param "?")
router.get("/:folder", verifyToken, listMessages); // e.g. /api/messages/inbox?userId=U&page=1
router.get("/:folder/:page", verifyToken, listMessages); // e.g. /api/messages/inbox/1?userId=U

// Send a message: POST /api/messages/send
/**
 * Supports multiple formats:
 * 1. Single message to user:  { senderId, receiverId, content }
 * 2. Single message variant:   { senderId, recipient, content }
 * 3. Broadcast to all users:   { senderId, content, broadcast: true }
 * 4. Broadcast variant:        { senderId, recipient: "ALL", content }
 *
 * Returns:
 * - Single: { data: msg }
 * - Broadcast: { success: true, message: "...", count }
 */
router.post("/send", verifyToken, async (req, res) => {
  try {
    const { senderId, receiverId, content, recipient, broadcast } =
      req.body || {};

    const actualSenderId = senderId || req.user.id;
    const actualContent = content;
    const targetRecipient = receiverId || recipient;

    if (!actualSenderId)
      return res.status(401).json({ error: "senderId is required" });
    if (!actualContent)
      return res.status(400).json({ error: "content is required" });

    // Broadcast logic
    if (broadcast === true || targetRecipient === "ALL") {
      const isAdmin = ["ADMIN", "SUPERADMIN"].includes(req.user.role);
      if (!isAdmin)
        return res.status(403).json({ error: "Only admins can broadcast" });

      const allUsers = await prisma.user.findMany({
        where: { id: { not: actualSenderId } },
        select: { id: true },
      });

      await prisma.message.createMany({
        data: allUsers.map((u) => ({
          senderId: actualSenderId,
          receiverId: u.id,
          content: actualContent,
        })),
      });

      return res.json({
        success: true,
        message: `Broadcast sent to ${allUsers.length} users`,
      });
    }

    // Single message logic
    if (!targetRecipient)
      return res.status(400).json({ error: "Receiver is required" });

    const msg = await prisma.message.create({
      data: {
        senderId: actualSenderId,
        receiverId: targetRecipient,
        content: actualContent,
      },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
        receiver: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
      },
    });

    const formattedMsg = {
      ...msg,
      sender: {
        ...msg.sender,
        name: `${msg.sender.firstName} ${msg.sender.lastName}`.trim(),
      },
      receiver: {
        ...msg.receiver,
        name: `${msg.receiver.firstName} ${msg.receiver.lastName}`.trim(),
      },
    };

    return res.json({ data: formattedMsg });
  } catch (e) {
    console.error("❌ send message error:", e);
    return res.status(500).json({ error: "Failed to send message" });
  }
});

// ✅ Delete a message: DELETE /api/messages/:id
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const msg = await prisma.message.findUnique({ where: { id } });

    if (!msg) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Check permissions: Only Sender, Receiver, or Admin/SuperAdmin
    const isAdmin = ["ADMIN", "SUPERADMIN"].includes(req.user.role);
    const isSender = msg.senderId === req.user.id;
    const isReceiver = msg.receiverId === req.user.id;

    if (!isAdmin && !isSender && !isReceiver) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this message" });
    }

    await prisma.message.delete({ where: { id } });
    return res.json({ success: true, message: "Message deleted successfully" });
  } catch (e) {
    console.error("❌ delete message error:", e);
    return res.status(500).json({ error: "Failed to delete message" });
  }
});

module.exports = router;
