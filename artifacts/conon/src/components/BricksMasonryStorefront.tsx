import React, { useState, useMemo } from "react";
import {
  Clock,
  ChevronRight,
  Minus,
  Plus,
  SlidersHorizontal,
  Truck,
  Bike,
  ShieldCheck,
  Check,
  Package,
  Layers,
  Sparkles,
  Info,
  Calculator,
  ArrowRight,
  FileText,
  AlertTriangle,
  HardHat,
} from "lucide-react";
import { toast } from "sonner";
import { ProductImage } from "@/components/ProductImage";
import {
  useAddToCart,
  useUpdateCartItem,
  useRemoveFromCart,
  useGetCart,
  getGetCartQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { useProductMediaVault } from "@/context/ProductMediaVaultContext";
import type { Product } from "@/components/ProductCard";
import { ALL_37_MASONRY_PRODUCTS, type MasonryProduct } from "@/data/masonryData";

export interface BricksMasonryStorefrontProps {
  onOpenDetail?: (product: Product) => void;
}

export function BricksMasonryStorefront({ onOpenDetail }: BricksMasonryStorefrontProps) {
  const qc = useQueryClient();
  const { resolveProduct } = useProductMediaVault();
  const invalidateCart = () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() });
  const addToCart = useAddToCart({ mutation: { onSuccess: invalidateCart } });
  const updateCartItem = useUpdateCartItem({ mutation: { onSuccess: invalidateCart } });
  const removeFromCart = useRemoveFromCart({ mutation: { onSuccess: invalidateCart } });
  const { data: cart } = useGetCart();

  // Active subcategory tab
  const [activeSubcat, setActiveSubcat] = useState<string>("ALL");
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL");
  const [selectedThickness, setSelectedThickness] = useState<string>("ALL");
  const [selectedGittiSize, setSelectedGittiSize] = useState<string>("ALL");
  const [selectedDeliveryMode, setSelectedDeliveryMode] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"relevance" | "price-asc" | "price-desc">("relevance");
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  // Unloading Labour option toggle
  const [withUnloadingLabour, setWithUnloadingLabour] = useState<boolean>(false);

  // Calculator toggles
  const [showCftCalculator, setShowCftCalculator] = useState<boolean>(true);
  const [showAacCalculator, setShowAacCalculator] = useState<boolean>(true);

  // CFT Calculator state
  const [cftPreset, setCftPreset] = useState<number>(100);
  const [selectedCftMaterialSlug, setSelectedCftMaterialSlug] = useState<string>(
    "banda-hamirpur-coarse-red-brown-morang-sand-rcc-per-cft",
  );

  // AAC Calculator state
  const [wallLengthFt, setWallLengthFt] = useState<number>(20);
  const [wallHeightFt, setWallHeightFt] = useState<number>(10);
  const [aacThickness, setAacThickness] = useState<number>(100); // 100mm = 4", 150mm = 6", 200mm = 8"
  const [selectedAacBrand, setSelectedAacBrand] = useState<string>("Birla Aerocon");

  // Cart item mapping
  const cartItemByKey = useMemo(() => {
    const map: Record<string, { ids: string[]; quantity: number }> = {};
    for (const c of cart?.categories ?? []) {
      for (const it of c.items ?? []) {
        const key = `${(it.category || "").toLowerCase()}::${(it.name || "").toLowerCase()}`;
        const entry = map[key] ?? (map[key] = { ids: [], quantity: 0 });
        entry.ids.push(String(it.id));
        entry.quantity += Number(it.quantity) || 0;
      }
    }
    return map;
  }, [cart]);

  const keyOf = (p: MasonryProduct) => `bricks::${p.title.toLowerCase()}`;
  const getCartQty = (p: MasonryProduct) => cartItemByKey[keyOf(p)]?.quantity ?? 0;

  // Add Product to Cart
  const handleAddToCart = (p: MasonryProduct, customQty?: number) => {
    const qty = customQty || 1;
    addToCart.mutate(
      {
        data: {
          materialId: p.id,
          quantity: qty,
          name: p.title,
          price: p.price,
          unit: p.unit,
          vendor: p.vendor,
          category: "bricks",
        },
      },
      {
        onSuccess: () =>
          toast.success(`${p.name} added to cart!`, {
            description: `${qty} ${p.unit} • ${p.deliveryMode === "EXPRESS_60_MIN" ? "⚡ 60-Min Express" : "🚛 Scheduled Heavy Delivery"}`,
          }),
        onError: () => toast.error("Could not add to cart. Please try again."),
      },
    );
  };

  const handleSetQty = (p: MasonryProduct, qty: number) => {
    const entry = cartItemByKey[keyOf(p)];
    if (!entry || entry.ids.length === 0) {
      if (qty > 0) handleAddToCart(p, qty);
      return;
    }
    entry.ids.slice(1).forEach((extraId) => removeFromCart.mutate({ itemId: extraId }));
    const primaryId = entry.ids[0];
    if (qty <= 0) {
      removeFromCart.mutate({ itemId: primaryId });
      return;
    }
    updateCartItem.mutate({ itemId: primaryId, data: { quantity: qty } });
  };

  // Convert MasonryProduct to Product for detail modal
  const openDetail = (p: MasonryProduct) => {
    const mapped: Product = {
      id: p.id,
      title: p.title,
      vendor: p.vendor,
      materialTag: "Bricks",
      price: p.price,
      mrp: p.mrp,
      unit: p.unit,
      rating: p.rating,
      reviews: p.reviewsCount,
      deliveryEta: p.deliveryEta,
      image: p.image,
      images: p.images,
      description: p.description,
      features: p.highlights,
      specs: p.specifications,
    };
    if (onOpenDetail) {
      onOpenDetail(mapped);
    } else {
      setModalProduct(mapped);
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    let list = ALL_37_MASONRY_PRODUCTS.map((p) => resolveProduct(p)).filter((p) => {
      // Subcategory filter
      if (activeSubcat !== "ALL" && p.masonrySubcategory !== activeSubcat) {
        return false;
      }
      // Brand filter
      if (selectedBrand !== "ALL" && !p.brand.toLowerCase().includes(selectedBrand.toLowerCase())) {
        return false;
      }
      // AAC Thickness filter
      if (selectedThickness !== "ALL") {
        if (selectedThickness === "4" && p.thicknessMm !== 100) return false;
        if (selectedThickness === "6" && p.thicknessMm !== 150) return false;
        if (selectedThickness === "8" && p.thicknessMm !== 200) return false;
      }
      // Gitti Size filter
      if (selectedGittiSize !== "ALL") {
        if (p.aggregateSizeMm !== Number(selectedGittiSize)) return false;
      }
      // Delivery Mode filter
      if (selectedDeliveryMode !== "ALL" && p.deliveryMode !== selectedDeliveryMode) {
        return false;
      }
      return true;
    });

    if (sortBy === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [
    activeSubcat,
    selectedBrand,
    selectedThickness,
    selectedGittiSize,
    selectedDeliveryMode,
    sortBy,
    resolveProduct,
  ]);

  // Subcategory Counts
  const subcatCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: ALL_37_MASONRY_PRODUCTS.length };
    ALL_37_MASONRY_PRODUCTS.forEach((p) => {
      counts[p.masonrySubcategory] = (counts[p.masonrySubcategory] || 0) + 1;
    });
    return counts;
  }, []);

  // Cross-sell Detection from Cart
  const cartHasAAC = useMemo(() => {
    for (const c of cart?.categories ?? []) {
      for (const it of c.items ?? []) {
        const lower = (it.name || "").toLowerCase();
        if (lower.includes("aac block") || lower.includes("aerocon") || lower.includes("magic blox") || lower.includes("xtralite")) {
          return true;
        }
      }
    }
    return false;
  }, [cart]);

  const cartHasMorangOrGitti = useMemo(() => {
    let hasMorang = false;
    let hasGitti = false;
    for (const c of cart?.categories ?? []) {
      for (const it of c.items ?? []) {
        const lower = (it.name || "").toLowerCase();
        if (lower.includes("morang") || lower.includes("river sand")) hasMorang = true;
        if (lower.includes("gitti") || lower.includes("stone aggregate") || lower.includes("20mm kali")) hasGitti = true;
      }
    }
    return hasMorang && hasGitti;
  }, [cart]);

  const cartHasPavers = useMemo(() => {
    for (const c of cart?.categories ?? []) {
      for (const it of c.items ?? []) {
        const lower = (it.name || "").toLowerCase();
        if (lower.includes("paver") || lower.includes("interlocking")) return true;
      }
    }
    return false;
  }, [cart]);

  // Quick Add for Recommended Items
  const handleAddFixoblock = () => {
    addToCart.mutate(
      {
        data: {
          materialId: "ultratech-fixoblock-aac-jointing-40kg",
          quantity: 1,
          name: "UltraTech Fixoblock AAC Block Jointing Adhesive (40 kg Bag)",
          price: 380,
          unit: "40 kg Bag",
          vendor: "UltraTech Lucknow Depot",
          category: "chemicals",
        },
      },
      {
        onSuccess: () => toast.success("UltraTech Fixoblock 40kg added to cart!"),
      },
    );
  };

  const handleAddCoverBlocks = () => {
    addToCart.mutate(
      {
        data: {
          materialId: "prod-masonry-standard-precast-concrete-cover-blocks-pack-100",
          quantity: 1,
          name: "Standard Precast — Multi-Size Concrete Cover Blocks 20/25/40/50mm (Pack of 100)",
          price: 185,
          unit: "Pack of 100",
          vendor: "Lucknow Central Rapid Supply Hub",
          category: "bricks",
        },
      },
      {
        onSuccess: () => toast.success("Cover Blocks (Pack of 100) added to cart!"),
      },
    );
  };

  const handleAddBeddingDust = () => {
    addToCart.mutate(
      {
        data: {
          materialId: "prod-masonry-kabrai-concrete-stone-dust-cft",
          quantity: 50,
          name: "Kabrai Crusher — Concrete Stone Dust / Crushed M-Sand (per CFT)",
          price: 44,
          unit: "per CFT",
          vendor: "Transport Nagar Crusher Depot",
          category: "bricks",
        },
      },
      {
        onSuccess: () => toast.success("50 CFT Stone Dust added to cart for paver bedding!"),
      },
    );
  };

  // Calculations for CFT Calculator
  const selectedCftProduct = useMemo(() => {
    return ALL_37_MASONRY_PRODUCTS.find((p) => p.slug === selectedCftMaterialSlug) || ALL_37_MASONRY_PRODUCTS[21];
  }, [selectedCftMaterialSlug]);

  const cftPrice = selectedCftProduct.price;
  const cftTotalAmount = cftPreset * cftPrice;
  const cftExGst = Math.round(cftTotalAmount / 1.05);
  const cftGstAmount = cftTotalAmount - cftExGst;
  const cftEstimatedTrolleys = (cftPreset / 100).toFixed(1);

  // Calculations for AAC Wall Calculator
  const aacWallAreaSqFt = wallLengthFt * wallHeightFt;
  const aacBlockCoverageSqFt = 1.29; // 600mm x 200mm = 0.12 m² = 1.291 sq ft
  const aacBlocksNeeded = Math.ceil((aacWallAreaSqFt / aacBlockCoverageSqFt) * 1.05); // +5% wastage
  const aacPcsPerCbm = aacThickness === 100 ? 83.33 : aacThickness === 150 ? 55.55 : 41.66;
  const aacCbmVolume = (aacBlocksNeeded / aacPcsPerCbm).toFixed(2);
  const fixoblockBagsNeeded = Math.max(1, Math.ceil(Number(aacCbmVolume)));

  // Selected AAC block product
  const matchedAacProduct = useMemo(() => {
    return (
      ALL_37_MASONRY_PRODUCTS.find(
        (p) =>
          p.masonrySubcategory === "AAC_CONCRETE_BLOCKS" &&
          p.thicknessMm === aacThickness &&
          p.brand.toLowerCase().includes(selectedAacBrand.toLowerCase()) &&
          p.sellingUnit === "PIECE",
      ) || ALL_37_MASONRY_PRODUCTS[6]
    );
  }, [aacThickness, selectedAacBrand]);

  const aacEstimatedCost = aacBlocksNeeded * matchedAacProduct.price;

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* ── Top Header Banner ──────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-red-950 text-white px-4 pt-6 pb-6 shadow-md border-b border-amber-900/40">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Lucknow Bhatta &amp; Crusher Aggregator
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  2026 Multi-Slab GST (5% / 12% / 18%)
                </span>
                <span className="text-[10px] font-bold text-slate-300">
                  Kisan Path • Sitapur Rd • Sultanpur Rd • Kanpur Rd • Chinhat
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight text-white">
                Bricks, Sand (Morang), Gitti &amp; AAC Blocks
              </h1>
              <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-3xl leading-relaxed">
                Direct stockyard dispatch of Avval red bricks, autoclaved aerated concrete (AAC) blocks, authentic Banda coarse morang, Kabrai Mahoba black granite gitti, and precast cover blocks with site measurement and UP eMM-11 transit pass compliance.
              </p>
            </div>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur px-3 py-2 rounded-xl border border-white/10 text-xs">
                <FileText className="w-4 h-4 text-amber-400" />
                <div className="text-left">
                  <p className="font-black text-[11px] leading-tight">UP eMM-11 Pass</p>
                  <p className="text-[9px] text-slate-300">Mining Law Compliant</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur px-3 py-2 rounded-xl border border-white/10 text-xs">
                <Truck className="w-4 h-4 text-emerald-400" />
                <div className="text-left">
                  <p className="font-black text-[11px] leading-tight">No-Entry Timing</p>
                  <p className="text-[9px] text-slate-300">Scheduled Heavy Fleet</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-5">
        {/* ── Subcategory Tabs ──────────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {[
            { id: "ALL", label: "All Materials", count: subcatCounts.ALL },
            { id: "BRICKS", label: "Red Clay & Fly Ash Bricks", count: subcatCounts.BRICKS },
            { id: "AAC_CONCRETE_BLOCKS", label: "AAC & Concrete Blocks", count: subcatCounts.AAC_CONCRETE_BLOCKS },
            { id: "SAND_MORANG", label: "Sand, Morang & Stone Dust", count: subcatCounts.SAND_MORANG },
            { id: "GITTI_AGGREGATES", label: "Stone Aggregates (Gitti)", count: subcatCounts.GITTI_AGGREGATES },
            { id: "PAVERS_COVER_BLOCKS", label: "Pavers & Cover Blocks", count: subcatCounts.PAVERS_COVER_BLOCKS },
          ].map((tab) => {
            const active = activeSubcat === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubcat(tab.id);
                  setSelectedThickness("ALL");
                  setSelectedGittiSize("ALL");
                }}
                className={`shrink-0 px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 ${
                  active
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    active ? "bg-amber-400 text-slate-950" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Secondary Filter Chips ────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-200/60">
          <span className="text-[11px] font-black uppercase text-slate-400 flex items-center gap-1 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filters:
          </span>

          {/* Brand/Origin Filter */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="ALL">All Brands &amp; Origins</option>
            <optgroup label="Lucknow Bhatta & Aggregates">
              <option value="Lucknow Bhatta">Lucknow Bhatta (Avval / Doyam)</option>
              <option value="Banda">Banda / Hamirpur (Ken-Betwa Morang)</option>
              <option value="Kabrai">Kabrai / Mahoba (Black Granite)</option>
              <option value="Yamuna">Yamuna / Local (Plaster Sand)</option>
              <option value="Ghaghara">Ghaghara / Ganga (River Balu)</option>
            </optgroup>
            <optgroup label="AAC Block Brands">
              <option value="Birla Aerocon">Birla Aerocon</option>
              <option value="Magicrete">Magicrete (Magic Blox)</option>
              <option value="UltraTech">UltraTech (Xtralite)</option>
              <option value="Adani">Adani / ACC Cool Walls</option>
              <option value="JKM">JKM A+</option>
            </optgroup>
            <optgroup label="Precast & Pavers">
              <option value="Local Precast">Local Precast</option>
              <option value="Standard Precast">Standard Precast</option>
            </optgroup>
          </select>

          {/* Conditional AAC Thickness Filter */}
          {(activeSubcat === "ALL" || activeSubcat === "AAC_CONCRETE_BLOCKS") && (
            <select
              value={selectedThickness}
              onChange={(e) => setSelectedThickness(e.target.value)}
              className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="ALL">All Thicknesses</option>
              <option value="4">4 Inch (100mm | 83 pcs/m³)</option>
              <option value="6">6 Inch (150mm | 55 pcs/m³)</option>
              <option value="8">8 Inch (200mm | 41 pcs/m³)</option>
            </select>
          )}

          {/* Conditional Gitti Size Filter */}
          {(activeSubcat === "ALL" || activeSubcat === "GITTI_AGGREGATES") && (
            <select
              value={selectedGittiSize}
              onChange={(e) => setSelectedGittiSize(e.target.value)}
              className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="ALL">All Gitti Sizes</option>
              <option value="6">6mm (Jeera Gitti)</option>
              <option value="10">10mm (Lintels &amp; Columns)</option>
              <option value="20">20mm (RCC Slabs &amp; Footings)</option>
              <option value="40">40mm (Soling &amp; Sub-Base)</option>
            </select>
          )}

          {/* Delivery Mode Filter */}
          <select
            value={selectedDeliveryMode}
            onChange={(e) => setSelectedDeliveryMode(e.target.value)}
            className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="ALL">All Delivery Modes</option>
            <option value="EXPRESS_60_MIN">⚡ 60-Min Express (Bike / E-Loader)</option>
            <option value="SAME_DAY_SCHEDULED">🚛 Scheduled Heavy (Trolley / Truck)</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-500 ml-auto"
          >
            <option value="relevance">Sort: Recommended</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        {/* ── Interactive Calculators Row ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
          {/* CALCULATOR 1: Sand/Gitti CFT-to-Trolley Quick Selector */}
          <div className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-black text-sm text-slate-900 leading-tight">
                    Sand &amp; Gitti CFT Preset Selector
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Quick-select volume with UP eMM-11 Mining Transit Pass
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCftCalculator(!showCftCalculator)}
                className="text-xs font-bold text-amber-700 hover:text-amber-800"
              >
                {showCftCalculator ? "Hide" : "Show"}
              </button>
            </div>

            {showCftCalculator && (
              <div className="space-y-3 pt-1">
                {/* Material Choice */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                    Select Material Type (5% GST):
                  </label>
                  <select
                    value={selectedCftMaterialSlug}
                    onChange={(e) => setSelectedCftMaterialSlug(e.target.value)}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800"
                  >
                    <option value="banda-hamirpur-coarse-red-brown-morang-sand-rcc-per-cft">
                      Banda Coarse Morang (RCC Grade) — ₹62 / CFT
                    </option>
                    <option value="yamuna-local-fine-plastering-morang-sand-p-sand-per-cft">
                      Yamuna Fine Plaster Morang (P-Sand) — ₹56 / CFT
                    </option>
                    <option value="ghaghara-ganga-white-grey-river-balu-sand-per-cft">
                      Ghaghara Natural White Balu — ₹38 / CFT
                    </option>
                    <option value="kabrai-mahoba-20mm-kali-crushed-stone-gitti-rcc-per-cft">
                      Kabrai 20mm Kali Crushed Gitti — ₹58 / CFT
                    </option>
                    <option value="kabrai-mahoba-10mm-crushed-stone-gitti-finishing-per-cft">
                      Kabrai 10mm Crushed Gitti — ₹57 / CFT
                    </option>
                    <option value="kabrai-crusher-concrete-stone-dust-crushed-m-sand-per-cft">
                      Kabrai Concrete Stone Dust (M-Sand) — ₹44 / CFT
                    </option>
                  </select>
                </div>

                {/* Preset Volume Buttons */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1.5 block">
                    Choose Volume Preset:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { cft: 50, label: "50 CFT", sub: "Half Trolley" },
                      { cft: 100, label: "100 CFT", sub: "1 Brass Trolley" },
                      { cft: 200, label: "200 CFT", sub: "2 Trolleys" },
                      { cft: 400, label: "400 CFT", sub: "Dumper Load" },
                    ].map((btn) => (
                      <button
                        key={btn.cft}
                        onClick={() => setCftPreset(btn.cft)}
                        className={`p-2 rounded-xl text-center border transition ${
                          cftPreset === btn.cft
                            ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <p className="font-black text-xs">{btn.label}</p>
                        <p className={`text-[9px] ${cftPreset === btn.cft ? "text-amber-100" : "text-slate-400"}`}>
                          {btn.sub}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculation Summary Box */}
                <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900">
                        Total: ₹{cftTotalAmount.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        (Ex-GST ₹{cftExGst.toLocaleString("en-IN")} + 5% GST ₹{cftGstAmount})
                      </span>
                    </div>
                    <p className="text-[10px] text-amber-800 font-bold mt-0.5 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-amber-600" />
                      <span>{cftPreset} CFT ({cftEstimatedTrolleys} Trolley Load) • Verified eMM-11 Mining Pass</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddToCart(selectedCftProduct, cftPreset)}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl transition shadow-sm"
                  >
                    Add {cftPreset} CFT
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* CALCULATOR 2: AAC Block Wall Area Calculator */}
          <div className="bg-white rounded-2xl p-4 border border-sky-200/80 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-700">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-black text-sm text-slate-900 leading-tight">
                    AAC Block Wall Calculator
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Input wall dimensions → auto-computes blocks &amp; Fixoblock adhesive bags
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAacCalculator(!showAacCalculator)}
                className="text-xs font-bold text-sky-700 hover:text-sky-800"
              >
                {showAacCalculator ? "Hide" : "Show"}
              </button>
            </div>

            {showAacCalculator && (
              <div className="space-y-3 pt-1">
                {/* Wall Dimensions Inputs */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 mb-1 block">
                      Wall Length (Feet):
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={wallLengthFt}
                      onChange={(e) => setWallLengthFt(Math.max(1, Number(e.target.value)))}
                      className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 mb-1 block">
                      Wall Height (Feet):
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={wallHeightFt}
                      onChange={(e) => setWallHeightFt(Math.max(1, Number(e.target.value)))}
                      className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800"
                    />
                  </div>
                </div>

                {/* Thickness & Brand */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 mb-1 block">
                      Thickness:
                    </label>
                    <select
                      value={aacThickness}
                      onChange={(e) => setAacThickness(Number(e.target.value))}
                      className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800"
                    >
                      <option value={100}>4 Inch (100mm) — Internal Partition</option>
                      <option value={150}>6 Inch (150mm) — Common Wall</option>
                      <option value={200}>8 Inch (200mm) — Outer Facade</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 mb-1 block">
                      Brand Preference:
                    </label>
                    <select
                      value={selectedAacBrand}
                      onChange={(e) => setSelectedAacBrand(e.target.value)}
                      className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800"
                    >
                      <option value="Birla Aerocon">Birla Aerocon (Tier-1)</option>
                      <option value="Magicrete">Magicrete Magic Blox</option>
                      <option value="UltraTech">UltraTech Xtralite</option>
                    </select>
                  </div>
                </div>

                {/* AAC Calculation Output */}
                <div className="bg-sky-50/70 border border-sky-200/70 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900">
                        {aacBlocksNeeded} Blocks Needed
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        ({aacWallAreaSqFt} sq ft • ~{aacCbmVolume} m³ • ₹{aacEstimatedCost.toLocaleString("en-IN")})
                      </span>
                    </div>
                    <p className="text-[10px] text-sky-800 font-bold mt-0.5">
                      ✓ Requires ~{fixoblockBagsNeeded} bag(s) Fixoblock 40kg adhesive (+5% breakage buffer)
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddToCart(matchedAacProduct, aacBlocksNeeded)}
                    className="px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-black rounded-xl transition shadow-sm"
                  >
                    Add {aacBlocksNeeded} Blocks
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Site-Engineer Cross-Category Pairing Recommendations ──────────── */}
        {(cartHasAAC || cartHasMorangOrGitti || cartHasPavers) && (
          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-800/40 text-white shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="font-display font-black text-sm tracking-wide text-emerald-200">
                Site-Engineer Smart Recommendations
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              {/* AAC -> Fixoblock */}
              {cartHasAAC && (
                <div className="bg-white/10 rounded-xl p-3 border border-white/10 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                      AAC Block Adhesive
                    </span>
                    <h4 className="font-bold text-xs text-white mt-1.5 leading-snug">
                      UltraTech Fixoblock 40kg Bag (₹380)
                    </h4>
                    <p className="text-[10px] text-slate-300 mt-1">
                      Use thin-bed block adhesive instead of sand-cement mortar to eliminate shrinkage cracks.
                    </p>
                  </div>
                  <button
                    onClick={handleAddFixoblock}
                    className="mt-2.5 w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black rounded-lg transition"
                  >
                    + Add Fixoblock (₹380)
                  </button>
                </div>
              )}

              {/* Morang + Gitti -> Cover Blocks */}
              {cartHasMorangOrGitti && (
                <div className="bg-white/10 rounded-xl p-3 border border-white/10 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-sky-300 bg-sky-500/20 px-2 py-0.5 rounded-full">
                      RCC Slab Casting Kit
                    </span>
                    <h4 className="font-bold text-xs text-white mt-1.5 leading-snug">
                      Multi-Size Concrete Cover Blocks (₹185)
                    </h4>
                    <p className="text-[10px] text-slate-300 mt-1">
                      Pack of 100 spacers for 20/25/40/50mm rebar offset. Pair with UltraTech Cement &amp; Dr. Fixit LW+.
                    </p>
                  </div>
                  <button
                    onClick={handleAddCoverBlocks}
                    className="mt-2.5 w-full py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-black rounded-lg transition"
                  >
                    + Add Cover Blocks (₹185)
                  </button>
                </div>
              )}

              {/* Pavers -> Bedding Stone Dust */}
              {cartHasPavers && (
                <div className="bg-white/10 rounded-xl p-3 border border-white/10 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full">
                      Paver Bedding Sand
                    </span>
                    <h4 className="font-bold text-xs text-white mt-1.5 leading-snug">
                      Kabrai Concrete Stone Dust (₹44/CFT)
                    </h4>
                    <p className="text-[10px] text-slate-300 mt-1">
                      50 CFT bed layer provides solid compacted subgrade under 60mm/80mm interlocking pavers.
                    </p>
                  </div>
                  <button
                    onClick={handleAddBeddingDust}
                    className="mt-2.5 w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-black rounded-lg transition"
                  >
                    + Add 50 CFT Bedding Dust
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Unloading Labour & Lucknow No-Entry Notice ────────────────────────── */}
        <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Lucknow Municipal Daytime No-Entry:</strong> Heavy Trolley &amp; Dumper deliveries operate during off-peak windows (04:00 AM–07:00 AM &amp; 11:00 PM–04:00 AM) inside municipal limits. 2-Wheeler Cover Blocks dispatch instantly in 60 mins.
            </span>
          </div>

          <label className="flex items-center gap-2 shrink-0 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={withUnloadingLabour}
              onChange={(e) => setWithUnloadingLabour(e.target.checked)}
              className="rounded border-amber-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
            />
            <span className="font-bold text-slate-800 text-[11px]">
              Include Site Unloading Labour (+₹400/trolley or +₹0.50/brick)
            </span>
          </label>
        </div>

        {/* ── Product Cards Grid ──────────────────────────────────────────────── */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-black text-lg text-slate-900">
              Verified Lucknow Materials ({filteredProducts.length} SKUs)
            </h2>
            <span className="text-xs text-slate-400 font-bold">
              Showing authentic bhatta &amp; crusher rates
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((p) => {
              const inCartQty = getCartQty(p);
              const isExpress = p.deliveryMode === "EXPRESS_60_MIN";

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {/* Image Container with Badges */}
                    <div
                      onClick={() => openDetail(p)}
                      className="relative h-48 bg-slate-100 cursor-pointer overflow-hidden group"
                    >
                      <ProductImage
                        src={p.image}
                        alt={p.name}
                        sku={p.slug || p.id}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition duration-300"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-900/80 text-white backdrop-blur">
                          {p.brand}
                        </span>
                        {p.requiresMiningTransitPass && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 shadow-sm flex items-center gap-1">
                            <FileText className="w-2.5 h-2.5" /> eMM-11 Pass
                          </span>
                        )}
                      </div>

                      {/* Delivery Mode Badge */}
                      <div className="absolute top-2 right-2">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm ${
                            isExpress
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-900 text-white"
                          }`}
                        >
                          {isExpress ? <Bike className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                          {isExpress ? "60 Mins" : "Heavy Scheduled"}
                        </span>
                      </div>

                      {/* Bottom Info Bar on Image */}
                      <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10px] font-bold text-slate-600 bg-white/90 backdrop-blur px-2 py-1 rounded-lg">
                        <span className="truncate">{p.dimensionsLabel || p.unit}</span>
                        <span className="font-extrabold text-slate-900">{p.gstPercent}% GST</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mb-1">
                        <span>{p.subCategory}</span>
                        <span>•</span>
                        <span>HSN {p.hsnCode}</span>
                      </div>

                      <h3
                        onClick={() => openDetail(p)}
                        className="font-bold text-sm text-slate-900 line-clamp-2 hover:text-amber-700 cursor-pointer leading-snug"
                        title={p.name}
                      >
                        {p.name}
                      </h3>

                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                        {p.shortTagline}
                      </p>

                      {/* Chips */}
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {p.specChips.slice(0, 3).map((chip, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600"
                          >
                            {chip}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Price & Add Button */}
                  <div className="p-4 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-black text-slate-900 font-display">
                          ₹{p.price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          / {p.unit}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-400 font-semibold">
                        Ex-GST: ₹{p.exGstPrice.toLocaleString("en-IN")} • {p.gstPercent}% GST
                      </p>
                    </div>

                    {/* Add to Cart or Qty Incrementer */}
                    {inCartQty > 0 ? (
                      <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 rounded-xl px-2 py-1">
                        <button
                          onClick={() => handleSetQty(p, inCartQty - 1)}
                          className="w-6 h-6 flex items-center justify-center text-amber-900 hover:bg-amber-200/60 rounded-lg transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-black text-xs text-amber-950 px-1">
                          {inCartQty}
                        </span>
                        <button
                          onClick={() => handleSetQty(p, inCartQty + 1)}
                          className="w-6 h-6 flex items-center justify-center text-amber-900 hover:bg-amber-200/60 rounded-lg transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(p, 1)}
                        className="px-4 py-2 bg-slate-900 hover:bg-amber-600 text-white text-xs font-black rounded-xl transition shadow-sm active:scale-95"
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 mt-4">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No materials match selected filters</p>
              <p className="text-xs text-slate-400 mt-1">Try resetting brand or thickness filters</p>
              <button
                onClick={() => {
                  setActiveSubcat("ALL");
                  setSelectedBrand("ALL");
                  setSelectedThickness("ALL");
                  setSelectedGittiSize("ALL");
                  setSelectedDeliveryMode("ALL");
                }}
                className="mt-3 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {modalProduct && (
        <ProductDetailModal
          product={modalProduct}
          open={true}
          isOpen={true}
          onClose={() => setModalProduct(null)}
          onAddToCart={() => {}}
          onSetQty={() => {}}
          isAdding={false}
          cartQty={0}
        />
      )}
    </div>
  );
}
