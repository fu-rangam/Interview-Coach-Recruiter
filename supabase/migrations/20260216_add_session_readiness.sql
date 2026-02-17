-- Migration: Add Session Readiness Fields
-- Created: 2026-02-16

-- Add enum for readiness levels if not exists
DO $$ BEGIN
    CREATE TYPE session_readiness_level AS ENUM ('RL1', 'RL2', 'RL3', 'RL4');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS readiness_band session_readiness_level;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS summary_narrative TEXT;

-- Index for analytics performance
CREATE INDEX IF NOT EXISTS idx_sessions_readiness ON sessions(readiness_band);
