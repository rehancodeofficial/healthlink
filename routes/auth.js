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

// -------------------------
// Register — custom hash + OTP
// -------------------------
router.post("/register", async (req, res) => {
  try {
    let { email, password, firstName, lastName, phone, role, dateOfBirth, gender, specialization } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }
    
    const normedEmail = String(email).trim().toLowerCase();
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email: normedEmail } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" });
    }
    
    // 1. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // 2. Create unverified user in Prisma
    const user = await prisma.user.create({
      data: {
        firstName: firstName || "First",
        lastName: lastName || "Last",
        email: normedEmail,
        phone: phone || null,
        password: hashedPassword,
        isVerified: false, // Must verify via OTP
        role: role || "PATIENT",
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date(),
        gender: gender || "PREFER_NOT_TO_SAY"
      }
    });

    // 3. Provision profile if needed
    if (specialization) {
      try {
        await ensureDefaultProfile(user, specialization);
      } catch (e) {
        console.error("Failed to provision profile:", e);
      }
    }
    
    // 4. Generate & Store OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiration();
    
    await prisma.emailOTP.create({
      data: {
        email: normedEmail,
        otp,
        expiresAt,
        verified: false
      }
    });
    
    // 5. Send OTP via Gmail SMTP
    try {
      await sendOTPEmail(normedEmail, otp);
    } catch (emailErr) {
      console.error("Failed to send registration OTP email:", emailErr);
      // We still created the user, they can request a resend later
    }
    
    return res.status(201).json({
      message: "Registration successful! please check your email for the verification code.",
      email: normedEmail
    });
    
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Internal server error" });
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
      { expiresIn: "1d" }
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
