import { motion } from "framer-motion";
import { toast } from "sonner";
import { Wallet, Banknote, TrendingUp, Route as RouteIcon, Landmark, PackageCheck } from "lucide-react";
import { useDriverLanguage } from "@/context/DriverLanguageContext";
import { useDriver } from "@/context/DriverContext";
import { GREEN, GREEN_DARK, inr } from "./theme";

/* Module 4 — the "My Kamai" wallet tab.
   Today's total, trip count, recent trips, and a one-tap "Withdraw to Bank"
   that instantly zeroes the balance with a success toast (simulated payout). */
export function KamaiTab() {
  const { t } = useDriverLanguage();
  const { walletEarnings, tripsToday, completedTrips, withdraw } = useDriver();

  const handleWithdraw = () => {
    if (walletEarnings <= 0) return;
    const amount = withdraw();
    toast.success(`🏦 ${inr(amount)} ${t("withdrawnTo").split(" (")[0]} HDFC •••• 4291`, {
      duration: 5000,
    });
  };

  return (
    <div className="p-5 space-y-5">
      {/* Balance hero */}
      <div
        className="rounded-[32px] p-6 text-white"
        style={{ background: `linear-gradient(150deg, ${GREEN}, ${GREEN_DARK})`, boxShadow: `0 20px 44px -16px ${GREEN}` }}
      >
        <div className="flex items-center gap-2 text-white/85">
          <Wallet className="w-5 h-5" />
          <span className="text-[13px] font-bold uppercase tracking-widest">{t("availableBalance")}</span>
        </div>
        <p className="text-[52px] font-black leading-none mt-2">{inr(walletEarnings)}</p>

        <div className="flex items-center gap-2 mt-4 bg-white/15 rounded-2xl px-4 py-2.5 w-fit">
          <Landmark className="w-4 h-4" />
          <span className="text-[12px] font-bold">{t("linkedAccount").split(" (")[0]}: HDFC •••• 4291</span>
        </div>
      </div>

      {/* Withdraw */}
      <motion.button
        whileTap={walletEarnings > 0 ? { scale: 0.97 } : undefined}
        onClick={handleWithdraw}
        disabled={walletEarnings <= 0}
        className="w-full flex items-center justify-center gap-2.5 rounded-3xl py-5 text-[22px] font-black text-white disabled:opacity-40"
        style={{ background: GREEN, boxShadow: walletEarnings > 0 ? `0 14px 30px -10px ${GREEN}` : "none" }}
      >
        <Banknote className="w-6 h-6" strokeWidth={2.6} />
        {t("withdrawToBank")}
      </motion.button>

      {/* Mini stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-white border border-slate-100 p-4">
          <div className="flex items-center gap-2 text-slate-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wide">{t("todaysEarnings")}</span>
          </div>
          <p className="text-[24px] font-black text-slate-900 mt-1 leading-none">{inr(walletEarnings)}</p>
        </div>
        <div className="rounded-3xl bg-white border border-slate-100 p-4">
          <div className="flex items-center gap-2 text-slate-400">
            <RouteIcon className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wide">{t("tripsToday")}</span>
          </div>
          <p className="text-[24px] font-black text-slate-900 mt-1 leading-none">{tripsToday}</p>
        </div>
      </div>

      {/* Recent trips */}
      <div>
        <p className="text-[13px] font-black uppercase tracking-wider text-slate-400 mb-3">{t("recentTrips")}</p>
        {completedTrips.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 py-10 flex flex-col items-center gap-2 text-slate-300">
            <PackageCheck className="w-9 h-9" />
            <p className="text-[14px] font-bold text-slate-400 px-8 text-center">{t("noTripsYet")}</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {completedTrips.map((trip) => (
              <div
                key={trip.id}
                className="flex items-center gap-3 rounded-3xl bg-white border border-slate-100 p-4"
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "#dcfce7" }}
                >
                  <PackageCheck className="w-5 h-5" style={{ color: GREEN }} strokeWidth={2.4} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-black text-slate-900 leading-tight truncate">
                    {trip.qty} · {trip.material}
                  </p>
                  <p className="text-[12px] font-semibold text-slate-400 leading-tight truncate">{trip.dropArea}</p>
                </div>
                <span className="text-[17px] font-black shrink-0" style={{ color: GREEN }}>
                  +{inr(trip.earn)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
