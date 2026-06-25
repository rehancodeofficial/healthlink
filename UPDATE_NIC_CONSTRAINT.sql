-- REMOVE NIC (CNIC) COLUMN FROM USER TABLE
-- Run this in your Supabase SQL Editor to drop the NIC column and its constraints.

-- 1. Drop the unique constraint on NIC (if it still exists)
ALTER TABLE public."User"
DROP CONSTRAINT IF EXISTS "User_nic_key";

-- 2. Drop the NIC column entirely
ALTER TABLE public."User"
DROP COLUMN IF EXISTS nic;
