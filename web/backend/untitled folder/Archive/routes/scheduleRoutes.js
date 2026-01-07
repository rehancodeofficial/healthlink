// FILE: backend/routes/scheduleRoutes.js
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { verifyToken, requireRole } = require("../middleware/rbac.js");

const prisma = new PrismaClient();
const router = express.Router();

// Apply RBAC to all schedule routes
router.use(verifyToken);

/**
 * Helper: Get DoctorProfile.id from User.id
 */
async function getDoctorProfileId(userId) {
  const profile = await prisma.doctorProfile.findUnique({
    where: { userId: String(userId) },
    select: { id: true },
  });
  return profile?.id || null;
}

/**
 * Helper: Check for time conflicts
 */
function hasTimeConflict(start1, end1, start2, end2) {
  // Convert "HH:MM" to minutes for comparison
  const toMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };
  
  const s1 = toMinutes(start1);
  const e1 = toMinutes(end1);
  const s2 = toMinutes(start2);
  const e2 = toMinutes(end2);
  
  // Check if intervals overlap
  return s1 < e2 && s2 < e1;
}

/**
 * POST /api/schedule
 * Create a new availability slot
 * Body: { doctorId: User.id, dayOfWeek: 0-6, startTime: "HH:MM", endTime: "HH:MM", isActive?: boolean }
 */
router.post("/", requireRole(["DOCTOR", "ADMIN", "SUPERADMIN"]), async (req, res) => {
  try {
    const { doctorId, dayOfWeek, startTime, endTime, isActive, effectiveFrom, effectiveTo } = req.body;

    // Validation
    if (!doctorId || dayOfWeek == null || !startTime || !endTime) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({ error: "dayOfWeek must be between 0 (Sunday) and 6 (Saturday)" });
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({ error: "Invalid time format. Use HH:MM (24-hour)" });
    }

    // Get doctor profile ID
    const doctorProfileId = await getDoctorProfileId(doctorId);
    if (!doctorProfileId) {
      return res.status(404).json({ error: "Doctor profile not found" });
    }

    // Check for conflicts with existing schedules on the same day
    const existingSlots = await prisma.doctorSchedule.findMany({
      where: {
        doctorId: doctorProfileId,
        dayOfWeek: parseInt(dayOfWeek),
        isActive: true,
      },
    });

    for (const slot of existingSlots) {
      if (hasTimeConflict(startTime, endTime, slot.startTime, slot.endTime)) {
        return res.status(409).json({
          error: `Time conflict with existing slot: ${slot.startTime} - ${slot.endTime}`,
        });
      }
    }

    // Create schedule
    const schedule = await prisma.doctorSchedule.create({
      data: {
        doctorId: doctorProfileId,
        dayOfWeek: parseInt(dayOfWeek),
        startTime,
        endTime,
        isActive: isActive !== undefined ? isActive : true,
        effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : null,
        effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
      },
      include: {
        doctor: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
      },
    });

    return res.status(201).json({ success: true, data: schedule });
  } catch (err) {
    console.error("❌ POST /api/schedule error:", err);
    return res.status(500).json({ error: "Failed to create schedule" });
  }
});

/**
 * GET /api/schedule?doctorId=<User.id>
 * Get all schedules for a doctor
 */
router.get("/", async (req, res) => {
  try {
    const { doctorId } = req.query;

    if (!doctorId) {
      return res.status(400).json({ error: "doctorId is required" });
    }

    const doctorProfileId = await getDoctorProfileId(doctorId);
    if (!doctorProfileId) {
      return res.json({ success: true, data: [] });
    }

    const schedules = await prisma.doctorSchedule.findMany({
      where: { doctorId: doctorProfileId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    return res.json({ success: true, data: schedules });
  } catch (err) {
    console.error("❌ GET /api/schedule error:", err);
    return res.status(500).json({ error: "Failed to fetch schedules" });
  }
});

/**
 * PATCH /api/schedule/:id
 * Update a schedule slot
 */
router.patch("/:id", requireRole(["DOCTOR", "ADMIN", "SUPERADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { dayOfWeek, startTime, endTime, isActive, effectiveFrom, effectiveTo } = req.body;

    // Check if schedule exists
    const existing = await prisma.doctorSchedule.findUnique({
      where: { id },
      select: { id: true, doctorId: true, dayOfWeek: true },
    });

    if (!existing) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    // Validate time format if provided
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (startTime && !timeRegex.test(startTime)) {
      return res.status(400).json({ error: "Invalid startTime format. Use HH:MM" });
    }
    if (endTime && !timeRegex.test(endTime)) {
      return res.status(400).json({ error: "Invalid endTime format. Use HH:MM" });
    }

    // Check for conflicts if times are being updated
    if (startTime || endTime || dayOfWeek != null) {
      const checkDay = dayOfWeek != null ? parseInt(dayOfWeek) : existing.dayOfWeek;
      const checkStart = startTime || existing.startTime;
      const checkEnd = endTime || existing.endTime;

      const conflictingSlots = await prisma.doctorSchedule.findMany({
        where: {
          doctorId: existing.doctorId,
          dayOfWeek: checkDay,
          isActive: true,
          id: { not: id }, // Exclude current slot
        },
      });

      for (const slot of conflictingSlots) {
        if (hasTimeConflict(checkStart, checkEnd, slot.startTime, slot.endTime)) {
          return res.status(409).json({
            error: `Time conflict with existing slot: ${slot.startTime} - ${slot.endTime}`,
          });
        }
      }
    }

    // Update schedule
    const updated = await prisma.doctorSchedule.update({
      where: { id },
      data: {
        ...(dayOfWeek != null && { dayOfWeek: parseInt(dayOfWeek) }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
        ...(isActive !== undefined && { isActive }),
        ...(effectiveFrom && { effectiveFrom: new Date(effectiveFrom) }),
        ...(effectiveTo && { effectiveTo: new Date(effectiveTo) }),
      },
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error("❌ PATCH /api/schedule/:id error:", err);
    return res.status(500).json({ error: "Failed to update schedule" });
  }
});

/**
 * DELETE /api/schedule/:id
 * Delete a schedule slot
 */
router.delete("/:id", requireRole(["DOCTOR", "ADMIN", "SUPERADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.doctorSchedule.delete({
      where: { id },
    });

    return res.json({ success: true, message: "Schedule deleted successfully" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Schedule not found" });
    }
    console.error("❌ DELETE /api/schedule/:id error:", err);
    return res.status(500).json({ error: "Failed to delete schedule" });
  }
});

/**
 * GET /api/schedule/available-slots/:doctorProfileId?date=YYYY-MM-DD
 * Get available time slots for a specific doctor on a specific date
 * Returns array of available time slots
 */
router.get("/available-slots/:doctorProfileId", async (req, res) => {
  try {
    const { doctorProfileId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: "date parameter is required (YYYY-MM-DD)" });
    }

    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay(); // 0=Sunday, 6=Saturday

    // Get doctor's schedule for this day of week
    const schedules = await prisma.doctorSchedule.findMany({
      where: {
        doctorId: doctorProfileId,
        dayOfWeek,
        isActive: true,
        OR: [
          { effectiveFrom: null, effectiveTo: null },
          {
            AND: [
              { effectiveFrom: { lte: requestedDate } },
              { effectiveTo: { gte: requestedDate } },
            ],
          },
          {
            AND: [
              { effectiveFrom: { lte: requestedDate } },
              { effectiveTo: null },
            ],
          },
        ],
      },
      orderBy: { startTime: "asc" },
    });

    if (schedules.length === 0) {
      return res.json({ success: true, data: [], message: "No availability on this day" });
    }

    // Get existing appointments for this date
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorProfileId,
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { in: ["PENDING", "APPROVED"] },
      },
      select: { appointmentDate: true },
    });

    // Generate available slots (30-minute intervals)
    const availableSlots = [];
    const bookedTimes = new Set(
      existingAppointments.map((apt) => {
        const time = new Date(apt.appointmentDate);
        return `${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}`;
      })
    );

    for (const schedule of schedules) {
      const [startHour, startMin] = schedule.startTime.split(":").map(Number);
      const [endHour, endMin] = schedule.endTime.split(":").map(Number);

      let currentHour = startHour;
      let currentMin = startMin;

      while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
        const timeSlot = `${String(currentHour).padStart(2, "0")}:${String(currentMin).padStart(2, "0")}`;
        
        if (!bookedTimes.has(timeSlot)) {
          availableSlots.push({
            time: timeSlot,
            datetime: new Date(requestedDate.getFullYear(), requestedDate.getMonth(), requestedDate.getDate(), currentHour, currentMin).toISOString(),
          });
        }

        // Increment by 30 minutes
        currentMin += 30;
        if (currentMin >= 60) {
          currentMin = 0;
          currentHour += 1;
        }
      }
    }

    return res.json({ success: true, data: availableSlots });
  } catch (err) {
    console.error("❌ GET /api/schedule/available-slots error:", err);
    return res.status(500).json({ error: "Failed to fetch available slots" });
  }
});

module.exports = router;
