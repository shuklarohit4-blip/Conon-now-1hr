import fs from "node:fs";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin, ViteDevServer } from "vite";

export interface CononSyncPluginOptions {
  isLocalAdmin?: boolean;
}

export const DEFAULT_LIVE_STATE = {
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
  categories: {
    customCategories: [],
    hiddenCategorySlugs: [],
    overrides: {},
  },
  products: {
    customProducts: [],
    hiddenProductIds: [],
    overrides: {},
  },
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
  treasury: {
    companyAccounts: [],
    ledger: [],
  },
};

const MAX_BODY_BYTES = 25 * 1024 * 1024;

function isPlainObject(val: unknown): val is Record<string, any> {
  return Boolean(val && typeof val === "object" && !Array.isArray(val));
}

export function deepMergeLiveState(target: Record<string, any>, patch: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = { ...target };
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) continue;
    if (isPlainObject(v) && isPlainObject(out[k])) {
      out[k] = deepMergeLiveState(out[k], v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

export function readLiveStateFile(statePath: string): Record<string, any> {
  if (!fs.existsSync(statePath)) {
    return structuredClone(DEFAULT_LIVE_STATE);
  }
  try {
    const raw = JSON.parse(fs.readFileSync(statePath, "utf8"));
    return deepMergeLiveState(structuredClone(DEFAULT_LIVE_STATE), isPlainObject(raw) ? raw : {});
  } catch {
    return structuredClone(DEFAULT_LIVE_STATE);
  }
}

export function writeLiveStateAtomic(statePath: string, nextState: Record<string, any>): void {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  const tmpPath = `${statePath}.${process.pid}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(nextState, null, 2), "utf8");
  fs.renameSync(tmpPath, statePath);
}

export function patchLiveStateFile(statePath: string, patch: Record<string, any>): Record<string, any> {
  const current = readLiveStateFile(statePath);
  const merged = deepMergeLiveState(current, patch);
  merged.version = Math.max(Date.now(), Number(current.version || 0) + 1);
  merged.updatedAt = new Date().toISOString();
  writeLiveStateAtomic(statePath, merged);
  return merged;
}

function readJsonBody(req: IncomingMessage): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let bytes = 0;
    req.on("data", (c: Buffer) => {
      bytes += c.length;
      if (bytes > MAX_BODY_BYTES) {
        reject(new Error("Payload exceeds 25 MB limit"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON request body"));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, statusCode: number, data: unknown): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(data));
}

export function cononSyncPlugin(options: CononSyncPluginOptions = {}): Plugin {
  const cononDir = path.resolve(import.meta.dirname);
  const publicDir = path.join(cononDir, "public");
  const statePath = path.join(publicDir, "conon-live-state.json");
  const mediaManifestPath = path.join(publicDir, "real-products", "manifest.json");

  let isServeCommand = false;

  return {
    name: "vite-plugin-conon-sync",

    configResolved(config) {
      isServeCommand = config.command === "serve";
    },

    buildStart() {
      if (!fs.existsSync(statePath)) {
        writeLiveStateAtomic(statePath, structuredClone(DEFAULT_LIVE_STATE));
      }
    },

    configureServer(server: ViteDevServer) {
      if (!isServeCommand || !options.isLocalAdmin) {
        return;
      }

      if (!fs.existsSync(statePath)) {
        writeLiveStateAtomic(statePath, structuredClone(DEFAULT_LIVE_STATE));
      }

      server.middlewares.use("/__conon-live/ping", (req, res, next) => {
        if (req.method !== "GET") return next();
        const state = readLiveStateFile(statePath);
        sendJson(res, 200, {
          ok: true,
          mode: "local-disk",
          version: Number(state.version || 1),
          timestamp: new Date().toISOString(),
        });
      });

      server.middlewares.use("/__conon-live/state", (req, res, next) => {
        if (req.method !== "GET") return next();
        const state = readLiveStateFile(statePath);
        let mediaManifest: Record<string, any> = {};
        if (fs.existsSync(mediaManifestPath)) {
          try {
            mediaManifest = JSON.parse(fs.readFileSync(mediaManifestPath, "utf8"));
          } catch {
            mediaManifest = {};
          }
        }
        sendJson(res, 200, {
          ok: true,
          version: Number(state.version || 1),
          state,
          mediaManifest,
        });
      });

      server.middlewares.use("/__conon-live/patch", async (req, res, next) => {
        if (req.method !== "POST") return next();
        try {
          const body = await readJsonBody(req);
          const patch = isPlainObject(body.patch) ? body.patch : body;
          const nextState = patchLiveStateFile(statePath, patch);
          sendJson(res, 200, {
            ok: true,
            version: nextState.version,
            state: nextState,
          });
        } catch (err: any) {
          sendJson(res, 400, {
            ok: false,
            error: err?.message || "Failed to patch conon-live-state.json",
          });
        }
      });
    },
  };
}
