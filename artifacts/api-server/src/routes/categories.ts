import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import { categoryStore, saveCategoryImageBuffer } from "../services/categoryStore";
import { requireAdmin } from "../middleware/adminAuth";
import { logger } from "../lib/logger";
import { syncBus } from "../services/syncBus";
import { MAX_IMAGE_UPLOAD_BYTES, validateUploadedImage } from "../utils/uploadSanitizer";

function setNoStore(res: Response) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
}

const router: IRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_UPLOAD_BYTES },
});

function broadcastCategoryChange(
  eventName: "catalog:category_created" | "catalog:category_updated" | "categories:changed",
  payload: any,
  summary?: string
) {
  syncBus.publish({
    type: "CATEGORIES_UPDATED",
    entityId: payload?.slug || payload?.id,
    action: eventName === "catalog:category_created" ? "CREATE" : "UPDATE",
    summary: summary || `Updated category ${payload?.title || payload?.name || payload?.slug || ""}`.trim(),
    socketEvent: eventName,
    socketPayload: payload,
  });
}

function decodeDataUrlBuffer(dataUrl: string): Buffer | null {
  const match = /^data:image\/[a-zA-Z0-9+.-]+;base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return Buffer.from(match[1], "base64");
}

/**
 * PUBLIC GET /api/categories
 * Canonical single source of truth for Customer Home, Mega-Menu, Vendor OS & Admin.
 */
router.get("/categories", async (req: Request, res: Response) => {
  try {
    setNoStore(res);
    const activeOnly = req.query.activeOnly === "true" || req.query.activeOnly === "1";
    const all = await categoryStore.list({ activeOnly: false });
    const categories = activeOnly ? all.filter((c) => c.isActive !== false) : all;

    return res.json({
      ok: true,
      success: true,
      count: categories.length,
      totalCount: all.length,
      activeCount: all.filter((c) => c.isActive !== false).length,
      categories,
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    logger.error({ err }, "[Categories API] Error in GET /categories");
    return res.status(500).json({
      ok: false,
      success: false,
      error: err?.message || "Failed to fetch categories",
      categories: [],
    });
  }
});

/**
 * ADMIN: Upload a category photo to /uploads/categories/<slug>-<ts>.webp
 * Supports multipart/form-data (`image`) or JSON `{ dataUrl, slug }`.
 */
router.post(
  "/categories/upload-image",
  requireAdmin,
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      const slug = String(req.body?.slug || req.body?.categorySlug || "category");
      let inputBuffer: Buffer | null = req.file?.buffer || null;
      if (req.file) {
        validateUploadedImage(req.file);
      }

      if (!inputBuffer && typeof req.body?.dataUrl === "string") {
        inputBuffer = decodeDataUrlBuffer(req.body.dataUrl);
      }

      if (!inputBuffer || inputBuffer.length === 0) {
        return res.status(400).json({
          ok: false,
          success: false,
          error: "No image file or dataUrl provided.",
        });
      }
      if (inputBuffer.length > MAX_IMAGE_UPLOAD_BYTES) {
        return res.status(400).json({
          ok: false,
          success: false,
          error: "Image exceeds maximum 5MB file size limit.",
        });
      }

      const saved = await saveCategoryImageBuffer(slug, inputBuffer);

      let updatedCategory = null;
      const targetIdOrSlug = req.body?.categoryIdOrSlug || req.body?.id;
      if (targetIdOrSlug) {
        try {
          updatedCategory = await categoryStore.update(String(targetIdOrSlug), {
            imageUrl: saved.url,
          });
          broadcastCategoryChange("catalog:category_updated", updatedCategory);
        } catch {
          // Allow standalone upload before category creation
        }
      }

      return res.json({
        ok: true,
        success: true,
        url: saved.url,
        imageUrl: saved.url,
        rawPath: saved.rawPath,
        filename: saved.filename,
        mimeType: saved.mimeType,
        sizeBytes: saved.sizeBytes,
        category: updatedCategory,
      });
    } catch (err: any) {
      logger.error({ err }, "[Categories API] Error uploading category image");
      return res.status(500).json({
        ok: false,
        success: false,
        error: err?.message || "Failed to upload category image",
      });
    }
  }
);

/**
 * ADMIN: Batch reorder categories by displayOrder
 */
router.put(["/categories/reorder", "/admin/catalog/categories/reorder"], requireAdmin, async (req: Request, res: Response) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : req.body?.order;
    if (!Array.isArray(items)) {
      return res.status(400).json({ ok: false, success: false, error: "items array is required" });
    }
    const categories = await categoryStore.reorder(items);
    broadcastCategoryChange("categories:changed", { count: categories.length, reorderedAt: new Date().toISOString() });
    return res.json({ ok: true, success: true, count: categories.length, categories });
  } catch (err: any) {
    logger.error({ err }, "[Categories API] Error reordering categories");
    return res.status(500).json({ ok: false, success: false, error: err?.message || "Reorder failed" });
  }
});

/**
 * ADMIN: Create category (accepts JSON or multipart/form-data with `image`)
 */
router.post(
  "/categories",
  requireAdmin,
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      const body = { ...(req.body || {}) };
      if (req.file?.buffer) {
        const saved = await saveCategoryImageBuffer(
          String(body.slug || body.name || body.title || "category"),
          req.file.buffer
        );
        body.imageUrl = saved.url;
      }

      const created = await categoryStore.create(body);
      broadcastCategoryChange("catalog:category_created", created);
      return res.json({ ok: true, success: true, category: created });
    } catch (err: any) {
      logger.error({ err }, "[Categories API] Error creating category");
      return res.status(400).json({
        ok: false,
        success: false,
        error: err?.message || "Failed to create category",
      });
    }
  }
);

/**
 * PUBLIC GET /api/categories/:slug
 */
router.get("/categories/:slug", async (req: Request, res: Response) => {
  try {
    setNoStore(res);
    const slug = String(req.params.slug || "");
    const category = await categoryStore.getByIdOrSlug(slug);
    if (!category) {
      return res.status(404).json({
        ok: false,
        success: false,
        error: `Category not found for slug: ${slug}`,
      });
    }
    return res.json({ ok: true, success: true, category });
  } catch (err: any) {
    logger.error({ err }, "[Categories API] Error in GET /categories/:slug");
    return res.status(500).json({
      ok: false,
      success: false,
      error: err?.message || "Failed to fetch category",
    });
  }
});

/**
 * ADMIN: Update category by id or slug (accepts JSON or multipart/form-data with `image`)
 */
router.put(
  "/categories/:idOrSlug",
  requireAdmin,
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      const idOrSlug = String(req.params.idOrSlug || "");
      const body = { ...(req.body || {}) };
      if (req.file?.buffer) {
        const saved = await saveCategoryImageBuffer(
          String(body.slug || idOrSlug),
          req.file.buffer
        );
        body.imageUrl = saved.url;
      }

      const updated = await categoryStore.update(idOrSlug, body);
      broadcastCategoryChange("catalog:category_updated", updated);
      return res.json({ ok: true, success: true, category: updated });
    } catch (err: any) {
      const status = err?.message?.includes("not found") ? 404 : 400;
      logger.error({ err }, "[Categories API] Error updating category");
      return res.status(status).json({
        ok: false,
        success: false,
        error: err?.message || "Failed to update category",
      });
    }
  }
);

router.patch(
  "/categories/:idOrSlug",
  requireAdmin,
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      const idOrSlug = String(req.params.idOrSlug || "");
      const body = { ...(req.body || {}) };
      if (req.file?.buffer) {
        const saved = await saveCategoryImageBuffer(
          String(body.slug || idOrSlug),
          req.file.buffer
        );
        body.imageUrl = saved.url;
      }

      const updated = await categoryStore.update(idOrSlug, body);
      broadcastCategoryChange("catalog:category_updated", updated);
      return res.json({ ok: true, success: true, category: updated });
    } catch (err: any) {
      const status = err?.message?.includes("not found") ? 404 : 400;
      logger.error({ err }, "[Categories API] Error patching category");
      return res.status(status).json({
        ok: false,
        success: false,
        error: err?.message || "Failed to update category",
      });
    }
  }
);

export default router;
