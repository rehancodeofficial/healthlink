const express = require("express");
const router = express.Router();
const prisma = require("../prisma/prismaClient");

// Helper to generate time slots
const generateSlots = (start, end, durationMins) => {
  const slots = [];
  let current = new Date(start);
  const stop = new Date(end);

  while (current < stop) {
    const next = new Date(current.getTime() + durationMins * 60000);
    if (next > stop) break;

    slots.push({
      startTime: new Date(current),
      endTime: new Date(next),
      status: "AVAILABLE",
    });

    current = next;
  }
  return slots;
};

// SET Availability for a specific date
router.post("/availability", async (req, res) => {
  try {
    const { doctorId, date, startTime, endTime, slotDuration = 15 } = req.body;

    if (!doctorId || !date || !startTime || !endTime) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Ensure dates are objects
    const dateObj = new Date(date);
    const startObj = new Date(startTime);
    const endObj = new Date(endTime);

    // Transaction: Create Availability + Slots
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check if availability exists for this day -> Update or Replace?
      // For simplicity, we'll delete existing for this day and create new
      await tx.doctorAvailability.deleteMany({
        where: {
          doctorId,
          date: dateObj,
        },
      });

      // 2. Create Header
      const availability = await tx.doctorAvailability.create({
        data: {
          doctorId,
          date: dateObj,
          startTime: startObj,
          endTime: endObj,
          slotDuration,
        },
      });

      // 3. Generate Slots
      const slotsData = generateSlots(startObj, endObj, slotDuration);

      // 4. Batch Create Slots
      if (slotsData.length > 0) {
        await tx.appointmentSlot.createMany({
          data: slotsData.map((s) => ({
            doctorId,
            availabilityId: availability.id,
            startTime: s.startTime,
            endTime: s.endTime,
            status: "AVAILABLE",
          })),
        });
      }

      return { availability, count: slotsData.length };
    });

    res.json({ success: true, ...result });
  } catch (err) {
    console.error("Error setting availability:", err);
    res.status(500).json({ error: "Failed to set availability" });
  }
});

// GET Slots for Patient (Public/Protected)
router.get("/slots", async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ error: "Doctor ID and Date are required" });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const slots = await prisma.appointmentSlot.findMany({
      where: {
        doctorId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        startTime: "asc",
      },
      include: {
        appointment: {
          select: {
            status: true,
          },
        },
      },
    });

    res.json(slots);
  } catch (err) {
    console.error("Error fetching slots:", err);
    res.status(500).json({ error: "Failed to fetch slots" });
  }
});

// BOOK a Slot
router.post("/book-slot", async (req, res) => {
  try {
    const { slotId, patientId, reason } = req.body;

    if (!slotId || !patientId) {
      return res
        .status(400)
        .json({ error: "Slot ID and Patient ID are required" });
    }

    // OPTIONAL: Validations (patient exists, etc.)

    const result = await prisma.$transaction(async (tx) => {
      // 1. Lock & Get Slot
      const slot = await tx.appointmentSlot.findUnique({
        where: { id: slotId },
      });

      if (!slot) throw new Error("Slot not found");
      if (slot.status !== "AVAILABLE")
        throw new Error("Slot is no longer available");

      // 2. Create Appointment
      const appointment = await tx.appointment.create({
        data: {
          doctorId: slot.doctorId,
          patientId: patientId,
          appointmentDate: slot.startTime,
          reason: reason || "Slot Booking",
          status: "APPROVED", // Auto-approve or PENDING based on logic
          slot: {
            connect: { id: slotId },
          },
        },
      });

      // 3. Update Slot Status
      await tx.appointmentSlot.update({
        where: { id: slotId },
        data: {
          status: "BOOKED",
          bookedBy: patientId,
          appointmentId: appointment.id,
        },
      });

      return appointment;
    });

    // TODO: Send Notification (Email/Push) here

    res.json({ success: true, appointment: result });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(400).json({ error: err.message || "Booking failed" });
  }
});

module.exports = router;
