import { useEffect, useState } from "react";
import { apiUrl, getAdminHeaders, normalizeRelativeAssetUrl } from "@/lib/apiBase";
import { subscribeSseSync } from "@/services/sseSyncClient";
import { getSocket } from "@/services/socket";

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
  updatedAt?: string;
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
  updatedAt?: string;
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
  updatedAt?: string;
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
  updatedAt?: string;
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
  updatedAt?: string;
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

export interface HomeMerchandisingData {
  masthead: HomeThemeMasthead;
  bentoCards: BentoDealCard[];
  offerStrips: OfferCarouselStrip[];
  heroBanners: HeroBrandBanner[];
  promoStrips: PromoAnnouncementStrip[];
  sectionLayout: HomeSectionLayoutItem[];
  updatedAt: string;
}

export const MERCHANDISING_THEME_PRESETS: Record<
  Exclude<ThemePresetName, "custom">,
  {
    label: string;
    isEnabled: boolean;
    bgGradientStart: string;
    bgGradientEnd: string;
    accentColor: string;
    textColor: string;
    pillBgColor: string;
    pillTextColor: string;
  }
> = {
  "dark-teal": {
    label: "Blinkit Dark Teal",
    isEnabled: true,
    bgGradientStart: "#0B292E",
    bgGradientEnd: "#124249",
    accentColor: "#FACC15",
    textColor: "#FFFFFF",
    pillBgColor: "#14535B",
    pillTextColor: "#FDE047",
  },
  "monsoon-blue": {
    label: "Monsoon Slate Blue",
    isEnabled: true,
    bgGradientStart: "#0B1D3A",
    bgGradientEnd: "#1848A0",
    accentColor: "#38BDF8",
    textColor: "#FFFFFF",
    pillBgColor: "#1E3A8A",
    pillTextColor: "#BAE6FD",
  },
  "festive-gold": {
    label: "Festive Amber Gold",
    isEnabled: true,
    bgGradientStart: "#451A03",
    bgGradientEnd: "#92400E",
    accentColor: "#FDE047",
    textColor: "#FFFFFF",
    pillBgColor: "#78350F",
    pillTextColor: "#FEF08A",
  },
  "obsidian-sale": {
    label: "Midnight Black Friday",
    isEnabled: true,
    bgGradientStart: "#090D16",
    bgGradientEnd: "#1E293B",
    accentColor: "#FACC15",
    textColor: "#FFFFFF",
    pillBgColor: "#334155",
    pillTextColor: "#FDE047",
  },
  "conon-clean": {
    label: "Conon Brand Clean",
    isEnabled: false,
    bgGradientStart: "#FFFFFF",
    bgGradientEnd: "#F8FAFC",
    accentColor: "#1848A0",
    textColor: "#0F172A",
    pillBgColor: "#EFF6FF",
    pillTextColor: "#1D4ED8",
  },
};

export function resolveMerchandisingAssetUrl(rawUrl?: string, updatedAt?: string): string {
  const url = normalizeRelativeAssetUrl(rawUrl);
  if (!url) return "";
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;

  let out = url;
  if (url.startsWith("/uploads/") || url.startsWith("/api/uploads/")) {
    out = apiUrl(url);
  } else if (url.startsWith("/")) {
    const base = (import.meta.env?.BASE_URL || "/").replace(/\/$/, "");
    out = `${base}${url}`;
  }
  if (updatedAt && !out.includes("v=")) {
    const ts = Date.parse(updatedAt);
    if (!Number.isNaN(ts)) {
      const sep = out.includes("?") ? "&" : "?";
      out = `${out}${sep}v=${ts}`;
    }
  }
  return out;
}

const DEFAULT_EMPTY_DATA: HomeMerchandisingData = {
  masthead: {
    id: "default",
    isEnabled: false,
    presetName: "dark-teal",
    bgGradientStart: "#0B292E",
    bgGradientEnd: "#124249",
    accentColor: "#FACC15",
    textColor: "#FFFFFF",
    pillBgColor: "#14535B",
    pillTextColor: "#FDE047",
    campaignTitle: "Builder Super Sale",
    campaignSubtitle: "60-Min Express Lucknow Site Supply",
    showSparkles: true,
    bottomEdgeStyle: "dotted-pattern",
  },
  bentoCards: [],
  offerStrips: [],
  heroBanners: [],
  promoStrips: [],
  sectionLayout: [
    { id: "MASTHEAD_BENTO", label: "Campaign Masthead & 5-Card Bento Grid", order: 1, isActive: true },
    { id: "OFFER_CAROUSEL", label: "Horizontal Deal Pill Carousel", order: 2, isActive: true },
    { id: "TOP_HERO_BANNER", label: "Sponsored Brand Banner Carousel", order: 3, isActive: true },
    { id: "PROMO_STRIPS", label: "Thin Offer & UPI/GST Payment Strips", order: 4, isActive: true },
    { id: "CATEGORY_GRID", label: "Main Storefront Category Grid", order: 5, isActive: true },
    { id: "MID_PAGE_BANNER", label: "Mid-Page Secondary Campaign Banner", order: 6, isActive: true },
  ],
  updatedAt: "",
};

let state: {
  data: HomeMerchandisingData;
  loading: boolean;
  loaded: boolean;
} = {
  data: DEFAULT_EMPTY_DATA,
  loading: false,
  loaded: false,
};

const subscribers = new Set<(s: typeof state) => void>();
let inFlight: Promise<HomeMerchandisingData> | null = null;
let started = false;
let broadcastBus: BroadcastChannel | null = null;

try {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    broadcastBus = new BroadcastChannel("conon_merchandising_bus");
  }
} catch {}

function notify() {
  for (const fn of subscribers) fn(state);
}

export async function refreshHomeMerchandising(force = false): Promise<HomeMerchandisingData> {
  if (inFlight && !force) return inFlight;
  state = { ...state, loading: true };
  notify();

  const run = async (): Promise<HomeMerchandisingData> => {
    try {
      const res = await fetch(apiUrl("/api/merchandising/home"), {
        method: "GET",
        cache: "no-store",
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.masthead && json?.sectionLayout) {
          state = {
            data: {
              masthead: json.masthead,
              bentoCards: Array.isArray(json.bentoCards) ? json.bentoCards : [],
              offerStrips: Array.isArray(json.offerStrips) ? json.offerStrips : [],
              heroBanners: Array.isArray(json.heroBanners) ? json.heroBanners : [],
              promoStrips: Array.isArray(json.promoStrips) ? json.promoStrips : [],
              sectionLayout: Array.isArray(json.sectionLayout) ? json.sectionLayout : DEFAULT_EMPTY_DATA.sectionLayout,
              updatedAt: json.updatedAt || new Date().toISOString(),
            },
            loading: false,
            loaded: true,
          };
          notify();
          return state.data;
        }
      }
    } catch {
      // keep existing state on transient offline
    }
    state = { ...state, loading: false };
    notify();
    return state.data;
  };

  inFlight = run().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

function ensureStarted() {
  if (started || typeof window === "undefined") return;
  started = true;
  void refreshHomeMerchandising(true);

  subscribeSseSync((msg) => {
    if (msg.type === "MERCHANDISING_UPDATED" || msg.type === "FORCE_SYNC") {
      void refreshHomeMerchandising(true);
    }
  });

  if (broadcastBus) {
    broadcastBus.onmessage = () => void refreshHomeMerchandising(true);
  }

  try {
    const socket = getSocket() as any;
    socket?.on?.("merchandising:updated", () => void refreshHomeMerchandising(true));
    socket?.on?.("conon:force_sync", () => void refreshHomeMerchandising(true));
  } catch {}

  window.addEventListener("focus", () => {
    void refreshHomeMerchandising(true);
  });
}

export function useLiveMerchandising(options?: { activeOnly?: boolean }) {
  const [snap, setSnap] = useState(() => state);

  useEffect(() => {
    ensureStarted();
    setSnap(state);
    subscribers.add(setSnap);
    return () => {
      subscribers.delete(setSnap);
    };
  }, []);

  if (!options?.activeOnly) {
    return {
      ...snap.data,
      loading: snap.loading,
      loaded: snap.loaded,
      refresh: () => refreshHomeMerchandising(true),
    };
  }

  const nowMs = Date.now();
  const mh = snap.data.masthead;
  const inSchedule =
    (!mh.startDate || Date.parse(mh.startDate) <= nowMs) &&
    (!mh.endDate || Date.parse(mh.endDate) >= nowMs);

  return {
    masthead: { ...mh, isEnabled: Boolean(mh.isEnabled && inSchedule) },
    bentoCards: snap.data.bentoCards.filter((c) => c.isActive),
    offerStrips: snap.data.offerStrips.filter((o) => o.isActive),
    heroBanners: snap.data.heroBanners.filter((b) => b.isActive),
    promoStrips: snap.data.promoStrips.filter((p) => p.isActive),
    sectionLayout: snap.data.sectionLayout.filter((s) => s.isActive).sort((a, b) => a.order - b.order),
    updatedAt: snap.data.updatedAt,
    loading: snap.loading,
    loaded: snap.loaded,
    refresh: () => refreshHomeMerchandising(true),
  };
}

export async function saveHomeMerchandising(
  payload: Partial<HomeMerchandisingData>
): Promise<HomeMerchandisingData> {
  const res = await fetch(apiUrl("/api/admin/merchandising/home"), {
    method: "PUT",
    headers: getAdminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || `Failed to save home merchandising (${res.status})`);
  }
  try {
    broadcastBus?.postMessage({ at: Date.now() });
  } catch {}
  return refreshHomeMerchandising(true);
}

export async function uploadMerchandisingImage(file: File, prefix = "banner"): Promise<string> {
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image exceeds 5MB maximum file size.");
  }
  const fd = new FormData();
  fd.append("image", file);
  fd.append("prefix", prefix);
  const res = await fetch(apiUrl("/api/admin/merchandising/upload"), {
    method: "POST",
    headers: getAdminHeaders(),
    body: fd,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.url) {
    throw new Error(data?.error || "Image upload failed");
  }
  return normalizeRelativeAssetUrl(data.url);
}
