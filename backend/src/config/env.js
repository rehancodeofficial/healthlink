const dotenv = require("dotenv");
dotenv.config();

const env = {
  PORT: process.env.PORT || 5001,
  NODE_ENV: process.env.NODE_ENV || "development",
  APP_BASE_URL: process.env.APP_BASE_URL || "http://localhost:5001",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || "default_jwt_secret_key",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  EMAIL_USER: process.env.EMAIL_USER || process.env.GMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS || process.env.GMAIL_PASS,
  ZEGO_APP_ID: process.env.ZEGO_APP_ID,
  ZEGO_SERVER_SECRET: process.env.ZEGO_SERVER_SECRET,
};

module.exports = env;
