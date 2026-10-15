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
import { emitNewOrder } from "../socket";

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
  const orders = await collection("orders")
    .find({ sessionId: req.sessionId })
    .sort({ placedAt: 1 })
    .toArray();
  res.json(orders.map(mapOrderResponse));
});

router.post("/orders", async (req, res) => {
  const body = PlaceOrderBody.parse(req.body);
  const cart = await collection("carts").findOne({ sessionId: req.sessionId });
  if (!cart) {
    res.status(400).json({ error: "No cart found" });
    return;
  }

  const items = body.categoryFilter
    ? cart.items.filter((item) => item.category === body.categoryFilter)
    : cart.items;
  if (items.length === 0) {
    res.status(400).json({ error: "No items in cart" });
    return;
  }

  const totalCents = items.reduce(
    (sum, item) => sum + multiplyMoneyCents(item.price, item.quantity),
    0n,
  );
  const total = centsToDecimal(totalCents);
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

  await withTransaction(async (session) => {
    order.id = await nextId("orders", session);
    await collection("orders").insertOne(order, { session });
    await removeCartItems(
      req.sessionId,
      body.categoryFilter ? items.map((item) => item.externalId) : undefined,
      session,
    );
  });

  if (order.vendor) {
    emitNewOrder(order.vendor, {
      id: order.externalId,
      shortId: order.externalId.slice(0, 8).toUpperCase(),
      buyer: order.phoneNumber ? `+91 ${order.phoneNumber}` : "CONON Customer",
      items: items.map((item) => item.name).filter(Boolean).join(", ") || order.category || "Materials",
      time: "just now",
      value: decimalToNumber(order.total),
      status: "new" as const,
    });
  }
  res.json({
    id: order.externalId,
    items: orderItems.map((item) => ({
      ...item,
      price: decimalToNumber(item.price),
      quantity: decimalToNumber(item.quantity),
      total: decimalToNumber(item.total),
    })),
    category: order.category ?? "",
    vendor: order.vendor ?? "",
    total: decimalToNumber(order.total),
    status: order.status,
    deliveryAddress: order.deliveryAddress,
    estimatedDelivery: order.estimatedDelivery.toISOString(),
    deliveryCountdownMinutes: 60,
    placedAt: order.placedAt.toISOString(),
  });
});

// Server-authoritative checkout: resolve catalog prices, debit Khata atomically,
// and create the order in a single Atlas transaction.
router.post("/orders/checkout", async (req, res, next) => {
  try {
    const body = CheckoutOrderBody.parse(req.body);
    const isB2B = body.isB2B ?? false;
    const materialIds = body.items.map((item) => item.materialId);
    const materials = materialIds.length
      ? await collection("materials")
          .find({ externalId: { $in: materialIds } })
          .toArray()
      : [];
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

      order.id = await nextId("orders", session);
      await collection("orders").insertOne(order, { session });
    });

    if (order.vendor) {
      emitNewOrder(order.vendor, {
        id: order.externalId,
        shortId: order.externalId.slice(0, 8).toUpperCase(),
        buyer: order.phoneNumber ? `+91 ${order.phoneNumber}` : "CONON Customer",
        items: resolvedItems.map((item) => item.name).filter(Boolean).join(", ") || order.category || "Materials",
        time: "just now",
        value: decimalToNumber(order.total),
        status: "new" as const,
      });
    }

    res.json({
      id: order.externalId,
      items: orderItems.map((item) => ({
        ...item,
        price: decimalToNumber(item.price),
        quantity: decimalToNumber(item.quantity),
        total: decimalToNumber(item.total),
      })),
      category: order.category ?? "",
      vendor: order.vendor ?? "",
      bill,
      total: bill.total,
      status: order.status,
      isB2B: order.isB2B,
      gstNumber: order.gstNumber ?? undefined,
      deliveryAddress: order.deliveryAddress,
      estimatedDelivery: order.estimatedDelivery.toISOString(),
      deliveryCountdownMinutes: 60,
      placedAt: order.placedAt.toISOString(),
      khata,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
