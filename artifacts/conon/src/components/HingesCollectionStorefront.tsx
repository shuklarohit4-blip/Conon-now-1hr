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
import { useProductMediaVault } from "@/context/ProductMediaVaultContext";
import type { Product } from "@/components/ProductCard";
import { RealProductImage } from "@/components/RealProductImage";

export interface HardwareProduct {
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

export const HINGES_PRODUCTS: HardwareProduct[] = [
  {
    id: "ebco-soft-close-hinges-set",
    title: "Ebco Soft Close Hinges, 1 Set (2 Nos)",
    brand: "Ebco",
    categoryTag: "Soft Close Hinges",
    type: "Concealed 3D",
    packSize: "1 Set (2 Nos)",
    price: 146,
    mrp: 234,
    discountPct: 38,
    image: "",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Nickel-plated",
    deliveryTime: "60 Mins",
    optionsCount: 3,
    materialTag: "Hardware",
    unit: "1 Set (2 Nos)",
    rating: 4.8,
  },
  {
    id: "hettich-onsys-4447i-hinges-set",
    title: "Hettich Onsys 4447i Soft Close Hinges, 1 Set (2 Nos)",
    brand: "Hettich",
    categoryTag: "German Soft Close",
    type: "Onsys 4447i",
    packSize: "1 Set (2 Nos)",
    price: 222,
    mrp: 430,
    discountPct: 48,
    image: "",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "10-yr Warranty",
    deliveryTime: "60 Mins",
    optionsCount: 3,
    materialTag: "Hardware",
    unit: "1 Set (2 Nos)",
    rating: 4.9,
  },
  {
    id: "ebco-slip-on-hinge-regular",
    title: "Ebco Slip On Hinge, Regular Close, 1 Set (2 Nos)",
    brand: "Ebco",
    categoryTag: "Regular Close",
    type: "Euro Slip-On",
    packSize: "1 Set (2 Nos)",
    price: 69,
    mrp: 112,
    discountPct: 38,
    image: "",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Nickel-plated",
    deliveryTime: "60 Mins",
    optionsCount: 3,
    materialTag: "Hardware",
    unit: "1 Set (2 Nos)",
    rating: 4.7,
  },
  {
    id: "premium-ss-butt-hinges",
    title: "Premium Door Butt Hinges, Stainless Steel",
    brand: "Generic",
    categoryTag: "Butt Hinges",
    type: "Stainless Steel 304",
    packSize: "1 Set (2 Nos)",
    price: 34,
    mrp: 57,
    discountPct: 40,
    image: "",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: '3" & 5" sizes',
    deliveryTime: "60 Mins",
    optionsCount: 8,
    materialTag: "Hardware",
    unit: "1 Set (2 Nos)",
    rating: 4.8,
  },
  {
    id: "hafele-metalla-auto-hinge",
    title: "Hafele Metalla 310 Full Overlay Auto Hinge (Pair)",
    brand: "Hafele",
    categoryTag: "Concealed Auto Hinge",
    type: "Metalla 310",
    packSize: "1 Set (2 Nos)",
    price: 195,
    mrp: 290,
    discountPct: 32,
    image: "",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Clip-on 110°",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    materialTag: "Hardware",
    unit: "1 Set (2 Nos)",
    rating: 4.9,
  },
  {
    id: "godrej-ss-heavy-butt-hinge",
    title: "Godrej Ultra SS 304 Heavy Duty Bearing Butt Hinge (4 Inch)",
    brand: "Godrej",
    categoryTag: "Heavy Butt Hinge",
    type: "Ball Bearing",
    packSize: "1 Pair",
    price: 245,
    mrp: 320,
    discountPct: 23,
    image: "",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Ball Bearing 4\"",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    materialTag: "Hardware",
    unit: "1 Pair",
    rating: 4.9,
  },
];

export const DRAWER_CHANNELS_PRODUCTS: HardwareProduct[] = [
  {
    id: "hettich-quadro-soft-close-channel",
    title: "Hettich Quadro V6 Soft Close Undermount Drawer Slides (18 Inch)",
    brand: "Hettich",
    categoryTag: "Telescopic Channel",
    type: "Undermount Quadro",
    packSize: "1 Set",
    price: 1250,
    mrp: 1650,
    discountPct: 24,
    image: "",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "30 Kg Load Capacity",
    deliveryTime: "60 Mins",
    optionsCount: 5,
    materialTag: "Hardware",
    unit: "1 Set",
    rating: 4.9,
  },
  {
    id: "ebco-telescopic-ball-bearing-slide",
    title: "Ebco Heavy Duty Zinc Telescopic Ball Bearing Drawer Slides (20 Inch)",
    brand: "Ebco",
    categoryTag: "Telescopic Channel",
    type: "Ball Bearing",
    packSize: "1 Pair",
    price: 380,
    mrp: 520,
    discountPct: 27,
    image: "",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "45 Kg Rated",
    deliveryTime: "60 Mins",
    optionsCount: 6,
    materialTag: "Hardware",
    unit: "1 Pair",
    rating: 4.8,
  },
];

export const HINGES_SUBCATEGORIES = [
  {
    id: "hinges",
    name: "Hinges",
    count: 9,
    icon: "/images/subcategories/hinges-icon.webp",
  },
  {
    id: "drawer-channels",
    name: "Drawer & Wardrobe Channels",
    count: 8,
    icon: "/images/subcategories/drawer-channels-icon.webp",
  },
  {
    id: "handles-profiles",
    name: "Handles, Profiles & Drawer Locks",
    count: 6,
    icon: "/images/subcategories/handles-profiles-icon.webp",
  },
  {
    id: "wardrobe-pullouts",
    name: "Wardrobe Pullouts & Accessories",
    count: 5,
    icon: "/images/subcategories/wardrobe-pullouts-icon.webp",
  },
  {
    id: "hydraulics",
    name: "Bed & Cabinet Hydraulics",
    count: 4,
    icon: "/images/subcategories/hydraulics-icon.webp",
  },
  {
    id: "grills-accessories",
    name: "Grills & Accessories",
    count: 4,
    icon: "/images/subcategories/grills-accessories-icon.webp",
  },
];

interface HingesCollectionStorefrontProps {
  onOpenDetail?: (product: Product) => void;
}

export function HingesCollectionStorefront({ onOpenDetail }: HingesCollectionStorefrontProps) {
  const [activeSubcat, setActiveSubcat] = useState("hinges");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [quickDetailProduct, setQuickDetailProduct] = useState<Product | null>(null);

  const qc = useQueryClient();
  const { resolveProduct } = useProductMediaVault();
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
      case "drawer-channels":
        return DRAWER_CHANNELS_PRODUCTS;
      default:
        return HINGES_PRODUCTS;
    }
  }, [activeSubcat]);

  const filteredProducts = useMemo(() => {
    return rawProducts
      .map((p) => resolveProduct(p))
      .filter((p) => {
        if (selectedBrand !== "all" && p.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
        if (selectedType !== "all" && !p.type.toLowerCase().includes(selectedType.toLowerCase())) return false;
        if (selectedPrice === "under-100" && p.price >= 100) return false;
        if (selectedPrice === "100-200" && (p.price < 100 || p.price > 200)) return false;
        if (selectedPrice === "above-200" && p.price <= 200) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        return 0;
      });
  }, [rawProducts, selectedBrand, selectedType, selectedPrice, sortBy, resolveProduct]);

  const brands = useMemo(() => Array.from(new Set(rawProducts.map((p) => p.brand))), [rawProducts]);
  const types = useMemo(() => Array.from(new Set(rawProducts.map((p) => p.type))), [rawProducts]);

  const handleAddToCart = (p: HardwareProduct) => {
    addToCart.mutate(
      {
        data: {
          materialId: p.id,
          quantity: 1,
          name: p.title,
          price: p.price,
          unit: p.unit || "Set",
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

  const handleUpdateQty = (p: HardwareProduct, newQty: number) => {
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
          <a href="/categories?cat=furniture-hardware" className="hover:text-[#111827] transition-colors">
            Furniture, Wardrobe & Bed Hardware
          </a>
          <span>›</span>
          <span className="text-[#111827] font-semibold">
            {HINGES_SUBCATEGORIES.find((s) => s.id === activeSubcat)?.name ?? "Hinges"}
          </span>
        </nav>

        {/* Heading */}
        <div className="mb-4">
          <h1 className="text-[22px] sm:text-[28px] font-black text-[#111827] tracking-tight">
            {HINGES_SUBCATEGORIES.find((s) => s.id === activeSubcat)?.name ?? "Hinges"}
          </h1>
        </div>

        {/* Layout: Sidebar + Main Listing */}
        <div className="flex flex-col md:flex-row gap-5 items-start">
          {/* Left Subcategory Sidebar */}
          <aside className="w-full md:w-[220px] lg:w-[240px] shrink-0 bg-white rounded-xl border border-[#E5E7EB] p-2 shadow-xs">
            <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
              {HINGES_SUBCATEGORIES.map((subcat) => {
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
                    <option value="under-100">Under ₹100</option>
                    <option value="100-200">₹100 - ₹200</option>
                    <option value="above-200">Above ₹200</option>
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
                          rating: p.rating ?? 4.8,
                          reviews: 120,
                          deliveryEta: "Today, in 60 Mins",
                          brand: p.brand,
                          materialTag: "Hardware",
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
                        category="furniture-wardrobe-bed-hardware"
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
                            onClick={() => {
                              const standardProduct: Product = {
                                id: p.id,
                                title: p.title,
                                description: `${p.brand} ${p.categoryTag}`,
                                price: p.price,
                                mrp: p.mrp,
                                unit: p.unit,
                                image: p.image,
                                rating: p.rating ?? 4.8,
                                reviews: 120,
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
