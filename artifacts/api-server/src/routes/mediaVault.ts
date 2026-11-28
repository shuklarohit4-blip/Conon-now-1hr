import { Router, type IRouter, type Request, type Response } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { PRODUCTS_UPLOADS_DIR } from "../lib/paths";
import { requireAdmin } from "../middleware/adminAuth";
import { mediaVaultEngine } from "../services/mediaVaultEngine";
import { syncBus } from "../services/syncBus";
import { getIo } from "../socket";
import {
  MAX_IMAGE_UPLOAD_BYTES,
  processAndSaveUploadedImage,
  stripLocalhostPrefix,
  validateUploadedImage,
} from "../utils/uploadSanitizer";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_UPLOAD_BYTES },
});

function sanitizeSlug(raw: string): string {
  return (raw || "product")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "product";
}

function decodeDataUrl(dataUrl: string): { buffer: Buffer; mime: string } | null {
  const match = /^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return {
    mime: match[1].toLowerCase(),
    buffer: Buffer.from(match[2], "base64"),
  };
}

/**
 * PUBLIC READ: Storefront customers, search, cart, and vendor catalog read all Admin-managed
 * product images, descriptions, specs, and pricing overrides on boot.
 */
router.get("/media-vault/overrides", (_req: Request, res: Response) => {
  try {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    const overrides = mediaVaultEngine.getAllOverridesMap();
    const list = mediaVaultEngine.getAllOverridesList();
    return res.json({
      ok: true,
      count: list.length,
      overrides,
      items: list,
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    logger.error({ err }, "[MediaVault] Failed GET /media-vault/overrides");
    return res.status(500).json({ ok: false, error: err?.message || "Failed to load overrides" });
  }
});

/**
 * ADMIN-GATED IMAGE UPLOADER:
 * Accepts multipart file (`image` or `file`) OR JSON `{ dataUrl, productId }`.
 * Optimizes via sharp (max 900x900 WebP quality 84) and saves into uploads/products/.
 */
router.post(
  "/media-vault/upload-image",
  requireAdmin,
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      const productId = sanitizeSlug(String(req.body?.productId || "product"));
      let inputBuffer: Buffer | null = req.file?.buffer || null;
      if (req.file) {
        validateUploadedImage(req.file);
      }

      if (!inputBuffer && typeof req.body?.dataUrl === "string") {
        const parsed = decodeDataUrl(req.body.dataUrl);
        if (parsed) inputBuffer = parsed.buffer;
      }

      if (!inputBuffer || inputBuffer.length === 0) {
        return res.status(400).json({ ok: false, error: "No image file or dataUrl provided." });
      }
      if (inputBuffer.length > MAX_IMAGE_UPLOAD_BYTES) {
        return res.status(400).json({ ok: false, error: "Image exceeds 5MB limit." });
      }

      const saved = await processAndSaveUploadedImage({
        buffer: inputBuffer,
        dir: PRODUCTS_UPLOADS_DIR,
        publicPrefix: "/uploads/products",
        prefixSlug: `prod-${productId}`,
        maxWidth: 900,
        maxHeight: 900,
      });

      return res.json({
        ok: true,
        url: saved.url,
        rawPath: saved.rawPath,
        sizeBytes: saved.sizeBytes,
      });
    } catch (err: any) {
      logger.error({ err }, "[MediaVault] Image upload failed");
      return res.status(400).json({ ok: false, error: err?.message || "Image upload failed" });
    }
  }
);

/**
 * ADMIN-GATED UPSERT:
 * Upserts multi-image gallery (up to 6 photos), description, specs, and pricing.
 * Broadcasts `media_vault:product_updated` + `catalog:image_updated` over Socket.io!
 */
router.put("/media-vault/products/:productId", requireAdmin, async (req: Request, res: Response) => {
  try {
    const productId = String(req.params.productId || "").trim();
    if (!productId) {
      return res.status(400).json({ ok: false, error: "Missing productId" });
    }

    const saved = await mediaVaultEngine.upsertOverride(productId, {
      ...(req.body || {}),
      images: Array.isArray(req.body?.images)
        ? req.body.images.map((im: any) => ({ ...im, url: stripLocalhostPrefix(im?.url) }))
        : req.body?.images,
    });

    syncBus.publish({
      type: "CATALOG_UPDATED",
      entityId: productId,
      action: "UPDATE",
      summary: `Updated Media & Specs for ${saved.title || productId}`,
      socketEvent: "media_vault:product_updated",
      socketPayload: { productId, override: saved },
    });

    return res.json({ ok: true, override: saved });
  } catch (err: any) {
    logger.error({ err }, "[MediaVault] PUT /products/:productId failed");
    return res.status(500).json({ ok: false, error: err?.message || "Failed to save product override" });
  }
});

/**
 * ADMIN-GATED BULK APPLY:
 * Applies verified cover or full gallery photos across multiple similar variant productIds.
 */
router.post("/media-vault/bulk-apply-images", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { productIds, images, categorySlug, copyMode, itemsMeta } = req.body || {};
    if (!Array.isArray(productIds) || productIds.length === 0 || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ ok: false, error: "productIds and images arrays are required." });
    }

    const updatedRecords = await mediaVaultEngine.bulkApplyImages({
      productIds,
      images,
      categorySlug,
      copyMode,
      itemsMeta,
    });

    const io = getIo();
    if (io) {
      io.emit("media_vault:bulk_updated", {
        count: updatedRecords.length,
        overrides: updatedRecords,
      });
      for (const rec of updatedRecords) {
        io.emit("media_vault:product_updated", { productId: rec.productId, override: rec });
      }
    }

    return res.json({
      ok: true,
      count: updatedRecords.length,
      overrides: updatedRecords,
    });
  } catch (err: any) {
    logger.error({ err }, "[MediaVault] Bulk apply failed");
    return res.status(500).json({ ok: false, error: err?.message || "Bulk image apply failed" });
  }
});

/**
 * ADMIN-GATED BACKUP IMPORT
 */
router.post("/media-vault/import-backup", requireAdmin, async (req: Request, res: Response) => {
  try {
    const payload = req.body?.overrides || req.body;
    const count = await mediaVaultEngine.importBackup(payload);
    const allOverrides = mediaVaultEngine.getAllOverridesMap();

    const io = getIo();
    if (io) {
      io.emit("media_vault:imported", { count, overrides: allOverrides });
    }

    return res.json({ ok: true, count, overrides: allOverrides });
  } catch (err: any) {
    logger.error({ err }, "[MediaVault] Backup import failed");
    return res.status(500).json({ ok: false, error: err?.message || "Import backup failed" });
  }
});

/**
 * ADMIN-GATED DELETE / RESET PRODUCT OVERRIDE
 */
router.delete("/media-vault/products/:productId", requireAdmin, async (req: Request, res: Response) => {
  try {
    const productId = String(req.params.productId || "").trim();
    const removed = await mediaVaultEngine.deleteOverride(productId);

    const io = getIo();
    if (io && removed) {
      io.emit("media_vault:product_deleted", { productId });
    }

    return res.json({ ok: true, removed, productId });
  } catch (err: any) {
    logger.error({ err }, "[MediaVault] Delete override failed");
    return res.status(500).json({ ok: false, error: err?.message || "Failed to delete override" });
  }
});

export default router;
