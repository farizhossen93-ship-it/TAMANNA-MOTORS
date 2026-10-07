import React, { useState, useRef } from 'react';
import { Settings, Save, CheckCircle, AlertCircle, Building2, Percent, DollarSign, Upload, Image, Trash2, Sparkles, RefreshCw, Eye, Database, Cloud, Wifi, Shield } from 'lucide-react';
import { BusinessSettings, InvoiceSettings } from '../types';
import { Language, TRANSLATIONS } from '../i18n/translations';
import { uploadToSupabaseStorage } from '../lib/supabaseStorage';
import { INITIAL_TAMANNA_PRODUCTS } from '../data/dbManager';

interface SettingsViewProps {
  type: 'business' | 'invoice';
  businessSettings: BusinessSettings;
  invoiceSettings: InvoiceSettings;
  onSaveBusiness: (settings: BusinessSettings) => void;
  onSaveInvoice: (settings: InvoiceSettings) => void;
  lang?: Language;
  onClearTempData?: () => void;
  onClearAllMockData?: () => void;
  onResetDatabase?: () => void;
  onRestoreCatalog?: () => void;
  isSuperAdmin?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  type,
  businessSettings,
  invoiceSettings,
  onSaveBusiness,
  onSaveInvoice,
  lang = 'en',
  onClearTempData,
  onClearAllMockData,
  onResetDatabase,
  onRestoreCatalog,
  isSuperAdmin = false
}) => {
  const t = TRANSLATIONS[lang];
  const [bSettings, setBSettings] = useState<BusinessSettings>(businessSettings);
  const [iSettings, setISettings] = useState<InvoiceSettings>(invoiceSettings);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customLogoUrl, setCustomLogoUrl] = useState<string>(businessSettings.logoUrl || '');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Instant logo saver across both business and invoice configs
  const handleSaveLogoOnly = (newLogoUrl?: string) => {
    const urlToSave = typeof newLogoUrl === 'string' ? newLogoUrl : customLogoUrl;
    setCustomLogoUrl(urlToSave);
    const updatedB = { ...bSettings, logoUrl: urlToSave };
    const updatedI = { ...iSettings, logoUrl: urlToSave };
    setBSettings(updatedB);
    setISettings(updatedI);
    onSaveBusiness(updatedB);
    onSaveInvoice(updatedI);
    setErrorMessage(null);
    setSavedMessage(lang === 'bn' ? 'লোগো সফলভাবে সংরক্ষিত ও সিঙ্ক হয়েছে!' : 'Brand logo saved and synchronized successfully!');
    setTimeout(() => setSavedMessage(null), 3500);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage(lang === 'bn' ? 'ছবির সাইজ ১০MB এর কম হতে হবে।' : 'File size must be under 10MB.');
        setTimeout(() => setErrorMessage(null), 3500);
        return;
      }

      // Try uploading directly to Supabase Storage
      try {
        const uploadRes = await uploadToSupabaseStorage(file, 'logos', 'tamanna_brand_logo');
        if (uploadRes.url) {
          handleSaveLogoOnly(uploadRes.url);
          setSavedMessage(lang === 'bn' ? 'লোগো Supabase Storage-এ সফলভাবে আপলোড হয়েছে।' : 'Logo uploaded to Supabase Storage.');
          setTimeout(() => setSavedMessage(null), 3000);
          return;
        }
      } catch (e) {
        console.warn('Supabase storage upload fallback:', e);
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const rawResult = event.target?.result as string;
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 240;
          let w = img.width;
          let h = img.height;
          if (w > h) {
            if (w > maxDim) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            }
          } else {
            if (h > maxDim) {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/png', 0.9);
            handleSaveLogoOnly(compressed);
          } else {
            handleSaveLogoOnly(rawResult);
          }
        };
        img.onerror = () => {
          handleSaveLogoOnly(rawResult);
        };
        img.src = rawResult;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    handleSaveLogoOnly('');
  };

  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...bSettings, logoUrl: customLogoUrl };
    onSaveBusiness(updated);
    onSaveInvoice({ ...iSettings, logoUrl: customLogoUrl });
    setSavedMessage(lang === 'bn' ? 'ব্যবসা সেটিংস ও লোগো সফলভাবে সংরক্ষিত হয়েছে।' : 'Business settings and logo updated successfully.');
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...iSettings, logoUrl: customLogoUrl };
    onSaveInvoice(updated);
    onSaveBusiness({ ...bSettings, logoUrl: customLogoUrl });
    setSavedMessage(lang === 'bn' ? 'চালান ও রসিদ সেটিংস সংরক্ষিত হয়েছে।' : 'Invoice template settings saved.');
    setTimeout(() => setSavedMessage(null), 3000);
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-colors">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {type === 'business'
              ? (lang === 'bn' ? 'ব্যবসা প্রোফাইল ও মাস্টার সেটিংস' : 'Business Profile & Master Settings')
              : (lang === 'bn' ? 'চালান ও থার্মাল রসিদ সেটিংস' : 'Invoice & Thermal Receipt Settings')}
          </h1>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          TAMANNA MOTORS · {lang === 'bn' ? 'ট্যাক্স/ভ্যাট হার, কারেন্সি ও শোরুম ঠিকানা ব্যবস্থাপনা' : 'Configure enterprise organizational credentials, currency, and receipt layout.'}
        </p>
      </div>

      {savedMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 p-3 text-xs font-bold text-emerald-800 dark:text-emerald-300 animate-in fade-in">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <span>{savedMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 p-3 text-xs font-bold text-rose-800 dark:text-rose-300 animate-in fade-in">
          <AlertCircle className="h-4 w-4 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Brand Logo Upload Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4 text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'ব্র্যান্ড লোগো (Brand Logo & Watermark)' : 'Brand Logo & Watermark'}
            </h4>
          </div>
          <span className="text-[10px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            Cloud Storage Synced
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="h-20 w-20 shrink-0 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden shadow-xs">
            {customLogoUrl ? (
              <img src={customLogoUrl} alt="Logo" className="h-full w-full object-contain" />
            ) : (
              <Building2 className="h-8 w-8 text-slate-400" />
            )}
          </div>

          <div className="flex-1 space-y-2 w-full">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white px-3.5 py-2 text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs"
              >
                <Upload className="h-3.5 w-3.5 text-emerald-400" />
                <span>{lang === 'bn' ? 'নতুন লোগো আপলোড' : 'Upload Logo'}</span>
              </button>

              {customLogoUrl && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 px-3.5 py-2 text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{lang === 'bn' ? 'লোগো সরান' : 'Remove Logo'}</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              {lang === 'bn' ? 'PNG, JPG বা WEBP ফরম্যাট (সর্বোচ্চ ১০MB)' : 'Recommended PNG or JPG, max 10MB.'}
            </p>
          </div>
        </div>
      </div>

      {/* Business Credentials Form */}
      {type === 'business' ? (
        <form onSubmit={handleSaveBusiness} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'ব্যবসার নাম' : 'Business Name'}
              </label>
              <input
                type="text"
                value={bSettings.businessName}
                onChange={(e) => setBSettings({ ...bSettings, businessName: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 font-bold text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'ট্যাক্স / ভ্যাট বিন নম্বর' : 'Tax / BIN Number'}
              </label>
              <input
                type="text"
                value={bSettings.taxNumber}
                onChange={(e) => setBSettings({ ...bSettings, taxNumber: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 font-mono text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'প্রাথমিক শোরুম ও শাখা' : 'Primary Location / Branch'}
              </label>
              <input
                type="text"
                value={bSettings.primaryLocation}
                onChange={(e) => setBSettings({ ...bSettings, primaryLocation: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'মোবাইল / হটলাইন' : 'Contact Phone'}
              </label>
              <input
                type="text"
                value={bSettings.contactPhone}
                onChange={(e) => setBSettings({ ...bSettings, contactPhone: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 font-mono text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              {lang === 'bn' ? 'পূর্ণ ঠিকানা' : 'Full Business Address'}
            </label>
            <textarea
              rows={2}
              value={bSettings.address}
              onChange={(e) => setBSettings({ ...bSettings, address: e.target.value })}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
            />
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>{t.saveChanges}</span>
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSaveInvoice} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              {lang === 'bn' ? 'ইনভয়েস প্রিফিক্স (Prefix)' : 'Invoice Number Prefix'}
            </label>
            <input
              type="text"
              value={iSettings.invoicePrefix}
              onChange={(e) => setISettings({ ...iSettings, invoicePrefix: e.target.value })}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 font-mono text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              {lang === 'bn' ? 'শর্তাবলী ও ওয়ারেন্টি নোট' : 'Terms & Conditions'}
            </label>
            <textarea
              rows={2}
              value={iSettings.termsAndConditions}
              onChange={(e) => setISettings({ ...iSettings, termsAndConditions: e.target.value })}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              {lang === 'bn' ? 'রসিদের ফুটার নোট (Footer Notes)' : 'Receipt Footer Notes'}
            </label>
            <input
              type="text"
              value={iSettings.footerNotes}
              onChange={(e) => setISettings({ ...iSettings, footerNotes: e.target.value })}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
            />
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>{t.saveChanges}</span>
            </button>
          </div>
        </form>
      )}

      {/* Enterprise Cloud Storage Status Badge (Clean & Hidden Keys) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3 text-xs transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Cloud className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{lang === 'bn' ? 'ইন্টিগ্রেটেড ক্লাউড ডেটাবেজ ও স্টোরেজ' : 'Integrated Cloud Database & Storage'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Connected & Secure
                </span>
              </h4>
              <p className="text-[11px] text-slate-500">
                {lang === 'bn'
                  ? 'তামান্না মোটরস এন্টারপ্রাইজ ক্লাউড পার্সিস্টেন্স এবং অটো-ব্যাকআপ সক্রিয় রয়েছে।'
                  : 'Tamanna Motors Enterprise Cloud Persistence and Auto-Backup active.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Database Maintenance & Catalog Restoration (Super Admin Only) */}
      {isSuperAdmin && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Trash2 className="h-4 w-4 text-rose-500" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'ডেটাবেজ ও ক্যাটালগ রিস্টোর ব্যবস্থাপনা (Super Admin)' : 'Database & Catalog Restoration (Super Admin)'}
            </h4>
          </div>
          <p className="text-xs text-slate-500">
            {lang === 'bn' 
              ? 'যদি কোনো কারণে পণ্য বা ডেটা মুছে যায়, তবে নিচের বাটনে ক্লিক করে তাৎক্ষণিকভাবে ডিফল্ট পার্টস ক্যাটালগ রিস্টোর করুন।' 
              : 'Restore default Tamanna Motors motorcycle spare parts catalog instantly if data is cleared.'}
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            {onRestoreCatalog && (
              <button
                type="button"
                onClick={onRestoreCatalog}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>{lang === 'bn' ? 'ডিফল্ট পার্টস ক্যাটালগ রিস্টোর করুন' : 'Restore Default Tamanna Motors Catalog'}</span>
              </button>
            )}

            {onClearAllMockData && (
              <button
                type="button"
                onClick={onClearAllMockData}
                className="flex items-center gap-1.5 rounded-xl border border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/40 px-4 py-2 text-xs font-bold text-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{lang === 'bn' ? 'সব ডেমো ডাটা সম্পূর্ণ মুছুন' : 'Wipe All Mock/Demo Data'}</span>
              </button>
            )}

            {onResetDatabase && (
              <button
                type="button"
                onClick={onResetDatabase}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>{lang === 'bn' ? 'ফ্যাক্টরি রিসেট' : 'Factory Reset Database'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
