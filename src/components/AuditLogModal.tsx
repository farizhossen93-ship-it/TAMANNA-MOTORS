import React, { useState } from 'react';
import { 
  FileText, 
  X, 
  Search, 
  ShieldAlert, 
  CheckCircle, 
  Trash2, 
  Clock, 
  Filter,
  UserCheck,
  AlertTriangle,
  Sparkles,
  Download
} from 'lucide-react';
import { AuditLog } from '../types';
import { Language } from '../i18n/translations';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLog[];
  lang?: Language;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  isOpen,
  onClose,
  logs,
  lang = 'en'
}) => {
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');

  if (!isOpen) return null;

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.entityTitle.toLowerCase().includes(search.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(search.toLowerCase()) ||
      (log.reason && log.reason.toLowerCase().includes(search.toLowerCase())) ||
      log.entityId.toLowerCase().includes(search.toLowerCase());

    const matchesAction = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: AuditLog['action']) => {
    switch (action) {
      case 'DELETED':
      case 'DAMAGED':
        return 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'APPROVED':
      case 'STAFF_APPROVED':
        return 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'REJECTED':
        return 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'STAFF_REGISTERED':
        return 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in">
      <div 
        className="w-full max-w-4xl max-h-[85vh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>{lang === 'bn' ? 'অডিট লগ ও নিরাপত্তা ইতিহাস' : 'Audit Log & Security Activity'}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-mono font-bold">
                  {logs.length} records
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'bn' 
                  ? 'কে কোন ডাটা ডিলিট বা ড্যামেজ করেছে এবং অনুমোদন দিয়েছে তার স্থায়ী হিস্টোরি।' 
                  : 'Immutable record of deletions, damaged inventory, approvals, and authorization history.'}
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

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === 'bn' ? 'আইটেম, ব্যবহারকারী বা কারণ খুঁজুন...' : 'Search item, user, reason, or SKU...'}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:border-purple-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-purple-500 focus:outline-hidden"
            >
              <option value="all">{lang === 'bn' ? 'সকল অ্যাকশন' : 'All Actions'}</option>
              <option value="DELETED">{lang === 'bn' ? 'মুছে ফেলা (DELETED)' : 'Deleted'}</option>
              <option value="DAMAGED">{lang === 'bn' ? 'ড্যামেজ (DAMAGED)' : 'Damaged'}</option>
              <option value="STAFF_APPROVED">{lang === 'bn' ? 'স্টাফ অনুমোদন' : 'Staff Approved'}</option>
              <option value="REJECTED">{lang === 'bn' ? 'বাতিলকৃত' : 'Rejected'}</option>
            </select>
          </div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Clock className="h-10 w-10 mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="text-xs font-medium">
                {lang === 'bn' ? 'কোনো অডিট লগ রেকর্ড পাওয়া যায়নি।' : 'No audit log entries recorded yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 p-3.5 text-xs hover:border-purple-300 dark:hover:border-purple-800 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {log.entityTitle}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ({log.entityType}: {log.entityId})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                      <Clock className="h-3 w-3" />
                      <span>{log.timestamp}</span>
                    </div>
                  </div>

                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500">{lang === 'bn' ? 'সম্পাদনকারী: ' : 'Performed By: '}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{log.performedBy}</span>
                      <span className="text-slate-400 text-[10px] ml-1">({log.userRole})</span>
                    </div>

                    {log.branch && (
                      <div>
                        <span className="text-slate-500">{lang === 'bn' ? 'শাখা: ' : 'Branch: '}</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{log.branch}</span>
                      </div>
                    )}
                  </div>

                  {log.reason && (
                    <div className="mt-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="font-bold text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">
                        {lang === 'bn' ? 'ডিলিট / ড্যামেজের কারণ (Audit Reason):' : 'Audit Reason / Cause:'}
                      </span>
                      <p className="font-semibold text-slate-900 dark:text-rose-300">
                        {log.reason}
                      </p>
                      {log.details && (
                        <p className="text-slate-600 dark:text-slate-400 mt-1 text-[11px]">
                          {log.details}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex justify-between items-center text-xs">
          <span className="text-slate-500">
            {lang === 'bn' ? 'অডিট রেকর্ড অপরিবর্তনীয় ও সুরক্ষিত' : 'Audit logs are tamper-evident & permanently logged'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 text-white font-bold hover:bg-slate-800 cursor-pointer"
          >
            {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
