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

export interface LockProduct {
  id: string;
  title: string;
  brand: string;
  categoryTag: string;
  type: string;
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

export const MECHANICAL_LOCKS_PRODUCTS: LockProduct[] = [
  {
    id: "europa-main-door-lock-antique-brass",
    title: "Europa Main Door Lock Antique Brass/Nickel Steel, Single Door Lock",
    brand: "Europa",
    categoryTag: "Rim Lock",
    type: "Single Door Antique Brass",
    packSize: "1 Lock Set",
    price: 2458,
    mrp: 3235,
    discountPct: 24,
    image: "/images/products/locks/europa-antique-brass-lock.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "15-yr warranty",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    materialTag: "Hardware",
    unit: "1 Lock Set",
    rating: 4.9,
  },
  {
    id: "godrej-tribolt-ultra-lock",
    title: "Godrej Tribolt Ultra Locks",
    brand: "Godrej",
    categoryTag: "Tribolt Rim Lock",
    type: "Ultra Tribolt",
    packSize: "1 Lock Set",
    price: 3361,
    mrp: 3740,
    discountPct: 10,
    image: "/images/products/locks/godrej-tribolt-ultra-lock.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Anti-Lockout",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    materialTag: "Hardware",
    unit: "1 Lock Set",
    rating: 4.9,
  },
  {
    id: "europa-hexabolt-h341-lock",
    title: "Europa Main Door Lock Hexabolt H341 AB/SN, Single Door",
    brand: "Europa",
    categoryTag: "Hexabolt Lock",
    type: "H341 Hexabolt",
    packSize: "1 Lock Set",
    price: 4282,
    mrp: 5620,
    discountPct: 24,
    image: "/images/products/locks/europa-hexabolt-h341-lock.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "₹3 lakh cover",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    materialTag: "Hardware",
    unit: "1 Lock Set",
    rating: 4.9,
  },
  {
    id: "europa-jemmy-proof-j320-lock",
    title: "Europa Jemmy Proof Lock - J320, 14-Pin Dimple Key, 2 Deadbolts, Single, Double and Sliding Doors",
    brand: "Europa",
    categoryTag: "Jemmy Proof",
    type: "J320 Dimple Key",
    packSize: "1 Lock Set",
    price: 2016,
    mrp: 2670,
    discountPct: 24,
    image: "/images/products/locks/europa-jemmy-proof-j320-lock.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Sliding/Folding",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    materialTag: "Hardware",
    unit: "1 Lock Set",
    rating: 4.8,
  },
  {
    id: "godrej-navtal-brass-padlock",
    title: "Godrej Nav-Tal 8 Levers Brass Padlock (70 mm)",
    brand: "Godrej",
    categoryTag: "Padlock",
    type: "Nav-Tal 8 Levers",
    packSize: "1 Piece",
    price: 615,
    mrp: 750,
    discountPct: 18,
    image: "/images/products/locks/godrej-tribolt-ultra-lock.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Hardened Shackle",
    deliveryTime: "60 Mins",
    optionsCount: 3,
    materialTag: "Hardware",
    unit: "1 Piece",
    rating: 4.9,
  },
  {
    id: "dorset-cylindrical-knob-lock",
    title: "Dorset Stainless Steel Cylindrical Knob Lock with Computer Key",
    brand: "Dorset",
    categoryTag: "Cylindrical Lock",
    type: "Knob Lock SS",
    packSize: "1 Lock Set",
    price: 840,
    mrp: 1150,
    discountPct: 27,
    image: "/images/products/locks/europa-antique-brass-lock.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Tubular Latch",
    deliveryTime: "60 Mins",
    optionsCount: 3,
    materialTag: "Hardware",
    unit: "1 Lock Set",
    rating: 4.7,
  },
];

export const LOCKS_SUBCATEGORIES = [
  {
    id: "mechanical-locks",
    name: "Mechanical Locks",
    count: 8,
    icon: "/images/subcategories/mechanical-locks-icon.webp",
  },
  {
    id: "glass-door-hardware",
    name: "Glass Door Hardware",
    count: 5,
    icon: "/images/subcategories/glass-door-hardware-icon.webp",
  },
  {
    id: "cylindrical-locks",
    name: "Cylindrical Locks",
    count: 6,
    icon: "/images/subcategories/cylindrical-locks-icon.webp",
  },
  {
    id: "wooden-door-hardware",
    name: "Wooden Door Hardware",
    count: 6,
    icon: "/images/subcategories/wooden-door-hardware-icon.webp",
  },
];

interface LocksCollectionStorefrontProps {
  onOpenDetail?: (product: Product) => void;
}

export function LocksCollectionStorefront({ onOpenDetail }: LocksCollectionStorefrontProps) {
  const [activeSubcat, setActiveSubcat] = useState("mechanical-locks");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
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

  const rawProducts = MECHANICAL_LOCKS_PRODUCTS;

  const filteredProducts = useMemo(() => {
    return rawProducts
      .filter((p) => {
        if (selectedBrand !== "all" && p.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
        if (selectedType !== "all" && !p.type.toLowerCase().includes(selectedType.toLowerCase())) return false;
        if (selectedPrice === "under-2500" && p.price >= 2500) return false;
        if (selectedPrice === "2500-3500" && (p.price < 2500 || p.price > 3500)) return false;
        if (selectedPrice === "above-3500" && p.price <= 3500) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        return 0;
      });
  }, [rawProducts, selectedBrand, selectedType, selectedPrice, sortBy]);

  const brands = useMemo(() => Array.from(new Set(rawProducts.map((p) => p.brand))), [rawProducts]);
  const types = useMemo(() => Array.from(new Set(rawProducts.map((p) => p.type))), [rawProducts]);

  const handleAddToCart = (p: LockProduct) => {
    addToCart.mutate(
      {
        data: {
          materialId: p.id,
          quantity: 1,
          name: p.title,
          price: p.price,
          unit: p.unit || "Lock Set",
          vendor: `${p.brand} Official Distributor`,
          category: "Hardware",
        },
      },
      {
        onSuccess: () => toast.success(`${p.title} added to cart!`),
        onError: () => toast.error("Could not add to cart. Please try again."),
      }
    );
  };

  const handleUpdateQty = (p: LockProduct, newQty: number) => {
    const key = `hardware::${p.title.toLowerCase()}`;
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
          <a href="/categories?cat=door-hardware-locks" className="hover:text-[#111827] transition-colors">
            Door Hardware & Locks
          </a>
          <span>›</span>
          <span className="text-[#111827] font-semibold">
            {LOCKS_SUBCATEGORIES.find((s) => s.id === activeSubcat)?.name ?? "Mechanical Locks"}
          </span>
        </nav>

        {/* Heading */}
        <div className="mb-4">
          <h1 className="text-[22px] sm:text-[28px] font-black text-[#111827] tracking-tight">
            {LOCKS_SUBCATEGORIES.find((s) => s.id === activeSubcat)?.name ?? "Mechanical Locks"}
          </h1>
        </div>

        {/* Layout: Sidebar + Main Listing */}
        <div className="flex flex-col md:flex-row gap-5 items-start">
          {/* Left Subcategory Sidebar */}
          <aside className="w-full md:w-[220px] lg:w-[240px] shrink-0 bg-white rounded-xl border border-[#E5E7EB] p-2 shadow-xs">
            <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
              {LOCKS_SUBCATEGORIES.map((subcat) => {
                const isActive = activeSubcat === subcat.id;
                return (
                  <button
                    key={subcat.id}
                    onClick={() => {
                      setActiveSubcat(subcat.id);
                      setSelectedBrand("all");
                      setSelectedType("all");
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

                {/* Price Filter */}
                <div className="relative">
                  <select
                    value={selectedPrice}
                    onChange={(e) => setSelectedPrice(e.target.value)}
                    aria-label="Filter by Price"
                    className="appearance-none bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-[#D1D5DB] text-[12px] font-medium text-[#374151] rounded-lg pl-2.5 pr-7 py-1.5 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#16A34A]"
                  >
                    <option value="all">Price ▾</option>
                    <option value="under-2500">Under ₹2,500</option>
                    <option value="2500-3500">₹2,500 - ₹3,500</option>
                    <option value="above-3500">Above ₹3,500</option>
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
                const key = `hardware::${p.title.toLowerCase()}`;
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
                          rating: p.rating ?? 4.9,
                          reviews: 180,
                          deliveryEta: "Today, in 60 Mins",
                          brand: p.brand,
                          materialTag: "Hardware",
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

                      {/* Options Button / Action Stepper */}
                      <div className="mt-3 pt-2 border-t border-[#F3F4F6] flex items-center justify-between gap-2">
                        {p.optionsCount > 1 ? (
                          <button
                            type="button"
                            onClick={() => {
                              const standardProduct: Product = {
                                id: p.id,
                                title: p.title,
                                description: `${p.brand} ${p.categoryTag}`,
                                price: p.price,
                                mrp: p.mrp,
                                unit: p.unit,
                                image: p.image,
                                rating: p.rating ?? 4.9,
                                reviews: 180,
                                deliveryEta: "Today, in 60 Mins",
                                brand: p.brand,
                                materialTag: "Hardware",
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
                  vendor: `${p.brand || "Hardware"} Official`,
                  category: "Hardware",
                },
              });
            }
          }}
        />
      )}
    </div>
  );
}
