import { motion } from "framer-motion";
import { CheckCircle2, Wallet, ArrowRight } from "lucide-react";
import Confetti from "@/components/vendor/Confetti";
import { useDriverLanguage } from "@/context/DriverLanguageContext";
import { GREEN, GREEN_DARK, inr } from "./theme";

/* Module 4 — instant payout celebration shown the moment a trip completes.
   Falling confetti + the amount added, then routes the driver onward. */
export function SuccessScreen({
  amount,
  onViewKamai,
  onBackToDuty,
}: {
  amount: number;
  onViewKamai: () => void;
  onBackToDuty: () => void;
}) {
  const { t } = useDriverLanguage();

  return (
    <motion.div
      className="absolute inset-0 z-[75] flex flex-col items-center justify-center px-8 text-center text-white"
      style={{ background: `linear-gradient(160deg, ${GREEN}, ${GREEN_DARK})` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Confetti show />

      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="w-28 h-28 rounded-full bg-white/15 flex items-center justify-center ring-4 ring-white/30 mb-6"
      >
        <CheckCircle2 className="w-16 h-16" strokeWidth={2.4} />
      </motion.div>

      <motion.h2
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-[30px] font-black leading-tight"
      >
        {t("tripSuccessful")}
      </motion.h2>

      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 240, damping: 16 }}
        className="mt-5 bg-white/15 rounded-[28px] px-8 py-5"
      >
        <div className="flex items-center gap-2 justify-center text-white/85">
          <Wallet className="w-5 h-5" />
          <span className="text-[13px] font-bold uppercase tracking-widest">{t("kamai").split(" (")[0]}</span>
        </div>
        <p className="text-[56px] font-black leading-none mt-1">+{inr(amount)}</p>
        <p className="text-[15px] font-bold text-white/85 mt-1">{t("addedToWallet")}</p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="w-full max-w-[340px] mt-10 space-y-3"
      >
        <button
          onClick={onViewKamai}
          className="w-full flex items-center justify-center gap-2 rounded-3xl bg-white py-5 text-[20px] font-black"
          style={{ color: GREEN_DARK }}
        >
          {t("viewKamai")} <ArrowRight className="w-5 h-5" strokeWidth={2.8} />
        </button>
        <button
          onClick={onBackToDuty}
          className="w-full rounded-3xl bg-white/15 py-4 text-[18px] font-black text-white"
        >
          {t("backToDuty")}
        </button>
      </motion.div>
    </motion.div>
  );
}
