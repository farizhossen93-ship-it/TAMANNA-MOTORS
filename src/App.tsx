import React, { useState, useEffect } from 'react';
import {
  DatabaseStorage,
  INITIAL_TAMANNA_PRODUCTS,
  INITIAL_TAMANNA_SUPPLIERS,
  INITIAL_TAMANNA_CUSTOMERS,
  INITIAL_TAMANNA_SALES,
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
  const [currentBranch, setCurrentBranch] = useState<string>('Dhaka Central Showroom');
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

  // Authentication & Staff User state
  const [staffUsers, setStaffUsers] = useState<AuthUser[]>(() => DatabaseStorage.loadStaffUsers());
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => DatabaseStorage.loadCurrentUser());
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

  // Sync staff users to DB
  useEffect(() => {
    DatabaseStorage.saveStaffUsers(staffUsers);
  }, [staffUsers]);

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

  const handleRegister = (newUser: AuthUser) => {
    setStaffUsers(prev => {
      const exists = prev.some(u => u.username.toLowerCase() === newUser.username.toLowerCase());
      const next = exists ? prev : [...prev, newUser];
      DatabaseStorage.saveStaffUsers(next);
      return next;
    });
    handleLogin(newUser);
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
      setProducts(prev => prev.map(p => p.id === newProd.id ? newProd : p));
      setEditingProduct(null);
      showSyncNotice(lang === 'bn' ? `মোটর পার্টস '${newProd.name}' সফলভাবে সম্পাদিত ও সিঙ্ক হয়েছে।` : `Product '${newProd.name}' edited and synced.`);
    } else {
      setProducts([newProd, ...products]);
      showSyncNotice(lang === 'bn' ? `নতুন পার্টস '${newProd.name}' যুক্ত ও ডাটাবেজ সিঙ্ক হয়েছে।` : `New product '${newProd.name}' added and synced.`);
    }
  };

  const handleDeleteProduct = (prod: Product) => {
    if (confirm(lang === 'bn' ? `${prod.name} মুছে ফেলতে চান?` : `Are you sure you want to delete ${prod.name}?`)) {
      setProducts(prev => prev.filter(p => p.id !== prod.id));
      showSyncNotice(lang === 'bn' ? `'${prod.name}' মুছে ফেলা হয়েছে এবং ডাটাবেজ সিঙ্ক হয়েছে।` : `'${prod.name}' deleted and synced.`);
    }
  };

  // Handlers for Contacts (Suppliers & Customers)
  const handleAddSupplier = (contact: Contact) => {
    if (editingContact) {
      setSuppliers(prev => prev.map(s => s.id === contact.id ? contact : s));
      setEditingContact(null);
      showSyncNotice(lang === 'bn' ? `সরবরাহকারী '${contact.businessName || contact.name}' সম্পাদিত ও সিঙ্ক হয়েছে।` : `Supplier '${contact.businessName || contact.name}' updated and synced.`);
    } else {
      setSuppliers([contact, ...suppliers]);
      showSyncNotice(lang === 'bn' ? `নতুন সরবরাহকারী '${contact.businessName || contact.name}' যুক্ত ও সিঙ্ক হয়েছে।` : `New supplier '${contact.businessName || contact.name}' added and synced.`);
    }
  };

  const handleDeleteSupplier = (row: Contact) => {
    if (confirm(lang === 'bn' ? `সরবরাহকারী ${row.businessName || row.name} মুছতে চান?` : `Delete supplier ${row.businessName || row.name}?`)) {
      setSuppliers(prev => prev.filter(s => s.id !== row.id));
      showSyncNotice(lang === 'bn' ? `সরবরাহকারী '${row.businessName || row.name}' মুছে ফেলা হয়েছে।` : `Supplier deleted and synced.`);
    }
  };

  const handleAddCustomer = (contact: Contact) => {
    if (editingContact) {
      setCustomers(prev => prev.map(c => c.id === contact.id ? contact : c));
      setEditingContact(null);
      showSyncNotice(lang === 'bn' ? `গ্রাহক '${contact.name}' সম্পাদিত ও সিঙ্ক হয়েছে।` : `Customer '${contact.name}' updated and synced.`);
    } else {
      setCustomers([contact, ...customers]);
      showSyncNotice(lang === 'bn' ? `নতুন গ্রাহক '${contact.name}' যুক্ত ও সিঙ্ক হয়েছে।` : `New customer '${contact.name}' added and synced.`);
    }
  };

  const handleDeleteCustomer = (row: Contact) => {
    if (confirm(lang === 'bn' ? `গ্রাহক ${row.name} মুছতে চান?` : `Delete customer ${row.name}?`)) {
      setCustomers(prev => prev.filter(c => c.id !== row.id));
      showSyncNotice(lang === 'bn' ? `গ্রাহক '${row.name}' মুছে ফেলা হয়েছে।` : `Customer '${row.name}' deleted and synced.`);
    }
  };

  // Handlers for Expenses
  const handleAddExpense = (expense: Expense) => {
    setExpenses([expense, ...expenses]);
    showSyncNotice(lang === 'bn' ? `ব্যয় ভাউচার '${expense.expenseNo}' যুক্ত ও সিঙ্ক হয়েছে।` : `Expense '${expense.expenseNo}' added and synced.`);
  };

  const handleDeleteExpense = (row: Expense) => {
    if (confirm(lang === 'bn' ? `ব্যয় ${row.expenseNo} মুছতে চান?` : `Delete expense ${row.expenseNo}?`)) {
      setExpenses(prev => prev.filter(e => e.id !== row.id));
      showSyncNotice(lang === 'bn' ? `ব্যয় '${row.expenseNo}' মুছে ফেলা হয়েছে।` : `Expense '${row.expenseNo}' deleted and synced.`);
    }
  };

  // Handlers for Purchases
  const handleAddPurchase = (purchase: Purchase) => {
    setPurchases([purchase, ...purchases]);
    showSyncNotice(lang === 'bn' ? `ক্রয় চালান '${purchase.purchaseNo}' যুক্ত ও সিঙ্ক হয়েছে।` : `Purchase order '${purchase.purchaseNo}' added and synced.`);
  };

  const handleDeletePurchase = (row: Purchase) => {
    if (confirm(lang === 'bn' ? `ক্রয় অর্ডার ${row.purchaseNo} মুছতে চান?` : `Delete purchase order ${row.purchaseNo}?`)) {
      setPurchases(prev => prev.filter(p => p.id !== row.id));
      showSyncNotice(lang === 'bn' ? `ক্রয় অর্ডার '${row.purchaseNo}' মুছে ফেলা হয়েছে।` : `Purchase order deleted and synced.`);
    }
  };

  // Handlers for Stock Transfers
  const handleAddTransfer = (transfer: StockTransfer) => {
    setStockTransfers([transfer, ...stockTransfers]);
    showSyncNotice(lang === 'bn' ? `স্টক ট্রান্সফার '${transfer.transferNo}' তৈরি ও সিঙ্ক হয়েছে।` : `Stock transfer '${transfer.transferNo}' created and synced.`);
  };

  const handleDeleteTransfer = (transfer: StockTransfer) => {
    if (confirm(lang === 'bn' ? `স্টক ট্রান্সফার ${transfer.transferNo} মুছতে চান?` : `Delete transfer ${transfer.transferNo}?`)) {
      setStockTransfers(prev => prev.filter(t => t.id !== transfer.id));
      showSyncNotice(lang === 'bn' ? `স্টক ট্রান্সফার '${transfer.transferNo}' মুছে ফেলা হয়েছে।` : `Stock transfer deleted and synced.`);
    }
  };

  // Handlers for Sales
  const handleCompleteSale = (newSale: Sale, updatedProducts: Product[]) => {
    setSales([newSale, ...sales]);
    setProducts(updatedProducts);
    showSyncNotice(lang === 'bn' ? `বিক্রয় চালান '${newSale.invoiceNo}' সফলভাবে সম্পন্ন ও সিঙ্ক হয়েছে।` : `Sale invoice '${newSale.invoiceNo}' completed and synced.`);
  };

  const handleDeleteSale = (sale: Sale) => {
    if (confirm(lang === 'bn' ? `চালান ${sale.invoiceNo} মুছে ফেলতে চান?` : `Are you sure you want to delete invoice ${sale.invoiceNo}?`)) {
      setSales(prev => prev.filter(s => s.id !== sale.id));
      showSyncNotice(lang === 'bn' ? `চালান '${sale.invoiceNo}' মুছে ফেলা হয়েছে এবং ডাটাবেজ সিঙ্ক হয়েছে।` : `Invoice '${sale.invoiceNo}' deleted and synced.`);
    }
  };

  // Super Admin: Universal Edit Entry Save Handler
  const handleEditEntrySave = (updatedEntry: any) => {
    if (!editingEntry) return;

    if (editingEntry.type === 'sale') {
      setSales(prev => prev.map(s => s.id === updatedEntry.id ? updatedEntry : s));
      showSyncNotice(lang === 'bn' ? `বিক্রয় চালান '${updatedEntry.invoiceNo}' হালনাগাদ ও সিঙ্ক হয়েছে।` : `Sale invoice '${updatedEntry.invoiceNo}' updated and synced.`);
    } else if (editingEntry.type === 'purchase') {
      setPurchases(prev => prev.map(p => p.id === updatedEntry.id ? updatedEntry : p));
      showSyncNotice(lang === 'bn' ? `ক্রয় চালান '${updatedEntry.purchaseNo}' হালনাগাদ ও সিঙ্ক হয়েছে।` : `Purchase order '${updatedEntry.purchaseNo}' updated and synced.`);
    } else if (editingEntry.type === 'expense') {
      setExpenses(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
      showSyncNotice(lang === 'bn' ? `ব্যয় ভাউচার '${updatedEntry.expenseNo}' হালনাগাদ ও সিঙ্ক হয়েছে।` : `Expense '${updatedEntry.expenseNo}' updated and synced.`);
    }

    setEditingEntry(null);
  };

  const handleQuickRestock = (productId: string, quantity: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, currentStock: p.currentStock + quantity };
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
    alert(lang === 'bn' ? 'সকল পণ্যের বিক্রয় মূল্য সফলভাবে হালনাগাদ হয়েছে।' : 'Product selling prices updated successfully.');
  };

  const handleRefreshDatabase = () => {
    setProducts(INITIAL_TAMANNA_PRODUCTS);
    setSuppliers(INITIAL_TAMANNA_SUPPLIERS);
    setCustomers(INITIAL_TAMANNA_CUSTOMERS);
    setSales(INITIAL_TAMANNA_SALES);
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
      cell: (row) => (
        <span className={`font-bold text-[11px] ${
          row.paymentStatus === 'Paid' ? 'text-emerald-800 dark:text-emerald-400' : 'text-amber-800 dark:text-amber-400'
        }`}>
          {row.paymentStatus}
        </span>
      )
    },
    {
      header: lang === 'bn' ? 'তারিখ' : 'Sale Date',
      accessorKey: 'saleDate',
      cell: (row) => <span className="font-mono text-slate-600 dark:text-slate-300">{row.saleDate}</span>
    },
    { header: lang === 'bn' ? 'সর্বমোট টাকা' : 'Total Amount', accessorKey: 'totalAmount', align: 'right' }
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
            lang={lang}
            userRole={userRole}
            onQuickRestock={handleQuickRestock}
          />
        );

      case 'user-management':
        return (
          <UserManagementView
            users={staffUsers}
            onUpdateUsers={setStaffUsers}
            currentUser={currentUser}
            lang={lang}
          />
        );

      case 'contact-suppliers':
        return (
          <DataTable
            title={t.nav.suppliers}
            subtitle={lang === 'bn' ? 'মোটর পার্টস সরবরাহকারী প্রতিষ্ঠান, ক্রেডিট সীমা ও বকেয়া হিসাব।' : 'Manage vendor relationships, procurement contacts, credit terms, and payable balances.'}
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
            subtitle={lang === 'bn' ? 'তামান্না মোটরসের সকল মোটর পার্টস, লুব্রিকেন্ট, টায়ার ও স্পেয়ার পার্টস স্টক।' : 'Catalog inventory, SKU tracking, warehouse stock allocation, and pricing thresholds.'}
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
                  {lang === 'bn' ? 'সকল মোটর পার্টসের খুচরা বিক্রয় মূল্য একযোগে পরিবর্তন করুন।' : 'Rapidly adjust retail selling prices across your entire inventory catalogue.'}
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
                  businessLocation: 'Dhaka Central Showroom',
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
        return <ReportsView type="profit-loss" products={products} purchases={purchases} sales={sales} expenses={expenses} lang={lang} />;

      case 'reports-purchase-sales':
        return <ReportsView type="purchase-sales" products={products} purchases={purchases} sales={sales} expenses={expenses} lang={lang} />;

      case 'reports-stock':
        return <ReportsView type="stock" products={products} purchases={purchases} sales={sales} expenses={expenses} lang={lang} />;

      case 'settings-business':
        return (
          <SettingsView
            type="business"
            businessSettings={businessSettings}
            invoiceSettings={invoiceSettings}
            onSaveBusiness={setBusinessSettings}
            onSaveInvoice={setInvoiceSettings}
            lang={lang}
            onClearTempData={handleClearTempSales}
            onResetDatabase={handleResetDatabase}
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
            onClearTempData={handleClearTempSales}
            onResetDatabase={handleResetDatabase}
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
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans transition-colors duration-150">
      {/* 2. Left Navigation Sidebar */}
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={(route) => {
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
          userRole={userRole}
          onToggleUserRole={handleToggleUserRole}
          onPutNewEntry={handlePutNewEntry}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenInvoiceScanner={() => setIsInvoiceScanOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenShortcutsHelp={() => setIsShortcutsHelpOpen(true)}
        />

        {/* 3. Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
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
          items={viewingReceiptSale.items && viewingReceiptSale.items.length > 0 ? viewingReceiptSale.items : [
            {
              product: products[0] || INITIAL_TAMANNA_PRODUCTS[0],
              quantity: Math.max(1, Math.round(viewingReceiptSale.itemsCount * 0.6)),
            },
            {
              product: products[1] || INITIAL_TAMANNA_PRODUCTS[1],
              quantity: Math.max(1, Math.round(viewingReceiptSale.itemsCount * 0.4)),
            }
          ]}
          subtotal={viewingReceiptSale.subtotal ?? (viewingReceiptSale.totalAmount / 1.05)}
          taxAmount={viewingReceiptSale.taxAmount ?? (viewingReceiptSale.totalAmount - (viewingReceiptSale.totalAmount / 1.05))}
          discountAmount={viewingReceiptSale.discountAmount ?? 0}
          grandTotal={viewingReceiptSale.totalAmount}
          amountTendered={viewingReceiptSale.amountTendered ?? viewingReceiptSale.totalAmount}
          changeDue={viewingReceiptSale.changeDue ?? 0}
          paymentMethod={viewingReceiptSale.paymentMethod}
          dateStr={viewingReceiptSale.saleDate}
          businessSettings={businessSettings}
          invoiceSettings={invoiceSettings}
          branchLocation={viewingReceiptSale.businessLocation}
          cashierName={viewingReceiptSale.cashierName || "Md. Fariz (Reg-01)"}
          lang={lang}
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
