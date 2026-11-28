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
  Calculator,
  ArrowRight,
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

export interface TileStoneProduct {
  id: string;
  slug: string;
  name: string;
  title: string;
  brand: string;
  oemModelCode: string;
  subcategory: string;
  stoneSubcategory: "VITRIFIED_TILE" | "WALL_PARKING_TILE" | "GRANITE_SLAB" | "MARBLE_NATURAL_STONE" | "GROUT_AND_TOOLS";
  sellingUnit: "BOX" | "SQ_FT" | "PACK_OR_PIECE";
  tileSizeMm?: string | null;
  piecesPerBox?: number | null;
  coverageSqFtPerBox?: number | null;
  effectivePricePerSqFt?: number | null;
  surfaceFinish?: string | null;
  thicknessMm?: number | null;
  minOrderSqFt?: number | null;
  batchLockRequired?: boolean;
  price: number;
  mrp: number;
  exGstPrice: number;
  hsnCode: string;
  gstPercent: number;
  brandTier: number;
  deliveryVehicleType: "2-Wheeler" | "E-Loader" | "Pickup / Mini-Truck" | "E-Loader / Pickup";
  unit: string;
  spec: string;
  shortTagline: string;
  specChips: string[];
  image: string;
  images: string[];
  description: string;
  highlights: string[];
  rating: number;
  reviewsCount: number;
  deliveryTime: string;
  inStock: boolean;
  vendor: string;
}

export const TILES_STONE_PRODUCTS: TileStoneProduct[] = [
  {
    "id": "prod-tiles-01-kajaria-kajaria-eternity-zion-mar",
    "slug": "kajaria-eternity-zion-marfil-gvt-vitrified-floor-tile-600x600mm",
    "name": "Kajaria Eternity Zion Marfil GVT Vitrified Floor Tile 600x600mm",
    "title": "Kajaria Eternity Zion Marfil GVT Vitrified Floor Tile 600x600mm",
    "brand": "Kajaria",
    "oemModelCode": "KJ-ET-ZION-600",
    "subcategory": "Vitrified Floor Tiles",
    "stoneSubcategory": "VITRIFIED_TILE",
    "sellingUnit": "BOX",
    "tileSizeMm": "600x600mm",
    "piecesPerBox": 4,
    "coverageSqFtPerBox": 15.5,
    "effectivePricePerSqFt": 66,
    "surfaceFinish": "Glazed Vitrified (GVT) Glossy Finish",
    "thicknessMm": null,
    "minOrderSqFt": null,
    "batchLockRequired": true,
    "price": 1022,
    "mrp": 1250,
    "exGstPrice": 866,
    "hsnCode": "6907",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader / Pickup",
    "unit": "Box",
    "spec": "\u20b966/sq ft",
    "shortTagline": "Premium Ivory Marfil Glazed Vitrified Tile for Living & Bedrooms",
    "specChips": [
      "\u20b966/sq ft",
      "Box of 4 (15.5 sq ft)",
      "HSN 6907",
      "18% GST",
      "E-Loader / Pickup",
      "600x600mm",
      "Glazed Vitrified (GVT) Glossy Finish"
    ],
    "image": "",
    "images": [],
    "description": "Kajaria Eternity Zion Marfil GVT 600x600mm offers an elegant warm-toned Spanish marble visual with digital nano-polish and high stain resistance. Single shade batch lock guaranteed for color uniformity across rooms.",
    "highlights": [
      "15.5 sq ft coverage per box (4 pcs)",
      "Nano-polished stain & scratch resistant glaze",
      "Water absorption < 0.05% for zero warp",
      "Single shade batch-locked delivery across Lucknow"
    ],
    "rating": 4.8,
    "reviewsCount": 88,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "Kajaria Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-02-kajaria-kajaria-polished-vitrifie",
    "slug": "kajaria-polished-vitrified-tile-k6209-600x600mm",
    "name": "Kajaria Polished Vitrified Tile K6209 600x600mm",
    "title": "Kajaria Polished Vitrified Tile K6209 600x600mm",
    "brand": "Kajaria",
    "oemModelCode": "KJ-PVT-K6209",
    "subcategory": "Vitrified Floor Tiles",
    "stoneSubcategory": "VITRIFIED_TILE",
    "sellingUnit": "BOX",
    "tileSizeMm": "600x600mm",
    "piecesPerBox": 4,
    "coverageSqFtPerBox": 15.5,
    "effectivePricePerSqFt": 55,
    "surfaceFinish": "Polished Vitrified (PVT) Mirror Shine",
    "thicknessMm": null,
    "minOrderSqFt": null,
    "batchLockRequired": true,
    "price": 853,
    "mrp": 1050,
    "exGstPrice": 723,
    "hsnCode": "6907",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader / Pickup",
    "unit": "Box",
    "spec": "\u20b955/sq ft",
    "shortTagline": "Classic Ultra-White High Gloss Soluble Salt Vitrified Tile",
    "specChips": [
      "\u20b955/sq ft",
      "Box of 4 (15.5 sq ft)",
      "HSN 6907",
      "18% GST",
      "E-Loader / Pickup",
      "600x600mm",
      "Polished Vitrified (PVT) Mirror Shine"
    ],
    "image": "",
    "images": [],
    "description": "Kajaria K6209 Polished Vitrified Tile is Lucknow's highest-running residential flooring tile. Features a pristine mirror shine, rectified sharp edges, and superior load-bearing strength.",
    "highlights": [
      "15.5 sq ft per box (4 pcs)",
      "High-gloss mirror polish with rectified edges",
      "Cost-effective luxury floor solution (\u20b955/sq ft)",
      "Full batch-shade locked dispatch"
    ],
    "rating": 4.8,
    "reviewsCount": 91,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "Kajaria Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-03-kajaria-kajaria-eternity-jade-gre",
    "slug": "kajaria-eternity-jade-green-gvt-vitrified-tile-600x1200mm",
    "name": "Kajaria Eternity Jade Green GVT Vitrified Tile 600x1200mm",
    "title": "Kajaria Eternity Jade Green GVT Vitrified Tile 600x1200mm",
    "brand": "Kajaria",
    "oemModelCode": "KJ-ET-JADE-1200",
    "subcategory": "Vitrified Floor Tiles",
    "stoneSubcategory": "VITRIFIED_TILE",
    "sellingUnit": "BOX",
    "tileSizeMm": "600x1200mm",
    "piecesPerBox": 2,
    "coverageSqFtPerBox": 15.5,
    "effectivePricePerSqFt": 67,
    "surfaceFinish": "Glazed Vitrified (GVT) Exotic Jade Marble",
    "thicknessMm": null,
    "minOrderSqFt": null,
    "batchLockRequired": true,
    "price": 1046,
    "mrp": 1300,
    "exGstPrice": 886,
    "hsnCode": "6907",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader / Pickup",
    "unit": "Box",
    "spec": "\u20b967/sq ft",
    "shortTagline": "Large Format 2x4 ft Exotic Green Onyx Luxury Tile",
    "specChips": [
      "\u20b967/sq ft",
      "Box of 2 (15.5 sq ft)",
      "HSN 6907",
      "18% GST",
      "E-Loader / Pickup",
      "600x1200mm",
      "Glazed Vitrified (GVT) Exotic Jade Marble"
    ],
    "image": "",
    "images": [],
    "description": "Kajaria Eternity Jade Green 600x1200mm slab vitrified tile creates seamless floors with 50% fewer grout lines. Stunning emerald onyx book-match styling perfect for drawing halls and accent floors.",
    "highlights": [
      "Large format 600x1200mm (2x4 ft)",
      "15.5 sq ft coverage per box (2 slabs)",
      "Zero-joint finish with rectified laser edges",
      "Ideal with Roff T13 Epoxy Grout & Leveling Clips"
    ],
    "rating": 4.8,
    "reviewsCount": 94,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "Kajaria Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-04-kajaria-kajaria-rave-gris-dry-gra",
    "slug": "kajaria-rave-gris-dry-granula-vitrified-tile-600x1200mm",
    "name": "Kajaria Rave Gris Dry Granula Vitrified Tile 600x1200mm",
    "title": "Kajaria Rave Gris Dry Granula Vitrified Tile 600x1200mm",
    "brand": "Kajaria",
    "oemModelCode": "KJ-RAVE-GRIS-1200",
    "subcategory": "Vitrified Floor Tiles",
    "stoneSubcategory": "VITRIFIED_TILE",
    "sellingUnit": "BOX",
    "tileSizeMm": "600x1200mm",
    "piecesPerBox": 2,
    "coverageSqFtPerBox": 15.5,
    "effectivePricePerSqFt": 181,
    "surfaceFinish": "Dry Granula Matt Architectural Texture",
    "thicknessMm": null,
    "minOrderSqFt": null,
    "batchLockRequired": true,
    "price": 2800,
    "mrp": 3400,
    "exGstPrice": 2373,
    "hsnCode": "6907",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader / Pickup",
    "unit": "Box",
    "spec": "\u20b9181/sq ft",
    "shortTagline": "Architectural Dry Granula Matte Textured Vitrified Slab",
    "specChips": [
      "\u20b9181/sq ft",
      "Box of 2 (15.5 sq ft)",
      "HSN 6907",
      "18% GST",
      "E-Loader / Pickup",
      "600x1200mm",
      "Dry Granula Matt Architectural Texture"
    ],
    "image": "",
    "images": [],
    "description": "Kajaria Rave Gris Dry Granula Vitrified 600x1200mm is an ultra-premium designer slab with granular tactile feel, R10 slip resistance, and contemporary Scandinavian slate grey aesthetics.",
    "highlights": [
      "Architectural dry granula tactile finish",
      "Non-skid R10 rating for wet & high-traffic areas",
      "Large 2x4 ft format, 15.5 sq ft box",
      "Exclusive luxury designer collection"
    ],
    "rating": 4.8,
    "reviewsCount": 97,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "Kajaria Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-05-somany-somany-glossy-vitrified-f",
    "slug": "somany-glossy-vitrified-floor-tile-600x600mm",
    "name": "Somany Glossy Vitrified Floor Tile 600x600mm",
    "title": "Somany Glossy Vitrified Floor Tile 600x600mm",
    "brand": "Somany",
    "oemModelCode": "SOM-GLOSS-600",
    "subcategory": "Vitrified Floor Tiles",
    "stoneSubcategory": "VITRIFIED_TILE",
    "sellingUnit": "BOX",
    "tileSizeMm": "600x600mm",
    "piecesPerBox": 4,
    "coverageSqFtPerBox": 15.5,
    "effectivePricePerSqFt": 51,
    "surfaceFinish": "Glossy Polished Vitrified",
    "thicknessMm": null,
    "minOrderSqFt": null,
    "batchLockRequired": true,
    "price": 791,
    "mrp": 980,
    "exGstPrice": 670,
    "hsnCode": "6907",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader / Pickup",
    "unit": "Box",
    "spec": "\u20b951/sq ft",
    "shortTagline": "Best Value Lucknow Floor Tile with VC Shield Coating",
    "specChips": [
      "\u20b951/sq ft",
      "Box of 4 (15.5 sq ft)",
      "HSN 6907",
      "18% GST",
      "E-Loader / Pickup",
      "600x600mm",
      "Glossy Polished Vitrified"
    ],
    "image": "",
    "images": [],
    "description": "Somany 600x600mm Glossy Vitrified Floor Tile delivers unmatched brightness and scratch-resistance at an unbeatable \u20b951/sq ft rate. Protected with patented VC Shield high-abrasion technology.",
    "highlights": [
      "15.5 sq ft coverage per box (4 pcs)",
      "VC Shield abrasion-proof surface",
      "Lucknow's best builder-grade value tile",
      "Strict batch consistency guarantee"
    ],
    "rating": 4.8,
    "reviewsCount": 100,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "Somany Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-06-somany-somany-valor-liston-grey-",
    "slug": "somany-valor-liston-grey-dark-matt-vitrified-tile-600x600mm",
    "name": "Somany Valor Liston Grey Dark Matt Vitrified Tile 600x600mm",
    "title": "Somany Valor Liston Grey Dark Matt Vitrified Tile 600x600mm",
    "brand": "Somany",
    "oemModelCode": "SOM-VALOR-GR-600",
    "subcategory": "Vitrified Floor Tiles",
    "stoneSubcategory": "VITRIFIED_TILE",
    "sellingUnit": "BOX",
    "tileSizeMm": "600x600mm",
    "piecesPerBox": 4,
    "coverageSqFtPerBox": 15.5,
    "effectivePricePerSqFt": 89,
    "surfaceFinish": "Dark Matt Anti-Skid Textured",
    "thicknessMm": null,
    "minOrderSqFt": null,
    "batchLockRequired": true,
    "price": 1380,
    "mrp": 1650,
    "exGstPrice": 1169,
    "hsnCode": "6907",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader / Pickup",
    "unit": "Box",
    "spec": "\u20b989/sq ft",
    "shortTagline": "Modern Cement Grey Anti-Skid Matte Floor Tile",
    "specChips": [
      "\u20b989/sq ft",
      "Box of 4 (15.5 sq ft)",
      "HSN 6907",
      "18% GST",
      "E-Loader / Pickup",
      "600x600mm",
      "Dark Matt Anti-Skid Textured"
    ],
    "image": "",
    "images": [],
    "description": "Somany Valor Liston Grey Dark Matt 600x600mm tile combines urban industrial concrete styling with slip-resistant durability. Perfect for open kitchens, modern bathrooms, and master suites.",
    "highlights": [
      "15.5 sq ft per box (4 pcs)",
      "Slip-resistant smooth matte surface",
      "Deep charcoal grey cement aesthetic",
      "Rectified edges for hairline 1.5mm joints"
    ],
    "rating": 4.8,
    "reviewsCount": 103,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "Somany Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-07-somany-somany-pgvt-polished-glaz",
    "slug": "somany-pgvt-polished-glazed-vitrified-tile-600x1200mm",
    "name": "Somany PGVT Polished Glazed Vitrified Tile 600x1200mm",
    "title": "Somany PGVT Polished Glazed Vitrified Tile 600x1200mm",
    "brand": "Somany",
    "oemModelCode": "SOM-PGVT-1200",
    "subcategory": "Vitrified Floor Tiles",
    "stoneSubcategory": "VITRIFIED_TILE",
    "sellingUnit": "BOX",
    "tileSizeMm": "600x1200mm",
    "piecesPerBox": 2,
    "coverageSqFtPerBox": 15.5,
    "effectivePricePerSqFt": 95,
    "surfaceFinish": "Polished Glazed Vitrified (PGVT) High Gloss",
    "thicknessMm": null,
    "minOrderSqFt": null,
    "batchLockRequired": true,
    "price": 1473,
    "mrp": 1850,
    "exGstPrice": 1248,
    "hsnCode": "6907",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader / Pickup",
    "unit": "Box",
    "spec": "\u20b995/sq ft",
    "shortTagline": "Italian Onyx Pattern High Gloss PGVT 2x4 ft Slab",
    "specChips": [
      "\u20b995/sq ft",
      "Box of 2 (15.5 sq ft)",
      "HSN 6907",
      "18% GST",
      "E-Loader / Pickup",
      "600x1200mm",
      "Polished Glazed Vitrified (PGVT) High Gloss"
    ],
    "image": "",
    "images": [],
    "description": "Somany PGVT Polished Glazed Vitrified 600x1200mm features crystal-clear digital printing mimicking imported Italian Statuario and Travertine veining with high light reflectivity.",
    "highlights": [
      "15.5 sq ft coverage per box (2 slabs)",
      "Mirror-like PGVT polish with deep optical clarity",
      "Bending strength > 35 N/mm\u00b2",
      "Batch locked delivery directly from stockyard"
    ],
    "rating": 4.8,
    "reviewsCount": 106,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "Somany Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-08-orientbell-orientbell-pgvt-emperador",
    "slug": "orientbell-pgvt-emperador-marble-finish-floor-tile-600x600mm",
    "name": "Orientbell PGVT Emperador Marble Finish Floor Tile 600x600mm",
    "title": "Orientbell PGVT Emperador Marble Finish Floor Tile 600x600mm",
    "brand": "Orientbell",
    "oemModelCode": "OB-EMPERADOR-600",
    "subcategory": "Vitrified Floor Tiles",
    "stoneSubcategory": "VITRIFIED_TILE",
    "sellingUnit": "BOX",
    "tileSizeMm": "600x600mm",
    "piecesPerBox": 4,
    "coverageSqFtPerBox": 15.5,
    "effectivePricePerSqFt": 75,
    "surfaceFinish": "Marble Finish Glossy PGVT",
    "thicknessMm": null,
    "minOrderSqFt": null,
    "batchLockRequired": true,
    "price": 1163,
    "mrp": 1420,
    "exGstPrice": 986,
    "hsnCode": "6907",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader / Pickup",
    "unit": "Box",
    "spec": "\u20b975/sq ft",
    "shortTagline": "Royal Spanish Emperador Dark Brown Marble Texture Tile",
    "specChips": [
      "\u20b975/sq ft",
      "Box of 4 (15.5 sq ft)",
      "HSN 6907",
      "18% GST",
      "E-Loader / Pickup",
      "600x600mm",
      "Marble Finish Glossy PGVT"
    ],
    "image": "",
    "images": [],
    "description": "Orientbell PGVT Emperador Marble Finish 600x600mm reproduces Spanish Dark Emperador marble's rich cocoa brown veins with razor-sharp high-definition digital ceramic glazing.",
    "highlights": [
      "15.5 sq ft per box (4 pcs)",
      "Spanish Emperador natural brown marble veining",
      "Germ-free antimicrobial surface technology",
      "Full batch-shade locked dispatch across Lucknow"
    ],
    "rating": 4.8,
    "reviewsCount": 109,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "Orientbell Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-09-orientbell-orientbell-gvt-glossy-mat",
    "slug": "orientbell-gvt-glossy-matte-designer-vitrified-tile-600x1200mm",
    "name": "Orientbell GVT Glossy/Matte Designer Vitrified Tile 600x1200mm",
    "title": "Orientbell GVT Glossy/Matte Designer Vitrified Tile 600x1200mm",
    "brand": "Orientbell",
    "oemModelCode": "OB-GVT-1200",
    "subcategory": "Vitrified Floor Tiles",
    "stoneSubcategory": "VITRIFIED_TILE",
    "sellingUnit": "BOX",
    "tileSizeMm": "600x1200mm",
    "piecesPerBox": 2,
    "coverageSqFtPerBox": 15.5,
    "effectivePricePerSqFt": 90,
    "surfaceFinish": "GVT Premium Surface Glazed",
    "thicknessMm": null,
    "minOrderSqFt": null,
    "batchLockRequired": true,
    "price": 1395,
    "mrp": 1750,
    "exGstPrice": 1182,
    "hsnCode": "6907",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader / Pickup",
    "unit": "Box",
    "spec": "\u20b990/sq ft",
    "shortTagline": "2x4 ft Large Format Rectified Glazed Vitrified Tile",
    "specChips": [
      "\u20b990/sq ft",
      "Box of 2 (15.5 sq ft)",
      "HSN 6907",
      "18% GST",
      "E-Loader / Pickup",
      "600x1200mm",
      "GVT Premium Surface Glazed"
    ],
    "image": "",
    "images": [],
    "description": "Orientbell GVT 600x1200mm Vitrified Floor & Wall Tile delivers grand visual scale and minimal grout joints. Highly recommended for upscale living rooms and contemporary bathrooms.",
    "highlights": [
      "15.5 sq ft per box (2 slabs)",
      "Rectified precision dimensions with 0% curvature",
      "Exceptional stain and chemical resistance",
      "Compatible with Leqwell 3mm spacers & leveling clips"
    ],
    "rating": 4.8,
    "reviewsCount": 112,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "Orientbell Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-10-asian-granito-asian-granito-agl-double-",
    "slug": "asian-granito-agl-double-charge-vitrified-floor-tile-800x800mm",
    "name": "Asian Granito AGL Double Charge Vitrified Floor Tile 800x800mm",
    "title": "Asian Granito AGL Double Charge Vitrified Floor Tile 800x800mm",
    "brand": "Asian Granito",
    "oemModelCode": "AGL-DC-800",
    "subcategory": "Vitrified Floor Tiles",
    "stoneSubcategory": "VITRIFIED_TILE",
    "sellingUnit": "BOX",
    "tileSizeMm": "800x800mm",
    "piecesPerBox": 3,
    "coverageSqFtPerBox": 20.66,
    "effectivePricePerSqFt": 75,
    "surfaceFinish": "Double Charge Polished Heavy Duty",
    "thicknessMm": null,
    "minOrderSqFt": null,
    "batchLockRequired": true,
    "price": 1550,
    "mrp": 1950,
    "exGstPrice": 1314,
    "hsnCode": "6907",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader / Pickup",
    "unit": "Box",
    "spec": "\u20b975/sq ft",
    "shortTagline": "Extra Large 32x32 inch Double Layer Wear-Resistant Tile",
    "specChips": [
      "\u20b975/sq ft",
      "Box of 3 (20.66 sq ft)",
      "HSN 6907",
      "18% GST",
      "E-Loader / Pickup",
      "800x800mm",
      "Double Charge Polished Heavy Duty"
    ],
    "image": "",
    "images": [],
    "description": "Asian Granito (AGL) 800x800mm Double Charge Vitrified Tile features a 3-4mm upper design layer fused with high-density vitrified porcelain base. Engineered for lifetime high-traffic commercial & bungalow flooring.",
    "highlights": [
      "Extra large 800x800mm (32x32 inch) format",
      "20.66 sq ft coverage per box (3 pcs)",
      "Thick 3-4mm double charge wear layer",
      "High compressive strength > 40 N/mm\u00b2"
    ],
    "rating": 4.8,
    "reviewsCount": 115,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "Asian Granito Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-11-simpolo-simpolo-gvt-statuario-mat",
    "slug": "simpolo-gvt-statuario-matte-glossy-vitrified-tile-600x1200mm",
    "name": "Simpolo GVT Statuario Matte/Glossy Vitrified Tile 600x1200mm",
    "title": "Simpolo GVT Statuario Matte/Glossy Vitrified Tile 600x1200mm",
    "brand": "Simpolo",
    "oemModelCode": "SIM-STATUARIO-1200",
    "subcategory": "Vitrified Floor Tiles",
    "stoneSubcategory": "VITRIFIED_TILE",
    "sellingUnit": "BOX",
    "tileSizeMm": "600x1200mm",
    "piecesPerBox": 2,
    "coverageSqFtPerBox": 15.5,
    "effectivePricePerSqFt": 92,
    "surfaceFinish": "Statuario Marble Vein GVT",
    "thicknessMm": null,
    "minOrderSqFt": null,
    "batchLockRequired": true,
    "price": 1426,
    "mrp": 1800,
    "exGstPrice": 1208,
    "hsnCode": "6907",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader / Pickup",
    "unit": "Box",
    "spec": "\u20b992/sq ft",
    "shortTagline": "Iconic Italian Statuario White Marble Aesthetic GVT",
    "specChips": [
      "\u20b992/sq ft",
      "Box of 2 (15.5 sq ft)",
      "HSN 6907",
      "18% GST",
      "E-Loader / Pickup",
      "600x1200mm",
      "Statuario Marble Vein GVT"
    ],
    "image": "",
    "images": [],
    "description": "Simpolo GVT Statuario 600x1200mm brings authentic Italian Carrara/Statuario elegance with subtle feathered grey veins on an ultra-white background. Manufactured with iM+ surface antibacterial coating.",
    "highlights": [
      "15.5 sq ft coverage per box (2 slabs)",
      "Authentic Italian Statuario book-match veins",
      "Simpolo iM+ antibacterial surface protection",
      "Single batch locked supply guaranteed"
    ],
    "rating": 4.8,
    "reviewsCount": 118,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "Simpolo Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-12-h-r-johnson-h-r-johnson-marbonite-dou",
    "slug": "h-r-johnson-marbonite-double-charge-vitrified-tile-600x600mm",
    "name": "H&R Johnson Marbonite Double Charge Vitrified Tile 600x600mm",
    "title": "H&R Johnson Marbonite Double Charge Vitrified Tile 600x600mm",
    "brand": "H&R Johnson",
    "oemModelCode": "JHN-MARBONITE-600",
    "subcategory": "Vitrified Floor Tiles",
    "stoneSubcategory": "VITRIFIED_TILE",
    "sellingUnit": "BOX",
    "tileSizeMm": "600x600mm",
    "piecesPerBox": 4,
    "coverageSqFtPerBox": 15.5,
    "effectivePricePerSqFt": 80,
    "surfaceFinish": "Double Charge High Gloss Marbonite",
    "thicknessMm": null,
    "minOrderSqFt": null,
    "batchLockRequired": true,
    "price": 1240,
    "mrp": 1520,
    "exGstPrice": 1051,
    "hsnCode": "6907",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader / Pickup",
    "unit": "Box",
    "spec": "\u20b980/sq ft",
    "shortTagline": "Legendary Marbonite High Gloss Double Charge Floor Tile",
    "specChips": [
      "\u20b980/sq ft",
      "Box of 4 (15.5 sq ft)",
      "HSN 6907",
      "18% GST",
      "E-Loader / Pickup",
      "600x600mm",
      "Double Charge High Gloss Marbonite"
    ],
    "image": "",
    "images": [],
    "description": "Johnson Marbonite Double Charge 600x600mm is synonymous with luxury Indian flooring. High breaking strength, deep nano-sealed gloss, and extreme wear-resistance make it ideal for multi-generation homes.",
    "highlights": [
      "15.5 sq ft per box (4 pcs)",
      "Legendary Marbonite double charge technology",
      "Mohs hardness > 6 scratch resistance",
      "Zero color fading with single shade lock"
    ],
    "rating": 4.8,
    "reviewsCount": 121,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "H&R Johnson Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-13-kajaria-kajaria-ceramic-glossy-ba",
    "slug": "kajaria-ceramic-glossy-bathroom-kitchen-wall-tile-300x450mm",
    "name": "Kajaria Ceramic Glossy Bathroom/Kitchen Wall Tile 300x450mm",
    "title": "Kajaria Ceramic Glossy Bathroom/Kitchen Wall Tile 300x450mm",
    "brand": "Kajaria",
    "oemModelCode": "KJ-WALL-300X450",
    "subcategory": "Ceramic Wall & Parking Tiles",
    "stoneSubcategory": "WALL_PARKING_TILE",
    "sellingUnit": "BOX",
    "tileSizeMm": "300x450mm",
    "piecesPerBox": 6,
    "coverageSqFtPerBox": 9.0,
    "effectivePricePerSqFt": 41,
    "surfaceFinish": "Glossy Ceramic Wall Glaze",
    "thicknessMm": null,
    "minOrderSqFt": null,
    "batchLockRequired": true,
    "price": 369,
    "mrp": 460,
    "exGstPrice": 313,
    "hsnCode": "6907",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "unit": "Box",
    "spec": "\u20b941/sq ft",
    "shortTagline": "Easy-Clean Glossy Wall Tile for Bathrooms & Kitchens",
    "specChips": [
      "\u20b941/sq ft",
      "Box of 6 (9 sq ft)",
      "HSN 6907",
      "18% GST",
      "E-Loader",
      "300x450mm",
      "Glossy Ceramic Wall Glaze"
    ],
    "image": "",
    "images": [],
    "description": "Kajaria 300x450mm (12x18 in) Glossy Ceramic Wall Tile features water-repellent glazed ceramic body that resists soap scum, water stains, and kitchen oil grease.",
    "highlights": [
      "9 sq ft coverage per box (6 pcs)",
      "Mirror-smooth glazed ceramic easy to wipe clean",
      "Zero water absorption through glazed face",
      "Ideal for bathroom dados and kitchen backsplashes"
    ],
    "rating": 4.8,
    "reviewsCount": 124,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "Kajaria Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-14-orientbell-orientbell-dyna-grey-dk-g",
    "slug": "orientbell-dyna-grey-dk-glossy-ceramic-wall-tile-300x450mm",
    "name": "Orientbell Dyna Grey DK Glossy Ceramic Wall Tile 300x450mm",
    "title": "Orientbell Dyna Grey DK Glossy Ceramic Wall Tile 300x450mm",
    "brand": "Orientbell",
    "oemModelCode": "OB-DYNA-DK-300X450",
    "subcategory": "Ceramic Wall & Parking Tiles",
    "stoneSubcategory": "WALL_PARKING_TILE",
    "sellingUnit": "BOX",
    "tileSizeMm": "300x450mm",
    "piecesPerBox": 6,
    "coverageSqFtPerBox": 9.0,
    "effectivePricePerSqFt": 39,
    "surfaceFinish": "Digital Glossy Ceramic Dyna Texture",
    "thicknessMm": null,
    "minOrderSqFt": null,
    "batchLockRequired": true,
    "price": 348,
    "mrp": 435,
    "exGstPrice": 295,
    "hsnCode": "6907",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "unit": "Box",
    "spec": "\u20b939/sq ft",
    "shortTagline": "High-Definition Dark Grey Marble Pattern Wall Tile",
    "specChips": [
      "\u20b939/sq ft",
      "Box of 6 (9 sq ft)",
      "HSN 6907",
      "18% GST",
      "E-Loader",
      "300x450mm",
      "Digital Glossy Ceramic Dyna Texture"
    ],
    "image": "",
    "images": [],
    "description": "Orientbell Dyna Grey DK 300x450mm brings rich charcoal grey marble textures with contrasting white veins. Pairs perfectly with light highlighter wall tiles for designer bathroom themes.",
    "highlights": [
      "9 sq ft coverage per box (6 pcs)",
      "Dyna Italian marble visual digital print",
      "Stain-resistant high gloss protective glaze",
      "Precise sizing for neat, uniform tile lines"
    ],
    "rating": 4.8,
    "reviewsCount": 127,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "Orientbell Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-15-h-r-johnson-h-r-johnson-ceramic-digit",
    "slug": "h-r-johnson-ceramic-digital-wall-tile-300x450mm",
    "name": "H&R Johnson Ceramic Digital Wall Tile 300x450mm",
    "title": "H&R Johnson Ceramic Digital Wall Tile 300x450mm",
    "brand": "H&R Johnson",
    "oemModelCode": "JHN-WALL-DIGI-300X450",
    "subcategory": "Ceramic Wall & Parking Tiles",
    "stoneSubcategory": "WALL_PARKING_TILE",
    "sellingUnit": "BOX",
    "tileSizeMm": "300x450mm",
    "piecesPerBox": 6,
    "coverageSqFtPerBox": 9.0,
    "effectivePricePerSqFt": 38,
    "surfaceFinish": "Digital Printed Glazed Ceramic",
    "thicknessMm": null,
    "minOrderSqFt": null,
    "batchLockRequired": true,
    "price": 342,
    "mrp": 425,
    "exGstPrice": 290,
    "hsnCode": "6907",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "unit": "Box",
    "spec": "\u20b938/sq ft",
    "shortTagline": "Durable Water-Resistant Digital Ceramic Wall Tile",
    "specChips": [
      "\u20b938/sq ft",
      "Box of 6 (9 sq ft)",
      "HSN 6907",
      "18% GST",
      "E-Loader",
      "300x450mm",
      "Digital Printed Glazed Ceramic"
    ],
    "image": "",
    "images": [],
    "description": "H&R Johnson 300x450mm Digital Wall Tile provides proven ceramic durability with contemporary patterns. Easy to cut, fix, and maintain across residential and commercial wet areas.",
    "highlights": [
      "9 sq ft coverage per box (6 pcs)",
      "High crazing resistance and colorfastness",
      "Lightweight ceramic body reduces adhesive shear",
      "Works seamlessly with Roff Rainbow joint grout"
    ],
    "rating": 4.8,
    "reviewsCount": 130,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "H&R Johnson Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-16-morbi-heavy-duty-morbi-heavy-duty-green-di",
    "slug": "morbi-heavy-duty-green-diamond-rustic-anti-skid-parking-tile-300x300mm",
    "name": "Morbi Heavy-Duty Green Diamond Rustic Anti-Skid Parking Tile 300x300mm",
    "title": "Morbi Heavy-Duty Green Diamond Rustic Anti-Skid Parking Tile 300x300mm",
    "brand": "Morbi Heavy-Duty",
    "oemModelCode": "MOR-PK-GRNDIA-300",
    "subcategory": "Ceramic Wall & Parking Tiles",
    "stoneSubcategory": "WALL_PARKING_TILE",
    "sellingUnit": "BOX",
    "tileSizeMm": "300x300mm",
    "piecesPerBox": 8,
    "coverageSqFtPerBox": 8.0,
    "effectivePricePerSqFt": 28,
    "surfaceFinish": "Rustic Anti-Skid Embossed Diamond Pattern",
    "thicknessMm": null,
    "minOrderSqFt": null,
    "batchLockRequired": true,
    "price": 227,
    "mrp": 310,
    "exGstPrice": 192,
    "hsnCode": "6907",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "unit": "Box",
    "spec": "\u20b928/sq ft",
    "shortTagline": "Heavy-Duty Embossed Anti-Skid Vehicle Parking Tile",
    "specChips": [
      "\u20b928/sq ft",
      "Box of 8 (8 sq ft)",
      "HSN 6907",
      "18% GST",
      "E-Loader",
      "300x300mm",
      "Rustic Anti-Skid Embossed Diamond Pattern"
    ],
    "image": "",
    "images": [],
    "description": "Morbi Heavy-Duty 300x300mm (12x12 in) Green Diamond Parking Tile features deeply embossed diamond tread pattern for extreme tire grip in wet rain conditions. Built to withstand SUV and truck axle loads.",
    "highlights": [
      "8 sq ft coverage per box (8 pcs)",
      "Deep diamond punch for maximum tire traction",
      "High compressive breaking strength > 2000 N",
      "Weatherproof, frost-proof and oil resistant"
    ],
    "rating": 4.8,
    "reviewsCount": 133,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "Morbi Heavy-Duty Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-17-morbi-heavy-duty-morbi-heavy-duty-blue-gre",
    "slug": "morbi-heavy-duty-blue-grey-checked-rustic-parking-tile-300x300mm",
    "name": "Morbi Heavy-Duty Blue Grey Checked Rustic Parking Tile 300x300mm",
    "title": "Morbi Heavy-Duty Blue Grey Checked Rustic Parking Tile 300x300mm",
    "brand": "Morbi Heavy-Duty",
    "oemModelCode": "MOR-PK-BGCHK-300",
    "subcategory": "Ceramic Wall & Parking Tiles",
    "stoneSubcategory": "WALL_PARKING_TILE",
    "sellingUnit": "BOX",
    "tileSizeMm": "300x300mm",
    "piecesPerBox": 8,
    "coverageSqFtPerBox": 8.0,
    "effectivePricePerSqFt": 28,
    "surfaceFinish": "Rustic Heavy-Duty Checked Matte",
    "thicknessMm": null,
    "minOrderSqFt": null,
    "batchLockRequired": true,
    "price": 227,
    "mrp": 310,
    "exGstPrice": 192,
    "hsnCode": "6907",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "unit": "Box",
    "spec": "\u20b928/sq ft",
    "shortTagline": "Checkerboard Anti-Slip Driveway & Porch Parking Tile",
    "specChips": [
      "\u20b928/sq ft",
      "Box of 8 (8 sq ft)",
      "HSN 6907",
      "18% GST",
      "E-Loader",
      "300x300mm",
      "Rustic Heavy-Duty Checked Matte"
    ],
    "image": "",
    "images": [],
    "description": "Morbi Heavy-Duty Blue Grey Checked 300x300mm Parking Tile provides durable slip-resistance for residential driveways, ramps, and covered car porches in Lucknow.",
    "highlights": [
      "8 sq ft coverage per box (8 pcs)",
      "Classic two-tone checked pattern",
      "High impact resistance against falling tools and jacks",
      "Low thermal expansion for outdoor Lucknow climate"
    ],
    "rating": 4.8,
    "reviewsCount": 136,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "Morbi Heavy-Duty Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-18-kajaria-kajaria-endura-heavy-duty",
    "slug": "kajaria-endura-heavy-duty-outdoor-parking-tile-300x300mm",
    "name": "Kajaria Endura Heavy-Duty Outdoor Parking Tile 300x300mm",
    "title": "Kajaria Endura Heavy-Duty Outdoor Parking Tile 300x300mm",
    "brand": "Kajaria",
    "oemModelCode": "KJ-ENDURA-300",
    "subcategory": "Ceramic Wall & Parking Tiles",
    "stoneSubcategory": "WALL_PARKING_TILE",
    "sellingUnit": "BOX",
    "tileSizeMm": "300x300mm",
    "piecesPerBox": 8,
    "coverageSqFtPerBox": 8.0,
    "effectivePricePerSqFt": 45,
    "surfaceFinish": "Endura Industrial Heavy-Duty Anti-Slip",
    "thicknessMm": null,
    "minOrderSqFt": null,
    "batchLockRequired": true,
    "price": 360,
    "mrp": 450,
    "exGstPrice": 305,
    "hsnCode": "6907",
    "gstPercent": 18,
    "brandTier": 1,
    "deliveryVehicleType": "E-Loader",
    "unit": "Box",
    "spec": "\u20b945/sq ft",
    "shortTagline": "Industrial Grade Full-Body Vitrified Outdoor Paver Tile",
    "specChips": [
      "\u20b945/sq ft",
      "Box of 8 (8 sq ft)",
      "HSN 6907",
      "18% GST",
      "E-Loader",
      "300x300mm",
      "Endura Industrial Heavy-Duty Anti-Slip"
    ],
    "image": "",
    "images": [],
    "description": "Kajaria Endura 300x300mm is engineered for high vehicular stress, commercial petrol pumps, commercial parking lots, and luxury villa ramps with R11 slip rating.",
    "highlights": [
      "8 sq ft coverage per box (8 pcs)",
      "Full body vitrified composition for zero surface wear",
      "Breaking strength > 3000 N",
      "Acid, alkali, and automotive grease immune"
    ],
    "rating": 4.8,
    "reviewsCount": 139,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "Kajaria Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-19-rajasthan-stone-rajasthan-black-r-black-p",
    "slug": "rajasthan-black-r-black-polished-granite-slab-16-18mm",
    "name": "Rajasthan Black (R-Black) Polished Granite Slab 16-18mm",
    "title": "Rajasthan Black (R-Black) Polished Granite Slab 16-18mm",
    "brand": "Rajasthan Stone",
    "oemModelCode": "RS-RBLACK-18MM",
    "subcategory": "Granite Slabs",
    "stoneSubcategory": "GRANITE_SLAB",
    "sellingUnit": "SQ_FT",
    "tileSizeMm": null,
    "piecesPerBox": null,
    "coverageSqFtPerBox": null,
    "effectivePricePerSqFt": 95,
    "surfaceFinish": "Mirror Polished Natural Granite",
    "thicknessMm": null,
    "minOrderSqFt": 25,
    "batchLockRequired": false,
    "price": 95,
    "mrp": 125,
    "exGstPrice": 81,
    "hsnCode": "6802",
    "gstPercent": 18,
    "brandTier": 2,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "unit": "Sq Ft",
    "spec": "\u20b995/sq ft",
    "shortTagline": "Lucknow's #1 Kitchen Countertop & Staircase Natural Black Granite",
    "specChips": [
      "\u20b995/sq ft",
      "Sold per sq ft (Min order 25 sq ft)",
      "HSN 6802",
      "18% GST",
      "Pickup / Mini-Truck",
      "Mirror Polished Natural Granite"
    ],
    "image": "",
    "images": [],
    "description": "Rajasthan Black (R-Black) Granite Slab 16-18mm from Transport Nagar / Chinhat stockyards. Uniform fine crystalline black grain with high gloss mirror polish. Delivered strictly via A-frame vertical truck.",
    "highlights": [
      "16-18mm calibrated natural granite slab",
      "Zero porosity, heat & stain immune",
      "Mandatory A-frame truck transit to prevent cracking",
      "Min order 25 sq ft for full slab integrity"
    ],
    "rating": 4.8,
    "reviewsCount": 142,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "Rajasthan Stone Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-20-south-indian-black-galaxy-polished-gra",
    "slug": "black-galaxy-polished-granite-slab-18mm",
    "name": "Black Galaxy Polished Granite Slab 18mm",
    "title": "Black Galaxy Polished Granite Slab 18mm",
    "brand": "South Indian",
    "oemModelCode": "SI-BLKGALAXY-18MM",
    "subcategory": "Granite Slabs",
    "stoneSubcategory": "GRANITE_SLAB",
    "sellingUnit": "SQ_FT",
    "tileSizeMm": null,
    "piecesPerBox": null,
    "coverageSqFtPerBox": null,
    "effectivePricePerSqFt": 160,
    "surfaceFinish": "Golden Fleck Mirror Polish",
    "thicknessMm": null,
    "minOrderSqFt": 25,
    "batchLockRequired": false,
    "price": 160,
    "mrp": 210,
    "exGstPrice": 136,
    "hsnCode": "6802",
    "gstPercent": 18,
    "brandTier": 2,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "unit": "Sq Ft",
    "spec": "\u20b9160/sq ft",
    "shortTagline": "Iconic Ongole South Indian Black Galaxy Granite with Gold Bronzite Flecks",
    "specChips": [
      "\u20b9160/sq ft",
      "Sold per sq ft (Min order 25 sq ft)",
      "HSN 6802",
      "18% GST",
      "Pickup / Mini-Truck",
      "Golden Fleck Mirror Polish"
    ],
    "image": "",
    "images": [],
    "description": "South Indian Black Galaxy Granite Slab 18mm imported from Chimakurthy/Ongole mines. Features pitch-black backdrop shimmering with natural golden and silver bronzite mineral crystals.",
    "highlights": [
      "18mm calibrated premium gangsaw cut slab",
      "Natural golden bronzite sparkling crystals",
      "Mirror gloss finish > 90 units",
      "Delivered on A-frame mini-truck directly to site"
    ],
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "South Indian Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-21-rajasthan-stone-z-black-absolute-black-pr",
    "slug": "z-black-absolute-black-premium-granite-slab-18mm",
    "name": "Z-Black / Absolute Black Premium Granite Slab 18mm",
    "title": "Z-Black / Absolute Black Premium Granite Slab 18mm",
    "brand": "Rajasthan Stone",
    "oemModelCode": "RS-ZBLACK-18MM",
    "subcategory": "Granite Slabs",
    "stoneSubcategory": "GRANITE_SLAB",
    "sellingUnit": "SQ_FT",
    "tileSizeMm": null,
    "piecesPerBox": null,
    "coverageSqFtPerBox": null,
    "effectivePricePerSqFt": 190,
    "surfaceFinish": "Jet Black High Gloss Line Polished",
    "thicknessMm": null,
    "minOrderSqFt": 25,
    "batchLockRequired": false,
    "price": 190,
    "mrp": 240,
    "exGstPrice": 161,
    "hsnCode": "6802",
    "gstPercent": 18,
    "brandTier": 2,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "unit": "Sq Ft",
    "spec": "\u20b9190/sq ft",
    "shortTagline": "Purest Deep Pitch Jet Black Granite with Zero Pores",
    "specChips": [
      "\u20b9190/sq ft",
      "Sold per sq ft (Min order 25 sq ft)",
      "HSN 6802",
      "18% GST",
      "Pickup / Mini-Truck",
      "Jet Black High Gloss Line Polished"
    ],
    "image": "",
    "images": [],
    "description": "Z-Black (Absolute Black) Premium Granite Slab 18mm offers unmatched monolithic black elegance. Line-polished on Italian machinery with zero color variation or pinholes. The definitive luxury kitchen platform stone.",
    "highlights": [
      "18mm solid thickness line-polished slab",
      "Solid deep jet-black monolithic tone",
      "Scratch-proof Mohs 7 hardness",
      "A-frame transit with edge bubble guards"
    ],
    "rating": 4.8,
    "reviewsCount": 148,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "Rajasthan Stone Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-22-rajasthan-stone-lakha-red-polished-granit",
    "slug": "lakha-red-polished-granite-slab-18mm",
    "name": "Lakha Red Polished Granite Slab 18mm",
    "title": "Lakha Red Polished Granite Slab 18mm",
    "brand": "Rajasthan Stone",
    "oemModelCode": "RS-LAKHARED-18MM",
    "subcategory": "Granite Slabs",
    "stoneSubcategory": "GRANITE_SLAB",
    "sellingUnit": "SQ_FT",
    "tileSizeMm": null,
    "piecesPerBox": null,
    "coverageSqFtPerBox": null,
    "effectivePricePerSqFt": 190,
    "surfaceFinish": "Deep Red Fine Grain Mirror Polish",
    "thicknessMm": null,
    "minOrderSqFt": 25,
    "batchLockRequired": false,
    "price": 190,
    "mrp": 240,
    "exGstPrice": 161,
    "hsnCode": "6802",
    "gstPercent": 18,
    "brandTier": 2,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "unit": "Sq Ft",
    "spec": "\u20b9190/sq ft",
    "shortTagline": "Vibrant Red Natural Granite for Mandir Platforms, Steps & Borders",
    "specChips": [
      "\u20b9190/sq ft",
      "Sold per sq ft (Min order 25 sq ft)",
      "HSN 6802",
      "18% GST",
      "Pickup / Mini-Truck",
      "Deep Red Fine Grain Mirror Polish"
    ],
    "image": "",
    "images": [],
    "description": "Lakha Red Polished Granite Slab 18mm mined in Jodhpur Rajasthan. Renowned for its auspicious crimson red hue sprinkled with subtle micro-crystals. Highly sought after for home mandir altars and stairs.",
    "highlights": [
      "18mm thickness premium gangsaw polished slab",
      "Auspicious deep ruby red color",
      "Immune to weathering, oil spills and heat",
      "Vertical A-frame delivery to prevent transit cracks"
    ],
    "rating": 4.8,
    "reviewsCount": 151,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "Rajasthan Stone Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-23-south-indian-hassan-green-polished-gra",
    "slug": "hassan-green-polished-granite-slab-18mm",
    "name": "Hassan Green Polished Granite Slab 18mm",
    "title": "Hassan Green Polished Granite Slab 18mm",
    "brand": "South Indian",
    "oemModelCode": "SI-HASSANGREEN-18MM",
    "subcategory": "Granite Slabs",
    "stoneSubcategory": "GRANITE_SLAB",
    "sellingUnit": "SQ_FT",
    "tileSizeMm": null,
    "piecesPerBox": null,
    "coverageSqFtPerBox": null,
    "effectivePricePerSqFt": 110,
    "surfaceFinish": "Natural Green Mirror Finish",
    "thicknessMm": null,
    "minOrderSqFt": 25,
    "batchLockRequired": false,
    "price": 110,
    "mrp": 145,
    "exGstPrice": 93,
    "hsnCode": "6802",
    "gstPercent": 18,
    "brandTier": 2,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "unit": "Sq Ft",
    "spec": "\u20b9110/sq ft",
    "shortTagline": "Rich Forest Green Natural Granite for Vanity Counters & Flooring",
    "specChips": [
      "\u20b9110/sq ft",
      "Sold per sq ft (Min order 25 sq ft)",
      "HSN 6802",
      "18% GST",
      "Pickup / Mini-Truck",
      "Natural Green Mirror Finish"
    ],
    "image": "",
    "images": [],
    "description": "Hassan Green Polished Granite Slab 18mm from Karnataka brings deep olive forest green tones with subtle clouding. Exceptional mechanical density and moisture resistance.",
    "highlights": [
      "18mm gangsaw cut slab",
      "Deep natural forest green hue",
      "High abrasion resistance for kitchen & table tops",
      "Min order 25 sq ft with safe A-frame logistics"
    ],
    "rating": 4.8,
    "reviewsCount": 154,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "South Indian Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-24-rajasthan-stone-p-white-platinum-white-gr",
    "slug": "p-white-platinum-white-granite-slab-16-18mm",
    "name": "P-White (Platinum White) Granite Slab 16-18mm",
    "title": "P-White (Platinum White) Granite Slab 16-18mm",
    "brand": "Rajasthan Stone",
    "oemModelCode": "RS-PWHITE-18MM",
    "subcategory": "Granite Slabs",
    "stoneSubcategory": "GRANITE_SLAB",
    "sellingUnit": "SQ_FT",
    "tileSizeMm": null,
    "piecesPerBox": null,
    "coverageSqFtPerBox": null,
    "effectivePricePerSqFt": 60,
    "surfaceFinish": "Uniform White Grain Polish",
    "thicknessMm": null,
    "minOrderSqFt": 25,
    "batchLockRequired": false,
    "price": 60,
    "mrp": 80,
    "exGstPrice": 51,
    "hsnCode": "6802",
    "gstPercent": 18,
    "brandTier": 2,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "unit": "Sq Ft",
    "spec": "\u20b960/sq ft",
    "shortTagline": "Budget-Friendly Platinum White Granite for Staircases & Corridors",
    "specChips": [
      "\u20b960/sq ft",
      "Sold per sq ft (Min order 25 sq ft)",
      "HSN 6802",
      "18% GST",
      "Pickup / Mini-Truck",
      "Uniform White Grain Polish"
    ],
    "image": "",
    "images": [],
    "description": "P-White (Platinum White) Granite Slab 16-18mm is Lucknow's highest-volume natural stone for apartment staircase steps, commercial lobbies, and window sills at an economical \u20b960/sq ft.",
    "highlights": [
      "Economical \u20b960/sq ft natural granite solution",
      "16-18mm thickness with uniform grey-white speckles",
      "Extreme durability exceeding ceramic tiles",
      "Delivered on A-frame truck from Chinhat stockyard"
    ],
    "rating": 4.8,
    "reviewsCount": 157,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "Rajasthan Stone Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-25-rajasthan-stone-alaska-white-exotic-grani",
    "slug": "alaska-white-exotic-granite-slab-18mm",
    "name": "Alaska White Exotic Granite Slab 18mm",
    "title": "Alaska White Exotic Granite Slab 18mm",
    "brand": "Rajasthan Stone",
    "oemModelCode": "RS-ALASKA-18MM",
    "subcategory": "Granite Slabs",
    "stoneSubcategory": "GRANITE_SLAB",
    "sellingUnit": "SQ_FT",
    "tileSizeMm": null,
    "piecesPerBox": null,
    "coverageSqFtPerBox": null,
    "effectivePricePerSqFt": 165,
    "surfaceFinish": "Exotic Veined Gloss Finish",
    "thicknessMm": null,
    "minOrderSqFt": 25,
    "batchLockRequired": false,
    "price": 165,
    "mrp": 215,
    "exGstPrice": 140,
    "hsnCode": "6802",
    "gstPercent": 18,
    "brandTier": 2,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "unit": "Sq Ft",
    "spec": "\u20b9165/sq ft",
    "shortTagline": "Designer Silver-White Exotic Veined Quartz & Feldspar Granite",
    "specChips": [
      "\u20b9165/sq ft",
      "Sold per sq ft (Min order 25 sq ft)",
      "HSN 6802",
      "18% GST",
      "Pickup / Mini-Truck",
      "Exotic Veined Gloss Finish"
    ],
    "image": "",
    "images": [],
    "description": "Alaska White Exotic Granite Slab 18mm showcases swirling frosty white quartz, warm beige feldspar, and dark biotite veins. Gives kitchen islands and bathroom vanities an ultra-luxe Italian appearance.",
    "highlights": [
      "18mm calibrated slab with dramatic natural veins",
      "Natural quartz and feldspar crystallization",
      "Resistant to acidic citrus and turmeric staining",
      "A-frame vertical transit direct to home site"
    ],
    "rating": 4.8,
    "reviewsCount": 160,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "Rajasthan Stone Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-26-indian-marble-katni-beige-polished-marb",
    "slug": "katni-beige-polished-marble-slab-18mm",
    "name": "Katni Beige Polished Marble Slab 18mm",
    "title": "Katni Beige Polished Marble Slab 18mm",
    "brand": "Indian Marble",
    "oemModelCode": "IM-KATNI-18MM",
    "subcategory": "Marble & Natural Stones",
    "stoneSubcategory": "MARBLE_NATURAL_STONE",
    "sellingUnit": "SQ_FT",
    "tileSizeMm": null,
    "piecesPerBox": null,
    "coverageSqFtPerBox": null,
    "effectivePricePerSqFt": 75,
    "surfaceFinish": "Fine Polished Beige Marble",
    "thicknessMm": null,
    "minOrderSqFt": 25,
    "batchLockRequired": false,
    "price": 75,
    "mrp": 98,
    "exGstPrice": 64,
    "hsnCode": "6802",
    "gstPercent": 18,
    "brandTier": 2,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "unit": "Sq Ft",
    "spec": "\u20b975/sq ft",
    "shortTagline": "Warm Beige Natural Indian Marble for Living Hall Flooring",
    "specChips": [
      "\u20b975/sq ft",
      "Sold per sq ft (Min order 25 sq ft)",
      "HSN 6802",
      "18% GST",
      "Pickup / Mini-Truck",
      "Fine Polished Beige Marble"
    ],
    "image": "",
    "images": [],
    "description": "Katni Beige Polished Marble Slab 18mm sourced from Madhya Pradesh quarries. Features warm honey and beige hues with subtle gold waves. Takes a mirror polish and stays cool underfoot during Lucknow summers.",
    "highlights": [
      "18mm thick natural calcite marble slab",
      "Warm beige neutral tone suits all interior woodwork",
      "High polish retention over decades",
      "Vertical A-frame heavy vehicle delivery"
    ],
    "rating": 4.8,
    "reviewsCount": 163,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "Indian Marble Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-27-indian-marble-morwad-banswara-white-mar",
    "slug": "morwad-banswara-white-marble-slab-18mm",
    "name": "Morwad / Banswara White Marble Slab 18mm",
    "title": "Morwad / Banswara White Marble Slab 18mm",
    "brand": "Indian Marble",
    "oemModelCode": "IM-MORWAD-18MM",
    "subcategory": "Marble & Natural Stones",
    "stoneSubcategory": "MARBLE_NATURAL_STONE",
    "sellingUnit": "SQ_FT",
    "tileSizeMm": null,
    "piecesPerBox": null,
    "coverageSqFtPerBox": null,
    "effectivePricePerSqFt": 85,
    "surfaceFinish": "Calcite White Polished with Purple/Grey Veins",
    "thicknessMm": null,
    "minOrderSqFt": 25,
    "batchLockRequired": false,
    "price": 85,
    "mrp": 110,
    "exGstPrice": 72,
    "hsnCode": "6802",
    "gstPercent": 18,
    "brandTier": 2,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "unit": "Sq Ft",
    "spec": "\u20b985/sq ft",
    "shortTagline": "Classic Banswara White Indian Marble with Elegant Veining",
    "specChips": [
      "\u20b985/sq ft",
      "Sold per sq ft (Min order 25 sq ft)",
      "HSN 6802",
      "18% GST",
      "Pickup / Mini-Truck",
      "Calcite White Polished with Purple/Grey Veins"
    ],
    "image": "",
    "images": [],
    "description": "Morwad (Banswara) White Marble Slab 18mm is Rajasthan's most popular residential marble. Pristine white calcite background adorned with flowing grey and violet minerals.",
    "highlights": [
      "18mm calibrated slab with high compressive strength",
      "Rich natural white base with organic grey veining",
      "Long-term thermal insulation keeps rooms naturally cool",
      "A-frame logistics safeguard slab corners"
    ],
    "rating": 4.8,
    "reviewsCount": 166,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "Indian Marble Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-28-makrana-makrana-dungri-albeta-whi",
    "slug": "makrana-dungri-albeta-white-marble-slab-18mm",
    "name": "Makrana Dungri / Albeta White Marble Slab 18mm",
    "title": "Makrana Dungri / Albeta White Marble Slab 18mm",
    "brand": "Makrana",
    "oemModelCode": "MAK-DUNGRI-18MM",
    "subcategory": "Marble & Natural Stones",
    "stoneSubcategory": "MARBLE_NATURAL_STONE",
    "sellingUnit": "SQ_FT",
    "tileSizeMm": null,
    "piecesPerBox": null,
    "coverageSqFtPerBox": null,
    "effectivePricePerSqFt": 160,
    "surfaceFinish": "Dungri Natural Vein Polish",
    "thicknessMm": null,
    "minOrderSqFt": 25,
    "batchLockRequired": false,
    "price": 160,
    "mrp": 210,
    "exGstPrice": 136,
    "hsnCode": "6802",
    "gstPercent": 18,
    "brandTier": 2,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "unit": "Sq Ft",
    "spec": "\u20b9160/sq ft",
    "shortTagline": "Historic 98% Pure Calcite Makrana Dungri Marble",
    "specChips": [
      "\u20b9160/sq ft",
      "Sold per sq ft (Min order 25 sq ft)",
      "HSN 6802",
      "18% GST",
      "Pickup / Mini-Truck",
      "Dungri Natural Vein Polish"
    ],
    "image": "",
    "images": [],
    "description": "Makrana Dungri White Marble Slab 18mm comes from the same legendary veins as the Taj Mahal. Does not require chemical resin treatment and never loses gloss over generations.",
    "highlights": [
      "Authentic 18mm Makrana Dungri quarry stock",
      "98%+ pure calcium carbonate - zero yellowing over time",
      "Silky natural polish that glows in ambient light",
      "Delivered upright on padded A-frames"
    ],
    "rating": 4.8,
    "reviewsCount": 169,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "Makrana Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-29-makrana-makrana-pure-white-premiu",
    "slug": "makrana-pure-white-premium-marble-slab-20mm",
    "name": "Makrana Pure White Premium Marble Slab 20mm",
    "title": "Makrana Pure White Premium Marble Slab 20mm",
    "brand": "Makrana",
    "oemModelCode": "MAK-PUREWHITE-20MM",
    "subcategory": "Marble & Natural Stones",
    "stoneSubcategory": "MARBLE_NATURAL_STONE",
    "sellingUnit": "SQ_FT",
    "tileSizeMm": null,
    "piecesPerBox": null,
    "coverageSqFtPerBox": null,
    "effectivePricePerSqFt": 280,
    "surfaceFinish": "Heritage Pure White Mirror Polish",
    "thicknessMm": null,
    "minOrderSqFt": 25,
    "batchLockRequired": false,
    "price": 280,
    "mrp": 360,
    "exGstPrice": 237,
    "hsnCode": "6802",
    "gstPercent": 18,
    "brandTier": 2,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "unit": "Sq Ft",
    "spec": "\u20b9280/sq ft",
    "shortTagline": "Taj Mahal Grade Flawless Pure White Heritage Marble 20mm",
    "specChips": [
      "\u20b9280/sq ft",
      "Sold per sq ft (Min order 25 sq ft)",
      "HSN 6802",
      "18% GST",
      "Pickup / Mini-Truck",
      "Heritage Pure White Mirror Polish"
    ],
    "image": "",
    "images": [],
    "description": "Makrana Pure White Premium Marble Slab 20mm represents the pinnacle of Indian natural stone. Crystalline snow-white texture with near-zero veins, cut to a solid 20mm thickness.",
    "highlights": [
      "Solid 20mm thickness for lifetime re-polishing",
      "Flawless crystalline pure white Makrana heritage grade",
      "Natural non-porous structure impervious to moisture",
      "Carefully strapped on vertical A-frame delivery trucks"
    ],
    "rating": 4.8,
    "reviewsCount": 172,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "Makrana Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-30-italian-imported-botticino-carrara-polishe",
    "slug": "botticino-carrara-polished-italian-marble-slab-20mm",
    "name": "Botticino / Carrara Polished Italian Marble Slab 20mm",
    "title": "Botticino / Carrara Polished Italian Marble Slab 20mm",
    "brand": "Italian Imported",
    "oemModelCode": "IT-BOTTICINO-20MM",
    "subcategory": "Marble & Natural Stones",
    "stoneSubcategory": "MARBLE_NATURAL_STONE",
    "sellingUnit": "SQ_FT",
    "tileSizeMm": null,
    "piecesPerBox": null,
    "coverageSqFtPerBox": null,
    "effectivePricePerSqFt": 380,
    "surfaceFinish": "Italian Polished Classico High Shine",
    "thicknessMm": null,
    "minOrderSqFt": 25,
    "batchLockRequired": false,
    "price": 380,
    "mrp": 480,
    "exGstPrice": 322,
    "hsnCode": "6802",
    "gstPercent": 18,
    "brandTier": 2,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "unit": "Sq Ft",
    "spec": "\u20b9380/sq ft",
    "shortTagline": "Direct Imported Italian Botticino Classico Marble 20mm",
    "specChips": [
      "\u20b9380/sq ft",
      "Sold per sq ft (Min order 25 sq ft)",
      "HSN 6802",
      "18% GST",
      "Pickup / Mini-Truck",
      "Italian Polished Classico High Shine"
    ],
    "image": "",
    "images": [],
    "description": "Botticino / Carrara Polished Italian Marble Slab 20mm imported from Brescia, Italy. Features a warm beige luminous oyster background with gold ochre accents and fiber-mesh resin backing.",
    "highlights": [
      "Authentic Italian imported Botticino/Carrara 20mm slab",
      "Epoxy resin mesh backed for structural stability",
      "Luxurious luminous glow under chandelier lighting",
      "Mandatory vertical transit with unloading helper support"
    ],
    "rating": 4.8,
    "reviewsCount": 175,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "Italian Imported Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-31-italian-imported-statuario-polished-italia",
    "slug": "statuario-polished-italian-marble-slab-20mm",
    "name": "Statuario Polished Italian Marble Slab 20mm",
    "title": "Statuario Polished Italian Marble Slab 20mm",
    "brand": "Italian Imported",
    "oemModelCode": "IT-STATUARIO-20MM",
    "subcategory": "Marble & Natural Stones",
    "stoneSubcategory": "MARBLE_NATURAL_STONE",
    "sellingUnit": "SQ_FT",
    "tileSizeMm": null,
    "piecesPerBox": null,
    "coverageSqFtPerBox": null,
    "effectivePricePerSqFt": 550,
    "surfaceFinish": "Signature Bold Grey Vein Mirror Polish",
    "thicknessMm": null,
    "minOrderSqFt": 25,
    "batchLockRequired": false,
    "price": 550,
    "mrp": 700,
    "exGstPrice": 466,
    "hsnCode": "6802",
    "gstPercent": 18,
    "brandTier": 2,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "unit": "Sq Ft",
    "spec": "\u20b9550/sq ft",
    "shortTagline": "Masterpiece Italian Statuario Marble with Dramatic Book-Match Veins",
    "specChips": [
      "\u20b9550/sq ft",
      "Sold per sq ft (Min order 25 sq ft)",
      "HSN 6802",
      "18% GST",
      "Pickup / Mini-Truck",
      "Signature Bold Grey Vein Mirror Polish"
    ],
    "image": "",
    "images": [],
    "description": "Statuario Polished Italian Marble 20mm is the world's most coveted natural stone. Mined in Carrara, Italy, its bright white field is crossed by sweeping charcoal-grey river veins.",
    "highlights": [
      "Genuine Carrara Italian Statuario 20mm gangsaw slab",
      "Dramatic book-match veining for signature drawing halls",
      "Resin-infused backing prevents handling fracture",
      "White-glove vertical transport on specialized A-frames"
    ],
    "rating": 4.8,
    "reviewsCount": 178,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "Italian Imported Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-32-kota-stone-kota-grey-unpolished-cut-",
    "slug": "kota-grey-unpolished-cut-flooring-stone-22x22-in",
    "name": "Kota Grey Unpolished/Cut Flooring Stone 22x22 in",
    "title": "Kota Grey Unpolished/Cut Flooring Stone 22x22 in",
    "brand": "Kota Stone",
    "oemModelCode": "KT-GREY-UNPOL-22X22",
    "subcategory": "Marble & Natural Stones",
    "stoneSubcategory": "MARBLE_NATURAL_STONE",
    "sellingUnit": "SQ_FT",
    "tileSizeMm": null,
    "piecesPerBox": null,
    "coverageSqFtPerBox": null,
    "effectivePricePerSqFt": 26,
    "surfaceFinish": "Rough Cut Calibrated Natural Non-Slip",
    "thicknessMm": null,
    "minOrderSqFt": 25,
    "batchLockRequired": false,
    "price": 26,
    "mrp": 35,
    "exGstPrice": 25,
    "hsnCode": "2515",
    "gstPercent": 5,
    "brandTier": 2,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "unit": "Sq Ft",
    "spec": "\u20b926/sq ft",
    "shortTagline": "Natural Unpolished Kota Stone (5% GST HSN 2515) for Basements & Pathways",
    "specChips": [
      "\u20b926/sq ft",
      "Sold per sq ft (Min order 25 sq ft)",
      "HSN 2515",
      "5% GST",
      "Pickup / Mini-Truck",
      "Rough Cut Calibrated Natural Non-Slip"
    ],
    "image": "",
    "images": [],
    "description": "Kota Grey Unpolished/Cut Flooring Stone 22x22 in (approx 25-30mm thick). Limestone quarried in Kota, Rajasthan. Naturally slip-resistant, non-water absorbent, and compliant with 2026 5% GST HSN 2515.",
    "highlights": [
      "2026 GST compliant: strictly 5% GST (HSN 2515)",
      "22x22 inch rough machine-cut natural limestone",
      "Ultra-durable for factories, driveways, basements & corridors",
      "Heavy truck A-frame delivery direct from stockyard"
    ],
    "rating": 4.8,
    "reviewsCount": 181,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "Kota Stone Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-33-kota-stone-kota-high-polished-floori",
    "slug": "kota-high-polished-flooring-slab-22x22-in",
    "name": "Kota High-Polished Flooring Slab 22x22 in",
    "title": "Kota High-Polished Flooring Slab 22x22 in",
    "brand": "Kota Stone",
    "oemModelCode": "KT-POLISHED-22X22",
    "subcategory": "Marble & Natural Stones",
    "stoneSubcategory": "MARBLE_NATURAL_STONE",
    "sellingUnit": "SQ_FT",
    "tileSizeMm": null,
    "piecesPerBox": null,
    "coverageSqFtPerBox": null,
    "effectivePricePerSqFt": 34,
    "surfaceFinish": "High Gloss Machine Polished Kota Green",
    "thicknessMm": null,
    "minOrderSqFt": 25,
    "batchLockRequired": false,
    "price": 34,
    "mrp": 45,
    "exGstPrice": 29,
    "hsnCode": "6802",
    "gstPercent": 18,
    "brandTier": 2,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "unit": "Sq Ft",
    "spec": "\u20b934/sq ft",
    "shortTagline": "Factory Machine-Polished Kota Green Stone Slab (18% GST HSN 6802)",
    "specChips": [
      "\u20b934/sq ft",
      "Sold per sq ft (Min order 25 sq ft)",
      "HSN 6802",
      "18% GST",
      "Pickup / Mini-Truck",
      "High Gloss Machine Polished Kota Green"
    ],
    "image": "",
    "images": [],
    "description": "Kota High-Polished Flooring Slab 22x22 in provides a clean bluish-green natural sheen. Milled with mirror-gloss polish on one side and ready for immediate laying with Birla White or grey cement mortar.",
    "highlights": [
      "Polished stone slab 18% GST (HSN 6802)",
      "22x22 inch calibrated tiles with high shine",
      "Naturally non-porous and hygienic for hospitals & schools",
      "Safely transported via A-frame mini-truck"
    ],
    "rating": 4.8,
    "reviewsCount": 184,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "Kota Stone Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-34-natural-stone-cuddapah-kadappa-black-po",
    "slug": "cuddapah-kadappa-black-polished-stone-slab",
    "name": "Cuddapah (Kadappa) Black Polished Stone Slab",
    "title": "Cuddapah (Kadappa) Black Polished Stone Slab",
    "brand": "Natural Stone",
    "oemModelCode": "NS-KADAPPA-20MM",
    "subcategory": "Marble & Natural Stones",
    "stoneSubcategory": "MARBLE_NATURAL_STONE",
    "sellingUnit": "SQ_FT",
    "tileSizeMm": null,
    "piecesPerBox": null,
    "coverageSqFtPerBox": null,
    "effectivePricePerSqFt": 45,
    "surfaceFinish": "Fine Honed/Polished Black Slate",
    "thicknessMm": null,
    "minOrderSqFt": 25,
    "batchLockRequired": false,
    "price": 45,
    "mrp": 60,
    "exGstPrice": 38,
    "hsnCode": "6802",
    "gstPercent": 18,
    "brandTier": 2,
    "deliveryVehicleType": "Pickup / Mini-Truck",
    "unit": "Sq Ft",
    "spec": "\u20b945/sq ft",
    "shortTagline": "Dense Jet Black Cuddapah Limestone Slab for Kitchen Shelves & Base Plinths",
    "specChips": [
      "\u20b945/sq ft",
      "Sold per sq ft (Min order 25 sq ft)",
      "HSN 6802",
      "18% GST",
      "Pickup / Mini-Truck",
      "Fine Honed/Polished Black Slate"
    ],
    "image": "",
    "images": [],
    "description": "Cuddapah (Kadappa) Black Polished Stone Slab from Andhra Pradesh is Lucknow's classic choice for kitchen cabinets, pantry vertical partitions, sink slabs, and boundary wall plinths.",
    "highlights": [
      "20mm thick dense black metamorphic limestone",
      "Impermeable to water and kitchen chemicals",
      "High load-bearing capacity for vertical shelf supports",
      "Heavy-vehicle A-frame transit to eliminate transit breakage"
    ],
    "rating": 4.8,
    "reviewsCount": 187,
    "deliveryTime": "Same Day Express",
    "inStock": true,
    "vendor": "Natural Stone Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-35-roff-roff-rainbow-tile-mate-ce",
    "slug": "roff-rainbow-tile-mate-cementitious-grout-1kg-ivory-terracotta",
    "name": "Roff Rainbow Tile Mate Cementitious Grout 1kg (Ivory/Terracotta)",
    "title": "Roff Rainbow Tile Mate Cementitious Grout 1kg (Ivory/Terracotta)",
    "brand": "Roff",
    "oemModelCode": "ROFF-RTM-1KG",
    "subcategory": "Grouts, Epoxy, Spacers & Cutting Tools",
    "stoneSubcategory": "GROUT_AND_TOOLS",
    "sellingUnit": "PACK_OR_PIECE",
    "tileSizeMm": null,
    "piecesPerBox": null,
    "coverageSqFtPerBox": null,
    "effectivePricePerSqFt": null,
    "surfaceFinish": null,
    "thicknessMm": null,
    "minOrderSqFt": null,
    "batchLockRequired": false,
    "price": 75,
    "mrp": 95,
    "exGstPrice": 64,
    "hsnCode": "3214",
    "gstPercent": 18,
    "brandTier": 3,
    "deliveryVehicleType": "2-Wheeler",
    "unit": "1 kg Pack",
    "spec": "1 kg Pack",
    "shortTagline": "Water-Resistant Polymer-Modified Cementitious Tile Joint Grout",
    "specChips": [
      "1 kg Pack",
      "HSN 3214",
      "18% GST",
      "2-Wheeler"
    ],
    "image": "",
    "images": [],
    "description": "Roff Rainbow Tile Mate is a premium polymer-modified cementitious joint filler for ceramic wall and vitrified floor tiles (1-5mm joint width). Provides vibrant crack-free joint sealing.",
    "highlights": [
      "1 kg pack fills up to 40-50 sq ft of 300x450mm tile joints",
      "Non-shrinking polymer-modified formulation",
      "Water-resistant and fungal growth resistant",
      "60-minute express delivery via 2-Wheeler"
    ],
    "rating": 4.8,
    "reviewsCount": 190,
    "deliveryTime": "60 Mins",
    "inStock": true,
    "vendor": "Roff Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-36-roff-roff-t13-rainbow-tile-mat",
    "slug": "roff-t13-rainbow-tile-mate-epoxy-grout-1kg-kit",
    "name": "Roff T13 Rainbow Tile Mate Epoxy Grout 1kg Kit",
    "title": "Roff T13 Rainbow Tile Mate Epoxy Grout 1kg Kit",
    "brand": "Roff",
    "oemModelCode": "ROFF-T13-1KG",
    "subcategory": "Grouts, Epoxy, Spacers & Cutting Tools",
    "stoneSubcategory": "GROUT_AND_TOOLS",
    "sellingUnit": "PACK_OR_PIECE",
    "tileSizeMm": null,
    "piecesPerBox": null,
    "coverageSqFtPerBox": null,
    "effectivePricePerSqFt": null,
    "surfaceFinish": null,
    "thicknessMm": null,
    "minOrderSqFt": null,
    "batchLockRequired": false,
    "price": 710,
    "mrp": 850,
    "exGstPrice": 602,
    "hsnCode": "3214",
    "gstPercent": 18,
    "brandTier": 3,
    "deliveryVehicleType": "2-Wheeler",
    "unit": "1 kg Kit",
    "spec": "1 kg Kit (Resin + Hardener + Filler)",
    "shortTagline": "100% Waterproof Stain-Proof 3-Part Epoxy Tile Joint Grout",
    "specChips": [
      "1 kg Kit (Resin + Hardener + Filler)",
      "HSN 3214",
      "18% GST",
      "2-Wheeler"
    ],
    "image": "",
    "images": [],
    "description": "Roff T13 Rainbow Tile Mate Epoxy Grout is a 3-component chemical resistant epoxy system for luxury vitrified tile and granite flooring joints. Resists turmeric, acid, oil, and chemical stains.",
    "highlights": [
      "100% stain-proof & waterproof epoxy formulation",
      "Immune to oil, grease, tea, coffee & haldi stains",
      "High mechanical strength prevents joint chipping",
      "Essential for large format vitrified floor joints"
    ],
    "rating": 4.8,
    "reviewsCount": 193,
    "deliveryTime": "60 Mins",
    "inStock": true,
    "vendor": "Roff Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-37-myk-laticrete-myk-laticrete-sp-100-stai",
    "slug": "myk-laticrete-sp-100-stainfree-3-component-epoxy-tile-grout-1kg",
    "name": "MYK Laticrete SP-100 Stainfree 3-Component Epoxy Tile Grout 1kg",
    "title": "MYK Laticrete SP-100 Stainfree 3-Component Epoxy Tile Grout 1kg",
    "brand": "MYK Laticrete",
    "oemModelCode": "MYK-SP100-1KG",
    "subcategory": "Grouts, Epoxy, Spacers & Cutting Tools",
    "stoneSubcategory": "GROUT_AND_TOOLS",
    "sellingUnit": "PACK_OR_PIECE",
    "tileSizeMm": null,
    "piecesPerBox": null,
    "coverageSqFtPerBox": null,
    "effectivePricePerSqFt": null,
    "surfaceFinish": null,
    "thicknessMm": null,
    "minOrderSqFt": null,
    "batchLockRequired": false,
    "price": 791,
    "mrp": 950,
    "exGstPrice": 670,
    "hsnCode": "3214",
    "gstPercent": 18,
    "brandTier": 3,
    "deliveryVehicleType": "2-Wheeler",
    "unit": "1 kg Kit",
    "spec": "1 kg Kit",
    "shortTagline": "World's Benchmark Stainfree 100% Solid Epoxy Joint Filler",
    "specChips": [
      "1 kg Kit",
      "HSN 3214",
      "18% GST",
      "2-Wheeler"
    ],
    "image": "",
    "images": [],
    "description": "MYK Laticrete SP-100 Stainfree is the gold standard for floor tile jointing. Complete 3-part kit (Part A resin, Part B hardener, Part C colored filler). Never cracks or discolors.",
    "highlights": [
      "ANSI A118.3 certified 100% solid epoxy grout",
      "Zero stain absorption - wipes clean with damp sponge",
      "UV-stable color pigments for indoor/outdoor use",
      "Express 60-min bike courier delivery in Lucknow"
    ],
    "rating": 4.8,
    "reviewsCount": 196,
    "deliveryTime": "60 Mins",
    "inStock": true,
    "vendor": "MYK Laticrete Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-38-roff-roff-t16-cera-clean-tile-",
    "slug": "roff-t16-cera-clean-tile-ceramic-cleaner-1l",
    "name": "Roff T16 Cera Clean Tile & Ceramic Cleaner 1L",
    "title": "Roff T16 Cera Clean Tile & Ceramic Cleaner 1L",
    "brand": "Roff",
    "oemModelCode": "ROFF-T16-1L",
    "subcategory": "Grouts, Epoxy, Spacers & Cutting Tools",
    "stoneSubcategory": "GROUT_AND_TOOLS",
    "sellingUnit": "PACK_OR_PIECE",
    "tileSizeMm": null,
    "piecesPerBox": null,
    "coverageSqFtPerBox": null,
    "effectivePricePerSqFt": null,
    "surfaceFinish": null,
    "thicknessMm": null,
    "minOrderSqFt": null,
    "batchLockRequired": false,
    "price": 189,
    "mrp": 230,
    "exGstPrice": 160,
    "hsnCode": "3402",
    "gstPercent": 18,
    "brandTier": 3,
    "deliveryVehicleType": "2-Wheeler",
    "unit": "1 L Bottle",
    "spec": "1 Litre Bottle",
    "shortTagline": "Heavy-Duty Tile, Ceramic & Sanitary Ware Chemical Cleaner",
    "specChips": [
      "1 Litre Bottle",
      "HSN 3402",
      "18% GST",
      "2-Wheeler"
    ],
    "image": "",
    "images": [],
    "description": "Roff T16 Cera Clean 1L rapidly removes tough cement residue, grout haze, white water scale, and construction grime from new vitrified tiles, ceramic walls, and bathroom fittings.",
    "highlights": [
      "Dissolves dried cement residue & construction grout haze",
      "Cleans hard-water mineral stains without harming tile glaze",
      "Non-fuming gentle formula",
      "60-minute express courier delivery"
    ],
    "rating": 4.8,
    "reviewsCount": 199,
    "deliveryTime": "60 Mins",
    "inStock": true,
    "vendor": "Roff Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-39-leqwell-leqwell-3mm-reusable-tile",
    "slug": "leqwell-3mm-reusable-tile-spacers-pack-of-100",
    "name": "Leqwell 3mm Reusable Tile Spacers (Pack of 100)",
    "title": "Leqwell 3mm Reusable Tile Spacers (Pack of 100)",
    "brand": "Leqwell",
    "oemModelCode": "LEQ-SPC-3MM-100",
    "subcategory": "Grouts, Epoxy, Spacers & Cutting Tools",
    "stoneSubcategory": "GROUT_AND_TOOLS",
    "sellingUnit": "PACK_OR_PIECE",
    "tileSizeMm": null,
    "piecesPerBox": null,
    "coverageSqFtPerBox": null,
    "effectivePricePerSqFt": null,
    "surfaceFinish": null,
    "thicknessMm": null,
    "minOrderSqFt": null,
    "batchLockRequired": false,
    "price": 130,
    "mrp": 180,
    "exGstPrice": 110,
    "hsnCode": "3926",
    "gstPercent": 18,
    "brandTier": 3,
    "deliveryVehicleType": "2-Wheeler",
    "unit": "Pack (100 pcs)",
    "spec": "Pack of 100 pcs (3mm Cross)",
    "shortTagline": "Precision Cross Spacers for Uniform Tile Grout Lines",
    "specChips": [
      "Pack of 100 pcs (3mm Cross)",
      "HSN 3926",
      "18% GST",
      "2-Wheeler"
    ],
    "image": "",
    "images": [],
    "description": "Leqwell 3mm Reusable Cross Tile Spacers ensure exact 3mm joint symmetry across all floor and wall tile installations. Virgin durable plastic prevents crushing under heavy tiles.",
    "highlights": [
      "Pack of 100 precision injection-molded spacers",
      "Guarantees straight, uniform 3mm grout joints",
      "Reusable high-density plastic",
      "Universal fit for vitrified tiles and ceramic slabs"
    ],
    "rating": 4.8,
    "reviewsCount": 202,
    "deliveryTime": "60 Mins",
    "inStock": true,
    "vendor": "Leqwell Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-40-fastobond-fastobond-tile-leveling-s",
    "slug": "fastobond-tile-leveling-system-kit-50-clips-50-wedges",
    "name": "Fastobond Tile Leveling System Kit (50 Clips + 50 Wedges)",
    "title": "Fastobond Tile Leveling System Kit (50 Clips + 50 Wedges)",
    "brand": "Fastobond",
    "oemModelCode": "FB-TLS-KIT-50",
    "subcategory": "Grouts, Epoxy, Spacers & Cutting Tools",
    "stoneSubcategory": "GROUT_AND_TOOLS",
    "sellingUnit": "PACK_OR_PIECE",
    "tileSizeMm": null,
    "piecesPerBox": null,
    "coverageSqFtPerBox": null,
    "effectivePricePerSqFt": null,
    "surfaceFinish": null,
    "thicknessMm": null,
    "minOrderSqFt": null,
    "batchLockRequired": false,
    "price": 350,
    "mrp": 450,
    "exGstPrice": 297,
    "hsnCode": "3926",
    "gstPercent": 18,
    "brandTier": 3,
    "deliveryVehicleType": "2-Wheeler",
    "unit": "Kit (50+50)",
    "spec": "50 Clips + 50 Reusable Wedges",
    "shortTagline": "Anti-Lippage Tile Leveling Kit for Seamless Flat Floors",
    "specChips": [
      "50 Clips + 50 Reusable Wedges",
      "HSN 3926",
      "18% GST",
      "2-Wheeler"
    ],
    "image": "",
    "images": [],
    "description": "Fastobond Tile Leveling System Starter Kit includes 50 disposable 1.5mm clips and 50 heavy-duty reusable wedges. Eliminates tile lippage and uneven edges on large format 600x1200mm tiles.",
    "highlights": [
      "Eliminates tile lippage for perfectly flat floors",
      "50 break-away 1.5mm clips + 50 reusable wedges",
      "Accelerates tile installation by up to 40%",
      "Recommended for 600x600 & 600x1200mm vitrified tiles"
    ],
    "rating": 4.8,
    "reviewsCount": 205,
    "deliveryTime": "60 Mins",
    "inStock": true,
    "vendor": "Fastobond Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-41-flamingo-flamingo-pro-tile-levelin",
    "slug": "flamingo-pro-tile-leveling-system-300-clips-100-wedges",
    "name": "Flamingo Pro Tile Leveling System (300 Clips + 100 Wedges)",
    "title": "Flamingo Pro Tile Leveling System (300 Clips + 100 Wedges)",
    "brand": "Flamingo",
    "oemModelCode": "FLM-PRO-TLS-400",
    "subcategory": "Grouts, Epoxy, Spacers & Cutting Tools",
    "stoneSubcategory": "GROUT_AND_TOOLS",
    "sellingUnit": "PACK_OR_PIECE",
    "tileSizeMm": null,
    "piecesPerBox": null,
    "coverageSqFtPerBox": null,
    "effectivePricePerSqFt": null,
    "surfaceFinish": null,
    "thicknessMm": null,
    "minOrderSqFt": null,
    "batchLockRequired": false,
    "price": 751,
    "mrp": 950,
    "exGstPrice": 636,
    "hsnCode": "3926",
    "gstPercent": 18,
    "brandTier": 3,
    "deliveryVehicleType": "2-Wheeler",
    "unit": "Pack (300+100)",
    "spec": "300 Clips + 100 Reusable Wedges",
    "shortTagline": "Contractor-Grade Anti-Lippage Leveling System for Large Projects",
    "specChips": [
      "300 Clips + 100 Reusable Wedges",
      "HSN 3926",
      "18% GST",
      "2-Wheeler"
    ],
    "image": "",
    "images": [],
    "description": "Flamingo Pro Tile Leveling System provides contractor volume: 300 disposable clips and 100 heavy-gauge reusable wedges. Covers ~300-400 sq ft of large format vitrified tiles with zero lippage.",
    "highlights": [
      "Full contractor pack: 300 clips + 100 reusable wedges",
      "Flawless mirror-flat finish on 600x1200 & 800x800mm tiles",
      "Easy clean snap-off base after adhesive cures",
      "Essential for professional tile masons in Lucknow"
    ],
    "rating": 4.8,
    "reviewsCount": 208,
    "deliveryTime": "60 Mins",
    "inStock": true,
    "vendor": "Flamingo Authorized Stockyard / Depot"
  },
  {
    "id": "prod-tiles-42-bosch-bosch-4-inch-110mm-contin",
    "slug": "bosch-4-inch-110mm-continuous-rim-diamond-tile-blade-2607019471",
    "name": "Bosch 4-Inch (110mm) Continuous Rim Diamond Tile Blade 2607019471",
    "title": "Bosch 4-Inch (110mm) Continuous Rim Diamond Tile Blade 2607019471",
    "brand": "Bosch",
    "oemModelCode": "2607019471",
    "subcategory": "Grouts, Epoxy, Spacers & Cutting Tools",
    "stoneSubcategory": "GROUT_AND_TOOLS",
    "sellingUnit": "PACK_OR_PIECE",
    "tileSizeMm": null,
    "piecesPerBox": null,
    "coverageSqFtPerBox": null,
    "effectivePricePerSqFt": null,
    "surfaceFinish": null,
    "thicknessMm": null,
    "minOrderSqFt": null,
    "batchLockRequired": false,
    "price": 421,
    "mrp": 550,
    "exGstPrice": 357,
    "hsnCode": "8202",
    "gstPercent": 18,
    "brandTier": 3,
    "deliveryVehicleType": "2-Wheeler",
    "unit": "Piece",
    "spec": "110mm x 20/16mm Bore",
    "shortTagline": "German-Engineered Chip-Free Diamond Blade for Vitrified Tiles & Granite",
    "specChips": [
      "110mm x 20/16mm Bore",
      "HSN 8202",
      "18% GST",
      "2-Wheeler"
    ],
    "image": "",
    "images": [],
    "description": "Bosch 110mm (4-Inch) Continuous Rim Diamond Cutting Disc (2607019471) is optimized for angle grinders and marble cutters. Delivers razor-clean, chip-free cuts on vitrified tiles, ceramic slabs, and granite.",
    "highlights": [
      "Bosch OEM Part Number: 2607019471",
      "Continuous rim profile for zero-chip cuts on glazed porcelain",
      "High diamond concentration for long cutting life",
      "60-minute express courier delivery"
    ],
    "rating": 4.8,
    "reviewsCount": 211,
    "deliveryTime": "60 Mins",
    "inStock": true,
    "vendor": "Bosch Authorized Stockyard / Depot"
  }
];

export interface TilesStorefrontProps {
  onOpenDetail?: (product: Product) => void;
}

export const TilesCollectionStorefront: React.FC<TilesStorefrontProps> = ({ onOpenDetail }) => {
  const queryClient = useQueryClient();
  const { resolveProduct } = useProductMediaVault();
  const { data: cartData } = useGetCart();
  const addToCartMutation = useAddToCart();
  const updateCartMutation = useUpdateCartItem();
  const removeFromCartMutation = useRemoveFromCart();

  const [activeSubcategory, setActiveSubcategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [modalProduct, setModalProduct] = useState<TileStoneProduct | null>(null);

  // Room Area Calculator state
  const [calcAreaSqFt, setCalcAreaSqFt] = useState<number>(150);
  const [calcSelectedTileId, setCalcSelectedTileId] = useState<string>("prod-tiles-01-kajaria-kajaria-eternity-zion-m");
  const [showCalculator, setShowCalculator] = useState<boolean>(true);
  const [unloadingHelperChecked, setUnloadingHelperChecked] = useState<boolean>(false);

  // Subcategories config
  const subcategories = [
    { id: "all", name: "All Products", count: TILES_STONE_PRODUCTS.length },
    {
      id: "vitrified-floor-tiles",
      name: "Vitrified Floor Tiles",
      stoneSubcategory: "VITRIFIED_TILE",
      count: TILES_STONE_PRODUCTS.filter((p) => p.stoneSubcategory === "VITRIFIED_TILE").length,
    },
    {
      id: "ceramic-wall-parking-tiles",
      name: "Ceramic Wall & Parking",
      stoneSubcategory: "WALL_PARKING_TILE",
      count: TILES_STONE_PRODUCTS.filter((p) => p.stoneSubcategory === "WALL_PARKING_TILE").length,
    },
    {
      id: "granite-slabs",
      name: "Granite Slabs",
      stoneSubcategory: "GRANITE_SLAB",
      count: TILES_STONE_PRODUCTS.filter((p) => p.stoneSubcategory === "GRANITE_SLAB").length,
    },
    {
      id: "marble-natural-stones",
      name: "Marble & Natural Stones",
      stoneSubcategory: "MARBLE_NATURAL_STONE",
      count: TILES_STONE_PRODUCTS.filter((p) => p.stoneSubcategory === "MARBLE_NATURAL_STONE").length,
    },
    {
      id: "grouts-tools",
      name: "Grouts, Epoxy & Tools",
      stoneSubcategory: "GROUT_AND_TOOLS",
      count: TILES_STONE_PRODUCTS.filter((p) => p.stoneSubcategory === "GROUT_AND_TOOLS").length,
    },
  ];

  // Unique Brands
  const brands = useMemo(() => {
    const b = Array.from(new Set(TILES_STONE_PRODUCTS.map((p) => p.brand)));
    return ["all", ...b];
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return TILES_STONE_PRODUCTS.map((p) => resolveProduct(p)).filter((p) => {
      // Subcategory filter
      if (activeSubcategory !== "all") {
        const matchedSub = subcategories.find((s) => s.id === activeSubcategory);
        if (matchedSub && matchedSub.stoneSubcategory && p.stoneSubcategory !== matchedSub.stoneSubcategory) {
          return false;
        }
      }
      // Brand filter
      if (selectedBrand !== "all" && p.brand !== selectedBrand) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchBrand = p.brand.toLowerCase().includes(q);
        const matchFinish = p.surfaceFinish?.toLowerCase().includes(q) ?? false;
        const matchOem = p.oemModelCode.toLowerCase().includes(q);
        return matchName || matchBrand || matchFinish || matchOem;
      }
      return true;
    });
  }, [activeSubcategory, selectedBrand, searchQuery, resolveProduct]);

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

  const cartItemByKey = useMemo(() => {
    const map = new Map<string, { id: string; materialId: string; quantity: number }>();
    for (const item of cartItems) {
      map.set(item.materialId, item);
      if (item.name) map.set(item.name.toLowerCase(), item);
    }
    return map;
  }, [cartItems]);

  const getCartQuantity = (product: TileStoneProduct): number => {
    const item = cartItemByKey.get(product.id) || cartItemByKey.get(product.name.toLowerCase());
    return item ? item.quantity : 0;
  };

  const handleAddToCart = (product: TileStoneProduct, quantity: number = 1) => {
    const current = cartItemByKey.get(product.id) || cartItemByKey.get(product.name.toLowerCase());
    if (current) {
      updateCartMutation.mutate(
        { itemId: current.id, data: { quantity: current.quantity + quantity } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
            toast.success(`Updated ${product.name} in cart`);
          },
          onError: () => {
            toast.error("Failed to update cart");
          },
        }
      );
    } else {
      addToCartMutation.mutate(
        {
          data: {
            materialId: product.id,
            quantity: quantity,
            name: product.name,
            price: product.price,
            unit: product.unit,
            vendor: product.vendor,
            category: "Tiles, Marble & Granite",
          },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
            toast.success(`Added ${quantity} ${product.unit}${quantity > 1 ? "s" : ""} of ${product.name} to cart`);
          },
          onError: () => {
            toast.error("Failed to add to cart");
          },
        }
      );
    }
  };

  const handleUpdateQty = (product: TileStoneProduct, newQty: number) => {
    const current = cartItemByKey.get(product.id) || cartItemByKey.get(product.name.toLowerCase());
    if (!current) {
      if (newQty > 0) handleAddToCart(product, newQty);
      return;
    }
    if (newQty <= 0) {
      removeFromCartMutation.mutate(
        { itemId: current.id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
            toast.info(`Removed ${product.name} from cart`);
          },
          onError: () => {
            toast.error("Failed to remove from cart");
          },
        }
      );
    } else {
      updateCartMutation.mutate(
        { itemId: current.id, data: { quantity: newQty } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          },
          onError: () => {
            toast.error("Failed to update quantity");
          },
        }
      );
    }
  };

  // Selected tile for room calculator
  const selectedTile = useMemo(() => {
    return (
      TILES_STONE_PRODUCTS.find((p) => p.id === calcSelectedTileId) ||
      TILES_STONE_PRODUCTS[0]
    );
  }, [calcSelectedTileId]);

  // Calculation Math:
  // Math.ceil((calcAreaSqFt * 1.10) / coverageSqFtPerBox)
  const calcCoveragePerBox = selectedTile.coverageSqFtPerBox || 15.5;
  const calcGrossAreaSqFt = Math.round(calcAreaSqFt * 1.10 * 10) / 10;
  const calcBoxesNeeded = Math.ceil((calcAreaSqFt * 1.10) / calcCoveragePerBox);
  const calcTotalCost = calcBoxesNeeded * selectedTile.price;

  // Convert TileStoneProduct to ProductCard modal type
  const toProductCardType = (p: TileStoneProduct): Product => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    name: p.title,
    materialTag: p.surfaceFinish || p.subcategory,
    price: p.price,
    mrp: p.mrp,
    unit: p.unit,
    image: p.image,
    deliveryEta: p.deliveryTime,
    rating: p.rating,
    reviews: p.reviewsCount,
    brand: p.brand,
    vendor: p.vendor,
    description: p.description,
    specs: [
      { label: "HSN Code", value: p.hsnCode },
      { label: "GST Rate", value: `${p.gstPercent}% (Included)` },
      { label: "Base Pre-GST", value: `₹${p.exGstPrice}` },
      { label: "Delivery Vehicle", value: p.deliveryVehicleType },
      ...(p.effectivePricePerSqFt ? [{ label: "Effective Rate", value: `₹${p.effectivePricePerSqFt}/sq ft` }] : []),
      ...(p.coverageSqFtPerBox ? [{ label: "Box Coverage", value: `${p.coverageSqFtPerBox} sq ft` }] : []),
      ...(p.piecesPerBox ? [{ label: "Pieces / Box", value: `${p.piecesPerBox}` }] : []),
      ...(p.tileSizeMm ? [{ label: "Size", value: p.tileSizeMm }] : []),
      ...(p.thicknessMm ? [{ label: "Thickness", value: `${p.thicknessMm} mm` }] : []),
      ...(p.minOrderSqFt ? [{ label: "Min Order", value: `${p.minOrderSqFt} sq ft` }] : []),
    ],
  });

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white px-4 py-8 shadow-md border-b border-emerald-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-800/80 rounded-full text-xs font-semibold text-emerald-200 border border-emerald-600 mb-2">
                <Truck className="w-3.5 h-3.5 text-emerald-300" />
                Lucknow Local Stockyard Direct • Shaheed Path • Transport Nagar • Chinhat
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                Tiles, Marble & Granite
              </h1>
              <p className="text-emerald-100/90 text-sm sm:text-base mt-1 max-w-2xl">
                Vitrified floor slabs, ceramic wall tiles, mirror-polished granite & authentic natural marble with guaranteed single-batch shade locks and specialized A-Frame transport.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setShowCalculator(!showCalculator)}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-xl shadow-lg transition-all text-sm cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
                {showCalculator ? "Hide Room Calculator" : "Room Area Calculator (+10% Wastage)"}
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-800/60 text-xs text-emerald-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Single Batch / Shade Lock</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-teal-400 shrink-0" />
              <span>A-Frame Vertical Heavy Transit</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>60-Min Express on Grouts & Tools</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>2026 GST Ready (5% Kota / 18% Tiles)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Room Area & Box Calculator */}
      {showCalculator && (
        <div className="max-w-7xl mx-auto px-4 mt-6">
          <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-emerald-700/60">
            <div className="flex items-center justify-between border-b border-emerald-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">
                  Interactive Room Area & Tile Box Calculator (+10% Cutting Margin)
                </h2>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30">
                Mason-Standard Formula
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Input 1: Room Area in sq ft */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                  Room Floor / Wall Area (Sq Ft)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="10"
                    max="10000"
                    step="5"
                    value={calcAreaSqFt}
                    onChange={(e) => setCalcAreaSqFt(Math.max(1, Number(e.target.value) || 0))}
                    className="w-full bg-slate-900/80 border border-emerald-600 rounded-xl px-4 py-2.5 text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <span className="text-sm font-semibold text-emerald-300 shrink-0">sq ft</span>
                </div>
                <p className="text-[11px] text-emerald-300/80">
                  Example: 10×12 ft Bedroom = 120 sq ft • 15×20 ft Living Hall = 300 sq ft
                </p>
              </div>

              {/* Input 2: Select Tile */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                  Select Tile Size & Brand
                </label>
                <select
                  value={calcSelectedTileId}
                  onChange={(e) => setCalcSelectedTileId(e.target.value)}
                  className="w-full bg-slate-900/80 border border-emerald-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                >
                  {TILES_STONE_PRODUCTS.filter((p) => p.sellingUnit === "BOX").map((tile) => (
                    <option key={tile.id} value={tile.id} className="bg-slate-900 text-white">
                      {tile.brand} - {tile.tileSizeMm} ({tile.coverageSqFtPerBox} sq ft/box) - ₹{tile.price}
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-emerald-200 flex items-center justify-between">
                  <span>Box Coverage: <strong>{calcCoveragePerBox} sq ft</strong></span>
                  <span>Effective Rate: <strong>₹{selectedTile.effectivePricePerSqFt}/sq ft</strong></span>
                </div>
              </div>

              {/* Output: Calculated Boxes & 1-Click Order */}
              <div className="bg-emerald-950/70 border border-emerald-600/60 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-emerald-300 font-semibold mb-1">
                    Coverage Breakdown:
                  </div>
                  <div className="text-xs text-emerald-100 space-y-0.5">
                    <div>Net Area: <strong>{calcAreaSqFt} sq ft</strong></div>
                    <div>+10% Cutting / Corner Wastage: <strong>+{(calcAreaSqFt * 0.10).toFixed(1)} sq ft</strong></div>
                    <div>Total Ordering Target: <strong>{calcGrossAreaSqFt} sq ft</strong></div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-emerald-800/80 flex items-baseline justify-between">
                    <span className="text-xs text-emerald-200">Required Boxes:</span>
                    <span className="text-2xl font-black text-amber-300">
                      {calcBoxesNeeded} <span className="text-sm font-semibold text-white">Boxes</span>
                    </span>
                  </div>
                  <div className="text-right text-xs text-emerald-300 font-bold">
                    Est. Total: ₹{calcTotalCost.toLocaleString("en-IN")} (incl. 18% GST)
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(selectedTile, calcBoxesNeeded)}
                  className="mt-3 w-full py-2.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg shadow-md transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add All {calcBoxesNeeded} Boxes to Cart (₹{calcTotalCost.toLocaleString("en-IN")})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mason-Safe Cross-Sell Recommendations Banner */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-amber-900 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Mason-Safe Fixing & Installation Bundles (Zero Extra Delivery Cost on Same Trip)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-amber-950">
            <div className="bg-white p-3 rounded-lg border border-amber-200 flex flex-col justify-between">
              <div>
                <span className="font-bold text-amber-900 block mb-1">Large Format Tiles (600×1200 / 800×800):</span>
                <span>Leveling Kits (Fastobond / Flamingo) + Leqwell 3mm Spacers + Roff T13 / MYK SP-100 Epoxy Grout.</span>
              </div>
              <button
                onClick={() => setActiveSubcategory("grouts-tools")}
                className="mt-2 text-emerald-700 font-bold hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
              >
                View Leveling & Epoxy Kits <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-white p-3 rounded-lg border border-amber-200 flex flex-col justify-between">
              <div>
                <span className="font-bold text-amber-900 block mb-1">Ceramic Wall Tiles (300×450mm):</span>
                <span>Roff Rainbow Waterproof Grout (1kg) + Roff T16 Cera Clean (1L) + Bosch 4-Inch Diamond Blade.</span>
              </div>
              <button
                onClick={() => setActiveSubcategory("grouts-tools")}
                className="mt-2 text-emerald-700 font-bold hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
              >
                View Wall Tile Grout & Cleaners <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-white p-3 rounded-lg border border-amber-200 flex flex-col justify-between">
              <div>
                <span className="font-bold text-amber-900 block mb-1">Granite & Marble Slabs:</span>
                <span>Bosch Continuous Rim 4" Diamond Blade (2607019471) + SP-100 Epoxy + A-Frame Transit.</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={unloadingHelperChecked}
                    onChange={(e) => setUnloadingHelperChecked(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Unloading Helper (+₹500)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        {/* Subcategory Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 mb-4">
          {subcategories.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setActiveSubcategory(sub.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                activeSubcategory === sub.id
                  ? "bg-emerald-800 text-white shadow-md"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span>{sub.name}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  activeSubcategory === sub.id
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {sub.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto max-w-full">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">Brand:</span>
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  selectedBrand === b
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-400"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {b === "all" ? "All Brands" : b}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search tiles, marble, granite..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Products Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{filteredProducts.length}</strong> verified products
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No products found</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting your brand or search filter.</p>
            <button
              onClick={() => {
                setSelectedBrand("all");
                setActiveSubcategory("all");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-emerald-800"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((p) => {
              const cartQty = getCartQuantity(p);
              const isTile = p.sellingUnit === "BOX";
              const isSlab = p.sellingUnit === "SQ_FT";

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-500/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Card Top: Badges & Image */}
                  <div>
                    <div className="relative bg-slate-100 aspect-square overflow-hidden cursor-pointer"
                      onClick={() => {
                        if (onOpenDetail) onOpenDetail(toProductCardType(p));
                        else setModalProduct(p);
                      }}
                    >
                      <ProductImage
                        src={p.image}
                        alt={p.name}
                        sku={p.slug || p.id}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Vehicle Badge */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm flex items-center gap-1 ${
                            p.deliveryVehicleType === "2-Wheeler"
                              ? "bg-amber-400 text-amber-950"
                              : p.deliveryVehicleType === "E-Loader"
                              ? "bg-teal-500 text-white"
                              : "bg-emerald-700 text-white"
                          }`}
                        >
                          {p.deliveryVehicleType === "2-Wheeler" ? (
                            <Bike className="w-3 h-3" />
                          ) : (
                            <Truck className="w-3 h-3" />
                          )}
                          {p.deliveryVehicleType}
                        </span>

                        {p.batchLockRequired && (
                          <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-bold rounded shadow-sm">
                            Single Shade Lock
                          </span>
                        )}

                        {isSlab && (
                          <span className="px-1.5 py-0.5 bg-purple-700 text-white text-[9px] font-bold rounded shadow-sm">
                            A-Frame Slabs
                          </span>
                        )}
                      </div>

                      {/* GST Badge */}
                      <div className="absolute top-2 right-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                            p.gstPercent === 5
                              ? "bg-green-600 text-white"
                              : "bg-slate-800 text-slate-200"
                          }`}
                        >
                          {p.gstPercent}% GST ({p.hsnCode})
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                        <span className="text-emerald-700 font-bold uppercase">{p.brand}</span>
                        <span>{p.oemModelCode}</span>
                      </div>

                      <h3
                        onClick={() => {
                          if (onOpenDetail) onOpenDetail(toProductCardType(p));
                          else setModalProduct(p);
                        }}
                        className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 hover:text-emerald-700 cursor-pointer min-h-[38px]"
                      >
                        {p.name}
                      </h3>

                      {/* Finish & Spec chips */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {p.surfaceFinish && (
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] rounded font-medium">
                            {p.surfaceFinish}
                          </span>
                        )}
                        {p.tileSizeMm && (
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] rounded font-bold">
                            {p.tileSizeMm}
                          </span>
                        )}
                        {isSlab && p.thicknessMm && (
                          <span className="px-1.5 py-0.5 bg-purple-50 text-purple-800 text-[10px] rounded font-bold">
                            {p.thicknessMm}mm Slab
                          </span>
                        )}
                        {isSlab && p.minOrderSqFt && (
                          <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 text-[10px] rounded font-semibold">
                            Min {p.minOrderSqFt} sq ft
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Dual Price & Add Button */}
                  <div className="p-4 pt-0 border-t border-slate-100 mt-2">
                    <div className="pt-2 flex items-baseline justify-between mb-2">
                      <div>
                        {/* Dual Price Representation */}
                        {isTile ? (
                          <div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-base sm:text-lg font-black text-slate-900">
                                ₹{p.price.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[11px] font-bold text-slate-500">/ Box</span>
                              {p.mrp > p.price && (
                                <span className="text-[11px] text-slate-400 line-through">
                                  ₹{p.mrp}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-bold text-emerald-700">
                              ₹{p.effectivePricePerSqFt}/sq ft{" "}
                              <span className="text-[10px] font-normal text-slate-500">
                                ({p.coverageSqFtPerBox} sq ft box)
                              </span>
                            </div>
                          </div>
                        ) : isSlab ? (
                          <div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-base sm:text-lg font-black text-slate-900">
                                ₹{p.price.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[11px] font-bold text-slate-500">/ sq ft</span>
                              {p.mrp > p.price && (
                                <span className="text-[11px] text-slate-400 line-through">
                                  ₹{p.mrp}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Ex-GST: ₹{p.exGstPrice}/sq ft
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-base sm:text-lg font-black text-slate-900">
                                ₹{p.price.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[11px] font-bold text-slate-500">/ {p.unit}</span>
                              {p.mrp > p.price && (
                                <span className="text-[11px] text-slate-400 line-through">
                                  ₹{p.mrp}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Ex-GST: ₹{p.exGstPrice}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Single Batch Badge */}
                      {p.batchLockRequired && (
                        <div className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          Kiln Lock
                        </div>
                      )}
                    </div>

                    {/* Cart Action */}
                    {cartQty === 0 ? (
                      <button
                        onClick={() => handleAddToCart(p, isSlab ? (p.minOrderSqFt || 25) : 1)}
                        className="w-full py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {isSlab ? `Order Min ${p.minOrderSqFt || 25} Sq Ft` : `Add Box to Cart`}
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 rounded-xl p-1">
                        <button
                          onClick={() => handleUpdateQty(p, isSlab ? Math.max(0, cartQty - 25) : cartQty - 1)}
                          className="w-8 h-8 flex items-center justify-center text-emerald-950 hover:bg-emerald-200 rounded-lg cursor-pointer transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <div className="text-center">
                          <span className="text-xs font-black text-emerald-950 block">
                            {cartQty} {isSlab ? "Sq Ft" : isTile ? "Boxes" : p.unit}
                          </span>
                          {isTile && (
                            <span className="text-[9px] text-emerald-700 font-semibold block">
                              {(cartQty * (p.coverageSqFtPerBox || 15.5)).toFixed(1)} sq ft
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleUpdateQty(p, isSlab ? cartQty + 25 : cartQty + 1)}
                          className="w-8 h-8 flex items-center justify-center text-emerald-950 hover:bg-emerald-200 rounded-lg cursor-pointer transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {modalProduct && (
        <ProductDetailModal
          product={toProductCardType(modalProduct)}
          isOpen={Boolean(modalProduct)}
          onClose={() => setModalProduct(null)}
        />
      )}
      {/* Slim Architectural Contextual Cross-Link */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pb-4">
        <a
          href="/services?trade=tile-mason"
          className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 text-white text-xs font-black hover:bg-emerald-900 transition"
        >
          <span>Need a verified Tile Mason (₹24/sq.ft) or Cutter? Book in Skilled Services</span>
          <span>Book Karigar →</span>
        </a>
      </div>
    </div>
  );
};

// Backward compatibility alias
export const TileAdhesivesCollectionStorefront = TilesCollectionStorefront;
export default TilesCollectionStorefront;
