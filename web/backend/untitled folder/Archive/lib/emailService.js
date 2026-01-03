// FILE: backend/lib/emailService.js
const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');

// Initialize SendGrid if API key is available
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@curevirtual.com';
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'gmail'; // 'sendgrid' or 'gmail'

// Configure SendGrid
if (SENDGRID_API_KEY && EMAIL_PROVIDER === 'sendgrid') {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

// Configure Gmail/SMTP transporter
let transporter = null;
if (EMAIL_PROVIDER === 'gmail') {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
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
    subject: 'Email Verification - CureVirtual',
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
    console.error('❌ SendGrid error:', error.response?.body || error);
    throw new Error('Failed to send email via SendGrid');
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
    throw new Error('Gmail transporter not configured. Check EMAIL_USER and EMAIL_PASS in .env');
  }

  const mailOptions = {
    from: `"CureVirtual" <${FROM_EMAIL}>`,
    to: email,
    subject: 'Email Verification - CureVirtual',
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
    console.error('❌ Gmail error:', error);
    throw new Error('Failed to send email via Gmail');
  }
}

/**
 * Send OTP email using configured provider
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<void>}
 */
async function sendOTPEmail(email, otp) {
  if (EMAIL_PROVIDER === 'sendgrid') {
    return sendOTPViaSendGrid(email, otp);
  } else if (EMAIL_PROVIDER === 'gmail') {
    return sendOTPViaGmail(email, otp);
  } else {
    throw new Error(`Unsupported email provider: ${EMAIL_PROVIDER}`);
  }
}

module.exports = {
  sendOTPEmail,
};
