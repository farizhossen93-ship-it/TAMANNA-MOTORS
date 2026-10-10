import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  CreditCard,
  AlertCircle,
  ShoppingBag,
  Clock,
  RotateCcw,
  Receipt,
  Plus,
  ShoppingCart,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Wrench,
  BarChart3,
  Target,
  Calendar,
  Layers,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Zap,
  CheckCircle,
  ExternalLink,
  Crown
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { MonthlySalesData } from '../data/mockData';
import { Product, Sale, Purchase, Expense, UserRole } from '../types';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface DashboardViewProps {
  onOpenPos: () => void;
  onNavigate: (route: string) => void;
  products: Product[];
  sales: Sale[];
  purchases?: Purchase[];
  expenses?: Expense[];
  lang?: Language;
  userRole?: UserRole;
  onQuickRestock?: (productId: string, amount: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenPos,
  onNavigate,
  products,
  sales,
  purchases = [],
  expenses = [],
  lang = 'en',
  userRole = 'super_admin',
  onQuickRestock
}) => {
  const t = TRANSLATIONS[lang];
  const [monthlyViewMode, setMonthlyViewMode] = useState<'comparison' | 'target' | 'mom'>('comparison');
  const [lowStockFilter, setLowStockFilter] = useState<'all' | 'out_of_stock' | 'critical'>('all');
  const [hoveredPoint, setHoveredPoint] = useState<{
    day: string;
    date: string;
    amount: number;
    x: number;
    y: number;
  } | null>(null);

  // Dynamic Last 7 Days Total Sales calculation for Recharts Bar Chart
  const last7DaysSalesData = useMemo(() => {
    const daysArr = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayName = d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'short' });
      const dateFormatted = d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short' });

      // Match actual sales for this date
      const daySales = (sales || []).filter(s => {
        if (!s.saleDate) return false;
        try {
          const sDate = new Date(s.saleDate);
          return (
            sDate.getDate() === d.getDate() &&
            sDate.getMonth() === d.getMonth() &&
            sDate.getFullYear() === d.getFullYear()
          );
        } catch {
          return false;
        }
      });

      const actualSum = daySales.reduce((acc, s) => acc + (Number(s.totalAmount) || 0), 0);
      const actualInvoices = daySales.length;

      daysArr.push({
        day: dayName,
        date: dateFormatted,
        totalSales: actualSum,
        invoices: actualInvoices,
        avgTicket: actualInvoices > 0 ? Math.round(actualSum / actualInvoices) : 0
      });
    }
    return daysArr;
  }, [sales, lang]);

  const total7DaysSales = useMemo(() => 
    last7DaysSalesData.reduce((acc, d) => acc + d.totalSales, 0),
    [last7DaysSalesData]
  );
  const avg7DaysDaily = Math.round(total7DaysSales / 7);
  const total7DaysInvoices = useMemo(() => 
    last7DaysSalesData.reduce((acc, d) => acc + d.invoices, 0),
    [last7DaysSalesData]
  );
  const peakDaySales = useMemo(() => 
    [...last7DaysSalesData].sort((a, b) => b.totalSales - a.totalSales)[0],
    [last7DaysSalesData]
  );

  // Key metrics calculation for TAMANNA MOTORS (in BDT ৳)
  const totalSalesValue = useMemo(() => 
    (sales || []).reduce((acc, s) => acc + (Number(s.totalAmount) || 0), 0),
    [sales]
  );
  const netSalesValue = useMemo(() => 
    (sales || []).reduce((acc, s) => acc + ((Number(s.totalAmount) || 0) - (Number(s.taxAmount) || 0)), 0),
    [sales]
  );
  const invoiceDueValue = useMemo(() => 
    (sales || []).reduce((acc, s) => acc + (Number(s.invoiceDue) || 0), 0),
    [sales]
  );
  const totalPurchaseValue = useMemo(() => 
    (purchases || []).reduce((acc, p) => acc + (Number(p.grandTotal) || 0), 0),
    [purchases]
  );
  const purchaseDueValue = useMemo(() => 
    (purchases || []).reduce((acc, p) => acc + (Number(p.paymentDue) || 0), 0),
    [purchases]
  );
  const totalPurchaseReturnValue = 0.00;
  const totalExpensesValue = useMemo(() => 
    (expenses || []).reduce((acc, e) => acc + (Number(e.amount) || 0), 0),
    [expenses]
  );

  // Dynamic 30 Days sales calculation from real sales
  const last30DaysSalesData = useMemo(() => {
    const daysArr = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayName = d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short' });
      const dateFormatted = d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short' });

      const daySales = (sales || []).filter(s => {
        if (!s.saleDate) return false;
        try {
          const sDate = new Date(s.saleDate);
          return (
            sDate.getDate() === d.getDate() &&
            sDate.getMonth() === d.getMonth() &&
            sDate.getFullYear() === d.getFullYear()
          );
        } catch {
          return false;
        }
      });

      const actualSum = daySales.reduce((acc, s) => acc + (Number(s.totalAmount) || 0), 0);
      daysArr.push({
        day: dayName,
        date: dateFormatted,
        amount: actualSum
      });
    }
    return daysArr;
  }, [sales, lang]);

  const total30DaysSales = useMemo(() => 
    last30DaysSalesData.reduce((acc, d) => acc + d.amount, 0),
    [last30DaysSalesData]
  );

  // Chart coordinate calculations
  const chartHeight = 220;
  const chartWidth = 720;
  const padding = { top: 25, right: 30, bottom: 35, left: 60 };

  const amounts = last30DaysSalesData.map(d => d.amount);
  const maxDayAmount = Math.max(...amounts, 100);
  const minAmount = 0;
  const maxAmount = maxDayAmount * 1.15;

  const points = last30DaysSalesData.map((item, index) => {
    const x = padding.left + (index / Math.max(1, last30DaysSalesData.length - 1)) * (chartWidth - padding.left - padding.right);
    const y = padding.top + (1 - (item.amount - minAmount) / Math.max(1, maxAmount - minAmount)) * (chartHeight - padding.top - padding.bottom);
    return { ...item, x, y };
  });

  const linePath = points.reduce((acc, point, i) => {
    return i === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, '');

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - padding.bottom} L ${points[0].x} ${chartHeight - padding.bottom} Z`
    : '';

  // Dynamic monthly sales calculation from real sales
  const monthlySalesPerformance = useMemo<MonthlySalesData[]>(() => {
    const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthNamesBn = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];
    const currentYear = new Date().getFullYear();
    const currentMonthIdx = new Date().getMonth();

    const result: MonthlySalesData[] = [];
    let prevMonthAmount = 0;

    for (let m = 0; m <= currentMonthIdx; m++) {
      const monthSales = (sales || []).filter(s => {
        if (!s.saleDate) return false;
        try {
          const d = new Date(s.saleDate);
          return d.getFullYear() === currentYear && d.getMonth() === m;
        } catch {
          return false;
        }
      });

      const currentTotal = monthSales.reduce((acc, s) => acc + (Number(s.totalAmount) || 0), 0);
      const ordersCount = monthSales.length;
      const momGrowth = prevMonthAmount > 0
        ? Number((((currentTotal - prevMonthAmount) / prevMonthAmount) * 100).toFixed(1))
        : 0;

      result.push({
        month: monthNamesEn[m],
        monthBn: monthNamesBn[m],
        fullMonth: `${monthNamesEn[m]} ${currentYear}`,
        current2026: currentTotal,
        previous2025: 0,
        prevMonthSales: prevMonthAmount,
        target: 0,
        momGrowth,
        yoyGrowth: 0,
        ordersCount
      });

      prevMonthAmount = currentTotal;
    }

    return result;
  }, [sales]);

  const totalMonthlySalesSum = useMemo(() => 
    monthlySalesPerformance.reduce((acc, m) => acc + m.current2026, 0),
    [monthlySalesPerformance]
  );
  const avgMonthlyRevenue = monthlySalesPerformance.length > 0
    ? Math.round(totalMonthlySalesSum / monthlySalesPerformance.length)
    : 0;
  const bestMonthObj = useMemo(() => {
    if (monthlySalesPerformance.length === 0) return null;
    return [...monthlySalesPerformance].sort((a, b) => b.current2026 - a.current2026)[0];
  }, [monthlySalesPerformance]);
  const currentMonthData = monthlySalesPerformance[monthlySalesPerformance.length - 1];

  // Low stock items
  const lowStockItems = products.filter(p => p.currentStock <= p.alertQuantity);

  return (
    <div className="space-y-6">
      {/* Welcome Banner / Overview Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 shadow-xs lg:flex-row lg:items-center lg:justify-between transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t.dashboard.title}
            </h1>
            <span className="text-xs text-emerald-800 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
              TAMANNA MOTORS
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            {t.dashboard.subtitle}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenPos}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>{t.openPos}</span>
          </button>
          <button
            onClick={() => onNavigate('products-add')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5 text-slate-500" />
            <span>{t.nav.addProduct}</span>
          </button>
          <button
            onClick={() => onNavigate('purchase-add')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5 text-slate-500" />
            <span>{t.nav.addPurchase}</span>
          </button>
        </div>
      </div>

      {/* Top Banner Alert when Low Stock exists */}
      {lowStockItems.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-amber-300 dark:border-amber-800/80 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-rose-500/10 dark:from-amber-950/40 dark:to-rose-950/30 p-4 shadow-xs animate-in fade-in transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  {t.dashboard.lowStockAlertTitle}
                </span>
                <span className="rounded-full bg-rose-500 text-white text-[10px] font-black px-2 py-0.5">
                  {lowStockItems.length} {lang === 'bn' ? 'টি সতর্কবার্তা' : 'Items Alert'}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                {lang === 'bn'
                  ? `${lowStockItems.length} টি মোটর পার্টসের বর্তমান স্টক সতর্কবার্তা সীমার সমান বা নিচে রয়েছে। এক ক্লিকে ইনভেন্টরি তালিকা দেখুন।`
                  : `${lowStockItems.length} products currently have stock less than or equal to their alert quantity.`}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('products-list')}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white px-4 py-2.5 text-xs font-bold shadow-xs whitespace-nowrap transition-all active:scale-98"
          >
            <Package className="h-4 w-4" />
            <span>{t.dashboard.oneClickToInventory}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Summary Widgets (Cards) - All 7 Required Metrics */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {/* 1. Total Sales */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{t.dashboard.totalSales}</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold font-mono tracking-tight tabular-nums text-slate-900 dark:text-white">
              ৳{totalSalesValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-800 dark:text-emerald-400 font-medium">
              <ArrowUpRight className="h-3 w-3" />
              <span>+14.8% {lang === 'bn' ? 'গত মাস তুলনায়' : 'vs last mo'}</span>
            </div>
          </div>
        </div>

        {/* 2. Net Sales */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{t.dashboard.netSales}</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold font-mono tracking-tight tabular-nums text-slate-900 dark:text-white">
              ৳{netSalesValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </div>
            <div className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">
              {lang === 'bn' ? 'ছাড় ও ভ্যাট বাদে' : 'After discounts & tax'}
            </div>
          </div>
        </div>

        {/* 3. Invoice Due */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{t.dashboard.invoiceDue}</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold font-mono tracking-tight tabular-nums text-amber-600 dark:text-amber-400">
              ৳{invoiceDueValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </div>
            <div className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">
              {lang === 'bn' ? 'গ্রাহকদের নিকট পাওনা' : 'Receivables to collect'}
            </div>
          </div>
        </div>

        {/* 4. Total Purchase */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{t.dashboard.totalPurchase}</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold font-mono tracking-tight tabular-nums text-slate-900 dark:text-white">
              ৳{totalPurchaseValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </div>
            <div className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">
              {lang === 'bn' ? 'আমদানি ও ক্রয় পার্টস' : 'Inbound stock supply'}
            </div>
          </div>
        </div>

        {/* 5. Purchase Due */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{t.dashboard.purchaseDue}</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold font-mono tracking-tight tabular-nums text-rose-600 dark:text-rose-400">
              ৳{purchaseDueValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </div>
            <div className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">
              {lang === 'bn' ? 'সাপ্লায়ার দেনা' : 'Vendor payables due'}
            </div>
          </div>
        </div>

        {/* 6. Total Purchase Return */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{t.dashboard.purchaseReturn}</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <RotateCcw className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold font-mono tracking-tight tabular-nums text-slate-900 dark:text-white">
              ৳{totalPurchaseReturnValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </div>
            <div className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">
              {lang === 'bn' ? 'ফেরতকৃত পার্টসের মূল্য' : 'Returned parts value'}
            </div>
          </div>
        </div>

        {/* 7. Total Expenses */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{t.dashboard.totalExpenses}</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold font-mono tracking-tight tabular-nums text-slate-900 dark:text-white">
              ৳{totalExpensesValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </div>
            <div className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">
              {lang === 'bn' ? 'দোকান ভাড়া, বেতন ও বিল' : 'Rent, bills & wages'}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* Total Sales for the Last 7 Days (Recharts Bar Chart) */}
      {/* ============================================================== */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-colors">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <BarChart3 className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                {lang === 'bn' ? 'বিগত ৭ দিনের মোট বিক্রয় (Bar Chart)' : 'Total Sales for the Last 7 Days (Bar Chart)'}
              </h3>
              <span className="rounded-md bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                Recharts
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              {lang === 'bn'
                ? 'তামান্না মোটরসের সকল কাউন্টারের বিগত ৭ দিনের মোট রাজস্ব ও অর্ডারের রিচার্টস বার চার্ট।'
                : 'Interactive Recharts bar visualization showing daily retail revenue & order volumes.'}
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5 border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-300 tracking-wider">
                {lang === 'bn' ? '৭ দিনে মোট' : '7-Day Total'}
              </div>
              <div className="text-sm font-black font-mono text-emerald-800 dark:text-emerald-300 mt-0.5 tabular-nums">
                ৳{total7DaysSales.toLocaleString('en-US')}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5 border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-300 tracking-wider">
                {lang === 'bn' ? 'দৈনিক গড়' : 'Daily Average'}
              </div>
              <div className="text-sm font-black font-mono text-slate-800 dark:text-slate-100 mt-0.5 tabular-nums">
                ৳{avg7DaysDaily.toLocaleString('en-US')}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5 border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-300 tracking-wider">
                {lang === 'bn' ? 'সর্বোচ্চ বিক্রয় দিন' : 'Peak Day'}
              </div>
              <div className="text-sm font-black text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1">
                <span>{peakDaySales.day}</span>
                <span className="text-[10px] font-mono tabular-nums text-slate-600 dark:text-slate-300">
                  (৳{peakDaySales.totalSales.toLocaleString('en-US')})
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5 border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-300 tracking-wider">
                {lang === 'bn' ? 'মোট চালান' : 'Invoices'}
              </div>
              <div className="text-sm font-black font-mono text-indigo-800 dark:text-indigo-300 mt-0.5 tabular-nums">
                {total7DaysInvoices} {lang === 'bn' ? 'টি' : 'orders'}
              </div>
            </div>
          </div>
        </div>

        {/* Recharts BarChart Container */}
        <div className="mt-4 w-full h-[270px] select-none">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={last7DaysSalesData}
              margin={{ top: 20, right: 15, bottom: 5, left: 10 }}
            >
              <defs>
                <linearGradient id="bar7DayGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
                className="dark:stroke-slate-800"
              />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }}
              />
              <YAxis
                tickFormatter={(val: number) => `৳${(val / 1000).toFixed(0)}k`}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                tick={{ fill: '#64748b', fontSize: 11 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-xl text-xs space-y-1">
                        <div className="font-extrabold text-slate-900 dark:text-white flex items-center justify-between gap-3">
                          <span>{data.day} ({data.date})</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                            {data.invoices} {lang === 'bn' ? 'চালান' : 'invoices'}
                          </span>
                        </div>
                        <div className="text-emerald-800 dark:text-emerald-300 font-black text-sm font-mono">
                          ৳{data.totalSales.toLocaleString('en-US')}
                        </div>
                        <div className="text-[10px] text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-700 pt-1">
                          {lang === 'bn' ? 'গড় অর্ডার মান:' : 'Avg ticket:'} ৳{data.avgTicket.toLocaleString('en-US')}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="totalSales"
                name={lang === 'bn' ? 'মোট বিক্রয়' : 'Total Sales'}
                fill="url(#bar7DayGrad)"
                radius={[6, 6, 0, 0]}
                maxBarSize={55}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Visuals Grid: "Sales Last 30 Days" Line Chart & Low Stock */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sales Last 30 Days - Line Chart (Takes 2 Columns) */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs lg:col-span-2 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  {t.dashboard.salesLast30Days}
                </h3>
                <span className="text-xs text-slate-600 dark:text-slate-300">· {t.dashboard.dailyRevenueTrend}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {lang === 'bn' 
                  ? 'তামান্না মোটরসের সকল শাখা ও কাউন্টারের বিগত ৩০ দিনের বিক্রয় গ্রাফ।' 
                  : 'Past 30 days daily gross revenue across all Tamanna Motors retail registers.'}
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-300">{lang === 'bn' ? 'দৈনিক বিক্রয়' : 'Daily Revenue'}</span>
              </div>
              <div className="font-mono text-slate-900 dark:text-white font-semibold tabular-nums">
                30-Day: ৳{total30DaysSales.toLocaleString('en-US')}
              </div>
            </div>
          </div>

          {/* Interactive SVG Line Chart */}
          <div className="relative mt-4 w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = padding.top + ratio * (chartHeight - padding.top - padding.bottom);
                const value = Math.round(maxAmount - ratio * (maxAmount - minAmount));
                return (
                  <g key={idx}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={chartWidth - padding.right}
                      y2={y}
                      stroke="currentColor"
                      className="text-slate-200 dark:text-slate-800"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[10px] font-mono fill-slate-400 dark:fill-slate-500"
                    >
                      ৳{(value / 1000).toFixed(0)}k
                    </text>
                  </g>
                );
              })}

              {/* Area Under Curve */}
              <path d={areaPath} fill="url(#salesGrad)" />

              {/* Line Stroke */}
              <path
                d={linePath}
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Points & Hover Target Areas */}
              {points.map((pt, i) => (
                <g key={i}>
                  {(i % 5 === 0 || i === points.length - 1 || hoveredPoint?.date === pt.date) && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={hoveredPoint?.date === pt.date ? "5" : "3"}
                      className={
                        hoveredPoint?.date === pt.date
                          ? "fill-white stroke-emerald-600 stroke-2 dark:fill-slate-900"
                          : "fill-emerald-500"
                      }
                    />
                  )}

                  <rect
                    x={pt.x - 10}
                    y={padding.top}
                    width={20}
                    height={chartHeight - padding.top - padding.bottom}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />

                  {(i % 5 === 0 || i === points.length - 1) && (
                    <text
                      x={pt.x}
                      y={chartHeight - 10}
                      textAnchor="middle"
                      className="text-[10px] font-mono fill-slate-500 dark:fill-slate-400"
                    >
                      {pt.day}
                    </text>
                  )}
                </g>
              ))}

              {hoveredPoint && (
                <line
                  x1={hoveredPoint.x}
                  y1={padding.top}
                  x2={hoveredPoint.x}
                  y2={chartHeight - padding.bottom}
                  stroke="#10B981"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
              )}
            </svg>

            {hoveredPoint && (
              <div
                className="pointer-events-none absolute -top-2 z-20 -translate-x-1/2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-900 text-white px-2.5 py-1.5 shadow-lg"
                style={{
                  left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                }}
              >
                <div className="text-[10px] text-slate-300 font-mono">{hoveredPoint.date}</div>
                <div className="text-xs font-bold font-mono text-emerald-400 tabular-nums">
                  ৳{hoveredPoint.amount.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Comprehensive 'Low Stock Alert' Widget */}
        <div className="flex flex-col rounded-2xl border-2 border-amber-300/80 dark:border-amber-800/80 bg-white dark:bg-slate-900 p-5 shadow-sm transition-colors">
          {/* Widget Header with One-Click link */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                {lowStockItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{t.dashboard.lowStockAlertTitle}</span>
                  {lowStockItems.length > 0 && (
                    <span className="rounded-full bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2">
                      {lowStockItems.length}
                    </span>
                  )}
                </h3>
              </div>
            </div>
            <button
              onClick={() => onNavigate('products-list')}
              className="flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
              title="Navigate to complete inventory list"
            >
              <span>{t.dashboard.viewAll}</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Filter Pills for Low Stock */}
          {lowStockItems.length > 0 && (
            <div className="flex items-center gap-1.5 py-2.5 border-b border-slate-100 dark:border-slate-800 text-[11px]">
              <button
                type="button"
                onClick={() => setLowStockFilter('all')}
                className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                  lowStockFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {lang === 'bn' ? 'সকল' : 'All'} ({lowStockItems.length})
              </button>
              <button
                type="button"
                onClick={() => setLowStockFilter('out_of_stock')}
                className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                  lowStockFilter === 'out_of_stock'
                    ? 'bg-rose-500 text-white font-bold shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {t.dashboard.outOfStock} ({lowStockItems.filter(p => p.currentStock === 0).length})
              </button>
              <button
                type="button"
                onClick={() => setLowStockFilter('critical')}
                className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                  lowStockFilter === 'critical'
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {t.dashboard.criticalStock} ({lowStockItems.filter(p => p.currentStock > 0 && p.currentStock <= Math.ceil(p.alertQuantity / 2)).length})
              </button>
            </div>
          )}

          {/* Low Stock Items List with One-Click Navigation & Progress Bars */}
          <div className="mt-2 flex-1 divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto max-h-[300px] pr-1">
            {lowStockItems.length === 0 ? (
              <div className="py-10 text-center text-xs space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 mx-auto shadow-xs">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="font-bold text-slate-900 dark:text-white">
                  {t.dashboard.allStockHealthy}
                </div>
                <p className="text-[11px] text-slate-500 max-w-[220px] mx-auto">
                  {lang === 'bn' ? 'তামান্না মোটরসের সকল পার্টসের স্টক সন্তোষজনক অবস্থায় রয়েছে।' : 'No products have fallen below minimum reorder thresholds.'}
                </p>
              </div>
            ) : (
              (lowStockFilter === 'out_of_stock'
                ? lowStockItems.filter(p => p.currentStock === 0)
                : lowStockFilter === 'critical'
                ? lowStockItems.filter(p => p.currentStock > 0 && p.currentStock <= Math.ceil(p.alertQuantity / 2))
                : lowStockItems
              ).slice(0, 5).map((item) => {
                const isZero = item.currentStock === 0;
                const isCritical = !isZero && item.currentStock <= Math.ceil(item.alertQuantity / 2);
                const pct = Math.min(100, Math.round((item.currentStock / Math.max(1, item.alertQuantity)) * 100));

                return (
                  <div
                    key={item.id}
                    className="py-3 group flex flex-col gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 p-2 rounded-xl transition-all cursor-pointer"
                    onClick={() => onNavigate('products-list')}
                    title="Click to view in inventory list"
                  >
                    <div className="flex items-start justify-between gap-2 text-xs">
                      <div className="flex items-start gap-2.5">
                        <div className="h-9 w-9 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-400">
                              <Package className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {item.sku} · {item.businessLocation}
                          </div>
                        </div>
                      </div>

                      {/* Stock Level Badge */}
                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block font-mono text-[11px] font-black px-2 py-0.5 rounded-md tabular-nums ${
                            isZero
                              ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                              : isCritical
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                              : 'bg-yellow-100 dark:bg-yellow-950/80 text-yellow-800 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-800'
                          }`}
                        >
                          {item.currentStock} / {item.alertQuantity} {lang === 'bn' ? 'টি' : 'qty'}
                        </span>
                        <div className="text-[10px] font-medium text-slate-500 mt-0.5">
                          ৳{item.sellingPrice.toFixed(0)}
                        </div>
                      </div>
                    </div>

                    {/* Stock level visual bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isZero ? 'bg-rose-600' : isCritical ? 'bg-rose-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.max(5, pct)}%` }}
                      />
                    </div>

                    {/* Super Admin Quick Restock Action */}
                    {userRole === 'super_admin' && onQuickRestock && (
                      <div className="flex items-center justify-between pt-1 text-[10px]" onClick={(e) => e.stopPropagation()}>
                        <span className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
                          <Crown className="h-3 w-3" />
                          <span>{isZero ? t.dashboard.outOfStock : isCritical ? t.dashboard.criticalStock : t.dashboard.lowStockNormal}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => onQuickRestock(item.id, 10)}
                          className="flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-0.5 shadow-xs transition-transform active:scale-95"
                          title="Instantly add +10 stock (Super Admin)"
                        >
                          <Zap className="h-3 w-3" />
                          <span>{t.dashboard.quickRestock}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* One-Click Navigation Buttons */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => onNavigate('products-list')}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 py-2.5 text-xs font-extrabold text-white shadow-xs transition-all active:scale-98"
              title="One-click direct navigation to inventory list"
            >
              <Package className="h-4 w-4" />
              <span>{t.dashboard.oneClickToInventory}</span>
            </button>
            <button
              onClick={() => onNavigate('purchase-add')}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t.dashboard.createPoForLowStock}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* Monthly Sales Performance Trends (Recharts) */}
      {/* Visualizes monthly sales performance compared to previous months and year */}
      {/* ============================================================== */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-colors">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <BarChart3 className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                {t.dashboard.monthlySalesTrends}
              </h3>
              <span className="hidden sm:inline-block rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                Recharts Analytics
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              {t.dashboard.monthlySalesComparison}
            </p>
          </div>

          {/* View Mode Selector Tabs */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-1">
            <button
              type="button"
              onClick={() => setMonthlyViewMode('comparison')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                monthlyViewMode === 'comparison'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.dashboard.viewModeRevenue}
            </button>
            <button
              type="button"
              onClick={() => setMonthlyViewMode('target')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                monthlyViewMode === 'target'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.dashboard.viewModeTarget}
            </button>
            <button
              type="button"
              onClick={() => setMonthlyViewMode('mom')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                monthlyViewMode === 'mom'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.dashboard.viewModeMoM}
            </button>
          </div>
        </div>

        {/* Quick Analytical Metric Highlights */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 pb-4 border-b border-slate-100 dark:border-slate-800/60">
          <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 p-3">
            <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300">{t.dashboard.avgMonthlyRevenue}</div>
            <div className="mt-1 font-mono text-base font-bold text-slate-900 dark:text-white tabular-nums">
              ৳{avgMonthlyRevenue.toLocaleString('en-US')}
            </div>
            <div className="mt-0.5 text-[10px] text-slate-600 dark:text-slate-300">
              {lang === 'bn' ? `${monthlySalesPerformance.length} মাসের গড় বিক্রয়` : `${monthlySalesPerformance.length}-month sales average`}
            </div>
          </div>
          <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 p-3">
            <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300">{t.dashboard.bestMonth}</div>
            <div className="mt-1 font-mono text-base font-bold text-emerald-800 dark:text-emerald-400 tabular-nums">
              {bestMonthObj && bestMonthObj.current2026 > 0
                ? `${lang === 'bn' ? bestMonthObj.monthBn : bestMonthObj.month} (৳${(bestMonthObj.current2026 / 1000).toFixed(0)}k)`
                : (lang === 'bn' ? 'কোন বিক্রয় নেই' : 'No sales yet')}
            </div>
            <div className="mt-0.5 text-[10px] text-emerald-800 dark:text-emerald-400 font-medium">
              {bestMonthObj && bestMonthObj.current2026 > 0
                ? `${bestMonthObj.ordersCount} ${lang === 'bn' ? 'টি চালান' : 'invoices'}`
                : (lang === 'bn' ? 'পিওএস-এ বিক্রয় শুরু করুন' : 'Record sales in POS')}
            </div>
          </div>
          <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 p-3">
            <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300">{t.dashboard.monthOverMonthGrowth}</div>
            <div className="mt-1 flex items-center gap-1 font-mono text-base font-bold text-blue-600 dark:text-blue-400 tabular-nums">
              <ArrowUpRight className="h-4 w-4" />
              <span>{currentMonthData ? `${currentMonthData.momGrowth >= 0 ? '+' : ''}${currentMonthData.momGrowth}%` : '0%'}</span>
            </div>
            <div className="mt-0.5 text-[10px] text-slate-600 dark:text-slate-300">
              {lang === 'bn' ? 'চলতি মাসের পরিবর্তন' : 'Current month MoM'}
            </div>
          </div>
          <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 p-3">
            <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300">{lang === 'bn' ? 'মোট বিক্রয় চালানের সংখ্যা' : 'Total Invoices'}</div>
            <div className="mt-1 flex items-center gap-1 font-mono text-base font-bold text-emerald-800 dark:text-emerald-400 tabular-nums">
              <span>{(sales || []).length} {lang === 'bn' ? 'টি' : 'orders'}</span>
            </div>
            <div className="mt-0.5 text-[10px] text-emerald-800 dark:text-emerald-400 font-medium">
              {lang === 'bn' ? 'লাইভ সিস্টেম ডেটা' : 'Live system data'}
            </div>
          </div>
        </div>

        {/* Recharts Chart Container */}
        <div className="mt-4 w-full h-[320px] select-none">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={monthlySalesPerformance}
              margin={{ top: 15, right: 15, bottom: 5, left: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#94a3b8"
                opacity={0.2}
              />
              <XAxis
                dataKey={lang === 'bn' ? 'monthBn' : 'month'}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                tick={{ fontSize: 11 }}
              />
              {monthlyViewMode === 'mom' ? (
                <>
                  <YAxis
                    yAxisId="left"
                    tickFormatter={(val) => `৳${(val / 1000).toFixed(0)}k`}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(val) => `${val}%`}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as MonthlySalesData;
                        const current = data.current2026;
                        const prevYear = data.previous2025;
                        const prevMonth = data.prevMonthSales;
                        const diffPrevMonth = current - prevMonth;
                        const momPercent = data.momGrowth;

                        return (
                          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-3.5 shadow-xl backdrop-blur-sm text-xs space-y-2 min-w-[220px]">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5 font-bold text-slate-900 dark:text-white">
                              <span>{data.fullMonth}</span>
                              <span className="text-[10px] text-slate-600 dark:text-slate-300 font-mono">
                                {data.ordersCount} {lang === 'bn' ? 'অর্ডার' : 'orders'}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-emerald-800 dark:text-emerald-400 font-bold">
                                <span>{t.dashboard.currentYear}:</span>
                                <span className="font-mono text-sm tabular-nums">৳{current.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                                <span>{t.dashboard.previousMonth}:</span>
                                <span className="font-mono tabular-nums">৳{prevMonth.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center text-blue-600 dark:text-blue-400 font-semibold">
                                <span>{t.dashboard.monthOverMonthGrowth}:</span>
                                <span className="font-mono tabular-nums">{momPercent > 0 ? `+${momPercent}%` : `${momPercent}%`}</span>
                              </div>
                            </div>
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-1.5 flex items-center justify-between text-[11px]">
                              <span className="text-slate-600 dark:text-slate-300">
                                {lang === 'bn' ? 'মাসিক পরিবর্তন' : 'Monthly Change'}:
                              </span>
                              <span className={`font-mono font-bold ${diffPrevMonth >= 0 ? 'text-emerald-800 dark:text-emerald-400' : 'text-rose-800 dark:text-rose-400'}`}>
                                {diffPrevMonth >= 0 ? `+৳${diffPrevMonth.toLocaleString()}` : `-৳${Math.abs(diffPrevMonth).toLocaleString()}`}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                  <ReferenceLine y={0} yAxisId="right" stroke="#EF4444" strokeDasharray="3 3" />
                  <Bar
                    yAxisId="left"
                    dataKey="current2026"
                    name={t.dashboard.currentYear}
                    fill="#10B981"
                    opacity={0.3}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="momGrowth"
                    name={t.dashboard.monthOverMonthGrowth + " (%)"}
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6 }}
                  />
                </>
              ) : monthlyViewMode === 'target' ? (
                <>
                  <YAxis
                    tickFormatter={(val) => `৳${(val / 1000).toFixed(0)}k`}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as MonthlySalesData;
                        const current = data.current2026;
                        const target = data.target;
                        const diff = current - target;
                        const achievePercent = ((current / target) * 100).toFixed(1);

                        return (
                          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-3.5 shadow-xl backdrop-blur-sm text-xs space-y-2 min-w-[220px]">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5 font-bold text-slate-900 dark:text-white">
                              <span>{data.fullMonth}</span>
                              <span className="text-[10px] text-slate-600 dark:text-slate-300 font-mono">
                                {data.ordersCount} {lang === 'bn' ? 'অর্ডার' : 'orders'}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-emerald-800 dark:text-emerald-400 font-bold">
                                <span>{t.dashboard.currentYear}:</span>
                                <span className="font-mono text-sm tabular-nums">৳{current.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center text-amber-800 dark:text-amber-400 font-semibold">
                                <span>{t.dashboard.salesTarget}:</span>
                                <span className="font-mono tabular-nums">৳{target.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-1.5 flex items-center justify-between text-[11px]">
                              <span className="text-slate-600 dark:text-slate-300">
                                {lang === 'bn' ? 'টার্গেট অর্জন' : 'Achievement'}:
                              </span>
                              <span className={`font-mono font-bold ${diff >= 0 ? 'text-emerald-800 dark:text-emerald-400' : 'text-rose-800 dark:text-rose-400'}`}>
                                {achievePercent}% ({diff >= 0 ? `+৳${diff.toLocaleString()}` : `-৳${Math.abs(diff).toLocaleString()}`})
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                  <Bar
                    dataKey="current2026"
                    name={t.dashboard.currentYear}
                    fill="#10B981"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={38}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    name={t.dashboard.salesTarget}
                    stroke="#F59E0B"
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                    dot={{ r: 4, fill: '#F59E0B', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6 }}
                  />
                </>
              ) : (
                <>
                  <YAxis
                    tickFormatter={(val) => `৳${(val / 1000).toFixed(0)}k`}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as MonthlySalesData;
                        const current = data.current2026;
                        const prevYear = data.previous2025;
                        const prevMonth = data.prevMonthSales;
                        const diffPrevYear = current - prevYear;
                        const diffPrevMonth = current - prevMonth;
                        const momPercent = data.momGrowth;
                        const yoyPercent = data.yoyGrowth;

                        return (
                          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-3.5 shadow-xl backdrop-blur-sm text-xs space-y-2 min-w-[230px]">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5 font-bold text-slate-900 dark:text-white">
                              <span>{data.fullMonth}</span>
                              <span className="text-[10px] text-slate-600 dark:text-slate-300 font-mono">
                                {data.ordersCount} {lang === 'bn' ? 'অর্ডার' : 'orders'}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-emerald-800 dark:text-emerald-400 font-bold">
                                <span>{t.dashboard.currentYear}:</span>
                                <span className="font-mono text-sm tabular-nums">৳{current.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                                <span>{t.dashboard.previousYear}:</span>
                                <span className="font-mono tabular-nums">৳{prevYear.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                                <span>{t.dashboard.previousMonth}:</span>
                                <span className="font-mono tabular-nums">৳{prevMonth.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center text-amber-800 dark:text-amber-400 font-medium">
                                <span>{t.dashboard.salesTarget}:</span>
                                <span className="font-mono tabular-nums">৳{data.target.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-1.5 flex items-center justify-between text-[11px]">
                              <span className="text-slate-600 dark:text-slate-300">
                                {lang === 'bn' ? 'পূর্ববর্তী মাসের চেয়ে' : 'vs Previous Month'}:
                              </span>
                              <span className={`font-mono font-bold ${diffPrevMonth >= 0 ? 'text-emerald-800 dark:text-emerald-400' : 'text-rose-800 dark:text-rose-400'}`}>
                                {diffPrevMonth >= 0 ? '+' : ''}{momPercent}% (৳{(diffPrevMonth >= 0 ? diffPrevMonth : -diffPrevMonth).toLocaleString()})
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-600 dark:text-slate-300">
                                {lang === 'bn' ? 'গত বছরের তুলনায়' : 'vs Prior Year'}:
                              </span>
                              <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400">
                                +{yoyPercent}% (+৳{diffPrevYear.toLocaleString()})
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                  <Bar
                    dataKey="current2026"
                    name={t.dashboard.currentYear}
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={30}
                  />
                  <Bar
                    dataKey="previous2025"
                    name={t.dashboard.previousYear}
                    fill="#94A3B8"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={30}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    name={t.dashboard.salesTarget}
                    stroke="#F59E0B"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent POS Sales Activity Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.dashboard.recentSales}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {lang === 'bn' 
                ? 'তামান্না মোটরসের সাম্প্রতিক সম্পন্নকৃত রসিদ ও বিক্রয়।' 
                : 'Latest completed receipts across all active cash registers.'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('sales-pos-list')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {t.dashboard.viewAll}
          </button>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase">
              <tr>
                <th className="py-2.5 px-3">Invoice No</th>
                <th className="py-2.5 px-3">{lang === 'bn' ? 'গ্রাহক' : 'Customer'}</th>
                <th className="py-2.5 px-3">{lang === 'bn' ? 'শাখা' : 'Location'}</th>
                <th className="py-2.5 px-3">{lang === 'bn' ? 'পেমেন্ট মাধ্যম' : 'Payment'}</th>
                <th className="py-2.5 px-3 text-right">{lang === 'bn' ? 'আইটেম' : 'Items'}</th>
                <th className="py-2.5 px-3 text-right">{lang === 'bn' ? 'মোট মূল্য' : 'Total Amount'}</th>
                <th className="py-2.5 px-3 text-center">{lang === 'bn' ? 'অবস্থা' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {sales.slice(0, 5).map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">{sale.invoiceNo}</td>
                  <td className="py-2.5 px-3">{sale.customerName}</td>
                  <td className="py-2.5 px-3">{sale.businessLocation}</td>
                  <td className="py-2.5 px-3">{sale.paymentMethod}</td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums">{sale.itemsCount}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                    ৳{sale.totalAmount.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block text-[11px] font-bold ${
                        sale.paymentStatus === 'Paid'
                          ? 'text-emerald-800 dark:text-emerald-400'
                          : sale.paymentStatus === 'Partial'
                          ? 'text-amber-800 dark:text-amber-400'
                          : 'text-rose-800 dark:text-rose-400'
                      }`}
                    >
                      {sale.paymentStatus === 'Paid' ? (lang === 'bn' ? 'পরিশোধিত' : 'Paid') : sale.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
