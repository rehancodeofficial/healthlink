const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
  { apiVersion: 'v1' }
);

exports.generateAIResponse = async (userMessage) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables.");
    }

    // Using gemini-1.5-flash as it is supported in v1
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a smart medical assistant for "CureVirtual".
      User Message: "${userMessage}"

      Task:
      1. Analyze the symptoms or query.
      2. Recommend a medical specialist. 
         - Our available specialties are: General Medicine, General Practice, Ophthalmology, Dentistry.
         - Choose the closest match.
      3. Provide a helpful, empathetic response to the user.
      4. If it's an emergency, warn them explicitly.

      CRITICAL: Return ONLY a valid JSON object. No preamble, no markdown formatting.
      Format:
      {
        "specialty": "string",
        "reply": "string",
        "isEmergency": boolean
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up potential markdown code blocks and extra chatter
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Find first { and last } to isolate JSON if AI added chatter
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }
    
    try {
      return JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", cleanText);
      throw new Error(`Invalid AI response format: ${cleanText.substring(0, 100)}`);
    }
  } catch (error) {
    console.error("Gemini Service Error:", error);
    throw error; // Rethrow to be caught by controller with full details
  }
};
