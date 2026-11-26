import { Router, type IRouter, type Request, type Response } from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";
import sharp from "sharp";
import { PRODUCTS_UPLOADS_DIR } from "../lib/paths";
import { requireAdmin } from "../middleware/adminAuth";
import { mediaVaultEngine } from "../services/mediaVaultEngine";
import { getIo, adminRoom } from "../socket";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
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

      if (!inputBuffer && typeof req.body?.dataUrl === "string") {
        const parsed = decodeDataUrl(req.body.dataUrl);
        if (parsed) inputBuffer = parsed.buffer;
      }

      if (!inputBuffer || inputBuffer.length === 0) {
        return res.status(400).json({ ok: false, error: "No image file or dataUrl provided." });
      }

      if (!fs.existsSync(PRODUCTS_UPLOADS_DIR)) {
        fs.mkdirSync(PRODUCTS_UPLOADS_DIR, { recursive: true });
      }

      const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
      let outFilename = `${productId}-${uniqueSuffix}.webp`;
      let outBuffer: Buffer;
      let mimeType = "image/webp";

      try {
        outBuffer = await sharp(inputBuffer)
          .rotate()
          .resize(900, 900, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 84 })
          .toBuffer();
      } catch {
        // Fallback: save raw JPEG/WebP buffer cleanly if sharp encounters exotic encoding
        outFilename = `${productId}-${uniqueSuffix}.jpg`;
        mimeType = "image/jpeg";
        outBuffer = inputBuffer;
      }

      const outPath = path.join(PRODUCTS_UPLOADS_DIR, outFilename);
      fs.writeFileSync(outPath, outBuffer);

      const url = `/uploads/products/${outFilename}`;
      const apiUrl = `/api/uploads/products/${outFilename}`;
      const dataUrlFallback = `data:${mimeType};base64,${outBuffer.toString("base64")}`;

      return res.json({
        ok: true,
        url,
        apiUrl,
        sizeBytes: outBuffer.length,
        dataUrlFallback: outBuffer.length <= 250 * 1024 ? dataUrlFallback : undefined,
      });
    } catch (err: any) {
      logger.error({ err }, "[MediaVault] Image upload failed");
      return res.status(500).json({ ok: false, error: err?.message || "Image upload failed" });
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

    const saved = await mediaVaultEngine.upsertOverride(productId, req.body || {});
    const primaryUrl = saved.images[0]?.url;

    const io = getIo();
    if (io) {
      io.emit("media_vault:product_updated", { productId, override: saved });
      io.to(adminRoom()).emit("media_vault:product_updated", { productId, override: saved });
      if (primaryUrl) {
        io.emit("catalog:image_updated", { productId, imageUrl: primaryUrl, fromAdminVault: true });
      }
    }

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
