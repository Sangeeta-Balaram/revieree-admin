-- Supabase Database Schema for Revieree E-commerce Admin Panel
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products Table (Fragrances + Cosmetics)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL, -- 'fragrance' or 'cosmetic'
  subcategory TEXT, -- For cosmetics: lipstick, kajal, etc
  description TEXT,
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  has_offer BOOLEAN DEFAULT FALSE,
  offer_percentage INTEGER,
  -- Fragrance specific fields
  notes TEXT,
  intensity TEXT,
  longevity TEXT,
  -- Cosmetic specific fields
  shade TEXT,
  finish TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author TEXT DEFAULT 'Admin',
  image_url TEXT,
  category TEXT,
  tags TEXT[],
  published BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
('Super Admin', 'Full system access',
  '["View Products", "Add Products", "Edit Products", "Delete Products", "Manage Stock", "View Blogs", "Create Blogs", "Edit Blogs", "Publish Blogs", "Delete Blogs", "View Subscribers", "Send Newsletters", "View Analytics", "Export Data", "View Users", "Add Users", "Edit Users", "Delete Users", "Manage Roles", "View Settings", "Edit Settings"]'::jsonb
),
('Admin', 'Standard admin access',
  '["View Products", "Add Products", "Edit Products", "Delete Products", "Manage Stock", "View Blogs", "Create Blogs", "Edit Blogs", "Publish Blogs", "Delete Blogs", "View Subscribers", "Send Newsletters", "View Analytics", "Export Data", "View Users", "Add Users", "Edit Users", "Delete Users"]'::jsonb
),
('Content Manager', 'Content management access',
  '["View Products", "View Blogs", "Create Blogs", "Edit Blogs", "Publish Blogs", "Delete Blogs", "View Subscribers", "View Analytics"]'::jsonb
),
('Inventory Manager', 'Inventory and stock management',
  '["View Products", "Add Products", "Edit Products", "Manage Stock", "View Analytics", "Export Data"]'::jsonb
)
ON CONFLICT (name) DO NOTHING;

-- Insert default admin users (password: admin123, use bcrypt in production)
-- Note: These are placeholder hashes. In production, use proper password hashing
INSERT INTO admin_users (email, password_hash, name, role) VALUES
('therevieree.co@gmail.com', 'admin123', 'Revieree Admin', 'Super Admin'),
('ritikmahyavanshi@gmail.com', 'admin123', 'Ritik Mahyavanshi', 'Super Admin')
ON CONFLICT (email) DO NOTHING;

-- Insert default settings
INSERT INTO site_settings (key, value) VALUES
('general', '{"siteName": "Revieree", "siteEmail": "contact@revieree.com", "currency": "INR", "timezone": "Asia/Kolkata", "maintenanceMode": false}'::jsonb),
('smtp', '{"host": "", "port": 587, "username": "", "password": "", "fromEmail": "noreply@revieree.com", "fromName": "Revieree"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for authenticated users, adjust as needed)
-- Products policies
CREATE POLICY "Enable read access for all users" ON products FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON products FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON products FOR DELETE USING (true);

-- Blog posts policies
CREATE POLICY "Enable read access for all users" ON blog_posts FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON blog_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON blog_posts FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON blog_posts FOR DELETE USING (true);

-- Newsletter subscribers policies
CREATE POLICY "Enable read access for all users" ON newsletter_subscribers FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON newsletter_subscribers FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON newsletter_subscribers FOR DELETE USING (true);

-- Admin users policies
CREATE POLICY "Enable read access for authenticated users" ON admin_users FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON admin_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON admin_users FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON admin_users FOR DELETE USING (true);

-- Roles policies
CREATE POLICY "Enable read access for all users" ON roles FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON roles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON roles FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON roles FOR DELETE USING (true);

-- Settings policies
CREATE POLICY "Enable read access for all users" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON site_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON site_settings FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON site_settings FOR DELETE USING (true);