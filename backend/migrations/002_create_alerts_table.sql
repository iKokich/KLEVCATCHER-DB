-- Migration: Create alerts table for notifications system
-- Date: 2025-11-28
-- Description: Creates alerts table to store system notifications for reports, threats, and sigma rules

CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    username VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries (newest first)
CREATE INDEX IF NOT EXISTS idx_alerts_created_at 
ON alerts(created_at DESC);

-- Create index for type filtering
CREATE INDEX IF NOT EXISTS idx_alerts_type 
ON alerts(type);

COMMENT ON TABLE alerts IS 'System notifications for new reports, threats, and sigma rules';
COMMENT ON COLUMN alerts.type IS 'Type of alert: report, sigma, or threat';
COMMENT ON COLUMN alerts.message IS 'Notification message displayed to users';
COMMENT ON COLUMN alerts.username IS 'Username of the person who triggered the alert';
