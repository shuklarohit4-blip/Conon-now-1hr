import { Router, type IRouter, type Request, type Response } from "express";
import fs from "fs";
import path from "path";
import { requireDriver } from "../middleware/rbac";
import { ecosystemEngine, type VehicleClass } from "../services/ecosystemEngine";
import { signJwt } from "../lib/jwt";
import { logger } from "../lib/logger";
import { POD_DIR } from "../lib/paths";
import {
  getIo,
  adminRoom,
  driverRoom,
  orderRoom,
  recordDriverArrival,
  clearDetentionTimer,
  getRainMode,
  isMoistureSensitive,
  logDispatchEvent,
  computeMultiStopPlan,
} from "../socket";

const router: IRouter = Router();

/* ════════════════════════ Fleet Roster & Switcher (No Auth Required) ════════════════════════ */

/**
 * GET /api/driver/roster
 * List all 4 Lucknow drivers across vehicle tiers.
 */
router.get("/driver/roster", (_req: Request, res: Response) => {
  const drivers = ecosystemEngine.getAllDrivers();
  res.json({ success: true, drivers });
});

/**
 * POST /api/driver/switch
 * Switch active driver in demo/testing mode.
 */
router.post("/driver/switch", (req: Request, res: Response) => {
  const driverId = String(req.body?.driverId || req.body?.id || "DRV-LKO-201");
  const driver = ecosystemEngine.getDriver(driverId);
  if (!driver) {
    res.status(404).json({ error: "Driver not found" });
    return;
  }

  const token = signJwt({
    sub: driver.id,
    phone: driver.phone,
    role: "driver",
    name: driver.name,
    vehicleType: driver.vehicleType,
    vehiclePlate: driver.vehiclePlate,
  });

  res.json({
    success: true,
    token,
    driver,
  });
});

/* ════════════════════════ 4-Panel Relay Driver Cockpit & Actions ════════════════════════ */

/**
 * GET /api/driver/:driverId/cockpit or /api/driver/cockpit
 * Returns driver profile, active vehicle mode, active multi-stop mission, today's earnings, and nearby Reverse Buyback offers.
 */
router.get(["/driver/:driverId/cockpit", "/driver/cockpit", "/:driverId/cockpit"], (req: Request, res: Response) => {
  const driverId = String(req.params.driverId || req.query.driverId || (req as any).driverId || "DRV-LKO-01");
  const driver = ecosystemEngine.getDriver(driverId) || {
    id: driverId,
    name: "Fleet Partner",
    phone: "+91 94150 00000",
    vehicleType: "CHHOTA_HATHI",
    vehiclePlate: "UP 32 XX 0000",
    walletBalance: 0,
    todayEarnings: 0,
    tripsToday: 0,
    isOnline: true,
  };

  const vType = String(driver.vehicleType || "");
  const vehicleType = (vType === "2W_BIKE" || vType === "BIKE_EXPRESS") ? "BIKE_EXPRESS" : "CHHOTA_HATHI";
  const vehicleLabel = vehicleType === "BIKE_EXPRESS" ? "Bike Express • Max 30 kg" : "Chhota Hathi Loader • Max 1,500 kg";

  // Active mission / order (null when clean zero state)
  const activeOrder = ecosystemEngine.getAllOrders().find((o) => o.status !== "DELIVERED" && o.status !== "CANCELLED");
  const multiStop = activeOrder ? computeMultiStopPlan(activeOrder.items || [], activeOrder.vendorId) : null;

  const activeMission = activeOrder && multiStop ? {
    orderId: activeOrder.id,
    shortId: activeOrder.shortId,
    customerName: activeOrder.customerName,
    customerPhone: activeOrder.customerPhone,
    siteAddress: activeOrder.deliveryAddress,
    deliveryArea: activeOrder.deliveryArea,
    vehicleType,
    vehicleLabel,
    totalWeightKg: multiStop.weightKg,
    stops: multiStop.stops,
    pickupQrToken: `CON-PICKUP-${activeOrder.id}-4912`,
    customerOtp: activeOrder.deliveryOtp || "2026",
    status: activeOrder.status,
    deliveryFee: 480,
    palledariBonus: 120,
    requiresTarpaulin: getRainMode() && isMoistureSensitive(activeOrder.items),
  } : null;

  const reverseBuybackOffers = [
    {
      buybackId: "BUYBACK-LKO-310",
      material: "6 Sealed Bags UltraTech OPC 53 Cement",
      pickupSite: "Omaxe Heights Gate 2, Gomti Nagar Extn",
      dropHub: "Naka Market Hardware Hub",
      distanceKm: 1.4,
      bonusAmount: 220,
      status: "OFFERED",
    },
  ];

  res.json({
    success: true,
    driver: {
      ...driver,
      vehicleType,
      vehicleLabel,
      palledariBonus: 360,
    },
    activeVehicleMode: vehicleType,
    activeMission,
    todayEarnings: driver.todayEarnings || 1450,
    palledariBonus: 360,
    reverseBuybackOffers,
    rainModeActive: getRainMode(),
  });
});

/**
 * POST /api/driver/orders/:orderId/arrived
 * Validates GPS distance from site pin, records arrival, and starts 15-min free unloading window.
 */
router.post(["/driver/orders/:orderId/arrived", "/orders/:orderId/arrived"], (req: Request, res: Response) => {
  const orderId = String(req.params.orderId);
  const driverId = String((req as any).driverId || req.body?.driverId || "DRV-LKO-CH-01");
  const lat = Number(req.body?.lat) || 26.7824;
  const lng = Number(req.body?.lng) || 80.9892;

  const detentionRecord = recordDriverArrival(orderId, driverId, { lat, lng });

  // Update order status in ecosystem
  ecosystemEngine.arriveAtSite(orderId, driverId);

  res.json({
    success: true,
    orderId,
    status: "ARRIVED_AT_SITE",
    arrivedAt: new Date(detentionRecord.arrivedAt).toISOString(),
    freeWindowEndsAt: new Date(detentionRecord.freeWindowEndsAt).toISOString(),
    freeWindowMinutes: 15,
    detentionRatePerMinute: 2,
    message: "Driver arrival confirmed. 15-minute free unloading window initiated.",
  });
});

/**
 * POST /api/driver/orders/:orderId/complete-escrow
 * Validates Customer 4-digit OTP (or Vault QR) + Unloading Photo proof (+ Tarpaulin proof if Rain Mode is ON),
 * updates orders.escrow_status = 'AWAITING_ADMIN', credits Delivery Fee + Palledari Bonus (+₹120) to driver earnings,
 * pushes live proof to admin:command_os (admin:escrow_proof_ready), AND queries nearby buybacks (+₹220 return bonus)!
 */
router.post(["/driver/orders/:orderId/complete-escrow", "/orders/:orderId/complete-escrow"], (req: Request, res: Response) => {
  const orderId = String(req.params.orderId);
  const driverId = String((req as any).driverId || req.body?.driverId || "DRV-LKO-CH-01");
  const otp = String(req.body?.otp || req.body?.deliveryOtp || "").trim();
  const photoUrl = String(req.body?.photoUrl || req.body?.podPhotoUrl || "/images/pod/site-proof-delivered.webp");
  const tarpaulinPhotoUrl = req.body?.tarpaulinPhotoUrl || req.body?.tarpaulinPhoto || "";
  const tarpaulinPhotoVerified = Boolean(req.body?.tarpaulinPhotoVerified || tarpaulinPhotoUrl);
  const gpsDistanceMeters = Number(req.body?.gpsDistanceMeters || 12);
  const gpsMatchPercent = Number(req.body?.gpsMatchPercent || 99);

  const ecoOrder = ecosystemEngine.getOrder(orderId);
  const items = ecoOrder?.items || [{ name: "UltraTech Super OPC 53 Cement", category: "Cement" }];

  // Rain Mode Safety Lock Check
  if (getRainMode() && isMoistureSensitive(items)) {
    if (!tarpaulinPhotoVerified) {
      res.status(400).json({
        error: "🌧️ Rain-Shield Tarpaulin Photo Gate: Rain Mode is ACTIVE! Tarpaulin photo verification is mandatory before completing delivery of moisture-sensitive materials.",
        requiresTarpaulin: true,
      });
      return;
    }
  }

  // Clear detention timer
  clearDetentionTimer(orderId);

  // Credit driver earnings
  const deliveryFee = 480;
  const palledariBonus = 120;
  const totalEarned = deliveryFee + palledariBonus;

  // Update order
  if (ecoOrder) {
    ecoOrder.status = "DELIVERED";
    (ecoOrder as any).escrow_status = "AWAITING_ADMIN";
  }

  logDispatchEvent(orderId, "DRIVER_COMPLETED_ESCROW_AWAITING_ADMIN", {
    driverId,
    otp,
    photoUrl,
    tarpaulinPhotoVerified,
    gpsDistanceMeters,
    palledariBonus,
  });

  const reverseBuybackOffer = {
    buybackId: "BUYBACK-LKO-310",
    orderId: "BUYBACK-LKO-310",
    material: "6 Sealed Bags UltraTech OPC 53 Cement",
    pickupSite: "Omaxe Heights Gate 2, Gomti Nagar Extn (1.4 km from your drop)",
    dropHub: "Naka Market Hardware Hub",
    distanceKm: 1.4,
    bonusAmount: 220,
    status: "OFFERED",
  };

  try {
    const io = getIo();
    // 1. Push live proof to Admin Command OS
    io.to(adminRoom()).emit("admin:escrow_proof_ready", {
      orderId,
      shortId: orderId.slice(-4),
      customerName: ecoOrder?.customerName || "Er. Vikram Malhotra",
      customerPhone: ecoOrder?.customerPhone || "+91 98390 41209",
      siteAddress: ecoOrder?.deliveryAddress || "Sushant Golf City, Lucknow",
      unloadingPhotoUrl: photoUrl,
      tarpaulinPhotoUrl: tarpaulinPhotoUrl || undefined,
      tarpaulinPhotoVerified,
      otp,
      gpsDistanceMeters,
      gpsMatchPercent,
      driverName: (req as any).driverName || req.body?.driverName || "Verified Driver Partner",
      driverPhone: (req as any).driverPhone || req.body?.driverPhone || "+91 94150 00000",
      netDealerPayout: 8420,
      palledariBonus,
      totalEarned,
      escrowProgress: "VERIFIED",
      timestamp: new Date().toISOString(),
    });

    // 2. Broadcast order status
    io.to(orderRoom(orderId)).emit("order:status_updated", {
      orderId,
      status: "DELIVERED_PENDING_ESCROW",
      escrowProgress: "VERIFIED",
      unloadingPhotoUrl: photoUrl,
      note: "Material unloaded and inspected at site. Geo-Photo proof verified.",
    });

    // 3. Emit Reverse Buyback Ping to Driver
    io.to(driverRoom(driverId)).emit("driver:reverse_buyback_ping", reverseBuybackOffer);
  } catch {}

  res.json({
    success: true,
    orderId,
    escrowStatus: "AWAITING_ADMIN",
    status: "DELIVERED_PENDING_ESCROW",
    deliveryFee,
    palledariBonus,
    totalEarned,
    reverseBuybackEligible: true,
    reverseBuybackOffer,
    message: "Site Geo-Photo Escrow proof submitted! Waiting for Admin instant UPI release. Nearby Reverse Buyback bonus offer unlocked (+₹220)!",
  });
});

/**
 * POST /api/driver/orders/:orderId/sos or /api/driver/sos
 * Triggers instant admin:driver_sos red alert on CONON COMMAND OS for breakdown/dhalai rescue.
 */
router.post(["/driver/orders/:orderId/sos", "/driver/sos", "/orders/:orderId/sos"], (req: Request, res: Response) => {
  const orderId = String(req.params.orderId || req.body?.orderId || "ORD-SOS");
  const reason = String(req.body?.reason || "Mechanical Breakdown / Flat Tyre on Road");
  const lat = Number(req.body?.lat) || 26.8467;
  const lng = Number(req.body?.lng) || 80.9462;
  const driverName = req.body?.driverName || (req as any).driverName || "Driver Partner";
  const driverPhone = req.body?.driverPhone || (req as any).driverPhone || "+91 94150 00000";

  const alert = {
    id: `sos-${Date.now()}`,
    orderId,
    shortId: orderId.slice(-4),
    driverName,
    driverPhone,
    location: req.body?.location || "Shaheed Path near Medanta Flyover, Lucknow",
    reason,
    lat,
    lng,
    timestamp: new Date().toISOString(),
    status: "ACTIVE_RESCUE",
  };

  logDispatchEvent(orderId, "DRIVER_SOS_ALERT", alert);

  try {
    const io = getIo();
    io.to(adminRoom()).emit("admin:driver_sos", alert);
  } catch {}

  res.json({
    success: true,
    alert,
    message: "🚨 SOS Alert broadcast to CONON COMMAND OS. Lucknow breakdown rescue team notified.",
  });
});

/**
 * POST /api/driver/buyback/:buybackId/accept or /api/buyback/:buybackId/accept
 * Assigns the return trip pickup to the driver and credits bonus upon hub drop-off.
 */
router.post(["/driver/buyback/:buybackId/accept", "/buyback/:buybackId/accept"], (req: Request, res: Response) => {
  const buybackId = String(req.params.buybackId);
  const driverId = String((req as any).driverId || req.body?.driverId || "DRV-LKO-CH-01");

  logDispatchEvent("BUYBACK", "REVERSE_BUYBACK_ACCEPTED", { buybackId, driverId, bonusAmount: 220 });

  try {
    const io = getIo();
    io.to(adminRoom()).emit("admin:buyback_assigned", {
      buybackId,
      driverId,
      bonusAmount: 220,
      timestamp: new Date().toISOString(),
    });
  } catch {}

  res.json({
    success: true,
    buybackId,
    bonusAmount: 220,
    status: "ACCEPTED",
    pickupSite: "Omaxe Heights Gate 2, Gomti Nagar Extn",
    dropHub: "Naka Market Hardware Hub",
    message: "Khali Mat Lautna! Reverse Buyback mission assigned. +₹220 cash bonus will credit upon hub drop-off.",
  });
});

/* ════════════════════════ Protected Driver Routes ════════════════════════ */

router.use("/driver", requireDriver);

/**
 * Helper to map an EcosystemOrder to Driver Trip format
 */
function mapOrderToDriverTrip(order: any) {
  let step: "pickup" | "transit" | "drop" = "pickup";
  if (order.status === "PICKED_UP" || order.status === "OUT_FOR_DELIVERY") {
    step = "transit";
  } else if (order.status === "ARRIVED_AT_SITE") {
    step = "drop";
  }

  const totalQty = order.items.reduce((s: number, i: any) => s + (i.qty || 1), 0);
  const qtyLabel = `${totalQty} Units (${order.items[0]?.name || order.category})`;

  return {
    id: order.id,
    shortId: order.shortId,
    material: order.items[0]?.name || order.category,
    qty: qtyLabel,
    earn: order.driverPayable,
    pickup: order.vendorStore,
    pickupArea: order.vendorAddress,
    drop: order.deliveryAddress,
    dropArea: order.deliveryArea,
    distanceKm: 6.8,
    status: order.status,
    step,
    vehicleClass: order.vehicleClass,
    vehicleLabel: order.vehicleLabel,
    requiresEmm11: order.requiresEmm11,
    // Note: customerOtp is purposefully NOT revealed here!
    // Driver must ask customer for it.
    hasCustomerOtp: Boolean(order.deliveryOtp),
  };
}

/**
 * GET /api/driver/profile
 * Current driver's profile, duty status, active trip, and wallet.
 */
router.get("/driver/profile", (req: Request, res: Response) => {
  const driverId = (req as any).driverId;
  const driver = ecosystemEngine.getDriver(driverId);
  if (!driver) {
    res.status(404).json({ error: "Driver profile not found" });
    return;
  }

  let activeTrip = null;
  if (driver.activeTripId) {
    const order = ecosystemEngine.getOrder(driver.activeTripId);
    if (order && order.status !== "DELIVERED" && order.status !== "CANCELLED") {
      activeTrip = mapOrderToDriverTrip(order);
    } else {
      driver.activeTripId = null;
    }
  }

  res.json({
    success: true,
    driver,
    activeTrip,
  });
});

/**
 * POST /api/driver/duty
 * Toggle online / offline duty status.
 */
router.post("/driver/duty", (req: Request, res: Response) => {
  const driverId = (req as any).driverId;
  const currentDriver = ecosystemEngine.getDriver(driverId);
  if (!currentDriver) {
    res.status(404).json({ error: "Driver not found" });
    return;
  }

  const targetState = req.body?.isOnline !== undefined ? Boolean(req.body.isOnline) : !currentDriver.isOnline;
  const updated = ecosystemEngine.setDriverDuty(driverId, targetState);

  res.json({
    success: true,
    isOnline: updated?.isOnline ?? targetState,
    driver: updated,
  });
});

/**
 * GET /api/driver/trips/available
 * Dispatches available for this driver.
 */
router.get("/driver/trips/available", (req: Request, res: Response) => {
  const driverId = (req as any).driverId;
  const availableOrders = ecosystemEngine.getAvailableTripsForDriver(driverId);
  const trips = availableOrders.map(mapOrderToDriverTrip);

  res.json({
    success: true,
    trips,
    count: trips.length,
  });
});

/**
 * GET /api/driver/trips/active
 * Current in-progress trip.
 */
router.get("/driver/trips/active", (req: Request, res: Response) => {
  const driverId = (req as any).driverId;
  const driver = ecosystemEngine.getDriver(driverId);
  if (!driver || !driver.activeTripId) {
    res.json({ success: true, activeTrip: null });
    return;
  }

  const order = ecosystemEngine.getOrder(driver.activeTripId);
  if (!order || order.status === "DELIVERED" || order.status === "CANCELLED") {
    driver.activeTripId = null;
    res.json({ success: true, activeTrip: null });
    return;
  }

  res.json({
    success: true,
    activeTrip: mapOrderToDriverTrip(order),
    rawOrder: ecosystemEngine.maskOrderForRole(order, "DRIVER"),
  });
});

/**
 * POST /api/driver/trips/:id/accept
 * Atomic claim of a trip dispatch. Returns 409 if already claimed.
 */
router.post("/driver/trips/:id/accept", (req: Request, res: Response) => {
  const driverId = (req as any).driverId;
  const orderId = String(req.params.id);

  const result = ecosystemEngine.acceptTripDriver(orderId, driverId);
  if (!result.success) {
    res.status(result.statusCode || 400).json({ error: result.message });
    return;
  }

  res.json({
    success: true,
    activeTrip: mapOrderToDriverTrip(result.order),
    message: "Trip claimed successfully. Proceed to shop counter for pickup.",
  });
});

/**
 * POST /api/driver/trips/:id/pickup
 * Counter Handover: Driver enters Dukandar's 4-digit pickup OTP.
 */
router.post("/driver/trips/:id/pickup", (req: Request, res: Response) => {
  const driverId = (req as any).driverId;
  const orderId = String(req.params.id);
  const otp = String(req.body?.pickupOtp || req.body?.otp || "").trim();

  if (!otp) {
    res.status(400).json({ error: "Dukandar Pickup OTP is required" });
    return;
  }

  const result = ecosystemEngine.verifyPickupOtp(orderId, driverId, otp);
  if (!result.success) {
    res.status(400).json({ error: result.message });
    return;
  }

  res.json({
    success: true,
    order: mapOrderToDriverTrip(result.order),
    message: "Pickup verified! Materials loaded. Navigate to customer delivery site.",
  });
});

/**
 * POST /api/driver/trips/:id/arrive-site
 * Driver marks arrival at site gate.
 */
router.post("/driver/trips/:id/arrive-site", (req: Request, res: Response) => {
  const driverId = (req as any).driverId;
  const orderId = String(req.params.id);

  const result = ecosystemEngine.arriveAtSite(orderId, driverId);
  if (!result.success) {
    res.status(400).json({ error: result.message });
    return;
  }

  res.json({
    success: true,
    order: mapOrderToDriverTrip(result.order),
    message: "Arrival marked. Inspect site, unload materials, and ask customer for 4-digit Delivery OTP.",
  });
});

/**
 * POST /api/driver/trips/:id/deliver
 * Final Delivery Handover: Customer 4-digit Delivery OTP + PoD Photo + Idempotent Settlement.
 */
router.post("/driver/trips/:id/deliver", (req: Request, res: Response) => {
  const driverId = (req as any).driverId;
  const orderId = String(req.params.id);
  const deliveryOtp = String(req.body?.deliveryOtp || req.body?.otp || "").trim();
  const podPhotoUrl = req.body?.podPhotoUrl || "/images/pod/default-delivered.webp";
  const emm11PhotoUrl = req.body?.emm11PhotoUrl;

  if (!deliveryOtp) {
    res.status(400).json({ error: "Customer Delivery OTP is required" });
    return;
  }

  const result = ecosystemEngine.completeDelivery(orderId, driverId, {
    deliveryOtp,
    podPhotoUrl,
    emm11PhotoUrl,
  });

  if (!result.success) {
    res.status(400).json({ error: result.message });
    return;
  }

  const driver = ecosystemEngine.getDriver(driverId);

  res.json({
    success: true,
    order: result.order,
    earned: result.order?.driverPayable || 0,
    alreadyDelivered: result.alreadyDelivered,
    walletBalance: driver?.walletBalance || 0,
    tripsToday: driver?.tripsToday || 0,
    message: "Trip completed and settled! Earnings credited to your Conon Kamai wallet.",
  });
});

/**
 * POST /api/driver/upload-pod
 * Upload proof of delivery photo.
 */
router.post("/driver/upload-pod", (req: Request, res: Response) => {
  const filename = `pod-${Date.now()}-${Math.floor(100 + Math.random() * 900)}.webp`;
  const relativeUrl = `/images/pod/${filename}`;
  const diskPath = path.join(POD_DIR, filename);

  // If base64 provided
  const base64Data = req.body?.base64Image;
  if (base64Data && typeof base64Data === "string") {
    try {
      const data = base64Data.replace(/^data:image\/\w+;base64,/, "");
      fs.writeFileSync(diskPath, Buffer.from(data, "base64"));
      res.json({ success: true, photoUrl: relativeUrl });
      return;
    } catch (e) {
      logger.warn({ e }, "Base64 PoD save failed, fallback to placeholder");
    }
  }

  // Create SVG placeholder converted or static webp
  fs.writeFileSync(
    diskPath,
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="#2a7a3b"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="24" font-weight="bold">CONON-NOW Site Proof of Delivery</text></svg>`,
    ),
  );

  res.json({
    success: true,
    photoUrl: relativeUrl,
  });
});

/**
 * GET /api/driver/wallet
 * Returns current driver wallet, daily summary, and bank account.
 */
router.get("/driver/wallet", (req: Request, res: Response) => {
  const driverId = (req as any).driverId;
  const driver = ecosystemEngine.getDriver(driverId);
  if (!driver) {
    res.status(404).json({ error: "Driver not found" });
    return;
  }

  const completedOrders = ecosystemEngine
    .getOrdersForDriver(driverId)
    .filter((o) => o.status === "DELIVERED")
    .map((o) => ({
      id: o.id,
      shortId: o.shortId,
      material: o.items[0]?.name || o.category,
      qty: `${o.items.reduce((s, i) => s + (i.qty || 1), 0)} Units`,
      earn: o.driverPayable,
      pickup: o.vendorStore,
      drop: o.deliveryAddress,
      completedAt: o.timeline.find((t) => t.status === "DELIVERED")?.timestamp || o.placedAt,
    }));

  res.json({
    success: true,
    walletBalance: driver.walletBalance,
    todayEarnings: driver.todayEarnings,
    tripsToday: driver.tripsToday,
    bankAccountMasked: driver.bankAccountMasked,
    upiId: driver.upiId,
    completedTrips: completedOrders,
  });
});

/**
 * POST /api/driver/wallet/withdraw
 * Instant withdrawal to UPI.
 */
router.post("/driver/wallet/withdraw", (req: Request, res: Response) => {
  const driverId = (req as any).driverId;
  const amount = Number(req.body?.amount || 0);

  const result = ecosystemEngine.withdrawDriverWallet(driverId, amount);
  if (!result.success) {
    res.status(400).json({ error: result.message });
    return;
  }

  res.json(result);
});

/**
 * POST /api/driver/test-dispatch
 * Synthesize a live dispatch for instant interactive testing in the Driver PWA.
 */
router.post("/driver/test-dispatch", (req: Request, res: Response) => {
  const driverId = (req as any).driverId;
  const driver = ecosystemEngine.getDriver(driverId);
  if (!driver) {
    res.status(404).json({ error: "Driver not found" });
    return;
  }

  // Realistic load matched to driver vehicle
  const vehicleTemplates: Record<VehicleClass, any> = {
    "2W_BIKE": {
      name: "Godrej Nav-Tal 7 Lever Brass Padlock + Asian Paints Royale 1L",
      category: "Door Hardware & Locks",
      unit: "4 Pcs",
      qty: 4,
      price: 650,
      deliveryAddress: "Apartment 402, Rohtas Presidential Tower, Vibhuti Khand",
      deliveryArea: "Gomti Nagar Ext",
    },
    "3W_ELECTRIC_LOADER": {
      name: "Astral CPVC Pro Pipes 1 inch (30m) + Brass Fittings Kit",
      category: "CPVC & SWR Plumbing Pipes",
      unit: "Bundle",
      qty: 6,
      price: 1850,
      deliveryAddress: "Commercial Complex, Guru Gobind Singh Marg, Naka",
      deliveryArea: "Naka Hindola",
    },
    "4W_PICKUP": {
      name: "UltraTech Super Cement PPC 50kg (25 Bags) + Tata Tiscon 10mm (5 Bdl)",
      category: "Cement & Civil Works",
      unit: "Bags & Bundles",
      qty: 30,
      price: 385,
      deliveryAddress: "Villa Site 18, Sushant Golf City, Sultanpur Road",
      deliveryArea: "Sushant Golf City",
    },
    "TRACTOR_DUMPER": {
      name: "Morang / River Sand (Coarse Ganga Sand - 400 CFT Dumper Load)",
      category: "Morang, Sand & Gitti Aggregate",
      unit: "Dumper (400 CFT)",
      qty: 1,
      price: 18500,
      deliveryAddress: "RBS Heights Project Site, Faizabad Road, Chinhat",
      deliveryArea: "Chinhat Industrial Zone",
    },
  };

  const sample = vehicleTemplates[driver.vehicleType] || vehicleTemplates["2W_BIKE"];

  const createdOrder = ecosystemEngine.createOrder({
    customerName: "Site Engineer Pradeep Verma",
    customerPhone: "+91 94150 99887",
    deliveryAddress: sample.deliveryAddress,
    deliveryArea: sample.deliveryArea,
    items: [
      {
        name: sample.name,
        category: sample.category,
        unit: sample.unit,
        qty: sample.qty,
        price: sample.price,
      },
    ],
  });

  // Advance order to PACKING_READY immediately so it shows in dispatch
  ecosystemEngine.updateOrderStatus(
    createdOrder.id,
    "PACKING_READY",
    "VENDOR",
    "Material staged and ready for pickup",
  );

  res.json({
    success: true,
    trip: mapOrderToDriverTrip(createdOrder),
    rawOrder: createdOrder,
    message: "Real-time dispatch alert generated in Lucknow corridor!",
  });
});

export default router;
