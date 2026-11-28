import React from "react";
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Truck,
  Zap,
  ChevronDown,
} from "lucide-react";
import { useProductMedia } from "@/context/ProductMediaVaultContext";
import { resolveVaultAssetUrl } from "@/services/productMediaVault";

/* ═══════════════════════════════════════════════════════════════════════════
   UNIFIED CONON-NOW COLLECTION STOREFRONT PRIMITIVES
   Matches CCTV & Networking 100% across Lighting, Solar, and Surveillance.
   Supports Light + Dark Mode cleanly without empty text-only boxes.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface CategoryHeaderProps {
  title: string;
  breadcrumbCategory: string;
  activeSubCategoryName: string;
  hubSubtitle: string;
  icon: React.ReactNode;
  onBack?: () => void;
}

export function CategoryHeader({
  title,
  breadcrumbCategory,
  activeSubCategoryName,
  hubSubtitle,
  icon,
  onBack,
}: CategoryHeaderProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else if (typeof window !== "undefined") {
      window.location.href = "/home";
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-100 text-xs font-bold transition shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 flex items-center justify-center shrink-0 text-[#12357A] dark:text-amber-300">
            {icon}
          </div>

          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-black text-gray-900 dark:text-white tracking-tight truncate">
              {title}
            </h1>
            <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-slate-400 overflow-x-auto scrollbar-hide whitespace-nowrap">
              <span>Home</span>
              <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
              <span>{breadcrumbCategory}</span>
              <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="font-semibold text-gray-900 dark:text-slate-200">
                {activeSubCategoryName}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Zap className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            ✦ 60-Min Lucknow Express Delivery
          </span>
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
            {hubSubtitle}
          </span>
        </div>
      </div>
    </div>
  );
}

export interface SiteCompanionBannerProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  goldCtaLabel: string;
  onGoldCtaClick: () => void;
  blueCtaLabel: string;
  onBlueCtaClick: () => void;
}

export function SiteCompanionBanner({
  icon,
  title,
  description,
  goldCtaLabel,
  onGoldCtaClick,
  blueCtaLabel,
  onBlueCtaClick,
}: SiteCompanionBannerProps) {
  return (
    <div
      className="mb-4 text-white rounded-2xl p-4 sm:p-5 shadow-md border border-blue-900/60"
      style={{
        background: "linear-gradient(110deg, #0B1B3D 0%, #10244E 55%, #12357A 100%)",
      }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 shrink-0">{icon}</span>
            <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-white">
              {title}
            </h2>
          </div>
          <p className="text-xs text-slate-200 mt-1.5 max-w-3xl leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onGoldCtaClick}
            className="px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition shadow-sm cursor-pointer active:scale-95"
          >
            {goldCtaLabel}
          </button>
          <button
            type="button"
            onClick={onBlueCtaClick}
            className="px-4 py-2 rounded-full bg-[#1848a0] hover:bg-[#1e57c0] text-white text-xs font-bold transition border border-blue-400/50 cursor-pointer active:scale-95"
          >
            {blueCtaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export interface HorizontalSubCategoryItem {
  id: string;
  name: string;
  count: number;
  thumbnail: React.ReactNode;
}

export interface HorizontalSubCategoryBarProps {
  items: HorizontalSubCategoryItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function HorizontalSubCategoryBar({
  items,
  activeId,
  onSelect,
}: HorizontalSubCategoryBarProps) {
  return (
    <div className="flex items-stretch gap-2.5 overflow-x-auto scrollbar-hide pb-2 mb-4">
      {items.map((sub) => {
        const isActive = activeId === sub.id;
        return (
          <button
            key={sub.id}
            type="button"
            onClick={() => onSelect(sub.id)}
            className={`min-w-[148px] sm:min-w-[162px] flex-1 flex flex-col items-start gap-2 p-3 rounded-2xl border text-left transition shrink-0 cursor-pointer ${
              isActive
                ? "bg-[#12357A] text-white border-[#12357A] shadow-md ring-2 ring-blue-400/30"
                : "bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-slate-800"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0 ${
                isActive ? "bg-white/15 text-amber-300" : "bg-slate-100 dark:bg-slate-800 text-[#12357A] dark:text-amber-300"
              }`}
            >
              {sub.thumbnail}
            </div>
            <div className="min-w-0 w-full">
              <p className="text-xs font-bold line-clamp-2 leading-snug">{sub.name}</p>
              <p
                className={`text-[10.5px] font-semibold mt-0.5 ${
                  isActive ? "text-blue-100" : "text-gray-400 dark:text-slate-400"
                }`}
              >
                {sub.count} Items
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export interface DualRowFilterBarProps {
  row1Label: string;
  quickFilters: Array<{ id: string; label: string }>;
  activeQuickFilter: string;
  onQuickFilterChange: (id: string) => void;
  trustHighlights: Array<{
    id: string;
    label: string;
    active: boolean;
    tone: "emerald" | "amber";
    onToggle: () => void;
    icon?: React.ReactNode;
  }>;
  brandFilterValue: string;
  onBrandFilterChange: (val: string) => void;
  brandOptions: Array<{ value: string; label: string }>;
  specFilterValue: string;
  onSpecFilterChange: (val: string) => void;
  specOptions: Array<{ value: string; label: string }>;
  priceFilterValue: string;
  onPriceFilterChange: (val: string) => void;
  priceOptions: Array<{ value: string; label: string }>;
  resultCount: number;
  sortByValue: string;
  onSortByChange: (val: string) => void;
}

export function DualRowFilterBar({
  row1Label,
  quickFilters,
  activeQuickFilter,
  onQuickFilterChange,
  trustHighlights,
  brandFilterValue,
  onBrandFilterChange,
  brandOptions,
  specFilterValue,
  onSpecFilterChange,
  specOptions,
  priceFilterValue,
  onPriceFilterChange,
  priceOptions,
  resultCount,
  sortByValue,
  onSortByChange,
}: DualRowFilterBarProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-3.5 mb-5 shadow-sm space-y-3">
      {/* Row 1: Quick Mount / System Chips + 2 High-Trust Highlight Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-xs font-bold text-gray-700 dark:text-slate-200 flex items-center gap-1 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
            {row1Label}
          </span>
          {quickFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onQuickFilterChange(f.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                activeQuickFilter === f.id
                  ? "bg-[#12357A] text-white shadow-sm"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {trustHighlights.map((th) => {
            const cls =
              th.tone === "emerald"
                ? th.active
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
                : th.active
                ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                : "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100";
            return (
              <button
                key={th.id}
                type="button"
                onClick={th.onToggle}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition flex items-center gap-1 cursor-pointer ${cls}`}
              >
                {th.icon}
                <span>{th.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 2: 3 Compact Dropdowns + Live Count & Sort */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-gray-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={brandFilterValue}
            onChange={(e) => onBrandFilterChange(e.target.value)}
            className="text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 font-medium text-gray-700 dark:text-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
          >
            {brandOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <select
            value={specFilterValue}
            onChange={(e) => onSpecFilterChange(e.target.value)}
            className="text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 font-medium text-gray-700 dark:text-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
          >
            {specOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <select
            value={priceFilterValue}
            onChange={(e) => onPriceFilterChange(e.target.value)}
            className="text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 font-medium text-gray-700 dark:text-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
          >
            {priceOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 dark:text-slate-400 font-semibold">
            {resultCount} Products
          </span>
          <select
            value={sortByValue}
            onChange={(e) => onSortByChange(e.target.value)}
            className="text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 font-medium text-gray-700 dark:text-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="relevance">Sort: Recommended ▾</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="discount">Highest Discount</option>
          </select>
        </div>
      </div>
    </div>
  );
}

/**
 * ProductStageVisual — Checks Admin Media Vault for a real photograph first;
 * if no real photograph exists yet, renders the crisp domain SVG artwork so there is
 * NEVER an empty text-only box.
 */
export function ProductStageVisual({
  product,
  fallbackVisual,
  ambientGlowCss,
}: {
  product: Record<string, any>;
  fallbackVisual: React.ReactNode;
  ambientGlowCss?: string;
}) {
  const media = useProductMedia(product);
  const firstUrl = media.images?.[0]?.url ? resolveVaultAssetUrl(media.images[0].url, media.images[0].fallbackDataUrl) : "";
  const [failed, setFailed] = React.useState(false);

  return (
    <div className="relative w-full h-40 sm:h-44 flex items-center justify-center">
      {ambientGlowCss && (
        <div
          className="absolute inset-4 rounded-full blur-xl transition-all duration-300 pointer-events-none"
          style={{ background: ambientGlowCss }}
        />
      )}
      {firstUrl && !failed ? (
        <img
          src={firstUrl}
          alt={product.title || product.name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="relative z-10 max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="relative z-10 flex items-center justify-center w-full h-full group-hover:scale-105 transition-transform duration-300">
          {fallbackVisual}
        </div>
      )}
    </div>
  );
}

export interface ProductCardProps {
  product: Record<string, any>;
  discountPct: number;
  topRightBadge?: React.ReactNode;
  visualNode: React.ReactNode;
  ambientGlowCss?: string;
  siteWarningNote: string;
  brand: string;
  oemModelCode: string;
  title: string;
  specLine: string;
  price: number;
  mrp: number;
  gstPercent: number;
  unit: string;
  deliveryTime: string;
  vehicleType: string;
  qtyInCart: number;
  hasVariants?: boolean;
  extraControls?: React.ReactNode;
  extraStrip?: React.ReactNode;
  onCardClick: () => void;
  onAdd: () => void;
  onDecrement: () => void;
  onIncrement: () => void;
  onOpenVariants: () => void;
}

export function ProductCard({
  product,
  discountPct,
  topRightBadge,
  visualNode,
  ambientGlowCss,
  siteWarningNote,
  brand,
  oemModelCode,
  title,
  specLine,
  price,
  mrp,
  gstPercent,
  unit,
  deliveryTime,
  vehicleType,
  qtyInCart,
  hasVariants = true,
  extraControls,
  extraStrip,
  onCardClick,
  onAdd,
  onDecrement,
  onIncrement,
  onOpenVariants,
}: ProductCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      {/* Top Visual Stage */}
      <div
        className="relative p-3 sm:p-4 pb-8 bg-[#F8FAFC] dark:bg-slate-800/70 flex items-center justify-center cursor-pointer group"
        onClick={onCardClick}
      >
        {discountPct > 0 && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10.5px] font-black bg-[#12357A] text-white shadow-sm z-20">
            Save {discountPct}%
          </span>
        )}

        {topRightBadge && <div className="absolute top-2.5 right-2.5 z-20">{topRightBadge}</div>}

        <ProductStageVisual
          product={product}
          fallbackVisual={visualNode}
          ambientGlowCss={ambientGlowCss}
        />

        {/* Verified Stamp & Bottom Site Note */}
        <div className="absolute bottom-2 left-2.5 right-2.5 z-20 flex items-center justify-between gap-1.5">
          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/95 dark:bg-slate-900/90 text-gray-700 dark:text-slate-200 border border-gray-200/80 dark:border-slate-700 shadow-2xs truncate">
            {siteWarningNote}
          </span>
          <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 shrink-0">
            <ShieldCheck className="w-2.5 h-2.5" />
            VERIFIED
          </span>
        </div>
      </div>

      {/* Details Body */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[10.5px] font-semibold mb-1 gap-1">
            <span className="text-[#12357A] dark:text-amber-300 uppercase tracking-wider truncate font-black">
              {brand}
            </span>
            <span className="text-gray-400 dark:text-slate-500 truncate max-w-[115px] font-mono text-[10px]">
              {oemModelCode}
            </span>
          </div>

          <h3
            onClick={onCardClick}
            className="text-xs sm:text-[13px] font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug cursor-pointer hover:text-[#12357A] dark:hover:text-amber-300 transition min-h-[2.4em]"
          >
            {title}
          </h3>

          <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 line-clamp-1 font-medium">
            {specLine}
          </p>

          {extraControls}

          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md">
              <Clock className="w-3 h-3" />
              {deliveryTime}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              <Truck className="w-3 h-3 text-gray-400" />
              {vehicleType}
            </span>
          </div>

          {extraStrip}
        </div>

        {/* Price + ADD / Stepper + +Variants */}
        <div className="pt-3 mt-3 border-t border-gray-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-sm sm:text-base font-black text-gray-900 dark:text-white">
                  ₹{price.toLocaleString("en-IN")}
                </span>
                {mrp > price && (
                  <span className="text-[11px] text-gray-400 line-through font-medium">
                    ₹{mrp.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-gray-400 dark:text-slate-500 font-medium block truncate">
                Incl. {gstPercent}% GST ({unit})
              </span>
            </div>

            {product?.inStock === false || product?.isInStock === false ? (
              <span className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[10.5px] font-black shrink-0">
                Out of Stock
              </span>
            ) : qtyInCart === 0 ? (
              <button
                type="button"
                onClick={onAdd}
                className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#12357A] hover:bg-[#0E2960] text-white text-xs font-black active:scale-95 transition shadow-sm shrink-0 cursor-pointer"
              >
                ADD
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-[#12357A] text-white px-2 py-1 rounded-xl shadow-sm shrink-0">
                <button
                  type="button"
                  onClick={onDecrement}
                  aria-label="Decrease quantity"
                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/20 active:scale-90 cursor-pointer"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs font-black min-w-[14px] text-center">{qtyInCart}</span>
                <button
                  type="button"
                  onClick={onIncrement}
                  aria-label="Increase quantity"
                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/20 active:scale-90 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {hasVariants && (
            <button
              type="button"
              onClick={onOpenVariants}
              className="w-full py-1 px-2 rounded-lg bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[10.5px] font-bold text-[#12357A] dark:text-amber-300 flex items-center justify-center gap-1 transition cursor-pointer"
            >
              <span>+Variants & Bulk Pack</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function FloatingReorderLast({
  onReorderLast,
  label = "Reorder Last",
}: {
  onReorderLast: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onReorderLast}
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-30 inline-flex items-center gap-2 px-4 h-10 rounded-full bg-[#12357A] hover:bg-[#0B1B3D] text-white text-xs font-black shadow-lg border border-blue-400/40 transition active:scale-95 cursor-pointer"
    >
      <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
      <span>{label}</span>
    </button>
  );
}
