const { PrismaClient } = require('./prisma/prismaClient');
const { parseAsLocal } = require('./utils/timeUtils');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    where: { firstName: { contains: "Rehan" }, role: "DOCTOR" },
    include: { doctorProfile: true }
  });

  if (users.length === 0) {
    console.log("No doctor found with name Rehan");
    return;
  }

  for (const user of users) {
    console.log(`\nDoctor: ${user.firstName} ${user.lastName}`);
    if (!user.doctorProfile) {
      console.log("No profile found.");
      continue;
    }
    console.log(`DoctorProfile ID: ${user.doctorProfile.id}`);
    
    // Check their schedules
    const rules = await prisma.doctorSchedule.findMany({
      where: { doctorId: user.doctorProfile.id }
    });
    console.log("Schedules in DB:");
    console.log(rules);

    // Let's test the endpoint logic for 2026-03-25 (Wed, day 3)
    const dateStr = "2026-03-25";
    const doctorDate = parseAsLocal(dateStr);
    const dayOfWeek = doctorDate.getUTCDay();
    console.log(`\nTesting logic for date ${dateStr} (Day of week UTC: ${dayOfWeek})`);

    const matchingRules = rules.filter(r => r.dayOfWeek === dayOfWeek && r.isActive);
    console.log("Matching Active Rules:", matchingRules);
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
