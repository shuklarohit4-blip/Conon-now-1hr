import crypto from "crypto";

/**
 * Minimal, dependency-free HS256 JWT implementation (sign + verify).
 * Uses the shared JWT_SECRET env var as the signing key.
 */

export interface JwtPayload {
  sub: string;
  phone: string;
  role: string;
  name?: string;
  email?: string;
  vendorStore?: string;
  vehicleType?: string;
  vehiclePlate?: string;
  iat?: number;
  exp?: number;
}

const DEFAULT_DEV_SECRET = "conon-builder-network-default-dev-secret-key-2025";
const DEFAULT_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

function getSecret(): string {
  return process.env.JWT_SECRET || DEFAULT_DEV_SECRET;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

export function signJwt(
  payload: Omit<JwtPayload, "iat" | "exp">,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
): string {
  const secret = getSecret();

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const body: JwtPayload = { ...payload, iat: now, exp: now + ttlSeconds };

  const data = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(body))}`;
  const sig = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyJwt(token: string): JwtPayload | null {
  const secret = getSecret();

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
