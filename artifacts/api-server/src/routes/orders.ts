import { Router, type IRouter } from "express";
import {
  db,
  ordersTable,
  cartsTable,
  cartItemsTable,
  khataLedgerTable,
  materialsTable,
} from "@workspace/db";
import { eq, and, sql, inArray } from "drizzle-orm";
import { PlaceOrderBody, CheckoutOrderBody } from "@workspace/api-zod";
import { randomUUID } from "crypto";
import { computeBill } from "../services/pricing";
import { CreditExceededError } from "../middleware/errorHandler";
import { emitNewOrder } from "../socket";

const router: IRouter = Router();

// Default credit auto-granted to a contractor the first time they place a B2B
// order without an existing ledger. A real deployment would set this per-account.
const DEFAULT_CREDIT_LIMIT = 100000;

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

router.get("/orders", async (req, res) => {
  const orders = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.sessionId, req.sessionId))
    .orderBy(ordersTable.placedAt);

  const now = Date.now();

  res.json(
    orders.map((o) => {
      const estimatedMs = new Date(o.estimatedDelivery).getTime();
      const diffMinutes = Math.max(0, Math.round((estimatedMs - now) / 60000));
      return {
        id: o.externalId,
        items: o.items as any[],
        category: o.category ?? "",
        vendor: o.vendor ?? "",
        subtotal: parseFloat(o.subtotal),
        deliveryFee: parseFloat(o.deliveryFee),
        labourFee: parseFloat(o.labourFee),
        gstAmount: parseFloat(o.gstAmount),
        total: parseFloat(o.total),
        isB2B: o.isB2B,
        gstNumber: o.gstNumber ?? undefined,
        status: o.status,
        deliveryAddress: o.deliveryAddress,
        estimatedDelivery: o.estimatedDelivery.toISOString(),
        deliveryCountdownMinutes: diffMinutes,
        placedAt: o.placedAt.toISOString(),
      };
    })
  );
});

router.post("/orders", async (req, res) => {
  const body = PlaceOrderBody.parse(req.body);

  const cart = await db
    .select()
    .from(cartsTable)
    .where(eq(cartsTable.sessionId, req.sessionId))
    .limit(1);

  if (!cart[0]) {
    res.status(400).json({ error: "No cart found" });
    return;
  }

  let items = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.cartId, cart[0].id));

  if (body.categoryFilter) {
    items = items.filter((i) => i.category === body.categoryFilter);
  }

  if (items.length === 0) {
    res.status(400).json({ error: "No items in cart" });
    return;
  }

  const total = items.reduce(
    (sum, i) => sum + parseFloat(i.price) * parseFloat(i.quantity),
    0
  );

  const estimatedDelivery = new Date(Date.now() + 60 * 60 * 1000);

  const orderItems = items.map((i) => ({
    id: i.externalId,
    materialId: i.materialId,
    name: i.name,
    category: i.category,
    price: parseFloat(i.price),
    unit: i.unit,
    quantity: parseFloat(i.quantity),
    vendor: i.vendor,
    total: parseFloat(i.price) * parseFloat(i.quantity),
  }));

  const category = body.categoryFilter ?? items[0].category;
  const vendor = items[0].vendor;

  const [order] = await db
    .insert(ordersTable)
    .values({
      externalId: randomUUID(),
      sessionId: req.sessionId,
      items: orderItems,
      category,
      vendor,
      subtotal: total.toString(),
      total: total.toString(),
      status: "placed",
      deliveryAddress: body.deliveryAddress,
      phoneNumber: body.phoneNumber ?? null,
      estimatedDelivery,
    })
    .returning();

  if (body.categoryFilter) {
    const idsToDelete = items.map((i) => i.id);
    for (const id of idsToDelete) {
      await db.delete(cartItemsTable).where(eq(cartItemsTable.id, id));
    }
  } else {
    await db
      .delete(cartItemsTable)
      .where(eq(cartItemsTable.cartId, cart[0].id));
  }

  if (order.vendor) {
    emitNewOrder(order.vendor, {
      id: order.externalId,
      shortId: order.externalId.slice(0, 8).toUpperCase(),
      buyer: order.phoneNumber ? `+91 ${order.phoneNumber}` : "CONON Customer",
      items:
        orderItems.map((i) => i.name).filter(Boolean).join(", ") ||
        order.category ||
        "Materials",
      time: "just now",
      value: parseFloat(order.total),
      status: "new" as const,
    });
  }

  res.json({
    id: order.externalId,
    items: orderItems,
    category: order.category ?? "",
    vendor: order.vendor ?? "",
    total: parseFloat(order.total),
    status: order.status,
    deliveryAddress: order.deliveryAddress,
    estimatedDelivery: order.estimatedDelivery.toISOString(),
    deliveryCountdownMinutes: 60,
    placedAt: order.placedAt.toISOString(),
  });
});

// Server-authoritative checkout: compute the bill, optionally charge the B2B
// Khata credit ledger, and create the order in a single transaction.
router.post("/orders/checkout", async (req, res, next) => {
  try {
    const body = CheckoutOrderBody.parse(req.body);
    const isB2B = body.isB2B ?? false;

    // SECURITY: prices are resolved from the DB whenever a materialId matches a
    // real material, so a tampered client price cannot lower the bill. Virtual
    // catalog ids (not in the materials table) fall back to client-supplied
    // values. This mirrors the anti-tampering rule in the cart route.
    const materialIds = body.items.map((i) => i.materialId);
    const dbMaterials = materialIds.length
      ? await db
          .select()
          .from(materialsTable)
          .where(inArray(materialsTable.externalId, materialIds))
      : [];
    const matMap = new Map(dbMaterials.map((m) => [m.externalId, m]));

    const resolvedItems = body.items.map((i) => {
      const mat = matMap.get(i.materialId);
      return {
        materialId: i.materialId,
        name: mat?.name ?? i.name,
        category: mat?.category ?? i.category,
        price: mat ? parseFloat(mat.price) : i.price,
        unit: mat?.unit ?? i.unit,
        quantity: i.quantity,
        vendor: mat?.vendor ?? i.vendor,
      };
    });

    const bill = computeBill(
      resolvedItems.map((i) => ({
        price: i.price,
        quantity: i.quantity,
        category: i.category,
      })),
      { isB2B, distanceKm: body.distanceKm }
    );

    const orderItems = resolvedItems.map((i) => ({
      id: randomUUID(),
      materialId: i.materialId,
      name: i.name,
      category: i.category,
      price: i.price,
      unit: i.unit,
      quantity: i.quantity,
      vendor: i.vendor,
      total: round2(i.price * i.quantity),
    }));

    const category = resolvedItems[0].category;
    const vendor = resolvedItems[0].vendor;
    const estimatedDelivery = new Date(Date.now() + 60 * 60 * 1000);
    const externalId = randomUUID();

    let khata:
      | {
          contractorId: string;
          creditLimit: number;
          outstandingBalance: number;
          availableCredit: number;
        }
      | undefined;

    const order = await db.transaction(async (tx) => {
      if (isB2B && body.contractorId) {
        // Idempotent provision: two concurrent first-time checkouts can't both
        // insert (contractor_id is unique); the loser is a no-op.
        await tx
          .insert(khataLedgerTable)
          .values({
            contractorId: body.contractorId,
            creditLimit: DEFAULT_CREDIT_LIMIT.toString(),
            outstandingBalance: "0",
          })
          .onConflictDoNothing({ target: khataLedgerTable.contractorId });

        // Atomic conditional debit: the WHERE clause guarantees the limit is
        // never exceeded even under concurrent checkouts. Because the check and
        // the write happen in one statement, there is no read-then-write race
        // (no lost updates / credit overrun).
        const debited = await tx
          .update(khataLedgerTable)
          .set({
            outstandingBalance: sql`${khataLedgerTable.outstandingBalance} + ${bill.total}`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(khataLedgerTable.contractorId, body.contractorId),
              sql`${khataLedgerTable.outstandingBalance} + ${bill.total} <= ${khataLedgerTable.creditLimit}`
            )
          )
          .returning();

        if (debited.length === 0) {
          const [current] = await tx
            .select()
            .from(khataLedgerTable)
            .where(eq(khataLedgerTable.contractorId, body.contractorId))
            .limit(1);
          const available = round2(
            parseFloat(current.creditLimit) - parseFloat(current.outstandingBalance)
          );
          throw new CreditExceededError(available, bill.total);
        }

        const ledger = debited[0];
        const creditLimit = parseFloat(ledger.creditLimit);
        const outstanding = parseFloat(ledger.outstandingBalance);

        khata = {
          contractorId: body.contractorId,
          creditLimit,
          outstandingBalance: round2(outstanding),
          availableCredit: round2(creditLimit - outstanding),
        };
      }

      const [created] = await tx
        .insert(ordersTable)
        .values({
          externalId,
          sessionId: req.sessionId,
          items: orderItems,
          category,
          vendor,
          subtotal: bill.subtotal.toString(),
          deliveryFee: bill.deliveryFee.toString(),
          labourFee: bill.labourFee.toString(),
          gstAmount: bill.gstAmount.toString(),
          total: bill.total.toString(),
          isB2B,
          gstNumber: body.gstNumber ?? null,
          status: "pending",
          deliveryAddress: body.deliveryAddress,
          phoneNumber: body.phoneNumber ?? null,
          estimatedDelivery,
        })
        .returning();

      return created;
    });

    if (order.vendor) {
      emitNewOrder(order.vendor, {
        id: order.externalId,
        shortId: order.externalId.slice(0, 8).toUpperCase(),
        buyer: order.phoneNumber
          ? `+91 ${order.phoneNumber}`
          : "CONON Customer",
        items:
          orderItems.map((i) => i.name).filter(Boolean).join(", ") ||
          order.category ||
          "Materials",
        time: "just now",
        value: parseFloat(order.total),
        status: "new" as const,
      });
    }

    res.json({
      id: order.externalId,
      items: orderItems,
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
  } catch (err) {
    next(err);
  }
});

export default router;
