import { motion } from "framer-motion";
import { useDriverLanguage } from "@/context/DriverLanguageContext";

/* Permanent English | हिंदी toggle. Rendered inside the app bar during the
   Duty/Kamai tabs and as a floating control during the full-screen Active Trip
   and Success states, so a driver can switch languages at ANY point. */
export function LanguageToggle({ floating = false }: { floating?: boolean }) {
  const { lang, setLang } = useDriverLanguage();

  return (
    <div
      className={`relative flex items-center bg-slate-100 rounded-full p-1 shrink-0 ${
        floating ? "shadow-lg ring-1 ring-black/5" : ""
      }`}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 34 }}
        className="absolute top-1 bottom-1 rounded-full bg-white shadow"
        style={{ width: "calc(50% - 4px)", left: lang === "en" ? 4 : "calc(50% + 0px)" }}
      />
      <button
        onClick={() => setLang("en")}
        className="relative z-10 px-3 py-1.5 text-[13px] font-black"
        style={{ color: lang === "en" ? "#0f172a" : "#94a3b8" }}
      >
        EN
      </button>
      <button
        onClick={() => setLang("hi")}
        className="relative z-10 px-3 py-1.5 text-[13px] font-black"
        style={{ color: lang === "hi" ? "#0f172a" : "#94a3b8" }}
      >
        हिंदी
      </button>
    </div>
  );
}
