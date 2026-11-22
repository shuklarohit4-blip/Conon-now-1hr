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

export interface CCTVProduct {
  id: string;
  title: string;
  brand: string;
  model: string;
  subcategory: string;
  price: number;
  mrp: number;
  discountPct: number;
  bulkPrice?: number;
  image: string;
  spec?: string;
  deliveryTime: string;
  dotsCount: number;
}

export const CCTV_PRODUCTS: CCTVProduct[] = [
  {
    id: "cp-plus-4mp-wifi-full-color-pt-camera-cp-z43q",
    title: "CP Plus 4MP Wi-Fi Full Color PT Camera - CP-Z43Q",
    brand: "CP Plus",
    model: "CP-Z43Q",
    subcategory: "cameras",
    price: 3984,
    mrp: 7690,
    discountPct: 48,
    bulkPrice: 3859,
    image: "/images/products/cctv/cp-plus-4mp-wifi-full-color-pt-camera-cp-z43q.webp",
    spec: "345° Pan",
    deliveryTime: "60 Mins",
    dotsCount: 2,
  },
  {
    id: "cp-plus-3mp-4g-sim-camera-ez-r33t",
    title: "CP Plus 3MP 4G Sim Camera - EZ-R33T",
    brand: "CP Plus",
    model: "EZ-R33T",
    subcategory: "cameras",
    price: 2784,
    mrp: 5200,
    discountPct: 46,
    bulkPrice: 2659,
    image: "/images/products/cctv/cp-plus-3mp-4g-sim-camera-ez-r33t.webp",
    spec: "20–30m IR vision",
    deliveryTime: "60 Mins",
    dotsCount: 3,
  },
  {
    id: "cp-plus-2mp-ip-dome-camera-cp-unc-da21l3c-q",
    title: "CP Plus 2MP IP Dome Camera - CP-UNC-DA21L3C-Q",
    brand: "CP Plus",
    model: "CP-UNC-DA21L3C-Q",
    subcategory: "cameras",
    price: 3505,
    mrp: 7300,
    discountPct: 52,
    bulkPrice: 3380,
    image: "/images/products/cctv/cp-plus-2mp-ip-dome-camera-cp-unc-da21l3c-q.webp",
    spec: "PoE powered",
    deliveryTime: "60 Mins",
    dotsCount: 5,
  },
  {
    id: "cp-plus-3mp-wifi-pt-camera-cp-e38q",
    title: "CP Plus 3MP Wi-Fi PT Camera - CP-E38Q",
    brand: "CP Plus",
    model: "CP-E38Q",
    subcategory: "cameras",
    price: 2350,
    mrp: 2400,
    discountPct: 2,
    image: "/images/products/cctv/cp-plus-3mp-wifi-pt-camera-cp-e38q.webp",
    spec: "Human Detection",
    deliveryTime: "60 Mins",
    dotsCount: 2,
  },
  {
    id: "cp-plus-2-4mp-full-hd-ir-bullet-camera-cp-vac-t24l2",
    title: "CP Plus 2.4MP Full HD IR Bullet Camera - CP-VAC-T24L2",
    brand: "CP Plus",
    model: "CP-VAC-T24L2",
    subcategory: "cameras",
    price: 1450,
    mrp: 2650,
    discountPct: 45,
    bulkPrice: 1399,
    image: "/images/products/cctv/cp-plus-2-4mp-full-hd-ir-bullet-camera-cp-vac-t24l2.webp",
    spec: "20m IR Distance",
    deliveryTime: "60 Mins",
    dotsCount: 3,
  },
  {
    id: "cp-plus-3mp-wifi-outdoor-bullet-camera-cp-v32g",
    title: "CP Plus 3MP Wi-Fi Outdoor Bullet Camera - CP-V32G",
    brand: "CP Plus",
    model: "CP-V32G",
    subcategory: "cameras",
    price: 2499,
    mrp: 3850,
    discountPct: 35,
    bulkPrice: 2399,
    image: "/images/products/cctv/cp-plus-3mp-wifi-outdoor-bullet-camera-cp-v32g.webp",
    spec: "IP66 Weatherproof",
    deliveryTime: "60 Mins",
    dotsCount: 4,
  },
  {
    id: "cp-plus-2-4mp-full-hd-ir-dome-camera-cp-vac-d24l2",
    title: "CP Plus 2.4MP Full HD IR Dome Camera - CP-VAC-D24L2",
    brand: "CP Plus",
    model: "CP-VAC-D24L2",
    subcategory: "cameras",
    price: 1350,
    mrp: 2020,
    discountPct: 33,
    bulkPrice: 1299,
    image: "/images/products/cctv/cp-plus-2-4mp-full-hd-ir-dome-camera-cp-vac-d24l2.webp",
    spec: "Wide Angle Lens",
    deliveryTime: "60 Mins",
    dotsCount: 2,
  },
  {
    id: "cp-plus-4mp-ip-dome-camera-cp-unc-da41l3c-q",
    title: "CP Plus 4MP IP Dome Camera - CP-UNC-DA41L3C-Q",
    brand: "CP Plus",
    model: "CP-UNC-DA41L3C-Q",
    subcategory: "cameras",
    price: 4150,
    mrp: 7990,
    discountPct: 48,
    bulkPrice: 3999,
    image: "/images/products/cctv/cp-plus-4mp-ip-dome-camera-cp-unc-da41l3c-q.webp",
    spec: "PoE 30m Smart IR",
    deliveryTime: "60 Mins",
    dotsCount: 3,
  },
];

export const CCTV_SUBCATEGORIES = [
  {
    id: "cameras",
    name: "Cameras",
    icon: "/images/subcategories/cameras-icon.webp",
    count: 8,
  },
  {
    id: "nvr-dvr-switches",
    name: "NVR, DVR & Switches",
    icon: "/images/subcategories/nvr-dvr-switches-icon.webp",
    count: 4,
  },
  {
    id: "cctv-accessories",
    name: "CCTV Accessories",
    icon: "/images/subcategories/cctv-accessories-icon.webp",
    count: 6,
  },
  {
    id: "wifi-networking",
    name: "Wifi & Networking",
    icon: "/images/subcategories/wifi-networking-icon.webp",
    count: 5,
  },
  {
    id: "cctv-cat6-cable",
    name: "CCTV & CAT6 Cable",
    icon: "/images/subcategories/cctv-cat6-cable-icon.webp",
    count: 4,
  },
];

interface CCTVCollectionStorefrontProps {
  onOpenDetail?: (product: Product) => void;
}

export function CCTVCollectionStorefront({ onOpenDetail }: CCTVCollectionStorefrontProps) {
  const [activeSubcat, setActiveSubcat] = useState("cameras");
  const [quickDetailProduct, setQuickDetailProduct] = useState<Product | null>(null);

  const qc = useQueryClient();
  const invalidateCart = () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() });
  const addToCart = useAddToCart({ mutation: { onSuccess: invalidateCart } });
  const updateCartItem = useUpdateCartItem({ mutation: { onSuccess: invalidateCart } });
  const removeFromCart = useRemoveFromCart({ mutation: { onSuccess: invalidateCart } });
  const { data: cart } = useGetCart();

  const cartItemByKey = useMemo(() => {
    const map = new Map<string, { id: string; quantity: number }>();
    if (!cart?.categories) return map;
    for (const c of cart.categories) {
      for (const item of c.items ?? []) {
        if (item.materialId) {
          map.set(item.materialId, { id: String(item.id), quantity: item.quantity });
        }
        if (item.name) {
          map.set(item.name.toLowerCase(), { id: String(item.id), quantity: item.quantity });
        }
      }
    }
    return map;
  }, [cart]);

  const handleAddToCart = (p: CCTVProduct) => {
    addToCart.mutate({
      data: {
        materialId: p.id,
        quantity: 1,
        name: p.title,
        price: p.price,
        unit: "Piece",
        vendor: `${p.brand} Official`,
        category: "CCTV & Networking",
      },
    });
    toast.success(`Added ${p.title} to cart`);
  };

  const handleUpdateQty = (p: CCTVProduct, newQty: number) => {
    const match = cartItemByKey.get(p.id) || cartItemByKey.get(p.title.toLowerCase());
    if (!match) {
      if (newQty > 0) handleAddToCart(p);
      return;
    }
    if (newQty <= 0) {
      removeFromCart.mutate({ itemId: match.id });
      toast.info(`Removed ${p.title} from cart`);
    } else {
      updateCartItem.mutate({ itemId: match.id, data: { quantity: newQty } });
    }
  };

  const displayedProducts = useMemo(() => {
    if (activeSubcat === "cameras") return CCTV_PRODUCTS;
    return CCTV_PRODUCTS.filter((p) => p.subcategory === activeSubcat);
  }, [activeSubcat]);

  return (
    <div className="w-full bg-white min-h-[calc(100vh-140px)]">
      {/* ── Main Container: Sidebar + Product Grid ── */}
      <div className="max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex flex-col md:flex-row gap-0 border-t border-[#EAECEF]">
          {/* ── Left Sidebar Subcategories ── */}
          <aside className="w-full md:w-56 lg:w-60 shrink-0 border-b md:border-b-0 md:border-r border-[#EAECEF] bg-white py-2">
            <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible scrollbar-hide py-1">
              {CCTV_SUBCATEGORIES.map((cat) => {
                const isActive = activeSubcat === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveSubcat(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors relative group shrink-0 md:shrink ${
                      isActive
                        ? "bg-[#EAF7EE] text-[#111827] font-bold"
                        : "text-[#374151] hover:bg-slate-50 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                        <img
                          src={cat.icon}
                          alt={cat.name}
                          className="w-7 h-7 object-contain"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-[13px] leading-tight line-clamp-2">
                        {cat.name}
                      </span>
                    </div>

                    {/* Active Solid Green Right Border Accent */}
                    {isActive && (
                      <span className="hidden md:block absolute right-0 top-0 bottom-0 w-[3px] bg-[#16A34A]" />
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* ── Right Content Area: Product Grid ── */}
          <main className="flex-1 p-3 sm:p-5">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {displayedProducts.map((p) => {
                const match = cartItemByKey.get(p.id) || cartItemByKey.get(p.title.toLowerCase());
                const cartQty = match?.quantity ?? 0;

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-lg border border-[#E5E7EB] p-2.5 sm:p-3 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
                  >
                    {/* Blue Bookmark Ribbon Badge: Save XX% */}
                    <div className="absolute top-2 left-2 z-10 bg-[#0066FF] text-white text-[9.5px] font-bold px-1.5 pt-0.5 pb-1 rounded-t-xs shadow-xs flex flex-col items-center justify-center leading-[1.05]">
                      <span>Save</span>
                      <span>{p.discountPct}%</span>
                      {/* Notch cut-out at bottom of ribbon */}
                      <div
                        className="absolute -bottom-1 left-0 right-0 h-1 bg-[#0066FF]"
                        style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                      />
                    </div>

                    {/* Product Image Box */}
                    <div
                      onClick={() => {
                        const standardProduct: Product = {
                          id: p.id,
                          title: p.title,
                          description: `${p.brand} ${p.model} High Definition Security Camera`,
                          price: p.price,
                          mrp: p.mrp,
                          unit: "Piece",
                          image: p.image,
                          rating: 4.8,
                          reviews: 142,
                          deliveryEta: "Today, in 60 Mins",
                          brand: p.brand,
                          materialTag: "CCTV & Networking",
                        };
                        if (onOpenDetail) onOpenDetail(standardProduct);
                        else setQuickDetailProduct(standardProduct);
                      }}
                      className="w-full aspect-square bg-white rounded-md flex items-center justify-center p-2 cursor-pointer overflow-hidden relative group-hover:scale-[1.02] transition-transform"
                    >
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />

                      {/* Carousel Indicator Dots at bottom right */}
                      <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1">
                        {Array.from({ length: p.dotsCount }).map((_, idx) => (
                          <span
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full ${
                              idx === 0 ? "bg-[#374151]" : "bg-[#D1D5DB]"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Details Container */}
                    <div className="mt-2 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Price Row: Current Price + Strikethrough MRP + incl GST */}
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-[16px] sm:text-[17px] font-black text-[#111827]">
                            ₹{p.price.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[11px] text-[#9CA3AF] line-through">
                            ₹{p.mrp.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[9.5px] text-[#9CA3AF]">
                            (incl GST)
                          </span>
                        </div>

                        {/* Bulk Price Pill (if available) */}
                        {p.bulkPrice ? (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-0.5 text-[10.5px] font-semibold text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded-xs">
                              <span>Bulk price ₹{p.bulkPrice.toLocaleString("en-IN")}</span>
                              <ChevronRight className="w-3 h-3 stroke-[2.5]" />
                            </span>
                          </div>
                        ) : null}

                        {/* Title: 2 lines clamped */}
                        <h3 className="text-[12px] sm:text-[12.5px] font-bold text-[#1F2937] leading-[1.3] mt-1.5 line-clamp-2">
                          {p.title}
                        </h3>

                        {/* Cashback & Delivery row */}
                        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap text-[10px]">
                          <span className="bg-[#15803D] text-white font-bold px-1.5 py-0.5 rounded-xs text-[9px] shrink-0">
                            Assured 1% cashback
                          </span>
                          <span className="text-[#6B7280] font-medium text-[9.5px]">
                            Free Delivery on ₹1000+
                          </span>
                        </div>

                        {/* Spec highlight */}
                        {p.spec && (
                          <div className="mt-1 text-[10.5px] text-[#4B5563] font-medium">
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
                  unit: p.unit || "Piece",
                  vendor: `${p.brand || "CP Plus"} Official`,
                  category: "CCTV & Networking",
                },
              });
            }
          }}
        />
      )}
    </div>
  );
}
