// FILE: backend/server.js
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// ✅ Global Middlewares
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "https://cure-virtual-2.vercel.app",
  "https://curevirtual-2.vercel.app",
  "https://curevirtual.vercel.app",
  "https://cure-virtual-2-git-main-briamstechnologies.vercel.app",
  "https://curevirtual-2-production.up.railway.app",
  "https://curevirtual-2-production-ee33.up.railway.app",
  "https://curevirtual-2-production-6eaa.up.railway.app",
  process.env.FRONTEND_URL,
  process.env.APP_BASE_URL,
  process.env.RAILWAY_STATIC_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        allowedOrigins.some((o) => origin.startsWith(o))
      ) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked for origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));

// ✅ Root Route
app.get("/", (_req, res) => {
  res.send("Backend is live on Railway");
});

// ✅ Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "UP",
    version: "1.0.4",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ----------------------------
// ✅ AUTH / TWILIO
// ----------------------------
const authRoutes = require("./routes/auth");
// const twilioRoutes = require("./routes/twilio");
const twilioTokenRoute = require("./routes/twilioToken");
const otpRoutes = require("./routes/otp");

app.use("/api/auth", authRoutes);
// app.use("/api/twilio", twilioRoutes);
app.use("/api/token", twilioTokenRoute);
app.use("/api/otp", otpRoutes);

// ----------------------------
// ✅ SUPERADMIN ROUTES
// ----------------------------
const superadminRoutes = require("./routes/superadmin");
const settingsRoutes = require("./routes/settings");
const reportsRoutes = require("./routes/reports");
const logsRoutes = require("./routes/logs");
const activityLogsRoutes = require("./routes/activityLogs");

app.use("/api/superadmin", superadminRoutes);
app.use("/api/superadmin/settings", settingsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/superadmin/reports", reportsRoutes);
app.use("/api/superadmin/logs", logsRoutes);
app.use("/api/superadmin/activity-logs", activityLogsRoutes);

// ----------------------------
// ✅ ADMIN ROUTES
// ----------------------------
const adminRoutes = require("./routes/admins"); // manage admins (superadmin)
const adminUsersRoutes = require("./routes/adminUsers"); // manage users (patients/doctors)
const adminDashboardRoutes = require("./routes/adminRoutes"); // admin dashboard
//const adminAppointmentsRoutes = require("./routes/adminAppointments");
const adminMessagesRoutes = require("./routes/messages"); // admin messaging

app.use("/api/admins", adminRoutes); // ONLY for superadmin use
app.use("/api/admin", adminDashboardRoutes); // admin dashboard & user management
app.use("/api/admin/users", adminUsersRoutes);
//app.use("/api/admin/appointments", adminAppointmentsRoutes);
app.use("/api/admin/messages", adminMessagesRoutes);

// ----------------------------
// ✅ DOCTOR ROUTES
// ----------------------------
const doctorRoutes = require("./routes/doctor");
const doctorVideoRoutes = require("./routes/doctorVideo");
const doctorPatientsRoutes = require("./routes/doctorPatients");
const videocallRoutes = require("./routes/videocall");
const clinicalEncounterRoutes = require("./routes/clinicalEncounter");

app.use("/api", doctorPatientsRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/doctor/video", doctorVideoRoutes);
app.use("/api/videocall", videocallRoutes);
app.use("/api/clinical-encounter", clinicalEncounterRoutes);

// ----------------------------
// ✅ SCHEDULE ROUTES
// ----------------------------
const scheduleRoutes = require("./routes/scheduleRoutes");
app.use("/api/schedule", scheduleRoutes);

// ----------------------------
// ✅ PATIENT ROUTES
// ----------------------------
const patientRoutes = require("./routes/patientRoutes");
const patientDoctorsRoutes = require("./routes/patientDoctors");

// 👇 mount under /api
app.use("/api", patientDoctorsRoutes);
app.use("/api/patient", patientRoutes);

const notificationsRoutes = require("./routes/notifications");
app.use("/api/notifications", notificationsRoutes);

const chatbotRoutes = require("./routes/chatbot.routes");
const internalRoutes = require("./routes/internal");

app.use("/api/chatbot", chatbotRoutes);
app.use("/api/internal", internalRoutes);

// ----------------------------
// ✅ SUBSCRIPTION ROUTES
// ----------------------------
const subscriptionRoutes = require("./routes/subscription");
app.use("/api/subscription", subscriptionRoutes);

// ADMIN subscription views
const adminSubscriptionRoutes = require("./routes/adminSubscription");
app.use("/api/admin/subscription-management", adminSubscriptionRoutes);

// PHARMACY ROUTES
const pharmacyRoute = require("./routes/pharmacy");
app.use("/api/pharmacy", pharmacyRoute);

// SUPPORT ROUTES
const supportRoutes = require("./routes/support");
app.use("/api/support", supportRoutes);

// Stripe webhook must use raw body
app.post(
  "/api/subscription/stripe/webhook",
  express.raw({ type: "application/json" }),
  subscriptionRoutes.stripeWebhook,
);

// ✅ MESSAGES (Unified)
const messagesRoutes = require("./routes/messages");
app.use("/api/messages", messagesRoutes);

// ✅ USER PROFILE / LIST
const usersRoutes = require("./routes/user");
app.use("/api/users", usersRoutes);

// In App.js - add this before other routes for testing
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

app.get("/api/doctor/test", (req, res) => {
  res.json({ message: "Doctor routes are working!" });
});

// ✅ Global Error Handler (Must be last)
app.use((err, req, res, next) => {
  console.error("❌ Unhandled Error:", err);

  // Custom response for CORS or other well-known errors
  if (err.message === "Not allowed by CORS") {
    return res
      .status(403)
      .json({ success: false, message: "CORS policy violation" });
  }

  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message || "An unexpected error occurred",
  });
});

// ✅ Server start
const PORT = process.env.PORT || 5001;
const HOST = "0.0.0.0"; // Required for Railway compatibility

app.listen(PORT, HOST, () => {
  console.log("-------------------------------------------");
  console.log(`🚀 Server running on: http://${HOST}:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`⏱️  Started at: ${new Date().toISOString()}`);
  console.log("-------------------------------------------");
});
