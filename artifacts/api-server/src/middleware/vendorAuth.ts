import { type Request, type Response, type NextFunction } from "express";
import { repositories } from "@workspace/db";
import { verifyJwt } from "../lib/jwt";

/**
 * Gate a route to authenticated vendors only.
 *
 * Reads a Bearer JWT from the Authorization header, verifies it, then loads the
 * user from the DB. The store name is resolved authoritatively from the DB
 * (never trusted from the token), so a vendor can only ever act on their own
 * store. On success, `req.vendorStore` and `req.vendorUserId` are populated.
 */
export async function requireVendor(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) {
    res.status(401).json({ error: "Vendor authentication required." });
    return;
  }

  const payload = verifyJwt(token);
  if (!payload || payload.role !== "vendor") {
    res.status(401).json({ error: "Invalid or expired vendor session." });
    return;
  }

  const userId = Number(payload.sub);
  if (!Number.isFinite(userId)) {
    res.status(401).json({ error: "Invalid vendor session." });
    return;
  }

  const user = await repositories.users.findById(userId);

  if (!user || user.role !== "vendor" || !user.vendorStore) {
    res.status(403).json({ error: "This account is not a registered vendor." });
    return;
  }

  req.vendorUserId = user.id;
  req.vendorStore = user.vendorStore;
  next();
}
