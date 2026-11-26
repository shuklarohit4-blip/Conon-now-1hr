/**
 * CONON-NOW SINGLE SOURCE OF TRUTH MEDIA & PRODUCT VAULT ENGINE
 *
 * Canonical resolution priority:
 * 1. Live Local Disk-Writer Updates (BroadcastChannel + Runtime Overlay in Local Admin Dev)
 * 2. REAL_MEDIA_MANIFEST (`artifacts/conon/src/data/realMediaManifest.generated.ts`, auto-generated
 *    directly from permanent `.webp` files in `artifacts/conon/public/real-products/`)
 * 3. BRAND_GROUP_MEDIA_FALLBACK (shared verified photos if configured)
 * 4. Optional clean runtime API overrides (never allowing legacy/AI/SVG fallback URLs)
 *
 * ZERO legacy `/images/products/`, ZERO `@assets/`, ZERO inline SVG product drawings.
 */
import { resolveApiUrl } from "@/lib/apiBase";
import { getSocket } from "@/services/socket";
import {
  REAL_MEDIA_MANIFEST,
  REAL_MEDIA_ENTRIES,
  BRAND_GROUP_MEDIA_FALLBACK,
  type RealMediaManifestEntry,
  type RealMediaOverrides,
} from "@/data/realMediaManifest.generated";

export type VaultImageCaption =
  | "Front View"
  | "Front Pack"
  | "ISI / Grade Mark"
  | "ISI Mark"
  | "Packaging"
  | "Size Chart"
  | "Dimension Chart"
  | "On-Site Usage"
  | "Technical Label";

export const VAULT_CAPTION_OPTIONS: VaultImageCaption[] = [
  "Front View",
  "Front Pack",
  "ISI / Grade Mark",
  "ISI Mark",
  "Packaging",
  "Size Chart",
  "Dimension Chart",
  "On-Site Usage",
  "Technical Label",
];

export interface VaultImageEntry {
  id: string;
  url: string;
  caption?: VaultImageCaption | string;
  isPrimary?: boolean;
  order: number;
  fallbackDataUrl?: string;
}

export interface ProductMediaOverride {
  productId: string;
  slug?: string;
  categorySlug?: string;
  title?: string;
  brand?: string;
  subcategory?: string;
  description?: string;
  specBullets: string[];
  images: VaultImageEntry[];
  price?: number;
  mrp?: number;
  bulkPrice?: number;
  bulkMinQty?: number;
  hsnCode?: string;
  gstRate?: number;
  unit?: string;
  isInStock?: boolean;
  isAdminVerifiedMedia: boolean;
  isCustomItem?: boolean;
  updatedAt: string;
}

const IDB_NAME = "conon_media_vault_db";
const IDB_VERSION = 1;
const IDB_STORE = "product_overrides";
const BROADCAST_CHANNEL_NAME = "conon_media_vault_sync";
const CUSTOM_DOM_EVENT = "conon_media_vault_updated";

const LEGACY_BAD_URL_RE =
  /(\/images\/products\/|\/images\/catalog\/|\/images\/rentals\/|\/images\/services\/|\/products\/|\/rentals\/|@assets\/|\.svg(\?|$)|via\.placeholder|placeholder\.svg|^oem:\/\/)/i;

export function isLegacyBrokenImageUrl(url?: string | null): boolean {
  const val = String(url || "").trim();
  if (!val) return true;
  if (val.startsWith("data:image/svg")) return true;
  return LEGACY_BAD_URL_RE.test(val);
}

export function sanitizeFolderSlug(raw?: string | null): string {
  return String(raw || "")
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/\.{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Runtime hot lookup overlays (updated immediately when Admin saves/clears in dev or API)
const vaultById = new Map<string, ProductMediaOverride>();
const vaultBySlug = new Map<string, ProductMediaOverride>();
const vaultByTitle = new Map<string, ProductMediaOverride>();
const clearedItemKeys = new Set<string>();
const listeners = new Set<() => void>();

// Secondary manifest index by normalized title & sanitized slug
const manifestByNormalizedTitle = new Map<string, RealMediaManifestEntry>();
const manifestBySanitizedKey = new Map<string, RealMediaManifestEntry>();

function rebuildManifestIndexes() {
  manifestByNormalizedTitle.clear();
  manifestBySanitizedKey.clear();
  for (const [k, entry] of Object.entries(REAL_MEDIA_MANIFEST)) {
    const sk = sanitizeFolderSlug(k).toLowerCase();
    if (sk) manifestBySanitizedKey.set(sk, entry);
    if (entry.overrides?.title) {
      manifestByNormalizedTitle.set(normalizeTextKey(entry.overrides.title), entry);
    }
  }
}

let idbPromise: Promise<IDBDatabase | null> | null = null;
let broadcastChannel: BroadcastChannel | null = null;
let hydrationStarted = false;
let socketBound = false;

function normalizeTextKey(val?: string | null): string {
  return String(val || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

rebuildManifestIndexes();

try {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    broadcastChannel.addEventListener("message", (event: MessageEvent) => {
      const msg = event.data;
      if (!msg || typeof msg !== "object") return;
      if (msg.type === "UPSERT_ONE" && msg.override) {
        clearedItemKeys.delete(msg.override.productId);
        if (msg.override.slug) clearedItemKeys.delete(msg.override.slug);
        mergeOneInMemory(msg.override);
        notifyListeners();
      } else if (msg.type === "UPSERT_MANY" && Array.isArray(msg.overrides)) {
        for (const rec of msg.overrides) {
          clearedItemKeys.delete(rec.productId);
          if (rec.slug) clearedItemKeys.delete(rec.slug);
          mergeOneInMemory(rec);
        }
        notifyListeners();
      } else if (msg.type === "DELETE_ONE" && msg.productId) {
        markClearedInMemory(String(msg.productId));
        notifyListeners();
      } else if (msg.type === "REPLACE_ALL" && Array.isArray(msg.overrides)) {
        for (const rec of msg.overrides) {
          clearedItemKeys.delete(rec.productId);
          mergeOneInMemory(rec);
        }
        notifyListeners();
      }
    });
  }
} catch {
  // Ignore BroadcastChannel restrictions
}

function rebuildSecondaryIndexes() {
  vaultBySlug.clear();
  vaultByTitle.clear();
  for (const rec of vaultById.values()) {
    if (rec.slug) {
      vaultBySlug.set(rec.slug.toLowerCase(), rec);
      const sk = sanitizeFolderSlug(rec.slug).toLowerCase();
      if (sk) vaultBySlug.set(sk, rec);
    }
    const skId = sanitizeFolderSlug(rec.productId).toLowerCase();
    if (skId) vaultBySlug.set(skId, rec);
    if (rec.title) {
      vaultByTitle.set(normalizeTextKey(rec.title), rec);
    }
  }
}

export function normalizeVaultOverride(
  raw: Partial<ProductMediaOverride> & { productId: string }
): ProductMediaOverride {
  const images: VaultImageEntry[] = Array.isArray(raw.images)
    ? raw.images
        .filter((x) => {
          if (!x) return false;
          const u = x.url || x.fallbackDataUrl || "";
          return Boolean(u) && !isLegacyBrokenImageUrl(u);
        })
        .slice(0, 6)
        .map((x, idx) => ({
          id: String(x.id || `vimg-${idx}-${Date.now()}`),
          url: String(x.url || x.fallbackDataUrl || ""),
          caption: x.caption || (idx === 0 ? "Front View" : undefined),
          isPrimary: idx === 0,
          order: idx,
          fallbackDataUrl:
            x.fallbackDataUrl && !isLegacyBrokenImageUrl(x.fallbackDataUrl)
              ? x.fallbackDataUrl
              : String(x.url || "").startsWith("data:")
              ? String(x.url)
              : undefined,
        }))
    : [];

  return {
    productId: String(raw.productId).trim(),
    slug: raw.slug ? String(raw.slug).trim() : undefined,
    categorySlug: raw.categorySlug ? String(raw.categorySlug).trim() : undefined,
    title: raw.title !== undefined ? String(raw.title) : undefined,
    brand: raw.brand !== undefined ? String(raw.brand) : undefined,
    subcategory: raw.subcategory !== undefined ? String(raw.subcategory) : undefined,
    description: raw.description !== undefined ? String(raw.description) : undefined,
    specBullets: Array.isArray(raw.specBullets)
      ? raw.specBullets.map((b) => String(b).trim()).filter(Boolean)
      : [],
    images,
    price: typeof raw.price === "number" && Number.isFinite(raw.price) ? raw.price : undefined,
    mrp: typeof raw.mrp === "number" && Number.isFinite(raw.mrp) ? raw.mrp : undefined,
    bulkPrice: typeof raw.bulkPrice === "number" && Number.isFinite(raw.bulkPrice) ? raw.bulkPrice : undefined,
    bulkMinQty: typeof raw.bulkMinQty === "number" && Number.isFinite(raw.bulkMinQty) ? raw.bulkMinQty : undefined,
    hsnCode: raw.hsnCode ? String(raw.hsnCode) : undefined,
    gstRate: typeof raw.gstRate === "number" && Number.isFinite(raw.gstRate) ? raw.gstRate : undefined,
    unit: raw.unit ? String(raw.unit) : undefined,
    isInStock: raw.isInStock !== undefined ? Boolean(raw.isInStock) : true,
    isAdminVerifiedMedia: images.length > 0,
    isCustomItem: raw.isCustomItem ? Boolean(raw.isCustomItem) : undefined,
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

function mergeOneInMemory(raw: Partial<ProductMediaOverride> & { productId: string }) {
  const normalized = normalizeVaultOverride({
    ...vaultById.get(raw.productId),
    ...raw,
  });
  vaultById.set(normalized.productId, normalized);
  rebuildSecondaryIndexes();
}

function markClearedInMemory(productId: string) {
  clearedItemKeys.add(productId);
  const sk = sanitizeFolderSlug(productId);
  if (sk) clearedItemKeys.add(sk);
  vaultById.delete(productId);
  rebuildSecondaryIndexes();
}

function notifyListeners() {
  for (const cb of listeners) {
    try {
      cb();
    } catch {
      // ignore listener errors
    }
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CUSTOM_DOM_EVENT));
  }
}

export function triggerMediaVaultRefresh(): void {
  rebuildManifestIndexes();
  notifyListeners();
}

function openVaultDb(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.resolve(null);
  }
  if (idbPromise) return idbPromise;

  idbPromise = new Promise((resolve) => {
    try {
      const req = window.indexedDB.open(IDB_NAME, IDB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE, { keyPath: "productId" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return idbPromise;
}

async function clearIdbStore(): Promise<void> {
  const db = await openVaultDb();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function getAllIdbRecords(): Promise<ProductMediaOverride[]> {
  const db = await openVaultDb();
  if (!db) return [];
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, "readonly");
      const req = tx.objectStore(IDB_STORE).getAll();
      req.onsuccess = () => resolve(Array.isArray(req.result) ? req.result : []);
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

async function putIdbRecord(rec: ProductMediaOverride): Promise<void> {
  const db = await openVaultDb();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(rec);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function deleteIdbRecord(productId: string): Promise<void> {
  const db = await openVaultDb();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).delete(productId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export function broadcastVaultMessage(msg: any): void {
  try {
    broadcastChannel?.postMessage(msg);
  } catch {
    // ignore
  }
}

export async function saveLocalVaultOverride(override: ProductMediaOverride): Promise<void> {
  clearedItemKeys.delete(override.productId);
  if (override.slug) clearedItemKeys.delete(override.slug);
  const sk = sanitizeFolderSlug(override.productId);
  if (sk) clearedItemKeys.delete(sk);

  mergeOneInMemory(override);
  const stored = vaultById.get(override.productId) || override;
  await putIdbRecord(stored);
  notifyListeners();
  broadcastVaultMessage({ type: "UPSERT_ONE", override: stored });
}

export async function saveManyLocalVaultOverrides(overrides: ProductMediaOverride[]): Promise<void> {
  const savedList: ProductMediaOverride[] = [];
  for (const ov of overrides) {
    clearedItemKeys.delete(ov.productId);
    if (ov.slug) clearedItemKeys.delete(ov.slug);
    mergeOneInMemory(ov);
    const merged = vaultById.get(ov.productId) || ov;
    await putIdbRecord(merged);
    savedList.push(merged);
  }
  notifyListeners();
  broadcastVaultMessage({ type: "UPSERT_MANY", overrides: savedList });
}

export async function deleteLocalVaultOverride(productId: string): Promise<void> {
  markClearedInMemory(productId);
  await deleteIdbRecord(productId);
  notifyListeners();
  broadcastVaultMessage({ type: "DELETE_ONE", productId });
}

export function subscribeToMediaVault(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export async function hydrateMediaVault(): Promise<void> {
  if (!hydrationStarted) {
    hydrationStarted = true;

    // Complete one-time clean media wipe of IndexedDB when bumped
    if (typeof window !== "undefined") {
      try {
        if (localStorage.getItem("conon_idb_wipe_pending_v2") === "true") {
          await clearIdbStore();
          localStorage.removeItem("conon_idb_wipe_pending_v2");
        }
      } catch {}
    }

    // Load only clean real-product overrides from IndexedDB (never legacy AI URLs)
    const localRows = await getAllIdbRecords();
    if (localRows.length > 0) {
      let loadedClean = false;
      for (const row of localRows) {
        if (!row?.productId) continue;
        const cleanImages = (row.images || []).filter(
          (im) => !isLegacyBrokenImageUrl(im.url) || !isLegacyBrokenImageUrl(im.fallbackDataUrl)
        );
        if (cleanImages.length === 0 && !row.description && !row.title && (!row.specBullets || row.specBullets.length === 0)) {
          continue;
        }
        mergeOneInMemory({ ...row, images: cleanImages });
        loadedClean = true;
      }
      if (loadedClean) notifyListeners();
    }

    if (!socketBound && typeof window !== "undefined") {
      socketBound = true;
      try {
        const socket = getSocket();
        socket.on("media_vault:product_updated", (payload: { productId?: string; override?: ProductMediaOverride }) => {
          if (payload?.override) {
            clearedItemKeys.delete(payload.override.productId);
            mergeOneInMemory(payload.override);
            notifyListeners();
          }
        });
        socket.on("media_vault:bulk_updated", (payload: { overrides?: ProductMediaOverride[] }) => {
          if (Array.isArray(payload?.overrides)) {
            for (const rec of payload.overrides) {
              clearedItemKeys.delete(rec.productId);
              mergeOneInMemory(rec);
            }
            notifyListeners();
          }
        });
        socket.on("media_vault:product_deleted", (payload: { productId?: string }) => {
          if (payload?.productId) {
            markClearedInMemory(payload.productId);
            notifyListeners();
          }
        });
      } catch {
        // Ignore offline socket errors
      }
    }
  }

  // Sync valid real-product overrides from Express backend if active
  try {
    const res = await fetch(resolveApiUrl("/api/media-vault/overrides"));
    if (res.ok) {
      const json = await res.json();
      const serverList: ProductMediaOverride[] = Array.isArray(json?.items)
        ? json.items
        : json?.overrides && typeof json.overrides === "object"
        ? Object.values(json.overrides)
        : [];
      let changed = false;
      for (const sItem of serverList) {
        if (!sItem?.productId || clearedItemKeys.has(sItem.productId)) continue;
        const validImages = (sItem.images || []).filter((im) => !isLegacyBrokenImageUrl(im.url));
        const manifestHit = REAL_MEDIA_MANIFEST[sItem.productId];
        if (manifestHit && validImages.length === 0) continue;
        const cleanItem = normalizeVaultOverride({ ...sItem, images: validImages });
        const hasUseful = cleanItem.images.length > 0 || Boolean(cleanItem.description) || cleanItem.specBullets.length > 0;
        if (!hasUseful) continue;

        const existing = vaultById.get(cleanItem.productId);
        const serverTime = new Date(cleanItem.updatedAt || 0).getTime();
        const localTime = new Date(existing?.updatedAt || 0).getTime();
        if (!existing || serverTime >= localTime) {
          mergeOneInMemory(cleanItem);
          changed = true;
        }
      }
      if (changed) notifyListeners();
    }
  } catch {
    // Static Netlify builds rely 100% on REAL_MEDIA_MANIFEST cleanly
  }
}

function manifestEntryToOverride(entry: RealMediaManifestEntry): ProductMediaOverride {
  const ov: RealMediaOverrides = entry.overrides || {};
  const imgs: VaultImageEntry[] = (entry.images || []).map((im, idx) => ({
    id: `disk-${entry.itemKey}-${idx}`,
    url: im.url,
    caption: im.caption || (idx === 0 ? "Front View" : undefined),
    isPrimary: idx === 0,
    order: idx,
  }));

  return {
    productId: entry.productId || entry.itemKey,
    slug: entry.slug || entry.itemKey,
    categorySlug: ov.categorySlug || entry.categorySlug,
    title: ov.title,
    brand: ov.brand,
    subcategory: ov.subcategory,
    description: ov.description,
    specBullets: Array.isArray(ov.specBullets) ? ov.specBullets : [],
    images: imgs,
    price: ov.price,
    mrp: ov.mrp,
    bulkPrice: ov.bulkPrice,
    bulkMinQty: ov.bulkMinQty,
    hsnCode: ov.hsnCode,
    gstRate: ov.gstRate,
    unit: ov.unit,
    isInStock: ov.isInStock,
    isAdminVerifiedMedia: imgs.length > 0,
    isCustomItem: ov.isCustomItem,
    updatedAt: ov.updatedAt || new Date(0).toISOString(),
  };
}

function lookupStaticManifestEntry(
  productOrId?: string | { id?: string; slug?: string; productId?: string; materialId?: string; masterItemId?: string; title?: string; name?: string; tradeName?: string; modelName?: string; skuId?: string; oemModelCode?: string; categorySlug?: string; category?: string; brand?: string } | null
): RealMediaManifestEntry | undefined {
  if (!productOrId) return undefined;

  if (typeof productOrId === "string") {
    const k = productOrId.trim();
    if (!k || clearedItemKeys.has(k)) return undefined;
    const direct =
      REAL_MEDIA_MANIFEST[k] ||
      manifestBySanitizedKey.get(sanitizeFolderSlug(k).toLowerCase()) ||
      manifestByNormalizedTitle.get(normalizeTextKey(k));
    return direct;
  }

  const candidateIds = [
    productOrId.productId,
    productOrId.id,
    productOrId.slug,
    productOrId.materialId,
    productOrId.masterItemId,
    productOrId.skuId,
  ]
    .map((x) => (x ? String(x).trim() : ""))
    .filter(Boolean);

  for (const cid of candidateIds) {
    if (clearedItemKeys.has(cid)) return undefined;
    if (REAL_MEDIA_MANIFEST[cid]) return REAL_MEDIA_MANIFEST[cid];
    const sk = sanitizeFolderSlug(cid).toLowerCase();
    if (sk && clearedItemKeys.has(sk)) return undefined;
    if (sk && manifestBySanitizedKey.get(sk)) return manifestBySanitizedKey.get(sk);
  }

  const titleCandidate = normalizeTextKey(
    productOrId.title || productOrId.name || productOrId.tradeName || productOrId.modelName
  );
  if (titleCandidate) {
    return manifestByNormalizedTitle.get(titleCandidate);
  }

  return undefined;
}

export function getAllVaultOverridesMap(): Record<string, ProductMediaOverride> {
  const out: Record<string, ProductMediaOverride> = {};

  for (const entry of REAL_MEDIA_ENTRIES) {
    const id = entry.productId || entry.itemKey;
    if (clearedItemKeys.has(id) || clearedItemKeys.has(entry.itemKey)) continue;
    out[id] = manifestEntryToOverride(entry);
  }

  for (const [k, v] of vaultById.entries()) {
    if (clearedItemKeys.has(k)) continue;
    out[k] = v;
  }

  return out;
}

export function getAllVaultOverridesList(): ProductMediaOverride[] {
  return Object.values(getAllVaultOverridesMap());
}

/**
 * Look up an override by ID/slug/title from Live Runtime Save first, then disk-generated REAL_MEDIA_MANIFEST,
 * then optional BRAND_GROUP_MEDIA_FALLBACK.
 */
export function getVaultOverrideForProduct(
  productOrId?: string | { id?: string; slug?: string; productId?: string; materialId?: string; masterItemId?: string; title?: string; name?: string; tradeName?: string; modelName?: string; skuId?: string; oemModelCode?: string; categorySlug?: string; category?: string; brand?: string } | null
): ProductMediaOverride | undefined {
  if (!productOrId) return undefined;

  if (typeof productOrId === "string") {
    const key = productOrId.trim();
    if (!key || clearedItemKeys.has(key)) return undefined;
    const runtime =
      vaultById.get(key) ||
      vaultBySlug.get(key.toLowerCase()) ||
      vaultBySlug.get(sanitizeFolderSlug(key).toLowerCase()) ||
      vaultByTitle.get(normalizeTextKey(key));
    if (runtime) return runtime;
    const staticEntry = lookupStaticManifestEntry(key);
    return staticEntry ? manifestEntryToOverride(staticEntry) : undefined;
  }

  const candidateIds = [
    productOrId.productId,
    productOrId.id,
    productOrId.slug,
    productOrId.materialId,
    productOrId.masterItemId,
    productOrId.skuId,
  ]
    .map((x) => (x ? String(x).trim() : ""))
    .filter(Boolean);

  for (const cid of candidateIds) {
    if (clearedItemKeys.has(cid)) return undefined;
    const hit =
      vaultById.get(cid) ||
      vaultBySlug.get(cid.toLowerCase()) ||
      vaultBySlug.get(sanitizeFolderSlug(cid).toLowerCase());
    if (hit) return hit;
  }

  const titleKey = normalizeTextKey(
    productOrId.title || productOrId.name || productOrId.tradeName || productOrId.modelName
  );
  if (titleKey && vaultByTitle.has(titleKey)) {
    return vaultByTitle.get(titleKey);
  }

  // Fallback to static disk-backed REAL_MEDIA_MANIFEST
  const staticEntry = lookupStaticManifestEntry(productOrId);
  if (staticEntry) {
    return manifestEntryToOverride(staticEntry);
  }

  // Optional Brand Group Shared Fallback (only if populated in public/real-products/_brand-groups/)
  const catSlug = sanitizeFolderSlug(productOrId.categorySlug || productOrId.category || "").toLowerCase();
  const brandSlug = sanitizeFolderSlug(productOrId.brand || "").toLowerCase();
  if (catSlug && brandSlug) {
    const bgImages = BRAND_GROUP_MEDIA_FALLBACK[`${catSlug}/${brandSlug}`];
    if (Array.isArray(bgImages) && bgImages.length > 0) {
      return {
        productId: String(productOrId.id || productOrId.slug || `${catSlug}-${brandSlug}`),
        categorySlug: catSlug,
        specBullets: [],
        images: bgImages.map((im, idx) => ({
          id: `bg-${catSlug}-${brandSlug}-${idx}`,
          url: im.url,
          caption: im.caption,
          isPrimary: idx === 0,
          order: idx,
        })),
        isAdminVerifiedMedia: true,
        updatedAt: new Date(0).toISOString(),
      };
    }
  }

  return undefined;
}

export function resolveVaultAssetUrl(url?: string, fallbackDataUrl?: string): string {
  const rawUrl = (url || "").trim();
  const rawFallback = (fallbackDataUrl || "").trim();

  const chosen = !isLegacyBrokenImageUrl(rawUrl)
    ? rawUrl
    : !isLegacyBrokenImageUrl(rawFallback)
    ? rawFallback
    : "";

  if (!chosen) return "";
  if (
    chosen.startsWith("data:") ||
    chosen.startsWith("blob:") ||
    chosen.startsWith("http://") ||
    chosen.startsWith("https://")
  ) {
    return chosen;
  }
  if (chosen.startsWith("/uploads/")) {
    return resolveApiUrl(chosen);
  }
  if (chosen.startsWith("/")) {
    const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
    return `${base}${chosen}`;
  }
  return chosen;
}

/**
 * Resolve any product synchronously with Disk Manifest + Live Vault overrides as Single Source of Truth.
 * Never returns deleted legacy URLs or SVG stubs.
 */
export function resolveProductWithVault<T extends Record<string, any>>(
  baseProduct: T
): T & {
  primaryImage: string;
  galleryImages: VaultImageEntry[];
  specBullets: string[];
  isAdminVerifiedMedia: boolean;
  vaultOverride?: ProductMediaOverride;
} {
  if (!baseProduct) return baseProduct as any;
  const ov = getVaultOverrideForProduct(baseProduct);

  // Only allow valid non-legacy images from baseProduct if explicitly runtime-previewed
  const candidateBaseUrl =
    baseProduct.image ||
    baseProduct.imageUrl ||
    (Array.isArray(baseProduct.images) && baseProduct.images.length > 0
      ? typeof baseProduct.images[0] === "string"
        ? baseProduct.images[0]
        : baseProduct.images[0]?.url
      : "") ||
    "";
  const cleanBaseUrl = isLegacyBrokenImageUrl(candidateBaseUrl) ? "" : candidateBaseUrl;

  if (!ov) {
    const rawGallery: VaultImageEntry[] = Array.isArray(baseProduct.images)
      ? baseProduct.images
          .map((im: any, i: number) => {
            const u = typeof im === "string" ? im : im?.url || "";
            if (isLegacyBrokenImageUrl(u)) return null;
            return typeof im === "string"
              ? { id: `base-${i}`, url: u, isPrimary: i === 0, order: i }
              : { id: im.id || `base-${i}`, url: u, caption: im.caption, isPrimary: i === 0, order: i };
          })
          .filter(Boolean) as VaultImageEntry[]
      : cleanBaseUrl
      ? [{ id: "base-0", url: cleanBaseUrl, caption: "Front View", isPrimary: true, order: 0 }]
      : [];

    const existingBullets: string[] = Array.isArray(baseProduct.specBullets)
      ? baseProduct.specBullets
      : Array.isArray(baseProduct.features)
      ? baseProduct.features
      : Array.isArray(baseProduct.highlights)
      ? baseProduct.highlights.map((h: any) => (typeof h === "string" ? h : `${h.label}: ${h.value}`))
      : [];

    return {
      ...baseProduct,
      image: rawGallery[0]?.url || cleanBaseUrl,
      imageUrl: rawGallery[0]?.url || cleanBaseUrl,
      images: rawGallery.map((g) => g.url),
      primaryImage: rawGallery[0]?.url || cleanBaseUrl,
      galleryImages: rawGallery,
      specBullets: existingBullets,
      isAdminVerifiedMedia: rawGallery.length > 0,
      vaultOverride: undefined,
    };
  }

  const resolvedGallery: VaultImageEntry[] = ov.images
    .map((im, i) => {
      const resolvedUrl = resolveVaultAssetUrl(im.url, im.fallbackDataUrl);
      if (!resolvedUrl) return null;
      return {
        ...im,
        url: resolvedUrl,
        isPrimary: i === 0,
        order: i,
      };
    })
    .filter(Boolean) as VaultImageEntry[];

  const primaryImage = resolvedGallery[0]?.url || "";
  const specBullets =
    ov.specBullets && ov.specBullets.length > 0
      ? ov.specBullets
      : Array.isArray(baseProduct.features)
      ? baseProduct.features
      : Array.isArray(baseProduct.highlights)
      ? baseProduct.highlights.map((h: any) => (typeof h === "string" ? h : `${h.label}: ${h.value}`))
      : [];

  const resolvedTitle = ov.title && ov.title.trim().length > 0 ? ov.title : baseProduct.title || baseProduct.name;
  const resolvedDesc =
    ov.description && ov.description.trim().length > 0
      ? ov.description
      : baseProduct.description || baseProduct.shortDescription || baseProduct.shortTagline || "";

  return {
    ...baseProduct,
    title: resolvedTitle,
    name: ov.title && ov.title.trim().length > 0 ? ov.title : baseProduct.name || resolvedTitle,
    brand: ov.brand && ov.brand.trim().length > 0 ? ov.brand : baseProduct.brand,
    subcategory: ov.subcategory || baseProduct.subcategory || baseProduct.subCategory,
    description: resolvedDesc,
    shortDescription: resolvedDesc || baseProduct.shortDescription,
    shortTagline: ov.description ? ov.description.slice(0, 140) : baseProduct.shortTagline,
    price: ov.price !== undefined ? ov.price : baseProduct.price,
    sellingPrice: ov.price !== undefined ? ov.price : baseProduct.sellingPrice,
    mrp: ov.mrp !== undefined ? ov.mrp : baseProduct.mrp,
    bulkPrice: ov.bulkPrice !== undefined ? ov.bulkPrice : baseProduct.bulkPrice,
    bulkMinQty: ov.bulkMinQty !== undefined ? ov.bulkMinQty : baseProduct.bulkMinQty,
    hsnCode: ov.hsnCode || baseProduct.hsnCode,
    gstRate: ov.gstRate !== undefined ? ov.gstRate : baseProduct.gstRate ?? baseProduct.gstPercent,
    gstPercent: ov.gstRate !== undefined ? ov.gstRate : baseProduct.gstPercent ?? baseProduct.gstRate,
    unit: ov.unit || baseProduct.unit,
    inStock: ov.isInStock !== undefined ? ov.isInStock : baseProduct.inStock,
    image: primaryImage,
    imageUrl: primaryImage,
    primaryImage,
    galleryImages: resolvedGallery,
    images: resolvedGallery.map((g) => g.url),
    specBullets,
    features: specBullets.length > 0 ? specBullets : baseProduct.features,
    isAdminVerifiedMedia: resolvedGallery.length > 0,
    vaultOverride: ov,
  };
}
