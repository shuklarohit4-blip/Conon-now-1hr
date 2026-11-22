import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Check, Sparkles, Filter, X, Clock, ShieldCheck } from "lucide-react";
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

export interface PlywoodProduct {
  id: string;
  title: string;
  brand: string;
  categoryTag: string;
  type: string;
  grade: string;
  size: string;
  material: string;
  thickness: string;
  price: number;
  mrp: number;
  discountPct: number;
  image: string;
  cashbackPill?: string;
  specsPill?: string;
  warrantyBadge?: string;
  deliveryTime: string;
  optionsCount: number;
  materialTag: string;
  unit: string;
  rating?: number;
}

export const PLYWOOD_PRODUCTS: PlywoodProduct[] = [
  {
    id: "archidply-decor-pure-classic-mr-plywood",
    title: "Archidply Decor Pure Classic MR Plywood",
    brand: "Archidply",
    categoryTag: "Commercial MR",
    type: "Pure Classic MR",
    grade: "MR (IS:303)",
    size: "8x4 ft",
    material: "Hardwood Core",
    thickness: "19mm",
    price: 1059,
    mrp: 1825,
    discountPct: 42,
    image: "/images/products/wood/archidply-pure-classic-mr-plywood.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Hardwood Core",
    warrantyBadge: "7 YEAR WARRANTY",
    deliveryTime: "60 Mins",
    optionsCount: 10,
    materialTag: "Wood",
    unit: "8x4 ft Sheet",
    rating: 4.8,
  },
  {
    id: "archidply-decor-pure-classic-plus-mr-plywood",
    title: "Archidply Decor Pure Classic Plus MR Plywood (Full Core)",
    brand: "Archidply",
    categoryTag: "Commercial MR",
    type: "Pure Classic Plus MR",
    grade: "MR Full Core (IS:303)",
    size: "8x4 ft",
    material: "Hardwood Core",
    thickness: "19mm",
    price: 1167,
    mrp: 1945,
    discountPct: 40,
    image: "/images/products/wood/archidply-pure-classic-plus-mr-plywood.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Hardwood Core",
    warrantyBadge: "15 YEARS WARRANTY",
    deliveryTime: "60 Mins",
    optionsCount: 10,
    materialTag: "Wood",
    unit: "8x4 ft Sheet",
    rating: 4.9,
  },
  {
    id: "greenply-ecotec-mr-303-plywood",
    title: "Greenply Ecotec MR 303 Plywood",
    brand: "Greenply",
    categoryTag: "Commercial MR",
    type: "Ecotec MR 303",
    grade: "Commercial MR (IS:303)",
    size: "8x4 ft",
    material: "Selected Hardwood",
    thickness: "19mm",
    price: 1225,
    mrp: 1290,
    discountPct: 5,
    image: "/images/products/wood/greenply-ecotec-mr-303-plywood.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "MOR 36 N/mm²",
    warrantyBadge: "5 YEAR WARRANTY",
    deliveryTime: "60 Mins",
    optionsCount: 14,
    materialTag: "Wood",
    unit: "8x4 ft Sheet",
    rating: 4.8,
  },
  {
    id: "greenply-ecotec-710-bwp-plywood",
    title: "Greenply Ecotec 710 BWP Plywood",
    brand: "Greenply",
    categoryTag: "Waterproof BWP",
    type: "Ecotec 710 BWP",
    grade: "BWP Grade (IS:710)",
    size: "8x4 ft",
    material: "Gap-Free 4-Press",
    thickness: "19mm",
    price: 1455,
    mrp: 1650,
    discountPct: 12,
    image: "/images/products/wood/greenply-ecotec-710-bwp-plywood.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Gap-Free 4-Press",
    warrantyBadge: "10 YEAR WARRANTY",
    deliveryTime: "60 Mins",
    optionsCount: 12,
    materialTag: "Wood",
    unit: "8x4 ft Sheet",
    rating: 4.9,
  },
  {
    id: "century-club-prime-19mm-bwp",
    title: "CenturyPly Club Prime BWP 710 Marine Plywood",
    brand: "CenturyPly",
    categoryTag: "Waterproof BWP",
    type: "Club Prime BWP",
    grade: "Marine BWP (IS:710)",
    size: "8x4 ft",
    material: "100% Gurjan Core",
    thickness: "19mm",
    price: 2450,
    mrp: 2800,
    discountPct: 12,
    image: "/images/products/wood/century-club-prime-19mm-bwr.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "25 Year Warranty",
    warrantyBadge: "25 YEAR WARRANTY",
    deliveryTime: "60 Mins",
    optionsCount: 12,
    materialTag: "Wood",
    unit: "8x4 ft Sheet",
    rating: 4.9,
  },
  {
    id: "sainik-bwp-marine-ply-19mm",
    title: "CenturyPly Sainik 710 Asli Waterproof Plywood",
    brand: "CenturyPly",
    categoryTag: "Waterproof BWP",
    type: "Sainik 710 BWP",
    grade: "BWP Grade (IS:710)",
    size: "8x4 ft",
    material: "Hardwood Core",
    thickness: "19mm",
    price: 1680,
    mrp: 1950,
    discountPct: 14,
    image: "/images/products/wood/sainik-bwp-marine-ply-19mm-8-4.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Borer & Termite Proof",
    warrantyBadge: "8 YEAR WARRANTY",
    deliveryTime: "60 Mins",
    optionsCount: 10,
    materialTag: "Wood",
    unit: "8x4 ft Sheet",
    rating: 4.7,
  },
  {
    id: "greenply-bwp-marine-19mm",
    title: "Greenply Marine BWP Grade Calibrated Plywood",
    brand: "Greenply",
    categoryTag: "Calibrated",
    type: "Marine Calibrated",
    grade: "BWP Marine (IS:710)",
    size: "8x4 ft",
    material: "Selected Pine/Hardwood",
    thickness: "19mm",
    price: 2280,
    mrp: 2600,
    discountPct: 12,
    image: "/images/products/wood/greenply-bwp-marine-19mm-8-4.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Zero Core Gap",
    warrantyBadge: "15 YEAR WARRANTY",
    deliveryTime: "60 Mins",
    optionsCount: 8,
    materialTag: "Wood",
    unit: "8x4 ft Sheet",
    rating: 4.8,
  },
  {
    id: "sainik-mr-grade-ply-12mm",
    title: "CenturyPly Sainik MR Commercial Plywood",
    brand: "CenturyPly",
    categoryTag: "Commercial MR",
    type: "Sainik MR",
    grade: "MR (IS:303)",
    size: "8x4 ft",
    material: "Hardwood Veneer",
    thickness: "12mm",
    price: 1120,
    mrp: 1350,
    discountPct: 17,
    image: "/images/products/wood/sainik-mr-grade-ply-12mm-8-4.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Termite Resistant",
    warrantyBadge: "5 YEAR WARRANTY",
    deliveryTime: "60 Mins",
    optionsCount: 10,
    materialTag: "Wood",
    unit: "8x4 ft Sheet",
    rating: 4.7,
  },
  {
    id: "greenply-pine-block-board-19mm",
    title: "Greenply BWP Pine Core Block Board",
    brand: "Greenply",
    categoryTag: "Block Board",
    type: "Pine Block Board",
    grade: "BWP (IS:1659)",
    size: "8x4 ft",
    material: "Seasoned Pine Battens",
    thickness: "19mm",
    price: 1850,
    mrp: 2100,
    discountPct: 12,
    image: "/images/products/wood/greenply-block-board-19mm.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Warp-Resistant",
    warrantyBadge: "10 YEAR WARRANTY",
    deliveryTime: "60 Mins",
    optionsCount: 6,
    materialTag: "Wood",
    unit: "8x4 ft Sheet",
    rating: 4.8,
  },
  {
    id: "century-block-board-19mm",
    title: "Century Prowud BWP Grade Block Board",
    brand: "CenturyPly",
    categoryTag: "Block Board",
    type: "Century Board",
    grade: "BWP (IS:1659)",
    size: "8x4 ft",
    material: "Kiln-Seasoned Pine",
    thickness: "19mm",
    price: 1920,
    mrp: 2250,
    discountPct: 15,
    image: "/images/products/wood/century-block-board-19mm-8-4.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "High Screw Holding",
    warrantyBadge: "10 YEAR WARRANTY",
    deliveryTime: "60 Mins",
    optionsCount: 6,
    materialTag: "Wood",
    unit: "8x4 ft Sheet",
    rating: 4.8,
  },
  {
    id: "century-architect-ply-19mm",
    title: "CenturyPly Architect Premium Calibrated Marine Ply",
    brand: "CenturyPly",
    categoryTag: "Calibrated",
    type: "Architect Ply",
    grade: "Marine BWP (IS:710)",
    size: "8x4 ft",
    material: "4-Times Pressed Gurjan",
    thickness: "19mm",
    price: 3150,
    mrp: 3600,
    discountPct: 12,
    image: "/images/products/wood/century-architect-ply-19mm.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Lifetime Warranty",
    warrantyBadge: "LIFETIME WARRANTY",
    deliveryTime: "60 Mins",
    optionsCount: 8,
    materialTag: "Wood",
    unit: "8x4 ft Sheet",
    rating: 5.0,
  },
];

export const HDHMR_MDF_PRODUCTS: PlywoodProduct[] = [
  {
    id: "action-tesa-hdhmr-18mm",
    title: "Action TESA HDHMR Board Grade-1 High Density Water Resistant",
    brand: "Action TESA",
    categoryTag: "HDHMR",
    type: "HDHMR Grade 1",
    grade: "High Density 850+ kg/m³",
    size: "8x4 ft",
    material: "Hardwood Fibre & Special Resins",
    thickness: "18mm",
    price: 1550,
    mrp: 1850,
    discountPct: 16,
    image: "/images/products/wood/action-tesa-hdhmr-18mm.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Water Resistant",
    warrantyBadge: "10 YEAR WARRANTY",
    deliveryTime: "60 Mins",
    optionsCount: 8,
    materialTag: "Wood",
    unit: "8x4 ft Sheet",
    rating: 4.9,
  },
  {
    id: "action-tesa-pre-lam-mdf-18mm",
    title: "Action TESA Pre-Laminated MDF Board (Both Sides)",
    brand: "Action TESA",
    categoryTag: "Pre-Lam MDF",
    type: "Pre-Laminated MDF",
    grade: "Exterior Grade (IS:14587)",
    size: "8x4 ft",
    material: "High Density Fibre + Melamine",
    thickness: "18mm",
    price: 1380,
    mrp: 1650,
    discountPct: 16,
    image: "/images/products/wood/action-tesa-pre-lam-mdf-18mm.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Scratch Proof",
    warrantyBadge: "5 YEAR WARRANTY",
    deliveryTime: "60 Mins",
    optionsCount: 12,
    materialTag: "Wood",
    unit: "8x4 ft Sheet",
    rating: 4.8,
  },
  {
    id: "action-tesa-plain-mdf-12mm",
    title: "Action TESA Plain MDF Board Interior Grade",
    brand: "Action TESA",
    categoryTag: "Plain MDF",
    type: "Plain MDF",
    grade: "Interior Grade (IS:12406)",
    size: "8x4 ft",
    material: "Uniform Density Wood Fibre",
    thickness: "12mm",
    price: 890,
    mrp: 1050,
    discountPct: 15,
    image: "/images/products/wood/action-tesa-mdf-12mm-8-4.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Ultra Smooth Finish",
    warrantyBadge: "5 YEAR WARRANTY",
    deliveryTime: "60 Mins",
    optionsCount: 10,
    materialTag: "Wood",
    unit: "8x4 ft Sheet",
    rating: 4.7,
  },
  {
    id: "action-tesa-boilo-18mm",
    title: "Action TESA Boilo Boiling Water Resistant Board",
    brand: "Action TESA",
    categoryTag: "Boilo",
    type: "Boilo BWP Board",
    grade: "1000+ kg/m³ Extreme Density",
    size: "8x4 ft",
    material: "Borer & Termite Proof Fibre",
    thickness: "18mm",
    price: 1950,
    mrp: 2300,
    discountPct: 15,
    image: "/images/products/wood/action-tesa-hdhmr-18mm.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Boiling Water Proof",
    warrantyBadge: "15 YEAR WARRANTY",
    deliveryTime: "60 Mins",
    optionsCount: 6,
    materialTag: "Wood",
    unit: "8x4 ft Sheet",
    rating: 4.9,
  },
  {
    id: "action-tesa-hdf-6mm",
    title: "Action TESA High Density Fibreboard (HDF)",
    brand: "Action TESA",
    categoryTag: "HDF",
    type: "High Density HDF",
    grade: "HDF (IS:12406)",
    size: "8x4 ft",
    material: "Hardwood Compressed Fibre",
    thickness: "6mm",
    price: 640,
    mrp: 780,
    discountPct: 18,
    image: "/images/products/wood/action-tesa-hdf-6mm-8-4.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "High Tensile Strength",
    warrantyBadge: "5 YEAR WARRANTY",
    deliveryTime: "60 Mins",
    optionsCount: 6,
    materialTag: "Wood",
    unit: "8x4 ft Sheet",
    rating: 4.7,
  },
];

export const LAMINATES_PRODUCTS: PlywoodProduct[] = [
  {
    id: "merino-laminate-1mm-high-gloss",
    title: "Merino High Gloss Decorative Laminate Sheet 1mm",
    brand: "Merino",
    categoryTag: "High Gloss",
    type: "Decorative Laminate",
    grade: "1mm Premium (IS:2046)",
    size: "8x4 ft",
    material: "Imported Kraft & Design Paper",
    thickness: "1mm",
    price: 1450,
    mrp: 1750,
    discountPct: 17,
    image: "/images/products/wood/merino-laminate-1mm-8-4.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Scratch & Stain Resistant",
    warrantyBadge: "10 YEAR WARRANTY",
    deliveryTime: "60 Mins",
    optionsCount: 24,
    materialTag: "Wood",
    unit: "8x4 ft Sheet",
    rating: 4.9,
  },
  {
    id: "century-laminate-1mm-matte",
    title: "CenturyLaminates 1mm Matte Finish Woodgrain Sheet",
    brand: "CenturyPly",
    categoryTag: "Matte Finish",
    type: "Matte Woodgrain",
    grade: "1mm Compact (IS:2046)",
    size: "8x4 ft",
    material: "Anti-Bacterial Surface",
    thickness: "1mm",
    price: 1380,
    mrp: 1680,
    discountPct: 18,
    image: "/images/products/wood/century-laminate-1mm-8-4.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Anti-Fingerprint",
    warrantyBadge: "10 YEAR WARRANTY",
    deliveryTime: "60 Mins",
    optionsCount: 30,
    materialTag: "Wood",
    unit: "8x4 ft Sheet",
    rating: 4.8,
  },
  {
    id: "sunmica-laminate-0-8mm",
    title: "Sunmica by Formica 0.8mm Standard Color Sheet",
    brand: "Sunmica",
    categoryTag: "Solid & Suede",
    type: "Standard Laminate",
    grade: "0.8mm Standard",
    size: "8x4 ft",
    material: "Suede Texture",
    thickness: "0.8mm",
    price: 820,
    mrp: 1050,
    discountPct: 22,
    image: "/images/products/wood/sunmica-laminate-0-8mm-8-4.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Heat & Steam Proof",
    warrantyBadge: "7 YEAR WARRANTY",
    deliveryTime: "60 Mins",
    optionsCount: 20,
    materialTag: "Wood",
    unit: "8x4 ft Sheet",
    rating: 4.7,
  },
  {
    id: "pvc-edge-band-tape-22mm",
    title: "PVC Edge Band Tape 22mm x 50m Roll (Matching Colors)",
    brand: "Action TESA",
    categoryTag: "Edge Band",
    type: "PVC Edge Banding",
    grade: "0.8mm Thickness",
    size: "50m Roll",
    material: "Virgin PVC Compound",
    thickness: "22mm Width",
    price: 380,
    mrp: 480,
    discountPct: 21,
    image: "/images/products/wood/pvc-edge-band-tape-22mm-50m.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Seamless Primer Coated",
    deliveryTime: "60 Mins",
    optionsCount: 16,
    materialTag: "Wood",
    unit: "50m Roll",
    rating: 4.8,
  },
  {
    id: "fevicol-heatx-adhesive-5kg",
    title: "Fevicol HeatX Fast Curing Laminate Adhesive 5 Kg",
    brand: "Fevicol",
    categoryTag: "Adhesives",
    type: "Heat Resistant Adhesive",
    grade: "Synthetic Rubber Formula",
    size: "5 Kg Bucket",
    material: "Quick Grab Formula",
    thickness: "Liquid Paste",
    price: 1850,
    mrp: 2200,
    discountPct: 16,
    image: "/images/products/wood/fevicol-sh-for-laminate-5kg.webp",
    cashbackPill: "Assured 1% cashback | Free Delivery on ₹1000+",
    specsPill: "Heat Proof up to 170°C",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    materialTag: "Wood",
    unit: "5 Kg Bucket",
    rating: 4.9,
  },
];

export interface PlywoodSubcategory {
  id: string;
  name: string;
  icon: string;
  count: number;
  products: PlywoodProduct[];
}

export const PLYWOOD_SUBCATEGORIES: PlywoodSubcategory[] = [
  {
    id: "plywood-blockboard",
    name: "Plywood & Blockboard",
    icon: "/images/subcategories/plywood-blockboard-icon.webp",
    count: 11,
    products: PLYWOOD_PRODUCTS,
  },
  {
    id: "hdhmr-mdf-boilo",
    name: "HDHMR, MDF, Boilo",
    icon: "/images/subcategories/hdhmr-mdf-icon.webp",
    count: 5,
    products: HDHMR_MDF_PRODUCTS,
  },
  {
    id: "laminates",
    name: "Laminates",
    icon: "/images/subcategories/laminates-icon.webp",
    count: 5,
    products: LAMINATES_PRODUCTS,
  },
];

interface PlywoodCollectionStorefrontProps {
  onBackToDirectory?: () => void;
  onOpenDetail?: (product: Product) => void;
}

export const PlywoodCollectionStorefront: React.FC<PlywoodCollectionStorefrontProps> = ({
  onBackToDirectory,
  onOpenDetail,
}) => {
  const [activeSubcatId, setActiveSubcatId] = useState<string>("plywood-blockboard");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedSize, setSelectedSize] = useState<string>("All");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("All");
  const [selectedGrade, setSelectedGrade] = useState<string>("All");
  const [selectedPrice, setSelectedPrice] = useState<string>("All");
  const [selectedThickness, setSelectedThickness] = useState<string>("All");
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
    PLYWOOD_SUBCATEGORIES.find((s) => s.id === activeSubcatId) || PLYWOOD_SUBCATEGORIES[0];

  // Dynamic filter options based on active subcategory products
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

  const sizeOptions = useMemo(() => {
    const set = new Set<string>();
    activeSubcat.products.forEach((p) => set.add(p.size));
    return ["All", ...Array.from(set)];
  }, [activeSubcat]);

  const materialOptions = useMemo(() => {
    const set = new Set<string>();
    activeSubcat.products.forEach((p) => set.add(p.material));
    return ["All", ...Array.from(set)];
  }, [activeSubcat]);

  const gradeOptions = useMemo(() => {
    const set = new Set<string>();
    activeSubcat.products.forEach((p) => set.add(p.grade));
    return ["All", ...Array.from(set)];
  }, [activeSubcat]);

  const thicknessOptions = useMemo(() => {
    const set = new Set<string>();
    activeSubcat.products.forEach((p) => set.add(p.thickness));
    return ["All", ...Array.from(set)];
  }, [activeSubcat]);

  const priceOptions = ["All", "Under ₹1,000", "₹1,000 - ₹2,000", "Above ₹2,000"];

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let list = activeSubcat.products.filter((p) => {
      if (selectedCategoryFilter !== "All" && p.categoryTag !== selectedCategoryFilter) return false;
      if (selectedBrand !== "All" && p.brand !== selectedBrand) return false;
      if (selectedType !== "All" && p.type !== selectedType) return false;
      if (selectedSize !== "All" && p.size !== selectedSize) return false;
      if (selectedMaterial !== "All" && p.material !== selectedMaterial) return false;
      if (selectedGrade !== "All" && p.grade !== selectedGrade) return false;
      if (selectedThickness !== "All" && p.thickness !== selectedThickness) return false;

      if (selectedPrice === "Under ₹1,000" && p.price >= 1000) return false;
      if (selectedPrice === "₹1,000 - ₹2,000" && (p.price < 1000 || p.price > 2000)) return false;
      if (selectedPrice === "Above ₹2,000" && p.price <= 2000) return false;

      return true;
    });

    if (sortBy === "Price: Low to High") {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === "Price: High to Low") {
      list = [...list].sort((a, b) => b.price - a.price);
    }

    return list;
  }, [
    activeSubcat,
    selectedCategoryFilter,
    selectedBrand,
    selectedType,
    selectedSize,
    selectedMaterial,
    selectedGrade,
    selectedPrice,
    selectedThickness,
    sortBy,
  ]);

  const resetAllFilters = () => {
    setSelectedCategoryFilter("All");
    setSelectedBrand("All");
    setSelectedType("All");
    setSelectedSize("All");
    setSelectedMaterial("All");
    setSelectedGrade("All");
    setSelectedPrice("All");
    setSelectedThickness("All");
  };

  const hasActiveFilters =
    selectedCategoryFilter !== "All" ||
    selectedBrand !== "All" ||
    selectedType !== "All" ||
    selectedSize !== "All" ||
    selectedMaterial !== "All" ||
    selectedGrade !== "All" ||
    selectedPrice !== "All" ||
    selectedThickness !== "All";

  const handleAddToCart = (p: PlywoodProduct) => {
    addToCart.mutate(
      {
        data: {
          materialId: p.id,
          category: p.materialTag,
          name: p.title,
          price: p.price,
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

  const handleIncrement = (p: PlywoodProduct) => {
    const key = `${p.materialTag.toLowerCase()}::${p.title.toLowerCase()}`;
    const entry = cartItemByKey[key];
    if (!entry || entry.ids.length === 0) {
      handleAddToCart(p);
      return;
    }
    const itemId = entry.ids[0];
    updateCartItem.mutate({
      itemId,
      data: { quantity: entry.quantity + 1 },
    });
  };

  const handleDecrement = (p: PlywoodProduct) => {
    const key = `${p.materialTag.toLowerCase()}::${p.title.toLowerCase()}`;
    const entry = cartItemByKey[key];
    if (!entry || entry.ids.length === 0) return;
    const itemId = entry.ids[0];
    if (entry.quantity <= 1) {
      removeFromCart.mutate({ itemId });
    } else {
      updateCartItem.mutate({
        itemId,
        data: { quantity: entry.quantity - 1 },
      });
    }
  };

  const getQty = (p: PlywoodProduct) => {
    const key = `${p.materialTag.toLowerCase()}::${p.title.toLowerCase()}`;
    return cartItemByKey[key]?.quantity ?? 0;
  };

  const toGenericProduct = (p: PlywoodProduct): Product => ({
    id: p.id,
    title: p.title,
    brand: p.brand,
    price: p.price,
    mrp: p.mrp,
    image: p.image,
    materialTag: p.materialTag,
    rating: p.rating || 4.8,
    reviews: 840,
    unit: p.unit,
    vendor: p.brand,
    deliveryEta: "Today, in 60 Mins",
  });

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* ── Main Storefront Container (Breadcrumbs + Category Heading + 2 Column Layout) ── */}
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
          <span className="hover:text-blue-600 transition">Plywood &amp; Boards</span>
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
          {PLYWOOD_SUBCATEGORIES.map((subcat) => {
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
            {PLYWOOD_SUBCATEGORIES.map((subcat) => {
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
            {/* ── Filter & Sort Bar (All 8 Dropdown Chips matching reference) ── */}
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
                    <div className="absolute left-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-1">
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

                {/* 4. Size Filter */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === "size" ? null : "size")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition ${
                      selectedSize !== "All"
                        ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                        : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    <span>Size{selectedSize !== "All" ? `: ${selectedSize}` : ""}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  {openDropdown === "size" && (
                    <div className="absolute left-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-1">
                      {sizeOptions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setSelectedSize(s);
                            setOpenDropdown(null);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-[12px] rounded-lg transition ${
                            selectedSize === s ? "bg-blue-50 text-blue-700 font-bold" : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 5. Material Filter */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === "material" ? null : "material")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition ${
                      selectedMaterial !== "All"
                        ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                        : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    <span>Material{selectedMaterial !== "All" ? `: ${selectedMaterial}` : ""}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  {openDropdown === "material" && (
                    <div className="absolute left-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-1">
                      {materialOptions.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            setSelectedMaterial(m);
                            setOpenDropdown(null);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-[12px] rounded-lg transition ${
                            selectedMaterial === m ? "bg-blue-50 text-blue-700 font-bold" : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 6. Grade Filter */}
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
                    <div className="absolute left-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-1">
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

                {/* 7. Price Filter */}
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

                {/* 8. Thickness Filter */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === "thickness" ? null : "thickness")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition ${
                      selectedThickness !== "All"
                        ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                        : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    <span>Thickness{selectedThickness !== "All" ? `: ${selectedThickness}` : ""}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  {openDropdown === "thickness" && (
                    <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-1">
                      {thicknessOptions.map((th) => (
                        <button
                          key={th}
                          type="button"
                          onClick={() => {
                            setSelectedThickness(th);
                            setOpenDropdown(null);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-[12px] rounded-lg transition ${
                            selectedThickness === th ? "bg-blue-50 text-blue-700 font-bold" : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          {th}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reset Filters Button */}
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
                        className="relative aspect-square w-full rounded-xl bg-[#FAFCFF] flex items-center justify-center p-2 mb-3 cursor-pointer overflow-hidden border border-slate-100"
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

                    {/* ── Action Button (10 Options / Qty Controller) ── */}
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
