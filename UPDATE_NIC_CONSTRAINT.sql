-- SQL to ensure CNIC (NIC) is unique and optional
-- This can be run in the Supabase SQL Editor if Prisma migrations are not being used for this specific change.

-- 1. Ensure the column is nullable (optional)
ALTER TABLE "User" ALTER COLUMN "nic" DROP NOT NULL;

-- 2. Add a unique constraint/index on the "nic" column
-- We use a unique index which allows multiple NULL values but ensures unique non-null values.
DROP INDEX IF EXISTS "User_nic_key";
CREATE UNIQUE INDEX "User_nic_key" ON "User"("nic") WHERE "nic" IS NOT NULL;

-- 3. Verify the changes
-- SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'nic';
