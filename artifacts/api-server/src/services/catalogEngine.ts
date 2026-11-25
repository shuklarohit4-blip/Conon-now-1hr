import fs from "fs";
import path from "path";
import { type Response } from "express";

export interface MasterCatalogSKU {
  id: string;
  skuId: string;
  name: string;
  brand: string;
  category: string;
  categoryName: string;
  subcategory?: string;
  unit: string;
  packSize?: string;
  oemModelCode?: string;
  shortDescription?: string;
  highlights?: string[];
  specs?: Array<{ label: string; value: string }>;
  fitGuardrailBadge?: string;
  preferredVendorId?: string;
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
  isFeatured?: boolean;
  pairedSkuIds?: string[];
  pairedProducts?: Array<{
    id: string;
    name: string;
    brand: string;
    sellingPrice: number;
    mrp: number;
    imageUrl: string;
    unit?: string;
    deliveryVehicleType?: string;
  }>;
  isCustom?: boolean;
  archived?: boolean;
  updatedAt: string;
}

export interface SKUOverride {
  sellingPrice?: number;
  mrp?: number;
  dealerLandingCost?: number;
  inStock?: boolean;
  express60Min?: boolean;
  gstPercent?: number;
  hsnCode?: string;
  deliveryVehicleType?: "2W_BIKE" | "3W_ELECTRIC_LOADER" | "4W_PICKUP" | "HEAVY_TRUCK";
  imageUrl?: string;
  name?: string;
  brand?: string;
  unit?: string;
  packSize?: string;
  oemModelCode?: string;
  shortDescription?: string;
  highlights?: string[];
  specs?: Array<{ label: string; value: string }>;
  fitGuardrailBadge?: string;
  preferredVendorId?: string;
  isFeatured?: boolean;
  pairedSkuIds?: string[];
  subcategory?: string;
  archived?: boolean;
  updatedAt: string;
}

export interface MandiRateItem {
  id: string;
  material: string;
  shortName: string;
  unit: string;
  currentPrice: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  trend: "up" | "down" | "stable";
  gstPercent: number;
  hsnCode: string;
  matchKeyword: string;
  categorySlug: string;
  lastUpdated: string;
}

export interface EquipmentRentalItem {
  id: string;
  name: string;
  category: string;
  rate: number;
  unit: string;
  available: boolean;
  specs: string;
  imageUrl?: string;
}

export interface CatalogFilterOptions {
  category?: string;
  brand?: string;
  gstPercent?: number;
  vehicle?: string;
  inStock?: boolean;
  isFeatured?: boolean;
  includeArchived?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

class CatalogEngine {
  private baseSkus: Map<string, MasterCatalogSKU> = new Map();
  private overrides: Map<string, SKUOverride> = new Map();
  private customSkus: Map<string, MasterCatalogSKU> = new Map();
  private mandiRates: MandiRateItem[] = [];
  private equipmentRentals: EquipmentRentalItem[] = [];
  private sseClients: Set<Response> = new Set();

  private rootDir: string;
  private dataDir: string;
  private baseCatalogFile: string;
  private overridesFile: string;
  private mandiFile: string;
  private rentalsFile: string;

  constructor() {
    this.rootDir = process.cwd();
    this.dataDir = path.resolve(this.rootDir, "artifacts/api-server/data");
    this.baseCatalogFile = path.resolve(this.dataDir, "base-catalog.json");
    this.overridesFile = path.resolve(this.dataDir, "catalog-overrides.json");
    this.mandiFile = path.resolve(this.dataDir, "mandi-rates.json");
    this.rentalsFile = path.resolve(this.dataDir, "equipment-rentals.json");

    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    this.init();
  }

  private init() {
    // 1. Load Base Catalog
    if (fs.existsSync(this.baseCatalogFile)) {
      try {
        const raw = JSON.parse(fs.readFileSync(this.baseCatalogFile, "utf-8"));
        if (Array.isArray(raw)) {
          for (const item of raw) {
            this.baseSkus.set(item.id, item);
          }
        }
      } catch (err) {
        console.error("Failed to load base-catalog.json:", err);
      }
    }

    // 2. Load Overrides & Custom SKUs
    if (fs.existsSync(this.overridesFile)) {
      try {
        const raw = JSON.parse(fs.readFileSync(this.overridesFile, "utf-8"));
        if (raw.overrides && typeof raw.overrides === "object") {
          for (const [k, v] of Object.entries(raw.overrides)) {
            this.overrides.set(k, v as SKUOverride);
          }
        }
        if (Array.isArray(raw.customSkus)) {
          for (const item of raw.customSkus) {
            this.customSkus.set(item.id, item);
          }
        }
      } catch (err) {
        console.error("Failed to load catalog-overrides.json:", err);
      }
    }

    // 3. Load Mandi Rates
    if (fs.existsSync(this.mandiFile)) {
      try {
        this.mandiRates = JSON.parse(fs.readFileSync(this.mandiFile, "utf-8"));
      } catch (err) {
        console.error("Failed to load mandi-rates.json:", err);
      }
    }

    // 4. Load Equipment Rentals
    if (fs.existsSync(this.rentalsFile)) {
      try {
        this.equipmentRentals = JSON.parse(fs.readFileSync(this.rentalsFile, "utf-8"));
      } catch (err) {
        console.error("Failed to load equipment-rentals.json:", err);
      }
    }

    console.log(
      `[CatalogEngine] Initialized: ${this.baseSkus.size} base SKUs, ${this.overrides.size} overrides, ${this.customSkus.size} custom SKUs, ${this.mandiRates.length} mandi commodities, ${this.equipmentRentals.length} equipment rentals.`
    );
  }

  private persistOverrides() {
    try {
      const payload = {
        updatedAt: new Date().toISOString(),
        overrides: Object.fromEntries(this.overrides),
        customSkus: Array.from(this.customSkus.values()),
      };
      fs.writeFileSync(this.overridesFile, JSON.stringify(payload, null, 2), "utf-8");
    } catch (err) {
      console.error("[CatalogEngine] Failed to write catalog-overrides.json:", err);
    }
  }

  private persistMandi() {
    try {
      fs.writeFileSync(this.mandiFile, JSON.stringify(this.mandiRates, null, 2), "utf-8");
    } catch (err) {
      console.error("[CatalogEngine] Failed to write mandi-rates.json:", err);
    }
  }

  private persistRentals() {
    try {
      fs.writeFileSync(this.rentalsFile, JSON.stringify(this.equipmentRentals, null, 2), "utf-8");
    } catch (err) {
      console.error("[CatalogEngine] Failed to write equipment-rentals.json:", err);
    }
  }

  public addSSEClient(res: Response) {
    this.sseClients.add(res);
    res.on("close", () => {
      this.sseClients.delete(res);
    });
  }

  public broadcast(event: string, payload: any) {
    const dataStr = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const client of this.sseClients) {
      try {
        client.write(dataStr);
      } catch {
        this.sseClients.delete(client);
      }
    }
  }

  public getMergedSku(id: string): MasterCatalogSKU | null {
    const custom = this.customSkus.get(id);
    if (custom) {
      const over = this.overrides.get(id);
      return over ? { ...custom, ...over } : custom;
    }

    const base = this.baseSkus.get(id);
    if (!base) return null;

    const over = this.overrides.get(id);
    if (!over) return base;

    return { ...base, ...over };
  }

  public getLiveCatalog(filters?: CatalogFilterOptions): {
    items: MasterCatalogSKU[];
    total: number;
    categories: Array<{ slug: string; name: string; count: number }>;
    brands: string[];
    kpis: {
      totalSkus: number;
      inStockCount: number;
      outOfStockCount: number;
      lowMarginCount: number;
      missingPhotoCount: number;
    };
  } {
    const all = new Map<string, MasterCatalogSKU>();
    const includeArchived = filters?.includeArchived === true;

    // Merge base skus
    for (const [id, base] of this.baseSkus) {
      const over = this.overrides.get(id);
      const merged = over ? { ...base, ...over } : base;
      if (includeArchived || !merged.archived) {
        all.set(id, merged);
      }
    }

    // Merge custom skus
    for (const [id, custom] of this.customSkus) {
      const over = this.overrides.get(id);
      const merged = over ? { ...custom, ...over } : custom;
      if (includeArchived || !merged.archived) {
        all.set(id, merged);
      }
    }

    let items = Array.from(all.values());

    // Resolve pairedProducts for cross-sell recommendations
    for (const item of items) {
      if (item.pairedSkuIds && item.pairedSkuIds.length > 0) {
        item.pairedProducts = item.pairedSkuIds
          .map((pid) => all.get(pid))
          .filter(Boolean)
          .map((p) => ({
            id: p!.id,
            name: p!.name,
            brand: p!.brand,
            sellingPrice: p!.sellingPrice,
            mrp: p!.mrp,
            imageUrl: p!.imageUrl,
            unit: p!.unit,
            deliveryVehicleType: p!.deliveryVehicleType,
          }));
      }
    }

    // Compute Category counts & Brands across the entire catalog before filtering
    const categoryCountMap: Record<string, { name: string; count: number }> = {};
    const brandSet = new Set<string>();

    let inStockCount = 0;
    let outOfStockCount = 0;
    let lowMarginCount = 0;
    let missingPhotoCount = 0;

    for (const item of items) {
      if (item.brand) brandSet.add(item.brand);
      const cat = item.category || "other";
      if (!categoryCountMap[cat]) {
        categoryCountMap[cat] = { name: item.categoryName || cat, count: 0 };
      }
      categoryCountMap[cat].count++;

      if (item.inStock) inStockCount++;
      else outOfStockCount++;

      const margin = item.sellingPrice - item.dealerLandingCost;
      const marginPct = item.sellingPrice > 0 ? (margin / item.sellingPrice) * 100 : 0;
      if (marginPct < 5) lowMarginCount++;

      if (!item.imageUrl || item.imageUrl.includes("placeholder") || item.imageUrl.endsWith(".svg")) {
        missingPhotoCount++;
      }
    }

    const categories = Object.entries(categoryCountMap).map(([slug, data]) => ({
      slug,
      name: data.name,
      count: data.count,
    })).sort((a, b) => b.count - a.count);

    const brands = Array.from(brandSet).sort();

    // Apply Filters
    if (filters) {
      if (filters.category && filters.category !== "all") {
        items = items.filter((i) => i.category === filters.category);
      }

      if (filters.brand && filters.brand !== "all") {
        items = items.filter((i) => i.brand.toLowerCase() === filters.brand!.toLowerCase());
      }

      if (filters.gstPercent !== undefined && !isNaN(filters.gstPercent)) {
        items = items.filter((i) => i.gstPercent === filters.gstPercent);
      }

      if (filters.vehicle && filters.vehicle !== "all") {
        items = items.filter((i) => i.deliveryVehicleType === filters.vehicle);
      }

      if (filters.inStock !== undefined) {
        items = items.filter((i) => i.inStock === filters.inStock);
      }

      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        items = items.filter((i) =>
          i.name.toLowerCase().includes(q) ||
          i.brand.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q) ||
          (i.hsnCode && i.hsnCode.includes(q)) ||
          (i.category && i.category.toLowerCase().includes(q))
        );
      }
    }

    const total = items.length;

    // Optional Pagination
    if (filters?.offset !== undefined || filters?.limit !== undefined) {
      const offset = filters.offset || 0;
      const limit = filters.limit || items.length;
      items = items.slice(offset, offset + limit);
    }

    return {
      items,
      total,
      categories,
      brands,
      kpis: {
        totalSkus: all.size,
        inStockCount,
        outOfStockCount,
        lowMarginCount,
        missingPhotoCount,
      },
    };
  }

  public updateSku(id: string, patch: Partial<MasterCatalogSKU>): MasterCatalogSKU | null {
    const existing = this.getMergedSku(id);
    if (!existing) return null;

    const currentOverride = this.overrides.get(id) || ({} as SKUOverride);
    const updatedOverride: SKUOverride = {
      ...currentOverride,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    this.overrides.set(id, updatedOverride);
    this.persistOverrides();

    const merged = this.getMergedSku(id)!;
    this.broadcast("catalog_updated", {
      type: "sku_patch",
      skuId: id,
      item: merged,
      timestamp: new Date().toISOString(),
    });

    return merged;
  }

  public createSku(data: Omit<MasterCatalogSKU, "id" | "skuId" | "updatedAt"> & { id?: string }): MasterCatalogSKU {
    const id = (data.id || `${data.category}-${Date.now().toString().slice(-6)}`).toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const sku: MasterCatalogSKU = {
      ...data,
      id,
      skuId: id,
      isCustom: true,
      inStock: data.inStock !== false,
      express60Min: data.express60Min !== false,
      updatedAt: new Date().toISOString(),
    };

    this.customSkus.set(id, sku);
    this.persistOverrides();

    this.broadcast("catalog_updated", {
      type: "sku_create",
      skuId: id,
      item: sku,
      timestamp: new Date().toISOString(),
    });

    return sku;
  }

  public duplicateSku(id: string): MasterCatalogSKU | null {
    const existing = this.getMergedSku(id);
    if (!existing) return null;

    const shortId = Date.now().toString(36).slice(-4);
    const newId = `${existing.id}-copy-${shortId}`.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const newSku: MasterCatalogSKU = {
      ...existing,
      id: newId,
      skuId: newId,
      name: `${existing.name} (Copy)`,
      isCustom: true,
      updatedAt: new Date().toISOString(),
    };

    this.customSkus.set(newId, newSku);
    this.persistOverrides();

    this.broadcast("catalog_updated", {
      type: "sku_duplicate",
      skuId: newId,
      sourceId: id,
      item: newSku,
      timestamp: new Date().toISOString(),
    });

    return newSku;
  }

  public archiveSku(id: string, archived: boolean = true): MasterCatalogSKU | null {
    return this.updateSku(id, { archived });
  }

  public bulkUpdate(options: {
    skuIds?: string[];
    category?: string;
    brand?: string;
    adjustmentType: "flat_add" | "flat_sub" | "percent_add" | "percent_sub" | "set_stock_in" | "set_stock_out";
    value?: number;
    dryRun?: boolean;
  }): {
    affectedCount: number;
    preview: Array<{ id: string; name: string; oldPrice: number; newPrice: number; inStock: boolean }>;
  } {
    const { items } = this.getLiveCatalog();
    let targets = items;

    if (options.skuIds && options.skuIds.length > 0) {
      const idSet = new Set(options.skuIds);
      targets = targets.filter((i) => idSet.has(i.id));
    } else {
      if (options.category && options.category !== "all") {
        targets = targets.filter((i) => i.category === options.category);
      }
      if (options.brand && options.brand !== "all") {
        targets = targets.filter((i) => i.brand.toLowerCase() === options.brand!.toLowerCase());
      }
    }

    const preview: Array<{ id: string; name: string; oldPrice: number; newPrice: number; inStock: boolean }> = [];
    const val = Number(options.value || 0);

    for (const item of targets) {
      let newPrice = item.sellingPrice;
      let newStock = item.inStock;

      if (options.adjustmentType === "flat_add") {
        newPrice = Math.max(1, item.sellingPrice + val);
      } else if (options.adjustmentType === "flat_sub") {
        newPrice = Math.max(1, item.sellingPrice - val);
      } else if (options.adjustmentType === "percent_add") {
        newPrice = Math.round(item.sellingPrice * (1 + val / 100));
      } else if (options.adjustmentType === "percent_sub") {
        newPrice = Math.round(item.sellingPrice * (1 - val / 100));
      } else if (options.adjustmentType === "set_stock_in") {
        newStock = true;
      } else if (options.adjustmentType === "set_stock_out") {
        newStock = false;
      }

      preview.push({
        id: item.id,
        name: item.name,
        oldPrice: item.sellingPrice,
        newPrice,
        inStock: newStock,
      });

      if (!options.dryRun) {
        const curOverride = this.overrides.get(item.id) || ({} as SKUOverride);
        this.overrides.set(item.id, {
          ...curOverride,
          sellingPrice: newPrice,
          inStock: newStock,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    if (!options.dryRun && preview.length > 0) {
      this.persistOverrides();
      this.broadcast("catalog_updated", {
        type: "bulk_update",
        affectedCount: preview.length,
        timestamp: new Date().toISOString(),
      });
    }

    return {
      affectedCount: preview.length,
      preview: preview.slice(0, 50),
    };
  }

  // Mandi Rates Controller
  public getMandiRates(): MandiRateItem[] {
    return this.mandiRates;
  }

  public updateMandiRate(id: string, newPrice: number, cascadeToCatalog: boolean = false): {
    item: MandiRateItem | null;
    cascadeCount: number;
  } {
    const item = this.mandiRates.find((m) => m.id === id || m.material.toLowerCase() === id.toLowerCase());
    if (!item) return { item: null, cascadeCount: 0 };

    const oldPrice = item.currentPrice;
    const delta = +(newPrice - oldPrice).toFixed(2);
    const changePercent = oldPrice > 0 ? +((delta / oldPrice) * 100).toFixed(2) : 0;

    item.previousPrice = oldPrice;
    item.currentPrice = newPrice;
    item.change = delta;
    item.changePercent = changePercent;
    item.trend = delta > 0 ? "up" : delta < 0 ? "down" : "stable";
    item.lastUpdated = new Date().toISOString();

    this.persistMandi();

    let cascadeCount = 0;
    if (cascadeToCatalog && delta !== 0 && item.categorySlug) {
      const keyword = (item.matchKeyword || "").toLowerCase();
      const { items } = this.getLiveCatalog({ category: item.categorySlug });
      for (const prod of items) {
        if (!keyword || prod.name.toLowerCase().includes(keyword) || prod.id.toLowerCase().includes(keyword)) {
          const newSkuPrice = Math.max(1, prod.sellingPrice + Math.round(delta));
          const curOver = this.overrides.get(prod.id) || ({} as SKUOverride);
          this.overrides.set(prod.id, {
            ...curOver,
            sellingPrice: newSkuPrice,
            updatedAt: new Date().toISOString(),
          });
          cascadeCount++;
        }
      }
      if (cascadeCount > 0) {
        this.persistOverrides();
      }
    }

    this.broadcast("catalog_updated", {
      type: "mandi_update",
      mandiId: item.id,
      newPrice,
      cascadeCount,
      timestamp: new Date().toISOString(),
    });

    return { item, cascadeCount };
  }

  // Equipment Rentals Controller
  public getEquipmentRentals(): EquipmentRentalItem[] {
    return this.equipmentRentals;
  }

  public updateEquipmentRental(id: string, patch: Partial<EquipmentRentalItem>): EquipmentRentalItem | null {
    const item = this.equipmentRentals.find((e) => e.id === id);
    if (!item) return null;

    Object.assign(item, patch);
    this.persistRentals();

    this.broadcast("catalog_updated", {
      type: "rental_update",
      rentalId: id,
      item,
      timestamp: new Date().toISOString(),
    });

    return item;
  }

  public createEquipmentRental(data: Omit<EquipmentRentalItem, "id">): EquipmentRentalItem {
    const id = `e${Date.now().toString().slice(-4)}`;
    const newItem: EquipmentRentalItem = { ...data, id };
    this.equipmentRentals.push(newItem);
    this.persistRentals();

    this.broadcast("catalog_updated", {
      type: "rental_create",
      rentalId: id,
      item: newItem,
      timestamp: new Date().toISOString(),
    });

    return newItem;
  }
}

export const catalogEngine = new CatalogEngine();
