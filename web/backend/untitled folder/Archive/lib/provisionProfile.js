// FILE: backend/lib/provisionProfile.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Ensure a profile exists for the user; create a sensible default if missing.
 * Supports PATIENT and DOCTOR roles.
 */
async function ensureDefaultProfile(user, specialization) {
  if (!user) return null;

  if (user.role === 'PATIENT') {
    const existing = await prisma.patientProfile.findUnique({
      where: { userId: user.id },
    });
    if (existing) return existing;

    return prisma.patientProfile.create({
      data: {
        userId: user.id,
        // dateOfBirth & gender moved to User model
        bloodGroup: 'UNKNOWN',
        height: null,
        weight: null,
        allergies: '',
        medications: '',
        medicalHistory: '',
        address: '',
        emergencyContact: '',
        medicalRecordNumber: null,
        insuranceProvider: '',
        insuranceMemberId: '',
      },
    });
  }

  if (user.role === 'DOCTOR') {
    const existing = await prisma.doctorProfile.findUnique({
      where: { userId: user.id },
    });
    if (existing) return existing;

    const licenseNumber = `LIC-${user.id.slice(0, 8).toUpperCase()}`;

    return prisma.doctorProfile.create({
      data: {
        userId: user.id,
        specialization: specialization || 'General Medicine',
        qualifications: 'MBBS',
        licenseNumber,
        hospitalAffiliation: '',
        yearsOfExperience: 0,
        consultationFee: 0,
        availability: JSON.stringify({}),
        bio: '',
        languages: JSON.stringify(['English']),
      },
    });
  }

  if (user.role === 'PHARMACY') {
    const existing = await prisma.pharmacyProfile.findUnique({
      where: { userId: user.id },
    });
    if (existing) return existing;

    return prisma.pharmacyProfile.create({
      data: {
        userId: user.id,
        displayName: `${user.firstName} ${user.lastName}`,
        licenseNumber: `PHARM-${user.id.slice(0, 8).toUpperCase()}`,
        phone: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
      },
    });
  }

  return null;
}

module.exports = { ensureDefaultProfile };
