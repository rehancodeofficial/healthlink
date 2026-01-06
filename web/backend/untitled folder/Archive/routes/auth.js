// FILE: backend/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { ensureDefaultProfile } = require('../lib/provisionProfile');
const { generateOTP, getOTPExpiration } = require('../lib/otpGenerator');
const { sendOTPEmail } = require('../lib/emailService');

const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

// Allowed roles (match Prisma enum)
const ALLOWED_USER_ROLES = new Set(['DOCTOR', 'PATIENT', 'PHARMACY']);
const ALLOWED_ADMIN_ROLES = new Set(['SUPERADMIN', 'ADMIN', 'SUPPORT']);

// -------------------------
// Register (Handles Users and Admins)
// -------------------------
// Accepts: { name, email, password, role? }
// If role is missing/invalid → defaults to PATIENT
router.post('/register', async (req, res) => {
  try {
    let { firstName, middleName, lastName, email, password, role, dateOfBirth, gender } = req.body || {};

    if (!firstName || !lastName || !email || !password || !dateOfBirth || !gender) {
      return res
        .status(400)
        .json({ error: 'Missing required fields: firstName, lastName, email, password, dateOfBirth, gender' });
    }

    // normalize
    email = String(email).trim().toLowerCase();

    // Default to PATIENT if role is missing or invalid
    if (!role) {
      role = 'PATIENT';
    }

    // ✅ Handle Admin registrations
    if (ALLOWED_ADMIN_ROLES.has(role)) {
      const existingAdmin = await prisma.admin.findUnique({ where: { email } });
      if (existingAdmin)
        return res.status(400).json({ error: 'Admin email already exists' });

      const adminHash = await bcrypt.hash(password, 10);
      const newAdmin = await prisma.admin.create({
        data: {
          name: `${firstName} ${lastName}`, // Admin model still uses single name
          email,
          password: adminHash,
          role: role, // Uses passed SUPERADMIN, ADMIN, or SUPPORT
        },
      });
      return res
        .status(201)
        .json({ message: 'Admin account provisioned', user: newAdmin });
    }

    // ✅ Handle User registrations (Patient/Doctor/Pharmacy)
    const userRole = ALLOWED_USER_ROLES.has(role) ? role : 'PATIENT';

    // Ensure unique email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Create user first
    const user = await prisma.user.create({
      data: {
        firstName,
        middleName,
        lastName,
        email,
        password: hashed,
        role: userRole,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        // subscriptionState defaults in Prisma schema (UNSUBSCRIBED)
      },
      select: { id: true, firstName: true, lastName: true, email: true, role: true },
    });

    // Provision a default profile so UI never breaks after first login
    try {
      // Pass specialization to profile logic if it's a doctor
      await ensureDefaultProfile(user, req.body.specialization);
    } catch (e) {
      // Non-fatal: log and proceed (user can still log in, profile can be created later)
      console.error('⚠️ Failed to provision default profile:', e);
    }

    // ✅ Generate and send OTP for email verification
    try {
      const otp = generateOTP();
      const expiresAt = getOTPExpiration();

      // Delete any existing unverified OTPs for this email
      await prisma.emailOTP.deleteMany({
        where: {
          email,
          verified: false,
        },
      });

      // Store OTP in database
      await prisma.emailOTP.create({
        data: {
          email,
          otp,
          expiresAt,
          verified: false,
        },
      });

      // Send OTP email (non-blocking)
      sendOTPEmail(email, otp).catch(err => {
        console.error('⚠️ Failed to send OTP email:', err);
      });

      console.log(`📧 OTP sent to ${email} for verification`);
    } catch (otpError) {
      // Non-fatal: user is registered, OTP can be resent
      console.error('⚠️ Failed to generate/send OTP:', otpError);
    }

    return res.status(201).json({
      message: 'User registered. Please check your email for verification code.',
      user,
      requiresVerification: true,
    });
  } catch (err) {
    if (err?.code === 'P2002') {
      return res.status(400).json({ error: 'Email is already registered' });
    }
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// -------------------------
// Login (works for Users and Admins)
// -------------------------
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }
    email = String(email).trim().toLowerCase();

    // 1) Try USERS
    let account = await prisma.user.findUnique({ where: { email } });
    let type = 'USER';

    // 2) Fall back to ADMINS
    if (!account) {
      account = await prisma.admin.findUnique({ where: { email } });
      type = 'ADMIN';
    }

    if (!account) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 3) Password check (supports older plaintext seeds)
    let isMatch = false;
    if (account.password === password) {
      isMatch = true; // (not recommended for production; keep for seed/dev only)
    } else {
      isMatch = await bcrypt.compare(password, account.password);
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 4) Token
    const token = jwt.sign(
      { id: account.id, role: account.role, type },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 5) Response
    return res.json({
      token,
      user: {
        id: account.id,
        name: type === 'ADMIN' 
          ? account.name 
          : `${account.firstName} ${account.lastName}`.trim(),
        role: account.role,
        email: account.email,
        type, // "USER" or "ADMIN"
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
