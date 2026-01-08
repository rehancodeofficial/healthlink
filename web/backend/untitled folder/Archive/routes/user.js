// FILE: backend/routes/user.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verifyToken } = require('../middleware/rbac');

// GET /api/users/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const id = req.params.id;

    // Check USER table first
    let user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true, lastName: true,
        role: true,
        email: true,
        createdAt: true,
      },
    });

    // If not found, check ADMIN table
    if (!user) {
      user = await prisma.admin.findUnique({
        where: { id: parseInt(id) || 0 },
        select: {
          id: true,
          firstName: true, lastName: true,
          role: true,
          email: true,
          createdAt: true,
        },
      });
    }

    if (!user)
      return res.status(404).json({ error: 'Identity not found in registry.' });

    return res.json({ data: user });
  } catch (e) {
    console.error('❌ user profile error:', e);
    return res.status(500).json({ error: 'Failed to load user intelligence' });
  }
});

// GET /api/users (Keep existing list functionality)
router.get('/', verifyToken, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '200', 10), 1000);
    const q = (req.query.q || '').trim();

    const where = q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {};

    const users = await prisma.user.findMany({
      where,
      take: limit,
      orderBy: { name: 'asc' },
      select: { id: true, firstName: true, lastName: true, role: true, email: true },
    });

    return res.json({ data: users });
  } catch (e) {
    console.error('❌ users list error:', e);
    return res.status(500).json({ error: 'Failed to load users' });
  }
});

module.exports = router;
