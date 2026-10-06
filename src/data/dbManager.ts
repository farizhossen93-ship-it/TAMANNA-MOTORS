import { Product, Contact, CustomerGroup, Purchase, PurchaseReturn, Sale, SalesReturn, StockTransfer, Expense, BusinessSettings, InvoiceSettings, UserRole, AuthUser, DeleteRequest, AuditLog } from '../types';

export const DEFAULT_STAFF_USERS: AuthUser[] = [];

export const TAMANNA_BUSINESS_SETTINGS: BusinessSettings = {
  businessName: "TAMANNA MOTORS",
  taxNumber: "BIN-002849102-0101",
  defaultCurrency: "BDT (৳)",
  currencySymbol: "৳",
  financialYearStart: "July",
  defaultTaxRate: 5.0,
  primaryLocation: "Hazigonj, Chandpur",
  contactEmail: "tamannamotors.bd@gmail.com",
  contactPhone: "01626666906, 01878934956",
  address: "HAZIGONJ-KACHUA MAIN ROAD, WEST BAZAR, HAZIGONJ, CHANDPUR.",
  logoUrl: ""
};

export const TAMANNA_INVOICE_SETTINGS: InvoiceSettings = {
  invoicePrefix: "TM-2026-",
  termsAndConditions: "১. বিক্রিত মাল ১৪ দিনের মধ্যে অক্ষত অবস্থায় ক্যাশ মেমোসহ পরিবর্তনযোগ্য। ২. ইলেকট্রিক্যাল ও ব্যাটারি আইটেমে প্রস্তুতকারকের শর্ত প্রযোজ্য।",
  showLogo: true,
  paperSize: "A4",
  footerNotes: "তামান্না মোটরসে কেনাকাটার জন্য আন্তরিক ধন্যবাদ! ১০০% জেনুইন পার্টসের বিশ্বস্ত প্রতিষ্ঠান।",
  logoUrl: ""
};

export const INITIAL_TAMANNA_PRODUCTS: Product[] = [
  {
    id: "tm-prod-1",
    name: "Motul 7100 4T 10W-40 100% Synthetic 1L",
    sku: "MOT-4T-10W40",
    category: "Engine Oil & Lubricants",
    businessLocation: "Hazigonj Branch",
    unitPurchasePrice: 1250,
    sellingPrice: 1550,
    currentStock: 48,
    alertQuantity: 10,
    imageUrl: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=120&h=120&q=80",
    createdAt: "2026-08-14"
  },
  {
    id: "tm-prod-2",
    name: "NGK Laser Iridium Spark Plug CR9EIA-9",
    sku: "NGK-CR9EIA9",
    category: "Electrical & Ignition",
    businessLocation: "Hazigonj Branch",
    unitPurchasePrice: 680,
    sellingPrice: 950,
    currentStock: 32,
    alertQuantity: 8,
    imageUrl: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=120&h=120&q=80",
    createdAt: "2026-08-20"
  },
  {
    id: "tm-prod-3",
    name: "Brembo Sintered Front Disc Brake Pads Set",
    sku: "BRM-BP-FR01",
    category: "Brakes & Suspension",
    businessLocation: "Hazigonj Branch",
    unitPurchasePrice: 920,
    sellingPrice: 1350,
    currentStock: 18,
    alertQuantity: 5,
    imageUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=120&h=120&q=80",
    createdAt: "2026-09-01"
  },
  {
    id: "tm-prod-4",
    name: "Exide Xplore 12V 5Ah Maintenance-Free Battery",
    sku: "EXD-12V5AH-MF",
    category: "Batteries & Power",
    businessLocation: "Hazigonj Branch",
    unitPurchasePrice: 1850,
    sellingPrice: 2400,
    currentStock: 14,
    alertQuantity: 5,
    imageUrl: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=120&h=120&q=80",
    createdAt: "2026-09-05"
  },
  {
    id: "tm-prod-5",
    name: "MRF Zapper-FS 90/90-17 Tubeless Front Tyre",
    sku: "MRF-TYR-909017",
    category: "Tyres & Tubes",
    businessLocation: "Hazigonj Branch",
    unitPurchasePrice: 2800,
    sellingPrice: 3450,
    currentStock: 9,
    alertQuantity: 4,
    imageUrl: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=120&h=120&q=80",
    createdAt: "2026-09-12"
  },
  {
    id: "tm-prod-6",
    name: "DID 428-130L Heavy Duty Drive Chain & Sprocket",
    sku: "DID-428-130L",
    category: "Transmission & Drivetrain",
    businessLocation: "Hazigonj Branch",
    unitPurchasePrice: 1650,
    sellingPrice: 2200,
    currentStock: 22,
    alertQuantity: 6,
    imageUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=120&h=120&q=80",
    createdAt: "2026-09-15"
  },
  {
    id: "tm-prod-7",
    name: "Bosch FC4 Disc Dual-Tone 12V Horn Set",
    sku: "BSH-HRN-12V",
    category: "Electrical & Ignition",
    businessLocation: "Hazigonj Branch",
    unitPurchasePrice: 850,
    sellingPrice: 1250,
    currentStock: 25,
    alertQuantity: 6,
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=120&h=120&q=80",
    createdAt: "2026-09-18"
  },
  {
    id: "tm-prod-8",
    name: "K&N High-Flow Washable Air Filter",
    sku: "KN-FLT-YA01",
    category: "Filters & Intake",
    businessLocation: "Hazigonj Branch",
    unitPurchasePrice: 1400,
    sellingPrice: 1950,
    currentStock: 16,
    alertQuantity: 4,
    imageUrl: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=120&h=120&q=80",
    createdAt: "2026-09-22"
  }
];

export const INITIAL_TAMANNA_SUPPLIERS: Contact[] = [];

export const INITIAL_TAMANNA_CUSTOMERS: Contact[] = [
  {
    id: "cust-walkin",
    type: "customer",
    name: "Walk-in Customer (খুচরা ক্রেতা)",
    email: "retail@tamannamotors.com",
    phone: "01711000000",
    customerGroup: "Retail",
    businessLocation: "Hazigonj Branch",
    balance: 0.00,
    totalPurchases: 2400.00
  },
  {
    id: "cust-1",
    type: "customer",
    name: "Md. Rafiqul Islam (রফিকুল ইসলাম - মেকানিক)",
    email: "rafiq.mechanic@gmail.com",
    phone: "01819234567",
    customerGroup: "Wholesale",
    businessLocation: "Hazigonj Branch",
    balance: 2200.00,
    totalPurchases: 28500.00
  },
  {
    id: "cust-2",
    type: "customer",
    name: "Haji Nurul Huda (হাজী নুরুল হুদা)",
    email: "haji.nurul@gmail.com",
    phone: "01722889900",
    customerGroup: "VIP Fleet",
    businessLocation: "Hazigonj Branch",
    balance: 3450.00,
    totalPurchases: 42000.00
  }
];

export const INITIAL_TAMANNA_SALES: Sale[] = [
  {
    id: "sale-101",
    invoiceNo: "TM-2026-1001",
    type: "pos",
    customerName: "Md. Rafiqul Islam (মেকানিক)",
    customerPhone: "01819234567",
    businessLocation: "Hazigonj Branch",
    paymentStatus: "Partial",
    paymentMethod: "Cash",
    totalAmount: 5200,
    invoiceDue: 2200,
    saleDate: new Date(Date.now() - 86400000 * 2).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
    itemsCount: 3,
    subtotal: 4952,
    taxAmount: 248,
    discountAmount: 0,
    amountTendered: 3000,
    changeDue: 0,
    dueNotes: "বাকি টাকা আগামী সপ্তাহে পরিশোধ করবেন",
    duePayments: [
      {
        id: "dp-1",
        paymentDate: new Date(Date.now() - 86400000).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        amountPaid: 1000,
        paymentMethod: "bKash/Nagad",
        remainingDue: 2200,
        receivedBy: "Authorized Cashier",
        notes: "বিকাশে ১০০০ টাকা জমা দিলেন"
      }
    ],
    items: [
      {
        product: INITIAL_TAMANNA_PRODUCTS[0],
        quantity: 2
      },
      {
        product: INITIAL_TAMANNA_PRODUCTS[1],
        quantity: 2
      }
    ]
  },
  {
    id: "sale-102",
    invoiceNo: "TM-2026-1002",
    type: "pos",
    customerName: "Haji Nurul Huda",
    customerPhone: "01722889900",
    businessLocation: "Hazigonj Branch",
    paymentStatus: "Due",
    paymentMethod: "Credit",
    totalAmount: 3450,
    invoiceDue: 3450,
    saleDate: new Date(Date.now() - 86400000 * 1).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
    itemsCount: 1,
    subtotal: 3285,
    taxAmount: 165,
    discountAmount: 0,
    amountTendered: 0,
    changeDue: 0,
    dueNotes: "টায়ার পরিবর্তন বাকি",
    items: [
      {
        product: INITIAL_TAMANNA_PRODUCTS[4],
        quantity: 1
      }
    ]
  },
  {
    id: "sale-103",
    invoiceNo: "TM-2026-1003",
    type: "pos",
    customerName: "Walk-in Customer",
    customerPhone: "01711000000",
    businessLocation: "Hazigonj Branch",
    paymentStatus: "Paid",
    paymentMethod: "Cash",
    totalAmount: 2400,
    invoiceDue: 0,
    saleDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
    itemsCount: 1,
    subtotal: 2285,
    taxAmount: 115,
    discountAmount: 0,
    amountTendered: 2400,
    changeDue: 0,
    items: [
      {
        product: INITIAL_TAMANNA_PRODUCTS[3],
        quantity: 1
      }
    ]
  }
];

export const INITIAL_TAMANNA_PURCHASES: Purchase[] = [];

export const INITIAL_TAMANNA_EXPENSES: Expense[] = [];

const STORAGE_KEYS = {
  PRODUCTS: 'tamanna_db_products',
  SUPPLIERS: 'tamanna_db_suppliers',
  CUSTOMERS: 'tamanna_db_customers',
  SALES: 'tamanna_db_sales',
  EXPENSES: 'tamanna_db_expenses',
  PURCHASES: 'tamanna_db_purchases',
  BUSINESS: 'tamanna_db_business',
  INVOICE: 'tamanna_db_invoice',
  ROLE: 'tamanna_active_role',
  THEME: 'tamanna_theme',
  LANG: 'tamanna_lang',
  STAFF_USERS: 'tamanna_staff_users',
  CURRENT_USER: 'tamanna_current_user',
  AUDIT_LOGS: 'tamanna_audit_logs',
  DELETE_REQUESTS: 'tamanna_delete_requests'
};

export const DatabaseStorage = {
  loadProducts(): Product[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : INITIAL_TAMANNA_PRODUCTS;
    } catch {
      return INITIAL_TAMANNA_PRODUCTS;
    }
  },

  saveProducts(products: Product[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error("Storage error:", e);
    }
  },

  loadSuppliers(): Contact[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
      if (!data) return [];
      const parsed: Contact[] = JSON.parse(data);
      return Array.isArray(parsed) ? parsed.filter(c => c && c.id && !c.id.startsWith('tm-sup-') && !c.id.startsWith('sup-')) : [];
    } catch {
      return [];
    }
  },

  saveSuppliers(suppliers: Contact[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
    } catch (e) {
      console.error(e);
    }
  },

  loadCustomers(): Contact[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      if (!data) return INITIAL_TAMANNA_CUSTOMERS;
      const parsed: Contact[] = JSON.parse(data);
      const filtered = Array.isArray(parsed) ? parsed.filter(c => c && c.id && !c.id.startsWith('tm-cust-')) : [];
      return filtered.length > 0 ? filtered : INITIAL_TAMANNA_CUSTOMERS;
    } catch {
      return INITIAL_TAMANNA_CUSTOMERS;
    }
  },

  saveCustomers(customers: Contact[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    } catch (e) {
      console.error(e);
    }
  },

  loadSales(): Sale[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SALES);
      if (!data) return [];
      const parsed: Sale[] = JSON.parse(data);
      return Array.isArray(parsed) ? parsed.filter(s => s && s.id && !s.id.startsWith('tm-sale-') && !s.id.startsWith('sale-')) : [];
    } catch {
      return [];
    }
  },

  saveSales(sales: Sale[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
    } catch (e) {
      console.error(e);
    }
  },

  loadBusinessSettings(): BusinessSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUSINESS);
      if (!data) return TAMANNA_BUSINESS_SETTINGS;
      const parsed: BusinessSettings = JSON.parse(data);
      // Clean mock unsplash URLs
      if (parsed.logoUrl && parsed.logoUrl.includes('unsplash.com')) {
        parsed.logoUrl = '';
      }
      // Ensure official updated Hazigonj Chandpur address
      if (!parsed.address || parsed.address.includes('Mirpur-10')) {
        parsed.address = TAMANNA_BUSINESS_SETTINGS.address;
        parsed.contactPhone = TAMANNA_BUSINESS_SETTINGS.contactPhone;
        parsed.primaryLocation = TAMANNA_BUSINESS_SETTINGS.primaryLocation;
      }
      return parsed;
    } catch {
      return TAMANNA_BUSINESS_SETTINGS;
    }
  },

  saveBusinessSettings(settings: BusinessSettings) {
    try {
      localStorage.setItem(STORAGE_KEYS.BUSINESS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  },

  loadInvoiceSettings(): InvoiceSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INVOICE);
      if (!data) return TAMANNA_INVOICE_SETTINGS;
      const parsed: InvoiceSettings = JSON.parse(data);
      // Clean mock unsplash URLs
      if (parsed.logoUrl && parsed.logoUrl.includes('unsplash.com')) {
        parsed.logoUrl = '';
      }
      return parsed;
    } catch {
      return TAMANNA_INVOICE_SETTINGS;
    }
  },

  saveInvoiceSettings(settings: InvoiceSettings) {
    try {
      localStorage.setItem(STORAGE_KEYS.INVOICE, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  },

  loadPurchases(): Purchase[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PURCHASES);
      if (!data) return [];
      const parsed: Purchase[] = JSON.parse(data);
      return Array.isArray(parsed) ? parsed.filter(p => p && p.id && !p.id.startsWith('pur-tm-') && !p.id.startsWith('pur-')) : [];
    } catch {
      return [];
    }
  },

  savePurchases(purchases: Purchase[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
    } catch (e) {
      console.error(e);
    }
  },

  loadExpenses(): Expense[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (!data) return [];
      const parsed: Expense[] = JSON.parse(data);
      return Array.isArray(parsed) ? parsed.filter(e => e && e.id && !e.id.startsWith('exp-tm-') && !e.id.startsWith('exp-')) : [];
    } catch {
      return [];
    }
  },

  saveExpenses(expenses: Expense[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch (e) {
      console.error(e);
    }
  },

  loadActiveRole(): UserRole {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.ROLE);
      return (val as UserRole) || 'super_admin';
    } catch {
      return 'super_admin';
    }
  },

  saveActiveRole(role: UserRole) {
    try {
      localStorage.setItem(STORAGE_KEYS.ROLE, role);
    } catch (e) {
      console.error(e);
    }
  },

  loadTheme(): 'light' | 'dark' {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.THEME);
      return val === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  },

  saveTheme(theme: 'light' | 'dark') {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (e) {
      console.error(e);
    }
  },

  loadLang(): 'en' | 'bn' {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.LANG);
      return val === 'bn' ? 'bn' : 'en';
    } catch {
      return 'en';
    }
  },

  saveLang(lang: 'en' | 'bn') {
    try {
      localStorage.setItem(STORAGE_KEYS.LANG, lang);
    } catch (e) {
      console.error(e);
    }
  },

  loadStaffUsers(): AuthUser[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STAFF_USERS);
      if (!data) return [];
      const parsed: AuthUser[] = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      // Clean and remove any mock demo accounts
      const cleanUsers = parsed.filter(u => 
        u && 
        u.username !== 'cashier' && 
        u.username !== 'manager' && 
        u.username !== 'stock' &&
        !u.email?.endsWith('@tamannamotors.com')
      );
      return cleanUsers;
    } catch {
      return [];
    }
  },

  saveStaffUsers(users: AuthUser[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.STAFF_USERS, JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  },

  loadCurrentUser(): AuthUser | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (data) {
        const user: AuthUser = JSON.parse(data);
        if (
          user.username === 'cashier' || 
          user.username === 'manager' || 
          user.username === 'stock' ||
          user.email?.endsWith('@tamannamotors.com')
        ) {
          localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
          return null;
        }
        return user;
      }
      return null;
    } catch {
      return null;
    }
  },

  saveCurrentUser(user: AuthUser | null) {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    } catch (e) {
      console.error(e);
    }
  },

  resetDatabase() {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.SUPPLIERS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.SALES);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.PURCHASES);
    localStorage.removeItem(STORAGE_KEYS.BUSINESS);
    localStorage.removeItem(STORAGE_KEYS.INVOICE);
    localStorage.removeItem(STORAGE_KEYS.STAFF_USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  clearTempSales() {
    try {
      localStorage.removeItem(STORAGE_KEYS.SALES);
    } catch (e) {
      console.error(e);
    }
  },

  loadAuditLogs(): AuditLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveAuditLogs(logs: AuditLog[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error(e);
    }
  },

  addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const logs = this.loadAuditLogs();
    const newLog: AuditLog = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleString()
    };
    const updated = [newLog, ...logs.slice(0, 499)]; // keep latest 500
    this.saveAuditLogs(updated);
    return newLog;
  },

  loadDeleteRequests(): DeleteRequest[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DELETE_REQUESTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveDeleteRequests(requests: DeleteRequest[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.DELETE_REQUESTS, JSON.stringify(requests));
    } catch (e) {
      console.error(e);
    }
  },

  addDeleteRequest(req: Omit<DeleteRequest, 'id' | 'requestedAt' | 'status'>): DeleteRequest {
    const requests = this.loadDeleteRequests();
    const newReq: DeleteRequest = {
      ...req,
      id: `del-req-${Date.now()}`,
      requestedAt: new Date().toLocaleString(),
      status: 'Pending'
    };
    const updated = [newReq, ...requests];
    this.saveDeleteRequests(updated);
    return newReq;
  }
};
