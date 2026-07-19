-- =============================================================================
-- 1. Update Enum for User Roles (Mirroring Prisma)
-- =============================================================================
-- We use ALTER TYPE because the enum likely already exists from Prisma
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPERADMIN';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'ADMIN';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPPORT';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'PHARMACY';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'DOCTOR';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'PATIENT';

-- Also ensure Gender enum has what we need
ALTER TYPE "Gender" ADD VALUE IF NOT EXISTS 'MALE';
ALTER TYPE "Gender" ADD VALUE IF NOT EXISTS 'FEMALE';
ALTER TYPE "Gender" ADD VALUE IF NOT EXISTS 'OTHER';
ALTER TYPE "Gender" ADD VALUE IF NOT EXISTS 'PREFER_NOT_TO_SAY';

-- Ensure public.User exists (Prisma should create this, but RLS needs to be on it)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 3. RLS Policies for "User" Table
-- =============================================================================

-- POLICY: SUPERADMIN and ADMIN can see ALL users
DROP POLICY IF EXISTS "Admins can view all users" ON "User";
CREATE POLICY "Admins can view all users"
ON "User"
FOR SELECT
USING (
  (SELECT role FROM "User" WHERE id = auth.uid()::text) IN ('SUPERADMIN', 'ADMIN')
);

-- POLICY: SUPPORT can view all users (read-only)
DROP POLICY IF EXISTS "Support can view all users" ON "User";
CREATE POLICY "Support can view all users"
ON "User"
FOR SELECT
USING (
  (SELECT role FROM "User" WHERE id = auth.uid()::text) = 'SUPPORT'
);

-- POLICY: Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON "User";
CREATE POLICY "Users can view own profile"
ON "User"
FOR SELECT
USING (
  auth.uid()::text = id
);

-- POLICY: Upload/Update - Admins Only or Self
DROP POLICY IF EXISTS "Admins can update all users" ON "User";
CREATE POLICY "Admins can update all users"
ON "User"
FOR UPDATE
USING (
  (SELECT role FROM "User" WHERE id = auth.uid()::text) IN ('SUPERADMIN', 'ADMIN')
)
WITH CHECK (
  (SELECT role FROM "User" WHERE id = auth.uid()::text) IN ('SUPERADMIN', 'ADMIN')
);

DROP POLICY IF EXISTS "Users can update own profile" ON "User";
CREATE POLICY "Users can update own profile"
ON "User"
FOR UPDATE
USING (
  auth.uid()::text = id
);

-- =============================================================================
-- 4. Trigger to Sync New Auth Users to Public User Table
-- =============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public."User" (id, email, "firstName", "lastName", role, "updatedAt", "dateOfBirth", gender)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'firstName',
    new.raw_user_meta_data->>'lastName',
    COALESCE((new.raw_user_meta_data->>'role')::"UserRole", 'PATIENT'),
    now(),
    COALESCE((new.raw_user_meta_data->>'dateOfBirth')::timestamp, now()),
    COALESCE((new.raw_user_meta_data->>'gender')::"Gender", 'PREFER_NOT_TO_SAY')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
