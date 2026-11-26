import React, { useState, useEffect } from "react";
import { ShieldCheck } from "lucide-react";
import {
  useProductMedia,
  type ProductMediaHookResult,
} from "@/context/ProductMediaVaultContext";
import { isLegacyBrokenImageUrl, resolveVaultAssetUrl } from "@/services/productMediaVault";

export { useProductMedia, type ProductMediaHookResult };

export interface CononProductMediaProps {
  product?: Record<string, any> | null;
  /** Direct images array override (e.g. unsaved live preview in Admin Media Vault) */
  images?: Array<{ url: string; caption?: string; fallbackDataUrl?: string }>;
  itemId?: string;
  slug?: string;
  src?: string;
  alt?: string;
  title?: string;
  brand?: string;
  category?: string;
  categorySlug?: string;
  unit?: string;
  spec?: string;
  grade?: string;
  mediaType?: "product" | "service" | "rental";
  variant?: "card" | "detail" | "tile" | "thumb" | "cover" | "banner" | "modal";
  showGalleryBadge?: boolean;
  isDark?: boolean;
  className?: string;
  containerClassName?: string;
  loading?: "lazy" | "eager";
  onClick?: (e?: React.MouseEvent) => void;
}

/**
 * Extracts crisp technical grade/size typography for Clean Brand Spec Card when no photo exists yet.
 */
function extractSpecHeadline(
  title: string,
  unit?: string,
  spec?: string,
  grade?: string
): string {
  if (grade && grade.trim()) return grade.trim();
  if (spec && spec.trim()) return spec.trim();

  // Extract common civil/hardware spec tokens cleanly (e.g. 50 Kg, 12mm, 1/2", SDR-11, 20L, BWP 710, Fe550D)
  const specPatterns =
    title.match(
      /(\b\d+(?:\.\d+)?\s?(?:mm|cm|m|ft|kg|Kg|g|L|ltr|Litre|W|kW|kVA|MP|HP|Ton|Sq\.?mm|inch|"|')+\b|\b(?:OPC\s?\d+|PPC|Fe\s?\d+D?|SDR[-\s]?\d+|BWP\s?\d+|BWR|MR|GVT|PGVT|IP\d+|CAT6|PoE|4K|HD)\b)/gi
    ) || [];

  const tokens = Array.from(new Set(specPatterns.map((t) => t.trim()))).slice(0, 2);
  if (tokens.length > 0 && unit && !tokens.join(" ").toLowerCase().includes(unit.toLowerCase())) {
    return `${tokens.join(" · ")} · ${unit}`;
  }
  if (tokens.length > 0) return tokens.join(" · ");
  if (unit && unit.trim() && unit.trim().toLowerCase() !== "unit") return unit.trim();

  const words = title.replace(/\s+/g, " ").trim().split(" ");
  return words.slice(0, 4).join(" ");
}

function brandMonogram(brand: string): string {
  const parts = brand
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0] || "CN").slice(0, 2).toUpperCase();
}

/**
 * CononProductMedia — The ONE Single Source of Truth UI Component across ALL 16 Categories,
 * Services, Heavy Rentals, Search, Cart, Orders & Vendor Panel.
 *
 * - Has Real Photos (1–6 in REAL_MEDIA_MANIFEST): renders crisp studio stage with `📷 N Photos` pill & hover dots.
 * - Has 0 Real Photos Yet (Clean Post-Wipe State): renders the Clean Brand Spec Card (NO broken `<img>`, NO SVG cartoons).
 */
export function CononProductMedia({
  product,
  images: directImages,
  itemId,
  slug,
  src,
  alt,
  title,
  brand,
  category,
  categorySlug,
  unit,
  spec,
  grade,
  mediaType = "product",
  variant = "card",
  showGalleryBadge = true,
  isDark = false,
  className,
  containerClassName,
  loading = "lazy",
  onClick,
}: CononProductMediaProps) {
  const compositeInput = product || {
    id: itemId || slug,
    slug: slug || itemId,
    title: title || alt,
    brand,
    category: category || categorySlug,
    categorySlug: categorySlug || category,
    unit,
    spec,
    grade,
    image: src && !isLegacyBrokenImageUrl(src) ? src : "",
  };

  const resolvedMedia = useProductMedia(compositeInput);

  // Merge directImages if passed explicitly (e.g. Admin Media Vault Live Preview before disk save)
  const effectiveImages =
    Array.isArray(directImages) && directImages.length > 0
      ? directImages
          .map((im) => ({
            url: resolveVaultAssetUrl(im.url, im.fallbackDataUrl),
            caption: im.caption,
            fallbackDataUrl: im.fallbackDataUrl,
          }))
          .filter((im) => Boolean(im.url))
      : resolvedMedia.images;

  const hasPhotos = effectiveImages.length > 0;
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [imgFailed, setImgFailed] = useState(false);

  const primaryUrl = effectiveImages[0]?.url || "";
  const activeEntry = effectiveImages[activeSlideIdx] || effectiveImages[0];

  useEffect(() => {
    setActiveSlideIdx(0);
    setImgFailed(false);
  }, [primaryUrl, itemId, slug, title, resolvedMedia.version]);

  const displayTitle = String(
    title || alt || resolvedMedia.resolvedTitle || product?.tradeName || product?.modelName || "Verified Material"
  );
  const displayBrand = String(
    brand || resolvedMedia.resolvedBrand || product?.machineName || "CONON CERTIFIED"
  );
  const displayUnit = String(unit || resolvedMedia.override?.unit || product?.unit || "");
  const displaySpec = extractSpecHeadline(
    displayTitle,
    displayUnit,
    spec || product?.capacitySpec || product?.spec,
    grade || product?.grade || product?.type
  );

  // Variant container classes
  let defaultContainer =
    "relative w-full h-full flex items-center justify-center overflow-hidden bg-[#F8FAFC]";
  let defaultImg =
    "w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105";

  if (variant === "thumb") {
    defaultContainer =
      "relative w-full h-full rounded-xl flex items-center justify-center overflow-hidden bg-[#F8FAFC] shrink-0";
    defaultImg = "w-full h-full object-contain p-1";
  } else if (variant === "modal" || variant === "detail") {
    defaultContainer =
      "relative w-full h-full flex items-center justify-center overflow-hidden bg-[#F8FAFC] rounded-2xl";
    defaultImg = "max-h-full max-w-full object-contain p-4 transition-transform duration-300";
  } else if (variant === "cover" || variant === "banner") {
    defaultContainer =
      "relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-100";
    defaultImg =
      "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105";
  } else if (variant === "tile") {
    defaultContainer =
      "relative w-full aspect-square flex items-center justify-center overflow-hidden bg-[#F8FAFC] rounded-2xl";
    defaultImg =
      "w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105";
  }

  // ── RENDER REAL STUDIO PHOTOGRAPH(S) ─────────────────────────────────────────
  if (hasPhotos && activeEntry?.url && !imgFailed) {
    return (
      <div
        className={containerClassName || defaultContainer}
        onClick={onClick}
        role={onClick ? "button" : undefined}
        onMouseLeave={() => {
          if (activeSlideIdx !== 0) setActiveSlideIdx(0);
        }}
      >
        <img
          src={activeEntry.url}
          alt={activeEntry.caption ? `${displayTitle} - ${activeEntry.caption}` : displayTitle}
          loading={loading}
          decoding="async"
          onError={(e) => {
            const fb = activeEntry.fallbackDataUrl;
            if (fb && e.currentTarget.src !== fb) {
              e.currentTarget.src = fb;
              return;
            }
            setImgFailed(true);
          }}
          className={className || defaultImg}
        />

        {/* Multi-image badge & hover dot indicators on card/tile/cover views */}
        {effectiveImages.length > 1 &&
          showGalleryBadge &&
          variant !== "thumb" &&
          variant !== "detail" &&
          variant !== "modal" && (
            <>
              <span className="pointer-events-none absolute top-1.5 right-1.5 z-10 inline-flex items-center gap-1 rounded-full bg-slate-900/75 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-xs shadow-xs">
                <span aria-hidden="true">📷</span>
                <span>{effectiveImages.length} Photos</span>
              </span>
              <div className="absolute bottom-1.5 inset-x-0 z-10 flex items-center justify-center gap-1 opacity-85 group-hover:opacity-100 transition-opacity">
                {effectiveImages.slice(0, 6).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Preview photo ${idx + 1}`}
                    onMouseEnter={() => setActiveSlideIdx(idx)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSlideIdx(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === activeSlideIdx
                        ? "w-3.5 bg-slate-900 shadow-2xs"
                        : "w-1.5 bg-slate-400/70 hover:bg-slate-600"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
      </div>
    );
  }

  // ── RENDER CLEAN BRAND SPEC CARD (Zero Real Photos Yet — Zero Broken Images, Zero SVG) ─
  const specBackdropCls = isDark
    ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 border border-slate-700/70"
    : "bg-gradient-to-br from-slate-50 via-[#F8FAFC] to-slate-100 text-slate-900 border border-slate-200/70";

  if (variant === "thumb") {
    return (
      <div
        className={
          containerClassName ||
          `relative w-full h-full rounded-xl flex flex-col items-center justify-center overflow-hidden p-1 select-none ${specBackdropCls}`
        }
        onClick={onClick}
        role={onClick ? "button" : undefined}
        title={`${displayBrand} · ${displayTitle}`}
      >
        <span
          className={`text-[10px] font-black tracking-wider px-1.5 py-0.5 rounded-md ${
            isDark ? "bg-slate-700 text-amber-300" : "bg-slate-200/80 text-slate-800"
          }`}
        >
          {brandMonogram(displayBrand)}
        </span>
      </div>
    );
  }

  const microLabel =
    mediaType === "rental"
      ? "VERIFIED FLEET UNIT"
      : mediaType === "service"
      ? "VERIFIED SITE CREW"
      : "CONON VERIFIED SKU";

  return (
    <div
      className={
        containerClassName ||
        `relative w-full h-full flex flex-col items-center justify-between text-center overflow-hidden select-none p-3 sm:p-3.5 ${specBackdropCls}`
      }
      onClick={onClick}
      role={onClick ? "button" : undefined}
      style={{
        backgroundImage: isDark
          ? "radial-gradient(rgba(148,163,184,0.12) 1px, transparent 1px)"
          : "radial-gradient(rgba(15,23,42,0.06) 1px, transparent 1px)",
        backgroundSize: "14px 14px",
      }}
    >
      {/* Top Brand Pill */}
      <div className="w-full flex items-center justify-center pt-0.5">
        <span
          className={`inline-block max-w-full truncate px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider border ${
            isDark
              ? "bg-slate-800/90 text-amber-300 border-slate-600/80"
              : "bg-white/95 text-slate-800 border-slate-200/90 shadow-2xs"
          }`}
        >
          {displayBrand}
        </span>
      </div>

      {/* Center Grade / Size Typography */}
      <div className="px-1.5 my-auto flex flex-col items-center justify-center">
        <p
          className={`font-black tracking-tight leading-snug line-clamp-2 ${
            variant === "detail" || variant === "modal"
              ? "text-base sm:text-lg"
              : "text-[11px] sm:text-[12.5px]"
          } ${isDark ? "text-white" : "text-slate-800"}`}
        >
          {displaySpec || displayTitle}
        </p>
        {variant === "detail" || variant === "modal" ? (
          <p className={`text-[11px] font-medium mt-1 line-clamp-2 max-w-[240px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {displayTitle}
          </p>
        ) : null}
      </div>

      {/* Bottom CONON VERIFIED SKU Micro-Badge */}
      <div className="w-full flex items-center justify-center pb-0.5">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest ${
            isDark
              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
          }`}
        >
          <ShieldCheck className="w-2.5 h-2.5 shrink-0" />
          <span>{microLabel}</span>
        </span>
      </div>
    </div>
  );
}

export default CononProductMedia;
