import React, { useState, useMemo } from "react";
import { ChevronDown, Clock, Check, Plus, Minus, ShieldCheck, Tag } from "lucide-react";
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

export interface KitchenProduct {
  id: string;
  title: string;
  brand: string;
  categoryTag: string;
  type: string;
  size?: string;
  color?: string;
  material?: string;
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
  isSoldOut?: boolean;
  rating?: number;
}

export const KITCHEN_SUBCATEGORIES = [
  {
    id: "tandems-inserts",
    name: "Tandems & Inserts",
    count: 4,
    icon: "/images/subcategories/tandems-inserts-icon.webp",
  },
  {
    id: "pullouts-baskets-wickers",
    name: "Pullouts, Baskets, Wickers",
    count: 15,
    icon: "/images/subcategories/pullouts-baskets-wickers-icon.webp",
  },
  {
    id: "waste-bins-other-accessories",
    name: "Waste Bins & Other Accessories",
    count: 8,
    icon: "/images/subcategories/waste-bins-other-accessories-icon.webp",
  },
  {
    id: "magic-corner-pantry-units-pulldowns",
    name: "Magic Corner, Pantry Units, Pulldowns",
    count: 8,
    icon: "/images/subcategories/magic-corner-pantry-units-pulldowns-icon.webp",
  },
  {
    id: "skirting-hardware",
    name: "Skirting & Hardware",
    count: 2,
    icon: "/images/subcategories/skirting-hardware-icon.webp",
  },
];

export const TANDEMS_INSERTS_PRODUCTS: KitchenProduct[] = [
  {
    id: "ebco-pro-motion-tandem-box",
    title: "Ebco Pro Motion Tandem Box, S3 Series, 50Kg, Full Set, Anthracite",
    brand: "Ebco",
    categoryTag: "Tandems & Inserts",
    type: "Tandem Box",
    size: "4\" - 10\" Height",
    color: "Anthracite",
    material: "Cold Rolled Steel",
    packSize: "Full Set",
    price: 2447,
    mrp: 3652,
    discountPct: 33,
    image: "/images/products/modular-kitchen/ebco-pro-motion-tandem-box.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "4\" - 10\" Height",
    deliveryTime: "60 Mins",
    optionsCount: 12,
    materialTag: "Hardware",
    unit: "1 Full Set",
    rating: 4.9,
  },
  {
    id: "hettich-orgatray-440-trimmable",
    title: "Hettich OrgaTray 440 Trimmable (Fixed Partition) Cutlery Insert, Silver",
    brand: "Hettich",
    categoryTag: "Tandems & Inserts",
    type: "Cutlery Insert",
    size: "421-520 mm Depth",
    color: "Silver",
    material: "Molded ABS",
    packSize: "1 Unit",
    price: 586,
    mrp: 630,
    discountPct: 7,
    image: "/images/products/modular-kitchen/hettich-orgatray-440.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "421-520 mm Depth",
    deliveryTime: "60 Mins",
    optionsCount: 7,
    materialTag: "Hardware",
    unit: "1 Unit",
    rating: 4.8,
  },
  {
    id: "hettich-innotech-tandem-box-silver",
    title: "Hettich InnoTech Tandem Box, Silver, 470mm, 30Kg, Full Set",
    brand: "Hettich",
    categoryTag: "Tandems & Inserts",
    type: "Tandem Box",
    size: "470mm",
    color: "Silver",
    material: "Steel",
    packSize: "Full Set",
    price: 3065,
    mrp: 5108,
    discountPct: 40,
    image: "/images/products/modular-kitchen/hettich-innotech-drawer-500mm.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "470mm, 30Kg Full Set",
    deliveryTime: "60 Mins",
    optionsCount: 3,
    materialTag: "Hardware",
    unit: "1 Full Set",
    rating: 4.9,
  },
  {
    id: "hettich-avantech-tandem-box-anthracite",
    title: "Hettich AvanTech Tandem Box Anthracite, 500mm, 30Kg, Full Set",
    brand: "Hettich",
    categoryTag: "Tandems & Inserts",
    type: "Tandem Box",
    size: "500mm",
    color: "Anthracite",
    material: "Aluminium / Steel",
    packSize: "Full Set",
    price: 5171,
    mrp: 9756,
    discountPct: 47,
    image: "/images/products/modular-kitchen/hettich-tandem-box-500mm.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "101/187/251 mm",
    deliveryTime: "60 Mins",
    optionsCount: 3,
    materialTag: "Hardware",
    unit: "1 Full Set",
    rating: 4.9,
  },
];

export const PULLOUTS_BASKETS_PRODUCTS: KitchenProduct[] = [
  {
    id: "ebco-kitchen-plate-glass-tray",
    title: "Ebco Kitchen Plate / Glass Tray with Rod Supports and Anchor Kit",
    brand: "Ebco",
    categoryTag: "Pullouts, Baskets, Wickers",
    type: "Plate & Glass Tray",
    size: "Cabinet Tray",
    material: "Stainless Steel",
    packSize: "1 Set",
    price: 1622,
    mrp: 2659,
    discountPct: 39,
    image: "/images/products/modular-kitchen/ebco-kitchen-plate-glass-tray.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "Rods & anchors",
    deliveryTime: "60 Mins",
    optionsCount: 6,
    materialTag: "Hardware",
    unit: "1 Set",
    rating: 4.8,
  },
  {
    id: "ebco-thali-kitchen-basket-ss304",
    title: "Ebco Thali Kitchen Basket, SS304, 200mm (H) X 505mm (D), 8\" X 20\"",
    brand: "Ebco",
    categoryTag: "Pullouts, Baskets, Wickers",
    type: "Thali Basket",
    size: "8\" X 20\"",
    material: "SS304",
    packSize: "1 Basket",
    price: 1995,
    mrp: 3166,
    discountPct: 37,
    image: "/images/products/modular-kitchen/ebco-thali-kitchen-basket.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "Made in India",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    materialTag: "Hardware",
    unit: "1 Basket",
    rating: 4.9,
  },
  {
    id: "hettich-pull-out-2-tier-iron-grey",
    title: "Hettich Pull Out 2 Tier Iron Grey",
    brand: "Hettich",
    categoryTag: "Pullouts, Baskets, Wickers",
    type: "Bottle Pull Out",
    size: "2 Tier",
    color: "Iron Grey",
    material: "Solid Steel",
    packSize: "1 Pullout",
    price: 6006,
    mrp: 10010,
    discountPct: 40,
    image: "/images/products/modular-kitchen/hettich-pull-out-2-tier.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "Full extension",
    deliveryTime: "60 Mins",
    optionsCount: 3,
    materialTag: "Hardware",
    unit: "1 Unit",
    rating: 4.9,
  },
  {
    id: "ebco-kitchen-drip-tray",
    title: "Ebco Kitchen Drip Tray with Rod Supports and Anchor Kit",
    brand: "Ebco",
    categoryTag: "Pullouts, Baskets, Wickers",
    type: "Drip Tray",
    size: "Cabinet Fit",
    material: "SS304",
    packSize: "1 Set",
    price: 1221,
    mrp: 1769,
    discountPct: 31,
    image: "/images/products/modular-kitchen/ebco-kitchen-drip-tray.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "Ebco tray match",
    deliveryTime: "60 Mins",
    optionsCount: 3,
    materialTag: "Hardware",
    unit: "1 Set",
    rating: 4.8,
  },
  {
    id: "ebco-cutlery-kitchen-basket-ss304",
    title: "Ebco Cutlery Kitchen Basket, SS304, 80mm (H) X 505mm (D), 3.2\" X 20\"",
    brand: "Ebco",
    categoryTag: "Pullouts, Baskets, Wickers",
    type: "Cutlery Basket",
    size: "3.2\" X 20\"",
    material: "SS304",
    packSize: "1 Basket",
    price: 3324,
    mrp: 5276,
    discountPct: 37,
    image: "/images/products/modular-kitchen/ebco-cutlery-basket.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "Mounting Plates",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    materialTag: "Hardware",
    unit: "1 Basket",
    rating: 4.9,
  },
  {
    id: "ebco-plate-kitchen-basket-ss304",
    title: "Ebco Plate Kitchen Basket, SS304, 150mm (H) X 505mm (D), 6\" X 20\"",
    brand: "Ebco",
    categoryTag: "Pullouts, Baskets, Wickers",
    type: "Plate Basket",
    size: "6\" X 20\"",
    material: "SS304",
    packSize: "1 Basket",
    price: 1973,
    mrp: 3131,
    discountPct: 37,
    image: "/images/products/modular-kitchen/ebco-plate-basket.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "Slim 2 Slides",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    materialTag: "Hardware",
    unit: "1 Basket",
    rating: 4.8,
  },
  {
    id: "ebco-cup-saucer-kitchen-basket-ss304",
    title: "Ebco Cup & Saucer Kitchen Basket, SS304, 100mm (H) X 505mm (D), 4\" X 20\"",
    brand: "Ebco",
    categoryTag: "Pullouts, Baskets, Wickers",
    type: "Cup & Saucer Basket",
    size: "4\" X 20\"",
    material: "SS304",
    packSize: "1 Basket",
    price: 1966,
    mrp: 3120,
    discountPct: 37,
    image: "/images/products/modular-kitchen/ebco-cup-saucer-basket.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "380-500 mm",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    materialTag: "Hardware",
    unit: "1 Basket",
    rating: 4.9,
  },
  {
    id: "hettich-wicker-basket-beech-runners",
    title: "Hettich Wicker Basket with 19mm wide Beech Runners, 500mm Depth",
    brand: "Hettich",
    categoryTag: "Pullouts, Baskets, Wickers",
    type: "Wicker Basket",
    size: "500mm Depth",
    material: "Natural Wicker / Beech",
    packSize: "1 Basket",
    price: 3324,
    mrp: 5036,
    discountPct: 34,
    image: "/images/products/modular-kitchen/hettich-wicker-basket.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "Smooth pull-out",
    deliveryTime: "60 Mins",
    optionsCount: 12,
    materialTag: "Hardware",
    unit: "1 Basket",
    rating: 4.9,
  },
  {
    id: "hettich-cargo-iq-300-bottle-pull-out",
    title: "Hettich Cargo IQ 300 Bottle Pull Out, 2 Tier",
    brand: "Hettich",
    categoryTag: "Pullouts, Baskets, Wickers",
    type: "Bottle Pull Out",
    size: "300mm / 2 Tier",
    material: "Chrome Wire",
    packSize: "1 Unit",
    price: 2394,
    mrp: 4516,
    discountPct: 47,
    image: "/images/products/modular-kitchen/hettich-cargo-iq-300.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "Excl. channels",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    materialTag: "Hardware",
    unit: "1 Unit",
    rating: 4.9,
  },
  {
    id: "ebco-wicker-basket-soft-close",
    title: "Ebco Wicker Basket, Soft Close",
    brand: "Ebco",
    categoryTag: "Pullouts, Baskets, Wickers",
    type: "Wicker Basket",
    size: "4\", 6\" & 8\"",
    material: "Wicker & Steel",
    packSize: "1 Unit",
    price: 5147,
    mrp: 7459,
    discountPct: 31,
    image: "/images/products/modular-kitchen/ebco-wicker-basket.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "4\", 6\" & 8\"",
    deliveryTime: "60 Mins",
    optionsCount: 6,
    materialTag: "Hardware",
    unit: "1 Unit",
    rating: 4.9,
  },
  {
    id: "hettich-cargo-dish-drainer-set",
    title: "Hettich Cargo Dish Drainer Set",
    brand: "Hettich",
    categoryTag: "Pullouts, Baskets, Wickers",
    type: "Dish Drainer",
    size: "Cabinet Fit",
    material: "Stainless Steel",
    packSize: "1 Set",
    price: 2994,
    mrp: 5162,
    discountPct: 42,
    image: "/images/products/modular-kitchen/hettich-dish-drainer.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "Holds 15 Plates",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    materialTag: "Hardware",
    unit: "1 Set",
    rating: 4.8,
  },
  {
    id: "ebco-bottle-pullout-soft-close",
    title: "Ebco Bottle Pullout, Soft Close, 2 Tier",
    brand: "Ebco",
    categoryTag: "Pullouts, Baskets, Wickers",
    type: "Bottle Pull Out",
    size: "2 Tier",
    material: "Stainless Steel",
    packSize: "1 Unit",
    price: 6176,
    mrp: 8951,
    discountPct: 31,
    image: "/images/products/modular-kitchen/ebco-bottle-pullout.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "Bottles & Jars",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    materialTag: "Hardware",
    unit: "1 Unit",
    rating: 4.9,
  },
  {
    id: "ebco-side-pullout-frameless",
    title: "Ebco Side Pullout, Frameless, SS304",
    brand: "Ebco",
    categoryTag: "Pullouts, Baskets, Wickers",
    type: "Side Pullout",
    size: "2 & 3-Tier",
    material: "SS304",
    packSize: "1 Unit",
    price: 1767,
    mrp: 2850,
    discountPct: 38,
    image: "/images/products/modular-kitchen/ebco-side-pullout.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "2 & 3-Tier",
    deliveryTime: "60 Mins",
    optionsCount: 3,
    materialTag: "Hardware",
    unit: "1 Unit",
    rating: 4.8,
  },
  {
    id: "hettich-cargo-detergent-holder",
    title: "Hettich Cargo Detergent Holder Kitchen Accessory, 10.25\"x14\"x8\" (9197058)",
    brand: "Hettich",
    categoryTag: "Pullouts, Baskets, Wickers",
    type: "Detergent Holder",
    size: "10.25\"x14\"x8\"",
    material: "Chrome Wire",
    packSize: "1 Unit",
    price: 1250,
    mrp: 2272,
    discountPct: 45,
    image: "/images/products/modular-kitchen/hettich-detergent-holder.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "Chrome wire",
    deliveryTime: "60 Mins",
    optionsCount: 1,
    materialTag: "Hardware",
    unit: "1 Unit",
    rating: 4.9,
  },
  {
    id: "ebco-plain-kitchen-basket-ss304",
    title: "Ebco Plain Kitchen Basket, SS304",
    brand: "Ebco",
    categoryTag: "Pullouts, Baskets, Wickers",
    type: "Plain Basket",
    size: "Standard Depth",
    material: "SS304",
    packSize: "1 Basket",
    price: 1876,
    mrp: 2978,
    discountPct: 37,
    image: "/images/products/modular-kitchen/ebco-ss-kitchen-basket-plain.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "Mounting Plates",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    materialTag: "Hardware",
    unit: "1 Basket",
    rating: 4.9,
  },
];

export const WASTE_BINS_PRODUCTS: KitchenProduct[] = [
  {
    id: "ebco-swing-out-waste-bin-rectangular",
    title: "Ebco Swing Out Waste Bin, Rectangular",
    brand: "Ebco",
    categoryTag: "Waste Bins & Other Accessories",
    type: "Swing Out Bin",
    size: "15 L & 20 L",
    material: "Steel / ABS",
    packSize: "1 Unit",
    price: 1735,
    mrp: 2514,
    discountPct: 31,
    image: "/images/products/modular-kitchen/ebco-swing-out-waste-bin.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "15 L & 20 L",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    materialTag: "Hardware",
    unit: "1 Unit",
    rating: 4.8,
  },
  {
    id: "hettich-waste-bin-it-classic",
    title: "Hettich Waste-Bin.It Classic, 13 Litres Capacity, 9343581",
    brand: "Hettich",
    categoryTag: "Waste Bins & Other Accessories",
    type: "Classic Swing Bin",
    size: "13 Litres",
    material: "Stainless Steel",
    packSize: "1 Unit",
    price: 2710,
    mrp: 3985,
    discountPct: 32,
    image: "/images/products/modular-kitchen/hettich-waste-bin-classic.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "Removable bucket",
    deliveryTime: "60 Mins",
    optionsCount: 1,
    materialTag: "Hardware",
    unit: "1 Unit",
    rating: 4.9,
  },
  {
    id: "ebco-pull-out-waste-bin-40l",
    title: "Ebco Pull Out Waste Bin, 40L Capacity, 2 X 20L Separate Bins, POWB4-40-AT",
    brand: "Ebco",
    categoryTag: "Waste Bins & Other Accessories",
    type: "Pull Out Waste Bin",
    size: "40L (2 X 20L)",
    material: "Engineering Polymer & Steel",
    packSize: "1 Dual Set",
    price: 5304,
    mrp: 7470,
    discountPct: 29,
    image: "/images/products/modular-kitchen/ebco-pull-out-waste-bin-40l.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "Under-Sink Fit",
    deliveryTime: "60 Mins",
    optionsCount: 1,
    materialTag: "Hardware",
    unit: "1 Dual Set",
    rating: 4.9,
  },
  {
    id: "aristo-wheel-waste-bin-pedal-65l",
    title: "Aristo Wheel Waste Bin with Pedal 65L",
    brand: "Aristo",
    categoryTag: "Waste Bins & Other Accessories",
    type: "Pedal Wheel Bin",
    size: "65L",
    color: "Blue",
    material: "Heavy Duty Plastic",
    packSize: "1 Bin",
    price: 2185,
    mrp: 2900,
    discountPct: 25,
    image: "/images/products/modular-kitchen/aristo-wheel-bin-65l.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "Pedal Operated",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    materialTag: "Hardware",
    unit: "1 Bin",
    rating: 4.8,
  },
  {
    id: "ebco-auto-pull-out-waste-bin-30l",
    title: "Ebco Auto Pull Out Waste Bin, Auto Open Soft-Close",
    brand: "Ebco",
    categoryTag: "Waste Bins & Other Accessories",
    type: "Auto Pull Out Bin",
    size: "30L",
    material: "Polymer & Steel",
    packSize: "1 Unit",
    price: 7985,
    mrp: 11572,
    discountPct: 31,
    image: "/images/products/modular-kitchen/ebco-auto-waste-bin.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "Handsfree Auto-Open",
    deliveryTime: "60 Mins",
    optionsCount: 1,
    materialTag: "Hardware",
    unit: "1 Unit",
    rating: 4.9,
  },
  {
    id: "aristo-wheel-waste-bin-120l-green",
    title: "Aristo Wheel Waste Bin 120L - Green",
    brand: "Aristo",
    categoryTag: "Waste Bins & Other Accessories",
    type: "Heavy Duty Wheel Bin",
    size: "120L",
    color: "Green",
    material: "High Density Polyethylene",
    packSize: "1 Bin",
    price: 3375,
    mrp: 4500,
    discountPct: 25,
    image: "/images/products/modular-kitchen/aristo-wheel-bin-120l-green.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "Heavy Duty Wheels",
    deliveryTime: "60 Mins",
    optionsCount: 1,
    materialTag: "Hardware",
    unit: "1 Bin",
    rating: 4.8,
  },
  {
    id: "aristo-wheel-waste-bin-120l-blue",
    title: "Aristo Wheel Waste Bin 120L - Blue",
    brand: "Aristo",
    categoryTag: "Waste Bins & Other Accessories",
    type: "Heavy Duty Wheel Bin",
    size: "120L",
    color: "Blue",
    material: "High Density Polyethylene",
    packSize: "1 Bin",
    price: 3375,
    mrp: 4500,
    discountPct: 25,
    image: "/images/products/modular-kitchen/aristo-wheel-bin-120l-blue.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "Wet/Dry Segregation",
    deliveryTime: "60 Mins",
    optionsCount: 1,
    materialTag: "Hardware",
    unit: "1 Bin",
    rating: 4.8,
  },
  {
    id: "ebco-fascia-bracket-powb4-40",
    title: "Ebco Fascia Bracket - POWB4-40-FP-AT",
    brand: "Ebco",
    categoryTag: "Waste Bins & Other Accessories",
    type: "Fascia Bracket",
    size: "Standard",
    material: "Powder Coated Steel",
    packSize: "1 Kit",
    price: 777,
    mrp: 1094,
    discountPct: 29,
    image: "/images/products/modular-kitchen/ebco-fascia-bracket.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "Door Connector Kit",
    deliveryTime: "60 Mins",
    optionsCount: 1,
    materialTag: "Hardware",
    unit: "1 Kit",
    rating: 4.8,
  },
];

export const MAGIC_CORNER_PANTRY_PRODUCTS: KitchenProduct[] = [
  {
    id: "ebco-roll-top-pro-vertical-rolling-shutter",
    title: "Ebco Roll Top Pro Vertical Rolling Shutter with Overlay Rails & Cover Profile",
    brand: "Ebco",
    categoryTag: "Magic Corner, Pantry Units, Pulldowns",
    type: "Rolling Shutter",
    size: "Custom Fit",
    color: "Anthracite / Metallic",
    material: "Aluminium / Glass",
    packSize: "1 Shutter Kit",
    price: 10242,
    mrp: 15061,
    discountPct: 32,
    image: "/images/products/modular-kitchen/ebco-roll-top-shutter.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "8 finishes",
    deliveryTime: "60 Mins",
    optionsCount: 22,
    materialTag: "Hardware",
    unit: "1 Shutter Kit",
    rating: 4.9,
  },
  {
    id: "ebco-eurolift-bi-fold-door-system",
    title: "Ebco Eurolift Bi-Fold Door System, Soft Close, Anthracite",
    brand: "Ebco",
    categoryTag: "Magic Corner, Pantry Units, Pulldowns",
    type: "Bi-Fold Door System",
    size: "Standard Overhead",
    color: "Anthracite",
    material: "Steel & Aluminium",
    packSize: "1 Lift Mechanism Set",
    price: 3027,
    mrp: 4263,
    discountPct: 29,
    image: "/images/products/modular-kitchen/ebco-eurolift-bifold.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "Wood/Al doors",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    materialTag: "Hardware",
    unit: "1 Set",
    rating: 4.9,
  },
  {
    id: "hettich-duo-6-tier-frame-pantry-unit",
    title: "Hettich Duo 6 Tier Frame with Baskets (Pantry Unit), 50Kg",
    brand: "Hettich",
    categoryTag: "Magic Corner, Pantry Units, Pulldowns",
    type: "Pantry Unit",
    size: "1860 mm tall",
    color: "Silver / Anthracite",
    material: "Steel Frame & Chrome Baskets",
    packSize: "1 Full Unit Set",
    price: 23200,
    mrp: 38032,
    discountPct: 39,
    image: "/images/products/modular-kitchen/hettich-duo-pantry.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "1860 mm tall",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    materialTag: "Hardware",
    unit: "1 Full Unit Set",
    rating: 4.9,
  },
  {
    id: "hettich-universal-magic-corner-double-pullout",
    title: "Hettich Universal Magic Corner Double Pullout, 9346281",
    brand: "Hettich",
    categoryTag: "Magic Corner, Pantry Units, Pulldowns",
    type: "Magic Corner",
    size: "900 - 1000 mm Unit",
    material: "Anthracite Baskets / Steel",
    packSize: "1 Full Corner Set",
    price: 18365,
    mrp: 30106,
    discountPct: 39,
    image: "/images/products/modular-kitchen/hettich-magic-corner.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "900 - 1000 mm Unit",
    deliveryTime: "60 Mins",
    optionsCount: 1,
    materialTag: "Hardware",
    unit: "1 Full Corner Set",
    rating: 4.9,
  },
  {
    id: "ebco-pantry-unit-soft-close",
    title: "Ebco Pantry Unit, Soft Close",
    brand: "Ebco",
    categoryTag: "Magic Corner, Pantry Units, Pulldowns",
    type: "Pantry Unit",
    size: "450 & 600 mm",
    material: "Steel",
    packSize: "1 Set",
    price: 22759,
    mrp: 33469,
    discountPct: 32,
    image: "/images/products/modular-kitchen/ebco-tall-unit-pantry-pull-out.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "450 & 600 mm",
    deliveryTime: "60 Mins",
    optionsCount: 4,
    materialTag: "Hardware",
    unit: "1 Set",
    rating: 4.9,
  },
  {
    id: "ebco-universal-magic-corner-double-pullout",
    title: "Ebco Universal Magic Corner, Double Pullout",
    brand: "Ebco",
    categoryTag: "Magic Corner, Pantry Units, Pulldowns",
    type: "Magic Corner",
    size: "Corner 900mm",
    material: "Metal / Glass",
    packSize: "1 Unit",
    price: 22244,
    mrp: 32711,
    discountPct: 32,
    image: "/images/products/modular-kitchen/ebco-corner-unit-carousel.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "Metal/glass",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    materialTag: "Hardware",
    unit: "1 Unit",
    rating: 4.9,
  },
  {
    id: "hettich-larder-6-tier-frame-pantry-unit",
    title: "Hettich Larder 6 Tier Frame with Baskets for 600mm (24\") Cabinet Pantry Unit, 50Kg",
    brand: "Hettich",
    categoryTag: "Magic Corner, Pantry Units, Pulldowns",
    type: "Pantry Unit",
    size: "600mm (24\")",
    material: "Steel",
    packSize: "1 Unit",
    price: 23909,
    mrp: 37950,
    discountPct: 37,
    image: "/images/products/modular-kitchen/hettich-duo-pantry.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "Full Extension Soft-Close",
    deliveryTime: "60 Mins",
    optionsCount: 2,
    materialTag: "Hardware",
    unit: "1 Unit",
    rating: 4.9,
  },
  {
    id: "ebco-magic-corner-max-90-single-pullout",
    title: "Ebco Magic Corner Max 90, Single Pullout",
    brand: "Ebco",
    categoryTag: "Magic Corner, Pantry Units, Pulldowns",
    type: "Magic Corner",
    size: "Max 90",
    material: "Powder-coated Steel",
    packSize: "1 Unit",
    price: 30842,
    mrp: 43439,
    discountPct: 29,
    image: "/images/products/modular-kitchen/ebco-corner-unit-carousel.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "Powder-coated",
    deliveryTime: "60 Mins",
    optionsCount: 1,
    materialTag: "Hardware",
    unit: "1 Unit",
    rating: 4.9,
  },
];

export const SKIRTING_HARDWARE_PRODUCTS: KitchenProduct[] = [
  {
    id: "ebco-pvc-skirting-q-plinth-clip-100mm",
    title: "Ebco PVC Skirting Q Plinth and Clip, 100mm",
    brand: "Ebco",
    categoryTag: "Skirting & Hardware",
    type: "Plinth & Clip",
    size: "100mm",
    color: "Black",
    material: "Reinforced Polymer",
    packSize: "1 No.",
    price: 7,
    mrp: 10,
    discountPct: 30,
    image: "/images/products/modular-kitchen/ebco-skirting-plinth.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "100mm Height",
    deliveryTime: "60 Mins",
    optionsCount: 1,
    materialTag: "Hardware",
    unit: "1 Piece",
    rating: 4.8,
  },
  {
    id: "ebco-pvc-skirting-joints-100mm-black",
    title: "Ebco PVC Skirting Joints, 100mm, Black (Pack of 1 No.)",
    brand: "Ebco",
    categoryTag: "Skirting & Hardware",
    type: "Skirting Joint",
    size: "100mm",
    color: "Black",
    material: "Polymer / PVC",
    packSize: "Pack of 1 No.",
    price: 81,
    mrp: 115,
    discountPct: 30,
    image: "/images/products/modular-kitchen/ebco-skirting-joint.webp",
    cashbackPill: "Assured 1% cashback",
    specsPill: "Corner & straight",
    deliveryTime: "60 Mins",
    optionsCount: 1,
    materialTag: "Hardware",
    unit: "Pack of 1 No.",
    rating: 4.8,
  },
];

interface KitchenCollectionStorefrontProps {
  onOpenDetail?: (product: Product) => void;
  defaultSubcat?: string;
}

export function KitchenCollectionStorefront({
  onOpenDetail,
  defaultSubcat,
}: KitchenCollectionStorefrontProps) {
  const getInitialSubcat = () => {
    if (defaultSubcat && KITCHEN_SUBCATEGORIES.some((s) => s.id === defaultSubcat)) {
      return defaultSubcat;
    }
    const path = typeof window !== "undefined" ? window.location.pathname.toLowerCase() : "";
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const catParam = params?.get("cat")?.toLowerCase() || params?.get("subcat")?.toLowerCase() || "";

    if (path.includes("waste-bins") || catParam.includes("waste-bins")) return "waste-bins-other-accessories";
    if (path.includes("skirting") || catParam.includes("skirting")) return "skirting-hardware";
    if (path.includes("pullouts") || path.includes("baskets") || path.includes("wickers") || catParam.includes("pullouts")) return "pullouts-baskets-wickers";
    if (path.includes("magic-corner") || path.includes("pantry") || path.includes("pulldown") || catParam.includes("magic-corner")) return "magic-corner-pantry-units-pulldowns";
    if (path.includes("tandems") || catParam.includes("tandems")) return "tandems-inserts";
    return "tandems-inserts";
  };

  const [activeSubcat, setActiveSubcat] = useState(getInitialSubcat);
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");
  const [selectedColor, setSelectedColor] = useState("all");
  const [selectedMaterial, setSelectedMaterial] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [quickDetailProduct, setQuickDetailProduct] = useState<Product | null>(null);
  const [detailOptions, setDetailOptions] = useState<{ scrollToBulk?: boolean; variantId?: string }>({});

  const handleSelectSubcat = (id: string) => {
    setActiveSubcat(id);
    setSelectedBrand("all");
    setSelectedType("all");
    setSelectedSize("all");
    setSelectedColor("all");
    setSelectedMaterial("all");
    setSelectedPrice("all");
    if (typeof window !== "undefined" && window.history?.replaceState) {
      window.history.replaceState({}, "", `/collections/${id}`);
    }
  };

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

  const rawProducts = useMemo(() => {
    switch (activeSubcat) {
      case "pullouts-baskets-wickers":
        return PULLOUTS_BASKETS_PRODUCTS;
      case "waste-bins-other-accessories":
        return WASTE_BINS_PRODUCTS;
      case "magic-corner-pantry-units-pulldowns":
        return MAGIC_CORNER_PANTRY_PRODUCTS;
      case "skirting-hardware":
        return SKIRTING_HARDWARE_PRODUCTS;
      case "tandems-inserts":
      default:
        return TANDEMS_INSERTS_PRODUCTS;
    }
  }, [activeSubcat]);

  const filteredProducts = useMemo(() => {
    return rawProducts
      .filter((p) => {
        if (selectedBrand !== "all" && p.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
        if (selectedType !== "all" && !p.type.toLowerCase().includes(selectedType.toLowerCase())) return false;
        if (selectedSize !== "all" && p.size && !p.size.toLowerCase().includes(selectedSize.toLowerCase())) return false;
        if (selectedColor !== "all" && p.color && !p.color.toLowerCase().includes(selectedColor.toLowerCase())) return false;
        if (selectedMaterial !== "all" && p.material && !p.material.toLowerCase().includes(selectedMaterial.toLowerCase())) return false;

        if (selectedPrice === "under-2000" && p.price >= 2000) return false;
        if (selectedPrice === "2000-5000" && (p.price < 2000 || p.price > 5000)) return false;
        if (selectedPrice === "above-5000" && p.price <= 5000) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        return 0;
      });
  }, [rawProducts, selectedBrand, selectedType, selectedSize, selectedColor, selectedMaterial, selectedPrice, sortBy]);

  const brands = useMemo(() => Array.from(new Set(rawProducts.map((p) => p.brand))), [rawProducts]);
  const types = useMemo(() => Array.from(new Set(rawProducts.map((p) => p.type))), [rawProducts]);
  const sizes = useMemo(() => Array.from(new Set(rawProducts.map((p) => p.size).filter(Boolean))), [rawProducts]);
  const colors = useMemo(() => Array.from(new Set(rawProducts.map((p) => p.color).filter(Boolean))), [rawProducts]);
  const materials = useMemo(() => Array.from(new Set(rawProducts.map((p) => p.material).filter(Boolean))), [rawProducts]);

  const currentSubcatName = useMemo(() => {
    return KITCHEN_SUBCATEGORIES.find((s) => s.id === activeSubcat)?.name ?? "Tandems & Inserts";
  }, [activeSubcat]);

  const handleAddToCart = (p: KitchenProduct) => {
    if (p.isSoldOut) {
      toast.info("This item is currently out of stock.");
      return;
    }
    addToCart.mutate(
      {
        data: {
          materialId: p.id,
          quantity: 1,
          name: p.title,
          price: p.price,
          unit: p.unit || "Unit",
          vendor: `${p.brand} Authorized Hub`,
          category: "Hardware",
        },
      },
      {
        onSuccess: () => toast.success(`Added ${p.title} to cart`),
        onError: () => toast.error("Could not add to cart. Please try again."),
      }
    );
  };

  const handleUpdateQty = (p: KitchenProduct, newQty: number) => {
    const key = `hardware::${p.title.toLowerCase()}`;
    const entry = cartItemByKey[key];
    if (!entry || entry.ids.length === 0) {
      if (newQty > 0) handleAddToCart(p);
      return;
    }
    const primaryId = entry.ids[0];
    if (newQty <= 0) {
      removeFromCart.mutate({ itemId: primaryId });
      toast.info(`Removed ${p.title} from cart`);
    } else {
      updateCartItem.mutate({ itemId: primaryId, data: { quantity: newQty } });
    }
  };

  const handleOpenDetailModal = (p: KitchenProduct, options?: { scrollToBulk?: boolean; variantId?: string }) => {
    setDetailOptions(options || {});
    const standardProduct: Product = {
      id: p.id,
      title: p.title,
      description: `${p.brand} ${p.categoryTag} - ${p.type} (${p.specsPill || p.size || ""})`,
      price: p.price,
      mrp: p.mrp,
      unit: p.unit,
      image: p.image,
      rating: p.rating ?? 4.9,
      reviews: 142,
      deliveryEta: "Today, within 60 Mins",
      brand: p.brand,
      materialTag: "Hardware",
    };
    if (onOpenDetail) {
      onOpenDetail(standardProduct);
    } else {
      setQuickDetailProduct(standardProduct);
    }
  };

  return (
    <div className="bg-[#FAFBFD] min-h-screen pb-16">
      {/* ── TOP PROMOTIONAL CASHBACK BANNER (HomeRun Style) ── */}
      <div className="w-full bg-gradient-to-r from-[#FDE047] via-[#FACC15] to-[#EAB308] border-b border-[#EAB308]/30 shadow-xs">
        <div className="max-w-[1340px] mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-[#1E293B]">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="hidden sm:flex w-10 h-10 rounded-full bg-white/80 items-center justify-center shadow-xs">
              <Tag className="w-5 h-5 text-[#B45309]" />
            </div>
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                <span className="text-[20px] sm:text-[24px] font-black tracking-tight text-[#1E3A8A]">
                  FLAT 2% CASHBACK
                </span>
                <span className="text-[14px] sm:text-[16px] font-extrabold text-[#334155]">
                  on ₹25,000+ purchase
                </span>
              </div>
              <p className="text-[11px] sm:text-[12px] font-semibold text-[#475569] mt-0.5">
                Applicable on all Modular Kitchen Systems, Fittings, Tandems & Accessories
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="bg-[#2563EB] text-white text-[11px] sm:text-[12px] font-black px-3 py-1.5 rounded-full shadow-xs tracking-wide">
              Offer valid till 30th Nov
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1340px] mx-auto px-3 sm:px-6 py-4">
        {/* ── BREADCRUMB TRAIL ── */}
        <nav className="text-[12px] sm:text-[13px] text-[#64748B] mb-3 flex items-center flex-wrap gap-1.5 font-medium">
          <a href="/home" className="hover:text-[#0F172A] transition-colors">Home</a>
          <span className="text-[#94A3B8]">›</span>
          <span className="text-[#64748B]">Modular Kitchen Systems & Fittings</span>
          <span className="text-[#94A3B8]">›</span>
          <span className="text-[#0F172A] font-bold">{currentSubcatName}</span>
        </nav>

        {/* ── SECTION HEADING ── */}
        <div className="mb-4">
          <h1 className="text-[22px] sm:text-[28px] font-black text-[#0F172A] tracking-tight">
            {currentSubcatName}
          </h1>
        </div>

        {/* ── MAIN WORKSPACE: SIDEBAR + GRID ── */}
        <div className="flex flex-col md:flex-row gap-5 items-start">
          {/* ── LEFT VERTICAL SUB-CATEGORY TABS ── */}
          <aside className="w-full md:w-[240px] lg:w-[260px] shrink-0 bg-white rounded-xl border border-[#E2E8F0] p-2 shadow-xs">
            <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
              {KITCHEN_SUBCATEGORIES.map((subcat) => {
                const isActive = activeSubcat === subcat.id;
                return (
                  <button
                    key={subcat.id}
                    onClick={() => handleSelectSubcat(subcat.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all w-full shrink-0 md:shrink border ${
                      isActive
                        ? "bg-[#EAF7EE] text-[#0F5132] font-bold border-[#16A34A]/30 border-r-[4px] border-r-[#16A34A]"
                        : "border-transparent text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-md bg-white border border-[#E2E8F0] flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-2xs">
                      <img src={subcat.icon} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[12.5px] leading-tight block truncate">
                        {subcat.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* ── MAIN LISTING AREA ── */}
          <main className="flex-1 min-w-0 w-full">
            {/* ── TOP FILTER & SORT TOOLBAR ── */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-3 mb-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12px] font-semibold text-[#64748B]">Filter:</span>

                {/* Category Dropdown */}
                <div className="relative">
                  <select
                    value={activeSubcat}
                    onChange={(e) => handleSelectSubcat(e.target.value)}
                    aria-label="Category"
                    className="appearance-none bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[12px] font-medium text-[#334155] rounded-md pl-2.5 pr-7 py-1.5 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#16A34A]"
                  >
                    {KITCHEN_SUBCATEGORIES.map((sc) => (
                      <option key={sc.id} value={sc.id}>{sc.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-2.5 pointer-events-none" />
                </div>

                {/* Brand Filter */}
                <div className="relative">
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    aria-label="Filter by Brand"
                    className="appearance-none bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[12px] font-medium text-[#334155] rounded-md pl-2.5 pr-7 py-1.5 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#16A34A]"
                  >
                    <option value="all">Brand ▾</option>
                    {brands.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-2.5 pointer-events-none" />
                </div>

                {/* Type Filter */}
                {types.length > 0 && (
                  <div className="relative">
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      aria-label="Filter by Type"
                      className="appearance-none bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[12px] font-medium text-[#334155] rounded-md pl-2.5 pr-7 py-1.5 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#16A34A]"
                    >
                      <option value="all">Type ▾</option>
                      {types.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-2.5 pointer-events-none" />
                  </div>
                )}

                {/* Size Filter */}
                {sizes.length > 0 && (
                  <div className="relative">
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      aria-label="Filter by Size"
                      className="appearance-none bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[12px] font-medium text-[#334155] rounded-md pl-2.5 pr-7 py-1.5 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#16A34A]"
                    >
                      <option value="all">Size ▾</option>
                      {sizes.map((s) => (
                        <option key={s as string} value={s as string}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-2.5 pointer-events-none" />
                  </div>
                )}

                {/* Color Filter */}
                {colors.length > 0 && (
                  <div className="relative">
                    <select
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      aria-label="Filter by Colors"
                      className="appearance-none bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[12px] font-medium text-[#334155] rounded-md pl-2.5 pr-7 py-1.5 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#16A34A]"
                    >
                      <option value="all">Colors ▾</option>
                      {colors.map((c) => (
                        <option key={c as string} value={c as string}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-2.5 pointer-events-none" />
                  </div>
                )}

                {/* Price Filter */}
                <div className="relative">
                  <select
                    value={selectedPrice}
                    onChange={(e) => setSelectedPrice(e.target.value)}
                    aria-label="Filter by Price"
                    className="appearance-none bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[12px] font-medium text-[#334155] rounded-md pl-2.5 pr-7 py-1.5 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#16A34A]"
                  >
                    <option value="all">Price ▾</option>
                    <option value="under-2000">Under ₹2,000</option>
                    <option value="2000-5000">₹2,000 - ₹5,000</option>
                    <option value="above-5000">Above ₹5,000</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Right Side: Product Count + Sort */}
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-[#64748B] font-medium">
                  {filteredProducts.length} products
                </span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort products by"
                    className="appearance-none bg-transparent text-[12px] font-bold text-[#0F172A] pr-5 py-1 cursor-pointer focus:outline-hidden"
                  >
                    <option value="relevance">Sort by: Relevance</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-0 top-1.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* ── 4-COLUMN PRODUCT GRID (EXACT HOMERUN STYLE) ── */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center">
                <p className="text-[15px] font-bold text-[#334155]">No products found matching filters.</p>
                <button
                  onClick={() => {
                    setSelectedBrand("all");
                    setSelectedType("all");
                    setSelectedSize("all");
                    setSelectedColor("all");
                    setSelectedMaterial("all");
                    setSelectedPrice("all");
                  }}
                  className="mt-3 text-[13px] font-bold text-[#16A34A] hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {filteredProducts.map((p) => {
                  const key = `hardware::${p.title.toLowerCase()}`;
                  const cartQty = cartItemByKey[key]?.quantity ?? 0;

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleOpenDetailModal(p)}
                      className="bg-white rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E1] p-3 flex flex-col justify-between transition-all duration-150 hover:shadow-md relative group cursor-pointer"
                    >
                      <div>
                        {/* Top Discount Badge */}
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="bg-[#2563EB] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-[2px]">
                            Save {p.discountPct}%
                          </span>
                        </div>

                        {/* Product Image Box */}
                        <div
                          onClick={() => handleOpenDetailModal(p)}
                          className="w-full aspect-square bg-[#F8FAFC] rounded-lg border border-[#F1F5F9] p-2 flex items-center justify-center cursor-pointer overflow-hidden group-hover:scale-[1.01] transition-transform relative"
                        >
                          <RealProductImage
                            product={p}
                            src={p.image}
                            alt={p.title}
                            title={p.title}
                            brand={p.brand}
                            category="modular-kitchen-systems"
                            className="w-full h-full object-contain"
                          />
                          {/* Mini carousel dots */}
                          <div className="absolute bottom-1.5 right-2 flex gap-1 opacity-70">
                            <span className="w-1 h-1 rounded-full bg-[#94A3B8]" />
                            <span className="w-1 h-1 rounded-full bg-[#CBD5E1]" />
                            <span className="w-1 h-1 rounded-full bg-[#CBD5E1]" />
                            <span className="w-1 h-1 rounded-full bg-[#CBD5E1]" />
                          </div>
                        </div>

                        {/* Price Row */}
                        <div className="mt-2.5 flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-[17px] sm:text-[18px] font-black text-[#0F172A]">
                            ₹{p.price.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[11px] text-[#94A3B8] line-through">
                            ₹{p.mrp.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[9px] text-[#94A3B8]">incl. GST</span>
                        </div>

                        {/* Product Title */}
                        <h3
                          onClick={() => handleOpenDetailModal(p)}
                          className="text-[12.5px] font-bold text-[#1E293B] leading-[1.35] mt-1 line-clamp-2 cursor-pointer hover:text-[#16A34A] transition-colors"
                        >
                          {p.title}
                        </h3>

                        {/* Cashback & Delivery Strip */}
                        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                          <span className="bg-[#16A34A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-xs">
                            Assured 1% cashback
                          </span>
                          <span className="text-[9.5px] text-[#16A34A] font-semibold">
                            Free Delivery on ₹1000+
                          </span>
                        </div>

                        {/* Specs Pill */}
                        {p.specsPill && (
                          <div className="mt-1 text-[10.5px] text-[#475569] font-medium">
                            {p.specsPill}
                          </div>
                        )}

                        {/* 60 Mins Delivery Tag */}
                        <div className="mt-1 flex items-center gap-1 text-[10.5px] text-[#64748B]">
                          <Clock className="w-3.5 h-3.5 text-[#16A34A]" />
                          <span>{p.deliveryTime}</span>
                        </div>
                      </div>

                      {/* Action Button: Options / Add / Stepper */}
                      <div className="mt-3 pt-2 border-t border-[#F1F5F9]">
                        {cartQty > 0 ? (
                          <div className="flex items-center justify-between border border-[#16A34A] bg-[#F0FDF4] rounded-md px-2 py-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleUpdateQty(p, cartQty - 1); }}
                              className="w-6 h-6 flex items-center justify-center text-[#16A34A] font-bold hover:bg-[#DCFCE7] rounded-sm transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[13px] font-black text-[#15803D]">
                              {cartQty}
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleUpdateQty(p, cartQty + 1); }}
                              className="w-6 h-6 flex items-center justify-center text-[#16A34A] font-bold hover:bg-[#DCFCE7] rounded-sm transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : p.optionsCount > 1 ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenDetailModal(p); }}
                            className="w-full py-1.5 border border-[#16A34A] text-[#16A34A] hover:bg-[#16A34A] hover:text-white rounded-md text-[12px] font-bold transition-all text-center"
                          >
                            {p.optionsCount} Options
                          </button>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleAddToCart(p); }}
                            disabled={addToCart.isPending}
                            className="w-full py-1.5 border border-[#16A34A] text-[#16A34A] hover:bg-[#16A34A] hover:text-white rounded-md text-[12px] font-bold transition-all text-center"
                          >
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Quick Product Detail Modal (when clicked from Options or Title) */}
      {quickDetailProduct && (
        <ProductDetailModal
          product={quickDetailProduct}
          isOpen={true}
          onClose={() => setQuickDetailProduct(null)}
          initialScrollToBulk={detailOptions.scrollToBulk}
          initialVariantId={detailOptions.variantId}
          cartQty={quickDetailProduct ? (cartItemByKey[`hardware::${quickDetailProduct.title.toLowerCase()}`]?.quantity ?? 0) : 0}
          onSetQty={(prod, newQty) => {
            const all = [
              ...TANDEMS_INSERTS_PRODUCTS,
              ...PULLOUTS_BASKETS_PRODUCTS,
              ...WASTE_BINS_PRODUCTS,
              ...MAGIC_CORNER_PANTRY_PRODUCTS,
              ...SKIRTING_HARDWARE_PRODUCTS,
            ];
            const match = all.find(x => x.id === prod.id || x.title.toLowerCase() === prod.title.toLowerCase());
            if (match) handleUpdateQty(match, newQty);
          }}
          onAddToCart={(prod, qty) => {
            const count = qty ?? 1;
            const all = [
              ...TANDEMS_INSERTS_PRODUCTS,
              ...PULLOUTS_BASKETS_PRODUCTS,
              ...WASTE_BINS_PRODUCTS,
              ...MAGIC_CORNER_PANTRY_PRODUCTS,
              ...SKIRTING_HARDWARE_PRODUCTS,
            ];
            const match = all.find(x => x.id === prod.id || x.title.toLowerCase() === prod.title.toLowerCase());
            if (match) {
              const cur = cartItemByKey[`hardware::${match.title.toLowerCase()}`]?.quantity ?? 0;
              handleUpdateQty(match, cur + count);
            }
          }}
        />
      )}
    </div>
  );
}
