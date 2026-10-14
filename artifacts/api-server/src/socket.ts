import type { Server as HttpServer } from "http";
import { Server, type Socket } from "socket.io";
import { db, ordersTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./lib/logger";
import { verifyJwt } from "./lib/jwt";

let io: Server | null = null;

function vendorRoom(store: string): string {
  return `vendor:${store}`;
}

/**
 * Notify a vendor's connected dashboards that a new order just landed for their
 * store. No-op if the socket layer hasn't been initialized yet.
 */
export function emitNewOrder(store: string, payload: unknown): void {
  if (!io || !store) return;
  io.to(vendorRoom(store)).emit("new-order-received", payload);
}

const rawAllowedOrigins = process.env.ALLOWED_ORIGINS ?? "";
const allowedOrigins = rawAllowedOrigins
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const isProd = process.env.NODE_ENV === "production";
const SESSION_COOKIE = "_sid";

function orderRoom(orderId: string): string {
  return `order:${orderId}`;
}

/** Extract the anonymous session id from the handshake cookie header. */
function sessionFromSocket(socket: Socket): string | null {
  const raw = socket.handshake.headers.cookie;
  if (!raw) return null;
  for (const part of raw.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === SESSION_COOKIE) {
      return decodeURIComponent(part.slice(idx + 1).trim()) || null;
    }
  }
  return null;
}

interface SocketState {
  /** Orders this socket has already been authorized for (avoids re-querying). */
  authorized: Set<string>;
  /** The vendor store room this socket is currently joined to, if any. */
  vendorStore?: string;
}

function stateOf(socket: Socket): SocketState {
  const data = socket.data as Partial<SocketState>;
  if (!data.authorized) data.authorized = new Set();
  return data as SocketState;
}

/** Remove this socket from its current vendor room (if any) and forget it. */
function leaveVendor(socket: Socket): void {
  const state = stateOf(socket);
  if (state.vendorStore) {
    socket.leave(vendorRoom(state.vendorStore));
    state.vendorStore = undefined;
  }
}

/**
 * Authorize a socket to read/write a given order's live channel.
 *
 * The app uses an anonymous `_sid` cookie session and orders are owned by that
 * session, so the rule mirrors the REST layer: you may only touch an order your
 * session owns. Orders that don't exist in the DB (e.g. the hard-coded demo
 * order) are permitted in development only, so the showcase works while
 * production stays locked down. Results are cached per socket.
 */
async function authorize(socket: Socket, orderId: string): Promise<boolean> {
  const state = stateOf(socket);
  if (state.authorized.has(orderId)) return true;

  let order: { sessionId: string } | undefined;
  try {
    const rows = await db
      .select({ sessionId: ordersTable.sessionId })
      .from(ordersTable)
      .where(eq(ordersTable.externalId, orderId))
      .limit(1);
    order = rows[0];
  } catch (err) {
    logger.error({ err, orderId }, "socket authorize: order lookup failed");
    return false;
  }

  let ok: boolean;
  if (!order) {
    // Unknown / synthetic order: allow only outside production.
    ok = !isProd;
  } else {
    const session = sessionFromSocket(socket);
    ok = !!session && order.sessionId === session;
  }

  if (ok) {
    state.authorized.add(orderId);
  } else {
    logger.warn({ socketId: socket.id, orderId }, "socket authorize: denied");
  }
  return ok;
}

interface DriverLocationPayload {
  orderId?: unknown;
  lat?: unknown;
  lng?: unknown;
  heading?: unknown;
  speed?: unknown;
}

/**
 * Attach the real-time delivery tracking engine to the HTTP server.
 *
 * - Customers join their order's room via `track-order` and then receive
 *   `live-truck-tracking` updates.
 * - The delivery vehicle pushes GPS via `driver-location-update`, which is
 *   broadcast only to the customers watching that specific order.
 *
 * Both directions are gated by `authorize()` so a client can only observe or
 * update orders that its session is permitted to access.
 */
export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    // Mounted under /api so the Replit path-router proxies it to this service
    // (only /api/* is routed here). The browser connects same-origin.
    path: "/api/socket.io",
    cors: {
      origin: allowedOrigins.length > 0 ? allowedOrigins : false,
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    logger.info({ socketId: socket.id }, "socket connected");

    socket.on("track-order", async (orderId: unknown) => {
      if (typeof orderId !== "string" || orderId.length === 0) return;
      if (!(await authorize(socket, orderId))) return;
      socket.join(orderRoom(orderId));
    });

    // A vendor dashboard subscribes to its store's live order feed. The JWT is
    // verified and the store is read from the DB so a vendor can only ever
    // listen to their own store's channel. Any previously-joined vendor room is
    // left first, so re-authing as a different vendor on the same (singleton)
    // socket can never leak the prior vendor's order events.
    socket.on("join-vendor", async (token: unknown) => {
      if (typeof token !== "string" || token.length === 0) return;
      const payload = verifyJwt(token);
      if (!payload || payload.role !== "vendor") {
        leaveVendor(socket);
        return;
      }
      const userId = Number(payload.sub);
      if (!Number.isFinite(userId)) return;
      try {
        const rows = await db
          .select({ vendorStore: usersTable.vendorStore, role: usersTable.role })
          .from(usersTable)
          .where(eq(usersTable.id, userId))
          .limit(1);
        const user = rows[0];
        if (user?.role === "vendor" && user.vendorStore) {
          const state = stateOf(socket);
          if (state.vendorStore && state.vendorStore !== user.vendorStore) {
            socket.leave(vendorRoom(state.vendorStore));
          }
          state.vendorStore = user.vendorStore;
          socket.join(vendorRoom(user.vendorStore));
        } else {
          leaveVendor(socket);
        }
      } catch (err) {
        logger.error({ err }, "join-vendor lookup failed");
      }
    });

    // A vendor dashboard explicitly leaves its store room on logout / unmount so
    // the shared client socket stops receiving that store's events.
    socket.on("leave-vendor", () => {
      leaveVendor(socket);
    });

    socket.on("untrack-order", (orderId: unknown) => {
      if (typeof orderId !== "string" || orderId.length === 0) return;
      socket.leave(orderRoom(orderId));
    });

    socket.on("driver-location-update", async (payload: DriverLocationPayload) => {
      const orderId = payload?.orderId;
      const lat = payload?.lat;
      const lng = payload?.lng;
      if (
        typeof orderId !== "string" ||
        orderId.length === 0 ||
        typeof lat !== "number" ||
        typeof lng !== "number"
      ) {
        return;
      }

      if (!(await authorize(socket, orderId))) return;

      const heading = typeof payload.heading === "number" ? payload.heading : null;
      const speed = typeof payload.speed === "number" ? payload.speed : null;

      io?.to(orderRoom(orderId)).emit("live-truck-tracking", {
        orderId,
        lat,
        lng,
        heading,
        speed,
        at: new Date().toISOString(),
      });
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
