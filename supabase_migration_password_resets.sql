-- Create password_reset_requests table for cross-device sync
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS password_reset_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending',
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_password_resets_status ON password_reset_requests(status);
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_reset_requests(email);
CREATE INDEX IF NOT EXISTS idx_password_resets_requested_at ON password_reset_requests(requested_at DESC);

-- Add RLS policies
ALTER TABLE password_reset_requests ENABLE ROW LEVEL SECURITY;

-- Allow all users to create their own password reset request
CREATE POLICY "Allow users to create password reset requests"
  ON password_reset_requests FOR INSERT
  WITH CHECK (true);

-- Allow all admin users to view password reset requests
CREATE POLICY "Allow admins to view password reset requests"
  ON password_reset_requests FOR SELECT
  USING (true);

-- Allow admins to update password reset requests
CREATE POLICY "Allow admins to update password reset requests"
  ON password_reset_requests FOR UPDATE
  USING (true);

-- Allow admins to delete password reset requests
CREATE POLICY "Allow admins to delete password reset requests"
  ON password_reset_requests FOR DELETE
  USING (true);

-- Add comment
COMMENT ON TABLE password_reset_requests IS 'Cross-device password reset request tracking';