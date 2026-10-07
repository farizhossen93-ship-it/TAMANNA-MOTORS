import React, { useState, useEffect, useMemo } from 'react';
import {
  Home,
  Users,
  Contact,
  Package,
  ShoppingBag,
  TrendingUp,
  ArrowLeftRight,
  Receipt,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Wrench,
  X,
  Search,
  Sparkles,
  Layers,
  CircleDot,
  CreditCard,
  Database
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../i18n/translations';
import { BusinessSettings, UserRole } from '../types';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  isOpen: boolean;
  onCloseMobile?: () => void;
  onToggle?: () => void;
  lang: Language;
  businessSettings?: BusinessSettings;
  userRole?: UserRole;
}

interface SubMenuItem {
  id: string;
  labelKey: string;
  badge?: string;
}

interface MenuItem {
  id: string;
  labelKey: string;
  icon: React.ReactNode;
  category: 'core' | 'operations' | 'admin';
  children?: SubMenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  isOpen,
  onCloseMobile,
  onToggle,
  lang,
  businessSettings,
  userRole = 'super_admin'
}) => {
  const t = TRANSLATIONS[lang];
  const [searchQuery, setSearchQuery] = useState('');

  // Track open states for submenus
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    contact: false,
    products: true,
    purchase: false,
    sales: true,
    stockTransfer: false,
    expenses: false,
    reports: false,
    settings: false,
  });

  // Automatically expand parent submenu if a child route is active
  useEffect(() => {
    menuArchitecture.forEach((item) => {
      if (item.children?.some(c => c.id === currentRoute)) {
        setOpenSubmenus(prev => ({ ...prev, [item.id]: true }));
      }
    });
  }, [currentRoute]);

  // Handle keyboard Escape key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && onCloseMobile) {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCloseMobile]);

  const toggleSubmenu = (menuKey: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const menuArchitecture: MenuItem[] = [
    {
      id: 'home',
      labelKey: t.nav.home,
      icon: <Home className="h-4 w-4 shrink-0" />,
      category: 'core'
    },
    {
      id: 'user-management',
      labelKey: t.nav.userManagement,
      icon: <Users className="h-4 w-4 shrink-0" />,
      category: 'core'
    },
    {
      id: 'synced-dues',
      labelKey: lang === 'bn' ? 'বকেয়া ও দেনা-পাওনা' : 'Synced Dues Ledger',
      icon: <CreditCard className="h-4 w-4 shrink-0 text-rose-500" />,
      category: 'core'
    },
    {
      id: 'contact',
      labelKey: t.nav.contact,
      icon: <Contact className="h-4 w-4 shrink-0" />,
      category: 'operations',
      children: [
        { id: 'contact-suppliers', labelKey: t.nav.suppliers },
        { id: 'contact-customers', labelKey: t.nav.customers },
        { id: 'contact-customer-group', labelKey: t.nav.customerGroup }
      ]
    },
    {
      id: 'products',
      labelKey: t.nav.products,
      icon: <Package className="h-4 w-4 shrink-0" />,
      category: 'operations',
      children: [
        { id: 'products-list', labelKey: t.nav.listOfProducts },
        { id: 'products-add', labelKey: t.nav.addProduct },
        { id: 'products-update-price', labelKey: t.nav.updatePrice }
      ]
    },
    {
      id: 'purchase',
      labelKey: t.nav.purchase,
      icon: <ShoppingBag className="h-4 w-4 shrink-0" />,
      category: 'operations',
      children: [
        { id: 'purchase-list', labelKey: t.nav.listOfPurchases },
        { id: 'purchase-add', labelKey: t.nav.addPurchase },
        { id: 'purchase-return-list', labelKey: t.nav.listPurchaseReturn }
      ]
    },
    {
      id: 'sales',
      labelKey: t.nav.sales,
      icon: <TrendingUp className="h-4 w-4 shrink-0" />,
      category: 'operations',
      children: [
        { id: 'sales-all', labelKey: t.nav.allSales },
        { id: 'synced-dues', labelKey: lang === 'bn' ? 'বকেয়া খতিয়ান ও আদায়' : 'Synced Dues Hub' },
        { id: 'sales-add', labelKey: t.nav.addSale },
        { id: 'sales-pos-list', labelKey: t.nav.listOfPos },
        { id: 'sales-add-draft', labelKey: t.nav.addDraft },
        { id: 'sales-draft-list', labelKey: t.nav.listDraft },
        { id: 'sales-return-list', labelKey: t.nav.listSalesReturn }
      ]
    },
    {
      id: 'stock-transfer',
      labelKey: t.nav.stockTransfer,
      icon: <ArrowLeftRight className="h-4 w-4 shrink-0" />,
      category: 'operations',
      children: [
        { id: 'stock-transfer-list', labelKey: t.nav.listStockTransfer },
        { id: 'stock-transfer-add', labelKey: t.nav.addStockTransfer }
      ]
    },
    {
      id: 'expenses',
      labelKey: t.nav.expenses,
      icon: <Receipt className="h-4 w-4 shrink-0" />,
      category: 'operations',
      children: [
        { id: 'expenses-list', labelKey: t.nav.listExpenses },
        { id: 'expenses-add', labelKey: t.nav.addExpense }
      ]
    },
    {
      id: 'reports',
      labelKey: t.nav.reports,
      icon: <BarChart3 className="h-4 w-4 shrink-0" />,
      category: 'admin',
      children: [
        { id: 'reports-profit-loss', labelKey: t.nav.profitLoss },
        { id: 'reports-purchase-sales', labelKey: t.nav.purchaseSales },
        { id: 'reports-stock', labelKey: t.nav.stockReport }
      ]
    },
    {
      id: 'settings',
      labelKey: t.nav.settings,
      icon: <Settings className="h-4 w-4 shrink-0" />,
      category: 'admin',
      children: [
        { id: 'settings-business', labelKey: t.nav.businessSettings },
        { id: 'settings-invoice', labelKey: t.nav.invoiceSettings }
      ]
    }
  ];

  // Filter items by userRole and search query
  const filteredMenuItems = useMemo(() => {
    let items = menuArchitecture;

    if (userRole === 'cashier') {
      items = menuArchitecture.filter(i => ['home', 'sales', 'products'].includes(i.id));
    } else if (userRole === 'manager') {
      items = menuArchitecture.filter(i => ['home', 'products', 'purchase', 'stock-transfer', 'contact', 'sales', 'expenses'].includes(i.id));
    } else if (userRole === 'admin') {
      items = menuArchitecture.filter(i => i.id !== 'user-management');
    }

    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((item) => {
      const parentMatches = item.labelKey.toLowerCase().includes(q);
      const childMatches = item.children?.some(c => c.labelKey.toLowerCase().includes(q));
      return parentMatches || childMatches;
    });
  }, [searchQuery, menuArchitecture, userRole]);

  const isChildActive = (item: MenuItem): boolean => {
    if (!item.children) return false;
    return item.children.some(c => c.id === currentRoute);
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.children) {
      if (!isOpen && onToggle) {
        // If sidebar is collapsed on desktop, clicking an expandable item expands the sidebar and opens the menu
        onToggle();
        setOpenSubmenus(prev => ({ ...prev, [item.id]: true }));
      } else {
        toggleSubmenu(item.id);
      }
    } else {
      onNavigate(item.id);
      if (onCloseMobile) onCloseMobile();
    }
  };

  const handleChildClick = (childId: string) => {
    onNavigate(childId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop with smooth fade */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-200 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-slate-800 bg-slate-900 dark:bg-slate-950 text-slate-200 transition-all duration-300 ease-in-out lg:static select-none shadow-xl lg:shadow-none ${
          isOpen
            ? 'w-72 sm:w-80 lg:w-64 xl:w-72 translate-x-0'
            : '-translate-x-full lg:w-20 lg:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-4 sm:px-5">
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 font-bold overflow-hidden shadow-xs ring-1 ring-emerald-400/30">
              {businessSettings?.logoUrl ? (
                <img src={businessSettings.logoUrl} alt="Logo" className="h-full w-full object-contain p-0.5 bg-white" />
              ) : (
                <Wrench className="h-5 w-5" />
              )}
            </div>
            {isOpen && (
              <div className="leading-tight truncate">
                <span className="text-sm font-extrabold tracking-tight text-white block truncate">
                  {lang === 'bn' ? 'তামান্না মোটরস' : 'TAMANNA MOTORS'}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold block truncate">
                  {lang === 'bn' ? 'মোটর পার্টস ও পিওএস' : 'Motor Parts & POS'}
                </span>
              </div>
            )}
          </div>

          {/* Close button for Mobile Screens */}
          <div className="flex items-center gap-1">
            {isOpen && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden transition-colors"
                title={lang === 'bn' ? 'সাইডবার বন্ধ করুন' : 'Close Sidebar'}
                aria-label="Close Sidebar"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Menu Search (Visible when sidebar is expanded) */}
        {isOpen && (
          <div className="px-4 pt-3 pb-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'bn' ? 'মেনু সার্চ করুন...' : 'Search menu...'}
                className="w-full rounded-xl border border-slate-800 bg-slate-800/60 py-1.5 pl-8 pr-7 text-xs text-slate-200 placeholder:text-slate-500 focus:border-emerald-500 focus:bg-slate-800 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation items scroll area */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          {filteredMenuItems.map((item) => {
            const hasChildren = Boolean(item.children && item.children.length > 0);
            const isSubOpen = Boolean(openSubmenus[item.id] || searchQuery.trim().length > 0);
            const isDirectActive = currentRoute === item.id;
            const hasActiveChild = isChildActive(item);

            return (
              <div key={item.id} className="text-xs">
                {/* Main menu item button */}
                <button
                  type="button"
                  onClick={() => handleItemClick(item)}
                  title={!isOpen ? item.labelKey : undefined}
                  className={`group relative flex w-full items-center justify-between rounded-xl px-3 py-2.5 font-medium transition-all ${
                    isDirectActive || hasActiveChild
                      ? 'bg-gradient-to-r from-emerald-600/20 to-emerald-500/10 text-emerald-400 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  {/* Active accent strip */}
                  {(isDirectActive || hasActiveChild) && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-500 rounded-r-full" />
                  )}

                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`transition-colors ${
                        isDirectActive || hasActiveChild
                          ? 'text-emerald-400'
                          : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      {item.icon}
                    </span>
                    {isOpen && <span className="truncate">{item.labelKey}</span>}
                  </div>

                  {isOpen && hasChildren && (
                    <span className="text-slate-500 group-hover:text-slate-300 shrink-0 ml-1">
                      {isSubOpen ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                    </span>
                  )}
                </button>

                {/* Submenu children list */}
                {isOpen && hasChildren && isSubOpen && (
                  <div className="mt-1 ml-4 pl-3 border-l border-slate-800/80 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    {item.children!.map((child) => {
                      const isCurrentChild = currentRoute === child.id;
                      return (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => handleChildClick(child.id)}
                          className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors ${
                            isCurrentChild
                              ? 'bg-emerald-500/20 font-bold text-emerald-300'
                              : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                          }`}
                        >
                          <CircleDot className={`h-2.5 w-2.5 shrink-0 ${isCurrentChild ? 'text-emerald-400' : 'text-slate-600'}`} />
                          <span className="truncate">{child.labelKey}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer with Desktop Collapse Toggle & Store Status */}
        <div className="border-t border-slate-800/80 p-3 bg-slate-900/90 space-y-2">
          {isOpen ? (
            <div className="flex items-center justify-between rounded-xl bg-slate-800/40 p-2.5 text-xs text-slate-400 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-semibold text-slate-200">TAMANNA POS</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">
                Online
              </span>
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" title="System Online"></span>
            </div>
          )}

          {/* Desktop Toggle Button */}
          {onToggle && (
            <button
              type="button"
              onClick={onToggle}
              className={`hidden lg:flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors ${
                !isOpen ? 'px-0' : 'px-3'
              }`}
              title={isOpen ? (lang === 'bn' ? 'সাইডবার গুটিয়ে নিন' : 'Collapse Sidebar') : (lang === 'bn' ? 'সাইডবার বিস্তার করুন' : 'Expand Sidebar')}
            >
              {isOpen ? (
                <>
                  <ChevronsLeft className="h-4 w-4" />
                  <span>{lang === 'bn' ? 'গুটিয়ে নিন' : 'Collapse'}</span>
                </>
              ) : (
                <ChevronsRight className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
