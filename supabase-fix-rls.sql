-- Fix RLS Policies to Allow Anonymous Updates
-- This is needed because admin panel doesn't use Supabase Auth
-- Run this in your Supabase SQL Editor

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow authenticated update orders" ON orders;
DROP POLICY IF EXISTS "Allow authenticated delete orders" ON orders;
DROP POLICY IF EXISTS "Allow authenticated update returns" ON returns;
DROP POLICY IF EXISTS "Allow authenticated delete returns" ON returns;

-- Create new policies that allow anonymous users (admin panel)
-- WARNING: In production, you should implement proper auth tokens

-- ORDERS - Allow anon to update
CREATE POLICY "Allow all update orders" ON orders
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ORDERS - Allow anon to delete
CREATE POLICY "Allow all delete orders" ON orders
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- RETURNS - Allow anon to update
CREATE POLICY "Allow all update returns" ON returns
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- RETURNS - Allow anon to delete
CREATE POLICY "Allow all delete returns" ON returns
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- B2B - Allow anon to update
DROP POLICY IF EXISTS "Allow authenticated update b2b" ON b2b_inquiries;
DROP POLICY IF EXISTS "Allow authenticated delete b2b" ON b2b_inquiries;

CREATE POLICY "Allow all update b2b" ON b2b_inquiries
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all delete b2b" ON b2b_inquiries
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Success message
SELECT 'RLS policies updated successfully! Admin panel can now update orders.' AS message;
