-- Revieree Supabase Database Setup
-- Run this in Supabase SQL Editor

-- Create newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public inserts (for newsletter signup)
CREATE POLICY "Allow public inserts" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Create policy to allow authenticated reads (for admin panel)
CREATE POLICY "Allow authenticated reads" ON newsletter_subscribers
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated deletes (for admin panel)
CREATE POLICY "Allow authenticated deletes" ON newsletter_subscribers
  FOR DELETE USING (auth.role() = 'authenticated');

-- Success message
SELECT 'Database tables created successfully!' as message;