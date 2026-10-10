import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  ShoppingCart, 
  Menu, 
  ChevronDown, 
  Clock, 
  Store, 
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
  Shield,
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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between gap-3 border-b border-white/20 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl px-3 sm:px-4 lg:px-6 shadow-md select-none transition-colors">
      {/* Left section: Toggle, Logo & Greeting */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all backdrop-blur-md cursor-pointer active:scale-95"
          title="Toggle Navigation Sidebar"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {businessSettings?.logoUrl ? (
          <img
            src={businessSettings.logoUrl}
            alt="Tamanna Motors Logo"
            className="h-8 w-8 rounded-xl object-contain border border-white/20 dark:border-white/10 bg-white dark:bg-slate-800 p-0.5 shrink-0 shadow-xs"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-xs shrink-0 shadow-xs ring-1 ring-white/20">
            TM
          </div>
        )}

        <div className="hidden sm:flex items-center gap-2 min-w-0">
          <span className="text-xs md:text-sm font-bold text-slate-900 dark:text-white truncate max-w-[130px] md:max-w-[180px]">
            {t.welcome}, {currentUser?.name || (lang === 'bn' ? 'অ্যাডমিন' : 'Admin')}
          </span>

          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shrink-0">
            <Shield className="h-2.5 w-2.5" />
            <span>
              {currentUser?.role === 'super_admin'
                ? t.superAdmin
                : currentUser?.role === 'admin'
                ? t.admin
                : currentUser?.role === 'manager'
                ? (lang === 'bn' ? 'ম্যানেজার' : 'Manager')
                : (lang === 'bn' ? 'ক্যাশিয়ার' : 'Cashier')}
            </span>
          </div>
        </div>

        {/* Super Admin Quick 'Put New Entry' Button & Menu */}
        {userRole === 'super_admin' && onPutNewEntry && (
          <div className="relative ml-1">
            <button
              onClick={() => {
                setQuickEntryDropdownOpen(!quickEntryDropdownOpen);
                setRoleDropdownOpen(false);
                setBranchDropdownOpen(false);
                setProfileDropdownOpen(false);
              }}
              className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-2.5 py-1 text-xs font-bold shadow-xs transition-all active:scale-98 shrink-0 cursor-pointer"
              title="Super Admin: Put new entry into database with instant sync"
            >
              <Plus className="h-3 w-3 stroke-[3]" />
              <span className="hidden xs:inline">{lang === 'bn' ? 'নতুন এন্ট্রি' : 'Put Entry'}</span>
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

        {/* Location selector */}
        <div className="relative ml-1 hidden xl:block">
          <button
            onClick={() => {
              setBranchDropdownOpen(!branchDropdownOpen);
              setProfileDropdownOpen(false);
              setNotificationOpen(false);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-2 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Store className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="truncate max-w-[130px]">
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
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all backdrop-blur-md cursor-pointer active:scale-95"
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          )}
        </button>

        {/* Global Quick Search Button (Ctrl+S) - hidden on small mobile, visible on sm+ */}
        <button
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-2 rounded-xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-slate-800/50 px-2.5 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-emerald-500/50 transition-all backdrop-blur-md shadow-2xs cursor-pointer active:scale-95"
          title="Global Search & Commands (Ctrl+S)"
        >
          <Search className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden md:inline text-[11px] font-medium">{lang === 'bn' ? 'সার্চ...' : 'Search...'}</span>
          <kbd className="hidden lg:inline-block px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600">
            Ctrl+S
          </kbd>
        </button>

        {/* Keyboard Shortcuts Help Button - hidden on mobile/tablet to avoid overflow */}
        <button
          onClick={onOpenShortcutsHelp}
          className="hidden lg:flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all backdrop-blur-md cursor-pointer active:scale-95"
          title="Keyboard Shortcuts (Ctrl+/)"
          aria-label="Keyboard Shortcuts"
        >
          <Keyboard className="h-4 w-4" />
        </button>

        {/* Calculator Button - hidden on mobile, visible on md+ */}
        <button
          onClick={onOpenCalculator}
          className="hidden md:flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all backdrop-blur-md cursor-pointer active:scale-95"
          title="Calculator (Alt+C)"
          aria-label="Open Calculator"
        >
          <Calculator className="h-4 w-4" />
        </button>

        {/* Invoice QR Scanner Button - hidden on small mobile, visible on md+ */}
        <button
          onClick={onOpenInvoiceScanner}
          className="hidden md:flex items-center gap-1.5 rounded-xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-slate-800/50 px-2.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all backdrop-blur-md whitespace-nowrap cursor-pointer shadow-xs active:scale-95"
          title={lang === 'bn' ? 'চালান কিউআর স্ক্যান ও যাচাই (Ctrl+I)' : 'Scan & Verify Invoice QR (Ctrl+I)'}
        >
          <QrCode className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden lg:inline">{lang === 'bn' ? 'চালান স্ক্যান' : 'Scan Invoice'}</span>
          <kbd className="hidden xl:inline-block text-[9px] font-mono px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600">
            Ctrl+I
          </kbd>
        </button>

        {/* POS Shortcut Button - always accessible, responsive sizing */}
        <button
          onClick={onOpenPos}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-2.5 sm:px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 active:scale-95 transition-all whitespace-nowrap cursor-pointer ring-1 ring-white/20"
          title="Launch POS Terminal (Ctrl+P)"
        >
          <ShoppingCart className="h-4 w-4 shrink-0" />
          <span className="hidden xs:inline">{t.openPos}</span>
          <span className="xs:hidden font-black">POS</span>
          <kbd className="hidden sm:inline-block text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-800/80 text-emerald-100">
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
            className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-slate-800/50 p-1 pl-1.5 sm:pl-2 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-all backdrop-blur-md cursor-pointer active:scale-95"
            aria-label="User Menu"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 text-xs font-bold text-white overflow-hidden shadow-xs ring-1 ring-white/20 shrink-0">
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
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/20 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl py-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95">
              <div className="border-b border-slate-100 dark:border-slate-800/80 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs ring-1 ring-white/20">
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
                  <span className="font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-md uppercase border border-amber-300/30">
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
                  className="flex w-full items-center gap-2 px-4 py-2 text-emerald-800 dark:text-emerald-400 font-semibold hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 cursor-pointer"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>{lang === 'bn' ? 'চালান কিউআর কোড স্ক্যান' : 'Scan Invoice QR'}</span>
                </button>
                {currentUser?.role === 'super_admin' && (
                  <button
                    onClick={() => {
                      onNavigate('user-management');
                      setProfileDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/70 cursor-pointer font-medium"
                  >
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>{t.nav.userManagement}</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    onNavigate('settings-business');
                    setProfileDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/70 cursor-pointer"
                >
                  <SettingsIcon className="h-3.5 w-3.5 text-slate-400" />
                  <span>{t.nav.businessSettings}</span>
                </button>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-1">
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
