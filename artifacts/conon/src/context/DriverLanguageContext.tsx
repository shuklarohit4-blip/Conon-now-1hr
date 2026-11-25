import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  DRIVER_TRANSLATIONS,
  type DriverLang,
  type DriverTranslationSchema,
} from "@/i18n/driverTranslations";

export type Lang = DriverLang;
export type TKey = keyof DriverTranslationSchema | string;

export interface DriverLanguageValue {
  lang: DriverLang;
  setLang: (l: DriverLang) => void;
  toggleLang: () => void;
  t: (key: TKey, defaultVal?: string) => string;
}

const DriverLanguageContext = createContext<DriverLanguageValue | null>(null);

const STORAGE_KEY = "conon_driver_lang";
const LEGACY_STORAGE_KEY = "conon.driver.lang";

export function DriverLanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<DriverLang>(() => {
    if (typeof window === "undefined") return "hi";
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    return saved === "en" ? "en" : "hi";
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      localStorage.setItem(LEGACY_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, [lang]);

  const setLang = useCallback((l: DriverLang) => {
    setLangState(l);
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => (prev === "en" ? "hi" : "en"));
  }, []);

  const t = useCallback(
    (key: TKey, defaultVal?: string): string => {
      const activeDict = DRIVER_TRANSLATIONS[lang] as Record<string, string>;
      const fallbackDict = DRIVER_TRANSLATIONS.en as Record<string, string>;
      return activeDict[key] ?? fallbackDict[key] ?? defaultVal ?? String(key);
    },
    [lang]
  );

  const value = useMemo(
    () => ({
      lang,
      setLang,
      toggleLang,
      t,
    }),
    [lang, setLang, toggleLang, t]
  );

  return (
    <DriverLanguageContext.Provider value={value}>
      {children}
    </DriverLanguageContext.Provider>
  );
}

export function useDriverLanguage(): DriverLanguageValue {
  const ctx = useContext(DriverLanguageContext);
  if (!ctx) {
    // Graceful fallback if called outside provider
    return {
      lang: "hi",
      setLang: () => {},
      toggleLang: () => {},
      t: (k: TKey, def?: string) => {
        const fallback = DRIVER_TRANSLATIONS.hi as Record<string, string>;
        return fallback[k] ?? def ?? String(k);
      },
    };
  }
  return ctx;
}

// Re-export alias for type safety and convenience
export const useDriverLang = useDriverLanguage;

/**
 * Prominent Single-Tap Language Switcher Pill (EN | हिंदी) for Driver Cockpit
 */
export function DriverLanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useDriverLanguage();

  const handlePick = (next: DriverLang) => {
    if (next === lang) return;
    setLang(next);
    toast(next === "en" ? "Language set to English" : "भाषा हिंदी पर सेट कर दी गई है", {
      icon: next === "en" ? "🇬🇧" : "🇮🇳",
    });
  };

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-full border shadow-xs transition-colors ${className}`}
      role="group"
      aria-label="Language / भाषा"
    >
      <button
        type="button"
        onClick={() => handlePick("en")}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight transition-all cursor-pointer ${
          lang === "en"
            ? "bg-emerald-600 text-white shadow-xs"
            : "text-slate-400 hover:text-slate-200"
        }`}
        title="Switch to English"
        aria-pressed={lang === "en"}
      >
        <span>EN</span>
      </button>

      <button
        type="button"
        onClick={() => handlePick("hi")}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black tracking-tight transition-all cursor-pointer ${
          lang === "hi"
            ? "bg-amber-400 text-slate-950 shadow-xs"
            : "text-slate-400 hover:text-slate-200"
        }`}
        title="हिंदी भाषा चुनें"
        aria-pressed={lang === "hi"}
      >
        <span>हिंदी</span>
      </button>
    </div>
  );
}

export default DriverLanguageProvider;
