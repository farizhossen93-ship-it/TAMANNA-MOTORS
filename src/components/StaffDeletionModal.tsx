import React, { useState } from 'react';
import { 
  AlertTriangle, 
  X, 
  Send, 
  ShieldAlert, 
  Trash2, 
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { UserRole, DeleteRequest } from '../types';
import { Language } from '../i18n/translations';

interface StaffDeletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'Product' | 'Sale' | 'Expense' | 'Contact';
  entityId: string;
  entityTitle: string;
  currentUser: { name: string; role: UserRole; businessLocation: string };
  onSubmitRequest: (req: Omit<DeleteRequest, 'id' | 'requestedAt' | 'status'>) => void;
  lang?: Language;
}

const PRESET_REASONS = [
  'মালামাল নষ্ট বা ড্যামেজ হয়েছে (Damaged / Broken Part)',
  'ভুল এন্ট্রি বা ডুপ্লিকেট রেকর্ড (Accidental / Duplicate Entry)',
  'গ্রাহক অর্ডার বাতিল করেছেন (Customer Order Canceled)',
  'ওয়ারেন্টি রিটার্ন বা ম্যানুফ্যাকচারার ত্রুটি (Manufacturer Defective)',
  'ইনভেন্টরি অডিট অসঙ্গতি (Inventory Count Discrepancy)'
];

export const StaffDeletionModal: React.FC<StaffDeletionModalProps> = ({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityTitle,
  currentUser,
  onSubmitRequest,
  lang = 'en'
}) => {
  const [selectedReason, setSelectedReason] = useState(PRESET_REASONS[0]);
  const [customDetails, setCustomDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      onSubmitRequest({
        entityType,
        entityId,
        entityTitle,
        requestedBy: currentUser.name,
        requestedByRole: currentUser.role,
        reason: selectedReason,
        details: customDetails.trim() || undefined,
        branch: currentUser.businessLocation
      });
      setIsSubmitting(false);
      onClose();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in">
      <div 
        className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4 bg-amber-50/50 dark:bg-amber-950/30">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {lang === 'bn' ? 'মুছে ফেলার আবেদন পাঠান' : 'Submit Deletion Request'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {lang === 'bn' ? 'সুপার অ্যাডমিনের অনুমোদন ও অডিট ট্র্যাকিং' : 'Requires Super Admin approval and audit log'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Target item badge */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {lang === 'bn' ? 'টার্গেট আইটেম:' : 'Target Item:'}
            </span>
            <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
              {entityTitle}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Type: {entityType} · ID: {entityId}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {lang === 'bn' ? 'মুছে ফেলা বা ড্যামেজের কারণ নির্বাচন করুন *' : 'Reason for Deletion or Damage *'}
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:border-amber-500 focus:outline-hidden"
            >
              {PRESET_REASONS.map((r, idx) => (
                <option key={idx} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {lang === 'bn' ? 'বিস্তারিত বিবরণ বা নোট (ঐচ্ছিক)' : 'Detailed Explanation or Damage Note'}
            </label>
            <textarea
              rows={3}
              value={customDetails}
              onChange={(e) => setCustomDetails(e.target.value)}
              placeholder={lang === 'bn' ? 'কেন পার্টসটি ড্যামেজ হয়েছিল বা এন্ট্রিটি মুছতে চান তা লিখুন...' : 'Explain why this item was damaged or needs to be deleted...'}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
            <span>
              {lang === 'bn'
                ? 'স্টাফ সদস্যরা সরাসরি কোনো ডাটা ডিলিট করতে পারেন না। সুপার অ্যাডমিন অনুমোদন দিলে এটি সিস্টেম থেকে মুছে যাবে এবং অডিট লগ এ সংরক্ষিত থাকবে।'
                : 'Staff members cannot delete records directly. Super Admin approval is required, and all actions are permanently logged in the audit trail.'}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              {lang === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 font-bold shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSubmitting ? (lang === 'bn' ? 'পাঠানো হচ্ছে...' : 'Submitting...') : (lang === 'bn' ? 'আবেদন পাঠান' : 'Submit Request')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
