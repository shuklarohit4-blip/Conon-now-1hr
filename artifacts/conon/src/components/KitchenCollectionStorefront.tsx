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
import type { Product } from "@/components/ProductCard";

export interface KitchenProduct {
  id: string;
  title: string;
  brand: string;
  categoryTag: string;
  type: string;
  size?: string;
  material?: string;
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
  isSoldOut?: boolean;
  rating?: number;
}

export const SS_SINKS_PRODUCTS: KitchenProduct[] = [
  {
    id: "futura-dura-ss-sink",
    title: "Futura Dura SS Sink",
    brand: "Futura",
    categoryTag: "SS Sinks",
    type: "Single Bowl",
    size: "24 × 18 Inch",
    material: "Stainless Steel 304",
    packSize: "1 Sink Unit",
    price: 3996,
    mrp: 4995,
    discountPct: 20,
    image: "/images/products/kitchen/futura-dura-ss-sink.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Top/flush/under",
    deliveryTime: "60 Mins",
    optionsCount: 3,
    materialTag: "Plumbing",
    unit: "1 Sink Unit",
    rating: 4.8,
  },
  {
    id: "futura-dura-ss-sink-drainboard",
    title: "Futura Dura SS Sink with Drainboard (37 × 18 × 8 Inch)",
    brand: "Futura",
    categoryTag: "SS Sinks",
    type: "Sink with Drainboard",
    size: "37 × 18 × 8 Inch",
    material: "Stainless Steel 304",
    packSize: "1 Sink Unit",
    price: 7452,
    mrp: 9315,
    discountPct: 20,
    image: "/images/products/kitchen/futura-dura-ss-sink-drainboard.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Waste Coupling",
    deliveryTime: "60 Mins",
    optionsCount: 1,
    materialTag: "Plumbing",
    unit: "1 Sink Unit",
    rating: 4.9,
  },
  {
    id: "futura-undermount-series-ss-sink",
    title: "Futura Undermount Series SS Sink, FS 503 (31 × 18 × 9 Inch)",
    brand: "Futura",
    categoryTag: "SS Sinks",
    type: "Undermount",
    size: "31 × 18 × 9 Inch",
    material: "Stainless Steel 304",
    packSize: "1 Sink Unit",
    price: 8760,
    mrp: 10950,
    discountPct: 20,
    image: "/images/products/kitchen/futura-undermount-series-ss-sink.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Granite & quartz",
    deliveryTime: "60 Mins",
    optionsCount: 1,
    materialTag: "Plumbing",
    unit: "1 Sink Unit",
    isSoldOut: true,
    rating: 4.9,
  },
  {
    id: "futura-hand-carved-series-ss-sink",
    title: "Futura Hand Carved Series SS Sink",
    brand: "Futura",
    categoryTag: "SS Sinks",
    type: "Hand Carved",
    size: "24 × 18 Inch",
    material: "Stainless Steel 304",
    packSize: "1 Sink Unit",
    price: 5200,
    mrp: 6500,
    discountPct: 20,
    image: "/images/products/kitchen/futura-hand-carved-series-ss-sink.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Under/top mount",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    materialTag: "Plumbing",
    unit: "1 Sink Unit",
    rating: 4.8,
  },
  {
    id: "futura-quadra-series-sink",
    title: "Futura Quadra Series Single Bowl Sink (24 × 18 × 10 Inch)",
    brand: "Futura",
    categoryTag: "SS Sinks",
    type: "Single Bowl",
    size: "24 × 18 Inch",
    material: "Stainless Steel 304",
    packSize: "1 Sink Unit",
    price: 6400,
    mrp: 8000,
    discountPct: 20,
    image: "/images/products/kitchen/futura-hand-carved-series-ss-sink.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "AISI 304 1.2mm",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    materialTag: "Plumbing",
    unit: "1 Sink Unit",
    rating: 4.9,
  },
  {
    id: "futura-double-bowl-drainer-sink",
    title: "Futura Double Bowl Stainless Steel Sink with Drainer (45 × 20 Inch)",
    brand: "Futura",
    categoryTag: "SS Sinks",
    type: "Double Bowl",
    size: "45 × 20 Inch",
    material: "Stainless Steel 304",
    packSize: "1 Sink Unit",
    price: 12450,
    mrp: 16600,
    discountPct: 25,
    image: "/images/products/kitchen/futura-dura-ss-sink-drainboard.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Double Bowl 10\" Deep",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    materialTag: "Plumbing",
    unit: "1 Sink Unit",
    rating: 4.9,
  },
];

export const QUARTZ_SINKS_PRODUCTS: KitchenProduct[] = [
  {
    id: "carysil-vivaldi-granite-sink",
    title: "Carysil Vivaldi Single Bowl Granite Quartz Kitchen Sink (Nera Black, 24 × 18 Inch)",
    brand: "Carysil",
    categoryTag: "Quartz Sinks",
    type: "Quartz Granite",
    size: "24 × 18 Inch",
    material: "Granite Composite / Quartz",
    packSize: "1 Sink Unit",
    price: 8990,
    mrp: 12500,
    discountPct: 28,
    image: "/images/subcategories/quartz-sinks-icon.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "German Technology Quartz",
    deliveryTime: "60 Mins",
    optionsCount: 3,
    materialTag: "Plumbing",
    unit: "1 Sink Unit",
    rating: 4.9,
  },
  {
    id: "franke-maris-quartz-sink",
    title: "Franke Maris Granite Quartz Kitchen Sink (Onyx Black, 32 × 20 Inch)",
    brand: "Franke",
    categoryTag: "Quartz Sinks",
    type: "Quartz Granite",
    size: "32 × 20 Inch",
    material: "Granite Composite / Quartz",
    packSize: "1 Sink Unit",
    price: 14500,
    mrp: 19800,
    discountPct: 26,
    image: "/images/subcategories/quartz-sinks-icon.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Sanitized Antibacterial",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    materialTag: "Plumbing",
    unit: "1 Sink Unit",
    rating: 4.9,
  },
];

export const FAUCETS_PRODUCTS: KitchenProduct[] = [
  {
    id: "jaquar-alive-high-arch-mixer",
    title: "Jaquar Alive High Arch Swivel Spout Kitchen Sink Mixer",
    brand: "Jaquar",
    categoryTag: "Faucets",
    type: "Mixer Faucet",
    material: "Solid Brass Chrome",
    packSize: "1 Unit",
    price: 4250,
    mrp: 5600,
    discountPct: 24,
    image: "/images/products/plumbing/jaquar-alive-basin-faucet.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "10-Year Jaquar Warranty",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    materialTag: "Plumbing",
    unit: "1 Unit",
    rating: 4.9,
  },
  {
    id: "kohler-malleco-pull-down-faucet",
    title: "Kohler Malleco Pull-Down Kitchen Sink Faucet with Soap Dispenser",
    brand: "Kohler",
    categoryTag: "Faucets",
    type: "Pull-Down Faucet",
    material: "Solid Brass Chrome",
    packSize: "1 Set",
    price: 9800,
    mrp: 13900,
    discountPct: 29,
    image: "/images/subcategories/faucets-icon.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Magnetic Docking Sprayhead",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    materialTag: "Plumbing",
    unit: "1 Set",
    rating: 4.9,
  },
];

export const KITCHEN_SUBCATEGORIES = [
  {
    id: "ss-sinks",
    name: "SS Sinks",
    count: 6,
    icon: "/images/subcategories/ss-sinks-icon.webp",
  },
  {
    id: "quartz-sinks",
    name: "Quartz Sinks",
    count: 4,
    icon: "/images/subcategories/quartz-sinks-icon.webp",
  },
  {
    id: "faucets",
    name: "Faucets",
    count: 6,
    icon: "/images/subcategories/faucets-icon.webp",
  },
  {
    id: "accessories-hardware",
    name: "Accessories & Hardware",
    count: 4,
    icon: "/images/subcategories/kitchen-accessories-hardware-icon.webp",
  },
];

interface KitchenCollectionStorefrontProps {
  onOpenDetail?: (product: Product) => void;
}

export function KitchenCollectionStorefront({ onOpenDetail }: KitchenCollectionStorefrontProps) {
  const [activeSubcat, setActiveSubcat] = useState("ss-sinks");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");
  const [selectedMaterial, setSelectedMaterial] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [quickDetailProduct, setQuickDetailProduct] = useState<Product | null>(null);

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
      case "quartz-sinks":
        return QUARTZ_SINKS_PRODUCTS;
      case "faucets":
        return FAUCETS_PRODUCTS;
      default:
        return SS_SINKS_PRODUCTS;
    }
  }, [activeSubcat]);

  const filteredProducts = useMemo(() => {
    return rawProducts
      .filter((p) => {
        if (selectedBrand !== "all" && p.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
        if (selectedType !== "all" && !p.type.toLowerCase().includes(selectedType.toLowerCase())) return false;
        if (selectedSize !== "all" && p.size && !p.size.toLowerCase().includes(selectedSize.toLowerCase())) return false;
        if (selectedMaterial !== "all" && p.material && !p.material.toLowerCase().includes(selectedMaterial.toLowerCase())) return false;

        if (selectedPrice === "under-5000" && p.price >= 5000) return false;
        if (selectedPrice === "5000-8000" && (p.price < 5000 || p.price > 8000)) return false;
        if (selectedPrice === "above-8000" && p.price <= 8000) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        return 0;
      });
  }, [rawProducts, selectedBrand, selectedType, selectedSize, selectedMaterial, selectedPrice, sortBy]);

  const brands = useMemo(() => Array.from(new Set(rawProducts.map((p) => p.brand))), [rawProducts]);
  const types = useMemo(() => Array.from(new Set(rawProducts.map((p) => p.type))), [rawProducts]);
  const sizes = useMemo(() => Array.from(new Set(rawProducts.map((p) => p.size).filter(Boolean))), [rawProducts]);
  const materials = useMemo(() => Array.from(new Set(rawProducts.map((p) => p.material).filter(Boolean))), [rawProducts]);

  const handleAddToCart = (p: KitchenProduct) => {
    if (p.isSoldOut) {
      toast.info("This item is currently out of stock.");
      return;
    }
    addToCart.mutate(
      {
        data: {
          materialId: p.id,
          quantity: 1,
          name: p.title,
          price: p.price,
          unit: p.unit || "Unit",
          vendor: `${p.brand} Official Distributor`,
          category: "Plumbing",
        },
      },
      {
        onSuccess: () => toast.success(`${p.title} added to cart!`),
        onError: () => toast.error("Could not add to cart. Please try again."),
      }
    );
  };

  const handleUpdateQty = (p: KitchenProduct, newQty: number) => {
    const key = `plumbing::${p.title.toLowerCase()}`;
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
          <a href="/categories?cat=kitchen-sinks-faucets" className="hover:text-[#111827] transition-colors">
            Kitchen Sinks & Faucets
          </a>
          <span>›</span>
          <span className="text-[#111827] font-semibold">
            {KITCHEN_SUBCATEGORIES.find((s) => s.id === activeSubcat)?.name ?? "SS Sinks"}
          </span>
        </nav>

        {/* Heading */}
        <div className="mb-4">
          <h1 className="text-[22px] sm:text-[28px] font-black text-[#111827] tracking-tight">
            {KITCHEN_SUBCATEGORIES.find((s) => s.id === activeSubcat)?.name ?? "SS Sinks"}
          </h1>
        </div>

        {/* Layout: Sidebar + Main Listing */}
        <div className="flex flex-col md:flex-row gap-5 items-start">
          {/* Left Subcategory Sidebar */}
          <aside className="w-full md:w-[220px] lg:w-[240px] shrink-0 bg-white rounded-xl border border-[#E5E7EB] p-2 shadow-xs">
            <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
              {KITCHEN_SUBCATEGORIES.map((subcat) => {
                const isActive = activeSubcat === subcat.id;
                return (
                  <button
                    key={subcat.id}
                    onClick={() => {
                      setActiveSubcat(subcat.id);
                      setSelectedBrand("all");
                      setSelectedType("all");
                      setSelectedSize("all");
                      setSelectedMaterial("all");
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
            {/* Filter Bar */}
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

                {/* Material Filter */}
                {materials.length > 0 && (
                  <div className="relative">
                    <select
                      value={selectedMaterial}
                      onChange={(e) => setSelectedMaterial(e.target.value)}
                      aria-label="Filter by Material"
                      className="appearance-none bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-[#D1D5DB] text-[12px] font-medium text-[#374151] rounded-lg pl-2.5 pr-7 py-1.5 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#16A34A]"
                    >
                      <option value="all">Material ▾</option>
                      {materials.map((m) => (
                        <option key={m as string} value={m as string}>{m}</option>
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
                    <option value="under-5000">Under ₹5,000</option>
                    <option value="5000-8000">₹5,000 - ₹8,000</option>
                    <option value="above-8000">Above ₹8,000</option>
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
                const key = `plumbing::${p.title.toLowerCase()}`;
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
                          originalPrice: p.mrp,
                          unit: p.unit,
                          image: p.image,
                          rating: p.rating ?? 4.8,
                          reviewsCount: 160,
                          inStock: !p.isSoldOut,
                          brand: p.brand,
                          materialTag: "Plumbing",
                        };
                        if (onOpenDetail) onOpenDetail(standardProduct);
                        else setQuickDetailProduct(standardProduct);
                      }}
                      className="w-full aspect-square bg-[#F9FAFB] rounded-lg border border-[#F3F4F6] p-2 flex items-center justify-center cursor-pointer overflow-hidden group-hover:scale-[1.02] transition-transform"
                    >
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-full h-full object-contain"
                        loading="lazy"
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

                      {/* Options Button / Action Stepper / Sold Out */}
                      <div className="mt-3 pt-2 border-t border-[#F3F4F6] flex items-center justify-between gap-2">
                        {p.isSoldOut ? (
                          <button
                            type="button"
                            disabled
                            className="w-full text-center py-1.5 px-2 rounded-lg bg-[#F3F4F6] text-[#9CA3AF] font-bold text-[12px] cursor-not-allowed"
                          >
                            Sold Out
                          </button>
                        ) : p.optionsCount > 1 ? (
                          <button
                            type="button"
                            onClick={() => {
                              const standardProduct: Product = {
                                id: p.id,
                                title: p.title,
                                description: `${p.brand} ${p.categoryTag}`,
                                price: p.price,
                                originalPrice: p.mrp,
                                unit: p.unit,
                                image: p.image,
                                rating: p.rating ?? 4.8,
                                reviewsCount: 160,
                                inStock: true,
                                brand: p.brand,
                                materialTag: "Plumbing",
                              };
                              if (onOpenDetail) onOpenDetail(standardProduct);
                              else setQuickDetailProduct(standardProduct);
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
                            Add
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

      {/* Quick Detail Modal Fallback */}
      {quickDetailProduct && (
        <ProductDetailModal
          product={quickDetailProduct}
          isOpen={true}
          onClose={() => setQuickDetailProduct(null)}
          onAddToCart={(p, qty) => {
            for (let i = 0; i < qty; i++) {
              addToCart.mutate({
                data: {
                  materialId: p.id,
                  quantity: 1,
                  name: p.title,
                  price: p.price,
                  unit: p.unit || "unit",
                  vendor: `${p.brand || "Kitchen"} Official`,
                  category: "Plumbing",
                },
              });
            }
          }}
        />
      )}
    </div>
  );
}
