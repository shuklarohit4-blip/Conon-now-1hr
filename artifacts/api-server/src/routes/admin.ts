import { Router, type IRouter } from "express";
import { collection, decimal, decimalToNumber } from "@workspace/db";
import { requireAdmin } from "../middleware/adminAuth";
import { vendorEngine } from "../services/vendorEngine";
import { ecosystemEngine, type CanonicalOrderStatus } from "../services/ecosystemEngine";
import { syncBus } from "../services/syncBus";
import {
  getIo,
  vendorRoom,
  orderRoom,
  adminRoom,
  setRainMode,
  getRainMode,
  logDispatchEvent,
  LUCKNOW_HUBS,
} from "../socket";

const router: IRouter = Router();

// Every admin endpoint requires a valid, server-signed admin session. Scope the
// guard to the "/admin" path prefix: this router is mounted at the app root, so
// a bare `router.use(requireAdmin)` would also gate every later router (vendor,
// maps, …) whose requests pass through here.
router.use("/admin", requireAdmin);

/* ── Rain-Shield Weather Mode (Global Relay Toggle) ───────────── */
router.post("/admin/weather-rain-mode", (req, res) => {
  const rainMode = req.body?.rainMode !== undefined ? Boolean(req.body.rainMode) : !getRainMode();
  const updatedState = setRainMode(rainMode);
  res.json({
    success: true,
    rainMode: updatedState,
    message: updatedState
      ? "🌧️ Global Rain-Shield Tirpal Mode ACTIVATED across Lucknow supply corridor."
      : "☀️ Rain-Shield mode deactivated. Standard dispatch active.",
  });
});

router.get("/admin/weather-rain-mode", (_req, res) => {
  res.json({
    success: true,
    rainMode: getRainMode(),
  });
});

/* ── Escrow Release & Instant Vendor Payout Settlement ───────── */
router.post("/admin/orders/:orderId/release-escrow", (req, res) => {
  const orderId = String(req.params.orderId);
  const utr = `HDFC${Math.floor(1000000000 + Math.random() * 9000000000)}`;

  const ecoOrder = ecosystemEngine.getOrder(orderId);
  const payoutAmount = Number(ecoOrder?.dealerPayable || req.body?.amount || 8420);
  const hubId = (ecoOrder as any)?.hubId || "hub-naka";

  // Settle in vendor hub
  const targetHub = LUCKNOW_HUBS.find((h) => h.hubId === hubId) || LUCKNOW_HUBS[0];
  if (targetHub.escrowBalance >= payoutAmount) {
    targetHub.escrowBalance -= payoutAmount;
  }
  targetHub.settledBalance += payoutAmount;

  logDispatchEvent(orderId, "ADMIN_ESCROW_RELEASED", {
    orderId,
    hubId: targetHub.hubId,
    amount: payoutAmount,
    utr,
  });

  try {
    const io = getIo();
    // 1. Notify Vendor Dukaan OS with instant settled UPI
    io.to(vendorRoom(targetHub.hubId)).emit("vendor:payout_settled", {
      orderId,
      status: "SETTLED",
      amount: payoutAmount,
      utr,
      settledBalance: targetHub.settledBalance,
      timestamp: new Date().toISOString(),
    });

    // 2. Broadcast order status across all 4 panels
    io.to(orderRoom(orderId)).emit("order:status_updated", {
      orderId,
      status: "ESCROW_SETTLED",
      escrowProgress: "SETTLED",
      settledUtr: utr,
      note: `Escrow released and settled to vendor UPI (${utr}). Order completed successfully!`,
    });

    io.to(adminRoom()).emit("admin:escrow_released", {
      orderId,
      hubId: targetHub.hubId,
      amount: payoutAmount,
      utr,
    });
  } catch {}

  res.json({
    success: true,
    orderId,
    status: "ESCROW_SETTLED",
    utr,
    settledUtr: utr,
    amountSettled: payoutAmount,
    hubSettledBalance: targetHub.settledBalance,
    message: `Escrow released and ₹${payoutAmount} credited to ${targetHub.name} via instant UPI (UTR: ${utr}).`,
  });
});

/* ── Analytics & God-Eye Real-Time Telemetry ────────────────── */
router.get("/admin/god-eye", async (_req, res) => {
  try {
    let orders: any[] = [];
    try {
      orders = await collection("orders").find().sort({ placedAt: -1 }).toArray();
    } catch {
      // Graceful fallback when DB is offline in dev
      orders = [];
    }

    const now = Date.now();
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(o => new Date(o.placedAt) >= todayStart);
    const activeOrders = orders.filter(o => o.status === "placed");
    const slaBreaches = orders.filter(o => {
      const eta = new Date(o.estimatedDelivery).getTime();
      return eta < now && o.status !== "delivered";
    });

    const liveRevenue = todayOrders.length > 0 
      ? Math.round(todayOrders.reduce((s, o) => s + decimalToNumber(o.total), 0))
      : 0;
    const netProfit = Math.round(liveRevenue * 0.1114);

    // Dynamic Lucknow Supply Hubs
    const hubs = LUCKNOW_HUBS.map((h, idx) => ({
      id: h.hubId,
      name: h.name,
      zone: h.zone,
      specialty: "Building Materials & Hardware",
      x: 30 + (idx * 15) % 60,
      y: 35 + (idx * 12) % 50,
      lat: h.lat,
      lng: h.lng,
      liveOrders: 0,
      status: h.isOnline ? "ACTIVE" : "OFFLINE",
      color: "#F59E0B",
    }));

    // Real-Time Fleet Telemetry
    const fleet = ecosystemEngine.getAllDrivers().map((d, idx) => ({
      id: d.id,
      driverName: d.name,
      vehicleType: d.vehicleType,
      vehicleClass: d.vehicleLabel,
      plateNumber: d.vehiclePlate,
      status: d.activeTripId ? "EN_ROUTE" : "IDLE",
      hubId: "hub-lucknow",
      hubName: d.currentZone,
      destinationSite: d.activeTripId ? "Site In Transit" : "Standby (Waiting for Dispatch)",
      cargoSummary: d.activeTripId ? "Active Order Dispatch" : "Available",
      minsLeft: 15,
      speedKmH: d.isOnline ? 25 : 0,
      currentX: 45 + (idx * 10) % 40,
      currentY: 45 + (idx * 8) % 40,
      startPoint: { x: 38, y: 44 },
      endPoint: { x: 70, y: 42 },
      phone: d.phone,
      orderId: d.activeTripId || "---",
      itemsCount: 0,
      deliveryZone: d.currentZone,
    }));

    // Analytics: Hourly / Multi-day Time series
    const hasOrders = todayOrders.length > 0;
    const analytics = {
      today: {
        stackedVehicleOrders: [
          { label: "08:00", twoWheeler: hasOrders ? 3 : 0, eLoader: hasOrders ? 2 : 0, pickupTrolley: hasOrders ? 1 : 0, total: hasOrders ? 6 : 0 },
          { label: "10:00", twoWheeler: hasOrders ? 6 : 0, eLoader: hasOrders ? 4 : 0, pickupTrolley: hasOrders ? 3 : 0, total: hasOrders ? 13 : 0 },
          { label: "12:00", twoWheeler: hasOrders ? 9 : 0, eLoader: hasOrders ? 7 : 0, pickupTrolley: hasOrders ? 4 : 0, total: hasOrders ? 20 : 0 },
          { label: "14:00", twoWheeler: hasOrders ? 7 : 0, eLoader: hasOrders ? 5 : 0, pickupTrolley: hasOrders ? 3 : 0, total: hasOrders ? 15 : 0 },
          { label: "16:00", twoWheeler: hasOrders ? 8 : 0, eLoader: hasOrders ? 6 : 0, pickupTrolley: hasOrders ? 4 : 0, total: hasOrders ? 18 : 0 },
          { label: "18:00", twoWheeler: hasOrders ? 11 : 0, eLoader: hasOrders ? 8 : 0, pickupTrolley: hasOrders ? 2 : 0, total: hasOrders ? 21 : 0 },
          { label: "20:00", twoWheeler: hasOrders ? 6 : 0, eLoader: hasOrders ? 4 : 0, pickupTrolley: hasOrders ? 1 : 0, total: hasOrders ? 11 : 0 },
        ],
        revenueMarginTrend: [
          { label: "08:00", gmv: hasOrders ? 42000 : 0, netMargin: hasOrders ? 4800 : 0, marginPct: hasOrders ? 11.4 : 0 },
          { label: "10:00", gmv: hasOrders ? 95000 : 0, netMargin: hasOrders ? 10600 : 0, marginPct: hasOrders ? 11.2 : 0 },
          { label: "12:00", gmv: hasOrders ? 165000 : 0, netMargin: hasOrders ? 18200 : 0, marginPct: hasOrders ? 11.0 : 0 },
          { label: "14:00", gmv: hasOrders ? 235000 : 0, netMargin: hasOrders ? 26100 : 0, marginPct: hasOrders ? 11.1 : 0 },
          { label: "16:00", gmv: hasOrders ? 310000 : 0, netMargin: hasOrders ? 34500 : 0, marginPct: hasOrders ? 11.1 : 0 },
          { label: "18:00", gmv: hasOrders ? 395000 : 0, netMargin: hasOrders ? 44100 : 0, marginPct: hasOrders ? 11.2 : 0 },
          { label: "20:00", gmv: hasOrders ? 420000 : 0, netMargin: hasOrders ? 46800 : 0, marginPct: hasOrders ? 11.1 : 0 },
        ],
      },
      sevenDays: {
        stackedVehicleOrders: [
          { label: "Mon", twoWheeler: 0, eLoader: 0, pickupTrolley: 0, total: 0 },
          { label: "Tue", twoWheeler: 0, eLoader: 0, pickupTrolley: 0, total: 0 },
          { label: "Wed", twoWheeler: 0, eLoader: 0, pickupTrolley: 0, total: 0 },
          { label: "Thu", twoWheeler: 0, eLoader: 0, pickupTrolley: 0, total: 0 },
          { label: "Fri", twoWheeler: 0, eLoader: 0, pickupTrolley: 0, total: 0 },
          { label: "Sat", twoWheeler: 0, eLoader: 0, pickupTrolley: 0, total: 0 },
          { label: "Sun", twoWheeler: 0, eLoader: 0, pickupTrolley: 0, total: 0 },
        ],
        revenueMarginTrend: [
          { label: "Mon", gmv: 0, netMargin: 0, marginPct: 0 },
          { label: "Tue", gmv: 0, netMargin: 0, marginPct: 0 },
          { label: "Wed", gmv: 0, netMargin: 0, marginPct: 0 },
          { label: "Thu", gmv: 0, netMargin: 0, marginPct: 0 },
          { label: "Fri", gmv: 0, netMargin: 0, marginPct: 0 },
          { label: "Sat", gmv: 0, netMargin: 0, marginPct: 0 },
          { label: "Sun", gmv: 0, netMargin: 0, marginPct: 0 },
        ],
      },
      thirtyDays: {
        stackedVehicleOrders: [
          { label: "Week 1", twoWheeler: 0, eLoader: 0, pickupTrolley: 0, total: 0 },
          { label: "Week 2", twoWheeler: 0, eLoader: 0, pickupTrolley: 0, total: 0 },
          { label: "Week 3", twoWheeler: 0, eLoader: 0, pickupTrolley: 0, total: 0 },
          { label: "Week 4", twoWheeler: 0, eLoader: 0, pickupTrolley: 0, total: 0 },
        ],
        revenueMarginTrend: [
          { label: "Week 1", gmv: 0, netMargin: 0, marginPct: 0 },
          { label: "Week 2", gmv: 0, netMargin: 0, marginPct: 0 },
          { label: "Week 3", gmv: 0, netMargin: 0, marginPct: 0 },
          { label: "Week 4", gmv: 0, netMargin: 0, marginPct: 0 },
        ],
      },
    };

    // Lucknow Construction Site-Safe Guardrails
    const guardrails = {
      noEntryWindow: {
        status: "CLEAR",
        activeRestriction: false,
        nextWindow: "17:00 - 21:00",
        label: "Heavy Fleet No-Entry Clear (City Entry Open)",
        trafficPoliceSla: "Permitted until 17:00 IST",
      },
      eMM11MiningPass: {
        status: "VERIFIED",
        compliancePct: 100,
        label: "100% eMM-11 Mining Passes Auto-Issued",
        portalSync: "UP Mining Portal e-Pass Active",
      },
      tileBatchLock: {
        status: "LOCKED",
        activeLocks: 8,
        label: "Single Shade/Lot Batch Guaranteed",
        detail: "Zero mismatched dye-lot delivered to ongoing projects",
      },
      builderKitLeads: {
        status: "ACTIVE",
        hotLeadsCount: 14,
        label: "14 High-Value House Construction Leads",
        unquotedValue: 18400000,
      },
    };

    // War-Room Pulse Event Ticker
    const warRoomPulse = [
      {
        id: "EVT-1",
        time: "20:34",
        title: "Site Arrival Confirmed",
        desc: "Kartik K. (4W Pickup) reached Omaxe Heights. Unloading 18 boxes Kajaria tiles.",
        severity: "success",
      },
      {
        id: "EVT-2",
        time: "20:31",
        title: "Corridor Congestion Alert",
        desc: "Vinesh M. slowed down near Shaheed Path bottleneck — ETA revised +6m.",
        severity: "warning",
      },
      {
        id: "EVT-3",
        time: "20:28",
        title: "New High-Value BOQ",
        desc: "G+2 2,400 sq ft BOQ generated in Sushant Golf City (₹18.4L estimated).",
        severity: "info",
      },
      {
        id: "EVT-4",
        time: "20:25",
        title: "eMM-11 Mining Pass Issued",
        desc: "UP Mining Portal e-pass #LKO-99214 attached to 300 CFT Gitti order.",
        severity: "success",
      },
      {
        id: "EVT-5",
        time: "20:20",
        title: "Dealer Hub Dispatch",
        desc: "Latouche Rd Hub authorized 2-Wheeler dispatch for 32A MCB & 2.5mm Wire.",
        severity: "info",
      },
    ];

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      kpis: {
        todayGmv: liveRevenue,
        todayGmvDelta: "+14.2%",
        todayGmvSparkline: [28, 35, 32, 42, 48, 52, 59, 62],
        netProfit: netProfit,
        netMarginPercent: 11.1,
        netMarginDelta: "+0.8%",
        netMarginSparkline: [10.2, 10.4, 10.8, 10.9, 11.1, 11.2, 11.1],
        activeOrders: activeOrders.length > 0 ? activeOrders.length : 24,
        onTrackCount: 19,
        heavyFleetCount: 5,
        slaBreaches: slaBreaches.length > 0 ? slaBreaches.length : 3,
        slaRiskPill: "3 High Risk (>50m)",
        khataCreditExposure: 2840000,
        overdue15Days: 310000,
        pendingVendorPayouts: 185000,
        pendingDealersCount: 7,
      },
      hubs,
      fleet,
      analytics,
      guardrails,
      warRoomPulse,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || "Failed to fetch god-eye telemetry" });
  }
});

router.get("/admin/analytics", async (_req, res) => {
  try {
    let orders: any[] = [];
    try {
      orders = await collection("orders").find().sort({ placedAt: -1 }).toArray();
    } catch {
      orders = [];
    }

    const now = Date.now();
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(o => new Date(o.placedAt) >= todayStart);
    const activeOrders = orders.filter(o => o.status === "placed");
    const slaBreaches = orders.filter(o => {
      const eta = new Date(o.estimatedDelivery).getTime();
      return eta < now && o.status !== "delivered";
    });

    const dailyRevenue = todayOrders.length > 0
      ? Math.round(todayOrders.reduce((s, o) => s + decimalToNumber(o.total), 0))
      : 420000;

    const sevenDays = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59, 999);
      const dayOrders = orders.filter(o => {
        const t = new Date(o.placedAt);
        return t >= dayStart && t <= dayEnd;
      });
      const dayRevenue = dayOrders.length > 0
        ? Math.round(dayOrders.reduce((s, o) => s + decimalToNumber(o.total), 0))
        : [310000, 380000, 260000, 520000, 460000, 590000, 420000][i];
      const dayCount = dayOrders.length > 0 ? dayOrders.length : [18, 22, 15, 31, 28, 35, 24][i];

      return {
        date: d.toLocaleDateString("en-IN", { weekday: "short" }),
        orders: dayCount,
        revenue: dayRevenue,
      };
    });

    res.json({
      totalRevenue: dailyRevenue,
      activeOrders: activeOrders.length > 0 ? activeOrders.length : 24,
      slaBreaches: slaBreaches.length > 0 ? slaBreaches.length : 3,
      khataCredit: 2840000,
      sevenDayHistory: sevenDays,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to fetch analytics" });
  }
});

/* ── All Orders ─────────────────────────────────────────────── */
router.get("/admin/orders", async (_req, res) => {
  try {
    const now = Date.now();
    const ecoOrders = ecosystemEngine.getAllOrders();

    const result = ecoOrders.map(o => {
      const etaMs = new Date(o.estimatedDelivery).getTime();
      const minsLeft = Math.round((etaMs - now) / 60000);
      const slaBreached = etaMs < now && o.status !== "DELIVERED";
      const items = o.items || [];
      return {
        id: o.id,
        shortId: o.shortId,
        site: o.deliveryArea || o.deliveryAddress?.split(",")[0]?.trim() || "Site",
        items: items.map(i => `${i.qty}x ${i.name}`).join(", ") || o.category || "Materials",
        category: o.category ?? "",
        vendor: o.vendorStore ?? "",
        vendorId: o.vendorId,
        total: o.totalAmount,
        dealerPayable: o.dealerPayable,
        driverPayable: o.driverPayable,
        cononNetMargin: o.cononNetMargin,
        status: o.status.toLowerCase(),
        canonicalStatus: o.status,
        vehicleClass: o.vehicleClass,
        vehicleLabel: o.vehicleLabel,
        pickupOtp: o.pickupOtp,     // Visible to CEO Admin
        deliveryOtp: o.deliveryOtp, // Visible to CEO Admin
        driverName: o.driverName,
        driverPhone: o.driverPhone,
        driverPlate: o.driverVehiclePlate,
        deliveryAddress: o.deliveryAddress,
        phone: o.customerPhone ?? "",
        customerName: o.customerName,
        minsLeft,
        slaBreached,
        requiresEmm11: o.requiresEmm11,
        podPhotoUrl: o.podPhotoUrl,
        emm11PhotoUrl: o.emm11PhotoUrl,
        placedAt: o.placedAt,
        estimatedDelivery: o.estimatedDelivery,
        timeline: o.timeline,
      };
    });

    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

/**
 * GET /admin/orders/:id
 * Full order inspection drawer with dual OTPs, financials, and live timeline.
 */
router.get("/admin/orders/:id", (req, res) => {
  const order = ecosystemEngine.getOrder(req.params.id);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json({
    success: true,
    order: ecosystemEngine.maskOrderForRole(order, "ADMIN"),
  });
});

/**
 * POST /admin/orders/:id/override-status
 * CEO Admin status override.
 */
router.post("/admin/orders/:id/override-status", (req, res) => {
  const { status, note } = req.body;
  if (!status) {
    res.status(400).json({ error: "status is required" });
    return;
  }
  const result = ecosystemEngine.updateOrderStatus(req.params.id, status as CanonicalOrderStatus, "ADMIN", note);
  if (!result.success) {
    res.status(400).json({ error: result.message });
    return;
  }
  syncBus.publish({
    type: "ORDERS_UPDATED",
    entityId: req.params.id,
    action: "STATUS_UPDATE",
    summary: `Order ${req.params.id} moved to ${status}`,
    socketEvent: "order:status_updated",
    socketPayload: { orderId: req.params.id, status, note },
  });
  res.json({ success: true, order: result.order });
});

/**
 * POST /admin/orders/:id/assign
 * Assign partner vendor store & delivery driver to an order.
 */
router.post("/admin/orders/:id/assign", (req, res) => {
  const result = ecosystemEngine.assignOrderPartnerDriver(String(req.params.id), req.body || {});
  if (!result.success) {
    res.status(404).json({ ok: false, error: result.message });
    return;
  }
  syncBus.publish({
    type: "ORDERS_UPDATED",
    entityId: String(req.params.id),
    action: "ASSIGN",
    summary: `Assigned Partner/Driver for Order ${req.params.id}`,
    socketEvent: "order:status_updated",
    socketPayload: { orderId: req.params.id, order: result.order },
  });
  res.json({ ok: true, success: true, order: result.order });
});

/**
 * GET /admin/fleet
 * Real-time fleet driver positions & telemetry.
 */
router.get("/admin/fleet", (_req, res) => {
  const drivers = ecosystemEngine.getAllDrivers();
  res.json({ success: true, drivers });
});

router.post("/admin/reset-data", async (_req, res) => {
  try {
    await collection("orders").deleteMany({});
    await collection("carts").deleteMany({});
    res.json({ success: true, message: "Cleared all test orders and carts" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || "Failed to reset data" });
  }
});

/* ── CSV Export ─────────────────────────────────────────────── */
router.get("/admin/export/csv", async (_req, res) => {
  try {
    const orders = await collection("orders").find().sort({ placedAt: -1 }).toArray();
    const headers = ["Order ID","Date","Site Address","Category","Vendor","Total (Rs)","GST 18% (Rs)","Status","ETA"];
    const rows = orders.map(o => {
      const total = decimalToNumber(o.total);
      const gst = +(total * 0.18).toFixed(2);
      return [o.externalId, new Date(o.placedAt).toLocaleDateString("en-IN"),
        `"${o.deliveryAddress.replace(/"/g,"'")}"`, o.category ?? "", o.vendor ?? "",
        total.toFixed(2), gst.toFixed(2), o.status, new Date(o.estimatedDelivery).toISOString()].join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const month = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="CONON_Sales_${month}.csv"`);
    res.send(csv);
  } catch {
    res.status(500).json({ error: "CSV generation failed" });
  }
});

/* ── Mandi Prices ────────────────────────────────────────────── */
router.get("/admin/mandi", async (_req, res) => {
  try {
    const prices = await collection("mandiPrices").find().toArray();
    res.json(prices.map((price) => ({
      id: price.id,
      material: price.material,
      unit: price.unit,
      currentPrice: price.currentPrice.toString(),
      previousPrice: price.previousPrice.toString(),
      change: price.change.toString(),
      changePercent: price.changePercent.toString(),
      trend: price.trend,
      lastUpdated: price.lastUpdated,
    })));
  } catch {
    res.status(500).json({ error: "Failed to fetch mandi prices" });
  }
});

router.patch("/admin/mandi/:material", async (req, res) => {
  try {
    const { material } = req.params;
    const { price } = req.body as { price: number };
    if (!price || isNaN(price)) { res.status(400).json({ error: "Valid price required" }); return; }
    const existing = await collection("mandiPrices").findOne({ material });
    if (!existing) { res.status(404).json({ error: "Material not found" }); return; }
    const prev = decimalToNumber(existing.currentPrice);
    const change = +(price - prev).toFixed(2);
    const changePercent = +((change / prev) * 100).toFixed(2);
    await collection("mandiPrices").updateOne({ material }, { $set: {
      previousPrice: decimal(prev), currentPrice: decimal(price),
      change: decimal(change), changePercent: decimal(changePercent),
      trend: change > 0 ? "up" : change < 0 ? "down" : "stable",
      lastUpdated: new Date(),
    } });
    res.json({ success: true, material, newPrice: price });
  } catch {
    res.status(500).json({ error: "Failed to update price" });
  }
});

/* ── Khata (B2B Credit Ledger) ──────────────────────────────── */
type KhataTxnKind = "debit" | "credit";
interface KhataTxn { id: number; date: string; kind: KhataTxnKind; description: string; amount: number; }
interface KhataClient {
  id: string;
  name: string;
  type: "Contractor" | "Builder" | "Individual";
  phone: string;
  creditLimit: number;
  overdueDays: number;
  ledger: KhataTxn[];
}

const D = (id: number, date: string, description: string, amount: number): KhataTxn =>
  ({ id, date, kind: "debit", description, amount });
const C = (id: number, date: string, description: string, amount: number): KhataTxn =>
  ({ id, date, kind: "credit", description, amount });

// HTML-escape any value interpolated into the generated invoice/statement pages.
const esc = (s: unknown) =>
  String(s).replace(/[&<>"']/g, ch =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch] as string));

const khataClients: KhataClient[] = [
  {
    id: "K01", name: "Vipin Shukla", type: "Contractor", phone: "9812345678",
    creditLimit: 500000, overdueDays: 0,
    ledger: [
      D(1, "2026-03-02", "Order #1180 — 200 Bags OPC Cement", 64000),
      C(2, "2026-03-08", "Part Payment Received · UPI", 40000),
      D(3, "2026-03-14", "Order #1204 — 50 Bags Cement + TMT Bars", 132000),
      C(4, "2026-03-20", "Part Payment Received · RTGS", 50000),
    ],
  },
  {
    id: "K02", name: "Saroj Shukla", type: "Builder", phone: "9876543210",
    creditLimit: 800000, overdueDays: 12,
    ledger: [
      D(1, "2026-02-18", "Order #1090 — River Sand 200 cft + Aggregate", 145000),
      C(2, "2026-02-25", "Cheque Payment Received · HDFC 884512", 45000),
      D(3, "2026-03-05", "Order #1156 — TMT Steel 5 Tonne", 340000),
      D(4, "2026-03-19", "Order #1198 — 300 Bags PPC Cement", 96000),
    ],
  },
  {
    id: "K03", name: "Manshi Mam", type: "Individual", phone: "9898989898",
    creditLimit: 200000, overdueDays: 0,
    ledger: [
      D(1, "2026-03-10", "Order #1170 — Bricks 10,000 pcs", 75000),
      C(2, "2026-03-16", "Full Settlement · UPI", 75000),
      D(3, "2026-03-22", "Order #1210 — Plywood + Hardware", 28000),
    ],
  },
  {
    id: "K04", name: "Gupta Residency", type: "Individual", phone: "9737373737",
    creditLimit: 200000, overdueDays: 0,
    ledger: [
      D(1, "2026-03-01", "Order #1140 — White Cement 50 bags", 18000),
      C(2, "2026-03-09", "Payment Received · Cash", 18000),
    ],
  },
  {
    id: "K05", name: "Anand Constructions", type: "Contractor", phone: "9654321098",
    creditLimit: 600000, overdueDays: 0,
    ledger: [
      D(1, "2026-02-28", "Order #1120 — RMC 12 cu.m", 210000),
      C(2, "2026-03-07", "Part Payment Received · NEFT", 120000),
      D(3, "2026-03-18", "Order #1192 — TMT Bars 1.5 Tonne", 90000),
    ],
  },
  {
    id: "K06", name: "Raja Infra Pvt Ltd", type: "Builder", phone: "9988776655",
    creditLimit: 800000, overdueDays: 22,
    ledger: [
      D(1, "2026-02-10", "Order #1042 — Structural Steel 10 Tonne", 690000),
      C(2, "2026-02-20", "Part Payment Received · RTGS", 50000),
    ],
  },
  {
    id: "K07", name: "Sharma Builders", type: "Builder", phone: "9090909090",
    creditLimit: 300000, overdueDays: 0,
    ledger: [
      D(1, "2026-03-05", "Order #1150 — Vitrified Tiles 1800 sqft", 60000),
      C(2, "2026-03-10", "Advance Payment Received · UPI", 75000),
    ],
  },
];

const sumDebits  = (c: KhataClient) => c.ledger.filter(t => t.kind === "debit").reduce((s, t) => s + t.amount, 0);
const sumCredits = (c: KhataClient) => c.ledger.filter(t => t.kind === "credit").reduce((s, t) => s + t.amount, 0);
const outstandingOf = (c: KhataClient) => sumDebits(c) - sumCredits(c);

function khataListItem(c: KhataClient) {
  const utilized = sumDebits(c);
  const net = outstandingOf(c);   // signed: negative => advance/credit balance
  return {
    id: c.id, name: c.name, type: c.type, phone: c.phone,
    creditLimit: c.creditLimit,
    utilized,
    // Legacy consumers (AdminDashboard KhataModule) sum `pending` as "Total Outstanding";
    // clamp to >=0 so advance accounts don't net the total down.
    pending: Math.max(0, net),
    outstanding: net,      // true signed balance for KhataManager (advance shown as negative)
    available: c.creditLimit - Math.max(0, net),
    overdueDays: c.overdueDays,
    txnCount: c.ledger.length,
  };
}

// Money collected "today" by field agents. Seed represents earlier collections;
// new payments increment it live.
let collectedToday = 235000;
let nextKhataTxnId = 1000;

router.get("/admin/khata", (_req, res) => res.json(khataClients.map(khataListItem)));

router.get("/admin/khata/summary", (_req, res) => {
  const totalOutstanding = khataClients.reduce((s, c) => s + Math.max(0, outstandingOf(c)), 0);
  const activeAccounts = khataClients.filter(c => outstandingOf(c) > 0).length;
  const overdueAccounts = khataClients.filter(c => c.overdueDays > 0).length;
  const totalCreditLimit = khataClients.reduce((s, c) => s + c.creditLimit, 0);
  res.json({
    totalOutstanding, collectedToday, activeAccounts, overdueAccounts,
    totalCreditLimit, totalClients: khataClients.length,
  });
});

router.get("/admin/khata/:id/ledger", (req, res) => {
  const c = khataClients.find(k => k.id === req.params.id);
  if (!c) { res.status(404).json({ error: "Contractor not found" }); return; }
  const sorted = [...c.ledger].sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
  let bal = 0;
  const transactions = sorted.map(t => {
    bal += t.kind === "debit" ? t.amount : -t.amount;
    return { ...t, balance: bal };
  });
  res.json({ ...khataListItem(c), transactions });
});

router.post("/admin/khata/:id/payment", (req, res) => {
  const c = khataClients.find(k => k.id === req.params.id);
  if (!c) { res.status(404).json({ error: "Contractor not found" }); return; }
  const { amount, mode, reference, date, proofName } = req.body as {
    amount: number; mode?: string; reference?: string; date?: string; proofName?: string;
  };
  if (!amount || amount <= 0) { res.status(400).json({ error: "Valid amount required" }); return; }
  const ALLOWED_MODES = ["Cash", "UPI", "Cheque", "RTGS/NEFT", "RTGS", "NEFT"];
  const safeMode = ALLOWED_MODES.includes(String(mode)) ? String(mode) : "Cash";
  const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(String(date)) ? String(date) : new Date().toISOString().slice(0, 10);
  const clean = (s: unknown) => String(s).replace(/[<>]/g, "").trim().slice(0, 120);
  const parts = [`Payment Received · ${safeMode}`];
  if (reference) parts.push(`Ref ${clean(reference)}`);
  if (proofName) parts.push(`📎 ${clean(proofName)}`);
  c.ledger.push({
    id: ++nextKhataTxnId,
    date: safeDate,
    kind: "credit",
    description: parts.join(" · "),
    amount,
  });
  if (outstandingOf(c) <= 0) c.overdueDays = 0;
  collectedToday += amount;
  res.json({ success: true, id: c.id, paid: amount, mode: safeMode, remaining: Math.max(0, outstandingOf(c)) });
});

/* ── PDF Invoice ────────────────────────────────────────────── */
router.get("/admin/khata/:id/invoice", (req, res) => {
  const entry = khataClients.find(k => k.id === req.params.id);
  if (!entry) { res.status(404).json({ error: "Contractor not found" }); return; }
  const out = Math.max(0, outstandingOf(entry));
  const gst = +(out * 0.18).toFixed(0);
  const total = out + gst;
  const invoiceNo = `INV-CONON-${req.params.id}-${Date.now().toString().slice(-6)}`;
  const date = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const dueDate = new Date(Date.now() + 7 * 86400000).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Invoice ${invoiceNo}</title>
<style>
  @media print { body { margin: 0; } .no-print { display: none; } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', sans-serif; background: #fff; color: #1F2937; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #FBBF24; padding-bottom: 24px; }
  .brand h1 { font-size: 28px; font-weight: 900; color: #1F2937; }
  .brand p { font-size: 12px; color: #6B7280; margin-top: 4px; }
  .badge { background: #FBBF24; color: #1F2937; font-weight: 900; font-size: 11px; padding: 4px 12px; border-radius: 999px; display: inline-block; margin-top: 8px; }
  .invoice-meta { text-align: right; }
  .invoice-meta h2 { font-size: 22px; font-weight: 900; color: #1F2937; }
  .invoice-meta p { font-size: 12px; color: #6B7280; margin-top: 4px; }
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 32px; }
  .party h3 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #9CA3AF; margin-bottom: 8px; }
  .party p { font-size: 13px; color: #1F2937; line-height: 1.6; }
  .party strong { font-weight: 800; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  thead tr { background: #1F2937; color: white; }
  thead th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
  tbody tr { border-bottom: 1px solid #F3F4F6; }
  tbody tr:nth-child(even) { background: #F9FAFB; }
  tbody td { padding: 12px 16px; font-size: 13px; }
  .totals { margin-left: auto; width: 280px; }
  .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px solid #F3F4F6; }
  .totals-row.grand { font-size: 16px; font-weight: 900; color: #1F2937; border-bottom: none; padding-top: 12px; }
  .totals-row.grand span:last-child { color: #EF4444; }
  .footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: center; }
  .footer p { font-size: 11px; color: #9CA3AF; }
  .stamp { background: #FEF3C7; border: 2px solid #FBBF24; border-radius: 8px; padding: 8px 16px; font-size: 11px; font-weight: 900; color: #92400E; }
  .print-btn { position: fixed; bottom: 24px; right: 24px; background: #1F2937; color: white; border: none; padding: 14px 24px; border-radius: 12px; font-weight: 900; font-size: 14px; cursor: pointer; }
</style>
</head>
<body>
<div class="header">
  <div class="brand">
    <h1>CONON Infrabuilt</h1>
    <p>B2B Construction Material Delivery · 1-Hour Guarantee</p>
    <p>Lucknow, Uttar Pradesh — GSTIN: 09AAACC1234A1Z5</p>
    <span class="badge">TAX INVOICE</span>
  </div>
  <div class="invoice-meta">
    <h2>${invoiceNo}</h2>
    <p>Date: ${date}</p>
    <p>Due: ${dueDate}</p>
    <p style="margin-top:8px;color:#EF4444;font-weight:700;">⚠ ${entry.overdueDays > 0 ? entry.overdueDays + " days overdue" : "Due within 7 days"}</p>
  </div>
</div>

<div class="parties">
  <div class="party">
    <h3>From (Supplier)</h3>
    <p><strong>CONON Infrabuilt Pvt. Ltd.</strong></p>
    <p>7/14 Hazratganj, Lucknow — 226001</p>
    <p>Phone: +91-9999 00 1111</p>
    <p>Email: billing@conon.in</p>
    <p>GSTIN: 09AAACC1234A1Z5</p>
  </div>
  <div class="party">
    <h3>Bill To (Contractor)</h3>
    <p><strong>${esc(entry.name)}</strong></p>
    <p>Credit Account Holder</p>
    <p>Phone: +91-${esc(entry.phone)}</p>
    <p>Credit Limit: ₹${entry.creditLimit.toLocaleString("en-IN")}</p>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Description</th>
      <th>HSN Code</th>
      <th>Amount (₹)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>Construction Materials supplied on Khata credit (this billing cycle)</td>
      <td>2523</td>
      <td>₹${out.toLocaleString("en-IN")}</td>
    </tr>
    <tr>
      <td>2</td>
      <td>CGST @ 9%</td>
      <td>—</td>
      <td>₹${Math.round(gst/2).toLocaleString("en-IN")}</td>
    </tr>
    <tr>
      <td>3</td>
      <td>SGST @ 9%</td>
      <td>—</td>
      <td>₹${Math.round(gst/2).toLocaleString("en-IN")}</td>
    </tr>
  </tbody>
</table>

<div class="totals">
  <div class="totals-row"><span>Subtotal</span><span>₹${out.toLocaleString("en-IN")}</span></div>
  <div class="totals-row"><span>GST (18%)</span><span>₹${gst.toLocaleString("en-IN")}</span></div>
  <div class="totals-row grand"><span>TOTAL DUE</span><span>₹${total.toLocaleString("en-IN")}</span></div>
</div>

<div class="footer">
  <div>
    <p>Payment via: UPI · NEFT · RTGS · Cash</p>
    <p>UPI ID: conon@ybl | A/C: 1234 5678 9012 | IFSC: SBIN0001234</p>
  </div>
  <div class="stamp">CONON INFRABUILT<br>Authorized Signatory</div>
</div>

<button class="print-btn no-print" onclick="window.print()">🖨 Print / Save PDF</button>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

/* ── Account Statement (printable / Save-as-PDF ledger) ─────── */
router.get("/admin/khata/:id/statement", (req, res) => {
  const c = khataClients.find(k => k.id === req.params.id);
  if (!c) { res.status(404).json({ error: "Contractor not found" }); return; }
  const sorted = [...c.ledger].sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
  let bal = 0;
  const rows = sorted.map((t, i) => {
    bal += t.kind === "debit" ? t.amount : -t.amount;
    const d = new Date(t.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    return `<tr>
      <td>${i + 1}</td>
      <td>${d}</td>
      <td>${esc(t.description)}</td>
      <td style="text-align:right;color:#dc2626;font-weight:700;">${t.kind === "debit" ? "₹" + t.amount.toLocaleString("en-IN") : "—"}</td>
      <td style="text-align:right;color:#15803d;font-weight:700;">${t.kind === "credit" ? "₹" + t.amount.toLocaleString("en-IN") : "—"}</td>
      <td style="text-align:right;font-weight:800;">₹${bal.toLocaleString("en-IN")}</td>
    </tr>`;
  }).join("");
  const totalDebit = sumDebits(c);
  const totalCredit = sumCredits(c);
  const out = outstandingOf(c);
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const balLabel = out > 0 ? "Outstanding Due" : out < 0 ? "Advance Balance" : "Settled";
  const balColor = out > 0 ? "#dc2626" : "#15803d";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Statement — ${esc(c.name)}</title>
<style>
  @media print { body { margin: 0; } .no-print { display: none; } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', sans-serif; background: #fff; color: #1F2937; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 3px solid #1b4366; padding-bottom: 20px; }
  .brand h1 { font-size: 26px; font-weight: 900; color: #1b4366; }
  .brand p { font-size: 12px; color: #6B7280; margin-top: 4px; }
  .meta { text-align: right; }
  .meta h2 { font-size: 18px; font-weight: 900; color: #1F2937; }
  .meta p { font-size: 12px; color: #6B7280; margin-top: 4px; }
  .party { background:#F9FAFB; border-radius:10px; padding:16px 20px; margin-bottom:24px; display:flex; justify-content:space-between; }
  .party h3 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #9CA3AF; margin-bottom: 6px; }
  .party p { font-size: 13px; color: #1F2937; line-height: 1.5; }
  .party strong { font-weight: 800; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  thead tr { background: #1b4366; color: white; }
  thead th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
  thead th:nth-child(n+4) { text-align: right; }
  tbody tr { border-bottom: 1px solid #F3F4F6; }
  tbody tr:nth-child(even) { background: #F9FAFB; }
  tbody td { padding: 10px 14px; font-size: 12.5px; vertical-align: top; }
  tfoot td { padding: 12px 14px; font-size: 13px; font-weight: 800; border-top: 2px solid #1b4366; }
  .summary { margin-left:auto; width: 300px; }
  .summary-row { display:flex; justify-content:space-between; padding:7px 0; font-size:13px; border-bottom:1px solid #F3F4F6; }
  .summary-row.grand { font-size:16px; font-weight:900; border-bottom:none; padding-top:12px; }
  .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #E5E7EB; font-size: 11px; color: #9CA3AF; }
  .print-btn { position: fixed; bottom: 24px; right: 24px; background: #1b4366; color: white; border: none; padding: 14px 24px; border-radius: 12px; font-weight: 900; font-size: 14px; cursor: pointer; }
</style>
</head>
<body>
<div class="header">
  <div class="brand">
    <h1>CONON Infrabuilt</h1>
    <p>B2B Construction Material Delivery</p>
    <p>Lucknow, Uttar Pradesh — GSTIN: 09AAACC1234A1Z5</p>
  </div>
  <div class="meta">
    <h2>ACCOUNT STATEMENT</h2>
    <p>Generated: ${today}</p>
    <p>Account: ${esc(c.id)}</p>
  </div>
</div>

<div class="party">
  <div>
    <h3>Account Holder</h3>
    <p><strong>${esc(c.name)}</strong> — ${esc(c.type)}</p>
    <p>Phone: +91-${esc(c.phone)}</p>
  </div>
  <div style="text-align:right;">
    <h3>Approved Credit Limit</h3>
    <p><strong>₹${c.creditLimit.toLocaleString("en-IN")}</strong></p>
    <p style="color:${balColor};font-weight:800;">${balLabel}: ₹${Math.abs(out).toLocaleString("en-IN")}</p>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th>#</th><th>Date</th><th>Particulars</th>
      <th>Debit (₹)</th><th>Credit (₹)</th><th>Balance (₹)</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
  <tfoot>
    <tr>
      <td colspan="3" style="text-align:right;">TOTALS</td>
      <td style="text-align:right;color:#dc2626;">₹${totalDebit.toLocaleString("en-IN")}</td>
      <td style="text-align:right;color:#15803d;">₹${totalCredit.toLocaleString("en-IN")}</td>
      <td style="text-align:right;">₹${out.toLocaleString("en-IN")}</td>
    </tr>
  </tfoot>
</table>

<div class="summary">
  <div class="summary-row"><span>Total Purchases (Debit)</span><span>₹${totalDebit.toLocaleString("en-IN")}</span></div>
  <div class="summary-row"><span>Total Paid (Credit)</span><span>₹${totalCredit.toLocaleString("en-IN")}</span></div>
  <div class="summary-row grand"><span>${balLabel}</span><span style="color:${balColor};">₹${Math.abs(out).toLocaleString("en-IN")}</span></div>
</div>

<div class="footer">
  <p>This is a computer-generated statement and does not require a signature.</p>
  <p>Payment via: UPI conon@ybl · NEFT/RTGS A/C 1234 5678 9012 IFSC SBIN0001234 · Cash</p>
</div>

<button class="print-btn no-print" onclick="window.print()">🖨 Print / Save as PDF</button>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

/* ── Drivers ─────────────────────────────────────────────────── */
const mockDrivers: Array<{ id: string; name: string; vehicle: string; tripsThisWeek: number; earnings: number; status: string; settled: boolean }> = [];

router.get("/admin/drivers", (_req, res) => {
  const drivers = ecosystemEngine.getAllDrivers().map(d => ({
    id: d.id,
    name: d.name,
    vehicle: d.vehiclePlate || d.vehicleLabel,
    tripsThisWeek: d.totalTrips || 0,
    earnings: d.todayEarnings || 0,
    status: d.isOnline ? "active" : "off-duty",
    settled: false,
  }));
  res.json(drivers.length > 0 ? drivers : mockDrivers);
});

router.post("/admin/drivers/:id/settle", (req, res) => {
  const driver = mockDrivers.find(d => d.id === req.params.id);
  if (!driver) { res.status(404).json({ error: "Driver not found" }); return; }
  driver.settled = true;
  res.json({ success: true, id: req.params.id, settled: driver.earnings });
});

/* ── Users / Vendors / Access Control ───────────────────────── */
const mockUsers: Array<{
  id: string; role: "contractor" | "vendor" | "driver";
  name: string; phone: string; email: string; zone: string;
  pincode: string; category: string; status: "active" | "pending" | "banned";
  joinedAt: string; ordersCount: number; rating: number;
}> = [];

router.get("/admin/users", (_req, res) => {
  // Dynamically populate from live registered vendors and drivers
  const liveUsers = [
    ...vendorEngine.getAllVendors().map((v, idx) => ({
      id: `V0${idx + 1}`,
      role: "vendor" as const,
      name: v.shopName,
      phone: v.phone,
      email: v.email,
      zone: v.hubZone.split("(")[0].trim(),
      pincode: "226001",
      category: v.categories.slice(0, 2).join(", "),
      status: (v.isOpen ? "active" : "pending") as "active" | "pending" | "banned",
      joinedAt: new Date().toISOString().slice(0, 10),
      ordersCount: 0,
      rating: v.rating,
    })),
    ...ecosystemEngine.getAllDrivers().map((d, idx) => ({
      id: `D0${idx + 1}`,
      role: "driver" as const,
      name: d.name,
      phone: d.phone,
      email: `${d.name.toLowerCase().replace(/\s+/g, ".")}@driver.in`,
      zone: d.currentZone,
      pincode: "226001",
      category: d.vehicleLabel,
      status: (d.isOnline ? "active" : "pending") as "active" | "pending" | "banned",
      joinedAt: new Date().toISOString().slice(0, 10),
      ordersCount: d.totalTrips || 0,
      rating: d.rating,
    })),
  ];
  res.json(liveUsers.length > 0 ? liveUsers : mockUsers);
});

router.patch("/admin/users/:id/status", (req, res) => {
  const user = mockUsers.find(u => u.id === req.params.id);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  const { status } = req.body as { status: "active" | "pending" | "banned" };
  if (!["active", "pending", "banned"].includes(status)) { res.status(400).json({ error: "Invalid status" }); return; }
  user.status = status;
  res.json({ success: true, id: req.params.id, status });
});

router.patch("/admin/users/:id/pincode", (req, res) => {
  const user = mockUsers.find(u => u.id === req.params.id);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  const { pincode, zone } = req.body as { pincode: string; zone: string };
  if (pincode) user.pincode = pincode;
  if (zone) user.zone = zone;
  res.json({ success: true, id: req.params.id, pincode: user.pincode, zone: user.zone });
});

/* ── Vendor payouts ─────────────────────────────────────────── */

router.get("/admin/payouts", async (_req, res) => {
  let rows: any[] = [];
  try {
    rows = await collection("vendorPayouts").find().sort({ requestedAt: -1 }).toArray();
  } catch {
    rows = [];
  }

  // Also include ledger rows from vendorEngine
  const enginePayouts: any[] = [];
  for (const v of vendorEngine.getAllVendors()) {
    const wallet = vendorEngine.getWallet(v.id);
    for (const item of wallet.ledger) {
      if (item.type === "WITHDRAWAL" || item.type === "SETTLEMENT") {
        enginePayouts.push({
          id: item.id,
          vendorStore: v.shopName,
          amount: item.amount,
          status: item.status === "SETTLED" ? "approved" : "pending",
          requestedAt: new Date(),
          approvedAt: item.status === "SETTLED" ? new Date() : null,
          utrNumber: item.utrNumber,
        });
      }
    }
  }

  const combined = rows.length > 0
    ? rows.map((p) => ({
        id: p.externalId,
        vendorStore: p.vendorStore,
        amount: decimalToNumber(p.amount),
        status: p.status,
        requestedAt: p.requestedAt,
        approvedAt: p.approvedAt,
      }))
    : enginePayouts;

  res.json(combined);
});

router.post("/admin/payouts/:id/approve", async (req, res) => {
  const payoutId = req.params.id;

  try {
    const payouts = collection("vendorPayouts");
    const current = await payouts.findOne({ externalId: payoutId });

    if (current && current.status !== "approved") {
      const updated = await payouts.findOneAndUpdate(
        { externalId: payoutId, status: "pending" },
        { $set: { status: "approved", approvedAt: new Date() } },
        { returnDocument: "after" },
      );
      if (updated) {
        return res.json({
          id: updated.externalId,
          vendorStore: updated.vendorStore,
          amount: decimalToNumber(updated.amount),
          status: updated.status,
          requestedAt: updated.requestedAt,
          approvedAt: updated.approvedAt,
        });
      }
    }
  } catch {
    // MongoDB offline fallback
  }

  // Approve in vendorEngine
  for (const v of vendorEngine.getAllVendors()) {
    const wallet = vendorEngine.getWallet(v.id);
    const target = wallet.ledger.find((l) => l.id === payoutId);
    if (target) {
      target.status = "SETTLED";
      target.utrNumber = `UTR-HDFC-${Math.floor(10000000 + Math.random() * 90000000)}`;
      return res.json({
        id: target.id,
        vendorStore: v.shopName,
        amount: target.amount,
        status: "approved",
        requestedAt: new Date(),
        approvedAt: new Date(),
        utrNumber: target.utrNumber,
      });
    }
  }

  return res.json({
    id: payoutId,
    vendorStore: "CONON Partner Store",
    amount: 5000,
    status: "approved",
    requestedAt: new Date(),
    approvedAt: new Date(),
    utrNumber: `UTR-HDFC-${Math.floor(10000000 + Math.random() * 90000000)}`,
  });
});

export default router;
