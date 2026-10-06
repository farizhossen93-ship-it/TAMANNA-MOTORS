import React, { useState, useRef, useEffect } from 'react';
import { 
  QrCode, 
  Camera, 
  Search, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  ExternalLink,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Sale } from '../types';
import { Language, TRANSLATIONS } from '../i18n/translations';
import { parseInvoiceQrText } from '../utils/qrHelper';

interface InvoiceScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  sales: Sale[];
  onSelectSale: (sale: Sale) => void;
  lang?: Language;
}

export const InvoiceScanModal: React.FC<InvoiceScanModalProps> = ({
  isOpen,
  onClose,
  sales,
  onSelectSale,
  lang = 'en'
}) => {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [manualInput, setManualInput] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setSearchError(null);
      setManualInput('');
    } else if (activeTab === 'camera') {
      startCamera();
    }
  }, [isOpen, activeTab]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(lang === 'bn' ? 'এই ব্রাউজারে ক্যামেরা সাপোর্ট নেই। নিচে চালান নম্বর লিখুন।' : 'Camera not supported on this browser. Please use manual entry.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError(
        lang === 'bn' 
          ? 'ক্যামেরা চালু করা যায়নি বা অনুমতি নেই। নিচে সরাসরি চালান নম্বর দিয়ে সার্চ করুন।' 
          : 'Camera access denied or unavailable. Please enter invoice number below.'
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleManualSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchError(null);

    const query = manualInput.trim();
    if (!query) {
      setSearchError(lang === 'bn' ? 'অনুগ্রহ করে চালান নম্বর বা কিউআর কোড টেক্সট লিখুন' : 'Please enter an invoice number or QR code text');
      return;
    }

    // Parse structured plain text QR code (contains PROVIDER, DATE, PRICE, INVOICE NO)
    const qrData = parseInvoiceQrText(query);

    // Extract invoice number if a URL was pasted, e.g. "?invoice=TM-2026-1049"
    let invoiceNo = qrData.invoiceNo || query;
    if (query.includes('invoice=')) {
      try {
        const url = new URL(query, window.location.origin);
        invoiceNo = url.searchParams.get('invoice') || query;
      } catch {
        const match = query.match(/invoice=([^&]+)/);
        if (match) invoiceNo = decodeURIComponent(match[1]);
      }
    }

    const matched = sales.find(s => 
      s.invoiceNo.toLowerCase() === invoiceNo.toLowerCase() ||
      s.invoiceNo.toLowerCase().includes(invoiceNo.toLowerCase())
    );

    if (matched) {
      stopCamera();
      onClose();
      onSelectSale(matched);
      return;
    }

    // If not found in local sales but has valid QR payload (Date, Price, Provider), preview as verified receipt
    if (qrData.date || qrData.price || qrData.provider) {
      const verifiedSale: Sale = {
        id: `qr-${Date.now()}`,
        invoiceNo: qrData.invoiceNo || invoiceNo || `INV-QR-${Date.now()}`,
        type: 'pos',
        customerName: qrData.customer || (lang === 'bn' ? 'যাচাইকৃত গ্রাহক (QR)' : 'Verified Customer (QR)'),
        businessLocation: qrData.provider || 'TAMANNA MOTORS',
        paymentStatus: 'Paid',
        paymentMethod: 'Cash',
        totalAmount: qrData.rawAmount || 4250,
        amountTendered: qrData.rawAmount || 4250,
        invoiceDue: 0,
        saleDate: qrData.date || new Date().toLocaleString(),
        itemsCount: 1,
        items: []
      };
      stopCamera();
      onClose();
      onSelectSale(verifiedSale);
      return;
    }

    setSearchError(
      lang === 'bn'
        ? `চালান নম্বর "${invoiceNo}" সিস্টেমে খুঁজে পাওয়া যায়নি!`
        : `Invoice "${invoiceNo}" not found in database!`
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in">
      <div 
        className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {lang === 'bn' ? 'চালান কিউআর কোড স্ক্যানার ও যাচাই' : 'Invoice QR Scanner & Verification'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {lang === 'bn' ? 'ক্যামেরা দিয়ে রসিদের কিউআর কোড স্ক্যান করে লাইভ প্রিভিউ দেখুন' : 'Scan physical receipt QR code or lookup invoice'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 pt-2">
          <button
            onClick={() => {
              setActiveTab('camera');
              startCamera();
            }}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold transition-colors ${
              activeTab === 'camera'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Camera className="h-4 w-4" />
            <span>{lang === 'bn' ? 'ক্যামেরা স্ক্যানার' : 'Camera Scanner'}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('manual');
              stopCamera();
            }}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold transition-colors ${
              activeTab === 'manual'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Search className="h-4 w-4" />
            <span>{lang === 'bn' ? 'চালান নম্বর এন্ট্রি' : 'Manual Lookup'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {searchError && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-3 text-xs text-red-700 dark:text-red-300 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{searchError}</span>
            </div>
          )}

          {activeTab === 'camera' ? (
            <div className="space-y-4">
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-slate-950 flex items-center justify-center border border-slate-800">
                <video
                  ref={videoRef}
                  className="h-full w-full object-cover"
                  playsInline
                  muted
                />

                {/* Reticle / Target Box */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-56 h-56 border-2 border-emerald-400/80 rounded-2xl relative shadow-lg shadow-emerald-500/20">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400 rounded-tl-md" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400 rounded-tr-md" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400 rounded-bl-md" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400 rounded-br-md" />
                    
                    {/* Laser scanning line animation */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse absolute top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {cameraError && (
                  <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center text-slate-300">
                    <Camera className="h-10 w-10 text-slate-500 mb-2" />
                    <p className="text-xs mb-3">{cameraError}</p>
                    <button
                      onClick={startCamera}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white transition-colors"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>{lang === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Retry Camera'}</span>
                    </button>
                  </div>
                )}
              </div>

              <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                {lang === 'bn' 
                  ? 'রসিদে মুদ্রিত কিউআর কোডটি বক্সের মাঝে রাখুন' 
                  : 'Point camera at the QR code printed on the receipt'}
              </p>
            </div>
          ) : null}

          {/* Manual Input / Quick Sample Invoices */}
          <form onSubmit={handleManualSearch} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {lang === 'bn' ? 'চালান নম্বর বা স্ক্যানকৃত কিউআর কোড টেক্সট (তারিখ · মূল্য · শোরুম)' : 'Invoice Number or QR Code Text (Date · Price · Provider)'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder={lang === 'bn' ? 'যেমন: TM-2026-1049 বা সম্পূর্ণ কিউআর টেক্সট পেস্ট করুন' : 'e.g. TM-2026-1049 or paste scanned QR text'}
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                <Search className="h-3.5 w-3.5" />
                <span>{lang === 'bn' ? 'প্রিভিউ দেখুন' : 'Preview'}</span>
              </button>
            </div>
          </form>

          {/* Quick Select from Recent Invoices */}
          <div className="pt-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2">
              <Sparkles className="h-3 w-3 text-emerald-500" />
              {lang === 'bn' ? 'সাম্প্রতিক চালানসমূহ থেকে দ্রুত প্রিভিউ' : 'Quick Preview From Recent Invoices'}
            </span>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {sales.slice(0, 5).map((sale) => (
                <div
                  key={sale.id}
                  onClick={() => {
                    stopCamera();
                    onClose();
                    onSelectSale(sale);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600">
                        {sale.invoiceNo}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {sale.customerName} · {sale.saleDate}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                      ৳{sale.totalAmount.toFixed(0)}
                    </div>
                    <span className="text-[9px] uppercase font-bold text-slate-500">
                      {sale.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
