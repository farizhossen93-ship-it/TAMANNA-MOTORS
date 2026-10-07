-- ==============================================================================
-- TAMANNA MOTORS (তামান্না মোটরস) - SUPABASE POSTGRESQL SCHEMA
-- Location: HAZIGONJ-KACHUA MAIN ROAD, WEST BAZAR, HAZIGONJ, CHANDPUR.
-- Run this script in your Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Enable UUID Extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. CREATE TABLES
-- ==============================================================================

-- Users & Staff Table
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  uid TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT,
  username TEXT,
  role TEXT DEFAULT 'cashier',
  phone TEXT,
  business_location TEXT DEFAULT 'Hazigonj Branch',
  status TEXT DEFAULT 'Active',
  last_login TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Products & Motorcycle Spare Parts
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  category TEXT NOT NULL,
  business_location TEXT DEFAULT 'Hazigonj Branch',
  unit_purchase_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  current_stock INTEGER NOT NULL DEFAULT 0,
  alert_quantity INTEGER DEFAULT 5,
  image_url TEXT,
  created_at TEXT
);

-- Contacts: Customers & Suppliers
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

-- Sales & Invoices
CREATE TABLE IF NOT EXISTS public.sales (
  id TEXT PRIMARY KEY,
  invoice_no TEXT NOT NULL UNIQUE,
  type TEXT DEFAULT 'pos', -- 'pos' | 'sale' | 'draft'
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  business_location TEXT DEFAULT 'Hazigonj Branch',
  payment_status TEXT DEFAULT 'Paid', -- 'Paid' | 'Due' | 'Partial'
  payment_method TEXT DEFAULT 'Cash',
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
  items_data TEXT, -- JSON string of items in the invoice
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Due Payment History (কিস্তিতে বকেয়া পরিশোধ রেকর্ড)
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

-- Purchases (মালামাল ক্রয় চালান)
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

-- Expenses (শোরুমের খরচ)
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

-- Audit Logs (নিরাপত্তা ও অ্যাকশন হিস্ট্রি)
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

-- Delete Requests (অনুমোদন আবেদন)
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

-- App Settings (লোগো, প্রিন্টার ও শোরুমের সেটিংস)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 3. CREATE PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_sales_invoice_no ON public.sales(invoice_no);
CREATE INDEX IF NOT EXISTS idx_sales_customer_name ON public.sales(customer_name);
CREATE INDEX IF NOT EXISTS idx_sales_payment_status ON public.sales(payment_status);
CREATE INDEX IF NOT EXISTS idx_due_payments_sale_id ON public.due_payments(sale_id);
CREATE INDEX IF NOT EXISTS idx_contacts_type ON public.contacts(type);

-- ==============================================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS) & ACCESS POLICIES
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

-- Allow read & write access for authenticated users & anon (Frontend Client)
CREATE POLICY "Allow full access for anon & authenticated users to users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon & authenticated users to products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon & authenticated users to contacts" ON public.contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon & authenticated users to sales" ON public.sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon & authenticated users to due_payments" ON public.due_payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon & authenticated users to purchases" ON public.purchases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon & authenticated users to expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon & authenticated users to audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon & authenticated users to delete_requests" ON public.delete_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon & authenticated users to app_settings" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 5. SEED INITIAL ESSENTIAL MASTER DATA
-- ==============================================================================
INSERT INTO public.contacts (id, type, name, phone, customer_group, business_location, balance, total_purchases)
VALUES ('cust-walkin', 'customer', 'Walk-in Customer (খুচরা ক্রেতা)', '01700000000', 'Retail', 'Hazigonj Branch', 0.00, 0.00)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 6. SUPABASE STORAGE BUCKET (ছবি ও মিডিয়া ফাইল সংরক্ষণ)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tamanna-media', 'tamanna-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public Access to tamanna-media" 
ON storage.objects FOR ALL 
USING (bucket_id = 'tamanna-media') 
WITH CHECK (bucket_id = 'tamanna-media');

