const express = require("express");
const router = express.Router();

// Get user notifications endpoint
router.get("/", (_req, res) => {
  res.json({ success: true, notifications: [] });
});

module.exports = router;
