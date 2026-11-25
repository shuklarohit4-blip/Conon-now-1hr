import React from "react";
import { DriverRegisterWizard } from "@/components/kyc/DriverRegisterWizard";
import { useLocation } from "wouter";
import { useDriverTheme, DriverThemeToggle } from "@/context/DriverThemeContext";
import { useDriverLang, DriverLanguageToggle } from "@/context/DriverLanguageContext";
import { ArrowLeft } from "lucide-react";

export function DriverRegisterPage() {
  const [, setLocation] = useLocation();
  const { isDark } = useDriverTheme();
  const { t, lang } = useDriverLang();

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isDark ? "bg-[#070B14] text-slate-100" : "bg-[#F5F7FA] text-slate-900"
      }`}
    >
      {/* Top Header Bar with Brand Lockup, Theme & Language Controls */}
      <header
        className={`sticky top-0 z-40 px-4 sm:px-6 py-3 border-b backdrop-blur-md transition-colors ${
          isDark ? "bg-[#0B1120]/90 border-slate-800" : "bg-white/90 border-slate-200 shadow-xs"
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLocation("/driver")}
              className={`p-2 rounded-xl transition cursor-pointer border ${
                isDark
                  ? "bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
              }`}
              title={lang === "hi" ? "वापस ड्राइवर कॉकपिट पर जाएं" : "Back to Driver Cockpit"}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <a href="/" className="flex items-center gap-2 group">
              <img
                src={`${import.meta.env.BASE_URL}images/conon-logo-transparent.png`}
                alt="CONON"
                className="h-8 w-auto object-contain group-hover:scale-105 transition-transform"
              />
            </a>

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-700/60">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">
                {t("brandTagline", "CONON DRIVER")}
              </span>
              <span className={`text-[10px] font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                • {lang === "hi" ? "फ्लीट ड्राइवर व लोडर ऑनबोर्डिंग (केवाईसी)" : "Fleet Onboarding & Paper KYC"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <DriverLanguageToggle />
            <DriverThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Wizard Center Container */}
      <main className="flex-1 py-8 px-4 flex flex-col items-center justify-center">
        <DriverRegisterWizard
          onSuccess={() => setLocation("/driver")}
          onCancel={() => setLocation("/driver")}
        />
      </main>
    </div>
  );
}

export default DriverRegisterPage;
