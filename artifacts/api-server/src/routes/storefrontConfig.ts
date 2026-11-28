import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import { storefrontConfigStore } from "../services/storefrontConfigStore";
import { syncBus } from "../services/syncBus";
import { requireAdmin } from "../middleware/adminAuth";
import { BANNERS_UPLOADS_DIR } from "../lib/paths";
import {
  MAX_IMAGE_UPLOAD_BYTES,
  processAndSaveUploadedImage,
  validateUploadedImage,
} from "../utils/uploadSanitizer";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_UPLOAD_BYTES },
});

function setNoStore(res: Response) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
}

/**
 * PUBLIC: GET /api/storefront/config
 * Returns global storefront settings + hero/promotional banners.
 */
router.get("/storefront/config", async (req: Request, res: Response) => {
  try {
    setNoStore(res);
    const config = await storefrontConfigStore.getConfig();
    const activeOnly = req.query.activeOnly === "true" || req.query.activeOnly === "1";
    const banners = activeOnly
      ? config.banners.filter((b) => b.isActive !== false)
      : config.banners;
    return res.json({
      ok: true,
      success: true,
      settings: config.settings,
      banners,
      updatedAt: config.updatedAt,
    });
  } catch (err: any) {
    logger.error({ err }, "[StorefrontConfig API] GET failed");
    return res.status(500).json({ ok: false, error: err?.message || "Failed to load storefront config" });
  }
});

/**
 * ADMIN: PUT /api/admin/storefront/config
 * Updates global store settings and/or hero promotional banners and pushes SSE sync immediately.
 */
router.put("/admin/storefront/config", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { settings, banners } = req.body || {};
    if (settings) {
      if (settings.freeDeliveryMinOrder !== undefined && Number(settings.freeDeliveryMinOrder) < 0) {
        return res.status(400).json({ ok: false, error: "Free delivery minimum order cannot be negative." });
      }
      if (settings.deliveryFee !== undefined && Number(settings.deliveryFee) < 0) {
        return res.status(400).json({ ok: false, error: "Delivery fee cannot be negative." });
      }
    }

    const updated = await storefrontConfigStore.updateConfig({ settings, banners });
    const eventType = banners !== undefined && !settings ? "BANNERS_UPDATED" : "SETTINGS_UPDATED";
    syncBus.publish({
      type: eventType,
      action: "UPDATE",
      summary:
        eventType === "BANNERS_UPDATED"
          ? `Updated Home Hero/Promo Banners (${updated.banners.filter((b) => b.isActive).length} active)`
          : `Updated Global Store Settings (ETA: ${updated.settings.deliveryEtaText}, Min Free: ₹${updated.settings.freeDeliveryMinOrder})`,
      socketEvent: "storefront:config_updated",
      socketPayload: updated,
    });

    return res.json({
      ok: true,
      success: true,
      settings: updated.settings,
      banners: updated.banners,
      updatedAt: updated.updatedAt,
    });
  } catch (err: any) {
    logger.error({ err }, "[StorefrontConfig API] PUT failed");
    return res.status(400).json({ ok: false, error: err?.message || "Failed to save storefront config" });
  }
});

/**
 * ADMIN: POST /api/admin/storefront/upload-banner
 * Validates JPG/PNG/WebP/AVIF <= 5MB and saves to /uploads/banners/.
 */
router.post(
  "/admin/storefront/upload-banner",
  requireAdmin,
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      validateUploadedImage(req.file);
      const saved = await processAndSaveUploadedImage({
        buffer: req.file!.buffer,
        dir: BANNERS_UPLOADS_DIR,
        publicPrefix: "/uploads/banners",
        prefixSlug: `banner-${req.body?.bannerId || "hero"}`,
        maxWidth: 1600,
        maxHeight: 900,
      });

      return res.json({
        ok: true,
        success: true,
        url: saved.url,
        rawPath: saved.rawPath,
        filename: saved.filename,
        sizeBytes: saved.sizeBytes,
      });
    } catch (err: any) {
      return res.status(400).json({
        ok: false,
        success: false,
        error: err?.message || "Banner image upload failed",
      });
    }
  }
);

export default router;
