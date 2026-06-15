const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const chatbotController = require("../controllers/chatbot.controller");

// Rate Limiter: Max 5 requests per minute
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
  message: { error: "Too many requests, please try again later." },
});

router.post("/chat", chatLimiter, chatbotController.handleChat);

module.exports = router;