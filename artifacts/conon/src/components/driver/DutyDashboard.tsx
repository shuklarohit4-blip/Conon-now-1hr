import { motion, AnimatePresence } from "framer-motion";
import { Power, Radar, Wallet, Route as RouteIcon } from "lucide-react";
import { useDriverLanguage } from "@/context/DriverLanguageContext";
import { useDriver } from "@/context/DriverContext";
import { GREEN, GREEN_DARK, RED, RED_DARK, inr } from "./theme";

/* Module 2 — the Duty dashboard.
   The hero is one enormous toggle covering the top of the screen: red while
   offline, green (with a radar pulse "Waiting for orders…") while online. Big
   enough to hit at arm's length in bright sunlight. */
export function DutyDashboard({ onToggle }: { onToggle: () => void }) {
  const { t } = useDriverLanguage();
  const { isOnline, walletEarnings, tripsToday } = useDriver();

  const color = isOnline ? GREEN : RED;
  const colorDark = isOnline ? GREEN_DARK : RED_DARK;

  return (
    <div className="px-4 pt-5 pb-2">
      {/* Massive glowing duty toggle */}
      <motion.button
        onClick={onToggle}
        whileTap={{ scale: 0.97 }}
        className="relative w-full rounded-[34px] overflow-hidden text-white flex flex-col items-center justify-center"
        style={{
          minHeight: 320,
          background: `linear-gradient(160deg, ${color}, ${colorDark})`,
          boxShadow: `0 24px 60px -12px ${color}99`,
        }}
        aria-pressed={isOnline}
      >
        {/* Radar rings while online */}
        <AnimatePresence>
          {isOnline && (
            <>
              {[0, 0.8, 1.6].map((delay) => (
                <motion.span
                  key={delay}
                  className="absolute rounded-full border-2 border-white/40"
                  style={{ width: 160, height: 160 }}
                  initial={{ scale: 0.5, opacity: 0.55 }}
                  animate={{ scale: 2.4, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2.4, repeat: Infinity, delay, ease: "easeOut" }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        <div className="relative z-10 flex flex-col items-center gap-4 px-6">
          <div className="w-24 h-24 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/25">
            {isOnline ? (
              <Radar className="w-12 h-12" strokeWidth={2.4} />
            ) : (
              <Power className="w-12 h-12" strokeWidth={2.6} />
            )}
          </div>
          <div className="text-center">
            <p className="text-[30px] font-black leading-tight tracking-tight">
              {isOnline ? t("goOffline").split(" (")[0] : t("goOnline").split(" (")[0]}
            </p>
            <p className="text-[14px] font-bold text-white/85 mt-1 leading-snug">
              {isOnline ? t("waitingForOrders") : t("tapToStart")}
            </p>
          </div>

          {isOnline && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
              </span>
              <span className="text-[12px] font-bold">{t("searchingNearby")}</span>
            </motion.div>
          )}
        </div>
      </motion.button>

      {/* Today snapshot */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="rounded-3xl bg-white border border-slate-100 p-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Wallet className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wide">{t("todaysEarnings")}</span>
          </div>
          <p className="text-[26px] font-black text-slate-900 mt-1 leading-none">{inr(walletEarnings)}</p>
        </div>
        <div className="rounded-3xl bg-white border border-slate-100 p-4">
          <div className="flex items-center gap-2 text-slate-400">
            <RouteIcon className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wide">{t("tripsToday")}</span>
          </div>
          <p className="text-[26px] font-black text-slate-900 mt-1 leading-none">{tripsToday}</p>
        </div>
      </div>
    </div>
  );
}
