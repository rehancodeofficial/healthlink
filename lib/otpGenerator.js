// FILE: backend/lib/otpGenerator.js
const crypto = require("crypto");

/**
 * Generate a secure random 6-digit OTP
 * @returns {string} 6-digit OTP
 */
function generateOTP() {
  // Generate cryptographically secure random number
  const buffer = crypto.randomBytes(4);
  const num = buffer.readUInt32BE(0);

  // Ensure it's a 6-digit number (100000-999999)
  const otp = (num % 900000) + 100000;

  return otp.toString();
}

/**
 * Calculate OTP expiration time (5 minutes from now)
 * @returns {Date} Expiration timestamp
 */
function getOTPExpiration() {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 5);
  return expiresAt;
}

/**
 * Check if OTP has expired
 * @param {Date} expiresAt - The expiration timestamp
 * @returns {boolean} True if expired
 */
function isOTPExpired(expiresAt) {
  return new Date() > new Date(expiresAt);
}

module.exports = {
  generateOTP,
  getOTPExpiration,
  isOTPExpired,
};
