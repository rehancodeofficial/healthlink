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
