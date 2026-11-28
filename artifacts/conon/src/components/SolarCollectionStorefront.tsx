import React, { useEffect, useMemo, useState } from "react";
import {
  Sun,
  ShieldCheck,
  Zap,
  AlertTriangle,
  ArrowRightLeft,
  X,
  CheckCircle2,
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
  SOLAR_BRANDS,
  SOLAR_PRODUCTS,
  SOLAR_SUBCATEGORIES,
  SOLAR_SYSTEM_FILTERS,
  type SolarProduct,
  type SolarSubCategoryId,
} from "@/data/solarCatalog";
import {
  CategoryHeader,
  DualRowFilterBar,
  FloatingReorderLast,
  HorizontalSubCategoryBar,
  ProductCard,
  SiteCompanionBanner,
} from "@/components/storefront/UnifiedStorefrontPrimitives";
import { SolarSvgGraphic } from "@/components/storefront/CategoryProductGraphics";
import { SolarSubsidyModal } from "@/components/solar/SolarSubsidyModal";
import { SolarBosRescueModal } from "@/components/solar/SolarBosRescueModal";

export { SOLAR_PRODUCTS };

export interface SolarCollectionStorefrontProps {
  defaultSubcat?: string;
  onBack?: () => void;
  onOpenDetail?: (product: Product) => void;
}

const LAST_SOLAR_ORDER_KEY = "conon_last_solar_order_v1";

function resolveInitialSolarSubcat(defaultSubcat?: string): SolarSubCategoryId {
  const valid = new Set(SOLAR_SUBCATEGORIES.map((s) => s.id));
  if (defaultSubcat && valid.has(defaultSubcat as SolarSubCategoryId)) {
    return defaultSubcat as SolarSubCategoryId;
  }
  if (typeof window !== "undefined") {
    const path = window.location.pathname.toLowerCase();
    const params = new URLSearchParams(window.location.search);
    const subParam = params.get("subcat")?.toLowerCase() || "";
    const target = `${path} ${subParam}`;
    for (const sub of SOLAR_SUBCATEGORIES) {
      if (target.includes(sub.id)) return sub.id;
    }
    if (target.includes("rooftop-solar-kits") || target.includes("kits")) return "rooftop-solar-kits";
    if (target.includes("inverter")) return "solar-inverters";
    if (target.includes("batter")) return "solar-batteries";
    if (target.includes("acdb") || target.includes("dcdb")) return "solar-acdb-dcdb";
    if (target.includes("cable") || target.includes("mc4") || target.includes("earthing")) return "solar-cables-earthing";
    if (target.includes("structure") || target.includes("hdgi")) return "solar-structures-lights";
  }
  return "solar-panels";
}

export function SolarCollectionStorefront({
  defaultSubcat,
  onBack,
  onOpenDetail,
}: SolarCollectionStorefrontProps) {
  const qc = useQueryClient();
  const { data: cart } = useGetCart();
  const invalidateCart = () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() });
  const addToCart = useAddToCart({ mutation: { onSuccess: invalidateCart } });
  const updateCartItem = useUpdateCartItem({ mutation: { onSuccess: invalidateCart } });
  const removeFromCart = useRemoveFromCart({ mutation: { onSuccess: invalidateCart } });
  const mergeLiveProducts = useLiveProductMerger();

  const [activeSubcat, setActiveSubcat] = useState<SolarSubCategoryId>(() =>
    resolveInitialSolarSubcat(defaultSubcat),
  );
  const [systemFilter, setSystemFilter] = useState<string>("all");
  const [dcrOnly, setDcrOnly] = useState<boolean>(false);
  const [topconOnly, setTopconOnly] = useState<boolean>(false);
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [capacityFilter, setCapacityFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("relevance");

  const [subsidyCalcOpen, setSubsidyCalcOpen] = useState<boolean>(false);
  const [subsidyInitBill, setSubsidyInitBill] = useState<number>(3500);
  const [bosRescueOpen, setBosRescueOpen] = useState<boolean>(false);
  const [dcrBannerDismissed, setDcrBannerDismissed] = useState<boolean>(false);

  // Variant + Dual-Mode Checkout Drawer
  const [variantProduct, setVariantProduct] = useState<SolarProduct | null>(null);
  const [drawerVariantIdx, setDrawerVariantIdx] = useState<number>(0);
  const [drawerCheckoutMode, setDrawerCheckoutMode] = useState<"MATERIALS_ONLY" | "TURNKEY_INSTALLED">("MATERIALS_ONLY");
  const [quickDetailProduct, setQuickDetailProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (defaultSubcat) {
      setActiveSubcat(resolveInitialSolarSubcat(defaultSubcat));
    }
  }, [defaultSubcat]);

  const liveProducts = useMemo(
    () => mergeLiveProducts(SOLAR_PRODUCTS as unknown as any[]) as SolarProduct[],
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

  // DCR vs Non-DCR Subsidy Guard
  const nonDcrCartItem = useMemo(() => {
    for (const item of cartItemsList) {
      const matched = liveProducts.find((p) => p.id === item.materialId && !p.isDcr);
      if (matched) return { cartItem: item, solarProduct: matched };
    }
    return null;
  }, [cartItemsList, liveProducts]);

  const getQtyInCart = (productId: string): number =>
    cartItemsList
      .filter((it) => it.materialId === productId || it.materialId.startsWith(`${productId}::`))
      .reduce((s, it) => s + it.quantity, 0);

  const findPrimaryCartItem = (productId: string) =>
    cartItemsList.find((it) => it.materialId === productId || it.materialId.startsWith(`${productId}::`));

  const handleAddSolar = (
    product: SolarProduct,
    overridePrice?: number,
    overrideLabel?: string,
    overrideQty = 1,
    overrideUnit?: string,
  ) => {
    const finalName = overrideLabel ? `${product.title} — ${overrideLabel}` : product.title;
    const unitPrice = overridePrice ?? product.price;

    try {
      localStorage.setItem(
        LAST_SOLAR_ORDER_KEY,
        JSON.stringify([{ materialId: product.id, name: finalName, price: unitPrice, unit: overrideUnit || product.unit, brand: product.brand, quantity: overrideQty }]),
      );
    } catch {}

    addToCart.mutate(
      {
        data: {
          materialId: product.id,
          name: finalName,
          category: "Solar & Rooftop Power",
          price: unitPrice,
          unit: overrideUnit || product.unit,
          vendor: product.brand,
          quantity: overrideQty,
        },
      },
      {
        onSuccess: () => {
          invalidateCart();
          if (!product.isDcr) {
            setDcrBannerDismissed(false);
            toast.warning(`Added ${finalName}`, {
              description: "Non-DCR modules are ineligible for PM Surya Ghar / UPNEDA subsidy.",
            });
          } else {
            toast.success(`Added ${finalName} to Site Cart`);
          }
        },
        onError: () => toast.error("Failed to add Solar item to cart"),
      },
    );
  };

  const handleUpdateQty = (product: SolarProduct, nextQty: number) => {
    const match = findPrimaryCartItem(product.id);
    if (!match) return;
    if (nextQty <= 0) {
      removeFromCart.mutate({ itemId: match.id }, { onSuccess: invalidateCart });
    } else {
      updateCartItem.mutate({ itemId: match.id, data: { quantity: nextQty } }, { onSuccess: invalidateCart });
    }
  };

  const handleSwapNonDcrToDcr = () => {
    if (!nonDcrCartItem) return;
    const eqId = nonDcrCartItem.solarProduct.dcrEquivalentId || "waaree-560wp-topcon-dcr";
    const dcrProduct = liveProducts.find((p) => p.id === eqId) || liveProducts[0];
    const qty = nonDcrCartItem.cartItem.quantity || 1;
    removeFromCart.mutate(
      { itemId: nonDcrCartItem.cartItem.id },
      {
        onSuccess: () => {
          handleAddSolar(dcrProduct, dcrProduct.price, "DCR Subsidy Swapped", qty);
          toast.success(`Swapped to ${dcrProduct.title} (DCR ₹1.08L Eligible)`);
        },
      },
    );
  };

  const handleDispatchBosKit = (items: Array<{ product: SolarProduct; qty: number }>) => {
    for (const row of items) {
      addToCart.mutate({
        data: {
          materialId: row.product.id,
          name: `${row.product.title} [BOS Rescue Kit]`,
          category: "Solar & Rooftop Power",
          price: row.product.price,
          unit: row.product.unit,
          vendor: row.product.brand,
          quantity: row.qty,
        },
      });
    }
    try {
      localStorage.setItem(
        LAST_SOLAR_ORDER_KEY,
        JSON.stringify(
          items.map((r) => ({
            materialId: r.product.id,
            name: `${r.product.title} [BOS Rescue Kit]`,
            price: r.product.price,
            unit: r.product.unit,
            brand: r.product.brand,
            quantity: r.qty,
          })),
        ),
      );
    } catch {}
    toast.success(`60-Min Solar BOS Kit (${items.length} essentials) added to Cart!`);
  };

  const handleReorderLast = () => {
    try {
      const raw = localStorage.getItem(LAST_SOLAR_ORDER_KEY);
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
                category: "Solar & Rooftop Power",
                price: it.price,
                unit: it.unit,
                vendor: it.brand,
                quantity: it.quantity || 1,
              },
            });
          }
          toast.success(`Reordered ${items.length} Solar SKU(s)`);
          return;
        }
      }
    } catch {}
    const starter = liveProducts.find((p) => p.id === "adani-elan-shine-550wp-topcon-dcr") || liveProducts[0];
    if (starter) handleAddSolar(starter);
  };

  const filteredProducts = useMemo(() => {
    let list = liveProducts.filter((p) => p.subcategory === activeSubcat);
    if (systemFilter === "COMMERCIAL_PEB") {
      list = list.filter((p) => !p.isDcr || p.oemModelCode.includes("PEB") || p.capacityKw >= 10);
    } else if (systemFilter !== "all") {
      list = list.filter((p) => p.systemType === systemFilter);
    }
    if (dcrOnly) list = list.filter((p) => p.isDcr);
    if (topconOnly) list = list.filter((p) => p.isTopconBifacial);
    if (brandFilter !== "all") list = list.filter((p) => p.brand.toLowerCase() === brandFilter.toLowerCase());

    if (capacityFilter !== "all") {
      if (capacityFilter === "panel-or-bos") list = list.filter((p) => p.capacityKw < 1 || p.systemType === "BOS_PROTECTION");
      else if (capacityFilter === "1to3kw") list = list.filter((p) => p.capacityKw >= 1 && p.capacityKw <= 3);
      else if (capacityFilter === "5kw") list = list.filter((p) => p.capacityKw === 5);
      else if (capacityFilter === "10kw-plus") list = list.filter((p) => p.capacityKw >= 10);
    }

    if (priceFilter !== "all") {
      if (priceFilter === "under-5000") list = list.filter((p) => p.price < 5000);
      else if (priceFilter === "5000-25000") list = list.filter((p) => p.price >= 5000 && p.price <= 25000);
      else if (priceFilter === "25000-100000") list = list.filter((p) => p.price > 25000 && p.price <= 100000);
      else if (priceFilter === "above-100000") list = list.filter((p) => p.price > 100000);
    }

    const sorted = [...list];
    if (sortBy === "price-low") sorted.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-high") sorted.sort((a, b) => b.price - a.price);
    else if (sortBy === "discount") sorted.sort((a, b) => b.discountPct - a.discountPct);
    return sorted;
  }, [
    liveProducts,
    activeSubcat,
    systemFilter,
    dcrOnly,
    topconOnly,
    brandFilter,
    capacityFilter,
    priceFilter,
    sortBy,
  ]);

  const activeSubcatMeta =
    SOLAR_SUBCATEGORIES.find((s) => s.id === activeSubcat) || SOLAR_SUBCATEGORIES[0];

  const toGenericProduct = (p: SolarProduct): Product => ({
    id: p.id,
    name: p.title,
    title: p.title,
    brand: p.brand,
    unit: p.unit,
    price: p.price,
    mrp: p.mrp,
    image: p.image,
    materialTag: "Solar & Rooftop Power",
    rating: 4.9,
    reviews: 84,
    deliveryEta: "60 Mins",
    specs: p.spec ? [{ label: "Specs", value: p.spec }] : [],
    bulkPrice: p.bulkPrice,
    bulkSlabText: p.bulkSlabText,
  });

  const handleOpenDetail = (p: SolarProduct) => {
    const gp = toGenericProduct(p);
    if (onOpenDetail) onOpenDetail(gp);
    else setQuickDetailProduct(gp);
  };

  return (
    <div className="w-full bg-[#F4F6F8] dark:bg-slate-950 min-h-screen pb-24">
      <CategoryHeader
        title="Solar & Rooftop Power"
        breadcrumbCategory="Solar & Rooftop Power"
        activeSubCategoryName={activeSubcatMeta.name}
        hubSubtitle="Lucknow Solar Hubs • UPNEDA & ALMM Verified"
        icon={<Sun className="w-5 h-5" />}
        onBack={onBack}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4">
        <SiteCompanionBanner
          icon={<Sun className="w-5 h-5" />}
          title="UP Double-Subsidy (₹1,08,000) & 60-Min Lucknow Solar Site Companion"
          description="PM Surya Ghar (₹78k) + UPNEDA (₹30k) for MVVNL homes. Avoid site delays with ALMM DCR panels, 3-Pit Earthing, ACDB/DCDB & Monkey-Proof Conduit Kits in 60 mins."
          goldCtaLabel="☀️ Rooftop Visualizer & ₹1.08L Calculator →"
          onGoldCtaClick={() => {
            setSubsidyInitBill(3500);
            setSubsidyCalcOpen(true);
          }}
          blueCtaLabel="⚡ 60-Min BOS Rescue Kit"
          onBlueCtaClick={() => setBosRescueOpen(true)}
        />

        {/* DCR vs Non-DCR Subsidy Guard Banner */}
        {(nonDcrCartItem || dcrOnly) && !dcrBannerDismissed && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-extrabold text-amber-950 dark:text-amber-200">
                  {nonDcrCartItem
                    ? `Subsidy Guard: "${nonDcrCartItem.solarProduct.title}" is Non-DCR`
                    : "Residential Subsidy Guard Active (PM Surya Ghar + UPNEDA ₹1,08,000)"}
                </p>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  {nonDcrCartItem
                    ? "Residential PM Surya Ghar + UPNEDA ₹1.08L subsidy strictly requires ALMM DCR modules made in India. Keep Non-DCR for commercial/marriage lawn or swap cleanly."
                    : "Showing DCR-certified panels & kits eligible for ₹1,08,000 MVVNL/UPNEDA subsidy."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {nonDcrCartItem && (
                <button
                  type="button"
                  onClick={handleSwapNonDcrToDcr}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Swap to DCR Equivalent</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setDcrBannerDismissed(true)}
                aria-label="Dismiss DCR guard warning"
                className="p-1 rounded-lg text-amber-700 dark:text-amber-300 hover:bg-amber-200/40 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Horizontal Sub-Category Pill Cards (7 Categories) */}
        <HorizontalSubCategoryBar
          activeId={activeSubcat}
          onSelect={(id) => {
            setActiveSubcat(id as SolarSubCategoryId);
            if (typeof window !== "undefined") {
              window.history.pushState({}, "", `/collections/${id}`);
            }
          }}
          items={SOLAR_SUBCATEGORIES.map((s) => ({
            id: s.id,
            name: s.name,
            count: s.count,
            thumbnail: <SolarSvgGraphic kind={s.visualKind} compact />,
          }))}
        />

        {/* Dual-Row Filter Bar */}
        <DualRowFilterBar
          row1Label="System:"
          quickFilters={SOLAR_SYSTEM_FILTERS}
          activeQuickFilter={systemFilter}
          onQuickFilterChange={setSystemFilter}
          trustHighlights={[
            {
              id: "dcr",
              label: "✅ DCR — ₹1.08L Subsidy",
              active: dcrOnly,
              tone: "emerald",
              onToggle: () => {
                setDcrOnly((v) => !v);
                setDcrBannerDismissed(false);
              },
            },
            {
              id: "topcon",
              label: "⚡ N-Type TOPCon Bifacial",
              active: topconOnly,
              tone: "amber",
              onToggle: () => setTopconOnly((v) => !v),
            },
          ]}
          brandFilterValue={brandFilter}
          onBrandFilterChange={setBrandFilter}
          brandOptions={[
            { value: "all", label: "All Brands (Lucknow Distributors)" },
            ...SOLAR_BRANDS.map((b) => ({ value: b, label: b })),
          ]}
          specFilterValue={capacityFilter}
          onSpecFilterChange={setCapacityFilter}
          specOptions={[
            { value: "all", label: "All Capacities (1kW–10kW+)" },
            { value: "panel-or-bos", label: "Individual Panels (545–590W) & BOS" },
            { value: "1to3kw", label: "1 kW – 3 kW Residential" },
            { value: "5kw", label: "5 kW Villa / Hybrid" },
            { value: "10kw-plus", label: "10 kW+ Commercial / Lawn" },
          ]}
          priceFilterValue={priceFilter}
          onPriceFilterChange={setPriceFilter}
          priceOptions={[
            { value: "all", label: "Price: All Ranges" },
            { value: "under-5000", label: "Under ₹5,000" },
            { value: "5000-25000", label: "₹5,000 – ₹25,000" },
            { value: "25000-100000", label: "₹25,000 – ₹1,00,000" },
            { value: "above-100000", label: "Above ₹1,00,000" },
          ]}
          resultCount={filteredProducts.length}
          sortByValue={sortBy}
          onSortByChange={setSortBy}
        />

        {/* Responsive 4-Column Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 p-10 text-center space-y-2">
            <Sun className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              No solar hardware matches those active filters in {activeSubcatMeta.name}.
            </p>
            <button
              type="button"
              onClick={() => {
                setSystemFilter("all");
                setDcrOnly(false);
                setTopconOnly(false);
                setBrandFilter("all");
                setCapacityFilter("all");
                setPriceFilter("all");
              }}
              className="px-4 py-1.5 rounded-xl bg-[#12357A] text-white text-xs font-bold cursor-pointer"
            >
              Reset Solar Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((product) => {
              const qtyInCart = getQtyInCart(product.id);
              const topRightBadge = product.isDcr ? (
                <span className="px-2 py-0.5 rounded-md text-[9.5px] font-black bg-emerald-600 text-white shadow-sm inline-flex items-center gap-0.5">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  DCR • ALMM
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md text-[9.5px] font-black bg-slate-700 text-amber-300 shadow-sm">
                  NON-DCR
                </span>
              );

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  discountPct={product.discountPct}
                  topRightBadge={topRightBadge}
                  visualNode={<SolarSvgGraphic kind={product.solarVisual} />}
                  siteWarningNote={product.subsidyNote}
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
                  onAdd={() => handleAddSolar(product)}
                  onDecrement={() => handleUpdateQty(product, qtyInCart - 1)}
                  onIncrement={() => handleUpdateQty(product, qtyInCart + 1)}
                  onOpenVariants={() => {
                    setVariantProduct(product);
                    setDrawerVariantIdx(0);
                    setDrawerCheckoutMode("MATERIALS_ONLY");
                  }}
                  extraStrip={
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {product.bulkSlabText && (
                        <span className="text-[10.5px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800 px-2 py-0.5 rounded-md inline-block">
                          {product.bulkSlabText}
                        </span>
                      )}
                      {product.turnkeyInstallAddon && (
                        <span className="text-[10.5px] font-bold text-[#12357A] dark:text-amber-300 bg-blue-50/80 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-800 px-2 py-0.5 rounded-md inline-block">
                          Turnkey + MVVNL Inside ▾
                        </span>
                      )}
                      {(product.subcategory === "rooftop-solar-kits" || product.isDcr) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const approxBill = Math.max(1000, Math.min(25000, Math.round(Math.max(1, product.capacityKw) * 850)));
                            setSubsidyInitBill(approxBill);
                            setSubsidyCalcOpen(true);
                          }}
                          className="text-[10.5px] font-black text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md inline-flex items-center gap-1 cursor-pointer transition"
                        >
                          Check Subsidy →
                        </button>
                      )}
                    </div>
                  }
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Reorder Last */}
      <FloatingReorderLast onReorderLast={handleReorderLast} />

      {/* UP Double-Subsidy & MVVNL Lead Modal */}
      <SolarSubsidyModal
        isOpen={subsidyCalcOpen}
        onClose={() => setSubsidyCalcOpen(false)}
        initialMonthlyBill={subsidyInitBill}
        onAddMatchedKit={(kit, addonProducts = []) => {
          handleAddSolar(kit, kit.price, "Calculator Matched Kit");
          for (const addon of addonProducts) {
            handleAddSolar(addon, addon.price, "Protection Add-on");
          }
        }}
      />

      {/* 1-Click 60-Min Solar Site BOS Rescue Kit Drawer */}
      <SolarBosRescueModal
        isOpen={bosRescueOpen}
        onClose={() => setBosRescueOpen(false)}
        onDispatchBosKit={handleDispatchBosKit}
      />

      {/* Solar Variant + Dual-Mode Checkout Drawer */}
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
              const variants =
                p.variants && p.variants.length > 0
                  ? p.variants
                  : [{ label: `${p.capacityLabel} (${p.unit})`, price: p.price, mrp: p.mrp, unit: p.unit }];
              const activeVar = variants[drawerVariantIdx] || variants[0];
              const installAddon = p.turnkeyInstallAddon || 0;
              const isTurnkey = installAddon > 0 && drawerCheckoutMode === "TURNKEY_INSTALLED";
              const displayPrice = activeVar.price + (isTurnkey ? installAddon : 0);
              const displayMrp = activeVar.mrp + (isTurnkey ? Math.round(installAddon * 1.15) : 0);

              return (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <SolarSvgGraphic kind={p.solarVisual} compact />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-black uppercase text-[#12357A] dark:text-amber-300">
                          {p.brand} · {p.oemModelCode} · {p.isDcr ? "DCR Eligible" : "Non-DCR"}
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

                  {/* Variant Chips */}
                  <div>
                    <p className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                      Select Rating / Pack Size
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

                  {/* Dual-Mode Checkout Toggle for Rooftop Kits */}
                  {installAddon > 0 && (
                    <div>
                      <p className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                        Dual-Mode Supply &amp; Net-Metering Checkout
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setDrawerCheckoutMode("MATERIALS_ONLY")}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                            drawerCheckoutMode === "MATERIALS_ONLY"
                              ? "bg-[#12357A] text-white border-[#12357A]"
                              : "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          <p className="text-xs font-black">Materials Only</p>
                          <p className={`text-[10.5px] mt-0.5 ${drawerCheckoutMode === "MATERIALS_ONLY" ? "text-blue-100" : "text-slate-400"}`}>
                            EPC / Contractor Supply (60-Min Delivery)
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDrawerCheckoutMode("TURNKEY_INSTALLED")}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                            drawerCheckoutMode === "TURNKEY_INSTALLED"
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-emerald-50/70 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800"
                          }`}
                        >
                          <p className="text-xs font-black">
                            Turnkey Installed + MVVNL &amp; UPNEDA
                          </p>
                          <p className={`text-[10.5px] mt-0.5 ${drawerCheckoutMode === "TURNKEY_INSTALLED" ? "text-emerald-100" : "text-emerald-700 dark:text-emerald-300"}`}>
                            +₹{installAddon.toLocaleString("en-IN")} (Civil, Wiring &amp; Subsidy Filing)
                          </p>
                        </button>
                      </div>
                    </div>
                  )}

                  {p.estimatedUpSubsidy && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Estimated Net Cost Post ₹{p.estimatedUpSubsidy.toLocaleString("en-IN")} UP Double Subsidy:{" "}
                        <strong>₹{Math.max(0, displayPrice - p.estimatedUpSubsidy).toLocaleString("en-IN")}</strong>
                      </span>
                    </div>
                  )}

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
                        Incl. {p.gstPercent}% Solar GST ({activeVar.unit || p.unit})
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
                          const modeSuffix =
                            installAddon > 0
                              ? isTurnkey
                                ? "Turnkey Installed + MVVNL Net-Metering"
                                : "Materials Only (EPC Supply)"
                              : activeVar.label;
                          handleAddSolar(p, displayPrice, modeSuffix, 1, activeVar.unit || p.unit);
                          setVariantProduct(null);
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
            const sp = liveProducts.find((item) => item.id === quickDetailProduct.id);
            if (sp) handleAddSolar(sp);
          }}
        />
      )}
    </div>
  );
}

export default SolarCollectionStorefront;
