import React, { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Wrench,
  ShieldCheck,
  Tractor,
  Sparkles,
  Plus,
  X,
  AlertTriangle,
  Package,
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
  TOOLS_BRANDS,
  TOOLS_HARDWARE_PRODUCTS,
  TOOLS_SUBCATEGORIES,
  TOOLS_USE_FILTERS,
  type ToolHardwareProduct,
  type ToolSubCategoryId,
} from "@/data/toolsHardwareCatalog";
import {
  CategoryHeader,
  DualRowFilterBar,
  FloatingReorderLast,
  HorizontalSubCategoryBar,
  ProductCard,
  SiteCompanionBanner,
} from "@/components/storefront/UnifiedStorefrontPrimitives";
import { ToolSvgGraphic } from "@/components/storefront/CategoryProductGraphics";
import {
  BuyOrRentBadge,
  type ToolAcquireMode,
} from "@/components/tools/BuyOrRentBadge";
import { TradeMistriKitModal } from "@/components/tools/TradeMistriKitModal";
import { SiteRefillDrawer } from "@/components/tools/SiteRefillDrawer";

export const TOOL_SKUS = TOOLS_HARDWARE_PRODUCTS;

export interface PowerToolsSafetyStorefrontProps {
  defaultSubcat?: string;
  onBack?: () => void;
  onOpenDetail?: (product: Product) => void;
}

const LAST_TOOLS_ORDER_KEY = "conon_last_tools_order_v1";

function resolveInitialToolSubcat(defaultSubcat?: string): ToolSubCategoryId {
  const valid = new Set(TOOLS_SUBCATEGORIES.map((s) => s.id));
  if (defaultSubcat && valid.has(defaultSubcat as ToolSubCategoryId)) {
    return defaultSubcat as ToolSubCategoryId;
  }
  if (typeof window !== "undefined") {
    const path = window.location.pathname.toLowerCase();
    const params = new URLSearchParams(window.location.search);
    const subParam = params.get("subcat")?.toLowerCase() || "";
    const target = `${path} ${subParam}`;
    for (const sub of TOOLS_SUBCATEGORIES) {
      if (target.includes(sub.id)) return sub.id;
    }
    if (target.includes("grinder") || target.includes("cutter") || target.includes("marble")) return "grinders-cutters";
    if (target.includes("rotary") || target.includes("drill") || target.includes("hammer")) return "rotary-drills";
    if (target.includes("blade") || target.includes("disc") || target.includes("bit")) return "blades-discs-bits";
    if (target.includes("hand") || target.includes("masonry") || target.includes("spanner")) return "hand-masonry-tools";
    if (target.includes("measur") || target.includes("level") || target.includes("laser")) return "measuring-levelling";
    if (target.includes("fastener") || target.includes("screw") || target.includes("anchor")) return "fasteners-anchors";
    if (target.includes("safety") || target.includes("helmet")) return "safety-utility";
    if (target.includes("ladder") || target.includes("tape") || target.includes("tasla")) return "ladders-tapes-utility";
  }
  return "grinders-cutters";
}

export function PowerToolsSafetyStorefront({
  defaultSubcat,
  onBack,
  onOpenDetail,
}: PowerToolsSafetyStorefrontProps) {
  const qc = useQueryClient();
  const { data: cart } = useGetCart();
  const invalidateCart = () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() });
  const addToCart = useAddToCart({ mutation: { onSuccess: invalidateCart } });
  const updateCartItem = useUpdateCartItem({ mutation: { onSuccess: invalidateCart } });
  const removeFromCart = useRemoveFromCart({ mutation: { onSuccess: invalidateCart } });
  const mergeLiveProducts = useLiveProductMerger();

  const [activeSubcat, setActiveSubcat] = useState<ToolSubCategoryId>(() =>
    resolveInitialToolSubcat(defaultSubcat),
  );
  const [useFilter, setUseFilter] = useState<string>("all");
  const [serialWarrantyOnly, setSerialWarrantyOnly] = useState<boolean>(false);
  const [rentAvailableOnly, setRentAvailableOnly] = useState<boolean>(false);
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [sizeFilter, setSizeFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("relevance");

  // Buy vs Rent Mode per product card + Pack Tier selection per consumable/fastener
  const [acquireModeById, setAcquireModeById] = useState<Record<string, ToolAcquireMode>>({});
  const [packIdxById, setPackIdxById] = useState<Record<string, number>>({});

  // Magical Modals & Companion Upsell State
  const [mistriKitOpen, setMistriKitOpen] = useState<boolean>(false);
  const [siteRefillOpen, setSiteRefillOpen] = useState<boolean>(false);
  const [companionParent, setCompanionParent] = useState<ToolHardwareProduct | null>(null);
  const [variantProduct, setVariantProduct] = useState<ToolHardwareProduct | null>(null);
  const [quickDetailProduct, setQuickDetailProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (defaultSubcat) {
      setActiveSubcat(resolveInitialToolSubcat(defaultSubcat));
    }
  }, [defaultSubcat]);

  const liveProducts = useMemo(
    () => mergeLiveProducts(TOOLS_HARDWARE_PRODUCTS as unknown as any[]) as ToolHardwareProduct[],
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

  const getAcquireMode = (product: ToolHardwareProduct): ToolAcquireMode =>
    acquireModeById[product.id] || "BUY";

  const getSelectedPack = (product: ToolHardwareProduct) => {
    if (!product.bulkPack || product.bulkPack.length === 0) return null;
    const idx = packIdxById[product.id] ?? 0;
    return product.bulkPack[idx] || product.bulkPack[0];
  };

  const getEffectiveOffer = (product: ToolHardwareProduct) => {
    const mode = getAcquireMode(product);
    if (mode === "RENT" && product.rentPricePerDay) {
      return {
        price: product.rentPricePerDay,
        mrp: Math.round(product.rentPricePerDay * 1.25),
        unit: "Day Rental",
        labelSuffix: "Daily Rent Booking (Lucknow)",
        isRent: true,
      };
    }
    const pack = getSelectedPack(product);
    if (pack) {
      return {
        price: pack.price,
        mrp: pack.mrp,
        unit: pack.unit,
        labelSuffix: pack.label,
        isRent: false,
      };
    }
    return {
      price: product.price,
      mrp: product.mrp,
      unit: product.unit,
      labelSuffix: "",
      isRent: false,
    };
  };

  const getQtyInCart = (productId: string): number =>
    cartItemsList
      .filter((it) => it.materialId === productId || it.materialId.startsWith(`${productId}::`))
      .reduce((s, it) => s + it.quantity, 0);

  const findPrimaryCartItem = (productId: string) =>
    cartItemsList.find((it) => it.materialId === productId || it.materialId.startsWith(`${productId}::`));

  const handleAddTool = (
    product: ToolHardwareProduct,
    overrideOffer?: { price: number; unit: string; suffix?: string },
    qty = 1,
  ) => {
    const offer = overrideOffer || getEffectiveOffer(product);
    const suffix = "labelSuffix" in offer ? offer.labelSuffix : offer.suffix;
    const itemName = suffix ? `${product.title} — ${suffix}` : product.title;

    try {
      localStorage.setItem(
        LAST_TOOLS_ORDER_KEY,
        JSON.stringify([
          {
            materialId: product.id,
            name: itemName,
            price: offer.price,
            unit: offer.unit,
            brand: product.brand,
            quantity: qty,
          },
        ]),
      );
    } catch {}

    addToCart.mutate(
      {
        data: {
          materialId: product.id,
          name: itemName,
          category: "Power Tools & Hardware",
          price: offer.price,
          unit: offer.unit,
          vendor: product.brand,
          quantity: qty,
        },
      },
      {
        onSuccess: () => {
          invalidateCart();
          if (product.compatibleConsumableIds && product.compatibleConsumableIds.length > 0) {
            setCompanionParent(product);
            toast.success(`Added ${itemName}`, {
              description: `Matched blades/bits suggested below (${product.boreOrChuck}).`,
            });
          } else {
            toast.success(`Added ${itemName} to Site Cart`);
          }
        },
        onError: () => toast.error("Failed to add tool to cart"),
      },
    );
  };

  const handleUpdateQty = (product: ToolHardwareProduct, nextQty: number) => {
    const match = findPrimaryCartItem(product.id);
    if (!match) return;
    if (nextQty <= 0) {
      removeFromCart.mutate({ itemId: match.id }, { onSuccess: invalidateCart });
    } else {
      updateCartItem.mutate({ itemId: match.id, data: { quantity: nextQty } }, { onSuccess: invalidateCart });
    }
  };

  const handleAddTradeKit = (items: ToolHardwareProduct[], tradeLabel: string, discountPct: number) => {
    for (const p of items) {
      const discounted = Math.round(p.price * (1 - discountPct / 100));
      addToCart.mutate({
        data: {
          materialId: p.id,
          name: `${p.title} [${tradeLabel} -${discountPct}%]`,
          category: "Power Tools & Hardware",
          price: discounted,
          unit: p.unit,
          vendor: p.brand,
          quantity: 1,
        },
      });
    }
    try {
      localStorage.setItem(
        LAST_TOOLS_ORDER_KEY,
        JSON.stringify(
          items.map((p) => ({
            materialId: p.id,
            name: `${p.title} [${tradeLabel}]`,
            price: Math.round(p.price * (1 - discountPct / 100)),
            unit: p.unit,
            brand: p.brand,
            quantity: 1,
          })),
        ),
      );
    } catch {}
    toast.success(`${tradeLabel} (${items.length} tools) added at extra ${discountPct}% off!`);
  };

  const handleDispatchRefill = (entries: Array<{ product: ToolHardwareProduct; qty: number }>) => {
    for (const entry of entries) {
      addToCart.mutate({
        data: {
          materialId: entry.product.id,
          name: `${entry.product.title} [60-Min Refill]`,
          category: "Power Tools & Hardware",
          price: entry.product.price,
          unit: entry.product.unit,
          vendor: entry.product.brand,
          quantity: entry.qty,
        },
      });
    }
    try {
      localStorage.setItem(
        LAST_TOOLS_ORDER_KEY,
        JSON.stringify(
          entries.map((e) => ({
            materialId: e.product.id,
            name: `${e.product.title} [60-Min Refill]`,
            price: e.product.price,
            unit: e.product.unit,
            brand: e.product.brand,
            quantity: e.qty,
          })),
        ),
      );
    } catch {}
    toast.success(`Dispatched ${entries.length} emergency consumable item(s) to Cart!`);
  };

  const handleReorderLast = () => {
    try {
      const raw = localStorage.getItem(LAST_TOOLS_ORDER_KEY);
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
                category: "Power Tools & Hardware",
                price: it.price,
                unit: it.unit,
                vendor: it.brand,
                quantity: it.quantity || 1,
              },
            });
          }
          toast.success(`Reordered ${items.length} tool/consumable item(s)`);
          return;
        }
      }
    } catch {}
    const starter = liveProducts.find((p) => p.id === "norton-4inch-metal-cutting-wheel") || liveProducts[0];
    if (starter) handleAddTool(starter);
  };

  const companionSuggestions = useMemo(() => {
    if (!companionParent?.compatibleConsumableIds) return [];
    return companionParent.compatibleConsumableIds
      .map((id) => liveProducts.find((p) => p.id === id))
      .filter((p): p is ToolHardwareProduct => Boolean(p));
  }, [companionParent, liveProducts]);

  const filteredProducts = useMemo(() => {
    let list = liveProducts.filter((p) => p.subcategory === activeSubcat);
    if (useFilter !== "all") {
      list = list.filter((p) => p.useTags.includes(useFilter as any));
    }
    if (serialWarrantyOnly) list = list.filter((p) => p.hasSerialWarranty);
    if (rentAvailableOnly) list = list.filter((p) => Boolean(p.rentPricePerDay));
    if (brandFilter !== "all") list = list.filter((p) => p.brand.toLowerCase() === brandFilter.toLowerCase());
    if (sizeFilter !== "all") list = list.filter((p) => p.sizeClass === sizeFilter);

    if (priceFilter !== "all") {
      if (priceFilter === "under-400") list = list.filter((p) => p.price < 400);
      else if (priceFilter === "400-1500") list = list.filter((p) => p.price >= 400 && p.price <= 1500);
      else if (priceFilter === "1500-4000") list = list.filter((p) => p.price > 1500 && p.price <= 4000);
      else if (priceFilter === "above-4000") list = list.filter((p) => p.price > 4000);
    }

    const sorted = [...list];
    if (sortBy === "price-low") sorted.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-high") sorted.sort((a, b) => b.price - a.price);
    else if (sortBy === "discount") sorted.sort((a, b) => b.discountPct - a.discountPct);
    return sorted;
  }, [
    liveProducts,
    activeSubcat,
    useFilter,
    serialWarrantyOnly,
    rentAvailableOnly,
    brandFilter,
    sizeFilter,
    priceFilter,
    sortBy,
  ]);

  const activeSubcatMeta =
    TOOLS_SUBCATEGORIES.find((s) => s.id === activeSubcat) || TOOLS_SUBCATEGORIES[0];

  const toGenericProduct = (p: ToolHardwareProduct): Product => ({
    id: p.id,
    name: p.title,
    title: p.title,
    brand: p.brand,
    unit: p.unit,
    price: p.price,
    mrp: p.mrp,
    image: p.image,
    materialTag: "Power Tools",
    rating: 4.9,
    reviews: 112,
    deliveryEta: "60 Mins",
    specs: [
      { label: "Model", value: p.model },
      { label: "Power / Size", value: p.powerOrSize },
      { label: "Bore / Chuck", value: p.boreOrChuck },
      { label: "Warranty", value: p.warranty },
    ],
  });

  const handleOpenDetail = (p: ToolHardwareProduct) => {
    const gp = toGenericProduct(p);
    if (onOpenDetail) onOpenDetail(gp);
    else setQuickDetailProduct(gp);
  };

  return (
    <div className="w-full bg-[#F4F6F8] dark:bg-slate-950 min-h-screen pb-28">
      <CategoryHeader
        title="Tools, Power Tools & General Hardware"
        breadcrumbCategory="Tools & Hardware"
        activeSubCategoryName={activeSubcatMeta.name}
        hubSubtitle="Latouche Road & Aminabad Genuine Tool Hubs"
        icon={<Wrench className="w-5 h-5" />}
        onBack={onBack}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4">
        <SiteCompanionBanner
          icon={<Wrench className="w-5 h-5" />}
          title="Essential Lucknow Site Tools & Blade-Match Companion"
          description="Never stall site work over a worn blade or burnt carbon brush. Get serial-verified Bosch/Taparia tools, exact-bore diamond discs & fasteners in 60 mins."
          goldCtaLabel="🧰 Trade Mistri Kit Builder →"
          onGoldCtaClick={() => setMistriKitOpen(true)}
          blueCtaLabel="⚡ 60-Min Blade & Bit Refill"
          onBlueCtaClick={() => setSiteRefillOpen(true)}
        />

        {/* Machine-to-Blade / Bit Smart Companion Auto-Upsell Bar */}
        {companionParent && companionSuggestions.length > 0 && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 shadow-sm space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-amber-950 dark:text-amber-200">
                    Exact-Bore Companion Match for {companionParent.brand} {companionParent.model} ({companionParent.boreOrChuck})
                  </p>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300">
                    Machines ship without extra discs/bits. Add exact compatible consumables in 1 click:
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCompanionParent(null)}
                aria-label="Close companion suggestions"
                className="p-1 rounded-lg text-amber-700 dark:text-amber-300 hover:bg-amber-200/40 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {companionSuggestions.map((comp) => (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() => handleAddTool(comp)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#12357A] hover:bg-[#0B1B3D] text-white text-[11px] font-bold transition cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-amber-300" />
                  <span>
                    {comp.brand} {comp.model} — ₹{comp.price.toLocaleString("en-IN")}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Horizontal Sub-Category Pill Cards (NO Civil Left Sidebar) */}
        <HorizontalSubCategoryBar
          activeId={activeSubcat}
          onSelect={(id) => {
            setActiveSubcat(id as ToolSubCategoryId);
            if (typeof window !== "undefined") {
              window.history.pushState({}, "", `/collections/${id}`);
            }
          }}
          items={TOOLS_SUBCATEGORIES.map((s) => ({
            id: s.id,
            name: s.name,
            count: s.count,
            thumbnail: <ToolSvgGraphic kind={s.visualKind} compact />,
          }))}
        />

        {/* Dual-Row Filter Bar */}
        <DualRowFilterBar
          row1Label="Use:"
          quickFilters={TOOLS_USE_FILTERS}
          activeQuickFilter={useFilter}
          onQuickFilterChange={setUseFilter}
          trustHighlights={[
            {
              id: "warranty",
              label: "🛡️ Genuine Serial & Brand Warranty",
              active: serialWarrantyOnly,
              tone: "emerald",
              onToggle: () => setSerialWarrantyOnly((v) => !v),
            },
            {
              id: "rent",
              label: "🔄 Buy or Daily Rent Available",
              active: rentAvailableOnly,
              tone: "amber",
              onToggle: () => setRentAvailableOnly((v) => !v),
            },
          ]}
          brandFilterValue={brandFilter}
          onBrandFilterChange={setBrandFilter}
          brandOptions={[
            { value: "all", label: "All Brands (Bosch, Taparia, Stanley, Dongcheng)" },
            ...TOOLS_BRANDS.map((b) => ({ value: b, label: b })),
          ]}
          specFilterValue={sizeFilter}
          onSpecFilterChange={setSizeFilter}
          specOptions={[
            { value: "all", label: 'Power / Size (4", 5", SDS-Plus, Hand)' },
            { value: "4-INCH", label: '4" / 100–110mm Power Tools & Discs' },
            { value: "SDS_PLUS", label: "SDS-Plus & Heavy Hammers" },
            { value: "HAND", label: "Hand Tools, Fasteners & Site Utility" },
          ]}
          priceFilterValue={priceFilter}
          onPriceFilterChange={setPriceFilter}
          priceOptions={[
            { value: "all", label: "Price: All Ranges" },
            { value: "under-400", label: "Under ₹400" },
            { value: "400-1500", label: "₹400 – ₹1,500" },
            { value: "1500-4000", label: "₹1,500 – ₹4,000" },
            { value: "above-4000", label: "Above ₹4,000" },
          ]}
          resultCount={filteredProducts.length}
          sortByValue={sortBy}
          onSortByChange={setSortBy}
        />

        {/* Responsive Product Grid (4-col desktop, 3-col tablet, 2-col mobile, pb-24 prevents overlap) */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 p-10 text-center space-y-2 mb-24">
            <Wrench className="w-8 h-8 text-[#12357A] dark:text-amber-300 mx-auto" />
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              No tools or hardware match those active filters in {activeSubcatMeta.name}.
            </p>
            <button
              type="button"
              onClick={() => {
                setUseFilter("all");
                setSerialWarrantyOnly(false);
                setRentAvailableOnly(false);
                setBrandFilter("all");
                setSizeFilter("all");
                setPriceFilter("all");
              }}
              className="px-4 py-1.5 rounded-xl bg-[#12357A] text-white text-xs font-bold cursor-pointer"
            >
              Reset Tool Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pb-24">
            {filteredProducts.map((product) => {
              const qtyInCart = getQtyInCart(product.id);
              const offer = getEffectiveOffer(product);
              const mode = getAcquireMode(product);
              const selectedPackIdx = packIdxById[product.id] ?? 0;

              const topRightBadge = product.rentPricePerDay ? (
                <span className="px-2 py-0.5 rounded-md text-[9.5px] font-black bg-amber-400 text-slate-950 shadow-sm inline-flex items-center gap-0.5">
                  <Tractor className="w-2.5 h-2.5" />
                  RENT ₹{product.rentPricePerDay}/D
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md text-[9.5px] font-black bg-emerald-600 text-white shadow-sm inline-flex items-center gap-0.5">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  GENUINE
                </span>
              );

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  discountPct={product.discountPct}
                  topRightBadge={topRightBadge}
                  visualNode={<ToolSvgGraphic kind={product.toolVisual} />}
                  siteWarningNote={product.siteBadge}
                  brand={product.brand}
                  oemModelCode={product.model}
                  title={product.title}
                  specLine={`${product.powerOrSize} · ${product.boreOrChuck} · ${product.spec}`}
                  price={offer.price}
                  mrp={offer.mrp}
                  gstPercent={product.gstPercent}
                  unit={offer.unit}
                  deliveryTime={product.deliveryTime}
                  vehicleType={product.vehicleType}
                  qtyInCart={qtyInCart}
                  hasVariants={Boolean(product.bulkPack?.length || product.rentPricePerDay)}
                  onCardClick={() => handleOpenDetail(product)}
                  onAdd={() => handleAddTool(product)}
                  onDecrement={() => handleUpdateQty(product, qtyInCart - 1)}
                  onIncrement={() => handleUpdateQty(product, qtyInCart + 1)}
                  onOpenVariants={() => setVariantProduct(product)}
                  extraControls={
                    <>
                      {/* Buy New vs Rent Today inline toggle on heavy power tools */}
                      <BuyOrRentBadge
                        buyPrice={product.price}
                        rentPricePerDay={product.rentPricePerDay}
                        mode={mode}
                        onChangeMode={(next) =>
                          setAcquireModeById((prev) => ({ ...prev, [product.id]: next }))
                        }
                        compact
                      />

                      {/* Inline Pack Size & Mistri Bulk Switcher on consumables & fasteners */}
                      {product.bulkPack && product.bulkPack.length > 0 && (
                        <div
                          className="flex flex-wrap gap-1 mt-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {product.bulkPack.map((tier, idx) => (
                            <button
                              key={tier.label}
                              type="button"
                              onClick={() =>
                                setPackIdxById((prev) => ({ ...prev, [product.id]: idx }))
                              }
                              className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold transition cursor-pointer ${
                                selectedPackIdx === idx
                                  ? "bg-[#12357A] text-white border-[#12357A]"
                                  : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                              }`}
                            >
                              {tier.shortLabel}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  }
                  extraStrip={
                    mode === "RENT" && product.rentPricePerDay ? (
                      <Link
                        href="/rentals"
                        onClick={(e) => e.stopPropagation()}
                        className="mt-2 text-[10.5px] font-black text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md inline-flex items-center gap-1"
                      >
                        <Tractor className="w-3 h-3" />
                        <span>Machines on Rent Fleet →</span>
                      </Link>
                    ) : product.bulkPack && product.bulkPack.length > 1 ? (
                      <div className="mt-2 text-[10.5px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800 px-2 py-0.5 rounded-md inline-block">
                        Latouche Bulk Packs: Extra 10–15% Off
                      </div>
                    ) : null
                  }
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Reorder Last (Clear bottom clearance above mobile nav) */}
      <FloatingReorderLast onReorderLast={handleReorderLast} />

      {/* 1-Click Trade Mistri Kit Builder Modal */}
      <TradeMistriKitModal
        isOpen={mistriKitOpen}
        onClose={() => setMistriKitOpen(false)}
        onAddTradeKit={handleAddTradeKit}
      />

      {/* 60-Min Emergency Consumables Quick-Refill Sheet */}
      <SiteRefillDrawer
        isOpen={siteRefillOpen}
        onClose={() => setSiteRefillOpen(false)}
        onDispatchRefill={handleDispatchRefill}
      />

      {/* Variant, Bulk Pack & Rent Drawer */}
      {variantProduct && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setVariantProduct(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-700 p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const p = variantProduct;
              const offer = getEffectiveOffer(p);
              const mode = getAcquireMode(p);
              const selectedPackIdx = packIdxById[p.id] ?? 0;

              return (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <ToolSvgGraphic kind={p.toolVisual} compact />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-black uppercase text-[#12357A] dark:text-amber-300">
                          {p.brand} · {p.model} · {p.warranty}
                        </span>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white line-clamp-2">
                          {p.title}
                        </h3>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVariantProduct(null)}
                      className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {p.rentPricePerDay && (
                    <div>
                      <p className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                        Choose Buy New or Daily Rent
                      </p>
                      <BuyOrRentBadge
                        buyPrice={p.price}
                        rentPricePerDay={p.rentPricePerDay}
                        mode={mode}
                        onChangeMode={(next) =>
                          setAcquireModeById((prev) => ({ ...prev, [p.id]: next }))
                        }
                      />
                    </div>
                  )}

                  {p.bulkPack && p.bulkPack.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                        Pack Size &amp; Mistri Bulk Switcher
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {p.bulkPack.map((tier, idx) => (
                          <button
                            key={tier.label}
                            type="button"
                            onClick={() => setPackIdxById((prev) => ({ ...prev, [p.id]: idx }))}
                            className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                              selectedPackIdx === idx
                                ? "bg-[#12357A] text-white border-[#12357A]"
                                : "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-black">{tier.label}</p>
                              {tier.discountBadge && (
                                <span className="text-[9px] font-black px-1 rounded bg-amber-400 text-slate-950">
                                  {tier.discountBadge}
                                </span>
                              )}
                            </div>
                            <p className={`text-[11px] font-bold mt-0.5 ${selectedPackIdx === idx ? "text-blue-100" : "text-slate-500"}`}>
                              ₹{tier.price.toLocaleString("en-IN")} ({tier.unit})
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-xl p-3 space-y-1">
                    <p>
                      <strong>Spec:</strong> {p.powerOrSize} • {p.boreOrChuck}
                    </p>
                    <p>{p.spec}</p>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                          ₹{offer.price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          ₹{offer.mrp.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Incl. {p.gstPercent}% GST ({offer.unit})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setVariantProduct(null);
                          handleOpenDetail(p);
                        }}
                        className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        Full Specs
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleAddTool(p);
                          setVariantProduct(null);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-[#12357A] hover:bg-[#0B1B3D] text-white text-xs font-black shadow-md cursor-pointer"
                      >
                        {mode === "RENT" ? "Book Daily Rent" : "Add to Cart"}
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
            const tp = liveProducts.find((item) => item.id === quickDetailProduct.id);
            if (tp) handleAddTool(tp);
          }}
        />
      )}
    </div>
  );
}

export default PowerToolsSafetyStorefront;
