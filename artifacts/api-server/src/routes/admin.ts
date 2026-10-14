import { Router, type IRouter } from "express";
import {
  db,
  ordersTable,
  mandiPricesTable,
  vendorPayoutsTable,
} from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "../middleware/adminAuth";

const router: IRouter = Router();

// Every admin endpoint requires a valid, server-signed admin session. Scope the
// guard to the "/admin" path prefix: this router is mounted at the app root, so
// a bare `router.use(requireAdmin)` would also gate every later router (vendor,
// maps, …) whose requests pass through here.
router.use("/admin", requireAdmin);

/* ── Analytics ──────────────────────────────────────────────── */
router.get("/admin/analytics", async (_req, res) => {
  try {
    const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.placedAt));
    const now = Date.now();
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(o => new Date(o.placedAt) >= todayStart);
    const activeOrders = orders.filter(o => o.status === "placed");
    const slaBreaches = orders.filter(o => {
      const eta = new Date(o.estimatedDelivery).getTime();
      return eta < now && o.status !== "delivered";
    });
    const dailyRevenue = todayOrders.reduce((s, o) => s + parseFloat(o.total), 0);
    const sevenDays = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59, 999);
      const dayOrders = orders.filter(o => {
        const t = new Date(o.placedAt);
        return t >= dayStart && t <= dayEnd;
      });
      return {
        date: d.toLocaleDateString("en-IN", { weekday: "short" }),
        orders: dayOrders.length,
        revenue: Math.round(dayOrders.reduce((s, o) => s + parseFloat(o.total), 0)),
      };
    });
    res.json({
      totalRevenue: Math.round(dailyRevenue),
      activeOrders: activeOrders.length,
      slaBreaches: slaBreaches.length,
      khataCredit: 2840000,
      sevenDayHistory: sevenDays,
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

/* ── All Orders ─────────────────────────────────────────────── */
router.get("/admin/orders", async (_req, res) => {
  try {
    const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.placedAt));
    const now = Date.now();
    const result = orders.map(o => {
      const etaMs = new Date(o.estimatedDelivery).getTime();
      const minsLeft = Math.round((etaMs - now) / 60000);
      const slaBreached = etaMs < now && o.status !== "delivered";
      const items = (o.items as any[]) || [];
      return {
        id: o.externalId, shortId: o.externalId.slice(0, 8).toUpperCase(),
        site: o.deliveryAddress?.split(",")[0]?.trim() ?? "Site",
        items: items.map((i: any) => i.name).join(", ") || o.category || "Materials",
        category: o.category ?? "", vendor: o.vendor ?? "",
        total: parseFloat(o.total), status: o.status,
        deliveryAddress: o.deliveryAddress, phone: o.phoneNumber ?? "",
        minsLeft, slaBreached,
        malba: o.category === "aggregate" || items.some((i: any) => i.name?.toLowerCase().includes("malba")),
        placedAt: o.placedAt.toISOString(),
        estimatedDelivery: o.estimatedDelivery.toISOString(),
      };
    });
    const mockOrders = [
      { id: "mock-001", shortId: "ORD-4421", site: "Anand Construction",  items: "OPC 53 Grade — 50 Bags",    category: "cement",    vendor: "UltraTech Dealers", total: 20500,  status: "placed",    deliveryAddress: "Gomti Nagar, Lucknow",  phone: "9812345678", minsLeft: 8,   slaBreached: false, malba: false, placedAt: new Date().toISOString(), estimatedDelivery: new Date(Date.now() + 8*60000).toISOString() },
      { id: "mock-002", shortId: "ORD-4420", site: "Raja Infra Site #7",  items: "TMT Steel Fe500 — 2 Ton",  category: "steel",     vendor: "Rathi Steel",       total: 136000, status: "placed",    deliveryAddress: "Indira Nagar, Lucknow", phone: "9876543210", minsLeft: -5,  slaBreached: true,  malba: false, placedAt: new Date().toISOString(), estimatedDelivery: new Date(Date.now() - 5*60000).toISOString() },
      { id: "mock-003", shortId: "ORD-4419", site: "Sharma Builders",     items: "Morang (Aggregate) 3 Ton", category: "aggregate", vendor: "Baalu Traders",     total: 9000,   status: "delivered", deliveryAddress: "Aliganj, Lucknow",      phone: "9898989898", minsLeft: 0,   slaBreached: false, malba: true,  placedAt: new Date().toISOString(), estimatedDelivery: new Date(Date.now() - 30*60000).toISOString() },
      { id: "mock-004", shortId: "ORD-4418", site: "Gupta Residency",     items: "Red Clay Bricks — 5000",  category: "bricks",    vendor: "Patel Bricks",      total: 25000,  status: "placed",    deliveryAddress: "Hazratganj, Lucknow",   phone: "9737373737", minsLeft: 24,  slaBreached: false, malba: false, placedAt: new Date().toISOString(), estimatedDelivery: new Date(Date.now() + 24*60000).toISOString() },
      { id: "mock-005", shortId: "ORD-4417", site: "MK Constructions",    items: "River Sand — 10 MT",       category: "sand",      vendor: "Sand Depot",        total: 12000,  status: "placed",    deliveryAddress: "Aishbagh, Lucknow",     phone: "9654321098", minsLeft: -18, slaBreached: true,  malba: false, placedAt: new Date().toISOString(), estimatedDelivery: new Date(Date.now() - 18*60000).toISOString() },
      { id: "mock-006", shortId: "ORD-4416", site: "Verma Homes",         items: "PPC Cement — 30 Bags",     category: "cement",    vendor: "ACC Dealers",       total: 11400,  status: "placed",    deliveryAddress: "Chinhat, Lucknow",      phone: "9711223344", minsLeft: 35,  slaBreached: false, malba: false, placedAt: new Date().toISOString(), estimatedDelivery: new Date(Date.now() + 35*60000).toISOString() },
    ];
    res.json([...result, ...mockOrders]);
  } catch {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

/* ── CSV Export ─────────────────────────────────────────────── */
router.get("/admin/export/csv", async (_req, res) => {
  try {
    const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.placedAt));
    const headers = ["Order ID","Date","Site Address","Category","Vendor","Total (Rs)","GST 18% (Rs)","Status","ETA"];
    const rows = orders.map(o => {
      const total = parseFloat(o.total);
      const gst = +(total * 0.18).toFixed(2);
      return [o.externalId, new Date(o.placedAt).toLocaleDateString("en-IN"),
        `"${o.deliveryAddress.replace(/"/g,"'")}"`, o.category ?? "", o.vendor ?? "",
        total.toFixed(2), gst.toFixed(2), o.status, new Date(o.estimatedDelivery).toISOString()].join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const month = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="CONON_Sales_${month}.csv"`);
    res.send(csv);
  } catch {
    res.status(500).json({ error: "CSV generation failed" });
  }
});

/* ── Mandi Prices ────────────────────────────────────────────── */
router.get("/admin/mandi", async (_req, res) => {
  try {
    const prices = await db.select().from(mandiPricesTable);
    res.json(prices);
  } catch {
    res.status(500).json({ error: "Failed to fetch mandi prices" });
  }
});

router.patch("/admin/mandi/:material", async (req, res) => {
  try {
    const { material } = req.params;
    const { price } = req.body as { price: number };
    if (!price || isNaN(price)) { res.status(400).json({ error: "Valid price required" }); return; }
    const { eq } = await import("drizzle-orm");
    const existing = await db.select().from(mandiPricesTable).where(eq(mandiPricesTable.material, material)).limit(1);
    if (!existing[0]) { res.status(404).json({ error: "Material not found" }); return; }
    const prev = parseFloat(existing[0].currentPrice);
    const change = +(price - prev).toFixed(2);
    const changePercent = +((change / prev) * 100).toFixed(2);
    await db.update(mandiPricesTable).set({
      previousPrice: prev.toString(), currentPrice: price.toString(),
      change: change.toString(), changePercent: changePercent.toString(),
      trend: change > 0 ? "up" : change < 0 ? "down" : "stable",
      lastUpdated: new Date(),
    }).where(eq(mandiPricesTable.material, material));
    res.json({ success: true, material, newPrice: price });
  } catch {
    res.status(500).json({ error: "Failed to update price" });
  }
});

/* ── Khata (B2B Credit Ledger) ──────────────────────────────── */
type KhataTxnKind = "debit" | "credit";
interface KhataTxn { id: number; date: string; kind: KhataTxnKind; description: string; amount: number; }
interface KhataClient {
  id: string;
  name: string;
  type: "Contractor" | "Builder" | "Individual";
  phone: string;
  creditLimit: number;
  overdueDays: number;
  ledger: KhataTxn[];
}

const D = (id: number, date: string, description: string, amount: number): KhataTxn =>
  ({ id, date, kind: "debit", description, amount });
const C = (id: number, date: string, description: string, amount: number): KhataTxn =>
  ({ id, date, kind: "credit", description, amount });

// HTML-escape any value interpolated into the generated invoice/statement pages.
const esc = (s: unknown) =>
  String(s).replace(/[&<>"']/g, ch =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch] as string));

const khataClients: KhataClient[] = [
  {
    id: "K01", name: "Vipin Shukla", type: "Contractor", phone: "9812345678",
    creditLimit: 500000, overdueDays: 0,
    ledger: [
      D(1, "2026-03-02", "Order #1180 — 200 Bags OPC Cement", 64000),
      C(2, "2026-03-08", "Part Payment Received · UPI", 40000),
      D(3, "2026-03-14", "Order #1204 — 50 Bags Cement + TMT Bars", 132000),
      C(4, "2026-03-20", "Part Payment Received · RTGS", 50000),
    ],
  },
  {
    id: "K02", name: "Saroj Shukla", type: "Builder", phone: "9876543210",
    creditLimit: 800000, overdueDays: 12,
    ledger: [
      D(1, "2026-02-18", "Order #1090 — River Sand 200 cft + Aggregate", 145000),
      C(2, "2026-02-25", "Cheque Payment Received · HDFC 884512", 45000),
      D(3, "2026-03-05", "Order #1156 — TMT Steel 5 Tonne", 340000),
      D(4, "2026-03-19", "Order #1198 — 300 Bags PPC Cement", 96000),
    ],
  },
  {
    id: "K03", name: "Manshi Mam", type: "Individual", phone: "9898989898",
    creditLimit: 200000, overdueDays: 0,
    ledger: [
      D(1, "2026-03-10", "Order #1170 — Bricks 10,000 pcs", 75000),
      C(2, "2026-03-16", "Full Settlement · UPI", 75000),
      D(3, "2026-03-22", "Order #1210 — Plywood + Hardware", 28000),
    ],
  },
  {
    id: "K04", name: "Gupta Residency", type: "Individual", phone: "9737373737",
    creditLimit: 200000, overdueDays: 0,
    ledger: [
      D(1, "2026-03-01", "Order #1140 — White Cement 50 bags", 18000),
      C(2, "2026-03-09", "Payment Received · Cash", 18000),
    ],
  },
  {
    id: "K05", name: "Anand Constructions", type: "Contractor", phone: "9654321098",
    creditLimit: 600000, overdueDays: 0,
    ledger: [
      D(1, "2026-02-28", "Order #1120 — RMC 12 cu.m", 210000),
      C(2, "2026-03-07", "Part Payment Received · NEFT", 120000),
      D(3, "2026-03-18", "Order #1192 — TMT Bars 1.5 Tonne", 90000),
    ],
  },
  {
    id: "K06", name: "Raja Infra Pvt Ltd", type: "Builder", phone: "9988776655",
    creditLimit: 800000, overdueDays: 22,
    ledger: [
      D(1, "2026-02-10", "Order #1042 — Structural Steel 10 Tonne", 690000),
      C(2, "2026-02-20", "Part Payment Received · RTGS", 50000),
    ],
  },
  {
    id: "K07", name: "Sharma Builders", type: "Builder", phone: "9090909090",
    creditLimit: 300000, overdueDays: 0,
    ledger: [
      D(1, "2026-03-05", "Order #1150 — Vitrified Tiles 1800 sqft", 60000),
      C(2, "2026-03-10", "Advance Payment Received · UPI", 75000),
    ],
  },
];

const sumDebits  = (c: KhataClient) => c.ledger.filter(t => t.kind === "debit").reduce((s, t) => s + t.amount, 0);
const sumCredits = (c: KhataClient) => c.ledger.filter(t => t.kind === "credit").reduce((s, t) => s + t.amount, 0);
const outstandingOf = (c: KhataClient) => sumDebits(c) - sumCredits(c);

function khataListItem(c: KhataClient) {
  const utilized = sumDebits(c);
  const net = outstandingOf(c);   // signed: negative => advance/credit balance
  return {
    id: c.id, name: c.name, type: c.type, phone: c.phone,
    creditLimit: c.creditLimit,
    utilized,
    // Legacy consumers (AdminDashboard KhataModule) sum `pending` as "Total Outstanding";
    // clamp to >=0 so advance accounts don't net the total down.
    pending: Math.max(0, net),
    outstanding: net,      // true signed balance for KhataManager (advance shown as negative)
    available: c.creditLimit - Math.max(0, net),
    overdueDays: c.overdueDays,
    txnCount: c.ledger.length,
  };
}

// Money collected "today" by field agents. Seed represents earlier collections;
// new payments increment it live.
let collectedToday = 235000;
let nextKhataTxnId = 1000;

router.get("/admin/khata", (_req, res) => res.json(khataClients.map(khataListItem)));

router.get("/admin/khata/summary", (_req, res) => {
  const totalOutstanding = khataClients.reduce((s, c) => s + Math.max(0, outstandingOf(c)), 0);
  const activeAccounts = khataClients.filter(c => outstandingOf(c) > 0).length;
  const overdueAccounts = khataClients.filter(c => c.overdueDays > 0).length;
  const totalCreditLimit = khataClients.reduce((s, c) => s + c.creditLimit, 0);
  res.json({
    totalOutstanding, collectedToday, activeAccounts, overdueAccounts,
    totalCreditLimit, totalClients: khataClients.length,
  });
});

router.get("/admin/khata/:id/ledger", (req, res) => {
  const c = khataClients.find(k => k.id === req.params.id);
  if (!c) { res.status(404).json({ error: "Contractor not found" }); return; }
  const sorted = [...c.ledger].sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
  let bal = 0;
  const transactions = sorted.map(t => {
    bal += t.kind === "debit" ? t.amount : -t.amount;
    return { ...t, balance: bal };
  });
  res.json({ ...khataListItem(c), transactions });
});

router.post("/admin/khata/:id/payment", (req, res) => {
  const c = khataClients.find(k => k.id === req.params.id);
  if (!c) { res.status(404).json({ error: "Contractor not found" }); return; }
  const { amount, mode, reference, date, proofName } = req.body as {
    amount: number; mode?: string; reference?: string; date?: string; proofName?: string;
  };
  if (!amount || amount <= 0) { res.status(400).json({ error: "Valid amount required" }); return; }
  const ALLOWED_MODES = ["Cash", "UPI", "Cheque", "RTGS/NEFT", "RTGS", "NEFT"];
  const safeMode = ALLOWED_MODES.includes(String(mode)) ? String(mode) : "Cash";
  const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(String(date)) ? String(date) : new Date().toISOString().slice(0, 10);
  const clean = (s: unknown) => String(s).replace(/[<>]/g, "").trim().slice(0, 120);
  const parts = [`Payment Received · ${safeMode}`];
  if (reference) parts.push(`Ref ${clean(reference)}`);
  if (proofName) parts.push(`📎 ${clean(proofName)}`);
  c.ledger.push({
    id: ++nextKhataTxnId,
    date: safeDate,
    kind: "credit",
    description: parts.join(" · "),
    amount,
  });
  if (outstandingOf(c) <= 0) c.overdueDays = 0;
  collectedToday += amount;
  res.json({ success: true, id: c.id, paid: amount, mode: safeMode, remaining: Math.max(0, outstandingOf(c)) });
});

/* ── PDF Invoice ────────────────────────────────────────────── */
router.get("/admin/khata/:id/invoice", (req, res) => {
  const entry = khataClients.find(k => k.id === req.params.id);
  if (!entry) { res.status(404).json({ error: "Contractor not found" }); return; }
  const out = Math.max(0, outstandingOf(entry));
  const gst = +(out * 0.18).toFixed(0);
  const total = out + gst;
  const invoiceNo = `INV-CONON-${req.params.id}-${Date.now().toString().slice(-6)}`;
  const date = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const dueDate = new Date(Date.now() + 7 * 86400000).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Invoice ${invoiceNo}</title>
<style>
  @media print { body { margin: 0; } .no-print { display: none; } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', sans-serif; background: #fff; color: #1F2937; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #FBBF24; padding-bottom: 24px; }
  .brand h1 { font-size: 28px; font-weight: 900; color: #1F2937; }
  .brand p { font-size: 12px; color: #6B7280; margin-top: 4px; }
  .badge { background: #FBBF24; color: #1F2937; font-weight: 900; font-size: 11px; padding: 4px 12px; border-radius: 999px; display: inline-block; margin-top: 8px; }
  .invoice-meta { text-align: right; }
  .invoice-meta h2 { font-size: 22px; font-weight: 900; color: #1F2937; }
  .invoice-meta p { font-size: 12px; color: #6B7280; margin-top: 4px; }
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 32px; }
  .party h3 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #9CA3AF; margin-bottom: 8px; }
  .party p { font-size: 13px; color: #1F2937; line-height: 1.6; }
  .party strong { font-weight: 800; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  thead tr { background: #1F2937; color: white; }
  thead th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
  tbody tr { border-bottom: 1px solid #F3F4F6; }
  tbody tr:nth-child(even) { background: #F9FAFB; }
  tbody td { padding: 12px 16px; font-size: 13px; }
  .totals { margin-left: auto; width: 280px; }
  .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px solid #F3F4F6; }
  .totals-row.grand { font-size: 16px; font-weight: 900; color: #1F2937; border-bottom: none; padding-top: 12px; }
  .totals-row.grand span:last-child { color: #EF4444; }
  .footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: center; }
  .footer p { font-size: 11px; color: #9CA3AF; }
  .stamp { background: #FEF3C7; border: 2px solid #FBBF24; border-radius: 8px; padding: 8px 16px; font-size: 11px; font-weight: 900; color: #92400E; }
  .print-btn { position: fixed; bottom: 24px; right: 24px; background: #1F2937; color: white; border: none; padding: 14px 24px; border-radius: 12px; font-weight: 900; font-size: 14px; cursor: pointer; }
</style>
</head>
<body>
<div class="header">
  <div class="brand">
    <h1>CONON Infrabuilt</h1>
    <p>B2B Construction Material Delivery · 1-Hour Guarantee</p>
    <p>Lucknow, Uttar Pradesh — GSTIN: 09AAACC1234A1Z5</p>
    <span class="badge">TAX INVOICE</span>
  </div>
  <div class="invoice-meta">
    <h2>${invoiceNo}</h2>
    <p>Date: ${date}</p>
    <p>Due: ${dueDate}</p>
    <p style="margin-top:8px;color:#EF4444;font-weight:700;">⚠ ${entry.overdueDays > 0 ? entry.overdueDays + " days overdue" : "Due within 7 days"}</p>
  </div>
</div>

<div class="parties">
  <div class="party">
    <h3>From (Supplier)</h3>
    <p><strong>CONON Infrabuilt Pvt. Ltd.</strong></p>
    <p>7/14 Hazratganj, Lucknow — 226001</p>
    <p>Phone: +91-9999 00 1111</p>
    <p>Email: billing@conon.in</p>
    <p>GSTIN: 09AAACC1234A1Z5</p>
  </div>
  <div class="party">
    <h3>Bill To (Contractor)</h3>
    <p><strong>${esc(entry.name)}</strong></p>
    <p>Credit Account Holder</p>
    <p>Phone: +91-${esc(entry.phone)}</p>
    <p>Credit Limit: ₹${entry.creditLimit.toLocaleString("en-IN")}</p>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Description</th>
      <th>HSN Code</th>
      <th>Amount (₹)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>Construction Materials supplied on Khata credit (this billing cycle)</td>
      <td>2523</td>
      <td>₹${out.toLocaleString("en-IN")}</td>
    </tr>
    <tr>
      <td>2</td>
      <td>CGST @ 9%</td>
      <td>—</td>
      <td>₹${Math.round(gst/2).toLocaleString("en-IN")}</td>
    </tr>
    <tr>
      <td>3</td>
      <td>SGST @ 9%</td>
      <td>—</td>
      <td>₹${Math.round(gst/2).toLocaleString("en-IN")}</td>
    </tr>
  </tbody>
</table>

<div class="totals">
  <div class="totals-row"><span>Subtotal</span><span>₹${out.toLocaleString("en-IN")}</span></div>
  <div class="totals-row"><span>GST (18%)</span><span>₹${gst.toLocaleString("en-IN")}</span></div>
  <div class="totals-row grand"><span>TOTAL DUE</span><span>₹${total.toLocaleString("en-IN")}</span></div>
</div>

<div class="footer">
  <div>
    <p>Payment via: UPI · NEFT · RTGS · Cash</p>
    <p>UPI ID: conon@ybl | A/C: 1234 5678 9012 | IFSC: SBIN0001234</p>
  </div>
  <div class="stamp">CONON INFRABUILT<br>Authorized Signatory</div>
</div>

<button class="print-btn no-print" onclick="window.print()">🖨 Print / Save PDF</button>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

/* ── Account Statement (printable / Save-as-PDF ledger) ─────── */
router.get("/admin/khata/:id/statement", (req, res) => {
  const c = khataClients.find(k => k.id === req.params.id);
  if (!c) { res.status(404).json({ error: "Contractor not found" }); return; }
  const sorted = [...c.ledger].sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
  let bal = 0;
  const rows = sorted.map((t, i) => {
    bal += t.kind === "debit" ? t.amount : -t.amount;
    const d = new Date(t.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    return `<tr>
      <td>${i + 1}</td>
      <td>${d}</td>
      <td>${esc(t.description)}</td>
      <td style="text-align:right;color:#dc2626;font-weight:700;">${t.kind === "debit" ? "₹" + t.amount.toLocaleString("en-IN") : "—"}</td>
      <td style="text-align:right;color:#15803d;font-weight:700;">${t.kind === "credit" ? "₹" + t.amount.toLocaleString("en-IN") : "—"}</td>
      <td style="text-align:right;font-weight:800;">₹${bal.toLocaleString("en-IN")}</td>
    </tr>`;
  }).join("");
  const totalDebit = sumDebits(c);
  const totalCredit = sumCredits(c);
  const out = outstandingOf(c);
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const balLabel = out > 0 ? "Outstanding Due" : out < 0 ? "Advance Balance" : "Settled";
  const balColor = out > 0 ? "#dc2626" : "#15803d";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Statement — ${esc(c.name)}</title>
<style>
  @media print { body { margin: 0; } .no-print { display: none; } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', sans-serif; background: #fff; color: #1F2937; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 3px solid #1b4366; padding-bottom: 20px; }
  .brand h1 { font-size: 26px; font-weight: 900; color: #1b4366; }
  .brand p { font-size: 12px; color: #6B7280; margin-top: 4px; }
  .meta { text-align: right; }
  .meta h2 { font-size: 18px; font-weight: 900; color: #1F2937; }
  .meta p { font-size: 12px; color: #6B7280; margin-top: 4px; }
  .party { background:#F9FAFB; border-radius:10px; padding:16px 20px; margin-bottom:24px; display:flex; justify-content:space-between; }
  .party h3 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #9CA3AF; margin-bottom: 6px; }
  .party p { font-size: 13px; color: #1F2937; line-height: 1.5; }
  .party strong { font-weight: 800; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  thead tr { background: #1b4366; color: white; }
  thead th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
  thead th:nth-child(n+4) { text-align: right; }
  tbody tr { border-bottom: 1px solid #F3F4F6; }
  tbody tr:nth-child(even) { background: #F9FAFB; }
  tbody td { padding: 10px 14px; font-size: 12.5px; vertical-align: top; }
  tfoot td { padding: 12px 14px; font-size: 13px; font-weight: 800; border-top: 2px solid #1b4366; }
  .summary { margin-left:auto; width: 300px; }
  .summary-row { display:flex; justify-content:space-between; padding:7px 0; font-size:13px; border-bottom:1px solid #F3F4F6; }
  .summary-row.grand { font-size:16px; font-weight:900; border-bottom:none; padding-top:12px; }
  .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #E5E7EB; font-size: 11px; color: #9CA3AF; }
  .print-btn { position: fixed; bottom: 24px; right: 24px; background: #1b4366; color: white; border: none; padding: 14px 24px; border-radius: 12px; font-weight: 900; font-size: 14px; cursor: pointer; }
</style>
</head>
<body>
<div class="header">
  <div class="brand">
    <h1>CONON Infrabuilt</h1>
    <p>B2B Construction Material Delivery</p>
    <p>Lucknow, Uttar Pradesh — GSTIN: 09AAACC1234A1Z5</p>
  </div>
  <div class="meta">
    <h2>ACCOUNT STATEMENT</h2>
    <p>Generated: ${today}</p>
    <p>Account: ${esc(c.id)}</p>
  </div>
</div>

<div class="party">
  <div>
    <h3>Account Holder</h3>
    <p><strong>${esc(c.name)}</strong> — ${esc(c.type)}</p>
    <p>Phone: +91-${esc(c.phone)}</p>
  </div>
  <div style="text-align:right;">
    <h3>Approved Credit Limit</h3>
    <p><strong>₹${c.creditLimit.toLocaleString("en-IN")}</strong></p>
    <p style="color:${balColor};font-weight:800;">${balLabel}: ₹${Math.abs(out).toLocaleString("en-IN")}</p>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th>#</th><th>Date</th><th>Particulars</th>
      <th>Debit (₹)</th><th>Credit (₹)</th><th>Balance (₹)</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
  <tfoot>
    <tr>
      <td colspan="3" style="text-align:right;">TOTALS</td>
      <td style="text-align:right;color:#dc2626;">₹${totalDebit.toLocaleString("en-IN")}</td>
      <td style="text-align:right;color:#15803d;">₹${totalCredit.toLocaleString("en-IN")}</td>
      <td style="text-align:right;">₹${out.toLocaleString("en-IN")}</td>
    </tr>
  </tfoot>
</table>

<div class="summary">
  <div class="summary-row"><span>Total Purchases (Debit)</span><span>₹${totalDebit.toLocaleString("en-IN")}</span></div>
  <div class="summary-row"><span>Total Paid (Credit)</span><span>₹${totalCredit.toLocaleString("en-IN")}</span></div>
  <div class="summary-row grand"><span>${balLabel}</span><span style="color:${balColor};">₹${Math.abs(out).toLocaleString("en-IN")}</span></div>
</div>

<div class="footer">
  <p>This is a computer-generated statement and does not require a signature.</p>
  <p>Payment via: UPI conon@ybl · NEFT/RTGS A/C 1234 5678 9012 IFSC SBIN0001234 · Cash</p>
</div>

<button class="print-btn no-print" onclick="window.print()">🖨 Print / Save as PDF</button>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

/* ── Drivers ─────────────────────────────────────────────────── */
const mockDrivers = [
  { id: "D01", name: "Ravi Kumar",  vehicle: "Tractor UT-4422",  tripsThisWeek: 14, earnings: 8400, status: "active",   settled: false },
  { id: "D02", name: "Suresh Babu", vehicle: "Mini Truck LKO-2", tripsThisWeek: 11, earnings: 6600, status: "active",   settled: false },
  { id: "D03", name: "Kartik Rao",  vehicle: "Tractor UT-7891",  tripsThisWeek: 9,  earnings: 5400, status: "off-duty", settled: false },
  { id: "D04", name: "Deepak M.",   vehicle: "Loader JCB-X1",    tripsThisWeek: 7,  earnings: 4200, status: "active",   settled: true  },
  { id: "D05", name: "Rahul Yadav", vehicle: "Tractor UT-5512",  tripsThisWeek: 12, earnings: 7200, status: "active",   settled: false },
];

router.get("/admin/drivers", (_req, res) => res.json(mockDrivers));

router.post("/admin/drivers/:id/settle", (req, res) => {
  const driver = mockDrivers.find(d => d.id === req.params.id);
  if (!driver) { res.status(404).json({ error: "Driver not found" }); return; }
  driver.settled = true;
  res.json({ success: true, id: req.params.id, settled: driver.earnings });
});

/* ── Users / Vendors / Access Control ───────────────────────── */
const mockUsers: {
  id: string; role: "contractor" | "vendor" | "driver";
  name: string; phone: string; email: string; zone: string;
  pincode: string; category: string; status: "active" | "pending" | "banned";
  joinedAt: string; ordersCount: number; rating: number;
}[] = [
  // Contractors
  { id: "U01", role: "contractor", name: "Anand Constructions",  phone: "9812345678", email: "anand@constructions.in",  zone: "Gomti Nagar",  pincode: "226010", category: "Residential", status: "active",  joinedAt: "2024-03-15", ordersCount: 84,  rating: 4.8 },
  { id: "U02", role: "contractor", name: "Raja Infra Pvt Ltd",   phone: "9876543210", email: "raja@infraltd.in",        zone: "Indira Nagar", pincode: "226016", category: "Commercial", status: "active",  joinedAt: "2024-01-08", ordersCount: 142, rating: 4.5 },
  { id: "U03", role: "contractor", name: "Sharma Builders",      phone: "9898989898", email: "sharma@builders.in",      zone: "Aliganj",      pincode: "226024", category: "Residential", status: "active",  joinedAt: "2024-05-20", ordersCount: 51,  rating: 4.7 },
  { id: "U04", role: "contractor", name: "New Delhi Projects",   phone: "9111222333", email: "delhi@projects.in",       zone: "Chinhat",      pincode: "226028", category: "Industrial", status: "pending", joinedAt: "2025-05-22", ordersCount: 0,   rating: 0   },
  { id: "U05", role: "contractor", name: "Verma Constructions",  phone: "9444555666", email: "verma@const.in",          zone: "Aishbagh",     pincode: "226004", category: "Residential", status: "banned",  joinedAt: "2024-02-10", ordersCount: 12,  rating: 2.1 },
  // Vendors
  { id: "V01", role: "vendor", name: "UltraTech Dealers",        phone: "9222333444", email: "ultratech@lko.in",        zone: "Alambagh",     pincode: "226005", category: "Cement",     status: "active",  joinedAt: "2023-11-01", ordersCount: 320, rating: 4.9 },
  { id: "V02", role: "vendor", name: "Rathi Steel Suppliers",    phone: "9555666777", email: "rathi@steel.in",          zone: "Kanpur Road",  pincode: "226012", category: "Steel",      status: "active",  joinedAt: "2023-12-15", ordersCount: 215, rating: 4.7 },
  { id: "V03", role: "vendor", name: "Sand & Aggregate Depot",   phone: "9888999000", email: "sand@depot.in",           zone: "Gomti Nagar",  pincode: "226010", category: "Aggregate",  status: "active",  joinedAt: "2024-02-28", ordersCount: 178, rating: 4.3 },
  { id: "V04", role: "vendor", name: "Patel Bricks Factory",     phone: "9100200300", email: "patel@bricks.in",         zone: "Hazratganj",   pincode: "226001", category: "Bricks",     status: "pending", joinedAt: "2025-05-20", ordersCount: 0,   rating: 0   },
  // Drivers
  { id: "D01", role: "driver", name: "Ravi Kumar",               phone: "9812000001", email: "ravi@driver.in",          zone: "Gomti Nagar",  pincode: "226010", category: "Tractor",    status: "active",  joinedAt: "2024-04-01", ordersCount: 187, rating: 4.9 },
  { id: "D02", role: "driver", name: "Suresh Babu",              phone: "9812000002", email: "suresh@driver.in",        zone: "Indira Nagar", pincode: "226016", category: "Mini Truck", status: "active",  joinedAt: "2024-03-15", ordersCount: 142, rating: 4.6 },
  { id: "D03", role: "driver", name: "Kartik Rao",               phone: "9812000003", email: "kartik@driver.in",        zone: "Aliganj",      pincode: "226024", category: "Tractor",    status: "active",  joinedAt: "2024-06-10", ordersCount: 98,  rating: 4.4 },
];

router.get("/admin/users", (_req, res) => res.json(mockUsers));

router.patch("/admin/users/:id/status", (req, res) => {
  const user = mockUsers.find(u => u.id === req.params.id);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  const { status } = req.body as { status: "active" | "pending" | "banned" };
  if (!["active", "pending", "banned"].includes(status)) { res.status(400).json({ error: "Invalid status" }); return; }
  user.status = status;
  res.json({ success: true, id: req.params.id, status });
});

router.patch("/admin/users/:id/pincode", (req, res) => {
  const user = mockUsers.find(u => u.id === req.params.id);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  const { pincode, zone } = req.body as { pincode: string; zone: string };
  if (pincode) user.pincode = pincode;
  if (zone) user.zone = zone;
  res.json({ success: true, id: req.params.id, pincode: user.pincode, zone: user.zone });
});

/* ── Vendor payouts ─────────────────────────────────────────── */

router.get("/admin/payouts", async (_req, res) => {
  const rows = await db
    .select()
    .from(vendorPayoutsTable)
    .orderBy(desc(vendorPayoutsTable.requestedAt));
  res.json(
    rows.map((p) => ({
      id: p.externalId,
      vendorStore: p.vendorStore,
      amount: parseFloat(p.amount),
      status: p.status,
      requestedAt: p.requestedAt,
      approvedAt: p.approvedAt,
    })),
  );
});

router.post("/admin/payouts/:id/approve", async (req, res) => {
  const [current] = await db
    .select()
    .from(vendorPayoutsTable)
    .where(eq(vendorPayoutsTable.externalId, req.params.id))
    .limit(1);

  if (!current) {
    res.status(404).json({ error: "Payout request not found." });
    return;
  }
  if (current.status === "approved") {
    res.status(409).json({ error: "Payout already approved." });
    return;
  }

  const [updated] = await db
    .update(vendorPayoutsTable)
    .set({ status: "approved", approvedAt: new Date() })
    .where(eq(vendorPayoutsTable.externalId, req.params.id))
    .returning();

  res.json({
    id: updated.externalId,
    vendorStore: updated.vendorStore,
    amount: parseFloat(updated.amount),
    status: updated.status,
    requestedAt: updated.requestedAt,
    approvedAt: updated.approvedAt,
  });
});

export default router;
