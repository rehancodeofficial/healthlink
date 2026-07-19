const { createClient } = require("@supabase/supabase-js");
const env = require("./env");

const supabaseUrl = env.SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

module.exports = { supabaseAdmin, createClient };
