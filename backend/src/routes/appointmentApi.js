const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const prisma = require("../prisma/prismaClient");
const { verifyToken } = require("../middleware/rbac");

/* ============================================================
   Helper: Fetch appointment with doctor/patient user info
   ============================================================ */
async function getAppointmentWithUsers(id) {
  return prisma.appointment.findUnique({
    where: { id },
    include: {
      doctor: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      },
      patient: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
  });
}

/* ============================================================
   GET /api/appointments/:id
   Fetches appointment details including roomName & callStatus.
   Access control: Only the assigned doctor or patient.
   ============================================================ */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const appointment = await getAppointmentWithUsers(id);

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const isDoctor = appointment.doctor.user.id === userId;
    const isPatient = appointment.patient.user.id === userId;

    if (!isDoctor && !isPatient) {
      return res
        .status(403)
        .json({ error: "You are not authorized to access this appointment" });
    }

    return res.json({
      id: appointment.id,
      doctorId: appointment.doctorId,
      doctorUserId: appointment.doctor.user.id,
      patientId: appointment.patientId,
      patientUserId: appointment.patient.user.id,
      roomName: appointment.roomName,
      callStatus: appointment.callStatus,
      appointmentDate: appointment.appointmentDate,
      status: appointment.status,
      doctorName: `${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`,
      patientName: `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`,
    });
  } catch (err) {
    console.error("❌ GET /api/appointments/:id error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* ============================================================
   POST /api/appointments/:id/start-call
   Doctor initiates a call → callStatus = "requested"
   ============================================================ */
router.post("/:id/start-call", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const appointment = await getAppointmentWithUsers(id);

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Only the assigned doctor can start a call
    if (appointment.doctor.user.id !== userId) {
      return res
        .status(403)
        .json({ error: "Only the assigned doctor can start this call" });
    }

    // Validate call state
    if (appointment.callStatus === "requested") {
      return res
        .status(400)
        .json({
          error: "Call already requested — waiting for patient to join",
        });
    }
    if (appointment.callStatus === "active") {
      return res.status(400).json({ error: "Call already in progress" });
    }

    // Generate room name if not present
    const roomName =
      appointment.roomName ||
      `appointment-${appointment.id}-${crypto.randomUUID().slice(0, 8)}`;

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        callStatus: "requested",
        roomName,
      },
    });

    return res.json({
      success: true,
      callStatus: updated.callStatus,
      roomName: updated.roomName,
      message: "Call request sent to patient",
    });
  } catch (err) {
    console.error("❌ POST /api/appointments/:id/start-call error:", err);
    return res.status(500).json({ error: "Failed to start call" });
  }
});

/* ============================================================
   GET /api/appointments/:id/status
   Poll current callStatus (for patient notification system)
   ============================================================ */
router.get("/:id/status", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const appointment = await getAppointmentWithUsers(id);

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const isDoctor = appointment.doctor.user.id === userId;
    const isPatient = appointment.patient.user.id === userId;

    if (!isDoctor && !isPatient) {
      return res
        .status(403)
        .json({ error: "Not authorized to view this appointment status" });
    }

    return res.json({
      appointmentId: appointment.id,
      callStatus: appointment.callStatus,
      roomName: appointment.roomName,
    });
  } catch (err) {
    console.error("❌ GET /api/appointments/:id/status error:", err);
    return res.status(500).json({ error: "Failed to get call status" });
  }
});

/* ============================================================
   POST /api/appointments/:id/join-call
   Patient accepts the call → callStatus = "active"
   ============================================================ */
router.post("/:id/join-call", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const appointment = await getAppointmentWithUsers(id);

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Only the assigned patient can join
    if (appointment.patient.user.id !== userId) {
      return res
        .status(403)
        .json({ error: "Only the assigned patient can join this call" });
    }

    // Must be in "requested" or "active" state
    if (appointment.callStatus === "idle") {
      return res
        .status(400)
        .json({ error: "Doctor has not started the call yet" });
    }
    if (appointment.callStatus === "ended") {
      return res
        .status(400)
        .json({ error: "This call session has already ended" });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { callStatus: "active" },
    });

    return res.json({
      success: true,
      callStatus: updated.callStatus,
      roomName: updated.roomName,
    });
  } catch (err) {
    console.error("❌ POST /api/appointments/:id/join-call error:", err);
    return res.status(500).json({ error: "Failed to join call" });
  }
});

/* ============================================================
   POST /api/appointments/:id/end-call
   Either party ends the call → callStatus = "ended"
   ============================================================ */
router.post("/:id/end-call", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const appointment = await getAppointmentWithUsers(id);

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const isDoctor = appointment.doctor.user.id === userId;
    const isPatient = appointment.patient.user.id === userId;

    if (!isDoctor && !isPatient) {
      return res.status(403).json({ error: "Not authorized to end this call" });
    }

    if (appointment.callStatus === "idle") {
      return res.status(400).json({ error: "No active call to end" });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { callStatus: "ended" },
    });

    return res.json({
      success: true,
      callStatus: updated.callStatus,
      message: "Call ended successfully",
    });
  } catch (err) {
    console.error("❌ POST /api/appointments/:id/end-call error:", err);
    return res.status(500).json({ error: "Failed to end call" });
  }
});

module.exports = router;
