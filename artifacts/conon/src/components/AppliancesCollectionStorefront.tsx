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
  Flame,
  Wind,
  Fan,
  BatteryCharging,
  CheckCircle2,
  X,
  ExternalLink,
  Layers,
  Check,
  Building2,
  PackageCheck,
  Info,
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
import { RealProductImage } from "@/components/RealProductImage";
import type { Product } from "@/components/ProductCard";
import {
  homeAppliancesProducts,
} from "@/data/homeAppliancesData";

export interface AppliancesCollectionStorefrontProps {
  onOpenDetail?: (product: Product) => void;
  onBackToDirectory?: () => void;
}

const SUBCATEGORIES = [
  { id: "ALL", label: "All Home Appliances", count: 19 },
  { id: "WATER_HEATER", label: "Water Heaters & Geysers", count: 7 },
  { id: "KITCHEN_CHIMNEY", label: "Modular Kitchen Chimneys", count: 4 },
  { id: "EXHAUST_FAN", label: "Exhaust & Ventilation Fans", count: 4 },
  { id: "DESERT_COOLER", label: "Desert Air Coolers", count: 2 },
  { id: "INVERTER_BATTERY", label: "Inverters & Tubular Batteries", count: 2 },
];

const BRAND_TIERS = [
  { id: "ALL", label: "All Running Brands" },
  { id: "GEYSER_COOLER", label: "Geysers & Coolers (AO Smith, Racold, V-Guard, Bajaj, Crompton, Symphony)" },
  { id: "CHIMNEYS", label: "Kitchen Chimneys (Elica, Faber)" },
  { id: "VENT_BACKUP", label: "Ventilation & Power Backup (Atomberg, Havells, Luminous, Microtek)" },
];

const MOTOR_ENERGY_OPTIONS = [
  { id: "ALL", label: "All Energy / Motor Types" },
  { id: "BLDC_5STAR", label: "★ 5-Star / BLDC Motor / Pure Sine Wave" },
  { id: "STANDARD", label: "Standard 100% Copper Motor" },
];

const VEHICLE_OPTIONS = [
  { id: "ALL", label: "All Fleet Routes" },
  { id: "2-Wheeler", label: "⚡ 60-Min Express (2-Wheeler - 6 SKUs)" },
  { id: "E-Loader", label: "🚚 Same-Day / Scheduled (E-Loader - 13 SKUs)" },
];

// Handover Cross-Category Accessories
const HANDOVER_CROSS_SELL: Record<
  string,
  {
    title: string;
    description: string;
    items: Array<{
      id: string;
      name: string;
      price: number;
      category: string;
      spec: string;
    }>;
  }
> = {
  WATER_HEATER: {
    title: "Handover Plumbing & Electrical Kit",
    description: "Every storage & instant geyser requires 2 angle stop cocks and a 16A power point on site:",
    items: [
      {
        id: "cera-garnet-angle-cock",
        name: "Cera Garnet Quarter Turn Angle Stop Cock (2 Units)",
        price: 840,
        category: "sanitary",
        spec: "SS 304 Solid Brass Cartridge · 1/2-Inch BSP",
      },
      {
        id: "anchor-roma-16a-socket",
        name: "Anchor Roma 16A Heavy Duty 3-Pin Geyser Socket",
        price: 185,
        category: "electrical",
        spec: "Fire-retardant polycarbonate · Shuttered safety",
      },
    ],
  },
  KITCHEN_CHIMNEY: {
    title: "Chimney Installation Power & Sink Pair",
    description: "Recommended 16A dedicated point and matching stainless steel sink for modular setup:",
    items: [
      {
        id: "anchor-roma-16a-socket",
        name: "Anchor Roma 16A Modular Socket w/ Shutter",
        price: 185,
        category: "electrical",
        spec: "16A continuous appliance load · ISI certified",
      },
      {
        id: "jindal-handmade-single-bowl-sink-24x18",
        name: "Jindal Grade SS 304 Handmade Kitchen Sink (24x18x9)",
        price: 4950,
        category: "kitchen-hardware",
        spec: "1.2mm thick heavy bowl · Sound deadening pads",
      },
    ],
  },
  INVERTER_BATTERY: {
    title: "Home Handover Inverter Distribution Kit",
    description: "Essential DB distribution and 2.5 sq mm wiring to route inverter backup lines:",
    items: [
      {
        id: "havells-spn-db-8-way-mcb",
        name: "Havells 8-Way SPN Double Door Distribution Box",
        price: 1320,
        category: "electrical",
        spec: "CRCA sheet steel · Cement spill guard shield",
      },
      {
        id: "havells-lifeline-2-5-sq-mm",
        name: "Havells Life Line Plus 2.5 sq mm FR-LSH Copper Wire (90m)",
        price: 2480,
        category: "electrical",
        spec: "100% Electrolytic Bare Copper · 22A Rating",
      },
    ],
  },
};

export function AppliancesCollectionStorefront({
  onOpenDetail,
  onBackToDirectory,
}: AppliancesCollectionStorefrontProps) {
  const qc = useQueryClient();

  // Filter States
  const [activeSubcategory, setActiveSubcategory] = useState("ALL");
  const [selectedBrandTier, setSelectedBrandTier] = useState("ALL");
  const [selectedMotorType, setSelectedMotorType] = useState("ALL");
  const [selectedVehicle, setSelectedVehicle] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompatibilityGuide, setShowCompatibilityGuide] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);

  // Cart API Hooks
  const { data: cart } = useGetCart({
    query: { queryKey: getGetCartQueryKey() },
  });

  const addToCart = useAddToCart({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast.success("Added to cart!");
      },
    },
  });

  const updateCart = useUpdateCartItem({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetCartQueryKey() });
      },
    },
  });

  const removeFromCart = useRemoveFromCart({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast.info("Item removed");
      },
    },
  });

  // Map of cart items for instant quantity lookup
  const cartItemMap = useMemo(() => {
    const map = new Map<string, { id: string; quantity: number }>();
    if (!cart?.categories) return map;

    for (const cat of cart.categories) {
      for (const it of cat.items) {
        map.set(it.materialId, { id: it.id, quantity: it.quantity });
        map.set(it.name, { id: it.id, quantity: it.quantity });
      }
    }
    return map;
  }, [cart]);

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return homeAppliancesProducts.filter((prod) => {
      // Subcategory filter
      if (activeSubcategory !== "ALL" && prod.applianceSubcategory !== activeSubcategory) {
        return false;
      }

      // Brand Tier filter
      if (selectedBrandTier === "GEYSER_COOLER") {
        const allowed = ["AO Smith", "Racold", "V-Guard", "Bajaj", "Crompton", "Symphony"];
        if (!allowed.includes(prod.brand)) return false;
      } else if (selectedBrandTier === "CHIMNEYS") {
        const allowed = ["Elica", "Faber"];
        if (!allowed.includes(prod.brand)) return false;
      } else if (selectedBrandTier === "VENT_BACKUP") {
        const allowed = ["Atomberg", "Havells", "Luminous", "Microtek"];
        if (!allowed.includes(prod.brand)) return false;
      }

      // Motor / Energy filter
      if (selectedMotorType === "BLDC_5STAR" && !prod.isBldcOr5Star) return false;
      if (selectedMotorType === "STANDARD" && prod.isBldcOr5Star) return false;

      // Delivery Vehicle filter
      if (selectedVehicle !== "ALL" && prod.deliveryVehicleType !== selectedVehicle) {
        return false;
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = prod.title?.toLowerCase().includes(q) || prod.name.toLowerCase().includes(q);
        const matchBrand = prod.brand.toLowerCase().includes(q);
        const matchSpec = prod.capacityOrSizeLabel?.toLowerCase().includes(q);
        const matchOem = prod.oemModelCode?.toLowerCase().includes(q);
        if (!matchTitle && !matchBrand && !matchSpec && !matchOem) return false;
      }

      return true;
    });
  }, [
    activeSubcategory,
    selectedBrandTier,
    selectedMotorType,
    selectedVehicle,
    searchQuery,
  ]);

  // Handle Add to Cart
  const handleAddToCart = (prod: typeof homeAppliancesProducts[0]) => {
    addToCart.mutate({
      data: {
        materialId: prod.slug,
        category: prod.categorySlug,
        name: prod.title || prod.name,
        price: prod.price,
        unit: prod.unit || "Piece",
        quantity: 1,
      },
    });
  };

  const handleUpdateQty = (prod: typeof homeAppliancesProducts[0], delta: number) => {
    const item = cartItemMap.get(prod.slug) || cartItemMap.get(prod.name);
    if (!item) return;

    const nextQty = item.quantity + delta;
    if (nextQty <= 0) {
      removeFromCart.mutate({ itemId: item.id });
    } else {
      updateCart.mutate({
        itemId: item.id,
        data: { quantity: nextQty },
      });
    }
  };

  const handleCardClick = (prod: typeof homeAppliancesProducts[0]) => {
    const modalProd: Product = {
      id: prod.slug,
      title: prod.title || prod.name,
      name: prod.title || prod.name,
      materialTag: prod.capacityOrSizeLabel || "Appliance",
      vendor: prod.vendor,
      brand: prod.brand,
      price: prod.price,
      mrp: prod.mrp,
      rating: prod.rating,
      reviews: prod.reviewsCount,
      deliveryEta: prod.deliveryEta,
      image: prod.image,
      images: prod.images || [prod.image],
      description: prod.description,
      features: prod.highlights,
      specs: prod.specifications,
      unit: prod.unit,
    };

    if (onOpenDetail) {
      onOpenDetail(modalProd);
    } else {
      setSelectedProductForModal(modalProd);
    }
  };

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen pb-16">
      {/* ── TOP BANNER & LUCKNOW HUB HEADER ── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white px-4 py-6 sm:px-8 border-b border-slate-700 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {onBackToDirectory && (
              <button
                onClick={onBackToDirectory}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white mb-2 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to All Categories</span>
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                LUCKNOW HANDOVER & SEASONAL DEPOT
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                18% GST · ZERO INVENTORY DIRECT AGGREGATOR
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-2">
              Home Appliances & Handover Essentials
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Instant Geysers, Heavy Storage Geysers (8 Bar), Filterless Autoclean Chimneys (60/90cm), BLDC Exhausts, 75L Honeycomb Coolers, and 150Ah Power Backup Combos sourced from Naka Hindola, Latouche Road, Aminabad & Gomti Nagar.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCompatibilityGuide(true)}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              <span>Installation & Cutout Guide</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* ── 1. SUBCATEGORY PILLS BAR ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
          {SUBCATEGORIES.map((cat) => {
            const isActive = activeSubcategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveSubcategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-2 shadow-sm ${
                  isActive
                    ? "bg-[#1e7e34] text-white shadow-emerald-900/20 ring-2 ring-[#1e7e34]/20"
                    : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── 2. ADVANCED FILTERS BAR ── */}
        <div className="mt-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
              <span>Lucknow Contractor & Handover Filters</span>
            </div>
            {(selectedBrandTier !== "ALL" ||
              selectedMotorType !== "ALL" ||
              selectedVehicle !== "ALL" ||
              searchQuery) && (
              <button
                onClick={() => {
                  setSelectedBrandTier("ALL");
                  setSelectedMotorType("ALL");
                  setSelectedVehicle("ALL");
                  setSearchQuery("");
                }}
                className="text-xs font-bold text-rose-600 hover:underline"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Search Box */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Search SKU / Model / Spec
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. 15L Geyser, 60cm Chimney, BLDC"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e7e34]"
              />
            </div>

            {/* Brand Tier Priority */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Brand Tier Priority
              </label>
              <select
                value={selectedBrandTier}
                onChange={(e) => setSelectedBrandTier(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e7e34] font-medium"
              >
                {BRAND_TIERS.map((tier) => (
                  <option key={tier.id} value={tier.id}>
                    {tier.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Energy / Motor Type */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Motor & Energy Rating
              </label>
              <select
                value={selectedMotorType}
                onChange={(e) => setSelectedMotorType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e7e34] font-medium"
              >
                {MOTOR_ENERGY_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Delivery Fleet Route */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Dispatch Fleet Routing
              </label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e7e34] font-medium"
              >
                {VEHICLE_OPTIONS.map((veh) => (
                  <option key={veh.id} value={veh.id}>
                    {veh.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── 3. PRODUCT GRID (19 SKUs) ── */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">
              Showing {filteredProducts.length} Verified Lucknow Running Appliances
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Prices inclusive of 18% GST · Tax Invoices Available
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No Appliances Match Your Filter</h3>
              <p className="text-xs text-slate-500 mt-1">Try resetting your brand, motor, or fleet filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((prod) => {
                const inCart = cartItemMap.get(prod.slug) || cartItemMap.get(prod.name);
                const exGst = Math.round(prod.price / 1.18);

                return (
                  <div
                    key={prod.slug}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col group cursor-pointer"
                    onClick={() => handleCardClick(prod)}
                  >
                    {/* Top Image Canvas */}
                    <div className="relative w-full aspect-square bg-[#f8fafc] p-3 flex items-center justify-center overflow-hidden border-b border-slate-100">
                      <RealProductImage
                        product={prod}
                        src={prod.image}
                        title={prod.name}
                        brand={prod.brand}
                        category="Home Appliances"
                        alt={prod.name}
                        variant="card"
                        className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                      />

                      {/* Brand Tag Top Left */}
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-wider">
                        {prod.brand}
                      </span>

                      {/* Delivery Vehicle Badge Top Right */}
                      <span
                        className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-sm ${
                          prod.deliveryVehicleType === "2-Wheeler"
                            ? "bg-emerald-600 text-white"
                            : "bg-blue-600 text-white"
                        }`}
                      >
                        {prod.deliveryVehicleType === "2-Wheeler" ? (
                          <>
                            <Bike className="w-3 h-3" />
                            <span>60-Min Express</span>
                          </>
                        ) : (
                          <>
                            <Truck className="w-3 h-3" />
                            <span>E-Loader Heavy</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        {/* Cutout / Fit Guardrail Badge */}
                        <div className="mb-2">
                          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80 leading-snug">
                            🛡️ {prod.fitOrCutoutBadge}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                          {prod.title || prod.name}
                        </h3>

                        {/* Key Spec Chips */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {prod.specChips?.slice(0, 3).map((chip, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold"
                            >
                              {chip}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Pricing & Add to Cart Action */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-black text-slate-900">
                              ₹{prod.price.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[10px] text-slate-400 line-through">
                              ₹{prod.mrp.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium">
                            Ex-GST: ₹{exGst} · HSN {prod.hsnCode}
                          </p>
                        </div>

                        {/* Quantity Stepper / Add Button */}
                        <div onClick={(e) => e.stopPropagation()}>
                          {!inCart ? (
                            <button
                              onClick={() => handleAddToCart(prod)}
                              disabled={addToCart.isPending}
                              className="px-3.5 py-1.5 rounded-xl bg-[#1e7e34] hover:bg-[#166534] text-white text-xs font-bold transition shadow-sm active:scale-95 flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </button>
                          ) : (
                            <div className="flex items-center bg-[#1e7e34] text-white rounded-xl px-2 py-1 text-xs font-bold shadow-sm gap-2">
                              <button
                                onClick={() => handleUpdateQty(prod, -1)}
                                className="hover:text-emerald-200 transition font-black"
                              >
                                -
                              </button>
                              <span className="w-3 text-center">{inCart.quantity}</span>
                              <button
                                onClick={() => handleUpdateQty(prod, 1)}
                                className="hover:text-emerald-200 transition font-black"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 4. HANDOVER-READY CROSS-CATEGORY PAIRING ENGINE ── */}
        <div className="mt-12 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <h3 className="text-base font-bold text-slate-900">
              Handover-Ready Cross-Category Kits (Plumbing + Electrical + Kitchen)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-6 max-w-2xl">
            Save extra trips and avoid installation delays on handover day by bundling genuine fittings with appliance deliveries in the same Lucknow express vehicle:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(HANDOVER_CROSS_SELL).map(([catKey, kit]) => (
              <div
                key={catKey}
                className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#1e7e34]" />
                    <span>{kit.title}</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {kit.description}
                  </p>

                  <div className="mt-3 space-y-2">
                    {kit.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="font-bold text-slate-800 truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-400">{item.spec}</p>
                        </div>
                        <span className="font-extrabold text-slate-900 shrink-0">
                          ₹{item.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    kit.items.forEach((item) => {
                      addToCart.mutate({
                        data: {
                          materialId: item.id,
                          category: item.category,
                          name: item.name,
                          price: item.price,
                          unit: "Piece",
                          quantity: 1,
                        },
                      });
                    });
                    toast.success(`Bundled ${kit.title} into your cart!`);
                  }}
                  className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-sm text-center"
                >
                  Add Complete Pairing Kit
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 5. INSTALLATION & CUTOUT GUARDRAILS MODAL ── */}
      {showCompatibilityGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#1e7e34]" />
                <h3 className="text-base font-bold text-slate-900">
                  Home Appliances Guardrail &amp; Fitment Rules
                </h3>
              </div>
              <button
                onClick={() => setShowCompatibilityGuide(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-700" />
                  <span>Kitchen Chimney Stove Width Match</span>
                </h4>
                <p className="mt-1">
                  • <strong>60cm Width (#8, #10):</strong> Designed strictly for 2 to 3-burner gas cooktops (55–60cm width).<br />
                  • <strong>90cm Width (#9, #11):</strong> Required for 3-burner wide hobs and 4-burner cooktops (70–90cm width) to prevent smoke escaping sideways.
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-emerald-700" />
                  <span>Exhaust Fan Cutout Diameter Match</span>
                </h4>
                <p className="mt-1">
                  • <strong>150mm / 6-Inch (#14, #15):</strong> Requires exactly 6-inch window glass hole or core cut.<br />
                  • <strong>200mm / 8-Inch (#12, #13):</strong> Requires 8-inch window/wall cutout. Verify cutout diameter before ordering to prevent glass replacement.
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-bold text-blue-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span>Water Heater High-Rise Pressure Rating (8-Bar)</span>
                </h4>
                <p className="mt-1">
                  • Storage geysers (#3–7) and Racold Pronto (#2) are certified up to <strong>8-Bar pressure</strong>, specifically engineered for Lucknow high-rise residential towers (Gomti Nagar Extension, Sushant Golf City) with pressure booster pumps.
                </p>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                <h4 className="font-bold text-purple-900 flex items-center gap-1.5">
                  <BatteryCharging className="w-4 h-4 text-purple-700" />
                  <span>Pure Sine Wave Inverter Technology</span>
                </h4>
                <p className="mt-1">
                  • Both Microtek LUXE and Luminous Zelio+ supply pure sine wave AC current identical to mains grid power, ensuring zero hum noise on BLDC ceiling fans and complete protection for smart LED TVs and Wi-Fi routers.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCompatibilityGuide(false)}
              className="w-full py-2.5 bg-[#1e7e34] text-white font-bold text-xs rounded-xl transition shadow-md"
            >
              Understood, Return to Appliances
            </button>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProductForModal && (
        <ProductDetailModal
          product={selectedProductForModal}
          onClose={() => setSelectedProductForModal(null)}
          onAddToCart={() => {
            const raw = homeAppliancesProducts.find(
              (p) => p.slug === selectedProductForModal.id
            );
            if (raw) handleAddToCart(raw);
            setSelectedProductForModal(null);
          }}
        />
      )}
    </div>
  );
}
