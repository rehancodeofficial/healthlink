// FILE: backend/routes/patientDoctors.js

const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { verifyToken, requireRole, verifyOwnerOrAdmin } = require("../middleware/rbac.js");
const prisma = new PrismaClient();

/** Helpers */
async function getPatientProfileByUserId(patientUserId) {
  if (!patientUserId) return null;
  return prisma.patientProfile.findUnique({ where: { userId: String(patientUserId) } });
}
function buildDoctorFilters(q) {
  const {
    search,                 // name or specialization
    specialization,
    minExperience,
    maxExperience,
    minFee,
    maxFee,
    language,               // substring match inside CSV/longText
  } = q;

  const where = {};
  if (specialization) where.specialization = { contains: String(specialization), mode: "insensitive" };
  if (minExperience || maxExperience) {
    where.yearsOfExperience = {};
    if (minExperience) where.yearsOfExperience.gte = Number(minExperience);
    if (maxExperience) where.yearsOfExperience.lte = Number(maxExperience);
  }
  if (minFee || maxFee) {
    where.consultationFee = {};
    if (minFee) where.consultationFee.gte = Number(minFee);
    if (maxFee) where.consultationFee.lte = Number(maxFee);
  }
  if (language) {
    where.languages = { contains: String(language), mode: "insensitive" };
  }
  if (search) {
    // Search firstName/lastName (from user) OR specialization
    where.OR = [
      { specialization: { contains: String(search), mode: "insensitive" } },
      { 
        user: { 
          OR: [
            { firstName: { contains: String(search), mode: "insensitive" } },
            { lastName: { contains: String(search), mode: "insensitive" } },
          ]
        } 
      },
    ];
  }
  return where;
}

/** ============================
 *  GET /api/patient/doctors/all
 *  Public list for Patients (with filters)
 *  Query: search, specialization, minExperience, maxExperience, minFee, maxFee, language
 *  ============================ */
router.get("/patient/doctors/all", async (req, res) => {
  try {
    const where = buildDoctorFilters(req.query);
    const doctors = await prisma.doctorProfile.findMany({
      where,
      orderBy: [{ yearsOfExperience: "desc" }, { consultationFee: "asc" }],
      include: { 
        user: true,
        schedules: {
          where: { isActive: true }
        }
      },
    });
    return res.json({ data: doctors });
  } catch (err) {
    console.error("❌ list all doctors:", err);
    return res.status(500).json({ error: "Failed to load doctors" });
  }
});


/** =========================================
 *  GET /api/patient/doctors (assigned)
 *  Query: patientUserId
 *  Returns only doctors assigned to the patient
 *  ========================================= */
router.get("/patient/doctors", verifyToken, async (req, res) => {
  try {
    const { patientUserId } = req.query;
    if (!patientUserId) return res.status(400).json({ error: "patientUserId is required" });
    const patient = await getPatientProfileByUserId(patientUserId);
    if (!patient) return res.status(404).json({ error: "Patient profile not found" });

    const links = await prisma.doctorPatient.findMany({
      where: { patientId: patient.id },
      include: { 
        doctor: { 
          include: { 
            user: true,
            schedules: {
              where: { isActive: true }
            }
          } 
        } 
      },
      orderBy: { createdAt: "desc" },
    });

    const doctors = links.map((l) => l.doctor);
    return res.json({ data: doctors });
  } catch (err) {
    console.error("❌ list assigned doctors:", err);
    return res.status(500).json({ error: "Failed to load assigned doctors" });
  }
});


/** =========================================
 *  POST /api/patient/doctors/assign
 *  Body: { patientUserId, doctorProfileId }
 *  Creates link if not exists (idempotent)
 *  ========================================= */
router.post("/patient/doctors/assign", verifyToken, async (req, res) => {
  try {
    const { patientUserId, doctorProfileId } = req.body || {};
    if (!patientUserId || !doctorProfileId) {
      return res.status(400).json({ error: "patientUserId and doctorProfileId are required" });
    }
    const patient = await getPatientProfileByUserId(patientUserId);
    if (!patient) return res.status(404).json({ error: "Patient profile not found" });

    // confirm doctor profile exists
    const doctor = await prisma.doctorProfile.findUnique({ where: { id: String(doctorProfileId) } });
    if (!doctor) return res.status(404).json({ error: "Doctor profile not found" });

    // upsert-like: try create, on unique conflict fetch existing
    let link;
    try {
      link = await prisma.doctorPatient.create({
        data: { patientId: patient.id, doctorId: doctor.id },
      });
    } catch {
      link = await prisma.doctorPatient.findFirst({
        where: { patientId: patient.id, doctorId: doctor.id },
      });
    }

    return res.json({ success: true, linkId: link.id });
  } catch (err) {
    console.error("❌ assign doctor:", err);
    return res.status(500).json({ error: "Failed to assign doctor" });
  }
});

/** (Optional unassign)
router.delete("/patient/doctors/assign/:doctorProfileId", async (req, res) => {
  try {
    const { doctorProfileId } = req.params;
    const { patientUserId } = req.query;
    if (!patientUserId || !doctorProfileId) {
      return res.status(400).json({ error: "patientUserId and doctorProfileId are required" });
    }
    const patient = await getPatientProfileByUserId(patientUserId);
    if (!patient) return res.status(404).json({ error: "Patient profile not found" });

    await prisma.doctorPatient.deleteMany({
      where: { patientId: patient.id, doctorId: String(doctorProfileId) },
    });
    return res.json({ success: true });
  } catch (err) {
    console.error("❌ unassign doctor:", err);
    return res.status(500).json({ error: "Failed to unassign doctor" });
  }
});
*/

module.exports = router;
