import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Printer, 
  CheckCircle, 
  Wrench, 
  ShieldCheck, 
  Copy, 
  Check, 
  Download, 
  AlertCircle, 
  FileText, 
  QrCode,
  Upload,
  Image as ImageIcon,
  Sparkles,
  LayoutTemplate,
  Receipt,
  Phone,
  MapPin,
  Mail,
  Building,
  Trash2
} from 'lucide-react';
import { CartItem, BusinessSettings, InvoiceSettings, DuePaymentRecord } from '../types';
import { Language, TRANSLATIONS } from '../i18n/translations';
import { printHtmlContent, downloadPrintDocument, fallbackDirectPrint } from '../utils/printHelper';
import { generateInvoiceQrCode } from '../utils/qrHelper';
import { DatabaseStorage } from '../data/dbManager';
import { toBengaliWords, toEnglishWords } from '../utils/numberToWords';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceNo: string;
  customerName: string;
  customerPhone?: string;
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  amountTendered: number;
  changeDue: number;
  paymentMethod: string;
  dateStr: string;
  invoiceDue?: number;
  duePayments?: DuePaymentRecord[];
  isMoneyReceipt?: boolean;
  businessSettings?: BusinessSettings;
  invoiceSettings?: InvoiceSettings;
  branchLocation?: string;
  cashierName?: string;
  lang?: Language;
  autoTriggerPrint?: boolean;
  onUpdateLogo?: (newLogoUrl: string) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  invoiceNo,
  customerName,
  customerPhone,
  items,
  subtotal,
  taxAmount,
  discountAmount,
  grandTotal,
  amountTendered,
  changeDue,
  paymentMethod,
  dateStr,
  invoiceDue,
  duePayments,
  isMoneyReceipt = false,
  businessSettings,
  invoiceSettings,
  branchLocation = "Hazigonj Branch, Chandpur",
  cashierName = "Authorized Cashier",
  lang = 'en',
  autoTriggerPrint = false,
  onUpdateLogo
}) => {
  const t = TRANSLATIONS[lang];
  const currencySymbol = businessSettings?.currencySymbol || "৳";
  const [copied, setCopied] = useState(false);
  const [printStatus, setPrintStatus] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  
  // Custom logo state (local fallback & live edit)
  const [currentLogo, setCurrentLogo] = useState<string>(() => {
    const raw = businessSettings?.logoUrl || invoiceSettings?.logoUrl || '';
    return raw.includes('unsplash.com') ? '' : raw;
  });
  
  // Layout mode: 'a4' (default gorgeous A4 invoice) or 'thermal' (80mm POS slip)
  const [layoutMode, setLayoutMode] = useState<'a4' | 'thermal'>('a4');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync logo when props change
  useEffect(() => {
    const raw = businessSettings?.logoUrl || invoiceSettings?.logoUrl || '';
    if (!raw.includes('unsplash.com')) {
      setCurrentLogo(raw);
    } else {
      setCurrentLogo('');
    }
  }, [businessSettings?.logoUrl, invoiceSettings?.logoUrl]);

  // Business constants with updated Hazigonj Chandpur address
  const businessName = businessSettings?.businessName || "TAMANNA MOTORS";
  const businessAddress = businessSettings?.address || "HAZIGONJ-KACHUA MAIN ROAD, WEST BAZAR, HAZIGONJ, CHANDPUR.";
  const businessPhone = businessSettings?.contactPhone || "01626666906, 01878934956";
  const businessEmail = businessSettings?.contactEmail || "tamannamotors.bd@gmail.com";
  const taxBin = businessSettings?.taxNumber || "BIN-002849102-0101";
  const footerNotes = invoiceSettings?.footerNotes || (lang === 'bn' ? "তামান্না মোটরসে কেনাকাটার জন্য আন্তরিক ধন্যবাদ! ১০০% জেনুইন পার্টসের বিশ্বস্ত প্রতিষ্ঠান।" : "Thank you for shopping at TAMANNA MOTORS! Your trusted motorcycle spares partner.");
  const terms = invoiceSettings?.termsAndConditions || (
    lang === 'bn' 
      ? "১. বিক্রিত মাল ১৪ দিনের মধ্যে অক্ষত অবস্থায় ক্যাশ মেমোসহ পরিবর্তনযোগ্য। ২. ইলেকট্রিক্যাল ও ব্যাটারি আইটেমে প্রস্তুতকারকের ওয়ারেন্টি ও শর্ত প্রযোজ্য।"
      : "1. Purchased spare parts can be exchanged within 14 days with original invoice in undamaged condition. 2. Electrical & battery items subject to manufacturer warranty."
  );

  // Generate real structured data QR code (Date, Price, Provider, Phone, Address - NO URL link)
  useEffect(() => {
    if (invoiceNo) {
      generateInvoiceQrCode(invoiceNo, grandTotal, dateStr, businessName, {
        providerPhone: businessPhone,
        providerAddress: businessAddress,
        customerName,
        paymentMethod,
        currencySymbol,
        itemsCount: items.length,
        branch: branchLocation
      })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error("QR Error:", err));
    }
  }, [invoiceNo, grandTotal, dateStr, businessName, businessPhone, businessAddress, customerName, paymentMethod, branchLocation, items, currencySymbol]);

  // Handle custom logo file selection
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawResult = event.target?.result as string;
        // Compress in canvas for optimal print and storage size
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 320;
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
            const compressedUrl = canvas.toDataURL('image/png', 0.95);
            applyNewLogo(compressedUrl);
          } else {
            applyNewLogo(rawResult);
          }
        };
        img.onerror = () => applyNewLogo(rawResult);
        img.src = rawResult;
      };
      reader.readAsDataURL(file);
    }
  };

  const applyNewLogo = (newUrl: string) => {
    setCurrentLogo(newUrl);
    if (onUpdateLogo) {
      onUpdateLogo(newUrl);
    }
    // Direct persistence to DatabaseStorage
    if (businessSettings) {
      const updatedB = { ...businessSettings, logoUrl: newUrl };
      DatabaseStorage.saveBusinessSettings(updatedB);
    }
    if (invoiceSettings) {
      const updatedI = { ...invoiceSettings, logoUrl: newUrl };
      DatabaseStorage.saveInvoiceSettings(updatedI);
    }
    setPrintStatus(lang === 'bn' ? 'কাস্টম লোগো সফলভাবে ইনভয়েসে যুক্ত ও সংরক্ষিত হয়েছে!' : 'Custom logo applied and saved successfully!');
    setTimeout(() => setPrintStatus(null), 3000);
  };

  const handleRemoveLogo = () => {
    applyNewLogo('');
    setPrintStatus(lang === 'bn' ? 'কাস্টম লোগো মুছে ফেলা হয়েছে' : 'Custom logo removed');
    setTimeout(() => setPrintStatus(null), 3000);
  };

  const handlePrint = () => {
    const el = document.getElementById(layoutMode === 'a4' ? 'printable-a4-invoice' : 'printable-receipt');
    if (el) {
      fallbackDirectPrint(el.innerHTML, `TAMANNA MOTORS - Invoice ${invoiceNo}`);
      printHtmlContent(el.innerHTML, `TAMANNA MOTORS - Invoice ${invoiceNo}`);
      setPrintStatus(
        lang === 'bn'
          ? 'প্রিন্ট কমান্ড সফল হয়েছে।'
          : 'Print sent successfully.'
      );
      setTimeout(() => setPrintStatus(null), 4000);
    } else {
      window.print();
    }
  };

  const handleDownloadSlip = () => {
    const el = document.getElementById(layoutMode === 'a4' ? 'printable-a4-invoice' : 'printable-receipt');
    if (el) {
      downloadPrintDocument(el.innerHTML, `TAMANNA_MOTORS_INVOICE_${invoiceNo}`, layoutMode);
      setPrintStatus(
        lang === 'bn'
          ? 'চালান ফাইল সফলভাবে A4 ফরম্যাটে ডাউনলোড হয়েছে!'
          : 'Invoice file downloaded successfully in A4 format!'
      );
      setTimeout(() => setPrintStatus(null), 4000);
    }
  };

  useEffect(() => {
    if (isOpen && autoTriggerPrint) {
      const timer = setTimeout(() => {
        handlePrint();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoTriggerPrint]);

  if (!isOpen) return null;

  const handleCopyReceipt = () => {
    const lines = [
      `=== ${businessName} ===`,
      businessAddress,
      `Tel: ${businessPhone} | BIN: ${taxBin}`,
      `Branch: ${branchLocation}`,
      `Invoice: ${invoiceNo} | Date: ${dateStr}`,
      `Customer: ${customerName} | Cashier: ${cashierName}`,
      '--------------------------------',
      ...items.map((it, idx) => `${idx + 1}. ${it.product.name} (${it.product.sku}) x ${it.quantity} = ${currencySymbol}${((it.customPrice ?? it.product.sellingPrice) * it.quantity).toFixed(0)}`),
      '--------------------------------',
      `Subtotal: ${currencySymbol}${subtotal.toFixed(0)}`,
      discountAmount > 0 ? `Discount: -${currencySymbol}${discountAmount.toFixed(0)}` : '',
      `VAT (5%): ${currencySymbol}${taxAmount.toFixed(0)}`,
      `GRAND TOTAL: ${currencySymbol}${grandTotal.toFixed(0)}`,
      `In Words: ${toEnglishWords(grandTotal)}`,
      `Paid (${paymentMethod}): ${currencySymbol}${amountTendered.toFixed(0)}`,
      `Change Due: ${currencySymbol}${changeDue.toFixed(0)}`,
      '--------------------------------',
      footerNotes
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-2 sm:p-4 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div 
        className={`w-full ${layoutMode === 'a4' ? 'max-w-4xl' : 'max-w-md'} rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl my-4 overflow-hidden transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header Bar */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  {lang === 'bn' ? 'ক্যাশ মেমো ও চালান' : 'Tax Invoice & Receipt'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono font-bold">
                  {invoiceNo}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {businessAddress}
              </p>
            </div>
          </div>

          {/* Action & Format Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Format Switcher: A4 vs 80mm */}
            <div className="flex items-center rounded-xl bg-slate-200/80 dark:bg-slate-800 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLayoutMode('a4')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  layoutMode === 'a4'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutTemplate className="h-3.5 w-3.5" />
                <span>{lang === 'bn' ? 'A4 সাইজ চালান' : 'A4 Invoice'}</span>
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('thermal')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  layoutMode === 'thermal'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Receipt className="h-3.5 w-3.5" />
                <span>{lang === 'bn' ? '৮০মিমি স্লিপ' : '80mm POS'}</span>
              </button>
            </div>

            {/* Custom Logo Upload */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shadow-xs cursor-pointer"
                title={lang === 'bn' ? 'কাস্টম লোগো আপলোড করুন' : 'Upload custom logo'}
              >
                <Upload className="h-3.5 w-3.5 text-emerald-500" />
                <span>{currentLogo ? (lang === 'bn' ? 'লোগো পরিবর্তন' : 'Change Logo') : (lang === 'bn' ? 'কাস্টম লোগো' : 'Upload Logo')}</span>
              </button>
              {currentLogo && (
                <button
                  onClick={handleRemoveLogo}
                  className="flex h-7 w-7 items-center justify-center rounded-xl border border-rose-200 dark:border-rose-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                  title="Remove Logo"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-3 sm:p-6 max-h-[78vh] overflow-y-auto bg-slate-100/50 dark:bg-slate-950/40">
          {/* Notification status banner */}
          {printStatus && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 p-3 text-xs text-emerald-900 dark:text-emerald-200 font-bold shadow-sm animate-in fade-in">
              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{printStatus}</span>
            </div>
          )}

          {/* ============================================================== */}
          {/* MODE 1: GORGEOUS A4 CORPORATE TAX INVOICE (#printable-a4-invoice) */}
          {/* ============================================================== */}
          {layoutMode === 'a4' ? (
            <div
              id="printable-a4-invoice"
              className="a4-invoice-container rounded-2xl border border-slate-300 dark:border-slate-700 bg-white text-slate-900 shadow-xl p-6 sm:p-8 space-y-5 transition-all select-text"
              style={{
                fontFamily: "'Plus Jakarta Sans', 'Hind Siliguri', sans-serif",
                color: '#0f172a'
              }}
            >
              {/* Decorative Header Top Strip */}
              <div className="h-2 w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-t-lg -mt-2 mb-2" />

              {/* 1. Header Corporate Letterhead */}
              <div className="flex flex-col sm:flex-row items-start justify-between pb-4 border-b-2 border-slate-800 gap-4">
                {/* Left Brand Details */}
                <div className="flex items-start gap-4">
                  {/* Custom Logo / Emblem */}
                  <div className="shrink-0">
                    {currentLogo ? (
                      <img
                        src={currentLogo}
                        alt="TAMANNA MOTORS Logo"
                        className="h-16 w-auto max-h-16 max-w-[170px] object-contain rounded-xl p-1 border border-slate-200 bg-white shadow-xs"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-md ring-2 ring-emerald-500/20">
                        <div className="text-center">
                          <Wrench className="h-6 w-6 mx-auto stroke-[2.2]" />
                          <span className="text-[9px] font-black tracking-widest uppercase block">TM</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h1 className="text-2xl font-black text-slate-950 tracking-tight leading-none uppercase">
                      {businessName}
                    </h1>
                    <p className="text-xs font-bold text-emerald-700 mt-1 uppercase tracking-wide">
                      {lang === 'bn' ? 'মোটরসাইকেল পার্টস, লুব্রিকেন্টস ও আধুনিক সার্ভিসিং সেন্টার' : 'Motorcycle Genuine Spares, Lubricants & Service Center'}
                    </p>
                    <div className="mt-2 space-y-0.5 text-xs text-slate-600">
                      <p className="flex items-center gap-1.5 font-medium">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{businessAddress}</span>
                      </p>
                      <p className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Phone className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>মোবাইল: {businessPhone}</span>
                      </p>
                      <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{businessEmail} · মূসক/BIN: <strong className="text-slate-800">{taxBin}</strong></span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Invoice Title & Meta */}
                <div className="sm:text-right bg-slate-50 p-3.5 rounded-2xl border border-slate-200 shrink-0 min-w-[210px]">
                  <div className="inline-block px-3 py-1 rounded-lg bg-emerald-800 text-white text-xs font-black uppercase tracking-wider mb-2">
                    {isMoneyReceipt 
                      ? (lang === 'bn' ? 'বকেয়া জমার রসিদ' : 'MONEY RECEIPT')
                      : (lang === 'bn' ? 'ক্যাশ মেমো / ইনভয়েস' : 'TAX INVOICE')}
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between sm:justify-end gap-3">
                      <span className="text-slate-500 font-medium">চালান নং:</span>
                      <span className="font-extrabold text-slate-950 font-mono tracking-wider">{invoiceNo}</span>
                    </div>
                    <div className="flex justify-between sm:justify-end gap-3">
                      <span className="text-slate-500 font-medium">তারিখ:</span>
                      <span className="font-bold text-slate-800">{dateStr}</span>
                    </div>
                    <div className="flex justify-between sm:justify-end gap-3">
                      <span className="text-slate-500 font-medium">শাখা:</span>
                      <span className="font-semibold text-slate-700">{branchLocation}</span>
                    </div>
                    <div className="flex justify-between sm:justify-end gap-3 pt-1 border-t border-slate-200">
                      <span className="text-slate-500 font-medium">স্ট্যাটাস:</span>
                      {(invoiceDue !== undefined ? invoiceDue : Math.max(0, grandTotal - amountTendered)) <= 0 ? (
                        <span className="inline-flex items-center gap-1 font-black text-emerald-700 uppercase">
                          <CheckCircle className="h-3 w-3 text-emerald-600" />
                          <span>পরিশোধিত (PAID)</span>
                        </span>
                      ) : amountTendered > 0 ? (
                        <span className="inline-flex items-center gap-1 font-black text-amber-700 uppercase">
                          <AlertCircle className="h-3 w-3 text-amber-600" />
                          <span>আংশিক বাকি (PARTIAL)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-black text-rose-700 uppercase">
                          <AlertCircle className="h-3 w-3 text-rose-600" />
                          <span>সম্পূর্ণ বাকি (DUE)</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Customer & Bill-To 2-Column Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Bill To Box */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-800 tracking-wider block mb-1">
                    {lang === 'bn' ? 'ক্রেতার বিবরণ (BILL TO)' : 'CUSTOMER / CLIENT DETAILS'}
                  </span>
                  <div className="text-sm font-black text-slate-950">
                    {customerName}
                  </div>
                  {customerPhone && (
                    <p className="text-slate-700 font-mono font-bold mt-0.5">
                      মোবাইল: {customerPhone}
                    </p>
                  )}
                  <p className="text-slate-600 mt-0.5">
                    ঠিকানা: {branchLocation} · হাজীগঞ্জ, চাঁদপুর
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    গ্রাহক আইডি: CUST-{(customerName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4) || 'WALK').toUpperCase()}
                  </p>
                </div>

                {/* Billing Operator Box */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-emerald-800 tracking-wider block mb-1">
                      {lang === 'bn' ? 'অপারেটর ও পেমেন্ট বিবরণ' : 'OPERATOR & PAYMENT SUMMARY'}
                    </span>
                    <div className="flex justify-between text-slate-700">
                      <span>বিলিং অপারেটর:</span>
                      <strong className="text-slate-950">{cashierName}</strong>
                    </div>
                    <div className="flex justify-between text-slate-700 mt-0.5">
                      <span>পেমেন্ট মেথড:</span>
                      <strong className="text-slate-950 uppercase">{paymentMethod}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Main Itemized Goods / Parts Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-300">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-emerald-800 text-white font-bold">
                      <th className="py-2.5 px-3 text-center w-12 border-r border-emerald-700">ক্র.নং</th>
                      <th className="py-2.5 px-3 border-r border-emerald-700">পণ্যের বিবরণ ও স্পেসিফিকেশন (Item Description)</th>
                      <th className="py-2.5 px-3 text-center border-r border-emerald-700">পার্টস কোড / SKU</th>
                      <th className="py-2.5 px-3 text-right border-r border-emerald-700">একক মূল্য ({currencySymbol})</th>
                      <th className="py-2.5 px-3 text-center border-r border-emerald-700">পরিমাণ</th>
                      <th className="py-2.5 px-3 text-right">মোট টাকা ({currencySymbol})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {items.map((cartItem, idx) => {
                      const unitPrice = cartItem.customPrice ?? cartItem.product.sellingPrice;
                      const lineTotal = unitPrice * cartItem.quantity;
                      return (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                          <td className="py-2 px-3 text-center font-bold text-slate-600 border-r border-slate-200">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200">
                            <div className="font-bold text-slate-950 leading-snug">
                              {cartItem.product.name}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">
                              ক্যাটাগরি: {cartItem.product.category}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-center font-mono text-[11px] text-slate-600 border-r border-slate-200">
                            {cartItem.product.sku}
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums font-medium text-slate-800 border-r border-slate-200">
                            {currencySymbol}{unitPrice.toLocaleString('en-US')}
                          </td>
                          <td className="py-2 px-3 text-center font-bold text-slate-900 border-r border-slate-200">
                            {cartItem.quantity}
                          </td>
                          <td className="py-2 px-3 text-right font-black tabular-nums text-slate-950">
                            {currencySymbol}{lineTotal.toLocaleString('en-US')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 4. Financial Calculations & Amount in Words + QR Verification */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pt-1">
                {/* Left Side (Words & QR Verification) - 7 cols */}
                <div className="md:col-span-7 space-y-3">
                  {/* Amount In Words */}
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block">
                      {lang === 'bn' ? 'কথায় (AMOUNT IN WORDS):' : 'IN WORDS:'}
                    </span>
                    <div className="font-bold text-slate-900 text-xs mt-0.5 leading-snug">
                      {toBengaliWords(grandTotal)} ({toEnglishWords(grandTotal)})
                    </div>
                  </div>

                  {/* Real Plain Text QR Code & Security Stamp */}
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white">
                    {qrCodeUrl ? (
                      <div className="p-1 bg-white rounded-lg border border-slate-300 shrink-0">
                        <img
                          src={qrCodeUrl}
                          alt="Invoice QR"
                          className="h-20 w-20 object-contain rounded"
                        />
                      </div>
                    ) : (
                      <div className="h-20 w-20 bg-slate-100 rounded border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400 shrink-0">
                        QR Code
                      </div>
                    )}
                    <div className="space-y-1 text-xs">
                      <div className="inline-flex items-center gap-1 font-bold text-emerald-800 text-[11px]">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        <span>ডিজিটাল চালান সত্যায়িত (QR Verified)</span>
                      </div>
                      <div className="text-[10px] text-slate-600 font-mono leading-tight">
                        Date: {dateStr}<br />
                        Price: {currencySymbol}{grandTotal.toLocaleString('en-US')}<br />
                        Provider: {businessName}
                      </div>
                      <p className="text-[9px] text-slate-500">
                        যেকোনো স্মার্টফোন ক্যামেরা দিয়ে স্ক্যান করলে সরাসরি তারিখ, মূল্য ও শোরুমের ডাটা দেখা যাবে।
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side (Totals Breakdown) - 5 cols */}
                <div className="md:col-span-5 rounded-xl border border-slate-300 bg-slate-50/90 p-3.5 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>সাবটোটাল (Subtotal):</span>
                    <span className="font-semibold tabular-nums text-slate-900">{currencySymbol}{subtotal.toLocaleString('en-US')}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>বিশেষ ছাড় (Discount):</span>
                      <span className="tabular-nums">-{currencySymbol}{discountAmount.toLocaleString('en-US')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>ভ্যাট / মূসক (VAT 5%):</span>
                    <span className="font-semibold tabular-nums text-slate-900">{currencySymbol}{taxAmount.toLocaleString('en-US')}</span>
                  </div>

                  {/* Grand Total Highlight */}
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-emerald-800 text-white font-black text-sm mt-2 shadow-xs">
                    <span>সর্বমোট টাকা:</span>
                    <span className="text-base tabular-nums">{currencySymbol}{grandTotal.toLocaleString('en-US')}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 space-y-1.5 text-[11px] text-slate-700">
                    <div className="flex justify-between">
                      <span>পরিশোধিত টাকা (Paid):</span>
                      <span className="font-bold text-slate-950 tabular-nums">{currencySymbol}{amountTendered.toLocaleString('en-US')}</span>
                    </div>
                    {((invoiceDue !== undefined ? invoiceDue : Math.max(0, grandTotal - amountTendered)) > 0) ? (
                      <div className="flex justify-between font-black text-rose-700 bg-rose-50 dark:bg-rose-950/40 p-1.5 rounded-lg border border-rose-200">
                        <span>অবশিষ্ট বকেয়া (Remaining Due):</span>
                        <span className="tabular-nums font-mono text-xs">{currencySymbol}{(invoiceDue !== undefined ? invoiceDue : (grandTotal - amountTendered)).toLocaleString('en-US')}</span>
                      </div>
                    ) : changeDue > 0 ? (
                      <div className="flex justify-between font-bold text-emerald-800">
                        <span>ফেরত টাকা (Change Due):</span>
                        <span className="tabular-nums">{currencySymbol}{changeDue.toLocaleString('en-US')}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* 4b. Due Payment Ledger History (if any payments recorded) */}
              {duePayments && duePayments.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs space-y-2">
                  <div className="font-extrabold text-slate-900 flex items-center justify-between">
                    <span>বকেয়া পরিশোধ ও জমা বিবরণ (Due Payment Ledger)</span>
                    <span className="text-[10px] text-emerald-700 font-bold font-mono">{duePayments.length} Payments Recorded</span>
                  </div>
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-200/80 text-slate-800 font-bold">
                        <th className="py-1 px-2">তারিখ</th>
                        <th className="py-1 px-2">পেমেন্ট মেথড</th>
                        <th className="py-1 px-2 text-right">জমা টাকা</th>
                        <th className="py-1 px-2 text-right">অবশিষ্ট বকেয়া</th>
                      </tr>
                    </thead>
                    <tbody>
                      {duePayments.map((dp, pIdx) => (
                        <tr key={pIdx} className="border-b border-slate-200 bg-white">
                          <td className="py-1 px-2 font-mono">{dp.paymentDate}</td>
                          <td className="py-1 px-2 uppercase font-medium">{dp.paymentMethod}</td>
                          <td className="py-1 px-2 text-right font-bold text-emerald-700 font-mono">+{currencySymbol}{dp.amountPaid.toLocaleString('en-US')}</td>
                          <td className="py-1 px-2 text-right font-bold text-slate-800 font-mono">{currencySymbol}{dp.remainingDue.toLocaleString('en-US')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 5. Terms & Signatures */}
              <div className="pt-6 border-t border-slate-300 mt-4 space-y-4">
                <div className="text-[10px] text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <strong className="text-slate-900 block mb-0.5">শর্তাবলী ও বিক্রয় নীতি:</strong>
                  {terms}
                </div>

                {/* Signatures */}
                <div className="flex justify-between items-end pt-8 px-4 text-xs font-bold text-slate-700">
                  <div className="text-center">
                    <div className="w-36 border-b border-slate-400 mb-1.5" />
                    <span>ক্রেতার স্বাক্ষর</span>
                    <span className="block text-[10px] text-slate-400 font-normal">Customer's Signature</span>
                  </div>

                  <div className="text-center">
                    <div className="h-10 w-24 mx-auto mb-1 border border-dashed border-emerald-400 rounded flex items-center justify-center text-[9px] text-emerald-700 font-serif italic">
                      TAMANNA MOTORS<br />OFFICIAL SEAL
                    </div>
                    <div className="w-36 border-b border-slate-400 mb-1.5" />
                    <span>অনুমোদিত কর্মকর্তার স্বাক্ষর</span>
                    <span className="block text-[10px] text-slate-400 font-normal">Authorized Seal & Signature</span>
                  </div>
                </div>

                {/* Footer Center Note */}
                <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-slate-200 font-mono">
                  {footerNotes} · {businessName} · {businessPhone}
                </div>
              </div>
            </div>
          ) : (
            /* ============================================================== */
            /* MODE 2: 80MM POS THERMAL CASH RECEIPT (#printable-receipt) */
            /* ============================================================== */
            <div
              id="printable-receipt"
              className="rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 font-mono text-xs text-slate-900 dark:text-slate-100 shadow-sm transition-all max-w-sm mx-auto"
            >
              {/* Top Cut Guide */}
              <div className="text-center text-[9px] text-slate-400 pb-2 border-b border-dashed border-slate-300 dark:border-slate-700 font-sans flex items-center justify-between">
                <span>✂ - - - - - - - - - -</span>
                <span className="font-bold tracking-wider uppercase text-[8px]">{lang === 'bn' ? 'ক্যাশ মেমো' : 'POS RECEIPT'}</span>
                <span>- - - - - - - - - - ✂</span>
              </div>

              {/* Header */}
              <div className="text-center pt-3 pb-3 border-b border-dashed border-slate-300 dark:border-slate-700 space-y-1">
                {currentLogo ? (
                  <img
                    src={currentLogo}
                    alt="Logo"
                    className="h-12 w-auto max-h-12 max-w-[140px] object-contain mx-auto mb-1 rounded"
                  />
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 mb-1">
                    <Wrench className="h-4 w-4" />
                    <span className="font-black text-xs">TAMANNA MOTORS</span>
                  </div>
                )}
                <h4 className="text-sm font-black tracking-tight text-slate-950 dark:text-white uppercase font-sans">
                  {businessName}
                </h4>
                <p className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold font-sans">
                  {lang === 'bn' ? 'মোটর পার্টস ও সার্ভিসিং সেন্টার' : 'Motorcycle Spares & Workshop'}
                </p>
                <p className="text-[9.5px] text-slate-600 dark:text-slate-300 leading-tight">
                  {businessAddress}
                </p>
                <p className="text-[9.5px] text-slate-600 dark:text-slate-300 font-medium">
                  মোবাইল: {businessPhone}
                </p>
                <p className="text-[9px] text-slate-500">
                  মূসক/BIN: {taxBin}
                </p>
              </div>

              {/* Metadata */}
              <div className="py-2 border-b border-dashed border-slate-300 dark:border-slate-700 text-[11px] space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">চালান / মেমো:</span>
                  <strong className="text-slate-950 dark:text-white">{invoiceNo}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">তারিখ ও সময়:</span>
                  <span>{dateStr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">অপারেটর:</span>
                  <span>{cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">গ্রাহক:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{customerName}</span>
                </div>
              </div>

              {/* Items */}
              <div className="py-2 border-b border-dashed border-slate-300 dark:border-slate-700 space-y-1">
                <div className="flex justify-between font-bold text-[10px] uppercase text-slate-500 pb-1 border-b border-dashed border-slate-200">
                  <span className="w-1/2">আইটেম বিবরণ</span>
                  <span className="text-center w-1/4">পরিমাণ</span>
                  <span className="text-right w-1/4">মোট (৳)</span>
                </div>
                {items.map((cartItem, idx) => {
                  const price = cartItem.customPrice ?? cartItem.product.sellingPrice;
                  const lineTotal = price * cartItem.quantity;
                  return (
                    <div key={idx} className="flex justify-between items-start text-[11px]">
                      <div className="w-1/2 pr-1">
                        <div className="font-bold text-slate-950 dark:text-white leading-tight">
                          {cartItem.product.name}
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono">
                          {cartItem.product.sku}
                        </div>
                      </div>
                      <div className="w-1/4 text-center tabular-nums text-slate-600 dark:text-slate-400">
                        {cartItem.quantity} x {price.toFixed(0)}
                      </div>
                      <div className="w-1/4 font-black text-right tabular-nums text-slate-950 dark:text-white">
                        {lineTotal.toFixed(0)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="py-2 border-b border-dashed border-slate-300 dark:border-slate-700 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>সাবটোটাল (Subtotal):</span>
                  <span className="font-semibold tabular-nums">{currencySymbol}{subtotal.toFixed(0)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                    <span>ডিসকাউন্ট:</span>
                    <span className="tabular-nums">-{currencySymbol}{discountAmount.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>ভ্যাট (VAT 5%):</span>
                  <span className="tabular-nums">{currencySymbol}{taxAmount.toFixed(0)}</span>
                </div>

                <div className="flex justify-between items-center text-sm font-black pt-1.5 border-t border-slate-300 dark:border-slate-700 text-slate-950 dark:text-white bg-slate-100 dark:bg-slate-800 p-2 rounded-lg mt-1">
                  <span>সর্বমোট টাকা:</span>
                  <span className="tabular-nums text-emerald-700 dark:text-emerald-400">
                    {currencySymbol}{grandTotal.toFixed(0)}
                  </span>
                </div>
              </div>

              {/* Payment details */}
              <div className="pt-2 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span>পদ্ধতি:</span>
                  <strong className="uppercase">{paymentMethod}</strong>
                </div>
                <div className="flex justify-between">
                  <span>পরিশোধ:</span>
                  <span className="font-bold tabular-nums">{currencySymbol}{amountTendered.toFixed(0)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>ফেরত:</span>
                  <span className="tabular-nums text-emerald-700 dark:text-emerald-400">{currencySymbol}{changeDue.toFixed(0)}</span>
                </div>
              </div>

              {/* QR Code */}
              {qrCodeUrl && (
                <div className="py-3 my-2 border-t border-dashed border-slate-300 dark:border-slate-700 text-center">
                  <div className="p-1 bg-white rounded-lg border border-slate-300 inline-block shadow-xs">
                    <img src={qrCodeUrl} alt="QR" className="h-24 w-24 object-contain rounded" />
                  </div>
                  <div className="text-[9px] font-bold text-slate-600 dark:text-slate-400 mt-1">
                    📅 {dateStr} · 💰 {currencySymbol}{grandTotal.toFixed(0)}
                  </div>
                </div>
              )}

              {/* Signatures */}
              <div className="pt-4 pb-2 flex justify-between text-[9px] text-slate-500 font-sans border-t border-dashed border-slate-300">
                <div className="text-center">
                  <div className="w-20 border-b border-slate-400 mb-1" />
                  <span>ক্রেতার স্বাক্ষর</span>
                </div>
                <div className="text-center">
                  <div className="w-20 border-b border-slate-400 mb-1" />
                  <span>কর্তৃপক্ষের স্বাক্ষর</span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-2 text-[9px] text-slate-500 space-y-0.5 font-sans border-t border-dashed border-slate-300">
                <p className="font-bold text-slate-800 dark:text-slate-200">{footerNotes}</p>
                <p className="text-[8px]">{terms}</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer Toolbar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
            >
              <ImageIcon className="h-3.5 w-3.5 text-emerald-500" />
              <span>{lang === 'bn' ? 'লোগো বদলান' : 'Change Logo'}</span>
            </button>

            <button
              onClick={handleCopyReceipt}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : (lang === 'bn' ? 'কপি টেক্সট' : 'Copy Text')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSlip}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>{lang === 'bn' ? 'ডকুমেন্ট ডাউনলোড' : 'Download Document'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:brightness-105 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>{lang === 'bn' ? (layoutMode === 'a4' ? 'A4 চালান প্রিন্ট করুন' : 'রসিদ প্রিন্ট করুন') : (layoutMode === 'a4' ? 'Print A4 Invoice' : 'Print Receipt')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
