import React from "react";
import {
  Star, Clock, ShoppingCart, Check,
  Package, Layers, Blocks, Paintbrush, Grid3x3,
  type LucideIcon,
} from "lucide-react";
import { type Product } from "@/components/ProductCard";
import { QuantityStepper } from "@/components/QuantityStepper";

const BRAND_DARK = "#1b4366";
const BLINKIT_GREEN = "#0c831f";

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

/* Pull up to 3 short spec/tag pills from a product for the card chips row. */
function buildPills(product: Product): string[] {
  const pills: string[] = [];
  if (product.tag) pills.push(product.tag);
  const wanted = ["Grade / Type", "Pack Size", "Yield Strength", "Technology", "Process", "Coverage"];
  for (const s of product.specs ?? []) {
    if (wanted.includes(s.label) && s.value) pills.push(s.value);
  }
  return Array.from(new Set(pills)).slice(0, 3);
}

export type CompactProductCardProps = {
  product: Product;
  /** Add this product to the cart (does NOT open the detail sheet). */
  onAdd?: (product: Product) => void;
  /** Set the cart quantity for this product (enables the −/+ stepper). */
  onSetQty?: (product: Product, qty: number) => void;
  /** Tapping the image / title opens the shared product detail sheet. */
  onOpenDetail?: (product: Product) => void;
  /** Quantity already in cart (renders a count instead of "ADD"). */
  cartQty?: number;
  isAdding?: boolean;
};

/**
 * CompactProductCard — Blinkit category-grid card (2-column, mobile-first):
 * square product image (tap → detail sheet), unit pill + outline-green ADD
 * straddling the image base, blue "₹X OFF", bold price + struck-through MRP,
 * 2-line title, spec/tag pills, star rating + reviews and a delivery ETA.
 */
export function CompactProductCard({
  product,
  onAdd,
  onSetQty,
  onOpenDetail,
  cartQty = 0,
  isAdding = false,
}: CompactProductCardProps) {
  const { image, title, materialTag, price, mrp, rating, reviews, deliveryEta, unit } = product;
  const off = mrp > price ? mrp - price : 0;
  const discountPct = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const [imgError, setImgError] = React.useState(false);
  React.useEffect(() => { setImgError(false); }, [image]);
  const showImage = Boolean(image) && !imgError;
  const MaterialIcon = materialIcon(materialTag);
  const pills = buildPills(product);
  const openDetail = () => onOpenDetail?.(product);

  return (
    <div
      className="bg-white rounded-2xl flex flex-col"
      style={{ border: "1px solid #eef2f6", boxShadow: "0 1px 5px rgba(15,23,42,0.05)" }}
    >
      {/* Image + ADD/unit overlay */}
      <div className="relative px-2 pt-2">
        <button
          type="button"
          onClick={openDetail}
          aria-label={`View ${title}`}
          className="block w-full aspect-square rounded-xl bg-slate-50 overflow-hidden"
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
            <span className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-slate-100 px-2">
              <MaterialIcon size={34} className="text-slate-400" strokeWidth={1.5} />
              <span className="text-[10px] font-medium text-slate-500 text-center line-clamp-2">{title}</span>
            </span>
          )}
        </button>

        {/* Unit pill — bottom-left, straddling the image base */}
        {unit && (
          <span className="absolute left-3 -bottom-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-slate-600 shadow-sm ring-1 ring-slate-100">
            {unit}
          </span>
        )}

        {/* ADD button / −qty+ stepper — bottom-right, straddling the image base */}
        {onSetQty ? (
          <div className="absolute right-3 -bottom-2 shadow-sm rounded-lg">
            <QuantityStepper
              qty={cartQty}
              onChange={(q) => onSetQty(product, q)}
              isBusy={isAdding}
              size="sm"
              className="min-w-[68px]"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onAdd?.(product); }}
            disabled={isAdding}
            className="absolute right-3 -bottom-2 min-w-[68px] flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-white font-black text-[12px] shadow-sm active:scale-95 transition disabled:opacity-60"
            style={{ color: BLINKIT_GREEN, border: `1.5px solid ${BLINKIT_GREEN}` }}
          >
            {cartQty > 0 ? (
              <><Check className="w-3.5 h-3.5" strokeWidth={3} />{cartQty}</>
            ) : (
              <><ShoppingCart className="w-3.5 h-3.5" strokeWidth={2.4} />ADD</>
            )}
          </button>
        )}
      </div>

      {/* Details */}
      <div className="px-2.5 pt-3.5 pb-2.5 flex flex-col gap-1">
        {off > 0 && (
          <span className="text-[12px] font-black" style={{ color: "#256fef" }}>
            ₹{off.toLocaleString("en-IN")} OFF
          </span>
        )}

        <div className="flex items-baseline flex-wrap gap-x-1.5">
          <span className="text-[16px] font-black text-slate-900 tracking-tight">
            ₹{price.toLocaleString("en-IN")}
          </span>
          {off > 0 && (
            <span className="text-[11px] text-slate-400 line-through">
              ₹{mrp.toLocaleString("en-IN")}
            </span>
          )}
          {discountPct > 0 && (
            <span className="text-[11px] font-bold" style={{ color: BLINKIT_GREEN }}>{discountPct}%</span>
          )}
        </div>

        <h3
          className="font-bold text-slate-900 text-[13px] leading-snug line-clamp-2 cursor-pointer"
          onClick={openDetail}
        >
          {title}
        </h3>

        {pills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {pills.map((p, i) => (
              <span
                key={`${p}-${i}`}
                className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 leading-none"
              >
                {p}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[11px] font-black text-slate-700 tabular-nums">{rating.toFixed(1)}</span>
          <Star className="w-3 h-3 text-amber-400" fill="currentColor" strokeWidth={0} />
          <span className="text-[10px] font-semibold text-slate-400">({reviews.toLocaleString("en-IN")})</span>
        </div>

        <div className="flex items-center gap-1 mt-0.5 text-slate-500">
          <Clock className="w-3 h-3 shrink-0" strokeWidth={2.4} style={{ color: BRAND_DARK }} />
          <span className="text-[10px] font-semibold text-slate-600 truncate">{deliveryEta}</span>
        </div>
      </div>
    </div>
  );
}
