// FILE: backend/routes/patientRoutes.js
const express = require("express");
const prisma = require('../prisma/prismaClient');
const axios = require("axios");
const Stripe = require("stripe");
const emailService = require('../services/emailService');
const { verifyToken, requireRole, verifyOwnerOrAdmin } = require("../middleware/rbac.js");
const { ensureDefaultProfile } = require("../lib/provisionProfile.js");

const router = express.Router();

// Apply RBAC to all patient routes
router.use(verifyToken);
router.use(requireRole(["PATIENT", "DOCTOR", "SUPERADMIN", "ADMIN"])); // Docs can access patient data


// ---- Stripe init (safe if not configured) ----
const stripeSecret = process.env.STRIPE_SECRET || process.env.STRIPE_SECRET_KEY || null;
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

// ---- Helpers ----
function toIntMinorUnits(amount) {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (!Number.isFinite(n)) throw new Error("Invalid amount");
  return Math.round(n * 100);
}

async function getPatientProfileIdByUserId(userId) {
  if (!userId) return null;
  const row = await prisma.patientProfile.findUnique({
    where: { userId: String(userId) },
    select: { id: true },
  });
  return row?.id || null;
}

/**
 * GET /api/patient/profile  (Current User)
 */
// GET /api/patient/profile  (Current User)
router.get("/profile", async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    if (!userId) return res.status(400).json({ error: "User identity missing" });

    const user = await prisma.user.findUnique({ where: { id: String(userId) } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    let patient = await prisma.patientProfile.findUnique({
      where: { userId: String(userId) },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, dateOfBirth: true, gender: true } },
        appointments: true,
        prescriptions: true,
        consultations: true,
      },
    });

    // Auto-create if missing (Robustness fix)
    if (!patient && user.role === "PATIENT") {
      patient = await ensureDefaultProfile(user);
      // Re-fetch with includes
      patient = await prisma.patientProfile.findUnique({
        where: { userId: String(userId) },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, dateOfBirth: true, gender: true } },
          appointments: true,
          prescriptions: true,
          consultations: true,
        },
      });
    }

    if (!patient) return res.status(404).json({ success: false, message: "Profile not found" });

    return res.json({ success: true, data: patient });
  } catch (err) {
    console.error("GET /api/patient/profile error:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch profile" });
  }
});

/**
 * PUT /api/patient/profile (Update Profile)
 */
router.put("/profile", async (req, res) => {
  try {
    const {
      userId,
      firstName,
      middleName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      bloodGroup,
      height,
      heightUnit,
      weight,
      weightUnit,
      allergies,
      medications,
      medicalHistory,
      address,
      emergencyContact,
      emergencyContactName,
      emergencyContactEmail,
      medicalRecordNumber,
      insuranceProvider,
      insuranceMemberId,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Update User Core Info
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(middleName && { middleName }),
        ...(lastName && { lastName }),
        ...(phone && { phone }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(gender && { gender }),
      },
    });

    // Upsert Patient Profile
    const updated = await prisma.patientProfile.upsert({
      where: { userId },
      update: {
        bloodGroup: bloodGroup || "UNKNOWN",
        height: height ?? null,
        heightUnit: heightUnit || "cm",
        weight: weight ?? null,
        weightUnit: weightUnit || "kg",
        allergies: allergies || "",
        medications: medications || "",
        medicalHistory: medicalHistory || "",
        address: address || "",
        emergencyContact: emergencyContact || "",
        emergencyContactName: emergencyContactName || "",
        emergencyContactEmail: emergencyContactEmail || "",
        medicalRecordNumber: medicalRecordNumber || null,
        insuranceProvider: insuranceProvider || null,
        insuranceMemberId: insuranceMemberId || null,
      },
      create: {
        userId,
        bloodGroup: bloodGroup || "UNKNOWN",
        height: height ?? null,
        heightUnit: heightUnit || "cm",
        weight: weight ?? null,
        weightUnit: weightUnit || "kg",
        allergies: allergies || "",
        medications: medications || "",
        medicalHistory: medicalHistory || "",
        address: address || "",
        emergencyContact: emergencyContact || "",
        emergencyContactName: emergencyContactName || "",
        emergencyContactEmail: emergencyContactEmail || "",
        medicalRecordNumber: medicalRecordNumber || null,
        insuranceProvider: insuranceProvider || null,
        insuranceMemberId: insuranceMemberId || null,
      },
    });

    // Send Notification Email
    const userForEmail = await prisma.user.findUnique({ where: { id: userId } });
    if (userForEmail) {
        emailService.sendProfileUpdateConfirmation(userForEmail, "Patient")
            .catch(err => console.error("Failed to send profile update email:", err));
    }

    return res.json({ success: true, message: "Profile updated successfully", data: updated });
  } catch (err) {
    console.error("PUT /api/patient/profile error:", err);
    return res.status(500).json({ success: false, error: "Failed to update profile", details: err.message });
  }
});

/* ==================================================
   1) PATIENT DASHBOARD STATS
   ================================================== */
/**
 * GET /api/patient/stats
 * Strictly scoped to logged-in user (req.user?.id) or ?patientId=<User.id> for dev.
 */
router.get("/stats", async (req, res) => {
  try {
    const patientUserId = req.user?.id || req.query.patientId;
    if (!patientUserId) {
      return res.status(400).json({ success: false, error: "Missing patient identity" });
    }

    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: patientUserId },
      select: { id: true },
    });

    if (!patientProfile) {
      return res.json({
        success: true,
        data: {
          totalAppointments: 0,
          completedAppointments: 0,
          pendingAppointments: 0,
          totalPrescriptions: 0,
          totalConsultations: 0,
          totalDoctors: 0,
        },
      });
    }

    const pid = patientProfile.id;

    const [totalAppointments, completedAppointments, pendingAppointments] = await Promise.all([
      prisma.appointment.count({ where: { patientId: pid } }),
      prisma.appointment.count({ where: { patientId: pid, status: "COMPLETED" } }),
      prisma.appointment.count({ where: { patientId: pid, status: "PENDING" } }),
    ]);

    const totalPrescriptions = await prisma.prescription.count({ where: { patientId: pid } });
    const totalConsultations = await prisma.videoConsultation.count({ where: { patientId: pid } });

    const [apptDocs, consultDocs, rxDocs] = await Promise.all([
      prisma.appointment.findMany({ where: { patientId: pid }, distinct: ["doctorId"], select: { doctorId: true } }),
      prisma.videoConsultation.findMany({ where: { patientId: pid }, distinct: ["doctorId"], select: { doctorId: true } }),
      prisma.prescription.findMany({ where: { patientId: pid }, distinct: ["doctorId"], select: { doctorId: true } }),
    ]);

    const doctorSet = new Set([
      ...apptDocs.map((d) => d.doctorId),
      ...consultDocs.map((d) => d.doctorId),
      ...rxDocs.map((d) => d.doctorId),
    ]);

    return res.json({
      success: true,
      data: {
        totalAppointments,
        completedAppointments,
        pendingAppointments,
        totalPrescriptions,
        totalConsultations,
        totalDoctors: doctorSet.size,
      },
    });
  } catch (err) {
    console.error("❌ /api/patient/stats error:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch patient stats" });
  }
});

/* ==================================================
   2) PATIENT DIRECTORY (ADMIN/UTILITY)
   ================================================== */
/**
 * GET /api/patient/all?page=&limit=
 */
router.get("/all", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit || "10", 10), 1);
    const skip = (page - 1) * limit;

    const [total, rows] = await Promise.all([
      prisma.patientProfile.count(),
      prisma.patientProfile.findMany({
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          _count: { select: { appointments: true, prescriptions: true, consultations: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    const data = rows.map((p) => ({
      id: p.id,
      userId: p.user?.id || null,
      name: p.user?.name || null,
      email: p.user?.email || null,
      counts: {
        appointments: p._count.appointments,
        prescriptions: p._count.prescriptions,
        consultations: p._count.consultations,
      },
      createdAt: p.createdAt,
    }));

    res.json({
      success: true,
      message: "Patients fetched successfully",
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching patients (paginated):", error);
    res.status(500).json({ success: false, message: "Failed to fetch patients", error: error.message });
  }
});

/* ==================================================
   3) APPOINTMENTS (USED BY MyAppointments.jsx)
   ================================================== */
/**
 * GET /api/patient/appointments?patientId=<User.id>
 */
router.get("/appointments", async (req, res) => {
  try {
    const userId = req.user?.id || req.query.patientId;
    if (!userId) return res.status(400).json({ error: "Missing patient identity" });

    const pid = await getPatientProfileIdByUserId(userId);
    if (!pid) return res.json([]);

    const items = await prisma.appointment.findMany({
      where: { patientId: pid },
      include: { doctor: { include: { user: { select: { firstName: true, lastName: true, email: true } } } } },
      orderBy: { appointmentDate: "desc" },
    });

    return res.json(items);
  } catch (err) {
    console.error("❌ GET /patient/appointments error:", err);
    return res.status(500).json({ error: "Failed to load appointments" });
  }
});

/**
 * POST /api/patient/appointments
 * Body: { doctorId: DoctorProfile.id, appointmentDate: ISOString, reason?, patientId? }
 */
router.post("/appointments", async (req, res) => {
  try {
    const { doctorId, appointmentDate, reason, patientId } = req.body;
    const userId = req.user?.id || patientId;

    if (!userId) return res.status(400).json({ error: "Missing patient identity" });
    if (!doctorId || !appointmentDate) return res.status(400).json({ error: "Missing required fields" });

    const pid = await getPatientProfileIdByUserId(userId);
    if (!pid) return res.status(404).json({ error: "Patient profile not found" });

    const doctor = await prisma.doctorProfile.findUnique({ where: { id: String(doctorId) }, select: { id: true } });
    if (!doctor) return res.status(404).json({ error: "Doctor profile not found" });

    // ✅ VALIDATE AGAINST DOCTOR'S SCHEDULE
    const apptDate = new Date(appointmentDate);
    const dayOfWeek = apptDate.getDay();
    const apptTime = `${String(apptDate.getHours()).padStart(2, "0")}:${String(apptDate.getMinutes()).padStart(2, "0")}`;

    // Check if doctor has any schedule for this day
    const schedules = await prisma.doctorSchedule.findMany({
      where: {
        doctorId: doctor.id,
        dayOfWeek,
        isActive: true,
        OR: [
          { effectiveFrom: null, effectiveTo: null },
          {
            AND: [
              { effectiveFrom: { lte: apptDate } },
              { effectiveTo: { gte: apptDate } },
            ],
          },
          {
            AND: [
              { effectiveFrom: { lte: apptDate } },
              { effectiveTo: null },
            ],
          },
        ],
      },
    });

    if (schedules.length === 0) {
      return res.status(400).json({ 
        error: "Doctor is not available on this day. Please check the doctor's schedule." 
      });
    }

    // Check if appointment time falls within any schedule slot
    const toMinutes = (time) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    const apptMinutes = toMinutes(apptTime);
    let isWithinSchedule = false;

    for (const schedule of schedules) {
      const startMinutes = toMinutes(schedule.startTime);
      const endMinutes = toMinutes(schedule.endTime);
      
      if (apptMinutes >= startMinutes && apptMinutes < endMinutes) {
        isWithinSchedule = true;
        break;
      }
    }

    if (!isWithinSchedule) {
      return res.status(400).json({ 
        error: `Doctor is not available at ${apptTime}. Please select a time within the doctor's schedule.` 
      });
    }

    // Check if slot is already booked
    const existingAppt = await prisma.appointment.findFirst({
      where: {
        doctorId: doctor.id,
        appointmentDate: apptDate,
        status: { in: ["PENDING", "APPROVED"] },
      },
    });

    if (existingAppt) {
      return res.status(409).json({ 
        error: "This time slot is already booked. Please select another time." 
      });
    }

    const created = await prisma.appointment.create({
      data: {
        doctorId: doctor.id,
        patientId: pid,
        appointmentDate: apptDate,
        reason: reason || null,
        status: "PENDING",
      },
      include: { doctor: { include: { user: { select: { firstName: true, lastName: true, email: true } } } } },
    });

    // Send confirmation emails
    const patientUser = await prisma.user.findUnique({ 
        where: { id: userId },
        select: { firstName: true, lastName: true, email: true }
    });
    
    if (patientUser && created.doctor?.user) {
        // Run in background, don't await response to avoid blocking
        emailService.sendAppointmentBookingConfirmation(created, patientUser, created.doctor.user)
            .catch(err => console.error("Failed to send appointment emails:", err));
    }

    return res.status(201).json(created);
  } catch (err) {
    console.error("❌ POST /patient/appointments error:", err);
    return res.status(500).json({ error: "Failed to book appointment" });
  }
});


/**
 * PATCH /api/patient/appointments/:id/cancel
 */
router.patch("/appointments/:id/cancel", async (req, res) => {
  try {
    const apptId = String(req.params.id);
    const userId = req.user?.id || req.query.patientId || req.body.patientId || null;

    console.log("🔍 Cancel request - apptId:", apptId, "userId:", userId);

    const appt = await prisma.appointment.findUnique({
      where: { id: apptId },
      select: { id: true, status: true, patientId: true },
    });
    
    console.log("🔍 Found appointment:", appt);
    
    if (!appt) return res.status(404).json({ error: "Appointment not found" });

    if (userId) {
      const pid = await getPatientProfileIdByUserId(userId);
      console.log("🔍 Patient profile ID:", pid, "Appointment patientId:", appt.patientId);
      if (!pid || appt.patientId !== pid) return res.status(403).json({ error: "Not allowed to cancel this appointment" });
    }

    if (["CANCELLED", "COMPLETED"].includes(appt.status)) {
      return res.status(409).json({ error: "Appointment cannot be cancelled" });
    }

    const updated = await prisma.appointment.update({
      where: { id: apptId },
      data: { status: "CANCELLED" },
    });

    console.log("✅ Appointment cancelled successfully:", updated.id);
    return res.json(updated);
  } catch (err) {
    console.error("❌ PATCH /patient/appointments/:id/cancel error:", err);
    console.error("❌ Error stack:", err.stack);
    return res.status(500).json({ error: "Failed to cancel appointment", details: err.message });
  }
});

/* ==================================================
   4) PRESCRIPTIONS — LIST for Patient
   ================================================== */
/**
 * GET /api/patient/prescriptions?patientId=<User.id>
 */
router.get("/prescriptions", async (req, res) => {
  try {
    const userId = req.user?.id || req.query.patientId;
    if (!userId) return res.status(400).json({ error: "patientId is required" });

    const pid = await getPatientProfileIdByUserId(userId);
    if (!pid) return res.json([]);

    const prescriptions = await prisma.prescription.findMany({
      where: { patientId: pid },
      include: { doctor: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } } },
      orderBy: { createdAt: "desc" },
    });

    return res.json(prescriptions);
  } catch (err) {
    console.error("❌ GET /api/patient/prescriptions error:", err);
    return res.status(500).json({ error: "Failed to fetch prescriptions" });
  }
});

/* ==================================================
   5) VIDEO CONSULTATIONS — LIST for Patient
   ================================================== */
/**
 * GET /api/patient/video-calls?patientId=<User.id>
 * NOTE: Prisma schema uses PatientProfile.id in VideoConsultation.patientId.
 */
router.get("/video-calls", async (req, res) => {
  try {
    const userId = req.user?.id || req.query.patientId;
    if (!userId) return res.status(400).json({ error: "patientId is required" });

    const pid = await getPatientProfileIdByUserId(userId);
    if (!pid) return res.json([]);

    const calls = await prisma.videoConsultation.findMany({
      where: { patientId: pid },
      include: { doctor: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } } },
      orderBy: { scheduledAt: "desc" },
    });

    return res.json(calls);
  } catch (err) {
    console.error("❌ GET /api/patient/video-calls error:", err);
    return res.status(500).json({ error: "Failed to fetch video calls" });
  }
});

/* ==================================================
   6) SUBSCRIPTION — STATUS / CHECKOUT / VERIFY / CANCEL
   ================================================== */
/**
 * GET /api/patient/subscription?patientId=<User.id>
 */
router.get("/subscription", async (req, res) => {
  try {
    const uid = req.user?.id || req.query.patientId;
    if (!uid) return res.status(400).json({ error: "patientId is required" });

    const user = await prisma.user.findUnique({
      where: { id: String(uid) },
      select: { id: true, firstName: true, lastName: true, email: true, subscription: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const lastPayment = await prisma.subscriptionPayment.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, data: { user, lastPayment } });
  } catch (err) {
    console.error("❌ GET /api/patient/subscription error:", err);
    return res.status(500).json({ error: "Failed to load subscription" });
  }
});

/**
 * POST /api/patient/subscription/checkout/paystack
 * Body: { patientId: User.id, amount: major units, currency?: 'NGN', plan?: string }
 */
router.post("/subscription/checkout/paystack", async (req, res) => {
  try {
    const { patientId, amount, currency = "NGN", plan } = req.body;
    if (!patientId || !amount) return res.status(400).json({ error: "patientId and amount are required" });

    const user = await prisma.user.findUnique({
      where: { id: String(patientId) },
      select: { id: true, email: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    if (!PAYSTACK_SECRET_KEY) return res.status(500).json({ error: "PAYSTACK_SECRET_KEY not configured" });

    const reference = `cv_sub_${user.id}_${Date.now()}`;
    const callback_url =
      process.env.PAYSTACK_CALLBACK_URL ||
      `${process.env.APP_BASE_URL || "https://curevirtual.vercel.app"}/subscription`;

    // Pending payment record
    const pending = await prisma.subscriptionPayment.create({
      data: {
        userId: user.id,
        provider: "PAYSTACK",
        reference,
        amount: toIntMinorUnits(amount),
        currency,
        plan: plan || null,
        status: "PENDING",
      },
    });

    const initResp = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: user.email,
        amount: pending.amount,
        reference,
        callback_url,
        metadata: { userId: user.id, plan: plan || "SUBSCRIPTION", origin: "curevirtual" },
      },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" } }
    );

    const data = initResp?.data?.data;
    if (!data?.authorization_url) {
      return res.status(500).json({ error: "Failed to initialize Paystack payment" });
    }

    return res.json({ authorization_url: data.authorization_url, reference });
  } catch (err) {
    console.error("❌ POST /subscription/checkout/paystack error:", err?.response?.data || err);
    return res.status(500).json({ error: "Failed to initialize Paystack payment" });
  }
});

/**
 * GET /api/patient/subscription/verify/paystack?reference=...
 */
router.get("/subscription/verify/paystack", async (req, res) => {
  try {
    const { reference } = req.query;
    if (!reference) return res.status(400).json({ error: "reference is required" });

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    if (!PAYSTACK_SECRET_KEY) return res.status(500).json({ error: "PAYSTACK_SECRET_KEY not configured" });

    const verifyResp = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    });

    const v = verifyResp?.data?.data;
    if (!v) return res.status(500).json({ error: "Unable to verify payment" });

    const payment = await prisma.subscriptionPayment.findUnique({
      where: { reference: String(reference) },
      select: { id: true, userId: true },
    });
    if (!payment) return res.status(404).json({ error: "Payment record not found" });

    const status = v.status === "success" ? "SUCCESS" : "FAILED";

    await prisma.subscriptionPayment.update({
      where: { reference: String(reference) },
      data: { status, raw: JSON.stringify(v) },
    });

    if (status === "SUCCESS") {
      await prisma.user.update({
        where: { id: payment.userId },
        data: { subscription: "SUBSCRIBED" },
      });
    }

    return res.json({ status });
  } catch (err) {
    console.error("❌ GET /subscription/verify/paystack error:", err?.response?.data || err);
    return res.status(500).json({ error: "Verification failed" });
  }
});

/**
 * POST /api/patient/subscription/checkout/stripe
 * Body: { patientId: User.id }
 */
router.post("/subscription/checkout/stripe", async (req, res) => {
  try {
    if (!stripe) return res.status(500).json({ error: "Stripe not configured" });

    const { patientId } = req.body;
    if (!patientId) return res.status(400).json({ error: "patientId is required" });

    const user = await prisma.user.findUnique({
      where: { id: String(patientId) },
      select: { id: true, email: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) return res.status(500).json({ error: "STRIPE_PRICE_ID not configured" });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      success_url:
        process.env.STRIPE_SUCCESS_URL ||
        `${process.env.APP_BASE_URL || "https://curevirtual.vercel.app"}/subscription?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        process.env.STRIPE_CANCEL_URL ||
        `${process.env.APP_BASE_URL || "https://curevirtual.vercel.app"}/subscription?status=cancel`,
      metadata: { userId: user.id },
    });

    await prisma.subscriptionPayment.create({
      data: {
        userId: user.id,
        provider: "STRIPE",
        reference: session.id,
        amount: 0,
        currency: "USD",
        plan: "STRIPE_PRICE",
        status: "PENDING",
        raw: JSON.stringify(session),
      },
    });

    return res.json({ url: session.url, session_id: session.id });
  } catch (err) {
    console.error("❌ POST /subscription/checkout/stripe error:", err);
    return res.status(500).json({ error: "Failed to init Stripe checkout" });
  }
});

/**
 * GET /api/patient/subscription/verify/stripe?session_id=...
 */
router.get("/subscription/verify/stripe", async (req, res) => {
  try {
    if (!stripe) return res.status(500).json({ error: "Stripe not configured" });

    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ error: "session_id is required" });

    const session = await stripe.checkout.sessions.retrieve(String(session_id));
    if (!session) return res.status(404).json({ error: "Session not found" });

    const payment = await prisma.subscriptionPayment.findUnique({
      where: { reference: session.id },
      select: { id: true, userId: true },
    });
    if (!payment) return res.status(404).json({ error: "Payment record not found" });

    const ok = session.status === "complete" && session.payment_status === "paid";
    const status = ok ? "SUCCESS" : "FAILED";

    await prisma.subscriptionPayment.update({
      where: { reference: session.id },
      data: { status, raw: JSON.stringify(session) },
    });

    if (ok) {
      await prisma.user.update({
        where: { id: payment.userId },
        data: { subscription: "SUBSCRIBED" },
      });
    }

    return res.json({ status, session });
  } catch (err) {
    console.error("❌ GET /subscription/verify/stripe error:", err);
    return res.status(500).json({ error: "Stripe verification failed" });
  }
});

/**
 * POST /api/patient/subscription/cancel
 * Body: { patientId }
 */
router.post("/subscription/cancel", async (req, res) => {
  try {
    const { patientId } = req.body;
    if (!patientId) return res.status(400).json({ error: "patientId is required" });

    await prisma.user.update({
      where: { id: String(patientId) },
      data: { subscription: "UNSUBSCRIBED" },
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("❌ POST /subscription/cancel error:", err);
    return res.status(500).json({ error: "Failed to cancel subscription" });
  }
});

/* ==================================================
   7) SINGLE PATIENT (UTILITY)
   Keep LAST to avoid shadowing paths like /appointments
   ================================================== */
/**
 * GET /api/patient/profile/:id
 * (Changed from "/:id" to avoid greedy matching issues.)
 */
router.get("/profile/:id", async (req, res) => {
  try {
    const { id } = req.params; // PatientProfile.id
    const patient = await prisma.patientProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        appointments: true,
        prescriptions: true,
        consultations: true,
      },
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    res.json({ success: true, message: "Patient fetched successfully", data: patient });
  } catch (error) {
    console.error("Error fetching patient:", error);
    res.status(500).json({ success: false, message: "Failed to fetch patient", error: error.message });
  }
});

// ========================
// PATIENT MESSAGES
// ========================

/**
 * GET /api/patient/messages/inbox?patientId=<User.id>
 * Returns messages received by this patient (stored by User.id).
 */
router.get("/messages/inbox", async (req, res) => {
  try {
    const { patientId } = req.query;
    if (!patientId) return res.status(400).json({ error: "patientId is required" });

    const msgs = await prisma.message.findMany({
      where: { receiverId: String(patientId) },
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, email: true } },
        receiver: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    // Optional: mark as read (first page read). Comment out if not desired.
    // await prisma.message.updateMany({
    //   where: { receiverId: String(patientId), readAt: null },
    //   data: { readAt: new Date() },
    // });

    return res.json(msgs);
  } catch (err) {
    console.error("❌ GET /patient/messages/inbox error:", err);
    return res.status(500).json({ error: "Failed to fetch inbox" });
  }
});

/**
 * POST /api/patient/messages/send
 * Body: { senderId: User.id (patient), receiverId: User.id (doctor), content }
 */
router.post("/messages/send", async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body || {};
    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ error: "senderId, receiverId and content are required" });
    }

    // Basic check: ensure both users exist (optional but helpful)
    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({ where: { id: String(senderId) }, select: { id: true } }),
      prisma.user.findUnique({ where: { id: String(receiverId) }, select: { id: true } }),
    ]);
    if (!sender || !receiver) {
      return res.status(400).json({ error: "Invalid sender or receiver" });
    }

    const created = await prisma.message.create({
      data: {
        senderId: String(senderId),
        receiverId: String(receiverId),
        content: String(content),
        readAt: null,
      },
    });

    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error("❌ POST /patient/messages/send error:", err);
    return res.status(500).json({ error: "Failed to send message" });
  }
});

// PATCH /api/patient/messages/read/:id  → marks a message as read (sets readAt)
// Patient mark read
router.patch("/messages/read/:id", async (req, res) => {
  try {
    const id = String(req.params.id);
    const userId = String(req.query.userId || req.user?.id || "");
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const found = await prisma.message.findUnique({
      where: { id },
      select: { id: true, receiverId: true },
    });
    if (!found) return res.status(404).json({ error: "Message not found" });
    if (found.receiverId !== userId) return res.status(403).json({ error: "Not allowed" });

    const updated = await prisma.message.update({
      where: { id },
      data: { readAt: new Date() },
    });
    res.json({ success: true, data: updated });
  } catch (e) {
    console.error("mark read error", e);
    res.status(500).json({ error: "Failed to mark read" });
  }
});


// DELETE /api/patient/messages/delete/:id?userId=<User.id>
router.delete("/messages/delete/:id", async (req, res) => {
  try {
    const id = String(req.params.id);
    const userId = String(req.query.userId || req.user?.id || "");

    if (!id) return res.status(400).json({ error: "message id is required" });
    if (!userId) return res.status(400).json({ error: "userId is required" });

    // must be sender or receiver
    const found = await prisma.message.findUnique({
      where: { id },
      select: { id: true, senderId: true, receiverId: true },
    });
    if (!found) return res.status(404).json({ error: "Message not found" });

    if (found.senderId !== userId && found.receiverId !== userId) {
      return res.status(403).json({ error: "Not allowed" });
    }

    await prisma.message.delete({ where: { id } });
    return res.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE /patient/messages/delete/:id error:", err);
    return res.status(500).json({ error: "Failed to delete message" });
  }
});

// --- PATIENT PROFILE ---
// PUT /api/patient/profile
// PUT /api/patient/profile
router.put("/profile", verifyToken, async (req, res) => {
  try {
    console.log("🔍 PUT /profile - req.user:", req.user);
    console.log("🔍 PUT /profile - req.body.userId:", req.body.userId);
    
    const userId = req.user?.id || req.body.userId;
    console.log("🔍 PUT /profile BODY:", JSON.stringify(req.body, null, 2));

    const {
      firstName, // ✅ Extract Name
      lastName,  // ✅ Extract Name
      phone,     // ✅ Extract Phone
      dateOfBirth,
      gender,
      bloodGroup,
      height,
      heightUnit,
      weight,
      weightUnit,
      allergies,
      medications,
      medicalHistory,
      address,
      emergencyContact,
      emergencyContactName,
      emergencyContactEmail,
      medicalRecordNumber,
      insuranceProvider,
      insuranceMemberId,
    } = req.body || {};

    // Sanitize medicalRecordNumber: convert empty string to null to avoid unique constraint violations
    const finalMedicalRecordNumber = medicalRecordNumber && medicalRecordNumber.trim() !== "" 
      ? medicalRecordNumber 
      : null;

    console.log("🔍 Extracted userId:", userId);
    
    if (!userId) {
      console.error("❌ userId is missing - req.user:", req.user, "req.body.userId:", req.body.userId);
      return res.status(400).json({ error: "userId is required" });
    }

    // Map Blood Group from frontend (A+, A-) to Prisma Enum (A_POSITIVE, A_NEGATIVE)
    const bloodMap = {
      "A+": "A_POSITIVE",
      "A-": "A_NEGATIVE",
      "B+": "B_POSITIVE",
      "B-": "B_NEGATIVE",
      "AB+": "AB_POSITIVE",
      "AB-": "AB_NEGATIVE",
      "O+": "O_POSITIVE",
      "O-": "O_NEGATIVE",
      "UNKNOWN": "UNKNOWN",
      "A_POS": "A_POSITIVE",
      "A_NEG": "A_NEGATIVE",
      "B_POS": "B_POSITIVE",
      "B_NEG": "B_NEGATIVE",
      "AB_POS": "AB_POSITIVE",
      "AB_NEG": "AB_NEGATIVE",
      "O_POS": "O_POSITIVE",
      "O_NEG": "O_NEGATIVE",
    };
    const mappedBlood = bloodMap[bloodGroup] || bloodGroup;

    // Map Gender from frontend (Male, Female) to Prisma Enum (MALE, FEMALE)
    const genderMap = {
      "Male": "MALE",
      "Female": "FEMALE",
      "Other": "OTHER",
      "MALE": "MALE",
      "FEMALE": "FEMALE",
      "OTHER": "OTHER"
    };
    const mappedGender = genderMap[gender] || gender;

    console.log("🔍 Mapped values - Blood:", mappedBlood, "Gender:", mappedGender);

    // Prepare User update data
    const userData = {
      ...(firstName ? { firstName } : {}), // ✅ Update Name
      ...(lastName ? { lastName } : {}),   // ✅ Update Name
      ...(phone ? { phone } : {}),         // ✅ Update Phone
      ...(dateOfBirth ? { dateOfBirth: new Date(dateOfBirth) } : {}),
      ...(mappedGender ? { gender: mappedGender } : {}),
    };

    // Prepare operations for transaction
    const operations = [];

    // Only update User if there's data to update
    if (Object.keys(userData).length > 0) {
      operations.push(
        prisma.user.update({
          where: { id: String(userId) },
          data: userData,
        })
      );
    }

    // Always upsert PatientProfile
    operations.push(
      prisma.patientProfile.upsert({
        where: { userId: String(userId) },
        update: {
          bloodGroup: mappedBlood,
          height: height !== undefined ? Number(height) : undefined,
          heightUnit: heightUnit || undefined,
          weight: weight !== undefined ? Number(weight) : undefined,
          weightUnit: weightUnit || undefined,
          allergies: allergies,
          medications: medications,
          medicalHistory: medicalHistory,
          address: address,
          emergencyContact: emergencyContact,
          emergencyContactName: emergencyContactName || undefined,
          emergencyContactEmail: emergencyContactEmail || undefined,
          medicalRecordNumber: finalMedicalRecordNumber,
          insuranceProvider: insuranceProvider,
          insuranceMemberId: insuranceMemberId,
        },
        create: {
          userId: String(userId),
          bloodGroup: mappedBlood || "UNKNOWN",
          height: height !== undefined ? Number(height) : null,
          heightUnit: heightUnit || "cm",
          weight: weight !== undefined ? Number(weight) : null,
          weightUnit: weightUnit || "kg",
          allergies: allergies || "",
          medications: medications || "",
          medicalHistory: medicalHistory || "",
          address: address || "",
          emergencyContact: emergencyContact || "",
          emergencyContactName: emergencyContactName || "",
          emergencyContactEmail: emergencyContactEmail || "",
          medicalRecordNumber: finalMedicalRecordNumber,
          insuranceProvider: insuranceProvider || "",
          insuranceMemberId: insuranceMemberId || "",
        },
      })
    );

    // Execute transaction
    const results = await prisma.$transaction(operations);
    
    // Extract results (order depends on whether user update was included)
    const updatedUser = Object.keys(userData).length > 0 ? results[0] : await prisma.user.findUnique({ where: { id: String(userId) } });
    const updatedProfile = Object.keys(userData).length > 0 ? results[1] : results[0];

    console.log("✅ Profile updated successfully for userId:", userId);

    // Return the consolidated profile
    const finalProfile = {
      ...updatedProfile,
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone, // ✅ Return Phone
        dateOfBirth: updatedUser.dateOfBirth,
        gender: updatedUser.gender
      }
    };

    // Send email notification (fire and forget)
    emailService.sendProfileUpdateConfirmation(updatedUser, "Patient")
        .catch(err => console.error("Failed to send profile update email:", err));

    return res.json({ success: true, data: finalProfile });
  } catch (e) {
    console.error("❌ patient profile PUT error:", e);
    console.error("❌ Error stack:", e.stack);
    // Prisma validation errors usually have a message property
    return res.status(500).json({ error: e.message || "Failed to save profile" });
  }
});


// PATCH /api/patient/select-pharmacy
// body: { patientUserId, pharmacyId }
router.patch("/select-pharmacy", async (req, res) => {
  try {
    const { patientUserId, pharmacyId } = req.body || {};
    if (!patientUserId || !pharmacyId)
      return res.status(400).json({ error: "patientUserId and pharmacyId required" });

    const pat = await prisma.patientProfile.findUnique({ where: { userId: String(patientUserId) } });
    if (!pat) return res.status(404).json({ error: "Patient profile not found" });

    const pharm = await prisma.pharmacyProfile.findUnique({ where: { id: String(pharmacyId) } });
    if (!pharm) return res.status(404).json({ error: "Pharmacy not found" });

    const updated = await prisma.patientProfile.update({
      where: { id: pat.id },
      data: { selectedPharmacyId: pharm.id },
      include: { selectedPharmacy: true }
    });

    return res.json({ success: true, data: updated });
  } catch (e) {
    console.error("PATCH /patient/select-pharmacy error:", e);
    return res.status(500).json({ error: "Failed to set preferred pharmacy" });
  }
});


module.exports = router;


/* ==================================================
   PHARMACY ORDERING & MANAGEMENT
   ================================================== */

/**
 * GET /api/patient/pharmacies
 * List all available pharmacies for patient selection
 */
router.get("/pharmacies", async (req, res) => {
  try {
    const pharmacies = await prisma.pharmacyProfile.findMany({
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    res.json({
      success: true,
      data: pharmacies.map(p => ({
        id: p.id,
        name: p.displayName || p.user.name,
        licenseNumber: p.licenseNumber,
        phone: p.phone,
        address: p.address,
        city: p.city,
        state: p.state,
        country: p.country,
        postalCode: p.postalCode,
        latitude: p.latitude,
        longitude: p.longitude,
        openingHours: p.openingHours,
        services: p.services
      }))
    });
  } catch (err) {
    console.error("Failed to fetch pharmacies:", err);
    res.status(500).json({ error: "Failed to fetch pharmacies" });
  }
});

/**
 * PATCH /api/patient/profile/pharmacy
 * Link patient to a pharmacy
 */
router.patch("/profile/pharmacy", async (req, res) => {
  try {
    const patientUserId = req.user?.id;
    const { pharmacyId } = req.body;

    if (!patientUserId || !pharmacyId) {
      return res.status(400).json({ error: "Missing patientUserId or pharmacyId" });
    }

    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: patientUserId }
    });

    if (!patientProfile) {
      return res.status(404).json({ error: "Patient profile not found" });
    }

    const pharmacy = await prisma.pharmacyProfile.findUnique({
      where: { id: pharmacyId }
    });

    if (!pharmacy) {
      return res.status(404).json({ error: "Pharmacy not found" });
    }

    const updated = await prisma.patientProfile.update({
      where: { id: patientProfile.id },
      data: { selectedPharmacyId: pharmacyId },
      include: { selectedPharmacy: true }
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Failed to link pharmacy:", err);
    res.status(500).json({ error: "Failed to link pharmacy" });
  }
});

/**
 * GET /api/patient/profile/pharmacy
 * Get patient's selected pharmacy
 */
router.get("/profile/pharmacy", async (req, res) => {
  try {
    const patientUserId = req.user?.id;

    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: patientUserId },
      include: { selectedPharmacy: true }
    });

    if (!patientProfile) {
      return res.status(404).json({ error: "Patient profile not found" });
    }

    res.json({ success: true, data: patientProfile.selectedPharmacy });
  } catch (err) {
    console.error("Failed to fetch selected pharmacy:", err);
    res.status(500).json({ error: "Failed to fetch pharmacy" });
  }
});

/* ==================================================
   PRESCRIPTION ORDERING
   ================================================== */

/**
 * POST /api/patient/pharmacy/order
 * Patient orders prescription from pharmacy
 */
router.post("/pharmacy/order", async (req, res) => {
  try {
    const patientUserId = req.user?.id;
    const { prescriptionId } = req.body;

    if (!patientUserId || !prescriptionId) {
      return res.status(400).json({ error: "Missing patientUserId or prescriptionId" });
    }

    // Get patient's selected pharmacy
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: patientUserId }
    });

    if (!patientProfile?.selectedPharmacyId) {
      return res.status(400).json({ error: "No pharmacy selected" });
    }

    // Update prescription with pharmacy
    const updated = await prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        pharmacyId: patientProfile.selectedPharmacyId,
        dispatchStatus: "SENT"
      },
      include: { pharmacy: true, doctor: true, patient: true }
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Failed to order from pharmacy:", err);
    res.status(500).json({ error: "Failed to order from pharmacy" });
  }
});

module.exports = router;


