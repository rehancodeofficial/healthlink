const express = require("express");
const router = express.Router();
const prisma = require("../prisma/prismaClient");
const { verifyToken, requireRole } = require("../middleware/auth");

// Middleware
router.use(verifyToken);

// Helper: Check for time conflicts
function hasTimeConflict(start1, end1, start2, end2) {
  const toMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const s1 = toMinutes(start1);
  const e1 = toMinutes(end1);
  const s2 = toMinutes(start2);
  const e2 = toMinutes(end2);

  return s1 < e2 && s2 < e1;
}

// =============================================================================
// DOCTOR: Manage Schedule (Recurring)
// =============================================================================

// GET /api/schedule?doctorId=...
router.get("/", async (req, res) => {
  try {
    const { doctorId } = req.query;
    if (!doctorId) return res.status(400).json({ error: "Doctor ID required" });

    // Try finding by userId first (common case), then id
    let doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId },
    });
    if (!doctorProfile)
      doctorProfile = await prisma.doctorProfile.findUnique({
        where: { id: doctorId },
      });

    // If we can't find a doctor profile, return empty array instead of erroring,
    // because maybe the user is a doctor but hasn't set up a profile yet?
    // Stick to 404 if not found to be explicit.
    if (!doctorProfile)
      return res.status(404).json({ error: "Doctor profile not found" });

    const schedules = await prisma.doctorSchedule.findMany({
      where: { doctorId: doctorProfile.id },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    res.json({ success: true, data: schedules });
  } catch (err) {
    console.error("Error fetching schedule:", err);
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
});

// POST /api/schedule
router.post("/", async (req, res) => {
  try {
    const { doctorId, dayOfWeek, startTime, endTime } = req.body;

    if (!doctorId || dayOfWeek === undefined || !startTime || !endTime) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId },
    });
    if (!doctorProfile)
      doctorProfile = await prisma.doctorProfile.findUnique({
        where: { id: doctorId },
      });
    if (!doctorProfile)
      return res.status(404).json({ error: "Doctor profile not found" });

    // Check conflicts
    const existing = await prisma.doctorSchedule.findMany({
      where: {
        doctorId: doctorProfile.id,
        dayOfWeek: parseInt(dayOfWeek),
        isActive: true,
      },
    });

    for (const slot of existing) {
      if (hasTimeConflict(startTime, endTime, slot.startTime, slot.endTime)) {
        return res
          .status(409)
          .json({
            error: `Conflict with existing slot: ${slot.startTime}-${slot.endTime}`,
          });
      }
    }

    const schedule = await prisma.doctorSchedule.create({
      data: {
        doctorId: doctorProfile.id,
        dayOfWeek: parseInt(dayOfWeek),
        startTime,
        endTime,
        slotDuration: 15,
        isActive: true,
      },
    });

    res.json({ success: true, data: schedule });
  } catch (err) {
    console.error("Error creating schedule:", err);
    res.status(500).json({ error: "Failed to create schedule" });
  }
});

// PATCH /api/schedule/:id
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // We should ideally check conflicts here too if times are changing.
    // For now assuming simple toggle or update without complex validation for brevity,
    // but in production add conflict check.

    const updated = await prisma.doctorSchedule.update({
      where: { id },
      data: req.body,
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update schedule" });
  }
});

// DELETE /api/schedule/:id
router.delete("/:id", async (req, res) => {
  try {
    await prisma.doctorSchedule.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
});

// =============================================================================
// PATIENT: View Slots & Book
// =============================================================================

// GET /api/schedule/slots?doctorId=...&date=YYYY-MM-DD
router.get("/slots", async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date)
      return res.status(400).json({ error: "Missing params" });

    let doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId },
    });
    if (!doctorProfile)
      doctorProfile = await prisma.doctorProfile.findUnique({
        where: { id: doctorId },
      });
    if (!doctorProfile)
      return res.status(404).json({ error: "Doctor not found" });

    // Parse requested date
    const [y, m, d] = date.split("-").map(Number);
    // Create date object in UTC for consistent day-of-week check relative to input
    const dateObj = new Date(Date.UTC(y, m - 1, d));
    const dayOfWeek = dateObj.getUTCDay();

    // Get Rules
    const rules = await prisma.doctorSchedule.findMany({
      where: {
        doctorId: doctorProfile.id,
        dayOfWeek: dayOfWeek,
        isActive: true,
      },
    });

    if (rules.length === 0) return res.json({ success: true, data: [] });

    // Get Appointments for this day
    const startOfDay = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(y, m - 1, d, 23, 59, 59));

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorProfile.id,
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { not: "CANCELLED" },
      },
    });

    const bookedSet = new Set(
      existingAppointments.map((a) => a.appointmentDate.toISOString()),
    );

    // Generate Slots
    let slots = [];
    for (const rule of rules) {
      const [sH, sM] = rule.startTime.split(":").map(Number);
      const [eH, eM] = rule.endTime.split(":").map(Number);

      let current = new Date(Date.UTC(y, m - 1, d, sH, sM));
      const end = new Date(Date.UTC(y, m - 1, d, eH, eM));

      while (current < end) {
        const next = new Date(current.getTime() + 15 * 60000);
        if (next > end) break;

        const iso = current.toISOString();

        // Allow booking if status is not Cancelled.
        // Simple check: is exact start time in booked set?
        const isBooked = bookedSet.has(iso);

        slots.push({
          id: iso, // Use ISO as ID
          startTime: iso,
          endTime: next.toISOString(),
          status: isBooked ? "BOOKED" : "AVAILABLE",
        });

        current = next;
      }
    }

    slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
    res.json({ success: true, data: slots });
  } catch (err) {
    console.error("Slot generation error:", err);
    res.status(500).json({ error: "Failed to generate slots" });
  }
});

// POST /api/schedule/book
router.post("/book", async (req, res) => {
  try {
    const { doctorId, patientId, startTime, reason } = req.body; // startTime is an ISO string

    if (!doctorId || !patientId || !startTime) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Resolve Profiles
    let doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId },
    });
    if (!doctorProfile)
      doctorProfile = await prisma.doctorProfile.findUnique({
        where: { id: doctorId },
      });
    if (!doctorProfile)
      return res.status(404).json({ error: "Doctor not found" });

    let patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: patientId },
    });
    if (!patientProfile)
      patientProfile = await prisma.patientProfile.findUnique({
        where: { id: patientId },
      });
    if (!patientProfile)
      return res.status(404).json({ error: "Patient profile not found" });

    const startDate = new Date(startTime);

    // Check if slot is still available (concurrency check)
    const conflict = await prisma.appointment.findFirst({
      where: {
        doctorId: doctorProfile.id,
        appointmentDate: startDate,
        status: { not: "CANCELLED" },
      },
    });

    if (conflict) {
      return res.status(409).json({ error: "Slot already booked" });
    }

    const appointment = await prisma.appointment.create({
      data: {
        doctorId: doctorProfile.id,
        patientId: patientProfile.id,
        appointmentDate: startDate,
        startTime: startDate,
        endTime: new Date(startDate.getTime() + 15 * 60000),
        reason,
        status: "APPROVED",
      },
    });

    res.json({ success: true, appointment });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ error: "Booking failed" });
  }
});

module.exports = router;
