import React from "react";
import { ShoppingBag, Tractor } from "lucide-react";

export type ToolAcquireMode = "BUY" | "RENT";

export function BuyOrRentBadge({
  buyPrice,
  rentPricePerDay,
  mode,
  onChangeMode,
  compact = false,
}: {
  buyPrice: number;
  rentPricePerDay?: number;
  mode: ToolAcquireMode;
  onChangeMode: (next: ToolAcquireMode) => void;
  compact?: boolean;
}) {
  if (!rentPricePerDay || rentPricePerDay <= 0) return null;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`inline-grid grid-cols-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-0.5 w-full ${
        compact ? "mt-2" : "mt-2.5"
      }`}
    >
      <button
        type="button"
        onClick={() => onChangeMode("BUY")}
        className={`flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg text-[10px] font-black transition cursor-pointer ${
          mode === "BUY"
            ? "bg-[#12357A] text-white shadow-2xs"
            : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
        }`}
      >
        <ShoppingBag className="w-2.5 h-2.5 shrink-0" />
        <span className="truncate">Buy ₹{buyPrice.toLocaleString("en-IN")}</span>
      </button>

      <button
        type="button"
        onClick={() => onChangeMode("RENT")}
        className={`flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg text-[10px] font-black transition cursor-pointer ${
          mode === "RENT"
            ? "bg-amber-400 text-slate-950 shadow-2xs"
            : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
        }`}
      >
        <Tractor className="w-2.5 h-2.5 shrink-0" />
        <span className="truncate">Rent ₹{rentPricePerDay}/d</span>
      </button>
    </div>
  );
}
