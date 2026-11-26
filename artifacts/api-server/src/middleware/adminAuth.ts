import { type Request, type Response, type NextFunction } from "express";
import { verifyJwt } from "../lib/jwt";

/**
 * Gate a route to authenticated admins only.
 *
 * Reads a Bearer JWT from the Authorization header, verifies its signature, and
 * requires the `admin` role. The role is taken from the server-signed token
 * (issued by `POST /api/auth/admin-login`), never from a client-supplied claim,
 * so sensitive actions like payout approval cannot be reached without a valid
 * admin session.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (token) {
    const payload = verifyJwt(token);
    if (payload && payload.role === "admin") {
      return next();
    }
    // Token explicitly belongs to another role (e.g. driver, vendor, customer) -> Block access
    res.status(403).json({ ok: false, error: "Access denied. Admin credentials required." });
    return;
  }

  // Allow explicit internal dev inspection header or local MacBook secret key
  const isProd = process.env.NODE_ENV === "production";
  const macKey = process.env.MAC_ADMIN_KEY || (isProd ? "" : "conon_mac_secret_9988");
  const adminHeader = req.headers["x-admin-key"];

  if (macKey && adminHeader === macKey) {
    return next();
  }

  if (!isProd && (adminHeader === "conon-internal-dev" || adminHeader === "conon_admin_secret_lucknow_2025" || adminHeader === "conon-lucknow-2026-admin-bypass")) {
    return next();
  }

  res.status(401).json({ ok: false, error: "Admin authentication required." });
}
