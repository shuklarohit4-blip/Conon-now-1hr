import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { BellRing } from "lucide-react";
import { DriverProvider, useDriver } from "@/context/DriverContext";
import { DriverLanguageProvider, useDriverLanguage } from "@/context/DriverLanguageContext";
import { playOrderChime } from "@/lib/sound";
import { DriverHeader } from "@/components/driver/DriverHeader";
import { DutyDashboard } from "@/components/driver/DutyDashboard";
import { DispatchOverlay } from "@/components/driver/DispatchOverlay";
import { ActiveTrip } from "@/components/driver/ActiveTrip";
import { KamaiTab } from "@/components/driver/KamaiTab";
import { SuccessScreen } from "@/components/driver/SuccessScreen";
import { DriverNav } from "@/components/driver/DriverNav";
import { LanguageToggle } from "@/components/driver/LanguageToggle";
import { GREEN, RED, type DriverTab } from "@/components/driver/theme";

/* ──────────────────────────────────────────────────────────────────────────
   Conon Fleet — Driver Partner App shell.

   Renders the whole journey inside a phone-sized frame and swaps between:
     • Duty / Kamai tabs (when no trip is active)
     • Active Trip flow (full-screen, when a trip is accepted)
     • Success screen (full-screen, right after completion)
   The dispatch alert overlays on top. Everything is React state — no reloads.
   ────────────────────────────────────────────────────────────────────────── */

function DriverShell() {
  const { t } = useDriverLanguage();
  const {
    isOnline,
    activeTrip,
    pendingDispatch,
    toggleDuty,
    requestDispatch,
    acceptDispatch,
    declineDispatch,
  } = useDriver();

  const [tab, setTab] = useState<DriverTab>("duty");
  const [success, setSuccess] = useState<number | null>(null);

  const handleToggleDuty = useCallback(() => {
    const next = toggleDuty();
    if (next === "online") {
      playOrderChime();
      toast.success(`🟢 ${t("onlineToast")}`);
    } else {
      toast(`🔴 ${t("offlineToast")}`);
    }
  }, [toggleDuty, t]);

  const handleTestDispatch = useCallback(() => {
    if (!isOnline) {
      toast.error(t("goOnlineFirst"));
      return;
    }
    const created = requestDispatch();
    if (created) playOrderChime();
  }, [isOnline, requestDispatch, t]);

  const handleAccept = useCallback(() => {
    acceptDispatch();
    playOrderChime();
    toast.success(`✅ ${t("tripAccepted")}`);
  }, [acceptDispatch, t]);

  const handleDecline = useCallback(() => {
    declineDispatch();
    toast(t("declined"));
  }, [declineDispatch, t]);

  const showFab = isOnline && !activeTrip && !pendingDispatch && success === null && tab === "duty";

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center">
      <div className="w-full max-w-[480px] bg-slate-50 min-h-screen relative flex flex-col shadow-2xl overflow-hidden">
        {/* Active trip takes over the whole frame */}
        {activeTrip ? (
          <ActiveTrip onComplete={(earned) => setSuccess(earned)} />
        ) : (
          <>
            <DriverHeader />
            <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                >
                  {tab === "duty" ? <DutyDashboard onToggle={handleToggleDuty} /> : <KamaiTab />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Floating "Test Dispatch" (WebSocket simulation) */}
            <AnimatePresence>
              {showFab && (
                <motion.button
                  key="fab"
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={handleTestDispatch}
                  className="absolute right-4 bottom-24 z-40 flex items-center gap-2 pl-3.5 pr-4 py-3.5 rounded-full text-white shadow-2xl"
                  style={{ background: RED, boxShadow: "0 12px 30px rgba(220,38,38,0.5)" }}
                  aria-label={t("testDispatch")}
                >
                  <span className="relative flex">
                    <BellRing className="w-5 h-5" strokeWidth={2.6} />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-300 animate-ping" />
                  </span>
                  <span className="text-[12px] font-black uppercase tracking-wide leading-tight">
                    {t("testDispatch").split(" (")[0]}
                  </span>
                </motion.button>
              )}
            </AnimatePresence>

            <DriverNav active={tab} onChange={setTab} />
          </>
        )}

        {/* Floating language toggle — keeps EN | हिंदी switchable during the
            full-screen Active Trip / Success states where the header is hidden. */}
        {(activeTrip || success !== null) && (
          <div className="absolute top-4 right-4 z-[90]">
            <LanguageToggle floating />
          </div>
        )}

        {/* Dispatch alert + success celebration overlay the frame */}
        <DispatchOverlay trip={pendingDispatch} onAccept={handleAccept} onDecline={handleDecline} />

        <AnimatePresence>
          {success !== null && (
            <SuccessScreen
              amount={success}
              onViewKamai={() => {
                setTab("kamai");
                setSuccess(null);
              }}
              onBackToDuty={() => {
                setTab("duty");
                setSuccess(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function DriverApp() {
  return (
    <DriverLanguageProvider>
      <DriverProvider>
        <DriverShell />
      </DriverProvider>
    </DriverLanguageProvider>
  );
}

export default DriverApp;
