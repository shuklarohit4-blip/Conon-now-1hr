import { motion } from "framer-motion";
import { LogOut, Wifi, WifiOff } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import { useVendorLanguage } from "@/context/VendorLanguageContext";
import { useVendor } from "@/context/VendorContext";
import { GREEN, inrShort } from "./theme";

function LanguageToggle() {
  const { lang, setLang } = useVendorLanguage();
  const pick = (next: "en" | "hi") => {
    if (next === lang) return;
    setLang(next);
    toast(next === "en" ? "Language set to English" : "भाषा हिंदी पर सेट है", {
      icon: next === "en" ? "🇬🇧" : "🇮🇳",
    });
  };
  const seg = (active: boolean) =>
    `flex items-center gap-1 px-2.5 py-1 text-[9px] font-black uppercase tracking-tight leading-none transition-colors ${
      active ? "bg-white text-green-800" : "text-white/60"
    }`;
  return (
    <div
      className="flex items-center rounded-full overflow-hidden border border-white/25"
      role="group"
      aria-label="Language / भाषा"
    >
      <button onClick={() => pick("en")} className={seg(lang === "en")} title="English" aria-pressed={lang === "en"}>
        <span className="text-[12px] leading-none">A</span> English
      </button>
      <button onClick={() => pick("hi")} className={seg(lang === "hi")} title="हिंदी" aria-pressed={lang === "hi"}>
        <span className="text-[12px] leading-none">अ</span> हिंदी
      </button>
    </div>
  );
}

export function VendorHeader({
  isOnline,
  setIsOnline,
}: {
  isOnline: boolean;
  setIsOnline: (v: boolean | ((p: boolean) => boolean)) => void;
}) {
  const [, setLocation] = useLocation();
  const { logout, user } = useUser();
  const { t } = useVendorLanguage();
  const { orders, balance } = useVendor();
  const storeName = user?.vendorStore || user?.name || t("myStore");

  return (
    <div className="px-5 pt-10 pb-6 rounded-b-[44px] shadow-xl shrink-0" style={{ background: GREEN }}>
      <div className="flex justify-between items-start gap-3 mb-5">
        <div className="min-w-0">
          <h2 className="font-display font-black italic text-xl text-white truncate">{t("myStore")}</h2>
          <p className="text-[10px] font-bold text-green-200 uppercase tracking-widest truncate">
            {storeName}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <LanguageToggle />
          <motion.button
            onClick={() => {
              setIsOnline((v) => !v);
              toast(isOnline ? t("storeClosed") : t("storeLive"), {
                icon: isOnline ? "🔴" : "🟢",
              });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase whitespace-nowrap"
            style={{ background: isOnline ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.2)" }}
            whileTap={{ scale: 0.94 }}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 text-green-300" />
                <span className="text-green-100">{t("live")}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-white/50" />
                <span className="text-white/50">{t("offline")}</span>
              </>
            )}
          </motion.button>
          <button
            onClick={() => {
              toast(t("storeClosed"), { icon: "👋" });
              logout();
              setLocation("/login");
            }}
            className="p-2 bg-white/10 rounded-full"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/10 p-4 rounded-[24px] backdrop-blur-sm border border-white/5">
          <p className="text-[9px] font-black text-green-200 uppercase tracking-widest leading-tight">
            {t("todaysOrders")}
          </p>
          <p className="text-xl font-display font-black text-white">{orders.length}</p>
        </div>
        <div className="bg-white/10 p-4 rounded-[24px] backdrop-blur-sm border border-white/5">
          <p className="text-[9px] font-black text-green-200 uppercase tracking-widest leading-tight">
            {t("balanceDue")}
          </p>
          <p className="text-xl font-display font-black text-white">{inrShort(balance)}</p>
        </div>
      </div>
    </div>
  );
}
