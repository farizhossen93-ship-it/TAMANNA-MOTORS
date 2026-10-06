import React, { useState, useEffect } from 'react';
import { X, Save, Edit3, ShieldAlert } from 'lucide-react';
import { Sale, Purchase, Expense } from '../types';
import { Language, TRANSLATIONS } from '../i18n/translations';

export type EditableEntryType = 'sale' | 'purchase' | 'expense';

interface EditEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryType: EditableEntryType;
  entry: Sale | Purchase | Expense | null;
  onSave: (updatedEntry: any) => void;
  lang?: Language;
}

export const EditEntryModal: React.FC<EditEntryModalProps> = ({
  isOpen,
  onClose,
  entryType,
  entry,
  onSave,
  lang = 'en'
}) => {
  const t = TRANSLATIONS[lang];

  // Sale fields
  const [customerName, setCustomerName] = useState('');
  const [saleStatus, setSaleStatus] = useState<'Paid' | 'Due' | 'Partial'>('Paid');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Bank Transfer'>('Cash');
  const [totalAmount, setTotalAmount] = useState('');

  // Purchase fields
  const [supplierName, setSupplierName] = useState('');
  const [purchaseStatus, setPurchaseStatus] = useState<'Received' | 'Pending' | 'Ordered'>('Received');
  const [purchasePaymentStatus, setPurchasePaymentStatus] = useState<'Paid' | 'Due' | 'Partial'>('Paid');

  // Expense fields
  const [expenseCategory, setExpenseCategory] = useState<string>('Rent');
  const [referenceNo, setReferenceNo] = useState('');
  const [note, setNote] = useState('');

  // Common fields
  const [location, setLocation] = useState('Hazigonj Branch');

  useEffect(() => {
    if (!entry) return;

    if (entryType === 'sale') {
      const s = entry as Sale;
      setCustomerName(s.customerName);
      setSaleStatus(s.paymentStatus);
      setPaymentMethod((s.paymentMethod as any) || 'Cash');
      setTotalAmount(s.totalAmount.toString());
      setLocation(s.businessLocation);
    } else if (entryType === 'purchase') {
      const p = entry as Purchase;
      setSupplierName(p.supplierName);
      setPurchaseStatus(p.purchaseStatus);
      setPurchasePaymentStatus(p.paymentStatus);
      setTotalAmount(p.grandTotal.toString());
      setLocation(p.businessLocation);
    } else if (entryType === 'expense') {
      const e = entry as Expense;
      setExpenseCategory(e.category);
      setTotalAmount(e.amount.toString());
      setReferenceNo(e.referenceNo || '');
      setNote(e.note || '');
      setLocation(e.businessLocation);
    }
  }, [entry, entryType, isOpen]);

  if (!isOpen || !entry) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(totalAmount) || 0;

    if (entryType === 'sale') {
      const s = entry as Sale;
      const updated: Sale = {
        ...s,
        customerName: customerName.trim() || s.customerName,
        paymentStatus: saleStatus,
        paymentMethod,
        totalAmount: amountNum,
        businessLocation: location,
        invoiceDue: saleStatus === 'Paid' ? 0 : saleStatus === 'Due' ? amountNum : Math.round(amountNum * 0.5)
      };
      onSave(updated);
    } else if (entryType === 'purchase') {
      const p = entry as Purchase;
      const updated: Purchase = {
        ...p,
        supplierName: supplierName.trim() || p.supplierName,
        purchaseStatus: purchaseStatus,
        paymentStatus: purchasePaymentStatus,
        grandTotal: amountNum,
        businessLocation: location,
        paymentDue: purchasePaymentStatus === 'Paid' ? 0 : amountNum
      };
      onSave(updated);
    } else if (entryType === 'expense') {
      const exp = entry as Expense;
      const updated: Expense = {
        ...exp,
        category: expenseCategory as any,
        amount: amountNum,
        referenceNo: referenceNo.trim(),
        note: note.trim(),
        businessLocation: location
      };
      onSave(updated);
    }

    onClose();
  };

  const getTitle = () => {
    if (entryType === 'sale') {
      return lang === 'bn' ? 'বিক্রয় মেমো / চালান সম্পাদনা' : 'Edit Sale Invoice';
    }
    if (entryType === 'purchase') {
      return lang === 'bn' ? 'ক্রয় অর্ডার / চালান সম্পাদনা' : 'Edit Purchase Order';
    }
    return lang === 'bn' ? 'ব্যয় রেকর্ড সম্পাদনা' : 'Edit Expense Record';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div 
        className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Edit3 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{getTitle()}</h3>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" />
                <span>{lang === 'bn' ? 'অ্যাডমিন কর্তৃত্ব সক্রিয় · ডাটাবেজ ও রেজিস্ট্রি স্বয়ংক্রিয় সিঙ্ক' : 'Admin Override Active · Instant Storage Sync'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Sale specific fields */}
          {entryType === 'sale' && (
            <>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'গ্রাহকের নাম' : 'Customer Name'}
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'পরিশোধ অবস্থা' : 'Payment Status'}
                  </label>
                  <select
                    value={saleStatus}
                    onChange={(e) => setSaleStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Paid">Paid (পরিশোধিত)</option>
                    <option value="Due">Due (বকেয়া)</option>
                    <option value="Partial">Partial (আংশিক)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'পেমেন্ট মাধ্যম' : 'Payment Method'}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Cash">Cash (নগদ)</option>
                    <option value="Card">Card (কার্ড)</option>
                    <option value="Bank Transfer">Bank / bKash</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Purchase specific fields */}
          {entryType === 'purchase' && (
            <>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'সাপ্লায়ার প্রতিষ্ঠান' : 'Supplier Name'}
                </label>
                <input
                  type="text"
                  required
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'ডেলিভারি অবস্থা' : 'Delivery Status'}
                  </label>
                  <select
                    value={purchaseStatus}
                    onChange={(e) => setPurchaseStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Received">Received (গৃহীত)</option>
                    <option value="Pending">Pending (অপেক্ষমান)</option>
                    <option value="Ordered">Ordered (অর্ডারকৃত)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'বিল পরিশোধ' : 'Payment Status'}
                  </label>
                  <select
                    value={purchasePaymentStatus}
                    onChange={(e) => setPurchasePaymentStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Due">Due</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Expense specific fields */}
          {entryType === 'expense' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'ব্যয়ের খাত' : 'Expense Category'}
                  </label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Rent">Rent (দোকান ভাড়া)</option>
                    <option value="Utilities">Utilities (বিদ্যুৎ ও গ্যাস)</option>
                    <option value="Salaries">Salaries (স্টাফ বেতন)</option>
                    <option value="Logistics">Logistics (পরিবহন)</option>
                    <option value="Marketing">Marketing (প্রচারণা)</option>
                    <option value="Maintenance">Maintenance (মেরামত)</option>
                    <option value="Office Supplies">Office Supplies</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'রেফারেন্স / ভাউচার নং' : 'Reference / Voucher'}
                  </label>
                  <input
                    type="text"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 font-mono text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'বিবরণ / নোট' : 'Expense Note'}
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </>
          )}

          {/* Common Amount & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'মোট টাকার পরিমাণ (৳)' : 'Total Amount (৳)'}
              </label>
              <input
                type="number"
                step="1"
                required
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 font-mono font-bold text-emerald-800 dark:text-emerald-400 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'শাখা' : 'Location'}
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="Hazigonj Branch">Hazigonj Branch (হাজীগঞ্জ প্রধান শাখা)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-5 py-2 text-xs font-bold text-white hover:bg-amber-700 shadow-md transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>{lang === 'bn' ? 'পরিবর্তন সংরক্ষণ ও সিঙ্ক করুন' : 'Save & Sync Entry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
