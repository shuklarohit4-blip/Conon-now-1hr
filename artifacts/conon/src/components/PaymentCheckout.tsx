import React, { useState } from "react";
import { ShoppingBag, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

/* ─── Razorpay type declaration ──────────────────────────────────────────── */
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }) => void;
  modal?: { ondismiss?: () => void };
}
interface RazorpayInstance { open(): void; }

const DEFAULT_RAZORPAY_KEY = "rzp_test_U2WeWQ1QNhcFm3";

export const RAZORPAY_KEY_ID =
  (import.meta.env.VITE_RAZORPAY_KEY_ID as string) || DEFAULT_RAZORPAY_KEY;

/* ─── Script loader ──────────────────────────────────────────────────────── */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-sdk")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id  = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/* ─── Props ──────────────────────────────────────────────────────────────── */
export interface PaymentCheckoutProps {
  /** Amount in paise (₹1 = 100 paise). Defaults to ₹1 (100 paise) for testing. */
  amountPaise?: number;
  /** Prefill customer details when known. */
  prefill?: { name?: string; email?: string; contact?: string };
  /** Called after Razorpay reports a successful payment. */
  onSuccess?: (paymentId: string) => void;
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function PaymentCheckout({
  amountPaise = 100,
  prefill,
  onSuccess,
}: PaymentCheckoutProps) {
  const [loading, setLoading] = useState(false);

  async function handlePayment() {
    setLoading(true);

    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      toast.error("Failed to load Razorpay SDK. Please check your internet connection.");
      setLoading(false);
      return;
    }

    const options: RazorpayOptions = {
      key:         RAZORPAY_KEY_ID,
      amount:      amountPaise,               // amount in paise
      currency:    "INR",
      name:        "CONON-NOW Infrabuilt",
      description: "Construction Materials Order",
      prefill:     prefill ?? {},
      theme:       { color: "#1848a0" },
      handler: function (response) {
        toast.success(`Payment Successful! ID: ${response.razorpay_payment_id}`);
        onSuccess?.(response.razorpay_payment_id);
      },
      modal: {
        ondismiss: () => {
          setLoading(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
    setLoading(false);
  }

  const displayAmount = `₹${(amountPaise / 100).toLocaleString("en-IN")}`;

  return (
    <div className="w-full">
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-[15px] text-white shadow-lg active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        style={{ background: "linear-gradient(135deg, #1848a0 0%, #2563eb 100%)" }}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <ShoppingBag className="w-5 h-5" />
        )}
        {loading ? "Opening Payment…" : `Pay with Razorpay · ${displayAmount}`}
      </button>

      {/* Trust badge */}
      <div className="flex items-center justify-center gap-1.5 mt-2.5">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[11px] font-semibold text-slate-400">
          Secured by Razorpay · UPI, Cards, Net Banking
        </span>
      </div>
    </div>
  );
}
