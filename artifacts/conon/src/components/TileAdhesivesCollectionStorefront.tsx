import React, { useState, useMemo } from "react";
import { Clock, ChevronRight } from "lucide-react";
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

export interface TileProduct {
  id: string;
  title: string;
  brand: string;
  subcategory: "tile-adhesives" | "special-adhesives" | "grouts-cleaners" | "spacers-tools";
  price: number;
  mrp: number;
  discountPct: number;
  bulkPrice?: number;
  image: string;
  spec?: string;
  deliveryTime: string;
  dotsCount: number;
}

export const TILE_PRODUCTS: TileProduct[] = [
  {
    id: "myk-laticrete-303-grey-tile-adhesive-20kg",
    title: "MYK Laticrete 303 Grey Tile Adhesive, 20Kg Bag",
    brand: "MYK Laticrete",
    subcategory: "tile-adhesives",
    price: 255,
    mrp: 300,
    discountPct: 15,
    bulkPrice: 235,
    image: "/images/products/tiles/myk-laticrete-303-grey-tile-adhesive-20kg.webp",
    spec: "Interior dry",
    deliveryTime: "60 Mins",
    dotsCount: 5,
  },
  {
    id: "roff-t01-nca-tile-adhesive-grey-30kg",
    title: "Roff T01 NCA Tile Adhesive, Grey, 30 Kg Bag",
    brand: "Roff",
    subcategory: "tile-adhesives",
    price: 430,
    mrp: 460,
    discountPct: 7,
    bulkPrice: 410,
    image: "/images/products/tiles/roff-t01-nca-tile-adhesive-grey-30kg.webp",
    spec: "Polymer-modified",
    deliveryTime: "60 Mins",
    dotsCount: 4,
  },
  {
    id: "myk-laticrete-305-tile-adhesive-grey-30kg",
    title: "MYK Laticrete 305 Tile Adhesive, Grey, 30 Kg Bag",
    brand: "MYK Laticrete",
    subcategory: "tile-adhesives",
    price: 420,
    mrp: 460,
    discountPct: 9,
    bulkPrice: 400,
    image: "/images/products/tiles/myk-laticrete-305-tile-adhesive-grey-30kg.webp",
    spec: "Polymer-modified",
    deliveryTime: "60 Mins",
    dotsCount: 5,
  },
  {
    id: "roff-t02-nsa-tile-adhesive-grey-30kg",
    title: "Roff T02 NSA Tile Adhesive, Grey, 30 Kg Bag",
    brand: "Roff",
    subcategory: "tile-adhesives",
    price: 740,
    mrp: 780,
    discountPct: 5,
    bulkPrice: 715,
    image: "/images/products/tiles/roff-t02-nsa-tile-adhesive-grey-30kg.webp",
    spec: "8-12 sqm/bag",
    deliveryTime: "60 Mins",
    dotsCount: 4,
  },
  {
    id: "roff-t03-powerflex-tile-adhesive-grey-30kg",
    title: "Roff T03 Powerflex Superior Polymer Adhesive, 30 Kg",
    brand: "Roff",
    subcategory: "tile-adhesives",
    price: 920,
    mrp: 990,
    discountPct: 7,
    bulkPrice: 885,
    image: "/images/products/tiles/roff-t02-nsa-40kg.webp",
    spec: "Heavy Vitrified / Granite",
    deliveryTime: "60 Mins",
    dotsCount: 3,
  },
  {
    id: "myk-laticrete-315-thin-set-adh-20kg",
    title: "MYK Laticrete 315 Thin Set Floor & Wall Adhesive, 20 Kg",
    brand: "MYK Laticrete",
    subcategory: "tile-adhesives",
    price: 360,
    mrp: 395,
    discountPct: 9,
    bulkPrice: 345,
    image: "/images/products/tiles/myk-laticrete-303-grey-tile-adhesive-20kg.webp",
    spec: "Interior Vitrified",
    deliveryTime: "60 Mins",
    dotsCount: 4,
  },
  {
    id: "jsw-tile-fix-premium-20kg",
    title: "JSW Tile Fix Premium Polymer Adhesive, 20 Kg Bag",
    brand: "JSW",
    subcategory: "tile-adhesives",
    price: 310,
    mrp: 350,
    discountPct: 11,
    bulkPrice: 295,
    image: "/images/products/tiles/jsw-tile-fix-adhesive-20kg.webp",
    spec: "High Bond Strength",
    deliveryTime: "60 Mins",
    dotsCount: 3,
  },
  {
    id: "smartcare-tile-adhesive-t1-20kg",
    title: "Asian Paints SmartCare Tile Adhesive T1, 20 Kg Bag",
    brand: "Asian Paints",
    subcategory: "tile-adhesives",
    price: 290,
    mrp: 330,
    discountPct: 12,
    bulkPrice: 275,
    image: "/images/products/tiles/smartcare-tile-adhesive-t1-20kg.webp",
    spec: "Ceramic & Semi-vitrified",
    deliveryTime: "60 Mins",
    dotsCount: 3,
  },
  // Special Adhesives
  {
    id: "myk-335-super-flex-adh-20kg",
    title: "MYK Laticrete 335 Maxi Super Flex Tile & Stone Adhesive, 20 Kg",
    brand: "MYK Laticrete",
    subcategory: "special-adhesives",
    price: 1150,
    mrp: 1280,
    discountPct: 10,
    bulkPrice: 1100,
    image: "/images/products/tiles/myk-335-super-flex-adh-20kg.webp",
    spec: "Outdoor & Swimming Pool",
    deliveryTime: "60 Mins",
    dotsCount: 4,
  },
  {
    id: "roff-tilefix-ready-mix-5kg",
    title: "Roff Tilefix Ready Mix Paste Adhesive, 5 Kg Tub",
    brand: "Roff",
    subcategory: "special-adhesives",
    price: 520,
    mrp: 580,
    discountPct: 10,
    bulkPrice: 495,
    image: "/images/products/tiles/roff-tilefix-ready-mix-5kg.webp",
    spec: "Direct Tile-on-Tile",
    deliveryTime: "60 Mins",
    dotsCount: 3,
  },
  {
    id: "smartcare-tile-adhesive-t3-20kg",
    title: "Asian Paints SmartCare T3 Glass Mosaic & Marble Adhesive, 20 Kg",
    brand: "Asian Paints",
    subcategory: "special-adhesives",
    price: 1350,
    mrp: 1490,
    discountPct: 9,
    bulkPrice: 1290,
    image: "/images/products/tiles/smartcare-tile-adhesive-t3-20kg.webp",
    spec: "Glass Mosaic & Marble",
    deliveryTime: "60 Mins",
    dotsCount: 3,
  },
  // Grouts & Cleaners
  {
    id: "roff-rainbow-tile-grout-epoxy-1kg",
    title: "Roff Rainbow Epoxy Tile Grout (Resin + Hardener), 1 Kg Kit",
    brand: "Roff",
    subcategory: "grouts-cleaners",
    price: 495,
    mrp: 550,
    discountPct: 10,
    bulkPrice: 465,
    image: "/images/products/tiles/roff-tile-grout-epoxy-1kg.webp",
    spec: "Stain & Chemical Resistant",
    deliveryTime: "60 Mins",
    dotsCount: 4,
  },
  {
    id: "roff-rainbow-grout-2kg",
    title: "Roff Rainbow Polymer Modified Tile Joint Grout, 2 Kg",
    brand: "Roff",
    subcategory: "grouts-cleaners",
    price: 130,
    mrp: 150,
    discountPct: 13,
    bulkPrice: 120,
    image: "/images/products/tiles/roff-rainbow-grout-2kg.webp",
    spec: "Water Resistant Joint Filler",
    deliveryTime: "60 Mins",
    dotsCount: 3,
  },
  {
    id: "roff-cera-clean-5l",
    title: "Roff Cera Clean Rapid Floor & Tile Acid Cleaner, 5 Ltr Can",
    brand: "Roff",
    subcategory: "grouts-cleaners",
    price: 540,
    mrp: 600,
    discountPct: 10,
    bulkPrice: 510,
    image: "/images/products/tiles/roff-cera-clean-5l.webp",
    spec: "Removes Cement Stains",
    deliveryTime: "60 Mins",
    dotsCount: 3,
  },
  {
    id: "myk-stonetech-cleaner-1l",
    title: "MYK Laticrete StoneTech Professional Tile & Grout Cleaner, 1 Ltr",
    brand: "MYK Laticrete",
    subcategory: "grouts-cleaners",
    price: 385,
    mrp: 430,
    discountPct: 10,
    bulkPrice: 360,
    image: "/images/products/tiles/myk-stonetech-cleaner-1l.webp",
    spec: "Neutral pH Non-Acidic",
    deliveryTime: "60 Mins",
    dotsCount: 3,
  },
  {
    id: "dr-fixit-tile-stone-sealer-1l",
    title: "Dr. Fixit Modern Tile & Natural Stone Impregnating Sealer, 1 Ltr",
    brand: "Dr. Fixit",
    subcategory: "grouts-cleaners",
    price: 460,
    mrp: 520,
    discountPct: 12,
    bulkPrice: 435,
    image: "/images/products/tiles/dr-fixit-tile-stone-sealer-1l.webp",
    spec: "Water & Oil Repellent",
    deliveryTime: "60 Mins",
    dotsCount: 3,
  },
  // Spacers & Tools
  {
    id: "tile-leveling-clip-wedge-100pc",
    title: "Tile Leveling Clip & Wedge Reusable System, Pack of 100",
    brand: "General",
    subcategory: "spacers-tools",
    price: 320,
    mrp: 450,
    discountPct: 29,
    bulkPrice: 299,
    image: "/images/products/tiles/tile-leveling-clip-wedge-100pc.webp",
    spec: "Zero Lippage System",
    deliveryTime: "60 Mins",
    dotsCount: 4,
  },
  {
    id: "tile-spacer-3mm-pack-200",
    title: "Precision Cross Tile Spacers 3mm, Pack of 200 Pcs",
    brand: "General",
    subcategory: "spacers-tools",
    price: 90,
    mrp: 120,
    discountPct: 25,
    bulkPrice: 80,
    image: "/images/products/tiles/tile-spacer-3mm-pack-200.webp",
    spec: "Uniform 3mm Joints",
    deliveryTime: "60 Mins",
    dotsCount: 3,
  },
  {
    id: "notched-trowel-10mm",
    title: "Heavy Duty Stainless Steel Square Notched Trowel 10x10mm",
    brand: "Taparia",
    subcategory: "spacers-tools",
    price: 280,
    mrp: 350,
    discountPct: 20,
    bulkPrice: 260,
    image: "/images/products/tiles/notched-trowel-10mm.webp",
    spec: "Rubber Grip Handle",
    deliveryTime: "60 Mins",
    dotsCount: 3,
  },
  {
    id: "manual-tile-cutter-24",
    title: "Professional Manual Heavy Duty Tile Cutter Machine 24 Inch",
    brand: "Taparia",
    subcategory: "spacers-tools",
    price: 2450,
    mrp: 3100,
    discountPct: 21,
    bulkPrice: 2320,
    image: "/images/products/tiles/manual-tile-cutter-24.webp",
    spec: "Tungsten Carbide Wheel",
    deliveryTime: "60 Mins",
    dotsCount: 4,
  },
];

interface TileAdhesivesCollectionStorefrontProps {
  onOpenDetail?: (product: Product) => void;
}

export function TileAdhesivesCollectionStorefront({
  onOpenDetail,
}: TileAdhesivesCollectionStorefrontProps) {
  const [activeSubcategory, setActiveSubcategory] = useState<string>("tile-adhesives");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [selectedSort, setSelectedSort] = useState<string>("relevance");
  const [quickDetailProduct, setQuickDetailProduct] = useState<Product | null>(null);

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
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }),
    },
  });
  const removeFromCart = useRemoveFromCart({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }),
    },
  });

  const cartItems = useMemo(() => {
    if (!cartData?.categories) return [];
    return cartData.categories.flatMap((c) => c.items ?? []);
  }, [cartData]);

  const getItemQuantity = (productId: string) => {
    const item = cartItems.find(
      (ci: any) => ci.materialId === productId || ci.id === productId || ci.title === productId
    );
    return item ? item.quantity : 0;
  };

  const getCartItemId = (productId: string) => {
    const item = cartItems.find(
      (ci: any) => ci.materialId === productId || ci.id === productId || ci.title === productId
    );
    return item ? item.id : null;
  };

  const handleAddToCart = (p: TileProduct) => {
    addToCart.mutate({
      data: {
        materialId: p.id,
        quantity: 1,
        name: p.title,
        price: p.price,
        unit: "Bag",
        vendor: `${p.brand} Official`,
        category: "Tile & Stone Installation",
      },
    });
  };

  const handleUpdateQty = (p: TileProduct, newQty: number) => {
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
      id: "tile-adhesives",
      label: "Tile Adhesives",
      icon: "/images/subcategories/tile-adhesives-icon.webp",
    },
    {
      id: "special-adhesives",
      label: "Special Adhesives",
      icon: "/images/subcategories/special-adhesives-icon.webp",
    },
    {
      id: "grouts-cleaners",
      label: "Grouts & Cleaners",
      icon: "/images/subcategories/grouts-cleaners-icon.webp",
    },
    {
      id: "spacers-tools",
      label: "Spacers & Tools",
      icon: "/images/subcategories/spacers-tools-icon.webp",
    },
  ];

  const filteredProducts = useMemo(() => {
    return TILE_PRODUCTS.filter((p) => {
      if (activeSubcategory && p.subcategory !== activeSubcategory) return false;
      if (selectedBrand !== "All" && p.brand !== selectedBrand) return false;
      return true;
    });
  }, [activeSubcategory, selectedBrand]);

  const openModal = (p: TileProduct) => {
    const mapped: Product = {
      id: p.id,
      title: p.title,
      price: p.price,
      mrp: p.mrp,
      unit: "Bag",
      image: p.image,
      materialTag: "Tile & Stone Installation",
      brand: p.brand,
      description: `${p.title} - ${p.spec || "High Performance Tile & Stone System"}. Genuine manufacturer pack with assured delivery in 60 minutes.`,
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
      {/* Top Breadcrumb & Heading Container */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[12px] text-[#6B7280]">
          <a href="/home" className="hover:text-[#111827] transition-colors">
            Home
          </a>
          <span className="text-[#9CA3AF]">›</span>
          <a
            href="/collections/tile-stone-installation"
            className="hover:text-[#111827] transition-colors"
          >
            Tile & Stone Installation
          </a>
          <span className="text-[#9CA3AF]">›</span>
          <span className="text-[#111827] font-medium">Tile Adhesives</span>
        </nav>

        {/* Page Title */}
        <h1 className="text-[26px] sm:text-[30px] font-bold text-[#111827] tracking-tight mt-2.5">
          Tile Adhesives
        </h1>
      </div>

      {/* Main Content Layout: Sidebar + Grid */}
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
                    onClick={() => setActiveSubcategory(sc.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 text-left transition-colors relative border-b border-[#F3F4F6] last:border-b-0 ${
                      isActive
                        ? "bg-[#EAF7EE] text-[#111827] font-semibold"
                        : "bg-white text-[#374151] hover:bg-[#F9FAFB]"
                    }`}
                  >
                    {/* Subcategory Icon Box */}
                    <div className="w-9 h-9 rounded-md bg-white border border-[#E5E7EB] flex items-center justify-center p-1 flex-shrink-0 shadow-sm overflow-hidden">
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
                <span className="text-[13px] text-[#4B5563] font-medium mr-1">Filter:</span>
                <div className="relative inline-block">
                  <select
                    value={activeSubcategory}
                    onChange={(e) => setActiveSubcategory(e.target.value)}
                    className="text-[12.5px] border border-[#D1D5DB] rounded-md px-2.5 py-1.5 bg-white text-[#374151] font-medium focus:outline-none focus:ring-1 focus:ring-[#16A34A] cursor-pointer"
                  >
                    <option value="tile-adhesives">Category: Tile Adhesives</option>
                    <option value="special-adhesives">Special Adhesives</option>
                    <option value="grouts-cleaners">Grouts & Cleaners</option>
                    <option value="spacers-tools">Spacers & Tools</option>
                  </select>
                </div>

                <div className="relative inline-block">
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="text-[12.5px] border border-[#D1D5DB] rounded-md px-2.5 py-1.5 bg-white text-[#374151] font-medium focus:outline-none focus:ring-1 focus:ring-[#16A34A] cursor-pointer"
                  >
                    <option value="All">Brand ▾</option>
                    <option value="MYK Laticrete">MYK Laticrete</option>
                    <option value="Roff">Roff</option>
                    <option value="Asian Paints">Asian Paints</option>
                    <option value="JSW">JSW</option>
                    <option value="Dr. Fixit">Dr. Fixit</option>
                    <option value="Taparia">Taparia</option>
                  </select>
                </div>

                <div className="relative inline-block">
                  <select
                    className="text-[12.5px] border border-[#D1D5DB] rounded-md px-2.5 py-1.5 bg-white text-[#374151] font-medium focus:outline-none focus:ring-1 focus:ring-[#16A34A] cursor-pointer"
                  >
                    <option value="all">Type ▾</option>
                    <option value="standard">Standard Polymer (T01 / 303)</option>
                    <option value="superior">Superior High Grab (T02 / 305)</option>
                    <option value="heavy">Super Flex Heavy Duty (335 / T03)</option>
                  </select>
                </div>

                <div className="relative inline-block">
                  <select
                    className="text-[12.5px] border border-[#D1D5DB] rounded-md px-2.5 py-1.5 bg-white text-[#374151] font-medium focus:outline-none focus:ring-1 focus:ring-[#16A34A] cursor-pointer"
                  >
                    <option value="all">Price ▾</option>
                    <option value="under500">Under ₹500</option>
                    <option value="500-1000">₹500 - ₹1000</option>
                    <option value="above1000">Above ₹1000</option>
                  </select>
                </div>
              </div>

              {/* Product Count & Sort */}
              <div className="flex items-center gap-4 text-[13px] text-[#4B5563]">
                <span>
                  <strong className="text-[#111827] font-semibold">20</strong> products
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
                    {/* Blue Ribbon Badge Top-Left with Triangle Notch */}
                    {p.discountPct > 0 && (
                      <div className="absolute top-0 left-3 z-10">
                        <div className="bg-[#2563EB] text-white text-[11px] font-bold px-2 pt-1 pb-1 text-center shadow-sm relative">
                          <span className="block leading-none">Save</span>
                          <span className="block leading-tight">{p.discountPct}%</span>
                          {/* Triangle cut-out notch at bottom */}
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
                      className="relative w-full aspect-square bg-[#F9FAFB] p-4 flex items-center justify-center cursor-pointer overflow-hidden"
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
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-[17px] font-bold text-[#111827]">
                            ₹{p.price.toLocaleString("en-IN")}
                          </span>
                          {p.mrp > p.price && (
                            <span className="text-[11.5px] text-[#9CA3AF] line-through">
                              ₹{p.mrp.toLocaleString("en-IN")} (incl GST)
                            </span>
                          )}
                        </div>

                        {/* Bulk Price Pill */}
                        {p.bulkPrice && (
                          <div className="mt-1">
                            <span className="inline-flex items-center text-[10.5px] font-semibold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-full">
                              Bulk price ₹{p.bulkPrice.toLocaleString("en-IN")} ›
                            </span>
                          </div>
                        )}

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

                        {/* Delivery Time */}
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-[#6B7280]">
                          <Clock className="w-3 h-3 text-[#6B7280]" />
                          <span>{p.deliveryTime}</span>
                        </div>
                      </div>

                      {/* Action Stepper / Add Button */}
                      <div className="mt-3 pt-2 border-t border-[#F3F4F6]">
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
                  unit: p.unit || "Bag",
                  vendor: `${p.brand || "MYK Laticrete"} Official`,
                  category: "Tile & Stone Installation",
                },
              });
            }
          }}
        />
      )}
    </div>
  );
}
