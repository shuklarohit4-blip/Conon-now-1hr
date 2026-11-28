import React, { useMemo, useState } from "react";
import { Link } from "wouter";
import { Zap, Calculator, HardHat } from "lucide-react";
import { toast } from "sonner";
import {
  useAddToCart,
  useUpdateCartItem,
  useRemoveFromCart,
  useGetCart,
  getGetCartQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import type { Product } from "@/components/ProductCard";
import { CononCategoryStudio, type StudioProductItem, type StudioSubCategory } from "@/components/CononCategoryStudio";
import { useLiveProductMerger } from "@/hooks/useCononLiveData";

interface ElectricalCollectionStorefrontProps {
  onOpenDetail?: (product: Product) => void;
}

const ELEC_SUBCATEGORIES: StudioSubCategory[] = [
  { id: "ALL", label: "All Electricals", count: 12 },
  { id: "wires", label: "Electrical Wires (FR/FRLS/ZHFR)", count: 3 },
  { id: "cables", label: "CAT 6, Coaxial & CCTV Cables", count: 2 },
  { id: "db-mcb", label: "DB, MCB & RCCB Protection", count: 2 },
  { id: "conduits", label: "PVC Conduits & GI Boxes", count: 1 },
  { id: "switches", label: "Modular Switches", count: 1 },
  { id: "sockets", label: "Sockets & Regulators", count: 1 },
  { id: "plates", label: "Switch Plates & Frames", count: 1 },
  { id: "accessories", label: "Wiring Accessories", count: 1 },
];

const WIRE_GAUGE_VARIANTS = [
  { label: "1.0 sq.mm", priceOverride: 1180 },
  { label: "1.5 sq.mm", priceOverride: 1690 },
  { label: "2.5 sq.mm", priceOverride: 2680 },
  { label: "4.0 sq.mm", priceOverride: 4120 },
  { label: "6.0 sq.mm", priceOverride: 6150 },
];

const ELEC_SKUS: StudioProductItem[] = [
  {
    id: "polycab-frls-90m-wire",
    title: "Polycab Suprema FRLS Copper House Wire (90m Coil)",
    brand: "Polycab",
    subCategoryId: "wires",
    categorySlug: "wires-mcb-electrical",
    price: 1690,
    mrp: 2450,
    unit: "90m coil",
    hsnCode: "8544",
    gstRate: 18,
    standardBadge: "IS 694 • FRLS",
    specLine: "99.97% Electrolytic Copper • Flame Retardant",
    variantLabel: "Wire Gauge",
    variants: WIRE_GAUGE_VARIANTS,
  },
  {
    id: "havells-lifeline-plus-s3",
    title: "Havells Lifeline Plus S3 HRFR Copper Wire (90m Coil)",
    brand: "Havells",
    subCategoryId: "wires",
    categorySlug: "wires-mcb-electrical",
    price: 1750,
    mrp: 2520,
    unit: "90m coil",
    hsnCode: "8544",
    gstRate: 18,
    standardBadge: "IS 694 • HRFR",
    specLine: "101% Conductivity • Heat Resistant",
    variantLabel: "Wire Gauge",
    variants: WIRE_GAUGE_VARIANTS,
  },
  {
    id: "finolex-zhfr-green-wire",
    title: "Finolex Gold Zero-Halogen Flame Retardant (ZHFR) Wire (90m)",
    brand: "Finolex",
    subCategoryId: "wires",
    categorySlug: "wires-mcb-electrical",
    price: 1790,
    mrp: 2590,
    unit: "90m coil",
    hsnCode: "8544",
    gstRate: 18,
    standardBadge: "ZHFR Eco",
    specLine: "Zero Toxic Smoke • Coil Colours: R/Y/B/Blk/Grn",
    variantLabel: "Coil Colour",
    variants: [
      { label: "Red", swatchHex: "#dc2626" },
      { label: "Yellow", swatchHex: "#eab308" },
      { label: "Blue", swatchHex: "#2563eb" },
      { label: "Black", swatchHex: "#1e293b" },
      { label: "Green", swatchHex: "#16a34a" },
    ],
  },
  {
    id: "dlink-cat6-lan-305m",
    title: "D-Link CAT 6 UTP 23 AWG Gigabit LAN Cable (100m / 305m Box)",
    brand: "D-Link",
    subCategoryId: "cables",
    categorySlug: "wires-mcb-electrical",
    price: 6850,
    mrp: 9200,
    unit: "305m box",
    hsnCode: "8544",
    gstRate: 18,
    standardBadge: "Gigabit",
    specLine: "Solid Bare Copper • Smart Home & CCTV",
  },
  {
    id: "finolex-rg6-coaxial-cctv",
    title: "Finolex RG-6 Jelly-Flooded Coaxial & 3+1 CCTV Cable (90m)",
    brand: "Finolex",
    subCategoryId: "cables",
    categorySlug: "wires-mcb-electrical",
    price: 1490,
    mrp: 2100,
    unit: "90m coil",
    hsnCode: "8544",
    gstRate: 18,
    standardBadge: "3+1 CCTV",
    specLine: "Shielded Copper Braid",
  },
  {
    id: "schneider-act9-mcb-6a-32a",
    title: "Schneider Acti9 / Havells Euro-II SP & DP MCB (6A to 32A)",
    brand: "Schneider",
    subCategoryId: "db-mcb",
    categorySlug: "wires-mcb-electrical",
    price: 215,
    mrp: 310,
    unit: "piece",
    hsnCode: "8536",
    gstRate: 18,
    standardBadge: "10kA C-Curve",
    specLine: "Trip-Free Toggle • Bi-Connect Terminals",
    variantLabel: "Rating",
    variants: [
      { label: "10A SP", priceOverride: 215 },
      { label: "16A SP", priceOverride: 225 },
      { label: "32A DP", priceOverride: 540 },
    ],
  },
  {
    id: "havells-12way-double-door-db",
    title: "Havells 12-Way SPN Double-Door Metal Distribution Board + RCCB",
    brand: "Havells",
    subCategoryId: "db-mcb",
    categorySlug: "wires-mcb-electrical",
    price: 2890,
    mrp: 3950,
    unit: "unit",
    hsnCode: "8537",
    gstRate: 18,
    standardBadge: "IP43 • 30mA",
    specLine: "Includes 40A 30mA Earth-Leakage RCCB",
  },
  {
    id: "precision-pvc-conduit-25mm-10pk",
    title: "Precision 25mm HMS Heavy-Wall PVC Conduit Pipe (Pack of 10 × 3m)",
    brand: "Precision",
    subCategoryId: "conduits",
    categorySlug: "wires-mcb-electrical",
    price: 1290,
    mrp: 1750,
    unit: "bundle (30m)",
    hsnCode: "3917",
    gstRate: 18,
    standardBadge: "IS 9537",
    specLine: "Concealed Slab & Wall Chasing Grade",
  },
  {
    id: "anchor-roma-6a-switch-20pk",
    title: "Anchor Roma Classic 6A 1-Way Modular Switch (Box of 20)",
    brand: "Anchor",
    subCategoryId: "switches",
    categorySlug: "wires-mcb-electrical",
    price: 680,
    mrp: 960,
    unit: "box of 20",
    hsnCode: "8536",
    gstRate: 18,
    standardBadge: "IS 3854",
    specLine: "Silver-Alloy Contacts • Soft Click",
  },
  {
    id: "legrand-mylinc-16a-socket",
    title: "Legrand MyLinc 6A/16A Combined Power Socket with Shutter",
    brand: "Legrand",
    subCategoryId: "sockets",
    categorySlug: "wires-mcb-electrical",
    price: 245,
    mrp: 340,
    unit: "piece",
    hsnCode: "8536",
    gstRate: 18,
    standardBadge: "AC / Geyser",
    specLine: "Child-Safety Shuttered • Brass Terminals",
  },
  {
    id: "legrand-8mod-glass-plate",
    title: "Legrand / Anchor 8-Module & 12-Module Polycarbonate Cover Plate",
    brand: "Legrand",
    subCategoryId: "plates",
    categorySlug: "wires-mcb-electrical",
    price: 290,
    mrp: 410,
    unit: "piece",
    hsnCode: "8538",
    gstRate: 18,
    standardBadge: "UV Stabilized",
    specLine: "Matte White / Charcoal Frame",
  },
  {
    id: "steelgrip-pvc-tape-saddle-kit",
    title: "Steelgrip FR PVC Insulation Tape (10 Rolls) + Brass Terminal Kit",
    brand: "Pidilite",
    subCategoryId: "accessories",
    categorySlug: "wires-mcb-electrical",
    price: 295,
    mrp: 420,
    unit: "kit",
    hsnCode: "3919",
    gstRate: 18,
    standardBadge: "FR Tested",
    specLine: "Zero-Peel Adhesive • 7m Rolls",
  },
];

export const ELECTRICAL_WIRES_PRODUCTS = ELEC_SKUS.filter((s) => s.subCategoryId === "wires" || s.subCategoryId === "cables");
export const MCB_PROTECTION_PRODUCTS = ELEC_SKUS.filter((s) => s.subCategoryId === "db-mcb" || s.subCategoryId === "conduits");
export const SWITCHES_SOCKETS_PRODUCTS = ELEC_SKUS.filter((s) => !["wires", "cables", "db-mcb", "conduits"].includes(s.subCategoryId));

const HOME_LOAD_PRESETS = {
  "1BHK": { coils15: 3, coils25: 2, coils40: 1, mcbs: 6, kw: "3 kW" },
  "2BHK": { coils15: 5, coils25: 4, coils40: 2, mcbs: 10, kw: "5 kW" },
  "3BHK": { coils15: 8, coils25: 6, coils40: 3, mcbs: 14, kw: "7 kW" },
  DUPLEX: { coils15: 12, coils25: 9, coils40: 5, mcbs: 20, kw: "10 kW" },
  COMMERCIAL: { coils15: 6, coils25: 6, coils40: 4, mcbs: 16, kw: "8 kW" },
};

export function ElectricalCollectionStorefront({ onOpenDetail }: ElectricalCollectionStorefrontProps) {
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
  const [bhkPreset, setBhkPreset] = useState<keyof typeof HOME_LOAD_PRESETS>("2BHK");

  const liveSkus = useMemo(() => mergeLiveProducts(ELEC_SKUS), [mergeLiveProducts]);
  const brands = useMemo(() => Array.from(new Set(liveSkus.map((s) => s.brand))), [liveSkus]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = liveSkus.filter((item) => {
      if (activeSubCat !== "ALL" && item.subCategoryId !== activeSubCat) return false;
      if (activeBrand !== "ALL" && item.brand !== activeBrand) return false;
      if (inStockOnly && item.inStock === false) return false;
      if (q && !`${item.title} ${item.brand} ${item.specLine || ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
    if (sortBy === "PRICE_ASC") return [...list].sort((a, b) => a.price - b.price);
    if (sortBy === "PRICE_DESC") return [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [liveSkus, activeSubCat, activeBrand, inStockOnly, searchQuery, sortBy]);

  const getCartQty = (productId: string) =>
    ((cart as any)?.items || [])
      .filter((it: any) => it.materialId === productId)
      .reduce((s: number, it: any) => s + (it.quantity || 0), 0);

  const handleAdd = (item: StudioProductItem, activePrice: number, activeVariant?: string) => {
    const label = activeVariant ? `${item.title} (${activeVariant})` : item.title;
    addToCart.mutate({
      data: {
        materialId: item.id,
        category: "Electrical",
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

  const load = HOME_LOAD_PRESETS[bhkPreset];
  const estWiringTotal = load.coils15 * 1690 + load.coils25 * 2680 + load.coils40 * 4120 + load.mcbs * 225;

  const estimatorWidget = (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-black text-slate-900">
          <Calculator className="w-4 h-4 text-blue-700" />
          <span>House Wiring &amp; MCB Load Estimator</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
            {load.kw} Load
          </span>
        </div>
        <p className="text-xs text-slate-600">
          Est. {load.coils15}×1.5mm + {load.coils25}×2.5mm + {load.coils40}×4.0mm Coils + {load.mcbs} MCBs ≈{" "}
          <strong className="font-mono text-slate-900">₹{estWiringTotal.toLocaleString("en-IN")}</strong>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(HOME_LOAD_PRESETS) as Array<keyof typeof HOME_LOAD_PRESETS>).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setBhkPreset(k)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer ${
              bhkPreset === k ? "bg-[#1848a0] text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            {k}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            addToCart.mutate({
              data: {
                materialId: `wiring-pack-${bhkPreset}`,
                category: "Electrical",
                name: `CONON ${bhkPreset} Complete Wiring & MCB Pack (${load.kw})`,
                price: estWiringTotal,
                unit: "pack",
                vendor: "Polycab / Havells",
                quantity: 1,
              },
            });
            toast.success(`Added ${bhkPreset} Complete Wiring Pack to Cart!`);
          }}
          className="px-3.5 py-2 rounded-xl bg-[#1848a0] hover:brightness-110 text-white text-xs font-black cursor-pointer"
        >
          Add Wiring Pack • ₹{estWiringTotal.toLocaleString("en-IN")}
        </button>
        <Link
          href="/services"
          className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5"
        >
          <HardHat className="w-3.5 h-3.5" />
          + Book Licensed Electrician (₹850/shift)
        </Link>
      </div>
    </div>
  );

  return (
    <CononCategoryStudio
      title="CONON Electrical Pro Studio"
      subtitleHi="वायर्स, MCB, डिस्ट्रीब्यूशन बोर्ड और मॉड्यूलर स्विच (Polycab, Havells, Finolex, Schneider, Legrand)"
      badge="IS 694 • 100% Genuine"
      subCategories={ELEC_SUBCATEGORIES}
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
        if (onOpenDetail) {
          onOpenDetail({
            id: item.id,
            title: item.title,
            brand: item.brand,
            price,
            mrp: item.mrp,
            unit: item.unit,
            image: item.image || "",
            materialTag: "Electrical",
            categoryTag: "Electrical Pro Studio",
            rating: 4.8,
            reviews: 54,
            deliveryEta: "60 mins",
            hsnCode: item.hsnCode,
            gstRate: item.gstRate,
          } as Product);
        }
      }}
      magicWidgets={estimatorWidget}
    />
  );
}

export default ElectricalCollectionStorefront;
