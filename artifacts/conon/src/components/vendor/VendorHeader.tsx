import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Wifi, WifiOff, Store, CheckCircle, ChevronDown, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import { useVendorLanguage } from "@/context/VendorLanguageContext";
import { useVendor } from "@/context/VendorContext";
import { GREEN, inr, inrShort } from "./theme";
import { SocketStatusPill } from "@/services/socket";

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
      className="flex items-center rounded-full overflow-hidden border border-white/25 shadow-sm"
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
  isOnline: propIsOnline,
  setIsOnline: propSetIsOnline,
}: {
  isOnline?: boolean;
  setIsOnline?: (v: boolean | ((p: boolean) => boolean)) => void;
}) {
  const [, setLocation] = useLocation();
  const { logout } = useUser();
  const { t } = useVendorLanguage();
  const {
    vendor,
    hubs,
    orders,
    balance,
    isOnline,
    toggleStoreStatus,
    switchDemoShop,
  } = useVendor();

  const [showHubPicker, setShowHubPicker] = useState(false);

  // Fallback cleanly to Lucknow flagship store if loading or unassigned
  const storeName = vendor?.shopName || "CONON Partner Store";
  const storeCode = vendor?.shopCode || "CN-LKO-101";
  const hubZone = vendor?.hubZone ? vendor.hubZone.split("(")[0].trim() : "Latouche Road Hub";

  const todaysEarnings = orders.reduce((acc, o) => acc + (o.totalDealerPayout || o.value || 0), 0);

  const handleToggleOnline = async () => {
    try {
      await toggleStoreStatus();
      toast(isOnline ? t("storeClosed") : t("storeLive"), {
        icon: isOnline ? "🔴" : "🟢",
      });
    } catch {
      toast.error("Could not update store status");
    }
  };

  return (
    <div className="px-5 pt-8 pb-5 rounded-b-[40px] shadow-xl shrink-0 relative z-20" style={{ background: GREEN }}>
      {/* Top Header Row */}
      <div className="flex justify-between items-start gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[9px] font-black tracking-wider uppercase backdrop-blur-sm">
              <CheckCircle className="w-3 h-3 text-emerald-300" /> Verified Partner
            </span>
            <button
              onClick={() => setShowHubPicker(true)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/25 hover:bg-amber-400/40 text-amber-100 text-[9px] font-black tracking-wider uppercase transition"
              title="Switch Lucknow Hub Shop"
            >
              <Store className="w-2.5 h-2.5 text-amber-300" /> Switch Hub <ChevronDown className="w-2.5 h-2.5" />
            </button>
          </div>
          <h2 className="font-display font-black italic text-xl text-white truncate mt-1 leading-tight">
            {storeName}
          </h2>
          <p className="text-[10px] font-bold text-green-200 tracking-wider truncate mt-0.5">
            {storeCode} • {hubZone}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 pt-1">
          <SocketStatusPill />
          <LanguageToggle />

          <motion.button
            onClick={handleToggleOnline}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase whitespace-nowrap shadow-sm border border-white/20"
            style={{ background: isOnline ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.35)" }}
            whileTap={{ scale: 0.94 }}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 text-green-300 animate-pulse" />
                <span className="text-white">{t("live")}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-white/60" />
                <span className="text-white/60">{t("offline")}</span>
              </>
            )}
          </motion.button>

          <button
            onClick={() => {
              toast("Logged out of partner session", { icon: "👋" });
              logout();
              setLocation("/home");
            }}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition"
            aria-label="Log out"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>

      {/* 3 Quick Hero Stat Chips */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/10 p-3 rounded-[20px] backdrop-blur-sm border border-white/10 text-center">
          <p className="text-[8px] font-black text-green-200 uppercase tracking-widest leading-none">
            {t("todaysOrders")}
          </p>
          <p className="text-lg font-display font-black text-white mt-1 leading-none">
            {orders.length}
          </p>
        </div>
        <div className="bg-white/10 p-3 rounded-[20px] backdrop-blur-sm border border-white/10 text-center">
          <p className="text-[8px] font-black text-green-200 uppercase tracking-widest leading-none">
            Today's Earning
          </p>
          <p className="text-lg font-display font-black text-amber-300 mt-1 leading-none">
            {inrShort(todaysEarnings)}
          </p>
        </div>
        <div className="bg-white/10 p-3 rounded-[20px] backdrop-blur-sm border border-white/10 text-center">
          <p className="text-[8px] font-black text-green-200 uppercase tracking-widest leading-none">
            {t("balanceDue")}
          </p>
          <p className="text-lg font-display font-black text-white mt-1 leading-none">
            {inrShort(balance)}
          </p>
        </div>
      </div>

      {/* Quick Hub Switcher Modal */}
      <AnimatePresence>
        {showHubPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-100 text-slate-800"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm text-slate-900 leading-tight">Switch Lucknow Hub</h3>
                    <p className="text-[10px] text-slate-500 font-semibold">Select demo supplier partner</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHubPicker(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 text-xs font-black flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {hubs.map((h) => {
                  const isCurrent = h.shopCode === storeCode || h.id === vendor?.id;
                  return (
                    <button
                      key={h.id}
                      onClick={async () => {
                        setShowHubPicker(false);
                        try {
                          await switchDemoShop(h.shopCode);
                          toast.success(`Switched to ${h.shopName}!`);
                        } catch {
                          toast.error("Failed to switch hub");
                        }
                      }}
                      className={`w-full text-left p-3 rounded-2xl border transition-all ${
                        isCurrent
                          ? "bg-emerald-50 border-emerald-500 shadow-sm ring-1 ring-emerald-500"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                          {h.shopCode}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] font-black text-emerald-600 uppercase flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Active Store
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-slate-900 text-sm mt-1">{h.shopName}</p>
                      <p className="text-[10px] text-slate-500 font-medium truncate">{h.hubZone}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-[9px] text-slate-400 font-semibold">
                        <span>{h.categories.slice(0, 2).join(" • ")}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
