import { Router, type IRouter } from "express";
import {
  db,
  materialsTable,
  ordersTable,
  vendorPayoutsTable,
} from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
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
  const rows = MASTER_CATALOG.map((c) => ({
    externalId: `v-${slug}-${c.key}`,
    name: c.name,
    category: c.category,
    stage: c.stage,
    price: c.price.toFixed(2),
    unit: c.unit,
    inStock: true,
    imageUrl: "",
    vendor: vendorStore,
  }));
  await db.insert(materialsTable).values(rows).onConflictDoNothing();
  return db
    .select()
    .from(materialsTable)
    .where(eq(materialsTable.vendor, vendorStore))
    .orderBy(materialsTable.name);
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

function mapInventory(m: typeof materialsTable.$inferSelect) {
  return {
    id: m.externalId,
    name: m.name,
    price: parseFloat(m.price),
    inStock: m.inStock,
    unit: m.unit,
    category: m.category,
    img: m.imageUrl ?? "",
  };
}

/* ════════════════════════ Inventory ════════════════════════════ */

router.get("/vendor/inventory", async (req, res) => {
  let items = await db
    .select()
    .from(materialsTable)
    .where(eq(materialsTable.vendor, req.vendorStore!))
    .orderBy(materialsTable.name);

  // First-time vendor: seed the global master catalog so they always have a
  // ready-to-manage inventory instead of a blank screen.
  if (items.length === 0) {
    items = await seedVendorCatalog(req.vendorStore!);
  }

  res.json(items.map(mapInventory));
});

router.put("/vendor/inventory/:id", async (req, res) => {
  const externalId = req.params.id;
  const set: { price?: string; inStock?: boolean } = {};

  if (req.body?.price !== undefined) {
    const price = Number(req.body.price);
    if (!Number.isFinite(price) || price <= 0) {
      res.status(400).json({ error: "Enter a valid price." });
      return;
    }
    set.price = price.toFixed(2);
  }
  if (req.body?.inStock !== undefined) {
    set.inStock = Boolean(req.body.inStock);
  }
  if (Object.keys(set).length === 0) {
    res.status(400).json({ error: "Nothing to update." });
    return;
  }

  const [updated] = await db
    .update(materialsTable)
    .set(set)
    .where(
      and(
        eq(materialsTable.externalId, externalId),
        eq(materialsTable.vendor, req.vendorStore!),
      ),
    )
    .returning();

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

  const [created] = await db
    .insert(materialsTable)
    .values({
      externalId: randomUUID(),
      name,
      category,
      stage,
      price: price.toFixed(2),
      unit,
      inStock: true,
      imageUrl,
      vendor: req.vendorStore!,
    })
    .returning();

  res.status(201).json(mapInventory(created));
});

/* ════════════════════════ Orders ═══════════════════════════════ */

router.get("/vendor/orders", async (req, res) => {
  const rows = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.vendor, req.vendorStore!))
    .orderBy(desc(ordersTable.placedAt));

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
        value: parseFloat(o.total),
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

  const [current] = await db
    .select()
    .from(ordersTable)
    .where(
      and(
        eq(ordersTable.externalId, externalId),
        eq(ordersTable.vendor, req.vendorStore!),
      ),
    )
    .limit(1);

  if (!current) {
    res.status(404).json({ error: "Order not found in your store." });
    return;
  }
  if (!requiredFrom.includes(current.status)) {
    res.status(409).json({ error: "Order is not in a state that allows this." });
    return;
  }

  const [updated] = await db
    .update(ordersTable)
    .set({ status: nextDb })
    .where(eq(ordersTable.externalId, externalId))
    .returning();

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

  const catalog = await db
    .select()
    .from(materialsTable)
    .where(eq(materialsTable.vendor, store));

  const inStock = catalog.filter((m) => m.inStock);
  const pool = inStock.length > 0 ? inStock : catalog;

  // Pick 1–2 distinct items from the store's catalog (or a sensible fallback).
  let orderItems: { name: string; price: number; unit: string; quantity: number }[];
  if (pool.length > 0) {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const count = Math.min(pool.length, Math.random() > 0.5 ? 2 : 1);
    orderItems = shuffled.slice(0, count).map((m) => ({
      name: m.name,
      price: parseFloat(m.price),
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

  await db.insert(ordersTable).values({
    externalId,
    sessionId: `sim:${externalId}`,
    items: orderItems.map((i) => ({ ...i, total: i.price * i.quantity })),
    category: pool[0]?.category ?? "General",
    vendor: store,
    subtotal: total.toFixed(2),
    total: total.toFixed(2),
    status: "placed",
    deliveryAddress: "CONON Demo Site — Sector 5, Industrial Area",
    phoneNumber: phone,
    estimatedDelivery: new Date(Date.now() + 60 * 60 * 1000),
  });

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
  const existing = await db
    .select({ id: ordersTable.id })
    .from(ordersTable)
    .where(eq(ordersTable.vendor, store))
    .limit(1);
  if (existing.length > 0) return;

  // Deterministic per-store externalIds so concurrent first-time wallet loads
  // can't double-seed: the unique index + onConflictDoNothing dedupes them even
  // when both requests pass the existence check above.
  const slug = createHash("sha1").update(store).digest("hex").slice(0, 10);
  const now = Date.now();
  const rows = SEED_EARNINGS.map((o, i) => {
    const placedAt = new Date(now - o.daysAgo * 24 * 60 * 60 * 1000);
    return {
      externalId: `seed-${slug}-${i}`,
      sessionId: `seed:${store}`,
      items: o.items.map((it) => ({ ...it, total: it.price * it.quantity })),
      category: "General",
      vendor: store,
      subtotal: o.total.toFixed(2),
      total: o.total.toFixed(2),
      status: "delivered",
      deliveryAddress: "CONON Demo Site — Sector 5, Industrial Area",
      phoneNumber: randomPhone(),
      estimatedDelivery: placedAt,
      placedAt,
    };
  });
  await db.insert(ordersTable).values(rows).onConflictDoNothing();
}

async function computeWallet(store: string) {
  const orders = await db
    .select({ total: ordersTable.total, status: ordersTable.status })
    .from(ordersTable)
    .where(eq(ordersTable.vendor, store));

  // Earnings are realized once an order is ready for pickup or delivered.
  const totalEarned = orders
    .filter((o) => o.status === "ready" || o.status === "delivered")
    .reduce((s, o) => s + parseFloat(o.total), 0);

  const payouts = await db
    .select()
    .from(vendorPayoutsTable)
    .where(eq(vendorPayoutsTable.vendorStore, store))
    .orderBy(desc(vendorPayoutsTable.requestedAt));

  let pendingPayouts = 0;
  let withdrawn = 0; // pending + approved both reduce available balance
  for (const p of payouts) {
    const amt = parseFloat(p.amount);
    if (p.status === "pending") {
      pendingPayouts += amt;
      withdrawn += amt;
    } else if (p.status === "approved") {
      withdrawn += amt;
    }
  }

  const balance = Math.max(0, Math.round((totalEarned - withdrawn) * 100) / 100);

  const ledger = payouts.map((p) => ({
    id: p.externalId,
    date: p.requestedAt.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    label: "Payout Request",
    amount: parseFloat(p.amount),
    type: "payout" as const,
    status:
      p.status === "approved"
        ? ("Approved" as const)
        : ("Pending Admin Approval" as const),
  }));

  return {
    balance,
    totalEarned: Math.round(totalEarned * 100) / 100,
    pendingPayouts: Math.round(pendingPayouts * 100) / 100,
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
  if (amount > wallet.balance) {
    res
      .status(400)
      .json({ error: "Amount exceeds available balance.", reason: "insufficient" });
    return;
  }

  await db.insert(vendorPayoutsTable).values({
    externalId: randomUUID(),
    vendorStore: store,
    amount: amount.toFixed(2),
    status: "pending",
  });

  res.status(201).json(await computeWallet(store));
});

export default router;
