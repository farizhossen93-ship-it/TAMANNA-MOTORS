import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  Search, 
  Phone, 
  CheckCircle, 
  AlertCircle, 
  DollarSign, 
  Printer, 
  MessageSquare, 
  Calendar, 
  User, 
  FileText, 
  Clock, 
  Check, 
  Copy, 
  ArrowUpRight, 
  Filter, 
  Sparkles,
  RefreshCw,
  Plus,
  ShieldAlert,
  Building,
  Banknote
} from 'lucide-react';
import { Sale, DuePaymentRecord, AuthUser, BusinessSettings, InvoiceSettings } from '../types';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface SyncedDuesViewProps {
  sales: Sale[];
  onUpdateSale: (updatedSale: Sale) => void;
  onOpenReceipt: (sale: Sale, isMoneyReceipt?: boolean) => void;
  currentUser: AuthUser | null;
  businessSettings?: BusinessSettings;
  invoiceSettings?: InvoiceSettings;
  lang?: Language;
}

export const SyncedDuesView: React.FC<SyncedDuesViewProps> = ({
  sales,
  onUpdateSale,
  onOpenReceipt,
  currentUser,
  businessSettings,
  invoiceSettings,
  lang = 'en'
}) => {
  const t = TRANSLATIONS[lang];
  const currencySymbol = businessSettings?.currencySymbol || '৳';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unpaid' | 'partial' | 'paid'>('all');
  const [selectedSaleForPayment, setSelectedSaleForPayment] = useState<Sale | null>(null);
  
  // Payment Modal state
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'bKash/Nagad' | 'Card' | 'Bank Transfer'>('Cash');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Filter sales that have or had due
  const dueSales = useMemo(() => {
    return sales.filter(s => {
      // Must be a sale that has invoiceDue > 0 or paymentStatus === 'Due' or 'Partial' or has duePayments history
      return (s.invoiceDue !== undefined && s.invoiceDue > 0) || 
             s.paymentStatus === 'Due' || 
             s.paymentStatus === 'Partial' || 
             (s.duePayments && s.duePayments.length > 0);
    });
  }, [sales]);

  // Calculations for KPI cards
  const totalOutstandingDue = useMemo(() => {
    return dueSales.reduce((sum, s) => {
      if (s.paymentStatus === 'Paid') return sum;
      const due = s.invoiceDue !== undefined ? s.invoiceDue : Math.max(0, s.totalAmount - (s.amountTendered || 0));
      return sum + due;
    }, 0);
  }, [dueSales]);

  const totalCollectedDues = useMemo(() => {
    return dueSales.reduce((sum, s) => {
      if (!s.duePayments) return sum;
      return sum + s.duePayments.reduce((pSum, p) => pSum + p.amountPaid, 0);
    }, 0);
  }, [dueSales]);

  const activeDueCount = useMemo(() => {
    return dueSales.filter(s => s.paymentStatus !== 'Paid' && ((s.invoiceDue || 0) > 0 || (s.totalAmount - (s.amountTendered || 0)) > 0)).length;
  }, [dueSales]);

  const settledDueCount = useMemo(() => {
    return dueSales.filter(s => s.paymentStatus === 'Paid').length;
  }, [dueSales]);

  // Filtered list based on search and tab
  const filteredList = useMemo(() => {
    return dueSales.filter(s => {
      const currentDue = s.invoiceDue !== undefined ? s.invoiceDue : Math.max(0, s.totalAmount - (s.amountTendered || 0));
      const isPaid = s.paymentStatus === 'Paid' || currentDue <= 0;
      const isPartial = !isPaid && (s.amountTendered || 0) > 0;
      const isUnpaid = !isPaid && (s.amountTendered || 0) <= 0;

      if (filterTab === 'unpaid' && !isUnpaid) return false;
      if (filterTab === 'partial' && !isPartial) return false;
      if (filterTab === 'paid' && !isPaid) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        s.invoiceNo.toLowerCase().includes(q) ||
        s.customerName.toLowerCase().includes(q) ||
        (s.customerPhone && s.customerPhone.toLowerCase().includes(q)) ||
        s.saleDate.toLowerCase().includes(q)
      );
    });
  }, [dueSales, filterTab, searchQuery]);

  // Open Payment Modal
  const handleOpenPaymentModal = (sale: Sale) => {
    const currentDue = sale.invoiceDue !== undefined ? sale.invoiceDue : Math.max(0, sale.totalAmount - (sale.amountTendered || 0));
    setSelectedSaleForPayment(sale);
    setPaymentAmount(currentDue.toString());
    setPaymentMethod('Cash');
    setPaymentNotes('');
  };

  // Submit Due Payment
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSaleForPayment) return;

    const payAmt = parseFloat(paymentAmount);
    if (isNaN(payAmt) || payAmt <= 0) {
      alert(lang === 'bn' ? 'সঠিক পরিশোধিত টাকার পরিমাণ লিখুন।' : 'Please enter a valid payment amount.');
      return;
    }

    const currentDue = selectedSaleForPayment.invoiceDue !== undefined 
      ? selectedSaleForPayment.invoiceDue 
      : Math.max(0, selectedSaleForPayment.totalAmount - (selectedSaleForPayment.amountTendered || 0));

    if (payAmt > currentDue) {
      alert(lang === 'bn' ? `পরিশোধিত টাকা বাকি টাকার (${currencySymbol}${currentDue.toLocaleString()}) চেয়ে বেশি হতে পারে না।` : `Payment amount cannot exceed current due of ${currencySymbol}${currentDue.toLocaleString()}`);
      return;
    }

    const remainingDue = Math.max(0, currentDue - payAmt);
    const newTendered = (selectedSaleForPayment.amountTendered || 0) + payAmt;
    const newStatus: 'Paid' | 'Partial' | 'Due' = remainingDue <= 0 ? 'Paid' : 'Partial';

    const now = new Date();
    const dateStr = now.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const newPaymentRecord: DuePaymentRecord = {
      id: `due-pay-${Date.now()}`,
      paymentDate: dateStr,
      amountPaid: payAmt,
      paymentMethod,
      remainingDue,
      receivedBy: currentUser?.name || (lang === 'bn' ? 'ক্যাশিয়ার' : 'Authorized Cashier'),
      notes: paymentNotes.trim()
    };

    const updatedSale: Sale = {
      ...selectedSaleForPayment,
      amountTendered: newTendered,
      invoiceDue: remainingDue,
      paymentStatus: newStatus,
      duePayments: [...(selectedSaleForPayment.duePayments || []), newPaymentRecord]
    };

    onUpdateSale(updatedSale);
    setSelectedSaleForPayment(null);

    showNotification(
      lang === 'bn'
        ? `চালান ${updatedSale.invoiceNo} এর জন্য ${currencySymbol}${payAmt.toLocaleString()} টাকা বকেয়া জমা সফলভাবে সম্পন্ন হয়েছে!`
        : `Due payment of ${currencySymbol}${payAmt.toLocaleString()} for Invoice ${updatedSale.invoiceNo} recorded successfully!`
    );

    // Automatically trigger receipt modal
    setTimeout(() => {
      onOpenReceipt(updatedSale, true);
    }, 400);
  };

  // Copy SMS / WhatsApp Reminder
  const handleCopyReminder = (sale: Sale) => {
    const currentDue = sale.invoiceDue !== undefined ? sale.invoiceDue : Math.max(0, sale.totalAmount - (sale.amountTendered || 0));
    const phone = businessSettings?.contactPhone || '01626666906, 01878934956';
    const address = businessSettings?.address || 'HAZIGONJ-KACHUA MAIN ROAD, WEST BAZAR, HAZIGONJ, CHANDPUR.';
    
    const msg = lang === 'bn'
      ? `সম্মানিত গ্রাহক ${sale.customerName}, তামান্না মোটরস (TAMANNA MOTORS) এ আপনার মেমো নং [${sale.invoiceNo}] এর অবশিষ্ট বকেয়া ${currencySymbol}${currentDue.toLocaleString()} টাকা। অনুগ্রহপূর্বক বকেয়া পরিশোধ করার জন্য অনুরোধ করা হচ্ছে। শোরুম: ${address}, যোগাযোগ: ${phone}। ধন্যবাদ!`
      : `Dear Customer ${sale.customerName}, this is a gentle reminder from TAMANNA MOTORS regarding your outstanding due of ${currencySymbol}${currentDue.toLocaleString()} for Invoice [${sale.invoiceNo}]. Location: ${address}, Contact: ${phone}. Thank you!`;

    navigator.clipboard.writeText(msg);
    setCopiedId(sale.id);
    showNotification(lang === 'bn' ? 'বকেয়া তাগাদার এসএমএস মেসেজ কপি হয়েছে!' : 'SMS Reminder message copied to clipboard!');
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      {notification && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 p-3.5 text-xs font-bold text-emerald-900 dark:text-emerald-200 shadow-md animate-in fade-in">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>{lang === 'bn' ? 'বকেয়া ও দেনা-পাওনা খতিয়ান' : 'Synced Dues & Credit Ledger'}</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 font-bold">
                  {activeDueCount} {lang === 'bn' ? 'টি বাকি' : 'Pending'}
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {lang === 'bn' 
                  ? 'তামান্না মোটরসের সকল বিক্রয়ের কাস্টমার বাকি, আংশিক পরিশোধ, কিস্তির টাকা জমা ও অটোমেটিক মানি রিসিট।' 
                  : 'Real-time customer receivables, installments collection, money receipt generation, and SMS reminder desk.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Outstanding Due */}
        <div className="relative overflow-hidden rounded-3xl border border-rose-200 dark:border-rose-900/60 bg-gradient-to-br from-rose-50/90 via-white to-rose-100/40 dark:from-rose-950/40 dark:via-slate-900 dark:to-rose-900/20 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
              {lang === 'bn' ? 'মোট বর্তমান বকেয়া' : 'Total Outstanding Due'}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-rose-950 dark:text-rose-200 tabular-nums">
              {currencySymbol}{totalOutstandingDue.toLocaleString('en-US')}
            </span>
            <p className="text-[11px] text-rose-700 dark:text-rose-400 font-medium mt-1">
              {activeDueCount} {lang === 'bn' ? 'টি চালানে বকেয়া রয়েছে' : 'active due invoices'}
            </p>
          </div>
        </div>

        {/* Card 2: Total Recovered Dues */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-50/90 via-white to-emerald-100/40 dark:from-emerald-950/40 dark:via-slate-900 dark:to-emerald-900/20 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              {lang === 'bn' ? 'বকেয়া আদায়কৃত টাকা' : 'Total Due Recovered'}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-950 dark:text-emerald-200 tabular-nums">
              {currencySymbol}{totalCollectedDues.toLocaleString('en-US')}
            </span>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-1">
              {settledDueCount} {lang === 'bn' ? 'টি চালানের সম্পূর্ণ বাকি পরিশোধ' : 'fully settled invoices'}
            </p>
          </div>
        </div>

        {/* Card 3: Active Due Accounts */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-200 dark:border-amber-900/60 bg-gradient-to-br from-amber-50/90 via-white to-amber-100/40 dark:from-amber-950/40 dark:via-slate-900 dark:to-amber-900/20 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              {lang === 'bn' ? 'অপেক্ষমাণ বাকি চালান' : 'Pending Invoices'}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-950 dark:text-amber-200 tabular-nums">
              {activeDueCount}
            </span>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium mt-1">
              {lang === 'bn' ? 'জরুরি আদায় তালিকা' : 'Requires collection follow-up'}
            </p>
          </div>
        </div>

        {/* Card 4: Store Location & Auto Sync */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {lang === 'bn' ? 'শোরুম ডাটাবেজ সিঙ্ক' : 'Showroom Live Sync'}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-600">
              <RefreshCw className="h-4 w-4 animate-spin-slow" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-sm font-black text-slate-900 dark:text-white block truncate">
              {businessSettings?.primaryLocation || 'Hazigonj Branch'}
            </span>
            <p className="text-[11px] text-slate-500 font-medium mt-1 truncate">
              {businessSettings?.address || 'Hazigonj, Chandpur'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {lang === 'bn' ? 'সকল বাকি (' : 'All Dues ('}{dueSales.length})
          </button>

          <button
            onClick={() => setFilterTab('unpaid')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'unpaid'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            {lang === 'bn' ? 'সম্পূর্ণ বাকি' : 'Unpaid Only'}
          </button>

          <button
            onClick={() => setFilterTab('partial')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'partial'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            {lang === 'bn' ? 'আংশিক পরিশোধ' : 'Partial Paid'}
          </button>

          <button
            onClick={() => setFilterTab('paid')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'paid'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            {lang === 'bn' ? 'পরিশোধিত লগ' : 'Settled History'}
          </button>
        </div>

        {/* Search Box */}
        <div className="relative min-w-[260px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'bn' ? 'গ্রাহকের নাম, মোবাইল বা চালান নং দিয়ে খুঁজুন...' : 'Search customer, phone or invoice...'}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Dues Table List */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 font-bold text-slate-700 dark:text-slate-300">
                <th className="py-3 px-4">চালান নং ও তারিখ</th>
                <th className="py-3 px-4">গ্রাহক ও মোবাইল নম্বর</th>
                <th className="py-3 px-4 text-right">মোট বিক্রয় ({currencySymbol})</th>
                <th className="py-3 px-4 text-right">জমা হয়েছে ({currencySymbol})</th>
                <th className="py-3 px-4 text-right">বর্তমান বাকি ({currencySymbol})</th>
                <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                <th className="py-3 px-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 dark:text-slate-500">
                    <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-40 stroke-[1.5]" />
                    <p className="font-bold">{lang === 'bn' ? 'কোনো বকেয়া পাওয়া যায়নি' : 'No dues records found'}</p>
                    <p className="text-[11px] mt-0.5">{lang === 'bn' ? 'পিওএস বা বিক্রয়ের সময় বাকি অপশন ব্যবহার করলে এখানে স্বয়ংক্রিয়ভাবে সিঙ্ক হবে।' : 'Dues created during checkout will appear here automatically.'}</p>
                  </td>
                </tr>
              ) : (
                filteredList.map((sale) => {
                  const currentDue = sale.invoiceDue !== undefined ? sale.invoiceDue : Math.max(0, sale.totalAmount - (sale.amountTendered || 0));
                  const isPaid = sale.paymentStatus === 'Paid' || currentDue <= 0;
                  const isPartial = !isPaid && (sale.amountTendered || 0) > 0;

                  return (
                    <tr 
                      key={sale.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Invoice & Date */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">
                          {sale.invoiceNo}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span>{sale.saleDate}</span>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          <span>{sale.customerName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
                          {sale.customerPhone ? (
                            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-bold">
                              <Phone className="h-2.5 w-2.5 text-emerald-500" />
                              <span>{sale.customerPhone}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400">Regular Customer</span>
                          )}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3 px-4 text-right font-medium text-slate-700 dark:text-slate-300 font-mono tabular-nums">
                        {currencySymbol}{sale.totalAmount.toLocaleString('en-US')}
                      </td>

                      {/* Paid Amount */}
                      <td className="py-3 px-4 text-right font-bold text-emerald-700 dark:text-emerald-400 font-mono tabular-nums">
                        {currencySymbol}{(sale.amountTendered || 0).toLocaleString('en-US')}
                      </td>

                      {/* Current Due */}
                      <td className="py-3 px-4 text-right">
                        {currentDue > 0 ? (
                          <span className="font-black text-rose-600 dark:text-rose-400 font-mono tabular-nums text-sm bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-900">
                            {currencySymbol}{currentDue.toLocaleString('en-US')}
                          </span>
                        ) : (
                          <span className="font-bold text-emerald-600 font-mono text-xs">
                            {currencySymbol}0.00
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            <CheckCircle className="h-3 w-3" />
                            <span>{lang === 'bn' ? 'পরিশোধিত' : 'Paid'}</span>
                          </span>
                        ) : isPartial ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            <AlertCircle className="h-3 w-3" />
                            <span>{lang === 'bn' ? 'আংশিক বাকি' : 'Partial'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                            <AlertCircle className="h-3 w-3" />
                            <span>{lang === 'bn' ? 'সম্পূর্ণ বাকি' : 'Due'}</span>
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Collect Due Button */}
                          {currentDue > 0 && (
                            <button
                              onClick={() => handleOpenPaymentModal(sale)}
                              className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-105 text-white px-3 py-1.5 text-xs font-black shadow-xs active:scale-95 transition-all cursor-pointer"
                              title={lang === 'bn' ? 'বকেয়া টাকা জমা নিন' : 'Collect Due Payment'}
                            >
                              <DollarSign className="h-3.5 w-3.5" />
                              <span>{lang === 'bn' ? 'জমা নিন' : 'Pay Due'}</span>
                            </button>
                          )}

                          {/* Print Invoice / Money Receipt */}
                          <button
                            onClick={() => onOpenReceipt(sale, isPaid ? false : true)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 transition-colors shadow-xs cursor-pointer"
                            title={lang === 'bn' ? 'A4 চালান / মানি রিসিট প্রিন্ট করুন' : 'Print A4 Invoice / Receipt'}
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </button>

                          {/* Copy SMS Reminder */}
                          {currentDue > 0 && (
                            <button
                              onClick={() => handleCopyReminder(sale)}
                              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-xs cursor-pointer"
                              title={lang === 'bn' ? 'বকেয়া তাগাদা এসএমএস টেক্সট কপি করুন' : 'Copy SMS / WhatsApp Reminder'}
                            >
                              {copiedId === sale.id ? (
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                              ) : (
                                <MessageSquare className="h-3.5 w-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Due Payment Modal */}
      {selectedSaleForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div 
            className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
                  <Banknote className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {lang === 'bn' ? 'বকেয়া টাকা জমা গ্রহণ' : 'Collect Due Payment'}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Invoice: {selectedSaleForPayment.invoiceNo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSaleForPayment(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Customer & Current Due Summary */}
            <div className="mt-4 p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-800 dark:text-rose-300">
                  {lang === 'bn' ? 'গ্রাহক ও বর্তমান বাকি' : 'Customer & Current Due'}
                </span>
                <div className="font-extrabold text-slate-900 dark:text-white text-sm mt-0.5">
                  {selectedSaleForPayment.customerName}
                </div>
                {selectedSaleForPayment.customerPhone && (
                  <p className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                    {selectedSaleForPayment.customerPhone}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">বাকি টাকা</span>
                <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">
                  {currencySymbol}{(selectedSaleForPayment.invoiceDue !== undefined ? selectedSaleForPayment.invoiceDue : Math.max(0, selectedSaleForPayment.totalAmount - (selectedSaleForPayment.amountTendered || 0))).toLocaleString('en-US')}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmitPayment} className="mt-4 space-y-4 text-xs">
              {/* Payment Amount Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {lang === 'bn' ? 'জমা নেওয়ার পরিমাণ (৳) *' : 'Amount Paying Now (৳) *'}
                  </label>
                  {/* Quick percentage buttons */}
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const due = selectedSaleForPayment.invoiceDue !== undefined ? selectedSaleForPayment.invoiceDue : Math.max(0, selectedSaleForPayment.totalAmount - (selectedSaleForPayment.amountTendered || 0));
                        setPaymentAmount(Math.round(due / 2).toString());
                      }}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const due = selectedSaleForPayment.invoiceDue !== undefined ? selectedSaleForPayment.invoiceDue : Math.max(0, selectedSaleForPayment.totalAmount - (selectedSaleForPayment.amountTendered || 0));
                        setPaymentAmount(due.toString());
                      }}
                      className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200"
                    >
                      {lang === 'bn' ? 'সম্পূর্ণ বাকি' : 'Full Due'}
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedSaleForPayment.invoiceDue !== undefined ? selectedSaleForPayment.invoiceDue : Math.max(0, selectedSaleForPayment.totalAmount - (selectedSaleForPayment.amountTendered || 0))}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 font-mono text-base font-black text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                  placeholder="0.00"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'পেমেন্ট মাধ্যম *' : 'Payment Method *'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Cash', 'bKash/Nagad', 'Card', 'Bank Transfer'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        paymentMethod === m
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'পেমেন্ট নোট / রেফারেন্স (ঐচ্ছিক)' : 'Payment Notes / Trx ID (Optional)'}
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. bKash TrxID: 9X87KL2, Paid at showroom"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSaleForPayment(null)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-105 px-6 py-2.5 font-black text-white shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
                >
                  {lang === 'bn' ? 'জমা নিশ্চিত করুন ও রসিদ প্রিন্ট' : 'Confirm & Print Money Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
