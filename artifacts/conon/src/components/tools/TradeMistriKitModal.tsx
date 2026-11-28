import React, { useMemo, useState } from "react";
import { X, Wrench, ShoppingBag, Check, Sparkles } from "lucide-react";
import {
  TOOLS_HARDWARE_PRODUCTS,
  TRADE_MISTRI_KITS,
  type ToolHardwareProduct,
} from "@/data/toolsHardwareCatalog";

export function TradeMistriKitModal({
  isOpen,
  onClose,
  onAddTradeKit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddTradeKit: (items: ToolHardwareProduct[], tradeLabel: string, discountPct: number) => void;
}) {
  const [selectedTradeId, setSelectedTradeId] = useState<string>(TRADE_MISTRI_KITS[0].id);
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());

  const activeTrade = useMemo(
    () => TRADE_MISTRI_KITS.find((t) => t.id === selectedTradeId) || TRADE_MISTRI_KITS[0],
    [selectedTradeId],
  );

  const itemsList = useMemo(() => {
    return activeTrade.itemIds
      .map((id) => TOOLS_HARDWARE_PRODUCTS.find((p) => p.id === id))
      .filter((p): p is ToolHardwareProduct => Boolean(p))
      .map((product) => ({
        product,
        checked: !excludedIds.has(product.id),
      }));
  }, [activeTrade, excludedIds]);

  const checkedItems = useMemo(
    () => itemsList.filter((i) => i.checked).map((i) => i.product),
    [itemsList],
  );

  const rawTotal = useMemo(
    () => checkedItems.reduce((s, p) => s + p.price, 0),
    [checkedItems],
  );
  const discountPct = 5;
  const finalTotal = Math.round(rawTotal * (1 - discountPct / 100));

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
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-700 w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-5 py-4 text-white flex items-start justify-between gap-3 shrink-0"
          style={{ background: "linear-gradient(110deg, #0B1B3D 0%, #10244E 60%, #12357A 100%)" }}
        >
          <div>
            <span className="inline-flex items-center gap-1 text-[10.5px] font-black uppercase tracking-wider text-amber-300 bg-white/10 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              Extra {discountPct}% Kit Discount • 60-Min Express
            </span>
            <h2 className="text-lg font-black mt-1">1-Click Trade Mistri Kit Builder</h2>
            <p className="text-xs text-slate-200">
              Tailored Bosch, Taparia &amp; Stanley bundles for every Lucknow construction trade.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Trade Mistri Kit Builder"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {/* Trade Pills */}
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
              1. Select Site Trade
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TRADE_MISTRI_KITS.map((kit) => (
                <button
                  key={kit.id}
                  type="button"
                  onClick={() => {
                    setSelectedTradeId(kit.id);
                    setExcludedIds(new Set());
                  }}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    selectedTradeId === kit.id
                      ? "bg-[#12357A] text-white border-[#12357A] shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <p className="text-xs font-black">{kit.label}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{activeTrade.tagline}</p>
          </div>

          {/* Checklist */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
            {itemsList.map(({ product, checked }) => (
              <label
                key={product.id}
                className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/70 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleItem(product.id)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                      checked
                        ? "bg-[#12357A] border-[#12357A] text-white"
                        : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    {checked && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {product.title}
                    </p>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                      {product.brand} · {product.model} · {product.unit}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white shrink-0">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
              </label>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Individual Total: <span className="line-through">₹{rawTotal.toLocaleString("en-IN")}</span> (5% Kit Off)
              </p>
              <p className="text-lg font-black text-slate-900 dark:text-white">
                ₹{finalTotal.toLocaleString("en-IN")}{" "}
                <span className="text-xs font-semibold text-emerald-600">(Incl. 18% GST)</span>
              </p>
            </div>
            <button
              type="button"
              disabled={checkedItems.length === 0}
              onClick={() => {
                onAddTradeKit(checkedItems, activeTrade.label, discountPct);
                onClose();
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 text-xs font-black shadow-md transition cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add Full Trade Kit to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
