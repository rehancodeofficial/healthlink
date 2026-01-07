const express = require("express");
const { PrismaClient } = require("@prisma/client");
const xss = require("xss");
const { verifyToken, requireRole } = require("../middleware/rbac");

const prisma = new PrismaClient();
const router = express.Router();

// ✅ Apply verification (Superadmin only for settings)
router.use(verifyToken);
router.use(requireRole("SUPERADMIN"));

// ✅ Fetch system settings
router.get("/", async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findFirst();
    res.json(settings || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// ✅ Update system settings
router.put("/", async (req, res) => {
  try {
    const { systemName, themeColor, logoUrl, defaultFee, monthlyPlan, yearlyPlan } = req.body;

    const parseOrNull = (val) => {
        if (val === "" || val === null || val === undefined) return null;
        const f = parseFloat(val);
        return isNaN(f) ? null : f;
    };

    const updateData = {
        systemName: systemName ? xss(systemName) : systemName,
        themeColor: themeColor ? xss(themeColor) : themeColor,
        logoUrl: logoUrl ? xss(logoUrl) : logoUrl,
        defaultFee: parseOrNull(defaultFee),
        monthlyPlan: parseOrNull(monthlyPlan),
        yearlyPlan: parseOrNull(yearlyPlan),
    };

    let settings = await prisma.systemSetting.findFirst();
    if (!settings) {
      settings = await prisma.systemSetting.create({
        data: updateData,
      });
    } else {
      settings = await prisma.systemSetting.update({
        where: { id: settings.id },
        data: updateData,
      });
    }

    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

module.exports = router;
