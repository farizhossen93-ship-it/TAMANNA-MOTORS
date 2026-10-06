import React, { useState, useRef } from 'react';
import { Settings, Save, CheckCircle, AlertCircle, Building2, Percent, DollarSign, Upload, Image, Trash2, Sparkles, RefreshCw, Eye } from 'lucide-react';
import { BusinessSettings, InvoiceSettings } from '../types';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface SettingsViewProps {
  type: 'business' | 'invoice';
  businessSettings: BusinessSettings;
  invoiceSettings: InvoiceSettings;
  onSaveBusiness: (settings: BusinessSettings) => void;
  onSaveInvoice: (settings: InvoiceSettings) => void;
  lang?: Language;
  onClearTempData?: () => void;
  onResetDatabase?: () => void;
}

const PRESET_LOGOS = [
  {
    name: "Classic Motor Bike",
    url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    name: "Racing Superbike",
    url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    name: "Golden Gear Workshop",
    url: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    name: "Speed Performance Badge",
    url: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=150&h=150&q=80"
  }
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  type,
  businessSettings,
  invoiceSettings,
  onSaveBusiness,
  onSaveInvoice,
  lang = 'en',
  onClearTempData,
  onResetDatabase
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage(lang === 'bn' ? 'ছবির সাইজ ৫MB এর কম হতে হবে।' : 'File size must be under 5MB.');
        setTimeout(() => setErrorMessage(null), 3500);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawResult = event.target?.result as string;
        // Compress image using canvas so it fits smoothly into storage
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

  const handleApplyPresetLogo = (url: string) => {
    handleSaveLogoOnly(url);
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

      {/* ============================================================== */}
      {/* Brand & Receipt Logo Management Card */}
      {/* ============================================================== */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs text-xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Image className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {lang === 'bn' ? 'ব্যবসায়িক ব্র্যান্ড লোগো ও থার্মাল রসিদ প্রতীক' : 'Business Brand Logo & Receipt Emblem'}
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'bn'
                ? 'এই লোগোটি টপ বার, সাইডবার এবং পিওএস থার্মাল রসিদে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।'
                : 'This logo is synchronized across the top header, sidebar, and printable POS receipts.'}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
            <Sparkles className="h-3 w-3" />
            {customLogoUrl ? (lang === 'bn' ? 'কাস্টম লোগো সক্রিয়' : 'Custom Logo Active') : (lang === 'bn' ? 'ডিফল্ট প্রতীক' : 'Default Emblem')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {/* Logo Live Preview in 3 Contexts */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              {lang === 'bn' ? 'লাইভ প্রিভিউ' : 'Live Preview'}
            </span>
            <div className="h-20 w-20 rounded-2xl border-2 border-emerald-500/40 p-1.5 bg-white dark:bg-slate-900 shadow-md flex items-center justify-center overflow-hidden">
              {customLogoUrl ? (
                <img src={customLogoUrl} alt="Tamanna Motors Logo" className="h-full w-full object-contain rounded-xl" />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <Image className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                  <span className="text-[9px] mt-1">No Logo</span>
                </div>
              )}
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white mt-2">TAMANNA MOTORS</span>
            <span className="text-[10px] text-slate-500">Dhaka Central Showroom</span>

            {customLogoUrl && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline"
              >
                <Trash2 className="h-3 w-3" />
                <span>{lang === 'bn' ? 'লোগো সরান' : 'Remove Logo'}</span>
              </button>
            )}
          </div>

          {/* Upload and URL input */}
          <div className="md:col-span-2 space-y-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Upload className="h-3.5 w-3.5 text-emerald-600" />
                <span>{lang === 'bn' ? 'ডিভাইস থেকে ছবি আপলোড করুন' : 'Upload Image File (PNG, JPG, SVG, WebP)'}</span>
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-slate-800 dark:hover:bg-emerald-700 shadow-xs transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span>{lang === 'bn' ? 'ছবি নির্বাচন করুন' : 'Choose Logo File'}</span>
                </button>
                <span className="text-[11px] text-slate-500 self-center">
                  {lang === 'bn' ? 'সর্বোচ্চ ২MB' : 'Max 2MB, auto-scaled'}
                </span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'অথবা লোগোর ওয়েব লিঙ্ক (URL) দিন' : 'Or Provide Direct Logo Image URL'}
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customLogoUrl}
                  onChange={(e) => setCustomLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSaveLogoOnly(customLogoUrl)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors shrink-0"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{lang === 'bn' ? 'লোগো সংরক্ষণ ও সিঙ্ক' : 'Save & Sync Logo'}</span>
                </button>
              </div>
            </div>

            {/* Preset Motor Logos */}
            <div>
              <span className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {lang === 'bn' ? 'মোটরসাইকেল ব্র্যান্ড লোগো প্রি-সেটসমূহ:' : 'Or Select Automotive Preset Logo:'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_LOGOS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPresetLogo(preset.url)}
                    className={`flex items-center gap-2 rounded-lg border p-1.5 text-left transition-all ${
                      customLogoUrl === preset.url
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <img src={preset.url} alt={preset.name} className="h-6 w-6 rounded-md object-cover shrink-0" />
                    <span className="text-[10px] font-semibold truncate">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {type === 'business' ? (
        <form onSubmit={handleSaveBusiness} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4 text-xs transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-slate-400" /> {lang === 'bn' ? 'প্রতিষ্ঠানের নাম' : 'Business Name'}
              </label>
              <input
                type="text"
                required
                value={bSettings.businessName}
                onChange={(e) => setBSettings({ ...bSettings, businessName: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'টিন / বিন নাম্বার' : 'BIN / Tax Number'}
              </label>
              <input
                type="text"
                value={bSettings.taxNumber}
                onChange={(e) => setBSettings({ ...bSettings, taxNumber: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 font-mono text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-slate-400" /> {lang === 'bn' ? 'মূল মুদ্রা' : 'Default Currency'}
              </label>
              <select
                value={bSettings.defaultCurrency}
                onChange={(e) => setBSettings({ ...bSettings, defaultCurrency: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="BDT (৳)">BDT - Bangladeshi Taka (৳)</option>
                <option value="USD ($)">USD - US Dollar ($)</option>
                <option value="EUR (€)">EUR - Euro (€)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Percent className="h-3.5 w-3.5 text-slate-400" /> {lang === 'bn' ? 'ডিফল্ট ভ্যাট হার (%)' : 'Default VAT Rate (%)'}
              </label>
              <input
                type="number"
                step="0.5"
                value={bSettings.defaultTaxRate}
                onChange={(e) => setBSettings({ ...bSettings, defaultTaxRate: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 font-mono text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'অর্থবছর শুরু' : 'Financial Year Start'}
              </label>
              <select
                value={bSettings.financialYearStart}
                onChange={(e) => setBSettings({ ...bSettings, financialYearStart: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="July">July (বাংলাদেশ অর্থবছর)</option>
                <option value="January">January</option>
                <option value="April">April</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'প্রধান শোরুম ও দোকান ঠিকানা' : 'Showroom Address'}
              </label>
              <input
                type="text"
                value={bSettings.address}
                onChange={(e) => setBSettings({ ...bSettings, address: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'যোগাযোগ নাম্বার' : 'Contact Phone'}
              </label>
              <input
                type="text"
                value={bSettings.contactPhone}
                onChange={(e) => setBSettings({ ...bSettings, contactPhone: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 font-mono text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>{lang === 'bn' ? 'ব্যবসা সেটিংস সংরক্ষণ করুন' : 'Save Business Settings'}</span>
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSaveInvoice} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4 text-xs transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'চালান প্রিফিক্স' : 'Invoice Prefix'}
              </label>
              <input
                type="text"
                value={iSettings.invoicePrefix}
                onChange={(e) => setISettings({ ...iSettings, invoicePrefix: e.target.value })}
                placeholder="TM-2026-"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 font-mono text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'থার্মাল পেপার সাইজ' : 'Thermal Paper Size'}
              </label>
              <select
                value={iSettings.paperSize}
                onChange={(e) => setISettings({ ...iSettings, paperSize: e.target.value as any })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="80mm">80mm (Standard POS Thermal Roll)</option>
                <option value="A4">A4 Invoice Paper</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              {lang === 'bn' ? 'রসিদ ফুটার নোট' : 'Receipt Footer Note'}
            </label>
            <input
              type="text"
              value={iSettings.footerNotes}
              onChange={(e) => setISettings({ ...iSettings, footerNotes: e.target.value })}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              {lang === 'bn' ? 'নিয়ম ও শর্তাবলী' : 'Terms and Conditions'}
            </label>
            <textarea
              rows={3}
              value={iSettings.termsAndConditions}
              onChange={(e) => setISettings({ ...iSettings, termsAndConditions: e.target.value })}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showLogo"
              checked={iSettings.showLogo}
              onChange={(e) => setISettings({ ...iSettings, showLogo: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="showLogo" className="font-semibold text-slate-700 dark:text-slate-300">
              {lang === 'bn' ? 'রসিদে তামান্না মোটরসের ব্র্যান্ড লোগো প্রিন্ট করুন' : 'Print TAMANNA MOTORS logo on receipts'}
            </label>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>{lang === 'bn' ? 'ইনভয়েস সেটিংস সংরক্ষণ করুন' : 'Save Invoice Settings'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Database Maintenance & Temp Data Clean Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Trash2 className="h-4 w-4 text-rose-500" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            {lang === 'bn' ? 'অস্থায়ী ডেটা ও সিস্টেম ক্যাশ ব্যবস্থাপনা' : 'Temporary Data & System Cache Maintenance'}
          </h4>
        </div>
        <p className="text-xs text-slate-500">
          {lang === 'bn' 
            ? 'পরীক্ষামূলক বা ডেমো বিক্রয় ডেটা মুছে ফেলুন অথবা সম্পূর্ণ ডাটাবেজ প্রাথমিক অবস্থায় ফিরিয়ে আনুন।' 
            : 'Clear temporary test sales receipts or restore initial business defaults.'}
        </p>

        <div className="flex flex-wrap gap-3 pt-1">
          {onClearTempData && (
            <button
              type="button"
              onClick={onClearTempData}
              className="flex items-center gap-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 px-4 py-2 text-xs font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>{lang === 'bn' ? 'অস্থায়ী বিক্রয় ডেটা মুছুন' : 'Clear Temporary Sales Data'}</span>
            </button>
          )}

          {onResetDatabase && (
            <button
              type="button"
              onClick={onResetDatabase}
              className="flex items-center gap-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 px-4 py-2 text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{lang === 'bn' ? 'ফ্যাক্টরি রিসেট (ডিফল্ট ডেটা)' : 'Reset Database to Defaults'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
