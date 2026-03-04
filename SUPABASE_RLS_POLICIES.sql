-- ============================================
-- Row Level Security (RLS) Policies for User Signup
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Enable RLS on User table (if not already enabled)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Allow service role to insert users" ON "User";
DROP POLICY IF EXISTS "Allow service role to select users" ON "User";
DROP POLICY IF EXISTS "Allow service role to update users" ON "User";
DROP POLICY IF EXISTS "Users can read own data" ON "User";
DROP POLICY IF EXISTS "Users can update own data" ON "User";

-- 3. Service Role Policies (Backend API)
-- Service role needs full access for signup/sync operations
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
  USING (true);

-- 4. Authenticated User Policies
-- Users can only read/update their own data
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
-- Profile Tables RLS Policies
-- ============================================

-- DoctorProfile
ALTER TABLE "DoctorProfile" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to doctor profiles" ON "DoctorProfile";
DROP POLICY IF EXISTS "Doctors can view own profile" ON "DoctorProfile";
DROP POLICY IF EXISTS "Doctors can update own profile" ON "DoctorProfile";

CREATE POLICY "Service role full access to doctor profiles"
  ON "DoctorProfile"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

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

-- PatientProfile
ALTER TABLE "PatientProfile" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to patient profiles" ON "PatientProfile";
DROP POLICY IF EXISTS "Patients can view own profile" ON "PatientProfile";
DROP POLICY IF EXISTS "Patients can update own profile" ON "PatientProfile";

CREATE POLICY "Service role full access to patient profiles"
  ON "PatientProfile"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

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

-- PharmacyProfile
ALTER TABLE "PharmacyProfile" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to pharmacy profiles" ON "PharmacyProfile";
DROP POLICY IF EXISTS "Pharmacies can view own profile" ON "PharmacyProfile";
DROP POLICY IF EXISTS "Pharmacies can update own profile" ON "PharmacyProfile";

CREATE POLICY "Service role full access to pharmacy profiles"
  ON "PharmacyProfile"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

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

-- ============================================
-- Organization Table RLS
-- ============================================

ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to organizations" ON "Organization";
DROP POLICY IF EXISTS "Users can view own organization" ON "Organization";

CREATE POLICY "Service role full access to organizations"
  ON "Organization"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

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

-- ============================================
-- Verify Policies
-- ============================================

-- Run this to check all policies are created:
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('User', 'DoctorProfile', 'PatientProfile', 'PharmacyProfile', 'Organization')
ORDER BY tablename, policyname;
