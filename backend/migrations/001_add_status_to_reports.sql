-- Migration: Add status column to reports table
-- Date: 2025-11-28
-- Description: Adds a status column to track report completion status

ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'In Process';

-- Possible status values:
-- - 'In Process' (default)
-- - 'Done'

COMMENT ON COLUMN reports.status IS 'Current status of the report: In Process or Done';
