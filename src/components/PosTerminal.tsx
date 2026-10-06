import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  CreditCard,
  Banknote,
  Building,
  User,
  Calculator as CalcIcon,
  Tag,
  Package,
  Wrench,
  Printer,
  FileText
} from 'lucide-react';
import { Product, Contact, CartItem, Sale, BusinessSettings, InvoiceSettings } from '../types';
import { ReceiptModal } from './ReceiptModal';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface PosTerminalProps {
  products: Product[];
  customers: Contact[];
  onClose: () => void;
  onCompleteSale: (newSale: Sale, updatedProducts: Product[]) => void;
  onOpenCalculator: () => void;
  lang?: Language;
  businessSettings?: BusinessSettings;
  invoiceSettings?: InvoiceSettings;
  branchLocation?: string;
}

export const PosTerminal: React.FC<PosTerminalProps> = ({
  products,
  customers,
  onClose,
  onCompleteSale,
  onOpenCalculator,
  lang = 'en',
  businessSettings,
  invoiceSettings,
  branchLocation = "Dhaka Central Showroom"
}) => {
  const t = TRANSLATIONS[lang];
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust-walkin');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Bank Transfer'>('Cash');
  const [amountTendered, setAmountTendered] = useState<string>('');
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [autoTriggerPrint, setAutoTriggerPrint] = useState(false);
  const [lastCompletedSale, setLastCompletedSale] = useState<{
    invoiceNo: string;
    customerName: string;
    items: CartItem[];
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    grandTotal: number;
    amountTendered: number;
    changeDue: number;
    paymentMethod: string;
    dateStr: string;
  } | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    return ['All', ...new Set(products.map(p => p.category))];
  }, [products]);

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.currentStock) {
          alert(lang === 'bn' ? `বর্তমান স্টকের চেয়ে বেশি যোগ করা সম্ভব নয় (${product.currentStock} টি)।` : `Cannot add more than available stock (${product.currentStock} units).`);
          return prev;
        }
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        if (product.currentStock <= 0) {
          alert(lang === 'bn' ? 'এই পার্টসটি বর্তমানে স্টকে নেই।' : 'Item is currently out of stock.');
          return prev;
        }
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.currentStock) {
              alert(lang === 'bn' ? `স্টক অতিক্রম করেছে (${item.product.currentStock} টি)।` : `Cannot exceed available stock (${item.product.currentStock} units).`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    if (confirm(lang === 'bn' ? 'কার্টের সকল পার্টস মুছে ফেলতে চান?' : 'Clear all items from the current cart?')) {
      setCart([]);
    }
  };

  const taxRate = 0.05; // 5% VAT
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = item.customPrice ?? item.product.sellingPrice;
      return sum + price * item.quantity;
    }, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    return (subtotal * discountPercent) / 100;
  }, [subtotal, discountPercent]);

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableAmount * taxRate;
  const grandTotal = taxableAmount + taxAmount;

  const currentTendered = parseFloat(amountTendered) || grandTotal;
  const changeDue = Math.max(0, currentTendered - grandTotal);

  const currentCustomer = customers.find(c => c.id === selectedCustomerId) || {
    name: lang === 'bn' ? 'খুচরা ক্রেতা' : 'Walk-in Customer'
  };

  const handleCheckout = (autoPrint: boolean = false) => {
    if (cart.length === 0) {
      alert(lang === 'bn' ? 'কার্ট খালি। পার্টস যোগ করুন।' : 'Cart is empty. Please add items to proceed.');
      return;
    }

    const prefix = invoiceSettings?.invoicePrefix || "TM-2026-";
    const invoiceNo = `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const dateStr = now.toLocaleString();

    const newSaleRecord: Sale = {
      id: `sale-${Date.now()}`,
      invoiceNo,
      type: 'pos',
      customerName: currentCustomer.name,
      businessLocation: branchLocation,
      paymentStatus: 'Paid',
      paymentMethod,
      totalAmount: grandTotal,
      invoiceDue: 0,
      saleDate: dateStr,
      itemsCount: cart.reduce((sum, i) => sum + i.quantity, 0),
      items: [...cart],
      subtotal,
      taxAmount,
      discountAmount,
      amountTendered: currentTendered,
      changeDue,
      cashierName: 'Md. Fariz (Reg-01)'
    };

    const updatedProducts = products.map(prod => {
      const inCart = cart.find(ci => ci.product.id === prod.id);
      if (inCart) {
        return {
          ...prod,
          currentStock: Math.max(0, prod.currentStock - inCart.quantity)
        };
      }
      return prod;
    });

    const saleInfo = {
      invoiceNo,
      customerName: currentCustomer.name,
      items: [...cart],
      subtotal,
      taxAmount,
      discountAmount,
      grandTotal,
      amountTendered: currentTendered,
      changeDue,
      paymentMethod,
      dateStr
    };

    setLastCompletedSale(saleInfo);
    onCompleteSale(newSaleRecord, updatedProducts);
    setAutoTriggerPrint(autoPrint);
    setIsReceiptOpen(true);
    setCart([]);
    setAmountTendered('');
  };

  // POS In-session Keyboard Shortcuts (F2 / Ctrl+Enter: complete sale, F4: print, Esc: close)
  useEffect(() => {
    const handlePosKeyDown = (e: KeyboardEvent) => {
      if (isReceiptOpen) return;

      // F2 or Ctrl+Enter: Complete sale
      if (e.key === 'F2' || ((e.ctrlKey || e.metaKey) && e.key === 'Enter')) {
        e.preventDefault();
        if (cart.length > 0) {
          handleCheckout(false);
        }
      }
      // F4: Complete & Print
      else if (e.key === 'F4') {
        e.preventDefault();
        if (cart.length > 0) {
          handleCheckout(true);
        }
      }
      // Esc: Close POS
      else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handlePosKeyDown);
    return () => window.removeEventListener('keydown', handlePosKeyDown);
  }, [cart, grandTotal, currentCustomer, isReceiptOpen, amountTendered, paymentMethod]);

  const handlePrintCurrentDraftEstimate = () => {
    if (cart.length === 0) {
      alert(lang === 'bn' ? 'কার্ট খালি।' : 'Cart is empty.');
      return;
    }

    const draftNo = `EST-${Math.floor(1000 + Math.random() * 9000)}`;
    setLastCompletedSale({
      invoiceNo: draftNo,
      customerName: currentCustomer.name + (lang === 'bn' ? ' (মূল্য যাচাই)' : ' (Estimate)'),
      items: [...cart],
      subtotal,
      taxAmount,
      discountAmount,
      grandTotal,
      amountTendered: grandTotal,
      changeDue: 0,
      paymentMethod: 'Estimate / Quoted',
      dateStr: new Date().toLocaleString()
    });
    setAutoTriggerPrint(true);
    setIsReceiptOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-100 dark:bg-slate-950 animate-in fade-in select-none text-slate-900 dark:text-slate-100 transition-colors">
      {/* POS Top Bar */}
      <header className="flex h-14 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t.nav.home}</span>
          </button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
              {businessSettings?.businessName || "TAMANNA MOTORS"} · POS
            </span>
            <span className="text-xs text-emerald-800 dark:text-emerald-400 font-medium">
              · {branchLocation}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Reprint Last Receipt Button */}
          {lastCompletedSale && (
            <button
              onClick={() => {
                setAutoTriggerPrint(false);
                setIsReceiptOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
              title="Print or view previous receipt"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>{lang === 'bn' ? 'শেষ রসিদ প্রিন্ট' : 'Reprint Last Receipt'}</span>
            </button>
          )}

          <button
            onClick={onOpenCalculator}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <CalcIcon className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">{t.calculator}</span>
          </button>
          <div className="text-xs text-slate-600 dark:text-slate-300 font-mono hidden md:block">
            {lang === 'bn' ? 'ক্যাশিয়ার' : 'Cashier'}: <strong>Md. Fariz</strong>
          </div>
        </div>
      </header>

      {/* POS Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Motor Parts Catalog Grid */}
        <div className="flex flex-1 flex-col overflow-hidden border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.pos.searchPlaceholder}
                autoFocus
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 shadow-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Category Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                      : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product cards */}
          <div className="mt-4 flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((prod) => {
                const inCart = cart.find(ci => ci.product.id === prod.id);
                const isOutOfStock = prod.currentStock <= 0;

                return (
                  <button
                    key={prod.id}
                    onClick={() => !isOutOfStock && addToCart(prod)}
                    disabled={isOutOfStock}
                    className={`relative flex flex-col justify-between rounded-xl border p-3 text-left transition-all ${
                      isOutOfStock
                        ? 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/40 opacity-50 cursor-not-allowed'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md active:scale-98'
                    }`}
                  >
                    <div>
                      <div className="flex h-24 w-full items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden mb-2">
                        {prod.imageUrl ? (
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Wrench className="h-8 w-8 text-slate-400" />
                        )}
                      </div>

                      <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                        {prod.name}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 font-mono mt-0.5">
                        {prod.sku}
                      </div>
                    </div>

                    <div className="mt-3 flex items-baseline justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
                      <span className="text-sm font-extrabold font-mono text-emerald-800 dark:text-emerald-400 tabular-nums">
                        ৳{prod.sellingPrice.toFixed(0)}
                      </span>
                      <span className={`text-[10px] font-mono tabular-nums ${prod.currentStock <= prod.alertQuantity ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-600 dark:text-slate-300'}`}>
                        {isOutOfStock ? (lang === 'bn' ? 'স্টক শেষ' : 'Out of stock') : `${prod.currentStock} ${lang === 'bn' ? 'টি' : 'left'}`}
                      </span>
                    </div>

                    {inCart && (
                      <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-xs">
                        {inCart.quantity}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="flex h-64 flex-col items-center justify-center text-center text-xs text-slate-600 dark:text-slate-300">
                <Search className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p>{lang === 'bn' ? 'কোন পার্টস খুঁজে পাওয়া যায়নি।' : 'No motor parts found matching query.'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Cart & Checkout Section */}
        <div className="flex w-96 flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
          {/* Customer Selection */}
          <div className="border-b border-slate-200 dark:border-slate-800 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                {t.pos.customer}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintCurrentDraftEstimate}
                  disabled={cart.length === 0}
                  className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-40 flex items-center gap-1"
                  title="Print current cart receipt estimate"
                >
                  <FileText className="h-3 w-3" />
                  <span>{lang === 'bn' ? 'মেমো' : 'Estimate'}</span>
                </button>
                <button
                  onClick={clearCart}
                  disabled={cart.length === 0}
                  className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline disabled:opacity-40"
                >
                  {t.pos.clearCart}
                </button>
              </div>
            </div>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.customerGroup ? `(${c.customerGroup})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-3.5 divide-y divide-slate-100 dark:divide-slate-800">
            {cart.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center text-center text-xs text-slate-600 dark:text-slate-300">
                <ShoppingCart className="h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />
                <p className="font-semibold text-slate-600 dark:text-slate-300">{t.pos.cartEmpty}</p>
              </div>
            ) : (
              cart.map((item) => {
                const price = item.customPrice ?? item.product.sellingPrice;
                const total = price * item.quantity;

                return (
                  <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white truncate">{item.product.name}</div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                        ৳{price.toFixed(0)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center font-mono font-bold text-slate-800 dark:text-slate-100">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="text-right pl-2">
                      <div className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                        ৳{total.toFixed(0)}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-[10px] text-rose-500 hover:underline"
                      >
                        {t.delete}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Payment & Totals Breakdown Drawer */}
          <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-4 space-y-3">
            {/* Discount selector */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Tag className="h-3 w-3 text-slate-400" />
                {t.discount}:
              </span>
              <div className="flex items-center gap-1">
                {[0, 5, 10, 15].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setDiscountPercent(pct)}
                    className={`rounded-md px-2 py-0.5 text-[11px] font-bold transition-colors ${
                      discountPercent === pct
                        ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Subtotals */}
            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-slate-800">
              <div className="flex justify-between">
                <span>{t.subtotal}:</span>
                <span className="font-mono tabular-nums font-bold text-slate-800 dark:text-slate-200">৳{subtotal.toFixed(0)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-800 dark:text-emerald-400 font-semibold">
                  <span>{t.discount} ({discountPercent}%):</span>
                  <span className="font-mono tabular-nums">-৳{discountAmount.toFixed(0)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t.tax} (5%):</span>
                <span className="font-mono tabular-nums font-bold text-slate-800 dark:text-slate-200">৳{taxAmount.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
                <span>{t.grandTotal}:</span>
                <span className="font-mono tabular-nums text-emerald-800 dark:text-emerald-400">৳{grandTotal.toFixed(0)}</span>
              </div>
            </div>

            {/* Payment Method selector */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setPaymentMethod('Cash')}
                className={`flex items-center justify-center gap-1 rounded-xl py-2 text-xs font-bold transition-all ${
                  paymentMethod === 'Cash'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                }`}
              >
                <Banknote className="h-3.5 w-3.5" />
                <span>{t.pos.cash}</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Card')}
                className={`flex items-center justify-center gap-1 rounded-xl py-2 text-xs font-bold transition-all ${
                  paymentMethod === 'Card'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>{t.pos.card}</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Bank Transfer')}
                className={`flex items-center justify-center gap-1 rounded-xl py-2 text-xs font-bold transition-all ${
                  paymentMethod === 'Bank Transfer'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                }`}
              >
                <Building className="h-3.5 w-3.5" />
                <span>{t.pos.bankTransfer}</span>
              </button>
            </div>

            {/* Tender input */}
            {paymentMethod === 'Cash' && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-300">{t.pos.tendered}:</span>
                  <div className="flex gap-1">
                    {[500, 1000, 2000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmountTendered(String(val))}
                        className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                      >
                        ৳{val}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setAmountTendered(grandTotal.toFixed(0))}
                      className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-400 hover:bg-slate-100"
                    >
                      Exact
                    </button>
                  </div>
                </div>

                <input
                  type="number"
                  step="1"
                  value={amountTendered}
                  onChange={(e) => setAmountTendered(e.target.value)}
                  placeholder={`৳${grandTotal.toFixed(0)}`}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 font-mono text-xs font-bold text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                />

                {changeDue > 0 && (
                  <div className="flex justify-between text-xs font-bold text-emerald-800 dark:text-emerald-400">
                    <span>{t.pos.changeDue}:</span>
                    <span className="font-mono tabular-nums">৳{changeDue.toFixed(0)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Print and Checkout Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleCheckout(true)}
                disabled={cart.length === 0}
                className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 disabled:opacity-40 transition-all active:scale-98 cursor-pointer"
                title="Complete sale and immediately open thermal printer dialog (F4)"
              >
                <Printer className="h-4 w-4" />
                <span>{lang === 'bn' ? 'রসিদ প্রিন্ট' : 'Print Receipt'}</span>
                <kbd className="text-[10px] font-mono px-1 py-0.2 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100">F4</kbd>
              </button>

              <button
                type="button"
                onClick={() => handleCheckout(false)}
                disabled={cart.length === 0}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 dark:bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 dark:hover:bg-emerald-700 disabled:opacity-40 transition-all active:scale-98 cursor-pointer"
                title="Complete sale (F2 or Ctrl+Enter)"
              >
                <CheckCircle className="h-4 w-4 text-emerald-400 dark:text-white" />
                <span>{lang === 'bn' ? 'বিক্রয় সম্পন্ন' : 'Complete Sale'}</span>
                <kbd className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-700 dark:bg-emerald-800 text-slate-100">F2</kbd>
              </button>
            </div>
          </div>
        </div>
      </div>

      {lastCompletedSale && (
        <ReceiptModal
          isOpen={isReceiptOpen}
          onClose={() => {
            setIsReceiptOpen(false);
            setAutoTriggerPrint(false);
          }}
          lang={lang}
          businessSettings={businessSettings}
          invoiceSettings={invoiceSettings}
          branchLocation={branchLocation}
          autoTriggerPrint={autoTriggerPrint}
          {...lastCompletedSale}
        />
      )}
    </div>
  );
};
