const { PrismaClient } = require("@prisma/client");
const { toDate } = require("date-fns-tz");
const { addMinutes } = require("date-fns");

// Mocking the slot generation logic for verification
function generateSlots({ rules, date, doctorTz, bookedSet }) {
  let slots = [];
  for (const rule of rules) {
    const startLocal = toDate(`${date}T${rule.startTime}:00`, {
      timeZone: doctorTz,
    });
    const endLocal = toDate(`${date}T${rule.endTime}:00`, {
      timeZone: doctorTz,
    });

    let current = startLocal;
    while (current < endLocal) {
      const next = addMinutes(current, 15);
      if (next > endLocal) break;

      const iso = current.toISOString();
      const isBooked = bookedSet.has(iso);

      slots.push({
        id: iso,
        startTime: iso,
        endTime: next.toISOString(),
        status: isBooked ? "BOOKED" : "AVAILABLE",
      });

      current = next;
    }
  }
  return slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
}

async function runTest() {
  console.log("Running Timezone Slot Verification Test...");

  const testCases = [
    {
      name: "Doctor in Karachi (GMT+5), 15:00 - 16:00",
      date: "2026-02-16", // A Monday
      doctorTz: "Asia/Karachi",
      rules: [{ startTime: "15:00", endTime: "16:00" }],
      expectedFirstSlotUTC: "2026-02-16T10:00:00.000Z",
    },
    {
      name: "Doctor in New York (EST, GMT-5), 09:00 - 10:00",
      date: "2026-02-16",
      doctorTz: "America/New_York",
      rules: [{ startTime: "09:00", endTime: "10:00" }],
      expectedFirstSlotUTC: "2026-02-16T14:00:00.000Z",
    },
  ];

  for (const tc of testCases) {
    const slots = generateSlots({
      rules: tc.rules,
      date: tc.date,
      doctorTz: tc.doctorTz,
      bookedSet: new Set(),
    });

    console.log(`Test: ${tc.name}`);
    if (slots.length === 0) {
      console.error("  FAIL: No slots generated");
      continue;
    }

    const firstSlot = slots[0].startTime;
    if (firstSlot === tc.expectedFirstSlotUTC) {
      console.log(`  PASS: First slot UTC is ${firstSlot}`);
    } else {
      console.error(
        `  FAIL: Expected ${tc.expectedFirstSlotUTC}, got ${firstSlot}`,
      );
    }
  }
}

runTest().catch(console.error);
