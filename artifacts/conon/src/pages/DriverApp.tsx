import { useCallback, useState, useEffect } from "react";
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
import { LoaderRiderCockpit } from "@/components/driver/LoaderRiderCockpit";
import { PartnerAccessGate, type PartnerSession } from "@/components/kyc/PartnerAccessGate";
import { PartnerWaitingRoom } from "@/components/kyc/PartnerWaitingRoom";
import { useKyc, type PartnerKycApplication } from "@/context/KycContext";

/* ──────────────────────────────────────────────────────────────────────────
   CONON-NOW Fleet — Driver Partner App shell.

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
  const [viewMode, setViewMode] = useState<"cockpit" | "classic">("cockpit");
  const { applications, setActiveApplicantId } = useKyc();

  // Active Approved Session State
  const [session, setSession] = useState<PartnerSession | null>(() => {
    try {
      const stored = localStorage.getItem("conon_driver_session");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.status === "APPROVED") return parsed;
      }
    } catch {
      // ignore
    }
    return null;
  });

  // Pending KYC Application State (Waiting Room)
  const [pendingApp, setPendingApp] = useState<PartnerKycApplication | null>(() => {
    try {
      const storedPending = localStorage.getItem("conon_driver_pending_app");
      if (storedPending) {
        return JSON.parse(storedPending);
      }
    } catch {
      // ignore
    }
    return null;
  });

  // Keep pendingApp in sync if status changes in KycContext
  useEffect(() => {
    if (pendingApp) {
      const found = applications.find(
        (a) =>
          a.id === pendingApp.id ||
          a.applicantId === pendingApp.applicantId ||
          (a.phone &&
            pendingApp.phone &&
            a.phone.replace(/\D/g, "").slice(-10) === pendingApp.phone.replace(/\D/g, "").slice(-10))
      );

      if (found) {
        if (found.status === "APPROVED") {
          const newSession: PartnerSession = {
            partnerId: found.partnerId || "CN-DRV-LKO-204",
            phone: found.phone,
            firmOrName: found.firmOrName,
            role: "driver",
            status: "APPROVED",
          };
          localStorage.setItem("conon_driver_session", JSON.stringify(newSession));
          localStorage.removeItem("conon_driver_pending_app");
          setSession(newSession);
          setPendingApp(null);
        } else {
          setPendingApp(found);
        }
      }
    }
  }, [applications, pendingApp]);

  // Handle successful login or waiting room unlock
  const handleAuthenticated = (newSession: PartnerSession) => {
    setSession(newSession);
    setPendingApp(null);
    localStorage.setItem("conon_driver_session", JSON.stringify(newSession));
    localStorage.removeItem("conon_driver_pending_app");
  };

  // Handle pending or re-upload required application
  const handlePending = (app: PartnerKycApplication) => {
    setPendingApp(app);
    setActiveApplicantId(app.id);
    localStorage.setItem("conon_driver_pending_app", JSON.stringify(app));
  };

  // Handle Logout / Switch Partner
  const handleLogout = () => {
    localStorage.removeItem("conon_driver_session");
    localStorage.removeItem("conon_driver_pending_app");
    setSession(null);
    setPendingApp(null);
  };

  // State C: Approved Driver Live Dashboard
  if (session && session.status === "APPROVED") {
    if (viewMode === "cockpit") {
      return (
        <div className="relative">
          <div className="fixed bottom-4 right-4 z-50">
            <button
              type="button"
              onClick={() => setViewMode("classic")}
              className="px-3.5 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold shadow-xl transition flex items-center gap-1.5 cursor-pointer backdrop-blur"
            >
              <span>Switch to Classic Duty View</span>
            </button>
          </div>
          <LoaderRiderCockpit onLogout={handleLogout} session={session} />
        </div>
      );
    }

    return (
      <DriverLanguageProvider>
        <DriverProvider>
          <div className="fixed bottom-4 right-4 z-50">
            <button
              type="button"
              onClick={() => setViewMode("cockpit")}
              className="px-4 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>⚡ Open Loader & Rider Cockpit</span>
            </button>
          </div>
          <DriverShell />
        </DriverProvider>
      </DriverLanguageProvider>
    );
  }

  // State B: Waiting Room / Re-upload Required
  if (pendingApp && pendingApp.status !== "APPROVED") {
    return (
      <PartnerWaitingRoom
        role="driver"
        application={pendingApp}
        onUnlocked={handleAuthenticated}
        onLogout={handleLogout}
      />
    );
  }

  // State A: Access Gate (Login / Register)
  return (
    <PartnerAccessGate
      role="driver"
      onAuthenticated={handleAuthenticated}
      onPending={handlePending}
    />
  );
}

export default DriverApp;
