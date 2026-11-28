import fs from "fs";
import path from "path";
import multer from "multer";
import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import { canTransitionOrderStatus, type CanonicalOrderStatus } from "@workspace/shared";
import { requireAdmin } from "../middleware/adminAuth";
import { UPLOADS_DIR } from "../lib/paths";
import { catalogSyncService } from "../services/catalogSyncService";

const router: IRouter = Router();
const uploadMem = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const SkuUpsertSchema = z.object({
  skuCode: z.string().min(2),
  categorySlug: z.string().optional(),
  subCategorySlug: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  title: z.string().optional(),
  unit: z.string().optional(),
  specs: z.record(z.string(), z.any()).optional(),
  variants: z.array(z.record(z.string(), z.any())).optional(),
  compatibleAccessorySkus: z.array(z.string()).optional(),
  badges: z.array(z.string()).optional(),
  isDcrSubsidyEligible: z.boolean().optional(),
  isRentable: z.boolean().optional(),
  isActive: z.boolean().optional(),
  hubCode: z.string().optional(),
  sellingPrice: z.number().nonnegative().optional(),
  mrp: z.number().nonnegative().optional(),
  contractorPackPrice: z.number().nonnegative().nullable().optional(),
  rentPricePerDay: z.number().nonnegative().nullable().optional(),
  stockQty: z.number().int().nonnegative().optional(),
  isInStock: z.boolean().optional(),
});

const PlaceOrderSchema = z.object({
  customerPhone: z.string().min(6),
  hubCode: z.string().optional(),
  orderType: z.enum(["buy", "rent", "kit", "bulk"]).optional(),
  paymentMode: z.string().optional(),
  deliveryAddress: z.string().optional(),
  pincode: z.string().optional(),
  items: z
    .array(
      z.object({
        skuCode: z.string().min(2),
        titleSnapshot: z.string().optional(),
        qty: z.number().int().positive(),
        unitPrice: z.number().nonnegative().optional(),
        variantJson: z.record(z.string(), z.any()).optional(),
      })
    )
    .min(1),
});

const LeadCreateSchema = z.object({
  leadRefId: z.string().optional(),
  leadType: z.enum(["SOLAR_MVVNL", "PARCHA_BOQ", "TURNKEY_SERVICE"]),
  customerName: z.string().min(1),
  phone: z.string().min(6),
  locality: z.string().min(1),
  payload: z.record(z.string(), z.any()).optional(),
});

function getActor(req: Request, fallbackId = "admin@conon.in", fallbackRole = "SUPER_ADMIN") {
  const adminSession = (req as any).adminSession || (req as any).user;
  return {
    id: adminSession?.email || adminSession?.sub || fallbackId,
    role: adminSession?.rbacRole || adminSession?.role || fallbackRole,
  };
}

/**
 * Bridge Read: Merges MongoDB MasterProduct specs + PostgreSQL hub_inventory via skuCode
 * Route: GET /api/catalog
 */
router.get("/catalog", async (req: Request, res: Response) => {
  try {
    const category = typeof req.query.category === "string" ? req.query.category : undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const hubCode = typeof req.query.hubCode === "string" ? req.query.hubCode : undefined;
    const catalog = await catalogSyncService.getMergedCatalog({ category, search, hubCode });
    res.json({ success: true, ...catalog });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || "Failed to load hybrid catalog" });
  }
});

/**
 * Bridge Write: Admin upserts SKU metadata (MongoDB) + hub_inventory price/stock (PostgreSQL)
 */
router.post("/admin/hybrid/sku", requireAdmin, async (req: Request, res: Response) => {
  try {
    const parsed = SkuUpsertSchema.parse(req.body);
    const result = await catalogSyncService.upsertSkuAndInventory(parsed, getActor(req));
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message || "Invalid SKU payload" });
  }
});

router.put("/admin/hybrid/sku/:skuCode", requireAdmin, async (req: Request, res: Response) => {
  try {
    const parsed = SkuUpsertSchema.parse({
      ...req.body,
      skuCode: String(req.params.skuCode),
    });
    const result = await catalogSyncService.upsertSkuAndInventory(parsed, getActor(req));
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message || "Invalid SKU payload" });
  }
});

/**
 * Transactional Checkout & Order Progression (`PLACED -> VENDOR_ACCEPTED -> PACKED_READY -> DRIVER_ASSIGNED -> PICKED_UP -> IN_TRANSIT -> DELIVERED`)
 */
router.get("/hybrid/orders", async (_req: Request, res: Response) => {
  const snap = await catalogSyncService.getHybridSnapshot();
  res.json({ success: true, orders: snap.orders, hubs: snap.hubs, payoutLedger: snap.payoutLedger });
});

router.post("/hybrid/orders", async (req: Request, res: Response) => {
  try {
    const parsed = PlaceOrderSchema.parse(req.body);
    const order = await catalogSyncService.placeTransactionalOrder(parsed);
    res.status(201).json({ success: true, order });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message || "Order placement failed" });
  }
});

router.patch("/hybrid/orders/:id/status", async (req: Request, res: Response) => {
  try {
    const orderId = String(req.params.id);
    const nextStatus = String(req.body?.status || "").toUpperCase() as CanonicalOrderStatus;
    const snap = await catalogSyncService.getHybridSnapshot();
    const order = snap.orders.find((o) => o.orderNumber === orderId || String(o.id) === orderId);
    if (!order) {
      res.status(404).json({ success: false, error: "Order not found" });
      return;
    }
    if (!canTransitionOrderStatus(order.status as CanonicalOrderStatus, nextStatus)) {
      res.status(400).json({
        success: false,
        error: `Invalid order state transition ${order.status} -> ${nextStatus}`,
      });
      return;
    }
    if (nextStatus === "DELIVERED") {
      const otp = String(req.body?.deliveryOtp ?? req.body?.otp ?? "");
      const settlement = await catalogSyncService.deliverOrderAndSettle(orderId, otp, {
        id: typeof req.body?.driverPhone === "string" ? req.body.driverPhone : "driver@conon.in",
        role: "DRIVER",
      });
      res.json({ success: true, ...settlement });
      return;
    }
    order.status = nextStatus;
    if (req.body?.driverPhone) order.driverPhone = String(req.body.driverPhone);
    if (req.body?.hubCode) order.hubCode = String(req.body.hubCode);
    await catalogSyncService.logAudit({
      actorId: String(req.body?.actorId || "ops@conon.in"),
      actorRole: String(req.body?.actorRole || "PARTNER"),
      action: `ORDER_STATUS_${nextStatus}`,
      entityType: "orders",
      entityId: order.orderNumber,
      diff: { status: nextStatus, hubCode: order.hubCode, driverPhone: order.driverPhone },
    });
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message || "Status transition failed" });
  }
});

async function handleDeliverOrder(req: Request, res: Response) {
  try {
    const orderId = String(req.params.id);
    const otp = String(req.body?.deliveryOtp ?? req.body?.delivery_otp ?? req.body?.otp ?? "");
    const settlement = await catalogSyncService.deliverOrderAndSettle(orderId, otp, {
      id: typeof req.body?.driverPhone === "string" ? req.body.driverPhone : "driver@conon.in",
      role: "DRIVER",
    });
    res.json({ success: true, ...settlement });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message || "Delivery settlement failed" });
  }
}

router.patch("/orders/:id/deliver", handleDeliverOrder);
router.patch("/hybrid/orders/:id/deliver", handleDeliverOrder);

/**
 * MongoDB LeadInbox endpoints (Unified `/api/leads` + `/api/hybrid/leads`)
 */
async function handleListLeads(req: Request, res: Response) {
  try {
    const leadType = typeof req.query.leadType === "string" ? (req.query.leadType as any) : undefined;
    const leads = await catalogSyncService.listLeads(leadType);
    res.json({ success: true, leads, total: leads.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || "Failed to list leads" });
  }
}

async function handleCreateLead(req: Request, res: Response) {
  try {
    const parsed = LeadCreateSchema.parse(req.body);
    const lead = await catalogSyncService.recordLead(parsed);
    res.status(201).json({ success: true, lead });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message || "Invalid lead payload" });
  }
}

router.get("/leads", handleListLeads);
router.post("/leads", handleCreateLead);
router.get("/hybrid/leads", handleListLeads);
router.post("/hybrid/leads", handleCreateLead);

/**
 * Parcha/BOQ Photo & Driver Delivery Proof Upload endpoint (Multipart OR Base64 JSON)
 */
async function handleMediaUpload(req: Request, res: Response, folder: "parcha" | "delivery-proof") {
  try {
    const destDir = path.resolve(UPLOADS_DIR, folder);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    let buf: Buffer | null = null;
    let ext = "jpg";

    if (req.file?.buffer) {
      buf = req.file.buffer;
      const mExt = path.extname(req.file.originalname || "").replace(".", "").toLowerCase();
      if (mExt && /^(jpg|jpeg|png|webp|pdf)$/.test(mExt)) ext = mExt;
    } else if (typeof req.body?.base64 === "string" && req.body.base64.trim()) {
      const raw = req.body.base64.trim();
      const match = raw.match(/^data:([^;]+);base64,(.+)$/);
      const b64 = match ? match[2] : raw;
      if (match && match[1].includes("png")) ext = "png";
      else if (match && match[1].includes("pdf")) ext = "pdf";
      else if (match && match[1].includes("webp")) ext = "webp";
      buf = Buffer.from(b64, "base64");
    }

    if (!buf || buf.length === 0) {
      res.status(400).json({ success: false, error: "No file or base64 payload provided" });
      return;
    }

    const fileName = `${folder}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}.${ext}`;
    fs.writeFileSync(path.join(destDir, fileName), buf);
    const url = `/api/uploads/${folder}/${fileName}`;
    res.status(201).json({ success: true, url, fileName });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || "Upload failed" });
  }
}

router.post("/uploads/parcha", uploadMem.single("file"), (req, res) =>
  handleMediaUpload(req, res, "parcha")
);
router.post("/uploads/delivery-proof", uploadMem.single("file"), (req, res) =>
  handleMediaUpload(req, res, "delivery-proof")
);

/**
 * Command OS (Admin) Inspection & Seeding endpoints
 */
router.get("/admin/hybrid/audit-logs", requireAdmin, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(200, Math.max(10, Number(req.query.limit || 60)));
    const logs = await catalogSyncService.listAuditLogs(limit);
    res.json({ success: true, logs, total: logs.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || "Failed to fetch hybrid audit logs" });
  }
});

router.get("/admin/hybrid/snapshot", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const snapshot = await catalogSyncService.getHybridSnapshot();
    const health = await catalogSyncService.getHybridDbHealth();
    res.json({ success: true, health, ...snapshot });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || "Failed to fetch hybrid snapshot" });
  }
});

router.post("/admin/hybrid/seed", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const summary = await catalogSyncService.seedAll();
    const health = await catalogSyncService.getHybridDbHealth();
    res.json({ success: true, health, ...summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || "Seed failed" });
  }
});

export default router;
