// FILE: backend/routes/pharmacy.js
const express = require("express");
const router = express.Router();
const prisma = require('../prisma/prismaClient');
const { verifyToken, requireRole } = require("../middleware/rbac.js");
const jwt = require("jsonwebtoken");

const authenticatePharmacy = [verifyToken, requireRole(["PHARMACY", "SUPERADMIN", "ADMIN"])];

/* --------------------------- helpers --------------------------- */
const toNullIfBlank = (v) =>
  v === undefined || v === null || String(v).trim() === "" ? null : String(v).trim();

const toFloatOrNull = (v) => {
  if (v === undefined || v === null || String(v).trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// Read userId from (token OR query OR body)
function inferUserId(req) {
  if (req.user?.id) return String(req.user.id);
  if (req.query?.userId) return String(req.query.userId);
  if (req.body?.userId) return String(req.body.userId);
  return null;
}

/* ================================================================
   DASHBOARD STATS
================================================================ */
router.get("/stats", ...authenticatePharmacy, async (req, res) => {
  try {
    const pharmacyUserId = req.user?.id;

    const pharmacyProfile = await prisma.pharmacyProfile.findUnique({
      where: { userId: pharmacyUserId },
      select: { id: true }
    });

    if (!pharmacyProfile) {
      return res.json({
        totalPrescriptions: 0,
        pendingPrescriptions: 0,
        dispensedPrescriptions: 0,
        totalCustomers: 0
      });
    }

    // Debug logging to find which query is failing
    console.log("DEBUG: Fetching pharmacy stats for profile:", pharmacyProfile.id);

    try {
        const [
          totalPrescriptions,
          pendingPrescriptions,
          dispensedPrescriptions,
          totalCustomers
        ] = await Promise.all([
          prisma.prescription.count({
            where: { pharmacyId: pharmacyProfile.id }
          }),
          prisma.prescription.count({
            where: {
              pharmacyId: pharmacyProfile.id,
              dispatchStatus: { in: ["SENT", "READY"] }
            }
          }),
          prisma.prescription.count({
            where: {
              pharmacyId: pharmacyProfile.id,
              dispatchStatus: "DISPENSED"
            }
          }),
          prisma.selectedPharmacy.count({
            where: { pharmacyId: pharmacyProfile.id }
          })
        ]);

        console.log("DEBUG: Pharmacy stats fetched successfully:", { totalPrescriptions, pendingPrescriptions, dispensedPrescriptions, totalCustomers });

        res.json({
          totalPrescriptions,
          pendingPrescriptions,
          dispensedPrescriptions,
          totalCustomers
        });
    } catch (innerErr) {
        console.error("DEBUG: Inner error in pharmacy stats queries:", innerErr);
        throw innerErr; 
    }
  } catch (err) {
    console.error("Failed to fetch pharmacy stats:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

/* ================================================================
   GET /pharmacy/profile?userId=...
   - Ensures a profile exists for the user (auto-creates minimal row)
================================================================ */
router.get("/profile", ...authenticatePharmacy, async (req, res) => {
  try {
    const userId = inferUserId(req);
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Helper
    const isUuid = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    // Ensure user exists
    if (!isUuid(userId)) {
      return res.status(400).json({ error: "Invalid userId format" });
    }

    const user = await prisma.user.findUnique({
      where: { id: String(userId) },
      select: { id: true, role: true, email: true, firstName: true, lastName: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    // (Optional) enforce role === PHARMACY
    // if (user.role !== "PHARMACY") {
    //   return res.status(400).json({ error: "User is not a PHARMACY role" });
    // }

    // Get or create profile
    let profile = await prisma.pharmacyProfile.findUnique({
      where: { userId: String(userId) },
      include: { user: true },
    });

    if (!profile) {
      profile = await prisma.pharmacyProfile.create({
        data: { userId: String(userId) },
        include: { user: true },
      });
    }

    return res.json({ success: true, data: profile });
  } catch (err) {
    console.error("GET /pharmacy/profile error:", err);
    return res.status(500).json({ error: "Failed to load profile" });
  }
});

/* ================================================================
   PUT /pharmacy/profile
   Body: {
     userId, displayName?, licenseNumber?, phone?, address?, city?,
     state?, country?, postalCode?, latitude?, longitude?,
     openingHours?, services?
   }
   - Upserts the profile and returns a success message (for toast)
================================================================ */
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const userId = inferUserId(req);
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Ensure user exists
    const user = await prisma.user.findUnique({
      where: { id: String(userId) },
      select: { id: true, role: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const {
      displayName,
      licenseNumber,
      phone,
      firstName,
      lastName,
      address,
      city,
      state,
      country,
      postalCode,
      latitude,
      longitude,
      openingHours,
      services,
    } = req.body || {};

    const data = {
      displayName: toNullIfBlank(displayName),
      licenseNumber: toNullIfBlank(licenseNumber),
      phone: toNullIfBlank(phone),
      address: toNullIfBlank(address),
      city: toNullIfBlank(city),
      state: toNullIfBlank(state),
      country: toNullIfBlank(country),
      postalCode: toNullIfBlank(postalCode),
      latitude: toFloatOrNull(latitude),
      longitude: toFloatOrNull(longitude),
      openingHours: toNullIfBlank(openingHours),
      services: toNullIfBlank(services),
      updatedAt: new Date(),
    };

    // ✅ Sync User Phone & Name if provided
    const userData = {};
    if (phone) userData.phone = String(phone).trim();
    if (firstName) userData.firstName = String(firstName).trim();
    if (lastName) userData.lastName = String(lastName).trim();

    if (Object.keys(userData).length > 0) {
      await prisma.user.update({
        where: { id: String(userId) },
        data: userData
      });
    }

    const saved = await prisma.pharmacyProfile.upsert({
      where: { userId: String(userId) },
      update: data,
      create: { userId: String(userId), ...data },
      include: { user: true },
    });

    return res.json({
      success: true,
      message: "✅ Profile saved",
      data: saved,
    });
  } catch (err) {
    console.error("PUT /pharmacy/profile error:", err);
    return res.status(500).json({ error: "Failed to save profile" });
  }
});

/* ================================================================
   GET /pharmacy/prescriptions?userId=...
   (dashboard counts / list)
================================================================ */
router.get("/prescriptions", verifyToken, requireRole(["PHARMACY", "ADMIN", "SUPERADMIN"]), async (req, res) => {
  try {
    const userId = inferUserId(req);
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const pharm = await prisma.pharmacyProfile.findUnique({
      where: { userId: String(userId) },
      select: { id: true },
    });
    if (!pharm) return res.json({ success: true, data: [] });

    const list = await prisma.prescription.findMany({
      where: { pharmacyId: pharm.id },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, data: list });
  } catch (err) {
    console.error("GET /pharmacy/prescriptions error:", err);
    return res.status(500).json({ error: "Failed to load prescriptions" });
  }
});

/* ================================================================
   BONUS: pharmacy dispatch status updates
   PATCH /pharmacy/prescriptions/:id/status { dispatchStatus }
   dispatchStatus: "ACKNOWLEDGED" | "READY" | "DISPENSED" | "REJECTED"
================================================================ */
router.patch("/prescriptions/:id/status", verifyToken, requireRole(["PHARMACY", "ADMIN", "SUPERADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { dispatchStatus } = req.body || {};
    const allowed = ["ACKNOWLEDGED", "READY", "DISPENSED", "REJECTED"];

    if (!allowed.includes(String(dispatchStatus))) {
      return res.status(400).json({ error: "Invalid dispatchStatus value" });
    }

    const updated = await prisma.prescription.update({
      where: { id: String(id) },
      data: {
        dispatchStatus,
        dispatchedAt:
          dispatchStatus === "ACKNOWLEDGED" ||
          dispatchStatus === "READY" ||
          dispatchStatus === "DISPENSED"
            ? new Date()
            : null,
      },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
        pharmacy: true,
      },
    });

    return res.json({ success: true, message: "✅ Status updated", data: updated });
  } catch (err) {
    console.error("PATCH /pharmacy/prescriptions/:id/status error:", err);
    return res.status(500).json({ error: "Failed to update dispatch status" });
  }

});

/* ================================================================
   DELETE /pharmacy/prescriptions/:id
   - Delete a prescription (e.g. if created in error or rejected)
================================================================ */
router.delete("/prescriptions/:id", verifyToken, requireRole(["PHARMACY", "ADMIN", "SUPERADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.prescription.delete({ where: { id: String(id) } });
    return res.json({ success: true, message: "✅ Prescription deleted" });
  } catch (err) {
    console.error("DELETE /pharmacy/prescriptions/:id error:", err);
    return res.status(500).json({ error: "Failed to delete prescription" });
  }
});

/* ================================================================
   PUT /pharmacy/prescriptions/:id
   - Edit prescription details (medication, dosage, etc.)
================================================================ */
router.put("/prescriptions/:id", verifyToken, requireRole(["PHARMACY", "ADMIN", "SUPERADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { medication, dosage, frequency, duration, notes } = req.body || {};

    const updated = await prisma.prescription.update({
      where: { id: String(id) },
      data: {
        medication,
        dosage,
        frequency,
        duration,
        notes
      },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      }
    });

    return res.json({ success: true, message: "✅ Prescription updated", data: updated });
  } catch (err) {
    console.error("PUT /pharmacy/prescriptions/:id error:", err);
    return res.status(500).json({ error: "Failed to update prescription" });
  }
});

/* ================================================================
   GET /pharmacy/list — List all pharmacies
   Used by patient pharmacy list page
================================================================ */
router.get("/list", async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    const pharmacies = await prisma.pharmacyProfile.findMany({
      include: { 
        user: {
          select: {
            id: true,
            firstName: true, lastName: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    // Format for frontend
    const items = pharmacies.map(p => ({
      id: p.id,
      name: p.displayName || (p.user ? `${p.user.firstName} ${p.user.lastName}`.trim() : "Unnamed Pharmacy"),
      email: p.user?.email,
      phone: p.phone,
      address: p.address,
      city: p.city,
      state: p.state,
      country: p.country,
      latitude: p.latitude,
      longitude: p.longitude,
      openingHours: p.openingHours,
      services: p.services,
      licenseNumber: p.licenseNumber,
      pharmacyProfile: p, // Include full profile for modal
    }));

    return res.json({ success: true, data: { items } });
  } catch (err) {
    console.error("GET /pharmacy/list error:", err);
    return res.status(500).json({ error: "Failed to load pharmacy list" });
  }
});


// GET /api/pharmacy/patient/selected?patientId=...
router.get("/patient/selected", async (req, res) => {
  try {
    const { patientId } = req.query;
    if (!patientId) return res.status(400).json({ error: "patientId is required" });

    const pid = await prisma.patientProfile.findUnique({
      where: { userId: String(patientId) },
      select: { id: true }
    });
    if (!pid) return res.json({ success: true, data: [] });

    const selected = await prisma.selectedPharmacy.findMany({
      where: { patientId: pid.id },
      include: { 
        pharmacy: { 
          include: { 
            user: { select: { firstName: true, lastName: true, email: true } } 
          } 
        } 
      },
      orderBy: { createdAt: "desc" }
    });

    const items = selected.map(s => ({
      mapId: s.id,
      pharmacyId: s.pharmacyId,
      preferred: s.preferred,
      pharmacyId: s.pharmacyId,
      preferred: s.preferred,
      name: s.pharmacy.displayName || (s.pharmacy.user ? `${s.pharmacy.user.firstName} ${s.pharmacy.user.lastName}`.trim() : "Pharmacy"),
      address: s.pharmacy.address,
      email: s.pharmacy.user.email,
      pharmacyProfile: s.pharmacy
    }));

    res.json({ success: true, data: items });
  } catch(err) {
    console.error("GET /patient/selected error:", err);
    res.status(500).json({ error: "Failed to load selected list" });
  }
});

// POST /api/pharmacy/patient/select
router.post("/patient/select", verifyToken, async (req, res) => {
  try {
    const { patientId, pharmacyId } = req.body;
    if (!patientId || !pharmacyId) return res.status(400).json({ error: "Missing ids" });

    const pat = await prisma.patientProfile.findUnique({ where: { userId: String(patientId) } });
    if (!pat) return res.status(404).json({ error: "Patient profile not found" });

    // Check if exists
    const existing = await prisma.selectedPharmacy.findUnique({
      where: {
        patientId_pharmacyId: { patientId: pat.id, pharmacyId: String(pharmacyId) }
      }
    });

    if (existing) {
      return res.status(400).json({ error: "Already added to your list" });
    }

    await prisma.selectedPharmacy.create({
      data: {
        patientId: pat.id,
        pharmacyId: String(pharmacyId)
      }
    });

    res.json({ success: true, message: "Added to list" });
  } catch(err) {
    console.error("POST /patient/select error:", err);
    res.status(500).json({ error: "Failed to add pharmacy" });
  }
});

// DELETE /api/pharmacy/patient/select/:mapId
router.delete("/patient/select/:mapId", verifyToken, async (req, res) => {
  try {
    const { mapId } = req.params;
    await prisma.selectedPharmacy.delete({ where: { id: mapId } });
    res.json({ success: true, message: "Removed" });
  } catch(err) {
    res.status(500).json({ error: "Failed to remove" });
  }
});

// PATCH /api/pharmacy/patient/select/:mapId/preferred
router.patch("/patient/select/:mapId/preferred", verifyToken, async (req, res) => {
  try {
    const { mapId } = req.params;
    const { preferred } = req.body;

    // Optional: unset others if you want only one preferred
    if (preferred) {
      const current = await prisma.selectedPharmacy.findUnique({ where: { id: mapId } });
      if (current) {
        await prisma.selectedPharmacy.updateMany({
          where: { patientId: current.patientId },
          data: { preferred: false }
        });
      }
    }

    const updated = await prisma.selectedPharmacy.update({
      where: { id: mapId },
      data: { preferred: Boolean(preferred) }
    });
    res.json({ success: true, data: updated });
  } catch(err) {
    console.error("preference error:", err);
    res.status(500).json({ error: "Failed to update preference" });
  }
});

/* ================================================================
   POST /pharmacy/prescriptions — Create a new prescription
   Requester (Pharmacy) acts as the creator/filler.
   Needs doctorId & patientId.
================================================================ */
router.post("/prescriptions", verifyToken, requireRole(["PHARMACY", "ADMIN", "SUPERADMIN"]), async (req, res) => {
  try {
    const userId = inferUserId(req);
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const pharm = await prisma.pharmacyProfile.findUnique({
      where: { userId: String(userId) },
      select: { id: true },
    });
    if (!pharm) return res.status(404).json({ error: "Pharmacy profile not found" });

    const { 
      patientId, doctorId, 
      medication, dosage, frequency, duration, notes 
    } = req.body;

    if (!patientId || !doctorId || !medication) {
      return res.status(400).json({ error: "Patient, Doctor, and Medication are required" });
    }

    const created = await prisma.prescription.create({
      data: {
        pharmacyId: pharm.id,
        patientId,
        doctorId,
        medication,
        dosage,
        frequency,
        duration,
        notes,
        // If Pharmacy creates it, we assume they have it "Received" or "Acknowledged"
        dispatchStatus: "ACKNOWLEDGED", 
        dispatchedAt: new Date(),
      },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      }
    });

    return res.json({ success: true, message: "✅ Prescription created", data: created });
  } catch (err) {
    console.error("POST /pharmacy/prescriptions error:", err);
    return res.status(500).json({ error: "Failed to create prescription" });
  }
});

/* ================================================================
   GET /pharmacy/doctors-list & /pharmacy/patients-list
   Helpers for the Create Modal
================================================================ */
router.get("/doctors-list", async (_req, res) => {
  try {
    const list = await prisma.doctorProfile.findMany({
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      take: 100 
    });
    const data = list.map(d => ({
      id: d.id, // DoctorProfile ID
      id: d.id, // DoctorProfile ID
      name: d.user ? `${d.user.firstName} ${d.user.lastName}`.trim() : "Unknown Doctor",
      email: d.user?.email
    }));
    res.json({ success: true, data });
  } catch(e) {
    res.status(500).json({ error: "Failed to load doctors" });
  }
});

router.get("/patients-list", async (_req, res) => {
  try {
    const list = await prisma.patientProfile.findMany({
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      take: 100
    });
    const data = list.map(p => ({
      id: p.id, // PatientProfile ID
      id: p.id, // PatientProfile ID
      name: p.user ? `${p.user.firstName} ${p.user.lastName}`.trim() : "Unknown Patient",
      email: p.user?.email
    }));
    res.json({ success: true, data });
  } catch(e) {
    res.status(500).json({ error: "Failed to load patients" });
  }
});

module.exports = router;
