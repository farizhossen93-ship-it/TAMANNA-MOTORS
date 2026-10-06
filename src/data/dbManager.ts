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

export const INITIAL_TAMANNA_PRODUCTS: Product[] = [];

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

export const DatabaseStorage = {
  loadProducts(): Product[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (!data) return [];
      const parsed: Product[] = JSON.parse(data);
      return Array.isArray(parsed) ? parsed.filter(p => p && p.id && !p.id.startsWith('tm-prod-') && !p.id.startsWith('prod-')) : [];
    } catch {
      return [];
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
