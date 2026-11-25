import { useState, useEffect, useCallback } from "react";
import type { AuthUser } from "@workspace/api-client-react";

export type { AuthUser };

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // Only attempt server auth if an active token or user session actually exists
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("conon_customer_jwt") ||
          localStorage.getItem("conon_jwt") ||
          localStorage.getItem("jwt")
        : null;

    const savedAuthUser =
      typeof window !== "undefined"
        ? localStorage.getItem("conon_auth_user")
        : null;

    if (!token && !savedAuthUser) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const apiOrigin = (
      (import.meta as any).env?.VITE_API_URL ||
      (import.meta as any).env?.VITE_API_BASE_URL ||
      ""
    ).replace(/\/+$/, "");
    const userUrl = `${apiOrigin}/api/auth/user`;

    fetch(userUrl, { credentials: "include", headers })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ user: AuthUser | null }>;
      })
      .then((data) => {
        if (!cancelled) {
          setUser(data.user ?? null);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(() => {
    const base = import.meta.env.BASE_URL.replace(/\/+$/, "") || "/";
    const apiOrigin = (
      (import.meta as any).env?.VITE_API_URL ||
      (import.meta as any).env?.VITE_API_BASE_URL ||
      ""
    ).replace(/\/+$/, "");
    window.location.href = `${apiOrigin}/api/login?returnTo=${encodeURIComponent(base)}`;
  }, []);

  const logout = useCallback(async () => {
    const apiOrigin = (
      (import.meta as any).env?.VITE_API_URL ||
      (import.meta as any).env?.VITE_API_BASE_URL ||
      ""
    ).replace(/\/+$/, "");

    if (typeof window !== "undefined") {
      localStorage.removeItem("conon_auth_user");
      localStorage.removeItem("conon_customer_jwt");
      localStorage.removeItem("conon_jwt");
      localStorage.removeItem("jwt");
    }

    try {
      await fetch(`${apiOrigin}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (_) {}

    setUser(null);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
