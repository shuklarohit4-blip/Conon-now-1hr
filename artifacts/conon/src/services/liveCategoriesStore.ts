import { useEffect, useState } from "react";
import { HOME_CATEGORIES, type HomeCategory } from "@/data/homeCategories";
import { apiUrl, getAdminHeaders, normalizeRelativeAssetUrl } from "@/lib/apiBase";
import { getSocket } from "@/services/socket";
import { subscribeSseSync } from "@/services/sseSyncClient";

const BROADCAST_CHANNEL_NAME = "conon_catalog_bus";
const DIRTY_STORAGE_KEY = "conon_categories_dirty";

let broadcastBus: BroadcastChannel | null = null;
try {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    broadcastBus = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
} catch {
  // Optional cross-tab broadcast channel
}

export function resolveCategoryAssetUrl(rawUrl?: string, updatedAt?: string): string {
  const url = normalizeRelativeAssetUrl(rawUrl);
  if (!url) return "/images/home-categories/cement-civil-works.webp";
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;

  let finalUrl = url;
  if (url.startsWith("/uploads/") || url.startsWith("/api/uploads/")) {
    finalUrl = apiUrl(url);
  } else if (url.startsWith("/")) {
    const base = (import.meta.env?.BASE_URL || "/").replace(/\/$/, "");
    finalUrl = `${base}${url}`;
  }

  if (updatedAt && !finalUrl.includes("v=")) {
    const ts = Date.parse(updatedAt);
    if (!Number.isNaN(ts)) {
      const sep = finalUrl.includes("?") ? "&" : "?";
      finalUrl = `${finalUrl}${sep}v=${ts}`;
    }
  }
  return finalUrl;
}

export function normalizeCategoryRecord(raw: Record<string, any>, fallbackIdx = 0): HomeCategory {
  const slug = String(raw.slug || `cat-${fallbackIdx + 1}`).trim();
  const title = String(raw.title || raw.name || slug).trim();
  const titleHi = (raw.titleHi ?? raw.nameHi)?.trim() || undefined;
  const order = Number(raw.displayOrder ?? raw.sortOrder ?? fallbackIdx + 1);
  const gst = Number(raw.defaultGstRate ?? raw.defaultGst ?? 18);
  const vType: "BIKE" | "LOADER" =
    raw.vehicleType === "BIKE" || raw.vehicleType === "LOADER"
      ? raw.vehicleType
      : "LOADER";
  const updatedAt = raw.updatedAt || raw.updated_at || undefined;
  const rawImg = String(raw.imageUrl || raw.image || "").trim() || "/images/home-categories/cement-civil-works.webp";
  const resolvedImg = rawImg.startsWith("data:") ? rawImg : rawImg;

  return {
    id: raw.id || slug,
    catId: raw.catId ? Number(raw.catId) : order,
    slug,
    title,
    titleHi,
    name: title,
    nameHi: titleHi,
    department: String(raw.department || "Construction Materials"),
    image: resolvedImg,
    imageUrl: resolvedImg,
    dbCategory: String(raw.dbCategory || slug),
    route: String(raw.route || `/categories?cat=${slug}`),
    badge: raw.badge ? String(raw.badge).trim() : undefined,
    badgeColor: raw.badgeColor ? String(raw.badgeColor).trim() : undefined,
    categoryType: (raw.categoryType as any) || "MATERIAL",
    defaultHsn: raw.defaultHsn ? String(raw.defaultHsn) : "38245010",
    defaultGst: gst,
    defaultGstRate: gst,
    vehicleType: vType,
    vehicleClass:
      raw.vehicleClass ||
      (vType === "BIKE" ? "Delivery Bike (<=30kg)" : "Chhota Hathi (1.5T Loader)"),
    displayOrder: order,
    sortOrder: order,
    isActive: raw.isActive !== false && raw.isActive !== "false",
    productCount: Number(raw.productCount ?? 0),
    updatedAt,
    subcategories: Array.isArray(raw.subcategories) ? raw.subcategories : [],
  };
}

// Initial bootstrap fallback before first backend response returns
const INITIAL_FALLBACK_CATEGORIES: HomeCategory[] = HOME_CATEGORIES.map((c, idx) =>
  normalizeCategoryRecord(c as unknown as Record<string, any>, idx)
);

interface StoreState {
  categories: HomeCategory[];
  loading: boolean;
  loadedFromBackend: boolean;
  lastSyncedAt: string | null;
}

let state: StoreState = {
  categories: INITIAL_FALLBACK_CATEGORIES,
  loading: false,
  loadedFromBackend: false,
  lastSyncedAt: null,
};

let inFlightFetch: Promise<HomeCategory[]> | null = null;
let listenersStarted = false;
const subscribers = new Set<(s: StoreState) => void>();

function notifySubscribers() {
  for (const fn of subscribers) {
    fn(state);
  }
}

export function broadcastCategorySyncSignal(reason = "updated") {
  if (typeof window === "undefined") return;
  const payload = { type: "category", action: "update", reason, timestamp: Date.now() };
  try {
    broadcastBus?.postMessage(payload);
  } catch {}
  try {
    localStorage.setItem(DIRTY_STORAGE_KEY, String(Date.now()));
  } catch {}
  try {
    window.dispatchEvent(new CustomEvent("conon_catalog_bus", { detail: payload }));
  } catch {}
}

export async function refreshLiveCategories(force = false): Promise<HomeCategory[]> {
  if (inFlightFetch && !force) return inFlightFetch;

  state = { ...state, loading: true };
  notifySubscribers();

  const run = async (): Promise<HomeCategory[]> => {
    try {
      const res = await fetch(apiUrl("/api/categories"), {
        method: "GET",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.categories) && data.categories.length > 0) {
          const normalized = data.categories
            .map((raw: any, i: number) => normalizeCategoryRecord(raw, i))
            .sort(
              (a: HomeCategory, b: HomeCategory) =>
                (a.displayOrder ?? 999) - (b.displayOrder ?? 999) ||
                a.title.localeCompare(b.title)
            );
          state = {
            categories: normalized,
            loading: false,
            loadedFromBackend: true,
            lastSyncedAt: new Date().toISOString(),
          };
          notifySubscribers();
          return normalized;
        }
      }
    } catch {
      // Backend unreachable -> preserve last good snapshot
    }
    state = { ...state, loading: false };
    notifySubscribers();
    return state.categories;
  };

  inFlightFetch = run().finally(() => {
    inFlightFetch = null;
  });
  return inFlightFetch;
}

function ensureGlobalSyncListeners() {
  if (listenersStarted || typeof window === "undefined") return;
  listenersStarted = true;

  // Initial authoritative fetch
  void refreshLiveCategories(true);

  // Instant cross-device SSE stream push (LAN Wi-Fi, DevTunnel, localhost)
  subscribeSseSync((msg) => {
    if (msg.type === "CATEGORIES_UPDATED" || msg.type === "FORCE_SYNC") {
      void refreshLiveCategories(true);
    }
  });

  // Socket.io live push across ports (:5174 <-> :5175) & mobile clients
  try {
    const socket = getSocket() as any;
    const onSocketChange = () => {
      void refreshLiveCategories(true);
    };
    socket?.on?.("catalog:category_updated", onSocketChange);
    socket?.on?.("catalog:category_created", onSocketChange);
    socket?.on?.("categories:changed", onSocketChange);
  } catch {}

  // BroadcastChannel across tabs on same origin
  if (broadcastBus) {
    broadcastBus.onmessage = (event) => {
      if (event?.data?.type === "category") {
        void refreshLiveCategories(true);
      }
    };
  }

  // Same-tab CustomEvent
  window.addEventListener("conon_catalog_bus", (ev: Event) => {
    const detail = (ev as CustomEvent)?.detail;
    if (!detail || detail.type === "category") {
      void refreshLiveCategories(true);
    }
  });

  // localStorage cross-tab event
  window.addEventListener("storage", (ev) => {
    if (ev.key === DIRTY_STORAGE_KEY) {
      void refreshLiveCategories(true);
    }
  });

  // Refetch on window focus / tab switch (e.g., switching from :5174 Admin -> :5175 Home)
  window.addEventListener("focus", () => {
    void refreshLiveCategories(true);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      void refreshLiveCategories(true);
    }
  });

  // Safety background sync every 15s while tab is visible
  window.setInterval(() => {
    if (document.visibilityState === "visible") {
      void refreshLiveCategories(false);
    }
  }, 15000);
}

/**
 * Subscribe to the canonical backend category store.
 */
export function useLiveCategoriesStore(options?: { includeInactive?: boolean }) {
  const [snapshot, setSnapshot] = useState<StoreState>(() => state);
  const includeInactive = Boolean(options?.includeInactive);

  useEffect(() => {
    ensureGlobalSyncListeners();
    setSnapshot(state);
    subscribers.add(setSnapshot);
    return () => {
      subscribers.delete(setSnapshot);
    };
  }, []);

  const categories = includeInactive
    ? snapshot.categories
    : snapshot.categories.filter((c) => c.isActive !== false);

  return {
    categories,
    allCategories: snapshot.categories,
    loading: snapshot.loading,
    loadedFromBackend: snapshot.loadedFromBackend,
    lastSyncedAt: snapshot.lastSyncedAt,
    refresh: () => refreshLiveCategories(true),
  };
}

/**
 * Upload category image directly to backend `/uploads/categories/...` (multipart/form-data).
 */
export async function uploadCategoryImageFile(
  file: File,
  slug: string,
  categoryIdOrSlug?: string
): Promise<{ url: string; rawPath: string }> {
  const fd = new FormData();
  fd.append("image", file);
  fd.append("slug", slug || "category");
  if (categoryIdOrSlug) fd.append("categoryIdOrSlug", categoryIdOrSlug);

  const headers = getAdminHeaders();
  const res = await fetch(apiUrl("/api/categories/upload-image"), {
    method: "POST",
    headers,
    body: fd,
  });
  const data = await res.json();
  if (!res.ok || !data?.url) {
    throw new Error(data?.error || "Failed to upload category image");
  }
  if (data.category) {
    await refreshLiveCategories(true);
    broadcastCategorySyncSignal("image-upload");
  }
  return { url: data.url, rawPath: data.rawPath || data.url };
}

/**
 * Upload base64 dataUrl category image directly to backend disk (`/uploads/categories/...`).
 */
export async function uploadCategoryImageDataUrl(
  dataUrl: string,
  slug: string,
  categoryIdOrSlug?: string
): Promise<{ url: string; rawPath: string }> {
  const headers = getAdminHeaders({ "Content-Type": "application/json" });
  const res = await fetch(apiUrl("/api/categories/upload-image"), {
    method: "POST",
    headers,
    body: JSON.stringify({ dataUrl, slug, categoryIdOrSlug }),
  });
  const data = await res.json();
  if (!res.ok || !data?.url) {
    throw new Error(data?.error || "Failed to save category image");
  }
  if (data.category) {
    await refreshLiveCategories(true);
    broadcastCategorySyncSignal("image-upload");
  }
  return { url: data.url, rawPath: data.rawPath || data.url };
}

export async function saveBackendCategory(
  payload: Record<string, any>,
  options?: { idOrSlug?: string; imageFile?: File | null }
): Promise<HomeCategory> {
  const isUpdate = Boolean(options?.idOrSlug || payload.id);
  const target = options?.idOrSlug || payload.id;
  const endpoint = isUpdate
    ? apiUrl(`/api/categories/${encodeURIComponent(String(target))}`)
    : apiUrl("/api/categories");
  const method = isUpdate ? "PUT" : "POST";

  let res: Response;
  if (options?.imageFile) {
    const fd = new FormData();
    fd.append("image", options.imageFile);
    for (const [k, v] of Object.entries(payload)) {
      if (v !== undefined && v !== null) {
        fd.append(k, typeof v === "object" ? JSON.stringify(v) : String(v));
      }
    }
    res = await fetch(endpoint, {
      method,
      headers: getAdminHeaders(),
      body: fd,
    });
  } else {
    res = await fetch(endpoint, {
      method,
      headers: getAdminHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
  }

  const data = await res.json();
  if (!res.ok || !data?.category) {
    throw new Error(data?.error || "Failed to save category");
  }

  const normalized = normalizeCategoryRecord(data.category);
  await refreshLiveCategories(true);
  broadcastCategorySyncSignal("save");
  return normalized;
}

export async function reorderBackendCategories(
  items: Array<{ id?: string; slug: string; displayOrder: number }>
): Promise<HomeCategory[]> {
  const res = await fetch(apiUrl("/api/categories/reorder"), {
    method: "PUT",
    headers: getAdminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ items }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || "Failed to reorder categories");
  }
  broadcastCategorySyncSignal("reorder");
  return refreshLiveCategories(true);
}
