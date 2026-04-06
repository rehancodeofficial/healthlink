-- 1. update Appointment status enum if needed (Prisma handles this usually, but good for manual run)
-- Note: Supabase/Postgres enums are immutable in some contexts, so we alter if exists.

ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'IN_SESSION';
ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'CHECKED_IN';

-- 2. Add columns to Appointment table if they don't exist
-- Prisma schema shows: callStatus String @default("idle")
ALTER TABLE "Appointment" 
ADD COLUMN IF NOT EXISTS "callStatus" TEXT NOT NULL DEFAULT 'idle';

ALTER TABLE "Appointment" 
ADD COLUMN IF NOT EXISTS "roomName" TEXT;

-- 3. Create VideoConsultation table if it doesn't exist (based on schema)
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

-- 4. Enable Row Level Security (RLS) - Recommended
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VideoConsultation" ENABLE ROW LEVEL SECURITY;

-- 5. Policies (Example: Users can only see their own appointments)
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own appointments" ON "Appointment";

CREATE POLICY "Users can view their own appointments" ON "Appointment"
    FOR SELECT
    USING (
        auth.uid()::text = "patientId" OR 
        auth.uid()::text = "doctorId"
    );

-- 6. Grant permissions
GRANT ALL ON "Appointment" TO service_role;
GRANT ALL ON "VideoConsultation" TO service_role;
GRANT ALL ON "Appointment" TO authenticated;
GRANT ALL ON "VideoConsultation" TO authenticated;
