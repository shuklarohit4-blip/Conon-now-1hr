import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";
import { IS_LOCAL_ADMIN, MAC_ADMIN_KEY } from "@/config/adminGuard";

/**
 * Shared API origin for the Vercel frontend and Render API service.
 * Supports VITE_API_URL and VITE_API_BASE_URL.
 * Falls back to http://localhost:5001 in dev to match backend PORT.
 */
const rawConfiguredApi = (
  import.meta.env.VITE_API_URL?.trim() ||
  import.meta.env.VITE_API_BASE_URL?.trim()
);
const configuredApiOrigin = rawConfiguredApi ? rawConfiguredApi.replace(/\/api\/?$/, "") : undefined;

const defaultDevOrigin = "http://localhost:5001";

const currentOrigin =
  typeof window === "undefined" ? defaultDevOrigin : window.location.origin;

export const API_ORIGIN = (configuredApiOrigin || currentOrigin).replace(/\/+$/, "");

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

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
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
  return fetch(url, { ...init, headers });
}
