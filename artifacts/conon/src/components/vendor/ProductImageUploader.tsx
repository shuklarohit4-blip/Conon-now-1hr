import React, { useState, useRef, useCallback } from "react";
import {
  Camera,
  UploadCloud,
  CheckCircle2,
  RefreshCw,
  X,
  Sparkles,
  Eye,
  Sliders,
  Layers,
  IndianRupee,
  ShieldCheck,
  FileCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useVendorTheme } from "@/context/VendorThemeContext";
import { useVendorLang } from "@/context/VendorLanguageContext";

export interface CompressionResult {
  dataUrl: string;
  originalSizeKB: number;
  compressedSizeKB: number;
  reductionPercent: number;
  width: number;
  height: number;
}

export interface ProductImageUploaderProps {
  productId: string;
  productName: string;
  productBrand?: string;
  categoryName?: string;
  dealerPrice?: number;
  mrp?: number;
  currentImageUrl: string;
  isCustomPhoto?: boolean;
  onSaveImage: (productId: string, dataUrl: string) => Promise<void> | void;
  onResetImage: (productId: string) => Promise<void> | void;
  onClose?: () => void;
}

/**
 * Client-Side Auto-Optimizer using offscreen HTML5 Canvas.
 * Resizes to max 800px dimension and encodes as WebP (or JPEG fallback) at quality 0.82.
 */
export async function optimizeImageFile(file: File): Promise<CompressionResult> {
  const originalSizeKB = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to decode image"));
      img.onload = () => {
        const MAX_DIMENSION = 800;
        let { width, height } = img;

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context creation failed"));
          return;
        }

        // Draw crisp background & image
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Attempt WebP first with 0.82 quality; fallback to JPEG
        let dataUrl = canvas.toDataURL("image/webp", 0.82);
        if (!dataUrl.startsWith("data:image/webp")) {
          dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        }

        // Calculate approximate size in KB from base64 string
        const base64Length = dataUrl.length - (dataUrl.indexOf(",") + 1);
        const compressedSizeKB = Math.round((base64Length * 3) / 4 / 1024);
        const reductionPercent = Math.max(
          0,
          Math.round(((originalSizeKB - compressedSizeKB) / Math.max(1, originalSizeKB)) * 100)
        );

        resolve({
          dataUrl,
          originalSizeKB,
          compressedSizeKB,
          reductionPercent,
          width,
          height,
        });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function ProductImageUploader({
  productId,
  productName,
  productBrand = "Conon Certified",
  categoryName = "Construction Supplies",
  dealerPrice = 385,
  mrp = 440,
  currentImageUrl,
  isCustomPhoto = false,
  onSaveImage,
  onResetImage,
  onClose,
}: ProductImageUploaderProps) {
  const { isDark } = useVendorTheme();
  const { lang } = useVendorLang();

  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl);
  const [compressionStats, setCompressionStats] = useState<CompressionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(lang === "hi" ? "कृपया मान्य फोटो फाइल (JPEG, PNG या WebP) चुनें" : "Please upload a valid image file (JPEG, PNG, or WebP).");
      return;
    }

    try {
      setIsProcessing(true);
      const result = await optimizeImageFile(file);
      setPreviewUrl(result.dataUrl);
      setCompressionStats(result);
      toast.success(
        lang === "hi"
          ? `फोटो ऑप्टिमाइज़ हो गई! ${result.originalSizeKB} KB ➔ ${result.compressedSizeKB} KB (${result.reductionPercent}% छोटी)`
          : `Optimized photo! ${result.originalSizeKB} KB ➔ ${result.compressedSizeKB} KB (${result.reductionPercent}% smaller)`
      );
    } catch (err: any) {
      toast.error(lang === "hi" ? "फोटो प्रोसेस करने में समस्या आई" : `Image optimization failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  }, [lang]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        void handleProcessFile(e.dataTransfer.files[0]);
      }
    },
    [handleProcessFile]
  );

  const handleSave = async () => {
    if (previewUrl === currentImageUrl && !compressionStats) {
      toast.info(lang === "hi" ? "कोई बदलाव नहीं किया गया" : "No changes to save.");
      onClose?.();
      return;
    }

    try {
      setIsSaving(true);
      await onSaveImage(productId, previewUrl);
      toast.success(lang === "hi" ? "उत्पाद फोटो अपडेट होकर स्टोरफ्रंट पर प्रसारित हो गई!" : "Product photo updated and broadcast to Storefront!");
      onClose?.();
    } catch {
      toast.error(lang === "hi" ? "फोटो सहेजने में विफल" : "Failed to save image. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsSaving(true);
      await onResetImage(productId);
      toast.success(lang === "hi" ? "मास्टर कैटलॉग फोटो पर वापस रीसेट!" : "Reverted to Conon master catalog photo.");
      onClose?.();
    } catch {
      toast.error(lang === "hi" ? "रीसेट विफल रहा" : "Failed to revert image.");
    } finally {
      setIsSaving(false);
    }
  };

  const themeCardClass = isDark
    ? "bg-[#111827] border-slate-700 text-slate-100"
    : "bg-white border-slate-300 text-slate-900";

  const themeHeaderClass = isDark
    ? "bg-[#161F30] border-slate-800"
    : "bg-slate-50 border-slate-200";

  const themeSubtextClass = isDark ? "text-slate-400" : "text-slate-500";
  const themeTitleClass = isDark ? "text-white" : "text-slate-900";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`border rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors ${themeCardClass}`}>
        {/* Modal Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${themeHeaderClass}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-sm font-black flex items-center gap-2 ${themeTitleClass}`}>
                {lang === "hi" ? "कस्टम उत्पाद फोटो स्टूडियो" : "Custom Product Photo Studio"}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-600 dark:text-amber-300 font-mono font-bold border border-amber-500/20">
                  Client-Side WebP
                </span>
              </h3>
              <p className={`text-xs line-clamp-1 ${themeSubtextClass}`}>{productName}</p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl transition cursor-pointer hover:text-slate-900 dark:hover:text-white ${themeSubtextClass}`}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Info Banner */}
          <div
            className={`p-3.5 rounded-2xl border flex items-start gap-3 text-xs ${
              isDark
                ? "bg-amber-400/5 border-amber-500/15 text-slate-300"
                : "bg-amber-50 border-amber-200 text-amber-950"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p>
              {lang === "hi"
                ? "अपनी दुकान या गोदाम से सीधे असली फोटो अपलोड करें। कोनोन का ऑटो-कंप्रेशन इंजन बिना क्वालिटी खोए 800px WebP में बदलकर लखनऊ के सभी खरीदारों के सामने 200ms में अपडेट कर देता है।"
                : "Upload real photographs from your shop floor or godown. Conon's client engine automatically compresses and resizes images to crisp 800px WebP, updating customer listings across Lucknow in under 200ms."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            {/* Left: Upload Zone */}
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[220px] ${
                  isDragOver
                    ? "border-amber-400 bg-amber-400/10"
                    : isDark
                    ? "border-slate-700 bg-slate-900/50 hover:border-amber-400/60 hover:bg-slate-900"
                    : "border-slate-300 bg-slate-50 hover:border-amber-400 hover:bg-slate-100"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      void handleProcessFile(e.target.files[0]);
                    }
                  }}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      void handleProcessFile(e.target.files[0]);
                    }
                  }}
                />

                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 flex items-center justify-center text-amber-500 mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h4 className={`text-xs font-black ${themeTitleClass}`}>
                  {lang === "hi" ? "ड्रैग व ड्रॉप करें या फाइल चुनें" : "Drag & Drop or Click to Browse"}
                </h4>
                <p className={`text-[11px] mt-1 ${themeSubtextClass}`}>PNG, JPG, or WebP up to 15 MB</p>

                {isProcessing && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-500 font-bold">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{lang === "hi" ? "कैनवास पर कंप्रेस हो रहा है..." : "Compressing via Canvas..."}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons for Mobile/Desktop */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition border cursor-pointer ${
                    isDark
                      ? "bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700"
                      : "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300"
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 text-amber-500" />
                  <span>{lang === "hi" ? "कैमरा से फोटो लें" : "Take Live Photo"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition border cursor-pointer ${
                    isDark
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{lang === "hi" ? "फाइल चुनें" : "Choose File"}</span>
                </button>
              </div>

              {/* Compression Metrics Pill */}
              {compressionStats && (
                <div
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    isDark
                      ? "bg-emerald-500/10 border-emerald-500/25"
                      : "bg-emerald-50 border-emerald-200"
                  }`}
                >
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-black">
                    <span className="flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5" />
                      Auto-Compressed (Canvas)
                    </span>
                    <span>{compressionStats.reductionPercent}% {lang === "hi" ? "छोटी साइज" : "Smaller"}</span>
                  </div>
                  <p className={`text-[11px] font-mono ${themeSubtextClass}`}>
                    {compressionStats.originalSizeKB} KB ➔ {compressionStats.compressedSizeKB} KB (
                    {compressionStats.width}x{compressionStats.height}px)
                  </p>
                </div>
              )}
            </div>

            {/* Right: Live Customer Storefront Card Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  {lang === "hi" ? "स्टोरफ्रंट लाइव पूर्वावलोकन" : "Customer Storefront Live Preview"}
                </span>
                <span className={`text-[10px] ${themeSubtextClass}`}>
                  {lang === "hi" ? "ग्राहकों को दिखेगा" : "What builders see"}
                </span>
              </div>

              {/* Storefront Mock Card */}
              <div className="rounded-2xl bg-white text-slate-900 border border-slate-200 p-3 shadow-lg overflow-hidden flex flex-col">
                <div className="relative aspect-4/3 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center mb-2.5">
                  <img
                    src={previewUrl}
                    alt={productName}
                    className="w-full h-full object-contain p-2"
                  />
                  <span className="absolute top-2 left-2 bg-[#1848a0] text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
                    CONON-NOW
                  </span>
                  <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-sm">
                    60-Min Express
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-blue-50 text-[#1848a0]">
                      {categoryName}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500">{productBrand}</span>
                  </div>
                  <h5 className="font-bold text-xs text-slate-900 line-clamp-1">{productName}</h5>

                  <div className="pt-1 flex items-baseline gap-2">
                    <strong className="text-base font-black text-slate-900">
                      ₹{Math.round(dealerPrice * 1.1).toLocaleString("en-IN")}
                    </strong>
                    <span className="text-[11px] text-slate-400 line-through">
                      ₹{mrp.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600">
                      (
                      {Math.max(
                        0,
                        Math.round(((mrp - Math.round(dealerPrice * 1.1)) / mrp) * 100)
                      )}
                      % OFF)
                    </span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      ISI Certified • Verified Hub
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black">
                      In Stock
                    </span>
                  </div>
                </div>
              </div>

              {isCustomPhoto && (
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSaving}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                    isDark
                      ? "text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border-slate-800"
                      : "text-slate-600 hover:text-rose-600 hover:bg-rose-50 border-slate-200"
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{lang === "hi" ? "मास्टर कैटलॉग फोटो पर वापस जाएं" : "Revert to Master Catalog Photo"}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-end gap-3 ${themeHeaderClass}`}>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                isDark
                  ? "text-slate-400 hover:text-white hover:bg-slate-800"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              }`}
            >
              {lang === "hi" ? "रद्द करें" : "Cancel"}
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isProcessing}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-400/20 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{lang === "hi" ? "प्रसारित हो रहा है..." : "Broadcasting..."}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>{lang === "hi" ? "सहेजें और स्टोरफ्रंट पर लाइव करें" : "Save & Broadcast to Storefront"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductImageUploader;
