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

// ✅ ENV Validation — logged once at startup so Railway logs show exactly what's missing
console.log("[AUTH] ENV CHECK:", {
  JWT_SECRET: JWT_SECRET ? "✅ SET" : "❌ MISSING",
  DATABASE_URL: process.env.DATABASE_URL ? "✅ SET" : "❌ MISSING",
  DIRECT_URL: process.env.DIRECT_URL ? "✅ SET" : "⚠️  NOT SET (may cause Prisma issues)",
  EMAIL_USER: process.env.EMAIL_USER || process.env.GMAIL_USER ? "✅ SET" : "❌ MISSING",
  EMAIL_PASS: process.env.EMAIL_PASS || process.env.GMAIL_PASS ? "✅ SET" : "❌ MISSING",
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || "gmail (default)",
  NODE_ENV: process.env.NODE_ENV || "not set",
});

// -------------------------
// Register — custom hash + OTP
// -------------------------
router.post("/register", async (req, res) => {
  // 🔍 Step 1: Log all incoming data so Railway logs show exactly what arrived
  console.log("[REGISTER] Incoming request body:", JSON.stringify(req.body, null, 2));
  console.log("[REGISTER] Content-Type:", req.headers["content-type"]);

  try {
    let { email, password, firstName, lastName, phone, role, dateOfBirth, gender, specialization } = req.body;

    // ✅ Validate required fields with specific messages
    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }
    if (!password) {
      return res.status(400).json({ error: "password is required" });
    }

    const normedEmail = String(email).trim().toLowerCase();
    console.log("[REGISTER] Normalized email:", normedEmail);

    // ✅ Validate JWT_SECRET before proceeding
    if (!JWT_SECRET) {
      console.error("[REGISTER] ❌ JWT_SECRET is not set in environment!");
      return res.status(500).json({ error: "Server configuration error: JWT_SECRET missing" });
    }

    // ✅ Check if user already exists
    let existingUser;
    try {
      existingUser = await prisma.user.findUnique({ where: { email: normedEmail } });
    } catch (dbErr) {
      console.error("[REGISTER] ❌ DB connection error on findUnique:", dbErr.message, dbErr.code);
      return res.status(500).json({
        error: "Database connection failed",
        detail: dbErr.message,
        code: dbErr.code
      });
    }

    if (existingUser) {
      console.log("[REGISTER] User already exists:", normedEmail);
      return res.status(400).json({ error: "User already exists with this email" });
    }

    // 1. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2. Create unverified user in Prisma
    let user;
    try {
      user = await prisma.user.create({
        data: {
          firstName: firstName || "First",
          lastName: lastName || "Last",
          email: normedEmail,
          phone: phone || null,
          password: hashedPassword,
          isVerified: false,
          role: role || "PATIENT",
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date(),
          gender: gender || "PREFER_NOT_TO_SAY"
        }
      });
      console.log("[REGISTER] ✅ User created with ID:", user.id);
    } catch (createErr) {
      console.error("[REGISTER] ❌ Failed to create user:", createErr.message, createErr.code, createErr.meta);
      return res.status(500).json({
        error: "Failed to create user account",
        detail: createErr.message,
        code: createErr.code
      });
    }

    // 3. Provision profile if needed
    if (specialization) {
      try {
        await ensureDefaultProfile(user, specialization);
      } catch (e) {
        console.error("[REGISTER] Failed to provision profile:", e.message);
      }
    }

    // 4. Generate & Store OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiration();

    try {
      await prisma.emailOTP.create({
        data: { email: normedEmail, otp, expiresAt, verified: false }
      });
      console.log("[REGISTER] ✅ OTP record created for:", normedEmail);
    } catch (otpErr) {
      console.error("[REGISTER] ❌ Failed to create OTP record:", otpErr.message, otpErr.meta);
      // Non-fatal: user is created, continue
    }

    // 5. Send OTP via Gmail SMTP
    try {
      await sendOTPEmail(normedEmail, otp);
      console.log("[REGISTER] ✅ OTP email sent to:", normedEmail);
    } catch (emailErr) {
      console.error("[REGISTER] ❌ Email send failed:", emailErr.message);
      // Non-fatal: user still registered, can resend OTP later
    }

    return res.status(201).json({
      message: "Registration successful! Please check your email for the verification code.",
      email: normedEmail
    });

  } catch (err) {
    // ✅ Full error details in Railway logs
    console.error("[REGISTER] ❌ Unhandled error:", err.message);
    console.error("[REGISTER] Stack:", err.stack);
    console.error("[REGISTER] Code:", err.code);
    console.error("[REGISTER] Meta:", JSON.stringify(err.meta));
    return res.status(500).json({
      error: "Internal server error",
      detail: err.message,
      code: err.code
    });
  }
});

// -------------------------
// Login — custom password check
// -------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normedEmail = String(email).trim().toLowerCase();

    // 1. Find user
    const user = await prisma.user.findUnique({
      where: { email: normedEmail }
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 2. Check if verified
    if (!user.isVerified) {
      return res.status(403).json({ 
        error: "Your account is not verified. Please verify your email first.",
        unverified: true,
        email: user.email
      });
    }

    // 3. Check password (if user has one - legacy users might not)
    if (!user.password) {
      return res.status(400).json({ 
        error: "No password set for this account. Please use OTP login or reset your password.",
        legacy: true
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 4. Issue JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, type: "USER" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`.trim(),
        role: user.role,
        email: user.email,
        type: "USER"
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// -------------------------
// Keep old stubs for backward compat or custom OTP login if needed
// -------------------------
router.post("/login-sync", (req, res) => {
  res.status(410).json({ error: "Supabase sync is deprecated. Please use /auth/login" });
});

router.post("/register-success", (req, res) => {
  res.status(410).json({ error: "Supabase sync is deprecated. Please use /auth/register" });
});

module.exports = router;
