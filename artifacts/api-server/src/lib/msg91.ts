/**
 * MSG91 OTP Widget — server-side access-token verification.
 *
 * The browser obtains a short-lived JWT "access-token" from the MSG91 OTP
 * widget once the user has verified their OTP. We validate that token here with
 * the account authkey (kept server-side only) and recover the verified mobile
 * number, so an account is always bound to the number MSG91 actually verified —
 * never to a number supplied by the (untrusted) client.
 *
 * Docs: https://docs.msg91.com/otp-widget/verify-access-token
 */

const VERIFY_URL = "https://api.msg91.com/api/v5/widget/verifyAccessToken";

export interface Msg91VerifyResult {
  ok: boolean;
  /** Verified 10-digit Indian mobile, when recoverable. */
  phone?: string;
  error?: string;
  /** True when MSG91_AUTH_KEY is missing (server config error, not user error). */
  notConfigured?: boolean;
}

export function isMsg91Configured(): boolean {
  return Boolean(process.env.MSG91_AUTH_KEY);
}

/** Reduce any string/number to a valid 10-digit Indian mobile, or "". */
function normalizeIndianMobile(raw: unknown): string {
  const digits =
    typeof raw === "string" || typeof raw === "number"
      ? String(raw).replace(/\D/g, "")
      : "";
  const local =
    digits.length === 12 && digits.startsWith("91")
      ? digits.slice(2)
      : digits.length === 11 && digits.startsWith("0")
        ? digits.slice(1)
        : digits;
  return /^[6-9]\d{9}$/.test(local) ? local : "";
}

/** Collect every primitive leaf value from an arbitrary JSON structure. */
function collectLeaves(value: unknown, out: string[], depth = 0): void {
  if (depth > 6 || value == null) return;
  if (typeof value === "string" || typeof value === "number") {
    out.push(String(value));
  } else if (Array.isArray(value)) {
    for (const v of value) collectLeaves(v, out, depth + 1);
  } else if (typeof value === "object") {
    for (const v of Object.values(value as Record<string, unknown>)) {
      collectLeaves(v, out, depth + 1);
    }
  }
}

/**
 * Best-effort decode of a JWT payload. No signature check is performed — the
 * token's validity is already established by the verifyAccessToken call, so the
 * payload can be trusted afterwards to recover the verified identifier.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const json = Buffer.from(parts[1], "base64url").toString("utf8");
    const obj = JSON.parse(json);
    return obj && typeof obj === "object"
      ? (obj as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function recoverPhone(responseData: unknown, accessToken: string): string {
  const candidates: string[] = [];
  collectLeaves(responseData, candidates);
  const payload = decodeJwtPayload(accessToken);
  if (payload) collectLeaves(payload, candidates);
  for (const candidate of candidates) {
    const phone = normalizeIndianMobile(candidate);
    if (phone) return phone;
  }
  return "";
}

export async function verifyMsg91AccessToken(
  accessToken: string,
): Promise<Msg91VerifyResult> {
  const authkey = process.env.MSG91_AUTH_KEY;
  if (!authkey) {
    return {
      ok: false,
      notConfigured: true,
      error: "OTP verification is not configured.",
    };
  }
  if (!accessToken) {
    return { ok: false, error: "Missing OTP access token." };
  }

  let data: unknown;
  try {
    const r = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", authkey },
      body: JSON.stringify({ "access-token": accessToken }),
    });
    data = await r.json().catch(() => ({}));
  } catch {
    return { ok: false, error: "Couldn't reach the OTP service. Please try again." };
  }

  const type = String((data as { type?: unknown })?.type ?? "").toLowerCase();
  if (type !== "success") {
    const msg = (data as { message?: unknown })?.message;
    return {
      ok: false,
      error: typeof msg === "string" && msg ? msg : "OTP verification failed.",
    };
  }

  return { ok: true, phone: recoverPhone(data, accessToken) };
}
