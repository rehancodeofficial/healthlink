-- ============================================
-- CUREVIRTUAL - RLS SECURITY PATCH (FINAL)
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. CLINICAL ENCOUNTERS
ALTER TABLE "ClinicalEncounter" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctors manage own encounters" ON "ClinicalEncounter"
  FOR ALL TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "DoctorProfile" WHERE id = "doctorId"));
CREATE POLICY "Patients view own encounters" ON "ClinicalEncounter"
  FOR SELECT TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "PatientProfile" WHERE id = "patientId"));

-- 2. DOCTOR-PATIENT RELATIONSHIPS
ALTER TABLE "DoctorPatient" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctors see own patients" ON "DoctorPatient"
  FOR SELECT TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "DoctorProfile" WHERE id = "doctorId"));
CREATE POLICY "Patients see own doctors" ON "DoctorPatient"
  FOR SELECT TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "PatientProfile" WHERE id = "patientId"));

-- 3. DOCTOR SCHEDULES
ALTER TABLE "DoctorSchedule" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctors manage own schedule" ON "DoctorSchedule"
  FOR ALL TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "DoctorProfile" WHERE id = "doctorId"));
CREATE POLICY "Public view schedules" ON "DoctorSchedule"
  FOR SELECT TO authenticated USING (true);

-- 4. LAB ORDERS
ALTER TABLE "LabOrder" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctors manage own lab orders" ON "LabOrder"
  FOR ALL TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "DoctorProfile" WHERE id = "doctorId"));
CREATE POLICY "Patients view own lab orders" ON "LabOrder"
  FOR SELECT TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "PatientProfile" WHERE id = "patientId"));

-- 5. MEDICINE ORDER ITEMS
ALTER TABLE "medicineorderitem" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Medicine order item visibility" ON "medicineorderitem"
  FOR SELECT TO authenticated USING (true);

-- 6. MESSAGES
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own messages" ON "Message"
  FOR SELECT TO authenticated USING (auth.uid()::text = "senderId" OR auth.uid()::text = "receiverId" OR auth.uid()::text IS NULL); -- IS NULL for system/unassigned messages
CREATE POLICY "Users send messages" ON "Message"
  FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = "senderId");

-- 7. NOTIFICATIONS
ALTER TABLE "notification" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notifications" ON "notification"
  FOR ALL TO authenticated USING (auth.uid()::text = "userId");

-- 8. PRESCRIPTIONS
ALTER TABLE "Prescription" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctors manage own prescriptions" ON "Prescription"
  FOR ALL TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "DoctorProfile" WHERE id = "doctorId"));
CREATE POLICY "Patients view own prescriptions" ON "Prescription"
  FOR SELECT TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "PatientProfile" WHERE id = "patientId"));
CREATE POLICY "Pharmacies view assigned prescriptions" ON "Prescription"
  FOR SELECT TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "PharmacyProfile" WHERE id = "pharmacyId"));

-- 9. REFERRALS
ALTER TABLE "Referral" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Referral visibility" ON "Referral"
  FOR SELECT TO authenticated USING (
    auth.uid()::text IN (SELECT "userId" FROM "DoctorProfile" WHERE id = "doctorId" OR id = "targetDoctorId") OR
    auth.uid()::text IN (SELECT "userId" FROM "PatientProfile" WHERE id = "patientId")
  );

-- 10. SELECTED PHARMACY
ALTER TABLE "SelectedPharmacy" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients manage selected pharmacy" ON "SelectedPharmacy"
  FOR ALL TO authenticated USING (auth.uid()::text IN (SELECT "userId" FROM "PatientProfile" WHERE id = "patientId"));

-- 11. APPOINTMENTS
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own appointments" ON "Appointment"
  FOR SELECT TO authenticated USING (
    "patientId" IN (SELECT id FROM "PatientProfile" WHERE "userId" = auth.uid()::text) OR
    "doctorId" IN (SELECT id FROM "DoctorProfile" WHERE "userId" = auth.uid()::text)
  );
CREATE POLICY "Patients book appointments" ON "Appointment"
  FOR INSERT TO authenticated WITH CHECK (
    "patientId" IN (SELECT id FROM "PatientProfile" WHERE "userId" = auth.uid()::text)
  );

-- 12. SUBSCRIPTIONS & TRANSACTIONS
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transaction" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own subscriptions" ON "Subscription" FOR SELECT TO authenticated USING (auth.uid()::text = "userId");
CREATE POLICY "Users view own transactions" ON "transaction" FOR SELECT TO authenticated USING (auth.uid()::text = "userId");

-- 13. SYSTEM SETTINGS (Read-only for users)
ALTER TABLE "SubscriptionSetting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SystemSetting" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view settings" ON "SubscriptionSetting" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users view system settings" ON "SystemSetting" FOR SELECT TO authenticated USING (true);

-- 14. SUPPORT TICKETS & REPLIES
ALTER TABLE "SupportTicket" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SupportReply" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tickets" ON "SupportTicket"
  FOR ALL TO authenticated USING (auth.uid()::text = "userId");
CREATE POLICY "Users manage own replies" ON "SupportReply"
  FOR ALL TO authenticated USING (auth.uid()::text = "userId");

-- 15. ADMIN/ANALYTICS (Restricted)
ALTER TABLE "SupportAgent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "systemmetric" ENABLE ROW LEVEL SECURITY;
