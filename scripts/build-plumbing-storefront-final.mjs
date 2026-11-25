import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const targetPath = path.join(rootDir, "artifacts/conon/src/components/CPVCPlumbingStorefront.tsx");
const jsonPath = path.join(rootDir, "scripts/plumbing-products-temp.json");

if (!fs.existsSync(jsonPath)) {
  console.error("plumbing-products-temp.json not found!");
  process.exit(1);
}

const products = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

const tsxContent = `import React, { useState, useMemo, useEffect } from "react";
import {
  Clock,
  ChevronDown,
  ChevronRight,
  Minus,
  Plus,
  SlidersHorizontal,
  Tag,
  AlertTriangle,
  ShieldCheck,
  Check,
  Package,
  Wrench,
  Droplets,
  Layers,
  Sparkles,
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

export interface PlumbingProduct {
  id: string;
  title: string;
  brand: string;
  oemModelCode: string;
  pipeSystem: "CPVC" | "UPVC" | "SWR" | "WATER_TANK" | "ACCESSORY";
  pressureClass: "SDR-11" | "SDR-13.5" | "SCH-40" | "SCH-80" | "TYPE-A" | "TYPE-B" | "N/A";
  nominalSize: string;
  pipeLengthMeters: number | null;
  tankCapacityLiters: number | null;
  tankLayers: number | null;
  isFoamInsulated: boolean;
  deliveryVehicleType: "2-Wheeler" | "E-Loader" | "3-Wheeler/Pickup";
  vehicleType: "2-Wheeler" | "E-Loader" | "3-Wheeler/Pickup";
  brandTier: 1 | 2 | 3;
  gstPercent: number;
  subcategory:
    | "cpvc-pipes"
    | "upvc-pipes-fittings"
    | "swr-drainage-pipes"
    | "cpvc-fittings-valves"
    | "solvent-cements-adhesives"
    | "overhead-water-tanks";
  type: string;
  price: number;
  mrp: number;
  exGstPrice: number;
  discountPct: number;
  bulkPrice?: number;
  bulkSlabText?: string;
  image: string;
  spec: string;
  deliveryTime: string;
  unit: string;
  materialTag: string;
}

export const PLUMBING_SUBCATEGORIES = [
  {
    id: "cpvc-pipes",
    name: "CPVC Pipes (Hot & Cold)",
    slug: "cpvc-pipes",
    icon: "/images/subcategories/cpvc-pipes-icon.webp",
    count: 15,
  },
  {
    id: "upvc-pipes-fittings",
    name: "UPVC Pipes & Fittings",
    slug: "upvc-pipes-fittings",
    icon: "/images/subcategories/upvc-pipes-icon.webp",
    count: 2,
  },
  {
    id: "swr-drainage-pipes",
    name: "SWR Drainage Pipes",
    slug: "swr-drainage-pipes",
    icon: "/images/subcategories/swr-drainage-icon.webp",
    count: 4,
  },
  {
    id: "cpvc-fittings-valves",
    name: "CPVC Fittings, Brass & Valves",
    slug: "cpvc-fittings-valves",
    icon: "/images/subcategories/cpvc-fittings-icon.webp",
    count: 16,
  },
  {
    id: "solvent-cements-adhesives",
    name: "Solvent Cements & Adhesives",
    slug: "solvent-cements-adhesives",
    icon: "/images/subcategories/solvent-cements-icon.webp",
    count: 4,
  },
  {
    id: "overhead-water-tanks",
    name: "Overhead Water Tanks & Accessories",
    slug: "overhead-water-tanks",
    icon: "/images/subcategories/overhead-tank-icon.webp",
    count: 15,
  },
];

export const BRAND_TIERS: Record<number, { label: string; brands: string[] }> = {
  1: {
    label: "Tier 1: Core Plumbing Leaders",
    brands: ["Astral", "Ashirvad", "Supreme", "Prince"],
  },
  2: {
    label: "Tier 2: Value Plumbing",
    brands: ["Finolex"],
  },
  3: {
    label: "Tier 3: Overhead Water Tanks",
    brands: ["Sintex", "Vectus", "Plasto", "Ashirvad"],
  },
};

export const PLUMBING_PRODUCTS: PlumbingProduct[] = ${JSON.stringify(products, null, 2)};

export const PLUMBING_PRODUCTS_MAP: Record<string, PlumbingProduct> = PLUMBING_PRODUCTS.reduce(
  (acc, p) => {
    acc[p.id] = p;
    return acc;
  },
  {} as Record<string, PlumbingProduct>,
);

export interface CPVCPlumbingStorefrontProps {
  defaultSubcat?: string;
  onOpenDetail?: (product: Product) => void;
}

export function CPVCPlumbingStorefront({
  defaultSubcat,
  onOpenDetail,
}: CPVCPlumbingStorefrontProps) {
  const queryClient = useQueryClient();
  const { data: cart } = useGetCart();
  const addToCartMutation = useAddToCart();
  const updateCartMutation = useUpdateCartItem();
  const removeFromCartMutation = useRemoveFromCart();

  const getInitialSubcat = () => {
    if (defaultSubcat && PLUMBING_SUBCATEGORIES.some((s) => s.id === defaultSubcat)) {
      return defaultSubcat;
    }
    const path = typeof window !== "undefined" ? window.location.pathname.toLowerCase() : "";
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const catParam = params?.get("cat")?.toLowerCase() || params?.get("subcat")?.toLowerCase() || "";

    if (path.includes("tank") || path.includes("overhead") || catParam.includes("tank")) {
      return "overhead-water-tanks";
    }
    if (path.includes("solvent") || path.includes("cement") || catParam.includes("solvent")) {
      return "solvent-cements-adhesives";
    }
    if (path.includes("fitting") || path.includes("brass") || path.includes("valve") || catParam.includes("fitting")) {
      return "cpvc-fittings-valves";
    }
    if (path.includes("swr") || path.includes("drainage") || catParam.includes("swr")) {
      return "swr-drainage-pipes";
    }
    if (path.includes("upvc") || catParam.includes("upvc")) {
      return "upvc-pipes-fittings";
    }
    return "cpvc-pipes";
  };

  const [activeSubcat, setActiveSubcat] = useState<string>(getInitialSubcat);
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedPipeSystem, setSelectedPipeSystem] = useState("all");
  const [selectedNominalSize, setSelectedNominalSize] = useState("all");
  const [selectedPressureClass, setSelectedPressureClass] = useState("all");
  const [selectedTankCapacity, setSelectedTankCapacity] = useState("all");
  const [foamInsulatedOnly, setFoamInsulatedOnly] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [quickDetailProduct, setQuickDetailProduct] = useState<Product | null>(null);

  // Sync browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      setActiveSubcat(getInitialSubcat());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleSubcategoryChange = (id: string) => {
    setActiveSubcat(id);
    setSelectedBrand("all");
    setSelectedPipeSystem("all");
    setSelectedNominalSize("all");
    setSelectedPressureClass("all");
    setSelectedTankCapacity("all");
    setFoamInsulatedOnly(false);
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", \`/collections/\${id}\`);
    }
  };

  const cartItemsList = useMemo(() => {
    const list: Array<{ id: string; materialId: string; quantity: number; name?: string }> = [];
    if (!cart?.categories) return list;
    for (const c of cart.categories) {
      for (const item of c.items ?? []) {
        list.push({
          id: String(item.id),
          materialId: item.materialId,
          quantity: item.quantity,
          name: item.name,
        });
      }
    }
    return list;
  }, [cart]);

  /* ── Plumber-Safe Compatibility Analysis ─────────────────────────── */
  const cartAnalysis = useMemo(() => {
    let hasCpvcPipes = false;
    let hasUpvcPipes = false;
    let hasUpvcSolvent = false;
    let hasYellowCpvcSolvent = false;
    let hasOverheadTank = false;
    let tankSize = 0;

    cartItemsList.forEach((it) => {
      const p = PLUMBING_PRODUCTS.find((prod) => prod.id === it.materialId);
      const nameLower = (it.name || "").toLowerCase();

      if (p?.pipeSystem === "CPVC" || nameLower.includes("cpvc pipe") || nameLower.includes("flowguard")) {
        hasCpvcPipes = true;
      }
      if (p?.pipeSystem === "UPVC" || nameLower.includes("upvc pipe") || nameLower.includes("aqua gold")) {
        hasUpvcPipes = true;
      }
      if (p?.id === "ashirvad-upvc-solvent-cement-118ml" || nameLower.includes("upvc solvent")) {
        hasUpvcSolvent = true;
      }
      if (
        p?.subcategory === "solvent-cements-adhesives" &&
        (p.id.includes("cpvc") || p.id.includes("weld-on") || nameLower.includes("yellow") || nameLower.includes("cts-500"))
      ) {
        hasYellowCpvcSolvent = true;
      }
      if (
        p?.pipeSystem === "WATER_TANK" ||
        nameLower.includes("water tank") ||
        nameLower.includes("sintex") ||
        nameLower.includes("vectus") ||
        nameLower.includes("plasto")
      ) {
        hasOverheadTank = true;
        if (p?.tankCapacityLiters) tankSize = Math.max(tankSize, p.tankCapacityLiters);
      }
    });

    const warnings: string[] = [];
    if (hasCpvcPipes && hasUpvcSolvent) {
      warnings.push(
        "Chemical Fusion Hazard: Your cart contains CPVC Hot & Cold Pipes paired with uPVC Solvent Cement. uPVC solvent fails under 93°C hot water pressure. Please replace it with Yellow CPVC Solvent (Astral Weld-On or Ashirvad Yellow).",
      );
    }
    if (hasCpvcPipes && !hasYellowCpvcSolvent && !hasUpvcSolvent) {
      warnings.push(
        "Solvent Cement Reminder: Don't forget Yellow CPVC Solvent Cement for leak-free chemical fusion joints on site.",
      );
    }

    return {
      hasCpvcPipes,
      hasUpvcPipes,
      hasUpvcSolvent,
      hasYellowCpvcSolvent,
      hasOverheadTank,
      tankSize,
      warnings,
    };
  }, [cartItemsList]);

  /* ── Filtered Products ────────────────────────────────────────────── */
  const filteredProducts = useMemo(() => {
    let result = PLUMBING_PRODUCTS.filter((p) => p.subcategory === activeSubcat);

    if (selectedBrand !== "all") {
      result = result.filter((p) => p.brand.toLowerCase() === selectedBrand.toLowerCase());
    }
    if (selectedPipeSystem !== "all") {
      result = result.filter((p) => p.pipeSystem === selectedPipeSystem);
    }
    if (selectedNominalSize !== "all") {
      result = result.filter((p) => p.nominalSize === selectedNominalSize);
    }
    if (selectedPressureClass !== "all") {
      result = result.filter((p) => p.pressureClass === selectedPressureClass);
    }
    if (selectedTankCapacity !== "all") {
      const cap = parseInt(selectedTankCapacity);
      result = result.filter((p) => p.tankCapacityLiters === cap);
    }
    if (foamInsulatedOnly) {
      result = result.filter((p) => p.isFoamInsulated);
    }
    if (selectedPrice !== "all") {
      if (selectedPrice === "under-300") result = result.filter((p) => p.price < 300);
      else if (selectedPrice === "300-1000") result = result.filter((p) => p.price >= 300 && p.price <= 1000);
      else if (selectedPrice === "1000-5000") result = result.filter((p) => p.price >= 1000 && p.price <= 5000);
      else if (selectedPrice === "above-5000") result = result.filter((p) => p.price > 5000);
    }

    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
    else if (sortBy === "discount") result.sort((a, b) => b.discountPct - a.discountPct);

    return result;
  }, [
    activeSubcat,
    selectedBrand,
    selectedPipeSystem,
    selectedNominalSize,
    selectedPressureClass,
    selectedTankCapacity,
    foamInsulatedOnly,
    selectedPrice,
    sortBy,
  ]);

  const getQtyInCart = (prodId: string): number => {
    const item = cartItemsList.find((i) => i.materialId === prodId);
    return item ? item.quantity : 0;
  };

  const handleAdd = (product: PlumbingProduct) => {
    addToCartMutation.mutate(
      {
        data: {
          materialId: product.id,
          quantity: 1,
          price: product.price,
          unit: product.unit,
          vendor: \`\${product.brand} Official Hub\`,
          category: "CPVC Plumbing & Overhead Tanks",
          name: product.title,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast.success(\`Added \${product.title} to cart\`);
        },
        onError: () => {
          toast.error("Failed to add to cart");
        },
      },
    );
  };

  const handleUpdateQty = (product: PlumbingProduct, newQty: number) => {
    const item = cartItemsList.find((i) => i.materialId === product.id);
    if (!item) return;

    if (newQty <= 0) {
      removeFromCartMutation.mutate(
        { itemId: item.id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          },
        },
      );
    } else {
      updateCartMutation.mutate(
        {
          itemId: item.id,
          data: { quantity: newQty },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          },
        },
      );
    }
  };

  // 1-Click Add Tank Connection Kit
  const handleAddTankKit = () => {
    const kitItems = [
      { id: "astral-cpvc-tank-nipple-25mm", qty: 2, name: "Astral CPVC Tank Nipple 1\" (25mm)", price: 83 },
      { id: "astral-cpvc-ball-valve-25mm", qty: 1, name: "Astral CPVC Ball Valve 1\" (25mm)", price: 270 },
      { id: "astral-cpvc-union-20mm", qty: 1, name: "Astral CPVC Union 3/4\" (20mm)", price: 85 },
      { id: "vectus-tank-filter-y-type-screen-25mm", qty: 1, name: "Vectus Tank Filter Y-Type Screen 1\" (25mm)", price: 550 },
      { id: "astral-weld-on-cts-500-cpvc-solvent-118ml", qty: 1, name: "Astral Weld-On CTS-500-118 CPVC Solvent Cement", price: 174 },
    ];

    kitItems.forEach((k) => {
      addToCartMutation.mutate({
        data: {
          materialId: k.id,
          quantity: k.qty,
          price: k.price,
          unit: "Piece",
          vendor: "Conon Pro Depot",
          category: "CPVC Plumbing & Overhead Tanks",
          name: k.name,
        },
      });
    });

    queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
    toast.success("Complete 1\" Tank Connection Kit added to your cart! (0 extra delivery cost)");
  };

  const toGenericProduct = (p: PlumbingProduct): Product => ({
    id: p.id,
    name: p.title,
    title: p.title,
    brand: p.brand,
    unit: p.unit,
    price: p.price,
    mrp: p.mrp,
    image: p.image,
    materialTag: "CPVC Plumbing & Overhead Tanks",
    rating: 4.8,
    reviews: 146,
    deliveryEta: "60 Mins",
    specs: [{ label: "Spec", value: p.spec }, { label: "Class", value: p.pressureClass }, { label: "Size", value: p.nominalSize }],
    bulkPrice: p.bulkPrice,
    bulkSlabText: p.bulkSlabText,
  });

  const activeSubcatObj = PLUMBING_SUBCATEGORIES.find((s) => s.id === activeSubcat);

  return (
    <div className="w-full bg-[#FAFBFD] min-h-screen pb-20">
      {/* ── Top Header & Breadcrumb ─────────────────────────────────────── */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto">
            <span>Home</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span>Plumbing, Sanitary & Bath</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-900">{activeSubcatObj?.name || "CPVC Plumbing & Overhead Tanks"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EAF7EE] text-[#15803D] border border-[#BBF7D0]">
              <Clock className="w-3.5 h-3.5" /> 60-Min Site Delivery in Lucknow
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
              <ShieldCheck className="w-3.5 h-3.5" /> 18% GST ITC Invoice
            </span>
          </div>
        </div>
      </div>

      {/* ── Lucknow Express Promotional Banner ──────────────────────────── */}
      <div className="w-full bg-gradient-to-r from-[#0284C7] via-[#0369A1] to-[#075985] text-white border-b border-[#0369A1]/30">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
              <Droplets className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-sm sm:text-base tracking-wide">
                  LUCKNOW MASTER PLUMBING DEPOT
                </span>
                <span className="bg-[#FEF08A] text-[#854D0E] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Zero Inventory Dealer Hub
                </span>
              </div>
              <p className="text-xs text-sky-100 font-medium mt-0.5">
                Astral Pro · Ashirvad FlowGuard Plus · Supreme · Finolex · Sintex & Vectus Tanks · Guaranteed Genuine Pipe Bundles
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 text-center">
              <span className="block text-[11px] font-semibold text-sky-200">Express Vehicle Dispatch</span>
              <span className="text-xs font-bold text-white">2-Wheeler · E-Loader · Pickup</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Technician-Safe Compatibility Alert Banner (STEP 5) ───────────── */}
      {cartAnalysis.warnings.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
          {cartAnalysis.warnings.map((warn, i) => (
            <div
              key={i}
              className="mb-2 p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex items-start gap-3 shadow-xs"
            >
              <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-[#92400E] uppercase tracking-wide">Plumbing Compatibility Alert</h4>
                <p className="text-xs text-[#78350F] font-medium mt-0.5 leading-relaxed">{warn}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 1-Click Overhead Tank Connection Kit Prompt (STEP 5) ─────────── */}
      {cartAnalysis.hasOverheadTank && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-3">
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#F0FDF4] via-[#DCFCE7] to-[#BBF7D0] border border-[#86EFAC] flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#16A34A] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#14532D] uppercase tracking-wide">
                    Overhead Tank Detected in Cart
                  </span>
                  <span className="bg-[#15803D] text-white text-[9.5px] font-bold px-2 py-0.5 rounded-full">
                    Zero Extra Trip Fee
                  </span>
                </div>
                <p className="text-xs text-[#166534] font-medium mt-0.5">
                  Complete your site plumbing with the <strong>1\" Tank Connection Kit</strong>: 2x 1\" CPVC Tank Nipples + 1x 1\" Ball Valve + 1x 1\" Union + 1x Vectus Y-Filter + 1x Solvent Cement.
                </p>
              </div>
            </div>
            <button
              onClick={handleAddTankKit}
              className="px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black rounded-lg transition-all shadow-sm shrink-0 flex items-center gap-1.5 cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Add Tank Kit (₹886)
            </button>
          </div>
        </div>
      )}

      {/* ── Subcategories Bar & Filters ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
        {/* Horizontal Subcategory Badges (Quick Access) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {PLUMBING_SUBCATEGORIES.map((s) => {
            const active = activeSubcat === s.id;
            return (
              <button
                key={s.id}
                onClick={() => handleSubcategoryChange(s.id)}
                className={\`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border cursor-pointer \${
                  active
                    ? "bg-[#0284C7] text-white border-[#0284C7] shadow-sm"
                    : "bg-white text-slate-700 border-[#E2E8F0] hover:bg-slate-50"
                }\`}
              >
                <img src={s.icon} alt={s.name} className="w-5 h-5 object-contain" />
                <span>{s.name}</span>
                <span
                  className={\`text-[10px] px-1.5 py-0.2 rounded-full font-black \${
                    active ? "bg-white/30 text-white" : "bg-slate-100 text-slate-600"
                  }\`}
                >
                  {s.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Strip */}
        <div className="mt-4 bg-white p-3.5 rounded-xl border border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters:
            </span>

            {/* Brand Dropdown */}
            <div className="relative">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="appearance-none bg-[#F8FAFC] border border-[#CBD5E1] text-[#334155] text-xs font-bold py-1.5 pl-3 pr-7 rounded-lg hover:border-[#94A3B8] transition-colors cursor-pointer"
              >
                <option value="all">All Brands</option>
                <option value="Astral">Astral Pro (Tier 1)</option>
                <option value="Ashirvad">Ashirvad (Tier 1)</option>
                <option value="Supreme">Supreme (Tier 1)</option>
                <option value="Prince">Prince (Tier 1)</option>
                <option value="Finolex">Finolex (Tier 2)</option>
                <option value="Sintex">Sintex Tanks (Tier 3)</option>
                <option value="Vectus">Vectus Tanks (Tier 3)</option>
                <option value="Plasto">Plasto Tanks (Tier 3)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Pipe System Dropdown */}
            <div className="relative">
              <select
                value={selectedPipeSystem}
                onChange={(e) => setSelectedPipeSystem(e.target.value)}
                className="appearance-none bg-[#F8FAFC] border border-[#CBD5E1] text-[#334155] text-xs font-bold py-1.5 pl-3 pr-7 rounded-lg hover:border-[#94A3B8] transition-colors cursor-pointer"
              >
                <option value="all">All Pipe Systems</option>
                <option value="CPVC">CPVC (Hot & Cold)</option>
                <option value="UPVC">uPVC (Cold Water)</option>
                <option value="SWR">SWR Drainage</option>
                <option value="WATER_TANK">Overhead Tank</option>
                <option value="ACCESSORY">Accessories & Filters</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Pressure Class */}
            <div className="relative">
              <select
                value={selectedPressureClass}
                onChange={(e) => setSelectedPressureClass(e.target.value)}
                className="appearance-none bg-[#F8FAFC] border border-[#CBD5E1] text-[#334155] text-xs font-bold py-1.5 pl-3 pr-7 rounded-lg hover:border-[#94A3B8] transition-colors cursor-pointer"
              >
                <option value="all">Pressure Class</option>
                <option value="SDR-11">SDR-11 (Class 1)</option>
                <option value="SDR-13.5">SDR-13.5 (Class 2)</option>
                <option value="SCH-80">SCH-80 (Heavy Wall)</option>
                <option value="TYPE-A">Type A (Rainwater)</option>
                <option value="TYPE-B">Type B (Soil/Waste)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Tank Capacity (Active on Tanks subcategory) */}
            {activeSubcat === "overhead-water-tanks" && (
              <div className="relative">
                <select
                  value={selectedTankCapacity}
                  onChange={(e) => setSelectedTankCapacity(e.target.value)}
                  className="appearance-none bg-[#F8FAFC] border border-[#CBD5E1] text-[#334155] text-xs font-bold py-1.5 pl-3 pr-7 rounded-lg hover:border-[#94A3B8] transition-colors cursor-pointer"
                >
                  <option value="all">All Capacities</option>
                  <option value="500">500 Liters</option>
                  <option value="1000">1000 Liters (Most Popular)</option>
                  <option value="2000">2000 Liters (Heavy Commercial)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            {/* Foam Insulated Toggle */}
            <button
              onClick={() => setFoamInsulatedOnly(!foamInsulatedOnly)}
              className={\`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer \${
                foamInsulatedOnly
                  ? "bg-[#FEF08A] text-[#854D0E] border-[#FACC15]"
                  : "bg-[#F8FAFC] text-slate-600 border-[#CBD5E1] hover:bg-slate-100"
              }\`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#EAB308]" />
              Summer Heat-Shield Foam
            </button>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Sort:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-[#F8FAFC] border border-[#CBD5E1] text-[#334155] text-xs font-bold py-1.5 pl-3 pr-7 rounded-lg hover:border-[#94A3B8] transition-colors cursor-pointer"
              >
                <option value="relevance">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="discount">Highest Savings</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ── Product Grid ────────────────────────────────────────────── */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">
              {activeSubcatObj?.name} ({filteredProducts.length} Verified SKUs)
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              Zero-inventory express dealer dispatch in Lucknow
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-[#E2E8F0]">
              <Package className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-700">No plumbing products match your filter</h3>
              <p className="text-xs text-slate-500 mt-1">Try resetting the brand or pressure class filter.</p>
              <button
                onClick={() => {
                  setSelectedBrand("all");
                  setSelectedPipeSystem("all");
                  setSelectedNominalSize("all");
                  setSelectedPressureClass("all");
                  setSelectedTankCapacity("all");
                  setFoamInsulatedOnly(false);
                }}
                className="mt-3 px-3 py-1.5 bg-[#0284C7] text-white text-xs font-bold rounded-lg"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
              {filteredProducts.map((p) => {
                const qty = getQtyInCart(p.id);
                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-xl border border-[#E2E8F0] p-3 flex flex-col justify-between hover:shadow-md transition-shadow group relative"
                  >
                    <div>
                      {/* Top Badges (Discount + Vehicle Dispatch) */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        {p.discountPct > 0 ? (
                          <span className="bg-[#2563EB] text-white text-[10px] font-black px-1.5 py-0.5 rounded-xs">
                            {p.discountPct}% OFF
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-xs">
                            BEST RATE
                          </span>
                        )}

                        <span
                          className={\`text-[9.5px] font-bold px-1.5 py-0.5 rounded-xs \${
                            p.deliveryVehicleType === "2-Wheeler"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : p.deliveryVehicleType === "E-Loader"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-blue-50 text-blue-800 border border-blue-200"
                          }\`}
                        >
                          {p.deliveryVehicleType}
                        </span>
                      </div>

                      {/* Product Image */}
                      <div
                        onClick={() => {
                          const generic = toGenericProduct(p);
                          if (onOpenDetail) onOpenDetail(generic);
                          else setQuickDetailProduct(generic);
                        }}
                        className="w-full aspect-square bg-[#F8FAFC] rounded-lg p-2.5 flex items-center justify-center cursor-pointer overflow-hidden mb-2.5"
                      >
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      </div>

                      {/* Brand & OEM Code */}
                      <div className="flex items-center justify-between text-[10.5px] text-slate-500 mb-1">
                        <span className="font-extrabold text-[#0284C7] uppercase">{p.brand}</span>
                        <span className="font-mono text-[9.5px]">{p.oemModelCode}</span>
                      </div>

                      {/* Title */}
                      <h3
                        onClick={() => {
                          const generic = toGenericProduct(p);
                          if (onOpenDetail) onOpenDetail(generic);
                          else setQuickDetailProduct(generic);
                        }}
                        className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug cursor-pointer hover:text-[#0284C7] transition-colors"
                        title={p.title}
                      >
                        {p.title}
                      </h3>

                      {/* Spec Pill / Foam Badge */}
                      <div className="mt-1.5 flex items-center gap-1 flex-wrap">
                        {p.isFoamInsulated && (
                          <span className="bg-[#FEF08A] text-[#854D0E] text-[9.5px] font-black px-1.5 py-0.5 rounded-xs">
                            Heat-Shield Foam
                          </span>
                        )}
                        <span className="text-[10px] font-medium text-slate-500 truncate">{p.spec}</span>
                      </div>

                      {/* Bulk Price Tag */}
                      {p.bulkPrice && (
                        <div className="mt-1 text-[10px] font-semibold text-[#16A34A] bg-[#F0FDF4] px-1.5 py-0.5 rounded-xs w-fit">
                          {p.bulkSlabText || \`Bulk price ₹\${p.bulkPrice}\`}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#F1F5F9]">
                      {/* Price Row: Selling, MRP, and Pre-GST base */}
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-sm font-black text-slate-900">₹{p.price.toLocaleString("en-IN")}</span>
                        <span className="text-[11px] text-slate-400 line-through">₹{p.mrp.toLocaleString("en-IN")}</span>
                        <span className="text-[9.5px] text-slate-500">(Ex-GST ₹{p.exGstPrice})</span>
                      </div>

                      {/* Delivery SLA */}
                      <div className="mt-1 flex items-center gap-1 text-[10.5px] text-slate-500">
                        <Clock className="w-3 h-3 text-[#16A34A]" />
                        <span>{p.deliveryTime} Express</span>
                      </div>

                      {/* Add to Cart / Stepper */}
                      <div className="mt-2.5">
                        {qty > 0 ? (
                          <div className="flex items-center justify-between border border-[#16A34A] bg-[#F0FDF4] rounded-lg px-2 py-1">
                            <button
                              onClick={() => handleUpdateQty(p, qty - 1)}
                              className="w-6 h-6 flex items-center justify-center text-[#16A34A] font-bold hover:bg-[#DCFCE7] rounded-sm transition-colors cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-black text-[#15803D]">{qty}</span>
                            <button
                              onClick={() => handleUpdateQty(p, qty + 1)}
                              className="w-6 h-6 flex items-center justify-center text-[#16A34A] font-bold hover:bg-[#DCFCE7] rounded-sm transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAdd(p)}
                            className="w-full py-1.5 border border-[#16A34A] text-[#16A34A] hover:bg-[#16A34A] hover:text-white rounded-lg text-xs font-bold transition-all text-center cursor-pointer shadow-2xs"
                          >
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Detail Modal */}
      {quickDetailProduct && (
        <ProductDetailModal
          product={quickDetailProduct}
          isOpen={true}
          onClose={() => setQuickDetailProduct(null)}
          cartQty={getQtyInCart(quickDetailProduct.id)}
          onSetQty={(p, newQty) => {
            const prod = PLUMBING_PRODUCTS_MAP[p.id];
            if (prod) handleUpdateQty(prod, newQty);
          }}
          onAddToCart={(p, qty) => {
            const prod = PLUMBING_PRODUCTS_MAP[p.id];
            if (prod) {
              const current = getQtyInCart(p.id);
              handleUpdateQty(prod, current + (qty || 1));
            }
          }}
        />
      )}
    </div>
  );
}
`;

fs.writeFileSync(targetPath, tsxContent, "utf8");
console.log("Successfully wrote CPVCPlumbingStorefront.tsx!");

