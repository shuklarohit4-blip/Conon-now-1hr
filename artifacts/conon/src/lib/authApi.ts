/**
 * Client helpers for the auth endpoints exposed by the api-server.
 * The api-server is reverse-proxied under the app base path at `${BASE_URL}api/*`.
 *
 * Phone login uses Firebase Phone Auth: the client verifies the OTP with Firebase,
 * then sends the resulting ID token here for server-side validation and JWT issuance.
 */

const API = import.meta.env.BASE_URL; // always ends with "/"

export const JWT_STORAGE_KEY = "conon_jwt";

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
    const r = await fetch(`${API}api/auth/msg91-verify`, {
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
    const r = await fetch(`${API}api/auth/firebase-verify`, {
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
    const r = await fetch(`${API}api/auth/admin-login`, {
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
