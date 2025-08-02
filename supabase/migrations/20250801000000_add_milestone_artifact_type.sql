-- Add 'milestone' to artifact_type_enum for goal milestone tracking
-- This allows milestones to be represented as artifacts in the timeline

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'milestone' AND enumtypid = 'public.artifact_type_enum'::regtype) THEN
    ALTER TYPE public.artifact_type_enum ADD VALUE 'milestone';
  END IF;
END $$;

COMMENT ON TYPE public.artifact_type_enum IS 'Artifact types including milestone for goal tracking';