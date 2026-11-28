import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import { merchandisingStore } from "../services/merchandisingStore";
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

function broadcastMerchandising(summary: string, entityId?: string) {
  syncBus.publish({
    type: "MERCHANDISING_UPDATED",
    entityId,
    action: "UPDATE",
    summary,
    socketEvent: "merchandising:updated",
    socketPayload: { updatedAt: new Date().toISOString() },
  });
}

/**
 * PUBLIC: GET /api/merchandising/home
 * Single fast payload with full homepage theme masthead, 5 Bento cards, Offer Carousel,
 * Brand Hero & Mid-Page Banners, Promo/Payment Strips & Layout Order.
 */
router.get("/merchandising/home", async (req: Request, res: Response) => {
  try {
    setNoStore(res);
    const activeOnly = req.query.activeOnly === "true" || req.query.activeOnly === "1";
    const data = await merchandisingStore.getHome({ activeOnly });
    return res.json({
      ok: true,
      success: true,
      ...data,
    });
  } catch (err: any) {
    logger.error({ err }, "[Merchandising API] Error loading home merchandising");
    return res.status(500).json({ ok: false, error: err?.message || "Failed to load home merchandising" });
  }
});

/**
 * ADMIN: POST /api/admin/merchandising/upload
 * Uploads banner / bento / pattern / partner logo image -> `/uploads/banners/<filename>`
 */
router.post(
  "/admin/merchandising/upload",
  requireAdmin,
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      validateUploadedImage(req.file);
      const prefix = String(req.body?.prefix || "banner");
      const saved = await processAndSaveUploadedImage({
        buffer: req.file!.buffer,
        dir: BANNERS_UPLOADS_DIR,
        publicPrefix: "/uploads/banners",
        prefixSlug: prefix,
        maxWidth: 1600,
        maxHeight: 1200,
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
        error: err?.message || "Failed uploading merchandising image",
      });
    }
  }
);

/**
 * ADMIN: PUT /api/admin/merchandising/home
 * Atomic full save & publish live across all connected LAN/DevTunnel/localhost devices.
 */
router.put("/admin/merchandising/home", requireAdmin, async (req: Request, res: Response) => {
  try {
    const saved = await merchandisingStore.saveAll(req.body || {});
    broadcastMerchandising(
      `Published Home & Banners Studio (${saved.masthead.isEnabled ? saved.masthead.campaignTitle : "Clean Header"})`
    );
    return res.json({ ok: true, success: true, ...saved });
  } catch (err: any) {
    logger.error({ err }, "[Merchandising API] Save failed");
    return res.status(400).json({ ok: false, error: err?.message || "Failed to save home merchandising" });
  }
});

/**
 * ADMIN Granular Endpoints (Masthead, Bento Cards, Offer Strips, Hero Banners, Promo Strips, Section Layout)
 */
router.put("/admin/merchandising/masthead", requireAdmin, async (req: Request, res: Response) => {
  try {
    const saved = await merchandisingStore.saveAll({ masthead: req.body });
    broadcastMerchandising(`Updated Campaign Masthead "${saved.masthead.campaignTitle}"`, "masthead");
    return res.json({ ok: true, success: true, masthead: saved.masthead });
  } catch (err: any) {
    return res.status(400).json({ ok: false, error: err?.message || "Masthead update failed" });
  }
});

router.put("/admin/merchandising/bento", requireAdmin, async (req: Request, res: Response) => {
  try {
    const cards = Array.isArray(req.body?.bentoCards) ? req.body.bentoCards : req.body;
    if (!Array.isArray(cards)) return res.status(400).json({ ok: false, error: "bentoCards array required" });
    const saved = await merchandisingStore.saveAll({ bentoCards: cards });
    broadcastMerchandising(`Updated ${saved.bentoCards.length} Bento Deal Cards`, "bento");
    return res.json({ ok: true, success: true, bentoCards: saved.bentoCards });
  } catch (err: any) {
    return res.status(400).json({ ok: false, error: err?.message || "Bento update failed" });
  }
});

router.put("/admin/merchandising/offers", requireAdmin, async (req: Request, res: Response) => {
  try {
    const offerStrips = Array.isArray(req.body?.offerStrips) ? req.body.offerStrips : req.body;
    if (!Array.isArray(offerStrips)) return res.status(400).json({ ok: false, error: "offerStrips array required" });
    const saved = await merchandisingStore.saveAll({ offerStrips });
    broadcastMerchandising(`Updated ${saved.offerStrips.length} Offer Carousel Pills`, "offers");
    return res.json({ ok: true, success: true, offerStrips: saved.offerStrips });
  } catch (err: any) {
    return res.status(400).json({ ok: false, error: err?.message || "Offer carousel update failed" });
  }
});

router.put("/admin/merchandising/banners", requireAdmin, async (req: Request, res: Response) => {
  try {
    const heroBanners = Array.isArray(req.body?.heroBanners) ? req.body.heroBanners : req.body;
    if (!Array.isArray(heroBanners)) return res.status(400).json({ ok: false, error: "heroBanners array required" });
    const saved = await merchandisingStore.saveAll({ heroBanners });
    broadcastMerchandising(`Updated ${saved.heroBanners.length} Brand Hero & Mid-Page Banners`, "banners");
    return res.json({ ok: true, success: true, heroBanners: saved.heroBanners });
  } catch (err: any) {
    return res.status(400).json({ ok: false, error: err?.message || "Hero banners update failed" });
  }
});

router.put("/admin/merchandising/promo-strips", requireAdmin, async (req: Request, res: Response) => {
  try {
    const promoStrips = Array.isArray(req.body?.promoStrips) ? req.body.promoStrips : req.body;
    if (!Array.isArray(promoStrips)) return res.status(400).json({ ok: false, error: "promoStrips array required" });
    const saved = await merchandisingStore.saveAll({ promoStrips });
    broadcastMerchandising(`Updated ${saved.promoStrips.length} Promo/Payment Strips`, "promo-strips");
    return res.json({ ok: true, success: true, promoStrips: saved.promoStrips });
  } catch (err: any) {
    return res.status(400).json({ ok: false, error: err?.message || "Promo strips update failed" });
  }
});

router.put("/admin/merchandising/layout", requireAdmin, async (req: Request, res: Response) => {
  try {
    const sectionLayout = Array.isArray(req.body?.sectionLayout) ? req.body.sectionLayout : req.body;
    if (!Array.isArray(sectionLayout)) return res.status(400).json({ ok: false, error: "sectionLayout array required" });
    const saved = await merchandisingStore.saveAll({ sectionLayout });
    broadcastMerchandising("Reordered / toggled Homepage section layout", "layout");
    return res.json({ ok: true, success: true, sectionLayout: saved.sectionLayout });
  } catch (err: any) {
    return res.status(400).json({ ok: false, error: err?.message || "Layout update failed" });
  }
});

export default router;
