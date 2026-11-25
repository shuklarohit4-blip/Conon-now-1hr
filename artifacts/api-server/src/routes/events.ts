import { Router, type IRouter, type Request, type Response } from "express";
import { ecosystemEngine } from "../services/ecosystemEngine";
import { verifyJwt } from "../lib/jwt";
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
router.get("/admin/stream", (_req: Request, res: Response) => {
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

export default router;
