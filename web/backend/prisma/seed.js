/* eslint-disable no-console */
// FILE: prisma/seed.js
const {
  PrismaClient,
  // Enums may be absent if not in your schema; we fall back below
  Gender,
  BloodGroup,
  UserRole,
  AdminRole,
  TicketStatus,
  Priority,
  AppointmentStatus,
  ConsultationStatus,
  Plan,
  SubStatus,
  PrescriptionDispatchStatus,
} = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

/** ---- Helpers ---------------------------------------------------------- */

// Return the Prisma model client by name if it exists (e.g., "user", "admin")
function getModel(name) {
  const m = prisma[name];
  return typeof m === 'object' && m !== null ? m : null;
}

async function safeUpsert(
  modelName,
  { where, create, update = {} },
  opts = {}
) {
  const m = getModel(modelName);
  if (!m) {
    console.log(`↪️  Skipped ${modelName}.upsert — model not in schema`);
    return null;
  }
  try {
    return await m.upsert({ where, create, update });
  } catch (e) {
    // If "where" isn't on a unique field in your schema we can still try a soft path.
    console.log(
      `⚠️  ${modelName}.upsert failed (${
        e.code || e.message
      }); attempting find-or-create`
    );
    try {
      const existing = await m.findFirst({ where });
      if (existing) return existing;
    } catch (_) {
      // ignore
    }
    try {
      return await m.create({ data: create });
    } catch (e2) {
      if (!opts.quiet)
        console.log(
          `⚠️  ${modelName}.create failed (${e2.code || e2.message})`
        );
      return null;
    }
  }
}

async function safeCreate(modelName, data, opts = {}) {
  const m = getModel(modelName);
  if (!m) {
    console.log(`↪️  Skipped ${modelName}.create — model not in schema`);
    return null;
  }
  try {
    return await m.create({ data });
  } catch (e) {
    if (!opts.quiet)
      console.log(`⚠️  ${modelName}.create failed (${e.code || e.message})`);
    return null;
  }
}

async function safeCount(modelName, where = {}) {
  const m = getModel(modelName);
  if (!m) return 0;
  try {
    return await m.count({ where });
  } catch {
    return 0;
  }
}

// Fallback enum values to plain strings if enums are missing in the client
const E = {
  Gender: {
    MALE: Gender?.MALE ?? 'MALE',
    FEMALE: Gender?.FEMALE ?? 'FEMALE',
  },
  BloodGroup: {
    O_POSITIVE: BloodGroup?.O_POSITIVE ?? 'O_POSITIVE',
  },
  UserRole: {
    PATIENT: UserRole?.PATIENT ?? 'PATIENT',
    DOCTOR: UserRole?.DOCTOR ?? 'DOCTOR',
    PHARMACY: UserRole?.PHARMACY ?? 'PHARMACY',
  },
  AdminRole: {
    SUPERADMIN: AdminRole?.SUPERADMIN ?? 'SUPERADMIN',
  },
  TicketStatus: {
    OPEN: TicketStatus?.OPEN ?? 'OPEN',
    IN_PROGRESS: TicketStatus?.IN_PROGRESS ?? 'IN_PROGRESS',
  },
  Priority: {
    MEDIUM: Priority?.MEDIUM ?? 'MEDIUM',
  },
  AppointmentStatus: {
    PENDING: AppointmentStatus?.PENDING ?? 'PENDING',
    APPROVED: AppointmentStatus?.APPROVED ?? 'APPROVED',
  },
  ConsultationStatus: {
    SCHEDULED: ConsultationStatus?.SCHEDULED ?? 'SCHEDULED',
  },
  Plan: {
    MONTHLY: Plan?.MONTHLY ?? 'MONTHLY',
  },
  SubStatus: {
    ACTIVE: SubStatus?.ACTIVE ?? 'ACTIVE',
    UNSUBSCRIBED: SubStatus?.UNSUBSCRIBED ?? 'UNSUBSCRIBED',
  },
  RxDispatch: {
    READY: PrescriptionDispatchStatus?.READY ?? 'READY',
    SENT: PrescriptionDispatchStatus?.SENT ?? 'SENT',
  },
};

/** Create or return a base user by email */
async function ensureUser({ email, name, role, passwordHash }) {
  const userModel = getModel('user');
  if (!userModel) {
    console.log("↪️  Skipped user creation — 'User' model not in schema");
    return null;
  }
  
  // Split name into firstName/lastName
  const parts = name.split(' ');
  const firstName = parts[0];
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : 'User';

  try {
    return await userModel.upsert({
      where: { email },
      update: { firstName, lastName },
      create: {
        email,
        firstName,
        lastName,
        password: passwordHash,
        role,
        subscriptionState: E.SubStatus.UNSUBSCRIBED,
        dateOfBirth: new Date('1990-01-01'), // Default DOB to satisfy schema
        gender: E.Gender.MALE // Default gender
      },
    });
  } catch (e) {
    console.log(
      `⚠️  user.upsert failed (${
        e.code || e.message
      }); attempting find-or-create`
    );
    const existing = await userModel
      .findFirst({ where: { email } })
      .catch(() => null);
    if (existing) return existing;
    try {
      return await userModel.create({
        data: {
          email,
          firstName,
          lastName,
          password: passwordHash,
          role,
          subscriptionState: E.SubStatus.UNSUBSCRIBED,
          dateOfBirth: new Date('1990-01-01'),
          gender: E.Gender.MALE
        },
      });
    } catch (e2) {
      console.log(`⚠️  user.create failed (${e2.code || e2.message})`);
      return null;
    }
  }
}

/** ---- Seed ------------------------------------------------------------- */

async function main() {
  console.log('🌱 Seeding CureVirtual…');

  // bcrypt hash for "123456"
  const passwordHash = await bcrypt.hash('123456', 10);

  // 1) System / subscription settings (if those models exist)
  await safeUpsert('systemSetting', {
    where: { id: 1 },
    update: { systemName: 'CureVirtual', themeColor: '#027906' },
    create: {
      id: 1,
      systemName: 'CureVirtual',
      themeColor: '#027906',
      defaultFee: 20,
    },
  });

  await safeUpsert('subscriptionSetting', {
    where: { id: 1 },
    update: {
      doctorMonthlyUsd: 20,
      doctorYearlyUsd: 200,
      patientMonthlyUsd: 5,
      patientYearlyUsd: 50,
      pharmacyMonthlyUsd: 15,
      pharmacyYearlyUsd: 150,
    },
    create: {
      id: 1,
      doctorMonthlyUsd: 20,
      doctorYearlyUsd: 200,
      patientMonthlyUsd: 5,
      patientYearlyUsd: 50,
      pharmacyMonthlyUsd: 15,
      pharmacyYearlyUsd: 150,
    },
  });

  // 2) Core accounts
  const superAdmin = await safeUpsert('admin', {
    where: { email: 'superadmin@curevirtual.com' },
    update: { role: E.AdminRole.SUPERADMIN, isSuspended: false },
    create: {
      name: 'Super Admin',
      email: 'superadmin@curevirtual.com',
      password: passwordHash,
      role: E.AdminRole.SUPERADMIN,
      isSuspended: false,
    },
  });

  const standardAdmin = await safeUpsert('admin', {
    where: { email: 'admin@curevirtual.com' },
    update: { role: E.AdminRole.ADMIN, isSuspended: false },
    create: {
      name: 'Standard Admin',
      email: 'admin@curevirtual.com',
      password: passwordHash,
      role: E.AdminRole.ADMIN,
      isSuspended: false,
    },
  });

  const supportAdmin = await safeUpsert('admin', {
    where: { email: 'support@curevirtual.com' },
    update: { role: E.AdminRole.SUPPORT, isSuspended: false },
    create: {
      name: 'Support Officer',
      email: 'support@curevirtual.com',
      password: passwordHash,
      role: E.AdminRole.SUPPORT,
      isSuspended: false,
    },
  });

  const pharmacyUser = await ensureUser({
    email: 'pharmacy@curevirtual.com',
    name: 'CureVirtual Pharmacy',
    role: E.UserRole.PHARMACY,
    passwordHash,
  });

  const supportUser = await ensureUser({
    email: 'agent@curevirtual.com',
    name: 'Support Agent',
    role: E.UserRole.PATIENT, // base user; linked as SupportAgent if model exists
    passwordHash,
  });

  const supportAgent = supportUser
    ? await safeUpsert('supportAgent', {
        where: { userId: supportUser.id },
        update: { isActive: true },
        create: { userId: supportUser.id, isActive: true },
      })
    : null;

  // 3) Pharmacy profile
  const pharmacyProfile =
    pharmacyUser &&
    (await safeUpsert('pharmacyProfile', {
      where: { userId: pharmacyUser.id },
      update: {
        displayName: 'CureVirtual Main Pharmacy',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
      },
      create: {
        userId: pharmacyUser.id,
        displayName: 'CureVirtual Main Pharmacy',
        licenseNumber: 'PHARM-0001',
        phone: '+2348000000000',
        address: '1 Health Avenue, Ikeja',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
        postalCode: '100001',
        latitude: 6.6018,
        longitude: 3.3515,
        openingHours: 'Mon–Sat 8:00–18:00',
        services: 'Dispensing; Home Delivery; Counseling',
      },
    }));

  // 4) Doctors & Patients (unique emails)
  const doctorUsers = [];
  for (let i = 1; i <= 3; i++) {
    const u = await ensureUser({
      email: `doctor${i}@curevirtual.com`,
      name: `Dr. John Doctor ${i}`,
      role: E.UserRole.DOCTOR,
      passwordHash,
    });
    if (u) doctorUsers.push(u);
  }

  const patientUsers = [];
  for (let i = 1; i <= 3; i++) {
    const u = await ensureUser({
      email: `patient${i}@curevirtual.com`,
      name: `Virtual Patient ${i}`,
      role: E.UserRole.PATIENT,
      passwordHash,
    });
    if (u) patientUsers.push(u);
  }

  // 5) Doctor profiles
  const doctorProfiles = [];
  for (let i = 0; i < doctorUsers.length; i++) {
    const u = doctorUsers[i];
    const profile = await safeUpsert('doctorProfile', {
      where: { userId: u.id },
      update: { consultationFee: 30 + i * 5 },
      create: {
        userId: u.id,
        specialization: 'General Practice',
        qualifications: 'MBBS, FWACP',
        licenseNumber: `DOC-000${i + 1}`, // ensure unique if model enforces it
        hospitalAffiliation: 'CureVirtual Clinic',
        yearsOfExperience: 5 + i,
        consultationFee: 30 + i * 5,
        availability: 'Weekdays 09:00–17:00',
        bio: 'Primary care physician with interest in preventive medicine.',
        languages: 'English, Yoruba',
      },
    });
    if (profile) doctorProfiles.push(profile);
  }

  // 6) Patient profiles + link to pharmacy
  const patientProfiles = [];
  for (let i = 0; i < patientUsers.length; i++) {
    const u = patientUsers[i];
    const profile = await safeUpsert('patientProfile', {
      where: { userId: u.id },
      update: {},
      create: {
        userId: u.id,
        bloodGroup: E.BloodGroup.O_POSITIVE,
        height: 1.7 + i * 0.02,
        weight: 70 + i * 3,
        allergies: i === 0 ? 'Penicillin' : null,
        medications: 'Vitamin D 1000IU',
        medicalHistory: 'No chronic illnesses.',
        address: `No. ${i + 2} Patient Road, Lekki`,
        emergencyContact: `Jane Doe ${i + 1}, +234800000000${i + 1}`,
        medicalRecordNumber: `MRN-000${i + 1}`, // unique if enforced
        medicalRecordNumber: `MRN-000${i + 1}`, // unique if enforced
      },
    });
    if (profile) patientProfiles.push(profile);
  }

  // 7) Doctor–Patient links
  for (
    let i = 0;
    i < Math.min(doctorProfiles.length, patientProfiles.length);
    i++
  ) {
    await safeUpsert('doctorPatient', {
      where: {
        // Prisma supports compound unique; if your schema uses a different key, this will soft-fallback
        doctorId_patientId: {
          doctorId: doctorProfiles[i].id,
          patientId: patientProfiles[i].id,
        },
      },
      update: {},
      create: {
        doctorId: doctorProfiles[i].id,
        patientId: patientProfiles[i].id,
      },
    });
  }

  // 8) Give Doctor #1 an ACTIVE subscription (if model exists)
  if (doctorUsers[0]) {
    const now = new Date();
    const oneMonth = new Date(now);
    oneMonth.setMonth(oneMonth.getMonth() + 1);

    await safeUpsert('subscription', {
      where: { reference: 'sub-DOCTOR-001' }, // ensure this is unique in your schema
      update: { status: E.SubStatus.ACTIVE, endDate: oneMonth },
      create: {
        userId: doctorUsers[0].id,
        plan: E.Plan.MONTHLY,
        status: E.SubStatus.ACTIVE,
        provider: 'STRIPE',
        reference: 'sub-DOCTOR-001',
        amount: 2000,
        currency: 'USD',
        startDate: now,
        endDate: oneMonth,
      },
    });

    const userModel = getModel('user');
    if (userModel) {
      await userModel
        .update({
          where: { id: doctorUsers[0].id },
          data: { subscriptionState: E.SubStatus.ACTIVE },
        })
        .catch(() => {});
    }
  }

  // 9) Sample appointment / consult / prescription
  const d1 = doctorProfiles[0];
  const p1 = patientProfiles[0];
  if (d1 && p1) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await safeUpsert('appointment', {
      where: { id: 'seed-appt-1' }, // works if id is String unique; else soft fallback triggers
      update: { status: E.AppointmentStatus.APPROVED },
      create: {
        id: 'seed-appt-1',
        doctorId: d1.id,
        patientId: p1.id,
        appointmentDate: tomorrow,
        reason: 'Headache & fatigue',
        status: E.AppointmentStatus.PENDING,
      },
    });

    await safeUpsert('videoConsultation', {
      where: { id: 'seed-vc-1' },
      update: { status: E.ConsultationStatus.SCHEDULED },
      create: {
        id: 'seed-vc-1',
        doctorId: d1.id,
        patientId: p1.id,
        title: 'Initial Teleconsult',
        notes: 'Review symptoms and vitals.',
        scheduledAt: tomorrow,
        durationMins: 30,
        status: E.ConsultationStatus.SCHEDULED,
        roomName: 'curevirtual-room-1',
        meetingUrl: 'https://meet.curevirtual.com/room-1',
      },
    });

    if (pharmacyProfile) {
      await safeUpsert('prescription', {
        where: { id: 'seed-rx-1' },
        update: { dispatchStatus: E.RxDispatch.SENT, dispatchedAt: new Date() },
        create: {
          id: 'seed-rx-1',
          doctorId: d1.id,
          patientId: p1.id,
          medication: 'Paracetamol 500mg',
          dosage: '1 tablet',
          frequency: 'Every 8 hours',
          duration: '5 days',
          notes: 'Take with food.',
          pharmacyId: pharmacyProfile.id,
          dispatchStatus: E.RxDispatch.READY,
          dispatchedAt: new Date(),
        },
      });
    }
  }

  // 10) Chat messages
  if (doctorUsers[0] && patientUsers[0]) {
    await safeUpsert('message', {
      where: { id: 'seed-msg-1' },
      update: {},
      create: {
        id: 'seed-msg-1',
        senderId: patientUsers[0].id,
        receiverId: doctorUsers[0].id,
        content: 'Hello Doctor, I booked an appointment for tomorrow.',
      },
    });

    await safeUpsert('message', {
      where: { id: 'seed-msg-2' },
      update: {},
      create: {
        id: 'seed-msg-2',
        senderId: doctorUsers[0].id,
        receiverId: patientUsers[0].id,
        content: 'Got it! Please come with your previous prescriptions.',
      },
    });
  }

  // 11) Support ticket + replies
  const ticket = await safeUpsert('supportTicket', {
    where: { ticketNo: 'seed-tkt-1' }, // assumes unique
    update: {
      status: E.TicketStatus.IN_PROGRESS,
      ...(supportAgent ? { agentId: supportAgent.id } : {}),
    },
    create: {
      ticketNo: 'seed-tkt-1',
      userId: patientUsers[0]?.id ?? null,
      agentId: supportAgent?.id ?? null,
      subject: 'Unable to join video room',
      body: 'The video room link shows an error.',
      status: E.TicketStatus.OPEN,
      priority: E.Priority.MEDIUM,
    },
  });

  if (ticket) {
    const existingReplies = await safeCount('supportReply', {
      ticketId: ticket.id,
    });
    if (existingReplies === 0) {
      const repliesModel = getModel('supportReply');
      if (repliesModel) {
        await repliesModel
          .createMany({
            data: [
              {
                ticketId: ticket.id,
                userId: patientUsers[0]?.id ?? null,
                adminId: null,
                message: 'This happens on my phone. Please advise.',
              },
              {
                ticketId: ticket.id,
                userId: supportUser?.id ?? null,
                adminId: superAdmin?.id ?? null,
                message:
                  'We’re looking into this. Try clearing your browser cache.',
              },
            ],
            skipDuplicates: true,
          })
          .catch(() => {});
      }
    }
  }

  // 12) Activity logs (only if model exists)
  const activityCount = await safeCount('activityLog');
  if (activityCount === 0) {
    const activityModel = getModel('activityLog');
    if (activityModel) {
      await activityModel
        .createMany({
          data: [
            {
              actorId: doctorUsers[0]?.id ?? null,
              actorRole: 'DOCTOR',
              action: 'Created prescription',
              entity: 'Prescription:seed-rx-1',
            },
            {
              actorId: patientUsers[0]?.id ?? null,
              actorRole: 'PATIENT',
              action: 'Booked appointment',
              entity: 'Appointment:seed-appt-1',
            },
          ],
        })
        .catch(() => {});
    }
  }

  console.log('✅ Seed complete (models missing were safely skipped).');
}

// Export for programmatic use (e.g., via internal API)
module.exports = { main };

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Seeding failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
