import React, { useState, useMemo, useEffect } from "react";
import {
  Clock,
  ChevronDown,
  ChevronRight,
  Minus,
  Plus,
  SlidersHorizontal,
  Tag,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Layers,
  Wifi,
  HardDrive,
  Server,
  Truck,
  Sparkles,
  Zap,
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
import type { Product } from "@/components/ProductCard";
import { RealProductImage } from "@/components/RealProductImage";

export interface CCTVProduct {
  id: string;
  title: string;
  brand: string;
  oemModelCode: string;
  systemType: "ANALOG_HD" | "IP_POE" | "WIFI_STANDALONE" | "NETWORKING" | "UNIVERSAL_ACCESSORY";
  resolutionMP?: number;
  nightVisionType?: "IR" | "Full_Color" | "Dual_Light" | "N/A";
  isStqcCertified?: boolean;
  conductorMaterial?: "Pure Copper" | "CCA / Copper Clad" | "N/A";
  inclusionsBadge: string;
  hddIncluded?: boolean;
  poePortCount?: number;
  channelCount?: number;
  priceVolatility: "HIGH" | "STANDARD";
  vehicleType: "2-Wheeler" | "E-Loader";
  brandTier: 1 | 2 | 3;
  gstPercent: number;
  subcategory:
    | "cctv-cameras"
    | "dvr-nvr-recorders"
    | "surveillance-storage"
    | "cctv-lan-cables"
    | "power-poe-switches"
    | "routers-racks-accessories";
  type: string;
  price: number;
  mrp: number;
  discountPct: number;
  bulkPrice?: number;
  bulkSlabText?: string;
  image: string;
  spec: string;
  deliveryTime: string;
  unit: string;
  materialTag: string;
  optionsCount?: number;
}

export const CCTV_SUBCATEGORIES = [
  {
    id: "cctv-cameras",
    name: "CCTV Cameras",
    slug: "cctv-cameras",
    icon: "/images/subcategories/cameras-icon.webp",
    count: 12,
  },
  {
    id: "dvr-nvr-recorders",
    name: "DVR & NVR Recorders",
    slug: "dvr-nvr-recorders",
    icon: "/images/subcategories/nvr-dvr-switches-icon.webp",
    count: 10,
  },
  {
    id: "surveillance-storage",
    name: "Surveillance Storage",
    slug: "surveillance-storage",
    icon: "/images/subcategories/cctv-accessories-icon.webp",
    count: 6,
  },
  {
    id: "cctv-lan-cables",
    name: "CCTV & LAN Cables",
    slug: "cctv-lan-cables",
    icon: "/images/subcategories/cctv-cat6-cable-icon.webp",
    count: 7,
  },
  {
    id: "power-poe-switches",
    name: "Power & PoE Switches",
    slug: "power-poe-switches",
    icon: "/images/subcategories/nvr-dvr-switches-icon.webp",
    count: 10,
  },
  {
    id: "routers-racks-accessories",
    name: "Routers, Racks & Accessories",
    slug: "routers-racks-accessories",
    icon: "/images/subcategories/wifi-networking-icon.webp",
    count: 11,
  },
];

export const BRAND_TIERS: Record<number, { label: string; brands: string[] }> = {
  1: {
    label: "Tier 1: Core Surveillance Leaders",
    brands: ["CP Plus", "Hikvision", "Dahua"],
  },
  2: {
    label: "Tier 2: Smart Wi-Fi & Networking",
    brands: ["TP-Link", "D-Link", "Tenda", "EZVIZ", "Imou", "ERD", "Nomwell", "Zebronics", "Conon Pro"],
  },
  3: {
    label: "Tier 3: Storage & Cabling Specialists",
    brands: ["WD Purple", "Seagate", "SanDisk", "Polycab", "Finolex"],
  },
};

export const CCTV_PRODUCTS: CCTVProduct[] = [
  /* ══════════════════════════════════════════════════════════════════════
     1. CCTV CAMERAS (12 SKUs)
     ══════════════════════════════════════════════════════════════════════ */
  {
    id: "cp-plus-2-4mp-full-hd-ir-dome-camera-cp-vac-d24l2",
    title: "CP Plus 2.4MP Full HD IR Dome Camera - CP-VAC-D24L2",
    brand: "CP Plus",
    oemModelCode: "CP-VAC-D24L2",
    systemType: "ANALOG_HD",
    resolutionMP: 2.4,
    nightVisionType: "IR",
    isStqcCertified: false,
    inclusionsBadge: "12V Adapter Not Included",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 1,
    gstPercent: 18,
    subcategory: "cctv-cameras",
    type: "Analog HD Dome",
    price: 1350,
    mrp: 2020,
    discountPct: 33,
    bulkPrice: 1290,
    bulkSlabText: "Bulk price ₹1,290 ›",
    image: "/images/products/cctv/cp-plus-2-4mp-full-hd-ir-dome-camera-cp-vac-d24l2.webp",
    spec: "20m Smart IR · 4-in-1 Switchable · Low Light",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
    optionsCount: 1,
  },
  {
    id: "cp-plus-2-4mp-full-hd-ir-bullet-camera-cp-vac-t24l2",
    title: "CP Plus 2.4MP Full HD IR Bullet Camera - CP-VAC-T24L2",
    brand: "CP Plus",
    oemModelCode: "CP-VAC-T24L2",
    systemType: "ANALOG_HD",
    resolutionMP: 2.4,
    nightVisionType: "IR",
    isStqcCertified: false,
    inclusionsBadge: "12V Adapter Not Included",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 1,
    gstPercent: 18,
    subcategory: "cctv-cameras",
    type: "Analog HD Bullet",
    price: 1450,
    mrp: 2650,
    discountPct: 45,
    bulkPrice: 1380,
    bulkSlabText: "Bulk price ₹1,380 ›",
    image: "/images/products/cctv/cp-plus-2-4mp-full-hd-ir-bullet-camera-cp-vac-t24l2.webp",
    spec: "Outdoor IP66 · 20m IR Distance · Weatherproof",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
    optionsCount: 1,
  },
  {
    id: "hikvision-2mp-turbo-hd-bullet-ds-2ce16d0t-irpf",
    title: "Hikvision 2MP Turbo HD IR Bullet Camera - DS-2CE16D0T-IRPF",
    brand: "Hikvision",
    oemModelCode: "DS-2CE16D0T-IRPF",
    systemType: "ANALOG_HD",
    resolutionMP: 2,
    nightVisionType: "IR",
    isStqcCertified: false,
    inclusionsBadge: "12V Adapter Not Included",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 1,
    gstPercent: 18,
    subcategory: "cctv-cameras",
    type: "Turbo HD Bullet",
    price: 1480,
    mrp: 2350,
    discountPct: 37,
    bulkPrice: 1410,
    bulkSlabText: "Bulk price ₹1,410 ›",
    image: "/images/products/cctv/hikvision-2mp-turbo-hd-bullet-ds-2ce16d0t-irpf.webp",
    spec: "1080p Turbo HD · 20m Smart IR · IP67 Waterproof",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },
  {
    id: "hikvision-2mp-colorvu-dome-ds-2ce72dft-f",
    title: "Hikvision 2MP ColorVu Full-Color Dome Camera - DS-2CE72DFT-F",
    brand: "Hikvision",
    oemModelCode: "DS-2CE72DFT-F",
    systemType: "ANALOG_HD",
    resolutionMP: 2,
    nightVisionType: "Full_Color",
    isStqcCertified: false,
    inclusionsBadge: "24/7 Color Night Vision",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 1,
    gstPercent: 18,
    subcategory: "cctv-cameras",
    type: "ColorVu HD Dome",
    price: 2150,
    mrp: 3450,
    discountPct: 38,
    bulkPrice: 2050,
    bulkSlabText: "Bulk price ₹2,050 ›",
    image: "/images/products/cctv/hikvision-2mp-colorvu-dome-ds-2ce72dft-f.webp",
    spec: "24/7 Full Color · F1.0 Super Aperture · 20m White Light",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },
  {
    id: "dahua-2mp-hd-cooper-bullet-dh-hac-b1a21p",
    title: "Dahua 2MP HD Cooper Weatherproof Bullet - DH-HAC-B1A21P",
    brand: "Dahua",
    oemModelCode: "DH-HAC-B1A21P",
    systemType: "ANALOG_HD",
    resolutionMP: 2,
    nightVisionType: "IR",
    isStqcCertified: false,
    inclusionsBadge: "12V Adapter Not Included",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 1,
    gstPercent: 18,
    subcategory: "cctv-cameras",
    type: "HDCVI Bullet",
    price: 1420,
    mrp: 2200,
    discountPct: 35,
    bulkPrice: 1360,
    bulkSlabText: "Bulk price ₹1,360 ›",
    image: "/images/products/cctv/dahua-2mp-hd-cooper-bullet-dh-hac-b1a21p.webp",
    spec: "DWDR · 20m Smart IR · IP67 Heavy Weather Guard",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },
  {
    id: "cp-plus-2mp-ip-dome-camera-cp-unc-da21l3c-q",
    title: "CP Plus 2MP IP PoE Dome Camera - CP-UNC-DA21L3C-Q",
    brand: "CP Plus",
    oemModelCode: "CP-UNC-DA21L3C-Q",
    systemType: "IP_POE",
    resolutionMP: 2,
    nightVisionType: "IR",
    isStqcCertified: true,
    inclusionsBadge: "PoE Powered · STQC Certified",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 1,
    gstPercent: 18,
    subcategory: "cctv-cameras",
    type: "IP PoE Dome",
    price: 3505,
    mrp: 7300,
    discountPct: 52,
    bulkPrice: 3350,
    bulkSlabText: "Bulk price ₹3,350 ›",
    image: "/images/products/cctv/cp-plus-2mp-ip-dome-camera-cp-unc-da21l3c-q.webp",
    spec: "STQC Ready · 802.3af PoE · 30m IR · H.265+ Video",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
    optionsCount: 1,
  },
  {
    id: "cp-plus-4mp-ip-dome-camera-cp-unc-da41l3c-q",
    title: "CP Plus 4MP Ultra IP PoE Dome Camera - CP-UNC-DA41L3C-Q",
    brand: "CP Plus",
    oemModelCode: "CP-UNC-DA41L3C-Q",
    systemType: "IP_POE",
    resolutionMP: 4,
    nightVisionType: "Dual_Light",
    isStqcCertified: true,
    inclusionsBadge: "PoE Powered · STQC Certified",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 1,
    gstPercent: 18,
    subcategory: "cctv-cameras",
    type: "IP PoE Dome",
    price: 4150,
    mrp: 7990,
    discountPct: 48,
    bulkPrice: 3950,
    bulkSlabText: "Bulk price ₹3,950 ›",
    image: "/images/products/cctv/cp-plus-4mp-ip-dome-camera-cp-unc-da41l3c-q.webp",
    spec: "4MP Quad HD · 30m Dual IR/Color · Built-in Mic",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
    optionsCount: 1,
  },
  {
    id: "tp-link-tapo-c200-smart-camera",
    title: "TP-Link Tapo C200 Pan/Tilt Smart Wi-Fi Camera",
    brand: "TP-Link",
    oemModelCode: "TAPO-C200",
    systemType: "WIFI_STANDALONE",
    resolutionMP: 2,
    nightVisionType: "IR",
    isStqcCertified: false,
    inclusionsBadge: "Adapter Included · SD Not Included",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 2,
    gstPercent: 18,
    subcategory: "cctv-cameras",
    type: "Smart Wi-Fi PT",
    price: 2199,
    mrp: 3299,
    discountPct: 33,
    bulkPrice: 2099,
    bulkSlabText: "Bulk price ₹2,099 ›",
    image: "/images/products/cctv/tp-link-tapo-c200-smart-camera.webp",
    spec: "360° Horizontal Range · Two-Way Audio · Motion Detect",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },
  {
    id: "cp-plus-3mp-wifi-pt-camera-cp-e38q",
    title: "CP Plus 3MP Wi-Fi PT Camera - CP-E38Q",
    brand: "CP Plus",
    oemModelCode: "CP-E38Q",
    systemType: "WIFI_STANDALONE",
    resolutionMP: 3,
    nightVisionType: "IR",
    isStqcCertified: false,
    inclusionsBadge: "Adapter Included",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 1,
    gstPercent: 18,
    subcategory: "cctv-cameras",
    type: "Wi-Fi PT Camera",
    price: 2350,
    mrp: 2400,
    discountPct: 2,
    image: "/images/products/cctv/cp-plus-3mp-wifi-pt-camera-cp-e38q.webp",
    spec: "AI Human Detection · Pan-Tilt 360° · Cloud/SD Support",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
    optionsCount: 1,
  },
  {
    id: "cp-plus-4mp-wifi-full-color-pt-camera-cp-z43q",
    title: "CP Plus 4MP Wi-Fi Full Color PT Camera - CP-Z43Q",
    brand: "CP Plus",
    oemModelCode: "CP-Z43Q",
    systemType: "WIFI_STANDALONE",
    resolutionMP: 4,
    nightVisionType: "Full_Color",
    isStqcCertified: false,
    inclusionsBadge: "24/7 Color Night Vision",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 1,
    gstPercent: 18,
    subcategory: "cctv-cameras",
    type: "Wi-Fi Outdoor PT",
    price: 3984,
    mrp: 7690,
    discountPct: 48,
    bulkPrice: 3790,
    bulkSlabText: "Bulk price ₹3,790 ›",
    image: "/images/products/cctv/cp-plus-4mp-wifi-full-color-pt-camera-cp-z43q.webp",
    spec: "4MP 2K Quad HD · 345° Pan · Active Light Siren",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
    optionsCount: 1,
  },
  {
    id: "cp-plus-3mp-wifi-outdoor-bullet-camera-cp-v32g",
    title: "CP Plus 3MP Wi-Fi Outdoor Bullet Camera - CP-V32G",
    brand: "CP Plus",
    oemModelCode: "CP-V32G",
    systemType: "WIFI_STANDALONE",
    resolutionMP: 3,
    nightVisionType: "IR",
    isStqcCertified: false,
    inclusionsBadge: "IP66 Weatherproof",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 1,
    gstPercent: 18,
    subcategory: "cctv-cameras",
    type: "Wi-Fi Bullet",
    price: 2499,
    mrp: 3850,
    discountPct: 35,
    image: "/images/products/cctv/cp-plus-3mp-wifi-outdoor-bullet-camera-cp-v32g.webp",
    spec: "Dual Wi-Fi Antennas · 30m Night Vision · MicroSD Slot",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
    optionsCount: 1,
  },
  {
    id: "cp-plus-3mp-4g-sim-camera-ez-r33t",
    title: "CP Plus 3MP 4G SIM Outdoor Bullet Camera - EZ-R33T",
    brand: "CP Plus",
    oemModelCode: "EZ-R33T",
    systemType: "WIFI_STANDALONE",
    resolutionMP: 3,
    nightVisionType: "IR",
    isStqcCertified: false,
    inclusionsBadge: "4G SIM Slot · No Wi-Fi Needed",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 1,
    gstPercent: 18,
    subcategory: "cctv-cameras",
    type: "4G SIM Camera",
    price: 2784,
    mrp: 5200,
    discountPct: 46,
    image: "/images/products/cctv/cp-plus-3mp-4g-sim-camera-ez-r33t.webp",
    spec: "Direct 4G LTE · Construction Site Remote Monitoring",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
    optionsCount: 1,
  },

  /* ══════════════════════════════════════════════════════════════════════
     2. DVR & NVR RECORDERS (10 SKUs)
     ══════════════════════════════════════════════════════════════════════ */
  {
    id: "cp-plus-4-channel-dvr",
    title: "CP Plus 4 Channel HD DVR - CP-UVR-0401E1",
    brand: "CP Plus",
    oemModelCode: "CP-UVR-0401E1",
    systemType: "ANALOG_HD",
    channelCount: 4,
    hddIncluded: false,
    inclusionsBadge: "HDD Not Included",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 1,
    gstPercent: 18,
    subcategory: "dvr-nvr-recorders",
    type: "Analog DVR",
    price: 2799,
    mrp: 3899,
    discountPct: 28,
    bulkPrice: 2650,
    bulkSlabText: "Bulk price ₹2,650 ›",
    image: "/images/products/cctv/cp-plus-4-channel-dvr.webp",
    spec: "4CH 1080p Lite · H.265+ Compression · 1 SATA Port",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },
  {
    id: "hikvision-4ch-turbo-hd-dvr-ds-7104hghi-m1",
    title: "Hikvision 4 Channel Turbo HD DVR - DS-7104HGHI-M1",
    brand: "Hikvision",
    oemModelCode: "DS-7104HGHI-M1",
    systemType: "ANALOG_HD",
    channelCount: 4,
    hddIncluded: false,
    inclusionsBadge: "HDD Not Included",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 1,
    gstPercent: 18,
    subcategory: "dvr-nvr-recorders",
    type: "Turbo HD DVR",
    price: 2850,
    mrp: 4100,
    discountPct: 30,
    bulkPrice: 2720,
    bulkSlabText: "Bulk price ₹2,720 ›",
    image: "/images/products/cctv/hikvision-4ch-turbo-hd-dvr-ds-7104hghi-m1.webp",
    spec: "4CH Turbo HD · Motion 2.0 AI · Supports 4TB SATA",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },
  {
    id: "dahua-4ch-cooper-xvr-dh-xvr1b04h-i",
    title: "Dahua 4 Channel Cooper WizSense XVR - DH-XVR1B04H-I",
    brand: "Dahua",
    oemModelCode: "DH-XVR1B04H-I",
    systemType: "ANALOG_HD",
    channelCount: 4,
    hddIncluded: false,
    inclusionsBadge: "HDD Not Included",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 1,
    gstPercent: 18,
    subcategory: "dvr-nvr-recorders",
    type: "5-in-1 XVR",
    price: 2890,
    mrp: 4200,
    discountPct: 31,
    bulkPrice: 2750,
    bulkSlabText: "Bulk price ₹2,750 ›",
    image: "/images/products/cctv/dahua-4ch-cooper-xvr-dh-xvr1b04h-i.webp",
    spec: "5-in-1 Hybrid · SMD Plus AI Motion · Full Channel Coding",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },
  {
    id: "cp-plus-8-channel-dvr-cp-uvr-0801e1v-i",
    title: "CP Plus 8 Channel Full HD DVR - CP-UVR-0801E1V-I",
    brand: "CP Plus",
    oemModelCode: "CP-UVR-0801E1V-I",
    systemType: "ANALOG_HD",
    channelCount: 8,
    hddIncluded: false,
    inclusionsBadge: "HDD Not Included",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 1,
    gstPercent: 18,
    subcategory: "dvr-nvr-recorders",
    type: "Analog DVR",
    price: 5191,
    mrp: 6100,
    discountPct: 15,
    bulkPrice: 4950,
    bulkSlabText: "Bulk price ₹4,950 ›",
    image: "/images/products/cctv/cp-plus-8-channel-dvr-cp-uvr-0801e1v-i.webp",
    spec: "8CH Video + 1CH Audio · 1080p Support · Mobile Live",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },
  {
    id: "cp-plus-4-channel-nvr-cp-unr-104f1",
    title: "CP Plus 4 Channel 4K IP NVR - CP-UNR-104F1",
    brand: "CP Plus",
    oemModelCode: "CP-UNR-104F1",
    systemType: "IP_POE",
    channelCount: 4,
    hddIncluded: false,
    inclusionsBadge: "HDD Not Included",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 1,
    gstPercent: 18,
    subcategory: "dvr-nvr-recorders",
    type: "IP NVR",
    price: 4985,
    mrp: 18400,
    discountPct: 73,
    bulkPrice: 4750,
    bulkSlabText: "Bulk price ₹4,750 ›",
    image: "/images/products/cctv/cp-plus-4-channel-nvr-cp-unr-104f1.webp",
    spec: "4K Video Output · ONVIF Profile S/G/T · H.265 Decoding",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },
  {
    id: "cp-plus-8-channel-nvr-cp-unr-108f1",
    title: "CP Plus 8 Channel 4K IP NVR - CP-UNR-108F1",
    brand: "CP Plus",
    oemModelCode: "CP-UNR-108F1",
    systemType: "IP_POE",
    channelCount: 8,
    hddIncluded: false,
    inclusionsBadge: "HDD Not Included",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 1,
    gstPercent: 18,
    subcategory: "dvr-nvr-recorders",
    type: "IP NVR",
    price: 5900,
    mrp: 13000,
    discountPct: 55,
    bulkPrice: 5600,
    bulkSlabText: "Bulk price ₹5,600 ›",
    image: "/images/products/cctv/cp-plus-8-channel-nvr-cp-unr-108f1.webp",
    spec: "8CH 4K IP Video Streams · 80 Mbps Incoming Bandwidth",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },
  {
    id: "hikvision-8ch-nxi-acuasense-nvr-ds-7608nxi-k1",
    title: "Hikvision 8 Channel AcuSense 4K NVR - DS-7608NXI-K1",
    brand: "Hikvision",
    oemModelCode: "DS-7608NXI-K1",
    systemType: "IP_POE",
    channelCount: 8,
    isStqcCertified: true,
    hddIncluded: false,
    inclusionsBadge: "STQC Ready · HDD Not Included",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 1,
    gstPercent: 18,
    subcategory: "dvr-nvr-recorders",
    type: "AcuSense IP NVR",
    price: 6850,
    mrp: 10500,
    discountPct: 35,
    bulkPrice: 6550,
    bulkSlabText: "Bulk price ₹6,550 ›",
    image: "/images/products/cctv/hikvision-8ch-nxi-acuasense-nvr-ds-7608nxi-k1.webp",
    spec: "AcuSense AI Target Classification · 4K HDMI Output",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },
  {
    id: "cp-plus-16-channel-nvr",
    title: "CP Plus 16 Channel 4K IP NVR - CP-UNR-216F1",
    brand: "CP Plus",
    oemModelCode: "CP-UNR-216F1",
    systemType: "IP_POE",
    channelCount: 16,
    hddIncluded: false,
    inclusionsBadge: "HDD Not Included",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 1,
    gstPercent: 18,
    subcategory: "dvr-nvr-recorders",
    type: "16CH IP NVR",
    price: 9145,
    mrp: 12000,
    discountPct: 24,
    bulkPrice: 8750,
    bulkSlabText: "Bulk price ₹8,750 ›",
    image: "/images/products/cctv/cp-plus-16-channel-nvr.webp",
    spec: "16CH 4K Realtime · 2 SATA Bays up to 16TB Storage",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },
  {
    id: "conon-4-cam-analog-hd-complete-ready-kit",
    title: "Conon-Now 4-Cam Analog HD Complete Ready Kit",
    brand: "CP Plus",
    oemModelCode: "KIT-4CAM-AHD-CP",
    systemType: "ANALOG_HD",
    channelCount: 4,
    hddIncluded: true,
    inclusionsBadge: "1TB HDD & Cable Included",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 1,
    gstPercent: 18,
    subcategory: "dvr-nvr-recorders",
    type: "Complete Camera Kit",
    price: 13499,
    mrp: 18999,
    discountPct: 29,
    image: "/images/products/cctv/conon-4-cam-analog-hd-complete-ready-kit.webp",
    spec: "2 Dome + 2 Bullet + 4CH DVR + 1TB HDD + 90m Wire + SMPS + Connectors",
    deliveryTime: "60 Mins",
    unit: "Complete Kit",
    materialTag: "CCTV & Networking",
  },
  {
    id: "conon-4-cam-ip-poe-complete-ready-kit",
    title: "Conon-Now 4-Cam IP PoE Complete 4K/2K Ready Kit",
    brand: "Hikvision",
    oemModelCode: "KIT-4CAM-IP-HIK",
    systemType: "IP_POE",
    channelCount: 8,
    isStqcCertified: true,
    hddIncluded: true,
    inclusionsBadge: "2TB HDD & PoE Switch Included",
    priceVolatility: "STANDARD",
    vehicleType: "E-Loader",
    brandTier: 1,
    gstPercent: 18,
    subcategory: "dvr-nvr-recorders",
    type: "Complete IP Kit",
    price: 24890,
    mrp: 34500,
    discountPct: 28,
    image: "/images/products/cctv/conon-4-cam-ip-poe-complete-ready-kit.webp",
    spec: "4x 4MP IP Cameras + 8CH NVR + 2TB HDD + 4-Port PoE Switch + 100m Cat6",
    deliveryTime: "60 Mins",
    unit: "Complete Kit",
    materialTag: "CCTV & Networking",
  },

  /* ══════════════════════════════════════════════════════════════════════
     3. SURVEILLANCE STORAGE (6 SKUs)
     ══════════════════════════════════════════════════════════════════════ */
  {
    id: "seagate-skyhawk-surveillance-internal-hard-drive-1tb",
    title: "Seagate SkyHawk 1TB Surveillance SATA HDD - ST1000VX013",
    brand: "Seagate",
    oemModelCode: "ST1000VX013",
    systemType: "UNIVERSAL_ACCESSORY",
    priceVolatility: "HIGH",
    inclusionsBadge: "3-Yr Brand Warranty",
    vehicleType: "2-Wheeler",
    brandTier: 3,
    gstPercent: 18,
    subcategory: "surveillance-storage",
    type: "Surveillance HDD",
    price: 6950,
    mrp: 8500,
    discountPct: 18,
    bulkPrice: 6850,
    bulkSlabText: "Bulk price ₹6,850 ›",
    image: "/images/products/cctv/seagate-skyhawk-surveillance-internal-hard-drive-1tb.webp",
    spec: "64 HD Cameras · ImagePerfect Firmware · 1M Hr MTBF",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },
  {
    id: "western-digital-purple-1tb-surveillance-hard-drive",
    title: "Western Digital Purple 1TB Surveillance SATA HDD - WD11PURZ",
    brand: "WD Purple",
    oemModelCode: "WD11PURZ",
    systemType: "UNIVERSAL_ACCESSORY",
    priceVolatility: "HIGH",
    inclusionsBadge: "3-Yr Brand Warranty",
    vehicleType: "2-Wheeler",
    brandTier: 3,
    gstPercent: 18,
    subcategory: "surveillance-storage",
    type: "Surveillance HDD",
    price: 7150,
    mrp: 8800,
    discountPct: 19,
    bulkPrice: 6990,
    bulkSlabText: "Bulk price ₹6,990 ›",
    image: "/images/products/cctv/western-digital-purple-1tb-surveillance-hard-drive.webp",
    spec: "AllFrame 4K Tech · 64 HD Video Streams · 180 TB/yr Workload",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },
  {
    id: "western-digital-purple-surveillance-hard-drive-2tb",
    title: "Western Digital Purple 2TB Surveillance SATA HDD - WD23PURZ",
    brand: "WD Purple",
    oemModelCode: "WD23PURZ-85C5HY0",
    systemType: "UNIVERSAL_ACCESSORY",
    priceVolatility: "HIGH",
    inclusionsBadge: "3-Yr Brand Warranty",
    vehicleType: "2-Wheeler",
    brandTier: 3,
    gstPercent: 18,
    subcategory: "surveillance-storage",
    type: "Surveillance HDD",
    price: 12450,
    mrp: 16500,
    discountPct: 25,
    bulkPrice: 12200,
    bulkSlabText: "Bulk price ₹12,200 ›",
    image: "/images/products/cctv/western-digital-purple-surveillance-hard-drive-2tb.webp",
    spec: "AllFrame 4K · 64 Cameras · Low Power Draw & Heat Resistant",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },
  {
    id: "western-digital-purple-4tb-surveillance-hard-drive",
    title: "Western Digital Purple 4TB Surveillance SATA HDD - WD43PURZ",
    brand: "WD Purple",
    oemModelCode: "WD43PURZ",
    systemType: "UNIVERSAL_ACCESSORY",
    priceVolatility: "HIGH",
    inclusionsBadge: "3-Yr Brand Warranty",
    vehicleType: "2-Wheeler",
    brandTier: 3,
    gstPercent: 18,
    subcategory: "surveillance-storage",
    type: "Surveillance HDD",
    price: 17200,
    mrp: 22500,
    discountPct: 24,
    bulkPrice: 16800,
    bulkSlabText: "Bulk price ₹16,800 ›",
    image: "/images/products/cctv/western-digital-purple-4tb-surveillance-hard-drive.webp",
    spec: "4TB High Capacity · 256MB Cache · 24/7 DVR/NVR Workload",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },
  {
    id: "sandisk-high-endurance-64gb-microsd",
    title: "SanDisk High Endurance 64GB MicroSDXC Card - SDSQQNR-064G",
    brand: "SanDisk",
    oemModelCode: "SDSQQNR-064G",
    systemType: "WIFI_STANDALONE",
    priceVolatility: "STANDARD",
    inclusionsBadge: "C10 U3 5,000 Hrs",
    vehicleType: "2-Wheeler",
    brandTier: 3,
    gstPercent: 18,
    subcategory: "surveillance-storage",
    type: "MicroSD Card",
    price: 849,
    mrp: 1350,
    discountPct: 37,
    image: "/images/products/cctv/sandisk-high-endurance-64gb-microsd.webp",
    spec: "Up to 5,000 Hours Continuous Loop · Dashcam & Wi-Fi Cam Safe",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },
  {
    id: "sandisk-high-endurance-128gb-microsd",
    title: "SanDisk High Endurance 128GB MicroSDXC Card - SDSQQNR-128G",
    brand: "SanDisk",
    oemModelCode: "SDSQQNR-128G",
    systemType: "WIFI_STANDALONE",
    priceVolatility: "STANDARD",
    inclusionsBadge: "C10 U3 10,000 Hrs",
    vehicleType: "2-Wheeler",
    brandTier: 3,
    gstPercent: 18,
    subcategory: "surveillance-storage",
    type: "MicroSD Card",
    price: 1499,
    mrp: 2400,
    discountPct: 38,
    image: "/images/products/cctv/sandisk-high-endurance-128gb-microsd.webp",
    spec: "Up to 10,000 Hours Recording · 4K Video Support · Shockproof",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },

  /* ══════════════════════════════════════════════════════════════════════
     4. CCTV & LAN CABLES (7 SKUs)
     ══════════════════════════════════════════════════════════════════════ */
  {
    id: "cp-plus-3-plus-1-pure-copper-cctv-cable-90m",
    title: "CP Plus 3+1 Solid Pure Copper CCTV Cable, 90m Roll",
    brand: "CP Plus",
    oemModelCode: "CP-CAB-3+1-90M-CU",
    systemType: "ANALOG_HD",
    conductorMaterial: "Pure Copper",
    inclusionsBadge: "Pure Copper 90m",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 1,
    gstPercent: 18,
    subcategory: "cctv-lan-cables",
    type: "3+1 Coaxial Cable",
    price: 1650,
    mrp: 2490,
    discountPct: 34,
    bulkPrice: 1550,
    bulkSlabText: "Bulk price ₹1,550 ›",
    image: "/images/products/cctv/cp-plus-3-plus-1-pure-copper-cctv-cable-90m.webp",
    spec: "100% Solid Pure Copper · Low Attenuation Video & Power",
    deliveryTime: "60 Mins",
    unit: "Roll (90m)",
    materialTag: "CCTV & Networking",
  },
  {
    id: "finolex-gen-z-3-plus-1-cctv-cable-90m",
    title: "Finolex Gen Z (3+1) CCTV Pure Copper Cable, 90m",
    brand: "Finolex",
    oemModelCode: "Gen Z 3+1",
    systemType: "ANALOG_HD",
    conductorMaterial: "Pure Copper",
    inclusionsBadge: "Pure Copper 90m",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 3,
    gstPercent: 18,
    subcategory: "cctv-lan-cables",
    type: "3+1 Coaxial Cable",
    price: 1792,
    mrp: 2844,
    discountPct: 37,
    bulkPrice: 1690,
    bulkSlabText: "Bulk price ₹1,690 ›",
    image: "/images/products/cctv/finolex-gen-z-3-plus-1-cctv-cable-90m.webp",
    spec: "ISI Standard · Pure Copper Core · High Interference Shielding",
    deliveryTime: "60 Mins",
    unit: "Roll (90m)",
    materialTag: "CCTV & Networking",
  },
  {
    id: "d-link-cat6-cable-305m",
    title: "D-Link Cat6 UTP Pure Copper LAN Cable, 305m Box",
    brand: "D-Link",
    oemModelCode: "NCB-C6UGRYR-305",
    systemType: "IP_POE",
    conductorMaterial: "Pure Copper",
    priceVolatility: "HIGH",
    inclusionsBadge: "100% Solid Copper 305m",
    vehicleType: "E-Loader",
    brandTier: 2,
    gstPercent: 18,
    subcategory: "cctv-lan-cables",
    type: "Cat6 UTP Cable",
    price: 8450,
    mrp: 12500,
    discountPct: 32,
    bulkPrice: 8150,
    bulkSlabText: "Bulk price ₹8,150 ›",
    image: "/images/products/cctv/d-link-cat6-cable-305m.webp",
    spec: "23 AWG Solid Copper · Gigabit Certified · Flame Retardant",
    deliveryTime: "60 Mins",
    unit: "Box (305m)",
    materialTag: "CCTV & Networking",
  },
  {
    id: "polycab-cat6-pure-copper-utp-cable-305m",
    title: "Polycab Cat6 UTP Solid Pure Copper Cable, 305m Box",
    brand: "Polycab",
    oemModelCode: "POLYCAB-C6-CU-305",
    systemType: "IP_POE",
    conductorMaterial: "Pure Copper",
    priceVolatility: "HIGH",
    inclusionsBadge: "23 AWG Solid Copper",
    vehicleType: "E-Loader",
    brandTier: 3,
    gstPercent: 18,
    subcategory: "cctv-lan-cables",
    type: "Cat6 UTP Cable",
    price: 8250,
    mrp: 11900,
    discountPct: 31,
    bulkPrice: 7990,
    bulkSlabText: "Bulk price ₹7,990 ›",
    image: "/images/products/cctv/polycab-cat6-pure-copper-utp-cable-305m.webp",
    spec: "4-Pair Solid Copper · 250 MHz Bandwidth · Heavy PVC Jacket",
    deliveryTime: "60 Mins",
    unit: "Box (305m)",
    materialTag: "CCTV & Networking",
  },
  {
    id: "d-link-cat6-cable-100m",
    title: "D-Link Cat6 Pure Copper Cable, 100m Coil",
    brand: "D-Link",
    oemModelCode: "NCB-C6UGRYR-100",
    systemType: "IP_POE",
    conductorMaterial: "Pure Copper",
    inclusionsBadge: "Pure Copper 100m",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 2,
    gstPercent: 18,
    subcategory: "cctv-lan-cables",
    type: "Cat6 LAN Cable",
    price: 3150,
    mrp: 4800,
    discountPct: 34,
    image: "/images/products/cctv/d-link-cat6-cable-100m.webp",
    spec: "1000 Mbps High Speed · Site Ready 100m Cut",
    deliveryTime: "60 Mins",
    unit: "Coil (100m)",
    materialTag: "CCTV & Networking",
  },
  {
    id: "finolex-cat-6-lite-lan-cable-100m",
    title: "Finolex Cat6 Lite LAN Cable, 100m",
    brand: "Finolex",
    oemModelCode: "CAT 6 Lite",
    systemType: "NETWORKING",
    conductorMaterial: "CCA / Copper Clad",
    inclusionsBadge: "CCA Copper Clad",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 3,
    gstPercent: 18,
    subcategory: "cctv-lan-cables",
    type: "Cat6 Lite Cable",
    price: 2450,
    mrp: 3850,
    discountPct: 36,
    image: "/images/products/cctv/finolex-cat-6-lite-lan-cable-100m.webp",
    spec: "Economical Interior Cabling · 100m Pack",
    deliveryTime: "60 Mins",
    unit: "Coil (100m)",
    materialTag: "CCTV & Networking",
  },
  {
    id: "finolex-rg-6-ccs-axial-cable-100m",
    title: "Finolex RG-6 CCS Coaxial Cable, 100m",
    brand: "Finolex",
    oemModelCode: "RG-6 CCS",
    systemType: "ANALOG_HD",
    conductorMaterial: "CCA / Copper Clad",
    inclusionsBadge: "RG-6 Coaxial",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 3,
    gstPercent: 18,
    subcategory: "cctv-lan-cables",
    type: "RG-6 Coaxial",
    price: 1371,
    mrp: 2077,
    discountPct: 34,
    image: "/images/products/cctv/finolex-rg-6-ccs-axial-cable-100m.webp",
    spec: "TV, DTH & Extended CCTV Long Runs",
    deliveryTime: "60 Mins",
    unit: "Coil (100m)",
    materialTag: "CCTV & Networking",
  },

  /* ══════════════════════════════════════════════════════════════════════
     5. POWER & POE SWITCHES (10 SKUs)
     ══════════════════════════════════════════════════════════════════════ */
  {
    id: "cp-plus-4ch-12v-smps-power-supply",
    title: "CP Plus 4-Channel 12V 5A Central SMPS Power Supply",
    brand: "CP Plus",
    oemModelCode: "CP-DPS-MD04-12D",
    systemType: "ANALOG_HD",
    inclusionsBadge: "Metal Casing 12V 5A",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 1,
    gstPercent: 18,
    subcategory: "power-poe-switches",
    type: "Central SMPS",
    price: 699,
    mrp: 1100,
    discountPct: 36,
    bulkPrice: 650,
    bulkSlabText: "Bulk price ₹650 ›",
    image: "/images/products/cctv/cp-plus-4ch-12v-smps-power-supply.webp",
    spec: "Surge Protection · Regulated 12V DC Output · Overload Cutoff",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },
  {
    id: "cp-plus-8ch-12v-smps-power-supply",
    title: "CP Plus 8-Channel 12V 10A Central SMPS Power Supply",
    brand: "CP Plus",
    oemModelCode: "CP-DPS-MD08-12D",
    systemType: "ANALOG_HD",
    inclusionsBadge: "Metal Casing 12V 10A",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 1,
    gstPercent: 18,
    subcategory: "power-poe-switches",
    type: "Central SMPS",
    price: 1150,
    mrp: 1850,
    discountPct: 38,
    bulkPrice: 1080,
    bulkSlabText: "Bulk price ₹1,080 ›",
    image: "/images/products/cctv/cp-plus-8ch-12v-smps-power-supply.webp",
    spec: "Overload Guard · 8 Individual Channel PTC Fuses · Heavy Metal Box",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },
  {
    id: "erd-12v-2a-power-adapter",
    title: "ERD 12V 2A Standalone Power Adapter - ERD-1220",
    brand: "ERD",
    oemModelCode: "ERD-1220",
    systemType: "UNIVERSAL_ACCESSORY",
    inclusionsBadge: "Individual Adapter",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 2,
    gstPercent: 18,
    subcategory: "power-poe-switches",
    type: "12V Power Adapter",
    price: 320,
    mrp: 450,
    discountPct: 29,
    image: "/images/products/cctv/erd-12v-2a-power-adapter.webp",
    spec: "5.5x2.1 mm Standard DC Jack · Short Circuit Protected",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },
  {
    id: "cp-plus-4-port-poe-switch-cp-anw-hp4h2-n65",
    title: "CP Plus 4 Port PoE Switch, 65W - CP-ANW-HP4H2-N65",
    brand: "CP Plus",
    oemModelCode: "CP-ANW-HP4H2-N65",
    systemType: "IP_POE",
    poePortCount: 4,
    inclusionsBadge: "4-Port PoE (65W)",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 1,
    gstPercent: 18,
    subcategory: "power-poe-switches",
    type: "PoE Switch",
    price: 1350,
    mrp: 2100,
    discountPct: 36,
    bulkPrice: 1280,
    bulkSlabText: "Bulk price ₹1,280 ›",
    image: "/images/products/cctv/cp-plus-4-port-poe-switch-cp-anw-hp4h2-n65.webp",
    spec: "4 PoE Ports + 2 Uplink Ports · 250m Extend Switch",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },
  {
    id: "cp-plus-8-port-poe-switch-cp-anw-hpu8h2-n12",
    title: "CP Plus 8 Port PoE Switch - CP-ANW-HPU8H2-N12",
    brand: "CP Plus",
    oemModelCode: "CP-ANW-HPU8H2-N12",
    systemType: "IP_POE",
    poePortCount: 8,
    inclusionsBadge: "8-Port PoE (96W)",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 1,
    gstPercent: 18,
    subcategory: "power-poe-switches",
    type: "PoE Switch",
    price: 1780,
    mrp: 2090,
    discountPct: 15,
    bulkPrice: 1690,
    bulkSlabText: "Bulk price ₹1,690 ›",
    image: "/images/products/cctv/cp-plus-8-port-poe-switch-cp-anw-hpu8h2-n12.webp",
    spec: "8 PoE Ports + 2 Uplink · 250m Cable Runs · Smart Power Mgmt",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },
  {
    id: "tp-link-ls108gp-8-port-poe-switch",
    title: "TP-Link LS108GP 8-Port Gigabit PoE Switch",
    brand: "TP-Link",
    oemModelCode: "LS108GP",
    systemType: "IP_POE",
    poePortCount: 8,
    inclusionsBadge: "8x Gigabit PoE+",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 2,
    gstPercent: 18,
    subcategory: "power-poe-switches",
    type: "Gigabit PoE Switch",
    price: 3899,
    mrp: 5999,
    discountPct: 35,
    image: "/images/products/cctv/tp-link-ls108gp-8-port-poe-switch.webp",
    spec: "Full Gigabit Speed · 65W Total PoE Budget · Steel Enclosure",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },
  {
    id: "tp-link-ls110p-10-port-gigabit-poe-switch",
    title: "TP-Link LS110P 10-Port Gigabit PoE+ Switch",
    brand: "TP-Link",
    oemModelCode: "LS110P",
    systemType: "IP_POE",
    poePortCount: 8,
    inclusionsBadge: "8x PoE+ & 2x Uplink",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 2,
    gstPercent: 18,
    subcategory: "power-poe-switches",
    type: "PoE+ Switch",
    price: 2399,
    mrp: 4999,
    discountPct: 52,
    image: "/images/products/cctv/tp-link-ls110p-10-port-gigabit-poe-switch.webp",
    spec: "8 PoE+ Ports (63W) + 2 Gigabit Uplinks · 250m Long Distance",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },
  {
    id: "tp-link-10-100-mbps-switch",
    title: "TP-Link 10/100 Mbps Desktop Switch - TL-SF1005D",
    brand: "TP-Link",
    oemModelCode: "TL-SF1005D",
    systemType: "NETWORKING",
    inclusionsBadge: "Unmanaged Plug & Play",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 2,
    gstPercent: 18,
    subcategory: "power-poe-switches",
    type: "Network Switch",
    price: 699,
    mrp: 999,
    discountPct: 30,
    image: "/images/products/cctv/tp-link-10-100-mbps-switch.webp",
    spec: "5 Fast Ethernet Ports · Auto-MDI/MDIX · Energy Efficient",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
    optionsCount: 2,
  },
  {
    id: "tp-link-16-port-switch",
    title: "TP-Link 16 Port Gigabit Rackmount Switch - TL-SG1016D",
    brand: "TP-Link",
    oemModelCode: "TL-SG1016D",
    systemType: "NETWORKING",
    inclusionsBadge: "16x Gigabit Ports",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 2,
    gstPercent: 18,
    subcategory: "power-poe-switches",
    type: "Gigabit Switch",
    price: 3899,
    mrp: 5999,
    discountPct: 35,
    image: "/images/products/cctv/tp-link-16-port-switch.webp",
    spec: "Steel Rackmount Case · 16x 10/100/1000 Mbps Ports",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },
  {
    id: "tp-link-es220gmp-20-port-managed-poe-switch",
    title: "TP-Link ES220GMP 20-Port Managed PoE Switch",
    brand: "TP-Link",
    oemModelCode: "ES220GMP",
    systemType: "IP_POE",
    poePortCount: 16,
    inclusionsBadge: "Managed L2 VLAN & QoS",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 2,
    gstPercent: 18,
    subcategory: "power-poe-switches",
    type: "Managed PoE Switch",
    price: 13599,
    mrp: 20000,
    discountPct: 32,
    image: "/images/products/cctv/tp-link-es220gmp-20-port-managed-poe-switch.webp",
    spec: "16 PoE+ Ports + 2 Gigabit Uplink + 2 SFP Slots · Omada Cloud",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },

  /* ══════════════════════════════════════════════════════════════════════
     6. ROUTERS, RACKS & ACCESSORIES (11 SKUs)
     ══════════════════════════════════════════════════════════════════════ */
  {
    id: "bnc-connectors-pack-of-10",
    title: "BNC Pure Copper Spring Video Connectors - Pack of 10",
    brand: "Conon Pro",
    oemModelCode: "BNC-CU-10P",
    systemType: "ANALOG_HD",
    inclusionsBadge: "Pack of 10 Pcs",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 2,
    gstPercent: 18,
    subcategory: "routers-racks-accessories",
    type: "BNC Connector",
    price: 180,
    mrp: 300,
    discountPct: 40,
    bulkPrice: 160,
    bulkSlabText: "Bulk price ₹160 ›",
    image: "/images/products/cctv/bnc-connectors-pack-of-10.webp",
    spec: "Pure Copper Pin · Spring Strain Relief · Zero Signal Loss",
    deliveryTime: "60 Mins",
    unit: "Pack of 10",
    materialTag: "CCTV & Networking",
  },
  {
    id: "dc-power-connectors-pack-of-10",
    title: "12V DC Male Power Connectors - Pack of 10",
    brand: "Conon Pro",
    oemModelCode: "DC-PLUG-10P",
    systemType: "ANALOG_HD",
    inclusionsBadge: "Pack of 10 Pcs",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 2,
    gstPercent: 18,
    subcategory: "routers-racks-accessories",
    type: "DC Connector",
    price: 140,
    mrp: 250,
    discountPct: 44,
    bulkPrice: 120,
    bulkSlabText: "Bulk price ₹120 ›",
    image: "/images/products/cctv/dc-power-connectors-pack-of-10.webp",
    spec: "2.1x5.5mm · Screw Terminal (No Soldering Required)",
    deliveryTime: "60 Mins",
    unit: "Pack of 10",
    materialTag: "CCTV & Networking",
  },
  {
    id: "d-link-rj45-modular-connectors-box-100pcs",
    title: "D-Link Cat6 RJ45 Modular Connectors - 100 Pcs Box",
    brand: "D-Link",
    oemModelCode: "NCB-U681GR-100",
    systemType: "IP_POE",
    inclusionsBadge: "100 Pcs Box",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 2,
    gstPercent: 18,
    subcategory: "routers-racks-accessories",
    type: "RJ45 Connector",
    price: 650,
    mrp: 1100,
    discountPct: 41,
    bulkPrice: 590,
    bulkSlabText: "Bulk price ₹590 ›",
    image: "/images/products/cctv/d-link-rj45-modular-connectors-box-100pcs.webp",
    spec: "50u Gold Plated 8P8C Pins · Transparent Pass-Through Crimp",
    deliveryTime: "60 Mins",
    unit: "Box of 100",
    materialTag: "CCTV & Networking",
  },
  {
    id: "cctv-pvc-junction-box-4x4-pack-of-10",
    title: "4x4 Camera PVC Waterproof Junction Box - Pack of 10",
    brand: "Conon Pro",
    oemModelCode: "JB-PVC-4X4-10P",
    systemType: "UNIVERSAL_ACCESSORY",
    inclusionsBadge: "Pack of 10 Boxes",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 2,
    gstPercent: 18,
    subcategory: "routers-racks-accessories",
    type: "PVC Box",
    price: 380,
    mrp: 600,
    discountPct: 37,
    bulkPrice: 350,
    bulkSlabText: "Bulk price ₹350 ›",
    image: "/images/products/cctv/cctv-pvc-junction-box-4x4-pack-of-10.webp",
    spec: "IP65 Weatherproof · Heavy Unbreakable PVC · Pre-Marked Drill Holes",
    deliveryTime: "60 Mins",
    unit: "Pack of 10",
    materialTag: "CCTV & Networking",
  },
  {
    id: "nomwell-4u-wall-mount-network-rack",
    title: "Nomwell 4U Wall Mount Surveillance DVR/NVR Rack",
    brand: "Nomwell",
    oemModelCode: "NWR-4U-5540-GR",
    systemType: "UNIVERSAL_ACCESSORY",
    inclusionsBadge: "Glass Door & Lock",
    priceVolatility: "STANDARD",
    vehicleType: "E-Loader",
    brandTier: 2,
    gstPercent: 18,
    subcategory: "routers-racks-accessories",
    type: "4U Rack Cabinet",
    price: 1150,
    mrp: 1850,
    discountPct: 38,
    image: "/images/products/cctv/nomwell-4u-wall-mount-network-rack.webp",
    spec: "Toughened Glass Door · Top/Bottom Cable Inlets · Key Lock Included",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },
  {
    id: "nomwell-rack-cabinet",
    title: "Nomwell 2U Compact Wall Mount DVR Rack",
    brand: "Nomwell",
    oemModelCode: "NWR-2U-COMPACT",
    systemType: "UNIVERSAL_ACCESSORY",
    inclusionsBadge: "Lock & Key",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 2,
    gstPercent: 18,
    subcategory: "routers-racks-accessories",
    type: "2U Rack Cabinet",
    price: 850,
    mrp: 1350,
    discountPct: 37,
    image: "/images/products/cctv/nomwell-rack-cabinet.webp",
    spec: "Space-Saving 2U · Sturdy Powder-Coated Metal · Ventilated Sides",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },
  {
    id: "tp-link-archer-c6-wi-fi-router",
    title: "TP-Link Archer C6 Dual-Band AC1200 Wi-Fi Router",
    brand: "TP-Link",
    oemModelCode: "Archer C6",
    systemType: "NETWORKING",
    inclusionsBadge: "AC1200 Dual-Band",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 2,
    gstPercent: 18,
    subcategory: "routers-racks-accessories",
    type: "Wi-Fi Router",
    price: 2499,
    mrp: 4999,
    discountPct: 50,
    image: "/images/products/cctv/tp-link-archer-c6-wi-fi-router.webp",
    spec: "4 High-Gain Antennas · MU-MIMO Gigabit Ports · Access Point Mode",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },
  {
    id: "tp-link-tl-wr850n-300-mbps-wireless-router",
    title: "TP-Link TL-WR850N 300 Mbps Wireless Router",
    brand: "TP-Link",
    oemModelCode: "TL-WR850N",
    systemType: "NETWORKING",
    inclusionsBadge: "300 Mbps N",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 2,
    gstPercent: 18,
    subcategory: "routers-racks-accessories",
    type: "Wi-Fi Router",
    price: 1499,
    mrp: 2199,
    discountPct: 32,
    image: "/images/products/cctv/tp-link-tl-wr850n-300-mbps-wireless-router.webp",
    spec: "2x 5dBi Antennas · Agile Config · ISP Remote Management",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },
  {
    id: "tp-link-ceiling-mount-access-point",
    title: "TP-Link Omada AC1350 Ceiling Mount Access Point",
    brand: "TP-Link",
    oemModelCode: "EAP225 / EAP245",
    systemType: "NETWORKING",
    inclusionsBadge: "Omada Cloud & PoE",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 2,
    gstPercent: 18,
    subcategory: "routers-racks-accessories",
    type: "Access Point",
    price: 5699,
    mrp: 13900,
    discountPct: 59,
    image: "/images/products/cctv/tp-link-ceiling-mount-access-point.webp",
    spec: "Seamless Roaming · 802.3af PoE Supported · Centralized Controller",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
    optionsCount: 2,
  },
  {
    id: "zebster-by-zebronics-zeb-v19hd-18-5-inch-led-monitor",
    title: "Zebronics Zeb-V19HD 18.5 Inch Surveillance LED Monitor",
    brand: "Zebronics",
    oemModelCode: "Zeb-V19HD",
    systemType: "UNIVERSAL_ACCESSORY",
    inclusionsBadge: "HDMI & VGA Input",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 2,
    gstPercent: 18,
    subcategory: "routers-racks-accessories",
    type: "LED Monitor",
    price: 2589,
    mrp: 6000,
    discountPct: 57,
    image: "/images/products/cctv/zebster-by-zebronics-zeb-v19hd-18-5-inch-led-monitor.webp",
    spec: "Anti-Glare · VESA Wall Mountable · 8ms Response · Built-in Power",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },
  {
    id: "zebster-by-zebronics-z-ee22hd-21-5-inch-led-monitor",
    title: "Zebronics Z-EE22HD 21.5 Inch Full HD LED Monitor",
    brand: "Zebronics",
    oemModelCode: "Z-EE22HD",
    systemType: "UNIVERSAL_ACCESSORY",
    inclusionsBadge: "1080p Full HD",
    priceVolatility: "STANDARD",
    vehicleType: "2-Wheeler",
    brandTier: 2,
    gstPercent: 18,
    subcategory: "routers-racks-accessories",
    type: "LED Monitor",
    price: 3499,
    mrp: 13000,
    discountPct: 73,
    image: "/images/products/cctv/zebster-by-zebronics-z-ee22hd-21-5-inch-led-monitor.webp",
    spec: "Full HD 1920x1080 · HDMI & VGA · Slim Bezel · 5ms Response",
    deliveryTime: "60 Mins",
    unit: "Piece",
    materialTag: "CCTV & Networking",
  },
];

export const CCTV_PRODUCTS_MAP: Record<string, CCTVProduct> = CCTV_PRODUCTS.reduce(
  (acc, p) => {
    acc[p.id] = p;
    return acc;
  },
  {} as Record<string, CCTVProduct>,
);

export interface CCTVCollectionStorefrontProps {
  defaultSubcat?: string;
  onOpenDetail?: (product: Product) => void;
}

export function CCTVCollectionStorefront({
  defaultSubcat,
  onOpenDetail,
}: CCTVCollectionStorefrontProps) {
  const queryClient = useQueryClient();
  const { data: cart } = useGetCart();
  const addToCartMutation = useAddToCart();
  const updateCartMutation = useUpdateCartItem();
  const removeFromCartMutation = useRemoveFromCart();

  const getInitialSubcat = () => {
    if (defaultSubcat && CCTV_SUBCATEGORIES.some((s) => s.id === defaultSubcat)) {
      return defaultSubcat;
    }
    const path = typeof window !== "undefined" ? window.location.pathname.toLowerCase() : "";
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const catParam = params?.get("cat")?.toLowerCase() || params?.get("subcat")?.toLowerCase() || "";

    if (path.includes("storage") || path.includes("surveillance-storage") || catParam.includes("storage")) {
      return "surveillance-storage";
    }
    if (path.includes("cable") || path.includes("cctv-lan-cables") || path.includes("cat6") || catParam.includes("cable")) {
      return "cctv-lan-cables";
    }
    if (path.includes("power") || path.includes("power-poe-switches") || path.includes("poe") || path.includes("switch") || catParam.includes("power") || catParam.includes("switch")) {
      return "power-poe-switches";
    }
    if (path.includes("rack") || path.includes("routers-racks-accessories") || path.includes("wifi") || path.includes("accessories") || catParam.includes("rack") || catParam.includes("router")) {
      return "routers-racks-accessories";
    }
    if (path.includes("dvr") || path.includes("nvr") || path.includes("dvr-nvr-recorders") || path.includes("nvr-dvr") || catParam.includes("dvr") || catParam.includes("nvr")) {
      return "dvr-nvr-recorders";
    }
    if (path.includes("camera") || path.includes("cctv-cameras") || catParam.includes("camera")) {
      return "cctv-cameras";
    }
    return "cctv-cameras";
  };

  const [activeSubcat, setActiveSubcat] = useState<string>(getInitialSubcat);
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedSystemType, setSelectedSystemType] = useState<string>("all");
  const [selectedResolution, setSelectedResolution] = useState<string>("all");
  const [stqcOnly, setStqcOnly] = useState<boolean>(false);
  const [pureCopperOnly, setPureCopperOnly] = useState<boolean>(false);
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [quickDetailProduct, setQuickDetailProduct] = useState<Product | null>(null);

  // Sync with browser back/forward and pathname
  useEffect(() => {
    const handlePopState = () => {
      setActiveSubcat(getInitialSubcat());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleSubcategoryChange = (id: string) => {
    setActiveSubcat(id);
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", `/collections/${id}`);
    }
  };

  const cartItemsList = useMemo(() => {
    const list: Array<{ id: string; materialId: string; quantity: number; name?: string }> = [];
    if (!cart?.categories) return list;
    for (const c of cart.categories) {
      for (const item of c.items ?? []) {
        list.push({
          id: String(item.id),
          materialId: item.materialId,
          quantity: item.quantity,
          name: item.name,
        });
      }
    }
    return list;
  }, [cart]);

  /* ── Technician-Safe Cart Compatibility Analysis ─────────────────── */
  const cartAnalysis = useMemo(() => {
    if (cartItemsList.length === 0) {
      return {
        hasAnalog: false,
        hasIpPoe: false,
        hasWifi: false,
        hasDvrOrNvr: false,
        hasHdd: false,
        hasCoaxialCable: false,
        hasCat6Cable: false,
        warnings: [] as string[],
      };
    }

    let hasAnalog = false;
    let hasIpPoe = false;
    let hasWifi = false;
    let hasDvrOrNvr = false;
    let hasHdd = false;
    let hasCoaxialCable = false;
    let hasCat6Cable = false;

    cartItemsList.forEach((item) => {
      const p = CCTV_PRODUCTS.find((cp) => cp.id === item.materialId);
      const nameLower = (item.name || "").toLowerCase();

      if (p?.systemType === "ANALOG_HD" || nameLower.includes("dvr") || nameLower.includes("turbo hd") || nameLower.includes("3+1")) {
        hasAnalog = true;
      }
      if (p?.systemType === "IP_POE" || nameLower.includes("nvr") || nameLower.includes("poe") || nameLower.includes("cat6")) {
        hasIpPoe = true;
      }
      if (p?.systemType === "WIFI_STANDALONE" || nameLower.includes("tapo") || nameLower.includes("wi-fi") || nameLower.includes("4g sim")) {
        hasWifi = true;
      }
      if (p?.channelCount || nameLower.includes("dvr") || nameLower.includes("nvr")) {
        hasDvrOrNvr = true;
      }
      if (p?.subcategory === "surveillance-storage" || nameLower.includes("hard drive") || nameLower.includes("skyhawk") || nameLower.includes("wd purple") || nameLower.includes("tb")) {
        hasHdd = true;
      }
      if (nameLower.includes("3+1") || nameLower.includes("coaxial")) {
        hasCoaxialCable = true;
      }
      if (nameLower.includes("cat6") || nameLower.includes("lan cable")) {
        hasCat6Cable = true;
      }
    });

    const warnings: string[] = [];
    if (hasAnalog && hasIpPoe && !hasDvrOrNvr) {
      warnings.push("Mixed System Notice: Your cart contains both Analog HD and IP PoE products. Verify that your installation has the corresponding DVR or PoE switch.");
    }
    if (hasDvrOrNvr && !hasHdd) {
      warnings.push("Storage Notice: Standalone DVRs & NVRs do not include a hard drive. Remember to add a 1TB / 2TB Surveillance HDD to enable video recording.");
    }
    if (hasIpPoe && hasCoaxialCable && !hasCat6Cable) {
      warnings.push("Cabling Warning: IP PoE cameras communicate over Cat6 LAN cable + RJ45 connectors, not 3+1 coaxial wire.");
    }

    return {
      hasAnalog,
      hasIpPoe,
      hasWifi,
      hasDvrOrNvr,
      hasHdd,
      hasCoaxialCable,
      hasCat6Cable,
      warnings,
    };
  }, [cartItemsList]);

  /* ── Filtered Products ────────────────────────────────────────────── */
  const filteredProducts = useMemo(() => {
    let result = CCTV_PRODUCTS.filter((p) => p.subcategory === activeSubcat);

    if (selectedBrand !== "all") {
      result = result.filter((p) => p.brand.toLowerCase() === selectedBrand.toLowerCase());
    }
    if (selectedSystemType !== "all") {
      result = result.filter((p) => p.systemType === selectedSystemType);
    }
    if (selectedResolution !== "all") {
      const resNum = parseFloat(selectedResolution);
      result = result.filter((p) => p.resolutionMP === resNum);
    }
    if (stqcOnly) {
      result = result.filter((p) => p.isStqcCertified === true);
    }
    if (pureCopperOnly) {
      result = result.filter((p) => p.conductorMaterial === "Pure Copper");
    }

    if (selectedPrice !== "all") {
      if (selectedPrice === "under-2000") result = result.filter((p) => p.price < 2000);
      else if (selectedPrice === "2000-5000") result = result.filter((p) => p.price >= 2000 && p.price <= 5000);
      else if (selectedPrice === "5000-10000") result = result.filter((p) => p.price >= 5000 && p.price <= 10000);
      else if (selectedPrice === "above-10000") result = result.filter((p) => p.price > 10000);
    }

    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
    else if (sortBy === "discount") result.sort((a, b) => b.discountPct - a.discountPct);

    return result;
  }, [
    activeSubcat,
    selectedBrand,
    selectedSystemType,
    selectedResolution,
    stqcOnly,
    pureCopperOnly,
    selectedPrice,
    sortBy,
  ]);

  /* ── Cart Quantity Helper ──────────────────────────────────────────── */
  const getQtyInCart = (prodId: string): number => {
    const item = cartItemsList.find((i) => i.materialId === prodId);
    return item ? item.quantity : 0;
  };

  const handleAdd = (product: CCTVProduct) => {
    addToCartMutation.mutate(
      {
        data: {
          materialId: product.id,
          quantity: 1,
          price: product.price,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast.success(`Added ${product.title} to site cart`);
        },
        onError: () => {
          toast.error("Failed to add to cart");
        },
      },
    );
  };

  const handleUpdateQty = (product: CCTVProduct, newQty: number) => {
    const item = cartItemsList.find((i) => i.materialId === product.id);
    if (!item) return;

    if (newQty <= 0) {
      removeFromCartMutation.mutate(
        { itemId: item.id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          },
        },
      );
    } else {
      updateCartMutation.mutate(
        {
          itemId: item.id,
          data: { quantity: newQty },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          },
        },
      );
    }
  };

  const toGenericProduct = (p: CCTVProduct): Product => ({
    id: p.id,
    name: p.title,
    title: p.title,
    brand: p.brand,
    unit: p.unit,
    price: p.price,
    mrp: p.mrp,
    image: p.image,
    materialTag: "CCTV & Networking",
    rating: 4.8,
    reviews: 124,
    deliveryEta: "60 Mins",
    specs: p.spec ? [{ label: "Specification", value: p.spec }] : [],
    bulkPrice: p.bulkPrice,
    bulkSlabText: p.bulkSlabText,
  });

  const activeSubcatObj = CCTV_SUBCATEGORIES.find((s) => s.id === activeSubcat);

  return (
    <div className="w-full bg-[#F4F6F8] min-h-screen pb-20">
      {/* ── Top Header & Breadcrumb ─────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto">
            <span>Home</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span>CCTV & Networking</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-semibold text-gray-900">{activeSubcatObj?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Zap className="w-3 h-3 text-emerald-600" />
              60-Min Lucknow Express Delivery
            </span>
            <span className="text-xs font-medium text-gray-500">
              Naza Market & Aminabad Distributors
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Storefront Content ────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        {/* ── Technician Compatibility Warning Banner ─────────────────── */}
        {cartAnalysis.warnings.length > 0 && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-amber-900">
                Technician Site Advisory ({cartAnalysis.warnings.length} Active Notice)
              </p>
              {cartAnalysis.warnings.map((w, idx) => (
                <p key={idx} className="text-[11px] text-amber-800 font-medium leading-relaxed">
                  • {w}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* ── Smart Cross-Sell Recommendation Strip ────────────────────── */}
        <div className="mb-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-4 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold tracking-tight">
                  {activeSubcat === "cctv-cameras" || activeSubcat === "dvr-nvr-recorders"
                    ? "Essential Lucknow Site Installation Companion"
                    : activeSubcat === "surveillance-storage"
                    ? "24/7 Continuous Surveillance Storage Sizing"
                    : "Pure Copper Installation Gear"}
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                {activeSubcat === "cctv-cameras" || activeSubcat === "dvr-nvr-recorders"
                  ? "Don't stall your installation on site: Ensure you have 3+1 Pure Copper Wire, 12V Central SMPS, BNC/DC Connectors, and 1TB/2TB Surveillance Storage."
                  : activeSubcat === "surveillance-storage"
                  ? "Rule of Thumb: 4 Cameras @ 1080p H.265 = 1TB (~18 Days) | 8 Cameras @ 4MP = 2TB/4TB. Standard desktop drives void recorder warranty."
                  : "All Conon-Now solid cables feature 100% pure electrolytic copper for zero signal loss over 100-meter site runs."}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleSubcategoryChange("surveillance-storage")}
                className="px-3.5 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition shadow-sm"
              >
                View Storage (HDDs) →
              </button>
              <button
                onClick={() => handleSubcategoryChange("routers-racks-accessories")}
                className="px-3.5 py-1.5 rounded-xl bg-blue-700 text-white text-xs font-bold hover:bg-blue-600 transition border border-blue-500"
              >
                Racks & Accessories
              </button>
            </div>
          </div>
        </div>

        {/* ── Subcategory Navigation Strip ────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
          {CCTV_SUBCATEGORIES.map((subcat) => {
            const isActive = activeSubcat === subcat.id;
            return (
              <button
                key={subcat.id}
                onClick={() => handleSubcategoryChange(subcat.id)}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition ${
                  isActive
                    ? "bg-[#1848a0] text-white border-[#1848a0] shadow-md ring-2 ring-blue-300/40"
                    : "bg-white text-gray-800 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center overflow-hidden ${
                    isActive ? "bg-white/20" : "bg-gray-100"
                  }`}
                >
                  <img
                    src={subcat.icon}
                    alt={subcat.name}
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate leading-tight">{subcat.name}</p>
                  <p
                    className={`text-[10px] font-medium mt-0.5 ${
                      isActive ? "text-blue-100" : "text-gray-400"
                    }`}
                  >
                    {subcat.count} Items
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Multi-Faceted Filter & Sort Bar ──────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-3.5 mb-5 shadow-sm space-y-3">
          {/* Top Row: System Type Pills + Quick Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-1 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
              System:
            </span>
            {[
              { id: "all", label: "All Systems" },
              { id: "ANALOG_HD", label: "Analog HD (BNC)" },
              { id: "IP_POE", label: "IP PoE (Ethernet)" },
              { id: "WIFI_STANDALONE", label: "Wi-Fi Smart" },
              { id: "NETWORKING", label: "Switches & Racks" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedSystemType(st.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                  selectedSystemType === st.id
                    ? "bg-[#1848a0] text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {st.label}
              </button>
            ))}

            <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block" />

            {/* Quick Badges Filter */}
            <button
              onClick={() => setStqcOnly(!stqcOnly)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 ${
                stqcOnly
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              STQC / Tender Certified
            </button>

            <button
              onClick={() => setPureCopperOnly(!pureCopperOnly)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 ${
                pureCopperOnly
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              100% Pure Copper Wire
            </button>
          </div>

          {/* Bottom Row: Brand, Resolution, Price, and Sort Dropdowns */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-2">
              {/* Brand Filter */}
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 font-medium text-gray-700 outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Brands (Lucknow Distributors)</option>
                <optgroup label="Tier 1: Core Surveillance">
                  <option value="CP Plus">CP Plus</option>
                  <option value="Hikvision">Hikvision</option>
                  <option value="Dahua">Dahua</option>
                </optgroup>
                <optgroup label="Tier 2: Wi-Fi & Switches">
                  <option value="TP-Link">TP-Link</option>
                  <option value="D-Link">D-Link</option>
                  <option value="Zebronics">Zebronics</option>
                  <option value="Nomwell">Nomwell Racks</option>
                  <option value="Conon Pro">Conon Pro Connectors</option>
                </optgroup>
                <optgroup label="Tier 3: Storage & Cabling">
                  <option value="Seagate">Seagate SkyHawk</option>
                  <option value="WD Purple">WD Purple</option>
                  <option value="SanDisk">SanDisk High Endurance</option>
                  <option value="Finolex">Finolex Cables</option>
                  <option value="Polycab">Polycab Cables</option>
                </optgroup>
              </select>

              {/* Resolution Filter */}
              <select
                value={selectedResolution}
                onChange={(e) => setSelectedResolution(e.target.value)}
                className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 font-medium text-gray-700 outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Resolutions</option>
                <option value="2">2MP / 1080p</option>
                <option value="2.4">2.4MP Full HD</option>
                <option value="3">3MP 2K</option>
                <option value="4">4MP Quad HD</option>
              </select>

              {/* Price Range */}
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 font-medium text-gray-700 outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Price: All Ranges</option>
                <option value="under-2000">Under ₹2,000</option>
                <option value="2000-5000">₹2,000 – ₹5,000</option>
                <option value="5000-10000">₹5,000 – ₹10,000</option>
                <option value="above-10000">Above ₹10,000</option>
              </select>
            </div>

            {/* Sort & Count */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 font-medium">
                {filteredProducts.length} Products
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 font-medium text-gray-700 outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="relevance">Sort: Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="discount">Highest Discount</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Product Cards Grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const qtyInCart = getQtyInCart(product.id);
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                {/* Top Image + Badges Section */}
                <div
                  className="relative p-4 pb-2 bg-gray-50 flex items-center justify-center cursor-pointer group"
                  onClick={() => {
                    if (onOpenDetail) onOpenDetail(toGenericProduct(product));
                    else setQuickDetailProduct(toGenericProduct(product));
                  }}
                >
                  {/* Discount Badge */}
                  {product.discountPct > 0 && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-[11px] font-black bg-[#1565C0] text-white shadow-sm z-10">
                      Save {product.discountPct}%
                    </span>
                  )}

                  {/* STQC Badge or Pure Copper Badge */}
                  {product.isStqcCertified ? (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-600 text-white shadow-sm z-10 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      STQC
                    </span>
                  ) : product.conductorMaterial === "Pure Copper" ? (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-600 text-white shadow-sm z-10 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      PURE COPPER
                    </span>
                  ) : null}

                  {/* Product Image */}
                  <div className="w-44 h-44 flex items-center justify-center py-2">
                    <RealProductImage
                      product={product}
                      src={product.image}
                      title={product.title}
                      brand={product.brand}
                      category="CCTV & Networking"
                      alt={product.title}
                      variant="card"
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Inclusions Pill */}
                  <div className="absolute bottom-2 left-3 right-3">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 text-gray-700 backdrop-blur-sm border border-gray-200/80 shadow-xs truncate max-w-full">
                      {product.inclusionsBadge}
                    </span>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Brand + OEM Model Code */}
                    <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold mb-1">
                      <span className="text-[#1848a0] uppercase tracking-wider">{product.brand}</span>
                      <span className="text-gray-400 truncate max-w-[120px]">
                        {product.oemModelCode}
                      </span>
                    </div>

                    {/* Product Title */}
                    <h3
                      className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 leading-snug cursor-pointer hover:text-[#1848a0] transition"
                      onClick={() => {
                        if (onOpenDetail) onOpenDetail(toGenericProduct(product));
                        else setQuickDetailProduct(toGenericProduct(product));
                      }}
                    >
                      {product.title}
                    </h3>

                    {/* Spec Summary Chip */}
                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-1 font-medium">
                      {product.spec}
                    </p>

                    {/* Delivery & Logistics SLA */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <Clock className="w-3 h-3" />
                        {product.deliveryTime}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        <Truck className="w-3 h-3 text-gray-400" />
                        {product.vehicleType}
                      </span>
                    </div>

                    {/* Bulk Pricing Strip */}
                    {product.bulkPrice && (
                      <div className="mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50/70 border border-emerald-100 px-2 py-0.5 rounded-md inline-block">
                        {product.bulkSlabText || `Bulk @ ₹${product.bulkPrice}`}
                      </div>
                    )}
                  </div>

                  {/* Price & CTA Button */}
                  <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-black text-gray-900">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>
                        {product.mrp > product.price && (
                          <span className="text-xs text-gray-400 line-through font-medium">
                            ₹{product.mrp.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium block">
                        Incl. 18% GST ({product.unit})
                      </span>
                    </div>

                    {/* Add Button or Quantity Stepper */}
                    {qtyInCart === 0 ? (
                      <button
                        onClick={() => handleAdd(product)}
                        className="px-4 py-2 rounded-xl bg-[#1848a0] text-white text-xs font-bold hover:bg-[#123678] active:scale-95 transition shadow-sm"
                      >
                        Add
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 bg-[#1848a0] text-white px-2 py-1 rounded-xl shadow-sm">
                        <button
                          onClick={() => handleUpdateQty(product, qtyInCart - 1)}
                          className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/20 active:scale-90"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black min-w-[14px] text-center">
                          {qtyInCart}
                        </span>
                        <button
                          onClick={() => handleUpdateQty(product, qtyInCart + 1)}
                          className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/20 active:scale-90"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Quick Detail Modal / Bottom Sheet ─────────────────────────── */}
      {quickDetailProduct && (
        <ProductDetailModal
          isOpen={true}
          product={quickDetailProduct}
          onClose={() => setQuickDetailProduct(null)}
          onAddToCart={() => {
            const cctvP = CCTV_PRODUCTS.find((p) => p.id === quickDetailProduct.id);
            if (cctvP) handleAdd(cctvP);
          }}
        />
      )}
    </div>
  );
}
