export interface SchemaTable {
  name: string;
  description: string;
  columns: {
    name: string;
    type: string;
    isPrimary?: boolean;
    isForeign?: boolean;
    references?: string;
    nullable: boolean;
    description: string;
  }[];
}

export const DATABASE_SCHEMAS: SchemaTable[] = [
  {
    name: "users",
    description: "System administrative users, cashiers, and inventory managers with RBAC permissions.",
    columns: [
      { name: "id", type: "UUID", isPrimary: true, nullable: false, description: "Unique identifier (PK)" },
      { name: "name", type: "VARCHAR(150)", nullable: false, description: "Full name of staff member" },
      { name: "email", type: "VARCHAR(255)", nullable: false, description: "Unique system login email" },
      { name: "password_hash", type: "VARCHAR(255)", nullable: false, description: "Bcrypt hashed password" },
      { name: "role", type: "VARCHAR(50)", nullable: false, description: "Admin, Cashier, Inventory Manager" },
      { name: "business_location", type: "VARCHAR(100)", nullable: false, description: "Assigned warehouse/store branch" },
      { name: "status", type: "VARCHAR(20)", nullable: false, description: "Active / Suspended" },
      { name: "created_at", type: "TIMESTAMP", nullable: false, description: "Record creation timestamp" }
    ]
  },
  {
    name: "contacts",
    description: "Unified table for suppliers and customers with balance and credit tracking.",
    columns: [
      { name: "id", type: "UUID", isPrimary: true, nullable: false, description: "Unique identifier (PK)" },
      { name: "type", type: "VARCHAR(20)", nullable: false, description: "'supplier' or 'customer'" },
      { name: "name", type: "VARCHAR(150)", nullable: false, description: "Contact name or representative" },
      { name: "business_name", type: "VARCHAR(200)", nullable: true, description: "Company or trading business name" },
      { name: "email", type: "VARCHAR(255)", nullable: true, description: "Contact email" },
      { name: "phone", type: "VARCHAR(50)", nullable: false, description: "Phone number" },
      { name: "tax_number", type: "VARCHAR(50)", nullable: true, description: "Tax / VAT / GST identification" },
      { name: "customer_group_id", type: "UUID", isForeign: true, references: "customer_groups(id)", nullable: true, description: "Associated customer group" },
      { name: "credit_limit", type: "DECIMAL(12,2)", nullable: true, description: "Allowed credit limit" },
      { name: "balance", type: "DECIMAL(12,2)", nullable: false, description: "Current receivable or payable balance" },
      { name: "address", type: "TEXT", nullable: true, description: "Billing/shipping physical address" },
      { name: "created_at", type: "TIMESTAMP", nullable: false, description: "Created date" }
    ]
  },
  {
    name: "customer_groups",
    description: "Tiered customer loyalty pricing and wholesale discount classifications.",
    columns: [
      { name: "id", type: "UUID", isPrimary: true, nullable: false, description: "Unique identifier (PK)" },
      { name: "name", type: "VARCHAR(100)", nullable: false, description: "Group name (e.g. VIP, Wholesale, Retail)" },
      { name: "calculation_percentage", type: "DECIMAL(5,2)", nullable: false, description: "Standard percentage discount" },
      { name: "selling_price_group", type: "VARCHAR(50)", nullable: false, description: "Associated price tier tier" },
      { name: "created_at", type: "TIMESTAMP", nullable: false, description: "Creation timestamp" }
    ]
  },
  {
    name: "products",
    description: "Catalog of sellable inventory items, purchase costs, retail prices, and stock counts.",
    columns: [
      { name: "id", type: "UUID", isPrimary: true, nullable: false, description: "Unique identifier (PK)" },
      { name: "name", type: "VARCHAR(255)", nullable: false, description: "Product item name" },
      { name: "sku", type: "VARCHAR(100)", nullable: false, description: "Stock Keeping Unit code (Unique)" },
      { name: "barcode", type: "VARCHAR(100)", nullable: true, description: "EAN/UPC scanned barcode" },
      { name: "category", type: "VARCHAR(100)", nullable: false, description: "Product category name" },
      { name: "business_location", type: "VARCHAR(100)", nullable: false, description: "Warehouse or retail store location" },
      { name: "unit_purchase_price", type: "DECIMAL(12,2)", nullable: false, description: "Cost of purchase per unit" },
      { name: "selling_price", type: "DECIMAL(12,2)", nullable: false, description: "Standard retail selling price" },
      { name: "current_stock", type: "INTEGER", nullable: false, description: "Available stock level in units" },
      { name: "alert_quantity", type: "INTEGER", nullable: false, description: "Low inventory reorder threshold" },
      { name: "image_url", type: "TEXT", nullable: true, description: "Product thumbnail image reference" },
      { name: "created_at", type: "TIMESTAMP", nullable: false, description: "Product entry timestamp" }
    ]
  },
  {
    name: "purchases",
    description: "Inbound vendor purchase orders, payment status, and received goods.",
    columns: [
      { name: "id", type: "UUID", isPrimary: true, nullable: false, description: "Unique identifier (PK)" },
      { name: "purchase_no", type: "VARCHAR(50)", nullable: false, description: "PO reference number (e.g., PO-84920)" },
      { name: "supplier_id", type: "UUID", isForeign: true, references: "contacts(id)", nullable: false, description: "Supplier reference" },
      { name: "business_location", type: "VARCHAR(100)", nullable: false, description: "Receiving warehouse" },
      { name: "purchase_status", type: "VARCHAR(30)", nullable: false, description: "Received, Pending, Ordered" },
      { name: "payment_status", type: "VARCHAR(30)", nullable: false, description: "Paid, Due, Partial" },
      { name: "purchase_date", type: "DATE", nullable: false, description: "Date order executed" },
      { name: "grand_total", type: "DECIMAL(12,2)", nullable: false, description: "Total invoice purchase amount" },
      { name: "payment_due", type: "DECIMAL(12,2)", nullable: false, description: "Unpaid balance on invoice" },
      { name: "created_at", type: "TIMESTAMP", nullable: false, description: "Record timestamp" }
    ]
  },
  {
    name: "purchase_items",
    description: "Line items attached to an inbound purchase order.",
    columns: [
      { name: "id", type: "UUID", isPrimary: true, nullable: false, description: "PK" },
      { name: "purchase_id", type: "UUID", isForeign: true, references: "purchases(id)", nullable: false, description: "Purchase order parent" },
      { name: "product_id", type: "UUID", isForeign: true, references: "products(id)", nullable: false, description: "Inventory item" },
      { name: "quantity", type: "INTEGER", nullable: false, description: "Units received" },
      { name: "purchase_price", type: "DECIMAL(12,2)", nullable: false, description: "Unit cost at time of purchase" },
      { name: "subtotal", type: "DECIMAL(12,2)", nullable: false, description: "quantity * purchase_price" }
    ]
  },
  {
    name: "purchase_returns",
    description: "Returned defective or excess inventory back to vendor.",
    columns: [
      { name: "id", type: "UUID", isPrimary: true, nullable: false, description: "PK" },
      { name: "return_no", type: "VARCHAR(50)", nullable: false, description: "Return reference (PR-1029)" },
      { name: "purchase_id", type: "UUID", isForeign: true, references: "purchases(id)", nullable: false, description: "Original purchase order" },
      { name: "supplier_id", type: "UUID", isForeign: true, references: "contacts(id)", nullable: false, description: "Vendor" },
      { name: "return_date", type: "DATE", nullable: false, description: "Date of return shipment" },
      { name: "total_amount", type: "DECIMAL(12,2)", nullable: false, description: "Total credit note value" },
      { name: "payment_status", type: "VARCHAR(30)", nullable: false, description: "Refunded / Pending" }
    ]
  },
  {
    name: "sales",
    description: "Outbound customer transactions, POS registers, and draft quotes.",
    columns: [
      { name: "id", type: "UUID", isPrimary: true, nullable: false, description: "PK" },
      { name: "invoice_no", type: "VARCHAR(50)", nullable: false, description: "Invoice number (INV-2026-0918)" },
      { name: "type", type: "VARCHAR(20)", nullable: false, description: "'pos', 'sale', 'draft'" },
      { name: "customer_id", type: "UUID", isForeign: true, references: "contacts(id)", nullable: false, description: "Customer reference" },
      { name: "business_location", type: "VARCHAR(100)", nullable: false, description: "Store / Terminal location" },
      { name: "payment_status", type: "VARCHAR(30)", nullable: false, description: "Paid, Due, Partial" },
      { name: "payment_method", type: "VARCHAR(50)", nullable: false, description: "Cash, Card, Bank Transfer, Credit" },
      { name: "total_amount", type: "DECIMAL(12,2)", nullable: false, description: "Total gross amount" },
      { name: "invoice_due", type: "DECIMAL(12,2)", nullable: false, description: "Remaining customer balance" },
      { name: "sale_date", type: "TIMESTAMP", nullable: false, description: "Timestamp of sale" }
    ]
  },
  {
    name: "sale_items",
    description: "Line items recorded within each POS ticket or invoice.",
    columns: [
      { name: "id", type: "UUID", isPrimary: true, nullable: false, description: "PK" },
      { name: "sale_id", type: "UUID", isForeign: true, references: "sales(id)", nullable: false, description: "Sale transaction reference" },
      { name: "product_id", type: "UUID", isForeign: true, references: "products(id)", nullable: false, description: "Product sold" },
      { name: "quantity", type: "INTEGER", nullable: false, description: "Units sold" },
      { name: "unit_price", type: "DECIMAL(12,2)", nullable: false, description: "Price per unit at sale time" },
      { name: "discount", type: "DECIMAL(12,2)", nullable: false, description: "Discount applied per line" },
      { name: "subtotal", type: "DECIMAL(12,2)", nullable: false, description: "(quantity * unit_price) - discount" }
    ]
  },
  {
    name: "stock_transfers",
    description: "Inter-branch inventory movements between stores and warehouses.",
    columns: [
      { name: "id", type: "UUID", isPrimary: true, nullable: false, description: "PK" },
      { name: "transfer_no", type: "VARCHAR(50)", nullable: false, description: "Transfer ref (ST-3829)" },
      { name: "from_location", type: "VARCHAR(100)", nullable: false, description: "Source warehouse" },
      { name: "to_location", type: "VARCHAR(100)", nullable: false, description: "Destination location" },
      { name: "status", type: "VARCHAR(30)", nullable: false, description: "Completed, Pending, In Transit" },
      { name: "shipping_charges", type: "DECIMAL(10,2)", nullable: false, description: "Freight & courier cost" },
      { name: "total_amount", type: "DECIMAL(12,2)", nullable: false, description: "Total inventory value transferred" },
      { name: "transfer_date", type: "DATE", nullable: false, description: "Shipment dispatch date" }
    ]
  },
  {
    name: "expenses",
    description: "Operational overhead tracking (Rent, Utilities, Wages, Logistics).",
    columns: [
      { name: "id", type: "UUID", isPrimary: true, nullable: false, description: "PK" },
      { name: "expense_no", type: "VARCHAR(50)", nullable: false, description: "Expense voucher ref (EXP-8491)" },
      { name: "category", type: "VARCHAR(100)", nullable: false, description: "Rent, Salaries, Utilities, Logistics" },
      { name: "business_location", type: "VARCHAR(100)", nullable: false, description: "Charged branch" },
      { name: "expense_date", type: "DATE", nullable: false, description: "Date incurred" },
      { name: "amount", type: "DECIMAL(12,2)", nullable: false, description: "Expense monetary sum" },
      { name: "reference_no", type: "VARCHAR(100)", nullable: true, description: "Vendor receipt or invoice bill #" },
      { name: "note", type: "TEXT", nullable: true, description: "Expense notes and descriptions" }
    ]
  }
];

export const SQL_DDL_SCRIPT = `-- =========================================================
-- APEX POS & INVENTORY MANAGEMENT SYSTEM RELATIONAL SCHEMA
-- Engine: PostgreSQL 14+ / ANSI SQL Compliant
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Cashier', 'Manager', 'Stockkeeper')),
    business_location VARCHAR(100) NOT NULL DEFAULT 'Main Warehouse',
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Customer Groups
CREATE TABLE customer_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    calculation_percentage NUMERIC(5,2) DEFAULT 0.00,
    selling_price_group VARCHAR(50) NOT NULL DEFAULT 'Default',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Contacts (Suppliers & Customers)
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('supplier', 'customer')),
    name VARCHAR(150) NOT NULL,
    business_name VARCHAR(200),
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    tax_number VARCHAR(50),
    customer_group_id UUID REFERENCES customer_groups(id) ON DELETE SET NULL,
    credit_limit NUMERIC(12,2) DEFAULT 0.00,
    balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Products Catalog & Stock
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100),
    category VARCHAR(100) NOT NULL,
    business_location VARCHAR(100) NOT NULL,
    unit_purchase_price NUMERIC(12,2) NOT NULL CHECK (unit_purchase_price >= 0),
    selling_price NUMERIC(12,2) NOT NULL CHECK (selling_price >= 0),
    current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    alert_quantity INTEGER NOT NULL DEFAULT 10,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Purchases (Inbound Orders)
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_no VARCHAR(50) UNIQUE NOT NULL,
    supplier_id UUID NOT NULL REFERENCES contacts(id) ON DELETE RESTRICT,
    business_location VARCHAR(100) NOT NULL,
    purchase_status VARCHAR(30) NOT NULL CHECK (purchase_status IN ('Received', 'Pending', 'Ordered')),
    payment_status VARCHAR(30) NOT NULL CHECK (payment_status IN ('Paid', 'Due', 'Partial')),
    purchase_date DATE NOT NULL,
    grand_total NUMERIC(12,2) NOT NULL,
    payment_due NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Purchase Items
CREATE TABLE purchase_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    purchase_price NUMERIC(12,2) NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL
);

-- 7. Purchase Returns
CREATE TABLE purchase_returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_no VARCHAR(50) UNIQUE NOT NULL,
    purchase_id UUID REFERENCES purchases(id) ON DELETE SET NULL,
    supplier_id UUID NOT NULL REFERENCES contacts(id) ON DELETE RESTRICT,
    business_location VARCHAR(100) NOT NULL,
    return_date DATE NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL,
    payment_status VARCHAR(30) NOT NULL CHECK (payment_status IN ('Refunded', 'Pending'))
);

-- 8. Sales & POS Transactions
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_no VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('pos', 'sale', 'draft')),
    customer_id UUID NOT NULL REFERENCES contacts(id) ON DELETE RESTRICT,
    business_location VARCHAR(100) NOT NULL,
    payment_status VARCHAR(30) NOT NULL CHECK (payment_status IN ('Paid', 'Due', 'Partial')),
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('Cash', 'Card', 'Bank Transfer', 'Credit')),
    total_amount NUMERIC(12,2) NOT NULL,
    invoice_due NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Sale Items
CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL,
    discount NUMERIC(12,2) DEFAULT 0.00,
    subtotal NUMERIC(12,2) NOT NULL
);

-- 10. Sales Returns
CREATE TABLE sale_returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_no VARCHAR(50) UNIQUE NOT NULL,
    sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES contacts(id) ON DELETE RESTRICT,
    business_location VARCHAR(100) NOT NULL,
    return_date DATE NOT NULL,
    total_refund NUMERIC(12,2) NOT NULL,
    reason TEXT
);

-- 11. Stock Transfers
CREATE TABLE stock_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transfer_no VARCHAR(50) UNIQUE NOT NULL,
    from_location VARCHAR(100) NOT NULL,
    to_location VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('Completed', 'Pending', 'In Transit')),
    shipping_charges NUMERIC(10,2) DEFAULT 0.00,
    total_amount NUMERIC(12,2) NOT NULL,
    transfer_date DATE NOT NULL
);

-- 12. Expenses
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expense_no VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    business_location VARCHAR(100) NOT NULL,
    expense_date DATE NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    reference_no VARCHAR(100),
    note TEXT
);

-- Indices for High Performance Lookups
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_purchases_date ON purchases(purchase_date);
CREATE INDEX idx_purchases_supplier ON purchases(supplier_id);
`;
