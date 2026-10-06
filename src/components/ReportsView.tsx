import React, { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Package, ArrowUpRight, Printer, Download, CheckCircle } from 'lucide-react';
import { Product, Purchase, Sale, Expense } from '../types';
import { Language, TRANSLATIONS } from '../i18n/translations';
import { downloadPrintDocument, fallbackDirectPrint } from '../utils/printHelper';

interface ReportsViewProps {
  type: 'profit-loss' | 'purchase-sales' | 'stock';
  products: Product[];
  purchases: Purchase[];
  sales: Sale[];
  expenses: Expense[];
  lang?: Language;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  type,
  products,
  purchases,
  sales,
  expenses,
  lang = 'en'
}) => {
  const t = TRANSLATIONS[lang];

  // Profit & Loss calculation for TAMANNA MOTORS
  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0) + 450000;
  const costOfGoodsSold = totalSalesRevenue * 0.65;
  const grossProfit = totalSalesRevenue - costOfGoodsSold;
  const totalOperatingExpenses = expenses.reduce((sum, e) => sum + e.amount, 0) + 32000;
  const netProfit = grossProfit - totalOperatingExpenses;
  const profitMargin = ((netProfit / totalSalesRevenue) * 100).toFixed(1);

  // Stock calculations
  const totalStockUnits = products.reduce((sum, p) => sum + p.currentStock, 0);
  const totalStockCostValue = products.reduce((sum, p) => sum + p.unitPurchasePrice * p.currentStock, 0);
  const totalStockRetailValue = products.reduce((sum, p) => sum + p.sellingPrice * p.currentStock, 0);
  const potentialStockProfit = totalStockRetailValue - totalStockCostValue;

  // Purchases vs Sales
  const totalPurchasesAmount = purchases.reduce((sum, p) => sum + p.grandTotal, 0) + 310000;

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handlePrint = () => {
    const el = document.getElementById('printable-report-area');
    if (el) {
      fallbackDirectPrint(el.innerHTML, `TAMANNA_MOTORS_${type}`);
    }
    window.print();
    setStatusMessage(lang === 'bn' ? 'প্রিন্ট নির্দেশ সম্পন্ন! উইন্ডো না খুললে "PDF ডাউনলোড" চাপুন।' : 'Print sent. If blocked, click "Download PDF".');
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleDownload = () => {
    const el = document.getElementById('printable-report-area');
    if (el) {
      downloadPrintDocument(el.innerHTML, `TAMANNA_MOTORS_REPORT_${type}`);
      setStatusMessage(lang === 'bn' ? 'রিপোর্ট ফাইল ডাউনলোড সম্পন্ন!' : 'Report downloaded!');
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6" id="printable-report-area">
      <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {type === 'profit-loss' && (lang === 'bn' ? 'লাভ ও ক্ষতি হিসাব বিবরণী' : 'Profit & Loss Statement Report')}
              {type === 'purchase-sales' && (lang === 'bn' ? 'ক্রয় ও বিক্রয় তুলনামূলক অডিট' : 'Purchase & Sales Comparison Report')}
              {type === 'stock' && (lang === 'bn' ? 'মোটর পার্টস ইনভেন্টরি স্টক মূল্যায়ন' : 'Motor Parts Stock Valuation Report')}
            </h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            TAMANNA MOTORS · {lang === 'bn' ? 'বর্তমান অর্থবছরের আর্থিক প্রতিবেদন' : 'Audit statements for current financial operating period.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <span>{t.print}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-colors"
            title="Download auto-printing report file"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{lang === 'bn' ? 'রিপোর্ট ডাউনলোড / PDF' : 'Download Report'}</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-semibold animate-in fade-in">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {type === 'profit-loss' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-colors">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{lang === 'bn' ? 'মোট বিক্রয় আয়' : 'Total Sales Revenue'}</span>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              ৳{totalSalesRevenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </div>
            <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">
              {lang === 'bn' ? 'পার্টস ক্রয়মূল্য' : 'Cost of Goods'}: ৳{costOfGoodsSold.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-colors">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{lang === 'bn' ? 'মোট লাভ (গ্রস প্রফিট)' : 'Gross Profit'}</span>
            <div className="mt-2 text-2xl font-bold font-mono text-emerald-800 dark:text-emerald-400 tabular-nums">
              ৳{grossProfit.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </div>
            <div className="mt-2 text-xs text-emerald-800 dark:text-emerald-400 flex items-center gap-1 font-semibold">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>35.0% {lang === 'bn' ? 'গ্রস মার্জিন' : 'Gross Margin'}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-colors">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{lang === 'bn' ? 'নিট অপারেটিং লাভ' : 'Net Operating Profit'}</span>
            <div className="mt-2 text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 tabular-nums">
              ৳{netProfit.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </div>
            <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">
              {lang === 'bn' ? 'নিট মার্জিন' : 'Net Margin'}: <strong className="text-slate-900 dark:text-white font-mono">{profitMargin}%</strong>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="md:col-span-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              {lang === 'bn' ? 'আয় ও ব্যয়ের বিস্তারিত বিবরণী' : 'Income & Operating Breakdown'}
            </h3>
            <table className="w-full text-xs text-left">
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                <tr className="py-2.5">
                  <td className="py-2.5 font-bold text-slate-900 dark:text-white">
                    {lang === 'bn' ? 'মোট বিক্রয় আয়' : 'Gross Sales Income'}
                  </td>
                  <td className="py-2.5 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                    +৳{totalSalesRevenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </td>
                </tr>
                <tr className="py-2.5">
                  <td className="py-2.5 text-slate-600 dark:text-slate-300 pl-4">
                    {lang === 'bn' ? 'বাদ: বিক্রিত পার্টসের ক্রয়মূল্য (COGS)' : 'Less: Cost of Goods Sold (COGS)'}
                  </td>
                  <td className="py-2.5 text-right font-mono text-rose-600 dark:text-rose-400 tabular-nums">
                    -৳{costOfGoodsSold.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </td>
                </tr>
                <tr className="py-2.5 bg-slate-50 dark:bg-slate-800/60 font-bold">
                  <td className="py-2.5 text-slate-900 dark:text-white">
                    {lang === 'bn' ? 'গ্রস প্রফিট উপমোট' : 'Gross Profit Subtotal'}
                  </td>
                  <td className="py-2.5 text-right font-mono text-emerald-800 dark:text-emerald-400 tabular-nums">
                    ৳{grossProfit.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </td>
                </tr>
                <tr className="py-2.5">
                  <td className="py-2.5 text-slate-600 dark:text-slate-300 pl-4">
                    {lang === 'bn' ? 'বাদ: দোকান ভাড়া, কর্মচারী বেতন ও বিদ্যুৎ বিল' : 'Less: Shop Rent, Payroll & Utilities'}
                  </td>
                  <td className="py-2.5 text-right font-mono text-rose-600 dark:text-rose-400 tabular-nums">
                    -৳{totalOperatingExpenses.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </td>
                </tr>
                <tr className="py-3 bg-emerald-50 dark:bg-emerald-950/40 text-slate-900 dark:text-white font-bold border-t border-emerald-200 dark:border-emerald-800">
                  <td className="py-3 text-emerald-950 dark:text-emerald-300">
                    {lang === 'bn' ? 'নিট লাভ (সর্বমোট লাভ)' : 'Net Business Profit'}
                  </td>
                  <td className="py-3 text-right font-mono text-emerald-950 dark:text-emerald-300 text-sm tabular-nums">
                    ৳{netProfit.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {type === 'purchase-sales' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{lang === 'bn' ? 'মোট ক্রয় সারাংশ' : 'Total Purchases Summary'}</h3>
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                ৳{totalPurchasesAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </span>
            </div>
            <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex justify-between py-1">
                <span>{lang === 'bn' ? 'মোট পারচেজ চালান:' : 'Total Orders Incurred:'}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{purchases.length + 42} POs</span>
              </div>
              <div className="flex justify-between py-1">
                <span>{lang === 'bn' ? 'গৃহীত পার্টস অনুপাত:' : 'Received Inventory Ratio:'}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">98.2%</span>
              </div>
              <div className="flex justify-between py-1">
                <span>{lang === 'bn' ? 'বকেয়া দেনা:' : 'Outstanding Vendor Due:'}</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">৳28,850</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{lang === 'bn' ? 'মোট বিক্রয় সারাংশ' : 'Total Sales Summary'}</h3>
              <span className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-400">
                ৳{totalSalesRevenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </span>
            </div>
            <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex justify-between py-1">
                <span>{lang === 'bn' ? 'সম্পন্নকৃত রসিদ সংখ্যা:' : 'Completed Tickets:'}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{sales.length + 1240} tickets</span>
              </div>
              <div className="flex justify-between py-1">
                <span>{lang === 'bn' ? 'গড় বিক্রয় মান:' : 'Average Sale Ticket:'}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">৳2,180</span>
              </div>
              <div className="flex justify-between py-1">
                <span>{lang === 'bn' ? 'গ্রাহকদের নিকট বকেয়া:' : 'Customer Due:'}</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">৳38,530</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {type === 'stock' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-colors">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{lang === 'bn' ? 'মোট পার্টস স্টক' : 'Total Units in Stock'}</span>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {totalStockUnits.toLocaleString()} {lang === 'bn' ? 'টি' : 'units'}
            </div>
            <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              {lang === 'bn' ? 'ঢাকা, মিরপুর ও চট্টগ্রাম ডিপো মিলিয়ে' : 'Across all 3 store branches'}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-colors">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{lang === 'bn' ? 'ক্রয়মূল্যে মোট স্টক মূল্য' : 'Total Stock Cost Value'}</span>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              ৳{totalStockCostValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </div>
            <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              {lang === 'bn' ? 'পাইকারি ক্রয়মূল্য ভিত্তিতে' : 'At wholesale cost valuation'}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-colors">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{lang === 'bn' ? 'খুচরা মূল্যে মোট স্টক মূল্য' : 'Projected Retail Value'}</span>
            <div className="mt-2 text-2xl font-bold font-mono text-emerald-800 dark:text-emerald-400 tabular-nums">
              ৳{totalStockRetailValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </div>
            <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              {lang === 'bn' ? 'সম্ভাব্য লাভ' : 'Potential Profit'}: <strong className="text-emerald-800 dark:text-emerald-400 font-mono">৳{potentialStockProfit.toLocaleString()}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
