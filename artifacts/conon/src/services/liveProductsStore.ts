import { useEffect, useState } from "react";
import { apiUrl, getAdminHeaders, normalizeRelativeAssetUrl } from "@/lib/apiBase";
import { subscribeSseSync } from "@/services/sseSyncClient";
import { getSocket } from "@/services/socket";

export interface LiveProductRecord {
  id: string;
  slug: string;
  title: string;
  name: string;
  brand: string;
  categorySlug: string;
  subcategory?: string;
  subCategory?: string;
  unit: string;
  mrp: number;
  price: number;
  sellingPrice: number;
  bulkPrice: number;
  bulkMinQty: number;
  cashbackPercent: number;
  stockQty: number;
  isInStock: boolean;
  inStock: boolean;
  isFeatured: boolean;
  isArchived: boolean;
  adminLocked: boolean;
  hsnCode: string;
  gstRate: number;
  vehicleRequirement: "BIKE" | "LOADER";
  image: string;
  imageUrl: string;
  images: string[];
  galleryImages: Array<{
    id: string;
    url: string;
    slot?: "front" | "back" | "specs" | "application" | "packaging";
    caption?: string;
    isPrimary?: boolean;
    order: number;
  }>;
  description: string;
  specTags: Array<{ label: string; value: string }>;
  highlights: string[];
  highlightTiles: Array<{ label: string; value: string }>;
  keyInfo: Array<{ label: string; value: string }>;
  specifications: Array<{ label: string; value: string }>;
  usageTips: string[];
  variants: Array<{
    id: string;
    label: string;
    unit: string;
    price: number;
    mrp: number;
    discountPercent: number;
    stock: number;
  }>;
  bulkSlabs: Array<{ minQty: number; price: number; label?: string }>;
  bulkPricingTiers: Array<{ minQty: number; pricePerUnit: number; label?: string }>;
  updatedAt?: string;
}

interface ProductsSnapshot {
  products: LiveProductRecord[];
  byId: Map<string, LiveProductRecord>;
  loading: boolean;
  loadedFromBackend: boolean;
}

let state: ProductsSnapshot = {
  products: [],
  byId: new Map(),
  loading: false,
  loadedFromBackend: false,
};

const listeners = new Set<(s: ProductsSnapshot) => void>();
let inFlight: Promise<LiveProductRecord[]> | null = null;
let started = false;

function notify() {
  for (const fn of listeners) fn(state);
}

export async function refreshLiveProducts(force = false): Promise<LiveProductRecord[]> {
  if (inFlight && !force) return inFlight;
  state = { ...state, loading: true };
  notify();

  const run = async (): Promise<LiveProductRecord[]> => {
    try {
      const res = await fetch(apiUrl("/api/products"), {
        method: "GET",
        cache: "no-store",
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.products)) {
          const list: LiveProductRecord[] = data.products.map((raw: any) => ({
            ...raw,
            image: normalizeRelativeAssetUrl(raw.image || raw.imageUrl),
            imageUrl: normalizeRelativeAssetUrl(raw.imageUrl || raw.image),
            images: Array.isArray(raw.images)
              ? raw.images.map((u: string) => normalizeRelativeAssetUrl(u))
              : [],
            galleryImages: Array.isArray(raw.galleryImages)
              ? raw.galleryImages.map((g: any) => ({
                  ...g,
                  url: normalizeRelativeAssetUrl(g.url),
                }))
              : [],
            variants: Array.isArray(raw.variants)
              ? raw.variants.map((v: any) => ({
                  ...v,
                  stock: Number(v.stock ?? 50),
                  discountPercent:
                    v.discountPercent ??
                    (v.mrp > v.price && v.mrp > 0
                      ? Math.round(((v.mrp - v.price) / v.mrp) * 100)
                      : 0),
                }))
              : [],
          }));
          const map = new Map<string, LiveProductRecord>();
          for (const item of list) {
            map.set(item.id, item);
            if (item.slug) map.set(item.slug, item);
          }
          state = {
            products: list,
            byId: map,
            loading: false,
            loadedFromBackend: true,
          };
          notify();
          return list;
        }
      }
    } catch {
      // Keep last known products
    }
    state = { ...state, loading: false };
    notify();
    return state.products;
  };

  inFlight = run().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

function ensureStarted() {
  if (started || typeof window === "undefined") return;
  started = true;
  void refreshLiveProducts(true);

  subscribeSseSync((msg) => {
    if (msg.type === "CATALOG_UPDATED" || msg.type === "FORCE_SYNC") {
      void refreshLiveProducts(true);
    }
  });

  try {
    const socket = getSocket() as any;
    const trigger = () => void refreshLiveProducts(true);
    socket?.on?.("catalog:product_created", trigger);
    socket?.on?.("catalog:product_updated", trigger);
    socket?.on?.("catalog:product_deleted", trigger);
    socket?.on?.("conon:force_sync", trigger);
  } catch {}

  window.addEventListener("focus", () => {
    void refreshLiveProducts(true);
  });
}

export function useLiveProductsStore() {
  const [snapshot, setSnapshot] = useState<ProductsSnapshot>(() => state);
  useEffect(() => {
    ensureStarted();
    setSnapshot(state);
    listeners.add(setSnapshot);
    return () => {
      listeners.delete(setSnapshot);
    };
  }, []);
  return {
    ...snapshot,
    refresh: () => refreshLiveProducts(true),
  };
}

export async function uploadProductImageFile(
  file: File,
  slugOrId?: string
): Promise<{ url: string; rawPath: string }> {
  const fd = new FormData();
  fd.append("image", file);
  fd.append("slug", slugOrId || "product");
  const res = await fetch(apiUrl("/api/products/upload-image"), {
    method: "POST",
    headers: getAdminHeaders(),
    body: fd,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.url) {
    throw new Error(data?.error || "Product photo upload failed");
  }
  return {
    url: normalizeRelativeAssetUrl(data.url),
    rawPath: normalizeRelativeAssetUrl(data.rawPath || data.url),
  };
}
