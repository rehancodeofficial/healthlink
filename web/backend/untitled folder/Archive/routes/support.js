//here is the current Backend. update and give me full updated clean version
// FILE: backend/routes/support.js
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const prisma = new PrismaClient();

/**
 * Helpers
 */
const pickUserSlim = (u) => (u ? { id: u.id, name: u.name, email: u.email || null } : null);
const includeTicket = {
  user: true,
  agent: true,
  replies: {
    include: { user: true, admin: true },
    orderBy: { createdAt: "asc" },
  },
};

/**
 * POST /api/support/tickets
 * Body: { userId: string (User.id), subject: string, body: string, priority?: 'LOW'|'MEDIUM'|'HIGH'|'URGENT' }
 */
router.post("/tickets", async (req, res) => {
  try {
    const { userId, subject, body, priority = "MEDIUM" } = req.body || {};
    if (!userId || !subject || !body) {
      return res.status(400).json({ error: "userId, subject and body are required" });
    }

    // Ensure user exists
    const user = await prisma.user.findUnique({ where: { id: String(userId) } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const created = await prisma.supportTicket.create({
      data: {
        userId: String(userId),
        subject: String(subject),
        body: String(body),
        priority,
        status: "OPEN",
      },
      include: includeTicket,
    });

    return res.status(201).json({
      success: true,
      data: {
        ...created,
        user: pickUserSlim(created.user),
        replies: created.replies.map((r) => ({
          ...r,
          user: pickUserSlim(r.user),
        })),
      },
    });
  } catch (err) {
    console.error("❌ POST /support/tickets error:", err);
    return res.status(500).json({ error: "Failed to create ticket" });
  }
});

/**
 * GET /api/support/tickets/my?userId=...
 * Returns current user's tickets (newest first)
 */
router.get("/tickets/my", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: String(userId) },
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        agent: true,
        _count: { select: { replies: true } },
      },
    });

    return res.json({
      success: true,
      data: tickets.map((t) => ({
        id: t.id,
        ticketNo: t.ticketNo,
        subject: t.subject,
        status: t.status,
        priority: t.priority,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        repliesCount: t._count?.replies || 0,
        user: pickUserSlim(t.user),
        agent: t.agent ? { id: t.agent.id, name: t.agent.name } : null,
      })),
    });
  } catch (err) {
    console.error("❌ GET /support/tickets/my error:", err);
    return res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

/**
 * GET /api/support/tickets/:id
 * Returns a specific ticket (with replies)
 */
router.get("/tickets/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: includeTicket,
    });
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    return res.json({
      success: true,
      data: {
        ...ticket,
        user: pickUserSlim(ticket.user),
        replies: ticket.replies.map((r) => ({
          ...r,
          user: pickUserSlim(r.user),
        })),
      },
    });
  } catch (err) {
    console.error("❌ GET /support/tickets/:id error:", err);
    return res.status(500).json({ error: "Failed to fetch ticket" });
  }
});

/**
 * POST /api/support/tickets/:id/replies
 * Body: { userId: string (User.id), message: string }
 * Adds a reply to the ticket (by requester or agent)
 */
router.post("/tickets/:id/replies", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { userId, message } = req.body || {};
    if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });
    if (!userId || !message) return res.status(400).json({ error: "userId and message are required" });

    const ticket = await prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    // verify user exists
    const user = await prisma.user.findUnique({ where: { id: String(userId) } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const reply = await prisma.supportReply.create({
      data: {
        ticketId: id,
        userId: String(userId),
        message: String(message),
      },
      include: { user: true },
    });

    // bump updatedAt
    await prisma.supportTicket.update({ where: { id }, data: { updatedAt: new Date() } });

    return res.status(201).json({
      success: true,
      data: { ...reply, user: pickUserSlim(reply.user) },
    });
  } catch (err) {
    console.error("❌ POST /support/tickets/:id/replies error:", err);
    return res.status(500).json({ error: "Failed to add reply" });
  }
});

/**
 * PUT /api/support/tickets/:id/status
 * Body: { status: 'OPEN'|'IN_PROGRESS'|'WAITING_CUSTOMER'|'RESOLVED'|'CLOSED'|'REOPENED' }
 */
router.put("/tickets/:id/status", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body || {};
    const valid = ["OPEN", "IN_PROGRESS", "WAITING_CUSTOMER", "RESOLVED", "CLOSED", "REOPENED"];
    if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });
    if (!valid.includes(String(status))) return res.status(400).json({ error: "Invalid status value" });

    const updated = await prisma.supportTicket.update({
      where: { id },
      data: { status: String(status) },
      include: includeTicket,
    });

    return res.json({
      success: true,
      data: {
        ...updated,
        user: pickUserSlim(updated.user),
        replies: updated.replies.map((r) => ({ ...r, user: pickUserSlim(r.user) })),
      },
    });
  } catch (err) {
    console.error("❌ PUT /support/tickets/:id/status error:", err);
    return res.status(500).json({ error: "Failed to update status" });
  }
});

// ADD this near other routes in backend/routes/support.js

/**
 * GET /api/support/tickets
 * Query (optional): status, priority, q
 * Lists ALL tickets (for Support team)
 */
router.get("/tickets", async (req, res) => {
  try {
    const { status, priority, q } = req.query;

    const where = {};
    if (status) where.status = String(status);
    if (priority) where.priority = String(priority);
    if (q) {
      where.OR = [
        { subject: { contains: String(q), mode: "insensitive" } },
        { body:    { contains: String(q), mode: "insensitive" } },
        { ticketNo:{ contains: String(q), mode: "insensitive" } },
      ];
    }

    const items = await prisma.supportTicket.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        user: true,
        agent: true,
        _count: { select: { replies: true } },
      },
    });

    res.json({
      success: true,
      data: items.map(t => ({
        id: t.id,
        ticketNo: t.ticketNo,
        subject: t.subject,
        status: t.status,
        priority: t.priority,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        repliesCount: t._count.replies || 0,
        user: t.user ? { id: t.user.id, name: t.user.name, email: t.user.email } : null,
        agent: t.agent ? { id: t.agent.id, name: t.agent.name } : null,
      })),
    });
  } catch (err) {
    console.error("❌ GET /support/tickets (all) error:", err);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

/**
 * GET /api/support/tickets/:id
 * Returns full ticket with body + replies + basic user info
 */
router.get("/tickets/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        replies: {
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    return res.json({ success: true, data: ticket });
  } catch (err) {
    console.error("❌ GET /support/tickets/:id error:", err);
    return res.status(500).json({ error: "Failed to fetch ticket" });
  }
});

/**
 * POST /api/support/tickets/:id/replies
 * Body: { userId: string (Support agent User.id), message: string }
 * Creates a reply and returns the created reply (with user info).
 */
router.post("/tickets/:id/replies", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { userId, message } = req.body || {};
    if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });
    if (!userId || !message)
      return res.status(400).json({ error: "userId and message are required" });

    const ticket = await prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    // ensure user exists
    const user = await prisma.user.findUnique({
      where: { id: String(userId) },
      select: { id: true },
    });
    if (!user) return res.status(400).json({ error: "Invalid userId" });

    const created = await prisma.supportReply.create({
      data: {
        ticketId: id,
        userId: String(userId),
        message: String(message),
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    // bump updatedAt on ticket automatically via @updatedAt; no extra write needed
    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error("❌ POST /support/tickets/:id/replies error:", err);
    return res.status(500).json({ error: "Failed to add reply" });
  }
});

module.exports = router;
