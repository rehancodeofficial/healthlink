-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('DOCTOR', 'PATIENT', 'PHARMACY', 'SUPERADMIN', 'ADMIN', 'SUPPORT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "BloodGroup" AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "ConsultationStatus" AS ENUM ('SCHEDULED', 'CHECKED_IN', 'WAITING', 'ONGOING', 'COMPLETED', 'CANCELLED', 'INITIATED', 'RINGING', 'ACCEPTED', 'REJECTED', 'MISSED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'APPROVED', 'CHECKED_IN', 'WAITING', 'IN_SESSION', 'COMPLETED', 'CANCELLED', 'SCHEDULED', 'NO_SHOW');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "Plan" AS ENUM ('MONTHLY', 'YEARLY');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "SubStatus" AS ENUM ('UNSUBSCRIBED', 'PENDING', 'ACTIVE', 'EXPIRED', 'DEACTIVATED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "PrescriptionDispatchStatus" AS ENUM ('NONE', 'SENT', 'ACKNOWLEDGED', 'READY', 'DISPENSED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "EncounterStatus" AS ENUM ('DRAFT', 'SIGNED', 'AMENDED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "LabStatus" AS ENUM ('ORDERED', 'PENDING', 'COMPLETED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "ReferralType" AS ENUM ('INTERNAL', 'EXTERNAL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "SlotStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'LOCKED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "TransactionType" AS ENUM ('SUBSCRIPTION_PAYMENT', 'ORDER_PAYMENT', 'CONSULTATION_PAYMENT', 'REFUND');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "NotificationType" AS ENUM ('APPOINTMENT', 'PRESCRIPTION', 'ORDER', 'MESSAGE', 'PAYMENT', 'SYSTEM');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT,
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
    "entityId" TEXT,
    "metadata" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DoctorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "customProfession" TEXT,
    "qualifications" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "hospitalAffiliation" TEXT,
    "yearsOfExperience" INTEGER,
    "consultationFee" DOUBLE PRECISION NOT NULL,
    "availability" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "bio" TEXT,
    "languages" TEXT,
    "emergencyContact" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactEmail" TEXT,
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
    "heightUnit" TEXT DEFAULT 'cm',
    "weight" DOUBLE PRECISION,
    "weightUnit" TEXT DEFAULT 'kg',
    "allergies" TEXT,
    "medications" TEXT,
    "medicalHistory" TEXT,
    "address" TEXT,
    "medicalRecordNumber" TEXT,
    "insuranceProvider" TEXT,
    "insuranceMemberId" TEXT,
    "emergencyContact" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactEmail" TEXT,
    "riskLevel" TEXT,
    "chronicConditions" TEXT,
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
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "reason" TEXT,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "chiefComplaint" TEXT,
    "intakeNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "roomName" TEXT,
    "callStatus" TEXT NOT NULL DEFAULT 'idle',

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DoctorSchedule" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "slotDuration" INTEGER NOT NULL DEFAULT 15,
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
    "isControlled" BOOLEAN NOT NULL DEFAULT false,
    "deaNumber" TEXT,
    "refills" INTEGER NOT NULL DEFAULT 0,
    "drugAlerts" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pharmacyId" TEXT,
    "dispatchStatus" "PrescriptionDispatchStatus" NOT NULL DEFAULT 'NONE',
    "dispatchedAt" TIMESTAMP(3),
    "encounterId" TEXT,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ClinicalEncounter" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "subjective" TEXT,
    "objective" TEXT,
    "assessment" TEXT,
    "plan" TEXT,
    "systolic" INTEGER,
    "diastolic" INTEGER,
    "pulse" INTEGER,
    "temperature" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "oxygenSat" INTEGER,
    "status" "EncounterStatus" NOT NULL DEFAULT 'DRAFT',
    "signedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicalEncounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "LabOrder" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "encounterId" TEXT,
    "testName" TEXT NOT NULL,
    "status" "LabStatus" NOT NULL DEFAULT 'ORDERED',
    "results" TEXT,
    "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "LabOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Referral" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "encounterId" TEXT,
    "targetDoctorId" TEXT,
    "specialistName" TEXT,
    "type" "ReferralType" NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Message" (
    "id" TEXT NOT NULL,
    "senderId" TEXT,
    "receiverId" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

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
    "actualStartTime" TIMESTAMP(3),
    "actualEndTime" TIMESTAMP(3),
    "recordingUrl" TEXT,
    "failureReason" TEXT,
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

-- CreateTable
CREATE TABLE IF NOT EXISTS "medicine" (
    "id" TEXT NOT NULL,
    "pharmacyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "genericName" TEXT,
    "category" TEXT NOT NULL,
    "manufacturer" TEXT,
    "description" TEXT,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "dosageForm" TEXT,
    "strength" TEXT,
    "packSize" INTEGER,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "requiresPrescription" BOOLEAN NOT NULL DEFAULT true,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 10,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medicine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "medicineorder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "pharmacyId" TEXT NOT NULL,
    "prescriptionId" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "deliveryFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "paymentReference" TEXT,
    "deliveryAddress" TEXT,
    "deliveryType" TEXT NOT NULL DEFAULT 'PICKUP',
    "estimatedDelivery" TIMESTAMP(3),
    "notes" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "medicineorder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "medicineorderitem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "medicineId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "medicineorderitem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "provider" TEXT NOT NULL,
    "providerTxId" TEXT,
    "providerCustomerId" TEXT,
    "subscriptionId" TEXT,
    "orderId" TEXT,
    "description" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "actionData" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "videosession" (
    "id" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "channelName" TEXT NOT NULL,
    "token" TEXT,
    "uid" TEXT,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "recordingUrl" TEXT,
    "recordingId" TEXT,

    CONSTRAINT "videosession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "systemmetric" (
    "id" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "metadata" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "systemmetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_organizationId_idx" ON "User"("organizationId");

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
CREATE INDEX IF NOT EXISTS "Appointment_appointmentDate_idx" ON "Appointment"("appointmentDate");

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
CREATE UNIQUE INDEX IF NOT EXISTS "ClinicalEncounter_appointmentId_key" ON "ClinicalEncounter"("appointmentId");

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

-- CreateIndex
CREATE INDEX IF NOT EXISTS "medicine_pharmacyId_idx" ON "medicine"("pharmacyId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "medicine_name_idx" ON "medicine"("name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "medicineorder_orderNumber_key" ON "medicineorder"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "medicineorder_paymentReference_key" ON "medicineorder"("paymentReference");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "medicineorder_patientId_idx" ON "medicineorder"("patientId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "medicineorder_pharmacyId_idx" ON "medicineorder"("pharmacyId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "medicineorder_status_idx" ON "medicineorder"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "medicineorder_orderNumber_idx" ON "medicineorder"("orderNumber");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "medicineorderitem_orderId_idx" ON "medicineorderitem"("orderId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "medicineorderitem_medicineId_idx" ON "medicineorderitem"("medicineId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "transaction_providerTxId_key" ON "transaction"("providerTxId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "transaction_userId_idx" ON "transaction"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "transaction_status_idx" ON "transaction"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "transaction_type_idx" ON "transaction"("type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "notification_userId_isRead_idx" ON "notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "notification_createdAt_idx" ON "notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "videosession_consultationId_key" ON "videosession"("consultationId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "videosession_channelName_key" ON "videosession"("channelName");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "systemmetric_metricType_recordedAt_idx" ON "systemmetric"("metricType", "recordedAt");

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'User_organizationId_fkey') THEN
        ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SupportAgent_userId_fkey') THEN
        ALTER TABLE "SupportAgent" ADD CONSTRAINT "SupportAgent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DoctorProfile_userId_fkey') THEN
        ALTER TABLE "DoctorProfile" ADD CONSTRAINT "DoctorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PharmacyProfile_userId_fkey') THEN
        ALTER TABLE "PharmacyProfile" ADD CONSTRAINT "PharmacyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PatientProfile_userId_fkey') THEN
        ALTER TABLE "PatientProfile" ADD CONSTRAINT "PatientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Appointment_doctorId_fkey') THEN
        ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Appointment_patientId_fkey') THEN
        ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "PatientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DoctorSchedule_doctorId_fkey') THEN
        ALTER TABLE "DoctorSchedule" ADD CONSTRAINT "DoctorSchedule_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SupportTicket_userId_fkey') THEN
        ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SupportTicket_agentId_fkey') THEN
        ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "SupportAgent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SupportReply_ticketId_fkey') THEN
        ALTER TABLE "SupportReply" ADD CONSTRAINT "SupportReply_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SupportReply_userId_fkey') THEN
        ALTER TABLE "SupportReply" ADD CONSTRAINT "SupportReply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Prescription_pharmacyId_fkey') THEN
        ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "PharmacyProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Prescription_doctorId_fkey') THEN
        ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Prescription_patientId_fkey') THEN
        ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "PatientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Prescription_encounterId_fkey') THEN
        ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "ClinicalEncounter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ClinicalEncounter_appointmentId_fkey') THEN
        ALTER TABLE "ClinicalEncounter" ADD CONSTRAINT "ClinicalEncounter_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ClinicalEncounter_doctorId_fkey') THEN
        ALTER TABLE "ClinicalEncounter" ADD CONSTRAINT "ClinicalEncounter_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ClinicalEncounter_patientId_fkey') THEN
        ALTER TABLE "ClinicalEncounter" ADD CONSTRAINT "ClinicalEncounter_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "PatientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LabOrder_doctorId_fkey') THEN
        ALTER TABLE "LabOrder" ADD CONSTRAINT "LabOrder_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LabOrder_patientId_fkey') THEN
        ALTER TABLE "LabOrder" ADD CONSTRAINT "LabOrder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "PatientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LabOrder_encounterId_fkey') THEN
        ALTER TABLE "LabOrder" ADD CONSTRAINT "LabOrder_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "ClinicalEncounter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Referral_doctorId_fkey') THEN
        ALTER TABLE "Referral" ADD CONSTRAINT "Referral_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Referral_targetDoctorId_fkey') THEN
        ALTER TABLE "Referral" ADD CONSTRAINT "Referral_targetDoctorId_fkey" FOREIGN KEY ("targetDoctorId") REFERENCES "DoctorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Referral_patientId_fkey') THEN
        ALTER TABLE "Referral" ADD CONSTRAINT "Referral_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "PatientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Referral_encounterId_fkey') THEN
        ALTER TABLE "Referral" ADD CONSTRAINT "Referral_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "ClinicalEncounter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Message_senderId_fkey') THEN
        ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Message_receiverId_fkey') THEN
        ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'VideoConsultation_doctorId_fkey') THEN
        ALTER TABLE "VideoConsultation" ADD CONSTRAINT "VideoConsultation_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'VideoConsultation_patientId_fkey') THEN
        ALTER TABLE "VideoConsultation" ADD CONSTRAINT "VideoConsultation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "PatientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Subscription_userId_fkey') THEN
        ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DoctorPatient_doctorId_fkey') THEN
        ALTER TABLE "DoctorPatient" ADD CONSTRAINT "DoctorPatient_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DoctorPatient_patientId_fkey') THEN
        ALTER TABLE "DoctorPatient" ADD CONSTRAINT "DoctorPatient_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "PatientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SelectedPharmacy_patientId_fkey') THEN
        ALTER TABLE "SelectedPharmacy" ADD CONSTRAINT "SelectedPharmacy_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "PatientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SelectedPharmacy_pharmacyId_fkey') THEN
        ALTER TABLE "SelectedPharmacy" ADD CONSTRAINT "SelectedPharmacy_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "PharmacyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'medicine_pharmacyId_fkey') THEN
        ALTER TABLE "medicine" ADD CONSTRAINT "medicine_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "PharmacyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'medicineorder_patientId_fkey') THEN
        ALTER TABLE "medicineorder" ADD CONSTRAINT "medicineorder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "PatientProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'medicineorder_pharmacyId_fkey') THEN
        ALTER TABLE "medicineorder" ADD CONSTRAINT "medicineorder_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "PharmacyProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'medicineorder_prescriptionId_fkey') THEN
        ALTER TABLE "medicineorder" ADD CONSTRAINT "medicineorder_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'medicineorderitem_orderId_fkey') THEN
        ALTER TABLE "medicineorderitem" ADD CONSTRAINT "medicineorderitem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "medicineorder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'medicineorderitem_medicineId_fkey') THEN
        ALTER TABLE "medicineorderitem" ADD CONSTRAINT "medicineorderitem_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "medicine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'transaction_userId_fkey') THEN
        ALTER TABLE "transaction" ADD CONSTRAINT "transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'transaction_subscriptionId_fkey') THEN
        ALTER TABLE "transaction" ADD CONSTRAINT "transaction_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'transaction_orderId_fkey') THEN
        ALTER TABLE "transaction" ADD CONSTRAINT "transaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "medicineorder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notification_userId_fkey') THEN
        ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'videosession_consultationId_fkey') THEN
        ALTER TABLE "videosession" ADD CONSTRAINT "videosession_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "VideoConsultation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;




-- ============================================================
-- CUREVIRTUAL - COMPLETE SUPABASE SQL SETUP SCRIPT
-- Run this ONCE in your Supabase SQL Editor
-- Project: vjplxrhaiyxqkkvjwuvy
-- ============================================================
-- NOTE: Prisma handles table creation via migrations.
-- This script handles: Enums, RLS, Policies, and Auth Triggers
-- that Prisma cannot manage automatically.
-- ============================================================


-- ============================================================
-- SECTION 1: ENUMS
-- (Prisma creates these, but we ensure all values exist)
-- ============================================================

DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('DOCTOR','PATIENT','PHARMACY','SUPERADMIN','ADMIN','SUPPORT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "Gender" AS ENUM ('MALE','FEMALE','OTHER','PREFER_NOT_TO_SAY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "BloodGroup" AS ENUM ('A+','A-','B+','B-','AB+','AB-','O+','O-','UNKNOWN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING','APPROVED','CHECKED_IN','WAITING','IN_SESSION','COMPLETED','CANCELLED','SCHEDULED','NO_SHOW');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ConsultationStatus" AS ENUM ('SCHEDULED','CHECKED_IN','WAITING','ONGOING','COMPLETED','CANCELLED','INITIATED','RINGING','ACCEPTED','REJECTED','MISSED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "Plan" AS ENUM ('MONTHLY','YEARLY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "SubStatus" AS ENUM ('UNSUBSCRIBED','PENDING','ACTIVE','EXPIRED','DEACTIVATED','FAILED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "TicketStatus" AS ENUM ('OPEN','IN_PROGRESS','RESOLVED','CLOSED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "Priority" AS ENUM ('LOW','MEDIUM','HIGH');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PrescriptionDispatchStatus" AS ENUM ('NONE','SENT','ACKNOWLEDGED','READY','DISPENSED','REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "EncounterStatus" AS ENUM ('DRAFT','SIGNED','AMENDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "LabStatus" AS ENUM ('ORDERED','PENDING','COMPLETED','CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ReferralType" AS ENUM ('INTERNAL','EXTERNAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "SlotStatus" AS ENUM ('AVAILABLE','BOOKED','LOCKED','CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "OrderStatus" AS ENUM ('PENDING','CONFIRMED','PROCESSING','READY_FOR_PICKUP','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "TransactionType" AS ENUM ('SUBSCRIPTION_PAYMENT','ORDER_PAYMENT','CONSULTATION_PAYMENT','REFUND');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "TransactionStatus" AS ENUM ('PENDING','SUCCESS','FAILED','REFUNDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "NotificationType" AS ENUM ('APPOINTMENT','PRESCRIPTION','ORDER','MESSAGE','PAYMENT','SYSTEM');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Safely add any missing enum values to existing enums
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPERADMIN';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'ADMIN';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPPORT';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'PHARMACY';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'DOCTOR';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'PATIENT';

ALTER TYPE "Gender" ADD VALUE IF NOT EXISTS 'MALE';
ALTER TYPE "Gender" ADD VALUE IF NOT EXISTS 'FEMALE';
ALTER TYPE "Gender" ADD VALUE IF NOT EXISTS 'OTHER';
ALTER TYPE "Gender" ADD VALUE IF NOT EXISTS 'PREFER_NOT_TO_SAY';


-- ============================================================
-- SECTION 2: AUTH TRIGGER — Sync Supabase Auth → Public User
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public."User" (id, email, "firstName", "lastName", role, phone, "updatedAt", "dateOfBirth", gender)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'firstName', 'Unknown'),
    COALESCE(new.raw_user_meta_data->>'lastName', 'Unknown'),
    COALESCE((new.raw_user_meta_data->>'role')::public."UserRole", 'PATIENT'),
    new.raw_user_meta_data->>'phone',
    NOW(),
    COALESCE(NULLIF(new.raw_user_meta_data->>'dateOfBirth', '')::timestamp, NOW()),
    COALESCE((new.raw_user_meta_data->>'gender')::public."Gender", 'PREFER_NOT_TO_SAY')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ============================================================
-- SECTION 3: ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================

ALTER TABLE "User"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Organization"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DoctorProfile"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PatientProfile"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PharmacyProfile"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DoctorSchedule"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DoctorPatient"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Prescription"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClinicalEncounter"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LabOrder"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Referral"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VideoConsultation"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SelectedPharmacy"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SubscriptionSetting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SystemSetting"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SupportTicket"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SupportReply"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SupportAgent"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ActivityLog"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "medicine"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "medicineorder"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "medicineorderitem"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transaction"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notification"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "videosession"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "systemmetric"        ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- SECTION 4: RLS POLICIES
-- ============================================================

-- ---- USER ----
DROP POLICY IF EXISTS "Admins can view all users"    ON "User";
DROP POLICY IF EXISTS "Support can view all users"   ON "User";
DROP POLICY IF EXISTS "Users can view own profile"   ON "User";
DROP POLICY IF EXISTS "Admins can update all users"  ON "User";
DROP POLICY IF EXISTS "Users can update own profile" ON "User";

CREATE POLICY "Admins can view all users" ON "User" FOR SELECT
  USING ((SELECT role FROM "User" WHERE id = auth.uid()::text) IN ('SUPERADMIN','ADMIN'));

CREATE POLICY "Support can view all users" ON "User" FOR SELECT
  USING ((SELECT role FROM "User" WHERE id = auth.uid()::text) = 'SUPPORT');

CREATE POLICY "Users can view own profile" ON "User" FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "Admins can update all users" ON "User" FOR UPDATE
  USING ((SELECT role FROM "User" WHERE id = auth.uid()::text) IN ('SUPERADMIN','ADMIN'))
  WITH CHECK ((SELECT role FROM "User" WHERE id = auth.uid()::text) IN ('SUPERADMIN','ADMIN'));

CREATE POLICY "Users can update own profile" ON "User" FOR UPDATE
  USING (auth.uid()::text = id);

-- ---- DOCTOR PROFILE (public read) ----
DROP POLICY IF EXISTS "Public can view doctors"         ON "DoctorProfile";
DROP POLICY IF EXISTS "Doctors manage own profile"      ON "DoctorProfile";
CREATE POLICY "Public can view doctors" ON "DoctorProfile"
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Doctors manage own profile" ON "DoctorProfile"
  FOR ALL TO authenticated USING (auth.uid()::text = "userId");

-- ---- PATIENT PROFILE ----
DROP POLICY IF EXISTS "Patients manage own profile"     ON "PatientProfile";
DROP POLICY IF EXISTS "Doctors view linked patients"    ON "PatientProfile";
CREATE POLICY "Patients manage own profile" ON "PatientProfile"
  FOR ALL TO authenticated USING (auth.uid()::text = "userId");
CREATE POLICY "Doctors view linked patients" ON "PatientProfile"
  FOR SELECT TO authenticated USING (
    auth.uid()::text IN (
      SELECT dp."userId" FROM "DoctorProfile" dp
      INNER JOIN "DoctorPatient" dpt ON dpt."doctorId" = dp.id
      WHERE dpt."patientId" = "PatientProfile".id
    )
  );

-- ---- PHARMACY PROFILE (public read) ----
DROP POLICY IF EXISTS "Public can view pharmacies"      ON "PharmacyProfile";
DROP POLICY IF EXISTS "Pharmacies manage own profile"   ON "PharmacyProfile";
CREATE POLICY "Public can view pharmacies" ON "PharmacyProfile"
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Pharmacies manage own profile" ON "PharmacyProfile"
  FOR ALL TO authenticated USING (auth.uid()::text = "userId");

-- ---- APPOINTMENTS ----
DROP POLICY IF EXISTS "Users view own appointments"     ON "Appointment";
DROP POLICY IF EXISTS "Patients book appointments"      ON "Appointment";
DROP POLICY IF EXISTS "Doctors update appointments"     ON "Appointment";
CREATE POLICY "Users view own appointments" ON "Appointment" FOR SELECT TO authenticated USING (
  "patientId" IN (SELECT id FROM "PatientProfile" WHERE "userId" = auth.uid()::text) OR
  "doctorId"  IN (SELECT id FROM "DoctorProfile"  WHERE "userId" = auth.uid()::text)
);
CREATE POLICY "Patients book appointments" ON "Appointment" FOR INSERT TO authenticated WITH CHECK (
  "patientId" IN (SELECT id FROM "PatientProfile" WHERE "userId" = auth.uid()::text)
);
CREATE POLICY "Doctors update appointments" ON "Appointment" FOR UPDATE TO authenticated USING (
  "doctorId" IN (SELECT id FROM "DoctorProfile" WHERE "userId" = auth.uid()::text)
);

-- ---- DOCTOR SCHEDULE ----
DROP POLICY IF EXISTS "Doctors manage own schedule"  ON "DoctorSchedule";
DROP POLICY IF EXISTS "Public view schedules"        ON "DoctorSchedule";
CREATE POLICY "Doctors manage own schedule" ON "DoctorSchedule"
  FOR ALL TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "DoctorProfile" WHERE id = "doctorId"));
CREATE POLICY "Public view schedules" ON "DoctorSchedule"
  FOR SELECT TO authenticated USING (true);

-- ---- DOCTOR-PATIENT LINKS ----
DROP POLICY IF EXISTS "Doctors see own patients"     ON "DoctorPatient";
DROP POLICY IF EXISTS "Patients see own doctors"     ON "DoctorPatient";
CREATE POLICY "Doctors see own patients" ON "DoctorPatient"
  FOR SELECT TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "DoctorProfile" WHERE id = "doctorId"));
CREATE POLICY "Patients see own doctors" ON "DoctorPatient"
  FOR SELECT TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "PatientProfile" WHERE id = "patientId"));

-- ---- PRESCRIPTIONS ----
DROP POLICY IF EXISTS "Doctors manage own prescriptions"       ON "Prescription";
DROP POLICY IF EXISTS "Patients view own prescriptions"        ON "Prescription";
DROP POLICY IF EXISTS "Pharmacies view assigned prescriptions" ON "Prescription";
CREATE POLICY "Doctors manage own prescriptions" ON "Prescription"
  FOR ALL TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "DoctorProfile" WHERE id = "doctorId"));
CREATE POLICY "Patients view own prescriptions" ON "Prescription"
  FOR SELECT TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "PatientProfile" WHERE id = "patientId"));
CREATE POLICY "Pharmacies view assigned prescriptions" ON "Prescription"
  FOR SELECT TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "PharmacyProfile" WHERE id = "pharmacyId"));

-- ---- CLINICAL ENCOUNTERS ----
DROP POLICY IF EXISTS "Doctors manage own encounters"  ON "ClinicalEncounter";
DROP POLICY IF EXISTS "Patients view own encounters"   ON "ClinicalEncounter";
CREATE POLICY "Doctors manage own encounters" ON "ClinicalEncounter"
  FOR ALL TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "DoctorProfile" WHERE id = "doctorId"));
CREATE POLICY "Patients view own encounters" ON "ClinicalEncounter"
  FOR SELECT TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "PatientProfile" WHERE id = "patientId"));

-- ---- LAB ORDERS ----
DROP POLICY IF EXISTS "Doctors manage own lab orders"  ON "LabOrder";
DROP POLICY IF EXISTS "Patients view own lab orders"   ON "LabOrder";
CREATE POLICY "Doctors manage own lab orders" ON "LabOrder"
  FOR ALL TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "DoctorProfile" WHERE id = "doctorId"));
CREATE POLICY "Patients view own lab orders" ON "LabOrder"
  FOR SELECT TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "PatientProfile" WHERE id = "patientId"));

-- ---- REFERRALS ----
DROP POLICY IF EXISTS "Referral visibility" ON "Referral";
CREATE POLICY "Referral visibility" ON "Referral" FOR SELECT TO authenticated USING (
  auth.uid()::text IN (SELECT "userId" FROM "DoctorProfile" WHERE id = "doctorId" OR id = "targetDoctorId") OR
  auth.uid()::text IN (SELECT "userId" FROM "PatientProfile" WHERE id = "patientId")
);

-- ---- MESSAGES ----
DROP POLICY IF EXISTS "Users read own messages"  ON "Message";
DROP POLICY IF EXISTS "Users send messages"      ON "Message";
CREATE POLICY "Users read own messages" ON "Message" FOR SELECT TO authenticated
  USING (auth.uid()::text = "senderId" OR auth.uid()::text = "receiverId");
CREATE POLICY "Users send messages" ON "Message" FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = "senderId");

-- ---- VIDEO CONSULTATIONS ----
DROP POLICY IF EXISTS "Users view own consultations"  ON "VideoConsultation";
CREATE POLICY "Users view own consultations" ON "VideoConsultation" FOR SELECT TO authenticated USING (
  auth.uid()::text IN (SELECT "userId" FROM "DoctorProfile"  WHERE id = "doctorId") OR
  auth.uid()::text IN (SELECT "userId" FROM "PatientProfile" WHERE id = "patientId")
);

-- ---- SELECTED PHARMACY ----
DROP POLICY IF EXISTS "Patients manage selected pharmacy" ON "SelectedPharmacy";
CREATE POLICY "Patients manage selected pharmacy" ON "SelectedPharmacy"
  FOR ALL TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "PatientProfile" WHERE id = "patientId"));

-- ---- SUBSCRIPTIONS ----
DROP POLICY IF EXISTS "Users view own subscriptions" ON "Subscription";
CREATE POLICY "Users view own subscriptions" ON "Subscription"
  FOR SELECT TO authenticated USING (auth.uid()::text = "userId");

-- ---- SYSTEM/GLOBAL SETTINGS (read-only) ----
DROP POLICY IF EXISTS "Users view settings"        ON "SubscriptionSetting";
DROP POLICY IF EXISTS "Users view system settings" ON "SystemSetting";
CREATE POLICY "Users view settings"        ON "SubscriptionSetting" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users view system settings" ON "SystemSetting"       FOR SELECT TO authenticated USING (true);

-- ---- SUPPORT TICKETS ----
DROP POLICY IF EXISTS "Users manage own tickets"  ON "SupportTicket";
DROP POLICY IF EXISTS "Users manage own replies"  ON "SupportReply";
CREATE POLICY "Users manage own tickets" ON "SupportTicket"
  FOR ALL TO authenticated USING (auth.uid()::text = "userId");
CREATE POLICY "Users manage own replies" ON "SupportReply"
  FOR ALL TO authenticated USING (auth.uid()::text = "userId");

-- ---- MEDICINE (Inventory) ----
DROP POLICY IF EXISTS "Public view medicines"          ON "medicine";
DROP POLICY IF EXISTS "Pharmacies manage own medicines" ON "medicine";
CREATE POLICY "Public view medicines" ON "medicine"
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Pharmacies manage own medicines" ON "medicine"
  FOR ALL TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "PharmacyProfile" WHERE id = "pharmacyId"));

-- ---- MEDICINE ORDERS ----
DROP POLICY IF EXISTS "Patients view own medicine orders"    ON "medicineorder";
DROP POLICY IF EXISTS "Patients create own medicine orders"  ON "medicineorder";
DROP POLICY IF EXISTS "Pharmacies manage own medicine orders" ON "medicineorder";
CREATE POLICY "Patients view own medicine orders" ON "medicineorder"
  FOR SELECT TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "PatientProfile" WHERE id = "patientId"));
CREATE POLICY "Patients create own medicine orders" ON "medicineorder"
  FOR INSERT TO authenticated WITH CHECK (auth.uid()::text IN (SELECT "userId" FROM "PatientProfile" WHERE id = "patientId"));
CREATE POLICY "Pharmacies manage own medicine orders" ON "medicineorder"
  FOR ALL TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "PharmacyProfile" WHERE id = "pharmacyId"));

-- ---- MEDICINE ORDER ITEMS ----
DROP POLICY IF EXISTS "Medicine order item visibility" ON "medicineorderitem";
CREATE POLICY "Medicine order item visibility" ON "medicineorderitem"
  FOR SELECT TO authenticated USING (true);

-- ---- TRANSACTIONS ----
DROP POLICY IF EXISTS "Users view own transactions" ON "transaction";
CREATE POLICY "Users view own transactions" ON "transaction"
  FOR SELECT TO authenticated USING (auth.uid()::text = "userId");

-- ---- NOTIFICATIONS ----
DROP POLICY IF EXISTS "Users manage own notifications" ON "notification";
CREATE POLICY "Users manage own notifications" ON "notification"
  FOR ALL TO authenticated USING (auth.uid()::text = "userId");

-- ---- VIDEO SESSION ----
DROP POLICY IF EXISTS "Consultation parties view session" ON "videosession";
CREATE POLICY "Consultation parties view session" ON "videosession"
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM "VideoConsultation" vc
      WHERE vc.id = "consultationId"
        AND (
          auth.uid()::text IN (SELECT "userId" FROM "DoctorProfile"  WHERE id = vc."doctorId") OR
          auth.uid()::text IN (SELECT "userId" FROM "PatientProfile" WHERE id = vc."patientId")
        )
    )
  );

-- ---- ACTIVITY LOG & SYSTEM METRICS (admin only) ----
DROP POLICY IF EXISTS "Admins view activity logs"   ON "ActivityLog";
DROP POLICY IF EXISTS "Admins view system metrics"  ON "systemmetric";
CREATE POLICY "Admins view activity logs" ON "ActivityLog"
  FOR SELECT TO authenticated USING (
    (SELECT role FROM "User" WHERE id = auth.uid()::text) IN ('SUPERADMIN','ADMIN')
  );
CREATE POLICY "Admins view system metrics" ON "systemmetric"
  FOR SELECT TO authenticated USING (
    (SELECT role FROM "User" WHERE id = auth.uid()::text) IN ('SUPERADMIN','ADMIN')
  );


-- ============================================================
-- SECTION 5: SEED DEFAULTS (Optional — run once)
-- ============================================================

-- Default Subscription Settings (if not already inserted)
INSERT INTO "SubscriptionSetting" (id, "doctorMonthlyUsd", "doctorYearlyUsd", "patientMonthlyUsd", "patientYearlyUsd", "pharmacyMonthlyUsd", "pharmacyYearlyUsd", "createdAt", "updatedAt")
VALUES (1, 29.99, 299.99, 9.99, 99.99, 19.99, 199.99, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Default System Settings (if not already inserted)
INSERT INTO "SystemSetting" (id, "systemName", "themeColor", "createdAt", "updatedAt")
VALUES (1, 'CureVirtual', '#4F46E5', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- DONE ✅
-- ============================================================
