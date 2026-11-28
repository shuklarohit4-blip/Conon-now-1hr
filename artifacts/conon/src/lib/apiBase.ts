import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";
import { IS_LOCAL_ADMIN, MAC_ADMIN_KEY } from "@/config/adminGuard";

/**
 * Network-agnostic API origin resolver:
 * - In local/LAN/DevTunnel browser sessions served via Vite, ALWAYS prefers relative
 *   same-origin URLs (`window.location.origin`), so Vite proxies `/api` & `/uploads`
 *   cleanly across `localhost`, `http://192.168.x.x:xxxx`, and `*.devtunnels.ms`.
 * - In remote static deployments (Netlify/Vercel) where `VITE_API_URL` is a public
 *   HTTPS API origin (non-localhost), routes to that remote API origin.
 */
const rawConfiguredApi = (
  import.meta.env?.VITE_API_URL?.trim() ||
  import.meta.env?.VITE_API_BASE_URL?.trim()
);
const configuredApiOrigin = rawConfiguredApi
  ? rawConfiguredApi.replace(/\/api\/?$/, "").replace(/\/+$/, "")
  : undefined;

const LOCAL_HOST_RE = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i;

function resolveEffectiveOrigin(): string {
  if (typeof window === "undefined") {
    return configuredApiOrigin && !LOCAL_HOST_RE.test(configuredApiOrigin)
      ? configuredApiOrigin
      : "";
  }
  const currentOrigin = window.location.origin.replace(/\/+$/, "");
  // Never honor a baked localhost API override when running in the browser;
  // Vite proxy (/api, /uploads) handles localhost, LAN Wi-Fi IPs, and *.devtunnels.ms identically.
  if (configuredApiOrigin && !LOCAL_HOST_RE.test(configuredApiOrigin)) {
    return configuredApiOrigin;
  }
  return currentOrigin;
}

export const API_ORIGIN = resolveEffectiveOrigin();

if (API_ORIGIN) {
  setBaseUrl(API_ORIGIN);
}

setAuthTokenGetter(() => {
  if (typeof window === "undefined") return null;
  const path = window.location.pathname;
  if (path.startsWith("/admin")) {
    return localStorage.getItem("conon_admin_jwt");
  }
  if (path.startsWith("/vendor")) {
    return localStorage.getItem("conon_vendor_jwt") || localStorage.getItem("conon_jwt");
  }
  if (path.startsWith("/driver")) {
    return localStorage.getItem("conon_driver_jwt") || localStorage.getItem("conon_driver_token");
  }
  return (
    localStorage.getItem("conon_customer_jwt") ||
    localStorage.getItem("conon_jwt") ||
    localStorage.getItem("jwt")
  );
});

/**
 * Strips any legacy hardcoded localhost:xxxx prefix so asset/API URLs stay network-agnostic.
 */
export function normalizeRelativeAssetUrl(pathOrUrl?: string | null): string {
  const raw = String(pathOrUrl || "").trim();
  if (!raw) return "";
  if (raw.startsWith("data:") || raw.startsWith("blob:")) return raw;
  return raw.replace(/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?/i, "");
}

export function apiUrl(path: string): string {
  const clean = normalizeRelativeAssetUrl(path);
  if (/^https?:\/\//i.test(clean)) return clean;
  const normalizedPath = clean.startsWith("/") ? clean : `/${clean}`;
  if (typeof window !== "undefined") {
    // Same-origin relative path in dev / proxy mode; explicit API_ORIGIN only when cross-origin HTTPS
    if (configuredApiOrigin && !LOCAL_HOST_RE.test(configuredApiOrigin)) {
      return `${configuredApiOrigin}${normalizedPath}`;
    }
    return normalizedPath;
  }
  return `${API_ORIGIN}${normalizedPath}`;
}

export const resolveApiUrl = apiUrl;

export function getAdminHeaders(extra: HeadersInit = {}): Record<string, string> {
  const headers: Record<string, string> = {};
  if (typeof window !== "undefined") {
    const adminJwt = localStorage.getItem("conon_admin_jwt");
    if (adminJwt) headers["Authorization"] = `Bearer ${adminJwt}`;
  }
  if (IS_LOCAL_ADMIN && MAC_ADMIN_KEY) {
    headers["x-admin-key"] = MAC_ADMIN_KEY;
  }
  if (extra) {
    if (extra instanceof Headers) {
      extra.forEach((v, k) => { headers[k] = v; });
    } else if (Array.isArray(extra)) {
      extra.forEach(([k, v]) => { headers[k] = v; });
    } else {
      Object.assign(headers, extra);
    }
  }
  return headers;
}

export async function adminFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const url = resolveApiUrl(path);
  const headers = getAdminHeaders(init.headers || {});
  return fetch(url, { cache: "no-store", ...init, headers });
}
