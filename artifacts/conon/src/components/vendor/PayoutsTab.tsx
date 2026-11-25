import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Receipt,
  Landmark,
  Download,
  Calendar,
  Building2,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { useVendorLanguage } from "@/context/VendorLanguageContext";
import { useVendor } from "@/context/VendorContext";
import { GREEN, GREEN_DARK, inr, inrShort } from "./theme";
import Confetti from "./Confetti";

type PassbookFilter = "all" | "earnings" | "settlements";

export function PayoutsTab() {
  const { t, lang, payoutMessage } = useVendorLanguage();
  const {
    vendor,
    balance,
    totalEarned,
    pendingPayouts,
    wallet,
    requestPayout,
  } = useVendor();

  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<PassbookFilter>("all");

  const bankName = vendor?.bankAccountMasked?.split("•")[0]?.trim() || "HDFC Bank";
  const bankMasked = vendor?.bankAccountMasked || "HDFC Bank ••••••4912";
  const upiId = vendor?.upiId || "katawalahardware@hdfcbank";

  const ledgerRows = useMemo(() => {
    const list = wallet?.ledger || [];
    return list.filter((r) => {
      if (filter === "earnings") return r.type === "EARNING";
      if (filter === "settlements") return r.type === "SETTLEMENT" || r.type === "WITHDRAWAL";
      return true;
    });
  }, [wallet?.ledger, filter]);

  const submitPayout = async () => {
    const parsed = parseInt(amount, 10);
    if (isNaN(parsed) || parsed <= 0) {
      toast.error(t("enterValidAmount"));
      return;
    }
    if (parsed > balance && balance > 0) {
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
        description: `${bankMasked} • ${t("pendingApproval")}`,
      });
    } catch {
      toast.error("Could not process payout request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadCsv = () => {
    const rows = wallet?.ledger || [];
    if (rows.length === 0) {
      toast.error("No transactions to export");
      return;
    }

    const headers = ["ID", "Date", "Description", "Type", "Amount", "Status", "UTR_Number", "Bank_Account"];
    const csvContent = [
      headers.join(","),
      ...rows.map((r) =>
        [
          r.id,
          `"${r.date}"`,
          `"${r.description.replace(/"/g, '""')}"`,
          r.type,
          r.amount,
          r.status,
          `"${r.utrNumber || "N/A"}"`,
          `"${r.bankAccount || bankMasked}"`,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Conon_Vendor_Statement_${vendor?.shopCode || "CN"}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Statement CSV downloaded successfully!");
  };

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      <Confetti show={showConfetti} onDone={() => setShowConfetti(false)} />

      {/* ── PAISA METER HERO CARD ── */}
      <div
        className="rounded-3xl p-5 text-white shadow-xl relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})` }}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/15 rounded-2xl backdrop-blur-sm">
              <Wallet className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-emerald-200">
                Paisa Meter (Available Balance)
              </p>
              <p className="text-xs font-bold text-white/90">
                {vendor?.shopName}
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-white/20 text-white text-[9px] font-black uppercase tracking-wider backdrop-blur-sm">
            T+1 Settlement
          </span>
        </div>

        <div className="my-3">
          <p className="text-3xl font-display font-black italic tracking-tight">
            {inr(balance)}
          </p>
          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-emerald-200 font-semibold">
            <Calendar className="w-3 h-3 text-emerald-300" />
            <span>Next Bank Credit: {wallet?.nextSettlementDate || "Tomorrow, 09:30 AM"}</span>
          </div>
        </div>

        {/* Masked Bank Account Tag */}
        <div className="bg-black/20 rounded-2xl p-2.5 flex items-center justify-between text-xs mb-3 border border-white/10">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-amber-300" />
            <span className="font-bold text-white/90 text-[11px]">{bankMasked}</span>
          </div>
          <span className="text-[9px] font-black text-emerald-300 uppercase">Primary Bank</span>
        </div>

        <button
          onClick={() => {
            setAmount(String(balance || 5000));
            setOpen(true);
          }}
          className="w-full py-3.5 bg-white text-emerald-900 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 hover:bg-emerald-50 transition active:scale-95"
        >
          <ArrowUpRight className="w-4 h-4 text-emerald-700" /> {t("requestPayout")}
        </button>
      </div>

      {/* ── 3 MINI KPI STATS ── */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm text-center">
          <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">Today's Earnings</p>
          <p className="text-base font-display font-black text-slate-900 mt-0.5">
            {inrShort(wallet?.todayEarnings || 4850)}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm text-center">
          <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">Pending Credit</p>
          <p className="text-base font-display font-black text-amber-600 mt-0.5">
            {inrShort(pendingPayouts)}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm text-center">
          <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">Total Settled (Mo)</p>
          <p className="text-base font-display font-black text-emerald-700 mt-0.5">
            {inrShort(wallet?.totalSettledMonth || totalEarned)}
          </p>
        </div>
      </div>

      {/* ── PASSBOOK STATEMENT TABLE ── */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-black text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-emerald-600" />
              Passbook & Bank UTRs
            </h3>
            <p className="text-[9px] text-slate-400 font-semibold">T+1 automated settlements record</p>
          </div>

          <button
            onClick={handleDownloadCsv}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-bold flex items-center gap-1 transition"
            title="Download CSV Statement"
          >
            <Download className="w-3 h-3" /> CSV
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {(
            [
              { id: "all", label: "All" },
              { id: "earnings", label: "Earnings" },
              { id: "settlements", label: "Settlements" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`flex-1 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition ${
                filter === t.id ? "bg-white text-emerald-900 shadow-sm" : "text-slate-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Passbook Rows */}
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {ledgerRows.map((row) => {
            const isSettlement = row.type === "SETTLEMENT" || row.type === "WITHDRAWAL";
            return (
              <div
                key={row.id}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 leading-tight truncate">
                    {row.description}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium mt-0.5">
                    <span>{row.date}</span>
                    <span>•</span>
                    <span className="text-[9px] font-bold text-slate-500">{row.id}</span>
                  </div>

                  {row.utrNumber && (
                    <span className="inline-block mt-1 px-1.5 py-0.2 bg-emerald-100/70 text-emerald-800 rounded font-mono text-[9px] font-bold">
                      {row.utrNumber}
                    </span>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <p
                    className={`text-xs font-display font-black ${
                      isSettlement ? "text-blue-700" : "text-emerald-700"
                    }`}
                  >
                    {isSettlement ? `-${inr(row.amount)}` : `+${inr(row.amount)}`}
                  </p>
                  <span
                    className={`inline-block px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase tracking-wider mt-0.5 ${
                      row.status === "SETTLED"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {row.status === "SETTLED" ? "Settled" : "Pending"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── WITHDRAWAL REQUEST MODAL ── */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-black text-sm text-slate-900 leading-tight">
                    Request Payout Settlement
                  </h3>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                    Direct NEFT/IMPS credit to registered account
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-black text-xs"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 ml-1">
                  Amount to Withdraw (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-base font-black text-slate-900 outline-none focus:ring-2 ring-emerald-500/20"
                />
              </div>

              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1">
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                  Target Destination Account
                </p>
                <p className="text-xs font-bold text-slate-800">{bankMasked}</p>
                <p className="text-[10px] text-slate-500 font-mono">UPI: {upiId}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-2xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={submitPayout}
                  disabled={submitting}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow transition disabled:opacity-50"
                >
                  {submitting ? "Processing..." : "Confirm & Withdraw"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
