import crypto from "crypto";
import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
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
  if (!process.env.JWT_SECRET) {
    res.status(503).json({ error: "Authentication is not configured on the server." });
    return false;
  }
  return true;
}

/* ── POST /api/auth/msg91-verify ───────────────────────────────────
   Phone login is handled by the MSG91 OTP widget on the client. The widget
   returns a short-lived access-token once the user verifies their OTP; we
   validate it here with the account authkey, recover the MSG91-verified mobile
   number, then create/find the user and issue our own JWT.

   The account is always bound to the number MSG91 verified — never to a phone
   supplied by the client — which prevents a valid token from being replayed to
   claim a different number. */
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

  // Optional vendor self-serve signup: when the client requests role "vendor"
  // it also supplies the shop/owner names so the account can be scoped to a
  // store. (No conflict with customer logins, which omit `role`.)
  const wantsVendor = req.body?.role === "vendor";
  const storeName =
    typeof req.body?.storeName === "string" ? req.body.storeName.trim() : "";
  const ownerName =
    typeof req.body?.name === "string" ? req.body.name.trim() : "";

  // Find the user keyed by phone number (may not exist yet).
  const externalId = `phone:${phone}`;
  let [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.phone, phone));

  // For vendor signups, resolve the store this account will be scoped to and
  // enforce GLOBAL uniqueness. `vendorStore` is the authorization key for
  // /vendor/* access, so a store identity must belong to exactly one user —
  // otherwise a second vendor could claim an existing store name and read or
  // mutate its inventory/orders/wallet. An existing vendor keeping their own
  // store is always allowed.
  let vendorStoreToAssign = "";
  if (wantsVendor) {
    const currentStore = user?.vendorStore ?? "";
    vendorStoreToAssign = currentStore || storeName || `Store ${phone}`;
    if (vendorStoreToAssign !== currentStore) {
      const owners = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.vendorStore, vendorStoreToAssign));
      const conflict = owners.find((u) => u.id !== (user?.id ?? -1));
      if (conflict) {
        res.status(409).json({
          error: "This store name is already registered. Please choose another.",
        });
        return;
      }
    }
  }

  if (!user) {
    try {
      [user] = await db
        .insert(usersTable)
        .values({
          externalId,
          name: ownerName || (wantsVendor ? "CONON Vendor" : "CONON User"),
          phone,
          role: wantsVendor ? "vendor" : "customer",
          vendorStore: wantsVendor ? vendorStoreToAssign : null,
        })
        .onConflictDoNothing()
        .returning();
    } catch {
      // Unique index on vendor_store rejected a concurrent store claim.
      res.status(409).json({
        error: "This store name is already registered. Please choose another.",
      });
      return;
    }
    if (!user) {
      [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.phone, phone));
    }
  }

  // Promote an existing account to vendor (or backfill its store) on demand.
  if (wantsVendor && (user.role !== "vendor" || !user.vendorStore)) {
    try {
      [user] = await db
        .update(usersTable)
        .set({
          role: "vendor",
          vendorStore: user.vendorStore || vendorStoreToAssign,
          ...(ownerName ? { name: ownerName } : {}),
        })
        .where(eq(usersTable.id, user.id))
        .returning();
    } catch {
      // Unique index on vendor_store rejected a concurrent store claim.
      res.status(409).json({
        error: "This store name is already registered. Please choose another.",
      });
      return;
    }
  }

  const token = signJwt({
    sub: String(user.id),
    phone: user.phone,
    role: user.role,
  });

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
   After the client completes Firebase Phone Auth it calls this endpoint with
   the Firebase ID token. We verify it against Google's tokeninfo endpoint,
   extract the verified phone number (never trusted from the client), then
   find-or-create the user in our DB and issue our own platform JWT.

   Requires env: FIREBASE_WEB_API_KEY (the project's web API key).               */
router.post("/auth/firebase-verify", async (req: Request, res: Response) => {
  if (!ensureConfigured(res)) return;

  const apiKey = process.env.FIREBASE_WEB_API_KEY ?? "";
  if (!apiKey) {
    res.status(503).json({ error: "Firebase auth is not configured on the server. Set FIREBASE_WEB_API_KEY." });
    return;
  }

  const idToken =
    typeof req.body?.idToken === "string" ? req.body.idToken.trim() : "";
  if (!idToken) {
    res.status(400).json({ error: "Missing Firebase ID token." });
    return;
  }

  /* Verify the token with Firebase and get the user's phone number. */
  let phoneRaw = "";
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
    if (!fbRes.ok) {
      const msg = (fbData?.error as Record<string, unknown>)?.message ?? "Token verification failed.";
      res.status(401).json({ error: String(msg) });
      return;
    }
    const users = fbData.users as Array<Record<string, unknown>> | undefined;
    phoneRaw = String(users?.[0]?.phoneNumber ?? "");
  } catch {
    res.status(500).json({ error: "Could not reach Firebase to verify the token." });
    return;
  }

  /* Normalise: strip leading + and country code to get 10-digit Indian mobile. */
  const phone = normalizePhone(phoneRaw.replace(/^\+91/, "").replace(/^\+/, ""));
  if (!phone) {
    res.status(422).json({ error: "No verified phone number on this Firebase account." });
    return;
  }

  /* Identical find-or-create + vendor promotion logic as msg91-verify. */
  const wantsVendor = req.body?.role === "vendor";
  const storeName =
    typeof req.body?.storeName === "string" ? req.body.storeName.trim() : "";
  const ownerName =
    typeof req.body?.name === "string" ? req.body.name.trim() : "";

  const externalId = `firebase:${phone}`;
  let [user] = await db.select().from(usersTable).where(eq(usersTable.phone, phone));

  let vendorStoreToAssign = "";
  if (wantsVendor) {
    const currentStore = user?.vendorStore ?? "";
    vendorStoreToAssign = currentStore || storeName || `Store ${phone}`;
    if (vendorStoreToAssign !== currentStore) {
      const owners = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.vendorStore, vendorStoreToAssign));
      const conflict = owners.find((u) => u.id !== (user?.id ?? -1));
      if (conflict) {
        res.status(409).json({ error: "This store name is already registered. Please choose another." });
        return;
      }
    }
  }

  if (!user) {
    try {
      [user] = await db
        .insert(usersTable)
        .values({
          externalId,
          name: ownerName || (wantsVendor ? "CONON Vendor" : "CONON User"),
          phone,
          role: wantsVendor ? "vendor" : "customer",
          vendorStore: wantsVendor ? vendorStoreToAssign : null,
        })
        .onConflictDoNothing()
        .returning();
    } catch {
      res.status(409).json({ error: "This store name is already registered. Please choose another." });
      return;
    }
    if (!user) {
      [user] = await db.select().from(usersTable).where(eq(usersTable.phone, phone));
    }
  }

  if (wantsVendor && (user.role !== "vendor" || !user.vendorStore)) {
    try {
      [user] = await db
        .update(usersTable)
        .set({
          role: "vendor",
          vendorStore: user.vendorStore || vendorStoreToAssign,
          ...(ownerName ? { name: ownerName } : {}),
        })
        .where(eq(usersTable.id, user.id))
        .returning();
    } catch {
      res.status(409).json({ error: "This store name is already registered. Please choose another." });
      return;
    }
  }

  const token = signJwt({
    sub: String(user.id),
    phone: user.phone,
    role: user.role,
  });

  res.json({
    success: true,
    token,
    user: {
      id:          user.id,
      name:        user.name,
      phone:       user.phone,
      role:        user.role,
      vendorStore: user.vendorStore ?? null,
    },
  });
});

/* ── POST /api/auth/admin-login ────────────────────────────────── */
const IS_PRODUCTION = process.env.NODE_ENV === "production";
// Demo credentials are only ever allowed outside production. In production the
// admin credentials MUST be supplied via env, otherwise admin login fails
// closed (503) rather than accepting publicly-known defaults.
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

  const token = signJwt({ sub: "admin", phone: "", role: "admin" });
  res.json({ success: true, token });
});

export default router;
