// FILE: backend/routes/videocall.js
const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const prisma = require("../prisma/prismaClient");
const { verifyToken, requireRole } = require("../middleware/rbac.js");

async function resolveDoctorProfileId({ doctorId, doctorUserId, callerUserId, role }) {
  // Prefer explicit DoctorProfile.id
  if (doctorId) {
    const d = await prisma.doctorProfile.findUnique({
      where: { id: String(doctorId) },
      select: { id: true },
    });
    if (d) return d.id;
    // If not found as profile, try as Doctor User.id
    const dByUser = await prisma.doctorProfile.findUnique({
      where: { userId: String(doctorId) },
      select: { id: true },
    });
    if (dByUser) return dByUser.id;
  }

  // doctorUserId explicitly provided
  if (doctorUserId) {
    const d = await prisma.doctorProfile.findUnique({
      where: { userId: String(doctorUserId) },
      select: { id: true },
    });
    if (d) return d.id;
  }

  // If caller is a doctor, infer from callerUserId
  if (role === "DOCTOR" && callerUserId) {
    const d = await prisma.doctorProfile.findUnique({
      where: { userId: String(callerUserId) },
      select: { id: true },
    });
    if (d) return d.id;
  }

  return null;
}

async function resolvePatientProfileId({ patientId, patientUserId, callerUserId, role }) {
  // Prefer explicit PatientProfile.id
  if (patientId) {
    const p = await prisma.patientProfile.findUnique({
      where: { id: String(patientId) },
      select: { id: true },
    });
    if (p) return p.id;
    // If not found as profile, try as Patient User.id
    const pByUser = await prisma.patientProfile.findUnique({
      where: { userId: String(patientId) },
      select: { id: true },
    });
    if (pByUser) return pByUser.id;
  }

  // patientUserId explicitly provided
  if (patientUserId) {
    const p = await prisma.patientProfile.findUnique({
      where: { userId: String(patientUserId) },
      select: { id: true },
    });
    if (p) return p.id;
  }

  // If caller is a patient, infer from callerUserId
  if (role === "PATIENT" && callerUserId) {
    const p = await prisma.patientProfile.findUnique({
      where: { userId: String(callerUserId) },
      select: { id: true },
    });
    if (p) return p.id;
  }

  return null;
}

router.post("/create", verifyToken, async (req, res) => {
  try {
    const {
      role,
      userId, // caller
      doctorId,
      doctorUserId,
      patientId,
      patientUserId,
      scheduledAt,
      durationMins,
    } = req.body || {};

    if (!scheduledAt) {
      return res.status(400).json({ error: "scheduledAt is required" });
    }
    const when = new Date(scheduledAt);
    if (Number.isNaN(when.getTime())) {
      return res.status(400).json({ error: "scheduledAt is not a valid date" });
    }

    const callerUserId = userId;

    // Resolve both sides to Profile IDs, regardless of which IDs were provided
    const doctorProfileId = await resolveDoctorProfileId({
      doctorId,
      doctorUserId,
      callerUserId,
      role,
    });
    const patientProfileId = await resolvePatientProfileId({
      patientId,
      patientUserId,
      callerUserId,
      role,
    });

    if (!doctorProfileId || !patientProfileId) {
      return res.status(400).json({
        error: "doctorId and patientId must resolve to valid profiles",
        details: { doctorProfileId, patientProfileId },
      });
    }

    const created = await prisma.videoConsultation.create({
      data: {
        doctorId: doctorProfileId,
        patientId: patientProfileId,
        scheduledAt: when,
        durationMins: Number(durationMins) || 30,
        status: "SCHEDULED",
      },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
    });

    return res.status(201).json({ success: true, data: created });
  } catch (e) {
    console.error("POST /videocall/create error:", e);
    return res.status(500).json({ error: "Failed to create consultation" });
  }
});

router.get("/list", verifyToken, async (req, res) => {
  try {
    const { userId, role } = req.query;

    if (!userId || !role) {
      return res.status(400).json({ error: "userId and role are required" });
    }

    let filter = {};

    if (role === "DOCTOR") {
      const doc = await prisma.doctorProfile.findUnique({
        where: { userId: String(userId) },
        select: { id: true },
      });
      if (!doc) return res.json({ success: true, data: [] });
      filter.doctorId = doc.id;
    } else if (role === "PATIENT") {
      const pat = await prisma.patientProfile.findUnique({
        where: { userId: String(userId) },
        select: { id: true },
      });
      if (!pat) return res.json({ success: true, data: [] });
      filter.patientId = pat.id;
    } else {
      return res.status(400).json({ error: "Invalid role" });
    }

    const consults = await prisma.videoConsultation.findMany({
      where: filter,
      orderBy: { scheduledAt: "desc" },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
    });

    return res.json({ success: true, data: consults });
  } catch (err) {
    console.error(" Error fetching consultations:", err);
    return res.status(500).json({ error: "Failed to fetch consultations" });
  }
});

router.post("/room-name", verifyToken, async (req, res) => {
  try {
    //  Generate a ZEGO room name
    const roomName = `consult-${crypto.randomUUID()}`;
    return res.json({ success: true, roomName });
  } catch (err) {
    console.error(" Error generating room name:", err);
    return res.status(500).json({ error: "Failed to generate room name" });
  }
});

router.put("/status/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, failureReason, recordingUrl } = req.body || {};

    const valid = ["SCHEDULED", "ONGOING", "COMPLETED", "CANCELLED", "FAILED"];
    if (!valid.includes(String(status))) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const updateData = { status: String(status) };

    if (status === "ONGOING") {
      updateData.actualStartTime = new Date();
    } else if (status === "COMPLETED" || status === "CANCELLED" || status === "FAILED") {
      updateData.actualEndTime = new Date();
    }

    if (failureReason) {
      updateData.failureReason = failureReason;
    }
    if (recordingUrl) {
      updateData.recordingUrl = recordingUrl;
    }

    const updated = await prisma.videoConsultation.update({
      where: { id: String(id) },
      data: updateData,
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error(" Error updating consultation status:", err);
    return res.status(500).json({ error: "Failed to update consultation" });
  }
});

router.patch("/cancel/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const cancelled = await prisma.videoConsultation.update({
      where: { id: String(id) },
      data: { status: "CANCELLED" },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
    });
    return res.json({ success: true, data: cancelled });
  } catch (err) {
    console.error(" Error cancelling consultation:", err);
    return res.status(500).json({ error: "Failed to cancel consultation" });
  }
});

router.patch("/reschedule/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledAt, durationMins } = req.body || {};
    if (!scheduledAt && durationMins == null) {
      return res.status(400).json({ error: "Provide scheduledAt and/or durationMins" });
    }

    const data = {};
    if (scheduledAt) {
      const when = new Date(scheduledAt);
      if (Number.isNaN(when.getTime())) {
        return res.status(400).json({ error: "scheduledAt is not a valid date" });
      }
      data.scheduledAt = when;
    }
    if (durationMins != null) {
      data.durationMins = Number(durationMins);
    }

    const updated = await prisma.videoConsultation.update({
      where: { id: String(id) },
      data,
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error(" Error rescheduling consultation:", err);
    return res.status(500).json({ error: "Failed to reschedule consultation" });
  }
});

module.exports = router;
