import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  VENDOR_TRANSLATIONS,
  type VendorLang,
  type VendorTranslationSchema,
} from "@/i18n/vendorTranslations";

export type Lang = VendorLang;

export type TKey = keyof VendorTranslationSchema | string;

export interface VendorLanguageValue {
  lang: VendorLang;
  setLang: (l: VendorLang) => void;
  toggleLang: () => void;
  t: (key: TKey, defaultVal?: string) => string;
  priceUpdated: (name: string, price: number) => string;
  stockMessage: (name: string, inStock: boolean) => string;
  payoutMessage: (amount: number) => string;
}

const VendorLanguageContext = createContext<VendorLanguageValue | null>(null);

const STORAGE_KEY = "conon_vendor_lang";
const LEGACY_STORAGE_KEY = "conon.vendor.lang";

export function VendorLanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<VendorLang>(() => {
    if (typeof window === "undefined") return "en";
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    return saved === "hi" ? "hi" : "en";
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      localStorage.setItem(LEGACY_STORAGE_KEY, lang);
    } catch {
      // ignore storage error
    }
  }, [lang]);

  const setLang = useCallback((l: VendorLang) => {
    setLangState(l);
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => (prev === "en" ? "hi" : "en"));
  }, []);

  const t = useCallback(
    (key: TKey, defaultVal?: string): string => {
      const activeDict = VENDOR_TRANSLATIONS[lang] as Record<string, string>;
      const fallbackDict = VENDOR_TRANSLATIONS.en as Record<string, string>;
      return activeDict[key] ?? fallbackDict[key] ?? defaultVal ?? String(key);
    },
    [lang]
  );

  const priceUpdated = useCallback(
    (name: string, price: number) =>
      lang === "hi"
        ? `${name} का भाव ₹${price.toLocaleString("en-IN")} अपडेट हो गया`
        : `${name} price updated to ₹${price.toLocaleString("en-IN")}`,
    [lang]
  );

  const stockMessage = useCallback(
    (name: string, inStock: boolean) =>
      lang === "hi"
        ? inStock
          ? `${name} अब स्टॉक में उपलब्ध है`
          : `${name} स्टॉक खत्म (आउट ऑफ स्टॉक)`
        : inStock
        ? `${name} is back in stock`
        : `${name} marked out of stock`,
    [lang]
  );

  const payoutMessage = useCallback(
    (amount: number) =>
      lang === "hi"
        ? `₹${amount.toLocaleString("en-IN")} निकासी की रिक्वेस्ट भेज दी गई`
        : `Payout of ₹${amount.toLocaleString("en-IN")} requested`,
    [lang]
  );

  const value = useMemo(
    () => ({
      lang,
      setLang,
      toggleLang,
      t,
      priceUpdated,
      stockMessage,
      payoutMessage,
    }),
    [lang, setLang, toggleLang, t, priceUpdated, stockMessage, payoutMessage]
  );

  return (
    <VendorLanguageContext.Provider value={value}>
      {children}
    </VendorLanguageContext.Provider>
  );
}

export function useVendorLanguage(): VendorLanguageValue {
  const ctx = useContext(VendorLanguageContext);
  if (!ctx) {
    // Graceful fallback if called outside provider
    return {
      lang: "en",
      setLang: () => {},
      toggleLang: () => {},
      t: (k: TKey, def?: string) => {
        const fallback = VENDOR_TRANSLATIONS.en as Record<string, string>;
        return fallback[k] ?? def ?? String(k);
      },
      priceUpdated: (n, p) => `${n} price updated to ₹${p}`,
      stockMessage: (n, s) => (s ? `${n} is in stock` : `${n} out of stock`),
      payoutMessage: (a) => `Payout of ₹${a} requested`,
    };
  }
  return ctx;
}

// Re-export alias for type safety and convenience
export const useVendorLang = useVendorLanguage;

/**
 * Prominent Single-Tap Language Switcher Pill (EN | हिंदी)
 */
export function VendorLanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useVendorLanguage();

  const handlePick = (next: VendorLang) => {
    if (next === lang) return;
    setLang(next);
    toast(next === "en" ? "Language set to English" : "भाषा हिंदी पर सेट कर दी गई है", {
      icon: next === "en" ? "🇬🇧" : "🇮🇳",
    });
  };

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-full border shadow-sm transition-colors ${className}`}
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
