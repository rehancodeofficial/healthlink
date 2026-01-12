const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

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

module.exports = router;
