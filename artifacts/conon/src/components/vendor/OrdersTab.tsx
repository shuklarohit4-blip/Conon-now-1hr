import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Truck,
  Inbox,
  PhoneCall,
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  PackageCheck,
  Store,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { useVendorLanguage } from "@/context/VendorLanguageContext";
import { useVendor } from "@/context/VendorContext";
import { type VendorOrder } from "@/lib/vendorApi";
import { GREEN, inr } from "./theme";
import { resolveVendorImg } from "@/context/VendorContext";

type FilterTab = "all" | "new" | "packing" | "completed";

export function OrdersTab() {
  const { t, lang } = useVendorLanguage();
  const { orders, acceptOrder, markReady, flagShortage } = useVendor();
  const [filter, setFilter] = useState<FilterTab>("all");
  const [shortageOrderId, setShortageOrderId] = useState<string | null>(null);
  const [shortageReason, setShortageReason] = useState("");

  const filteredOrders = orders.filter((o) => {
    if (filter === "new") return o.status === "new" || o.rawStatus === "NEW_REQUEST";
    if (filter === "packing") return o.status === "packing" || o.rawStatus === "PACKING_READY";
    if (filter === "completed") return o.status === "ready" || o.rawStatus === "HANDED_OVER" || o.rawStatus === "DELIVERED";
    return true;
  });

  const handleAccept = async (order: VendorOrder) => {
    try {
      await acceptOrder(order.id);
      toast.success(t("orderAccepted"), { description: `${order.shortId} · ${order.buyer}` });
    } catch {
      toast.error("Could not accept order");
    }
  };

  const handleReady = async (order: VendorOrder) => {
    try {
      await markReady(order.id);
      toast.success(t("orderReady"), {
        description: `${order.shortId} · Credited to Paisa Meter!`,
      });
    } catch {
      toast.error("Could not mark order ready");
    }
  };

  const handleFlagSubmit = async () => {
    if (!shortageOrderId) return;
    try {
      await flagShortage(shortageOrderId, shortageReason || "Stock Shortage at Store");
      toast.warning("Shortage reported to Admin War Room");
      setShortageOrderId(null);
      setShortageReason("");
    } catch {
      toast.error("Failed to flag shortage");
    }
  };

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      {/* ── FILTER PILLS ── */}
      <div className="flex gap-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto scrollbar-none">
        {(
          [
            { id: "all", label: "All Orders", count: orders.length },
            {
              id: "new",
              label: "New (Ringing)",
              count: orders.filter((o) => o.status === "new" || o.rawStatus === "NEW_REQUEST").length,
            },
            {
              id: "packing",
              label: "Packing / Rider",
              count: orders.filter((o) => o.status === "packing" || o.rawStatus === "PACKING_READY").length,
            },
            {
              id: "completed",
              label: "Completed",
              count: orders.filter((o) => o.status === "ready" || o.rawStatus === "HANDED_OVER" || o.rawStatus === "DELIVERED").length,
            },
          ] as const
        ).map((tab) => {
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? "bg-white text-emerald-800 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[9px] ${
                    tab.id === "new"
                      ? "bg-rose-500 text-white animate-pulse"
                      : isActive
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── ORDERS LIST ── */}
      <div className="space-y-3.5">
        <AnimatePresence mode="popLayout">
          {filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-3xl border-2 border-dashed border-slate-200 py-12 text-center bg-white"
            >
              <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t("noOrders")}</p>
            </motion.div>
          ) : (
            filteredOrders.map((order) => {
              const isNew = order.status === "new" || order.rawStatus === "NEW_REQUEST";
              const isPacking = order.status === "packing" || order.rawStatus === "PACKING_READY";
              const isHandedOver = order.status === "ready" || order.rawStatus === "HANDED_OVER" || order.rawStatus === "DELIVERED";
              const isShortage = order.rawStatus === "FLAGGED_SHORTAGE";

              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3"
                >
                  {/* Order Top Bar */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-black text-xs text-slate-900">
                          #{order.shortId}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            isNew
                              ? "bg-rose-100 text-rose-700 animate-pulse"
                              : isPacking
                              ? "bg-amber-100 text-amber-800"
                              : isShortage
                              ? "bg-red-100 text-red-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {isNew ? "New Order (3m SLA)" : isPacking ? "Packing & Rider" : isShortage ? "Shortage Flagged" : "Handed Over"}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">{order.customerName || order.buyer}</p>
                      <p className="text-[10px] text-slate-400 truncate">{order.deliveryArea || "Lucknow Site"}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{order.time}</p>
                      <p className="text-sm font-display font-black text-emerald-800 mt-0.5">
                        {inr(order.totalDealerPayout || order.value)}
                      </p>
                      <span className="text-[8px] font-bold text-emerald-600 block">Dealer Payout</span>
                    </div>
                  </div>

                  {/* Itemized Materials */}
                  <div className="space-y-2">
                    {order.itemsDetailed && order.itemsDetailed.length > 0 ? (
                      order.itemsDetailed.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                          <img
                            src={resolveVendorImg(item.name, item.image)}
                            alt={item.name}
                            className="w-10 h-10 object-contain rounded-xl bg-white p-1 border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 leading-tight truncate">{item.name}</p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                              <span className="font-black text-slate-700">{item.qty} {item.unit}</span>
                              <span>•</span>
                              <span>Payout: ₹{item.dealerPayout}/{item.unit}</span>
                            </div>
                            {item.batchGuardrail && (
                              <span className="inline-flex items-center gap-1 text-[8px] font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.2 rounded-md mt-1">
                                <ShieldCheck className="w-2.5 h-2.5" /> {item.batchGuardrail}
                              </span>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-display font-black text-slate-900">
                              {inr(item.dealerPayout * item.qty)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-slate-50 p-2.5 rounded-2xl text-xs font-bold text-slate-700">
                        {order.items}
                      </div>
                    )}
                  </div>

                  {/* Rider & Pickup OTP Box (for Packing / Ready orders) */}
                  {(isPacking || isHandedOver) && order.rider && (
                    <div className="bg-slate-900 text-white rounded-2xl p-3 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-emerald-400" />
                          <div>
                            <p className="text-xs font-bold text-white leading-none">
                              Rider: {order.rider.name}
                            </p>
                            <p className="text-[9px] text-slate-400 mt-0.5">
                              {order.rider.vehicleLabel} • {order.rider.plateNumber}
                            </p>
                          </div>
                        </div>

                        <a
                          href={`tel:${order.rider.phone}`}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-slate-700"
                        >
                          <PhoneCall className="w-3 h-3" /> Call
                        </a>
                      </div>

                      {/* 4-Digit OTP Box */}
                      <div className="bg-slate-800 p-2.5 rounded-xl flex items-center justify-between border border-slate-700">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                            <KeyRound className="w-3 h-3" /> Pickup Verification OTP
                          </p>
                          <p className="text-[9px] text-slate-400">Rider ko yeh code verify karwayen</p>
                        </div>
                        <div className="flex gap-1">
                          {(order.pickupOtp || "4829").split("").map((ch, i) => (
                            <span
                              key={i}
                              className="w-7 h-8 rounded-lg bg-emerald-500 text-slate-950 font-display font-black text-base flex items-center justify-center shadow"
                            >
                              {ch}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {isNew && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleAccept(order)}
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition active:scale-95"
                      >
                        <CheckCircle className="w-4 h-4" /> {t("acceptOrder")}
                      </button>
                      <button
                        onClick={() => setShortageOrderId(order.id)}
                        className="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-2xl text-[10px] font-black uppercase tracking-wider border border-rose-200 transition"
                      >
                        Flag Shortage
                      </button>
                    </div>
                  )}

                  {isPacking && (
                    <button
                      onClick={() => handleReady(order)}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition active:scale-95"
                    >
                      <PackageCheck className="w-4 h-4" /> Mark Handed Over to Rider
                    </button>
                  )}

                  {isHandedOver && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Handed Over — {inr(order.totalDealerPayout || order.value)} Credited to Wallet
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Flag Shortage Modal */}
      <AnimatePresence>
        {shortageOrderId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-3"
            >
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-display font-black text-sm text-slate-900">Report Material Shortage</h3>
              </div>
              <p className="text-xs text-slate-500">
                Notify Admin War Room immediately so the order can be routed to an alternate nearby Lucknow hub.
              </p>
              <textarea
                value={shortageReason}
                onChange={(e) => setShortageReason(e.target.value)}
                placeholder="E.g. Only 5 bags left, torn packaging, factory seal broken..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:ring-2 ring-rose-400"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShortageOrderId(null)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFlagSubmit}
                  className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold"
                >
                  Submit Alert
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
