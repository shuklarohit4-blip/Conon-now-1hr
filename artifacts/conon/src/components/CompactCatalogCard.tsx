import React, { useState } from "react";
import { Star, Clock, RotateCcw, ChevronRight, Plus, Minus } from "lucide-react";
import { type Product } from "./ProductCard";

interface CompactCatalogCardProps {
  product: Product;
  cartQty?: number;
  onAdd: (product: Product) => void;
  onSetQty: (product: Product, qty: number) => void;
  onOpenDetail?: (product: Product) => void;
  onOpenVariants?: (product: Product) => void;
  optionsCount?: number;
  isPriceDrop?: boolean;
  lowReturnRate?: boolean;
  discoveryTag?: string;
  onDiscoveryClick?: (category: string) => void;
}

export const CompactCatalogCard: React.FC<CompactCatalogCardProps> = ({
  product,
  cartQty = 0,
  onAdd,
  onSetQty,
  onOpenDetail,
  onOpenVariants,
  optionsCount,
  isPriceDrop = false,
  lowReturnRate = false,
  discoveryTag,
  onDiscoveryClick,
}) => {
  const [imgError, setImgError] = useState(false);
  const [activeDot, setActiveDot] = useState(0);

  const price = product.price;
  const mrp = product.mrp > price ? product.mrp : Math.round(price * 1.15);
  const discountPct = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const discountAmount = mrp > price ? mrp - price : 0;

  // Extract up to 2 construction spec pills (e.g. OPC 53, ISI Marked, Weatherproof)
  const specPills = React.useMemo(() => {
    const list: string[] = [];
    if (product.specs) {
      for (const s of product.specs) {
        if (s.value && s.label !== "Category" && s.label !== "Brand" && s.label !== "Pack Size") {
          list.push(s.value);
        }
      }
    }
    // Fallback extracts from title or description
    if (list.length === 0) {
      const t = (product.title || "").toLowerCase();
      if (t.includes("53")) list.push("OPC 53");
      else if (t.includes("ppc")) list.push("PPC Grade");
      else if (t.includes("550")) list.push("Fe 550D");
      else if (t.includes("waterproof") || t.includes("weather")) list.push("Waterproof");
      else if (t.includes("bwp") || t.includes("710")) list.push("BWP 710");
      else if (t.includes("hydraulic") || t.includes("soft")) list.push("Soft Close");
      else if (t.includes("luxury") || t.includes("royale")) list.push("Sheen Finish");
      else if (t.includes("isi")) list.push("ISI Marked");
    }
    return list.slice(0, 2);
  }, [product.specs, product.title]);

  // Options count (variants)
  const hasMultipleOptions = (optionsCount && optionsCount > 1) || product.hasOptions;
  const effectiveOptionsCount = optionsCount || 2;

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasMultipleOptions && onOpenVariants) {
      onOpenVariants(product);
    } else {
      onAdd(product);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSetQty(product, cartQty + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSetQty(product, Math.max(0, cartQty - 1));
  };

  return (
    <div
      onClick={() => onOpenDetail?.(product)}
      className="flex flex-col justify-between select-none group min-w-0 w-full cursor-pointer"
    >
      {/* ────────────────────────────────────────────────────────────
          1. PRODUCT IMAGE FRAME (Square with soft background)
          ──────────────────────────────────────────────────────────── */}
      <div className="relative aspect-square w-full rounded-xl bg-[#F6F8FB] border border-black/[0.04] overflow-hidden p-2 flex items-center justify-center transition-shadow group-hover:shadow-sm">
        {/* Optional Micro Badge Top-Left (Trending / Best Seller / etc.) */}
        {product.tag && (
          <span className="absolute top-1.5 left-1.5 z-10 text-[8.5px] font-bold text-[#D9385A] bg-white/95 backdrop-blur-xs px-1.5 py-0.5 rounded-md shadow-2xs leading-none">
            {product.tag}
          </span>
        )}

        {/* Local Verified Brand Packshot */}
        {!imgError && product.image ? (
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.06)] transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-xs">
            📦
          </div>
        )}

        {/* Bottom-Left Carousel 4-Dot Indicator */}
        <div className="absolute bottom-1.5 left-2 flex items-center gap-0.5 pointer-events-none">
          {[0, 1, 2, 3].map((dot) => (
            <span
              key={dot}
              className={`w-1 h-1 rounded-full transition-all ${
                activeDot === dot ? "bg-slate-600 scale-110" : "bg-slate-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────
          2. ACTION ROW: UNIT (Left) + ADD BUTTON (Right)
          ──────────────────────────────────────────────────────────── */}
      <div className="mt-1.5 flex items-center justify-between gap-1 min-w-0">
        {/* Pack Size / Unit text */}
        <span className="text-[10px] font-medium text-[#5C6370] truncate leading-tight flex-1">
          {product.unit || "1 unit"}
        </span>

        {/* Blinkit-Style ADD Button or Compact Stepper */}
        <div className="shrink-0 flex flex-col items-center">
          {cartQty <= 0 ? (
            <button
              onClick={handleActionClick}
              aria-label={`Add ${product.title} to cart`}
              className="border-[1.2px] border-[#0C831F] text-[#0C831F] bg-white hover:bg-[#F2FBF4] active:scale-95 font-black text-[11px] px-2.5 sm:px-3 py-1 rounded-lg shadow-2xs transition-all leading-none"
            >
              ADD
            </button>
          ) : (
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0C831F] text-white flex items-center rounded-lg shadow-2xs h-6 px-1"
            >
              <button
                onClick={handleDecrement}
                aria-label="Decrease quantity"
                className="w-5 h-full flex items-center justify-center active:scale-90 transition font-bold"
              >
                <Minus className="w-3 h-3 text-white" strokeWidth={3} />
              </button>
              <span className="text-[11px] font-black px-1 tabular-nums">
                {cartQty}
              </span>
              <button
                onClick={handleIncrement}
                aria-label="Increase quantity"
                className="w-5 h-full flex items-center justify-center active:scale-90 transition font-bold"
              >
                <Plus className="w-3 h-3 text-white" strokeWidth={3} />
              </button>
            </div>
          )}

          {/* Micro-caption underneath for multiple options */}
          {hasMultipleOptions && cartQty <= 0 && (
            <span className="text-[8.5px] text-[#0C831F] font-semibold text-center leading-none mt-0.5">
              {effectiveOptionsCount} options
            </span>
          )}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────
          3. PRICING & DISCOUNT HIERARCHY
          ──────────────────────────────────────────────────────────── */}
      <div className="mt-1 flex flex-col">
        {/* Row 1: Price + Strikethrough MRP OR Price Drop Badge */}
        {isPriceDrop ? (
          <div className="flex flex-col items-start gap-0.5">
            <div className="flex items-center gap-1">
              <span className="bg-[#FDE047] text-[#1A1A1A] px-1.5 py-0.5 rounded-md font-extrabold text-[12.5px] sm:text-[13px] tabular-nums leading-none">
                ₹{price.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-[#8C93A0] line-through tabular-nums">
                ₹{mrp.toLocaleString("en-IN")}
              </span>
            </div>
            <span className="text-[9.5px] font-bold text-[#1D5EDB] leading-tight">
              Price Drop
            </span>
          </div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-[12.5px] sm:text-[13px] font-extrabold text-[#1A1A1A] tabular-nums leading-snug">
              ₹{price.toLocaleString("en-IN")}
            </span>
            {mrp > price && (
              <span className="text-[10px] text-[#8C93A0] line-through tabular-nums leading-none">
                ₹{mrp.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        )}

        {/* Row 2: High-trust blue savings callout */}
        {!isPriceDrop && discountPct > 0 && (
          <span className="text-[9.5px] sm:text-[10px] font-bold text-[#1D5EDB] leading-tight mt-0.5 truncate">
            {discountPct >= 15 ? `${discountPct}% OFF on MRP` : `₹${discountAmount.toLocaleString("en-IN")} OFF`}
          </span>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────────
          4. TITLE & TECHNICAL SPEC MICRO-PILLS
          ──────────────────────────────────────────────────────────── */}
      <div className="mt-1 flex-1 flex flex-col justify-between">
        <div>
          {/* Product Name (3-line clamp for clean grid alignment) */}
          <h4
            className="text-[11px] sm:text-[11.5px] font-semibold text-[#1E232B] leading-[1.3] line-clamp-3"
            title={product.title}
          >
            {product.title}
          </h4>

          {/* Warm Cream Spec Chips */}
          {specPills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {specPills.map((pill, idx) => (
                <span
                  key={idx}
                  className="bg-[#FBF6E9] text-[#7A5C1E] border border-[#F1E4C3] text-[8.5px] sm:text-[9px] font-semibold px-1.5 py-0.5 rounded-[4px] truncate max-w-full leading-tight"
                >
                  {pill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ────────────────────────────────────────────────────────────
            5. SOCIAL PROOF (Ratings), ETA & DISCOVERY LINK
            ──────────────────────────────────────────────────────────── */}
        <div className="mt-1.5 pt-1 border-t border-slate-100 flex flex-col gap-1">
          {/* Ratings or Low Return Rate Trust Badge */}
          {lowReturnRate ? (
            <div className="flex items-center gap-1 text-[9px] font-semibold text-emerald-700">
              <RotateCcw className="w-2.5 h-2.5 text-emerald-600" />
              <span>Low return rate</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <div className="flex items-center text-[#F5B400]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-2.5 h-2.5 fill-current"
                    strokeWidth={0}
                  />
                ))}
              </div>
              <span className="text-[9.5px] text-[#767E8C] font-medium tabular-nums">
                {(product.reviews || 128).toLocaleString("en-IN")}
              </span>
            </div>
          )}

          {/* ETA */}
          <div className="flex items-center gap-1 text-[9.5px] text-[#5A6270] font-medium">
            <Clock className="w-2.5 h-2.5 text-slate-400" />
            <span>60 mins</span>
          </div>

          {/* Optional Discovery Chip on select/sponsored rows */}
          {discoveryTag && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDiscoveryClick?.(product.materialTag);
              }}
              className="bg-[#F2FBF4] hover:bg-[#E6F8EA] text-[#0C831F] border border-[#D4EED8] text-[9px] font-bold px-2 py-0.5 rounded-md inline-flex items-center justify-between gap-0.5 mt-0.5 w-full active:scale-95 transition"
            >
              <span className="truncate">{discoveryTag}</span>
              <ChevronRight className="w-3 h-3 shrink-0" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
