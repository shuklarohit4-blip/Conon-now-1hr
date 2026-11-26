import fs from "fs";
import path from "path";
import { query } from "@workspace/db";
import { logger } from "../lib/logger";
import { MEDIA_VAULT_STORE_PATH } from "../lib/paths";

export interface VaultImageRecord {
  id: string;
  url: string;
  caption?: string;
  isPrimary?: boolean;
  order: number;
}

export interface ProductMediaOverrideRecord {
  productId: string;
  categorySlug?: string;
  title?: string;
  brand?: string;
  subcategory?: string;
  description?: string;
  specBullets: string[];
  images: VaultImageRecord[];
  price?: number | null;
  mrp?: number | null;
  bulkPrice?: number | null;
  bulkMinQty?: number | null;
  hsnCode?: string;
  gstRate?: number | null;
  unit?: string;
  isInStock?: boolean;
  isAdminVerifiedMedia: boolean;
  isCustomItem?: boolean;
  updatedAt: string;
}

function hasPostgresConfigured(): boolean {
  const rawDb = process.env.DATABASE_URL || "";
  return Boolean(
    process.env.POSTGRES_URL ||
      process.env.PGURI ||
      rawDb.startsWith("postgres://") ||
      rawDb.startsWith("postgresql://")
  );
}

class MediaVaultEngine {
  private overrides = new Map<string, ProductMediaOverrideRecord>();
  private pgInitialized = false;

  constructor() {
    this.loadFromDisk();
    void this.initPostgresAndHydrate();
  }

  private loadFromDisk() {
    try {
      if (!fs.existsSync(MEDIA_VAULT_STORE_PATH)) return;
      const raw = JSON.parse(fs.readFileSync(MEDIA_VAULT_STORE_PATH, "utf-8"));
      const list = Array.isArray(raw?.overrides)
        ? raw.overrides
        : raw?.overrides && typeof raw.overrides === "object"
        ? Object.values(raw.overrides)
        : Array.isArray(raw)
        ? raw
        : [];
      for (const item of list) {
        if (item?.productId) {
          this.overrides.set(String(item.productId), this.normalizeRecord(item));
        }
      }
      logger.info(`[MediaVault] Loaded ${this.overrides.size} product media overrides from disk.`);
    } catch (err) {
      logger.warn({ err }, "[MediaVault] Failed to read media-vault-overrides.json");
    }
  }

  private saveToDisk() {
    try {
      const dir = path.dirname(MEDIA_VAULT_STORE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const payload = {
        updatedAt: new Date().toISOString(),
        overrides: Object.fromEntries(this.overrides),
      };
      const tmpPath = `${MEDIA_VAULT_STORE_PATH}.tmp`;
      fs.writeFileSync(tmpPath, JSON.stringify(payload, null, 2), "utf-8");
      fs.renameSync(tmpPath, MEDIA_VAULT_STORE_PATH);
    } catch (err) {
      logger.error({ err }, "[MediaVault] Failed to persist disk JSON store");
    }
  }

  private async ensurePgTable(): Promise<boolean> {
    if (!hasPostgresConfigured()) return false;
    if (this.pgInitialized) return true;
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS product_media_overrides (
            product_id TEXT PRIMARY KEY,
            category_slug TEXT,
            title TEXT,
            brand TEXT,
            subcategory TEXT,
            description TEXT,
            spec_bullets JSONB NOT NULL DEFAULT '[]'::jsonb,
            images JSONB NOT NULL DEFAULT '[]'::jsonb,
            price NUMERIC,
            mrp NUMERIC,
            bulk_price NUMERIC,
            bulk_min_qty NUMERIC,
            hsn_code TEXT,
            gst_rate NUMERIC,
            unit TEXT,
            is_in_stock BOOLEAN NOT NULL DEFAULT true,
            is_admin_verified_media BOOLEAN NOT NULL DEFAULT true,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      this.pgInitialized = true;
      return true;
    } catch {
      return false;
    }
  }

  private async initPostgresAndHydrate() {
    if (!(await this.ensurePgTable())) return;
    try {
      const res = await query(`
        SELECT product_id, category_slug, title, brand, subcategory, description,
               spec_bullets, images, price::float, mrp::float, bulk_price::float,
               bulk_min_qty::float, hsn_code, gst_rate::float, unit,
               is_in_stock, is_admin_verified_media, updated_at
        FROM product_media_overrides
      `);
      if (res?.rows?.length) {
        for (const r of res.rows) {
          const rec = this.normalizeRecord({
            productId: r.product_id,
            categorySlug: r.category_slug || undefined,
            title: r.title || undefined,
            brand: r.brand || undefined,
            subcategory: r.subcategory || undefined,
            description: r.description || undefined,
            specBullets: Array.isArray(r.spec_bullets) ? r.spec_bullets : [],
            images: Array.isArray(r.images) ? r.images : [],
            price: r.price ?? undefined,
            mrp: r.mrp ?? undefined,
            bulkPrice: r.bulk_price ?? undefined,
            bulkMinQty: r.bulk_min_qty ?? undefined,
            hsnCode: r.hsn_code || undefined,
            gstRate: r.gst_rate ?? undefined,
            unit: r.unit || undefined,
            isInStock: r.is_in_stock !== false,
            isAdminVerifiedMedia: r.is_admin_verified_media !== false,
            updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
          });
          this.overrides.set(rec.productId, rec);
        }
        this.saveToDisk();
        logger.info(`[MediaVault] Hydrated ${res.rows.length} records from PostgreSQL.`);
      }
    } catch (err) {
      logger.warn({ err }, "[MediaVault] PostgreSQL hydration skipped; using disk store.");
    }
  }

  private normalizeImages(imgs: any[]): VaultImageRecord[] {
    if (!Array.isArray(imgs)) return [];
    const clean = imgs
      .map((img, idx) => {
        if (!img) return null;
        if (typeof img === "string") {
          return {
            id: `img-${idx}-${Date.now()}`,
            url: img,
            caption: idx === 0 ? "Front View" : undefined,
            isPrimary: idx === 0,
            order: idx,
          } as VaultImageRecord;
        }
        const url = String(img.url || "").trim();
        if (!url) return null;
        return {
          id: String(img.id || `img-${idx}-${Date.now()}`),
          url,
          caption: img.caption ? String(img.caption) : undefined,
          isPrimary: idx === 0,
          order: idx,
        } as VaultImageRecord;
      })
      .filter((x): x is VaultImageRecord => Boolean(x))
      .slice(0, 6);

    return clean.map((item, idx) => ({
      ...item,
      isPrimary: idx === 0,
      order: idx,
    }));
  }

  private normalizeRecord(raw: Partial<ProductMediaOverrideRecord> & { productId: string }): ProductMediaOverrideRecord {
    const numOrUndef = (v: any): number | undefined => {
      if (v === undefined || v === null || v === "") return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    };

    const images = this.normalizeImages(raw.images || []);
    const bullets = Array.isArray(raw.specBullets)
      ? raw.specBullets.map((b) => String(b).trim()).filter(Boolean)
      : [];

    return {
      productId: String(raw.productId).trim(),
      categorySlug: raw.categorySlug ? String(raw.categorySlug) : undefined,
      title: raw.title !== undefined ? String(raw.title) : undefined,
      brand: raw.brand !== undefined ? String(raw.brand) : undefined,
      subcategory: raw.subcategory !== undefined ? String(raw.subcategory) : undefined,
      description: raw.description !== undefined ? String(raw.description) : undefined,
      specBullets: bullets,
      images,
      price: numOrUndef(raw.price),
      mrp: numOrUndef(raw.mrp),
      bulkPrice: numOrUndef(raw.bulkPrice),
      bulkMinQty: numOrUndef(raw.bulkMinQty),
      hsnCode: raw.hsnCode ? String(raw.hsnCode) : undefined,
      gstRate: numOrUndef(raw.gstRate),
      unit: raw.unit ? String(raw.unit) : undefined,
      isInStock: raw.isInStock !== undefined ? Boolean(raw.isInStock) : true,
      isAdminVerifiedMedia:
        raw.isAdminVerifiedMedia !== undefined ? Boolean(raw.isAdminVerifiedMedia) : images.length > 0,
      isCustomItem: raw.isCustomItem ? Boolean(raw.isCustomItem) : undefined,
      updatedAt: raw.updatedAt || new Date().toISOString(),
    };
  }

  private async upsertPg(rec: ProductMediaOverrideRecord): Promise<void> {
    if (!(await this.ensurePgTable())) return;
    try {
      await query(
        `INSERT INTO product_media_overrides (
           product_id, category_slug, title, brand, subcategory, description,
           spec_bullets, images, price, mrp, bulk_price, bulk_min_qty,
           hsn_code, gst_rate, unit, is_in_stock, is_admin_verified_media, updated_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9,$10,$11,$12,$13,$14,$15,$16,$17,NOW())
         ON CONFLICT (product_id) DO UPDATE SET
           category_slug = COALESCE(EXCLUDED.category_slug, product_media_overrides.category_slug),
           title = COALESCE(EXCLUDED.title, product_media_overrides.title),
           brand = COALESCE(EXCLUDED.brand, product_media_overrides.brand),
           subcategory = COALESCE(EXCLUDED.subcategory, product_media_overrides.subcategory),
           description = COALESCE(EXCLUDED.description, product_media_overrides.description),
           spec_bullets = EXCLUDED.spec_bullets,
           images = EXCLUDED.images,
           price = EXCLUDED.price,
           mrp = EXCLUDED.mrp,
           bulk_price = EXCLUDED.bulk_price,
           bulk_min_qty = EXCLUDED.bulk_min_qty,
           hsn_code = COALESCE(EXCLUDED.hsn_code, product_media_overrides.hsn_code),
           gst_rate = EXCLUDED.gst_rate,
           unit = COALESCE(EXCLUDED.unit, product_media_overrides.unit),
           is_in_stock = EXCLUDED.is_in_stock,
           is_admin_verified_media = EXCLUDED.is_admin_verified_media,
           updated_at = NOW()`,
        [
          rec.productId,
          rec.categorySlug || null,
          rec.title || null,
          rec.brand || null,
          rec.subcategory || null,
          rec.description ?? null,
          JSON.stringify(rec.specBullets || []),
          JSON.stringify(rec.images || []),
          rec.price ?? null,
          rec.mrp ?? null,
          rec.bulkPrice ?? null,
          rec.bulkMinQty ?? null,
          rec.hsnCode || null,
          rec.gstRate ?? null,
          rec.unit || null,
          rec.isInStock !== false,
          rec.isAdminVerifiedMedia,
        ]
      );
    } catch (err) {
      logger.warn({ err, productId: rec.productId }, "[MediaVault] PG upsert failed; disk copy saved");
    }
  }

  public getAllOverridesMap(): Record<string, ProductMediaOverrideRecord> {
    return Object.fromEntries(this.overrides);
  }

  public getAllOverridesList(): ProductMediaOverrideRecord[] {
    return Array.from(this.overrides.values());
  }

  public getOverride(productId: string): ProductMediaOverrideRecord | undefined {
    return this.overrides.get(productId);
  }

  public async upsertOverride(
    productId: string,
    patch: Partial<ProductMediaOverrideRecord>
  ): Promise<ProductMediaOverrideRecord> {
    const existing = this.overrides.get(productId);
    const merged = this.normalizeRecord({
      ...existing,
      ...patch,
      productId,
      updatedAt: new Date().toISOString(),
    });
    this.overrides.set(productId, merged);
    this.saveToDisk();
    await this.upsertPg(merged);
    return merged;
  }

  public async bulkApplyImages(params: {
    productIds: string[];
    images: VaultImageRecord[];
    categorySlug?: string;
    copyMode?: "cover_only" | "full_gallery";
    itemsMeta?: Record<string, { title?: string; brand?: string; categorySlug?: string; subcategory?: string }>;
  }): Promise<ProductMediaOverrideRecord[]> {
    const sourceImages = this.normalizeImages(params.images);
    const applyImages = params.copyMode === "cover_only" && sourceImages.length > 0 ? [sourceImages[0]] : sourceImages;

    const updatedRecords: ProductMediaOverrideRecord[] = [];
    for (const rawId of params.productIds) {
      const pid = String(rawId).trim();
      if (!pid) continue;
      const existing = this.overrides.get(pid);
      const meta = params.itemsMeta?.[pid];
      const nextImages = applyImages.map((img, i) => ({
        ...img,
        id: `${img.id}-${pid}-${i}`,
        isPrimary: i === 0,
        order: i,
      }));
      const merged = this.normalizeRecord({
        ...existing,
        productId: pid,
        categorySlug: existing?.categorySlug || meta?.categorySlug || params.categorySlug,
        title: existing?.title || meta?.title,
        brand: existing?.brand || meta?.brand,
        subcategory: existing?.subcategory || meta?.subcategory,
        images: nextImages,
        isAdminVerifiedMedia: nextImages.length > 0,
        updatedAt: new Date().toISOString(),
      });
      this.overrides.set(pid, merged);
      updatedRecords.push(merged);
      await this.upsertPg(merged);
    }

    this.saveToDisk();
    return updatedRecords;
  }

  public async importBackup(
    overridesInput: Record<string, Partial<ProductMediaOverrideRecord>> | ProductMediaOverrideRecord[]
  ): Promise<number> {
    const entries: Array<Partial<ProductMediaOverrideRecord> & { productId: string }> = Array.isArray(overridesInput)
      ? overridesInput.filter((x) => Boolean(x?.productId)) as Array<Partial<ProductMediaOverrideRecord> & { productId: string }>
      : Object.entries(overridesInput || {}).map(([k, v]) => ({ ...(v || {}), productId: v?.productId || k }));

    let count = 0;
    for (const item of entries) {
      if (!item.productId) continue;
      const rec = this.normalizeRecord(item);
      this.overrides.set(rec.productId, rec);
      await this.upsertPg(rec);
      count++;
    }
    this.saveToDisk();
    return count;
  }

  public async deleteOverride(productId: string): Promise<boolean> {
    const existed = this.overrides.delete(productId);
    if (existed) {
      this.saveToDisk();
      if (await this.ensurePgTable()) {
        try {
          await query(`DELETE FROM product_media_overrides WHERE product_id = $1`, [productId]);
        } catch {}
      }
    }
    return existed;
  }
}

export const mediaVaultEngine = new MediaVaultEngine();
