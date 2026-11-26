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
  Palette,
  AlertTriangle,
  ArrowRight,
  Droplets,
  Brush,
  Search,
  X,
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
import { CATALOG_PRODUCTS, type IProduct } from "@/data/catalogData";
import type { Product } from "@/components/ProductCard";
import { ProductImage } from "@/components/ProductImage";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { useProductMediaVault } from "@/context/ProductMediaVaultContext";

export const PAINTS_PRODUCTS: IProduct[] = CATALOG_PRODUCTS.filter(
  (p) => p.categorySlug === "painting"
);

export interface PaintsStorefrontProps {
  onOpenDetail?: (product: Product) => void;
}

export const PaintsCollectionStorefront: React.FC<PaintsStorefrontProps> = ({ onOpenDetail }) => {
  const { resolveProduct } = useProductMediaVault();
  const queryClient = useQueryClient();
  const { data: cartData } = useGetCart();
  const addToCartMutation = useAddToCart();
  const updateCartMutation = useUpdateCartItem();
  const removeFromCartMutation = useRemoveFromCart();

  const [activeSubcategory, setActiveSubcategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedSurface, setSelectedSurface] = useState<string>("all");
  const [selectedPackSize, setSelectedPackSize] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [modalProduct, setModalProduct] = useState<IProduct | null>(null);
  const [shadePreferences, setShadePreferences] = useState<Record<string, "white" | "custom">>({});
  const [systemStageStep, setSystemStageStep] = useState<number>(1);

  // Subcategories config
  const subcategories = [
    { id: "all", name: "All Products", count: PAINTS_PRODUCTS.length },
    {
      id: "wall-putty",
      name: "Wall Putty",
      subKey: "WALL_PUTTY",
      count: PAINTS_PRODUCTS.filter((p) => p.paintSubcategory === "WALL_PUTTY").length,
    },
    {
      id: "wall-metal-primers",
      name: "Wall & Metal Primers",
      subKey: "PRIMER",
      count: PAINTS_PRODUCTS.filter((p) => p.paintSubcategory === "PRIMER").length,
    },
    {
      id: "interior-paints-distempers",
      name: "Interior Paints & Distempers",
      subKey: "INTERIOR_PAINT",
      count: PAINTS_PRODUCTS.filter((p) => p.paintSubcategory === "INTERIOR_PAINT").length,
    },
    {
      id: "exterior-paints",
      name: "Exterior Paints",
      subKey: "EXTERIOR_PAINT",
      count: PAINTS_PRODUCTS.filter((p) => p.paintSubcategory === "EXTERIOR_PAINT").length,
    },
    {
      id: "enamels-tools",
      name: "Enamels, Thinners & Tools",
      subKey: "ENAMEL_AND_TOOLS",
      count: PAINTS_PRODUCTS.filter((p) => p.paintSubcategory === "ENAMEL_AND_TOOLS").length,
    },
  ];

  // Unique Brands
  const brands = useMemo(() => {
    const b = Array.from(new Set(PAINTS_PRODUCTS.map((p) => p.brand)));
    return ["all", ...b];
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return PAINTS_PRODUCTS.map((p) => resolveProduct(p)).filter((p) => {
      // Subcategory filter
      if (activeSubcategory !== "all") {
        const matchedSub = subcategories.find((s) => s.id === activeSubcategory);
        if (matchedSub && matchedSub.subKey && p.paintSubcategory !== matchedSub.subKey) {
          return false;
        }
      }
      // Brand filter
      if (selectedBrand !== "all" && p.brand !== selectedBrand) {
        return false;
      }
      // Surface filter
      if (selectedSurface !== "all") {
        if (selectedSurface === "INTERIOR" && p.surfaceType !== "INTERIOR" && p.surfaceType !== "INTERIOR_AND_EXTERIOR") {
          return false;
        }
        if (selectedSurface === "EXTERIOR" && p.surfaceType !== "EXTERIOR" && p.surfaceType !== "INTERIOR_AND_EXTERIOR") {
          return false;
        }
        if (selectedSurface === "METAL_AND_WOOD" && p.surfaceType !== "METAL_AND_WOOD" && p.surfaceType !== "UNIVERSAL") {
          return false;
        }
      }
      // Pack size filter
      if (selectedPackSize !== "all") {
        if (selectedPackSize === "20L" && !(p.packSizeUnit === "L" && p.packSizeValue === 20)) return false;
        if (selectedPackSize === "4L" && !(p.packSizeUnit === "L" && p.packSizeValue === 4)) return false;
        if (selectedPackSize === "1L" && !(p.packSizeUnit === "L" && p.packSizeValue === 1)) return false;
        if (selectedPackSize === "40kg" && !(p.packSizeUnit === "kg" && p.packSizeValue === 40)) return false;
        if (selectedPackSize === "20kg" && !(p.packSizeUnit === "kg" && p.packSizeValue === 20)) return false;
        if (selectedPackSize === "tools" && p.packSizeUnit !== "pc" && p.packSizeUnit !== "pcs") return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchBrand = p.brand.toLowerCase().includes(q);
        const matchFinish = (p.finishType || "").toLowerCase().includes(q);
        const matchOem = (p.oemModelCode || "").toLowerCase().includes(q);
        const matchTag = (p.shortTagline || "").toLowerCase().includes(q);
        return matchName || matchBrand || matchFinish || matchOem || matchTag;
      }
      return true;
    });
  }, [activeSubcategory, selectedBrand, selectedSurface, selectedPackSize, searchQuery, resolveProduct]);

  // Cart Helpers
  const cartItemMap = useMemo(() => {
    const map = new Map<string, { quantity: number; itemId: string }>();
    if (cartData && cartData.categories) {
      for (const cat of cartData.categories) {
        for (const item of cat.items) {
          map.set(item.materialId, { quantity: item.quantity, itemId: item.id });
        }
      }
    }
    return map;
  }, [cartData]);

  // Heavy Load Check
  const heavyLoadDetails = useMemo(() => {
    let totalPuttyBags = 0;
    let totalPaint20LBuckets = 0;
    let totalWeightKg = 0;

    cartItemMap.forEach((entry, materialId) => {
      const prod = PAINTS_PRODUCTS.find((p) => p.slug === materialId || p.id === materialId);
      if (prod) {
        if (prod.paintSubcategory === "WALL_PUTTY" && prod.packSizeUnit === "kg") {
          totalPuttyBags += entry.quantity;
          totalWeightKg += (prod.packSizeValue || 0) * entry.quantity;
        } else if (prod.packSizeUnit === "L" && prod.packSizeValue === 20) {
          totalPaint20LBuckets += entry.quantity;
          totalWeightKg += 25 * entry.quantity; // approx 25kg per 20L bucket
        }
      }
    });

    const requiresMiniTruck = totalPuttyBags >= 15 || totalPaint20LBuckets >= 10 || totalWeightKg >= 600;
    return {
      totalPuttyBags,
      totalPaint20LBuckets,
      totalWeightKg,
      requiresMiniTruck,
    };
  }, [cartItemMap]);

  const handleAddToCart = async (p: IProduct, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const shade = shadePreferences[p.id] || (p.isTintable ? "white" : undefined);
    try {
      await addToCartMutation.mutateAsync({
        data: {
          materialId: p.slug,
          quantity: 1,
        },
      });
      await queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      toast.success(
        `${p.name} added to cart${shade === "custom" ? " (Computerized Shade Requested)" : ""}!`
      );
    } catch {
      toast.error("Failed to add to cart. Please retry.");
    }
  };

  const handleUpdateQty = async (p: IProduct, newQty: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const entry = cartItemMap.get(p.slug) || cartItemMap.get(p.id);
    if (!entry) return;

    try {
      if (newQty <= 0) {
        await removeFromCartMutation.mutateAsync({ itemId: entry.itemId });
        toast.info(`${p.name} removed from cart`);
      } else {
        await updateCartMutation.mutateAsync({
          itemId: entry.itemId,
          data: { quantity: newQty },
        });
      }
      await queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
    } catch {
      toast.error("Failed to update cart");
    }
  };

  const handleCardClick = (p: IProduct) => {
    if (onOpenDetail) {
      const mapped: Product = {
        id: p.id,
        slug: p.slug,
        title: p.name,
        name: p.name,
        materialTag: p.surfaceType || p.paintSubcategory || "Paint",
        price: p.price,
        mrp: p.mrp,
        unit: p.unit,
        image: p.image,
        description: p.description,
        rating: p.rating,
        reviews: p.reviewsCount,
        deliveryEta: p.deliveryEta,
        brand: p.brand,
        vendor: p.vendor,
        features: p.highlights,
        specs: (p.specifications || []).map((s) => ({ label: s.label, value: s.value })),
      };
      onOpenDetail(mapped);
    } else {
      setModalProduct(p);
    }
  };

  const toggleShade = (productId: string, shade: "white" | "custom", e: React.MouseEvent) => {
    e.stopPropagation();
    setShadePreferences((prev) => ({ ...prev, [productId]: shade }));
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-16">
      {/* Category Hero Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 text-white py-10 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-100 border border-emerald-400/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  18% GST Compliant (Sep 2025 Order)
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20">
                  <Truck className="w-3.5 h-3.5 text-amber-200" />
                  Latouche Road & Aminabad Wholesalers
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20">
                  <Clock className="w-3.5 h-3.5 text-amber-200" />
                  60-Min Express Dispatch
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Paints, Putty & Primer
              </h1>
              <p className="mt-2 text-sm sm:text-base text-amber-100 max-w-2xl">
                Authentic dealer packshots, verified 18% GST invoice pricing, 4-stage Painter-Safe system pairing, and instant delivery across Lucknow.
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center border border-white/10">
                <div className="text-2xl font-bold">48</div>
                <div className="text-xs text-amber-100">Verified SKUs</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center border border-white/10">
                <div className="text-2xl font-bold">18%</div>
                <div className="text-xs text-amber-100">Flat GST Rate</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center border border-white/10">
                <div className="text-2xl font-bold">8</div>
                <div className="text-xs text-amber-100">Lucknow Brands</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center border border-white/10">
                <div className="text-2xl font-bold">60m</div>
                <div className="text-xs text-amber-100">Express Transit</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Heavy Vehicle Alert Banner */}
        {heavyLoadDetails.requiresMiniTruck && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm flex items-start gap-3">
            <Truck className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Heavy Material Alert: Mini-Truck Upgrade Activated
              </h4>
              <p className="text-xs text-amber-700 mt-1">
                Your order contains {heavyLoadDetails.totalPuttyBags > 0 ? `${heavyLoadDetails.totalPuttyBags} Wall Putty Bags ` : ""}
                {heavyLoadDetails.totalPaint20LBuckets > 0 ? `+ ${heavyLoadDetails.totalPaint20LBuckets} 20L Master Buckets ` : ""}
                (approx {heavyLoadDetails.totalWeightKg} kg load). Automatic dispatch via 4-wheeler Mini-Truck directly from Transport Nagar depot with helper support.
              </p>
            </div>
          </div>
        )}

        {/* 4-Stage Painter-Safe Pairing Engine Banner */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div>
                <span className="font-bold text-sm tracking-wide">Painter-Safe™ 4-Stage Pairing System</span>
                <span className="hidden sm:inline text-xs text-slate-400 ml-2">
                  (Prevent paint peeling, salt efflorescence & roller marks)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-400 font-medium">Stage {systemStageStep} of 4:</span>
              <span className="text-xs text-slate-300 font-semibold">
                {systemStageStep === 1 && "Wall Putty Foundation"}
                {systemStageStep === 2 && "Primer Sealer"}
                {systemStageStep === 3 && "Emulsion Topcoat"}
                {systemStageStep === 4 && "Tools & Thinner"}
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Step 1 */}
              <div
                onClick={() => {
                  setSystemStageStep(1);
                  setActiveSubcategory("wall-putty");
                }}
                className={`cursor-pointer rounded-lg p-3.5 border transition-all ${
                  systemStageStep === 1
                    ? "bg-amber-50/80 border-amber-400 shadow-sm ring-1 ring-amber-400"
                    : "bg-slate-50 border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">Stage 1</span>
                  <Droplets className="w-4 h-4 text-amber-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Wall Putty</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Birla White / JK WallMaxX white cement putty. Fills voids & self-cures.
                </p>
                <div className="mt-2 text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                  Browse 8 Putties <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              {/* Step 2 */}
              <div
                onClick={() => {
                  setSystemStageStep(2);
                  setActiveSubcategory("wall-metal-primers");
                }}
                className={`cursor-pointer rounded-lg p-3.5 border transition-all ${
                  systemStageStep === 2
                    ? "bg-amber-50/80 border-amber-400 shadow-sm ring-1 ring-amber-400"
                    : "bg-slate-50 border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">Stage 2</span>
                  <Layers className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Primer Sealer</h4>
                <p className="text-xs text-slate-600 mt-1">
                  TruCare Interior / Exterior Primer. Seals suction & locks efflorescence.
                </p>
                <div className="mt-2 text-[11px] text-blue-700 font-semibold flex items-center gap-1">
                  Browse 8 Primers <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              {/* Step 3 */}
              <div
                onClick={() => {
                  setSystemStageStep(3);
                  setActiveSubcategory("interior-paints-distempers");
                }}
                className={`cursor-pointer rounded-lg p-3.5 border transition-all ${
                  systemStageStep === 3
                    ? "bg-amber-50/80 border-amber-400 shadow-sm ring-1 ring-amber-400"
                    : "bg-slate-50 border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">Stage 3</span>
                  <Palette className="w-4 h-4 text-purple-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Emulsion Topcoat</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Tractor, Apcolite, Royale or Apex exterior emulsions in 4L / 20L.
                </p>
                <div className="mt-2 text-[11px] text-purple-700 font-semibold flex items-center gap-1">
                  Browse 24 Topcoats <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              {/* Step 4 */}
              <div
                onClick={() => {
                  setSystemStageStep(4);
                  setActiveSubcategory("enamels-tools");
                }}
                className={`cursor-pointer rounded-lg p-3.5 border transition-all ${
                  systemStageStep === 4
                    ? "bg-amber-50/80 border-amber-400 shadow-sm ring-1 ring-amber-400"
                    : "bg-slate-50 border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Stage 4</span>
                  <Brush className="w-4 h-4 text-emerald-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Tools & Enamel</h4>
                <p className="text-xs text-slate-600 mt-1">
                  TruCare 9" Rollers, 4" Brushes, 180-Grit Sandpaper, MTO Thinner & Enamel.
                </p>
                <div className="mt-2 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  Browse 8 Tools <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Stage Warning Notice */}
            <div className="mt-4 p-3 bg-slate-100 rounded-lg flex items-center gap-2.5 text-xs text-slate-700">
              <Info className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span>
                <strong>Painter Tip:</strong> Asian Paints TruCare Acrylic Putty is strictly formulated for interior plaster and POP. For exterior elevations, always use Birla White WallCare or JK WallMaxX white cement based putty.
              </span>
            </div>
          </div>
        </div>

        {/* Filter Controls Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 space-y-4">
          {/* Subcategory Tabs */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Subcategory ({subcategories.length} Lines)
            </label>
            <div className="flex flex-wrap gap-2">
              {subcategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubcategory(sub.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    activeSubcategory === sub.id
                      ? "bg-slate-900 text-white shadow-sm ring-2 ring-slate-900"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  {sub.name}{" "}
                  <span className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full ${
                    activeSubcategory === sub.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                  }`}>
                    {sub.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
            {/* Search Input */}
            <div className="md:col-span-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                Search Catalog
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Brand, finish, code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 focus:bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                Brand
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full py-1.5 px-3 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Brands ({brands.length - 1})</option>
                {brands
                  .filter((b) => b !== "all")
                  .map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
              </select>
            </div>

            {/* Surface Filter */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                Surface Compatibility
              </label>
              <select
                value={selectedSurface}
                onChange={(e) => setSelectedSurface(e.target.value)}
                className="w-full py-1.5 px-3 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Surfaces</option>
                <option value="INTERIOR">Interior Walls & Ceilings</option>
                <option value="EXTERIOR">Exterior Facades & Boundary</option>
                <option value="METAL_AND_WOOD">Metal Grills & Wooden Doors</option>
              </select>
            </div>

            {/* Pack Size Filter */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                Pack Size
              </label>
              <select
                value={selectedPackSize}
                onChange={(e) => setSelectedPackSize(e.target.value)}
                className="w-full py-1.5 px-3 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Pack Sizes</option>
                <option value="20L">20 Litre Master Drum</option>
                <option value="4L">4 Litre Standard Can</option>
                <option value="1L">1 Litre Touch-up Tin</option>
                <option value="40kg">40 kg Bulk Sack (Putty)</option>
                <option value="20kg">20 kg Bucket / Sack</option>
                <option value="tools">Rollers, Brushes & Tools</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter & Active Filters Display */}
        <div className="flex items-center justify-between text-xs text-slate-600 px-1">
          <div>
            Showing <strong className="text-slate-900">{filteredProducts.length}</strong> of{" "}
            <strong>{PAINTS_PRODUCTS.length}</strong> products
          </div>
          {(activeSubcategory !== "all" ||
            selectedBrand !== "all" ||
            selectedSurface !== "all" ||
            selectedPackSize !== "all" ||
            searchQuery) && (
            <button
              onClick={() => {
                setActiveSubcategory("all");
                setSelectedBrand("all");
                setSelectedSurface("all");
                setSelectedPackSize("all");
                setSearchQuery("");
              }}
              className="text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((p) => {
            const cartEntry = cartItemMap.get(p.slug) || cartItemMap.get(p.id);
            const inCart = !!cartEntry;
            const currentQty = cartEntry?.quantity || 0;
            const shade = shadePreferences[p.id] || "white";
            const deliveryType = p.deliveryVehicleType || "2-Wheeler";

            return (
              <div
                key={p.id}
                onClick={() => handleCardClick(p)}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  {/* Image & Delivery Badge Header */}
                  <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                    <ProductImage
                      src={p.image}
                      alt={p.name}
                      sku={p.slug || p.id}
                      className="w-full h-full object-contain bg-white p-2 group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Vehicle Type Pill */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/95 text-slate-800 shadow-sm border border-slate-200">
                      {deliveryType.includes("2-Wheeler") ? (
                        <>
                          <Bike className="w-3.5 h-3.5 text-blue-600" />
                          <span>2-Wheeler Express</span>
                        </>
                      ) : (
                        <>
                          <Truck className="w-3.5 h-3.5 text-amber-600" />
                          <span>{deliveryType}</span>
                        </>
                      )}
                    </div>

                    {/* GST Tag Pill */}
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white shadow-sm">
                      18% GST (HSN {p.hsnCode})
                    </div>

                    {/* Tintable Indicator */}
                    {p.isTintable && (
                      <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-600 text-white shadow-sm flex items-center gap-1">
                        <Palette className="w-3 h-3" />
                        <span>Tintable Base</span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-amber-700">{p.brand}</span>
                      <span className="font-mono text-[11px]">{p.oemModelCode}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors">
                      {p.name}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-1 italic">
                      {p.finishType}
                    </p>

                    {/* Spec Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(p.specChips || []).slice(0, 3).map((chip, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>

                    {/* Tinting Selector Toggle for Tintable Emulsions */}
                    {p.isTintable && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="mt-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200"
                      >
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1.5">
                          <span>Shade Mode:</span>
                          <span className="text-[10px] text-purple-700 font-bold uppercase">
                            {shade === "white" ? "Base White" : "Computerized Tint"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => toggleShade(p.id, "white", e)}
                            className={`py-1 text-[11px] rounded font-medium border transition-colors ${
                              shade === "white"
                                ? "bg-white text-slate-900 border-amber-500 font-bold shadow-sm"
                                : "bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200"
                            }`}
                          >
                            Base White
                          </button>
                          <button
                            type="button"
                            onClick={(e) => toggleShade(p.id, "custom", e)}
                            className={`py-1 text-[11px] rounded font-medium border transition-colors ${
                              shade === "custom"
                                ? "bg-purple-600 text-white border-purple-600 font-bold shadow-sm"
                                : "bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200"
                            }`}
                          >
                            Color Code
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Pricing & Add to Cart */}
                <div className="p-4 pt-0 space-y-3">
                  <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-extrabold text-slate-900">
                          ₹{p.price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          ₹{p.mrp.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Ex-GST: ₹{(p.exGstPrice || Math.round(p.price / 1.18)).toLocaleString("en-IN")}
                      </div>
                    </div>

                    {/* Effective Rate Pill */}
                    {p.effectiveUnitRate && (
                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          ₹{p.effectiveUnitRate.toFixed(p.effectiveUnitRate % 1 === 0 ? 0 : 2)} / {p.packSizeUnit}
                        </span>
                        <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                          {p.discountPercent}% OFF
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Add to Cart Actions */}
                  <div>
                    {!inCart ? (
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(p, e)}
                        className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white transition-colors shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Package className="w-4 h-4" />
                        <span>Add to Order</span>
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-slate-900 text-white rounded-lg p-1">
                        <button
                          type="button"
                          onClick={(e) => handleUpdateQty(p, currentQty - 1, e)}
                          className="w-8 h-7 flex items-center justify-center rounded hover:bg-slate-800 active:bg-slate-700 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold px-2">{currentQty} in Cart</span>
                        <button
                          type="button"
                          onClick={(e) => handleUpdateQty(p, currentQty + 1, e)}
                          className="w-8 h-7 flex items-center justify-center rounded hover:bg-slate-800 active:bg-slate-700 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty Search Results State */}
        {filteredProducts.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No matching products found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We couldn't find any products matching your current search and filter settings. Try resetting your filters.
            </p>
            <button
              onClick={() => {
                setActiveSubcategory("all");
                setSelectedBrand("all");
                setSelectedSurface("all");
                setSelectedPackSize("all");
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Upgraded Blinkit/Zepto Multi-Image Product Detail Modal */}
      <ProductDetailModal
        product={modalProduct ? resolveProduct(modalProduct) : null}
        open={Boolean(modalProduct)}
        onClose={() => setModalProduct(null)}
        onAddToCart={(prod, qty) => {
          const count = Math.max(1, qty || 1);
          for (let i = 0; i < count; i++) {
            void handleAddToCart(prod as IProduct);
          }
        }}
      />
    </div>
  );
};

// Backward Compatibility Alias for Home.tsx and Categories.tsx
export const PaintingCollectionStorefront = PaintsCollectionStorefront;
export default PaintsCollectionStorefront;
