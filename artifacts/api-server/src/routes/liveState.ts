import { Router, type IRouter, type Request, type Response } from "express";
import fs from "fs";
import path from "path";
import { pool } from "@workspace/db";
import { requireAdmin } from "../middleware/adminAuth";
import { getIo } from "../socket";
import { REPO_ROOT } from "../lib/paths";
import { logger } from "../lib/logger";

const router: IRouter = Router();
const FALLBACK_STATE_PATH = path.resolve(REPO_ROOT, "artifacts/api-server/data/conon-live-state.json");

const DEFAULT_STATE = {
  version: 1,
  globalControls: {
    rainMode: false,
    storefrontBanner: {
      enabled: false,
      text: "",
      badge: "LIVE",
      tone: "emerald",
    },
    deliverySlaMins: 60,
    emergencyPause: false,
  },
  categories: { customCategories: [], hiddenCategorySlugs: [], overrides: {} },
  products: { customProducts: [], hiddenProductIds: [], overrides: {} },
  mandiRates: {},
  servicesAndRentals: {
    serviceOverrides: {},
    customServices: [],
    rentalOverrides: {},
    customRentals: [],
  },
  operations: {
    orders: [],
    kycApplications: [],
    approvedVendors: [],
    approvedDrivers: [],
    escrowItems: [],
    disputes: [],
    feedback: [],
    siteDna: {},
  },
};

function isPlainObject(v: unknown): v is Record<string, any> {
  return Boolean(v && typeof v === "object" && !Array.isArray(v));
}

function deepMerge(target: Record<string, any>, patch: Record<string, any>): Record<string, any> {
  const out = { ...target };
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) continue;
    if (isPlainObject(v) && isPlainObject(out[k])) {
      out[k] = deepMerge(out[k], v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

let inMemoryLiveState: Record<string, any> = (() => {
  try {
    if (fs.existsSync(FALLBACK_STATE_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(FALLBACK_STATE_PATH, "utf8"));
      return deepMerge(structuredClone(DEFAULT_STATE), isPlainObject(parsed) ? parsed : {});
    }
  } catch {
    // ignore
  }
  return structuredClone(DEFAULT_STATE);
})();

let pgInitialized = false;
async function ensureLiveStateTable(): Promise<boolean> {
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL && !process.env.PGURI) {
    return false;
  }
  try {
    if (!pgInitialized) {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS conon_live_state (
          id TEXT PRIMARY KEY,
          version BIGINT NOT NULL DEFAULT 1,
          state JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      pgInitialized = true;
    }
    return true;
  } catch {
    return false;
  }
}

async function readLiveState(): Promise<Record<string, any>> {
  if (await ensureLiveStateTable()) {
    try {
      const res = await pool.query("SELECT state FROM conon_live_state WHERE id = 'master' LIMIT 1");
      if (res.rows?.[0]?.state) {
        inMemoryLiveState = deepMerge(structuredClone(DEFAULT_STATE), res.rows[0].state);
        return inMemoryLiveState;
      }
    } catch (err: any) {
      logger.warn({ err: err?.message }, "[LiveState] PostgreSQL read fallback");
    }
  }
  return inMemoryLiveState;
}

async function persistLiveState(nextState: Record<string, any>): Promise<boolean> {
  inMemoryLiveState = nextState;
  try {
    fs.mkdirSync(path.dirname(FALLBACK_STATE_PATH), { recursive: true });
    fs.writeFileSync(FALLBACK_STATE_PATH, JSON.stringify(nextState, null, 2), "utf8");
  } catch {
    // ignore disk write errors in read-only containers
  }

  if (await ensureLiveStateTable()) {
    try {
      await pool.query(
        `
          INSERT INTO conon_live_state (id, version, state, updated_at)
          VALUES ('master', $1, $2::jsonb, NOW())
          ON CONFLICT (id) DO UPDATE
            SET version = EXCLUDED.version,
                state = EXCLUDED.state,
                updated_at = NOW();
        `,
        [Number(nextState.version || 1), JSON.stringify(nextState)]
      );
      return true;
    } catch (err: any) {
      logger.warn({ err: err?.message }, "[LiveState] PostgreSQL write fallback");
    }
  }
  return false;
}

/**
 * PUBLIC READ: Storefront, Vendor OS, Driver Cockpit read live state snapshot
 */
router.get("/live-state", async (_req: Request, res: Response) => {
  const state = await readLiveState();
  res.json({
    ok: true,
    version: Number(state.version || 1),
    state,
  });
});

/**
 * ADMIN-GATED PATCH: Updates global controls, products, categories, mandi rates, services/rentals
 * and broadcasts conon:master_state_updated via Socket.io immediately.
 */
router.patch("/live-state", requireAdmin, async (req: Request, res: Response) => {
  try {
    const patch = isPlainObject(req.body?.patch) ? req.body.patch : isPlainObject(req.body) ? req.body : {};
    const current = await readLiveState();
    const merged = deepMerge(current, patch);
    merged.version = Math.max(Date.now(), Number(current.version || 0) + 1);
    merged.updatedAt = new Date().toISOString();

    const savedToPg = await persistLiveState(merged);
    getIo()?.emit("conon:master_state_updated", {
      version: merged.version,
      state: merged,
      domain: req.body?.domain || "all",
    });

    res.json({
      ok: true,
      version: merged.version,
      savedToPg,
      state: merged,
    });
  } catch (err: any) {
    res.status(400).json({
      ok: false,
      error: err?.message || "Failed to update live state",
    });
  }
});

export default router;
