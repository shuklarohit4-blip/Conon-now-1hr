import { Router, type IRouter, type Request, type Response } from "express";
import { pool } from "@workspace/db";
import { requireAdmin } from "../middleware/adminAuth";
import { getIo } from "../socket";
import {
  DEFAULT_SERVICEABILITY_CONFIG,
  sanitizePincode,
  type ServiceableZoneConfig,
  type ZoneDef,
} from "../utils/serviceabilityPolicy";

const router: IRouter = Router();

let liveConfig: ServiceableZoneConfig = {
  strictPincodeLock: DEFAULT_SERVICEABILITY_CONFIG.strictPincodeLock,
  activePincodes: [...DEFAULT_SERVICEABILITY_CONFIG.activePincodes],
};

const memoryWaitlist: Array<{
  id: string;
  pincode: string;
  phone: string;
  areaHint?: string;
  createdAt: string;
}> = [];

let tablesReady = false;
async function ensureServiceabilityTables() {
  if (tablesReady) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS serviceable_pincodes (
        pincode VARCHAR(10) PRIMARY KEY,
        area_name VARCHAR(160) NOT NULL,
        sla_mins INT NOT NULL DEFAULT 60,
        active BOOLEAN NOT NULL DEFAULT true,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS pincode_waitlist_requests (
        id VARCHAR(80) PRIMARY KEY,
        pincode VARCHAR(10) NOT NULL,
        phone VARCHAR(30) NOT NULL,
        area_hint VARCHAR(160),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    for (const z of DEFAULT_SERVICEABILITY_CONFIG.activePincodes) {
      await pool.query(
        `INSERT INTO serviceable_pincodes (pincode, area_name, sla_mins, active)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (pincode) DO NOTHING`,
        [z.pincode, z.areaName, z.slaMins, z.active],
      );
    }
    tablesReady = true;
  } catch {
    // Graceful fallback if Postgres offline in local dev
  }
}

export function getLiveServiceabilityConfig(): ServiceableZoneConfig {
  return liveConfig;
}

router.get("/serviceability/zones", async (_req: Request, res: Response) => {
  await ensureServiceabilityTables();
  try {
    const result = await pool.query(
      "SELECT pincode, area_name, sla_mins, active FROM serviceable_pincodes ORDER BY pincode ASC",
    );
    if (result.rows.length > 0) {
      liveConfig = {
        ...liveConfig,
        activePincodes: result.rows.map((r) => ({
          pincode: String(r.pincode),
          areaName: String(r.area_name),
          slaMins: Number(r.sla_mins || 60),
          active: Boolean(r.active),
        })),
      };
    }
  } catch {
    // Use memory fallback
  }
  res.json({ ok: true, config: liveConfig });
});

router.post("/serviceability/waitlist", async (req: Request, res: Response) => {
  await ensureServiceabilityTables();
  const pincode = sanitizePincode(req.body?.pincode);
  const phone = String(req.body?.phone || "").trim();
  const areaHint = String(req.body?.areaHint || "").trim();

  if (!/^\d{6}$/.test(pincode) || phone.replace(/\D/g, "").length < 10) {
    res.status(400).json({ ok: false, error: "Valid 6-digit pincode and 10-digit phone are required." });
    return;
  }

  const entry = {
    id: String(req.body?.id || `wl_${Date.now()}`),
    pincode,
    phone,
    areaHint: areaHint || undefined,
    createdAt: new Date().toISOString(),
  };
  memoryWaitlist.unshift(entry);
  try {
    await pool.query(
      `INSERT INTO pincode_waitlist_requests (id, pincode, phone, area_hint) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
      [entry.id, entry.pincode, entry.phone, entry.areaHint || null],
    );
  } catch {
    // Non-fatal if DB offline
  }
  res.status(201).json({ ok: true, entry });
});

router.put("/admin/serviceability/zones", requireAdmin, async (req: Request, res: Response) => {
  await ensureServiceabilityTables();
  const body = req.body || {};
  const strictPincodeLock = body.strictPincodeLock !== undefined ? Boolean(body.strictPincodeLock) : true;
  const incoming: ZoneDef[] = Array.isArray(body.activePincodes)
    ? body.activePincodes
        .map((z: any) => ({
          pincode: sanitizePincode(z.pincode),
          areaName: String(z.areaName || `Lucknow ${z.pincode}`),
          slaMins: Math.max(15, Number(z.slaMins || 60)),
          active: z.active !== false,
        }))
        .filter((z: ZoneDef) => /^\d{6}$/.test(z.pincode))
    : liveConfig.activePincodes;

  liveConfig = { strictPincodeLock, activePincodes: incoming };

  try {
    await pool.query("DELETE FROM serviceable_pincodes");
    for (const z of incoming) {
      await pool.query(
        `INSERT INTO serviceable_pincodes (pincode, area_name, sla_mins, active) VALUES ($1, $2, $3, $4)`,
        [z.pincode, z.areaName, z.slaMins, z.active],
      );
    }
  } catch {
    // Memory config still updated
  }

  try {
    getIo()?.emit("serviceability:zones_updated", liveConfig);
  } catch {
    // optional
  }

  res.json({ ok: true, config: liveConfig });
});

router.get("/admin/serviceability/waitlist", requireAdmin, async (_req: Request, res: Response) => {
  await ensureServiceabilityTables();
  try {
    const result = await pool.query(
      "SELECT id, pincode, phone, area_hint, created_at FROM pincode_waitlist_requests ORDER BY created_at DESC LIMIT 200",
    );
    res.json({
      ok: true,
      waitlist: result.rows.map((r) => ({
        id: r.id,
        pincode: r.pincode,
        phone: r.phone,
        areaHint: r.area_hint || undefined,
        createdAt: r.created_at,
      })),
    });
    return;
  } catch {
    res.json({ ok: true, waitlist: memoryWaitlist });
  }
});

export default router;
