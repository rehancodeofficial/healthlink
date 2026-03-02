// FILE: backend/routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const prisma = require("../prisma/prismaClient");
const { ensureDefaultProfile } = require("../lib/provisionProfile");
const { generateOTP, getOTPExpiration } = require("../lib/otpGenerator");
const { sendOTPEmail } = require("../lib/emailService");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Allowed roles (match Prisma enum)
const ALLOWED_USER_ROLES = new Set(["DOCTOR", "PATIENT", "PHARMACY"]);
const ALLOWED_ADMIN_ROLES = new Set(["SUPERADMIN", "ADMIN", "SUPPORT"]);

// -------------------------
// Register Success (Supabase Sync)
// -------------------------
router.post("/register-success", async (req, res) => {
  try {
    const {
      supabaseId,
      firstName,
      lastName,
      email,
      phone,
      role,
      dateOfBirth,
      gender,
    } = req.body || {};

    if (!supabaseId || !email) {
      return res
        .status(400)
        .json({ error: "Missing required fields: supabaseId, email" });
    }

    const normedEmail = String(email).trim().toLowerCase();

    // Check if user already exists
    let existingUser = await prisma.user.findUnique({
      where: { email: normedEmail },
    });

    // If not, create them
    if (!existingUser) {
      existingUser = await prisma.user.create({
        data: {
          id: supabaseId, // Use Supabase ID as our primary key
          firstName: firstName || "First",
          lastName: lastName || "Last",
          email: normedEmail,
          phone: phone || null,
          password: "supabase-managed", // Placeholder since password is in Supabase
          role: role || "PATIENT",
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date(),
          gender: gender || "PREFER_NOT_TO_SAY",

          // Create a default Organization for this user
          organization: {
            create: {
              name: `${firstName || "User"}'s Organization`,
              ownerId: supabaseId, // We set it here, but it's optional in schema for now
            },
          },
        },
      });

      // Provision default profile
      try {
        await ensureDefaultProfile(existingUser, req.body.specialization);
      } catch (e) {
        console.error("⚠️ Failed to provision default profile:", e);
      }
    }

    return res.status(201).json({
      message: "User synchronized successfully",
      user: existingUser,
    });
  } catch (err) {
    console.error("Register Sync error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// -------------------------
// Login Sync (Supabase Sync)
// -------------------------
router.post("/login-sync", async (req, res) => {
  try {
    const { email, supabaseId } = req.body || {};

    if (!email) {
      return res.status(400).json({ error: "Missing email" });
    }

    const normedEmail = String(email).trim().toLowerCase();

    // 1) Try Finding User
    let account = await prisma.user.findUnique({
      where: { email: normedEmail },
    });

    if (!account) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2) Create Legacy JWT
    const token = jwt.sign(
      { id: account.id, role: account.role, type: "USER" },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.json({
      token,
      user: {
        id: account.id,
        name: `${account.firstName} ${account.lastName}`.trim(),
        role: account.role,
        email: account.email,
        type: "USER",
      },
    });
  } catch (err) {
    console.error("Login Sync error:", err);
    return res.status(500).json({ error: `Server error: ${err.message}` });
  }
});

// -------------------------
// Request OTP (Backend-driven)
// -------------------------
router.post("/request-otp-login", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const normedEmail = String(email).trim().toLowerCase();

    // Check if user exists in our DB first (Security)
    const user = await prisma.user.findUnique({
      where: { email: normedEmail },
    });
    if (!user) {
      return res
        .status(404)
        .json({ error: "No account found with this email" });
    }

    const otp = generateOTP();
    const expiresAt = getOTPExpiration();

    // Store OTP in DB
    await prisma.emailOTP.create({
      data: {
        email: normedEmail,
        otp,
        expiresAt,
      },
    });

    // Send via email service
    await sendOTPEmail(normedEmail, otp);

    return res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("OTP Request Error:", err);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
});

// -------------------------
// Verify OTP (Backend-driven)
// -------------------------
router.post("/verify-otp-login", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ error: "Email and OTP are required" });

    const normedEmail = String(email).trim().toLowerCase();

    // Find valid OTP
    const record = await prisma.emailOTP.findFirst({
      where: {
        email: normedEmail,
        otp,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Mark as verified
    await prisma.emailOTP.update({
      where: { id: record.id },
      data: { verified: true },
    });

    // Get user and generate token
    const user = await prisma.user.findUnique({
      where: { email: normedEmail },
    });

    // Create JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, type: "USER" },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`.trim(),
        role: user.role,
        email: user.email,
        type: "USER",
      },
    });
  } catch (err) {
    console.error("OTP Verification Error:", err);
    return res.status(500).json({ error: "Verification failed" });
  }
});

// -------------------------
// Request OTP for Signup
// -------------------------
router.post("/request-otp-signup", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const normedEmail = String(email).trim().toLowerCase();

    // Check if user ALREADY exists
    const user = await prisma.user.findUnique({
      where: { email: normedEmail },
    });
    if (user) {
      return res
        .status(400)
        .json({
          error: "Account already exists with this email. Please login.",
        });
    }

    const otp = generateOTP();
    const expiresAt = getOTPExpiration();

    // Store OTP in DB
    await prisma.emailOTP.create({
      data: {
        email: normedEmail,
        otp,
        expiresAt,
      },
    });

    // Send via email service
    await sendOTPEmail(normedEmail, otp);

    return res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("OTP Signup Request Error:", err);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
});

// -------------------------
// Verify OTP for Signup & Create User
// -------------------------
router.post("/verify-otp-signup", async (req, res) => {
  try {
    const {
      email,
      otp,
      firstName,
      lastName,
      role,
      specialization,
      customProfession,
      dateOfBirth,
      gender,
    } = req.body;

    if (!email || !otp || !firstName || !lastName || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const normedEmail = String(email).trim().toLowerCase();

    // Verify OTP
    const record = await prisma.emailOTP.findFirst({
      where: {
        email: normedEmail,
        otp,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Mark OTP as verified
    await prisma.emailOTP.update({
      where: { id: record.id },
      data: { verified: true },
    });

    // Create User atomically
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: normedEmail,
        password: "otp-managed",
        role,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date(),
        gender: gender || "PREFER_NOT_TO_SAY",
        organization: {
          create: {
            name: `${firstName}'s Organization`,
          },
        },
      },
    });

    // Update Organization Owner
    if (user.organizationId) {
      await prisma.organization.update({
        where: { id: user.organizationId },
        data: { ownerId: user.id },
      });
    }

    // Provision Profile
    try {
      const finalSpecialization =
        specialization === "Other" ? customProfession : specialization;
      await ensureDefaultProfile(user, finalSpecialization);
    } catch (e) {
      console.error("Profile provisioning error (non-fatal):", e);
    }

    // Generate Token
    const token = jwt.sign(
      { id: user.id, role: user.role, type: "USER" },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`.trim(),
        role: user.role,
        email: user.email,
        type: "USER",
      },
    });
  } catch (err) {
    console.error("Signup Verification Error:", err);
    return res
      .status(500)
      .json({ error: "Registration failed: " + err.message });
  }
});

module.exports = router;
