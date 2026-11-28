import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import { productStore } from "../services/productStore";
import { PRODUCTS_UPLOADS_DIR } from "../lib/paths";
import { requireAdmin } from "../middleware/adminAuth";
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

function toStorefrontShape(p: any) {
  return {
    ...p,
    name: p.title,
    price: p.sellingPrice,
    subCategory: p.subcategory,
    image: p.imageUrl,
    images: (p.images || []).map((g: any) => g.url).filter(Boolean),
    galleryImages: p.images || [],
    specifications: p.keyInfo?.length ? p.keyInfo : p.specTags || [],
    highlights: p.usageTips?.length ? p.usageTips : [],
    highlightTiles: p.highlights || [],
    bulkPricingTiers: (p.bulkSlabs || []).map((s: any) => ({
      minQty: s.minQty,
      pricePerUnit: s.price,
      label: s.label,
    })),
    inStock: p.isInStock,
    discountPercent:
      p.mrp > p.sellingPrice ? Math.round(((p.mrp - p.sellingPrice) / p.mrp) * 100) : 0,
  };
}

router.get("/products", async (req: Request, res: Response) => {
  try {
    setNoStore(res);
    const categoryQuery = String(req.query.categorySlug || req.query.category || "").trim();
    const subCategoryQuery = String(req.query.subCategory || "").trim();
    const searchQuery = String(req.query.search || req.query.q || "").trim();
    const limitQuery = parseInt(String(req.query.limit || "0"), 10) || 0;

    let items = await productStore.list({
      category: categoryQuery || undefined,
      search: searchQuery || undefined,
      includeArchived: false,
      limit: limitQuery > 0 ? limitQuery : undefined,
    });

    if (subCategoryQuery) {
      items = items.filter(
        (p) => p.subcategory?.toLowerCase() === subCategoryQuery.toLowerCase()
      );
    }

    const products = items.map(toStorefrontShape);
    return res.json({
      ok: true,
      success: true,
      count: products.length,
      products,
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    logger.error({ err }, "[Products API] Error in GET /products");
    return res.status(500).json({
      success: false,
      error: err?.message || "Failed to fetch products",
      products: [],
    });
  }
});

router.post(
  "/products/upload-image",
  requireAdmin,
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      validateUploadedImage(req.file);
      const slug = String(req.body?.slug || req.body?.productId || "product");
      const saved = await processAndSaveUploadedImage({
        buffer: req.file!.buffer,
        dir: PRODUCTS_UPLOADS_DIR,
        publicPrefix: "/uploads/products",
        prefixSlug: `prod-${slug}`,
        maxWidth: 1000,
        maxHeight: 1000,
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
        error: err?.message || "Product image upload failed",
      });
    }
  }
);

router.get("/products/:idOrSlug", async (req: Request, res: Response) => {
  try {
    setNoStore(res);
    const idOrSlug = String(req.params.idOrSlug || "").trim();
    if (!idOrSlug) {
      return res.status(400).json({ success: false, error: "Product id or slug required" });
    }
    const item = await productStore.getOne(idOrSlug);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: `Product not found for: ${idOrSlug}`,
      });
    }
    return res.json({
      ok: true,
      success: true,
      product: toStorefrontShape(item),
    });
  } catch (err: any) {
    logger.error({ err }, "[Products API] Error in GET /products/:idOrSlug");
    return res.status(500).json({
      success: false,
      error: err?.message || "Failed to fetch product",
    });
  }
});

export default router;
