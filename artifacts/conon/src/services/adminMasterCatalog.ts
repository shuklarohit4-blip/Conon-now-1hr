/**
 * CONON MASTER CATALOG ENGINE & REAL-TIME BUS
 * Powers the Admin "Catalog Studio", Storefront category rails, and Vendor Dukaan OS.
 */
import { getAdminHeaders, resolveApiUrl } from "@/lib/apiBase";
import { HOME_CATEGORIES } from "@/data/homeCategories";
import {
  broadcastCategorySyncSignal,
  refreshLiveCategories,
} from "@/services/liveCategoriesStore";
import { refreshLiveProducts } from "@/services/liveProductsStore";

export interface AdminMasterCategory {
  id: string;
  name: string;
  nameHi?: string;
  title?: string;
  titleHi?: string;
  slug: string;
  imageUrl: string;
  image?: string;
  badge?: string;
  badgeColor?: string;
  department?: string;
  categoryType?: "MATERIAL" | "RMC" | "SERVICE" | "RENTAL";
  defaultHsn?: string;
  defaultGstRate: number; // 5, 12, 18, 28
  vehicleType: "BIKE" | "LOADER";
  vehicleClass?: string;
  isActive: boolean;
  sortOrder: number;
  displayOrder?: number;
  productCount?: number;
  updatedAt?: string;
  createdAt?: string;
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
  images?: Array<{
    id: string;
    url: string;
    slot?: "front" | "back" | "specs" | "application" | "packaging";
    caption?: string;
    isPrimary?: boolean;
    order: number;
  }>;
  description: string;
  specTags: Array<{ label: string; value: string }>;
  highlights?: Array<{ label: string; value: string }>;
  keyInfo?: Array<{ label: string; value: string }>;
  usageTips?: string[];
  variants?: Array<{ id: string; label: string; unit: string; price: number; mrp: number; stock?: number }>;
  bulkSlabs?: Array<{ minQty: number; price: number; label?: string }>;
  cashbackPercent?: number;
  stockQty?: number;
  isInStock: boolean;
  isFeatured?: boolean;
  isArchived?: boolean;
  adminLocked: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const BROADCAST_BUS_NAME = "conon_catalog_bus";

// Shared BroadcastChannel for cross-tab instant relay (<1s)
let broadcastBus: BroadcastChannel | null = null;
try {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    broadcastBus = new BroadcastChannel(BROADCAST_BUS_NAME);
  }
} catch {
  // Graceful fallback
}

/* ────────────────────────────────────────────────────────────────────────────
 * CANONICAL FALLBACK MASTER CATEGORIES (DERIVED FROM UNIFIED STOREFRONT LIST)
 * ──────────────────────────────────────────────────────────────────────────── */
export const DEFAULT_MASTER_CATEGORIES: AdminMasterCategory[] = HOME_CATEGORIES.map((c, idx) => ({
  id: `cat_${c.slug}`,
  name: c.title,
  nameHi: c.titleHi,
  title: c.title,
  titleHi: c.titleHi,
  slug: c.slug,
  imageUrl: c.image,
  image: c.image,
  badge: c.badge,
  badgeColor: c.badgeColor,
  department: c.department,
  categoryType: c.categoryType,
  defaultHsn: c.defaultHsn,
  defaultGstRate: c.defaultGst ?? 18,
  vehicleType: c.vehicleClass?.toLowerCase().includes("bike") ? "BIKE" : "LOADER",
  vehicleClass: c.vehicleClass,
  isActive: c.isActive !== false,
  sortOrder: c.displayOrder ?? idx + 1,
  displayOrder: c.displayOrder ?? idx + 1,
  productCount: c.subcategories.reduce((sum, s) => sum + (s.itemCount || 0), 0),
}));

/* ────────────────────────────────────────────────────────────────────────────
 * DEFAULT MASTER PRODUCTS (WITH AUTHENTIC CIVIL SPECS & 8-DIGIT HSN)
 * ──────────────────────────────────────────────────────────────────────────── */
export const DEFAULT_MASTER_PRODUCTS: AdminMasterProduct[] = [
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
    imageUrl: "",
    description: "Premium Portland Pozzolana Cement engineered with micro-fine particle distribution for maximum damp-lock defense and dense concrete packing.",
    specTags: [
      { label: "Grade", value: "PPC Weather-Shield" },
      { label: "Standard", value: "IS 1489 (Part 1)" },
      { label: "Initial Setting Time", value: "30 Mins" },
      { label: "Compressive Strength (28D)", value: "> 53 MPa" },
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
    imageUrl: "",
    description: "Primary steel rebar Fe 550D grade with superior seismic energy absorption and bendability for heavy residential framing.",
    specTags: [
      { label: "Grade", value: "Fe 550D Super Ductile" },
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
    imageUrl: "",
    description: "Lead-free NSF-61 certified chlorinated polyvinyl chloride pipe built for hot & cold potable water pressure distribution up to 93°C.",
    specTags: [
      { label: "Pressure Class", value: "SDR 11 Class 1" },
      { label: "Nominal Size", value: "1 Inch (25mm)" },
      { label: "Max Operating Temp", value: "93°C" },
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
    description: "Ultra-luxury water-based interior emulsion with Teflon surface protector, imparting a lustrous soft sheen finish with 100% stain wipeability.",
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
    description: "Boiling Water Proof 710 marine plywood bonded with unextended B-stage phenolic resin, reinforced with Glue Line Protection against borers.",
    specTags: [
      { label: "Thickness", value: "19mm" },
      { label: "Dimensions", value: "8ft x 4ft (32 sq.ft)" },
      { label: "Standard", value: "IS 710 Marine BWP" },
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
    description: "High-solids synthetic resin adhesive offering 48 hours boiling water resistance and 5 days continuous cold water resistance.",
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
    description: "100% electrolyte grade annealed pure copper wire with triple layer HRFR insulation, 105°C thermal rating, and oxygen index above 29%.",
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
    description: "Heavy duty 800W SDS-plus professional rotary hammer drill delivering 2.7 Joules impact energy for continuous concrete coring up to 26mm.",
    specTags: [
      { label: "Power Rating", value: "800 Watts" },
      { label: "Impact Energy", value: "2.7 Joules" },
      { label: "Tool Holder", value: "SDS-Plus Quick Change" },
      { label: "Max Drilling (Concrete)", value: "26 mm" },
    ],
    isInStock: true,
    adminLocked: true,
  },
  {
    id: "mp_dr_fixit_pidiproof_lw_plus",
    title: "Dr. Fixit PidiProof LW+ Integral Waterproofing Compound 20L",
    brand: "Dr. Fixit",
    categorySlug: "waterproofing-repairing",
    subcategory: "Concrete Admixtures",
    unit: "20L Can",
    mrp: 3350,
    sellingPrice: 2890,
    bulkPrice: 2750,
    bulkMinQty: 4,
    hsnCode: "38244090",
    gstRate: 18,
    vehicleRequirement: "LOADER",
    imageUrl: "/images/home-categories/waterproofing-repairing.webp",
    description: "Specially formulated integral liquid waterproofing compound for concrete and mortar that reduces water-cement ratio and prevents capillary bleeding.",
    specTags: [
      { label: "Dosage", value: "200ml per 50kg cement bag" },
      { label: "Chloride Content", value: "Zero Chloride (Non-Corrosive)" },
      { label: "Workability", value: "Increases slump retention" },
      { label: "Standard", value: "IS 2645-2003 & IS 9103-2000" },
    ],
    isInStock: true,
    adminLocked: true,
  },
];

/* ────────────────────────────────────────────────────────────────────────────
 * CLIENT-SIDE CANVAS IMAGE COMPRESSOR (WEBP / JPEG MAX 800PX)
 * ──────────────────────────────────────────────────────────────────────────── */
export async function compressImageToWebP(
  file: File,
  maxDimension = 800,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      resolve("");
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to decode image"));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio scale
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(String(e.target?.result || ""));
          return;
        }

        // Draw image smoothly with high-quality downsampling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Try webp first, fall back to jpeg
        try {
          const webpData = canvas.toDataURL("image/webp", quality);
          if (webpData.startsWith("data:image/webp")) {
            resolve(webpData);
            return;
          }
        } catch {
          // Fall back
        }

        const jpegData = canvas.toDataURL("image/jpeg", quality);
        resolve(jpegData);
      };

      img.src = String(e.target?.result);
    };

    reader.readAsDataURL(file);
  });
}

/* ────────────────────────────────────────────────────────────────────────────
 * AUTO-FILL CIVIL SPECS & HSN HELPER
 * ──────────────────────────────────────────────────────────────────────────── */
export function getCivilAutoFill(categorySlug: string, brand?: string, title?: string) {
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
          mrp: 890,
          sellingPrice: 830,
          bulkPrice: 795,
          bulkMinQty: 40,
          specTags: [
            { label: "Steel Grade", value: "Fe 550D Super Ductile" },
            { label: "Standard", value: "IS 1786:2008 Certified" },
            { label: "Length", value: "12 Meters Standard" },
            { label: "Elongation", value: "14.5% High Ductility" },
          ],
        };
      }
      if (normTitle.includes("aac") || normTitle.includes("block")) {
        return {
          hsnCode: "68101190",
          gstRate: 12,
          vehicleRequirement: "LOADER" as const,
          unit: "CBM / Piece",
          mrp: 65,
          sellingPrice: 58,
          bulkPrice: 54,
          bulkMinQty: 200,
          specTags: [
            { label: "Block Type", value: "Autoclaved Aerated Concrete" },
            { label: "Standard", value: "IS 2185 (Part 3)" },
            { label: "Dry Density", value: "550 - 650 kg/m³" },
            { label: "Fire Rating", value: "4 Hours Fire Resistant" },
          ],
        };
      }
      return {
        hsnCode: "25232910",
        gstRate: 28,
        vehicleRequirement: "LOADER" as const,
        unit: "Bag (50kg)",
        mrp: 410,
        sellingPrice: 385,
        bulkPrice: 365,
        bulkMinQty: 50,
        specTags: [
          { label: "Cement Grade", value: "PPC Weather-Shield / OPC 53" },
          { label: "Standard", value: "IS 1489 Part 1 / IS 12269" },
          { label: "Initial Setting Time", value: "30 Minutes" },
          { label: "Final Setting Time", value: "280 Minutes" },
        ],
      };

    case "cpvc-plumbing-tanks":
      return {
        hsnCode: "39172390",
        gstRate: 18,
        vehicleRequirement: "LOADER" as const,
        unit: "Pipe (3m)",
        mrp: 380,
        sellingPrice: 320,
        bulkPrice: 295,
        bulkMinQty: 25,
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
        mrp: 9435,
        sellingPrice: 8499,
        bulkPrice: 8100,
        bulkMinQty: 4,
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
        mrp: 3200,
        sellingPrice: 2850,
        bulkPrice: 2700,
        bulkMinQty: 10,
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
        mrp: 1450,
        sellingPrice: 1290,
        bulkPrice: 1220,
        bulkMinQty: 6,
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
        mrp: 3450,
        sellingPrice: 2890,
        bulkPrice: 2750,
        bulkMinQty: 10,
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
        mrp: 9800,
        sellingPrice: 8250,
        bulkPrice: 7900,
        bulkMinQty: 2,
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
        mrp: 1650,
        sellingPrice: 1390,
        bulkPrice: 1320,
        bulkMinQty: 6,
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
        mrp: 550,
        sellingPrice: 480,
        bulkPrice: 440,
        bulkMinQty: 12,
        specTags: [
          { label: "Quality Grade", value: "Commercial Construction Grade" },
          { label: "Corrosion Resistance", value: "Tested Salt Spray 48hrs" },
        ],
      };
  }
}

/* ────────────────────────────────────────────────────────────────────────────
 * BROADCAST & LOCAL CACHE DISPATCHERS
 * ──────────────────────────────────────────────────────────────────────────── */
function notifyCatalogChange(type: "category" | "product", action: "create" | "update" | "delete", payload: any) {
  if (typeof window === "undefined") return;

  const eventPayload = { type, action, payload, timestamp: Date.now() };

  // 1. BroadcastChannel across all browser tabs
  try {
    if (broadcastBus) {
      broadcastBus.postMessage(eventPayload);
    }
  } catch {
    // Graceful
  }

  // 2. Window CustomEvent in same tab
  try {
    window.dispatchEvent(new CustomEvent("conon_catalog_bus", { detail: eventPayload }));
  } catch {
    // Graceful
  }
}

/* ────────────────────────────────────────────────────────────────────────────
 * CATEGORY STORE & API METHODS (ZERO LOCALSTORAGE FALLBACK — DB AUTHORITATIVE)
 * ──────────────────────────────────────────────────────────────────────────── */
export async function fetchMasterCategories(): Promise<AdminMasterCategory[]> {
  try {
    const res = await fetch(resolveApiUrl("/api/admin/catalog/categories"), {
      cache: "no-store",
      headers: getAdminHeaders({ "Cache-Control": "no-cache" }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        return data.categories;
      }
    }
  } catch {
    // Try public read endpoint
  }
  const res = await fetch(resolveApiUrl("/api/categories"), { cache: "no-store" });
  if (res.ok) {
    const data = await res.json();
    if (Array.isArray(data?.categories)) {
      return data.categories;
    }
  }
  return DEFAULT_MASTER_CATEGORIES;
}

export async function saveMasterCategory(
  category: Partial<AdminMasterCategory> & { name: string; slug: string; imageUrl: string }
): Promise<AdminMasterCategory> {
  const payload: Record<string, any> = {
    ...category,
    title: category.name,
    titleHi: category.nameHi,
    image: category.imageUrl,
    displayOrder: category.displayOrder ?? category.sortOrder,
  };

  const targetId = category.id || category.slug;
  const isUpdate = Boolean(category.id);
  const endpoint = isUpdate
    ? resolveApiUrl(`/api/categories/${encodeURIComponent(String(targetId))}`)
    : resolveApiUrl("/api/categories");
  const method = isUpdate ? "PUT" : "POST";

  const res = await fetch(endpoint, {
    method,
    headers: getAdminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.category) {
    throw new Error(data?.error || `Failed to save category (${res.status})`);
  }

  const savedCategory: AdminMasterCategory = data.category;
  notifyCatalogChange("category", isUpdate ? "update" : "create", savedCategory);
  broadcastCategorySyncSignal("admin-master-save");
  await refreshLiveCategories(true);

  return savedCategory;
}

/* ────────────────────────────────────────────────────────────────────────────
 * PRODUCT STORE & API METHODS (ZERO LOCALSTORAGE — REAL DB SOURCE OF TRUTH)
 * ──────────────────────────────────────────────────────────────────────────── */
let latestFetchedProducts: AdminMasterProduct[] = DEFAULT_MASTER_PRODUCTS;

export async function fetchMasterProducts(filter?: {
  category?: string;
  search?: string;
  locked?: boolean;
  includeArchived?: boolean;
}): Promise<AdminMasterProduct[]> {
  const params = new URLSearchParams();
  if (filter?.category && filter.category !== "all") params.append("category", filter.category);
  if (filter?.search) params.append("search", filter.search);
  if (filter?.locked !== undefined) params.append("locked", String(filter.locked));
  if (filter?.includeArchived) params.append("includeArchived", "true");

  const url = resolveApiUrl(`/api/admin/catalog/products${params.toString() ? `?${params.toString()}` : ""}`);
  const res = await fetch(url, {
    cache: "no-store",
    headers: getAdminHeaders({ "Cache-Control": "no-cache" }),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch catalog products (${res.status})`);
  }
  const data = await res.json();
  if (data.success && Array.isArray(data.products)) {
    latestFetchedProducts = data.products;
    return data.products;
  }
  return [];
}

export async function saveMasterProduct(
  product: Partial<AdminMasterProduct> & {
    title: string;
    brand: string;
    categorySlug: string;
    imageUrl: string;
  }
): Promise<AdminMasterProduct> {
  const isUpdate = Boolean(product.id);
  const endpoint = isUpdate
    ? resolveApiUrl(`/api/admin/catalog/products/${encodeURIComponent(String(product.id))}`)
    : resolveApiUrl("/api/admin/catalog/products");
  const method = isUpdate ? "PUT" : "POST";

  const res = await fetch(endpoint, {
    method,
    headers: getAdminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(product),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.product) {
    throw new Error(data?.error || `Failed to save product (${res.status})`);
  }

  const saved: AdminMasterProduct = data.product;
  notifyCatalogChange("product", isUpdate ? "update" : "create", saved);
  await refreshLiveProducts(true);
  return saved;
}

export async function bulkUpdateMasterProducts(
  updates: Array<{
    id: string;
    sellingPrice?: number;
    mrp?: number;
    bulkPrice?: number;
    stockQty?: number;
    isInStock?: boolean;
    isFeatured?: boolean;
  }>
): Promise<AdminMasterProduct[]> {
  const res = await fetch(resolveApiUrl("/api/admin/catalog/products/bulk-update"), {
    method: "PUT",
    headers: getAdminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ updates }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.success) {
    throw new Error(data?.error || `Bulk update failed (${res.status})`);
  }
  notifyCatalogChange("product", "update", { bulkCount: data.updatedCount });
  await refreshLiveProducts(true);
  return data.products || [];
}

export async function importCsvMasterProducts(rows: any[]): Promise<number> {
  const res = await fetch(resolveApiUrl("/api/admin/catalog/products/import-csv"), {
    method: "POST",
    headers: getAdminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ rows }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.success) {
    throw new Error(data?.error || `CSV import failed (${res.status})`);
  }
  notifyCatalogChange("product", "update", { imported: data.updatedCount });
  await refreshLiveProducts(true);
  return Number(data.updatedCount || 0);
}

export async function deleteMasterProduct(productId: string): Promise<boolean> {
  const res = await fetch(resolveApiUrl(`/api/admin/catalog/products/${encodeURIComponent(productId)}`), {
    method: "DELETE",
    headers: getAdminHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "Failed to delete product");
  }
  notifyCatalogChange("product", "delete", { id: productId });
  await refreshLiveProducts(true);
  return true;
}

export function isProductAdminLocked(productIdentifier: string): boolean {
  const target = latestFetchedProducts.find(
    (p) =>
      p.id === productIdentifier ||
      p.title.toLowerCase().trim() === productIdentifier.toLowerCase().trim()
  );
  return target ? target.adminLocked : false;
}
