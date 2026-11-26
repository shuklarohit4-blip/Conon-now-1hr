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
  Droplets,
  Wrench,
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
import { useProductMediaVault } from "@/context/ProductMediaVaultContext";
import type { Product } from "@/components/ProductCard";
import { RealProductImage } from "@/components/RealProductImage";
import {
  ALL_28_SANITARY_BATH_PRODUCTS,
  type SanitaryBathProduct,
} from "@/data/sanitaryBathData";

// Backward compatibility export
export const SANITARY_BATH_PRODUCTS = ALL_28_SANITARY_BATH_PRODUCTS;

export interface SanitaryBathCollectionStorefrontProps {
  onOpenDetail?: (product: Product) => void;
  onBackToDirectory?: () => void;
}

const SUBCATEGORIES = [
  { id: "ALL", label: "All Sanitary & Bath", count: 28 },
  { id: "WALL_HUNG_AND_ONE_PIECE_WC", label: "Wall-Hung WCs & Commodes", count: 6 },
  { id: "CONCEALED_CISTERN_FLUSH_PLATE", label: "Concealed Cisterns & Flush Plates", count: 5 },
  { id: "COUNTERTOP_CERAMIC_BASIN", label: "Countertop & Vanity Basins", count: 6 },
  { id: "DIVERTER_SHOWER_SPOUT", label: "Shower Diverters & Rain Showers", count: 6 },
  { id: "FAUCET_VALVE_ACCESSORY", label: "Health Faucets & Brassware", count: 5 },
];

const BRAND_TIERS = [
  { id: "ALL", label: "All Lucknow Running Brands" },
  { id: "TIER1", label: "Priority 1 (Jaquar, Cera, Parryware, Hindware)" },
  { id: "TIER2", label: "Priority 2 (Kohler Luxury)" },
  { id: "TIER3", label: "Priority 3 (Futura SS 304 Drains)" },
];

const MOUNTING_OPTIONS = [
  { id: "ALL", label: "All Mounting Types" },
  { id: "WALL_HUNG", label: "Wall-Hung (180mm P-Trap)" },
  { id: "FLOOR_MOUNT_S_TRAP", label: "Floor-Mount Commode (300mm S-Trap)" },
  { id: "CONCEALED_IN_WALL", label: "Concealed In-Wall (Cisterns & Diverters)" },
  { id: "TABLETOP_COUNTER", label: "Countertop / Tabletop Basins" },
  { id: "WALL_SURFACE", label: "Wall Surface Bath Brassware" },
];

const VEHICLE_OPTIONS = [
  { id: "ALL", label: "All Fleet Routes" },
  { id: "2-Wheeler", label: "⚡ 60-Min Express 2-Wheeler (14 SKUs)" },
  { id: "E-Loader", label: "🚛 Crated E-Loader Heavy Ceramic (14 SKUs)" },
];

// Curated Compatibility Kits for Plumbing Guardrails
const SANITARY_KIT_ITEMS: Record<
  string,
  {
    id: string;
    title: string;
    brand: string;
    role: string;
    price: number;
    image: string;
    desc: string;
    hsn: string;
  }
> = {
  "prod-san-jaquar-cistern-frame-tank": {
    id: "prod-san-jaquar-cistern-frame-tank",
    title: "Jaquar In-Wall Concealed Cistern Tank with Chair Frame",
    brand: "Jaquar",
    role: "Structural WC In-Wall Carrier (400kg)",
    price: 4850,
    image: "",
    desc: "Heavy galvanized steel chair frame with blow-molded HDPE cistern body. Dual flush 3L/6L valve with 180/230mm bolt pitch.",
    hsn: "3922",
  },
  "prod-san-jaquar-kubix-flush-plate-chr": {
    id: "prod-san-jaquar-kubix-flush-plate-chr",
    title: "Jaquar Kubix Prime Mechanical Dual-Flush Plate (Chrome)",
    brand: "Jaquar",
    role: "Actuator Push Plate",
    price: 1450,
    image: "",
    desc: "ABS body with electroplated mirror chrome finish. Dual-button actuation for water-saving 3L and full 6L flushes.",
    hsn: "3922",
  },
  "prod-san-jaquar-highflow-diverter-body": {
    id: "prod-san-jaquar-highflow-diverter-body",
    title: "Jaquar High-Flow Single Lever Diverter In-Wall Brass Body",
    brand: "Jaquar",
    role: "In-Wall Rough-In Brass Body",
    price: 3150,
    image: "",
    desc: "Forged dezincification resistant (DZR) brass body. 40mm high-flow cartridge delivering 45 LPM at 3 bar pressure.",
    hsn: "8481",
  },
  "prod-san-jaquar-rain-shower-8in": {
    id: "prod-san-jaquar-rain-shower-8in",
    title: "Jaquar SS 304 Overhead Rain Shower 8\" with 15\" Arm",
    brand: "Jaquar",
    role: "Overhead Rain Shower",
    price: 2850,
    image: "",
    desc: "SS-304 slim mirror polished rain head with self-cleaning silicone nozzles and 15-inch heavy brass arm.",
    hsn: "8481",
  },
  "prod-san-jaquar-kubix-bath-spout": {
    id: "prod-san-jaquar-kubix-bath-spout",
    title: "Jaquar Kubix Prime Cast Brass Bathtub Spout",
    brand: "Jaquar",
    role: "Wall Spout with Neoperl Aerator",
    price: 1890,
    image: "",
    desc: "Solid brass casting with integrated high-efficiency foam flow aerator and square wall flange.",
    hsn: "8481",
  },
  "prod-san-jaquar-health-faucet-abs": {
    id: "prod-san-jaquar-health-faucet-abs",
    title: "Jaquar Health Faucet ABS Body with 1.2m SS Hose",
    brand: "Jaquar",
    role: "Hygiene Jet Spray",
    price: 1120,
    image: "",
    desc: "High-impact ABS spray head with easy-press trigger, 1.2m braided stainless steel flexible hose and wall bracket.",
    hsn: "8481",
  },
  "prod-san-cera-bottle-trap-32mm": {
    id: "prod-san-cera-bottle-trap-32mm",
    title: "Cera Heavy Brass 32mm Wash Basin Bottle Trap with 250mm Pipe",
    brand: "Cera",
    role: "Odor-Proof Basin Waste Trap",
    price: 2016,
    image: "",
    desc: "Solid forged brass bottle trap body with 250mm horizontal discharge pipe and deep water seal to block sewer gases.",
    hsn: "8481",
  },
  "prod-san-jaquar-florentine-angle-cock": {
    id: "prod-san-jaquar-florentine-angle-cock",
    title: "Jaquar Florentine Prime Angular Stop Cock with Flange",
    brand: "Jaquar",
    role: "Isolation Angle Valve",
    price: 850,
    image: "",
    desc: "Heavy forged brass body with ceramic disc cartridge for quarter-turn leak-free water control to cisterns & faucets.",
    hsn: "8481",
  },
};

export function SanitaryBathCollectionStorefront({
  onOpenDetail,
  onBackToDirectory,
}: SanitaryBathCollectionStorefrontProps) {
  const qc = useQueryClient();
  const { resolveProduct } = useProductMediaVault();
  const invalidateCart = () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() });
  const addToCart = useAddToCart({ mutation: { onSuccess: invalidateCart } });
  const updateCartItem = useUpdateCartItem({ mutation: { onSuccess: invalidateCart } });
  const removeFromCart = useRemoveFromCart({ mutation: { onSuccess: invalidateCart } });
  const { data: cart } = useGetCart();

  // Filters
  const [activeSubcat, setActiveSubcat] = useState<string>("ALL");
  const [selectedBrandTier, setSelectedBrandTier] = useState<string>("ALL");
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL");
  const [selectedMounting, setSelectedMounting] = useState<string>("ALL");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("ALL");

  // Modal States
  const [selectedKitProduct, setSelectedKitProduct] = useState<SanitaryBathProduct | null>(null);
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
    const cat = prod.categorySlug || "sanitary-bath-fittings";
    const name = prod.title || prod.name || "";
    const key = `${cat.toLowerCase()}::${name.toLowerCase()}`;
    return cartItemByKey[key] || { ids: [], quantity: 0 };
  };

  // Unique Brand List
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    ALL_28_SANITARY_BATH_PRODUCTS.forEach((p) => brands.add(p.brand));
    return Array.from(brands).sort();
  }, []);

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return ALL_28_SANITARY_BATH_PRODUCTS.map((p) => resolveProduct(p)).filter((prod) => {
      // Subcategory
      if (activeSubcat !== "ALL" && prod.sanitarySubcategory !== activeSubcat) {
        return false;
      }

      // Brand Tier
      if (selectedBrandTier === "TIER1" && prod.brandTier !== 1) return false;
      if (selectedBrandTier === "TIER2" && prod.brandTier !== 2) return false;
      if (selectedBrandTier === "TIER3" && prod.brandTier !== 3) return false;

      // Specific Brand
      if (selectedBrand !== "ALL" && prod.brand !== selectedBrand) return false;

      // Mounting Type
      if (selectedMounting !== "ALL" && prod.mountingType !== selectedMounting) return false;

      // Delivery Fleet
      if (selectedVehicle !== "ALL") {
        if (selectedVehicle === "2-Wheeler" && prod.deliveryVehicleType !== "2-Wheeler") return false;
        if (selectedVehicle === "E-Loader" && prod.deliveryVehicleType === "2-Wheeler") return false;
      }

      return true;
    });
  }, [activeSubcat, selectedBrandTier, selectedBrand, selectedMounting, selectedVehicle, resolveProduct]);

  // Cart operations
  const handleAddToCart = (prod: SanitaryBathProduct) => {
    addToCart.mutate(
      {
        data: {
          materialId: prod.id,
          category: prod.categorySlug,
          name: prod.title,
          price: prod.price,
          unit: prod.unit,
          quantity: 1,
        },
      },
      {
        onSuccess: () => {
          toast.success(`Added ${prod.title} to cart`);
        },
        onError: () => {
          toast.error("Failed to add product to cart");
        },
      }
    );
  };

  const handleIncrement = (prod: SanitaryBathProduct, currentQty: number, itemIds: string[]) => {
    if (itemIds.length === 0) return;
    updateCartItem.mutate(
      {
        itemId: itemIds[0],
        data: { quantity: currentQty + 1 },
      },
      {
        onSuccess: () => toast.success(`Updated quantity to ${currentQty + 1}`),
        onError: () => toast.error("Failed to update cart quantity"),
      }
    );
  };

  const handleDecrement = (prod: SanitaryBathProduct, currentQty: number, itemIds: string[]) => {
    if (itemIds.length === 0) return;
    if (currentQty <= 1) {
      removeFromCart.mutate(
        { itemId: itemIds[0] },
        {
          onSuccess: () => toast.info(`Removed ${prod.title} from cart`),
          onError: () => toast.error("Failed to remove item"),
        }
      );
    } else {
      updateCartItem.mutate(
        {
          itemId: itemIds[0],
          data: { quantity: currentQty - 1 },
        },
        {
          onSuccess: () => toast.success(`Updated quantity to ${currentQty - 1}`),
          onError: () => toast.error("Failed to update cart quantity"),
        }
      );
    }
  };

  const openProductModal = (prod: SanitaryBathProduct) => {
    const modalObj: Product = {
      id: prod.id,
      title: prod.title,
      name: prod.name,
      materialTag: prod.materialGrade,
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
      onOpenDetail(modalObj);
    } else {
      setModalProduct(modalObj);
    }
  };

  // Cross-sell kit helper
  const getKitCrossSells = (prod: SanitaryBathProduct) => {
    const kitItems: Array<{
      id: string;
      title: string;
      brand: string;
      role: string;
      price: number;
      image: string;
      desc: string;
      hsn: string;
    }> = [];

    // Commode Wall-Hung
    if (prod.mountingType === "WALL_HUNG") {
      kitItems.push(
        SANITARY_KIT_ITEMS["prod-san-jaquar-cistern-frame-tank"],
        SANITARY_KIT_ITEMS["prod-san-jaquar-kubix-flush-plate-chr"],
        SANITARY_KIT_ITEMS["prod-san-jaquar-health-faucet-abs"],
        SANITARY_KIT_ITEMS["prod-san-jaquar-florentine-angle-cock"]
      );
    }
    // Commode Floor-Mount
    else if (prod.mountingType === "FLOOR_MOUNT_S_TRAP") {
      kitItems.push(
        SANITARY_KIT_ITEMS["prod-san-jaquar-health-faucet-abs"],
        SANITARY_KIT_ITEMS["prod-san-jaquar-florentine-angle-cock"]
      );
    }
    // Diverter Upper Trim Kit
    else if (prod.title.includes("Trim Kit") || prod.name.includes("Trim Kit")) {
      kitItems.push(
        SANITARY_KIT_ITEMS["prod-san-jaquar-highflow-diverter-body"],
        SANITARY_KIT_ITEMS["prod-san-jaquar-rain-shower-8in"],
        SANITARY_KIT_ITEMS["prod-san-jaquar-kubix-bath-spout"]
      );
    }
    // Diverter Rough-In Body
    else if (prod.id === "prod-san-jaquar-highflow-diverter-body") {
      kitItems.push(
        SANITARY_KIT_ITEMS["prod-san-jaquar-rain-shower-8in"],
        SANITARY_KIT_ITEMS["prod-san-jaquar-kubix-bath-spout"]
      );
    }
    // Tabletop Basin
    else if (prod.sanitarySubcategory === "COUNTERTOP_CERAMIC_BASIN") {
      kitItems.push(
        SANITARY_KIT_ITEMS["prod-san-cera-bottle-trap-32mm"],
        SANITARY_KIT_ITEMS["prod-san-jaquar-florentine-angle-cock"]
      );
    }
    // Concealed Cistern
    else if (prod.sanitarySubcategory === "CONCEALED_CISTERN_FLUSH_PLATE") {
      kitItems.push(
        SANITARY_KIT_ITEMS["prod-san-jaquar-kubix-flush-plate-chr"],
        SANITARY_KIT_ITEMS["prod-san-jaquar-florentine-angle-cock"]
      );
    } else {
      kitItems.push(
        SANITARY_KIT_ITEMS["prod-san-jaquar-health-faucet-abs"],
        SANITARY_KIT_ITEMS["prod-san-jaquar-florentine-angle-cock"]
      );
    }

    return kitItems.filter(Boolean);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Category Header */}
      <div className="bg-slate-900 text-white border-b border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {onBackToDirectory && (
                <button
                  onClick={onBackToDirectory}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  aria-label="Back to Directory"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    Category 11 · Plumbing &amp; Bath Hub
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <Bike className="w-3 h-3" />
                    60-Min Express Fleet
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    Crated E-Loader Fleet
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
                  Sanitary &amp; Bath Fittings
                </h1>
                <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                  Authorized Jaquar, Cera, Parryware, Hindware, Kohler &amp; Futura plumbing hardware sourced directly from Latouche Road, Shivaji Marg &amp; Gomti Nagar dealers. Strict 18% GST with bifurcated HSN (6910 / 8481 / 3922 / 7324) and certified fit guardrails.
                </p>
              </div>
            </div>

            {/* Quick Sourcing & Compliance Badge */}
            <div className="hidden lg:flex items-center gap-4 bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-400" />
                <div>
                  <p className="font-semibold text-white">Lucknow Dealer Aggregated</p>
                  <p className="text-slate-400">Latouche Rd &amp; Shivaji Marg Stock</p>
                </div>
              </div>
              <div className="h-8 w-px bg-slate-700" />
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="font-semibold text-white">100% Genuine OEM</p>
                  <p className="text-slate-400">18% GST B2B ITC Invoices</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subcategory Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-6 pb-2 scrollbar-none">
            {SUBCATEGORIES.map((cat) => {
              const isActive = activeSubcat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveSubcat(cat.id)}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                    isActive
                      ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  {cat.label}
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-700 text-slate-400"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area with Filters & Catalog Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <SlidersHorizontal className="w-4 h-4 text-sky-600" />
              Plumbing Guardrail Filters ({filteredProducts.length} Products Found)
            </div>
            {(activeSubcat !== "ALL" ||
              selectedBrandTier !== "ALL" ||
              selectedBrand !== "ALL" ||
              selectedMounting !== "ALL" ||
              selectedVehicle !== "ALL") && (
              <button
                onClick={() => {
                  setActiveSubcat("ALL");
                  setSelectedBrandTier("ALL");
                  setSelectedBrand("ALL");
                  setSelectedMounting("ALL");
                  setSelectedVehicle("ALL");
                }}
                className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Brand Tier Filter */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Brand Tier Priority</label>
              <select
                value={selectedBrandTier}
                onChange={(e) => {
                  setSelectedBrandTier(e.target.value);
                  setSelectedBrand("ALL");
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                {BRAND_TIERS.map((tier) => (
                  <option key={tier.id} value={tier.id}>
                    {tier.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Individual Brand Filter */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Specific Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="ALL">All Brands ({availableBrands.length})</option>
                {availableBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Mounting Type Filter */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Mounting &amp; Trap Type</label>
              <select
                value={selectedMounting}
                onChange={(e) => setSelectedMounting(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                {MOUNTING_OPTIONS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Fleet Logistics Filter */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Dispatch Vehicle</label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                {VEHICLE_OPTIONS.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Catalog Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">No Sanitary Products Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              No products match your active filter criteria. Try adjusting your brand or mounting selection.
            </p>
            <button
              onClick={() => {
                setActiveSubcat("ALL");
                setSelectedBrandTier("ALL");
                setSelectedBrand("ALL");
                setSelectedMounting("ALL");
                setSelectedVehicle("ALL");
              }}
              className="mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((prod) => {
              const { quantity, ids } = getItemCartState(prod);
              const is2W = prod.deliveryVehicleType === "2-Wheeler";
              const isDiverterTrim = prod.title.includes("Trim Kit") || prod.name.includes("Trim Kit");
              const isWallHung = prod.mountingType === "WALL_HUNG";
              const isFloorMount = prod.mountingType === "FLOOR_MOUNT_S_TRAP";
              const isCounterBasin = prod.sanitarySubcategory === "COUNTERTOP_CERAMIC_BASIN";

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Top Image & Badges */}
                  <div>
                    <div
                      className="relative w-full aspect-square bg-slate-100 overflow-hidden cursor-pointer"
                      onClick={() => openProductModal(prod)}
                    >
                      <RealProductImage
                        product={prod}
                        src={prod.image}
                        alt={prod.title}
                        title={prod.title}
                        brand={prod.brand}
                        category="sanitary-bath-fittings"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Brand Badge */}
                      <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-900/90 text-white backdrop-blur-sm">
                        {prod.brand}
                      </div>

                      {/* Vehicle Badge */}
                      <div className="absolute top-3 right-3">
                        {is2W ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-sm">
                            <Bike className="w-3 h-3" />
                            60m 2W
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white flex items-center gap-1 shadow-sm">
                            <Truck className="w-3 h-3" />
                            E-Loader
                          </span>
                        )}
                      </div>

                      {/* HSN Code Pill */}
                      <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/90 text-slate-700 backdrop-blur-sm border border-slate-200">
                        HSN {prod.hsnCode} · 18% GST
                      </div>
                    </div>

                    {/* Product Details Body */}
                    <div className="p-4">
                      {/* Subcategory chip */}
                      <div className="text-[11px] font-bold text-sky-600 uppercase tracking-wide">
                        {prod.subCategory}
                      </div>

                      {/* Title */}
                      <h3
                        onClick={() => openProductModal(prod)}
                        className="text-sm font-bold text-slate-900 line-clamp-2 mt-1 cursor-pointer hover:text-sky-600 transition-colors"
                        title={prod.title}
                      >
                        {prod.title}
                      </h3>

                      {/* Technical Specs Pill */}
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-100">
                          {prod.trapOrWasteSpec}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {prod.mountingType.replace(/_/g, " ")}
                        </span>
                        {prod.flushCapacityLiters && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-100">
                            {prod.flushCapacityLiters}
                          </span>
                        )}
                        {prod.flowRateLpm && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                            {prod.flowRateLpm}
                          </span>
                        )}
                      </div>

                      {/* Guardrail Fit Warning Pills */}
                      <div className="mt-2.5">
                        {isDiverterTrim && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-1.5 text-[10px] text-amber-900 font-semibold flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                            <span>Requires In-Wall Brass Body (AQC-CHR-079N)</span>
                          </div>
                        )}
                        {isWallHung && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-1.5 text-[10px] text-emerald-900 font-semibold flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            <span>Wall-Hung 180mm P-Trap · Needs Cistern Frame</span>
                          </div>
                        )}
                        {isFloorMount && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-1.5 text-[10px] text-blue-900 font-semibold flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                            <span>Floor-Mount 300mm S-Trap · Direct Soil Pipe</span>
                          </div>
                        )}
                        {isCounterBasin && (
                          <div className="bg-teal-50 border border-teal-200 rounded-lg p-1.5 text-[10px] text-teal-900 font-semibold flex items-center gap-1.5">
                            <Droplets className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                            <span>Requires 32mm Bottle Trap &amp; Pillar Cock</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Cart Action Bar */}
                  <div className="p-4 pt-0 border-t border-slate-100 mt-2">
                    <div className="flex items-baseline justify-between pt-3 mb-2">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-black text-slate-900">
                            ₹{prod.price.toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs text-slate-400 line-through">
                            ₹{prod.mrp.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          Ex-GST: ₹{prod.exGstPrice.toLocaleString("en-IN")} · Incl. 18% GST
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {prod.discountPercent}% OFF
                        </span>
                      </div>
                    </div>

                    {/* Compatibility Kit Trigger */}
                    <button
                      onClick={() => setSelectedKitProduct(prod)}
                      className="w-full mb-2.5 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Wrench className="w-3.5 h-3.5 text-sky-600" />
                      View Compatibility Kit
                    </button>

                    {/* Cart Controls */}
                    {quantity > 0 ? (
                      <div className="flex items-center justify-between bg-sky-50 border border-sky-200 rounded-xl p-1">
                        <button
                          onClick={() => handleDecrement(prod, quantity, ids)}
                          className="w-8 h-8 rounded-lg bg-white border border-sky-200 flex items-center justify-center text-sky-700 hover:bg-sky-100 font-bold transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-sm text-sky-900">
                          {quantity} {prod.unit}
                        </span>
                        <button
                          onClick={() => handleIncrement(prod, quantity, ids)}
                          className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white hover:bg-sky-700 font-bold transition-colors shadow-sm"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(prod)}
                        className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Complete Bathroom Compatibility Kit Modal */}
      {selectedKitProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    Plumbing Fit Guardrail
                  </span>
                  <span className="text-xs text-slate-400">
                    {selectedKitProduct.brand} · {selectedKitProduct.subCategory}
                  </span>
                </div>
                <h3 className="text-lg font-bold mt-1 text-white">
                  Compatible Fittings &amp; Plumbing Kit
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Pre-verified fittings for {selectedKitProduct.title}
                </p>
              </div>
              <button
                onClick={() => setSelectedKitProduct(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-start gap-3 text-xs text-sky-900">
                <Info className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Avoid Plumbing Mismatches in Lucknow Construction:</p>
                  <p className="text-sky-800 mt-0.5">
                    Concealed diverter trim plates require matching rough-in bodies; wall-hung closets require structural chair frames; tabletop basins require matching bottle traps and tall pillar cocks.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Recommended Companion Hardware
                </h4>
                {getKitCrossSells(selectedKitProduct).map((item) => {
                  const fullProd = ALL_28_SANITARY_BATH_PRODUCTS.find((p) => p.id === item.id);
                  const { quantity, ids } = getItemCartState({
                    categorySlug: "sanitary-bath-fittings",
                    title: item.title,
                  });

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-all gap-3"
                    >
                      <RealProductImage
                        product={item}
                        src={item.image}
                        alt={item.title}
                        title={item.title}
                        variant="thumb"
                        className="w-16 h-16 object-contain rounded-lg bg-slate-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-sky-600 block">
                          {item.role}
                        </span>
                        <h5 className="text-xs font-bold text-slate-900 truncate">
                          {item.title}
                        </h5>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {item.desc}
                        </p>
                        <div className="text-xs font-bold text-slate-900 mt-1">
                          ₹{item.price.toLocaleString("en-IN")}{" "}
                          <span className="text-[10px] text-slate-400 font-normal">
                            (Incl. 18% GST · HSN {item.hsn})
                          </span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {quantity > 0 ? (
                          <div className="flex items-center gap-1.5 bg-sky-50 border border-sky-200 rounded-lg p-1">
                            <button
                              onClick={() => fullProd && handleDecrement(fullProd, quantity, ids)}
                              className="w-6 h-6 rounded bg-white flex items-center justify-center text-sky-700 font-bold text-xs"
                            >
                              -
                            </button>
                            <span className="font-bold text-xs text-sky-900 px-1">{quantity}</span>
                            <button
                              onClick={() => fullProd && handleIncrement(fullProd, quantity, ids)}
                              className="w-6 h-6 rounded bg-sky-600 flex items-center justify-center text-white font-bold text-xs"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => fullProd && handleAddToCart(fullProd)}
                            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-colors"
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

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedKitProduct(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Internal Product Detail Modal fallback */}
      {modalProduct && (
        <ProductDetailModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
        />
      )}
    </div>
  );
}
