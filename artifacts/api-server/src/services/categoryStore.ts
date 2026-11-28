import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { CATALOG_PRODUCTS, query } from "@workspace/db";
import { CATEGORIES_STORE_PATH, CATEGORIES_UPLOADS_DIR } from "../lib/paths";
import { processAndSaveUploadedImage, stripLocalhostPrefix } from "../utils/uploadSanitizer";
import { logger } from "../lib/logger";

export interface CategorySubcategoryItem {
  name: string;
  slug: string;
  itemCount?: number;
}

export interface MasterCategoryRecord {
  id: string;
  catId: number;
  slug: string;
  name: string;
  nameHi?: string;
  title: string;
  titleHi?: string;
  department: string;
  dbCategory: string;
  route: string;
  imageUrl: string;
  image: string;
  badge?: string;
  badgeColor?: string;
  categoryType: "MATERIAL" | "RMC" | "SERVICE" | "RENTAL";
  defaultHsn: string;
  defaultGstRate: number;
  defaultGst: number;
  vehicleType: "BIKE" | "LOADER";
  vehicleClass: string;
  displayOrder: number;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
  subcategories: CategorySubcategoryItem[];
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_BOOT_TIME = new Date().toISOString();

function makeCategory(
  order: number,
  cfg: {
    id: string;
    catId: number;
    slug: string;
    name: string;
    nameHi?: string;
    department: string;
    dbCategory: string;
    route: string;
    imageUrl: string;
    badge?: string;
    badgeColor?: string;
    categoryType?: "MATERIAL" | "RMC" | "SERVICE" | "RENTAL";
    defaultHsn?: string;
    defaultGstRate?: number;
    vehicleType?: "BIKE" | "LOADER";
    vehicleClass?: string;
    isActive?: boolean;
    subcategories?: CategorySubcategoryItem[];
  }
): MasterCategoryRecord {
  const gst = cfg.defaultGstRate ?? 18;
  const vType = cfg.vehicleType ?? "LOADER";
  return {
    id: cfg.id,
    catId: cfg.catId,
    slug: cfg.slug,
    name: cfg.name,
    nameHi: cfg.nameHi,
    title: cfg.name,
    titleHi: cfg.nameHi,
    department: cfg.department,
    dbCategory: cfg.dbCategory,
    route: cfg.route,
    imageUrl: cfg.imageUrl,
    image: cfg.imageUrl,
    badge: cfg.badge,
    badgeColor: cfg.badgeColor,
    categoryType: cfg.categoryType ?? "MATERIAL",
    defaultHsn: cfg.defaultHsn ?? "38245010",
    defaultGstRate: gst,
    defaultGst: gst,
    vehicleType: vType,
    vehicleClass: cfg.vehicleClass ?? (vType === "BIKE" ? "Delivery Bike (<=30kg)" : "Chhota Hathi (1.5T Loader)"),
    displayOrder: order,
    sortOrder: order,
    isActive: cfg.isActive ?? true,
    productCount: 0,
    subcategories: cfg.subcategories ?? [],
    createdAt: DEFAULT_BOOT_TIME,
    updatedAt: DEFAULT_BOOT_TIME,
  };
}

/**
 * SINGLE CANONICAL SEED LIST (20 Deduplicated Storefront + Admin Categories)
 * Replaces both legacy 16-item Admin list & static frontend HOME_CATEGORIES overrides.
 */
export const CANONICAL_DEFAULT_CATEGORIES: MasterCategoryRecord[] = [
  makeCategory(1, {
    id: "cat_rmc_ready_mix",
    catId: 1,
    slug: "rmc-ready-mix-concrete",
    name: "RMC (Ready Mix Concrete)",
    nameHi: "रेडी मिक्स कंक्रीट (प्लांट डायरेक्ट)",
    department: "Civil & Structural",
    dbCategory: "rmc",
    route: "/category/rmc-ready-mix-concrete",
    imageUrl: "/images/home-categories/rmc-ready-mix-concrete.webp",
    badge: "PLANT DIRECT",
    badgeColor: "#F2B705",
    categoryType: "RMC",
    defaultHsn: "38245010",
    defaultGstRate: 18,
    vehicleType: "LOADER",
    vehicleClass: "Transit Mixer (6 m³) / Loader",
    subcategories: [
      { name: "M10–M50 Structural Grades", slug: "standard-grades", itemCount: 8 },
      { name: "SCC, Waterproof & Green RMC", slug: "speciality-mixes", itemCount: 9 },
      { name: "Narrow-Lane Dry Mix Bags (40kg)", slug: "dry-mix-bags", itemCount: 1 },
      { name: "Boom Placer & Line Pumps", slug: "pumps-admixtures", itemCount: 6 },
    ],
  }),
  makeCategory(2, {
    id: "cat_cctv_networking",
    catId: 101,
    slug: "cctv-networking",
    name: "CCTV & Networking",
    nameHi: "सी.सी.टी.वी. और नेटवर्किंग",
    department: "Electrical",
    dbCategory: "electrical",
    route: "/collections/cctv-networking",
    imageUrl: "/images/home-categories/cctv-networking.webp",
    badge: "New Tech",
    badgeColor: "#1D4ED8",
    defaultHsn: "85258900",
    defaultGstRate: 18,
    vehicleType: "BIKE",
    subcategories: [
      { name: "CCTV Cameras", slug: "cctv-cameras", itemCount: 24 },
      { name: "DVR & NVR Recorders", slug: "dvr-nvr-recorders", itemCount: 16 },
      { name: "Surveillance Storage", slug: "surveillance-storage", itemCount: 8 },
      { name: "CCTV & LAN Cables", slug: "cctv-lan-cables", itemCount: 12 },
      { name: "Power & PoE Switches", slug: "power-poe-switches", itemCount: 14 },
      { name: "Routers, Racks & Accessories", slug: "routers-racks-accessories", itemCount: 18 },
    ],
  }),
  makeCategory(3, {
    id: "cat_cpvc_plumbing",
    catId: 2,
    slug: "cpvc-plumbing-tanks",
    name: "CPVC Plumbing & Overhead Tanks",
    nameHi: "सी.पी.वी.सी. प्लंबिंग और पानी की टंकियां",
    department: "Plumbing, Sanitary & Bath",
    dbCategory: "plumbing",
    route: "/categories?cat=cpvc-plumbing-tanks",
    imageUrl: "/images/home-categories/cpvc-plumbing-tanks.webp",
    badge: "Bulk Rates",
    badgeColor: "#F2B705",
    defaultHsn: "39172390",
    defaultGstRate: 18,
    vehicleType: "LOADER",
    subcategories: [
      { name: "CPVC Pipes", slug: "cpvc-pipes", itemCount: 15 },
      { name: "UPVC Pipes & Fittings", slug: "upvc-pipes-fittings", itemCount: 2 },
      { name: "SWR Drainage Pipes", slug: "swr-drainage-pipes", itemCount: 4 },
      { name: "CPVC Fittings, Brass Inserts & Valves", slug: "cpvc-fittings-valves", itemCount: 16 },
      { name: "Solvent Cements & Adhesives", slug: "solvent-cements-adhesives", itemCount: 4 },
      { name: "Overhead Water Tanks & Accessories", slug: "overhead-water-tanks", itemCount: 15 },
    ],
  }),
  makeCategory(4, {
    id: "cat_cement_civil",
    catId: 3,
    slug: "cement-civil-works",
    name: "Cement, TMT Sariya & Chemicals",
    nameHi: "सीमेंट और सिविल कार्य",
    department: "Civil & Structural",
    dbCategory: "cement",
    route: "/collections/cement-1",
    imageUrl: "/images/home-categories/cement-civil-works.webp",
    badge: "Bulk Prices",
    badgeColor: "#F2B705",
    defaultHsn: "25232910",
    defaultGstRate: 28,
    vehicleType: "LOADER",
    subcategories: [
      { name: "Cement & White Cement", slug: "cement-white-cement", itemCount: 16 },
      { name: "TMT Sariya (Steel Bars)", slug: "tmt-sariya", itemCount: 20 },
      { name: "Binding Wire & Steel Accessories", slug: "binding-wire-accessories", itemCount: 4 },
      { name: "Waterproofing & Bonding Chemicals", slug: "waterproofing-chemicals", itemCount: 22 },
      { name: "Tile Adhesives & Block Mortar", slug: "tile-adhesives-block-mortar", itemCount: 8 },
    ],
  }),
  makeCategory(5, {
    id: "cat_plywood_boards",
    catId: 4,
    slug: "plywood-boards",
    name: "Plywood, Doors & Hardware",
    nameHi: "प्लाईवुड और बोर्ड्स",
    department: "Civil & Interiors",
    dbCategory: "wood",
    route: "/categories?cat=plywood-boards",
    imageUrl: "/images/home-categories/plywood-boards.webp",
    defaultHsn: "44123990",
    defaultGstRate: 18,
    vehicleType: "LOADER",
    subcategories: [
      { name: "Plywood (8x4 ft)", slug: "plywood-8x4", itemCount: 6 },
      { name: "Flush Doors (30mm)", slug: "flush-doors-30mm", itemCount: 4 },
      { name: "Laminates (1mm)", slug: "laminates-1mm", itemCount: 2 },
      { name: "Hardware (Locks, Closers & Hinges)", slug: "hardware-locks-hinges", itemCount: 4 },
    ],
  }),
  makeCategory(6, {
    id: "cat_fevicol_adhesives",
    catId: 5,
    slug: "fevicol-adhesives-sealants",
    name: "Fevicol, Adhesives & Sealants",
    nameHi: "फेविकोल, चिपकने वाले पदार्थ और सीलेंट",
    department: "Furniture & Architectural Hardware",
    dbCategory: "adhesives",
    route: "/categories?cat=fevicol-adhesives-sealants",
    imageUrl: "/images/home-categories/fevicol-adhesives-sealants.webp",
    defaultHsn: "35069190",
    defaultGstRate: 18,
    vehicleType: "BIKE",
    subcategories: [
      { name: "Wood & Laminate Adhesives", slug: "wood-laminate-adhesives", itemCount: 20 },
      { name: "Contact & Rubber Adhesives", slug: "contact-rubber-adhesives", itemCount: 3 },
      { name: "Epoxy, Putty & Instant Repair", slug: "epoxy-putty-instant-repair", itemCount: 10 },
      { name: "Silicone, PU Sealants & Foam", slug: "silicone-pu-sealants-foam", itemCount: 8 },
      { name: "Applicator Guns & Masking Tapes", slug: "applicator-guns-masking-tapes", itemCount: 4 },
    ],
  }),
  makeCategory(7, {
    id: "cat_wires_electrical",
    catId: 6,
    slug: "wires-mcb-electrical",
    name: "Wires, MCB & Electrical Supplies",
    nameHi: "तार, एम.सी.बी. और बिजली के सामान",
    department: "Electrical",
    dbCategory: "electrical",
    route: "/categories?cat=wires-mcb-electrical",
    imageUrl: "/images/home-categories/wires-mcb-electrical.webp",
    badge: "ISI Certified",
    badgeColor: "#10B981",
    defaultHsn: "85444999",
    defaultGstRate: 18,
    vehicleType: "BIKE",
    subcategories: [
      { name: "Flame Retardant House Wires", slug: "fr-house-wires", itemCount: 42 },
      { name: "MCB & Distribution Boards", slug: "mcb-db-boards", itemCount: 28 },
      { name: "Modular Switches & Sockets", slug: "modular-switches", itemCount: 64 },
      { name: "Conduits, Bends & Metal Boxes", slug: "conduits-boxes", itemCount: 36 },
      { name: "Earth Bar & Industrial Glands", slug: "earthing-glands", itemCount: 16 },
    ],
  }),
  makeCategory(8, {
    id: "cat_kitchen_sinks",
    catId: 7,
    slug: "kitchen-sinks-faucets",
    name: "Kitchen Sinks & Faucets",
    nameHi: "किचन सिंक और नल",
    department: "Plumbing, Sanitary & Bath",
    dbCategory: "hardware",
    route: "/categories?cat=kitchen-sinks-faucets",
    imageUrl: "/images/home-categories/kitchen-sinks-faucets.webp",
    defaultHsn: "73241000",
    defaultGstRate: 18,
    vehicleType: "LOADER",
    subcategories: [
      { name: "SS Pressed Sinks", slug: "ss-pressed-sinks", itemCount: 9 },
      { name: "Handmade SS Sinks", slug: "handmade-ss-sinks", itemCount: 6 },
      { name: "Quartz Sinks", slug: "quartz-sinks", itemCount: 4 },
      { name: "Kitchen Sink Cocks", slug: "kitchen-sink-cocks", itemCount: 11 },
      { name: "Sink Mixers & Pull-Out Faucets", slug: "sink-mixers-pullout", itemCount: 4 },
      { name: "Sink Accessories & RO Add-Ons", slug: "sink-accessories-ro", itemCount: 4 },
    ],
  }),
  makeCategory(9, {
    id: "cat_furniture_hardware",
    catId: 8,
    slug: "furniture-wardrobe-bed-hardware",
    name: "Furniture, Wardrobe & Bed Hardware",
    nameHi: "फर्नीचर, अलमारी और बेड हार्डवेयर",
    department: "Furniture & Architectural Hardware",
    dbCategory: "hardware",
    route: "/categories?cat=furniture-wardrobe-bed-hardware",
    imageUrl: "/images/home-categories/furniture-wardrobe-bed-hardware.webp",
    defaultHsn: "83024200",
    defaultGstRate: 18,
    vehicleType: "BIKE",
    subcategories: [
      { name: "Telescopic Channels", slug: "telescopic-channels", itemCount: 6 },
      { name: "Soft-Close Hinges & Sliding Track", slug: "soft-close-hinges-sliding-track", itemCount: 5 },
      { name: "Hydraulic Bed & Wardrobe Lifts", slug: "hydraulic-bed-wardrobe-lifts", itemCount: 5 },
      { name: "Wardrobe Pipes & SS 304 Handles", slug: "wardrobe-pipes-ss304-handles", itemCount: 4 },
    ],
  }),
  makeCategory(10, {
    id: "cat_modular_kitchen",
    catId: 9,
    slug: "modular-kitchen-systems",
    name: "Modular Kitchen Systems & Fittings",
    nameHi: "मॉड्यूलर किचन सिस्टम और फिटिंग्स",
    department: "Furniture & Architectural Hardware",
    dbCategory: "hardware",
    route: "/categories?cat=modular-kitchen-systems",
    imageUrl: "/images/home-categories/modular-kitchen-systems.webp",
    defaultHsn: "83024200",
    defaultGstRate: 18,
    vehicleType: "LOADER",
    subcategories: [
      { name: "Tandem Box Drawer Systems", slug: "tandem-box-drawer-systems", itemCount: 7 },
      { name: "Bottle Pull-Outs, Corner Units & Tall Pantry", slug: "bottle-pullouts-corner-pantry", itemCount: 8 },
      { name: "SS 304 Baskets, Wicker & Organizers", slug: "ss304-baskets-wicker-organizers", itemCount: 6 },
      { name: "Rolling Shutters, Lift-Ups & Gola Profiles", slug: "rolling-shutters-liftups-gola", itemCount: 5 },
    ],
  }),
  makeCategory(11, {
    id: "cat_door_hardware",
    catId: 10,
    slug: "door-hardware-locks",
    name: "Door Hardware & Locks",
    nameHi: "दरवाजे के हार्डवेयर और ताले",
    department: "Furniture & Architectural Hardware",
    dbCategory: "hardware",
    route: "/categories?cat=door-hardware-locks",
    imageUrl: "/images/home-categories/door-hardware-locks.webp",
    defaultHsn: "83014090",
    defaultGstRate: 18,
    vehicleType: "BIKE",
    subcategories: [
      { name: "Smart Digital Locks", slug: "smart-digital-locks", itemCount: 6 },
      { name: "Main Door Rim Locks, Mortise Sets & Padlocks", slug: "rim-mortise-padlocks", itemCount: 10 },
      { name: "Aldrops, Tower Bolts, Stoppers & Pull Handles", slug: "aldrops-bolts-stoppers-handles", itemCount: 5 },
      { name: "SS 304 Hinges, Door Closers & Floor Springs", slug: "hinges-closers-springs", itemCount: 5 },
    ],
  }),
  makeCategory(12, {
    id: "cat_sanitary_bath",
    catId: 11,
    slug: "sanitary-bath-fittings",
    name: "Sanitary & Bath Fittings",
    nameHi: "सैनिटरी और बाथ फिटिंग",
    department: "Plumbing, Sanitary & Bath",
    dbCategory: "plumbing",
    route: "/categories?cat=sanitary-bath-fittings",
    imageUrl: "/images/home-categories/sanitary-bath-fittings.webp",
    defaultHsn: "69101000",
    defaultGstRate: 18,
    vehicleType: "LOADER",
    subcategories: [
      { name: "Wall-Hung WCs & One-Piece Commodes", slug: "wall-hung-and-one-piece-wc", itemCount: 6 },
      { name: "Concealed Cisterns & Dual-Flush Plates", slug: "concealed-cisterns-flush-plates", itemCount: 5 },
      { name: "Countertop & Vanity Ceramic Basins", slug: "countertop-vanity-basins", itemCount: 6 },
      { name: "Shower Diverters, Rain Showers & Spouts", slug: "shower-diverters-rain-spouts", itemCount: 6 },
      { name: "Health Faucets, Angle Valves & Bath Brassware", slug: "health-faucets-valves-brassware", itemCount: 5 },
    ],
  }),
  makeCategory(13, {
    id: "cat_tile_stone",
    catId: 12,
    slug: "tile-stone-installation",
    name: "Tiles, Marble & Granite",
    nameHi: "टाइल्स, मार्बल और ग्रेनाइट",
    department: "Civil & Interiors",
    dbCategory: "tiles",
    route: "/collections/tiles-marble-granite",
    imageUrl: "/images/home-categories/tile-stone-installation.webp",
    badge: "Bulk Rates",
    badgeColor: "#F2B705",
    defaultHsn: "69072100",
    defaultGstRate: 18,
    vehicleType: "LOADER",
    subcategories: [
      { name: "Vitrified Floor Tiles", slug: "vitrified-floor-tiles", itemCount: 12 },
      { name: "Ceramic Wall & Parking Tiles", slug: "ceramic-wall-parking-tiles", itemCount: 6 },
      { name: "Granite Slabs", slug: "granite-slabs", itemCount: 7 },
      { name: "Marble & Natural Stones", slug: "marble-natural-stones", itemCount: 9 },
      { name: "Grouts, Epoxy, Spacers & Cutting Tools", slug: "grouts-tools", itemCount: 8 },
    ],
  }),
  makeCategory(14, {
    id: "cat_home_appliances",
    catId: 13,
    slug: "home-appliances",
    name: "Home Appliances",
    nameHi: "होम अप्लायंसेज और गीजर",
    department: "Electrical",
    dbCategory: "electrical",
    route: "/collections/home-appliances",
    imageUrl: "/images/home-categories/home-appliances.webp",
    defaultHsn: "85161000",
    defaultGstRate: 18,
    vehicleType: "LOADER",
    subcategories: [
      { name: "Water Heaters & Geysers", slug: "water-heaters-geysers", itemCount: 7 },
      { name: "Modular Kitchen Chimneys", slug: "modular-kitchen-chimneys", itemCount: 4 },
      { name: "Exhaust & Ventilation Fans", slug: "exhaust-ventilation-fans", itemCount: 4 },
      { name: "Desert Air Coolers", slug: "desert-air-coolers", itemCount: 2 },
      { name: "Inverters & Tubular Batteries", slug: "inverters-tubular-batteries", itemCount: 2 },
    ],
  }),
  makeCategory(15, {
    id: "cat_lighting",
    catId: 14,
    slug: "lighting",
    name: "Lighting & Architectural LED",
    nameHi: "लाइटिंग और फिक्स्चर",
    department: "Electrical",
    dbCategory: "electrical",
    route: "/collections/lighting",
    imageUrl: "/images/home-categories/lighting.webp",
    badge: "Kelvin Simulator",
    badgeColor: "#1D4ED8",
    defaultHsn: "94054200",
    defaultGstRate: 18,
    vehicleType: "BIKE",
    subcategories: [
      { name: 'Concealed & Junction (3" Box)', slug: "concealed-junction-lights", itemCount: 6 },
      { name: "Ceiling Panels (Rimless & 3-in-1)", slug: "ceiling-panel-lights", itemCount: 8 },
      { name: "Anti-Glare COB & Spotlights", slug: "cob-spot-lights", itemCount: 6 },
      { name: "Zero-Dot Strips, Profiles & SMPS", slug: "strip-profiles-drivers", itemCount: 7 },
      { name: "LED Battens (Tubelights)", slug: "led-battens", itemCount: 4 },
      { name: "Bulbs & Inverter Emergency", slug: "bulbs-inverter-emergency", itemCount: 5 },
      { name: "Staircase, Cabinet & Track", slug: "cabinet-track-commercial", itemCount: 6 },
      { name: "Outdoor, Flood & Gate Elevation", slug: "outdoor-flood-gate-lights", itemCount: 5 },
    ],
  }),
  makeCategory(21, {
    id: "cat_solar_rooftop",
    catId: 20,
    slug: "solar-rooftop-power",
    name: "Solar & Rooftop Power",
    nameHi: "सोलर पैनल और रूफटॉप पावर",
    department: "Electrical",
    dbCategory: "solar",
    route: "/collections/solar-rooftop-power",
    imageUrl: "/images/home-categories/solar-rooftop-power.webp",
    badge: "₹1.08L SUBSIDY",
    badgeColor: "#F59E0B",
    defaultHsn: "85414300",
    defaultGstRate: 12,
    vehicleType: "LOADER",
    subcategories: [
      { name: "Solar Panels (DCR & Non-DCR)", slug: "solar-panels", itemCount: 8 },
      { name: "Complete Rooftop Kits (1kW–10kW)", slug: "rooftop-solar-kits", itemCount: 7 },
      { name: "On-Grid & Hybrid Inverters", slug: "solar-inverters", itemCount: 6 },
      { name: "Lithium & Solar Batteries", slug: "solar-batteries", itemCount: 4 },
      { name: "ACDB, DCDB & Protection", slug: "solar-acdb-dcdb", itemCount: 5 },
      { name: "DC Cables, Earthing & Site Shield", slug: "solar-cables-earthing", itemCount: 8 },
      { name: "HDGI Structures & Waterproofing", slug: "solar-structures-lights", itemCount: 7 },
    ],
  }),
  makeCategory(16, {
    id: "cat_painting",
    catId: 15,
    slug: "painting",
    name: "Paints, Putty & Primer",
    nameHi: "पेंटिंग, पुट्टी और प्राइमर",
    department: "Civil & Interiors",
    dbCategory: "paint",
    route: "/collections/paints-putty-primer",
    imageUrl: "/images/home-categories/painting.webp",
    badge: "GST 18% Compliant",
    badgeColor: "#10B981",
    defaultHsn: "32091090",
    defaultGstRate: 18,
    vehicleType: "LOADER",
    subcategories: [
      { name: "Wall Putty", slug: "wall-putty", itemCount: 8 },
      { name: "Wall & Metal Primers", slug: "wall-metal-primers", itemCount: 8 },
      { name: "Interior Paints & Distempers", slug: "interior-paints-distempers", itemCount: 14 },
      { name: "Exterior Paints", slug: "exterior-paints", itemCount: 10 },
      { name: "Enamels, Thinners & Painting Tools", slug: "enamels-tools", itemCount: 8 },
    ],
  }),
  makeCategory(17, {
    id: "cat_safety_ppe",
    catId: 16,
    slug: "safety-ppe-workwear",
    name: "Site Safety & PPE",
    nameHi: "साइट सेफ्टी और सुरक्षा गियर",
    department: "Tools & Safety",
    dbCategory: "safety",
    route: "/category/safety-ppe-workwear",
    imageUrl: "/images/home-categories/safety-workwear.webp",
    badge: "ISI / RERA Compliant",
    badgeColor: "#10B981",
    defaultHsn: "6506",
    defaultGstRate: 18,
    vehicleType: "BIKE",
    subcategories: [
      { name: "Head, Eye & Face Protection", slug: "head-eye-face", itemCount: 5 },
      { name: "Safety Shoes & Gumboots", slug: "shoes-gumboots", itemCount: 5 },
      { name: "Fall Protection & Harnesses", slug: "fall-protection", itemCount: 5 },
      { name: "Industrial Hand Gloves", slug: "hand-gloves", itemCount: 5 },
      { name: "Hi-Vis Jackets & Rainwear", slug: "hivis-rainwear", itemCount: 3 },
      { name: "Respiratory & Ear Protection", slug: "respiratory-ear", itemCount: 3 },
      { name: "Site Barricading & Signboards", slug: "barricading-signs", itemCount: 3 },
      { name: "Fire, Electrical Mat & First-Aid", slug: "fire-first-aid", itemCount: 3 },
    ],
  }),
  makeCategory(18, {
    id: "cat_tools_hardware",
    catId: 17,
    slug: "tools-hardware",
    name: "Tools, Power Tools & General Hardware",
    nameHi: "पावर टूल्स, हाथ के औजार और हार्डवेयर",
    department: "Tools",
    dbCategory: "tools",
    route: "/collections/tools-hardware",
    imageUrl: "/images/home-categories/tools-hardware.webp",
    badge: "Buy or Rent",
    badgeColor: "#1D4ED8",
    defaultHsn: "84672100",
    defaultGstRate: 18,
    vehicleType: "BIKE",
    subcategories: [
      { name: "Angle Grinders & Marble Cutters", slug: "grinders-cutters", itemCount: 6 },
      { name: "Rotary Hammers & Impact Drills", slug: "rotary-drills", itemCount: 6 },
      { name: "Cutting Blades, Discs & Drill Bits", slug: "blades-discs-bits", itemCount: 8 },
      { name: "Hand Tools & Masonry Essentials", slug: "hand-masonry-tools", itemCount: 7 },
      { name: "Measuring, Levelling & Marking", slug: "measuring-levelling", itemCount: 5 },
      { name: "Fasteners, Screws & Anchors", slug: "fasteners-anchors", itemCount: 6 },
      { name: "Safety Gear & Site Utility", slug: "safety-utility", itemCount: 5 },
      { name: "Ladders, Wheelbarrows & Tapes", slug: "ladders-tapes-utility", itemCount: 4 },
    ],
  }),
  makeCategory(19, {
    id: "cat_waterproofing",
    catId: 18,
    slug: "waterproofing-repairing",
    name: "Waterproofing & Repairing",
    nameHi: "वॉटरप्रूफिंग और मरम्मत",
    department: "Civil & Interiors",
    dbCategory: "adhesives",
    route: "/categories?cat=waterproofing-repairing",
    imageUrl: "/images/home-categories/waterproofing-repairing.webp",
    badge: "Site Tested",
    badgeColor: "#0EA5E9",
    defaultHsn: "38244090",
    defaultGstRate: 18,
    vehicleType: "BIKE",
    subcategories: [
      { name: "Integral Liquid Waterproofing", slug: "integral-waterproofing", itemCount: 12 },
      { name: "Polymer Bonding Agents (URP)", slug: "bonding-agents", itemCount: 14 },
      { name: "Elastomeric Terrace Coatings", slug: "terrace-coatings", itemCount: 10 },
      { name: "Crack Sealants & Putty", slug: "crack-sealants", itemCount: 16 },
      { name: "Damp-Proof Surface Barriers", slug: "damp-proof-barriers", itemCount: 8 },
    ],
  }),
  makeCategory(20, {
    id: "cat_bricks_sand_gitti",
    catId: 19,
    slug: "bricks-sand-gitti-aac",
    name: "Bricks, Sand (Morang), Gitti & AAC Blocks",
    nameHi: "ईंट, मौरंग, गिट्टी और ए.ए.सी. ब्लॉक",
    department: "Civil & Structural",
    dbCategory: "bricks",
    route: "/collections/bricks-sand-gitti-aac",
    imageUrl: "/images/home-categories/eeta.webp",
    badge: "Bhatta & Crusher Direct",
    badgeColor: "#F2B705",
    defaultHsn: "69041000",
    defaultGstRate: 5,
    vehicleType: "LOADER",
    subcategories: [
      { name: "Red Clay & Fly Ash Bricks", slug: "red-clay-fly-ash-bricks", itemCount: 6 },
      { name: "AAC & Concrete Blocks", slug: "aac-concrete-blocks", itemCount: 15 },
      { name: "Sand, Morang & Stone Dust", slug: "sand-morang-stone-dust", itemCount: 7 },
      { name: "Stone Aggregates (Gitti)", slug: "stone-aggregates-gitti", itemCount: 6 },
      { name: "Paver Blocks & Concrete Cover Blocks", slug: "paver-blocks-cover-blocks", itemCount: 3 },
    ],
  }),
];

const SLUG_MIGRATIONS: Record<string, string> = {
  "power-tools-safety": "tools-hardware",
  "safety-workwear": "safety-ppe-workwear",
};

function sanitizeSlug(raw: string): string {
  return (
    (raw || "category")
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "category"
  );
}

export function withCacheBuster(url: string, versionTag?: string | number): string {
  if (!url || typeof url !== "string") return "";
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;
  if (!url.startsWith("/uploads/") && !url.startsWith("/images/")) return url;
  const tag = versionTag
    ? typeof versionTag === "number"
      ? String(versionTag)
      : String(Date.parse(versionTag) || Date.now())
    : String(Date.now());
  const base = url.split("?")[0];
  return `${base}?v=${tag}`;
}

function decodeDataUrl(dataUrl: string): { buffer: Buffer; mime: string } | null {
  const match = /^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return {
    mime: match[1].toLowerCase(),
    buffer: Buffer.from(match[2], "base64"),
  };
}

export async function saveCategoryImageBuffer(
  slug: string,
  inputBuffer: Buffer
): Promise<{ url: string; rawPath: string; filename: string; mimeType: string; sizeBytes: number }> {
  const cleanSlug = sanitizeSlug(slug || "category");
  return processAndSaveUploadedImage({
    buffer: inputBuffer,
    dir: CATEGORIES_UPLOADS_DIR,
    publicPrefix: "/uploads/categories",
    prefixSlug: `cat-${cleanSlug}`,
    maxWidth: 900,
    maxHeight: 900,
  });
}

async function normalizeImageInput(slug: string, rawUrl?: string): Promise<string> {
  if (!rawUrl || !rawUrl.trim()) {
    return "/images/home-categories/cement-civil-works.webp";
  }
  const trimmed = stripLocalhostPrefix(rawUrl.trim());
  if (trimmed.startsWith("data:image/")) {
    const parsed = decodeDataUrl(trimmed);
    if (parsed) {
      const saved = await saveCategoryImageBuffer(slug, parsed.buffer);
      return saved.url;
    }
  }
  return trimmed;
}

class CategoryStore {
  private categories: MasterCategoryRecord[] = [];
  private loaded = false;
  private dbMigrated = false;

  private ensureLoadedSync() {
    if (this.loaded) return;
    this.loaded = true;

    let diskRecords: MasterCategoryRecord[] = [];
    try {
      if (fs.existsSync(CATEGORIES_STORE_PATH)) {
        const raw = JSON.parse(fs.readFileSync(CATEGORIES_STORE_PATH, "utf-8"));
        if (Array.isArray(raw)) {
          diskRecords = raw;
        }
      }
    } catch (err) {
      logger.warn({ err }, "[CategoryStore] Failed reading disk categories JSON; resetting to canonical seed");
    }

    if (diskRecords.length > 0) {
      this.categories = this.reconcileRecords(diskRecords);
    } else {
      this.categories = CANONICAL_DEFAULT_CATEGORIES.map((c) => ({ ...c }));
    }
    this.persistDiskSync();
  }

  private reconcileRecords(records: MasterCategoryRecord[]): MasterCategoryRecord[] {
    const bySlug = new Map<string, MasterCategoryRecord>();
    const canonicalBySlug = new Map(CANONICAL_DEFAULT_CATEGORIES.map((c) => [c.slug, c]));

    for (const raw of records) {
      if (!raw || !raw.slug) continue;
      const mappedSlug = SLUG_MIGRATIONS[raw.slug] || sanitizeSlug(raw.slug);
      // Avoid stale legacy slug overwriting canonical record if canonical is already present
      if (mappedSlug !== raw.slug && records.some((r) => r.slug === mappedSlug)) {
        continue;
      }
      const canonical = canonicalBySlug.get(mappedSlug);
      let img = raw.imageUrl || raw.image || canonical?.imageUrl || "/images/home-categories/cement-civil-works.webp";
      if (
        mappedSlug === "rmc-ready-mix-concrete" &&
        img.split("?")[0] === "/images/home-categories/cement-civil-works.webp"
      ) {
        img = "/images/home-categories/rmc-ready-mix-concrete.webp";
      }
      if (
        mappedSlug === "solar-rooftop-power" &&
        img.split("?")[0] === "/images/home-categories/cement-civil-works.webp"
      ) {
        img = "/images/home-categories/solar-rooftop-power.webp";
      }

      const name = (raw.name || raw.title || canonical?.name || mappedSlug).trim();
      const nameHi = (raw.nameHi || raw.titleHi || canonical?.nameHi)?.trim() || undefined;
      const order = Number(raw.displayOrder ?? raw.sortOrder ?? canonical?.displayOrder ?? 50);
      const gst = Number(raw.defaultGstRate ?? raw.defaultGst ?? canonical?.defaultGstRate ?? 18);
      const vType = raw.vehicleType === "BIKE" || raw.vehicleType === "LOADER"
        ? raw.vehicleType
        : canonical?.vehicleType || "LOADER";

      const isStaleLightingSubcats =
        mappedSlug === "lighting" &&
        Array.isArray(raw.subcategories) &&
        (raw.subcategories.some((s: any) => s?.slug === "cob-spotlights" || s?.slug === "strip-lights") ||
          (raw.subcategories.find((s: any) => s?.slug === "strip-profiles-drivers")?.itemCount ?? 0) < 7);

      const isStaleSolarSubcats =
        mappedSlug === "solar-rooftop-power" &&
        Array.isArray(raw.subcategories) &&
        (raw.subcategories.find((s: any) => s?.slug === "rooftop-solar-kits")?.itemCount ?? 0) < 7;

      const isStaleToolsSubcats =
        mappedSlug === "tools-hardware" &&
        Array.isArray(raw.subcategories) &&
        (raw.subcategories.some((s: any) => s?.slug === "impact-drills") || raw.route !== "/collections/tools-hardware");

      const resolvedRoute =
        mappedSlug === "lighting" && raw.route === "/categories?cat=lighting"
          ? canonical?.route || "/collections/lighting"
          : mappedSlug === "tools-hardware" && raw.route === "/categories?cat=tools-hardware"
          ? canonical?.route || "/collections/tools-hardware"
          : raw.route || canonical?.route || `/categories?cat=${mappedSlug}`;

      const merged: MasterCategoryRecord = {
        ...(canonical || {}),
        ...raw,
        id: raw.id || canonical?.id || `cat_${mappedSlug}`,
        catId: Number(raw.catId ?? canonical?.catId ?? order),
        slug: mappedSlug,
        name: mappedSlug === "lighting" && name === "Lighting" ? canonical?.name || name : name,
        nameHi,
        title: mappedSlug === "lighting" && name === "Lighting" ? canonical?.name || name : name,
        titleHi: nameHi,
        department: raw.department || canonical?.department || "Construction Materials",
        dbCategory: raw.dbCategory || canonical?.dbCategory || mappedSlug,
        route: resolvedRoute,
        imageUrl: img,
        image: img,
        badge: raw.badge !== undefined ? raw.badge || undefined : canonical?.badge,
        badgeColor: raw.badgeColor !== undefined ? raw.badgeColor || undefined : canonical?.badgeColor,
        categoryType: raw.categoryType || canonical?.categoryType || "MATERIAL",
        defaultHsn: raw.defaultHsn || canonical?.defaultHsn || "38245010",
        defaultGstRate: gst,
        defaultGst: gst,
        vehicleType: vType,
        vehicleClass:
          raw.vehicleClass ||
          canonical?.vehicleClass ||
          (vType === "BIKE" ? "Delivery Bike (<=30kg)" : "Chhota Hathi (1.5T Loader)"),
        displayOrder: order,
        sortOrder: order,
        isActive: raw.isActive !== false,
        productCount: Number(raw.productCount ?? 0),
        subcategories:
          !isStaleLightingSubcats &&
          !isStaleSolarSubcats &&
          !isStaleToolsSubcats &&
          Array.isArray(raw.subcategories) &&
          raw.subcategories.length > 0
            ? raw.subcategories
            : canonical?.subcategories || [],
        createdAt: raw.createdAt || DEFAULT_BOOT_TIME,
        updatedAt: raw.updatedAt || DEFAULT_BOOT_TIME,
      };
      bySlug.set(mappedSlug, merged);
    }

    // Ensure every canonical category exists if missing (e.g., after upgrading from legacy 16 to 20)
    for (const canonical of CANONICAL_DEFAULT_CATEGORIES) {
      if (!bySlug.has(canonical.slug)) {
        bySlug.set(canonical.slug, { ...canonical });
      }
    }

    return Array.from(bySlug.values()).sort(
      (a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name)
    );
  }

  private persistDiskSync() {
    try {
      const dir = path.dirname(CATEGORIES_STORE_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(CATEGORIES_STORE_PATH, JSON.stringify(this.categories, null, 2), "utf-8");
    } catch (err) {
      logger.warn({ err }, "[CategoryStore] Failed writing categories disk store");
    }
  }

  private async ensureDbSchemaAndSeed() {
    if (this.dbMigrated) return;
    this.dbMigrated = true;
    try {
      await query(`
        ALTER TABLE IF EXISTS catalog_categories
          ADD COLUMN IF NOT EXISTS badge VARCHAR(80),
          ADD COLUMN IF NOT EXISTS badge_color VARCHAR(32),
          ADD COLUMN IF NOT EXISTS department VARCHAR(120),
          ADD COLUMN IF NOT EXISTS db_category VARCHAR(80),
          ADD COLUMN IF NOT EXISTS route VARCHAR(240),
          ADD COLUMN IF NOT EXISTS category_type VARCHAR(40) DEFAULT 'MATERIAL',
          ADD COLUMN IF NOT EXISTS default_hsn VARCHAR(30) DEFAULT '38245010',
          ADD COLUMN IF NOT EXISTS vehicle_class VARCHAR(120),
          ADD COLUMN IF NOT EXISTS subcategories JSONB DEFAULT '[]'::jsonb
      `);

      const existing = await query(`SELECT slug FROM catalog_categories LIMIT 5`);
      if (existing && existing.rows && existing.rows.length > 0) {
        // Hydrate from Postgres if Postgres has categories and disk didn't overwrite it recently
        const dbRes = await query(
          `SELECT id, name, name_hi as "nameHi", slug, image_url as "imageUrl",
                  default_gst_rate as "defaultGstRate", vehicle_type as "vehicleType",
                  is_active as "isActive", sort_order as "sortOrder",
                  badge, badge_color as "badgeColor", department,
                  db_category as "dbCategory", route, category_type as "categoryType",
                  default_hsn as "defaultHsn", vehicle_class as "vehicleClass",
                  subcategories, created_at as "createdAt", updated_at as "updatedAt"
           FROM catalog_categories ORDER BY sort_order ASC, name ASC`
        );
        if (dbRes?.rows?.length > 0) {
          this.categories = this.reconcileRecords(dbRes.rows as MasterCategoryRecord[]);
          this.persistDiskSync();
        }
      } else {
        for (const cat of this.categories) {
          await this.upsertPostgres(cat);
        }
      }
    } catch {
      // Postgres offline -> JSON disk store remains full source of truth
    }
  }

  private async upsertPostgres(cat: MasterCategoryRecord) {
    try {
      await query(
        `INSERT INTO catalog_categories (
           id, name, name_hi, slug, image_url, default_gst_rate, vehicle_type,
           is_active, sort_order, badge, badge_color, department, db_category,
           route, category_type, default_hsn, vehicle_class, subcategories, updated_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7,
           $8, $9, $10, $11, $12, $13,
           $14, $15, $16, $17, $18::jsonb, NOW()
         )
         ON CONFLICT (slug) DO UPDATE SET
           name = EXCLUDED.name,
           name_hi = EXCLUDED.name_hi,
           image_url = EXCLUDED.image_url,
           default_gst_rate = EXCLUDED.default_gst_rate,
           vehicle_type = EXCLUDED.vehicle_type,
           is_active = EXCLUDED.is_active,
           sort_order = EXCLUDED.sort_order,
           badge = EXCLUDED.badge,
           badge_color = EXCLUDED.badge_color,
           department = EXCLUDED.department,
           db_category = EXCLUDED.db_category,
           route = EXCLUDED.route,
           category_type = EXCLUDED.category_type,
           default_hsn = EXCLUDED.default_hsn,
           vehicle_class = EXCLUDED.vehicle_class,
           subcategories = EXCLUDED.subcategories,
           updated_at = NOW()`,
        [
          cat.id,
          cat.name,
          cat.nameHi || null,
          cat.slug,
          cat.imageUrl,
          cat.defaultGstRate,
          cat.vehicleType,
          cat.isActive,
          cat.displayOrder,
          cat.badge || null,
          cat.badgeColor || null,
          cat.department,
          cat.dbCategory,
          cat.route,
          cat.categoryType,
          cat.defaultHsn,
          cat.vehicleClass,
          JSON.stringify(cat.subcategories || []),
        ]
      );
    } catch {
      // Ignore if Postgres offline
    }
  }

  private enrichProductCounts(
    cats: MasterCategoryRecord[],
    extraProducts: Array<{ categorySlug?: string }> = []
  ): MasterCategoryRecord[] {
    const counts = new Map<string, number>();

    for (const p of CATALOG_PRODUCTS as Array<{ categorySlug?: string }>) {
      const slug = p?.categorySlug;
      if (slug) counts.set(slug, (counts.get(slug) || 0) + 1);
    }
    for (const p of extraProducts) {
      const slug = p?.categorySlug;
      if (slug) counts.set(slug, (counts.get(slug) || 0) + 1);
    }

    return cats.map((c) => {
      const subCount = (c.subcategories || []).reduce((sum, s) => sum + (Number(s.itemCount) || 0), 0);
      const exactCatalogCount = counts.get(c.slug) || 0;
      const computedCount = exactCatalogCount > 0 ? exactCatalogCount : subCount;
      const freshImage = withCacheBuster(c.imageUrl || c.image, c.updatedAt);
      return {
        ...c,
        imageUrl: freshImage,
        image: freshImage,
        productCount: computedCount,
      };
    });
  }

  async list(options?: {
    activeOnly?: boolean;
    extraProducts?: Array<{ categorySlug?: string }>;
  }): Promise<MasterCategoryRecord[]> {
    this.ensureLoadedSync();
    await this.ensureDbSchemaAndSeed();

    const sorted = [...this.categories].sort(
      (a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name)
    );
    const filtered = options?.activeOnly ? sorted.filter((c) => c.isActive !== false) : sorted;
    return this.enrichProductCounts(filtered, options?.extraProducts || []);
  }

  async getByIdOrSlug(
    idOrSlug: string,
    extraProducts: Array<{ categorySlug?: string }> = []
  ): Promise<MasterCategoryRecord | null> {
    const all = await this.list({ activeOnly: false, extraProducts });
    return all.find((c) => c.id === idOrSlug || c.slug === idOrSlug) || null;
  }

  async create(payload: Record<string, any>): Promise<MasterCategoryRecord> {
    this.ensureLoadedSync();
    await this.ensureDbSchemaAndSeed();

    const rawName = String(payload.name || payload.title || "").trim();
    if (!rawName) {
      throw new Error("Category name/title is required");
    }
    const cleanSlug = sanitizeSlug(String(payload.slug || rawName));
    const existing = this.categories.find((c) => c.slug === cleanSlug || (payload.id && c.id === payload.id));
    if (existing) {
      return this.update(existing.id, payload);
    }

    const now = new Date().toISOString();
    const imgUrl = await normalizeImageInput(cleanSlug, payload.imageUrl || payload.image);
    const gst = Number(payload.defaultGstRate ?? payload.defaultGst ?? 18);
    const vType: "BIKE" | "LOADER" =
      payload.vehicleType === "BIKE" ? "BIKE" : "LOADER";
    const order = Number(
      payload.displayOrder ?? payload.sortOrder ?? this.categories.length + 1
    );

    const record: MasterCategoryRecord = {
      id: payload.id || `cat_${Date.now()}_${crypto.randomBytes(2).toString("hex")}`,
      catId: Number(payload.catId ?? this.categories.length + 100),
      slug: cleanSlug,
      name: rawName,
      nameHi: (payload.nameHi ?? payload.titleHi)?.trim() || undefined,
      title: rawName,
      titleHi: (payload.nameHi ?? payload.titleHi)?.trim() || undefined,
      department: String(payload.department || "Construction Materials").trim(),
      dbCategory: String(payload.dbCategory || cleanSlug).trim(),
      route: String(payload.route || `/categories?cat=${cleanSlug}`).trim(),
      imageUrl: imgUrl,
      image: imgUrl,
      badge: payload.badge ? String(payload.badge).trim() : undefined,
      badgeColor: payload.badgeColor ? String(payload.badgeColor).trim() : undefined,
      categoryType: (payload.categoryType as any) || "MATERIAL",
      defaultHsn: String(payload.defaultHsn || "38245010").trim(),
      defaultGstRate: gst,
      defaultGst: gst,
      vehicleType: vType,
      vehicleClass:
        String(
          payload.vehicleClass ||
            (vType === "BIKE" ? "Delivery Bike (<=30kg)" : "Chhota Hathi (1.5T Loader)")
        ),
      displayOrder: order,
      sortOrder: order,
      isActive: payload.isActive !== false && payload.isActive !== "false",
      productCount: 0,
      subcategories: Array.isArray(payload.subcategories) ? payload.subcategories : [],
      createdAt: now,
      updatedAt: now,
    };

    this.categories.push(record);
    this.categories.sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
    this.persistDiskSync();
    await this.upsertPostgres(record);
    return this.enrichProductCounts([record])[0];
  }

  async update(idOrSlug: string, payload: Record<string, any>): Promise<MasterCategoryRecord> {
    this.ensureLoadedSync();
    await this.ensureDbSchemaAndSeed();

    const idx = this.categories.findIndex((c) => c.id === idOrSlug || c.slug === idOrSlug);
    if (idx === -1) {
      throw new Error(`Category not found: ${idOrSlug}`);
    }

    const current = this.categories[idx];
    const nextName =
      payload.name !== undefined || payload.title !== undefined
        ? String(payload.name ?? payload.title).trim() || current.name
        : current.name;
    const nextNameHiRaw =
      payload.nameHi !== undefined || payload.titleHi !== undefined
        ? String(payload.nameHi ?? payload.titleHi ?? "").trim()
        : current.nameHi;
    const nextNameHi = nextNameHiRaw || undefined;

    const nextSlug =
      payload.slug !== undefined && String(payload.slug).trim()
        ? sanitizeSlug(String(payload.slug))
        : current.slug;

    const rawImg = payload.imageUrl !== undefined ? payload.imageUrl : payload.image;
    const nextImage =
      rawImg !== undefined ? await normalizeImageInput(nextSlug, rawImg) : current.imageUrl;

    const nextOrder =
      payload.displayOrder !== undefined || payload.sortOrder !== undefined
        ? Number(payload.displayOrder ?? payload.sortOrder)
        : current.displayOrder;

    const nextGst =
      payload.defaultGstRate !== undefined || payload.defaultGst !== undefined
        ? Number(payload.defaultGstRate ?? payload.defaultGst)
        : current.defaultGstRate;

    const nextVehicleType: "BIKE" | "LOADER" =
      payload.vehicleType !== undefined
        ? payload.vehicleType === "BIKE"
          ? "BIKE"
          : "LOADER"
        : current.vehicleType;

    const nextIsActive =
      payload.isActive !== undefined
        ? payload.isActive === true || payload.isActive === "true"
        : current.isActive;

    const nextBadge =
      payload.badge !== undefined
        ? String(payload.badge || "").trim() || undefined
        : current.badge;
    const nextBadgeColor =
      payload.badgeColor !== undefined
        ? String(payload.badgeColor || "").trim() || undefined
        : current.badgeColor;

    const now = new Date().toISOString();
    const updated: MasterCategoryRecord = {
      ...current,
      slug: nextSlug,
      name: nextName,
      nameHi: nextNameHi,
      title: nextName,
      titleHi: nextNameHi,
      department: payload.department !== undefined ? String(payload.department).trim() || current.department : current.department,
      dbCategory: payload.dbCategory !== undefined ? String(payload.dbCategory).trim() || current.dbCategory : current.dbCategory,
      route: payload.route !== undefined ? String(payload.route).trim() || current.route : current.route,
      imageUrl: nextImage,
      image: nextImage,
      badge: nextBadge,
      badgeColor: nextBadgeColor,
      categoryType: payload.categoryType || current.categoryType,
      defaultHsn: payload.defaultHsn !== undefined ? String(payload.defaultHsn).trim() : current.defaultHsn,
      defaultGstRate: nextGst,
      defaultGst: nextGst,
      vehicleType: nextVehicleType,
      vehicleClass:
        payload.vehicleClass !== undefined ? String(payload.vehicleClass) : current.vehicleClass,
      displayOrder: nextOrder,
      sortOrder: nextOrder,
      isActive: nextIsActive,
      subcategories: Array.isArray(payload.subcategories)
        ? payload.subcategories
        : current.subcategories,
      updatedAt: now,
    };

    this.categories[idx] = updated;
    this.categories.sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
    this.persistDiskSync();
    await this.upsertPostgres(updated);
    return this.enrichProductCounts([updated])[0];
  }

  async reorder(items: Array<{ id?: string; slug?: string; displayOrder: number }>): Promise<MasterCategoryRecord[]> {
    this.ensureLoadedSync();
    await this.ensureDbSchemaAndSeed();

    const now = new Date().toISOString();
    for (const item of items) {
      const key = item.id || item.slug;
      if (!key) continue;
      const idx = this.categories.findIndex((c) => c.id === key || c.slug === key);
      if (idx !== -1) {
        const ord = Number(item.displayOrder);
        this.categories[idx] = {
          ...this.categories[idx],
          displayOrder: ord,
          sortOrder: ord,
          updatedAt: now,
        };
        await this.upsertPostgres(this.categories[idx]);
      }
    }
    this.categories.sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
    this.persistDiskSync();
    return this.list();
  }
}

export const categoryStore = new CategoryStore();
