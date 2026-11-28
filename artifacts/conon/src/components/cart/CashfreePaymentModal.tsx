import React, { useState } from "react";
import {
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  CreditCard,
  QrCode,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

interface CashfreePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  phoneNumber?: string;
  onPaymentSuccess: (method: string, txId: string) => void;
  isProcessing?: boolean;
}

export function CashfreePaymentModal({
  isOpen,
  onClose,
  totalAmount,
  phoneNumber = "9696727279",
  onPaymentSuccess,
  isProcessing = false,
}: CashfreePaymentModalProps) {
  const [showAmountBreakdown, setShowAmountBreakdown] = useState(false);
  const [appliedOffer, setAppliedOffer] = useState<string | null>(null);

  if (!isOpen) return null;

  const discount = appliedOffer ? 100 : 0;
  const finalPayable = Math.max(1, totalAmount - discount);

  const handlePay = (methodName: string) => {
    toast.loading(`Connecting to ${methodName}...`, { id: "cf-pay" });
    setTimeout(() => {
      const mockTxId = `CF_${Date.now().toString().slice(-8)}`;
      toast.success(`Payment verified via ${methodName}! TxID: ${mockTxId}`, {
        id: "cf-pay",
      });
      onPaymentSuccess(methodName, mockTxId);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full h-full sm:h-auto sm:max-w-md bg-white sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[100vh] sm:max-h-[92vh]">
        {/* Top Banner (Screenshot 6: ⭐ Serving customers since 4 months with Cashfree) */}
        <div className="bg-[#D9A300] text-slate-900 px-4 py-2 text-center text-xs font-semibold tracking-tight flex items-center justify-center gap-1.5 shrink-0">
          <span>⭐</span>
          <span>Serving customers since 4 months with Cashfree</span>
        </div>

        {/* Yellow Header Container (Screenshot 6: #FFC800 / #FDB813) */}
        <div className="bg-[#FFC800] p-4 pt-3 pb-6 flex flex-col items-center relative shrink-0">
          {/* Top Bar inside Yellow Container */}
          <div className="w-full flex items-center justify-between mb-2">
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-900 hover:bg-black/10 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-slate-900" />
            </button>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-800">
              <span>Secured by</span>
              <span className="font-extrabold text-[#059669] flex items-center gap-0.5">
                <span className="text-sm">🍃</span> Cashfree
              </span>
            </div>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-[#FFE500] border border-[#E5B800] shadow-sm flex items-center justify-center text-blue-800 font-black text-[10px] tracking-tight mb-2">
            CONON
          </div>

          <h3 className="text-base font-bold text-slate-900">CONON-NOW</h3>

          {/* Amount Dropdown Button (Screenshot 6: ₹509 ˅) */}
          <button
            onClick={() => setShowAmountBreakdown(!showAmountBreakdown)}
            className="mt-2 px-6 py-2 rounded-xl bg-black/10 hover:bg-black/15 text-slate-900 font-bold text-base flex items-center gap-1.5 transition"
          >
            <span>₹{Math.round(finalPayable).toLocaleString("en-IN")}</span>
            {showAmountBreakdown ? (
              <ChevronUp className="w-4 h-4 text-slate-700" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Collapsible Order Breakdown */}
          {showAmountBreakdown && (
            <div className="w-full mt-3 p-3 bg-white/90 backdrop-blur-sm rounded-xl border border-black/10 text-xs space-y-1.5 text-left animate-in fade-in">
              <div className="flex justify-between text-slate-700">
                <span>Subtotal + Delivery</span>
                <span>₹{Math.round(totalAmount).toLocaleString("en-IN")}</span>
              </div>
              {appliedOffer && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Paytm Cashback Discount</span>
                  <span>-₹100</span>
                </div>
              )}
              <div className="border-t border-slate-300 pt-1.5 flex justify-between font-bold text-slate-900">
                <span>Total Payable</span>
                <span>₹{Math.round(finalPayable).toLocaleString("en-IN")}</span>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Payment Options Body (Screenshot 6) */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 bg-white">
          {/* Subheader: Payment Options for +91 9696727279 [Edit] */}
          <div className="flex items-center justify-between text-xs text-slate-600 border-b border-slate-100 pb-3">
            <span>Payment Options for +91 {phoneNumber}</span>
            <button
              onClick={() => toast.info("To edit, please update details on address step")}
              className="text-[#D9A300] font-bold hover:underline"
            >
              Edit
            </button>
          </div>

          {/* Card: Offers and Coupons (Screenshot 6) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Offers and Coupons</span>
              <span className="text-xs font-medium text-slate-500 flex items-center gap-0.5 cursor-pointer hover:text-slate-700">
                10 Offers Available <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </span>
            </div>

            {/* Paytm Offer Sub-Card (Screenshot 6) */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                {/* Paytm Logo */}
                <div className="w-7 h-7 rounded-md bg-[#002e6e] text-white flex items-center justify-center font-black text-[9px] tracking-tighter shrink-0">
                  <span className="text-[#00b9f5]">p</span>ytm
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">PAYTM</p>
                  <p className="text-[11px] text-slate-500">Save ₹100 as cashback</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (appliedOffer) {
                    setAppliedOffer(null);
                    toast.info("Coupon removed");
                  } else {
                    setAppliedOffer("PAYTM100");
                    toast.success("Paytm ₹100 offer applied!");
                  }
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition border ${
                  appliedOffer
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                    : "border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                {appliedOffer ? "APPLIED" : "APPLY"}
              </button>
            </div>
          </div>

          {/* Section: Pay Via UPI (Screenshot 6) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Pay Via UPI</span>
              <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium cursor-pointer">
                {/* UPI brand micro icons */}
                <span className="w-4 h-4 rounded bg-orange-500 text-white flex items-center justify-center text-[7px] font-bold">
                  B
                </span>
                <span className="w-4 h-4 rounded bg-[#002e6e] text-white flex items-center justify-center text-[7px] font-bold">
                  P
                </span>
                <span className="w-4 h-4 rounded bg-purple-700 text-white flex items-center justify-center text-[7px] font-bold">
                  Pe
                </span>
                <span className="text-[11px] font-semibold text-amber-600 flex items-center">
                  &amp; more <ChevronRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </div>

            {/* 5 UPI App Cards Grid (Screenshot 6) */}
            <div className="grid grid-cols-5 gap-2">
              {/* Any UPI */}
              <button
                onClick={() => handlePay("Any UPI")}
                disabled={isProcessing}
                className="flex flex-col items-center justify-center p-2 rounded-2xl border border-slate-200/80 hover:bg-slate-50 transition active:scale-95 text-center group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm mb-1.5">
                  {/* UPI Orange/Green Triangle Icon */}
                  <div className="w-6 h-6 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-6 h-6">
                      <polygon points="12,2 22,22 12,17" fill="#f97316" />
                      <polygon points="12,2 2,22 12,17" fill="#15803d" />
                    </svg>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-slate-700 leading-tight">
                  Any UPI
                </span>
              </button>

              {/* Paytm */}
              <button
                onClick={() => handlePay("Paytm")}
                disabled={isProcessing}
                className="flex flex-col items-center justify-center p-2 rounded-2xl border border-slate-200/80 hover:bg-slate-50 transition active:scale-95 text-center group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#002e6e] text-white flex items-center justify-center shadow-sm mb-1.5 font-black text-xs">
                  <span className="text-[#00b9f5]">p</span>tm
                </div>
                <span className="text-[10px] font-medium text-slate-700 leading-tight">
                  Paytm
                </span>
              </button>

              {/* Google Pay */}
              <button
                onClick={() => handlePay("Google Pay")}
                disabled={isProcessing}
                className="flex flex-col items-center justify-center p-2 rounded-2xl border border-slate-200/80 hover:bg-slate-50 transition active:scale-95 text-center group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm mb-1.5">
                  <svg viewBox="0 0 24 24" className="w-7 h-7">
                    <path d="M10.2 6.5C8.5 7.4 7.2 9 6.8 11L5 10C5.7 7.5 7.4 5.4 9.8 4.3L10.2 6.5Z" fill="#EA4335" />
                    <path d="M17.5 10C18.3 12.5 17.6 15.2 15.8 17.1L14.2 15.5C15.4 14.1 15.9 12.1 15.3 10.3L17.5 10Z" fill="#34A853" />
                    <path d="M15.8 6.9C17.2 8.4 17.8 10.4 17.5 12.4L15.3 12C15.5 10.5 15 9.1 13.9 8L15.8 6.9Z" fill="#4285F4" />
                    <path d="M6.8 13C7.2 15 8.5 16.6 10.2 17.5L9.8 19.7C7.4 18.6 5.7 16.5 5 14L6.8 13Z" fill="#FBBC05" />
                  </svg>
                </div>
                <span className="text-[10px] font-medium text-slate-700 leading-tight">
                  Google Pay
                </span>
              </button>

              {/* PhonePe */}
              <button
                onClick={() => handlePay("PhonePe")}
                disabled={isProcessing}
                className="flex flex-col items-center justify-center p-2 rounded-2xl border border-slate-200/80 hover:bg-slate-50 transition active:scale-95 text-center group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#5f259f] text-white flex items-center justify-center shadow-sm mb-1.5 font-bold text-lg select-none">
                  पे
                </div>
                <span className="text-[10px] font-medium text-slate-700 leading-tight">
                  PhonePe
                </span>
              </button>

              {/* Navi */}
              <button
                onClick={() => handlePay("Navi")}
                disabled={isProcessing}
                className="flex flex-col items-center justify-center p-2 rounded-2xl border border-slate-200/80 hover:bg-slate-50 transition active:scale-95 text-center group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#024e38] text-white flex items-center justify-center shadow-sm mb-1.5">
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                    <path d="M6 18 V6 L18 18 V6" stroke="#22c55e" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-[10px] font-medium text-slate-700 leading-tight">
                  Navi
                </span>
              </button>
            </div>
          </div>

          {/* Section: Other Payment Options (Screenshot 6) */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-slate-800 block mb-2">
              Other Payment Options
            </span>

            {/* Pay by UPI ID / QR */}
            <button
              onClick={() => handlePay("UPI ID / QR")}
              disabled={isProcessing}
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between hover:bg-slate-50 transition active:scale-[0.99] text-left shadow-sm"
            >
              <div className="flex items-center gap-3">
                <QrCode className="w-5 h-5 text-[#D9A300]" />
                <span className="text-xs font-bold text-slate-800">Pay by UPI ID / QR</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Card (Visa, Mastercard, RuPay, Amex) */}
            <button
              onClick={() => handlePay("Card")}
              disabled={isProcessing}
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between hover:bg-slate-50 transition active:scale-[0.99] text-left shadow-sm"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-[#D9A300]" />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">Card</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-black text-blue-700 border px-1 rounded">
                      VISA
                    </span>
                    <span className="text-[9px] font-black text-orange-600 border px-1 rounded">
                      MC
                    </span>
                    <span className="text-[9px] font-black text-green-700 border px-1 rounded">
                      RuPay
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Wallets */}
            <button
              onClick={() => handlePay("Wallets")}
              disabled={isProcessing}
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between hover:bg-slate-50 transition active:scale-[0.99] text-left shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-[#D9A300]" />
                <span className="text-xs font-bold text-slate-800">Wallets</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
