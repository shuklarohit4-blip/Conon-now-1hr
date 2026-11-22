import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ShoppingBag, ShieldCheck } from "lucide-react";
import { type Product } from "./ProductCard";

interface VariantOption {
  label: string;
  price: number;
  mrp: number;
  unit: string;
}

interface VariantSelectorSheetProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectVariant: (product: Product, variant: VariantOption) => void;
}

export const VariantSelectorSheet: React.FC<VariantSelectorSheetProps> = ({
  product,
  isOpen,
  onClose,
  onSelectVariant,
}) => {
  if (!product) return null;

  // Generate realistic variants tailored to construction product types
  const variants: VariantOption[] = React.useMemo(() => {
    const p = product.price;
    const tag = (product.materialTag || "").toLowerCase();
    const title = (product.title || "").toLowerCase();

    if (tag.includes("paint")) {
      return [
        { label: "1 Litre Pack", price: Math.round(p * 0.12), mrp: Math.round(p * 0.15), unit: "1L Can" },
        { label: "4 Litre Pack", price: Math.round(p * 0.35), mrp: Math.round(p * 0.42), unit: "4L Bucket" },
        { label: "10 Litre Pack", price: Math.round(p * 0.65), mrp: Math.round(p * 0.75), unit: "10L Bucket" },
        { label: "20 Litre Drum", price: p, mrp: product.mrp > p ? product.mrp : Math.round(p * 1.15), unit: "20L Drum" },
      ];
    } else if (tag.includes("steel")) {
      return [
        { label: "8mm Diameter", price: Math.round(p * 0.45), mrp: Math.round(p * 0.52), unit: "Per Piece (12m)" },
        { label: "10mm Diameter", price: Math.round(p * 0.70), mrp: Math.round(p * 0.80), unit: "Per Piece (12m)" },
        { label: "12mm Diameter", price: p, mrp: product.mrp > p ? product.mrp : Math.round(p * 1.15), unit: "Per Piece (12m)" },
        { label: "16mm Diameter", price: Math.round(p * 1.75), mrp: Math.round(p * 1.95), unit: "Per Piece (12m)" },
      ];
    } else if (tag.includes("wood") || tag.includes("plywood")) {
      return [
        { label: "6mm Thickness", price: Math.round(p * 0.40), mrp: Math.round(p * 0.48), unit: "8x4 ft Sheet" },
        { label: "12mm Thickness", price: Math.round(p * 0.75), mrp: Math.round(p * 0.88), unit: "8x4 ft Sheet" },
        { label: "18mm Calibrated", price: p, mrp: product.mrp > p ? product.mrp : Math.round(p * 1.15), unit: "8x4 ft Sheet" },
      ];
    } else if (tag.includes("adhesives") || tag.includes("waterproof")) {
      return [
        { label: "1 kg Pack", price: Math.round(p * 0.25), mrp: Math.round(p * 0.30), unit: "1kg Bottle" },
        { label: "5 kg Bucket", price: Math.round(p * 0.65), mrp: Math.round(p * 0.75), unit: "5kg Bucket" },
        { label: "20 kg Drum", price: p, mrp: product.mrp > p ? product.mrp : Math.round(p * 1.15), unit: "20kg Drum" },
      ];
    } else {
      return [
        { label: "Single Unit Pack", price: p, mrp: product.mrp > p ? product.mrp : Math.round(p * 1.15), unit: product.unit || "1 unit" },
        { label: "Site Bulk Pack (10x)", price: Math.round(p * 9.2), mrp: Math.round(p * 11), unit: "Bundle (10 units)" },
      ];
    }
  }, [product]);

  const [selectedIdx, setSelectedIdx] = useState(0);
  const selectedVariant = variants[selectedIdx] || variants[0];

  const handleConfirm = () => {
    onSelectVariant(product, selectedVariant);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[480px] bg-white rounded-t-3xl shadow-2xl p-4 max-h-[85vh] overflow-y-auto z-10"
          >
            {/* Header row */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-14 h-14 rounded-xl bg-[#F6F8FB] border border-black/[0.04] p-1 shrink-0 flex items-center justify-center">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                    {product.brand || product.materialTag}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight line-clamp-2">
                    {product.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={onClose}
                aria-label="Close variant selector"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 active:scale-90 transition shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Select options label */}
            <div className="mt-3.5 mb-2 flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 tracking-tight">
                Select Pack / Variant
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                {variants.length} available options
              </span>
            </div>

            {/* Variant List Cards */}
            <div className="space-y-2 mt-2">
              {variants.map((v, i) => {
                const isSelected = selectedIdx === i;
                const savings = v.mrp > v.price ? v.mrp - v.price : 0;
                return (
                  <div
                    key={i}
                    onClick={() => setSelectedIdx(i)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "border-[#0C831F] bg-[#F2FBF4] shadow-xs ring-1 ring-[#0C831F]"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? "border-[#0C831F] bg-[#0C831F] text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <div>
                        <p className="text-[13px] font-bold text-slate-900 leading-tight">
                          {v.label}
                        </p>
                        <p className="text-[11px] font-medium text-slate-500 leading-tight mt-0.5">
                          {v.unit}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-baseline gap-1 justify-end">
                        <span className="text-sm font-black text-slate-900 tabular-nums">
                          ₹{v.price.toLocaleString("en-IN")}
                        </span>
                        {v.mrp > v.price && (
                          <span className="text-xs text-slate-400 line-through tabular-nums">
                            ₹{v.mrp.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                      {savings > 0 && (
                        <span className="text-[10px] font-bold text-[#0C831F] leading-none">
                          Save ₹{savings.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trust badge */}
            <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium bg-slate-50 p-2 rounded-xl border border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Genuine factory sealed packaging • 100% verified material</span>
            </div>

            {/* Bottom action button */}
            <div className="mt-4 pt-2">
              <button
                onClick={handleConfirm}
                className="w-full py-3.5 rounded-2xl bg-[#0C831F] hover:bg-[#0A731B] active:scale-[0.99] text-white font-black text-[14px] flex items-center justify-center gap-2 shadow-md transition"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add {selectedVariant.label} • ₹{selectedVariant.price.toLocaleString("en-IN")}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
