import { Product, Contact, CustomerGroup, Purchase, PurchaseReturn, Sale, SalesReturn, StockTransfer, Expense, BusinessSettings, InvoiceSettings, UserRole, AuthUser } from '../types';

export const DEFAULT_STAFF_USERS: AuthUser[] = [];

export const TAMANNA_BUSINESS_SETTINGS: BusinessSettings = {
  businessName: "TAMANNA MOTORS",
  taxNumber: "BIN-002849102-0101",
  defaultCurrency: "BDT (৳)",
  currencySymbol: "৳",
  financialYearStart: "July",
  defaultTaxRate: 5.0,
  primaryLocation: "Dhaka Central Showroom",
  contactEmail: "info@tamannamotors.com",
  contactPhone: "+880 1711-234567",
  address: "House 42, Road 11, Block D, Mirpur-10, Dhaka-1216, Bangladesh",
  logoUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=150&h=150&q=80"
};

export const TAMANNA_INVOICE_SETTINGS: InvoiceSettings = {
  invoicePrefix: "TM-2026-",
  termsAndConditions: "১. বিক্রিত মাল ১৪ দিনের মধ্যে অক্ষত অবস্থায় ক্যাশ মেমোসহ পরিবর্তনযোগ্য। ২. ইলেকট্রিক্যাল ও ব্যাটারি আইটেমে প্রস্তুতকারকের ওয়ারেন্টি প্রযোজ্য।",
  showLogo: true,
  paperSize: "80mm",
  footerNotes: "তামান্না মোটরসে কেনাকাটার জন্য আন্তরিক ধন্যবাদ! ১০০% জেনুইন পার্টসের বিশ্বস্ত প্রতিষ্ঠান।",
  logoUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=150&h=150&q=80"
};

export const INITIAL_TAMANNA_PRODUCTS: Product[] = [
  {
    id: "tm-prod-1",
    name: "Motul 7100 4T 10W-40 100% Synthetic 1L",
    sku: "MOT-4T-10W40",
    category: "Engine Oil & Lubricants",
    businessLocation: "Dhaka Central Showroom",
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
    businessLocation: "Dhaka Central Showroom",
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
    businessLocation: "Mirpur Branch",
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
    businessLocation: "Dhaka Central Showroom",
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
    businessLocation: "Chittagong Hub",
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
    businessLocation: "Dhaka Central Showroom",
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
    businessLocation: "Mirpur Branch",
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
    businessLocation: "Chittagong Hub",
    unitPurchasePrice: 1400,
    sellingPrice: 1950,
    currentStock: 16,
    alertQuantity: 4,
    imageUrl: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=120&h=120&q=80",
    createdAt: "2026-09-22"
  }
];

export const INITIAL_TAMANNA_SUPPLIERS: Contact[] = [
  {
    id: "tm-sup-1",
    type: "supplier",
    name: "Abdul Karim",
    businessName: "Motul Bangladesh Distributor Ltd",
    email: "supply@motulbd.com",
    phone: "+880 1819-882211",
    businessLocation: "Dhaka Central Showroom",
    taxNumber: "TAX-BD-8839210",
    creditLimit: 300000,
    balance: 45000.00,
    address: "Tejgaon Industrial Area, Dhaka"
  },
  {
    id: "tm-sup-2",
    type: "supplier",
    name: "Rafiqul Islam",
    businessName: "Meghna Auto Components Ltd",
    email: "orders@meghnaauto.com",
    phone: "+880 1712-993344",
    businessLocation: "Mirpur Branch",
    taxNumber: "TAX-BD-7729103",
    creditLimit: 200000,
    balance: 28500.00,
    address: "Banglamotor, Dhaka"
  },
  {
    id: "tm-sup-3",
    type: "supplier",
    name: "Tanvir Ahmed",
    businessName: "Apex Tyres & Rubber Imports",
    email: "info@apextyresbd.com",
    phone: "+880 1911-554422",
    businessLocation: "Chittagong Hub",
    taxNumber: "TAX-BD-9910283",
    creditLimit: 500000,
    balance: 62000.00,
    address: "Agrabad Commercial Area, Chittagong"
  }
];

export const INITIAL_TAMANNA_CUSTOMERS: Contact[] = [
  {
    id: "cust-walkin",
    type: "customer",
    name: "Walk-in Customer (খুচরা ক্রেতা)",
    email: "retail@tamannamotors.com",
    phone: "01700000000",
    customerGroup: "Retail",
    businessLocation: "Dhaka Central Showroom",
    balance: 0.00,
    totalPurchases: 185000.00
  },
  {
    id: "tm-cust-1",
    type: "customer",
    name: "Md. Hasan Mahmud",
    businessName: "Speed Rider Workshop",
    email: "hasan@speedrider.com",
    phone: "+880 1722-334455",
    customerGroup: "Wholesale Partner",
    businessLocation: "Dhaka Central Showroom",
    creditLimit: 80000,
    balance: 14500.00,
    totalPurchases: 245000.00,
    address: "Mirpur-1, Dhaka"
  },
  {
    id: "tm-cust-2",
    type: "customer",
    name: "Shakil Chowdhury",
    businessName: "Chowdhury Bike Service Center",
    email: "shakil.bike@gmail.com",
    phone: "+880 1817-665544",
    customerGroup: "VIP Tier",
    businessLocation: "Chittagong Hub",
    creditLimit: 120000,
    balance: 22000.00,
    totalPurchases: 380000.00,
    address: "GEC Circle, Chittagong"
  }
];

export const INITIAL_TAMANNA_SALES: Sale[] = [
  {
    id: "tm-sale-1",
    invoiceNo: "TM-2026-9041",
    type: "pos",
    customerName: "Walk-in Customer (খুচরা ক্রেতা)",
    businessLocation: "Dhaka Central Showroom",
    paymentStatus: "Paid",
    paymentMethod: "Cash",
    totalAmount: 2500.00,
    invoiceDue: 0.00,
    saleDate: "2026-10-04 10:20:15",
    itemsCount: 2
  },
  {
    id: "tm-sale-2",
    invoiceNo: "TM-2026-9042",
    type: "pos",
    customerName: "Md. Hasan Mahmud",
    businessLocation: "Dhaka Central Showroom",
    paymentStatus: "Paid",
    paymentMethod: "Bank Transfer",
    totalAmount: 8900.00,
    invoiceDue: 0.00,
    saleDate: "2026-10-04 09:45:00",
    itemsCount: 5
  },
  {
    id: "tm-sale-3",
    invoiceNo: "TM-2026-9039",
    type: "sale",
    customerName: "Shakil Chowdhury",
    businessLocation: "Chittagong Hub",
    paymentStatus: "Partial",
    paymentMethod: "Credit",
    totalAmount: 34500.00,
    invoiceDue: 12000.00,
    saleDate: "2026-10-03 16:10:00",
    itemsCount: 18
  }
];

export const INITIAL_TAMANNA_PURCHASES: Purchase[] = [
  {
    id: "pur-tm-1",
    purchaseNo: "PO-2026-881",
    supplierName: "Bangladesh Honda Motors Parts Ltd",
    businessLocation: "Dhaka Central Showroom",
    purchaseStatus: "Received",
    paymentStatus: "Paid",
    purchaseDate: "2026-09-28",
    grandTotal: 42500.00,
    paymentDue: 0.00,
    itemsCount: 50
  },
  {
    id: "pur-tm-2",
    purchaseNo: "PO-2026-882",
    supplierName: "Uttara Motors Ltd (Bajaj Genuine)",
    businessLocation: "Mirpur Branch",
    purchaseStatus: "Received",
    paymentStatus: "Partial",
    purchaseDate: "2026-09-30",
    grandTotal: 18500.00,
    paymentDue: 8500.00,
    itemsCount: 120
  },
  {
    id: "pur-tm-3",
    purchaseNo: "PO-2026-883",
    supplierName: "Yamaha Parts Depot (ACI Motors)",
    businessLocation: "Chittagong Hub",
    purchaseStatus: "Pending",
    paymentStatus: "Due",
    purchaseDate: "2026-10-02",
    grandTotal: 38000.00,
    paymentDue: 38000.00,
    itemsCount: 65
  }
];

export const INITIAL_TAMANNA_EXPENSES: Expense[] = [
  {
    id: "exp-tm-1",
    expenseNo: "EXP-2026-401",
    category: "Rent",
    businessLocation: "Dhaka Central Showroom",
    expenseDate: "2026-10-01",
    amount: 35000.00,
    referenceNo: "RENT-OCT-01",
    note: "Mirpur-10 Main Showroom and Workshop space monthly lease"
  },
  {
    id: "exp-tm-2",
    expenseNo: "EXP-2026-402",
    category: "Utilities",
    businessLocation: "Dhaka Central Showroom",
    expenseDate: "2026-10-02",
    amount: 5400.00,
    referenceNo: "DESCO-2918",
    note: "Commercial electricity and workshop high-voltage supply"
  },
  {
    id: "exp-tm-3",
    expenseNo: "EXP-2026-403",
    category: "Salaries",
    businessLocation: "Mirpur Branch",
    expenseDate: "2026-09-30",
    amount: 45000.00,
    referenceNo: "PAYROLL-WK39",
    note: "Master mechanics and service technicians weekly advance wages"
  }
];

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
  CURRENT_USER: 'tamanna_current_user'
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
      return data ? JSON.parse(data) : INITIAL_TAMANNA_SUPPLIERS;
    } catch {
      return INITIAL_TAMANNA_SUPPLIERS;
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
      return data ? JSON.parse(data) : INITIAL_TAMANNA_CUSTOMERS;
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
      return data ? JSON.parse(data) : INITIAL_TAMANNA_SALES;
    } catch {
      return INITIAL_TAMANNA_SALES;
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
      return data ? JSON.parse(data) : TAMANNA_BUSINESS_SETTINGS;
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
      return data ? JSON.parse(data) : TAMANNA_INVOICE_SETTINGS;
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
      return data ? JSON.parse(data) : INITIAL_TAMANNA_PURCHASES;
    } catch {
      return INITIAL_TAMANNA_PURCHASES;
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
      return data ? JSON.parse(data) : INITIAL_TAMANNA_EXPENSES;
    } catch {
      return INITIAL_TAMANNA_EXPENSES;
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
  }
};
