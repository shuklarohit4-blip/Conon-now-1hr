import fs from "fs";
import path from "path";
import { Router, type IRouter, type Request, type Response } from "express";
import { hasPostgresConfigured, pool } from "@workspace/db";
import { requireAdmin } from "../middleware/adminAuth";
import { REPO_ROOT } from "../lib/paths";
import { getIo } from "../socket";
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
const RMC_FALLBACK_FILE = path.resolve(REPO_ROOT, "artifacts/api-server/data/rmc-orders.json");

function readRmcFallbackOrders(): any[] {
  try {
    if (fs.existsSync(RMC_FALLBACK_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(RMC_FALLBACK_FILE, "utf8"));
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Non-fatal fallback read
  }
  return [];
}

function writeRmcFallbackOrders(orders: any[]) {
  try {
    const dir = path.dirname(RMC_FALLBACK_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(RMC_FALLBACK_FILE, JSON.stringify(orders, null, 2), "utf8");
  } catch {
    // Non-fatal fallback persist
  }
}

let rmcTablesReady = false;
async function ensureRmcTables(): Promise<boolean> {
  if (!hasPostgresConfigured()) return false;
  if (rmcTablesReady) return true;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rmc_plant_listings (
        id VARCHAR(80) PRIMARY KEY,
        vendor_hub_id VARCHAR(80) NOT NULL,
        plant_name VARCHAR(160) NOT NULL,
        capacity_m3_hr INT NOT NULL DEFAULT 60,
        tm_fleet_count INT NOT NULL DEFAULT 4,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS rmc_convoy_orders (
        id VARCHAR(80) PRIMARY KEY,
        short_id VARCHAR(40) NOT NULL UNIQUE,
        grade_slug VARCHAR(80) NOT NULL,
        volume_m3 NUMERIC(10, 2) NOT NULL,
        pump_type VARCHAR(80) NOT NULL,
        admixture_slug VARCHAR(80),
        tm_count INT NOT NULL DEFAULT 1,
        eway_bill_no VARCHAR(80),
        total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
        escrow_status VARCHAR(30) NOT NULL DEFAULT 'LOCKED',
        payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS rmc_transit_trucks (
        id VARCHAR(80) PRIMARY KEY,
        order_id VARCHAR(80) NOT NULL,
        tm_index INT NOT NULL,
        batch_time TIMESTAMPTZ,
        wc_ratio VARCHAR(20),
        plant_temp_c NUMERIC(5, 2),
        batch_slip_url TEXT,
        slump_mm INT,
        slump_photo_url TEXT,
        status VARCHAR(30) NOT NULL DEFAULT 'QUEUED'
      );
      CREATE TABLE IF NOT EXISTS rmc_cube_lab_tests (
        id VARCHAR(80) PRIMARY KEY,
        order_id VARCHAR(80) NOT NULL,
        day7_mpa NUMERIC(6, 2),
        day7_report_url TEXT,
        day28_mpa NUMERIC(6, 2),
        day28_report_url TEXT,
        passed BOOLEAN
      );
    `);
    rmcTablesReady = true;
    return true;
  } catch {
    return false;
  }
}

router.get("/rmc/orders", async (_req: Request, res: Response) => {
  if (await ensureRmcTables()) {
    try {
      const result = await pool.query(
        "SELECT payload_json FROM rmc_convoy_orders ORDER BY created_at DESC LIMIT 100"
      );
      res.json({ ok: true, orders: result.rows.map((r) => r.payload_json) });
      return;
    } catch {
      // Fallback safely to local JSON store
    }
  }
  const fallbackOrders = readRmcFallbackOrders();
  res.json({ ok: true, orders: fallbackOrders, source: "fallback" });
});

router.post("/rmc/orders", async (req: Request, res: Response) => {
  try {
    const o = req.body || {};
    const rawPin = o.sitePincode || o.deliveryPincode || extractPincodeFromText(o.siteAddress);
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
    const rmcTraffic = evaluateDispatchCompliance({
      domain: "RMC",
      totalWeightKg: Number(o.volumeM3 || 6) * 2400,
      pincode: pinCheck.pincode,
      dispatchMode: o.dispatchMode,
    });
    if (rmcTraffic.illegalDaytimeHeavy) {
      res.status(400).json({
        ok: false,
        code: "NO_ENTRY_BLOCKED",
        error: "Lucknow Daytime Heavy No-Entry Active (06:00–23:00) for RMC Transit Mixers. Schedule Legal Night Window (11 PM – 6 AM).",
      });
      return;
    }
    const policy = evaluatePaymentPolicy({
      domain: "RMC",
      grandTotal: Number(o.totalAmount || 0),
    });
    if (!policy.allowPod && isPodRequested(o.paymentMode)) {
      res.status(400).json({
        ok: false,
        code: "PREPAID_REQUIRED",
        error: "Upfront prepaid payment is mandatory for RMC, Services, Machine Rentals, and orders of ₹10,000 or above.",
      });
      return;
    }
    if (policy.requirePrepaid && !isVerifiedPrepaidEscrow(o.paymentStatus, o.paymentRef)) {
      res.status(402).json({
        ok: false,
        code: "PAYMENT_REQUIRED",
        error: "Verified upfront escrow payment is required before RMC convoy booking.",
      });
      return;
    }

    if (await ensureRmcTables()) {
      try {
        await pool.query(
          `INSERT INTO rmc_convoy_orders
            (id, short_id, grade_slug, volume_m3, pump_type, admixture_slug, tm_count, eway_bill_no, total_amount, escrow_status, payload_json)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
           ON CONFLICT (id) DO UPDATE SET
            eway_bill_no = EXCLUDED.eway_bill_no,
            escrow_status = EXCLUDED.escrow_status,
            payload_json = EXCLUDED.payload_json`,
          [
            o.id,
            o.shortId,
            o.gradeId || "rmc-m25-rcc",
            Number(o.volumeM3 || 6),
            o.pumpId || "pump-direct-chute",
            o.admixtureId || null,
            Number(o.tmCount || 1),
            o.ewayBillNo || null,
            Number(o.totalAmount || 0),
            o.escrowStatus || "LOCKED",
            JSON.stringify(o),
          ]
        );
      } catch {
        // Persist in fallback store
      }
    }

    const existing = readRmcFallbackOrders();
    const updated = [o, ...existing.filter((x) => x.id !== o.id)].slice(0, 100);
    writeRmcFallbackOrders(updated);

    try {
      getIo()?.emit("rmc:convoy_updated", o);
    } catch {
      // optional
    }
    res.json({ ok: true, order: o });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message || "Failed to create RMC convoy order" });
  }
});

router.post("/rmc/batch-dispatch", async (req: Request, res: Response) => {
  const b = req.body || {};
  const truckId = `${b.orderId}_tm_${b.tmIndex || 1}`;
  if (await ensureRmcTables()) {
    try {
      await pool.query(
        `INSERT INTO rmc_transit_trucks
          (id, order_id, tm_index, batch_time, wc_ratio, plant_temp_c, batch_slip_url, status)
         VALUES ($1,$2,$3,NOW(),$4,$5,$6,'EN_ROUTE')
         ON CONFLICT (id) DO UPDATE SET
          batch_time = NOW(), wc_ratio = EXCLUDED.wc_ratio, plant_temp_c = EXCLUDED.plant_temp_c, status = 'EN_ROUTE'`,
        [truckId, b.orderId, Number(b.tmIndex || 1), b.wcRatio || "0.45", Number(b.plantTempC || 27), b.batchSlipUrl || null]
      );
    } catch {}
  }
  res.json({ ok: true, truckId });
});

router.post("/rmc/slump-checkin", async (req: Request, res: Response) => {
  const b = req.body || {};
  const truckId = `${b.orderId}_tm_${b.tmIndex || 1}`;
  if (await ensureRmcTables()) {
    try {
      await pool.query(
        `UPDATE rmc_transit_trucks SET slump_mm = $2, slump_photo_url = $3, status = 'POURING' WHERE id = $1`,
        [truckId, Number(b.slumpMm || 120), b.slumpPhotoUrl || null]
      );
    } catch {}
  }
  res.json({ ok: true, truckId });
});

router.post("/rmc/cube-report", async (req: Request, res: Response) => {
  const b = req.body || {};
  const id = `cube_${b.orderId}`;
  if (await ensureRmcTables()) {
    try {
      await pool.query(
        `INSERT INTO rmc_cube_lab_tests (id, order_id, day7_mpa, day7_report_url, day28_mpa, day28_report_url, passed)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (id) DO UPDATE SET
          day7_mpa = COALESCE(EXCLUDED.day7_mpa, rmc_cube_lab_tests.day7_mpa),
          day28_mpa = COALESCE(EXCLUDED.day28_mpa, rmc_cube_lab_tests.day28_mpa),
          passed = COALESCE(EXCLUDED.passed, rmc_cube_lab_tests.passed)`,
        [id, b.orderId, b.day7Mpa ?? null, b.day7ReportUrl ?? null, b.day28Mpa ?? null, b.day28ReportUrl ?? null, b.passed ?? null]
      );
    } catch {}
  }
  res.json({ ok: true, id });
});

router.post("/rmc/release-escrow", requireAdmin, async (req: Request, res: Response) => {
  const { orderId } = req.body || {};
  if (await ensureRmcTables()) {
    try {
      await pool.query(
        "UPDATE rmc_convoy_orders SET escrow_status = 'SETTLED' WHERE id = $1 OR short_id = $1",
        [orderId]
      );
    } catch {}
  }
  const existing = readRmcFallbackOrders();
  writeRmcFallbackOrders(
    existing.map((o) =>
      o.id === orderId || o.shortId === orderId ? { ...o, escrowStatus: "SETTLED" } : o
    )
  );
  res.json({ ok: true, orderId });
});

export default router;
