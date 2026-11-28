import fs from "node:fs";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin, ViteDevServer } from "vite";
import { pathToFileURL } from "node:url";
import { patchLiveStateFile, readLiveStateFile, writeLiveStateAtomic } from "./vite-plugin-conon-sync";

export interface CononMediaPluginOptions {
  isLocalAdmin?: boolean;
}

interface IncomingImageInput {
  dataUrl?: string;
  existingUrl?: string;
  caption?: string;
}

interface ApplyTargetInput {
  categorySlug: string;
  itemKey: string;
  productId?: string;
  slug?: string;
  title?: string;
  brand?: string;
  subcategory?: string;
}

interface SaveItemRequestBody {
  categorySlug: string;
  itemKey: string;
  productId?: string;
  slug?: string;
  images?: IncomingImageInput[];
  overrides?: Record<string, unknown>;
  applyImagesToKeys?: ApplyTargetInput[];
}

interface PreparedImageBuffer {
  buffer: Buffer;
  filename: string;
  caption?: string;
}

const MAX_BODY_BYTES = 25 * 1024 * 1024; // 25 MB limit
const MAX_DIMENSION = 900;
const VALID_IMAGE_RE = /\.(webp|jpe?g|png)$/i;

function sanitizeSlug(raw: unknown, fallback = "item"): string {
  const cleaned = String(raw || "")
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/\.{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || fallback;
}

function assertInsideDir(baseDir: string, candidatePath: string): string {
  const resolvedBase = path.resolve(baseDir);
  const resolvedCandidate = path.resolve(candidatePath);
  if (
    resolvedCandidate !== resolvedBase &&
    !resolvedCandidate.startsWith(resolvedBase + path.sep)
  ) {
    throw new Error("Invalid media path traversal detected");
  }
  return resolvedCandidate;
}

function readJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;

    req.on("data", (chunk: Buffer) => {
      totalBytes += chunk.length;
      if (totalBytes > MAX_BODY_BYTES) {
        reject(new Error("Payload exceeds 25 MB limit"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(new Error("Invalid JSON request body"));
      }
    });

    req.on("error", (err) => reject(err));
  });
}

function sendJson(res: ServerResponse, statusCode: number, data: unknown): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

async function getSharpInstance(): Promise<any | null> {
  try {
    const mod = await import("sharp");
    return mod.default || mod;
  } catch {
    return null;
  }
}

async function normalizeToWebpBuffer(rawBuf: Buffer, isAlreadyWebp: boolean): Promise<Buffer> {
  const sharpFn = await getSharpInstance();
  if (!sharpFn) {
    return rawBuf;
  }

  try {
    // Re-encode PNG/JPEG or oversized images through sharp for crisp <=900px <150KB WebP
    const img = sharpFn(rawBuf);
    const meta = await img.metadata();
    const needsResize =
      (meta.width && meta.width > MAX_DIMENSION) ||
      (meta.height && meta.height > MAX_DIMENSION);

    if (isAlreadyWebp && !needsResize && rawBuf.length <= 160 * 1024) {
      return rawBuf;
    }

    let pipeline = sharpFn(rawBuf).rotate();
    if (needsResize) {
      pipeline = pipeline.resize(MAX_DIMENSION, MAX_DIMENSION, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }
    return await pipeline
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .webp({ quality: 84 })
      .toBuffer();
  } catch {
    // Fallback to raw buffer if exotic image variant (e.g. minimal valid buffer)
    return rawBuf;
  }
}

async function prepareImageBuffers(
  images: IncomingImageInput[],
  publicDir: string
): Promise<PreparedImageBuffer[]> {
  const limited = images.slice(0, 6);
  const prepared: PreparedImageBuffer[] = [];

  for (let i = 0; i < limited.length; i++) {
    const entry = limited[i];
    if (!entry) continue;
    const filename = `${String(prepared.length + 1).padStart(2, "0")}.webp`;
    const caption = entry.caption ? String(entry.caption).trim() : undefined;

    if (typeof entry.dataUrl === "string" && entry.dataUrl.startsWith("data:image/")) {
      const match = entry.dataUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (!match) continue;
      const mimeSub = match[1].toLowerCase();
      const rawBuf = Buffer.from(match[2], "base64");
      const outBuf = await normalizeToWebpBuffer(rawBuf, mimeSub === "webp");
      prepared.push({ buffer: outBuf, filename, caption });
      continue;
    }

    if (typeof entry.existingUrl === "string" && entry.existingUrl.trim()) {
      const cleanUrl = entry.existingUrl.trim().split("?")[0].split("#")[0];
      const rel = cleanUrl.startsWith("/") ? cleanUrl.slice(1) : cleanUrl;
      const absCandidate = assertInsideDir(publicDir, path.join(publicDir, rel));
      if (fs.existsSync(absCandidate) && fs.statSync(absCandidate).isFile()) {
        const rawBuf = fs.readFileSync(absCandidate);
        const isWebp = absCandidate.toLowerCase().endsWith(".webp");
        const outBuf = await normalizeToWebpBuffer(rawBuf, isWebp);
        prepared.push({ buffer: outBuf, filename, caption });
      }
    }
  }

  return prepared;
}

function readExistingMeta(itemDir: string): Record<string, any> {
  const metaPath = path.join(itemDir, "meta.json");
  if (!fs.existsSync(metaPath)) return {};
  try {
    const parsed = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function removeOldImageFiles(itemDir: string): void {
  if (!fs.existsSync(itemDir)) return;
  for (const d of fs.readdirSync(itemDir, { withFileTypes: true })) {
    if (d.isFile() && VALID_IMAGE_RE.test(d.name)) {
      fs.unlinkSync(path.join(itemDir, d.name));
    }
  }
}

function hasMeaningfulOverrides(ov?: Record<string, unknown> | null): boolean {
  if (!ov || typeof ov !== "object") return false;
  const ignoreKeys = new Set(["productId", "slug", "categorySlug", "captions", "updatedAt"]);
  for (const [k, v] of Object.entries(ov)) {
    if (ignoreKeys.has(k)) continue;
    if (Array.isArray(v) && v.length > 0) return true;
    if (typeof v === "string" && v.trim()) return true;
    if (typeof v === "number" && Number.isFinite(v)) return true;
    if (typeof v === "boolean") return true;
  }
  return false;
}

async function runManifestSync(rootDir: string) {
  const scriptPath = path.join(rootDir, "scripts/sync-real-media-manifest.mjs");
  const mod = await import(pathToFileURL(scriptPath).href);
  return mod.syncRealMediaManifest({ rootDir });
}

export function cononMediaPlugin(options: CononMediaPluginOptions = {}): Plugin {
  const cononDir = path.resolve(import.meta.dirname);
  const rootDir = path.resolve(cononDir, "../..");
  const publicDir = path.join(cononDir, "public");
  const realProductsDir = path.join(publicDir, "real-products");

  let isServeCommand = false;

  return {
    name: "vite-plugin-conon-media",

    configResolved(config) {
      isServeCommand = config.command === "serve";
    },

    async buildStart() {
      await runManifestSync(rootDir);
    },

    configureServer(server: ViteDevServer) {
      // Strictly mount local disk-writer middleware in LOCAL DEV ADMIN mode ONLY
      if (!isServeCommand || !options.isLocalAdmin) {
        return;
      }

      server.middlewares.use("/__conon-media/save-item", async (req, res, next) => {
        if (req.method !== "POST") return next();
        try {
          const body = (await readJsonBody(req)) as SaveItemRequestBody;
          const safeCat = sanitizeSlug(body.categorySlug, "general");
          const safeItem = sanitizeSlug(body.itemKey || body.slug || body.productId, "item");

          const catDir = assertInsideDir(realProductsDir, path.join(realProductsDir, safeCat));
          const itemDir = assertInsideDir(catDir, path.join(catDir, safeItem));

          // 1. Decode/load ALL image buffers into memory BEFORE cleaning destination folder
          const preparedImages = await prepareImageBuffers(
            Array.isArray(body.images) ? body.images : [],
            publicDir
          );

          const captions: Record<string, string> = {};
          for (const im of preparedImages) {
            if (im.caption) captions[im.filename] = im.caption;
          }

          const cleanOverrides = body.overrides && typeof body.overrides === "object" ? { ...body.overrides } : {};
          const metaPayload: Record<string, any> = {
            productId: String(body.productId || body.itemKey || safeItem),
            ...(body.slug ? { slug: String(body.slug) } : {}),
            categorySlug: safeCat,
            ...cleanOverrides,
            captions,
            updatedAt: new Date().toISOString(),
          };

          const keepMeta = preparedImages.length > 0 || hasMeaningfulOverrides(cleanOverrides);
          if (!keepMeta) {
            if (fs.existsSync(itemDir)) {
              fs.rmSync(itemDir, { recursive: true, force: true });
            }
          } else {
            fs.mkdirSync(itemDir, { recursive: true });
            removeOldImageFiles(itemDir);
            for (const im of preparedImages) {
              const targetFile = assertInsideDir(itemDir, path.join(itemDir, im.filename));
              fs.writeFileSync(targetFile, im.buffer);
            }
            fs.writeFileSync(path.join(itemDir, "meta.json"), JSON.stringify(metaPayload, null, 2), "utf8");
          }

          // 2. Batch fan-out: Apply exact verified WebP files to any target variants
          const appliedTargets: string[] = [];
          if (Array.isArray(body.applyImagesToKeys) && preparedImages.length > 0) {
            for (const target of body.applyImagesToKeys) {
              const tCat = sanitizeSlug(target.categorySlug || safeCat, safeCat);
              const tItem = sanitizeSlug(target.itemKey || target.slug || target.productId, "");
              if (!tItem || (tCat === safeCat && tItem === safeItem)) continue;

              const tCatDir = assertInsideDir(realProductsDir, path.join(realProductsDir, tCat));
              const tItemDir = assertInsideDir(tCatDir, path.join(tCatDir, tItem));
              const existingTargetMeta = readExistingMeta(tItemDir);

              fs.mkdirSync(tItemDir, { recursive: true });
              removeOldImageFiles(tItemDir);
              for (const im of preparedImages) {
                const targetFile = assertInsideDir(tItemDir, path.join(tItemDir, im.filename));
                fs.writeFileSync(targetFile, im.buffer);
              }

              const nextTargetMeta: Record<string, any> = {
                ...existingTargetMeta,
                productId: String(target.productId || target.itemKey || existingTargetMeta.productId || tItem),
                ...(target.slug ? { slug: String(target.slug) } : {}),
                ...(target.title && !existingTargetMeta.title ? { title: String(target.title) } : {}),
                ...(target.brand && !existingTargetMeta.brand ? { brand: String(target.brand) } : {}),
                ...(target.subcategory && !existingTargetMeta.subcategory
                  ? { subcategory: String(target.subcategory) }
                  : {}),
                categorySlug: tCat,
                captions,
                updatedAt: new Date().toISOString(),
              };

              fs.writeFileSync(path.join(tItemDir, "meta.json"), JSON.stringify(nextTargetMeta, null, 2), "utf8");
              appliedTargets.push(`${tCat}/${tItem}`);
            }
          }

          // 3. Immediately regenerate realMediaManifest.generated.ts & manifest.json + conon-live-state.json
          const syncRes = await runManifestSync(rootDir);

          const savedImages = preparedImages.map((im) => ({
            url: `/real-products/${safeCat}/${safeItem}/${im.filename}`,
            ...(im.caption ? { caption: im.caption } : {}),
          }));

          const statePath = path.join(publicDir, "conon-live-state.json");
          const itemProductId = String(body.productId || body.itemKey || safeItem);
          const productOverridePatch: Record<string, any> = {
            [itemProductId]: {
              productId: itemProductId,
              slug: String(body.slug || safeItem),
              categorySlug: safeCat,
              images: savedImages.map((im, idx) => ({
                id: `disk-${idx}`,
                url: im.url,
                caption: im.caption,
                isPrimary: idx === 0,
                order: idx,
              })),
              ...cleanOverrides,
              isAdminVerifiedMedia: savedImages.length > 0,
              updatedAt: new Date().toISOString(),
            },
          };
          for (const target of Array.isArray(body.applyImagesToKeys) ? body.applyImagesToKeys : []) {
            const tId = String(target.productId || target.itemKey || target.slug || "").trim();
            const tCat = sanitizeSlug(target.categorySlug || safeCat, safeCat);
            const tItem = sanitizeSlug(target.itemKey || target.slug || target.productId, "");
            if (!tId || !tItem) continue;
            productOverridePatch[tId] = {
              productId: tId,
              slug: String(target.slug || tItem),
              categorySlug: tCat,
              ...(target.title ? { title: String(target.title) } : {}),
              ...(target.brand ? { brand: String(target.brand) } : {}),
              ...(target.subcategory ? { subcategory: String(target.subcategory) } : {}),
              images: preparedImages.map((im, idx) => ({
                id: `disk-${idx}`,
                url: `/real-products/${tCat}/${tItem}/${im.filename}`,
                caption: im.caption,
                isPrimary: idx === 0,
                order: idx,
              })),
              isAdminVerifiedMedia: preparedImages.length > 0,
              updatedAt: new Date().toISOString(),
            };
          }
          patchLiveStateFile(statePath, { products: { overrides: productOverridePatch } });

          sendJson(res, 200, {
            ok: true,
            itemKey: String(body.itemKey || safeItem),
            folderSlug: safeItem,
            categorySlug: safeCat,
            folderPath: `artifacts/conon/public/real-products/${safeCat}/${safeItem}/`,
            savedFiles: preparedImages.map((im) => im.filename),
            images: savedImages,
            overrides: cleanOverrides,
            appliedTargets,
            manifestStats: {
              itemCount: syncRes.itemCount,
              keyCount: syncRes.keyCount,
            },
          });
        } catch (err: any) {
          sendJson(res, 400, {
            ok: false,
            error: err?.message || "Failed to save real media files to disk",
          });
        }
      });

      server.middlewares.use("/__conon-media/save-category-cover", async (req, res, next) => {
        if (req.method !== "POST") return next();
        try {
          const body = (await readJsonBody(req)) as { slug: string; dataUrl: string };
          const safeSlug = sanitizeSlug(String(body.slug || ""), "custom-category");
          const rawUrl = String(body.dataUrl || "");
          const match = rawUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
          if (!match) {
            return sendJson(res, 400, { ok: false, error: "Invalid image dataUrl" });
          }
          const ext = match[1] === "jpeg" ? "jpg" : match[1];
          const buffer = Buffer.from(match[2], "base64");
          const catDir = path.join(realProductsDir, "categories", safeSlug);
          fs.mkdirSync(catDir, { recursive: true });
          const filename = `cover-${Date.now()}.${ext}`;
          fs.writeFileSync(path.join(catDir, filename), buffer);
          const url = `/real-products/categories/${safeSlug}/${filename}`;
          sendJson(res, 200, { ok: true, slug: safeSlug, url });
        } catch (err: any) {
          sendJson(res, 400, { ok: false, error: err?.message || "Failed to save category cover" });
        }
      });

      server.middlewares.use("/__conon-media/clear-item", async (req, res, next) => {
        if (req.method !== "POST") return next();
        try {
          const body = (await readJsonBody(req)) as { categorySlug?: string; itemKey: string };
          const rawKey = String(body.itemKey || "").trim();
          const safeKey = sanitizeSlug(rawKey, "");
          if (!rawKey) {
            sendJson(res, 400, { ok: false, error: "itemKey is required" });
            return;
          }

          let removedCount = 0;
          const searchCats: string[] = [];

          if (body.categorySlug) {
            searchCats.push(sanitizeSlug(body.categorySlug));
          } else if (fs.existsSync(realProductsDir)) {
            for (const d of fs.readdirSync(realProductsDir, { withFileTypes: true })) {
              if (d.isDirectory() && !d.name.startsWith(".") && d.name !== "_brand-groups") {
                searchCats.push(d.name);
              }
            }
          }

          for (const cat of searchCats) {
            const catDir = assertInsideDir(realProductsDir, path.join(realProductsDir, cat));
            if (!fs.existsSync(catDir)) continue;

            for (const d of fs.readdirSync(catDir, { withFileTypes: true })) {
              if (!d.isDirectory() || d.name.startsWith(".")) continue;
              const itemDir = assertInsideDir(catDir, path.join(catDir, d.name));
              const meta = readExistingMeta(itemDir);
              if (
                d.name === safeKey ||
                meta.productId === rawKey ||
                meta.slug === rawKey
              ) {
                fs.rmSync(itemDir, { recursive: true, force: true });
                removedCount += 1;
              }
            }

            // Clean up empty category directory cleanly
            const remaining = fs.readdirSync(catDir).filter((n) => !n.startsWith("."));
            if (remaining.length === 0) {
              fs.rmSync(catDir, { recursive: true, force: true });
            }
          }

          const syncRes = await runManifestSync(rootDir);
          const statePath = path.join(publicDir, "conon-live-state.json");
          const liveState = readLiveStateFile(statePath);
          if (liveState?.products?.overrides) {
            delete liveState.products.overrides[rawKey];
            if (safeKey) delete liveState.products.overrides[safeKey];
            liveState.version = Math.max(Date.now(), Number(liveState.version || 0) + 1);
            liveState.updatedAt = new Date().toISOString();
            writeLiveStateAtomic(statePath, liveState);
          }
          sendJson(res, 200, {
            ok: true,
            itemKey: rawKey,
            removedCount,
            manifestStats: {
              itemCount: syncRes.itemCount,
              keyCount: syncRes.keyCount,
            },
          });
        } catch (err: any) {
          sendJson(res, 400, {
            ok: false,
            error: err?.message || "Failed to clear item media",
          });
        }
      });
    },
  };
}
