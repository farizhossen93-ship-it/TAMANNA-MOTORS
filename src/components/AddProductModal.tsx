import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Package,
  DollarSign,
  MapPin,
  Hash,
  Camera,
  CameraOff,
  Barcode,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Cloud
} from 'lucide-react';
import { Product } from '../types';
import { TAMANNA_BARCODE_CATALOG, BarcodeProductPreset } from '../data/barcodeCatalog';
import { Language, TRANSLATIONS } from '../i18n/translations';
import { uploadToSupabaseStorage } from '../lib/supabaseStorage';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Product) => void;
  initialProduct?: Product | null;
  lang?: Language;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
  initialProduct,
  lang = 'en'
}) => {
  const t = TRANSLATIONS[lang];

  // Product form state
  const [name, setName] = useState(initialProduct?.name || '');
  const [sku, setSku] = useState(initialProduct?.sku || '');
  const [category, setCategory] = useState(initialProduct?.category || 'Engine Oil & Lubricants');
  const [location, setLocation] = useState(initialProduct?.businessLocation || 'Hazigonj Branch');
  const [purchasePrice, setPurchasePrice] = useState(initialProduct?.unitPurchasePrice.toString() || '');
  const [sellingPrice, setSellingPrice] = useState(initialProduct?.sellingPrice.toString() || '');
  const [stock, setStock] = useState(initialProduct?.currentStock.toString() || '15');
  const [alertQty, setAlertQty] = useState(initialProduct?.alertQuantity.toString() || '5');
  const [imageUrl, setImageUrl] = useState(initialProduct?.imageUrl || '');

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  // Barcode Scanner & Camera state
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detectedBarcode, setDetectedBarcode] = useState<string | null>(null);
  const [autoFillSuccess, setAutoFillSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Sync initialProduct if provided
  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name);
      setSku(initialProduct.sku);
      setCategory(initialProduct.category);
      setLocation(initialProduct.businessLocation);
      setPurchasePrice(initialProduct.unitPurchasePrice.toString());
      setSellingPrice(initialProduct.sellingPrice.toString());
      setStock(initialProduct.currentStock.toString());
      setAlertQty(initialProduct.alertQuantity.toString());
      setImageUrl(initialProduct.imageUrl || '');
    } else {
      setName('');
      setSku('');
      setPurchasePrice('');
      setSellingPrice('');
      setStock('15');
      setAlertQty('5');
      setImageUrl('');
      setBarcodeInput('');
      setDetectedBarcode(null);
      setAutoFillSuccess(false);
    }
  }, [initialProduct, isOpen]);

  // Clean up camera on unmount or modal close
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    setDetectedBarcode(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported in this browser environment.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraActive(true);
      startBarcodeDetectionLoop();
    } catch (err: any) {
      console.warn("Camera access failed:", err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? "Camera permission was denied. Please allow camera permissions in browser settings."
          : "Unable to access camera device. You can still use the barcode input or catalog presets below."
      );
      setIsCameraActive(false);
    }
  };

  const startBarcodeDetectionLoop = () => {
    const checkBarcode = async () => {
      if (!videoRef.current || !streamRef.current || !isCameraActive) return;

      try {
        if ('BarcodeDetector' in window) {
          const BarcodeDetectorClass = (window as any).BarcodeDetector;
          const barcodeDetector = new BarcodeDetectorClass({
            formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'qr_code', 'upc_a']
          });

          const barcodes = await barcodeDetector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const rawVal = barcodes[0].rawValue;
            handleBarcodeScanned(rawVal);
            return;
          }
        }
      } catch {
        // Fallback gracefully
      }

      animationFrameRef.current = requestAnimationFrame(checkBarcode);
    };

    animationFrameRef.current = requestAnimationFrame(checkBarcode);
  };

  const handleBarcodeScanned = (scannedCode: string) => {
    setBarcodeInput(scannedCode);
    setDetectedBarcode(scannedCode);
    stopCamera();

    const matched = TAMANNA_BARCODE_CATALOG.find(
      p => p.barcode === scannedCode || p.sku.toLowerCase() === scannedCode.toLowerCase()
    );

    if (matched) {
      setName(lang === 'bn' ? matched.nameBn : matched.nameEn);
      setSku(matched.sku);
      setCategory(matched.category);
      setPurchasePrice(matched.unitPurchasePrice.toString());
      setSellingPrice(matched.sellingPrice.toString());
      setStock(matched.initialStock.toString());
      setAlertQty(matched.alertQuantity.toString());
      setImageUrl(matched.imageUrl);
      setAutoFillSuccess(true);
      setTimeout(() => setAutoFillSuccess(false), 4000);
    } else {
      setSku(`SKU-${scannedCode.slice(-6)}`);
      setName(`Auto-Scanned Part (${scannedCode})`);
      setAutoFillSuccess(true);
      setTimeout(() => setAutoFillSuccess(false), 4000);
    }
  };

  const handleApplyPreset = (preset: BarcodeProductPreset) => {
    handleBarcodeScanned(preset.barcode);
  };

  // Image Upload handler for Supabase Storage
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadMessage(lang === 'bn' ? 'Supabase Storage-এ আপলোড হচ্ছে...' : 'Uploading to Supabase Storage...');

    try {
      const customPrefix = sku.trim() ? `prod_${sku.trim().toLowerCase()}` : `prod_${Date.now()}`;
      const result = await uploadToSupabaseStorage(file, 'products', customPrefix);
      if (result.url) {
        setImageUrl(result.url);
        setUploadMessage(
          lang === 'bn' 
            ? 'Supabase Storage-এ সফলভাবে আপলোড সম্পন্ন হয়েছে!' 
            : 'Uploaded successfully to Supabase Storage!'
        );
        setTimeout(() => setUploadMessage(null), 3000);
      } else {
        setUploadMessage(lang === 'bn' ? 'আপলোড ব্যর্থ হয়েছে' : 'Upload failed');
      }
    } catch (err: any) {
      console.error(err);
      setUploadMessage(err?.message || 'Error uploading file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Capture snapshot from active camera and upload to Supabase Storage
  const handleCaptureSnapshot = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      setIsUploading(true);
      setUploadMessage(lang === 'bn' ? 'ক্যামেরা ছবি Supabase Storage-এ সেভ হচ্ছে...' : 'Saving snapshot to Supabase Storage...');
      const result = await uploadToSupabaseStorage(blob, 'products', `snap_${Date.now()}`);
      if (result.url) {
        setImageUrl(result.url);
        stopCamera();
        setUploadMessage(lang === 'bn' ? 'ছবি সফলভাবে সংযুক্ত হয়েছে!' : 'Snapshot saved to Supabase!');
        setTimeout(() => setUploadMessage(null), 3000);
      }
      setIsUploading(false);
    }, 'image/jpeg', 0.85);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) {
      alert(lang === 'bn' ? 'দয়া করে পণ্যের নাম ও এসকেইউ পূরণ করুন।' : 'Please fill in Product Name and SKU.');
      return;
    }

    const newProd: Product = {
      id: initialProduct?.id || `tm-prod-${Date.now()}`,
      name: name.trim(),
      sku: sku.trim(),
      category,
      businessLocation: location,
      unitPurchasePrice: parseFloat(purchasePrice) || 0,
      sellingPrice: parseFloat(sellingPrice) || 0,
      currentStock: parseInt(stock, 10) || 0,
      alertQuantity: parseInt(alertQty, 10) || 5,
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=120&h=120&q=80",
      createdAt: initialProduct?.createdAt || new Date().toISOString().slice(0, 10)
    };

    onAddProduct(newProd);
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div 
        className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl my-8 transition-colors max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Package className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {initialProduct ? t.productModal.titleEdit : t.productModal.titleAdd}
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                TAMANNA MOTORS · {lang === 'bn' ? 'মোটর পার্টস ইনভেন্টরি ও Supabase ক্লাউড স্টোরেজ' : 'Spare Parts Inventory & Supabase Storage'}
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

        {/* 1. Barcode Scanner & Camera section */}
        <div className="mt-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Barcode className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {t.productModal.barcodeScanner}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isCameraActive && (
                <button
                  type="button"
                  onClick={handleCaptureSnapshot}
                  className="flex items-center gap-1 rounded-lg bg-blue-600 text-white px-2.5 py-1.5 text-xs font-semibold hover:bg-blue-700 shadow-xs"
                >
                  <Camera className="h-3 w-3" />
                  <span>{lang === 'bn' ? 'ছবি তুলুন' : 'Snapshot'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={isCameraActive ? stopCamera : startCamera}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-xs transition-colors ${
                  isCameraActive
                    ? 'bg-rose-600 text-white hover:bg-rose-700'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {isCameraActive ? (
                  <>
                    <CameraOff className="h-3.5 w-3.5" />
                    <span>{t.productModal.stopCamera}</span>
                  </>
                ) : (
                  <>
                    <Camera className="h-3.5 w-3.5" />
                    <span>{t.productModal.scanWithCamera}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Live Camera Viewport */}
          {isCameraActive && (
            <div className="relative rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center border-2 border-emerald-500 shadow-inner">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative w-48 h-24 border-2 border-emerald-400/80 rounded-md">
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emerald-300" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-emerald-300" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-emerald-300" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-300" />
                  <div className="w-full h-0.5 bg-rose-500/90 shadow-[0_0_8px_#f43f5e] animate-pulse my-10" />
                </div>
              </div>
            </div>
          )}

          {cameraError && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-2.5 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-semibold">{cameraError}</p>
              </div>
            </div>
          )}

          {/* Barcode input field */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (barcodeInput.trim()) handleBarcodeScanned(barcodeInput.trim());
                  }
                }}
                placeholder={t.productModal.barcodePlaceholder}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => barcodeInput.trim() && handleBarcodeScanned(barcodeInput.trim())}
              disabled={!barcodeInput.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>{lang === 'bn' ? 'অটো-ফিল' : 'Auto-Fill'}</span>
            </button>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
              <span className="font-semibold">{t.productModal.quickPresets}:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
              {TAMANNA_BARCODE_CATALOG.slice(0, 6).map((preset) => (
                <button
                  key={preset.barcode}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-[11px] text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-400 transition-colors text-left"
                >
                  <span className="font-mono font-semibold text-emerald-800 dark:text-emerald-400">
                    {preset.sku}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 ml-1">· ৳{preset.sellingPrice}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Supabase Storage Image Upload Section */}
        <div className="mt-4 rounded-xl border border-sky-200 dark:border-sky-900/50 bg-sky-50/40 dark:bg-sky-950/20 p-3.5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Cloud className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {lang === 'bn' ? 'পণ্যের ছবি (Supabase Storage)' : 'Product Picture (Supabase Storage)'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-sky-700 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/60 px-2 py-0.5 rounded">
              bucket: tamanna-media/products
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Thumbnail Preview */}
            <div className="relative h-16 w-16 shrink-0 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
              {imageUrl ? (
                <img src={imageUrl} alt="Product" className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="h-6 w-6 text-slate-400" />
              )}
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  title="Remove image"
                  className="absolute top-0.5 right-0.5 rounded-full bg-rose-600 p-0.5 text-white hover:bg-rose-700"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Upload Button & Direct URL */}
            <div className="flex-1 space-y-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
                >
                  {isUploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  <span>{isUploading ? (lang === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading...') : (lang === 'bn' ? 'ছবি আপলোড করুন' : 'Upload Image')}</span>
                </button>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder={lang === 'bn' ? 'অথবা ছবির ডিরেক্ট লিঙ্ক দিন...' : 'Or enter direct image URL...'}
                  className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-sky-500 focus:outline-none"
                />
              </div>

              {uploadMessage && (
                <p className="text-[11px] font-medium text-sky-700 dark:text-sky-300 animate-in fade-in">
                  {uploadMessage}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 3. Main Product Information Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.productModal.nameLabel} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Motul 7100 4T 10W-40 Synthetic 1L"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Hash className="h-3 w-3 text-slate-400" /> {t.productModal.skuLabel} *
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. MOT-4T-10W40"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 font-mono uppercase text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.productModal.categoryLabel}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="Engine Oil & Lubricants">Engine Oil & Lubricants (ইঞ্জিন অয়েল)</option>
                <option value="Electrical & Ignition">Electrical & Ignition (ইলেকট্রিক্যাল ও স্পার্ক)</option>
                <option value="Brakes & Suspension">Brakes & Suspension (ব্রেক ও সাসপেনশন)</option>
                <option value="Batteries & Power">Batteries & Power (ব্যাটারি)</option>
                <option value="Tyres & Tubes">Tyres & Tubes (টায়ার ও টিউব)</option>
                <option value="Transmission & Drivetrain">Transmission & Drivetrain (চেইন স্প্রকেট)</option>
                <option value="Filters & Intake">Filters & Intake (এয়ার ফিল্টার)</option>
                <option value="Accessories & Helmets">Accessories & Helmets (এক্সেসরিজ)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <MapPin className="h-3 w-3 text-slate-400" /> {t.productModal.locationLabel}
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="Hazigonj Branch">Hazigonj Branch (হাজীগঞ্জ প্রধান শাখা)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-slate-400" /> {t.productModal.purchasePriceLabel} *
              </label>
              <input
                type="number"
                step="1"
                required
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="1250"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 font-mono text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-slate-400" /> {t.productModal.sellingPriceLabel} *
              </label>
              <input
                type="number"
                step="1"
                required
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                placeholder="1550"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 font-mono text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none font-bold text-emerald-800 dark:text-emerald-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.productModal.stockLabel}
              </label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 font-mono text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.productModal.alertQtyLabel}
              </label>
              <input
                type="number"
                required
                value={alertQty}
                onChange={(e) => setAlertQty(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 font-mono text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 shadow-xs transition-colors"
            >
              {initialProduct ? t.saveChanges : t.productModal.submitAdd}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
