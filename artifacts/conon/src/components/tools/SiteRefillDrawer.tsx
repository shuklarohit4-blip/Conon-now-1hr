import React, { useMemo, useState } from "react";
import { X, Zap, Minus, Plus, ShoppingBag } from "lucide-react";
import {
  EMERGENCY_SITE_CONSUMABLE_IDS,
  TOOLS_HARDWARE_PRODUCTS,
  type ToolHardwareProduct,
} from "@/data/toolsHardwareCatalog";

export function SiteRefillDrawer({
  isOpen,
  onClose,
  onDispatchRefill,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDispatchRefill: (items: Array<{ product: ToolHardwareProduct; qty: number }>) => void;
}) {
  const refillItems = useMemo(
    () =>
      EMERGENCY_SITE_CONSUMABLE_IDS.map((id) =>
        TOOLS_HARDWARE_PRODUCTS.find((p) => p.id === id),
      ).filter((p): p is ToolHardwareProduct => Boolean(p)),
    [],
  );

  const [qtyMap, setQtyMap] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const id of EMERGENCY_SITE_CONSUMABLE_IDS.slice(0, 4)) {
      initial[id] = 1;
    }
    return initial;
  });

  const selectedEntries = useMemo(
    () =>
      refillItems
        .map((product) => ({ product, qty: qtyMap[product.id] || 0 }))
        .filter((e) => e.qty > 0),
    [refillItems, qtyMap],
  );

  const subtotal = useMemo(
    () => selectedEntries.reduce((s, e) => s + e.product.price * e.qty, 0),
    [selectedEntries],
  );

  const adjustQty = (id: string, delta: number) => {
    setQtyMap((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-700 w-full sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-5 py-4 text-white flex items-start justify-between gap-3 shrink-0"
          style={{ background: "linear-gradient(110deg, #0B1B3D 0%, #10244E 60%, #12357A 100%)" }}
        >
          <div>
            <span className="inline-flex items-center gap-1 text-[10.5px] font-black uppercase tracking-wider text-amber-300 bg-white/10 px-2.5 py-0.5 rounded-full">
              <Zap className="w-3 h-3" />
              2-Wheeler Bike Express • Mid-Day Breakdown Rescue
            </span>
            <h2 className="text-lg font-black mt-1">60-Min Emergency Blade &amp; Bit Refill</h2>
            <p className="text-xs text-slate-200">
              Urgent discs, SDS bits, drywall screws &amp; genuine Bosch carbon brushes.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Site Refill Drawer"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {refillItems.map((item) => {
            const qty = qtyMap[item.id] || 0;
            return (
              <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase text-[#12357A] dark:text-amber-300">
                      {item.brand}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.model}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {item.title}
                  </p>
                  <p className="text-[11px] font-black text-slate-700 dark:text-slate-300">
                    ₹{item.price.toLocaleString("en-IN")}{" "}
                    <span className="text-[10px] font-normal text-slate-400">/ {item.unit}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                  <button
                    type="button"
                    onClick={() => adjustQty(item.id, -1)}
                    aria-label={`Remove ${item.title}`}
                    className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-black min-w-[18px] text-center text-slate-900 dark:text-white">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => adjustQty(item.id, 1)}
                    aria-label={`Add ${item.title}`}
                    className="w-6 h-6 flex items-center justify-center rounded-lg bg-[#12357A] text-white cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Selected Refill Items ({selectedEntries.reduce((s, e) => s + e.qty, 0)} units)
            </p>
            <p className="text-lg font-black text-slate-900 dark:text-white">
              ₹{subtotal.toLocaleString("en-IN")}
            </p>
          </div>
          <button
            type="button"
            disabled={selectedEntries.length === 0}
            onClick={() => {
              onDispatchRefill(selectedEntries);
              onClose();
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 text-xs font-black shadow-md transition cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Dispatch Consumables in 60 Mins</span>
          </button>
        </div>
      </div>
    </div>
  );
}
