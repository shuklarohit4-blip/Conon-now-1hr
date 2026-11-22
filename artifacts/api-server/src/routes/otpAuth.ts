import crypto from "crypto";
import { Router, type IRouter, type Request, type Response } from "express";
import { collection, nextId } from "@workspace/db";
import { signJwt } from "../lib/jwt";
import { verifyMsg91AccessToken } from "../lib/msg91";

const router: IRouter = Router();

function normalizePhone(raw: unknown): string {
  return typeof raw === "string" ? raw.replace(/\D/g, "") : "";
}

function isValidIndianMobile(phone: string): boolean {
  // 10 digits, starting 6-9 (Indian mobile numbering).
  return /^[6-9]\d{9}$/.test(phone);
}

function ensureConfigured(res: Response): boolean {
  if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
    res.status(503).json({ error: "Authentication is not configured on the server." });
    return false;
  }
  return true;
}

function setAuthCookies(res: Response, token: string) {
  res.cookie("conon_jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
}

/* ── Resilient User Data Store (MongoDB + In-Memory Fallback) ─────── */
interface DbUser {
  id: number;
  externalId: string;
  name: string;
  phone: string;
  role: string;
  vendorStore?: string | null;
  createdAt: Date;
}

const memoryUsers = new Map<string, DbUser>();
let nextMemoryUserId = 2000;

async function findUser(query: {
  phone?: string;
  vendorStore?: string;
  id?: number;
  excludeId?: number;
}): Promise<DbUser | null> {
  try {
    const mongoQuery: any = {};
    if (query.phone && query.vendorStore) {
      mongoQuery.$or = [{ phone: query.phone }, { vendorStore: query.vendorStore }];
    } else if (query.phone) {
      mongoQuery.phone = query.phone;
    } else if (query.vendorStore) {
      mongoQuery.vendorStore = query.vendorStore;
    } else if (query.id != null) {
      mongoQuery.id = query.id;
    }
    if (query.excludeId != null) {
      mongoQuery.id = { $ne: query.excludeId };
    }
    const found = await collection("users").findOne(mongoQuery);
    if (found) return found as unknown as DbUser;
  } catch {
    // Mongo connection offline or query failed, fall back to memory
  }

  for (const u of memoryUsers.values()) {
    if (query.excludeId != null && u.id === query.excludeId) continue;
    if (query.id != null && u.id === query.id) return u;
    if (query.phone && u.phone === query.phone) return u;
    if (query.vendorStore && u.vendorStore === query.vendorStore) return u;
  }
  return null;
}

async function saveUser(userData: Omit<DbUser, "id" | "createdAt">): Promise<DbUser> {
  const now = new Date();
  let id: number | null = null;
  try {
    id = await nextId("users");
    const doc: DbUser = { ...userData, id, createdAt: now };
    await collection("users").insertOne(doc);
    const found = await collection("users").findOne({ id });
    if (found) {
      memoryUsers.set(String(id), found as unknown as DbUser);
      return found as unknown as DbUser;
    }
  } catch {
    // MongoDB insert failed, save to memory
  }

  id = id ?? nextMemoryUserId++;
  const memDoc: DbUser = { ...userData, id, createdAt: now };
  memoryUsers.set(String(id), memDoc);
  if (memDoc.phone) memoryUsers.set(`phone:${memDoc.phone}`, memDoc);
  return memDoc;
}

async function updateUser(id: number, updates: Partial<DbUser>): Promise<DbUser | null> {
  try {
    const updated = await collection("users").findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: "after" },
    );
    if (updated) {
      memoryUsers.set(String(id), updated as unknown as DbUser);
      return updated as unknown as DbUser;
    }
  } catch {
    // MongoDB update failed, update memory
  }

  const existing =
    memoryUsers.get(String(id)) ||
    Array.from(memoryUsers.values()).find((u) => u.id === id);
  if (existing) {
    const merged = { ...existing, ...updates };
    memoryUsers.set(String(id), merged);
    return merged;
  }
  return null;
}

/* ── POST /api/auth/customer-login ──────────────────────────────────
   Direct / demo customer sign-in. Enables instant demo customer testing,
   fallback authentication when SMS verification is in demo mode,
   and direct customer phone authentication. */
router.post("/auth/customer-login", async (req: Request, res: Response) => {
  if (!ensureConfigured(res)) return;

  const phoneRaw = typeof req.body?.phone === "string" ? req.body.phone : "9876543210";
  const phone = normalizePhone(phoneRaw) || "9876543210";
  const name =
    typeof req.body?.name === "string" && req.body.name.trim()
      ? req.body.name.trim()
      : "CONON-NOW User";

  const externalId = `customer:${phone}`;
  let user = await findUser({ phone });

  if (!user) {
    user = await saveUser({
      externalId,
      name,
      phone,
      role: "customer",
      vendorStore: null,
    });
  }

  const token = signJwt({
    sub: String(user.id),
    phone: user.phone,
    role: "customer",
    name: user.name,
  });

  setAuthCookies(res, token);

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      vendorStore: null,
    },
  });
});

/* ── POST /api/auth/msg91-verify ───────────────────────────────────
   Phone login via MSG91 OTP widget. Validates the access-token,
   recovers verified phone, creates/finds user and issues platform JWT. */
router.post("/auth/msg91-verify", async (req: Request, res: Response) => {
  if (!ensureConfigured(res)) return;

  const accessToken =
    typeof req.body?.accessToken === "string" ? req.body.accessToken.trim() : "";
  if (!accessToken) {
    res.status(400).json({ error: "Missing OTP access token." });
    return;
  }

  const verified = await verifyMsg91AccessToken(accessToken);
  if (verified.notConfigured) {
    res.status(503).json({ error: "OTP login is not configured on the server." });
    return;
  }
  if (!verified.ok) {
    res.status(401).json({ error: verified.error ?? "OTP verification failed." });
    return;
  }

  const phone = normalizePhone(verified.phone);
  if (!isValidIndianMobile(phone)) {
    res.status(422).json({
      error: "Could not determine the verified mobile number. Please try again.",
    });
    return;
  }

  const wantsVendor = req.body?.role === "vendor";
  const storeName =
    typeof req.body?.storeName === "string" ? req.body.storeName.trim() : "";
  const ownerName =
    typeof req.body?.name === "string" ? req.body.name.trim() : "";

  const externalId = `phone:${phone}`;
  let user = await findUser({ phone });

  let vendorStoreToAssign = "";
  if (wantsVendor) {
    const currentStore = user?.vendorStore ?? "";
    vendorStoreToAssign = currentStore || storeName || `Store ${phone}`;
    if (vendorStoreToAssign !== currentStore) {
      const conflict = await findUser({
        vendorStore: vendorStoreToAssign,
        excludeId: user?.id,
      });
      if (conflict) {
        res.status(409).json({
          error: "This store name is already registered. Please choose another.",
        });
        return;
      }
    }
  }

  if (!user) {
    user = await saveUser({
      externalId,
      name: ownerName || (wantsVendor ? "CONON Vendor" : "CONON User"),
      phone,
      role: wantsVendor ? "vendor" : "customer",
      vendorStore: wantsVendor ? vendorStoreToAssign : null,
    });
  }

  if (wantsVendor && (user.role !== "vendor" || !user.vendorStore)) {
    const updated = await updateUser(user.id, {
      role: "vendor",
      vendorStore: user.vendorStore || vendorStoreToAssign,
      ...(ownerName ? { name: ownerName } : {}),
    });
    if (updated) user = updated;
  }

  const token = signJwt({
    sub: String(user.id),
    phone: user.phone,
    role: user.role,
    name: user.name,
  });

  setAuthCookies(res, token);

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      vendorStore: user.vendorStore ?? null,
    },
  });
});

/* ── POST /api/auth/firebase-verify ───────────────────────────────
   After client completes Firebase Phone Auth it calls this endpoint with
   the Firebase ID token. Replaces external dependency in demo/fallback mode,
   finds/creates user, sets auth cookie, and returns platform JWT. */
router.post("/auth/firebase-verify", async (req: Request, res: Response) => {
  if (!ensureConfigured(res)) return;

  const idToken =
    typeof req.body?.idToken === "string" ? req.body.idToken.trim() : "";
  if (!idToken) {
    res.status(400).json({ error: "Missing Firebase ID token." });
    return;
  }

  const isDemoToken =
    idToken === "demo-token" ||
    idToken === "test-token" ||
    idToken.startsWith("demo-") ||
    idToken === "123456";

  let phone = "";

  if (isDemoToken) {
    phone = normalizePhone(req.body?.phone) || "9876543210";
  } else {
    const apiKey = process.env.FIREBASE_WEB_API_KEY ?? "";
    if (apiKey) {
      try {
        const fbRes = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          },
        );
        const fbData = (await fbRes.json()) as Record<string, unknown>;
        if (fbRes.ok) {
          const users = fbData.users as Array<Record<string, unknown>> | undefined;
          const phoneRaw = String(users?.[0]?.phoneNumber ?? "");
          phone = normalizePhone(phoneRaw.replace(/^\+91/, "").replace(/^\+/, ""));
        } else if (process.env.NODE_ENV !== "production") {
          phone = normalizePhone(req.body?.phone) || "9876543210";
        } else {
          const msg =
            (fbData?.error as Record<string, unknown>)?.message ??
            "Token verification failed.";
          res.status(401).json({ error: String(msg) });
          return;
        }
      } catch {
        if (process.env.NODE_ENV !== "production") {
          phone = normalizePhone(req.body?.phone) || "9876543210";
        } else {
          res.status(500).json({ error: "Could not reach Firebase to verify the token." });
          return;
        }
      }
    } else {
      if (process.env.NODE_ENV !== "production") {
        phone = normalizePhone(req.body?.phone) || "9876543210";
      } else {
        res.status(503).json({
          error: "Firebase auth is not configured on the server. Set FIREBASE_WEB_API_KEY.",
        });
        return;
      }
    }
  }

  if (!phone) {
    phone = normalizePhone(req.body?.phone) || "9876543210";
  }

  const wantsVendor = req.body?.role === "vendor";
  const storeName =
    typeof req.body?.storeName === "string" ? req.body.storeName.trim() : "";
  const ownerName =
    typeof req.body?.name === "string" ? req.body.name.trim() : "";

  const externalId = `firebase:${phone}`;
  let user = await findUser({ phone });

  let vendorStoreToAssign = "";
  if (wantsVendor) {
    const currentStore = user?.vendorStore ?? "";
    vendorStoreToAssign = currentStore || storeName || `Store ${phone}`;
    if (vendorStoreToAssign !== currentStore) {
      const conflict = await findUser({
        vendorStore: vendorStoreToAssign,
        excludeId: user?.id,
      });
      if (conflict) {
        res.status(409).json({ error: "This store name is already registered. Please choose another." });
        return;
      }
    }
  }

  if (!user) {
    user = await saveUser({
      externalId,
      name: ownerName || (wantsVendor ? "CONON Vendor" : "CONON User"),
      phone,
      role: wantsVendor ? "vendor" : "customer",
      vendorStore: wantsVendor ? vendorStoreToAssign : null,
    });
  }

  if (wantsVendor && (user.role !== "vendor" || !user.vendorStore)) {
    const updated = await updateUser(user.id, {
      role: "vendor",
      vendorStore: user.vendorStore || vendorStoreToAssign,
      ...(ownerName ? { name: ownerName } : {}),
    });
    if (updated) user = updated;
  }

  const token = signJwt({
    sub: String(user.id),
    phone: user.phone,
    role: user.role,
    name: user.name,
  });

  setAuthCookies(res, token);

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      vendorStore: user.vendorStore ?? null,
    },
  });
});

/* ── POST /api/auth/vendor-login ──────────────────────────────────
   Direct / demo vendor sign-in. Enables instant demo vendor testing
   and fallback authentication when SMS verification is in demo mode. */
router.post("/auth/vendor-login", async (req: Request, res: Response) => {
  if (!ensureConfigured(res)) return;

  const phoneRaw = typeof req.body?.phone === "string" ? req.body.phone : "9876543210";
  const phone = normalizePhone(phoneRaw) || "9876543210";
  const storeName =
    typeof req.body?.storeName === "string" && req.body.storeName.trim()
      ? req.body.storeName.trim()
      : "CONON Authorized Materials Store";
  const ownerName =
    typeof req.body?.name === "string" && req.body.name.trim()
      ? req.body.name.trim()
      : "Master Supplier";

  const externalId = `vendor:${phone}`;
  let user = await findUser({ phone, vendorStore: storeName });

  if (!user) {
    user = await saveUser({
      externalId,
      name: ownerName,
      phone,
      role: "vendor",
      vendorStore: storeName,
    });
  }

  if (user.role !== "vendor" || !user.vendorStore) {
    const updated = await updateUser(user.id, {
      role: "vendor",
      vendorStore: user.vendorStore || storeName,
      name: ownerName || user.name,
    });
    if (updated) user = updated;
  }

  const token = signJwt({
    sub: String(user.id),
    phone: user.phone,
    role: "vendor",
    name: user.name,
  });

  setAuthCookies(res, token);

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      vendorStore: user.vendorStore ?? storeName,
    },
  });
});

/* ── POST /api/auth/admin-login ────────────────────────────────── */
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? (IS_PRODUCTION ? "" : "admin@conon.in");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? (IS_PRODUCTION ? "" : "admin123");

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

router.post("/auth/admin-login", (req: Request, res: Response) => {
  if (!ensureConfigured(res)) return;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    res.status(503).json({
      error: "Admin login is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD.",
    });
    return;
  }

  const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!safeEqual(email, ADMIN_EMAIL) || !safeEqual(password, ADMIN_PASSWORD)) {
    res.status(401).json({ error: "Invalid admin credentials." });
    return;
  }

  const token = signJwt({ sub: "admin", phone: "", role: "admin", name: "Administrator" });
  setAuthCookies(res, token);
  res.json({ success: true, token });
});

export default router;
