import React, { useState } from "react";
import {
  ShieldCheck, Truck, Clock, Award, CheckCircle2,
  PackageCheck, FileText, AlertCircle, Sparkles,
  Layers, HardHat, Info,
} from "lucide-react";
import type { EnrichedProductData } from "@/lib/productMetadata";
import { resolveRealProductImage } from "@/utils/realMediaResolver";
import { CATEGORY_REAL_FLAGSHIP_MAP, utWaterplus } from "@/data/realMediaRegistry";

export interface ProductGallerySlideProps {
  src: string;
  slideIndex: number;
  product: EnrichedProductData;
  onZoom?: () => void;
}

/**
 * Smart gallery slide renderer.
 * Loads verified product photography for hero slide 0, and high-res civil engineering
 * informational cards for technical specification slides 1-4.
 * Never renders broken images, SVG cartoons, or empty placeholders.
 */
export function ProductGallerySlide({
  src,
  slideIndex,
  product,
  onZoom,
}: ProductGallerySlideProps) {
  const [loadFailed, setLoadFailed] = useState(false);

  const heroRealPhoto = resolveRealProductImage(
    product,
    product.title,
    product.brand,
    product.categoryTag || (product as any).categorySlug
  );

  // Slide 0: standard product photo (100% real studio photography)
  if (slideIndex === 0) {
    const activePhoto = loadFailed ? (CATEGORY_REAL_FLAGSHIP_MAP[product.categoryTag || (product as any).categorySlug || "cement"] || utWaterplus) : (src || heroRealPhoto);
    return (
      <div
        onClick={onZoom}
        className="w-full h-full flex items-center justify-center p-4 cursor-zoom-in bg-[#F7F8FA]"
      >
        <img
          src={activePhoto}
          alt={`${product.title} - Front View`}
          onError={() => setLoadFailed(true)}
          className="w-full h-full object-contain max-h-[380px] transition-transform duration-300 hover:scale-105"
        />
      </div>
    );
  }

  // Slides 1-4 (Slides 2-5 in user terms): try loading image; if failed or not yet on disk, render high-res branded visual slide!
  if (!loadFailed) {
    return (
      <div
        onClick={onZoom}
        className="w-full h-full flex items-center justify-center p-4 cursor-zoom-in relative"
      >
        <img
          src={src}
          alt={`${product.title} - Slide ${slideIndex + 1}`}
          onError={() => setLoadFailed(true)}
          className="w-full h-full object-contain max-h-[380px]"
        />
      </div>
    );
  }

  // ── Branded Visual Slide 2: Packaging & Batch Freshness Card ─────────────
  if (slideIndex === 1) {
    return (
      <div className="w-full h-full flex flex-col justify-between bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-900 text-white p-6 rounded-2xl shadow-inner select-none">
        <div>
          <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
            <span className="flex items-center gap-1.5 text-xs font-black tracking-wider uppercase text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30">
              <PackageCheck className="w-3.5 h-3.5" /> Batch Freshness Verified
            </span>
            <span className="text-[11px] font-bold text-slate-300">CONON-NOW QC</span>
          </div>

          <h4 className="text-xl font-black mt-4 leading-snug">
            {product.brand} Quality &amp; Tamper-Proof Seal
          </h4>
          <p className="text-xs text-emerald-200/80 mt-1">
            Machine-weighed and dispatched from humidity-controlled regional hubs.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <p className="text-[10px] uppercase font-bold text-emerald-300">Manufacturing Age</p>
            <p className="text-sm font-black text-white mt-0.5">&lt; 15 Days Fresh</p>
            <p className="text-[10px] text-slate-300 mt-1">Zero hydration lumps</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <p className="text-[10px] uppercase font-bold text-emerald-300">Weight Verification</p>
            <p className="text-sm font-black text-white mt-0.5">{product.unit}</p>
            <p className="text-[10px] text-slate-300 mt-1">Calibrated electronic scale</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <p className="text-[10px] uppercase font-bold text-emerald-300">Moisture Barrier</p>
            <p className="text-sm font-black text-white mt-0.5">Heavy HDPE / Seal</p>
            <p className="text-[10px] text-slate-300 mt-1">Weatherproof woven sack</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <p className="text-[10px] uppercase font-bold text-emerald-300">On-Site Guarantee</p>
            <p className="text-sm font-black text-white mt-0.5">Instant Replacement</p>
            <p className="text-[10px] text-slate-300 mt-1">If torn or wet on arrival</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-emerald-300/80 border-t border-emerald-500/20 pt-2.5">
          <span className="flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Genuine Direct Supply
          </span>
          <span className="font-bold text-white">Slide 2 / 5</span>
        </div>
      </div>
    );
  }

  // ── Branded Visual Slide 3: Technical IS Code & Compliance Card ──────────
  if (slideIndex === 2) {
    return (
      <div className="w-full h-full flex flex-col justify-between bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-6 rounded-2xl shadow-inner select-none">
        <div>
          <div className="flex items-center justify-between border-b border-blue-500/30 pb-3">
            <span className="flex items-center gap-1.5 text-xs font-black tracking-wider uppercase text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded-full border border-blue-500/30">
              <Award className="w-3.5 h-3.5" /> BIS Specification Spec Sheet
            </span>
            <span className="text-[11px] font-bold text-slate-300">ISI Certified</span>
          </div>

          <h4 className="text-xl font-black mt-4 leading-snug">
            Technical Benchmark &amp; Grade
          </h4>
          <p className="text-xs text-blue-200/80 mt-1 truncate">
            {product.title}
          </p>
        </div>

        <div className="space-y-2.5 my-3">
          {product.highlights.slice(0, 4).map((h, i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur-md rounded-xl px-3.5 py-2.5 flex items-center justify-between border border-white/10"
            >
              <span className="text-xs font-medium text-slate-300">{h.label}</span>
              <span className="text-xs font-black text-white">{h.value}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-[11px] text-blue-300/80 border-t border-blue-500/20 pt-2.5">
          <span className="flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Lab-Tested Quality Standard
          </span>
          <span className="font-bold text-white">Slide 3 / 5</span>
        </div>
      </div>
    );
  }

  // ── Branded Visual Slide 4: Site Application Guide ───────────────────────
  if (slideIndex === 3) {
    return (
      <div className="w-full h-full flex flex-col justify-between bg-gradient-to-br from-zinc-900 via-stone-900 to-amber-950 text-white p-6 rounded-2xl shadow-inner select-none">
        <div>
          <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
            <span className="flex items-center gap-1.5 text-xs font-black tracking-wider uppercase text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-500/30">
              <HardHat className="w-3.5 h-3.5" /> Site Application Guide
            </span>
            <span className="text-[11px] font-bold text-slate-300">Civil Best Practices</span>
          </div>

          <h4 className="text-xl font-black mt-4 leading-snug">
            Storage &amp; Field Usage Tips
          </h4>
          <p className="text-xs text-amber-200/80 mt-1">
            Engineered guidelines for contractors, masons &amp; engineers.
          </p>
        </div>

        <div className="space-y-2.5 my-3">
          {product.usageTips.map((tip, i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-start gap-2.5"
            >
              <span className="w-5 h-5 rounded-full bg-amber-500/30 text-amber-300 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">{tip}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-[11px] text-amber-300/80 border-t border-amber-500/20 pt-2.5">
          <span className="flex items-center gap-1 font-semibold">
            <Info className="w-3.5 h-3.5 text-amber-400" /> Recommended by Senior Structural Engineers
          </span>
          <span className="font-bold text-white">Slide 4 / 5</span>
        </div>
      </div>
    );
  }

  // ── Branded Visual Slide 5: Bulk Savings + 60-Min Express Delivery ─────────
  return (
    <div className="w-full h-full flex flex-col justify-between bg-gradient-to-br from-emerald-950 via-green-950 to-neutral-900 text-white p-6 rounded-2xl shadow-inner select-none">
      <div>
        <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
          <span className="flex items-center gap-1.5 text-xs font-black tracking-wider uppercase text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30">
            <Truck className="w-3.5 h-3.5" /> 60-Min Express Site Dispatch
          </span>
          <span className="text-[11px] font-bold text-amber-300">Bulk Discount</span>
        </div>

        <h4 className="text-xl font-black mt-4 leading-snug">
          Wholesale Project Rates &amp; Delivery
        </h4>
        <p className="text-xs text-emerald-200/80 mt-1">
          Direct hydraulic truck supply with GST tax credit billing.
        </p>
      </div>

      <div className="space-y-2.5 my-3">
        {product.bulkPricingTiers.length > 0 ? (
          product.bulkPricingTiers.map((tier, idx) => (
            <div
              key={idx}
              className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-emerald-400/30 flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-emerald-300">{tier.label}</p>
                <p className="text-[10px] text-slate-300">Direct contractor volume slab</p>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-white">₹{tier.price}</span>
                <span className="text-[10px] text-emerald-400 block font-bold">
                  Save ₹{tier.savingsPerUnit}/unit
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-emerald-400/30 text-center">
            <p className="text-sm font-bold text-emerald-300">Contractor Tiered Discounts Available</p>
            <p className="text-xs text-slate-300 mt-1">Save up to 15% on truckload site orders</p>
          </div>
        )}

        <div className="bg-emerald-900/40 rounded-xl p-3 border border-emerald-500/20 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-bold text-white">
            <FileText className="w-4 h-4 text-emerald-400" /> GST Input Tax Credit
          </span>
          <span className="text-emerald-300 font-bold">Full 18% / 28% ITC</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-emerald-300/80 border-t border-emerald-500/20 pt-2.5">
        <span className="flex items-center gap-1 font-semibold">
          <Clock className="w-3.5 h-3.5 text-emerald-400" /> Fast Track Lucknow Delivery
        </span>
        <span className="font-bold text-white">Slide 5 / 5</span>
      </div>
    </div>
  );
}
