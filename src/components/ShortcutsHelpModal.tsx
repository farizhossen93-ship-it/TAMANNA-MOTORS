import React from 'react';
import { 
  Keyboard, 
  X, 
  ShoppingCart, 
  Search, 
  QrCode, 
  Calculator, 
  PanelLeft, 
  LayoutDashboard, 
  FilePlus, 
  CheckCircle2, 
  Sparkles,
  Printer
} from 'lucide-react';
import { Language } from '../i18n/translations';

interface ShortcutsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

interface ShortcutItem {
  keys: string[];
  descriptionEn: string;
  descriptionBn: string;
  icon: React.ReactNode;
  category: 'core' | 'navigation' | 'pos';
}

const SHORTCUTS: ShortcutItem[] = [
  {
    keys: ['Ctrl', 'P'],
    descriptionEn: 'Launch POS Terminal',
    descriptionBn: 'পিওএস সেলস টার্মিনাল চালু করুন',
    icon: <ShoppingCart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
    category: 'core'
  },
  {
    keys: ['Ctrl', 'S'],
    descriptionEn: 'Global Search & Command Palette',
    descriptionBn: 'গ্লোবাল সার্চ ও কমান্ড প্যালেট',
    icon: <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
    category: 'core'
  },
  {
    keys: ['Ctrl', 'I'],
    descriptionEn: 'Scan & Verify Invoice QR Code',
    descriptionBn: 'চালান কিউআর স্ক্যান ও মেমো যাচাই',
    icon: <QrCode className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />,
    category: 'core'
  },
  {
    keys: ['Alt', 'C'],
    descriptionEn: 'Open Quick Calculator',
    descriptionBn: 'ক্যালকুলেটর ওপেন করুন',
    icon: <Calculator className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
    category: 'core'
  },
  {
    keys: ['Ctrl', 'B'],
    descriptionEn: 'Toggle Sidebar Menu',
    descriptionBn: 'সাইডবার মেনু খোলা বা বন্ধ করা',
    icon: <PanelLeft className="h-4 w-4 text-slate-500" />,
    category: 'navigation'
  },
  {
    keys: ['Ctrl', 'D'],
    descriptionEn: 'Go to Dashboard',
    descriptionBn: 'ড্যাশবোর্ড / হোম পেজে যান',
    icon: <LayoutDashboard className="h-4 w-4 text-slate-500" />,
    category: 'navigation'
  },
  {
    keys: ['Ctrl', 'N'],
    descriptionEn: 'Add New Product / Part',
    descriptionBn: 'নতুন মোটর পার্টস যোগ করার ফর্ম',
    icon: <FilePlus className="h-4 w-4 text-emerald-500" />,
    category: 'navigation'
  },
  {
    keys: ['Ctrl', '/'],
    descriptionEn: 'Show Keyboard Shortcuts Help',
    descriptionBn: 'কীবোর্ড শর্টকাট তালিকা দেখুন',
    icon: <Keyboard className="h-4 w-4 text-purple-500" />,
    category: 'navigation'
  },
  {
    keys: ['Esc'],
    descriptionEn: 'Close Active Modal / Drawer',
    descriptionBn: 'যেকোনো সক্রিয় মোডাল বা উইন্ডো বন্ধ করুন',
    icon: <X className="h-4 w-4 text-rose-500" />,
    category: 'navigation'
  },
  {
    keys: ['Ctrl', 'Enter'],
    descriptionEn: 'Complete Sale (inside POS)',
    descriptionBn: 'বিক্রয় সম্পন্ন করুন (পিওএস এর ভেতর)',
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    category: 'pos'
  },
  {
    keys: ['F4'],
    descriptionEn: 'Quick Print Thermal Receipt',
    descriptionBn: 'রসিদ প্রিন্ট করুন',
    icon: <Printer className="h-4 w-4 text-blue-500" />,
    category: 'pos'
  }
];

export const ShortcutsHelpModal: React.FC<ShortcutsHelpModalProps> = ({
  isOpen,
  onClose,
  lang = 'en'
}) => {
  if (!isOpen) return null;

  const coreList = SHORTCUTS.filter(s => s.category === 'core');
  const navList = SHORTCUTS.filter(s => s.category === 'navigation');
  const posList = SHORTCUTS.filter(s => s.category === 'pos');

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Keyboard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                {lang === 'bn' ? 'কীবোর্ড শর্টকাট গাইড' : 'Global Keyboard Shortcuts'}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Quick Access
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'bn' ? 'মাউস ছাড়াই দ্রুত গতিতে বিক্রয় ও হিসাব পরিচালনা করুন' : 'Accelerate POS sales and data management workflow'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Core Actions */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-amber-500" />
              {lang === 'bn' ? 'মূল অপারেশন ও শর্টকাট' : 'Primary Workflow Shortcuts'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {coreList.map((item, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    {item.icon}
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {lang === 'bn' ? item.descriptionBn : item.descriptionEn}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {item.keys.map((k, kIdx) => (
                      <kbd 
                        key={kIdx}
                        className="px-2 py-1 text-[11px] font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-xs"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation & Windows */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <PanelLeft className="h-3 w-3 text-slate-500" />
              {lang === 'bn' ? 'নেভিগেশন ও উইন্ডো কন্ট্রোল' : 'Navigation & Window Controls'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {navList.map((item, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    {item.icon}
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {lang === 'bn' ? item.descriptionBn : item.descriptionEn}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {item.keys.map((k, kIdx) => (
                      <kbd 
                        key={kIdx}
                        className="px-2 py-1 text-[11px] font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-xs"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* POS Terminal In-session */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <ShoppingCart className="h-3 w-3 text-emerald-500" />
              {lang === 'bn' ? 'পিওএস টার্মিনাল ইন-সেশন' : 'POS Terminal Fast Checkout'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {posList.map((item, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    {item.icon}
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {lang === 'bn' ? item.descriptionBn : item.descriptionEn}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {item.keys.map((k, kIdx) => (
                      <kbd 
                        key={kIdx}
                        className="px-2 py-1 text-[11px] font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-xs"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-3.5 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-xs text-slate-500">
          <span>{lang === 'bn' ? 'যেকোনো সময় Esc চাপুন বন্ধ করতে' : 'Press Esc anytime to dismiss'}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            {lang === 'bn' ? 'ঠিক আছে' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};
