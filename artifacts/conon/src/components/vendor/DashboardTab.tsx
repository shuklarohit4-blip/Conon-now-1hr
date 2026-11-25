import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Package,
  Wallet,
  TrendingUp,
  ChevronRight,
  BellRing,
  CheckCircle,
  Truck,
  PhoneCall,
  KeyRound,
  ShieldCheck,
  Zap,
  Store,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useVendorLanguage } from "@/context/VendorLanguageContext";
import { useVendor } from "@/context/VendorContext";
import { GREEN, GREEN_DARK, inr, inrShort, type VendorTab } from "./theme";
import { playOrderChime } from "@/lib/sound";

export function DashboardTab({ onNavigate }: { onNavigate: (tab: VendorTab) => void }) {
  const { t, lang } = useVendorLanguage();
  const {
    vendor,
    orders,
    balance,
    totalEarned,
    newOrdersCount,
    inStockCount,
    outOfStockCount,
    acceptOrder,
    markReady,
    simulateTestOrder,
  } = useVendor();

  const [simulating, setSimulating] = useState(false);

  // Active ringing order (newest order waiting for acceptance)
  const ringingOrder = useMemo(
    () => orders.find((o) => o.status === "new" || o.rawStatus === "NEW_REQUEST"),
    [orders],
  );

  // Active rider pickup order (order being packed or ready for pickup)
  const activePickupOrder = useMemo(
    () => orders.find((o) => o.status === "packing" || o.rawStatus === "PACKING_READY" || o.status === "ready"),
    [orders],
  );

  // Auto chime when a ringing order is present
  useEffect(() => {
    if (ringingOrder) {
      try {
        playOrderChime();
      } catch {
        // audio policy safe
      }
    }
  }, [ringingOrder?.id]);

  const handleQuickAccept = async (orderId: string) => {
    try {
      await acceptOrder(orderId);
      toast.success(t("orderAccepted"), { description: `Order ${orderId} is now in packing` });
    } catch {
      toast.error("Could not accept order");
    }
  };

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      playOrderChime();
      const newOrd = await simulateTestOrder();
      toast.success(lang === "hi" ? "Naya Order Aaya Hai! (घंटी बजी)" : "New Order Received! Ringing...", {
        description: `${newOrd.items} • ₹${newOrd.totalDealerPayout || newOrd.value}`,
      });
    } catch {
      toast.error("Failed to simulate test order");
    } finally {
      setSimulating(false);
    }
  };

  /* Smart Vendor Insights */
  const insights = useMemo(() => {
    const list: { icon: string; text: string; tab: VendorTab }[] = [];
    if (ringingOrder) {
      list.push({
        icon: "🚨",
        text:
          lang === "hi"
            ? "Naya order aaya hai — 3 minute ke andar accept karein!"
            : "New customer order waiting — accept within 3 mins to maintain SLA!",
        tab: "orders",
      });
    }
    if (outOfStockCount > 0) {
      list.push({
        icon: "⚠️",
        text:
          lang === "hi"
            ? `${outOfStockCount} saman out of stock — turant restock karein, order na choote`
            : `${outOfStockCount} items out of stock — update stock to capture local demand`,
        tab: "products",
      });
    }
    if (balance > 0) {
      list.push({
        icon: "💰",
        text:
          lang === "hi"
            ? `${inr(balance)} withdrawal ke liye taiyar — 1-click bank settlement`
            : `${inr(balance)} ready for T+1 bank payout — tap to withdraw`,
        tab: "payouts",
      });
    }
    list.push(
      {
        icon: "⚡",
        text:
          lang === "hi"
            ? "Lucknow Express Corridor: Shaheed Path & Gomti Nagar mein demand tezi par"
            : "Lucknow Express Corridor: High demand on Shaheed Path & Gomti Nagar",
        tab: "orders",
      },
      {
        icon: "📦",
        text:
          lang === "hi"
            ? "Single-Dye Lot verification: Tiles & paint batch verify karke rider ko dein"
            : "Quality Guardrail: Check fresh batch and seal integrity before handover",
        tab: "products",
      },
    );
    return list;
  }, [ringingOrder, outOfStockCount, balance, lang]);

  const [insightIdx, setInsightIdx] = useState(0);
  useEffect(() => {
    if (insights.length <= 1) return;
    const tm = setInterval(() => setInsightIdx((i) => (i + 1) % insights.length), 4500);
    return () => clearInterval(tm);
  }, [insights.length]);

  const activeInsight = insights[insightIdx] ?? insights[0];

  const todaysEarnings = orders.reduce((s, o) => s + (o.totalDealerPayout || o.value || 0), 0);
  const totalStockCount = inStockCount + outOfStockCount;
  const stockPercentage = totalStockCount > 0 ? Math.round((inStockCount / totalStockCount) * 100) : 100;

  return (
    <div className="px-4 pt-4 pb-20 space-y-4">
      {/* ── PRIORITY 1: RINGING NEW ORDER BANNER (Top Urgency) ── */}
      <AnimatePresence>
        {ringingOrder && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="rounded-3xl p-4 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 text-white shadow-xl ring-4 ring-amber-300/40 relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white text-rose-600 flex items-center justify-center animate-bounce shadow-md">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-black uppercase tracking-wider">
                      3 MIN SLA
                    </span>
                    <span className="text-[10px] font-bold text-amber-100">
                      {ringingOrder.placedAt || ringingOrder.time || "Just now"}
                    </span>
                  </div>
                  <h3 className="font-display font-black italic text-base leading-tight mt-0.5">
                    {lang === "hi" ? "Naya Order Ringing!" : "Incoming Order Ringing!"}
                  </h3>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[9px] uppercase tracking-wider text-amber-100 font-bold">Guaranteed Payout</p>
                <p className="text-lg font-display font-black text-white leading-tight">
                  {inr(ringingOrder.totalDealerPayout || ringingOrder.value)}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between text-xs relative z-10">
              <div className="min-w-0 flex-1 pr-2">
                <p className="font-bold text-white truncate">{ringingOrder.items}</p>
                <p className="text-[10px] text-amber-100 truncate">{ringingOrder.deliveryArea || "Lucknow Site"}</p>
              </div>
              <button
                onClick={() => handleQuickAccept(ringingOrder.id)}
                className="px-4 py-2.5 bg-white text-slate-900 hover:bg-emerald-50 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 shrink-0 transition active:scale-95"
              >
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Accept & Pack
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PRIORITY 2: INCOMING RIDER RADAR & 4-DIGIT PICKUP OTP ── */}
      {activePickupOrder && (
        <div className="bg-slate-900 text-white rounded-3xl p-4 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Truck className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Rider En Route to Dukaan
                </span>
                <p className="font-display font-black text-sm text-white leading-tight">
                  {activePickupOrder.rider?.name || "Ravi Kumar"} ({activePickupOrder.rider?.vehicleLabel || "2-Wheeler Express"})
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="px-2 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-[10px] font-black">
                ETA {activePickupOrder.rider?.etaMins || 5} Mins
              </span>
            </div>
          </div>

          {/* 4-Digit Pickup OTP Box */}
          <div className="bg-slate-800/90 rounded-2xl p-3 border border-slate-700 mb-3 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <KeyRound className="w-3 h-3 text-amber-400" /> 4-Digit Pickup OTP
              </p>
              <p className="text-[10px] text-slate-300 font-medium mt-0.5">
                Verify with rider before material release
              </p>
            </div>
            <div className="flex gap-1.5">
              {(activePickupOrder.pickupOtp || "4829").split("").map((digit, idx) => (
                <span
                  key={idx}
                  className="w-8 h-10 rounded-xl bg-emerald-500 text-slate-950 font-display font-black text-xl flex items-center justify-center shadow-md ring-2 ring-emerald-300/30"
                >
                  {digit}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <span className="font-bold text-slate-200">{activePickupOrder.rider?.plateNumber || "UP 32 BK 4012"}</span>
              <span>•</span>
              <span>{activePickupOrder.rider?.distanceKm || 1.1} km away</span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${activePickupOrder.rider?.phone || "9415012044"}`}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-[10px] font-bold flex items-center gap-1 border border-slate-700 transition"
              >
                <PhoneCall className="w-3 h-3 text-emerald-400" /> Call Rider
              </a>

              {activePickupOrder.status === "packing" && (
                <button
                  onClick={async () => {
                    try {
                      await markReady(activePickupOrder.id);
                      toast.success("Order marked Ready & Handed Over to Rider!");
                    } catch {
                      toast.error("Failed to mark order ready");
                    }
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md transition"
                >
                  Mark Handed Over
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SMART AI DUKANDAR INSIGHTS BANNER ── */}
      <button
        onClick={() => onNavigate(activeInsight.tab)}
        className="w-full text-left bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-sm transition hover:shadow-md active:scale-[0.99]"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xl shrink-0">{activeInsight.icon}</span>
          <p className="text-xs font-bold text-emerald-950 truncate">{activeInsight.text}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-emerald-700 shrink-0" />
      </button>

      {/* ── 4 CORE PERFORMANCE METRICS ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[9px] font-black uppercase tracking-wider">Today's Orders</span>
            <ClipboardList className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-display font-black text-slate-900">{orders.length}</p>
          <p className="text-[10px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +100% vs yesterday
          </p>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[9px] font-black uppercase tracking-wider">Today's Earning</span>
            <Wallet className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-display font-black text-slate-900">{inr(todaysEarnings)}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-1">
            T+1 Auto-Credit
          </p>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[9px] font-black uppercase tracking-wider">Stock Ready</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-display font-black text-slate-900">{stockPercentage}%</p>
          <p className="text-[10px] font-bold text-slate-500 mt-1">
            {inStockCount} active / {totalStockCount} SKUs
          </p>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[9px] font-black uppercase tracking-wider">Express SLA</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-display font-black text-emerald-600">{vendor?.slaScore || 98.4}%</p>
          <p className="text-[10px] font-bold text-slate-400 mt-1">
            Rating: {vendor?.rating || 4.9} ⭐ (Top Tier)
          </p>
        </div>
      </div>

      {/* ── QUICK ACTION SHORTCUTS ── */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={handleSimulate}
          disabled={simulating}
          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-2xl p-3 text-center transition active:scale-95 flex flex-col items-center justify-center gap-1.5"
        >
          <BellRing className={`w-5 h-5 text-emerald-700 ${simulating ? "animate-spin" : ""}`} />
          <span className="text-[10px] font-black uppercase tracking-wider leading-tight">
            {simulating ? "Ringing..." : "Test Order"}
          </span>
        </button>

        <button
          onClick={() => onNavigate("payouts")}
          className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 rounded-2xl p-3 text-center transition active:scale-95 flex flex-col items-center justify-center gap-1.5"
        >
          <Wallet className="w-5 h-5 text-amber-700" />
          <span className="text-[10px] font-black uppercase tracking-wider leading-tight">
            Paisa Nikalein
          </span>
        </button>

        <button
          onClick={() => onNavigate("products")}
          className="bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200/80 rounded-2xl p-3 text-center transition active:scale-95 flex flex-col items-center justify-center gap-1.5"
        >
          <Package className="w-5 h-5 text-blue-700" />
          <span className="text-[10px] font-black uppercase tracking-wider leading-tight">
            Stock Rate
          </span>
        </button>
      </div>

      {/* ── RECENT DISPATCH BOARD ── */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
            {t("recentOrders")}
          </h3>
          <button
            onClick={() => onNavigate("orders")}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            {t("viewAll")} <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {orders.slice(0, 3).map((order) => {
            const isReady = order.status === "ready" || order.rawStatus === "HANDED_OVER";
            const isPacking = order.status === "packing" || order.rawStatus === "PACKING_READY";
            const isNew = order.status === "new" || order.rawStatus === "NEW_REQUEST";

            return (
              <div
                key={order.id}
                onClick={() => onNavigate("orders")}
                className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex items-center justify-between gap-3 cursor-pointer hover:border-slate-200 transition"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs truncate">
                      {order.buyer}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">
                      {order.shortId}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                    {order.items}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-display font-black text-emerald-800">
                    {inr(order.totalDealerPayout || order.value)}
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider mt-1 ${
                      isNew
                        ? "bg-rose-100 text-rose-700"
                        : isPacking
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {isNew ? "New Order" : isPacking ? "Packing" : "Handed Over"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
