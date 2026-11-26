import { Router, type IRouter, type Request, type Response } from "express";
import { query } from "@workspace/db";
import { getIo, adminRoom } from "../socket";
import { ecosystemEngine } from "../services/ecosystemEngine";
import { servicesRentalsEngine } from "../services/servicesRentalsEngine";
import { requireAdmin } from "../middleware/adminAuth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// Apply requireAdmin to /admin prefix
router.use("/admin", requireAdmin);

/* ────────────────────────────────────────────────────────────────────────────
 * MASTER CATALOG INTERFACES & SEED DATA
 * ──────────────────────────────────────────────────────────────────────────── */
export interface AdminMasterCategory {
  id: string;
  name: string;
  nameHi?: string;
  slug: string;
  imageUrl: string;
  defaultGstRate: number; // 5, 12, 18, 28
  vehicleType: "BIKE" | "LOADER";
  isActive: boolean;
  sortOrder: number;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminMasterProduct {
  id: string;
  title: string;
  brand: string;
  categorySlug: string;
  subcategory?: string;
  unit: string;
  mrp: number;
  sellingPrice: number;
  bulkPrice: number;
  bulkMinQty: number;
  hsnCode: string;
  gstRate: number; // 5, 12, 18, 28
  vehicleRequirement: "BIKE" | "LOADER";
  imageUrl: string;
  description: string;
  specTags: Array<{ label: string; value: string }>;
  isInStock: boolean;
  adminLocked: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Initial In-Memory Fallback Seed Categories (Lucknow Real Categories)
let memoryCategories: AdminMasterCategory[] = [
  {
    id: "cat_cement_civil",
    name: "Cement & Civil Works",
    nameHi: "सीमेंट और सिविल कार्य",
    slug: "cement-civil-works",
    imageUrl: "/images/home-categories/cement-civil-works.webp",
    defaultGstRate: 28,
    vehicleType: "LOADER",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "cat_cpvc_plumbing",
    name: "CPVC Plumbing & Overhead Tanks",
    nameHi: "सी.पी.वी.सी. प्लंबिंग और पानी की टंकियां",
    slug: "cpvc-plumbing-tanks",
    imageUrl: "/images/home-categories/cpvc-plumbing-tanks.webp",
    defaultGstRate: 18,
    vehicleType: "LOADER",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "cat_plywood_boards",
    name: "Plywood & Boards",
    nameHi: "प्लाईवुड और बोर्ड्स",
    slug: "plywood-boards",
    imageUrl: "/images/home-categories/plywood-boards.webp",
    defaultGstRate: 18,
    vehicleType: "LOADER",
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "cat_painting",
    name: "Painting, Putty & Primers",
    nameHi: "पेंटिंग, पुट्टी और प्राइमर",
    slug: "painting",
    imageUrl: "/images/home-categories/painting.webp",
    defaultGstRate: 18,
    vehicleType: "LOADER",
    isActive: true,
    sortOrder: 4,
  },
  {
    id: "cat_fevicol_adhesives",
    name: "Fevicol, Adhesives & Sealants",
    nameHi: "फेविकोल, चिपकने वाले पदार्थ और सीलेंट",
    slug: "fevicol-adhesives-sealants",
    imageUrl: "/images/home-categories/fevicol-adhesives-sealants.webp",
    defaultGstRate: 18,
    vehicleType: "BIKE",
    isActive: true,
    sortOrder: 5,
  },
  {
    id: "cat_wires_electrical",
    name: "Wires, MCB & Electrical Supplies",
    nameHi: "तार, एम.सी.बी. और बिजली के सामान",
    slug: "wires-mcb-electrical",
    imageUrl: "/images/home-categories/wires-mcb-electrical.webp",
    defaultGstRate: 18,
    vehicleType: "BIKE",
    isActive: true,
    sortOrder: 6,
  },
  {
    id: "cat_tile_stone",
    name: "Tiles, Marble & Granite",
    nameHi: "टाइल्स, मार्बल और ग्रेनाइट",
    slug: "tile-stone-installation",
    imageUrl: "/images/home-categories/tile-stone-installation.webp",
    defaultGstRate: 18,
    vehicleType: "LOADER",
    isActive: true,
    sortOrder: 7,
  },
  {
    id: "cat_power_tools",
    name: "Power Tools, Hand Tools & Site Safety",
    nameHi: "पावर टूल्स, हाथ के औजार और साइट सुरक्षा",
    slug: "power-tools-safety",
    imageUrl: "/images/home-categories/power-tools-safety.webp",
    defaultGstRate: 18,
    vehicleType: "BIKE",
    isActive: true,
    sortOrder: 8,
  },
  {
    id: "cat_waterproofing",
    name: "Waterproofing & Repairing",
    nameHi: "वॉटरप्रूफिंग और मरम्मत",
    slug: "waterproofing-repairing",
    imageUrl: "/images/home-categories/waterproofing-repairing.webp",
    defaultGstRate: 18,
    vehicleType: "BIKE",
    isActive: true,
    sortOrder: 9,
  },
  {
    id: "cat_sanitary_bath",
    name: "Sanitary & Bath Fittings",
    nameHi: "सैनिटरी और बाथ फिटिंग",
    slug: "sanitary-bath-fittings",
    imageUrl: "/images/home-categories/sanitary-bath-fittings.webp",
    defaultGstRate: 18,
    vehicleType: "LOADER",
    isActive: true,
    sortOrder: 10,
  },
  {
    id: "cat_door_hardware",
    name: "Door Hardware & Locks",
    nameHi: "दरवाजे के हार्डवेयर और ताले",
    slug: "door-hardware-locks",
    imageUrl: "/images/home-categories/door-hardware-locks.webp",
    defaultGstRate: 18,
    vehicleType: "BIKE",
    isActive: true,
    sortOrder: 11,
  },
  {
    id: "cat_modular_kitchen",
    name: "Modular Kitchen Systems & Fittings",
    nameHi: "मॉड्यूलर किचन सिस्टम और फिटिंग्स",
    slug: "modular-kitchen-systems",
    imageUrl: "/images/home-categories/modular-kitchen-systems.webp",
    defaultGstRate: 18,
    vehicleType: "LOADER",
    isActive: true,
    sortOrder: 12,
  },
  {
    id: "cat_cctv_networking",
    name: "CCTV & Networking",
    nameHi: "सी.सी.टी.वी. और नेटवर्किंग",
    slug: "cctv-networking",
    imageUrl: "/images/home-categories/cctv-networking.webp",
    defaultGstRate: 18,
    vehicleType: "BIKE",
    isActive: true,
    sortOrder: 13,
  },
  {
    id: "cat_kitchen_sinks",
    name: "Kitchen Sinks & Faucets",
    nameHi: "किचन सिंक और नल",
    slug: "kitchen-sinks-faucets",
    imageUrl: "/images/home-categories/kitchen-sinks-faucets.webp",
    defaultGstRate: 18,
    vehicleType: "LOADER",
    isActive: true,
    sortOrder: 14,
  },
  {
    id: "cat_furniture_hardware",
    name: "Furniture, Wardrobe & Bed Hardware",
    nameHi: "फर्नीचर, अलमारी और बेड हार्डवेयर",
    slug: "furniture-wardrobe-bed-hardware",
    imageUrl: "/images/home-categories/furniture-wardrobe-bed-hardware.webp",
    defaultGstRate: 18,
    vehicleType: "BIKE",
    isActive: true,
    sortOrder: 15,
  },
  {
    id: "cat_lighting",
    name: "Lighting & Luminaires",
    nameHi: "लाइटिंग और फिक्स्चर",
    slug: "lighting",
    imageUrl: "/images/home-categories/lighting.webp",
    defaultGstRate: 18,
    vehicleType: "BIKE",
    isActive: true,
    sortOrder: 16,
  },
];

// Initial In-Memory Fallback Seed Products with 8-digit HSN & civil specs
let memoryProducts: AdminMasterProduct[] = [
  {
    id: "mp_ultratech_super_50kg",
    title: "UltraTech Super PPC Weather-Shield Cement 50kg",
    brand: "UltraTech",
    categorySlug: "cement-civil-works",
    subcategory: "PPC Cement",
    unit: "Bag (50kg)",
    mrp: 410,
    sellingPrice: 385,
    bulkPrice: 365,
    bulkMinQty: 50,
    hsnCode: "25232910",
    gstRate: 28,
    vehicleRequirement: "LOADER",
    imageUrl: "/images/products/cement/ultratech-super-50kg.webp",
    description: "Premium Portland Pozzolana Cement with micro-fine particles providing damp-lock resistance and high early compressive strength for slab casting and masonry.",
    specTags: [
      { label: "Grade", value: "PPC Weather-Shield" },
      { label: "Standard", value: "IS 1489 (Part 1)" },
      { label: "Initial Setting Time", value: "30 Mins" },
      { label: "Final Setting Time", value: "280 Mins" },
    ],
    isInStock: true,
    adminLocked: true,
  },
  {
    id: "mp_tata_tiscon_550d_12mm",
    title: "Tata Tiscon 550D High Ductility TMT Rebar 12mm",
    brand: "Tata Steel",
    categorySlug: "cement-civil-works",
    subcategory: "TMT Rebars",
    unit: "Piece (12m)",
    mrp: 890,
    sellingPrice: 830,
    bulkPrice: 795,
    bulkMinQty: 40,
    hsnCode: "72142090",
    gstRate: 18,
    vehicleRequirement: "LOADER",
    imageUrl: "/images/products/cement/tata-tiscon-550d.webp",
    description: "Super-ductile Fe 550D grade earthquake-resistant primary TMT steel bar manufactured via automated hot-charging process for columns, beams, and foundations.",
    specTags: [
      { label: "Steel Grade", value: "Fe 550D Super Ductile" },
      { label: "Diameter", value: "12mm" },
      { label: "Length", value: "12 Meters (Standard)" },
      { label: "Standard", value: "IS 1786:2008" },
    ],
    isInStock: true,
    adminLocked: true,
  },
  {
    id: "mp_astral_cpvc_pipe_1inch",
    title: "Astral CPVC Pro SDR 11 Hot & Cold Water Pipe 1 Inch (3m)",
    brand: "Astral",
    categorySlug: "cpvc-plumbing-tanks",
    subcategory: "CPVC Pipes",
    unit: "Pipe (3m)",
    mrp: 380,
    sellingPrice: 320,
    bulkPrice: 295,
    bulkMinQty: 25,
    hsnCode: "39172390",
    gstRate: 18,
    vehicleRequirement: "LOADER",
    imageUrl: "/images/products/plumbing/astral-cpvc-pipe-1inch.webp",
    description: "NSF-61 certified chlorinated polyvinyl chloride pipe engineered for hot and cold potable water up to 93°C with zero scaling and lead-free formulation.",
    specTags: [
      { label: "Pressure Class", value: "SDR 11 Class 1" },
      { label: "Nominal Size", value: "1 Inch (25mm)" },
      { label: "Max Temp", value: "93°C Continuous" },
      { label: "Standard", value: "ASTM D2846 / IS 15778" },
    ],
    isInStock: true,
    adminLocked: true,
  },
  {
    id: "mp_asian_royale_luxury_20l",
    title: "Asian Paints Royale Luxury Interior Emulsion 20L",
    brand: "Asian Paints",
    categorySlug: "painting",
    subcategory: "Interior Paints",
    unit: "20L Bucket",
    mrp: 9435,
    sellingPrice: 8499,
    bulkPrice: 8100,
    bulkMinQty: 4,
    hsnCode: "32091090",
    gstRate: 18,
    vehicleRequirement: "LOADER",
    imageUrl: "/images/hero/asianpaints-bucket.webp",
    description: "Ultra-luxury water-based interior emulsion with Teflon surface protector, providing high sheen, anti-bacterial protection, and 100% stain wipeability.",
    specTags: [
      { label: "Finish", value: "Soft Sheen" },
      { label: "Coverage", value: "280 - 300 sq.ft/L (2 coats)" },
      { label: "Tech", value: "Teflon Surface Protector" },
      { label: "Warranty", value: "5 Years Performance" },
    ],
    isInStock: true,
    adminLocked: true,
  },
  {
    id: "mp_century_marine_710_plywood",
    title: "CenturyPly Sainik 710 BWP Marine Grade Plywood 19mm (8x4 ft)",
    brand: "CenturyPly",
    categorySlug: "plywood-boards",
    subcategory: "BWP Marine Plywood",
    unit: "Sheet (8x4 ft)",
    mrp: 3200,
    sellingPrice: 2850,
    bulkPrice: 2700,
    bulkMinQty: 10,
    hsnCode: "44123390",
    gstRate: 18,
    vehicleRequirement: "LOADER",
    imageUrl: "/images/home-categories/plywood-boards.webp",
    description: "Boiling Water Proof (BWP) 710 grade marine plywood with GLP (Glue Line Protection) technology, resistant to borer, fungus, and extreme humidity for modular kitchens and wardrobes.",
    specTags: [
      { label: "Thickness", value: "19mm" },
      { label: "Dimensions", value: "8ft x 4ft (32 sq.ft)" },
      { label: "Grade", value: "IS 710 Marine BWP" },
      { label: "Warranty", value: "8 Years Warranty" },
    ],
    isInStock: true,
    adminLocked: true,
  },
  {
    id: "mp_fevicol_marine_50kg",
    title: "Pidilite Fevicol Marine Waterproof Wood Adhesive 50kg Drum",
    brand: "Pidilite Fevicol",
    categorySlug: "fevicol-adhesives-sealants",
    subcategory: "Wood Adhesives",
    unit: "50kg Drum",
    mrp: 10500,
    sellingPrice: 9650,
    bulkPrice: 9200,
    bulkMinQty: 2,
    hsnCode: "35069190",
    gstRate: 18,
    vehicleRequirement: "LOADER",
    imageUrl: "/images/home-categories/fevicol-adhesives-sealants.webp",
    description: "Specialized synthetic resin adhesive offering 48 hours boiling water resistance and 5 days continuous cold water resistance for marine plywood and laminate pasting.",
    specTags: [
      { label: "Bond Strength", value: "Heavy Duty Marine" },
      { label: "Water Resistance", value: "48 hrs Boiling Water Proof" },
      { label: "Curing Time", value: "4 to 6 Hours" },
      { label: "Standard", value: "IS 4835 Specification" },
    ],
    isInStock: true,
    adminLocked: true,
  },
  {
    id: "mp_havells_lifeline_plus_wire_2_5sqmm",
    title: "Havells Life Line Plus S3 HRFR Wire 2.5 sq.mm Red (90m)",
    brand: "Havells",
    categorySlug: "wires-mcb-electrical",
    subcategory: "FR House Wires",
    unit: "Roll (90m)",
    mrp: 3450,
    sellingPrice: 2890,
    bulkPrice: 2750,
    bulkMinQty: 10,
    hsnCode: "85444999",
    gstRate: 18,
    vehicleRequirement: "BIKE",
    imageUrl: "/images/home-categories/wires-mcb-electrical.webp",
    description: "100% electrolyte grade annealed pure copper wire with triple layer HRFR insulation, 105°C thermal rating, and zero toxic halogen gas emission during electrical short-circuits.",
    specTags: [
      { label: "Conductor Size", value: "2.5 sq.mm (Class 2 Stranded)" },
      { label: "Length", value: "90 Meters" },
      { label: "Insulation", value: "Triple Layer HRFR PVC" },
      { label: "Standard", value: "IS 694 Certified" },
    ],
    isInStock: true,
    adminLocked: true,
  },
  {
    id: "mp_bosch_professional_hammer_drill",
    title: "Bosch Professional GBH 2-26 DRE Rotary Hammer Drill 800W",
    brand: "Bosch",
    categorySlug: "power-tools-safety",
    subcategory: "Rotary Hammers",
    unit: "Kit Box",
    mrp: 9800,
    sellingPrice: 8250,
    bulkPrice: 7900,
    bulkMinQty: 2,
    hsnCode: "84672100",
    gstRate: 18,
    vehicleRequirement: "BIKE",
    imageUrl: "/images/home-categories/power-tools-safety.webp",
    description: "Heavy duty 800-watt SDS-plus professional hammer drill delivering 2.7 Joules impact energy for continuous concrete drilling and channelling up to 26mm diameter.",
    specTags: [
      { label: "Power Rating", value: "800 Watts" },
      { label: "Impact Rate", value: "0 - 4000 bpm" },
      { label: "Tool Holder", value: "SDS-Plus Quick Change" },
      { label: "Drilling Dia Concrete", value: "26 mm Max" },
    ],
    isInStock: true,
    adminLocked: true,
  },
];

/* ────────────────────────────────────────────────────────────────────────────
 * COMPANY LETTERHEAD & GST CONFIGURATION
 * ──────────────────────────────────────────────────────────────────────────── */
export interface CompanyGstSettings {
  companyName: string;
  brandTradeName: string;
  registeredAddress: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  gstin: string;
  pan: string;
  authorizedSignatory: string;
  signatoryDesignation: string;
  contactEmail: string;
  contactPhone: string;
}

let companyGstSettings: CompanyGstSettings = {
  companyName: "CONON INFRABUILT PRIVATE LIMITED",
  brandTradeName: "CONON-NOW Quick Commerce",
  registeredAddress: "Skyline Plaza 3, Sushant Golf City, Sultanpur Road",
  city: "Lucknow",
  state: "Uttar Pradesh",
  stateCode: "09",
  pincode: "226030",
  gstin: "09AABCC1234F1Z5",
  pan: "AABCC1234F",
  authorizedSignatory: "Rohiit Shukla",
  signatoryDesignation: "Founder & Managing Director",
  contactEmail: "founder@conon.in",
  contactPhone: "+91 80040 12345",
};

/* ────────────────────────────────────────────────────────────────────────────
 * AUTO-FILL CIVIL SPECS & HSN HELPER
 * ──────────────────────────────────────────────────────────────────────────── */
export function getAutoCivilSpecs(categorySlug: string, brand?: string, title?: string) {
  const normTitle = (title || "").toLowerCase();
  const normBrand = (brand || "").toLowerCase();

  switch (categorySlug) {
    case "cement-civil-works":
      if (normTitle.includes("tmt") || normTitle.includes("rebar") || normBrand.includes("tata") || normBrand.includes("kamdhenu")) {
        return {
          hsnCode: "72142090",
          gstRate: 18,
          vehicleRequirement: "LOADER" as const,
          unit: "Piece (12m)",
          specTags: [
            { label: "Steel Grade", value: "Fe 550D Super Ductile" },
            { label: "Standard", value: "IS 1786:2008 Certified" },
            { label: "Elongation", value: "14.5% High Ductility" },
            { label: "Anti-Corrosion", value: "Thermo-Mechanically Treated" },
          ],
        };
      }
      if (normTitle.includes("aac") || normTitle.includes("block")) {
        return {
          hsnCode: "68101190",
          gstRate: 12,
          vehicleRequirement: "LOADER" as const,
          unit: "CBM / Piece",
          specTags: [
            { label: "Block Type", value: "Autoclaved Aerated Concrete" },
            { label: "Standard", value: "IS 2185 (Part 3)" },
            { label: "Dry Density", value: "550 - 650 kg/m³" },
            { label: "Compressive Strength", value: "> 4.0 N/mm²" },
          ],
        };
      }
      return {
        hsnCode: "25232910",
        gstRate: 28,
        vehicleRequirement: "LOADER" as const,
        unit: "Bag (50kg)",
        specTags: [
          { label: "Cement Grade", value: "PPC Weather-Shield / OPC 53" },
          { label: "Standard", value: "IS 1489 Part 1 / IS 12269" },
          { label: "Initial Setting Time", value: "30 Minutes" },
          { label: "Package Weight", value: "50 kg HDPE Bag" },
        ],
      };

    case "cpvc-plumbing-tanks":
      return {
        hsnCode: "39172390",
        gstRate: 18,
        vehicleRequirement: "LOADER" as const,
        unit: "Pipe (3m)",
        specTags: [
          { label: "Pressure Class", value: "SDR 11 / SDR 13.5" },
          { label: "Operating Temp", value: "Up to 93°C (Hot & Cold)" },
          { label: "Material", value: "Lead-Free CPVC Compound" },
          { label: "Standard", value: "ASTM D2846 / IS 15778" },
        ],
      };

    case "painting":
      return {
        hsnCode: "32091090",
        gstRate: 18,
        vehicleRequirement: "LOADER" as const,
        unit: "20L Bucket",
        specTags: [
          { label: "Finish", value: "High Sheen Luxury" },
          { label: "Coverage", value: "280 - 320 sq.ft/L (2 coats)" },
          { label: "Washability", value: "100% Scrub Resistant" },
          { label: "VOC Level", value: "< 25 g/L Low Odor" },
        ],
      };

    case "plywood-boards":
      return {
        hsnCode: "44123390",
        gstRate: 18,
        vehicleRequirement: "LOADER" as const,
        unit: "Sheet (8x4 ft)",
        specTags: [
          { label: "Plywood Grade", value: "IS 710 BWP Marine Grade" },
          { label: "Preservative Tech", value: "Glue Line Protection (GLP)" },
          { label: "Sheet Dimensions", value: "8ft x 4ft (32 sq.ft)" },
          { label: "Borer & Termite", value: "100% Chemically Treated" },
        ],
      };

    case "fevicol-adhesives-sealants":
      return {
        hsnCode: "35069190",
        gstRate: 18,
        vehicleRequirement: "BIKE" as const,
        unit: "5kg Bucket",
        specTags: [
          { label: "Adhesive Type", value: "Synthetic Resin Cross-Linking" },
          { label: "Water Resistance", value: "Waterproof / Moisture Proof" },
          { label: "Handling Time", value: "2 - 3 Hours" },
          { label: "Standard", value: "IS 4835 Certified" },
        ],
      };

    case "wires-mcb-electrical":
      return {
        hsnCode: "85444999",
        gstRate: 18,
        vehicleRequirement: "BIKE" as const,
        unit: "Roll (90m)",
        specTags: [
          { label: "Conductor", value: "100% Annealed Electrolytic Copper" },
          { label: "Insulation", value: "Flame Retardant (FR) PVC" },
          { label: "Voltage Grade", value: "1100 Volts" },
          { label: "Standard", value: "IS 694 Certified" },
        ],
      };

    case "power-tools-safety":
      return {
        hsnCode: "84672100",
        gstRate: 18,
        vehicleRequirement: "BIKE" as const,
        unit: "Piece",
        specTags: [
          { label: "Motor Type", value: "Heavy Duty Pure Copper Armature" },
          { label: "Safety Clutch", value: "Mechanical Slip Protection" },
          { label: "Warranty", value: "1 Year Official Brand Warranty" },
        ],
      };

    case "waterproofing-repairing":
      return {
        hsnCode: "38244090",
        gstRate: 18,
        vehicleRequirement: "BIKE" as const,
        unit: "5 Litre",
        specTags: [
          { label: "Polymer Base", value: "Acrylic SBR Copolymer" },
          { label: "Bond Strength", value: "> 1.5 N/mm² to Concrete" },
          { label: "Crack Bridging", value: "Up to 1.5mm Elasticity" },
        ],
      };

    default:
      return {
        hsnCode: "83024110",
        gstRate: 18,
        vehicleRequirement: "BIKE" as const,
        unit: "Piece",
        specTags: [
          { label: "Quality Grade", value: "Commercial Construction Grade" },
          { label: "Corrosion Resistance", value: "Tested Salt Spray 48hrs" },
        ],
      };
  }
}

/* ────────────────────────────────────────────────────────────────────────────
 * CATEGORY ROUTES
 * ──────────────────────────────────────────────────────────────────────────── */
// GET all categories
router.get("/admin/catalog/categories", async (_req: Request, res: Response) => {
  try {
    // Try DB first
    try {
      const dbRes = await query(
        `SELECT id, name, name_hi as "nameHi", slug, image_url as "imageUrl",
                default_gst_rate as "defaultGstRate", vehicle_type as "vehicleType",
                is_active as "isActive", sort_order as "sortOrder",
                created_at as "createdAt", updated_at as "updatedAt"
         FROM catalog_categories ORDER BY sort_order ASC, name ASC`
      );
      if (dbRes && dbRes.rows && dbRes.rows.length > 0) {
        // compute product count per category
        const cats = dbRes.rows.map((c: any) => {
          const count = memoryProducts.filter((p) => p.categorySlug === c.slug).length;
          return { ...c, productCount: count };
        });
        return res.json({ success: true, categories: cats });
      }
    } catch {
      // Postgres table not yet migrated or offline -> use memoryCategories
    }

    // Attach product count to memory categories
    const categoriesWithCount = memoryCategories.map((c) => {
      const count = memoryProducts.filter((p) => p.categorySlug === c.slug).length;
      return { ...c, productCount: count };
    });

    return res.json({ success: true, categories: categoriesWithCount });
  } catch (err: any) {
    logger.error({ err }, "Error fetching admin catalog categories");
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST create new category
router.post("/admin/catalog/categories", async (req: Request, res: Response) => {
  try {
    const { name, nameHi, slug, imageUrl, defaultGstRate, vehicleType, isActive, sortOrder } = req.body;
    if (!name || !slug || !imageUrl) {
      return res.status(400).json({ success: false, error: "name, slug, and imageUrl are required" });
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const newCategory: AdminMasterCategory = {
      id: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      nameHi: nameHi?.trim() || undefined,
      slug: cleanSlug,
      imageUrl,
      defaultGstRate: Number(defaultGstRate) || 18,
      vehicleType: vehicleType === "LOADER" ? "LOADER" : "BIKE",
      isActive: isActive !== false,
      sortOrder: Number(sortOrder) || memoryCategories.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to memory
    memoryCategories.push(newCategory);

    // Try DB insert
    try {
      await query(
        `INSERT INTO catalog_categories (id, name, name_hi, slug, image_url, default_gst_rate, vehicle_type, is_active, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (slug) DO UPDATE SET
           name = EXCLUDED.name,
           name_hi = EXCLUDED.name_hi,
           image_url = EXCLUDED.image_url,
           default_gst_rate = EXCLUDED.default_gst_rate,
           vehicle_type = EXCLUDED.vehicle_type,
           is_active = EXCLUDED.is_active,
           sort_order = EXCLUDED.sort_order,
           updated_at = NOW()`,
        [
          newCategory.id,
          newCategory.name,
          newCategory.nameHi || null,
          newCategory.slug,
          newCategory.imageUrl,
          newCategory.defaultGstRate,
          newCategory.vehicleType,
          newCategory.isActive,
          newCategory.sortOrder,
        ]
      );
    } catch {
      // Ignored for in-memory fallback
    }

    // Broadcast across socket & admin bus
    const io = getIo();
    if (io) {
      io.to(adminRoom()).emit("catalog:category_created", newCategory);
      io.emit("catalog:category_created", newCategory);
    }

    return res.json({ success: true, category: newCategory });
  } catch (err: any) {
    logger.error({ err }, "Error creating catalog category");
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH update category
router.patch("/admin/catalog/categories/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const catIndex = memoryCategories.findIndex((c) => c.id === id || c.slug === id);
    if (catIndex === -1) {
      return res.status(404).json({ success: false, error: "Category not found" });
    }

    const current = memoryCategories[catIndex];
    const updated: AdminMasterCategory = {
      ...current,
      name: req.body.name !== undefined ? req.body.name.trim() : current.name,
      nameHi: req.body.nameHi !== undefined ? req.body.nameHi.trim() : current.nameHi,
      imageUrl: req.body.imageUrl !== undefined ? req.body.imageUrl : current.imageUrl,
      defaultGstRate: req.body.defaultGstRate !== undefined ? Number(req.body.defaultGstRate) : current.defaultGstRate,
      vehicleType: req.body.vehicleType !== undefined ? (req.body.vehicleType === "LOADER" ? "LOADER" : "BIKE") : current.vehicleType,
      isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : current.isActive,
      sortOrder: req.body.sortOrder !== undefined ? Number(req.body.sortOrder) : current.sortOrder,
      updatedAt: new Date().toISOString(),
    };

    memoryCategories[catIndex] = updated;

    try {
      await query(
        `UPDATE catalog_categories SET
           name = $1, name_hi = $2, image_url = $3, default_gst_rate = $4,
           vehicle_type = $5, is_active = $6, sort_order = $7, updated_at = NOW()
         WHERE id = $8 OR slug = $8`,
        [
          updated.name,
          updated.nameHi || null,
          updated.imageUrl,
          updated.defaultGstRate,
          updated.vehicleType,
          updated.isActive,
          updated.sortOrder,
          id,
        ]
      );
    } catch {
      // Ignored
    }

    const io = getIo();
    if (io) {
      io.to(adminRoom()).emit("catalog:category_updated", updated);
      io.emit("catalog:category_updated", updated);
    }

    return res.json({ success: true, category: updated });
  } catch (err: any) {
    logger.error({ err }, "Error updating catalog category");
    return res.status(500).json({ success: false, error: err.message });
  }
});

/* ────────────────────────────────────────────────────────────────────────────
 * PRODUCT ROUTES (MASTER PRODUCT CMS)
 * ──────────────────────────────────────────────────────────────────────────── */
// GET all master products
router.get("/admin/catalog/products", async (req: Request, res: Response) => {
  try {
    const { category, search, locked } = req.query;

    // Try DB first
    let products: AdminMasterProduct[] = [];
    try {
      const dbRes = await query(
        `SELECT id, title, brand, category_slug as "categorySlug", subcategory, unit,
                mrp::float, selling_price::float as "sellingPrice", bulk_price::float as "bulkPrice",
                bulk_min_qty as "bulkMinQty", hsn_code as "hsnCode", gst_rate as "gstRate",
                vehicle_requirement as "vehicleRequirement", image_url as "imageUrl",
                description, spec_tags as "specTags", is_in_stock as "isInStock",
                admin_locked as "adminLocked", created_at as "createdAt", updated_at as "updatedAt"
         FROM master_products ORDER BY updated_at DESC`
      );
      if (dbRes && dbRes.rows && dbRes.rows.length > 0) {
        products = dbRes.rows;
      }
    } catch {
      // DB not populated -> use memoryProducts
    }

    if (products.length === 0) {
      products = [...memoryProducts];
    }

    // Filters
    if (category && typeof category === "string" && category !== "all") {
      products = products.filter((p) => p.categorySlug === category);
    }

    if (search && typeof search === "string" && search.trim()) {
      const term = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.brand.toLowerCase().includes(term) ||
          p.hsnCode.includes(term) ||
          (p.subcategory && p.subcategory.toLowerCase().includes(term))
      );
    }

    if (locked !== undefined) {
      const isLocked = locked === "true";
      products = products.filter((p) => p.adminLocked === isLocked);
    }

    res.json({ success: true, products, total: products.length });
  } catch (err: any) {
    logger.error({ err }, "Error fetching master products");
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET auto-fill helper for civil specs & HSN
router.get("/admin/catalog/auto-fill-specs", (req: Request, res: Response) => {
  const { categorySlug, brand, title } = req.query;
  if (!categorySlug || typeof categorySlug !== "string") {
    return res.status(400).json({ success: false, error: "categorySlug query param required" });
  }

  const suggestion = getAutoCivilSpecs(categorySlug, String(brand || ""), String(title || ""));
  return res.json({ success: true, suggestion });
});

// POST create master product
router.post("/admin/catalog/products", async (req: Request, res: Response) => {
  try {
    const {
      title,
      brand,
      categorySlug,
      subcategory,
      unit,
      mrp,
      sellingPrice,
      bulkPrice,
      bulkMinQty,
      hsnCode,
      gstRate,
      vehicleRequirement,
      imageUrl,
      description,
      specTags,
      isInStock,
      adminLocked,
    } = req.body;

    if (!title || !brand || !categorySlug || !imageUrl) {
      return res.status(400).json({
        success: false,
        error: "title, brand, categorySlug, and imageUrl are required",
      });
    }

    const newProd: AdminMasterProduct = {
      id: `mp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: title.trim(),
      brand: brand.trim(),
      categorySlug: categorySlug.trim(),
      subcategory: subcategory?.trim() || undefined,
      unit: unit?.trim() || "Unit",
      mrp: Number(mrp) || Number(sellingPrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      bulkPrice: Number(bulkPrice) || Number(sellingPrice) || 0,
      bulkMinQty: Number(bulkMinQty) || 10,
      hsnCode: (hsnCode || "25232910").trim(),
      gstRate: Number(gstRate) || 18,
      vehicleRequirement: vehicleRequirement === "LOADER" ? "LOADER" : "BIKE",
      imageUrl,
      description: (description || "").trim(),
      specTags: Array.isArray(specTags) ? specTags : [],
      isInStock: isInStock !== false,
      adminLocked: adminLocked !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryProducts.unshift(newProd);

    // Save to DB
    try {
      await query(
        `INSERT INTO master_products (
           id, title, brand, category_slug, subcategory, unit, mrp, selling_price,
           bulk_price, bulk_min_qty, hsn_code, gst_rate, vehicle_requirement,
           image_url, description, spec_tags, is_in_stock, admin_locked
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           selling_price = EXCLUDED.selling_price,
           admin_locked = EXCLUDED.admin_locked,
           updated_at = NOW()`,
        [
          newProd.id,
          newProd.title,
          newProd.brand,
          newProd.categorySlug,
          newProd.subcategory || null,
          newProd.unit,
          newProd.mrp,
          newProd.sellingPrice,
          newProd.bulkPrice,
          newProd.bulkMinQty,
          newProd.hsnCode,
          newProd.gstRate,
          newProd.vehicleRequirement,
          newProd.imageUrl,
          newProd.description,
          JSON.stringify(newProd.specTags),
          newProd.isInStock,
          newProd.adminLocked,
        ]
      );
    } catch {
      // Ignored for memory fallback
    }

    const io = getIo();
    if (io) {
      io.to(adminRoom()).emit("catalog:product_created", newProd);
      io.emit("catalog:product_created", newProd);
    }

    return res.json({ success: true, product: newProd });
  } catch (err: any) {
    logger.error({ err }, "Error creating master product");
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH update master product or lock/stock toggle
router.patch("/admin/catalog/products/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const prodIndex = memoryProducts.findIndex((p) => p.id === id);
    if (prodIndex === -1) {
      return res.status(404).json({ success: false, error: "Master product not found" });
    }

    const current = memoryProducts[prodIndex];
    const updated: AdminMasterProduct = {
      ...current,
      title: req.body.title !== undefined ? req.body.title.trim() : current.title,
      brand: req.body.brand !== undefined ? req.body.brand.trim() : current.brand,
      categorySlug: req.body.categorySlug !== undefined ? req.body.categorySlug.trim() : current.categorySlug,
      subcategory: req.body.subcategory !== undefined ? req.body.subcategory.trim() : current.subcategory,
      unit: req.body.unit !== undefined ? req.body.unit.trim() : current.unit,
      mrp: req.body.mrp !== undefined ? Number(req.body.mrp) : current.mrp,
      sellingPrice: req.body.sellingPrice !== undefined ? Number(req.body.sellingPrice) : current.sellingPrice,
      bulkPrice: req.body.bulkPrice !== undefined ? Number(req.body.bulkPrice) : current.bulkPrice,
      bulkMinQty: req.body.bulkMinQty !== undefined ? Number(req.body.bulkMinQty) : current.bulkMinQty,
      hsnCode: req.body.hsnCode !== undefined ? req.body.hsnCode.trim() : current.hsnCode,
      gstRate: req.body.gstRate !== undefined ? Number(req.body.gstRate) : current.gstRate,
      vehicleRequirement:
        req.body.vehicleRequirement !== undefined
          ? req.body.vehicleRequirement === "LOADER"
            ? "LOADER"
            : "BIKE"
          : current.vehicleRequirement,
      imageUrl: req.body.imageUrl !== undefined ? req.body.imageUrl : current.imageUrl,
      description: req.body.description !== undefined ? req.body.description.trim() : current.description,
      specTags: req.body.specTags !== undefined && Array.isArray(req.body.specTags) ? req.body.specTags : current.specTags,
      isInStock: req.body.isInStock !== undefined ? Boolean(req.body.isInStock) : current.isInStock,
      adminLocked: req.body.adminLocked !== undefined ? Boolean(req.body.adminLocked) : current.adminLocked,
      updatedAt: new Date().toISOString(),
    };

    memoryProducts[prodIndex] = updated;

    try {
      await query(
        `UPDATE master_products SET
           title = $1, brand = $2, category_slug = $3, subcategory = $4, unit = $5,
           mrp = $6, selling_price = $7, bulk_price = $8, bulk_min_qty = $9,
           hsn_code = $10, gst_rate = $11, vehicle_requirement = $12, image_url = $13,
           description = $14, spec_tags = $15, is_in_stock = $16, admin_locked = $17,
           updated_at = NOW()
         WHERE id = $18`,
        [
          updated.title,
          updated.brand,
          updated.categorySlug,
          updated.subcategory || null,
          updated.unit,
          updated.mrp,
          updated.sellingPrice,
          updated.bulkPrice,
          updated.bulkMinQty,
          updated.hsnCode,
          updated.gstRate,
          updated.vehicleRequirement,
          updated.imageUrl,
          updated.description,
          JSON.stringify(updated.specTags),
          updated.isInStock,
          updated.adminLocked,
          id,
        ]
      );
    } catch {
      // Ignored
    }

    const io = getIo();
    if (io) {
      io.to(adminRoom()).emit("catalog:product_updated", updated);
      io.emit("catalog:product_updated", updated);
    }

    return res.json({ success: true, product: updated });
  } catch (err: any) {
    logger.error({ err }, "Error updating master product");
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE master product
router.delete("/admin/catalog/products/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    memoryProducts = memoryProducts.filter((p) => p.id !== id);

    try {
      await query(`DELETE FROM master_products WHERE id = $1`, [id]);
    } catch {
      // Ignored
    }

    const io = getIo();
    if (io) {
      io.to(adminRoom()).emit("catalog:product_deleted", { id });
      io.emit("catalog:product_deleted", { id });
    }

    return res.json({ success: true, message: `Product ${id} removed` });
  } catch (err: any) {
    logger.error({ err }, "Error deleting master product");
    return res.status(500).json({ success: false, error: err.message });
  }
});

/* ────────────────────────────────────────────────────────────────────────────
 * ACCOUNTS & GST REPORT ENGINE (DAILY HISAAB & GSTR-1 GENERATOR)
 * ──────────────────────────────────────────────────────────────────────────── */
export interface GstHsnSummaryRow {
  hsnCode: string;
  description: string;
  uqc: string; // Unit Quantity Code (e.g. BAG, KGS, NOS, SQM, LTR)
  totalQuantity: number;
  totalValue: number;
  taxableValue: number;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
}

export interface GstInvoiceRow {
  invoiceNo: string;
  orderId: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerGstin: string;
  isB2B: boolean;
  paymentMode: string;
  taxableValue: number;
  gstAmount: number;
  totalAmount: number;
  vendorPayout: number;
  driverPayout: number;
  platformMargin: number;
  status: string;
}

// Clean slate initial zero-state fallback arrays
const fallbackInvoices: GstInvoiceRow[] = [];
const fallbackHsnRows: GstHsnSummaryRow[] = [];

// GET full GST & Accounts report
router.get("/admin/accounts/gst-report", (req: Request, res: Response) => {
  try {
    const period = String(req.query.period || "today");
    const todayStr = new Date().toISOString().slice(0, 10);

    // Get live orders + live Skilled Service bookings (SAC 9954) + live Machine Rental bookings (SAC 9973)
    const allEcoOrders = ecosystemEngine.getAllOrders();
    const allServiceBookings = servicesRentalsEngine.getServiceBookings();
    const allRentalBookings = servicesRentalsEngine.getRentalBookings();
    const invoices: GstInvoiceRow[] = [];

    if (allEcoOrders && allEcoOrders.length > 0) {
      allEcoOrders.forEach((o, idx) => {
        const taxable = Math.round(o.subtotal || o.totalAmount * 0.82);
        const gst = Math.round(o.gstAmount || o.totalAmount - taxable);
        invoices.push({
          invoiceNo: `CNN-UP-2425-${String(idx + 101).padStart(4, "0")}`,
          orderId: o.id,
          date: (o.placedAt || todayStr).slice(0, 10),
          customerName: o.customerName || "Customer",
          customerPhone: o.customerPhone || "+91 98000 00000",
          customerGstin: o.gstNumber || (o.isB2B ? "09AABCC9999K1Z1" : "URP (Retail)"),
          isB2B: Boolean(o.isB2B || o.gstNumber),
          paymentMode: "CONON Vault / Escrow",
          taxableValue: taxable,
          gstAmount: gst,
          totalAmount: o.totalAmount,
          vendorPayout: o.dealerPayable || Math.round(o.totalAmount * 0.85),
          driverPayout: o.driverPayable || 350,
          platformMargin: o.cononNetMargin || Math.round(o.totalAmount * 0.1),
          status: o.status,
        });
      });
    }

    // Merge Skilled Service Bookings (SAC 9954 - 18% GST)
    allServiceBookings.forEach((sb, idx) => {
      invoices.push({
        invoiceNo: `CNN-SRV-9954-${String(idx + 101).padStart(4, "0")}`,
        orderId: sb.id,
        date: (sb.createdAt || todayStr).slice(0, 10),
        customerName: `${sb.customerName} [Skilled Squad • SAC 9954]`,
        customerPhone: sb.customerPhone || "+91 98000 00000",
        customerGstin: sb.customerGstin || "URP (Retail)",
        isB2B: Boolean(sb.customerGstin),
        paymentMode: sb.paymentMode === "UPI" ? "UPI Instant" : "CONON Vault Escrow",
        taxableValue: sb.subtotalAmount,
        gstAmount: sb.gstAmount,
        totalAmount: sb.totalAmount,
        vendorPayout: sb.partnerPayout,
        driverPayout: 0,
        platformMargin: sb.platformMargin,
        status: sb.escrowStatus === "SETTLED" ? "ESCROW_SETTLED" : sb.status,
      });
    });

    // Merge Machine Rental Bookings (SAC 9973 - 18% GST)
    allRentalBookings.forEach((rb, idx) => {
      invoices.push({
        invoiceNo: `CNN-RNT-9973-${String(idx + 101).padStart(4, "0")}`,
        orderId: rb.id,
        date: (rb.createdAt || todayStr).slice(0, 10),
        customerName: `${rb.customerName} [${rb.modelName} • SAC 9973]`,
        customerPhone: rb.customerPhone || "+91 98000 00000",
        customerGstin: rb.customerGstin || "URP (Retail)",
        isB2B: Boolean(rb.customerGstin),
        paymentMode: rb.paymentMode === "UPI" ? "UPI Instant" : "CONON Vault Escrow",
        taxableValue: rb.taxableValue,
        gstAmount: rb.gstAmount,
        totalAmount: rb.netBillAmount || rb.estimatedTotal,
        vendorPayout: rb.partnerPayout,
        driverPayout: 0,
        platformMargin: rb.platformMargin,
        status: rb.escrowStatus === "SETTLED" ? "ESCROW_SETTLED" : rb.status,
      });
    });

    // Filter by date period if needed
    if (period === "today") {
      // Show all recent
    }

    // Compute Executive KPIs
    const grossTurnover = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const taxableValue = invoices.reduce((sum, i) => sum + i.taxableValue, 0);
    const totalGst = invoices.reduce((sum, i) => sum + i.gstAmount, 0);
    const cgstAmount = Math.round(totalGst / 2);
    const sgstAmount = totalGst - cgstAmount;
    const vendorPayouts = invoices.reduce((sum, i) => sum + i.vendorPayout, 0);
    const driverPayouts = invoices.reduce((sum, i) => sum + i.driverPayout, 0);
    const netPlatformMargin = invoices.reduce((sum, i) => sum + i.platformMargin, 0);
    const commissionGst = Math.round(netPlatformMargin * 0.18);

    // Compute HSN / SAC Table 12 dynamically across Materials, Skilled Services (9954) & Machine Rentals (9973)
    const hsnMap = new Map<string, GstHsnSummaryRow>();
    const accumulateHsn = (code: string, desc: string, uqc: string, qty: number, totalVal: number, taxableVal: number, taxVal: number, gstRate = 18) => {
      const existing = hsnMap.get(code);
      const halfTax = Math.round(taxVal / 2);
      if (existing) {
        existing.totalQuantity += qty;
        existing.totalValue += totalVal;
        existing.taxableValue += taxableVal;
        existing.cgstAmount += halfTax;
        existing.sgstAmount += taxVal - halfTax;
        existing.totalTax += taxVal;
      } else {
        hsnMap.set(code, {
          hsnCode: code,
          description: desc,
          uqc,
          totalQuantity: qty,
          totalValue: totalVal,
          taxableValue: taxableVal,
          gstRate,
          cgstAmount: halfTax,
          sgstAmount: taxVal - halfTax,
          igstAmount: 0,
          totalTax: taxVal,
        });
      }
    };

    if (allEcoOrders && allEcoOrders.length > 0) {
      for (const ord of allEcoOrders) {
        for (const it of ord.items || []) {
          const code = it.hsnCode || "6810";
          const taxable = Math.round(it.totalPrice * 0.82);
          const tax = it.totalPrice - taxable;
          accumulateHsn(code, it.category || "Building Materials", it.unit || "NOS", it.qty, it.totalPrice, taxable, tax, 18);
        }
      }
    }

    for (const sb of allServiceBookings) {
      const totalShifts = sb.squadItems.reduce((s, q) => s + q.qty * q.days, 0) || 1;
      accumulateHsn("9954", "Construction & Skilled Labour Services (SAC 9954)", "NOS", totalShifts, sb.totalAmount, sb.subtotalAmount, sb.gstAmount, 18);
    }

    for (const rb of allRentalBookings) {
      const totalVal = rb.netBillAmount || rb.estimatedTotal;
      accumulateHsn("9973", "Heavy Construction Machinery Leasing / Rental (SAC 9973)", rb.billingUnit === "HOUR" ? "HRS" : "NOS", rb.quantityUnits, totalVal, rb.taxableValue, rb.gstAmount, 18);
    }

    const hsnRows: GstHsnSummaryRow[] = Array.from(hsnMap.values());

    res.json({
      success: true,
      company: companyGstSettings,
      period,
      generatedAt: new Date().toISOString(),
      kpis: {
        grossTurnover,
        taxableValue,
        totalGst,
        cgstAmount,
        sgstAmount,
        igstAmount: 0,
        netPlatformMargin,
        commissionGst,
        cashflow: {
          customerInflows: grossTurnover,
          vendorPayouts,
          driverPayouts,
          netRetention: grossTurnover - vendorPayouts - driverPayouts,
        },
      },
      hsnSummary: hsnRows,
      invoices,
    });
  } catch (err: any) {
    logger.error({ err }, "Error generating GST report");
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /admin/accounts/gst-report/csv (CA Tally / GST Portal ready)
router.get("/admin/accounts/gst-report/csv", (_req: Request, res: Response) => {
  try {
    const todayStr = new Date().toISOString().slice(0, 10);
    let csv = `"Invoice Number","Date","Customer Name","Customer GSTIN","Place of Supply","Taxable Value","CGST 9%","SGST 9%","IGST","Total Invoice Value","Payment Mode","Status"\n`;

    const allEcoOrders = ecosystemEngine.getAllOrders();
    const allServiceBookings = servicesRentalsEngine.getServiceBookings();
    const allRentalBookings = servicesRentalsEngine.getRentalBookings();
    let hasRows = false;

    if (allEcoOrders && allEcoOrders.length > 0) {
      hasRows = true;
      allEcoOrders.forEach((o, idx) => {
        const taxable = Math.round(o.subtotal || o.totalAmount * 0.82);
        const gst = Math.round(o.gstAmount || o.totalAmount - taxable);
        const cgst = (gst / 2).toFixed(2);
        const sgst = (gst / 2).toFixed(2);
        const invNo = `CNN-UP-2425-${String(idx + 101).padStart(4, "0")}`;
        const date = (o.placedAt || todayStr).slice(0, 10);
        const gstin = o.gstNumber || (o.isB2B ? "09AABCC9999K1Z1" : "URP (Retail)");
        csv += `"${invNo}","${date}","${o.customerName || "Customer"}","${gstin}","09-Uttar Pradesh","${taxable.toFixed(2)}","${cgst}","${sgst}","0.00","${o.totalAmount.toFixed(2)}","CONON Vault / Escrow","${o.status}"\n`;
      });
    }

    allServiceBookings.forEach((sb, idx) => {
      hasRows = true;
      const cgst = (sb.gstAmount / 2).toFixed(2);
      const sgst = (sb.gstAmount / 2).toFixed(2);
      const invNo = `CNN-SRV-9954-${String(idx + 101).padStart(4, "0")}`;
      const date = (sb.createdAt || todayStr).slice(0, 10);
      csv += `"${invNo}","${date}","${sb.customerName} (SAC 9954)","${sb.customerGstin || "URP (Retail)"}","09-Uttar Pradesh","${sb.subtotalAmount.toFixed(2)}","${cgst}","${sgst}","0.00","${sb.totalAmount.toFixed(2)}","${sb.paymentMode}","${sb.escrowStatus}"\n`;
    });

    allRentalBookings.forEach((rb, idx) => {
      hasRows = true;
      const cgst = (rb.gstAmount / 2).toFixed(2);
      const sgst = (rb.gstAmount / 2).toFixed(2);
      const totalVal = rb.netBillAmount || rb.estimatedTotal;
      const invNo = `CNN-RNT-9973-${String(idx + 101).padStart(4, "0")}`;
      const date = (rb.createdAt || todayStr).slice(0, 10);
      csv += `"${invNo}","${date}","${rb.customerName} (${rb.modelName} • SAC 9973)","${rb.customerGstin || "URP (Retail)"}","09-Uttar Pradesh","${rb.taxableValue.toFixed(2)}","${cgst}","${sgst}","0.00","${totalVal.toFixed(2)}","${rb.paymentMode}","${rb.escrowStatus}"\n`;
    });

    if (!hasRows) {
      csv += `"GSTR1-NIL-${todayStr}","${todayStr}","NIL RETURN (Zero Outward Supplies)","NIL","09-Uttar Pradesh","0.00","0.00","0.00","0.00","0.00","N/A","NIL_FILED"\n`;
    }

    csv += `\n"--- GSTR-1 TABLE 12 HSN SUMMARY ---"\n`;
    csv += `"HSN / SAC Code","Description","UQC","Total Quantity","Total Value","Taxable Value","CGST","SGST","IGST","Total Tax"\n`;

    if (!hasRows) {
      csv += `"NIL","No HSN/SAC transactions in this period","NA","0","0.00","0.00","0.00","0.00","0.00","0.00"\n`;
    } else {
      if (allServiceBookings.length > 0) {
        const sTot = allServiceBookings.reduce((s, b) => s + b.totalAmount, 0);
        const sTaxable = allServiceBookings.reduce((s, b) => s + b.subtotalAmount, 0);
        const sGst = allServiceBookings.reduce((s, b) => s + b.gstAmount, 0);
        csv += `"9954","Skilled Construction Services","NOS","${allServiceBookings.length}","${sTot.toFixed(2)}","${sTaxable.toFixed(2)}","${(sGst / 2).toFixed(2)}","${(sGst / 2).toFixed(2)}","0.00","${sGst.toFixed(2)}"\n`;
      }
      if (allRentalBookings.length > 0) {
        const rTot = allRentalBookings.reduce((s, b) => s + (b.netBillAmount || b.estimatedTotal), 0);
        const rTaxable = allRentalBookings.reduce((s, b) => s + b.taxableValue, 0);
        const rGst = allRentalBookings.reduce((s, b) => s + b.gstAmount, 0);
        csv += `"9973","Heavy Machinery Leasing & Rental","HRS","${allRentalBookings.length}","${rTot.toFixed(2)}","${rTaxable.toFixed(2)}","${(rGst / 2).toFixed(2)}","${(rGst / 2).toFixed(2)}","0.00","${rGst.toFixed(2)}"\n`;
      }
    }

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="CONON-NOW_GSTR1_Ledger_${todayStr}.csv"`);
    res.send(csv);
  } catch (err: any) {
    logger.error({ err }, "Error exporting GST CSV");
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST update company GST settings
router.post("/admin/accounts/settings", (req: Request, res: Response) => {
  try {
    const { gstin, pan, companyName, brandTradeName, registeredAddress, city, state, stateCode, pincode, authorizedSignatory, signatoryDesignation, contactEmail, contactPhone } = req.body;

    companyGstSettings = {
      companyName: companyName?.trim() || companyGstSettings.companyName,
      brandTradeName: brandTradeName?.trim() || companyGstSettings.brandTradeName,
      registeredAddress: registeredAddress?.trim() || companyGstSettings.registeredAddress,
      city: city?.trim() || companyGstSettings.city,
      state: state?.trim() || companyGstSettings.state,
      stateCode: stateCode?.trim() || companyGstSettings.stateCode,
      pincode: pincode?.trim() || companyGstSettings.pincode,
      gstin: gstin?.trim().toUpperCase() || companyGstSettings.gstin,
      pan: pan?.trim().toUpperCase() || companyGstSettings.pan,
      authorizedSignatory: authorizedSignatory?.trim() || companyGstSettings.authorizedSignatory,
      signatoryDesignation: signatoryDesignation?.trim() || companyGstSettings.signatoryDesignation,
      contactEmail: contactEmail?.trim() || companyGstSettings.contactEmail,
      contactPhone: contactPhone?.trim() || companyGstSettings.contactPhone,
    };

    res.json({ success: true, company: companyGstSettings });
  } catch (err: any) {
    logger.error({ err }, "Error updating company GST settings");
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
