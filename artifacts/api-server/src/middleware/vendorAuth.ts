import { type Request, type Response, type NextFunction } from "express";
import { repositories } from "@workspace/db";
import { verifyJwt } from "../lib/jwt";
import { vendorEngine } from "../services/vendorEngine";

/**
 * Gate a route to authenticated vendors only.
 *
 * Reads a Bearer JWT from the Authorization header, verifies it, then resolves
 * the authentic vendor store via vendorEngine with graceful DB fallback.
 * Populates req.vendorStore, req.vendorUserId and req.vendor.
 */
export async function requireVendor(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

  // 1. If valid Bearer token provided
  if (token) {
    const payload = verifyJwt(token);
    if (payload && (payload.role === "vendor" || payload.role === "admin")) {
      const storeNameOrId = (payload as any).vendorStore || payload.name || payload.sub;
      const vendor = vendorEngine.getVendorByStore(String(storeNameOrId));
      req.vendorStore = vendor.shopName;
      req.vendorUserId = Number.isFinite(Number(payload.sub)) ? Number(payload.sub) : 101;
      (req as any).vendor = vendor;
      return next();
    }
  }

  // 2. Dev / Local Sandbox fallback — check x-vendor-store / x-vendor-id header, query, or default
  if (process.env.NODE_ENV !== "production") {
    const storeHeader =
      (req.headers["x-vendor-store"] as string) ||
      (req.headers["x-vendor-id"] as string) ||
      (req.query.vendorStore as string) ||
      "Katawala Hardware & Locks";
    const fallbackVendor = vendorEngine.getVendorByStore(storeHeader);
    req.vendorStore = fallbackVendor.shopName;
    req.vendorUserId = 101;
    (req as any).vendor = fallbackVendor;
    return next();
  }

  res.status(401).json({ error: "Vendor authentication required." });
}
