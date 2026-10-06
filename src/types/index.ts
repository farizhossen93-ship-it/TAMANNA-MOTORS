export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  businessLocation: string;
  unitPurchasePrice: number;
  sellingPrice: number;
  currentStock: number;
  alertQuantity: number;
  imageUrl: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  type: 'supplier' | 'customer';
  name: string;
  businessName?: string;
  email: string;
  phone: string;
  customerGroup?: string;
  businessLocation: string;
  creditLimit?: number;
  balance: number;
  totalPurchases?: number;
  taxNumber?: string;
  address?: string;
}

export interface CustomerGroup {
  id: string;
  name: string;
  calculationPercentage: number;
  sellingPriceGroup: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  purchasePrice: number;
  subtotal: number;
}

export interface Purchase {
  id: string;
  purchaseNo: string;
  supplierName: string;
  businessLocation: string;
  purchaseStatus: 'Received' | 'Pending' | 'Ordered';
  paymentStatus: 'Paid' | 'Due' | 'Partial';
  purchaseDate: string;
  grandTotal: number;
  paymentDue: number;
  itemsCount: number;
}

export interface PurchaseReturn {
  id: string;
  returnNo: string;
  purchaseNo: string;
  supplierName: string;
  businessLocation: string;
  returnDate: string;
  totalAmount: number;
  paymentStatus: 'Refunded' | 'Pending';
}

export interface SaleItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  subtotal: number;
}

export interface DuePaymentRecord {
  id: string;
  paymentDate: string;
  amountPaid: number;
  paymentMethod: string;
  remainingDue: number;
  receivedBy?: string;
  notes?: string;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  type: 'pos' | 'sale' | 'draft';
  customerName: string;
  customerPhone?: string;
  businessLocation: string;
  paymentStatus: 'Paid' | 'Due' | 'Partial';
  paymentMethod: 'Cash' | 'Card' | 'Bank Transfer' | 'Credit' | 'bKash/Nagad';
  totalAmount: number;
  invoiceDue: number;
  saleDate: string;
  dueDate?: string;
  dueNotes?: string;
  duePayments?: DuePaymentRecord[];
  itemsCount: number;
  items?: CartItem[];
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  amountTendered?: number;
  changeDue?: number;
  cashierName?: string;
  verificationHash?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  username: string;
  password?: string;
  role: UserRole;
  phone: string;
  businessLocation: string;
  status: 'Active' | 'Suspended' | 'Pending Approval';
  avatar?: string;
  lastLogin?: string;
  createdAt?: string;
}

export interface DeleteRequest {
  id: string;
  entityType: 'Product' | 'Sale' | 'Expense' | 'Contact';
  entityId: string;
  entityTitle: string;
  requestedBy: string;
  requestedByRole: UserRole;
  requestedAt: string;
  reason: string;
  details?: string;
  branch: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: 'DELETED' | 'DAMAGED' | 'APPROVED' | 'REJECTED' | 'STAFF_REGISTERED' | 'STAFF_APPROVED' | 'ROLE_CHANGED' | 'LOGIN';
  entityType: 'Product' | 'Sale' | 'Expense' | 'Contact' | 'Staff' | 'System';
  entityId: string;
  entityTitle: string;
  performedBy: string;
  userRole: UserRole;
  reason?: string;
  details?: string;
  branch?: string;
}

export interface SalesReturn {
  id: string;
  returnNo: string;
  invoiceNo: string;
  customerName: string;
  businessLocation: string;
  returnDate: string;
  totalRefund: number;
  reason: string;
}

export interface StockTransfer {
  id: string;
  transferNo: string;
  fromLocation: string;
  toLocation: string;
  status: 'Completed' | 'Pending' | 'In Transit';
  shippingCharges: number;
  totalAmount: number;
  date: string;
  itemsCount: number;
}

export interface Expense {
  id: string;
  expenseNo: string;
  category: 'Rent' | 'Utilities' | 'Salaries' | 'Logistics' | 'Marketing' | 'Maintenance' | 'Office Supplies';
  businessLocation: string;
  expenseDate: string;
  amount: number;
  referenceNo: string;
  note: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  customPrice?: number;
  discountPercent?: number;
}

export type UserRole = 'super_admin' | 'admin' | 'cashier' | 'manager';

export interface BusinessSettings {
  businessName: string;
  taxNumber: string;
  defaultCurrency: string;
  currencySymbol: string;
  financialYearStart: string;
  defaultTaxRate: number;
  primaryLocation: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  logoUrl?: string;
}

export interface InvoiceSettings {
  invoicePrefix: string;
  termsAndConditions: string;
  showLogo: boolean;
  paperSize: '80mm' | 'Letter' | 'A4';
  footerNotes: string;
  logoUrl?: string;
}
