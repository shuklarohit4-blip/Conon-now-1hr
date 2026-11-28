import { useEffect, useState } from "react";
import { apiUrl, getAdminHeaders, normalizeRelativeAssetUrl } from "@/lib/apiBase";
import { subscribeSseSync } from "@/services/sseSyncClient";
import { getSocket } from "@/services/socket";

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
  updatedAt?: string;
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
  updatedAt?: string;
}

const DEFAULT_SETTINGS: GlobalStoreSettings = {
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
  noticeStripText: "",
  maintenanceMode: false,
};

interface ConfigSnapshot {
  settings: GlobalStoreSettings;
  banners: HeroBannerRecord[];
  loading: boolean;
  updatedAt: string | null;
}

let snapshot: ConfigSnapshot = {
  settings: DEFAULT_SETTINGS,
  banners: [],
  loading: false,
  updatedAt: null,
};

const subscribers = new Set<(s: ConfigSnapshot) => void>();
let inFlight: Promise<ConfigSnapshot> | null = null;
let started = false;

function notify() {
  for (const fn of subscribers) fn(snapshot);
}

export async function refreshStorefrontConfig(force = false): Promise<ConfigSnapshot> {
  if (inFlight && !force) return inFlight;
  snapshot = { ...snapshot, loading: true };
  notify();

  const run = async (): Promise<ConfigSnapshot> => {
    try {
      const res = await fetch(apiUrl("/api/storefront/config"), {
        method: "GET",
        cache: "no-store",
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.settings) {
          snapshot = {
            settings: { ...DEFAULT_SETTINGS, ...data.settings },
            banners: Array.isArray(data.banners)
              ? data.banners.map((b: any) => ({
                  ...b,
                  imageUrl: normalizeRelativeAssetUrl(b.imageUrl),
                }))
              : [],
            loading: false,
            updatedAt: data.updatedAt || new Date().toISOString(),
          };
          notify();
          return snapshot;
        }
      }
    } catch {
      // preserve last known snapshot
    }
    snapshot = { ...snapshot, loading: false };
    notify();
    return snapshot;
  };

  inFlight = run().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

function ensureStarted() {
  if (started || typeof window === "undefined") return;
  started = true;
  void refreshStorefrontConfig(true);

  subscribeSseSync((msg) => {
    if (
      msg.type === "SETTINGS_UPDATED" ||
      msg.type === "BANNERS_UPDATED" ||
      msg.type === "FORCE_SYNC"
    ) {
      void refreshStorefrontConfig(true);
    }
  });

  try {
    const socket = getSocket() as any;
    socket?.on?.("storefront:config_updated", () => void refreshStorefrontConfig(true));
    socket?.on?.("conon:force_sync", () => void refreshStorefrontConfig(true));
  } catch {}

  window.addEventListener("focus", () => {
    void refreshStorefrontConfig(true);
  });
}

export function useLiveStorefrontConfig(options?: { activeBannersOnly?: boolean }) {
  const [state, setState] = useState<ConfigSnapshot>(() => snapshot);

  useEffect(() => {
    ensureStarted();
    setState(snapshot);
    subscribers.add(setState);
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  const banners = options?.activeBannersOnly
    ? state.banners.filter((b) => b.isActive !== false)
    : state.banners;

  return {
    settings: state.settings,
    banners,
    allBanners: state.banners,
    loading: state.loading,
    updatedAt: state.updatedAt,
    refresh: () => refreshStorefrontConfig(true),
  };
}

export async function saveStorefrontConfig(patch: {
  settings?: Partial<GlobalStoreSettings>;
  banners?: HeroBannerRecord[];
}): Promise<ConfigSnapshot> {
  const res = await fetch(apiUrl("/api/admin/storefront/config"), {
    method: "PUT",
    headers: getAdminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(patch),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || "Failed to save storefront settings/banners");
  }
  return refreshStorefrontConfig(true);
}

export async function uploadBannerImageFile(file: File, bannerId?: string): Promise<string> {
  const fd = new FormData();
  fd.append("image", file);
  if (bannerId) fd.append("bannerId", bannerId);

  const res = await fetch(apiUrl("/api/admin/storefront/upload-banner"), {
    method: "POST",
    headers: getAdminHeaders(),
    body: fd,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.url) {
    throw new Error(data?.error || "Failed to upload banner image");
  }
  return normalizeRelativeAssetUrl(data.url);
}
