import React, { useState, useMemo } from "react";
import {
  Clock,
  ChevronRight,
  Minus,
  Plus,
  SlidersHorizontal,
  Truck,
  Bike,
  ShieldCheck,
  Check,
  Package,
  Layers,
  Sparkles,
  Info,
  DoorOpen,
  KeyRound,
  Wrench,
  Maximize2,
} from "lucide-react";
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
import { ProductImage } from "@/components/ProductImage";
import type { Product } from "@/components/ProductCard";

export interface WoodHardwareProduct {
  id: string;
  slug: string;
  name: string;
  title: string;
  brand: string;
  oemModelCode: string;
  categorySlug?: string;
  categoryName?: string;
  subcategory: "plywood-8x4" | "flush-doors-30mm" | "laminates-1mm" | "hardware-locks-hinges";
  subCategory?: string;
  woodSubcategory: "PLYWOOD" | "FLUSH_DOOR" | "LAMINATE" | "HARDWARE";
  thicknessMm?: number | null;
  sheetOrDoorSizeFt?: string;
  areaSqFt?: number | null;
  dimensionsLabel?: string;
  gradeOrRating?: string;
  type: string;
  price: number;
  mrp: number;
  exGstPrice: number;
  effectivePerSqFtPrice?: number | null;
  hsnCode: string;
  gstPercent: number;
  brandTier: number;
  deliveryVehicleType: "2-Wheeler" | "E-Loader" | "E-Loader / Pickup";
  packSize: string;
  unit: string;
  spec: string;
  shortTagline?: string;
  specChips: string[];
  bulkPrice?: number;
  bulkSlabText?: string;
  image: string;
  images: string[];
  rating: number;
  reviewsCount: number;
  deliveryTime: string;
  inStock: boolean;
  optionsCount?: number;
}

export const WOOD_HARDWARE_SUBCATEGORIES = [
  {
    id: "all",
    slug: "all",
    name: "All Plywood & Hardware",
    count: 16,
    icon: "/images/subcategories/plywood-blockboard-icon.webp",
  },
  {
    id: "plywood-8x4",
    slug: "plywood-8x4",
    name: "Plywood (8x4 ft)",
    count: 6,
    icon: "/images/subcategories/plywood-blockboard-icon.webp",
  },
  {
    id: "flush-doors-30mm",
    slug: "flush-doors-30mm",
    name: "Flush Doors (30mm)",
    count: 4,
    icon: "/images/subcategories/wooden-door-hardware-icon.webp",
  },
  {
    id: "laminates-1mm",
    slug: "laminates-1mm",
    name: "Laminates (1mm)",
    count: 2,
    icon: "/images/subcategories/laminates-icon.webp",
  },
  {
    id: "hardware-locks-hinges",
    slug: "hardware-locks-hinges",
    name: "Hardware (Locks & Hinges)",
    count: 4,
    icon: "/images/subcategories/glass-door-hardware-icon.webp",
  },
];

export const ALL_WOOD_HARDWARE_PRODUCTS: WoodHardwareProduct[] = [
  {
    "id": "centuryply-club-prime-bwp-marine-plywood-18mm",
    "slug": "centuryply-club-prime-bwp-marine-plywood-18mm",
    "name": "CenturyPly Club Prime BWP Marine Plywood 18mm (8x4 ft, 32 sq ft)",
    "title": "CenturyPly Club Prime BWP Marine Plywood 18mm (8x4 ft, 32 sq ft)",
    "brand": "CenturyPly",
    "oemModelCode": "PLY-CP-CP-18",
    "subcategory": "plywood-8x4",
    "subCategory": "Plywood (8x4 ft)",
    "categorySlug": "plywood-boards",
    "categoryName": "Plywood, Doors & Hardware",
    "woodSubcategory": "PLYWOOD",
    "thicknessMm": 18,
    "sheetOrDoorSizeFt": "8x4 ft",
    "areaSqFt": 32,
    "dimensionsLabel": "8x4 ft (32 sq ft)",
    "gradeOrRating": "IS:710 BWP Marine",
    "type": "BWP Marine Plywood",
    "price": 4448,
    "mrp": 5115,
    "exGstPrice": 3769,
    "effectivePerSqFtPrice": 139,
    "hsnCode": "4412",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader / Pickup",
    "packSize": "1 Sheet (8x4 ft)",
    "unit": "1 Sheet (8x4 ft)",
    "spec": "IS:710 BWP Marine Grade \u2022 100% Calibrated Core \u2022 30-Year Warranty \u2022 Borer & Termite Proof",
    "shortTagline": "India's No. 1 Premium Calibrated Marine Plywood \u2022 30-Year Warranty",
    "specChips": [
      "IS:710 Marine",
      "18mm Calibrated",
      "32 sq ft Sheet",
      "30-Yr Warranty"
    ],
    "bulkPrice": 4350,
    "bulkSlabText": "\u20b94,350/sheet on 10+ Sheets",
    "image": "/images/products/wood-hardware/centuryply-club-prime-bwp-marine-plywood-18mm.webp",
    "images": [
      "/images/products/wood-hardware/centuryply-club-prime-bwp-marine-plywood-18mm.webp"
    ],
    "rating": 4.9,
    "reviewsCount": 142,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "optionsCount": 1
  },
  {
    "id": "centuryply-club-prime-bwp-plywood-19mm",
    "slug": "centuryply-club-prime-bwp-plywood-19mm",
    "name": "CenturyPly Club Prime BWP Plywood 19mm (8x4 ft, 30-Yr Warranty)",
    "title": "CenturyPly Club Prime BWP Plywood 19mm (8x4 ft, 30-Yr Warranty)",
    "brand": "CenturyPly",
    "oemModelCode": "PLY-CP-CP-19",
    "subcategory": "plywood-8x4",
    "subCategory": "Plywood (8x4 ft)",
    "categorySlug": "plywood-boards",
    "categoryName": "Plywood, Doors & Hardware",
    "woodSubcategory": "PLYWOOD",
    "thicknessMm": 19,
    "sheetOrDoorSizeFt": "8x4 ft",
    "areaSqFt": 32,
    "dimensionsLabel": "8x4 ft (32 sq ft)",
    "gradeOrRating": "IS:710 BWP Marine",
    "type": "BWP Marine Plywood",
    "price": 4928,
    "mrp": 5667,
    "exGstPrice": 4176,
    "effectivePerSqFtPrice": 154,
    "hsnCode": "4412",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader / Pickup",
    "packSize": "1 Sheet (8x4 ft)",
    "unit": "1 Sheet (8x4 ft)",
    "spec": "IS:710 BWP Marine \u2022 Heavy 19mm Calibrated Hardwood Core \u2022 30-Year Guarantee \u2022 Boiling Water Proof",
    "shortTagline": "Heavy Duty 19mm Calibrated Structural Marine Plywood",
    "specChips": [
      "IS:710 Marine",
      "19mm Heavy Duty",
      "32 sq ft Sheet",
      "30-Yr Warranty"
    ],
    "bulkPrice": 4820,
    "bulkSlabText": "\u20b94,820/sheet on 10+ Sheets",
    "image": "/images/products/wood-hardware/centuryply-club-prime-bwp-plywood-19mm.webp",
    "images": [
      "/images/products/wood-hardware/centuryply-club-prime-bwp-plywood-19mm.webp"
    ],
    "rating": 4.9,
    "reviewsCount": 118,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "optionsCount": 1
  },
  {
    "id": "centuryply-sainik-710-marine-plywood-18mm",
    "slug": "centuryply-sainik-710-marine-plywood-18mm",
    "name": "CenturyPly Sainik 710 Marine Plywood 18mm (8x4 ft, IS 710)",
    "title": "CenturyPly Sainik 710 Marine Plywood 18mm (8x4 ft, IS 710)",
    "brand": "CenturyPly",
    "oemModelCode": "PLY-CP-SK-18",
    "subcategory": "plywood-8x4",
    "subCategory": "Plywood (8x4 ft)",
    "categorySlug": "plywood-boards",
    "categoryName": "Plywood, Doors & Hardware",
    "woodSubcategory": "PLYWOOD",
    "thicknessMm": 18,
    "sheetOrDoorSizeFt": "8x4 ft",
    "areaSqFt": 32,
    "dimensionsLabel": "8x4 ft (32 sq ft)",
    "gradeOrRating": "IS:710 BWP Marine",
    "type": "BWP Marine Plywood",
    "price": 3872,
    "mrp": 4450,
    "exGstPrice": 3281,
    "effectivePerSqFtPrice": 121,
    "hsnCode": "4412",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader / Pickup",
    "packSize": "1 Sheet (8x4 ft)",
    "unit": "1 Sheet (8x4 ft)",
    "spec": "Asli Waterproof Plywood \u2022 IS:710 Certified \u2022 8-Year Warranty \u2022 Chemically Treated Against Borers",
    "shortTagline": "Sainik 710 Asli Waterproof Marine Plywood \u2022 Lucknow Favourited",
    "specChips": [
      "IS:710 Certified",
      "18mm Waterproof",
      "32 sq ft Sheet",
      "8-Yr Warranty"
    ],
    "bulkPrice": 3780,
    "bulkSlabText": "\u20b93,780/sheet on 10+ Sheets",
    "image": "/images/products/wood-hardware/centuryply-sainik-710-marine-plywood-18mm.webp",
    "images": [
      "/images/products/wood-hardware/centuryply-sainik-710-marine-plywood-18mm.webp"
    ],
    "rating": 4.8,
    "reviewsCount": 165,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "optionsCount": 1
  },
  {
    "id": "centuryply-sainik-710-plywood-19mm",
    "slug": "centuryply-sainik-710-plywood-19mm",
    "name": "CenturyPly Sainik 710 Plywood 19mm (8x4 ft)",
    "title": "CenturyPly Sainik 710 Plywood 19mm (8x4 ft)",
    "brand": "CenturyPly",
    "oemModelCode": "PLY-CP-SK-19",
    "subcategory": "plywood-8x4",
    "subCategory": "Plywood (8x4 ft)",
    "categorySlug": "plywood-boards",
    "categoryName": "Plywood, Doors & Hardware",
    "woodSubcategory": "PLYWOOD",
    "thicknessMm": 19,
    "sheetOrDoorSizeFt": "8x4 ft",
    "areaSqFt": 32,
    "dimensionsLabel": "8x4 ft (32 sq ft)",
    "gradeOrRating": "IS:710 BWP Marine",
    "type": "BWP Marine Plywood",
    "price": 3808,
    "mrp": 4380,
    "exGstPrice": 3227,
    "effectivePerSqFtPrice": 119,
    "hsnCode": "4412",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader / Pickup",
    "packSize": "1 Sheet (8x4 ft)",
    "unit": "1 Sheet (8x4 ft)",
    "spec": "National Standard 19mm BWP Marine Sheet \u2022 Lucknow Market Leader \u2022 High Screw Holding Strength",
    "shortTagline": "19mm Heavy Sainik 710 Waterproof Sheet \u2022 High Screw Holding",
    "specChips": [
      "IS:710 Certified",
      "19mm Standard",
      "32 sq ft Sheet",
      "\u20b9119/sq ft"
    ],
    "bulkPrice": 3720,
    "bulkSlabText": "\u20b93,720/sheet on 10+ Sheets",
    "image": "/images/products/wood-hardware/centuryply-sainik-710-plywood-19mm.webp",
    "images": [
      "/images/products/wood-hardware/centuryply-sainik-710-plywood-19mm.webp"
    ],
    "rating": 4.8,
    "reviewsCount": 194,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "optionsCount": 1
  },
  {
    "id": "greenply-green-gold-2-0-marine-plywood-18mm",
    "slug": "greenply-green-gold-2-0-marine-plywood-18mm",
    "name": "Greenply Green Gold 2.0 Marine Plywood 18mm (8x4 ft, IS 710)",
    "title": "Greenply Green Gold 2.0 Marine Plywood 18mm (8x4 ft, IS 710)",
    "brand": "Greenply",
    "oemModelCode": "PLY-GP-GG-18",
    "subcategory": "plywood-8x4",
    "subCategory": "Plywood (8x4 ft)",
    "categorySlug": "plywood-boards",
    "categoryName": "Plywood, Doors & Hardware",
    "woodSubcategory": "PLYWOOD",
    "thicknessMm": 18,
    "sheetOrDoorSizeFt": "8x4 ft",
    "areaSqFt": 32,
    "dimensionsLabel": "8x4 ft (32 sq ft)",
    "gradeOrRating": "IS:710 BWP Marine",
    "type": "BWP Marine Plywood",
    "price": 2592,
    "mrp": 2980,
    "exGstPrice": 2197,
    "effectivePerSqFtPrice": 81,
    "hsnCode": "4412",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader / Pickup",
    "packSize": "1 Sheet (8x4 ft)",
    "unit": "1 Sheet (8x4 ft)",
    "spec": "IS:710 Certified Marine Grade \u2022 Quadra-Pro Technology \u2022 Dual Calibration \u2022 Anti-Bacterial Coating",
    "shortTagline": "Green Gold 2.0 Quadra-Pro Calibrated Marine Plywood",
    "specChips": [
      "IS:710 Marine",
      "18mm Dual Calibrated",
      "32 sq ft Sheet",
      "\u20b981/sq ft"
    ],
    "bulkPrice": 2520,
    "bulkSlabText": "\u20b92,520/sheet on 10+ Sheets",
    "image": "/images/products/wood-hardware/greenply-green-gold-2-0-marine-plywood-18mm.webp",
    "images": [
      "/images/products/wood-hardware/greenply-green-gold-2-0-marine-plywood-18mm.webp"
    ],
    "rating": 4.8,
    "reviewsCount": 89,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "optionsCount": 1
  },
  {
    "id": "greenply-ecotec-bwr-plywood-18mm",
    "slug": "greenply-ecotec-bwr-plywood-18mm",
    "name": "Greenply Ecotec / BWR Plywood 18mm (8x4 ft)",
    "title": "Greenply Ecotec / BWR Plywood 18mm (8x4 ft)",
    "brand": "Greenply",
    "oemModelCode": "PLY-GP-EC-18",
    "subcategory": "plywood-8x4",
    "subCategory": "Plywood (8x4 ft)",
    "categorySlug": "plywood-boards",
    "categoryName": "Plywood, Doors & Hardware",
    "woodSubcategory": "PLYWOOD",
    "thicknessMm": 18,
    "sheetOrDoorSizeFt": "8x4 ft",
    "areaSqFt": 32,
    "dimensionsLabel": "8x4 ft (32 sq ft)",
    "gradeOrRating": "IS:303 BWR Grade",
    "type": "BWR Plywood",
    "price": 2450,
    "mrp": 2818,
    "exGstPrice": 2076,
    "effectivePerSqFtPrice": 77,
    "hsnCode": "4412",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader / Pickup",
    "packSize": "1 Sheet (8x4 ft)",
    "unit": "1 Sheet (8x4 ft)",
    "spec": "IS:303 Moisture Resistant / Boiling Water Resistant \u2022 Selected Hardwood Timber \u2022 Warp-Free Quality",
    "shortTagline": "Ecotec BWR Moisture Resistant Commercial Woodworking Sheet",
    "specChips": [
      "IS:303 BWR",
      "18mm Sheet",
      "32 sq ft Sheet",
      "\u20b977/sq ft"
    ],
    "bulkPrice": 2380,
    "bulkSlabText": "\u20b92,380/sheet on 10+ Sheets",
    "image": "/images/products/wood-hardware/greenply-ecotec-bwr-plywood-18mm.webp",
    "images": [
      "/images/products/wood-hardware/greenply-ecotec-bwr-plywood-18mm.webp"
    ],
    "rating": 4.7,
    "reviewsCount": 112,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "optionsCount": 1
  },
  {
    "id": "centuryply-club-prime-bwp-flush-door-30mm-7x3",
    "slug": "centuryply-club-prime-bwp-flush-door-30mm-7x3",
    "name": "CenturyPly Club Prime BWP Flush Door 30mm (7x3 ft)",
    "title": "CenturyPly Club Prime BWP Flush Door 30mm (7x3 ft)",
    "brand": "CenturyPly",
    "oemModelCode": "DOR-CP-CP-30",
    "subcategory": "flush-doors-30mm",
    "subCategory": "Flush Doors (30mm)",
    "categorySlug": "plywood-boards",
    "categoryName": "Plywood, Doors & Hardware",
    "woodSubcategory": "FLUSH_DOOR",
    "thicknessMm": 30,
    "sheetOrDoorSizeFt": "7x3 ft",
    "areaSqFt": 21,
    "dimensionsLabel": "7x3 ft (21 sq ft)",
    "gradeOrRating": "IS:2202 BWP Solid Core",
    "type": "BWP Solid Core Flush Door",
    "price": 5367,
    "mrp": 6170,
    "exGstPrice": 4548,
    "effectivePerSqFtPrice": 256,
    "hsnCode": "4418",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader / Pickup",
    "packSize": "1 Door (7x3 ft)",
    "unit": "1 Door (7x3 ft)",
    "spec": "30mm Solid Core Timber Pine Fill \u2022 Phenolic Bonded BWP \u2022 Anti-Swell & Anti-Delamination \u2022 25-Yr Warranty",
    "shortTagline": "Premium 30mm BWP Phenolic Flush Door with 25-Year Warranty",
    "specChips": [
      "30mm Solid Core",
      "7x3 ft (21 sq ft)",
      "IS:2202 BWP",
      "25-Yr Warranty"
    ],
    "bulkPrice": 5250,
    "bulkSlabText": "\u20b95,250/door on 5+ Doors",
    "image": "/images/products/wood-hardware/centuryply-club-prime-bwp-flush-door-30mm-7x3.webp",
    "images": [
      "/images/products/wood-hardware/centuryply-club-prime-bwp-flush-door-30mm-7x3.webp"
    ],
    "rating": 4.9,
    "reviewsCount": 78,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "optionsCount": 1
  },
  {
    "id": "centuryply-bond-flush-door-30mm-solid-core-7x3",
    "slug": "centuryply-bond-flush-door-30mm-solid-core-7x3",
    "name": "CenturyPly Bond Flush Door 30mm Solid Core (7x3 ft)",
    "title": "CenturyPly Bond Flush Door 30mm Solid Core (7x3 ft)",
    "brand": "CenturyPly",
    "oemModelCode": "DOR-CP-BD-30",
    "subcategory": "flush-doors-30mm",
    "subCategory": "Flush Doors (30mm)",
    "categorySlug": "plywood-boards",
    "categoryName": "Plywood, Doors & Hardware",
    "woodSubcategory": "FLUSH_DOOR",
    "thicknessMm": 30,
    "sheetOrDoorSizeFt": "7x3 ft",
    "areaSqFt": 21,
    "dimensionsLabel": "7x3 ft (21 sq ft)",
    "gradeOrRating": "IS:2202 Solid Core",
    "type": "Solid Core Flush Door",
    "price": 3822,
    "mrp": 4395,
    "exGstPrice": 3239,
    "effectivePerSqFtPrice": 182,
    "hsnCode": "4418",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader / Pickup",
    "packSize": "1 Door (7x3 ft)",
    "unit": "1 Door (7x3 ft)",
    "spec": "Kiln Seasoned Solid Battens \u2022 High Screw Holding Capacity for Mortise Locks \u2022 Smooth Sanded Face",
    "shortTagline": "Reliable 30mm Seasoned Hardwood Solid Core Flush Door",
    "specChips": [
      "30mm Solid Core",
      "7x3 ft (21 sq ft)",
      "IS:2202 Certified",
      "\u20b9182/sq ft"
    ],
    "bulkPrice": 3740,
    "bulkSlabText": "\u20b93,740/door on 5+ Doors",
    "image": "/images/products/wood-hardware/centuryply-bond-flush-door-30mm-solid-core-7x3.webp",
    "images": [
      "/images/products/wood-hardware/centuryply-bond-flush-door-30mm-solid-core-7x3.webp"
    ],
    "rating": 4.8,
    "reviewsCount": 94,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "optionsCount": 1
  },
  {
    "id": "greenply-green-ecotech-platinum-flush-door-30mm-7x3",
    "slug": "greenply-green-ecotech-platinum-flush-door-30mm-7x3",
    "name": "Greenply Green Ecotech Platinum Flush Door 30mm (7x3 ft)",
    "title": "Greenply Green Ecotech Platinum Flush Door 30mm (7x3 ft)",
    "brand": "Greenply",
    "oemModelCode": "DOR-GP-EP-30",
    "subcategory": "flush-doors-30mm",
    "subCategory": "Flush Doors (30mm)",
    "categorySlug": "plywood-boards",
    "categoryName": "Plywood, Doors & Hardware",
    "woodSubcategory": "FLUSH_DOOR",
    "thicknessMm": 30,
    "sheetOrDoorSizeFt": "7x3 ft",
    "areaSqFt": 21,
    "dimensionsLabel": "7x3 ft (21 sq ft)",
    "gradeOrRating": "IS:2202 Solid Pine Core",
    "type": "Solid Core Flush Door",
    "price": 3528,
    "mrp": 4057,
    "exGstPrice": 2990,
    "effectivePerSqFtPrice": 168,
    "hsnCode": "4418",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader / Pickup",
    "packSize": "1 Door (7x3 ft)",
    "unit": "1 Door (7x3 ft)",
    "spec": "Solid Plantation Timber Core \u2022 Precision Calibrated Thickness \u2022 Treated with Organo-Boron Preservatives",
    "shortTagline": "Greenply Platinum Seasoned Timber Solid Core Flush Door",
    "specChips": [
      "30mm Solid Core",
      "7x3 ft (21 sq ft)",
      "Calibrated Frame",
      "\u20b9168/sq ft"
    ],
    "bulkPrice": 3450,
    "bulkSlabText": "\u20b93,450/door on 5+ Doors",
    "image": "/images/products/wood-hardware/greenply-green-ecotech-platinum-flush-door-30mm-7x3.webp",
    "images": [
      "/images/products/wood-hardware/greenply-green-ecotech-platinum-flush-door-30mm-7x3.webp"
    ],
    "rating": 4.8,
    "reviewsCount": 65,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "optionsCount": 1
  },
  {
    "id": "greenply-optima-g-flush-door-30mm-7x3",
    "slug": "greenply-optima-g-flush-door-30mm-7x3",
    "name": "Greenply Optima G Flush Door 30mm (7x3 ft)",
    "title": "Greenply Optima G Flush Door 30mm (7x3 ft)",
    "brand": "Greenply",
    "oemModelCode": "DOR-GP-OG-30",
    "subcategory": "flush-doors-30mm",
    "subCategory": "Flush Doors (30mm)",
    "categorySlug": "plywood-boards",
    "categoryName": "Plywood, Doors & Hardware",
    "woodSubcategory": "FLUSH_DOOR",
    "thicknessMm": 30,
    "sheetOrDoorSizeFt": "7x3 ft",
    "areaSqFt": 21,
    "dimensionsLabel": "7x3 ft (21 sq ft)",
    "gradeOrRating": "IS:2202 Moisture Proof",
    "type": "Solid Core Flush Door",
    "price": 3780,
    "mrp": 4347,
    "exGstPrice": 3203,
    "effectivePerSqFtPrice": 180,
    "hsnCode": "4418",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader / Pickup",
    "packSize": "1 Door (7x3 ft)",
    "unit": "1 Door (7x3 ft)",
    "spec": "Heavy Duty Internal Frames \u2022 Resists Seasonal Warping & Bending \u2022 Ideal for Bedroom & Main Entries",
    "shortTagline": "Optima G Heavy Duty Dimensional Stable Solid Flush Door",
    "specChips": [
      "30mm Solid Core",
      "7x3 ft (21 sq ft)",
      "Anti-Warp Pine",
      "\u20b9180/sq ft"
    ],
    "bulkPrice": 3690,
    "bulkSlabText": "\u20b93,690/door on 5+ Doors",
    "image": "/images/products/wood-hardware/greenply-optima-g-flush-door-30mm-7x3.webp",
    "images": [
      "/images/products/wood-hardware/greenply-optima-g-flush-door-30mm-7x3.webp"
    ],
    "rating": 4.7,
    "reviewsCount": 82,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "optionsCount": 1
  },
  {
    "id": "century-1mm-laminate-3846-white-marble-8x4",
    "slug": "century-1mm-laminate-3846-white-marble-8x4",
    "name": "Century 1mm Laminate 3846 White Marble (8x4 ft)",
    "title": "Century 1mm Laminate 3846 White Marble (8x4 ft)",
    "brand": "Century",
    "oemModelCode": "LAM-CN-WM-01",
    "subcategory": "laminates-1mm",
    "subCategory": "Laminates (1mm)",
    "categorySlug": "plywood-boards",
    "categoryName": "Plywood, Doors & Hardware",
    "woodSubcategory": "LAMINATE",
    "thicknessMm": 1,
    "sheetOrDoorSizeFt": "8x4 ft",
    "areaSqFt": 32,
    "dimensionsLabel": "8x4 ft (32 sq ft)",
    "gradeOrRating": "Decorative High Pressure Laminate (HPL)",
    "type": "1mm Decorative Laminate",
    "price": 2239,
    "mrp": 2575,
    "exGstPrice": 1897,
    "effectivePerSqFtPrice": 70,
    "hsnCode": "4823",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "packSize": "1 Sheet (8x4 ft)",
    "unit": "1 Sheet (8x4 ft)",
    "spec": "1.0mm Calibrated Thickness \u2022 Italian Carrara White Marble Finish \u2022 Scratch, Heat & Stain Resistant",
    "shortTagline": "1.0mm Ultra-Gloss Italian Carrara Marble High Pressure Laminate",
    "specChips": [
      "1.0mm HPL",
      "Carrara Marble",
      "8x4 ft (32 sq ft)",
      "Scratch Proof"
    ],
    "bulkPrice": 2180,
    "bulkSlabText": "\u20b92,180/sheet on 5+ Sheets",
    "image": "/images/products/wood-hardware/century-1mm-laminate-3846-white-marble-8x4.webp",
    "images": [
      "/images/products/wood-hardware/century-1mm-laminate-3846-white-marble-8x4.webp"
    ],
    "rating": 4.9,
    "reviewsCount": 54,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "optionsCount": 1
  },
  {
    "id": "century-1mm-laminate-449-urban-teak-8x4",
    "slug": "century-1mm-laminate-449-urban-teak-8x4",
    "name": "Century 1mm Laminate 449 Urban Teak (8x4 ft)",
    "title": "Century 1mm Laminate 449 Urban Teak (8x4 ft)",
    "brand": "Century",
    "oemModelCode": "LAM-CN-UT-01",
    "subcategory": "laminates-1mm",
    "subCategory": "Laminates (1mm)",
    "categorySlug": "plywood-boards",
    "categoryName": "Plywood, Doors & Hardware",
    "woodSubcategory": "LAMINATE",
    "thicknessMm": 1,
    "sheetOrDoorSizeFt": "8x4 ft",
    "areaSqFt": 32,
    "dimensionsLabel": "8x4 ft (32 sq ft)",
    "gradeOrRating": "Decorative High Pressure Laminate (HPL)",
    "type": "1mm Decorative Laminate",
    "price": 1867,
    "mrp": 2147,
    "exGstPrice": 1582,
    "effectivePerSqFtPrice": 58,
    "hsnCode": "4823",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "packSize": "1 Sheet (8x4 ft)",
    "unit": "1 Sheet (8x4 ft)",
    "spec": "1.0mm Textured Natural Woodgrain \u2022 Natural Burma Teak Texture \u2022 Crack & Moisture Resistant Backing",
    "shortTagline": "1.0mm Natural Burma Woodgrain Textured Urban Teak Sheet",
    "specChips": [
      "1.0mm HPL",
      "Urban Teak Grain",
      "8x4 ft (32 sq ft)",
      "Heat Resistant"
    ],
    "bulkPrice": 1810,
    "bulkSlabText": "\u20b91,810/sheet on 5+ Sheets",
    "image": "/images/products/wood-hardware/century-1mm-laminate-449-urban-teak-8x4.webp",
    "images": [
      "/images/products/wood-hardware/century-1mm-laminate-449-urban-teak-8x4.webp"
    ],
    "rating": 4.8,
    "reviewsCount": 67,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "optionsCount": 1
  },
  {
    "id": "godrej-stella-180mm-mortise-door-lock-handle-set",
    "slug": "godrej-stella-180mm-mortise-door-lock-handle-set",
    "name": "Godrej Stella 180mm Mortise Door Lock Handle Set (6-Lever, Satin)",
    "title": "Godrej Stella 180mm Mortise Door Lock Handle Set (6-Lever, Satin)",
    "brand": "Godrej",
    "oemModelCode": "HDW-GJ-ST-18",
    "subcategory": "hardware-locks-hinges",
    "subCategory": "Hardware (Locks, Closers & Hinges)",
    "categorySlug": "plywood-boards",
    "categoryName": "Plywood, Doors & Hardware",
    "woodSubcategory": "HARDWARE",
    "thicknessMm": null,
    "sheetOrDoorSizeFt": "25\u201345mm doors",
    "areaSqFt": null,
    "dimensionsLabel": "Fit for 25\u201345mm door",
    "gradeOrRating": "6-Lever Brass Mortise Lock",
    "type": "Mortise Lock Handle Set",
    "price": 1577,
    "mrp": 1813,
    "exGstPrice": 1336,
    "effectivePerSqFtPrice": null,
    "hsnCode": "8301",
    "gstPercent": 18,
    "brandTier": 2,
    "deliveryVehicleType": "2-Wheeler",
    "packSize": "1 Handle & Lock Set",
    "unit": "1 Set",
    "spec": "Solid Zinc Alloy Handles \u2022 6-Brass Lever Reversible Latch Mechanism \u2022 Suitable for 30\u201345mm Flush Doors",
    "shortTagline": "Solid Zinc Alloy Satin Handle with 6-Lever Anti-Pick Mortise Lock",
    "specChips": [
      "6-Lever Brass",
      "Satin Chrome",
      "25\u201345mm Doors",
      "3 Brass Keys"
    ],
    "bulkPrice": 1520,
    "bulkSlabText": "\u20b91,520/set on 5+ Sets",
    "image": "/images/products/wood-hardware/godrej-stella-180mm-mortise-door-lock-handle-set.webp",
    "images": [
      "/images/products/wood-hardware/godrej-stella-180mm-mortise-door-lock-handle-set.webp"
    ],
    "rating": 4.9,
    "reviewsCount": 210,
    "deliveryTime": "30 Mins Express",
    "inStock": true,
    "optionsCount": 1
  },
  {
    "id": "europa-mortise-rose-handle-combo-set-m516961r692ab",
    "slug": "europa-mortise-rose-handle-combo-set-m516961r692ab",
    "name": "Europa Mortise Rose Handle Combo Set M516961R692AB (Antique Finish)",
    "title": "Europa Mortise Rose Handle Combo Set M516961R692AB (Antique Finish)",
    "brand": "Europa",
    "oemModelCode": "HDW-EP-RH-01",
    "subcategory": "hardware-locks-hinges",
    "subCategory": "Hardware (Locks, Closers & Hinges)",
    "categorySlug": "plywood-boards",
    "categoryName": "Plywood, Doors & Hardware",
    "woodSubcategory": "HARDWARE",
    "thicknessMm": null,
    "sheetOrDoorSizeFt": "28\u201350mm doors",
    "areaSqFt": null,
    "dimensionsLabel": "Fit for 28\u201350mm door",
    "gradeOrRating": "Heavy Duty Rose Handle + Euro Profile Cylinder Lock",
    "type": "Mortise Rose Handle Combo",
    "price": 1990,
    "mrp": 2288,
    "exGstPrice": 1686,
    "effectivePerSqFtPrice": null,
    "hsnCode": "8301",
    "gstPercent": 18,
    "brandTier": 2,
    "deliveryVehicleType": "2-Wheeler",
    "packSize": "1 Combo Set",
    "unit": "1 Set",
    "spec": "Antique Brass Rose Handles \u2022 3 Computerized Dimple Keys \u2022 Drill & Pick Resistant Cylinder",
    "shortTagline": "Designer Antique Rose Handle with Computerized Dimple Cylinder",
    "specChips": [
      "Computerized Key",
      "Antique Brass",
      "28\u201350mm Doors",
      "Euro Cylinder"
    ],
    "bulkPrice": 1930,
    "bulkSlabText": "\u20b91,930/set on 5+ Sets",
    "image": "/images/products/wood-hardware/europa-mortise-rose-handle-combo-set-m516961r692ab.webp",
    "images": [
      "/images/products/wood-hardware/europa-mortise-rose-handle-combo-set-m516961r692ab.webp"
    ],
    "rating": 4.8,
    "reviewsCount": 135,
    "deliveryTime": "30 Mins Express",
    "inStock": true,
    "optionsCount": 1
  },
  {
    "id": "dorset-dc60sm-60kg-overhead-door-closer",
    "slug": "dorset-dc60sm-60kg-overhead-door-closer",
    "name": "Dorset DC60SM 60kg Overhead Door Closer (Satin Finish)",
    "title": "Dorset DC60SM 60kg Overhead Door Closer (Satin Finish)",
    "brand": "Dorset",
    "oemModelCode": "HDW-DR-DC-60",
    "subcategory": "hardware-locks-hinges",
    "subCategory": "Hardware (Locks, Closers & Hinges)",
    "categorySlug": "plywood-boards",
    "categoryName": "Plywood, Doors & Hardware",
    "woodSubcategory": "HARDWARE",
    "thicknessMm": null,
    "sheetOrDoorSizeFt": "Doors \u2264 60 kg",
    "areaSqFt": null,
    "dimensionsLabel": "Up to 60kg door weight",
    "gradeOrRating": "Dual Valve Hydraulic Rack & Pinion",
    "type": "Hydraulic Overhead Door Closer",
    "price": 927,
    "mrp": 1066,
    "exGstPrice": 786,
    "effectivePerSqFtPrice": null,
    "hsnCode": "8302",
    "gstPercent": 18,
    "brandTier": 2,
    "deliveryVehicleType": "2-Wheeler",
    "packSize": "1 Door Closer Set",
    "unit": "1 Piece",
    "spec": "Cast Aluminium Body \u2022 Two Independent Regulating Valves for Latching & Closing Speeds \u2022 500,000 Cycles Tested",
    "shortTagline": "Dual-Valve Hydraulic Rack & Pinion Door Closer for Doors \u2264 60kg",
    "specChips": [
      "Up to 60kg",
      "Two-Speed Valve",
      "Satin Silver",
      "500k Cycles"
    ],
    "bulkPrice": 890,
    "bulkSlabText": "\u20b9890/piece on 4+ Pieces",
    "image": "/images/products/wood-hardware/dorset-dc60sm-60kg-overhead-door-closer.webp",
    "images": [
      "/images/products/wood-hardware/dorset-dc60sm-60kg-overhead-door-closer.webp"
    ],
    "rating": 4.8,
    "reviewsCount": 98,
    "deliveryTime": "30 Mins Express",
    "inStock": true,
    "optionsCount": 1
  },
  {
    "id": "hettich-onsys-4447i-soft-close-hinges-105-1-pair",
    "slug": "hettich-onsys-4447i-soft-close-hinges-105-1-pair",
    "name": "Hettich Onsys 4447i Soft Close Hinges 105\u00b0 (1 Pair, Magna Black)",
    "title": "Hettich Onsys 4447i Soft Close Hinges 105\u00b0 (1 Pair, Magna Black)",
    "brand": "Hettich",
    "oemModelCode": "HDW-HT-ON-01",
    "subcategory": "hardware-locks-hinges",
    "subCategory": "Hardware (Locks, Closers & Hinges)",
    "categorySlug": "plywood-boards",
    "categoryName": "Plywood, Doors & Hardware",
    "woodSubcategory": "HARDWARE",
    "thicknessMm": null,
    "sheetOrDoorSizeFt": "15\u201324mm shutters",
    "areaSqFt": null,
    "dimensionsLabel": "For 15\u201324mm door thickness",
    "gradeOrRating": "Concealed Soft-Close Clip-on 105\u00b0",
    "type": "Soft Close Concealed Hinges",
    "price": 222,
    "mrp": 255,
    "exGstPrice": 188,
    "effectivePerSqFtPrice": null,
    "hsnCode": "8302",
    "gstPercent": 18,
    "brandTier": 2,
    "deliveryVehicleType": "2-Wheeler",
    "packSize": "1 Pair (2 Hinges)",
    "unit": "1 Pair",
    "spec": "Integrated Silent System Damper \u2022 35mm Cup Diameter \u2022 Premium Magna Black Anti-Corrosion Finish \u2022 1 Pair (2 Hinges)",
    "shortTagline": "German Engineered Concealed Soft-Close Silent Cabinet Hinges",
    "specChips": [
      "105\u00b0 Opening",
      "Magna Black",
      "15\u201324mm Shutters",
      "1 Pair (2 Pcs)"
    ],
    "bulkPrice": 210,
    "bulkSlabText": "\u20b9210/pair on 10+ Pairs",
    "image": "/images/products/wood-hardware/hettich-onsys-4447i-soft-close-hinges-105-1-pair.webp",
    "images": [
      "/images/products/wood-hardware/hettich-onsys-4447i-soft-close-hinges-105-1-pair.webp"
    ],
    "rating": 4.9,
    "reviewsCount": 240,
    "deliveryTime": "30 Mins Express",
    "inStock": true,
    "optionsCount": 1
  }
];

export interface PlywoodCollectionStorefrontProps {
  defaultSubcat?: string;
  onOpenDetail?: (product: Product) => void;
  onBackToDirectory?: () => void;
}

export const PlywoodCollectionStorefront: React.FC<PlywoodCollectionStorefrontProps> = ({
  defaultSubcat,
  onOpenDetail,
  onBackToDirectory,
}) => {
  const queryClient = useQueryClient();
  const { data: cartData } = useGetCart();
  const addToCartMutation = useAddToCart();
  const updateCartItemMutation = useUpdateCartItem();
  const removeFromCartMutation = useRemoveFromCart();

  const [selectedSubcat, setSelectedSubcat] = useState<string>(() => {
    if (defaultSubcat && WOOD_HARDWARE_SUBCATEGORIES.some((s) => s.slug === defaultSubcat)) {
      return defaultSubcat;
    }
    return "all";
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<number | "all">("all");
  const [selectedThickness, setSelectedThickness] = useState<string>("all");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("all");
  const [modalProduct, setModalProduct] = useState<WoodHardwareProduct | null>(null);

  // Cart items flattened
  const cartItems = useMemo(() => {
    const list: Array<{ id: string; materialId: string; quantity: number; name?: string }> = [];
    if (!cartData?.categories) return list;
    for (const c of cartData.categories) {
      for (const item of c.items ?? []) {
        list.push({
          id: item.id,
          materialId: item.materialId,
          quantity: item.quantity,
          name: item.name,
        });
      }
    }
    return list;
  }, [cartData]);

  // Cart index for quick qty lookup
  const cartItemByKey = useMemo(() => {
    const map = new Map<string, (typeof cartItems)[0]>();
    for (const item of cartItems) {
      if (item.materialId) map.set(item.materialId, item);
      if (item.name) map.set(item.name.toLowerCase(), item);
    }
    return map;
  }, [cartItems]);

  // Compatibility Engine: Detect items in cart to trigger cross-sells
  const { hasFlushDoors, hasPlywood } = useMemo(() => {
    let flush = false;
    let ply = false;
    for (const item of cartItems) {
      const titleLower = (item.name || "").toLowerCase();
      if (titleLower.includes("flush door") || titleLower.includes("door 30mm")) flush = true;
      if (titleLower.includes("plywood") || titleLower.includes("sainik") || titleLower.includes("club prime") || titleLower.includes("green gold")) ply = true;
    }
    return { hasFlushDoors: flush, hasPlywood: ply };
  }, [cartItems]);

  // Available brands in the category
  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    ALL_WOOD_HARDWARE_PRODUCTS.forEach((p) => set.add(p.brand));
    return Array.from(set).sort();
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return ALL_WOOD_HARDWARE_PRODUCTS.filter((p) => {
      // Subcategory filter
      if (selectedSubcat !== "all" && p.subcategory !== selectedSubcat) {
        return false;
      }

      // Brand filter
      if (selectedBrand !== "all" && p.brand !== selectedBrand) {
        return false;
      }

      // Tier filter
      if (tierFilter !== "all" && p.brandTier !== tierFilter) {
        return false;
      }

      // Thickness filter
      if (selectedThickness !== "all") {
        if (p.thicknessMm === null || p.thicknessMm === undefined) return false;
        if (p.thicknessMm.toString() !== selectedThickness) return false;
      }

      // Vehicle filter
      if (selectedVehicle !== "all" && p.deliveryVehicleType !== selectedVehicle) {
        return false;
      }

      // Text search
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesHsn = p.hsnCode.includes(q);
        const matchesModel = p.oemModelCode.toLowerCase().includes(q);
        const matchesSpec = p.spec.toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesHsn && !matchesModel && !matchesSpec) {
          return false;
        }
      }

      return true;
    });
  }, [selectedSubcat, selectedBrand, tierFilter, selectedThickness, selectedVehicle, searchQuery]);

  // Cart operations
  const handleAddToCart = (product: WoodHardwareProduct) => {
    const current = cartItemByKey.get(product.id) || cartItemByKey.get(product.name.toLowerCase());
    if (current) {
      updateCartItemMutation.mutate(
        { itemId: current.id, data: { quantity: current.quantity + 1 } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
            toast.success(`Updated ${product.name} in cart`);
          },
        }
      );
    } else {
      addToCartMutation.mutate(
        {
          data: {
            materialId: product.id,
            quantity: 1,
            name: product.name,
            price: product.price,
            unit: product.unit,
            vendor: `${product.brand} Lucknow Depot`,
            category: "Plywood, Doors & Hardware",
          },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
            toast.success(`Added ${product.name} to cart`);
          },
        }
      );
    }
  };

  const handleUpdateQty = (product: WoodHardwareProduct, newQty: number) => {
    const current = cartItemByKey.get(product.id) || cartItemByKey.get(product.name.toLowerCase());
    if (newQty <= 0) {
      if (current) {
        removeFromCartMutation.mutate(
          { itemId: current.id },
          {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
              toast.info(`Removed ${product.name} from cart`);
            },
          }
        );
      }
    } else if (current) {
      updateCartItemMutation.mutate(
        { itemId: current.id, data: { quantity: newQty } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          },
        }
      );
    }
  };

  const toProductCardType = (p: WoodHardwareProduct): Product => {
    return {
      id: p.id,
      title: p.title,
      name: p.title,
      materialTag: p.gradeOrRating || "Plywood & Hardware",
      price: p.price,
      mrp: p.mrp,
      unit: p.unit,
      image: p.image,
      deliveryEta: p.deliveryTime,
      rating: p.rating,
      reviews: p.reviewsCount,
      brand: p.brand,
      vendor: `${p.brand} Lucknow Depot`,
      specs: [
        { label: "HSN Code", value: p.hsnCode },
        { label: "GST Rate", value: `${p.gstPercent}% (Included)` },
        { label: "Base Pre-GST", value: `₹${p.exGstPrice}` },
        { label: "Delivery Vehicle", value: p.deliveryVehicleType },
        { label: "Dimensions", value: p.dimensionsLabel || p.sheetOrDoorSizeFt || "" },
      ],
    };
  };

  const handleOpenDetailModal = (p: WoodHardwareProduct) => {
    if (onOpenDetail) {
      onOpenDetail(toProductCardType(p));
    } else {
      setModalProduct(p);
    }
  };

  const handleResetFilters = () => {
    setSelectedBrand("all");
    setTierFilter("all");
    setSelectedThickness("all");
    setSelectedVehicle("all");
    setSearchQuery("");
  };

  const handleSubcatChange = (slug: string) => {
    setSelectedSubcat(slug);
    setSelectedThickness("all");
  };

  // 1-Click Quick Add Helpers for Recommendations
  const quickAddSku = (sku: string) => {
    const target = ALL_WOOD_HARDWARE_PRODUCTS.find((p) => p.oemModelCode === sku);
    if (target) handleAddToCart(target);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-stone-900 text-white border-b border-amber-900/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
                  Lucknow Wholesale Mandi Direct
                </span>
                <span className="bg-white/10 text-slate-200 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Latouche Road & Charbagh Depots
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  18% GST Compliant
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Plywood, Doors & Architectural Hardware
              </h1>
              <p className="text-xs sm:text-sm text-amber-200/80 mt-1 max-w-2xl">
                100% Genuine CenturyPly Club Prime, Sainik 710, Greenply Marine & Solid Core Flush Doors. Transparent per-sheet and per-sq-ft contractor pricing with vehicle-secured 60-min site dispatch.
              </p>
            </div>

            {/* Quick Sizing & Mandi Pill */}
            <div className="bg-black/40 border border-white/10 rounded-xl p-3 flex items-center gap-3 backdrop-blur-xs self-start md:self-auto">
              <div className="p-2 bg-amber-500/20 text-amber-300 rounded-lg">
                <DoorOpen className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white flex items-center gap-1.5">
                  Standard Sheet & Door Sizes
                </div>
                <div className="text-[11px] text-amber-200/70">
                  8x4 ft (32 sq ft) • 7x3 ft (21 sq ft)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* STEP 5: Carpenter-Safe Cross-Sell Recommendations */}
        {hasFlushDoors && (
          <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-amber-600 text-white rounded-lg shrink-0 mt-0.5">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-600 text-white text-[9px] uppercase font-black px-1.5 py-0.5 rounded-xs tracking-wider">
                      Carpenter Essential
                    </span>
                    <h3 className="text-sm font-bold text-amber-950">
                      30mm Flush Door Fitting Kit Recommended
                    </h3>
                  </div>
                  <p className="text-xs text-amber-900/80 mt-0.5">
                    Your cart contains 30mm Solid Core Flush Doors. Complete your door installation with certified mortise locks and overhead hydraulic closers:
                  </p>
                </div>
              </div>

              {/* 1-Click Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                <button
                  onClick={() => quickAddSku("HDW-GJ-ST-18")}
                  className="text-xs bg-white hover:bg-amber-100 text-amber-950 font-bold px-3 py-1.5 rounded-lg border border-amber-300 shadow-xs flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-600" /> Godrej Stella 180mm (₹1,577)
                </button>
                <button
                  onClick={() => quickAddSku("HDW-DR-DC-60")}
                  className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-white" /> Dorset 60kg Closer (₹927)
                </button>
              </div>
            </div>
          </div>
        )}

        {hasPlywood && (
          <div className="mb-6 bg-gradient-to-r from-stone-50 to-amber-50 border-2 border-stone-300 rounded-xl p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-stone-800 text-white rounded-lg shrink-0 mt-0.5">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-stone-800 text-white text-[9px] uppercase font-black px-1.5 py-0.5 rounded-xs tracking-wider">
                      Cabinet Hardware Pairing
                    </span>
                    <h3 className="text-sm font-bold text-stone-900">
                      Plywood Surfacing & Soft-Close Hinges
                    </h3>
                  </div>
                  <p className="text-xs text-stone-700 mt-0.5">
                    Match your 18mm/19mm Plywood sheets with 1.0mm High Pressure Laminates and German Hettich silent hinges (suited for 15–24mm shutters):
                  </p>
                </div>
              </div>

              {/* 1-Click Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                <button
                  onClick={() => quickAddSku("LAM-CN-WM-01")}
                  className="text-xs bg-white hover:bg-stone-100 text-stone-900 font-bold px-3 py-1.5 rounded-lg border border-stone-300 shadow-xs flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-700" /> Century White Marble (₹2,239)
                </button>
                <button
                  onClick={() => quickAddSku("HDW-HT-ON-01")}
                  className="text-xs bg-stone-800 hover:bg-black text-white font-bold px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-white" /> Hettich Onsys 1-Pair (₹222)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subcategories Horizontal Scrollbar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
          {WOOD_HARDWARE_SUBCATEGORIES.map((cat) => {
            const isActive = selectedSubcat === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => handleSubcatChange(cat.slug)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-amber-900 text-white shadow-sm ring-2 ring-amber-900/20"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-amber-800 text-amber-200" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 mb-6 shadow-xs">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="w-full md:w-80 relative">
              <input
                type="text"
                placeholder="Search brand, HSN 4412/4418, 18mm, 19mm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs px-3 py-2 pl-9 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-900 focus:bg-white transition-all"
              />
              <SlidersHorizontal className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
              {/* Brand Tier Filter */}
              <select
                value={tierFilter}
                onChange={(e) =>
                  setTierFilter(e.target.value === "all" ? "all" : Number(e.target.value))
                }
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 cursor-pointer focus:outline-hidden"
              >
                <option value="all">All Brand Tiers</option>
                <option value="1">Priority 1 (CenturyPly, Century, Greenply)</option>
                <option value="2">Priority 2 (Godrej, Europa, Dorset, Hettich)</option>
              </select>

              {/* Brand Filter */}
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 cursor-pointer focus:outline-hidden"
              >
                <option value="all">All Brands ({availableBrands.length})</option>
                {availableBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              {/* Thickness Filter */}
              <select
                value={selectedThickness}
                onChange={(e) => setSelectedThickness(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 cursor-pointer focus:outline-hidden"
              >
                <option value="all">Thickness (All)</option>
                <option value="18">18mm (Plywood)</option>
                <option value="19">19mm (Heavy Plywood)</option>
                <option value="30">30mm (Flush Doors)</option>
                <option value="1">1.0mm (Laminates)</option>
              </select>

              {/* Delivery Vehicle Filter */}
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 cursor-pointer focus:outline-hidden"
              >
                <option value="all">Vehicle (All)</option>
                <option value="E-Loader / Pickup">E-Loader / Pickup (Flatbed)</option>
                <option value="E-Loader">E-Loader (Laminates)</option>
                <option value="2-Wheeler">2-Wheeler (Express Locks/Hinges)</option>
              </select>

              {/* Reset Button */}
              {(selectedBrand !== "all" ||
                tierFilter !== "all" ||
                selectedThickness !== "all" ||
                selectedVehicle !== "all" ||
                searchQuery !== "") && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 whitespace-nowrap cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center my-8">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No matching wood or hardware products found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try resetting your brand, thickness, or vehicle filters to browse available Lucknow inventory.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((p) => {
              const cartItem =
                cartItemByKey.get(p.id) || cartItemByKey.get(p.title.toLowerCase());
              const cartQty = cartItem?.quantity ?? 0;

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-xl border border-slate-200/90 hover:border-amber-400/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Top Badges Strip */}
                  <div className="p-3 pb-0 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      {/* Vehicle Badge */}
                      <span
                        className={`text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-sm flex items-center gap-1 ${
                          p.deliveryVehicleType === "E-Loader / Pickup"
                            ? "bg-slate-900 text-amber-300 border border-slate-700"
                            : p.deliveryVehicleType === "E-Loader"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        }`}
                      >
                        {p.deliveryVehicleType === "2-Wheeler" ? (
                          <Bike className="w-2.5 h-2.5 text-emerald-700" />
                        ) : (
                          <Truck className="w-2.5 h-2.5 text-amber-400" />
                        )}
                        {p.deliveryVehicleType}
                      </span>

                      {/* HSN & 18% GST Badge */}
                      <span className="text-[9.5px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                        HSN {p.hsnCode} (18% GST)
                      </span>
                    </div>

                    {/* Thickness / Sizing Spec Pill */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {p.thicknessMm && (
                        <span className="text-[10px] font-black bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.2 rounded-sm">
                          {p.thicknessMm}mm Thickness
                        </span>
                      )}
                      {p.dimensionsLabel && (
                        <span className="text-[10px] font-medium bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-sm">
                          {p.dimensionsLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Packshot Image */}
                  <div
                    onClick={() => handleOpenDetailModal(p)}
                    className="relative w-full aspect-square p-4 flex items-center justify-center cursor-pointer bg-white"
                  >
                    <ProductImage
                      src={p.image}
                      alt={p.name}
                      sku={p.slug || p.id}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      type="button"
                      className="absolute bottom-2 right-2 p-1.5 bg-white/90 hover:bg-white text-slate-600 rounded-md shadow-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Product Info Section */}
                  <div className="p-3 pt-0 flex flex-col gap-1.5 grow justify-between">
                    <div>
                      <div className="text-[11px] font-black text-amber-800 uppercase tracking-wide">
                        {p.brand} • {p.oemModelCode}
                      </div>

                      <h4
                        onClick={() => handleOpenDetailModal(p)}
                        className="text-xs font-bold text-slate-900 line-clamp-2 hover:text-amber-800 cursor-pointer mt-0.5 leading-snug"
                        title={p.name}
                      >
                        {p.name}
                      </h4>

                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-tight">
                        {p.spec}
                      </p>
                    </div>

                    {/* Dual Rate Pricing Block */}
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <div className="flex items-baseline justify-between gap-1">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm sm:text-base font-black text-slate-900">
                              ₹{p.price.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[10px] text-slate-400 line-through">
                              ₹{p.mrp.toLocaleString("en-IN")}
                            </span>
                          </div>
                          {p.effectivePerSqFtPrice ? (
                            <div className="text-[11px] font-extrabold text-emerald-700">
                              ≈ ₹{p.effectivePerSqFtPrice}/sq ft
                            </div>
                          ) : (
                            <div className="text-[10.5px] text-slate-500 font-medium">
                              {p.unit}
                            </div>
                          )}
                        </div>

                        {/* Ex-GST Base */}
                        <div className="text-right">
                          <span className="text-[9.5px] text-slate-400 block font-medium">
                            Base: ₹{p.exGstPrice.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[9px] text-amber-700 font-bold block">
                            +18% GST
                          </span>
                        </div>
                      </div>

                      {/* Bulk Slab Pill */}
                      {p.bulkSlabText && (
                        <div className="mt-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-sm inline-block">
                          {p.bulkSlabText}
                        </div>
                      )}

                      {/* Add to Cart / Qty Stepper */}
                      <div className="mt-3">
                        {cartQty === 0 ? (
                          <button
                            onClick={() => handleAddToCart(p)}
                            className="w-full text-xs font-bold bg-amber-900 hover:bg-amber-950 text-white py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </button>
                        ) : (
                          <div className="flex items-center justify-between bg-amber-50 border border-amber-300 rounded-lg p-0.5">
                            <button
                              onClick={() => handleUpdateQty(p, cartQty - 1)}
                              className="w-7 h-7 flex items-center justify-center text-amber-950 hover:bg-amber-200 rounded-md cursor-pointer transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-black text-amber-950 px-2">
                              {cartQty}
                            </span>
                            <button
                              onClick={() => handleUpdateQty(p, cartQty + 1)}
                              className="w-7 h-7 flex items-center justify-center text-amber-950 hover:bg-amber-200 rounded-md cursor-pointer transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {modalProduct && (
        <ProductDetailModal
          product={toProductCardType(modalProduct)}
          isOpen={Boolean(modalProduct)}
          onClose={() => setModalProduct(null)}
        />
      )}
    </div>
  );
};
