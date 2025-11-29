-- Migration: Add is_blocked column to users table
-- Run this migration to add user blocking functionality

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;

-- Update existing users to have is_blocked = false
UPDATE users SET is_blocked = FALSE WHERE is_blocked IS NULL;
