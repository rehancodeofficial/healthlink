-- ============================================================
-- REMOVE NIC (CNIC) COMPLETELY FROM DATABASE
-- Run this in your Supabase SQL Editor
-- ============================================================

-- STEP 1: Drop the unique constraint on NIC
ALTER TABLE public."User"
DROP CONSTRAINT IF EXISTS "User_nic_key";

-- STEP 2: Drop the NIC column entirely
ALTER TABLE public."User"
DROP COLUMN IF EXISTS nic;

-- STEP 3: Update the auth trigger to stop referencing NIC
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
