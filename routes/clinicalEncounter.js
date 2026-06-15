const express = require("express");
const { verifyToken, requireRole } = require("../middleware/rbac.js");
const prisma = require('../prisma/prismaClient');

const router = express.Router();

// Apply RBAC
router.use(verifyToken);
router.use(requireRole(["DOCTOR", "ADMIN", "SUPERADMIN"]));

/**
 * GET /api/clinical-encounter/:appointmentId
 * Fetch or create a clinical encounter for an appointment.
 */
router.get("/:appointmentId", async (req, res) => {
  try {
    const { appointmentId } = req.params;

    let encounter = await prisma.clinicalEncounter.findUnique({
      where: { appointmentId },
      include: {
        prescriptions: true,
        labOrders: true,
        referrals: true,
      },
    });

    if (!encounter) {
      // Fetch appointment to get doctor/patient IDs
      const apt = await prisma.appointment.findUnique({
        where: { id: appointmentId },
      });

      if (!apt) {
        return res.status(404).json({ error: "Appointment not found" });
      }

      // Create new draft encounter
      encounter = await prisma.clinicalEncounter.create({
        data: {
          appointmentId,
          doctorId: apt.doctorId,
          patientId: apt.patientId,
          status: "DRAFT",
        },
        include: {
          prescriptions: true,
          labOrders: true,
          referrals: true,
        },
      });
    }

    return res.json(encounter);
  } catch (err) {
    console.error("Clinical Encounter GET error:", err);
    return res.status(500).json({ error: "Failed to load encounter" });
  }
});

/**
 * PATCH /api/clinical-encounter/:id
 * Update clinical encounter (SOAP, Vitals, etc.)
 */
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      subjective, objective, assessment, plan,
      systolic, diastolic, pulse, temperature, weight, oxygenSat,
      status
    } = req.body;

    const updated = await prisma.clinicalEncounter.update({
      where: { id },
      data: {
        subjective, objective, assessment, plan,
        systolic: systolic ? parseInt(systolic) : undefined,
        diastolic: diastolic ? parseInt(diastolic) : undefined,
        pulse: pulse ? parseInt(pulse) : undefined,
        temperature: temperature ? parseFloat(temperature) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        oxygenSat: oxygenSat ? parseInt(oxygenSat) : undefined,
        status,
        signedAt: status === "SIGNED" ? new Date() : undefined,
      },
    });

    return res.json(updated);
  } catch (err) {
    console.error("Clinical Encounter PATCH error:", err);
    return res.status(500).json({ error: "Failed to update encounter" });
  }
});

/**
 * POST /api/clinical-encounter/:id/labs
 * Order labs during encounter
 */
router.post("/:id/labs", async (req, res) => {
  try {
    const { id } = req.params;
    const { testName } = req.body;

    const encounter = await prisma.clinicalEncounter.findUnique({ where: { id } });
    if (!encounter) return res.status(404).json({ error: "Encounter not found" });

    const labOrder = await prisma.labOrder.create({
      data: {
        encounterId: id,
        doctorId: encounter.doctorId,
        patientId: encounter.patientId,
        testName,
        status: "ORDERED",
      },
    });

    return res.status(201).json(labOrder);
  } catch (err) {
    console.error("Lab Order POST error:", err);
    return res.status(500).json({ error: "Failed to order lab" });
  }
});

/**
 * POST /api/clinical-encounter/:id/referral
 * Create referral during encounter
 */
router.post("/:id/referral", async (req, res) => {
  try {
    const { id } = req.params;
    const { type, specialistName, targetDoctorId, reason } = req.body;

    const encounter = await prisma.clinicalEncounter.findUnique({ where: { id } });
    if (!encounter) return res.status(404).json({ error: "Encounter not found" });

    const referral = await prisma.referral.create({
      data: {
        encounterId: id,
        doctorId: encounter.doctorId,
        patientId: encounter.patientId,
        type,
        specialistName,
        targetDoctorId,
        reason,
        status: "PENDING",
      },
    });

    return res.status(201).json(referral);
  } catch (err) {
    console.error("Referral POST error:", err);
    return res.status(500).json({ error: "Failed to create referral" });
  }
});

module.exports = router;
