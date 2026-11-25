import fs from "fs";
import path from "path";
import { getIo } from "../socket";
import { catalogEngine } from "./catalogEngine";
import { logger } from "../lib/logger";

export interface VendorHubProduct {
  id: string;
  hubId: string;
  categorySlug: string;
  categoryName: string;
  skuCode: string;
  name: string;
  brand: string;
  unit: string;
  dealerPrice: number;
  mrp: number;
  sellingPrice: number;
  imageUrl: string;
  customImage?: string | null;
  inStock: boolean;
  stockQty: number;
  isCustom?: boolean;
  updatedAt: string;
}

export interface VendorCategorySummary {
  slug: string;
  name: string;
  iconName: string;
  enabled: boolean;
  totalItems: number;
  inStockCount: number;
}

export const VENDOR_16_CATEGORIES: Array<{
  slug: string;
  name: string;
  iconName: string;
  defaultItems: Array<{
    id: string;
    skuCode: string;
    name: string;
    brand: string;
    unit: string;
    dealerPrice: number;
    mrp: number;
    sellingPrice: number;
    imageUrl: string;
    inStock: boolean;
    stockQty: number;
  }>;
}> = [
  {
    slug: "cctv-networking",
    name: "CCTV & Networking",
    iconName: "Camera",
    defaultItems: [
      {
        id: "cctv-cp-plus-2mp-dome",
        skuCode: "CPP-DOM-2MP",
        name: "CP Plus 2MP Full HD IR Dome Camera (CP-VAC-D24L2)",
        brand: "CP Plus",
        unit: "Piece",
        dealerPrice: 1150,
        mrp: 1850,
        sellingPrice: 1450,
        imageUrl: "/images/products/cctv/cp-plus-2mp-dome.webp",
        inStock: true,
        stockQty: 45,
      },
      {
        id: "cctv-hikvision-4ch-dvr",
        skuCode: "HIK-DVR-4CH",
        name: "Hikvision 4-Channel Turbo HD DVR (DS-7104HGHI-F1)",
        brand: "Hikvision",
        unit: "Unit",
        dealerPrice: 2450,
        mrp: 3600,
        sellingPrice: 2999,
        imageUrl: "/images/products/cctv/hikvision-4ch-dvr.webp",
        inStock: true,
        stockQty: 20,
      },
      {
        id: "cctv-dlink-cat6-cable-305m",
        skuCode: "DLK-CAT6-305",
        name: "D-Link Cat6 UTP Solid Pure Copper Cable (305m Box)",
        brand: "D-Link",
        unit: "Box (305m)",
        dealerPrice: 6200,
        mrp: 8500,
        sellingPrice: 7100,
        imageUrl: "/images/products/cctv/dlink-cat6-box.webp",
        inStock: true,
        stockQty: 15,
      },
    ],
  },
  {
    slug: "cpvc-plumbing-tanks",
    name: "CPVC Plumbing & Overhead Tanks",
    iconName: "Droplet",
    defaultItems: [
      {
        id: "plumb-astral-cpvc-1in",
        skuCode: "AST-CPVC-1IN",
        name: "Astral CPVC Pro Pipe 1 Inch SDR 11 Class 1 (3m)",
        brand: "Astral",
        unit: "3m Length",
        dealerPrice: 420,
        mrp: 530,
        sellingPrice: 480,
        imageUrl: "/images/products/plumbing/astral-cpvc-pro-pipe-1inch.webp",
        inStock: true,
        stockQty: 180,
      },
      {
        id: "plumb-sintex-tank-1000l",
        skuCode: "SNT-TNK-1000",
        name: "Sintex 1000L Triple Layer Anti-Bacterial Water Tank",
        brand: "Sintex",
        unit: "Piece",
        dealerPrice: 5800,
        mrp: 7600,
        sellingPrice: 6650,
        imageUrl: "/images/products/plumbing/sintex-1000l-tank.webp",
        inStock: true,
        stockQty: 8,
      },
      {
        id: "plumb-ashirvad-brass-elbow-1in",
        skuCode: "ASH-ELB-1IN",
        name: "Ashirvad CPVC Brass Female Threaded Elbow 1 Inch",
        brand: "Ashirvad",
        unit: "Piece",
        dealerPrice: 110,
        mrp: 165,
        sellingPrice: 135,
        imageUrl: "/images/products/plumbing/ashirvad-brass-elbow.webp",
        inStock: true,
        stockQty: 350,
      },
    ],
  },
  {
    slug: "cement-civil-works",
    name: "Cement, TMT Sariya & Chemicals",
    iconName: "Layers",
    defaultItems: [
      {
        id: "cement-ultratech-weatherplus",
        skuCode: "UT-WP-50KG",
        name: "UltraTech Weather Plus Water Repellent Cement (50kg)",
        brand: "UltraTech",
        unit: "50kg Bag",
        dealerPrice: 385,
        mrp: 440,
        sellingPrice: 415,
        imageUrl: "/images/products/cement/ultratech-weatherplus.webp",
        inStock: true,
        stockQty: 320,
      },
      {
        id: "steel-tata-tiscon-12mm",
        skuCode: "TATA-TMT-12M",
        name: "Tata Tiscon 550D Super Ductile TMT Rebar 12mm",
        brand: "Tata Tiscon",
        unit: "Piece (12m)",
        dealerPrice: 710,
        mrp: 790,
        sellingPrice: 745,
        imageUrl: "/images/products/steel/tata-tiscon-12mm-tmt-fe500d.webp",
        inStock: true,
        stockQty: 220,
      },
      {
        id: "chem-dr-fixit-lw-plus",
        skuCode: "DF-LW-5L",
        name: "Dr. Fixit Pidiproof LW+ Waterproofing Liquid (5 Litre)",
        brand: "Dr. Fixit",
        unit: "5L Can",
        dealerPrice: 560,
        mrp: 780,
        sellingPrice: 650,
        imageUrl: "/images/products/chemicals/dr-fixit-lw-plus-5l.webp",
        inStock: true,
        stockQty: 60,
      },
    ],
  },
  {
    slug: "plywood-boards",
    name: "Plywood, Doors & Hardware",
    iconName: "Grid",
    defaultItems: [
      {
        id: "ply-century-club-prime-19mm",
        skuCode: "CEN-PLY-19MM",
        name: "CenturyPly Club Prime BWP Marine Grade Plywood 19mm (8x4)",
        brand: "CenturyPly",
        unit: "Sheet (32 sq.ft)",
        dealerPrice: 3450,
        mrp: 4200,
        sellingPrice: 3800,
        imageUrl: "/images/products/plywood/centuryply-club-prime-19mm.webp",
        inStock: true,
        stockQty: 35,
      },
      {
        id: "door-greenply-flush-30mm",
        skuCode: "GRN-FLS-30MM",
        name: "Greenply Solid Pine Flush Door 30mm (81x32 Inch)",
        brand: "Greenply",
        unit: "Piece",
        dealerPrice: 2150,
        mrp: 2900,
        sellingPrice: 2550,
        imageUrl: "/images/products/plywood/greenply-flush-door.webp",
        inStock: true,
        stockQty: 18,
      },
    ],
  },
  {
    slug: "fevicol-adhesives-sealants",
    name: "Fevicol, Adhesives & Sealants",
    iconName: "ShieldAlert",
    defaultItems: [
      {
        id: "adh-fevicol-sh-5kg",
        skuCode: "FEV-SH-5KG",
        name: "Fevicol SH Synthetic Resin Adhesive (5kg Bucket)",
        brand: "Pidilite",
        unit: "5kg Bucket",
        dealerPrice: 940,
        mrp: 1140,
        sellingPrice: 1020,
        imageUrl: "/images/products/adhesives/fevicol-sh-synthetic-resin-adhesive.webp",
        inStock: true,
        stockQty: 85,
      },
      {
        id: "adh-fevicol-marine-5kg",
        skuCode: "FEV-MRN-5KG",
        name: "Fevicol Marine Waterproof Wood Adhesive (5kg)",
        brand: "Pidilite",
        unit: "5kg Bucket",
        dealerPrice: 1180,
        mrp: 1450,
        sellingPrice: 1290,
        imageUrl: "/images/products/adhesives/fevicol-marine.webp",
        inStock: true,
        stockQty: 40,
      },
      {
        id: "adh-araldite-standard-1kg",
        skuCode: "ARL-STD-1KG",
        name: "Araldite Standard Epoxy Adhesive Resin & Hardener (1kg)",
        brand: "Huntsman",
        unit: "1kg Set",
        dealerPrice: 820,
        mrp: 1050,
        sellingPrice: 920,
        imageUrl: "/images/products/adhesives/araldite-standard-1kg.webp",
        inStock: true,
        stockQty: 50,
      },
    ],
  },
  {
    slug: "wires-mcb-electrical",
    name: "Wires, MCB & Electrical Supplies",
    iconName: "Zap",
    defaultItems: [
      {
        id: "elec-polycab-fr-2-5mm",
        skuCode: "POL-FR-25",
        name: "Polycab Flame Retardant 2.5 sq mm Copper Wire (90m Red)",
        brand: "Polycab",
        unit: "90m Coil",
        dealerPrice: 2280,
        mrp: 3100,
        sellingPrice: 2650,
        imageUrl: "/images/products/electrical/polycab-fr-25mm-red.webp",
        inStock: true,
        stockQty: 75,
      },
      {
        id: "elec-havells-mcb-16a",
        skuCode: "HAV-MCB-16A",
        name: "Havells Euro-X SP C-Curve MCB 16A 10kA",
        brand: "Havells",
        unit: "Piece",
        dealerPrice: 185,
        mrp: 290,
        sellingPrice: 235,
        imageUrl: "/images/products/electrical/havells-mcb-16a.webp",
        inStock: true,
        stockQty: 160,
      },
      {
        id: "elec-anchor-roma-switch-6a",
        skuCode: "ANC-ROM-6A",
        name: "Anchor Roma Classic 6A 1-Way Modular Switch White",
        brand: "Anchor Panasonic",
        unit: "Box (20 Pcs)",
        dealerPrice: 420,
        mrp: 640,
        sellingPrice: 520,
        imageUrl: "/images/products/electrical/anchor-roma-switch.webp",
        inStock: true,
        stockQty: 90,
      },
    ],
  },
  {
    slug: "kitchen-sinks-faucets",
    name: "Kitchen Sinks & Faucets",
    iconName: "Coffee",
    defaultItems: [
      {
        id: "ksink-nirali-d-bowl-37x18",
        skuCode: "NIR-SNK-3718",
        name: "Nirali Stainless Steel Double Bowl Kitchen Sink 37x18x8\"",
        brand: "Nirali",
        unit: "Unit",
        dealerPrice: 4800,
        mrp: 6800,
        sellingPrice: 5650,
        imageUrl: "/images/products/kitchen/nirali-double-bowl-sink.webp",
        inStock: true,
        stockQty: 12,
      },
      {
        id: "kfaucet-jaquar-sink-mixer",
        skuCode: "JAQ-SNK-MIX",
        name: "Jaquar Alive Swivel Spout Table Mounted Sink Mixer Chrome",
        brand: "Jaquar",
        unit: "Piece",
        dealerPrice: 3200,
        mrp: 4600,
        sellingPrice: 3850,
        imageUrl: "/images/products/kitchen/jaquar-sink-mixer.webp",
        inStock: true,
        stockQty: 25,
      },
    ],
  },
  {
    slug: "furniture-wardrobe-bed-hardware",
    name: "Furniture, Wardrobe & Bed Hardware",
    iconName: "Sliders",
    defaultItems: [
      {
        id: "fhw-hettich-telescopic-18in",
        skuCode: "HET-TEL-18IN",
        name: "Hettich Quadro 45kg Soft-Close Telescopic Runner 18\"",
        brand: "Hettich",
        unit: "Pair",
        dealerPrice: 720,
        mrp: 980,
        sellingPrice: 840,
        imageUrl: "/images/products/hardware/hettich-telescopic-18inch.webp",
        inStock: true,
        stockQty: 110,
      },
      {
        id: "fhw-hafele-hydraulic-bed-lift",
        skuCode: "HAF-BED-LFT",
        name: "Hafele Heavy Duty Gas Spring Hydraulic Bed Lift 120kg",
        brand: "Hafele",
        unit: "Set",
        dealerPrice: 2100,
        mrp: 2950,
        sellingPrice: 2480,
        imageUrl: "/images/products/hardware/hafele-bed-lift.webp",
        inStock: true,
        stockQty: 22,
      },
    ],
  },
  {
    slug: "modular-kitchen-systems",
    name: "Modular Kitchen Systems & Fittings",
    iconName: "Package",
    defaultItems: [
      {
        id: "mod-hettich-innotech-atira",
        skuCode: "HET-INO-ATR",
        name: "Hettich InnoTech Atira Soft-Close Double Wall Drawer 500mm",
        brand: "Hettich",
        unit: "Set",
        dealerPrice: 2650,
        mrp: 3600,
        sellingPrice: 3100,
        imageUrl: "/images/products/kitchen/hettich-innotech-drawer.webp",
        inStock: true,
        stockQty: 30,
      },
      {
        id: "mod-ebco-bottle-pullout-200",
        skuCode: "EBC-BTL-200",
        name: "Ebco SS 304 2-Tier Side Mounted Bottle Pullout 200mm",
        brand: "Ebco",
        unit: "Piece",
        dealerPrice: 1850,
        mrp: 2450,
        sellingPrice: 2150,
        imageUrl: "/images/products/kitchen/ebco-bottle-pullout.webp",
        inStock: true,
        stockQty: 24,
      },
    ],
  },
  {
    slug: "door-hardware-locks",
    name: "Door Hardware & Locks",
    iconName: "Lock",
    defaultItems: [
      {
        id: "lock-godrej-navtal-7l",
        skuCode: "GD-NAV-7L",
        name: "Godrej Nav-Tal Solid Brass Padlock 7 Levers with 3 Keys",
        brand: "Godrej",
        unit: "Piece",
        dealerPrice: 540,
        mrp: 680,
        sellingPrice: 610,
        imageUrl: "/images/products/hardware/godrej-navtal-brass-padlock.webp",
        inStock: true,
        stockQty: 95,
      },
      {
        id: "lock-dorset-mortise-set",
        skuCode: "DOR-MRT-SET",
        name: "Dorset Matrix Stainless Steel Mortise Lock Handle Set",
        brand: "Dorset",
        unit: "Set",
        dealerPrice: 1650,
        mrp: 2350,
        sellingPrice: 1950,
        imageUrl: "/images/products/hardware/dorset-mortise-handle-set.webp",
        inStock: true,
        stockQty: 48,
      },
      {
        id: "lock-godrej-advantis-digital",
        skuCode: "GD-ADV-DIG",
        name: "Godrej Advantis Smart Biometric Fingerprint Digital Door Lock",
        brand: "Godrej",
        unit: "Piece",
        dealerPrice: 14200,
        mrp: 19800,
        sellingPrice: 16500,
        imageUrl: "/images/products/hardware/godrej-advantis-smart-lock.webp",
        inStock: true,
        stockQty: 8,
      },
    ],
  },
  {
    slug: "sanitary-bath-fittings",
    name: "Sanitary & Bath Fittings",
    iconName: "Bath",
    defaultItems: [
      {
        id: "san-hindware-wall-hung-wc",
        skuCode: "HND-WC-WLH",
        name: "Hindware Element Rimless Wall-Hung WC with Soft-Close Seat",
        brand: "Hindware",
        unit: "Piece",
        dealerPrice: 6200,
        mrp: 8800,
        sellingPrice: 7450,
        imageUrl: "/images/products/sanitary/hindware-wall-hung-wc.webp",
        inStock: true,
        stockQty: 14,
      },
      {
        id: "san-jaquar-florentine-diverter",
        skuCode: "JAQ-DIV-FLR",
        name: "Jaquar Florentine Single Lever Concealed Diverter Complete Set",
        brand: "Jaquar",
        unit: "Set",
        dealerPrice: 4350,
        mrp: 5900,
        sellingPrice: 5100,
        imageUrl: "/images/products/sanitary/jaquar-diverter.webp",
        inStock: true,
        stockQty: 26,
      },
      {
        id: "san-cera-tabletop-basin",
        skuCode: "CER-BSN-TBL",
        name: "Cera Valentina Ceramic Table Top Wash Basin (White)",
        brand: "Cera",
        unit: "Piece",
        dealerPrice: 2300,
        mrp: 3400,
        sellingPrice: 2850,
        imageUrl: "/images/products/sanitary/cera-tabletop-basin.webp",
        inStock: true,
        stockQty: 18,
      },
    ],
  },
  {
    slug: "tile-stone-installation",
    name: "Tiles, Marble & Granite",
    iconName: "Square",
    defaultItems: [
      {
        id: "tile-kajaria-pgvt-60x120",
        skuCode: "KAJ-PGVT-612",
        name: "Kajaria Eternity 600x1200mm Polished Glazed Vitrified Tiles",
        brand: "Kajaria",
        unit: "Box (2 Pcs / 15.5 sq.ft)",
        dealerPrice: 880,
        mrp: 1220,
        sellingPrice: 1040,
        imageUrl: "/images/products/tiles/kajaria-pgvt-60x120.webp",
        inStock: true,
        stockQty: 240,
      },
      {
        id: "tile-cera-epoxy-grout-1kg",
        skuCode: "CER-EPX-GRT",
        name: "Roff Rainbow Epoxy Tile Grout with Sparkle (1kg Kit)",
        brand: "Roff (Pidilite)",
        unit: "1kg Kit",
        dealerPrice: 380,
        mrp: 520,
        sellingPrice: 440,
        imageUrl: "/images/products/tiles/roff-epoxy-grout.webp",
        inStock: true,
        stockQty: 90,
      },
    ],
  },
  {
    slug: "home-appliances",
    name: "Home Appliances",
    iconName: "Tv",
    defaultItems: [
      {
        id: "app-ao-smith-geyser-25l",
        skuCode: "AOS-GYS-25L",
        name: "AO Smith HSE-VAS-X-025 25-Litre 5-Star Storage Water Heater",
        brand: "AO Smith",
        unit: "Piece",
        dealerPrice: 7900,
        mrp: 10500,
        sellingPrice: 8999,
        imageUrl: "/images/products/appliances/ao-smith-geyser-25l.webp",
        inStock: true,
        stockQty: 15,
      },
      {
        id: "app-hindware-chimney-60cm",
        skuCode: "HND-CHM-60C",
        name: "Hindware Nadia 60cm 1500 m³/hr Autoclean Curved Glass Chimney",
        brand: "Hindware",
        unit: "Piece",
        dealerPrice: 9400,
        mrp: 14900,
        sellingPrice: 11800,
        imageUrl: "/images/products/appliances/hindware-chimney.webp",
        inStock: true,
        stockQty: 10,
      },
    ],
  },
  {
    slug: "lighting",
    name: "Lighting",
    iconName: "Sun",
    defaultItems: [
      {
        id: "lgt-philips-led-batten-20w",
        skuCode: "PHI-BAT-20W",
        name: "Philips 20W Cool Day Light Stellar LED Batten Tube",
        brand: "Philips",
        unit: "Piece",
        dealerPrice: 195,
        mrp: 399,
        sellingPrice: 280,
        imageUrl: "/images/products/lighting/philips-led-batten-20w.webp",
        inStock: true,
        stockQty: 140,
      },
      {
        id: "lgt-wipro-recessed-panel-12w",
        skuCode: "WIP-PNL-12W",
        name: "Wipro Garnet 12W Round Slim Recessed LED Panel Light",
        brand: "Wipro",
        unit: "Piece",
        dealerPrice: 260,
        mrp: 490,
        sellingPrice: 340,
        imageUrl: "/images/products/lighting/wipro-panel-12w.webp",
        inStock: true,
        stockQty: 180,
      },
    ],
  },
  {
    slug: "painting",
    name: "Paints, Putty & Primer",
    iconName: "Paintbrush",
    defaultItems: [
      {
        id: "pnt-asian-apex-ultima-20l",
        skuCode: "AP-ULT-20L",
        name: "Asian Paints Apex Ultima Exterior Emulsion White (20 Litre)",
        brand: "Asian Paints",
        unit: "20L Drum",
        dealerPrice: 4600,
        mrp: 5850,
        sellingPrice: 5150,
        imageUrl: "/images/products/paint/asian-apex-ultima-20l.webp",
        inStock: true,
        stockQty: 35,
      },
      {
        id: "pnt-birla-white-putty-40kg",
        skuCode: "BW-PUT-40KG",
        name: "Birla White WallSeal Waterproof Wall Putty (40kg Bag)",
        brand: "Birla White",
        unit: "40kg Bag",
        dealerPrice: 760,
        mrp: 920,
        sellingPrice: 840,
        imageUrl: "/images/products/paint/birla-white-putty-40kg.webp",
        inStock: true,
        stockQty: 110,
      },
    ],
  },
  {
    slug: "power-tools-safety",
    name: "Power Tools, Hand Tools & Safety PPE",
    iconName: "Wrench",
    defaultItems: [
      {
        id: "tool-bosch-gws-600-grinder",
        skuCode: "BOS-GWS-600",
        name: "Bosch GWS 600 Professional 4-Inch 670W Angle Grinder",
        brand: "Bosch",
        unit: "Unit",
        dealerPrice: 2150,
        mrp: 3100,
        sellingPrice: 2550,
        imageUrl: "/images/products/power-tools-safety/bosch-gws-600-angle-grinder-4-inch-670w.webp",
        inStock: true,
        stockQty: 28,
      },
      {
        id: "tool-karam-safety-helmet",
        skuCode: "KRM-HLM-ISI",
        name: "Karam ISI Certified Heavy Duty Industrial Safety Helmet (Yellow)",
        brand: "Karam",
        unit: "Piece",
        dealerPrice: 145,
        mrp: 230,
        sellingPrice: 185,
        imageUrl: "/images/products/safety/karam-safety-helmet-yellow.webp",
        inStock: true,
        stockQty: 200,
      },
    ],
  },
];

class VendorCatalogEngine {
  private hubProducts: Map<string, Map<string, VendorHubProduct>> = new Map();
  private hubCategoryEnabled: Map<string, Map<string, boolean>> = new Map();
  private dataDir: string;
  private persistenceFile: string;

  constructor() {
    this.dataDir = path.resolve(process.cwd(), "artifacts/api-server/data");
    this.persistenceFile = path.resolve(this.dataDir, "vendor-hub-catalogs.json");

    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    this.init();
  }

  private init() {
    // 1. Seed base default items for primary hubs
    const primaryHubs = [
      "hub-naka",
      "hub-aminabad",
      "hub-gomti",
      "hub-transport",
      "hub-alambagh",
      "hub-hazratganj",
      "hub-indiranagar",
    ];

    for (const hubId of primaryHubs) {
      const prodMap = new Map<string, VendorHubProduct>();
      const catEnabledMap = new Map<string, boolean>();

      for (const cat of VENDOR_16_CATEGORIES) {
        catEnabledMap.set(cat.slug, true);
        for (const item of cat.defaultItems) {
          prodMap.set(item.id, {
            ...item,
            hubId,
            categorySlug: cat.slug,
            categoryName: cat.name,
            customImage: null,
            updatedAt: new Date().toISOString(),
          });
        }
      }

      this.hubProducts.set(hubId, prodMap);
      this.hubCategoryEnabled.set(hubId, catEnabledMap);
    }

    // 2. Load from disk if exists
    if (fs.existsSync(this.persistenceFile)) {
      try {
        const raw = JSON.parse(fs.readFileSync(this.persistenceFile, "utf-8"));
        if (raw.hubProducts && typeof raw.hubProducts === "object") {
          for (const [hubId, prods] of Object.entries(raw.hubProducts)) {
            const map = this.hubProducts.get(hubId) || new Map<string, VendorHubProduct>();
            if (Array.isArray(prods)) {
              for (const p of prods as VendorHubProduct[]) {
                map.set(p.id, p);
              }
            }
            this.hubProducts.set(hubId, map);
          }
        }
        if (raw.hubCategoryEnabled && typeof raw.hubCategoryEnabled === "object") {
          for (const [hubId, cats] of Object.entries(raw.hubCategoryEnabled)) {
            const map = this.hubCategoryEnabled.get(hubId) || new Map<string, boolean>();
            if (typeof cats === "object" && cats) {
              for (const [slug, enabled] of Object.entries(cats as Record<string, boolean>)) {
                map.set(slug, Boolean(enabled));
              }
            }
            this.hubCategoryEnabled.set(hubId, map);
          }
        }
        logger.info("[VendorCatalogEngine] Loaded vendor hub catalogs from disk.");
      } catch (err) {
        logger.error({ err }, "[VendorCatalogEngine] Failed to parse persistence file");
      }
    }
  }

  private persist() {
    try {
      const serializableProducts: Record<string, VendorHubProduct[]> = {};
      for (const [hubId, map] of this.hubProducts.entries()) {
        serializableProducts[hubId] = Array.from(map.values());
      }

      const serializableCats: Record<string, Record<string, boolean>> = {};
      for (const [hubId, map] of this.hubCategoryEnabled.entries()) {
        serializableCats[hubId] = Object.fromEntries(map.entries());
      }

      const payload = {
        updatedAt: new Date().toISOString(),
        hubProducts: serializableProducts,
        hubCategoryEnabled: serializableCats,
      };

      fs.writeFileSync(this.persistenceFile, JSON.stringify(payload, null, 2), "utf-8");
    } catch (err) {
      logger.error({ err }, "[VendorCatalogEngine] Error saving vendor catalog data");
    }
  }

  private ensureHub(hubId: string) {
    if (!this.hubProducts.has(hubId)) {
      const prodMap = new Map<string, VendorHubProduct>();
      const catEnabledMap = new Map<string, boolean>();

      for (const cat of VENDOR_16_CATEGORIES) {
        catEnabledMap.set(cat.slug, true);
        for (const item of cat.defaultItems) {
          prodMap.set(item.id, {
            ...item,
            hubId,
            categorySlug: cat.slug,
            categoryName: cat.name,
            customImage: null,
            updatedAt: new Date().toISOString(),
          });
        }
      }

      this.hubProducts.set(hubId, prodMap);
      this.hubCategoryEnabled.set(hubId, catEnabledMap);
    }
  }

  public getCatalog(
    hubId: string,
    filters?: {
      category?: string;
      search?: string;
      status?: "all" | "in_stock" | "out_of_stock" | "custom_photos";
    }
  ) {
    this.ensureHub(hubId);
    const prodMap = this.hubProducts.get(hubId)!;
    const catEnabledMap = this.hubCategoryEnabled.get(hubId)!;

    let items = Array.from(prodMap.values());

    if (filters?.category && filters.category !== "all") {
      items = items.filter((i) => i.categorySlug === filters.category);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.brand.toLowerCase().includes(q) ||
          i.skuCode.toLowerCase().includes(q) ||
          i.categoryName.toLowerCase().includes(q)
      );
    }

    if (filters?.status === "in_stock") {
      items = items.filter((i) => i.inStock);
    } else if (filters?.status === "out_of_stock") {
      items = items.filter((i) => !i.inStock);
    } else if (filters?.status === "custom_photos") {
      items = items.filter((i) => Boolean(i.customImage));
    }

    // Compute Category summaries across all items for this hub
    const allHubItems = Array.from(prodMap.values());
    const categories: VendorCategorySummary[] = VENDOR_16_CATEGORIES.map((cat) => {
      const catItems = allHubItems.filter((i) => i.categorySlug === cat.slug);
      return {
        slug: cat.slug,
        name: cat.name,
        iconName: cat.iconName,
        enabled: catEnabledMap.get(cat.slug) ?? true,
        totalItems: catItems.length,
        inStockCount: catItems.filter((i) => i.inStock).length,
      };
    });

    return {
      hubId,
      totalItems: allHubItems.length,
      inStockCount: allHubItems.filter((i) => i.inStock).length,
      outOfStockCount: allHubItems.filter((i) => !i.inStock).length,
      customPhotosCount: allHubItems.filter((i) => Boolean(i.customImage)).length,
      categories,
      items,
    };
  }

  public setStock(hubId: string, productId: string, inStock: boolean, stockQty?: number) {
    this.ensureHub(hubId);
    const prodMap = this.hubProducts.get(hubId)!;
    const item = prodMap.get(productId);
    if (!item) return null;

    item.inStock = inStock;
    if (typeof stockQty === "number" && !isNaN(stockQty)) {
      item.stockQty = Math.max(0, stockQty);
    }
    item.updatedAt = new Date().toISOString();

    this.persist();

    // Mirror to global catalogEngine so storefront and admin immediately sync
    catalogEngine.updateSku(productId, { inStock });

    // Emit live socket event to all clients
    const io = getIo();
    io?.emit("catalog:stock_updated", {
      hubId,
      productId,
      skuCode: item.skuCode,
      inStock: item.inStock,
      stockQty: item.stockQty,
      timestamp: item.updatedAt,
    });

    return item;
  }

  public setImage(hubId: string, productId: string, imageUrl: string) {
    this.ensureHub(hubId);
    const prodMap = this.hubProducts.get(hubId)!;
    const item = prodMap.get(productId);
    if (!item) return null;

    item.customImage = imageUrl;
    item.imageUrl = imageUrl;
    item.updatedAt = new Date().toISOString();

    this.persist();

    // Mirror to global catalogEngine
    catalogEngine.updateSku(productId, { imageUrl });

    // Emit live socket event
    const io = getIo();
    io?.emit("catalog:image_updated", {
      hubId,
      productId,
      skuCode: item.skuCode,
      imageUrl,
      timestamp: item.updatedAt,
    });

    return item;
  }

  public resetImage(hubId: string, productId: string) {
    this.ensureHub(hubId);
    const prodMap = this.hubProducts.get(hubId)!;
    const item = prodMap.get(productId);
    if (!item) return null;

    // Find master default image
    let defaultImg = "/images/products/cement/ultratech-weatherplus.webp";
    for (const cat of VENDOR_16_CATEGORIES) {
      const match = cat.defaultItems.find((d) => d.id === productId);
      if (match) {
        defaultImg = match.imageUrl;
        break;
      }
    }

    item.customImage = null;
    item.imageUrl = defaultImg;
    item.updatedAt = new Date().toISOString();

    this.persist();
    catalogEngine.updateSku(productId, { imageUrl: defaultImg });

    const io = getIo();
    io?.emit("catalog:image_updated", {
      hubId,
      productId,
      skuCode: item.skuCode,
      imageUrl: defaultImg,
      timestamp: item.updatedAt,
    });

    return item;
  }

  public updatePriceAndQty(
    hubId: string,
    productId: string,
    dealerPrice: number,
    mrp: number,
    stockQty: number
  ) {
    this.ensureHub(hubId);
    const prodMap = this.hubProducts.get(hubId)!;
    const item = prodMap.get(productId);
    if (!item) return null;

    if (dealerPrice > 0) item.dealerPrice = dealerPrice;
    if (mrp > 0) item.mrp = mrp;
    if (dealerPrice > 0) item.sellingPrice = Math.round(dealerPrice * 1.08);
    if (stockQty >= 0) item.stockQty = stockQty;
    item.updatedAt = new Date().toISOString();

    this.persist();

    catalogEngine.updateSku(productId, {
      dealerLandingCost: item.dealerPrice,
      sellingPrice: item.sellingPrice,
      mrp: item.mrp,
    });

    const io = getIo();
    io?.emit("catalog:price_updated", {
      hubId,
      productId,
      dealerPrice: item.dealerPrice,
      mrp: item.mrp,
      sellingPrice: item.sellingPrice,
      stockQty: item.stockQty,
      timestamp: item.updatedAt,
    });

    return item;
  }

  public addProduct(
    hubId: string,
    data: {
      categorySlug: string;
      name: string;
      brand?: string;
      unit?: string;
      dealerPrice: number;
      mrp: number;
      imageUrl?: string;
      inStock?: boolean;
      stockQty?: number;
    }
  ): VendorHubProduct {
    this.ensureHub(hubId);
    const prodMap = this.hubProducts.get(hubId)!;

    const catInfo = VENDOR_16_CATEGORIES.find((c) => c.slug === data.categorySlug) || {
      slug: data.categorySlug,
      name: data.categorySlug,
      iconName: "Package",
      defaultItems: [],
    };

    const id = `vhp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const skuCode = `SKU-${Date.now().toString(36).toUpperCase()}`;
    const img = data.imageUrl || "/images/products/cement/ultratech-weatherplus.webp";

    const newProd: VendorHubProduct = {
      id,
      hubId,
      categorySlug: catInfo.slug,
      categoryName: catInfo.name,
      skuCode,
      name: data.name,
      brand: data.brand || "Conon Verified",
      unit: data.unit || "Unit",
      dealerPrice: data.dealerPrice,
      mrp: data.mrp,
      sellingPrice: Math.round(data.dealerPrice * 1.1),
      imageUrl: img,
      customImage: data.imageUrl ? data.imageUrl : null,
      inStock: data.inStock !== false,
      stockQty: data.stockQty ?? 50,
      isCustom: true,
      updatedAt: new Date().toISOString(),
    };

    prodMap.set(id, newProd);
    this.persist();

    // Mirror to catalogEngine
    catalogEngine.createSku({
      id,
      name: newProd.name,
      brand: newProd.brand,
      category: newProd.categorySlug,
      categoryName: newProd.categoryName,
      unit: newProd.unit,
      sellingPrice: newProd.sellingPrice,
      mrp: newProd.mrp,
      dealerLandingCost: newProd.dealerPrice,
      imageUrl: newProd.imageUrl,
      inStock: newProd.inStock,
      express60Min: true,
      gstPercent: 18,
      hsnCode: "6802",
      deliveryVehicleType: "3W_ELECTRIC_LOADER",
    });

    const io = getIo();
    io?.emit("catalog:product_created", {
      hubId,
      product: newProd,
      timestamp: newProd.updatedAt,
    });

    return newProd;
  }

  public toggleCategory(hubId: string, categorySlug: string, enabled: boolean) {
    this.ensureHub(hubId);
    const catMap = this.hubCategoryEnabled.get(hubId)!;
    catMap.set(categorySlug, enabled);
    this.persist();

    const io = getIo();
    io?.emit("catalog:category_toggled", {
      hubId,
      categorySlug,
      enabled,
      timestamp: new Date().toISOString(),
    });

    return { categorySlug, enabled };
  }

  public restockAllCategory(hubId: string, categorySlug: string) {
    this.ensureHub(hubId);
    const prodMap = this.hubProducts.get(hubId)!;
    let count = 0;

    for (const item of prodMap.values()) {
      if (item.categorySlug === categorySlug || categorySlug === "all") {
        item.inStock = true;
        if (item.stockQty <= 0) item.stockQty = 50;
        item.updatedAt = new Date().toISOString();
        count++;
        catalogEngine.updateSku(item.id, { inStock: true });
      }
    }

    this.persist();

    const io = getIo();
    io?.emit("catalog:category_restocked", {
      hubId,
      categorySlug,
      restockedCount: count,
      timestamp: new Date().toISOString(),
    });

    return { categorySlug, restockedCount: count };
  }
}

export const vendorCatalogEngine = new VendorCatalogEngine();
