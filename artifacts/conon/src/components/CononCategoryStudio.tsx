import React from "react";
import { ShieldCheck, Clock, Plus, Minus, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { CononProductMedia } from "@/components/CononProductMedia";

export interface StudioSubCategory {
  id: string;
  label: string;
  count: number;
  icon?: React.ReactNode;
}

export interface StudioVariantChip {
  label: string;
  priceDelta?: number;
  priceOverride?: number;
  swatchHex?: string;
}

export interface StudioProductItem {
  id: string;
  slug?: string;
  title: string;
  brand: string;
  subCategoryId: string;
  categorySlug: string;
  price: number;
  mrp: number;
  unit: string;
  hsnCode: string;
  gstRate: number;
  standardBadge?: string;
  specLine?: string;
  description?: string;
  image?: string;
  inStock?: boolean;
  variants?: StudioVariantChip[];
  variantLabel?: string;
  extraActionSlot?: React.ReactNode;
  mediaOverlaySlot?: React.ReactNode;
}

interface CononCategoryStudioProps {
  title: string;
  subtitleHi?: string;
  badge?: string;
  expressText?: string;
  subCategories: StudioSubCategory[];
  activeSubCategoryId: string;
  onSelectSubCategory: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  brands: string[];
  activeBrand: string;
  onSelectBrand: (b: string) => void;
  sortBy: "POPULAR" | "PRICE_ASC" | "PRICE_DESC";
  onSortChange: (s: "POPULAR" | "PRICE_ASC" | "PRICE_DESC") => void;
  inStockOnly: boolean;
  onToggleInStockOnly: () => void;
  products: StudioProductItem[];
  selectedVariantIdxMap: Record<string, number>;
  onSelectVariantIdx: (productId: string, idx: number) => void;
  getCartQty: (productId: string) => number;
  onAddToCart: (item: StudioProductItem, activePrice: number, activeVariant?: string) => void;
  onSetCartQty: (productId: string, nextQty: number) => void;
  onOpenDetail: (item: StudioProductItem, activePrice: number) => void;
  magicWidgets?: React.ReactNode;
}

const BRAND = "#1848a0";

export function CononCategoryStudio({
  title,
  subtitleHi,
  badge,
  expressText = "60-Min Lucknow Express",
  subCategories,
  activeSubCategoryId,
  onSelectSubCategory,
  searchQuery,
  onSearchChange,
  brands,
  activeBrand,
  onSelectBrand,
  sortBy,
  onSortChange,
  inStockOnly,
  onToggleInStockOnly,
  products,
  selectedVariantIdxMap,
  onSelectVariantIdx,
  getCartQty,
  onAddToCart,
  onSetCartQty,
  onOpenDetail,
  magicWidgets,
}: CononCategoryStudioProps) {
  return (
    <div className="min-h-screen bg-[#f4f7fb] pb-20">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-5 space-y-5">
        {/* CLEAN STUDIO HEADER */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {title}
              </h1>
              {badge && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {badge}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {expressText}
              </span>
            </div>
            {subtitleHi && (
              <p className="text-xs font-bold text-slate-500 mt-0.5">{subtitleHi}</p>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative min-w-[220px] sm:min-w-[260px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={`Search in ${title}...`}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900"
              />
            </div>
            <span className="px-3 py-2 rounded-xl bg-slate-900 text-amber-300 text-xs font-black shrink-0">
              {products.length} SKUs
            </span>
          </div>
        </div>

        {/* SECTION MAGIC CALCULATORS / KIT BUILDERS */}
        {magicWidgets}

        {/* BODY: LEFT SUB-CATEGORY RAIL + RIGHT 4-COLUMN STUDIO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT SUB-CATEGORY RAIL */}
          <aside className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/90 p-3 shadow-sm flex lg:flex-col gap-1.5 overflow-x-auto scrollbar-hide">
            {subCategories.map((sc) => {
              const active = activeSubCategoryId === sc.id;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => onSelectSubCategory(sc.id)}
                  className={`shrink-0 lg:w-full text-left px-3 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 transition cursor-pointer ${
                    active
                      ? "bg-[#1848a0] text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    {sc.icon}
                    <span className="truncate">{sc.label}</span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                      active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {sc.count}
                  </span>
                </button>
              );
            })}
          </aside>

          {/* RIGHT WORKSPACE */}
          <div className="lg:col-span-9 space-y-4">
            {/* SINGLE-ROW SMART FILTER BAR */}
            <div className="bg-white rounded-2xl border border-slate-200/90 px-3.5 py-2.5 shadow-2xs flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <button
                  type="button"
                  onClick={() => onSelectBrand("ALL")}
                  className={`px-2.5 py-1 rounded-lg font-bold shrink-0 cursor-pointer ${
                    activeBrand === "ALL" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  All Brands
                </button>
                {brands.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => onSelectBrand(b)}
                    className={`px-2.5 py-1 rounded-lg font-bold shrink-0 cursor-pointer ${
                      activeBrand === b ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onToggleInStockOnly}
                  className={`px-2.5 py-1 rounded-lg font-bold border cursor-pointer ${
                    inStockOnly
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                      : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  In Stock Only
                </button>
                <select
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value as any)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-bold text-slate-700"
                >
                  <option value="POPULAR">Sort: Recommended</option>
                  <option value="PRICE_ASC">Price: Low to High</option>
                  <option value="PRICE_DESC">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* FLAGSHIP 4-COLUMN RESPONSIVE PRODUCT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((item) => {
                const vIdx = selectedVariantIdxMap[item.id] ?? 0;
                const activeVar = item.variants?.[vIdx];
                const activePrice =
                  activeVar?.priceOverride !== undefined
                    ? activeVar.priceOverride
                    : activeVar?.priceDelta !== undefined
                    ? item.price + activeVar.priceDelta
                    : item.price;
                const activeMrp = Math.max(activePrice, item.mrp);
                const savePct =
                  activeMrp > activePrice
                    ? Math.round(((activeMrp - activePrice) / activeMrp) * 100)
                    : 0;
                const qty = getCartQty(item.id);

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-lg transition flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      <div
                        onClick={() => onOpenDetail(item, activePrice)}
                        className="relative h-44 bg-slate-100 cursor-pointer overflow-hidden"
                      >
                        <CononProductMedia
                          mediaType="product"
                          itemId={item.id}
                          slug={item.slug || item.id}
                          src={item.image || ""}
                          title={item.title}
                          brand={item.brand}
                          categorySlug={item.categorySlug}
                          unit={item.unit}
                          variant="cover"
                        />
                        {savePct > 0 && (
                          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white shadow-xs">
                            Save {savePct}%
                          </span>
                        )}
                        {item.standardBadge && (
                          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-900/85 text-amber-300">
                            {item.standardBadge}
                          </span>
                        )}
                        {item.mediaOverlaySlot}
                      </div>

                      <div className="p-3.5 space-y-2">
                        <div className="flex items-center justify-between gap-1 text-[10px] font-black uppercase tracking-wider text-blue-700">
                          <span className="truncate">{item.brand}</span>
                          <span className="text-slate-400 font-mono">HSN {item.hsnCode}</span>
                        </div>

                        <h3
                          onClick={() => onOpenDetail(item, activePrice)}
                          className="text-xs sm:text-sm font-black text-slate-900 leading-snug line-clamp-2 cursor-pointer hover:text-blue-700"
                        >
                          {item.title}
                        </h3>

                        {item.specLine && (
                          <p className="text-[11px] text-slate-500 line-clamp-1">{item.specLine}</p>
                        )}

                        {/* INLINE QUICK-VARIANT CHIPS */}
                        {item.variants && item.variants.length > 0 && (
                          <div className="space-y-1 pt-0.5">
                            {item.variantLabel && (
                              <span className="text-[10px] font-bold text-slate-500 block">
                                {item.variantLabel}
                              </span>
                            )}
                            <div className="flex flex-wrap gap-1">
                              {item.variants.map((v, idx) => {
                                const on = idx === vIdx;
                                return (
                                  <button
                                    key={v.label}
                                    type="button"
                                    onClick={() => onSelectVariantIdx(item.id, idx)}
                                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border flex items-center gap-1 cursor-pointer transition ${
                                      on
                                        ? "bg-blue-700 text-white border-blue-700"
                                        : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                                    }`}
                                  >
                                    {v.swatchHex && (
                                      <span
                                        className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                                        style={{ backgroundColor: v.swatchHex }}
                                      />
                                    )}
                                    <span>{v.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {item.extraActionSlot}
                      </div>
                    </div>

                    {/* PRICE + ADD TO CART */}
                    <div className="px-3.5 pb-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-black font-mono text-slate-900">
                            ₹{activePrice.toLocaleString("en-IN")}
                          </span>
                          {activeMrp > activePrice && (
                            <span className="text-[11px] line-through text-slate-400 font-mono">
                              ₹{activeMrp.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold block">
                          /{item.unit} • incl. {item.gstRate}% GST
                        </span>
                      </div>

                      {qty > 0 ? (
                        <div className="flex items-center border border-blue-700 rounded-xl bg-blue-50 p-0.5">
                          <button
                            type="button"
                            onClick={() => onSetCartQty(item.id, qty - 1)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-blue-700 hover:bg-white cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs font-black font-mono text-blue-900">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => onSetCartQty(item.id, qty + 1)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-blue-700 hover:bg-white cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onAddToCart(item, activePrice, activeVar?.label)}
                          className="px-3.5 py-2 rounded-xl text-xs font-black text-white shadow-xs hover:brightness-110 transition cursor-pointer shrink-0"
                          style={{ background: BRAND }}
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
