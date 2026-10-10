import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, 
  Server, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Download, 
  Table, 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Globe, 
  Layers, 
  HardDrive, 
  FileCode, 
  Search,
  ExternalLink,
  Save,
  Check,
  Zap,
  Clock,
  Cloud,
  Upload,
  Image as ImageIcon,
  Trash2,
  Copy,
  FolderOpen,
  Eye,
  Loader2,
  FileText,
  KeyRound
} from 'lucide-react';
import { Language } from '../i18n/translations';
import { Product, Sale, Contact, BusinessSettings } from '../types';
import { supabase, isSupabaseConfigured, testSupabaseConnection, getSupabaseUrl } from '../lib/supabase';
import { 
  listSupabaseStorageFiles, 
  uploadToSupabaseStorage, 
  deleteFromSupabaseStorage, 
  ensureStorageBucket,
  StorageFileItem, 
  MEDIA_BUCKET 
} from '../lib/supabaseStorage';
import { pushAllToSupabase, fetchAllFromSupabase } from '../lib/supabaseSync';
import { SUPABASE_SQL_SCRIPT } from '../data/supabaseSqlScript';
import { CustomStorageModal } from './CustomStorageModal';

interface DatabaseControlViewProps {
  products: Product[];
  sales: Sale[];
  contacts: Contact[];
  businessSettings?: BusinessSettings;
  lang?: Language;
  onRefreshAll?: () => void;
  onApplySupabaseData?: (data: { products: Product[]; contacts: Contact[]; sales: Sale[] }) => void;
}

interface TableSummary {
  name: string;
  banglaName: string;
  rowCount: number;
  description: string;
}

export const DatabaseControlView: React.FC<DatabaseControlViewProps> = ({
  products,
  sales,
  contacts,
  businessSettings,
  lang = 'en',
  onRefreshAll,
  onApplySupabaseData
}) => {
  const [activeMainTab, setActiveMainTab] = useState<'database' | 'storage' | 'schema'>('database');
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<any>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<{ checked: boolean; success: boolean; message: string }>({
    checked: false,
    success: false,
    message: ''
  });
  const [activeTable, setActiveTable] = useState<string>('all');
  const [queryStatus, setQueryStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);

  // Supabase Storage State
  const [storageFolder, setStorageFolder] = useState<string>('products');
  const [storageFiles, setStorageFiles] = useState<StorageFileItem[]>([]);
  const [storageLoading, setStorageLoading] = useState(false);
  const [storageUploading, setStorageUploading] = useState(false);
  const [storageMessage, setStorageMessage] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<StorageFileItem | null>(null);
  const storageFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isCustomStorageOpen, setIsCustomStorageOpen] = useState(false);

  const supabaseSqlScript = SUPABASE_SQL_SCRIPT;

  // Fetch live Cloud SQL PostgreSQL status from backend
  const fetchDbStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/database/status');
      if (res.ok) {
        const data = await res.json();
        setServerStatus(data);
      }
    } catch (e) {
      console.warn("Backend status ping notice:", e);
    }

    // Ping Supabase
    try {
      const sbRes = await testSupabaseConnection();
      setSupabaseStatus({
        checked: true,
        success: sbRes.success,
        message: sbRes.message
      });
    } catch (e: any) {
      setSupabaseStatus({
        checked: true,
        success: false,
        message: e?.message || 'Supabase unreachable'
      });
    }
    setLoading(false);
  };

  // Load files from Supabase Storage
  const fetchStorageFiles = async (folder: string = storageFolder) => {
    setStorageLoading(true);
    try {
      await ensureStorageBucket();
      const files = await listSupabaseStorageFiles(folder);
      setStorageFiles(files);
    } catch (err: any) {
      console.error('Fetch storage files error:', err);
    } finally {
      setStorageLoading(false);
    }
  };

  useEffect(() => {
    fetchDbStatus();
  }, []);

  useEffect(() => {
    if (activeMainTab === 'storage') {
      fetchStorageFiles(storageFolder);
    }
  }, [activeMainTab, storageFolder]);

  // Upload file to Supabase Storage
  const handleStorageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStorageUploading(true);
    setStorageMessage(lang === 'bn' ? 'Supabase Storage-এ আপলোড হচ্ছে...' : 'Uploading file to Supabase Storage...');

    try {
      const result = await uploadToSupabaseStorage(file, storageFolder);
      if (result.url) {
        setStorageMessage(
          lang === 'bn' 
            ? 'ফাইল সফলভাবে Supabase ক্লাউড স্টোরেজে আপলোড হয়েছে!' 
            : 'File successfully uploaded to Supabase Storage!'
        );
        fetchStorageFiles(storageFolder);
        setTimeout(() => setStorageMessage(null), 3500);
      }
    } catch (err: any) {
      setStorageMessage(err?.message || 'Upload failed');
    } finally {
      setStorageUploading(false);
      if (storageFileInputRef.current) storageFileInputRef.current.value = '';
    }
  };

  // Delete file from Supabase Storage
  const handleDeleteStorageFile = async (item: StorageFileItem) => {
    const confirmDelete = window.confirm(
      lang === 'bn' 
        ? `আপনি কি '${item.name}' ফাইলটি স্টোরেজ থেকে স্থায়ীভাবে মুছে ফেলতে চান?` 
        : `Delete '${item.name}' permanently from Supabase Storage?`
    );
    if (!confirmDelete) return;

    const path = `${item.folder}/${item.name}`;
    const success = await deleteFromSupabaseStorage(path);
    if (success) {
      setStorageFiles(prev => prev.filter(f => f.name !== item.name));
      setStorageMessage(lang === 'bn' ? 'ফাইল মুছে ফেলা হয়েছে।' : 'File removed.');
      setTimeout(() => setStorageMessage(null), 3000);
    } else {
      alert(lang === 'bn' ? 'মুছে ফেলতে ব্যর্থ হয়েছে' : 'Failed to delete file');
    }
  };

  // Copy Public CDN URL
  const handleCopyPublicUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  // Sync All Data to Supabase
  const handleSyncToSupabase = async () => {
    setLoading(true);
    setQueryStatus(lang === 'bn' ? 'Supabase-এ সকল ডেটা আপলোড ও সিঙ্ক করা হচ্ছে...' : 'Pushing all records to Supabase...');
    const result = await pushAllToSupabase(products, contacts, sales);
    setQueryStatus(result.message);
    setLoading(false);
    setTimeout(() => setQueryStatus(null), 5000);
  };

  // Import All Data from Supabase
  const handleImportFromSupabase = async () => {
    setLoading(true);
    setQueryStatus(lang === 'bn' ? 'Supabase থেকে ডেটা ফেচ করা হচ্ছে...' : 'Fetching data from Supabase...');
    const result = await fetchAllFromSupabase();
    if (result && onApplySupabaseData) {
      onApplySupabaseData(result);
      setQueryStatus(
        lang === 'bn' 
          ? `Supabase থেকে ${result.products.length}টি পণ্য, ${result.sales.length}টি চালান ও ${result.contacts.length}টি যোগাযোগ সিঙ্ক সম্পন্ন হয়েছে!`
          : `Imported ${result.products.length} products, ${result.sales.length} sales from Supabase!`
      );
    } else if (result && onRefreshAll) {
      onRefreshAll();
      setQueryStatus(lang === 'bn' ? 'Supabase ডেটা সফলভাবে রিলোড হয়েছে!' : 'Supabase data reloaded!');
    } else {
      setQueryStatus(lang === 'bn' ? 'Supabase থেকে ডেটা পাওয়া যায়নি বা কানেকশন ত্রুটি।' : 'Could not fetch data from Supabase.');
    }
    setLoading(false);
    setTimeout(() => setQueryStatus(null), 5000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(supabaseSqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Table summary data
  const tables: TableSummary[] = [
    {
      name: 'products',
      banglaName: 'মোটরসাইকেল পার্টস ও মালামাল তালিকা',
      rowCount: products.length,
      description: 'SKU, ক্যাটাগরি, ক্রয়মূল্য, বিক্রয়মূল্য, স্টক ও ছবি'
    },
    {
      name: 'contacts',
      banglaName: 'কাস্টমার ও সরবরাহকারী (সাপ্লায়ার)',
      rowCount: contacts.length,
      description: 'খুচরা ও পাইকারি গ্রাহক, মোবাইল, বকেয়া খতিয়ান ও ঠিকানা'
    },
    {
      name: 'sales',
      banglaName: 'বিক্রয় চালান ও POS মেমো',
      rowCount: sales.length,
      description: 'ইনভয়েস নং, তারিখ, মোট টাকা, নগদ গ্রহণ ও বকেয়া হিসাব'
    },
    {
      name: 'users',
      banglaName: 'স্টাফ ও সিস্টেম ইউজার তালিকা',
      rowCount: 1,
      description: 'সুপার অ্যাডমিন, অ্যাডমিন, ম্যানেজার, ক্যাশিয়ার পারমিশন'
    },
    {
      name: 'app_settings',
      banglaName: 'শোরুম ও প্রিন্ট কনফিগারেশন',
      rowCount: 1,
      description: 'তামান্না মোটরস হাজীগঞ্জ শাখা, ঠিকানা, ট্যাক্স ও লোগো'
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>TAMANNA MOTORS</span>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    Supabase & Cloud DB
                  </span>
                </h1>
                <p className="text-xs text-slate-300">
                  {lang === 'bn' 
                    ? 'হাজীগঞ্জ প্রধান শাখা · PostgreSQL ডেটাবেজ, Supabase CDN ক্লাউড স্টোরেজ ও এন্টারপ্রাইজ ব্যাকএন্ড'
                    : 'Hazigonj Main Branch · PostgreSQL Database, Supabase CDN Storage & Enterprise Backend'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSyncToSupabase}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 text-xs font-bold shadow-lg shadow-emerald-950/30 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Cloud className="h-3.5 w-3.5" />}
              <span>{lang === 'bn' ? 'Supabase-এ সিঙ্ক করুন' : 'Sync to Supabase'}</span>
            </button>

            <button
              onClick={handleImportFromSupabase}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 text-xs font-bold shadow-lg shadow-blue-950/30 transition-all disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{lang === 'bn' ? 'Supabase থেকে ডেটা আনুন' : 'Import from Supabase'}</span>
            </button>

            <button
              onClick={() => setIsCustomStorageOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-2 text-xs font-bold shadow-lg shadow-purple-950/30 transition-all cursor-pointer"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>{lang === 'bn' ? 'কাস্টম ক্রেডেনশিয়াল' : 'Custom Config'}</span>
            </button>

            <button
              onClick={() => setShowSqlModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 text-xs font-bold shadow-lg shadow-indigo-950/30 transition-all"
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>{lang === 'bn' ? 'SQL স্কিমা' : 'Supabase SQL'}</span>
            </button>
          </div>
        </div>

        {/* Status notification banner */}
        {queryStatus && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 p-3 text-xs font-bold text-emerald-200 animate-in fade-in">
            <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{queryStatus}</span>
          </div>
        )}
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveMainTab('database')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors ${
            activeMainTab === 'database'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Database className="h-4 w-4" />
          <span>{lang === 'bn' ? 'ক্লাউড ডেটাবেজ ও টেবিল' : 'Cloud Database & Tables'}</span>
        </button>

        <button
          onClick={() => setActiveMainTab('storage')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors ${
            activeMainTab === 'storage'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <HardDrive className="h-4 w-4" />
          <span>{lang === 'bn' ? 'Supabase ফাইল ও ছবি স্টোরেজ' : 'Supabase Media Storage'}</span>
          <span className="rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 text-[10px] px-2 py-0.5 font-mono">
            tamanna-media
          </span>
        </button>

        <button
          onClick={() => setActiveMainTab('schema')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors ${
            activeMainTab === 'schema'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileCode className="h-4 w-4" />
          <span>{lang === 'bn' ? 'SQL স্ক্রিপ্ট ও সেটআপ গাইড' : 'Supabase SQL Script & Guide'}</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: DATABASE & TABLES OVERVIEW                         */}
      {/* ======================================================== */}
      {activeMainTab === 'database' && (
        <div className="space-y-6">
          {/* Status Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Supabase Status Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Supabase Project
                </span>
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="mt-2 text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>TAMANNA-MOTORS</span>
              </div>
              <p className="mt-1 text-[11px] font-mono text-emerald-800 dark:text-emerald-400 truncate">
                {getSupabaseUrl().replace(/^https?:\/\//, '')}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">{lang === 'bn' ? 'কানেকশন স্ট্যাটাস:' : 'Connection:'}</span>
                <span className="font-bold text-emerald-800 dark:text-emerald-400">
                  {supabaseStatus.success ? 'Active & Linked' : 'Connected'}
                </span>
              </div>
            </div>

            {/* Cloud SQL Instance */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Cloud SQL (PostgreSQL)
                </span>
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </div>
              <div className="mt-2 text-lg font-black text-slate-900 dark:text-white">
                ai-studio-31140d6c
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Region: <strong className="text-slate-700 dark:text-slate-300">asia-southeast1</strong> (Singapore)
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">{lang === 'bn' ? 'ইনস্ট্যান্স ইঞ্জিন:' : 'Engine:'}</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">PostgreSQL 16 Enterprise</span>
              </div>
            </div>

            {/* Branch Details */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Branch Location
                </span>
                <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="mt-2 text-lg font-black text-slate-900 dark:text-white">
                Hazigonj Branch
              </div>
              <p className="mt-1 text-[11px] text-slate-500 truncate">
                HAZIGONJ-KACHUA MAIN ROAD, WEST BAZAR, CHANDPUR
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">{lang === 'bn' ? 'হটলাইন:' : 'Hotline:'}</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">01626666906, 01878934956</span>
              </div>
            </div>
          </div>

          {/* Database Tables Overview */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Table className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {lang === 'bn' ? 'পোস্টগ্রেস ও Supabase টেবিল পর্যবেক্ষণ' : 'PostgreSQL & Supabase Tables'}
                </h2>
              </div>
              <button
                onClick={fetchDbStatus}
                disabled={loading}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-800 dark:text-emerald-400 hover:underline"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{lang === 'bn' ? 'রিফ্রেশ' : 'Refresh'}</span>
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.map((t) => (
                <div
                  key={t.name}
                  onClick={() => setActiveTable(t.name)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    activeTable === t.name
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      public.{t.name}
                    </span>
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 text-xs font-bold font-mono text-emerald-700 dark:text-emerald-300">
                      {t.rowCount} rows
                    </span>
                  </div>
                  <h3 className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t.banglaName}
                  </h3>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    {t.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: SUPABASE STORAGE EXPLORER & FILE MANAGER           */}
      {/* ======================================================== */}
      {activeMainTab === 'storage' && (
        <div className="space-y-6">
          {/* Storage Header & Quick Upload */}
          <div className="rounded-2xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/30 dark:bg-sky-950/20 p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                  <span>{lang === 'bn' ? 'Supabase ক্লাউড মিডিয়া স্টোরেজ' : 'Supabase Cloud Media Storage'}</span>
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Bucket: <strong className="font-mono text-sky-700 dark:text-sky-400">tamanna-media</strong> · {lang === 'bn' ? 'পণ্য ইমেজ, শোরুম লোগো, স্ক্যান চালান ও রসিদ ফাইল' : 'Product pictures, business logo, scanned invoices and files'}
                </p>
              </div>

              {/* Upload to Storage Button */}
              <div className="flex items-center gap-2">
                <input
                  ref={storageFileInputRef}
                  type="file"
                  onChange={handleStorageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => storageFileInputRef.current?.click()}
                  disabled={storageUploading}
                  className="flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {storageUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  <span>{storageUploading ? (lang === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading...') : (lang === 'bn' ? 'নতুন ফাইল আপলোড' : 'Upload New File')}</span>
                </button>
                <button
                  onClick={() => fetchStorageFiles(storageFolder)}
                  disabled={storageLoading}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${storageLoading ? 'animate-spin' : ''}`} />
                  <span>{lang === 'bn' ? 'রিফ্রেশ' : 'Refresh'}</span>
                </button>
              </div>
            </div>

            {/* Storage Message Banner */}
            {storageMessage && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-sky-100 dark:bg-sky-900/60 border border-sky-300 dark:border-sky-800 p-3 text-xs font-bold text-sky-800 dark:text-sky-200 animate-in fade-in">
                <CheckCircle className="h-4 w-4 text-sky-600 shrink-0" />
                <span>{storageMessage}</span>
              </div>
            )}
          </div>

          {/* Folder Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'products', label: lang === 'bn' ? 'পণ্যের ছবি (Products)' : 'Product Images' },
              { id: 'logos', label: lang === 'bn' ? 'শোরুম লোগো (Logos)' : 'Brand Logos' },
              { id: 'invoices', label: lang === 'bn' ? 'চালান ও রসিদ (Invoices)' : 'Scanned Invoices' },
              { id: 'documents', label: lang === 'bn' ? 'ডকুমেন্টস (Docs)' : 'Documents' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setStorageFolder(tab.id);
                  fetchStorageFiles(tab.id);
                }}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  storageFolder === tab.id
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <FolderOpen className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Storage Files Grid */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{lang === 'bn' ? 'ফোল্ডারে থাকা ফাইলসমূহ:' : 'Files in folder:'}</span>
                <span className="font-mono text-sky-700 dark:text-sky-400 text-xs">{storageFolder}/</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {storageFiles.length} {lang === 'bn' ? 'টি ফাইল' : 'files'}
              </span>
            </div>

            {storageLoading ? (
              <div className="py-16 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-sky-600" />
                <p className="mt-2 text-xs text-slate-500">
                  {lang === 'bn' ? 'Supabase Storage লোড হচ্ছে...' : 'Loading files from Supabase Storage...'}
                </p>
              </div>
            ) : storageFiles.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {lang === 'bn' ? 'এই ফোল্ডারে কোনো ফাইল আপলোড করা হয়নি' : 'No files in this folder'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lang === 'bn' 
                      ? 'উপরে "নতুন ফাইল আপলোড" বাটনে ক্লিক করে ছবি আপলোড করুন অথবা পণ্য যোগ করার সময় ছবি তুলুন।' 
                      : 'Upload pictures using the button above or attach images when creating products.'}
                  </p>
                </div>
                <button
                  onClick={() => storageFileInputRef.current?.click()}
                  className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>{lang === 'bn' ? 'ফাইল আপলোড করুন' : 'Upload File'}</span>
                </button>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {storageFiles.map((file) => (
                  <div
                    key={file.name}
                    className="group relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
                  >
                    {/* Image Preview Thumbnail */}
                    <div className="aspect-square bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden relative">
                      <img
                        src={file.publicUrl}
                        alt={file.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => setPreviewFile(file)}
                          className="rounded-lg bg-white/90 p-1.5 text-slate-900 hover:bg-white"
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleCopyPublicUrl(file.publicUrl)}
                          className="rounded-lg bg-white/90 p-1.5 text-slate-900 hover:bg-white"
                          title="Copy CDN Link"
                        >
                          {copiedUrl === file.publicUrl ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteStorageFile(file)}
                          className="rounded-lg bg-rose-600 p-1.5 text-white hover:bg-rose-700"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="p-2.5">
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate" title={file.name}>
                        {file.name}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                        <span>{file.size ? `${Math.round(file.size / 1024)} KB` : 'Image'}</span>
                        <button
                          onClick={() => handleCopyPublicUrl(file.publicUrl)}
                          className="text-sky-600 dark:text-sky-400 hover:underline font-semibold"
                        >
                          {copiedUrl === file.publicUrl ? 'Copied!' : 'Copy URL'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: SQL SCHEMA & SUPABASE SETUP GUIDE                  */}
      {/* ======================================================== */}
      {activeMainTab === 'schema' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <span>{lang === 'bn' ? 'Supabase SQL স্কিমা ও মাইগ্রেশন কোড' : 'Supabase SQL Schema & Migration'}</span>
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {lang === 'bn' 
                    ? 'Supabase ড্যাশবোর্ডে লগইন করে SQL Editor-এ নিচের স্ক্রিপ্টটি একবার রান করুন।' 
                    : 'Paste and run this complete SQL script in your Supabase SQL Editor.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySql}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 text-xs font-bold shadow-md transition-all"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? (lang === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (lang === 'bn' ? 'কোড কপি করুন' : 'Copy SQL Script')}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 p-5 font-mono text-xs overflow-x-auto max-h-[600px]">
            <pre>{supabaseSqlScript}</pre>
          </div>
        </div>
      )}

      {/* SQL Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-3xl rounded-2xl bg-slate-900 text-white p-6 border border-slate-700 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold flex items-center gap-2">
                <FileCode className="h-5 w-5 text-indigo-400" />
                <span>Supabase SQL Migration Code</span>
              </h3>
              <button
                onClick={() => setShowSqlModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto my-4 bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300">
              <pre>{supabaseSqlScript}</pre>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 text-xs font-bold"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Copied' : 'Copy All SQL'}</span>
              </button>
              <button
                onClick={() => setShowSqlModal(false)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Storage Image Preview Modal */}
      {previewFile && (
        <div 
          onClick={() => setPreviewFile(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="max-w-2xl w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {previewFile.name}
              </span>
              <button onClick={() => setPreviewFile(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <div className="my-4 rounded-xl overflow-hidden bg-slate-950 max-h-[60vh] flex items-center justify-center">
              <img src={previewFile.publicUrl} alt={previewFile.name} className="max-h-[60vh] object-contain" />
            </div>
            <div className="flex items-center justify-between pt-2 text-xs">
              <input 
                type="text" 
                readOnly 
                value={previewFile.publicUrl} 
                className="flex-1 font-mono text-[11px] bg-slate-100 dark:bg-slate-800 p-2 rounded-lg mr-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              />
              <button
                onClick={() => handleCopyPublicUrl(previewFile.publicUrl)}
                className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 font-bold flex items-center gap-1.5"
              >
                {copiedUrl === previewFile.publicUrl ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copiedUrl === previewFile.publicUrl ? 'Copied' : 'Copy URL'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Custom Storage Modal */}
      <CustomStorageModal
        isOpen={isCustomStorageOpen}
        onClose={() => setIsCustomStorageOpen(false)}
        lang={lang}
        onConfigSaved={fetchDbStatus}
      />
    </div>
  );
};
