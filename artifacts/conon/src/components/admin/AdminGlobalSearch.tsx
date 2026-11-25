import React, { useState, useEffect, useRef } from "react";
import { Search, X, Package, TrendingUp, Tractor, ShoppingCart, ArrowRight } from "lucide-react";
import { useLiveCatalog } from "@/context/LiveCatalogContext";

interface SearchResult {
  id: string;
  type: "sku" | "mandi" | "rental" | "order";
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  price?: number;
  unit?: string;
}

interface AdminGlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSku?: (skuId: string) => void;
}

export function AdminGlobalSearch({ isOpen, onClose, onSelectSku }: AdminGlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { items } = useLiveCatalog();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const results: SearchResult[] = React.useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    const list: SearchResult[] = [];

    // 1. SKUs from 753 Live Items
    for (const p of items) {
      if (
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      ) {
        list.push({
          id: p.id,
          type: "sku",
          title: p.name,
          subtitle: `${p.brand || "Standard"} · ${p.categoryName || p.category} · HSN ${p.hsnCode || "N/A"}`,
          badge: p.inStock ? "IN STOCK" : "OUT OF STOCK",
          badgeColor: p.inStock ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200",
          price: p.sellingPrice,
          unit: p.unit,
        });
        if (list.length >= 15) break;
      }
    }

    return list.slice(0, 15);
  }, [query, items]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      const sel = results[selectedIndex];
      if (sel.type === "sku" && onSelectSku) {
        onSelectSku(sel.id);
      }
      onClose();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type SKU name, brand, HSN, commodity, or category... (Press Esc to close)"
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-50">
          {query.trim() === "" ? (
            <div className="p-8 text-center text-xs text-slate-400">
              <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <span>Search across all 753 SKUs, Mandi commodities, and rental equipment</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No results found for &quot;{query}&quot;. Try searching for &quot;Ultratech&quot;, &quot;Morang&quot;, &quot;Havells&quot;, or &quot;Crompton&quot;.
            </div>
          ) : (
            results.map((r, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${r.type}-${r.id}`}
                  onClick={() => {
                    if (r.type === "sku" && onSelectSku) {
                      onSelectSku(r.id);
                    }
                    onClose();
                  }}
                  className={`p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition ${
                    isSelected ? "bg-amber-50/80 border border-amber-200" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-600">
                      {r.type === "sku" ? (
                        <Package className="w-4 h-4" />
                      ) : r.type === "mandi" ? (
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Tractor className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="min-w-0 truncate">
                      <div className="text-xs font-bold text-slate-900 truncate">{r.title}</div>
                      <div className="text-[11px] text-slate-500 truncate">{r.subtitle}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {r.price !== undefined && (
                      <span className="text-xs font-black text-slate-900">
                        ₹{r.price.toLocaleString("en-IN")}{r.unit ? ` / ${r.unit}` : ""}
                      </span>
                    )}
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${r.badgeColor}`}>
                      {r.badge}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>Use <strong className="font-semibold text-slate-600">↑↓</strong> to navigate</span>
            <span><strong className="font-semibold text-slate-600">Enter</strong> to select</span>
            <span><strong className="font-semibold text-slate-600">Esc</strong> to dismiss</span>
          </div>
          <span>753 Live SKUs</span>
        </div>
      </div>
    </div>
  );
}
