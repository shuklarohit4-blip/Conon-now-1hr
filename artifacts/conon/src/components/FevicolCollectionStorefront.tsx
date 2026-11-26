import React, { useState, useMemo } from "react";
import {
  Clock,
  Bike,
  Truck,
  ShieldCheck,
  AlertTriangle,
  Calculator,
  Sparkles,
  Plus,
  Minus,
  ChevronRight,
  X,
  SlidersHorizontal,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
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
import { RealProductImage } from "@/components/RealProductImage";
import {
  ALL_45_ADHESIVES_PRODUCTS,
  type AdhesiveProduct,
} from "@/data/adhesivesData";

export interface FevicolCollectionStorefrontProps {
  onOpenDetail?: (product: Product) => void;
  onBackToDirectory?: () => void;
}

const SUBCATEGORIES = [
  { id: "ALL", label: "All Items", count: 45 },
  { id: "WOOD_LAMINATE", label: "Wood & Laminates", count: 20 },
  { id: "CONTACT_RUBBER", label: "Contact & Rubber", count: 3 },
  { id: "EPOXY_INSTANT", label: "Epoxy & Instant Repair", count: 10 },
  { id: "SEALANT_FOAM", label: "Silicone, PU & Foam", count: 8 },
  { id: "APPLICATOR_TAPE", label: "Applicators & Tapes", count: 4 },
];

const BRAND_TIERS = [
  { id: "ALL", label: "All Brands" },
  { id: "TIER1", label: "Tier 1: Core Wood & Epoxy (Fevicol, Araldite, M-Seal)" },
  { id: "TIER2", label: "Tier 2: Silicone & PU (Dowsil, Wacker, Soudal)" },
  { id: "TIER3", label: "Tier 3: Tools & Tapes (Ingco, ABRO)" },
];

export function FevicolCollectionStorefront({
  onOpenDetail,
  onBackToDirectory,
}: FevicolCollectionStorefrontProps) {
  const qc = useQueryClient();
  const { resolveProduct } = useProductMediaVault();
  const invalidateCart = () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() });
  const addToCart = useAddToCart({ mutation: { onSuccess: invalidateCart } });
  const updateCartItem = useUpdateCartItem({ mutation: { onSuccess: invalidateCart } });
  const removeFromCart = useRemoveFromCart({ mutation: { onSuccess: invalidateCart } });
  const { data: cart } = useGetCart();

  // Filters State
  const [activeSubcat, setActiveSubcat] = useState<string>("ALL");
  const [selectedBrandTier, setSelectedBrandTier] = useState<string>("ALL");
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL");
  const [cureFilter, setCureFilter] = useState<string>("ALL"); // "ALL" | "NEUTRAL" | "ACETOXY_GP"

  // Calculator State
  const [showCalculator, setShowCalculator] = useState(false);
  const [sheetCount, setSheetCount] = useState<number>(20);

  // Detail Modal State
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  // Cart Quantities Map
  const cartItemByKey = useMemo(() => {
    const map: Record<string, { ids: string[]; quantity: number }> = {};
    for (const c of cart?.categories ?? []) {
      for (const it of c.items ?? []) {
        const key = `${(it.category || "").toLowerCase()}::${(it.name || "").toLowerCase()}`;
        if (!map[key]) {
          map[key] = { ids: [it.id], quantity: it.quantity };
        } else {
          map[key].ids.push(it.id);
          map[key].quantity += it.quantity;
        }
      }
    }
    return map;
  }, [cart]);

  const getItemCartState = (prod: AdhesiveProduct) => {
    const key = `${prod.categorySlug.toLowerCase()}::${prod.name.toLowerCase()}`;
    return cartItemByKey[key] || { ids: [], quantity: 0 };
  };

  // Unique Brands list
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    ALL_45_ADHESIVES_PRODUCTS.forEach((p) => brands.add(p.brand));
    return ["ALL", ...Array.from(brands)];
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return ALL_45_ADHESIVES_PRODUCTS.map((p) => resolveProduct(p)).filter((prod) => {
      // Subcategory filter
      if (activeSubcat !== "ALL" && prod.adhesiveSubcategory !== activeSubcat) {
        return false;
      }
      // Brand Tier filter
      if (selectedBrandTier === "TIER1" && prod.brandTier !== 1) return false;
      if (selectedBrandTier === "TIER2" && prod.brandTier !== 2) return false;
      if (selectedBrandTier === "TIER3" && prod.brandTier !== 3) return false;

      // Specific Brand filter
      if (selectedBrand !== "ALL" && prod.brand !== selectedBrand) return false;

      // Cure Type filter
      if (cureFilter !== "ALL" && prod.cureType !== cureFilter) return false;

      return true;
    });
  }, [activeSubcat, selectedBrandTier, selectedBrand, cureFilter, resolveProduct]);

  // Laminate Sheet Calculator Calculation
  const calculatorResult = useMemo(() => {
    const totalKgNeeded = Math.ceil(sheetCount * 0.72);
    // Determine optimal pack breakdown
    let remaining = totalKgNeeded;
    const fiftyKgDrums = Math.floor(remaining / 50);
    remaining %= 50;
    const twentyKgDrums = Math.floor(remaining / 20);
    remaining %= 20;
    const fiveKgBuckets = Math.floor(remaining / 5);
    remaining %= 5;
    const twoKgJars = Math.floor(remaining / 2);
    remaining %= 2;
    const oneKgPacks = remaining;

    const estimatedCostSH =
      fiftyKgDrums * 11200 +
      twentyKgDrums * 4850 +
      fiveKgBuckets * 1286 +
      twoKgJars * 564 +
      oneKgPacks * 297;

    const estimatedCostMarine =
      fiftyKgDrums * 14500 +
      twentyKgDrums * 6100 +
      fiveKgBuckets * 1550 +
      twoKgJars * 699 +
      oneKgPacks * 364;

    return {
      sheets: sheetCount,
      totalKgNeeded,
      packs: {
        fiftyKg: fiftyKgDrums,
        twentyKg: twentyKgDrums,
        fiveKg: fiveKgBuckets,
        twoKg: twoKgJars,
        oneKg: oneKgPacks,
      },
      estimatedCostSH,
      estimatedCostMarine,
    };
  }, [sheetCount]);

  const handleAddCalculatedPackToCart = (brandType: "SH" | "Marine") => {
    const packs = calculatorResult.packs;
    const itemsToAdd: { id: string; qty: number }[] = [];

    if (brandType === "SH") {
      if (packs.fiftyKg > 0) itemsToAdd.push({ id: "prod-adh-fevicol-sh-50kg", qty: packs.fiftyKg });
      if (packs.twentyKg > 0) itemsToAdd.push({ id: "prod-adh-fevicol-sh-20kg", qty: packs.twentyKg });
      if (packs.fiveKg > 0) itemsToAdd.push({ id: "prod-adh-fevicol-sh-5kg", qty: packs.fiveKg });
      if (packs.twoKg > 0) itemsToAdd.push({ id: "prod-adh-fevicol-sh-2kg", qty: packs.twoKg });
      if (packs.oneKg > 0) itemsToAdd.push({ id: "prod-adh-fevicol-sh-1kg", qty: packs.oneKg });
    } else {
      if (packs.fiftyKg > 0) itemsToAdd.push({ id: "prod-adh-fevicol-marine-50kg", qty: packs.fiftyKg });
      if (packs.twentyKg > 0) itemsToAdd.push({ id: "prod-adh-fevicol-marine-20kg", qty: packs.twentyKg });
      if (packs.fiveKg > 0) itemsToAdd.push({ id: "prod-adh-fevicol-marine-5kg", qty: packs.fiveKg });
      if (packs.twoKg > 0) itemsToAdd.push({ id: "prod-adh-fevicol-marine-2kg", qty: packs.twoKg });
      if (packs.oneKg > 0) itemsToAdd.push({ id: "prod-adh-fevicol-marine-1kg", qty: packs.oneKg });
    }

    for (const item of itemsToAdd) {
      const p = ALL_45_ADHESIVES_PRODUCTS.find((x) => x.id === item.id);
      if (p) {
        addToCart.mutate({
          data: {
            materialId: p.id,
            category: p.categorySlug,
            name: p.name,
            quantity: item.qty,
            price: p.price,
            unit: p.unit,
          },
        });
      }
    }

    if (itemsToAdd.length > 0) {
      toast.success(
        `Added optimal ${brandType === "SH" ? "Fevicol SH" : "Fevicol Marine"} packs (${calculatorResult.totalKgNeeded} kg) to cart!`
      );
    }
  };

  const handleCardClick = (prod: AdhesiveProduct) => {
    const p: Product = {
      id: prod.id,
      title: prod.title || prod.name,
      vendor: prod.vendor,
      materialTag: prod.categorySlug,
      brand: prod.brand,
      price: prod.price,
      mrp: prod.mrp,
      unit: prod.unit,
      rating: prod.rating,
      reviews: prod.reviewsCount,
      deliveryEta: prod.deliveryEta,
      image: prod.image,
      images: prod.images,
      description: prod.description,
      features: prod.highlights,
      specs: prod.specifications,
    };
    if (onOpenDetail) {
      onOpenDetail(p);
    } else {
      setModalProduct(p);
    }
  };

  const handleAddToCart = (e: React.MouseEvent, prod: AdhesiveProduct) => {
    e.stopPropagation();
    addToCart.mutate(
      {
        data: {
          materialId: prod.id,
          category: prod.categorySlug,
          name: prod.name,
          quantity: 1,
          price: prod.price,
          unit: prod.unit,
        },
      },
      {
        onSuccess: () => {
          toast.success(`Added ${prod.name} to cart!`);
        },
      }
    );
  };

  const handleIncrement = (e: React.MouseEvent, prod: AdhesiveProduct, currentQty: number) => {
    e.stopPropagation();
    const itemState = getItemCartState(prod);
    if (itemState.ids.length > 0) {
      updateCartItem.mutate({
        itemId: itemState.ids[0],
        data: { quantity: currentQty + 1 },
      });
    }
  };

  const handleDecrement = (e: React.MouseEvent, prod: AdhesiveProduct, currentQty: number) => {
    e.stopPropagation();
    const itemState = getItemCartState(prod);
    if (itemState.ids.length > 0) {
      if (currentQty <= 1) {
        removeFromCart.mutate({ itemId: itemState.ids[0] });
      } else {
        updateCartItem.mutate({
          itemId: itemState.ids[0],
          data: { quantity: currentQty - 1 },
        });
      }
    }
  };

  // Cross sell items for a specific product
  const getCrossSellItems = (prod: AdhesiveProduct): AdhesiveProduct[] => {
    if (!prod.crossSellSkus || prod.crossSellSkus.length === 0) return [];
    return ALL_45_ADHESIVES_PRODUCTS.filter((item) =>
      prod.crossSellSkus.includes(item.id)
    ).slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Hero Header Section */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#1E293B] text-white pt-8 pb-10 px-4 sm:px-6 lg:px-8 border-b border-slate-700">
        <div className="max-w-7xl mx-auto">
          {onBackToDirectory && (
            <button
              onClick={onBackToDirectory}
              className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Category Directory
            </button>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded tracking-wider uppercase">
                  Conon-Now Express
                </span>
                <span className="text-slate-300 text-xs font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" /> 60-Min Delivery across Lucknow
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
                Fevicol, Adhesives & Sealants
              </h1>
              <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
                Direct aggregator pricing from Latouche Road, Hewett Road & Sadar Bazaar. 100% Genuine Pidilite, Dowsil, Araldite & Wacker stock.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-medium text-slate-300">
                <span className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Standard 18% GST with B2B Input Tax Credit
                </span>
                <span className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <Bike className="w-4 h-4 text-sky-400" /> 2-Wheeler Fleet for Tins & Cartridges
                </span>
                <span className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <Truck className="w-4 h-4 text-amber-400" /> E-Loader for 20kg & 50kg Drums
                </span>
              </div>
            </div>

            {/* Quick Calculator Trigger Banner */}
            <div className="bg-white/10 border border-white/20 p-4 sm:p-5 rounded-2xl backdrop-blur-md md:max-w-sm flex-shrink-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-amber-400 text-slate-900 rounded-xl font-bold">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Laminate-to-Fevicol Calculator</h3>
                  <p className="text-xs text-slate-300">Estimate exact kg & save up to 25% on drums</p>
                </div>
              </div>
              <button
                onClick={() => setShowCalculator(!showCalculator)}
                className="w-full mt-2 py-2 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                {showCalculator ? "Hide Calculator" : "Open Dosage Calculator"}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Laminate Sheet to Fevicol Calculator Modal/Banner */}
      {showCalculator && (
        <div className="bg-gradient-to-br from-amber-50 via-sky-50 to-emerald-50 border-b border-amber-200 py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-md border border-amber-200/80 p-5 sm:p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Carpenter Dosage Estimator: 8x4 ft Laminate Sheets
                  </h2>
                  <p className="text-xs text-slate-500">
                    Standard single-side pressing requirement: ~0.72 kg Fevicol per 8x4 ft sheet (32 sq.ft).
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCalculator(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5">
              {/* Input Slider & Quick Presets */}
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Number of Laminate Sheets: <span className="text-blue-600 text-base">{sheetCount} Sheets</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="150"
                  value={sheetCount}
                  onChange={(e) => setSheetCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex flex-wrap gap-2">
                  {[5, 10, 20, 25, 50, 70, 100].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setSheetCount(preset)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        sheetCount === preset
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {preset} Sheets
                    </button>
                  ))}
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Lucknow Carpenter Rule of Thumb:
                  </p>
                  <p>1x 50kg Drum covers ~70 laminate sheets at ₹224/kg vs ₹297/kg on 1kg jars (Save ₹3,650 per drum!).</p>
                </div>
              </div>

              {/* Recommended Packs Configuration */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Recommended Optimal Pack Breakdown
                </h4>
                <div className="text-2xl font-black text-slate-900 mb-1">
                  {calculatorResult.totalKgNeeded} <span className="text-sm font-semibold text-slate-600">kg Adhesive Needed</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-700 mt-3">
                  {calculatorResult.packs.fiftyKg > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span>50 kg Drum (Lowest Rate: ₹224/kg)</span>
                      <span className="font-bold text-slate-900">{calculatorResult.packs.fiftyKg} Drum(s)</span>
                    </div>
                  )}
                  {calculatorResult.packs.twentyKg > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span>20 kg Drum (₹242.5/kg)</span>
                      <span className="font-bold text-slate-900">{calculatorResult.packs.twentyKg} Drum(s)</span>
                    </div>
                  )}
                  {calculatorResult.packs.fiveKg > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span>5 kg Bucket (₹257.2/kg)</span>
                      <span className="font-bold text-slate-900">{calculatorResult.packs.fiveKg} Bucket(s)</span>
                    </div>
                  )}
                  {calculatorResult.packs.twoKg > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span>2 kg Jar (₹282/kg)</span>
                      <span className="font-bold text-slate-900">{calculatorResult.packs.twoKg} Jar(s)</span>
                    </div>
                  )}
                  {calculatorResult.packs.oneKg > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span>1 kg Jar (₹297/kg)</span>
                      <span className="font-bold text-slate-900">{calculatorResult.packs.oneKg} Jar(s)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* One-Click Add to Cart Actions */}
              <div className="flex flex-col justify-between bg-blue-50/60 p-4 rounded-xl border border-blue-200">
                <div>
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">
                    Instant Cart Addition
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded-lg border border-blue-100 shadow-sm">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-slate-800">Fevicol SH Series:</span>
                        <span className="text-sm font-extrabold text-blue-700">₹{calculatorResult.estimatedCostSH.toLocaleString()}</span>
                      </div>
                      <button
                        onClick={() => handleAddCalculatedPackToCart("SH")}
                        className="w-full mt-2 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Fevicol SH Combination
                      </button>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-emerald-100 shadow-sm">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-slate-800">Fevicol Marine (Waterproof):</span>
                        <span className="text-sm font-extrabold text-emerald-700">₹{calculatorResult.estimatedCostMarine.toLocaleString()}</span>
                      </div>
                      <button
                        onClick={() => handleAddCalculatedPackToCart("Marine")}
                        className="w-full mt-2 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Marine Waterproof Pack
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Subcategories Horizontal Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {SUBCATEGORIES.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubcat(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                activeSubcat === tab.id
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full ${
                  activeSubcat === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filter Controls Row */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" /> Filters:
            </span>

            {/* Brand Tier Selector */}
            <select
              value={selectedBrandTier}
              onChange={(e) => setSelectedBrandTier(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {BRAND_TIERS.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.label}
                </option>
              ))}
            </select>

            {/* Specific Brand Selector */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Brand Labels</option>
              {availableBrands
                .filter((b) => b !== "ALL")
                .map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
            </select>

            {/* Silicone Cure Type Safety Filter */}
            {activeSubcat === "SEALANT_FOAM" && (
              <div className="flex items-center gap-1.5 ml-2">
                <button
                  onClick={() => setCureFilter("ALL")}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                    cureFilter === "ALL" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  All Cures
                </button>
                <button
                  onClick={() => setCureFilter("NEUTRAL")}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                    cureFilter === "NEUTRAL"
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  🛡️ Neutral Safe (Mirrors/Stone)
                </button>
                <button
                  onClick={() => setCureFilter("ACETOXY_GP")}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                    cureFilter === "ACETOXY_GP"
                      ? "bg-rose-600 text-white"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  ⚠️ Acetoxy GP (Glass Only)
                </button>
              </div>
            )}
          </div>

          <div className="text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-900">{filteredProducts.length}</span> of 45 verified SKUs
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-6">
          {filteredProducts.map((prod) => {
            const itemState = getItemCartState(prod);
            const inCart = itemState.quantity > 0;
            const quantity = itemState.quantity;
            const isHeavyDrum = prod.deliveryVehicleType.includes("Pickup") || prod.deliveryVehicleType.includes("E-Loader");
            const crossSells = getCrossSellItems(prod);

            return (
              <div
                key={prod.id}
                onClick={() => handleCardClick(prod)}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col cursor-pointer relative"
              >
                {/* Header Fleet & Key Spec Badges */}
                <div className="p-3 pb-0 flex items-center justify-between gap-1 z-10">
                  <div className="flex items-center gap-1">
                    {isHeavyDrum ? (
                      <span className="bg-amber-100 text-amber-900 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
                        <Truck className="w-3 h-3 text-amber-700" /> {prod.deliveryVehicleType}
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-900 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                        <Bike className="w-3 h-3 text-emerald-700" /> 60m 2-Wheeler
                      </span>
                    )}
                  </div>
                  <span className="bg-slate-100 text-slate-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                    {prod.packSizeDisplay}
                  </span>
                </div>

                {/* Product Image Stage */}
                <div className="relative h-48 sm:h-52 w-full bg-white flex items-center justify-center p-3 overflow-hidden">
                  <RealProductImage
                    product={prod}
                    src={prod.image}
                    alt={prod.name}
                    title={prod.title || prod.name}
                    brand={prod.brand}
                    category="fevicol-adhesives-sealants"
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  {prod.discountPercent > 0 && (
                    <div className="absolute top-2 left-2 bg-rose-500 text-white font-black text-[10px] px-2 py-0.5 rounded shadow-sm">
                      {prod.discountPercent}% OFF
                    </div>
                  )}
                </div>

                {/* Body Details */}
                <div className="p-4 flex-1 flex flex-col">
                  {/* Brand & Subcategory */}
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <span>{prod.brand}</span>
                    <span>HSN {prod.hsnCode}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2 mb-1.5 group-hover:text-blue-600 transition-colors">
                    {prod.title}
                  </h3>

                  {/* Setting Time & Chemistry Chips */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {prod.settingTimeLabel && (
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                        ⏱️ {prod.settingTimeLabel}
                      </span>
                    )}
                    {prod.cureType === "ACETOXY_GP" && (
                      <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-bold">
                        ⚠️ Acetoxy GP
                      </span>
                    )}
                    {prod.cureType === "NEUTRAL" && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                        🛡️ Neutral Safe
                      </span>
                    )}
                    {prod.id.includes("soudaflex-40fc") && (
                      <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-bold">
                        ⚠️ 600ml Sausage Gun Req.
                      </span>
                    )}
                  </div>

                  {/* Volume Unit Rate (₹/kg or ₹/L) */}
                  {prod.effectiveUnitRate && (
                    <div className="text-[11px] font-bold text-blue-700 mb-2">
                      Effective Unit Rate: ₹{prod.effectiveUnitRate.toLocaleString()}/{prod.packSizeUnit}
                    </div>
                  )}

                  {/* Acetoxy Mirror Warning Banner */}
                  {prod.cureType === "ACETOXY_GP" && (
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-1.5 text-[10px] text-rose-800 font-semibold mb-2">
                      ⚠️ Not for mirrors, marble or UPVC. Use Neutral Silicone.
                    </div>
                  )}

                  <div className="mt-auto pt-3 border-t border-slate-100">
                    {/* Price and Base Price Display */}
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-black text-slate-900">
                            ₹{prod.price.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-400 line-through">
                            ₹{prod.mrp.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Ex-GST: ₹{prod.exGstPrice.toLocaleString()} + 18% GST
                        </div>
                      </div>

                      {/* Add to Cart / Stepper */}
                      <div>
                        {inCart ? (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 bg-slate-900 text-white px-2 py-1.5 rounded-xl shadow-sm"
                          >
                            <button
                              onClick={(e) => handleDecrement(e, prod, quantity)}
                              className="p-1 hover:bg-slate-800 rounded text-slate-200 transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-extrabold text-xs min-w-[16px] text-center">
                              {quantity}
                            </span>
                            <button
                              onClick={(e) => handleIncrement(e, prod, quantity)}
                              className="p-1 hover:bg-slate-800 rounded text-slate-200 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => handleAddToCart(e, prod)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" /> ADD
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Carpenter & Glazier Cross-Sell Recommendations */}
                    {crossSells.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Frequently Paired With:
                        </div>
                        <div className="space-y-1">
                          {crossSells.slice(0, 2).map((xs) => (
                            <div
                              key={xs.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCardClick(xs);
                              }}
                              className="flex items-center justify-between text-[11px] p-1.5 bg-slate-50 hover:bg-blue-50 rounded-lg border border-slate-100 transition-colors"
                            >
                              <span className="line-clamp-1 font-medium text-slate-700">
                                + {xs.name.split("(")[0]}
                              </span>
                              <span className="font-bold text-slate-900 whitespace-nowrap ml-2">
                                ₹{xs.price}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Standalone Product Detail Modal */}
      {modalProduct && (
        <ProductDetailModal
          product={modalProduct}
          isOpen={!!modalProduct}
          onClose={() => setModalProduct(null)}
        />
      )}
    </div>
  );
}
export default FevicolCollectionStorefront;
