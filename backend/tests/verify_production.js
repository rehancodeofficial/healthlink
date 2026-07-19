// FILE: backend/verify_production.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Production Database Verification ---');
  try {
    const userCount = await prisma.user.count();
    const doctorCount = await prisma.doctorProfile.count();
    const patientCount = await prisma.patientProfile.count();
    const linkCount = await prisma.doctorPatient.count();

    console.log(`Users: ${userCount}`);
    console.log(`Doctor Profiles: ${doctorCount}`);
    console.log(`Patient Profiles: ${patientCount}`);
    console.log(`Doctor-Patient Links: ${linkCount}`);

    if (doctorCount === 0) {
      console.log('⚠️  WARNING: No doctors found in production database. Please run npm run seed.');
    } else {
      console.log('✅ Doctors are present in the database.');
    }

    const doctors = await prisma.doctorProfile.findMany({
      include: { user: { select: { firstName: true, lastName: true } } },
      take: 5
    });

    if (doctors.length > 0) {
      console.log('\nSample Doctors:');
      doctors.forEach(d => {
        console.log(`- ${d.user.firstName} ${d.user.lastName} (${d.specialization})`);
      });
    }

  } catch (err) {
    console.error('❌ Error during verification:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
