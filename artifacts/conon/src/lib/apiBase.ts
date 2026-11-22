import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";

/**
 * Shared API origin for the Vercel frontend and Render API service.
 * Supports VITE_API_URL and VITE_API_BASE_URL.
 * Keeps http://localhost:5000 as dev fallback.
 */
const configuredApiOrigin = (
  import.meta.env.VITE_API_URL?.trim() ||
  import.meta.env.VITE_API_BASE_URL?.trim()
);

const defaultDevOrigin = "http://localhost:5000";

const currentOrigin =
  typeof window === "undefined" ? defaultDevOrigin : window.location.origin;

export const API_ORIGIN = (configuredApiOrigin || currentOrigin).replace(/\/+$/, "");

if (API_ORIGIN) {
  setBaseUrl(API_ORIGIN);
}

setAuthTokenGetter(() => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("conon_jwt") || localStorage.getItem("jwt");
});

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_ORIGIN}${normalizedPath}`;
}