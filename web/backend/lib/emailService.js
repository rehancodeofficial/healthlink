// FILE: backend/lib/emailService.js
const sgMail = require("@sendgrid/mail");
const nodemailer = require("nodemailer");

// Initialize SendGrid if API key is available
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@curevirtual.com";
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || "gmail"; // 'sendgrid' or 'gmail'

// Configure SendGrid
if (SENDGRID_API_KEY && EMAIL_PROVIDER === "sendgrid") {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

// Resolve email credentials — check both naming conventions
const RESOLVED_EMAIL_USER = process.env.EMAIL_USER || process.env.GMAIL_USER;
const RESOLVED_EMAIL_PASS = process.env.EMAIL_PASS || process.env.GMAIL_PASS;

console.log("[EMAIL-SERVICE] Config:", {
  provider: EMAIL_PROVIDER,
  emailUser: RESOLVED_EMAIL_USER ? `✅ ${RESOLVED_EMAIL_USER}` : "❌ MISSING (set EMAIL_USER or GMAIL_USER)",
  emailPass: RESOLVED_EMAIL_PASS ? "✅ SET" : "❌ MISSING (set EMAIL_PASS or GMAIL_PASS)",
  fromEmail: FROM_EMAIL,
});

// Configure SendGrid
if (SENDGRID_API_KEY && EMAIL_PROVIDER === "sendgrid") {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

// Configure Gmail/SMTP transporter with explicit robust settings
let transporter = null;
if (EMAIL_PROVIDER === "gmail") {
  const host = process.env.EMAIL_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.EMAIL_PORT || "587");
  const secure = process.env.EMAIL_SECURE === "true"; // False for 587

  if (!RESOLVED_EMAIL_USER || !RESOLVED_EMAIL_PASS) {
    console.error(
      "[EMAIL-SERVICE] ❌ Gmail transporter NOT created — EMAIL_USER/GMAIL_USER or EMAIL_PASS/GMAIL_PASS is missing in Railway env vars!"
    );
  } else {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: RESOLVED_EMAIL_USER,
        pass: RESOLVED_EMAIL_PASS,
      },
      // Enhanced settings for Gmail compatibility and timeout resilience
      tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false,
      },
      pool: true, // Use connection pooling
      maxConnections: 5,
      maxMessages: 100,
      connectionTimeout: 20000, // 20s
      greetingTimeout: 20000,
      socketTimeout: 30000, // 30s
    });
    console.log(
      `📧 Gmail SMTP Transporter initialized (Port: ${port}, Secure: ${secure}). Host: ${host}, User: ${RESOLVED_EMAIL_USER}`
    );
  }
}

/**
 * Send OTP email via SendGrid
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<void>}
 */
async function sendOTPViaSendGrid(email, otp) {
  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject: "Email Verification - CureVirtual",
    text: `Your verification code is: ${otp}\n\nThis code will expire in 5 minutes.\n\nIf you didn't request this code, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4F46E5;">Email Verification</h2>
        <p>Thank you for registering with CureVirtual!</p>
        <p>Your verification code is:</p>
        <div style="background-color: #F3F4F6; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <h1 style="color: #4F46E5; letter-spacing: 5px; margin: 0;">${otp}</h1>
        </div>
        <p style="color: #6B7280; font-size: 14px;">This code will expire in 5 minutes.</p>
        <p style="color: #6B7280; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
        <p style="color: #9CA3AF; font-size: 12px; text-align: center;">CureVirtual - Your Health, Our Priority</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ OTP email sent to ${email} via SendGrid`);
  } catch (error) {
    console.error("❌ SendGrid error:", error.response?.body || error);
    throw new Error("Failed to send email via SendGrid");
  }
}

/**
 * Send OTP email via Gmail/SMTP
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<void>}
 */
async function sendOTPViaGmail(email, otp) {
  if (!transporter) {
    throw new Error(
      "Gmail transporter not configured. Check EMAIL_USER and EMAIL_PASS in .env",
    );
  }

  const mailOptions = {
    from: `"CureVirtual" <${FROM_EMAIL}>`,
    to: email,
    subject: "Email Verification - CureVirtual",
    text: `Your verification code is: ${otp}\n\nThis code will expire in 5 minutes.\n\nIf you didn't request this code, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4F46E5;">Email Verification</h2>
        <p>Thank you for registering with CureVirtual!</p>
        <p>Your verification code is:</p>
        <div style="background-color: #F3F4F6; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <h1 style="color: #4F46E5; letter-spacing: 5px; margin: 0;">${otp}</h1>
        </div>
        <p style="color: #6B7280; font-size: 14px;">This code will expire in 5 minutes.</p>
        <p style="color: #6B7280; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
        <p style="color: #9CA3AF; font-size: 12px; text-align: center;">CureVirtual - Your Health, Our Priority</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email} via Gmail`);
  } catch (error) {
    console.error("❌ Gmail error details:", JSON.stringify(error, null, 2));
    throw new Error(`Failed to send email via Gmail: ${error.message}`);
  }
}

/**
 * Perform pre-send SMTP health check.
 * @returns {Promise<boolean>} True if SMTP is healthy
 */
async function verifySMTPConnection() {
  if (EMAIL_PROVIDER !== "gmail" || !transporter) {
    console.error("❌ SMTP Health Check Failed: Gmail provider not configured.");
    return false;
  }
  try {
    await transporter.verify();
    console.log("✅ SMTP Health Check Passed: Gmail SMTP is ready.");
    return true;
  } catch (error) {
    console.error("❌ SMTP Health Check Failed:", error.message);
    return false;
  }
}

/**
 * Generic send function with retry logic.
 * @param {Object} mailOptions - Nodemailer mail options
 * @param {number} maxRetries - Maximum number of retries
 * @returns {Promise<void>}
 */
async function sendWithRetry(mailOptions, maxRetries = 3) {
  let attempts = 0;
  const delay = 5000; // 5 seconds between retries

  while (attempts < maxRetries) {
    attempts++;
    const timestamp = new Date().toISOString();
    try {
      console.log(`[${timestamp}] 📧 SMTP Attempt ${attempts}/${maxRetries} for: ${mailOptions.to}`);
      
      if (!transporter) throw new Error("SMTP Transporter not initialized.");
      
      const info = await transporter.sendMail(mailOptions);
      console.log(`[${timestamp}] ✅ Email Sent Successfully: ${info.messageId}`);
      return; 
    } catch (error) {
      console.error(`[${timestamp}] ❌ SMTP Attempt ${attempts} Failed:`, error.message);
      
      if (attempts >= maxRetries) {
        console.error(`[${timestamp}] 🚨 ALERT: Email failed after ${maxRetries} attempts for: ${mailOptions.to}`);
        throw new Error(`Email delivery ultimately failed after ${maxRetries} attempts.`);
      }
      
      console.log(`[${timestamp}] ⏳ Waiting ${delay/1000}s before next retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Send Welcome/Registration email to new users (with retry).
 * @param {string} email - Recipient email
 * @param {string} firstName - Recipient first name
 * @returns {Promise<void>}
 */
async function sendRegistrationEmail(email, firstName) {
  const mailOptions = {
    from: `"CureVirtual" <${FROM_EMAIL}>`,
    to: email,
    subject: "Welcome to CureVirtual!",
    text: `Hi ${firstName || "there"},\n\nWelcome to CureVirtual! Your account has been successfully created. You can now log in to access our healthcare services.\n\nBest Regards,\nThe CureVirtual Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4F46E5;">Welcome to CureVirtual!</h2>
        <p>Hi ${firstName || "there"},</p>
        <p>Thank you for joining CureVirtual! Your healthcare journey starts here.</p>
        <p>Your account has been successfully created and confirmed. You can now log in to your dashboard.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.APP_BASE_URL || process.env.FRONTEND_URL || 'https://curevirtual-2.vercel.app'}/login" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Log In Now</a>
        </div>

        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
        <p style="color: #9CA3AF; font-size: 12px; text-align: center;">CureVirtual - Your Health, Our Priority</p>
      </div>
    `,
  };

  return sendWithRetry(mailOptions);
}

/**
 * Send OTP email using configured provider (with retry for Gmail).
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<void>}
 */
async function sendOTPEmail(email, otp) {
  console.log(`📧 Dispatching OTP email to ${email}...`);
  
  const mailOptions = {
    from: `"CureVirtual" <${RESOLVED_EMAIL_USER || FROM_EMAIL}>`,
    to: email,
    subject: "Email Verification - CureVirtual",
    text: `Your verification code is: ${otp}\n\nThis code will expire in 5 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4F46E5;">Email Verification</h2>
        <p>Your verification code is:</p>
        <div style="background-color: #F3F4F6; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <h1 style="color: #4F46E5; letter-spacing: 5px; margin: 0;">${otp}</h1>
        </div>
        <p style="color: #6B7280; font-size: 14px;">This code will expire in 5 minutes.</p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
        <p style="color: #9CA3AF; font-size: 12px; text-align: center;">CureVirtual - Your Health, Our Priority</p>
      </div>
    `,
  };

  if (EMAIL_PROVIDER === "sendgrid") {
    return sendOTPViaSendGrid(email, otp);
  } else {
    return sendWithRetry(mailOptions);
  }
}

module.exports = {
  sendOTPEmail,
  sendRegistrationEmail,
  verifySMTPConnection,
};
