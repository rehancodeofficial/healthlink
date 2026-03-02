// FILE: backend/middleware/validateSupabaseAuth.js
const { supabaseAdmin } = require("../lib/supabaseAdmin");

/**
 * Middleware to validate Supabase JWT tokens
 * Attaches the authenticated Supabase user to req.supabaseUser
 */
async function validateSupabaseAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing authorization header" });
    }

    const token = authHeader.split(" ")[1];

    // Verify JWT with Supabase
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Check if email is verified
    if (!user.email_confirmed_at) {
      return res.status(403).json({
        error:
          "Email not verified. Please verify your email before accessing this resource.",
      });
    }

    // Attach user to request
    req.supabaseUser = user;
    next();
  } catch (err) {
    console.error("Auth validation error:", err);
    return res.status(500).json({ error: "Authentication failed" });
  }
}

module.exports = { validateSupabaseAuth };
