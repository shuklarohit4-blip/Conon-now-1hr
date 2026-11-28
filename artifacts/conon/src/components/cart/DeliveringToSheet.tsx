import React from "react";
import { X, Home, Briefcase, Lock, ShieldCheck, Banknote, Zap } from "lucide-react";
import type { UserAddress } from "./AddAddressModal";
import type { PaymentPolicyEvaluation } from "@/utils/paymentPolicy";
import type { DispatchComplianceResult } from "@/utils/lucknowTrafficPolicy";
import { ServiceabilityLockBanner } from "@/components/ServiceabilityLockBanner";
import { LucknowFleetComplianceCard, type DispatchSlotChoice } from "@/components/LucknowFleetComplianceCard";

interface DeliveringToSheetProps {
  isOpen: boolean;
  onClose: () => void;
  address: UserAddress;
  totalAmount: number;
  policy: PaymentPolicyEvaluation;
  deliveryPincode: string;
  onChangePincode: (pin: string) => void;
  pinServiceable: boolean;
  trafficCompliance: DispatchComplianceResult;
  dispatchMode: DispatchSlotChoice;
  onSelectDispatchMode: (mode: DispatchSlotChoice) => void;
  onPayOnDelivery: () => void;
  onPayOnline: () => void;
  isPlacingOrder?: boolean;
}

export function DeliveringToSheet({
  isOpen,
  onClose,
  address,
  totalAmount,
  policy,
  deliveryPincode,
  onChangePincode,
  pinServiceable,
  trafficCompliance,
  dispatchMode,
  onSelectDispatchMode,
  onPayOnDelivery,
  onPayOnline,
  isPlacingOrder = false,
}: DeliveringToSheetProps) {
  if (!isOpen) return null;

  const formattedTotal = `₹${Math.round(totalAmount).toLocaleString("en-IN")}`;
  const noEntryBlocked = trafficCompliance.isNoEntryWindow && dispatchMode === "STANDARD";
  const checkoutLocked = isPlacingOrder || !pinServiceable || noEntryBlocked;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl shadow-2xl p-5 space-y-4 animate-in slide-in-from-bottom duration-300 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Delivering To</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-800 hover:bg-slate-100 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-slate-800" />
          </button>
        </div>

        {/* Selected Address Display Card */}
        <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
          <div className="w-11 h-11 rounded-xl bg-[#FEF7D6] flex items-center justify-center shrink-0">
            {address.tag === "Project" ? (
              <Briefcase className="w-5 h-5 text-slate-800" />
            ) : (
              <Home className="w-5 h-5 text-slate-800" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-900 truncate">
              {address.receiverName || "Home"}
            </h4>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {address.fullAddress}
            </p>
          </div>
        </div>

        {/* Hyperlocal Pin Code Serviceability Gate */}
        <ServiceabilityLockBanner
          pincode={deliveryPincode}
          onChangePincode={onChangePincode}
          label="Delivery Pin Code *"
        />

        {/* Lucknow No-Entry & Smart Fleet Matcher */}
        <LucknowFleetComplianceCard
          compliance={trafficCompliance}
          dispatchMode={dispatchMode}
          onSelectDispatchMode={onSelectDispatchMode}
        />

        {/* Total Summary */}
        <div className="text-center py-0.5">
          <p className="text-xl font-black text-slate-900">
            Total: {formattedTotal}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {!pinServiceable
              ? "Switch to an active launch pin code above to unlock checkout"
              : policy.allowPod
              ? "Select payment method and place order"
              : "100% Escrow Protected Prepaid Checkout"}
          </p>
        </div>

        {policy.allowPod ? (
          <div className="space-y-2.5">
            {/* Option 1: Pay Now — Instant Escrow (Recommended) */}
            <button
              type="button"
              onClick={onPayOnline}
              disabled={checkoutLocked}
              className="w-full p-3.5 rounded-2xl bg-[#1e7e34] hover:bg-[#166534] text-white text-left transition active:scale-[0.99] shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-200" />
                  <span>Pay {formattedTotal} Now — Instant Escrow</span>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/20 text-white flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Priority 60-Min
                </span>
              </div>
              <div className="text-[11px] text-emerald-100 mt-1 font-medium">
                UPI / CONON Living Vault / Netbanking & Cards
              </div>
            </button>

            {/* Option 2: Pay on Delivery */}
            <button
              type="button"
              onClick={onPayOnDelivery}
              disabled={checkoutLocked}
              className="w-full p-3.5 rounded-2xl border-2 border-[#1e7e34] bg-white text-[#1e7e34] text-left hover:bg-emerald-50 transition active:scale-[0.99] shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-sm">
                  <Banknote className="w-4 h-4" />
                  <span>Pay on Delivery (Cash or Site UPI)</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  &lt; ₹{policy.podMaxMaterialAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="text-[11px] text-slate-600 mt-1 font-medium">
                Available on material orders under ₹{policy.podMaxMaterialAmount.toLocaleString("en-IN")}
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Locked POD Trust Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-950">
              <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <div className="font-black text-amber-900">{policy.badgeText}</div>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-snug">
                  {policy.explanationEn}
                </p>
              </div>
            </div>

            {/* Locked POD Disabled Pill */}
            <div className="w-full p-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 text-xs font-bold flex items-center justify-between cursor-not-allowed select-none">
              <span className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                Pay on Delivery (Locked)
              </span>
              <span className="text-[10px] uppercase tracking-wide">Prepaid Only</span>
            </div>

            {/* Mandatory Prepaid Primary CTA */}
            <button
              type="button"
              onClick={onPayOnline}
              disabled={checkoutLocked}
              className="w-full py-3.5 px-4 rounded-xl bg-[#1e7e34] hover:bg-[#166534] text-white font-black text-sm transition active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
              <span>Pay {formattedTotal} & Confirm Order</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
