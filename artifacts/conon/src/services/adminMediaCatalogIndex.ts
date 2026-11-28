/**
 * UNIFIED ECOSYSTEM CATALOG INDEX FOR ADMIN MEDIA VAULT (16+ Categories + Services + Rentals)
 * Aggregates EVERY item across all category storefronts, static data catalogs,
 * Skilled Services (SAC 9954), Heavy Machine Rentals (SAC 9973), and Admin custom items.
 */
import { CATALOG_PRODUCTS } from "@/data/catalogData";
import { LUCKNOW_RMC_GRADES } from "@/data/lucknowRmcCatalog";
import { LUCKNOW_32_SAFETY_SKUS } from "@/data/lucknowSafetyCatalog";
import { ALL_45_ADHESIVES_PRODUCTS } from "@/data/adhesivesData";
import { ALL_26_DOOR_HARDWARE_PRODUCTS } from "@/data/doorHardwareData";
import { ALL_20_FURNITURE_HARDWARE_PRODUCTS } from "@/data/furnitureHardwareData";
import { homeAppliancesProducts } from "@/data/homeAppliancesData";
import { ALL_38_KITCHEN_PRODUCTS } from "@/data/kitchenSinksData";
import { ALL_37_MASONRY_PRODUCTS } from "@/data/masonryData";
import { ALL_26_MODULAR_KITCHEN_PRODUCTS } from "@/data/modularKitchenData";
import { ALL_28_SANITARY_BATH_PRODUCTS } from "@/data/sanitaryBathData";
import { ALL_9_TOOLS_SAFETY_PRODUCTS } from "@/data/toolsSafetyData";
import { ALL_STRUCTURAL_PRODUCTS } from "@/components/CementCollectionStorefront";
import { PLUMBING_PRODUCTS } from "@/components/CPVCPlumbingStorefront";
import { ALL_WOOD_HARDWARE_PRODUCTS } from "@/components/PlywoodCollectionStorefront";
import { PAINTS_PRODUCTS } from "@/components/PaintsCollectionStorefront";
import {
  ELECTRICAL_WIRES_PRODUCTS,
  MCB_PROTECTION_PRODUCTS,
  SWITCHES_SOCKETS_PRODUCTS,
} from "@/components/ElectricalCollectionStorefront";
import { CCTV_PRODUCTS } from "@/components/CCTVCollectionStorefront";
import { TILES_STONE_PRODUCTS } from "@/components/TilesCollectionStorefront";
import { TILE_PRODUCTS } from "@/components/TileAdhesivesCollectionStorefront";
import { LIGHTING_PRODUCTS } from "@/components/LightingCollectionStorefront";
import { SOLAR_PRODUCTS } from "@/components/SolarCollectionStorefront";
import { SAFETY_PRODUCTS } from "@/components/SafetyCollectionStorefront";
import { TOOL_SKUS } from "@/components/PowerToolsSafetyStorefront";
import { MECHANICAL_LOCKS_PRODUCTS } from "@/components/LocksCollectionStorefront";
import { HINGES_PRODUCTS, DRAWER_CHANNELS_PRODUCTS } from "@/components/HingesCollectionStorefront";
import {
  TANDEMS_INSERTS_PRODUCTS,
  PULLOUTS_BASKETS_PRODUCTS,
  WASTE_BINS_PRODUCTS,
  MAGIC_CORNER_PANTRY_PRODUCTS,
  SKIRTING_HARDWARE_PRODUCTS,
} from "@/components/KitchenCollectionStorefront";
import { SHOWCASE_PRODUCTS_BY_CATEGORY } from "@/lib/catalogProducts";
import { FALLBACK_SERVICE_CATALOG, FALLBACK_RENTAL_CATALOG } from "@/services/servicesRentalsSync";
import { getAllVaultOverridesList } from "@/services/productMediaVault";
import { LUCKNOW_SITE_KITS } from "@/data/siteKitsData";

export interface VaultCategoryDefinition {
  slug: string;
  name: string;
  group: "MATERIALS" | "SERVICES" | "RENTALS";
  defaultGstRate: number;
  defaultHsnOrSac: string;
}

export interface UnifiedVaultItem {
  id: string;
  slug?: string;
  categorySlug: string;
  categoryName: string;
  subcategory: string;
  title: string;
  brand: string;
  description: string;
  specBullets: string[];
  defaultImage: string;
  price: number;
  mrp: number;
  bulkPrice?: number;
  bulkMinQty?: number;
  unit: string;
  hsnCode: string;
  gstRate: number;
  isInStock: boolean;
  rentPricePerDay?: number;
  dcrSubsidyEligible?: boolean;
  stqcCompliant?: boolean;
  itemKind: "PRODUCT" | "SERVICE" | "RENTAL";
}

export const VAULT_CATEGORIES: VaultCategoryDefinition[] = [
  { slug: "cpvc-plumbing-tanks", name: "CPVC Pipes & Plumbing", group: "MATERIALS", defaultGstRate: 18, defaultHsnOrSac: "39172390" },
  { slug: "cement-civil-works", name: "Cement, TMT Sariya & Chemicals", group: "MATERIALS", defaultGstRate: 28, defaultHsnOrSac: "25232910" },
  { slug: "bricks-sand-gitti-aac", name: "Bricks, Sand, Morang & AAC", group: "MATERIALS", defaultGstRate: 12, defaultHsnOrSac: "68101190" },
  { slug: "plywood-boards", name: "Plywood, Doors & Boards", group: "MATERIALS", defaultGstRate: 18, defaultHsnOrSac: "44123390" },
  { slug: "painting", name: "Paints, Putty & Primers", group: "MATERIALS", defaultGstRate: 18, defaultHsnOrSac: "32091090" },
  { slug: "fevicol-adhesives-sealants", name: "Fevicol, Adhesives & Sealants", group: "MATERIALS", defaultGstRate: 18, defaultHsnOrSac: "35069190" },
  { slug: "wires-mcb-electrical", name: "Wires, MCB & Electricals", group: "MATERIALS", defaultGstRate: 18, defaultHsnOrSac: "85444999" },
  { slug: "tile-stone-installation", name: "Tiles, Marble & Granite", group: "MATERIALS", defaultGstRate: 18, defaultHsnOrSac: "69072100" },
  { slug: "sanitary-bath-fittings", name: "Sanitary & Bath Fittings", group: "MATERIALS", defaultGstRate: 18, defaultHsnOrSac: "69101000" },
  { slug: "kitchen-sinks-faucets", name: "Kitchen Sinks & Faucets", group: "MATERIALS", defaultGstRate: 18, defaultHsnOrSac: "73241000" },
  { slug: "modular-kitchen-systems", name: "Modular Kitchen Systems", group: "MATERIALS", defaultGstRate: 18, defaultHsnOrSac: "83024200" },
  { slug: "furniture-wardrobe-bed-hardware", name: "Furniture Hardware & Hinges", group: "MATERIALS", defaultGstRate: 18, defaultHsnOrSac: "83021090" },
  { slug: "door-hardware-locks", name: "Door Hardware & Locks", group: "MATERIALS", defaultGstRate: 18, defaultHsnOrSac: "83014090" },
  { slug: "cctv-networking", name: "CCTV & Networking", group: "MATERIALS", defaultGstRate: 18, defaultHsnOrSac: "85258090" },
  { slug: "home-appliances", name: "Home Appliances", group: "MATERIALS", defaultGstRate: 18, defaultHsnOrSac: "85161000" },
  { slug: "lighting", name: "Lighting & Architectural LED", group: "MATERIALS", defaultGstRate: 18, defaultHsnOrSac: "94054090" },
  { slug: "solar-rooftop-power", name: "Solar & Rooftop Power", group: "MATERIALS", defaultGstRate: 12, defaultHsnOrSac: "85414300" },
  { slug: "tools-hardware", name: "Tools, Power Tools & Hardware", group: "MATERIALS", defaultGstRate: 18, defaultHsnOrSac: "8467" },
  { slug: "safety-ppe-workwear", name: "Site Safety & PPE (32 SKUs)", group: "MATERIALS", defaultGstRate: 18, defaultHsnOrSac: "6506" },
  { slug: "site-kits", name: "1-Click Lucknow Site Kits", group: "MATERIALS", defaultGstRate: 18, defaultHsnOrSac: "8467" },
  { slug: "skilled-services", name: "Skilled Services (SAC 9954)", group: "SERVICES", defaultGstRate: 18, defaultHsnOrSac: "9954" },
  { slug: "heavy-machine-rentals", name: "Heavy Machine Rentals (20 Machines)", group: "RENTALS", defaultGstRate: 18, defaultHsnOrSac: "9973" },
  { slug: "rmc-plant-direct", name: "RMC Plant Direct (16 Grades & Mixes)", group: "RENTALS", defaultGstRate: 18, defaultHsnOrSac: "38245010" },
];

function extractBullets(raw: any): string[] {
  if (Array.isArray(raw?.specBullets) && raw.specBullets.length > 0) return raw.specBullets.map(String);
  if (Array.isArray(raw?.highlights) && raw.highlights.length > 0) {
    return raw.highlights.map((h: any) => (typeof h === "string" ? h : `${h.label}: ${h.value}`));
  }
  if (Array.isArray(raw?.features) && raw.features.length > 0) return raw.features.map(String);
  if (Array.isArray(raw?.specChips) && raw.specChips.length > 0) return raw.specChips.map(String);
  if (Array.isArray(raw?.specifications) && raw.specifications.length > 0) {
    return raw.specifications.slice(0, 6).map((s: any) => `${s.label || s.name}: ${s.value}`);
  }
  if (raw?.spec) return [String(raw.spec)];
  return [];
}

function toUnified(
  raw: any,
  catDef: VaultCategoryDefinition,
  itemKind: "PRODUCT" | "SERVICE" | "RENTAL" = "PRODUCT"
): UnifiedVaultItem {
  const id = String(raw.id || raw.slug);
  const title = String(raw.title || raw.name || raw.modelName || raw.tradeName || id);
  const price = Number(raw.price ?? raw.shiftRate ?? raw.wetRates?.shift ?? 0) || 0;
  const mrp = Number(raw.mrp ?? (price > 0 ? Math.round(price * 1.18) : 0)) || price;

  return {
    id,
    slug: raw.slug ? String(raw.slug) : id,
    categorySlug: catDef.slug,
    categoryName: catDef.name,
    subcategory: String(raw.subCategory || raw.subcategory || raw.categoryTag || raw.category || catDef.name),
    title,
    brand: String(raw.brand || raw.vendor || raw.machineName || "CONON Certified"),
    description: String(
      raw.description ||
        raw.shortTagline ||
        raw.shortDescription ||
        `${title} — Authentic construction supply with 60-minute express site dispatch across Lucknow.`
    ),
    specBullets: extractBullets(raw),
    defaultImage: String(raw.image || raw.imageUrl || (Array.isArray(raw.images) ? raw.images[0] : "") || ""),
    price,
    mrp,
    bulkPrice: raw.bulkPrice ? Number(raw.bulkPrice) : undefined,
    bulkMinQty: raw.bulkMinQty ? Number(raw.bulkMinQty) : undefined,
    unit: String(raw.unit || raw.packSize || "Unit"),
    hsnCode: String(raw.hsnCode || raw.sacCode || catDef.defaultHsnOrSac),
    gstRate: Number(raw.gstPercent ?? raw.gstRate ?? catDef.defaultGstRate),
    isInStock: raw.inStock !== false && raw.isActive !== false && !raw.isSoldOut,
    ...(raw.rentPricePerDay !== undefined ? { rentPricePerDay: Number(raw.rentPricePerDay) } : {}),
    ...(raw.dcrEligible !== undefined || raw.dcrSubsidyEligible !== undefined
      ? { dcrSubsidyEligible: Boolean(raw.dcrEligible ?? raw.dcrSubsidyEligible) }
      : {}),
    ...(raw.stqcCompliant !== undefined || raw.stqcVerified !== undefined
      ? { stqcCompliant: Boolean(raw.stqcCompliant ?? raw.stqcVerified) }
      : {}),
    itemKind,
  };
}

let cachedBaseItems: UnifiedVaultItem[] | null = null;

function buildBaseCatalogItems(): UnifiedVaultItem[] {
  if (cachedBaseItems) return cachedBaseItems;

  const byId = new Map<string, UnifiedVaultItem>();
  const catBySlug = new Map(VAULT_CATEGORIES.map((c) => [c.slug, c]));

  const pushAll = (
    list: any[],
    catSlug: string,
    kind: "PRODUCT" | "SERVICE" | "RENTAL" = "PRODUCT"
  ) => {
    const cat = catBySlug.get(catSlug);
    if (!cat || !Array.isArray(list)) return;
    for (const raw of list) {
      if (!raw?.id && !raw?.slug) continue;
      const item = toUnified(raw, cat, kind);
      if (!byId.has(item.id)) {
        byId.set(item.id, item);
      }
    }
  };

  // Priority order ensures exact primary storefront IDs (e.g. Astral CPVC Pro 1/2" SDR-11 3m) win
  pushAll(PLUMBING_PRODUCTS, "cpvc-plumbing-tanks");
  pushAll(ALL_STRUCTURAL_PRODUCTS, "cement-civil-works");
  pushAll(ALL_37_MASONRY_PRODUCTS, "bricks-sand-gitti-aac");
  pushAll(ALL_WOOD_HARDWARE_PRODUCTS, "plywood-boards");
  pushAll(PAINTS_PRODUCTS, "painting");
  pushAll(ALL_45_ADHESIVES_PRODUCTS, "fevicol-adhesives-sealants");
  pushAll(
    [...ELECTRICAL_WIRES_PRODUCTS, ...MCB_PROTECTION_PRODUCTS, ...SWITCHES_SOCKETS_PRODUCTS],
    "wires-mcb-electrical"
  );
  pushAll([...TILES_STONE_PRODUCTS, ...TILE_PRODUCTS], "tile-stone-installation");
  pushAll(ALL_28_SANITARY_BATH_PRODUCTS, "sanitary-bath-fittings");
  pushAll(ALL_38_KITCHEN_PRODUCTS, "kitchen-sinks-faucets");
  pushAll(
    [
      ...ALL_26_MODULAR_KITCHEN_PRODUCTS,
      ...TANDEMS_INSERTS_PRODUCTS,
      ...PULLOUTS_BASKETS_PRODUCTS,
      ...WASTE_BINS_PRODUCTS,
      ...MAGIC_CORNER_PANTRY_PRODUCTS,
      ...SKIRTING_HARDWARE_PRODUCTS,
    ],
    "modular-kitchen-systems"
  );
  pushAll(
    [...ALL_20_FURNITURE_HARDWARE_PRODUCTS, ...HINGES_PRODUCTS, ...DRAWER_CHANNELS_PRODUCTS],
    "furniture-wardrobe-bed-hardware"
  );
  pushAll([...ALL_26_DOOR_HARDWARE_PRODUCTS, ...MECHANICAL_LOCKS_PRODUCTS], "door-hardware-locks");
  pushAll(CCTV_PRODUCTS, "cctv-networking");
  pushAll(homeAppliancesProducts, "home-appliances");
  pushAll(LIGHTING_PRODUCTS, "lighting");
  pushAll(SOLAR_PRODUCTS, "solar-rooftop-power");
  pushAll([...ALL_9_TOOLS_SAFETY_PRODUCTS, ...SAFETY_PRODUCTS], "safety-ppe-workwear");

  // Also include Homepage shelf showcase items & any remaining CATALOG_PRODUCTS
  const showcaseToVaultCat: Record<string, string> = {
    paint: "painting",
    cement: "cement-civil-works",
    steel: "cement-civil-works",
    wood: "plywood-boards",
    hardware: "door-hardware-locks",
    adhesives: "fevicol-adhesives-sealants",
    tiles: "tile-stone-installation",
    electrical: "wires-mcb-electrical",
    plumbing: "cpvc-plumbing-tanks",
    sand: "bricks-sand-gitti-aac",
  };
  for (const [k, prods] of Object.entries(SHOWCASE_PRODUCTS_BY_CATEGORY)) {
    const mappedSlug = showcaseToVaultCat[k];
    if (mappedSlug) pushAll(prods, mappedSlug);
  }

  for (const p of CATALOG_PRODUCTS) {
    const s = (p.categorySlug || "").toLowerCase();
    let targetSlug = "cement-civil-works";
    if (s.includes("cpvc") || s.includes("plumb") || s.includes("tank")) targetSlug = "cpvc-plumbing-tanks";
    else if (s.includes("paint") || s.includes("putty")) targetSlug = "painting";
    else if (s.includes("plywood") || s.includes("wood")) targetSlug = "plywood-boards";
    else if (s.includes("tile") || s.includes("marble")) targetSlug = "tile-stone-installation";
    else if (s.includes("electr") || s.includes("wire")) targetSlug = "wires-mcb-electrical";
    else if (s.includes("sanit")) targetSlug = "sanitary-bath-fittings";
    else if (s.includes("cctv")) targetSlug = "cctv-networking";
    else if (s.includes("brick") || s.includes("sand") || s.includes("aac")) targetSlug = "bricks-sand-gitti-aac";
    else if (s.includes("adhes") || s.includes("fevicol") || s.includes("waterproof")) targetSlug = "fevicol-adhesives-sealants";
    else if (s.includes("safety") || s.includes("ppe")) targetSlug = "safety-ppe-workwear";
    else if (s.includes("tool")) targetSlug = "tools-hardware";
    else if (s.includes("door") || s.includes("lock")) targetSlug = "door-hardware-locks";
    else if (s.includes("light")) targetSlug = "lighting";
    else if (s.includes("solar")) targetSlug = "solar-rooftop-power";
    else if (s.includes("appli")) targetSlug = "home-appliances";
    pushAll([p], targetSlug);
  }

  // Skilled Services (SAC 9954), Heavy Machine Rentals (SAC 9973), RMC Plant Direct & 32-SKU Lucknow Safety Studio
  pushAll(FALLBACK_SERVICE_CATALOG, "skilled-services", "SERVICE");
  pushAll(FALLBACK_RENTAL_CATALOG, "heavy-machine-rentals", "RENTAL");
  pushAll(
    LUCKNOW_32_SAFETY_SKUS.map((s) => ({
      id: s.id,
      slug: s.id,
      title: s.title,
      brand: s.brand,
      subcategory: s.subCategoryId,
      price: s.price,
      mrp: s.mrp,
      unit: s.unit,
      hsnCode: s.hsnCode,
      gstRate: s.gstRate,
      description: s.specLine || s.title,
      specBullets: [s.standardBadge || "ISI Certified", s.specLine || ""].filter(Boolean),
    })),
    "safety-ppe-workwear",
    "PRODUCT"
  );
  pushAll(TOOL_SKUS, "tools-hardware", "PRODUCT");
  pushAll(
    LUCKNOW_SITE_KITS.map((k) => ({
      id: k.id,
      slug: k.id,
      title: k.title,
      brand: "CONON Site Kit",
      subcategory: k.stageLabel,
      price: k.kitPrice,
      mrp: k.mrp,
      unit: "kit",
      hsnCode: "8467",
      gstRate: 18,
      description: k.previewSummary,
      specBullets: k.items.map((it) => `${it.name} (${it.spec})`),
    })),
    "site-kits",
    "PRODUCT"
  );
  pushAll(
    LUCKNOW_RMC_GRADES.map((g) => ({
      id: g.id,
      slug: g.slug,
      title: g.nameEn,
      brand: `RMC ${g.gradeCode}`,
      price: g.ratePerM3,
      unit: "m³",
      hsnCode: g.hsnCode,
      gstRate: g.gstRate,
      description: g.description,
      specBullets: [g.slumpSpecMm, `${g.targetMpa28Day} MPa`, g.recommendedFor],
    })),
    "rmc-plant-direct",
    "PRODUCT"
  );

  cachedBaseItems = Array.from(byId.values());
  return cachedBaseItems;
}

/**
 * Returns ALL ecosystem items merged with any Admin-created custom items stored in the Media Vault.
 */
export function getUnifiedVaultItems(): UnifiedVaultItem[] {
  const base = buildBaseCatalogItems();
  const baseIds = new Set(base.map((b) => b.id));
  const customOverrides = getAllVaultOverridesList().filter((ov) => ov.isCustomItem && !baseIds.has(ov.productId));

  const catBySlug = new Map(VAULT_CATEGORIES.map((c) => [c.slug, c]));
  const customItems: UnifiedVaultItem[] = customOverrides.map((ov) => {
    const cat = catBySlug.get(ov.categorySlug || "cement-civil-works") || VAULT_CATEGORIES[0];
    return {
      id: ov.productId,
      slug: ov.slug || ov.productId,
      categorySlug: cat.slug,
      categoryName: cat.name,
      subcategory: ov.subcategory || cat.name,
      title: ov.title || ov.productId,
      brand: ov.brand || "CONON Certified",
      description: ov.description || "",
      specBullets: ov.specBullets || [],
      defaultImage: ov.images?.[0]?.url || "",
      price: ov.price ?? 0,
      mrp: ov.mrp ?? ov.price ?? 0,
      bulkPrice: ov.bulkPrice,
      bulkMinQty: ov.bulkMinQty,
      unit: ov.unit || "Unit",
      hsnCode: ov.hsnCode || cat.defaultHsnOrSac,
      gstRate: ov.gstRate ?? cat.defaultGstRate,
      isInStock: ov.isInStock !== false,
      itemKind: cat.group === "SERVICES" ? "SERVICE" : cat.group === "RENTALS" ? "RENTAL" : "PRODUCT",
    };
  });

  return [...customItems, ...base];
}
