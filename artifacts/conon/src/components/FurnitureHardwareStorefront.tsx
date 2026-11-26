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
  ALL_20_FURNITURE_HARDWARE_PRODUCTS,
  type FurnitureHardwareProduct,
} from "@/data/furnitureHardwareData";

export interface FurnitureHardwareStorefrontProps {
  onOpenDetail?: (product: Product) => void;
  onBackToDirectory?: () => void;
}

const SUBCATEGORIES = [
  { id: "ALL", label: "All Items", count: 20 },
  { id: "TELESCOPIC_CHANNEL", label: "Telescopic Channels", count: 6 },
  { id: "HINGE_SLIDING", label: "Hinges & Sliding Track", count: 5 },
  { id: "BED_WARDROBE_LIFT", label: "Bed & Wardrobe Lifts", count: 5 },
  { id: "PIPE_HANDLE", label: "Pipes & SS 304 Handles", count: 4 },
];

const BRAND_TIERS = [
  { id: "ALL", label: "All Running Brands" },
  { id: "TIER1", label: "Priority 1 (Core Fittings: Hettich, Ebco, Hafele)" },
  { id: "TIER2", label: "Priority 2 (Lifts, Sliding & Handles: Rigwell, Decoranddecor, etc.)" },
];

const CLOSING_TYPES = [
  { id: "ALL", label: "All Closing Types" },
  { id: "SOFT_CLOSE", label: "Soft Close (Hydraulic Damped)" },
  { id: "REGULAR_CLOSE", label: "Regular Close" },
  { id: "N/A", label: "Rigid / Mechanical (N/A)" },
];

const LENGTH_PITCH_OPTIONS = [
  { id: "ALL", label: "All Lengths & Pitches" },
  { id: "18in", label: '18" (450mm) Channels' },
  { id: "20in", label: '20" (500mm) Channels' },
  { id: "96mm", label: "96mm C.C. Pitch Handles" },
  { id: "160mm", label: "160mm C.C. Pitch Handles" },
  { id: "224mm", label: "224mm C.C. Pitch Handles" },
  { id: "1.2m", label: "1.2m Sliding Tracks" },
  { id: "lifts", label: "Bed Lifts (900mm–1500mm)" },
];

const VEHICLE_FILTERS = [
  { id: "ALL", label: "All Vehicles" },
  { id: "2-Wheeler", label: "2-Wheeler (60-Min Express)" },
  { id: "E-Loader", label: "E-Loader (Heavy/Long Kits)" },
];

export function FurnitureHardwareStorefront({
  onOpenDetail,
  onBackToDirectory,
}: FurnitureHardwareStorefrontProps) {
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
  const [closingFilter, setClosingFilter] = useState<string>("ALL");
  const [lengthPitchFilter, setLengthPitchFilter] = useState<string>("ALL");
  const [vehicleFilter, setVehicleFilter] = useState<string>("ALL");

  // Cross-Sell / Drawer State
  const [selectedCrossSellProduct, setSelectedCrossSellProduct] = useState<FurnitureHardwareProduct | null>(null);

  // Detail Modal
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

  const getItemCartState = (prod: FurnitureHardwareProduct) => {
    const key = `${prod.categorySlug.toLowerCase()}::${prod.name.toLowerCase()}`;
    return cartItemByKey[key] || { ids: [], quantity: 0 };
  };

  // Distinct Brands
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    ALL_20_FURNITURE_HARDWARE_PRODUCTS.forEach((p) => brands.add(p.brand));
    return ["ALL", ...Array.from(brands).sort()];
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return ALL_20_FURNITURE_HARDWARE_PRODUCTS.map((p) => resolveProduct(p)).filter((prod) => {
      // Subcategory
      if (activeSubcat !== "ALL" && prod.furnitureSubcategory !== activeSubcat) {
        return false;
      }

      // Brand Tier
      if (selectedBrandTier === "TIER1") {
        if (!["Hettich", "Ebco", "Hafele"].includes(prod.brand)) return false;
      } else if (selectedBrandTier === "TIER2") {
        if (["Hettich", "Ebco", "Hafele"].includes(prod.brand)) return false;
      }

      // Brand
      if (selectedBrand !== "ALL" && prod.brand !== selectedBrand) return false;

      // Closing Type
      if (closingFilter !== "ALL" && prod.closingType !== closingFilter) return false;

      // Length / Pitch
      if (lengthPitchFilter !== "ALL") {
        if (lengthPitchFilter === "18in" && !prod.lengthOrPitchSpec.includes("18 in")) return false;
        if (lengthPitchFilter === "20in" && !prod.lengthOrPitchSpec.includes("20 in")) return false;
        if (lengthPitchFilter === "96mm" && !prod.lengthOrPitchSpec.includes("96mm")) return false;
        if (lengthPitchFilter === "160mm" && !prod.lengthOrPitchSpec.includes("160mm")) return false;
        if (lengthPitchFilter === "224mm" && !prod.lengthOrPitchSpec.includes("224mm")) return false;
        if (lengthPitchFilter === "1.2m" && !prod.lengthOrPitchSpec.includes("1.2m")) return false;
        if (lengthPitchFilter === "lifts" && !["900mm", "1500mm", "1200N"].some((s) => prod.lengthOrPitchSpec.includes(s))) return false;
      }

      // Delivery Vehicle
      if (vehicleFilter !== "ALL" && prod.deliveryVehicleType !== vehicleFilter) return false;

      return true;
    });
  }, [activeSubcat, selectedBrandTier, selectedBrand, closingFilter, lengthPitchFilter, vehicleFilter, resolveProduct]);

  // Cart operations
  const handleAdd = (prod: FurnitureHardwareProduct) => {
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
          toast.success(`Added ${prod.name} to cart`, {
            description: `${prod.deliveryVehicleType} express fulfillment from Latouche / Hewett Road`,
          });
        },
      }
    );
  };

  const handleIncrement = (prod: FurnitureHardwareProduct, currentQty: number, itemIds: string[]) => {
    const firstId = itemIds[0];
    if (!firstId) {
      handleAdd(prod);
      return;
    }
    updateCartItem.mutate(
      {
        itemId: firstId,
        data: { quantity: currentQty + 1 },
      },
      {
        onSuccess: () => toast.success(`Updated ${prod.name} quantity to ${currentQty + 1}`),
      }
    );
  };

  const handleDecrement = (prod: FurnitureHardwareProduct, currentQty: number, itemIds: string[]) => {
    const firstId = itemIds[0];
    if (!firstId) return;

    if (currentQty <= 1) {
      removeFromCart.mutate(
        { itemId: firstId },
        {
          onSuccess: () => toast.info(`Removed ${prod.name} from cart`),
        }
      );
    } else {
      updateCartItem.mutate(
        {
          itemId: firstId,
          data: { quantity: currentQty - 1 },
        },
        {
          onSuccess: () => toast.success(`Updated ${prod.name} quantity to ${currentQty - 1}`),
        }
      );
    }
  };

  const handleOpenDetailModal = (prod: FurnitureHardwareProduct) => {
    const modalItem: Product = {
      id: prod.id,
      title: prod.title || prod.name,
      materialTag: "Furniture, Wardrobe & Bed Hardware",
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

  // Find linked cross-sell products for drawer
  const crossSellProducts = useMemo(() => {
    if (!selectedCrossSellProduct) return [];
    const skus = selectedCrossSellProduct.crossSellSkus || [];
    return ALL_20_FURNITURE_HARDWARE_PRODUCTS.filter((p) => skus.includes(p.id));
  }, [selectedCrossSellProduct]);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* ── TOP BANNER ────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-white px-4 py-6 md:px-8 border-b border-amber-800/40">
        <div className="max-w-7xl mx-auto">
          {onBackToDirectory && (
            <button
              onClick={onBackToDirectory}
              className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-white transition-colors mb-3"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Catalog Directory
            </button>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-amber-500/20 text-amber-300 text-[11px] font-bold px-2 py-0.5 rounded border border-amber-400/30 uppercase tracking-wider">
                  Lucknow Hardware Hub
                </span>
                <span className="text-slate-400 text-xs flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  100% Genuine Hettich, Ebco & Hafele
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Furniture, Wardrobe & Bed Hardware
              </h1>
              <p className="text-slate-300 text-sm mt-1 max-w-2xl">
                60-minute site delivery across Gomti Nagar, Alambagh, Hazratganj & Indira Nagar sourced directly from Latouche Road & Hewett Road architectural hardware distributors.
              </p>
            </div>

            {/* Hub Trust Indicators */}
            <div className="flex flex-wrap gap-2 md:self-end">
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-2 text-xs flex items-center gap-2">
                <Bike className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-semibold text-white">2-Wheeler Express (16 SKUs)</div>
                  <div className="text-[11px] text-slate-400">Channels, Hinges, Pull-Downs & Handles</div>
                </div>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-2 text-xs flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-semibold text-white">E-Loader Secured (4 SKUs)</div>
                  <div className="text-[11px] text-slate-400">900mm–1500mm Bed Lifts & 1.2m Track</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CARPENTER FITTING GUARDRAILS ALERT ────────────────────────── */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-950">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Carpenter Fit Notice:</strong> Verify drawer depth (18" vs 20"), hinge crank (0 Crank Full Overlay vs 8 Crank Half Overlay), and handle hole pitch (96mm / 160mm / 224mm C.C.) before ordering.
            </span>
          </div>
          <div className="text-amber-800 font-medium whitespace-nowrap">
            18% GST included with pre-GST base transparency
          </div>
        </div>
      </div>

      {/* ── FILTER CONTROLS ───────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        {/* Subcategories Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {SUBCATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveSubcat(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeSubcat === cat.id
                  ? "bg-amber-800 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeSubcat === cat.id
                    ? "bg-amber-900 text-amber-200"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Secondary Filter Bar */}
        <div className="mt-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 ml-1" />

            {/* Brand Tier */}
            <select
              value={selectedBrandTier}
              onChange={(e) => setSelectedBrandTier(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {BRAND_TIERS.map((bt) => (
                <option key={bt.id} value={bt.id}>
                  {bt.label}
                </option>
              ))}
            </select>

            {/* Specific Brand */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="ALL">All Brands ({availableBrands.length - 1})</option>
              {availableBrands
                .filter((b) => b !== "ALL")
                .map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
            </select>

            {/* Closing Type Filter */}
            <select
              value={closingFilter}
              onChange={(e) => setClosingFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {CLOSING_TYPES.map((ct) => (
                <option key={ct.id} value={ct.id}>
                  {ct.label}
                </option>
              ))}
            </select>

            {/* Length / Pitch Filter */}
            <select
              value={lengthPitchFilter}
              onChange={(e) => setLengthPitchFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {LENGTH_PITCH_OPTIONS.map((lo) => (
                <option key={lo.id} value={lo.id}>
                  {lo.label}
                </option>
              ))}
            </select>

            {/* Delivery Vehicle Filter */}
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {VEHICLE_FILTERS.map((vf) => (
                <option key={vf.id} value={vf.id}>
                  Vehicle: {vf.label}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-900">{filteredProducts.length}</span> verified products
          </div>
        </div>
      </div>

      {/* ── PRODUCT GRID ──────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No matching hardware items found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Try resetting your length/pitch filter, closing type or brand priority to view running items.
            </p>
            <button
              onClick={() => {
                setActiveSubcat("ALL");
                setSelectedBrandTier("ALL");
                setSelectedBrand("ALL");
                setClosingFilter("ALL");
                setLengthPitchFilter("ALL");
                setVehicleFilter("ALL");
              }}
              className="mt-4 px-4 py-2 bg-amber-800 text-white rounded-lg text-xs font-semibold hover:bg-amber-900"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((prod) => {
              const cartState = getItemCartState(prod);
              const isSoftClose = prod.closingType === "SOFT_CLOSE";

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-xl border border-slate-200/90 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Top Image + Badges */}
                  <div>
                    <div
                      className="relative aspect-square bg-slate-50 p-3 overflow-hidden cursor-pointer"
                      onClick={() => handleOpenDetailModal(prod)}
                    >
                      <RealProductImage
                        product={prod}
                        src={prod.image}
                        alt={prod.name}
                        title={prod.name}
                        brand={prod.brand}
                        category="furniture-wardrobe-bed-hardware"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Brand Badge */}
                      <span className="absolute top-2.5 left-2.5 bg-slate-900/85 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase">
                        {prod.brand}
                      </span>

                      {/* Delivery Vehicle Badge */}
                      <span className="absolute top-2.5 right-2.5 bg-white/95 text-slate-700 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-1 shadow-sm">
                        {prod.deliveryVehicleType === "2-Wheeler" ? (
                          <>
                            <Bike className="w-3 h-3 text-emerald-600" />
                            <span>60m Bike</span>
                          </>
                        ) : (
                          <>
                            <Truck className="w-3 h-3 text-amber-600" />
                            <span>E-Loader</span>
                          </>
                        )}
                      </span>

                      {/* Fit Spec Badge */}
                      <span className="absolute bottom-2.5 left-2.5 bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm max-w-[85%] truncate">
                        {prod.fitSpecBadge}
                      </span>
                    </div>

                    {/* Content Section */}
                    <div className="p-3.5">
                      <div className="text-[11px] font-medium text-slate-400 mb-0.5">
                        {prod.subCategory}
                      </div>
                      <h4
                        onClick={() => handleOpenDetailModal(prod)}
                        className="text-xs font-bold text-slate-800 hover:text-amber-800 cursor-pointer line-clamp-2 leading-snug"
                        title={prod.name}
                      >
                        {prod.name}
                      </h4>

                      {/* Spec Chips */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                          {prod.lengthOrPitchSpec}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {prod.loadCapacityLabel}
                        </span>
                        {isSoftClose && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-semibold">
                            Soft Close
                          </span>
                        )}
                      </div>

                      {/* Cross-Sell Quick Peek Link */}
                      {prod.crossSellSkus && prod.crossSellSkus.length > 0 && (
                        <button
                          onClick={() => setSelectedCrossSellProduct(prod)}
                          className="mt-2.5 text-[11px] text-amber-800 font-semibold hover:text-amber-950 flex items-center gap-1 group/btn"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>Carpenter-Complete Pairings ({prod.crossSellSkus.length})</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover/btn:opacity-100" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Pricing + Cart Actions Footer */}
                  <div className="p-3.5 pt-0 border-t border-slate-100 mt-2">
                    <div className="flex items-baseline justify-between mb-2.5 pt-2">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-extrabold text-slate-900">
                            ₹{prod.price.toLocaleString("en-IN")}
                          </span>
                          {prod.mrp > prod.price && (
                            <span className="text-[11px] text-slate-400 line-through">
                              ₹{prod.mrp.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          Ex-GST: ₹{prod.exGstPrice.toLocaleString("en-IN")} (+18% HSN {prod.hsnCode})
                        </div>
                      </div>

                      {prod.discountPercent && prod.discountPercent > 0 && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {prod.discountPercent}% OFF
                        </span>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    {cartState.quantity === 0 ? (
                      <button
                        onClick={() => handleAdd(prod)}
                        disabled={addToCart.isPending}
                        className="w-full py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-amber-50 border border-amber-300 rounded-lg p-1">
                        <button
                          onClick={() => handleDecrement(prod, cartState.quantity, cartState.ids)}
                          className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-amber-900 hover:bg-amber-100 active:scale-95 transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-extrabold text-amber-950 px-2">
                          {cartState.quantity} in Cart
                        </span>
                        <button
                          onClick={() => handleIncrement(prod, cartState.quantity, cartState.ids)}
                          className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-amber-900 hover:bg-amber-100 active:scale-95 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── CARPENTER-COMPLETE CROSS-SELL MODAL ────────────────────────── */}
      {selectedCrossSellProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Carpenter-Complete Site Pairing</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-800">
                  Recommended Add-Ons for {selectedCrossSellProduct.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pre-verified Lucknow master hardware pairings ensuring zero modular installation delays.
                </p>
              </div>
              <button
                onClick={() => setSelectedCrossSellProduct(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Product Reference */}
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <RealProductImage
                  product={selectedCrossSellProduct}
                  src={selectedCrossSellProduct.image}
                  alt={selectedCrossSellProduct.name}
                  title={selectedCrossSellProduct.name}
                  brand={selectedCrossSellProduct.brand}
                  variant="thumb"
                  className="w-14 h-14 object-contain bg-white rounded border border-slate-200 p-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {selectedCrossSellProduct.name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    ₹{selectedCrossSellProduct.price.toLocaleString("en-IN")} • {selectedCrossSellProduct.subCategory}
                  </div>
                  <div className="text-[10px] text-amber-800 font-semibold mt-0.5">
                    Spec: {selectedCrossSellProduct.fitSpecBadge}
                  </div>
                </div>
              </div>

              {/* Cross Sell Items */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  Frequently Ordered Together on Lucknow Sites
                </h4>
                <div className="space-y-2.5">
                  {crossSellProducts.map((addon) => {
                    const cartState = getItemCartState(addon);
                    return (
                      <div
                        key={addon.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-amber-400 transition-all bg-white"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <RealProductImage
                            product={addon}
                            src={addon.image}
                            alt={addon.name}
                            title={addon.name}
                            brand={addon.brand}
                            variant="thumb"
                            className="w-12 h-12 object-contain rounded bg-slate-50 p-1 border border-slate-100 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-slate-800 line-clamp-1">
                              {addon.name}
                            </h5>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2">
                              <span>₹{addon.price.toLocaleString("en-IN")}</span>
                              <span>•</span>
                              <span className="text-[10px] bg-slate-100 px-1 rounded">
                                {addon.brand}
                              </span>
                              <span>•</span>
                              <span className="text-[10px] text-emerald-600 font-semibold">
                                60-Min {addon.deliveryVehicleType}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          {cartState.quantity === 0 ? (
                            <button
                              onClick={() => handleAdd(addon)}
                              className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                            >
                              Add
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 rounded-lg p-0.5">
                              <button
                                onClick={() => handleDecrement(addon, cartState.quantity, cartState.ids)}
                                className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-amber-900"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-amber-950 px-1">
                                {cartState.quantity}
                              </span>
                              <button
                                onClick={() => handleIncrement(addon, cartState.quantity, cartState.ids)}
                                className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-amber-900"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Related Category Links */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>Looking for woodworking glue or plywood?</span>
                <div className="flex items-center gap-2">
                  <a
                    href="/categories?cat=fevicol-adhesives-sealants"
                    className="text-amber-800 font-semibold hover:underline"
                  >
                    Fevicol Adhesives &rarr;
                  </a>
                  <span>•</span>
                  <a
                    href="/categories?cat=wood-boards-surface"
                    className="text-amber-800 font-semibold hover:underline"
                  >
                    Plywood & Laminates &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
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
