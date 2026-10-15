import { Router, type IRouter } from "express";
import {
  centsToDecimal,
  collection,
  decimal,
  decimalToNumber,
  moneyToCents,
  nextId,
} from "@workspace/db";
import type { MaterialDocument, OrderDocument } from "@workspace/db";
import { randomUUID, createHash } from "crypto";
import { requireVendor } from "../middleware/vendorAuth";
import { emitNewOrder } from "../socket";

const router: IRouter = Router();

/* ── Global Master Catalog ──────────────────────────────────────
   "Zero-typing" inventory (spec Module 4): every new vendor is seeded with a
   ready-to-sell catalog of common construction materials they can simply
   toggle in/out of stock and re-price — no manual product entry required. */
/* No image URLs are stored: the web client resolves a bulletproof LOCAL
   product photo from category/name, so seeded materials carry an empty
   imageUrl and never depend on a remote stock-photo host. */
const MASTER_CATALOG: {
  key: string;
  name: string;
  category: string;
  stage: string;
  price: number;
  unit: string;
}[] = [
  { key: "cement-opc",   name: "UltraTech OPC 53 Grade Cement", category: "cement",    stage: "structure", price: 410,    unit: "bag"   },
  { key: "cement-ppc",   name: "ACC PPC Cement",                category: "cement",    stage: "structure", price: 385,    unit: "bag"   },
  { key: "steel-fe500",  name: "TMT Steel Bars Fe500",          category: "steel",     stage: "structure", price: 68000,  unit: "tonne" },
  { key: "bricks-red",   name: "Red Clay Bricks",               category: "bricks",    stage: "structure", price: 9,      unit: "piece" },
  { key: "aggregate",    name: "Morang (Stone Aggregate)",      category: "aggregate", stage: "structure", price: 3200,   unit: "tonne" },
  { key: "sand-river",   name: "River Sand",                    category: "sand",      stage: "structure", price: 2800,   unit: "tonne" },
  { key: "pipes-pvc",    name: 'PVC Pipes (4")',                category: "plumbing",  stage: "finishing", price: 540,    unit: "piece" },
  { key: "wire-binding", name: "Binding Wire (Steel)",          category: "hardware",  stage: "structure", price: 95,     unit: "kg"    },
];

/* Seed the master catalog for a vendor that has no products yet. Idempotent:
   externalIds are namespaced per-store and conflicts are ignored, so concurrent
   requests can't create duplicates. Returns the freshly inserted rows. */
async function seedVendorCatalog(vendorStore: string) {
  const slug = createHash("sha1").update(vendorStore).digest("hex").slice(0, 10);
  const rows = await Promise.all(MASTER_CATALOG.map(async (c) => ({
    id: await nextId("materials"),
    externalId: `v-${slug}-${c.key}`,
    name: c.name,
    category: c.category,
    stage: c.stage,
    price: decimal(c.price),
    unit: c.unit,
    inStock: true,
    imageUrl: "",
    vendor: vendorStore,
    deliveryTime: 60,
    dynamicPricingEnabled: false,
  })));
  try {
    await collection("materials").bulkWrite(rows.map((row) => ({
      updateOne: {
        filter: { externalId: row.externalId },
        update: { $setOnInsert: row },
        upsert: true,
      },
    })));
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
  }
  return collection("materials").find({ vendor: vendorStore }).sort({ name: 1 }).toArray();
}

// Every route in this file requires a valid vendor JWT and is scoped to the
// vendor's own store (req.vendorStore).
router.use("/vendor", requireVendor);

/* ── Status mapping ─────────────────────────────────────────────
   DB stores raw order statuses; the vendor UI uses a 3-stage pipeline.
   - new:     placed | pending
   - packing: packing | accepted
   - ready:   ready
   delivered / cancelled are not "active". */
type VendorStage = "new" | "packing" | "ready";

function toStage(dbStatus: string): VendorStage | null {
  switch (dbStatus) {
    case "placed":
    case "pending":
      return "new";
    case "packing":
    case "accepted":
      return "packing";
    case "ready":
      return "ready";
    default:
      return null; // delivered, cancelled, etc.
  }
}

function relativeTime(from: Date): string {
  const mins = Math.max(0, Math.round((Date.now() - from.getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

function mapInventory(m: MaterialDocument) {
  return {
    id: m.externalId,
    name: m.name,
    price: decimalToNumber(m.price),
    inStock: m.inStock,
    unit: m.unit,
    category: m.category,
    img: m.imageUrl ?? "",
  };
}

/* ════════════════════════ Inventory ════════════════════════════ */

router.get("/vendor/inventory", async (req, res) => {
  let items = await collection("materials").find({ vendor: req.vendorStore! }).sort({ name: 1 }).toArray();

  // First-time vendor: seed the global master catalog so they always have a
  // ready-to-manage inventory instead of a blank screen.
  if (items.length === 0) {
    items = await seedVendorCatalog(req.vendorStore!);
  }

  res.json(items.map(mapInventory));
});

router.put("/vendor/inventory/:id", async (req, res) => {
  const externalId = req.params.id;
  const set: { price?: ReturnType<typeof decimal>; inStock?: boolean } = {};

  if (req.body?.price !== undefined) {
    const price = Number(req.body.price);
    if (!Number.isFinite(price) || price <= 0) {
      res.status(400).json({ error: "Enter a valid price." });
      return;
    }
    set.price = decimal(price);
  }
  if (req.body?.inStock !== undefined) {
    set.inStock = Boolean(req.body.inStock);
  }
  if (Object.keys(set).length === 0) {
    res.status(400).json({ error: "Nothing to update." });
    return;
  }

  const updated = await collection("materials").findOneAndUpdate(
    { externalId, vendor: req.vendorStore! },
    { $set: set },
    { returnDocument: "after" },
  );

  if (!updated) {
    res.status(404).json({ error: "Product not found in your store." });
    return;
  }
  res.json(mapInventory(updated));
});

/* ════════════════════════ Products ═════════════════════════════ */

router.post("/vendor/products", async (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const unit = typeof req.body?.unit === "string" ? req.body.unit.trim() : "";
  const category =
    typeof req.body?.category === "string" && req.body.category.trim()
      ? req.body.category.trim()
      : "General";
  const stage =
    typeof req.body?.stage === "string" && req.body.stage.trim()
      ? req.body.stage.trim()
      : "general";
  const price = Number(req.body?.price);
  const imageUrl =
    typeof req.body?.img === "string" && req.body.img.trim()
      ? req.body.img.trim()
      : typeof req.body?.imageUrl === "string" && req.body.imageUrl.trim()
        ? req.body.imageUrl.trim()
        : null;

  if (!name) {
    res.status(400).json({ error: "Product name is required." });
    return;
  }
  if (!Number.isFinite(price) || price <= 0) {
    res.status(400).json({ error: "Enter a valid price." });
    return;
  }
  if (!unit) {
    res.status(400).json({ error: "Unit is required (e.g. bag, kg, piece)." });
    return;
  }

  const created: MaterialDocument = {
      id: await nextId("materials"),
      externalId: randomUUID(),
      name,
      category,
      stage,
      price: decimal(price),
      unit,
      inStock: true,
      imageUrl,
      vendor: req.vendorStore!,
      deliveryTime: 60,
      dynamicPricingEnabled: false,
    };
  await collection("materials").insertOne(created);

  res.status(201).json(mapInventory(created));
});

/* ════════════════════════ Orders ═══════════════════════════════ */

router.get("/vendor/orders", async (req, res) => {
  const rows = await collection("orders").find({ vendor: req.vendorStore! }).sort({ placedAt: -1 }).toArray();

  const onlyActive = req.query.status === "active";

  const mapped = rows
    .map((o) => {
      const stage = toStage(o.status);
      if (!stage) return null;
      if (onlyActive && stage === "ready") {
        // "ready" is still active (awaiting pickup), keep it.
      }
      const items = Array.isArray(o.items) ? (o.items as any[]) : [];
      const itemText =
        items.map((i) => i?.name).filter(Boolean).join(", ") ||
        o.category ||
        "Materials";
      return {
        id: o.externalId,
        shortId: o.externalId.slice(0, 8).toUpperCase(),
        buyer: o.phoneNumber ? `+91 ${o.phoneNumber}` : "CONON Customer",
        items: itemText,
        time: relativeTime(o.placedAt),
        value: decimalToNumber(o.total),
        status: stage,
      };
    })
    .filter((o): o is NonNullable<typeof o> => o !== null);

  res.json(mapped);
});

router.put("/vendor/orders/:id/status", async (req, res) => {
  const externalId = req.params.id;
  const target = req.body?.status;

  // Allowed transitions enforced server-side.
  // accept: new(placed|pending) -> packing ; ready: packing -> ready
  let nextDb: string | null = null;
  let requiredFrom: string[] = [];
  if (target === "packing") {
    nextDb = "packing";
    requiredFrom = ["placed", "pending"];
  } else if (target === "ready") {
    nextDb = "ready";
    requiredFrom = ["packing", "accepted"];
  } else {
    res.status(400).json({ error: "Invalid status transition." });
    return;
  }

  const current = await collection("orders").findOne({
    externalId,
    vendor: req.vendorStore!,
  });

  if (!current) {
    res.status(404).json({ error: "Order not found in your store." });
    return;
  }
  if (!requiredFrom.includes(current.status)) {
    res.status(409).json({ error: "Order is not in a state that allows this." });
    return;
  }

  const updated = await collection("orders").findOneAndUpdate(
    { externalId, vendor: req.vendorStore!, status: { $in: requiredFrom } },
    { $set: { status: nextDb } },
    { returnDocument: "after" },
  );
  if (!updated) {
    res.status(409).json({ error: "Order is not in a state that allows this." });
    return;
  }

  res.json({ id: updated.externalId, status: toStage(updated.status) });
});

/* ════════════════════════ Simulated order ══════════════════════
   Demo helper for the "Test New Order" button. Inserts a *real* order for
   this vendor's store (built from their own catalog) so the resulting card
   behaves exactly like a live order — Accept / Mark Ready and wallet earnings
   all work against the database. Also pushes the socket event so any other
   open dashboard for this store lights up too. */

const SIM_BUYERS = [
  "Rajesh Kumar",
  "Sharma Construction",
  "Anil Contractor",
  "Verma Builders",
  "Site Engineer — Tower B",
  "Khan Hardware",
  "Patel & Sons",
];

function randomPhone(): string {
  let n = "9";
  for (let i = 0; i < 9; i++) n += Math.floor(Math.random() * 10);
  return n;
}

router.post("/vendor/orders/simulate", async (req, res) => {
  const store = req.vendorStore!;

  const catalog = await collection("materials").find({ vendor: store }).toArray();

  const inStock = catalog.filter((m) => m.inStock);
  const pool = inStock.length > 0 ? inStock : catalog;

  // Pick 1–2 distinct items from the store's catalog (or a sensible fallback).
  let orderItems: { name: string; price: number; unit: string; quantity: number }[];
  if (pool.length > 0) {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const count = Math.min(pool.length, Math.random() > 0.5 ? 2 : 1);
    orderItems = shuffled.slice(0, count).map((m) => ({
      name: m.name,
      price: decimalToNumber(m.price),
      unit: m.unit,
      quantity: Math.floor(Math.random() * 8) + 1,
    }));
  } else {
    orderItems = [
      { name: "Construction Materials", price: 4500, unit: "lot", quantity: 1 },
    ];
  }

  const total = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const externalId = randomUUID();
  const phone = randomPhone();
  const buyerName = SIM_BUYERS[Math.floor(Math.random() * SIM_BUYERS.length)];

  const order: OrderDocument = {
    id: await nextId("orders"),
    externalId,
    sessionId: `sim:${externalId}`,
    items: orderItems.map((i) => ({
      id: randomUUID(),
      name: i.name,
      category: pool[0]?.category ?? "General",
      price: decimal(i.price),
      unit: i.unit,
      quantity: decimal(i.quantity),
      vendor: store,
      total: decimal(i.price * i.quantity),
    })),
    category: pool[0]?.category ?? "General",
    vendor: store,
    subtotal: decimal(total),
    deliveryFee: decimal(0),
    labourFee: decimal(0),
    gstAmount: decimal(0),
    total: decimal(total),
    isB2B: false,
    gstNumber: null,
    status: "placed",
    deliveryAddress: "CONON Demo Site — Sector 5, Industrial Area",
    phoneNumber: phone,
    estimatedDelivery: new Date(Date.now() + 60 * 60 * 1000),
    placedAt: new Date(),
  };
  await collection("orders").insertOne(order);

  const payload = {
    id: externalId,
    shortId: externalId.slice(0, 8).toUpperCase(),
    buyer: buyerName,
    items: orderItems.map((i) => i.name).join(", "),
    time: "just now",
    value: total,
    status: "new" as const,
  };

  emitNewOrder(store, payload);
  res.status(201).json(payload);
});

/* ════════════════════════ Wallet / Payouts ═════════════════════ */

/* Seed a fresh vendor with a few already-delivered orders so the wallet shows
   realistic withdrawable earnings instead of ₹0 — keeping the demo's
   "Withdraw Money" happy-path fully functional against the real DB. Idempotent:
   only runs when the store has no orders yet. */
const SEED_EARNINGS: {
  items: { name: string; price: number; unit: string; quantity: number }[];
  total: number;
  daysAgo: number;
}[] = [
  { items: [{ name: "UltraTech OPC 53 Grade Cement", price: 410, unit: "bag", quantity: 44 }], total: 18040, daysAgo: 9 },
  { items: [{ name: "TMT Steel Bars Fe500", price: 68000, unit: "tonne", quantity: 0.2 }], total: 13600, daysAgo: 5 },
  { items: [{ name: "Red Clay Bricks", price: 9, unit: "piece", quantity: 1540 }], total: 13860, daysAgo: 2 },
];

async function seedVendorEarnings(store: string) {
  const existing = await collection("orders").findOne({ vendor: store });
  if (existing) return;

  // Deterministic per-store externalIds so concurrent first-time wallet loads
  // can't double-seed: the unique index + onConflictDoNothing dedupes them even
  // when both requests pass the existence check above.
  const slug = createHash("sha1").update(store).digest("hex").slice(0, 10);
  const now = Date.now();
  const rows = await Promise.all(SEED_EARNINGS.map(async (o, i) => {
    const placedAt = new Date(now - o.daysAgo * 24 * 60 * 60 * 1000);
    return {
      id: await nextId("orders"),
      externalId: `seed-${slug}-${i}`,
      sessionId: `seed:${store}`,
      items: o.items.map((it) => ({
        id: randomUUID(),
        name: it.name,
        category: "General",
        price: decimal(it.price),
        unit: it.unit,
        quantity: decimal(it.quantity),
        vendor: store,
        total: decimal(it.price * it.quantity),
      })),
      category: "General",
      vendor: store,
      subtotal: decimal(o.total),
      deliveryFee: decimal(0),
      labourFee: decimal(0),
      gstAmount: decimal(0),
      total: decimal(o.total),
      isB2B: false,
      gstNumber: null,
      status: "delivered",
      deliveryAddress: "CONON Demo Site — Sector 5, Industrial Area",
      phoneNumber: randomPhone(),
      estimatedDelivery: placedAt,
      placedAt,
    };
  }));
  try {
    await collection("orders").bulkWrite(rows.map((row) => ({
      updateOne: {
        filter: { externalId: row.externalId },
        update: { $setOnInsert: row },
        upsert: true,
      },
    })));
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
  }
}

async function computeWallet(store: string) {
  const orders = await collection("orders").find(
    { vendor: store },
    { projection: { total: 1, status: 1 } },
  ).toArray();

  // Earnings are realized once an order is ready for pickup or delivered.
  const totalEarnedCents = orders
    .filter((o) => o.status === "ready" || o.status === "delivered")
    .reduce((sum, order) => sum + moneyToCents(order.total), 0n);

  const payouts = await collection("vendorPayouts").find({ vendorStore: store })
    .sort({ requestedAt: -1 }).toArray();

  let pendingPayoutsCents = 0n;
  let withdrawnCents = 0n; // pending + approved both reduce available balance
  for (const p of payouts) {
    const amtCents = moneyToCents(p.amount);
    if (p.status === "pending") {
      pendingPayoutsCents += amtCents;
      withdrawnCents += amtCents;
    } else if (p.status === "approved") {
      withdrawnCents += amtCents;
    }
  }

  const balanceCents = totalEarnedCents > withdrawnCents ? totalEarnedCents - withdrawnCents : 0n;
  const totalEarned = decimalToNumber(centsToDecimal(totalEarnedCents));
  const pendingPayouts = decimalToNumber(centsToDecimal(pendingPayoutsCents));
  const balance = decimalToNumber(centsToDecimal(balanceCents));

  const ledger = payouts.map((p) => ({
    id: p.externalId,
    date: p.requestedAt.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    label: "Payout Request",
    amount: decimalToNumber(p.amount),
    type: "payout" as const,
    status:
      p.status === "approved"
        ? ("Approved" as const)
        : ("Pending Admin Approval" as const),
  }));

  return {
    balance,
    totalEarned,
    pendingPayouts,
    ledger,
  };
}

router.get("/vendor/wallet", async (req, res) => {
  await seedVendorEarnings(req.vendorStore!);
  res.json(await computeWallet(req.vendorStore!));
});

router.post("/vendor/payouts/request", async (req, res) => {
  const amount = Number(req.body?.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    res.status(400).json({ error: "Enter a valid amount.", reason: "invalid" });
    return;
  }

  const store = req.vendorStore!;
  const wallet = await computeWallet(store);
  const requestedCents = moneyToCents(amount);
  const balanceCents = moneyToCents(wallet.balance);
  if (requestedCents > balanceCents) {
    res
      .status(400)
      .json({ error: "Amount exceeds available balance.", reason: "insufficient" });
    return;
  }

  await collection("vendorPayouts").insertOne({
    id: await nextId("vendorPayouts"),
    externalId: randomUUID(),
    vendorStore: store,
    amount: decimal(amount),
    status: "pending",
    requestedAt: new Date(),
    approvedAt: null,
  });

  res.status(201).json(await computeWallet(store));
});

export default router;
