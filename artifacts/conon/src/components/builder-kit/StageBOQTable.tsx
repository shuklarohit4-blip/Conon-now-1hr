import React from "react";
import {
  Truck,
  CheckSquare,
  Square,
  Plus,
  Minus,
  Sparkles,
  Info,
  Clock,
  ShieldAlert,
} from "lucide-react";
import type { BOQLineItem } from "@/lib/builderKitEngine";
import { resolveProductImage } from "@/lib/productImages";

interface StageBOQTableProps {
  items: BOQLineItem[];
  onToggleItem: (itemId: string) => void;
  onUpdateQty: (itemId: string, newQty: number) => void;
  onToggleAll: (selectAll: boolean) => void;
}

export function StageBOQTable({
  items,
  onToggleItem,
  onUpdateQty,
  onToggleAll,
}: StageBOQTableProps) {
  const allSelected = items.length > 0 && items.every((i) => i.selected);

  const getVehicleBadge = (vType: BOQLineItem["deliveryVehicleType"]) => {
    switch (vType) {
      case "2W_BIKE":
        return { label: "⚡ 60-Min 2-Wheeler", bg: "bg-blue-50 text-blue-700 border-blue-200" };
      case "3W_ELECTRIC_LOADER":
        return { label: "🔋 E-Loader (500kg)", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "4W_PICKUP":
        return { label: "🛻 Pickup Truck (1.5T)", bg: "bg-amber-50 text-amber-800 border-amber-200" };
      case "HEAVY_TRUCK":
        return { label: "🚜 Trolley / Heavy Dumper", bg: "bg-purple-50 text-purple-700 border-purple-200" };
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Header with Select All & Bulk Stats */}
      <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onToggleAll(!allSelected)}
          className="flex items-center gap-2 text-xs font-bold text-slate-800 hover:text-slate-950 transition"
        >
          {allSelected ? (
            <CheckSquare className="w-4 h-4 text-emerald-600" />
          ) : (
            <Square className="w-4 h-4 text-slate-400" />
          )}
          <span>Select All Items in this Stage ({items.length})</span>
        </button>

        <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
          Tweak quantities freely to customize your site order
        </span>
      </div>

      {/* Items List */}
      <div className="divide-y divide-slate-100">
        {items.map((item) => {
          const vehicle = getVehicleBadge(item.deliveryVehicleType);
          const resolvedImg = resolveProductImage(item.categorySlug, item.title);

          return (
            <div
              key={item.id}
              className={`p-4 transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                item.selected ? "bg-white hover:bg-slate-50/50" : "bg-slate-50/40 opacity-60"
              }`}
            >
              {/* Left Column: Checkbox, Thumbnail, Title, Brand & Civil Formula Note */}
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => onToggleItem(item.id)}
                  className="mt-1 text-slate-400 hover:text-emerald-600 transition shrink-0"
                >
                  {item.selected ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                {/* Product Thumbnail */}
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 p-1.5 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                  <img
                    src={item.thumbnail || resolvedImg}
                    alt={item.title}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = resolvedImg;
                    }}
                  />
                </div>

                {/* Info & Civil Engineering Formulas */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {item.brand}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${vehicle.bg}`}>
                      {vehicle.label}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      GST {item.gstPercent}%
                    </span>
                    {item.wastagePercent && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        +{item.wastagePercent}% Wastage
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                    {item.title}
                  </h4>

                  {/* Civil Engineering Note Callout */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1 font-medium">
                    <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">{item.civilNote}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Quantity Stepper, Unit Rate, and Line Total */}
              <div className="flex items-center justify-between md:justify-end gap-6 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                {/* Quantity Stepper */}
                <div className="flex flex-col items-start md:items-end">
                  <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                    Quantity ({item.unit})
                  </span>
                  <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-0.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => onUpdateQty(item.id, Math.max(1, item.quantity - (item.unit === "CFT" || item.unit === "Kg" ? 50 : 1)))}
                      className="w-7 h-7 rounded-lg bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-center font-bold text-sm shadow-2xs transition active:scale-95"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => onUpdateQty(item.id, Math.max(1, Number(e.target.value) || 1))}
                      className="w-14 text-center text-xs font-black bg-transparent text-slate-900 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => onUpdateQty(item.id, item.quantity + (item.unit === "CFT" || item.unit === "Kg" ? 50 : 1))}
                      className="w-7 h-7 rounded-lg bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-center font-bold text-sm shadow-2xs transition active:scale-95"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Rates & Line Total */}
                <div className="text-right min-w-[100px]">
                  <span className="text-[10px] text-slate-400 font-bold block">
                    ₹{item.sellingPrice.toLocaleString("en-IN")}/{item.unit}
                  </span>
                  <span className="text-base font-black text-slate-900 block leading-tight mt-0.5">
                    ₹{item.lineTotal.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    Base: ₹{item.preGstBase.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
