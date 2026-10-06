import { pgTable, serial, text, timestamp, numeric, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users / Staff
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  username: text('username'),
  role: text('role').default('cashier'),
  phone: text('phone'),
  businessLocation: text('business_location').default('Hazigonj Branch'),
  status: text('status').default('Active'),
  lastLogin: text('last_login'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Products & Motorcycle Spare Parts
export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  sku: text('sku').notNull(),
  category: text('category').notNull(),
  businessLocation: text('business_location').default('Hazigonj Branch'),
  unitPurchasePrice: numeric('unit_purchase_price', { precision: 12, scale: 2 }).notNull(),
  sellingPrice: numeric('selling_price', { precision: 12, scale: 2 }).notNull(),
  currentStock: integer('current_stock').default(0).notNull(),
  alertQuantity: integer('alert_quantity').default(5),
  imageUrl: text('image_url'),
  createdAt: text('created_at'),
});

// Contacts: Suppliers & Customers
export const contacts = pgTable('contacts', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // 'customer' | 'supplier'
  name: text('name').notNull(),
  businessName: text('business_name'),
  email: text('email'),
  phone: text('phone'),
  customerGroup: text('customer_group'),
  creditLimit: numeric('credit_limit', { precision: 12, scale: 2 }),
  address: text('address'),
  businessLocation: text('business_location').default('Hazigonj Branch'),
  balance: numeric('balance', { precision: 12, scale: 2 }).default('0'),
  totalPurchases: numeric('total_purchases', { precision: 12, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Sales & Invoices
export const sales = pgTable('sales', {
  id: text('id').primaryKey(),
  invoiceNo: text('invoice_no').notNull().unique(),
  type: text('type').default('pos'), // 'pos' | 'sale' | 'draft'
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone'),
  businessLocation: text('business_location').default('Hazigonj Branch'),
  paymentStatus: text('payment_status').default('Paid'), // 'Paid' | 'Due' | 'Partial'
  paymentMethod: text('payment_method').default('Cash'),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
  invoiceDue: numeric('invoice_due', { precision: 12, scale: 2 }).default('0'),
  saleDate: text('sale_date').notNull(),
  itemsCount: integer('items_count').default(1),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }),
  taxAmount: numeric('tax_amount', { precision: 12, scale: 2 }),
  discountAmount: numeric('discount_amount', { precision: 12, scale: 2 }),
  amountTendered: numeric('amount_tendered', { precision: 12, scale: 2 }),
  changeDue: numeric('change_due', { precision: 12, scale: 2 }),
  cashierName: text('cashier_name'),
  dueNotes: text('due_notes'),
  itemsData: text('items_data'), // JSON string of CartItem[]
  createdAt: timestamp('created_at').defaultNow(),
});

// Due Payment History
export const duePayments = pgTable('due_payments', {
  id: text('id').primaryKey(),
  saleId: text('sale_id').references(() => sales.id),
  invoiceNo: text('invoice_no'),
  paymentDate: text('payment_date').notNull(),
  amountPaid: numeric('amount_paid', { precision: 12, scale: 2 }).notNull(),
  paymentMethod: text('payment_method').default('Cash'),
  remainingDue: numeric('remaining_due', { precision: 12, scale: 2 }).default('0'),
  receivedBy: text('received_by'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Inbound Purchases
export const purchases = pgTable('purchases', {
  id: text('id').primaryKey(),
  purchaseNo: text('purchase_no').notNull().unique(),
  supplierName: text('supplier_name').notNull(),
  businessLocation: text('business_location').default('Hazigonj Branch'),
  purchaseStatus: text('purchase_status').default('Received'),
  paymentStatus: text('payment_status').default('Paid'),
  purchaseDate: text('purchase_date').notNull(),
  grandTotal: numeric('grand_total', { precision: 12, scale: 2 }).notNull(),
  paymentDue: numeric('payment_due', { precision: 12, scale: 2 }).default('0'),
  itemsCount: integer('items_count').default(1),
  createdAt: timestamp('created_at').defaultNow(),
});

// Expenses
export const expenses = pgTable('expenses', {
  id: text('id').primaryKey(),
  expenseNo: text('expense_no').notNull().unique(),
  category: text('category').notNull(),
  businessLocation: text('business_location').default('Hazigonj Branch'),
  expenseDate: text('expense_date').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  referenceNo: text('reference_no'),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Audit Logs
export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  timestamp: text('timestamp').notNull(),
  actionType: text('action_type').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  entityTitle: text('entity_title').notNull(),
  performedBy: text('performed_by').notNull(),
  businessLocation: text('business_location').default('Hazigonj Branch'),
  details: text('details'),
});

// Delete & Damage Approval Requests
export const deleteRequests = pgTable('delete_requests', {
  id: text('id').primaryKey(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  entityTitle: text('entity_title').notNull(),
  requestedBy: text('requested_by').notNull(),
  requestDate: text('request_date').notNull(),
  reason: text('reason').notNull(),
  damageSeverity: text('damage_severity').default('None'),
  status: text('status').default('Pending'), // 'Pending' | 'Approved' | 'Rejected'
  businessLocation: text('business_location').default('Hazigonj Branch'),
  itemValue: numeric('item_value', { precision: 12, scale: 2 }).default('0'),
});

// Key-Value App Settings (Business Settings & Invoice Layouts)
export const appSettings = pgTable('app_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(), // JSON serialized settings
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const salesRelations = relations(sales, ({ many }) => ({
  duePayments: many(duePayments),
}));

export const duePaymentsRelations = relations(duePayments, ({ one }) => ({
  sale: one(sales, {
    fields: [duePayments.saleId],
    references: [sales.id],
  }),
}));
