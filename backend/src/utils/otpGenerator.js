/**
 * Generate a 6-digit numeric OTP code
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Get OTP expiration date (default: 10 minutes)
 */
function getOTPExpiration(minutes = 10) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

/**
 * Check if an OTP timestamp has expired
 */
function isOTPExpired(expiresAt) {
  if (!expiresAt) return true;
  return new Date() > new Date(expiresAt);
}

module.exports = {
  generateOTP,
  getOTPExpiration,
  isOTPExpired,
};
