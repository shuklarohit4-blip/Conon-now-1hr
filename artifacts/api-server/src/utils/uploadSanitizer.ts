import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { query } from "@workspace/db";
import { CATEGORIES_STORE_PATH, REPO_ROOT } from "../lib/paths";
import { logger } from "../lib/logger";

export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB strict limit

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export function sanitizeUploadSlug(raw: string, fallback = "asset"): string {
  return (
    String(raw || fallback)
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 64) || fallback
  );
}

/**
 * Strips hardcoded localhost / 127.0.0.1 origin prefixes from any asset path
 * so LAN Wi-Fi clients and DevTunnels always resolve relative /uploads/... paths.
 */
export function stripLocalhostPrefix(rawUrl?: string | null): string {
  const val = String(rawUrl || "").trim();
  if (!val) return "";
  if (val.startsWith("data:") || val.startsWith("blob:")) return val;
  return val.replace(/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?/i, "");
}

export function validateUploadedImage(file?: {
  mimetype?: string;
  size?: number;
  buffer?: Buffer;
  originalname?: string;
}): void {
  if (!file || !file.buffer || file.buffer.length === 0) {
    throw new Error("Empty image file provided.");
  }
  if (file.buffer.length > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error("Image exceeds the 5MB maximum allowed file size.");
  }
  const mime = String(file.mimetype || "").toLowerCase();
  const ext = path.extname(file.originalname || "").toLowerCase();
  const allowedExt = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
  if (mime && !ALLOWED_MIME_TYPES.has(mime) && !allowedExt.has(ext)) {
    throw new Error("Unsupported file format. Only JPG, PNG, WebP, and AVIF images are allowed.");
  }
}

export async function processAndSaveUploadedImage(opts: {
  buffer: Buffer;
  dir: string;
  publicPrefix: string; // e.g. "/uploads/categories"
  prefixSlug: string;   // e.g. "cat-cement-civil-works"
  maxWidth?: number;
  maxHeight?: number;
}): Promise<{
  url: string;
  rawPath: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}> {
  if (opts.buffer.length > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error("Image exceeds 5MB limit.");
  }
  if (!fs.existsSync(opts.dir)) {
    fs.mkdirSync(opts.dir, { recursive: true });
  }

  const ts = Date.now();
  const cleanPrefix = sanitizeUploadSlug(opts.prefixSlug, "img");
  const rand = crypto.randomBytes(3).toString("hex");
  const filename = `${cleanPrefix}-${ts}-${rand}.webp`;

  let outBuffer: Buffer;
  try {
    outBuffer = await sharp(opts.buffer)
      .rotate()
      .resize(opts.maxWidth || 1000, opts.maxHeight || 1000, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 86 })
      .toBuffer();
  } catch {
    throw new Error("Invalid or corrupted image file. Please upload a valid JPG, PNG, WebP, or AVIF image.");
  }

  const outPath = path.join(opts.dir, filename);
  fs.writeFileSync(outPath, outBuffer);

  const normalizedPrefix = opts.publicPrefix.replace(/\/+$/, "");
  const rawPath = `${normalizedPrefix}/${filename}`;
  await persistUploadedAssetToDb(rawPath, outBuffer, "image/webp");
  return {
    url: `${rawPath}?v=${ts}`,
    rawPath,
    filename,
    mimeType: "image/webp",
    sizeBytes: outBuffer.length,
  };
}

let uploadedAssetsTableEnsured = false;

async function ensureUploadedAssetsTable(): Promise<void> {
  if (uploadedAssetsTableEnsured) return;
  await query(`
    CREATE TABLE IF NOT EXISTS uploaded_assets (
      path_key TEXT PRIMARY KEY,
      content_type VARCHAR(80) NOT NULL DEFAULT 'image/webp',
      data BYTEA NOT NULL,
      size_bytes INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  uploadedAssetsTableEnsured = true;
}

export async function persistUploadedAssetToDb(
  rawPath: string,
  buffer: Buffer,
  contentType = "image/webp"
): Promise<void> {
  try {
    await ensureUploadedAssetsTable();
    await query(
      `INSERT INTO uploaded_assets (path_key, content_type, data, size_bytes)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (path_key) DO UPDATE SET content_type = EXCLUDED.content_type, data = EXCLUDED.data, size_bytes = EXCLUDED.size_bytes`,
      [rawPath, contentType, buffer, buffer.length]
    );
  } catch {
    // Non-fatal when local Postgres is offline
  }
}

export async function loadUploadedAssetFromDb(
  rawPath: string
): Promise<{ contentType: string; data: Buffer } | null> {
  try {
    await ensureUploadedAssetsTable();
    const res = await query(
      `SELECT content_type, data FROM uploaded_assets WHERE path_key = $1 LIMIT 1`,
      [rawPath]
    );
    const row = res.rows?.[0] as { content_type?: string; data?: Buffer } | undefined;
    if (!row || !row.data) return null;
    return {
      contentType: row.content_type || "image/webp",
      data: Buffer.isBuffer(row.data) ? row.data : Buffer.from(row.data),
    };
  } catch {
    return null;
  }
}

let localhostMigrationRan = false;

/**
 * Startup one-time sanitizer that strips legacy http://localhost:xxxx prefixes
 * from disk JSON stores & Postgres tables so existing media works over LAN & DevTunnels.
 */
export async function runLocalhostUrlCleanupMigration(): Promise<void> {
  if (localhostMigrationRan) return;
  localhostMigrationRan = true;

  const jsonFiles = [
    CATEGORIES_STORE_PATH,
    path.resolve(REPO_ROOT, "artifacts/api-server/data/conon-live-state.json"),
    path.resolve(REPO_ROOT, "artifacts/api-server/data/media-vault-overrides.json"),
    path.resolve(REPO_ROOT, "artifacts/api-server/data/master-products.json"),
    path.resolve(REPO_ROOT, "artifacts/api-server/data/storefront-config.json"),
    path.resolve(REPO_ROOT, "artifacts/api-server/data/home-merchandising.json"),
  ];

  const localhostUrlRe = /https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0)(?::\d+)?(?=\/(?:uploads|images|api\/uploads|real-products))/gi;

  for (const file of jsonFiles) {
    try {
      if (!fs.existsSync(file)) continue;
      const raw = fs.readFileSync(file, "utf8");
      if (localhostUrlRe.test(raw)) {
        const cleaned = raw.replace(localhostUrlRe, "");
        fs.writeFileSync(file, cleaned, "utf8");
        logger.info({ file }, "[URL Migration] Stripped hardcoded localhost URLs from store");
      }
    } catch {
      // Non-fatal
    }
  }

  try {
    await query(
      `UPDATE catalog_categories SET image_url = regexp_replace(image_url, '^https?://(localhost|127\\.0\\.0\\.1|0\\.0\\.0\\.0)(:[0-9]+)?', '', 'i') WHERE image_url ~* '^https?://(localhost|127\\.0\\.0\\.1)'`
    );
    await query(
      `UPDATE master_products SET image_url = regexp_replace(image_url, '^https?://(localhost|127\\.0\\.0\\.1|0\\.0\\.0\\.0)(:[0-9]+)?', '', 'i') WHERE image_url ~* '^https?://(localhost|127\\.0\\.0\\.1)'`
    );
  } catch {
    // Postgres optional
  }
}
