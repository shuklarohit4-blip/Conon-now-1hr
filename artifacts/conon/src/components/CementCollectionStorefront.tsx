import React, { useState, useMemo } from "react";
import {
  Clock,
  ChevronRight,
  Minus,
  Plus,
  SlidersHorizontal,
  Truck,
  Bike,
  Zap,
  ShieldCheck,
  Check,
  Package,
  Wrench,
  Droplets,
  Layers,
  Sparkles,
  Info,
  Scale,
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
import { useProductMediaVault } from "@/context/ProductMediaVaultContext";
import type { Product } from "@/components/ProductCard";
import { ProductImage } from "@/components/ProductImage";

export interface StructuralProduct {
  id: string;
  slug: string;
  name: string;
  title: string;
  brand: string;
  oemModelCode: string;
  categorySlug?: string;
  categoryName?: string;
  subcategory:
    | "cement-white-cement"
    | "tmt-sariya"
    | "binding-wire-accessories"
    | "waterproofing-chemicals"
    | "tile-adhesives-block-mortar";
  type: string;
  price: number;
  mrp: number;
  exGstPrice: number;
  discountPct: number;
  unit: string;
  hsnCode: string;
  gstPercent: number;
  brandTier: number;
  deliveryVehicleType: "2-Wheeler" | "E-Loader" | "Pickup / Mini-Truck";
  vehicleType: "2-Wheeler" | "E-Loader" | "Pickup / Mini-Truck";
  priceVolatility: "DAILY" | "WEEKLY" | "MONTHLY";
  image: string;
  images: string[];
  spec?: string;
  shortTagline?: string;
  specChips: string[];
  rating: number;
  reviewsCount: number;
  deliveryTime: string;
  inStock: boolean;
  bulkPrice?: number;
  bulkSlabText?: string;
  packSize?: string;
  cementGrade?: "PPC" | "OPC 43" | "OPC 53" | "Weather-Shield" | "White Cement";
  cementType?: string;
  tmtGrade?: "Fe 500" | "Fe 500D" | "Fe 550" | "Fe 550D";
  tmtDiameterMm?: number;
  barLengthMeters?: number;
  theoreticalWeightKg?: number;
  effectivePerKgPrice?: number;
  steelTier?: "Tier 1 - Primary" | "Tier 2 - Regional/Value";
  chemicalType?: string;
  dosagePerBagCement?: string;
  requiresUnloadingLabour?: boolean;
}

export const STRUCTURAL_SUBCATEGORIES = [
  {
    id: "all",
    slug: "all",
    name: "All Structural",
    count: 70,
    icon: "/images/subcategories/cement-bag-icon.webp",
  },
  {
    id: "cement-white-cement",
    slug: "cement-white-cement",
    name: "Cement & White Cement",
    count: 16,
    icon: "/images/subcategories/cement-bag-icon.webp",
  },
  {
    id: "tmt-sariya",
    slug: "tmt-sariya",
    name: "TMT Sariya (Steel Bars)",
    count: 20,
    icon: "/images/subcategories/sand-plaster-icon.webp",
  },
  {
    id: "binding-wire-accessories",
    slug: "binding-wire-accessories",
    name: "Binding Wire & Accessories",
    count: 4,
    icon: "/images/subcategories/masonry-tools-icon.webp",
  },
  {
    id: "waterproofing-chemicals",
    slug: "waterproofing-chemicals",
    name: "Waterproofing & Chemicals",
    count: 22,
    icon: "/images/subcategories/chemicals-icon.webp",
  },
  {
    id: "tile-adhesives-block-mortar",
    slug: "tile-adhesives-block-mortar",
    name: "Tile Adhesives & Block Mortar",
    count: 8,
    icon: "/images/subcategories/sand-plaster-icon.webp",
  },
];

export const ALL_STRUCTURAL_PRODUCTS: StructuralProduct[] = [
  {
    "id": "ultratech-ppc-cement-50kg",
    "slug": "ultratech-ppc-cement-50kg",
    "name": "UltraTech PPC Cement (50 kg Bag)",
    "title": "UltraTech PPC Cement (50 kg Bag)",
    "brand": "UltraTech",
    "oemModelCode": "UT-PPC-50",
    "subcategory": "cement-white-cement",
    "type": "PPC",
    "cementGrade": "PPC",
    "cementType": "Portland Pozzolana Cement",
    "price": 395,
    "mrp": 460,
    "exGstPrice": 335,
    "hsnCode": "2523",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "priceVolatility": "WEEKLY",
    "packSize": "50 kg Bag",
    "unit": "50 kg Bag",
    "requiresUnloadingLabour": true,
    "spec": "IS 1489 Part 1 Certified \u2022 Micro-fine fly ash blended for durable crack-free RCC & Plaster",
    "shortTagline": "India's No. 1 Portland Pozzolana Cement \u2022 High Slump Retention",
    "specChips": [
      "IS 1489 (Part 1)",
      "High Strength",
      "Corrosion Resistant",
      "50 kg Bag"
    ],
    "bulkPrice": 385,
    "bulkSlabText": "\u20b9385/bag on 50+ Bags",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 14,
    "vehicleType": "E-Loader",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "ultratech-opc-43-cement-50kg",
    "slug": "ultratech-opc-43-cement-50kg",
    "name": "UltraTech OPC 43 Grade Super Cement (50 kg Bag)",
    "title": "UltraTech OPC 43 Grade Super Cement (50 kg Bag)",
    "brand": "UltraTech",
    "oemModelCode": "UT-OPC43-50",
    "subcategory": "cement-white-cement",
    "type": "OPC 43",
    "cementGrade": "OPC 43",
    "cementType": "Ordinary Portland Cement",
    "price": 412,
    "mrp": 480,
    "exGstPrice": 349,
    "hsnCode": "2523",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "priceVolatility": "WEEKLY",
    "packSize": "50 kg Bag",
    "unit": "50 kg Bag",
    "requiresUnloadingLabour": true,
    "spec": "IS 8112 Certified \u2022 High early setting for commercial precast & masonry",
    "shortTagline": "Engineered OPC 43 for Rapid Formwork Stripping",
    "specChips": [
      "IS 8112 Certified",
      "Early Setting",
      "Commercial Grade",
      "50 kg Bag"
    ],
    "bulkPrice": 402,
    "bulkSlabText": "\u20b9402/bag on 50+ Bags",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 14,
    "vehicleType": "E-Loader",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "ultratech-opc-53-cement-50kg",
    "slug": "ultratech-opc-53-cement-50kg",
    "name": "UltraTech OPC 53 Grade Cement (50 kg Bag)",
    "title": "UltraTech OPC 53 Grade Cement (50 kg Bag)",
    "brand": "UltraTech",
    "oemModelCode": "UT-OPC53-50",
    "subcategory": "cement-white-cement",
    "type": "OPC 53",
    "cementGrade": "OPC 53",
    "cementType": "Ordinary Portland Cement",
    "price": 433,
    "mrp": 505,
    "exGstPrice": 367,
    "hsnCode": "2523",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "priceVolatility": "WEEKLY",
    "packSize": "50 kg Bag",
    "unit": "50 kg Bag",
    "requiresUnloadingLabour": true,
    "spec": "IS 12269 Certified \u2022 53 MPa 28-day compressive strength for heavy RCC slabs, columns & beams",
    "shortTagline": "High-Strength Structural Cement \u2022 Optimum Fineness",
    "specChips": [
      "IS 12269 Certified",
      "53 MPa Strength",
      "Heavy RCC Grade",
      "50 kg Bag"
    ],
    "bulkPrice": 420,
    "bulkSlabText": "\u20b9420/bag on 50+ Bags",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 14,
    "vehicleType": "E-Loader",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "ultratech-weather-plus-cement-50kg",
    "slug": "ultratech-weather-plus-cement-50kg",
    "name": "UltraTech Weather Plus Water-Repellent PPC (50 kg Bag)",
    "title": "UltraTech Weather Plus Water-Repellent PPC (50 kg Bag)",
    "brand": "UltraTech",
    "oemModelCode": "UT-WP-50",
    "subcategory": "cement-white-cement",
    "type": "Weather-Shield",
    "cementGrade": "Weather-Shield",
    "cementType": "Water Repellent PPC",
    "price": 425,
    "mrp": 495,
    "exGstPrice": 360,
    "hsnCode": "2523",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "priceVolatility": "WEEKLY",
    "packSize": "50 kg Bag",
    "unit": "50 kg Bag",
    "requiresUnloadingLabour": true,
    "spec": "Hydrophobic engineered blend \u2022 Resists capillary water seepage in terrace slabs & exterior walls",
    "shortTagline": "Advanced Hydrophobic Cement for Damp-Proof Construction",
    "specChips": [
      "Hydrophobic Tech",
      "Damp-Proof",
      "Roof & Foundation",
      "50 kg Bag"
    ],
    "bulkPrice": 412,
    "bulkSlabText": "\u20b9412/bag on 50+ Bags",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 14,
    "vehicleType": "E-Loader",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "prism-champion-ppc-cement-50kg",
    "slug": "prism-champion-ppc-cement-50kg",
    "name": "Prism Champion PPC Cement (50 kg Bag)",
    "title": "Prism Champion PPC Cement (50 kg Bag)",
    "brand": "Prism",
    "oemModelCode": "PR-CHAMP-50",
    "subcategory": "cement-white-cement",
    "type": "PPC",
    "cementGrade": "PPC",
    "cementType": "Portland Pozzolana Cement",
    "price": 360,
    "mrp": 425,
    "exGstPrice": 305,
    "hsnCode": "2523",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "priceVolatility": "WEEKLY",
    "packSize": "50 kg Bag",
    "unit": "50 kg Bag",
    "requiresUnloadingLabour": true,
    "spec": "IS 1489 Certified \u2022 Lucknow running favourite for smooth brickwork & structural RCC",
    "shortTagline": "High Durability Champion PPC \u2022 Optimum Water Demand",
    "specChips": [
      "IS 1489 Part 1",
      "Dense Matrix",
      "Brickwork & RCC",
      "50 kg Bag"
    ],
    "bulkPrice": 350,
    "bulkSlabText": "\u20b9350/bag on 50+ Bags",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 15,
    "vehicleType": "E-Loader",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "prism-champion-plus-duratech-50kg",
    "slug": "prism-champion-plus-duratech-50kg",
    "name": "Prism Champion Plus / Duratech PPC (50 kg Bag)",
    "title": "Prism Champion Plus / Duratech PPC (50 kg Bag)",
    "brand": "Prism",
    "oemModelCode": "PR-CHAMP-PLUS-50",
    "subcategory": "cement-white-cement",
    "type": "PPC",
    "cementGrade": "PPC",
    "cementType": "Portland Pozzolana Cement",
    "price": 380,
    "mrp": 445,
    "exGstPrice": 322,
    "hsnCode": "2523",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "priceVolatility": "WEEKLY",
    "packSize": "50 kg Bag",
    "unit": "50 kg Bag",
    "requiresUnloadingLabour": true,
    "spec": "Duratech reactive micro-particles \u2022 Low thermal heat generation preventing micro-cracking",
    "shortTagline": "Engineered Duratech PPC for Long-Life Concrete",
    "specChips": [
      "Duratech Particles",
      "Anti-Cracking",
      "High Compressive",
      "50 kg Bag"
    ],
    "bulkPrice": 370,
    "bulkSlabText": "\u20b9370/bag on 50+ Bags",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 15,
    "vehicleType": "E-Loader",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "prism-champion-all-weather-50kg",
    "slug": "prism-champion-all-weather-50kg",
    "name": "Prism Champion All Weather Cement (50 kg Bag)",
    "title": "Prism Champion All Weather Cement (50 kg Bag)",
    "brand": "Prism",
    "oemModelCode": "PR-ALLWEATHER-50",
    "subcategory": "cement-white-cement",
    "type": "Weather-Shield",
    "cementGrade": "Weather-Shield",
    "cementType": "Water Repellent PPC",
    "price": 450,
    "mrp": 525,
    "exGstPrice": 381,
    "hsnCode": "2523",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "priceVolatility": "WEEKLY",
    "packSize": "50 kg Bag",
    "unit": "50 kg Bag",
    "requiresUnloadingLabour": true,
    "spec": "Premium moisture barrier shield \u2022 Repels torrential monsoon moisture & prevents efflorescence",
    "shortTagline": "All-Weather Moisture Barrier Protective Cement",
    "specChips": [
      "All-Weather Shield",
      "Efflorescence Proof",
      "High Performance",
      "50 kg Bag"
    ],
    "bulkPrice": 435,
    "bulkSlabText": "\u20b9435/bag on 50+ Bags",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 14,
    "vehicleType": "E-Loader",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "acc-suraksha-f2r-cement-50kg",
    "slug": "acc-suraksha-f2r-cement-50kg",
    "name": "ACC Suraksha / F2R PPC Cement (50 kg Bag)",
    "title": "ACC Suraksha / F2R PPC Cement (50 kg Bag)",
    "brand": "ACC",
    "oemModelCode": "ACC-SURAKSHA-50",
    "subcategory": "cement-white-cement",
    "type": "PPC",
    "cementGrade": "PPC",
    "cementType": "Portland Pozzolana Cement",
    "price": 388,
    "mrp": 455,
    "exGstPrice": 329,
    "hsnCode": "2523",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "priceVolatility": "WEEKLY",
    "packSize": "50 kg Bag",
    "unit": "50 kg Bag",
    "requiresUnloadingLabour": true,
    "spec": "Fast to Road (F2R) Pozzolana matrix \u2022 High early bond and low pore permeability",
    "shortTagline": "ACC Heritage Quality \u2022 Solid Early Strength",
    "specChips": [
      "IS 1489 Part 1",
      "F2R Technology",
      "Durable Foundation",
      "50 kg Bag"
    ],
    "bulkPrice": 378,
    "bulkSlabText": "\u20b9378/bag on 50+ Bags",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 15,
    "vehicleType": "E-Loader",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "acc-gold-water-shield-50kg",
    "slug": "acc-gold-water-shield-50kg",
    "name": "ACC Gold Water Shield Cement (50 kg Bag)",
    "title": "ACC Gold Water Shield Cement (50 kg Bag)",
    "brand": "ACC",
    "oemModelCode": "ACC-GOLD-50",
    "subcategory": "cement-white-cement",
    "type": "Weather-Shield",
    "cementGrade": "Weather-Shield",
    "cementType": "Water Repellent PPC",
    "price": 421,
    "mrp": 490,
    "exGstPrice": 357,
    "hsnCode": "2523",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "priceVolatility": "WEEKLY",
    "packSize": "50 kg Bag",
    "unit": "50 kg Bag",
    "requiresUnloadingLabour": true,
    "spec": "Silicone infused hydrophobic formula \u2022 Certified 100% water repellent matrix",
    "shortTagline": "Water Shield Formula \u2022 Permanent Seepage Protection",
    "specChips": [
      "Silicone Infused",
      "Water Repellent",
      "Roof & Basement",
      "50 kg Bag"
    ],
    "bulkPrice": 408,
    "bulkSlabText": "\u20b9408/bag on 50+ Bags",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 14,
    "vehicleType": "E-Loader",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "ambuja-compocem-ppc-cement-50kg",
    "slug": "ambuja-compocem-ppc-cement-50kg",
    "name": "Ambuja Compocem PPC Cement (50 kg Bag)",
    "title": "Ambuja Compocem PPC Cement (50 kg Bag)",
    "brand": "Ambuja",
    "oemModelCode": "AMB-COMPO-50",
    "subcategory": "cement-white-cement",
    "type": "PPC",
    "cementGrade": "PPC",
    "cementType": "Portland Pozzolana Cement",
    "price": 385,
    "mrp": 450,
    "exGstPrice": 326,
    "hsnCode": "2523",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "priceVolatility": "WEEKLY",
    "packSize": "50 kg Bag",
    "unit": "50 kg Bag",
    "requiresUnloadingLabour": true,
    "spec": "IS 1489 Part 1 Certified \u2022 Giant Compressive Strength engineered for northern river plains",
    "shortTagline": "Giant Compressive Strength \u2022 Optimum Cohesion",
    "specChips": [
      "IS 1489 Part 1",
      "Giant Strength",
      "High Cohesion",
      "50 kg Bag"
    ],
    "bulkPrice": 374,
    "bulkSlabText": "\u20b9374/bag on 50+ Bags",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 14,
    "vehicleType": "E-Loader",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "ambuja-plus-kawach-cement-50kg",
    "slug": "ambuja-plus-kawach-cement-50kg",
    "name": "Ambuja Plus / Kawach OPC 53 / Weather Shield (50 kg Bag)",
    "title": "Ambuja Plus / Kawach OPC 53 / Weather Shield (50 kg Bag)",
    "brand": "Ambuja",
    "oemModelCode": "AMB-KAWACH-50",
    "subcategory": "cement-white-cement",
    "type": "Weather-Shield",
    "cementGrade": "Weather-Shield",
    "cementType": "Water Repellent PPC",
    "price": 423,
    "mrp": 495,
    "exGstPrice": 358,
    "hsnCode": "2523",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "priceVolatility": "WEEKLY",
    "packSize": "50 kg Bag",
    "unit": "50 kg Bag",
    "requiresUnloadingLabour": true,
    "spec": "Speciality anti-efflorescence active shield \u2022 Safeguards reinforcement steel against saline water attack",
    "shortTagline": "Kawach Water Repellent Armor for Structural RCC",
    "specChips": [
      "Kawach Shield",
      "Anti-Efflorescence",
      "Rust-Inhibiting",
      "50 kg Bag"
    ],
    "bulkPrice": 410,
    "bulkSlabText": "\u20b9410/bag on 50+ Bags",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 15,
    "vehicleType": "E-Loader",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "mp-birla-samrat-ppc-cement-50kg",
    "slug": "mp-birla-samrat-ppc-cement-50kg",
    "name": "MP Birla Birla Samrat PPC Cement (50 kg Bag)",
    "title": "MP Birla Birla Samrat PPC Cement (50 kg Bag)",
    "brand": "MP Birla",
    "oemModelCode": "MPB-SAMRAT-50",
    "subcategory": "cement-white-cement",
    "type": "PPC",
    "cementGrade": "PPC",
    "cementType": "Portland Pozzolana Cement",
    "price": 365,
    "mrp": 430,
    "exGstPrice": 309,
    "hsnCode": "2523",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "priceVolatility": "WEEKLY",
    "packSize": "50 kg Bag",
    "unit": "50 kg Bag",
    "requiresUnloadingLabour": true,
    "spec": "IS 1489 Part 1 Certified \u2022 High fineness index ensuring super smooth wall plastering",
    "shortTagline": "Birla Samrat Trusted Quality for Awadh Region",
    "specChips": [
      "IS 1489 Part 1",
      "Ultra Fine",
      "Superior Finish",
      "50 kg Bag"
    ],
    "bulkPrice": 355,
    "bulkSlabText": "\u20b9355/bag on 50+ Bags",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 15,
    "vehicleType": "E-Loader",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "shree-cement-rockstrong-ppc-50kg",
    "slug": "shree-cement-rockstrong-ppc-50kg",
    "name": "Shree Cement Shree Rockstrong PPC (50 kg Bag)",
    "title": "Shree Cement Shree Rockstrong PPC (50 kg Bag)",
    "brand": "Shree Cement",
    "oemModelCode": "SHREE-ROCK-50",
    "subcategory": "cement-white-cement",
    "type": "PPC",
    "cementGrade": "PPC",
    "cementType": "Portland Pozzolana Cement",
    "price": 370,
    "mrp": 435,
    "exGstPrice": 314,
    "hsnCode": "2523",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "priceVolatility": "WEEKLY",
    "packSize": "50 kg Bag",
    "unit": "50 kg Bag",
    "requiresUnloadingLabour": true,
    "spec": "Heavy load bearing concrete formula \u2022 Consistent setting curve and minimum bleeding",
    "shortTagline": "Rockstrong Tough Durability for Columns & Foundations",
    "specChips": [
      "IS 1489 Part 1",
      "Rockstrong Bond",
      "Low Heat",
      "50 kg Bag"
    ],
    "bulkPrice": 360,
    "bulkSlabText": "\u20b9360/bag on 50+ Bags",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 15,
    "vehicleType": "E-Loader",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "shree-cement-bangur-opc-53-50kg",
    "slug": "shree-cement-bangur-opc-53-50kg",
    "name": "Shree Cement Bangur OPC 53 Grade (50 kg Bag)",
    "title": "Shree Cement Bangur OPC 53 Grade (50 kg Bag)",
    "brand": "Shree Cement",
    "oemModelCode": "SHREE-BANGUR-53",
    "subcategory": "cement-white-cement",
    "type": "OPC 53",
    "cementGrade": "OPC 53",
    "cementType": "Ordinary Portland Cement",
    "price": 393,
    "mrp": 465,
    "exGstPrice": 333,
    "hsnCode": "2523",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "priceVolatility": "WEEKLY",
    "packSize": "50 kg Bag",
    "unit": "50 kg Bag",
    "requiresUnloadingLabour": true,
    "spec": "IS 12269 Certified \u2022 Heavy industrial & multi-storey structural concrete grade",
    "shortTagline": "Bangur High Performance OPC 53 Grade",
    "specChips": [
      "IS 12269 Certified",
      "High Strength",
      "Industrial Grade",
      "50 kg Bag"
    ],
    "bulkPrice": 382,
    "bulkSlabText": "\u20b9382/bag on 50+ Bags",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 15,
    "vehicleType": "E-Loader",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "dalmia-dsp-opc-53-cement-50kg",
    "slug": "dalmia-dsp-opc-53-cement-50kg",
    "name": "Dalmia Dalmia DSP OPC 53 Grade (50 kg Bag)",
    "title": "Dalmia Dalmia DSP OPC 53 Grade (50 kg Bag)",
    "brand": "Dalmia",
    "oemModelCode": "DALMIA-DSP-53",
    "subcategory": "cement-white-cement",
    "type": "OPC 53",
    "cementGrade": "OPC 53",
    "cementType": "Ordinary Portland Cement",
    "price": 386,
    "mrp": 455,
    "exGstPrice": 327,
    "hsnCode": "2523",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "priceVolatility": "WEEKLY",
    "packSize": "50 kg Bag",
    "unit": "50 kg Bag",
    "requiresUnloadingLabour": true,
    "spec": "Dhalo-Special-Phorula (DSP) \u2022 Specialized particle grading for ultra-dense concrete matrix",
    "shortTagline": "Dalmia DSP Ultra-Dense Foundation Strength",
    "specChips": [
      "IS 12269 Certified",
      "DSP Tech",
      "Ultra Dense",
      "50 kg Bag"
    ],
    "bulkPrice": 376,
    "bulkSlabText": "\u20b9376/bag on 50+ Bags",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 15,
    "vehicleType": "E-Loader",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "birla-white-cement-5kg-pack",
    "slug": "birla-white-cement-5kg-pack",
    "name": "Birla White Birla White Cement (5 kg Pack)",
    "title": "Birla White Birla White Cement (5 kg Pack)",
    "brand": "Birla White",
    "oemModelCode": "BW-WHT-5",
    "subcategory": "cement-white-cement",
    "type": "White Cement",
    "cementGrade": "White Cement",
    "cementType": "White Portland Cement",
    "price": 140,
    "mrp": 165,
    "exGstPrice": 119,
    "hsnCode": "2523",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "2-Wheeler",
    "priceVolatility": "MONTHLY",
    "packSize": "5 kg Pack",
    "unit": "5 kg Pack",
    "requiresUnloadingLabour": false,
    "spec": "IS 8042 Certified \u2022 >89% Whiteness index for architectural finishes, terrazzo & tile base priming",
    "shortTagline": "Pinnacle of Pure White Architecture \u2022 89%+ Whiteness Index",
    "specChips": [
      "IS 8042 Certified",
      ">89% Whiteness",
      "Tile & Marble Base",
      "5 kg Pack"
    ],
    "bulkPrice": 130,
    "bulkSlabText": "\u20b9130/pack on 10+ Packs",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 15,
    "vehicleType": "2-Wheeler",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "tata-tiscon-fe-500d-8mm-12m",
    "slug": "tata-tiscon-fe-500d-8mm-12m",
    "name": "Tata Tiscon Fe 500D 8mm TMT Bar (12m, 4.74 kg)",
    "title": "Tata Tiscon Fe 500D 8mm TMT Bar (12m, 4.74 kg)",
    "brand": "Tata Tiscon",
    "oemModelCode": "TATA-500D-08",
    "subcategory": "tmt-sariya",
    "type": "TMT Bar",
    "tmtGrade": "Fe 500D",
    "tmtDiameterMm": 8,
    "barLengthMeters": 12,
    "theoreticalWeightKg": 4.74,
    "effectivePerKgPrice": 70.89,
    "steelTier": "Tier 1 - Primary",
    "price": 336,
    "mrp": 380,
    "exGstPrice": 285,
    "hsnCode": "7214",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "priceVolatility": "DAILY",
    "packSize": "12m Bar (4.74 kg)",
    "unit": "12m Bar",
    "requiresUnloadingLabour": true,
    "spec": "IS 1786 Fe 500D Certified \u2022 8mm standard 12m bar (0.395 kg/m) \u2022 Earthquake resistant high ductility",
    "shortTagline": "Tata Tiscon Pure Virgin Iron Ore Fe 500D \u2022 \u20b970.89/kg",
    "specChips": [
      "8mm Dia",
      "12m Standard",
      "4.74 kg/bar",
      "Fe 500D Primary"
    ],
    "bulkPrice": 328,
    "bulkSlabText": "\u20b9328/bar on 25+ Bars",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 12,
    "vehicleType": "Pickup / Mini-Truck",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "tata-tiscon-fe-500d-10mm-12m",
    "slug": "tata-tiscon-fe-500d-10mm-12m",
    "name": "Tata Tiscon Fe 500D 10mm TMT Bar (12m, 7.41 kg)",
    "title": "Tata Tiscon Fe 500D 10mm TMT Bar (12m, 7.41 kg)",
    "brand": "Tata Tiscon",
    "oemModelCode": "TATA-500D-10",
    "subcategory": "tmt-sariya",
    "type": "TMT Bar",
    "tmtGrade": "Fe 500D",
    "tmtDiameterMm": 10,
    "barLengthMeters": 12,
    "theoreticalWeightKg": 7.41,
    "effectivePerKgPrice": 70.85,
    "steelTier": "Tier 1 - Primary",
    "price": 525,
    "mrp": 595,
    "exGstPrice": 445,
    "hsnCode": "7214",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "priceVolatility": "DAILY",
    "packSize": "12m Bar (7.41 kg)",
    "unit": "12m Bar",
    "requiresUnloadingLabour": true,
    "spec": "IS 1786 Fe 500D Certified \u2022 10mm standard 12m bar (0.617 kg/m) \u2022 Superior rib pattern for concrete grip",
    "shortTagline": "Tata Tiscon Pure Virgin Steel \u2022 \u20b970.85/kg",
    "specChips": [
      "10mm Dia",
      "12m Standard",
      "7.41 kg/bar",
      "Fe 500D Primary"
    ],
    "bulkPrice": 512,
    "bulkSlabText": "\u20b9512/bar on 20+ Bars",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 12,
    "vehicleType": "Pickup / Mini-Truck",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "tata-tiscon-fe-500d-12mm-12m",
    "slug": "tata-tiscon-fe-500d-12mm-12m",
    "name": "Tata Tiscon Fe 500D 12mm TMT Bar (12m, 10.67 kg)",
    "title": "Tata Tiscon Fe 500D 12mm TMT Bar (12m, 10.67 kg)",
    "brand": "Tata Tiscon",
    "oemModelCode": "TATA-500D-12",
    "subcategory": "tmt-sariya",
    "type": "TMT Bar",
    "tmtGrade": "Fe 500D",
    "tmtDiameterMm": 12,
    "barLengthMeters": 12,
    "theoreticalWeightKg": 10.67,
    "effectivePerKgPrice": 70.85,
    "steelTier": "Tier 1 - Primary",
    "price": 756,
    "mrp": 850,
    "exGstPrice": 641,
    "hsnCode": "7214",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "priceVolatility": "DAILY",
    "packSize": "12m Bar (10.67 kg)",
    "unit": "12m Bar",
    "requiresUnloadingLabour": true,
    "spec": "IS 1786 Fe 500D Certified \u2022 12mm standard 12m bar (0.888 kg/m) \u2022 Core structural grade for slabs & beams",
    "shortTagline": "Primary Tata Tiscon Slab & Beam Specialist \u2022 \u20b970.85/kg",
    "specChips": [
      "12mm Dia",
      "12m Standard",
      "10.67 kg/bar",
      "Fe 500D Primary"
    ],
    "bulkPrice": 738,
    "bulkSlabText": "\u20b9738/bar on 15+ Bars",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 11,
    "vehicleType": "Pickup / Mini-Truck",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "tata-tiscon-fe-500d-16mm-12m",
    "slug": "tata-tiscon-fe-500d-16mm-12m",
    "name": "Tata Tiscon Fe 500D 16mm TMT Bar (12m, 18.96 kg)",
    "title": "Tata Tiscon Fe 500D 16mm TMT Bar (12m, 18.96 kg)",
    "brand": "Tata Tiscon",
    "oemModelCode": "TATA-500D-16",
    "subcategory": "tmt-sariya",
    "type": "TMT Bar",
    "tmtGrade": "Fe 500D",
    "tmtDiameterMm": 16,
    "barLengthMeters": 12,
    "theoreticalWeightKg": 18.96,
    "effectivePerKgPrice": 71.0,
    "steelTier": "Tier 1 - Primary",
    "price": 1346,
    "mrp": 1520,
    "exGstPrice": 1141,
    "hsnCode": "7214",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "priceVolatility": "DAILY",
    "packSize": "12m Bar (18.96 kg)",
    "unit": "12m Bar",
    "requiresUnloadingLabour": true,
    "spec": "IS 1786 Fe 500D Certified \u2022 16mm standard 12m bar (1.580 kg/m) \u2022 Heavy column and footing reinforcement",
    "shortTagline": "Tata Tiscon High-Capacity Column Rebar \u2022 \u20b971.00/kg",
    "specChips": [
      "16mm Dia",
      "12m Standard",
      "18.96 kg/bar",
      "Fe 500D Primary"
    ],
    "bulkPrice": 1315,
    "bulkSlabText": "\u20b91315/bar on 10+ Bars",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 11,
    "vehicleType": "Pickup / Mini-Truck",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "tata-tiscon-fe-500d-20mm-12m",
    "slug": "tata-tiscon-fe-500d-20mm-12m",
    "name": "Tata Tiscon Fe 500D 20mm TMT Bar (12m, 29.63 kg)",
    "title": "Tata Tiscon Fe 500D 20mm TMT Bar (12m, 29.63 kg)",
    "brand": "Tata Tiscon",
    "oemModelCode": "TATA-500D-20",
    "subcategory": "tmt-sariya",
    "type": "TMT Bar",
    "tmtGrade": "Fe 500D",
    "tmtDiameterMm": 20,
    "barLengthMeters": 12,
    "theoreticalWeightKg": 29.63,
    "effectivePerKgPrice": 70.91,
    "steelTier": "Tier 1 - Primary",
    "price": 2101,
    "mrp": 2360,
    "exGstPrice": 1781,
    "hsnCode": "7214",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "priceVolatility": "DAILY",
    "packSize": "12m Bar (29.63 kg)",
    "unit": "12m Bar",
    "requiresUnloadingLabour": true,
    "spec": "IS 1786 Fe 500D Certified \u2022 20mm standard 12m bar (2.469 kg/m) \u2022 Heavy civil foundation & bridge piling",
    "shortTagline": "Tata Tiscon Mega Foundation Rebar \u2022 \u20b970.91/kg",
    "specChips": [
      "20mm Dia",
      "12m Standard",
      "29.63 kg/bar",
      "Fe 500D Primary"
    ],
    "bulkPrice": 2050,
    "bulkSlabText": "\u20b92050/bar on 10+ Bars",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 11,
    "vehicleType": "Pickup / Mini-Truck",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "jsw-neosteel-fe-550d-8mm-12m",
    "slug": "jsw-neosteel-fe-550d-8mm-12m",
    "name": "JSW Neosteel Fe 550D 8mm TMT Bar (12m, 4.74 kg)",
    "title": "JSW Neosteel Fe 550D 8mm TMT Bar (12m, 4.74 kg)",
    "brand": "JSW Neosteel",
    "oemModelCode": "JSW-550D-08",
    "subcategory": "tmt-sariya",
    "type": "TMT Bar",
    "tmtGrade": "Fe 550D",
    "tmtDiameterMm": 8,
    "barLengthMeters": 12,
    "theoreticalWeightKg": 4.74,
    "effectivePerKgPrice": 69.83,
    "steelTier": "Tier 1 - Primary",
    "price": 331,
    "mrp": 375,
    "exGstPrice": 281,
    "hsnCode": "7214",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "priceVolatility": "DAILY",
    "packSize": "12m Bar (4.74 kg)",
    "unit": "12m Bar",
    "requiresUnloadingLabour": true,
    "spec": "IS 1786 Fe 550D Certified \u2022 8mm standard 12m bar \u2022 High yield strength with minimum 16% elongation",
    "shortTagline": "JSW Pure Primary Steel Fe 550D \u2022 \u20b969.83/kg",
    "specChips": [
      "8mm Dia",
      "12m Standard",
      "4.74 kg/bar",
      "Fe 550D Primary"
    ],
    "bulkPrice": 323,
    "bulkSlabText": "\u20b9323/bar on 25+ Bars",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 12,
    "vehicleType": "Pickup / Mini-Truck",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "jsw-neosteel-fe-550d-10mm-12m",
    "slug": "jsw-neosteel-fe-550d-10mm-12m",
    "name": "JSW Neosteel Fe 550D 10mm TMT Bar (12m, 7.41 kg)",
    "title": "JSW Neosteel Fe 550D 10mm TMT Bar (12m, 7.41 kg)",
    "brand": "JSW Neosteel",
    "oemModelCode": "JSW-550D-10",
    "subcategory": "tmt-sariya",
    "type": "TMT Bar",
    "tmtGrade": "Fe 550D",
    "tmtDiameterMm": 10,
    "barLengthMeters": 12,
    "theoreticalWeightKg": 7.41,
    "effectivePerKgPrice": 69.91,
    "steelTier": "Tier 1 - Primary",
    "price": 518,
    "mrp": 585,
    "exGstPrice": 439,
    "hsnCode": "7214",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "priceVolatility": "DAILY",
    "packSize": "12m Bar (7.41 kg)",
    "unit": "12m Bar",
    "requiresUnloadingLabour": true,
    "spec": "IS 1786 Fe 550D Certified \u2022 10mm standard 12m bar \u2022 Low phosphorus & sulfur for anti-corrosion",
    "shortTagline": "JSW High Yield Strength Rebar \u2022 \u20b969.91/kg",
    "specChips": [
      "10mm Dia",
      "12m Standard",
      "7.41 kg/bar",
      "Fe 550D Primary"
    ],
    "bulkPrice": 505,
    "bulkSlabText": "\u20b9505/bar on 20+ Bars",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 11,
    "vehicleType": "Pickup / Mini-Truck",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "jsw-neosteel-fe-550d-12mm-12m",
    "slug": "jsw-neosteel-fe-550d-12mm-12m",
    "name": "JSW Neosteel Fe 550D 12mm TMT Bar (12m, 10.67 kg)",
    "title": "JSW Neosteel Fe 550D 12mm TMT Bar (12m, 10.67 kg)",
    "brand": "JSW Neosteel",
    "oemModelCode": "JSW-550D-12",
    "subcategory": "tmt-sariya",
    "type": "TMT Bar",
    "tmtGrade": "Fe 550D",
    "tmtDiameterMm": 12,
    "barLengthMeters": 12,
    "theoreticalWeightKg": 10.67,
    "effectivePerKgPrice": 69.92,
    "steelTier": "Tier 1 - Primary",
    "price": 746,
    "mrp": 840,
    "exGstPrice": 632,
    "hsnCode": "7214",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "priceVolatility": "DAILY",
    "packSize": "12m Bar (10.67 kg)",
    "unit": "12m Bar",
    "requiresUnloadingLabour": true,
    "spec": "IS 1786 Fe 550D Certified \u2022 12mm standard 12m bar \u2022 Optimal steel saving for structural floor slabs",
    "shortTagline": "Core Structural 12mm JSW Neosteel \u2022 \u20b969.92/kg",
    "specChips": [
      "12mm Dia",
      "12m Standard",
      "10.67 kg/bar",
      "Fe 550D Primary"
    ],
    "bulkPrice": 728,
    "bulkSlabText": "\u20b9728/bar on 15+ Bars",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 11,
    "vehicleType": "Pickup / Mini-Truck",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "jsw-neosteel-fe-550d-16mm-12m",
    "slug": "jsw-neosteel-fe-550d-16mm-12m",
    "name": "JSW Neosteel Fe 550D 16mm TMT Bar (12m, 18.96 kg)",
    "title": "JSW Neosteel Fe 550D 16mm TMT Bar (12m, 18.96 kg)",
    "brand": "JSW Neosteel",
    "oemModelCode": "JSW-550D-16",
    "subcategory": "tmt-sariya",
    "type": "TMT Bar",
    "tmtGrade": "Fe 550D",
    "tmtDiameterMm": 16,
    "barLengthMeters": 12,
    "theoreticalWeightKg": 18.96,
    "effectivePerKgPrice": 69.99,
    "steelTier": "Tier 1 - Primary",
    "price": 1327,
    "mrp": 1495,
    "exGstPrice": 1125,
    "hsnCode": "7214",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "priceVolatility": "DAILY",
    "packSize": "12m Bar (18.96 kg)",
    "unit": "12m Bar",
    "requiresUnloadingLabour": true,
    "spec": "IS 1786 Fe 550D Certified \u2022 16mm standard 12m bar \u2022 High bendability without micro-fissures",
    "shortTagline": "High-Load Column Reinforcement JSW \u2022 \u20b969.99/kg",
    "specChips": [
      "16mm Dia",
      "12m Standard",
      "18.96 kg/bar",
      "Fe 550D Primary"
    ],
    "bulkPrice": 1295,
    "bulkSlabText": "\u20b91295/bar on 10+ Bars",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 11,
    "vehicleType": "Pickup / Mini-Truck",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "jsw-neosteel-fe-550d-20mm-12m",
    "slug": "jsw-neosteel-fe-550d-20mm-12m",
    "name": "JSW Neosteel Fe 550D 20mm TMT Bar (12m, 29.63 kg)",
    "title": "JSW Neosteel Fe 550D 20mm TMT Bar (12m, 29.63 kg)",
    "brand": "JSW Neosteel",
    "oemModelCode": "JSW-550D-20",
    "subcategory": "tmt-sariya",
    "type": "TMT Bar",
    "tmtGrade": "Fe 550D",
    "tmtDiameterMm": 20,
    "barLengthMeters": 12,
    "theoreticalWeightKg": 29.63,
    "effectivePerKgPrice": 69.93,
    "steelTier": "Tier 1 - Primary",
    "price": 2072,
    "mrp": 2330,
    "exGstPrice": 1756,
    "hsnCode": "7214",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "priceVolatility": "DAILY",
    "packSize": "12m Bar (29.63 kg)",
    "unit": "12m Bar",
    "requiresUnloadingLabour": true,
    "spec": "IS 1786 Fe 550D Certified \u2022 20mm standard 12m bar \u2022 Maximum shear and tensile tolerance",
    "shortTagline": "Heavy Duty Foundation JSW 20mm \u2022 \u20b969.93/kg",
    "specChips": [
      "20mm Dia",
      "12m Standard",
      "29.63 kg/bar",
      "Fe 550D Primary"
    ],
    "bulkPrice": 2020,
    "bulkSlabText": "\u20b92020/bar on 10+ Bars",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 11,
    "vehicleType": "Pickup / Mini-Truck",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "sail-seqr-fe-550-8mm-12m",
    "slug": "sail-seqr-fe-550-8mm-12m",
    "name": "SAIL SeQR Fe 550 8mm TMT Bar (12m, 4.74 kg)",
    "title": "SAIL SeQR Fe 550 8mm TMT Bar (12m, 4.74 kg)",
    "brand": "SAIL",
    "oemModelCode": "SAIL-550-08",
    "subcategory": "tmt-sariya",
    "type": "TMT Bar",
    "tmtGrade": "Fe 550",
    "tmtDiameterMm": 8,
    "barLengthMeters": 12,
    "theoreticalWeightKg": 4.74,
    "effectivePerKgPrice": 77.0,
    "steelTier": "Tier 1 - Primary",
    "price": 365,
    "mrp": 410,
    "exGstPrice": 309,
    "hsnCode": "7214",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "priceVolatility": "DAILY",
    "packSize": "12m Bar (4.74 kg)",
    "unit": "12m Bar",
    "requiresUnloadingLabour": true,
    "spec": "IS 1786 Fe 550 Certified \u2022 Government approved PSU steel with supreme chemical consistency",
    "shortTagline": "SAIL PSU Trusted Structural Steel \u2022 \u20b977.00/kg",
    "specChips": [
      "8mm Dia",
      "12m Standard",
      "4.74 kg/bar",
      "Fe 550 Primary"
    ],
    "bulkPrice": 355,
    "bulkSlabText": "\u20b9355/bar on 25+ Bars",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 11,
    "vehicleType": "Pickup / Mini-Truck",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "sail-seqr-fe-550-10mm-12m",
    "slug": "sail-seqr-fe-550-10mm-12m",
    "name": "SAIL SeQR Fe 550 10mm TMT Bar (12m, 7.41 kg)",
    "title": "SAIL SeQR Fe 550 10mm TMT Bar (12m, 7.41 kg)",
    "brand": "SAIL",
    "oemModelCode": "SAIL-550-10",
    "subcategory": "tmt-sariya",
    "type": "TMT Bar",
    "tmtGrade": "Fe 550",
    "tmtDiameterMm": 10,
    "barLengthMeters": 12,
    "theoreticalWeightKg": 7.41,
    "effectivePerKgPrice": 76.92,
    "steelTier": "Tier 1 - Primary",
    "price": 570,
    "mrp": 640,
    "exGstPrice": 483,
    "hsnCode": "7214",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "priceVolatility": "DAILY",
    "packSize": "12m Bar (7.41 kg)",
    "unit": "12m Bar",
    "requiresUnloadingLabour": true,
    "spec": "IS 1786 Fe 550 Certified \u2022 10mm standard 12m bar \u2022 High resistance to thermal shocks",
    "shortTagline": "SAIL SeQR High Resilience Steel \u2022 \u20b976.92/kg",
    "specChips": [
      "10mm Dia",
      "12m Standard",
      "7.41 kg/bar",
      "Fe 550 Primary"
    ],
    "bulkPrice": 556,
    "bulkSlabText": "\u20b9556/bar on 20+ Bars",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 11,
    "vehicleType": "Pickup / Mini-Truck",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "sail-seqr-fe-550-12mm-12m",
    "slug": "sail-seqr-fe-550-12mm-12m",
    "name": "SAIL SeQR Fe 550 12mm TMT Bar (12m, 10.67 kg)",
    "title": "SAIL SeQR Fe 550 12mm TMT Bar (12m, 10.67 kg)",
    "brand": "SAIL",
    "oemModelCode": "SAIL-550-12",
    "subcategory": "tmt-sariya",
    "type": "TMT Bar",
    "tmtGrade": "Fe 550",
    "tmtDiameterMm": 12,
    "barLengthMeters": 12,
    "theoreticalWeightKg": 10.67,
    "effectivePerKgPrice": 76.85,
    "steelTier": "Tier 1 - Primary",
    "price": 820,
    "mrp": 920,
    "exGstPrice": 695,
    "hsnCode": "7214",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "priceVolatility": "DAILY",
    "packSize": "12m Bar (10.67 kg)",
    "unit": "12m Bar",
    "requiresUnloadingLabour": true,
    "spec": "IS 1786 Fe 550 Certified \u2022 12mm standard 12m bar \u2022 Standard benchmark for government infrastructure",
    "shortTagline": "SAIL SeQR Heavy Structural Sariya \u2022 \u20b976.85/kg",
    "specChips": [
      "12mm Dia",
      "12m Standard",
      "10.67 kg/bar",
      "Fe 550 Primary"
    ],
    "bulkPrice": 800,
    "bulkSlabText": "\u20b9800/bar on 15+ Bars",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 11,
    "vehicleType": "Pickup / Mini-Truck",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "sail-seqr-fe-550-16mm-12m",
    "slug": "sail-seqr-fe-550-16mm-12m",
    "name": "SAIL SeQR Fe 550 16mm TMT Bar (12m, 18.96 kg)",
    "title": "SAIL SeQR Fe 550 16mm TMT Bar (12m, 18.96 kg)",
    "brand": "SAIL",
    "oemModelCode": "SAIL-550-16",
    "subcategory": "tmt-sariya",
    "type": "TMT Bar",
    "tmtGrade": "Fe 550",
    "tmtDiameterMm": 16,
    "barLengthMeters": 12,
    "theoreticalWeightKg": 18.96,
    "effectivePerKgPrice": 77.0,
    "steelTier": "Tier 1 - Primary",
    "price": 1460,
    "mrp": 1640,
    "exGstPrice": 1237,
    "hsnCode": "7214",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "priceVolatility": "DAILY",
    "packSize": "12m Bar (18.96 kg)",
    "unit": "12m Bar",
    "requiresUnloadingLabour": true,
    "spec": "IS 1786 Fe 550 Certified \u2022 16mm standard 12m bar \u2022 Maximum tensile safety for multi-storey frames",
    "shortTagline": "SAIL High Load Bearing 16mm Rebar \u2022 \u20b977.00/kg",
    "specChips": [
      "16mm Dia",
      "12m Standard",
      "18.96 kg/bar",
      "Fe 550 Primary"
    ],
    "bulkPrice": 1425,
    "bulkSlabText": "\u20b91425/bar on 10+ Bars",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 11,
    "vehicleType": "Pickup / Mini-Truck",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "kamdhenu-nxt-fe-550-8mm-12m",
    "slug": "kamdhenu-nxt-fe-550-8mm-12m",
    "name": "Kamdhenu NXT Fe 550 8mm TMT Bar (12m, 4.74 kg)",
    "title": "Kamdhenu NXT Fe 550 8mm TMT Bar (12m, 4.74 kg)",
    "brand": "Kamdhenu",
    "oemModelCode": "KAM-NXT-08",
    "subcategory": "tmt-sariya",
    "type": "TMT Bar",
    "tmtGrade": "Fe 550",
    "tmtDiameterMm": 8,
    "barLengthMeters": 12,
    "theoreticalWeightKg": 4.74,
    "effectivePerKgPrice": 62.87,
    "steelTier": "Tier 2 - Regional/Value",
    "price": 298,
    "mrp": 340,
    "exGstPrice": 253,
    "hsnCode": "7214",
    "gstPercent": 18,
    "brandTier": 2,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "priceVolatility": "DAILY",
    "packSize": "12m Bar (4.74 kg)",
    "unit": "12m Bar",
    "requiresUnloadingLabour": true,
    "spec": "IS 1786 Fe 550 Certified \u2022 Double-rib design with 2.5x concrete interlock strength",
    "shortTagline": "Value Double-Rib Steel \u2022 \u20b962.87/kg",
    "specChips": [
      "8mm Dia",
      "12m Standard",
      "4.74 kg/bar",
      "Fe 550 Value"
    ],
    "bulkPrice": 290,
    "bulkSlabText": "\u20b9290/bar on 25+ Bars",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 12,
    "vehicleType": "Pickup / Mini-Truck",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "kamdhenu-nxt-fe-550-10mm-12m",
    "slug": "kamdhenu-nxt-fe-550-10mm-12m",
    "name": "Kamdhenu NXT Fe 550 10mm TMT Bar (12m, 7.41 kg)",
    "title": "Kamdhenu NXT Fe 550 10mm TMT Bar (12m, 7.41 kg)",
    "brand": "Kamdhenu",
    "oemModelCode": "KAM-NXT-10",
    "subcategory": "tmt-sariya",
    "type": "TMT Bar",
    "tmtGrade": "Fe 550",
    "tmtDiameterMm": 10,
    "barLengthMeters": 12,
    "theoreticalWeightKg": 7.41,
    "effectivePerKgPrice": 63.02,
    "steelTier": "Tier 2 - Regional/Value",
    "price": 467,
    "mrp": 530,
    "exGstPrice": 396,
    "hsnCode": "7214",
    "gstPercent": 18,
    "brandTier": 2,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "priceVolatility": "DAILY",
    "packSize": "12m Bar (7.41 kg)",
    "unit": "12m Bar",
    "requiresUnloadingLabour": true,
    "spec": "IS 1786 Fe 550 Certified \u2022 10mm standard 12m bar \u2022 High corrosion resistance in Lucknow soils",
    "shortTagline": "High Performance Regional Steel \u2022 \u20b963.02/kg",
    "specChips": [
      "10mm Dia",
      "12m Standard",
      "7.41 kg/bar",
      "Fe 550 Value"
    ],
    "bulkPrice": 455,
    "bulkSlabText": "\u20b9455/bar on 20+ Bars",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 12,
    "vehicleType": "Pickup / Mini-Truck",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "kamdhenu-nxt-fe-550-12mm-12m",
    "slug": "kamdhenu-nxt-fe-550-12mm-12m",
    "name": "Kamdhenu NXT Fe 550 12mm TMT Bar (12m, 10.67 kg)",
    "title": "Kamdhenu NXT Fe 550 12mm TMT Bar (12m, 10.67 kg)",
    "brand": "Kamdhenu",
    "oemModelCode": "KAM-NXT-12",
    "subcategory": "tmt-sariya",
    "type": "TMT Bar",
    "tmtGrade": "Fe 550",
    "tmtDiameterMm": 12,
    "barLengthMeters": 12,
    "theoreticalWeightKg": 10.67,
    "effectivePerKgPrice": 62.89,
    "steelTier": "Tier 2 - Regional/Value",
    "price": 671,
    "mrp": 760,
    "exGstPrice": 569,
    "hsnCode": "7214",
    "gstPercent": 18,
    "brandTier": 2,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "priceVolatility": "DAILY",
    "packSize": "12m Bar (10.67 kg)",
    "unit": "12m Bar",
    "requiresUnloadingLabour": true,
    "spec": "IS 1786 Fe 550 Certified \u2022 12mm standard 12m bar \u2022 Proven commercial and residential build choice",
    "shortTagline": "Lucknow Running Regional Best-Seller \u2022 \u20b962.89/kg",
    "specChips": [
      "12mm Dia",
      "12m Standard",
      "10.67 kg/bar",
      "Fe 550 Value"
    ],
    "bulkPrice": 655,
    "bulkSlabText": "\u20b9655/bar on 15+ Bars",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 12,
    "vehicleType": "Pickup / Mini-Truck",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "kamdhenu-nxt-fe-550-16mm-12m",
    "slug": "kamdhenu-nxt-fe-550-16mm-12m",
    "name": "Kamdhenu NXT Fe 550 16mm TMT Bar (12m, 18.96 kg)",
    "title": "Kamdhenu NXT Fe 550 16mm TMT Bar (12m, 18.96 kg)",
    "brand": "Kamdhenu",
    "oemModelCode": "KAM-NXT-16",
    "subcategory": "tmt-sariya",
    "type": "TMT Bar",
    "tmtGrade": "Fe 550",
    "tmtDiameterMm": 16,
    "barLengthMeters": 12,
    "theoreticalWeightKg": 18.96,
    "effectivePerKgPrice": 62.97,
    "steelTier": "Tier 2 - Regional/Value",
    "price": 1194,
    "mrp": 1350,
    "exGstPrice": 1012,
    "hsnCode": "7214",
    "gstPercent": 18,
    "brandTier": 2,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "priceVolatility": "DAILY",
    "packSize": "12m Bar (18.96 kg)",
    "unit": "12m Bar",
    "requiresUnloadingLabour": true,
    "spec": "IS 1786 Fe 550 Certified \u2022 16mm standard 12m bar \u2022 Outstanding load bearing capability",
    "shortTagline": "Heavy Duty Value Rebar 16mm \u2022 \u20b962.97/kg",
    "specChips": [
      "16mm Dia",
      "12m Standard",
      "18.96 kg/bar",
      "Fe 550 Value"
    ],
    "bulkPrice": 1165,
    "bulkSlabText": "\u20b91165/bar on 10+ Bars",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 12,
    "vehicleType": "Pickup / Mini-Truck",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "rhl-gold-fe-500-12mm-12m",
    "slug": "rhl-gold-fe-500-12mm-12m",
    "name": "RHL Gold Fe 500 12mm TMT Bar (12m, 10.67 kg @ \u20b960/kg)",
    "title": "RHL Gold Fe 500 12mm TMT Bar (12m, 10.67 kg @ \u20b960/kg)",
    "brand": "RHL Gold",
    "oemModelCode": "RHL-500-12",
    "subcategory": "tmt-sariya",
    "type": "TMT Bar",
    "tmtGrade": "Fe 500",
    "tmtDiameterMm": 12,
    "barLengthMeters": 12,
    "theoreticalWeightKg": 10.67,
    "effectivePerKgPrice": 59.98,
    "steelTier": "Tier 2 - Regional/Value",
    "price": 640,
    "mrp": 725,
    "exGstPrice": 542,
    "hsnCode": "7214",
    "gstPercent": 18,
    "brandTier": 2,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "priceVolatility": "DAILY",
    "packSize": "12m Bar (10.67 kg)",
    "unit": "12m Bar",
    "requiresUnloadingLabour": true,
    "spec": "IS 1786 Fe 500 Certified \u2022 Standard 12mm bar (10.67 kg) priced at Mandi rate \u20b960/kg",
    "shortTagline": "UP Running RHL Gold Trusted Brand \u2022 \u20b959.98/kg",
    "specChips": [
      "12mm Dia",
      "12m Standard",
      "10.67 kg/bar",
      "Fe 500 Regional"
    ],
    "bulkPrice": 625,
    "bulkSlabText": "\u20b9625/bar on 15+ Bars",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 12,
    "vehicleType": "Pickup / Mini-Truck",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "gallantt-fe-500-12mm-12m",
    "slug": "gallantt-fe-500-12mm-12m",
    "name": "Gallantt Fe 500 12mm TMT Bar (12m, 10.67 kg @ \u20b954/kg)",
    "title": "Gallantt Fe 500 12mm TMT Bar (12m, 10.67 kg @ \u20b954/kg)",
    "brand": "Gallantt",
    "oemModelCode": "GAL-500-12",
    "subcategory": "tmt-sariya",
    "type": "TMT Bar",
    "tmtGrade": "Fe 500",
    "tmtDiameterMm": 12,
    "barLengthMeters": 12,
    "theoreticalWeightKg": 10.67,
    "effectivePerKgPrice": 53.98,
    "steelTier": "Tier 2 - Regional/Value",
    "price": 576,
    "mrp": 660,
    "exGstPrice": 488,
    "hsnCode": "7214",
    "gstPercent": 18,
    "brandTier": 2,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "priceVolatility": "DAILY",
    "packSize": "12m Bar (10.67 kg)",
    "unit": "12m Bar",
    "requiresUnloadingLabour": true,
    "spec": "IS 1786 Fe 500 Certified \u2022 Economical structural sariya priced at Mandi wholesale \u20b954/kg",
    "shortTagline": "High Value Gallantt Structural Sariya \u2022 \u20b953.98/kg",
    "specChips": [
      "12mm Dia",
      "12m Standard",
      "10.67 kg/bar",
      "Fe 500 Regional"
    ],
    "bulkPrice": 560,
    "bulkSlabText": "\u20b9560/bar on 15+ Bars",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 13,
    "vehicleType": "Pickup / Mini-Truck",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "tata-wiron-18-swg-binding-wire-1kg",
    "slug": "tata-wiron-18-swg-binding-wire-1kg",
    "name": "Tata Wiron 18 SWG Black Annealed Binding Wire (1 kg)",
    "title": "Tata Wiron 18 SWG Black Annealed Binding Wire (1 kg)",
    "brand": "Tata Wiron",
    "oemModelCode": "WIRON-18-01",
    "subcategory": "binding-wire-accessories",
    "type": "Binding Wire",
    "price": 95,
    "mrp": 120,
    "exGstPrice": 81,
    "hsnCode": "7217",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "2-Wheeler",
    "priceVolatility": "MONTHLY",
    "packSize": "1 kg Coil",
    "unit": "1 kg Coil",
    "requiresUnloadingLabour": false,
    "spec": "IS 280 Certified \u2022 18 SWG Soft annealed wire \u2022 Does not snap under heavy tying torque",
    "shortTagline": "Tata Wiron Zero-Snap Soft Annealed Rebar Binding Wire",
    "specChips": [
      "18 SWG",
      "Soft Annealed",
      "High Tensile",
      "1 kg Coil"
    ],
    "bulkPrice": 88,
    "bulkSlabText": "\u20b988/kg on 10+ kg",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 21,
    "vehicleType": "2-Wheeler",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "kamdhenu-22-gauge-ms-binding-wire-1kg",
    "slug": "kamdhenu-22-gauge-ms-binding-wire-1kg",
    "name": "Kamdhenu 22 Gauge MS Binding Wire (1 kg)",
    "title": "Kamdhenu 22 Gauge MS Binding Wire (1 kg)",
    "brand": "Kamdhenu",
    "oemModelCode": "KAM-BW-22-01",
    "subcategory": "binding-wire-accessories",
    "type": "Binding Wire",
    "price": 89,
    "mrp": 110,
    "exGstPrice": 75,
    "hsnCode": "7217",
    "gstPercent": 18,
    "brandTier": 2,
    "deliveryVehicleType": "2-Wheeler",
    "priceVolatility": "MONTHLY",
    "packSize": "1 kg Coil",
    "unit": "1 kg Coil",
    "requiresUnloadingLabour": false,
    "spec": "22 Gauge fine annealed mild steel wire \u2022 Ultra pliable for stirrups and mesh tying",
    "shortTagline": "Flexible 22 Gauge MS Annealed Wire for Mesh & Rings",
    "specChips": [
      "22 SWG / Gauge",
      "Pliable MS",
      "Ring & Mesh Tying",
      "1 kg Coil"
    ],
    "bulkPrice": 82,
    "bulkSlabText": "\u20b982/kg on 10+ kg",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 19,
    "vehicleType": "2-Wheeler",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "local-isi-18-20-swg-binding-wire-25kg",
    "slug": "local-isi-18-20-swg-binding-wire-25kg",
    "name": "Local ISI 18/20 SWG MS Black Binding Wire (25 kg Coil)",
    "title": "Local ISI 18/20 SWG MS Black Binding Wire (25 kg Coil)",
    "brand": "Local ISI",
    "oemModelCode": "ISI-BW-25KG",
    "subcategory": "binding-wire-accessories",
    "type": "Binding Wire",
    "price": 1775,
    "mrp": 2100,
    "exGstPrice": 1504,
    "hsnCode": "7217",
    "gstPercent": 18,
    "brandTier": 2,
    "deliveryVehicleType": "E-Loader",
    "priceVolatility": "MONTHLY",
    "packSize": "25 kg Bundle",
    "unit": "25 kg Bundle",
    "requiresUnloadingLabour": false,
    "spec": "IS 280 Commercial Grade \u2022 25kg full bundle coil \u2022 Standard choice for full residential slabs",
    "shortTagline": "Wholesale 25 kg Slab Contractor Bundle \u2022 \u20b971/kg",
    "specChips": [
      "18/20 SWG",
      "25 kg Bundle",
      "Wholesale Slab Pack",
      "Mandi Direct"
    ],
    "bulkPrice": 1725,
    "bulkSlabText": "\u20b91725/bundle on 4+ Bundles",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 15,
    "vehicleType": "E-Loader",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "local-isi-gi-binding-wire-14-swg-1kg",
    "slug": "local-isi-gi-binding-wire-14-swg-1kg",
    "name": "Local ISI GI Hot-Dipped Binding Wire 14 SWG (1 kg)",
    "title": "Local ISI GI Hot-Dipped Binding Wire 14 SWG (1 kg)",
    "brand": "Local ISI",
    "oemModelCode": "ISI-GI-14-01",
    "subcategory": "binding-wire-accessories",
    "type": "Binding Wire",
    "price": 85,
    "mrp": 105,
    "exGstPrice": 72,
    "hsnCode": "7217",
    "gstPercent": 18,
    "brandTier": 2,
    "deliveryVehicleType": "2-Wheeler",
    "priceVolatility": "MONTHLY",
    "packSize": "1 kg Coil",
    "unit": "1 kg Coil",
    "requiresUnloadingLabour": false,
    "spec": "Hot-dip galvanized zinc coated \u2022 High corrosion protection for boundary fencing & plumbing ties",
    "shortTagline": "Hot-Dipped Galvanized Anti-Rust Wire 14 SWG",
    "specChips": [
      "14 SWG GI",
      "Hot-Dipped Zinc",
      "Rust Proof",
      "1 kg Coil"
    ],
    "bulkPrice": 78,
    "bulkSlabText": "\u20b978/kg on 10+ kg",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 19,
    "vehicleType": "2-Wheeler",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "dr-fixit-101-pidiproof-lw-plus-200ml",
    "slug": "dr-fixit-101-pidiproof-lw-plus-200ml",
    "name": "Dr. Fixit 101 Pidiproof LW+ Integral Compound (200ml, HSN 3824)",
    "title": "Dr. Fixit 101 Pidiproof LW+ Integral Compound (200ml, HSN 3824)",
    "brand": "Dr. Fixit",
    "oemModelCode": "FIXIT-101-200",
    "subcategory": "waterproofing-chemicals",
    "type": "Waterproofing",
    "chemicalType": "Integral Waterproofing",
    "dosagePerBagCement": "200ml per 50kg bag",
    "price": 59,
    "mrp": 70,
    "exGstPrice": 50,
    "hsnCode": "3824",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "2-Wheeler",
    "priceVolatility": "MONTHLY",
    "packSize": "200 ml Bottle",
    "unit": "200 ml Bottle",
    "requiresUnloadingLabour": false,
    "spec": "IS 2645 Certified \u2022 Exact single-bag dosage (200ml per 50kg cement) \u2022 Prevents capillary cracks",
    "shortTagline": "1 Bag = 1 Bottle (200ml) Integral Waterproofing",
    "specChips": [
      "IS 2645",
      "1 Bag : 200ml",
      "Anti-Seepage",
      "200 ml"
    ],
    "bulkPrice": 52,
    "bulkSlabText": "\u20b952/bottle on 10+ Bottles",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 16,
    "vehicleType": "2-Wheeler",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "dr-fixit-101-pidiproof-lw-plus-1l",
    "slug": "dr-fixit-101-pidiproof-lw-plus-1l",
    "name": "Dr. Fixit 101 Pidiproof LW+ Integral Compound (1 L, HSN 3824)",
    "title": "Dr. Fixit 101 Pidiproof LW+ Integral Compound (1 L, HSN 3824)",
    "brand": "Dr. Fixit",
    "oemModelCode": "FIXIT-101-01L",
    "subcategory": "waterproofing-chemicals",
    "type": "Waterproofing",
    "chemicalType": "Integral Waterproofing",
    "dosagePerBagCement": "200ml per 50kg bag (5 bags cement)",
    "price": 199,
    "mrp": 235,
    "exGstPrice": 169,
    "hsnCode": "3824",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "2-Wheeler",
    "priceVolatility": "MONTHLY",
    "packSize": "1 Litre Bottle",
    "unit": "1 Litre Bottle",
    "requiresUnloadingLabour": false,
    "spec": "IS 2645 Certified \u2022 Treats up to 5 bags cement \u2022 Improves workability and compressive strength",
    "shortTagline": "Integral Waterproofing Liquid for 5 Bags of Cement",
    "specChips": [
      "IS 2645",
      "Treats 5 Bags",
      "Anti-Dampness",
      "1 Litre"
    ],
    "bulkPrice": 185,
    "bulkSlabText": "\u20b9185/can on 6+ Cans",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 15,
    "vehicleType": "2-Wheeler",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "dr-fixit-101-pidiproof-lw-plus-5l",
    "slug": "dr-fixit-101-pidiproof-lw-plus-5l",
    "name": "Dr. Fixit 101 Pidiproof LW+ Integral Compound (5 L, HSN 3824)",
    "title": "Dr. Fixit 101 Pidiproof LW+ Integral Compound (5 L, HSN 3824)",
    "brand": "Dr. Fixit",
    "oemModelCode": "FIXIT-101-05L",
    "subcategory": "waterproofing-chemicals",
    "type": "Waterproofing",
    "chemicalType": "Integral Waterproofing",
    "dosagePerBagCement": "200ml per 50kg bag (25 bags cement)",
    "price": 699,
    "mrp": 830,
    "exGstPrice": 592,
    "hsnCode": "3824",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "2-Wheeler",
    "priceVolatility": "MONTHLY",
    "packSize": "5 Litre Can",
    "unit": "5 Litre Can",
    "requiresUnloadingLabour": false,
    "spec": "IS 2645 Certified \u2022 Treats up to 25 bags cement \u2022 Standard contractor pack for roof slab casting",
    "shortTagline": "Contractor Choice for Slab Casting \u2022 Treats 25 Bags",
    "specChips": [
      "IS 2645",
      "Treats 25 Bags",
      "Slab Casting",
      "5 Litres"
    ],
    "bulkPrice": 660,
    "bulkSlabText": "\u20b9660/can on 4+ Cans",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 16,
    "vehicleType": "2-Wheeler",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "dr-fixit-101-pidiproof-lw-plus-20l",
    "slug": "dr-fixit-101-pidiproof-lw-plus-20l",
    "name": "Dr. Fixit 101 Pidiproof LW+ Integral Compound (20 L, HSN 3824)",
    "title": "Dr. Fixit 101 Pidiproof LW+ Integral Compound (20 L, HSN 3824)",
    "brand": "Dr. Fixit",
    "oemModelCode": "FIXIT-101-20L",
    "subcategory": "waterproofing-chemicals",
    "type": "Waterproofing",
    "chemicalType": "Integral Waterproofing",
    "dosagePerBagCement": "200ml per 50kg bag (100 bags cement)",
    "price": 2499,
    "mrp": 2980,
    "exGstPrice": 2118,
    "hsnCode": "3824",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "priceVolatility": "MONTHLY",
    "packSize": "20 Litre Drum",
    "unit": "20 Litre Drum",
    "requiresUnloadingLabour": false,
    "spec": "IS 2645 Certified \u2022 Treats up to 100 bags cement \u2022 Commercial drum for complete foundation & slab works",
    "shortTagline": "Commercial Drum for Full Slab Casting (100 Bags)",
    "specChips": [
      "IS 2645",
      "Treats 100 Bags",
      "Commercial Drum",
      "20 Litres"
    ],
    "bulkPrice": 2380,
    "bulkSlabText": "\u20b92380/drum on 2+ Drums",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 16,
    "vehicleType": "E-Loader",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "dr-fixit-301-pidicrete-urp-1kg",
    "slug": "dr-fixit-301-pidicrete-urp-1kg",
    "name": "Dr. Fixit 301 Pidicrete URP SBR Latex (1 kg, HSN 3824)",
    "title": "Dr. Fixit 301 Pidicrete URP SBR Latex (1 kg, HSN 3824)",
    "brand": "Dr. Fixit",
    "oemModelCode": "FIXIT-301-01K",
    "subcategory": "waterproofing-chemicals",
    "type": "Waterproofing",
    "chemicalType": "SBR Polymer Latex",
    "price": 355,
    "mrp": 420,
    "exGstPrice": 301,
    "hsnCode": "3824",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "2-Wheeler",
    "priceVolatility": "MONTHLY",
    "packSize": "1 kg Bottle",
    "unit": "1 kg Bottle",
    "requiresUnloadingLabour": false,
    "spec": "Styrene Butadiene Copolymer Latex \u2022 Extreme bond coat for old-to-new concrete joints & structural repair",
    "shortTagline": "Universal SBR Latex Bonding Agent & Repair Polymer",
    "specChips": [
      "SBR Copolymer",
      "Old-New Bond",
      "Structural Repair",
      "1 kg"
    ],
    "bulkPrice": 335,
    "bulkSlabText": "\u20b9335/can on 6+ Cans",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 15,
    "vehicleType": "2-Wheeler",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "dr-fixit-301-pidicrete-urp-5kg",
    "slug": "dr-fixit-301-pidicrete-urp-5kg",
    "name": "Dr. Fixit 301 Pidicrete URP SBR Latex (5 kg, HSN 3824)",
    "title": "Dr. Fixit 301 Pidicrete URP SBR Latex (5 kg, HSN 3824)",
    "brand": "Dr. Fixit",
    "oemModelCode": "FIXIT-301-05K",
    "subcategory": "waterproofing-chemicals",
    "type": "Waterproofing",
    "chemicalType": "SBR Polymer Latex",
    "price": 1570,
    "mrp": 1850,
    "exGstPrice": 1331,
    "hsnCode": "3824",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "2-Wheeler",
    "priceVolatility": "MONTHLY",
    "packSize": "5 kg Can",
    "unit": "5 kg Can",
    "requiresUnloadingLabour": false,
    "spec": "SBR Bonding Latex \u2022 Mixes with cement 1:1.5 for waterproofing slurries and concrete crack injections",
    "shortTagline": "Heavy Duty 5 kg SBR Bonding & Waterproof Slurry Polymer",
    "specChips": [
      "SBR Latex",
      "Waterproof Slurry",
      "Column Joint Bond",
      "5 kg"
    ],
    "bulkPrice": 1490,
    "bulkSlabText": "\u20b91490/can on 3+ Cans",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 15,
    "vehicleType": "2-Wheeler",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "dr-fixit-112-pidifin-2k-3kg-kit",
    "slug": "dr-fixit-112-pidifin-2k-3kg-kit",
    "name": "Dr. Fixit 112 Pidifin 2K Waterproof Coating (3 kg, HSN 3214)",
    "title": "Dr. Fixit 112 Pidifin 2K Waterproof Coating (3 kg, HSN 3214)",
    "brand": "Dr. Fixit",
    "oemModelCode": "FIXIT-112-03K",
    "subcategory": "waterproofing-chemicals",
    "type": "Waterproofing",
    "chemicalType": "2K Cementitious Coating",
    "price": 548,
    "mrp": 650,
    "exGstPrice": 464,
    "hsnCode": "3214",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "2-Wheeler",
    "priceVolatility": "MONTHLY",
    "packSize": "3 kg Kit",
    "unit": "3 kg Kit",
    "requiresUnloadingLabour": false,
    "spec": "Two-component acrylic cementitious coating \u2022 Flexible elastomeric barrier for bathroom sunken slabs & balconies",
    "shortTagline": "2-Component Elastomeric Bathroom Waterproofing Kit",
    "specChips": [
      "2K Polymer",
      "Bathroom Sunken",
      "Elastomeric",
      "3 kg Kit"
    ],
    "bulkPrice": 520,
    "bulkSlabText": "\u20b9520/kit on 4+ Kits",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 16,
    "vehicleType": "2-Wheeler",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "dr-fixit-112-pidifin-2k-15kg-kit",
    "slug": "dr-fixit-112-pidifin-2k-15kg-kit",
    "name": "Dr. Fixit 112 Pidifin 2K Waterproof Coating (15 kg, HSN 3214)",
    "title": "Dr. Fixit 112 Pidifin 2K Waterproof Coating (15 kg, HSN 3214)",
    "brand": "Dr. Fixit",
    "oemModelCode": "FIXIT-112-15K",
    "subcategory": "waterproofing-chemicals",
    "type": "Waterproofing",
    "chemicalType": "2K Cementitious Coating",
    "price": 1860,
    "mrp": 2200,
    "exGstPrice": 1576,
    "hsnCode": "3214",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "2-Wheeler",
    "priceVolatility": "MONTHLY",
    "packSize": "15 kg Kit",
    "unit": "15 kg Kit",
    "requiresUnloadingLabour": false,
    "spec": "15kg Full System Kit (Liquid + Powder) \u2022 Withstands up to 5 bar positive water pressure in water sumps & swimming pools",
    "shortTagline": "Commercial 2K Kit for Underground Sumps & Wet Areas",
    "specChips": [
      "2K System",
      "5 Bar Pressure",
      "Water Tanks & Sump",
      "15 kg Kit"
    ],
    "bulkPrice": 1775,
    "bulkSlabText": "\u20b91775/kit on 2+ Kits",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 15,
    "vehicleType": "2-Wheeler",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "dr-fixit-roofseal-classic-white-4l",
    "slug": "dr-fixit-roofseal-classic-white-4l",
    "name": "Dr. Fixit Roofseal Classic White Waterproof Coating (4 L, HSN 3209)",
    "title": "Dr. Fixit Roofseal Classic White Waterproof Coating (4 L, HSN 3209)",
    "brand": "Dr. Fixit",
    "oemModelCode": "FIXIT-ROOF-04L",
    "subcategory": "waterproofing-chemicals",
    "type": "Waterproofing",
    "chemicalType": "Acrylic Roof Coating",
    "price": 1368,
    "mrp": 1620,
    "exGstPrice": 1159,
    "hsnCode": "3209",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "2-Wheeler",
    "priceVolatility": "MONTHLY",
    "packSize": "4 Litre Bucket",
    "unit": "4 Litre Bucket",
    "requiresUnloadingLabour": false,
    "spec": "Elastomeric pure acrylic roof membrane \u2022 Solar reflective cooling (reduces roof temp by up to 10\u00b0C) with crack bridging",
    "shortTagline": "Solar Reflective Heat-Reducing Terrace Waterproofing",
    "specChips": [
      "Elastomeric Acrylic",
      "Cool Roof (10\u00b0C)",
      "Crack Bridging",
      "4 Litres"
    ],
    "bulkPrice": 1300,
    "bulkSlabText": "\u20b91300/can on 3+ Cans",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 16,
    "vehicleType": "2-Wheeler",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "dr-fixit-roofseal-classic-white-10l",
    "slug": "dr-fixit-roofseal-classic-white-10l",
    "name": "Dr. Fixit Roofseal Classic White Waterproof Coating (10 L, HSN 3209)",
    "title": "Dr. Fixit Roofseal Classic White Waterproof Coating (10 L, HSN 3209)",
    "brand": "Dr. Fixit",
    "oemModelCode": "FIXIT-ROOF-10L",
    "subcategory": "waterproofing-chemicals",
    "type": "Waterproofing",
    "chemicalType": "Acrylic Roof Coating",
    "price": 2900,
    "mrp": 3450,
    "exGstPrice": 2458,
    "hsnCode": "3209",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "2-Wheeler",
    "priceVolatility": "MONTHLY",
    "packSize": "10 Litre Bucket",
    "unit": "10 Litre Bucket",
    "requiresUnloadingLabour": false,
    "spec": "Medium terrace coating pack \u2022 100% UV resistant seamless rubberized membrane",
    "shortTagline": "Seamless Terrace Waterproofing Coating 10L",
    "specChips": [
      "UV Resistant",
      "Seamless Membrane",
      "Terrace Protection",
      "10 Litres"
    ],
    "bulkPrice": 2780,
    "bulkSlabText": "\u20b92780/bucket on 2+ Buckets",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 16,
    "vehicleType": "2-Wheeler",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "dr-fixit-roofseal-classic-white-20l",
    "slug": "dr-fixit-roofseal-classic-white-20l",
    "name": "Dr. Fixit Roofseal Classic White Waterproof Coating (20 L, HSN 3209)",
    "title": "Dr. Fixit Roofseal Classic White Waterproof Coating (20 L, HSN 3209)",
    "brand": "Dr. Fixit",
    "oemModelCode": "FIXIT-ROOF-20L",
    "subcategory": "waterproofing-chemicals",
    "type": "Waterproofing",
    "chemicalType": "Acrylic Roof Coating",
    "price": 5500,
    "mrp": 6500,
    "exGstPrice": 4661,
    "hsnCode": "3209",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "priceVolatility": "MONTHLY",
    "packSize": "20 Litre Drum",
    "unit": "20 Litre Drum",
    "requiresUnloadingLabour": false,
    "spec": "Master terrace drum \u2022 Covers up to 600 sq.ft in 2 coats \u2022 Highest solar reflectance and waterproof durability",
    "shortTagline": "Master Contractor Drum for Full Roof Waterproofing (600 sq ft)",
    "specChips": [
      "600 sq ft Coverage",
      "Elastomeric 20L",
      "Cool Roof",
      "20 Litres"
    ],
    "bulkPrice": 5250,
    "bulkSlabText": "\u20b95250/drum on 2+ Drums",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 15,
    "vehicleType": "E-Loader",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "dr-fixit-201-crack-x-paste-1kg",
    "slug": "dr-fixit-201-crack-x-paste-1kg",
    "name": "Dr. Fixit 201 Crack-X Paste Crack Filler (1 kg, HSN 3214)",
    "title": "Dr. Fixit 201 Crack-X Paste Crack Filler (1 kg, HSN 3214)",
    "brand": "Dr. Fixit",
    "oemModelCode": "FIXIT-201-01K",
    "subcategory": "waterproofing-chemicals",
    "type": "Waterproofing",
    "chemicalType": "Crack Filler",
    "price": 449,
    "mrp": 530,
    "exGstPrice": 381,
    "hsnCode": "3214",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "2-Wheeler",
    "priceVolatility": "MONTHLY",
    "packSize": "1 kg Tub",
    "unit": "1 kg Tub",
    "requiresUnloadingLabour": false,
    "spec": "Non-shrink acrylic paste \u2022 Bridges plaster cracks up to 5mm \u2022 Overpaintable with exterior and interior emulsion",
    "shortTagline": "Non-Shrink Flexible Plaster Crack Filler (up to 5mm)",
    "specChips": [
      "Non-Shrink",
      "Up to 5mm Cracks",
      "Overpaintable",
      "1 kg Tub"
    ],
    "bulkPrice": 420,
    "bulkSlabText": "\u20b9420/tub on 5+ Tubs",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 15,
    "vehicleType": "2-Wheeler",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "dr-fixit-raincoat-wpc-exterior-4l",
    "slug": "dr-fixit-raincoat-wpc-exterior-4l",
    "name": "Dr. Fixit Raincoat WPC Exterior Waterproof Coating (4 L, HSN 3209)",
    "title": "Dr. Fixit Raincoat WPC Exterior Waterproof Coating (4 L, HSN 3209)",
    "brand": "Dr. Fixit",
    "oemModelCode": "FIXIT-RAIN-04L",
    "subcategory": "waterproofing-chemicals",
    "type": "Waterproofing",
    "chemicalType": "Acrylic Roof Coating",
    "price": 1380,
    "mrp": 1640,
    "exGstPrice": 1169,
    "hsnCode": "3209",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "2-Wheeler",
    "priceVolatility": "MONTHLY",
    "packSize": "4 Litre Bucket",
    "unit": "4 Litre Bucket",
    "requiresUnloadingLabour": false,
    "spec": "High-build elastomeric wall raincoat coating \u2022 110 micron dry film thickness for external rain protection",
    "shortTagline": "Heavy Rain Protective Exterior Elastomeric Coating",
    "specChips": [
      "Exterior Raincoat",
      "110 Micron DFT",
      "Anti-Algal",
      "4 Litres"
    ],
    "bulkPrice": 1310,
    "bulkSlabText": "\u20b91310/bucket on 3+ Buckets",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 16,
    "vehicleType": "2-Wheeler",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "ultratech-weather-pro-wp200-1l",
    "slug": "ultratech-weather-pro-wp200-1l",
    "name": "UltraTech Weather Pro WP+200 Integral Liquid (1 L, HSN 3824)",
    "title": "UltraTech Weather Pro WP+200 Integral Liquid (1 L, HSN 3824)",
    "brand": "UltraTech",
    "oemModelCode": "UT-WP200-01L",
    "subcategory": "waterproofing-chemicals",
    "type": "Waterproofing",
    "chemicalType": "Integral Waterproofing",
    "dosagePerBagCement": "200ml per 50kg bag (5 bags cement)",
    "price": 145,
    "mrp": 175,
    "exGstPrice": 123,
    "hsnCode": "3824",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "2-Wheeler",
    "priceVolatility": "MONTHLY",
    "packSize": "1 Litre Bottle",
    "unit": "1 Litre Bottle",
    "requiresUnloadingLabour": false,
    "spec": "IS 2645 Certified \u2022 UltraTech active pore-blocking polymers \u2022 Formulated for synergy with UltraTech cement",
    "shortTagline": "UltraTech Active Pore-Blocking Liquid Waterproofing",
    "specChips": [
      "IS 2645",
      "Active Polymers",
      "UltraTech Synergy",
      "1 Litre"
    ],
    "bulkPrice": 135,
    "bulkSlabText": "\u20b9135/can on 6+ Cans",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 17,
    "vehicleType": "2-Wheeler",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "ultratech-weather-pro-wp200-5l",
    "slug": "ultratech-weather-pro-wp200-5l",
    "name": "UltraTech Weather Pro WP+200 Integral Liquid (5 L, HSN 3824)",
    "title": "UltraTech Weather Pro WP+200 Integral Liquid (5 L, HSN 3824)",
    "brand": "UltraTech",
    "oemModelCode": "UT-WP200-05L",
    "subcategory": "waterproofing-chemicals",
    "type": "Waterproofing",
    "chemicalType": "Integral Waterproofing",
    "dosagePerBagCement": "200ml per 50kg bag (25 bags cement)",
    "price": 580,
    "mrp": 690,
    "exGstPrice": 492,
    "hsnCode": "3824",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "2-Wheeler",
    "priceVolatility": "MONTHLY",
    "packSize": "5 Litre Can",
    "unit": "5 Litre Can",
    "requiresUnloadingLabour": false,
    "spec": "IS 2645 Certified \u2022 Treats 25 bags of cement \u2022 Cuts capillary absorption by >85%",
    "shortTagline": "Slab & Plaster 5L WP+200 Pore-Blocking Liquid",
    "specChips": [
      "IS 2645",
      "85% Less Absorption",
      "25 Bag Treatment",
      "5 Litres"
    ],
    "bulkPrice": 545,
    "bulkSlabText": "\u20b9545/can on 4+ Cans",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 16,
    "vehicleType": "2-Wheeler",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "ultratech-weather-pro-wp200-20l",
    "slug": "ultratech-weather-pro-wp200-20l",
    "name": "UltraTech Weather Pro WP+200 Integral Liquid (20 L, HSN 3824)",
    "title": "UltraTech Weather Pro WP+200 Integral Liquid (20 L, HSN 3824)",
    "brand": "UltraTech",
    "oemModelCode": "UT-WP200-20L",
    "subcategory": "waterproofing-chemicals",
    "type": "Waterproofing",
    "chemicalType": "Integral Waterproofing",
    "dosagePerBagCement": "200ml per 50kg bag (100 bags cement)",
    "price": 1990,
    "mrp": 2380,
    "exGstPrice": 1686,
    "hsnCode": "3824",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "priceVolatility": "MONTHLY",
    "packSize": "20 Litre Drum",
    "unit": "20 Litre Drum",
    "requiresUnloadingLabour": false,
    "spec": "Commercial 20L Drum \u2022 Treats up to 100 bags of cement \u2022 Recommended for basement and foundation concrete",
    "shortTagline": "Commercial Bulk Drum WP+200 (100 Bags)",
    "specChips": [
      "Commercial 20L",
      "100 Bags Cement",
      "Foundation & RCC",
      "20 Litres"
    ],
    "bulkPrice": 1890,
    "bulkSlabText": "\u20b91890/drum on 2+ Drums",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 16,
    "vehicleType": "E-Loader",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "sika-sikalatex-power-sbr-1kg",
    "slug": "sika-sikalatex-power-sbr-1kg",
    "name": "Sika SikaLatex Power SBR Polymer (1 kg, HSN 3824)",
    "title": "Sika SikaLatex Power SBR Polymer (1 kg, HSN 3824)",
    "brand": "Sika",
    "oemModelCode": "SIKA-LATEX-01K",
    "subcategory": "waterproofing-chemicals",
    "type": "Waterproofing",
    "chemicalType": "SBR Polymer Latex",
    "price": 567,
    "mrp": 670,
    "exGstPrice": 481,
    "hsnCode": "3824",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "2-Wheeler",
    "priceVolatility": "MONTHLY",
    "packSize": "1 kg Bottle",
    "unit": "1 kg Bottle",
    "requiresUnloadingLabour": false,
    "spec": "High polymer solids SBR \u2022 Swiss engineering standards for crack repair and high-wear screeds",
    "shortTagline": "Swiss Engineered SBR Bonding & High-Strength Screed Polymer",
    "specChips": [
      "Swiss Standard",
      "High Solids SBR",
      "Anti-Fissure",
      "1 kg"
    ],
    "bulkPrice": 535,
    "bulkSlabText": "\u20b9535/bottle on 5+ Bottles",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 15,
    "vehicleType": "2-Wheeler",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "sika-sikatop-seal-107-2k-25kg",
    "slug": "sika-sikatop-seal-107-2k-25kg",
    "name": "Sika SikaTop Seal 107 2K Waterproofing (25 kg, HSN 3214)",
    "title": "Sika SikaTop Seal 107 2K Waterproofing (25 kg, HSN 3214)",
    "brand": "Sika",
    "oemModelCode": "SIKA-TOP-107",
    "subcategory": "waterproofing-chemicals",
    "type": "Waterproofing",
    "chemicalType": "2K Cementitious Coating",
    "price": 1420,
    "mrp": 1690,
    "exGstPrice": 1203,
    "hsnCode": "3214",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "priceVolatility": "MONTHLY",
    "packSize": "25 kg Kit",
    "unit": "25 kg Kit",
    "requiresUnloadingLabour": false,
    "spec": "2-Component polymer modified mortar \u2022 Certified potable water contact safe for drinking water sumps & tanks",
    "shortTagline": "Potable Water Safe 2K Polymer Mortar Coating (25 kg)",
    "specChips": [
      "Potable Water Safe",
      "25 kg Heavy Kit",
      "Underground Sump",
      "2-Part Mortar"
    ],
    "bulkPrice": 1350,
    "bulkSlabText": "\u20b91350/kit on 3+ Kits",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 16,
    "vehicleType": "E-Loader",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "fosroc-conplast-wl-xtra-1l",
    "slug": "fosroc-conplast-wl-xtra-1l",
    "name": "Fosroc Conplast WL Xtra Integral Waterproofing (1 L, HSN 3824)",
    "title": "Fosroc Conplast WL Xtra Integral Waterproofing (1 L, HSN 3824)",
    "brand": "Fosroc",
    "oemModelCode": "FOS-WL-01L",
    "subcategory": "waterproofing-chemicals",
    "type": "Waterproofing",
    "chemicalType": "Integral Waterproofing",
    "dosagePerBagCement": "125ml to 200ml per 50kg bag",
    "price": 168,
    "mrp": 200,
    "exGstPrice": 142,
    "hsnCode": "3824",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "2-Wheeler",
    "priceVolatility": "MONTHLY",
    "packSize": "1 Litre Bottle",
    "unit": "1 Litre Bottle",
    "requiresUnloadingLabour": false,
    "spec": "IS 2645 Certified \u2022 Industrial structural plasticizing waterproofing liquid \u2022 Enhances slump with reduced water-cement ratio",
    "shortTagline": "Industrial Slump Enhancing Integral Waterproofing",
    "specChips": [
      "IS 2645",
      "Plasticizing Effect",
      "High Density",
      "1 Litre"
    ],
    "bulkPrice": 158,
    "bulkSlabText": "\u20b9158/bottle on 6+ Bottles",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 16,
    "vehicleType": "2-Wheeler",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "fosroc-brushbond-rfx-2k-kit",
    "slug": "fosroc-brushbond-rfx-2k-kit",
    "name": "Fosroc Brushbond RFX 2K Cementitious Coating Kit (HSN 3214)",
    "title": "Fosroc Brushbond RFX 2K Cementitious Coating Kit (HSN 3214)",
    "brand": "Fosroc",
    "oemModelCode": "FOS-RFX-KIT",
    "subcategory": "waterproofing-chemicals",
    "type": "Waterproofing",
    "chemicalType": "2K Cementitious Coating",
    "price": 2300,
    "mrp": 2700,
    "exGstPrice": 1949,
    "hsnCode": "3214",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "2-Wheeler",
    "priceVolatility": "MONTHLY",
    "packSize": "17.1 kg Kit",
    "unit": "17.1 kg Kit",
    "requiresUnloadingLabour": false,
    "spec": "High performance elastomeric polymer modified coating \u2022 Excellent adhesion to porous and non-porous masonry",
    "shortTagline": "Commercial Heavy-Duty Elastomeric Brushbond Kit",
    "specChips": [
      "Heavy Duty RFX",
      "High Elasticity",
      "Commercial Wet Area",
      "17.1 kg Kit"
    ],
    "bulkPrice": 2200,
    "bulkSlabText": "\u20b92200/kit on 2+ Kits",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 15,
    "vehicleType": "2-Wheeler",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "asian-paints-smartcare-damp-proof-white-4l",
    "slug": "asian-paints-smartcare-damp-proof-white-4l",
    "name": "Asian Paints SmartCare Damp Proof White (4 L, HSN 3209)",
    "title": "Asian Paints SmartCare Damp Proof White (4 L, HSN 3209)",
    "brand": "Asian Paints",
    "oemModelCode": "AP-DAMP-04L",
    "subcategory": "waterproofing-chemicals",
    "type": "Waterproofing",
    "chemicalType": "Acrylic Roof Coating",
    "price": 1346,
    "mrp": 1590,
    "exGstPrice": 1141,
    "hsnCode": "3209",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "2-Wheeler",
    "priceVolatility": "MONTHLY",
    "packSize": "4 Litre Bucket",
    "unit": "4 Litre Bucket",
    "requiresUnloadingLabour": false,
    "spec": "Reinforced glass fiber technology \u2022 Up to 10 bar hydrostatic pressure resistance \u2022 8-year waterproofing warranty",
    "shortTagline": "Fiber-Reinforced Terrace Waterproofing (8-Year Warranty)",
    "specChips": [
      "Glass Fiber Tech",
      "8 Yr Warranty",
      "10 Bar Resistance",
      "4 Litres"
    ],
    "bulkPrice": 1280,
    "bulkSlabText": "\u20b91280/bucket on 3+ Buckets",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 15,
    "vehicleType": "2-Wheeler",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "asian-paints-smartcare-damp-proof-advanced-20l",
    "slug": "asian-paints-smartcare-damp-proof-advanced-20l",
    "name": "Asian Paints SmartCare Damp Proof Advanced White (20 L, HSN 3209)",
    "title": "Asian Paints SmartCare Damp Proof Advanced White (20 L, HSN 3209)",
    "brand": "Asian Paints",
    "oemModelCode": "AP-DAMP-ADV-20L",
    "subcategory": "waterproofing-chemicals",
    "type": "Waterproofing",
    "chemicalType": "Acrylic Roof Coating",
    "price": 5400,
    "mrp": 6350,
    "exGstPrice": 4576,
    "hsnCode": "3209",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "priceVolatility": "MONTHLY",
    "packSize": "20 Litre Drum",
    "unit": "20 Litre Drum",
    "requiresUnloadingLabour": false,
    "spec": "Advanced polyurethane acrylic hybrid \u2022 10-year comprehensive warranty with maximum elongation and cooling index",
    "shortTagline": "PU-Acrylic Hybrid 20L Drum (10-Year Waterproofing Warranty)",
    "specChips": [
      "PU-Acrylic Hybrid",
      "10 Yr Warranty",
      "Advanced Terrace",
      "20 Litres"
    ],
    "bulkPrice": 5150,
    "bulkSlabText": "\u20b95150/drum on 2+ Drums",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 15,
    "vehicleType": "E-Loader",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "ultratech-tilefixo-ct-ceramic-20kg",
    "slug": "ultratech-tilefixo-ct-ceramic-20kg",
    "name": "UltraTech Tilefixo CT Ceramic Floor Adhesive (20 kg Bag)",
    "title": "UltraTech Tilefixo CT Ceramic Floor Adhesive (20 kg Bag)",
    "brand": "UltraTech",
    "oemModelCode": "UT-TF-CT-20",
    "subcategory": "tile-adhesives-block-mortar",
    "type": "Tile Adhesive",
    "chemicalType": "Tile Adhesive",
    "price": 300,
    "mrp": 360,
    "exGstPrice": 254,
    "hsnCode": "3824",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "priceVolatility": "MONTHLY",
    "packSize": "20 kg Bag",
    "unit": "20 kg Bag",
    "requiresUnloadingLabour": true,
    "spec": "IS 15477 Type 1 Certified \u2022 Polymer modified grey adhesive for ceramic tiles on internal floor & wall surfaces",
    "shortTagline": "Type 1 Polymer Modified Ceramic Tile Floor Adhesive",
    "specChips": [
      "IS 15477 Type 1",
      "Ceramic Tiles",
      "Internal Floors",
      "20 kg Bag"
    ],
    "bulkPrice": 285,
    "bulkSlabText": "\u20b9285/bag on 10+ Bags",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 17,
    "vehicleType": "E-Loader",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "ultratech-tilefixo-vt-vitrified-20kg",
    "slug": "ultratech-tilefixo-vt-vitrified-20kg",
    "name": "UltraTech Tilefixo VT Vitrified Tile Adhesive (20 kg Bag)",
    "title": "UltraTech Tilefixo VT Vitrified Tile Adhesive (20 kg Bag)",
    "brand": "UltraTech",
    "oemModelCode": "UT-TF-VT-20",
    "subcategory": "tile-adhesives-block-mortar",
    "type": "Tile Adhesive",
    "chemicalType": "Tile Adhesive",
    "price": 395,
    "mrp": 470,
    "exGstPrice": 335,
    "hsnCode": "3824",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "priceVolatility": "MONTHLY",
    "packSize": "20 kg Bag",
    "unit": "20 kg Bag",
    "requiresUnloadingLabour": true,
    "spec": "IS 15477 Type 2 Certified \u2022 High bond tensile strength for large format vitrified tiles and porcelain slabs",
    "shortTagline": "Type 2 Vitrified & Large Format Porcelain Tile Adhesive",
    "specChips": [
      "IS 15477 Type 2",
      "Vitrified Slabs",
      "High Shear Bond",
      "20 kg Bag"
    ],
    "bulkPrice": 378,
    "bulkSlabText": "\u20b9378/bag on 10+ Bags",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 16,
    "vehicleType": "E-Loader",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "ultratech-tilefixo-nt-stone-wall-20kg",
    "slug": "ultratech-tilefixo-nt-stone-wall-20kg",
    "name": "UltraTech Tilefixo NT Natural Stone/Wall Adhesive (20 kg Bag)",
    "title": "UltraTech Tilefixo NT Natural Stone/Wall Adhesive (20 kg Bag)",
    "brand": "UltraTech",
    "oemModelCode": "UT-TF-NT-20",
    "subcategory": "tile-adhesives-block-mortar",
    "type": "Tile Adhesive",
    "chemicalType": "Tile Adhesive",
    "price": 450,
    "mrp": 540,
    "exGstPrice": 381,
    "hsnCode": "3824",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "priceVolatility": "MONTHLY",
    "packSize": "20 kg Bag",
    "unit": "20 kg Bag",
    "requiresUnloadingLabour": true,
    "spec": "IS 15477 Type 3 Certified \u2022 Non-sag formulation for heavy granite, marble, and exterior vertical tile cladding",
    "shortTagline": "Type 3 Heavy Granite, Marble & External Wall Adhesive",
    "specChips": [
      "IS 15477 Type 3",
      "Marble & Granite",
      "Non-Sag Wall",
      "20 kg Bag"
    ],
    "bulkPrice": 430,
    "bulkSlabText": "\u20b9430/bag on 10+ Bags",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 17,
    "vehicleType": "E-Loader",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "ultratech-fixoblock-aac-jointing-40kg",
    "slug": "ultratech-fixoblock-aac-jointing-40kg",
    "name": "UltraTech Fixoblock AAC Block Jointing Adhesive (40 kg Bag)",
    "title": "UltraTech Fixoblock AAC Block Jointing Adhesive (40 kg Bag)",
    "brand": "UltraTech",
    "oemModelCode": "UT-FIXO-40",
    "subcategory": "tile-adhesives-block-mortar",
    "type": "Block Mortar",
    "chemicalType": "AAC Jointing Mortar",
    "price": 380,
    "mrp": 450,
    "exGstPrice": 322,
    "hsnCode": "3824",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "priceVolatility": "MONTHLY",
    "packSize": "40 kg Bag",
    "unit": "40 kg Bag",
    "requiresUnloadingLabour": true,
    "spec": "Thin joint (3mm) polymer mortar \u2022 High tensile splitting strength replacing conventional bulky cement sand mortar",
    "shortTagline": "Thin-Joint High Bond Adhesive for AAC & Fly Ash Blocks",
    "specChips": [
      "3mm Thin Joint",
      "High Tensile",
      "Speed Masonry",
      "40 kg Bag"
    ],
    "bulkPrice": 365,
    "bulkSlabText": "\u20b9365/bag on 20+ Bags",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 16,
    "vehicleType": "E-Loader",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "roff-t01-new-construction-adhesive-20kg",
    "slug": "roff-t01-new-construction-adhesive-20kg",
    "name": "Roff T01 New Construction Tile Adhesive Grey (20 kg Bag)",
    "title": "Roff T01 New Construction Tile Adhesive Grey (20 kg Bag)",
    "brand": "Roff",
    "oemModelCode": "ROFF-T01-20",
    "subcategory": "tile-adhesives-block-mortar",
    "type": "Tile Adhesive",
    "chemicalType": "Tile Adhesive",
    "price": 278,
    "mrp": 330,
    "exGstPrice": 236,
    "hsnCode": "3824",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "priceVolatility": "MONTHLY",
    "packSize": "20 kg Bag",
    "unit": "20 kg Bag",
    "requiresUnloadingLabour": true,
    "spec": "IS 15477 Type 1 Certified \u2022 Pidilite Roff engineered cementitious tile adhesive for fresh floor screeds",
    "shortTagline": "Pidilite Roff Type 1 New Construction Tile Adhesive",
    "specChips": [
      "IS 15477 Type 1",
      "Pidilite Roff",
      "Standard Floor",
      "20 kg Bag"
    ],
    "bulkPrice": 265,
    "bulkSlabText": "\u20b9265/bag on 10+ Bags",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 16,
    "vehicleType": "E-Loader",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "roff-t02-non-skid-tile-adhesive-20kg",
    "slug": "roff-t02-non-skid-tile-adhesive-20kg",
    "name": "Roff T02 Non-Skid Tile Adhesive Grey (20 kg Bag)",
    "title": "Roff T02 Non-Skid Tile Adhesive Grey (20 kg Bag)",
    "brand": "Roff",
    "oemModelCode": "ROFF-T02-20",
    "subcategory": "tile-adhesives-block-mortar",
    "type": "Tile Adhesive",
    "chemicalType": "Tile Adhesive",
    "price": 500,
    "mrp": 600,
    "exGstPrice": 424,
    "hsnCode": "3824",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "priceVolatility": "MONTHLY",
    "packSize": "20 kg Bag",
    "unit": "20 kg Bag",
    "requiresUnloadingLabour": true,
    "spec": "IS 15477 Type 2 Certified \u2022 Thixotropic non-skid performance for vertical wall tiles & vitrified formats",
    "shortTagline": "Pidilite Roff Thixotropic Non-Skid Wall & Floor Adhesive",
    "specChips": [
      "IS 15477 Type 2",
      "Thixotropic Non-Skid",
      "Wall & Floor",
      "20 kg Bag"
    ],
    "bulkPrice": 475,
    "bulkSlabText": "\u20b9475/bag on 10+ Bags",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 17,
    "vehicleType": "E-Loader",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "myk-laticrete-305-floor-adhesive-20kg",
    "slug": "myk-laticrete-305-floor-adhesive-20kg",
    "name": "MYK Laticrete 305 Polymer-Modified Tile Adhesive Grey (20 kg Bag)",
    "title": "MYK Laticrete 305 Polymer-Modified Tile Adhesive Grey (20 kg Bag)",
    "brand": "MYK Laticrete",
    "oemModelCode": "MYK-305-20",
    "subcategory": "tile-adhesives-block-mortar",
    "type": "Tile Adhesive",
    "chemicalType": "Tile Adhesive",
    "price": 285,
    "mrp": 345,
    "exGstPrice": 242,
    "hsnCode": "3824",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "priceVolatility": "MONTHLY",
    "packSize": "20 kg Bag",
    "unit": "20 kg Bag",
    "requiresUnloadingLabour": true,
    "spec": "IS 15477 Type 1 Certified \u2022 Factory blended dry mix polymer mortar for ceramic tile installations",
    "shortTagline": "MYK Laticrete Polymer-Modified Floor & Wall Adhesive",
    "specChips": [
      "IS 15477 Type 1",
      "Global Benchmark",
      "Ceramic & Terracotta",
      "20 kg Bag"
    ],
    "bulkPrice": 272,
    "bulkSlabText": "\u20b9272/bag on 10+ Bags",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 17,
    "vehicleType": "E-Loader",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  },
  {
    "id": "myk-laticrete-315-plus-adhesive-20kg",
    "slug": "myk-laticrete-315-plus-adhesive-20kg",
    "name": "MYK Laticrete 315 Plus Vitrified/Stone Adhesive Grey (20 kg Bag)",
    "title": "MYK Laticrete 315 Plus Vitrified/Stone Adhesive Grey (20 kg Bag)",
    "brand": "MYK Laticrete",
    "oemModelCode": "MYK-315P-20",
    "subcategory": "tile-adhesives-block-mortar",
    "type": "Tile Adhesive",
    "chemicalType": "Tile Adhesive",
    "price": 550,
    "mrp": 650,
    "exGstPrice": 466,
    "hsnCode": "3824",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "priceVolatility": "MONTHLY",
    "packSize": "20 kg Bag",
    "unit": "20 kg Bag",
    "requiresUnloadingLabour": true,
    "spec": "IS 15477 Type 2 Certified \u2022 Heavy polymetric formulation for external wet cladding and vitrified floor slabs",
    "shortTagline": "MYK Laticrete Premium Vitrified & Natural Stone Adhesive",
    "specChips": [
      "IS 15477 Type 2",
      "Heavy Polymer",
      "Vitrified & Stone",
      "20 kg Bag"
    ],
    "bulkPrice": 525,
    "bulkSlabText": "\u20b9525/bag on 10+ Bags",
    "image": "",
    "images": [],
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryTime": "60 Mins Express",
    "inStock": true,
    "discountPct": 15,
    "vehicleType": "E-Loader",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement, TMT Sariya & Chemicals"
  }
];

interface CementCollectionStorefrontProps {
  onOpenDetail?: (product: Product) => void;
  defaultSubcat?: string;
  onBackToDirectory?: () => void;
}

export function CementCollectionStorefront({
  onOpenDetail,
  defaultSubcat,
  onBackToDirectory,
}: CementCollectionStorefrontProps) {
  const [selectedSubcat, setSelectedSubcat] = useState<string>(defaultSubcat || "all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedDiameter, setSelectedDiameter] = useState<string>("all");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedChemicalType, setSelectedChemicalType] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showUnloadingHelper, setShowUnloadingHelper] = useState<boolean>(true);

  // Fallback modal for viewing product details if parent didn't provide onOpenDetail
  const [quickDetailProduct, setQuickDetailProduct] = useState<Product | null>(null);
  const [detailOptions, setDetailOptions] = useState<{ scrollToBulk?: boolean; variantId?: string }>({});

  const queryClient = useQueryClient();
  const { resolveProduct } = useProductMediaVault();
  const { data: cartData } = useGetCart();
  const addToCart = useAddToCart();
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();

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
  const cartItemByKey = useMemo(() => {
    const map = new Map<string, (typeof cartItems)[0]>();
    for (const item of cartItems) {
      if (item.materialId) map.set(item.materialId, item);
      if (item.name) map.set(item.name.toLowerCase(), item);
    }
    return map;
  }, [cartItems]);

  // Site-Engineer Computations from Cart
  const engineerMetrics = useMemo(() => {
    let cementBags = 0;
    let tmtWeightKg = 0;
    let tmtBars = 0;
    let tileAdhesiveBags = 0;

    for (const item of cartItems) {
      const match = ALL_STRUCTURAL_PRODUCTS.find(
        (p) => p.id === item.materialId || p.title.toLowerCase() === (item.name || "").toLowerCase()
      );
      if (match) {
        if (match.subcategory === "cement-white-cement" && match.type !== "White Cement") {
          cementBags += item.quantity;
        }
        if (match.subcategory === "tmt-sariya") {
          tmtBars += item.quantity;
          tmtWeightKg += item.quantity * (match.theoreticalWeightKg || 0);
        }
        if (match.subcategory === "tile-adhesives-block-mortar") {
          tileAdhesiveBags += item.quantity;
        }
      }
    }

    const requiredLwMl = cementBags * 200;
    const requiredBindingWireKg = Math.max(1, Math.round((tmtWeightKg / 1000) * 10));

    return {
      cementBags,
      tmtWeightKg: Math.round(tmtWeightKg * 10) / 10,
      tmtBars,
      tileAdhesiveBags,
      requiredLwMl,
      requiredBindingWireKg,
      needsUnloadingLabour: cementBags >= 5 || tileAdhesiveBags >= 5 || tmtBars >= 10,
    };
  }, [cartItems]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return ALL_STRUCTURAL_PRODUCTS.map((p) => resolveProduct(p)).filter((p) => {
      if (selectedSubcat !== "all" && p.subcategory !== selectedSubcat) return false;
      if (selectedBrand !== "all" && p.brand !== selectedBrand) return false;
      if (tierFilter !== "all" && p.brandTier !== tierFilter) return false;
      if (selectedDiameter !== "all" && p.tmtDiameterMm !== Number(selectedDiameter)) return false;
      if (selectedGrade !== "all" && p.cementGrade !== selectedGrade) return false;
      if (selectedChemicalType !== "all" && p.chemicalType !== selectedChemicalType) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.oemModelCode.toLowerCase().includes(q) ||
          p.hsnCode.includes(q) ||
          (p.spec && p.spec.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [
    selectedSubcat,
    selectedBrand,
    tierFilter,
    selectedDiameter,
    selectedGrade,
    selectedChemicalType,
    searchQuery,
    resolveProduct,
  ]);

  // Unique list of brands in current category
  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    for (const p of ALL_STRUCTURAL_PRODUCTS) {
      if (selectedSubcat === "all" || p.subcategory === selectedSubcat) {
        set.add(p.brand);
      }
    }
    return Array.from(set);
  }, [selectedSubcat]);

  const handleSubcatChange = (id: string) => {
    setSelectedSubcat(id);
    setSelectedBrand("all");
    setSelectedDiameter("all");
    setSelectedGrade("all");
    setSelectedChemicalType("all");
  };

  const handleResetFilters = () => {
    setSelectedBrand("all");
    setTierFilter("all");
    setSelectedDiameter("all");
    setSelectedGrade("all");
    setSelectedChemicalType("all");
    setSearchQuery("");
  };

  // Convert StructuralProduct to Product for detail modal
  const toProductCardType = (p: StructuralProduct): Product => {
    return {
      id: p.id,
      title: p.title,
      name: p.title,
      materialTag: "Cement, TMT Steel & Chemicals",
      price: p.price,
      mrp: p.mrp,
      image: p.image,
      unit: p.unit,
      rating: p.rating,
      reviews: p.reviewsCount,
      deliveryEta: p.deliveryTime,
      vendor: `${p.brand} Lucknow Depot`,
      specs: [
        { label: "HSN Code", value: p.hsnCode },
        { label: "GST Rate", value: `${p.gstPercent}% (Included)` },
        { label: "Base Pre-GST", value: `₹${p.exGstPrice}` },
        { label: "Delivery Vehicle", value: p.deliveryVehicleType },
        { label: "Price Volatility", value: p.priceVolatility },
        ...(p.tmtDiameterMm
          ? [
              { label: "Diameter", value: `${p.tmtDiameterMm}mm` },
              { label: "Bar Length", value: "12 Meters Standard" },
              { label: "Theoretical Weight", value: `${p.theoreticalWeightKg} kg (IS 1786)` },
              { label: "Effective Price", value: `₹${p.effectivePerKgPrice}/kg` },
              { label: "Grade", value: p.tmtGrade || "Fe 500D" },
            ]
          : []),
        ...(p.cementGrade
          ? [
              { label: "Cement Grade", value: p.cementGrade },
              { label: "Type", value: p.cementType || "Portland Cement" },
            ]
          : []),
        ...(p.chemicalType
          ? [
              { label: "Chemical Type", value: p.chemicalType },
              { label: "Dosage", value: p.dosagePerBagCement || "As per spec sheet" },
            ]
          : []),
      ],
    };
  };

  const handleOpenDetailModal = (
    p: StructuralProduct,
    options?: { scrollToBulk?: boolean; variantId?: string }
  ) => {
    const converted = toProductCardType(p);
    if (onOpenDetail) {
      onOpenDetail(converted);
    } else {
      setQuickDetailProduct(converted);
      setDetailOptions(options || {});
    }
  };

  const handleAddToCart = (p: StructuralProduct) => {
    const current = cartItemByKey.get(p.id) || cartItemByKey.get(p.title.toLowerCase());
    if (current) {
      updateCartItem.mutate(
        { itemId: current.id, data: { quantity: current.quantity + 1 } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
            toast.success(`Updated ${p.title} in cart`);
          },
        }
      );
    } else {
      addToCart.mutate(
        {
          data: {
            materialId: p.id,
            quantity: 1,
            name: p.title,
            price: p.price,
            unit: p.unit,
            vendor: `${p.brand} Lucknow Hub`,
            category: "Cement, TMT Sariya & Chemicals",
          },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
            toast.success(`Added ${p.title} to cart`);
          },
        }
      );
    }
  };

  const handleUpdateQty = (p: StructuralProduct, newQty: number) => {
    const current = cartItemByKey.get(p.id) || cartItemByKey.get(p.title.toLowerCase());
    if (newQty <= 0) {
      if (current) {
        removeFromCart.mutate(
          { itemId: current.id },
          {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
              toast.info(`Removed ${p.title} from cart`);
            },
          }
        );
      }
    } else if (current) {
      updateCartItem.mutate(
        { itemId: current.id, data: { quantity: newQty } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          },
        }
      );
    } else {
      handleAddToCart(p);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Category Hero / Header */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#334155] text-white py-6 px-4 sm:px-6 lg:px-8 border-b border-slate-700 shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3" /> 60-Min Express Site Delivery
                </span>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  Lucknow Mandi Wholesale Rates
                </span>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  18% GST Compliant
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Cement, TMT Sariya &amp; Construction Chemicals
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-3xl">
                Direct aggregator dispatch across Transport Nagar, Chinhat, Kanpur Road, Sitapur Road &amp; Shaheed Path. Heavy pickup truck routing for 12m TMT steel and automated site-engineer dosage calculators.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700 p-2.5 rounded-xl text-xs backdrop-blur-sm self-start md:self-auto">
              <div className="text-center px-2 border-r border-slate-700">
                <div className="text-emerald-400 font-bold text-sm">70 SKUs</div>
                <div className="text-slate-400 text-[10px]">Active Catalog</div>
              </div>
              <div className="text-center px-2 border-r border-slate-700">
                <div className="text-blue-400 font-bold text-sm">IS 1786</div>
                <div className="text-slate-400 text-[10px]">TMT Standard</div>
              </div>
              <div className="text-center px-2">
                <div className="text-amber-400 font-bold text-sm">Daily Rates</div>
                <div className="text-slate-400 text-[10px]">Floor Guarded</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subcategory Navigation Pills */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
            {STRUCTURAL_SUBCATEGORIES.map((subcat) => {
              const active = selectedSubcat === subcat.id;
              return (
                <button
                  key={subcat.id}
                  onClick={() => handleSubcatChange(subcat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>{subcat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      active ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {subcat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {/* SITE-ENGINEER SMART RECOMMENDATIONS BANNER (When relevant items are in cart) */}
        {(engineerMetrics.cementBags > 0 ||
          engineerMetrics.tmtBars > 0 ||
          engineerMetrics.tileAdhesiveBags > 0) && (
          <div className="mb-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-blue-950 text-white p-4 rounded-xl border border-emerald-500/30 shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-700/60">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <Scale className="w-4 h-4" />
                </span>
                <span className="text-sm font-bold text-emerald-400">
                  Site-Engineer Smart Co-Loading Assistant
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Zero Extra Delivery Cost • Same Truck Dispatch
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-xs">
              {/* Cement -> Waterproofing Recommendation */}
              {engineerMetrics.cementBags > 0 && (
                <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                  <div className="text-slate-300 font-semibold mb-1 flex items-center justify-between">
                    <span>Integral Waterproofing (LW+)</span>
                    <span className="text-emerald-400 font-bold">
                      {engineerMetrics.cementBags} Bags Carted
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Dosage: 200ml/bag = <strong className="text-white">{engineerMetrics.requiredLwMl} ml</strong> required.
                    {engineerMetrics.cementBags <= 4 ? (
                      <span> Add <strong>Dr. Fixit LW+ 200ml</strong> bottles or 1L can.</span>
                    ) : engineerMetrics.cementBags <= 25 ? (
                      <span> Add <strong>Dr. Fixit 101 LW+ 5L</strong> can for complete coverage.</span>
                    ) : (
                      <span> Add <strong>Dr. Fixit 101 LW+ 20L Drum</strong> for bulk slab casting.</span>
                    )}
                  </p>
                </div>
              )}

              {/* TMT -> Binding Wire Recommendation */}
              {engineerMetrics.tmtBars > 0 && (
                <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                  <div className="text-slate-300 font-semibold mb-1 flex items-center justify-between">
                    <span>Annealed Binding Wire</span>
                    <span className="text-blue-400 font-bold">
                      {engineerMetrics.tmtWeightKg} kg Steel
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Benchmark: ~10 kg wire per ton = <strong className="text-white">~{engineerMetrics.requiredBindingWireKg} kg</strong> required.
                    {engineerMetrics.tmtWeightKg >= 1500 ? (
                      <span> Recommended: <strong>Local ISI 25kg Coil</strong> on same pickup truck.</span>
                    ) : (
                      <span> Recommended: <strong>Tata Wiron 18 SWG (1kg)</strong> soft annealed coils.</span>
                    )}
                  </p>
                </div>
              )}

              {/* Tile Adhesives -> White Cement & Waterproofing */}
              {engineerMetrics.tileAdhesiveBags > 0 && (
                <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                  <div className="text-slate-300 font-semibold mb-1 flex items-center justify-between">
                    <span>Wet-Area Wet Pre-Tiling Kit</span>
                    <span className="text-amber-400 font-bold">
                      {engineerMetrics.tileAdhesiveBags} Bags Tile Mortar
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Recommended: <strong>Birla White 5kg Pack</strong> for substrate priming &amp; <strong>Dr. Fixit 112 Pidifin 2K (3kg/15kg)</strong> for wet bathroom floor waterproofing before tile installation.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* UNLOADING LABOUR HELPER TOGGLE (Protects thin 2%-4% margins) */}
        {engineerMetrics.needsUnloadingLabour && (
          <div className="mb-4 bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-200/60 text-amber-800 rounded-lg">
                <Truck className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-amber-900">
                  Site Unloading Labour Helper (Heavy Materials Protection)
                </h4>
                <p className="text-[11px] text-amber-700">
                  Your cart contains {engineerMetrics.cementBags > 0 ? `${engineerMetrics.cementBags} bags cement` : ""}
                  {engineerMetrics.tmtBars > 0 ? ` + ${engineerMetrics.tmtBars} TMT bars (${engineerMetrics.tmtWeightKg} kg)` : ""}
                  {engineerMetrics.tileAdhesiveBags > 0 ? ` + ${engineerMetrics.tileAdhesiveBags} bags adhesive` : ""}.
                  Ground-floor mechanical unloading included. Add floor-shift porter assistance?
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowUnloadingHelper(!showUnloadingHelper)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                showUnloadingHelper
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-white border border-amber-300 text-amber-800 hover:bg-amber-100"
              }`}
            >
              {showUnloadingHelper ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{showUnloadingHelper ? "Unloading Labour Opted (+₹15/unit)" : "Self-Unload at Ground Floor"}</span>
            </button>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs mb-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="w-full md:w-80 relative">
              <input
                type="text"
                placeholder="Search brand, HSN 2523/7214, Fe 500D..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs px-3 py-2 pl-9 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
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
                <option value="1">Priority 1 (Core Volume)</option>
                <option value="2">Priority 2 (Value / Regional)</option>
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

              {/* TMT Diameter Filter (Shown when in all or tmt-sariya) */}
              {(selectedSubcat === "all" || selectedSubcat === "tmt-sariya") && (
                <select
                  value={selectedDiameter}
                  onChange={(e) => setSelectedDiameter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 cursor-pointer focus:outline-hidden"
                >
                  <option value="all">Diameter (All)</option>
                  <option value="8">8mm (4.74 kg)</option>
                  <option value="10">10mm (7.41 kg)</option>
                  <option value="12">12mm (10.67 kg)</option>
                  <option value="16">16mm (18.96 kg)</option>
                  <option value="20">20mm (29.63 kg)</option>
                </select>
              )}

              {/* Cement Grade Filter */}
              {(selectedSubcat === "all" || selectedSubcat === "cement-white-cement") && (
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 cursor-pointer focus:outline-hidden"
                >
                  <option value="all">Cement Grade (All)</option>
                  <option value="PPC">PPC (Fly Ash)</option>
                  <option value="OPC 43">OPC 43 Grade</option>
                  <option value="OPC 53">OPC 53 Grade</option>
                  <option value="Weather-Shield">Weather-Shield / Water Repellent</option>
                  <option value="White Cement">White Cement</option>
                </select>
              )}

              {/* Reset Button */}
              {(selectedBrand !== "all" ||
                tierFilter !== "all" ||
                selectedDiameter !== "all" ||
                selectedGrade !== "all" ||
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
            <h3 className="text-base font-bold text-slate-700">No matching materials found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try resetting your brand, diameter, or grade filters to browse available Lucknow stockyard inventory.
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
                  className="bg-white rounded-xl border border-slate-200/90 hover:border-slate-400/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Top Badges Strip */}
                  <div className="p-3 pb-0 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      {/* Vehicle Badge */}
                      <span
                        className={`text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-sm flex items-center gap-1 ${
                          p.deliveryVehicleType === "Pickup / Mini-Truck"
                            ? "bg-slate-900 text-amber-300 border border-slate-700"
                            : p.deliveryVehicleType === "E-Loader"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                        }`}
                      >
                        {p.deliveryVehicleType === "Pickup / Mini-Truck" ? (
                          <Truck className="w-3 h-3 text-amber-300" />
                        ) : p.deliveryVehicleType === "E-Loader" ? (
                          <Zap className="w-3 h-3 text-amber-700" />
                        ) : (
                          <Bike className="w-3 h-3 text-emerald-700" />
                        )}
                        {p.deliveryVehicleType}
                      </span>

                      {/* Volatility Badge */}
                      <span
                        className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-sm ${
                          p.priceVolatility === "DAILY"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {p.priceVolatility === "DAILY" ? "Daily Mandi Rate" : "Weekly Rate"}
                      </span>
                    </div>

                    {/* Image Area */}
                    <div
                      onClick={() => handleOpenDetailModal(p)}
                      className="w-full aspect-square bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center p-2 relative cursor-pointer group-hover:scale-[1.02] transition-transform"
                    >
                      <ProductImage
                        product={p}
                        src={p.image}
                        alt={p.title}
                        title={p.title || p.name}
                        brand={p.brand}
                        category={p.categorySlug || p.subcategory || "cement"}
                        sku={p.slug || p.id}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                      {/* Discount Badge */}
                      {p.discountPct > 0 && (
                        <span className="absolute bottom-1.5 left-1.5 bg-emerald-600 text-white text-[9.5px] font-black px-1.5 py-0.5 rounded-xs shadow-xs">
                          {p.discountPct}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-3 pt-2 flex flex-col flex-1 justify-between">
                    <div>
                      {/* Brand & HSN Line */}
                      <div className="flex items-center justify-between text-[10.5px] text-slate-500 font-semibold mb-1">
                        <span className="text-slate-800 font-bold uppercase tracking-wider">
                          {p.brand}
                        </span>
                        <span>HSN {p.hsnCode} • 18% GST</span>
                      </div>

                      {/* Title */}
                      <h3
                        onClick={() => handleOpenDetailModal(p)}
                        className="text-xs sm:text-[13px] font-bold text-slate-900 leading-snug line-clamp-2 cursor-pointer hover:text-emerald-700 transition-colors"
                        title={p.title}
                      >
                        {p.title}
                      </h3>

                      {/* TMT Effective Per Kg or Cement Spec */}
                      {p.effectivePerKgPrice ? (
                        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                          <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[10.5px] font-extrabold px-1.5 py-0.5 rounded-xs">
                            ₹{p.effectivePerKgPrice}/kg Effective
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            (12m Standard • {p.theoreticalWeightKg} kg)
                          </span>
                        </div>
                      ) : p.dosagePerBagCement ? (
                        <div className="mt-1.5 text-[10.5px] text-emerald-800 font-medium bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-xs w-fit">
                          {p.dosagePerBagCement}
                        </div>
                      ) : p.specChips && p.specChips.length > 0 ? (
                        <div className="mt-1.5 flex items-center gap-1 flex-wrap">
                          {p.specChips.slice(0, 2).map((chip, idx) => (
                            <span
                              key={idx}
                              className="bg-slate-100 text-slate-600 text-[9.5px] px-1.5 py-0.2 rounded-xs font-medium"
                            >
                              {chip}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      {/* Bulk Slab Tag */}
                      {p.bulkSlabText && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetailModal(p, { scrollToBulk: true });
                          }}
                          className="mt-1.5 text-[10px] font-bold text-blue-700 bg-blue-50/70 border border-blue-200 px-1.5 py-0.5 rounded-xs flex items-center justify-between cursor-pointer hover:bg-blue-100 transition-colors"
                        >
                          <span>{p.bulkSlabText}</span>
                          <ChevronRight className="w-3 h-3 text-blue-600" />
                        </div>
                      )}
                    </div>

                    {/* Price and Add to Cart Section */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100">
                      <div className="flex items-baseline justify-between mb-1.5">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm sm:text-base font-extrabold text-slate-900">
                            ₹{p.price.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] text-slate-400 line-through">
                            ₹{p.mrp.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">
                          Ex-GST: ₹{p.exGstPrice}
                        </span>
                      </div>

                      {/* Action Button: Stepper or Add */}
                      {cartQty > 0 ? (
                        <div className="flex items-center justify-between border-2 border-emerald-600 bg-emerald-50 rounded-lg p-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateQty(p, cartQty - 1);
                            }}
                            className="w-7 h-7 flex items-center justify-center text-emerald-800 font-bold hover:bg-emerald-200 rounded-sm transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-black text-emerald-900">
                            {cartQty} in Cart
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateQty(p, cartQty + 1);
                            }}
                            className="w-7 h-7 flex items-center justify-center text-emerald-800 font-bold hover:bg-emerald-200 rounded-sm transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(p);
                          }}
                          disabled={addToCart.isPending}
                          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all text-center cursor-pointer shadow-xs hover:shadow-sm"
                        >
                          Add to Site Delivery
                        </button>
                      )}

                      {/* 60 Mins Delivery Tag */}
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 text-emerald-700 font-medium">
                          <Clock className="w-3 h-3 text-emerald-600" /> 60 Mins Express
                        </span>
                        <span>Transport Nagar Hub</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Detail Modal Fallback */}
      {quickDetailProduct && (
        <ProductDetailModal
          product={quickDetailProduct}
          isOpen={true}
          onClose={() => setQuickDetailProduct(null)}
          initialScrollToBulk={detailOptions.scrollToBulk}
          initialVariantId={detailOptions.variantId}
          cartQty={
            cartItemByKey.get(quickDetailProduct.id)?.quantity ??
            cartItemByKey.get(quickDetailProduct.name?.toLowerCase() || "")?.quantity ??
            0
          }
          onSetQty={(p, newQty) => {
            const match = cartItemByKey.get(p.id) || cartItemByKey.get(p.name.toLowerCase());
            if (newQty <= 0) {
              if (match) removeFromCart.mutate({ itemId: match.id });
            } else if (match) {
              updateCartItem.mutate({ itemId: match.id, data: { quantity: newQty } });
            } else {
              addToCart.mutate({
                data: {
                  materialId: p.id,
                  quantity: newQty,
                  name: p.name,
                  price: p.price,
                  unit: p.unit || "Unit",
                  vendor: `${p.vendor || "UltraTech"} Official`,
                  category: "Cement, TMT Sariya & Chemicals",
                },
              });
            }
          }}
          onAddToCart={(p, qty) => {
            const count = qty ?? 1;
            const match = cartItemByKey.get(p.id) || cartItemByKey.get(p.name.toLowerCase());
            if (match) {
              updateCartItem.mutate({
                itemId: match.id,
                data: { quantity: match.quantity + count },
              });
            } else {
              addToCart.mutate({
                data: {
                  materialId: p.id,
                  quantity: count,
                  name: p.name,
                  price: p.price,
                  unit: p.unit || "Unit",
                  vendor: `${p.vendor || "UltraTech"} Official`,
                  category: "Cement, TMT Sariya & Chemicals",
                },
              });
            }
          }}
        />
      )}
    </div>
  );
}
