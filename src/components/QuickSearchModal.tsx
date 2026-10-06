import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Package, 
  FileText, 
  User, 
  ShoppingCart, 
  ArrowRight, 
  TrendingUp, 
  Settings, 
  BarChart3,
  Building2,
  Sparkles
} from 'lucide-react';
import { Product, Contact, Sale } from '../types';
import { Language } from '../i18n/translations';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  customers: Contact[];
  suppliers: Contact[];
  sales: Sale[];
  onSelectProduct?: (product: Product) => void;
  onSelectSale?: (sale: Sale) => void;
  onNavigate: (route: string) => void;
  onOpenPos: () => void;
  lang?: Language;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  products,
  customers,
  suppliers,
  sales,
  onSelectProduct,
  onSelectSale,
  onNavigate,
  onOpenPos,
  lang = 'en'
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const filteredProducts = q 
    ? products.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)).slice(0, 4)
    : [];

  const filteredSales = q
    ? sales.filter(s => s.invoiceNo.toLowerCase().includes(q) || s.customerName.toLowerCase().includes(q)).slice(0, 4)
    : [];

  const filteredContacts = q
    ? [...customers, ...suppliers].filter(c => c.name.toLowerCase().includes(q) || (c.businessName && c.businessName.toLowerCase().includes(q)) || c.phone.includes(q)).slice(0, 3)
    : [];

  const quickNav = [
    { labelEn: 'Launch POS Terminal', labelBn: 'পিওএস সেলস টার্মিনাল', action: () => { onClose(); onOpenPos(); }, icon: <ShoppingCart className="h-4 w-4 text-emerald-500" /> },
    { labelEn: 'All Products & Stock', labelBn: 'সকল পার্টস ও স্টক তালিকা', action: () => { onClose(); onNavigate('products-list'); }, icon: <Package className="h-4 w-4 text-blue-500" /> },
    { labelEn: 'Sales & Invoices History', labelBn: 'বিক্রয় ও চালান হিস্ট্রি', action: () => { onClose(); onNavigate('sales-all'); }, icon: <TrendingUp className="h-4 w-4 text-indigo-500" /> },
    { labelEn: 'Business & Invoice Settings', labelBn: 'ব্যবসা ও ইনভয়েস সেটিংস', action: () => { onClose(); onNavigate('settings-business'); }, icon: <Settings className="h-4 w-4 text-slate-500" /> },
    { labelEn: 'Financial Reports', labelBn: 'আর্থিক লাভ-ক্ষতি রিপোর্ট', action: () => { onClose(); onNavigate('reports-profit-loss'); }, icon: <BarChart3 className="h-4 w-4 text-amber-500" /> }
  ].filter(item => !q || item.labelEn.toLowerCase().includes(q) || item.labelBn.includes(q));

  const hasResults = filteredProducts.length > 0 || filteredSales.length > 0 || filteredContacts.length > 0 || (q && quickNav.length > 0);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/70 p-4 pt-16 sm:pt-24 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative border-b border-slate-100 dark:border-slate-800 p-4 sm:p-5 flex items-center gap-3">
          <Search className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === 'bn' ? 'পার্টস, এসকেইউ, কাস্টমার, চালান নম্বর খুঁজুন (Ctrl+S)...' : 'Search parts, SKU, customers, invoice #, or commands (Ctrl+S)...'}
            className="w-full bg-transparent text-sm sm:text-base font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Esc
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {/* Products Results */}
          {filteredProducts.length > 0 && (
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                <Package className="h-3 w-3 text-emerald-500" />
                {lang === 'bn' ? 'মোটর পার্টস ও পণ্য' : 'Products & Spare Parts'}
              </div>
              <div className="space-y-1">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onClose();
                      onSelectProduct?.(p);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover rounded-lg" />
                        ) : (
                          <Package className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2 font-mono">
                          <span>SKU: {p.sku}</span>
                          <span>·</span>
                          <span className={p.currentStock <= p.alertQuantity ? 'text-amber-500 font-bold' : ''}>
                            Stock: {p.currentStock}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400">
                        ৳{p.sellingPrice.toFixed(0)}
                      </div>
                      <span className="text-[9px] text-slate-400">{p.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sales & Invoices Results */}
          {filteredSales.length > 0 && (
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                <FileText className="h-3 w-3 text-blue-500" />
                {lang === 'bn' ? 'বিক্রয় চালান ও মেমো' : 'Sales Invoices & Receipts'}
              </div>
              <div className="space-y-1">
                {filteredSales.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      onClose();
                      onSelectSale?.(s);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold text-xs">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {s.invoiceNo}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {s.customerName} · {s.saleDate}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-xs text-slate-900 dark:text-white">
                        ৳{s.totalAmount.toFixed(0)}
                      </div>
                      <span className="text-[9px] uppercase font-bold text-emerald-600">
                        {s.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contacts Results */}
          {filteredContacts.length > 0 && (
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                <User className="h-3 w-3 text-amber-500" />
                {lang === 'bn' ? 'গ্রাহক ও সরবরাহকারী' : 'Customers & Suppliers'}
              </div>
              <div className="space-y-1">
                {filteredContacts.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onClose();
                      onNavigate(c.type === 'supplier' ? 'contact-suppliers' : 'contact-customers');
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold text-xs">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                          {c.name} {c.businessName ? `(${c.businessName})` : ''}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {c.phone} · {c.businessLocation}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {c.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Commands & Navigation */}
          {quickNav.length > 0 && (
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-purple-500" />
                {lang === 'bn' ? 'কুইক অ্যাকশন ও নেভিগেশন' : 'Quick Actions & Commands'}
              </div>
              <div className="space-y-1">
                {quickNav.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={item.action}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        {item.icon}
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {lang === 'bn' ? item.labelBn : item.labelEn}
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty state when query provided but nothing found */}
          {q && !hasResults && (
            <div className="text-center py-8 text-slate-400">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-semibold">
                {lang === 'bn' ? `"${query}" এর জন্য কিছু পাওয়া যায়নি` : `No matching results for "${query}"`}
              </p>
            </div>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-3 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">↵</kbd>
              <span>to select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">Esc</kbd>
              <span>to exit</span>
            </span>
          </div>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">TAMANNA MOTORS Quick Command</span>
        </div>
      </div>
    </div>
  );
};
