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
  if (!token) {
    res.status(401).json({ error: "Admin authentication required." });
    return;
  }

  const payload = verifyJwt(token);
  if (!payload || payload.role !== "admin") {
    res.status(401).json({ error: "Invalid or expired admin session." });
    return;
  }

  next();
}
