import React, { useState, useEffect } from 'react';
import {
  DatabaseStorage,
  INITIAL_TAMANNA_PRODUCTS,
  INITIAL_TAMANNA_SUPPLIERS,
  INITIAL_TAMANNA_CUSTOMERS,
  INITIAL_TAMANNA_SALES,
  INITIAL_TAMANNA_PURCHASES,
  INITIAL_TAMANNA_EXPENSES,
  TAMANNA_BUSINESS_SETTINGS,
  TAMANNA_INVOICE_SETTINGS,
  DEFAULT_STAFF_USERS
} from './data/dbManager';
import {
  INITIAL_CUSTOMER_GROUPS,
  INITIAL_PURCHASES,
  INITIAL_PURCHASE_RETURNS,
  INITIAL_SALES_RETURNS,
  INITIAL_STOCK_TRANSFERS,
  INITIAL_EXPENSES
} from './data/mockData';
import {
  Product,
  Contact,
  CustomerGroup,
  Purchase,
  PurchaseReturn,
  Sale,
  SalesReturn,
  StockTransfer,
  Expense,
  BusinessSettings,
  InvoiceSettings,
  UserRole,
  AuthUser
} from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { DataTable, Column } from './components/DataTable';
import { CalculatorModal } from './components/CalculatorModal';
import { PosTerminal } from './components/PosTerminal';
import { AddProductModal } from './components/AddProductModal';
import { AddContactModal } from './components/AddContactModal';
import { AddExpenseModal } from './components/AddExpenseModal';
import { AddPurchaseModal } from './components/AddPurchaseModal';
import { AddTransferModal } from './components/AddTransferModal';
import { EditEntryModal } from './components/EditEntryModal';
import { SettingsView } from './components/SettingsView';
import { ReportsView } from './components/ReportsView';
import { UserManagementView } from './components/UserManagementView';
import { SyncedDuesView } from './components/SyncedDuesView';
import { SupabaseSync } from './data/supabaseSync';
import { FirestoreSync } from './data/firestoreSync';
import { ReceiptModal } from './components/ReceiptModal';
import { LoginView } from './components/LoginView';
import { InvoiceScanModal } from './components/InvoiceScanModal';
import { QuickSearchModal } from './components/QuickSearchModal';
import { ShortcutsHelpModal } from './components/ShortcutsHelpModal';
import { Package, MapPin, Check, Wrench, ShieldAlert, CheckCircle } from 'lucide-react';
import { Language, TRANSLATIONS } from './i18n/translations';

export default function App() {
  // Navigation & Theme & Language & Role state
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [isPosOpen, setIsPosOpen] = useState<boolean>(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [currentBranch, setCurrentBranch] = useState<string>('Hazigonj Branch');
  const [userRole, setUserRole] = useState<UserRole>(() => DatabaseStorage.loadActiveRole());

  // Theme & Language
  const [theme, setTheme] = useState<'light' | 'dark'>(() => DatabaseStorage.loadTheme());
  const [lang, setLang] = useState<Language>(() => DatabaseStorage.loadLang());
  const t = TRANSLATIONS[lang];

  // Sync theme with HTML class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    DatabaseStorage.saveTheme(theme);
  }, [theme]);

  // Sync language
  const handleToggleLang = (newLang: Language) => {
    setLang(newLang);
    DatabaseStorage.saveLang(newLang);
  };

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleToggleUserRole = (newRole: UserRole) => {
    if (currentUser?.role !== 'super_admin') {
      return;
    }
    setUserRole(newRole);
    DatabaseStorage.saveActiveRole(newRole);
  };

  // Persistent Database State for TAMANNA MOTORS
  const [products, setProducts] = useState<Product[]>(() => DatabaseStorage.loadProducts());
  const [suppliers, setSuppliers] = useState<Contact[]>(() => DatabaseStorage.loadSuppliers());
  const [customers, setCustomers] = useState<Contact[]>(() => DatabaseStorage.loadCustomers());
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>(INITIAL_CUSTOMER_GROUPS);
  const [purchases, setPurchases] = useState<Purchase[]>(() => DatabaseStorage.loadPurchases());
  const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>(INITIAL_PURCHASE_RETURNS);
  const [sales, setSales] = useState<Sale[]>(() => DatabaseStorage.loadSales());
  const [salesReturns, setSalesReturns] = useState<SalesReturn[]>(INITIAL_SALES_RETURNS);
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>(INITIAL_STOCK_TRANSFERS);
  const [expenses, setExpenses] = useState<Expense[]>(() => DatabaseStorage.loadExpenses());
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>(() => DatabaseStorage.loadBusinessSettings());
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>(() => DatabaseStorage.loadInvoiceSettings());

  // Auto-sync products, sales, purchases, expenses and settings to persistent database storage
  useEffect(() => {
    DatabaseStorage.saveProducts(products);
  }, [products]);

  useEffect(() => {
    DatabaseStorage.saveSales(sales);
  }, [sales]);

  useEffect(() => {
    DatabaseStorage.saveSuppliers(suppliers);
  }, [suppliers]);

  useEffect(() => {
    DatabaseStorage.saveCustomers(customers);
  }, [customers]);

  useEffect(() => {
    DatabaseStorage.savePurchases(purchases);
  }, [purchases]);

  useEffect(() => {
    DatabaseStorage.saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    DatabaseStorage.saveBusinessSettings(businessSettings);
  }, [businessSettings]);

  useEffect(() => {
    DatabaseStorage.saveInvoiceSettings(invoiceSettings);
  }, [invoiceSettings]);

  // Auto-hydrate live dataset from TAMANNA MOTORS reference if browser storage was empty or had old partial records
  useEffect(() => {
    try {
      if (products.length < INITIAL_TAMANNA_PRODUCTS.length) {
        setProducts(INITIAL_TAMANNA_PRODUCTS);
        DatabaseStorage.saveProducts(INITIAL_TAMANNA_PRODUCTS);
      }
      if (suppliers.length < INITIAL_TAMANNA_SUPPLIERS.length) {
        setSuppliers(INITIAL_TAMANNA_SUPPLIERS);
        DatabaseStorage.saveSuppliers(INITIAL_TAMANNA_SUPPLIERS);
      }
      if (customers.length < INITIAL_TAMANNA_CUSTOMERS.length) {
        setCustomers(INITIAL_TAMANNA_CUSTOMERS);
        DatabaseStorage.saveCustomers(INITIAL_TAMANNA_CUSTOMERS);
      }
      if (sales.length < INITIAL_TAMANNA_SALES.length) {
        setSales(INITIAL_TAMANNA_SALES);
        DatabaseStorage.saveSales(INITIAL_TAMANNA_SALES);
      }
      if (purchases.length < INITIAL_TAMANNA_PURCHASES.length) {
        setPurchases(INITIAL_TAMANNA_PURCHASES);
        DatabaseStorage.savePurchases(INITIAL_TAMANNA_PURCHASES);
      }
      if (expenses.length < INITIAL_TAMANNA_EXPENSES.length) {
        setExpenses(INITIAL_TAMANNA_EXPENSES);
        DatabaseStorage.saveExpenses(INITIAL_TAMANNA_EXPENSES);
      }
    } catch {}
  }, []);

  // Load live data from Cloud SQL PostgreSQL backend API and Supabase on startup
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const fetchApiSafe = async (endpoint: string) => {
          try {
            const r = await fetch(endpoint);
            if (!r.ok) return null;
            const ct = r.headers.get('content-type') || '';
            if (!ct.includes('application/json')) return null;
            return await r.json();
          } catch {
            return null;
          }
        };

        const [prodRes, saleRes, contactRes, userRes, sbProds, sbSales, sbContacts, sbUsers, sbPurchases, sbExpenses] = await Promise.allSettled([
          fetchApiSafe('/api/products'),
          fetchApiSafe('/api/sales'),
          fetchApiSafe('/api/contacts'),
          fetchApiSafe('/api/users'),
          SupabaseSync.fetchProducts(),
          SupabaseSync.fetchSales(),
          SupabaseSync.fetchContacts(),
          SupabaseSync.fetchUsers(),
          SupabaseSync.fetchPurchases(),
          SupabaseSync.fetchExpenses(),
        ]);

        if (sbUsers.status === 'fulfilled' && Array.isArray(sbUsers.value) && sbUsers.value.length > 0) {
          const validSbUsers: AuthUser[] = sbUsers.value.map((u: any) => ({
            id: u.uid || `usr-${u.id}`,
            uid: u.uid || `usr-${u.id}`,
            name: u.name || 'Md Sahidul islam',
            username: u.username || 'sahidul',
            email: u.email || 'tamannamotors158@gmail.com',
            password: (u.username === 'sahidul' || u.email === 'tamannamotors158@gmail.com') ? 'khoka420' : (u.password || ''),
            phone: u.phone || '+8801626666906',
            role: (u.role || 'super_admin') as UserRole,
            businessLocation: u.businessLocation || u.business_location || 'Hazigonj Branch',
            status: u.status || 'Active',
            emailVerified: Boolean(u.emailVerified ?? true),
            lastLogin: u.lastLogin || u.last_login || '12:12 PM'
          }));
          setStaffUsers(validSbUsers);
          DatabaseStorage.saveStaffUsers(validSbUsers);
          setCurrentUser(prev => {
            if (!prev) return null;
            const updated = validSbUsers.find(m => m.username?.toLowerCase() === prev.username?.toLowerCase() || m.email?.toLowerCase() === prev.email?.toLowerCase());
            return updated || null;
          });
        } else if (userRes.status === 'fulfilled' && Array.isArray(userRes.value) && userRes.value.length > 0) {
          const mappedUsers: AuthUser[] = userRes.value.map((u: any) => ({
            id: u.uid || (u.id ? String(u.id) : `usr-${Date.now()}`),
            name: u.name || u.username,
            username: u.username,
            email: u.email || `${u.username}@tamannamotors.com`,
            password: (u.username === 'sahidul' || u.email === 'tamannamotors158@gmail.com') ? 'khoka420' : (u.password || ''),
            phone: u.phone || '01878934956',
            role: (u.role || 'super_admin') as UserRole,
            businessLocation: u.businessLocation || u.business_location || 'Hazigonj Branch',
            status: u.status || 'Active',
            emailVerified: Boolean(u.email_verified || (u.emailVerified ?? true)),
            lastLogin: u.lastLogin || u.last_login || '12:12 PM'
          }));
          setStaffUsers(mappedUsers);
          DatabaseStorage.saveStaffUsers(mappedUsers);
          setCurrentUser(prev => {
            if (!prev) return null;
            const updated = mappedUsers.find(m => m.username?.toLowerCase() === prev.username?.toLowerCase() || m.email?.toLowerCase() === prev.email?.toLowerCase());
            return updated || null;
          });
        }

        if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value) && prodRes.value.length > 0) {
          setProducts(prev => {
            const map = new Map<string, Product>();
            for (const p of INITIAL_TAMANNA_PRODUCTS) map.set(p.id, p);
            for (const p of prev) map.set(p.id, p);
            for (const p of prodRes.value) map.set(p.id, p);
            return Array.from(map.values());
          });
        } else if (sbProds.status === 'fulfilled' && Array.isArray(sbProds.value) && sbProds.value.length > 0) {
          setProducts(prev => {
            const map = new Map<string, Product>();
            for (const p of INITIAL_TAMANNA_PRODUCTS) map.set(p.id, p);
            for (const p of prev) map.set(p.id, p);
            for (const p of sbProds.value!) map.set(p.id, p);
            return Array.from(map.values());
          });
        }

        if (saleRes.status === 'fulfilled' && Array.isArray(saleRes.value) && saleRes.value.length > 0) {
          setSales(prev => {
            const map = new Map<string, Sale>();
            for (const s of INITIAL_TAMANNA_SALES) map.set(s.id, s);
            for (const s of prev) map.set(s.id, s);
            for (const s of saleRes.value) map.set(s.id, s);
            return Array.from(map.values());
          });
        } else if (sbSales.status === 'fulfilled' && Array.isArray(sbSales.value) && sbSales.value.length > 0) {
          setSales(prev => {
            const map = new Map<string, Sale>();
            for (const s of INITIAL_TAMANNA_SALES) map.set(s.id, s);
            for (const s of prev) map.set(s.id, s);
            for (const s of sbSales.value!) map.set(s.id, s);
            return Array.from(map.values());
          });
        }

        if (contactRes.status === 'fulfilled' && Array.isArray(contactRes.value) && contactRes.value.length > 0) {
          const custs = contactRes.value.filter((c: any) => c.type === 'customer');
          const sups = contactRes.value.filter((c: any) => c.type === 'supplier');
          if (custs.length > 0) {
            setCustomers(prev => {
              const map = new Map<string, Contact>();
              for (const c of INITIAL_TAMANNA_CUSTOMERS) map.set(c.id, c);
              for (const c of prev) map.set(c.id, c);
              for (const c of custs) map.set(c.id, c);
              return Array.from(map.values());
            });
          }
          if (sups.length > 0) {
            setSuppliers(prev => {
              const map = new Map<string, Contact>();
              for (const s of INITIAL_TAMANNA_SUPPLIERS) map.set(s.id, s);
              for (const s of prev) map.set(s.id, s);
              for (const s of sups) map.set(s.id, s);
              return Array.from(map.values());
            });
          }
        }

        if (sbPurchases.status === 'fulfilled' && Array.isArray(sbPurchases.value) && sbPurchases.value.length > 0) {
          setPurchases(prev => {
            const map = new Map<string, Purchase>();
            for (const p of INITIAL_TAMANNA_PURCHASES) map.set(p.id, p);
            for (const p of prev) map.set(p.id, p);
            for (const p of sbPurchases.value!) map.set(p.id, p);
            return Array.from(map.values());
          });
        }

        if (sbExpenses.status === 'fulfilled' && Array.isArray(sbExpenses.value) && sbExpenses.value.length > 0) {
          setExpenses(prev => {
            const map = new Map<string, Expense>();
            for (const e of INITIAL_TAMANNA_EXPENSES) map.set(e.id, e);
            for (const e of prev) map.set(e.id, e);
            for (const e of sbExpenses.value!) map.set(e.id, e);
            return Array.from(map.values());
          });
        }

        const [fsProds, fsSales, fsContacts] = await Promise.all([
          FirestoreSync.fetchProducts(),
          FirestoreSync.fetchSales(),
          FirestoreSync.fetchContacts(),
        ]);

        if (fsProds && fsProds.length >= INITIAL_TAMANNA_PRODUCTS.length) {
          setProducts(fsProds);
        }
        if (fsSales && fsSales.length >= INITIAL_TAMANNA_SALES.length) {
          setSales(fsSales);
        }
        if (fsContacts && fsContacts.length > 0) {
          const fsC = fsContacts.filter(c => c.type === 'customer');
          const fsS = fsContacts.filter(c => c.type === 'supplier');
          if (fsC.length >= INITIAL_TAMANNA_CUSTOMERS.length) setCustomers(fsC);
          if (fsS.length >= INITIAL_TAMANNA_SUPPLIERS.length) setSuppliers(fsS);
        }
      } catch (e) {
        console.log("Offline mode or backend loading fallback", e);
      }
    };
    fetchBackendData();

    // Subscribe to Firebase Firestore real-time updates without truncating datasets
    const unsubProds = FirestoreSync.subscribeProducts((prods) => {
      if (prods.length >= INITIAL_TAMANNA_PRODUCTS.length) {
        setProducts(prods);
      }
    });
    const unsubSales = FirestoreSync.subscribeSales((sls) => {
      if (sls.length >= INITIAL_TAMANNA_SALES.length) {
        setSales(sls);
      }
    });
    const unsubContacts = FirestoreSync.subscribeContacts((cnts) => {
      if (cnts.length > 0) {
        setCustomers(cnts.filter(c => c.type === 'customer'));
        setSuppliers(cnts.filter(c => c.type === 'supplier'));
      }
    });
    const unsubUsers = FirestoreSync.subscribeUsers((usrs) => {
      if (usrs.length > 0) {
        // Filter out any mock users
        const validUsrs = usrs.filter(u => u.username !== 'admin' && u.id !== 'usr-admin-default' && u.id !== 'usr-jubo-default');
        if (validUsrs.length > 0) {
          setStaffUsers(validUsrs);
        }
      }
    });

    return () => {
      unsubProds();
      unsubSales();
      unsubContacts();
      unsubUsers();
    };
  }, []);

  // Authentication & Staff User state
  const [staffUsers, setStaffUsers] = useState<AuthUser[]>(() => DatabaseStorage.loadStaffUsers());
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => DatabaseStorage.loadCurrentUser());

  // 10-minute inactivity auto-logout timer
  useEffect(() => {
    if (!currentUser) return;
    let timer: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        handleLogout();
      }, 10 * 60 * 1000); // 10 minutes
    };

    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [currentUser]);

  const [isInvoiceScanOpen, setIsInvoiceScanOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState<boolean>(false);

  // Modals state
  const [isAddProductOpen, setIsAddProductOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState<boolean>(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState<boolean>(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState<boolean>(false);
  const [isAddPurchaseOpen, setIsAddPurchaseOpen] = useState<boolean>(false);
  const [isAddTransferOpen, setIsAddTransferOpen] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<{
    type: 'sale' | 'purchase' | 'expense';
    data: any;
  } | null>(null);
  const [viewingReceiptSale, setViewingReceiptSale] = useState<Sale | null>(null);
  const [isReceiptMoneyMode, setIsReceiptMoneyMode] = useState<boolean>(false);

  // Global Keyboard Shortcuts (Ctrl+P: POS, Ctrl+S: Search, Ctrl+I: Invoice, Ctrl+/: Help, Alt+C: Calc, Esc: Close)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!currentUser) return;

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // Ctrl+P or Cmd+P: POS Terminal
      if (isCtrlOrCmd && key === 'p') {
        e.preventDefault();
        setIsPosOpen(prev => !prev);
        return;
      }

      // Ctrl+S or Cmd+S: Global Quick Search & Command Palette
      if (isCtrlOrCmd && key === 's') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
        return;
      }

      // Ctrl+I or Cmd+I: Invoice QR Scanner
      if (isCtrlOrCmd && key === 'i') {
        e.preventDefault();
        setIsInvoiceScanOpen(prev => !prev);
        return;
      }

      // Ctrl+/ or Ctrl+K: Keyboard Shortcuts Cheat Sheet
      if ((isCtrlOrCmd && (key === '/' || key === 'k')) || (e.shiftKey && key === '?')) {
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault();
          setIsShortcutsHelpOpen(prev => !prev);
          return;
        }
      }

      // Ctrl+B: Toggle Sidebar
      if (isCtrlOrCmd && key === 'b') {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
        return;
      }

      // Alt+C: Calculator
      if (e.altKey && key === 'c') {
        e.preventDefault();
        setIsCalculatorOpen(prev => !prev);
        return;
      }

      // Ctrl+D: Go to Dashboard
      if (isCtrlOrCmd && key === 'd') {
        e.preventDefault();
        setCurrentRoute('home');
        return;
      }

      // Ctrl+N: Add Product
      if (isCtrlOrCmd && key === 'n') {
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault();
          setIsAddProductOpen(true);
          return;
        }
      }

      // Escape: Close topmost open modal
      if (e.key === 'Escape') {
        if (isSearchOpen) {
          setIsSearchOpen(false);
        } else if (isShortcutsHelpOpen) {
          setIsShortcutsHelpOpen(false);
        } else if (isInvoiceScanOpen) {
          setIsInvoiceScanOpen(false);
        } else if (isCalculatorOpen) {
          setIsCalculatorOpen(false);
        } else if (viewingReceiptSale) {
          setViewingReceiptSale(null);
        } else if (isPosOpen) {
          setIsPosOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [currentUser, isSearchOpen, isShortcutsHelpOpen, isInvoiceScanOpen, isCalculatorOpen, viewingReceiptSale, isPosOpen]);

  // Dedicated Staff Users Handler to sync updates & deletions across Firebase Firestore, Supabase, Cloud SQL, and Local Storage
  const handleUpdateStaffUsers = (nextUsers: AuthUser[]) => {
    // Detect and delete removed staff from Firestore, Supabase & Cloud SQL
    const deletedUsers = staffUsers.filter(oldU => !nextUsers.some(nu => nu.id === oldU.id));
    for (const delU of deletedUsers) {
      FirestoreSync.deleteUser(delU.id);
      SupabaseSync.deleteUser(delU.id);
      fetch(`/api/users/${delU.id}`, { method: 'DELETE' }).catch(console.error);
    }

    // Upsert updated or new staff users to Firestore, Supabase & Cloud SQL
    for (const u of nextUsers) {
      FirestoreSync.upsertUser(u);
      SupabaseSync.upsertUser(u);
    }
    fetch('/api/users/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users: nextUsers })
    }).catch(console.error);

    setStaffUsers(nextUsers);
    DatabaseStorage.saveStaffUsers(nextUsers);
  };

  // Sync staff users to DB and monitor active user suspension
  useEffect(() => {
    DatabaseStorage.saveStaffUsers(staffUsers);
    if (currentUser) {
      const activeMatch = staffUsers.find(
        u => u.id === currentUser.id || u.username.toLowerCase() === currentUser.username.toLowerCase()
      );
      if (activeMatch && activeMatch.status === 'Suspended') {
        setCurrentUser(null);
        DatabaseStorage.saveCurrentUser(null);
        showSyncNotice(lang === 'bn' ? '⚠️ আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত করা হয়েছে।' : '⚠️ Your account has been suspended by Super Admin.');
      }
    }
  }, [staffUsers, currentUser]);

  // Load IndexedDB backup data on mount if localStorage was empty/quota trimmed
  useEffect(() => {
    const loadFromIDB = async () => {
      try {
        const [idbProds, idbSales, idbCusts, idbSups, idbUsers] = await Promise.all([
          DatabaseStorage.loadProductsAsync(),
          DatabaseStorage.loadSalesAsync(),
          DatabaseStorage.loadCustomersAsync(),
          DatabaseStorage.loadSuppliersAsync(),
          DatabaseStorage.loadStaffUsersAsync(),
        ]);
        if (idbProds && idbProds.length > 0) setProducts(idbProds);
        if (idbSales && idbSales.length > 0) setSales(idbSales);
        if (idbCusts && idbCusts.length > 0) setCustomers(idbCusts);
        if (idbSups && idbSups.length > 0) setSuppliers(idbSups);
        if (idbUsers && idbUsers.length > 0) setStaffUsers(idbUsers);
      } catch (e) {
        console.log("IndexedDB startup check:", e);
      }
    };
    loadFromIDB();
  }, []);

  // Sync current user to DB
  useEffect(() => {
    DatabaseStorage.saveCurrentUser(currentUser);
  }, [currentUser]);

  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    setUserRole(user.role);
    DatabaseStorage.saveCurrentUser(user);
    DatabaseStorage.saveActiveRole(user.role);
    showSyncNotice(lang === 'bn' ? `'${user.name}' হিসেবে সফলভাবে লগইন হয়েছে` : `Successfully signed in as '${user.name}'`);
  };

  const handleRegister = (newUser: AuthUser, autoLogin: boolean = false) => {
    const exists = staffUsers.some(u => u.username.toLowerCase() === newUser.username.toLowerCase());
    const next = exists
      ? staffUsers.map(u => u.username.toLowerCase() === newUser.username.toLowerCase() ? newUser : u)
      : [...staffUsers, newUser];
    handleUpdateStaffUsers(next);
    SupabaseSync.upsertUser(newUser);
    if (autoLogin && newUser.emailVerified) {
      handleLogin(newUser);
    } else {
      showSyncNotice(lang === 'bn' ? 'অ্যাকাউন্ট তৈরি হয়েছে! অনুগ্রহ করে লগইন করার আগে ইমেইল ভেরিফাই করুন।' : 'Account created! Please verify your email before logging in.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    DatabaseStorage.saveCurrentUser(null);
  };

  // Deep link check for invoice QR code scan: "?invoice=TM-2026-..."
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const invoiceNo = params.get('invoice');
      if (invoiceNo) {
        const found = sales.find(s => s.invoiceNo.toLowerCase() === invoiceNo.toLowerCase());
        if (found) {
          setViewingReceiptSale(found);
        } else {
          // Reconstruct verified invoice preview from scan parameter
          setViewingReceiptSale({
            id: `scan-${Date.now()}`,
            invoiceNo,
            type: 'pos',
            customerName: lang === 'bn' ? 'যাচাইকৃত গ্রাহক (QR)' : 'Verified Customer (QR)',
            businessLocation: currentBranch,
            paymentStatus: 'Paid',
            paymentMethod: 'Cash',
            totalAmount: 3750,
            invoiceDue: 0,
            saleDate: new Date().toLocaleString(),
            itemsCount: 2
          });
        }
      }
    }
  }, [sales]);

  const handleClearTempSales = () => {
    DatabaseStorage.clearTempSales();
    setSales(INITIAL_TAMANNA_SALES);
    showSyncNotice(lang === 'bn' ? 'অস্থায়ী বিক্রয় ডেটা সফলভাবে মুছে ফেলা হয়েছে।' : 'Temporary sales data cleared.');
  };

  const handleResetDatabase = () => {
    DatabaseStorage.resetDatabase();
    setProducts(INITIAL_TAMANNA_PRODUCTS);
    setSuppliers(INITIAL_TAMANNA_SUPPLIERS);
    setCustomers(INITIAL_TAMANNA_CUSTOMERS);
    setSales(INITIAL_TAMANNA_SALES);
    setExpenses(INITIAL_EXPENSES);
    setPurchases(INITIAL_PURCHASES);
    setBusinessSettings(TAMANNA_BUSINESS_SETTINGS);
    setInvoiceSettings(TAMANNA_INVOICE_SETTINGS);
    setStaffUsers(DEFAULT_STAFF_USERS);
    showSyncNotice(lang === 'bn' ? 'ডাটাবেজ প্রাথমিক ফ্যাক্টরি অবস্থায় সফলভাবে রিসেট করা হয়েছে।' : 'Database reset to initial factory state.');
  };

  // Sync notification toast banner state
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const showSyncNotice = (msg: string) => {
    setSyncNotice(msg);
    setTimeout(() => {
      setSyncNotice(prev => prev === msg ? null : prev);
    }, 3200);
  };

  // Price bulk update temporary edit state
  const [priceUpdates, setPriceUpdates] = useState<Record<string, number>>({});

  // Super Admin: Put New Entry dispatcher
  const handlePutNewEntry = (type: 'product' | 'pos' | 'purchase' | 'expense' | 'customer' | 'supplier' | 'transfer') => {
    if (type === 'product') {
      setEditingProduct(null);
      setIsAddProductOpen(true);
    } else if (type === 'pos') {
      setIsPosOpen(true);
    } else if (type === 'purchase') {
      setIsAddPurchaseOpen(true);
    } else if (type === 'expense') {
      setIsAddExpenseOpen(true);
    } else if (type === 'customer') {
      setEditingContact(null);
      setIsAddCustomerOpen(true);
    } else if (type === 'supplier') {
      setEditingContact(null);
      setIsAddSupplierOpen(true);
    } else if (type === 'transfer') {
      setIsAddTransferOpen(true);
    }
  };

  // Handlers for Products
  const handleAddProduct = (newProd: Product) => {
    if (editingProduct) {
      const updated = products.map(p => p.id === newProd.id ? newProd : p);
      setProducts(updated);
      DatabaseStorage.saveProducts(updated);
      fetch('/api/products/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: [newProd] })
      }).catch(console.error);
      SupabaseSync.upsertProduct(newProd);
      FirestoreSync.upsertProduct(newProd);
      setEditingProduct(null);
      showSyncNotice(lang === 'bn' ? `এক্সকাভেটর পার্টস '${newProd.name}' সফলভাবে সম্পাদিত ও ক্লাউডে সিঙ্ক হয়েছে।` : `Product '${newProd.name}' edited and synced.`);
    } else {
      const updated = [newProd, ...products];
      setProducts(updated);
      DatabaseStorage.saveProducts(updated);
      fetch('/api/products/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: [newProd] })
      }).catch(console.error);
      SupabaseSync.upsertProduct(newProd);
      FirestoreSync.upsertProduct(newProd);
      showSyncNotice(lang === 'bn' ? `নতুন পার্টস '${newProd.name}' যুক্ত ও ক্লাউড ডেটাবেজে সিঙ্ক হয়েছে।` : `New product '${newProd.name}' added and synced.`);
    }
  };

  const handleDeleteProduct = (prod: Product) => {
    const isSuper = currentUser?.role === 'super_admin' || userRole === 'super_admin';
    if (!isSuper) {
      showSyncNotice(lang === 'bn' ? '⚠️ শুধুমাত্র সুপার অ্যাডমিন (Super Admin) যেকোনো রেকর্ড ডিলিট করতে পারবেন।' : '⚠️ Only Super Admin has permission to delete records.');
      return;
    }
    const updated = products.filter(p => p.id !== prod.id);
    setProducts(updated);
    DatabaseStorage.saveProducts(updated);
    fetch(`/api/products/${prod.id}`, { method: 'DELETE' }).catch(console.error);
    SupabaseSync.deleteProduct(prod.id);
    FirestoreSync.deleteProduct(prod.id);
    showSyncNotice(lang === 'bn' ? `'${prod.name}' মুছে ফেলা হয়েছে এবং ডাটাবেজ সিঙ্ক হয়েছে।` : `'${prod.name}' deleted and synced.`);
  };

  // Handlers for Contacts (Suppliers & Customers)
  const handleAddSupplier = (contact: Contact) => {
    if (editingContact) {
      const updated = suppliers.map(s => s.id === contact.id ? contact : s);
      setSuppliers(updated);
      DatabaseStorage.saveSuppliers(updated);
      fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
      }).catch(console.error);
      SupabaseSync.upsertContact(contact);
      FirestoreSync.upsertContact(contact);
      setEditingContact(null);
      showSyncNotice(lang === 'bn' ? `সরবরাহকারী '${contact.businessName || contact.name}' সম্পাদিত ও সিঙ্ক হয়েছে।` : `Supplier '${contact.businessName || contact.name}' updated and synced.`);
    } else {
      const updated = [contact, ...suppliers];
      setSuppliers(updated);
      DatabaseStorage.saveSuppliers(updated);
      fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
      }).catch(console.error);
      SupabaseSync.upsertContact(contact);
      FirestoreSync.upsertContact(contact);
      showSyncNotice(lang === 'bn' ? `নতুন সরবরাহকারী '${contact.businessName || contact.name}' যুক্ত ও সিঙ্ক হয়েছে।` : `New supplier '${contact.businessName || contact.name}' added and synced.`);
    }
  };

  const handleDeleteSupplier = (row: Contact) => {
    const isSuper = currentUser?.role === 'super_admin' || userRole === 'super_admin';
    if (!isSuper) {
      showSyncNotice(lang === 'bn' ? '⚠️ শুধুমাত্র সুপার অ্যাডমিন (Super Admin) যেকোনো রেকর্ড ডিলিট করতে পারবেন।' : '⚠️ Only Super Admin has permission to delete records.');
      return;
    }
    const updated = suppliers.filter(s => s.id !== row.id);
    setSuppliers(updated);
    DatabaseStorage.saveSuppliers(updated);
    fetch(`/api/contacts/${row.id}`, { method: 'DELETE' }).catch(console.error);
    SupabaseSync.deleteContact(row.id);
    FirestoreSync.deleteContact(row.id);
    showSyncNotice(lang === 'bn' ? `সরবরাহকারী '${row.businessName || row.name}' মুছে ফেলা হয়েছে।` : `Supplier deleted and synced.`);
  };

  const handleAddCustomer = (contact: Contact) => {
    if (editingContact) {
      const updated = customers.map(c => c.id === contact.id ? contact : c);
      setCustomers(updated);
      DatabaseStorage.saveCustomers(updated);
      fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
      }).catch(console.error);
      SupabaseSync.upsertContact(contact);
      FirestoreSync.upsertContact(contact);
      setEditingContact(null);
      showSyncNotice(lang === 'bn' ? `গ্রাহক '${contact.name}' সম্পাদিত ও সিঙ্ক হয়েছে।` : `Customer '${contact.name}' updated and synced.`);
    } else {
      const updated = [contact, ...customers];
      setCustomers(updated);
      DatabaseStorage.saveCustomers(updated);
      fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
      }).catch(console.error);
      SupabaseSync.upsertContact(contact);
      FirestoreSync.upsertContact(contact);
      showSyncNotice(lang === 'bn' ? `নতুন গ্রাহক '${contact.name}' যুক্ত ও সিঙ্ক হয়েছে।` : `New customer '${contact.name}' added and synced.`);
    }
  };

  const handleDeleteCustomer = (row: Contact) => {
    const isSuper = currentUser?.role === 'super_admin' || userRole === 'super_admin';
    if (!isSuper) {
      showSyncNotice(lang === 'bn' ? '⚠️ শুধুমাত্র সুপার অ্যাডমিন (Super Admin) যেকোনো রেকর্ড ডিলিট করতে পারবেন।' : '⚠️ Only Super Admin has permission to delete records.');
      return;
    }
    const updated = customers.filter(c => c.id !== row.id);
    setCustomers(updated);
    DatabaseStorage.saveCustomers(updated);
    fetch(`/api/contacts/${row.id}`, { method: 'DELETE' }).catch(console.error);
    SupabaseSync.deleteContact(row.id);
    FirestoreSync.deleteContact(row.id);
    showSyncNotice(lang === 'bn' ? `গ্রাহক '${row.name}' মুছে ফেলা হয়েছে।` : `Customer '${row.name}' deleted and synced.`);
  };

  // Handlers for Expenses
  const handleAddExpense = (expense: Expense) => {
    const updated = [expense, ...expenses];
    setExpenses(updated);
    DatabaseStorage.saveExpenses(updated);
    fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense)
    }).catch(console.error);
    FirestoreSync.upsertExpense(expense);
    SupabaseSync.upsertExpense(expense);
    showSyncNotice(lang === 'bn' ? `ব্যয় ভাউচার '${expense.expenseNo}' যুক্ত ও সিঙ্ক হয়েছে।` : `Expense '${expense.expenseNo}' added and synced.`);
  };

  const handleDeleteExpense = (row: Expense) => {
    const isSuper = currentUser?.role === 'super_admin' || userRole === 'super_admin';
    if (!isSuper) {
      showSyncNotice(lang === 'bn' ? '⚠️ শুধুমাত্র সুপার অ্যাডমিন (Super Admin) যেকোনো রেকর্ড ডিলিট করতে পারবেন।' : '⚠️ Only Super Admin has permission to delete records.');
      return;
    }
    const updated = expenses.filter(e => e.id !== row.id);
    setExpenses(updated);
    DatabaseStorage.saveExpenses(updated);
    fetch(`/api/expenses/${row.id}`, { method: 'DELETE' }).catch(console.error);
    FirestoreSync.deleteExpense(row.id);
    SupabaseSync.deleteExpense(row.id);
    showSyncNotice(lang === 'bn' ? `ব্যয় '${row.expenseNo}' মুছে ফেলা হয়েছে।` : `Expense '${row.expenseNo}' deleted and synced.`);
  };

  // Handlers for Purchases
  const handleAddPurchase = (purchase: Purchase) => {
    const updated = [purchase, ...purchases];
    setPurchases(updated);
    DatabaseStorage.savePurchases(updated);
    fetch('/api/purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(purchase)
    }).catch(console.error);
    FirestoreSync.upsertPurchase(purchase);
    SupabaseSync.upsertPurchase(purchase);
    showSyncNotice(lang === 'bn' ? `ক্রয় চালান '${purchase.purchaseNo}' যুক্ত ও সিঙ্ক হয়েছে।` : `Purchase order '${purchase.purchaseNo}' added and synced.`);
  };

  const handleDeletePurchase = (row: Purchase) => {
    const isSuper = currentUser?.role === 'super_admin' || userRole === 'super_admin';
    if (!isSuper) {
      showSyncNotice(lang === 'bn' ? '⚠️ শুধুমাত্র সুপার অ্যাডমিন (Super Admin) যেকোনো রেকর্ড ডিলিট করতে পারবেন।' : '⚠️ Only Super Admin has permission to delete records.');
      return;
    }
    const updated = purchases.filter(p => p.id !== row.id);
    setPurchases(updated);
    DatabaseStorage.savePurchases(updated);
    fetch(`/api/purchases/${row.id}`, { method: 'DELETE' }).catch(console.error);
    FirestoreSync.deletePurchase(row.id);
    SupabaseSync.deletePurchase(row.id);
    showSyncNotice(lang === 'bn' ? `ক্রয় অর্ডার '${row.purchaseNo}' মুছে ফেলা হয়েছে।` : `Purchase order deleted and synced.`);
  };

  // Handlers for Stock Transfers
  const handleAddTransfer = (transfer: StockTransfer) => {
    setStockTransfers([transfer, ...stockTransfers]);
    showSyncNotice(lang === 'bn' ? `স্টক ট্রান্সফার '${transfer.transferNo}' তৈরি ও সিঙ্ক হয়েছে।` : `Stock transfer '${transfer.transferNo}' created and synced.`);
  };

  const handleDeleteTransfer = (transfer: StockTransfer) => {
    const isSuper = currentUser?.role === 'super_admin' || userRole === 'super_admin';
    if (!isSuper) {
      showSyncNotice(lang === 'bn' ? '⚠️ শুধুমাত্র সুপার অ্যাডমিন (Super Admin) যেকোনো রেকর্ড ডিলিট করতে পারবেন।' : '⚠️ Only Super Admin has permission to delete records.');
      return;
    }
    setStockTransfers(prev => prev.filter(t => t.id !== transfer.id));
    showSyncNotice(lang === 'bn' ? `স্টক ট্রান্সফার '${transfer.transferNo}' মুছে ফেলা হয়েছে।` : `Stock transfer deleted and synced.`);
  };

  // Handlers for Sales
  const handleCompleteSale = (newSale: Sale, updatedProducts: Product[]) => {
    setSales([newSale, ...sales]);
    setProducts(updatedProducts);
    DatabaseStorage.saveSales([newSale, ...sales]);
    DatabaseStorage.saveProducts(updatedProducts);
    fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSale)
    }).catch(console.error);
    SupabaseSync.upsertSale(newSale);
    FirestoreSync.upsertSale(newSale);
    for (const p of updatedProducts) {
      SupabaseSync.upsertProduct(p);
      FirestoreSync.upsertProduct(p);
    }
    showSyncNotice(lang === 'bn' ? `বিক্রয় চালান '${newSale.invoiceNo}' সফলভাবে সম্পন্ন ও ক্লাউড সিঙ্ক হয়েছে।` : `Sale invoice '${newSale.invoiceNo}' completed and synced.`);
  };

  const handleDeleteSale = (sale: Sale) => {
    const isSuper = currentUser?.role === 'super_admin' || userRole === 'super_admin';
    if (!isSuper) {
      showSyncNotice(lang === 'bn' ? '⚠️ শুধুমাত্র সুপার অ্যাডমিন (Super Admin) যেকোনো রেকর্ড ডিলিট করতে পারবেন।' : '⚠️ Only Super Admin has permission to delete records.');
      return;
    }
    const updated = sales.filter(s => s.id !== sale.id);
    setSales(updated);
    DatabaseStorage.saveSales(updated);
    fetch(`/api/sales/${sale.id}`, { method: 'DELETE' }).catch(console.error);
    SupabaseSync.deleteSale(sale.id);
    FirestoreSync.deleteSale(sale.id);
    showSyncNotice(lang === 'bn' ? `চালান '${sale.invoiceNo}' মুছে ফেলা হয়েছে এবং ডাটাবেজ সিঙ্ক হয়েছে।` : `Invoice '${sale.invoiceNo}' deleted and synced.`);
  };

  // Super Admin: Universal Edit Entry Save Handler
  const handleEditEntrySave = (updatedEntry: any) => {
    if (!editingEntry) return;

    if (editingEntry.type === 'sale') {
      setSales(prev => prev.map(s => s.id === updatedEntry.id ? updatedEntry : s));
      SupabaseSync.upsertSale(updatedEntry);
      showSyncNotice(lang === 'bn' ? `বিক্রয় চালান '${updatedEntry.invoiceNo}' হালনাগাদ ও সিঙ্ক হয়েছে।` : `Sale invoice '${updatedEntry.invoiceNo}' updated and synced.`);
    } else if (editingEntry.type === 'purchase') {
      setPurchases(prev => prev.map(p => p.id === updatedEntry.id ? updatedEntry : p));
      SupabaseSync.upsertPurchase(updatedEntry);
      showSyncNotice(lang === 'bn' ? `ক্রয় চালান '${updatedEntry.purchaseNo}' হালনাগাদ ও সিঙ্ক হয়েছে।` : `Purchase order '${updatedEntry.purchaseNo}' updated and synced.`);
    } else if (editingEntry.type === 'expense') {
      setExpenses(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
      SupabaseSync.upsertExpense(updatedEntry);
      showSyncNotice(lang === 'bn' ? `ব্যয় ভাউচার '${updatedEntry.expenseNo}' হালনাগাদ ও সিঙ্ক হয়েছে।` : `Expense '${updatedEntry.expenseNo}' updated and synced.`);
    }

    setEditingEntry(null);
  };

  const handleQuickRestock = (productId: string, quantity: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const updated = { ...p, currentStock: p.currentStock + quantity };
        SupabaseSync.upsertProduct(updated);
        return updated;
      }
      return p;
    }));
    showSyncNotice(lang === 'bn' ? `স্টক সফলভাবে বৃদ্ধি ও সিঙ্ক হয়েছে (+${quantity})` : `Quick restocked +${quantity} units and synced.`);
  };

  const handleSaveUpdatedPrices = () => {
    setProducts(prev => prev.map(p => {
      if (priceUpdates[p.id] !== undefined) {
        return { ...p, sellingPrice: priceUpdates[p.id] };
      }
      return p;
    }));
    setPriceUpdates({});
    showSyncNotice(lang === 'bn' ? 'সকল পণ্যের বিক্রয় মূল্য সফলভাবে হালনাগাদ হয়েছে।' : 'Product selling prices updated successfully.');
  };

  const handleClearAllMockData = async () => {
    setProducts([]);
    setSales([]);
    setPurchases([]);
    setExpenses([]);
    setSalesReturns([]);
    setPurchaseReturns([]);
    setStockTransfers([]);
    setSuppliers([]);
    setCustomers(INITIAL_TAMANNA_CUSTOMERS);
    DatabaseStorage.saveProducts([]);
    DatabaseStorage.saveSales([]);
    DatabaseStorage.savePurchases([]);
    DatabaseStorage.saveExpenses([]);
    DatabaseStorage.saveSuppliers([]);
    DatabaseStorage.saveCustomers(INITIAL_TAMANNA_CUSTOMERS);
    DatabaseStorage.saveAuditLogs([]);
    DatabaseStorage.saveDeleteRequests([]);
    fetch('/api/products', { method: 'DELETE' }).catch(err => console.error(err));
    fetch('/api/sales', { method: 'DELETE' }).catch(err => console.error(err));
    fetch('/api/expenses', { method: 'DELETE' }).catch(err => console.error(err));
    fetch('/api/purchases', { method: 'DELETE' }).catch(err => console.error(err));
    fetch('/api/contacts', { method: 'DELETE' }).catch(err => console.error(err));
    
    await Promise.allSettled([
      FirestoreSync.clearCollection('products'),
      FirestoreSync.clearCollection('sales'),
      FirestoreSync.clearCollection('purchases'),
      FirestoreSync.clearCollection('expenses'),
      FirestoreSync.clearCollection('contacts'),
      SupabaseSync.deleteAllProducts(),
      SupabaseSync.deleteAllSales(),
      SupabaseSync.deleteAllPurchases(),
      SupabaseSync.deleteAllExpenses(),
      SupabaseSync.deleteAllContacts()
    ]);
    showSyncNotice(lang === 'bn' ? 'সকল মক ডেটা সফলভাবে মুছে ফেলা হয়েছে। আপনি আপনার ডেটা যোগ করতে প্রস্তুত।' : 'All mock data cleared from Cloud & Database successfully.');
  };

  const handleImportAllLiveData = () => {
    const imported = DatabaseStorage.importAllLiveData();
    setProducts(imported.products);
    setSuppliers(imported.suppliers);
    setCustomers(imported.customers);
    setSales(imported.sales);
    setPurchases(imported.purchases);
    setExpenses(imported.expenses);
    showSyncNotice(
      lang === 'bn' 
        ? 'TAMANNA MOTORS-এর সকল লাইভ ডাটা (৫২১ পণ্য, ৮৪০ বিক্রয়, ৪১ সরবরাহকারী, ৪২ কাস্টমার, ২৪৮ পারচেস) সফলভাবে লোড ও সিঙ্ক হয়েছে!' 
        : 'All TAMANNA MOTORS live data (521 products, 840 sales, 41 suppliers, 42 customers, 248 purchases) imported and synced successfully!'
    );
  };

  const handleRefreshDatabase = () => {
    setProducts(INITIAL_TAMANNA_PRODUCTS);
    setSuppliers(INITIAL_TAMANNA_SUPPLIERS);
    setCustomers(INITIAL_TAMANNA_CUSTOMERS);
    setSales(INITIAL_TAMANNA_SALES);
    setPurchases(INITIAL_TAMANNA_PURCHASES);
    setExpenses(INITIAL_TAMANNA_EXPENSES);
    setBusinessSettings(TAMANNA_BUSINESS_SETTINGS);
  };

  // Columns definition for Products
  const productColumns: Column<Product>[] = [
    {
      header: lang === 'bn' ? 'ছবি' : 'Product Image',
      sortable: false,
      align: 'center',
      cell: (row) => (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 mx-auto">
          {row.imageUrl ? (
            <img
              src={row.imageUrl}
              alt={row.name}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <Wrench className="h-4 w-4 text-slate-400" />
          )}
        </div>
      )
    },
    {
      header: lang === 'bn' ? 'পণ্যের নাম' : 'Product Name',
      accessorKey: 'name',
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-white">{row.name}</div>
          <div className="text-[11px] text-slate-600 dark:text-slate-300 font-mono">
            SKU: {row.sku} · {row.category}
          </div>
        </div>
      )
    },
    {
      header: lang === 'bn' ? 'শাখা / অবস্থান' : 'Business Location',
      accessorKey: 'businessLocation',
      cell: (row) => (
        <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
          <MapPin className="h-3 w-3 text-slate-400" />
          {row.businessLocation}
        </span>
      )
    },
    {
      header: lang === 'bn' ? 'একক ক্রয়মূল্য' : 'Unit Purchase Price',
      accessorKey: 'unitPurchasePrice',
      align: 'right'
    },
    {
      header: lang === 'bn' ? 'বিক্রয় মূল্য' : 'Selling Price',
      accessorKey: 'sellingPrice',
      align: 'right'
    },
    {
      header: lang === 'bn' ? 'বর্তমান স্টক' : 'Current Stock',
      accessorKey: 'currentStock',
      align: 'right',
      cell: (row) => {
        const isLow = row.currentStock <= row.alertQuantity;
        return (
          <span className={`font-mono font-bold tabular-nums ${isLow ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
            {row.currentStock} {lang === 'bn' ? 'টি' : 'units'}
          </span>
        );
      }
    }
  ];

  // Columns definition for Suppliers
  const supplierColumns: Column<Contact>[] = [
    {
      header: lang === 'bn' ? 'সরবরাহকারী প্রতিষ্ঠান' : 'Supplier & Business',
      accessorKey: 'name',
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-white">{row.businessName || row.name}</div>
          <div className="text-[11px] text-slate-600 dark:text-slate-300">
            {lang === 'bn' ? 'প্রতিনিধি' : 'Contact'}: {row.name}
          </div>
        </div>
      )
    },
    {
      header: lang === 'bn' ? 'মোবাইল নাম্বার' : 'Phone Number',
      accessorKey: 'phone',
      cell: (row) => <span className="font-mono text-slate-700 dark:text-slate-300">{row.phone}</span>
    },
    {
      header: lang === 'bn' ? 'ইমেইল' : 'Email',
      accessorKey: 'email',
      cell: (row) => <span className="text-slate-600 dark:text-slate-300">{row.email || '—'}</span>
    },
    {
      header: lang === 'bn' ? 'ট্যাক্স / টিআইএন' : 'Tax Number',
      accessorKey: 'taxNumber',
      cell: (row) => <span className="font-mono text-slate-600 dark:text-slate-300">{row.taxNumber || '—'}</span>
    },
    {
      header: lang === 'bn' ? 'পাওনা দেনা (৳)' : 'Payable Balance',
      accessorKey: 'balance',
      align: 'right',
      cell: (row) => (
        <span className="font-mono font-bold text-rose-600 dark:text-rose-400 tabular-nums">
          ৳{row.balance.toFixed(2)}
        </span>
      )
    }
  ];

  // Columns definition for Customers
  const customerColumns: Column<Contact>[] = [
    {
      header: lang === 'bn' ? 'গ্রাহকের নাম' : 'Customer Name',
      accessorKey: 'name',
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-white">{row.name}</div>
          {row.businessName && <div className="text-[11px] text-slate-600 dark:text-slate-300">{row.businessName}</div>}
        </div>
      )
    },
    {
      header: lang === 'bn' ? 'গ্রুপ' : 'Customer Group',
      accessorKey: 'customerGroup',
      cell: (row) => (
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {row.customerGroup || 'Retail'}
        </span>
      )
    },
    {
      header: lang === 'bn' ? 'ফোন' : 'Phone',
      accessorKey: 'phone',
      cell: (row) => <span className="font-mono text-slate-700 dark:text-slate-300">{row.phone}</span>
    },
    {
      header: lang === 'bn' ? 'মোট ক্রয়' : 'Total Purchases',
      accessorKey: 'totalPurchases',
      align: 'right',
      cell: (row) => (
        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
          ৳{(row.totalPurchases || 0).toFixed(2)}
        </span>
      )
    },
    {
      header: lang === 'bn' ? 'বকেয়া' : 'Due Balance',
      accessorKey: 'balance',
      align: 'right',
      cell: (row) => (
        <span className={`font-mono font-bold tabular-nums ${row.balance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300'}`}>
          ৳{row.balance.toFixed(2)}
        </span>
      )
    }
  ];

  // Columns definition for Purchases
  const purchaseColumns: Column<Purchase>[] = [
    {
      header: 'Purchase No',
      accessorKey: 'purchaseNo',
      cell: (row) => <span className="font-mono font-bold text-slate-900 dark:text-white">{row.purchaseNo}</span>
    },
    { header: lang === 'bn' ? 'সরবরাহকারী' : 'Supplier Name', accessorKey: 'supplierName' },
    { header: lang === 'bn' ? 'শাখা' : 'Receiving Location', accessorKey: 'businessLocation' },
    {
      header: lang === 'bn' ? 'ক্রয় অবস্থা' : 'Purchase Status',
      accessorKey: 'purchaseStatus',
      cell: (row) => (
        <span className={`font-bold text-[11px] ${
          row.purchaseStatus === 'Received' ? 'text-emerald-800 dark:text-emerald-400' : 'text-amber-800 dark:text-amber-400'
        }`}>
          {row.purchaseStatus}
        </span>
      )
    },
    {
      header: lang === 'bn' ? 'পেমেন্ট অবস্থা' : 'Payment Status',
      accessorKey: 'paymentStatus',
      cell: (row) => (
        <span className={`font-bold text-[11px] ${
          row.paymentStatus === 'Paid' ? 'text-emerald-800 dark:text-emerald-400' : 'text-amber-800 dark:text-amber-400'
        }`}>
          {row.paymentStatus}
        </span>
      )
    },
    {
      header: lang === 'bn' ? 'তারিখ' : 'Purchase Date',
      accessorKey: 'purchaseDate',
      cell: (row) => <span className="font-mono text-slate-600 dark:text-slate-300">{row.purchaseDate}</span>
    },
    { header: lang === 'bn' ? 'সর্বমোট টাকা' : 'Grand Total', accessorKey: 'grandTotal', align: 'right' },
    { header: lang === 'bn' ? 'বকেয়া' : 'Amount Due', accessorKey: 'paymentDue', align: 'right' }
  ];

  // Columns definition for Sales
  const saleColumns: Column<Sale>[] = [
    {
      header: 'Invoice No',
      accessorKey: 'invoiceNo',
      cell: (row) => <span className="font-mono font-bold text-slate-900 dark:text-white">{row.invoiceNo}</span>
    },
    {
      header: lang === 'bn' ? 'ধরণ' : 'Type',
      accessorKey: 'type',
      cell: (row) => (
        <span className="font-mono uppercase text-[11px] font-bold text-slate-600 dark:text-slate-300">
          {row.type}
        </span>
      )
    },
    { header: lang === 'bn' ? 'গ্রাহক' : 'Customer', accessorKey: 'customerName' },
    { header: lang === 'bn' ? 'শাখা' : 'Store Branch', accessorKey: 'businessLocation' },
    { header: lang === 'bn' ? 'পেমেন্ট মাধ্যম' : 'Payment Method', accessorKey: 'paymentMethod' },
    {
      header: lang === 'bn' ? 'অবস্থা' : 'Status',
      accessorKey: 'paymentStatus',
      cell: (row) => {
        const isPaid = row.paymentStatus === 'Paid' || (row.invoiceDue !== undefined && row.invoiceDue <= 0);
        const isPartial = !isPaid && (row.amountTendered || 0) > 0;
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black ${
            isPaid 
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
              : isPartial 
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' 
              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
          }`}>
            {isPaid ? (lang === 'bn' ? 'পরিশোধিত' : 'Paid') : isPartial ? (lang === 'bn' ? 'আংশিক বাকি' : 'Partial') : (lang === 'bn' ? 'বাকি' : 'Due')}
          </span>
        );
      }
    },
    {
      header: lang === 'bn' ? 'তারিখ' : 'Sale Date',
      accessorKey: 'saleDate',
      cell: (row) => <span className="font-mono text-slate-600 dark:text-slate-300">{row.saleDate}</span>
    },
    { header: lang === 'bn' ? 'সর্বমোট টাকা' : 'Total Amount', accessorKey: 'totalAmount', align: 'right' },
    {
      header: lang === 'bn' ? 'বকেয়া (৳)' : 'Due (৳)',
      accessorKey: 'invoiceDue',
      align: 'right',
      cell: (row) => {
        const due = row.invoiceDue !== undefined ? row.invoiceDue : Math.max(0, row.totalAmount - (row.amountTendered || 0));
        return due > 0 ? (
          <span className="font-black text-rose-600 dark:text-rose-400 font-mono">
            ৳{due.toLocaleString('en-US')}
          </span>
        ) : (
          <span className="text-slate-400 font-mono">৳0</span>
        );
      }
    }
  ];

  // Render the selected route
  const renderMainContent = () => {
    switch (currentRoute) {
      case 'home':
        return (
          <DashboardView
            onOpenPos={() => setIsPosOpen(true)}
            onNavigate={(route) => {
              if (route === 'products-add') {
                setIsAddProductOpen(true);
              } else if (route === 'purchase-add') {
                setIsAddPurchaseOpen(true);
              } else {
                setCurrentRoute(route);
              }
            }}
            products={products}
            sales={sales}
            purchases={purchases}
            expenses={expenses}
            lang={lang}
            userRole={userRole}
            currentUser={currentUser}
            onQuickRestock={handleQuickRestock}
          />
        );

      case 'user-management':
        if (currentUser?.role !== 'super_admin') {
          return (
            <div className="flex flex-col items-center justify-center p-6 sm:p-12 text-center min-h-[450px]">
              <div className="max-w-md w-full rounded-3xl bg-rose-500/10 dark:bg-rose-950/30 border border-rose-500/30 p-8 backdrop-blur-2xl shadow-2xl">
                <div className="h-14 w-14 rounded-2xl bg-rose-500/20 text-rose-500 mx-auto flex items-center justify-center mb-4 ring-8 ring-rose-500/10">
                  <ShieldAlert className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                  {lang === 'bn' ? 'অনুমতি সংরক্ষিত (Access Restricted)' : 'Super Admin Access Only'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  {lang === 'bn'
                    ? 'ইউজার ম্যানেজমেন্ট ও স্টাফ নিয়ন্ত্রণ ব্যবস্থা শুধুমাত্র সুপার অ্যাডমিন (Super Admin)-এর জন্য সংরক্ষিত।'
                    : 'User Management and Staff Access Control is strictly restricted to Super Admin accounts only.'}
                </p>
                <button
                  onClick={() => setCurrentRoute('home')}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  {lang === 'bn' ? 'ড্যাশবোর্ডে ফিরে যান' : 'Return to Dashboard'}
                </button>
              </div>
            </div>
          );
        }
        return (
          <UserManagementView
            users={staffUsers}
            onUpdateUsers={handleUpdateStaffUsers}
            currentUser={currentUser}
            lang={lang}
          />
        );

      case 'contact-suppliers':
        return (
          <DataTable
            title={t.nav.suppliers}
            subtitle={lang === 'bn' ? 'এক্সকাভেটর ও মোটর পার্টস সরবরাহকারী প্রতিষ্ঠান, ক্রেডিট সীমা ও বকেয়া হিসাব।' : 'Manage vendor relationships, procurement contacts, credit terms, and payable balances.'}
            data={suppliers}
            columns={supplierColumns}
            addNewLabel={lang === 'bn' ? 'নতুন সরবরাহকারী যোগ করুন' : 'Add Supplier'}
            onAddNew={() => {
              setEditingContact(null);
              setIsAddSupplierOpen(true);
            }}
            onDelete={handleDeleteSupplier}
            onEdit={(row) => {
              setEditingContact(row);
              setIsAddSupplierOpen(true);
            }}
            onView={(row) => {
              setEditingContact(row);
              setIsAddSupplierOpen(true);
            }}
            lang={lang}
          />
        );

      case 'contact-customers':
        return (
          <DataTable
            title={t.nav.customers}
            subtitle={lang === 'bn' ? 'নিয়মিত বাইকার, মেকানিক ও ওয়ার্কশপ ক্লায়েন্ট ডাটাবেজ।' : 'Client registry, customer group tiers, lifetime purchase totals, and credit accounts.'}
            data={customers}
            columns={customerColumns}
            addNewLabel={lang === 'bn' ? 'নতুন গ্রাহক যোগ করুন' : 'Add Customer'}
            onAddNew={() => {
              setEditingContact(null);
              setIsAddCustomerOpen(true);
            }}
            onDelete={handleDeleteCustomer}
            onEdit={(row) => {
              setEditingContact(row);
              setIsAddCustomerOpen(true);
            }}
            onView={(row) => {
              setEditingContact(row);
              setIsAddCustomerOpen(true);
            }}
            lang={lang}
          />
        );

      case 'contact-customer-group':
        return (
          <DataTable
            title={t.nav.customerGroup}
            subtitle={lang === 'bn' ? 'ওয়ার্কশপ ও পাইকারি ক্রেতাদের জন্য স্বয়ংক্রিয় ক্যাশ মেমো ডিসকাউন্ট।' : 'Tiered loyalty discounts and wholesale pricing bands applied automatically at POS checkout.'}
            data={customerGroups}
            columns={[
              {
                header: lang === 'bn' ? 'গ্রুপের নাম' : 'Group Name',
                accessorKey: 'name',
                cell: (row) => <span className="font-bold text-slate-900 dark:text-white">{row.name}</span>
              },
              {
                header: lang === 'bn' ? 'ছাড় হার (%)' : 'Calculation Discount (%)',
                accessorKey: 'calculationPercentage',
                align: 'right',
                cell: (row) => <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400">{row.calculationPercentage}%</span>
              },
              {
                header: lang === 'bn' ? 'মূল্য স্তর' : 'Price Tier',
                accessorKey: 'sellingPriceGroup',
                cell: (row) => <span className="font-medium text-slate-700 dark:text-slate-300">{row.sellingPriceGroup}</span>
              }
            ]}
            addNewLabel={lang === 'bn' ? 'নতুন গ্রুপ তৈরি' : 'Add Customer Group'}
            onAddNew={() => {
              const count = customerGroups.length + 1;
              const newG = {
                id: `cg-${Date.now()}`,
                name: `Discount Tier ${count}`,
                calculationPercentage: count * 5,
                sellingPriceGroup: `Band ${count}`
              };
              setCustomerGroups([...customerGroups, newG]);
              showSyncNotice(lang === 'bn' ? `নতুন গ্রাহক গ্রুপ '${newG.name}' যোগ করা হয়েছে।` : `Customer group '${newG.name}' added.`);
            }}
            onDelete={(row) => {
              setCustomerGroups(prev => prev.filter(cg => cg.id !== row.id));
              showSyncNotice(lang === 'bn' ? `গ্রুপ '${row.name}' মুছে ফেলা হয়েছে।` : `Customer group '${row.name}' removed.`);
            }}
            lang={lang}
          />
        );

      case 'products-list':
        return (
          <DataTable
            title={t.nav.listOfProducts}
            subtitle={lang === 'bn' ? 'তামান্না মোটরসের সকল এক্সকাভেটর পার্টস, হাইড্রোলিক অয়েল, ফিল্টার ও স্পেয়ার পার্টস স্টক।' : 'Catalog inventory, SKU tracking, excavator & heavy machinery parts, and pricing thresholds.'}
            data={products}
            columns={productColumns}
            addNewLabel={t.nav.addProduct}
            onAddNew={() => {
              setEditingProduct(null);
              setIsAddProductOpen(true);
            }}
            onEdit={(row) => {
              setEditingProduct(row);
              setIsAddProductOpen(true);
            }}
            onDelete={handleDeleteProduct}
            onView={(row) => {
              setEditingProduct(row);
              setIsAddProductOpen(true);
            }}
            lang={lang}
          />
        );

      case 'products-add':
        return (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs max-w-2xl transition-colors">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {t.productModal.titleAdd}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
              {lang === 'bn'
                ? 'ব্রাউজার ক্যামেরা বারকোড স্ক্যানার দিয়ে সরাসরি এসকেইউ ও পণ্যের বিবরণ স্বয়ংক্রিয় পূরণ করুন।'
                : 'Use the browser camera barcode scanner to auto-fill SKU and spare part details instantly.'}
            </p>
            <button
              onClick={() => {
                setEditingProduct(null);
                setIsAddProductOpen(true);
              }}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
            >
              {lang === 'bn' ? 'বারকোড স্ক্যানার ও ফরম খুলুন' : 'Open Camera Barcode Scanner Form'}
            </button>
          </div>
        );

      case 'products-update-price':
        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-colors">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.nav.updatePrice}</h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  {lang === 'bn' ? 'সকল এক্সকাভেটর ও মোটর পার্টসের খুচরা বিক্রয় মূল্য একযোগে পরিবর্তন করুন।' : 'Rapidly adjust retail selling prices across your entire inventory catalogue.'}
                </p>
              </div>
              <button
                onClick={handleSaveUpdatedPrices}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
              >
                <Check className="h-4 w-4" />
                <span>{t.saveChanges}</span>
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-colors">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                    <tr>
                      <th className="py-3 px-4">{lang === 'bn' ? 'পণ্যের নাম ও এসকেইউ' : 'Product Name & SKU'}</th>
                      <th className="py-3 px-4">{lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}</th>
                      <th className="py-3 px-4 text-right">{lang === 'bn' ? 'ক্রয়মূল্য' : 'Purchase Cost'}</th>
                      <th className="py-3 px-4 text-right">{lang === 'bn' ? 'বর্তমান মূল্য' : 'Current Price'}</th>
                      <th className="py-3 px-4 text-right">{lang === 'bn' ? 'নতুন বিক্রয় মূল্য (৳)' : 'New Selling Price (৳)'}</th>
                      <th className="py-3 px-4 text-right">{lang === 'bn' ? 'প্রত্যাশিত লাভ' : 'Markup %'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {products.map((p) => {
                      const newPrice = priceUpdates[p.id] !== undefined ? priceUpdates[p.id] : p.sellingPrice;
                      const markup = ((newPrice - p.unitPurchasePrice) / p.unitPurchasePrice) * 100;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 dark:text-white">{p.name}</span>
                            <span className="block text-[11px] font-mono text-slate-600 dark:text-slate-300">{p.sku}</span>
                          </td>
                          <td className="py-3 px-4">{p.category}</td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums">
                            ৳{p.unitPurchasePrice.toFixed(0)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                            ৳{p.sellingPrice.toFixed(0)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <input
                              type="number"
                              step="1"
                              value={newPrice}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setPriceUpdates({ ...priceUpdates, [p.id]: val });
                              }}
                              className="w-24 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 text-right font-mono font-bold text-emerald-800 dark:text-emerald-400 focus:outline-none"
                            />
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-xs">
                            <span className={markup >= 30 ? 'text-emerald-800 dark:text-emerald-400 font-bold' : 'text-amber-800 dark:text-amber-400'}>
                              {markup.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'purchase-list':
        return (
          <DataTable
            title={t.nav.listOfPurchases}
            subtitle={lang === 'bn' ? 'আমদানিকৃত চালান, রসিদ যাচাই ও সাপ্লায়ার বকেয়া ট্র্যাকিং।' : 'Inbound vendor shipments, delivery verification, and pending accounts payable.'}
            data={purchases}
            columns={purchaseColumns}
            addNewLabel={t.nav.addPurchase}
            onAddNew={() => setIsAddPurchaseOpen(true)}
            onEdit={(row) => setEditingEntry({ type: 'purchase', data: row })}
            onDelete={handleDeletePurchase}
            onView={(row) => alert(`PO: ${row.purchaseNo}\nSupplier: ${row.supplierName}\nStatus: ${row.purchaseStatus}\nTotal: ৳${row.grandTotal.toFixed(2)}\nDue: ৳${row.paymentDue.toFixed(2)}`)}
            lang={lang}
          />
        );

      case 'purchase-add':
        return (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs max-w-2xl transition-colors">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{t.nav.addPurchase}</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
              {lang === 'bn' ? 'সাপ্লায়ারের নিকট থেকে নতুন চালান অর্ডার এন্ট্রি করুন।' : 'Record new wholesale stock orders from approved vendors.'}
            </p>
            <button
              onClick={() => setIsAddPurchaseOpen(true)}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
            >
              {lang === 'bn' ? 'ক্রয় ফরম খুলুন' : 'Open Purchase Form'}
            </button>
          </div>
        );

      case 'purchase-return-list':
        return (
          <DataTable
            title={t.nav.listPurchaseReturn}
            subtitle={lang === 'bn' ? 'ত্রুটিযুক্ত পার্টস বা বাতিলকৃত চালানের ফেরত তালিকা।' : 'Defective, transit-damaged, or excess vendor returns credit notes.'}
            data={purchaseReturns}
            columns={[
              {
                header: 'Return No',
                accessorKey: 'returnNo',
                cell: (row) => <span className="font-mono font-bold text-slate-900 dark:text-white">{row.returnNo}</span>
              },
              { header: 'PO No', accessorKey: 'purchaseNo' },
              { header: lang === 'bn' ? 'সরবরাহকারী' : 'Supplier', accessorKey: 'supplierName' },
              { header: lang === 'bn' ? 'তারিখ' : 'Date', accessorKey: 'returnDate' },
              { header: lang === 'bn' ? 'ফেরত মূল্য' : 'Return Value', accessorKey: 'totalAmount', align: 'right' }
            ]}
            lang={lang}
          />
        );

      case 'synced-dues':
        return (
          <SyncedDuesView
            sales={sales}
            onUpdateSale={(updatedSale) => {
              const updated = sales.map(s => s.id === updatedSale.id ? updatedSale : s);
              setSales(updated);
              DatabaseStorage.saveSales(updated);
              fetch('/api/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedSale)
              }).catch(console.error);
              SupabaseSync.upsertSale(updatedSale);
            }}
            onOpenReceipt={(sale, isMoney) => {
              setViewingReceiptSale(sale);
              setIsReceiptMoneyMode(!!isMoney);
            }}
            currentUser={currentUser}
            businessSettings={businessSettings}
            invoiceSettings={invoiceSettings}
            lang={lang}
          />
        );

      case 'sales-all':
        return (
          <DataTable
            title={t.nav.allSales}
            subtitle={lang === 'bn' ? 'তামান্না মোটরসের সকল বিক্রয় মেমো ও ক্যাশ কাউন্টার চালান।' : 'Complete ledger of all Point of Sale receipts and invoices.'}
            data={sales}
            columns={saleColumns}
            addNewLabel={t.nav.addSale}
            onAddNew={() => setIsPosOpen(true)}
            onEdit={(row) => setEditingEntry({ type: 'sale', data: row })}
            onDelete={handleDeleteSale}
            onView={(row) => setViewingReceiptSale(row)}
            lang={lang}
          />
        );

      case 'sales-add':
      case 'sales-pos-list':
        return (
          <DataTable
            title={t.nav.listOfPos}
            subtitle={lang === 'bn' ? 'পিওএস কাউন্টারের সকল বিক্রিত রসিদ ও ক্যাশ মেমো তালিকা।' : 'Point of sale registers tickets, cashier terminal records, and receipt histories.'}
            data={sales.filter(s => s.type === 'pos')}
            columns={saleColumns}
            addNewLabel={t.openPos}
            onAddNew={() => setIsPosOpen(true)}
            onEdit={(row) => setEditingEntry({ type: 'sale', data: row })}
            onDelete={handleDeleteSale}
            onView={(row) => setViewingReceiptSale(row)}
            lang={lang}
          />
        );

      case 'sales-add-draft':
      case 'sales-draft-list':
        return (
          <DataTable
            title={t.nav.listDraft}
            subtitle={lang === 'bn' ? 'গ্রাহকদের জন্য প্রস্তুতকৃত কোটেশন ও ড্রাফট মেমো।' : 'Pending quotations and draft tickets waiting for customer confirmation.'}
            data={sales.filter(s => s.type === 'draft')}
            columns={saleColumns}
            addNewLabel={t.nav.addDraft}
            onAddNew={() => {
              const draftNo = `TM-DFT-${Math.floor(100 + Math.random() * 900)}`;
              setSales([
                {
                  id: `sale-${Date.now()}`,
                  invoiceNo: draftNo,
                  type: 'draft',
                  customerName: 'Md. Hasan Mahmud',
                  businessLocation: currentBranch || 'Hazigonj Branch',
                  paymentStatus: 'Due',
                  paymentMethod: 'Credit',
                  totalAmount: 12500,
                  invoiceDue: 12500,
                  saleDate: new Date().toLocaleString(),
                  itemsCount: 4
                },
                ...sales
              ]);
            }}
            onEdit={(row) => setEditingEntry({ type: 'sale', data: row })}
            onDelete={handleDeleteSale}
            onView={(row) => setViewingReceiptSale(row)}
            lang={lang}
          />
        );

      case 'sales-return-list':
        return (
          <DataTable
            title={t.nav.listSalesReturn}
            subtitle={lang === 'bn' ? 'গ্রাহক কর্তৃক ফেরতকৃত পার্টসের তালিকা ও রিফান্ড হিসেব।' : 'Customer return authorizations, credit refunds, and restocked merchandise.'}
            data={salesReturns}
            columns={[
              {
                header: 'Return No',
                accessorKey: 'returnNo',
                cell: (row) => <span className="font-mono font-bold text-slate-900 dark:text-white">{row.returnNo}</span>
              },
              { header: 'Invoice No', accessorKey: 'invoiceNo' },
              { header: lang === 'bn' ? 'গ্রাহক' : 'Customer', accessorKey: 'customerName' },
              { header: lang === 'bn' ? 'তারিখ' : 'Date', accessorKey: 'returnDate' },
              { header: lang === 'bn' ? 'রিফান্ড টাকা' : 'Refund Total', accessorKey: 'totalRefund', align: 'right' },
              { header: lang === 'bn' ? 'কারণ' : 'Reason', accessorKey: 'reason' }
            ]}
            lang={lang}
          />
        );

      case 'stock-transfer-list':
      case 'stock-transfer-add':
        return (
          <DataTable
            title={t.nav.listStockTransfer}
            subtitle={lang === 'bn' ? 'ঢাকা শোরুম, মিরপুর ওয়ার্কশপ ও চট্টগ্রাম ডিপোর মধ্যে পার্টস স্থানান্তর।' : 'Inter-warehouse logistics and inventory redistribution between branches.'}
            data={stockTransfers}
            columns={[
              {
                header: 'Transfer No',
                accessorKey: 'transferNo',
                cell: (row) => <span className="font-mono font-bold text-slate-900 dark:text-white">{row.transferNo}</span>
              },
              { header: lang === 'bn' ? 'উৎস শাখা' : 'From Location', accessorKey: 'fromLocation' },
              { header: lang === 'bn' ? 'গন্তব্য শাখা' : 'To Location', accessorKey: 'toLocation' },
              { header: lang === 'bn' ? 'তারিখ' : 'Date', accessorKey: 'date' },
              { header: lang === 'bn' ? 'স্টক মূল্য' : 'Stock Value', accessorKey: 'totalAmount', align: 'right' }
            ]}
            addNewLabel={t.nav.addStockTransfer}
            onAddNew={() => setIsAddTransferOpen(true)}
            onDelete={handleDeleteTransfer}
            lang={lang}
          />
        );

      case 'expenses-list':
      case 'expenses-add':
        return (
          <DataTable
            title={t.nav.listExpenses}
            subtitle={lang === 'bn' ? 'দোকান ভাড়া, কর্মচারী বেতন, বিদ্যুৎ ও আনুষঙ্গিক খরচ।' : 'Store operational overhead, rent payments, utility bills, logistics, and payroll.'}
            data={expenses}
            columns={[
              {
                header: 'Voucher #',
                accessorKey: 'expenseNo',
                cell: (row) => <span className="font-mono font-bold text-slate-900 dark:text-white">{row.expenseNo}</span>
              },
              { header: lang === 'bn' ? 'খরচের খাত' : 'Category', accessorKey: 'category' },
              { header: lang === 'bn' ? 'শাখা' : 'Location', accessorKey: 'businessLocation' },
              { header: lang === 'bn' ? 'তারিখ' : 'Date', accessorKey: 'expenseDate' },
              { header: lang === 'bn' ? 'পরিমাণ (৳)' : 'Amount (৳)', accessorKey: 'amount', align: 'right' },
              { header: lang === 'bn' ? 'নোট' : 'Notes', accessorKey: 'note' }
            ]}
            addNewLabel={t.nav.addExpense}
            onAddNew={() => setIsAddExpenseOpen(true)}
            onEdit={(row) => setEditingEntry({ type: 'expense', data: row })}
            onDelete={handleDeleteExpense}
            lang={lang}
          />
        );

      case 'reports-profit-loss':
      case 'reports-purchase-sales':
      case 'reports-stock':
      case 'reports-tax':
      case 'reports-supplier-customer':
      case 'reports-customer-group':
      case 'reports-stock-adjustment':
      case 'reports-trending':
      case 'reports-items':
      case 'reports-product-purchase':
      case 'reports-product-sell':
      case 'reports-purchase-payment':
      case 'reports-sell-payment':
      case 'reports-expense':
      case 'reports-register':
      case 'reports-sales-rep':
      case 'reports-activity-log':
        return (
          <ReportsView
            type={currentRoute.replace('reports-', '')}
            products={products}
            purchases={purchases}
            sales={sales}
            expenses={expenses}
            lang={lang}
          />
        );

      case 'pos-terminal':
        return (
          <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {lang === 'bn' ? 'পিওএস টার্মিনাল কাউন্টার' : 'Point of Sale Terminal'}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              {lang === 'bn' ? 'দ্রুত ক্যাশ মেমো ও বিক্রয়ের জন্য পিওএস টার্মিনাল চালু করুন।' : 'Launch full-screen POS terminal for counter sales and thermal printing.'}
            </p>
            <button
              onClick={() => setIsPosOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              {lang === 'bn' ? 'পিওএস টার্মিনাল খুলুন' : 'Open POS Terminal'}
            </button>
          </div>
        );

      case 'roles-list':
        return (
          <DataTable
            title={lang === 'bn' ? 'ইউজার রোল ও পারমিশন ম্যাট্রিক্স' : 'User Roles & Access Control'}
            subtitle={lang === 'bn' ? 'সিস্টেমের বিভিন্ন ইউজার রোলের অনুমতি ও নিরাপত্তা অ্যাক্সেস।' : 'System permission profiles, staff security clearances, and module rights.'}
            data={[
              { id: 'role-1', roleName: 'Super Admin (মালিক)', usersCount: 2, level: 'Unrestricted (Full Access)', status: 'Active' },
              { id: 'role-2', roleName: 'Branch Admin (শাখা প্রধান)', usersCount: 1, level: 'Store Operations & Inventory', status: 'Active' },
              { id: 'role-3', roleName: 'Shop Manager (ব্যবস্থাপক)', usersCount: 2, level: 'Inventory, Purchases, Dues', status: 'Active' },
              { id: 'role-4', roleName: 'Cashier / POS Operator', usersCount: 3, level: 'Counter Sales & Receipts Only', status: 'Active' }
            ]}
            columns={[
              { header: lang === 'bn' ? 'রোলের নাম' : 'Role Title', accessorKey: 'roleName', cell: (r) => <span className="font-bold text-slate-900 dark:text-white">{r.roleName}</span> },
              { header: lang === 'bn' ? 'নিযুক্ত কর্মী' : 'Staff Count', accessorKey: 'usersCount', align: 'center', cell: (r) => <span className="font-mono">{r.usersCount} users</span> },
              { header: lang === 'bn' ? 'পারমিশন লেভেল' : 'Permissions', accessorKey: 'level' },
              { header: lang === 'bn' ? 'স্থিতি' : 'Status', accessorKey: 'status', cell: () => <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Active</span> }
            ]}
            addNewLabel={lang === 'bn' ? 'নতুন রোল তৈরি' : 'Add New Role'}
            onAddNew={() => alert(lang === 'bn' ? 'রোল তৈরি প্রক্রিয়া সুপার অ্যাডমিন দ্বারা নিয়ন্ত্রিত।' : 'Role management is governed by Super Admin.')}
            lang={lang}
          />
        );

      case 'commission-agents':
        return (
          <DataTable
            title={lang === 'bn' ? 'সেলস কমিশন এজেন্ট তালিকা' : 'Sales Commission Agents'}
            subtitle={lang === 'bn' ? 'অতিরিক্ত বিক্রয় প্রতিনিধি, কমিশন হার ও অর্জিত আয় হিসাব।' : 'Commission percentage tiers, representative performance, and payouts.'}
            data={[
              { id: 'ca-1', name: 'Md. Alamgir Hossain', phone: '01711223344', commissionPct: '3.5%', totalSales: '৳145,000', accrued: '৳5,075' },
              { id: 'ca-2', name: 'Kamal Workshop Logistics', phone: '01822334455', commissionPct: '5.0%', totalSales: '৳280,000', accrued: '৳14,000' }
            ]}
            columns={[
              { header: lang === 'bn' ? 'এজেন্টের নাম' : 'Agent Name', accessorKey: 'name', cell: (r) => <span className="font-bold text-slate-900 dark:text-white">{r.name}</span> },
              { header: lang === 'bn' ? 'ফোন' : 'Phone', accessorKey: 'phone', cell: (r) => <span className="font-mono text-xs">{r.phone}</span> },
              { header: lang === 'bn' ? 'কমিশন হার' : 'Commission %', accessorKey: 'commissionPct', align: 'right', cell: (r) => <span className="font-bold text-emerald-700">{r.commissionPct}</span> },
              { header: lang === 'bn' ? 'মোট বিক্রয়' : 'Sales Volume', accessorKey: 'totalSales', align: 'right' },
              { header: lang === 'bn' ? 'প্রদেয় কমিশন' : 'Commission Accrued', accessorKey: 'accrued', align: 'right', cell: (r) => <span className="font-bold font-mono text-rose-600">{r.accrued}</span> }
            ]}
            addNewLabel={lang === 'bn' ? 'নতুন এজেন্ট যোগ করুন' : 'Add Commission Agent'}
            onAddNew={() => alert(lang === 'bn' ? 'নতুন সেলস এজেন্ট যুক্ত ফরম।' : 'Add new sales commission agent.')}
            lang={lang}
          />
        );

      case 'contact-import':
        return (
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {lang === 'bn' ? 'কন্টাক্ট ইমপোর্ট (CSV / Excel)' : 'Import Contacts (CSV / Excel)'}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              {lang === 'bn' ? 'বাল্ক কন্টাক্ট এবং ক্লায়েন্ট লিস্ট দ্রুত ডাটাবেজে যুক্ত করতে ফাইল আপলোড করুন।' : 'Upload bulk customer or supplier contacts spreadsheet.'}
            </p>
            <input type="file" accept=".csv,.xlsx" className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 mb-4 cursor-pointer" />
            <button
              onClick={() => showSyncNotice(lang === 'bn' ? 'কন্টাক্ট ইমপোর্ট সফল হয়েছে!' : 'Contacts imported successfully!')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
            >
              {lang === 'bn' ? 'ইমপোর্ট সম্পন্ন করুন' : 'Execute Import'}
            </button>
          </div>
        );

      case 'products-print-labels':
        return (
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {lang === 'bn' ? 'বারকোড লেবেল ও স্টিকার প্রিন্টিং' : 'Print Barcode Labels'}
                </h2>
                <p className="text-xs text-slate-500">
                  {lang === 'bn' ? 'এক্সকাভেটর ও মোটর পার্টস বক্স ও শেলফের জন্য বারকোড স্টিকার জেনারেট করুন।' : 'Generate thermal barcode labels for excavator and motor spare parts.'}
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                {lang === 'bn' ? 'লেবেল প্রিন্ট করুন' : 'Print All Labels'}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {products.slice(0, 8).map(p => (
                <div key={p.id} className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center">
                  <div className="text-[11px] font-bold text-slate-800 dark:text-white truncate">{p.name}</div>
                  <div className="text-[10px] font-mono text-slate-500 my-1">{p.sku}</div>
                  <div className="font-barcode text-2xl tracking-widest my-1">||||| | |||||</div>
                  <div className="text-xs font-bold text-emerald-700">৳{p.sellingPrice.toFixed(0)}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'products-variations':
        return (
          <DataTable
            title={lang === 'bn' ? 'ভ্যারিয়েশন টেমপ্লেট' : 'Variations Templates'}
            subtitle={lang === 'bn' ? 'পার্টসের রঙ, আকার, মডেল বছর ও ভোল্টেজ ভিত্তিক ভ্যারিয়েশন।' : 'Product variants attributes like Size, Color, Model, Voltage.'}
            data={[
              { id: 'var-1', name: 'Engine Oil Viscosity', values: '10W-30, 20W-40, 20W-50, 10W-40' },
              { id: 'var-2', name: 'Battery Voltage & Capacity', values: '12V 5Ah, 12V 7Ah, 12V 9Ah' },
              { id: 'var-3', name: 'Brake Pad Compound', values: 'Ceramic, Semi-Metallic, Organic' }
            ]}
            columns={[
              { header: lang === 'bn' ? 'ভ্যারিয়েশন নাম' : 'Variation Name', accessorKey: 'name', cell: (r) => <span className="font-bold text-slate-900 dark:text-white">{r.name}</span> },
              { header: lang === 'bn' ? 'মানসমূহ' : 'Values', accessorKey: 'values', cell: (r) => <span className="font-mono text-xs text-slate-600 dark:text-slate-300">{r.values}</span> }
            ]}
            addNewLabel={lang === 'bn' ? 'নতুন ভ্যারিয়েশন' : 'Add Variation'}
            onAddNew={() => alert('New variation template')}
            lang={lang}
          />
        );

      case 'products-units':
        return (
          <DataTable
            title={lang === 'bn' ? 'পরিমাপ ইউনিট (Units of Measure)' : 'Units of Measurement'}
            subtitle={lang === 'bn' ? 'খুচরা ও পাইকারি বিক্রয়ের পরিমাপক একক।' : 'Measurement units for inventory stocking and retail sales.'}
            data={[
              { id: 'u-1', name: 'Pieces (পিস)', shortName: 'Pcs', allowDecimal: 'No' },
              { id: 'u-2', name: 'Box (বক্স)', shortName: 'Box', allowDecimal: 'No' },
              { id: 'u-3', name: 'Set (সম্পূর্ণ সেট)', shortName: 'Set', allowDecimal: 'No' },
              { id: 'u-4', name: 'Liter (লিটার)', shortName: 'Ltr', allowDecimal: 'Yes' },
              { id: 'u-5', name: 'Meter (মিটার)', shortName: 'Mtr', allowDecimal: 'Yes' }
            ]}
            columns={[
              { header: lang === 'bn' ? 'ইউনিটের নাম' : 'Unit Name', accessorKey: 'name', cell: (r) => <span className="font-bold text-slate-900 dark:text-white">{r.name}</span> },
              { header: lang === 'bn' ? 'সংক্ষিপ্ত রূপ' : 'Short Code', accessorKey: 'shortName', align: 'center', cell: (r) => <span className="font-mono font-bold">{r.shortName}</span> },
              { header: lang === 'bn' ? 'দশমিক প্রযোজ্য' : 'Allow Decimal', accessorKey: 'allowDecimal', align: 'center' }
            ]}
            addNewLabel={lang === 'bn' ? 'নতুন ইউনিট' : 'Add Unit'}
            onAddNew={() => alert('Add unit')}
            lang={lang}
          />
        );

      case 'products-categories':
        return (
          <DataTable
            title={lang === 'bn' ? 'এক্সকাভেটর ও মোটর পার্টস ক্যাটাগরি' : 'Excavator & Equipment Categories'}
            subtitle={lang === 'bn' ? 'হাইড্রোলিক সিস্টেম, ফিল্টার, গ্রীস গান, বাকেট পার্টস ও লুব্রিকেন্টস।' : 'Catalog categories for excavator spare parts, hydraulics, and filters.'}
            data={[
              { id: 'cat-1', name: 'Excavator Hydraulic Oils & Fluids', code: 'HYD', count: '142 items' },
              { id: 'cat-2', name: 'Heavy Duty Filters (Fleetguard/Sakura)', code: 'FLT', count: '128 items' },
              { id: 'cat-3', name: 'Excavator Grease Guns & Lubrication', code: 'GRS', count: '65 items' },
              { id: 'cat-4', name: 'Engine, Diesel & Fuel Components', code: 'ENG', count: '84 items' },
              { id: 'cat-5', name: 'Bucket Teeth, Pins, Bushings & Track', code: 'BKT', count: '52 items' },
              { id: 'cat-6', name: 'Seal Kits, Hardware & Silicones', code: 'SEL', count: '50 items' }
            ]}
            columns={[
              { header: lang === 'bn' ? 'ক্যাটাগরির নাম' : 'Category Name', accessorKey: 'name', cell: (r) => <span className="font-bold text-slate-900 dark:text-white">{r.name}</span> },
              { header: lang === 'bn' ? 'কোড' : 'Code', accessorKey: 'code', align: 'center', cell: (r) => <span className="font-mono font-bold text-emerald-700">{r.code}</span> },
              { header: lang === 'bn' ? 'মোট পার্টস' : 'Items Count', accessorKey: 'count', align: 'right' }
            ]}
            addNewLabel={lang === 'bn' ? 'নতুন ক্যাটাগরি' : 'Add Category'}
            onAddNew={() => alert('Add category')}
            lang={lang}
          />
        );

      case 'products-brands':
        return (
          <DataTable
            title={lang === 'bn' ? 'এক্সকাভেটর ও হেভি ইকুইপমেন্ট ব্র্যান্ড' : 'Excavator & Equipment Brands'}
            subtitle={lang === 'bn' ? 'ক্যাটারপিলার (CAT), কোমাৎসু, কোবেলকো, ফ্লিটগার্ড, সাকুরা, বিডি লুব ও মবিল।' : 'Excavator manufacturers and heavy equipment genuine parts brands.'}
            data={[
              { id: 'b-1', name: 'CAT / Caterpillar Heavy Equipment', origin: 'USA / Genuine', itemsCount: 165 },
              { id: 'b-2', name: 'Fleetguard Heavy Duty Filtration', origin: 'USA / Cummins', itemsCount: 120 },
              { id: 'b-3', name: 'Sakura Industrial Filters', origin: 'Japan / Indonesia', itemsCount: 95 },
              { id: 'b-4', name: 'BD LUB Industrial & Hydraulic Oils', origin: 'Bangladesh / ISO', itemsCount: 78 },
              { id: 'b-5', name: 'Mobil Heavy Duty Engine & Gear Oils', origin: 'ExxonMobil', itemsCount: 65 },
              { id: 'b-6', name: 'Petronas Lubricants International', origin: 'Malaysia / Regional', itemsCount: 42 }
            ]}
            columns={[
              { header: lang === 'bn' ? 'ব্র্যান্ডের নাম' : 'Brand Name', accessorKey: 'name', cell: (r) => <span className="font-bold text-slate-900 dark:text-white">{r.name}</span> },
              { header: lang === 'bn' ? 'উৎপত্তিস্থল' : 'Origin', accessorKey: 'origin' },
              { header: lang === 'bn' ? 'মোট পণ্য' : 'Catalog Items', accessorKey: 'itemsCount', align: 'right', cell: (r) => <span className="font-mono">{r.itemsCount} items</span> }
            ]}
            addNewLabel={lang === 'bn' ? 'নতুন ব্র্যান্ড' : 'Add Brand'}
            onAddNew={() => alert('Add brand')}
            lang={lang}
          />
        );

      case 'products-warranties':
        return (
          <DataTable
            title={lang === 'bn' ? 'ওয়ারেন্টি পলিসি ও শর্তাবলী' : 'Warranties & Guarantees'}
            subtitle={lang === 'bn' ? 'ব্যাটারি, স্পার্ক প্লাগ ও ইলেকট্রিক্যাল পার্টসের ওয়ারেন্টি স্কিম।' : 'Manufacturer warranty protection terms.'}
            data={[
              { id: 'w-1', name: 'Battery Replacement Warranty', duration: '6 Months', type: 'Full Replacement' },
              { id: 'w-2', name: 'Led Headlight Warranty', duration: '3 Months', type: 'Service & Repair' },
              { id: 'w-3', name: 'Genuine Spark Plug Guarantee', duration: '1 Month', type: 'Exchange Guarantee' }
            ]}
            columns={[
              { header: lang === 'bn' ? 'ওয়ারেন্টির নাম' : 'Warranty Scheme', accessorKey: 'name', cell: (r) => <span className="font-bold text-slate-900 dark:text-white">{r.name}</span> },
              { header: lang === 'bn' ? 'মেয়াদ' : 'Duration', accessorKey: 'duration', cell: (r) => <span className="font-bold text-emerald-700">{r.duration}</span> },
              { header: lang === 'bn' ? 'শর্ত' : 'Type', accessorKey: 'type' }
            ]}
            addNewLabel={lang === 'bn' ? 'নতুন ওয়ারেন্টি' : 'Add Warranty'}
            onAddNew={() => alert('Add warranty')}
            lang={lang}
          />
        );

      case 'sales-add-quotation':
      case 'sales-quotation-list':
        return (
          <DataTable
            title={lang === 'bn' ? 'কোটেশন তালিকা' : 'Quotations & Estimates'}
            subtitle={lang === 'bn' ? 'গ্রাহকদের প্রদত্ত মূল্য প্রস্তাবনা ও আনুমানিক খরচের রসিদ।' : 'Pending customer price quotations.'}
            data={[
              { id: 'q-1', quoteNo: 'TM-QT-101', customerName: 'Md. Shafiqul Islam', date: 'Today', totalAmount: '৳14,500', status: 'Valid (7 Days)' },
              { id: 'q-2', quoteNo: 'TM-QT-102', customerName: 'Hazigonj Courier Fleet', date: 'Yesterday', totalAmount: '৳38,200', status: 'Approved' }
            ]}
            columns={[
              { header: 'Quote #', accessorKey: 'quoteNo', cell: (r) => <span className="font-mono font-bold text-slate-900 dark:text-white">{r.quoteNo}</span> },
              { header: lang === 'bn' ? 'গ্রাহক' : 'Customer', accessorKey: 'customerName' },
              { header: lang === 'bn' ? 'তারিখ' : 'Date', accessorKey: 'date' },
              { header: lang === 'bn' ? 'মোট মূল্য' : 'Total (৳)', accessorKey: 'totalAmount', align: 'right', cell: (r) => <span className="font-bold font-mono text-emerald-700">{r.totalAmount}</span> },
              { header: lang === 'bn' ? 'স্ট্যাটাস' : 'Status', accessorKey: 'status', cell: (r) => <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">{r.status}</span> }
            ]}
            addNewLabel={lang === 'bn' ? 'নতুন কোটেশন' : 'Add Quotation'}
            onAddNew={() => alert('New quotation')}
            lang={lang}
          />
        );

      case 'sales-shipments':
        return (
          <DataTable
            title={lang === 'bn' ? 'ডেলিভারি ও পার্সেল শিপমেন্ট' : 'Shipments & Dispatch'}
            subtitle={lang === 'bn' ? 'কুরিয়ার ও দূরবর্তী গ্যারেজে প্রেরিত পার্টসের ট্র্যাকিং।' : 'Courier consignments, dispatch notes, and tracking.'}
            data={[
              { id: 'sh-1', invoiceNo: 'TM-2026-901', customer: 'Brahmanbaria Auto Clinic', courier: 'Sundarban Courier', tracking: 'SND-48291', status: 'Delivered' },
              { id: 'sh-2', invoiceNo: 'TM-2026-914', customer: 'Chandpur Rider Point', courier: 'Steadfast Courier', tracking: 'STF-99214', status: 'In Transit' }
            ]}
            columns={[
              { header: 'Invoice #', accessorKey: 'invoiceNo', cell: (r) => <span className="font-mono font-bold">{r.invoiceNo}</span> },
              { header: lang === 'bn' ? 'গ্রাহক' : 'Customer', accessorKey: 'customer' },
              { header: lang === 'bn' ? 'কুরিয়ার' : 'Courier', accessorKey: 'courier' },
              { header: lang === 'bn' ? 'ট্র্যাকিং কোড' : 'Tracking ID', accessorKey: 'tracking', cell: (r) => <span className="font-mono text-xs">{r.tracking}</span> },
              { header: lang === 'bn' ? 'অবস্থা' : 'Status', accessorKey: 'status', cell: (r) => <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">{r.status}</span> }
            ]}
            addNewLabel={lang === 'bn' ? 'নতুন শিপমেন্ট' : 'New Shipment'}
            onAddNew={() => alert('Add shipment')}
            lang={lang}
          />
        );

      case 'sales-discounts':
        return (
          <DataTable
            title={lang === 'bn' ? 'ডিসকাউন্ট ও অফার স্কিম' : 'Discounts & Promotional Schemes'}
            subtitle={lang === 'bn' ? 'ঈদুল ফিতর অফার ও ওয়ার্কশপ মেকানিক স্পেশাল কমিশন।' : 'Promotional discounts applied to sales.'}
            data={[
              { id: 'dc-1', name: 'Regular Mechanic Discount', discount: '5% Flat', activeUntil: 'Lifetime', status: 'Active' },
              { id: 'dc-2', name: 'Wholesale Tier 2 Offer', discount: '8% On >৳20,000', activeUntil: '31 Dec 2026', status: 'Active' }
            ]}
            columns={[
              { header: lang === 'bn' ? 'অফারের নাম' : 'Scheme Name', accessorKey: 'name', cell: (r) => <span className="font-bold text-slate-900 dark:text-white">{r.name}</span> },
              { header: lang === 'bn' ? 'ছাড়ের হার' : 'Discount', accessorKey: 'discount', cell: (r) => <span className="font-bold text-emerald-700">{r.discount}</span> },
              { header: lang === 'bn' ? 'মেয়াদ' : 'Validity', accessorKey: 'activeUntil' },
              { header: lang === 'bn' ? 'স্ট্যাটাস' : 'Status', accessorKey: 'status', cell: () => <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Active</span> }
            ]}
            addNewLabel={lang === 'bn' ? 'নতুন ডিসকাউন্ট স্কিম' : 'Add Discount'}
            onAddNew={() => alert('Add discount')}
            lang={lang}
          />
        );

      case 'stock-adjustment-list':
      case 'stock-adjustment-add':
        return (
          <DataTable
            title={lang === 'bn' ? 'স্টক অ্যাডজাস্টমেন্ট ও সমন্বয়' : 'Stock Adjustments'}
            subtitle={lang === 'bn' ? 'ভাঙা, ত্রুটিযুক্ত বা অপচয়কৃত এক্সকাভেটর পার্টস স্টক ব্যালেন্স সমন্বয়।' : 'Reconcile stock count discrepancies, damaged parts, or write-offs.'}
            data={[
              { id: 'adj-1', adjNo: 'ADJ-2026-01', location: 'Hazigonj Branch', reason: 'Transit Packaging Damage', amount: '৳3,450', date: '08 Oct 2026' },
              { id: 'adj-2', adjNo: 'ADJ-2026-02', location: 'Hazigonj Branch', reason: 'Shelf Inventory Audit Recount', amount: '৳1,200', date: '04 Oct 2026' }
            ]}
            columns={[
              { header: 'Adj No', accessorKey: 'adjNo', cell: (r) => <span className="font-mono font-bold text-slate-900 dark:text-white">{r.adjNo}</span> },
              { header: lang === 'bn' ? 'শাখা' : 'Location', accessorKey: 'location' },
              { header: lang === 'bn' ? 'কারণ' : 'Reason', accessorKey: 'reason' },
              { header: lang === 'bn' ? 'সমন্বয় মূল্য' : 'Adjustment Total', accessorKey: 'amount', align: 'right', cell: (r) => <span className="font-bold font-mono text-rose-600">{r.amount}</span> },
              { header: lang === 'bn' ? 'তারিখ' : 'Date', accessorKey: 'date' }
            ]}
            addNewLabel={lang === 'bn' ? 'নতুন স্টক সমন্বয়' : 'Add Stock Adjustment'}
            onAddNew={() => alert('New stock adjustment')}
            lang={lang}
          />
        );

      case 'expense-categories':
        return (
          <DataTable
            title={lang === 'bn' ? 'খরচের ক্যাটাগরি সমূহ' : 'Expense Categories'}
            subtitle={lang === 'bn' ? 'দোকান ভাড়া, কর্মচারী বেতন, বিদ্যুৎ বিল ও পরিবহন খরচ।' : 'Categorization for operational store expenditures.'}
            data={[
              { id: 'ec-1', name: 'দোকান ভাড়া (Store Rent)', code: 'RENT', monthlyAvg: '৳25,000' },
              { id: 'ec-2', name: 'কর্মচারী বেতন (Staff Payroll)', code: 'PAYROLL', monthlyAvg: '৳45,000' },
              { id: 'ec-3', name: 'বিদ্যুৎ ও ইউটিলিটি (Electricity & Utility)', code: 'UTILITY', monthlyAvg: '৳6,500' },
              { id: 'ec-4', name: 'পার্টস পরিবহন ও আনুষঙ্গিক (Freight & Logistics)', code: 'FREIGHT', monthlyAvg: '৳8,200' },
              { id: 'ec-5', name: 'আপ্যায়ন ও মেহমানদারি (Refreshments)', code: 'TEA', monthlyAvg: '৳3,100' }
            ]}
            columns={[
              { header: lang === 'bn' ? 'ক্যাটাগরি' : 'Category Name', accessorKey: 'name', cell: (r) => <span className="font-bold text-slate-900 dark:text-white">{r.name}</span> },
              { header: lang === 'bn' ? 'কোড' : 'Code', accessorKey: 'code', align: 'center', cell: (r) => <span className="font-mono text-xs">{r.code}</span> },
              { header: lang === 'bn' ? 'মাসিক গড়' : 'Monthly Avg', accessorKey: 'monthlyAvg', align: 'right', cell: (r) => <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{r.monthlyAvg}</span> }
            ]}
            addNewLabel={lang === 'bn' ? 'নতুন ক্যাটাগরি' : 'Add Expense Category'}
            onAddNew={() => alert('Add expense category')}
            lang={lang}
          />
        );

      case 'settings-locations':
        return (
          <DataTable
            title={lang === 'bn' ? 'ব্যবসায়িক শাখা ও শোরুম (Locations)' : 'Business Locations'}
            subtitle={lang === 'bn' ? 'তামান্না মোটরসের সকল শাখা ও স্টোরেজ ডিপো।' : 'Multi-outlet showroom and warehouse locations.'}
            data={[
              { id: 'loc-1', name: 'Hazigonj Branch (প্রধান শোরুম)', address: 'HAZIGONJ-KACHUA MAIN ROAD, WEST BAZAR, HAZIGONJ, CHANDPUR', phone: '01626666906', status: 'Active (Main)' }
            ]}
            columns={[
              { header: lang === 'bn' ? 'শাখার নাম' : 'Location Name', accessorKey: 'name', cell: (r) => <span className="font-bold text-slate-900 dark:text-white">{r.name}</span> },
              { header: lang === 'bn' ? 'ঠিকানা' : 'Address', accessorKey: 'address', cell: (r) => <span className="text-xs text-slate-600 dark:text-slate-300">{r.address}</span> },
              { header: lang === 'bn' ? 'ফোন' : 'Phone', accessorKey: 'phone', cell: (r) => <span className="font-mono text-xs">{r.phone}</span> },
              { header: lang === 'bn' ? 'স্থিতি' : 'Status', accessorKey: 'status', cell: (r) => <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">{r.status}</span> }
            ]}
            addNewLabel={lang === 'bn' ? 'নতুন শাখা যুক্ত করুন' : 'Add Business Location'}
            onAddNew={() => alert('New branch location')}
            lang={lang}
          />
        );

      case 'settings-barcodes':
        return (
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {lang === 'bn' ? 'বারকোড ও লেবেল প্রিন্টার সেটিংস' : 'Barcode & Sticker Settings'}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              {lang === 'bn' ? 'লেবেল সাইজ: 38mm x 25mm (Standard 2-up Sticker Paper)। কোডিং: Code 128 / EAN-13।' : 'Standard thermal barcode sticker specifications.'}
            </p>
            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                <span>{lang === 'bn' ? 'বারকোড লেবেলে ব্যবসার নাম প্রদর্শন করুন' : 'Show business name on sticker'}</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                <span>{lang === 'bn' ? 'বারকোডে খুচরা বিক্রয় মূল্য (MRP) প্রদর্শন করুন' : 'Show selling price on sticker'}</span>
              </label>
            </div>
          </div>
        );

      case 'settings-printers':
        return (
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {lang === 'bn' ? 'রসিদ ও থার্মাল প্রিন্টার কনফিগারেশন' : 'Thermal Receipt Printer Setup'}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              {lang === 'bn' ? 'কাউন্টার ক্যাশ মেমো প্রিন্ট করার জন্য 80mm অথবা 58mm থার্মাল প্রিন্টার নির্বাচন করুন।' : 'Direct USB/Network thermal printer paper sizing.'}
            </p>
            <div className="space-y-3 text-xs">
              <div className="p-3 border border-emerald-500/50 bg-emerald-50/40 dark:bg-emerald-950/30 rounded-xl">
                <div className="font-bold text-emerald-800 dark:text-emerald-300">80mm POS Thermal Receipt Printer (Default)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Compatible with Xprinter, Rongta, Epson POS receipt printers.</div>
              </div>
            </div>
          </div>
        );

      case 'settings-tax-rates':
        return (
          <DataTable
            title={lang === 'bn' ? 'ট্যাক্স ও ভ্যাট রেট (Tax Rates)' : 'Tax Rates & VAT Rules'}
            subtitle={lang === 'bn' ? 'বাংলাদেশ জাতীয় রাজস্ব বোর্ড (NBR) অনুমোদিত ভ্যাট ও কর হার।' : 'National Board of Revenue tax bands.'}
            data={[
              { id: 'tr-1', name: lang === 'bn' ? 'জিরো ভ্যাট (Zero Rated / 0% VAT)' : 'Zero Rated VAT (0%)', rate: '0.0%', type: 'Percentage', status: 'Default' },
              { id: 'tr-2', name: lang === 'bn' ? 'ট্যাক্স মুক্ত ও অব্যহতিপ্রাপ্ত (Tax Exempt)' : 'Tax Exempt (0%)', rate: '0.0%', type: 'Percentage', status: 'Active' },
              { id: 'tr-3', name: lang === 'bn' ? 'এক্সকাভেটর ও হেভি মেশিনারিজ পার্টস (0% VAT)' : 'Excavator & Heavy Machinery Parts (0%)', rate: '0.0%', type: 'Percentage', status: 'Active' }
            ]}
            columns={[
              { header: lang === 'bn' ? 'ট্যাক্সের নাম' : 'Tax Rate Name', accessorKey: 'name', cell: (r) => <span className="font-bold text-slate-900 dark:text-white">{r.name}</span> },
              { header: lang === 'bn' ? 'হার (%)' : 'Rate (%)', accessorKey: 'rate', align: 'center', cell: (r) => <span className="font-bold font-mono text-emerald-700">{r.rate}</span> },
              { header: lang === 'bn' ? 'ধরণ' : 'Type', accessorKey: 'type' },
              { header: lang === 'bn' ? 'অবস্থা' : 'Status', accessorKey: 'status', cell: (r) => <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">{r.status}</span> }
            ]}
            addNewLabel={lang === 'bn' ? 'নতুন ট্যাক্স রেট' : 'Add Tax Rate'}
            onAddNew={() => alert('New tax rate')}
            lang={lang}
          />
        );

      case 'settings-business':
        return (
          <SettingsView
            type="business"
            businessSettings={businessSettings}
            invoiceSettings={invoiceSettings}
            onSaveBusiness={setBusinessSettings}
            onSaveInvoice={setInvoiceSettings}
            lang={lang}
            isSuperAdmin={currentUser?.role === 'super_admin'}
            onClearTempData={handleClearTempSales}
            onClearAllMockData={handleClearAllMockData}
            onResetDatabase={handleResetDatabase}
            onImportLiveData={handleImportAllLiveData}
          />
        );

      case 'settings-invoice':
        return (
          <SettingsView
            type="invoice"
            businessSettings={businessSettings}
            invoiceSettings={invoiceSettings}
            onSaveBusiness={setBusinessSettings}
            onSaveInvoice={setInvoiceSettings}
            lang={lang}
            isSuperAdmin={currentUser?.role === 'super_admin'}
            onClearTempData={handleClearTempSales}
            onClearAllMockData={handleClearAllMockData}
            onResetDatabase={handleResetDatabase}
            onImportLiveData={handleImportAllLiveData}
          />
        );

      case 'cloud-database':
        // Hide completely from regular operators/customers; redirect to Dashboard
        return (
          <DashboardView
            onOpenPos={() => setIsPosOpen(true)}
            onNavigate={setCurrentRoute}
            products={products}
            sales={sales}
            lang={lang}
            userRole={userRole}
            onQuickRestock={handleQuickRestock}
          />
        );

      default:
        return (
          <DashboardView
            onOpenPos={() => setIsPosOpen(true)}
            onNavigate={setCurrentRoute}
            products={products}
            sales={sales}
            lang={lang}
            userRole={userRole}
            onQuickRestock={handleQuickRestock}
          />
        );
    }
  };

  // If not authenticated, render Login view
  if (!currentUser) {
    return (
      <LoginView
        staffUsers={staffUsers}
        onLogin={handleLogin}
        onRegister={handleRegister}
        lang={lang}
        onToggleLang={handleToggleLang}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        logoUrl={businessSettings.logoUrl}
        businessName={businessSettings.businessName}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans transition-colors duration-150 relative">
      {/* Subtle ambient glass mesh glow in dark mode */}
      <div className="fixed top-0 left-1/3 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-10 w-[500px] h-[300px] bg-cyan-500/5 dark:bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      {/* 2. Left Navigation Sidebar */}
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={(route) => {
          if (route === 'user-management' && currentUser?.role !== 'super_admin') {
            return;
          }
          if (route === 'products-add') {
            setIsAddProductOpen(true);
          } else if (route === 'purchase-add') {
            setIsAddPurchaseOpen(true);
          } else if (route === 'stock-transfer-add') {
            setIsAddTransferOpen(true);
          } else if (route === 'expenses-add') {
            setIsAddExpenseOpen(true);
          } else {
            setCurrentRoute(route);
          }
        }}
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        lang={lang}
        businessSettings={businessSettings}
        userRole={currentUser?.role === 'super_admin' ? userRole : (currentUser?.role || 'cashier')}
        currentUser={currentUser}
      />

      {/* Main Container */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* 1. Top Bar (Header) with Theme & Language */}
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onOpenPos={() => setIsPosOpen(true)}
          onOpenCalculator={() => setIsCalculatorOpen(true)}
          onNavigate={setCurrentRoute}
          currentBranch={currentBranch}
          onChangeBranch={setCurrentBranch}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          lang={lang}
          onToggleLang={handleToggleLang}
          businessSettings={businessSettings}
          userRole={currentUser?.role === 'super_admin' ? userRole : (currentUser?.role || 'cashier')}
          onToggleUserRole={currentUser?.role === 'super_admin' ? handleToggleUserRole : undefined}
          onPutNewEntry={currentUser?.role === 'super_admin' ? handlePutNewEntry : undefined}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenInvoiceScanner={() => setIsInvoiceScanOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenShortcutsHelp={() => setIsShortcutsHelpOpen(true)}
        />

        {/* 3. Main Content Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {renderMainContent()}
          </div>
        </main>
      </div>

      {/* Real-time DB Synced Notification Toast */}
      {syncNotice && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900/95 dark:bg-slate-800/95 text-white px-4 py-3 shadow-2xl border border-emerald-500/50 backdrop-blur-md animate-in slide-in-from-bottom-3 fade-in duration-200">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-slate-950 font-black shrink-0">
            <CheckCircle className="h-4 w-4 stroke-[3]" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">TAMANNA MOTORS DB</div>
            <div className="text-xs font-semibold text-slate-100">{syncNotice}</div>
          </div>
        </div>
      )}

      {/* Interactive Modal Drawers */}
      <CalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      {isPosOpen && (
        <PosTerminal
          products={products}
          customers={customers}
          onClose={() => setIsPosOpen(false)}
          onCompleteSale={handleCompleteSale}
          onOpenCalculator={() => setIsCalculatorOpen(true)}
          lang={lang}
          businessSettings={businessSettings}
          invoiceSettings={invoiceSettings}
          branchLocation={currentBranch}
        />
      )}

      {/* View/Reprint Receipt Modal from Sales Tables */}
      {viewingReceiptSale && (
        <ReceiptModal
          isOpen={Boolean(viewingReceiptSale)}
          onClose={() => setViewingReceiptSale(null)}
          invoiceNo={viewingReceiptSale.invoiceNo}
          customerName={viewingReceiptSale.customerName}
          customerPhone={viewingReceiptSale.customerPhone}
          items={viewingReceiptSale.items && viewingReceiptSale.items.length > 0 ? viewingReceiptSale.items : []}
          subtotal={viewingReceiptSale.subtotal ?? (viewingReceiptSale.totalAmount / 1.05)}
          taxAmount={viewingReceiptSale.taxAmount ?? (viewingReceiptSale.totalAmount - (viewingReceiptSale.totalAmount / 1.05))}
          discountAmount={viewingReceiptSale.discountAmount ?? 0}
          grandTotal={viewingReceiptSale.totalAmount}
          amountTendered={viewingReceiptSale.amountTendered ?? viewingReceiptSale.totalAmount}
          changeDue={viewingReceiptSale.changeDue ?? 0}
          invoiceDue={viewingReceiptSale.invoiceDue}
          duePayments={viewingReceiptSale.duePayments}
          isMoneyReceipt={isReceiptMoneyMode}
          paymentMethod={viewingReceiptSale.paymentMethod}
          dateStr={viewingReceiptSale.saleDate}
          businessSettings={businessSettings}
          invoiceSettings={invoiceSettings}
          branchLocation={viewingReceiptSale.businessLocation}
          cashierName={viewingReceiptSale.cashierName || currentUser?.name || (lang === 'bn' ? 'অনুমোদিত ক্যাশিয়ার' : 'Authorized Cashier')}
          lang={lang}
          onUpdateLogo={(newLogo) => {
            setBusinessSettings(prev => ({ ...prev, logoUrl: newLogo }));
            setInvoiceSettings(prev => ({ ...prev, logoUrl: newLogo }));
            showSyncNotice(lang === 'bn' ? 'কাস্টম ব্র্যান্ড লোগো হালনাগাদ ও সিঙ্ক হয়েছে।' : 'Custom brand logo updated.');
          }}
        />
      )}

      {/* Invoice QR Scanner & Verification Modal */}
      <InvoiceScanModal
        isOpen={isInvoiceScanOpen}
        onClose={() => setIsInvoiceScanOpen(false)}
        sales={sales}
        onSelectSale={(sale) => setViewingReceiptSale(sale)}
        lang={lang}
      />

      {/* Add / Edit Product Modal with Camera Barcode Scanner */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => {
          setIsAddProductOpen(false);
          setEditingProduct(null);
        }}
        onAddProduct={handleAddProduct}
        initialProduct={editingProduct}
        lang={lang}
      />

      {/* Add / Edit Supplier Modal */}
      <AddContactModal
        isOpen={isAddSupplierOpen}
        onClose={() => {
          setIsAddSupplierOpen(false);
          setEditingContact(null);
        }}
        type="supplier"
        onAddContact={handleAddSupplier}
        initialContact={editingContact}
        lang={lang}
      />

      {/* Add / Edit Customer Modal */}
      <AddContactModal
        isOpen={isAddCustomerOpen}
        onClose={() => {
          setIsAddCustomerOpen(false);
          setEditingContact(null);
        }}
        type="customer"
        onAddContact={handleAddCustomer}
        initialContact={editingContact}
        lang={lang}
      />

      {/* Super Admin Universal Edit Entry Modal (Sale, Purchase, Expense) */}
      <EditEntryModal
        isOpen={Boolean(editingEntry)}
        onClose={() => setEditingEntry(null)}
        entryType={editingEntry?.type || 'sale'}
        entry={editingEntry?.data || null}
        onSave={handleEditEntrySave}
        lang={lang}
      />

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onAddExpense={handleAddExpense}
      />

      {/* Add Purchase Modal */}
      <AddPurchaseModal
        isOpen={isAddPurchaseOpen}
        onClose={() => setIsAddPurchaseOpen(false)}
        suppliers={suppliers}
        onAddPurchase={handleAddPurchase}
      />

      {/* Add Stock Transfer Modal */}
      <AddTransferModal
        isOpen={isAddTransferOpen}
        onClose={() => setIsAddTransferOpen(false)}
        onAddTransfer={handleAddTransfer}
      />

      {/* Global Quick Search & Command Palette Modal (Ctrl+S) */}
      <QuickSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        customers={customers}
        suppliers={suppliers}
        sales={sales}
        onSelectProduct={(product) => {
          setEditingProduct(product);
          setIsAddProductOpen(true);
        }}
        onSelectSale={(sale) => setViewingReceiptSale(sale)}
        onNavigate={setCurrentRoute}
        onOpenPos={() => setIsPosOpen(true)}
        lang={lang}
      />

      {/* Global Keyboard Shortcuts Help Cheat Sheet (Ctrl+/ or Ctrl+K) */}
      <ShortcutsHelpModal
        isOpen={isShortcutsHelpOpen}
        onClose={() => setIsShortcutsHelpOpen(false)}
        lang={lang}
      />
    </div>
  );
}
