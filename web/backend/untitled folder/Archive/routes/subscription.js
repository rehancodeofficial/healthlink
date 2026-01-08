
// FILE: backend/routes/subscription.js
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const Stripe = require("stripe");
const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

// Import RBAC middleware
const { verifyToken, requireRole } = require("../middleware/rbac");

/* ----------------------------- helpers ----------------------------- */

const computeStatus = (row) => {
  if (!row) return "NONE";
  const now = new Date();
  if (row.status === "PENDING") return "PENDING";
  if (row.status === "ACTIVE" && row.endDate && now <= row.endDate) return "ACTIVE";
  if (row.endDate && now > row.endDate) return "EXPIRED";
  return row.status || "NONE";
};

function getRolePriceId(role, plan) {
  const r = String(role || "").toUpperCase();
  const p = String(plan || "").toUpperCase();
  const isDoctor = r === "DOCTOR";

  if (p === "MONTHLY") {
    if (isDoctor) return process.env.STRIPE_PRICE_ID_DOCTOR_MONTHLY;
    if (r === "PHARMACY") return process.env.STRIPE_PRICE_ID_PHARMACY_MONTHLY;
    return process.env.STRIPE_PRICE_ID_PATIENT_MONTHLY;
  }
  if (p === "YEARLY") {
    if (isDoctor) return process.env.STRIPE_PRICE_ID_DOCTOR_YEARLY;
    if (r === "PHARMACY") return process.env.STRIPE_PRICE_ID_PHARMACY_YEARLY;
    return process.env.STRIPE_PRICE_ID_PATIENT_YEARLY;
  }
  return null;
}

/** Ensure we always have exactly one settings row available. */
async function ensureSettings() {
  // Prefer id=1 if it exists
  let s = await prisma.subscriptionSetting.findUnique({ where: { id: 1 } });

  // If settings exist, check if we need to migrate legacy pharmacy prices (20 -> 30) or if they are null
  if (s) {
    if (s.pharmacyMonthlyUsd === 20 || s.pharmacyYearlyUsd === 210 || s.pharmacyMonthlyUsd === null) {
      console.log("Migrating legacy/null Pharmacy prices to 30/300...");
      s = await prisma.subscriptionSetting.update({
        where: { id: 1 },
        data: {
          pharmacyMonthlyUsd: 30,
          pharmacyYearlyUsd: 300,
        }
      });
    }
    return s;
  }

  // Otherwise adopt any existing row
  s = await prisma.subscriptionSetting.findFirst();
  if (s) return s;

  // Or seed defaults with CORRECT values
  return prisma.subscriptionSetting.create({
    data: {
      doctorMonthlyUsd: 25,
      doctorYearlyUsd: 25 * 10.5,
      patientMonthlyUsd: 10,
      patientYearlyUsd: 10 * 10.5,
      pharmacyMonthlyUsd: 30, // Updated to 30
      pharmacyYearlyUsd: 300, // Updated to 300
    },
  });
}

/* -------------------------- ADMIN & GENERAL ------------------------- */
/**
 * GET prices (supports both admin + role-specific callers)
 *
 * - Admin (your SubscriptionSettings.jsx) calls:  GET /api/subscription/prices
 *   -> returns the full matrix: doctor/patient/pharmacy + updatedAt
 *
 * - Patient/Doctor pages can call any of:
 *   GET /api/subscription/prices?role=DOCTOR|PATIENT
 *   GET /api/prices?role=DOCTOR|PATIENT
 *   (optionally pass userId, and we’ll infer role if role is omitted)
 *
 * Response always includes:
 *   data: {
 *     // role-specific convenience (for older UIs)
 *     monthlyUsd, yearlyUsd,
 *     // full matrix for admin table
 *     doctorMonthlyUsd, doctorYearlyUsd,
 *     patientMonthlyUsd, patientYearlyUsd,
 *     pharmacyMonthlyUsd, pharmacyYearlyUsd,
 *     updatedAt
 *   }
 */
async function getPricesHandler(req, res) {
  try {
    const s = await ensureSettings();

    // Try to resolve role for convenience fields (monthlyUsd/yearlyUsd)
    let role = (req.query.role || "").toUpperCase();
    if (!role && req.query.userId) {
      const u = await prisma.user.findUnique({
        where: { id: String(req.query.userId) },
        select: { role: true },
      });
      role = (u?.role || "").toUpperCase();
    }
    if (!role) role = "PATIENT"; // safe default

    let monthlyUsd = null;
    let yearlyUsd = null;

    if (role === "DOCTOR") {
      monthlyUsd = s.doctorMonthlyUsd ?? null;
      yearlyUsd = s.doctorYearlyUsd ?? null;
    } else if (role === "PHARMACY") {
      monthlyUsd = s.pharmacyMonthlyUsd ?? null;
      yearlyUsd = s.pharmacyYearlyUsd ?? null;
    } else {
      // PATIENT (default)
      monthlyUsd = s.patientMonthlyUsd ?? null;
      yearlyUsd = s.patientYearlyUsd ?? null;
    }

    return res.json({
      success: true,
      data: {
        // role-specific convenience (for older frontends that read monthlyUsd/yearlyUsd)
        monthlyUsd,
        yearlyUsd,

        // full matrix for the admin table
        doctorMonthlyUsd: s.doctorMonthlyUsd ?? null,
        doctorYearlyUsd: s.doctorYearlyUsd ?? null,
        patientMonthlyUsd: s.patientMonthlyUsd ?? null,
        patientYearlyUsd: s.patientYearlyUsd ?? null,
        pharmacyMonthlyUsd: s.pharmacyMonthlyUsd ?? null,
        pharmacyYearlyUsd: s.pharmacyYearlyUsd ?? null,
        updatedAt: s.updatedAt,
      },
    });
  } catch (err) {
    console.error("❌ GET prices error:", err);
    return res.status(500).json({ error: "Failed to load subscription prices" });
  }
}

/**
 * PUT prices (admin saves)
 * Body: {
 *  doctorMonthlyUsd, doctorYearlyUsd,
 *  patientMonthlyUsd, patientYearlyUsd,
 *  pharmacyMonthlyUsd, pharmacyYearlyUsd
 * }
 */
async function putPricesHandler(req, res) {
  try {
    const {
      doctorMonthlyUsd,
      doctorYearlyUsd,
      patientMonthlyUsd,
      patientYearlyUsd,
      pharmacyMonthlyUsd,
      pharmacyYearlyUsd,
    } = req.body || {};

    const fields = [
      ["doctorMonthlyUsd", doctorMonthlyUsd],
      ["doctorYearlyUsd", doctorYearlyUsd],
      ["patientMonthlyUsd", patientMonthlyUsd],
      ["patientYearlyUsd", patientYearlyUsd],
      ["pharmacyMonthlyUsd", pharmacyMonthlyUsd],
      ["pharmacyYearlyUsd", pharmacyYearlyUsd],
    ];

    for (const [k, v] of fields) {
      const n = Number(v);
      if (!v || Number.isNaN(n) || n <= 0) {
        return res.status(400).json({ error: `${k} must be a positive number` });
      }
    }

    let s = await prisma.subscriptionSetting.findUnique({ where: { id: 1 } });
    if (!s) s = await prisma.subscriptionSetting.findFirst();

    const payload = {
      doctorMonthlyUsd: Number(doctorMonthlyUsd),
      doctorYearlyUsd: Number(doctorYearlyUsd),
      patientMonthlyUsd: Number(patientMonthlyUsd),
      patientYearlyUsd: Number(patientYearlyUsd),
      pharmacyMonthlyUsd: Number(pharmacyMonthlyUsd),
      pharmacyYearlyUsd: Number(pharmacyYearlyUsd),
    };

    const updated = s
      ? await prisma.subscriptionSetting.update({ where: { id: s.id }, data: payload })
      : await prisma.subscriptionSetting.create({ data: payload });

    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error("❌ PUT prices error:", err);
    return res.status(500).json({ error: "Failed to save subscription prices" });
  }
}

/* ----------- wire both canonical + compatibility routes ----------- */
// Canonical admin + role-aware
router.get("/subscription/prices", verifyToken, getPricesHandler);
router.put("/subscription/prices", requireRole(["ADMIN", "SUPERADMIN"]), putPricesHandler);

// Compatibility (older code may call these)
router.get("/prices", getPricesHandler);
router.put("/prices", putPricesHandler);
router.get("/subscription/settings", getPricesHandler);
router.get("/settings", getPricesHandler);

/* ----------------------------- STATS & LIST ----------------------------- */
/* GET /api/subscribers/stats */
router.get("/stats", verifyToken, requireRole(["ADMIN", "SUPERADMIN"]), async (_req, res) => {
  try {
    const active = await prisma.subscription.findMany({
      where: { status: "ACTIVE" },
      distinct: ["userId"],
      select: { userId: true, plan: true, user: { select: { role: true } } },
    });

    const totalActive = active.length;
    const monthlyActive = active.filter((s) => s.plan === "MONTHLY").length;
    const yearlyActive = active.filter((s) => s.plan === "YEARLY").length;

    const doctorsActive = active.filter((s) => s.user?.role === "DOCTOR").length;
    const patientsActive = active.filter((s) => s.user?.role === "PATIENT").length;
    const pharmacyActive = active.filter((s) => s.user?.role === "PHARMACY").length;

    return res.json({
      success: true,
      data: {
        totalActive,
        monthlyActive,
        yearlyActive,
        doctorsActive,
        patientsActive,
        pharmacyActive,
      },
    });
  } catch (err) {
    console.error("❌ /subscribers/stats error:", err);
    return res.status(500).json({ error: "Failed to load stats" });
  }
});

/* GET /api/subscribers/list */
router.get("/list", verifyToken, requireRole(["ADMIN", "SUPERADMIN"]), async (req, res) => {
  try {
    const { role, plan, status, q, page = 1, pageSize = 20 } = req.query;

    const whereUser = {};
    if (role && ["DOCTOR", "PATIENT", "PHARMACY"].includes(String(role))) {
      whereUser.role = String(role);
    }

    const whereSubsSome = {};
    if (plan && ["MONTHLY", "YEARLY"].includes(String(plan))) {
      whereSubsSome.plan = String(plan);
    }
    if (status && ["ACTIVE", "EXPIRED", "DEACTIVATED", "PENDING", "FAILED"].includes(String(status))) {
      whereSubsSome.status = String(status);
    }

    const text = q?.toString().trim();
    if (text) {
      whereUser.OR = [
        { name: { contains: text, mode: "insensitive" } },
        { email: { contains: text, mode: "insensitive" } },
      ];
    }

    whereUser.subscriptions = { some: Object.keys(whereSubsSome).length ? whereSubsSome : {} };

    const take = Math.max(1, Math.min(100, Number(pageSize)));
    const skip = (Math.max(1, Number(page)) - 1) * take;

    const [total, users] = await Promise.all([
      prisma.user.count({ where: whereUser }),
      prisma.user.findMany({
        where: whereUser,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        select: {
          id: true,
          firstName: true, lastName: true,
          email: true,
          role: true,
          subscriptions: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { id: true, plan: true, status: true, startDate: true, endDate: true, updatedAt: true },
          },
        },
      }),
    ]);

    const items = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      sub: u.subscriptions?.[0] || null,
    }));

    return res.json({ success: true, data: { total, page: Number(page), pageSize: take, items } });
  } catch (err) {
    console.error("❌ /subscribers/list error:", err);
    return res.status(500).json({ error: "Failed to load list" });
  }
});

/* ----------------------- USER STATUS & HISTORY ---------------------- */
// GET /api/subscription/status?userId=UUID
router.get("/subscription/status", verifyToken, async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const latest = await prisma.subscription.findFirst({
      where: { userId },
      orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
    });

    if (!latest) return res.json({ data: { status: "NONE" } });

    const status = computeStatus(latest);
    return res.json({
      data: {
        status,
        plan: latest.plan,
        startDate: latest.startDate,
        endDate: latest.endDate,
      },
    });
  } catch (err) {
    console.error("❌ status error:", err);
    return res.status(500).json({ error: "Failed to load subscription status" });
  }
});

// GET /api/subscription?userId=UUID
router.get("/subscription", verifyToken, async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const list = await prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const data = list.map((s) => ({ ...s, computedStatus: computeStatus(s) }));
    return res.json({ data });
  } catch (err) {
    console.error("❌ history error:", err);
    return res.status(500).json({ error: "Failed to load subscriptions" });
  }

});

// Alias for /subscription/history (frontend compatibility)
router.get("/subscription/history", verifyToken, async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const list = await prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const data = list.map((s) => ({ ...s, computedStatus: computeStatus(s) }));
    return res.json({ data });
  } catch (err) {
    console.error("❌ history error:", err);
    return res.status(500).json({ error: "Failed to load subscriptions" });
  }
});

/* ------------------------ ADMIN: force status ----------------------- */
// PATCH /api/subscription/:id/status
router.patch("/subscription/:id/status", verifyToken, requireRole(["ADMIN", "SUPERADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    const allowed = ["ACTIVE", "DEACTIVATED", "EXPIRED"];
    if (!allowed.includes(String(status))) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const sub = await prisma.subscription.findUnique({ where: { id: String(id) } });
    if (!sub) return res.status(404).json({ error: "Subscription not found" });

    let data = { status: String(status) };

    if (status === "ACTIVE") {
      const now = new Date();
      const ms = (sub.plan === "YEARLY" ? 365 : 30) * 24 * 60 * 60 * 1000;
      data.startDate = now;
      data.endDate = new Date(now.getTime() + ms);
    }

    const updated = await prisma.subscription.update({ where: { id: sub.id }, data });

    // Optional: reflect snapshot on User for quick UI badges
    await prisma.user.update({
      where: { id: sub.userId },
      data: { subscriptionState: updated.status },
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error("❌ /subscription/:id/status error:", err);
    return res.status(500).json({ error: "Failed to update subscription status" });
  }
});

/* ------------------------ STRIPE CHECKOUT FLOW ---------------------- */
// POST /api/subscription/stripe/checkout  { userId, plan: "MONTHLY"|"YEARLY" }
router.post("/subscription/stripe/checkout", async (req, res) => {
  try {
    const { userId, plan } = req.body || {};
    if (!userId || !plan) {
      return res.status(400).json({ error: "userId and plan are required" });
    }
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured on the server" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const priceId = getRolePriceId(user.role, plan);
    if (!priceId) {
      return res
        .status(400)
        .json({ error: `No Stripe Price configured for ${user.role} ${String(plan).toUpperCase()}` });
    }

    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
    const successUrl =
      process.env.SUBS_SUCCESS_URL ||
      `${FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = process.env.SUBS_CANCEL_URL || `${FRONTEND_URL}/subscription/cancel`;

    // ✅ MOCK CHECKOUT for invalid/placeholder keys
    // If the price ID looks fake (contains * or X), bypass Stripe and create subscription directly.
    if (!priceId || priceId.includes("****") || priceId.includes("XXXX")) {
      console.log("⚠️  Mocking checkout for Price ID:", priceId);
      const mockSessionId = "mock_" + Date.now();
      
      const now = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (plan === "YEARLY" ? 365 : 30));

      await prisma.subscription.create({
        data: {
          userId,
          plan,
          status: "ACTIVE",
          provider: "MOCK",
          reference: mockSessionId,
          currency: "USD",
          startDate: now,
          endDate: endDate,
        },
      });

      // Redirect user to success URL immediately
      return res.json({ 
        url: successUrl.replace("{CHECKOUT_SESSION_ID}", mockSessionId) 
      });
    }

    // 1) Create Stripe Checkout (subscription mode)
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId, plan },
    });

    // 2) Record a pending row (reference = session.id)
    await prisma.subscription.create({
      data: {
        userId,
        plan,
        status: "PENDING",
        provider: "STRIPE",
        reference: session.id,
        currency: "USD",
      },
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error("❌ stripe checkout error:", err);
    return res.status(500).json({ error: "Failed to start checkout" });
  }
});

/* ---------------------------- STRIPE WEBHOOK ---------------------------- */
/**
 * Mounted in server.js with:
 * app.post("/api/subscription/stripe/webhook", express.raw({ type: "application/json" }), subscriptionRoutes.stripeWebhook)
 */
async function stripeWebhook(req, res) {
  if (!stripe) return res.status(500).json({ error: "Stripe not configured" });

  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;
        const subscriptionId = session.subscription;

        let sub = null;
        try {
          sub = await stripe.subscriptions.retrieve(subscriptionId);
        } catch (e) {
          console.warn("⚠️ Could not retrieve subscription from Stripe:", e?.message);
        }

        const start = sub?.current_period_start ? new Date(sub.current_period_start * 1000) : new Date();
        const end = sub?.current_period_end ? new Date(sub.current_period_end * 1000) : null;

        await prisma.subscription.updateMany({
          where: { userId, reference: session.id },
          data: {
            status: "ACTIVE",
            reference: String(subscriptionId),
            startDate: start,
            endDate: end,
            currency: "USD",
            plan: plan || "MONTHLY",
          },
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        const line = invoice.lines?.data?.[0];
        const period = line?.period;

        const start = period?.start ? new Date(period.start * 1000) : undefined;
        const end = period?.end ? new Date(period.end * 1000) : undefined;

        await prisma.subscription.updateMany({
          where: { reference: String(subscriptionId) },
          data: {
            status: "ACTIVE",
            ...(start ? { startDate: start } : {}),
            ...(end ? { endDate: end } : {}),
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const stripeSub = event.data.object;
        await prisma.subscription.updateMany({
          where: { reference: String(stripeSub.id) },
          data: {
            status: "DEACTIVATED",
            endDate: stripeSub.ended_at ? new Date(stripeSub.ended_at * 1000) : new Date(),
          },
        });
        break;
      }

      default:
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook handler error:", err);
    res.status(500).json({ error: "Webhook handler failed" });
  }
}

/* ---------------------------- exports ---------------------------- */
module.exports = router;
module.exports.stripeWebhook = stripeWebhook;
