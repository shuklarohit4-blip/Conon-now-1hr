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
import { RealProductImage } from "@/components/RealProductImage";

export interface LightingProduct {
  id: string;
  title: string;
  brand: string;
  subcategory:
    | "ceiling-panel-lights"
    | "cob-spot-lights"
    | "strip-lights-profiles"
    | "light-battens"
    | "furniture-cabinetry-lighting"
    | "outdoor-lights"
    | "bulbs";
  price: number;
  mrp: number;
  discountPct: number;
  image: string;
  spec?: string;
  deliveryTime: string;
  optionsCount?: number;
  dotsCount: number;
}

export const LIGHTING_PRODUCTS: LightingProduct[] = [
  {
    id: "wipro-garnet-rimless-round-led-surface-panel-light",
    title: "Wipro Garnet Rimless Round LED Surface Panel Light (2 Years Warranty)",
    brand: "Wipro",
    subcategory: "ceiling-panel-lights",
    price: 389,
    mrp: 890,
    discountPct: 56,
    image: "/images/products/lighting/wipro-garnet-rimless-round-led-surface-panel-light.webp",
    spec: "3.5 KV Surge",
    deliveryTime: "60 Mins",
    optionsCount: 9,
    dotsCount: 5,
  },
  {
    id: "philips-full-glow-led-surface-light-round",
    title: "Philips Full Glow LED Surface Light, Round",
    brand: "Philips",
    subcategory: "ceiling-panel-lights",
    price: 518,
    mrp: 775,
    discountPct: 33,
    image: "/images/products/lighting/philips-full-glow-led-surface-light-round.webp",
    spec: "Slim 2.9 cm",
    deliveryTime: "60 Mins",
    optionsCount: 12,
    dotsCount: 4,
  },
  {
    id: "sturlite-lexxo-trimless-surface-mount-led-downlight",
    title: "Sturlite LEXXO Trimless Surface Mount LED Downlight (Round)",
    brand: "Sturlite",
    subcategory: "ceiling-panel-lights",
    price: 242,
    mrp: 242,
    discountPct: 0,
    image: "/images/products/lighting/sturlite-lexxo-trimless-surface-mount-led-downlight.webp",
    spec: "2-yr warranty",
    deliveryTime: "60 Mins",
    optionsCount: 6,
    dotsCount: 4,
  },
  {
    id: "wipro-garnet-rimless-3in1-cct-surface-mounted-led-panel",
    title: "Wipro Garnet Rimless 3-in-1 CCT Surface Mounted LED Panel (2 Years Warranty)",
    brand: "Wipro",
    subcategory: "ceiling-panel-lights",
    price: 579,
    mrp: 990,
    discountPct: 42,
    image: "/images/products/lighting/wipro-garnet-rimless-3in1-cct-surface-mounted-led-panel.webp",
    spec: "100 Lm/W",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    dotsCount: 5,
  },
  {
    id: "wipro-garnet-wave-led-slim-panel-square-18w",
    title: "Wipro Garnet Wave LED Slim Panel Light, Square (18W)",
    brand: "Wipro",
    subcategory: "ceiling-panel-lights",
    price: 449,
    mrp: 650,
    discountPct: 31,
    image: "/images/products/lighting/wipro-garnet-wave-led-slim-panel-square-18w.webp",
    spec: "High Lumen Output",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    dotsCount: 3,
  },
  {
    id: "philips-stellar-bright-rimless-surface-downlight-15w",
    title: "Philips Stellar Bright Rimless Surface LED Downlight, Round (15W)",
    brand: "Philips",
    subcategory: "ceiling-panel-lights",
    price: 495,
    mrp: 840,
    discountPct: 41,
    image: "/images/products/lighting/philips-stellar-bright-rimless-surface-downlight-15w.webp",
    spec: "EyeComfort Tech",
    deliveryTime: "60 Mins",
    optionsCount: 6,
    dotsCount: 4,
  },
  {
    id: "philips-star-glass-downlight-recessed-ceiling-panel-12w",
    title: "Philips Star Glass Downlight Recessed Ceiling Panel (12W)",
    brand: "Philips",
    subcategory: "ceiling-panel-lights",
    price: 399,
    mrp: 799,
    discountPct: 50,
    image: "/images/products/lighting/philips-star-glass-downlight-recessed-ceiling-panel-12w.webp",
    spec: "Frosted Diffuser",
    deliveryTime: "60 Mins",
    optionsCount: 3,
    dotsCount: 3,
  },
  {
    id: "syska-ultraslim-led-recessed-ceiling-panel-light-7w",
    title: "Syska UltraSlim LED Recessed Ceiling Panel Light (7W)",
    brand: "Syska",
    subcategory: "ceiling-panel-lights",
    price: 199,
    mrp: 435,
    discountPct: 54,
    image: "/images/products/lighting/syska-ultraslim-led-recessed-ceiling-panel-light-7w.webp",
    spec: "Aluminium Heat Sink",
    deliveryTime: "60 Mins",
    optionsCount: 5,
    dotsCount: 4,
  },
  // Supporting products for other tabs to bring total to 12
  {
    id: "philips-cob-spotlight-recessed-7w",
    title: "Philips Deep Recessed Anti-Glare COB Spotlight 7W (Warm White 3000K)",
    brand: "Philips",
    subcategory: "cob-spot-lights",
    price: 549,
    mrp: 890,
    discountPct: 38,
    image: "/images/subcategories/cob-spot-lights-icon.webp",
    spec: "36° Beam Angle",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    dotsCount: 3,
  },
  {
    id: "wipro-dglow-strip-light-5m-warm",
    title: "Wipro D-Glow Flexible 5M 300-LED Strip Light Reel with Power Adapter",
    brand: "Wipro",
    subcategory: "strip-lights-profiles",
    price: 680,
    mrp: 1200,
    discountPct: 43,
    image: "/images/products/electrical/led-strip-light-5m-warm.webp",
    spec: "IP65 Waterproof",
    deliveryTime: "60 Mins",
    optionsCount: 3,
    dotsCount: 4,
  },
  {
    id: "philips-t5-high-lumen-20w-tube-batten",
    title: "Philips T5 Ultra-Bright 20W 4-Foot LED Tube Batten Light",
    brand: "Philips",
    subcategory: "light-battens",
    price: 280,
    mrp: 450,
    discountPct: 37,
    image: "/images/products/electrical/philips-led-tube-20w-4ft.webp",
    spec: "Surge Protected 4KV",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    dotsCount: 3,
  },
  {
    id: "philips-stellar-smart-led-bulb-12w-b22",
    title: "Philips Stellar Multi-Wattage Inverter Backup LED Bulb 12W B22",
    brand: "Philips",
    subcategory: "bulbs",
    price: 340,
    mrp: 599,
    discountPct: 43,
    image: "/images/products/electrical/philips-led-bulb-12w-b22.webp",
    spec: "4 Hr Power Backup",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    dotsCount: 3,
  },
];

interface LightingCollectionStorefrontProps {
  onOpenDetail?: (product: Product) => void;
}

export function LightingCollectionStorefront({
  onOpenDetail,
}: LightingCollectionStorefrontProps) {
  const [activeSubcategory, setActiveSubcategory] =
    useState<string>("ceiling-panel-lights");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
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

  const handleAddToCart = (p: LightingProduct) => {
    addToCart.mutate({
      data: {
        materialId: p.id,
        quantity: 1,
        name: p.title,
        price: p.price,
        unit: "Piece",
        vendor: `${p.brand} Official`,
        category: "Lighting",
      },
    });
  };

  const handleUpdateQty = (p: LightingProduct, newQty: number) => {
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
      id: "ceiling-panel-lights",
      label: "Ceiling Panel Lights",
      icon: "/images/subcategories/ceiling-panel-lights-icon.webp",
    },
    {
      id: "cob-spot-lights",
      label: "COB & Spot Lights",
      icon: "/images/subcategories/cob-spot-lights-icon.webp",
    },
    {
      id: "strip-lights-profiles",
      label: "Strip Lights & Profiles",
      icon: "/images/subcategories/strip-lights-profiles-icon.webp",
    },
    {
      id: "light-battens",
      label: "Light Battens",
      icon: "/images/subcategories/light-battens-icon.webp",
    },
    {
      id: "furniture-cabinetry-lighting",
      label: "Furniture & Cabinetry Lighting",
      icon: "/images/subcategories/furniture-cabinetry-lighting-icon.webp",
    },
    {
      id: "outdoor-lights",
      label: "Outdoor Lights",
      icon: "/images/subcategories/outdoor-lights-icon.webp",
    },
    {
      id: "bulbs",
      label: "Bulbs",
      icon: "/images/subcategories/bulbs-icon.webp",
    },
  ];

  const filteredProducts = useMemo(() => {
    return LIGHTING_PRODUCTS.filter((p) => {
      if (activeSubcategory && p.subcategory !== activeSubcategory)
        return false;
      if (selectedBrand !== "All" && p.brand !== selectedBrand) return false;
      return true;
    });
  }, [activeSubcategory, selectedBrand]);

  const openModal = (p: LightingProduct) => {
    const mapped: Product = {
      id: p.id,
      title: p.title,
      price: p.price,
      mrp: p.mrp,
      unit: "Piece",
      image: p.image,
      materialTag: "Lighting",
      brand: p.brand,
      description: `${p.title} - ${p.spec || "High efficiency LED lighting solution"}. Genuine manufacturer warranty with 60-minute doorstep delivery.`,
      rating: 4.8,
      reviews: 168,
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
            href="/collections/electrical-wires"
            className="hover:text-[#111827] transition-colors"
          >
            Electrical
          </a>
          <span className="text-[#9CA3AF]">›</span>
          <span className="text-[#111827] font-medium">Ceiling Panel Lights</span>
        </nav>

        {/* Page Title */}
        <h1 className="text-[26px] sm:text-[30px] font-bold text-[#111827] tracking-tight mt-2.5">
          Ceiling Panel Lights
        </h1>
      </div>

      {/* Main Content Layout: Sidebar + Grid */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Left Sidebar Subcategories */}
          <aside className="w-full md:w-[220px] flex-shrink-0">
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
                    <div className="w-9 h-9 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center p-0.5 flex-shrink-0 shadow-sm overflow-hidden">
                      <img
                        src={sc.icon}
                        alt={sc.label}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-[12.5px] leading-snug">{sc.label}</span>
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
                <div className="relative inline-block">
                  <select
                    value={activeSubcategory}
                    onChange={(e) => setActiveSubcategory(e.target.value)}
                    className="text-[12.5px] border border-[#D1D5DB] rounded-md px-2.5 py-1.5 bg-white text-[#374151] font-medium focus:outline-none focus:ring-1 focus:ring-[#16A34A] cursor-pointer"
                  >
                    <option value="ceiling-panel-lights">
                      Category: Ceiling Panel Lights
                    </option>
                    <option value="cob-spot-lights">COB & Spot Lights</option>
                    <option value="strip-lights-profiles">
                      Strip Lights & Profiles
                    </option>
                    <option value="light-battens">Light Battens</option>
                    <option value="furniture-cabinetry-lighting">
                      Furniture & Cabinetry
                    </option>
                    <option value="outdoor-lights">Outdoor Lights</option>
                    <option value="bulbs">Bulbs</option>
                  </select>
                </div>

                <div className="relative inline-block">
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="text-[12.5px] border border-[#D1D5DB] rounded-md px-2.5 py-1.5 bg-white text-[#374151] font-medium focus:outline-none focus:ring-1 focus:ring-[#16A34A] cursor-pointer"
                  >
                    <option value="All">Brand ▾</option>
                    <option value="Wipro">Wipro</option>
                    <option value="Philips">Philips</option>
                    <option value="Sturlite">Sturlite</option>
                    <option value="Syska">Syska</option>
                  </select>
                </div>

                <div className="relative inline-block">
                  <select className="text-[12.5px] border border-[#D1D5DB] rounded-md px-2.5 py-1.5 bg-white text-[#374151] font-medium focus:outline-none focus:ring-1 focus:ring-[#16A34A] cursor-pointer">
                    <option value="all">Type ▾</option>
                    <option value="surface">Surface Mount</option>
                    <option value="recessed">Recessed / Trimless</option>
                    <option value="cct">3-in-1 CCT Tunable</option>
                  </select>
                </div>

                <div className="relative inline-block">
                  <select className="text-[12.5px] border border-[#D1D5DB] rounded-md px-2.5 py-1.5 bg-white text-[#374151] font-medium focus:outline-none focus:ring-1 focus:ring-[#16A34A] cursor-pointer">
                    <option value="all">Size ▾</option>
                    <option value="round">Round</option>
                    <option value="square">Square</option>
                  </select>
                </div>

                <div className="relative inline-block">
                  <select className="text-[12.5px] border border-[#D1D5DB] rounded-md px-2.5 py-1.5 bg-white text-[#374151] font-medium focus:outline-none focus:ring-1 focus:ring-[#16A34A] cursor-pointer">
                    <option value="all">Colors ▾</option>
                    <option value="cool-white">Cool Day White (6500K)</option>
                    <option value="warm-white">Warm White (3000K)</option>
                    <option value="natural-white">Natural White (4000K)</option>
                  </select>
                </div>

                <div className="relative inline-block">
                  <select className="text-[12.5px] border border-[#D1D5DB] rounded-md px-2.5 py-1.5 bg-white text-[#374151] font-medium focus:outline-none focus:ring-1 focus:ring-[#16A34A] cursor-pointer">
                    <option value="all">Price ▾</option>
                    <option value="under300">Under ₹300</option>
                    <option value="300-600">₹300 - ₹600</option>
                    <option value="above600">Above ₹600</option>
                  </select>
                </div>
              </div>

              {/* Product Count & Sort */}
              <div className="flex items-center gap-4 text-[13px] text-[#4B5563]">
                <span>
                  <strong className="text-[#111827] font-semibold">12</strong>{" "}
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
                    {/* Blue Bookmark Ribbon Badge Top-Left with Triangle Notch */}
                    {p.discountPct > 0 && (
                      <div className="absolute top-0 left-3 z-10">
                        <div className="bg-[#2563EB] text-white text-[11px] font-bold px-2 pt-1 pb-1 text-center shadow-sm relative">
                          <span className="block leading-none">Save</span>
                          <span className="block leading-tight">
                            {p.discountPct}%
                          </span>
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
                      <RealProductImage
                        product={p}
                        src={p.image}
                        alt={p.title}
                        title={p.title}
                        brand={p.brand}
                        category="lighting"
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
                          {p.mrp > p.price ? (
                            <span className="text-[11.5px] text-[#9CA3AF] line-through">
                              ₹{p.mrp.toLocaleString("en-IN")} (incl GST)
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#9CA3AF]">
                              (incl GST)
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

                      {/* Action Button: Options or Stepper */}
                      <div className="mt-3 pt-2 border-t border-[#F3F4F6]">
                        {cartQty === 0 ? (
                          <button
                            type="button"
                            onClick={() => openModal(p)}
                            className="w-full text-center py-1.5 px-2 rounded-lg border border-[#16A34A] text-[#16A34A] hover:bg-[#EAF7EE] font-bold text-[12.5px] bg-white transition-colors"
                          >
                            {p.optionsCount ? `${p.optionsCount} Options` : "Add"}
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
                  vendor: `${p.brand || "Wipro"} Official`,
                  category: "Lighting",
                },
              });
            }
          }}
        />
      )}
    </div>
  );
}
