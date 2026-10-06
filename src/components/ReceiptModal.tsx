import React, { useState, useEffect } from 'react';
import { X, Printer, CheckCircle, Wrench, ShieldCheck, Copy, Check, Download, AlertCircle, FileText, QrCode } from 'lucide-react';
import { CartItem, BusinessSettings, InvoiceSettings } from '../types';
import { Language, TRANSLATIONS } from '../i18n/translations';
import { printHtmlContent, downloadPrintDocument, fallbackDirectPrint } from '../utils/printHelper';
import { generateInvoiceQrCode } from '../utils/qrHelper';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceNo: string;
  customerName: string;
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  amountTendered: number;
  changeDue: number;
  paymentMethod: string;
  dateStr: string;
  businessSettings?: BusinessSettings;
  invoiceSettings?: InvoiceSettings;
  branchLocation?: string;
  cashierName?: string;
  lang?: Language;
  autoTriggerPrint?: boolean;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  invoiceNo,
  customerName,
  items,
  subtotal,
  taxAmount,
  discountAmount,
  grandTotal,
  amountTendered,
  changeDue,
  paymentMethod,
  dateStr,
  businessSettings,
  invoiceSettings,
  branchLocation = "Dhaka Central Showroom",
  cashierName = "Md. Fariz (Reg-01)",
  lang = 'en',
  autoTriggerPrint = false
}) => {
  const t = TRANSLATIONS[lang];
  const currencySymbol = businessSettings?.currencySymbol || "৳";
  const [copied, setCopied] = useState(false);
  const [printStatus, setPrintStatus] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    if (invoiceNo) {
      const bName = businessSettings?.businessName || "TAMANNA MOTORS";
      const bPhone = businessSettings?.contactPhone || "+880 1711-234567";
      const bAddr = businessSettings?.address || "House 42, Road 11, Block D, Mirpur-10, Dhaka";
      generateInvoiceQrCode(invoiceNo, grandTotal, dateStr, bName, {
        providerPhone: bPhone,
        providerAddress: bAddr,
        customerName,
        paymentMethod,
        currencySymbol,
        itemsCount: items.length,
        branch: branchLocation
      })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error("QR Error:", err));
    }
  }, [invoiceNo, grandTotal, dateStr, businessSettings, customerName, paymentMethod, branchLocation, items, currencySymbol]);

  const activeLogo = businessSettings?.logoUrl || invoiceSettings?.logoUrl;

  const handlePrint = () => {
    const el = document.getElementById('printable-receipt');
    if (el) {
      fallbackDirectPrint(el.innerHTML, `TAMANNA MOTORS - ${invoiceNo}`);
      printHtmlContent(el.innerHTML, `TAMANNA MOTORS - ${invoiceNo}`);
      setPrintStatus(
        lang === 'bn'
          ? 'প্রিন্টার কমান্ড পাঠানো হয়েছে। ব্রাউজারে পপআপ না আসলে নিচের "প্রিন্ট ফাইল ডাউনলোড" চাপুন।'
          : 'Print sent. If popup is blocked by browser, click "Download Print File" below.'
      );
      setTimeout(() => setPrintStatus(null), 6000);
    } else {
      window.print();
    }
  };

  const handleDownloadSlip = () => {
    const el = document.getElementById('printable-receipt');
    if (el) {
      downloadPrintDocument(el.innerHTML, `TAMANNA_MOTORS_RECEIPT_${invoiceNo}`);
      setPrintStatus(
        lang === 'bn'
          ? 'রসিদ ফাইল ডাউনলোড হয়েছে! ওপেন করলেই সাথে সাথে প্রিন্ট ডায়ালগ চালু হবে।'
          : 'Print file downloaded! Open file to print instantly.'
      );
      setTimeout(() => setPrintStatus(null), 5000);
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
      ...items.map(it => `${it.product.name} x ${it.quantity} = ${currencySymbol}${((it.customPrice ?? it.product.sellingPrice) * it.quantity).toFixed(0)}`),
      '--------------------------------',
      `Subtotal: ${currencySymbol}${subtotal.toFixed(0)}`,
      discountAmount > 0 ? `Discount: -${currencySymbol}${discountAmount.toFixed(0)}` : '',
      `VAT / Tax (5%): ${currencySymbol}${taxAmount.toFixed(0)}`,
      `TOTAL DUE: ${currencySymbol}${grandTotal.toFixed(0)}`,
      `Paid (${paymentMethod}): ${currencySymbol}${amountTendered.toFixed(0)}`,
      `Change Return: ${currencySymbol}${changeDue.toFixed(0)}`,
      '--------------------------------',
      footerNotes
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Business settings fallbacks
  const businessName = businessSettings?.businessName || "TAMANNA MOTORS";
  const businessAddress = businessSettings?.address || "House 42, Road 11, Block D, Mirpur-10, Dhaka";
  const businessPhone = businessSettings?.contactPhone || "+880 1711-234567";
  const taxBin = businessSettings?.taxNumber || "BIN-002849102-0101";
  const showLogo = invoiceSettings?.showLogo ?? true;
  const footerNotes = invoiceSettings?.footerNotes || t.pos.receiptFooter;
  const terms = invoiceSettings?.termsAndConditions || (
    lang === 'bn' 
      ? "১. বিক্রিত পার্টস অক্ষত অবস্থায় মেমোসহ ১৪ দিনের মধ্যে পরিবর্তনযোগ্য। ২. ইলেকট্রিক্যাল মালামালের কোনো ওয়ারেন্টি নেই।"
      : "1. Purchased parts can be exchanged within 14 days with original receipt in undamaged condition. 2. Electrical items subject to manufacturer terms."
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div 
        className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xl my-6 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs font-extrabold uppercase tracking-wider">
              {lang === 'bn' ? 'ক্যাশ রসিদ ও চালান' : 'Point of Sale Receipt'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ============================================================== */}
        {/* Printable Thermal Receipt (Target element for #printable-receipt) */}
        {/* ============================================================== */}
        <div
          id="printable-receipt"
          className="my-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-4 font-mono text-xs text-slate-800 dark:text-slate-200 shadow-xs"
        >
          {/* Business Header from Settings */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300 dark:border-slate-700 space-y-1">
            {showLogo && (
              <div className="flex justify-center items-center mb-1.5">
                {activeLogo ? (
                  <img
                    src={activeLogo}
                    alt="Tamanna Motors Logo"
                    className="h-12 w-auto max-h-12 max-w-[130px] object-contain mx-auto rounded"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                    <Wrench className="h-4 w-4 text-emerald-600" />
                    <span className="font-extrabold text-sm tracking-tighter">TM</span>
                  </div>
                )}
              </div>
            )}
            <h4 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white uppercase leading-tight">
              {businessName}
            </h4>
            <p className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">
              {lang === 'bn' ? 'মোটরসাইকেল পার্টস ও ওয়ার্কশপ' : 'Motorcycle Spare Parts & Workshop'}
            </p>
            <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-tight">
              {businessAddress}
            </p>
            <p className="text-[10px] text-slate-600 dark:text-slate-300">
              Tel: {businessPhone} · BIN: {taxBin}
            </p>
            <p className="text-[10px] text-emerald-800 dark:text-emerald-400 font-semibold">
              Branch: {branchLocation}
            </p>
          </div>

          {/* Invoice Meta */}
          <div className="py-2.5 border-b border-dashed border-slate-300 dark:border-slate-700 text-[11px] space-y-0.5">
            <div className="flex justify-between">
              <span>Invoice:</span>
              <span className="font-bold text-slate-900 dark:text-white">{invoiceNo}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{dateStr}</span>
            </div>
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span className="font-semibold">{customerName}</span>
            </div>
          </div>

          {/* Line Items */}
          <div className="py-2.5 border-b border-dashed border-slate-300 dark:border-slate-700 space-y-1.5">
            <div className="flex justify-between font-bold text-[10px] uppercase text-slate-600 dark:text-slate-300 border-b border-dashed border-slate-200 dark:border-slate-700 pb-1">
              <span className="w-1/2">Item Description</span>
              <span className="text-center w-1/4">Qty x Price</span>
              <span className="text-right w-1/4">Total</span>
            </div>
            {items.map((cartItem, idx) => {
              const price = cartItem.customPrice ?? cartItem.product.sellingPrice;
              const lineTotal = price * cartItem.quantity;
              return (
                <div key={idx} className="flex justify-between text-[11px] items-start">
                  <div className="w-1/2 truncate font-medium pr-1">
                    {cartItem.product.name}
                  </div>
                  <div className="w-1/4 text-center text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {cartItem.quantity} x {currencySymbol}{price.toFixed(0)}
                  </div>
                  <div className="w-1/4 font-bold text-right tabular-nums">
                    {currencySymbol}{lineTotal.toFixed(0)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Financial Totals */}
          <div className="py-2.5 border-b border-dashed border-slate-300 dark:border-slate-700 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="tabular-nums font-semibold">{currencySymbol}{subtotal.toFixed(0)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-800 dark:text-emerald-400 font-medium">
                <span>Discount:</span>
                <span className="tabular-nums">-{currencySymbol}{discountAmount.toFixed(0)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>VAT / Tax (5%):</span>
              <span className="tabular-nums">{currencySymbol}{taxAmount.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold pt-1.5 border-t border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
              <span>TOTAL DUE:</span>
              <span className="tabular-nums text-emerald-800 dark:text-emerald-400">
                {currencySymbol}{grandTotal.toFixed(0)}
              </span>
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="pt-2 text-[11px] space-y-0.5">
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <span className="font-bold">{paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount Paid:</span>
              <span className="tabular-nums font-bold">{currencySymbol}{amountTendered.toFixed(0)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Change Return:</span>
              <span className="tabular-nums text-emerald-800 dark:text-emerald-400">
                {currencySymbol}{changeDue.toFixed(0)}
              </span>
            </div>
          </div>

          {/* Dynamic Real Invoice QR Code for Customer Verification (Values: Date, Price, Provider) */}
          <div className="py-2.5 my-2 border-t border-dashed border-slate-300 dark:border-slate-700 text-center">
            {qrCodeUrl ? (
              <div className="flex flex-col items-center justify-center">
                <img
                  src={qrCodeUrl}
                  alt={`QR Code for ${invoiceNo}`}
                  className="h-24 w-24 object-contain rounded-md border border-slate-300 dark:border-slate-600 p-1 bg-white mx-auto shadow-xs"
                />
                <div className="mt-2 space-y-1">
                  <p className="text-[9.5px] font-bold text-slate-800 dark:text-slate-200">
                    {lang === 'bn' ? 'চালান ডাটা কিউআর কোড (Date · Price · Provider)' : 'Invoice Real Data QR Code (Date · Price · Provider)'}
                  </p>
                  <div className="inline-flex flex-wrap items-center justify-center gap-1.5 text-[8.5px] font-mono font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    <span>📅 {dateStr}</span>
                    <span>·</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">৳ {grandTotal.toFixed(0)}</span>
                    <span>·</span>
                    <span>🏢 {businessSettings?.businessName || "TAMANNA MOTORS"}</span>
                  </div>
                  <p className="text-[8px] text-slate-500 font-medium">
                    {lang === 'bn' ? 'ক্যামেরা স্ক্যান করলে সরাসরি তারিখ, মূল্য ও শোরুমের তথ্য দেখা যাবে' : 'Direct camera scan shows Date, Price & Provider values'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-20 w-20 mx-auto border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                Generating QR...
              </div>
            )}
          </div>

          {/* Terms & Footer Note from Settings */}
          <div className="text-center pt-3 mt-3 text-[10px] text-slate-600 dark:text-slate-300 border-t border-dashed border-slate-300 dark:border-slate-700 space-y-1">
            <p className="font-medium">{footerNotes}</p>
            <p className="text-[9px] text-slate-600 dark:text-slate-300 leading-tight">
              {terms}
            </p>
            <div className="font-mono pt-1 text-[9px] text-slate-400">
              * * * {invoiceNo} * * *
            </div>
          </div>
        </div>

        {/* Status notification */}
        {printStatus && (
          <div className="mb-3 flex items-start gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-2.5 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium animate-in fade-in">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{printStatus}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs font-extrabold text-white shadow-md transition-colors"
              title="Send to physical printer"
            >
              <Printer className="h-4 w-4" />
              <span>{lang === 'bn' ? 'রসিদ প্রিন্ট করুন' : 'Print Receipt'}</span>
            </button>

            <button
              onClick={handleDownloadSlip}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700/80 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-3.5 py-2.5 text-xs font-bold transition-colors"
              title="Download standalone auto-print HTML/PDF file"
            >
              <Download className="h-4 w-4" />
              <span>{lang === 'bn' ? 'প্রিন্ট ফাইল ডাউনলোড' : 'Download Print Slip'}</span>
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopyReceipt}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Copy receipt text to clipboard"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : (lang === 'bn' ? 'রসিদ টেক্সট কপি' : 'Copy Text')}</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
