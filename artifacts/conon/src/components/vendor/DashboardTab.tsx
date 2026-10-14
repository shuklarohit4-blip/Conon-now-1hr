import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, Package, Wallet, TrendingUp, ChevronRight, AlertTriangle, Sparkles } from "lucide-react";
import { useVendorLanguage } from "@/context/VendorLanguageContext";
import { useVendor } from "@/context/VendorContext";
import { GREEN, GREEN_DARK, inr, inrShort, type VendorTab } from "./theme";

function statusStyle(status: "new" | "packing" | "ready") {
  switch (status) {
    case "new":     return { bg: "#dcfce7", color: "#15803d" };
    case "packing": return { bg: "#fef9c3", color: "#a16207" };
    case "ready":   return { bg: "#dbeafe", color: "#1d4ed8" };
  }
}

interface Insight {
  icon: string;
  text: string;
  tab: VendorTab;
}

export function DashboardTab({ onNavigate }: { onNavigate: (tab: VendorTab) => void }) {
  const { t, lang } = useVendorLanguage();
  const {
    orders,
    balance,
    totalEarned,
    newOrdersCount,
    inStockCount,
    outOfStockCount,
  } = useVendor();

  /* ── Module 6: Smart Vendor Insights ──────────────────────────────
     Context-aware AI tips that react to the live store state. The banner
     rotates through whichever insights currently apply and deep-links to
     the relevant tab when tapped. */
  const insights = useMemo<Insight[]>(() => {
    const list: Insight[] = [];
    if (outOfStockCount > 0) {
      list.push({
        icon: "⚠️",
        text:
          lang === "hi"
            ? `${outOfStockCount} saman out of stock — restock karein, demand miss na ho`
            : `${outOfStockCount} item${outOfStockCount > 1 ? "s" : ""} out of stock — restock to capture demand`,
        tab: "inventory",
      });
    }
    if (newOrdersCount > 0) {
      list.push({
        icon: "🔔",
        text:
          lang === "hi"
            ? `${newOrdersCount} naye order pending — jaldi accept karein`
            : `${newOrdersCount} new order${newOrdersCount > 1 ? "s" : ""} waiting — accept fast to win loyalty`,
        tab: "orders",
      });
    }
    if (balance > 0) {
      list.push({
        icon: "💰",
        text:
          lang === "hi"
            ? `${inr(balance)} nikalne ke liye taiyar — 1-click payout`
            : `${inr(balance)} ready to withdraw — instant 1-click payout`,
        tab: "khata",
      });
    }
    list.push(
      {
        icon: "🔥",
        text:
          lang === "hi"
            ? "Cement ki demand aaj 23% upar — stock taiyar rakhein"
            : "High demand: cement orders up 23% in your area today",
        tab: "inventory",
      },
      {
        icon: "📈",
        text:
          lang === "hi"
            ? "Peak time 8am–11am — is samay stock ready rakhein"
            : "Peak ordering hours are 8–11 AM — keep stock ready",
        tab: "inventory",
      },
      {
        icon: "💡",
        text:
          lang === "hi"
            ? "TMT Steel jodein — aas-paas buyers ise dhoond rahe hain"
            : "Buyers near you are searching TMT Steel — add it to sell more",
        tab: "products",
      },
    );
    return list;
  }, [outOfStockCount, newOrdersCount, balance, lang]);

  const [insightIdx, setInsightIdx] = useState(0);
  useEffect(() => {
    setInsightIdx(0);
  }, [insights.length]);
  useEffect(() => {
    if (insights.length <= 1) return;
    const id = window.setInterval(
      () => setInsightIdx((i) => (i + 1) % insights.length),
      4500,
    );
    return () => window.clearInterval(id);
  }, [insights.length]);
  const activeInsight = insights[insightIdx] ?? insights[0];

  const todaysRevenue = orders.reduce((s, o) => s + o.value, 0);
  const statusLabel = {
    new: t("statusNew"),
    packing: t("packing"),
    ready: t("readyForPickup"),
  } as const;
  const recent = orders.slice(0, 3);

  const stats = [
    { icon: TrendingUp, label: t("todaysRevenue"), value: inrShort(todaysRevenue), tint: "#ecfdf5", color: GREEN },
    { icon: ClipboardList, label: t("newOrders"), value: String(newOrdersCount), tint: "#eff6ff", color: "#2563eb" },
    { icon: Package, label: t("itemsInStock"), value: String(inStockCount), tint: "#fefce8", color: "#a16207" },
    { icon: Wallet, label: t("totalEarned"), value: inrShort(totalEarned), tint: "#f5f3ff", color: "#7c3aed" },
  ];

  return (
    <div className="px-4 pt-5">
      {/* Module 6: Smart Vendor Insights */}
      {activeInsight && (
        <button
          onClick={() => onNavigate(activeInsight.tab)}
          className="w-full mb-5 rounded-[24px] p-[1.5px] text-left overflow-hidden"
          style={{ background: "linear-gradient(110deg, #f59e0b, #f97316, #facc15)" }}
        >
          <div className="rounded-[22px] bg-white px-4 py-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 bg-amber-50">
              <Sparkles className="w-[18px] h-[18px] text-amber-500" strokeWidth={2.6} />
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1">
                {t("smartInsights")}
              </p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={insightIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="text-[11px] font-black text-slate-800 leading-tight"
                >
                  <span className="mr-1">{activeInsight.icon}</span>
                  {activeInsight.text}
                </motion.p>
              </AnimatePresence>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-400 shrink-0" />
          </div>
        </button>
      )}

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-[24px] p-4 border border-slate-100 shadow-sm">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center mb-3" style={{ background: s.tint }}>
              <s.icon className="w-[18px] h-[18px]" style={{ color: s.color }} strokeWidth={2.6} />
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">{s.label}</p>
            <p className="text-2xl font-display font-black italic text-slate-900 leading-none mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Out of stock warning */}
      {outOfStockCount > 0 && (
        <button
          onClick={() => onNavigate("inventory")}
          className="w-full flex items-center gap-3 mb-6 p-4 rounded-[22px] bg-amber-50 border border-amber-200 text-left"
        >
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="flex-1 text-[11px] font-bold text-amber-800 leading-tight">
            {outOfStockCount} {t("outOfStockCount")}
          </p>
          <ChevronRight className="w-4 h-4 text-amber-400 shrink-0" />
        </button>
      )}

      {/* Wallet card */}
      <div
        className="mb-6 rounded-[24px] p-5 text-white shadow-lg"
        style={{ background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})` }}
      >
        <p className="text-[9px] font-black text-green-200 uppercase tracking-widest">{t("balanceDue")}</p>
        <p className="text-3xl font-display font-black italic mt-1">{inr(balance)}</p>
        <button
          onClick={() => onNavigate("khata")}
          className="mt-4 inline-flex items-center gap-1.5 bg-white text-green-800 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wide"
        >
          <Wallet className="w-3.5 h-3.5" /> {t("withdrawFunds")}
        </button>
      </div>

      {/* Quick actions */}
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-3 px-1">
        {t("quickActions")}
      </h3>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => onNavigate("orders")}
          className="flex items-center gap-2.5 p-4 rounded-[22px] bg-white border border-slate-100 shadow-sm text-left"
        >
          <div className="w-9 h-9 rounded-2xl bg-green-50 flex items-center justify-center shrink-0">
            <ClipboardList className="w-[18px] h-[18px]" style={{ color: GREEN }} strokeWidth={2.6} />
          </div>
          <span className="text-[11px] font-black text-slate-700 leading-tight">{t("goToOrders")}</span>
        </button>
        <button
          onClick={() => onNavigate("inventory")}
          className="flex items-center gap-2.5 p-4 rounded-[22px] bg-white border border-slate-100 shadow-sm text-left"
        >
          <div className="w-9 h-9 rounded-2xl bg-green-50 flex items-center justify-center shrink-0">
            <Package className="w-[18px] h-[18px]" style={{ color: GREEN }} strokeWidth={2.6} />
          </div>
          <span className="text-[11px] font-black text-slate-700 leading-tight">{t("goToInventory")}</span>
        </button>
      </div>

      {/* Recent orders */}
      <div className="flex justify-between items-center mb-3 px-1">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{t("recentOrders")}</h3>
        <button onClick={() => onNavigate("orders")} className="text-[9px] font-black uppercase tracking-wide" style={{ color: GREEN }}>
          {t("viewAll")}
        </button>
      </div>
      <div className="space-y-2.5">
        {recent.map((order) => {
          const st = statusStyle(order.status);
          return (
            <motion.div
              key={order.id}
              layout
              onClick={() => onNavigate("orders")}
              className="bg-white rounded-[22px] p-3.5 border border-slate-100 shadow-sm flex items-center gap-3 cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-black text-slate-800 text-sm leading-tight">{order.buyer}</p>
                  <span
                    className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full leading-tight"
                    style={{ background: st.bg, color: st.color }}
                  >
                    {statusLabel[order.status]}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  {order.items} · {order.time}
                </p>
                <p className="text-[11px] font-black italic mt-0.5" style={{ color: GREEN }}>
                  {inr(order.value)}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
