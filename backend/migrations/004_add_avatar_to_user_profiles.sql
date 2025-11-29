-- Migration: Add avatar field to user_profiles table
-- This allows users to store their profile picture as base64 encoded string

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar TEXT;

-- Comment explaining the field
COMMENT ON COLUMN user_profiles.avatar IS 'Base64 encoded profile picture';
