const prisma = require('./prisma/prismaClient');

async function main() {
  console.log("Checking subscription settings...");
  let s = await prisma.subscriptionSetting.findFirst();
  
  if (!s) {
    console.log("No settings found. Creating default...");
    s = await prisma.subscriptionSetting.create({
      data: {
        id: 1,
        doctorMonthlyUsd: 25,
        doctorYearlyUsd: 262.5,
        patientMonthlyUsd: 10,
        patientYearlyUsd: 105,
        pharmacyMonthlyUsd: 30,
        pharmacyYearlyUsd: 300,
      }
    });
  } else {
    console.log("Found settings:", s);
    console.log("Forcing update to Pharmacy prices (30/300)...");
    s = await prisma.subscriptionSetting.update({
      where: { id: s.id },
      data: {
        pharmacyMonthlyUsd: 30,
        pharmacyYearlyUsd: 300,
      }
    });
  }
  
  console.log("Updated settings:", s);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
