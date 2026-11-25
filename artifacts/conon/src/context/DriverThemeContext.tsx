import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { Monitor, Sun, Moon } from "lucide-react";

export type DriverThemeMode = "auto" | "light" | "dark";
export type EffectiveDriverTheme = "light" | "dark";

interface DriverThemeContextValue {
  theme: DriverThemeMode;
  effectiveTheme: EffectiveDriverTheme;
  isDark: boolean;
  setTheme: (mode: DriverThemeMode) => void;
  toggleTheme: () => void;
}

const DriverThemeContext = createContext<DriverThemeContextValue | null>(null);

const STORAGE_KEY = "conon_driver_theme";

/**
 * Smart Auto Resolver for Driver Cockpit:
 * 1. Tracks device OS media query (prefers-color-scheme).
 * 2. Falls back to IST Indian Daylight hours (06:30 - 18:30 IST is Sunlight-Proof Day Mode, 18:30 - 06:30 is Night Driving Mode).
 */
function resolveEffectiveTheme(mode: DriverThemeMode): EffectiveDriverTheme {
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

    // IST Daytime Fallback (06:30 - 18:30 IST is Light Mode for sunny dashboard mount)
    const now = new Date();
    const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
    const istHours = (utcHours + 5.5) % 24;
    return istHours >= 6.5 && istHours < 18.5 ? "light" : "dark";
  }

  return "dark";
}

export function DriverThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<DriverThemeMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "auto" || saved === "light" || saved === "dark") {
        return saved;
      }
    }
    return "auto";
  });

  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveDriverTheme>(() =>
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

  const setTheme = useCallback((mode: DriverThemeMode) => {
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
    <DriverThemeContext.Provider value={value}>
      {children}
    </DriverThemeContext.Provider>
  );
}

export function useDriverTheme(): DriverThemeContextValue {
  const ctx = useContext(DriverThemeContext);
  if (!ctx) {
    // Graceful fallback outside provider
    return {
      theme: "auto",
      effectiveTheme: "dark",
      isDark: true,
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return ctx;
}

/**
 * Compact Auto / Light / Dark Theme Toggle for Driver Cockpit
 */
export function DriverThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme, isDark } = useDriverTheme();

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-full border shadow-xs transition-colors ${
        isDark
          ? "bg-[#161F30] border-slate-700/80 text-slate-300"
          : "bg-slate-100 border-slate-200 text-slate-700"
      } ${className}`}
      role="group"
      aria-label="Driver Panel Theme"
    >
      <button
        type="button"
        onClick={() => setTheme("auto")}
        className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
          theme === "auto"
            ? isDark
              ? "bg-amber-400/20 text-amber-300 font-black border border-amber-400/30 shadow-xs"
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
              ? "bg-amber-400/20 text-amber-300 font-black border border-amber-400/30 shadow-xs"
              : "bg-white text-emerald-800 font-black shadow-xs border border-slate-200"
            : "hover:text-slate-200 opacity-70 hover:opacity-100"
        }`}
        title="Day Mode: High-contrast sunlight readable for dashboard mount"
      >
        <Sun className="w-3 h-3 text-amber-500" />
        <span className="hidden sm:inline">Day</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
          theme === "dark"
            ? isDark
              ? "bg-amber-400/20 text-amber-300 font-black border border-amber-400/30 shadow-xs"
              : "bg-slate-900 text-amber-300 font-black shadow-xs"
            : "hover:text-slate-200 opacity-70 hover:opacity-100"
        }`}
        title="Night Mode: Low-glare night driving"
      >
        <Moon className="w-3 h-3 text-indigo-400" />
        <span className="hidden sm:inline">Night</span>
      </button>
    </div>
  );
}

export default DriverThemeProvider;
