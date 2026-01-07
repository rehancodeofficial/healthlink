// FILE: backend/server.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ✅ Global Middlewares
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      process.env.CORS_ORIGIN || 'http://localhost:5173',
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// ✅ Health Check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ----------------------------
// ✅ AUTH / TWILIO
// ----------------------------
const authRoutes = require('./routes/auth');
// const twilioRoutes = require("./routes/twilio");
const twilioTokenRoute = require('./routes/twilioToken');
const otpRoutes = require('./routes/otp');

app.use('/api/auth', authRoutes);
// app.use("/api/twilio", twilioRoutes);
app.use('/api/token', twilioTokenRoute);
app.use('/api/otp', otpRoutes);

// ----------------------------
// ✅ SUPERADMIN ROUTES
// ----------------------------
const superadminRoutes = require('./routes/superadmin');
const settingsRoutes = require('./routes/settings');
const reportsRoutes = require('./routes/reports');
const logsRoutes = require('./routes/logs');
const activityLogsRoutes = require('./routes/activityLogs');

app.use('/api/superadmin', superadminRoutes);
app.use('/api/superadmin/settings', settingsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/superadmin/reports', reportsRoutes);
app.use('/api/superadmin/logs', logsRoutes);
app.use('/api/superadmin/activity-logs', activityLogsRoutes);

// ----------------------------
// ✅ ADMIN ROUTES
// ----------------------------
const adminRoutes = require('./routes/admins'); // manage admins (superadmin)
const adminUsersRoutes = require('./routes/adminUsers'); // manage users (patients/doctors)
const adminDashboardRoutes = require('./routes/adminRoutes'); // admin dashboard
//const adminAppointmentsRoutes = require("./routes/adminAppointments");
const adminMessagesRoutes = require('./routes/messages'); // admin messaging

app.use('/api/admins', adminRoutes); // ONLY for superadmin use
app.use('/api/admin', adminDashboardRoutes); // admin dashboard & user management
app.use('/api/admin/users', adminUsersRoutes);
//app.use("/api/admin/appointments", adminAppointmentsRoutes);
app.use('/api/admin/messages', adminMessagesRoutes);

// ----------------------------
// ✅ DOCTOR ROUTES
// ----------------------------
const doctorRoutes = require('./routes/doctor');
const doctorVideoRoutes = require('./routes/doctorVideo');
const doctorPatientsRoutes = require('./routes/doctorPatients');
const videocallRoutes = require('./routes/videocall');

app.use('/api', doctorPatientsRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/doctor/video', doctorVideoRoutes);
app.use('/api/videocall', videocallRoutes);

// ----------------------------
// ✅ SCHEDULE ROUTES
// ----------------------------
const scheduleRoutes = require('./routes/scheduleRoutes');
app.use('/api/schedule', scheduleRoutes);

// ----------------------------
// ✅ PATIENT ROUTES
// ----------------------------
const patientRoutes = require('./routes/patientRoutes');
const patientDoctorsRoutes = require('./routes/patientDoctors');

// 👇 mount under /api
app.use('/api', patientDoctorsRoutes);
app.use('/api/patient', patientRoutes);

const notificationsRoutes = require('./routes/notifications');
app.use('/api/notifications', notificationsRoutes);

// ----------------------------
// ✅ SUBSCRIPTION ROUTES
// ----------------------------
const subscriptionRoutes = require('./routes/subscription');

// Mount at /api for routes that already include "/subscription" prefix or for generic compatibility
app.use('/api', subscriptionRoutes);

// Mount at /api/subscribers for Admin lists & stats (routes defined as /stats, /list in the router)
app.use('/api/subscribers', subscriptionRoutes);

// PHARMACY ROUTES
const pharmacyRoute = require('./routes/pharmacy');
app.use('/api/pharmacy', pharmacyRoute);

// FILE: SUBSCRIPTION
const adminSubscriptionRoutes = require('./routes/adminSubscription');
// ...
app.use('/api/admin', adminSubscriptionRoutes);

// SUPPORT ROUTES
const supportRoutes = require('./routes/support');
app.use('/api/support', supportRoutes);

// Stripe webhook must use raw body
app.post(
  '/api/subscription/stripe/webhook',
  express.raw({ type: 'application/json' }),
  subscriptionRoutes.stripeWebhook
);
// ----------------------------
// ✅ GLOBAL MESSAGES (optional)
// ----------------------------
const globalMessagesRoutes = require('./routes/messages');
app.use('/api/messages', globalMessagesRoutes);

// ----------------------------
// ✅ USER PROFILE / LIST
// ----------------------------
const usersRoutes = require('./routes/user');
app.use('/api/users', usersRoutes);

// In App.js - add this before other routes for testing
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

app.get('/api/doctor/test', (req, res) => {
  res.json({ message: 'Doctor routes are working!' });
});

// ✅ Server start
const PORT = process.env.PORT || 5001;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
