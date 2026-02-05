const geminiService = require("../services/gemini.service");
const prisma = require('../prisma/prismaClient');
const xss = require("xss");

exports.handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    
    // 1. Validate & Sanitize Input
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: "Message is required and must be a valid string." });
    }

    const sanitizedMessage = xss(message.trim());

    if (sanitizedMessage.length > 500) {
        return res.status(400).json({ error: "Message is too long. Max 500 characters." });
    }

    // 2. Get AI Analysis
    // ensure function name matches service export
    const aiData = await geminiService.generateAIResponse(sanitizedMessage);

    let doctors = [];

    // 3. Find Doctors based on identified specialty
    if (aiData.specialty) {
      doctors = await prisma.doctorProfile.findMany({
        where: {
          specialization: {
            contains: aiData.specialty, // Flexible matching
            // mode: 'insensitive', // Uncomment if your DB supports it (e.g., Postgres)
          },
        },
        include: {
          user: {
            select: { firstName: true, lastName: true },
          },
        },
        take: 3,
      });
    }

    // 4. Construct Final Response
    res.json({
      reply: aiData.reply,
      doctors: doctors,
      specialty: aiData.specialty,
      isEmergency: aiData.isEmergency
    });

  } catch (error) {
    console.error("Chatbot Controller Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
