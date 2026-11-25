import React from "react";
import { X, Home, Briefcase } from "lucide-react";
import type { UserAddress } from "./AddAddressModal";

interface DeliveringToSheetProps {
  isOpen: boolean;
  onClose: () => void;
  address: UserAddress;
  totalAmount: number;
  onPayOnDelivery: () => void;
  onPayOnline: () => void;
  isPlacingOrder?: boolean;
}

export function DeliveringToSheet({
  isOpen,
  onClose,
  address,
  totalAmount,
  onPayOnDelivery,
  onPayOnline,
  isPlacingOrder = false,
}: DeliveringToSheetProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl shadow-2xl p-5 space-y-6 animate-in slide-in-from-bottom duration-300">
        {/* Header (Screenshot 4: Delivering To [X]) */}
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

        {/* Selected Address Display Card (Screenshot 4) */}
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

        {/* Total Summary (Screenshot 4: Total: ₹708 / Select payment method and place order) */}
        <div className="text-center py-1">
          <p className="text-xl font-bold text-slate-900">
            Total: ₹{Math.round(totalAmount).toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Select payment method and place order
          </p>
        </div>

        {/* Two Payment Action Buttons (Screenshot 4) */}
        <div className="grid grid-cols-2 gap-3.5 pt-1">
          {/* Pay On Delivery */}
          <button
            onClick={onPayOnDelivery}
            disabled={isPlacingOrder}
            className="py-3.5 px-3 rounded-xl border-2 border-[#1e7e34] bg-white text-[#1e7e34] font-bold text-sm hover:bg-emerald-50 transition active:scale-[0.98] flex items-center justify-center text-center shadow-sm disabled:opacity-50"
          >
            Pay On Delivery
          </button>

          {/* Pay Online */}
          <button
            onClick={onPayOnline}
            disabled={isPlacingOrder}
            className="py-3.5 px-3 rounded-xl bg-[#1e7e34] hover:bg-[#166534] text-white font-bold text-sm transition active:scale-[0.98] flex items-center justify-center text-center shadow-md disabled:opacity-50"
          >
            Pay Online
          </button>
        </div>
      </div>
    </div>
  );
}
