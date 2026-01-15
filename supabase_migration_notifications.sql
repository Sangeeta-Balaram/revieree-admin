-- Create notifications table for cross-device notification sync
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_notification_type CHECK (type IN (
    'LOW_STOCK', 'CRITICAL_STOCK', 'NEW_ORDER', 'ORDER_RETURN',
    'PASSWORD_RESET', 'NEW_B2B_INQUIRY', 'SYSTEM'
  ))
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Add RLS (Row Level Security) policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow all admin users to read notifications
CREATE POLICY "Allow all admins to view notifications"
  ON notifications FOR SELECT
  USING (true);

-- Allow all admin users to create notifications
CREATE POLICY "Allow all admins to create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Allow all admin users to update notifications (mark as read/delete)
CREATE POLICY "Allow all admins to update notifications"
  ON notifications FOR UPDATE
  USING (true);

-- Allow all admin users to delete notifications
CREATE POLICY "Allow all admins to delete notifications"
  ON notifications FOR DELETE
  USING (true);

-- Add comment
COMMENT ON TABLE notifications IS 'Cross-device admin notifications system';

-- Enable Realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;