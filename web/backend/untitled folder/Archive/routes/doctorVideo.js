const express = require('express');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const twilio = require('twilio');

const router = express.Router();
const prisma = new PrismaClient();

// ====================
// 🔐 Twilio Credentials
// ====================
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_API_KEY_SID = process.env.TWILIO_API_KEY_SID;
const TWILIO_API_KEY_SECRET = process.env.TWILIO_API_KEY_SECRET;

if (!TWILIO_ACCOUNT_SID || !TWILIO_API_KEY_SID || !TWILIO_API_KEY_SECRET) {
  console.warn('⚠️ Missing Twilio credentials in .env');
}

// ==================================
// 🎥 Generate Twilio Access Token
// ==================================
router.get('/token', async (req, res) => {
  try {
    const { identity, roomName } = req.query;
    if (!identity || !roomName)
      return res.status(400).json({ error: 'identity and roomName required' });

    const AccessToken = twilio.jwt.AccessToken;
    const VideoGrant = AccessToken.VideoGrant;

    const token = new AccessToken(
      TWILIO_ACCOUNT_SID,
      TWILIO_API_KEY_SID,
      TWILIO_API_KEY_SECRET,
      { identity }
    );

    token.addGrant(new VideoGrant({ room: roomName }));
    res.json({ token: token.toJwt() });
  } catch (err) {
    console.error('Error generating Twilio token:', err);
    res.status(500).json({ error: 'Failed to generate Twilio token' });
  }
});

// ==================================
// 📅 Create a New Video Consultation
// ==================================
router.post('/doctor/video-consultations', async (req, res) => {
  try {
    const { doctorId, patientId, title, scheduledAt, durationMins, notes } =
      req.body;

    if (!doctorId || !patientId || !scheduledAt) {
      return res.status(400).json({ message: 'Missing required fields' });
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
        message: 'Doctor or patient profile not found',
        doctorFound: !!doctorProfile,
        patientFound: !!patientProfile,
      });
    }

    // ✅ Generate a Twilio room name
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
        status: 'SCHEDULED',
      },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
    });

    res.json(newConsultation);
  } catch (err) {
    console.error('❌ Error scheduling consultation:', err);
    res.status(500).json({
      message: 'Failed to schedule consultation',
      error: err.message,
    });
  }
});

// ==================================
// 📋 Get Doctor’s Video Consultations
// ==================================
router.get('/doctor/video-consultations', async (req, res) => {
  try {
    const doctorId = req.query.doctorId;
    if (!doctorId)
      return res.status(400).json({ message: 'Doctor ID required' });

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId },
    });

    if (!doctorProfile)
      return res.status(404).json({ message: 'Doctor profile not found' });

    const consultations = await prisma.videoConsultation.findMany({
      where: { doctorId: doctorProfile.id },
      include: {
        patient: { include: { user: true } },
      },
      orderBy: { scheduledAt: 'desc' },
    });

    res.json(consultations);
  } catch (err) {
    console.error('❌ Error fetching consultations:', err);
    res.status(500).json({ message: 'Failed to fetch consultations' });
  }
});

// ==================================
// ❌ Cancel a Consultation
// ==================================
router.patch('/doctor/video-consultations/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await prisma.videoConsultation.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    res.json(updated);
  } catch (err) {
    console.error('Error cancelling consultation:', err);
    res.status(500).json({ message: 'Failed to cancel consultation' });
  }
});

// ==================================
// ✅ Mark as Completed
// ==================================
router.patch('/doctor/video-consultations/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await prisma.videoConsultation.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });

    res.json(updated);
  } catch (err) {
    console.error('Error completing consultation:', err);
    res.status(500).json({ message: 'Failed to complete consultation' });
  }
});

module.exports = router;
