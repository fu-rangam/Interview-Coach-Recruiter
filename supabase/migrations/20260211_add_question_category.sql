-- Migration: Add Category to Questions
-- Created: 2026-02-11

ALTER TABLE questions ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';

-- (Optional) Update existing questions if needed
-- UPDATE questions SET category = 'General' WHERE category IS NULL;
