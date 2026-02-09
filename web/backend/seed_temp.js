const prisma = require('./prisma/prismaClient');

async function main() {
  console.log('Seeding doctors...');

  const doctorData = [
    {
      email: 'dr.john@curevirtual.com',
      firstName: 'John',
      lastName: 'Doe',
      specialization: 'Cardiologist',
      qualifications: 'MD, FACC',
      license: 'LIC12345',
      fee: 150.0
    },
    {
      email: 'dr.jane@curevirtual.com',
      firstName: 'Jane',
      lastName: 'Smith',
      specialization: 'Neurologist',
      qualifications: 'MD, PhD',
      license: 'LIC67890',
      fee: 200.0
    }
  ];

  for (const data of doctorData) {
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: 'hashedpassword', // In production, use bcrypt
        role: 'DOCTOR',
        gender: 'MALE',
        dateOfBirth: new Date('1980-01-01'),
      },
    });

    const doctor = await prisma.doctorProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        specialization: data.specialization,
        qualifications: data.qualifications,
        licenseNumber: data.license,
        consultationFee: data.fee,
        bio: `Expert in ${data.specialization}`,
        yearsOfExperience: 15,
      },
    });

    // Add some schedules
    const days = [1, 2, 3, 4, 5]; // Mon-Fri
    for (const day of days) {
      await prisma.doctorSchedule.create({
        data: {
          doctorId: doctor.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          isActive: true,
        }
      });
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
