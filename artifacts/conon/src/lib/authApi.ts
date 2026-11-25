/**
 * Client helpers for the auth endpoints exposed by the api-server.
 * The API origin can be set to the Render service for production.
 *
 * Phone login uses Firebase Phone Auth: the client verifies the OTP with Firebase,
 * then sends the resulting ID token here for server-side validation and JWT issuance.
 */

import { API_ORIGIN } from "./apiBase";

const API = `${API_ORIGIN}/api`;

export const CUSTOMER_JWT_KEY = "conon_customer_jwt";
export const VENDOR_JWT_KEY   = "conon_vendor_jwt";
export const DRIVER_JWT_KEY   = "conon_driver_jwt";
export const ADMIN_JWT_KEY    = "conon_admin_jwt";

/**
 * Backward compatibility alias (points to customer JWT)
 */
export const JWT_STORAGE_KEY = CUSTOMER_JWT_KEY;

/**
 * Get role-scoped JWT token safely without collisions across tabs.
 */
export function getRoleToken(role: "customer" | "vendor" | "driver" | "admin"): string | null {
  if (typeof window === "undefined") return null;
  if (role === "admin") {
    return localStorage.getItem(ADMIN_JWT_KEY);
  }
  if (role === "vendor") {
    return localStorage.getItem(VENDOR_JWT_KEY) || localStorage.getItem("conon_jwt");
  }
  if (role === "driver") {
    return localStorage.getItem(DRIVER_JWT_KEY) || localStorage.getItem("conon_driver_token");
  }
  return localStorage.getItem(CUSTOMER_JWT_KEY) || localStorage.getItem("conon_jwt") || localStorage.getItem("jwt");
}

export interface OtpUser {
  id: number;
  name: string;
  phone: string;
  role: string;
  vendorStore?: string | null;
}

export interface VerifyOtpResult {
  ok: boolean;
  error?: string;
  token?: string;
  user?: OtpUser;
}

export interface Msg91VerifyOptions {
  role?: "vendor";
  storeName?: string;
  name?: string;
}

/**
 * Validate a MSG91 widget access-token on the server and log the user in.
 * The server binds the account to the number MSG91 verified — the client never
 * supplies the phone number itself.
 */
export async function verifyMsg91(
  accessToken: string,
  opts?: Msg91VerifyOptions,
): Promise<VerifyOtpResult> {
  try {
    const r = await fetch(`${API}/auth/msg91-verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        accessToken,
        ...(opts?.role ? { role: opts.role } : {}),
        ...(opts?.storeName ? { storeName: opts.storeName } : {}),
        ...(opts?.name ? { name: opts.name } : {}),
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return { ok: false, error: data.error ?? "Verification failed." };
    }
    return { ok: true, token: data.token, user: data.user };
  } catch {
    return { ok: false, error: "Network error. Please check your connection." };
  }
}

export interface AdminLoginResult {
  ok: boolean;
  error?: string;
  token?: string;
}

export interface FirebaseVerifyOptions {
  role?: "vendor";
  storeName?: string;
  name?: string;
}

/**
 * Send a Firebase ID token to the server for verification.
 * The server calls Firebase, extracts the verified phone number, creates/finds
 * the user in the DB, and issues a platform JWT.
 */
export async function verifyFirebaseIdToken(
  idToken: string,
  opts?: FirebaseVerifyOptions,
): Promise<VerifyOtpResult> {
  try {
    const r = await fetch(`${API}/auth/firebase-verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        idToken,
        ...(opts?.role      ? { role:      opts.role      } : {}),
        ...(opts?.storeName ? { storeName: opts.storeName } : {}),
        ...(opts?.name      ? { name:      opts.name      } : {}),
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: data.error ?? "Verification failed." };
    return { ok: true, token: data.token, user: data.user };
  } catch {
    return { ok: false, error: "Network error. Please check your connection." };
  }
}

export async function adminLogin(
  email: string,
  password: string,
): Promise<AdminLoginResult> {
  try {
    const r = await fetch(`${API}/auth/admin-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return { ok: false, error: data.error ?? "Invalid admin credentials." };
    }
    return { ok: true, token: data.token };
  } catch {
    return { ok: false, error: "Network error. Please check your connection." };
  }
}

export interface VendorLoginOptions {
  phone?: string;
  storeName?: string;
  name?: string;
}

export interface CustomerLoginOptions {
  phone?: string;
  name?: string;
}

export async function customerLogin(opts?: CustomerLoginOptions): Promise<VerifyOtpResult> {
  try {
    const r = await fetch(`${API}/auth/customer-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        phone: opts?.phone || "9876543210",
        name: opts?.name || "CONON-NOW User",
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return { ok: false, error: data.error ?? "Customer login failed." };
    }
    return { ok: true, token: data.token, user: data.user };
  } catch {
    return { ok: false, error: "Network error. Please check your connection." };
  }
}

export async function vendorLogin(opts?: VendorLoginOptions): Promise<VerifyOtpResult> {
  try {
    const r = await fetch(`${API}/auth/vendor-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        phone: opts?.phone || "9876543210",
        storeName: opts?.storeName || "CONON Authorized Materials Store",
        name: opts?.name || "Master Supplier",
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return { ok: false, error: data.error ?? "Vendor login failed." };
    }
    return { ok: true, token: data.token, user: data.user };
  } catch {
    return { ok: false, error: "Network error. Please check your connection." };
  }
}
