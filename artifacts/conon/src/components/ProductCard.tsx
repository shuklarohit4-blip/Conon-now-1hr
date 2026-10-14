import React from "react";
import {
  Box, Star, Truck, ShoppingCart, ChevronRight, Check,
  Package, Layers, Blocks, Paintbrush, Grid3x3,
  type LucideIcon,
} from "lucide-react";
import { QuantityStepper } from "./QuantityStepper";

/* CONON brand tokens (kept local so the card is fully reusable). */
const BRAND_DARK = "#1b4366";
const BLINKIT_GREEN = "#0c831f";

/* Category-relevant fallback icons — used when a product has no reliable
   image, so hardware never shows irrelevant stock photos (e.g. a person). */
const MATERIAL_ICONS: Record<string, LucideIcon> = {
  cement: Package,
  steel: Layers,
  "tmt steel": Layers,
  bricks: Blocks,
  sand: Package,
  aggregate: Package,
  paint: Paintbrush,
  tiles: Grid3x3,
};
function materialIcon(tag: string): LucideIcon {
  return MATERIAL_ICONS[(tag || "").trim().toLowerCase()] ?? Package;
}

export type ProductSpec = { label: string; value: string };

export type Product = {
  id: string;
  /** Hero image url (full-width, ~4:3). Optional — falls back to a premium icon block. */
  image?: string;
  /** Tag shown above the title in light grey. */
  tag?: "Sponsored" | "Conon Assured" | string;
  /** Material badge under the title, e.g. "Cement", "TMT Steel". */
  materialTag: string;
  /** 2–3 line product title. */
  title: string;
  /** Average rating, 0–5 (supports halves, e.g. 4.5). */
  rating: number;
  /** Total review count. */
  reviews: number;
  /** Current selling price (₹). */
  price: number;
  /** MRP / list price (₹) — struck through. */
  mrp: number;
  /** Optional bank / khata offer price (₹) shown in the green highlight. */
  bankOfferPrice?: number;
  /** Label for the bank/khata offer, e.g. "Conon Khata or HDFC Bank". */
  bankOfferLabel?: string;
  /** Bold delivery promise, e.g. "Today, 2:00 PM (1-Hour)". */
  deliveryEta: string;
  /** Subtle service sub-text, e.g. "Free Unloading / Labour". */
  service?: string;
  /** "+2 other sizes/grades" style link. */
  variantsLabel?: string;
  /** Selling unit, e.g. "50kg bag". */
  unit?: string;
  /** Vendor / brand for cart attribution. */
  vendor?: string;
  /** Explicit brand name shown in the detail sheet (falls back to vendor). */
  brand?: string;
  /** Gallery of images shown in the product detail sheet (first = hero). */
  images?: string[];
  /** Key highlights / feature bullets shown in the product detail sheet. */
  features?: string[];
  /** Technical specifications shown in the product detail sheet. */
  specs?: ProductSpec[];
  /** Long-form description shown in the product detail sheet. */
  description?: string;
  /** When true the primary CTA becomes "See options" instead of "Add to cart". */
  hasOptions?: boolean;
};

/* ── Star rating row (accurate half-stars via clipped overlay) ───────── */
function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[13px] font-black text-slate-700 tabular-nums">{rating.toFixed(1)}</span>
      <span className="relative inline-flex" aria-label={`${rating} out of 5 stars`}>
        <span className="flex">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={`bg-${i}`} className="w-3.5 h-3.5 text-slate-300" fill="currentColor" strokeWidth={0} />
          ))}
        </span>
        <span className="absolute inset-0 flex overflow-hidden" style={{ width: `${pct}%` }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={`fg-${i}`} className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="currentColor" strokeWidth={0} />
          ))}
        </span>
      </span>
      <span className="text-[12px] font-semibold text-sky-700">({reviews.toLocaleString("en-IN")})</span>
    </div>
  );
}

export type ProductCardProps = {
  product: Product;
  /** Called for the "Add to cart" CTA. */
  onAddToCart?: (product: Product) => void;
  /** Set the cart quantity (enables the −/+ stepper instead of a plain ADD). */
  onSetQty?: (product: Product, qty: number) => void;
  /** Called for the "See options" CTA (variation products). */
  onSeeOptions?: (product: Product) => void;
  /** Tapping the "+N other sizes/grades" link. */
  onVariants?: (product: Product) => void;
  /** Tapping the circular AR / 3D view button on the image. */
  onArView?: (product: Product) => void;
  /** Tapping the image or title — opens the product detail bottom sheet. */
  onOpenDetail?: (product: Product) => void;
  /** Quantity already in cart (renders a count instead of disabling). */
  cartQty?: number;
  /** Disables the CTA while a mutation is in flight. */
  isAdding?: boolean;
};

/**
 * ProductCard — premium, mobile-first product card (Blinkit-style):
 * top-left discount badge, tappable image/title that opens the detail
 * sheet, spec pills, star rating, bold pricing with strikethrough MRP,
 * bank/khata offer, delivery ETA and an outline green ADD button that
 * adds to cart WITHOUT opening the sheet.
 */
export function ProductCard({
  product,
  onAddToCart,
  onSetQty,
  onSeeOptions,
  onVariants,
  onArView,
  onOpenDetail,
  cartQty = 0,
  isAdding = false,
}: ProductCardProps) {
  const {
    image, tag, materialTag, title, rating, reviews,
    price, mrp, bankOfferPrice, bankOfferLabel,
    deliveryEta, service, variantsLabel, unit, hasOptions,
  } = product;

  const discountPct = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const [imgError, setImgError] = React.useState(false);
  React.useEffect(() => { setImgError(false); }, [image]);
  const MaterialIcon = materialIcon(materialTag);
  const showImage = Boolean(image) && !imgError;
  const openDetail = () => onOpenDetail?.(product);

  return (
    <div
      className="bg-white rounded-3xl overflow-hidden"
      style={{ border: "1px solid #eef2f6", boxShadow: "0 1px 6px rgba(15,23,42,0.06)" }}
    >
      {/* 1 ── Product image + overlays (tap → detail sheet) ─────────── */}
      <div
        className="relative w-full aspect-[4/3] bg-slate-50 cursor-pointer"
        role={onOpenDetail ? "button" : undefined}
        onClick={onOpenDetail ? openDetail : undefined}
      >
        {showImage ? (
          <img
            src={image}
            alt={title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          /* Premium minimal fallback — soft slate block, category-relevant
             Lucide icon and the product title. Never irrelevant humans. */
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-slate-100 px-2">
            <MaterialIcon size={40} className="text-slate-400" strokeWidth={1.5} />
            <span className="text-xs font-medium text-slate-500 text-center line-clamp-2">
              {title}
            </span>
          </div>
        )}

        {/* Top-left discount badge */}
        {discountPct > 0 && (
          <div className="absolute top-0 left-3 flex flex-col items-center">
            <span
              className="px-2 pt-1 pb-1.5 text-[11px] font-black text-white leading-none rounded-b-md"
              style={{ background: "#256fef", boxShadow: "0 2px 6px rgba(37,111,239,0.4)" }}
            >
              {discountPct}%<br />OFF
            </span>
          </div>
        )}

        {/* AR / 3D view — circular icon, bottom-left of the image */}
        <button
          type="button"
          aria-label="View in AR / 3D"
          onClick={(e) => { e.stopPropagation(); onArView?.(product); }}
          className="absolute bottom-2.5 left-2.5 w-9 h-9 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-md ring-1 ring-black/5 active:scale-90 transition"
        >
          <Box className="w-[18px] h-[18px]" style={{ color: BRAND_DARK }} strokeWidth={2.4} />
        </button>
      </div>

      <div className="p-4">
        {/* "+2 other sizes/grades" link */}
        {variantsLabel && (
          <button
            type="button"
            onClick={() => onVariants?.(product)}
            className="text-[12px] font-bold text-sky-700 hover:underline active:opacity-70 mb-1.5"
          >
            {variantsLabel}
          </button>
        )}

        {/* 2 ── Tag + title (tap → detail) + spec pills ─────────────── */}
        {tag && (
          <p className="text-[11px] font-semibold text-slate-400 mb-0.5">{tag}</p>
        )}
        <h3
          className="font-bold text-slate-900 text-[16px] leading-snug line-clamp-2 cursor-pointer"
          onClick={onOpenDetail ? openDetail : undefined}
        >
          {title}
        </h3>
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <span
            className="inline-flex items-center text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md"
            style={{ background: "#eef4f9", color: BRAND_DARK }}
          >
            {materialTag}
          </span>
          {unit && (
            <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
              {unit}
            </span>
          )}
        </div>

        {/* 3 ── Ratings & reviews ──────────────────────────────────── */}
        <div className="mt-2.5">
          <StarRating rating={rating} reviews={reviews} />
        </div>

        {/* 4 ── Pricing & offers ───────────────────────────────────── */}
        <div className="mt-2.5 flex items-baseline flex-wrap gap-x-2 gap-y-1">
          <span className="text-[28px] font-black leading-none text-slate-900 tracking-tight">
            ₹{price.toLocaleString("en-IN")}
          </span>
          <span className="text-[12px] text-slate-400">
            M.R.P: <span className="line-through">₹{mrp.toLocaleString("en-IN")}</span>
          </span>
          {discountPct > 0 && (
            <span className="text-[12px] font-bold" style={{ color: BLINKIT_GREEN }}>({discountPct}% off)</span>
          )}
        </div>

        {bankOfferPrice && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 bg-emerald-50 border border-emerald-200">
            <span className="text-[13px] font-black text-emerald-700">
              Buy for ₹{bankOfferPrice.toLocaleString("en-IN")}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600">
              with {bankOfferLabel}
            </span>
          </div>
        )}

        {/* 5 ── Delivery ETA & services ────────────────────────────── */}
        <div className="mt-3 flex items-start gap-2">
          <Truck className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" strokeWidth={2.2} />
          <div className="leading-tight">
            <p className="text-[13px] text-slate-700">
              FREE delivery as soon as{" "}
              <span className="font-black text-slate-900">{deliveryEta}</span>
            </p>
            {service && (
              <p className="text-[11px] text-slate-400 mt-0.5">Service: {service}</p>
            )}
          </div>
        </div>

        {/* 6 ── Action button ──────────────────────────────────────── */}
        {onSetQty ? (
          <div className="mt-3.5">
            <QuantityStepper
              qty={cartQty}
              onChange={(q) => onSetQty(product, q)}
              isBusy={isAdding}
              size="lg"
              fullWidth
            />
            {hasOptions && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onSeeOptions?.(product); }}
                className="mt-2 w-full flex items-center justify-center gap-1 py-2 rounded-xl bg-white text-slate-700 font-bold text-[13px] border border-slate-200 active:scale-[0.98] transition"
              >
                See options
                <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.6} />
              </button>
            )}
          </div>
        ) : hasOptions ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onSeeOptions?.(product); }}
            className="mt-3.5 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-slate-900 font-black text-[15px] border border-slate-900/80 active:scale-[0.98] transition"
          >
            See options
            <ChevronRight className="w-4 h-4" strokeWidth={2.6} />
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onAddToCart?.(product); }}
            disabled={isAdding}
            className="mt-3.5 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white font-black text-[15px] active:scale-[0.98] transition disabled:opacity-60"
            style={{ color: BLINKIT_GREEN, border: `1.5px solid ${BLINKIT_GREEN}` }}
          >
            {cartQty > 0 ? (
              <><Check className="w-[18px] h-[18px]" strokeWidth={3} />{`${cartQty} in cart · ADD MORE`}</>
            ) : (
              <><ShoppingCart className="w-[18px] h-[18px]" strokeWidth={2.4} />ADD</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
