import { Router, type IRouter } from "express";
import { db, cartsTable, cartItemsTable, materialsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { AddToCartBody, UpdateCartItemBody } from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router: IRouter = Router();

async function getOrCreateCart(sessionId: string) {
  let cart = await db
    .select()
    .from(cartsTable)
    .where(eq(cartsTable.sessionId, sessionId))
    .limit(1);

  if (!cart[0]) {
    const [newCart] = await db
      .insert(cartsTable)
      .values({ sessionId })
      .returning();
    cart = [newCart];
  }

  return cart[0];
}

async function buildCartResponse(cartId: number) {
  const items = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.cartId, cartId));

  const categoryMap = new Map<string, typeof items>();
  for (const item of items) {
    if (!categoryMap.has(item.category)) {
      categoryMap.set(item.category, []);
    }
    categoryMap.get(item.category)!.push(item);
  }

  const categories = Array.from(categoryMap.entries()).map(([category, catItems]) => {
    const subtotal = catItems.reduce(
      (sum, i) => sum + parseFloat(i.price) * parseFloat(i.quantity),
      0
    );
    return {
      category,
      vendor: catItems[0].vendor,
      items: catItems.map((i) => ({
        id: i.externalId,
        materialId: i.materialId,
        name: i.name,
        category: i.category,
        price: parseFloat(i.price),
        unit: i.unit,
        quantity: parseFloat(i.quantity),
        vendor: i.vendor,
        total: parseFloat(i.price) * parseFloat(i.quantity),
      })),
      subtotal,
      deliveryTime: 60,
    };
  });

  const grandTotal = categories.reduce((sum, c) => sum + c.subtotal, 0);
  const totalItems = items.length;

  return {
    id: `cart-${cartId}`,
    categories,
    totalItems,
    grandTotal,
  };
}

router.get("/cart", async (req, res) => {
  const cart = await getOrCreateCart(req.sessionId);
  res.json(await buildCartResponse(cart.id));
});

router.post("/cart", async (req, res) => {
  const body = AddToCartBody.parse(req.body);
  const cart = await getOrCreateCart(req.sessionId);

  // Look up the DB material when one exists. Branded catalog items
  // (virtual IDs not in the DB) won't match — that's OK as long as the
  // client supplies inline name/price/unit/etc.
  const material = await db
    .select()
    .from(materialsTable)
    .where(eq(materialsTable.externalId, body.materialId))
    .limit(1);

  const mat = material[0];

  // SECURITY: when the materialId resolves to a real DB row, the DB is the
  // authoritative source of name/price/unit/vendor/category. Client overrides
  // are IGNORED to prevent price tampering. Inline overrides are only honored
  // for virtual ids (e.g. "brand-...") that don't exist in the materials table.
  const name     = mat?.name     ?? body.name;
  const category = mat?.category ?? body.category;
  const unit     = mat?.unit     ?? body.unit;
  const vendor   = mat?.vendor   ?? body.vendor;
  const price    = mat?.price    ?? (body.price != null ? body.price.toString() : undefined);

  if (!name || !category || !unit || !vendor || price == null) {
    res.status(400).json({
      error: "Material not found and no inline product details provided",
    });
    return;
  }

  const existing = await db
    .select()
    .from(cartItemsTable)
    .where(
      and(
        eq(cartItemsTable.cartId, cart.id),
        eq(cartItemsTable.materialId, body.materialId)
      )
    )
    .limit(1);

  if (existing[0]) {
    const newQty = parseFloat(existing[0].quantity) + body.quantity;
    await db
      .update(cartItemsTable)
      .set({ quantity: newQty.toString() })
      .where(eq(cartItemsTable.id, existing[0].id));
  } else {
    await db.insert(cartItemsTable).values({
      externalId: randomUUID(),
      cartId: cart.id,
      materialId: body.materialId,
      name,
      category,
      price,
      unit,
      quantity: body.quantity.toString(),
      vendor,
    });
  }

  res.json(await buildCartResponse(cart.id));
});

router.delete("/cart/:itemId", async (req, res) => {
  const cart = await getOrCreateCart(req.sessionId);

  await db
    .delete(cartItemsTable)
    .where(
      and(
        eq(cartItemsTable.externalId, req.params.itemId),
        eq(cartItemsTable.cartId, cart.id)
      )
    );

  res.json(await buildCartResponse(cart.id));
});

router.patch("/cart/:itemId", async (req, res) => {
  const body = UpdateCartItemBody.parse(req.body);
  const cart = await getOrCreateCart(req.sessionId);

  if (body.quantity <= 0) {
    await db
      .delete(cartItemsTable)
      .where(
        and(
          eq(cartItemsTable.externalId, req.params.itemId),
          eq(cartItemsTable.cartId, cart.id)
        )
      );
  } else {
    await db
      .update(cartItemsTable)
      .set({ quantity: body.quantity.toString() })
      .where(
        and(
          eq(cartItemsTable.externalId, req.params.itemId),
          eq(cartItemsTable.cartId, cart.id)
        )
      );
  }

  res.json(await buildCartResponse(cart.id));
});

export default router;
