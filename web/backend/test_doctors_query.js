
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testParam(query) {
  console.log("Testing with query:", query);
  try {
    const where = {};
    if (query.specialization) where.specialization = { contains: String(query.specialization), mode: "insensitive" };
    
    if (query.search) {
      where.OR = [
        { specialization: { contains: String(query.search), mode: "insensitive" } },
        { 
          user: { 
            OR: [
              { firstName: { contains: String(query.search), mode: "insensitive" } },
              { lastName: { contains: String(query.search), mode: "insensitive" } },
            ]
          } 
        },
      ];
    }
    
    const doctors = await prisma.doctorProfile.findMany({
      where,
      orderBy: [{ yearsOfExperience: "desc" }, { consultationFee: "asc" }],
      include: { 
        user: true,
        schedules: {
          where: { isActive: true }
        }
      },
    });
    console.log("Found doctors:", doctors.length);
    // console.log(JSON.stringify(doctors, null, 2));
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

async function main() {
    await testParam({});
    await testParam({ search: "John" });
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
