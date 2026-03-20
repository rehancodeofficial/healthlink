const express = require("express");
const router = express.Router();
const prisma = require("../prisma/prismaClient");
const { verifyToken } = require("../middleware/rbac");

/**
 * GET /api/appointments/:id
 * Fetches appointment details including roomName for Jitsi.
 * Access control: Only the assigned doctor or patient can access.
 */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const appointment = await prisma.appointment.findUnique({
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

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Access Control: check if userId matches doctor.userId or patient.userId
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

module.exports = router;
