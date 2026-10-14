import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, X, Loader2, AlertTriangle, BellRing } from "lucide-react";
import { toast } from "sonner";
import { vendorApi } from "@/lib/vendorApi";
import { apiErrorMessage } from "@/lib/api";
import { playOrderChime } from "@/lib/sound";
import {
  VendorLanguageProvider,
  useVendorLanguage,
} from "@/context/VendorLanguageContext";
import { VendorProvider, useVendor } from "@/context/VendorContext";
import { VendorHeader } from "@/components/vendor/VendorHeader";
import { VendorNav } from "@/components/vendor/VendorNav";
import { DashboardTab } from "@/components/vendor/DashboardTab";
import { OrdersTab } from "@/components/vendor/OrdersTab";
import { ProductsTab } from "@/components/vendor/ProductsTab";
import { InventoryTab } from "@/components/vendor/InventoryTab";
import { KhataTab } from "@/components/vendor/KhataTab";
import { GREEN, inr, type VendorTab } from "@/components/vendor/theme";
import { JWT_STORAGE_KEY } from "@/lib/authApi";
import { joinVendorRoom, onNewOrder, type IncomingVendorOrder } from "@/lib/realtime";

export function VendorDashboard() {
  return (
    <VendorLanguageProvider>
      <VendorProvider>
        <VendorDashboardInner />
      </VendorProvider>
    </VendorLanguageProvider>
  );
}

function VendorDashboardInner() {
  const { t } = useVendorLanguage();
  const { addIncomingOrder, loading, error, refresh } = useVendor();

  const [activeTab, setActiveTab] = useState<VendorTab>("dashboard");
  const [isOnline, setIsOnline] = useState(true);
  const [alertOrder, setAlertOrder] = useState<IncomingVendorOrder | null>(null);
  const [simulating, setSimulating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  /* Orders we've already announced (chime + toast) — guards against the same
     order arriving via both the optimistic Test-Order path and the socket echo. */
  const announced = useRef<Set<string>>(new Set());

  /* Add an order to the board (deduped in context) and announce it once. */
  const handleIncomingOrder = useCallback(
    (order: IncomingVendorOrder) => {
      addIncomingOrder({
        id: order.id,
        shortId: order.shortId,
        buyer: order.buyer,
        items: order.items,
        time: order.time,
        value: order.value,
        status: "new",
      });
      if (announced.current.has(order.id)) return;
      announced.current.add(order.id);
      playOrderChime();
      setAlertOrder(order);
      toast(`🔔 ${t("newOrderToast")}`, {
        description: `${order.buyer} — ${order.items} · ${inr(order.value)}`,
        duration: 7000,
      });
    },
    [addIncomingOrder, t],
  );

  /* Real-time: join the vendor's room and react to live orders. */
  useEffect(() => {
    const token = localStorage.getItem(JWT_STORAGE_KEY);
    if (!token) return;
    const leaveRoom = joinVendorRoom(token);
    const off = onNewOrder(handleIncomingOrder);
    return () => {
      leaveRoom();
      off();
    };
  }, [handleIncomingOrder]);

  /* Module 3: "Test New Order" — create a real order on the server and react
     to it exactly like a live one (chime + banner + board card). */
  const handleTestOrder = useCallback(async () => {
    if (simulating) return;
    setSimulating(true);
    try {
      const order = await vendorApi.simulateOrder();
      handleIncomingOrder(order);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSimulating(false);
    }
  }, [simulating, handleIncomingOrder]);

  /* Scroll the body back to top whenever the tab changes. */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [activeTab]);

  const goToTab = (tab: VendorTab) => setActiveTab(tab);

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center">
      <div className="w-full max-w-[480px] bg-slate-50 min-h-screen relative flex flex-col shadow-2xl overflow-hidden">
        <VendorHeader isOnline={isOnline} setIsOnline={setIsOnline} />

        {/* Incoming order alert banner */}
        <AnimatePresence>
          {alertOrder && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-4 mt-4 p-4 rounded-[24px] border-2 border-green-200 bg-green-50 flex items-center gap-3 shrink-0"
            >
              <Volume2 className="w-5 h-5 text-green-600 animate-pulse shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-black text-green-900 text-sm leading-tight truncate">
                  {t("newOrderToast")} — {alertOrder.buyer}
                </p>
                <p className="text-[10px] text-green-600 font-semibold truncate">
                  {alertOrder.items} · {inr(alertOrder.value)}
                </p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    setAlertOrder(null);
                    setActiveTab("orders");
                  }}
                  className="px-3 py-2 rounded-xl text-white text-[9px] font-black leading-tight max-w-[120px]"
                  style={{ background: GREEN }}
                >
                  {t("liveOrders")}
                </button>
                <button
                  onClick={() => setAlertOrder(null)}
                  className="p-1.5 rounded-xl bg-white border border-green-100 text-green-500 self-start"
                  aria-label="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scrollable tab body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="w-7 h-7 animate-spin" style={{ color: GREEN }} />
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t("loadingStore")}</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 px-8 text-center">
              <AlertTriangle className="w-7 h-7 text-amber-500" />
              <p className="text-[12px] font-bold text-slate-500">{error}</p>
              <button
                onClick={() => refresh()}
                className="mt-2 px-5 py-3 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest"
                style={{ background: GREEN }}
              >
                {t("retry")}
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "dashboard" && <DashboardTab onNavigate={goToTab} />}
                {activeTab === "orders" && <OrdersTab />}
                {activeTab === "products" && <ProductsTab onAdded={() => setActiveTab("inventory")} />}
                {activeTab === "inventory" && <InventoryTab />}
                {activeTab === "khata" && <KhataTab />}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Module 3: Test New Order — floating demo trigger */}
        <motion.button
          onClick={handleTestOrder}
          disabled={simulating}
          whileTap={{ scale: 0.92 }}
          className="absolute right-4 bottom-24 z-40 flex items-center gap-2 pl-3.5 pr-4 py-3 rounded-full text-white shadow-2xl disabled:opacity-70"
          style={{ background: GREEN, boxShadow: "0 10px 30px rgba(21,128,61,0.45)" }}
          aria-label={t("testNewOrder")}
        >
          {simulating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <span className="relative flex">
              <BellRing className="w-4 h-4" strokeWidth={2.6} />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-300 animate-ping" />
            </span>
          )}
          <span className="text-[10px] font-black uppercase tracking-wide leading-tight max-w-[110px]">
            {simulating ? t("simulatingOrder") : t("testNewOrder")}
          </span>
        </motion.button>

        <VendorNav active={activeTab} onChange={goToTab} />
      </div>
    </div>
  );
}
