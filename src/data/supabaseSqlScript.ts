// Complete Supabase SQL script for Tamanna Motors ERP
export const SUPABASE_SQL_SCRIPT = `-- ==============================================================================
-- 🏍️ TAMANNA MOTORS (তামান্না মোটরস) - SUPABASE POSTGRESQL COMPLETE DATABASE SCHEMA
-- লোকেশন: হাজিগঞ্জ-কচুয়া মেইন রোড, পশ্চিম বাজার, হাজিগঞ্জ, চাঁদপুর।
-- 
-- 📋 নির্দেশিকা (How to Run):
-- ১. আপনার Supabase ড্যাশবোর্ডে লগইন করুন (https://app.supabase.com)
-- ২. বাম পাশের মেনু থেকে "SQL Editor" এ ক্লিক করুন
-- ৩. "New Query" ওপেন করে এই সম্পূর্ণ কোডটি পেস্ট করুন
-- ৪. "Run" বাটনে ক্লিক করুন। ২ সেকেন্ডে পুরো ডেটাবেজ রেডি হয়ে যাবে!
-- ==============================================================================

-- ১. এক্সটেনশন সক্রিয়করণ
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- ২. টেবিল তৈরি (CREATE ALL TABLES)
-- ==============================================================================

-- ২.১ ইউজার ও স্টাফ টেবিল (Users & Staff Authentication)
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  uid TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  password TEXT DEFAULT 'admin123',
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'cashier', -- 'super_admin' | 'admin' | 'cashier' | 'manager'
  phone TEXT,
  business_location TEXT DEFAULT 'Hazigonj Branch',
  status TEXT DEFAULT 'Active', -- 'Active' | 'Suspended' | 'Pending Approval'
  last_login TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ২.২ মোটর পার্টস ও পণ্য তালিকা (Products & Spare Parts Catalog)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  business_location TEXT DEFAULT 'Hazigonj Branch',
  unit_purchase_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  current_stock INTEGER NOT NULL DEFAULT 0,
  alert_quantity INTEGER DEFAULT 5,
  image_url TEXT,
  created_at TEXT
);

-- ২.৩ গ্রাহক ও সরবরাহকারী তালিকা (Customers & Suppliers Ledger)
CREATE TABLE IF NOT EXISTS public.contacts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'customer' | 'supplier'
  name TEXT NOT NULL,
  business_name TEXT,
  email TEXT,
  phone TEXT,
  customer_group TEXT,
  credit_limit NUMERIC(12, 2),
  address TEXT,
  business_location TEXT DEFAULT 'Hazigonj Branch',
  balance NUMERIC(12, 2) DEFAULT 0.00,
  total_purchases NUMERIC(12, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ২.৪ বিক্রয় চালান ও ইনভয়েস (Sales, POS Tickets & Invoices)
CREATE TABLE IF NOT EXISTS public.sales (
  id TEXT PRIMARY KEY,
  invoice_no TEXT NOT NULL UNIQUE,
  type TEXT DEFAULT 'pos', -- 'pos' | 'sale' | 'draft'
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  business_location TEXT DEFAULT 'Hazigonj Branch',
  payment_status TEXT DEFAULT 'Paid', -- 'Paid' | 'Due' | 'Partial'
  payment_method TEXT DEFAULT 'Cash', -- 'Cash' | 'Card' | 'bKash' | 'Nagad' | 'Bank'
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  invoice_due NUMERIC(12, 2) DEFAULT 0.00,
  sale_date TEXT NOT NULL,
  items_count INTEGER DEFAULT 1,
  subtotal NUMERIC(12, 2),
  tax_amount NUMERIC(12, 2),
  discount_amount NUMERIC(12, 2),
  amount_tendered NUMERIC(12, 2),
  change_due NUMERIC(12, 2),
  cashier_name TEXT,
  due_notes TEXT,
  items_data TEXT, -- JSON Array of items purchased
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ২.৫ কিস্তিতে বকেয়া আদায়ের হিসেব (Due Payment Installment History)
CREATE TABLE IF NOT EXISTS public.due_payments (
  id TEXT PRIMARY KEY,
  sale_id TEXT REFERENCES public.sales(id) ON DELETE CASCADE,
  invoice_no TEXT,
  payment_date TEXT NOT NULL,
  amount_paid NUMERIC(12, 2) NOT NULL,
  payment_method TEXT DEFAULT 'Cash',
  remaining_due NUMERIC(12, 2) DEFAULT 0.00,
  received_by TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ২.৬ ক্রয় চালান (Purchase Orders from Suppliers)
CREATE TABLE IF NOT EXISTS public.purchases (
  id TEXT PRIMARY KEY,
  purchase_no TEXT NOT NULL UNIQUE,
  supplier_name TEXT NOT NULL,
  business_location TEXT DEFAULT 'Hazigonj Branch',
  purchase_status TEXT DEFAULT 'Received',
  payment_status TEXT DEFAULT 'Paid',
  purchase_date TEXT NOT NULL,
  grand_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  payment_due NUMERIC(12, 2) DEFAULT 0.00,
  items_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ২.৭ শোরুমের দৈনন্দিন খরচ (Showroom Expenses & Overheads)
CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY,
  expense_no TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  business_location TEXT DEFAULT 'Hazigonj Branch',
  expense_date TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  reference_no TEXT,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ২.৮ অডিট লগ ও অ্যাকশন ট্র্যাকার (System Security Audit Logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_title TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  business_location TEXT DEFAULT 'Hazigonj Branch',
  details TEXT
);

-- ২.৯ ডিলিট রিকুয়েস্ট (Authorization Requests)
CREATE TABLE IF NOT EXISTS public.delete_requests (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_title TEXT NOT NULL,
  requested_by TEXT NOT NULL,
  request_date TEXT NOT NULL,
  reason TEXT NOT NULL,
  damage_severity TEXT DEFAULT 'None',
  status TEXT DEFAULT 'Pending',
  business_location TEXT DEFAULT 'Hazigonj Branch',
  item_value NUMERIC(12, 2) DEFAULT 0.00
);

-- ২.১০ শোরুম ও ইনভয়েস সেটিংস (App & Business Settings)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ৩. ইনডেক্স তৈরি (PERFORMANCE OPTIMIZATION INDEXES)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_sales_invoice_no ON public.sales(invoice_no);
CREATE INDEX IF NOT EXISTS idx_sales_customer_name ON public.sales(customer_name);
CREATE INDEX IF NOT EXISTS idx_sales_payment_status ON public.sales(payment_status);
CREATE INDEX IF NOT EXISTS idx_due_payments_sale_id ON public.due_payments(sale_id);
CREATE INDEX IF NOT EXISTS idx_contacts_type ON public.contacts(type);

-- ==============================================================================
-- ৪. সিকিউরিটি পলিসি ও RLS সক্রিয়করণ (ENABLE FULL CLIENT ACCESS FOR FRONTEND)
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.due_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delete_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing old policies to prevent collision
DROP POLICY IF EXISTS "Allow public full access to users" ON public.users;
DROP POLICY IF EXISTS "Allow public full access to products" ON public.products;
DROP POLICY IF EXISTS "Allow public full access to contacts" ON public.contacts;
DROP POLICY IF EXISTS "Allow public full access to sales" ON public.sales;
DROP POLICY IF EXISTS "Allow public full access to due_payments" ON public.due_payments;
DROP POLICY IF EXISTS "Allow public full access to purchases" ON public.purchases;
DROP POLICY IF EXISTS "Allow public full access to expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow public full access to audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow public full access to delete_requests" ON public.delete_requests;
DROP POLICY IF EXISTS "Allow public full access to app_settings" ON public.app_settings;

-- Create full open read/write policies for anon frontend client
CREATE POLICY "Allow public full access to users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to contacts" ON public.contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to sales" ON public.sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to due_payments" ON public.due_payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to purchases" ON public.purchases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to delete_requests" ON public.delete_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to app_settings" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- ৫. প্রাথমিক ডিফল্ট ডেটা সিডিং (SEED INITIAL ESSENTIAL DATA)
-- ==============================================================================

-- ৫.১ ডিফল্ট সুপার অ্যাডমিন ইউজার (Default Super Admin Account)
-- ইউজারনেম: admin
-- পাসওয়ার্ড: admin123
INSERT INTO public.users (uid, email, password, name, username, role, phone, business_location, status, last_login)
VALUES (
  'usr-admin-default',
  'admin@tamannamotors.com',
  'admin123',
  'Super Admin (Owner)',
  'admin',
  'super_admin',
  '01804626477',
  'Hazigonj Branch',
  'Active',
  'Now'
)
ON CONFLICT (username) DO UPDATE SET
  password = EXCLUDED.password,
  role = 'super_admin',
  status = 'Active';

-- ৫.২ খুচরা ওয়াক-ইন গ্রাহক (Walk-in Retail Customer)
INSERT INTO public.contacts (id, type, name, phone, customer_group, business_location, balance, total_purchases)
VALUES ('cust-walkin', 'customer', 'Walk-in Customer (খুচরা ক্রেতা)', '01700000000', 'Retail', 'Hazigonj Branch', 0.00, 0.00)
ON CONFLICT (id) DO NOTHING;

-- ৫.৩ তামান্না মোটরসের প্রারম্ভিক মোটর পার্টস ক্যাটালগ (Initial Motorcycle Parts)
INSERT INTO public.products (id, name, sku, category, business_location, unit_purchase_price, selling_price, current_stock, alert_quantity, image_url)
VALUES 
  ('prod-1', 'Motul 7100 4T 10W-40 Synthetic 1L', 'MOT-7100-10W40', 'Engine Oil & Lubricants', 'Hazigonj Branch', 1250, 1550, 25, 5, 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=200&h=200&q=80'),
  ('prod-2', 'NGK Laser Iridium Spark Plug (FZ/Gixxer)', 'NGK-CR9EIX', 'Electrical & Ignition', 'Hazigonj Branch', 450, 650, 40, 8, 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=200&h=200&q=80'),
  ('prod-3', 'Yamaha FZ / R15 V3 Heavy Chain Sprocket Kit', 'CHN-FZ-R15V3', 'Transmission & Drivetrain', 'Hazigonj Branch', 2200, 2800, 12, 3, 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=200&h=200&q=80'),
  ('prod-4', 'Bosch Maintenance-Free Battery 12V 5Ah', 'BAT-BS-12V5AH', 'Batteries & Power', 'Hazigonj Branch', 1800, 2350, 15, 4, 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=200&h=200&q=80'),
  ('prod-5', 'MRF Nylogrip Zapper Tubeless Tyre 100/80-17', 'TYR-MRF-1008017', 'Tyres & Tubes', 'Hazigonj Branch', 3200, 3950, 10, 3, 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=200&h=200&q=80')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- ৬. স্টোরেজ বাকেট তৈরি (SUPABASE STORAGE BUCKET FOR MEDIA & IMAGES)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tamanna-media', 'tamanna-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Access to tamanna-media" ON storage.objects;
CREATE POLICY "Public Access to tamanna-media" 
ON storage.objects FOR ALL 
USING (bucket_id = 'tamanna-media') 
WITH CHECK (bucket_id = 'tamanna-media');
`;
