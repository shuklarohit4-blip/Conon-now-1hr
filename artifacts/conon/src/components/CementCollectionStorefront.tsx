import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Check, Sparkles, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

export interface CementProduct {
  id: string;
  title: string;
  brand: string;
  type: string;
  grade: string;
  color: string;
  packSize: string;
  price: number;
  mrp: number;
  bulkPrice?: number;
  discountPct?: number;
  image: string;
  deliveryPill?: string;
  optionsCount?: number;
  materialTag: string;
  unit: string;
  rating?: number;
}

export const CEMENT_PRODUCTS: CementProduct[] = [
  {
    id: "maha-ppc-cement-50kg",
    title: "Maha PPC Cement, 50 Kg Bag",
    brand: "Maha Cement",
    type: "PPC",
    grade: "PPC",
    color: "Grey",
    packSize: "50 Kg Bag",
    price: 360,
    mrp: 380,
    bulkPrice: 335,
    discountPct: 5,
    image: "/images/products/cement/maha-ppc-cement-50kg.webp",
    optionsCount: 3,
    materialTag: "Cement",
    unit: "50 Kg Bag",
    rating: 4.6,
  },
  {
    id: "adani-acc-suraksha-power-ppc",
    title: "Adani ACC Suraksha Power PPC",
    brand: "ACC",
    type: "Suraksha Power",
    grade: "PPC",
    color: "Grey",
    packSize: "50 Kg Bag",
    price: 380,
    mrp: 420,
    bulkPrice: 360,
    discountPct: 10,
    image: "/images/products/cement/adani-acc-suraksha-power-ppc.webp",
    optionsCount: 3,
    materialTag: "Cement",
    unit: "50 Kg Bag",
    rating: 4.8,
  },
  {
    id: "ultratech-ppc-cement-50kg",
    title: "Ultratech PPC Cement, 50 Kg Bag",
    brand: "UltraTech",
    type: "PPC",
    grade: "PPC",
    color: "Grey",
    packSize: "50 Kg Bag",
    price: 420,
    mrp: 450,
    bulkPrice: 380,
    discountPct: 7,
    image: "/images/products/cement/ultratech-ppc-cement-50kg.webp",
    optionsCount: 3,
    materialTag: "Cement",
    unit: "50 Kg Bag",
    rating: 4.9,
  },
  {
    id: "birla-white-cement-50kg",
    title: "Birla White Cement",
    brand: "Birla White",
    type: "White Cement",
    grade: "Super White",
    color: "White",
    packSize: "1 Kg Pack",
    price: 40,
    mrp: 50,
    discountPct: 20,
    deliveryPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    image: "/images/products/cement/birla-white-cement-50kg.webp",
    optionsCount: 3,
    materialTag: "Cement",
    unit: "1 Kg Pack",
    rating: 4.7,
  },
  {
    id: "ambuja-kawach-waterproofing-50kg",
    title: "Ambuja Kawach Waterproofing Cement, 50 Kg Bag",
    brand: "Ambuja",
    type: "Water Shield PPC",
    grade: "PPC",
    color: "Grey",
    packSize: "50 Kg Bag",
    price: 410,
    mrp: 445,
    bulkPrice: 375,
    discountPct: 8,
    image: "/images/products/cement/ambuja-kawach.webp",
    optionsCount: 3,
    materialTag: "Cement",
    unit: "50 Kg Bag",
    rating: 4.8,
  },
  {
    id: "ultratech-super-opc-53-grade",
    title: "UltraTech Super OPC 53 Grade Cement, 50 Kg Bag",
    brand: "UltraTech",
    type: "OPC 53",
    grade: "53 Grade",
    color: "Grey",
    packSize: "50 Kg Bag",
    price: 430,
    mrp: 470,
    bulkPrice: 390,
    discountPct: 8,
    image: "/images/products/cement/ultratech-opc-53-grade.webp",
    optionsCount: 3,
    materialTag: "Cement",
    unit: "50 Kg Bag",
    rating: 4.9,
  },
  {
    id: "acc-concrete-plus-50kg",
    title: "ACC Concrete+ Extra Strong Cement, 50 Kg Bag",
    brand: "ACC",
    type: "Concrete+",
    grade: "Extra Strong",
    color: "Grey",
    packSize: "50 Kg Bag",
    price: 400,
    mrp: 430,
    bulkPrice: 365,
    discountPct: 7,
    image: "/images/products/cement/acc-concrete.webp",
    optionsCount: 3,
    materialTag: "Cement",
    unit: "50 Kg Bag",
    rating: 4.7,
  },
  {
    id: "birla-a1-premium-ppc-50kg",
    title: "Birla A1 Premium PPC Cement, 50 Kg Bag",
    brand: "Birla",
    type: "Premium PPC",
    grade: "PPC",
    color: "Grey",
    packSize: "50 Kg Bag",
    price: 375,
    mrp: 410,
    bulkPrice: 345,
    discountPct: 9,
    image: "/images/products/cement/birla-a1-premium.webp",
    optionsCount: 3,
    materialTag: "Cement",
    unit: "50 Kg Bag",
    rating: 4.7,
  },
  {
    id: "dalmia-dsp-waterproof-50kg",
    title: "Dalmia DSP Waterproof Cement, 50 Kg Bag",
    brand: "Dalmia",
    type: "DSP Special",
    grade: "High Early",
    color: "Grey",
    packSize: "50 Kg Bag",
    price: 395,
    mrp: 430,
    bulkPrice: 360,
    discountPct: 8,
    image: "/images/products/cement/dalmia-dsp-opc.webp",
    optionsCount: 3,
    materialTag: "Cement",
    unit: "50 Kg Bag",
    rating: 4.8,
  },
  {
    id: "jk-super-opc-53-grade-50kg",
    title: "J.K. Super OPC 53 Grade Cement, 50 Kg Bag",
    brand: "JK Super",
    type: "OPC 53",
    grade: "53 Grade",
    color: "Grey",
    packSize: "50 Kg Bag",
    price: 390,
    mrp: 420,
    bulkPrice: 355,
    discountPct: 7,
    image: "/images/products/cement/jk-super-opc-53.webp",
    optionsCount: 3,
    materialTag: "Cement",
    unit: "50 Kg Bag",
    rating: 4.7,
  },
];

export const SAND_PLASTER_PRODUCTS: CementProduct[] = [
  {
    id: "screened-river-sand-50kg",
    title: "Screened River Sand (Plaster Grade), 50 Kg Bag",
    brand: "River Sand Co.",
    type: "River Sand",
    grade: "Plaster Grade",
    color: "Brown",
    packSize: "50 Kg Bag",
    price: 65,
    mrp: 85,
    bulkPrice: 55,
    discountPct: 23,
    image: "/images/products/sand/screened-river-sand.webp",
    optionsCount: 2,
    materialTag: "Sand",
    unit: "50 Kg Bag",
  },
  {
    id: "m-sand-concrete-grade-50kg",
    title: "Coarse Concrete Sand (M-Sand), 50 Kg Bag",
    brand: "UltraSand",
    type: "M-Sand",
    grade: "Zone II",
    color: "Grey",
    packSize: "50 Kg Bag",
    price: 55,
    mrp: 75,
    bulkPrice: 48,
    discountPct: 26,
    image: "/images/products/sand/m-sand-concrete.webp",
    optionsCount: 2,
    materialTag: "Sand",
    unit: "50 Kg Bag",
  },
  {
    id: "magicrete-aac-mortar-40kg",
    title: "Magicrete AAC Block Mortar Adhesion Jointing, 40 Kg Bag",
    brand: "Magicrete",
    type: "Block Jointing Mortar",
    grade: "Polymer Modified",
    color: "Grey",
    packSize: "40 Kg Bag",
    price: 380,
    mrp: 450,
    bulkPrice: 340,
    discountPct: 15,
    image: "/images/products/bricks/magicrete-aac-block-6.webp",
    optionsCount: 2,
    materialTag: "Sand",
    unit: "40 Kg Bag",
  },
  {
    id: "gyproc-elite-90-gypsum-25kg",
    title: "Gyproc Elite 90 Gypsum One Coat Plaster, 25 Kg Bag",
    brand: "Saint-Gobain",
    type: "Gypsum Plaster",
    grade: "Super Fine",
    color: "White",
    packSize: "25 Kg Bag",
    price: 290,
    mrp: 340,
    bulkPrice: 260,
    discountPct: 14,
    image: "/images/products/wood/alagar-white-pop-powder-25kg.webp",
    optionsCount: 2,
    materialTag: "Sand",
    unit: "25 Kg Bag",
  },
  {
    id: "birla-white-wallcare-putty-40kg",
    title: "Birla White WallCare Putty, 40 Kg Bag",
    brand: "Birla White",
    type: "Polymer Putty",
    grade: "Water Resistant",
    color: "White",
    packSize: "40 Kg Bag",
    price: 760,
    mrp: 890,
    bulkPrice: 710,
    discountPct: 14,
    image: "/images/products/paint/wallcare-putty-40kg.webp",
    optionsCount: 3,
    materialTag: "Sand",
    unit: "40 Kg Bag",
  },
  {
    id: "jk-wallmaxx-putty-40kg",
    title: "JK WallMaxX Water Resistant White Cement Putty, 40 Kg Bag",
    brand: "JK White",
    type: "White Cement Putty",
    grade: "Ultra White",
    color: "White",
    packSize: "40 Kg Bag",
    price: 740,
    mrp: 870,
    bulkPrice: 695,
    discountPct: 15,
    image: "/images/products/paint/wallcare-putty-20kg.webp",
    optionsCount: 3,
    materialTag: "Sand",
    unit: "40 Kg Bag",
  },
];

export const MASONRY_TOOLS_PRODUCTS: CementProduct[] = [
  {
    id: "taparia-masonry-trowel-8",
    title: "Taparia Carbon Steel Pointed Masonry Trowel 8\"",
    brand: "Taparia",
    type: "Trowel",
    grade: "Hardened Steel",
    color: "Steel",
    packSize: "1 Pc",
    price: 180,
    mrp: 220,
    discountPct: 18,
    image: "/images/products/tools/taparia-plier-combo-set.webp",
    optionsCount: 2,
    materialTag: "Tools",
    unit: "1 Pc",
  },
  {
    id: "stanley-spirit-level-24",
    title: "Stanley Spirit Level 24\" Heavy Duty Aluminum",
    brand: "Stanley",
    type: "Spirit Level",
    grade: "Heavy Duty",
    color: "Yellow",
    packSize: "1 Pc",
    price: 540,
    mrp: 680,
    discountPct: 20,
    image: "/images/products/tools/stanley-spirit-level-24.webp",
    optionsCount: 2,
    materialTag: "Tools",
    unit: "1 Pc",
  },
  {
    id: "plumb-bob-cast-iron-250g",
    title: "Solid Cast Iron Plumb Bob with Braided Nylon Line 250g",
    brand: "WorkPro",
    type: "Plumb Bob",
    grade: "Steel Tip",
    color: "Iron",
    packSize: "1 Pc",
    price: 140,
    mrp: 180,
    discountPct: 22,
    image: "/images/products/tools/stanley-measuring-tape-5m.webp",
    optionsCount: 1,
    materialTag: "Tools",
    unit: "1 Pc",
  },
  {
    id: "taparia-machinist-hammer-1000g",
    title: "Taparia Machinist Sledge Hammer 1000g",
    brand: "Taparia",
    type: "Hammer",
    grade: "Forged Carbon Steel",
    color: "Steel",
    packSize: "1 Pc",
    price: 380,
    mrp: 450,
    discountPct: 15,
    image: "/images/products/tools/stanley-claw-hammer-570g.webp",
    optionsCount: 2,
    materialTag: "Tools",
    unit: "1 Pc",
  },
  {
    id: "bricklaying-jointer-tool",
    title: "Stainless Steel Bricklaying Jointing Jointer Tool",
    brand: "WorkPro",
    type: "Jointer",
    grade: "Stainless Steel",
    color: "Steel",
    packSize: "1 Pc",
    price: 120,
    mrp: 160,
    discountPct: 25,
    image: "/images/products/tools/taparia-hacksaw-frame-12.webp",
    optionsCount: 1,
    materialTag: "Tools",
    unit: "1 Pc",
  },
];

export const CHEMICALS_PRODUCTS: CementProduct[] = [
  {
    id: "dr-fixit-lw-plus-5l",
    title: "Dr. Fixit LW+ Integral Waterproofing Liquid Compound 5L",
    brand: "Dr. Fixit",
    type: "Liquid Additive",
    grade: "Integral WP",
    color: "Transparent",
    packSize: "5 L Can",
    price: 640,
    mrp: 780,
    bulkPrice: 580,
    discountPct: 18,
    image: "/images/products/adhesives/dr-fixit-lw-plus-5l.webp",
    optionsCount: 3,
    materialTag: "Waterproofing",
    unit: "5 L Can",
  },
  {
    id: "dr-fixit-pidicrete-urp-1l",
    title: "Dr. Fixit Pidicrete URP SBR Latex Bonding Agent 1L",
    brand: "Dr. Fixit",
    type: "Latex SBR",
    grade: "Repair & Waterproofing",
    color: "White",
    packSize: "1 L Bottle",
    price: 280,
    mrp: 340,
    discountPct: 17,
    image: "/images/products/paint/dr-fixit-pidicrete-urp-1l.webp",
    optionsCount: 3,
    materialTag: "Waterproofing",
    unit: "1 L Bottle",
  },
  {
    id: "dr-fixit-fastflex-12kg",
    title: "Dr. Fixit Fastflex Dual Component Waterproofing Coating 12 Kg",
    brand: "Dr. Fixit",
    type: "2K Elastomeric",
    grade: "Heavy Duty",
    color: "Grey",
    packSize: "12 Kg Kit",
    price: 1850,
    mrp: 2200,
    discountPct: 16,
    image: "/images/products/paint/dr-fixit-fastflex-20kg.webp",
    optionsCount: 2,
    materialTag: "Waterproofing",
    unit: "12 Kg Kit",
  },
  {
    id: "roff-cera-clean-1l",
    title: "Roff Cera Clean Tile & Floor Chemical Cleaner 1L",
    brand: "Roff",
    type: "Chemical Cleaner",
    grade: "Heavy Duty Acid Free",
    color: "Clear",
    packSize: "1 L Bottle",
    price: 180,
    mrp: 220,
    discountPct: 18,
    image: "/images/products/adhesives/roff-tilefix-ready-mix-5kg.webp",
    optionsCount: 2,
    materialTag: "Waterproofing",
    unit: "1 L Bottle",
  },
];

const SUBCATEGORIES = [
  {
    id: "cement",
    name: "Cement",
    icon: "/images/subcategories/cement-bag-icon.webp",
    count: 10,
    products: CEMENT_PRODUCTS,
  },
  {
    id: "sand-plaster",
    name: "Sand, Plaster & Mortars",
    icon: "/images/subcategories/sand-plaster-icon.webp",
    count: 6,
    products: SAND_PLASTER_PRODUCTS,
  },
  {
    id: "masonry-tools",
    name: "Masonry Tools & Hardware",
    icon: "/images/subcategories/masonry-tools-icon.webp",
    count: 5,
    products: MASONRY_TOOLS_PRODUCTS,
  },
  {
    id: "chemicals",
    name: "Chemicals",
    icon: "/images/subcategories/chemicals-icon.webp",
    count: 4,
    products: CHEMICALS_PRODUCTS,
  },
];

interface CementCollectionStorefrontProps {
  onBackToDirectory?: () => void;
  onOpenDetail?: (product: Product) => void;
}

export const CementCollectionStorefront: React.FC<CementCollectionStorefrontProps> = ({
  onBackToDirectory,
  onOpenDetail,
}) => {
  const [activeSubcatId, setActiveSubcatId] = useState<string>("cement");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedGrade, setSelectedGrade] = useState<string>("All");
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

  const activeSubcat = SUBCATEGORIES.find((s) => s.id === activeSubcatId) || SUBCATEGORIES[0];

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

  const gradeOptions = useMemo(() => {
    const set = new Set<string>();
    activeSubcat.products.forEach((p) => set.add(p.grade));
    return ["All", ...Array.from(set)];
  }, [activeSubcat]);

  const filteredProducts = useMemo(() => {
    let list = [...activeSubcat.products];
    if (selectedBrand !== "All") {
      list = list.filter((p) => p.brand === selectedBrand);
    }
    if (selectedType !== "All") {
      list = list.filter((p) => p.type === selectedType);
    }
    if (selectedGrade !== "All") {
      list = list.filter((p) => p.grade === selectedGrade);
    }
    if (sortBy === "Price: Low to High") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "Price: High to Low") {
      list.sort((a, b) => b.price - a.price);
    }
    return list;
  }, [activeSubcat, selectedBrand, selectedType, selectedGrade, sortBy]);

  const handleAdd = (p: CementProduct) => {
    addToCart.mutate(
      {
        data: {
          materialId: p.id,
          quantity: 1,
          name: p.title,
          price: p.price,
          unit: p.unit,
          vendor: p.brand,
          category: p.materialTag,
        },
      },
      {
        onSuccess: () => toast.success(`${p.title} added to cart!`),
        onError: () => toast.error("Could not add to cart"),
      }
    );
  };

  const getQty = (p: CementProduct) => {
    const key = `${p.materialTag.toLowerCase()}::${p.title.toLowerCase()}`;
    return cartItemByKey[key]?.quantity ?? 0;
  };

  const toGenericProduct = (p: CementProduct): Product => ({
    id: p.id,
    title: p.title,
    brand: p.brand,
    price: p.price,
    mrp: p.mrp,
    image: p.image,
    materialTag: p.materialTag,
    rating: p.rating || 4.8,
    reviews: 1240,
    unit: p.unit,
    vendor: p.brand,
  });

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* ── Top Yellow Promotional Banner (Flat 2% Cashback) ── */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="w-full rounded-2xl overflow-hidden shadow-xs border border-amber-300/80 bg-[#FFD100]">
          <img
            src="/images/banners/cashback-25k-banner.webp"
            alt="Flat 2% Cashback on ₹25,000+ purchase"
            className="w-full h-auto max-h-[130px] object-cover"
          />
        </div>
      </div>

      {/* ── Main Storefront Container (Breadcrumb + Category Title + 2 Column Layout) ── */}
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
          <span className="hover:text-blue-600 transition">Cement &amp; Civil Works</span>
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
          {SUBCATEGORIES.map((subcat) => {
            const isActive = subcat.id === activeSubcatId;
            return (
              <button
                key={subcat.id}
                type="button"
                onClick={() => {
                  setActiveSubcatId(subcat.id);
                  setSelectedBrand("All");
                  setSelectedType("All");
                  setSelectedGrade("All");
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
            {SUBCATEGORIES.map((subcat) => {
              const isActive = subcat.id === activeSubcatId;
              return (
                <button
                  key={subcat.id}
                  type="button"
                  onClick={() => {
                    setActiveSubcatId(subcat.id);
                    setSelectedBrand("All");
                    setSelectedType("All");
                    setSelectedGrade("All");
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
            {/* ── Filter & Sort Bar ── */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#E5E7EB] mb-6">
              {/* Filter chips row */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12.5px] font-semibold text-slate-500 mr-1">Filter:</span>

                {/* Brand Filter */}
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

                {/* Type Filter */}
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
                    <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-1">
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

                {/* Grade Filter */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === "grade" ? null : "grade")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition ${
                      selectedGrade !== "All"
                        ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                        : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    <span>Grade{selectedGrade !== "All" ? `: ${selectedGrade}` : ""}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  {openDropdown === "grade" && (
                    <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-1">
                      {gradeOptions.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => {
                            setSelectedGrade(g);
                            setOpenDropdown(null);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-[12px] rounded-lg transition ${
                            selectedGrade === g ? "bg-blue-50 text-blue-700 font-bold" : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reset Filters */}
                {(selectedBrand !== "All" || selectedType !== "All" || selectedGrade !== "All") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBrand("All");
                      setSelectedType("All");
                      setSelectedGrade("All");
                    }}
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

            {/* ── Product Cards Grid (4 columns on desktop, 2 on mobile) ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
              {filteredProducts.map((product) => {
                const qty = getQty(product);

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl border border-[#E5E7EB] p-3 flex flex-col justify-between hover:shadow-md transition-shadow group relative"
                  >
                    {/* Top image box with discount badge */}
                    <div className="relative aspect-square w-full rounded-lg bg-[#FAFBFD] flex items-center justify-center p-3 mb-2 overflow-hidden border border-slate-100">
                      {/* Blue Save Badge */}
                      {product.discountPct && product.discountPct > 0 && (
                        <span className="absolute top-2 left-2 bg-[#2563EB] text-white text-[9.5px] font-black px-1.5 py-0.5 rounded-sm shadow-2xs z-10">
                          Save {product.discountPct}%
                        </span>
                      )}

                      {/* Product packshot */}
                      <img
                        src={product.image}
                        alt={product.title}
                        loading="lazy"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200 select-none cursor-pointer"
                        onClick={() => {
                          const gp = toGenericProduct(product);
                          if (onOpenDetail) onOpenDetail(gp);
                          else setModalProduct(gp);
                        }}
                        onError={(e) => {
                          e.currentTarget.src = "/images/products/cement/ultratech-ppc-cement-50kg.webp";
                        }}
                      />
                    </div>

                    {/* Carousel indicator dots */}
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <span className="w-2 h-1 bg-[#374151] rounded-full" />
                      <span className="w-1 h-1 bg-[#D1D5DB] rounded-full" />
                      <span className="w-1 h-1 bg-[#D1D5DB] rounded-full" />
                      <span className="w-1 h-1 bg-[#D1D5DB] rounded-full" />
                      <span className="w-1 h-1 bg-[#D1D5DB] rounded-full" />
                    </div>

                    {/* Price and Bulk Price Row */}
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[17px] font-black text-[#111827]">
                          ₹{product.price}
                        </span>
                        {product.mrp > product.price && (
                          <span className="text-[11px] text-slate-400 line-through">
                            ₹{product.mrp}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-medium">
                          (incl. GST)
                        </span>
                      </div>

                      {/* Bulk Price Link */}
                      {product.bulkPrice && (
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#0D9488] bg-[#F0FDFA] px-1.5 py-0.5 rounded hover:underline cursor-pointer">
                            Bulk price ₹{product.bulkPrice} &rsaquo;
                          </span>
                        </div>
                      )}

                      {/* Delivery Pill */}
                      {product.deliveryPill && (
                        <p className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mt-1 font-medium inline-block">
                          {product.deliveryPill}
                        </p>
                      )}

                      {/* Title */}
                      <h3
                        onClick={() => {
                          const gp = toGenericProduct(product);
                          if (onOpenDetail) onOpenDetail(gp);
                          else setModalProduct(gp);
                        }}
                        className="text-[12.5px] sm:text-[13px] font-medium text-[#1F2937] leading-[1.3] line-clamp-2 mt-2 group-hover:text-blue-600 transition-colors cursor-pointer min-h-[34px]"
                      >
                        {product.title}
                      </h3>
                    </div>

                    {/* Action button */}
                    <div className="mt-3 pt-2 border-t border-slate-100">
                      {qty > 0 ? (
                        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg py-1 px-2">
                          <button
                            type="button"
                            onClick={() => {
                              const key = `${product.materialTag.toLowerCase()}::${product.title.toLowerCase()}`;
                              const entry = cartItemByKey[key];
                              if (entry && entry.ids.length > 0) {
                                if (qty <= 1) {
                                  removeFromCart.mutate({ itemId: entry.ids[0] });
                                } else {
                                  updateCartItem.mutate({ itemId: entry.ids[0], data: { quantity: qty - 1 } });
                                }
                              }
                            }}
                            className="w-6 h-6 rounded bg-white text-blue-700 font-bold flex items-center justify-center text-sm shadow-2xs"
                          >
                            -
                          </button>
                          <span className="text-[12.5px] font-extrabold text-blue-900">
                            {qty} in Cart
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const key = `${product.materialTag.toLowerCase()}::${product.title.toLowerCase()}`;
                              const entry = cartItemByKey[key];
                              if (entry && entry.ids.length > 0) {
                                updateCartItem.mutate({ itemId: entry.ids[0], data: { quantity: qty + 1 } });
                              }
                            }}
                            className="w-6 h-6 rounded bg-white text-blue-700 font-bold flex items-center justify-center text-sm shadow-2xs"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAdd(product)}
                          className="w-full py-1.5 rounded-lg border border-[#0D9488] text-[#0D9488] hover:bg-[#F0FDFA] text-[12.5px] font-bold transition flex items-center justify-center gap-1 active:scale-98"
                        >
                          <span>{product.optionsCount ? `${product.optionsCount} Options` : "Add"}</span>
                        </button>
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
          onAddToCart={() => {
            handleAdd(modalProduct as unknown as CementProduct);
            setModalProduct(null);
          }}
          cartQty={getQty(modalProduct as unknown as CementProduct)}
        />
      )}
    </div>
  );
};
