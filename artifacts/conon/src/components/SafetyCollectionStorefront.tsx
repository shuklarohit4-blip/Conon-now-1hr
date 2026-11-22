import React, { useState, useMemo } from "react";
import { Clock, ShieldCheck, ChevronRight } from "lucide-react";
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

export interface SafetyProduct {
  id: string;
  title: string;
  brand: string;
  subcategory: "shoes-gloves" | "hi-vis-jackets" | "harness-more" | "helmets-goggles";
  type: string;
  size?: string;
  price: number;
  mrp: number;
  discountPct: number;
  image: string;
  spec?: string;
  deliveryTime: string;
  optionsCount?: number;
  dotsCount: number;
  unit: string;
}

export const SAFETY_PRODUCTS: SafetyProduct[] = [
  // ── Shoes & Gloves (Exact 1:1 match with hero screenshot) ──
  {
    id: "pitbull-mirage-low-ankle-steel-toe-safety-shoes",
    title: "Pitbull Mirage Low Ankle Steel Toe Safety Shoes",
    brand: "Pitbull",
    subcategory: "shoes-gloves",
    type: "Safety Shoes",
    size: "Size 8",
    price: 490,
    mrp: 490,
    discountPct: 0,
    image: "/images/products/safety/pitbull-mirage-low-ankle-steel-toe-safety-shoes.webp",
    spec: "Anti-slip",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Pair",
  },
  {
    id: "hillson-dragon-steel-toe-gumboots-15-high",
    title: "Hillson Dragon Steel Toe Gumboots, 15\" High",
    brand: "Hillson",
    subcategory: "shoes-gloves",
    type: "Gumboots",
    size: "Size 9",
    price: 550,
    mrp: 550,
    discountPct: 0,
    image: "/images/products/safety/hillson-dragon-steel-toe-gumboots-15-high.webp",
    spec: "Anti-slip",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Pair",
  },

  // ── Hi-Vis Jackets ──
  {
    id: "safari-safety-vest-reflective",
    title: "Safari High Visibility Neon Green Reflective Safety Vest with Front Zipper",
    brand: "Safari",
    subcategory: "hi-vis-jackets",
    type: "Reflective Vest",
    size: "Universal / Free Size",
    price: 180,
    mrp: 260,
    discountPct: 30,
    image: "/images/products/safety/safari-safety-vest-reflective.webp",
    spec: "EN 471 Standard",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "karam-pn-16-hi-vis-jacket",
    title: "Karam High Visibility Orange Safety Waistcoat Jacket with 2\" Reflective Tapes",
    brand: "Karam",
    subcategory: "hi-vis-jackets",
    type: "Reflective Vest",
    size: "Universal / Free Size",
    price: 220,
    mrp: 320,
    discountPct: 31,
    image: "/images/subcategories/hi-vis-jackets-icon.webp",
    spec: "Class 2 Reflective",
    deliveryTime: "60 Mins",
    dotsCount: 3,
    unit: "Piece",
  },

  // ── Harness & More ──
  {
    id: "karam-fs-51-full-harness",
    title: "Karam FS-51 Magna Full Body Fall Protection Safety Harness with Lanyard & Scaffold Hook",
    brand: "Karam",
    subcategory: "harness-more",
    type: "Safety Harness",
    size: "Universal / Free Size",
    price: 1250,
    mrp: 1650,
    discountPct: 24,
    image: "/images/products/safety/karam-fs-51-full-harness.webp",
    spec: "IS 3521:1999 Certified",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "udyogi-full-body-harness",
    title: "Udyogi ProFall Full Body Safety Harness with Adjustable Thigh Straps",
    brand: "Udyogi",
    subcategory: "harness-more",
    type: "Safety Harness",
    size: "Universal / Free Size",
    price: 980,
    mrp: 1350,
    discountPct: 27,
    image: "/images/products/safety/udyogi-full-body-harness.webp",
    spec: "Dual Dorsal D-Ring",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "construction-safety-net-green",
    title: "Heavy Duty Polyethylene Construction Safety & Fall Debris Net (10ft × 50ft)",
    brand: "Safari",
    subcategory: "harness-more",
    type: "Safety Net",
    size: "10ft × 50ft",
    price: 1850,
    mrp: 2400,
    discountPct: 23,
    image: "/images/products/safety/construction-safety-net-green.webp",
    spec: "UV Stabilized HDPE",
    deliveryTime: "60 Mins",
    dotsCount: 3,
    unit: "Roll",
  },
  {
    id: "scaffolding-net-black",
    title: "High Density Fire Retardant Scaffolding Perimeter Safety Net (3m × 50m)",
    brand: "Safari",
    subcategory: "harness-more",
    type: "Safety Net",
    size: "3m × 50m",
    price: 2150,
    mrp: 2900,
    discountPct: 25,
    image: "/images/products/safety/scaffolding-net-black.webp",
    spec: "Fire Retardant",
    deliveryTime: "60 Mins",
    dotsCount: 3,
    unit: "Roll",
  },

  // ── Helmets & Goggles ──
  {
    id: "safari-helmet-white-isi",
    title: "Safari Industrial High Impact Polypropylene Safety Helmet, ISI Marked (White)",
    brand: "Safari",
    subcategory: "helmets-goggles",
    type: "Safety Helmet",
    size: "Universal / Free Size",
    price: 290,
    mrp: 390,
    discountPct: 25,
    image: "/images/products/safety/safari-helmet-white-isi.webp",
    spec: "IS 2925 Certified",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "karam-es-01-safety-goggles",
    title: "Karam ES-01 Clear Polycarbonate Scratch-Resistant Safety Goggles",
    brand: "Karam",
    subcategory: "helmets-goggles",
    type: "Safety Goggles",
    size: "Universal / Free Size",
    price: 110,
    mrp: 160,
    discountPct: 31,
    image: "/images/products/safety/karam-es-01-safety-goggles.webp",
    spec: "Anti-Fog & UV Protect",
    deliveryTime: "60 Mins",
    dotsCount: 3,
    unit: "Piece",
  },
  {
    id: "karam-pn-521-helmet-isi",
    title: "Karam PN 521 Hard Hat with Ratchet Adjustment & Chin Strap (Yellow)",
    brand: "Karam",
    subcategory: "helmets-goggles",
    type: "Safety Helmet",
    size: "Universal / Free Size",
    price: 360,
    mrp: 480,
    discountPct: 25,
    image: "/images/products/safety/karam-pn-521-helmet-isi.webp",
    spec: "6-Point Cradle",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "karam-dust-mask-pack-50",
    title: "Karam Dust & Particulate Protection Respirator Face Mask (Pack of 50)",
    brand: "Karam",
    subcategory: "helmets-goggles",
    type: "Dust Mask",
    size: "Pack of 50",
    price: 320,
    mrp: 450,
    discountPct: 29,
    image: "/images/products/safety/karam-dust-mask-pack-50.webp",
    spec: "FFP1 S Certified",
    deliveryTime: "60 Mins",
    dotsCount: 3,
    unit: "Pack of 50",
  },
];

interface SafetyCollectionStorefrontProps {
  onOpenDetail?: (product: Product) => void;
}

export function SafetyCollectionStorefront({
  onOpenDetail,
}: SafetyCollectionStorefrontProps) {
  const [activeSubcategory, setActiveSubcategory] =
    useState<string>("shoes-gloves");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedSize, setSelectedSize] = useState<string>("All");
  const [selectedPrice, setSelectedPrice] = useState<string>("All");
  const [selectedSort, setSelectedSort] = useState<string>("relevance");
  const [quickDetailProduct, setQuickDetailProduct] = useState<Product | null>(
    null,
  );

  const queryClient = useQueryClient();
  const { data: cartData } = useGetCart();
  const addToCart = useAddToCart({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast.success("Added to cart");
      },
      onError: () => toast.error("Failed to add to cart"),
    },
  });
  const updateCartItem = useUpdateCartItem({
    mutation: {
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }),
    },
  });
  const removeFromCart = useRemoveFromCart({
    mutation: {
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }),
    },
  });

  const cartItems = useMemo(() => {
    if (!cartData?.categories) return [];
    return cartData.categories.flatMap((c) => c.items ?? []);
  }, [cartData]);

  const getItemQuantity = (productId: string) => {
    const item = cartItems.find(
      (ci: any) =>
        ci.materialId === productId ||
        ci.id === productId ||
        ci.title === productId,
    );
    return item ? item.quantity : 0;
  };

  const getCartItemId = (productId: string) => {
    const item = cartItems.find(
      (ci: any) =>
        ci.materialId === productId ||
        ci.id === productId ||
        ci.title === productId,
    );
    return item ? item.id : null;
  };

  const handleAddToCart = (p: SafetyProduct) => {
    addToCart.mutate({
      data: {
        materialId: p.id,
        quantity: 1,
        name: p.title,
        price: p.price,
        unit: p.unit,
        vendor: `${p.brand} Official`,
        category: "Safety & Workwear",
      },
    });
  };

  const handleUpdateQty = (p: SafetyProduct, newQty: number) => {
    const cartItemId = getCartItemId(p.id);
    if (!cartItemId) {
      if (newQty > 0) handleAddToCart(p);
      return;
    }
    if (newQty <= 0) {
      removeFromCart.mutate({ itemId: cartItemId });
    } else {
      updateCartItem.mutate({ itemId: cartItemId, data: { quantity: newQty } });
    }
  };

  const subcategories = [
    {
      id: "shoes-gloves",
      label: "Shoes & Gloves",
      icon: "/images/subcategories/shoes-gloves-icon.webp",
    },
    {
      id: "hi-vis-jackets",
      label: "Hi-Vis Jackets",
      icon: "/images/subcategories/hi-vis-jackets-icon.webp",
    },
    {
      id: "harness-more",
      label: "Harness & More",
      icon: "/images/subcategories/harness-more-icon.webp",
    },
    {
      id: "helmets-goggles",
      label: "Helmets & Goggles",
      icon: "/images/subcategories/helmets-goggles-icon.webp",
    },
  ];

  const currentSubcatLabel =
    subcategories.find((s) => s.id === activeSubcategory)?.label ||
    "Shoes & Gloves";

  const brandOptions = useMemo(() => {
    const brands = new Set<string>();
    SAFETY_PRODUCTS.filter((p) => p.subcategory === activeSubcategory).forEach(
      (p) => brands.add(p.brand),
    );
    return ["All", ...Array.from(brands)];
  }, [activeSubcategory]);

  const typeOptions = useMemo(() => {
    const types = new Set<string>();
    SAFETY_PRODUCTS.filter((p) => p.subcategory === activeSubcategory).forEach(
      (p) => types.add(p.type),
    );
    return ["All", ...Array.from(types)];
  }, [activeSubcategory]);

  const sizeOptions = useMemo(() => {
    const sizes = new Set<string>();
    SAFETY_PRODUCTS.filter((p) => p.subcategory === activeSubcategory).forEach(
      (p) => {
        if (p.size) sizes.add(p.size);
      },
    );
    return ["All", ...Array.from(sizes)];
  }, [activeSubcategory]);

  const filteredProducts = useMemo(() => {
    return SAFETY_PRODUCTS.filter((p) => {
      if (activeSubcategory && p.subcategory !== activeSubcategory)
        return false;
      if (selectedBrand !== "All" && p.brand !== selectedBrand) return false;
      if (selectedType !== "All" && p.type !== selectedType) return false;
      if (selectedSize !== "All" && p.size !== selectedSize) return false;
      if (selectedPrice === "under500" && p.price >= 500) return false;
      if (
        selectedPrice === "500-1000" &&
        (p.price < 500 || p.price > 1000)
      )
        return false;
      if (selectedPrice === "above1000" && p.price <= 1000) return false;
      return true;
    }).sort((a, b) => {
      if (selectedSort === "price-asc") return a.price - b.price;
      if (selectedSort === "price-desc") return b.price - a.price;
      if (selectedSort === "discount") return b.discountPct - a.discountPct;
      return 0; // relevance
    });
  }, [
    activeSubcategory,
    selectedBrand,
    selectedType,
    selectedSize,
    selectedPrice,
    selectedSort,
  ]);

  const openModal = (p: SafetyProduct) => {
    const mapped: Product = {
      id: p.id,
      title: p.title,
      price: p.price,
      mrp: p.mrp,
      unit: p.unit,
      image: p.image,
      materialTag: "Safety & Workwear",
      brand: p.brand,
      description: `${p.title} - ${p.spec || "Certified industrial personal protective equipment"}. Tested to BIS / EN safety standards. Doorstep delivery in 60 minutes.`,
      rating: 4.8,
      reviews: 142,
      deliveryEta: "Today, in 60 Mins",
    };
    if (onOpenDetail) {
      onOpenDetail(mapped);
    } else {
      setQuickDetailProduct(mapped);
    }
  };

  return (
    <div className="w-full bg-[#FFFFFF] min-h-screen">
      {/* ── Top Yellow Promotional Banner (Flat 2% Cashback) ── */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-1">
        <div className="w-full rounded-2xl overflow-hidden shadow-xs border border-amber-300/80 bg-[#FFD100]">
          <img
            src="/images/banners/cashback-25k-banner.webp"
            alt="Flat 2% Cashback on ₹25,000+ purchase"
            className="w-full h-auto max-h-[140px] object-cover"
          />
        </div>
      </div>

      {/* ── Top Breadcrumb & Heading Container ── */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-2">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[12px] text-[#6B7280]">
          <a href="/home" className="hover:text-[#111827] transition-colors">
            Home
          </a>
          <span className="text-[#9CA3AF]">›</span>
          <a
            href="/categories?cat=safety-workwear"
            className="hover:text-[#111827] transition-colors"
          >
            Safety &amp; Workwear
          </a>
          <span className="text-[#9CA3AF]">›</span>
          <span className="text-[#111827] font-medium">{currentSubcatLabel}</span>
        </nav>

        {/* Page Title */}
        <h1 className="text-[26px] sm:text-[30px] font-bold text-[#111827] tracking-tight mt-2.5">
          {currentSubcatLabel}
        </h1>
      </div>

      {/* ── Main Content Layout: Sidebar + Grid ── */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Left Sidebar Subcategories */}
          <aside className="w-full md:w-[210px] flex-shrink-0">
            <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
              {subcategories.map((sc) => {
                const isActive = activeSubcategory === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => {
                      setActiveSubcategory(sc.id);
                      setSelectedBrand("All");
                      setSelectedType("All");
                      setSelectedSize("All");
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors relative border-b border-[#F3F4F6] last:border-b-0 ${
                      isActive
                        ? "bg-[#EAF7EE] text-[#111827] font-semibold"
                        : "bg-white text-[#374151] hover:bg-[#F9FAFB]"
                    }`}
                  >
                    {/* Subcategory Icon Container */}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img
                        src={sc.icon}
                        alt={sc.label}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-[13px] leading-snug">{sc.label}</span>
                    {isActive && (
                      <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-[#16A34A]" />
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right Product Grid Column */}
          <main className="flex-1 w-full min-w-0">
            {/* Filter Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#E5E7EB]">
              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] text-[#4B5563] font-medium mr-1">
                  Filter:
                </span>

                {/* Category Select */}
                <div className="relative inline-block">
                  <select
                    value={activeSubcategory}
                    onChange={(e) => {
                      setActiveSubcategory(e.target.value);
                      setSelectedBrand("All");
                      setSelectedType("All");
                      setSelectedSize("All");
                    }}
                    className="text-[12.5px] border border-[#D1D5DB] rounded-md px-2.5 py-1.5 bg-white text-[#374151] font-medium focus:outline-none focus:ring-1 focus:ring-[#16A34A] cursor-pointer"
                  >
                    <option value="shoes-gloves">Category: Shoes &amp; Gloves</option>
                    <option value="hi-vis-jackets">Hi-Vis Jackets</option>
                    <option value="harness-more">Harness &amp; More</option>
                    <option value="helmets-goggles">Helmets &amp; Goggles</option>
                  </select>
                </div>

                {/* Brand Select */}
                <div className="relative inline-block">
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="text-[12.5px] border border-[#D1D5DB] rounded-md px-2.5 py-1.5 bg-white text-[#374151] font-medium focus:outline-none focus:ring-1 focus:ring-[#16A34A] cursor-pointer"
                  >
                    <option value="All">Brand ▾</option>
                    {brandOptions
                      .filter((b) => b !== "All")
                      .map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Type Select */}
                <div className="relative inline-block">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="text-[12.5px] border border-[#D1D5DB] rounded-md px-2.5 py-1.5 bg-white text-[#374151] font-medium focus:outline-none focus:ring-1 focus:ring-[#16A34A] cursor-pointer"
                  >
                    <option value="All">Type ▾</option>
                    {typeOptions
                      .filter((t) => t !== "All")
                      .map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Size Select */}
                <div className="relative inline-block">
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="text-[12.5px] border border-[#D1D5DB] rounded-md px-2.5 py-1.5 bg-white text-[#374151] font-medium focus:outline-none focus:ring-1 focus:ring-[#16A34A] cursor-pointer"
                  >
                    <option value="All">Size ▾</option>
                    {sizeOptions
                      .filter((s) => s !== "All")
                      .map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Price Select */}
                <div className="relative inline-block">
                  <select
                    value={selectedPrice}
                    onChange={(e) => setSelectedPrice(e.target.value)}
                    className="text-[12.5px] border border-[#D1D5DB] rounded-md px-2.5 py-1.5 bg-white text-[#374151] font-medium focus:outline-none focus:ring-1 focus:ring-[#16A34A] cursor-pointer"
                  >
                    <option value="All">Price ▾</option>
                    <option value="under500">Under ₹500</option>
                    <option value="500-1000">₹500 - ₹1000</option>
                    <option value="above1000">Above ₹1000</option>
                  </select>
                </div>
              </div>

              {/* Product Count & Sort */}
              <div className="flex items-center gap-4 text-[13px] text-[#4B5563]">
                <span>
                  <strong className="text-[#111827] font-semibold">
                    {filteredProducts.length}
                  </strong>{" "}
                  products
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#6B7280]">Sort by:</span>
                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className="text-[12.5px] border border-[#D1D5DB] rounded-md px-2 py-1 bg-white text-[#374151] font-medium focus:outline-none focus:ring-1 focus:ring-[#16A34A] cursor-pointer"
                  >
                    <option value="relevance">Relevance ▾</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="discount">Highest Discount</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 4-Column Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {filteredProducts.map((p) => {
                const cartQty = getItemQuantity(p.id);

                return (
                  <div
                    key={p.id}
                    className="group relative bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
                  >
                    {/* Blue Ribbon Badge Top-Left with Triangle Notch (only if discountPct > 0) */}
                    {p.discountPct > 0 && (
                      <div className="absolute top-0 left-3 z-10">
                        <div className="bg-[#2563EB] text-white text-[11px] font-bold px-2 pt-1 pb-1 text-center shadow-sm relative">
                          <span className="block leading-none">Save</span>
                          <span className="block leading-tight">{p.discountPct}%</span>
                          <div
                            className="absolute -bottom-1.5 left-0 right-0 h-1.5 bg-[#2563EB]"
                            style={{
                              clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)",
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Image Container with Dots Pagination */}
                    <div
                      onClick={() => openModal(p)}
                      className="relative w-full aspect-square bg-[#FFFFFF] p-3 flex items-center justify-center cursor-pointer overflow-hidden border-b border-[#F3F4F6]"
                    >
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
                      />

                      {/* Dots indicator at bottom right of image */}
                      <div className="absolute bottom-2 right-2 flex items-center gap-0.5">
                        {Array.from({ length: p.dotsCount }).map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-1 h-1 rounded-full ${
                              idx === 0 ? "bg-[#111827]" : "bg-[#D1D5DB]"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Price Row */}
                        <div className="flex items-baseline gap-1 flex-wrap">
                          <span className="text-[17px] font-bold text-[#111827]">
                            ₹{p.price.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[11px] text-[#6B7280]">
                            (incl GST)
                          </span>
                          {p.mrp > p.price && (
                            <span className="text-[11px] text-[#9CA3AF] line-through ml-1">
                              ₹{p.mrp.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>

                        {/* Product Title */}
                        <h3
                          onClick={() => openModal(p)}
                          className="mt-2 text-[12.5px] sm:text-[13px] font-semibold text-[#1F2937] leading-[1.35] line-clamp-2 hover:text-[#2563EB] cursor-pointer"
                          title={p.title}
                        >
                          {p.title}
                        </h3>

                        {/* Green Assured Cashback & Free Delivery Banner */}
                        <div className="mt-2 bg-[#EAF7EE] text-[#16A34A] rounded px-1.5 py-0.5 text-[9.5px] font-medium leading-tight flex items-center gap-1">
                          <span>Assured 1% cashback</span>
                          <span className="text-[#86EFAC]">|</span>
                          <span>Free Delivery on ₹1000+</span>
                        </div>

                        {/* Spec highlight */}
                        {p.spec && (
                          <div className="mt-1.5 text-[10.5px] text-[#4B5563] font-medium">
                            {p.spec}
                          </div>
                        )}
                      </div>

                      {/* Action Stepper / Add Button */}
                      <div className="mt-3 pt-2">
                        {cartQty === 0 ? (
                          <button
                            type="button"
                            onClick={() => handleAddToCart(p)}
                            className="w-full text-center py-1.5 px-2 rounded-lg border border-[#16A34A] text-[#16A34A] hover:bg-[#EAF7EE] font-bold text-[12.5px] bg-white transition-colors"
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
            const count = qty ?? 1;
            for (let i = 0; i < count; i++) {
              addToCart.mutate({
                data: {
                  materialId: p.id,
                  quantity: 1,
                  name: p.title,
                  price: p.price,
                  unit: p.unit || "Piece",
                  vendor: `${p.brand} Official`,
                  category: "Safety & Workwear",
                },
              });
            }
            toast.success(`Added ${qty} item(s) to cart`);
          }}
        />
      )}
    </div>
  );
}
