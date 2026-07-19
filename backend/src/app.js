const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const env = require("./config/env");
const routes = require("./routes");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = [
  "https://HealthLink-2.vercel.app",
  env.FRONTEND_URL,
  env.APP_BASE_URL,
  process.env.CORS_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (origin.endsWith(".vercel.app")) return callback(null, true);
      if (origin.endsWith(".up.railway.app")) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        allowedOrigins.some((o) => o && origin.startsWith(o))
      ) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));

// Root Route & Health Check
app.get("/", (_req, res) => {
  res.send("Backend is live on Railway");
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "UP",
    version: "1.0.6",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// Centralized API Routes
app.use("/api", routes);

// Global Error Middleware
app.use(errorMiddleware);

module.exports = app;
