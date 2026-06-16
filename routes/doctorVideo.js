const express = require("express");
const crypto = require("crypto");

const router = express.Router();
const prisma = require("../prisma/prismaClient");
const emailService = require("../services/emailService");

// ==================================
// 📅 Create a New Video Consultation
// ==================================
router.post("/doctor/video-consultations", async (req, res) => {
  try {
    const { doctorId, patientId, title, scheduledAt, durationMins, notes } =
      req.body;

    if (!doctorId || !patientId || !scheduledAt) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Resolve the DoctorProfile & PatientProfile IDs
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId },
    });
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: patientId },
    });

    if (!doctorProfile || !patientProfile) {
      return res.status(400).json({
        message: "Doctor or patient profile not found",
        doctorFound: !!doctorProfile,
        patientFound: !!patientProfile,
      });
    }

    // ✅ Generate a ZEGO room name
    const roomName = `consult-${crypto.randomUUID()}`;

    // ✅ Create the consultation record
    const newConsultation = await prisma.videoConsultation.create({
      data: {
        doctorId: doctorProfile.id,
        patientId: patientProfile.id,
        title,
        scheduledAt: new Date(scheduledAt),
        durationMins: Number(durationMins) || 30,
        notes,
        meetingUrl: roomName,
        status: "SCHEDULED",
      },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
    });

    if (newConsultation.doctor?.user && newConsultation.patient?.user) {
      emailService
        .sendVideoConsultationConfirmation(
          newConsultation,
          newConsultation.patient.user,
          newConsultation.doctor.user,
        )
        .catch((err) =>
          console.error("Failed to send video consultation emails:", err),
        );
    }

    res.json(newConsultation);
  } catch (err) {
    console.error("❌ Error scheduling consultation:", err);
    res.status(500).json({
      message: "Failed to schedule consultation",
      error: err.message,
    });
  }
});

// ==================================
// 📋 Get Doctor's Video Consultations
// ==================================
router.get("/doctor/video-consultations", async (req, res) => {
  try {
    const doctorId = req.query.doctorId;
    if (!doctorId)
      return res.status(400).json({ message: "Doctor ID required" });

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId },
    });

    if (!doctorProfile)
      return res.status(404).json({ message: "Doctor profile not found" });

    const consultations = await prisma.videoConsultation.findMany({
      where: { doctorId: doctorProfile.id },
      include: {
        patient: { include: { user: true } },
      },
      orderBy: { scheduledAt: "desc" },
    });

    res.json(consultations);
  } catch (err) {
    console.error("❌ Error fetching consultations:", err);
    res.status(500).json({ message: "Failed to fetch consultations" });
  }
});

// ==================================
// ❌ Cancel a Consultation
// ==================================
router.patch("/doctor/video-consultations/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await prisma.videoConsultation.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    res.json(updated);
  } catch (err) {
    console.error("Error cancelling consultation:", err);
    res.status(500).json({ message: "Failed to cancel consultation" });
  }
});

// ==================================
// ✅ Mark as Completed
// ==================================
router.patch("/doctor/video-consultations/:id/complete", async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await prisma.videoConsultation.update({
      where: { id },
      data: { status: "COMPLETED" },
    });

    res.json(updated);
  } catch (err) {
    console.error("Error completing consultation:", err);
    res.status(500).json({ message: "Failed to complete consultation" });
  }
});

module.exports = router;
