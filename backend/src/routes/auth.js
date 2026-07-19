// FILE: backend/routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma/prismaClient");
const { ensureDefaultProfile } = require("../lib/provisionProfile");
const { supabaseAdmin } = require("../lib/supabaseAdmin");
const rateLimit = require("express-rate-limit");
const { generateOTP, getOTPExpiration, isOTPExpired } = require('../lib/otpGenerator');
const { sendOTPEmail, sendRegistrationEmail, verifySMTPConnection } = require('../lib/emailService');
const { authenticateToken } = require("../middleware/auth");

// Rate limit for registration: removed as per request to prevent accidental blocking
/* 
const registerLimiter = rateLimit({
  windowMs: process.env.NODE_ENV === "development" ? 1 * 60 * 1000 : 15 * 60 * 1000, 
  max: process.env.NODE_ENV === "development" ? 1000 : 500,
  message: { error: "Too many registration attempts. Please wait a few minutes and try again." },
});
*/

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
// Register — sends confirmation email via Supabase signUp
// -------------------------
router.post("/register", async (req, res) => {
  // 🔍 Step 1: Log all incoming data so Railway logs show exactly what arrived
  console.log("[REGISTER] Incoming request body:", JSON.stringify(req.body, null, 2));

  try {
    let { email, password, firstName, lastName, phone, role, dateOfBirth, gender, specialization } = req.body;
    
    // 1. Validate Required Fields
    if (!email) {
      console.warn("[REGISTER] ⚠️ Missing email");
      return res.status(400).json({ error: "email is required" });
    }
    if (!password) {
      console.warn("[REGISTER] ⚠️ Missing password");
      return res.status(400).json({ error: "password is required" });
    }
    if (!firstName) {
      console.warn("[REGISTER] ⚠️ Missing firstName");
      return res.status(400).json({ error: "firstName is required" });
    }

    const normedEmail = String(email).trim().toLowerCase();
    
    // 2. Validate Email Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normedEmail)) {
      console.warn(`[REGISTER] ⚠️ Invalid email format for: ${normedEmail}`);
      return res.status(400).json({ error: "Please provide a valid email address" });
    }

    // 3. Validate Password Length
    if (password.length < 6) {
      console.warn(`[REGISTER] ⚠️ Password too short for: ${normedEmail}`);
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    // ✅ Validate JWT_SECRET before proceeding
    if (!JWT_SECRET) {
      console.error("[REGISTER] ❌ JWT_SECRET is not set in environment!");
      return res.status(500).json({ error: "Server configuration error: JWT_SECRET missing" });
    }

    console.log(`[REGISTER] Finalizing validation for: ${normedEmail}`);
    
    // Check if user already exists
    let existingEmail;
    try {
      existingEmail = await prisma.user.findUnique({ where: { email: normedEmail } });
    } catch (dbErr) {
      console.error("[REGISTER] ❌ DB connection error on findUnique:", dbErr.message);
      return res.status(500).json({
        error: "Database connection failed",
        detail: dbErr.message,
        code: dbErr.code
      });
    }

    if (existingEmail) {
      console.warn(`[REGISTER] ⚠️ User already exists with email: ${normedEmail}`);
      return res.status(400).json({ error: "User already exists with this email" });
    }

    // 1. SMTP Health Check (Non-blocking)
    verifySMTPConnection().then(isHealthy => {
      if (!isHealthy) console.warn("[REGISTER] ⚠️ SMTP Health Check failed. Email might be delayed.");
    });

    console.log("[REGISTER] Creating user in Supabase...");
    const { data: supaData, error: supaError } = await supabaseAdmin.auth.admin.createUser({
      email: normedEmail,
      password: password,
      email_confirm: false, // 👈 Require email confirmation
      user_metadata: { firstName, lastName, role, dateOfBirth, gender, specialization }
    });
    
    if (supaError) {
      console.error("[REGISTER] ❌ Supabase signup error:", supaError.message);
      return res.status(400).json({ error: supaError.message });
    }
    
    if (!supaData?.user?.id) {
      console.error("[REGISTER] ❌ No user ID returned from Supabase");
      return res.status(400).json({ error: "Failed to create user in Supabase" });
    }

    console.log("[REGISTER] ✅ Supabase user created:", supaData.user.id);
    
    // Create or update in Prisma
    let user;
    try {
      user = await prisma.user.upsert({
        where: { id: supaData.user.id },
        update: {
          firstName: firstName || "First",
          lastName: lastName || "Last",
          phone: phone || null,
          role: role || "PATIENT",
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date(),
          gender: gender || "PREFER_NOT_TO_SAY"
        },
        create: {
          id: supaData.user.id,
          firstName: firstName || "First",
          lastName: lastName || "Last",
          email: normedEmail,
          phone: phone || null,
          password: null,
          role: role || "PATIENT",
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date(),
          gender: gender || "PREFER_NOT_TO_SAY"
        }
      });
      console.log("[REGISTER] ✅ Prisma user synchronized:", user.id);
    } catch (prismaErr) {
      console.error("[REGISTER] ❌ Prisma sync error:", prismaErr.message);
      return res.status(500).json({ error: "Failed to sync user to database", detail: prismaErr.message });
    }
    
    // 3. Generate and Send OTP for registration verification
    const otp = generateOTP();
    const expiresAt = getOTPExpiration();

    try {
      await prisma.emailOTP.create({
        data: { email: normedEmail, otp, expiresAt, verified: false }
      });
      console.log("[REGISTER] ✅ OTP record created");
    } catch (otpErr) {
      console.error("[REGISTER] ❌ Failed to create OTP record:", otpErr.message);
    }

    // Send OTP email
    sendOTPEmail(normedEmail, otp).catch(err => {
      console.error("[REGISTER] ❌ Registration OTP Delivery Failed:", err.message);
    });

    // Provision default profile
    try {
      await ensureDefaultProfile(user, specialization);
      console.log("[REGISTER] ✅ profile provisioned for specialization:", specialization || "none");
    } catch (e) {
      console.error("[REGISTER] Failed to provision profile:", e.message);
    }
    
    return res.status(201).json({
      message: "Account created! Please verify your email with the 6-digit code sent to your inbox.",
      requiresVerification: true,
      email: normedEmail,
      user: user,
    });
    
  } catch (err) {
    console.error("[REGISTER] ❌ Unhandled error:", err.message);
    console.error("[REGISTER] Stack:", err.stack);
    return res.status(500).json({ 
      error: "An unexpected error occurred during registration",
      detail: err.message
    });
  }
});

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
        specialization,
      } = req.body || {};

      console.log(`[DEBUG] Incoming /register-success request for email: ${email}, supabaseId: ${supabaseId}`);

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
        try {
          existingUser = await prisma.user.create({
            data: {
              id: supabaseId, // Use Supabase ID as primary key
              firstName: firstName || "First",
              lastName: lastName || "Last",
              email: normedEmail,
              phone: phone || null,
              password: null, // Supabase manages passwords
              role: role || "PATIENT",
              dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date(),
              gender: gender || "PREFER_NOT_TO_SAY",
              // Organization can be created separately if needed
            },
          });

          console.log("✅ User created successfully:", existingUser.id);

        // Provision default profile
        try {
          await ensureDefaultProfile(existingUser, specialization);
          console.log("✅ Default profile created for:", existingUser.role);
        } catch (profileError) {
          console.error(
            "⚠️ Failed to provision default profile:",
            profileError,
          );
          // Don't fail the entire signup if profile creation fails
        }
      } catch (dbError) {
        console.error("❌ Database error creating user:", dbError);
        return res.status(500).json({
          error: "Database error saving new user",
          details:
            process.env.NODE_ENV === "development"
              ? dbError.message || JSON.stringify(dbError)
              : "Please contact support",
          prismaError:
            process.env.NODE_ENV === "development" ? dbError : undefined,
        });
      }
    }

    // Create legacy JWT for backend API
    const token = jwt.sign(
      { id: existingUser.id, role: existingUser.role, type: "USER" },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.status(201).json({
      message: "User synchronized successfully",
      user: existingUser,
      token,
    });
  } catch (err) {
    console.error("Register Sync error:", err);
    return res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});



// -------------------------
// Login Sync (Validate Supabase JWT & Sync)
// -------------------------
router.post("/login-sync", async (req, res) => {
  try {
    const { email, supabaseAccessToken } = req.body || {};

    if (!email) {
      return res.status(400).json({ error: "Missing email" });
    }

    const normedEmail = String(email).trim().toLowerCase();

    // Validate Supabase JWT if provided
    if (supabaseAccessToken) {
      const {
        data: { user },
        error,
      } = await supabaseAdmin.auth.getUser(supabaseAccessToken);
      if (error || !user) {
        return res.status(401).json({ error: "Invalid Supabase session" });
      }

      // Check if email is verified
      if (!user.email_confirmed_at) {
        return res.status(403).json({
          error:
            "Email not verified. Please check your email and verify your account before logging in.",
        });
      }
    }

    // Find User in our DB by email
    let account = await prisma.user.findUnique({
      where: { email: normedEmail },
    });

    if (!account) {
      return res.status(404).json({
        error: "User not found in database. Please complete registration.",
      });
    }

    // Create Legacy JWT for backend API
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
// Request OTP Login (via Supabase)
// -------------------------
router.post("/request-otp-login", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const normedEmail = String(email).trim().toLowerCase();

    // Check if user exists in our DB first
    const userSnapshot = await prisma.user.findUnique({
      where: { email: normedEmail },
    });

    if (!userSnapshot) {
      return res
        .status(404)
        .json({ error: "No account found with this email" });
    }

    // Generate custom 6-digit OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiration();

    // Store OTP in database
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

    // Send OTP email
    try {
      await sendOTPEmail(normedEmail, otp);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      return res.status(500).json({
        error: "Failed to send verification email. Please try again later.",
      });
    }

    return res.json({ message: "6-digit OTP sent to your email", expiresAt });
  } catch (err) {
    console.error("OTP Request Error:", err);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
});

// -------------------------
// Verify OTP Login (via Supabase)
// -------------------------
router.post("/verify-otp-login", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const normedEmail = String(email).trim().toLowerCase();
    const otpCode = String(otp).trim();

    // Find the latest OTP for this email
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

    // Check if OTP has expired
    if (isOTPExpired(otpRecord.expiresAt)) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    // Mark OTP as verified
    await prisma.emailOTP.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    // 4. Sync verification status with Supabase (handles verification on login)
    try {
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      const supaUser = users.find(u => u.email?.toLowerCase() === normedEmail);
      
      if (supaUser && !supaUser.email_confirmed_at) {
        console.log(`[DEBUG] Confirming user ${normedEmail} in Supabase after OTP verify-login...`);
        await supabaseAdmin.auth.admin.updateUserById(supaUser.id, { email_confirm: true });
      }
    } catch (supaErr) {
      console.error('⚠️ Supabase confirmation error in verify-otp-login:', supaErr.message);
    }

    // Get user from our DB
    const user = await prisma.user.findUnique({
      where: { email: normedEmail },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

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

/**
 * -------------------------
 * POST /api/auth/change-password
 * Change user password in Supabase
 * -------------------------
 */
router.post("/change-password", authenticateToken, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user.id;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (error) {
      console.error("Change password error:", error);
      return res.status(400).json({ error: error.message });
    }

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password catch:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
