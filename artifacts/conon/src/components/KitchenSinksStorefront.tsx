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
  ALL_38_KITCHEN_PRODUCTS,
  type KitchenSinkProduct,
} from "@/data/kitchenSinksData";

export interface KitchenSinksStorefrontProps {
  onOpenDetail?: (product: Product) => void;
  onBackToDirectory?: () => void;
}

const SUBCATEGORIES = [
  { id: "ALL", label: "All Items", count: 38 },
  { id: "SS_PRESSED_SINK", label: "SS Pressed Sinks", count: 9 },
  { id: "HANDMADE_SS_SINK", label: "Handmade SS Sinks", count: 6 },
  { id: "QUARTZ_SINK", label: "Quartz Sinks", count: 4 },
  { id: "SINK_COCK", label: "Kitchen Sink Cocks", count: 11 },
  { id: "SINK_MIXER_PULLOUT", label: "Mixers & Pull-Out", count: 4 },
  { id: "SINK_ACCESSORY", label: "Accessories & RO", count: 4 },
];

const BRAND_TIERS = [
  { id: "ALL", label: "All Running Brands" },
  { id: "TIER1", label: "Core Sinks (Nirali, Carysil, Ruhe, Futura, Kohler)" },
  { id: "TIER2", label: "Faucets & Cocks (Jaquar, Essco, CERA, Hindware, Parryware)" },
  { id: "TIER3", label: "Plumbing Accessories (Plantex, Fossa, Backline, Ruhe)" },
];

const SINK_MATERIALS = [
  { id: "ALL", label: "All Sink Materials" },
  { id: "PRESSED", label: "SS 304 Pressed (Hydraulic)" },
  { id: "HANDMADE", label: "Handmade 1.2mm Heavy SS" },
  { id: "QUARTZ", label: "Quartz Granite Composite" },
];

const SINK_SIZES = [
  { id: "ALL", label: "All Sink Sizes" },
  { id: "21x18", label: "21×18 in (Compact / Prep)" },
  { id: "24x18", label: "24×18 in (Standard Kitchen)" },
  { id: "32x18", label: "32×18 in (Deep Basin)" },
  { id: "37x18", label: "34-37 in (DB & Drainboard)" },
];

const FINISH_OPTIONS = [
  { id: "ALL", label: "All Finishes" },
  { id: "Chrome", label: "Chrome Plated" },
  { id: "Satin", label: "Satin / Brushed" },
  { id: "Matt", label: "Matt Finish" },
  { id: "Black Matt", label: "Black Matt / Nera" },
];

const CABINET_WIDTHS = [
  { id: "ALL", label: "All Base Cabinets" },
  { id: "600", label: "600 mm (21×18 in)" },
  { id: "700", label: "700 mm (24×18 in)" },
  { id: "900", label: "900 mm (32-34 in)" },
  { id: "1000", label: "1000 mm (36-37 in Double Bowl)" },
];

const MOUNT_TYPES = [
  { id: "ALL", label: "All Mounts" },
  { id: "WALL_MOUNTED", label: "Wall Mounted (In-Wall Plumbing)" },
  { id: "TABLE_DECK_MOUNTED", label: "Table / Deck Mounted (Countertop)" },
];

export function KitchenSinksStorefront({
  onOpenDetail,
  onBackToDirectory,
}: KitchenSinksStorefrontProps) {
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
  const [cabinetFilter, setCabinetFilter] = useState<string>("ALL");
  const [mountFilter, setMountFilter] = useState<string>("ALL");
  const [sinkMaterialFilter, setSinkMaterialFilter] = useState<string>("ALL");
  const [sinkSizeFilter, setSinkSizeFilter] = useState<string>("ALL");
  const [finishFilter, setFinishFilter] = useState<string>("ALL");

  // Cross-Sell / Kitchen-Complete Drawer State
  const [selectedCrossSellProduct, setSelectedCrossSellProduct] = useState<KitchenSinkProduct | null>(null);

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

  const getItemCartState = (prod: KitchenSinkProduct) => {
    const key = `${prod.categorySlug.toLowerCase()}::${prod.name.toLowerCase()}`;
    return cartItemByKey[key] || { ids: [], quantity: 0 };
  };

  // Distinct Brands
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    ALL_38_KITCHEN_PRODUCTS.forEach((p) => brands.add(p.brand));
    return ["ALL", ...Array.from(brands).sort()];
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return ALL_38_KITCHEN_PRODUCTS.filter((prod) => {
      // Subcategory
      if (activeSubcat !== "ALL" && prod.kitchenSubcategory !== activeSubcat) {
        return false;
      }

      // Brand Tier
      if (selectedBrandTier === "TIER1") {
        if (!["Nirali", "Carysil", "Ruhe", "Futura", "Kohler"].includes(prod.brand)) return false;
      } else if (selectedBrandTier === "TIER2") {
        if (!["Jaquar", "Essco", "CERA", "Hindware", "Parryware"].includes(prod.brand)) return false;
      } else if (selectedBrandTier === "TIER3") {
        if (!["Plantex", "Fossa", "Backline"].includes(prod.brand) && prod.kitchenSubcategory !== "SINK_ACCESSORY") return false;
      }

      // Brand
      if (selectedBrand !== "ALL" && prod.brand !== selectedBrand) return false;

      // Base Cabinet Width (applicable to sinks)
      if (cabinetFilter !== "ALL") {
        if (prod.minCabinetWidthMm !== Number(cabinetFilter)) return false;
      }

      // Mount Type (applicable to faucets/mixers)
      if (mountFilter !== "ALL") {
        if (prod.mountType !== mountFilter) return false;
      }

      // Sink Material Filter
      if (sinkMaterialFilter !== "ALL") {
        if (sinkMaterialFilter === "PRESSED" && prod.kitchenSubcategory !== "SS_PRESSED_SINK") return false;
        if (sinkMaterialFilter === "HANDMADE" && prod.kitchenSubcategory !== "HANDMADE_SS_SINK") return false;
        if (sinkMaterialFilter === "QUARTZ" && prod.kitchenSubcategory !== "QUARTZ_SINK") return false;
      }

      // Sink Size Filter
      if (sinkSizeFilter !== "ALL") {
        if (!prod.overallDimensionsInch) return false;
        if (sinkSizeFilter === "21x18" && !prod.overallDimensionsInch.includes("21x18")) return false;
        if (sinkSizeFilter === "24x18" && !prod.overallDimensionsInch.includes("24x18")) return false;
        if (sinkSizeFilter === "32x18" && !prod.overallDimensionsInch.includes("32x18")) return false;
        if (sinkSizeFilter === "37x18" && !["34x20", "36x20", "37x18"].some((s) => prod.overallDimensionsInch?.includes(s))) return false;
      }

      // Finish Filter
      if (finishFilter !== "ALL") {
        if (finishFilter === "Chrome" && prod.finishColor !== "Chrome") return false;
        if (finishFilter === "Satin" && prod.finishColor !== "Satin") return false;
        if (finishFilter === "Matt" && prod.finishColor !== "Matt") return false;
        if (finishFilter === "Black Matt" && !["Black Matt", "Nera Black"].includes(prod.finishColor)) return false;
      }

      return true;
    });
  }, [activeSubcat, selectedBrandTier, selectedBrand, cabinetFilter, mountFilter, sinkMaterialFilter, sinkSizeFilter, finishFilter]);

  // Cart operations
  const handleAdd = (prod: KitchenSinkProduct) => {
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

  const handleIncrement = (prod: KitchenSinkProduct, currentQty: number, itemIds: string[]) => {
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

  const handleDecrement = (prod: KitchenSinkProduct, currentQty: number, itemIds: string[]) => {
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

  const handleOpenDetailModal = (prod: KitchenSinkProduct) => {
    const modalItem: Product = {
      id: prod.id,
      title: prod.title || prod.name,
      materialTag: "Kitchen Sinks & Faucets",
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
    return ALL_38_KITCHEN_PRODUCTS.filter((p) => skus.includes(p.id));
  }, [selectedCrossSellProduct]);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* ── TOP BANNER ────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white px-4 py-6 md:px-8 border-b border-sky-800/40">
        <div className="max-w-7xl mx-auto">
          {onBackToDirectory && (
            <button
              onClick={onBackToDirectory}
              className="inline-flex items-center gap-1.5 text-xs text-sky-300 hover:text-white transition-colors mb-3"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Catalog Directory
            </button>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-sky-500/20 text-sky-300 text-[11px] font-bold px-2 py-0.5 rounded border border-sky-400/30 uppercase tracking-wider">
                  Lucknow Kitchen Hub
                </span>
                <span className="text-slate-400 text-xs flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  100% Genuine SS 304 & German Quartz
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Kitchen Sinks, Faucets & Accessories
              </h1>
              <p className="text-slate-300 text-sm mt-1 max-w-2xl">
                60-minute site delivery across Gomti Nagar, Alambagh, Hazratganj & Chinhat sourced directly from Latouche Road & Hewett Road sanitary master distributors.
              </p>
            </div>

            {/* Hub Trust Indicators */}
            <div className="flex flex-wrap gap-2 md:self-end">
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-2 text-xs flex items-center gap-2">
                <Bike className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-semibold text-white">2-Wheeler Fleet</div>
                  <div className="text-[11px] text-slate-400">Faucets, Mixers & Accessories</div>
                </div>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-2 text-xs flex items-center gap-2">
                <Truck className="w-4 h-4 text-sky-400" />
                <div>
                  <div className="font-semibold text-white">E-Loader Secured</div>
                  <div className="text-[11px] text-slate-400">Single, Drainboard & Quartz Sinks</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PLUMBING COMPATIBILITY ALERT ──────────────────────────────── */}
      <div className="bg-sky-50 border-b border-sky-200 px-4 py-2.5 text-xs text-sky-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Plumbing Guardrail:</strong> Deck-mount / table-mount faucets require pre-drilled countertop/sink holes and 2× under-sink angle stop cocks.
            </span>
          </div>
          <div className="text-sky-700 font-medium">
            Standard 18% GST included with pre-GST base transparency
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
                  ? "bg-sky-700 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeSubcat === cat.id
                    ? "bg-sky-800 text-sky-200"
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
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
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
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
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

            {/* Base Cabinet Width Filter (for sinks) */}
            {(activeSubcat === "ALL" ||
              activeSubcat === "SS_PRESSED_SINK" ||
              activeSubcat === "HANDMADE_SS_SINK" ||
              activeSubcat === "QUARTZ_SINK") && (
              <select
                value={cabinetFilter}
                onChange={(e) => setCabinetFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {CABINET_WIDTHS.map((cw) => (
                  <option key={cw.id} value={cw.id}>
                    Cabinet: {cw.label}
                  </option>
                ))}
              </select>
            )}

            {/* Mount Filter (for faucets) */}
            {(activeSubcat === "ALL" ||
              activeSubcat === "SINK_COCK" ||
              activeSubcat === "SINK_MIXER_PULLOUT") && (
              <select
                value={mountFilter}
                onChange={(e) => setMountFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {MOUNT_TYPES.map((mt) => (
                  <option key={mt.id} value={mt.id}>
                    Mount: {mt.label}
                  </option>
                ))}
              </select>
            )}

            {/* Sink Material Filter */}
            {(activeSubcat === "ALL" ||
              activeSubcat === "SS_PRESSED_SINK" ||
              activeSubcat === "HANDMADE_SS_SINK" ||
              activeSubcat === "QUARTZ_SINK") && (
              <select
                value={sinkMaterialFilter}
                onChange={(e) => setSinkMaterialFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {SINK_MATERIALS.map((sm) => (
                  <option key={sm.id} value={sm.id}>
                    Material: {sm.label}
                  </option>
                ))}
              </select>
            )}

            {/* Sink Size Filter */}
            {(activeSubcat === "ALL" ||
              activeSubcat === "SS_PRESSED_SINK" ||
              activeSubcat === "HANDMADE_SS_SINK" ||
              activeSubcat === "QUARTZ_SINK") && (
              <select
                value={sinkSizeFilter}
                onChange={(e) => setSinkSizeFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {SINK_SIZES.map((ss) => (
                  <option key={ss.id} value={ss.id}>
                    Size: {ss.label}
                  </option>
                ))}
              </select>
            )}

            {/* Finish Filter */}
            <select
              value={finishFilter}
              onChange={(e) => setFinishFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              {FINISH_OPTIONS.map((fo) => (
                <option key={fo.id} value={fo.id}>
                  Finish: {fo.label}
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
            <h3 className="text-lg font-bold text-slate-800">No matching items found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Try resetting your filters or brand tier to view available stock.
            </p>
            <button
              onClick={() => {
                setActiveSubcat("ALL");
                setSelectedBrandTier("ALL");
                setSelectedBrand("ALL");
                setCabinetFilter("ALL");
                setMountFilter("ALL");
                setSinkMaterialFilter("ALL");
                setSinkSizeFilter("ALL");
                setFinishFilter("ALL");
              }}
              className="mt-4 px-4 py-2 bg-sky-700 text-white rounded-lg text-xs font-semibold hover:bg-sky-800"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((prod) => {
              const cartState = getItemCartState(prod);
              const isDeckMount = prod.mountType === "TABLE_DECK_MOUNTED";

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-xl border border-slate-200/90 hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Top Image + Badges */}
                  <div>
                    <div className="relative aspect-square bg-slate-50 p-3 overflow-hidden cursor-pointer" onClick={() => handleOpenDetailModal(prod)}>
                      <RealProductImage
                        product={prod}
                        src={prod.image}
                        alt={prod.name}
                        title={prod.name}
                        brand={prod.brand}
                        category="kitchen-sinks-faucets"
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
                            <Truck className="w-3 h-3 text-sky-600" />
                            <span>E-Loader</span>
                          </>
                        )}
                      </span>

                      {/* Cabinet Width Badge (if sink) */}
                      {prod.minCabinetWidthMm && (
                        <span className="absolute bottom-2.5 left-2.5 bg-sky-50 text-sky-800 border border-sky-300 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          Min Cabinet: {prod.minCabinetWidthMm} mm
                        </span>
                      )}

                      {/* Mount Type Badge (if faucet) */}
                      {prod.mountType && (
                        <span className={`absolute bottom-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm ${
                          isDeckMount
                            ? "bg-amber-50 text-amber-800 border-amber-300"
                            : "bg-blue-50 text-blue-800 border-blue-300"
                        }`}>
                          {prod.mountType === "WALL_MOUNTED" ? "Wall Mount" : "Table/Deck Mount"}
                        </span>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="p-3.5">
                      <div className="text-[11px] font-medium text-slate-400 mb-0.5">
                        {prod.subCategory}
                      </div>
                      <h4
                        onClick={() => handleOpenDetailModal(prod)}
                        className="text-xs font-bold text-slate-800 hover:text-sky-700 cursor-pointer line-clamp-2 leading-snug"
                        title={prod.name}
                      >
                        {prod.name}
                      </h4>

                      {/* Model & Spec Pills */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {prod.oemModelCode && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                            {prod.oemModelCode}
                          </span>
                        )}
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {prod.materialGrade}
                        </span>
                        {prod.overallDimensionsInch && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {prod.overallDimensionsInch}
                          </span>
                        )}
                      </div>

                      {/* Deck Mount Alert Helper */}
                      {isDeckMount && (
                        <div className="mt-2 text-[10px] bg-amber-50 border border-amber-200 text-amber-800 rounded px-2 py-1 flex items-start gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
                          <span>Requires Countertop Hole + 2 Angle Valves</span>
                        </div>
                      )}

                      {/* Cross-Sell Quick Peek Link */}
                      {prod.crossSellSkus && prod.crossSellSkus.length > 0 && (
                        <button
                          onClick={() => setSelectedCrossSellProduct(prod)}
                          className="mt-2.5 text-[11px] text-sky-700 font-semibold hover:text-sky-800 flex items-center gap-1 group/btn"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>View Kitchen-Complete Pairings ({prod.crossSellSkus.length})</span>
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
                        className="w-full py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-sky-50 border border-sky-300 rounded-lg p-1">
                        <button
                          onClick={() => handleDecrement(prod, cartState.quantity, cartState.ids)}
                          className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-sky-800 hover:bg-sky-100 active:scale-95 transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-extrabold text-sky-900 px-2">
                          {cartState.quantity} in Cart
                        </span>
                        <button
                          onClick={() => handleIncrement(prod, cartState.quantity, cartState.ids)}
                          className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-sky-800 hover:bg-sky-100 active:scale-95 transition-all"
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

      {/* ── KITCHEN-COMPLETE CROSS-SELL MODAL ─────────────────────────── */}
      {selectedCrossSellProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Kitchen-Complete Site Pairing</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-800">
                  Recommended Add-Ons for {selectedCrossSellProduct.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pre-verified Lucknow plumber combinations ensuring zero site rework.
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
                  {selectedCrossSellProduct.minCabinetWidthMm && (
                    <div className="text-[10px] text-sky-700 font-semibold mt-0.5">
                      Required Cabinet: {selectedCrossSellProduct.minCabinetWidthMm} mm
                    </div>
                  )}
                </div>
              </div>

              {/* Cross Sell Items */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  Frequently Installed Together
                </h4>
                <div className="space-y-2.5">
                  {crossSellProducts.map((addon) => {
                    const cartState = getItemCartState(addon);
                    return (
                      <div
                        key={addon.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-sky-300 transition-all bg-white"
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
                              className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                            >
                              Add
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5 bg-sky-50 border border-sky-300 rounded-lg p-0.5">
                              <button
                                onClick={() => handleDecrement(addon, cartState.quantity, cartState.ids)}
                                className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-sky-800"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-sky-900 px-1">
                                {cartState.quantity}
                              </span>
                              <button
                                onClick={() => handleIncrement(addon, cartState.quantity, cartState.ids)}
                                className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-sky-800"
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
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setSelectedCrossSellProduct(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DETAIL MODAL FALLBACK ─────────────────────────────────────── */}
      {modalProduct && (
        <ProductDetailModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
        />
      )}
    </div>
  );
}
