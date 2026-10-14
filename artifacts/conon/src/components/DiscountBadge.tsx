import React from "react";

type DiscountBadgeProps = {
  /** Either show flat-rupee off ("flat") or a percentage saved ("percent"). */
  type?: "flat" | "percent";
  /** The number to display: ₹{value} OFF for "flat", {value}% SAVED for "percent". */
  value: number;
  /** Optional size: small badges are useful on tile thumbnails, default sits on list cards. */
  size?: "sm" | "md";
  /** Tailwind className overrides — usually used to set absolute position on the parent image. */
  className?: string;
};

/**
 * DiscountBadge — small curved promo flag for the top-left corner of product images.
 *
 * Usage:
 *   <div className="relative">
 *     <img ... />
 *     <DiscountBadge type="flat"    value={50} />
 *     <DiscountBadge type="percent" value={15} />
 *   </div>
 */
export function DiscountBadge({
  type = "flat",
  value,
  size = "md",
  className = "",
}: DiscountBadgeProps) {
  const text = type === "flat" ? `₹${value} OFF` : `${value}% SAVED`;

  const sizing =
    size === "sm"
      ? "px-1.5 py-[3px] text-[10px] leading-none"
      : "px-2.5 py-1 text-[11px] leading-none";

  return (
    <span
      aria-label={`Discount: ${text}`}
      className={`absolute top-1.5 left-1.5 z-10 inline-flex items-center justify-center font-black uppercase tracking-wider text-white rounded-tl-md rounded-tr-xl rounded-br-xl rounded-bl-2xl shadow-[0_2px_4px_rgba(0,0,0,0.25)] ring-1 ring-white/60 select-none pointer-events-none whitespace-nowrap ${sizing} ${className}`}
      style={{
        background: "linear-gradient(135deg, #1EBE5D 0%, #15803D 100%)",
        textShadow: "0 1px 2px rgba(0,0,0,0.45)",
        fontFamily:
          "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {text}
    </span>
  );
}

/** Deterministic helper: derive a fake discount from a material id + price.
 *  Returns null for items that shouldn't display a badge (so it's not on every card). */
export function deriveDiscount(
  id: string,
  price: number,
): { type: "flat" | "percent"; value: number } | null {
  if (!id) return null;
  // Hash the id to get a stable bucket 0–9 per material
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const bucket = h % 10;
  // Show a badge ~60% of the time
  if (bucket > 5) return null;
  // Higher-priced items get % off, cheaper items get ₹ off
  if (price >= 500) {
    const pct = [10, 12, 15, 20][bucket % 4];
    return { type: "percent", value: pct };
  }
  const flat = [25, 30, 50, 75][bucket % 4];
  return { type: "flat", value: flat };
}

export default DiscountBadge;
