import React, { useState, useEffect } from 'react';
import { 
  Database, 
  X, 
  Check, 
  Copy, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  KeyRound, 
  Globe, 
  FileCode, 
  RotateCcw 
} from 'lucide-react';
import { 
  getSupabaseUrl, 
  getSupabaseAnonKey, 
  setCustomSupabaseConfig, 
  resetCustomSupabaseConfig, 
  testSupabaseConnection, 
  isCustomSupabaseSet 
} from '../lib/supabase';
import { SUPABASE_SQL_SCRIPT } from '../data/supabaseSqlScript';
import { Language } from '../i18n/translations';

interface CustomStorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
  onConfigSaved?: () => void;
}

export const CustomStorageModal: React.FC<CustomStorageModalProps> = ({
  isOpen,
  onClose,
  lang = 'bn',
  onConfigSaved
}) => {
  const [url, setUrl] = useState(getSupabaseUrl());
  const [anonKey, setAnonKey] = useState(getSupabaseAnonKey());
  const [activeSubTab, setActiveSubTab] = useState<'config' | 'sql'>('config');
  const [testResult, setTestResult] = useState<{ checked: boolean; success: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUrl(getSupabaseUrl());
      setAnonKey(getSupabaseAnonKey());
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      // Temporarily set to test
      setCustomSupabaseConfig(url, anonKey);
      const res = await testSupabaseConnection();
      setTestResult({
        checked: true,
        success: res.success,
        message: res.message
      });
    } catch (e: any) {
      setTestResult({
        checked: true,
        success: false,
        message: e?.message || 'কানেকশন ব্যর্থ হয়েছে'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    setSaving(true);
    const ok = setCustomSupabaseConfig(url, anonKey);
    setSaving(false);
    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      if (onConfigSaved) onConfigSaved();
    }
  };

  const handleReset = () => {
    resetCustomSupabaseConfig();
    setUrl(getSupabaseUrl());
    setAnonKey(getSupabaseAnonKey());
    setTestResult(null);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    if (onConfigSaved) onConfigSaved();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-white/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                {lang === 'bn' ? 'কাস্টম ক্লাউড স্টোরেজ (Supabase)' : 'Custom Cloud Storage (Supabase)'}
                <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  PostgreSQL
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'bn' 
                  ? 'আপনার নিজের Supabase প্রজেক্টে ডেটাবেজ যুক্ত করুন ও স্কিমা রান করুন।' 
                  : 'Plug your custom Supabase database and copy the SQL setup.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-white/10 bg-slate-950/30 text-xs">
          <button
            onClick={() => setActiveSubTab('config')}
            className={`pb-2.5 font-bold transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'config'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>{lang === 'bn' ? '১. এপিআই ক্রেডেনশিয়াল (API Config)' : '1. API Credentials'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('sql')}
            className={`pb-2.5 font-bold transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'sql'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="h-3.5 w-3.5" />
            <span>{lang === 'bn' ? '২. সম্পূর্ণ SQL কোড (Supabase Script)' : '2. Complete SQL Script'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {activeSubTab === 'config' && (
            <div className="space-y-4">
              {/* Instructions banner */}
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/25 p-3.5 text-slate-300 space-y-2">
                <div className="font-bold text-emerald-400 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>{lang === 'bn' ? 'কীভাবে আপনার Supabase ডেটাবেজ যুক্ত করবেন?' : 'How to connect your Supabase database?'}</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                  <li><a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-bold inline-flex items-center gap-1">app.supabase.com <ExternalLink className="h-3 w-3" /></a> এ গিয়ে একটি নতুন প্রজেক্ট তৈরি করুন।</li>
                  <li>প্রজেক্টের <b>Project Settings → API</b> থেকে <b>Project URL</b> এবং <b>anon (public) key</b> কপি করুন।</li>
                  <li>নিচের ফিল্ডে পেস্ট করে <b>"কানেকশন টেস্ট"</b> ও <b>"সংরক্ষণ করুন"</b> বাটনে চাপুন।</li>
                  <li>এরপর ওপরের <b>"২. সম্পূর্ণ SQL কোড"</b> ট্যাবে গিয়ে কোডটি কপি করে Supabase SQL Editor-এ রান করুন।</li>
                </ol>
              </div>

              {/* Status info */}
              {isCustomSupabaseSet() && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-blue-400" />
                    {lang === 'bn' ? 'আপনার কাস্টম Supabase ক্রেডেনশিয়াল বর্তমানে সক্রিয় রয়েছে।' : 'Custom Supabase credentials are currently active.'}
                  </span>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1 text-rose-400 hover:underline cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>{lang === 'bn' ? 'রিসেট' : 'Reset'}</span>
                  </button>
                </div>
              )}

              {/* URL Input */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 flex items-center justify-between">
                  <span>Supabase Project URL</span>
                  <span className="text-[10px] text-slate-400">e.g. https://your-project.supabase.co</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Globe className="h-4 w-4" />
                  </div>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://xxxxxxxx.supabase.co"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.05] pl-9 pr-3 py-2 text-white placeholder-slate-500 font-mono text-xs focus:border-emerald-400 focus:outline-hidden backdrop-blur-md"
                  />
                </div>
              </div>

              {/* Anon Key Input */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 flex items-center justify-between">
                  <span>Supabase Anon (Public) Key</span>
                  <span className="text-[10px] text-slate-400">eyJhbGciOiJIUzI1NiIsInR5cCI6...</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full rounded-xl border border-white/10 bg-white/[0.05] pl-9 pr-3 py-2 text-white placeholder-slate-500 font-mono text-xs focus:border-emerald-400 focus:outline-hidden backdrop-blur-md"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 text-xs font-bold transition-all cursor-pointer border border-white/10 active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${testing ? 'animate-spin' : ''}`} />
                  <span>{testing ? 'টেস্ট করা হচ্ছে...' : 'কানেকশন টেস্ট করুন'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-105 text-slate-950 px-5 py-2 text-xs font-black shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
                >
                  <Check className="h-4 w-4" />
                  <span>{saveSuccess ? 'সফলভাবে সংরক্ষিত!' : 'ক্রেডেনশিয়াল সংরক্ষণ করুন'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopySql}
                  className="ml-auto flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 px-3.5 py-2 text-xs font-bold transition-all cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'কপিকৃত!' : 'SQL কোড কপি'}</span>
                </button>
              </div>

              {/* Test feedback */}
              {testResult && (
                <div className={`p-3 rounded-2xl border flex items-start gap-2.5 text-xs font-medium ${
                  testResult.success 
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                }`}>
                  {testResult.success ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-bold">
                  {lang === 'bn' ? 'Supabase SQL Editor-এ রান করার সম্পূর্ণ স্ক্রিপ্ট:' : 'Complete script to run in Supabase SQL Editor:'}
                </span>

                <button
                  type="button"
                  onClick={handleCopySql}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-1.5 text-xs font-black shadow-md transition-all cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'স্ক্রিপ্ট কপি হয়েছে!' : 'এক ক্লিকে সম্পূর্ণ কোড কপি'}</span>
                </button>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/60 p-3 font-mono text-[11px] text-emerald-300 max-h-[380px] overflow-y-auto leading-relaxed select-all">
                <pre>{SUPABASE_SQL_SCRIPT}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>ডিফল্ট সুপার অ্যাডমিন: <b>admin</b> | পাসওয়ার্ড: <b>admin123</b></span>
          <button
            onClick={onClose}
            className="rounded-xl border border-white/15 px-4 py-1.5 font-bold text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
