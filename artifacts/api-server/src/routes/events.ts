import { Router, type IRouter, type Request, type Response } from "express";
import { ecosystemEngine } from "../services/ecosystemEngine";
import { syncBus } from "../services/syncBus";
import { verifyJwt } from "../lib/jwt";
import { requireAdmin } from "../middleware/adminAuth";
import { randomUUID } from "crypto";

const router: IRouter = Router();

/**
 * GET /api/events/stream
 * Public & authenticated multi-role SSE stream.
 * Automatically adapts payload masking based on caller role.
 */
router.get("/events/stream", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  // Resolve role from JWT or query parameter
  let role: "ADMIN" | "VENDOR" | "DRIVER" | "CUSTOMER" | "PUBLIC" = "PUBLIC";
  let filterId: string | undefined = req.query.filterId ? String(req.query.filterId) : undefined;

  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : req.query.token as string) || "";

  if (token) {
    const payload = verifyJwt(token);
    if (payload) {
      if (payload.role === "admin") role = "ADMIN";
      else if (payload.role === "vendor") {
        role = "VENDOR";
        filterId = filterId || (payload as any).vendorStore || payload.sub;
      } else if (payload.role === "driver") {
        role = "DRIVER";
        filterId = filterId || payload.sub;
      }
    }
  } else if (req.query.role) {
    const reqRole = String(req.query.role).toUpperCase();
    if (reqRole === "ADMIN" || reqRole === "VENDOR" || reqRole === "DRIVER" || reqRole === "CUSTOMER") {
      role = reqRole;
    }
  }

  const clientId = `sse-${randomUUID().slice(0, 8)}`;
  ecosystemEngine.addSSEClient({
    id: clientId,
    res,
    role,
    filterId,
  });
});

/**
 * GET /api/admin/stream
 * Dedicated Admin SSE War-Room feed.
 */
router.get("/admin/stream", requireAdmin, (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const clientId = `admin-sse-${randomUUID().slice(0, 8)}`;
  ecosystemEngine.addSSEClient({
    id: clientId,
    res,
    role: "ADMIN",
  });

  // Send initial snapshot
  const orders = ecosystemEngine.getAllOrders();
  const drivers = ecosystemEngine.getAllDrivers();
  const snapshot = {
    type: "SNAPSHOT",
    activeOrdersCount: orders.filter((o) => o.status !== "DELIVERED" && o.status !== "CANCELLED").length,
    onlineDriversCount: drivers.filter((d) => d.isOnline).length,
    orders: orders.slice(0, 20),
    drivers,
    timestamp: Date.now(),
  };

  res.write(`event: admin_snapshot\ndata: ${JSON.stringify(snapshot)}\n\n`);
});

/**
 * POST /api/events/telemetry/driver-ping
 * Live driver GPS location update.
 */
router.post("/events/telemetry/driver-ping", (req: Request, res: Response) => {
  const { driverId, lat, lng, zone } = req.body;
  if (!driverId || typeof lat !== "number" || typeof lng !== "number") {
    res.status(400).json({ error: "driverId, lat, and lng are required" });
    return;
  }
  const updated = ecosystemEngine.updateDriverLocation(driverId, lat, lng, zone);
  res.json({ success: !!updated, driver: updated });
});

/**
 * GET /api/system/network-info
 * Exposes laptop's local network (LAN Wi-Fi) IPv4 addresses, connected SSE clients,
 * and recent Admin activity feed for the Executive Command Dashboard.
 */
router.get("/system/network-info", requireAdmin, (req: Request, res: Response) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  const lanIps = syncBus.getLanAddresses();
  const primaryLanIp = lanIps[0] || "";
  const requestHost = String(req.headers["x-forwarded-host"] || req.headers.host || "");
  const proto = String(req.headers["x-forwarded-proto"] || req.protocol || "http");

  res.json({
    ok: true,
    lanIps,
    primaryLanIp,
    storefrontPort: 5175,
    adminPort: 5174,
    backendPort: Number(process.env.PORT || 5001),
    customerLanUrl: primaryLanIp ? `http://${primaryLanIp}:5175/home` : `${proto}://${requestHost}/home`,
    adminLanUrl: primaryLanIp ? `http://${primaryLanIp}:5174/admin` : `${proto}://${requestHost}/admin`,
    connectedSseClients: ecosystemEngine.getSSEClientCount(),
    recentActivity: syncBus.getRecentActivity(20),
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/admin/activity
 * Recent Admin change audit feed.
 */
router.get("/admin/activity", requireAdmin, (_req: Request, res: Response) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.json({
    ok: true,
    items: syncBus.getRecentActivity(40),
    connectedSseClients: ecosystemEngine.getSSEClientCount(),
  });
});

/**
 * POST /api/events/force-sync
 * Broadcasts FORCE_SYNC across all connected LAN/DevTunnel/localhost clients via SSE + Socket.io.
 */
router.post("/events/force-sync", requireAdmin, (req: Request, res: Response) => {
  const reason = String(req.body?.reason || "Manual Force Sync triggered by Admin").trim();
  const entry = syncBus.publish({
    type: "FORCE_SYNC",
    action: "FORCE_SYNC",
    summary: reason,
    socketEvent: "conon:force_sync",
    socketPayload: { reason, timestamp: Date.now() },
  });
  res.json({
    ok: true,
    connectedSseClients: ecosystemEngine.getSSEClientCount(),
    entry,
  });
});

export default router;
