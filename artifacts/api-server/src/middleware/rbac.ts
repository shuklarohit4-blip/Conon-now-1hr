import { type Request, type Response, type NextFunction } from "express";
import { verifyJwt } from "../lib/jwt";
import { ecosystemEngine } from "../services/ecosystemEngine";

export function requireDriver(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

  if (token) {
    const payload = verifyJwt(token);
    if (payload && (payload.role === "driver" || payload.role === "admin")) {
      const driverId = String(payload.sub || "DRV-LKO-201");
      const driver = ecosystemEngine.getDriver(driverId);
      (req as any).driver = driver || ecosystemEngine.getAllDrivers()[0];
      (req as any).driverId = driver ? driver.id : "DRV-LKO-201";
      return next();
    }
  }

  // Dev / local sandbox fallback: auto-assign default driver Rajesh Kumar (2W) or query driverId
  if (process.env.NODE_ENV !== "production") {
    const queryDriverId = (req.query.driverId as string) || (req.headers["x-driver-id"] as string) || "DRV-LKO-201";
    const driver = ecosystemEngine.getDriver(queryDriverId) || ecosystemEngine.getAllDrivers()[0];
    (req as any).driver = driver;
    (req as any).driverId = driver.id;
    return next();
  }

  res.status(401).json({ error: "Driver authentication required." });
}

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

    if (token) {
      const payload = verifyJwt(token);
      if (payload && allowedRoles.includes(payload.role)) {
        (req as any).user = payload;
        return next();
      }
    }

    if (process.env.NODE_ENV !== "production") {
      return next();
    }

    res.status(403).json({ error: `Access forbidden. Required role: ${allowedRoles.join(" or ")}` });
  };
}
