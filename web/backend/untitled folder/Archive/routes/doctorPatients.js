
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { verifyToken, requireRole, verifyOwnerOrAdmin } = require("../middleware/rbac.js");
const prisma = new PrismaClient();

/** Helpers */
async function getDoctorProfileByUserId(doctorUserId) {
  if (!doctorUserId) return null;
  return prisma.doctorProfile.findUnique({ where: { userId: String(doctorUserId) } });
}

function dobRangeFromAges(minAge, maxAge) {
  // Age X => DOB <= today - X years (older)
  // Age Y => DOB >= today - Y years (younger)
  const now = new Date();
  let gte, lte;
  if (maxAge) {
    gte = new Date(now);
    gte.setFullYear(gte.getFullYear() - Number(maxAge));
  }
  if (minAge) {
    lte = new Date(now);
    lte.setFullYear(lte.getFullYear() - Number(minAge));
  }
  return { gte, lte };
}

function buildPatientWhere(q, doctorProfileId) {
  const { search, gender, bloodGroup, minAge, maxAge } = q;
  const where = {
    doctorLinks: { some: { doctorId: doctorProfileId } }, // assigned to this doctor
  };

  if (gender) where.gender = String(gender);
  if (bloodGroup) where.bloodGroup = String(bloodGroup);

  if (minAge || maxAge) {
    const { gte, lte } = dobRangeFromAges(minAge, maxAge);
    where.dateOfBirth = {};
    if (gte) where.dateOfBirth.gte = gte; // younger than or equal to maxAge
    if (lte) where.dateOfBirth.lte = lte; // older than or equal to minAge
  }

  if (search) {
    where.OR = [
      { user: { name: { contains: String(search), mode: "insensitive" } } },
      { medicalRecordNumber: { contains: String(search), mode: "insensitive" } },
      { address: { contains: String(search), mode: "insensitive" } },
    ];
  }

  return where;
}


/**
 * GET /api/doctor/patients
 * Query:
 *   - doctorUserId (required)
 *   - search, gender, bloodGroup, minAge, maxAge (optional)
 * Returns PatientProfile[] with user info
 */
router.get("/doctor/patients", verifyToken, requireRole(["DOCTOR", "ADMIN", "SUPERADMIN"]), async (req, res) => {
  try {
    const { doctorUserId } = req.query;
    if (!doctorUserId) return res.status(400).json({ error: "doctorUserId is required" });

    const doctor = await getDoctorProfileByUserId(doctorUserId);
    if (!doctor) return res.status(404).json({ error: "Doctor profile not found" });

    const where = buildPatientWhere(req.query, doctor.id);

    const patients = await prisma.patientProfile.findMany({
      where,
      include: { user: true },
      orderBy: [{ createdAt: "desc" }],
    });

    return res.json({ data: patients });
  } catch (err) {
    console.error("❌ /doctor/patients error:", err);
    return res.status(500).json({ error: "Failed to load patients" });
  }
});

module.exports = router;
