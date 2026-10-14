import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, ArrowUpRight, Clock, CheckCircle2, X, Receipt, Landmark } from "lucide-react";
import { toast } from "sonner";
import { useVendorLanguage } from "@/context/VendorLanguageContext";
import { useVendor, type LedgerEntry } from "@/context/VendorContext";
import { apiErrorMessage } from "@/lib/api";
import { GREEN, GREEN_DARK, inr } from "./theme";
import Confetti from "./Confetti";

/* Vendor's linked settlement account, shown for confirmation before payout. */
const BANK_NAME = "HDFC Bank";
const BANK_ACCT = "•••• 4291";

function ledgerStatusStyle(status: LedgerEntry["status"]) {
  switch (status) {
    case "Pending Admin Approval": return { bg: "#fef9c3", color: "#a16207", icon: Clock };
    case "Approved":               return { bg: "#dcfce7", color: "#15803d", icon: CheckCircle2 };
  }
}

export function KhataTab() {
  const { t, payoutMessage } = useVendorLanguage();
  const { balance, ledger, totalEarned, pendingPayouts, requestPayout } = useVendor();

  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const statusLabel: Record<LedgerEntry["status"], string> = {
    "Pending Admin Approval": t("pendingApproval"),
    Approved: t("approved"),
  };

  const submitPayout = async () => {
    const parsed = parseInt(amount, 10);
    if (isNaN(parsed) || parsed <= 0) {
      toast.error(t("enterValidAmount"));
      return;
    }
    if (parsed > balance) {
      toast.error(t("amountExceeds"));
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      await requestPayout(parsed);
      setAmount("");
      setOpen(false);
      setShowConfetti(true);
      toast.success(payoutMessage(parsed), {
        description: `${BANK_NAME} · ${BANK_ACCT} · ${t("pendingApproval")}`,
      });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 pt-5">
      <Confetti show={showConfetti} onDone={() => setShowConfetti(false)} />
      {/* Balance card */}
      <div
        className="rounded-[28px] p-6 text-white shadow-lg mb-4"
        style={{ background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})` }}
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 bg-white/15 rounded-2xl">
            <Wallet className="w-4 h-4" />
          </div>
          <p className="text-[9px] font-black text-green-200 uppercase tracking-widest">{t("balanceDue")}</p>
        </div>
        <p className="text-4xl font-display font-black italic">{inr(balance)}</p>
        <button
          onClick={() => {
            setAmount(String(balance));
            setOpen(true);
          }}
          className="mt-5 w-full flex items-center justify-center gap-2 bg-white text-green-800 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest"
        >
          <ArrowUpRight className="w-4 h-4" /> {t("requestPayout")}
        </button>
      </div>

      {/* Mini stats */}
      <div className="flex gap-2 mb-6">
        <div className="flex-1 rounded-2xl bg-white border border-slate-100 shadow-sm p-3">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">{t("totalEarned")}</p>
          <p className="text-base font-display font-black italic text-slate-900 leading-none mt-1">{inr(totalEarned)}</p>
        </div>
        <div className="flex-1 rounded-2xl bg-white border border-slate-100 shadow-sm p-3">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">{t("pendingPayouts")}</p>
          <p className="text-base font-display font-black italic text-amber-600 leading-none mt-1">{inr(pendingPayouts)}</p>
        </div>
      </div>

      {/* Ledger */}
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-3 px-1">
        {t("payoutHistory")}
      </h3>
      <div className="space-y-2.5">
        {ledger.length === 0 && (
          <div className="rounded-[22px] border-2 border-dashed border-slate-100 py-8 text-center">
            <Receipt className="w-6 h-6 text-slate-200 mx-auto mb-2" />
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{t("noPayouts")}</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {ledger.map((entry) => {
            const st = ledgerStatusStyle(entry.status);
            return (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-[22px] p-3.5 border border-slate-100 shadow-sm flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: st.bg }}>
                  <st.icon className="w-5 h-5" style={{ color: st.color }} strokeWidth={2.4} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-800 text-sm leading-tight truncate">
                    {t("payout")} · {entry.id}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{entry.date}</p>
                  <span
                    className="inline-block mt-1 text-[8px] font-black uppercase px-2 py-0.5 rounded-full leading-tight"
                    style={{ background: st.bg, color: st.color }}
                  >
                    {statusLabel[entry.status]}
                  </span>
                </div>
                <p className="font-display font-black italic text-sm shrink-0" style={{ color: GREEN }}>
                  {inr(entry.amount)}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Payout drawer */}
      <AnimatePresence>
        {open && (
            <motion.div
              key="payout-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setOpen(false)}
            />
        )}
        {open && (
            <motion.div
              key="payout-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[48px] p-8 pb-12 z-50 shadow-2xl"
            >
              <div className="flex justify-between items-start gap-3 mb-6">
                <div className="min-w-0">
                  <h4 className="font-display font-black italic text-lg text-slate-900 uppercase leading-tight">
                    {t("withdrawFunds")}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight mt-1">
                    {t("balanceDue")}: {inr(balance)}
                  </p>
                </div>
                <button onClick={() => setOpen(false)} className="p-2 bg-slate-100 rounded-full shrink-0">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">{t("enterAmount")}</p>
              <div className="flex items-center gap-3 bg-slate-50 px-6 py-5 rounded-[28px] border border-slate-100 mb-4">
                <span className="text-2xl font-black text-slate-300">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitPayout()}
                  className="flex-1 bg-transparent text-4xl font-display font-black italic outline-none min-w-0"
                  style={{ color: GREEN }}
                  placeholder="0"
                  autoFocus
                />
              </div>

              {/* Module 3: confirm the linked settlement account before payout */}
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-[24px] px-4 py-3.5 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <Landmark className="w-5 h-5" style={{ color: GREEN }} strokeWidth={2.4} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[8px] font-black uppercase tracking-widest text-emerald-500 leading-none mb-1">
                    {t("linkedAccount")}
                  </p>
                  <p className="text-sm font-black text-slate-800 leading-tight truncate">
                    {BANK_NAME} · {BANK_ACCT}
                  </p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" strokeWidth={2.4} />
              </div>

              <button
                onClick={submitPayout}
                disabled={submitting}
                className="w-full py-5 rounded-[24px] font-black text-sm uppercase tracking-widest text-white shadow-2xl leading-tight flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: GREEN, boxShadow: "0 8px 24px rgba(21,128,61,0.35)" }}
              >
                <ArrowUpRight className="w-4 h-4" /> {t("confirmWithdraw")}
              </button>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
