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

module.exports = router;
