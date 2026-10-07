import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  ShoppingCart, 
  Menu, 
  ChevronDown, 
  Clock, 
  Store, 
  Database,
  User, 
  Settings as SettingsIcon, 
  LogOut, 
  Bell,
  Check,
  Sun,
  Moon,
  Globe,
  Wrench,
  Crown,
  ShieldCheck,
  Image,
  Sparkles,
  Plus,
  Package,
  FileText,
  Truck,
  Wallet,
  Users,
  Repeat,
  QrCode,
  Search,
  Keyboard
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../i18n/translations';
import { BusinessSettings, UserRole, AuthUser } from '../types';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onOpenPos: () => void;
  onOpenCalculator: () => void;
  onNavigate: (route: string) => void;
  currentBranch: string;
  onChangeBranch: (branch: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  lang: Language;
  onToggleLang: (lang: Language) => void;
  businessSettings?: BusinessSettings;
  userRole?: UserRole;
  onToggleUserRole?: (role: UserRole) => void;
  onPutNewEntry?: (type: 'product' | 'pos' | 'purchase' | 'expense' | 'customer' | 'supplier' | 'transfer') => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  onOpenInvoiceScanner?: () => void;
  onOpenSearch?: () => void;
  onOpenShortcutsHelp?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  setSidebarOpen,
  onOpenPos,
  onOpenCalculator,
  onNavigate,
  currentBranch,
  onChangeBranch,
  theme,
  onToggleTheme,
  lang,
  onToggleLang,
  businessSettings,
  userRole = 'super_admin',
  onToggleUserRole,
  onPutNewEntry,
  currentUser,
  onLogout,
  onOpenInvoiceScanner,
  onOpenSearch,
  onOpenShortcutsHelp
}) => {
  const t = TRANSLATIONS[lang];
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [quickEntryDropdownOpen, setQuickEntryDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
      setCurrentDate(
        now.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  const branches = [
    { id: "Hazigonj Branch", labelEn: "Hazigonj Branch (Main)", labelBn: "হাজীগঞ্জ ব্রাঞ্চ (প্রধান শোরুম)" }
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 lg:px-6 shadow-xs select-none transition-colors">
      {/* Left section: Toggle, Greeting & Branch */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-2 focus-visible:outline-emerald-500"
          title="Toggle Navigation Sidebar"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          onClick={() => onNavigate('home')}
          className="hidden md:flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 transition-colors cursor-pointer"
          title="Terminal Dashboard"
        >
          <Store className="h-3.5 w-3.5 text-emerald-600" />
          <span>
            {currentUser?.role === 'super_admin'
              ? (lang === 'bn' ? '⚡ সুপার অ্যাডমিন ড্যাশবোর্ড' : '⚡ Super Admin Dashboard')
              : currentUser?.role === 'cashier'
              ? (lang === 'bn' ? '⚡ ক্যাশিয়ার কাউন্টার' : '⚡ Cashier Terminal')
              : currentUser?.role === 'manager'
              ? (lang === 'bn' ? '⚡ ম্যানেজার প্যানেল' : '⚡ Manager Panel')
              : (lang === 'bn' ? '⚡ তামান্না মোটরস ইআরপি' : '⚡ Tamanna Motors ERP')}
          </span>
        </button>

        {businessSettings?.logoUrl ? (
          <img
            src={businessSettings.logoUrl}
            alt="Tamanna Motors Logo"
            className="h-8 w-8 rounded-lg object-contain border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 shrink-0"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-black text-xs shrink-0 shadow-xs">
            TM
          </div>
        )}

        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {t.welcome}, {currentUser?.name || (lang === 'bn' ? 'অ্যাডমিন' : 'Admin')}
            </span>

            {/* Super Admin & User Role Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setRoleDropdownOpen(!roleDropdownOpen);
                  setBranchDropdownOpen(false);
                  setProfileDropdownOpen(false);
                }}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-wide transition-all shadow-xs ${
                  userRole === 'super_admin'
                    ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 border border-amber-300 hover:brightness-105'
                    : userRole === 'admin'
                    ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border border-blue-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                }`}
                title="Click to Switch Role (Super Admin / Admin / Cashier)"
              >
                {userRole === 'super_admin' && <Crown className="h-3 w-3 fill-slate-950" />}
                <span>
                  {userRole === 'super_admin'
                    ? t.superAdmin
                    : userRole === 'admin'
                    ? t.admin
                    : (lang === 'bn' ? 'ক্যাশিয়ার' : 'Cashier')}
                </span>
                <ChevronDown className="h-2.5 w-2.5 opacity-70" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-72 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    {t.switchRole}
                  </div>
                  <button
                    onClick={() => {
                      onToggleUserRole?.('super_admin');
                      setRoleDropdownOpen(false);
                    }}
                    className="flex w-full items-start gap-2.5 px-3 py-2 text-xs hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left transition-colors"
                  >
                    <Crown className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <span>{t.superAdmin}</span>
                        {userRole === 'super_admin' && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{t.superAdminPrivilege}</p>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      onToggleUserRole?.('admin');
                      setRoleDropdownOpen(false);
                    }}
                    className="flex w-full items-start gap-2.5 px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
                  >
                    <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{t.admin}</span>
                        {userRole === 'admin' && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{lang === 'bn' ? 'দৈনন্দিন স্টোর ও ইনভেন্টরি ম্যানেজমেন্ট' : 'Standard daily store management'}</p>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      onToggleUserRole?.('cashier');
                      setRoleDropdownOpen(false);
                    }}
                    className="flex w-full items-start gap-2.5 px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
                  >
                    <User className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{lang === 'bn' ? 'ক্যাশিয়ার / স্টাফ' : 'Cashier / Staff'}</span>
                        {userRole === 'cashier' && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{lang === 'bn' ? 'শুধুমাত্র পিওএস বিক্রয় (মুছে ফেলা সীমাবদ্ধ)' : 'POS sales and terminal view only'}</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Super Admin Quick 'Put New Entry' Button & Menu */}
            {userRole === 'super_admin' && onPutNewEntry && (
              <div className="relative">
                <button
                  onClick={() => {
                    setQuickEntryDropdownOpen(!quickEntryDropdownOpen);
                    setRoleDropdownOpen(false);
                    setBranchDropdownOpen(false);
                    setProfileDropdownOpen(false);
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-2.5 py-1 text-[11px] font-bold shadow-xs transition-all active:scale-98"
                  title="Super Admin: Put new entry into database with instant sync"
                >
                  <Plus className="h-3 w-3 stroke-[3]" />
                  <span>{lang === 'bn' ? 'নতুন এন্ট্রি দিন' : 'Put New Entry'}</span>
                  <ChevronDown className="h-2.5 w-2.5 opacity-80" />
                </button>

                {quickEntryDropdownOpen && (
                  <div className="absolute left-0 mt-1.5 w-64 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 text-xs">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span>{lang === 'bn' ? 'সুপার অ্যাডমিন নতুন এন্ট্রি' : 'Super Admin New Entry'}</span>
                      <span className="text-[9px] bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded font-mono">Sync</span>
                    </div>

                    <button
                      onClick={() => {
                        onPutNewEntry('product');
                        setQuickEntryDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left"
                    >
                      <Package className="h-4 w-4 text-emerald-600" />
                      <div>
                        <div className="font-bold">{lang === 'bn' ? 'নতুন মোটর পার্টস / এসকেইউ' : 'New Product / SKU'}</div>
                        <div className="text-[10px] text-slate-500">{lang === 'bn' ? 'ক্যামেরা বারকোড স্ক্যানারসহ' : 'Camera Barcode Scanner auto-fill'}</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onPutNewEntry('pos');
                        setQuickEntryDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left"
                    >
                      <ShoppingCart className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="font-bold">{lang === 'bn' ? 'নতুন পিওএস বিক্রয় চালান' : 'New POS Sale / Invoice'}</div>
                        <div className="text-[10px] text-slate-500">{lang === 'bn' ? 'থার্মাল প্রিন্ট রসিদসহ' : 'Instant thermal print receipt'}</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onPutNewEntry('purchase');
                        setQuickEntryDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left"
                    >
                      <Truck className="h-4 w-4 text-indigo-600" />
                      <div>
                        <div className="font-bold">{lang === 'bn' ? 'নতুন ক্রয় অর্ডার (সাপ্লায়ার)' : 'New Purchase Order'}</div>
                        <div className="text-[10px] text-slate-500">{lang === 'bn' ? 'ইনভেন্টরিতে স্টক যুক্ত হবে' : 'Inbound wholesale stock'}</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onPutNewEntry('expense');
                        setQuickEntryDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left"
                    >
                      <Wallet className="h-4 w-4 text-rose-600" />
                      <div>
                        <div className="font-bold">{lang === 'bn' ? 'নতুন দোকান ব্যয় ভাউচার' : 'New Expense Record'}</div>
                        <div className="text-[10px] text-slate-500">{lang === 'bn' ? 'ভাড়া, বেতন, বিদ্যুৎ খরচ' : 'Overhead & operational cost'}</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onPutNewEntry('customer');
                        setQuickEntryDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left"
                    >
                      <User className="h-4 w-4 text-amber-600" />
                      <div>
                        <div className="font-bold">{lang === 'bn' ? 'নতুন কাস্টমার / ক্লায়েন্ট' : 'New Customer Contact'}</div>
                        <div className="text-[10px] text-slate-500">{lang === 'bn' ? 'গ্রুপ ও ক্রেডিট সীমাসহ' : 'Client ledger & credit line'}</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onPutNewEntry('supplier');
                        setQuickEntryDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left"
                    >
                      <Users className="h-4 w-4 text-purple-600" />
                      <div>
                        <div className="font-bold">{lang === 'bn' ? 'নতুন পার্টস সরবরাহকারী' : 'New Vendor Supplier'}</div>
                        <div className="text-[10px] text-slate-500">{lang === 'bn' ? 'টিয়ার ও ট্যাক্স নাম্বারসহ' : 'Direct distributor account'}</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onPutNewEntry('transfer');
                        setQuickEntryDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left"
                    >
                      <Repeat className="h-4 w-4 text-cyan-600" />
                      <div>
                        <div className="font-bold">{lang === 'bn' ? 'নতুন স্টক ট্রান্সফার' : 'New Stock Transfer'}</div>
                        <div className="text-[10px] text-slate-500">{lang === 'bn' ? 'আন্তঃশাখা গুদাম স্থানান্তর' : 'Showroom to warehouse logistics'}</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Synced Database Indicator */}
            <div className="hidden lg:flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-2 py-0.5 rounded-full" title="All operations synced with TAMANNA MOTORS Local Database">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{lang === 'bn' ? 'ডাটাবেজ সিঙ্কড' : 'DB Synced'}</span>
            </div>
          </div>
        </div>

        {/* Location selector */}
        <div className="relative ml-1 hidden md:block">
          <button
            onClick={() => {
              setBranchDropdownOpen(!branchDropdownOpen);
              setProfileDropdownOpen(false);
              setNotificationOpen(false);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Store className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="truncate max-w-[150px]">
              {branches.find(b => b.id === currentBranch)?.[lang === 'bn' ? 'labelBn' : 'labelEn'] || currentBranch}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {branchDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-52 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {t.switchBranch}
              </div>
              {branches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    onChangeBranch(b.id);
                    setBranchDropdownOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <span className="text-left">{lang === 'bn' ? b.labelBn : b.labelEn}</span>
                  {currentBranch === b.id && <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right section: Theme, Language, Date/Time, POS shortcut, Calculator & Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Live Date & Time */}
        <div className="hidden xl:flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 pr-3">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-medium">{currentDate}</span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">{currentTime}</span>
        </div>

        {/* Language Switcher (EN / বাংলা) */}
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5 text-xs font-bold">
          <button
            onClick={() => onToggleLang('en')}
            className={`px-2 py-1 rounded-md transition-colors ${
              lang === 'en'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="English Version"
          >
            EN
          </button>
          <button
            onClick={() => onToggleLang('bn')}
            className={`px-2 py-1 rounded-md transition-colors ${
              lang === 'bn'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="বাংলা সংস্করণ (Bangla)"
          >
            বাং
          </button>
        </div>

        {/* Theme Toggle (Dark / Light) */}
        <button
          onClick={onToggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-600" />
          )}
        </button>

        {/* Global Quick Search Button (Ctrl+S) */}
        <button
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-emerald-500/50 transition-colors shadow-2xs cursor-pointer"
          title="Global Search & Commands (Ctrl+S)"
        >
          <Search className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden md:inline text-[11px] font-medium">{lang === 'bn' ? 'সার্চ...' : 'Search...'}</span>
          <kbd className="hidden lg:inline-block px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600">
            Ctrl+S
          </kbd>
        </button>

        {/* Keyboard Shortcuts Help Button */}
        <button
          onClick={onOpenShortcutsHelp}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Keyboard Shortcuts (Ctrl+/)"
          aria-label="Keyboard Shortcuts"
        >
          <Keyboard className="h-4 w-4" />
        </button>

        {/* Calculator Button */}
        <button
          onClick={onOpenCalculator}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Calculator (Alt+C)"
          aria-label="Open Calculator"
        >
          <Calculator className="h-4 w-4" />
        </button>

        {/* Invoice QR Scanner Button */}
        <button
          onClick={onOpenInvoiceScanner}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap cursor-pointer shadow-xs"
          title={lang === 'bn' ? 'চালান কিউআর স্ক্যান ও যাচাই (Ctrl+I)' : 'Scan & Verify Invoice QR (Ctrl+I)'}
        >
          <QrCode className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden md:inline">{lang === 'bn' ? 'চালান স্ক্যান' : 'Scan Invoice'}</span>
          <kbd className="hidden xl:inline-block text-[9px] font-mono px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600">
            Ctrl+I
          </kbd>
        </button>

        {/* POS Shortcut Button */}
        <button
          onClick={onOpenPos}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:bg-emerald-800 transition-colors whitespace-nowrap cursor-pointer"
          title="Launch POS Terminal (Ctrl+P)"
        >
          <ShoppingCart className="h-4 w-4" />
          <span>{t.openPos}</span>
          <kbd className="hidden sm:inline-block text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-800 text-emerald-100">
            Ctrl+P
          </kbd>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileDropdownOpen(!profileDropdownOpen);
              setBranchDropdownOpen(false);
              setNotificationOpen(false);
            }}
            className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 p-1 pl-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="User Menu"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600 text-xs font-bold text-white overflow-hidden shadow-xs">
              {currentUser?.name ? currentUser.name.charAt(0) : (businessSettings?.logoUrl ? (
                <img src={businessSettings.logoUrl} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <span>TM</span>
              ))}
            </div>
            <div className="hidden text-left xl:block">
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[130px]">
                {currentUser?.name || (lang === 'bn' ? 'অ্যাডমিন ইউজার' : 'Admin User')}
              </div>
              <div className="text-[10px] text-slate-600 dark:text-slate-300 flex items-center gap-1 font-medium capitalize">
                {(currentUser?.role || userRole) === 'super_admin' ? (
                  <span className="font-extrabold text-amber-600 dark:text-amber-400">👑 {t.superAdmin}</span>
                ) : (
                  <span>{(currentUser?.role || userRole).replace('_', ' ')}</span>
                )}
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95">
              <div className="border-b border-slate-100 dark:border-slate-800 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg overflow-hidden bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                    {currentUser?.name ? currentUser.name.charAt(0) : 'TM'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {currentUser?.name || 'TAMANNA MOTORS'}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {currentUser?.email || (currentUser?.username ? `${currentUser.username}@tamannamotors.com` : 'admin@tamannamotors.com')}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">{t.roleActive}:</span>
                  <span className="font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded uppercase">
                    {(currentUser?.role || userRole) === 'super_admin' ? '👑 Super Admin' : (currentUser?.role || userRole)}
                  </span>
                </div>
              </div>

              <div className="py-1 text-xs text-slate-700 dark:text-slate-200">
                <button
                  onClick={() => {
                    onOpenInvoiceScanner?.();
                    setProfileDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-emerald-800 dark:text-emerald-400 font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>{lang === 'bn' ? 'চালান কিউআর কোড স্ক্যান' : 'Scan Invoice QR'}</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('user-management');
                    setProfileDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span>{t.nav.userManagement}</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('settings-business');
                    setProfileDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <SettingsIcon className="h-3.5 w-3.5 text-slate-400" />
                  <span>{t.nav.businessSettings}</span>
                </button>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    if (onLogout) {
                      onLogout();
                    }
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer font-bold"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>{lang === 'bn' ? 'লক / লগআউট করুন' : 'Lock / Sign Out'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
