import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock,
  Droplets,
  Flame,
  Grid3x3,
  History,
  Layers,
  Mic,
  Minus,
  Package,
  Paintbrush,
  Plus,
  RotateCcw,
  Search as SearchIcon,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  Truck,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetCartQueryKey,
  useAddToCart,
  useGetCart,
  useRemoveFromCart,
  useUpdateCartItem,
} from "@workspace/api-client-react";
import { SmartSearchBar, VoiceSearchListenModal } from "@/components/SmartSearchBar";
import { ProductDetailSheet } from "@/components/ProductDetailSheet";
import { CartSheet } from "@/components/CartSheet";
import { useUI } from "@/context/UIContext";
import { useDeliveryLocation } from "@/context/LocationContext";
import { useLiveCategoriesStore } from "@/services/liveCategoriesStore";
import { useLiveProductsStore, type LiveProductRecord } from "@/services/liveProductsStore";
import {
  fetchSearchSuggestions,
  fetchSmartSearch,
  parseSiteParchiList,
  submitSourcingRequest,
  useLiveSearchConfig,
  type ParchiLineMatch,
  type SearchResultsResponse,
  type SearchSuggestionResponse,
} from "@/services/liveSearchStore";
import { normalizeRelativeAssetUrl } from "@/lib/apiBase";
import { subscribeSseSync } from "@/services/sseSyncClient";

const RECENT_SEARCHES_KEY = "conon_recent_searches_v1";

function loadRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, 10) : [];
  } catch {
    return [];
  }
}

function saveRecentSearches(items: string[]) {
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(items.slice(0, 10)));
  } catch {}
}

function highlightMatch(text: string, query: string): React.ReactNode {
  const q = query.trim();
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <strong className="font-black text-[#1848a0] bg-blue-50/90 px-0.5 rounded">
        {text.slice(idx, idx + q.length)}
      </strong>
      {text.slice(idx + q.length)}
    </>
  );
}

function StageIcon({ name }: { name: string }) {
  const cls = "w-4 h-4 shrink-0";
  if (name === "layers") return <Layers className={cls} />;
  if (name === "grid") return <Grid3x3 className={cls} />;
  if (name === "shield") return <ShieldCheck className={cls} />;
  if (name === "droplets") return <Droplets className={cls} />;
  if (name === "zap") return <Zap className={cls} />;
  if (name === "paintbrush") return <Paintbrush className={cls} />;
  return <Package className={cls} />;
}

export function SearchPage() {
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const { setCartOpen } = useUI();
  const { location: deliveryLoc } = useDeliveryLocation();

  const initialParams = useMemo(() => {
    if (typeof window === "undefined") return { q: "", mode: "items" as const, stage: "" };
    const sp = new URLSearchParams(window.location.search);
    return {
      q: sp.get("q") || "",
      mode: sp.get("mode") === "parchi" ? ("parchi" as const) : ("items" as const),
      stage: sp.get("stage") || "",
    };
  }, []);

  const [mode, setMode] = useState<"items" | "parchi">(initialParams.mode);
  const [query, setQuery] = useState(initialParams.q);
  const [activeStage, setActiveStage] = useState(initialParams.stage);
  const [sortBy, setSortBy] = useState<"relevance" | "price_asc" | "price_desc" | "discount_desc">("relevance");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [bulkOnly, setBulkOnly] = useState(false);

  const [recentSearches, setRecentSearches] = useState<string[]>(() => loadRecentSearches());
  const [suggestions, setSuggestions] = useState<SearchSuggestionResponse | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [results, setResults] = useState<SearchResultsResponse | null>(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const [detailProduct, setDetailProduct] = useState<any | null>(null);

  // Zero-result sourcing request form state
  const [reqItemName, setReqItemName] = useState("");
  const [reqQty, setReqQty] = useState("10 units");
  const [reqPhone, setReqPhone] = useState("");
  const [reqBusy, setReqBusy] = useState(false);
  const [reqSubmitted, setReqSubmitted] = useState(false);

  // Site Parchi Multi-Item Matcher State
  const [parchiText, setParchiText] = useState(
    "20 bag UltraTech cement\n2 Ltr Dr Fixit\n5 bag Birla White Putty"
  );
  const [parchiParsing, setParchiParsing] = useState(false);
  const [parchiLines, setParchiLines] = useState<ParchiLineMatch[]>([]);
  const [checkedLineIds, setCheckedLineIds] = useState<Record<string, boolean>>({});
  const [parchiVoiceOpen, setParchiVoiceOpen] = useState(false);
  const [addingAllToCart, setAddingAllToCart] = useState(false);

  const { config: searchConfig } = useLiveSearchConfig();
  const { categories: liveCategories } = useLiveCategoriesStore({ includeInactive: false });
  const { products: liveProducts } = useLiveProductsStore();

  const addToCart = useAddToCart({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() }) },
  });
  const updateCartItem = useUpdateCartItem({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() }) },
  });
  const removeFromCart = useRemoveFromCart({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() }) },
  });
  const { data: cart } = useGetCart();

  const cartQtyMap = useMemo(() => {
    const map: Record<string, { id: string; quantity: number }> = {};
    for (const cat of cart?.categories ?? []) {
      for (const it of cat.items ?? []) {
        const key = `${(it.name || "").toLowerCase()}`;
        map[key] = { id: String(it.id), quantity: (map[key]?.quantity || 0) + Number(it.quantity || 0) };
      }
    }
    return map;
  }, [cart]);

  const getProductCartInfo = (p: LiveProductRecord) =>
    cartQtyMap[p.title.toLowerCase()] || { id: "", quantity: 0 };

  const handleSetProductQty = (p: LiveProductRecord, qty: number) => {
    const cur = getProductCartInfo(p);
    if (!cur.id) {
      if (qty > 0) {
        addToCart.mutate(
          {
            data: {
              materialId: p.id,
              quantity: qty,
              name: p.title,
              price: p.bulkPrice > 0 && p.bulkMinQty > 0 && qty >= p.bulkMinQty ? p.bulkPrice : p.sellingPrice,
              unit: p.unit || "unit",
              vendor: p.brand || "CONON-NOW Marketplace",
              category: p.categorySlug,
            },
          },
          { onSuccess: () => toast.success(`Added ${p.title} to cart`) }
        );
      }
      return;
    }
    if (qty <= 0) {
      removeFromCart.mutate({ itemId: cur.id });
    } else {
      updateCartItem.mutate({ itemId: cur.id, data: { quantity: qty } });
    }
  };

  // Sync URL cleanly for browser Back support
  useEffect(() => {
    if (typeof window === "undefined") return;
    const usp = new URLSearchParams();
    if (query.trim()) usp.set("q", query.trim());
    if (mode === "parchi") usp.set("mode", "parchi");
    if (activeStage) usp.set("stage", activeStage);
    const qs = usp.toString();
    const nextUrl = qs ? `/search?${qs}` : "/search";
    window.history.replaceState(null, "", nextUrl);
  }, [query, mode, activeStage]);

  const recordRecent = useCallback((term: string) => {
    const clean = term.trim();
    if (clean.length < 2) return;
    setRecentSearches((prev) => {
      const next = [clean, ...prev.filter((x) => x.toLowerCase() !== clean.toLowerCase())].slice(0, 10);
      saveRecentSearches(next);
      return next;
    });
  }, []);

  // Debounced <150ms As-You-Type Suggest
  const suggestTimer = useRef<number | null>(null);
  useEffect(() => {
    if (mode !== "items") return;
    if (suggestTimer.current) window.clearTimeout(suggestTimer.current);
    const trimmed = query.trim();
    if (trimmed.length < 1) {
      setSuggestions(null);
      return;
    }
    suggestTimer.current = window.setTimeout(async () => {
      try {
        const res = await fetchSearchSuggestions(trimmed);
        setSuggestions(res);
      } catch {}
    }, 110);
    return () => {
      if (suggestTimer.current) window.clearTimeout(suggestTimer.current);
    };
  }, [query, mode]);

  // Execute Full Smart Search whenever query/filters change
  const searchTimer = useRef<number | null>(null);
  const runSearch = useCallback(async () => {
    if (mode !== "items") return;
    const hasSearchCriteria = Boolean(
      query.trim() || activeStage || selectedCategory || selectedBrand || inStockOnly || bulkOnly
    );
    if (!hasSearchCriteria) {
      setResults(null);
      return;
    }
    setLoadingResults(true);
    try {
      const data = await fetchSmartSearch({
        q: query.trim(),
        category: selectedCategory || undefined,
        brand: selectedBrand || undefined,
        sort: sortBy,
        inStock: inStockOnly,
        bulkOnly,
        stage: activeStage || undefined,
      });
      setResults(data);
      setReqItemName(query.trim());
      setReqSubmitted(false);
    } catch {
      toast.error("Search temporarily unavailable");
    } finally {
      setLoadingResults(false);
    }
  }, [mode, query, activeStage, selectedCategory, selectedBrand, inStockOnly, bulkOnly, sortBy]);

  useEffect(() => {
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      void runSearch();
    }, 180);
    return () => {
      if (searchTimer.current) window.clearTimeout(searchTimer.current);
    };
  }, [runSearch]);

  // Live SSE sync: refresh active search/config if Admin adds a synonym or edits SKU price
  useEffect(() => {
    return subscribeSseSync((ev) => {
      if (ev.type === "SEARCH_UPDATED" || ev.type === "CATALOG_UPDATED") {
        void runSearch();
      }
    });
  }, [runSearch]);

  const executeSearchTerm = (term: string) => {
    setMode("items");
    setQuery(term);
    setShowDropdown(false);
    recordRecent(term);
  };

  // Site Parchi Parse Handler
  const handleParseParchi = useCallback(async (textOverride?: string) => {
    const src = textOverride !== undefined ? textOverride : parchiText;
    if (!src.trim()) {
      toast.error("Paste or dictate at least 1 material item line");
      return;
    }
    setParchiParsing(true);
    try {
      const parsed = await parseSiteParchiList(src);
      setParchiLines(parsed.lines);
      const nextChecked: Record<string, boolean> = {};
      for (const l of parsed.lines) {
        if (l.matchedProduct) nextChecked[l.lineId] = true;
      }
      setCheckedLineIds(nextChecked);
    } catch (err: any) {
      toast.error(err?.message || "Could not parse Parchi list");
    } finally {
      setParchiParsing(false);
    }
  }, [parchiText]);

  // Auto-parse default/opened Site Parchi when switching into Parchi mode first time
  useEffect(() => {
    if (mode === "parchi" && parchiLines.length === 0 && parchiText.trim()) {
      void handleParseParchi(parchiText);
    }
  }, [mode]);

  const recalcLine = (line: ParchiLineMatch, qty: number, prod: LiveProductRecord | null): ParchiLineMatch => {
    if (!prod) {
      return { ...line, detectedQty: qty, matchedProduct: null, effectiveUnitPrice: 0, bulkApplied: false, lineTotal: 0, savings: 0 };
    }
    const bulkApplied = Boolean(prod.bulkPrice > 0 && prod.bulkMinQty > 0 && qty >= prod.bulkMinQty);
    const effectiveUnitPrice = bulkApplied ? prod.bulkPrice : prod.sellingPrice;
    const mrpTotal = (prod.mrp || prod.sellingPrice) * qty;
    const lineTotal = effectiveUnitPrice * qty;
    return {
      ...line,
      detectedQty: qty,
      matchedProduct: prod,
      effectiveUnitPrice,
      bulkApplied,
      lineTotal,
      savings: Math.max(0, mrpTotal - lineTotal),
    };
  };

  const parchiSummary = useMemo(() => {
    const selected = parchiLines.filter((l) => checkedLineIds[l.lineId] && l.matchedProduct);
    return {
      count: selected.length,
      total: selected.reduce((s, l) => s + l.lineTotal, 0),
      savings: selected.reduce((s, l) => s + l.savings, 0),
    };
  }, [parchiLines, checkedLineIds]);

  const handleAddAllParchiToCart = async () => {
    const selected = parchiLines.filter((l) => checkedLineIds[l.lineId] && l.matchedProduct);
    if (selected.length === 0) {
      toast.error("Select at least 1 matched item");
      return;
    }
    setAddingAllToCart(true);
    try {
      for (const l of selected) {
        const p = l.matchedProduct!;
        await addToCart.mutateAsync({
          data: {
            materialId: p.id,
            quantity: l.detectedQty,
            name: p.title,
            price: l.effectiveUnitPrice,
            unit: p.unit || l.detectedUnit || "unit",
            vendor: p.brand || "CONON-NOW Marketplace",
            category: p.categorySlug,
          },
        });
      }
      toast.success(`Added ${selected.length} Parchi items to Cart!`);
      setCartOpen(true);
    } catch {
      toast.error("Some items could not be added to Cart");
    } finally {
      setAddingAllToCart(false);
    }
  };

  const isShowingResults = Boolean(
    mode === "items" &&
      (query.trim() || activeStage || selectedCategory || selectedBrand || inStockOnly || bulkOnly)
  );

  const openDetailSheet = (p: LiveProductRecord) => {
    setDetailProduct({
      id: p.id,
      slug: p.slug,
      title: p.title,
      brand: p.brand,
      price: p.sellingPrice,
      mrp: p.mrp,
      bulkPrice: p.bulkPrice,
      bulkMinQty: p.bulkMinQty,
      unit: p.unit,
      image: normalizeRelativeAssetUrl(p.imageUrl || p.images?.[0]),
      images: p.images,
      galleryImages: p.galleryImages,
      description: p.description,
      materialTag: p.categorySlug,
      specTags: p.specTags,
      highlightTiles: p.highlightTiles,
      keyInfo: p.keyInfo,
      specifications: p.specifications,
      highlights: p.highlights,
      usageTips: p.usageTips,
      variants: p.variants,
      bulkSlabs: p.bulkSlabs,
      rating: 4.8,
      reviews: 142,
      deliveryEta: "60 mins",
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-24">
      {/* ── STICKY SEARCH COMMAND BAR ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-[1160px] mx-auto px-3 sm:px-6 py-2.5 space-y-2.5">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) window.history.back();
                else navigate("/home");
              }}
              aria-label="Go back"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div
              className="relative flex-1 min-w-0"
              onFocus={() => setShowDropdown(true)}
            >
              <SmartSearchBar
                value={query}
                onChange={(v) => {
                  setQuery(v);
                  setShowDropdown(true);
                  if (mode !== "items") setMode("items");
                }}
                onVoiceTranscript={(spoken) => executeSearchTerm(spoken)}
                onParchiClick={() => setMode("parchi")}
                onFocusNavigateToSearch={false}
                autoFocus
                enableGlobalShortcut
              />

              {/* Instant As-You-Type Autocomplete Dropdown */}
              {mode === "items" && showDropdown && query.trim().length >= 1 && suggestions && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden max-h-[70vh] overflow-y-auto">
                  <div className="flex items-center justify-between px-3.5 py-2 bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500">
                    <span>
                      Instant Suggestions
                      {suggestions.matchedSynonymHint
                        ? ` · Matched "${suggestions.matchedSynonymHint.mapsTo}"`
                        : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDropdown(false);
                        recordRecent(query);
                      }}
                      className="text-[#1848a0] font-black cursor-pointer"
                    >
                      Close
                    </button>
                  </div>

                  {/* Categories */}
                  {suggestions.categories.length > 0 && (
                    <div className="p-2 border-b border-slate-100">
                      <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Categories
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {suggestions.categories.map((c) => (
                          <button
                            key={c.slug}
                            type="button"
                            onClick={() => {
                              setShowDropdown(false);
                              setSelectedCategory(c.slug);
                              recordRecent(c.title);
                            }}
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-blue-50/70 text-left cursor-pointer"
                          >
                            <img
                              src={normalizeRelativeAssetUrl(c.imageUrl)}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover bg-slate-100 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-slate-900 truncate">
                                {highlightMatch(c.title, query)}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {c.productCount} SKUs available
                              </div>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Brands */}
                  {suggestions.brands.length > 0 && (
                    <div className="px-3.5 py-2 border-b border-slate-100 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-1">
                        Brands:
                      </span>
                      {suggestions.brands.map((b) => (
                        <button
                          key={b.name}
                          type="button"
                          onClick={() => {
                            setSelectedBrand(b.name);
                            setShowDropdown(false);
                            recordRecent(query);
                          }}
                          className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-100 text-xs font-bold text-slate-800 cursor-pointer"
                        >
                          {highlightMatch(b.name, query)} ({b.count})
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Top Instant Product Previews */}
                  {suggestions.products.length > 0 && (
                    <div className="p-2 divide-y divide-slate-100">
                      {suggestions.products.map((p) => {
                        const qtyInfo = getProductCartInfo(p);
                        return (
                          <div
                            key={p.id}
                            className="flex items-center justify-between gap-2.5 p-2 hover:bg-slate-50 rounded-xl"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setShowDropdown(false);
                                recordRecent(query);
                                openDetailSheet(p);
                              }}
                              className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer"
                            >
                              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                {p.imageUrl ? (
                                  <img
                                    src={normalizeRelativeAssetUrl(p.imageUrl)}
                                    alt={p.title}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <Package className="w-4 h-4 text-slate-400" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-slate-900 truncate">
                                  {highlightMatch(p.title, query)}
                                </div>
                                <div className="text-[10.5px] text-slate-500 flex items-center gap-1.5">
                                  <span>{p.unit}</span>
                                  <span>•</span>
                                  <span className="font-black text-slate-900">
                                    ₹{p.sellingPrice.toLocaleString("en-IN")}
                                  </span>
                                  {p.mrp > p.sellingPrice && (
                                    <span className="line-through text-slate-400">
                                      ₹{p.mrp.toLocaleString("en-IN")}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSetProductQty(p, qtyInfo.quantity + 1)}
                              className="px-3 py-1.5 rounded-lg bg-[#0C831F] hover:bg-[#0A6E1A] text-white text-[11px] font-black shrink-0 cursor-pointer"
                            >
                              {qtyInfo.quantity > 0 ? `In Cart (${qtyInfo.quantity})` : "+ Add"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 shrink-0 cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              {(cart?.totalItems ?? 0) > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#1848a0] text-white text-[10px] font-black flex items-center justify-center">
                  {cart?.totalItems}
                </span>
              )}
            </button>
          </div>

          {/* Search Items | Site Parchi Mode Switcher */}
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => setMode("items")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                  mode === "items"
                    ? "bg-white text-[#1848a0] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <SearchIcon className="w-3.5 h-3.5" />
                <span>Search Items</span>
              </button>
              {searchConfig.siteParchiEnabled && (
                <button
                  type="button"
                  onClick={() => setMode("parchi")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                    mode === "parchi"
                      ? "bg-amber-400 text-slate-950 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Site Parchi (Multi-Item)</span>
                </button>
              )}
            </div>

            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-slate-500">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              60-Min Lucknow Express · PIN {deliveryLoc.pincode || "226030"}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-[1160px] mx-auto px-3 sm:px-6 pt-4 space-y-6">
        {/* ══════════════════════════════════════════════════════════════════
            MODE A: SITE PARCHI / PASTE MATERIAL LIST MATCHER
           ══════════════════════════════════════════════════════════════════ */}
        {mode === "parchi" && (
          <div className="space-y-4">
            <div className="rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0B292E] text-white p-4 sm:p-6 shadow-xl border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" /> Magic Parchi Matcher
                  </span>
                  <h1 className="text-lg sm:text-2xl font-black mt-1.5">
                    Paste Your Site Material List / WhatsApp Parchi
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                    Supports quantities, bags/kg/ltr units &amp; Hinglish terms like sariya, morang, seelan, putti.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setParchiVoiceOpen(true)}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-white/15"
                  >
                    <Mic className="w-3.5 h-3.5 text-amber-300" />
                    <span>Dictate Line</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const sample =
                        "20 bag UltraTech cement\n2 Ltr Dr Fixit\n5 bag Birla White Putty\n10 pcs 12mm sariya";
                      setParchiText(sample);
                      void handleParseParchi(sample);
                    }}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 text-xs font-black cursor-pointer border border-white/15"
                  >
                    Load Sample Parchi
                  </button>
                </div>
              </div>

              <textarea
                rows={4}
                value={parchiText}
                onChange={(e) => setParchiText(e.target.value)}
                placeholder={"20 bag UltraTech cement\n2 Ltr Dr Fixit\n5 bag Birla White Putty"}
                className="w-full rounded-2xl bg-slate-950/70 border border-slate-700 p-3.5 text-sm font-semibold text-white placeholder-slate-400 outline-none focus:border-amber-400"
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-slate-400">
                  Tip: One item per line (e.g. "20 bag UltraTech cement" or "Dr Fixit - 2 ltr")
                </span>
                <button
                  type="button"
                  disabled={parchiParsing}
                  onClick={() => handleParseParchi()}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-60"
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>{parchiParsing ? "Matching Catalog..." : "Match Material List"}</span>
                </button>
              </div>
            </div>

            {/* Matched Checklist */}
            {parchiLines.length > 0 && (
              <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 sm:px-6 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50">
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-slate-900">
                      Interactive Site Parchi Checklist ({parchiSummary.count}/{parchiLines.length} matched)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Bulk slab rates apply automatically when your quantity meets minimum bulk slabs.
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {parchiLines.map((line) => {
                    const p = line.matchedProduct;
                    const checked = Boolean(checkedLineIds[line.lineId] && p);
                    const allChoices = p ? [p, ...line.alternatives.filter((a) => a.id !== p.id)] : [];

                    return (
                      <div key={line.lineId} className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <input
                            type="checkbox"
                            disabled={!p}
                            checked={checked}
                            onChange={(e) =>
                              setCheckedLineIds((prev) => ({
                                ...prev,
                                [line.lineId]: e.target.checked,
                              }))
                            }
                            className="mt-1 w-4 h-4 rounded accent-[#0C831F] cursor-pointer"
                          />

                          <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {p?.imageUrl ? (
                              <img
                                src={normalizeRelativeAssetUrl(p.imageUrl)}
                                alt={p.title}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-slate-400" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="text-[10.5px] font-bold text-slate-400">
                              Parsed: "{line.rawLine}"
                            </div>
                            {p ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openDetailSheet(p)}
                                  className="text-left text-xs sm:text-sm font-black text-slate-900 hover:text-[#1848a0] cursor-pointer line-clamp-1"
                                >
                                  {p.title}
                                </button>
                                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                  <span className="font-black text-slate-900">
                                    ₹{line.effectiveUnitPrice.toLocaleString("en-IN")} / {p.unit}
                                  </span>
                                  {line.bulkApplied && (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[9.5px]">
                                      Bulk Slab Applied!
                                    </span>
                                  )}
                                  {line.savings > 0 && (
                                    <span className="text-emerald-700 font-bold text-[10.5px]">
                                      Save ₹{line.savings.toLocaleString("en-IN")}
                                    </span>
                                  )}
                                </div>
                                {allChoices.length > 1 && (
                                  <select
                                    value={p.id}
                                    onChange={(e) => {
                                      const nextProd =
                                        allChoices.find((a) => a.id === e.target.value) || p;
                                      setParchiLines((prev) =>
                                        prev.map((item) =>
                                          item.lineId === line.lineId
                                            ? recalcLine(item, item.detectedQty, nextProd)
                                            : item
                                        )
                                      );
                                    }}
                                    className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-700 outline-none"
                                  >
                                    {allChoices.map((alt) => (
                                      <option key={alt.id} value={alt.id}>
                                        Swap Brand: {alt.brand} — {alt.title} (₹{alt.sellingPrice})
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </>
                            ) : (
                              <div className="text-xs font-bold text-rose-600">
                                No direct SKU match — submit Sourcing Request below or edit keyword
                              </div>
                            )}
                          </div>
                        </div>

                        {p && (
                          <div className="flex items-center justify-between sm:justify-end gap-3 pl-7 sm:pl-0 shrink-0">
                            <div className="inline-flex items-center rounded-xl border border-slate-300 bg-slate-50">
                              <button
                                type="button"
                                onClick={() =>
                                  setParchiLines((prev) =>
                                    prev.map((item) =>
                                      item.lineId === line.lineId
                                        ? recalcLine(item, Math.max(1, item.detectedQty - 1), p)
                                        : item
                                    )
                                  )
                                }
                                className="p-2 hover:bg-slate-200 rounded-l-xl cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-3 text-xs font-black tabular-nums">
                                {line.detectedQty}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setParchiLines((prev) =>
                                    prev.map((item) =>
                                      item.lineId === line.lineId
                                        ? recalcLine(item, item.detectedQty + 1, p)
                                        : item
                                    )
                                  )
                                }
                                className="p-2 hover:bg-slate-200 rounded-r-xl cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="text-right min-w-[78px]">
                              <div className="text-xs sm:text-sm font-black text-slate-900 tabular-nums">
                                ₹{line.lineTotal.toLocaleString("en-IN")}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Sticky Checkout CTA */}
                <div className="p-4 sm:px-6 bg-emerald-50/70 border-t border-emerald-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-slate-600">
                      Estimated Total ({parchiSummary.count} items)
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg sm:text-xl font-black text-slate-950">
                        ₹{parchiSummary.total.toLocaleString("en-IN")}
                      </span>
                      {parchiSummary.savings > 0 && (
                        <span className="text-xs font-black text-emerald-700">
                          You Save ₹{parchiSummary.savings.toLocaleString("en-IN")}!
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={addingAllToCart || parchiSummary.count === 0}
                    onClick={handleAddAllParchiToCart}
                    className="px-5 py-3 rounded-xl bg-[#0C831F] hover:bg-[#0A6E1A] text-white font-black text-xs sm:text-sm shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      {addingAllToCart
                        ? "Adding Items..."
                        : `Add All ${parchiSummary.count} Items to Cart`}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            MODE B1: ZERO-STATE DISCOVERY
           ══════════════════════════════════════════════════════════════════ */}
        {mode === "items" && !isShowingResults && (
          <div className="space-y-6">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <section className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-slate-500" />
                    <span>Recent Searches</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setRecentSearches([]);
                      saveRecentSearches([]);
                    }}
                    className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <div
                      key={term}
                      className="inline-flex items-center rounded-full bg-white border border-slate-200 shadow-2xs text-xs font-bold text-slate-800"
                    >
                      <button
                        type="button"
                        onClick={() => executeSearchTerm(term)}
                        className="pl-3 pr-1.5 py-1.5 hover:text-[#1848a0] cursor-pointer"
                      >
                        {term}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const next = recentSearches.filter((x) => x !== term);
                          setRecentSearches(next);
                          saveRecentSearches(next);
                        }}
                        aria-label={`Remove ${term}`}
                        className="pr-2.5 pl-0.5 py-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Trending Searches */}
            {searchConfig.trendingSearches.length > 0 && (
              <section className="space-y-2.5">
                <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Trending in Lucknow</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {searchConfig.trendingSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => executeSearchTerm(term)}
                      className="px-3.5 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-xs font-black text-amber-950 flex items-center gap-1.5 cursor-pointer transition active:scale-95"
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Shop by Construction Stage */}
            {searchConfig.stageShortcuts.length > 0 && (
              <section className="space-y-2.5">
                <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-600">
                  Shop by Construction Stage
                </h2>
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                  {searchConfig.stageShortcuts
                    .filter((s) => s.isActive)
                    .sort((a, b) => a.order - b.order)
                    .map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setActiveStage(st.id)}
                        className="min-w-[165px] sm:min-w-[190px] rounded-2xl bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 p-3 text-left shadow-2xs transition cursor-pointer shrink-0"
                      >
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1848a0] flex items-center justify-center mb-2">
                          <StageIcon name={st.icon} />
                        </div>
                        <div className="text-xs font-black text-slate-900">{st.label}</div>
                        <div className="text-[10.5px] text-slate-500 line-clamp-1 mt-0.5">
                          {st.description}
                        </div>
                      </button>
                    ))}
                </div>
              </section>
            )}

            {/* Quick Browse Categories */}
            <section className="space-y-2.5">
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-600">
                Quick Browse Categories
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {liveCategories.slice(0, 12).map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => setSelectedCategory(c.slug)}
                    className="rounded-2xl bg-white border border-slate-200 p-2.5 flex flex-col items-center text-center gap-1.5 hover:shadow-md transition cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center">
                      {c.imageUrl ? (
                        <img
                          src={normalizeRelativeAssetUrl(c.imageUrl)}
                          alt={c.title}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Tag className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 line-clamp-2 leading-tight">
                      {c.title}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Popular Fast-Moving Materials */}
            <section className="space-y-2.5">
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-600">
                Popular Fast-Moving Materials
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {liveProducts.slice(0, 8).map((p) => {
                  const qtyInfo = getProductCartInfo(p);
                  return (
                    <div
                      key={p.id}
                      className="rounded-2xl bg-white border border-slate-200 p-3 flex flex-col justify-between shadow-2xs hover:shadow-md transition"
                    >
                      <button
                        type="button"
                        onClick={() => openDetailSheet(p)}
                        className="text-left cursor-pointer space-y-2"
                      >
                        <div className="aspect-square rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center p-2">
                          {p.imageUrl ? (
                            <img
                              src={normalizeRelativeAssetUrl(p.imageUrl)}
                              alt={p.title}
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-slate-300" />
                          )}
                        </div>
                        <div className="text-xs font-black text-slate-900 line-clamp-2 leading-snug">
                          {p.title}
                        </div>
                        <div className="text-[10.5px] text-slate-500">{p.unit}</div>
                      </button>

                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-black text-slate-950">
                            ₹{p.sellingPrice.toLocaleString("en-IN")}
                          </div>
                          {p.mrp > p.sellingPrice && (
                            <div className="text-[10px] text-slate-400 line-through">
                              ₹{p.mrp.toLocaleString("en-IN")}
                            </div>
                          )}
                        </div>
                        {qtyInfo.quantity > 0 ? (
                          <div className="inline-flex items-center rounded-lg bg-[#0C831F] text-white text-xs font-black">
                            <button
                              type="button"
                              onClick={() => handleSetProductQty(p, qtyInfo.quantity - 1)}
                              className="px-2 py-1 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="px-1.5">{qtyInfo.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleSetProductQty(p, qtyInfo.quantity + 1)}
                              className="px-2 py-1 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetProductQty(p, 1)}
                            className="px-3 py-1.5 rounded-lg border border-[#0C831F] text-[#0C831F] hover:bg-[#0C831F] hover:text-white text-xs font-black transition cursor-pointer"
                          >
                            ADD
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            MODE B2: SEARCH RESULTS + FILTERS + ZERO-RESULT SOURCING RESCUE
           ══════════════════════════════════════════════════════════════════ */}
        {mode === "items" && isShowingResults && (
          <div className="space-y-4">
            {/* Sticky Horizontal Filter & Sort Strip */}
            <div className="sticky top-[108px] sm:top-[112px] z-30 bg-[#F8FAFC]/95 backdrop-blur-xs py-2 border-b border-slate-200/80">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 shrink-0 outline-none"
                >
                  <option value="relevance">Sort: Relevance</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="discount_desc">Max Discount</option>
                </select>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 shrink-0 outline-none max-w-[160px]"
                >
                  <option value="">All Categories</option>
                  {(results?.facets.categories || []).map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.title} ({c.count})
                    </option>
                  ))}
                </select>

                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 shrink-0 outline-none max-w-[150px]"
                >
                  <option value="">All Brands</option>
                  {(results?.facets.brands || []).map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name} ({b.count})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setInStockOnly((v) => !v)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold shrink-0 cursor-pointer transition ${
                    inStockOnly
                      ? "bg-[#1848a0] text-white border-[#1848a0]"
                      : "bg-white text-slate-700 border-slate-300"
                  }`}
                >
                  In Stock Only
                </button>

                <button
                  type="button"
                  onClick={() => setBulkOnly((v) => !v)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold shrink-0 cursor-pointer transition ${
                    bulkOnly
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-slate-700 border-slate-300"
                  }`}
                >
                  Bulk Deals
                </button>

                {(activeStage || selectedCategory || selectedBrand || inStockOnly || bulkOnly || sortBy !== "relevance") && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveStage("");
                      setSelectedCategory("");
                      setSelectedBrand("");
                      setInStockOnly(false);
                      setBulkOnly(false);
                      setSortBy("relevance");
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-black shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>
            </div>

            {/* Result Summary + Synonym Hint + Inferred Price Filter */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-black text-slate-700">
                {loadingResults ? "Searching..." : `${results?.total ?? 0} matching products`}
              </span>
              {results?.matchedSynonymHint && (
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#1848a0] border border-blue-200 font-bold">
                  Showing results for <strong>"{results.matchedSynonymHint.mapsTo}"</strong> (matched "{results.matchedSynonymHint.keyword}")
                </span>
              )}
              {results?.inferredFilters?.maxPrice && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                  Auto-Filter: Under ₹{results.inferredFilters.maxPrice}
                </span>
              )}
              {activeStage && (
                <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 font-bold">
                  Stage: {searchConfig.stageShortcuts.find((s) => s.id === activeStage)?.label || activeStage}
                </span>
              )}
            </div>

            {/* Product Results Grid */}
            {loadingResults && !results ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-56 rounded-2xl bg-white border border-slate-200 animate-pulse" />
                ))}
              </div>
            ) : (results?.items.length || 0) > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {results!.items.map((p) => {
                  const qtyInfo = getProductCartInfo(p);
                  const discountPct =
                    p.mrp > p.sellingPrice ? Math.round(((p.mrp - p.sellingPrice) / p.mrp) * 100) : 0;

                  return (
                    <div
                      key={p.id}
                      className="rounded-2xl bg-white border border-slate-200 p-3 flex flex-col justify-between shadow-2xs hover:shadow-md transition"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (query.trim()) recordRecent(query);
                          openDetailSheet(p);
                        }}
                        className="text-left cursor-pointer space-y-2"
                      >
                        <div className="relative aspect-square rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center p-2">
                          {discountPct > 0 && (
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-rose-600 text-white text-[9.5px] font-black shadow-2xs">
                              Save {discountPct}%
                            </span>
                          )}
                          {p.imageUrl ? (
                            <img
                              src={normalizeRelativeAssetUrl(p.imageUrl)}
                              alt={p.title}
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-slate-300" />
                          )}
                        </div>

                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#1848a0] truncate">
                          {p.brand}
                        </div>
                        <div className="text-xs sm:text-[13px] font-black text-slate-900 line-clamp-2 leading-snug">
                          {p.title}
                        </div>
                        <div className="text-[10.5px] text-slate-500 flex items-center gap-1.5">
                          <span>{p.unit}</span>
                          {p.variants?.length > 1 && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[9.5px]">
                              {p.variants.length} Options
                            </span>
                          )}
                        </div>
                        {p.bulkPrice > 0 && p.bulkPrice < p.sellingPrice && (
                          <div className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                            <Truck className="w-3 h-3" /> Bulk ₹{p.bulkPrice} ({p.bulkMinQty}+)
                          </div>
                        )}
                      </button>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-black text-slate-950">
                            ₹{p.sellingPrice.toLocaleString("en-IN")}
                          </div>
                          {p.mrp > p.sellingPrice && (
                            <div className="text-[10px] text-slate-400 line-through">
                              ₹{p.mrp.toLocaleString("en-IN")}
                            </div>
                          )}
                        </div>

                        {qtyInfo.quantity > 0 ? (
                          <div className="inline-flex items-center rounded-lg bg-[#0C831F] text-white text-xs font-black">
                            <button
                              type="button"
                              onClick={() => handleSetProductQty(p, qtyInfo.quantity - 1)}
                              className="px-2 py-1 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="px-1.5">{qtyInfo.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleSetProductQty(p, qtyInfo.quantity + 1)}
                              className="px-2 py-1 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={!p.isInStock}
                            onClick={() => handleSetProductQty(p, 1)}
                            className="px-3 py-1.5 rounded-lg border border-[#0C831F] text-[#0C831F] hover:bg-[#0C831F] hover:text-white text-xs font-black transition cursor-pointer disabled:opacity-40"
                          >
                            {p.isInStock ? "ADD" : "OUT"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Smart Zero-Result Rescue */
              <div className="space-y-4">
                <div className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 text-center space-y-3">
                  <Package className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    No direct catalog match for "{query || "your filters"}"
                  </h3>
                  {results?.didYouMean && results.didYouMean.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      <span className="text-xs font-bold text-slate-500">Did you mean:</span>
                      {results.didYouMean.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => executeSearchTerm(sug)}
                          className="px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-[#1848a0] text-xs font-black cursor-pointer"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Request 60-Min Sourcing Card */}
                <div className="rounded-3xl bg-gradient-to-br from-amber-50 via-white to-emerald-50 border-2 border-amber-300/80 p-5 sm:p-6 shadow-sm">
                  {reqSubmitted ? (
                    <div className="flex items-center gap-3 text-emerald-800">
                      <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                      <div>
                        <h4 className="text-sm sm:text-base font-black">
                          60-Min Sourcing Request Received!
                        </h4>
                        <p className="text-xs text-slate-600">
                          Our Lucknow procurement desk is checking partner depots right now and will call you back shortly.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!reqItemName.trim()) return;
                        setReqBusy(true);
                        try {
                          await submitSourcingRequest({
                            itemName: reqItemName.trim(),
                            quantityText: reqQty.trim() || "1 unit",
                            phone: reqPhone.trim(),
                            pincode: deliveryLoc.pincode || "226030",
                          });
                          setReqSubmitted(true);
                          toast.success("Sourcing request sent live to CONON Ops Team!");
                        } catch (err: any) {
                          toast.error(err?.message || "Failed to send request");
                        } finally {
                          setReqBusy(false);
                        }
                      }}
                      className="space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                          Custom Procurement
                        </span>
                        <h4 className="text-sm sm:text-base font-black text-slate-900">
                          Can't find it? Request 60-Min Sourcing
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600">
                        We source directly from Latouche Road, Chinhat &amp; Shaheed Path wholesale dealers.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <input
                          type="text"
                          required
                          value={reqItemName}
                          onChange={(e) => setReqItemName(e.target.value)}
                          placeholder="Material / Brand / Size"
                          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#1848a0]"
                        />
                        <input
                          type="text"
                          value={reqQty}
                          onChange={(e) => setReqQty(e.target.value)}
                          placeholder="Qty (e.g. 25 bags)"
                          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#1848a0]"
                        />
                        <input
                          type="tel"
                          required
                          value={reqPhone}
                          onChange={(e) => setReqPhone(e.target.value)}
                          placeholder="Phone number (10 digits)"
                          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#1848a0]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={reqBusy}
                        className="px-4 py-2.5 rounded-xl bg-[#1848a0] hover:bg-blue-800 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{reqBusy ? "Submitting..." : "Request 60-Min Sourcing"}</span>
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <ProductDetailSheet
        product={detailProduct}
        open={detailProduct !== null}
        onClose={() => setDetailProduct(null)}
        onAddToCart={(p, q) => {
          const found = liveProducts.find((lp) => lp.id === p.id);
          if (found) handleSetProductQty(found, (getProductCartInfo(found).quantity || 0) + (q || 1));
        }}
        onSetQty={(p, q) => {
          const found = liveProducts.find((lp) => lp.id === p.id);
          if (found) handleSetProductQty(found, q);
        }}
        cartQty={detailProduct ? cartQtyMap[String(detailProduct.title || "").toLowerCase()]?.quantity || 0 : 0}
      />

      <CartSheet />

      <VoiceSearchListenModal
        open={parchiVoiceOpen}
        onClose={() => setParchiVoiceOpen(false)}
        onResult={(spoken) => {
          const next = parchiText.trim() ? `${parchiText.trim()}\n${spoken}` : spoken;
          setParchiText(next);
          void handleParseParchi(next);
        }}
      />
    </div>
  );
}

export default SearchPage;
