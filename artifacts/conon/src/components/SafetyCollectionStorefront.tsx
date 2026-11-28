import React, { useMemo, useState } from "react";
import { ShieldCheck, Calculator, HardHat, ShoppingBag } from "lucide-react";
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
import { CononCategoryStudio, type StudioProductItem } from "@/components/CononCategoryStudio";
import {
  LUCKNOW_32_SAFETY_SKUS,
  SAFETY_SUBCATEGORIES,
} from "@/data/lucknowSafetyCatalog";
import { useLiveProductMerger } from "@/hooks/useCononLiveData";

export const SAFETY_PRODUCTS = LUCKNOW_32_SAFETY_SKUS;

interface SafetyCollectionStorefrontProps {
  onOpenDetail?: (product: Product) => void;
}

type SiteType = "G2_RESIDENTIAL" | "TOWER" | "PEB_HALL" | "ROAD_EXCAVATION" | "ELECTRICAL_FINISH";

export function SafetyCollectionStorefront({ onOpenDetail }: SafetyCollectionStorefrontProps) {
  const qc = useQueryClient();
  const { data: cart } = useGetCart();
  const addToCart = useAddToCart({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() }) },
  });
  const updateCartItem = useUpdateCartItem({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() }) },
  });
  const removeFromCart = useRemoveFromCart({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() }) },
  });

  const mergeLiveProducts = useLiveProductMerger();

  const [activeSubCat, setActiveSubCat] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeBrand, setActiveBrand] = useState("ALL");
  const [sortBy, setSortBy] = useState<"POPULAR" | "PRICE_ASC" | "PRICE_DESC">("POPULAR");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [variantIdxMap, setVariantIdxMap] = useState<Record<string, number>>({});
  const [detailItem, setDetailItem] = useState<{ item: StudioProductItem; price: number } | null>(null);

  // Widget 1: Site Safety Compliance Kit Builder
  const [kitSiteType, setKitSiteType] = useState<SiteType>("G2_RESIDENTIAL");
  const [workerCount, setWorkerCount] = useState<5 | 10 | 25 | 50>(10);

  // Widget 2: Height & PEB Fall-Safety Net Calculator
  const [perimeterFt, setPerimeterFt] = useState<number>(120);
  const [heightFt, setHeightFt] = useState<number>(30);

  const liveSkus = useMemo(() => mergeLiveProducts(LUCKNOW_32_SAFETY_SKUS), [mergeLiveProducts]);

  const brands = useMemo(
    () => Array.from(new Set(liveSkus.map((s) => s.brand))),
    [liveSkus]
  );

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = liveSkus.filter((item) => {
      if (activeSubCat !== "ALL" && item.subCategoryId !== activeSubCat) return false;
      if (activeBrand !== "ALL" && item.brand !== activeBrand) return false;
      if (inStockOnly && item.inStock === false) return false;
      if (q) {
        const hay = `${item.title} ${item.brand} ${item.standardBadge || ""} ${item.specLine || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === "PRICE_ASC") return [...list].sort((a, b) => a.price - b.price);
    if (sortBy === "PRICE_DESC") return [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [liveSkus, activeSubCat, activeBrand, inStockOnly, searchQuery, sortBy]);

  const getCartQty = (productId: string) => {
    const items = (cart as any)?.items || [];
    return items
      .filter((it: any) => it.materialId === productId || it.name?.includes(productId))
      .reduce((s: number, it: any) => s + (it.quantity || 0), 0);
  };

  const handleAdd = (item: StudioProductItem, activePrice: number, activeVariant?: string) => {
    const label = activeVariant ? `${item.title} (${activeVariant})` : item.title;
    addToCart.mutate({
      data: {
        materialId: item.id,
        category: "Safety",
        name: label,
        price: activePrice,
        unit: item.unit,
        vendor: item.brand,
        quantity: 1,
      },
    });
    toast.success(`Added ${label} to Cart`);
  };

  const handleSetQty = (productId: string, nextQty: number) => {
    const match = ((cart as any)?.items || []).find((it: any) => it.materialId === productId);
    if (!match) return;
    if (nextQty <= 0) removeFromCart.mutate({ itemId: match.id });
    else updateCartItem.mutate({ itemId: match.id, data: { quantity: nextQty } });
  };

  // Widget 1 Kit Calculation
  const kitCalc = useMemo(() => {
    const discountPct = workerCount >= 50 ? 16 : workerCount >= 25 ? 12 : workerCount >= 10 ? 8 : 0;
    const perWorkerCost =
      kitSiteType === "PEB_HALL" || kitSiteType === "TOWER"
        ? 245 + 125 + 1050 + 145 + 1890
        : kitSiteType === "ELECTRICAL_FINISH"
        ? 245 + 125 + 1050 + 480
        : 245 + 125 + 490 + 115;
    const siteFixedCost = 1650 + 980 + 210; // ABC Extinguisher + First Aid + Caution Tape
    const gross = perWorkerCost * workerCount + siteFixedCost;
    const net = Math.round(gross * (1 - discountPct / 100));
    return { discountPct, gross, net };
  }, [kitSiteType, workerCount]);

  // Widget 2 Fall-Net Calculation
  const netCalc = useMemo(() => {
    const perimeterM = Math.max(10, Math.round(perimeterFt * 0.3048));
    const fallNets = Math.max(1, Math.ceil(perimeterM / 10));
    const debrisRolls = Math.max(1, Math.ceil((perimeterM * Math.max(1, Math.ceil(heightFt / 10))) / 150));
    const ropeMeters = Math.max(30, Math.ceil(heightFt * 0.3048 * 2));
    const harnesses = Math.max(2, Math.ceil(perimeterFt / 60));
    const estCost = fallNets * 2850 + debrisRolls * 1650 + Math.ceil(ropeMeters / 30) * 1450 + harnesses * 1890;
    return { fallNets, debrisRolls, ropeMeters, harnesses, estCost };
  }, [perimeterFt, heightFt]);

  const addKitToCart = () => {
    addToCart.mutate({
      data: {
        materialId: `safety-kit-${kitSiteType}-${workerCount}`,
        category: "Safety",
        name: `CONON ${kitSiteType} Site Safety Kit (${workerCount} Workers, ${kitCalc.discountPct}% Bulk Off)`,
        price: kitCalc.net,
        unit: "kit",
        vendor: "CONON Safety",
        quantity: 1,
      },
    });
    toast.success(`Added ${workerCount}-Worker Safety Kit (${kitCalc.discountPct}% off) to Cart!`);
  };

  const addFallNetToCart = () => {
    addToCart.mutate({
      data: {
        materialId: `safety-net-bundle-${netCalc.fallNets}`,
        category: "Safety",
        name: `PEB Height Fall-Safety Bundle (${netCalc.fallNets} Fall Nets, ${netCalc.harnesses} Harnesses)`,
        price: netCalc.estCost,
        unit: "bundle",
        vendor: "CONON Safety",
        quantity: 1,
      },
    });
    toast.success("Added Height Fall-Safety Bundle to Cart!");
  };

  const magicWidgets = (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Widget 1: Site Safety Compliance Kit Builder */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <HardHat className="w-4 h-4 text-amber-500" />
            Site Safety Compliance Kit Builder (LDA / RERA)
          </h2>
          {kitCalc.discountPct > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
              {kitCalc.discountPct}% Bulk Slab Off
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <select
            value={kitSiteType}
            onChange={(e) => setKitSiteType(e.target.value as SiteType)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800"
          >
            <option value="G2_RESIDENTIAL">G+2 Residential Plot</option>
            <option value="TOWER">Multi-Storey Tower</option>
            <option value="PEB_HALL">PEB / Steel Warehouse</option>
            <option value="ROAD_EXCAVATION">Road / Excavation</option>
            <option value="ELECTRICAL_FINISH">Electrical &amp; Finishing</option>
          </select>
          <div className="flex gap-1">
            {([5, 10, 25, 50] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setWorkerCount(n)}
                className={`flex-1 py-2 rounded-xl font-black cursor-pointer ${
                  workerCount === n ? "bg-[#1848a0] text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-lg font-black font-mono text-slate-900">
              ₹{kitCalc.net.toLocaleString("en-IN")}
            </span>
            {kitCalc.discountPct > 0 && (
              <span className="text-xs line-through text-slate-400 ml-2 font-mono">
                ₹{kitCalc.gross.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={addKitToCart}
            className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add Complete Site Kit
          </button>
        </div>
      </div>

      {/* Widget 2: Height & PEB Fall-Safety Net Calculator */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-700" />
            Height &amp; PEB Fall-Safety Net Calculator
          </h2>
          <span className="text-[10px] font-black text-blue-700">IS 11057 • IS 3521</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div>
            <label className="font-bold text-slate-500 block mb-1">Perimeter (ft)</label>
            <input
              type="number"
              min={20}
              value={perimeterFt}
              onChange={(e) => setPerimeterFt(Math.max(20, Number(e.target.value) || 20))}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-mono font-bold"
            />
          </div>
          <div>
            <label className="font-bold text-slate-500 block mb-1">Working Height (ft)</label>
            <input
              type="number"
              min={10}
              value={heightFt}
              onChange={(e) => setHeightFt(Math.max(10, Number(e.target.value) || 10))}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-mono font-bold"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <span className="font-bold text-slate-700">
            {netCalc.fallNets} Fall Nets (10×5m) • {netCalc.debrisRolls} Debris Rolls • {netCalc.harnesses} Harnesses
          </span>
          <button
            type="button"
            onClick={addFallNetToCart}
            className="px-3.5 py-2 rounded-xl bg-[#1848a0] text-white text-xs font-black cursor-pointer"
          >
            Add Bundle • ₹{netCalc.estCost.toLocaleString("en-IN")}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <CononCategoryStudio
        title="Site Safety & PPE"
        subtitleHi="साइट सेफ्टी और सुरक्षा गियर (Karam Lucknow, Allen Cooper Kanpur, Hillson, Venus, 3M)"
        badge="ISI / RERA Compliant"
        subCategories={SAFETY_SUBCATEGORIES}
        activeSubCategoryId={activeSubCat}
        onSelectSubCategory={setActiveSubCat}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        brands={brands}
        activeBrand={activeBrand}
        onSelectBrand={setActiveBrand}
        sortBy={sortBy}
        onSortChange={setSortBy}
        inStockOnly={inStockOnly}
        onToggleInStockOnly={() => setInStockOnly((p) => !p)}
        products={filteredProducts}
        selectedVariantIdxMap={variantIdxMap}
        onSelectVariantIdx={(id, idx) => setVariantIdxMap((p) => ({ ...p, [id]: idx }))}
        getCartQty={getCartQty}
        onAddToCart={handleAdd}
        onSetCartQty={handleSetQty}
        onOpenDetail={(item, price) => {
          setDetailItem({ item, price });
          if (onOpenDetail) {
            onOpenDetail({
              id: item.id,
              title: item.title,
              brand: item.brand,
              price,
              mrp: item.mrp,
              unit: item.unit,
              image: item.image || "",
              materialTag: "Safety",
              categoryTag: "Site Safety & PPE",
              rating: 4.8,
              reviews: 42,
              deliveryEta: "60 mins",
              hsnCode: item.hsnCode,
              gstRate: item.gstRate,
            } as Product);
          }
        }}
        magicWidgets={magicWidgets}
      />

      {detailItem && !onOpenDetail && (
        <ProductDetailModal
          product={{
            id: detailItem.item.id,
            title: detailItem.item.title,
            brand: detailItem.item.brand,
            price: detailItem.price,
            mrp: detailItem.item.mrp,
            unit: detailItem.item.unit,
            image: detailItem.item.image || "",
            categoryTag: "Site Safety & PPE",
            hsnCode: detailItem.item.hsnCode,
            gstRate: detailItem.item.gstRate,
            highlights: [detailItem.item.standardBadge || "ISI Certified", detailItem.item.specLine || ""],
          }}
          onClose={() => setDetailItem(null)}
          onAddToCart={() => handleAdd(detailItem.item, detailItem.price)}
        />
      )}
    </>
  );
}

export default SafetyCollectionStorefront;
