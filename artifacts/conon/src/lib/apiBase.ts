/**
 * Shared API origin for the Vercel frontend and Render API service.
 * Set VITE_API_BASE_URL to the API origin (without a trailing slash or /api).
 * When unset, local development and same-origin Replit routing are preserved.
 */
const configuredApiOrigin = import.meta.env.VITE_API_BASE_URL?.trim();
const currentOrigin =
  typeof window === "undefined" ? "" : window.location.origin;

export const API_ORIGIN = (configuredApiOrigin || currentOrigin).replace(/\/+$/, "");

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_ORIGIN}${normalizedPath}`;
}