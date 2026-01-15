-- Add last_activity column to admin_users table for cross-device activity tracking
-- Run this in your Supabase SQL Editor

ALTER TABLE admin_users
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE;

-- Set existing users' last_activity to their last_login (if they have one)
UPDATE admin_users
SET last_activity = last_login
WHERE last_login IS NOT NULL AND last_activity IS NULL;

-- Create an index on last_activity for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_users_last_activity ON admin_users(last_activity);

-- Add comment
COMMENT ON COLUMN admin_users.last_activity IS 'Timestamp of last user activity for real-time status tracking across devices';

-- Enable Realtime for admin_users table
ALTER PUBLICATION supabase_realtime ADD TABLE admin_users;