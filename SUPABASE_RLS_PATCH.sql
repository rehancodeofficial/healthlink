-- ============================================
-- CUREVIRTUAL - RLS SECURITY PATCH (FINAL)
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. CLINICAL ENCOUNTERS
ALTER TABLE "ClinicalEncounter" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Doctors manage own encounters" ON "ClinicalEncounter";
CREATE POLICY "Doctors manage own encounters" ON "ClinicalEncounter"
  FOR ALL TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "DoctorProfile" WHERE id = "doctorId"));
DROP POLICY IF EXISTS "Patients view own encounters" ON "ClinicalEncounter";
CREATE POLICY "Patients view own encounters" ON "ClinicalEncounter"
  FOR SELECT TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "PatientProfile" WHERE id = "patientId"));

-- 2. DOCTOR-PATIENT RELATIONSHIPS
ALTER TABLE "DoctorPatient" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Doctors see own patients" ON "DoctorPatient";
CREATE POLICY "Doctors see own patients" ON "DoctorPatient"
  FOR SELECT TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "DoctorProfile" WHERE id = "doctorId"));
DROP POLICY IF EXISTS "Patients see own doctors" ON "DoctorPatient";
CREATE POLICY "Patients see own doctors" ON "DoctorPatient"
  FOR SELECT TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "PatientProfile" WHERE id = "patientId"));

-- 3. DOCTOR SCHEDULES
ALTER TABLE "DoctorSchedule" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Doctors manage own schedule" ON "DoctorSchedule";
CREATE POLICY "Doctors manage own schedule" ON "DoctorSchedule"
  FOR ALL TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "DoctorProfile" WHERE id = "doctorId"));
DROP POLICY IF EXISTS "Public view schedules" ON "DoctorSchedule";
CREATE POLICY "Public view schedules" ON "DoctorSchedule"
  FOR SELECT TO authenticated USING (true);

-- 4. LAB ORDERS
ALTER TABLE "LabOrder" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Doctors manage own lab orders" ON "LabOrder";
CREATE POLICY "Doctors manage own lab orders" ON "LabOrder"
  FOR ALL TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "DoctorProfile" WHERE id = "doctorId"));
DROP POLICY IF EXISTS "Patients view own lab orders" ON "LabOrder";
CREATE POLICY "Patients view own lab orders" ON "LabOrder"
  FOR SELECT TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "PatientProfile" WHERE id = "patientId"));

-- 5. MEDICINE ORDER ITEMS
ALTER TABLE "medicineorderitem" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Medicine order item visibility" ON "medicineorderitem";
CREATE POLICY "Medicine order item visibility" ON "medicineorderitem"
  FOR SELECT TO authenticated USING (true);

-- 6. MESSAGES
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own messages" ON "Message";
CREATE POLICY "Users read own messages" ON "Message"
  FOR SELECT TO authenticated USING (auth.uid()::text = "senderId" OR auth.uid()::text = "receiverId" OR auth.uid()::text IS NULL); -- IS NULL for system/unassigned messages
DROP POLICY IF EXISTS "Users send messages" ON "Message";
CREATE POLICY "Users send messages" ON "Message"
  FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = "senderId");

-- 7. NOTIFICATIONS
ALTER TABLE "notification" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own notifications" ON "notification";
CREATE POLICY "Users manage own notifications" ON "notification"
  FOR ALL TO authenticated USING (auth.uid()::text = "userId");

-- 8. PRESCRIPTIONS
ALTER TABLE "Prescription" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Doctors manage own prescriptions" ON "Prescription";
CREATE POLICY "Doctors manage own prescriptions" ON "Prescription"
  FOR ALL TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "DoctorProfile" WHERE id = "doctorId"));
DROP POLICY IF EXISTS "Patients view own prescriptions" ON "Prescription";
CREATE POLICY "Patients view own prescriptions" ON "Prescription"
  FOR SELECT TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "PatientProfile" WHERE id = "patientId"));
DROP POLICY IF EXISTS "Pharmacies view assigned prescriptions" ON "Prescription";
CREATE POLICY "Pharmacies view assigned prescriptions" ON "Prescription"
  FOR SELECT TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "PharmacyProfile" WHERE id = "pharmacyId"));

-- 9. REFERRALS
ALTER TABLE "Referral" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Referral visibility" ON "Referral";
CREATE POLICY "Referral visibility" ON "Referral"
  FOR SELECT TO authenticated USING (
    auth.uid()::text IN (SELECT "userId" FROM "DoctorProfile" WHERE id = "doctorId" OR id = "targetDoctorId") OR
    auth.uid()::text IN (SELECT "userId" FROM "PatientProfile" WHERE id = "patientId")
  );

-- 10. SELECTED PHARMACY
ALTER TABLE "SelectedPharmacy" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Patients manage selected pharmacy" ON "SelectedPharmacy";
CREATE POLICY "Patients manage selected pharmacy" ON "SelectedPharmacy"
  FOR ALL TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "PatientProfile" WHERE id = "patientId"));

-- 11. APPOINTMENTS
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own appointments" ON "Appointment";
CREATE POLICY "Users view own appointments" ON "Appointment"
  FOR SELECT TO authenticated USING (
    "patientId" IN (SELECT id FROM "PatientProfile" WHERE "userId" = auth.uid()::text) OR
    "doctorId" IN (SELECT id FROM "DoctorProfile" WHERE "userId" = auth.uid()::text)
  );
DROP POLICY IF EXISTS "Patients book appointments" ON "Appointment";
CREATE POLICY "Patients book appointments" ON "Appointment"
  FOR INSERT TO authenticated WITH CHECK (
    "patientId" IN (SELECT id FROM "PatientProfile" WHERE "userId" = auth.uid()::text)
  );

-- 12. SUBSCRIPTIONS & TRANSACTIONS
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transaction" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own subscriptions" ON "Subscription";
CREATE POLICY "Users view own subscriptions" ON "Subscription" FOR SELECT TO authenticated USING (auth.uid()::text = "userId");
DROP POLICY IF EXISTS "Users view own transactions" ON "transaction";
CREATE POLICY "Users view own transactions" ON "transaction" FOR SELECT TO authenticated USING (auth.uid()::text = "userId");

-- 13. SYSTEM SETTINGS (Read-only for users)
ALTER TABLE "SubscriptionSetting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SystemSetting" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view settings" ON "SubscriptionSetting";
CREATE POLICY "Users view settings" ON "SubscriptionSetting" FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Users view system settings" ON "SystemSetting";
CREATE POLICY "Users view system settings" ON "SystemSetting" FOR SELECT TO authenticated USING (true);

-- 14. SUPPORT TICKETS & REPLIES
ALTER TABLE "SupportTicket" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SupportReply" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own tickets" ON "SupportTicket";
CREATE POLICY "Users manage own tickets" ON "SupportTicket"
  FOR ALL TO authenticated USING (auth.uid()::text = "userId");
DROP POLICY IF EXISTS "Users manage own replies" ON "SupportReply";
CREATE POLICY "Users manage own replies" ON "SupportReply"
  FOR ALL TO authenticated USING (auth.uid()::text = "userId");

-- 15. ADMIN/ANALYTICS (Restricted)
ALTER TABLE "SupportAgent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "systemmetric" ENABLE ROW LEVEL SECURITY;

-- 16. MEDICINE ORDERS
ALTER TABLE "medicineorder" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Patients view own medicine orders" ON "medicineorder";
CREATE POLICY "Patients view own medicine orders" ON "medicineorder"
  FOR SELECT TO authenticated USING (
    auth.uid()::text IN (SELECT "userId" FROM "PatientProfile" WHERE id = "patientId")
  );
DROP POLICY IF EXISTS "Patients create own medicine orders" ON "medicineorder";
CREATE POLICY "Patients create own medicine orders" ON "medicineorder"
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid()::text IN (SELECT "userId" FROM "PatientProfile" WHERE id = "patientId")
  );
DROP POLICY IF EXISTS "Pharmacies manage own medicine orders" ON "medicineorder";
CREATE POLICY "Pharmacies manage own medicine orders" ON "medicineorder"
  FOR ALL TO authenticated USING (
    auth.uid()::text IN (SELECT "userId" FROM "PharmacyProfile" WHERE id = "pharmacyId")
  );

-- 17. MEDICINES (Inventory)
ALTER TABLE "medicine" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public view medicines" ON "medicine";
CREATE POLICY "Public view medicines" ON "medicine"
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Pharmacies manage own medicines" ON "medicine";
CREATE POLICY "Pharmacies manage own medicines" ON "medicine"
  FOR ALL TO authenticated USING (
    auth.uid()::text IN (SELECT "userId" FROM "PharmacyProfile" WHERE id = "pharmacyId")
  );
