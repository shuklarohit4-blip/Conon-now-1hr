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

export interface FevicolProduct {
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

export const WOOD_ADHESIVES_PRODUCTS: FevicolProduct[] = [
  {
    id: "fevicol-heatx-heatproof-adhesive",
    title: "Fevicol HeatX Heatproof Adhesive",
    brand: "Fevicol",
    categoryTag: "Heatproof Adhesive",
    type: "HeatX",
    packSize: "500g Tin",
    price: 300,
    mrp: 314,
    discountPct: 4,
    image: "/images/products/adhesives/fevicol-heatx-heatproof-adhesive-500g.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Near-Hob Tops",
    deliveryTime: "60 Mins",
    optionsCount: 3,
    materialTag: "Adhesives",
    unit: "500g Tin",
    rating: 4.9,
  },
  {
    id: "fevicol-marine-waterproof-adhesive",
    title: "Fevicol Marine Waterproof Adhesive",
    brand: "Fevicol",
    categoryTag: "Waterproof Adhesive",
    type: "Marine",
    packSize: "1 Kg Pack",
    price: 364,
    mrp: 428,
    discountPct: 15,
    image: "/images/products/adhesives/fevicol-marine-waterproof-adhesive-1kg.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Set in 4–6 hrs",
    deliveryTime: "60 Mins",
    optionsCount: 6,
    materialTag: "Adhesives",
    unit: "1 Kg Pack",
    rating: 4.9,
  },
  {
    id: "fevicol-probond-special-adhesive",
    title: "Pidilite Fevicol Probond Special Adhesive for PVC Sheets & Tapes",
    brand: "Pidilite",
    categoryTag: "PVC & Edgeband",
    type: "Probond",
    packSize: "1 Kg Bottle",
    price: 426,
    mrp: 484,
    discountPct: 12,
    image: "/images/products/adhesives/fevicol-probond-special-pvc-adhesive-1kg.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Press 2–5 min",
    deliveryTime: "60 Mins",
    optionsCount: 3,
    materialTag: "Adhesives",
    unit: "1 Kg Bottle",
    rating: 4.8,
  },
  {
    id: "fevicol-sh-adhesive",
    title: "Fevicol SH Adhesive",
    brand: "Fevicol",
    categoryTag: "Synthetic Resin",
    type: "SH Ultimate",
    packSize: "1 Kg Jar",
    price: 297,
    mrp: 338,
    discountPct: 12,
    image: "/images/products/adhesives/fevicol-sh-adhesive-1kg-synthetic-resin.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Bonds ply",
    deliveryTime: "60 Mins",
    optionsCount: 7,
    materialTag: "Adhesives",
    unit: "1 Kg Jar",
    rating: 4.9,
  },
  {
    id: "fevicol-hiper-fast-wood-adhesive",
    title: "Fevicol Hi-Per Super Fast Setting Wood Adhesive",
    brand: "Fevicol",
    categoryTag: "Fast Setting",
    type: "Hi-Per",
    packSize: "1 Kg Bucket",
    price: 340,
    mrp: 400,
    discountPct: 15,
    image: "/images/products/adhesives/fevicol-marine-5kg-bucket.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Set in 2–3 hrs",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    materialTag: "Adhesives",
    unit: "1 Kg Bucket",
    rating: 4.8,
  },
  {
    id: "fevicol-marine-5kg-bucket",
    title: "Fevicol Marine Waterproof Adhesive, 5 Kg Bucket",
    brand: "Fevicol",
    categoryTag: "Waterproof Adhesive",
    type: "Marine",
    packSize: "5 Kg Bucket",
    price: 1650,
    mrp: 1920,
    discountPct: 14,
    image: "/images/products/adhesives/fevicol-marine-5kg-bucket.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "72hr Boiling Water Proof",
    deliveryTime: "60 Mins",
    optionsCount: 5,
    materialTag: "Adhesives",
    unit: "5 Kg Bucket",
    rating: 4.9,
  },
  {
    id: "fevicol-speedx-instant-adhesive",
    title: "Fevicol SpeedX Instant Synthetic Resin Adhesive",
    brand: "Fevicol",
    categoryTag: "Fast Setting",
    type: "SpeedX",
    packSize: "1 Kg Pack",
    price: 325,
    mrp: 380,
    discountPct: 15,
    image: "/images/products/adhesives/fevicol-sh-adhesive-1kg-synthetic-resin.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Fast Setting 2 Hrs",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    materialTag: "Adhesives",
    unit: "1 Kg Pack",
    rating: 4.8,
  },
  {
    id: "fevicol-sh-50kg-drum",
    title: "Fevicol SH Synthetic Resin Adhesive, 50 Kg Drum",
    brand: "Fevicol",
    categoryTag: "Synthetic Resin",
    type: "SH Drum",
    packSize: "50 Kg Drum",
    price: 11800,
    mrp: 13100,
    discountPct: 10,
    image: "/images/products/adhesives/fevicol-sh-50kg-drum.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Ultimate Strength & Coverage",
    deliveryTime: "60 Mins",
    optionsCount: 3,
    materialTag: "Adhesives",
    unit: "50 Kg Drum",
    rating: 5.0,
  },
];

export const EPOXY_ADHESIVES_PRODUCTS: FevicolProduct[] = [
  {
    id: "araldite-standard-epoxy-90g",
    title: "Araldite Standard Epoxy Adhesive Compound 90g",
    brand: "Araldite",
    categoryTag: "Epoxy",
    type: "Standard",
    packSize: "90g Pack",
    price: 180,
    mrp: 215,
    discountPct: 16,
    image: "/images/products/adhesives/araldite-standard-90g.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "High Strength 2-Part Bond",
    deliveryTime: "60 Mins",
    optionsCount: 3,
    materialTag: "Adhesives",
    unit: "90g Pack",
    rating: 4.8,
  },
  {
    id: "araldite-klear-epoxy-90g",
    title: "Araldite Klear 5-Minute Fast Setting Epoxy 90g",
    brand: "Araldite",
    categoryTag: "Epoxy",
    type: "Klear",
    packSize: "90g Pack",
    price: 220,
    mrp: 260,
    discountPct: 15,
    image: "/images/products/adhesives/araldite-klear-90g.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Crystal Clear Glass & Metal",
    deliveryTime: "60 Mins",
    optionsCount: 3,
    materialTag: "Adhesives",
    unit: "90g Pack",
    rating: 4.8,
  },
  {
    id: "araldite-rapid-epoxy-36ml",
    title: "Araldite Rapid Heavy Duty Syringe Pack 36ml",
    brand: "Araldite",
    categoryTag: "Epoxy",
    type: "Rapid Syringe",
    packSize: "36ml Pack",
    price: 150,
    mrp: 180,
    discountPct: 17,
    image: "/images/products/adhesives/araldite-rapid-36ml.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "10-Minute Rapid Cure",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    materialTag: "Adhesives",
    unit: "36ml Syringe",
    rating: 4.7,
  },
  {
    id: "fevikwik-precision-20g",
    title: "Fevikwik Instant Cyanoacrylate Adhesive 20g Nozzle",
    brand: "Fevikwik",
    categoryTag: "Instant Glue",
    type: "Instant Bond",
    packSize: "20g Bottle",
    price: 65,
    mrp: 80,
    discountPct: 19,
    image: "/images/products/adhesives/fevikwik-2g-tube.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Instant 5-Second Fix",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    materialTag: "Adhesives",
    unit: "20g Bottle",
    rating: 4.9,
  },
  {
    id: "fevicol-sr-998-1l",
    title: "Fevicol SR 998 Synthetic Rubber Adhesive 1L",
    brand: "Fevicol",
    categoryTag: "Rubber Adhesive",
    type: "SR 998",
    packSize: "1 L Tin",
    price: 380,
    mrp: 440,
    discountPct: 14,
    image: "/images/products/tiles/fevicol-sr-998-rubber-1l.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Rubber, Flooring & Foam",
    deliveryTime: "60 Mins",
    optionsCount: 3,
    materialTag: "Adhesives",
    unit: "1 L Tin",
    rating: 4.8,
  },
];

export const SEALANTS_PRODUCTS: FevicolProduct[] = [
  {
    id: "m-seal-epoxy-compound-1kg",
    title: "M-Seal General Purpose Epoxy Compound 1 Kg",
    brand: "M-Seal",
    categoryTag: "Epoxy Putty",
    type: "General Purpose",
    packSize: "1 Kg Pack",
    price: 240,
    mrp: 290,
    discountPct: 17,
    image: "/images/products/adhesives/m-seal-epoxy-1kg.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Seals Leaks, Joins & Fills",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    materialTag: "Adhesives",
    unit: "1 Kg Pack",
    rating: 4.9,
  },
  {
    id: "m-seal-phataphat-25g",
    title: "M-Seal Phataphat Fast Curing Epoxy Compound 25g",
    brand: "M-Seal",
    categoryTag: "Epoxy Putty",
    type: "Phataphat",
    packSize: "25g Pack",
    price: 20,
    mrp: 25,
    discountPct: 20,
    image: "/images/products/adhesives/m-seal-phataphat-25g.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Hardens in 30 Mins",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    materialTag: "Adhesives",
    unit: "25g Pack",
    rating: 4.8,
  },
  {
    id: "m-seal-pv-seal-100g",
    title: "M-Seal PV-Seal Heavy Duty Clear PVC Solvent Cement 100g",
    brand: "M-Seal",
    categoryTag: "Solvent Cement",
    type: "PV-Seal",
    packSize: "100g Tube",
    price: 75,
    mrp: 90,
    discountPct: 17,
    image: "/images/products/adhesives/m-seal-pv-seal-pvc-100g.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "High Pressure Pipe Joints",
    deliveryTime: "60 Mins",
    optionsCount: 3,
    materialTag: "Adhesives",
    unit: "100g Tube",
    rating: 4.8,
  },
  {
    id: "dr-fixit-silicone-sealant-clear",
    title: "Dr. Fixit Silicone Sealant GP Clear Cartridge 280ml",
    brand: "Dr. Fixit",
    categoryTag: "Silicone Sealant",
    type: "GP Silicone",
    packSize: "280ml Cartridge",
    price: 290,
    mrp: 350,
    discountPct: 17,
    image: "/images/products/adhesives/dr-fixit-lw-plus-5l.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Weatherproof Glass & Tile",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    materialTag: "Adhesives",
    unit: "280ml Cartridge",
    rating: 4.8,
  },
  {
    id: "dr-fixit-crack-x-paste-1kg",
    title: "Dr. Fixit Crack-X Paste Acrylic Wall Crack Sealant 1 Kg",
    brand: "Dr. Fixit",
    categoryTag: "Crack Filler",
    type: "Crack-X",
    packSize: "1 Kg Tub",
    price: 260,
    mrp: 310,
    discountPct: 16,
    image: "/images/products/adhesives/dr-fixit-urp-302-5kg.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Non-Shrink Flexible Filler",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    materialTag: "Adhesives",
    unit: "1 Kg Tub",
    rating: 4.7,
  },
];

export interface FevicolSubcategory {
  id: string;
  name: string;
  icon: string;
  count: number;
  products: FevicolProduct[];
}

export const FEVICOL_SUBCATEGORIES: FevicolSubcategory[] = [
  {
    id: "wood-adhesives",
    name: "Wood Adhesives",
    icon: "/images/subcategories/wood-adhesives-icon.webp",
    count: 8,
    products: WOOD_ADHESIVES_PRODUCTS,
  },
  {
    id: "epoxy-special",
    name: "Epoxy & Special Adhesives",
    icon: "/images/subcategories/epoxy-special-adhesives-icon.webp",
    count: 5,
    products: EPOXY_ADHESIVES_PRODUCTS,
  },
  {
    id: "sealants",
    name: "Sealants",
    icon: "/images/subcategories/sealants-icon.webp",
    count: 5,
    products: SEALANTS_PRODUCTS,
  },
];

interface FevicolCollectionStorefrontProps {
  onBackToDirectory?: () => void;
  onOpenDetail?: (product: Product) => void;
}

export const FevicolCollectionStorefront: React.FC<FevicolCollectionStorefrontProps> = ({
  onBackToDirectory,
  onOpenDetail,
}) => {
  const [activeSubcatId, setActiveSubcatId] = useState<string>("wood-adhesives");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedPrice, setSelectedPrice] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("Relevance");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

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

  const activeSubcat =
    FEVICOL_SUBCATEGORIES.find((s) => s.id === activeSubcatId) || FEVICOL_SUBCATEGORIES[0];

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    activeSubcat.products.forEach((p) => set.add(p.categoryTag));
    return ["All", ...Array.from(set)];
  }, [activeSubcat]);

  const brandOptions = useMemo(() => {
    const set = new Set<string>();
    activeSubcat.products.forEach((p) => set.add(p.brand));
    return ["All", ...Array.from(set)];
  }, [activeSubcat]);

  const typeOptions = useMemo(() => {
    const set = new Set<string>();
    activeSubcat.products.forEach((p) => set.add(p.type));
    return ["All", ...Array.from(set)];
  }, [activeSubcat]);

  const priceOptions = ["All", "Under ₹300", "₹300 - ₹500", "Above ₹500"];

  const filteredProducts = useMemo(() => {
    let list = activeSubcat.products.filter((p) => {
      if (selectedCategoryFilter !== "All" && p.categoryTag !== selectedCategoryFilter) return false;
      if (selectedBrand !== "All" && p.brand !== selectedBrand) return false;
      if (selectedType !== "All" && p.type !== selectedType) return false;

      if (selectedPrice === "Under ₹300" && p.price >= 300) return false;
      if (selectedPrice === "₹300 - ₹500" && (p.price < 300 || p.price > 500)) return false;
      if (selectedPrice === "Above ₹500" && p.price <= 500) return false;

      return true;
    });

    if (sortBy === "Price: Low to High") {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === "Price: High to Low") {
      list = [...list].sort((a, b) => b.price - a.price);
    }

    return list;
  }, [activeSubcat, selectedCategoryFilter, selectedBrand, selectedType, selectedPrice, sortBy]);

  const resetAllFilters = () => {
    setSelectedCategoryFilter("All");
    setSelectedBrand("All");
    setSelectedType("All");
    setSelectedPrice("All");
  };

  const hasActiveFilters =
    selectedCategoryFilter !== "All" ||
    selectedBrand !== "All" ||
    selectedType !== "All" ||
    selectedPrice !== "All";

  const handleAddToCart = (p: FevicolProduct) => {
    addToCart.mutate(
      {
        data: {
          category: p.materialTag,
          name: p.title,
          unitPrice: p.price,
          unit: p.unit,
          quantity: 1,
        },
      },
      {
        onSuccess: () => toast.success(`Added ${p.title} to cart`),
        onError: () => toast.error("Could not add to cart"),
      }
    );
  };

  const handleIncrement = (p: FevicolProduct) => {
    const key = `${p.materialTag.toLowerCase()}::${p.title.toLowerCase()}`;
    const entry = cartItemByKey[key];
    if (!entry || entry.ids.length === 0) {
      handleAddToCart(p);
      return;
    }
    const itemId = entry.ids[0];
    updateCartItem.mutate({
      id: itemId,
      data: { quantity: entry.quantity + 1 },
    });
  };

  const handleDecrement = (p: FevicolProduct) => {
    const key = `${p.materialTag.toLowerCase()}::${p.title.toLowerCase()}`;
    const entry = cartItemByKey[key];
    if (!entry || entry.ids.length === 0) return;
    const itemId = entry.ids[0];
    if (entry.quantity <= 1) {
      removeFromCart.mutate({ id: itemId });
    } else {
      updateCartItem.mutate({
        id: itemId,
        data: { quantity: entry.quantity - 1 },
      });
    }
  };

  const getQty = (p: FevicolProduct) => {
    const key = `${p.materialTag.toLowerCase()}::${p.title.toLowerCase()}`;
    return cartItemByKey[key]?.quantity ?? 0;
  };

  const toGenericProduct = (p: FevicolProduct): Product => ({
    id: p.id,
    title: p.title,
    brand: p.brand,
    price: p.price,
    mrp: p.mrp,
    image: p.image,
    materialTag: p.materialTag,
    rating: p.rating || 4.9,
    reviews: 1420,
    unit: p.unit,
    vendor: p.brand,
  });

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* ── Main Storefront Container (Breadcrumbs + Heading + Layout) ── */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Breadcrumb row */}
        <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500 mb-2" aria-label="Breadcrumb">
          <button
            type="button"
            onClick={onBackToDirectory}
            className="hover:text-blue-600 transition hover:underline"
          >
            Home
          </button>
          <span className="text-slate-400">›</span>
          <span className="hover:text-blue-600 transition">Fevicol, Adhesives &amp; Sealants</span>
          <span className="text-slate-400">›</span>
          <span className="font-semibold text-slate-900">{activeSubcat.name}</span>
        </nav>

        {/* Big Heading */}
        <div className="flex items-center justify-between pb-3">
          <h1 className="text-[24px] sm:text-[28px] font-extrabold text-[#111827] tracking-tight">
            {activeSubcat.name}
          </h1>
          {onBackToDirectory && (
            <button
              type="button"
              onClick={onBackToDirectory}
              className="text-[12.5px] font-semibold text-blue-600 hover:underline"
            >
              ← Back to Directory
            </button>
          )}
        </div>

        {/* ── Mobile Horizontal Subcategory Strip (< 768px) ── */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-3 mb-3 -mx-4 px-4 no-scrollbar">
          {FEVICOL_SUBCATEGORIES.map((subcat) => {
            const isActive = subcat.id === activeSubcatId;
            return (
              <button
                key={subcat.id}
                type="button"
                onClick={() => {
                  setActiveSubcatId(subcat.id);
                  resetAllFilters();
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12.5px] font-semibold shrink-0 transition whitespace-nowrap shadow-2xs ${
                  isActive
                    ? "bg-[#EAF7EE] text-[#16A34A] border-2 border-[#16A34A]"
                    : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <img src={subcat.icon} alt="" className="w-5 h-5 object-contain" />
                <span>{subcat.name}</span>
              </button>
            );
          })}
        </div>

        {/* ── Layout: Left Subcategory Rail (Desktop) + Right Product Grid ── */}
        <div className="flex items-start gap-6 lg:gap-8 pt-2">
          {/* ── Left Sidebar Subcategory Navigation (Desktop) ── */}
          <aside className="hidden md:block w-[220px] shrink-0 border-r border-[#E5E7EB] pr-4 space-y-1">
            {FEVICOL_SUBCATEGORIES.map((subcat) => {
              const isActive = subcat.id === activeSubcatId;
              return (
                <button
                  key={subcat.id}
                  type="button"
                  onClick={() => {
                    setActiveSubcatId(subcat.id);
                    resetAllFilters();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition relative select-none ${
                    isActive
                      ? "bg-[#EAF7EE] text-[#111827] font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  }`}
                >
                  {/* Active Green Right Border Indicator */}
                  {isActive && (
                    <span className="absolute right-0 top-0 bottom-0 w-1 bg-[#16A34A] rounded-r" />
                  )}

                  {/* Icon */}
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 p-1 flex items-center justify-center shrink-0 shadow-2xs">
                    <img
                      src={subcat.icon}
                      alt={subcat.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>

                  {/* Label */}
                  <span className="text-[12.5px] sm:text-[13px] leading-snug truncate">
                    {subcat.name}
                  </span>
                </button>
              );
            })}
          </aside>

          {/* ── Right Content Area ── */}
          <main className="flex-1 min-w-0">
            {/* ── Filter & Sort Bar (Category, Brand, Type, Price) ── */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#E5E7EB] mb-6">
              {/* Filter chips row */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12.5px] font-semibold text-slate-500 mr-1">Filter:</span>

                {/* 1. Category Filter */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === "category" ? null : "category")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition ${
                      selectedCategoryFilter !== "All"
                        ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                        : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    <span>Category{selectedCategoryFilter !== "All" ? `: ${selectedCategoryFilter}` : ""}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  {openDropdown === "category" && (
                    <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-1">
                      {categoryOptions.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setSelectedCategoryFilter(c);
                            setOpenDropdown(null);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-[12px] rounded-lg transition ${
                            selectedCategoryFilter === c ? "bg-blue-50 text-blue-700 font-bold" : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Brand Filter */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === "brand" ? null : "brand")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition ${
                      selectedBrand !== "All"
                        ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                        : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    <span>Brand{selectedBrand !== "All" ? `: ${selectedBrand}` : ""}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  {openDropdown === "brand" && (
                    <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-1">
                      {brandOptions.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => {
                            setSelectedBrand(b);
                            setOpenDropdown(null);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-[12px] rounded-lg transition ${
                            selectedBrand === b ? "bg-blue-50 text-blue-700 font-bold" : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Type Filter */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === "type" ? null : "type")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition ${
                      selectedType !== "All"
                        ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                        : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    <span>Type{selectedType !== "All" ? `: ${selectedType}` : ""}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  {openDropdown === "type" && (
                    <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-1">
                      {typeOptions.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setSelectedType(t);
                            setOpenDropdown(null);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-[12px] rounded-lg transition ${
                            selectedType === t ? "bg-blue-50 text-blue-700 font-bold" : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Price Filter */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === "price" ? null : "price")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition ${
                      selectedPrice !== "All"
                        ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                        : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    <span>Price{selectedPrice !== "All" ? `: ${selectedPrice}` : ""}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  {openDropdown === "price" && (
                    <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-1">
                      {priceOptions.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            setSelectedPrice(p);
                            setOpenDropdown(null);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-[12px] rounded-lg transition ${
                            selectedPrice === p ? "bg-blue-50 text-blue-700 font-bold" : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reset Filters */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="inline-flex items-center gap-1 text-[11.5px] font-bold text-rose-600 hover:underline ml-1"
                  >
                    <X className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>

              {/* Products count & Sort */}
              <div className="flex items-center gap-3 text-[12px]">
                <span className="font-semibold text-slate-500">
                  {filteredProducts.length} products
                </span>
                <span className="text-slate-300">|</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent font-semibold text-slate-800 border-none focus:ring-0 cursor-pointer pr-1"
                  >
                    <option value="Relevance">Relevance</option>
                    <option value="Price: Low to High">Price: Low to High</option>
                    <option value="Price: High to Low">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ── Product Cards Grid (Desktop 4 columns, Mobile 2 columns) ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
              {filteredProducts.map((product) => {
                const qty = getQty(product);

                return (
                  <div
                    key={product.id}
                    className="group flex flex-col justify-between rounded-2xl border border-[#E5E7EB] bg-white p-3 hover:border-slate-300 hover:shadow-md transition duration-200"
                  >
                    <div>
                      {/* ── Top Image Box (with Blue Ribbon Badge & 1:1 Aspect Frame) ── */}
                      <div
                        onClick={() => {
                          if (onOpenDetail) onOpenDetail(toGenericProduct(product));
                          else setModalProduct(toGenericProduct(product));
                        }}
                        className="relative aspect-square w-full rounded-xl bg-[#FAFCFF] flex items-center justify-center p-3 mb-3 cursor-pointer overflow-hidden border border-slate-100"
                      >
                        {/* Save % Blue Ribbon Badge */}
                        {product.discountPct > 0 && (
                          <div className="absolute top-0 left-0 bg-[#2563EB] text-white text-[11px] font-bold px-2 py-0.5 rounded-br-lg rounded-tl-xl shadow-xs z-10 flex flex-col items-center leading-tight">
                            <span>Save</span>
                            <span>{product.discountPct}%</span>
                          </div>
                        )}

                        {/* Product Cutout Image */}
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
                          loading="lazy"
                        />

                        {/* Carousel Dots Indicator */}
                        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-60">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                          <span className="w-1 h-1 rounded-full bg-slate-400" />
                          <span className="w-1 h-1 rounded-full bg-slate-400" />
                          <span className="w-1 h-1 rounded-full bg-slate-400" />
                        </div>
                      </div>

                      {/* ── Price Row ── */}
                      <div className="flex items-baseline gap-1.5 mb-1">
                        <span className="text-[17px] sm:text-[18px] font-extrabold text-[#111827]">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>
                        {product.mrp > product.price && (
                          <span className="text-[11.5px] text-slate-400 line-through">
                            ₹{product.mrp}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-medium">
                          (incl. GST)
                        </span>
                      </div>

                      {/* ── Product Title ── */}
                      <h3
                        onClick={() => {
                          if (onOpenDetail) onOpenDetail(toGenericProduct(product));
                          else setModalProduct(toGenericProduct(product));
                        }}
                        className="text-[13px] font-semibold text-[#1F2937] leading-snug line-clamp-2 min-h-[36px] hover:text-blue-600 cursor-pointer transition mb-2"
                        title={product.title}
                      >
                        {product.title}
                      </h3>

                      {/* ── Assured Cashback & Delivery Pill ── */}
                      {product.cashbackPill && (
                        <div className="bg-[#EAF7EE] text-[#16A34A] text-[10.5px] font-medium px-2 py-0.5 rounded-md mb-2 flex items-center gap-1 leading-tight">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] shrink-0" />
                          <span className="truncate">{product.cashbackPill}</span>
                        </div>
                      )}

                      {/* ── Key Spec / Feature Pill ── */}
                      {product.specsPill && (
                        <div className="text-[11px] text-slate-600 font-medium mb-1">
                          {product.specsPill}
                        </div>
                      )}

                      {/* ── Delivery Promise ── */}
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mb-3">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{product.deliveryTime}</span>
                      </div>
                    </div>

                    {/* ── Action Button (Options / Qty Controller) ── */}
                    <div className="mt-2">
                      {qty === 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenDetail) onOpenDetail(toGenericProduct(product));
                            else setModalProduct(toGenericProduct(product));
                          }}
                          className="w-full py-2 px-3 border border-[#16A34A] text-[#16A34A] hover:bg-[#16A34A] hover:text-white rounded-xl text-[13px] font-bold transition flex items-center justify-center gap-1 shadow-2xs active:scale-[0.98]"
                        >
                          {product.optionsCount} Options
                        </button>
                      ) : (
                        <div className="w-full flex items-center justify-between border border-[#16A34A] bg-[#EAF7EE] rounded-xl px-2 py-1 text-[#16A34A]">
                          <button
                            type="button"
                            onClick={() => handleDecrement(product)}
                            className="w-7 h-7 flex items-center justify-center text-base font-extrabold hover:bg-white/80 rounded-lg transition"
                          >
                            −
                          </button>
                          <span className="text-[13px] font-bold text-[#111827]">{qty}</span>
                          <button
                            type="button"
                            onClick={() => handleIncrement(product)}
                            className="w-7 h-7 flex items-center justify-center text-base font-extrabold hover:bg-white/80 rounded-lg transition"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </main>
        </div>
      </div>

      {/* Product Detail Modal */}
      {modalProduct && (
        <ProductDetailModal
          product={modalProduct}
          isOpen={true}
          onClose={() => setModalProduct(null)}
        />
      )}
    </div>
  );
};
