// FILE: backend/routes/messages.js
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { verifyToken, requireRole, verifyOwnerOrAdmin } = require("../middleware/rbac.js");

const router = express.Router();
const prisma = new PrismaClient();

// ------------------------------------------------------------------
// Constants & helpers
// ------------------------------------------------------------------
const PAGE_SIZE_DEFAULT = 20;
const VALID_FOLDERS = new Set(["inbox", "sent", "unread", "all"]);

function buildWhere(folder, userId, q) {
  // Determine if userId is likely an Admin ID (integer) or User ID (UUID string)
  // Simple check: if it parses to int and matches string form, or is small int.
  // UUIDs are long strings with hyphens.
  const isInt = /^\d+$/.test(String(userId));
  const adminId = isInt ? parseInt(userId) : null;
  const userUuid = !isInt ? String(userId) : null; // If it's a UUID

  // Helper for receiver check
  const receiverCheck = userUuid 
    ? { receiverId: userUuid } 
    : { adminReceiverId: adminId };
    
  // Helper for sender check
  const senderCheck = userUuid
    ? { senderId: userUuid }
    : { adminSenderId: adminId };

  // Helper for "involved in" check (sent OR received)
  const involvedCheck = userUuid
    ? { OR: [{ receiverId: userUuid }, { senderId: userUuid }] }
    : { OR: [{ adminReceiverId: adminId }, { adminSenderId: adminId }] };

  const search = q
    ? {
        OR: [
          { content: { contains: q } }, // simplified
          // Include relations for search if needed, but simple content search is safer for syntax stability
        ],
      }
    : {};

  switch (folder) {
    case "inbox":
      return { AND: [receiverCheck, search] };
    case "sent":
      return { AND: [senderCheck, search] };
    case "unread":
      // Unread: receiver is me AND readAt is null
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
    if (!VALID_FOLDERS.has(folder)) return res.status(400).json({ error: "Invalid folder" });

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

    if (!targetUserId) return res.status(400).json({ error: "userId is required" });

    const page = Math.max(parseInt(req.params.page || req.query.page || "1", 10) || 1, 1);
    const take = Math.max(parseInt(req.query.pageSize || PAGE_SIZE_DEFAULT, 10) || PAGE_SIZE_DEFAULT, 1);
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
        select: {
          id: true,
          content: true,
          createdAt: true,
          readAt: true,
          senderId: true,
          receiverId: true,
          adminSenderId: true, 
          adminReceiverId: true,
          // Include all possible relation fields so frontend can display names
          sender: { select: { id: true, firstName: true, lastName: true, email: true, role: true} },
          receiver:{ select: { id: true, firstName: true, lastName: true, email: true, role: true} },
          adminSender: { select: { id: true, firstName: true, lastName: true, email: true, role: true} },
          adminReceiver:{ select: { id: true, firstName: true, lastName: true, email: true, role: true} },
        },
      }),
    ]);

    // Normalize output for frontend (so it just sees "sender" and "receiver" objects)
    const data = rows.map(msg => {
        // Resolve effective sender/receiver
        const effSender = msg.sender || msg.adminSender;
        const effReceiver = msg.receiver || msg.adminReceiver;
        return {
            ...msg,
            sender: effSender,
            receiver: effReceiver,
            // (optional) keep raw fields if needed
        };
    });

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

// ✅ Get all contacts for messaging (Admins + Users) - MUST be before /:folder routes
router.get("/contacts/all", verifyToken, async (req, res) => {
    try {
        const [users, admins] = await Promise.all([
            prisma.user.findMany({
                where: { role: { in: ["DOCTOR", "PATIENT", "PHARMACY"] } }, // Avoid invalid enum values
                select: { id: true, firstName: true, lastName: true, role: true, email: true }
            }),
            prisma.admin.findMany({
                select: { id: true, name: true, role: true, email: true }
            })
        ]);

        const all = [
            ...users.map(u => ({ ...u, type: "USER", name: `${u.firstName} ${u.lastName}` })),
            ...admins.map(a => ({ ...a, type: "ADMIN", firstName: a.name, lastName: "" }))
        ];
        
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
      where = { OR: [{ receiverId: userId }, { senderId: userId }], readAt: null };
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
router.patch("/:id/read", async (req, res) => {
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
router.get("/:folder", verifyToken, listMessages);        // e.g. /api/messages/inbox?userId=U&page=1
router.get("/:folder/:page", verifyToken, listMessages);  // e.g. /api/messages/inbox/1?userId=U

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
    const { senderId, receiverId, content, recipient, broadcast } = req.body || {};

    // Get actual sender ID and content
    const actualSenderId = senderId || req.user.id; // Use authenticated user ID
    const actualContent = content;
    const receiverIdOrBroadcast = receiverId || recipient;

    // Validate required fields
    if (!actualSenderId) {
      return res.status(401).json({ error: "senderId is required or not authenticated" });
    }
    if (!actualContent) {
      return res.status(400).json({ error: "content is required" });
    }

    // Helper to check UUID format
    const isUuid = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    // Check if sender exists (User or Admin)
    let senderUser = null;
    if (isUuid(String(actualSenderId))) {
      senderUser = await prisma.user.findUnique({ where: { id: String(actualSenderId) } });
    }
    
    let senderAdmin = null;
    if (!senderUser) {
      const parsedId = parseInt(actualSenderId);
      if (!isNaN(parsedId)) {
        senderAdmin = await prisma.admin.findUnique({ where: { id: parsedId } });
      }
    }

    if (!senderUser && !senderAdmin) {
      return res.status(404).json({ error: "Sender not found" });
    }

    const isSenderAdmin = !!senderAdmin;

    // ✅ BROADCAST TO ALL USERS - Only admins can broadcast
    if (broadcast === true || receiverIdOrBroadcast === "ALL") {
      if (!isSenderAdmin) {
        return res.status(403).json({ error: "Only admins can broadcast messages" });
      }
      try {
        const allUsers = await prisma.user.findMany({
          select: { id: true },
          where: { id: { not: actualSenderId } } // Don't send to self
        });

        if (allUsers.length === 0) {
          return res.json({
            success: true,
            message: "No users to broadcast to",
            count: 0
          });
        }

        const messages = allUsers.map(u => ({
          content: actualContent,
          senderId: isSenderAdmin ? null : senderUser.id,
          adminSenderId: isSenderAdmin ? senderAdmin.id : null,
          receiverId: u.id,
          adminReceiverId: null
        }));

        const result = await prisma.message.createMany({
          data: messages,
          skipDuplicates: true
        });

        return res.json({
          success: true,
          message: `Message broadcasted to ${result.count} users`,
          count: result.count
        });
      } catch (err) {
        console.error("❌ broadcast error:", err);
        return res.status(500).json({ error: "Failed to broadcast message" });
      }
    }

    // ✅ SEND TO SINGLE RECIPIENT
    if (!receiverIdOrBroadcast) {
      return res.status(400).json({ error: "receiverId or recipient is required" });
    }

    // Check if receiver exists (User or Admin)
    let receiverUser = null;
    if (isUuid(String(receiverIdOrBroadcast))) {
      receiverUser = await prisma.user.findUnique({ where: { id: String(receiverIdOrBroadcast) } });
    }
    
    let receiverAdmin = null;
    if (!receiverUser) {
      const parsedId = parseInt(receiverIdOrBroadcast);
      if (!isNaN(parsedId)) {
        receiverAdmin = await prisma.admin.findUnique({ where: { id: parsedId } });
      }
    }

    if (!receiverUser && !receiverAdmin) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    const isReceiverAdmin = !!receiverAdmin;

    const msg = await prisma.message.create({
      data: {
        content: actualContent,
        senderId: isSenderAdmin ? null : senderUser.id,
        adminSenderId: isSenderAdmin ? senderAdmin.id : null,
        receiverId: isReceiverAdmin ? null : receiverUser.id,
        adminReceiverId: isReceiverAdmin ? receiverAdmin.id : null,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        readAt: true,
        sender: { select: { id: true, firstName: true, lastName: true, role: true } },
        receiver: { select: { id: true, firstName: true, lastName: true, role: true } },
        adminSender: { select: { id: true, firstName: true, lastName: true, role: true } },
        adminReceiver: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
    });

    return res.json({ data: msg });
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
    const isSender = msg.senderId === req.user.id || msg.adminSenderId === parseInt(req.user.id);
    const isReceiver = msg.receiverId === req.user.id || msg.adminReceiverId === parseInt(req.user.id);

    if (!isAdmin && !isSender && !isReceiver) {
      return res.status(403).json({ error: "You are not authorized to delete this message" });
    }

    await prisma.message.delete({ where: { id } });
    return res.json({ success: true, message: "Message deleted successfully" });
  } catch (e) {
    console.error("❌ delete message error:", e);
    return res.status(500).json({ error: "Failed to delete message" });
  }
});

module.exports = router;
