-- ============================================
-- SUPABASE RLS POLICIES - COMPLETE SETUP
-- Run this in Supabase SQL Editor
-- Project: CureVirtual
-- Last Updated: 2026-02-09
-- ============================================

-- ============================================
-- PART 1: USER TABLE POLICIES
-- ============================================

-- Enable RLS on User table
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Drop all existing User policies (clean slate)
DROP POLICY IF EXISTS "Allow service role to insert users" ON "User";
DROP POLICY IF EXISTS "Allow service role to select users" ON "User";
DROP POLICY IF EXISTS "Allow service role to update users" ON "User";
DROP POLICY IF EXISTS "Allow service role to delete users" ON "User";
DROP POLICY IF EXISTS "Users can read own data" ON "User";
DROP POLICY IF EXISTS "Users can update own data" ON "User";

-- Service Role Policies (Backend API - Full Access)
CREATE POLICY "Allow service role to insert users"
  ON "User"
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Allow service role to select users"
  ON "User"
  FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Allow service role to update users"
  ON "User"
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role to delete users"
  ON "User"
  FOR DELETE
  TO service_role
  USING (true);

-- Authenticated User Policies (Frontend - Own Data Only)
CREATE POLICY "Users can read own data"
  ON "User"
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id);

CREATE POLICY "Users can update own data"
  ON "User"
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- ============================================
-- PART 2: DOCTOR PROFILE POLICIES
-- ============================================

ALTER TABLE "DoctorProfile" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Service role full access to doctor profiles" ON "DoctorProfile";
DROP POLICY IF EXISTS "Doctors can view own profile" ON "DoctorProfile";
DROP POLICY IF EXISTS "Doctors can update own profile" ON "DoctorProfile";
DROP POLICY IF EXISTS "Public can view doctor profiles" ON "DoctorProfile";

-- Service role full access
CREATE POLICY "Service role full access to doctor profiles"
  ON "DoctorProfile"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Doctors can manage their own profile
CREATE POLICY "Doctors can view own profile"
  ON "DoctorProfile"
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = "userId");

CREATE POLICY "Doctors can update own profile"
  ON "DoctorProfile"
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- Public/patients can view doctor profiles (for booking)
CREATE POLICY "Public can view doctor profiles"
  ON "DoctorProfile"
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- PART 3: PATIENT PROFILE POLICIES
-- ============================================

ALTER TABLE "PatientProfile" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Service role full access to patient profiles" ON "PatientProfile";
DROP POLICY IF EXISTS "Patients can view own profile" ON "PatientProfile";
DROP POLICY IF EXISTS "Patients can update own profile" ON "PatientProfile";

-- Service role full access
CREATE POLICY "Service role full access to patient profiles"
  ON "PatientProfile"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Patients can manage their own profile
CREATE POLICY "Patients can view own profile"
  ON "PatientProfile"
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = "userId");

CREATE POLICY "Patients can update own profile"
  ON "PatientProfile"
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- ============================================
-- PART 4: PHARMACY PROFILE POLICIES
-- ============================================

ALTER TABLE "PharmacyProfile" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Service role full access to pharmacy profiles" ON "PharmacyProfile";
DROP POLICY IF EXISTS "Pharmacies can view own profile" ON "PharmacyProfile";
DROP POLICY IF EXISTS "Pharmacies can update own profile" ON "PharmacyProfile";
DROP POLICY IF EXISTS "Public can view pharmacy profiles" ON "PharmacyProfile";

-- Service role full access
CREATE POLICY "Service role full access to pharmacy profiles"
  ON "PharmacyProfile"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Pharmacies can manage their own profile
CREATE POLICY "Pharmacies can view own profile"
  ON "PharmacyProfile"
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = "userId");

CREATE POLICY "Pharmacies can update own profile"
  ON "PharmacyProfile"
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- Public/patients can view pharmacy profiles (for selection)
CREATE POLICY "Public can view pharmacy profiles"
  ON "PharmacyProfile"
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- PART 5: ORGANIZATION POLICIES
-- ============================================

ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Service role full access to organizations" ON "Organization";
DROP POLICY IF EXISTS "Users can view own organization" ON "Organization";
DROP POLICY IF EXISTS "Organization owners can manage" ON "Organization";

-- Service role full access
CREATE POLICY "Service role full access to organizations"
  ON "Organization"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can view their own organization
CREATE POLICY "Users can view own organization"
  ON "Organization"
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT "organizationId" 
      FROM "User" 
      WHERE id = auth.uid()::text
    )
  );

-- Organization owners can manage their organization
CREATE POLICY "Organization owners can manage"
  ON "Organization"
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = "ownerId")
  WITH CHECK (auth.uid()::text = "ownerId");

-- ============================================
-- PART 6: APPOINTMENT POLICIES (If needed)
-- ============================================

-- Note: Add these if you want to enable RLS on appointments
-- ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;

-- DROP POLICY IF EXISTS "Service role full access to appointments" ON "Appointment";
-- DROP POLICY IF EXISTS "Users can view own appointments" ON "Appointment";

-- CREATE POLICY "Service role full access to appointments"
--   ON "Appointment"
--   FOR ALL
--   TO service_role
--   USING (true)
--   WITH CHECK (true);

-- CREATE POLICY "Users can view own appointments"
--   ON "Appointment"
--   FOR SELECT
--   TO authenticated
--   USING (
--     "patientId" = auth.uid()::text 
--     OR "doctorId" = auth.uid()::text
--   );

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('User', 'DoctorProfile', 'PatientProfile', 'PharmacyProfile', 'Organization')
ORDER BY tablename, policyname;

-- Check RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('User', 'DoctorProfile', 'PatientProfile', 'PharmacyProfile', 'Organization')
ORDER BY tablename;

-- Test: Check if you can query User table (should work with service role)
-- SELECT COUNT(*) FROM "User";

-- ============================================
-- IMPORTANT NOTES
-- ============================================

-- 1. Service Role Key (Backend):
--    - Used by Railway backend (SUPABASE_SERVICE_ROLE_KEY)
--    - Bypasses ALL RLS policies
--    - Has full database access
--    - Should NEVER be exposed to frontend

-- 2. Anon Key (Frontend):
--    - Used by Vercel frontend (VITE_SUPABASE_ANON_KEY)
--    - Subject to RLS policies
--    - Users can only access their own data
--    - Safe to expose in client-side code

-- 3. auth.uid():
--    - Returns the UUID of the currently authenticated user
--    - Must be cast to text (::text) to match User.id type
--    - Only available when user is authenticated via Supabase Auth

-- 4. Policy Roles:
--    - service_role: Backend API with full access
--    - authenticated: Logged-in users via Supabase Auth
--    - anon: Unauthenticated users (not used in these policies)

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- If signup still fails:

-- 1. Verify service role key is correct:
--    Check Railway environment variable SUPABASE_SERVICE_ROLE_KEY

-- 2. Check backend logs for specific errors:
--    Should show "✅ User created successfully: <uuid>"

-- 3. Test RLS policies manually:
--    Run queries with different roles in Supabase SQL Editor

-- 4. Disable RLS temporarily to test (NOT for production):
--    ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
--    Try signup, then re-enable:
--    ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
