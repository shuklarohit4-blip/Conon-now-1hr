import React, { useState, useMemo, useEffect } from "react";
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
import { VariantSelectorSheet } from "@/components/VariantSelectorSheet";
import type { Product } from "@/components/ProductCard";

export interface SanitaryProduct {
  id: string;
  title: string;
  brand: string;
  subcategory:
    | "sanitary-sets"
    | "concealed-systems"
    | "wc-flush-plates"
    | "wash-basins-taps"
    | "diverters-shower"
    | "bathroom-fittings-accessories"
    | "urinals";
  type: string;
  price: number;
  bulkPrice?: number;
  mrp: number;
  discountPct: number;
  image: string;
  spec?: string;
  deliveryTime: string;
  optionsCount?: number;
  isSoldOut?: boolean;
  dotsCount: number;
  unit: string;
}

export const SANITARY_BATH_PRODUCTS: SanitaryProduct[] = [
  // ── 1. Sanitary Sets (Matches screenshot 12: home-run.co/collections/complete-sanitary-sets) ──
  {
    id: "jaquar-wc-set-kubix-prime",
    title: "Jaquar WC Set (Kubix Prime)",
    brand: "Jaquar",
    subcategory: "sanitary-sets",
    type: "WC Set",
    price: 23702,
    mrp: 28500,
    discountPct: 0,
    image: "/images/products/sanitary/jaquar-wc-set-kubix-prime.webp",
    spec: "Slim 122 mm | Rimless WC",
    deliveryTime: "60 Mins",
    isSoldOut: true,
    dotsCount: 4,
    unit: "Set",
  },
  {
    id: "jaquar-wc-set-continental-series",
    title: "Jaquar WC Set (Continental Series)",
    brand: "Jaquar",
    subcategory: "sanitary-sets",
    type: "WC Set",
    price: 21508,
    mrp: 25900,
    discountPct: 17,
    image: "/images/products/sanitary/jaquar-wc-set-continental-series.webp",
    spec: "5-Piece Kit | Dual Flush 3/6 L",
    deliveryTime: "60 Mins",
    isSoldOut: true,
    dotsCount: 4,
    unit: "Set",
  },
  {
    id: "jaquar-wc-set-laguna-series",
    title: "Jaquar WC Set (Laguna Series)",
    brand: "Jaquar",
    subcategory: "sanitary-sets",
    type: "WC Set",
    price: 29346,
    mrp: 35400,
    discountPct: 17,
    image: "/images/products/sanitary/jaquar-wc-set-laguna-series.webp",
    spec: "5-Piece Kit | Dual Flush 3/6 L",
    deliveryTime: "60 Mins",
    isSoldOut: true,
    dotsCount: 4,
    unit: "Set",
  },

  // ── 2. Concealed Systems ──
  {
    id: "jaquar-concealed-cistern-body",
    title: "Jaquar Concealed Cistern Frame & Tank, Pneumatic Dual Flush",
    brand: "Jaquar",
    subcategory: "concealed-systems",
    type: "Concealed Cistern",
    price: 4850,
    bulkPrice: 4650,
    mrp: 6500,
    discountPct: 25,
    image: "/images/products/sanitary/jaquar-concealed-cistern-body.webp",
    spec: "Heavy Duty Frame | Dual Flush",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Unit",
  },
  {
    id: "jaquar-premium-concealed-cistern-flush-plate-cs",
    title: "Jaquar Premium Concealed Cistern Control Flush Plate, Chrome",
    brand: "Jaquar",
    subcategory: "concealed-systems",
    type: "Flush Plate",
    price: 1302,
    mrp: 1675,
    discountPct: 22,
    image: "/images/products/sanitary/jaquar-premium-concealed-cistern-flush-plate.webp",
    spec: "Dual Flush | Mirror Chrome",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "cera-actuator-knob-q-type-cs",
    title: "CERA Actuator knob, Q Type shine finish - B1120104",
    brand: "CERA",
    subcategory: "concealed-systems",
    type: "Actuator Knob",
    price: 1144,
    mrp: 1760,
    discountPct: 35,
    image: "/images/products/sanitary/cera-actuator-knob-q-type.webp",
    spec: "Service Access | Chrome",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "cera-actuator-knob-m-type-cs",
    title: "CERA Actuator knob, M Type shine finish - B1120102",
    brand: "CERA",
    subcategory: "concealed-systems",
    type: "Actuator Knob",
    price: 1144,
    mrp: 1760,
    discountPct: 35,
    image: "/images/products/sanitary/cera-actuator-knob-m-type.webp",
    spec: "Service Access | Chrome",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },

  // ── 3. WC & Flush Plates (Matches screenshot 11: home-run.co/collections/wc-concealed-cisterns) ──
  {
    id: "jaquar-wc-continental-series",
    title: "Jaquar WC Continental Series, CNS-WHT-963UFSM",
    brand: "Jaquar",
    subcategory: "wc-flush-plates",
    type: "Wall Hung WC",
    price: 7920,
    bulkPrice: 7650,
    mrp: 10560,
    discountPct: 25,
    image: "/images/products/sanitary/jaquar-wc-continental-series.webp",
    spec: "Fits All Tanks | Rimless Design",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "jaquar-wc-laguna-series",
    title: "Jaquar WC, Laguna, LAS-WHT-91953BIUFSM",
    brand: "Jaquar",
    subcategory: "wc-flush-plates",
    type: "Wall Hung WC",
    price: 14608,
    bulkPrice: 14110,
    mrp: 19220,
    discountPct: 24,
    image: "/images/products/sanitary/jaquar-wc-laguna-series.webp",
    spec: "Fits All Tanks | Soft Close Seat",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "parryware-cruz-wall-mounted-wc",
    title: "Parryware Cruz C8675 Wall Mounted White Closet WC",
    brand: "Parryware",
    subcategory: "wc-flush-plates",
    type: "Wall Hung WC",
    price: 8428,
    mrp: 17930,
    discountPct: 53,
    image: "/images/products/sanitary/parryware-cruz-wall-mounted-wc.webp",
    spec: "Fits All Tanks | Wall Hung WC",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "jaquar-continental-rimless-single-piece-wc",
    title: "Jaquar Continental Series Rimless Single Piece WC, Round Shape, White, CNS-WHT-853S220SPPSMY",
    brand: "Jaquar",
    subcategory: "wc-flush-plates",
    type: "Single Piece WC",
    price: 12556,
    mrp: 14600,
    discountPct: 14,
    image: "/images/products/sanitary/jaquar-continental-rimless-single-piece-wc.webp",
    spec: "Fits All Tanks | Rimless Design",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "jaquar-premium-concealed-cistern-flush-plate",
    title: "Jaquar Premium Concealed Cistern Control Flush Plate, Chrome",
    brand: "Jaquar",
    subcategory: "wc-flush-plates",
    type: "Flush Plate",
    price: 1302,
    mrp: 1675,
    discountPct: 22,
    image: "/images/products/sanitary/jaquar-premium-concealed-cistern-flush-plate.webp",
    spec: "Dual Flush | Chrome",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "cera-actuator-knob-q-type",
    title: "CERA Actuator knob, Q Type shine finish - B1120104",
    brand: "CERA",
    subcategory: "wc-flush-plates",
    type: "Actuator Knob",
    price: 1144,
    mrp: 1760,
    discountPct: 35,
    image: "/images/products/sanitary/cera-actuator-knob-q-type.webp",
    spec: "Service Access",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "cera-actuator-knob-m-type",
    title: "CERA Actuator knob, M Type shine finish - B1120102",
    brand: "CERA",
    subcategory: "wc-flush-plates",
    type: "Actuator Knob",
    price: 1144,
    mrp: 1760,
    discountPct: 35,
    image: "/images/products/sanitary/cera-actuator-knob-m-type.webp",
    spec: "Service Access",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },

  // ── 4. Wash Basins & Taps (Matches screenshots 4 & 3: home-run.co/collections/wash-basins-faucets-1) ──
  {
    id: "jaquar-thin-rim-table-top-basin",
    title: "Jaquar Thin Rim Table Top Basin, Rectangular | White, 495x395x150mm | JDS-WHT-25909",
    brand: "Jaquar",
    subcategory: "wash-basins-taps",
    type: "Table Top Basin",
    price: 3520,
    bulkPrice: 3400,
    mrp: 4630,
    discountPct: 24,
    image: "/images/products/sanitary/jaquar-thin-rim-table-top-basin.webp",
    spec: "Needs tall tap",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "jaquar-continental-table-top-basin",
    title: "Jaquar Continental Table Top Basin | White, 425x340x175mm | CNS-WHT-903",
    brand: "Jaquar",
    subcategory: "wash-basins-taps",
    type: "Table Top Basin",
    price: 2070,
    bulkPrice: 1978,
    mrp: 2690,
    discountPct: 23,
    image: "/images/products/sanitary/jaquar-continental-table-top-basin.webp",
    spec: "Needs tall tap",
    deliveryTime: "60 Mins",
    isSoldOut: true,
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "jaquar-white-table-top-washbasin-laguna",
    title: "Jaquar white table top washbasin, Laguna (White), LAS-WHT-91905",
    brand: "Jaquar",
    subcategory: "wash-basins-taps",
    type: "Table Top Basin",
    price: 6424,
    bulkPrice: 6205,
    mrp: 8450,
    discountPct: 24,
    image: "/images/products/sanitary/jaquar-white-table-top-washbasin-laguna.webp",
    spec: "Vertical Outlet",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "parryware-vallure-tabletop-basin",
    title: "Parryware Vallure Tabletop Ceramic Bowl Basin - C04621C",
    brand: "Parryware",
    subcategory: "wash-basins-taps",
    type: "Table Top Basin",
    price: 1800,
    mrp: 2610,
    discountPct: 31,
    image: "/images/products/sanitary/parryware-vallure-tabletop-basin.webp",
    spec: "Vitreous china | Deep oval bowl",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "parryware-jordon-tabletop-basin",
    title: "Parryware Jordon Tabletop Ceramic Bowl Basin - C895V46",
    brand: "Parryware",
    subcategory: "wash-basins-taps",
    type: "Table Top Basin",
    price: 3700,
    mrp: 5520,
    discountPct: 33,
    image: "/images/products/sanitary/parryware-jordon-tabletop-basin.webp",
    spec: "Vitreous china | Rounded rectangle",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "parryware-rombi-tabletop-basin",
    title: "Parryware Rombi Tabletop Ceramic Bowl Basin - C894A46",
    brand: "Parryware",
    subcategory: "wash-basins-taps",
    type: "Table Top Basin",
    price: 5100,
    mrp: 7500,
    discountPct: 32,
    image: "/images/products/sanitary/parryware-rombi-tabletop-basin.webp",
    spec: "Vitreous china | Curved square",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "cera-careo-tabletop-washbasin",
    title: "CERA Careo Table Top / Wall Hung Ceramic Wash Basin, S2040207",
    brand: "CERA",
    subcategory: "wash-basins-taps",
    type: "Wash Basin",
    price: 1432,
    mrp: 1790,
    discountPct: 20,
    image: "/images/products/sanitary/cera-careo-tabletop-washbasin.webp",
    spec: "Table Top / Wall Hung",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "jaquar-florentine-prime-basin-mixer",
    title: "Jaquar Florentine Prime Basin Mixer",
    brand: "Jaquar",
    subcategory: "wash-basins-taps",
    type: "Basin Mixer",
    price: 4356,
    mrp: 5650,
    discountPct: 23,
    image: "/images/products/sanitary/jaquar-florentine-prime-basin-mixer.webp",
    spec: "Cast brass body",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "cera-victor-pillar-cock",
    title: "Cera Victor Pillar Cock with Aerator, F1015101",
    brand: "CERA",
    subcategory: "wash-basins-taps",
    type: "Pillar Cock",
    price: 1683,
    mrp: 1830,
    discountPct: 8,
    image: "/images/products/sanitary/cera-victor-pillar-cock.webp",
    spec: "Mirror Chrome",
    deliveryTime: "60 Mins",
    isSoldOut: true,
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "essco-32mm-bottle-trap",
    title: "Essco Fully Casted 32mm Bottle Trap with Connecting Pipes",
    brand: "Essco by Jaquar",
    subcategory: "wash-basins-taps",
    type: "Bottle Trap",
    price: 1532,
    mrp: 1800,
    discountPct: 15,
    image: "/images/products/sanitary/essco-32mm-bottle-trap.webp",
    spec: "190/300 mm pipe",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    dotsCount: 3,
    unit: "Piece",
  },
  {
    id: "jaquar-kubix-prime-basin-mixer",
    title: "Jaquar Kubix Prime Wall Mounted Single Lever Basin Mixer - KUP-CHR-35233NKPM",
    brand: "Jaquar",
    subcategory: "wash-basins-taps",
    type: "Basin Mixer",
    price: 4374,
    bulkPrice: 4225,
    mrp: 5830,
    discountPct: 25,
    image: "/images/products/sanitary/jaquar-kubix-prime-basin-mixer.webp",
    spec: "WRAS & ACS",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "jaquar-fusion-basin-mixer",
    title: "Jaquar Fusion Wall Mounted Single Lever Basin Mixer, FUS-CHR-29233NK",
    brand: "Jaquar",
    subcategory: "wash-basins-taps",
    type: "Basin Mixer",
    price: 2816,
    bulkPrice: 2720,
    mrp: 3705,
    discountPct: 24,
    image: "/images/products/sanitary/jaquar-fusion-basin-mixer.webp",
    spec: "WRAS/ACS Aerator",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },

  // ── 5. Diverters & Shower (Matches screenshots 1, 5, 6: home-run.co/collections/mixers-diverters-shower) ──
  {
    id: "jaquar-maze-hand-shower-square",
    title: "Jaquar Maze Hand Shower - 120mm Square Multi-Flow, ABS Body with Cascade Effect, HSH-CHR-1655",
    brand: "Jaquar",
    subcategory: "diverters-shower",
    type: "Hand Shower",
    price: 1822,
    bulkPrice: 1760,
    mrp: 2375,
    discountPct: 0,
    image: "/images/products/sanitary/jaquar-maze-hand-shower-square.webp",
    spec: "Chrome finish",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "jaquar-maze-hand-shower-rectangular",
    title: "Jaquar Maze Hand Shower - 120mm Rectangular Multi-Flow, ABS Body with Cascade Effect, HSH-CHR-...",
    brand: "Jaquar",
    subcategory: "diverters-shower",
    type: "Hand Shower",
    price: 1728,
    bulkPrice: 1651,
    mrp: 2220,
    discountPct: 0,
    image: "/images/products/sanitary/jaquar-maze-hand-shower-rectangular.webp",
    spec: "Regal design",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "jaquar-kubix-prime-diverter-exposed-kit",
    title: "Jaquar Kubix Prime High-Flow Single Lever Diverter Exposed Parts Kit - Chrome, KUP-CHR-35079NKPM",
    brand: "Jaquar",
    subcategory: "diverters-shower",
    type: "Diverter Kit",
    price: 2209,
    bulkPrice: 2134,
    mrp: 2825,
    discountPct: 0,
    image: "/images/products/sanitary/jaquar-kubix-prime-diverter-exposed-kit.webp",
    spec: "Brass build",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Kit",
  },
  {
    id: "jaquar-opal-prime-diverter-exposed-kit",
    title: "Jaquar Opal Prime High-Flow Single Lever Diverter Exposed Parts Kit - Chrome, OPP-CHR-15079NKPM",
    brand: "Jaquar",
    subcategory: "diverters-shower",
    type: "Diverter Kit",
    price: 1971,
    bulkPrice: 1904,
    mrp: 2600,
    discountPct: 0,
    image: "/images/products/sanitary/jaquar-opal-prime-diverter-exposed-kit.webp",
    spec: "Brass build",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Kit",
  },
  {
    id: "jaquar-alive-diverter-exposed-kit",
    title: "Jaquar Alive High-Flow Single Lever Diverter Exposed Parts Kit - Chrome, ALI-CHR-85079NK",
    brand: "Jaquar",
    subcategory: "diverters-shower",
    type: "Diverter Kit",
    price: 2112,
    bulkPrice: 2040,
    mrp: 2815,
    discountPct: 25,
    image: "/images/products/sanitary/jaquar-alive-diverter-exposed-kit.webp",
    spec: "Brass build",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Kit",
  },
  {
    id: "jaquar-opal-prime-bathtub-spout",
    title: "Jaquar Opal Prime Premium Wall Mounted Bathtub Spout with Wall Flange - Chrome, SPJ-CHR-...",
    brand: "Jaquar",
    subcategory: "diverters-shower",
    type: "Bathtub Spout",
    price: 1892,
    bulkPrice: 1828,
    mrp: 2455,
    discountPct: 23,
    image: "/images/products/sanitary/jaquar-opal-prime-bathtub-spout.webp",
    spec: "Tested 16 bar",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "jaquar-kubix-prime-bathtub-spout",
    title: "Jaquar Kubix Prime Premium Wall Mounted Bathtub Spout with Wall Flange - Chrome, SPJ-CHR-...",
    brand: "Jaquar",
    subcategory: "diverters-shower",
    type: "Bathtub Spout",
    price: 2068,
    bulkPrice: 1998,
    mrp: 2685,
    discountPct: 23,
    image: "/images/products/sanitary/jaquar-kubix-prime-bathtub-spout.webp",
    spec: "Tested 16 bar",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "jaquar-alive-bathtub-spout",
    title: "Jaquar Alive Premium Wall Mounted Bathtub Spout with Wall Flange - Chrome, SPJ-CHR-85429",
    brand: "Jaquar",
    subcategory: "diverters-shower",
    type: "Bathtub Spout",
    price: 2772,
    bulkPrice: 2678,
    mrp: 3600,
    discountPct: 23,
    image: "/images/products/sanitary/jaquar-alive-bathtub-spout.webp",
    spec: "Tested 16 bar",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "cera-overhead-shower-125x125",
    title: "CERA Overhead shower 125 x 125 mm (5\" x 5\") with 200 mm (8\") long shower arm and wall flange",
    brand: "CERA",
    subcategory: "diverters-shower",
    type: "Overhead Shower",
    price: 1419,
    mrp: 1670,
    discountPct: 15,
    image: "/images/products/sanitary/cera-overhead-shower-125x125.webp",
    spec: "Soft spray",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "jaquar-abs-overhead-shower",
    title: "Jaquar ABS Overhead Shower",
    brand: "Jaquar",
    subcategory: "diverters-shower",
    type: "Overhead Shower",
    price: 1382,
    mrp: 1775,
    discountPct: 22,
    image: "/images/products/sanitary/jaquar-abs-overhead-shower.webp",
    spec: "Single Flow",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "jaquar-shower-arm",
    title: "Jaquar Shower Arm",
    brand: "Jaquar",
    subcategory: "diverters-shower",
    type: "Shower Arm",
    price: 898,
    mrp: 1175,
    discountPct: 24,
    image: "/images/products/sanitary/jaquar-shower-arm.webp",
    spec: "1/2\" BSP",
    deliveryTime: "60 Mins",
    optionsCount: 3,
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "cera-abs-overhead-rain-shower-square",
    title: "Cera ABS Overhead Rain Shower - Square, F7010115AB",
    brand: "CERA",
    subcategory: "diverters-shower",
    type: "Rain Shower",
    price: 897,
    mrp: 1380,
    discountPct: 35,
    image: "/images/products/sanitary/cera-abs-overhead-rain-shower-square.webp",
    spec: "Mirror chrome",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "jaquar-diverter-plate",
    title: "Jaquar Diverter Plate",
    brand: "Jaquar",
    subcategory: "diverters-shower",
    type: "Diverter Plate",
    price: 1602,
    mrp: 2110,
    discountPct: 24,
    image: "/images/products/sanitary/jaquar-diverter-plate.webp",
    spec: "0.5 - 5 bar",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "jaquar-aquamax-single-lever-shower-mixer",
    title: "Jaquar Aquamax Single Lever Shower Mixer Exposed Kit, 3-Way Diverter, Chrome Finish",
    brand: "Jaquar",
    subcategory: "diverters-shower",
    type: "Shower Mixer",
    price: 3502,
    bulkPrice: 3383,
    mrp: 4670,
    discountPct: 25,
    image: "/images/products/sanitary/jaquar-aquamax-single-lever-shower-mixer.webp",
    spec: "Chrome Finish",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Kit",
  },
  {
    id: "jaquar-aquamax-thermostatic-shower-mixer",
    title: "Jaquar Aquamax Thermostatic Shower Mixer",
    brand: "Jaquar",
    subcategory: "diverters-shower",
    type: "Thermostatic Mixer",
    price: 4488,
    mrp: 5830,
    discountPct: 23,
    image: "/images/products/sanitary/jaquar-aquamax-thermostatic-shower-mixer.webp",
    spec: "Kubix/Opal/Alive",
    deliveryTime: "60 Mins",
    optionsCount: 3,
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "jaquar-florentine-prime-wall-mixer",
    title: "Jaquar Florentine Prime Wall Mixer with Shower Provision, Chrome, FLP-CHR-5273PM",
    brand: "Jaquar",
    subcategory: "diverters-shower",
    type: "Wall Mixer",
    price: 6600,
    bulkPrice: 6375,
    mrp: 8460,
    discountPct: 22,
    image: "/images/products/sanitary/jaquar-florentine-prime-wall-mixer.webp",
    spec: "115 mm Bend Pipe",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },

  // ── 6. Bathroom Fittings & Accessories (Matches screenshots 2, 7, 10: home-run.co/collections/bathroom-fittings-accessories) ──
  {
    id: "cera-bottle-trap",
    title: "CERA Bottle Trap",
    brand: "CERA",
    subcategory: "bathroom-fittings-accessories",
    type: "Bottle Trap",
    price: 2016,
    mrp: 2240,
    discountPct: 0,
    image: "/images/products/sanitary/cera-bottle-trap.webp",
    spec: "Unscrews clean",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "jaquar-florentine-prime-2-way-bib-cock",
    title: "Jaquar Florentine Prime 2 Way Bib Cock with Wall Flange, FLP-CHR-5041PM",
    brand: "Jaquar",
    subcategory: "bathroom-fittings-accessories",
    type: "Bib Cock",
    price: 2086,
    bulkPrice: 2015,
    mrp: 2675,
    discountPct: 0,
    image: "/images/products/sanitary/jaquar-florentine-prime-2-way-bib-cock.webp",
    spec: "Tested 16 bar",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "cera-garnet-bib-cock",
    title: "Cera Garnet Bib Cock with Wall Flange and Nozzle, F2002153",
    brand: "CERA",
    subcategory: "bathroom-fittings-accessories",
    type: "Bib Cock",
    price: 1260,
    mrp: 1400,
    discountPct: 0,
    image: "/images/products/sanitary/cera-garnet-bib-cock.webp",
    spec: "Mirror Chrome",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "jaquar-towel-ring-chrome",
    title: "Jaquar Towel Ring, Chrome",
    brand: "Jaquar",
    subcategory: "bathroom-fittings-accessories",
    type: "Towel Ring",
    price: 1026,
    mrp: 1300,
    discountPct: 0,
    image: "/images/products/sanitary/jaquar-towel-ring-chrome.webp",
    spec: "210 × 160 mm",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "jaquar-single-towel-rail-600mm",
    title: "Jaquar Single Towel Rail 600mm, Stainless Steel Chrome",
    brand: "Jaquar",
    subcategory: "bathroom-fittings-accessories",
    type: "Towel Rail",
    price: 1305,
    mrp: 1630,
    discountPct: 20,
    image: "/images/products/sanitary/jaquar-single-towel-rail-600mm.webp",
    spec: "SS 304 Grade",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "jaquar-toilet-roll-holder",
    title: "Jaquar Toilet Roll Holder with Stainless Steel Flap, Chrome",
    brand: "Jaquar",
    subcategory: "bathroom-fittings-accessories",
    type: "Toilet Roll Holder",
    price: 1260,
    mrp: 1575,
    discountPct: 20,
    image: "/images/products/sanitary/jaquar-toilet-roll-holder.webp",
    spec: "With flap shield",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "jaquar-continental-soap-dish-holder",
    title: "Jaquar Continental Soap Dish Holder, ACN-CHR-1131N",
    brand: "Jaquar",
    subcategory: "bathroom-fittings-accessories",
    type: "Soap Dish Holder",
    price: 702,
    bulkPrice: 671,
    mrp: 900,
    discountPct: 22,
    image: "/images/products/sanitary/jaquar-continental-soap-dish-holder.webp",
    spec: "Mirror Chrome",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "futura-linear-floor-drain",
    title: "Futura NW-021A Stainless Steel Tile Insert Linear Floor Drain, 4\" x 31 1/2\"",
    brand: "Futura",
    subcategory: "bathroom-fittings-accessories",
    type: "Floor Drain",
    price: 4840,
    mrp: 6050,
    discountPct: 20,
    image: "/images/products/sanitary/futura-linear-floor-drain.webp",
    spec: "Lift-out tray",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "jaquar-abs-health-faucet",
    title: "Jaquar ABS Health Faucet, ALD-CHR-573",
    brand: "Jaquar",
    subcategory: "bathroom-fittings-accessories",
    type: "Health Faucet",
    price: 1443,
    bulkPrice: 1394,
    mrp: 1875,
    discountPct: 23,
    image: "/images/products/sanitary/jaquar-abs-health-faucet.webp",
    spec: "1 m hose + hook",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "essco-abs-health-faucet",
    title: "Essco ABS Health Faucet with 1m Tube & Wall Hook (Chrome)",
    brand: "Essco by Jaquar",
    subcategory: "bathroom-fittings-accessories",
    type: "Health Faucet",
    price: 799,
    mrp: 1000,
    discountPct: 20,
    image: "/images/products/sanitary/essco-abs-health-faucet.webp",
    spec: "PVC/flex hose",
    deliveryTime: "60 Mins",
    optionsCount: 3,
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "cera-health-faucet-abs",
    title: "Cera Health Faucet ABS Body, F8030104",
    brand: "CERA",
    subcategory: "bathroom-fittings-accessories",
    type: "Health Faucet",
    price: 800,
    mrp: 980,
    discountPct: 18,
    image: "/images/products/sanitary/cera-health-faucet-abs.webp",
    spec: "1-yr warranty",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "jaquar-florentine-prime-angular-stop-cock",
    title: "Jaquar Florentine Prime Angular Stop Cock, FLP-CHR-5053PM",
    brand: "Jaquar",
    subcategory: "bathroom-fittings-accessories",
    type: "Stop Cock",
    price: 1091,
    bulkPrice: 1054,
    mrp: 1400,
    discountPct: 22,
    image: "/images/products/sanitary/jaquar-florentine-prime-angular-stop-cock.webp",
    spec: "Quarter turn",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "essco-stainless-steel-wall-hook",
    title: "Essco Stainless Steel Bathroom Wall Hook",
    brand: "Essco by Jaquar",
    subcategory: "bathroom-fittings-accessories",
    type: "Robe Hook",
    price: 458,
    mrp: 570,
    discountPct: 20,
    image: "/images/products/sanitary/essco-stainless-steel-wall-hook.webp",
    spec: "Mirror Chrome",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "cera-waste-coupling",
    title: "CERA Waste Coupling",
    brand: "CERA",
    subcategory: "bathroom-fittings-accessories",
    type: "Waste Coupling",
    price: 670,
    mrp: 800,
    discountPct: 0,
    image: "/images/products/sanitary/cera-waste-coupling.webp",
    spec: "Seals Basin",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "essco-brass-waste-coupling",
    title: "Essco Brass Waste Coupling",
    brand: "Essco by Jaquar",
    subcategory: "bathroom-fittings-accessories",
    type: "Waste Coupling",
    price: 550,
    mrp: 650,
    discountPct: 15,
    image: "/images/products/sanitary/essco-brass-waste-coupling.webp",
    spec: "32 & 40 mm",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "jaquar-florentine-prime-stop-cock",
    title: "Jaquar Florentine Prime Stop Cock & Flush Cock, FLP-CHR-5083KPM",
    brand: "Jaquar",
    subcategory: "bathroom-fittings-accessories",
    type: "Stop Cock",
    price: 558,
    bulkPrice: 527,
    mrp: 700,
    discountPct: 20,
    image: "/images/products/sanitary/jaquar-florentine-prime-stop-cock.webp",
    spec: "75-150 mm walls",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "futura-deluxe-round-grating",
    title: "Futura Deluxe Round Frame Grating",
    brand: "Futura",
    subcategory: "bathroom-fittings-accessories",
    type: "Floor Grating",
    price: 128,
    mrp: 160,
    discountPct: 20,
    image: "/images/products/sanitary/futura-deluxe-round-grating.webp",
    spec: "Drop-in fit",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "jaquar-florentine-prime-waste-coupling",
    title: "Jaquar Florentine Prime Waste Coupling",
    brand: "Jaquar",
    subcategory: "bathroom-fittings-accessories",
    type: "Waste Coupling",
    price: 747,
    mrp: 925,
    discountPct: 19,
    image: "/images/products/sanitary/jaquar-florentine-prime-waste-coupling.webp",
    spec: "Full thread",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "jaquar-shower-flexible-tube",
    title: "Jaquar Shower Flexible Tube",
    brand: "Jaquar",
    subcategory: "bathroom-fittings-accessories",
    type: "Shower Tube",
    price: 827,
    mrp: 1100,
    discountPct: 25,
    image: "/images/products/sanitary/jaquar-shower-flexible-tube.webp",
    spec: "Brass nuts",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },

  // ── 7. Urinals (Matches screenshot 8: home-run.co/collections/urinals) ──
  {
    id: "jaquar-urinal-without-sensor",
    title: "Jaquar Urinal Without Sensor With Fixing Accessories, URS-WHT-13255",
    brand: "Jaquar",
    subcategory: "urinals",
    type: "Urinal",
    price: 9350,
    bulkPrice: 9130,
    mrp: 12650,
    discountPct: 26,
    image: "/images/products/sanitary/jaquar-urinal-without-sensor.webp",
    spec: "Sensor flushing",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "jaquar-urinal-with-fixing-accessories",
    title: "Jaquar Urinal With Fixing Accessories, URS-WHT-13261",
    brand: "Jaquar",
    subcategory: "urinals",
    type: "Urinal",
    price: 3230,
    bulkPrice: 3154,
    mrp: 4430,
    discountPct: 27,
    image: "/images/products/sanitary/jaquar-urinal-with-fixing-accessories.webp",
    spec: "Wall-mounted",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "kohinoor-sink-waste-pvc-pipe",
    title: "Kohinoor Sink Waste PVC Pipe, 32mm",
    brand: "Kohinoor",
    subcategory: "urinals",
    type: "Waste Pipe",
    price: 125,
    mrp: 150,
    discountPct: 17,
    image: "/images/products/sanitary/kohinoor-sink-waste-pvc-pipe.webp",
    spec: "Kink-free 50 mm",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "futura-waste-pipe-flexible-pvc",
    title: "Futura Waste Pipe | Flexible PVC, Heavy Duty, With PVC Chuck Nut",
    brand: "Futura",
    subcategory: "urinals",
    type: "Waste Pipe",
    price: 58.5,
    mrp: 65,
    discountPct: 10,
    image: "/images/products/sanitary/futura-waste-pipe-flexible-pvc.webp",
    spec: "Heavy Duty",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "futura-waste-coupling-ft-brass",
    title: "Futura Waste Coupling | FT Brass, 1 x 1¼\" - 3.5\", NW-032A",
    brand: "Futura",
    subcategory: "urinals",
    type: "Waste Coupling",
    price: 472.5,
    mrp: 525,
    discountPct: 10,
    image: "/images/products/sanitary/futura-waste-coupling-ft-brass.webp",
    spec: "1 x 1¼\" - 3.5\"",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
  {
    id: "essco-brass-waste-coupling-urinal",
    title: "Essco Brass Waste Coupling",
    brand: "Essco by Jaquar",
    subcategory: "urinals",
    type: "Waste Coupling",
    price: 550,
    mrp: 650,
    discountPct: 15,
    image: "/images/products/sanitary/essco-brass-waste-coupling-urinal.webp",
    spec: "32 & 40 mm",
    deliveryTime: "60 Mins",
    dotsCount: 4,
    unit: "Piece",
  },
];

interface SanitaryBathCollectionStorefrontProps {
  onOpenDetail?: (product: Product) => void;
  defaultSubcategory?: string;
}

export function SanitaryBathCollectionStorefront({
  onOpenDetail,
  defaultSubcategory = "sanitary-sets",
}: SanitaryBathCollectionStorefrontProps) {
  const [activeSubcategory, setActiveSubcategory] =
    useState<string>(defaultSubcategory);
  const [quickDetailProduct, setQuickDetailProduct] = useState<Product | null>(
    null,
  );
  const [variantProduct, setVariantProduct] = useState<any | null>(null);

  // Sync with URL path on load or popstate
  useEffect(() => {
    const p = window.location.pathname.toLowerCase();
    if (p.includes("complete-sanitary-sets") || p.includes("sanitary-sets")) {
      setActiveSubcategory("sanitary-sets");
    } else if (p.includes("wc-concealed-cisterns") || p.includes("wc") || p.includes("flush-plates")) {
      setActiveSubcategory("wc-flush-plates");
    } else if (p.includes("concealed-systems") || p.includes("concealed")) {
      setActiveSubcategory("concealed-systems");
    } else if (p.includes("wash-basins") || p.includes("basin") || p.includes("taps")) {
      setActiveSubcategory("wash-basins-taps");
    } else if (p.includes("mixers-diverters-shower") || p.includes("shower") || p.includes("diverter")) {
      setActiveSubcategory("diverters-shower");
    } else if (p.includes("bathroom-fittings-accessories") || p.includes("accessories") || p.includes("fittings")) {
      setActiveSubcategory("bathroom-fittings-accessories");
    } else if (p.includes("urinals") || p.includes("urinal")) {
      setActiveSubcategory("urinals");
    }
  }, []);

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

  const handleAddToCart = (p: SanitaryProduct) => {
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

  const handleUpdateQty = (p: SanitaryProduct, newQty: number) => {
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
      id: "sanitary-sets",
      label: "Sanitary Sets",
      icon: "/images/subcategories/sanitary-sets-icon.webp",
      route: "/collections/complete-sanitary-sets",
    },
    {
      id: "concealed-systems",
      label: "Concealed systems",
      icon: "/images/subcategories/concealed-systems-icon.webp",
      route: "/collections/concealed-systems",
    },
    {
      id: "wc-flush-plates",
      label: "WC & Flush plates",
      icon: "/images/subcategories/wc-flush-plates-icon.webp",
      route: "/collections/wc-concealed-cisterns",
    },
    {
      id: "wash-basins-taps",
      label: "Wash Basins & Taps",
      icon: "/images/subcategories/wash-basins-taps-icon.webp",
      route: "/collections/wash-basins-faucets-1",
    },
    {
      id: "diverters-shower",
      label: "Diverters & Shower",
      icon: "/images/subcategories/diverters-shower-icon.webp",
      route: "/collections/mixers-diverters-shower",
    },
    {
      id: "bathroom-fittings-accessories",
      label: "Bathroom Fittings & Accessories",
      icon: "/images/subcategories/bathroom-fittings-accessories-icon.webp",
      route: "/collections/bathroom-fittings-accessories",
    },
    {
      id: "urinals",
      label: "Urinals",
      icon: "/images/subcategories/urinals-icon.webp",
      route: "/collections/urinals",
    },
  ];

  const currentSubcat = useMemo(() => {
    return (
      subcategories.find((s) => s.id === activeSubcategory) || subcategories[0]
    );
  }, [activeSubcategory, subcategories]);

  const filteredProducts = useMemo(() => {
    return SANITARY_BATH_PRODUCTS.filter(
      (p) => p.subcategory === activeSubcategory,
    );
  }, [activeSubcategory]);

  const openModal = (p: SanitaryProduct) => {
    const mapped: Product = {
      id: p.id,
      title: p.title,
      price: p.price,
      mrp: p.mrp,
      unit: p.unit,
      image: p.image,
      materialTag: "Plumbing, Sanitary & Bath",
      brand: p.brand,
      description: `${p.title} - ${p.spec || "High precision sanitary & bath solution"}. Authentic ${p.brand} product with genuine manufacturer warranty and 60-minute quick delivery.`,
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
      {/* ── Optional Yellow Promo Banner (Present in Sanitary Sets view) ── */}
      <div className="w-full bg-[#FFD600] py-3 px-4 border-b border-[#FACC15] relative overflow-hidden flex items-center justify-center">
        <div className="max-w-[1360px] w-full flex items-center justify-between mx-auto px-4">
          <div className="flex items-center gap-4">
            <span className="text-[26px] sm:text-[34px] font-black text-[#1E3A8A] tracking-wider uppercase">
              FLAT 2% CASHBACK
            </span>
            <span className="text-[#3B82F6] text-2xl font-light">|</span>
            <span className="text-[16px] sm:text-[22px] font-bold text-[#1E3A8A]">
              ₹25,000+ purchase
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="bg-[#1E3A8A] text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              Limited Offer
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
        {/* ── Breadcrumb Row ── */}
        <div className="text-[13px] text-[#6B7280] mb-2 flex items-center gap-1.5 flex-wrap">
          <span className="hover:text-[#111827] cursor-pointer">Home</span>
          <span>›</span>
          <span className="hover:text-[#111827] cursor-pointer">
            Sanitary & Bath Fittings
          </span>
          <span>›</span>
          <span className="text-[#111827] font-medium">
            {currentSubcat.label}
          </span>
        </div>

        {/* ── Category Title ── */}
        <h1 className="text-[28px] sm:text-[32px] font-extrabold text-[#111827] tracking-tight mb-4">
          {currentSubcat.label}
        </h1>

        {/* ── Filter & Sort Bar ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-[#E5E7EB]">
          {/* Filters List */}
          <div className="flex items-center gap-2 flex-wrap text-[13px] text-[#374151]">
            <span className="text-[#6B7280] font-medium mr-1">Filter:</span>
            <div className="border border-[#D1D5DB] rounded-md px-2.5 py-1 bg-white hover:bg-[#F9FAFB] cursor-pointer flex items-center gap-1">
              <span>Category</span>
              <span className="text-[10px] text-[#9CA3AF]">▾</span>
            </div>
            <div className="border border-[#D1D5DB] rounded-md px-2.5 py-1 bg-white hover:bg-[#F9FAFB] cursor-pointer flex items-center gap-1">
              <span>Brand</span>
              <span className="text-[10px] text-[#9CA3AF]">▾</span>
            </div>
            <div className="border border-[#D1D5DB] rounded-md px-2.5 py-1 bg-white hover:bg-[#F9FAFB] cursor-pointer flex items-center gap-1">
              <span>Type</span>
              <span className="text-[10px] text-[#9CA3AF]">▾</span>
            </div>
            <div className="border border-[#D1D5DB] rounded-md px-2.5 py-1 bg-white hover:bg-[#F9FAFB] cursor-pointer flex items-center gap-1">
              <span>Material</span>
              <span className="text-[10px] text-[#9CA3AF]">▾</span>
            </div>
            <div className="border border-[#D1D5DB] rounded-md px-2.5 py-1 bg-white hover:bg-[#F9FAFB] cursor-pointer flex items-center gap-1">
              <span>Price</span>
              <span className="text-[10px] text-[#9CA3AF]">▾</span>
            </div>
          </div>

          {/* Product Counter & Sort */}
          <div className="flex items-center gap-3 text-[13px] text-[#6B7280] ml-auto">
            <span>{filteredProducts.length} products</span>
            <div className="flex items-center gap-1 text-[#374151] font-medium">
              <span>Sort by:</span>
              <span className="text-[#111827] cursor-pointer hover:underline">
                Relevance ▾
              </span>
            </div>
          </div>
        </div>

        {/* ── Main Layout: 7-Item Sidebar + Product Grid ── */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Left Sidebar (All 7 Subcategories) */}
          <aside className="w-full md:w-[220px] flex-shrink-0">
            <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden shadow-xs">
              {subcategories.map((sc) => {
                const isActive = activeSubcategory === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => {
                      setActiveSubcategory(sc.id);
                      window.history.pushState({}, "", sc.route);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors relative border-b border-[#F3F4F6] last:border-b-0 ${
                      isActive
                        ? "bg-[#EAF7EE] text-[#111827] font-semibold"
                        : "bg-white text-[#374151] hover:bg-[#F9FAFB]"
                    }`}
                  >
                    {/* Subcategory Icon */}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-[#F3F4F6]">
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
                          <span className="block leading-tight">
                            {p.discountPct}%
                          </span>
                          <div
                            className="absolute -bottom-1.5 left-0 right-0 h-1.5 bg-[#2563EB]"
                            style={{
                              clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)",
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Image Container */}
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

                        {/* Optional Bulk Price Link */}
                        {p.bulkPrice && (
                          <div className="text-[11px] text-[#2563EB] font-medium mt-0.5 cursor-pointer hover:underline">
                            Bulk price ₹{p.bulkPrice.toLocaleString("en-IN")} ›
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
                          <div className="mt-1.5 text-[10.5px] text-[#4B5563] font-medium line-clamp-1">
                            {p.spec}
                          </div>
                        )}

                        {/* Delivery Time */}
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-[#6B7280]">
                          <Clock className="w-3 h-3 text-[#6B7280]" />
                          <span>{p.deliveryTime}</span>
                        </div>
                      </div>

                      {/* Action Button: Sold Out / Options / Add */}
                      <div className="mt-3 pt-2">
                        {p.isSoldOut ? (
                          <button
                            type="button"
                            disabled
                            className="w-full text-center py-1.5 px-2 rounded-lg border border-[#E5E7EB] text-[#9CA3AF] font-bold text-[12.5px] bg-[#F9FAFB] cursor-not-allowed"
                          >
                            Sold Out
                          </button>
                        ) : p.optionsCount ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setVariantProduct(p);
                            }}
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

      {/* Variant Selector Sheet */}
      <VariantSelectorSheet
        product={variantProduct}
        isOpen={variantProduct !== null}
        onClose={() => setVariantProduct(null)}
      />

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
