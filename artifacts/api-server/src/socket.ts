import type { Server as HttpServer } from "http";
import { Server, type Socket } from "socket.io";
import { collection } from "@workspace/db";
import { logger } from "./lib/logger";
import { verifyJwt } from "./lib/jwt";

let io: Server | null = null;

// Global Rain-Shield "Tarpaulin Lock" mode state
let isRainModeActive = false;

// Active 180s Auto-Cascade Watchdog timers
interface CascadeRecord {
  orderId: string;
  orderData: any;
  currentHubId: string;
  assignedIndex: number;
  expiresAt: number;
  timer: NodeJS.Timeout;
}
const activeCascades = new Map<string, CascadeRecord>();

// GPS Detention Auto-Meter timers
interface DetentionRecord {
  orderId: string;
  driverId?: string;
  arrivedAt: number;
  freeWindowEndsAt: number;
  detentionMinutes: number;
  detentionCharge: number;
  interval?: NodeJS.Timeout;
}
const activeDetentions = new Map<string, DetentionRecord>();

// Lucknow Corridors & Vendor Hubs Catalog
export interface LucknowHub {
  hubId: string;
  name: string;
  zone: string;
  lat: number;
  lng: number;
  stockFlags: Record<string, boolean>;
  escrowBalance: number;
  settledBalance: number;
  isOnline: boolean;
}

export const LUCKNOW_HUBS: LucknowHub[] = [];

// Room names
export function adminRoom(): string {
  return "admin:command_os";
}

export function vendorRoom(hubId: string): string {
  return `vendor:${hubId}`;
}

export function driverRoom(driverId: string): string {
  return `driver:${driverId}`;
}

export function orderRoom(orderId: string): string {
  return `order:${orderId}`;
}

export function applicantRoom(applicantId: string): string {
  return `applicant:${applicantId}`;
}

// Global Dispatch Audit Event Logger
export interface DispatchAuditRecord {
  id: string;
  orderId: string;
  eventType: string;
  payload: any;
  createdAt: string;
}

const dispatchAuditLog: DispatchAuditRecord[] = [];

export function logDispatchEvent(orderId: string, eventType: string, payload: any): DispatchAuditRecord {
  const record: DispatchAuditRecord = {
    id: `disp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    orderId,
    eventType,
    payload,
    createdAt: new Date().toISOString(),
  };
  dispatchAuditLog.push(record);
  logger.info({ orderId, eventType }, `[Dispatch Audit] ${eventType}`);
  return record;
}

export function getDispatchAuditLog(orderId?: string): DispatchAuditRecord[] {
  if (orderId) {
    return dispatchAuditLog.filter((l) => l.orderId === orderId);
  }
  return dispatchAuditLog;
}

/* ─────────────────────────────────────────────────────────────
 * Rain-Shield "Tarpaulin Lock" (Global Weather Mode)
 * ───────────────────────────────────────────────────────────── */
export function setRainMode(active: boolean): boolean {
  isRainModeActive = active;
  logDispatchEvent("GLOBAL", "RAIN_MODE_TOGGLED", { rainMode: active });
  if (io) {
    io.emit("system:rain_mode_changed", {
      rainMode: isRainModeActive,
      activatedAt: new Date().toISOString(),
      message: active
        ? "🌧️ Global Rain-Shield Tirpal Mode ACTIVE: Tarpaulin verification mandatory for cement & civil materials!"
        : "☀️ Weather Cleared: Normal dispatch mode restored.",
    });
  }
  return isRainModeActive;
}

export function getRainMode(): boolean {
  return isRainModeActive;
}

export function isMoistureSensitive(items: any[]): boolean {
  if (!Array.isArray(items)) return false;
  const sensitiveKeywords = [
    "cement",
    "putty",
    "pop",
    "plaster",
    "birla",
    "ultratech",
    "gypsum",
    "acc",
    "amrit",
  ];
  return items.some((item) => {
    const text = `${item.name || ""} ${item.category || ""} ${item.skuId || ""}`.toLowerCase();
    return sensitiveKeywords.some((kw) => text.includes(kw));
  });
}

/* ─────────────────────────────────────────────────────────────
 * Smart Multi-Stop Clubbing & Vehicle Load Guard
 * ───────────────────────────────────────────────────────────── */
export interface StopDetail {
  stopId: string;
  hubId: string;
  hubName: string;
  sequenceNo: number;
  pickupQrToken: string;
  isLoaded: boolean;
  materialSummary?: string;
}

export interface MultiStopPlan {
  weightKg: number;
  vehicleType: "BIKE_EXPRESS" | "CHHOTA_HATHI";
  vehicleLabel: string;
  stops: StopDetail[];
}

export function computeMultiStopPlan(items: any[], primaryHubId = "hub-naka"): MultiStopPlan {
  let totalWeightKg = 0;
  let hasPlumbing = false;
  let hasCivil = false;

  for (const item of items || []) {
    const qty = Number(item.qty || 1);
    const weight = Number(item.weightKg) || (item.name?.toLowerCase().includes("cement") ? 50 : 2);
    totalWeightKg += weight * qty;

    const cat = (item.category || item.name || "").toLowerCase();
    if (cat.includes("pipe") || cat.includes("cpvc") || cat.includes("plumbing") || cat.includes("hardware")) {
      hasPlumbing = true;
    }
    if (cat.includes("cement") || cat.includes("steel") || cat.includes("brick") || cat.includes("sand")) {
      hasCivil = true;
    }
  }

  // Enforce Vehicle Load Guard
  // BIKE_EXPRESS only allowed for <= 30 kg
  const vehicleType: "BIKE_EXPRESS" | "CHHOTA_HATHI" = totalWeightKg <= 30 ? "BIKE_EXPRESS" : "CHHOTA_HATHI";
  const vehicleLabel = vehicleType === "BIKE_EXPRESS" ? "Bike Express • Max 30 kg" : "Chhota Hathi Loader • Max 1,500 kg";

  const fallbackHub: LucknowHub = {
    hubId: primaryHubId || "hub-organics",
    name: "Lucknow Partner Hub",
    zone: "Central Lucknow",
    lat: 26.8467,
    lng: 80.9462,
    stockFlags: {},
    escrowBalance: 0,
    settledBalance: 0,
    isOnline: true,
  };
  const primaryHub = LUCKNOW_HUBS.find((h) => h.hubId === primaryHubId) || LUCKNOW_HUBS[0] || fallbackHub;
  const stops: StopDetail[] = [
    {
      stopId: `stop-1-${Date.now()}`,
      hubId: primaryHub.hubId,
      hubName: primaryHub.name,
      sequenceNo: 1,
      pickupQrToken: `QR-${primaryHub.hubId}-${Math.floor(1000 + Math.random() * 9000)}`,
      isLoaded: false,
      materialSummary: hasCivil ? "Civil & Bulk Materials" : "Hardware & Electricals",
    },
  ];

  // If order clubs plumbing + civil from two different partner shops within 1.5 km
  if (hasPlumbing && hasCivil && items.length > 1 && LUCKNOW_HUBS.length > 1) {
    const secondaryHub = LUCKNOW_HUBS.find((h) => h.hubId !== primaryHub.hubId) || LUCKNOW_HUBS[1] || primaryHub;
    stops.push({
      stopId: `stop-2-${Date.now()}`,
      hubId: secondaryHub.hubId,
      hubName: secondaryHub.name,
      sequenceNo: 2,
      pickupQrToken: `QR-${secondaryHub.hubId}-${Math.floor(1000 + Math.random() * 9000)}`,
      isLoaded: false,
      materialSummary: "Astral CPVC Pipes & Brass Fittings",
    });
  }

  return {
    weightKg: totalWeightKg,
    vehicleType,
    vehicleLabel,
    stops,
  };
}

/* ─────────────────────────────────────────────────────────────
 * Server-Side 180-Second Auto-Cascade Watchdog
 * ───────────────────────────────────────────────────────────── */
export function schedule180sCascade(order: any, initialHubId?: string): void {
  const orderId = order.id || order.orderId;
  if (!orderId) return;

  // Clear existing watchdog if any
  cancel180sCascade(orderId);

  if (LUCKNOW_HUBS.length <= 1) {
    // Cannot cascade when 0 or 1 hub is active
    return;
  }

  const startHubId = initialHubId || order.hubId || LUCKNOW_HUBS[0]?.hubId || "hub-organics";
  let assignedIndex = LUCKNOW_HUBS.findIndex((h) => h.hubId === startHubId);
  if (assignedIndex === -1) assignedIndex = 0;

  const expiresAt = Date.now() + 180_000; // 180s from now

  const timeout = setTimeout(() => {
    // 180s elapsed without vendor acceptance -> Cascade to next Lucknow Hub!
    const previousHub = LUCKNOW_HUBS[assignedIndex];
    assignedIndex = (assignedIndex + 1) % LUCKNOW_HUBS.length;
    const nextHub = LUCKNOW_HUBS[assignedIndex];

    logger.warn(
      { orderId, previousHub: previousHub.name, nextHub: nextHub.name },
      "⏰ 180s Vendor SLA Breached -> Auto-Cascading Order to next Lucknow Hub!",
    );

    logDispatchEvent(orderId, "ORDER_CASCADED_TIMEOUT", {
      previousHubId: previousHub.hubId,
      previousHubName: previousHub.name,
      newHubId: nextHub.hubId,
      newHubName: nextHub.name,
      reason: "180s SLA vendor acceptance timeout",
    });

    if (io) {
      // 1. Notify Admin Command OS of the cascade
      io.to(adminRoom()).emit("admin:order_cascaded", {
        orderId,
        previousHubId: previousHub.hubId,
        previousHubName: previousHub.name,
        newHubId: nextHub.hubId,
        newHubName: nextHub.name,
        timestamp: new Date().toISOString(),
      });

      // 2. Notify old vendor hub that the order expired
      io.to(vendorRoom(previousHub.hubId)).emit("vendor:order_expired", {
        orderId,
        reason: "180s time limit reached — cascaded to nearest Lucknow partner shop",
      });

      // 3. Emit Flash Buzzer to new hub with fresh 180s countdown
      const cascadedOrder = {
        ...order,
        hubId: nextHub.hubId,
        hubName: nextHub.name,
        status: "NEW_INCOMING",
        incomingSecondsLeft: 180,
        expiresAt: Date.now() + 180_000,
      };

      io.to(vendorRoom(nextHub.hubId)).emit("vendor:new_order", cascadedOrder);
      io.to(orderRoom(orderId)).emit("order:status_updated", {
        orderId,
        status: "NEW_INCOMING",
        assignedHub: nextHub.name,
        note: "Auto-reassigned to nearest partner shop for 60-min delivery",
      });
    }

    // Re-arm watchdog for the new hub
    schedule180sCascade(order, nextHub.hubId);
  }, 180_000);

  activeCascades.set(orderId, {
    orderId,
    orderData: order,
    currentHubId: startHubId,
    assignedIndex,
    expiresAt,
    timer: timeout,
  });

  // Emit immediate initial new order to vendor
  if (io) {
    io.to(vendorRoom(startHubId)).emit("vendor:new_order", {
      ...order,
      hubId: startHubId,
      expiresAt,
      incomingSecondsLeft: 180,
    });
    io.to(adminRoom()).emit("admin:new_order_dispatched", {
      orderId,
      assignedHubId: startHubId,
      expiresAt,
    });
  }
}

export function cancel180sCascade(orderId: string): void {
  const existing = activeCascades.get(orderId);
  if (existing) {
    clearTimeout(existing.timer);
    activeCascades.delete(orderId);
    logger.info({ orderId }, "180s cascade watchdog cancelled (Order Accepted)");
  }
}

/* ─────────────────────────────────────────────────────────────
 * GPS Waiting / Detention Auto-Meter (15 Free Mins -> ₹2/Min)
 * ───────────────────────────────────────────────────────────── */
export function recordDriverArrival(orderId: string, driverId?: string, gpsCoords?: { lat: number; lng: number }): DetentionRecord {
  clearDetentionTimer(orderId);

  const arrivedAt = Date.now();
  const freeWindowEndsAt = arrivedAt + 15 * 60 * 1000; // 15 mins free

  logDispatchEvent(orderId, "DRIVER_ARRIVED_AT_SITE", {
    driverId,
    gpsCoords,
    arrivedAt: new Date(arrivedAt).toISOString(),
    freeWindowEndsAt: new Date(freeWindowEndsAt).toISOString(),
  });

  const record: DetentionRecord = {
    orderId,
    driverId,
    arrivedAt,
    freeWindowEndsAt,
    detentionMinutes: 0,
    detentionCharge: 0,
  };

  // Run detention interval check every 30 seconds
  record.interval = setInterval(() => {
    const now = Date.now();
    if (now > freeWindowEndsAt) {
      const minutesOver = Math.floor((now - freeWindowEndsAt) / 60_000);
      const charge = minutesOver * 2; // ₹2/min

      record.detentionMinutes = minutesOver;
      record.detentionCharge = charge;

      if (io) {
        // Emit warning to Customer and Driver
        io.to(orderRoom(orderId)).emit("order:detention_warning", {
          orderId,
          minutesOver,
          detentionCharge: charge,
          ratePerMin: 2,
          message: `Site Waiting SLA (15 min) exceeded by ${minutesOver} mins. Current detention fee: ₹${charge}`,
        });

        if (driverId) {
          io.to(driverRoom(driverId)).emit("order:detention_warning", {
            orderId,
            minutesOver,
            detentionCharge: charge,
            ratePerMin: 2,
          });
        }

        io.to(adminRoom()).emit("admin:detention_alert", {
          orderId,
          driverId,
          minutesOver,
          detentionCharge: charge,
        });
      }
    }
  }, 30_000);

  activeDetentions.set(orderId, record);

  if (io) {
    io.to(orderRoom(orderId)).emit("order:status_updated", {
      orderId,
      status: "ARRIVED_AT_SITE",
      note: "Loader arrived at construction site. 15-min free unloading window started.",
    });
    io.to(adminRoom()).emit("admin:driver_arrived", {
      orderId,
      driverId,
      gpsCoords,
      arrivedAt,
    });
  }

  return record;
}

export function clearDetentionTimer(orderId: string): void {
  const existing = activeDetentions.get(orderId);
  if (existing) {
    if (existing.interval) clearInterval(existing.interval);
    activeDetentions.delete(orderId);
  }
}

/* ─────────────────────────────────────────────────────────────
 * Socket Server Initialization & Room Authorization
 * ───────────────────────────────────────────────────────────── */
const rawAllowedOrigins = process.env.ALLOWED_ORIGINS ?? "";
const allowedOrigins = rawAllowedOrigins
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    path: "/api/socket.io",
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const normalized = origin.replace(/\/+$/, "");
        const isAllowed =
          allowedOrigins.length === 0 ||
          allowedOrigins.includes(normalized) ||
          (process.env.FRONTEND_URL && normalized === process.env.FRONTEND_URL.trim().replace(/\/+$/, ""));
        const hostname = (() => {
          try {
            return new URL(origin).hostname;
          } catch {
            return "";
          }
        })();
        const isDev =
          process.env.NODE_ENV !== "production" &&
          (/^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|[\w-]+\.local)(:\d+)?$/.test(normalized) ||
            /\.devtunnels\.ms$/.test(hostname));
        const isVercel = /\.vercel\.app$/.test(hostname) || /\.netlify\.app$/.test(hostname);

        if (isAllowed || isDev || isVercel) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    logger.info({ socketId: socket.id }, "socket connected to 4-panel relay");

    // Send initial system state (Rain mode, etc.)
    socket.emit("system:ready", {
      connected: true,
      rainMode: isRainModeActive,
      timestamp: new Date().toISOString(),
    });

    // ── Room 1: Admin Command OS ──
    socket.on("join:admin", (payload: any) => {
      const token = payload?.token || "";
      const adminKey = payload?.adminKey || "";
      const expectedKey = process.env.VITE_MAC_ADMIN_KEY || process.env.MAC_ADMIN_KEY || "conon_mac_secret_9988";

      let authorized = false;
      if (adminKey && adminKey === expectedKey) authorized = true;
      else if (token) {
        const decoded = verifyJwt(token);
        if (decoded?.role === "admin") authorized = true;
      } else if (process.env.NODE_ENV !== "production") {
        // Dev convenience
        authorized = true;
      }

      if (authorized) {
        socket.join(adminRoom());
        socket.emit("admin:joined", {
          success: true,
          room: adminRoom(),
          rainMode: isRainModeActive,
        });
        logger.info({ socketId: socket.id }, "Admin Command OS joined room");
      } else {
        socket.emit("error", { message: "Unauthorized admin access" });
      }
    });

    // ── Room 2: Vendor Partner Dukaan OS ──
    socket.on("join:vendor", (payload: any) => {
      const hubId = payload?.hubId || payload?.store || "hub-naka";
      socket.join(vendorRoom(hubId));
      socket.join(`vendor:${payload?.store || hubId}`);
      socket.emit("vendor:joined", {
        success: true,
        room: vendorRoom(hubId),
        hubId,
      });
      logger.info({ socketId: socket.id, hubId }, "Vendor joined room");
    });

    // Legacy vendor join support
    socket.on("join-vendor", (token: any) => {
      let hubId = "hub-naka";
      if (typeof token === "string" && token) {
        const payload = verifyJwt(token);
        if (payload?.vendorStore) hubId = payload.vendorStore;
      }
      socket.join(vendorRoom(hubId));
    });

    // ── Room 3: Driver Loader & Rider Cockpit ──
    socket.on("join:driver", (payload: any) => {
      const driverId = payload?.driverId || "DRV-LKO-CH-01";
      socket.join(driverRoom(driverId));
      socket.emit("driver:joined", {
        success: true,
        room: driverRoom(driverId),
        driverId,
        rainMode: isRainModeActive,
      });
      logger.info({ socketId: socket.id, driverId }, "Driver joined room");
    });

    // ── Room 4: Order Room (Customer Tracking) ──
    socket.on("join:order", (payload: any) => {
      const orderId = typeof payload === "string" ? payload : payload?.orderId;
      if (orderId) {
        socket.join(orderRoom(orderId));
        socket.emit("order:joined", { success: true, orderId });
      }
    });

    socket.on("track-order", (orderId: any) => {
      if (typeof orderId === "string" && orderId) {
        socket.join(orderRoom(orderId));
      }
    });

    // Real-Time GPS Tracking from Driver App
    socket.on("driver-location-update", (payload: any) => {
      const orderId = payload?.orderId;
      if (!orderId) return;

      io?.to(orderRoom(orderId)).emit("live-truck-tracking", {
        orderId,
        lat: payload.lat,
        lng: payload.lng,
        heading: payload.heading ?? null,
        speed: payload.speed ?? null,
        at: new Date().toISOString(),
      });
    });

    // KYC Applicant Room for Live Verification & Re-upload alerts
    socket.on("join:applicant", (payload: any) => {
      const applicantId = payload?.applicantId;
      if (applicantId) {
        socket.join(applicantRoom(applicantId));
        socket.emit("applicant:joined", { success: true, applicantId });
        logger.info({ socketId: socket.id, applicantId }, "KYC Applicant joined room");
      }
    });

    // Driver SOS Alert Real-Time Bridge
    socket.on("driver:sos_alert", (payload: any) => {
      const alert = {
        orderId: payload?.orderId || "UNKNOWN",
        driverId: payload?.driverId || "UNKNOWN",
        driverName: payload?.driverName || "Driver",
        reason: payload?.reason || "Mechanical breakdown / puncture",
        lat: payload?.lat,
        lng: payload?.lng,
        timestamp: new Date().toISOString(),
      };
      logDispatchEvent(alert.orderId, "DRIVER_SOS_TRIGGERED", alert);
      io?.to(adminRoom()).emit("admin:driver_sos", alert);
    });

    socket.on("disconnect", () => {
      logger.info({ socketId: socket.id }, "socket disconnected");
    });
  });

  return io;
}

export function getIo(): Server {
  if (!io) {
    throw new Error("Socket.io has not been initialized");
  }
  return io;
}

export function emitKycEvent(event: string, payload: any, targetApplicantId?: string): void {
  if (io) {
    if (targetApplicantId) {
      io.to(applicantRoom(targetApplicantId)).emit(event, payload);
    }
    // Broadcast live to Admin Command OS room
    io.to(adminRoom()).emit(event, payload);
  }
}


/** Legacy support */
export function emitNewOrder(store: string, payload: unknown): void {
  if (!io || !store) return;
  io.to(vendorRoom(store)).emit("new-order-received", payload);
  io.to(vendorRoom(store)).emit("vendor:new_order", payload);
}
