import React, { useState, useMemo } from "react";
import { Clock } from "lucide-react";
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
  subcategory: "cpvc-pipes-hardware" | "cpvc-fittings" | "brass-fittings" | "overhead-tank";
  type: string;
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

export const CPVC_PLUMBING_PRODUCTS: PlumbingProduct[] = [
  // ── CPVC Pipes & Hardware (Matches hero screenshot 1:1) ──
  {
    id: "ashirvad-cpvc-flowguard-plus-pipe",
    title: "Ashirvad CPVC Flowguard Plus Pipe, SDR-11, 5m Length",
    brand: "Ashirvad",
    subcategory: "cpvc-pipes-hardware",
    type: "CPVC Pipe",
    price: 305,
    mrp: 635,
    discountPct: 52,
    image: "/images/products/plumbing/ashirvad-cpvc-flowguard-plus-pipe.webp",
    spec: "NSF/ANSI 61",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    dotsCount: 4,
    unit: "Pipe (5m)",
  },
  {
    id: "ashirvad-flowguard-plus-solvent-cement",
    title: "Ashirvad Flowguard Plus 1 Step CPVC Yellow Medium Solvent Cement",
    brand: "Ashirvad",
    subcategory: "cpvc-pipes-hardware",
    type: "Solvent Cement",
    price: 90,
    mrp: 147,
    discountPct: 39,
    image: "/images/products/plumbing/ashirvad-flowguard-plus-solvent-cement.webp",
    spec: "Cures in 24 hrs",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    dotsCount: 4,
    unit: "Can (100ml)",
  },
  {
    id: "ashirvad-flowguard-metal-pipe-clamp",
    title: "Ashirvad Flowguard Plus Metal Pipe Clamp/Strap",
    brand: "Ashirvad",
    subcategory: "cpvc-pipes-hardware",
    type: "Pipe Clamp",
    price: 8,
    mrp: 14,
    discountPct: 43,
    image: "/images/products/plumbing/ashirvad-flowguard-metal-pipe-clamp.webp",
    spec: "Prevents Sagging",
    deliveryTime: "60 Mins",
    optionsCount: 6,
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "pidilite-m-seal-phataphat-90g",
    title: "Pidilite M-Seal Phataphat 90g, Multi-Purpose Waterproof Sealant, Grey",
    brand: "Pidilite",
    subcategory: "cpvc-pipes-hardware",
    type: "Sealant",
    price: 30,
    mrp: 30,
    discountPct: 0,
    image: "/images/products/plumbing/pidilite-m-seal-phataphat-90g.webp",
    spec: "Fixes Leaks",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Pack (90g)",
  },

  // ── CPVC Fittings ──
  {
    id: "ashirvad-cpvc-elbow-half-inch",
    title: "Ashirvad CPVC 90° Elbow 1/2 Inch (SDR-11 High Pressure)",
    brand: "Ashirvad",
    subcategory: "cpvc-fittings",
    type: "Elbow",
    price: 18,
    mrp: 28,
    discountPct: 35,
    image: "/images/products/plumbing/ashirvad-cpvc-elbow-half-inch.webp",
    spec: "Lead Free",
    deliveryTime: "60 Mins",
    optionsCount: 5,
    dotsCount: 3,
    unit: "Piece",
  },
  {
    id: "ashirvad-cpvc-tee-half-inch",
    title: "Ashirvad CPVC Equal Tee 1/2 Inch (Heavy Duty SDR-11)",
    brand: "Ashirvad",
    subcategory: "cpvc-fittings",
    type: "Tee",
    price: 26,
    mrp: 40,
    discountPct: 35,
    image: "/images/products/plumbing/ashirvad-cpvc-tee-half-inch.webp",
    spec: "Heavy Duty",
    deliveryTime: "60 Mins",
    optionsCount: 5,
    dotsCount: 3,
    unit: "Piece",
  },
  {
    id: "astral-cpvc-elbow-half-inch",
    title: "Astral CPVC Pro 90° Elbow 3/4 Inch (High Flow Pressure)",
    brand: "Astral",
    subcategory: "cpvc-fittings",
    type: "Elbow",
    price: 24,
    mrp: 38,
    discountPct: 36,
    image: "/images/products/plumbing/astral-cpvc-elbow-half-inch.webp",
    spec: "High Pressure",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "astral-cpvc-valve-half-inch",
    title: "Astral CPVC Compact Ball Valve 1/2 Inch (Quarter Turn)",
    brand: "Astral",
    subcategory: "cpvc-fittings",
    type: "Ball Valve",
    price: 145,
    mrp: 210,
    discountPct: 30,
    image: "/images/products/plumbing/astral-cpvc-valve-half-inch.webp",
    spec: "100% Leak Tested",
    deliveryTime: "60 Mins",
    optionsCount: 3,
    dotsCount: 4,
    unit: "Piece",
  },

  // ── Brass Fittings ──
  {
    id: "astral-cpvc-fta-half-inch",
    title: "Astral CPVC Brass Female Threaded Adapter (FTA) 1/2\" × 1/2\"",
    brand: "Astral",
    subcategory: "brass-fittings",
    type: "Brass FTA",
    price: 85,
    mrp: 125,
    discountPct: 32,
    image: "/images/products/plumbing/astral-cpvc-fta-half-inch.webp",
    spec: "Heavy Brass Insert",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "astral-cpvc-mta-half-inch",
    title: "Astral CPVC Brass Male Threaded Adapter (MTA) 1/2\" × 1/2\"",
    brand: "Astral",
    subcategory: "brass-fittings",
    type: "Brass MTA",
    price: 92,
    mrp: 135,
    discountPct: 31,
    image: "/images/products/plumbing/astral-cpvc-mta-half-inch.webp",
    spec: "Dezincification Resistant",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "jaquar-angular-stop-cock",
    title: "Jaquar Angular Stop Cock with Wall Flange 1/2\" Chrome Plated Brass",
    brand: "Jaquar",
    subcategory: "brass-fittings",
    type: "Stop Cock",
    price: 480,
    mrp: 650,
    discountPct: 26,
    image: "/images/products/plumbing/jaquar-angular-stop-cock.webp",
    spec: "Quarter Turn Ceramic",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "teflon-tape-half-inch-pack-10",
    title: "Plumber PTFE Thread Sealant Teflon Tape 1/2 Inch (Pack of 10)",
    brand: "Generic",
    subcategory: "brass-fittings",
    type: "Teflon Tape",
    price: 75,
    mrp: 120,
    discountPct: 37,
    image: "/images/products/plumbing/teflon-tape-half-inch-pack-10.webp",
    spec: "High Density Seal",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    dotsCount: 3,
    unit: "Pack of 10",
  },

  // ── Overhead Tank ──
  {
    id: "ashirvad-3-layer-tank-1000l",
    title: "Ashirvad 3-Layer Antimicrobial Overhead Water Storage Tank 1000L",
    brand: "Ashirvad",
    subcategory: "overhead-tank",
    type: "Overhead Tank",
    price: 6450,
    mrp: 8900,
    discountPct: 27,
    image: "/images/products/plumbing/ashirvad-3-layer-tank-1000l.webp",
    spec: "Food Grade Virgin HDPE",
    deliveryTime: "60 Mins",
    optionsCount: 3,
    dotsCount: 4,
    unit: "Tank (1000L)",
  },
  {
    id: "ashirvad-3-layer-tank-500l",
    title: "Ashirvad 3-Layer Antimicrobial Overhead Water Storage Tank 500L",
    brand: "Ashirvad",
    subcategory: "overhead-tank",
    type: "Overhead Tank",
    price: 3850,
    mrp: 5200,
    discountPct: 25,
    image: "/images/products/plumbing/ashirvad-3-layer-tank-500l.webp",
    spec: "UV Protected Shield",
    deliveryTime: "60 Mins",
    optionsCount: 3,
    dotsCount: 4,
    unit: "Tank (500L)",
  },
  {
    id: "ashirvad-3-layer-tank-2000l",
    title: "Ashirvad 3-Layer Heavy Duty Overhead Water Tank 2000L",
    brand: "Ashirvad",
    subcategory: "overhead-tank",
    type: "Overhead Tank",
    price: 12800,
    mrp: 16500,
    discountPct: 22,
    image: "/images/products/plumbing/ashirvad-3-layer-tank-2000l.webp",
    spec: "Threaded Lid Lock",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    dotsCount: 4,
    unit: "Tank (2000L)",
  },
];

interface CPVCPlumbingStorefrontProps {
  onOpenDetail?: (product: Product) => void;
}

export function CPVCPlumbingStorefront({
  onOpenDetail,
}: CPVCPlumbingStorefrontProps) {
  const [activeSubcategory, setActiveSubcategory] =
    useState<string>("cpvc-pipes-hardware");
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

  const handleAddToCart = (p: PlumbingProduct) => {
    addToCart.mutate({
      data: {
        materialId: p.id,
        quantity: 1,
        name: p.title,
        price: p.price,
        unit: p.unit,
        vendor: `${p.brand} Official`,
        category: "Plumbing, Sanitary & Bath",
      },
    });
  };

  const handleUpdateQty = (p: PlumbingProduct, newQty: number) => {
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
      id: "cpvc-pipes-hardware",
      label: "CPVC Pipes & Hardware",
      icon: "/images/subcategories/cpvc-pipes-hardware-icon.webp",
    },
    {
      id: "cpvc-fittings",
      label: "CPVC Fittings",
      icon: "/images/subcategories/cpvc-fittings-icon.webp",
    },
    {
      id: "brass-fittings",
      label: "Brass Fittings",
      icon: "/images/subcategories/brass-fittings-icon.webp",
    },
    {
      id: "overhead-tank",
      label: "Overhead Tank",
      icon: "/images/subcategories/overhead-tank-icon.webp",
    },
  ];

  const filteredProducts = useMemo(() => {
    return CPVC_PLUMBING_PRODUCTS.filter(
      (p) => p.subcategory === activeSubcategory,
    );
  }, [activeSubcategory]);

  const openModal = (p: PlumbingProduct) => {
    const mapped: Product = {
      id: p.id,
      title: p.title,
      price: p.price,
      mrp: p.mrp,
      unit: p.unit,
      image: p.image,
      materialTag: "Plumbing, Sanitary & Bath",
      brand: p.brand,
      description: `${p.title} - ${p.spec || "High grade CPVC plumbing solution"}. Tested to NSF/ANSI standards with genuine manufacturer warranty. 60-minute delivery.`,
      rating: 4.8,
      reviews: 184,
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
      {/* ── Main Content Layout: Sidebar + Grid ── */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
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

                        {/* Delivery Time */}
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-[#6B7280]">
                          <Clock className="w-3 h-3 text-[#6B7280]" />
                          <span>{p.deliveryTime}</span>
                        </div>
                      </div>

                      {/* Action Button: Options or Add */}
                      <div className="mt-3 pt-2">
                        {p.optionsCount ? (
                          <button
                            type="button"
                            onClick={() => openModal(p)}
                            className="w-full text-center py-1.5 px-2 rounded-lg border border-[#16A34A] text-[#16A34A] hover:bg-[#EAF7EE] font-bold text-[12.5px] bg-white transition-colors"
                          >
                            {p.optionsCount} Options
                          </button>
                        ) : cartQty === 0 ? (
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
                  category: "Plumbing, Sanitary & Bath",
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
