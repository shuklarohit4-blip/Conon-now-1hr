import React, { useEffect, useMemo, useState } from "react";
import { Search, Layers, Package, Truck, Settings, LayoutDashboard, Store, X, ArrowRight } from "lucide-react";
import { useLiveCategoriesStore } from "@/services/liveCategoriesStore";
import { useLiveProductsStore } from "@/services/liveProductsStore";

interface AdminQuickCommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNavigateModule: (moduleId: string) => void;
}

const ADMIN_SHORTCUTS = [
  { id: "founder_home", label: "Executive Command Dashboard", hint: "KPIs, LAN URL, SSE Clients, Force Sync", icon: LayoutDashboard },
  { id: "home_banners_studio", label: "Home & Banners Studio", hint: "Blinkit Bento Grid, Masthead Theme, Hero Carousels, Promo Strips", icon: LayoutDashboard },
  { id: "search_studio", label: "Search & Discovery Studio", hint: "Hinglish Synonyms, Placeholders, Analytics, Sourcing Requests", icon: Search },
  { id: "category_studio", label: "Category Studio", hint: "Drag reorder, badges, category photos", icon: Layers },
  { id: "product_master", label: "Product & Pricing Master", hint: "Blinkit details, 5 images, inline bulk prices, CSV", icon: Package },
  { id: "merchandising", label: "Hero Banners & Store Settings", hint: "ETA, Free Delivery, Cashback %, Banners", icon: Settings },
  { id: "orders_tower", label: "Orders & 60-Min Delivery Tower", hint: "Filter orders, status progression, GST Invoice", icon: Truck },
  { id: "directory", label: "Partners & Drivers Directory", hint: "Hub depots & fleet drivers", icon: Store },
];

export function AdminQuickCommandPalette({
  open,
  onClose,
  onNavigateModule,
}: AdminQuickCommandPaletteProps) {
  const [query, setQuery] = useState("");
  const { categories } = useLiveCategoriesStore({ includeInactive: true });
  const { products } = useLiveProductsStore();

  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    const matchedModules = ADMIN_SHORTCUTS.filter(
      (m) => !q || m.label.toLowerCase().includes(q) || m.hint.toLowerCase().includes(q)
    );
    const matchedCategories = categories
      .filter((c) => !q || c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q))
      .slice(0, 6);
    const matchedProducts = products
      .filter(
        (p) =>
          !q ||
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.categorySlug.toLowerCase().includes(q)
      )
      .slice(0, 6);
    return { matchedModules, matchedCategories, matchedProducts };
  }, [query, categories, products]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm flex items-start justify-center pt-[12vh] p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800">
          <Search className="w-4 h-4 text-amber-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to module, category, product SKU, or store setting..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4 text-xs">
          {results.matchedModules.length > 0 && (
            <div>
              <div className="px-2 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                Command Modules
              </div>
              {results.matchedModules.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onNavigateModule(m.id);
                    onClose();
                  }}
                  className="w-full px-3 py-2 rounded-xl hover:bg-slate-800/80 flex items-center justify-between gap-2 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <m.icon className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="font-bold text-slate-100">{m.label}</div>
                      <div className="text-[11px] text-slate-400">{m.hint}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              ))}
            </div>
          )}

          {results.matchedCategories.length > 0 && (
            <div>
              <div className="px-2 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                Categories
              </div>
              {results.matchedCategories.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => {
                    onNavigateModule("category_studio");
                    onClose();
                  }}
                  className="w-full px-3 py-2 rounded-xl hover:bg-slate-800/80 flex items-center justify-between gap-2 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-sky-400" />
                    <div>
                      <div className="font-bold text-slate-100">{c.title}</div>
                      <div className="text-[10px] font-mono text-slate-400">
                        /{c.slug} · {c.productCount || 0} products
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              ))}
            </div>
          )}

          {results.matchedProducts.length > 0 && (
            <div>
              <div className="px-2 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                Products ({products.length} Total)
              </div>
              {results.matchedProducts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onNavigateModule("product_master");
                    onClose();
                  }}
                  className="w-full px-3 py-2 rounded-xl hover:bg-slate-800/80 flex items-center justify-between gap-2 text-left cursor-pointer"
                >
                  <div className="min-w-0 flex items-center gap-2.5">
                    <Package className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-100 truncate">{p.title}</div>
                      <div className="text-[10px] text-slate-400">
                        {p.brand} · ₹{p.sellingPrice} / {p.unit}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
