import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { Monitor, Sun, Moon } from "lucide-react";

export type VendorThemeMode = "auto" | "light" | "dark";
export type EffectiveVendorTheme = "light" | "dark";

interface VendorThemeContextValue {
  theme: VendorThemeMode;
  effectiveTheme: EffectiveVendorTheme;
  isDark: boolean;
  setTheme: (mode: VendorThemeMode) => void;
  toggleTheme: () => void;
}

const VendorThemeContext = createContext<VendorThemeContextValue | null>(null);

const STORAGE_KEY = "conon_vendor_theme";

/**
 * Smart Auto Resolver:
 * 1. Checks device OS media query (prefers-color-scheme).
 * 2. Falls back to IST Indian Daylight hours (06:30 - 18:30 IST is Light Mode, 18:30 - 06:30 is Dark Mode).
 */
function resolveEffectiveTheme(mode: VendorThemeMode): EffectiveVendorTheme {
  if (mode === "light") return "light";
  if (mode === "dark") return "dark";

  if (typeof window !== "undefined") {
    try {
      const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
      if (darkQuery.matches) return "dark";
      const lightQuery = window.matchMedia("(prefers-color-scheme: light)");
      if (lightQuery.matches) return "light";
    } catch {
      // mediaQuery not supported
    }

    // IST Daytime Fallback (06:30 - 18:30 IST is Light, else Dark)
    const now = new Date();
    const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
    const istHours = (utcHours + 5.5) % 24;
    return istHours >= 6.5 && istHours < 18.5 ? "light" : "dark";
  }

  return "dark";
}

export function VendorThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<VendorThemeMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "auto" || saved === "light" || saved === "dark") {
        return saved;
      }
    }
    return "auto";
  });

  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveVendorTheme>(() =>
    resolveEffectiveTheme(theme)
  );

  useEffect(() => {
    const resolved = resolveEffectiveTheme(theme);
    setEffectiveTheme(resolved);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch {
        // ignore
      }

      if (theme === "auto") {
        const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => {
          setEffectiveTheme(resolveEffectiveTheme("auto"));
        };
        darkQuery.addEventListener?.("change", handler);
        return () => {
          darkQuery.removeEventListener?.("change", handler);
        };
      }
    }
    return undefined;
  }, [theme]);

  const setTheme = useCallback((mode: VendorThemeMode) => {
    setThemeState(mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      if (prev === "auto") return "light";
      if (prev === "light") return "dark";
      return "auto";
    });
  }, []);

  const isDark = effectiveTheme === "dark";

  const value = useMemo(
    () => ({
      theme,
      effectiveTheme,
      isDark,
      setTheme,
      toggleTheme,
    }),
    [theme, effectiveTheme, isDark, setTheme, toggleTheme]
  );

  return (
    <VendorThemeContext.Provider value={value}>
      {children}
    </VendorThemeContext.Provider>
  );
}

export function useVendorTheme(): VendorThemeContextValue {
  const ctx = useContext(VendorThemeContext);
  if (!ctx) {
    // Graceful fallback if used outside provider
    const isDark = true;
    return {
      theme: "auto",
      effectiveTheme: "dark",
      isDark,
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return ctx;
}

/**
 * Single-Row Compact Theme Switcher Pill (Auto / Light / Dark)
 */
export function VendorThemeToggle({ className = "" }: { className?: string }) {
  const { theme, effectiveTheme, setTheme } = useVendorTheme();
  const isDark = effectiveTheme === "dark";

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-full border shadow-sm transition-colors ${
        isDark
          ? "bg-slate-900/90 border-slate-700/80 text-slate-400"
          : "bg-slate-100 border-slate-200 text-slate-600"
      } ${className}`}
      role="group"
      aria-label="Vendor Panel Theme"
    >
      <button
        type="button"
        onClick={() => setTheme("auto")}
        className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
          theme === "auto"
            ? isDark
              ? "bg-amber-400/20 text-amber-300 font-black shadow-xs border border-amber-400/30"
              : "bg-white text-emerald-800 font-black shadow-xs border border-slate-200"
            : "hover:text-slate-200 opacity-70 hover:opacity-100"
        }`}
        title="Auto: Follows device appearance (Daylight IST Fallback)"
      >
        <Monitor className="w-3 h-3" />
        <span className="hidden sm:inline">Auto</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
          theme === "light"
            ? isDark
              ? "bg-amber-400/20 text-amber-300 font-black shadow-xs border border-amber-400/30"
              : "bg-white text-emerald-800 font-black shadow-xs border border-slate-200"
            : "hover:text-slate-200 opacity-70 hover:opacity-100"
        }`}
        title="Light Mode: Sunlight-readable for daytime hardware counter"
      >
        <Sun className="w-3 h-3 text-amber-500" />
        <span className="hidden sm:inline">Light</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
          theme === "dark"
            ? isDark
              ? "bg-amber-400/20 text-amber-300 font-black shadow-xs border border-amber-400/30"
              : "bg-slate-900 text-amber-300 font-black shadow-xs"
            : "hover:text-slate-200 opacity-70 hover:opacity-100"
        }`}
        title="Dark Mode: Night comfort"
      >
        <Moon className="w-3 h-3 text-indigo-400" />
        <span className="hidden sm:inline">Dark</span>
      </button>
    </div>
  );
}
