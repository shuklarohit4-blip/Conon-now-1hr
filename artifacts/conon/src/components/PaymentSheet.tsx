import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ShieldCheck, Lock, CheckCircle2,
  XCircle, CreditCard, Landmark, Wallet, Smartphone, Check, Copy,
  Clock, Truck, Zap, BadgeCheck, RotateCcw, Wallet2, Banknote,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  usePlaceOrder, getGetCartQueryKey, getGetOrdersQueryKey,
} from "@workspace/api-client-react";
import {
  processPayment, validateUpiId, validateCardNumber, validateExpiry,
  validateCVV, formatCardNumber, formatExpiry, detectCardBrand,
  tokenAdvance, haptic,
  UPI_APPS, BANKS, type PaymentMethod, type PaymentPlan,
} from "../lib/payment";
import { Confetti } from "./Confetti";

const BRAND = "#1b4366";
const GREEN = "#2a7a3b";
const AMBER = "#f59e0b";

/* Mock contractor credit ledger (a real app would fetch this per account). */
const KHATA_LIMIT = 500000;
const KHATA_USED  = 124500;

type Stage = "select" | "processing" | "success" | "failure";

interface PlacedOrder {
  id: string;
  total: number;
  etaMinutes: number;
  address: string;
  plan: PaymentPlan;
  paidNow: number;
  balanceDue: number;
}

interface PaymentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  categoryFilter?: string;
  deliveryAddress: string;
  phoneNumber: string;
  /** Called once an order is successfully placed (e.g. to close the checkout) */
  onOrderPlaced?: () => void;
}

export function PaymentSheet({
  isOpen, onClose, amount, categoryFilter, deliveryAddress, phoneNumber, onOrderPlaced,
}: PaymentSheetProps) {
  const [, setLocation] = useLocation();
  const qc = useQueryClient();

  const [stage, setStage]     = useState<Stage>("select");
  const [plan, setPlan]       = useState<PaymentPlan>("full");
  const [method, setMethod]   = useState<PaymentMethod>("upi");
  const [order, setOrder]     = useState<PlacedOrder | null>(null);
  const [failMsg, setFailMsg] = useState("");
  const [chargedOk, setChargedOk] = useState(false);
  const [copied, setCopied]   = useState(false);

  /* ── UPI ── */
  const [upiId, setUpiId] = useState("");

  /* ── Card ── */
  const [cardNo, setCardNo]     = useState("");
  const [cardExp, setCardExp]   = useState("");
  const [cardCvv, setCardCvv]   = useState("");
  const [cardName, setCardName] = useState("");

  /* ── Net banking ── */
  const [bankCode, setBankCode] = useState("");

  /* ── field-level touched/error state ── */
  const [touched, setTouched] = useState(false);

  const brand = detectCardBrand(cardNo);

  const placeOrder = usePlaceOrder();

  const khataAvailable = KHATA_LIMIT - KHATA_USED;

  /* amount that must actually be paid right now, per plan */
  const payableNow = useMemo(() => {
    if (plan === "token") return tokenAdvance(amount);
    if (plan === "khata") return 0;
    return amount;
  }, [plan, amount]);
  const balanceDue = plan === "token" ? amount - payableNow : 0;

  /* reset on open — also clears any sensitive card/UPI details */
  useEffect(() => {
    if (isOpen) {
      setStage("select"); setPlan("full"); setMethod("upi"); setOrder(null);
      setFailMsg(""); setChargedOk(false); setTouched(false); setCopied(false);
      setUpiId(""); setCardNo(""); setCardExp(""); setCardCvv("");
      setCardName(""); setBankCode("");
    }
  }, [isOpen]);

  /* COD is only valid for the full-amount plan; the token advance & khata
     plans need an online/credit method, so snap back to UPI if needed. */
  useEffect(() => {
    if (plan === "token" && method === "cod") setMethod("upi");
  }, [plan, method]);

  /* ── validation per plan/method ── */
  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (plan === "khata") {
      if (amount > khataAvailable) e.khata = "This order exceeds your available credit limit.";
      return e;
    }
    if (method === "upi") {
      if (!upiId.trim()) e.upi = "Enter your UPI ID";
      else if (!validateUpiId(upiId)) e.upi = "Enter a valid UPI ID (e.g. name@bank)";
    }
    if (method === "card") {
      if (!validateCardNumber(cardNo)) e.cardNo = "Enter a valid card number";
      if (!validateExpiry(cardExp))    e.cardExp = "Invalid / expired date";
      if (!validateCVV(cardCvv, brand)) e.cardCvv = brand === "amex" ? "4-digit CVV" : "3-digit CVV";
      if (!cardName.trim())            e.cardName = "Name on card required";
    }
    if (method === "netbanking" && !bankCode) e.bank = "Select your bank";
    return e;
  }, [plan, method, upiId, cardNo, cardExp, cardCvv, cardName, bankCode, brand, amount, khataAvailable]);

  const isValid = Object.keys(errors).length === 0;
  const noValidationNeeded = plan === "full" && method === "cod";

  /* ── pay handler ── */
  const handlePay = async () => {
    // Idempotency guard: only fire from the select stage.
    if (stage !== "select") return;

    haptic([18, 40, 22]); // tactile confirmation on tap

    setTouched(true);
    if (!noValidationNeeded && !isValid) return;

    setStage("processing");
    setFailMsg("");

    // Which gateway method actually runs the charge for this plan.
    const chargeMethod: PaymentMethod = plan === "khata" ? "khata" : method;

    // Tracks whether a real charge has been attempted, so we can show an
    // accurate message if order placement fails afterwards.
    let charged = false;

    try {
      const pay = await processPayment({
        method: chargeMethod,
        amount: payableNow,
        upi:  chargeMethod === "upi" ? { upiId } : undefined,
        card: chargeMethod === "card" ? { number: cardNo, expiry: cardExp, cvv: cardCvv, name: cardName } : undefined,
        bank: chargeMethod === "netbanking" ? { bankCode } : undefined,
      });

      if (!pay.success) {
        haptic([60, 30, 60]);
        setFailMsg(pay.error ?? "Payment could not be completed.");
        setStage("failure");
        return;
      }
      charged = chargeMethod !== "cod" && chargeMethod !== "khata";

      // Payment ok → place the order on the server
      const placed = await placeOrder.mutateAsync({
        data: { categoryFilter, deliveryAddress, phoneNumber },
      });

      qc.invalidateQueries({ queryKey: getGetCartQueryKey() });
      qc.invalidateQueries({ queryKey: getGetOrdersQueryKey() });

      // The grand total the buyer actually saw & paid (item + logistics +
      // labour + GST) is the source of truth. The order API only echoes the
      // bare item total, so we keep the UI amount to avoid showing/tracking a
      // figure that differs from what was charged.
      const orderTotal = amount;
      const paidNow = plan === "khata" ? 0 : payableNow;

      haptic([14, 30, 14, 30, 50]);
      setOrder({
        id: placed.id,
        total: orderTotal,
        etaMinutes: placed.deliveryCountdownMinutes ?? 60,
        address: placed.deliveryAddress ?? deliveryAddress,
        plan,
        paidNow,
        balanceDue: plan === "token" ? orderTotal - paidNow : 0,
      });
      setStage("success");
    } catch {
      haptic([60, 30, 60]);
      setChargedOk(charged);
      setFailMsg(
        charged
          ? "Your payment went through but we couldn't confirm your order. Our team has been notified — please contact support before retrying to avoid being charged twice."
          : "Something went wrong and your order could not be placed. You have not been charged."
      );
      setStage("failure");
    }
  };

  const copyId = () => {
    if (!order) return;
    navigator.clipboard?.writeText(order.id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  };

  const goTrack = () => {
    onOrderPlaced?.();
    onClose();
    setLocation("/live-track");
  };

  /* pay-button label per plan */
  const payLabel = useMemo(() => {
    if (plan === "khata") return `Place Order on Khata · ₹${amount.toLocaleString("en-IN")}`;
    if (plan === "token") return `Pay ₹${payableNow.toLocaleString("en-IN")} Advance`;
    if (method === "cod") return "Place Order (Pay on Delivery)";
    return `Pay ₹${payableNow.toLocaleString("en-IN")}`;
  }, [plan, method, amount, payableNow]);

  const canDismiss = stage === "select" || stage === "failure";

  /* method tabs available for full/token plans */
  const methods: { id: PaymentMethod; label: string; sub: string; icon: React.ReactNode }[] = [
    { id: "upi",        label: "UPI",                 sub: "Google Pay, PhonePe, Paytm & more", icon: <Smartphone className="w-5 h-5" /> },
    { id: "card",       label: "Credit / Debit Card", sub: "Visa, Mastercard, RuPay, Amex",     icon: <CreditCard className="w-5 h-5" /> },
    { id: "netbanking", label: "Net Banking",         sub: "All major Indian banks",            icon: <Landmark className="w-5 h-5" /> },
    ...(plan === "full"
      ? [{ id: "cod" as PaymentMethod, label: "Cash on Delivery", sub: "Pay at your site when it arrives", icon: <Wallet className="w-5 h-5" /> }]
      : []),
  ];

  /* the three high-ticket payment plans */
  const plans: { id: PaymentPlan; label: string; sub: string; icon: React.ReactNode }[] = [
    { id: "full",  label: "Pay Full Amount",          sub: "UPI, Cards, Net Banking",                       icon: <Banknote className="w-4 h-4" /> },
    { id: "token", label: "Pay 20% Token Advance",    sub: "Dispatch the truck now, pay rest on delivery",  icon: <Zap className="w-4 h-4" /> },
    { id: "khata", label: "Conon Business Credit",    sub: "Buy on Khata · for verified contractors",       icon: <Wallet2 className="w-4 h-4" /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/55 backdrop-blur-[2px]"
            onClick={canDismiss ? onClose : undefined}
          />

          {/* sheet */}
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            className="fixed bottom-0 left-0 right-0 z-[71] flex justify-center"
            style={{ maxHeight: "94dvh" }}
          >
            <div className="w-full max-w-[480px] bg-gray-50 rounded-t-3xl overflow-hidden flex flex-col" style={{ maxHeight: "94dvh" }}>

              {/* ── Header ── */}
              <div className="shrink-0 bg-white px-5 pt-3 pb-3 border-b border-gray-100">
                <div className="flex justify-center mb-2">
                  <div className="w-10 h-1 rounded-full bg-gray-200" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black" style={{ color: BRAND }}>
                      {stage === "success" ? "Order Confirmed" : stage === "failure" ? "Payment Failed" : "Payment"}
                    </h2>
                    {stage === "select" && (
                      <p className="text-[12px] font-bold text-gray-400">
                        Order value <span className="text-gray-900">₹{amount.toLocaleString("en-IN")}</span>
                      </p>
                    )}
                  </div>
                  {canDismiss && (
                    <button onClick={onClose} aria-label="Close payment" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>

              {/* ── Body ── */}
              <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">

                  {/* ───────────────── SELECT ───────────────── */}
                  {stage === "select" && (
                    <motion.div key="select"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="p-4 space-y-4">

                      {/* ── Payment plan selector ── */}
                      <div>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-wide mb-2 px-1">Choose how to pay</p>
                        <div className="space-y-2">
                          {plans.map((p) => {
                            const active = plan === p.id;
                            return (
                              <button key={p.id}
                                onClick={() => { setPlan(p.id); setTouched(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 text-left transition-all ${active ? "border-green-500 bg-white shadow-sm" : "border-transparent bg-white"}`}>
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${active ? "text-white" : "text-gray-500 bg-gray-100"}`}
                                  style={active ? { background: BRAND } : {}}>
                                  {p.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-black text-gray-900">{p.label}</p>
                                  <p className="text-[11px] text-gray-400 font-semibold truncate">{p.sub}</p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${active ? "border-green-500" : "border-gray-300"}`}>
                                  {active && <div className="w-2.5 h-2.5 rounded-full" style={{ background: GREEN }} />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* ── plan-specific summary ── */}
                      {plan === "token" && (
                        <div className="rounded-2xl p-4 border" style={{ background: `${AMBER}10`, borderColor: `${AMBER}33` }}>
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] font-bold text-gray-600">Pay now (20% advance)</span>
                            <span className="text-lg font-black tabular-nums" style={{ color: BRAND }}>₹{payableNow.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-dashed" style={{ borderColor: `${AMBER}44` }}>
                            <span className="text-[12px] font-semibold text-gray-500">Balance on delivery (Cash / UPI)</span>
                            <span className="text-sm font-black text-gray-700 tabular-nums">₹{balanceDue.toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                      )}

                      {plan === "khata" && (
                        <div className="rounded-2xl p-4 bg-white border-2 border-green-100">
                          <div className="flex items-center gap-2 mb-3">
                            <BadgeCheck className="w-4 h-4 text-green-600" />
                            <span className="text-[12px] font-black text-green-700">Verified Contractor · Net 30 terms</span>
                          </div>
                          <div className="flex items-center justify-between text-[13px] font-semibold text-gray-600">
                            <span>Credit limit</span><span className="tabular-nums">₹{KHATA_LIMIT.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex items-center justify-between text-[13px] font-semibold text-gray-600 mt-1">
                            <span>Currently used</span><span className="tabular-nums">₹{KHATA_USED.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed border-gray-200">
                            <span className="text-[13px] font-black text-gray-900">Available credit</span>
                            <span className="text-base font-black tabular-nums" style={{ color: amount > khataAvailable ? "#dc2626" : GREEN }}>
                              ₹{khataAvailable.toLocaleString("en-IN")}
                            </span>
                          </div>
                          {/* usage bar */}
                          <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${Math.min(100, ((KHATA_USED + (amount > khataAvailable ? 0 : amount)) / KHATA_LIMIT) * 100)}%`, background: amount > khataAvailable ? "#dc2626" : GREEN }} />
                          </div>
                          {touched && errors.khata && <FieldError msg={errors.khata} />}
                        </div>
                      )}

                      {/* ── method tabs (full / token only) ── */}
                      {plan !== "khata" && (
                        <div className="space-y-3">
                          <p className="text-[11px] font-black text-gray-400 uppercase tracking-wide px-1">
                            {plan === "token" ? "Pay the advance using" : "Pay using"}
                          </p>
                          {methods.map((m) => {
                            const active = method === m.id;
                            return (
                              <div key={m.id}
                                className={`bg-white rounded-2xl border-2 transition-all overflow-hidden ${active ? "border-green-500 shadow-sm" : "border-transparent"}`}>
                                <button
                                  onClick={() => { setMethod(m.id); setTouched(false); }}
                                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${active ? "text-white" : "text-gray-500 bg-gray-100"}`}
                                    style={active ? { background: BRAND } : {}}>
                                    {m.icon}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-gray-900">{m.label}</p>
                                    <p className="text-[11px] text-gray-400 font-semibold truncate">{m.sub}</p>
                                  </div>
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${active ? "border-green-500" : "border-gray-300"}`}>
                                    {active && <div className="w-2.5 h-2.5 rounded-full" style={{ background: GREEN }} />}
                                  </div>
                                </button>

                                {/* ── method-specific body ── */}
                                <AnimatePresence>
                                  {active && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                      <div className="px-4 pb-4 pt-1">

                                        {/* UPI */}
                                        {m.id === "upi" && (
                                          <div className="space-y-3">
                                            <div className="flex gap-2">
                                              {UPI_APPS.map(app => (
                                                <div key={app.id}
                                                  className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border border-gray-200 bg-gray-50">
                                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-black"
                                                    style={{ background: app.color }}>
                                                    {app.short.slice(0, 2)}
                                                  </div>
                                                  <span className="text-[10px] font-bold text-gray-600">{app.name}</span>
                                                </div>
                                              ))}
                                            </div>
                                            <div>
                                              <input
                                                value={upiId}
                                                onChange={e => setUpiId(e.target.value)}
                                                placeholder="yourname@bank"
                                                inputMode="email"
                                                className={`w-full px-4 py-3 rounded-xl border-2 text-sm font-bold focus:outline-none transition ${touched && errors.upi ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-green-400"}`}
                                              />
                                              {touched && errors.upi && <FieldError msg={errors.upi} />}
                                            </div>
                                          </div>
                                        )}

                                        {/* CARD */}
                                        {m.id === "card" && (
                                          <div className="space-y-3">
                                            <div>
                                              <div className="relative">
                                                <input
                                                  value={cardNo}
                                                  onChange={e => setCardNo(formatCardNumber(e.target.value))}
                                                  placeholder="1234 5678 9012 3456"
                                                  inputMode="numeric"
                                                  className={`w-full pl-4 pr-16 py-3 rounded-xl border-2 text-sm font-bold tracking-wider focus:outline-none transition ${touched && errors.cardNo ? "border-red-300" : "border-gray-200 focus:border-green-400"}`}
                                                />
                                                {brand !== "unknown" && (
                                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-gray-900 text-white">
                                                    {brand}
                                                  </span>
                                                )}
                                              </div>
                                              {touched && errors.cardNo && <FieldError msg={errors.cardNo} />}
                                            </div>
                                            <div className="flex gap-3">
                                              <div className="flex-1">
                                                <input
                                                  value={cardExp}
                                                  onChange={e => setCardExp(formatExpiry(e.target.value))}
                                                  placeholder="MM / YY" inputMode="numeric"
                                                  className={`w-full px-4 py-3 rounded-xl border-2 text-sm font-bold focus:outline-none transition ${touched && errors.cardExp ? "border-red-300" : "border-gray-200 focus:border-green-400"}`}
                                                />
                                                {touched && errors.cardExp && <FieldError msg={errors.cardExp} />}
                                              </div>
                                              <div className="flex-1">
                                                <input
                                                  value={cardCvv}
                                                  onChange={e => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                                  placeholder="CVV" inputMode="numeric" type="password"
                                                  className={`w-full px-4 py-3 rounded-xl border-2 text-sm font-bold focus:outline-none transition ${touched && errors.cardCvv ? "border-red-300" : "border-gray-200 focus:border-green-400"}`}
                                                />
                                                {touched && errors.cardCvv && <FieldError msg={errors.cardCvv} />}
                                              </div>
                                            </div>
                                            <div>
                                              <input
                                                value={cardName}
                                                onChange={e => setCardName(e.target.value)}
                                                placeholder="Name on card"
                                                className={`w-full px-4 py-3 rounded-xl border-2 text-sm font-bold focus:outline-none transition ${touched && errors.cardName ? "border-red-300" : "border-gray-200 focus:border-green-400"}`}
                                              />
                                              {touched && errors.cardName && <FieldError msg={errors.cardName} />}
                                            </div>
                                          </div>
                                        )}

                                        {/* NET BANKING */}
                                        {m.id === "netbanking" && (
                                          <div>
                                            <div className="grid grid-cols-2 gap-2">
                                              {BANKS.map(b => (
                                                <button key={b.code}
                                                  onClick={() => setBankCode(b.code)}
                                                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left transition ${bankCode === b.code ? "border-green-500 bg-green-50" : "border-gray-200 bg-gray-50"}`}>
                                                  <Landmark className={`w-4 h-4 shrink-0 ${bankCode === b.code ? "text-green-600" : "text-gray-400"}`} />
                                                  <span className="text-[11px] font-bold text-gray-700 leading-tight">{b.name}</span>
                                                </button>
                                              ))}
                                            </div>
                                            {touched && errors.bank && <FieldError msg={errors.bank} />}
                                          </div>
                                        )}

                                        {/* COD */}
                                        {m.id === "cod" && (
                                          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-100">
                                            <Wallet className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                            <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">
                                              Keep <strong>₹{amount.toLocaleString("en-IN")}</strong> ready. Pay our delivery
                                              partner by cash or UPI when materials arrive at your site.
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* ── Security badges ── */}
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <SecurityBadge icon={<ShieldCheck className="w-4 h-4" />} label="SSL Secure" />
                        <SecurityBadge icon={<BadgeCheck className="w-4 h-4" />} label="Verified Materials" />
                        <SecurityBadge icon={<RotateCcw className="w-4 h-4" />} label="100% Transit Refund" />
                      </div>
                      <p className="text-center text-[10px] text-gray-400 font-semibold flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" /> 256-bit encrypted · details never stored on our servers
                      </p>
                    </motion.div>
                  )}

                  {/* ───────────────── PROCESSING ───────────────── */}
                  {stage === "processing" && (
                    <motion.div key="processing"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center text-center py-16 px-8">
                      <div className="relative w-24 h-24 mb-6">
                        <motion.div
                          className="absolute inset-0 rounded-full border-4 border-gray-200 border-t-green-500"
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        />
                        <div className="absolute inset-3 rounded-full flex items-center justify-center" style={{ background: `${BRAND}10` }}>
                          <Lock className="w-8 h-8" style={{ color: BRAND }} />
                        </div>
                      </div>
                      <h3 className="text-lg font-black mb-2" style={{ color: BRAND }}>
                        {plan === "khata" ? "Posting to your Khata…" : "Processing your secure payment…"}
                      </h3>
                      <p className="text-sm text-gray-500 font-semibold leading-relaxed">
                        Please do not close or refresh this screen.
                      </p>
                      <div className="flex items-center gap-1.5 mt-5 text-[11px] font-black text-gray-400">
                        <ShieldCheck className="w-3.5 h-3.5 text-green-500" /> Encrypted &amp; protected
                      </div>
                    </motion.div>
                  )}

                  {/* ───────────────── SUCCESS ───────────────── */}
                  {stage === "success" && order && (
                    <motion.div key="success"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="relative p-5 text-center">

                      {/* magical celebratory confetti burst */}
                      <Confetti />

                      {/* animated truck leaving the warehouse */}
                      <TruckLeavingWarehouse />

                      <motion.h3
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                        className="text-2xl font-black mt-4 mb-1" style={{ color: BRAND }}>
                        Order Confirmed!
                      </motion.h3>
                      <p className="text-sm text-gray-500 font-semibold mb-4">
                        Your materials are being loaded for dispatch.
                      </p>

                      {/* order id + details */}
                      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-3 text-left">
                        <div className="flex items-center justify-between mb-3 pb-3 border-b border-dashed border-gray-200">
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Order ID</p>
                            <p className="text-sm font-black text-gray-900">{order.id}</p>
                          </div>
                          <button onClick={copyId}
                            className="flex items-center gap-1 text-[11px] font-black px-2.5 py-1.5 rounded-lg bg-gray-100"
                            style={{ color: BRAND }}>
                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copied ? "Copied" : "Copy"}
                          </button>
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${AMBER}22` }}>
                            <Clock className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-[11px] text-gray-400 font-bold">Estimated delivery</p>
                            <p className="text-sm font-black text-gray-900">Within {order.etaMinutes} minutes</p>
                          </div>
                          <div className="ml-auto text-base font-black text-gray-900 tabular-nums">₹{order.total.toLocaleString("en-IN")}</div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                            <Truck className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] text-gray-400 font-bold">Delivering to</p>
                            <p className="text-[13px] font-bold text-gray-800 leading-snug">{order.address}</p>
                          </div>
                        </div>

                        {/* payment-plan summary */}
                        {order.plan === "token" && (
                          <div className="mt-3 pt-3 border-t border-dashed border-gray-200 flex items-center justify-between">
                            <div>
                              <p className="text-[11px] text-gray-400 font-bold">Advance paid</p>
                              <p className="text-sm font-black" style={{ color: GREEN }}>₹{order.paidNow.toLocaleString("en-IN")}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[11px] text-gray-400 font-bold">Due on delivery</p>
                              <p className="text-sm font-black text-gray-900">₹{order.balanceDue.toLocaleString("en-IN")}</p>
                            </div>
                          </div>
                        )}
                        {order.plan === "khata" && (
                          <div className="mt-3 pt-3 border-t border-dashed border-gray-200 flex items-center gap-2">
                            <Wallet2 className="w-4 h-4 text-green-600" />
                            <p className="text-[12px] font-bold text-gray-600">Billed to your Khata · payable in 30 days</p>
                          </div>
                        )}
                      </div>

                      <button onClick={goTrack}
                        className="w-full py-4 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 mb-2.5 shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${GREEN}, #1e6b30)`, boxShadow: `0 6px 20px ${GREEN}40` }}>
                        <Truck className="w-4 h-4" /> Track Truck Live
                      </button>
                      <button onClick={() => { onOrderPlaced?.(); onClose(); }}
                        className="w-full py-2.5 rounded-xl font-bold text-sm text-gray-500">
                        Continue Shopping
                      </button>
                    </motion.div>
                  )}

                  {/* ───────────────── FAILURE ───────────────── */}
                  {stage === "failure" && (
                    <motion.div key="failure"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="p-6 text-center">
                      <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 12, stiffness: 200 }}
                        className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-50">
                        <XCircle className="w-14 h-14 text-red-400" strokeWidth={2.2} />
                      </motion.div>

                      <h3 className="text-xl font-black mb-1.5" style={{ color: BRAND }}>
                        {chargedOk ? "Order Not Confirmed" : "Payment Failed"}
                      </h3>
                      <p className="text-sm text-gray-500 font-semibold leading-relaxed mb-1 px-2">{failMsg}</p>
                      {chargedOk ? (
                        <p className="text-[12px] text-amber-700 font-bold mb-6 flex items-center justify-center gap-1 px-3">
                          <Clock className="w-3.5 h-3.5 shrink-0" /> Please contact support before retrying to avoid a double charge.
                        </p>
                      ) : (
                        <p className="text-[12px] text-green-700 font-bold mb-6 flex items-center justify-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> No money was deducted from your account.
                        </p>
                      )}

                      {chargedOk ? (
                        <button onClick={onClose}
                          className="w-full py-4 rounded-2xl text-white font-black text-sm mb-2.5 shadow-lg"
                          style={{ background: BRAND }}>
                          Contact Support
                        </button>
                      ) : (
                        <>
                          <button onClick={() => setStage("select")}
                            className="w-full py-4 rounded-2xl text-white font-black text-sm mb-2.5 shadow-lg"
                            style={{ background: BRAND }}>
                            Retry Payment
                          </button>
                          <button onClick={onClose}
                            className="w-full py-2.5 rounded-xl font-bold text-sm text-gray-500">
                            Cancel
                          </button>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Sticky pay button (select stage only) ── */}
              {stage === "select" && (
                <div className="shrink-0 bg-white border-t border-gray-100 px-4 py-3"
                  style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
                  <button
                    onClick={handlePay}
                    disabled={touched && !noValidationNeeded && !isValid}
                    className="w-full py-4 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition disabled:opacity-50"
                    style={{ background: `linear-gradient(135deg, ${GREEN}, #1e6b30)`, boxShadow: `0 6px 20px ${GREEN}40` }}>
                    <Lock className="w-4 h-4" /> {payLabel}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <p className="text-[11px] text-red-500 font-bold mt-1.5 flex items-center gap-1">
      <XCircle className="w-3 h-3" /> {msg}
    </p>
  );
}

function SecurityBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl bg-white border border-gray-100 text-center">
      <span className="text-green-600">{icon}</span>
      <span className="text-[9px] font-black text-gray-500 leading-tight px-1">{label}</span>
    </div>
  );
}

/* ── Animated truck leaving the warehouse (success screen) ── */
function TruckLeavingWarehouse() {
  return (
    <div className="relative h-28 w-full overflow-hidden rounded-2xl"
      style={{ background: "linear-gradient(180deg, #eaf4ff 0%, #f6fbff 58%, #e7edf1 58%)" }}>

      {/* warehouse */}
      <div className="absolute left-3 bottom-7">
        <div className="w-20 h-12 bg-white rounded-t-md border border-gray-200 relative">
          {/* roof */}
          <div className="absolute -top-2 -left-1 -right-1 h-3 rounded-sm" style={{ background: BRAND }} />
          {/* door */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-8 bg-gray-100 border-x border-t border-gray-200 rounded-t-sm overflow-hidden">
            <div className="w-full h-full flex flex-col justify-between py-0.5">
              {[0, 1, 2, 3].map(i => <div key={i} className="h-px bg-gray-300 mx-0.5" />)}
            </div>
          </div>
          <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[6px] font-black" style={{ color: BRAND }}>CONON</span>
        </div>
      </div>

      {/* ground */}
      <div className="absolute bottom-0 left-0 right-0 h-7" style={{ background: "#3a4a55" }} />
      {/* moving road dashes */}
      <motion.div className="absolute bottom-3 left-0 right-0 flex gap-3 px-2"
        animate={{ x: [0, -24] }} transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }}>
        {Array.from({ length: 14 }).map((_, i) => <div key={i} className="h-0.5 w-4 rounded-full bg-white/60 shrink-0" />)}
      </motion.div>

      {/* truck */}
      <motion.div className="absolute bottom-4"
        initial={{ x: 26 }} animate={{ x: 360 }}
        transition={{ duration: 2.6, ease: "easeIn", repeat: Infinity, repeatDelay: 0.5 }}>
        <div className="relative flex items-end">
          {/* cargo box */}
          <div className="w-12 h-9 rounded-sm relative" style={{ background: AMBER }}>
            <div className="absolute inset-1 border-2 border-white/40 rounded-[2px]" />
          </div>
          {/* cab */}
          <div className="w-6 h-7 rounded-sm rounded-tr-lg ml-px relative" style={{ background: BRAND }}>
            <div className="absolute top-1 right-0.5 w-2.5 h-2 bg-sky-200 rounded-sm" />
          </div>
          {/* wheels */}
          <motion.div className="absolute -bottom-1.5 left-2 w-3 h-3 rounded-full bg-gray-900 border-2 border-gray-500"
            animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.4, ease: "linear" }} />
          <motion.div className="absolute -bottom-1.5 right-1.5 w-3 h-3 rounded-full bg-gray-900 border-2 border-gray-500"
            animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.4, ease: "linear" }} />
        </div>
      </motion.div>

      {/* "dispatched" pill */}
      <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: GREEN }} />
        <span className="text-[9px] font-black" style={{ color: GREEN }}>DISPATCHED</span>
      </div>
    </div>
  );
}
