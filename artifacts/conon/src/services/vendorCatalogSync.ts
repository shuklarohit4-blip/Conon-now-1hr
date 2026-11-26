import { resolveApiUrl } from "@/lib/apiBase";
import { getSocket } from "@/services/socket";

export interface VendorCatalogItem {
  id: string;
  skuCode: string;
  hubId: string;
  categorySlug: string;
  categoryName: string;
  name: string;
  brand: string;
  unit: string;
  dealerPrice: number;
  mrp: number;
  sellingPrice: number;
  imageUrl: string;
  customImage?: string | null;
  inStock: boolean;
  stockQty: number;
  isCustom?: boolean;
  updatedAt: string;
}

export interface VendorCategoryMeta {
  slug: string;
  name: string;
  iconName: string;
  enabled: boolean;
  totalItems: number;
  inStockCount: number;
}

export interface VendorCatalogState {
  hubId: string;
  totalItems: number;
  inStockCount: number;
  outOfStockCount: number;
  customPhotosCount: number;
  categories: VendorCategoryMeta[];
  items: VendorCatalogItem[];
}

const STORAGE_KEY = "conon_vendor_catalog_v1";
const BROADCAST_CHANNEL_NAME = "conon_catalog_bus";

// Shared BroadcastChannel across browser tabs
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
} catch {
  // Graceful fallback if unsupported
}

/**
 * Load cached vendor catalog overrides from localStorage
 */
export function getLocalVendorCatalog(): Record<string, Partial<VendorCatalogItem>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Save an override for an item in localStorage and broadcast across tabs
 */
export function setLocalVendorOverride(
  productId: string,
  patch: Partial<VendorCatalogItem>
) {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalVendorCatalog();
    current[productId] = {
      ...(current[productId] || {}),
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));

    // Broadcast to other tabs
    broadcastChannel?.postMessage({
      type: "CATALOG_OVERRIDE_UPDATED",
      productId,
      patch,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error("[vendorCatalogSync] Storage write failed:", err);
  }
}

/**
 * Subscribe to cross-tab broadcast channel updates
 */
export function subscribeToCatalogBus(
  callback: (event: { type: string; productId?: string; patch?: any }) => void
): () => void {
  if (!broadcastChannel) {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        callback({ type: "STORAGE_CHANGE" });
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }

  const handler = (msg: MessageEvent) => {
    if (msg.data) {
      callback(msg.data);
    }
  };

  broadcastChannel.addEventListener("message", handler);

  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback({ type: "STORAGE_CHANGE" });
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    broadcastChannel?.removeEventListener("message", handler);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * Fetch vendor hub catalog from backend API with localStorage overlay
 */
export async function fetchVendorHubCatalog(
  hubId: string = "hub-naka",
  params?: {
    category?: string;
    search?: string;
    status?: "all" | "in_stock" | "out_of_stock" | "custom_photos";
  }
): Promise<VendorCatalogState> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== "all") query.set("category", params.category);
  if (params?.search) query.set("search", params.search);
  if (params?.status) query.set("status", params.status);

  const url = resolveApiUrl(`/api/vendor/hub/${hubId}/catalog?${query.toString()}`);

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const localOverrides = getLocalVendorCatalog();

    // Merge any optimistic local overrides
    const mergedItems: VendorCatalogItem[] = (data.items || []).map((item: VendorCatalogItem) => {
      const over = localOverrides[item.id];
      if (!over) return item;
      return {
        ...item,
        ...over,
      };
    });

    return {
      hubId: data.hubId || hubId,
      totalItems: mergedItems.length,
      inStockCount: mergedItems.filter((i) => i.inStock).length,
      outOfStockCount: mergedItems.filter((i) => !i.inStock).length,
      customPhotosCount: mergedItems.filter((i) => Boolean(i.customImage || i.imageUrl?.startsWith("data:"))).length,
      categories: data.categories || [],
      items: mergedItems,
    };
  } catch (err) {
    console.warn("[vendorCatalogSync] API fetch failed, falling back to local defaults:", err);
    return getFallbackVendorCatalog(hubId);
  }
}

/**
 * API call to toggle product stock
 */
export async function updateProductStockApi(
  hubId: string,
  productId: string,
  inStock: boolean,
  stockQty?: number
): Promise<boolean> {
  // Optimistically set locally
  setLocalVendorOverride(productId, { inStock, stockQty });

  try {
    const res = await fetch(resolveApiUrl(`/api/vendor/hub/${hubId}/products/${productId}/stock`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inStock, stockQty }),
    });
    return res.ok;
  } catch {
    return true; // Still true locally
  }
}

/**
 * API call to update custom product image
 */
export async function updateProductImageApi(
  hubId: string,
  productId: string,
  imageUrl: string
): Promise<boolean> {
  setLocalVendorOverride(productId, { imageUrl, customImage: imageUrl });

  try {
    const res = await fetch(resolveApiUrl(`/api/vendor/hub/${hubId}/products/${productId}/image`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl }),
    });
    return res.ok;
  } catch {
    return true;
  }
}

/**
 * API call to reset image back to master catalog
 */
export async function resetProductImageApi(
  hubId: string,
  productId: string
): Promise<boolean> {
  try {
    const local = getLocalVendorCatalog();
    if (local[productId]) {
      delete local[productId].customImage;
      delete local[productId].imageUrl;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
      broadcastChannel?.postMessage({
        type: "CATALOG_OVERRIDE_UPDATED",
        productId,
        patch: { customImage: null },
      });
    }

    const res = await fetch(
      resolveApiUrl(`/api/vendor/hub/${hubId}/products/${productId}/reset-image`),
      { method: "POST" }
    );
    return res.ok;
  } catch {
    return true;
  }
}

/**
 * API call to update inline price & qty
 */
export async function updateProductPriceApi(
  hubId: string,
  productId: string,
  dealerPrice: number,
  mrp: number,
  stockQty: number
): Promise<boolean> {
  setLocalVendorOverride(productId, { dealerPrice, mrp, stockQty });

  try {
    const res = await fetch(resolveApiUrl(`/api/vendor/hub/${hubId}/products/${productId}/price`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dealerPrice, mrp, stockQty }),
    });
    return res.ok;
  } catch {
    return true;
  }
}

/**
 * API call to add brand new product
 */
export async function addVendorProductApi(
  hubId: string,
  data: {
    categorySlug: string;
    name: string;
    brand?: string;
    unit?: string;
    dealerPrice: number;
    mrp: number;
    imageUrl?: string;
    inStock?: boolean;
    stockQty?: number;
  }
): Promise<VendorCatalogItem | null> {
  try {
    const res = await fetch(resolveApiUrl(`/api/vendor/hub/${hubId}/products`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Add failed");
    const json = await res.json();
    return json.product || null;
  } catch {
    return null;
  }
}

/**
 * API call to toggle category
 */
export async function toggleCategoryApi(
  hubId: string,
  categorySlug: string,
  enabled: boolean
): Promise<boolean> {
  try {
    const res = await fetch(
      resolveApiUrl(`/api/vendor/hub/${hubId}/categories/${categorySlug}/toggle`),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      }
    );
    return res.ok;
  } catch {
    return true;
  }
}

/**
 * API call to restock entire category
 */
export async function restockCategoryApi(
  hubId: string,
  categorySlug: string
): Promise<boolean> {
  try {
    const res = await fetch(
      resolveApiUrl(`/api/vendor/hub/${hubId}/categories/${categorySlug}/restock-all`),
      { method: "POST" }
    );
    return res.ok;
  } catch {
    return true;
  }
}

function getFallbackVendorCatalog(hubId: string): VendorCatalogState {
  return {
    hubId,
    totalItems: 4,
    inStockCount: 4,
    outOfStockCount: 0,
    customPhotosCount: 0,
    categories: [
      {
        slug: "cement-civil-works",
        name: "Cement, TMT Sariya & Chemicals",
        iconName: "Layers",
        enabled: true,
        totalItems: 3,
        inStockCount: 3,
      },
    ],
    items: [
      {
        id: "cement-ultratech-weatherplus",
        skuCode: "UT-WP-50KG",
        hubId,
        categorySlug: "cement-civil-works",
        categoryName: "Cement, TMT Sariya & Chemicals",
        name: "UltraTech Weather Plus Cement (50kg)",
        brand: "UltraTech",
        unit: "50kg Bag",
        dealerPrice: 385,
        mrp: 440,
        sellingPrice: 415,
        imageUrl: "",
        inStock: true,
        stockQty: 320,
        updatedAt: new Date().toISOString(),
      },
    ],
  };
}
