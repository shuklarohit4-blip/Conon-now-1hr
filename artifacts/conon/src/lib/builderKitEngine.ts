/**
 * Conon-Now: Lucknow Flagship 6-Stage Home Construction Material Planner & BOQ Engine
 * Pure, well-typed civil engineering estimation engine aligned with Lucknow market standards:
 * - Banda Coarse Morang Sand & Kabrai Kali Gitti sold by CFT (5% GST, Trolley)
 * - 3 Brand Tiers: STANDARD, PREMIUM, LUXURY
 * - Dynamic live catalog SKU matcher connecting all 16 categories and 753 SKUs
 */

import type { MasterCatalogSKU } from "../types/catalog";
export type { MasterCatalogSKU };

export type QualityTier = "STANDARD" | "PREMIUM" | "LUXURY";
export type WallType = "RED_BRICK" | "AAC_BLOCK";

export interface ProjectInputs {
  plotAreaSqFt: number; // e.g. 1000
  floors: number; // 1 (G), 2 (G+1), 3 (G+2), 4 (G+3)
  builtUpSqFt: number; // plotAreaSqFt * floors (or custom override)
  bathrooms: number;
  kitchens: number;
  doorsCount: number;
  qualityTier: QualityTier;
  wallType: WallType;
  lucknowZone: string;
}

export interface BOQLineItem {
  id: string; // SKU ID or fallback key
  stageId: number; // 1 to 6
  categorySlug: string;
  categoryName: string;
  itemKey: string;
  title: string;
  spec: string;
  brand: string;
  quantity: number;
  unit: string;
  sellingPrice: number;
  gstPercent: number; // 5, 12, 18
  preGstBase: number;
  lineTotal: number;
  deliveryVehicleType: "2W_BIKE" | "3W_ELECTRIC_LOADER" | "4W_PICKUP" | "HEAVY_TRUCK";
  vehicleLabel: string;
  thumbnail: string;
  civilNote: string;
  wastagePercent?: number; // e.g. 10 for tiles
  selected: boolean;
  matchedSkuId?: string;
  tier: QualityTier;
}

export interface StageBOQSummary {
  stageId: number;
  stageName: string;
  shortName: string;
  description: string;
  iconName: string;
  items: BOQLineItem[];
  subtotal: number;
  preGstTotal: number;
  gstTotal: number;
  itemCount: number;
  vehicleCounts: Record<string, number>;
}

export interface FullProjectEstimate {
  inputs: ProjectInputs;
  stages: StageBOQSummary[];
  grandTotal: number;
  grandPreGst: number;
  grandGst: number;
  costPerSqFt: number;
  totalItemsCount: number;
  vehicleSummary: {
    bike: number;
    eLoader: number;
    pickup: number;
    truckOrTrolley: number;
  };
}

export const LUCKNOW_ZONES = [
  "Sushant Golf City",
  "Gomti Nagar / Extension",
  "Shaheed Path",
  "Indira Nagar",
  "Alambagh",
  "Chinhat / Faizabad Road",
  "Kanpur Road / Transport Nagar",
  "Barabanki Road",
  "Hazratganj & Central",
  "Vrindavan Yojna",
] as const;

export const DEFAULT_PROJECT_INPUTS: ProjectInputs = {
  plotAreaSqFt: 1000,
  floors: 2, // G+1
  builtUpSqFt: 2000,
  bathrooms: 3,
  kitchens: 1,
  doorsCount: 10,
  qualityTier: "PREMIUM",
  wallType: "RED_BRICK",
  lucknowZone: "Sushant Golf City",
};

/**
 * Computes default bathrooms, kitchens, doors from floor count
 */
export function computeAutoRoomCounts(floors: number) {
  return {
    bathrooms: Math.max(1, floors * 1 + 1), // 1 floor = 2, 2 floors = 3, 3 floors = 4
    kitchens: Math.max(1, floors >= 3 ? 2 : 1),
    doorsCount: Math.max(4, floors * 4 + 2), // 1 floor = 6, 2 floors = 10, 3 floors = 14
  };
}

// ─────────────────────────────────────────────────────────────
// Civil Engineering BOQ Generator
// ─────────────────────────────────────────────────────────────

interface PlannedSpec {
  itemKey: string;
  stageId: number;
  categorySlug: string;
  categoryName: string;
  titlePattern: string;
  preferredBrands: {
    STANDARD: string[];
    PREMIUM: string[];
    LUXURY: string[];
  };
  computeQty: (inputs: ProjectInputs) => number;
  unit: string;
  gstPercent: number;
  vehicleType: "2W_BIKE" | "3W_ELECTRIC_LOADER" | "4W_PICKUP" | "HEAVY_TRUCK";
  vehicleLabel: string;
  civilNoteFn: (qty: number, inputs: ProjectInputs) => string;
  wastagePercent?: number;
  condition?: (inputs: ProjectInputs) => boolean;
  fallbackPrice: {
    STANDARD: number;
    PREMIUM: number;
    LUXURY: number;
  };
}

const PLANNED_CATALOG_SPECS: PlannedSpec[] = [
  // ══════════════════════════════════════════════════════════════
  // STAGE 1: Foundation, RCC & Masonry
  // ══════════════════════════════════════════════════════════════
  {
    itemKey: "structural-cement",
    stageId: 1,
    categorySlug: "cement-civil-works",
    categoryName: "Cement & Structural Works",
    titlePattern: "Cement",
    preferredBrands: {
      STANDARD: ["Adani", "ACC", "Maha", "Priya"],
      PREMIUM: ["UltraTech", "BuildMore"],
      LUXURY: ["UltraTech", "Weather Plus", "Super OPC"],
    },
    computeQty: (inp) => Math.ceil(inp.builtUpSqFt * 0.44), // 0.44 bags / sq ft
    unit: "50 kg Bag",
    gstPercent: 18,
    vehicleType: "HEAVY_TRUCK",
    vehicleLabel: "Truck Delivery (50-Bag Pallet)",
    civilNoteFn: (qty, inp) => `0.44 bags/sq ft • ${qty} bags for ${inp.builtUpSqFt} sq ft built-up`,
    fallbackPrice: { STANDARD: 370, PREMIUM: 410, LUXURY: 450 },
  },
  {
    itemKey: "structural-steel",
    stageId: 1,
    categorySlug: "cement-civil-works",
    categoryName: "TMT Steel Sariya (Fe550D)",
    titlePattern: "TMT",
    preferredBrands: {
      STANDARD: ["Rathi", "Kamdhenu"],
      PREMIUM: ["Tata Tiscon", "Jindal"],
      LUXURY: ["Tata Tiscon Superlinks", "Tata Tiscon"],
    },
    computeQty: (inp) => Math.ceil(inp.builtUpSqFt * 4.0), // 4 kg/sq ft = 8,000 kg for 2000 sq ft
    unit: "Kg",
    gstPercent: 18,
    vehicleType: "HEAVY_TRUCK",
    vehicleLabel: "Heavy Truck • 12m Bundles",
    civilNoteFn: (qty, inp) => `4.0 kg/sq ft • ${(qty / 1000).toFixed(1)} MT Fe550D High-Bond Ribbed TMT`,
    fallbackPrice: { STANDARD: 54, PREMIUM: 64, LUXURY: 68 },
  },
  {
    itemKey: "morang-sand",
    stageId: 1,
    categorySlug: "bricks-sand-gitti-aac",
    categoryName: "Banda Coarse Morang Sand",
    titlePattern: "Morang",
    preferredBrands: {
      STANDARD: ["Banda"],
      PREMIUM: ["Banda Coarse River Sand"],
      LUXURY: ["Banda Triple Washed Coarse"],
    },
    computeQty: (inp) => Math.ceil(inp.builtUpSqFt * 1.8), // 1.8 CFT / sq ft
    unit: "CFT",
    gstPercent: 5,
    vehicleType: "HEAVY_TRUCK",
    vehicleLabel: "Trolley Delivery (100 CFT)",
    civilNoteFn: (qty, inp) => `1.8 CFT/sq ft • ${Math.ceil(qty / 100)} Lucknow Trolleys (${qty} CFT total)`,
    fallbackPrice: { STANDARD: 65, PREMIUM: 68, LUXURY: 72 },
  },
  {
    itemKey: "kali-gitti",
    stageId: 1,
    categorySlug: "bricks-sand-gitti-aac",
    categoryName: "Kabrai 20mm Blue Granite Gitti",
    titlePattern: "Gitti",
    preferredBrands: {
      STANDARD: ["Kabrai"],
      PREMIUM: ["Kabrai 20mm Kali Gitti"],
      LUXURY: ["Kabrai Blue Granite Aggregate"],
    },
    computeQty: (inp) => Math.ceil(inp.builtUpSqFt * 1.35), // 1.35 CFT / sq ft
    unit: "CFT",
    gstPercent: 5,
    vehicleType: "HEAVY_TRUCK",
    vehicleLabel: "Trolley Delivery (100 CFT)",
    civilNoteFn: (qty, inp) => `1.35 CFT/sq ft • ${Math.ceil(qty / 100)} Lucknow Trolleys (${qty} CFT total)`,
    fallbackPrice: { STANDARD: 55, PREMIUM: 58, LUXURY: 62 },
  },
  {
    itemKey: "wall-red-bricks",
    stageId: 1,
    categorySlug: "bricks-sand-gitti-aac",
    categoryName: "Avval Red Clay Kiln Bricks",
    titlePattern: "Brick",
    condition: (inp) => inp.wallType === "RED_BRICK",
    preferredBrands: {
      STANDARD: ["Avval Red Clay"],
      PREMIUM: ["Avval Machine Cut Kiln Bricks"],
      LUXURY: ["Avval Wire Cut High Strength"],
    },
    computeQty: (inp) => Math.ceil(inp.builtUpSqFt * 8.5), // 8.5 bricks / sq ft
    unit: "Piece",
    gstPercent: 12,
    vehicleType: "HEAVY_TRUCK",
    vehicleLabel: "Heavy Dumper Delivery",
    civilNoteFn: (qty, inp) => `8.5 pcs/sq ft • ${qty.toLocaleString("en-IN")} Kiln Bricks for full masonry`,
    fallbackPrice: { STANDARD: 7.2, PREMIUM: 7.8, LUXURY: 8.5 },
  },
  {
    itemKey: "wall-aac-blocks",
    stageId: 1,
    categorySlug: "bricks-sand-gitti-aac",
    categoryName: "AAC Lightweight Blocks (600x200x150mm)",
    titlePattern: "AAC",
    condition: (inp) => inp.wallType === "AAC_BLOCK",
    preferredBrands: {
      STANDARD: ["Magicrete", "Birla"],
      PREMIUM: ["Magicrete Pro", "Birla Aerocon"],
      LUXURY: ["Magicrete 6 Inch High Strength"],
    },
    computeQty: (inp) => Math.ceil(inp.builtUpSqFt * 0.32), // ~640 blocks for 2000 sq ft
    unit: "Block",
    gstPercent: 12,
    vehicleType: "HEAVY_TRUCK",
    vehicleLabel: "Palletized Truck Delivery",
    civilNoteFn: (qty, inp) => `Thermal insulated block masonry • ${qty} Blocks + 30% mortar savings`,
    fallbackPrice: { STANDARD: 65, PREMIUM: 72, LUXURY: 78 },
  },
  {
    itemKey: "waterproofing-integral",
    stageId: 1,
    categorySlug: "waterproofing-repairing",
    categoryName: "Integral Waterproofing Compound",
    titlePattern: "LW+",
    preferredBrands: {
      STANDARD: ["Dr. Fixit"],
      PREMIUM: ["Dr. Fixit LW+"],
      LUXURY: ["Dr. Fixit LW+ Super"],
    },
    computeQty: (inp) => Math.max(1, Math.ceil((inp.builtUpSqFt * 0.44 * 0.2) / 20)), // 20L can = 100 bags
    unit: "20L Can",
    gstPercent: 18,
    vehicleType: "4W_PICKUP",
    vehicleLabel: "Pickup Truck Delivery",
    civilNoteFn: (qty, inp) => `200ml / cement bag • Protects foundation & RCC slabs against dampness`,
    fallbackPrice: { STANDARD: 2850, PREMIUM: 3050, LUXURY: 3350 },
  },

  // ══════════════════════════════════════════════════════════════
  // STAGE 2: Concealed Plumbing & Electrical Rough-In
  // ══════════════════════════════════════════════════════════════
  {
    itemKey: "cpvc-water-pipes",
    stageId: 2,
    categorySlug: "cpvc-plumbing-tanks",
    categoryName: "Concealed CPVC Flowguard Plus Pipes (1\" & 3/4\")",
    titlePattern: "CPVC",
    preferredBrands: {
      STANDARD: ["Supreme"],
      PREMIUM: ["Ashirvad"],
      LUXURY: ["Astral"],
    },
    computeQty: (inp) => Math.ceil((inp.builtUpSqFt * 1.2) / 10), // 10ft lengths
    unit: "Length (10ft)",
    gstPercent: 18,
    vehicleType: "4W_PICKUP",
    vehicleLabel: "Pickup Delivery (Bundled)",
    civilNoteFn: (qty) => `1.2 ft / sq ft • SDR 11 Class 1 High-Pressure Hot & Cold Water Distribution`,
    fallbackPrice: { STANDARD: 240, PREMIUM: 295, LUXURY: 345 },
  },
  {
    itemKey: "swr-drainage-pipes",
    stageId: 2,
    categorySlug: "cpvc-plumbing-tanks",
    categoryName: "SWR Soil & Waste Drainage Pipes (75mm & 110mm)",
    titlePattern: "SWR",
    preferredBrands: {
      STANDARD: ["Supreme"],
      PREMIUM: ["Ashirvad"],
      LUXURY: ["Astral"],
    },
    computeQty: (inp) => Math.ceil((inp.builtUpSqFt * 0.6) / 10),
    unit: "Length (10ft)",
    gstPercent: 18,
    vehicleType: "4W_PICKUP",
    vehicleLabel: "Pickup Delivery",
    civilNoteFn: (qty) => `Rubber ring seal leak-proof soil stack & rainwater drainage pipes`,
    fallbackPrice: { STANDARD: 480, PREMIUM: 560, LUXURY: 680 },
  },
  {
    itemKey: "overhead-water-tank",
    stageId: 2,
    categorySlug: "cpvc-plumbing-tanks",
    categoryName: "Overhead Water Storage Tank (Triple Layer)",
    titlePattern: "Tank",
    preferredBrands: {
      STANDARD: ["Sintex"],
      PREMIUM: ["Ashirvad"],
      LUXURY: ["Astral"],
    },
    computeQty: (inp) => (inp.floors >= 3 ? 2 : 1),
    unit: "1000L Unit",
    gstPercent: 18,
    vehicleType: "3W_ELECTRIC_LOADER",
    vehicleLabel: "E-Loader Cargo Delivery",
    civilNoteFn: (qty) => `${qty * 1000}L total food-grade anti-bacterial rooftop water storage`,
    fallbackPrice: { STANDARD: 5800, PREMIUM: 6800, LUXURY: 8200 },
  },
  {
    itemKey: "copper-fr-wires-1sqmm",
    stageId: 2,
    categorySlug: "wires-mcb-electrical",
    categoryName: "1.0 sq mm FR Copper Wire Coils (Lighting Circuits)",
    titlePattern: "1.0",
    preferredBrands: {
      STANDARD: ["Anchor"],
      PREMIUM: ["Havells"],
      LUXURY: ["Polycab", "Finolex"],
    },
    computeQty: (inp) => Math.max(2, Math.ceil((inp.builtUpSqFt * 0.25) / 90)),
    unit: "90m Coil",
    gstPercent: 18,
    vehicleType: "2W_BIKE",
    vehicleLabel: "60-Min 2-Wheeler Delivery",
    civilNoteFn: (qty) => `Flame retardant 100% electrolytic pure copper wire for ceiling & wall lights`,
    fallbackPrice: { STANDARD: 1250, PREMIUM: 1450, LUXURY: 1680 },
  },
  {
    itemKey: "copper-fr-wires-2-5sqmm",
    stageId: 2,
    categorySlug: "wires-mcb-electrical",
    categoryName: "2.5 sq mm FR Wire Coils (16A Power & Kitchen)",
    titlePattern: "2.5",
    preferredBrands: {
      STANDARD: ["Anchor"],
      PREMIUM: ["Havells"],
      LUXURY: ["Polycab", "Finolex"],
    },
    computeQty: (inp) => Math.max(2, Math.ceil((inp.builtUpSqFt * 0.3) / 90)),
    unit: "90m Coil",
    gstPercent: 18,
    vehicleType: "2W_BIKE",
    vehicleLabel: "60-Min 2-Wheeler Delivery",
    civilNoteFn: (qty) => `Heavy load circuits: Microwave, geysers, refrigerators & power plugs`,
    fallbackPrice: { STANDARD: 2850, PREMIUM: 3250, LUXURY: 3650 },
  },
  {
    itemKey: "pvc-conduit-pipes",
    stageId: 2,
    categorySlug: "wires-mcb-electrical",
    categoryName: "25mm Heavy Duty PVC Electrical Conduits",
    titlePattern: "Conduit",
    preferredBrands: {
      STANDARD: ["Anchor"],
      PREMIUM: ["Havells"],
      LUXURY: ["Polycab"],
    },
    computeQty: (inp) => Math.ceil((inp.builtUpSqFt * 0.75) / 10),
    unit: "Length (10ft)",
    gstPercent: 18,
    vehicleType: "4W_PICKUP",
    vehicleLabel: "Pickup Delivery",
    civilNoteFn: (qty) => `High impact resistance concealed wall & slab electrical pipe network`,
    fallbackPrice: { STANDARD: 65, PREMIUM: 82, LUXURY: 98 },
  },
  {
    itemKey: "mcb-db-box",
    stageId: 2,
    categorySlug: "wires-mcb-electrical",
    categoryName: "Main Distribution Board (SPN 8-Way) + 40A RCCB",
    titlePattern: "DB",
    preferredBrands: {
      STANDARD: ["Anchor"],
      PREMIUM: ["Havells"],
      LUXURY: ["Legrand", "Schneider"],
    },
    computeQty: (inp) => inp.floors,
    unit: "Set",
    gstPercent: 18,
    vehicleType: "2W_BIKE",
    vehicleLabel: "60-Min 2-Wheeler Delivery",
    civilNoteFn: (qty) => `1 DB per floor • 30mA electric shock & earth leakage protection`,
    fallbackPrice: { STANDARD: 2200, PREMIUM: 3100, LUXURY: 4400 },
  },
  {
    itemKey: "cctv-cat6-cable",
    stageId: 2,
    categorySlug: "cctv-networking",
    categoryName: "CAT6 Pure Copper UTP Surveillance Coils",
    titlePattern: "CAT6",
    preferredBrands: {
      STANDARD: ["CP Plus"],
      PREMIUM: ["CP Plus", "D-Link"],
      LUXURY: ["D-Link", "Schneider"],
    },
    computeQty: () => 1,
    unit: "305m Drum",
    gstPercent: 18,
    vehicleType: "3W_ELECTRIC_LOADER",
    vehicleLabel: "E-Loader Delivery",
    civilNoteFn: () => `High-speed Gigabit data & IP CCTV concealed video wiring`,
    fallbackPrice: { STANDARD: 4800, PREMIUM: 5600, LUXURY: 6800 },
  },

  // ══════════════════════════════════════════════════════════════
  // STAGE 3: Plaster, Waterproofing & Flooring
  // ══════════════════════════════════════════════════════════════
  {
    itemKey: "floor-vitrified-tiles",
    stageId: 3,
    categorySlug: "tile-stone-installation",
    categoryName: "Living & Bedroom Double Charged Vitrified Tiles",
    titlePattern: "Tile",
    preferredBrands: {
      STANDARD: ["Orient Bell"],
      PREMIUM: ["Kajaria"],
      LUXURY: ["Nitco", "Italian"],
    },
    computeQty: (inp) => Math.ceil(inp.builtUpSqFt * 0.85 * 1.1), // 10% cutting wastage
    unit: "Sq Ft",
    gstPercent: 18,
    vehicleType: "HEAVY_TRUCK",
    vehicleLabel: "Heavy Truck • Single Batch Pallet",
    wastagePercent: 10,
    civilNoteFn: (qty, inp) => `Includes +10% cutting wastage • Single dye-lot batch match guaranteed`,
    fallbackPrice: { STANDARD: 45, PREMIUM: 68, LUXURY: 120 },
  },
  {
    itemKey: "bath-wall-tiles",
    stageId: 3,
    categorySlug: "tile-stone-installation",
    categoryName: "Bathroom Ceramic Wall Concept Tiles (Up to 7ft)",
    titlePattern: "Wall Tile",
    preferredBrands: {
      STANDARD: ["Orient Bell"],
      PREMIUM: ["Kajaria"],
      LUXURY: ["Kajaria", "Nitco"],
    },
    computeQty: (inp) => Math.ceil(inp.bathrooms * 200 * 1.1),
    unit: "Sq Ft",
    gstPercent: 18,
    vehicleType: "HEAVY_TRUCK",
    vehicleLabel: "Truck Delivery",
    wastagePercent: 10,
    civilNoteFn: (qty, inp) => `200 sq ft per bathroom • Gloss/matt anti-stain water-resistant glazed tiles`,
    fallbackPrice: { STANDARD: 38, PREMIUM: 52, LUXURY: 75 },
  },
  {
    itemKey: "tile-adhesive",
    stageId: 3,
    categorySlug: "tile-stone-installation",
    categoryName: "Polymer Modified Tile Adhesive (Grey C1/C2)",
    titlePattern: "Adhesive",
    preferredBrands: {
      STANDARD: ["Generic"],
      PREMIUM: ["Roff"],
      LUXURY: ["Roff", "Pidilite"],
    },
    computeQty: (inp) => {
      const totalTiles = Math.ceil(inp.builtUpSqFt * 0.85 * 1.1) + Math.ceil(inp.bathrooms * 200 * 1.1);
      return Math.max(5, Math.ceil(totalTiles / 38)); // 1 bag (20kg) per 38 sq ft
    },
    unit: "20kg Bag",
    gstPercent: 18,
    vehicleType: "4W_PICKUP",
    vehicleLabel: "Pickup Truck Delivery",
    civilNoteFn: (qty) => `1 bag / 38 sq ft • Zero hollow-sound bonding for vitrified tiles`,
    fallbackPrice: { STANDARD: 280, PREMIUM: 360, LUXURY: 450 },
  },
  {
    itemKey: "tile-epoxy-grout",
    stageId: 3,
    categorySlug: "tile-stone-installation",
    categoryName: "Stain-Free Epoxy Grout + Tile Spacers",
    titlePattern: "Grout",
    preferredBrands: {
      STANDARD: ["Generic"],
      PREMIUM: ["Roff"],
      LUXURY: ["Roff"],
    },
    computeQty: (inp) => Math.max(2, Math.ceil(inp.builtUpSqFt / 400)),
    unit: "5kg Kit",
    gstPercent: 18,
    vehicleType: "2W_BIKE",
    vehicleLabel: "60-Min 2-Wheeler Delivery",
    civilNoteFn: () => `Anti-fungal, zero-shrinkage joint filler for wet areas & living rooms`,
    fallbackPrice: { STANDARD: 650, PREMIUM: 850, LUXURY: 1100 },
  },
  {
    itemKey: "granite-countertop",
    stageId: 3,
    categorySlug: "tile-stone-installation",
    categoryName: "Polished Granite Slabs (Kitchen & Window Sills)",
    titlePattern: "Granite",
    preferredBrands: {
      STANDARD: ["Tan Brown"],
      PREMIUM: ["Black Galaxy"],
      LUXURY: ["Black Galaxy Mirror", "Italian"],
    },
    computeQty: (inp) => Math.ceil(inp.kitchens * 80 + inp.bathrooms * 15 + inp.floors * 30),
    unit: "Sq Ft",
    gstPercent: 18,
    vehicleType: "4W_PICKUP",
    vehicleLabel: "A-Frame Pickup Delivery",
    civilNoteFn: (qty) => `Scratch & heat resistant mirror-polished kitchen platform & door threshold`,
    fallbackPrice: { STANDARD: 125, PREMIUM: 185, LUXURY: 260 },
  },

  // ══════════════════════════════════════════════════════════════
  // STAGE 4: Doors, Woodwork & Modular Kitchen
  // ══════════════════════════════════════════════════════════════
  {
    itemKey: "flush-doors",
    stageId: 4,
    categorySlug: "plywood-boards",
    categoryName: "BWP 32mm Calibrated Flush Doors (Pine/Hardwood)",
    titlePattern: "Door",
    preferredBrands: {
      STANDARD: ["Commercial"],
      PREMIUM: ["Greenply", "Austin"],
      LUXURY: ["CenturyPly"],
    },
    computeQty: (inp) => inp.doorsCount,
    unit: "Door Shutter",
    gstPercent: 18,
    vehicleType: "4W_PICKUP",
    vehicleLabel: "Pickup Truck Delivery",
    civilNoteFn: (qty) => `32mm boil water proof solid core door shutters with preservative treatment`,
    fallbackPrice: { STANDARD: 2200, PREMIUM: 3200, LUXURY: 4500 },
  },
  {
    itemKey: "bwp-plywood-19mm",
    stageId: 4,
    categorySlug: "plywood-boards",
    categoryName: "19mm BWP 710 Calibrated Plywood (Wardrobes & Cabinets)",
    titlePattern: "19mm",
    preferredBrands: {
      STANDARD: ["Commercial"],
      PREMIUM: ["Greenply", "Austin"],
      LUXURY: ["CenturyPly Club Prime"],
    },
    computeQty: (inp) => Math.max(4, Math.ceil((inp.builtUpSqFt * 0.08) / 32)), // 8x4 sheets
    unit: "Sheet (8x4 ft)",
    gstPercent: 18,
    vehicleType: "4W_PICKUP",
    vehicleLabel: "Pickup Truck Delivery",
    civilNoteFn: (qty) => `IS:710 Marine grade borer & termite proof calibrated furniture carcass ply`,
    fallbackPrice: { STANDARD: 1650, PREMIUM: 2350, LUXURY: 3100 },
  },
  {
    itemKey: "fevicol-adhesive",
    stageId: 4,
    categorySlug: "fevicol-adhesives-sealants",
    categoryName: "Fevicol Wood Adhesive (SH / Marine / HeatX)",
    titlePattern: "Fevicol",
    preferredBrands: {
      STANDARD: ["Fevicol SH"],
      PREMIUM: ["Fevicol Marine"],
      LUXURY: ["Fevicol HeatX"],
    },
    computeQty: (inp) => Math.max(2, Math.ceil((inp.builtUpSqFt * 0.08) / 38)), // 1 kg / 38 sq ft
    unit: "5kg Bucket",
    gstPercent: 18,
    vehicleType: "2W_BIKE",
    vehicleLabel: "60-Min 2-Wheeler Delivery",
    civilNoteFn: (qty) => `High shear strength waterproofing synthetic resin adhesive`,
    fallbackPrice: { STANDARD: 1250, PREMIUM: 1550, LUXURY: 1950 },
  },
  {
    itemKey: "modular-kitchen-tandem",
    stageId: 4,
    categorySlug: "modular-kitchen-systems",
    categoryName: "Modular Kitchen Tandem Boxes (Cutlery/Plain/Thali)",
    titlePattern: "Tandem",
    preferredBrands: {
      STANDARD: ["Ebco"],
      PREMIUM: ["Ebco Pro Motion"],
      LUXURY: ["Hettich InnoTech"],
    },
    computeQty: (inp) => inp.kitchens * 3, // 3 drawers per kitchen
    unit: "Set",
    gstPercent: 18,
    vehicleType: "3W_ELECTRIC_LOADER",
    vehicleLabel: "E-Loader Delivery",
    civilNoteFn: (qty) => `50kg dynamic load capacity soft-close silent undermount drawer systems`,
    fallbackPrice: { STANDARD: 1850, PREMIUM: 2450, LUXURY: 3450 },
  },
  {
    itemKey: "ss304-hydraulic-hinges",
    stageId: 4,
    categorySlug: "furniture-wardrobe-bed-hardware",
    categoryName: "SS 304 Soft-Close Hydraulic Concealed Hinges",
    titlePattern: "Hinge",
    preferredBrands: {
      STANDARD: ["Ebco"],
      PREMIUM: ["Ebco", "Hettich"],
      LUXURY: ["Hettich Onsys"],
    },
    computeQty: (inp) => inp.doorsCount * 3 + Math.ceil(inp.builtUpSqFt * 0.02),
    unit: "Pair",
    gstPercent: 18,
    vehicleType: "2W_BIKE",
    vehicleLabel: "60-Min 2-Wheeler Delivery",
    civilNoteFn: (qty) => `Clip-on 3D adjustable rust-proof hydraulic soft-close hinges`,
    fallbackPrice: { STANDARD: 160, PREMIUM: 240, LUXURY: 360 },
  },
  {
    itemKey: "main-door-lock",
    stageId: 4,
    categorySlug: "door-hardware-locks",
    categoryName: "High-Security Main Entrance Smart / Mortise Lock",
    titlePattern: "Lock",
    preferredBrands: {
      STANDARD: ["Dorset"],
      PREMIUM: ["Godrej Smart"],
      LUXURY: ["Yale Biometric", "Godrej Smart"],
    },
    computeQty: () => 1,
    unit: "Set",
    gstPercent: 18,
    vehicleType: "2W_BIKE",
    vehicleLabel: "60-Min 2-Wheeler Delivery",
    civilNoteFn: () => `Anti-burglary multi-point locking mechanism with computerized keys / biometric`,
    fallbackPrice: { STANDARD: 2400, PREMIUM: 6800, LUXURY: 14500 },
  },
  {
    itemKey: "bedroom-mortise-handles",
    stageId: 4,
    categorySlug: "door-hardware-locks",
    categoryName: "SS Mortise Lever Handles & Cylinder Sets",
    titlePattern: "Handle",
    preferredBrands: {
      STANDARD: ["Dorset"],
      PREMIUM: ["Dorset", "Godrej"],
      LUXURY: ["Godrej", "Yale"],
    },
    computeQty: (inp) => Math.max(2, inp.doorsCount - 1),
    unit: "Set",
    gstPercent: 18,
    vehicleType: "2W_BIKE",
    vehicleLabel: "60-Min 2-Wheeler Delivery",
    civilNoteFn: (qty) => `${qty} premium ergonomics internal bedroom & hall door handle locksets`,
    fallbackPrice: { STANDARD: 950, PREMIUM: 1450, LUXURY: 2200 },
  },

  // ══════════════════════════════════════════════════════════════
  // STAGE 5: Putty, Primer & Painting
  // ══════════════════════════════════════════════════════════════
  {
    itemKey: "acrylic-wall-putty",
    stageId: 5,
    categorySlug: "painting",
    categoryName: "White Cement Acrylic Polymer Wall Putty",
    titlePattern: "Putty",
    preferredBrands: {
      STANDARD: ["Birla White"],
      PREMIUM: ["Birla White", "Asian Paints"],
      LUXURY: ["Birla White Pro", "Asian Paints TruCare"],
    },
    computeQty: (inp) => Math.max(2, Math.ceil((inp.builtUpSqFt * 3.2) / 13 / 40)), // 40kg bag covers ~520 sq ft
    unit: "40kg Bag",
    gstPercent: 18,
    vehicleType: "4W_PICKUP",
    vehicleLabel: "Pickup Truck Delivery",
    civilNoteFn: (qty) => `2-coat mirror finish base • 40kg bag covers ~520 sq ft with water resistance`,
    fallbackPrice: { STANDARD: 850, PREMIUM: 940, LUXURY: 1050 },
  },
  {
    itemKey: "acrylic-wall-primer",
    stageId: 5,
    categorySlug: "painting",
    categoryName: "Interior & Exterior Decoprime Wall Primer",
    titlePattern: "Primer",
    preferredBrands: {
      STANDARD: ["Asian Paints Decoprime"],
      PREMIUM: ["Asian Paints", "Berger"],
      LUXURY: ["Asian Paints Royale Primer"],
    },
    computeQty: (inp) => Math.max(1, Math.ceil((inp.builtUpSqFt * 3.2) / 130 / 20)), // 20L bucket
    unit: "20L Bucket",
    gstPercent: 18,
    vehicleType: "3W_ELECTRIC_LOADER",
    vehicleLabel: "E-Loader Delivery",
    civilNoteFn: (qty) => `Superior masonry adhesion primer • Seals pores and locks plaster efflorescence`,
    fallbackPrice: { STANDARD: 1950, PREMIUM: 2350, LUXURY: 2950 },
  },
  {
    itemKey: "interior-emulsion-paint",
    stageId: 5,
    categorySlug: "painting",
    categoryName: "Interior Smooth Luxury Emulsion Paint (2 Coats)",
    titlePattern: "Emulsion",
    preferredBrands: {
      STANDARD: ["Asian Paints Tractor", "Berger"],
      PREMIUM: ["Asian Paints Apcolite", "Asian Paints Royale"],
      LUXURY: ["Asian Paints Royale Aspira"],
    },
    computeQty: (inp) => Math.max(1, Math.ceil((inp.builtUpSqFt * 2.5) / 120 / 20)),
    unit: "20L Bucket",
    gstPercent: 18,
    vehicleType: "3W_ELECTRIC_LOADER",
    vehicleLabel: "E-Loader Delivery",
    civilNoteFn: (qty) => `Anti-bacterial, washable stain-resistant luxury interior finish with soft sheen`,
    fallbackPrice: { STANDARD: 3200, PREMIUM: 6800, LUXURY: 11500 },
  },
  {
    itemKey: "exterior-weatherproof-paint",
    stageId: 5,
    categorySlug: "painting",
    categoryName: "Exterior All-Weather Rain & Sun Protection Paint",
    titlePattern: "Apex",
    preferredBrands: {
      STANDARD: ["Asian Paints Apex"],
      PREMIUM: ["Asian Paints Apex Ultima"],
      LUXURY: ["Asian Paints Ultima Protek"],
    },
    computeQty: (inp) => Math.max(1, Math.ceil((inp.builtUpSqFt * 0.7) / 110 / 20)),
    unit: "20L Bucket",
    gstPercent: 18,
    vehicleType: "3W_ELECTRIC_LOADER",
    vehicleLabel: "E-Loader Delivery",
    civilNoteFn: () => `Algae & fungal resistant exterior emulsion with UV-reflective warranty`,
    fallbackPrice: { STANDARD: 3900, PREMIUM: 5900, LUXURY: 8900 },
  },

  // ══════════════════════════════════════════════════════════════
  // STAGE 6: Sanitary, Sinks, Appliances & CCTV Handover
  // ══════════════════════════════════════════════════════════════
  {
    itemKey: "bathroom-wc-set",
    stageId: 6,
    categorySlug: "sanitary-bath-fittings",
    categoryName: "Water Closet (Rimless Wall-Hung / Floor Mount) + Cistern",
    titlePattern: "WC",
    preferredBrands: {
      STANDARD: ["Cera", "Hindware"],
      PREMIUM: ["Jaquar Kubix", "Jaquar Rimless"],
      LUXURY: ["Kohler Brazn", "Jaquar Artize"],
    },
    computeQty: (inp) => inp.bathrooms,
    unit: "Set",
    gstPercent: 18,
    vehicleType: "4W_PICKUP",
    vehicleLabel: "Pickup Delivery (Fragile Ceramic)",
    civilNoteFn: (qty) => `${qty} bathrooms complete • Rimless hygiene tornado flush with soft-close seat`,
    fallbackPrice: { STANDARD: 4800, PREMIUM: 9800, LUXURY: 21500 },
  },
  {
    itemKey: "bathroom-diverter-shower",
    stageId: 6,
    categorySlug: "sanitary-bath-fittings",
    categoryName: "Single-Lever Concealed Diverter & Overhead Rain Shower",
    titlePattern: "Diverter",
    preferredBrands: {
      STANDARD: ["Cera"],
      PREMIUM: ["Jaquar"],
      LUXURY: ["Kohler", "Jaquar"],
    },
    computeQty: (inp) => inp.bathrooms,
    unit: "Set",
    gstPercent: 18,
    vehicleType: "2W_BIKE",
    vehicleLabel: "60-Min 2-Wheeler Delivery",
    civilNoteFn: (qty) => `Solid forged brass cartridge with chrome/matt anti-corrosion plating`,
    fallbackPrice: { STANDARD: 3200, PREMIUM: 5400, LUXURY: 9800 },
  },
  {
    itemKey: "kitchen-sink",
    stageId: 6,
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sink (SS 304 Handmade / Quartz Composite)",
    titlePattern: "Sink",
    preferredBrands: {
      STANDARD: ["Nirali"],
      PREMIUM: ["Franke", "Carysil"],
      LUXURY: ["Carysil Quartz"],
    },
    computeQty: (inp) => inp.kitchens,
    unit: "Piece",
    gstPercent: 18,
    vehicleType: "3W_ELECTRIC_LOADER",
    vehicleLabel: "E-Loader Cargo Delivery",
    civilNoteFn: (qty) => `Sound-deadening pads, anti-scratch satin / quartz stone composite finish`,
    fallbackPrice: { STANDARD: 3200, PREMIUM: 6800, LUXURY: 13500 },
  },
  {
    itemKey: "kitchen-chimney",
    stageId: 6,
    categorySlug: "home-appliances",
    categoryName: "Modular Kitchen Auto-Clean Chimney (60cm / 90cm)",
    titlePattern: "Chimney",
    preferredBrands: {
      STANDARD: ["Elica"],
      PREMIUM: ["Faber 60cm"],
      LUXURY: ["Faber 90cm", "Faber Gesture"],
    },
    computeQty: (inp) => inp.kitchens,
    unit: "Appliance",
    gstPercent: 18,
    vehicleType: "3W_ELECTRIC_LOADER",
    vehicleLabel: "E-Loader Delivery",
    civilNoteFn: (qty) => `1200–1500 m³/hr filterless thermal auto-clean chimney with motion sensor`,
    fallbackPrice: { STANDARD: 9500, PREMIUM: 14800, LUXURY: 23500 },
  },
  {
    itemKey: "storage-geyser",
    stageId: 6,
    categorySlug: "home-appliances",
    categoryName: "15L / 25L 8-Bar High-Rise Vertical Storage Geyser",
    titlePattern: "Geyser",
    preferredBrands: {
      STANDARD: ["Bajaj", "Crompton"],
      PREMIUM: ["AO Smith 15L", "Racold"],
      LUXURY: ["AO Smith 25L", "Racold Wi-Fi"],
    },
    computeQty: (inp) => inp.bathrooms,
    unit: "Appliance",
    gstPercent: 18,
    vehicleType: "3W_ELECTRIC_LOADER",
    vehicleLabel: "E-Loader Delivery",
    civilNoteFn: (qty) => `8-Bar pressure rating suitable for multi-storey high-rise water pressure`,
    fallbackPrice: { STANDARD: 6200, PREMIUM: 9400, LUXURY: 14200 },
  },
  {
    itemKey: "home-inverter-battery",
    stageId: 6,
    categorySlug: "home-appliances",
    categoryName: "Pure Sine Wave Inverter + 150Ah–200Ah Tubular Battery",
    titlePattern: "Inverter",
    preferredBrands: {
      STANDARD: ["Luminous 900VA"],
      PREMIUM: ["Luminous", "Microtek 150Ah"],
      LUXURY: ["Luminous 1100VA", "Microtek 200Ah"],
    },
    computeQty: () => 1,
    unit: "Combo Set",
    gstPercent: 18,
    vehicleType: "4W_PICKUP",
    vehicleLabel: "Pickup Truck Delivery (Heavy Lead-Acid)",
    civilNoteFn: () => `Uninterrupted power backup for all lights, fans, Wi-Fi router & TV`,
    fallbackPrice: { STANDARD: 16500, PREMIUM: 21500, LUXURY: 28500 },
  },
  {
    itemKey: "cctv-surveillance-kit",
    stageId: 6,
    categorySlug: "cctv-networking",
    categoryName: "4-Ch / 8-Ch Full HD / IP CCTV Security System + 1TB HDD",
    titlePattern: "CCTV",
    preferredBrands: {
      STANDARD: ["CP Plus HD"],
      PREMIUM: ["CP Plus 3MP IP"],
      LUXURY: ["CP Plus 4MP AI PoE"],
    },
    computeQty: () => 1,
    unit: "Full Kit",
    gstPercent: 18,
    vehicleType: "2W_BIKE",
    vehicleLabel: "60-Min 2-Wheeler Delivery",
    civilNoteFn: () => `Infrared night vision, motion alert & live smartphone monitoring`,
    fallbackPrice: { STANDARD: 8500, PREMIUM: 13500, LUXURY: 22000 },
  },
];

export const STAGE_CONFIGS = [
  {
    stageId: 1,
    stageName: "Foundation, RCC & Masonry",
    shortName: "1. Structure",
    description: "Cement, TMT Steel, Banda Morang, Kabrai Gitti, Bricks/AAC Blocks & Waterproofing",
    iconName: "Pickaxe",
  },
  {
    stageId: 2,
    stageName: "Concealed Plumbing & Electrical Rough-In",
    shortName: "2. Rough-In",
    description: "CPVC & SWR Pipes, 1000L Overhead Tank, FR Wire Coils, Modular Boxes, DB & CAT6",
    iconName: "Zap",
  },
  {
    stageId: 3,
    stageName: "Plaster, Waterproofing & Flooring",
    shortName: "3. Flooring",
    description: "Vitrified Floor Tiles (+10% wastage), Wall Concept Tiles, Adhesive, Grout & Granite",
    iconName: "Layers",
  },
  {
    stageId: 4,
    stageName: "Doors, Woodwork & Modular Kitchen",
    shortName: "4. Woodwork",
    description: "Flush Doors, BWP Plywood, Fevicol, Tandem Boxes, SS Hinges & Smart Door Locks",
    iconName: "Building2",
  },
  {
    stageId: 5,
    stageName: "Putty, Primer & Painting",
    shortName: "5. Painting",
    description: "White Cement Putty (2 coats), Primer, Luxury Washable Emulsion & Exterior Protek",
    iconName: "Paintbrush",
  },
  {
    stageId: 6,
    stageName: "Sanitary, Sinks, Appliances & CCTV Handover",
    shortName: "6. Handover",
    description: "Rimless WCs, Quartz Sinks, Auto-Clean Chimneys, 8-Bar Geysers, Inverter & CCTV",
    iconName: "CheckCircle2",
  },
];

/**
 * Main Civil Engine calculation function: maps planned specifications to real SKUs from /api/catalog/live
 */
export function generateProjectBOQ(
  inputs: ProjectInputs,
  liveCatalog: MasterCatalogSKU[] = []
): FullProjectEstimate {
  // Pre-index live catalog items by category and name for lightning fast matching
  const catalogByCategory = new Map<string, MasterCatalogSKU[]>();
  for (const sku of liveCatalog) {
    const list = catalogByCategory.get(sku.category) || [];
    list.push(sku);
    catalogByCategory.set(sku.category, list);
  }

  const stagesMap = new Map<number, BOQLineItem[]>();
  for (let s = 1; s <= 6; s++) {
    stagesMap.set(s, []);
  }

  for (const spec of PLANNED_CATALOG_SPECS) {
    if (spec.condition && !spec.condition(inputs)) {
      continue;
    }

    const qty = spec.computeQty(inputs);
    if (qty <= 0) continue;

    // Try finding matching SKU in live catalog
    const categorySkus = catalogByCategory.get(spec.categorySlug) || liveCatalog;
    const targetBrands = spec.preferredBrands[inputs.qualityTier] || [];

    let matchedSku: MasterCatalogSKU | undefined;

    // Priority 1: Match by brand AND title keyword
    for (const b of targetBrands) {
      matchedSku = categorySkus.find(
        (s) =>
          s.brand.toLowerCase().includes(b.toLowerCase()) &&
          (s.name.toLowerCase().includes(spec.titlePattern.toLowerCase()) ||
            s.subcategory?.toLowerCase().includes(spec.titlePattern.toLowerCase()))
      );
      if (matchedSku) break;
    }

    // Priority 2: Match by brand only within category
    if (!matchedSku) {
      for (const b of targetBrands) {
        matchedSku = categorySkus.find((s) => s.brand.toLowerCase().includes(b.toLowerCase()));
        if (matchedSku) break;
      }
    }

    // Priority 3: Match by title pattern within category
    if (!matchedSku) {
      matchedSku = categorySkus.find((s) =>
        s.name.toLowerCase().includes(spec.titlePattern.toLowerCase())
      );
    }

    // Fallback values if catalog item is loading
    const sellingPrice = matchedSku ? matchedSku.sellingPrice : spec.fallbackPrice[inputs.qualityTier];
    const unit = matchedSku ? matchedSku.unit : spec.unit;
    const gstPercent = matchedSku ? matchedSku.gstPercent : spec.gstPercent;
    const deliveryVehicleType = matchedSku ? matchedSku.deliveryVehicleType : spec.vehicleType;
    const thumbnail = matchedSku?.imageUrl || `/images/categories/${spec.categorySlug}.webp`;
    const brand = matchedSku?.brand || targetBrands[0] || "CONON Verified";
    const title = matchedSku?.name || spec.categoryName;
    const specLabel = matchedSku?.subcategory || spec.categoryName;

    const lineTotal = Math.round(sellingPrice * qty);
    const preGstBase = Math.round(lineTotal / (1 + gstPercent / 100));

    const lineItem: BOQLineItem = {
      id: matchedSku ? matchedSku.id : `planned-${spec.itemKey}-${inputs.qualityTier}`,
      stageId: spec.stageId,
      categorySlug: spec.categorySlug,
      categoryName: spec.categoryName,
      itemKey: spec.itemKey,
      title,
      spec: specLabel,
      brand,
      quantity: qty,
      unit,
      sellingPrice,
      gstPercent,
      preGstBase,
      lineTotal,
      deliveryVehicleType,
      vehicleLabel: spec.vehicleLabel,
      thumbnail,
      civilNote: spec.civilNoteFn(qty, inputs),
      wastagePercent: spec.wastagePercent,
      selected: true,
      matchedSkuId: matchedSku?.id,
      tier: inputs.qualityTier,
    };

    stagesMap.get(spec.stageId)!.push(lineItem);
  }

  // Aggregate Stage Summaries
  const stages: StageBOQSummary[] = STAGE_CONFIGS.map((cfg) => {
    const items = stagesMap.get(cfg.stageId) || [];
    const subtotal = items.reduce((sum, it) => sum + (it.selected ? it.lineTotal : 0), 0);
    const preGstTotal = items.reduce((sum, it) => sum + (it.selected ? it.preGstBase : 0), 0);
    const gstTotal = subtotal - preGstTotal;

    const vehicleCounts: Record<string, number> = {
      "2W_BIKE": 0,
      "3W_ELECTRIC_LOADER": 0,
      "4W_PICKUP": 0,
      HEAVY_TRUCK: 0,
    };

    for (const it of items) {
      if (it.selected) {
        vehicleCounts[it.deliveryVehicleType] = (vehicleCounts[it.deliveryVehicleType] || 0) + 1;
      }
    }

    return {
      stageId: cfg.stageId,
      stageName: cfg.stageName,
      shortName: cfg.shortName,
      description: cfg.description,
      iconName: cfg.iconName,
      items,
      subtotal,
      preGstTotal,
      gstTotal,
      itemCount: items.length,
      vehicleCounts,
    };
  });

  const grandTotal = stages.reduce((s, st) => s + st.subtotal, 0);
  const grandPreGst = stages.reduce((s, st) => s + st.preGstTotal, 0);
  const grandGst = grandTotal - grandPreGst;
  const costPerSqFt = inputs.builtUpSqFt > 0 ? Math.round(grandTotal / inputs.builtUpSqFt) : 0;
  const totalItemsCount = stages.reduce((s, st) => s + st.items.length, 0);

  const vehicleSummary = {
    bike: stages.reduce((s, st) => s + (st.vehicleCounts["2W_BIKE"] || 0), 0),
    eLoader: stages.reduce((s, st) => s + (st.vehicleCounts["3W_ELECTRIC_LOADER"] || 0), 0),
    pickup: stages.reduce((s, st) => s + (st.vehicleCounts["4W_PICKUP"] || 0), 0),
    truckOrTrolley: stages.reduce((s, st) => s + (st.vehicleCounts["HEAVY_TRUCK"] || 0), 0),
  };

  return {
    inputs,
    stages,
    grandTotal,
    grandPreGst,
    grandGst,
    costPerSqFt,
    totalItemsCount,
    vehicleSummary,
  };
}
