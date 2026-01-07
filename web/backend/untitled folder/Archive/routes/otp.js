// FILE: backend/routes/otp.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { generateOTP, getOTPExpiration, isOTPExpired } = require('../lib/otpGenerator');
const { sendOTPEmail } = require('../lib/emailService');

const router = express.Router();
const prisma = new PrismaClient();

// Rate limiting map (in-memory for simplicity, use Redis in production)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3;

/**
 * Check rate limit for an email
 * @param {string} email - Email to check
 * @returns {boolean} True if within rate limit
 */
function checkRateLimit(email) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(email) || [];
  
  // Remove expired requests
  const validRequests = userRequests.filter(
    timestamp => now - timestamp < RATE_LIMIT_WINDOW
  );
  
  if (validRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  validRequests.push(now);
  rateLimitMap.set(email, validRequests);
  return true;
}

/**
 * POST /api/otp/send
 * Send OTP to email
 */
router.post('/send', async (req, res) => {
  try {
    let { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    email = String(email).trim().toLowerCase();
    
    // Check rate limit
    if (!checkRateLimit(email)) {
      return res.status(429).json({ 
        error: 'Too many requests. Please wait before requesting another OTP.' 
      });
    }
    
    // Generate OTP
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
    
    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      return res.status(500).json({ 
        error: 'Failed to send verification email. Please check email configuration.' 
      });
    }
    
    console.log(`📧 OTP sent to ${email}`);
    
    return res.status(200).json({ 
      message: 'OTP sent successfully',
      expiresAt,
    });
    
  } catch (err) {
    console.error('Send OTP error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/otp/verify
 * Verify OTP for email
 */
router.post('/verify', async (req, res) => {
  try {
    let { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }
    
    email = String(email).trim().toLowerCase();
    otp = String(otp).trim();
    
    // Find the latest OTP for this email
    const otpRecord = await prisma.emailOTP.findFirst({
      where: {
        email,
        otp,
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
    
    console.log(`✅ OTP verified for ${email}`);
    
    return res.status(200).json({ 
      message: 'Email verified successfully',
      verified: true,
    });
    
  } catch (err) {
    console.error('Verify OTP error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/otp/resend
 * Resend OTP to email
 */
router.post('/resend', async (req, res) => {
  try {
    let { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    email = String(email).trim().toLowerCase();
    
    // Check rate limit
    if (!checkRateLimit(email)) {
      return res.status(429).json({ 
        error: 'Too many requests. Please wait before requesting another OTP.' 
      });
    }
    
    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiration();
    
    // Delete any existing unverified OTPs for this email
    await prisma.emailOTP.deleteMany({
      where: {
        email,
        verified: false,
      },
    });
    
    // Store new OTP in database
    await prisma.emailOTP.create({
      data: {
        email,
        otp,
        expiresAt,
        verified: false,
      },
    });
    
    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error('Failed to resend OTP email:', emailError);
      return res.status(500).json({ 
        error: 'Failed to send verification email. Please check email configuration.' 
      });
    }
    
    console.log(`📧 OTP resent to ${email}`);
    
    return res.status(200).json({ 
      message: 'OTP resent successfully',
      expiresAt,
    });
    
  } catch (err) {
    console.error('Resend OTP error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/otp/cleanup
 * Clean up expired OTPs (can be called by a cron job)
 */
router.delete('/cleanup', async (req, res) => {
  try {
    const result = await prisma.emailOTP.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    
    console.log(`🧹 Cleaned up ${result.count} expired OTPs`);
    
    return res.status(200).json({ 
      message: 'Cleanup completed',
      deletedCount: result.count,
    });
    
  } catch (err) {
    console.error('Cleanup error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
