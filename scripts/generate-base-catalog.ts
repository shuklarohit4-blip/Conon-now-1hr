import fs from "fs";
import path from "path";

// 1. Data modules
import { CATALOG_PRODUCTS } from "../artifacts/conon/src/data/catalogData";
import { ALL_37_MASONRY_PRODUCTS } from "../artifacts/conon/src/data/masonryData";
import { homeAppliancesProducts } from "../artifacts/conon/src/data/homeAppliancesData";
import { ALL_45_ADHESIVES_PRODUCTS } from "../artifacts/conon/src/data/adhesivesData";
import { ALL_26_DOOR_HARDWARE_PRODUCTS } from "../artifacts/conon/src/data/doorHardwareData";
import { ALL_20_FURNITURE_HARDWARE_PRODUCTS } from "../artifacts/conon/src/data/furnitureHardwareData";
import { ALL_38_KITCHEN_PRODUCTS } from "../artifacts/conon/src/data/kitchenSinksData";
import { ALL_26_MODULAR_KITCHEN_PRODUCTS } from "../artifacts/conon/src/data/modularKitchenData";
import { ALL_28_SANITARY_BATH_PRODUCTS } from "../artifacts/conon/src/data/sanitaryBathData";
import { ALL_9_TOOLS_SAFETY_PRODUCTS } from "../artifacts/conon/src/data/toolsSafetyData";
import { HOME_CATEGORIES } from "../artifacts/conon/src/data/homeCategories";

export interface MasterCatalogSKU {
  id: string;
  skuId: string;
  name: string;
  brand: string;
  category: string;
  categoryName: string;
  subcategory?: string;
  unit: string;
  sellingPrice: number;
  mrp: number;
  dealerLandingCost: number;
  inStock: boolean;
  express60Min: boolean;
  gstPercent: number;
  hsnCode: string;
  deliveryVehicleType: "2W_BIKE" | "3W_ELECTRIC_LOADER" | "4W_PICKUP" | "HEAVY_TRUCK";
  imageUrl: string;
  description?: string;
  specifications?: Record<string, any>;
  tags?: string[];
  isCustom?: boolean;
  archived?: boolean;
  updatedAt: string;
}

const CATEGORY_NAME_MAP: Record<string, string> = {
  "cctv-networking": "CCTV & Networking",
  "cpvc-plumbing-tanks": "CPVC Plumbing & Overhead Tanks",
  "cement-civil-works": "Cement, TMT Sariya & Chemicals",
  "plywood-boards": "Plywood, Doors & Hardware",
  "fevicol-adhesives-sealants": "Fevicol, Adhesives & Sealants",
  "wires-mcb-electrical": "Wires, MCB & Electrical Supplies",
  "kitchen-sinks-faucets": "Kitchen Sinks & Faucets",
  "furniture-wardrobe-bed-hardware": "Furniture, Wardrobe & Bed Hardware",
  "modular-kitchen-systems": "Modular Kitchen Systems & Fittings",
  "door-hardware-locks": "Door Hardware & Locks",
  "sanitary-bath-fittings": "Sanitary & Bath Fittings",
  "tile-stone-installation": "Tiles, Marble & Granite",
  "home-appliances": "Home Appliances",
  "lighting": "Lighting",
  "painting": "Paints, Putty & Primer",
  "safety-workwear": "Safety & Workwear",
  "tools-hardware": "Tools, Power Tools & General Hardware",
  "waterproofing-repairing": "Waterproofing & Repairing",
  "bricks-sand-gitti-aac": "Bricks, Sand (Morang), Gitti & AAC Blocks",
  "power-tools-safety": "Power Tools, Hand Tools & Site Safety",
};

function inferGstAndHsn(cat: string, name: string): { gst: number; hsn: string; vehicle: "2W_BIKE" | "3W_ELECTRIC_LOADER" | "4W_PICKUP" | "HEAVY_TRUCK" } {
  const n = name.toLowerCase();
  if (cat === "bricks-sand-gitti-aac" || n.includes("morang") || n.includes("sand") || n.includes("gitti") || n.includes("aggregate") || n.includes("brick") || n.includes("aac")) {
    if (n.includes("morang") || n.includes("sand")) {
      return { gst: 5, hsn: "2505", vehicle: "4W_PICKUP" };
    }
    if (n.includes("gitti") || n.includes("aggregate") || n.includes("stone metal")) {
      return { gst: 5, hsn: "2517", vehicle: "4W_PICKUP" };
    }
    if (n.includes("brick")) {
      return { gst: 12, hsn: "6904", vehicle: "4W_PICKUP" };
    }
    if (n.includes("aac") || n.includes("block")) {
      return { gst: 12, hsn: "6815", vehicle: "4W_PICKUP" };
    }
  }

  if (cat === "cement-civil-works" || n.includes("cement") || n.includes("tmt") || n.includes("sariya")) {
    if (n.includes("tmt") || n.includes("sariya") || n.includes("steel")) {
      return { gst: 18, hsn: "7214", vehicle: "4W_PICKUP" };
    }
    return { gst: 18, hsn: "2523", vehicle: "4W_PICKUP" };
  }

  if (cat === "cctv-networking" || n.includes("camera") || n.includes("dvr") || n.includes("nvr") || n.includes("router")) {
    return { gst: 18, hsn: "8525", vehicle: "2W_BIKE" };
  }

  if (cat === "cpvc-plumbing-tanks" || cat.includes("plumbing")) {
    if (n.includes("tank")) {
      return { gst: 18, hsn: "3925", vehicle: "4W_PICKUP" };
    }
    return { gst: 18, hsn: "3917", vehicle: "3W_ELECTRIC_LOADER" };
  }

  if (cat === "painting" || n.includes("paint") || n.includes("primer") || n.includes("enamel") || n.includes("distemper") || n.includes("putty")) {
    return { gst: 18, hsn: "3208", vehicle: "3W_ELECTRIC_LOADER" };
  }

  if (cat === "fevicol-adhesives-sealants" || cat.includes("adhesive")) {
    return { gst: 18, hsn: "3506", vehicle: "2W_BIKE" };
  }

  if (cat === "wires-mcb-electrical" || cat === "lighting" || cat.includes("electrical")) {
    return { gst: 18, hsn: "8544", vehicle: "2W_BIKE" };
  }

  if (cat === "kitchen-sinks-faucets") {
    return { gst: 18, hsn: "7324", vehicle: "3W_ELECTRIC_LOADER" };
  }

  if (cat === "sanitary-bath-fittings") {
    return { gst: 18, hsn: "6910", vehicle: "3W_ELECTRIC_LOADER" };
  }

  if (cat === "tile-stone-installation") {
    return { gst: 18, hsn: "6907", vehicle: "4W_PICKUP" };
  }

  if (cat === "plywood-boards") {
    return { gst: 18, hsn: "4412", vehicle: "4W_PICKUP" };
  }

  if (cat === "home-appliances") {
    return { gst: 18, hsn: "8516", vehicle: "3W_ELECTRIC_LOADER" };
  }

  if (cat === "door-hardware-locks" || cat === "furniture-wardrobe-bed-hardware" || cat === "modular-kitchen-systems") {
    return { gst: 18, hsn: "8302", vehicle: "2W_BIKE" };
  }

  return { gst: 18, hsn: "8467", vehicle: "2W_BIKE" };
}

const skuMap = new Map<string, MasterCatalogSKU>();

function addProduct(p: any, defaultCategory: string) {
  if (!p) return;
  const id = String(p.id || p.skuId || p.slug || "").trim();
  if (!id) return;

  const category = String(p.categorySlug || p.category || defaultCategory || "cement-civil-works").trim();
  const name = String(p.title || p.name || id).trim();
  const brand = String(p.brand || "Conon Standard").trim();
  const price = Number(p.price || p.sellingPrice || 100);
  const mrp = Number(p.mrp || Math.round(price * 1.15));
  const landing = Number(p.dealerCost || p.dealerLandingCost || Math.round(price * 0.90));
  const unit = String(p.unit || p.spec || "Piece").trim();
  const img = String(p.image || p.imageUrl || "").trim();

  const { gst, hsn, vehicle } = inferGstAndHsn(category, name);

  const sku: MasterCatalogSKU = {
    id,
    skuId: id,
    name,
    brand,
    category,
    categoryName: CATEGORY_NAME_MAP[category] || category,
    subcategory: p.subcategory || p.subCategory || undefined,
    unit,
    sellingPrice: price,
    mrp: mrp > price ? mrp : Math.round(price * 1.12),
    dealerLandingCost: landing < price ? landing : Math.round(price * 0.92),
    inStock: p.inStock !== false,
    express60Min: p.express60Min !== false,
    gstPercent: p.gstPercent || gst,
    hsnCode: p.hsnCode || hsn,
    deliveryVehicleType: p.deliveryVehicleType || vehicle,
    imageUrl: img || `/images/products/${category}/${id}.webp`,
    description: p.description || p.shortDescription || undefined,
    specifications: p.specifications || p.specs || undefined,
    tags: Array.isArray(p.tags) ? p.tags : undefined,
    updatedAt: new Date().toISOString(),
  };

  skuMap.set(id, sku);
}

HOME_CATEGORIES.forEach(c => {
  if (c.slug && c.title) {
    CATEGORY_NAME_MAP[c.slug] = c.title;
  }
});

// 1. Ingest base data files
CATALOG_PRODUCTS.forEach(p => addProduct(p, (p as any).category));
ALL_37_MASONRY_PRODUCTS?.forEach(p => addProduct(p, "bricks-sand-gitti-aac"));
homeAppliancesProducts?.forEach(p => addProduct(p, "home-appliances"));
ALL_45_ADHESIVES_PRODUCTS?.forEach(p => addProduct(p, "fevicol-adhesives-sealants"));
ALL_26_DOOR_HARDWARE_PRODUCTS?.forEach(p => addProduct(p, "door-hardware-locks"));
ALL_20_FURNITURE_HARDWARE_PRODUCTS?.forEach(p => addProduct(p, "furniture-wardrobe-bed-hardware"));
ALL_38_KITCHEN_PRODUCTS?.forEach(p => addProduct(p, "kitchen-sinks-faucets"));
ALL_26_MODULAR_KITCHEN_PRODUCTS?.forEach(p => addProduct(p, "modular-kitchen-systems"));
ALL_28_SANITARY_BATH_PRODUCTS?.forEach(p => addProduct(p, "sanitary-bath-fittings"));
ALL_9_TOOLS_SAFETY_PRODUCTS?.forEach(p => addProduct(p, "power-tools-safety"));

// 2. Ingest storefront specific components
const sfDir = path.resolve(process.cwd(), "artifacts/conon/src/components");
const sfCategoryMap: Record<string, string> = {
  "CCTVCollectionStorefront.tsx": "cctv-networking",
  "CPVCPlumbingStorefront.tsx": "cpvc-plumbing-tanks",
  "CementCollectionStorefront.tsx": "cement-civil-works",
  "ElectricalCollectionStorefront.tsx": "wires-mcb-electrical",
  "LightingCollectionStorefront.tsx": "lighting",
  "LocksCollectionStorefront.tsx": "door-hardware-locks",
  "PlywoodCollectionStorefront.tsx": "plywood-boards",
  "SafetyCollectionStorefront.tsx": "safety-workwear",
  "TileAdhesivesCollectionStorefront.tsx": "tile-stone-installation",
  "TilesCollectionStorefront.tsx": "tile-stone-installation",
  "KitchenCollectionStorefront.tsx": "modular-kitchen-systems",
};

for (const [sfFile, defaultCat] of Object.entries(sfCategoryMap)) {
  const fullPath = path.join(sfDir, sfFile);
  if (!fs.existsSync(fullPath)) continue;
  const content = fs.readFileSync(fullPath, "utf-8");
  const matches = content.match(/export const [A-Z_]+_PRODUCTS(?:\s*:\s*[A-Za-z0-9_\[\]]+)?\s*=\s*(\[[\s\S]*?\]);/g);
  if (matches) {
    for (const arrStr of matches) {
      const jsonStrMatch = arrStr.match(/=\s*(\[[\s\S]*?\]);/);
      if (jsonStrMatch) {
        try {
          const prods = new Function(`return ${jsonStrMatch[1]}`)();
          prods.forEach((p: any) => addProduct(p, p.categorySlug || p.category || defaultCat));
        } catch (e) {}
      }
    }
  }
}

const allSkus = Array.from(skuMap.values()).sort((a, b) => a.name.localeCompare(b.name));
console.log(`\n======================================================`);
console.log(`Master Canonical Catalog Compiled: ${allSkus.length} Unique SKUs`);
console.log(`======================================================\n`);

const catCounts: Record<string, number> = {};
allSkus.forEach(s => {
  catCounts[s.category] = (catCounts[s.category] || 0) + 1;
});
console.table(catCounts);

const targetPath = path.resolve(process.cwd(), "artifacts/api-server/data/base-catalog.json");
fs.writeFileSync(targetPath, JSON.stringify(allSkus, null, 2), "utf-8");
console.log(`Saved canonical base catalog to: ${targetPath}`);
