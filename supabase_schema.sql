-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('DOCTOR', 'PATIENT', 'PHARMACY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "AdminRole" AS ENUM ('SUPERADMIN', 'ADMIN', 'SUPPORT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "BloodGroup" AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "ConsultationStatus" AS ENUM ('SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "Plan" AS ENUM ('MONTHLY', 'YEARLY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "SubStatus" AS ENUM ('UNSUBSCRIBED', 'PENDING', 'ACTIVE', 'EXPIRED', 'DEACTIVATED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "PrescriptionDispatchStatus" AS ENUM ('NONE', 'SENT', 'ACKNOWLEDGED', 'READY', 'DISPENSED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "EmailOTP" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailOTP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nic" TEXT,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'PATIENT',
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "subscriptionState" "SubStatus" NOT NULL DEFAULT 'UNSUBSCRIBED',
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "admin" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "token" TEXT,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SupportAgent" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportAgent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ActivityLog" (
    "id" SERIAL NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DoctorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "qualifications" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "hospitalAffiliation" TEXT,
    "yearsOfExperience" INTEGER,
    "consultationFee" DOUBLE PRECISION NOT NULL,
    "availability" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "bio" TEXT,
    "languages" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PharmacyProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "licenseNumber" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "openingHours" TEXT,
    "services" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PharmacyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PatientProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bloodGroup" "BloodGroup" NOT NULL,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "allergies" TEXT,
    "medications" TEXT,
    "medicalHistory" TEXT,
    "address" TEXT,
    "medicalRecordNumber" TEXT,
    "insuranceProvider" TEXT,
    "insuranceMemberId" TEXT,
    "emergencyContact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Appointment" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "appointmentDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DoctorSchedule" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SupportTicket" (
    "id" SERIAL NOT NULL,
    "ticketNo" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agentId" INTEGER,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SupportReply" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "adminId" INTEGER,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Prescription" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "medication" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pharmacyId" TEXT,
    "dispatchStatus" "PrescriptionDispatchStatus" NOT NULL DEFAULT 'NONE',
    "dispatchedAt" TIMESTAMP(3),

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Message" (
    "id" TEXT NOT NULL,
    "senderId" TEXT,
    "receiverId" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "adminSenderId" INTEGER,
    "adminReceiverId" INTEGER,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "VideoConsultation" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "title" TEXT,
    "notes" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMins" INTEGER,
    "status" "ConsultationStatus" NOT NULL DEFAULT 'SCHEDULED',
    "roomName" TEXT,
    "meetingUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoConsultation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SubscriptionSetting" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "doctorMonthlyUsd" DOUBLE PRECISION,
    "doctorYearlyUsd" DOUBLE PRECISION,
    "patientMonthlyUsd" DOUBLE PRECISION,
    "patientYearlyUsd" DOUBLE PRECISION,
    "pharmacyMonthlyUsd" DOUBLE PRECISION,
    "pharmacyYearlyUsd" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "Plan" NOT NULL,
    "status" "SubStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT,
    "reference" TEXT,
    "amount" INTEGER,
    "currency" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DoctorPatient" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DoctorPatient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SelectedPharmacy" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "pharmacyId" TEXT NOT NULL,
    "preferred" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SelectedPharmacy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SystemSetting" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "systemName" TEXT,
    "themeColor" TEXT,
    "logoUrl" TEXT,
    "defaultFee" DOUBLE PRECISION,
    "monthlyPlan" DOUBLE PRECISION,
    "yearlyPlan" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EmailOTP_email_idx" ON "EmailOTP"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EmailOTP_expiresAt_idx" ON "EmailOTP"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "User_nic_key" ON "User"("nic");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "admin_email_key" ON "admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "admin_token_key" ON "admin"("token");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SupportAgent_userId_key" ON "SupportAgent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "DoctorProfile_userId_key" ON "DoctorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "DoctorProfile_licenseNumber_key" ON "DoctorProfile"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PharmacyProfile_userId_key" ON "PharmacyProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PatientProfile_userId_key" ON "PatientProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PatientProfile_medicalRecordNumber_key" ON "PatientProfile"("medicalRecordNumber");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Appointment_doctorId_idx" ON "Appointment"("doctorId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Appointment_patientId_idx" ON "Appointment"("patientId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DoctorSchedule_doctorId_idx" ON "DoctorSchedule"("doctorId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DoctorSchedule_dayOfWeek_idx" ON "DoctorSchedule"("dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SupportTicket_ticketNo_key" ON "SupportTicket"("ticketNo");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Prescription_doctorId_idx" ON "Prescription"("doctorId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Prescription_patientId_idx" ON "Prescription"("patientId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Prescription_pharmacyId_idx" ON "Prescription"("pharmacyId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "VideoConsultation_doctorId_idx" ON "VideoConsultation"("doctorId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "VideoConsultation_patientId_idx" ON "VideoConsultation"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_reference_key" ON "Subscription"("reference");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Subscription_plan_idx" ON "Subscription"("plan");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DoctorPatient_patientId_idx" ON "DoctorPatient"("patientId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DoctorPatient_doctorId_idx" ON "DoctorPatient"("doctorId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "DoctorPatient_doctorId_patientId_key" ON "DoctorPatient"("doctorId", "patientId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SelectedPharmacy_patientId_pharmacyId_key" ON "SelectedPharmacy"("patientId", "pharmacyId");

-- AddForeignKey
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_organizationId_fkey"; ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportAgent" DROP CONSTRAINT IF EXISTS "SupportAgent_userId_fkey"; ALTER TABLE "SupportAgent" ADD CONSTRAINT "SupportAgent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorProfile" DROP CONSTRAINT IF EXISTS "DoctorProfile_userId_fkey"; ALTER TABLE "DoctorProfile" ADD CONSTRAINT "DoctorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyProfile" DROP CONSTRAINT IF EXISTS "PharmacyProfile_userId_fkey"; ALTER TABLE "PharmacyProfile" ADD CONSTRAINT "PharmacyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientProfile" DROP CONSTRAINT IF EXISTS "PatientProfile_userId_fkey"; ALTER TABLE "PatientProfile" ADD CONSTRAINT "PatientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT IF EXISTS "Appointment_doctorId_fkey"; ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT IF EXISTS "Appointment_patientId_fkey"; ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "PatientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorSchedule" DROP CONSTRAINT IF EXISTS "DoctorSchedule_doctorId_fkey"; ALTER TABLE "DoctorSchedule" ADD CONSTRAINT "DoctorSchedule_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" DROP CONSTRAINT IF EXISTS "SupportTicket_userId_fkey"; ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" DROP CONSTRAINT IF EXISTS "SupportTicket_agentId_fkey"; ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "SupportAgent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportReply" DROP CONSTRAINT IF EXISTS "SupportReply_ticketId_fkey"; ALTER TABLE "SupportReply" ADD CONSTRAINT "SupportReply_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportReply" DROP CONSTRAINT IF EXISTS "SupportReply_userId_fkey"; ALTER TABLE "SupportReply" ADD CONSTRAINT "SupportReply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportReply" DROP CONSTRAINT IF EXISTS "SupportReply_adminId_fkey"; ALTER TABLE "SupportReply" ADD CONSTRAINT "SupportReply_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" DROP CONSTRAINT IF EXISTS "Prescription_pharmacyId_fkey"; ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "PharmacyProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" DROP CONSTRAINT IF EXISTS "Prescription_doctorId_fkey"; ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" DROP CONSTRAINT IF EXISTS "Prescription_patientId_fkey"; ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "PatientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" DROP CONSTRAINT IF EXISTS "Message_senderId_fkey"; ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" DROP CONSTRAINT IF EXISTS "Message_receiverId_fkey"; ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" DROP CONSTRAINT IF EXISTS "Message_adminSenderId_fkey"; ALTER TABLE "Message" ADD CONSTRAINT "Message_adminSenderId_fkey" FOREIGN KEY ("adminSenderId") REFERENCES "admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" DROP CONSTRAINT IF EXISTS "Message_adminReceiverId_fkey"; ALTER TABLE "Message" ADD CONSTRAINT "Message_adminReceiverId_fkey" FOREIGN KEY ("adminReceiverId") REFERENCES "admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoConsultation" DROP CONSTRAINT IF EXISTS "VideoConsultation_doctorId_fkey"; ALTER TABLE "VideoConsultation" ADD CONSTRAINT "VideoConsultation_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoConsultation" DROP CONSTRAINT IF EXISTS "VideoConsultation_patientId_fkey"; ALTER TABLE "VideoConsultation" ADD CONSTRAINT "VideoConsultation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "PatientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT IF EXISTS "Subscription_userId_fkey"; ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorPatient" DROP CONSTRAINT IF EXISTS "DoctorPatient_doctorId_fkey"; ALTER TABLE "DoctorPatient" ADD CONSTRAINT "DoctorPatient_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorPatient" DROP CONSTRAINT IF EXISTS "DoctorPatient_patientId_fkey"; ALTER TABLE "DoctorPatient" ADD CONSTRAINT "DoctorPatient_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "PatientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectedPharmacy" DROP CONSTRAINT IF EXISTS "SelectedPharmacy_patientId_fkey"; ALTER TABLE "SelectedPharmacy" ADD CONSTRAINT "SelectedPharmacy_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "PatientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectedPharmacy" DROP CONSTRAINT IF EXISTS "SelectedPharmacy_pharmacyId_fkey"; ALTER TABLE "SelectedPharmacy" ADD CONSTRAINT "SelectedPharmacy_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "PharmacyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

