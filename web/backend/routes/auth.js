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

// -------------------------
// Register — sends confirmation email via Supabase signUp
// -------------------------
router.post("/register", async (req, res) => {
  try {
    console.log("[DEBUG] Registration request body:", req.body);
    
    let { email, password, firstName, lastName, phone, role, dateOfBirth, gender, specialization } = req.body;
    
    // 1. Validate Required Fields
    if (!email || !password || !firstName) {
      console.warn("⚠️ Registration failed: Missing required fields (email, password, or firstName).");
      return res.status(400).json({ error: "All fields are required" });
    }

    const normedEmail = String(email).trim().toLowerCase();
    
    // 2. Validate Email Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normedEmail)) {
      console.warn(`⚠️ Registration failed: Invalid email format for: ${normedEmail}`);
      return res.status(400).json({ error: "Please provide a valid email address" });
    }

    // 3. Validate Password Length
    if (password.length < 6) {
      console.warn(`⚠️ Registration failed: Password too short for: ${normedEmail}`);
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    console.log(`[DEBUG] Finalizing /register validation for: ${normedEmail}`);
    
    // Check if user already exists
    const existingEmail = await prisma.user.findUnique({ where: { email: normedEmail } });
    if (existingEmail) {
      console.warn(`⚠️ Registration failed: User already exists with email: ${normedEmail}`);
      return res.status(400).json({ error: "User already exists" });
    }


    // 1. SMTP Health Check (Non-blocking)
    // We check it for logging, but we no longer block registration with a 503.
    verifySMTPConnection().then(isHealthy => {
      if (!isHealthy) console.warn("⚠️ SMTP Health Check failed during registration. Email might be delayed.");
    });

    const { data: supaData, error: supaError } = await supabaseAdmin.auth.admin.createUser({
      email: normedEmail,
      password: password,
      email_confirm: true,
      user_metadata: { firstName, lastName, role, dateOfBirth, gender, specialization }
    });
    
    console.log("[DEBUG] Supabase response:", { supaData, supaError });
    
    if (supaError) {
      console.error("Supabase signup error:", supaError.message);
      return res.status(400).json({ error: supaError.message });
    }
    
    if (!supaData?.user?.id) {
      return res.status(400).json({ error: "Failed to create user — please try again." });
    }
    
    // Create or update in Prisma
    const existingUser = await prisma.user.upsert({
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
    
    // 3. Send custom Welcome email in BACKGROUND (Non-blocking)
    sendRegistrationEmail(normedEmail, firstName).catch(err => {
      console.error("🚨 Background Email Delivery Failed (all retries exhausted):", err.message);
    });

    // Provision default profile
    try {
      await ensureDefaultProfile(existingUser, specialization);
    } catch (e) {
      console.error("Failed to provision profile:", e);
    }
    
    const token = jwt.sign(
      { id: existingUser.id, role: existingUser.role, type: "USER" },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
    
    return res.status(201).json({
      message: "Account created! We are sending a welcome email to your inbox shortly.",
      user: existingUser,
      token
    });
    
  } catch (err) {
    console.error("Register error:", err);
    return res.status(400).json({ error: "Invalid input data" });
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
