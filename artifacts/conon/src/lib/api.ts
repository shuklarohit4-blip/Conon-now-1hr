import axios, { AxiosError } from "axios";
import { JWT_STORAGE_KEY } from "./authApi";
import { beginLoading, endLoading } from "./loading";

/**
 * Shared axios client for the CONON api-server.
 *
 * The api-server is reverse-proxied under the app base path at `${BASE_URL}api`.
 * Every request carries the vendor JWT (when present) as a Bearer token and the
 * anonymous session cookie (withCredentials). The global loading bar is driven
 * by the request/response interceptors.
 */
export const api = axios.create({
  baseURL: `${import.meta.env.BASE_URL}api`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  beginLoading();
  const token = localStorage.getItem(JWT_STORAGE_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
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
