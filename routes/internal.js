const express = require('express');
const prisma = require('../prisma/prismaClient');
const router = express.Router();
const { main: runSeed } = require('../prisma/seed');

// Internal endpoint for chatbot to fetch doctor data
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await prisma.doctorProfile.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        schedules: {
          where: { isActive: true },
          select: {
            dayOfWeek: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    });

    const formattedDoctors = doctors.map((doc) => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const scheduleSummary = doc.schedules.map(s => 
        `${days[s.dayOfWeek]}: ${s.startTime}-${s.endTime}`
      ).join(', ') || 'No fixed schedule available';

      return {
        name: `Dr. ${doc.user.firstName} ${doc.user.lastName}`,
        specialization: doc.specialization,
        experience: doc.yearsOfExperience,
        fee: doc.consultationFee,
        availability: scheduleSummary,
        bio: doc.bio
      };
    });

    res.json(formattedDoctors);
  } catch (error) {
    console.error('Error fetching internal doctor data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// NEW: Endpoint to trigger seeding in production
router.post('/seed', async (req, res) => {
  try {
    const secret = req.headers['x-seed-secret'];
    const expectedSecret = process.env.SEED_SECRET || 'curevirtual_secret_123';

    if (secret !== expectedSecret) {
      return res.status(403).json({ error: 'Unauthorized: Invalid seed secret' });
    }

    console.log('🚀 Remote seed triggered...');
    await runSeed();
    
    res.json({ message: 'Seed completed successfully' });
  } catch (error) {
    console.error('❌ Remote seed error:', error);
    res.status(500).json({ error: 'Seed failed', details: error.message });
  }
});

// NEW: Endpoint to check actual DB columns (Production only debug)
router.get('/debug-schema', async (req, res) => {
  try {
    const table = req.query.table || 'DoctorProfile';
    const columns = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = '${table}'
    `);
    res.json({ table, columns });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// NEW: Endpoint to manually add missing columns if migrate deploy fails
router.post('/fix-schema', async (req, res) => {
  try {
    const secret = req.headers['x-seed-secret'];
    const expectedSecret = process.env.SEED_SECRET || 'curevirtual_secret_123';
    if (secret !== expectedSecret) return res.status(403).json({ error: 'Unauthorized' });

    console.log('🛠️ Manual schema fix triggered...');
    
    // Add missing cols to DoctorProfile
    await prisma.$executeRawUnsafe(`ALTER TABLE "DoctorProfile" ADD COLUMN IF NOT EXISTS "emergencyContact" TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "DoctorProfile" ADD COLUMN IF NOT EXISTS "emergencyContactName" TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "DoctorProfile" ADD COLUMN IF NOT EXISTS "emergencyContactEmail" TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "DoctorProfile" ADD COLUMN IF NOT EXISTS "customProfession" TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "DoctorProfile" ADD COLUMN IF NOT EXISTS "primaryContact" TEXT`);

    // Add missing cols to PatientProfile if any
    await prisma.$executeRawUnsafe(`ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "emergencyContactName" TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "emergencyContactEmail" TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "heightUnit" TEXT DEFAULT 'cm'`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "weightUnit" TEXT DEFAULT 'kg'`);

    res.json({ message: 'Schema fix applied successfully' });
  } catch (error) {
    console.error('❌ Schema fix error:', error);
    res.status(500).json({ error: error.message });
  }
});

const geminiService = require('../services/gemini.service');

// NEW: Test Gemini connectivity
router.get('/test-gemini', async (req, res) => {
  try {
    const testResult = await geminiService.generateAIResponse("Hello, this is a test.");
    res.json({ success: true, result: testResult });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// NEW: List available models via raw REST
router.get('/list-models', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const version = req.query.v || 'v1beta';
    const url = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;
    
    const response = await axios.get(url);
    res.json({ success: true, models: response.data.models });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.response ? error.response.data : 'No response data'
    });
  }
});

const axios = require('axios');

// NEW: Test Gemini via raw REST (to bypass SDK version issues)
router.get('/test-raw-gemini', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const version = req.query.v || 'v1';
    const model = req.query.m || 'gemini-1.5-flash';
    
    const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`;
    
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: "Hello" }] }]
    });
    
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.response ? error.response.data : 'No response data'
    });
  }
});

// NEW: Debug env vars presence
router.get('/debug-env', (req, res) => {
  res.json({
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    hasGoogleKey: !!process.env.GOOGLE_API_KEY,
    geminiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
    googleKeyLength: process.env.GOOGLE_API_KEY ? process.env.GOOGLE_API_KEY.length : 0,
    nodeEnv: process.env.NODE_ENV
  });
});

module.exports = router;
