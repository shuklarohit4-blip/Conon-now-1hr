import { Router, type IRouter } from "express";
import {
  centsToDecimal,
  collection,
  decimal,
  decimalToNumber,
  multiplyMoneyCents,
  nextId,
} from "@workspace/db";
import { AddToCartBody, UpdateCartItemBody } from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router: IRouter = Router();
const MAX_CART_ITEMS = 100;

async function getOrCreateCart(sessionId: string) {
  let cart = await collection("carts").findOne({ sessionId });
  if (cart) return cart;

  try {
    const newCart = {
      id: await nextId("carts"),
      sessionId,
      createdAt: new Date(),
      items: [],
    };
    await collection("carts").insertOne(newCart);
    cart = await collection("carts").findOne({ sessionId });
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
    cart = await collection("carts").findOne({ sessionId });
  }
  if (!cart) throw new Error("Could not initialize cart");
  return cart;
}

async function buildCartResponse(cartId: number) {
  const cart = await collection("carts").findOne({ id: cartId });
  const items = cart?.items ?? [];
  const categoryMap = new Map<string, typeof items>();
  for (const item of items) {
    const group = categoryMap.get(item.category) ?? [];
    group.push(item);
    categoryMap.set(item.category, group);
  }

  const categories = Array.from(categoryMap.entries()).map(([category, catItems]) => {
    const subtotalCents = catItems.reduce(
      (sum, item) => sum + multiplyMoneyCents(item.price, item.quantity),
      0n,
    );
    return {
      category,
      vendor: catItems[0].vendor,
      items: catItems.map((item) => ({
        id: item.externalId,
        materialId: item.materialId,
        name: item.name,
        category: item.category,
        price: decimalToNumber(item.price),
        unit: item.unit,
        quantity: decimalToNumber(item.quantity),
        vendor: item.vendor,
        total: Number(centsToDecimal(multiplyMoneyCents(item.price, item.quantity)).toString()),
      })),
      subtotal: Number(centsToDecimal(subtotalCents).toString()),
      deliveryTime: 60,
    };
  });

  const grandTotalCents = categories.reduce(
    (sum, category) => sum + BigInt(Math.round(category.subtotal * 100)),
    0n,
  );
  return {
    id: `cart-${cartId}`,
    categories,
    totalItems: items.length,
    grandTotal: Number(centsToDecimal(grandTotalCents).toString()),
  };
}

router.get("/cart", async (req, res) => {
  const cart = await getOrCreateCart(req.sessionId);
  res.json(await buildCartResponse(cart.id));
});

router.post("/cart", async (req, res) => {
  const body = AddToCartBody.parse(req.body);
  const cart = await getOrCreateCart(req.sessionId);
  const material = await collection("materials").findOne({ externalId: body.materialId });

  // Persisted catalog values are authoritative; inline data is only accepted
  // for virtual products that are not present in the materials collection.
  const name = material?.name ?? body.name;
  const category = material?.category ?? body.category;
  const unit = material?.unit ?? body.unit;
  const vendor = material?.vendor ?? body.vendor;
  const price = material?.price ?? (body.price != null ? decimal(body.price) : undefined);
  if (!name || !category || !unit || !vendor || !price) {
    res.status(400).json({ error: "Material not found and no inline product details provided" });
    return;
  }

  const existing = cart.items.find((item) => item.materialId === body.materialId);
  if (existing) {
    await collection("carts").updateOne(
      { id: cart.id },
      { $inc: { "items.$[item].quantity": decimal(body.quantity) } },
      { arrayFilters: [{ "item.externalId": existing.externalId }] },
    );
  } else {
    const newItem = {
      id: await nextId("cartItems"),
      externalId: randomUUID(),
      materialId: body.materialId,
      name,
      category,
      price,
      unit,
      quantity: decimal(body.quantity),
      vendor,
    };
    const inserted = await collection("carts").updateOne(
      {
        id: cart.id,
        items: { $not: { $elemMatch: { materialId: body.materialId } } },
        $expr: { $lt: [{ $size: { $ifNull: ["$items", []] } }, MAX_CART_ITEMS] },
      },
      { $push: { items: newItem } } as any,
    );
    if (inserted.modifiedCount === 0) {
      const updated = await collection("carts").updateOne(
        { id: cart.id, "items.materialId": body.materialId },
        { $inc: { "items.$.quantity": decimal(body.quantity) } },
      );
      if (updated.modifiedCount === 0) {
        res.status(400).json({ error: "Cart item limit reached." });
        return;
      }
    }
  }
  res.json(await buildCartResponse(cart.id));
});

router.delete("/cart/:itemId", async (req, res) => {
  const cart = await getOrCreateCart(req.sessionId);
  await collection("carts").updateOne(
    { id: cart.id },
    { $pull: { items: { externalId: req.params.itemId } } } as any,
  );
  res.json(await buildCartResponse(cart.id));
});

router.patch("/cart/:itemId", async (req, res) => {
  const body = UpdateCartItemBody.parse(req.body);
  const cart = await getOrCreateCart(req.sessionId);
  if (body.quantity <= 0) {
    await collection("carts").updateOne(
      { id: cart.id },
      { $pull: { items: { externalId: req.params.itemId } } } as any,
    );
  } else {
    await collection("carts").updateOne(
      { id: cart.id },
      { $set: { "items.$[item].quantity": decimal(body.quantity) } },
      { arrayFilters: [{ "item.externalId": req.params.itemId }] },
    );
  }
  res.json(await buildCartResponse(cart.id));
});

export default router;
