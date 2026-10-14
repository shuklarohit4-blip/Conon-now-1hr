import crypto from "crypto";

/**
 * Minimal, dependency-free HS256 JWT implementation (sign + verify).
 * Uses the shared JWT_SECRET env var as the signing key.
 */

export interface JwtPayload {
  sub: string;
  phone: string;
  role: string;
  iat?: number;
  exp?: number;
}

const DEFAULT_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

export function signJwt(
  payload: Omit<JwtPayload, "iat" | "exp">,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const body: JwtPayload = { ...payload, iat: now, exp: now + ttlSeconds };

  const data = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(body))}`;
  const sig = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyJwt(token: string): JwtPayload | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [h, p, sig] = parts;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${h}.${p}`)
    .digest("base64url");

  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(p, "base64url").toString("utf8"),
    ) as JwtPayload;
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
