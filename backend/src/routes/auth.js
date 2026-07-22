// FILE: backend/routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const prisma = require("../prisma/prismaClient");
const { ensureDefaultProfile } = require("../lib/provisionProfile");
const rateLimit = require("express-rate-limit");
const { generateOTP, getOTPExpiration, isOTPExpired } = require('../lib/otpGenerator');
const { sendOTPEmail, verifySMTPConnection } = require('../lib/emailService');
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

console.log("[AUTH] ENV CHECK:", {
  JWT_SECRET: JWT_SECRET ? " SET" : " MISSING",
  DATABASE_URL: process.env.DATABASE_URL ? " SET" : " MISSING",
  NODE_ENV: process.env.NODE_ENV || "not set",
});

// Register
router.post("/register", async (req, res) => {
  console.log("[REGISTER] Incoming request body:", JSON.stringify(req.body, null, 2));

  try {
    let { email, password, firstName, lastName, phone, role, dateOfBirth, gender, specialization } = req.body;
    
    // 1. Validate Required Fields
    if (!email) return res.status(400).json({ error: "email is required" });
    if (!password) return res.status(400).json({ error: "password is required" });
    if (!firstName) return res.status(400).json({ error: "firstName is required" });

    const normedEmail = String(email).trim().toLowerCase();
    
    // 2. Validate Email Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normedEmail)) {
      return res.status(400).json({ error: "Please provide a valid email address" });
    }

    // 3. Validate Password Length
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    if (!JWT_SECRET) {
      return res.status(500).json({ error: "Server configuration error: JWT_SECRET missing" });
    }

    // Check if user already exists
    const existingEmail = await prisma.user.findUnique({ where: { email: normedEmail } });

    if (existingEmail) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    // SMTP Health Check
    verifySMTPConnection().then(isHealthy => {
      if (!isHealthy) console.warn("[REGISTER] SMTP Health Check failed. Email might be delayed.");
    });

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in Prisma
    const user = await prisma.user.create({
      data: {
        firstName: firstName || "First",
        lastName: lastName || "Last",
        email: normedEmail,
        phone: phone || null,
        password: hashedPassword,
        role: role || "PATIENT",
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date(),
        gender: gender || "PREFER_NOT_TO_SAY"
      }
    });
    console.log("[REGISTER] Prisma user created:", user.id);
    
    // Generate and Send OTP for registration verification
    const otp = generateOTP();
    const expiresAt = getOTPExpiration();

    try {
      await prisma.emailOTP.create({
        data: { email: normedEmail, otp, expiresAt, verified: false }
      });
      console.log("[REGISTER] OTP record created");
    } catch (otpErr) {
      console.error("[REGISTER] Failed to create OTP record:", otpErr.message);
    }

    sendOTPEmail(normedEmail, otp).catch(err => {
      console.error("[REGISTER] Registration OTP Delivery Failed:", err.message);
    });

    // Provision default profile
    try {
      await ensureDefaultProfile(user, specialization);
    } catch (e) {
      console.error("[REGISTER] Failed to provision profile:", e.message);
    }
    
    // We can issue a token right away or wait for OTP verification.
    // Based on previous logic, it returned success and asked to verify.
    return res.status(201).json({
      message: "Account created! Please verify your email with the 6-digit code sent to your inbox.",
      requiresVerification: true,
      email: normedEmail,
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`.trim(),
        role: user.role,
        email: user.email,
      },
    });
    
  } catch (err) {
    console.error("[REGISTER] Unhandled error:", err);
    return res.status(500).json({ error: "An unexpected error occurred during registration" });
  }
});


// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normedEmail = String(email).trim().toLowerCase();
    
    const user = await prisma.user.findUnique({
      where: { email: normedEmail }
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user.password) {
      return res.status(401).json({ error: "Invalid email or password (Legacy account - please use password reset)" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Create JWT
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
    console.error("[LOGIN] Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


// Request OTP Login
router.post("/request-otp-login", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const normedEmail = String(email).trim().toLowerCase();

    const userSnapshot = await prisma.user.findUnique({
      where: { email: normedEmail },
    });

    if (!userSnapshot) {
      return res.status(404).json({ error: "No account found with this email" });
    }

    const otp = generateOTP();
    const expiresAt = getOTPExpiration();

    await prisma.emailOTP.deleteMany({
      where: { email: normedEmail, verified: false },
    });

    await prisma.emailOTP.create({
      data: {
        email: normedEmail,
        otp,
        expiresAt,
        verified: false,
      },
    });

    try {
      await sendOTPEmail(normedEmail, otp);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      return res.status(500).json({ error: "Failed to send verification email. Please try again later." });
    }

    return res.json({ message: "6-digit OTP sent to your email", expiresAt });
  } catch (err) {
    console.error("OTP Request Error:", err);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
});

// Verify OTP Login
router.post("/verify-otp-login", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const normedEmail = String(email).trim().toLowerCase();
    const otpCode = String(otp).trim();

    const otpRecord = await prisma.emailOTP.findFirst({
      where: {
        email: normedEmail,
        otp: otpCode,
        verified: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (isOTPExpired(otpRecord.expiresAt)) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    await prisma.emailOTP.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    const user = await prisma.user.findUnique({
      where: { email: normedEmail },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

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
        type: "USER",
      },
    });
  } catch (err) {
    console.error("OTP Verification Error:", err);
    return res.status(500).json({ error: "Verification failed" });
  }
});


// Change Password
router.post("/change-password", authenticateToken, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user.id;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password catch:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Request Password Reset OTP
router.post("/request-password-reset", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const normedEmail = String(email).trim().toLowerCase();

    const userSnapshot = await prisma.user.findUnique({
      where: { email: normedEmail },
    });

    if (!userSnapshot) {
      // Don't leak if user exists or not
      return res.json({ message: "If your email is registered, you will receive an OTP." });
    }

    const otp = generateOTP();
    const expiresAt = getOTPExpiration();

    await prisma.emailOTP.deleteMany({
      where: { email: normedEmail, verified: false },
    });

    await prisma.emailOTP.create({
      data: {
        email: normedEmail,
        otp,
        expiresAt,
        verified: false,
      },
    });

    try {
      await sendOTPEmail(normedEmail, otp);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      return res.status(500).json({ error: "Failed to send reset email. Please try again later." });
    }

    return res.json({ message: "If your email is registered, you will receive an OTP." });
  } catch (err) {
    console.error("Password reset request error:", err);
    return res.status(500).json({ error: "Failed to request password reset" });
  }
});

// Verify Password Reset OTP
router.post("/verify-password-reset-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const normedEmail = String(email).trim().toLowerCase();
    const otpCode = String(otp).trim();

    const otpRecord = await prisma.emailOTP.findFirst({
      where: {
        email: normedEmail,
        otp: otpCode,
        verified: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (isOTPExpired(otpRecord.expiresAt)) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    await prisma.emailOTP.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    const user = await prisma.user.findUnique({
      where: { email: normedEmail },
    });

    // Create a temporary JWT that only allows password reset
    const resetToken = jwt.sign(
      { id: user.id, type: "PASSWORD_RESET" },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.json({ resetToken });
  } catch (err) {
    console.error("OTP Verification Error:", err);
    return res.status(500).json({ error: "Verification failed" });
  }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "Invalid request or password too short" });
    }

    let payload;
    try {
      payload = jwt.verify(resetToken, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired reset token" });
    }

    if (payload.type !== "PASSWORD_RESET") {
      return res.status(401).json({ error: "Invalid token type" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: payload.id },
      data: { password: hashedPassword }
    });

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Reset password catch:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
