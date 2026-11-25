import json

with open("scratch/all_16_wood_hardware_products.json") as f:
    products = json.load(f)

products_ts = json.dumps(products, indent=2)

ts_template = """import React, { useState, useMemo } from "react";
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
  DoorOpen,
  KeyRound,
  Wrench,
  Maximize2,
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

export interface WoodHardwareProduct {
  id: string;
  slug: string;
  name: string;
  title: string;
  brand: string;
  oemModelCode: string;
  categorySlug?: string;
  categoryName?: string;
  subcategory: "plywood-8x4" | "flush-doors-30mm" | "laminates-1mm" | "hardware-locks-hinges";
  subCategory?: string;
  woodSubcategory: "PLYWOOD" | "FLUSH_DOOR" | "LAMINATE" | "HARDWARE";
  thicknessMm?: number | null;
  sheetOrDoorSizeFt?: string;
  areaSqFt?: number | null;
  dimensionsLabel?: string;
  gradeOrRating?: string;
  type: string;
  price: number;
  mrp: number;
  exGstPrice: number;
  effectivePerSqFtPrice?: number | null;
  hsnCode: string;
  gstPercent: number;
  brandTier: number;
  deliveryVehicleType: "2-Wheeler" | "E-Loader" | "E-Loader / Pickup";
  packSize: string;
  unit: string;
  spec: string;
  shortTagline?: string;
  specChips: string[];
  bulkPrice?: number;
  bulkSlabText?: string;
  image: string;
  images: string[];
  rating: number;
  reviewsCount: number;
  deliveryTime: string;
  inStock: boolean;
  optionsCount?: number;
}

export const WOOD_HARDWARE_SUBCATEGORIES = [
  {
    id: "all",
    slug: "all",
    name: "All Plywood & Hardware",
    count: 16,
    icon: "/images/subcategories/plywood-blockboard-icon.webp",
  },
  {
    id: "plywood-8x4",
    slug: "plywood-8x4",
    name: "Plywood (8x4 ft)",
    count: 6,
    icon: "/images/subcategories/plywood-blockboard-icon.webp",
  },
  {
    id: "flush-doors-30mm",
    slug: "flush-doors-30mm",
    name: "Flush Doors (30mm)",
    count: 4,
    icon: "/images/subcategories/wooden-door-hardware-icon.webp",
  },
  {
    id: "laminates-1mm",
    slug: "laminates-1mm",
    name: "Laminates (1mm)",
    count: 2,
    icon: "/images/subcategories/laminates-icon.webp",
  },
  {
    id: "hardware-locks-hinges",
    slug: "hardware-locks-hinges",
    name: "Hardware (Locks & Hinges)",
    count: 4,
    icon: "/images/subcategories/glass-door-hardware-icon.webp",
  },
];

export const ALL_WOOD_HARDWARE_PRODUCTS: WoodHardwareProduct[] = __PRODUCTS_JSON__;

export interface PlywoodCollectionStorefrontProps {
  defaultSubcat?: string;
  onOpenDetail?: (product: Product) => void;
  onBackToDirectory?: () => void;
}

export const PlywoodCollectionStorefront: React.FC<PlywoodCollectionStorefrontProps> = ({
  defaultSubcat,
  onOpenDetail,
  onBackToDirectory,
}) => {
  const queryClient = useQueryClient();
  const { data: cartData } = useGetCart();
  const addToCartMutation = useAddToCart();
  const updateCartItemMutation = useUpdateCartItem();
  const removeFromCartMutation = useRemoveFromCart();

  const [selectedSubcat, setSelectedSubcat] = useState<string>(() => {
    if (defaultSubcat && WOOD_HARDWARE_SUBCATEGORIES.some((s) => s.slug === defaultSubcat)) {
      return defaultSubcat;
    }
    return "all";
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<number | "all">("all");
  const [selectedThickness, setSelectedThickness] = useState<string>("all");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("all");
  const [modalProduct, setModalProduct] = useState<WoodHardwareProduct | null>(null);

  // Cart items flattened
  const cartItems = useMemo(() => {
    const list: Array<{ id: string; materialId: string; quantity: number; name?: string }> = [];
    if (!cartData?.categories) return list;
    for (const c of cartData.categories) {
      for (const item of c.items ?? []) {
        list.push({
          id: item.id,
          materialId: item.materialId,
          quantity: item.quantity,
          name: item.name,
        });
      }
    }
    return list;
  }, [cartData]);

  // Cart index for quick qty lookup
  const cartItemByKey = useMemo(() => {
    const map = new Map<string, (typeof cartItems)[0]>();
    for (const item of cartItems) {
      if (item.materialId) map.set(item.materialId, item);
      if (item.name) map.set(item.name.toLowerCase(), item);
    }
    return map;
  }, [cartItems]);

  // Compatibility Engine: Detect items in cart to trigger cross-sells
  const { hasFlushDoors, hasPlywood } = useMemo(() => {
    let flush = false;
    let ply = false;
    for (const item of cartItems) {
      const titleLower = (item.name || "").toLowerCase();
      if (titleLower.includes("flush door") || titleLower.includes("door 30mm")) flush = true;
      if (titleLower.includes("plywood") || titleLower.includes("sainik") || titleLower.includes("club prime") || titleLower.includes("green gold")) ply = true;
    }
    return { hasFlushDoors: flush, hasPlywood: ply };
  }, [cartItems]);

  // Available brands in the category
  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    ALL_WOOD_HARDWARE_PRODUCTS.forEach((p) => set.add(p.brand));
    return Array.from(set).sort();
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return ALL_WOOD_HARDWARE_PRODUCTS.filter((p) => {
      // Subcategory filter
      if (selectedSubcat !== "all" && p.subcategory !== selectedSubcat) {
        return false;
      }

      // Brand filter
      if (selectedBrand !== "all" && p.brand !== selectedBrand) {
        return false;
      }

      // Tier filter
      if (tierFilter !== "all" && p.brandTier !== tierFilter) {
        return false;
      }

      // Thickness filter
      if (selectedThickness !== "all") {
        if (p.thicknessMm === null || p.thicknessMm === undefined) return false;
        if (p.thicknessMm.toString() !== selectedThickness) return false;
      }

      // Vehicle filter
      if (selectedVehicle !== "all" && p.deliveryVehicleType !== selectedVehicle) {
        return false;
      }

      // Text search
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesHsn = p.hsnCode.includes(q);
        const matchesModel = p.oemModelCode.toLowerCase().includes(q);
        const matchesSpec = p.spec.toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesHsn && !matchesModel && !matchesSpec) {
          return false;
        }
      }

      return true;
    });
  }, [selectedSubcat, selectedBrand, tierFilter, selectedThickness, selectedVehicle, searchQuery]);

  // Cart operations
  const handleAddToCart = (product: WoodHardwareProduct) => {
    const current = cartItemByKey.get(product.id) || cartItemByKey.get(product.name.toLowerCase());
    if (current) {
      updateCartItemMutation.mutate(
        { itemId: current.id, data: { quantity: current.quantity + 1 } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
            toast.success(`Updated ${product.name} in cart`);
          },
        }
      );
    } else {
      addToCartMutation.mutate(
        {
          data: {
            materialId: product.id,
            quantity: 1,
            name: product.name,
            price: product.price,
            unit: product.unit,
            vendor: `${product.brand} Lucknow Depot`,
            category: "Plywood, Doors & Hardware",
          },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
            toast.success(`Added ${product.name} to cart`);
          },
        }
      );
    }
  };

  const handleUpdateQty = (product: WoodHardwareProduct, newQty: number) => {
    const current = cartItemByKey.get(product.id) || cartItemByKey.get(product.name.toLowerCase());
    if (newQty <= 0) {
      if (current) {
        removeFromCartMutation.mutate(
          { itemId: current.id },
          {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
              toast.info(`Removed ${product.name} from cart`);
            },
          }
        );
      }
    } else if (current) {
      updateCartItemMutation.mutate(
        { itemId: current.id, data: { quantity: newQty } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          },
        }
      );
    }
  };

  const toProductCardType = (p: WoodHardwareProduct): Product => {
    return {
      id: p.id,
      title: p.title,
      name: p.title,
      materialTag: p.gradeOrRating || "Plywood & Hardware",
      price: p.price,
      mrp: p.mrp,
      unit: p.unit,
      image: p.image,
      deliveryEta: p.deliveryTime,
      rating: p.rating,
      reviews: p.reviewsCount,
      brand: p.brand,
      vendor: `${p.brand} Lucknow Depot`,
      specs: [
        { label: "HSN Code", value: p.hsnCode },
        { label: "GST Rate", value: `${p.gstPercent}% (Included)` },
        { label: "Base Pre-GST", value: `₹${p.exGstPrice}` },
        { label: "Delivery Vehicle", value: p.deliveryVehicleType },
        { label: "Dimensions", value: p.dimensionsLabel || p.sheetOrDoorSizeFt || "" },
      ],
    };
  };

  const handleOpenDetailModal = (p: WoodHardwareProduct) => {
    if (onOpenDetail) {
      onOpenDetail(toProductCardType(p));
    } else {
      setModalProduct(p);
    }
  };

  const handleResetFilters = () => {
    setSelectedBrand("all");
    setTierFilter("all");
    setSelectedThickness("all");
    setSelectedVehicle("all");
    setSearchQuery("");
  };

  const handleSubcatChange = (slug: string) => {
    setSelectedSubcat(slug);
    setSelectedThickness("all");
  };

  // 1-Click Quick Add Helpers for Recommendations
  const quickAddSku = (sku: string) => {
    const target = ALL_WOOD_HARDWARE_PRODUCTS.find((p) => p.oemModelCode === sku);
    if (target) handleAddToCart(target);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-stone-900 text-white border-b border-amber-900/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
                  Lucknow Wholesale Mandi Direct
                </span>
                <span className="bg-white/10 text-slate-200 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Latouche Road & Charbagh Depots
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  18% GST Compliant
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Plywood, Doors & Architectural Hardware
              </h1>
              <p className="text-xs sm:text-sm text-amber-200/80 mt-1 max-w-2xl">
                100% Genuine CenturyPly Club Prime, Sainik 710, Greenply Marine & Solid Core Flush Doors. Transparent per-sheet and per-sq-ft contractor pricing with vehicle-secured 60-min site dispatch.
              </p>
            </div>

            {/* Quick Sizing & Mandi Pill */}
            <div className="bg-black/40 border border-white/10 rounded-xl p-3 flex items-center gap-3 backdrop-blur-xs self-start md:self-auto">
              <div className="p-2 bg-amber-500/20 text-amber-300 rounded-lg">
                <DoorOpen className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white flex items-center gap-1.5">
                  Standard Sheet & Door Sizes
                </div>
                <div className="text-[11px] text-amber-200/70">
                  8x4 ft (32 sq ft) • 7x3 ft (21 sq ft)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* STEP 5: Carpenter-Safe Cross-Sell Recommendations */}
        {hasFlushDoors && (
          <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-amber-600 text-white rounded-lg shrink-0 mt-0.5">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-600 text-white text-[9px] uppercase font-black px-1.5 py-0.5 rounded-xs tracking-wider">
                      Carpenter Essential
                    </span>
                    <h3 className="text-sm font-bold text-amber-950">
                      30mm Flush Door Fitting Kit Recommended
                    </h3>
                  </div>
                  <p className="text-xs text-amber-900/80 mt-0.5">
                    Your cart contains 30mm Solid Core Flush Doors. Complete your door installation with certified mortise locks and overhead hydraulic closers:
                  </p>
                </div>
              </div>

              {/* 1-Click Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                <button
                  onClick={() => quickAddSku("HDW-GJ-ST-18")}
                  className="text-xs bg-white hover:bg-amber-100 text-amber-950 font-bold px-3 py-1.5 rounded-lg border border-amber-300 shadow-xs flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-600" /> Godrej Stella 180mm (₹1,577)
                </button>
                <button
                  onClick={() => quickAddSku("HDW-DR-DC-60")}
                  className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-white" /> Dorset 60kg Closer (₹927)
                </button>
              </div>
            </div>
          </div>
        )}

        {hasPlywood && (
          <div className="mb-6 bg-gradient-to-r from-stone-50 to-amber-50 border-2 border-stone-300 rounded-xl p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-stone-800 text-white rounded-lg shrink-0 mt-0.5">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-stone-800 text-white text-[9px] uppercase font-black px-1.5 py-0.5 rounded-xs tracking-wider">
                      Cabinet Hardware Pairing
                    </span>
                    <h3 className="text-sm font-bold text-stone-900">
                      Plywood Surfacing & Soft-Close Hinges
                    </h3>
                  </div>
                  <p className="text-xs text-stone-700 mt-0.5">
                    Match your 18mm/19mm Plywood sheets with 1.0mm High Pressure Laminates and German Hettich silent hinges (suited for 15–24mm shutters):
                  </p>
                </div>
              </div>

              {/* 1-Click Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                <button
                  onClick={() => quickAddSku("LAM-CN-WM-01")}
                  className="text-xs bg-white hover:bg-stone-100 text-stone-900 font-bold px-3 py-1.5 rounded-lg border border-stone-300 shadow-xs flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-700" /> Century White Marble (₹2,239)
                </button>
                <button
                  onClick={() => quickAddSku("HDW-HT-ON-01")}
                  className="text-xs bg-stone-800 hover:bg-black text-white font-bold px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-white" /> Hettich Onsys 1-Pair (₹222)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subcategories Horizontal Scrollbar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
          {WOOD_HARDWARE_SUBCATEGORIES.map((cat) => {
            const isActive = selectedSubcat === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => handleSubcatChange(cat.slug)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-amber-900 text-white shadow-sm ring-2 ring-amber-900/20"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-amber-800 text-amber-200" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 mb-6 shadow-xs">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="w-full md:w-80 relative">
              <input
                type="text"
                placeholder="Search brand, HSN 4412/4418, 18mm, 19mm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs px-3 py-2 pl-9 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-900 focus:bg-white transition-all"
              />
              <SlidersHorizontal className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
              {/* Brand Tier Filter */}
              <select
                value={tierFilter}
                onChange={(e) =>
                  setTierFilter(e.target.value === "all" ? "all" : Number(e.target.value))
                }
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 cursor-pointer focus:outline-hidden"
              >
                <option value="all">All Brand Tiers</option>
                <option value="1">Priority 1 (CenturyPly, Century, Greenply)</option>
                <option value="2">Priority 2 (Godrej, Europa, Dorset, Hettich)</option>
              </select>

              {/* Brand Filter */}
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 cursor-pointer focus:outline-hidden"
              >
                <option value="all">All Brands ({availableBrands.length})</option>
                {availableBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              {/* Thickness Filter */}
              <select
                value={selectedThickness}
                onChange={(e) => setSelectedThickness(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 cursor-pointer focus:outline-hidden"
              >
                <option value="all">Thickness (All)</option>
                <option value="18">18mm (Plywood)</option>
                <option value="19">19mm (Heavy Plywood)</option>
                <option value="30">30mm (Flush Doors)</option>
                <option value="1">1.0mm (Laminates)</option>
              </select>

              {/* Delivery Vehicle Filter */}
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 cursor-pointer focus:outline-hidden"
              >
                <option value="all">Vehicle (All)</option>
                <option value="E-Loader / Pickup">E-Loader / Pickup (Flatbed)</option>
                <option value="E-Loader">E-Loader (Laminates)</option>
                <option value="2-Wheeler">2-Wheeler (Express Locks/Hinges)</option>
              </select>

              {/* Reset Button */}
              {(selectedBrand !== "all" ||
                tierFilter !== "all" ||
                selectedThickness !== "all" ||
                selectedVehicle !== "all" ||
                searchQuery !== "") && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 whitespace-nowrap cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center my-8">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No matching wood or hardware products found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try resetting your brand, thickness, or vehicle filters to browse available Lucknow inventory.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((p) => {
              const cartItem =
                cartItemByKey.get(p.id) || cartItemByKey.get(p.title.toLowerCase());
              const cartQty = cartItem?.quantity ?? 0;

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-xl border border-slate-200/90 hover:border-amber-400/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Top Badges Strip */}
                  <div className="p-3 pb-0 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      {/* Vehicle Badge */}
                      <span
                        className={`text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-sm flex items-center gap-1 ${
                          p.deliveryVehicleType === "E-Loader / Pickup"
                            ? "bg-slate-900 text-amber-300 border border-slate-700"
                            : p.deliveryVehicleType === "E-Loader"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        }`}
                      >
                        {p.deliveryVehicleType === "2-Wheeler" ? (
                          <Bike className="w-2.5 h-2.5 text-emerald-700" />
                        ) : (
                          <Truck className="w-2.5 h-2.5 text-amber-400" />
                        )}
                        {p.deliveryVehicleType}
                      </span>

                      {/* HSN & 18% GST Badge */}
                      <span className="text-[9.5px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                        HSN {p.hsnCode} (18% GST)
                      </span>
                    </div>

                    {/* Thickness / Sizing Spec Pill */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {p.thicknessMm && (
                        <span className="text-[10px] font-black bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.2 rounded-sm">
                          {p.thicknessMm}mm Thickness
                        </span>
                      )}
                      {p.dimensionsLabel && (
                        <span className="text-[10px] font-medium bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-sm">
                          {p.dimensionsLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Packshot Image */}
                  <div
                    onClick={() => handleOpenDetailModal(p)}
                    className="relative w-full aspect-square p-4 flex items-center justify-center cursor-pointer bg-white"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "/images/products/wood/century-sainik-710-bwp.webp";
                      }}
                    />
                    <button
                      type="button"
                      className="absolute bottom-2 right-2 p-1.5 bg-white/90 hover:bg-white text-slate-600 rounded-md shadow-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Product Info Section */}
                  <div className="p-3 pt-0 flex flex-col gap-1.5 grow justify-between">
                    <div>
                      <div className="text-[11px] font-black text-amber-800 uppercase tracking-wide">
                        {p.brand} • {p.oemModelCode}
                      </div>

                      <h4
                        onClick={() => handleOpenDetailModal(p)}
                        className="text-xs font-bold text-slate-900 line-clamp-2 hover:text-amber-800 cursor-pointer mt-0.5 leading-snug"
                        title={p.name}
                      >
                        {p.name}
                      </h4>

                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-tight">
                        {p.spec}
                      </p>
                    </div>

                    {/* Dual Rate Pricing Block */}
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <div className="flex items-baseline justify-between gap-1">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm sm:text-base font-black text-slate-900">
                              ₹{p.price.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[10px] text-slate-400 line-through">
                              ₹{p.mrp.toLocaleString("en-IN")}
                            </span>
                          </div>
                          {p.effectivePerSqFtPrice ? (
                            <div className="text-[11px] font-extrabold text-emerald-700">
                              ≈ ₹{p.effectivePerSqFtPrice}/sq ft
                            </div>
                          ) : (
                            <div className="text-[10.5px] text-slate-500 font-medium">
                              {p.unit}
                            </div>
                          )}
                        </div>

                        {/* Ex-GST Base */}
                        <div className="text-right">
                          <span className="text-[9.5px] text-slate-400 block font-medium">
                            Base: ₹{p.exGstPrice.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[9px] text-amber-700 font-bold block">
                            +18% GST
                          </span>
                        </div>
                      </div>

                      {/* Bulk Slab Pill */}
                      {p.bulkSlabText && (
                        <div className="mt-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-sm inline-block">
                          {p.bulkSlabText}
                        </div>
                      )}

                      {/* Add to Cart / Qty Stepper */}
                      <div className="mt-3">
                        {cartQty === 0 ? (
                          <button
                            onClick={() => handleAddToCart(p)}
                            className="w-full text-xs font-bold bg-amber-900 hover:bg-amber-950 text-white py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </button>
                        ) : (
                          <div className="flex items-center justify-between bg-amber-50 border border-amber-300 rounded-lg p-0.5">
                            <button
                              onClick={() => handleUpdateQty(p, cartQty - 1)}
                              className="w-7 h-7 flex items-center justify-center text-amber-950 hover:bg-amber-200 rounded-md cursor-pointer transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-black text-amber-950 px-2">
                              {cartQty}
                            </span>
                            <button
                              onClick={() => handleUpdateQty(p, cartQty + 1)}
                              className="w-7 h-7 flex items-center justify-center text-amber-950 hover:bg-amber-200 rounded-md cursor-pointer transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
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

      {/* Product Detail Modal */}
      {modalProduct && (
        <ProductDetailModal
          product={toProductCardType(modalProduct)}
          isOpen={Boolean(modalProduct)}
          onClose={() => setModalProduct(null)}
        />
      )}
    </div>
  );
};
"""

full_content = ts_template.replace("__PRODUCTS_JSON__", products_ts)

with open("artifacts/conon/src/components/PlywoodCollectionStorefront.tsx", "w") as f:
    f.write(full_content)

print("Generated artifacts/conon/src/components/PlywoodCollectionStorefront.tsx successfully!")
