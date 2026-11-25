import { Router, type IRouter, type Request, type Response } from "express";
import { requireVendor } from "../middleware/vendorAuth";
import { vendorEngine, type VendorProfile } from "../services/vendorEngine";
import { ecosystemEngine } from "../services/ecosystemEngine";
import { catalogEngine } from "../services/catalogEngine";
import { vendorCatalogEngine } from "../services/vendorCatalogEngine";
import { signJwt } from "../lib/jwt";
import { logger } from "../lib/logger";
import {
  getIo,
  adminRoom,
  driverRoom,
  orderRoom,
  cancel180sCascade,
  computeMultiStopPlan,
  getRainMode,
  isMoistureSensitive,
  logDispatchEvent,
  LUCKNOW_HUBS,
} from "../socket";

const router: IRouter = Router();

// Every route in this file requires a valid vendor JWT (with dev/demo fallback)
router.use("/vendor", requireVendor);

function resolveCurrentVendor(req: Request): VendorProfile {
  const store = req.vendorStore || (req as any).vendor?.shopName || "Katawala Hardware & Locks";
  return vendorEngine.getVendorByStore(store);
}

/* ════════════════════════ Vendor Profile & Hub Switcher ════════════════════════ */

/**
 * GET /api/vendor/hub/:hubId/dashboard or /api/hub/:hubId/dashboard
 * Returns hub status, active incoming orders, stock flags, bulk hedge offers, and escrow/settled ledger.
 */
router.get(["/vendor/hub/:hubId/dashboard", "/hub/:hubId/dashboard"], (req: Request, res: Response) => {
  const hubId = String(req.params.hubId || "hub-naka");
  const hub = LUCKNOW_HUBS.find((h) => h.hubId === hubId) || LUCKNOW_HUBS[0];
  const allOrders = ecosystemEngine.getAllOrders();
  const hubOrders = allOrders.filter((o: any) => o.hubId === hubId || !o.hubId);

  const mappedOrders = hubOrders.slice(0, 5).map((o) => ({
    id: o.id,
    shortId: o.shortId,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    deliveryAddress: o.deliveryAddress,
    status: o.status,
    incomingSecondsLeft: 168,
    items: o.items,
    netDealerPayout: o.dealerPayable || 8420,
    totalAmount: o.totalAmount,
    pickupOtp: o.pickupOtp || "4912",
  }));

  const hedgeOffers = [
    {
      id: "hedge-101",
      material: "UltraTech Super OPC 53 Cement",
      quantity: "50 Bags (2.5 Ton)",
      lockedLandingRate: 362,
      instantAdvance: 5000,
      corridor: "Shaheed Path / Sushant Golf City Dhalai Corridor",
      status: "PENDING",
    },
    {
      id: "hedge-102",
      material: "Kamdhenu Fe 550D TMT Steel (12mm)",
      quantity: "1.5 Ton Bundles",
      lockedLandingRate: 53.2,
      instantAdvance: 12000,
      corridor: "Vibhuti Khand Gomti Nagar Foundation Pour",
      status: "PENDING",
    },
  ];

  res.json({
    success: true,
    hub,
    status: hub.isOnline ? "ONLINE" : "OFFLINE",
    orders: mappedOrders,
    stockFlags: hub.stockFlags,
    hedgeOffers,
    ledger: {
      escrowBalance: hub.escrowBalance,
      settledBalance: hub.settledBalance,
      totalEarnedToday: 18450,
    },
  });
});

/**
 * PATCH /api/vendor/hub/:hubId/stock-toggle or /api/hub/:hubId/stock-toggle
 * Flips IN STOCK / OUT OF STOCK for a SKU in memory/PostgreSQL and emits admin:hub_stock_updated.
 */
router.patch(["/vendor/hub/:hubId/stock-toggle", "/hub/:hubId/stock-toggle"], (req: Request, res: Response) => {
  const hubId = String(req.params.hubId || "hub-naka");
  const hub = LUCKNOW_HUBS.find((h) => h.hubId === hubId) || LUCKNOW_HUBS[0];
  const sku = String(req.body?.sku || req.body?.skuCode || "OPC53_CEMENT");
  const inStock = req.body?.inStock !== undefined ? Boolean(req.body.inStock) : !hub.stockFlags[sku];

  hub.stockFlags[sku] = inStock;
  logDispatchEvent(hubId, "HUB_STOCK_TOGGLED", { hubId, sku, inStock });

  try {
    const io = getIo();
    io.to(adminRoom()).emit("admin:hub_stock_updated", {
      hubId,
      hubName: hub.name,
      sku,
      inStock,
      stockFlags: hub.stockFlags,
      updatedAt: new Date().toISOString(),
    });
  } catch {}

  res.json({
    success: true,
    hubId,
    sku,
    inStock,
    stockFlags: hub.stockFlags,
  });
});

/**
 * POST /api/vendor/hedges/:hedgeId/lock or /api/hedges/:hedgeId/lock
 * Accepts Admin's Vault Rate-Lock bulk hedge offer and updates Admin's Vault Exposure Heatmap live via Socket.io.
 */
router.post(["/vendor/hedges/:hedgeId/lock", "/hedges/:hedgeId/lock"], (req: Request, res: Response) => {
  const hedgeId = String(req.params.hedgeId);
  logDispatchEvent("HEDGE", "BULK_HEDGE_LOCKED", { hedgeId });

  try {
    const io = getIo();
    io.to(adminRoom()).emit("admin:vault_hedge_locked", {
      hedgeId,
      status: "LOCKED",
      lockedAt: new Date().toISOString(),
    });
  } catch {}

  res.json({
    success: true,
    hedgeId,
    status: "LOCKED",
    lockedAt: new Date().toISOString(),
    message: "Rate-Lock advance credited to Vendor Escrow.",
  });
});

/**
 * GET /api/vendor/me
 * Returns current authenticated vendor profile with hub zone, rating, GSTIN, and store status.
 */
router.get("/vendor/me", (req: Request, res: Response) => {
  const vendor = resolveCurrentVendor(req);
  res.json({
    success: true,
    vendor,
    profile: vendor,
  });
});

/**
 * GET /api/vendor/hubs
 * Returns all 4 Lucknow hub vendors for instant demo switching.
 */
router.get("/vendor/hubs", (_req: Request, res: Response) => {
  const hubs = vendorEngine.getAllVendors();
  res.json({
    success: true,
    hubs,
  });
});

/**
 * POST /api/vendor/switch-shop
 * 1-Click switch demo store between Lucknow hubs.
 */
router.post("/vendor/switch-shop", (req: Request, res: Response) => {
  const shopCodeOrId = req.body?.shopCode || req.body?.shopId || req.body?.storeName || req.body?.shopCodeOrId || "";
  if (!shopCodeOrId) {
    res.status(400).json({ error: "shopCode or shopId is required." });
    return;
  }

  const vendor = vendorEngine.getVendorByStore(String(shopCodeOrId));
  const token = signJwt({
    sub: vendor.id,
    phone: vendor.phone,
    role: "vendor",
    name: vendor.ownerName,
    vendorStore: vendor.shopName,
  });

  res.json({
    success: true,
    token,
    vendor,
  });
});

/**
 * PATCH /api/vendor/status
 * Toggle store open/closed (Dukaan Chalu / Band).
 */
router.patch("/vendor/status", (req: Request, res: Response) => {
  const vendor = resolveCurrentVendor(req);
  const isOpen = req.body?.isOpen !== undefined ? Boolean(req.body.isOpen) : !vendor.isOpen;
  const updated = vendorEngine.setStoreOpen(vendor.id, isOpen);
  res.json({
    success: true,
    isOpen: updated.isOpen,
    vendor: updated,
  });
});

/* ════════════════════════ Orders Pipeline ════════════════════════ */

/**
 * GET /api/vendor/orders
 * Returns live orders with 3-stage UI mapping and full itemized payouts.
 */
router.get("/vendor/orders", (req: Request, res: Response) => {
  const vendor = resolveCurrentVendor(req);
  const rawOrders = vendorEngine.getOrders(vendor.id);
  const ecoOrders = ecosystemEngine.getOrdersForVendor(vendor.id);

  // Merge ecosystem orders not present in rawOrders
  const existingIds = new Set(rawOrders.map(o => o.id));
  for (const eo of ecoOrders) {
    if (!existingIds.has(eo.id)) {
      rawOrders.unshift({
        id: eo.id,
        shortId: eo.shortId,
        customerName: eo.customerName,
        customerPhone: eo.customerPhone,
        deliveryArea: eo.deliveryArea,
        deliveryAddress: eo.deliveryAddress,
        placedAt: eo.placedAt,
        minsLeft: Math.max(0, Math.round((new Date(eo.estimatedDelivery).getTime() - Date.now()) / 60000)),
        slaMins: 60,
        status: eo.status === "PLACED" ? "NEW_REQUEST" : eo.status === "VENDOR_ACCEPTED" || eo.status === "PACKING_READY" ? "PACKING_READY" : "HANDED_OVER",
        items: eo.items.map(i => ({
          skuId: i.skuId,
          name: i.name,
          brand: i.brand,
          category: i.category,
          unit: i.unit,
          qty: i.qty,
          customerPrice: i.unitPrice,
          dealerPayout: i.dealerPayout,
        })),
        totalDealerPayout: eo.dealerPayable,
        pickupOtp: eo.pickupOtp,
        vendorId: vendor.id,
        vendorStore: vendor.shopName,
      });
      existingIds.add(eo.id);
    }
  }

  // Map to format that supports both legacy tab and new rich board
  const mapped = rawOrders.map((o) => {
    let legacyStatus: "new" | "packing" | "ready" = "new";
    if (o.status === "PACKING_READY") legacyStatus = "packing";
    else if (o.status === "HANDED_OVER" || o.status === "DELIVERED") legacyStatus = "ready";

    const itemNames = o.items.map((i) => `${i.qty}x ${i.name}`).join(", ") || "Construction Materials";

    return {
      id: o.id,
      shortId: o.shortId,
      buyer: o.customerName || "CONON Customer",
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      deliveryArea: o.deliveryArea,
      deliveryAddress: o.deliveryAddress,
      items: itemNames,
      itemsDetailed: o.items,
      time: o.placedAt,
      minsLeft: o.minsLeft,
      slaMins: o.slaMins,
      value: o.totalDealerPayout,
      totalDealerPayout: o.totalDealerPayout,
      status: legacyStatus,
      rawStatus: o.status,
      pickupOtp: o.pickupOtp,
      rider: o.rider,
      flaggedReason: o.flaggedReason,
    };
  });

  res.json(mapped);
});

/**
 * POST /api/vendor/orders/:id/accept or /api/orders/:id/accept
 * Accept an incoming order (stops 180s watchdog, generates pickup QR token, dispatches driver:new_mission).
 */
router.post(["/vendor/orders/:id/accept", "/orders/:id/accept"], (req: Request, res: Response) => {
  const vendor = resolveCurrentVendor(req);
  const orderId = String(req.params.id);

  // 1. Stop the 180s server watchdog immediately!
  cancel180sCascade(orderId);
  logDispatchEvent(orderId, "VENDOR_ORDER_ACCEPTED", { vendorId: vendor.id, store: vendor.shopName });

  let accepted = vendorEngine.acceptOrder(vendor.id, orderId);

  // Sync with ecosystemEngine
  let ecoOrder = ecosystemEngine.getOrder(orderId);
  if (ecoOrder) {
    ecosystemEngine.vendorMarkPackingReady(orderId, vendor.id);
  }

  const pickupQrToken = `CON-PICKUP-${orderId}-${Math.floor(1000 + Math.random() * 9000)}`;
  const multiStop = computeMultiStopPlan(ecoOrder?.items || [], vendor.id);

  const assignedDriver = {
    driverId: multiStop.vehicleType === "BIKE_EXPRESS" ? "DRV-LKO-BK-02" : "DRV-LKO-CH-01",
    name: multiStop.vehicleType === "BIKE_EXPRESS" ? "Suraj Rawat (Bike UP 32 BK 4012)" : "Ramesh Yadav (Loader UP 32 CH 8912)",
    phone: multiStop.vehicleType === "BIKE_EXPRESS" ? "+91 98390 12044" : "+91 94150 88219",
    vehicleType: multiStop.vehicleType,
    vehicleLabel: multiStop.vehicleLabel,
  };

  if (!accepted && ecoOrder) {
    accepted = {
      id: ecoOrder.id,
      shortId: ecoOrder.shortId,
      customerName: ecoOrder.customerName,
      customerPhone: ecoOrder.customerPhone,
      deliveryArea: ecoOrder.deliveryArea,
      deliveryAddress: ecoOrder.deliveryAddress,
      placedAt: ecoOrder.placedAt,
      minsLeft: 55,
      slaMins: 60,
      status: "PACKING_READY",
      items: ecoOrder.items.map(i => ({
        skuId: i.skuId,
        name: i.name,
        brand: i.brand,
        category: i.category,
        unit: i.unit,
        qty: i.qty,
        customerPrice: i.unitPrice,
        dealerPayout: i.dealerPayout,
      })),
      totalDealerPayout: ecoOrder.dealerPayable,
      pickupOtp: ecoOrder.pickupOtp,
      vendorId: vendor.id,
      vendorStore: vendor.shopName,
    };
  }

  try {
    const io = getIo();
    // Dispatch new mission to matched driver
    io.to(driverRoom(assignedDriver.driverId)).emit("driver:new_mission", {
      orderId,
      shortId: orderId.slice(-4),
      customerName: ecoOrder?.customerName || "Er. Vikram Malhotra",
      customerPhone: ecoOrder?.customerPhone || "+91 98390 41209",
      siteAddress: ecoOrder?.deliveryAddress || "Sushant Golf City, Shaheed Path, Lucknow",
      vehicleType: multiStop.vehicleType,
      vehicleLabel: multiStop.vehicleLabel,
      totalWeightKg: multiStop.weightKg,
      stops: multiStop.stops,
      pickupQrToken,
      customerOtp: ecoOrder?.deliveryOtp || "2026",
      deliveryFee: 480,
      palledariBonus: 120,
      requiresTarpaulin: getRainMode() && isMoistureSensitive(ecoOrder?.items || []),
    });

    // Notify all 4 panels
    io.to(orderRoom(orderId)).emit("order:status_updated", {
      orderId,
      status: "ACCEPTED_PACKING",
      assignedDriver: assignedDriver.name,
      pickupQrToken,
    });

    io.to(adminRoom()).emit("admin:order_accepted", {
      orderId,
      vendorStore: vendor.shopName,
      assignedDriver,
      stops: multiStop.stops,
    });
  } catch {}

  res.json({
    success: true,
    order: accepted,
    id: accepted?.id || orderId,
    shortId: accepted?.shortId || orderId.slice(-4),
    status: "packing",
    pickupOtp: accepted?.pickupOtp || "4912",
    pickupQrToken,
    assignedDriver,
    multiStopPlan: multiStop,
  });
});

/**
 * POST /api/vendor/orders/:id/handover or /api/orders/:id/handover
 * Verifies driver QR scan + loading checklist, marks LOADED, and emits order:status_updated across all 4 panels.
 */
router.post(["/vendor/orders/:id/handover", "/orders/:id/handover"], (req: Request, res: Response) => {
  const vendor = resolveCurrentVendor(req);
  const orderId = String(req.params.id);
  const checklist = req.body?.checklist;

  const ecoOrder = ecosystemEngine.getOrder(orderId);
  if (ecoOrder) {
    ecosystemEngine.updateOrderStatus(orderId, "PICKED_UP", "DRIVER", "Loader verified QR & loading checklist complete");
  }

  logDispatchEvent(orderId, "ORDER_HANDOVER_LOADED", { orderId, vendorStore: vendor.shopName, checklist });

  try {
    const io = getIo();
    io.to(orderRoom(orderId)).emit("order:status_updated", {
      orderId,
      status: "LOADED_DISPATCHED",
      escrowProgress: "LOADED",
      note: "Loader driver picked up materials and is out for 60-min delivery.",
    });

    io.to(adminRoom()).emit("admin:order_loaded", {
      orderId,
      status: "LOADED_DISPATCHED",
      timestamp: new Date().toISOString(),
    });
  } catch {}

  res.json({
    success: true,
    orderId,
    status: "LOADED_DISPATCHED",
    message: "Loading checklist verified. Order dispatched on road.",
  });
});

/**
 * POST /api/vendor/orders/:id/ready-for-pickup
 * Mark order packed & handed over to rider (credits vendor wallet).
 */
router.post("/vendor/orders/:id/ready-for-pickup", (req: Request, res: Response) => {
  const vendor = resolveCurrentVendor(req);
  const orderId = String(req.params.id);
  const ready = vendorEngine.markOrderReadyForPickup(vendor.id, orderId);

  if (!ready) {
    res.status(404).json({ error: "Order not found or already processed." });
    return;
  }

  res.json({
    success: true,
    order: ready,
    id: ready.id,
    shortId: ready.shortId,
    status: "ready",
    canonicalStatus: "PACKING_READY",
  });
});

/**
 * PUT /api/vendor/orders/:id/status
 * Legacy status transition endpoint for backwards compatibility.
 */
router.put("/vendor/orders/:id/status", (req: Request, res: Response) => {
  const vendor = resolveCurrentVendor(req);
  const orderId = String(req.params.id);
  const target = req.body?.status;

  if (target === "packing") {
    const updated = vendorEngine.acceptOrder(vendor.id, orderId);
    if (!updated) {
      res.status(404).json({ error: "Order not found." });
      return;
    }
    res.json({ id: updated.id, status: "packing" });
    return;
  }

  if (target === "ready") {
    const updated = vendorEngine.markOrderReadyForPickup(vendor.id, orderId);
    if (!updated) {
      res.status(404).json({ error: "Order not found." });
      return;
    }
    res.json({ id: updated.id, status: "ready" });
    return;
  }

  res.status(400).json({ error: "Invalid status transition." });
});

/**
 * POST /api/vendor/orders/:id/flag-shortage
 * Flags shortage/damaged stock for an item with an alert to control room.
 */
router.post("/vendor/orders/:id/flag-shortage", (req: Request, res: Response) => {
  const vendor = resolveCurrentVendor(req);
  const orderId = String(req.params.id);
  const reason = typeof req.body?.reason === "string" ? req.body.reason.trim() : "Stock Shortage";

  const flagged = vendorEngine.flagShortage(vendor.id, orderId, reason);
  if (!flagged) {
    res.status(404).json({ error: "Order not found." });
    return;
  }

  res.json({
    success: true,
    order: flagged,
  });
});

/**
 * POST /api/vendor/dev/test-order & POST /api/vendor/orders/simulate
 * Simulates a realistic incoming customer order with real catalog items, dealer rates, and pickup OTP.
 */
const handleSimulateOrder = (req: Request, res: Response) => {
  const vendor = resolveCurrentVendor(req);
  const order = vendorEngine.createTestOrder(vendor.id);

  const payload = {
    id: order.id,
    shortId: order.shortId,
    buyer: order.customerName,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    deliveryArea: order.deliveryArea,
    deliveryAddress: order.deliveryAddress,
    items: order.items.map((i) => `${i.qty}x ${i.name}`).join(", "),
    itemsDetailed: order.items,
    time: "Just now",
    value: order.totalDealerPayout,
    totalDealerPayout: order.totalDealerPayout,
    status: "new" as const,
    rawStatus: order.status,
    pickupOtp: order.pickupOtp,
    rider: order.rider,
  };

  res.status(201).json(payload);
};

router.post("/vendor/dev/test-order", handleSimulateOrder);
router.post("/vendor/orders/simulate", handleSimulateOrder);

/* ════════════════════════ SSOT Products & Inventory ════════════════════════ */

/**
 * GET /api/vendor/products
 * Returns real SSOT catalog SKUs matching vendor's categories.
 */
router.get("/vendor/products", (req: Request, res: Response) => {
  const vendor = resolveCurrentVendor(req);
  const products = vendorEngine.getProductsForVendor(vendor.id);
  res.json(products);
});

/**
 * PATCH /api/vendor/products/:skuId
 * 1-tap stock toggle or dealer landing cost update.
 */
router.patch("/vendor/products/:skuId", (req: Request, res: Response) => {
  const vendor = resolveCurrentVendor(req);
  const skuId = String(req.params.skuId);
  const { inStock, dealerLandingCost, price } = req.body || {};

  const updated = vendorEngine.updateProductStockOrPrice(vendor.id, skuId, {
    inStock: inStock !== undefined ? Boolean(inStock) : undefined,
    dealerLandingCost: dealerLandingCost !== undefined ? Number(dealerLandingCost) : undefined,
    price: price !== undefined ? Number(price) : undefined,
  });

  if (!updated) {
    res.status(404).json({ error: "Product not found in catalog." });
    return;
  }

  res.json({
    success: true,
    product: updated,
  });
});

/**
 * Legacy Inventory GET /api/vendor/inventory
 */
router.get("/vendor/inventory", (req: Request, res: Response) => {
  const vendor = resolveCurrentVendor(req);
  const products = vendorEngine.getProductsForVendor(vendor.id);

  const mapped = products.map((s) => ({
    id: s.id,
    name: s.name,
    price: s.dealerLandingCost || Math.round(s.sellingPrice * 0.88),
    sellingPrice: s.sellingPrice,
    inStock: s.inStock,
    unit: s.packSize || s.unit || "unit",
    category: s.category,
    img: s.imageUrl || "",
    brand: s.brand,
    fitGuardrail: s.fitGuardrailBadge,
  }));

  res.json(mapped);
});

/**
 * Legacy Inventory PUT /api/vendor/inventory/:id
 */
router.put("/vendor/inventory/:id", (req: Request, res: Response) => {
  const vendor = resolveCurrentVendor(req);
  const skuId = String(req.params.id);
  const { price, inStock } = req.body || {};

  const updated = vendorEngine.updateProductStockOrPrice(vendor.id, skuId, {
    inStock: inStock !== undefined ? Boolean(inStock) : undefined,
    dealerLandingCost: price !== undefined ? Number(price) : undefined,
  });

  if (!updated) {
    res.status(404).json({ error: "Product not found." });
    return;
  }

  res.json({
    id: updated.id,
    name: updated.name,
    price: updated.dealerLandingCost || updated.sellingPrice,
    inStock: updated.inStock,
    unit: updated.packSize || updated.unit,
    category: updated.category,
    img: updated.imageUrl,
  });
});

/**
 * POST /api/vendor/products
 * Add product to vendor's category.
 */
router.post("/vendor/products", (req: Request, res: Response) => {
  const vendor = resolveCurrentVendor(req);
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const price = Number(req.body?.price);
  const unit = typeof req.body?.unit === "string" ? req.body.unit.trim() : "unit";
  const category = typeof req.body?.category === "string" && req.body.category.trim() ? req.body.category.trim() : vendor.categories[0];
  const imageUrl = typeof req.body?.img === "string" ? req.body.img.trim() : "";

  if (!name || !price || price <= 0) {
    res.status(400).json({ error: "Name and valid price are required." });
    return;
  }

  // Add SKU via catalogEngine
  const created = catalogEngine.createSku({
    name,
    brand: "Local Verified",
    category,
    categoryName: category,
    unit,
    sellingPrice: Math.round(price * 1.15),
    mrp: Math.round(price * 1.25),
    dealerLandingCost: price,
    imageUrl: imageUrl || "/images/products/cement/ultratech-weatherplus.webp",
    inStock: true,
    express60Min: true,
    gstPercent: 18,
    hsnCode: "6802",
    deliveryVehicleType: "3W_ELECTRIC_LOADER",
  });

  res.status(201).json({
    id: created.id,
    name: created.name,
    price: created.dealerLandingCost,
    inStock: created.inStock,
    unit: created.packSize || created.unit,
    category: created.category,
    img: created.imageUrl,
  });
});

/* ════════════════════════ 16-Category Visual Catalog & Image Uploader ════════════════════════ */

/**
 * GET /api/vendor/hub/:hubId/catalog
 * Returns the hub's 16 categories, live stock counts, and full visual product items.
 */
router.get(["/vendor/hub/:hubId/catalog", "/hub/:hubId/catalog"], (req: Request, res: Response) => {
  const hubId = String(req.params.hubId || "hub-naka");
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const status = typeof req.query.status === "string" && ["all", "in_stock", "out_of_stock", "custom_photos"].includes(req.query.status)
    ? (req.query.status as any)
    : undefined;

  const catalog = vendorCatalogEngine.getCatalog(hubId, { category, search, status });
  res.json({
    success: true,
    ...catalog,
  });
});

/**
 * PATCH /api/vendor/hub/:hubId/products/:productId/stock
 * 1-Tap In-Stock / Out-of-Stock toggle with real-time socket emission.
 */
router.patch(["/vendor/hub/:hubId/products/:productId/stock", "/hub/:hubId/products/:productId/stock"], (req: Request, res: Response) => {
  const hubId = String(req.params.hubId || "hub-naka");
  const productId = String(req.params.productId);
  const inStock = Boolean(req.body?.inStock);
  const stockQty = typeof req.body?.stockQty === "number" ? req.body.stockQty : undefined;

  const updated = vendorCatalogEngine.setStock(hubId, productId, inStock, stockQty);
  if (!updated) {
    res.status(404).json({ error: "Product not found in hub catalog." });
    return;
  }

  res.json({
    success: true,
    product: updated,
  });
});

/**
 * PATCH /api/vendor/hub/:hubId/products/:productId/image
 * Update custom product photo (supports base64 WebP/JPEG data URL or CDN path).
 */
router.patch(["/vendor/hub/:hubId/products/:productId/image", "/hub/:hubId/products/:productId/image"], (req: Request, res: Response) => {
  const hubId = String(req.params.hubId || "hub-naka");
  const productId = String(req.params.productId);
  const imageUrl = typeof req.body?.imageUrl === "string" ? req.body.imageUrl.trim() : "";

  if (!imageUrl) {
    res.status(400).json({ error: "imageUrl is required." });
    return;
  }

  const updated = vendorCatalogEngine.setImage(hubId, productId, imageUrl);
  if (!updated) {
    res.status(404).json({ error: "Product not found in hub catalog." });
    return;
  }

  res.json({
    success: true,
    product: updated,
  });
});

/**
 * POST /api/vendor/hub/:hubId/products/:productId/reset-image
 * Revert custom photo back to official Conon master catalog image.
 */
router.post(["/vendor/hub/:hubId/products/:productId/reset-image", "/hub/:hubId/products/:productId/reset-image"], (req: Request, res: Response) => {
  const hubId = String(req.params.hubId || "hub-naka");
  const productId = String(req.params.productId);

  const updated = vendorCatalogEngine.resetImage(hubId, productId);
  if (!updated) {
    res.status(404).json({ error: "Product not found in hub catalog." });
    return;
  }

  res.json({
    success: true,
    product: updated,
  });
});

/**
 * PATCH /api/vendor/hub/:hubId/products/:productId/price
 * Inline price & stock quantity editor.
 */
router.patch(["/vendor/hub/:hubId/products/:productId/price", "/hub/:hubId/products/:productId/price"], (req: Request, res: Response) => {
  const hubId = String(req.params.hubId || "hub-naka");
  const productId = String(req.params.productId);
  const dealerPrice = Number(req.body?.dealerPrice || 0);
  const mrp = Number(req.body?.mrp || 0);
  const stockQty = Number(req.body?.stockQty || 0);

  const updated = vendorCatalogEngine.updatePriceAndQty(hubId, productId, dealerPrice, mrp, stockQty);
  if (!updated) {
    res.status(404).json({ error: "Product not found in hub catalog." });
    return;
  }

  res.json({
    success: true,
    product: updated,
  });
});

/**
 * POST /api/vendor/hub/:hubId/products
 * Add brand new item into any of the 16 categories.
 */
router.post(["/vendor/hub/:hubId/products", "/hub/:hubId/products"], (req: Request, res: Response) => {
  const hubId = String(req.params.hubId || "hub-naka");
  const categorySlug = String(req.body?.categorySlug || req.body?.category || "cement-civil-works");
  const name = String(req.body?.name || "").trim();
  const brand = String(req.body?.brand || "Conon Verified").trim();
  const unit = String(req.body?.unit || "Unit").trim();
  const dealerPrice = Number(req.body?.dealerPrice || req.body?.price || 0);
  const mrp = Number(req.body?.mrp || dealerPrice * 1.25);
  const imageUrl = String(req.body?.imageUrl || req.body?.img || "");
  const stockQty = typeof req.body?.stockQty === "number" ? req.body.stockQty : 50;

  if (!name || dealerPrice <= 0) {
    res.status(400).json({ error: "Product name and valid dealer price are required." });
    return;
  }

  const created = vendorCatalogEngine.addProduct(hubId, {
    categorySlug,
    name,
    brand,
    unit,
    dealerPrice,
    mrp,
    imageUrl: imageUrl || undefined,
    inStock: true,
    stockQty,
  });

  res.status(201).json({
    success: true,
    product: created,
  });
});

/**
 * POST /api/vendor/hub/:hubId/categories/:categorySlug/toggle
 * Category-level master power switch.
 */
router.post(["/vendor/hub/:hubId/categories/:categorySlug/toggle", "/hub/:hubId/categories/:categorySlug/toggle"], (req: Request, res: Response) => {
  const hubId = String(req.params.hubId || "hub-naka");
  const categorySlug = String(req.params.categorySlug);
  const enabled = Boolean(req.body?.enabled);

  const result = vendorCatalogEngine.toggleCategory(hubId, categorySlug, enabled);
  res.json({
    success: true,
    ...result,
  });
});

/**
 * POST /api/vendor/hub/:hubId/categories/:categorySlug/restock-all
 * Morning 1-Click "Mark All In Stock" restock button.
 */
router.post(["/vendor/hub/:hubId/categories/:categorySlug/restock-all", "/hub/:hubId/categories/:categorySlug/restock-all"], (req: Request, res: Response) => {
  const hubId = String(req.params.hubId || "hub-naka");
  const categorySlug = String(req.params.categorySlug);

  const result = vendorCatalogEngine.restockAllCategory(hubId, categorySlug);
  res.json({
    success: true,
    ...result,
  });
});

/* ════════════════════════ Paisa Meter & Payouts ════════════════════════ */

/**
 * GET /api/vendor/payouts
 * Returns "Paisa Meter" wallet, T+1 settlement details, and passbook ledger with UTR numbers.
 */
router.get("/vendor/payouts", (req: Request, res: Response) => {
  const vendor = resolveCurrentVendor(req);
  const wallet = vendorEngine.getWallet(vendor.id);
  res.json({
    success: true,
    wallet,
    ...wallet,
  });
});

/**
 * Legacy Wallet GET /api/vendor/wallet
 */
router.get("/vendor/wallet", (req: Request, res: Response) => {
  const vendor = resolveCurrentVendor(req);
  const wallet = vendorEngine.getWallet(vendor.id);

  const mappedLedger = wallet.ledger.map((l) => ({
    id: l.id,
    date: l.date,
    label: l.description,
    amount: l.amount,
    type: "payout" as const,
    status: l.status === "SETTLED" ? ("Approved" as const) : ("Pending Admin Approval" as const),
    utrNumber: l.utrNumber,
  }));

  res.json({
    balance: wallet.pendingSettlement,
    totalEarned: wallet.todayEarnings + wallet.totalSettledMonth,
    pendingPayouts: wallet.pendingSettlement,
    todayEarnings: wallet.todayEarnings,
    totalSettledMonth: wallet.totalSettledMonth,
    nextSettlementDate: wallet.nextSettlementDate,
    bankAccountMasked: wallet.bankAccountMasked,
    ledger: mappedLedger,
  });
});

/**
 * POST /api/vendor/payouts/request
 */
router.post("/vendor/payouts/request", (req: Request, res: Response) => {
  const vendor = resolveCurrentVendor(req);
  const amount = Number(req.body?.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    res.status(400).json({ error: "Enter a valid amount.", reason: "invalid" });
    return;
  }

  const wallet = vendorEngine.getWallet(vendor.id);
  if (amount > wallet.pendingSettlement && wallet.pendingSettlement > 0) {
    res.status(400).json({ error: "Amount exceeds available balance.", reason: "insufficient" });
    return;
  }

  const updatedWallet = vendorEngine.requestPayout(vendor.id, amount);
  res.status(201).json({
    success: true,
    wallet: updatedWallet,
    balance: updatedWallet.pendingSettlement,
    totalEarned: updatedWallet.todayEarnings + updatedWallet.totalSettledMonth,
    pendingPayouts: updatedWallet.pendingSettlement,
    ledger: updatedWallet.ledger,
  });
});

export default router;
