import axios, { AxiosError } from "axios";
import { JWT_STORAGE_KEY } from "./authApi";
import { beginLoading, endLoading } from "./loading";
import { API_ORIGIN } from "./apiBase";
import { IS_LOCAL_ADMIN, MAC_ADMIN_KEY } from "@/config/adminGuard";

/**
 * Shared axios client for the CONON-NOW api-server.
 *
 * The API origin can be set to the Render service for production. When unset,
 * local development and deployments continue to use the app's own origin.
 * Every request carries the vendor JWT (when present) as a Bearer token and the
 * anonymous session cookie (withCredentials). The global loading bar is driven
 * by the request/response interceptors.
 */
export const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  beginLoading();
  let token: string | null = null;
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  if (path.startsWith("/admin")) {
    token = localStorage.getItem("conon_admin_jwt");
  } else if (path.startsWith("/vendor")) {
    token = localStorage.getItem("conon_vendor_jwt") || localStorage.getItem("conon_jwt");
  } else if (path.startsWith("/driver")) {
    token = localStorage.getItem("conon_driver_jwt") || localStorage.getItem("conon_driver_token");
  } else {
    token = localStorage.getItem("conon_customer_jwt") || localStorage.getItem("conon_jwt");
  }

  config.headers = config.headers ?? {};
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (IS_LOCAL_ADMIN && MAC_ADMIN_KEY) {
    config.headers["x-admin-key"] = MAC_ADMIN_KEY;
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    endLoading();
    return res;
  },
  (err) => {
    endLoading();
    return Promise.reject(err);
  },
);

/** Pull a human-readable message out of an axios error, with a fallback. */
export function apiErrorMessage(err: unknown, fallback = "Something went wrong."): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as { error?: string } | undefined;
    if (data?.error) return data.error;
    if (err.message) return err.message;
  }
  return fallback;
}
