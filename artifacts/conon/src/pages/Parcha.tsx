import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, CreditCard, CheckCircle, Clock, AlertTriangle,
  ChevronRight, Phone, Smartphone, TrendingUp, TrendingDown,
  Filter, X, IndianRupee,
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const BRAND = "#1b4366";
const AMBER  = "#f59e0b";
const GREEN  = "#15803d";
const RED    = "#dc2626";

const LEDGER = [
  { id: 1, date: "22 Mar 2026", item: "TMT Steel — 2 Tonne",     vendor: "Sharma Hardware",   amount: 136000, type: "due",  dueDate: "28 Mar", overdue: false },
  { id: 2, date: "19 Mar 2026", item: "OPC Cement — 100 bags",   vendor: "Lakshmi Stores",    amount: 38500,  type: "due",  dueDate: "25 Mar", overdue: true  },
  { id: 3, date: "18 Mar 2026", item: "Bricks — 10,000 pcs",     vendor: "Raju Bricks & Co",  amount: 45000,  type: "paid", paidDate: "20 Mar"                },
  { id: 4, date: "14 Mar 2026", item: "River Sand — 50 cft",     vendor: "Sharma Hardware",   amount: 12500,  type: "paid", paidDate: "16 Mar"                },
  { id: 5, date: "10 Mar 2026", item: "Plywood 18mm — 20 sheets",vendor: "National Ply Depot", amount: 28000,  type: "due",  dueDate: "17 Mar", overdue: true  },
  { id: 6, date: "05 Mar 2026", item: "White Cement — 10 bags",  vendor: "Lakshmi Stores",    amount: 3800,   type: "paid", paidDate: "08 Mar"                },
];

const CREDIT_LIMIT = 500000;

type Filter = "all" | "due" | "paid";

export function Parcha() {
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState<Filter>("all");
  const [payItem, setPayItem]   = useState<typeof LEDGER[0] | null>(null);
  const [payMethod, setPayMethod] = useState<"upi" | "bank" | null>(null);

  const totalDue    = LEDGER.filter(l => l.type === "due").reduce((s, l) => s + l.amount, 0);
  const totalPaid   = LEDGER.filter(l => l.type === "paid").reduce((s, l) => s + l.amount, 0);
  const overdueAmt  = LEDGER.filter(l => l.type === "due" && l.overdue).reduce((s, l) => s + l.amount, 0);
  const available   = CREDIT_LIMIT - totalDue;
  const usedPct     = Math.round((totalDue / CREDIT_LIMIT) * 100);

  const visible = LEDGER.filter(l => filter === "all" ? true : l.type === filter);

  const confirmPayment = () => {
    toast.success(`₹${payItem!.amount.toLocaleString("en-IN")} payment initiated via ${payMethod === "upi" ? "UPI" : "Bank Transfer"}`);
    setPayItem(null);
    setPayMethod(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center">
      <div className="w-full max-w-[480px] bg-white min-h-screen relative shadow-2xl flex flex-col">

        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="px-5 pt-10 pb-6 rounded-b-[44px] shadow-xl" style={{ background: BRAND }}>
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setLocation("/home")} className="p-2 bg-white/10 rounded-full">
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <div>
              <h2 className="font-display font-black italic text-xl text-white">Digital Parcha</h2>
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Udhaar Ledger</p>
            </div>
            <div className="ml-auto p-2 bg-white/10 rounded-full">
              <CreditCard className="w-4 h-4 text-amber-300" />
            </div>
          </div>

          {/* Credit meter */}
          <div className="bg-white/10 rounded-[28px] p-5 border border-white/5 mb-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-[9px] font-black text-blue-200 uppercase tracking-widest">Credit Limit</p>
                <p className="text-xl font-display font-black text-white">
                  ₹{(CREDIT_LIMIT / 100000).toFixed(1)}L
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-blue-200 uppercase tracking-widest">Available</p>
                <p className="text-xl font-display font-black text-green-300">
                  ₹{(available / 100000).toFixed(1)}L
                </p>
              </div>
            </div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${usedPct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: usedPct > 70 ? RED : AMBER }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[9px] font-bold text-blue-200">{usedPct}% used</span>
              <span className="text-[9px] font-bold text-blue-200">{100 - usedPct}% free</span>
            </div>
          </div>

          {/* 3 stat pills */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/10 rounded-2xl p-3 text-center border border-white/5">
              <p className="text-[8px] font-black text-blue-200 uppercase mb-1">Total Due</p>
              <p className="text-sm font-black text-white">₹{(totalDue / 1000).toFixed(0)}k</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 text-center border border-white/5">
              <p className="text-[8px] font-black text-red-300 uppercase mb-1">Overdue</p>
              <p className="text-sm font-black text-red-300">₹{(overdueAmt / 1000).toFixed(0)}k</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 text-center border border-white/5">
              <p className="text-[8px] font-black text-green-200 uppercase mb-1">Paid (Mar)</p>
              <p className="text-sm font-black text-green-300">₹{(totalPaid / 1000).toFixed(0)}k</p>
            </div>
          </div>
        </div>

        {/* ── Filter tabs ──────────────────────────────────────────── */}
        <div className="px-5 pt-5">
          <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl">
            {(["all", "due", "paid"] as Filter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                style={{
                  background: filter === f ? BRAND : "transparent",
                  color:      filter === f ? "#fff" : "#94a3b8",
                }}
              >
                {f === "all" ? "All" : f === "due" ? "🔴 Due" : "✅ Paid"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Ledger list ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-10 space-y-3 scrollbar-hide">
          {visible.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-[24px] p-4 border flex gap-3 items-start"
              style={{
                borderColor: entry.type === "due" && entry.overdue ? "#fecaca"
                           : entry.type === "due"                  ? "#fde68a"
                           : "#d1fae5",
                borderWidth: "1.5px",
              }}
            >
              {/* Icon */}
              <div
                className="p-2.5 rounded-2xl shrink-0"
                style={{
                  background: entry.type === "due" && entry.overdue ? "#fef2f2"
                            : entry.type === "due"                  ? "#fffbeb"
                            : "#f0fdf4",
                }}
              >
                {entry.type === "paid"
                  ? <CheckCircle className="w-4 h-4" style={{ color: GREEN }} />
                  : entry.overdue
                    ? <AlertTriangle className="w-4 h-4 text-red-500" />
                    : <Clock className="w-4 h-4 text-amber-500" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-800 leading-tight">{entry.item}</p>
                <p className="text-[9px] font-semibold text-slate-400 mt-0.5">{entry.vendor} · {entry.date}</p>
                {entry.type === "due" && (
                  <p
                    className="text-[9px] font-black mt-1 uppercase tracking-wide"
                    style={{ color: entry.overdue ? RED : "#b45309" }}
                  >
                    {entry.overdue ? "⚠️ OVERDUE" : "Due"} — {entry.dueDate}
                  </p>
                )}
                {entry.type === "paid" && (
                  <p className="text-[9px] font-black mt-1 uppercase tracking-wide" style={{ color: GREEN }}>
                    Paid on {entry.paidDate}
                  </p>
                )}
              </div>

              {/* Amount + action */}
              <div className="text-right shrink-0">
                <p
                  className="text-sm font-black"
                  style={{ color: entry.type === "paid" ? GREEN : entry.overdue ? RED : BRAND }}
                >
                  {entry.type === "paid" ? "+" : "-"}₹{entry.amount.toLocaleString("en-IN")}
                </p>
                {entry.type === "due" && (
                  <button
                    onClick={() => setPayItem(entry)}
                    className="mt-1.5 px-3 py-1 rounded-xl text-white text-[9px] font-black uppercase"
                    style={{ background: BRAND }}
                  >
                    Pay Now
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Pay Now Bottom Drawer ─────────────────────────────────── */}
        <AnimatePresence>
          {payItem && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={() => { setPayItem(null); setPayMethod(null); }}
              />
              <motion.div
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 220 }}
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[48px] p-8 pb-12 z-50"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="font-display font-black italic text-lg" style={{ color: BRAND }}>
                      Settle Udhaar
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">{payItem.vendor}</p>
                  </div>
                  <button onClick={() => { setPayItem(null); setPayMethod(null); }}
                    className="p-2 bg-slate-100 rounded-full">
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>

                <div className="bg-slate-50 rounded-[24px] p-4 mb-6">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Amount Due</p>
                  <p className="text-3xl font-display font-black italic" style={{ color: RED }}>
                    ₹{payItem.amount.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">{payItem.item}</p>
                </div>

                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Select Payment Method</p>
                <div className="space-y-2 mb-6">
                  {[
                    { key: "upi",  label: "UPI / GPay / PhonePe", icon: <Smartphone className="w-4 h-4" /> },
                    { key: "bank", label: "Bank Transfer (NEFT/IMPS)", icon: <IndianRupee className="w-4 h-4" /> },
                  ].map(m => (
                    <button
                      key={m.key}
                      onClick={() => setPayMethod(m.key as "upi" | "bank")}
                      className="w-full flex items-center gap-3 p-4 rounded-[20px] border-2 transition-all"
                      style={{
                        borderColor: payMethod === m.key ? BRAND : "#e2e8f0",
                        background:  payMethod === m.key ? "#f0f6ff" : "white",
                      }}
                    >
                      <div className="p-2 rounded-xl" style={{ background: payMethod === m.key ? BRAND : "#f1f5f9", color: payMethod === m.key ? "white" : "#64748b" }}>
                        {m.icon}
                      </div>
                      <span className="text-xs font-black text-slate-700">{m.label}</span>
                      {payMethod === m.key && <CheckCircle className="w-4 h-4 ml-auto" style={{ color: BRAND }} />}
                    </button>
                  ))}
                </div>

                <button
                  onClick={confirmPayment}
                  disabled={!payMethod}
                  className="w-full py-5 rounded-[24px] font-black text-sm uppercase tracking-widest text-white transition-all"
                  style={{
                    background: payMethod ? BRAND : "#e2e8f0",
                    boxShadow:  payMethod ? "0 8px 24px rgba(27,67,102,0.3)" : "none",
                    color:      payMethod ? "white" : "#94a3b8",
                  }}
                >
                  Confirm Payment
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
