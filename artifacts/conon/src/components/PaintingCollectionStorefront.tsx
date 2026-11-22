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

export interface PaintProduct {
  id: string;
  title: string;
  brand: string;
  brandLogo?: string;
  categoryTag: string;
  type: string;
  color?: string;
  finish?: string;
  packSize: string;
  price: number;
  pricePrefix?: string;
  mrp?: number;
  discountPct?: number;
  image: string;
  cashbackPill?: string;
  specsPill?: string;
  deliveryTime: string;
  optionsCount: number;
  materialTag: string;
  unit: string;
  rating?: number;
}

export const INTERIOR_EMULSIONS_PRODUCTS: PaintProduct[] = [
  {
    id: "asian-paints-tractor-uno-distemper-20kg",
    title: "Asian Paints Tractor Uno Acrylic Distemper Paint White, 20kg",
    brand: "Asian Paints",
    brandLogo: "/images/products/paint/asian-paints-logo.webp",
    categoryTag: "Distemper",
    type: "Tractor Uno Distemper",
    color: "Base White",
    finish: "Smooth Matte",
    packSize: "20 Kg Bucket",
    price: 945,
    mrp: 1575,
    discountPct: 40,
    image: "/images/products/paint/asian-paints-tractor-uno-distemper-20kg.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Recoat 3-4 hrs",
    deliveryTime: "60 Mins",
    optionsCount: 1,
    materialTag: "Paint",
    unit: "20 Kg Bucket",
    rating: 4.8,
  },
  {
    id: "asian-paints-tractor-emulsion-base-white",
    title: "Asian Paints Tractor Emulsion, Base White",
    brand: "Asian Paints",
    brandLogo: "/images/products/paint/asian-paints-logo.webp",
    categoryTag: "Interior Emulsion",
    type: "Tractor Emulsion",
    color: "Base White",
    finish: "Soft Sheen",
    packSize: "1 Litre",
    price: 187,
    mrp: 259,
    discountPct: 28,
    image: "/images/products/paint/asian-paints-tractor-emulsion-base-white.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Anti-fade",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    materialTag: "Paint",
    unit: "1 Litre",
    rating: 4.9,
  },
  {
    id: "asian-paints-tractor-emulsion-colour",
    title: "Asian Paints Tractor Emulsion, Colour",
    brand: "Asian Paints",
    brandLogo: "/images/products/paint/asian-paints-logo.webp",
    categoryTag: "Interior Emulsion",
    type: "Tractor Emulsion",
    color: "Custom Tint",
    finish: "Smooth Matte",
    packSize: "1 Litre",
    price: 187,
    pricePrefix: "onwards",
    image: "/images/products/paint/asian-paints-tractor-emulsion-colour-splash.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Smooth matte",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    materialTag: "Paint",
    unit: "1 Litre",
    rating: 4.9,
  },
  {
    id: "asian-paints-apcolite-premium-emulsion",
    title: "Asian Paints Premium Emulsion Paints, Base White",
    brand: "Asian Paints",
    brandLogo: "/images/products/paint/asian-paints-logo.webp",
    categoryTag: "Interior Emulsion",
    type: "Apcolite Premium",
    color: "Base White",
    finish: "Rich Matt",
    packSize: "1 Litre",
    price: 348,
    mrp: 490,
    discountPct: 29,
    image: "/images/products/paint/asian-paints-apcolite-premium-emulsion.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Low VOC",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    materialTag: "Paint",
    unit: "1 Litre",
    rating: 4.8,
  },
  {
    id: "asian-paints-royale-luxury-emulsion",
    title: "Asian Paints Royale Luxury Emulsion (Shyne / Matt), Base White",
    brand: "Asian Paints",
    brandLogo: "/images/products/paint/asian-paints-logo.webp",
    categoryTag: "Luxury Emulsion",
    type: "Royale Luxury",
    color: "Base White",
    finish: "Teflon Surface Protector",
    packSize: "1 Litre",
    price: 680,
    mrp: 890,
    discountPct: 24,
    image: "/images/products/paint/royale-luxury-emulsion-20l.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Washable Stain Resistant",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    materialTag: "Paint",
    unit: "1 Litre",
    rating: 5.0,
  },
  {
    id: "berger-easy-clean-luxury-emulsion",
    title: "Berger Easy Clean Luxury Interior Emulsion (Cross-Linking Polymers)",
    brand: "Berger",
    categoryTag: "Luxury Emulsion",
    type: "Easy Clean",
    color: "Base White",
    finish: "Rich Sheen",
    packSize: "1 Litre",
    price: 520,
    mrp: 710,
    discountPct: 27,
    image: "/images/products/paint/berger-easy-clean-20l.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Cross-Linking Washable",
    deliveryTime: "60 Mins",
    optionsCount: 3,
    materialTag: "Paint",
    unit: "1 Litre",
    rating: 4.8,
  },
  {
    id: "nerolac-beauty-smooth-emulsion",
    title: "Nerolac Beauty Smooth Finish Interior Emulsion Paint",
    brand: "Nerolac",
    categoryTag: "Interior Emulsion",
    type: "Beauty Smooth",
    color: "Base White",
    finish: "Smooth Matt",
    packSize: "1 Litre",
    price: 210,
    mrp: 290,
    discountPct: 28,
    image: "/images/products/paint/nerolac-beauty-smooth-20l.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Anti-Fungal Protection",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    materialTag: "Paint",
    unit: "1 Litre",
    rating: 4.7,
  },
  {
    id: "dulux-velvet-touch-pearl-glo",
    title: "Dulux Velvet Touch Pearl Glo Luxury Emulsion Paint",
    brand: "Dulux",
    categoryTag: "Luxury Emulsion",
    type: "Velvet Touch",
    color: "Base White",
    finish: "Glow Sheen",
    packSize: "1 Litre",
    price: 790,
    mrp: 1050,
    discountPct: 25,
    image: "/images/products/paint/dulux-velvet-touch-platinum-10l.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Micro-Pearl Glow",
    deliveryTime: "60 Mins",
    optionsCount: 3,
    materialTag: "Paint",
    unit: "1 Litre",
    rating: 4.9,
  },
  {
    id: "asian-paints-tractor-distemper-10kg",
    title: "Asian Paints Tractor Acrylic Distemper 10kg Bucket",
    brand: "Asian Paints",
    brandLogo: "/images/products/paint/asian-paints-logo.webp",
    categoryTag: "Distemper",
    type: "Tractor Distemper",
    color: "Base White",
    finish: "Matte",
    packSize: "10 Kg Bucket",
    price: 495,
    mrp: 780,
    discountPct: 36,
    image: "/images/products/paint/tractor-distemper-20kg.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Higher Coverage",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    materialTag: "Paint",
    unit: "10 Kg Bucket",
    rating: 4.8,
  },
];

export const EXTERIOR_EMULSIONS_PRODUCTS: PaintProduct[] = [
  {
    id: "asian-paints-apex-exterior-emulsion",
    title: "Asian Paints Apex Weatherproof Exterior Emulsion (20L Dust & Algae Guard)",
    brand: "Asian Paints",
    brandLogo: "/images/products/paint/asian-paints-logo.webp",
    categoryTag: "Exterior Emulsion",
    type: "Apex Exterior",
    color: "Base White",
    finish: "Weather Guard",
    packSize: "20 Litre Bucket",
    price: 5950,
    mrp: 8200,
    discountPct: 27,
    image: "/images/products/paint/asian-paints-apex-weatherproof-exterior-emulsion-20l-dust-algae-guard.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "5-Year Performance Warranty",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    materialTag: "Paint",
    unit: "20 Litre Bucket",
    rating: 4.9,
  },
  {
    id: "asian-paints-apex-ultima-exterior",
    title: "Asian Paints Apex Ultima Advanced Anti-Dust Exterior Emulsion",
    brand: "Asian Paints",
    brandLogo: "/images/products/paint/asian-paints-logo.webp",
    categoryTag: "Exterior Emulsion",
    type: "Apex Ultima",
    color: "Base White",
    finish: "Dirt Pick-up Resistance",
    packSize: "20 Litre Bucket",
    price: 8400,
    mrp: 11200,
    discountPct: 25,
    image: "/images/products/paint/apex-ultima-exterior-20l.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "7-Year Ultima Warranty",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    materialTag: "Paint",
    unit: "20 Litre Bucket",
    rating: 5.0,
  },
];

export const PUTTY_PRIMER_PRODUCTS: PaintProduct[] = [
  {
    id: "birla-white-wallcare-putty-40kg",
    title: "Birla White WallCare Waterproof Putty (40kg Bag)",
    brand: "Birla White",
    categoryTag: "Putty & Primer",
    type: "Wall Putty",
    color: "Snow White",
    finish: "Super Smooth",
    packSize: "40 Kg Bag",
    price: 980,
    mrp: 1250,
    discountPct: 22,
    image: "/images/products/paint/wallcare-putty-40kg.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "HP Polymers Waterproof",
    deliveryTime: "60 Mins",
    optionsCount: 3,
    materialTag: "Paint",
    unit: "40 Kg Bag",
    rating: 4.9,
  },
  {
    id: "asian-paints-decoprime-wall-primer",
    title: "Asian Paints TruCare DecoPrime Wall Primer (Water Thinnable, 20L)",
    brand: "Asian Paints",
    brandLogo: "/images/products/paint/asian-paints-logo.webp",
    categoryTag: "Putty & Primer",
    type: "Wall Primer",
    color: "White",
    finish: "High Opacity Primer",
    packSize: "20 Litre Bucket",
    price: 2150,
    mrp: 2850,
    discountPct: 25,
    image: "/images/products/paint/asian-cement-primer-20l.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Superior Sealing",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    materialTag: "Paint",
    unit: "20 Litre Bucket",
    rating: 4.8,
  },
];

export const PAINTING_SUBCATEGORIES = [
  {
    id: "interior-emulsions",
    name: "Interior Emulsions",
    count: 9,
    icon: "/images/subcategories/interior-emulsions-icon.webp",
  },
  {
    id: "exterior-emulsions",
    name: "Exterior Emulsions",
    count: 6,
    icon: "/images/subcategories/exterior-emulsions-icon.webp",
  },
  {
    id: "putty-primer",
    name: "Putty & Primer",
    count: 8,
    icon: "/images/subcategories/putty-primer-icon.webp",
  },
  {
    id: "enamels-polish",
    name: "Enamels & Polish",
    count: 5,
    icon: "/images/subcategories/enamels-polish-icon.webp",
  },
  {
    id: "painting-tools-hardware",
    name: "Painting Tools & Hardware",
    count: 6,
    icon: "/images/subcategories/painting-tools-hardware-icon.webp",
  },
];

interface PaintingCollectionStorefrontProps {
  onOpenDetail?: (product: Product) => void;
}

export function PaintingCollectionStorefront({ onOpenDetail }: PaintingCollectionStorefrontProps) {
  const [activeSubcat, setActiveSubcat] = useState("interior-emulsions");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedColor, setSelectedColor] = useState("all");
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
      case "exterior-emulsions":
        return EXTERIOR_EMULSIONS_PRODUCTS;
      case "putty-primer":
        return PUTTY_PRIMER_PRODUCTS;
      default:
        return INTERIOR_EMULSIONS_PRODUCTS;
    }
  }, [activeSubcat]);

  const filteredProducts = useMemo(() => {
    return rawProducts
      .filter((p) => {
        if (selectedBrand !== "all" && p.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
        if (selectedType !== "all" && !p.type.toLowerCase().includes(selectedType.toLowerCase())) return false;
        if (selectedColor !== "all" && p.color && !p.color.toLowerCase().includes(selectedColor.toLowerCase())) return false;

        if (selectedPrice === "under-500" && p.price >= 500) return false;
        if (selectedPrice === "500-1500" && (p.price < 500 || p.price > 1500)) return false;
        if (selectedPrice === "above-1500" && p.price <= 1500) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        return 0;
      });
  }, [rawProducts, selectedBrand, selectedType, selectedColor, selectedPrice, sortBy]);

  const brands = useMemo(() => Array.from(new Set(rawProducts.map((p) => p.brand))), [rawProducts]);
  const types = useMemo(() => Array.from(new Set(rawProducts.map((p) => p.type))), [rawProducts]);
  const colors = useMemo(() => Array.from(new Set(rawProducts.map((p) => p.color).filter(Boolean))), [rawProducts]);

  const handleAddToCart = (p: PaintProduct) => {
    addToCart.mutate(
      {
        data: {
          materialId: p.id,
          quantity: 1,
          name: p.title,
          price: p.price,
          unit: p.unit || "Unit",
          vendor: `${p.brand} Official Distributor`,
          category: "Paint",
        },
      },
      {
        onSuccess: () => toast.success(`${p.title} added to cart!`),
        onError: () => toast.error("Could not add to cart. Please try again."),
      }
    );
  };

  const handleUpdateQty = (p: PaintProduct, newQty: number) => {
    const key = `paint::${p.title.toLowerCase()}`;
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
          <a href="/categories?cat=painting" className="hover:text-[#111827] transition-colors">
            Painting
          </a>
          <span>›</span>
          <span className="text-[#111827] font-semibold">
            {PAINTING_SUBCATEGORIES.find((s) => s.id === activeSubcat)?.name ?? "Interior Emulsions"}
          </span>
        </nav>

        {/* Heading */}
        <div className="mb-4">
          <h1 className="text-[22px] sm:text-[28px] font-black text-[#111827] tracking-tight">
            {PAINTING_SUBCATEGORIES.find((s) => s.id === activeSubcat)?.name ?? "Interior Emulsions"}
          </h1>
        </div>

        {/* Layout: Sidebar + Main Listing */}
        <div className="flex flex-col md:flex-row gap-5 items-start">
          {/* Left Subcategory Sidebar */}
          <aside className="w-full md:w-[220px] lg:w-[240px] shrink-0 bg-white rounded-xl border border-[#E5E7EB] p-2 shadow-xs">
            <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
              {PAINTING_SUBCATEGORIES.map((subcat) => {
                const isActive = activeSubcat === subcat.id;
                return (
                  <button
                    key={subcat.id}
                    onClick={() => {
                      setActiveSubcat(subcat.id);
                      setSelectedBrand("all");
                      setSelectedType("all");
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
                    <option value="under-500">Under ₹500</option>
                    <option value="500-1500">₹500 - ₹1,500</option>
                    <option value="above-1500">Above ₹1,500</option>
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
                const key = `paint::${p.title.toLowerCase()}`;
                const cartQty = cartItemByKey[key]?.quantity ?? 0;

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-xl border border-[#E5E7EB] hover:border-[#CBD5E1] p-3 flex flex-col justify-between transition-all duration-150 hover:shadow-md relative group"
                  >
                    {/* Top Row: Save Badge on Left, Asian Paints Logo on Right */}
                    <div className="flex items-center justify-between mb-1.5">
                      {p.discountPct ? (
                        <span className="bg-[#2563EB] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                          Save {p.discountPct}%
                        </span>
                      ) : (
                        <span />
                      )}

                      {p.brandLogo && (
                        <img src={p.brandLogo} alt={p.brand} className="h-4 object-contain" />
                      )}
                    </div>

                    {/* Image Area */}
                    <div
                      onClick={() => {
                        const standardProduct: Product = {
                          id: p.id,
                          title: p.title,
                          description: `${p.brand} ${p.categoryTag} - ${p.specsPill || ""}`,
                          price: p.price,
                          originalPrice: p.mrp || p.price,
                          unit: p.unit,
                          image: p.image,
                          rating: p.rating ?? 4.8,
                          reviewsCount: 190,
                          inStock: true,
                          brand: p.brand,
                          materialTag: "Paint",
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
                          {p.pricePrefix ? (
                            <span className="text-[11px] text-[#6B7280] font-medium">{p.pricePrefix}</span>
                          ) : p.mrp ? (
                            <>
                              <span className="text-[11px] text-[#9CA3AF] line-through">
                                ₹{p.mrp.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[9px] text-[#9CA3AF]">incl. GST</span>
                            </>
                          ) : null}
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
                                originalPrice: p.mrp || p.price,
                                unit: p.unit,
                                image: p.image,
                                rating: p.rating ?? 4.8,
                                reviewsCount: 190,
                                inStock: true,
                                brand: p.brand,
                                materialTag: "Paint",
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
                  vendor: `${p.brand || "Paint"} Official`,
                  category: "Paint",
                },
              });
            }
          }}
        />
      )}
    </div>
  );
}
