// FILE: backend/routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma/prismaClient");
const { ensureDefaultProfile } = require("../lib/provisionProfile");
const { supabaseAdmin } = require("../lib/supabaseAdmin");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

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
    const { email, supabaseId, supabaseAccessToken } = req.body || {};

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

    // Find User in our DB
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
    const user = await prisma.user.findUnique({
      where: { email: normedEmail },
    });

    if (!user) {
      return res
        .status(404)
        .json({ error: "No account found with this email" });
    }

    // Send OTP via Supabase
    const { error } = await supabaseAdmin.auth.signInWithOtp({
      email: normedEmail,
      options: {
        shouldCreateUser: false, // Don't create new users via OTP login
      },
    });

    if (error) {
      console.error("Supabase OTP error:", error);
      return res
        .status(500)
        .json({ error: "Failed to send OTP. Please try again." });
    }

    return res.json({ message: "OTP sent to your email" });
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

    // Verify OTP with Supabase
    const { data, error } = await supabaseAdmin.auth.verifyOtp({
      email: normedEmail,
      token: otp,
      type: "email",
    });

    if (error || !data.user) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
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

module.exports = router;
