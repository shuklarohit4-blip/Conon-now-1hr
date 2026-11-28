import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
import { ecosystemEngine } from "./ecosystemEngine";
import { getIo, adminRoom } from "../socket";
import { REPO_ROOT } from "../lib/paths";
import { logger } from "../lib/logger";

export type SyncEventType =
  | "CATEGORIES_UPDATED"
  | "CATALOG_UPDATED"
  | "SETTINGS_UPDATED"
  | "BANNERS_UPDATED"
  | "MERCHANDISING_UPDATED"
  | "SEARCH_UPDATED"
  | "ORDERS_UPDATED"
  | "PARTNERS_UPDATED"
  | "FORCE_SYNC";

export interface AdminActivityEntry {
  id: string;
  type: SyncEventType;
  action: string;
  summary: string;
  entityId?: string;
  actor?: string;
  timestamp: string;
}

const ACTIVITY_FILE = path.resolve(REPO_ROOT, "artifacts/api-server/data/admin-activity.json");
const MAX_ACTIVITY = 60;

class SyncBus {
  private activities: AdminActivityEntry[] = [];
  private loaded = false;

  private ensureLoaded() {
    if (this.loaded) return;
    this.loaded = true;
    try {
      if (fs.existsSync(ACTIVITY_FILE)) {
        const raw = JSON.parse(fs.readFileSync(ACTIVITY_FILE, "utf8"));
        if (Array.isArray(raw)) this.activities = raw.slice(0, MAX_ACTIVITY);
      }
    } catch {
      this.activities = [];
    }
  }

  private persist() {
    try {
      fs.mkdirSync(path.dirname(ACTIVITY_FILE), { recursive: true });
      fs.writeFileSync(ACTIVITY_FILE, JSON.stringify(this.activities.slice(0, MAX_ACTIVITY), null, 2), "utf8");
    } catch {
      // Non-fatal
    }
  }

  public getRecentActivity(limit = 25): AdminActivityEntry[] {
    this.ensureLoaded();
    return this.activities.slice(0, limit);
  }

  public publish(opts: {
    type: SyncEventType;
    entityId?: string;
    summary: string;
    action?: string;
    actor?: string;
    socketEvent?: string;
    socketPayload?: any;
  }): AdminActivityEntry {
    this.ensureLoaded();
    const entry: AdminActivityEntry = {
      id: `act_${Date.now()}_${crypto.randomBytes(2).toString("hex")}`,
      type: opts.type,
      action: opts.action || "UPDATE",
      summary: opts.summary,
      entityId: opts.entityId,
      actor: opts.actor || "Admin OS",
      timestamp: new Date().toISOString(),
    };
    this.activities = [entry, ...this.activities].slice(0, MAX_ACTIVITY);
    this.persist();

    const ssePayload = {
      type: opts.type,
      entityId: opts.entityId || null,
      summary: opts.summary,
      timestamp: Date.now(),
      isoTimestamp: entry.timestamp,
    };

    try {
      ecosystemEngine.broadcast("sync", ssePayload);
      ecosystemEngine.broadcast(opts.type, ssePayload);
    } catch (err) {
      logger.warn({ err }, "[SyncBus] SSE broadcast failed");
    }

    try {
      const io = getIo();
      if (io) {
        io.emit("conon:sync", ssePayload);
        io.to(adminRoom()).emit("admin:activity", entry);
        if (opts.socketEvent) {
          io.emit(opts.socketEvent, opts.socketPayload ?? ssePayload);
          io.to(adminRoom()).emit(opts.socketEvent, opts.socketPayload ?? ssePayload);
        }
      }
    } catch {
      // Socket optional
    }

    return entry;
  }

  public getLanAddresses(): string[] {
    const interfaces = os.networkInterfaces();
    const ips: string[] = [];
    for (const ifaceList of Object.values(interfaces)) {
      if (!ifaceList) continue;
      for (const iface of ifaceList) {
        if (iface.family === "IPv4" && !iface.internal && iface.address) {
          ips.push(iface.address);
        }
      }
    }
    return Array.from(new Set(ips));
  }
}

export const syncBus = new SyncBus();
