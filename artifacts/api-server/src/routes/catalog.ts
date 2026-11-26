import { Router, type Request, type Response } from "express";
import { z } from "zod";
import multer from "multer";
import { catalogEngine } from "../services/catalogEngine";
import { imageStudioService } from "../services/imageStudioService";
import { requireAdmin } from "../middleware/adminAuth";

const router = Router();
router.use("/admin", requireAdmin);

// Multer memory upload middleware for Mode 1 drag & drop / direct uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype === "application/octet-stream") {
      cb(null, true);
    } else {
      cb(new Error("Only image files (.jpg, .png, .webp, .avif) are allowed"));
    }
  },
});

// Category-specific tax and logistics defaults
const CATEGORY_DEFAULTS: Record<
  string,
  { hsnCode: string; gstPercent: number; vehicle: "2W_BIKE" | "3W_ELECTRIC_LOADER" | "4W_PICKUP" | "HEAVY_TRUCK" }
> = {
  "cement-tmt-chemicals": { hsnCode: "2523", gstPercent: 18, vehicle: "HEAVY_TRUCK" },
  "bricks-sand-gitti-aac": { hsnCode: "6901", gstPercent: 5, vehicle: "HEAVY_TRUCK" },
  "plumbing": { hsnCode: "3917", gstPercent: 18, vehicle: "2W_BIKE" },
  "electrical": { hsnCode: "8544", gstPercent: 18, vehicle: "2W_BIKE" },
  "tiles-marble-granite": { hsnCode: "6907", gstPercent: 18, vehicle: "4W_PICKUP" },
  "paints-putty-primer": { hsnCode: "3209", gstPercent: 18, vehicle: "4W_PICKUP" },
  "plywood": { hsnCode: "4412", gstPercent: 18, vehicle: "4W_PICKUP" },
  "hardware": { hsnCode: "8302", gstPercent: 18, vehicle: "2W_BIKE" },
  "door-hardware-locks": { hsnCode: "8301", gstPercent: 18, vehicle: "2W_BIKE" },
  "furniture-wardrobe-bed-hardware": { hsnCode: "8302", gstPercent: 18, vehicle: "2W_BIKE" },
  "modular-kitchen-systems": { hsnCode: "9403", gstPercent: 18, vehicle: "3W_ELECTRIC_LOADER" },
  "kitchen-sinks-faucets": { hsnCode: "7324", gstPercent: 18, vehicle: "3W_ELECTRIC_LOADER" },
  "sanitary-bath-fittings": { hsnCode: "6910", gstPercent: 18, vehicle: "3W_ELECTRIC_LOADER" },
  "fevicol-adhesives-sealants": { hsnCode: "3506", gstPercent: 18, vehicle: "2W_BIKE" },
  "power-tools-safety": { hsnCode: "8467", gstPercent: 18, vehicle: "2W_BIKE" },
  "home-appliances": { hsnCode: "8516", gstPercent: 18, vehicle: "3W_ELECTRIC_LOADER" },
  "cctv": { hsnCode: "8525", gstPercent: 18, vehicle: "2W_BIKE" },
};

// Zod Schemas for Validation
const SpecItemSchema = z.object({
  key: z.string().optional(),
  label: z.string().optional(),
  value: z.string(),
}).transform((data) => ({
  label: data.label || data.key || "Spec",
  value: data.value,
}));

const SkuPatchSchema = z.object({
  sellingPrice: z.number().positive().optional(),
  mrp: z.number().positive().optional(),
  dealerLandingCost: z.number().nonnegative().optional(),
  landingCost: z.number().nonnegative().optional(),
  inStock: z.boolean().optional(),
  express60Min: z.boolean().optional(),
  isExpress60: z.boolean().optional(),
  gstPercent: z.number().optional(),
  hsnCode: z.string().optional(),
  deliveryVehicleType: z.enum(["2W_BIKE", "3W_ELECTRIC_LOADER", "4W_PICKUP", "HEAVY_TRUCK", "E_LOADER", "TRACTOR_DUMPER"]).optional(),
  imageUrl: z.string().optional(),
  name: z.string().min(2).optional(),
  brand: z.string().min(1).optional(),
  unit: z.string().optional(),
  packSize: z.string().optional(),
  oemModelCode: z.string().optional(),
  shortDescription: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  specs: z.array(SpecItemSchema).optional(),
  fitGuardrailBadge: z.string().optional(),
  preferredVendorId: z.string().optional(),
  isFeatured: z.boolean().optional(),
  pairedSkuIds: z.array(z.string()).optional(),
  subcategory: z.string().optional(),
  archived: z.boolean().optional(),
});

const SkuCreateSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(2, "Product name is required"),
    brand: z.string().min(1, "Brand name is required"),
    category: z.string().optional(),
    categoryId: z.string().optional(),
    categorySlug: z.string().optional(),
    categoryName: z.string().optional(),
    subcategory: z.string().optional(),
    unit: z.string().default("Piece"),
    packSize: z.string().optional(),
    oemModelCode: z.string().optional(),
    shortDescription: z.string().optional(),
    highlights: z.array(z.string()).optional(),
    specs: z.array(SpecItemSchema).optional(),
    fitGuardrailBadge: z.string().optional(),
    preferredVendorId: z.string().optional(),
    sellingPrice: z.number().positive("Selling price must be positive"),
    mrp: z.number().positive("MRP must be positive"),
    dealerLandingCost: z.number().nonnegative().optional(),
    landingCost: z.number().nonnegative().optional(),
    inStock: z.boolean().default(true),
    express60Min: z.boolean().optional(),
    isExpress60: z.boolean().optional(),
    isFeatured: z.boolean().default(false),
    pairedSkuIds: z.array(z.string()).optional(),
    gstPercent: z.number().optional(),
    hsnCode: z.string().optional(),
    deliveryVehicleType: z.enum(["2W_BIKE", "3W_ELECTRIC_LOADER", "4W_PICKUP", "HEAVY_TRUCK", "E_LOADER", "TRACTOR_DUMPER"]).optional(),
    imageUrl: z.string().default(""),
    description: z.string().optional(),
  })
  .transform((data) => {
    const category = data.category || data.categoryId || data.categorySlug || "civil";
    const dealerLandingCost = data.dealerLandingCost ?? data.landingCost ?? Math.round(data.sellingPrice * 0.9);
    const express60Min = data.express60Min ?? data.isExpress60 ?? true;
    let vehicle = data.deliveryVehicleType;
    if (vehicle === "E_LOADER") vehicle = "3W_ELECTRIC_LOADER";
    if (vehicle === "TRACTOR_DUMPER") vehicle = "HEAVY_TRUCK";
    return {
      ...data,
      category,
      dealerLandingCost,
      express60Min,
      deliveryVehicleType: vehicle,
    };
  })
  .refine((data) => !data.mrp || data.sellingPrice <= data.mrp, {
    message: "Selling price cannot exceed MRP",
    path: ["sellingPrice"],
  });

const BulkUpdateSchema = z.object({
  skuIds: z.array(z.string()).optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  adjustmentType: z.enum(["flat_add", "flat_sub", "percent_add", "percent_sub", "set_stock_in", "set_stock_out"]),
  value: z.number().optional(),
  dryRun: z.boolean().optional(),
});

const MandiPatchSchema = z
  .object({
    price: z.number().positive("Price must be positive").optional(),
    currentPrice: z.number().positive().optional(),
    cascadeToCatalog: z.boolean().optional(),
  })
  .refine((data) => data.price !== undefined || data.currentPrice !== undefined, {
    message: "Either price or currentPrice must be provided",
  })
  .transform((data) => ({
    price: (data.price ?? data.currentPrice) as number,
    cascadeToCatalog: !!data.cascadeToCatalog,
  }));

const RentalPatchSchema = z.object({
  rate: z.number().positive().optional(),
  available: z.boolean().optional(),
  specs: z.string().optional(),
  name: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────
// 1. Live Catalog Endpoints (Public & Admin)
// ─────────────────────────────────────────────────────────────
router.get("/catalog/live", (req: Request, res: Response) => {
  try {
    const { category, brand, gstPercent, vehicle, inStock, isFeatured, includeArchived, search, limit, offset } = req.query;

    const result = catalogEngine.getLiveCatalog({
      category: category ? String(category) : undefined,
      brand: brand ? String(brand) : undefined,
      gstPercent: gstPercent ? Number(gstPercent) : undefined,
      vehicle: vehicle ? String(vehicle) : undefined,
      inStock: inStock !== undefined ? inStock === "true" : undefined,
      isFeatured: isFeatured !== undefined ? isFeatured === "true" : undefined,
      includeArchived: includeArchived === "true",
      search: search ? String(search) : undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || "Failed to fetch live catalog" });
  }
});

router.get("/catalog/sku/:id", (req: Request, res: Response) => {
  const id = String(req.params.id);
  const sku = catalogEngine.getMergedSku(id);
  if (!sku) {
    res.status(404).json({ success: false, error: "SKU not found" });
    return;
  }
  res.json({ success: true, sku });
});

// ─────────────────────────────────────────────────────────────
// 2. Admin Tri-Mode Image Studio Endpoint
// ─────────────────────────────────────────────────────────────
router.post(
  "/admin/catalog/image",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const mode = (req.body.mode || (req.file ? "upload" : "url")) as "upload" | "url" | "auto-fetch";
      const categorySlug = req.body.categorySlug || req.body.category || "general";
      const skuSlug = req.body.skuSlug || req.body.skuId || req.body.name || `product-${Date.now().toString(36).slice(-4)}`;

      // Mode 1: Multipart File Upload (Drag & Drop or File Picker)
      if (mode === "upload" || req.file) {
        if (!req.file) {
          res.status(400).json({ success: false, error: "No image file uploaded" });
          return;
        }

        const result = await imageStudioService.processAndSaveImage(
          req.file.buffer,
          categorySlug,
          skuSlug
        );

        res.json({
          success: true,
          mode: "upload",
          ...result,
          message: "Image processed to 800x800 WebP and saved directly to conon public directory",
        });
        return;
      }

      // Mode 2: Remote HTTPS Image URL
      if (mode === "url") {
        const imageUrl = req.body.imageUrl || req.body.url;
        if (!imageUrl) {
          res.status(400).json({ success: false, error: "imageUrl is required for Mode 2" });
          return;
        }

        const result = await imageStudioService.processFromUrl(
          imageUrl,
          categorySlug,
          skuSlug
        );

        res.json({
          success: true,
          mode: "url",
          ...result,
          message: "Remote image downloaded, processed to 800x800 WebP and saved",
        });
        return;
      }

      // Mode 3: Magic Auto-Fetch candidate packshots
      if (mode === "auto-fetch" || mode === "autofetch") {
        const { brand, productName, oemModelCode } = req.body;
        if (!brand && !productName) {
          res.status(400).json({ success: false, error: "brand or productName required for auto-fetch" });
          return;
        }

        const candidatesResult = await imageStudioService.fetchCandidatePackshots(
          brand || "",
          productName || "",
          oemModelCode,
          categorySlug
        );

        res.json({
          success: true,
          mode: "auto-fetch",
          ...candidatesResult,
        });
        return;
      }

      res.status(400).json({ success: false, error: `Unsupported mode: ${mode}` });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || "Image studio processing failed" });
    }
  }
);

// ─────────────────────────────────────────────────────────────
// 3. Admin SKU Mutations
// ─────────────────────────────────────────────────────────────
router.patch("/admin/catalog/sku/:id", (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const validated = SkuPatchSchema.parse(req.body);

    const updated = catalogEngine.updateSku(id, validated as any);
    if (!updated) {
      res.status(404).json({ success: false, error: "SKU not found" });
      return;
    }

    res.json({
      success: true,
      message: `Updated SKU ${id}`,
      sku: updated,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message || "Invalid update payload" });
  }
});

router.post("/admin/catalog/sku", (req: Request, res: Response) => {
  try {
    const validated = SkuCreateSchema.parse(req.body);
    const defaults = CATEGORY_DEFAULTS[validated.category] || {
      hsnCode: "8467",
      gstPercent: 18,
      vehicle: "2W_BIKE",
    };

    const finalPayload = {
      ...validated,
      hsnCode: validated.hsnCode || defaults.hsnCode,
      gstPercent: validated.gstPercent !== undefined ? validated.gstPercent : defaults.gstPercent,
      deliveryVehicleType: validated.deliveryVehicleType || defaults.vehicle,
    };

    const created = catalogEngine.createSku(finalPayload as any);

    res.status(201).json({
      success: true,
      message: `Created SKU ${created.id}`,
      sku: created,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message || "Invalid SKU creation payload" });
  }
});

router.post("/admin/catalog/sku/:id/duplicate", (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const cloned = catalogEngine.duplicateSku(id);
    if (!cloned) {
      res.status(404).json({ success: false, error: "Original SKU not found" });
      return;
    }

    res.status(201).json({
      success: true,
      message: `Cloned SKU as ${cloned.id}`,
      sku: cloned,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || "Failed to clone SKU" });
  }
});

router.post("/admin/catalog/sku/:id/archive", (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const archived = req.body.archived !== false;
    const updated = catalogEngine.archiveSku(id, archived);
    if (!updated) {
      res.status(404).json({ success: false, error: "SKU not found" });
      return;
    }

    res.json({
      success: true,
      message: `${updated.name} ${archived ? "archived" : "unarchived"}`,
      sku: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || "Failed to archive SKU" });
  }
});

router.post("/admin/catalog/bulk-update", (req: Request, res: Response) => {
  try {
    const validated = BulkUpdateSchema.parse(req.body);
    const result = catalogEngine.bulkUpdate(validated);

    res.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message || "Invalid bulk update payload" });
  }
});

// ─────────────────────────────────────────────────────────────
// 3. Mandi Bhav Controller Endpoints
// ─────────────────────────────────────────────────────────────
router.get("/admin/mandi", (_req: Request, res: Response) => {
  res.json(catalogEngine.getMandiRates());
});

// Public ticker compatibility endpoint
router.get("/mandi/prices", (_req: Request, res: Response) => {
  res.json(catalogEngine.getMandiRates());
});

router.patch("/admin/mandi/:id", (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { price, cascadeToCatalog } = MandiPatchSchema.parse(req.body);

    const { item, cascadeCount } = catalogEngine.updateMandiRate(id, price, cascadeToCatalog);
    if (!item) {
      res.status(404).json({ success: false, error: "Mandi commodity not found" });
      return;
    }

    res.json({
      success: true,
      item,
      cascadeCount,
      message: `Updated ${item.material} to ₹${price}${cascadeCount > 0 ? ` (Cascaded to ${cascadeCount} catalog SKUs)` : ""}`,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message || "Invalid Mandi rate payload" });
  }
});

// ─────────────────────────────────────────────────────────────
// 4. Equipment Rentals Endpoints
// ─────────────────────────────────────────────────────────────
router.get("/admin/rentals", (_req: Request, res: Response) => {
  res.json(catalogEngine.getEquipmentRentals());
});

router.get("/rentals/items", (_req: Request, res: Response) => {
  res.json(catalogEngine.getEquipmentRentals());
});

router.patch("/admin/rentals/:id", (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const validated = RentalPatchSchema.parse(req.body);

    const updated = catalogEngine.updateEquipmentRental(id, validated);
    if (!updated) {
      res.status(404).json({ success: false, error: "Equipment not found" });
      return;
    }

    res.json({
      success: true,
      item: updated,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message || "Invalid rental payload" });
  }
});

router.post("/admin/rentals", (req: Request, res: Response) => {
  try {
    const { name, category, rate, unit, available, specs, imageUrl } = req.body;
    if (!name || !rate) {
      res.status(400).json({ success: false, error: "Name and rate are required" });
      return;
    }

    const created = catalogEngine.createEquipmentRental({
      name,
      category: category || "General Construction",
      rate: Number(rate),
      unit: unit || "day",
      available: available !== false,
      specs: specs || "Operator and fuel as per project contract",
      imageUrl: imageUrl || "/assets/excavator-pc210.jpg",
    });

    res.status(201).json({
      success: true,
      item: created,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message || "Failed to create equipment" });
  }
});

// ─────────────────────────────────────────────────────────────
// 5. SSE Real-Time Sync Stream
// ─────────────────────────────────────────────────────────────
router.get("/events/catalog", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  catalogEngine.addSSEClient(res);

  // Send initial connection handshake
  res.write(`event: connected\ndata: ${JSON.stringify({ message: "Catalog SSE live stream connected", timestamp: new Date().toISOString() })}\n\n`);
});

export default router;
