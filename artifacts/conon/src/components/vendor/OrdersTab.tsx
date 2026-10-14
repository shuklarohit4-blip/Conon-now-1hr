import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, PackageCheck, Truck, Inbox } from "lucide-react";
import { toast } from "sonner";
import { useVendorLanguage } from "@/context/VendorLanguageContext";
import { useVendor, type OrderStatus, type VendorOrder } from "@/context/VendorContext";
import { apiErrorMessage } from "@/lib/api";
import { GREEN, inr } from "./theme";

const COLUMNS: { status: OrderStatus; tint: string; color: string; icon: typeof Inbox }[] = [
  { status: "new",     tint: "#dcfce7", color: "#15803d", icon: Inbox },
  { status: "packing", tint: "#fef9c3", color: "#a16207", icon: PackageCheck },
  { status: "ready",   tint: "#dbeafe", color: "#1d4ed8", icon: Truck },
];

export function OrdersTab() {
  const { t } = useVendorLanguage();
  const { orders, acceptOrder, markReady } = useVendor();

  const colLabel: Record<OrderStatus, string> = {
    new: t("statusNew"),
    packing: t("packing"),
    ready: t("readyForPickup"),
  };

  const handleAccept = async (order: VendorOrder) => {
    try {
      await acceptOrder(order.id);
      toast.success(t("orderAccepted"), { description: `${order.shortId} · ${order.buyer}` });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };
  const handleReady = async (order: VendorOrder) => {
    try {
      await markReady(order.id);
      toast.success(t("orderReady"), { description: `${order.shortId} · ${order.buyer}` });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <div className="px-4 pt-5 space-y-6">
      {COLUMNS.map((col) => {
        const colOrders = orders.filter((o) => o.status === col.status);
        return (
          <div key={col.status}>
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: col.tint }}>
                <col.icon className="w-4 h-4" style={{ color: col.color }} strokeWidth={2.6} />
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-widest italic" style={{ color: col.color }}>
                {colLabel[col.status]}
              </h3>
              <span
                className="text-[9px] font-black text-white px-2 py-0.5 rounded-full leading-none"
                style={{ background: col.color }}
              >
                {colOrders.length}
              </span>
            </div>

            <div className="space-y-2.5 min-h-[56px]">
              <AnimatePresence mode="popLayout">
                {colOrders.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded-[22px] border-2 border-dashed border-slate-100 py-5 text-center"
                  >
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{t("noOrders")}</p>
                  </motion.div>
                ) : (
                  colOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, x: 40 }}
                      transition={{ type: "spring", damping: 26, stiffness: 280 }}
                      className="bg-white rounded-[22px] p-3.5 border border-slate-100 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-slate-800 text-sm leading-tight">{order.buyer}</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            {order.shortId} · {order.items} · {order.time}
                          </p>
                          <p className="text-[12px] font-black italic mt-1" style={{ color: GREEN }}>
                            {inr(order.value)}
                          </p>
                        </div>
                      </div>

                      {order.status === "new" && (
                        <button
                          onClick={() => handleAccept(order)}
                          className="mt-3 w-full py-2.5 rounded-xl text-white text-[10px] font-black uppercase tracking-wide flex items-center justify-center gap-1.5"
                          style={{ background: GREEN }}
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> {t("acceptOrder")}
                        </button>
                      )}
                      {order.status === "packing" && (
                        <button
                          onClick={() => handleReady(order)}
                          className="mt-3 w-full py-2.5 rounded-xl text-white text-[10px] font-black uppercase tracking-wide flex items-center justify-center gap-1.5"
                          style={{ background: "#1d4ed8" }}
                        >
                          <Truck className="w-3.5 h-3.5" /> {t("markReady")}
                        </button>
                      )}
                      {order.status === "ready" && (
                        <div className="mt-3 w-full py-2.5 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wide flex items-center justify-center gap-1.5">
                          <PackageCheck className="w-3.5 h-3.5" /> {t("awaitingPickup")}
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}
