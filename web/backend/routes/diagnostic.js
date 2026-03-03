const express = require("express");
const router = express.Router();
const { sendOTPEmail } = require("../lib/emailService");
const prisma = require("../prisma/prismaClient");

// 1. Check Configuration (Safe subset)
router.get("/config", (req, res) => {
  const safeConfig = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_SECURE: process.env.EMAIL_SECURE,
    // Mask sensitive data
    EMAIL_USER: process.env.EMAIL_USER ? "***SET***" : "MISSING",
    EMAIL_PASS: process.env.EMAIL_PASS ? "***SET***" : "MISSING",
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ? "***SET***" : "MISSING",
    DATABASE_URL: process.env.DATABASE_URL ? "***SET***" : "MISSING",
  };
  res.json(safeConfig);
});

// 2. Test Email Sending (GET for easy browser testing)
// Usage: /api/diagnostics/test-email?to=your@email.com
router.get("/test-email", async (req, res) => {
  const email = req.query.to;
  if (!email) {
    return res.status(400).json({ error: 'Missing "to" query parameter' });
  }

  try {
    console.log(`🧪 Diagnostics: Sending test email to ${email}...`);
    await sendOTPEmail(email, "123456"); // Send a dummy OTP
    res.json({ success: true, message: `Test email sent to ${email}` });
  } catch (error) {
    console.error("❌ Diagnostics: Email failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      details: error,
    });
  }
});

// 3. Full Health Check (DB + Latency)
router.get("/health-full", async (req, res) => {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const duration = Date.now() - start;
    res.json({
      status: "UP",
      database: "Connected",
      latencyMs: duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "DOWN",
      database: "Disconnected",
      error: error.message,
    });
  }
});

module.exports = router;
