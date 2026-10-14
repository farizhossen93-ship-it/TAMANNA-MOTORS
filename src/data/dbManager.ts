import { Product, Contact, CustomerGroup, Purchase, PurchaseReturn, Sale, SalesReturn, StockTransfer, Expense, BusinessSettings, InvoiceSettings, UserRole, AuthUser, DeleteRequest, AuditLog } from '../types';
import { idbSet, idbGet, idbClearStore, STORES } from './indexedDB';

export const DEFAULT_STAFF_USERS: AuthUser[] = [
  {
    id: '9e4e8c95-81a0-4f73-9638-c6340427918e',
    uid: '9e4e8c95-81a0-4f73-9638-c6340427918e',
    name: 'Md Sahidul islam',
    username: 'sahidul',
    email: 'tamannamotors158@gmail.com',
    password: 'khoka420',
    phone: '+8801626666906',
    role: 'super_admin',
    businessLocation: 'Hazigonj Branch',
    status: 'Active',
    emailVerified: true,
    lastLogin: '12:12 PM'
  }
];

export const TAMANNA_BUSINESS_SETTINGS: BusinessSettings = {
  businessName: "TAMANNA MOTORS",
  taxNumber: "",
  defaultCurrency: "BDT (৳)",
  currencySymbol: "৳",
  financialYearStart: "July",
  defaultTaxRate: 0.0,
  primaryLocation: "Hazigonj Branch",
  contactEmail: "tamannamotors158@gmail.com",
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

import importedTamannaData from './importedTamannaData.json';

export const INITIAL_TAMANNA_PRODUCTS: Product[] = (importedTamannaData.products || []) as Product[];
export const INITIAL_TAMANNA_SUPPLIERS: Contact[] = (importedTamannaData.suppliers || []) as Contact[];
export const INITIAL_TAMANNA_CUSTOMERS: Contact[] = (importedTamannaData.customers && importedTamannaData.customers.length > 0 ? importedTamannaData.customers : [
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
]) as Contact[];

export const INITIAL_TAMANNA_SALES: Sale[] = (importedTamannaData.sales || []) as Sale[];
export const INITIAL_TAMANNA_PURCHASES: Purchase[] = (importedTamannaData.purchases || []) as Purchase[];
export const INITIAL_TAMANNA_EXPENSES: Expense[] = (importedTamannaData.expenses || []) as Expense[];

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

// Fast in-memory cache for all entities to prevent local storage quota locks
const memCache = new Map<string, any>();

// Safe LocalStorage setter helper - NEVER throws QuotaExceededError
function safeSetLocalStorage(key: string, data: any) {
  try {
    memCache.set(key, data);
    const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
    localStorage.setItem(key, jsonStr);
  } catch {
    // If QuotaExceededError happens, suppress error and keep memory copy
    try {
      if (Array.isArray(data)) {
        // Only save latest 10 items in localStorage to stay well within 5MB limit
        const smallSlice = data.slice(0, 10);
        localStorage.setItem(key, JSON.stringify(smallSlice));
      }
    } catch {
      // Ignore completely - memCache and IndexedDB keep the full dataset intact
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
      if (!Array.isArray(parsed) || parsed.length < INITIAL_TAMANNA_PRODUCTS.length) {
        const map = new Map<string, Product>();
        for (const p of INITIAL_TAMANNA_PRODUCTS) map.set(p.id, p);
        if (Array.isArray(parsed)) {
          for (const p of parsed) if (p && p.id) map.set(p.id, p);
        }
        const full = Array.from(map.values());
        this.saveProducts(full);
        return full;
      }
      return parsed;
    } catch {
      return INITIAL_TAMANNA_PRODUCTS;
    }
  },

  async loadProductsAsync(): Promise<Product[]> {
    const fromIdb = await idbGet<Product[]>(STORES.PRODUCTS, 'all');
    if (fromIdb && Array.isArray(fromIdb)) return fromIdb;
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
      if (!data) return INITIAL_TAMANNA_SUPPLIERS;
      const parsed: Contact[] = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length < INITIAL_TAMANNA_SUPPLIERS.length) {
        const map = new Map<string, Contact>();
        for (const s of INITIAL_TAMANNA_SUPPLIERS) map.set(s.id, s);
        if (Array.isArray(parsed)) {
          for (const s of parsed) if (s && s.id) map.set(s.id, s);
        }
        const full = Array.from(map.values());
        this.saveSuppliers(full);
        return full;
      }
      return parsed.filter(c => c && c.id);
    } catch {
      return INITIAL_TAMANNA_SUPPLIERS;
    }
  },

  async loadSuppliersAsync(): Promise<Contact[]> {
    const fromIdb = await idbGet<Contact[]>(STORES.SUPPLIERS, 'all');
    if (fromIdb && Array.isArray(fromIdb) && fromIdb.length >= INITIAL_TAMANNA_SUPPLIERS.length) return fromIdb;
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
      if (!Array.isArray(parsed) || parsed.length < INITIAL_TAMANNA_CUSTOMERS.length) {
        const map = new Map<string, Contact>();
        for (const c of INITIAL_TAMANNA_CUSTOMERS) map.set(c.id, c);
        if (Array.isArray(parsed)) {
          for (const c of parsed) if (c && c.id) map.set(c.id, c);
        }
        const full = Array.from(map.values());
        this.saveCustomers(full);
        return full;
      }
      return parsed.filter(c => c && c.id);
    } catch {
      return INITIAL_TAMANNA_CUSTOMERS;
    }
  },

  async loadCustomersAsync(): Promise<Contact[]> {
    const fromIdb = await idbGet<Contact[]>(STORES.CUSTOMERS, 'all');
    if (fromIdb && Array.isArray(fromIdb) && fromIdb.length >= INITIAL_TAMANNA_CUSTOMERS.length) return fromIdb;
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
      if (!data) return INITIAL_TAMANNA_SALES;
      const parsed: Sale[] = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length < INITIAL_TAMANNA_SALES.length) {
        const map = new Map<string, Sale>();
        for (const s of INITIAL_TAMANNA_SALES) map.set(s.id, s);
        if (Array.isArray(parsed)) {
          for (const s of parsed) if (s && s.id) map.set(s.id, s);
        }
        const full = Array.from(map.values());
        this.saveSales(full);
        return full;
      }
      return parsed.filter(s => s && s.id);
    } catch {
      return INITIAL_TAMANNA_SALES;
    }
  },

  async loadSalesAsync(): Promise<Sale[]> {
    const fromIdb = await idbGet<Sale[]>(STORES.SALES, 'all');
    if (fromIdb && Array.isArray(fromIdb) && fromIdb.length >= INITIAL_TAMANNA_SALES.length) return fromIdb;
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
      if (parsed.defaultTaxRate === undefined || parsed.defaultTaxRate === 5.0) {
        parsed.defaultTaxRate = 0.0;
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
      if (!data) return INITIAL_TAMANNA_PURCHASES;
      const parsed: Purchase[] = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length < INITIAL_TAMANNA_PURCHASES.length) {
        const map = new Map<string, Purchase>();
        for (const p of INITIAL_TAMANNA_PURCHASES) map.set(p.id, p);
        if (Array.isArray(parsed)) {
          for (const p of parsed) if (p && p.id) map.set(p.id, p);
        }
        const full = Array.from(map.values());
        this.savePurchases(full);
        return full;
      }
      return parsed.filter(p => p && p.id);
    } catch {
      return INITIAL_TAMANNA_PURCHASES;
    }
  },

  async loadPurchasesAsync(): Promise<Purchase[]> {
    const fromIdb = await idbGet<Purchase[]>(STORES.PURCHASES, 'all');
    if (fromIdb && Array.isArray(fromIdb) && fromIdb.length >= INITIAL_TAMANNA_PURCHASES.length) return fromIdb;
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
      if (!data) return INITIAL_TAMANNA_EXPENSES;
      const parsed: Expense[] = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_TAMANNA_EXPENSES;
      return parsed.filter(e => e && e.id);
    } catch {
      return INITIAL_TAMANNA_EXPENSES;
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

  importAllLiveData() {
    this.saveProducts(INITIAL_TAMANNA_PRODUCTS);
    this.saveSuppliers(INITIAL_TAMANNA_SUPPLIERS);
    this.saveCustomers(INITIAL_TAMANNA_CUSTOMERS);
    this.saveSales(INITIAL_TAMANNA_SALES);
    this.savePurchases(INITIAL_TAMANNA_PURCHASES);
    this.saveExpenses(INITIAL_TAMANNA_EXPENSES);
    return {
      products: INITIAL_TAMANNA_PRODUCTS,
      suppliers: INITIAL_TAMANNA_SUPPLIERS,
      customers: INITIAL_TAMANNA_CUSTOMERS,
      sales: INITIAL_TAMANNA_SALES,
      purchases: INITIAL_TAMANNA_PURCHASES,
      expenses: INITIAL_TAMANNA_EXPENSES
    };
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
      let users = data ? JSON.parse(data) : DEFAULT_STAFF_USERS;
      if (!Array.isArray(users) || users.length === 0) users = DEFAULT_STAFF_USERS;

      // Filter out any unwanted mock accounts
      users = users.filter((u: any) => 
        u && 
        u.id !== 'usr-admin-default' && 
        u.id !== 'usr-jubo-default' && 
        u.username !== 'admin'
      );

      // Ensure only the single real owner user from Supabase exists
      let foundOwner = users.find((u: any) => 
        u && (u.username?.toLowerCase() === 'sahidul' || u.name?.toLowerCase().includes('sahidul') || u.email?.toLowerCase().includes('tamanna') || u.uid === '9e4e8c95-81a0-4f73-9638-c6340427918e')
      );
      if (!foundOwner) {
        users = [DEFAULT_STAFF_USERS[0]];
      } else {
        foundOwner.id = '9e4e8c95-81a0-4f73-9638-c6340427918e';
        foundOwner.uid = '9e4e8c95-81a0-4f73-9638-c6340427918e';
        foundOwner.name = 'Md Sahidul islam';
        foundOwner.username = 'sahidul';
        foundOwner.email = 'tamannamotors158@gmail.com';
        foundOwner.phone = '+8801626666906';
        foundOwner.role = 'super_admin';
        foundOwner.status = 'Active';
        foundOwner.emailVerified = true;
        users = [foundOwner];
      }

      return users;
    } catch {
      return DEFAULT_STAFF_USERS;
    }
  },

  async loadStaffUsersAsync(): Promise<AuthUser[]> {
    const fromIdb = await idbGet<AuthUser[]>(STORES.STAFF_USERS, 'all');
    if (fromIdb && Array.isArray(fromIdb) && fromIdb.length > 0) {
      const filtered = fromIdb.filter((u: any) => u && u.id !== 'usr-admin-default' && u.id !== 'usr-jubo-default' && u.username !== 'admin');
      if (filtered.length > 0) return filtered;
    }
    return this.loadStaffUsers();
  },

  saveStaffUsers(users: AuthUser[]) {
    safeSetLocalStorage(STORAGE_KEYS.STAFF_USERS, users);
    idbSet(STORES.STAFF_USERS, 'all', users);
  },

  // Current User
  loadCurrentUser(): AuthUser | null {
    try {
      const data = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('tamanna_current_session_user') : null;
      if (data) {
        const user: AuthUser = JSON.parse(data);
        if (user && user.username && user.id && user.status !== 'Suspended') {
          return user;
        }
      }
      return null;
    } catch {
      return null;
    }
  },

  saveCurrentUser(user: AuthUser | null) {
    if (user) {
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('tamanna_current_session_user', JSON.stringify(user));
        }
      } catch {}
      safeSetLocalStorage(STORAGE_KEYS.CURRENT_USER, user);
    } else {
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem('tamanna_current_session_user');
        }
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
