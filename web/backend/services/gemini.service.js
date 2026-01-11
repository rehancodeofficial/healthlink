const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);

exports.generateAIResponse = async (userMessage) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables.");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      You are a smart medical assistant for "CureVirtual".
      User Message: "${userMessage}"

      Task:
      1. Analyze the symptoms or query.
      2. Recommend a medical specialist (e.g., Cardiologist, Dermatologist, General Physician). 
         - Ensure the specialty closely matches standard medical fields.
      3. Provide a helpful, empathetic response to the user.
      4. If it's an emergency, warn them explicitly.

      Return ONLY a JSON object (no markdown) with this format:
      {
        "specialty": "string",
        "reply": "string",
        "isEmergency": boolean
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up potential markdown code blocks
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini Service Error:", error);
    // Return a safe fallback rather than crashing
    return {
      specialty: "General Physician",
      reply: "I am having trouble processing your request right now. Please consult a General Physician.",
      isEmergency: false
    };
  }
};
