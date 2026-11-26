import React, { useState, useMemo } from "react";
import {
  Clock,
  Bike,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Minus,
  Sparkles,
  ArrowLeft,
  SlidersHorizontal,
  Key,
  Lock,
  DoorClosed,
  CheckCircle2,
  X,
  ExternalLink,
  Layers,
  Fingerprint,
  Check,
  Building2,
  PackageCheck,
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
import { RealProductImage } from "@/components/RealProductImage";
import type { Product } from "@/components/ProductCard";
import {
  ALL_26_DOOR_HARDWARE_PRODUCTS,
  type DoorHardwareProduct,
} from "@/data/doorHardwareData";

export interface DoorHardwareStorefrontProps {
  onOpenDetail?: (product: Product) => void;
  onBackToDirectory?: () => void;
}

const SUBCATEGORIES = [
  { id: "ALL", label: "All Hardware & Locks", count: 26 },
  { id: "SMART_DIGITAL_LOCK", label: "Smart Digital Locks", count: 6 },
  { id: "MAIN_DOOR_MORTISE_PADLOCK", label: "Rim Locks, Mortise & Padlocks", count: 10 },
  { id: "BOLT_ALDROP_STOPPER", label: "Aldrops, Bolts & Stoppers", count: 5 },
  { id: "HINGE_CLOSER_SPRING", label: "SS 304 Hinges, Closers & Springs", count: 5 },
];

const BRAND_TIERS = [
  { id: "ALL", label: "All Lucknow Running Brands" },
  { id: "TIER1", label: "Priority 1 (Godrej, Europa, Dorset, Yale)" },
  { id: "TIER2", label: "Priority 2 (Hafele, Ozone)" },
  { id: "TIER3", label: "Priority 3 (Cent Style, Apace, Met Craft, Falna, Bling Queen)" },
];

const DOOR_TYPE_OPTIONS = [
  { id: "ALL", label: "All Door Types" },
  { id: "MAIN_DOOR", label: "Main Entrance Doors (Solid Wood / Flush)" },
  { id: "BEDROOM", label: "Bedroom & Internal Wooden Doors" },
  { id: "BATHROOM", label: "Bathroom / Toilet Privacy Doors" },
  { id: "GRILL_GATE", label: "Grill Gates & Safety Doors (2C Key Both Sides)" },
  { id: "GLASS_PIVOT", label: "Commercial Glass & Frameless Pivot Doors" },
];

const MECHANISM_OPTIONS = [
  { id: "ALL", label: "All Lock & Fitting Types" },
  { id: "SMART_BIOMETRIC", label: "Biometric & RFID Digital Locks" },
  { id: "RIM_DEADBOLT", label: "Rim Deadbolts & Tribolts (1CK & 2C)" },
  { id: "MORTISE_SET", label: "Mortise Handle Locksets (60mm & 70mm)" },
  { id: "CYLINDRICAL", label: "Cylindrical Push-Button Locks" },
  { id: "ALDROP_PADLOCK", label: "12\" SS Aldrops & Nav-Tal Padlocks" },
  { id: "HINGE_CLOSER", label: "SS 304 Butt Hinges & Door Closers" },
];

const FINISH_OPTIONS = [
  { id: "ALL", label: "All Finishes" },
  { id: "Matte Black", label: "Matte Black / Space Black" },
  { id: "Satin Nickel", label: "Satin Nickel / Silver Matte" },
  { id: "Antique Brass", label: "Antique Brass / Antique Copper" },
  { id: "SS 304", label: "Stainless Steel 304 Polished" },
  { id: "Brown", label: "Brown Metallic" },
  { id: "Solid Brass", label: "Solid Golden Brass" },
];

// Curated Add-on Items for "Complete-Door-Kit" cross-sell modal
const DOOR_KIT_CROSS_SELL_CATALOG: Record<
  string,
  {
    id: string;
    title: string;
    brand: string;
    role: string;
    price: number;
    image: string;
    desc: string;
    hsn: string;
  }
> = {
  "prod-door-hafele-butt-hinge-5x3x3": {
    id: "prod-door-hafele-butt-hinge-5x3x3",
    title: "Hafele SS 304 Ball Bearing Butt Hinge 5×3×3 in (Fire-Rated)",
    brand: "Hafele",
    role: "Heavy Main Door Hinge (80kg Grade)",
    price: 349,
    image: "",
    desc: "Grade 304 stainless steel ball bearing hinge with two-ball bearings. Fire door tested, handles 80kg door leaf with 3 hinges.",
    hsn: "8302",
  },
  "prod-door-godrej-butt-hinge-5in-12g-black": {
    id: "prod-door-godrej-butt-hinge-5in-12g-black",
    title: "Godrej SS 304 Butt Hinge 5\" × 12G Matte Black (Pair)",
    brand: "Godrej",
    role: "Matte Black Designer Hinge (70kg)",
    price: 648,
    image: "",
    desc: "Matches matte black digital locks and handles. Heavy-duty 12 gauge SS 304 with ball bearing motion.",
    hsn: "8302",
  },
  "prod-door-met-craft-magnetic-stopper": {
    id: "prod-door-met-craft-magnetic-stopper",
    title: "Met Craft SS 304 Soft-Close Magnetic Door Stopper 4.25 in",
    brand: "Met Craft",
    role: "Silent Magnetic Floor/Wall Stopper",
    price: 435,
    image: "",
    desc: "Integrated soft-catch spring absorbs closing impact and firmly retains doors up to 60kg without slamming.",
    hsn: "8302",
  },
  "prod-door-apace-tower-bolt-8in-apstb89ss": {
    id: "prod-door-apace-tower-bolt-8in-apstb89ss",
    title: "Apace APSTB89SS 8-Inch SS Matte Tower Bolt",
    brand: "Apace",
    role: "Secondary Security Night Latch Bolt",
    price: 98,
    image: "",
    desc: "High-grade stainless steel with smooth sliding rod and snug-fit socket. Lucknow home favorite for top/bottom latching.",
    hsn: "8302",
  },
  "prod-door-godrej-hercules-closer-60kg": {
    id: "prod-door-godrej-hercules-closer-60kg",
    title: "Godrej Hercules 60 kg Hydraulic Door Closer (EN3)",
    brand: "Godrej",
    role: "Auto-Closing Hydraulic Closer",
    price: 1299,
    image: "",
    desc: "Dual-speed adjustable hydraulic valve (closing & latching speed). Tested to 1,00,000 cycles for smooth self-closing.",
    hsn: "8302",
  },
  "prod-door-dorset-dc60sm-closer": {
    id: "prod-door-dorset-dc60sm-closer",
    title: "Dorset DC60SM 60 kg Overhead Hydraulic Door Closer (Satin)",
    brand: "Dorset",
    role: "Commercial Grade Door Closer",
    price: 927,
    image: "",
    desc: "Aluminium extruded body with rack-and-pinion control. Reversible for left and right hand opening doors.",
    hsn: "8302",
  },
  "prod-door-godrej-navtal-65mm-brass": {
    id: "prod-door-godrej-navtal-65mm-brass",
    title: "Godrej Nav-Tal 7-Lever 65mm Brass Padlock (4 Keys)",
    brand: "Godrej",
    role: "Aldrop Heavy-Duty Brass Lock",
    price: 800,
    image: "",
    desc: "India's iconic 7-brass-lever padlock with hardened boron-steel shackle. Perfect companion for 12\" main door aldrops.",
    hsn: "8301",
  },
  "prod-door-cent-style-aldrop-12in": {
    id: "prod-door-cent-style-aldrop-12in",
    title: "Cent Style 12-Inch Heavy-Duty SS Aldrop (Silver)",
    brand: "Cent Style",
    role: "12\" Main Door Security Aldrop",
    price: 1299,
    image: "",
    desc: "14mm solid stainless steel rod with anti-cut hasp and heavy mounting brackets for maximum entrance security.",
    hsn: "8302",
  },
  "prod-door-bling-queen-aldrop-12in": {
    id: "prod-door-bling-queen-aldrop-12in",
    title: "Bling Queen 12-Inch Heavy-Duty SS Aldrop (Matte)",
    brand: "Bling Queen",
    role: "12\" Heavy-Duty Designer Aldrop",
    price: 2049,
    image: "",
    desc: "Premium architectural matte finish 16mm thick aldrop with complete screw kit and heavy strike plate.",
    hsn: "8302",
  },
  "prod-door-godrej-vertibolt-4291": {
    id: "prod-door-godrej-vertibolt-4291",
    title: "Godrej Vertibolt Ultra XL+ 1CK Rim Lock (4291, Satin Nickel)",
    brand: "Godrej",
    role: "Vertical Interlocking Rim Lock",
    price: 2199,
    image: "",
    desc: "Vertical interlocking deadbolt prevents jimmying and prying door open. Dual-turn mechanism.",
    hsn: "8301",
  },
  "prod-door-godrej-tribolt-1ck-8111": {
    id: "prod-door-godrej-tribolt-1ck-8111",
    title: "Godrej Ultra Tribolt 1CK Rim Lock (8111, Antique Brass)",
    brand: "Godrej",
    role: "Triple Deadbolt Rim Lock",
    price: 3300,
    image: "",
    desc: "3 steel deadbolts with integrated latchbolt and holdback button. 14-pin high security dimple cylinder.",
    hsn: "8301",
  },
  "prod-door-godrej-catus-touch-plus-4200": {
    id: "prod-door-godrej-catus-touch-plus-4200",
    title: "Godrej Catus Touch Plus 4-in-1 Digital Mortise Lock (4200, Black)",
    brand: "Godrej",
    role: "Smart Digital Mortise Lock",
    price: 10900,
    image: "",
    desc: "Fingerprint, PIN, RFID card and manual key mortise lock. Auto-locking and spy-proof password keypad.",
    hsn: "8301",
  },
  "prod-door-falna-pull-handle-ss304": {
    id: "prod-door-falna-pull-handle-ss304",
    title: "Falna SS 304 Main Door Pull Handle 12\"/18\" (Matte/CP)",
    brand: "Falna SS",
    role: "Architectural Main Door Pull Handle",
    price: 500,
    image: "",
    desc: "Dual-tone mirror chrome and satin SS 304 architectural pull handle for main entrance doors and commercial glass partitions.",
    hsn: "8302",
  },
};

export function DoorHardwareStorefront({
  onOpenDetail,
  onBackToDirectory,
}: DoorHardwareStorefrontProps) {
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
  const [doorTypeFilter, setDoorTypeFilter] = useState<string>("ALL");
  const [mechanismFilter, setMechanismFilter] = useState<string>("ALL");
  const [finishFilter, setFinishFilter] = useState<string>("ALL");

  // Cross-Sell / Door Kit State
  const [selectedCrossSellProduct, setSelectedCrossSellProduct] = useState<DoorHardwareProduct | null>(null);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  // Cart helper map
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

  const getItemCartState = (prod: { categorySlug?: string; title?: string; name?: string }) => {
    const cat = prod.categorySlug || "door-hardware-locks";
    const name = prod.title || prod.name || "";
    const key = `${cat.toLowerCase()}::${name.toLowerCase()}`;
    return cartItemByKey[key] || { ids: [], quantity: 0 };
  };

  // Unique Brand List
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    ALL_26_DOOR_HARDWARE_PRODUCTS.forEach((p) => brands.add(p.brand));
    return Array.from(brands).sort();
  }, []);

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return ALL_26_DOOR_HARDWARE_PRODUCTS.map((p) => resolveProduct(p)).filter((prod) => {
      // 1. Subcategory
      if (activeSubcat !== "ALL" && prod.doorSubcategory !== activeSubcat) {
        return false;
      }

      // 2. Brand Tier
      if (selectedBrandTier === "TIER1" && prod.brandTier !== 1) return false;
      if (selectedBrandTier === "TIER2" && prod.brandTier !== 2) return false;
      if (selectedBrandTier === "TIER3" && prod.brandTier !== 3) return false;

      // 3. Specific Brand
      if (selectedBrand !== "ALL" && prod.brand !== selectedBrand) return false;

      // 4. Door Type Filter
      if (doorTypeFilter !== "ALL") {
        if (doorTypeFilter === "MAIN_DOOR") {
          const isMainDoor =
            prod.doorSubcategory === "SMART_DIGITAL_LOCK" ||
            prod.id.includes("rim") ||
            prod.id.includes("tribolt") ||
            prod.id.includes("vertibolt") ||
            prod.id.includes("parma") ||
            prod.id.includes("centaur") ||
            prod.id.includes("aldrop") ||
            prod.id.includes("pull-handle") ||
            prod.id.includes("butt-hinge") ||
            prod.id.includes("closer");
          if (!isMainDoor) return false;
        } else if (doorTypeFilter === "BEDROOM") {
          const isBedroom =
            prod.id.includes("mortise") ||
            prod.id.includes("stella") ||
            prod.id.includes("kaira") ||
            prod.id.includes("tower-bolt") ||
            prod.id.includes("stopper");
          if (!isBedroom) return false;
        } else if (doorTypeFilter === "BATHROOM") {
          const isBathroom = prod.id.includes("cylindrical") || prod.operationType.includes("Bathroom");
          if (!isBathroom) return false;
        } else if (doorTypeFilter === "GRILL_GATE") {
          const isGrillGate = prod.operationType.includes("2C") || prod.id.includes("tribolt-2c");
          if (!isGrillGate) return false;
        } else if (doorTypeFilter === "GLASS_PIVOT") {
          const isGlass =
            prod.id.includes("floor-spring") ||
            prod.id.includes("ydr-41a") ||
            prod.id.includes("pull-handle");
          if (!isGlass) return false;
        }
      }

      // 5. Mechanism Filter
      if (mechanismFilter !== "ALL") {
        if (mechanismFilter === "SMART_BIOMETRIC" && prod.doorSubcategory !== "SMART_DIGITAL_LOCK") {
          return false;
        }
        if (
          mechanismFilter === "RIM_DEADBOLT" &&
          (!prod.operationType.includes("Deadbolt") && !prod.operationType.includes("Tribolt") && !prod.operationType.includes("Rim"))
        ) {
          return false;
        }
        if (
          mechanismFilter === "MORTISE_SET" &&
          (!prod.operationType.includes("Mortise") && !prod.id.includes("mortise"))
        ) {
          return false;
        }
        if (
          mechanismFilter === "CYLINDRICAL" &&
          (!prod.operationType.includes("Push-Button") && !prod.id.includes("cylindrical"))
        ) {
          return false;
        }
        if (
          mechanismFilter === "ALDROP_PADLOCK" &&
          (!prod.id.includes("aldrop") && !prod.id.includes("padlock") && !prod.id.includes("navtal"))
        ) {
          return false;
        }
        if (
          mechanismFilter === "HINGE_CLOSER" &&
          (!prod.id.includes("hinge") && !prod.id.includes("closer") && !prod.id.includes("floor-spring"))
        ) {
          return false;
        }
      }

      // 6. Finish Filter
      if (finishFilter !== "ALL") {
        const finishStr = `${prod.finishColor || ""} ${prod.title || ""}`.toLowerCase();
        if (finishFilter === "Matte Black" && !finishStr.includes("black")) return false;
        if (finishFilter === "Satin Nickel" && !finishStr.includes("satin") && !finishStr.includes("nickel") && !finishStr.includes("silver")) return false;
        if (finishFilter === "Antique Brass" && !finishStr.includes("antique")) return false;
        if (finishFilter === "SS 304" && !finishStr.includes("ss 304") && !finishStr.includes("stainless")) return false;
        if (finishFilter === "Brown" && !finishStr.includes("brown")) return false;
        if (finishFilter === "Solid Brass" && !finishStr.includes("brass")) return false;
      }

      return true;
    });
  }, [activeSubcat, selectedBrandTier, selectedBrand, doorTypeFilter, mechanismFilter, finishFilter, resolveProduct]);

  // Cart Operations
  const handleAddToCart = (e: React.MouseEvent, prod: DoorHardwareProduct) => {
    e.stopPropagation();
    addToCart.mutate(
      {
        data: {
          materialId: prod.id,
          category: prod.categorySlug,
          name: prod.title || prod.name,
          quantity: 1,
          price: prod.price,
          unit: prod.unit,
        },
      },
      {
        onSuccess: () => {
          toast.success(`Added ${prod.brand} ${prod.title || prod.name} to cart`);
        },
        onError: () => {
          toast.error("Failed to add to cart");
        },
      }
    );
  };

  const handleUpdateQuantity = (
    e: React.MouseEvent,
    prod: DoorHardwareProduct,
    delta: number
  ) => {
    e.stopPropagation();
    const cartState = getItemCartState(prod);
    const newQty = cartState.quantity + delta;
    const firstId = cartState.ids[0];

    if (!firstId) {
      if (delta > 0) handleAddToCart(e, prod);
      return;
    }

    if (newQty <= 0) {
      removeFromCart.mutate(
        { itemId: firstId },
        {
          onSuccess: () => toast.success(`Removed ${prod.title || prod.name} from cart`),
          onError: () => toast.error("Failed to update cart"),
        }
      );
    } else {
      updateCartItem.mutate(
        { itemId: firstId, data: { quantity: newQty } },
        {
          onSuccess: () => toast.success(`Updated quantity to ${newQty}`),
          onError: () => toast.error("Failed to update cart"),
        }
      );
    }
  };

  const handleOpenModal = (prod: DoorHardwareProduct) => {
    const modalObj: Product = {
      id: prod.id,
      title: prod.title || prod.name,
      name: prod.title || prod.name,
      materialTag: "Hardware & Locks",
      vendor: prod.vendor,
      brand: prod.brand,
      price: prod.price,
      mrp: prod.mrp,
      rating: prod.rating,
      reviews: prod.reviewsCount,
      deliveryEta: prod.deliveryEta,
      image: prod.image,
      images: prod.images || [prod.image],
      description: prod.description,
      features: prod.highlights,
      specs: prod.specifications,
      unit: prod.unit,
    };
    if (onOpenDetail) {
      onOpenDetail(modalObj);
    } else {
      setModalProduct(modalObj);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Category Header */}
      <div className="bg-slate-900 text-white border-b border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {onBackToDirectory && (
                <button
                  onClick={onBackToDirectory}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Back to All Categories"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <ShieldCheck className="w-3.5 h-3.5" /> 60-Min Express Security Delivery
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" /> 18% GST / HSN 8301 &amp; 8302
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
                  Door Hardware &amp; Locks
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  Smart Digital Biometric Locks · Godrej Tribolts &amp; Mortise Sets · SS 304 Hinges, Closers &amp; Aldrops
                </p>
              </div>
            </div>

            {/* Quick Stats Pill */}
            <div className="hidden sm:flex items-center gap-3 bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Bike className="w-4 h-4 text-emerald-400" />
                <span>100% 2-Wheeler Fleet Express</span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Latouche &amp; Shivaji Marg Hubs</span>
              </div>
            </div>
          </div>

          {/* Subcategory Navigation Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-5 pb-1">
            {SUBCATEGORIES.map((subcat) => {
              const active = activeSubcat === subcat.id;
              return (
                <button
                  key={subcat.id}
                  onClick={() => setActiveSubcat(subcat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    active
                      ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  {subcat.label}
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      active ? "bg-slate-950/20 text-slate-950 font-bold" : "bg-slate-700 text-slate-400"
                    }`}
                  >
                    {subcat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area with Filters & Catalog Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filter Controls Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 pb-2 border-b border-slate-100">
            <SlidersHorizontal className="w-4 h-4 text-amber-600" />
            <span>Smart Lock &amp; Door Fitting Architecture Filters</span>
            <span className="text-slate-400 font-normal">({filteredProducts.length} of 26 items)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* 1. Brand Tier */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Brand Tier Priority
              </label>
              <select
                value={selectedBrandTier}
                onChange={(e) => setSelectedBrandTier(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {BRAND_TIERS.map((tier) => (
                  <option key={tier.id} value={tier.id}>
                    {tier.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Brand */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Specific Brand
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="ALL">All Brands ({availableBrands.length})</option>
                {availableBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Door Type Application */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Door Application
              </label>
              <select
                value={doorTypeFilter}
                onChange={(e) => setDoorTypeFilter(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {DOOR_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Lock Mechanism */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Fitting Mechanism
              </label>
              <select
                value={mechanismFilter}
                onChange={(e) => setMechanismFilter(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {MECHANISM_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Finish & Color */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Finish &amp; Color
              </label>
              <select
                value={finishFilter}
                onChange={(e) => setFinishFilter(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {FINISH_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Clear Button */}
          {(selectedBrandTier !== "ALL" ||
            selectedBrand !== "ALL" ||
            doorTypeFilter !== "ALL" ||
            mechanismFilter !== "ALL" ||
            finishFilter !== "ALL") && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500">Filtered view active</span>
              <button
                onClick={() => {
                  setSelectedBrandTier("ALL");
                  setSelectedBrand("ALL");
                  setDoorTypeFilter("ALL");
                  setMechanismFilter("ALL");
                  setFinishFilter("ALL");
                }}
                className="text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* Technical Guardrail Notice Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-6 flex items-start gap-3 text-xs text-amber-900 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-950">
              Carpentry &amp; Security Compliance Guardrail for Lucknow Homes:
            </div>
            <div className="text-amber-800 leading-relaxed">
              <strong>Smart Digital Locks:</strong> Require solid or solid-core wooden doors between <strong>35mm and 65mm</strong> thickness. Not suitable for thin 30mm hollow flush doors.
              <br />
              <strong>Rim Deadbolts (1CK vs 2C):</strong> 1CK has an interior knob for quick egress. 2C features key access on BOTH sides, making it tamper-proof against hand reach-ins on grill gates.
              <br />
              <strong>Express Fleet:</strong> All 26 locks and fittings are 100% routed to <strong>2-Wheeler</strong> express courier for rapid 60-minute site arrival.
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((prod) => {
            const cartState = getItemCartState(prod);
            const inCart = cartState.quantity > 0;
            const isSmartLock = prod.doorSubcategory === "SMART_DIGITAL_LOCK";
            const is2C = prod.operationType.includes("2C");

            return (
              <div
                key={prod.id}
                onClick={() => handleOpenModal(prod)}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group cursor-pointer"
              >
                <div>
                  {/* Image & Badges Container */}
                  <div className="relative aspect-square bg-slate-50 border-b border-slate-100 p-3 overflow-hidden flex items-center justify-center">
                    <RealProductImage
                      product={prod}
                      src={prod.image}
                      title={prod.title || prod.name}
                      brand={prod.brand}
                      category="Door Hardware"
                      alt={prod.title || prod.name}
                      variant="card"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Top Left: Subcategory Pill */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900 text-white shadow-sm">
                        {prod.brand}
                      </span>
                      {prod.oemModelCode && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {prod.oemModelCode}
                        </span>
                      )}
                    </div>

                    {/* Top Right: Express 2-Wheeler Badge */}
                    <div className="absolute top-2.5 right-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shadow-sm">
                        <Bike className="w-3 h-3" /> 60m
                      </span>
                    </div>

                    {/* Bottom Floating Warning/Guardrail Pill */}
                    {isSmartLock ? (
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="bg-amber-50/95 backdrop-blur-sm border border-amber-300 rounded px-1.5 py-1 text-[10px] font-bold text-amber-900 text-center flex items-center justify-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>Requires 35–65mm Door</span>
                        </div>
                      </div>
                    ) : is2C ? (
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="bg-emerald-50/95 backdrop-blur-sm border border-emerald-300 rounded px-1.5 py-1 text-[10px] font-bold text-emerald-900 text-center flex items-center justify-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>2C: Grill-Gate Safe (Key Both Sides)</span>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Product Details Section */}
                  <div className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>{prod.subCategory}</span>
                      <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                        HSN {prod.hsnCode}
                      </span>
                    </div>

                    <h3 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors">
                      {prod.title || prod.name}
                    </h3>

                    {/* Technical Spec Matrix Tags */}
                    <div className="space-y-1 pt-1 border-t border-slate-100 text-[11px]">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Door Thickness:</span>
                        <span className="font-semibold text-slate-800 text-[10px] truncate max-w-[150px]">
                          {prod.doorThicknessRangeMm}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Operation:</span>
                        <span className="font-semibold text-slate-800 text-[10px] truncate max-w-[150px]">
                          {prod.operationType}
                        </span>
                      </div>
                      {prod.weightCapacityKg && (
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="text-slate-400">Capacity / Rating:</span>
                          <span className="font-semibold text-emerald-700 text-[10px]">
                            {prod.weightCapacityKg}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Pricing & Cart Action Bar */}
                <div className="p-3.5 pt-0 border-t border-slate-100 bg-slate-50/50 mt-2 space-y-2.5">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-extrabold text-slate-950">
                          ₹{prod.price.toLocaleString("en-IN")}
                        </span>
                        {prod.mrp > prod.price && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{prod.mrp.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        Ex-GST: ₹{prod.exGstPrice.toLocaleString("en-IN")} (18%)
                      </div>
                    </div>

                    {/* Complete Door Kit Cross-Sell Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCrossSellProduct(prod);
                      }}
                      className="px-2 py-1 text-[10px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-md transition-colors flex items-center gap-1 border border-amber-300 shadow-xs"
                      title="View Complete Door Hardware Kit"
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      Kit Fits
                    </button>
                  </div>

                  {/* Cart Action Buttons */}
                  {inCart ? (
                    <div
                      className="flex items-center justify-between bg-amber-50 border border-amber-300 rounded-lg p-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => handleUpdateQuantity(e, prod, -1)}
                        className="w-7 h-7 flex items-center justify-center bg-white rounded text-amber-800 hover:bg-amber-100 font-bold shadow-xs"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold text-amber-950">
                        {cartState.quantity} in cart
                      </span>
                      <button
                        onClick={(e) => handleUpdateQuantity(e, prod, 1)}
                        className="w-7 h-7 flex items-center justify-center bg-amber-500 rounded text-white hover:bg-amber-600 font-bold shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => handleAddToCart(e, prod)}
                      className="w-full py-2 px-3 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add to Cart
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* "Complete-Door-Kit" Cross-Sell Modal */}
      {selectedCrossSellProduct && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedCrossSellProduct(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    Complete Door Hardware Kit Recommender
                  </h3>
                  <p className="text-xs text-slate-400">
                    Matches hinges, stoppers, tower bolts &amp; closers for {selectedCrossSellProduct.brand}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCrossSellProduct(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Selected Primary Product Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-lg border border-slate-200 p-1 shrink-0 flex items-center justify-center">
                  <RealProductImage
                    product={selectedCrossSellProduct}
                    src={selectedCrossSellProduct.image}
                    title={selectedCrossSellProduct.title || selectedCrossSellProduct.name}
                    brand={selectedCrossSellProduct.brand}
                    category="Door Hardware"
                    alt={selectedCrossSellProduct.title || selectedCrossSellProduct.name}
                    variant="thumb"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950">
                      Primary Door Item
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {selectedCrossSellProduct.subCategory}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {selectedCrossSellProduct.title || selectedCrossSellProduct.name}
                  </h4>
                  <div className="text-xs font-bold text-slate-900">
                    ₹{selectedCrossSellProduct.price.toLocaleString("en-IN")}{" "}
                    <span className="text-[11px] font-normal text-slate-500">
                      (Ex-GST ₹{selectedCrossSellProduct.exGstPrice.toLocaleString("en-IN")})
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommended Matching Hardware Kit List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <PackageCheck className="w-4 h-4 text-emerald-600" />
                    Essential Complementary Door Hardware (Lucknow Standard)
                  </span>
                  <span className="text-slate-400 font-normal text-[11px]">
                    100% 2-Wheeler Dispatch
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {(selectedCrossSellProduct.crossSellSkus || []).map((crossSku) => {
                    const addOn = DOOR_KIT_CROSS_SELL_CATALOG[crossSku];
                    if (!addOn) return null;

                    const addOnCart = getItemCartState(addOn);
                    const isAddOnInCart = addOnCart.quantity > 0;

                    return (
                      <div
                        key={addOn.id}
                        className="border border-slate-200 rounded-xl p-3 hover:border-amber-400 transition-colors flex items-center justify-between gap-4 bg-white"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-14 h-14 bg-slate-50 rounded-lg border border-slate-200 p-1 shrink-0 flex items-center justify-center">
                            <RealProductImage
                              product={addOn}
                              src={addOn.image}
                              title={addOn.title}
                              brand={addOn.brand}
                              category="Door Hardware"
                              alt={addOn.title}
                              variant="thumb"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-700">
                              {addOn.role}
                            </span>
                            <h5 className="text-xs font-bold text-slate-900 truncate">
                              {addOn.title}
                            </h5>
                            <p className="text-[11px] text-slate-500 line-clamp-1">
                              {addOn.desc}
                            </p>
                            <div className="text-xs font-extrabold text-amber-700">
                              ₹{addOn.price.toLocaleString("en-IN")}{" "}
                              <span className="text-[10px] text-slate-400 font-normal">
                                (HSN {addOn.hsn} · 18% GST)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Add to Cart button for Add-on */}
                        <div className="shrink-0">
                          {isAddOnInCart ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                              <Check className="w-3.5 h-3.5" /> Added ({addOnCart.quantity})
                            </span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart.mutate(
                                  {
                                    data: {
                                      materialId: addOn.id,
                                      category: "door-hardware-locks",
                                      name: addOn.title,
                                      quantity: 1,
                                      price: addOn.price,
                                      unit: "Piece",
                                    },
                                  },
                                  {
                                    onSuccess: () => toast.success(`Added ${addOn.title} to door kit`),
                                    onError: () => toast.error("Failed to add kit item"),
                                  }
                                );
                              }}
                              className="px-3 py-1.5 text-xs font-bold bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white rounded-lg transition-all flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 rounded-b-2xl border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                All accessories packed together with tamper-evident security seal
              </span>
              <button
                onClick={() => setSelectedCrossSellProduct(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Internal Product Detail Modal fallback */}
      {modalProduct && (
        <ProductDetailModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
        />
      )}
    </div>
  );
}
