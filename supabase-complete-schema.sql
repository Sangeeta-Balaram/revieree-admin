-- Revieree Complete Database Schema - Additional Tables
-- Run this in your Supabase SQL Editor AFTER running supabase-schema.sql
-- This adds: orders, returns, b2b_inquiries, and refunds tables

-- ============================================
-- 1. ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,

  -- Order Status
  status TEXT NOT NULL DEFAULT 'Pending',

  -- Payment Information
  payment_status TEXT NOT NULL DEFAULT 'Unpaid',
  payment_method TEXT NOT NULL DEFAULT 'Cash on Delivery',
  transaction_id TEXT,

  -- Pricing Details
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  discount_code TEXT,
  tax DECIMAL(10, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 18,
  shipping_charge DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,

  -- Items (stored as JSONB array)
  items JSONB NOT NULL DEFAULT '[]',

  -- Shipping Information
  shipping_address JSONB NOT NULL DEFAULT '{}',
  billing_address JSONB DEFAULT '{}',
  tracking_number TEXT,
  shipping_partner TEXT,
  estimated_delivery TIMESTAMP,
  actual_delivery TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Status History (JSONB array)
  status_history JSONB DEFAULT '[]'
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);

-- ============================================
-- 2. RETURNS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS returns (
  id BIGSERIAL PRIMARY KEY,
  return_number TEXT UNIQUE NOT NULL,
  order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,

  -- Customer Information
  customer_id BIGINT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,

  -- Return Details
  items JSONB NOT NULL DEFAULT '[]',
  reason TEXT NOT NULL,
  reason_detail TEXT,
  images JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'Return Requested',

  -- Refund Information
  refund_amount DECIMAL(10, 2) NOT NULL,
  refund_method TEXT,
  refunded_at TIMESTAMP,

  -- Pickup Information
  pickup_address JSONB,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Status History
  status_history JSONB DEFAULT '[]'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_returns_order ON returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON returns(status);
CREATE INDEX IF NOT EXISTS idx_returns_created ON returns(created_at DESC);

-- ============================================
-- 3. B2B INQUIRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS b2b_inquiries (
  id BIGSERIAL PRIMARY KEY,

  -- Contact Information
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,

  -- Business Details
  business_type TEXT,
  country TEXT,
  website TEXT,

  -- Inquiry Details
  products_interested JSONB DEFAULT '[]',
  order_quantity TEXT,
  message TEXT,

  -- Status
  status TEXT DEFAULT 'New',
  priority TEXT DEFAULT 'Medium',

  -- Notes (for admin use)
  admin_notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_b2b_status ON b2b_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_b2b_created ON b2b_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_b2b_email ON b2b_inquiries(email);

-- ============================================
-- 4. REFUNDS TABLE (for finance tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS refunds (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  return_id BIGINT REFERENCES returns(id) ON DELETE CASCADE,

  amount DECIMAL(10, 2) NOT NULL,
  reason TEXT,

  -- Timestamps
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_refunds_order ON refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_date ON refunds(date DESC);

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ORDERS POLICIES
-- ============================================

-- Allow anyone to INSERT orders (for checkout)
CREATE POLICY "Allow public insert orders" ON orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to READ orders
CREATE POLICY "Allow users to read orders" ON orders
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated users (admins) to UPDATE orders
CREATE POLICY "Allow authenticated update orders" ON orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users (admins) to DELETE orders
CREATE POLICY "Allow authenticated delete orders" ON orders
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- RETURNS POLICIES
-- ============================================

-- Allow anyone to INSERT returns
CREATE POLICY "Allow public insert returns" ON returns
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to READ returns
CREATE POLICY "Allow users to read returns" ON returns
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated users to UPDATE returns
CREATE POLICY "Allow authenticated update returns" ON returns
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to DELETE returns
CREATE POLICY "Allow authenticated delete returns" ON returns
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- B2B INQUIRIES POLICIES
-- ============================================

-- Allow anyone to INSERT B2B inquiries
CREATE POLICY "Allow public insert b2b" ON b2b_inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to READ B2B inquiries
CREATE POLICY "Allow public read b2b" ON b2b_inquiries
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated users to UPDATE B2B inquiries
CREATE POLICY "Allow authenticated update b2b" ON b2b_inquiries
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to DELETE B2B inquiries
CREATE POLICY "Allow authenticated delete b2b" ON b2b_inquiries
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- REFUNDS POLICIES
-- ============================================

-- Allow authenticated users full access to refunds
CREATE POLICY "Allow authenticated all refunds" ON refunds
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- The update_updated_at_column() function already exists from supabase-schema.sql
-- Just add triggers for new tables

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_returns_updated_at BEFORE UPDATE ON returns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_b2b_updated_at BEFORE UPDATE ON b2b_inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMPLETED!
-- ============================================
-- All additional tables created successfully
-- Now you can proceed to update the frontend code
