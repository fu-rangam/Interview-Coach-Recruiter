-- Migration: Add Session Lineage and Recruiter Ownership Support
-- Created: 2026-02-16

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS parent_session_id UUID REFERENCES sessions(session_id) ON DELETE SET NULL;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS attempt_number INT DEFAULT 1;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS client_name TEXT;

-- Index for lineage performance
CREATE INDEX IF NOT EXISTS idx_sessions_parent_id ON sessions(parent_session_id);
