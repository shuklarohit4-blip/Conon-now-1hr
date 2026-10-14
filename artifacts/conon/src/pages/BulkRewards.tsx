import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, ShoppingBag, Gift, Users,
  ArrowUpRight, CheckCircle, Percent,
  Wallet, Info, Truck, ChevronRight, Star,
  Copy, Share2, Award,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { toast } from "sonner";
import { useWallet } from "@/context/WalletContext";

const BRAND_DARK = "#1b4366";
const AMBER      = "#f59e0b";
const EMERALD    = "#10b981";

const BULK_PRODUCTS = [
  {
    id: "ultratech-opc53",
    brand: "UltraTech",
    name: "OPC 53 Grade",
    emoji: "📦",
    cat: "Cement",
    retail: 395,
    wholesale: 372,
    bulkAt: 50,
    unit: "Bag",
    max: 500,
    tagColor: "#ea580c",
  },
  {
    id: "acc-ppc",
    brand: "ACC",
    name: "Suraksha PPC",
    emoji: "📦",
    cat: "Cement",
    retail: 375,
    wholesale: 352,
    bulkAt: 50,
    unit: "Bag",
    max: 500,
    tagColor: "#1d4ed8",
  },
  {
    id: "tata-tmt-fe500",
    brand: "TATA Tiscon",
    name: "TMT Fe500 12mm",
    emoji: "🏗️",
    cat: "Steel",
    retail: 68,
    wholesale: 62,
    bulkAt: 100,
    unit: "kg",
    max: 5000,
    tagColor: "#dc2626",
  },
  {
    id: "ambuja-ppc",
    brand: "Ambuja",
    name: "Plus PPC",
    emoji: "📦",
    cat: "Cement",
    retail: 390,
    wholesale: 365,
    bulkAt: 50,
    unit: "Bag",
    max: 500,
    tagColor: "#dc2626",
  },
  {
    id: "jsw-tmt-fe500d",
    brand: "JSW Neosteel",
    name: "TMT Fe500D 16mm",
    emoji: "🏗️",
    cat: "Steel",
    retail: 72,
    wholesale: 65,
    bulkAt: 100,
    unit: "kg",
    max: 5000,
    tagColor: "#1d4ed8",
  },
  {
    id: "asian-tractor",
    brand: "Asian Paints",
    name: "Tractor Emulsion 20L",
    emoji: "🎨",
    cat: "Paint",
    retail: 3200,
    wholesale: 2850,
    bulkAt: 10,
    unit: "Bucket",
    max: 100,
    tagColor: "#7c3aed",
  },
];

const TIERS = [
  { min: 1,   label: "Retail",      color: "#64748b", icon: "🏪" },
  { min: 50,  label: "Wholesale",   color: "#1d4ed8", icon: "📦" },
  { min: 200, label: "Contractor",  color: "#7c3aed", icon: "🏗️" },
  { min: 500, label: "Project Rate", color: "#15803d", icon: "🏢" },
];

const ADD_PRESETS = [500, 1000, 2000, 5000];
const PAY_METHODS = [
  { id: "UPI",  label: "UPI",          sub: "GPay · PhonePe · Paytm" },
  { id: "Card", label: "Card",         sub: "Credit / Debit" },
  { id: "Net",  label: "Net Banking",  sub: "All major banks" },
];

const REFERRALS = [
  { name: "Ramesh (B-12, Gomti Nagar)", status: "Active",   earned: "₹2,000",  orders: 4 },
  { name: "Sunil (C-5, Indira Nagar)",  status: "Active",   earned: "₹2,000",  orders: 2 },
  { name: "Manoj (D-8, Aliganj)",       status: "Pending",  earned: "—",        orders: 0 },
];

export function BulkRewards() {
  const [view, setView]             = useState<"retail" | "wholesale">("retail");
  const [activeProduct, setActive]  = useState(BULK_PRODUCTS[0]);
  const [quantity, setQuantity]     = useState(1);
  const [showReferral, setShowRef]  = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [tab, setTab]               = useState<"bulk" | "wallet" | "refer">(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    return t === "wallet" || t === "refer" ? t : "bulk";
  });

  const { balance: walletBalance, transactions: walletTxns, addMoney } = useWallet();
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addAmount, setAddAmount]       = useState<number>(1000);
  const [payMethod, setPayMethod]       = useState<string>(PAY_METHODS[0].id);

  const handleAddMoney = () => {
    const amt = Math.round(addAmount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (amt > 100000) {
      toast.error("Maximum ₹1,00,000 per top-up");
      return;
    }
    addMoney(amt, payMethod);
    setShowAddMoney(false);
    setAddAmount(1000);
    setPayMethod(PAY_METHODS[0].id);
    toast.success(`₹${amt.toLocaleString("en-IN")} added to your Gold Wallet!`, {
      description: `Paid via ${payMethod}`,
    });
  };

  const isBulk       = quantity >= activeProduct.bulkAt;
  const currentPrice  = isBulk ? activeProduct.wholesale : activeProduct.retail;
  const total         = quantity * currentPrice;
  const savings       = quantity * (activeProduct.retail - activeProduct.wholesale);
  const toUnlock      = activeProduct.bulkAt - quantity;

  const currentTier = [...TIERS].reverse().find(t => quantity >= t.min) ?? TIERS[0];

  return (
    <Layout>
      <div className="px-4 pt-5 pb-28">

        {/* Retail / Wholesale toggle */}
        <div className="bg-slate-100 p-1 rounded-2xl flex mb-5 border border-slate-200/60">
          <button onClick={() => setView("retail")}
            className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all flex items-center justify-center gap-1.5"
            style={{ background: view === "retail" ? "#fff" : "transparent", color: view === "retail" ? BRAND_DARK : "#94a3b8",
              boxShadow: view === "retail" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
            Retail
          </button>
          <button onClick={() => { setView("wholesale"); if (quantity < activeProduct.bulkAt) setQuantity(activeProduct.bulkAt); }}
            className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all flex items-center justify-center gap-1.5"
            style={{ background: view === "wholesale" ? "#fff" : "transparent", color: view === "wholesale" ? BRAND_DARK : "#94a3b8",
              boxShadow: view === "wholesale" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
            <Percent className="w-3 h-3" /> Wholesale (Bulk)
          </button>
        </div>

        {/* 3-tab switcher */}
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-2xl mb-5">
          {([
            { key: "bulk"   as const, label: "Bulk Pricing" },
            { key: "wallet" as const, label: "Gold Wallet" },
            { key: "refer"  as const, label: "Referrals" },
          ]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-wide transition-all"
              style={{ background: tab === t.key ? BRAND_DARK : "transparent", color: tab === t.key ? "#fff" : "#94a3b8" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ═══════════════ BULK PRICING TAB ═══════════════ */}
        {tab === "bulk" && (
          <div className="space-y-5">

            {/* Product selector pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
              {BULK_PRODUCTS.map(p => (
                <button key={p.id} onClick={() => { setActive(p); setQuantity(1); }}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-[14px] text-[8px] font-black uppercase transition-all border whitespace-nowrap"
                  style={{
                    background: activeProduct.id === p.id ? p.tagColor : "#fff",
                    color: activeProduct.id === p.id ? "#fff" : p.tagColor,
                    borderColor: activeProduct.id === p.id ? p.tagColor : p.tagColor + "30",
                  }}>
                  <span>{p.emoji}</span> {p.brand}
                </button>
              ))}
            </div>

            {/* Main product card */}
            <motion.div layout className="bg-white rounded-[28px] p-5 shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-5">
                <div className="w-16 h-16 rounded-[18px] flex items-center justify-center text-3xl shadow-inner"
                  style={{ background: activeProduct.tagColor + "12" }}>
                  {activeProduct.emoji}
                </div>
                <div className="text-right">
                  <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white"
                    style={{ background: activeProduct.tagColor }}>{activeProduct.cat}</span>
                  <p className="text-sm font-black text-slate-800 mt-1.5">{activeProduct.brand} {activeProduct.name}</p>
                  <p className="mt-1">
                    <span className="font-display font-black italic text-2xl" style={{ color: BRAND_DARK }}>₹{currentPrice}</span>
                    <span className="text-[9px] text-slate-400 font-bold ml-1">/ {activeProduct.unit}</span>
                  </p>
                  {isBulk && (
                    <p className="text-[8px] text-slate-400 line-through mt-0.5">MRP ₹{activeProduct.retail}/{activeProduct.unit}</p>
                  )}
                </div>
              </div>

              {/* Tier badges */}
              <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {TIERS.filter(t => t.min <= activeProduct.max).map(t => (
                  <div key={t.min}
                    className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-[10px] text-[7px] font-black uppercase"
                    style={{
                      background: currentTier.min === t.min ? t.color + "15" : "#f8fafc",
                      color: currentTier.min === t.min ? t.color : "#94a3b8",
                      border: currentTier.min === t.min ? `1.5px solid ${t.color}40` : "1px solid transparent",
                    }}>
                    <span>{t.icon}</span> {t.label} ({t.min}+)
                  </div>
                ))}
              </div>

              {/* Quantity slider */}
              <div className="space-y-3 mb-5">
                <div className="flex justify-between items-center text-[10px] font-black uppercase">
                  <span className="text-slate-400 italic">Select Quantity</span>
                  <span style={{ color: isBulk ? EMERALD : BRAND_DARK }}>
                    {quantity.toLocaleString()} {activeProduct.unit}s
                  </span>
                </div>
                <input type="range" min="1" max={activeProduct.max} value={quantity}
                  onChange={e => setQuantity(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: isBulk ? EMERALD : BRAND_DARK }}
                />
                <div className="flex justify-between text-[7px] font-bold text-slate-300 uppercase">
                  <span>1</span>
                  <span>{activeProduct.bulkAt} (Wholesale)</span>
                  <span>{activeProduct.max}</span>
                </div>

                {/* Unlock progress / unlocked banner */}
                {!isBulk ? (
                  <motion.div layout
                    className="flex items-center gap-2.5 p-3 rounded-[16px]"
                    style={{ background: BRAND_DARK + "08" }}>
                    <Info className="w-3.5 h-3.5 shrink-0" style={{ color: BRAND_DARK }} />
                    <div className="flex-1">
                      <p className="text-[9px] font-bold uppercase" style={{ color: BRAND_DARK }}>
                        Add <span className="font-black italic">{toUnlock} more {activeProduct.unit}s</span> to unlock{" "}
                        <span className="font-black italic">Wholesale Price (₹{activeProduct.wholesale})</span>
                      </p>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                        <motion.div className="h-full rounded-full" style={{ background: AMBER, width: `${(quantity / activeProduct.bulkAt) * 100}%` }}
                          layout transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div layout initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                    className="flex items-center gap-2.5 p-3 rounded-[16px] border"
                    style={{ background: "#ecfdf5", borderColor: "#a7f3d0" }}>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-[9px] font-black text-emerald-700 uppercase italic leading-tight">
                        Wholesale Pricing Unlocked!
                      </p>
                      <p className="text-[7px] font-bold text-emerald-600/70 uppercase mt-0.5">
                        Total Savings: ₹{savings.toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Total + CTA */}
              <div className="flex items-center justify-between mb-4 px-1">
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Order Total</p>
                  <p className="font-display font-black italic text-xl" style={{ color: BRAND_DARK }}>
                    ₹{total.toLocaleString()}
                  </p>
                </div>
                {isBulk && (
                  <div className="text-right">
                    <p className="text-[8px] font-bold text-emerald-500 uppercase">You Save</p>
                    <p className="font-black italic text-base text-emerald-600">₹{savings.toLocaleString()}</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => toast.success(`${quantity} × ${activeProduct.brand} ${activeProduct.name} added to cart!`, { description: `Total: ₹${total.toLocaleString()}` })}
                className="w-full py-3.5 rounded-[20px] text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg"
                style={{ background: BRAND_DARK, boxShadow: `0 8px 24px ${BRAND_DARK}30` }}>
                Add to Project Cart <ArrowUpRight className="w-4 h-4" />
              </button>
            </motion.div>

            {/* Community shipping nudge */}
            <div className="flex items-center gap-3 p-4 rounded-[22px]" style={{ background: BRAND_DARK + "08" }}>
              <Truck className="w-5 h-5 shrink-0" style={{ color: BRAND_DARK }} />
              <div>
                <p className="text-[9px] font-black uppercase" style={{ color: BRAND_DARK }}>Community Shipping</p>
                <p className="text-[8px] text-slate-500 font-bold">
                  2 neighbors ordering? Both get FREE shipping — same truck, same street.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ GOLD WALLET TAB ═══════════════ */}
        {tab === "wallet" && (
          <div className="space-y-5">
            {/* Wallet card */}
            <div className="relative overflow-hidden rounded-[28px] p-6 text-white"
              style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <p className="text-[9px] font-black text-amber-400 uppercase tracking-[0.2em] mb-1">CONON Gold Wallet</p>
                    <p className="font-display font-black italic text-3xl text-white">₹{walletBalance.toLocaleString("en-IN")}</p>
                    <p className="text-[8px] text-slate-400 font-bold mt-1">Available Balance</p>
                  </div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(245,158,11,0.15)" }}>
                    <Wallet className="w-6 h-6 text-amber-400" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toast.success("Wallet will be applied at checkout!")}
                    className="flex-1 py-2.5 rounded-[14px] text-[9px] font-black uppercase bg-amber-400 text-slate-900">
                    Use at Checkout
                  </button>
                  <button onClick={() => setShowAddMoney(true)}
                    className="px-4 py-2.5 rounded-[14px] text-[9px] font-black uppercase border border-white/20 text-white/90 active:scale-95 transition">
                    + Add Money
                  </button>
                </div>
              </div>
              <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-amber-400/10 rounded-full blur-3xl" />
            </div>

            {/* How to earn */}
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Ways to Earn Gold</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: "🤝", label: "Refer a Site", val: "₹2,000" },
                  { icon: "📦", label: "Bulk Bonus",   val: "Up to ₹900" },
                  { icon: "⭐", label: "5-Star Review", val: "₹100" },
                ].map(w => (
                  <div key={w.label} className="bg-white rounded-[18px] p-3 text-center border border-slate-100 shadow-sm">
                    <span className="text-2xl">{w.icon}</span>
                    <p className="text-[8px] font-black text-slate-700 mt-1">{w.label}</p>
                    <p className="text-[9px] font-black mt-0.5" style={{ color: AMBER }}>{w.val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Transaction history */}
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Recent Transactions</p>
              <div className="space-y-2.5">
                {walletTxns.map((txn, i) => (
                  <motion.div key={txn.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-3 bg-white rounded-[18px] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[10px] font-black text-white"
                        style={{ background: txn.color }}>₹</div>
                      <div>
                        <p className="text-[10px] font-black text-slate-800 leading-tight">{txn.label}</p>
                        <p className="text-[8px] font-bold text-slate-400">{txn.date}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-black italic" style={{ color: txn.color }}>{txn.amt}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Architect kickback teaser */}
            <div className="p-4 rounded-[22px] border-2 border-dashed" style={{ borderColor: "#7c3aed40", background: "#7c3aed08" }}>
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-violet-600" />
                <p className="text-[9px] font-black text-violet-700 uppercase">Architect Rewards Program</p>
              </div>
              <p className="text-[9px] text-slate-500 font-bold mb-2">
                Earn reward points for every project managed on CONON. Redeem for professional tools and software subscriptions.
              </p>
              <button onClick={() => toast.success("Architect Rewards registration coming soon!")}
                className="px-4 py-2 rounded-[12px] text-white text-[9px] font-black" style={{ background: "#7c3aed" }}>
                Learn More
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════ REFERRALS TAB ═══════════════ */}
        {tab === "refer" && (
          <div className="space-y-5">
            {/* Hero referral card */}
            <div className="relative overflow-hidden rounded-[28px] p-5"
              style={{ background: "linear-gradient(135deg, #064e3b 0%, #10b981 100%)" }}>
              <div className="relative z-10">
                <p className="text-[8px] font-black text-emerald-200 uppercase tracking-[0.2em] mb-1">Refer & Earn</p>
                <p className="font-display font-black italic text-white text-xl leading-tight mb-1">
                  Build with Neighbors
                </p>
                <p className="text-emerald-100/70 text-[9px] mb-4">
                  Refer a construction site near you → Earn ₹2,000 CONON Gold when they place their first order.
                </p>
                <div className="flex gap-2 mb-4">
                  <div className="flex-1 bg-white/10 rounded-[14px] px-3 py-2 text-center">
                    <p className="font-black text-white text-base">₹6,000</p>
                    <p className="text-[7px] text-emerald-200 font-bold">Total Earned</p>
                  </div>
                  <div className="flex-1 bg-white/10 rounded-[14px] px-3 py-2 text-center">
                    <p className="font-black text-white text-base">3</p>
                    <p className="text-[7px] text-emerald-200 font-bold">Referrals</p>
                  </div>
                  <div className="flex-1 bg-white/10 rounded-[14px] px-3 py-2 text-center">
                    <p className="font-black text-white text-base">2</p>
                    <p className="text-[7px] text-emerald-200 font-bold">Active Sites</p>
                  </div>
                </div>
                <button onClick={() => setShowRef(true)}
                  className="w-full py-3 rounded-[16px] bg-white font-black text-[10px] uppercase flex items-center justify-center gap-2"
                  style={{ color: "#064e3b" }}>
                  <Gift className="w-4 h-4" /> Share Referral Code
                </button>
              </div>
              <div className="absolute -right-8 -top-8 w-28 h-28 bg-white/10 rounded-full blur-2xl" />
            </div>

            {/* Your referral code inline */}
            <div className="bg-white rounded-[22px] p-4 border border-slate-100 shadow-sm">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Your Unique Code</p>
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-50 rounded-[14px] px-4 py-3 font-black text-lg tracking-[0.15em] text-center"
                  style={{ color: BRAND_DARK }}>
                  CONON500
                </div>
                <button onClick={() => { navigator.clipboard?.writeText("CONON500"); toast.success("Code copied!"); }}
                  className="px-4 rounded-[14px] text-white text-[9px] font-black flex items-center gap-1"
                  style={{ background: BRAND_DARK }}>
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
            </div>

            {/* Referred sites */}
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Your Referred Sites</p>
              <div className="space-y-2.5">
                {REFERRALS.map((r, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center justify-between p-3.5 bg-white rounded-[20px] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-[12px] flex items-center justify-center text-white text-[10px] font-black"
                        style={{ background: r.status === "Active" ? EMERALD : "#94a3b8" }}>
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-800 leading-tight">{r.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full"
                            style={{
                              background: r.status === "Active" ? "#ecfdf5" : "#f1f5f9",
                              color: r.status === "Active" ? "#059669" : "#94a3b8",
                            }}>
                            {r.status}
                          </span>
                          {r.orders > 0 && (
                            <span className="text-[7px] font-bold text-slate-400">{r.orders} orders</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-black italic" style={{ color: r.earned === "—" ? "#94a3b8" : EMERALD }}>
                      {r.earned}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Community shipping reminder */}
            <div className="flex items-center gap-3 p-4 rounded-[22px]" style={{ background: "#ecfdf5" }}>
              <Truck className="w-5 h-5 shrink-0 text-emerald-600" />
              <div>
                <p className="text-[9px] font-black text-emerald-800 uppercase">Community Shipping Bonus</p>
                <p className="text-[8px] text-emerald-600 font-bold">
                  When your referral orders on the same day as you — both get FREE delivery!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════ REFERRAL OVERLAY ═══════════════ */}
      <AnimatePresence>
        {showReferral && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col"
            style={{ background: "rgba(15,23,42,0.96)" }}>
            <div className="flex-1 flex flex-col px-6 pt-14 pb-6">
              <div className="flex justify-between items-center mb-10">
                <p className="font-display font-black italic text-white text-xl uppercase tracking-widest">Refer &amp; Earn</p>
                <button onClick={() => setShowRef(false)}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.15 }}
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                  style={{ background: AMBER, boxShadow: `0 0 40px rgba(245,158,11,0.4)` }}>
                  <Gift className="w-10 h-10" style={{ color: BRAND_DARK }} />
                </motion.div>
                <p className="font-display font-black italic text-white text-2xl leading-tight mb-3">
                  REFER A SITE,<br/>GET REWARDED.
                </p>
                <p className="text-slate-400 text-[10px] font-bold uppercase leading-relaxed mb-8 max-w-xs">
                  When your neighbor starts construction using your link, we credit ₹2,000 to your CONON Gold Wallet.
                </p>

                <div className="w-full bg-white/5 border border-white/10 p-5 rounded-[28px] mb-6">
                  <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-3">Your Unique Code</p>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-white rounded-[14px] px-4 py-3.5 font-black text-xl tracking-[0.15em] text-center"
                      style={{ color: BRAND_DARK }}>
                      CONON500
                    </div>
                    <button onClick={() => { navigator.clipboard?.writeText("CONON500"); toast.success("Copied!"); }}
                      className="px-5 rounded-[14px] text-white text-[9px] font-black"
                      style={{ background: "#3b82f6" }}>
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => { toast.success("WhatsApp share link generated!"); setShowRef(false); }}
                className="w-full py-4 rounded-[22px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                style={{ background: AMBER, color: BRAND_DARK, boxShadow: `0 8px 32px rgba(245,158,11,0.3)` }}>
                <Share2 className="w-4 h-4" /> Share Link via WhatsApp
              </button>
            </div>
          </motion.div>
        )}

        {/* ═══════════════ ADD MONEY SHEET ═══════════════ */}
        {showAddMoney && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col justify-end"
            style={{ background: "rgba(15,23,42,0.6)" }}
            onClick={() => setShowAddMoney(false)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-[32px] px-6 pt-6 pb-8">
              <div className="flex justify-between items-center mb-5">
                <p className="font-display font-black italic text-xl uppercase tracking-wide" style={{ color: BRAND_DARK }}>
                  Add Money
                </p>
                <button onClick={() => setShowAddMoney(false)}
                  className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              {/* Amount input */}
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Enter Amount</p>
              <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-200 rounded-[18px] px-4 py-3 mb-3 focus-within:border-amber-400 transition">
                <span className="text-2xl font-black" style={{ color: BRAND_DARK }}>₹</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={100000}
                  value={addAmount || ""}
                  onChange={(e) => setAddAmount(Number(e.target.value))}
                  placeholder="0"
                  className="flex-1 bg-transparent outline-none text-2xl font-black tracking-tight"
                  style={{ color: BRAND_DARK }}
                />
              </div>

              {/* Presets */}
              <div className="grid grid-cols-4 gap-2 mb-5">
                {ADD_PRESETS.map(p => (
                  <button key={p} onClick={() => setAddAmount(p)}
                    className="py-2.5 rounded-[14px] text-[11px] font-black border-2 transition active:scale-95"
                    style={addAmount === p
                      ? { background: AMBER, borderColor: AMBER, color: BRAND_DARK }
                      : { background: "#fff", borderColor: "#e2e8f0", color: "#475569" }}>
                    ₹{p.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>

              {/* Payment method */}
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Method</p>
              <div className="space-y-2 mb-6">
                {PAY_METHODS.map(m => (
                  <button key={m.id} onClick={() => setPayMethod(m.id)}
                    className="w-full flex items-center justify-between p-3.5 rounded-[16px] border-2 transition active:scale-[0.99]"
                    style={payMethod === m.id
                      ? { borderColor: BRAND_DARK, background: "#1b436608" }
                      : { borderColor: "#e2e8f0", background: "#fff" }}>
                    <div className="text-left">
                      <p className="text-[12px] font-black" style={{ color: BRAND_DARK }}>{m.label}</p>
                      <p className="text-[9px] font-bold text-slate-400">{m.sub}</p>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                      style={{ borderColor: payMethod === m.id ? BRAND_DARK : "#cbd5e1" }}>
                      {payMethod === m.id && <div className="w-2.5 h-2.5 rounded-full" style={{ background: BRAND_DARK }} />}
                    </div>
                  </button>
                ))}
              </div>

              <button onClick={handleAddMoney}
                disabled={!addAmount || addAmount <= 0}
                className="w-full py-4 rounded-[22px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-40 transition active:scale-[0.99]"
                style={{ background: AMBER, color: BRAND_DARK, boxShadow: `0 8px 32px rgba(245,158,11,0.3)` }}>
                <Plus className="w-4 h-4" strokeWidth={3} />
                Add ₹{(addAmount || 0).toLocaleString("en-IN")}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
