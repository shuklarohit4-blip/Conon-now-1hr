import { resolveApiUrl, getAdminHeaders } from "@/lib/apiBase";
import {
  type ProductMediaOverride,
  type VaultImageEntry,
  deleteLocalVaultOverride,
  getAllVaultOverridesMap,
  normalizeVaultOverride,
  saveLocalVaultOverride,
  saveManyLocalVaultOverrides,
  sanitizeFolderSlug,
  broadcastVaultMessage,
} from "./productMediaVault";

const MAX_DIMENSION = 900;
const TARGET_QUALITY = 0.84;
const MAX_FALLBACK_DATAURL_BYTES = 180_000;

async function adminFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = getAdminHeaders(init.headers || {});
  return fetch(resolveApiUrl(path), {
    ...init,
    headers,
    credentials: "include",
  });
}

async function localDiskFetch(endpoint: string, body: unknown): Promise<any> {
  if (import.meta.env.VITE_LOCAL_ADMIN !== "true") {
    throw new Error("Local disk media writer is only active in Local Admin Dev mode");
  }
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.ok === false) {
    throw new Error(data?.error || `Disk media endpoint failed (${res.status})`);
  }
  return data;
}

/**
 * Client-side canvas compressor:
 * Resizes image so longest edge <= 900px, outputs crisp WebP <= 180KB.
 */
export async function compressImageToVaultWebP(
  file: Blob,
  maxDimension = MAX_DIMENSION
): Promise<{ dataUrl: string; blob: Blob; sizeBytes: number; width: number; height: number }> {
  if (typeof window === "undefined") {
    return { dataUrl: "", blob: file, sizeBytes: file.size, width: 0, height: 0 };
  }

  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read image data"));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onerror = () => reject(new Error("Invalid or corrupt image file"));
    el.onload = () => resolve(el);
    el.src = rawDataUrl;
  });

  const scale = Math.min(1, maxDimension / Math.max(img.width || 1, img.height || 1));
  const targetW = Math.max(1, Math.round(img.width * scale));
  const targetH = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, targetW, targetH);
  ctx.drawImage(img, 0, 0, targetW, targetH);

  let quality = TARGET_QUALITY;
  let blob: Blob | null = null;
  let dataUrl = "";

  for (let attempt = 0; attempt < 4; attempt++) {
    dataUrl = canvas.toDataURL("image/webp", quality);
    blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", quality));
    if (dataUrl.length <= MAX_FALLBACK_DATAURL_BYTES) break;
    quality = Math.max(0.55, quality - 0.1);
  }

  if (!blob) {
    const res = await fetch(dataUrl);
    blob = await res.blob();
  }

  return {
    dataUrl,
    blob,
    sizeBytes: blob.size,
    width: targetW,
    height: targetH,
  };
}

/**
 * Optimizes a dropped/selected/pasted image into a crisp WebP VaultImageEntry
 * staged for immediate preview and permanent disk publishing.
 */
export async function uploadOptimizedVaultImage(
  fileOrBlob: Blob,
  _productId: string,
  caption = "Front View"
): Promise<VaultImageEntry> {
  const compressed = await compressImageToVaultWebP(fileOrBlob, MAX_DIMENSION);
  const id = `vimg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  return {
    id,
    url: compressed.dataUrl,
    fallbackDataUrl: compressed.dataUrl,
    caption,
    isPrimary: false,
    order: 0,
  };
}

function toDiskImageInput(im: VaultImageEntry) {
  if (im.url && im.url.startsWith("data:image/")) {
    return { dataUrl: im.url, caption: im.caption };
  }
  if (im.fallbackDataUrl && im.fallbackDataUrl.startsWith("data:image/") && (!im.url || im.url.startsWith("blob:"))) {
    return { dataUrl: im.fallbackDataUrl, caption: im.caption };
  }
  const cleanUrl = (im.url || "").split("?")[0].split("#")[0];
  if (cleanUrl.startsWith("/real-products/")) {
    return { existingUrl: cleanUrl, caption: im.caption };
  }
  if (im.fallbackDataUrl && im.fallbackDataUrl.startsWith("data:image/")) {
    return { dataUrl: im.fallbackDataUrl, caption: im.caption };
  }
  return { existingUrl: cleanUrl, caption: im.caption };
}

/**
 * Publishes an item's photos + metadata permanently to:
 *   artifacts/conon/public/real-products/<category-slug>/<item-slug>/01.webp..06.webp + meta.json
 * and regenerates realMediaManifest.generated.ts, then syncs live to Storefront & Vendor OS.
 */
export async function saveProductMediaVault(
  payload: ProductMediaOverride
): Promise<{
  ok: boolean;
  override: ProductMediaOverride;
  savedToServer: boolean;
  diskSaved: boolean;
  folderPath: string;
  savedFiles: string[];
}> {
  const categorySlug = sanitizeFolderSlug(payload.categorySlug || "general");
  const itemKey = sanitizeFolderSlug(payload.slug || payload.productId || "item");

  let diskSaved = false;
  let folderPath = `artifacts/conon/public/real-products/${categorySlug}/${itemKey}/`;
  let savedFiles: string[] = [];
  let finalImages: VaultImageEntry[] = payload.images;

  try {
    const diskRes = await localDiskFetch("/__conon-media/save-item", {
      categorySlug,
      itemKey,
      productId: payload.productId,
      slug: payload.slug || itemKey,
      images: payload.images.map(toDiskImageInput),
      overrides: {
        title: payload.title,
        brand: payload.brand,
        subcategory: payload.subcategory,
        description: payload.description,
        specBullets: payload.specBullets,
        price: payload.price,
        mrp: payload.mrp,
        bulkPrice: payload.bulkPrice,
        bulkMinQty: payload.bulkMinQty,
        hsnCode: payload.hsnCode,
        gstRate: payload.gstRate,
        unit: payload.unit,
        isInStock: payload.isInStock,
        isCustomItem: payload.isCustomItem,
      },
    });

    diskSaved = true;
    folderPath = diskRes.folderPath || folderPath;
    savedFiles = Array.isArray(diskRes.savedFiles) ? diskRes.savedFiles : [];
    const stamp = Date.now();
    if (Array.isArray(diskRes.images)) {
      finalImages = diskRes.images.map((im: { url: string; caption?: string }, idx: number) => ({
        id: payload.images[idx]?.id || `disk-${idx}`,
        url: `${im.url}?v=${stamp}`,
        caption: im.caption ?? payload.images[idx]?.caption,
        isPrimary: idx === 0,
        order: idx,
      }));
    }
  } catch (err) {
    if (import.meta.env.VITE_LOCAL_ADMIN === "true") {
      throw err;
    }
  }

  const normalized = normalizeVaultOverride({
    ...payload,
    categorySlug,
    images: finalImages,
    isAdminVerifiedMedia: finalImages.length > 0,
    updatedAt: new Date().toISOString(),
  });

  await saveLocalVaultOverride(normalized);

  // Optional Express + PostgreSQL mirror when API server is running
  let savedToServer = diskSaved;
  try {
    const res = await adminFetch(`/api/media-vault/products/${encodeURIComponent(normalized.productId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalized),
    });
    if (res.ok) savedToServer = true;
  } catch {
    // Local disk + BroadcastChannel are primary
  }

  return {
    ok: true,
    override: normalized,
    savedToServer,
    diskSaved,
    folderPath,
    savedFiles,
  };
}

/**
 * Bulk-applies 1 cover photo or the full 1-6 photo gallery to selected items
 * on disk via applyImagesToKeys and updates live runtime state.
 */
export async function bulkApplyVaultImages(params: {
  sourceProductId?: string;
  sourceSlug?: string;
  productIds: string[];
  images: VaultImageEntry[];
  categorySlug?: string;
  copyMode: "cover_only" | "full_gallery";
  itemsMeta: Record<string, { title?: string; brand?: string; slug?: string; categorySlug?: string; subcategory?: string }>;
}): Promise<{ ok: boolean; count: number; savedToServer: boolean; diskSaved: boolean }> {
  const sourceImgs =
    params.copyMode === "cover_only" && params.images.length > 0 ? [params.images[0]] : params.images;
  const existingMap = getAllVaultOverridesMap();
  const now = new Date().toISOString();
  const baseCategory = sanitizeFolderSlug(params.categorySlug || "general");
  const primaryKey = sanitizeFolderSlug(params.sourceSlug || params.sourceProductId || params.productIds[0] || "item");

  let diskSaved = false;
  const stamp = Date.now();
  try {
    await localDiskFetch("/__conon-media/save-item", {
      categorySlug: baseCategory,
      itemKey: primaryKey,
      productId: params.sourceProductId || primaryKey,
      slug: params.sourceSlug || primaryKey,
      images: sourceImgs.map(toDiskImageInput),
      applyImagesToKeys: params.productIds.map((pid) => {
        const meta = params.itemsMeta[pid];
        const tCat = sanitizeFolderSlug(meta?.categorySlug || baseCategory);
        const tKey = sanitizeFolderSlug(meta?.slug || pid);
        return {
          categorySlug: tCat,
          itemKey: tKey,
          productId: pid,
          slug: meta?.slug || tKey,
          title: meta?.title,
          brand: meta?.brand,
          subcategory: meta?.subcategory,
        };
      }),
    });
    diskSaved = true;
  } catch (err) {
    if (import.meta.env.VITE_LOCAL_ADMIN === "true") {
      throw err;
    }
  }

  const localUpdates: ProductMediaOverride[] = params.productIds.map((pid) => {
    const existing = existingMap[pid];
    const meta = params.itemsMeta[pid];
    const tCat = sanitizeFolderSlug(meta?.categorySlug || baseCategory);
    const tKey = sanitizeFolderSlug(meta?.slug || pid);
    const copiedImgs: VaultImageEntry[] = sourceImgs.map((im, i) => ({
      ...im,
      id: `${im.id}-${pid}-${i}`,
      url: diskSaved
        ? `/real-products/${tCat}/${tKey}/${String(i + 1).padStart(2, "0")}.webp?v=${stamp}`
        : im.url,
      fallbackDataUrl: diskSaved ? undefined : im.fallbackDataUrl,
      isPrimary: i === 0,
      order: i,
    }));
    return normalizeVaultOverride({
      ...(existing || {}),
      productId: pid,
      slug: meta?.slug || existing?.slug,
      title: existing?.title || meta?.title,
      brand: existing?.brand || meta?.brand,
      categorySlug: existing?.categorySlug || meta?.categorySlug || params.categorySlug,
      subcategory: existing?.subcategory || meta?.subcategory,
      images: copiedImgs,
      isAdminVerifiedMedia: copiedImgs.length > 0,
      updatedAt: now,
    });
  });

  await saveManyLocalVaultOverrides(localUpdates);

  return {
    ok: true,
    count: localUpdates.length,
    savedToServer: diskSaved,
    diskSaved,
  };
}

/**
 * Deletes an item's physical real-products folder + manifest entry + local override.
 */
export async function resetProductVaultOverride(productId: string, categorySlug?: string): Promise<void> {
  try {
    await localDiskFetch("/__conon-media/clear-item", {
      itemKey: productId,
      categorySlug,
    });
  } catch (err) {
    if (import.meta.env.VITE_LOCAL_ADMIN === "true") {
      throw err;
    }
  }

  await deleteLocalVaultOverride(productId);
  try {
    await adminFetch(`/api/media-vault/products/${encodeURIComponent(productId)}`, {
      method: "DELETE",
    });
  } catch {
    // ignore offline
  }
}

export function buildVaultBackupPayload(): string {
  const overrides = getAllVaultOverridesMap();
  const payload = {
    schema: "conon-media-vault-backup-v1",
    exportedAt: new Date().toISOString(),
    count: Object.keys(overrides).length,
    overrides,
  };
  return JSON.stringify(payload, null, 2);
}

export async function importVaultBackupJson(
  rawJsonText: string
): Promise<{ count: number; savedToServer: boolean }> {
  const parsed = JSON.parse(rawJsonText);
  const rawOverrides = parsed?.overrides || parsed;
  const list: ProductMediaOverride[] = (
    Array.isArray(rawOverrides)
      ? rawOverrides
      : Object.entries(rawOverrides || {}).map(([k, v]: [string, any]) => ({
          ...(v || {}),
          productId: v?.productId || k,
        }))
  )
    .filter((x) => Boolean(x?.productId))
    .map((x) => normalizeVaultOverride(x));

  await saveManyLocalVaultOverrides(list);
  broadcastVaultMessage({ type: "REPLACE_ALL", overrides: list });

  let savedToServer = false;
  try {
    const res = await adminFetch("/api/media-vault/import-backup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ overrides: list }),
    });
    if (res.ok) savedToServer = true;
  } catch {
    // ignore offline
  }

  return { count: list.length, savedToServer };
}

export function resolvePreviewSrc(img: VaultImageEntry): string {
  if (img.fallbackDataUrl && img.fallbackDataUrl.startsWith("data:")) {
    if (!img.url || img.url.startsWith("data:")) return img.fallbackDataUrl;
    return resolveApiUrl(img.url);
  }
  if (img.url.startsWith("/uploads/")) return resolveApiUrl(img.url);
  return img.url;
}
