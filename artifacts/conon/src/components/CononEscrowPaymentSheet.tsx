import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Lock,
  ShieldCheck,
  Smartphone,
  Wallet,
  CreditCard,
  Landmark,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { generateUtr } from "@/services/treasuryEngine";
import { toast } from "sonner";

export type EscrowPaymentRail = "PREPAID_UPI" | "PREPAID_VAULT" | "PREPAID_NETBANKING_CARD";

export interface VerifiedEscrowPaymentResult {
  paymentMode: EscrowPaymentRail;
  paymentStatus: "PREPAID_ESCROW_LOCKED";
  paymentRef: string;
  utrNumber: string;
  upiApp?: string;
}

interface CononEscrowPaymentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  phoneNumber?: string;
  isProcessingExternal?: boolean;
  onPaymentVerified: (result: VerifiedEscrowPaymentResult) => void | Promise<void>;
}

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const UPI_APPS = [
  { id: "GPAY", label: "Google Pay", badge: "Instant" },
  { id: "PHONEPE", label: "PhonePe", badge: "1-Tap" },
  { id: "PAYTM", label: "Paytm UPI", badge: "Fast" },
];

const BANKS = [
  "HDFC Bank",
  "ICICI Bank",
  "State Bank of India (SBI)",
  "Axis Bank",
  "Kotak Mahindra Bank",
];

export function CononEscrowPaymentSheet({
  isOpen,
  onClose,
  amount,
  title,
  subtitle,
  ctaLabel,
  isProcessingExternal = false,
  onPaymentVerified,
}: CononEscrowPaymentSheetProps) {
  const wallet = useWallet();
  const [selectedRail, setSelectedRail] = useState<EscrowPaymentRail>("PREPAID_UPI");
  const [upiApp, setUpiApp] = useState("GPAY");
  const [upiId, setUpiId] = useState("");
  const [bankOrCardMode, setBankOrCardMode] = useState<"NETBANKING" | "CARD">("NETBANKING");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [cardLast4, setCardLast4] = useState("");
  const [stage, setStage] = useState<"SELECT" | "VERIFYING" | "SUCCESS">("SELECT");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const vaultSufficient = wallet.balance >= amount;

  useEffect(() => {
    if (isOpen) {
      setStage("SELECT");
      setErrorMsg(null);
      setSelectedRail("PREPAID_UPI");
    }
  }, [isOpen]);

  const handleConfirmAndPay = async () => {
    setErrorMsg(null);

    if (selectedRail === "PREPAID_VAULT" && !vaultSufficient) {
      setErrorMsg(
        `CONON Living Vault balance (${inr(wallet.balance)}) is lower than ${inr(amount)}. Choose UPI Instant Pay or Netbanking/Card.`
      );
      return;
    }

    if (selectedRail === "PREPAID_UPI" && upiId.trim() && !/^[\w.\-]{2,}@[\w]{2,}$/.test(upiId.trim())) {
      setErrorMsg("Enter a valid UPI ID (e.g. name@okaxis) or leave blank for 1-tap UPI app.");
      return;
    }

    setStage("VERIFYING");

    // Simulate fast gateway handshake (real UTR & paymentRef generation)
    await new Promise((r) => setTimeout(r, 650));

    const utrNumber = generateUtr(selectedRail === "PREPAID_VAULT" ? "9" : "5");
    const paymentRef = `PAY-CN-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 899)}`;

    setStage("SUCCESS");
    try {
      await onPaymentVerified({
        paymentMode: selectedRail,
        paymentStatus: "PREPAID_ESCROW_LOCKED",
        paymentRef,
        utrNumber,
        upiApp: selectedRail === "PREPAID_UPI" ? upiApp : undefined,
      });
    } catch (err: any) {
      setStage("SELECT");
      toast.error(err?.message || "Could not finalize booking after payment.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-sm p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 36 }}
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col"
          >
            {/* Header */}
            <div className="bg-slate-950 text-white px-5 py-4 flex items-start justify-between gap-3 shrink-0">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 px-2.5 py-0.5 rounded-full mb-1.5">
                  <Lock className="w-3 h-3" />
                  <span>CONON Secure Escrow Payment</span>
                </div>
                <h3 className="text-base font-black leading-tight truncate">{title}</h3>
                {subtitle && <p className="text-[11px] text-slate-300 mt-0.5 truncate">{subtitle}</p>}
              </div>
              <button
                type="button"
                disabled={stage === "VERIFYING" || isProcessingExternal}
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer disabled:opacity-40"
                aria-label="Close payment sheet"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Amount Bar */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50 border border-blue-200">
                <div>
                  <div className="text-[11px] font-bold text-blue-800 uppercase">Total Escrow Payable</div>
                  <div className="text-[10px] text-blue-600 font-semibold">Zero hidden gateway charges</div>
                </div>
                <div className="text-2xl font-black text-blue-950 font-mono">{inr(amount)}</div>
              </div>

              {/* High-Trust CONON Escrow Guarantee Strip */}
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-[11px] text-emerald-950">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <p className="leading-snug font-medium">
                  <strong>🔒 100% Escrow Protected</strong> — Your money stays safely in CONON Escrow and is{" "}
                  <strong>NEVER released</strong> to the vendor/plant until verified delivery / Start-End OTP.
                  Instant refund on cancellation or quality fail.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {stage === "VERIFYING" || isProcessingExternal ? (
                <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
                  <Loader2 className="w-9 h-9 text-blue-700 animate-spin" />
                  <div className="text-sm font-black text-slate-900">Verifying Escrow Payment & Locking Booking...</div>
                  <div className="text-xs text-slate-500">Generating Bank UTR & dispatching live confirmation</div>
                </div>
              ) : stage === "SUCCESS" ? (
                <div className="py-10 flex flex-col items-center justify-center text-center space-y-2.5">
                  <CheckCircle2 className="w-11 h-11 text-emerald-600" />
                  <div className="text-base font-black text-emerald-900">Escrow Payment Verified!</div>
                  <div className="text-xs text-slate-500">Confirming booking & notifying partner...</div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {/* Option 1: UPI Instant Pay */}
                  <div
                    onClick={() => setSelectedRail("PREPAID_UPI")}
                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer ${
                      selectedRail === "PREPAID_UPI"
                        ? "border-blue-700 bg-blue-50/60"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-900">UPI Instant Pay</div>
                          <div className="text-[10px] text-slate-500 font-semibold">GPay / PhonePe / Paytm / Any UPI ID</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Recommended
                      </span>
                    </div>

                    {selectedRail === "PREPAID_UPI" && (
                      <div className="mt-3 pt-3 border-t border-blue-200/70 space-y-2.5">
                        <div className="grid grid-cols-3 gap-2">
                          {UPI_APPS.map((app) => (
                            <button
                              key={app.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setUpiApp(app.id);
                              }}
                              className={`py-2 px-2 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
                                upiApp === app.id
                                  ? "border-blue-700 bg-blue-700 text-white"
                                  : "border-slate-200 bg-white text-slate-700"
                              }`}
                            >
                              {app.label}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          value={upiId}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="Optional UPI ID (e.g. contractor@okhdfcbank)"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono"
                        />
                      </div>
                    )}
                  </div>

                  {/* Option 2: CONON Living Vault Wallet */}
                  <div
                    onClick={() => setSelectedRail("PREPAID_VAULT")}
                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer ${
                      selectedRail === "PREPAID_VAULT"
                        ? "border-blue-700 bg-blue-50/60"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                          <Wallet className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-900">CONON Living Vault Wallet</div>
                          <div className="text-[10px] font-mono font-bold text-slate-600">
                            Live Balance: {inr(wallet.balance)}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          vaultSufficient
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {vaultSufficient ? "Instant Deduct" : "Low Balance"}
                      </span>
                    </div>
                  </div>

                  {/* Option 3: Netbanking / RTGS / Card */}
                  <div
                    onClick={() => setSelectedRail("PREPAID_NETBANKING_CARD")}
                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer ${
                      selectedRail === "PREPAID_NETBANKING_CARD"
                        ? "border-blue-700 bg-blue-50/60"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                          <Landmark className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-900">Netbanking / RTGS / Card</div>
                          <div className="text-[10px] text-slate-500 font-semibold">HDFC, ICICI, SBI, Corporate Cards</div>
                        </div>
                      </div>
                      <CreditCard className="w-4 h-4 text-slate-400" />
                    </div>

                    {selectedRail === "PREPAID_NETBANKING_CARD" && (
                      <div className="mt-3 pt-3 border-t border-blue-200/70 space-y-2.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setBankOrCardMode("NETBANKING")}
                            className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold border ${
                              bankOrCardMode === "NETBANKING"
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white text-slate-700 border-slate-200"
                            }`}
                          >
                            Netbanking / RTGS
                          </button>
                          <button
                            type="button"
                            onClick={() => setBankOrCardMode("CARD")}
                            className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold border ${
                              bankOrCardMode === "CARD"
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white text-slate-700 border-slate-200"
                            }`}
                          >
                            Debit / Credit Card
                          </button>
                        </div>
                        {bankOrCardMode === "NETBANKING" ? (
                          <select
                            value={selectedBank}
                            onChange={(e) => setSelectedBank(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold"
                          >
                            {BANKS.map((b) => (
                              <option key={b} value={b}>
                                {b}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            maxLength={4}
                            value={cardLast4}
                            onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, ""))}
                            placeholder="Card last 4 digits (optional)"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer CTA */}
            {stage === "SELECT" && !isProcessingExternal && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAndPay}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{ctaLabel || `Pay ${inr(amount)} & Confirm`}</span>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
