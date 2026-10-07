import { Product, Contact, CustomerGroup, Purchase, PurchaseReturn, Sale, SalesReturn, StockTransfer, Expense, BusinessSettings, InvoiceSettings, UserRole, AuthUser, DeleteRequest, AuditLog } from '../types';
import { idbSet, idbGet, idbClearStore, STORES } from './indexedDB';

export const DEFAULT_STAFF_USERS: AuthUser[] = [];

export const TAMANNA_BUSINESS_SETTINGS: BusinessSettings = {
  businessName: "TAMANNA MOTORS",
  taxNumber: "BIN-002849102-0101",
  defaultCurrency: "BDT (৳)",
  currencySymbol: "৳",
  financialYearStart: "July",
  defaultTaxRate: 5.0,
  primaryLocation: "Hazigonj Branch",
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
    id: "prod-1",
    name: "Motul 7100 4T 10W-40 Synthetic 1L",
    sku: "MOT-7100-10W40",
    category: "Engine Oil & Lubricants",
    businessLocation: "Hazigonj Branch",
    unitPurchasePrice: 1250,
    sellingPrice: 1550,
    currentStock: 25,
    alertQuantity: 5,
    imageUrl: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=200&h=200&q=80",
    createdAt: "2026-01-01"
  },
  {
    id: "prod-2",
    name: "NGK Laser Iridium Spark Plug (FZ/Gixxer)",
    sku: "NGK-CR9EIX",
    category: "Electrical & Ignition",
    businessLocation: "Hazigonj Branch",
    unitPurchasePrice: 450,
    sellingPrice: 650,
    currentStock: 40,
    alertQuantity: 8,
    imageUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=200&h=200&q=80",
    createdAt: "2026-01-02"
  },
  {
    id: "prod-3",
    name: "Yamaha FZ / R15 V3 Heavy Chain Sprocket Kit",
    sku: "CHN-FZ-R15V3",
    category: "Transmission & Drivetrain",
    businessLocation: "Hazigonj Branch",
    unitPurchasePrice: 2200,
    sellingPrice: 2800,
    currentStock: 12,
    alertQuantity: 3,
    imageUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=200&h=200&q=80",
    createdAt: "2026-01-03"
  },
  {
    id: "prod-4",
    name: "Bosch Maintenance-Free Battery 12V 5Ah",
    sku: "BAT-BS-12V5AH",
    category: "Batteries & Power",
    businessLocation: "Hazigonj Branch",
    unitPurchasePrice: 1800,
    sellingPrice: 2350,
    currentStock: 15,
    alertQuantity: 4,
    imageUrl: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=200&h=200&q=80",
    createdAt: "2026-01-04"
  },
  {
    id: "prod-5",
    name: "MRF Nylogrip Zapper Tubeless Tyre 100/80-17",
    sku: "TYR-MRF-1008017",
    category: "Tyres & Tubes",
    businessLocation: "Hazigonj Branch",
    unitPurchasePrice: 3200,
    sellingPrice: 3950,
    currentStock: 10,
    alertQuantity: 3,
    imageUrl: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=200&h=200&q=80",
    createdAt: "2026-01-05"
  }
];

export const INITIAL_TAMANNA_SUPPLIERS: Contact[] = [];

export const INITIAL_TAMANNA_CUSTOMERS: Contact[] = [
  {
    id: "cust-walkin",
    type: "customer",
    name: "Walk-in Customer (খুচরা ক্রেতা)",
    email: "",
    phone: "01700000000",
    customerGroup: "Retail",
    businessLocation: "Hazigonj Branch",
    balance: 0.00,
    totalPurchases: 0.00
  }
];

export const INITIAL_TAMANNA_SALES: Sale[] = [];
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

// Safe LocalStorage setter helper
function safeSetLocalStorage(key: string, data: any) {
  try {
    const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
    localStorage.setItem(key, jsonStr);
  } catch (e) {
    console.warn(`[LocalStorage] Quota error on key ${key}. Relying on IndexedDB.`, e);
    // On QuotaExceededError, clean images or shrink array to save light version in localStorage
    try {
      if (Array.isArray(data)) {
        const lightData = data.slice(0, 50).map((item: any) => {
          if (item && typeof item === 'object') {
            const copy = { ...item };
            if (copy.imageUrl && copy.imageUrl.length > 500) copy.imageUrl = '';
            if (copy.logoUrl && copy.logoUrl.length > 500) copy.logoUrl = '';
            return copy;
          }
          return item;
        });
        localStorage.setItem(key, JSON.stringify(lightData));
      }
    } catch {
      // Ignore fallback failure safely
    }
  }
}

export const DatabaseStorage = {
  // Products
  loadProducts(): Product[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (!data) return INITIAL_TAMANNA_PRODUCTS;
      const parsed: Product[] = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_TAMANNA_PRODUCTS;
      return parsed;
    } catch {
      return INITIAL_TAMANNA_PRODUCTS;
    }
  },

  async loadProductsAsync(): Promise<Product[]> {
    const fromIdb = await idbGet<Product[]>(STORES.PRODUCTS, 'all');
    if (fromIdb && Array.isArray(fromIdb) && fromIdb.length > 0) return fromIdb;
    return this.loadProducts();
  },

  saveProducts(products: Product[]) {
    safeSetLocalStorage(STORAGE_KEYS.PRODUCTS, products);
    idbSet(STORES.PRODUCTS, 'all', products);
  },

  // Suppliers
  loadSuppliers(): Contact[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
      if (!data) return [];
      const parsed: Contact[] = JSON.parse(data);
      return Array.isArray(parsed) ? parsed.filter(c => c && c.id) : [];
    } catch {
      return [];
    }
  },

  async loadSuppliersAsync(): Promise<Contact[]> {
    const fromIdb = await idbGet<Contact[]>(STORES.SUPPLIERS, 'all');
    if (fromIdb && Array.isArray(fromIdb)) return fromIdb;
    return this.loadSuppliers();
  },

  saveSuppliers(suppliers: Contact[]) {
    safeSetLocalStorage(STORAGE_KEYS.SUPPLIERS, suppliers);
    idbSet(STORES.SUPPLIERS, 'all', suppliers);
  },

  // Customers
  loadCustomers(): Contact[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      if (!data) return INITIAL_TAMANNA_CUSTOMERS;
      const parsed: Contact[] = JSON.parse(data);
      const filtered = Array.isArray(parsed) ? parsed.filter(c => c && c.id) : [];
      return filtered.length > 0 ? filtered : INITIAL_TAMANNA_CUSTOMERS;
    } catch {
      return INITIAL_TAMANNA_CUSTOMERS;
    }
  },

  async loadCustomersAsync(): Promise<Contact[]> {
    const fromIdb = await idbGet<Contact[]>(STORES.CUSTOMERS, 'all');
    if (fromIdb && Array.isArray(fromIdb) && fromIdb.length > 0) return fromIdb;
    return this.loadCustomers();
  },

  saveCustomers(customers: Contact[]) {
    safeSetLocalStorage(STORAGE_KEYS.CUSTOMERS, customers);
    idbSet(STORES.CUSTOMERS, 'all', customers);
  },

  // Sales
  loadSales(): Sale[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SALES);
      if (!data) return [];
      const parsed: Sale[] = JSON.parse(data);
      return Array.isArray(parsed) ? parsed.filter(s => s && s.id) : [];
    } catch {
      return [];
    }
  },

  async loadSalesAsync(): Promise<Sale[]> {
    const fromIdb = await idbGet<Sale[]>(STORES.SALES, 'all');
    if (fromIdb && Array.isArray(fromIdb) && fromIdb.length > 0) return fromIdb;
    return this.loadSales();
  },

  saveSales(sales: Sale[]) {
    safeSetLocalStorage(STORAGE_KEYS.SALES, sales);
    idbSet(STORES.SALES, 'all', sales);
  },

  // Business Settings
  loadBusinessSettings(): BusinessSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUSINESS);
      if (!data) return TAMANNA_BUSINESS_SETTINGS;
      const parsed: BusinessSettings = JSON.parse(data);
      if (parsed.logoUrl && parsed.logoUrl.includes('unsplash.com')) {
        parsed.logoUrl = '';
      }
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
    safeSetLocalStorage(STORAGE_KEYS.BUSINESS, settings);
    idbSet(STORES.SETTINGS, 'business', settings);
  },

  // Invoice Settings
  loadInvoiceSettings(): InvoiceSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INVOICE);
      if (!data) return TAMANNA_INVOICE_SETTINGS;
      const parsed: InvoiceSettings = JSON.parse(data);
      if (parsed.logoUrl && parsed.logoUrl.includes('unsplash.com')) {
        parsed.logoUrl = '';
      }
      return parsed;
    } catch {
      return TAMANNA_INVOICE_SETTINGS;
    }
  },

  saveInvoiceSettings(settings: InvoiceSettings) {
    safeSetLocalStorage(STORAGE_KEYS.INVOICE, settings);
    idbSet(STORES.SETTINGS, 'invoice', settings);
  },

  // Purchases
  loadPurchases(): Purchase[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PURCHASES);
      if (!data) return [];
      const parsed: Purchase[] = JSON.parse(data);
      return Array.isArray(parsed) ? parsed.filter(p => p && p.id) : [];
    } catch {
      return [];
    }
  },

  async loadPurchasesAsync(): Promise<Purchase[]> {
    const fromIdb = await idbGet<Purchase[]>(STORES.PURCHASES, 'all');
    if (fromIdb && Array.isArray(fromIdb)) return fromIdb;
    return this.loadPurchases();
  },

  savePurchases(purchases: Purchase[]) {
    safeSetLocalStorage(STORAGE_KEYS.PURCHASES, purchases);
    idbSet(STORES.PURCHASES, 'all', purchases);
  },

  // Expenses
  loadExpenses(): Expense[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (!data) return [];
      const parsed: Expense[] = JSON.parse(data);
      return Array.isArray(parsed) ? parsed.filter(e => e && e.id) : [];
    } catch {
      return [];
    }
  },

  async loadExpensesAsync(): Promise<Expense[]> {
    const fromIdb = await idbGet<Expense[]>(STORES.EXPENSES, 'all');
    if (fromIdb && Array.isArray(fromIdb)) return fromIdb;
    return this.loadExpenses();
  },

  saveExpenses(expenses: Expense[]) {
    safeSetLocalStorage(STORAGE_KEYS.EXPENSES, expenses);
    idbSet(STORES.EXPENSES, 'all', expenses);
  },

  // Active Role
  loadActiveRole(): UserRole {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.ROLE);
      return (val as UserRole) || 'super_admin';
    } catch {
      return 'super_admin';
    }
  },

  saveActiveRole(role: UserRole) {
    safeSetLocalStorage(STORAGE_KEYS.ROLE, role);
  },

  // Theme & Lang
  loadTheme(): 'light' | 'dark' {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.THEME);
      return val === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  },

  saveTheme(theme: 'light' | 'dark') {
    safeSetLocalStorage(STORAGE_KEYS.THEME, theme);
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
    safeSetLocalStorage(STORAGE_KEYS.LANG, lang);
  },

  // Staff Users
  loadStaffUsers(): AuthUser[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STAFF_USERS);
      if (!data) return [];
      const parsed: AuthUser[] = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(u => u && u.username && u.id);
    } catch {
      return [];
    }
  },

  async loadStaffUsersAsync(): Promise<AuthUser[]> {
    const fromIdb = await idbGet<AuthUser[]>(STORES.STAFF_USERS, 'all');
    if (fromIdb && Array.isArray(fromIdb) && fromIdb.length > 0) return fromIdb;
    return this.loadStaffUsers();
  },

  saveStaffUsers(users: AuthUser[]) {
    safeSetLocalStorage(STORAGE_KEYS.STAFF_USERS, users);
    idbSet(STORES.STAFF_USERS, 'all', users);
  },

  // Current User
  loadCurrentUser(): AuthUser | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (data) {
        const user: AuthUser = JSON.parse(data);
        if (user && user.username && user.id && user.status !== 'Suspended') {
          return user;
        }
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        return null;
      }
      return null;
    } catch {
      return null;
    }
  },

  saveCurrentUser(user: AuthUser | null) {
    if (user) {
      safeSetLocalStorage(STORAGE_KEYS.CURRENT_USER, user);
    } else {
      try {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      } catch {}
    }
  },

  // Reset database
  resetDatabase() {
    Object.values(STORAGE_KEYS).forEach(key => {
      try { localStorage.removeItem(key); } catch {}
    });
    Object.values(STORES).forEach(store => idbClearStore(store));
  },

  clearTempSales() {
    try {
      localStorage.removeItem(STORAGE_KEYS.SALES);
      idbClearStore(STORES.SALES);
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
    safeSetLocalStorage(STORAGE_KEYS.AUDIT_LOGS, logs);
  },

  addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const logs = this.loadAuditLogs();
    const newLog: AuditLog = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleString()
    };
    const updated = [newLog, ...logs.slice(0, 499)];
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
    safeSetLocalStorage(STORAGE_KEYS.DELETE_REQUESTS, requests);
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
