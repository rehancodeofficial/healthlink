// test_db.cjs
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const schedules = await prisma.doctorSchedule.findMany();
  console.log(`Found ${schedules.length} schedules in the database.`);
  if (schedules.length > 0) {
    console.log(schedules[0]);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
