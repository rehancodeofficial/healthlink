const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- Database Relations Check ---");
  
  const usersCount = await prisma.user.count();
  const doctorsCount = await prisma.doctorProfile.count();
  const patientsCount = await prisma.patientProfile.count();
  const linksCount = await prisma.doctorPatient.count();
  
  console.log(`Users: ${usersCount}`);
  console.log(`Doctors: ${doctorsCount}`);
  console.log(`Patients: ${patientsCount}`);
  console.log(`Doctor-Patient Links: ${linksCount}`);
  
  console.log("\n--- Doctor-Patient Links Detail ---");
  const links = await prisma.doctorPatient.findMany({
    include: {
      doctor: { include: { user: true } },
      patient: { include: { user: true } }
    }
  });
  
  links.forEach(link => {
    const docName = link.doctor?.user ? `${link.doctor.user.firstName} ${link.doctor.user.lastName}` : "Unknown";
    const patName = link.patient?.user ? `${link.patient.user.firstName} ${link.patient.user.lastName}` : "Unknown";
    console.log(`Link: Doctor [${docName}] <-> Patient [${patName}]`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
