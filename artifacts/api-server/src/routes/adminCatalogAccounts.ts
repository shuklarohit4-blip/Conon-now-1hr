import { Router, type IRouter, type Request, type Response } from "express";
import fs from "fs";
import path from "path";
import { query } from "@workspace/db";
import { getIo, adminRoom } from "../socket";
import { ecosystemEngine } from "../services/ecosystemEngine";
import { servicesRentalsEngine } from "../services/servicesRentalsEngine";
import { categoryStore } from "../services/categoryStore";
import { productStore } from "../services/productStore";
import { syncBus } from "../services/syncBus";
import { vendorEngine } from "../services/vendorEngine";
import { REPO_ROOT } from "../lib/paths";
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

// Categories now live in unified backend categoryStore (`services/categoryStore.ts`)
// Master Products now live in unified backend productStore (`services/productStore.ts`)

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
 * CATEGORY ROUTES (UNIFIED SINGLE SOURCE OF TRUTH VIA categoryStore)
 * ──────────────────────────────────────────────────────────────────────────── */
// GET all categories
router.get("/admin/catalog/categories", async (_req: Request, res: Response) => {
  try {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    const extraProducts = await productStore.list({ includeArchived: true });
    const categories = await categoryStore.list({
      activeOnly: false,
      extraProducts,
    });
    return res.json({
      ok: true,
      success: true,
      count: categories.length,
      activeCount: categories.filter((c) => c.isActive !== false).length,
      categories,
    });
  } catch (err: any) {
    logger.error({ err }, "Error fetching admin catalog categories");
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST create new category
router.post("/admin/catalog/categories", async (req: Request, res: Response) => {
  try {
    const newCategory = await categoryStore.create(req.body || {});
    syncBus.publish({
      type: "CATEGORIES_UPDATED",
      entityId: newCategory.slug,
      action: "CREATE",
      summary: `Created category "${newCategory.title}"`,
      socketEvent: "catalog:category_created",
      socketPayload: newCategory,
    });
    return res.json({ ok: true, success: true, category: newCategory });
  } catch (err: any) {
    logger.error({ err }, "Error creating catalog category");
    return res.status(400).json({ success: false, error: err.message });
  }
});

// PATCH / PUT update category
router.patch("/admin/catalog/categories/:id", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || "");
    const updated = await categoryStore.update(id, req.body || {});
    syncBus.publish({
      type: "CATEGORIES_UPDATED",
      entityId: updated.slug,
      action: "UPDATE",
      summary: `Updated category "${updated.title}"`,
      socketEvent: "catalog:category_updated",
      socketPayload: updated,
    });
    return res.json({ ok: true, success: true, category: updated });
  } catch (err: any) {
    const status = err?.message?.includes("not found") ? 404 : 400;
    logger.error({ err }, "Error updating catalog category");
    return res.status(status).json({ success: false, error: err.message });
  }
});

router.put("/admin/catalog/categories/:id", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || "");
    const updated = await categoryStore.update(id, req.body || {});
    syncBus.publish({
      type: "CATEGORIES_UPDATED",
      entityId: updated.slug,
      action: "UPDATE",
      summary: `Updated category "${updated.title}"`,
      socketEvent: "catalog:category_updated",
      socketPayload: updated,
    });
    return res.json({ ok: true, success: true, category: updated });
  } catch (err: any) {
    const status = err?.message?.includes("not found") ? 404 : 400;
    logger.error({ err }, "Error updating catalog category");
    return res.status(status).json({ success: false, error: err.message });
  }
});

/* ────────────────────────────────────────────────────────────────────────────
 * PRODUCT ROUTES (UNIFIED MASTER PRODUCT CMS VIA productStore)
 * ──────────────────────────────────────────────────────────────────────────── */
router.get("/admin/catalog/products", async (req: Request, res: Response) => {
  try {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    const { category, search, locked, includeArchived } = req.query;
    const products = await productStore.list({
      category: typeof category === "string" ? category : undefined,
      search: typeof search === "string" ? search : undefined,
      locked: locked !== undefined ? locked === "true" : undefined,
      includeArchived: includeArchived === "true" || includeArchived === "1",
    });
    return res.json({ success: true, ok: true, products, total: products.length });
  } catch (err: any) {
    logger.error({ err }, "Error fetching master products");
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET CSV Export for Rapid Lucknow Market Rate Edits
router.get("/admin/catalog/products/export.csv", async (req: Request, res: Response) => {
  try {
    const category = typeof req.query.category === "string" ? req.query.category : undefined;
    const items = await productStore.list({ category, includeArchived: false });
    const header = `"id","title","brand","categorySlug","unit","mrp","sellingPrice","bulkPrice","bulkMinQty","stockQty","isInStock","hsnCode","gstRate"\n`;
    const rows = items.map((p) =>
      [
        p.id,
        `"${p.title.replace(/"/g, '""')}"`,
        `"${p.brand.replace(/"/g, '""')}"`,
        p.categorySlug,
        `"${p.unit.replace(/"/g, '""')}"`,
        p.mrp,
        p.sellingPrice,
        p.bulkPrice,
        p.bulkMinQty,
        p.stockQty,
        p.isInStock,
        p.hsnCode,
        p.gstRate,
      ].join(",")
    );
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="CONON_Lucknow_Rates_${new Date().toISOString().slice(0, 10)}.csv"`);
    return res.send(header + rows.join("\n"));
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "CSV export failed" });
  }
});

// POST Import Bulk Rate CSV
router.post("/admin/catalog/products/import-csv", async (req: Request, res: Response) => {
  try {
    const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    if (rows.length === 0) {
      return res.status(400).json({ success: false, error: "rows array is required" });
    }
    const updated = await productStore.bulkUpdate(rows);
    syncBus.publish({
      type: "CATALOG_UPDATED",
      action: "BULK_CSV_IMPORT",
      summary: `Imported CSV market rates for ${updated.length} SKUs`,
      socketEvent: "catalog:product_updated",
      socketPayload: { bulkCount: updated.length },
    });
    return res.json({ success: true, ok: true, updatedCount: updated.length, products: updated });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err?.message || "CSV import failed" });
  }
});

// PUT Bulk Inline Edit Save
router.put("/admin/catalog/products/bulk-update", async (req: Request, res: Response) => {
  try {
    const updates = Array.isArray(req.body?.updates) ? req.body.updates : [];
    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: "updates array is required" });
    }
    const updated = await productStore.bulkUpdate(updates);
    syncBus.publish({
      type: "CATALOG_UPDATED",
      action: "BULK_UPDATE",
      summary: `Saved inline price/stock updates for ${updated.length} products`,
      socketEvent: "catalog:product_updated",
      socketPayload: { bulkCount: updated.length },
    });
    return res.json({ success: true, ok: true, updatedCount: updated.length, products: updated });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err?.message || "Bulk update failed" });
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

// POST create or duplicate master product
router.post("/admin/catalog/products", async (req: Request, res: Response) => {
  try {
    if (!req.body?.title || !req.body?.brand || !req.body?.categorySlug) {
      return res.status(400).json({
        success: false,
        error: "title, brand, and categorySlug are required",
      });
    }
    const created = await productStore.upsert(req.body);
    syncBus.publish({
      type: "CATALOG_UPDATED",
      entityId: created.id,
      action: "CREATE",
      summary: `Created product "${created.title}" (₹${created.sellingPrice})`,
      socketEvent: "catalog:product_created",
      socketPayload: created,
    });
    return res.json({ success: true, ok: true, product: created });
  } catch (err: any) {
    logger.error({ err }, "Error creating master product");
    return res.status(400).json({ success: false, error: err.message });
  }
});

// PATCH / PUT update master product
router.patch("/admin/catalog/products/:id", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || "");
    const existing = await productStore.getOne(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: "Master product not found" });
    }
    const updated = await productStore.upsert({ ...existing, ...req.body, id: existing.id });
    syncBus.publish({
      type: "CATALOG_UPDATED",
      entityId: updated.id,
      action: "UPDATE",
      summary: `Updated "${updated.title}" (₹${updated.sellingPrice})`,
      socketEvent: "catalog:product_updated",
      socketPayload: updated,
    });
    return res.json({ success: true, ok: true, product: updated });
  } catch (err: any) {
    logger.error({ err }, "Error updating master product");
    return res.status(400).json({ success: false, error: err.message });
  }
});

router.put("/admin/catalog/products/:id", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || "");
    const existing = await productStore.getOne(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: "Master product not found" });
    }
    const updated = await productStore.upsert({ ...existing, ...req.body, id: existing.id });
    syncBus.publish({
      type: "CATALOG_UPDATED",
      entityId: updated.id,
      action: "UPDATE",
      summary: `Updated "${updated.title}" (₹${updated.sellingPrice})`,
      socketEvent: "catalog:product_updated",
      socketPayload: updated,
    });
    return res.json({ success: true, ok: true, product: updated });
  } catch (err: any) {
    logger.error({ err }, "Error updating master product");
    return res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE master product
router.delete("/admin/catalog/products/:id", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || "");
    await productStore.delete(id);
    syncBus.publish({
      type: "CATALOG_UPDATED",
      entityId: id,
      action: "DELETE",
      summary: `Removed product ${id}`,
      socketEvent: "catalog:product_deleted",
      socketPayload: { id },
    });
    return res.json({ success: true, ok: true, message: `Product ${id} removed` });
  } catch (err: any) {
    logger.error({ err }, "Error deleting master product");
    return res.status(500).json({ success: false, error: err.message });
  }
});

/* ────────────────────────────────────────────────────────────────────────────
 * PARTNERS & DRIVERS DIRECTORY (WITH DISK PERSISTENCE)
 * ──────────────────────────────────────────────────────────────────────────── */
const DIRECTORY_STORE_PATH = path.resolve(REPO_ROOT, "artifacts/api-server/data/partners-directory.json");

interface DirectoryPartnerItem {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  zone: string;
  categories: string[];
  isActive: boolean;
  isVerified: boolean;
  slaScore: number;
}

function readPersistedPartners(): DirectoryPartnerItem[] {
  try {
    if (fs.existsSync(DIRECTORY_STORE_PATH)) {
      const raw = JSON.parse(fs.readFileSync(DIRECTORY_STORE_PATH, "utf8"));
      if (Array.isArray(raw) && raw.length > 0) return raw;
    }
  } catch {}
  const vp = (vendorEngine as any).getVendorProfile?.();
  return [
    {
      id: vp?.id || "hub-naka",
      name: vp?.shopName || "M/S Gupta Building & Civil Supply Hub",
      ownerName: vp?.ownerName || "Rajeshwar Gupta",
      phone: vp?.phone || "+91 98390 11220",
      zone: vp?.hubZone || "Sushant Golf City / Naka Corridor",
      categories: vp?.categories || ["Cement", "Steel", "CPVC Plumbing", "RMC"],
      isActive: vp?.isOpen ?? true,
      isVerified: true,
      slaScore: vp?.slaScore ?? 98,
    },
    {
      id: "hub-gomti-nagar",
      name: "Gomti Nagar Infra & Tiles Depot",
      ownerName: "Sandeep Verma",
      phone: "+91 94150 44112",
      zone: "Gomti Nagar & Ext (226010)",
      categories: ["Tiles & Stone", "Sanitary", "Paints & Putty"],
      isActive: true,
      isVerified: true,
      slaScore: 96,
    },
    {
      id: "hub-chinhat",
      name: "Chinhat Electricals & Ply Mandi",
      ownerName: "Vikram Tiwari",
      phone: "+91 97930 22990",
      zone: "Faizabad Road / Chinhat (226028)",
      categories: ["Wires & MCB", "Lighting", "Plywood & Hardware", "Tools"],
      isActive: true,
      isVerified: true,
      slaScore: 95,
    },
  ];
}

function writePersistedPartners(list: DirectoryPartnerItem[]) {
  try {
    fs.mkdirSync(path.dirname(DIRECTORY_STORE_PATH), { recursive: true });
    fs.writeFileSync(DIRECTORY_STORE_PATH, JSON.stringify(list, null, 2), "utf8");
  } catch {}
}

router.get("/admin/directory", (_req: Request, res: Response) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  const vendors = readPersistedPartners();
  const drivers = ecosystemEngine.getAllDrivers();
  return res.json({ ok: true, success: true, vendors, drivers });
});

router.patch("/admin/directory/vendors/:id", (req: Request, res: Response) => {
  const id = String(req.params.id || "");
  const list = readPersistedPartners();
  const idx = list.findIndex((v) => v.id === id);
  if (idx === -1) return res.status(404).json({ ok: false, error: "Partner not found" });
  list[idx] = {
    ...list[idx],
    ...(req.body || {}),
    id: list[idx].id,
  };
  writePersistedPartners(list);
  syncBus.publish({
    type: "PARTNERS_UPDATED",
    entityId: id,
    action: "UPDATE",
    summary: `Updated Partner "${list[idx].name}" (${list[idx].isActive ? "Active" : "Paused"})`,
  });
  return res.json({ ok: true, success: true, vendor: list[idx] });
});

router.post("/admin/directory/vendors", (req: Request, res: Response) => {
  const { name, ownerName, phone, zone, categories } = req.body || {};
  if (!name || !phone) {
    return res.status(400).json({ ok: false, error: "Vendor name and phone are required" });
  }
  const list = readPersistedPartners();
  const item: DirectoryPartnerItem = {
    id: `hub-${Date.now().toString(36)}`,
    name: String(name).trim(),
    ownerName: String(ownerName || name).trim(),
    phone: String(phone).trim(),
    zone: String(zone || "Lucknow (226030 / 226010)").trim(),
    categories: Array.isArray(categories) ? categories : String(categories || "General").split(",").map((s) => s.trim()).filter(Boolean),
    isActive: true,
    isVerified: true,
    slaScore: 98,
  };
  list.unshift(item);
  writePersistedPartners(list);
  syncBus.publish({
    type: "PARTNERS_UPDATED",
    entityId: item.id,
    action: "CREATE",
    summary: `Added Partner Vendor "${item.name}"`,
  });
  return res.json({ ok: true, success: true, vendor: item });
});

router.patch("/admin/directory/drivers/:id", (req: Request, res: Response) => {
  const id = String(req.params.id || "");
  const drv = ecosystemEngine.getDriver(id);
  if (!drv) return res.status(404).json({ ok: false, error: "Driver not found" });
  if (req.body?.isOnline !== undefined) {
    ecosystemEngine.setDriverDuty(id, Boolean(req.body.isOnline));
  }
  if (req.body?.name) drv.name = String(req.body.name).trim();
  if (req.body?.phone) drv.phone = String(req.body.phone).trim();
  if (req.body?.currentZone) drv.currentZone = String(req.body.currentZone).trim();
  if (req.body?.vehiclePlate) drv.vehiclePlate = String(req.body.vehiclePlate).trim();
  if (req.body?.vehicleModel) drv.vehicleModel = String(req.body.vehicleModel).trim();
  syncBus.publish({
    type: "PARTNERS_UPDATED",
    entityId: id,
    action: "UPDATE",
    summary: `Updated Driver "${drv.name}" (${drv.isOnline ? "Online" : "Offline"})`,
  });
  return res.json({ ok: true, success: true, driver: drv });
});

router.post("/admin/directory/drivers", (req: Request, res: Response) => {
  const { name, phone, vehiclePlate, vehicleModel, vehicleType, currentZone } = req.body || {};
  if (!name || !phone) {
    return res.status(400).json({ ok: false, error: "Driver name and phone are required" });
  }
  const drv = ecosystemEngine.registerDriver({
    name: String(name).trim(),
    phone: String(phone).trim(),
    vehiclePlate: vehiclePlate ? String(vehiclePlate).trim() : undefined,
    vehicleModel: vehicleModel ? String(vehicleModel).trim() : undefined,
    vehicleType: vehicleType || "4W_PICKUP",
    currentZone: currentZone ? String(currentZone).trim() : "Lucknow Zone",
    isOnline: true,
  });
  syncBus.publish({
    type: "PARTNERS_UPDATED",
    entityId: drv.id,
    action: "CREATE",
    summary: `Onboarded Driver "${drv.name}"`,
  });
  return res.json({ ok: true, success: true, driver: drv });
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
