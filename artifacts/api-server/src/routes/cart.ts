import { Router, type IRouter } from "express";
import {
  centsToDecimal,
  collection,
  decimal,
  decimalToNumber,
  multiplyMoneyCents,
  nextId,
  CATALOG_PRODUCTS,
} from "@workspace/db";
import { AddToCartBody, UpdateCartItemBody } from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router: IRouter = Router();
const MAX_CART_ITEMS = 100;

const FALLBACK_MATERIALS = [
  { id: "demo-cement-weatherplus", name: "UltraTech Weather Plus Cement 50kg", category: "cement", price: 380, unit: "bag", vendor: "UltraTech Depot" },
  { id: "demo-cement-opc53", name: "OPC 53 Grade Cement", category: "cement", price: 410, unit: "bag", vendor: "CONON-NOW Supplier" },
  { id: "demo-cement-ppc", name: "PPC Cement", category: "cement", price: 385, unit: "bag", vendor: "CONON-NOW Supplier" },
  { id: "demo-tmt-fe500", name: "Tata Tiscon 550SD TMT Steel Bars", category: "steel", price: 62000, unit: "tonne", vendor: "Tata Steel Yard" },
  { id: "demo-river-sand", name: "River Sand (Plaster Grade)", category: "sand", price: 1450, unit: "ton", vendor: "CONON-NOW Sand Yard" },
  { id: "demo-stone-aggregate", name: "20mm Stone Aggregate (Gitti)", category: "aggregate", price: 3200, unit: "tonne", vendor: "CONON-NOW Quarry" },
  { id: "demo-red-bricks", name: "First Class Red Clay Bricks", category: "bricks", price: 10, unit: "piece", vendor: "CONON-NOW Brickfield" },
  { id: "demo-flyash-bricks", name: "Fly Ash Bricks Standard", category: "bricks", price: 7, unit: "piece", vendor: "CONON-NOW Brickfield" },
  { id: "demo-asian-apex", name: "Asian Paints Apex Weatherproof 20L", category: "paint", price: 6450, unit: "bucket", vendor: "Asian Paints Hub" },
  { id: "demo-kajaria-tiles", name: "Kajaria Vitrified Floor Tiles 600x600", category: "tiles", price: 1180, unit: "box", vendor: "Kajaria Galaxy" },
  { id: "demo-polycab-wire", name: "Polycab FR House Wire 1.5 sq.mm", category: "electrical", price: 1480, unit: "coil", vendor: "Polycab Electric" },
  { id: "demo-astral-pipe", name: "Astral CPVC FlowGuard Pipe 1-Inch", category: "plumbing", price: 320, unit: "piece", vendor: "Astral Pipes Depot" },
  { id: "demo-fevicol-sh", name: "Fevicol SH Synthetic Resin 50kg", category: "adhesives", price: 6800, unit: "drum", vendor: "Pidilite Distributor" },
  { id: "demo-drfixit-pidifin", name: "Dr. Fixit Pidifin 2K Waterproofing 20kg", category: "waterproofing", price: 2200, unit: "kit", vendor: "Dr. Fixit Store" },
  { id: "demo-hettich-hinges", name: "Hettich Soft-Close Concealed Hinges", category: "hardware", price: 580, unit: "pack", vendor: "Hettich Hardware" },
  { id: "demo-bosch-drill", name: "Bosch GSB 550 Professional Impact Drill", category: "tools", price: 2450, unit: "kit", vendor: "Bosch Tools Hub" },
];

interface CartItemRecord {
  id: number;
  externalId: string;
  materialId: string;
  name: string;
  category: string;
  price: any;
  unit: string;
  quantity: any;
  vendor: string;
}

interface CartRecord {
  id: number;
  sessionId: string;
  createdAt: Date;
  items: CartItemRecord[];
}

const memoryCarts = new Map<string, CartRecord>();
let memoryCartIdCounter = 1000;
let memoryItemIdCounter = 5000;

async function getOrCreateCart(sessionId: string): Promise<CartRecord> {
  try {
    let cart = await collection("carts").findOne({ sessionId });
    if (cart) return cart as unknown as CartRecord;

    const newCart = {
      id: await nextId("carts"),
      sessionId,
      createdAt: new Date(),
      items: [],
    };
    await collection("carts").insertOne(newCart);
    cart = await collection("carts").findOne({ sessionId });
    if (cart) return cart as unknown as CartRecord;
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      try {
        const cart = await collection("carts").findOne({ sessionId });
        if (cart) return cart as unknown as CartRecord;
      } catch {
        // Fall back to memory
      }
    }
  }

  // In-memory fallback
  let memCart = memoryCarts.get(sessionId);
  if (!memCart) {
    memCart = {
      id: memoryCartIdCounter++,
      sessionId,
      createdAt: new Date(),
      items: [],
    };
    memoryCarts.set(sessionId, memCart);
  }
  return memCart;
}

async function buildCartResponse(cartInput: any) {
  let cart = cartInput;
  if (typeof cartInput === "number") {
    try {
      cart = await collection("carts").findOne({ id: cartInput });
    } catch {
      // ignore
    }
    if (!cart) {
      for (const c of memoryCarts.values()) {
        if (c.id === cartInput) {
          cart = c;
          break;
        }
      }
    }
  }

  const items: CartItemRecord[] = cart?.items ?? [];
  const categoryMap = new Map<string, CartItemRecord[]>();
  for (const item of items) {
    const catName = item.category || "General";
    const group = categoryMap.get(catName) ?? [];
    group.push(item);
    categoryMap.set(catName, group);
  }

  const categories = Array.from(categoryMap.entries()).map(([category, catItems]) => {
    const subtotalCents = catItems.reduce(
      (sum, item) => sum + multiplyMoneyCents(item.price, item.quantity),
      0n,
    );
    return {
      category,
      vendor: catItems[0]?.vendor || "CONON Vendor",
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
    id: `cart-${cart?.id ?? 1}`,
    categories,
    totalItems: items.length,
    grandTotal: Number(centsToDecimal(grandTotalCents).toString()),
  };
}

router.get("/cart", async (req, res) => {
  const cart = await getOrCreateCart(req.sessionId);
  res.json(await buildCartResponse(cart));
});

router.post("/cart", async (req, res) => {
  const body = AddToCartBody.parse(req.body);
  const cart = await getOrCreateCart(req.sessionId);

  let material: any = null;
  try {
    material = await collection("materials").findOne({ externalId: body.materialId });
  } catch {
    // Ignore DB offline
  }

  // Cascading catalog lookup
  const catalogProduct = CATALOG_PRODUCTS.find(
    (p) => p.id === body.materialId || p.slug === body.materialId || p.title === body.name,
  );
  const fallbackMat = FALLBACK_MATERIALS.find(
    (m) => m.id === body.materialId || m.name === body.name,
  );

  const name =
    material?.name ??
    body.name ??
    catalogProduct?.title ??
    catalogProduct?.name ??
    fallbackMat?.name ??
    "Building Material";

  const category =
    material?.category ??
    body.category ??
    catalogProduct?.categoryName ??
    catalogProduct?.categorySlug ??
    fallbackMat?.category ??
    "General";

  const unit =
    material?.unit ??
    body.unit ??
    catalogProduct?.unit ??
    fallbackMat?.unit ??
    "Piece";

  const vendor =
    material?.vendor ??
    body.vendor ??
    catalogProduct?.brand ??
    catalogProduct?.vendor ??
    fallbackMat?.vendor ??
    "CONON Verified Supplier";

  const rawPrice =
    material?.price ??
    body.price ??
    catalogProduct?.price ??
    fallbackMat?.price ??
    100;

  const price =
    typeof rawPrice === "object" && rawPrice !== null && "toString" in rawPrice
      ? rawPrice
      : decimal(rawPrice);

  const existing = cart.items.find((item) => item.materialId === body.materialId);

  if (existing) {
    existing.quantity = decimal(decimalToNumber(existing.quantity) + body.quantity);
    try {
      await collection("carts").updateOne(
        { id: cart.id },
        { $inc: { "items.$[item].quantity": decimal(body.quantity) } },
        { arrayFilters: [{ "item.externalId": existing.externalId }] },
      );
    } catch {
      // MongoDB offline / update ignored
    }
  } else {
    const newItem: CartItemRecord = {
      id: await nextId("cartItems").catch(() => memoryItemIdCounter++),
      externalId: randomUUID(),
      materialId: body.materialId,
      name,
      category,
      price,
      unit,
      quantity: decimal(body.quantity),
      vendor,
    };
    cart.items.push(newItem);
    try {
      await collection("carts").updateOne(
        {
          id: cart.id,
          items: { $not: { $elemMatch: { materialId: body.materialId } } },
          $expr: { $lt: [{ $size: { $ifNull: ["$items", []] } }, MAX_CART_ITEMS] },
        },
        { $push: { items: newItem } } as any,
      );
    } catch {
      // MongoDB offline / insert ignored
    }
  }

  res.json(await buildCartResponse(cart));
});

router.delete("/cart/:itemId", async (req, res) => {
  const cart = await getOrCreateCart(req.sessionId);
  const targetId = req.params.itemId;

  try {
    await collection("carts").updateOne(
      { id: cart.id },
      {
        $pull: {
          items: {
            $or: [
              { externalId: targetId },
              { materialId: targetId },
              { id: Number(targetId) || -1 },
            ],
          },
        },
      } as any,
    );
  } catch {
    // Ignore DB error
  }

  cart.items = cart.items.filter(
    (item) =>
      item.externalId !== targetId &&
      item.materialId !== targetId &&
      item.id !== Number(targetId),
  );

  res.json(await buildCartResponse(cart));
});

router.patch("/cart/:itemId", async (req, res) => {
  const body = UpdateCartItemBody.parse(req.body);
  const cart = await getOrCreateCart(req.sessionId);
  const targetId = req.params.itemId;

  if (body.quantity <= 0) {
    try {
      await collection("carts").updateOne(
        { id: cart.id },
        {
          $pull: {
            items: {
              $or: [
                { externalId: targetId },
                { materialId: targetId },
                { id: Number(targetId) || -1 },
              ],
            },
          },
        } as any,
      );
    } catch {
      // Ignore DB error
    }
    cart.items = cart.items.filter(
      (item) =>
        item.externalId !== targetId &&
        item.materialId !== targetId &&
        item.id !== Number(targetId),
    );
  } else {
    try {
      await collection("carts").updateOne(
        { id: cart.id },
        { $set: { "items.$[item].quantity": decimal(body.quantity) } },
        {
          arrayFilters: [
            {
              $or: [
                { "item.externalId": targetId },
                { "item.materialId": targetId },
              ],
            },
          ],
        },
      );
    } catch {
      // Ignore DB error
    }
    const item = cart.items.find(
      (it) =>
        it.externalId === targetId ||
        it.materialId === targetId ||
        it.id === Number(targetId),
    );
    if (item) {
      item.quantity = decimal(body.quantity);
    }
  }

  res.json(await buildCartResponse(cart));
});

export default router;
