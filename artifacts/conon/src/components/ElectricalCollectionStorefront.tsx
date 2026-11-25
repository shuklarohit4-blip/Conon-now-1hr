import React, { useState, useMemo } from "react";
import { ChevronDown, Clock, X } from "lucide-react";
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
import { VariantSelectorSheet } from "@/components/VariantSelectorSheet";
import type { Product } from "@/components/ProductCard";
import { RealProductImage } from "@/components/RealProductImage";

export interface ElectricalProduct {
  id: string;
  title: string;
  brand: string;
  categoryTag: string;
  type: string;
  size?: string;
  color?: string;
  material?: string;
  grade?: string;
  cores?: string;
  packSize: string;
  price: number;
  mrp: number;
  discountPct: number;
  image: string;
  cashbackPill?: string;
  specsPill?: string;
  deliveryTime: string;
  optionsCount: number;
  materialTag: string;
  unit: string;
  rating?: number;
}

export const ELECTRICAL_WIRES_PRODUCTS: ElectricalProduct[] = [
  {
    id: "polycab-maxima-green-wire-hr-fr-lsh",
    title: "Polycab Maxima+ Green Wire HR FR-LSH LF",
    brand: "Polycab",
    categoryTag: "House Wire",
    type: "HR FR-LSH LF",
    size: "1.5 sq mm",
    color: "Green",
    material: "Copper",
    grade: "FRLS",
    cores: "Single Core",
    packSize: "90m Coil",
    price: 2093,
    mrp: 3875,
    discountPct: 46,
    image: "/images/products/electrical/polycab-maxima-green-wire-hr-fr-lsh.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "99.97% copper",
    deliveryTime: "60 Mins",
    optionsCount: 50,
    materialTag: "Electrical",
    unit: "90m Coil",
    rating: 4.9,
  },
  {
    id: "finolex-silver-fr-wire",
    title: "Finolex Silver FR Wire",
    brand: "Finolex",
    categoryTag: "House Wire",
    type: "FR Wire",
    size: "1.0 sq mm",
    color: "Red",
    material: "Copper",
    grade: "FR",
    cores: "Single Core",
    packSize: "90m Coil",
    price: 1731,
    mrp: 2838,
    discountPct: 39,
    image: "/images/products/electrical/finolex-silver-fr-wire.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Electrolytic Grade Copper",
    deliveryTime: "60 Mins",
    optionsCount: 50,
    materialTag: "Electrical",
    unit: "90m Coil",
    rating: 4.9,
  },
  {
    id: "anchor-panasonic-advance-fr-wire",
    title: "Anchor Panasonic Advance FR Wire, 90m",
    brand: "Anchor Panasonic",
    categoryTag: "House Wire",
    type: "Advance FR",
    size: "1.5 sq mm",
    color: "Green",
    material: "Copper",
    grade: "FR",
    cores: "Single Core",
    packSize: "90m Coil",
    price: 1958,
    mrp: 3765,
    discountPct: 48,
    image: "/images/products/electrical/anchor-panasonic-advance-fr-wire.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "100% Electrolytic Copper",
    deliveryTime: "60 Mins",
    optionsCount: 25,
    materialTag: "Electrical",
    unit: "90m Coil",
    rating: 4.8,
  },
  {
    id: "kei-homecab-fr-wire",
    title: "KEI Homecab FR Wire, 90m",
    brand: "KEI",
    categoryTag: "House Wire",
    type: "Homecab FR",
    size: "1.0 sq mm",
    color: "Red",
    material: "Copper",
    grade: "FR",
    cores: "Single Core",
    packSize: "90m Coil",
    price: 1853,
    mrp: 3706,
    discountPct: 50,
    image: "/images/products/electrical/kei-homecab-fr-wire.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Multi-Strand",
    deliveryTime: "60 Mins",
    optionsCount: 20,
    materialTag: "Electrical",
    unit: "90m Coil",
    rating: 4.8,
  },
  {
    id: "polycab-optima-fr-wire-row2",
    title: "Polycab Optima+ FR Flame Retardant Wire (1.5 sq mm, 90m)",
    brand: "Polycab",
    categoryTag: "House Wire",
    type: "FR Wire",
    size: "1.5 sq mm",
    color: "Blue",
    material: "Copper",
    grade: "FR",
    cores: "Single Core",
    packSize: "90m Coil",
    price: 1640,
    mrp: 2980,
    discountPct: 45,
    image: "/images/products/electrical/polycab-optima-fr-wire-row2.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Flame Retardant",
    deliveryTime: "60 Mins",
    optionsCount: 40,
    materialTag: "Electrical",
    unit: "90m Coil",
    rating: 4.8,
  },
  {
    id: "finolex-flameguard-wire-row2",
    title: "Finolex Flame Guard FRLS-H Wire (2.5 sq mm, 90m)",
    brand: "Finolex",
    categoryTag: "House Wire",
    type: "FRLS",
    size: "2.5 sq mm",
    color: "Black",
    material: "Copper",
    grade: "FRLS",
    cores: "Single Core",
    packSize: "90m Coil",
    price: 2690,
    mrp: 4800,
    discountPct: 44,
    image: "/images/products/electrical/finolex-flameguard-wire-row2.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Low Smoke Zero Halogen",
    deliveryTime: "60 Mins",
    optionsCount: 30,
    materialTag: "Electrical",
    unit: "90m Coil",
    rating: 4.9,
  },
  {
    id: "anchor-zelect-wire-row2",
    title: "Anchor Panasonic ZElect FRLS Wire (1.0 sq mm, 90m)",
    brand: "Anchor Panasonic",
    categoryTag: "House Wire",
    type: "FRLS",
    size: "1.0 sq mm",
    color: "Yellow",
    material: "Copper",
    grade: "FRLS",
    cores: "Single Core",
    packSize: "90m Coil",
    price: 1420,
    mrp: 3550,
    discountPct: 60,
    image: "/images/products/electrical/anchor-zelect-wire-row2.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Anti-Termite Rodent Repellent",
    deliveryTime: "60 Mins",
    optionsCount: 25,
    materialTag: "Electrical",
    unit: "90m Coil",
    rating: 4.7,
  },
  {
    id: "havells-flameguard-wire-row2",
    title: "Havells Flameguard HRFR Wire (4.0 sq mm, 90m)",
    brand: "Havells",
    categoryTag: "House Wire",
    type: "HR FR-LSH LF",
    size: "4.0 sq mm",
    color: "Red",
    material: "Copper",
    grade: "FR",
    cores: "Single Core",
    packSize: "90m Coil",
    price: 4120,
    mrp: 6650,
    discountPct: 38,
    image: "/images/products/electrical/havells-flameguard-wire-row2.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "High Heat Resistant 85°C",
    deliveryTime: "60 Mins",
    optionsCount: 20,
    materialTag: "Electrical",
    unit: "90m Coil",
    rating: 4.9,
  },
  {
    id: "havells-lifeline-2-5-sq-mm",
    title: "Havells Life Line Plus S3 HRFR Wire (2.5 sq mm, 90m)",
    brand: "Havells",
    categoryTag: "House Wire",
    type: "HR FR-LSH LF",
    size: "2.5 sq mm",
    color: "Blue",
    material: "Copper",
    grade: "FR",
    cores: "Single Core",
    packSize: "90m Coil",
    price: 2780,
    mrp: 4480,
    discountPct: 38,
    image: "/images/products/electrical/havells-lifeline-2-5-sq-mm.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "101% Copper Conductivity",
    deliveryTime: "60 Mins",
    optionsCount: 15,
    materialTag: "Electrical",
    unit: "90m Coil",
    rating: 4.9,
  },
  {
    id: "havells-3-core-flat-2-5mm",
    title: "Havells Submersible 3 Core Flat Cable (2.5 sq mm, 100m)",
    brand: "Havells",
    categoryTag: "Submersible Cable",
    type: "3 Core Flat",
    size: "2.5 sq mm",
    color: "Black",
    material: "Copper",
    grade: "FR",
    cores: "3 Core Flat",
    packSize: "100m Coil",
    price: 5850,
    mrp: 8200,
    discountPct: 29,
    image: "/images/products/electrical/havells-3-core-flat-2-5mm.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Waterproof Sheathed",
    deliveryTime: "60 Mins",
    optionsCount: 8,
    materialTag: "Electrical",
    unit: "100m Coil",
    rating: 4.8,
  },
];

export const MCB_PROTECTION_PRODUCTS: ElectricalProduct[] = [
  {
    id: "schneider-32a-dp-mcb",
    title: "Schneider Electric Acti9 32A Double Pole MCB C-Curve",
    brand: "Schneider Electric",
    categoryTag: "MCB & Protection",
    type: "MCB",
    size: "32A DP",
    packSize: "1 Unit",
    price: 480,
    mrp: 720,
    discountPct: 33,
    image: "/images/products/electrical/schneider-32a-dp-mcb.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "10kA Breaking Capacity",
    deliveryTime: "60 Mins",
    optionsCount: 6,
    materialTag: "Electrical",
    unit: "1 Unit",
    rating: 4.9,
  },
  {
    id: "havells-mcb-sp-16a-c-type",
    title: "Havells Euro-II 16A Single Pole C-Curve MCB",
    brand: "Havells",
    categoryTag: "MCB & Protection",
    type: "MCB",
    size: "16A SP",
    packSize: "1 Unit",
    price: 165,
    mrp: 245,
    discountPct: 33,
    image: "/images/products/electrical/havells-mcb-sp-16a-c-type.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "ISI Certified 10kA",
    deliveryTime: "60 Mins",
    optionsCount: 8,
    materialTag: "Electrical",
    unit: "1 Unit",
    rating: 4.9,
  },
  {
    id: "legrand-rccb-40a-30ma-dp",
    title: "Legrand RX3 40A 30mA Double Pole RCCB Residual Current Breaker",
    brand: "Legrand",
    categoryTag: "MCB & Protection",
    type: "RCCB",
    size: "40A DP 30mA",
    packSize: "1 Unit",
    price: 2150,
    mrp: 2890,
    discountPct: 26,
    image: "/images/products/electrical/legrand-rccb-40a-30ma-dp.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Human Shock Protection",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    materialTag: "Electrical",
    unit: "1 Unit",
    rating: 4.9,
  },
  {
    id: "havells-spn-db-8-way-mcb",
    title: "Havells SPN 8-Way Double Door Distribution Board IP43",
    brand: "Havells",
    categoryTag: "MCB & Protection",
    type: "Distribution Board",
    size: "8-Way SPN",
    packSize: "1 Unit",
    price: 1250,
    mrp: 1850,
    discountPct: 32,
    image: "/images/products/electrical/havells-spn-db-8-way-mcb.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Powder Coated CRCA Steel",
    deliveryTime: "60 Mins",
    optionsCount: 5,
    materialTag: "Electrical",
    unit: "1 Unit",
    rating: 4.8,
  },
];

export const SWITCHES_SOCKETS_PRODUCTS: ElectricalProduct[] = [
  {
    id: "anchor-roma-6a-1-way-switch",
    title: "Anchor Roma Classic 6A 1-Way Modular Switch (White)",
    brand: "Anchor Panasonic",
    categoryTag: "Modular Switches",
    type: "Modular Switch",
    size: "6A 1-Way",
    packSize: "Pack of 10",
    price: 380,
    mrp: 580,
    discountPct: 34,
    image: "/images/products/electrical/anchor-roma-6a-1-way-switch.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Fire Retardant Polycarbonate",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    materialTag: "Electrical",
    unit: "Pack of 10",
    rating: 4.8,
  },
  {
    id: "legrand-myrius-6a-socket-5-pin",
    title: "Legrand Myrius 6A 5-Pin Shuttered Modular Socket",
    brand: "Legrand",
    categoryTag: "Modular Sockets",
    type: "Modular Socket",
    size: "6A 5-Pin",
    packSize: "1 Unit",
    price: 185,
    mrp: 265,
    discountPct: 30,
    image: "/images/products/electrical/legrand-myrius-6a-socket-5-pin.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Child Safety Shutters",
    deliveryTime: "60 Mins",
    optionsCount: 3,
    materialTag: "Electrical",
    unit: "1 Unit",
    rating: 4.9,
  },
  {
    id: "anchor-modular-plate-8m",
    title: "Anchor Roma Classic 8-Module Cover Plate with Grid Frame",
    brand: "Anchor Panasonic",
    categoryTag: "Plates",
    type: "Modular Plate",
    size: "8 Module",
    packSize: "1 Unit",
    price: 195,
    mrp: 290,
    discountPct: 33,
    image: "/images/products/electrical/anchor-modular-plate-8m.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Glossy White Polycarbonate",
    deliveryTime: "60 Mins",
    optionsCount: 6,
    materialTag: "Electrical",
    unit: "1 Unit",
    rating: 4.8,
  },
  {
    id: "anchor-roma-fan-regulator",
    title: "Anchor Roma 100W 5-Step Modular Rotary Fan Regulator",
    brand: "Anchor Panasonic",
    categoryTag: "Wiring Accessories",
    type: "Fan Regulator",
    size: "100W 5-Step",
    packSize: "1 Unit",
    price: 285,
    mrp: 410,
    discountPct: 30,
    image: "/images/products/electrical/anchor-roma-fan-regulator.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Hum-Free Stepped Control",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    materialTag: "Electrical",
    unit: "1 Unit",
    rating: 4.7,
  },
];

export const ELECTRICAL_SUBCATEGORIES = [
  {
    id: "electrical-wires",
    name: "Electrical Wires",
    count: 15,
    icon: "/images/subcategories/electrical-wires-icon.webp",
  },
  {
    id: "cat6-cables",
    name: "CAT 6, Speaker & Other Cables",
    count: 8,
    icon: "/images/subcategories/cat6-cables-icon.webp",
  },
  {
    id: "db-mcb-protection",
    name: "DB, MCB & Protection",
    count: 12,
    icon: "/images/subcategories/db-mcb-protection-icon.webp",
  },
  {
    id: "conduits-gi-boxes",
    name: "Electrical Conduits & GI Boxes",
    count: 10,
    icon: "/images/subcategories/conduits-gi-boxes-icon.webp",
  },
  {
    id: "switches",
    name: "Switches",
    count: 14,
    icon: "/images/subcategories/modular-switches-icon.webp",
  },
  {
    id: "sockets",
    name: "Sockets",
    count: 8,
    icon: "/images/subcategories/electrical-sockets-icon.webp",
  },
  {
    id: "plates",
    name: "Plates",
    count: 8,
    icon: "/images/subcategories/modular-plates-icon.webp",
  },
  {
    id: "wiring-accessories",
    name: "Wiring Accessories",
    count: 6,
    icon: "/images/subcategories/wiring-accessories-icon.webp",
  },
];

interface ElectricalCollectionStorefrontProps {
  onOpenDetail?: (product: Product) => void;
}

export function ElectricalCollectionStorefront({ onOpenDetail }: ElectricalCollectionStorefrontProps) {
  const [activeSubcat, setActiveSubcat] = useState("electrical-wires");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");
  const [selectedColor, setSelectedColor] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedCores, setSelectedCores] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [quickDetailProduct, setQuickDetailProduct] = useState<Product | null>(null);
  const [variantProduct, setVariantProduct] = useState<any | null>(null);

  const qc = useQueryClient();
  const invalidateCart = () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() });
  const addToCart = useAddToCart({ mutation: { onSuccess: invalidateCart } });
  const updateCartItem = useUpdateCartItem({ mutation: { onSuccess: invalidateCart } });
  const removeFromCart = useRemoveFromCart({ mutation: { onSuccess: invalidateCart } });
  const { data: cart } = useGetCart();

  const cartItemByKey = useMemo(() => {
    const map: Record<string, { ids: string[]; quantity: number }> = {};
    for (const c of cart?.categories ?? []) {
      for (const it of c.items ?? []) {
        const key = `${(it.category || "").toLowerCase()}::${(it.name || "").toLowerCase()}`;
        const entry = map[key] ?? (map[key] = { ids: [], quantity: 0 });
        entry.ids.push(String(it.id));
        entry.quantity += Number(it.quantity) || 0;
      }
    }
    return map;
  }, [cart]);

  const rawProducts = useMemo(() => {
    switch (activeSubcat) {
      case "db-mcb-protection":
        return MCB_PROTECTION_PRODUCTS;
      case "switches":
      case "sockets":
      case "plates":
      case "wiring-accessories":
        return SWITCHES_SOCKETS_PRODUCTS;
      default:
        return ELECTRICAL_WIRES_PRODUCTS;
    }
  }, [activeSubcat]);

  const filteredProducts = useMemo(() => {
    return rawProducts
      .filter((p) => {
        if (selectedBrand !== "all" && p.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
        if (selectedType !== "all" && !p.type.toLowerCase().includes(selectedType.toLowerCase())) return false;
        if (selectedSize !== "all" && p.size && !p.size.toLowerCase().includes(selectedSize.toLowerCase())) return false;
        if (selectedColor !== "all" && p.color && p.color.toLowerCase() !== selectedColor.toLowerCase()) return false;
        if (selectedCores !== "all" && p.cores && !p.cores.toLowerCase().includes(selectedCores.toLowerCase())) return false;

        if (selectedPrice === "under-1500" && p.price >= 1500) return false;
        if (selectedPrice === "1500-2000" && (p.price < 1500 || p.price > 2000)) return false;
        if (selectedPrice === "above-2000" && p.price <= 2000) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        return 0;
      });
  }, [rawProducts, selectedBrand, selectedType, selectedSize, selectedColor, selectedPrice, selectedCores, sortBy]);

  const brands = useMemo(() => Array.from(new Set(rawProducts.map((p) => p.brand))), [rawProducts]);
  const types = useMemo(() => Array.from(new Set(rawProducts.map((p) => p.type))), [rawProducts]);
  const sizes = useMemo(() => Array.from(new Set(rawProducts.map((p) => p.size).filter(Boolean))), [rawProducts]);
  const colors = useMemo(() => Array.from(new Set(rawProducts.map((p) => p.color).filter(Boolean))), [rawProducts]);

  const handleAddToCart = (p: ElectricalProduct) => {
    addToCart.mutate(
      {
        data: {
          materialId: p.id,
          quantity: 1,
          name: p.title,
          price: p.price,
          unit: p.unit || "Coil",
          vendor: `${p.brand} Official Distributor`,
          category: "Electrical",
        },
      },
      {
        onSuccess: () => toast.success(`${p.title} added to cart!`),
        onError: () => toast.error("Could not add to cart. Please try again."),
      }
    );
  };

  const handleUpdateQty = (p: ElectricalProduct, newQty: number) => {
    const key = `electrical::${p.title.toLowerCase()}`;
    const entry = cartItemByKey[key];
    if (!entry || entry.ids.length === 0) {
      if (newQty > 0) handleAddToCart(p);
      return;
    }
    const primaryId = entry.ids[0];
    if (newQty <= 0) {
      removeFromCart.mutate({ itemId: primaryId });
    } else {
      updateCartItem.mutate({ itemId: primaryId, data: { quantity: newQty } });
    }
  };

  return (
    <div className="bg-[#FAFBFD] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-3 sm:px-6 py-3 sm:py-4">
        {/* Breadcrumb Trail */}
        <nav className="text-[12px] sm:text-[13px] text-[#6B7280] mb-3 sm:mb-4 flex items-center flex-wrap gap-1">
          <a href="/home" className="hover:text-[#111827] transition-colors">Home</a>
          <span>›</span>
          <a href="/categories?cat=electrical" className="hover:text-[#111827] transition-colors">
            Electrical
          </a>
          <span>›</span>
          <span className="text-[#111827] font-semibold">
            {ELECTRICAL_SUBCATEGORIES.find((s) => s.id === activeSubcat)?.name ?? "Electrical Wires"}
          </span>
        </nav>

        {/* Heading */}
        <div className="mb-4">
          <h1 className="text-[22px] sm:text-[28px] font-black text-[#111827] tracking-tight">
            {ELECTRICAL_SUBCATEGORIES.find((s) => s.id === activeSubcat)?.name ?? "Electrical Wires"}
          </h1>
        </div>

        {/* Layout: Sidebar + Main Listing */}
        <div className="flex flex-col md:flex-row gap-5 items-start">
          {/* Left Subcategory Sidebar */}
          <aside className="w-full md:w-[230px] lg:w-[250px] shrink-0 bg-white rounded-xl border border-[#E5E7EB] p-2 shadow-xs">
            <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
              {ELECTRICAL_SUBCATEGORIES.map((subcat) => {
                const isActive = activeSubcat === subcat.id;
                return (
                  <button
                    key={subcat.id}
                    onClick={() => {
                      setActiveSubcat(subcat.id);
                      setSelectedBrand("all");
                      setSelectedType("all");
                      setSelectedSize("all");
                      setSelectedColor("all");
                      setSelectedPrice("all");
                    }}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all w-full shrink-0 md:shrink ${
                      isActive
                        ? "bg-[#EAF7EE] text-[#0F5132] font-semibold border-r-4 border-[#16A34A]"
                        : "text-[#374151] hover:bg-[#F3F4F6]"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-md bg-white border border-[#E5E7EB] flex items-center justify-center p-1 shrink-0 overflow-hidden">
                      <img src={subcat.icon} alt="" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[13px] leading-tight flex-1">{subcat.name}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main Area: Filters Toolbar + 4-Column Grid */}
          <main className="flex-1 min-w-0 w-full">
            {/* Filter Bar with Multiple Options */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-3 mb-4 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12px] font-medium text-[#6B7280]">Filter:</span>

                {/* Brand Filter */}
                <div className="relative">
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    aria-label="Filter by Brand"
                    className="appearance-none bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-[#D1D5DB] text-[12px] font-medium text-[#374151] rounded-lg pl-2.5 pr-7 py-1.5 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#16A34A]"
                  >
                    <option value="all">Brand ▾</option>
                    {brands.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#6B7280] absolute right-2 top-2.5 pointer-events-none" />
                </div>

                {/* Type Filter */}
                <div className="relative">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    aria-label="Filter by Type"
                    className="appearance-none bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-[#D1D5DB] text-[12px] font-medium text-[#374151] rounded-lg pl-2.5 pr-7 py-1.5 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#16A34A]"
                  >
                    <option value="all">Type ▾</option>
                    {types.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#6B7280] absolute right-2 top-2.5 pointer-events-none" />
                </div>

                {/* Size Filter */}
                {sizes.length > 0 && (
                  <div className="relative">
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      aria-label="Filter by Size"
                      className="appearance-none bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-[#D1D5DB] text-[12px] font-medium text-[#374151] rounded-lg pl-2.5 pr-7 py-1.5 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#16A34A]"
                    >
                      <option value="all">Size ▾</option>
                      {sizes.map((s) => (
                        <option key={s as string} value={s as string}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#6B7280] absolute right-2 top-2.5 pointer-events-none" />
                  </div>
                )}

                {/* Colors Filter */}
                {colors.length > 0 && (
                  <div className="relative">
                    <select
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      aria-label="Filter by Color"
                      className="appearance-none bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-[#D1D5DB] text-[12px] font-medium text-[#374151] rounded-lg pl-2.5 pr-7 py-1.5 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#16A34A]"
                    >
                      <option value="all">Colors ▾</option>
                      {colors.map((c) => (
                        <option key={c as string} value={c as string}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#6B7280] absolute right-2 top-2.5 pointer-events-none" />
                  </div>
                )}

                {/* Price Filter */}
                <div className="relative">
                  <select
                    value={selectedPrice}
                    onChange={(e) => setSelectedPrice(e.target.value)}
                    aria-label="Filter by Price"
                    className="appearance-none bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-[#D1D5DB] text-[12px] font-medium text-[#374151] rounded-lg pl-2.5 pr-7 py-1.5 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#16A34A]"
                  >
                    <option value="all">Price ▾</option>
                    <option value="under-1500">Under ₹1,500</option>
                    <option value="1500-2000">₹1,500 - ₹2,000</option>
                    <option value="above-2000">Above ₹2,000</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#6B7280] absolute right-2 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Right Side: Product Count + Sort */}
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-[#6B7280]">{filteredProducts.length} products</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort products by"
                    className="appearance-none bg-transparent text-[12px] font-semibold text-[#111827] pr-5 py-1 cursor-pointer focus:outline-hidden"
                  >
                    <option value="relevance">Sort by: Relevance</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#6B7280] absolute right-0 top-1.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Product Cards Grid: 4 columns desktop / 2 columns mobile */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map((p) => {
                const key = `electrical::${p.title.toLowerCase()}`;
                const cartQty = cartItemByKey[key]?.quantity ?? 0;

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-xl border border-[#E5E7EB] hover:border-[#CBD5E1] p-3 flex flex-col justify-between transition-all duration-150 hover:shadow-md relative group"
                  >
                    {/* Top: Save Badge */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="bg-[#2563EB] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                        Save {p.discountPct}%
                      </span>
                    </div>

                    {/* Image Area */}
                    <div
                      onClick={() => {
                        const standardProduct: Product = {
                          id: p.id,
                          title: p.title,
                          description: `${p.brand} ${p.categoryTag} - ${p.specsPill || ""}`,
                          price: p.price,
                          mrp: p.mrp,
                          unit: p.unit,
                          image: p.image,
                          rating: p.rating ?? 4.8,
                          reviews: 140,
                          deliveryEta: "Today, in 60 Mins",
                          brand: p.brand,
                          materialTag: "Electrical",
                        };
                        if (onOpenDetail) onOpenDetail(standardProduct);
                        else setQuickDetailProduct(standardProduct);
                      }}
                      className="w-full aspect-square bg-[#F9FAFB] rounded-lg border border-[#F3F4F6] p-2 flex items-center justify-center cursor-pointer overflow-hidden group-hover:scale-[1.02] transition-transform"
                    >
                      <RealProductImage
                        product={p}
                        src={p.image}
                        alt={p.title}
                        title={p.title}
                        brand={p.brand}
                        category="wires-mcb-electrical"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Price and Details */}
                    <div className="mt-2.5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Price Row */}
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[16px] sm:text-[18px] font-black text-[#111827]">
                            ₹{p.price.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[11px] text-[#9CA3AF] line-through">
                            ₹{p.mrp.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[9px] text-[#9CA3AF]">incl. GST</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-[12.5px] font-bold text-[#1F2937] leading-[1.3] mt-1 line-clamp-2">
                          {p.title}
                        </h3>

                        {/* Cashback Strip */}
                        {p.cashbackPill && (
                          <div className="mt-1.5 bg-[#EAF7EE] text-[#0F5132] text-[9.5px] font-medium px-1.5 py-0.5 rounded-sm inline-block">
                            {p.cashbackPill}
                          </div>
                        )}

                        {/* Specs Pill */}
                        {p.specsPill && (
                          <div className="mt-1 text-[10.5px] text-[#4B5563]">
                            {p.specsPill}
                          </div>
                        )}

                        {/* Delivery Time */}
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-[#6B7280]">
                          <Clock className="w-3 h-3 text-[#16A34A]" />
                          <span>{p.deliveryTime}</span>
                        </div>
                      </div>

                      {/* Options Button / Action Stepper */}
                      <div className="mt-3 pt-2 border-t border-[#F3F4F6] flex items-center justify-between gap-2">
                        {p.optionsCount > 1 ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setVariantProduct(p);
                            }}
                            className="w-full text-center py-1.5 px-2 rounded-lg border border-[#16A34A] text-[#16A34A] hover:bg-[#EAF7EE] font-bold text-[12px] transition-colors"
                          >
                            {p.optionsCount} Options
                          </button>
                        ) : cartQty === 0 ? (
                          <button
                            type="button"
                            onClick={() => handleAddToCart(p)}
                            className="w-full text-center py-1.5 px-2 rounded-lg bg-[#16A34A] text-white hover:bg-[#15803D] font-bold text-[12px] transition-colors"
                          >
                            ADD
                          </button>
                        ) : (
                          <div className="w-full flex items-center justify-between bg-[#16A34A] text-white rounded-lg px-2 py-1 text-[12px] font-bold">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(p, cartQty - 1)}
                              className="px-2 py-0.5 hover:bg-black/10 rounded"
                            >
                              -
                            </button>
                            <span>{cartQty}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(p, cartQty + 1)}
                              className="px-2 py-0.5 hover:bg-black/10 rounded"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </main>
        </div>
      </div>

      {/* Variant Selector Sheet */}
      <VariantSelectorSheet
        product={variantProduct}
        isOpen={variantProduct !== null}
        onClose={() => setVariantProduct(null)}
      />

      {/* Quick Detail Modal Fallback */}
      {quickDetailProduct && (
        <ProductDetailModal
          product={quickDetailProduct}
          isOpen={true}
          onClose={() => setQuickDetailProduct(null)}
          onAddToCart={(p, qty) => {
            const count = qty ?? 1;
            for (let i = 0; i < count; i++) {
              addToCart.mutate({
                data: {
                  materialId: p.id,
                  quantity: 1,
                  name: p.title,
                  price: p.price,
                  unit: p.unit || "unit",
                  vendor: `${p.brand || "Electrical"} Official`,
                  category: "Electrical",
                },
              });
            }
          }}
        />
      )}
    </div>
  );
}
