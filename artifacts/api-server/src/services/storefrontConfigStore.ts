import fs from "fs";
import path from "path";
import crypto from "crypto";
import { query } from "@workspace/db";
import { STOREFRONT_CONFIG_PATH } from "../lib/paths";
import { stripLocalhostPrefix } from "../utils/uploadSanitizer";
import { logger } from "../lib/logger";

export interface HeroBannerRecord {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  imageUrl: string;
  ctaLabel: string;
  ctaRoute: string;
  isActive: boolean;
  sortOrder: number;
  updatedAt: string;
}

export interface GlobalStoreSettings {
  storeName: string;
  tagline: string;
  deliveryEtaText: string;
  freeDeliveryMinOrder: number;
  deliveryFee: number;
  assuredCashbackPercent: number;
  defaultGstPercent: number;
  supportPhone: string;
  supportWhatsapp: string;
  noticeStripEnabled: boolean;
  noticeStripText: string;
  maintenanceMode: boolean;
  updatedAt: string;
}

export interface StorefrontConfigData {
  settings: GlobalStoreSettings;
  banners: HeroBannerRecord[];
  updatedAt: string;
}

const DEFAULT_CONFIG: StorefrontConfigData = {
  settings: {
    storeName: "CONON-NOW",
    tagline: "Lucknow's 60-Min Construction Quick Commerce & RMC Plant Direct",
    deliveryEtaText: "60 Mins",
    freeDeliveryMinOrder: 1000,
    deliveryFee: 99,
    assuredCashbackPercent: 2,
    defaultGstPercent: 18,
    supportPhone: "+91 91200 60000",
    supportWhatsapp: "+91 91200 60000",
    noticeStripEnabled: false,
    noticeStripText: "Free 60-Min Lucknow Express Dispatch on material orders above ₹1,000 across 226030, 226010, 226028 & 226002",
    maintenanceMode: false,
    updatedAt: new Date().toISOString(),
  },
  banners: [
    {
      id: "banner_lucknow_live_command",
      title: "60-Min Construction Supply Across Lucknow",
      subtitle: "ISI-Verified Cement, Steel, CPVC, RMC Plant Direct & Skilled Squads",
      badge: "LUCKNOW LIVE",
      imageUrl: "/images/home-categories/cement-civil-works.webp",
      ctaLabel: "Explore Materials",
      ctaRoute: "/categories",
      isActive: true,
      sortOrder: 1,
      updatedAt: new Date().toISOString(),
    },
    {
      id: "banner_rmc_plant_direct",
      title: "RMC Plant Direct — Zero Slump Loss",
      subtitle: "M10–M50 Structural Concrete with Live Batching Telemetry",
      badge: "PLANT DIRECT",
      imageUrl: "/images/home-categories/rmc-ready-mix-concrete.webp",
      ctaLabel: "Book RMC Pour",
      ctaRoute: "/category/rmc-ready-mix-concrete",
      isActive: true,
      sortOrder: 2,
      updatedAt: new Date().toISOString(),
    },
  ],
  updatedAt: new Date().toISOString(),
};

class StorefrontConfigStore {
  private data: StorefrontConfigData = structuredClone(DEFAULT_CONFIG);
  private loaded = false;
  private dbTableReady = false;

  private ensureLoaded() {
    if (this.loaded) return;
    this.loaded = true;
    try {
      if (fs.existsSync(STOREFRONT_CONFIG_PATH)) {
        const raw = JSON.parse(fs.readFileSync(STOREFRONT_CONFIG_PATH, "utf8"));
        if (raw && typeof raw === "object") {
          this.data = this.normalize(raw);
        }
      }
    } catch {
      this.data = structuredClone(DEFAULT_CONFIG);
    }
    this.persistDisk();
  }

  private normalize(raw: any): StorefrontConfigData {
    const settingsRaw = raw?.settings || {};
    const bannersRaw = Array.isArray(raw?.banners) ? raw.banners : DEFAULT_CONFIG.banners;
    return {
      settings: {
        ...DEFAULT_CONFIG.settings,
        ...settingsRaw,
        freeDeliveryMinOrder: Number(
          settingsRaw.freeDeliveryMinOrder ?? DEFAULT_CONFIG.settings.freeDeliveryMinOrder
        ),
        deliveryFee: Number(settingsRaw.deliveryFee ?? DEFAULT_CONFIG.settings.deliveryFee),
        assuredCashbackPercent: Number(
          settingsRaw.assuredCashbackPercent ?? DEFAULT_CONFIG.settings.assuredCashbackPercent
        ),
        defaultGstPercent: Number(
          settingsRaw.defaultGstPercent ?? DEFAULT_CONFIG.settings.defaultGstPercent
        ),
        noticeStripEnabled: Boolean(settingsRaw.noticeStripEnabled),
        maintenanceMode: Boolean(settingsRaw.maintenanceMode),
        updatedAt: settingsRaw.updatedAt || new Date().toISOString(),
      },
      banners: bannersRaw
        .map((b: any, i: number) => ({
          id: String(b.id || `banner_${Date.now()}_${i}`),
          title: String(b.title || "Storefront Banner").trim(),
          subtitle: String(b.subtitle || "").trim(),
          badge: b.badge ? String(b.badge).trim() : undefined,
          imageUrl:
            stripLocalhostPrefix(b.imageUrl || "/images/home-categories/cement-civil-works.webp") ||
            "/images/home-categories/cement-civil-works.webp",
          ctaLabel: String(b.ctaLabel || "Shop Now").trim(),
          ctaRoute: String(b.ctaRoute || "/categories").trim(),
          isActive: b.isActive !== false,
          sortOrder: Number(b.sortOrder ?? i + 1),
          updatedAt: b.updatedAt || new Date().toISOString(),
        }))
        .sort((a: HeroBannerRecord, b: HeroBannerRecord) => a.sortOrder - b.sortOrder),
      updatedAt: raw?.updatedAt || new Date().toISOString(),
    };
  }

  private persistDisk() {
    try {
      fs.mkdirSync(path.dirname(STOREFRONT_CONFIG_PATH), { recursive: true });
      fs.writeFileSync(STOREFRONT_CONFIG_PATH, JSON.stringify(this.data, null, 2), "utf8");
    } catch (err) {
      logger.warn({ err }, "[StorefrontConfigStore] Disk save warning");
    }
  }

  private async ensureDbTable(): Promise<boolean> {
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL && !process.env.PGURI) return false;
    try {
      if (!this.dbTableReady) {
        await query(`
          CREATE TABLE IF NOT EXISTS storefront_config (
            id VARCHAR(40) PRIMARY KEY,
            config JSONB NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `);
        this.dbTableReady = true;
      }
      return true;
    } catch {
      return false;
    }
  }

  async getConfig(): Promise<StorefrontConfigData> {
    this.ensureLoaded();
    if (await this.ensureDbTable()) {
      try {
        const res = await query(`SELECT config FROM storefront_config WHERE id = 'default' LIMIT 1`);
        if (res?.rows?.[0]?.config) {
          this.data = this.normalize(res.rows[0].config);
          this.persistDisk();
        } else {
          await query(
            `INSERT INTO storefront_config (id, config) VALUES ('default', $1::jsonb) ON CONFLICT (id) DO NOTHING`,
            [JSON.stringify(this.data)]
          );
        }
      } catch {
        // Fallback to disk JSON
      }
    }
    return this.data;
  }

  async updateConfig(patch: {
    settings?: Partial<GlobalStoreSettings>;
    banners?: HeroBannerRecord[];
  }): Promise<StorefrontConfigData> {
    await this.getConfig();
    const now = new Date().toISOString();

    const nextSettings = patch.settings
      ? {
          ...this.data.settings,
          ...patch.settings,
          updatedAt: now,
        }
      : this.data.settings;

    const nextBanners = Array.isArray(patch.banners)
      ? patch.banners.map((b, idx) => ({
          ...b,
          id: b.id || `banner_${Date.now()}_${crypto.randomBytes(2).toString("hex")}`,
          imageUrl: stripLocalhostPrefix(b.imageUrl),
          sortOrder: Number(b.sortOrder ?? idx + 1),
          updatedAt: b.updatedAt || now,
        }))
      : this.data.banners;

    this.data = this.normalize({
      settings: nextSettings,
      banners: nextBanners,
      updatedAt: now,
    });
    this.persistDisk();

    if (await this.ensureDbTable()) {
      try {
        await query(
          `INSERT INTO storefront_config (id, config, updated_at)
           VALUES ('default', $1::jsonb, NOW())
           ON CONFLICT (id) DO UPDATE SET config = EXCLUDED.config, updated_at = NOW()`,
          [JSON.stringify(this.data)]
        );
      } catch {
        // Disk remains persisted
      }
    }

    return this.data;
  }
}

export const storefrontConfigStore = new StorefrontConfigStore();
