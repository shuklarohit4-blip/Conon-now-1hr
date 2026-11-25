import React, { useState, useMemo } from "react";
import {
  Clock,
  ChevronRight,
  Minus,
  Plus,
  SlidersHorizontal,
  Bike,
  ShieldCheck,
  Check,
  Package,
  Sparkles,
  Info,
  Wrench,
  HardHat,
  Eye,
  AlertTriangle,
  Zap,
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
  ALL_9_TOOLS_SAFETY_PRODUCTS,
  type ToolsSafetyProduct,
} from "@/data/toolsSafetyData";

export interface PowerToolsSafetyStorefrontProps {
  onOpenDetail?: (product: Product) => void;
}

export function PowerToolsSafetyStorefront({ onOpenDetail }: PowerToolsSafetyStorefrontProps) {
  const qc = useQueryClient();
  const invalidateCart = () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() });
  const addToCart = useAddToCart({ mutation: { onSuccess: invalidateCart } });
  const updateCartItem = useUpdateCartItem({ mutation: { onSuccess: invalidateCart } });
  const removeFromCart = useRemoveFromCart({ mutation: { onSuccess: invalidateCart } });
  const { data: cart } = useGetCart();

  // Active subcategory tab
  const [activeSubcat, setActiveSubcat] = useState<string>("ALL");
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"relevance" | "price-asc" | "price-desc">("relevance");
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  // Cart item mapping
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

  const getItemCartState = (prod: ToolsSafetyProduct) => {
    const key = `${prod.categorySlug.toLowerCase()}::${prod.name.toLowerCase()}`;
    return cartItemByKey[key] || { ids: [], quantity: 0 };
  };

  const handleAdd = (prod: ToolsSafetyProduct, e?: React.MouseEvent) => {
    e?.stopPropagation();
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

  const handleIncrement = (prod: ToolsSafetyProduct, currentQty: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const itemState = getItemCartState(prod);
    if (itemState.ids.length > 0) {
      updateCartItem.mutate({
        itemId: itemState.ids[0],
        data: { quantity: currentQty + 1 },
      });
    }
  };

  const handleDecrement = (prod: ToolsSafetyProduct, currentQty: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
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

  const openProduct = (prod: ToolsSafetyProduct) => {
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
    if (onOpenDetail) onOpenDetail(p);
    else setModalProduct(p);
  };

  // Subcategory tabs
  const subcategoryTabs = [
    { id: "ALL", label: "All Items", count: ALL_9_TOOLS_SAFETY_PRODUCTS.length },
    {
      id: "Power Tools",
      label: "Power Tools",
      count: ALL_9_TOOLS_SAFETY_PRODUCTS.filter((p) => p.subCategory === "Power Tools").length,
    },
    {
      id: "Hand & Measuring Tools",
      label: "Hand & Measuring",
      count: ALL_9_TOOLS_SAFETY_PRODUCTS.filter((p) => p.subCategory === "Hand & Measuring Tools").length,
    },
    {
      id: "Site Safety & PPE",
      label: "Site Safety & PPE",
      count: ALL_9_TOOLS_SAFETY_PRODUCTS.filter((p) => p.subCategory === "Site Safety & PPE").length,
    },
  ];

  // Brand filter
  const brandList = ["ALL", "Bosch", "Taparia", "Stanley", "Karam", "3M", "SMASYS"];

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return ALL_9_TOOLS_SAFETY_PRODUCTS.filter((p) => {
      if (activeSubcat !== "ALL" && p.subCategory !== activeSubcat) return false;
      if (selectedBrand !== "ALL" && p.brand !== selectedBrand) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return 0;
    });
  }, [activeSubcat, selectedBrand, sortBy]);

  // Site-Safe Cross-Sell Bundles
  const crossSellBundles = [
    {
      id: "grinder-bundle",
      title: "Angle Grinder Safe Operator Kit",
      headline: "Mandatory Eye & Spark Protection",
      mainProduct: ALL_9_TOOLS_SAFETY_PRODUCTS.find((p) => p.id === "prod-tools-bosch-gws-600"),
      addonProduct: ALL_9_TOOLS_SAFETY_PRODUCTS.find((p) => p.id === "prod-safety-3m-fahrenheit-7136013"),
      reason: "High-RPM angle grinding generates hazardous metal sparks and abrasive grit. Pair with 3M chemical/impact goggles for zero corneal injury.",
    },
    {
      id: "rotary-bundle",
      title: "Rotary Hammer Overhead Protection Kit",
      headline: "Debris & Concrete Fall Protection",
      mainProduct: ALL_9_TOOLS_SAFETY_PRODUCTS.find((p) => p.id === "prod-tools-bosch-gbh-2-26-re"),
      addonProduct: ALL_9_TOOLS_SAFETY_PRODUCTS.find((p) => p.id === "prod-safety-karam-pn501"),
      reason: "Overhead masonry drilling causes heavy mortar chipping and falling concrete debris. Pair with ISI Shelmet for contractor safety compliance.",
    },
    {
      id: "height-bundle",
      title: "Scaffolding & High-Rise Safety Kit",
      headline: "Fall Arrest & High-Visibility",
      mainProduct: ALL_9_TOOLS_SAFETY_PRODUCTS.find((p) => p.id === "prod-safety-karam-ki01-pn351"),
      addonProduct: ALL_9_TOOLS_SAFETY_PRODUCTS.find((p) => p.id === "prod-safety-smasys-reflective-jacket"),
      reason: "Working on scaffolding above 6 feet requires dual-hook lanyard arrest plus 360° reflective jacket for crane & dumper visibility.",
    },
  ];

  const handleAddBundle = (bundle: (typeof crossSellBundles)[0]) => {
    if (!bundle.mainProduct || !bundle.addonProduct) return;
    addToCart.mutate(
      {
        data: {
          materialId: bundle.mainProduct.id,
          category: bundle.mainProduct.categorySlug,
          name: bundle.mainProduct.name,
          quantity: 1,
          price: bundle.mainProduct.price,
          unit: bundle.mainProduct.unit,
        },
      },
      {
        onSuccess: () => {
          addToCart.mutate({
            data: {
              materialId: bundle.addonProduct!.id,
              category: bundle.addonProduct!.categorySlug,
              name: bundle.addonProduct!.name,
              quantity: 1,
              price: bundle.addonProduct!.price,
              unit: bundle.addonProduct!.unit,
            },
          });
          toast.success(`Added ${bundle.title} (2 items) to cart!`);
        },
      }
    );
  };

  return (
    <div className="w-full bg-[#F8FAFC] min-h-screen pb-16">
      {/* ── Top Category Header Banner ── */}
      <div className="bg-gradient-to-r from-[#1848a0] via-[#1e3a8a] to-[#0f172a] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-blue-900 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                60-Min Express • Lucknow
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Bike className="w-3 h-3" />
                2-Wheeler Fleet Express
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              Power Tools, Hand Tools &amp; Site Safety
            </h1>
            <p className="text-xs sm:text-sm text-blue-200 mt-1 max-w-2xl leading-relaxed">
              Wholesale contractor supply sourced directly from Latouche Road &amp; Hewett Road. Bosch 800W rotary hammers, angle grinders, Taparia insulated sets, Stanley tapes, and ISI safety gear delivered in 60 minutes.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-2.5 rounded-xl self-start md:self-auto">
            <div className="text-center px-2 border-r border-white/20">
              <div className="text-xs text-blue-200 font-medium">GST Rate</div>
              <div className="text-base font-black text-white">18% Standard</div>
            </div>
            <div className="text-center px-2 border-r border-white/20">
              <div className="text-xs text-blue-200 font-medium">Verified SKUs</div>
              <div className="text-base font-black text-white">9 Items</div>
            </div>
            <div className="text-center px-2">
              <div className="text-xs text-blue-200 font-medium">Delivery Mode</div>
              <div className="text-base font-black text-amber-300">2-Wheeler 60m</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* ── Subcategory Navigation Tabs ── */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {subcategoryTabs.map((tab) => {
            const isActive = activeSubcat === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubcat(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#1848a0] text-white shadow-md shadow-blue-900/20"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Brand Filter & Sort Bar ── */}
        <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Brand:
            </span>
            {brandList.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedBrand === b
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-semibold bg-transparent border-0 text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* ── "Site-Safe" Cross-Sell Pairing Engine (Required by STEP 5) ── */}
        <div className="mt-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-amber-500 text-white shadow-2xs">
              <HardHat className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Site-Safe™ Safety &amp; Tool Pairing Recommendation Engine
              </h2>
              <p className="text-xs text-slate-600">
                Lucknow Contractor Safety Protocol: High-speed power tools must be paired with mandatory PPE.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {crossSellBundles.map((bundle) => {
              if (!bundle.mainProduct || !bundle.addonProduct) return null;
              return (
                <div
                  key={bundle.id}
                  className="bg-white rounded-xl p-4 border border-amber-200 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">
                      <span>{bundle.headline}</span>
                      <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded text-[10px]">
                        Safety Pairing
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
                      {bundle.title}
                    </h3>
                    <p className="text-[11.5px] text-slate-500 mb-3 leading-relaxed">
                      {bundle.reason}
                    </p>

                    {/* Pair Items Mini Preview */}
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 mb-3">
                      <RealProductImage
                        product={bundle.mainProduct}
                        src={bundle.mainProduct.image}
                        variant="thumb"
                        className="w-10 h-10 object-contain rounded bg-white border border-slate-200 shrink-0"
                      />
                      <span className="text-xs font-bold text-slate-400">+</span>
                      <RealProductImage
                        product={bundle.addonProduct}
                        src={bundle.addonProduct.image}
                        variant="thumb"
                        className="w-10 h-10 object-contain rounded bg-white border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1 ml-1">
                        <div className="text-[11px] font-bold text-slate-800 truncate">
                          {bundle.mainProduct.brand} + {bundle.addonProduct.brand}
                        </div>
                        <div className="text-xs font-black text-emerald-700">
                          ₹{(bundle.mainProduct.price + bundle.addonProduct.price).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddBundle(bundle)}
                    className="w-full py-2 px-3 rounded-lg bg-[#1848a0] hover:bg-[#123678] active:scale-[0.99] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>1-Click Add Safety Bundle</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Product Grid (All 9 Verified SKUs) ── */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              {activeSubcat === "ALL" ? "All Products" : activeSubcat} ({filteredProducts.length} items)
            </h2>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Bike className="w-3.5 h-3.5 text-emerald-600" />
              <span>All 9 items dispatch via 2-Wheeler (60 mins)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((prod) => {
              const itemState = getItemCartState(prod);
              const inCart = itemState.quantity > 0;

              return (
                <div
                  key={prod.id}
                  onClick={() => openProduct(prod)}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-200 p-4 flex flex-col justify-between cursor-pointer group relative"
                >
                  {/* Top Badges */}
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                        {prod.brand}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
                        <Bike className="w-3 h-3" />
                        60m Express
                      </span>
                    </div>

                    {/* Product Image */}
                    <div className="w-full aspect-square bg-[#FAFAFA] rounded-xl overflow-hidden mb-3 p-3 flex items-center justify-center relative">
                      <RealProductImage
                        product={prod}
                        src={prod.image}
                        alt={prod.name}
                        title={prod.name}
                        brand={prod.brand}
                        category="power-tools-safety"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Key Spec Overlay Badge */}
                      <div className="absolute bottom-2 left-2 right-2 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-bold py-1 px-2 rounded-md text-center truncate">
                        {prod.keySpecBadge}
                      </div>
                    </div>

                    {/* Subcategory & Title */}
                    <div className="text-[10.5px] font-semibold text-slate-400 mb-1">
                      {prod.subCategory} • HSN {prod.hsnCode}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#1848a0] transition-colors leading-snug line-clamp-2">
                      {prod.name}
                    </h3>

                    {/* Spec Chips */}
                    <div className="flex flex-wrap gap-1 mt-2.5 mb-3">
                      {prod.specChips.slice(0, 3).map((chip, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing & Add to Cart Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                    <div>
                      <div className="flex items-baseline gap-1.5 leading-none">
                        <span className="text-lg font-black text-slate-900">
                          ₹{prod.price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          ₹{prod.mrp.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="text-[10.5px] text-slate-500 font-medium mt-1 leading-none">
                        Ex-GST: ₹{prod.exGstPrice.toLocaleString("en-IN")}{" "}
                        <span className="text-emerald-600 font-semibold">(18% GST)</span>
                      </div>
                    </div>

                    {/* Cart Action Button */}
                    <div onClick={(e) => e.stopPropagation()}>
                      {!inCart ? (
                        <button
                          onClick={(e) => handleAdd(prod, e)}
                          className="h-9 px-4 rounded-xl bg-[#1848a0] hover:bg-[#123678] active:scale-95 text-white font-bold text-xs transition cursor-pointer shadow-xs flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>ADD</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 bg-[#1848a0] text-white rounded-xl px-2 h-9 shadow-xs">
                          <button
                            onClick={(e) => handleDecrement(prod, itemState.quantity, e)}
                            className="p-1 hover:bg-white/20 rounded active:scale-90 transition cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">
                            {itemState.quantity}
                          </span>
                          <button
                            onClick={(e) => handleIncrement(prod, itemState.quantity, e)}
                            className="p-1 hover:bg-white/20 rounded active:scale-90 transition cursor-pointer"
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
        </div>
      </div>

      {/* Product Detail Modal */}
      {modalProduct && (
        <ProductDetailModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
          onAddToCart={() => {
            const found = ALL_9_TOOLS_SAFETY_PRODUCTS.find((p) => p.id === modalProduct.id);
            if (found) handleAdd(found);
          }}
        />
      )}
    </div>
  );
}

export default PowerToolsSafetyStorefront;
