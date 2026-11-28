import fs from "fs";
import path from "path";
import crypto from "crypto";
import { CATALOG_PRODUCTS, query } from "@workspace/db";
import { PRODUCTS_STORE_PATH } from "../lib/paths";
import { stripLocalhostPrefix } from "../utils/uploadSanitizer";
import { mediaVaultEngine } from "./mediaVaultEngine";
import { logger } from "../lib/logger";

export type ProductImageSlot = "front" | "back" | "specs" | "application" | "packaging";

export interface ProductGalleryImage {
  id: string;
  url: string;
  slot?: ProductImageSlot;
  caption?: string;
  isPrimary?: boolean;
  order: number;
}

export interface ProductHighlightTile {
  label: string;
  value: string;
}

export interface ProductKeyInfoRow {
  label: string;
  value: string;
}

export interface ProductVariantItem {
  id: string;
  label: string;
  unit: string;
  price: number;
  mrp: number;
  stock?: number;
}

export interface ProductBulkSlab {
  minQty: number;
  price: number;
  label?: string;
}

export interface MasterProductRecord {
  id: string;
  slug: string;
  title: string;
  brand: string;
  categorySlug: string;
  subcategory?: string;
  unit: string;
  mrp: number;
  sellingPrice: number;
  bulkPrice: number;
  bulkMinQty: number;
  cashbackPercent: number;
  stockQty: number;
  hsnCode: string;
  gstRate: number;
  vehicleRequirement: "BIKE" | "LOADER";
  imageUrl: string;
  images: ProductGalleryImage[];
  description: string;
  specTags: ProductHighlightTile[];
  highlights: ProductHighlightTile[];
  keyInfo: ProductKeyInfoRow[];
  usageTips: string[];
  variants: ProductVariantItem[];
  bulkSlabs: ProductBulkSlab[];
  isInStock: boolean;
  isFeatured: boolean;
  isArchived: boolean;
  adminLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

function sanitizeSlug(raw: string): string {
  return (
    String(raw || "product")
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "product"
  );
}

function fromCatalogProduct(raw: any): MasterProductRecord {
  const selling = Number(raw.price ?? raw.sellingPrice ?? 0);
  const mrp = Number(raw.mrp ?? selling);
  const firstImg = stripLocalhostPrefix(raw.image || (Array.isArray(raw.images) ? raw.images[0] : "") || "");
  const galleryRaw: ProductGalleryImage[] = Array.isArray(raw.images)
    ? raw.images.slice(0, 5).map((img: any, i: number) => {
        const url = typeof img === "string" ? stripLocalhostPrefix(img) : stripLocalhostPrefix(img?.url);
        return {
          id: typeof img === "object" && img?.id ? String(img.id) : `img_${i + 1}`,
          url,
          slot: (["front", "back", "specs", "application", "packaging"][i] as ProductImageSlot) || "front",
          caption: (typeof img === "object" && img?.caption) || (i === 0 ? "Front View" : `View ${i + 1}`),
          isPrimary: i === 0,
          order: i,
        };
      }).filter((g: ProductGalleryImage) => Boolean(g.url))
    : firstImg
    ? [{ id: "img_1", url: firstImg, slot: "front", caption: "Front View", isPrimary: true, order: 0 }]
    : [];

  const specs = Array.isArray(raw.specifications)
    ? raw.specifications.map((s: any) => ({ label: String(s.label || s.name || "Spec"), value: String(s.value || "") }))
    : [];
  const bulkSlabs = Array.isArray(raw.bulkPricingTiers)
    ? raw.bulkPricingTiers.map((t: any) => ({
        minQty: Number(t.minQty || 10),
        price: Number(t.pricePerUnit || t.price || selling),
        label: t.label,
      }))
    : [];
  const bulkFirst = bulkSlabs[0];

  return {
    id: String(raw.id),
    slug: String(raw.slug || sanitizeSlug(raw.title || raw.name || raw.id)),
    title: String(raw.title || raw.name || "Product").trim(),
    brand: String(raw.brand || "CONON").trim(),
    categorySlug: String(raw.categorySlug || "cement-civil-works").trim(),
    subcategory: raw.subCategory || raw.subcategory || undefined,
    unit: String(raw.unit || "Unit").trim(),
    mrp,
    sellingPrice: selling,
    bulkPrice: bulkFirst ? bulkFirst.price : Math.round(selling * 0.94),
    bulkMinQty: bulkFirst ? bulkFirst.minQty : 10,
    cashbackPercent: Number(raw.cashbackPercent ?? 2),
    stockQty: Number(raw.stockQty ?? (raw.inStock === false ? 0 : 120)),
    hsnCode: String(raw.hsnCode || "38245010"),
    gstRate: Number(raw.gstRate ?? 18),
    vehicleRequirement:
      raw.categorySlug === "cement-civil-works" ||
      raw.categorySlug === "bricks-sand-gitti-aac" ||
      raw.categorySlug === "plywood-boards" ||
      raw.categorySlug === "tile-stone-installation"
        ? "LOADER"
        : "BIKE",
    imageUrl: firstImg || galleryRaw[0]?.url || "/images/home-categories/cement-civil-works.webp",
    images: galleryRaw,
    description: String(raw.description || "").trim(),
    specTags: specs.slice(0, 6),
    highlights: specs.slice(0, 6),
    keyInfo: specs,
    usageTips: Array.isArray(raw.highlights) ? raw.highlights.slice(0, 5) : [],
    variants: Array.isArray(raw.variants)
      ? raw.variants.map((v: any, idx: number) => ({
          id: String(v.id || `var_${idx + 1}`),
          label: String(v.label || v.unit || "Standard"),
          unit: String(v.unit || raw.unit || "Unit"),
          price: Number(v.price ?? selling),
          mrp: Number(v.mrp ?? mrp),
          stock: Number(v.stock ?? 50),
        }))
      : [],
    bulkSlabs,
    isInStock: raw.inStock !== false,
    isFeatured: Boolean(raw.isFeatured),
    isArchived: false,
    adminLocked: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

class ProductStore {
  private overridesById = new Map<string, MasterProductRecord>();
  private deletedIds = new Set<string>();
  private baseMap = new Map<string, MasterProductRecord>();
  private loaded = false;
  private dbMigrated = false;

  private ensureLoadedSync() {
    if (this.loaded) return;
    this.loaded = true;

    for (const raw of CATALOG_PRODUCTS as any[]) {
      if (!raw?.id) continue;
      const rec = fromCatalogProduct(raw);
      this.baseMap.set(rec.id, rec);
    }

    try {
      if (fs.existsSync(PRODUCTS_STORE_PATH)) {
        const parsed = JSON.parse(fs.readFileSync(PRODUCTS_STORE_PATH, "utf8"));
        if (parsed && typeof parsed === "object") {
          const items = Array.isArray(parsed.items) ? parsed.items : Array.isArray(parsed) ? parsed : [];
          for (const item of items) {
            if (!item?.id) continue;
            const cleaned = this.normalizeRecord(item);
            this.overridesById.set(cleaned.id, cleaned);
          }
          if (Array.isArray(parsed.deletedIds)) {
            for (const d of parsed.deletedIds) this.deletedIds.add(String(d));
          }
        }
      }
    } catch (err) {
      logger.warn({ err }, "[ProductStore] Disk JSON read warning");
    }
  }

  private normalizeRecord(raw: any): MasterProductRecord {
    const existing = this.overridesById.get(raw.id) || this.baseMap.get(raw.id);
    const selling = Number(raw.sellingPrice ?? raw.price ?? existing?.sellingPrice ?? 0);
    const mrp = Number(raw.mrp ?? existing?.mrp ?? selling);
    const rawImages: ProductGalleryImage[] = Array.isArray(raw.images)
      ? raw.images
          .slice(0, 5)
          .map((img: any, i: number) => {
            const url = typeof img === "string" ? stripLocalhostPrefix(img) : stripLocalhostPrefix(img?.url);
            return {
              id: typeof img === "object" && img?.id ? String(img.id) : `img_${i + 1}`,
              url,
              slot: (typeof img === "object" && img?.slot) || (["front", "back", "specs", "application", "packaging"][i] as ProductImageSlot) || "front",
              caption: (typeof img === "object" && img?.caption) || (i === 0 ? "Front View" : `View ${i + 1}`),
              isPrimary: i === 0,
              order: i,
            };
          })
          .filter((g: ProductGalleryImage) => Boolean(g.url))
      : existing?.images || [];

    const primaryUrl = stripLocalhostPrefix(
      raw.imageUrl || raw.image || rawImages[0]?.url || existing?.imageUrl || "/images/home-categories/cement-civil-works.webp"
    );
    const normalizedImages =
      rawImages.length > 0
        ? rawImages
        : primaryUrl
        ? [{ id: "img_1", url: primaryUrl, slot: "front" as ProductImageSlot, caption: "Front View", isPrimary: true, order: 0 }]
        : [];

    return {
      id: String(raw.id),
      slug: String(raw.slug || existing?.slug || sanitizeSlug(raw.title || raw.id)),
      title: String(raw.title ?? existing?.title ?? "").trim(),
      brand: String(raw.brand ?? existing?.brand ?? "CONON").trim(),
      categorySlug: String(raw.categorySlug ?? existing?.categorySlug ?? "cement-civil-works").trim(),
      subcategory: raw.subcategory !== undefined ? raw.subcategory : existing?.subcategory,
      unit: String(raw.unit ?? existing?.unit ?? "Unit").trim(),
      mrp,
      sellingPrice: selling,
      bulkPrice: Number(raw.bulkPrice ?? existing?.bulkPrice ?? selling),
      bulkMinQty: Number(raw.bulkMinQty ?? existing?.bulkMinQty ?? 10),
      cashbackPercent: Number(raw.cashbackPercent ?? existing?.cashbackPercent ?? 2),
      stockQty: Number(raw.stockQty ?? existing?.stockQty ?? (raw.isInStock === false ? 0 : 100)),
      hsnCode: String(raw.hsnCode ?? existing?.hsnCode ?? "38245010").trim(),
      gstRate: Number(raw.gstRate ?? existing?.gstRate ?? 18),
      vehicleRequirement:
        raw.vehicleRequirement === "LOADER" || raw.vehicleRequirement === "BIKE"
          ? raw.vehicleRequirement
          : existing?.vehicleRequirement || "BIKE",
      imageUrl: normalizedImages[0]?.url || primaryUrl,
      images: normalizedImages,
      description: String(raw.description ?? existing?.description ?? "").trim(),
      specTags: Array.isArray(raw.specTags) ? raw.specTags : existing?.specTags || [],
      highlights: Array.isArray(raw.highlights)
        ? raw.highlights
        : Array.isArray(raw.specTags)
        ? raw.specTags.slice(0, 6)
        : existing?.highlights || [],
      keyInfo: Array.isArray(raw.keyInfo)
        ? raw.keyInfo
        : Array.isArray(raw.specTags)
        ? raw.specTags
        : existing?.keyInfo || [],
      usageTips: Array.isArray(raw.usageTips) ? raw.usageTips : existing?.usageTips || [],
      variants: Array.isArray(raw.variants) ? raw.variants : existing?.variants || [],
      bulkSlabs: Array.isArray(raw.bulkSlabs) ? raw.bulkSlabs : existing?.bulkSlabs || [],
      isInStock: raw.isInStock !== undefined ? Boolean(raw.isInStock) : existing?.isInStock ?? true,
      isFeatured: raw.isFeatured !== undefined ? Boolean(raw.isFeatured) : existing?.isFeatured ?? false,
      isArchived: raw.isArchived !== undefined ? Boolean(raw.isArchived) : existing?.isArchived ?? false,
      adminLocked: raw.adminLocked !== undefined ? Boolean(raw.adminLocked) : existing?.adminLocked ?? true,
      createdAt: raw.createdAt || existing?.createdAt || new Date().toISOString(),
      updatedAt: raw.updatedAt || new Date().toISOString(),
    };
  }

  private persistDiskSync() {
    try {
      fs.mkdirSync(path.dirname(PRODUCTS_STORE_PATH), { recursive: true });
      const payload = {
        items: Array.from(this.overridesById.values()),
        deletedIds: Array.from(this.deletedIds),
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(PRODUCTS_STORE_PATH, JSON.stringify(payload, null, 2), "utf8");
    } catch (err) {
      logger.warn({ err }, "[ProductStore] Failed writing disk master-products.json");
    }
  }

  private async ensureDbReady() {
    if (this.dbMigrated) return;
    this.dbMigrated = true;
    try {
      await query(`
        ALTER TABLE IF EXISTS master_products
          ADD COLUMN IF NOT EXISTS cashback_percent NUMERIC(5,2) DEFAULT 2,
          ADD COLUMN IF NOT EXISTS stock_qty INT DEFAULT 100,
          ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
          ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
          ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb,
          ADD COLUMN IF NOT EXISTS highlights JSONB DEFAULT '[]'::jsonb,
          ADD COLUMN IF NOT EXISTS key_info JSONB DEFAULT '[]'::jsonb,
          ADD COLUMN IF NOT EXISTS usage_tips JSONB DEFAULT '[]'::jsonb,
          ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb,
          ADD COLUMN IF NOT EXISTS bulk_slabs JSONB DEFAULT '[]'::jsonb
      `);
      const dbRes = await query(
        `SELECT id, title, brand, category_slug as "categorySlug", subcategory, unit,
                mrp::float, selling_price::float as "sellingPrice", bulk_price::float as "bulkPrice",
                bulk_min_qty as "bulkMinQty", cashback_percent::float as "cashbackPercent",
                stock_qty as "stockQty", hsn_code as "hsnCode", gst_rate as "gstRate",
                vehicle_requirement as "vehicleRequirement", image_url as "imageUrl",
                images, description, spec_tags as "specTags", highlights, key_info as "keyInfo",
                usage_tips as "usageTips", variants, bulk_slabs as "bulkSlabs",
                is_in_stock as "isInStock", is_featured as "isFeatured", is_archived as "isArchived",
                admin_locked as "adminLocked", created_at as "createdAt", updated_at as "updatedAt"
         FROM master_products`
      );
      if (dbRes?.rows?.length > 0) {
        for (const row of dbRes.rows) {
          const norm = this.normalizeRecord(row);
          this.overridesById.set(norm.id, norm);
        }
        this.persistDiskSync();
      }
    } catch {
      // Postgres optional
    }
  }

  private async upsertPostgres(p: MasterProductRecord) {
    try {
      await query(
        `INSERT INTO master_products (
           id, title, brand, category_slug, subcategory, unit, mrp, selling_price,
           bulk_price, bulk_min_qty, cashback_percent, stock_qty, hsn_code, gst_rate,
           vehicle_requirement, image_url, images, description, spec_tags, highlights,
           key_info, usage_tips, variants, bulk_slabs, is_in_stock, is_featured,
           is_archived, admin_locked, updated_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8,
           $9, $10, $11, $12, $13, $14,
           $15, $16, $17::jsonb, $18, $19::jsonb, $20::jsonb,
           $21::jsonb, $22::jsonb, $23::jsonb, $24::jsonb, $25, $26,
           $27, $28, NOW()
         )
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           brand = EXCLUDED.brand,
           category_slug = EXCLUDED.category_slug,
           subcategory = EXCLUDED.subcategory,
           unit = EXCLUDED.unit,
           mrp = EXCLUDED.mrp,
           selling_price = EXCLUDED.selling_price,
           bulk_price = EXCLUDED.bulk_price,
           bulk_min_qty = EXCLUDED.bulk_min_qty,
           cashback_percent = EXCLUDED.cashback_percent,
           stock_qty = EXCLUDED.stock_qty,
           hsn_code = EXCLUDED.hsn_code,
           gst_rate = EXCLUDED.gst_rate,
           vehicle_requirement = EXCLUDED.vehicle_requirement,
           image_url = EXCLUDED.image_url,
           images = EXCLUDED.images,
           description = EXCLUDED.description,
           spec_tags = EXCLUDED.spec_tags,
           highlights = EXCLUDED.highlights,
           key_info = EXCLUDED.key_info,
           usage_tips = EXCLUDED.usage_tips,
           variants = EXCLUDED.variants,
           bulk_slabs = EXCLUDED.bulk_slabs,
           is_in_stock = EXCLUDED.is_in_stock,
           is_featured = EXCLUDED.is_featured,
           is_archived = EXCLUDED.is_archived,
           admin_locked = EXCLUDED.admin_locked,
           updated_at = NOW()`,
        [
          p.id,
          p.title,
          p.brand,
          p.categorySlug,
          p.subcategory || null,
          p.unit,
          p.mrp,
          p.sellingPrice,
          p.bulkPrice,
          p.bulkMinQty,
          p.cashbackPercent,
          p.stockQty,
          p.hsnCode,
          p.gstRate,
          p.vehicleRequirement,
          p.imageUrl,
          JSON.stringify(p.images || []),
          p.description,
          JSON.stringify(p.specTags || []),
          JSON.stringify(p.highlights || []),
          JSON.stringify(p.keyInfo || []),
          JSON.stringify(p.usageTips || []),
          JSON.stringify(p.variants || []),
          JSON.stringify(p.bulkSlabs || []),
          p.isInStock,
          p.isFeatured,
          p.isArchived,
          p.adminLocked,
        ]
      );
    } catch {
      // Non-fatal when Postgres offline
    }
  }

  private async syncToMediaVault(p: MasterProductRecord) {
    try {
      await mediaVaultEngine.upsertOverride(p.id, {
        productId: p.id,
        categorySlug: p.categorySlug,
        title: p.title,
        brand: p.brand,
        subcategory: p.subcategory,
        description: p.description,
        specBullets: p.usageTips,
        images: p.images.map((g, i) => ({
          id: g.id,
          url: g.url,
          caption: g.caption || "Front View",
          isPrimary: i === 0,
          order: i,
        })),
        price: p.sellingPrice,
        mrp: p.mrp,
        bulkPrice: p.bulkPrice,
        bulkMinQty: p.bulkMinQty,
        hsnCode: p.hsnCode,
        gstRate: p.gstRate,
        unit: p.unit,
        isInStock: p.isInStock,
        isAdminVerifiedMedia: true,
      });
    } catch {
      // Optional vault bridge
    }
  }

  async list(filter?: {
    category?: string;
    search?: string;
    locked?: boolean;
    includeArchived?: boolean;
    limit?: number;
  }): Promise<MasterProductRecord[]> {
    this.ensureLoadedSync();
    await this.ensureDbReady();

    const merged = new Map<string, MasterProductRecord>();
    for (const [id, rec] of this.baseMap.entries()) {
      if (!this.deletedIds.has(id)) merged.set(id, rec);
    }
    for (const [id, ov] of this.overridesById.entries()) {
      if (!this.deletedIds.has(id)) merged.set(id, ov);
    }

    let items = Array.from(merged.values());
    if (!filter?.includeArchived) {
      items = items.filter((p) => !p.isArchived);
    }
    if (filter?.category && filter.category !== "all") {
      items = items.filter(
        (p) => p.categorySlug.toLowerCase() === filter.category!.toLowerCase()
      );
    }
    if (filter?.search?.trim()) {
      const term = filter.search.toLowerCase().trim();
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.brand.toLowerCase().includes(term) ||
          p.hsnCode.includes(term) ||
          p.categorySlug.toLowerCase().includes(term) ||
          (p.subcategory && p.subcategory.toLowerCase().includes(term))
      );
    }
    if (filter?.locked !== undefined) {
      items = items.filter((p) => p.adminLocked === filter.locked);
    }

    items.sort((a, b) => {
      const aCustom = this.overridesById.has(a.id) ? 1 : 0;
      const bCustom = this.overridesById.has(b.id) ? 1 : 0;
      if (aCustom !== bCustom) return bCustom - aCustom;
      return b.updatedAt.localeCompare(a.updatedAt);
    });

    if (filter?.limit && filter.limit > 0) {
      items = items.slice(0, filter.limit);
    }
    return items;
  }

  async getOne(idOrSlug: string): Promise<MasterProductRecord | null> {
    const all = await this.list({ includeArchived: true });
    return all.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null;
  }

  async upsert(payload: Record<string, any>): Promise<MasterProductRecord> {
    this.ensureLoadedSync();
    await this.ensureDbReady();

    const title = String(payload.title || "").trim();
    if (!title) throw new Error("Product title is required.");
    const sellingPrice = Number(payload.sellingPrice ?? payload.price ?? 0);
    const mrp = Number(payload.mrp ?? sellingPrice);
    if (Number.isNaN(sellingPrice) || sellingPrice < 0) {
      throw new Error("Selling price must be a non-negative number.");
    }
    if (Number.isNaN(mrp) || mrp < 0) {
      throw new Error("MRP must be a non-negative number.");
    }

    const id =
      payload.id && String(payload.id).trim()
        ? String(payload.id).trim()
        : `mp_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;

    this.deletedIds.delete(id);
    const normalized = this.normalizeRecord({
      ...payload,
      id,
      updatedAt: new Date().toISOString(),
    });
    this.overridesById.set(normalized.id, normalized);
    this.persistDiskSync();
    await this.upsertPostgres(normalized);
    await this.syncToMediaVault(normalized);
    return normalized;
  }

  async bulkUpdate(
    updates: Array<{
      id: string;
      sellingPrice?: number;
      mrp?: number;
      bulkPrice?: number;
      stockQty?: number;
      isInStock?: boolean;
      isFeatured?: boolean;
    }>
  ): Promise<MasterProductRecord[]> {
    this.ensureLoadedSync();
    await this.ensureDbReady();

    const saved: MasterProductRecord[] = [];
    for (const u of updates) {
      const current = this.overridesById.get(u.id) || this.baseMap.get(u.id);
      if (!current) continue;
      const next = await this.upsert({
        ...current,
        ...u,
      });
      saved.push(next);
    }
    return saved;
  }

  async delete(id: string): Promise<boolean> {
    this.ensureLoadedSync();
    await this.ensureDbReady();

    this.overridesById.delete(id);
    this.deletedIds.add(id);
    this.persistDiskSync();
    try {
      await query(`DELETE FROM master_products WHERE id = $1`, [id]);
    } catch {
      // Optional Postgres
    }
    return true;
  }
}

export const productStore = new ProductStore();
