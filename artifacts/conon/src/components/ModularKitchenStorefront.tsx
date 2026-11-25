import React, { useState, useMemo } from "react";
import {
  Clock,
  Bike,
  Truck,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Minus,
  Sparkles,
  ArrowLeft,
  SlidersHorizontal,
  Wrench,
  CheckCircle2,
  X,
  ExternalLink,
  Layers,
  Compass,
  Check,
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
import type { Product } from "@/components/ProductCard";
import { RealProductImage } from "@/components/RealProductImage";
import {
  ALL_26_MODULAR_KITCHEN_PRODUCTS,
  type ModularKitchenProduct,
} from "@/data/modularKitchenData";

export interface ModularKitchenStorefrontProps {
  onOpenDetail?: (product: Product) => void;
  onBackToDirectory?: () => void;
}

const SUBCATEGORIES = [
  { id: "ALL", label: "All Items", count: 26 },
  { id: "TANDEM_BOX", label: "Tandem Box Drawers", count: 7 },
  { id: "PULLOUT_CORNER_PANTRY", label: "Pull-Outs & Corner Units", count: 8 },
  { id: "BASKET_ORGANIZER", label: "SS 304 Baskets & Organizers", count: 6 },
  { id: "SHUTTER_LIFT_GOLA", label: "Rolling Shutters & Gola", count: 5 },
];

const BRAND_TIERS = [
  { id: "ALL", label: "All Running Brands" },
  { id: "TIER1", label: "Priority 1 (Core Volume: Hettich, Ebco, Hafele)" },
  { id: "TIER2", label: "Priority 2 (Specialist: Rehau, Quba, Zinc Plus, KINGS Nimbus)" },
];

const CARCASS_WIDTH_OPTIONS = [
  { id: "ALL", label: "All Carcass Sizes" },
  { id: "150-200", label: "150mm–200mm Base Cabinets" },
  { id: "450", label: "450mm Base Cabinets" },
  { id: "500", label: "500mm Standard Depth Drawers" },
  { id: "600", label: "600mm Tall Pantry & Shutters" },
  { id: "850-1000", label: "900mm–1000mm Corner Units" },
  { id: "3000", label: "3000mm Continuous Profiles" },
];

const LOAD_CAPACITY_OPTIONS = [
  { id: "ALL", label: "All Load Ratings" },
  { id: "30kg", label: "30kg (Cutlery & Plates)" },
  { id: "40kg", label: "40kg (Double-Walled Medium)" },
  { id: "50kg", label: "50kg (Heavy Pot & Pan / Atira)" },
  { id: "60kg", label: "60kg (6-Layer Tall Pantry)" },
];

const FINISH_OPTIONS = [
  { id: "ALL", label: "All Finishes" },
  { id: "Anthracite", label: "Anthracite Dark Grey" },
  { id: "Black", label: "Matte Black" },
  { id: "Silver / Grey", label: "Silver / Grey" },
  { id: "SS 304", label: "SS 304 Chrome Gloss" },
  { id: "Beech Wood", label: "Natural Beech Wood" },
];

const VEHICLE_FILTERS = [
  { id: "ALL", label: "All Vehicles" },
  { id: "2-Wheeler", label: "2-Wheeler (60-Min Express)" },
  { id: "E-Loader", label: "E-Loader (Heavy/Long Hardware)" },
  { id: "E-Loader / Pickup", label: "E-Loader / Pickup (Pantry & Glass Shutter)" },
];

// Curated Add-on Items for "Modular-Kitchen-Complete" cross-sell modal
const MODULAR_CROSS_SELL_CATALOG: Record<
  string,
  {
    id: string;
    title: string;
    brand: string;
    role: string;
    price: number;
    image: string;
    desc: string;
  }
> = {
  "prod-mod-hettich-orgatray-560-cutlery": {
    id: "prod-mod-hettich-orgatray-560-cutlery",
    title: "Hettich OrgaTray 560 Adjustable Cutlery Tray 600mm",
    brand: "Hettich",
    role: "Drawer Interior Organizer",
    price: 2930,
    image: "/images/products/modular-kitchen-systems/hettich-orgatray-560-adjustable-pvc-cutlery-tray-600mm.webp",
    desc: "Custom-fit trimmable compartments for spoons, forks & knives. Fits InnoTech & Atira drawers.",
  },
  "prod-mod-hettich-gola-profile-3000mm-black": {
    id: "prod-mod-hettich-gola-profile-3000mm-black",
    title: "Hettich Gola Profile L-Type 3000mm Matte Black (9299225)",
    brand: "Hettich",
    role: "Handleless Cabinet Trim",
    price: 2399,
    image: "/images/products/modular-kitchen-systems/hettich-gola-profile-l-type-handleless-aluminium-3000mm-black-9299225.webp",
    desc: "Continuous seamless recessed aluminium profile for modern handle-free modular kitchens.",
  },
  "prod-adh-fevicol-heatx-1l": {
    id: "prod-adh-fevicol-heatx-1l",
    title: "Fevicol HeatX High Heat Resistance Fast Grab Adhesive 1L",
    brand: "Fevicol",
    role: "Kitchen Fascia Laminate Adhesive",
    price: 480,
    image: "/images/products/adhesives/fevicol-heatx-high-heat-resistance-fast-grab-adhesive-1l.webp",
    desc: "Essential for bonding laminate fascias to Tandem Box drawer wooden fronts with high thermal resistance near gas stoves.",
  },
  "prod-fur-hettich-ka4732-20in-black": {
    id: "prod-fur-hettich-ka4732-20in-black",
    title: "Hettich KA-4732 20\" Soft-Close Telescopic Channel (Pair)",
    brand: "Hettich",
    role: "Heavy Wire Basket Slide",
    price: 699,
    image: "/images/products/furniture-wardrobe-hardware/hettich-ka-4732-telescopic-channel-20in-soft-close-black.webp",
    desc: "35kg rated ball-bearing soft-closing slide pair for fitting wire kitchen baskets onto wooden carcasses.",
  },
  "prod-mod-ebco-pro-lift-100n-gas-spring": {
    id: "prod-mod-ebco-pro-lift-100n-gas-spring",
    title: "Ebco Pro-Lift Hydraulic Gas Spring 100N (1 Pair)",
    brand: "Ebco",
    role: "Overhead Loft Lift-Up Piston",
    price: 239,
    image: "/images/products/modular-kitchen-systems/ebco-pro-lift-hydraulic-gas-spring-100n-for-loft-cabinets-1-pair.webp",
    desc: "Smooth effortless upward lift for top kitchen cabinets and loft shutters. Tested to 50,000 cycles.",
  },
  "prod-mod-ebco-waste-bin-40l": {
    id: "prod-mod-ebco-waste-bin-40l",
    title: "Ebco Pull-Out Under-Sink Dual Waste Bin 40L (2×20L)",
    brand: "Ebco",
    role: "Under-Sink Dry/Wet Segregation",
    price: 5304,
    image: "/images/products/modular-kitchen-systems/ebco-pull-out-under-sink-dual-waste-bin-40l-2x20l-anthracite.webp",
    desc: "Soft-close telescopic under-sink waste separation system with twin removable buckets.",
  },
  "prod-fur-hettich-onsys-0crank-105": {
    id: "prod-fur-hettich-onsys-0crank-105",
    title: "Hettich Onsys 4447i 105° 0-Crank Soft-Close Hinge (Pair)",
    brand: "Hettich",
    role: "Full Overlay Cabinet Hinge",
    price: 185,
    image: "/images/products/furniture-wardrobe-hardware/hettich-onsys-4447i-soft-close-hinge-105-0-crank.webp",
    desc: "Silent hydraulic soft closing for modular kitchen shutter doors. Fits 18mm board with zero slam.",
  },
};

export function ModularKitchenStorefront({
  onOpenDetail,
  onBackToDirectory,
}: ModularKitchenStorefrontProps) {
  const qc = useQueryClient();
  const invalidateCart = () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() });
  const addToCart = useAddToCart({ mutation: { onSuccess: invalidateCart } });
  const updateCartItem = useUpdateCartItem({ mutation: { onSuccess: invalidateCart } });
  const removeFromCart = useRemoveFromCart({ mutation: { onSuccess: invalidateCart } });
  const { data: cart } = useGetCart();

  // Filters
  const [activeSubcat, setActiveSubcat] = useState<string>("ALL");
  const [selectedBrandTier, setSelectedBrandTier] = useState<string>("ALL");
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL");
  const [carcassWidthFilter, setCarcassWidthFilter] = useState<string>("ALL");
  const [loadCapacityFilter, setLoadCapacityFilter] = useState<string>("ALL");
  const [finishFilter, setFinishFilter] = useState<string>("ALL");
  const [vehicleFilter, setVehicleFilter] = useState<string>("ALL");

  // Cross-Sell / Drawer State
  const [selectedCrossSellProduct, setSelectedCrossSellProduct] = useState<ModularKitchenProduct | null>(null);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  // Cart helper map
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

  const getItemCartState = (prod: { categorySlug?: string; title?: string; name?: string }) => {
    const cat = prod.categorySlug || "modular-kitchen-systems";
    const name = prod.title || prod.name || "";
    const key = `${cat.toLowerCase()}::${name.toLowerCase()}`;
    return cartItemByKey[key] || { ids: [], quantity: 0 };
  };

  // Unique Brand List
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    ALL_26_MODULAR_KITCHEN_PRODUCTS.forEach((p) => brands.add(p.brand));
    return Array.from(brands).sort();
  }, []);

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return ALL_26_MODULAR_KITCHEN_PRODUCTS.filter((prod) => {
      // 1. Subcategory
      if (activeSubcat !== "ALL" && prod.modularSubcategory !== activeSubcat) {
        return false;
      }

      // 2. Brand Tier
      if (selectedBrandTier === "TIER1" && prod.brandTier !== 1) return false;
      if (selectedBrandTier === "TIER2" && prod.brandTier !== 2) return false;

      // 3. Brand
      if (selectedBrand !== "ALL" && prod.brand !== selectedBrand) return false;

      // 4. Carcass Width
      if (carcassWidthFilter !== "ALL") {
        if (carcassWidthFilter === "150-200" && (!prod.carcassWidthMm || prod.carcassWidthMm > 250)) {
          return false;
        }
        if (carcassWidthFilter === "450" && prod.carcassWidthMm !== 450) {
          return false;
        }
        if (carcassWidthFilter === "500" && (!prod.carcassFitBadge.includes("500mm") && prod.depthMm !== 500)) {
          return false;
        }
        if (carcassWidthFilter === "600" && prod.carcassWidthMm !== 600) {
          return false;
        }
        if (carcassWidthFilter === "850-1000" && (!prod.carcassFitBadge.includes("850") && !prod.carcassFitBadge.includes("900") && !prod.carcassFitBadge.includes("1000"))) {
          return false;
        }
        if (carcassWidthFilter === "3000" && (!prod.carcassFitBadge.includes("3000mm"))) {
          return false;
        }
      }

      // 5. Load Capacity
      if (loadCapacityFilter !== "ALL") {
        const targetKg = parseInt(loadCapacityFilter.replace("kg", ""), 10);
        if (prod.loadCapacityKg !== targetKg) return false;
      }

      // 6. Finish Color
      if (finishFilter !== "ALL") {
        if (finishFilter === "Anthracite" && !prod.finishColor.toLowerCase().includes("anthracite")) return false;
        if (finishFilter === "Black" && !prod.finishColor.toLowerCase().includes("black")) return false;
        if (finishFilter === "Silver / Grey" && !prod.finishColor.toLowerCase().includes("silver") && !prod.finishColor.toLowerCase().includes("grey")) return false;
        if (finishFilter === "SS 304" && !prod.finishColor.toLowerCase().includes("ss 304") && !prod.finishColor.toLowerCase().includes("chrome")) return false;
        if (finishFilter === "Beech Wood" && !prod.finishColor.toLowerCase().includes("beech")) return false;
      }

      // 7. Vehicle
      if (vehicleFilter !== "ALL" && prod.deliveryVehicleType !== vehicleFilter) {
        return false;
      }

      return true;
    });
  }, [
    activeSubcat,
    selectedBrandTier,
    selectedBrand,
    carcassWidthFilter,
    loadCapacityFilter,
    finishFilter,
    vehicleFilter,
  ]);

  // Cart operations
  const handleAddToCart = (prod: ModularKitchenProduct, e?: React.MouseEvent) => {
    e?.stopPropagation();
    addToCart.mutate(
      {
        data: {
          materialId: prod.id,
          category: prod.categorySlug,
          name: prod.title || prod.name,
          quantity: 1,
          price: prod.price,
          unit: prod.unit,
        },
      },
      {
        onSuccess: () => {
          toast.success(`Added ${prod.title} to cart`, {
            description: `${prod.deliveryVehicleType} express fulfillment from Latouche / Gomti Nagar`,
          });
        },
      }
    );
  };

  const handleIncrement = (prod: ModularKitchenProduct, currentQty: number, itemIds: string[], e?: React.MouseEvent) => {
    e?.stopPropagation();
    const firstId = itemIds[0];
    if (!firstId) {
      handleAddToCart(prod, e);
      return;
    }
    updateCartItem.mutate(
      {
        itemId: firstId,
        data: { quantity: currentQty + 1 },
      },
      {
        onSuccess: () => toast.success(`Updated ${prod.title} quantity to ${currentQty + 1}`),
      }
    );
  };

  const handleDecrement = (prod: ModularKitchenProduct, currentQty: number, itemIds: string[], e?: React.MouseEvent) => {
    e?.stopPropagation();
    const firstId = itemIds[0];
    if (!firstId) return;

    if (currentQty <= 1) {
      removeFromCart.mutate(
        { itemId: firstId },
        {
          onSuccess: () => toast.info(`Removed ${prod.title} from cart`),
        }
      );
    } else {
      updateCartItem.mutate(
        {
          itemId: firstId,
          data: { quantity: currentQty - 1 },
        },
        {
          onSuccess: () => toast.success(`Updated ${prod.title} quantity to ${currentQty - 1}`),
        }
      );
    }
  };

  const handleOpenDetailModal = (prod: ModularKitchenProduct) => {
    const modalItem: Product = {
      id: prod.id,
      title: prod.title || prod.name,
      materialTag: "Modular Kitchen Systems & Fittings",
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
      onOpenDetail(modalItem);
    } else {
      setModalProduct(modalItem);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white pt-8 pb-10 px-4 sm:px-6 lg:px-8 border-b border-sky-800/30">
        <div className="max-w-7xl mx-auto">
          {onBackToDirectory && (
            <button
              onClick={onBackToDirectory}
              className="inline-flex items-center gap-1.5 text-xs text-sky-300 hover:text-white transition-colors mb-4 font-semibold tracking-wide"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              BACK TO CATEGORIES
            </button>
          )}

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-sky-500/20 text-sky-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-sky-400/30 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-sky-400" />
                  ARCHITECT &amp; CARPENTER GRADE
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  60-MIN LUCKNOW DISPATCH
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Modular Kitchen Systems &amp; Fittings
              </h1>
              <p className="text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
                Aggregated from Latouche Road, Gomti Nagar, Indira Nagar &amp; Chinhat modular distributors.
                All 26 verified SKUs with exact carcass fit guides, OEM codes, and transparent 18% GST pricing.
              </p>
            </div>

            {/* Quick Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-white/10 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/10 text-center">
                <div className="text-lg font-black text-white">26 SKUs</div>
                <div className="text-[10px] font-semibold text-sky-200 tracking-wider uppercase">
                  VERIFIED RUNNING
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/10 text-center">
                <div className="text-lg font-black text-emerald-400">18% GST</div>
                <div className="text-[10px] font-semibold text-emerald-200 tracking-wider uppercase">
                  FULL ITC INVOICE
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/10 text-center">
                <div className="text-lg font-black text-amber-400">0% REROUTE</div>
                <div className="text-[10px] font-semibold text-amber-200 tracking-wider uppercase">
                  CARCASS FIT GUARANTEED
                </div>
              </div>
            </div>
          </div>

          {/* Subcategory Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-6 mt-4 border-t border-white/10">
            {SUBCATEGORIES.map((subcat) => {
              const isActive = activeSubcat === subcat.id;
              return (
                <button
                  key={subcat.id}
                  onClick={() => setActiveSubcat(subcat.id)}
                  className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    isActive
                      ? "bg-sky-500 text-white shadow-md shadow-sky-500/30 ring-2 ring-sky-300"
                      : "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10"
                  }`}
                >
                  <span>{subcat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? "bg-white text-sky-800 font-extrabold" : "bg-white/10 text-slate-300"
                    }`}
                  >
                    {subcat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Main Catalog & Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Filter Toolbar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">
                Technical Fit &amp; Logistics Filters
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-500">
              Showing <span className="font-bold text-sky-600">{filteredProducts.length}</span> of 26 items
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Brand Tier */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Brand Tier
              </label>
              <select
                value={selectedBrandTier}
                onChange={(e) => setSelectedBrandTier(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {BRAND_TIERS.map((tier) => (
                  <option key={tier.id} value={tier.id}>
                    {tier.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Brand OEM
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="ALL">All Brands ({availableBrands.length})</option>
                {availableBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Carcass Width Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Carcass Width
              </label>
              <select
                value={carcassWidthFilter}
                onChange={(e) => setCarcassWidthFilter(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {CARCASS_WIDTH_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Load Capacity */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Load Rating
              </label>
              <select
                value={loadCapacityFilter}
                onChange={(e) => setLoadCapacityFilter(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {LOAD_CAPACITY_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Finish Color */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Finish Color
              </label>
              <select
                value={finishFilter}
                onChange={(e) => setFinishFilter(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {FINISH_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Vehicle Fleet Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Fleet Vehicle
              </label>
              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {VEHICLE_FILTERS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
            <Layers className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No matching modular fittings found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your carcass width or load capacity filters to view running inventory.
            </p>
            <button
              onClick={() => {
                setActiveSubcat("ALL");
                setSelectedBrandTier("ALL");
                setSelectedBrand("ALL");
                setCarcassWidthFilter("ALL");
                setLoadCapacityFilter("ALL");
                setFinishFilter("ALL");
                setVehicleFilter("ALL");
              }}
              className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-bold hover:bg-sky-700 transition"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((prod) => {
              const cartState = getItemCartState(prod);
              const inCart = cartState.quantity > 0;
              const isTandemBox = prod.modularSubcategory === "TANDEM_BOX";

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-xl border border-slate-200 hover:border-sky-300 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group"
                >
                  {/* Image Card Top */}
                  <div
                    className="relative aspect-square bg-slate-100 p-4 cursor-pointer overflow-hidden flex items-center justify-center"
                    onClick={() => handleOpenDetailModal(prod)}
                  >
                    <RealProductImage
                      product={prod}
                      src={prod.image}
                      alt={prod.title}
                      title={prod.title}
                      brand={prod.brand}
                      category="modular-kitchen-systems"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Brand Pill (Top Left) */}
                    <span className="absolute top-2.5 left-2.5 bg-slate-900/85 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase">
                      {prod.brand}
                    </span>

                    {/* Delivery Vehicle Badge (Top Right) */}
                    <span className="absolute top-2.5 right-2.5 bg-white/95 text-slate-700 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-1 shadow-sm">
                      {prod.deliveryVehicleType === "2-Wheeler" ? (
                        <>
                          <Bike className="w-3 h-3 text-emerald-600" />
                          <span>60m Bike</span>
                        </>
                      ) : prod.deliveryVehicleType === "E-Loader" ? (
                        <>
                          <Truck className="w-3 h-3 text-sky-600" />
                          <span>E-Loader</span>
                        </>
                      ) : (
                        <>
                          <Truck className="w-3 h-3 text-purple-600" />
                          <span>Heavy Truck</span>
                        </>
                      )}
                    </span>

                    {/* Carcass Fit Badge (Bottom Float Pill) */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-slate-900/90 backdrop-blur-sm text-white px-2 py-1 rounded text-[10px] font-semibold flex items-center justify-between border border-white/10 shadow">
                      <span className="truncate">{prod.carcassFitBadge}</span>
                      {prod.loadCapacityKg && (
                        <span className="font-bold text-sky-300 ml-1 shrink-0">
                          {prod.loadCapacityKg}kg
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Tandem Box Inclusions Warning Pill */}
                      {isTandemBox && (
                        <div className="mb-2 bg-amber-50 border border-amber-200/80 rounded px-2 py-1 flex items-start gap-1.5">
                          <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                          <span className="text-[10px] font-bold text-amber-800 leading-tight">
                            Kit Only: Base &amp; Front Made On-Site
                          </span>
                        </div>
                      )}

                      {/* Product Title */}
                      <h4
                        onClick={() => handleOpenDetailModal(prod)}
                        className="text-xs font-bold text-slate-800 hover:text-sky-800 cursor-pointer line-clamp-2 leading-snug"
                        title={prod.title}
                      >
                        {prod.title}
                      </h4>

                      {/* OEM Model Code */}
                      {prod.oemModelCode && (
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          OEM: <span className="text-slate-600 font-semibold">{prod.oemModelCode}</span>
                        </div>
                      )}

                      {/* Spec Chips */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {prod.carcassWidthMm && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                            {prod.carcassWidthMm}mm Cab
                          </span>
                        )}
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {prod.finishColor}
                        </span>
                        <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-200 px-1.5 py-0.5 rounded font-mono">
                          HSN {prod.hsnCode}
                        </span>
                      </div>

                      {/* Cross-Sell Quick Peek Link */}
                      {prod.crossSellSkus && prod.crossSellSkus.length > 0 && (
                        <button
                          onClick={() => setSelectedCrossSellProduct(prod)}
                          className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100/80 px-2 py-1 rounded transition border border-sky-200/60 w-full justify-center"
                        >
                          <Sparkles className="w-3 h-3 text-sky-600" />
                          <span>Modular-Kitchen-Complete Kit</span>
                        </button>
                      )}
                    </div>

                    {/* Price and Cart Action */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100">
                      <div className="flex items-baseline justify-between mb-1">
                        <div>
                          <span className="text-base font-black text-slate-900">
                            ₹{prod.price.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] text-slate-400 line-through ml-1.5">
                            ₹{prod.mrp.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          {prod.discountPercent}% OFF
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-500 mb-2.5 flex items-center justify-between">
                        <span>Ex-GST: ₹{prod.exGstPrice.toLocaleString("en-IN")}</span>
                        <span className="text-[10px] font-semibold text-slate-400">Incl. 18% GST</span>
                      </div>

                      {/* Add to Cart Button / Quantity Stepper */}
                      {inCart ? (
                        <div className="flex items-center justify-between bg-sky-50 border border-sky-300 rounded-lg p-1">
                          <button
                            onClick={(e) => handleDecrement(prod, cartState.quantity, cartState.ids, e)}
                            className="w-7 h-7 flex items-center justify-center bg-white rounded text-slate-700 hover:bg-sky-100 border border-slate-200 shadow-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-black text-sky-900">{cartState.quantity} in cart</span>
                          <button
                            onClick={(e) => handleIncrement(prod, cartState.quantity, cartState.ids, e)}
                            className="w-7 h-7 flex items-center justify-center bg-white rounded text-slate-700 hover:bg-sky-100 border border-slate-200 shadow-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => handleAddToCart(prod, e)}
                          disabled={addToCart.isPending}
                          className="w-full py-2 bg-slate-900 hover:bg-sky-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Modular-Kitchen-Complete Cross-Sell Modal */}
      {selectedCrossSellProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  Carpenter Installation Compatibility
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  Modular-Kitchen-Complete Kit
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Frequently ordered together with{" "}
                  <span className="font-bold text-slate-700">{selectedCrossSellProduct.title}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedCrossSellProduct(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 my-4">
              {selectedCrossSellProduct.crossSellSkus?.map((skuId) => {
                const item = MODULAR_CROSS_SELL_CATALOG[skuId];
                if (!item) return null;
                const itemCartState = getItemCartState({
                  categorySlug: "modular-kitchen-systems",
                  name: item.title,
                  title: item.title,
                });
                const itemInCart = itemCartState.quantity > 0;

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition"
                  >
                    <RealProductImage
                      product={item}
                      src={item.image}
                      alt={item.title}
                      title={item.title}
                      brand={item.brand}
                      variant="thumb"
                      className="w-16 h-16 object-contain rounded-lg bg-white border border-slate-200 p-1 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                          {item.brand}
                        </span>
                        <span className="text-[10px] font-semibold text-sky-700">
                          {item.role}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-800 line-clamp-1 mt-0.5">
                        {item.title}
                      </h5>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {item.desc}
                      </p>
                      <div className="text-xs font-black text-slate-900 mt-1">
                        ₹{item.price.toLocaleString("en-IN")}{" "}
                        <span className="text-[10px] font-normal text-slate-500">(Incl. 18% GST)</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {itemInCart ? (
                        <div className="flex items-center gap-1 bg-white border border-sky-300 rounded-lg p-0.5">
                          <button
                            onClick={() => {
                              const firstId = itemCartState.ids[0];
                              if (!firstId) return;
                              if (itemCartState.quantity <= 1) {
                                removeFromCart.mutate({ itemId: firstId });
                              } else {
                                updateCartItem.mutate({
                                  itemId: firstId,
                                  data: { quantity: itemCartState.quantity - 1 },
                                });
                              }
                            }}
                            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="text-xs font-bold px-1">{itemCartState.quantity}</span>
                          <button
                            onClick={() => {
                              const firstId = itemCartState.ids[0];
                              if (!firstId) return;
                              updateCartItem.mutate({
                                itemId: firstId,
                                data: { quantity: itemCartState.quantity + 1 },
                              });
                            }}
                            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            addToCart.mutate(
                              {
                                data: {
                                  materialId: item.id,
                                  category: "modular-kitchen-systems",
                                  name: item.title,
                                  quantity: 1,
                                  price: item.price,
                                  unit: "Piece",
                                },
                              },
                              {
                                onSuccess: () => {
                                  toast.success(`Added ${item.title} to cart`);
                                },
                              }
                            );
                          }}
                          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                All components delivered together in 1 delivery slot.
              </span>
              <button
                onClick={() => setSelectedCrossSellProduct(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Product Detail Modal */}
      {modalProduct && (
        <ProductDetailModal
          product={modalProduct}
          isOpen={true}
          onClose={() => setModalProduct(null)}
        />
      )}
    </div>
  );
}
