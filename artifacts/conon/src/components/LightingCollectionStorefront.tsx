import React, { useEffect, useMemo, useState } from "react";
import {
  Lightbulb,
  ShieldCheck,
  Sparkles,
  X,
  Plus,
  CheckCircle2,
  Package,
  AlertTriangle,
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
import { useLiveProductMerger } from "@/hooks/useCononLiveData";
import {
  LIGHTING_BRANDS,
  LIGHTING_MOUNT_FILTERS,
  LIGHTING_PRODUCTS,
  LIGHTING_SUBCATEGORIES,
  type CctKelvin,
  type LightingProduct,
  type LightingSubCategoryId,
} from "@/data/lightingCatalog";
import {
  CategoryHeader,
  DualRowFilterBar,
  FloatingReorderLast,
  HorizontalSubCategoryBar,
  ProductCard,
  SiteCompanionBanner,
} from "@/components/storefront/UnifiedStorefrontPrimitives";
import { LuminaireSvgGraphic } from "@/components/storefront/CategoryProductGraphics";
import {
  KELVIN_META,
  KelvinPreviewToggle,
} from "@/components/lighting/KelvinPreviewToggle";
import {
  RoomLightingCalculatorModal,
  type CalculatedKitLine,
} from "@/components/lighting/RoomLightingCalculatorModal";

export { LIGHTING_PRODUCTS };

export interface LightingCollectionStorefrontProps {
  defaultSubcat?: string;
  onBack?: () => void;
  onOpenDetail?: (product: Product) => void;
}

const LAST_LIGHTING_ORDER_KEY = "conon_last_lighting_order_v1";

function resolveInitialLightingSubcat(defaultSubcat?: string): LightingSubCategoryId {
  const valid = new Set(LIGHTING_SUBCATEGORIES.map((s) => s.id));
  if (defaultSubcat && valid.has(defaultSubcat as LightingSubCategoryId)) {
    return defaultSubcat as LightingSubCategoryId;
  }
  if (typeof window !== "undefined") {
    const path = window.location.pathname.toLowerCase();
    const params = new URLSearchParams(window.location.search);
    const subParam = params.get("subcat")?.toLowerCase() || "";
    const target = `${path} ${subParam}`;
    for (const sub of LIGHTING_SUBCATEGORIES) {
      if (target.includes(sub.id)) return sub.id;
    }
    if (target.includes("concealed") || target.includes("junction")) return "concealed-junction-lights";
    if (target.includes("cob") || target.includes("spot")) return "cob-spot-lights";
    if (target.includes("strip") || target.includes("profile") || target.includes("driver")) return "strip-profiles-drivers";
    if (target.includes("batten") || target.includes("tube")) return "led-battens";
    if (target.includes("bulb") || target.includes("inverter") || target.includes("emergency")) return "bulbs-inverter-emergency";
    if (target.includes("cabinet") || target.includes("track") || target.includes("commercial")) return "cabinet-track-commercial";
    if (target.includes("outdoor") || target.includes("flood") || target.includes("gate")) return "outdoor-flood-gate-lights";
  }
  return "concealed-junction-lights";
}

export function LightingCollectionStorefront({
  defaultSubcat,
  onBack,
  onOpenDetail,
}: LightingCollectionStorefrontProps) {
  const qc = useQueryClient();
  const { data: cart } = useGetCart();
  const invalidateCart = () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() });
  const addToCart = useAddToCart({ mutation: { onSuccess: invalidateCart } });
  const updateCartItem = useUpdateCartItem({ mutation: { onSuccess: invalidateCart } });
  const removeFromCart = useRemoveFromCart({ mutation: { onSuccess: invalidateCart } });
  const mergeLiveProducts = useLiveProductMerger();

  const [activeSubcat, setActiveSubcat] = useState<LightingSubCategoryId>(() =>
    resolveInitialLightingSubcat(defaultSubcat),
  );
  const [mountFilter, setMountFilter] = useState<string>("all");
  const [surgeOnly, setSurgeOnly] = useState<boolean>(false);
  const [cct3in1Only, setCct3in1Only] = useState<boolean>(false);
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [specFilter, setSpecFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("relevance");

  // Live Kelvin Mood Glow Simulator state per SKU
  const [cctByProduct, setCctByProduct] = useState<Record<string, CctKelvin>>({});
  const [calcOpen, setCalcOpen] = useState<boolean>(false);
  const [companionDismissed, setCompanionDismissed] = useState<boolean>(false);
  const [companionTriggerTitle, setCompanionTriggerTitle] = useState<string | null>(null);

  // Variant & Pack-of-10 Drawer State
  const [variantModalProduct, setVariantModalProduct] = useState<LightingProduct | null>(null);
  const [drawerVariantIdx, setDrawerVariantIdx] = useState<number>(0);
  const [drawerPackMode, setDrawerPackMode] = useState<"SINGLE" | "PACK10">("SINGLE");
  const [quickDetailProduct, setQuickDetailProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (defaultSubcat) {
      setActiveSubcat(resolveInitialLightingSubcat(defaultSubcat));
    }
  }, [defaultSubcat]);

  const liveProducts = useMemo(
    () => mergeLiveProducts(LIGHTING_PRODUCTS as unknown as any[]) as LightingProduct[],
    [mergeLiveProducts],
  );

  const cartItemsList = useMemo(() => {
    const list: Array<{ id: string; materialId: string; quantity: number; name?: string; price?: number }> = [];
    if (!cart?.categories) return list;
    for (const c of cart.categories) {
      for (const item of c.items ?? []) {
        list.push({
          id: String(item.id),
          materialId: item.materialId,
          quantity: item.quantity,
          name: item.name,
          price: item.price,
        });
      }
    }
    return list;
  }, [cart]);

  // Detect if Strip or Track exists in cart without SMPS driver or Profile
  const cartNeedsDriverOrProfile = useMemo(() => {
    const hasStripOrTrack = cartItemsList.some(
      (i) =>
        i.materialId.includes("strip") ||
        i.materialId.includes("magnetic-track") ||
        (i.name || "").toLowerCase().includes("profile strip"),
    );
    const hasDriver = cartItemsList.some(
      (i) => i.materialId.includes("smps-driver") || (i.name || "").toLowerCase().includes("smps driver"),
    );
    const hasProfile = cartItemsList.some(
      (i) => i.materialId.includes("alu-profile") || (i.name || "").toLowerCase().includes("aluminium profile"),
    );
    return {
      show: (hasStripOrTrack && (!hasDriver || !hasProfile)) || Boolean(companionTriggerTitle),
      hasDriver,
      hasProfile,
    };
  }, [cartItemsList, companionTriggerTitle]);

  const getCct = (product: LightingProduct): CctKelvin =>
    cctByProduct[product.id] || product.defaultCct || "4000K";

  const handleSelectCct = (productId: string, cct: CctKelvin) => {
    setCctByProduct((prev) => ({ ...prev, [productId]: cct }));
  };

  const getQtyInCart = (productId: string): number =>
    cartItemsList
      .filter((it) => it.materialId === productId || it.materialId.startsWith(`${productId}::`))
      .reduce((s, it) => s + it.quantity, 0);

  const findPrimaryCartItem = (productId: string) =>
    cartItemsList.find((it) => it.materialId === productId || it.materialId.startsWith(`${productId}::`));

  const handleAddSingle = (
    product: LightingProduct,
    overridePrice?: number,
    overrideLabel?: string,
    overrideQty = 1,
    overrideUnit?: string,
  ) => {
    const activeCct = getCct(product);
    const cctLabel = KELVIN_META[activeCct]?.short || activeCct;
    const itemName = overrideLabel
      ? `${product.title} — ${overrideLabel} (${cctLabel})`
      : `${product.title} (${cctLabel})`;
    const unitPrice = overridePrice ?? product.price;

    try {
      localStorage.setItem(
        LAST_LIGHTING_ORDER_KEY,
        JSON.stringify([{ materialId: product.id, name: itemName, price: unitPrice, unit: overrideUnit || product.unit, brand: product.brand, quantity: overrideQty }]),
      );
    } catch {}

    addToCart.mutate(
      {
        data: {
          materialId: product.id,
          name: itemName,
          category: "Lighting",
          price: unitPrice,
          unit: overrideUnit || product.unit,
          vendor: product.brand,
          quantity: overrideQty,
        },
      },
      {
        onSuccess: () => {
          invalidateCart();
          if (product.companionNeed === "smps-driver") {
            setCompanionTriggerTitle(product.title);
            setCompanionDismissed(false);
            toast.success(`Added ${itemName}`, {
              description: "Need a 12V SMPS Driver & 2m Profile? Add them in 1 click below!",
            });
          } else {
            toast.success(`Added ${itemName} to Site Cart`);
          }
        },
        onError: () => toast.error("Could not add to cart"),
      },
    );
  };

  const handleUpdateQty = (product: LightingProduct, nextQty: number) => {
    const match = findPrimaryCartItem(product.id);
    if (!match) return;
    if (nextQty <= 0) {
      removeFromCart.mutate({ itemId: match.id }, { onSuccess: invalidateCart });
    } else {
      updateCartItem.mutate({ itemId: match.id, data: { quantity: nextQty } }, { onSuccess: invalidateCart });
    }
  };

  const handleAddCompanionSku = (skuId: string) => {
    const comp = liveProducts.find((p) => p.id === skuId);
    if (comp) handleAddSingle(comp);
  };

  const handleAddFullRoomKit = (lines: CalculatedKitLine[], kitDiscountPct: number) => {
    for (const line of lines) {
      const discountedUnit = Math.round(line.product.price * (1 - kitDiscountPct / 100));
      addToCart.mutate({
        data: {
          materialId: line.product.id,
          name: `${line.product.title} [Room Kit -${kitDiscountPct}%]`,
          category: "Lighting",
          price: discountedUnit,
          unit: line.product.unit,
          vendor: line.product.brand,
          quantity: line.qty,
        },
      });
    }
    try {
      localStorage.setItem(
        LAST_LIGHTING_ORDER_KEY,
        JSON.stringify(
          lines.map((l) => ({
            materialId: l.product.id,
            name: `${l.product.title} [Room Kit]`,
            price: Math.round(l.product.price * (1 - kitDiscountPct / 100)),
            unit: l.product.unit,
            brand: l.product.brand,
            quantity: l.qty,
          })),
        ),
      );
    } catch {}
    toast.success(`Full Room Lighting Kit (${lines.length} items) added at 5% extra off!`);
  };

  const handleReorderLast = () => {
    try {
      const raw = localStorage.getItem(LAST_LIGHTING_ORDER_KEY);
      if (raw) {
        const items = JSON.parse(raw) as Array<{
          materialId: string;
          name: string;
          price: number;
          unit: string;
          brand: string;
          quantity: number;
        }>;
        if (Array.isArray(items) && items.length > 0) {
          for (const it of items) {
            addToCart.mutate({
              data: {
                materialId: it.materialId,
                name: it.name,
                category: "Lighting",
                price: it.price,
                unit: it.unit,
                vendor: it.brand,
                quantity: it.quantity || 1,
              },
            });
          }
          toast.success(`Reordered ${items.length} Lighting SKU(s) to Cart`);
          return;
        }
      }
    } catch {}
    // Default fast-reorder starter if no history yet
    const starter = liveProducts[0];
    if (starter) handleAddSingle(starter);
  };

  const filteredProducts = useMemo(() => {
    let list = liveProducts.filter((p) => p.subcategory === activeSubcat);
    if (mountFilter !== "all") list = list.filter((p) => p.mountType === mountFilter);
    if (surgeOnly) list = list.filter((p) => p.surgeProtectionKv >= 3.5);
    if (cct3in1Only) list = list.filter((p) => Boolean(p.is3in1Cct));
    if (brandFilter !== "all") list = list.filter((p) => p.brand.toLowerCase() === brandFilter.toLowerCase());

    if (specFilter !== "all") {
      if (specFilter === "under-8w") list = list.filter((p) => p.wattage > 0 && p.wattage <= 8);
      else if (specFilter === "10w-18w") list = list.filter((p) => p.wattage >= 10 && p.wattage <= 18);
      else if (specFilter === "20w-plus") list = list.filter((p) => p.wattage >= 20);
      else if (specFilter === "3000K" || specFilter === "4000K" || specFilter === "6500K") {
        list = list.filter((p) => p.supportedCcts.includes(specFilter));
      }
    }

    if (priceFilter !== "all") {
      if (priceFilter === "under-300") list = list.filter((p) => p.price < 300);
      else if (priceFilter === "300-700") list = list.filter((p) => p.price >= 300 && p.price <= 700);
      else if (priceFilter === "700-1500") list = list.filter((p) => p.price > 700 && p.price <= 1500);
      else if (priceFilter === "above-1500") list = list.filter((p) => p.price > 1500);
    }

    const sorted = [...list];
    if (sortBy === "price-low") sorted.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-high") sorted.sort((a, b) => b.price - a.price);
    else if (sortBy === "discount") sorted.sort((a, b) => b.discountPct - a.discountPct);
    return sorted;
  }, [
    liveProducts,
    activeSubcat,
    mountFilter,
    surgeOnly,
    cct3in1Only,
    brandFilter,
    specFilter,
    priceFilter,
    sortBy,
  ]);

  const toGenericProduct = (p: LightingProduct): Product => ({
    id: p.id,
    name: p.title,
    title: p.title,
    brand: p.brand,
    unit: p.unit,
    price: p.price,
    mrp: p.mrp,
    image: p.image,
    materialTag: "Lighting",
    rating: 4.8,
    reviews: 96,
    deliveryEta: "60 Mins",
    specs: p.spec ? [{ label: "Specs", value: p.spec }] : [],
    bulkPrice: Math.round(p.packOf10Price / 10),
    bulkSlabText: `Pack of 10 @ ₹${p.packOf10Price.toLocaleString("en-IN")} (-${p.packOf10DiscountPct}%)`,
  });

  const activeSubcatMeta =
    LIGHTING_SUBCATEGORIES.find((s) => s.id === activeSubcat) || LIGHTING_SUBCATEGORIES[0];

  const handleOpenDetail = (p: LightingProduct) => {
    const gp = toGenericProduct(p);
    if (onOpenDetail) onOpenDetail(gp);
    else setQuickDetailProduct(gp);
  };

  return (
    <div className="w-full bg-[#F4F6F8] dark:bg-slate-950 min-h-screen pb-24">
      <CategoryHeader
        title="Lighting & Architectural LED"
        breadcrumbCategory="Lighting"
        activeSubCategoryName={activeSubcatMeta.name}
        hubSubtitle="Latouche Road & Naka Hindola Hubs"
        icon={<Lightbulb className="w-5 h-5" />}
        onBack={onBack}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4">
        <SiteCompanionBanner
          icon={<Sparkles className="w-5 h-5" />}
          title="Essential Lucknow Lighting & POP False Ceiling Companion"
          description={'Never stall site wiring. Pair every Zero-Dot LED Strip with a 20%-buffered SMPS Driver, Aluminium Profile, and exact 3"/4"/6" cutout fixtures in 60 mins.'}
          goldCtaLabel="✨ Room Light & Choke Calculator →"
          onGoldCtaClick={() => setCalcOpen(true)}
          blueCtaLabel="Drivers & Profiles"
          onBlueCtaClick={() => {
            setActiveSubcat("strip-profiles-drivers");
            setMountFilter("all");
          }}
        />

        {/* Smart Companion Auto-Upsell Banner when LED Strip or Magnetic Track is added */}
        {cartNeedsDriverOrProfile.show && !companionDismissed && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-extrabold text-amber-950 dark:text-amber-200">
                  Strip &amp; Magnetic Track Site Companion Check
                </p>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  LED strips &amp; profiles require a 12V SMPS Driver and 2m Recessed Aluminium Channel with Milky Diffuser for spotless POP finish.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {!cartNeedsDriverOrProfile.hasDriver && (
                <button
                  type="button"
                  onClick={() => handleAddCompanionSku("philips-12v-5a-smps-driver")}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#12357A] text-white text-[11px] font-bold hover:bg-[#0B1B3D] cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  12V 5A Driver (₹380)
                </button>
              )}
              {!cartNeedsDriverOrProfile.hasProfile && (
                <button
                  type="button"
                  onClick={() => handleAddCompanionSku("alu-profile-2m-recessed-corner")}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-[11px] font-black hover:bg-amber-300 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  2m Alu Profile (₹265)
                </button>
              )}
              <button
                type="button"
                onClick={() => setCompanionDismissed(true)}
                aria-label="Dismiss lighting companion tip"
                className="p-1 rounded-lg text-amber-700 dark:text-amber-300 hover:bg-amber-200/40 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Horizontal Sub-Category Pill Cards (NO old left sidebar!) */}
        <HorizontalSubCategoryBar
          activeId={activeSubcat}
          onSelect={(id) => {
            setActiveSubcat(id as LightingSubCategoryId);
            if (typeof window !== "undefined") {
              window.history.pushState({}, "", `/collections/${id}`);
            }
          }}
          items={LIGHTING_SUBCATEGORIES.map((s) => ({
            id: s.id,
            name: s.name,
            count: s.count,
            thumbnail: <LuminaireSvgGraphic kind={s.visualKind} cct="4000K" compact />,
          }))}
        />

        {/* Dual-Row Filter Bar */}
        <DualRowFilterBar
          row1Label="Fit:"
          quickFilters={LIGHTING_MOUNT_FILTERS}
          activeQuickFilter={mountFilter}
          onQuickFilterChange={setMountFilter}
          trustHighlights={[
            {
              id: "surge",
              label: "🛡️ 3.5kV+ Surge Proof",
              active: surgeOnly,
              tone: "emerald",
              onToggle: () => setSurgeOnly((v) => !v),
            },
            {
              id: "cct3in1",
              label: "🌈 3-in-1 CCT Switchable",
              active: cct3in1Only,
              tone: "amber",
              onToggle: () => setCct3in1Only((v) => !v),
            },
          ]}
          brandFilterValue={brandFilter}
          onBrandFilterChange={setBrandFilter}
          brandOptions={[
            { value: "all", label: "All Brands (Lucknow Distributors)" },
            ...LIGHTING_BRANDS.map((b) => ({ value: b, label: b })),
          ]}
          specFilterValue={specFilter}
          onSpecFilterChange={setSpecFilter}
          specOptions={[
            { value: "all", label: "All CCT / Wattages" },
            { value: "under-8w", label: "3W – 8W (Concealed / Spot)" },
            { value: "10w-18w", label: "10W – 18W (Panels / COBs)" },
            { value: "20w-plus", label: "20W – 100W (Battens / Floods)" },
            { value: "3000K", label: "3000K Warm White" },
            { value: "4000K", label: "4000K Natural White" },
            { value: "6500K", label: "6500K Cool Day Light" },
          ]}
          priceFilterValue={priceFilter}
          onPriceFilterChange={setPriceFilter}
          priceOptions={[
            { value: "all", label: "Price: All Ranges" },
            { value: "under-300", label: "Under ₹300" },
            { value: "300-700", label: "₹300 – ₹700" },
            { value: "700-1500", label: "₹700 – ₹1,500" },
            { value: "above-1500", label: "Above ₹1,500" },
          ]}
          resultCount={filteredProducts.length}
          sortByValue={sortBy}
          onSortByChange={setSortBy}
        />

        {/* Responsive Product Grid (4-col desktop, 3-col tablet, 2-col mobile) */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 p-10 text-center space-y-2">
            <Lightbulb className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              No fixtures match those active filters in {activeSubcatMeta.name}.
            </p>
            <button
              type="button"
              onClick={() => {
                setMountFilter("all");
                setSurgeOnly(false);
                setCct3in1Only(false);
                setBrandFilter("all");
                setSpecFilter("all");
                setPriceFilter("all");
              }}
              className="px-4 py-1.5 rounded-xl bg-[#12357A] text-white text-xs font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((product) => {
              const selectedCct = getCct(product);
              const cctMeta = KELVIN_META[selectedCct];
              const qtyInCart = getQtyInCart(product.id);
              const topRightBadge = product.is3in1Cct ? (
                <span className="px-2 py-0.5 rounded-md text-[9.5px] font-black bg-amber-500 text-slate-950 shadow-sm">
                  3-IN-1 CCT
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md text-[9.5px] font-black bg-emerald-600 text-white shadow-sm inline-flex items-center gap-0.5">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  {product.surgeProtectionKv}kV
                </span>
              );

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  discountPct={product.discountPct}
                  topRightBadge={topRightBadge}
                  ambientGlowCss={cctMeta.glowCss}
                  visualNode={<LuminaireSvgGraphic kind={product.luminaireVisual} cct={selectedCct} />}
                  siteWarningNote={product.inclusionsBadge}
                  brand={product.brand}
                  oemModelCode={product.oemModelCode}
                  title={product.title}
                  specLine={product.spec}
                  price={product.price}
                  mrp={product.mrp}
                  gstPercent={product.gstPercent}
                  unit={product.unit}
                  deliveryTime={product.deliveryTime}
                  vehicleType={product.vehicleType}
                  qtyInCart={qtyInCart}
                  hasVariants={true}
                  onCardClick={() => handleOpenDetail(product)}
                  onAdd={() => handleAddSingle(product)}
                  onDecrement={() => handleUpdateQty(product, qtyInCart - 1)}
                  onIncrement={() => handleUpdateQty(product, qtyInCart + 1)}
                  onOpenVariants={() => {
                    setVariantModalProduct(product);
                    setDrawerVariantIdx(0);
                    setDrawerPackMode("SINGLE");
                  }}
                  extraControls={
                    <KelvinPreviewToggle
                      supportedCcts={product.supportedCcts}
                      selectedCct={selectedCct}
                      is3in1Cct={product.is3in1Cct}
                      onSelectCct={(cct) => handleSelectCct(product.id, cct)}
                      compact
                    />
                  }
                  extraStrip={
                    <div className="mt-2 text-[10.5px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800 px-2 py-0.5 rounded-md inline-block">
                      Mistri 10-Pack: Extra {product.packOf10DiscountPct}% Off
                    </div>
                  }
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Reorder Last Pill */}
      <FloatingReorderLast onReorderLast={handleReorderLast} />

      {/* "Kitni Light Lagegi?" Room & POP Calculator Modal */}
      <RoomLightingCalculatorModal
        isOpen={calcOpen}
        onClose={() => setCalcOpen(false)}
        onAddFullKit={handleAddFullRoomKit}
      />

      {/* Variant + Kelvin Preview + Pack-of-10 Mistri Rate Drawer */}
      {variantModalProduct && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setVariantModalProduct(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-700 p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const p = variantModalProduct;
              const selectedCct = getCct(p);
              const variants = p.variants && p.variants.length > 0
                ? p.variants
                : [{ label: `${p.wattageLabel} Standard`, price: p.price, mrp: p.mrp }];
              const activeVar = variants[drawerVariantIdx] || variants[0];
              const pack10UnitTotal = Math.round(activeVar.price * 10 * (1 - p.packOf10DiscountPct / 100));
              const displayPrice = drawerPackMode === "PACK10" ? pack10UnitTotal : activeVar.price;
              const displayMrp = drawerPackMode === "PACK10" ? activeVar.mrp * 10 : activeVar.mrp;

              return (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 relative overflow-hidden"
                        style={{ boxShadow: `inset 0 0 24px ${KELVIN_META[selectedCct].dotHex}55` }}
                      >
                        <LuminaireSvgGraphic kind={p.luminaireVisual} cct={selectedCct} compact />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-black uppercase text-[#12357A] dark:text-amber-300">
                          {p.brand} · {p.oemModelCode}
                        </span>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white line-clamp-2">
                          {p.title}
                        </h3>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVariantModalProduct(null)}
                      className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Kelvin Glow Simulator Inside Drawer */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Live Kelvin Mood Preview ({KELVIN_META[selectedCct].name}):
                    </p>
                    <KelvinPreviewToggle
                      supportedCcts={p.supportedCcts}
                      selectedCct={selectedCct}
                      is3in1Cct={p.is3in1Cct}
                      onSelectCct={(cct) => handleSelectCct(p.id, cct)}
                    />
                  </div>

                  {/* Wattage / Cutout Selector */}
                  {variants.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                        Select Wattage / Cutout Option
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {variants.map((v, idx) => (
                          <button
                            key={v.label}
                            type="button"
                            onClick={() => setDrawerVariantIdx(idx)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                              drawerVariantIdx === idx
                                ? "bg-[#12357A] text-white border-[#12357A]"
                                : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            {v.label} — ₹{v.price.toLocaleString("en-IN")}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Retail vs Mistri Pack-of-10 Toggle */}
                  <div>
                    <p className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                      Purchase Mode (Retail vs Contractor Pack)
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDrawerPackMode("SINGLE")}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          drawerPackMode === "SINGLE"
                            ? "bg-[#12357A] text-white border-[#12357A]"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <p className="text-xs font-black">Single Piece</p>
                        <p className={`text-[10.5px] ${drawerPackMode === "SINGLE" ? "text-blue-100" : "text-slate-400"}`}>
                          ₹{activeVar.price.toLocaleString("en-IN")} / {p.unit}
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDrawerPackMode("PACK10")}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          drawerPackMode === "PACK10"
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-emerald-50/70 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-black">Pack of 10 (Mistri)</p>
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-400 text-slate-950">
                            -{p.packOf10DiscountPct}%
                          </span>
                        </div>
                        <p className={`text-[10.5px] ${drawerPackMode === "PACK10" ? "text-emerald-100" : "text-emerald-700 dark:text-emerald-300"}`}>
                          Latouche Rd Rate: ₹{pack10UnitTotal.toLocaleString("en-IN")}
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                          ₹{displayPrice.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          ₹{displayMrp.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Incl. 18% GST ({drawerPackMode === "PACK10" ? "Pack of 10" : p.unit})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setVariantModalProduct(null);
                          handleOpenDetail(p);
                        }}
                        className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        Full Specs
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleAddSingle(
                            p,
                            displayPrice,
                            drawerPackMode === "PACK10"
                              ? `${activeVar.label} • Mistri Pack of 10`
                              : activeVar.label,
                            1,
                            drawerPackMode === "PACK10" ? "Pack of 10" : p.unit,
                          );
                          setVariantModalProduct(null);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-[#12357A] hover:bg-[#0B1B3D] text-white text-xs font-black shadow-md cursor-pointer"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {quickDetailProduct && (
        <ProductDetailModal
          isOpen={true}
          product={quickDetailProduct}
          onClose={() => setQuickDetailProduct(null)}
          onAddToCart={() => {
            const lp = liveProducts.find((item) => item.id === quickDetailProduct.id);
            if (lp) handleAddSingle(lp);
          }}
        />
      )}
    </div>
  );
}

export default LightingCollectionStorefront;
