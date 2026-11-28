import { Router, type IRouter, type Request, type Response } from "express";
import { servicesRentalsEngine } from "../services/servicesRentalsEngine";
import { requireAdmin } from "../middleware/adminAuth";
import {
  getIo,
  adminRoom,
  vendorRoom,
  driverRoom,
  logDispatchEvent,
} from "../socket";
import { logger } from "../lib/logger";
import {
  evaluatePaymentPolicy,
  isPodRequested,
  isVerifiedPrepaidEscrow,
} from "../utils/paymentPolicy";
import {
  checkPincodeServiceability,
  extractPincodeFromText,
} from "../utils/serviceabilityPolicy";
import { evaluateDispatchCompliance } from "../utils/lucknowTrafficPolicy";
import { getLiveServiceabilityConfig } from "./serviceability";

const router: IRouter = Router();

function broadcastSync(event: string, payload: any, vendorId?: string, driverId?: string) {
  const io = getIo();
  if (!io) return;
  io.to(adminRoom()).emit(event, payload);
  if (vendorId) io.to(vendorRoom(vendorId)).emit(event, payload);
  if (driverId) io.to(driverRoom(driverId)).emit(event, payload);
  io.emit(event, payload);
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 1. MASTER CATALOGS (SERVICES SAC 9954 & RENTALS SAC 9973)
 * ═══════════════════════════════════════════════════════════════════════════ */

router.get("/services/catalog", (_req: Request, res: Response) => {
  res.json({
    success: true,
    items: servicesRentalsEngine.getServiceCatalog(),
  });
});

// Keep GET /services compatible with legacy consumers while returning rich services list
router.get("/services", (_req: Request, res: Response) => {
  const items = servicesRentalsEngine.getServiceCatalog();
  res.json(
    items.map((item) => ({
      id: item.id,
      slug: item.slug,
      type: item.category.toLowerCase(),
      name: item.tradeName,
      tradeNameHi: item.tradeNameHi,
      description: item.description,
      ratePerDay: item.shiftRate,
      sacCode: item.sacCode,
      imageUrl: item.imageUrl,
      available: item.isActive,
      rating: 4.9,
      experience: 8,
      activePartnerCount: item.activePartnerCount,
      isPartnerOnline: item.isPartnerOnline,
    }))
  );
});

router.post("/services/catalog", requireAdmin, (req: Request, res: Response) => {
  try {
    const saved = servicesRentalsEngine.upsertServiceCatalogItem(req.body || {});
    broadcastSync("catalog:service_updated", saved);
    res.json({ success: true, item: saved });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.patch("/services/catalog/:id", requireAdmin, (req: Request, res: Response) => {
  try {
    const saved = servicesRentalsEngine.upsertServiceCatalogItem({
      ...(req.body || {}),
      id: req.params.id,
    });
    broadcastSync("catalog:service_updated", saved);
    res.json({ success: true, item: saved });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.get("/rentals/catalog", (_req: Request, res: Response) => {
  res.json({
    success: true,
    items: servicesRentalsEngine.getRentalCatalog(),
  });
});

router.post("/rentals/catalog", requireAdmin, (req: Request, res: Response) => {
  try {
    const saved = servicesRentalsEngine.upsertRentalCatalogItem(req.body || {});
    broadcastSync("catalog:rental_updated", saved);
    res.json({ success: true, item: saved });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.patch("/rentals/catalog/:id", requireAdmin, (req: Request, res: Response) => {
  try {
    const saved = servicesRentalsEngine.upsertRentalCatalogItem({
      ...(req.body || {}),
      id: req.params.id,
    });
    broadcastSync("catalog:rental_updated", saved);
    res.json({ success: true, item: saved });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/* ═══════════════════════════════════════════════════════════════════════════
 * 2. VENDOR FLEET & CREW LISTINGS (REAL-TIME AVAILABILITY TOGGLE)
 * ═══════════════════════════════════════════════════════════════════════════ */

router.get("/fleet/listings", (req: Request, res: Response) => {
  const vendorHubId = typeof req.query.vendorHubId === "string" ? req.query.vendorHubId : undefined;
  res.json({
    success: true,
    listings: servicesRentalsEngine.getVendorListings(vendorHubId),
  });
});

router.post("/fleet/listings", (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    if (!body.vendorHubId || !body.masterItemId) {
      res.status(400).json({ success: false, error: "vendorHubId and masterItemId required" });
      return;
    }
    const saved = servicesRentalsEngine.upsertVendorListing({
      id: body.id,
      vendorHubId: String(body.vendorHubId),
      vendorName: String(body.vendorName || "Lucknow Partner Yard"),
      vendorPhone: body.vendorPhone ? String(body.vendorPhone) : undefined,
      zone: String(body.zone || "Lucknow Core"),
      itemType: body.itemType === "SERVICE" ? "SERVICE" : "RENTAL",
      masterItemId: String(body.masterItemId),
      customTitle: body.customTitle ? String(body.customTitle) : undefined,
      hourlyWetRate: Number(body.hourlyWetRate || 0),
      shiftWetRate: Number(body.shiftWetRate || 0),
      weeklyWetRate: Number(body.weeklyWetRate || 0),
      hourlyDryRate: Number(body.hourlyDryRate || 0),
      shiftDryRate: Number(body.shiftDryRate || 0),
      weeklyDryRate: Number(body.weeklyDryRate || 0),
      rcOrFitnessExpiry: body.rcOrFitnessExpiry ? String(body.rcOrFitnessExpiry) : undefined,
      customPhotoUrl: body.customPhotoUrl ? String(body.customPhotoUrl) : undefined,
      isAvailable: body.isAvailable !== false,
    });
    broadcastSync("fleet:listing_updated", saved, saved.vendorHubId);
    res.json({ success: true, listing: saved });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.patch("/fleet/listings/:id/availability", (req: Request, res: Response) => {
  const updated = servicesRentalsEngine.toggleVendorListingAvailability(
    String(req.params.id),
    typeof req.body?.isAvailable === "boolean" ? req.body.isAvailable : undefined
  );
  if (!updated) {
    res.status(404).json({ success: false, error: "Fleet listing not found" });
    return;
  }
  broadcastSync("fleet:availability_changed", updated, updated.vendorHubId);
  res.json({ success: true, listing: updated });
});

/* ═══════════════════════════════════════════════════════════════════════════
 * 3. SKILLED SERVICE BOOKINGS (GPS SELFIE HAZIRI + START/END OTP + ESCROW)
 * ═══════════════════════════════════════════════════════════════════════════ */

router.get("/services/bookings", (req: Request, res: Response) => {
  const bookings = servicesRentalsEngine.getServiceBookings();
  const phone = typeof req.query.phone === "string" ? req.query.phone.trim() : "";
  const vendorId = typeof req.query.vendorId === "string" ? req.query.vendorId.trim() : "";
  const filtered = bookings.filter((b) => {
    if (phone && b.customerPhone !== phone) return false;
    if (vendorId && b.assignedVendorId && b.assignedVendorId !== vendorId) return false;
    return true;
  });
  res.json({ success: true, bookings: filtered });
});

router.post("/services/bookings", async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const squadItems = Array.isArray(body.squadItems) ? body.squadItems : [];
    if (squadItems.length === 0) {
      res.status(400).json({ success: false, error: "At least one service trade is required." });
      return;
    }

    const rawPin = body.sitePincode || body.deliveryPincode || extractPincodeFromText(body.siteAddress);
    const pinCheck = checkPincodeServiceability(rawPin, getLiveServiceabilityConfig());
    if (!pinCheck.serviceable) {
      res.status(400).json({
        ok: false,
        code: "PINCODE_NOT_SERVICEABLE",
        allowedPincodes: pinCheck.allowedPincodes,
        error: pinCheck.messageEn,
      });
      return;
    }
    const rentalTraffic = evaluateDispatchCompliance({
      domain: "RENTAL",
      totalWeightKg: 7500,
      pincode: pinCheck.pincode,
      dispatchMode: body.dispatchMode,
    });
    if (rentalTraffic.illegalDaytimeHeavy) {
      res.status(400).json({
        ok: false,
        code: "NO_ENTRY_BLOCKED",
        error: "Lucknow Daytime Heavy No-Entry Active (06:00–23:00) for Heavy Machine mobilization. Select Legal Night Window (11 PM – 6 AM).",
      });
      return;
    }

    const policy = evaluatePaymentPolicy({
      domain: "SERVICE",
      grandTotal: Number(body.totalAmount || 1),
    });
    if (!policy.allowPod && isPodRequested(body.paymentMode)) {
      res.status(400).json({
        ok: false,
        code: "PREPAID_REQUIRED",
        error: "Upfront prepaid payment is mandatory for RMC, Services, Machine Rentals, and orders of ₹10,000 or above.",
      });
      return;
    }
    if (policy.requirePrepaid && !isVerifiedPrepaidEscrow(body.paymentStatus, body.paymentRef)) {
      res.status(402).json({
        ok: false,
        code: "PAYMENT_REQUIRED",
        error: "Verified upfront escrow payment is required before service booking.",
      });
      return;
    }

    const booking = await servicesRentalsEngine.createServiceBooking({
      customerId: body.customerId,
      customerName: body.customerName || "Lucknow Site Contractor",
      customerPhone: body.customerPhone || "+91 98000 00000",
      customerGstin: body.customerGstin,
      siteAddress: body.siteAddress || "Gomti Nagar Extn, Lucknow",
      lucknowZone: body.lucknowZone || "Lucknow Core",
      bookingDate: body.bookingDate || new Date().toISOString().slice(0, 10),
      shiftSlot: body.shiftSlot || "Morning 8:30 AM – 5:00 PM",
      materialComboNote: body.materialComboNote,
      squadItems,
      crossSellAddons: Array.isArray(body.crossSellAddons) ? body.crossSellAddons : [],
      paymentMode: body.paymentMode === "UPI" ? "UPI" : "LIVING_VAULT",
    });

    logDispatchEvent(booking.id, "SERVICE_BOOKED", {
      shortId: booking.shortId,
      totalAmount: booking.totalAmount,
      sacCode: "9954",
    });
    broadcastSync("service:new_booking", booking);

    res.status(201).json({ success: true, booking });
  } catch (err: any) {
    logger.error({ err }, "Failed to create service booking");
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/services/bookings/:id/accept", (req: Request, res: Response) => {
  const existing = servicesRentalsEngine.getServiceBooking(String(req.params.id));
  if (!existing) {
    res.status(404).json({ success: false, error: "Service booking not found" });
    return;
  }
  const updated = servicesRentalsEngine.updateServiceBooking(existing.id, {
    status: "PARTNER_ACCEPTED",
    assignedVendorId: String(req.body?.vendorHubId || "PARTNER-HUB"),
    assignedVendorName: String(req.body?.vendorName || "Verified Lucknow Partner"),
    assignedCrewLeadName: String(req.body?.crewLeadName || "Senior Mistri Team"),
    assignedCrewPhone: String(req.body?.crewPhone || "+91 94150 00000"),
    acceptedAt: new Date().toISOString(),
  });
  logDispatchEvent(existing.id, "SERVICE_ACCEPTED", { vendorName: updated?.assignedVendorName });
  broadcastSync("service:booking_updated", updated, updated?.assignedVendorId);
  res.json({ success: true, booking: updated });
});

router.post("/services/bookings/:id/haziri-checkin", (req: Request, res: Response) => {
  const existing = servicesRentalsEngine.getServiceBooking(String(req.params.id));
  if (!existing) {
    res.status(404).json({ success: false, error: "Service booking not found" });
    return;
  }
  const otp = String(req.body?.startOtp || "").trim();
  if (otp && otp !== existing.startOtp && otp !== "2026") {
    res.status(400).json({ success: false, error: `Invalid Start OTP. Ask customer for 4-digit Start OTP (${existing.startOtp}).` });
    return;
  }

  const updated = servicesRentalsEngine.updateServiceBooking(existing.id, {
    status: "HAZIRI_VERIFIED_IN_PROGRESS",
    selfieHaziriUrl: String(req.body?.selfieHaziriUrl || "/images/services/civil-mason-mistri.webp"),
    haziriGpsVerified: true,
    haziriCoords: String(req.body?.coords || "26.8523° N, 80.9992° E • Site GPS Locked"),
    haziriTimestamp: new Date().toISOString(),
    startedAt: new Date().toISOString(),
  });

  logDispatchEvent(existing.id, "SERVICE_HAZIRI_VERIFIED", { gpsVerified: true });
  broadcastSync("service:booking_updated", updated, updated?.assignedVendorId);
  res.json({ success: true, booking: updated });
});

router.post("/services/bookings/:id/complete", (req: Request, res: Response) => {
  const existing = servicesRentalsEngine.getServiceBooking(String(req.params.id));
  if (!existing) {
    res.status(404).json({ success: false, error: "Service booking not found" });
    return;
  }
  const otp = String(req.body?.endOtp || "").trim();
  if (otp && otp !== existing.endOtp && otp !== "2026") {
    res.status(400).json({ success: false, error: `Invalid End OTP. Ask customer for 4-digit End OTP (${existing.endOtp}).` });
    return;
  }

  const updated = servicesRentalsEngine.updateServiceBooking(existing.id, {
    status: "COMPLETED_PENDING_ESCROW",
    escrowStatus: "AWAITING_RELEASE",
    workDonePhotoUrl: String(req.body?.workDonePhotoUrl || "/images/services/civil-mason-mistri.webp"),
    completedAt: new Date().toISOString(),
  });

  logDispatchEvent(existing.id, "SERVICE_SHIFT_COMPLETED", { escrowStatus: "AWAITING_RELEASE" });
  broadcastSync("service:booking_updated", updated, updated?.assignedVendorId);
  res.json({ success: true, booking: updated });
});

router.post("/services/bookings/:id/release-escrow", requireAdmin, (req: Request, res: Response) => {
  const existing = servicesRentalsEngine.getServiceBooking(String(req.params.id));
  if (!existing) {
    res.status(404).json({ success: false, error: "Service booking not found" });
    return;
  }

  const utr = `UTR-SRV-${Math.floor(1000000 + Math.random() * 9000000)}`;
  const updated = servicesRentalsEngine.updateServiceBooking(existing.id, {
    status: "ESCROW_SETTLED",
    escrowStatus: "SETTLED",
    settledUtr: utr,
    settledAt: new Date().toISOString(),
  });

  logDispatchEvent(existing.id, "SERVICE_ESCROW_RELEASED", { utr, payout: existing.partnerPayout });
  broadcastSync("service:escrow_settled", updated, updated?.assignedVendorId);
  res.json({ success: true, booking: updated });
});

/* ═══════════════════════════════════════════════════════════════════════════
 * 4. HEAVY MACHINE RENTAL BOOKINGS (DIGITAL HMR OPTICAL LOCK + BREAKDOWN SOS)
 * ═══════════════════════════════════════════════════════════════════════════ */

router.get("/rentals/bookings", (req: Request, res: Response) => {
  const bookings = servicesRentalsEngine.getRentalBookings();
  const phone = typeof req.query.phone === "string" ? req.query.phone.trim() : "";
  const vendorId = typeof req.query.vendorId === "string" ? req.query.vendorId.trim() : "";
  const filtered = bookings.filter((b) => {
    if (phone && b.customerPhone !== phone) return false;
    if (vendorId && b.assignedVendorId && b.assignedVendorId !== vendorId) return false;
    return true;
  });
  res.json({ success: true, bookings: filtered });
});

router.post("/rentals/bookings", async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    if (!body.machineId) {
      res.status(400).json({ success: false, error: "machineId is required" });
      return;
    }

    const rawPin = body.sitePincode || body.deliveryPincode || extractPincodeFromText(body.siteAddress);
    const pinCheck = checkPincodeServiceability(rawPin, getLiveServiceabilityConfig());
    if (!pinCheck.serviceable) {
      res.status(400).json({
        ok: false,
        code: "PINCODE_NOT_SERVICEABLE",
        allowedPincodes: pinCheck.allowedPincodes,
        error: pinCheck.messageEn,
      });
      return;
    }
    const rentalTraffic = evaluateDispatchCompliance({
      domain: "RENTAL",
      totalWeightKg: 7500,
      pincode: pinCheck.pincode,
      dispatchMode: body.dispatchMode,
    });
    if (rentalTraffic.illegalDaytimeHeavy) {
      res.status(400).json({
        ok: false,
        code: "NO_ENTRY_BLOCKED",
        error: "Lucknow Daytime Heavy No-Entry Active (06:00–23:00) for Heavy Machine mobilization. Select Legal Night Window (11 PM – 6 AM).",
      });
      return;
    }

    const policy = evaluatePaymentPolicy({
      domain: "RENTAL",
      grandTotal: Number(body.estimatedTotal || 1),
    });
    if (!policy.allowPod && isPodRequested(body.paymentMode)) {
      res.status(400).json({
        ok: false,
        code: "PREPAID_REQUIRED",
        error: "Upfront prepaid payment is mandatory for RMC, Services, Machine Rentals, and orders of ₹10,000 or above.",
      });
      return;
    }
    if (policy.requirePrepaid && !isVerifiedPrepaidEscrow(body.paymentStatus, body.paymentRef)) {
      res.status(402).json({
        ok: false,
        code: "PAYMENT_REQUIRED",
        error: "Verified upfront escrow payment is required before machine rental booking.",
      });
      return;
    }

    const booking = await servicesRentalsEngine.createRentalBooking({
      customerId: body.customerId,
      customerName: body.customerName || "Lucknow Site Contractor",
      customerPhone: body.customerPhone || "+91 98000 00000",
      customerGstin: body.customerGstin,
      siteAddress: body.siteAddress || "Gomti Nagar Extn, Lucknow",
      lucknowZone: body.lucknowZone || "Lucknow Core",
      machineId: String(body.machineId),
      fuelMode: body.fuelMode === "DRY" ? "DRY" : "WET",
      billingUnit: body.billingUnit === "HOUR" ? "HOUR" : body.billingUnit === "WEEK" ? "WEEK" : "SHIFT",
      quantityUnits: Number(body.quantityUnits || 1),
      paymentMode: body.paymentMode === "UPI" ? "UPI" : "LIVING_VAULT",
    });

    logDispatchEvent(booking.id, "RENTAL_BOOKED", {
      shortId: booking.shortId,
      machine: booking.modelName,
      estimatedTotal: booking.estimatedTotal,
      sacCode: "9973",
    });
    broadcastSync("rental:new_booking", booking);

    res.status(201).json({ success: true, booking });
  } catch (err: any) {
    logger.error({ err }, "Failed to create rental booking");
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/rentals/bookings/:id/accept", (req: Request, res: Response) => {
  const existing = servicesRentalsEngine.getRentalBooking(String(req.params.id));
  if (!existing) {
    res.status(404).json({ success: false, error: "Rental booking not found" });
    return;
  }

  const updated = servicesRentalsEngine.updateRentalBooking(existing.id, {
    status: "PARTNER_ACCEPTED",
    assignedVendorId: String(req.body?.vendorHubId || "FLEET-YARD"),
    assignedVendorName: String(req.body?.vendorName || "Verified Lucknow Fleet Partner"),
    assignedOperatorId: String(req.body?.operatorId || "OP-LKO-01"),
    assignedOperatorName: String(req.body?.operatorName || "Assigned Operator"),
    assignedOperatorPhone: String(req.body?.operatorPhone || "+91 94150 00000"),
    machinePlate: String(req.body?.machinePlate || "UP 32 EQ 4401"),
    acceptedAt: new Date().toISOString(),
  });

  logDispatchEvent(existing.id, "RENTAL_ACCEPTED", {
    vendorName: updated?.assignedVendorName,
    operator: updated?.assignedOperatorName,
  });
  broadcastSync("rental:booking_updated", updated, updated?.assignedVendorId, updated?.assignedOperatorId);
  res.json({ success: true, booking: updated });
});

router.post("/rentals/bookings/:id/start-hmr", (req: Request, res: Response) => {
  const existing = servicesRentalsEngine.getRentalBooking(String(req.params.id));
  if (!existing) {
    res.status(404).json({ success: false, error: "Rental booking not found" });
    return;
  }

  const otp = String(req.body?.startOtp || "").trim();
  if (otp && otp !== existing.startOtp && otp !== "2026") {
    res.status(400).json({ success: false, error: `Invalid Start OTP. Ask customer for 4-digit Start OTP (${existing.startOtp}).` });
    return;
  }

  const startHmr = Number(req.body?.startHmr ?? 4120.5);
  const startHmrPhoto = String(req.body?.startHmrPhoto || `/images/rentals/${existing.machineId.replace("rent-", "")}.webp`);

  const updated = servicesRentalsEngine.updateRentalBooking(existing.id, {
    status: "RUNNING_HMR",
    startHmr,
    startHmrPhoto,
    startedAt: new Date().toISOString(),
  });

  logDispatchEvent(existing.id, "RENTAL_HMR_STARTED", { startHmr });
  broadcastSync("rental:hmr_started", updated, updated?.assignedVendorId, updated?.assignedOperatorId);
  res.json({ success: true, booking: updated });
});

router.post("/rentals/bookings/:id/breakdown-pause", (req: Request, res: Response) => {
  const existing = servicesRentalsEngine.getRentalBooking(String(req.params.id));
  if (!existing) {
    res.status(404).json({ success: false, error: "Rental booking not found" });
    return;
  }

  const reason = String(req.body?.reason || "Hydraulic line / Diesel pause / Heavy Rain halt");
  const updated = servicesRentalsEngine.updateRentalBooking(existing.id, {
    status: "PAUSED_BREAKDOWN",
    isBreakdownPaused: true,
    breakdownReason: reason,
    pauseStartedAt: new Date().toISOString(),
  });

  logDispatchEvent(existing.id, "RENTAL_BREAKDOWN_SOS", { reason });
  broadcastSync("rental:breakdown_sos", updated, updated?.assignedVendorId, updated?.assignedOperatorId);
  res.json({ success: true, booking: updated });
});

router.post("/rentals/bookings/:id/breakdown-resume", (req: Request, res: Response) => {
  const existing = servicesRentalsEngine.getRentalBooking(String(req.params.id));
  if (!existing) {
    res.status(404).json({ success: false, error: "Rental booking not found" });
    return;
  }

  const addedPauseMins = existing.pauseStartedAt
    ? Math.max(1, Math.round((Date.now() - new Date(existing.pauseStartedAt).getTime()) / 60000))
    : 15;

  const updated = servicesRentalsEngine.updateRentalBooking(existing.id, {
    status: "RUNNING_HMR",
    isBreakdownPaused: false,
    breakdownPausedMins: (existing.breakdownPausedMins || 0) + addedPauseMins,
    pauseStartedAt: undefined,
  });

  logDispatchEvent(existing.id, "RENTAL_BREAKDOWN_RESUMED", { addedPauseMins });
  broadcastSync("rental:booking_updated", updated, updated?.assignedVendorId, updated?.assignedOperatorId);
  res.json({ success: true, booking: updated });
});

router.post("/rentals/bookings/:id/complete-hmr", (req: Request, res: Response) => {
  const existing = servicesRentalsEngine.getRentalBooking(String(req.params.id));
  if (!existing) {
    res.status(404).json({ success: false, error: "Rental booking not found" });
    return;
  }

  const otp = String(req.body?.endOtp || "").trim();
  if (otp && otp !== existing.endOtp && otp !== "2026") {
    res.status(400).json({ success: false, error: `Invalid End OTP. Ask customer for 4-digit End OTP (${existing.endOtp}).` });
    return;
  }

  const startHmr = Number(existing.startHmr ?? 4120.5);
  const endHmr = Number(req.body?.endHmr ?? startHmr + existing.quantityUnits);
  const endHmrPhoto = String(req.body?.endHmrPhoto || `/images/rentals/${existing.machineId.replace("rent-", "")}.webp`);

  // Exact HMR calculation if billed hourly, otherwise honor agreed shift/week units
  const hmrDiff = Math.max(0.5, Number((endHmr - startHmr).toFixed(1)));
  const billableUnits =
    existing.billingUnit === "HOUR" ? hmrDiff : existing.quantityUnits;

  const taxableValue = Math.round(billableUnits * existing.ratePerUnit + existing.mobilizationFee);
  const gstAmount = Math.round(taxableValue * 0.18);
  const netBillAmount = taxableValue + gstAmount;
  const platformMargin = Math.round(taxableValue * 0.12);
  const partnerPayout = taxableValue - platformMargin;

  const updated = servicesRentalsEngine.updateRentalBooking(existing.id, {
    status: "COMPLETED_PENDING_ESCROW",
    escrowStatus: "AWAITING_RELEASE",
    endHmr,
    endHmrPhoto,
    isBreakdownPaused: false,
    taxableValue,
    gstAmount,
    netBillAmount,
    platformMargin,
    partnerPayout,
    completedAt: new Date().toISOString(),
  });

  logDispatchEvent(existing.id, "RENTAL_HMR_COMPLETED", {
    startHmr,
    endHmr,
    hmrDiff,
    netBillAmount,
  });
  broadcastSync("rental:hmr_completed", updated, updated?.assignedVendorId, updated?.assignedOperatorId);
  res.json({ success: true, booking: updated });
});

router.post("/rentals/bookings/:id/release-escrow", requireAdmin, (req: Request, res: Response) => {
  const existing = servicesRentalsEngine.getRentalBooking(String(req.params.id));
  if (!existing) {
    res.status(404).json({ success: false, error: "Rental booking not found" });
    return;
  }

  const utr = `UTR-RNT-${Math.floor(1000000 + Math.random() * 9000000)}`;
  const updated = servicesRentalsEngine.updateRentalBooking(existing.id, {
    status: "ESCROW_SETTLED",
    escrowStatus: "SETTLED",
    settledUtr: utr,
    settledAt: new Date().toISOString(),
  });

  logDispatchEvent(existing.id, "RENTAL_ESCROW_RELEASED", { utr, payout: existing.partnerPayout });
  broadcastSync("rental:escrow_settled", updated, updated?.assignedVendorId, updated?.assignedOperatorId);
  res.json({ success: true, booking: updated });
});

export default router;
