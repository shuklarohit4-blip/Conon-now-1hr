import fs from "fs";
import path from "path";
import crypto from "crypto";
import { query } from "@workspace/db";
import { MERCHANDISING_STORE_PATH } from "../lib/paths";
import { stripLocalhostPrefix } from "../utils/uploadSanitizer";
import { logger } from "../lib/logger";

export type LinkType = "category" | "product" | "search" | "url";
export type ThemePresetName =
  | "dark-teal"
  | "monsoon-blue"
  | "festive-gold"
  | "obsidian-sale"
  | "conon-clean"
  | "custom";

export interface HomeThemeMasthead {
  id: string;
  isEnabled: boolean;
  presetName: ThemePresetName;
  bgGradientStart: string;
  bgGradientEnd: string;
  accentColor: string;
  textColor: string;
  pillBgColor: string;
  pillTextColor: string;
  campaignTitle: string;
  campaignSubtitle: string;
  showSparkles: boolean;
  bgPatternImageUrl?: string;
  bottomEdgeStyle: "dotted-pattern" | "curved" | "flat";
  startDate?: string;
  endDate?: string;
  updatedAt: string;
}

export interface BentoDealCard {
  id: string;
  slotType: "HERO_LEFT" | "GRID_TILE";
  slotOrder: number;
  isActive: boolean;
  badgePrefix: string;
  badgeHighlight: string;
  badgeColor: string;
  title: string;
  subtitle?: string;
  originalPrice?: number;
  offerPrice?: number;
  imageUrl: string;
  cardBgColor: string;
  linkType: LinkType;
  linkTarget: string;
  updatedAt: string;
}

export interface OfferCarouselStrip {
  id: string;
  order: number;
  isActive: boolean;
  iconImageUrl?: string;
  iconType: "percent" | "truck" | "bolt" | "tag" | "custom";
  title: string;
  subtitle: string;
  bgColor: string;
  textColor: string;
  linkType: LinkType;
  linkTarget: string;
  updatedAt: string;
}

export interface HeroBrandBanner {
  id: string;
  placement: "TOP_HERO" | "MID_PAGE";
  order: number;
  isActive: boolean;
  brandLogoUrl?: string;
  bannerImageUrl: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaBgColor: string;
  ctaTextColor: string;
  overlayGradient: string;
  linkType: LinkType;
  linkTarget: string;
  updatedAt: string;
}

export interface PromoAnnouncementStrip {
  id: string;
  order: number;
  isActive: boolean;
  stripType: "OFFER_BAR" | "PAYMENT_PARTNER";
  partnerLogoUrl?: string;
  badgeLabel: string;
  boldText: string;
  regularText: string;
  termsText?: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  linkType: LinkType;
  linkTarget: string;
  updatedAt: string;
}

export type HomeSectionId =
  | "MASTHEAD_BENTO"
  | "OFFER_CAROUSEL"
  | "TOP_HERO_BANNER"
  | "PROMO_STRIPS"
  | "CATEGORY_GRID"
  | "MID_PAGE_BANNER";

export interface HomeSectionLayoutItem {
  id: HomeSectionId;
  label: string;
  order: number;
  isActive: boolean;
}

export interface HomeMerchandisingPayload {
  masthead: HomeThemeMasthead;
  bentoCards: BentoDealCard[];
  offerStrips: OfferCarouselStrip[];
  heroBanners: HeroBrandBanner[];
  promoStrips: PromoAnnouncementStrip[];
  sectionLayout: HomeSectionLayoutItem[];
  updatedAt: string;
}

const NOW_ISO = new Date().toISOString();

const DEFAULT_MERCHANDISING_DATA: HomeMerchandisingPayload = {
  masthead: {
    id: "default",
    isEnabled: true,
    presetName: "dark-teal",
    bgGradientStart: "#0B292E",
    bgGradientEnd: "#124249",
    accentColor: "#FACC15",
    textColor: "#FFFFFF",
    pillBgColor: "#14535B",
    pillTextColor: "#FDE047",
    campaignTitle: "Builder Super Sale",
    campaignSubtitle: "Factory & Depot Direct Rates · Guaranteed 60-Min Lucknow Dispatch",
    showSparkles: true,
    bgPatternImageUrl: "",
    bottomEdgeStyle: "dotted-pattern",
    startDate: "",
    endDate: "",
    updatedAt: NOW_ISO,
  },
  bentoCards: [
    {
      id: "bento_slot_1",
      slotType: "HERO_LEFT",
      slotOrder: 1,
      isActive: true,
      badgePrefix: "Up to",
      badgeHighlight: "15% OFF",
      badgeColor: "#FACC15",
      title: "Cement & TMT Mega Deals",
      subtitle: "UltraTech & Tata Tiscon",
      originalPrice: 410,
      offerPrice: 365,
      imageUrl: "/images/home-categories/cement-civil-works.webp",
      cardBgColor: "#F5FBF9",
      linkType: "category",
      linkTarget: "cement-civil-works",
      updatedAt: NOW_ISO,
    },
    {
      id: "bento_slot_2",
      slotType: "GRID_TILE",
      slotOrder: 2,
      isActive: true,
      badgePrefix: "Starting at",
      badgeHighlight: "₹345",
      badgeColor: "#10B981",
      title: "RMC Concrete Mixes",
      subtitle: "M10–M50 Plant Direct",
      imageUrl: "/images/home-categories/rmc-ready-mix-concrete.webp",
      cardBgColor: "#FFFFFF",
      linkType: "category",
      linkTarget: "rmc-ready-mix-concrete",
      updatedAt: NOW_ISO,
    },
    {
      id: "bento_slot_3",
      slotType: "GRID_TILE",
      slotOrder: 3,
      isActive: true,
      badgePrefix: "Up to",
      badgeHighlight: "20% OFF",
      badgeColor: "#0EA5E9",
      title: "Waterproofing & Chemicals",
      subtitle: "Dr. Fixit & Fosroc",
      imageUrl: "/images/home-categories/waterproofing-repairing.webp",
      cardBgColor: "#FFFFFF",
      linkType: "category",
      linkTarget: "waterproofing-repairing",
      updatedAt: NOW_ISO,
    },
    {
      id: "bento_slot_4",
      slotType: "GRID_TILE",
      slotOrder: 4,
      isActive: true,
      badgePrefix: "Bulk Rates",
      badgeHighlight: "18% OFF",
      badgeColor: "#F59E0B",
      title: "Plumbing & CPVC Pipes",
      subtitle: "Astral & Supreme",
      imageUrl: "/images/home-categories/cpvc-plumbing-tanks.webp",
      cardBgColor: "#FFFFFF",
      linkType: "category",
      linkTarget: "cpvc-plumbing-tanks",
      updatedAt: NOW_ISO,
    },
    {
      id: "bento_slot_5",
      slotType: "GRID_TILE",
      slotOrder: 5,
      isActive: true,
      badgePrefix: "Starting at",
      badgeHighlight: "₹499",
      badgeColor: "#2563EB",
      title: "Paints, Putty & Primer",
      subtitle: "Asian Paints & Berger",
      imageUrl: "/images/home-categories/painting.webp",
      cardBgColor: "#FFFFFF",
      linkType: "category",
      linkTarget: "painting",
      updatedAt: NOW_ISO,
    },
  ],
  offerStrips: [
    {
      id: "offer_strip_1",
      order: 1,
      isActive: true,
      iconType: "percent",
      title: "TODAY'S BULK DEALS",
      subtitle: "Save up to ₹25/bag on 50+ cement bags",
      bgColor: "#0E363C",
      textColor: "#FFFFFF",
      linkType: "category",
      linkTarget: "cement-civil-works",
      updatedAt: NOW_ISO,
    },
    {
      id: "offer_strip_2",
      order: 2,
      isActive: true,
      iconType: "truck",
      title: "60-MIN SITE EXPRESS",
      subtitle: "Free Chhota Hathi delivery above ₹1,000",
      bgColor: "#14273E",
      textColor: "#FFFFFF",
      linkType: "category",
      linkTarget: "rmc-ready-mix-concrete",
      updatedAt: NOW_ISO,
    },
    {
      id: "offer_strip_3",
      order: 3,
      isActive: true,
      iconType: "bolt",
      title: "WIRES & MCB COMBOS",
      subtitle: "Havells & Polycab IS 694 pure copper",
      bgColor: "#291D3D",
      textColor: "#FFFFFF",
      linkType: "category",
      linkTarget: "wires-mcb-electrical",
      updatedAt: NOW_ISO,
    },
  ],
  heroBanners: [
    {
      id: "hero_brand_1",
      placement: "TOP_HERO",
      order: 1,
      isActive: true,
      bannerImageUrl: "/images/home-categories/rmc-ready-mix-concrete.webp",
      headline: "RMC Plant Direct — Zero Slump Loss",
      subheadline: "M10–M50 Structural Concrete delivered fresh in 6 m³ Transit Mixers across Lucknow",
      ctaText: "Shop now",
      ctaBgColor: "#FACC15",
      ctaTextColor: "#0F172A",
      overlayGradient: "linear-gradient(110deg, #091E3A 0%, #1848A0 100%)",
      linkType: "category",
      linkTarget: "rmc-ready-mix-concrete",
      updatedAt: NOW_ISO,
    },
    {
      id: "hero_brand_2",
      placement: "TOP_HERO",
      order: 2,
      isActive: true,
      bannerImageUrl: "/images/home-categories/wires-mcb-electrical.webp",
      headline: "Genuine Brand Electricals & Lighting",
      subheadline: "Havells, Polycab & Philips Bulk Contractor Prices with Instant GST Invoice",
      ctaText: "Explore Electricals",
      ctaBgColor: "#FFFFFF",
      ctaTextColor: "#0F172A",
      overlayGradient: "linear-gradient(110deg, #1E1B4B 0%, #3730A3 100%)",
      linkType: "category",
      linkTarget: "wires-mcb-electrical",
      updatedAt: NOW_ISO,
    },
    {
      id: "hero_mid_1",
      placement: "MID_PAGE",
      order: 1,
      isActive: true,
      bannerImageUrl: "/images/home-categories/waterproofing-repairing.webp",
      headline: "LIVE NOW — UP TO 20% OFF ON WATERPROOFING",
      subheadline: "Protect roof slabs, sunken toilets & exterior walls before dampness hits",
      ctaText: "Shop Waterproofing",
      ctaBgColor: "#FACC15",
      ctaTextColor: "#0F172A",
      overlayGradient: "linear-gradient(110deg, #0D2F34 0%, #115E59 100%)",
      linkType: "category",
      linkTarget: "waterproofing-repairing",
      updatedAt: NOW_ISO,
    },
  ],
  promoStrips: [
    {
      id: "promo_strip_1",
      order: 1,
      isActive: true,
      stripType: "OFFER_BAR",
      badgeLabel: "SUPER SAVER",
      boldText: "Flat ₹250 Off",
      regularText: "on material orders above ₹5,000 across Lucknow",
      termsText: "*T&C Apply",
      bgColor: "#FEF3C7",
      textColor: "#78350F",
      borderColor: "#FDE68A",
      linkType: "category",
      linkTarget: "cement-civil-works",
      updatedAt: NOW_ISO,
    },
    {
      id: "promo_strip_2",
      order: 2,
      isActive: true,
      stripType: "PAYMENT_PARTNER",
      badgeLabel: "UPI / GST",
      boldText: "100% GST Billing",
      regularText: "| Assured 1% Cashback on Bulk UPI Orders",
      termsText: "*Instant ITC Tax Invoice",
      bgColor: "#FFFFFF",
      textColor: "#0F172A",
      borderColor: "#E2E8F0",
      linkType: "category",
      linkTarget: "rmc-ready-mix-concrete",
      updatedAt: NOW_ISO,
    },
  ],
  sectionLayout: [
    { id: "MASTHEAD_BENTO", label: "Blinkit Campaign Masthead & 5-Card Bento Grid", order: 1, isActive: true },
    { id: "OFFER_CAROUSEL", label: "Horizontal Deal Pill Carousel", order: 2, isActive: true },
    { id: "TOP_HERO_BANNER", label: "Flipkart Minutes Sponsored Brand Banner Carousel", order: 3, isActive: true },
    { id: "PROMO_STRIPS", label: "Thin Offer & UPI/GST Payment Strips", order: 4, isActive: true },
    { id: "CATEGORY_GRID", label: "Main Storefront Category Grid", order: 5, isActive: true },
    { id: "MID_PAGE_BANNER", label: "Mid-Page Secondary Campaign Banner", order: 6, isActive: true },
  ],
  updatedAt: NOW_ISO,
};

function appendCacheVersion(url?: string, updatedAt?: string): string {
  const clean = stripLocalhostPrefix(url);
  if (!clean) return "";
  if (clean.startsWith("data:") || clean.startsWith("blob:")) return clean;
  if (!clean.startsWith("/uploads/") && !clean.startsWith("/images/")) return clean;
  const ts = updatedAt ? String(Date.parse(updatedAt) || Date.now()) : String(Date.now());
  const base = clean.split("?")[0];
  return `${base}?v=${ts}`;
}

class MerchandisingStore {
  private data: HomeMerchandisingPayload = structuredClone(DEFAULT_MERCHANDISING_DATA);
  private loaded = false;
  private dbTablesReady = false;

  private ensureLoadedSync() {
    if (this.loaded) return;
    this.loaded = true;
    try {
      if (fs.existsSync(MERCHANDISING_STORE_PATH)) {
        const raw = JSON.parse(fs.readFileSync(MERCHANDISING_STORE_PATH, "utf8"));
        if (raw && typeof raw === "object") {
          this.data = this.normalize(raw);
        }
      }
    } catch {
      this.data = structuredClone(DEFAULT_MERCHANDISING_DATA);
    }
    this.persistDiskSync();
  }

  private normalize(raw: any): HomeMerchandisingPayload {
    const def = DEFAULT_MERCHANDISING_DATA;
    const mh = { ...def.masthead, ...(raw?.masthead || {}) };
    mh.bgPatternImageUrl = stripLocalhostPrefix(mh.bgPatternImageUrl || "");

    const bentoRaw: BentoDealCard[] = Array.isArray(raw?.bentoCards) && raw.bentoCards.length > 0
      ? raw.bentoCards
      : def.bentoCards;
    const offerRaw: OfferCarouselStrip[] = Array.isArray(raw?.offerStrips)
      ? raw.offerStrips
      : def.offerStrips;
    const heroRaw: HeroBrandBanner[] = Array.isArray(raw?.heroBanners)
      ? raw.heroBanners
      : def.heroBanners;
    const promoRaw: PromoAnnouncementStrip[] = Array.isArray(raw?.promoStrips)
      ? raw.promoStrips
      : def.promoStrips;

    const layoutRaw: HomeSectionLayoutItem[] =
      Array.isArray(raw?.sectionLayout) && raw.sectionLayout.length > 0
        ? raw.sectionLayout
        : def.sectionLayout;

    // Ensure all 6 section keys always exist
    const existingIds = new Set(layoutRaw.map((s) => s.id));
    const mergedLayout = [...layoutRaw];
    for (const defSec of def.sectionLayout) {
      if (!existingIds.has(defSec.id)) mergedLayout.push(defSec);
    }

    return {
      masthead: mh,
      bentoCards: bentoRaw
        .map((c: any, idx: number) => ({
          ...c,
          id: String(c.id || `bento_slot_${idx + 1}`),
          slotType: idx === 0 || c.slotType === "HERO_LEFT" ? "HERO_LEFT" : "GRID_TILE",
          slotOrder: Number(c.slotOrder ?? idx + 1),
          imageUrl: appendCacheVersion(c.imageUrl, c.updatedAt || mh.updatedAt),
        }))
        .sort((a: BentoDealCard, b: BentoDealCard) => a.slotOrder - b.slotOrder),
      offerStrips: offerRaw
        .map((s: any, idx: number) => ({
          ...s,
          id: String(s.id || `offer_strip_${idx + 1}`),
          order: Number(s.order ?? idx + 1),
          iconImageUrl: s.iconImageUrl ? appendCacheVersion(s.iconImageUrl, s.updatedAt) : undefined,
        }))
        .sort((a: OfferCarouselStrip, b: OfferCarouselStrip) => a.order - b.order),
      heroBanners: heroRaw
        .map((b: any, idx: number) => ({
          ...b,
          id: String(b.id || `hero_brand_${idx + 1}`),
          order: Number(b.order ?? idx + 1),
          brandLogoUrl: b.brandLogoUrl ? appendCacheVersion(b.brandLogoUrl, b.updatedAt) : undefined,
          bannerImageUrl: appendCacheVersion(b.bannerImageUrl, b.updatedAt),
        }))
        .sort((a: HeroBrandBanner, b: HeroBrandBanner) => a.order - b.order),
      promoStrips: promoRaw
        .map((p: any, idx: number) => ({
          ...p,
          id: String(p.id || `promo_strip_${idx + 1}`),
          order: Number(p.order ?? idx + 1),
          partnerLogoUrl: p.partnerLogoUrl ? appendCacheVersion(p.partnerLogoUrl, p.updatedAt) : undefined,
        }))
        .sort((a: PromoAnnouncementStrip, b: PromoAnnouncementStrip) => a.order - b.order),
      sectionLayout: mergedLayout
        .map((s: any, idx: number) => ({
          ...s,
          order: Number(s.order ?? idx + 1),
          isActive: s.isActive !== false,
        }))
        .sort((a: HomeSectionLayoutItem, b: HomeSectionLayoutItem) => a.order - b.order),
      updatedAt: raw?.updatedAt || new Date().toISOString(),
    };
  }

  private persistDiskSync() {
    try {
      fs.mkdirSync(path.dirname(MERCHANDISING_STORE_PATH), { recursive: true });
      fs.writeFileSync(MERCHANDISING_STORE_PATH, JSON.stringify(this.data, null, 2), "utf8");
    } catch (err) {
      logger.warn({ err }, "[MerchandisingStore] Disk write warning");
    }
  }

  private async ensureDbTables(): Promise<boolean> {
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL && !process.env.PGURI) return false;
    try {
      if (!this.dbTablesReady) {
        await query(`
          CREATE TABLE IF NOT EXISTS home_theme_masthead (
            id VARCHAR(40) PRIMARY KEY,
            config JSONB NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );
          CREATE TABLE IF NOT EXISTS bento_deal_cards (
            id VARCHAR(60) PRIMARY KEY,
            slot_type VARCHAR(30) NOT NULL,
            slot_order INT NOT NULL,
            is_active BOOLEAN NOT NULL DEFAULT true,
            data JSONB NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );
          CREATE TABLE IF NOT EXISTS offer_carousel_strips (
            id VARCHAR(60) PRIMARY KEY,
            sort_order INT NOT NULL,
            is_active BOOLEAN NOT NULL DEFAULT true,
            data JSONB NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );
          CREATE TABLE IF NOT EXISTS hero_brand_banners (
            id VARCHAR(60) PRIMARY KEY,
            placement VARCHAR(30) NOT NULL DEFAULT 'TOP_HERO',
            sort_order INT NOT NULL,
            is_active BOOLEAN NOT NULL DEFAULT true,
            data JSONB NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );
          CREATE TABLE IF NOT EXISTS promo_announcement_strips (
            id VARCHAR(60) PRIMARY KEY,
            sort_order INT NOT NULL,
            is_active BOOLEAN NOT NULL DEFAULT true,
            data JSONB NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );
          CREATE TABLE IF NOT EXISTS home_section_layout (
            id VARCHAR(60) PRIMARY KEY,
            sort_order INT NOT NULL,
            is_active BOOLEAN NOT NULL DEFAULT true,
            label VARCHAR(160) NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );
        `);
        this.dbTablesReady = true;
      }
      return true;
    } catch {
      return false;
    }
  }

  private async syncToPostgres() {
    if (!(await this.ensureDbTables())) return;
    try {
      await query(
        `INSERT INTO home_theme_masthead (id, config, updated_at) VALUES ('default', $1::jsonb, NOW())
         ON CONFLICT (id) DO UPDATE SET config = EXCLUDED.config, updated_at = NOW()`,
        [JSON.stringify(this.data.masthead)]
      );

      await query(`DELETE FROM bento_deal_cards`);
      for (const c of this.data.bentoCards) {
        await query(
          `INSERT INTO bento_deal_cards (id, slot_type, slot_order, is_active, data, updated_at)
           VALUES ($1, $2, $3, $4, $5::jsonb, NOW())`,
          [c.id, c.slotType, c.slotOrder, c.isActive, JSON.stringify(c)]
        );
      }

      await query(`DELETE FROM offer_carousel_strips`);
      for (const o of this.data.offerStrips) {
        await query(
          `INSERT INTO offer_carousel_strips (id, sort_order, is_active, data, updated_at)
           VALUES ($1, $2, $3, $4::jsonb, NOW())`,
          [o.id, o.order, o.isActive, JSON.stringify(o)]
        );
      }

      await query(`DELETE FROM hero_brand_banners`);
      for (const b of this.data.heroBanners) {
        await query(
          `INSERT INTO hero_brand_banners (id, placement, sort_order, is_active, data, updated_at)
           VALUES ($1, $2, $3, $4, $5::jsonb, NOW())`,
          [b.id, b.placement, b.order, b.isActive, JSON.stringify(b)]
        );
      }

      await query(`DELETE FROM promo_announcement_strips`);
      for (const p of this.data.promoStrips) {
        await query(
          `INSERT INTO promo_announcement_strips (id, sort_order, is_active, data, updated_at)
           VALUES ($1, $2, $3, $4::jsonb, NOW())`,
          [p.id, p.order, p.isActive, JSON.stringify(p)]
        );
      }

      await query(`DELETE FROM home_section_layout`);
      for (const s of this.data.sectionLayout) {
        await query(
          `INSERT INTO home_section_layout (id, sort_order, is_active, label, updated_at)
           VALUES ($1, $2, $3, $4, NOW())`,
          [s.id, s.order, s.isActive, s.label]
        );
      }
    } catch {
      // Disk JSON remains persisted
    }
  }

  private async hydrateFromPostgresIfPresent() {
    if (!(await this.ensureDbTables())) return;
    try {
      const mRes = await query(`SELECT config FROM home_theme_masthead WHERE id = 'default' LIMIT 1`);
      if (!mRes?.rows?.length) {
        await this.syncToPostgres();
        return;
      }
      const [bRes, oRes, hRes, pRes, lRes] = await Promise.all([
        query(`SELECT data FROM bento_deal_cards ORDER BY slot_order ASC`),
        query(`SELECT data FROM offer_carousel_strips ORDER BY sort_order ASC`),
        query(`SELECT data FROM hero_brand_banners ORDER BY sort_order ASC`),
        query(`SELECT data FROM promo_announcement_strips ORDER BY sort_order ASC`),
        query(`SELECT id, sort_order as "order", is_active as "isActive", label FROM home_section_layout ORDER BY sort_order ASC`),
      ]);
      this.data = this.normalize({
        masthead: mRes.rows[0].config,
        bentoCards: bRes?.rows?.map((r: any) => r.data) || this.data.bentoCards,
        offerStrips: oRes?.rows?.map((r: any) => r.data) || this.data.offerStrips,
        heroBanners: hRes?.rows?.map((r: any) => r.data) || this.data.heroBanners,
        promoStrips: pRes?.rows?.map((r: any) => r.data) || this.data.promoStrips,
        sectionLayout: lRes?.rows?.length ? lRes.rows : this.data.sectionLayout,
        updatedAt: new Date().toISOString(),
      });
      this.persistDiskSync();
    } catch {
      // Offline / Postgres disabled
    }
  }

  async getHome(options?: { activeOnly?: boolean }): Promise<HomeMerchandisingPayload> {
    this.ensureLoadedSync();
    await this.hydrateFromPostgresIfPresent();

    const normalized = this.normalize(this.data);
    if (!options?.activeOnly) return normalized;

    const nowMs = Date.now();
    const withinSchedule =
      (!normalized.masthead.startDate || Date.parse(normalized.masthead.startDate) <= nowMs) &&
      (!normalized.masthead.endDate || Date.parse(normalized.masthead.endDate) >= nowMs);

    return {
      ...normalized,
      masthead: {
        ...normalized.masthead,
        isEnabled: normalized.masthead.isEnabled && withinSchedule,
      },
      bentoCards: normalized.bentoCards.filter((c) => c.isActive),
      offerStrips: normalized.offerStrips.filter((o) => o.isActive),
      heroBanners: normalized.heroBanners.filter((b) => b.isActive),
      promoStrips: normalized.promoStrips.filter((p) => p.isActive),
      sectionLayout: normalized.sectionLayout.filter((s) => s.isActive),
    };
  }

  async saveAll(patch: Partial<HomeMerchandisingPayload>): Promise<HomeMerchandisingPayload> {
    this.ensureLoadedSync();
    const now = new Date().toISOString();
    const nextRaw: any = {
      masthead: patch.masthead
        ? { ...this.data.masthead, ...patch.masthead, updatedAt: now }
        : this.data.masthead,
      bentoCards: Array.isArray(patch.bentoCards)
        ? patch.bentoCards.map((c, idx) => ({
            ...c,
            imageUrl: stripLocalhostPrefix(c.imageUrl).split("?")[0],
            slotOrder: Number(c.slotOrder ?? idx + 1),
            updatedAt: now,
          }))
        : this.data.bentoCards,
      offerStrips: Array.isArray(patch.offerStrips)
        ? patch.offerStrips.map((o, idx) => ({
            ...o,
            id: o.id || `offer_${Date.now()}_${crypto.randomBytes(2).toString("hex")}`,
            iconImageUrl: o.iconImageUrl ? stripLocalhostPrefix(o.iconImageUrl).split("?")[0] : undefined,
            order: Number(o.order ?? idx + 1),
            updatedAt: now,
          }))
        : this.data.offerStrips,
      heroBanners: Array.isArray(patch.heroBanners)
        ? patch.heroBanners.map((b, idx) => ({
            ...b,
            id: b.id || `hero_${Date.now()}_${crypto.randomBytes(2).toString("hex")}`,
            brandLogoUrl: b.brandLogoUrl ? stripLocalhostPrefix(b.brandLogoUrl).split("?")[0] : undefined,
            bannerImageUrl: stripLocalhostPrefix(b.bannerImageUrl).split("?")[0],
            order: Number(b.order ?? idx + 1),
            updatedAt: now,
          }))
        : this.data.heroBanners,
      promoStrips: Array.isArray(patch.promoStrips)
        ? patch.promoStrips.map((p, idx) => ({
            ...p,
            id: p.id || `promo_${Date.now()}_${crypto.randomBytes(2).toString("hex")}`,
            partnerLogoUrl: p.partnerLogoUrl ? stripLocalhostPrefix(p.partnerLogoUrl).split("?")[0] : undefined,
            order: Number(p.order ?? idx + 1),
            updatedAt: now,
          }))
        : this.data.promoStrips,
      sectionLayout: Array.isArray(patch.sectionLayout)
        ? patch.sectionLayout.map((s, idx) => ({
            ...s,
            order: Number(s.order ?? idx + 1),
          }))
        : this.data.sectionLayout,
      updatedAt: now,
    };

    this.data = this.normalize(nextRaw);
    this.persistDiskSync();
    await this.syncToPostgres();
    return this.data;
  }
}

export const merchandisingStore = new MerchandisingStore();
