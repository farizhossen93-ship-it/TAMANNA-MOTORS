-- =====================================================================
-- TAMANNA MOTORS · তামান্না মোটরস
-- Enterprise Relational Database Architecture & Backend DDL Schema
-- Compatible with PostgreSQL 14+, Cloud SQL, Neon, Supabase & SQLite
-- =====================================================================

-- 1. Staff & System Users with Role-Based Access Control (RBAC)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'cashier', -- 'super_admin', 'admin', 'cashier', 'inventory_manager'
  business_location VARCHAR(100) NOT NULL DEFAULT 'Dhaka Central Showroom',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Customer Discount Groups & Loyalty Tiers
CREATE TABLE IF NOT EXISTS customer_groups (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  calculation_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  selling_price_group VARCHAR(50) NOT NULL DEFAULT 'Retail Tier',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Unified Contacts Table (Suppliers & Customers)
CREATE TABLE IF NOT EXISTS contacts (
  id VARCHAR(64) PRIMARY KEY,
  type VARCHAR(20) NOT NULL, -- 'supplier' or 'customer'
  name VARCHAR(150) NOT NULL,
  business_name VARCHAR(200),
  email VARCHAR(255),
  phone VARCHAR(50) NOT NULL,
  tax_number VARCHAR(50),
  customer_group_id VARCHAR(64) REFERENCES customer_groups(id) ON DELETE SET NULL,
  business_location VARCHAR(100) NOT NULL DEFAULT 'Dhaka Central Showroom',
  credit_limit DECIMAL(12,2) DEFAULT 0.00,
  balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_purchases DECIMAL(12,2) DEFAULT 0.00,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Motor Spare Parts Products & Inventory Catalog
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  business_location VARCHAR(100) NOT NULL DEFAULT 'Dhaka Central Showroom',
  unit_purchase_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  selling_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  current_stock INT NOT NULL DEFAULT 0,
  alert_quantity INT NOT NULL DEFAULT 5,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Purchase Orders & Inbound Stock Replenishments
CREATE TABLE IF NOT EXISTS purchases (
  id VARCHAR(64) PRIMARY KEY,
  purchase_no VARCHAR(100) UNIQUE NOT NULL,
  supplier_id VARCHAR(64) REFERENCES contacts(id) ON DELETE SET NULL,
  supplier_name VARCHAR(200) NOT NULL,
  business_location VARCHAR(100) NOT NULL,
  purchase_status VARCHAR(50) NOT NULL DEFAULT 'Received', -- 'Received', 'Pending', 'Ordered'
  payment_status VARCHAR(50) NOT NULL DEFAULT 'Paid', -- 'Paid', 'Due', 'Partial'
  purchase_date DATE NOT NULL,
  grand_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  payment_due DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Sales, POS Transactions & Cash Memos
CREATE TABLE IF NOT EXISTS sales (
  id VARCHAR(64) PRIMARY KEY,
  invoice_no VARCHAR(100) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'pos', -- 'pos', 'draft', 'quotation'
  customer_id VARCHAR(64) REFERENCES contacts(id) ON DELETE SET NULL,
  customer_name VARCHAR(200) NOT NULL,
  business_location VARCHAR(100) NOT NULL DEFAULT 'Dhaka Central Showroom',
  payment_method VARCHAR(50) NOT NULL DEFAULT 'Cash',
  payment_status VARCHAR(50) NOT NULL DEFAULT 'Paid', -- 'Paid', 'Due', 'Partial'
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  invoice_due DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  items_count INT NOT NULL DEFAULT 1,
  sale_date VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Sale Line Items (Cart breakdown)
CREATE TABLE IF NOT EXISTS sale_items (
  id VARCHAR(64) PRIMARY KEY,
  sale_id VARCHAR(64) REFERENCES sales(id) ON DELETE CASCADE,
  product_id VARCHAR(64) REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00
);

-- 8. Operational Expenses Ledger
CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(64) PRIMARY KEY,
  reference_no VARCHAR(100),
  category VARCHAR(100) NOT NULL,
  business_location VARCHAR(100) NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'Paid',
  expense_for VARCHAR(150),
  note TEXT,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Stock Transfers Between Showroom Branches
CREATE TABLE IF NOT EXISTS stock_transfers (
  id VARCHAR(64) PRIMARY KEY,
  reference_no VARCHAR(100) UNIQUE NOT NULL,
  date VARCHAR(50) NOT NULL,
  location_from VARCHAR(100) NOT NULL,
  location_to VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Completed',
  shipping_charges DECIMAL(12,2) DEFAULT 0.00,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  items_count INT NOT NULL DEFAULT 1
);

-- 10. Business & Master Configuration Settings
CREATE TABLE IF NOT EXISTS business_settings (
  id VARCHAR(64) PRIMARY KEY DEFAULT 'primary_business',
  business_name VARCHAR(200) NOT NULL DEFAULT 'TAMANNA MOTORS',
  tax_number VARCHAR(100) DEFAULT 'BIN-002849102-0101',
  default_currency VARCHAR(20) DEFAULT 'BDT (৳)',
  currency_symbol VARCHAR(10) DEFAULT '৳',
  default_tax_rate DECIMAL(5,2) DEFAULT 5.00,
  primary_location VARCHAR(150) DEFAULT 'Dhaka Central Showroom',
  contact_email VARCHAR(255) DEFAULT 'info@tamannamotors.com',
  contact_phone VARCHAR(50) DEFAULT '+880 1711-234567',
  address TEXT DEFAULT 'House 42, Road 11, Block D, Mirpur-10, Dhaka-1216, Bangladesh',
  logo_url TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Invoice & Thermal Receipt Layout Settings
CREATE TABLE IF NOT EXISTS invoice_settings (
  id VARCHAR(64) PRIMARY KEY DEFAULT 'primary_invoice',
  invoice_prefix VARCHAR(50) DEFAULT 'TM-2026-',
  terms_and_conditions TEXT,
  show_logo BOOLEAN DEFAULT TRUE,
  paper_size VARCHAR(20) DEFAULT '80mm',
  footer_notes TEXT,
  logo_url TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(type);
CREATE INDEX IF NOT EXISTS idx_sales_invoice ON sales(invoice_no);
CREATE INDEX IF NOT EXISTS idx_purchases_no ON purchases(purchase_no);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
