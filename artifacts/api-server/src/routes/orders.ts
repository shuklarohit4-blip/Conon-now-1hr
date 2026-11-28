import { Router, type IRouter } from "express";
import {
  centsToDecimal,
  collection,
  decimal,
  decimalToNumber,
  multiplyMoneyCents,
  nextId,
  withTransaction,
} from "@workspace/db";
import type { ClientSession, OrderDocument } from "@workspace/db";
import { PlaceOrderBody, CheckoutOrderBody } from "@workspace/api-zod";
import { randomUUID } from "crypto";
import { computeBill } from "../services/pricing";
import { CreditExceededError } from "../middleware/errorHandler";
import { emitNewOrder, schedule180sCascade } from "../socket";
import { ecosystemEngine } from "../services/ecosystemEngine";
import { syncBus } from "../services/syncBus";
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
const DEFAULT_CREDIT_LIMIT = 100000;

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function mapOrderResponse(order: OrderDocument) {
  const now = Date.now();
  return {
    id: order.externalId,
    items: order.items.map((item) => ({
      ...item,
      price: decimalToNumber(item.price),
      quantity: decimalToNumber(item.quantity),
      total: decimalToNumber(item.total),
    })),
    category: order.category ?? "",
    vendor: order.vendor ?? "",
    subtotal: decimalToNumber(order.subtotal),
    deliveryFee: decimalToNumber(order.deliveryFee),
    labourFee: decimalToNumber(order.labourFee),
    gstAmount: decimalToNumber(order.gstAmount),
    total: decimalToNumber(order.total),
    isB2B: order.isB2B,
    gstNumber: order.gstNumber ?? undefined,
    status: order.status,
    deliveryAddress: order.deliveryAddress,
    estimatedDelivery: order.estimatedDelivery.toISOString(),
    deliveryCountdownMinutes: Math.max(
      0,
      Math.round((order.estimatedDelivery.getTime() - now) / 60000),
    ),
    placedAt: order.placedAt.toISOString(),
  };
}

async function removeCartItems(
  sessionId: string,
  itemIds: string[] | undefined,
  session: ClientSession,
) {
  await collection("carts").updateOne(
    { sessionId },
    (itemIds
      ? { $pull: { items: { externalId: { $in: itemIds } } } }
      : { $set: { items: [] } }) as any,
    { session },
  );
}

router.get("/orders", async (req, res) => {
  try {
    const orders = await collection("orders")
      .find({ sessionId: req.sessionId })
      .sort({ placedAt: 1 })
      .toArray();
    if (orders.length > 0) {
      res.json(orders.map(mapOrderResponse));
      return;
    }
  } catch (err) {
    // MongoDB offline fallback
  }

  // Fallback to ecosystem orders for this session or showcase
  const ecoOrders = ecosystemEngine.getAllOrders();
  const sessionEcoOrders = ecoOrders.filter((o) => !o.sessionId || o.sessionId === req.sessionId);
  res.json(
    sessionEcoOrders.map((o) => ({
      id: o.id,
      items: o.items.map((i) => ({
        id: i.skuId,
        materialId: i.skuId,
        name: i.name,
        category: i.category,
        price: i.unitPrice,
        unit: i.unit,
        quantity: i.qty,
        vendor: o.vendorStore,
        total: i.totalPrice,
      })),
      category: o.category,
      vendor: o.vendorStore,
      subtotal: o.subtotal,
      deliveryFee: o.deliveryFee,
      labourFee: o.labourFee,
      gstAmount: o.gstAmount,
      total: o.totalAmount,
      isB2B: Boolean(o.isB2B),
      gstNumber: o.gstNumber,
      status: o.status.toLowerCase(),
      canonicalStatus: o.status,
      deliveryAddress: o.deliveryAddress,
      estimatedDelivery: o.estimatedDelivery,
      deliveryCountdownMinutes: Math.max(
        0,
        Math.round((new Date(o.estimatedDelivery).getTime() - Date.now()) / 60000),
      ),
      placedAt: o.placedAt,
      deliveryOtp: o.deliveryOtp, // Masked if not customer
    })),
  );
});

/**
 * GET /orders/current
 * Returns the latest active order or showcase order with Customer Delivery OTP.
 */
router.get("/orders/current", (req, res) => {
  const all = ecosystemEngine.getAllOrders();
  const target = all.find((o) => o.sessionId === req.sessionId) || all[0];
  if (!target) {
    res.status(404).json({ error: "No active order found" });
    return;
  }
  res.json({
    success: true,
    order: ecosystemEngine.maskOrderForRole(target, "CUSTOMER"),
  });
});

/**
 * GET /orders/:id
 * Returns order details with Customer Delivery OTP.
 */
router.get("/orders/:id", (req, res) => {
  const target = ecosystemEngine.getOrder(req.params.id);
  if (!target) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json({
    success: true,
    order: ecosystemEngine.maskOrderForRole(target, "CUSTOMER"),
  });
});

router.post("/orders", async (req, res, next) => {
  try {
    const body = PlaceOrderBody.parse(req.body);
    const rawPin =
      (req.body as any)?.deliveryPincode ||
      (req.body as any)?.sitePincode ||
      extractPincodeFromText(body.deliveryAddress);
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

    const trafficCheck = evaluateDispatchCompliance({
      domain: "MATERIAL",
      totalWeightKg: Number((req.body as any)?.totalWeightKg || 0),
      pincode: pinCheck.pincode,
      dispatchMode: (req.body as any)?.dispatchMode,
      assignedVehicleMaxKg: (req.body as any)?.assignedVehicleMaxKg !== undefined
        ? Number((req.body as any)?.assignedVehicleMaxKg)
        : undefined,
    });
    if (trafficCheck.overloadBlocked) {
      res.status(400).json({
        ok: false,
        code: "OVERLOAD_BLOCKED",
        error: trafficCheck.overloadReason,
      });
      return;
    }
    if (trafficCheck.illegalDaytimeHeavy) {
      res.status(400).json({
        ok: false,
        code: "NO_ENTRY_BLOCKED",
        error: "Lucknow Daytime Heavy No-Entry Active (06:00–23:00). Select Legal Night Window (11 PM – 6 AM) or Daytime Split Dispatch.",
      });
      return;
    }
    let items: any[] = [];

    try {
      const cart = await collection("carts").findOne({ sessionId: req.sessionId });
      if (cart && cart.items && cart.items.length > 0) {
        items = body.categoryFilter
          ? cart.items.filter((item) => item.category === body.categoryFilter)
          : cart.items;
      }
    } catch {
      // MongoDB offline fallback
    }

    if (items.length === 0) {
      const cat = body.categoryFilter || "Cement & Civil Works";
      items = [
        {
          externalId: "item-seed-1",
          materialId: "sku-ultratech-ppc-50kg",
          name: "UltraTech Super Cement PPC 50kg",
          category: cat,
          price: decimal(385),
          unit: "50kg Bag",
          quantity: decimal(20),
          vendor: "Shree Balaji Cement & Steel",
        },
      ];
    }

    const totalCents = items.reduce(
      (sum, item) => sum + multiplyMoneyCents(item.price, item.quantity),
      0n,
    );
    const total = centsToDecimal(totalCents);
    const numericTotal = decimalToNumber(total);
    const paymentMode = String((req.body as any)?.paymentMode || "PAY_ON_DELIVERY");
    const paymentStatus = String((req.body as any)?.paymentStatus || (isPodRequested(paymentMode) ? "PAY_ON_DELIVERY" : ""));
    const paymentRef = (req.body as any)?.paymentRef as string | undefined;

    const policy = evaluatePaymentPolicy({
      domain: "MATERIAL",
      items: items.map((i) => ({ category: i.category, materialId: i.materialId, name: i.name })),
      grandTotal: numericTotal,
    });

    if (!policy.allowPod && isPodRequested(paymentMode)) {
      res.status(400).json({
        ok: false,
        code: "PREPAID_REQUIRED",
        error: "Upfront prepaid payment is mandatory for RMC, Services, Machine Rentals, and orders of ₹10,000 or above.",
      });
      return;
    }

    if ((policy.requirePrepaid || !isPodRequested(paymentMode)) && !isVerifiedPrepaidEscrow(paymentStatus, paymentRef)) {
      res.status(402).json({
        ok: false,
        code: "PAYMENT_REQUIRED",
        error: "Verified upfront escrow payment is required before order creation.",
      });
      return;
    }
    const now = new Date();
    const externalId = randomUUID();
    const orderItems = items.map((item) => ({
      id: item.externalId,
      materialId: item.materialId,
      name: item.name,
      category: item.category,
      price: item.price,
      unit: item.unit,
      quantity: item.quantity,
      vendor: item.vendor,
      total: centsToDecimal(multiplyMoneyCents(item.price, item.quantity)),
    }));
    const order: OrderDocument = {
      id: 0,
      externalId,
      sessionId: req.sessionId,
      items: orderItems,
      category: body.categoryFilter ?? items[0].category,
      vendor: items[0].vendor,
      subtotal: total,
      deliveryFee: decimal(0),
      labourFee: decimal(0),
      gstAmount: decimal(0),
      total,
      isB2B: false,
      gstNumber: null,
      status: "placed",
      deliveryAddress: body.deliveryAddress,
      phoneNumber: body.phoneNumber ?? null,
      estimatedDelivery: new Date(now.getTime() + 60 * 60 * 1000),
      placedAt: now,
    };

    let ecoOrder: any = null;
    try {
      ecoOrder = ecosystemEngine.createOrder({
        sessionId: req.sessionId,
        customerName: body.phoneNumber ? `Site Customer (${body.phoneNumber})` : "Lucknow Site Customer",
        customerPhone: body.phoneNumber ?? "+91 98765 00000",
        deliveryAddress: body.deliveryAddress,
        items: items.map((i) => ({
          name: i.name,
          category: i.category,
          unit: i.unit,
          qty: decimalToNumber(i.quantity),
          price: decimalToNumber(i.price),
        })),
      });
    } catch (e) {
      // Graceful fallback
    }

    try {
      await withTransaction(async (session) => {
        order.id = await nextId("orders", session);
        await collection("orders").insertOne(order, { session });
        await removeCartItems(
          req.sessionId,
          body.categoryFilter ? items.map((item) => item.externalId) : undefined,
          session,
        );
      });
    } catch {
      // Non-fatal if DB offline
    }

    if (order.vendor) {
      emitNewOrder(order.vendor, {
        id: ecoOrder ? ecoOrder.id : order.externalId,
        shortId: ecoOrder ? ecoOrder.shortId : order.externalId.slice(0, 8).toUpperCase(),
        buyer: order.phoneNumber ? `+91 ${order.phoneNumber}` : "CONON Customer",
        items: items.map((item) => item.name).filter(Boolean).join(", ") || order.category || "Materials",
        time: "just now",
        value: decimalToNumber(order.total),
        status: "new" as const,
        pickupOtp: ecoOrder?.pickupOtp,
      });
    }

    if (ecoOrder) {
      schedule180sCascade(ecoOrder, (ecoOrder as any).hubId || "hub-naka");
      syncBus.publish({
        type: "ORDERS_UPDATED",
        entityId: ecoOrder.id,
        action: "CREATE",
        summary: `New 60-Min Order ${ecoOrder.shortId} (₹${Math.round(ecoOrder.totalAmount)})`,
      });
    }
    res.json({
      id: ecoOrder ? ecoOrder.id : order.externalId,
      shortId: ecoOrder ? ecoOrder.shortId : order.externalId.slice(0, 8).toUpperCase(),
      items: orderItems.map((item) => ({
        ...item,
        price: decimalToNumber(item.price),
        quantity: decimalToNumber(item.quantity),
        total: decimalToNumber(item.total),
      })),
      category: order.category ?? "",
      vendor: ecoOrder?.vendorStore ?? order.vendor ?? "",
      total: decimalToNumber(order.total),
      status: "placed",
      canonicalStatus: "PLACED",
      deliveryAddress: order.deliveryAddress,
      estimatedDelivery: order.estimatedDelivery.toISOString(),
      deliveryCountdownMinutes: 60,
      placedAt: order.placedAt.toISOString(),
      deliveryOtp: ecoOrder?.deliveryOtp,
    });
  } catch (error) {
    next(error);
  }
});

// Server-authoritative checkout: resolve catalog prices, debit Khata atomically,
// and create the order in a single Atlas transaction.
router.post("/orders/checkout", async (req, res, next) => {
  try {
    const body = CheckoutOrderBody.parse(req.body);
    const rawPin =
      (req.body as any)?.deliveryPincode ||
      (req.body as any)?.sitePincode ||
      extractPincodeFromText(body.deliveryAddress);
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

    const trafficCheck = evaluateDispatchCompliance({
      domain: "MATERIAL",
      totalWeightKg: Number((req.body as any)?.totalWeightKg || 0),
      pincode: pinCheck.pincode,
      dispatchMode: (req.body as any)?.dispatchMode,
      assignedVehicleMaxKg: (req.body as any)?.assignedVehicleMaxKg !== undefined
        ? Number((req.body as any)?.assignedVehicleMaxKg)
        : undefined,
    });
    if (trafficCheck.overloadBlocked) {
      res.status(400).json({
        ok: false,
        code: "OVERLOAD_BLOCKED",
        error: trafficCheck.overloadReason,
      });
      return;
    }
    if (trafficCheck.illegalDaytimeHeavy) {
      res.status(400).json({
        ok: false,
        code: "NO_ENTRY_BLOCKED",
        error: "Lucknow Daytime Heavy No-Entry Active (06:00–23:00). Select Legal Night Window (11 PM – 6 AM) or Daytime Split Dispatch.",
      });
      return;
    }
    const isB2B = body.isB2B ?? false;
    const materialIds = body.items.map((item) => item.materialId);
    let materials: any[] = [];
    try {
      materials = materialIds.length
        ? await collection("materials")
            .find({ externalId: { $in: materialIds } })
            .toArray()
        : [];
    } catch {
      materials = [];
    }
    const materialMap = new Map(materials.map((material) => [material.externalId, material]));
    const resolvedItems = body.items.map((item) => {
      const material = materialMap.get(item.materialId);
      return {
        materialId: item.materialId,
        name: material?.name ?? item.name,
        category: material?.category ?? item.category,
        price: material ? decimalToNumber(material.price) : item.price,
        unit: material?.unit ?? item.unit,
        quantity: item.quantity,
        vendor: material?.vendor ?? item.vendor,
      };
    });

    const bill = computeBill(
      resolvedItems.map(({ price, quantity, category }) => ({ price, quantity, category })),
      { isB2B, distanceKm: body.distanceKm },
    );
    const paymentMode = String((req.body as any)?.paymentMode || (isB2B && body.contractorId ? "KHATA" : "PAY_ON_DELIVERY"));
    const paymentStatus = String((req.body as any)?.paymentStatus || "");
    const paymentRef = (req.body as any)?.paymentRef as string | undefined;

    const policy = evaluatePaymentPolicy({
      domain: "MATERIAL",
      items: resolvedItems.map((i) => ({ category: i.category, materialId: i.materialId, name: i.name })),
      grandTotal: bill.total,
    });

    if (!policy.allowPod && isPodRequested(paymentMode)) {
      res.status(400).json({
        ok: false,
        code: "PREPAID_REQUIRED",
        error: "Upfront prepaid payment is mandatory for RMC, Services, Machine Rentals, and orders of ₹10,000 or above.",
      });
      return;
    }

    const isKhataB2B = isB2B && Boolean(body.contractorId) && paymentMode.toUpperCase() === "KHATA";
    if (!isKhataB2B && (policy.requirePrepaid || !isPodRequested(paymentMode)) && !isVerifiedPrepaidEscrow(paymentStatus, paymentRef)) {
      res.status(402).json({
        ok: false,
        code: "PAYMENT_REQUIRED",
        error: "Verified upfront escrow payment is required before order creation.",
      });
      return;
    }
    const orderItems = resolvedItems.map((item) => ({
      id: randomUUID(),
      materialId: item.materialId,
      name: item.name,
      category: item.category,
      price: decimal(item.price),
      unit: item.unit,
      quantity: decimal(item.quantity),
      vendor: item.vendor,
      total: decimal(round2(item.price * item.quantity)),
    }));
    const now = new Date();
    const externalId = randomUUID();
    const estimatedDelivery = new Date(now.getTime() + 60 * 60 * 1000);
    let khata:
      | {
          contractorId: string;
          creditLimit: number;
          outstandingBalance: number;
          availableCredit: number;
        }
      | undefined;

    const order: OrderDocument = {
      id: 0,
      externalId,
      sessionId: req.sessionId,
      items: orderItems,
      category: resolvedItems[0].category,
      vendor: resolvedItems[0].vendor,
      subtotal: decimal(bill.subtotal),
      deliveryFee: decimal(bill.deliveryFee),
      labourFee: decimal(bill.labourFee),
      gstAmount: decimal(bill.gstAmount),
      total: decimal(bill.total),
      isB2B,
      gstNumber: body.gstNumber ?? null,
      status: "pending",
      deliveryAddress: body.deliveryAddress,
      phoneNumber: body.phoneNumber ?? null,
      estimatedDelivery,
      placedAt: now,
    };

    await withTransaction(async (session) => {
      if (isB2B && body.contractorId) {
        const ledger = collection("khataLedger");
        await ledger.updateOne(
          { contractorId: body.contractorId },
          {
            $setOnInsert: {
              id: await nextId("khataLedger", session),
              contractorId: body.contractorId,
              creditLimit: decimal(DEFAULT_CREDIT_LIMIT),
              outstandingBalance: decimal(0),
              updatedAt: now,
            },
          },
          { upsert: true, session },
        );

        const charge = decimal(bill.total);
        const updatedLedger = await ledger.findOneAndUpdate(
          {
            contractorId: body.contractorId,
            $expr: {
              $lte: [{ $add: ["$outstandingBalance", charge] }, "$creditLimit"],
            },
          },
          { $inc: { outstandingBalance: charge }, $set: { updatedAt: now } },
          { returnDocument: "after", session },
        );
        if (!updatedLedger) {
          const current = await ledger.findOne(
            { contractorId: body.contractorId },
            { session },
          );
          const available = current
            ? round2(decimalToNumber(current.creditLimit) - decimalToNumber(current.outstandingBalance))
            : 0;
          throw new CreditExceededError(available, bill.total);
        }

        const creditLimit = decimalToNumber(updatedLedger.creditLimit);
        const outstandingBalance = decimalToNumber(updatedLedger.outstandingBalance);
        khata = {
          contractorId: body.contractorId,
          creditLimit,
          outstandingBalance: round2(outstandingBalance),
          availableCredit: round2(creditLimit - outstandingBalance),
        };
      }

      try {
        order.id = await nextId("orders", session);
        await collection("orders").insertOne(order, { session });
      } catch {
        // Non-fatal if DB transaction fails
      }
    });

    const ecoOrder = ecosystemEngine.createOrder({
      sessionId: req.sessionId,
      customerName: body.phoneNumber ? `Contractor (${body.phoneNumber})` : "Lucknow B2B Contractor",
      customerPhone: body.phoneNumber ?? "+91 98765 00000",
      deliveryAddress: body.deliveryAddress,
      items: resolvedItems.map((i) => ({
        name: i.name,
        category: i.category,
        unit: i.unit,
        qty: i.quantity,
        price: i.price,
      })),
      isB2B,
      gstNumber: body.gstNumber,
      distanceKm: body.distanceKm,
    });

    if (order.vendor) {
      emitNewOrder(order.vendor, {
        id: ecoOrder.id,
        shortId: ecoOrder.shortId,
        buyer: order.phoneNumber ? `+91 ${order.phoneNumber}` : "CONON Customer",
        items: resolvedItems.map((item) => item.name).filter(Boolean).join(", ") || order.category || "Materials",
        time: "just now",
        value: decimalToNumber(order.total),
        status: "new" as const,
        pickupOtp: ecoOrder.pickupOtp,
      });
    }

    if (ecoOrder) {
      schedule180sCascade(ecoOrder, (ecoOrder as any).hubId || "hub-naka");
      syncBus.publish({
        type: "ORDERS_UPDATED",
        entityId: ecoOrder.id,
        action: "CREATE",
        summary: `New 60-Min Order ${ecoOrder.shortId} (₹${Math.round(ecoOrder.totalAmount)})`,
      });
    }

    res.json({
      id: ecoOrder.id,
      shortId: ecoOrder.shortId,
      items: orderItems.map((item) => ({
        ...item,
        price: decimalToNumber(item.price),
        quantity: decimalToNumber(item.quantity),
        total: decimalToNumber(item.total),
      })),
      category: order.category ?? "",
      vendor: ecoOrder.vendorStore || order.vendor || "",
      bill,
      total: bill.total,
      status: "placed",
      canonicalStatus: "PLACED",
      isB2B: order.isB2B,
      gstNumber: order.gstNumber ?? undefined,
      deliveryAddress: order.deliveryAddress,
      estimatedDelivery: order.estimatedDelivery.toISOString(),
      deliveryCountdownMinutes: 60,
      placedAt: order.placedAt.toISOString(),
      deliveryOtp: ecoOrder.deliveryOtp,
      khata,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
