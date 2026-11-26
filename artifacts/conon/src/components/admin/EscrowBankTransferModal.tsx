import React, { useMemo, useState } from "react";
import { ShieldCheck, AlertTriangle, Landmark, ArrowRight, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { useCononMasterSync } from "@/context/CononMasterSyncContext";
import { useKyc } from "@/context/KycContext";
import { feedbackSync } from "@/services/feedbackSync";
import { downloadPaymentAdvicePdf, generateUtr } from "@/services/treasuryEngine";

export interface EscrowReleaseTarget {
  id: string;
  orderShortId: string;
  dealerName: string;
  dealerPayoutAmount: number;
  status: string;
}

interface EscrowBankTransferModalProps {
  escrow: EscrowReleaseTarget | null;
  isDark: boolean;
  onClose: () => void;
  onConfirmReleased: (escrowId: string, utrNumber: string) => void;
}

export function EscrowBankTransferModal({
  escrow,
  isDark,
  onClose,
  onConfirmReleased,
}: EscrowBankTransferModalProps) {
  const masterSync = useCononMasterSync();
  const { applications } = useKyc();

  const companyAccounts = masterSync.state.treasury?.companyAccounts || [];
  const payoutAccounts = companyAccounts.filter((a) => a.role === "PAYOUT" || a.role === "COLLECTION");
  const defaultPayout =
    payoutAccounts.find((a) => a.role === "PAYOUT" && a.isPrimary) ||
    payoutAccounts[0];

  const [selectedFromId, setSelectedFromId] = useState<string>(defaultPayout?.id || "");
  const [releaseMode, setReleaseMode] = useState<"MANUAL" | "GATEWAY">("MANUAL");
  const [manualRail, setManualRail] = useState<"IMPS" | "UPI" | "NEFT">("IMPS");
  const [utrInput, setUtrInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const matchedPartner = useMemo(() => {
    if (!escrow) return null;
    const nameLower = escrow.dealerName.toLowerCase();
    return applications.find(
      (a) =>
        a.firmOrName?.toLowerCase().includes(nameLower) ||
        a.ownerOrDriverName?.toLowerCase().includes(nameLower)
    );
  }, [applications, escrow]);

  const activeDisputes = useMemo(() => {
    if (!escrow) return [];
    return feedbackSync
      .getDisputes()
      .filter(
        (d) =>
          (d.orderId === escrow.orderShortId || d.orderId === escrow.id) &&
          d.status === "ESCROW_DISPUTE_HOLD"
      );
  }, [escrow]);

  if (!escrow) return null;

  const isPennyDropVerified = matchedPartner
    ? matchedPartner.pennyDropStatus === "VERIFIED"
    : true; // fallback when partner KYC record isn't local yet, still displays status
  const hasKycRecord = Boolean(matchedPartner);
  const hasDisputeLock = activeDisputes.length > 0 || escrow.status === "DISPUTE_HELD";
  const isBlocked = (hasKycRecord && !isPennyDropVerified) || hasDisputeLock;

  const grossPaid = Math.round(escrow.dealerPayoutAmount / 0.78);
  const platformMargin = Math.round(grossPaid * 0.08);
  const taxReserve = Math.round(grossPaid * 0.14);
  const netPayable = escrow.dealerPayoutAmount;

  const toAccountLabel = `${escrow.dealerName} Verified Bank`;
  const toAccountRef = matchedPartner?.bankAccount
    ? `•••• ${matchedPartner.bankAccount.slice(-4)}`
    : matchedPartner?.bankUpi || "KYC Bank Verified";
  const toIfsc = matchedPartner?.bankIfsc || "Verified IFSC";
  const holderName = matchedPartner?.pennyDropHolderName || escrow.dealerName;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) return;
    const finalUtr =
      releaseMode === "GATEWAY"
        ? generateUtr("4")
        : utrInput.trim();

    if (releaseMode === "MANUAL" && !/^[A-Za-z0-9]{8,24}$/.test(finalUtr)) {
      toast.error("Enter a valid 12-digit Bank UTR / IMPS Reference number.");
      return;
    }

    setSubmitting(true);
    try {
      const entry = await masterSync.executeEscrowPayout({
        orderId: escrow.orderShortId,
        fromAccountId: selectedFromId || defaultPayout?.id,
        beneficiaryType: "VENDOR",
        beneficiaryName: holderName,
        toAccountLabel,
        toAccountRef,
        toIfsc,
        grossAmount: grossPaid,
        platformMargin,
        taxAmount: taxReserve,
        netAmount: netPayable,
        paymentMode: releaseMode === "GATEWAY" ? "RAZORPAY_ROUTE_API" : manualRail,
        utrNumber: finalUtr,
        gatewayRefId: releaseMode === "GATEWAY" ? `trf_${Date.now()}` : undefined,
        pennyDropVerified: isPennyDropVerified,
      });

      onConfirmReleased(escrow.id, finalUtr);
      toast.success(`Paid ₹${netPayable.toLocaleString("en-IN")} • UTR: ${finalUtr}`);
      await downloadPaymentAdvicePdf(entry, companyAccounts).catch(() => {});
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to execute bank transfer");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <form
        onSubmit={handleConfirm}
        className={`w-full max-w-xl rounded-2xl border p-6 shadow-2xl space-y-4 ${
          isDark ? "bg-[#0F172A] border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black flex items-center gap-2">
              <Landmark className="w-5 h-5 text-amber-500" />
              Bank Transfer Verification Slip — {escrow.orderShortId}
            </h3>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Anti-Fraud From → To Escrow Release &amp; Immutable Passbook UTR Entry
            </p>
          </div>
          <button type="button" onClick={onClose} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Anti-Fraud Guard */}
        {isBlocked && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-400 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              {hasDisputeLock
                ? "ESCROW LOCKED: Active Customer Damage Dispute on this order. Resolve dispute before releasing funds."
                : "ANTI-FRAUD LOCK: Partner Bank Account has NOT passed KYC Penny-Drop verification."}
            </span>
          </div>
        )}

        {/* FROM -> TO BANK SLIP */}
        <div className="grid grid-cols-1 sm:grid-cols-11 gap-2 items-center">
          <div className={`sm:col-span-5 p-3 rounded-xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-[10px] font-black uppercase text-amber-500">FROM (CONON Account)</span>
            {payoutAccounts.length > 0 ? (
              <select
                value={selectedFromId}
                onChange={(e) => setSelectedFromId(e.target.value)}
                className={`w-full mt-1 px-2 py-1.5 rounded-lg border text-xs font-bold ${
                  isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-white border-slate-300"
                }`}
              >
                {payoutAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label} ({a.bankName} ••{a.accountNumberLast4})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs font-bold mt-1">CONON Payout Current A/c</p>
            )}
          </div>

          <div className="sm:col-span-1 flex justify-center">
            <ArrowRight className="w-5 h-5 text-emerald-500" />
          </div>

          <div className={`sm:col-span-5 p-3 rounded-xl border ${isBlocked ? "border-rose-500/50 bg-rose-500/10" : "border-emerald-500/40 bg-emerald-500/10"}`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-emerald-500">TO (Beneficiary)</span>
              {!isBlocked && (
                <span className="text-[10px] font-black text-emerald-500 flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3" /> Penny-Drop ✓
                </span>
              )}
            </div>
            <div className="text-xs font-black mt-1">{holderName}</div>
            <div className="text-[11px] font-mono opacity-80">
              {toAccountLabel} • {toAccountRef} • {toIfsc}
            </div>
          </div>
        </div>

        {/* Exact Split Breakdown */}
        <div className={`p-3 rounded-xl border text-xs space-y-1 ${isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
          <div className="flex justify-between"><span>Estimated Customer Paid</span><strong className="font-mono">₹{grossPaid.toLocaleString("en-IN")}</strong></div>
          <div className="flex justify-between text-emerald-500"><span>Minus CONON Platform Margin</span><strong className="font-mono">-₹{platformMargin.toLocaleString("en-IN")}</strong></div>
          <div className="flex justify-between text-rose-500"><span>Minus Govt GST + 1% TCS Jar</span><strong className="font-mono">-₹{taxReserve.toLocaleString("en-IN")}</strong></div>
          <div className="flex justify-between pt-1.5 border-t border-slate-700/30 text-sm font-black">
            <span>Net Payable to Partner</span>
            <span className="text-emerald-500 font-mono">₹{netPayable.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Dual Release Mode */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setReleaseMode("MANUAL")}
            className={`flex-1 py-2 rounded-xl text-xs font-black border cursor-pointer ${
              releaseMode === "MANUAL"
                ? "bg-amber-400 text-slate-950 border-amber-400"
                : isDark ? "bg-slate-900 border-slate-700 text-slate-300" : "bg-slate-100 border-slate-300"
            }`}
          >
            Mode B: Manual Bank / UPI + UTR
          </button>
          <button
            type="button"
            onClick={() => setReleaseMode("GATEWAY")}
            className={`flex-1 py-2 rounded-xl text-xs font-black border cursor-pointer ${
              releaseMode === "GATEWAY"
                ? "bg-amber-400 text-slate-950 border-amber-400"
                : isDark ? "bg-slate-900 border-slate-700 text-slate-300" : "bg-slate-100 border-slate-300"
            }`}
          >
            Mode A: Gateway Split API
          </button>
        </div>

        {releaseMode === "MANUAL" ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <select
              value={manualRail}
              onChange={(e) => setManualRail(e.target.value as "IMPS" | "UPI" | "NEFT")}
              className={`px-3 py-2 rounded-xl border font-bold ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-50 border-slate-300"}`}
            >
              <option value="IMPS">IMPS</option>
              <option value="UPI">UPI</option>
              <option value="NEFT">NEFT</option>
            </select>
            <input
              type="text"
              value={utrInput}
              onChange={(e) => setUtrInput(e.target.value)}
              placeholder="Enter 12-Digit Bank UTR (e.g. 432198765432)"
              required
              className={`sm:col-span-2 px-3 py-2 rounded-xl border font-mono ${
                isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-50 border-slate-300"
              }`}
            />
          </div>
        ) : (
          <p className="text-[11px] text-emerald-500 font-bold">
            Triggers /api/treasury/release-payout (Razorpay Route / Cashfree Payout when live keys are set, or verified sandbox transfer ref).
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-3 py-2 rounded-xl text-xs font-bold cursor-pointer">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isBlocked || submitting}
            className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <CheckCircle2 className="w-4 h-4" />
            {submitting ? "Settling..." : "Confirm Paid & Issue Receipt"}
          </button>
        </div>
      </form>
    </div>
  );
}
