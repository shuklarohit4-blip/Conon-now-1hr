import React, { useMemo, useState } from "react";
import { X, Zap, ShoppingBag, Check } from "lucide-react";
import { SOLAR_BOS_PRESETS, SOLAR_PRODUCTS, type SolarProduct } from "@/data/solarCatalog";

export function SolarBosRescueModal({
  isOpen,
  onClose,
  onDispatchBosKit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDispatchBosKit: (items: Array<{ product: SolarProduct; qty: number }>) => void;
}) {
  const [presetId, setPresetId] = useState<"3kw-1ph" | "5kw-combo" | "10kw-3ph">("3kw-1ph");
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());

  const activePreset = useMemo(
    () => SOLAR_BOS_PRESETS.find((p) => p.id === presetId) || SOLAR_BOS_PRESETS[0],
    [presetId],
  );

  const checklist = useMemo(() => {
    return activePreset.items
      .map((entry) => {
        const product = SOLAR_PRODUCTS.find((p) => p.id === entry.productId);
        if (!product) return null;
        return { ...entry, product, checked: !excludedIds.has(product.id) };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));
  }, [activePreset, excludedIds]);

  const totalCost = useMemo(
    () => checklist.reduce((s, item) => (item.checked ? s + item.product.price * item.qty : s), 0),
    [checklist],
  );

  const toggleItem = (id: string) => {
    setExcludedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-4 sm:p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-blue-800 dark:text-amber-300 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded-full">
              <Zap className="w-3 h-3" />
              60-Min Lucknow Technician Emergency Kit
            </span>
            <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1.5">
              Solar Site BOS Rescue Kit Builder
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Don’t stall rooftop commissioning for a missing ACDB, MC4 connector, or chemical earthing bag.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close BOS Kit Drawer"
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Plant Size Selector */}
        <div className="grid grid-cols-3 gap-2">
          {SOLAR_BOS_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setPresetId(p.id);
                setExcludedIds(new Set());
              }}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                presetId === p.id
                  ? "bg-[#12357A] text-white border-[#12357A] shadow-sm"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700"
              }`}
            >
              <p className="text-xs font-black">{p.label}</p>
              <p className={`text-[10px] mt-0.5 ${presetId === p.id ? "text-blue-100" : "text-slate-400"}`}>
                {p.sublabel}
              </p>
            </button>
          ))}
        </div>

        {/* Missing Site Essentials Checklist */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
          {checklist.map((row) => (
            <label
              key={row.product.id}
              className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/70 cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => toggleItem(row.product.id)}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                    row.checked
                      ? "bg-[#12357A] border-[#12357A] text-white"
                      : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                  }`}
                >
                  {row.checked && <Check className="w-3.5 h-3.5" />}
                </button>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {row.qty}× {row.product.title}
                  </p>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">{row.note}</p>
                </div>
              </div>
              <span className="text-xs font-black text-slate-900 dark:text-white shrink-0">
                ₹{(row.product.price * row.qty).toLocaleString("en-IN")}
              </span>
            </label>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Selected BOS Essentials ({checklist.filter((c) => c.checked).length} items)
            </p>
            <p className="text-lg font-black text-slate-900 dark:text-white">
              ₹{totalCost.toLocaleString("en-IN")}
            </p>
          </div>
          <button
            type="button"
            disabled={checklist.every((c) => !c.checked)}
            onClick={() => {
              onDispatchBosKit(
                checklist.filter((c) => c.checked).map((c) => ({ product: c.product, qty: c.qty })),
              );
              onClose();
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 text-xs font-black shadow-md transition cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Dispatch BOS Kit in 60 Mins</span>
          </button>
        </div>
      </div>
    </div>
  );
}
