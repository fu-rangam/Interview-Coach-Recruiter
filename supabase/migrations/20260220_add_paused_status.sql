-- Add missing status values to the session_status enum
-- Run this in the Supabase SQL Editor

ALTER TYPE session_status ADD VALUE IF NOT EXISTS 'PAUSED';
ALTER TYPE session_status ADD VALUE IF NOT EXISTS 'REVIEWING';
ALTER TYPE session_status ADD VALUE IF NOT EXISTS 'AWAITING_EVALUATION'; -- Map frontend naming to DB
