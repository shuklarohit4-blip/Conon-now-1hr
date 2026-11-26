import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Truck,
  Bike,
  Navigation,
  ShieldAlert,
  ShieldCheck,
  Volume2,
  Camera,
  QrCode,
  MapPin,
  Clock,
  IndianRupee,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Radio,
  FileCheck2,
  Power,
  Upload,
  CloudRain,
  Layers,
  UserPlus,
  UserCheck,
  ChevronDown,
  Check,
  Compass,
  ArrowUpRight,
  Flame,
  Zap,
  ExternalLink,
  Fuel,
  TrendingUp,
  Receipt,
  X,
  Dna,
  Award,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useFourPanelRelay, RelayOrder } from "@/context/FourPanelRelayContext";
import { useGlobalControls } from "@/hooks/useCononLiveData";
import { useSafeCononMasterSync } from "@/context/CononMasterSyncContext";
import { downloadPaymentAdvicePdf } from "@/services/treasuryEngine";
import { SocketStatusPill } from "@/services/socket";
import { useKyc } from "@/context/KycContext";
import { ComplianceHealthShieldDrawer } from "@/components/kyc/ComplianceHealthShieldDrawer";
import { DriverRegisterWizard } from "@/components/kyc/DriverRegisterWizard";
import { KycSandboxPendingBanner } from "@/components/kyc/KycSandboxPendingBanner";
import { useDriverTheme, DriverThemeToggle } from "@/context/DriverThemeContext";
import { useDriverLang, DriverLanguageToggle } from "@/context/DriverLanguageContext";
import { playOrderChime, playCashoutChime, playSosAlarm } from "@/lib/sound";
import { feedbackSync, type SiteDnaProfile } from "@/services/feedbackSync";
import { DriverSiteDnaDrawer } from "./DriverSiteDnaDrawer";

export interface LoaderRiderCockpitProps {
  onLogout?: () => void;
  session?: any;
}

export function LoaderRiderCockpit({ onLogout, session }: LoaderRiderCockpitProps = {}) {
  const { isDark } = useDriverTheme();
  const { t, lang } = useDriverLang();

  const {
    state,
    setDriverVehicle,
    toggleDriverDuty,
    readoutHinglishRoute,
    markDriverArrivedAtSite,
    markStopLoaded,
    completeGeoPhotoEscrow,
    triggerDriverSos,
    acceptReverseBuyback,
    completeReverseBuyback,
    simulateDetentionFastForward,
  } = useFourPanelRelay();

  // Find active mission (order in OUT_FOR_DELIVERY or ARRIVED_AT_SITE or ACCEPTED_PACKING)
  const activeMission =
    state.orders.find(
      (o) =>
        o.status === "OUT_FOR_DELIVERY" ||
        o.status === "ARRIVED_AT_SITE" ||
        o.status === "ACCEPTED_PACKING"
    ) || state.orders[0];

  const {
    currentApplication,
    applications,
    setActiveApplicantId,
    complianceAlert,
  } = useKyc();
  const globalControls = useGlobalControls();

  // UI States
  const [shieldDrawerOpen, setShieldDrawerOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [driverSwitcherOpen, setDriverSwitcherOpen] = useState(false);
  const [activeDriverMode, setActiveDriverMode] = useState<"DEMO" | "APPLICANT">("DEMO");
  const [siteDnaDrawerOpen, setSiteDnaDrawerOpen] = useState(false);
  const [driverTipBonus, setDriverTipBonus] = useState<number>(() => feedbackSync.getDriverTipBonus());
  const [celebrationToast, setCelebrationToast] = useState<{ amount: number; badges: string[] } | null>(null);

  // Subscribe to real-time driver tips and site DNA updates
  useEffect(() => {
    const unsub = feedbackSync.subscribe((event) => {
      if (event.type === "DRIVER_TIP" || (event.type === "CUSTOMER_FEEDBACK" && event.payload?.tipAmount > 0)) {
        const tip = Number(event.payload?.tipAmount || 0);
        const badges = event.payload?.driverBadges || [];
        setDriverTipBonus((prev) => prev + tip);
        playCashoutChime();
        setCelebrationToast({ amount: tip, badges });
        toast.success(
          lang === "hi"
            ? `🎉 ग्राहक ने भेजा +₹${tip} चाय-पानी टिप व '${badges[0] || "शाबाशी"}'!`
            : `🎉 Customer sent +₹${tip} Chai-Pani Tip & '${badges[0] || "Shabaashi"}' Badge!`
        );
        setTimeout(() => setCelebrationToast(null), 8000);
      }
    });
    return () => unsub();
  }, [lang]);

  const [activeVoiceOrder, setActiveVoiceOrder] = useState<string | null>(null);
  const [hudOpen, setHudOpen] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [sosReason, setSosReason] = useState("Tyre Puncture / Overheat near Shaheed Path");
  const [cashoutModalOpen, setCashoutModalOpen] = useState(false);
  const [isCashoutProcessing, setIsCashoutProcessing] = useState(false);
  const [cashoutSuccess, setCashoutSuccess] = useState(false);

  const [otpInput, setOtpInput] = useState("");
  const [photoProof, setPhotoProof] = useState<string>("");
  const [isPhotoUploaded, setIsPhotoUploaded] = useState(false);
  const [isTarpaulinVerified, setIsTarpaulinVerified] = useState(true);

  // Maximum payload calculations
  const maxPayload = state.driverVehicle === "LOADER" ? 1500 : 30;
  const currentWeight = activeMission ? activeMission.weightKg : 0;
  const payloadPercent = Math.min(Math.round((currentWeight / maxPayload) * 100), 100);

  // Daily Diesel Streak calculations (every 5 trips gives +₹250 bonus)
  const streakGoal = 5;
  const currentStreak = state.driverTotalTrips % streakGoal;
  const streakPercent = Math.min(Math.round((currentStreak / streakGoal) * 100), 100);
  const tripsUntilBonus = streakGoal - currentStreak;

  // Hinglish / Bilingual Route Voice Readout
  const handleRouteVoice = (order: RelayOrder) => {
    setActiveVoiceOrder(order.id);
    readoutHinglishRoute(order, lang);
    setTimeout(() => setActiveVoiceOrder(null), 6000);
  };

  const handleSimulatePhoto = () => {
    setPhotoProof("/images/hero-bg.png");
    setIsPhotoUploaded(true);
    toast.success(lang === "hi" ? "साइट अनलोडिंग फोटो प्रमाण अपलोड हुआ!" : "Site unloading photo proof attached!");
  };

  const handleEscrowSubmit = () => {
    if (!activeMission) return;
    const success = completeGeoPhotoEscrow(activeMission.id, {
      otp: otpInput || "2026",
      gpsDistanceMeters: 9,
      gpsMatchPercent: 99,
      photoUrl: photoProof || "",
      tarpaulinPhotoUrl: undefined,
      tarpaulinPhotoVerified: isTarpaulinVerified,
    });
    if (success) {
      playCashoutChime();
      setHudOpen(false);
      setOtpInput("");
      setIsPhotoUploaded(false);
      toast.success(lang === "hi" ? "जियो-फोटो डिलीवरी सफल! एस्क्रो राशि यूपीआई में ट्रांसफर।" : "Geo-Photo Escrow Delivery Verified! Funds credited to UPI.");
      setSiteDnaDrawerOpen(true);
    }
  };

  const handleSosSubmit = () => {
    if (!activeMission) return;
    playSosAlarm();
    triggerDriverSos(activeMission.id, sosReason);
    setSosModalOpen(false);
    toast.error(
      lang === "hi"
        ? "🚨 ढलाई एसओएस अलर्ट भेजा गया! बैकअप लोडर व मैकेनिक रवाना।"
        : "🚨 Dhalai SOS Alert broadcast! Backup loader and mechanic dispatched."
    );
  };

  // Instant UPI Cashout Handler
  const handleInstantCashout = () => {
    if (state.driverTodayKamai <= 0) {
      toast.info(lang === "hi" ? "आज अभी कोई निकासी योग्य राशि नहीं है।" : "No earnings available to withdraw yet.");
      return;
    }
    setCashoutModalOpen(true);
    setIsCashoutProcessing(true);
    setCashoutSuccess(false);

    setTimeout(() => {
      setIsCashoutProcessing(false);
      setCashoutSuccess(true);
      playCashoutChime();
      toast.success(
        lang === "hi"
          ? `₹${state.driverTodayKamai.toLocaleString("en-IN")} सीधे आपके यूपीआई (NPCI IMPS) में ट्रांसफर हो गए!`
          : `₹${state.driverTodayKamai.toLocaleString("en-IN")} transferred instantly to UPI (NPCI IMPS)!`
      );
    }, 1400);
  };

  const isCompliancePaused =
    Boolean(complianceAlert?.show) ||
    currentApplication?.status === "COMPLIANCE_PAUSED";

  const driverSession = useMemo(() => {
    try {
      const raw = localStorage.getItem("conon_driver_session");
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  }, []);

  const activeDriverName =
    driverSession?.firmOrName ||
    (currentApplication?.ownerOrDriverName
      ? `${currentApplication.ownerOrDriverName} (${currentApplication.vehiclePlate || "UP 32 XX 0000"})`
      : "Fleet Partner (Standby)");

  const activeVehiclePlate =
    driverSession?.vehiclePlate ||
    currentApplication?.vehiclePlate ||
    "UP 32 XX 0000";

  // Close dropdown on outside click
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDriverSwitcherOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Theme Classes
  const themeCanvasClass = isDark
    ? "bg-[#0B1120] text-slate-100"
    : "bg-[#F5F7FA] text-slate-900";

  const themeHeaderClass = isDark
    ? "bg-[#111827]/95 border-slate-800 text-slate-100"
    : "bg-white/95 border-slate-200 text-slate-900 shadow-xs";

  const themeCardClass = isDark
    ? "bg-[#111827] border-slate-800 text-slate-100 shadow-xl"
    : "bg-white border-slate-200 text-slate-900 shadow-sm";

  const themeInnerCardClass = isDark
    ? "bg-[#161F30] border-slate-800/80"
    : "bg-slate-50 border-slate-200";

  const themeSubtextClass = isDark ? "text-slate-400" : "text-slate-500";
  const themeTitleClass = isDark ? "text-white" : "text-slate-900";

  return (
    <div
      className={`min-h-screen flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950 pb-20 transition-colors duration-200 ${themeCanvasClass}`}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. TOP COMMAND HEADER BAR (Full-Width Responsive Lockup)
      ────────────────────────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-40 px-4 sm:px-6 py-2.5 border-b backdrop-blur-md transition-colors duration-200 ${themeHeaderClass}`}
      >
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* LEFT: Official CONON-NOW Brand Lockup + Driver Switcher */}
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="flex items-center gap-2 shrink-0 group focus:outline-none"
              title="Return to Customer Storefront"
            >
              <img
                src={`${import.meta.env.BASE_URL}images/conon-logo-transparent.png`}
                alt="CONON"
                className="h-8 w-auto object-contain shrink-0 group-hover:scale-105 transition-transform"
              />
            </a>

            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black shadow-sm shrink-0 ${
                isDark ? "bg-amber-400 text-slate-950" : "bg-amber-400 text-slate-950"
              }`}
            >
              <Truck className="w-4 h-4 text-slate-950" />
            </div>

            {/* Driver Identity & Account Switcher Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDriverSwitcherOpen(!driverSwitcherOpen)}
                className={`flex items-center gap-2 text-left cursor-pointer transition ${
                  isDark ? "hover:text-amber-400" : "hover:text-amber-600"
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider ${
                        isDark ? "text-amber-400" : "text-amber-600"
                      }`}
                    >
                      {t("brandTagline", "CONON DRIVER")}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                        isDark
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-emerald-50 text-emerald-700 border-emerald-300"
                      }`}
                    >
                      {activeDriverMode === "DEMO"
                        ? t("verifiedFleet", "VERIFIED FLEET")
                        : "REGISTERED"}
                    </span>
                    {session?.partnerId && (
                      <span className="text-[9px] font-mono font-black px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 border border-amber-300">
                        {session.partnerId}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                        driverSwitcherOpen ? "rotate-180 text-amber-500" : ""
                      }`}
                    />
                  </div>
                  <p className={`text-xs font-bold truncate max-w-[170px] sm:max-w-xs ${themeTitleClass}`}>
                    {activeDriverName}
                  </p>
                </div>
              </button>

              {/* Driver Account Switcher Dropdown Menu */}
              {driverSwitcherOpen && (
                <div
                  className={`absolute top-full left-0 mt-2 w-72 sm:w-80 border rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
                    isDark
                      ? "bg-[#161F30] border-slate-700/80 text-slate-100"
                      : "bg-white border-slate-200 text-slate-900 shadow-slate-300/50"
                  }`}
                >
                  <div
                    className={`px-2.5 py-1.5 border-b flex items-center justify-between ${
                      isDark ? "border-slate-800" : "border-slate-100"
                    }`}
                  >
                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-wider">
                      {t("driverSwitcherTitle", "Driver Account Switcher")}
                    </span>
                    <span className={`text-[9px] ${themeSubtextClass}`}>
                      {t("instantSyncNote", "Instant Sync")}
                    </span>
                  </div>

                  <div className="space-y-1 mt-1.5 max-h-60 overflow-y-auto">
                    {applications.filter((a) => a.applicantType === "DRIVER").length === 0 && (
                      <div className={`p-2.5 text-center text-xs ${themeSubtextClass}`}>
                        {lang === "hi" ? "कोई अन्य ड्राइवर पंजीकृत नहीं है" : "No other drivers registered"}
                      </div>
                    )}

                    {applications
                      .filter((a) => a.applicantType === "DRIVER")
                      .map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => {
                            setActiveDriverMode("APPLICANT");
                            setActiveApplicantId(app.applicantId);
                            setDriverSwitcherOpen(false);
                          }}
                          className={`w-full text-left p-2 rounded-xl text-xs transition cursor-pointer flex items-center justify-between ${
                            activeDriverMode === "APPLICANT"
                              ? isDark
                                ? "bg-amber-400/15 border border-amber-400/40 text-amber-300 font-bold"
                                : "bg-amber-50 border border-amber-300 text-amber-900 font-bold"
                              : isDark
                              ? "text-slate-300 hover:bg-slate-800"
                              : "text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[8px] font-black px-1 rounded bg-indigo-500/20 text-indigo-400">
                                {app.status}
                              </span>
                              <p className={`font-bold ${themeTitleClass}`}>{app.ownerOrDriverName}</p>
                            </div>
                            <p className={`text-[10px] ${themeSubtextClass}`}>{app.vehiclePlate} • {app.zone}</p>
                          </div>
                          {activeDriverMode === "APPLICANT" && <Check className="w-3.5 h-3.5 text-amber-500" />}
                        </button>
                      ))}
                  </div>

                  <div className={`mt-2 pt-2 border-t ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setDriverSwitcherOpen(false);
                        setRegisterModalOpen(true);
                      }}
                      className={`w-full py-2 px-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                        isDark
                          ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30"
                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300"
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{t("registerNewDriver", "+ Register New Driver / Loader")}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT CONTROLS: Language Toggle, Theme Toggle, Compliance Pill, Socket, Duty Toggle */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Bilingual Switcher (EN | हिंदी) */}
            <DriverLanguageToggle />

            {/* Auto / Day / Night Theme Switcher */}
            <DriverThemeToggle />

            {/* Real-time Socket Sync Status */}
            <SocketStatusPill />

            {/* Site DNA Intelligence Quick Button */}
            <button
              type="button"
              onClick={() => setSiteDnaDrawerOpen(true)}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition flex items-center gap-1 cursor-pointer border ${
                isDark
                  ? "bg-purple-500/15 text-purple-300 border-purple-500/30 hover:bg-purple-500/25"
                  : "bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100"
              }`}
              title="Rate Site & Road (Site DNA)"
            >
              <Dna className="w-3 h-3 text-purple-500" />
              <span>{lang === "hi" ? "साइट डीएनए" : "Site DNA"}</span>
            </button>

            {/* Compliance Health Shield Pill */}
            <button
              type="button"
              onClick={() => setShieldDrawerOpen(true)}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition flex items-center gap-1 cursor-pointer border ${
                isCompliancePaused
                  ? "bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/40 animate-pulse"
                  : isDark
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
              }`}
              title="Click to view Fleet Compliance Health Shield"
            >
              {isCompliancePaused ? (
                <>
                  <ShieldAlert className="w-3 h-3 text-rose-500" />
                  <span>{t("killSwitchActive", "Kill-Switch")}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span>{t("docsValid", "Docs Valid")}</span>
                </>
              )}
            </button>

            {/* Giant Online / Offline Duty Master Toggle */}
            <button
              type="button"
              onClick={() => {
                if (isCompliancePaused) {
                  toast.error("🚨 Fleet dispatch suspended. Insurance policy has expired.");
                  setShieldDrawerOpen(true);
                  return;
                }
                toggleDriverDuty();
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-sm ${
                isCompliancePaused
                  ? "bg-rose-950 text-rose-400 border border-rose-700/50"
                  : state.driverOnline
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20 border border-emerald-400/30"
                  : isDark
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  : "bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isCompliancePaused
                    ? "bg-rose-500"
                    : state.driverOnline
                    ? "bg-emerald-300 animate-ping"
                    : "bg-slate-500"
                }`}
              />
              <span className="tracking-wide">
                {isCompliancePaused
                  ? t("dutyLocked", "LOCKED")
                  : state.driverOnline
                  ? t("onlineDuty", "ONLINE")
                  : t("dutyOff", "DUTY OFF")}
              </span>
            </button>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  isDark
                    ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30"
                    : "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 shadow-xs"
                }`}
                title={lang === "hi" ? "लॉगआउट / पार्टनर बदलें" : "Logout / Switch Partner"}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === "hi" ? "लॉगआउट" : "Logout"}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Driver Sandbox Pending Banner */}
      <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 pt-3">
        <KycSandboxPendingBanner
          type="DRIVER"
          onSwitchToVerifiedDemo={() => setActiveDriverMode("DEMO")}
        />
      </div>

      {/* COMPLIANCE AUTO-EXPIRY KILL-SWITCH SUSPENSION BANNER */}
      {isCompliancePaused && (
        <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 mt-3">
          <div className="rounded-2xl bg-gradient-to-r from-rose-950 via-[#220B10] to-[#120406] border border-rose-500/50 p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-rose-200 uppercase tracking-wider">
                  🚨 FLEET DISPATCH SUSPENDED (COMPLIANCE KILL-SWITCH)
                </h3>
                <p className="text-xs text-rose-300/80 mt-0.5">
                  Commercial Goods Insurance policy has expired. Under CONON safety bylaws, you cannot accept slab/dhalai trips until renewed.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShieldDrawerOpen(true)}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs transition shadow-md cursor-pointer"
              >
                <span>{t("viewRenewPapersBtn", "Inspect Expired Policy & Renew")}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveDriverMode("DEMO")}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700 transition cursor-pointer"
              >
                Switch to Demo Driver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rain-Shield Active Banner */}
      {(state.isRainModeActive || globalControls.rainMode) && (
        <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 mt-3">
          <div className="rounded-2xl bg-cyan-950/80 border border-cyan-800/60 px-4 py-2.5 flex items-center gap-3 text-cyan-300 text-xs shadow-inner">
            <CloudRain className="w-4 h-4 text-cyan-400 shrink-0 animate-bounce" />
            <div className="leading-tight">
              <strong className="font-black block uppercase text-[10px] tracking-wider text-cyan-200">
                {t("rainModeActiveBanner", "🌧️ Global Rain-Shield Tirpal Mode Active")}
              </strong>
              <span className="text-[11px] text-cyan-300">
                {t("rainModeDesc", "Tarpaulin dry photo proof mandatory for all moisture-sensitive dispatches.")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. FULL-VIEWPORT 2-ZONE LOGISTICS COCKPIT GRID
          Left: Active Mission Command Card (~60%)
          Right: Earnings, Buyback Radar, Payload & Trips (~40%)
      ────────────────────────────────────────────────────────────── */}
      <main className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 mt-4 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ═════════════════════════════════════════════════════════
              LEFT PRIMARY COLUMN (~60%, lg:col-span-7)
              Active Mission, 4-Stage Route Tracker, Quick Actions, HUD, SOS
          ══════════════════════════════════════════════════════════ */}
          <section className="lg:col-span-7 space-y-4">
            {activeMission ? (
              <div
                className={`rounded-3xl border p-5 sm:p-6 shadow-xl space-y-5 transition-all ${
                  isDark
                    ? "bg-gradient-to-br from-[#131B2A] to-[#0D131F] border-amber-500/40 shadow-amber-500/5 ring-1 ring-amber-500/20"
                    : "bg-white border-amber-300 shadow-md shadow-amber-500/5 ring-1 ring-amber-300/40"
                }`}
              >
                {/* Mission Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-400 text-slate-950 uppercase tracking-wider font-mono">
                        {t("activeMissionTitle", "ACTIVE MISSION")} #{activeMission.shortId}
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        {activeMission.vehicleTag}
                      </span>
                    </div>
                    <h2 className={`text-lg sm:text-xl font-black mt-1 leading-snug ${themeTitleClass}`}>
                      {activeMission.itemsSummary}
                    </h2>
                  </div>

                  {/* 60-min SLA Badge */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 font-mono text-xs font-black shrink-0">
                    <Clock className="w-3.5 h-3.5 animate-pulse" />
                    <span>46m {t("missionSlaCountdown", "Left")}</span>
                  </div>
                </div>

                {/* 4-Stage Route Progress Bar */}
                <div className={`p-3.5 rounded-2xl border space-y-2 ${themeInnerCardClass}`}>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    <span className="text-amber-500 font-bold">1. Accepted</span>
                    <span className="text-amber-500 font-bold">2. Loaded</span>
                    <span className={activeMission.status === "OUT_FOR_DELIVERY" || activeMission.status === "ARRIVED_AT_SITE" ? "text-amber-500 font-bold" : ""}>
                      3. En Route
                    </span>
                    <span className={activeMission.status === "ARRIVED_AT_SITE" ? "text-emerald-500 font-bold" : ""}>
                      4. At Site Drop
                    </span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden flex ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
                    <div className="w-1/4 h-full bg-amber-400" />
                    <div className="w-1/4 h-full bg-amber-400" />
                    <div className={`w-1/4 h-full ${activeMission.status === "OUT_FOR_DELIVERY" || activeMission.status === "ARRIVED_AT_SITE" ? "bg-amber-400" : "bg-transparent"}`} />
                    <div className={`w-1/4 h-full ${activeMission.status === "ARRIVED_AT_SITE" ? "bg-emerald-500" : "bg-transparent"}`} />
                  </div>
                </div>

                {/* Route Visualizer: Pickup Hub -> Drop Site */}
                <div className={`p-4 rounded-2xl border space-y-3.5 text-xs ${themeInnerCardClass}`}>
                  {/* Pickup Hub */}
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-500 flex items-center justify-center shrink-0 mt-0.5 text-xs font-black">
                      A
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-[10px] font-bold uppercase tracking-wider block ${themeSubtextClass}`}>
                        {t("pickupHubLabel", "Pickup Partner Hub")}
                      </span>
                      <p className={`font-black text-sm truncate ${themeTitleClass}`}>{activeMission.hubName}</p>
                      <p className={`text-[11px] mt-0.5 ${themeSubtextClass}`}>
                        {t("pickupOtpLabel", "Pickup Handover OTP")}:{" "}
                        <strong className="text-amber-500 font-mono">{activeMission.pickupOtp}</strong>
                      </p>
                    </div>
                  </div>

                  <div className={`w-0.5 h-4 ml-3 ${isDark ? "bg-slate-700" : "bg-slate-300"}`} />

                  {/* Drop Site */}
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5 text-xs font-black">
                      B
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-[10px] font-bold uppercase tracking-wider block ${themeSubtextClass}`}>
                        {t("dropSiteLabel", "Site Construction Drop")}
                      </span>
                      <p className="font-black text-sm text-emerald-600 dark:text-emerald-400 truncate">
                        {activeMission.siteName}
                      </p>
                      <p className={`text-[11px] mt-0.5 truncate ${themeSubtextClass}`}>{activeMission.siteAddress}</p>
                    </div>
                  </div>
                </div>

                {/* 🧬 Live Site DNA Heads-Up Card (Crowd-Sourced Road & Unloading Intelligence) */}
                {(() => {
                  const siteDna = feedbackSync.getSiteDna(activeMission.siteAddress || activeMission.siteName);
                  return (
                    <div
                      className={`p-3.5 rounded-2xl border text-xs space-y-2 transition-all shadow-md ${
                        isDark
                          ? "bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-purple-950/40 border-purple-500/40 text-purple-200"
                          : "bg-gradient-to-r from-purple-50 via-indigo-50/50 to-purple-50 border-purple-200 text-purple-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 text-purple-600 dark:text-purple-300">
                          <Dna className="w-3.5 h-3.5 text-purple-500 animate-pulse" />
                          <span>{lang === "hi" ? "🧬 साइट डीएनए रोड जानकारी" : "🧬 Site DNA Road Intelligence"}</span>
                          <span className="text-[9px] font-normal opacity-80">(From Previous Conon Drivers)</span>
                        </span>
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                          ⭐ {siteDna.avgSiteRating} ({siteDna.totalReports} {lang === "hi" ? "रिपोर्ट्स" : "reports"})
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="font-bold text-[11px] leading-snug">
                          {siteDna.roadSummary}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30">
                            {lang === "hi" ? "सलाह:" : "Recommended:"} {siteDna.recommendedVehicle}
                          </span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                            {siteDna.labourReadinessPct}% {lang === "hi" ? "लेबर रेडी" : "Labour Ready"}
                          </span>
                          {siteDna.recentTags.map((tag, idx) => (
                            <span key={idx} className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-500/10 border border-slate-500/20">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Smart Multi-Stop Clubbing (if 2 shops) */}
                {activeMission.stops && activeMission.stops.length > 1 && (
                  <div
                    className={`p-4 rounded-2xl border space-y-2.5 text-xs ${
                      isDark
                        ? "bg-amber-500/10 border-amber-500/30"
                        : "bg-amber-50/70 border-amber-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-300 flex items-center gap-1.5 tracking-wider">
                        <Layers className="w-3.5 h-3.5 text-amber-500" />
                        {t("multiStopTitle", "Smart Multi-Stop Clubbing")} ({activeMission.stops.length} Partner Shops &lt;1.5 km)
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-700 dark:text-amber-300">
                        {t("singleLoaderRun", "Single Loader Run")}
                      </span>
                    </div>

                    <div className="space-y-2 pt-1">
                      {activeMission.stops.map((stop) => (
                        <div
                          key={stop.stopId}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition ${
                            stop.isLoaded
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300"
                              : isDark
                              ? "bg-slate-900/90 border-slate-700 text-slate-200"
                              : "bg-white border-slate-200 text-slate-800"
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-bold">
                              <span>{t("stopLabel", "Stop")} {stop.sequenceNo}: {stop.hubName}</span>
                              {stop.isLoaded && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black">
                                  {t("stopLoadedBadge", "LOADED")}
                                </span>
                              )}
                            </div>
                            <p className={`text-[10px] mt-0.5 ${themeSubtextClass}`}>{stop.materialSummary || "Staged Items"}</p>
                            <p className="text-[9px] font-mono text-amber-500">Token: {stop.pickupQrToken}</p>
                          </div>
                          {!stop.isLoaded && (
                            <button
                              type="button"
                              onClick={() => markStopLoaded(activeMission.id, stop.stopId)}
                              className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] shrink-0 transition cursor-pointer active:scale-95 shadow-xs"
                            >
                              {t("markStopLoadedBtn", "Mark Loaded")}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 1-Tap Quick Actions Strip: Navigate (Google Maps), Call Dealer, Call Site, Route Voice */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {/* 1. Navigate via Google Maps */}
                  <button
                    type="button"
                    onClick={() => {
                      const dest = encodeURIComponent(activeMission.siteAddress || activeMission.siteName);
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, "_blank");
                    }}
                    className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                      isDark
                        ? "bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5 text-blue-500" />
                    <span>{t("navGoogleMaps", "Navigate")}</span>
                  </button>

                  {/* 2. Call Dealer */}
                  <a
                    href={`tel:${activeMission.customerPhone || "+919415088219"}`}
                    className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                      isDark
                        ? "bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                    }`}
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t("callDealer", "Call Dealer")}</span>
                  </a>

                  {/* 3. Call Site Engineer */}
                  <a
                    href={`tel:${activeMission.customerPhone || "+919415088219"}`}
                    className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                      isDark
                        ? "bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                    }`}
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t("callSite", "Call Site")}</span>
                  </a>

                  {/* 4. Synced Bilingual Voice Co-Pilot */}
                  <button
                    type="button"
                    onClick={() => handleRouteVoice(activeMission)}
                    className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                      isDark
                        ? "bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                    }`}
                  >
                    <Volume2
                      className={`w-3.5 h-3.5 ${
                        activeVoiceOrder === activeMission.id ? "text-amber-500 animate-spin" : "text-amber-500"
                      }`}
                    />
                    <span>
                      {activeVoiceOrder === activeMission.id
                        ? t("speakingVoiceBtn", "Speaking…")
                        : t("routeVoiceBtn", "🔊 Route Voice")}
                    </span>
                  </button>
                </div>

                {/* GPS Detention Auto-Meter (15 Free Mins -> ₹2/Min) */}
                {activeMission.status === "ARRIVED_AT_SITE" && (
                  <div
                    className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                      isDark ? "bg-amber-500/10 border-amber-500/30" : "bg-amber-50 border-amber-200"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        {t("unloadingSlaTitle", "Unloading Waiting SLA:")}
                      </span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black">
                        {(activeMission.detentionMinutes ?? 0) > 0 ? (
                          <span className="text-rose-600 dark:text-rose-400 animate-pulse">
                            +₹{activeMission.detentionCharge ?? (activeMission.detentionMinutes! * 2)} ({activeMission.detentionMinutes}m detention)
                          </span>
                        ) : (
                          t("freeWindowActive", "15m Free Window Active")
                        )}
                      </span>
                    </div>
                    <p className={`text-[10px] ${themeSubtextClass}`}>
                      {t("detentionNotice", "Free 15-minute unloading started upon site arrival. Detention auto-credits ₹2/min thereafter.")}
                    </p>

                    {/* Developer Fast-Forward Test Button */}
                    <button
                      type="button"
                      onClick={() => simulateDetentionFastForward(activeMission.id)}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] transition cursor-pointer flex items-center gap-1 shadow-xs"
                      title="Fast-forward test to verify detention auto-charge syncing to relay"
                    >
                      <Zap className="w-3 h-3" />
                      <span>{t("fastForwardDetentionTest", "⚡ +15m Fast-Forward Test")}</span>
                    </button>
                  </div>
                )}

                {/* Mission Earnings & Palledari Bonus */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${themeSubtextClass}`}>
                      {t("totalMissionPay", "Total Mission Pay")}
                    </span>
                    <div className="flex items-center gap-2">
                      <strong className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        ₹{activeMission.deliveryFee + activeMission.palledariBonus}
                      </strong>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-600 dark:text-amber-400 border border-amber-400/20">
                        +₹{activeMission.palledariBonus} {t("palledariIncluded", "Palledari Included")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* PRIMARY BIG-THUMB ACTION BUTTONS (52px+ height for easy dashboard tapping) */}
                <div className="space-y-2.5 pt-2 border-t border-slate-700/50">
                  {activeMission.status === "OUT_FOR_DELIVERY" ? (
                    <button
                      type="button"
                      onClick={() => {
                        markDriverArrivedAtSite(activeMission.id);
                        setHudOpen(true);
                      }}
                      className="w-full min-h-[52px] py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                    >
                      <Navigation className="w-5 h-5" />
                      <span>{t("arrivedAtSiteBtn", "Arrived at Site ➔ Open Geo-Escrow HUD")}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setHudOpen(true)}
                      className="w-full min-h-[52px] py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-400/20 transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                    >
                      <Camera className="w-5 h-5" />
                      <span>{t("openGeoEscrowBtn", "Complete Geo-Escrow Drop & Cashout")}</span>
                    </button>
                  )}

                  {/* Breakdown / Dhalai SOS Bar */}
                  <button
                    type="button"
                    onClick={() => setSosModalOpen(true)}
                    className="w-full py-3 rounded-xl bg-rose-950/20 hover:bg-rose-900/30 border border-rose-500/40 text-rose-600 dark:text-rose-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span>{t("sosAlertBtn", "🚨 Breakdown / Dhalai SOS Alert")}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`p-6 sm:p-8 text-center rounded-3xl border transition-all relative overflow-hidden ${
                  isDark
                    ? "bg-gradient-to-b from-[#131C2E] to-[#0A101D] border-emerald-500/30 shadow-2xl shadow-emerald-500/5 ring-1 ring-emerald-500/20"
                    : "bg-gradient-to-b from-emerald-50/50 to-white border-emerald-300 shadow-xl ring-1 ring-emerald-400/30"
                }`}
              >
                {/* Real-Time Telemetry & Radar Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono mb-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>
                    {lang === "hi"
                      ? "मिशन रडार एक्टिव • अगले पिकअप का इंतज़ार"
                      : "Mission Radar Active • Standby for Next Pickup"}
                  </span>
                </div>

                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 text-emerald-500 shadow-lg shadow-emerald-500/10">
                  <Navigation className="w-8 h-8 text-emerald-500 animate-pulse" />
                </div>

                <h3 className={`text-base sm:text-lg font-black ${themeTitleClass}`}>
                  {lang === "hi"
                    ? "लखनऊ जोन मिशन रडार — रेडी"
                    : "Lucknow Zone Mission Radar — Standby"}
                </h3>

                <p className={`text-xs max-w-sm mx-auto mt-1 mb-5 ${themeSubtextClass}`}>
                  {lang === "hi"
                    ? "वेरिफाइड हार्डवेयर दुकानों से ऑर्डर पैक होते ही इस कॉकपिट में लाउड अलर्ट बजेगा और साइट का नेविगेशन खुल जाएगा।"
                    : "As soon as a verified hardware hub packs materials, orders will buzz live with direct turn-by-turn site directions."}
                </p>

                {/* Driver Cockpit Readiness Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-md mx-auto mb-6 text-left">
                  <div className={`p-2.5 rounded-xl border text-xs ${isDark ? "bg-[#090D18] border-slate-800" : "bg-white border-slate-200"}`}>
                    <div className="text-[10px] font-bold text-amber-500">VEHICLE CLASS</div>
                    <div className={`font-bold mt-0.5 truncate ${themeTitleClass}`}>
                      {state.driverVehicle === "LOADER" ? "Chhota Hathi 1.5T" : "Bike Express 30kg"}
                    </div>
                    <div className="text-[10px] text-emerald-500 font-bold mt-1">✓ Payload Armed</div>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-xs ${isDark ? "bg-[#090D18] border-slate-800" : "bg-white border-slate-200"}`}>
                    <div className="text-[10px] font-bold text-cyan-400">GPS TELEMETRY</div>
                    <div className={`font-bold mt-0.5 truncate ${themeTitleClass}`}>Supply Corridor</div>
                    <div className="text-[10px] text-cyan-400 font-bold mt-1">✓ GPS Lock Strong</div>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-xs col-span-2 sm:col-span-1 ${isDark ? "bg-[#090D18] border-slate-800" : "bg-white border-slate-200"}`}>
                    <div className="text-[10px] font-bold text-emerald-400">GEO-ESCROW</div>
                    <div className={`font-bold mt-0.5 truncate ${themeTitleClass}`}>Instant Cashout</div>
                    <div className="text-[10px] text-emerald-400 font-bold mt-1">✓ UPI Pipeline Live</div>
                  </div>
                </div>

                {/* Cabin Audio Alert Test Button */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      playOrderChime();
                      toast.info("Cabin Audio Alert Test: Sound Active", {
                        description: "High-volume mission siren verified. You will hear this inside the moving cabin.",
                      });
                    }}
                    className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 cursor-pointer ${
                      isDark
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200"
                    }`}
                  >
                    <Volume2 className="w-4 h-4 text-emerald-500" />
                    <span>{lang === "hi" ? "🔊 केबिन सायरन टेस्ट करें" : "🔊 Test Cabin Alert Sound"}</span>
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* ═════════════════════════════════════════════════════════
              RIGHT SECONDARY COLUMN (~40%, lg:col-span-5)
              Earnings, Buyback Radar, Payload & Trips History
          ══════════════════════════════════════════════════════════ */}
          <section className="lg:col-span-5 space-y-4">
            {/* 1. Live Earnings & Instant UPI Cashout Card */}
            <div className={`p-5 sm:p-6 rounded-3xl border shadow-xl space-y-4 ${themeCardClass}`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${themeSubtextClass}`}>
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                  {t("earningsCardTitle", "Live Earnings & Instant Cashout")}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {state.driverTotalTrips} {t("tripsCount", "Trips")}
                </span>
              </div>

              {/* Total Balance Amount */}
              <div>
                <span className={`text-xs ${themeSubtextClass}`}>
                  {t("availableToWithdraw", "Available for Instant Cashout")}
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    ₹{(state.driverTodayKamai + driverTipBonus).toLocaleString("en-IN")}
                  </span>
                  <span className={`text-xs font-semibold ${themeSubtextClass}`}>
                    (100% Verified)
                  </span>
                </div>
              </div>

              {/* Earnings Breakdown */}
              <div className={`p-3 rounded-2xl border text-xs space-y-1.5 ${themeInnerCardClass}`}>
                <div className="flex items-center justify-between">
                  <span className={themeSubtextClass}>{t("baseTripPay", "Base Trip Fares")}</span>
                  <strong className={`font-mono ${themeTitleClass}`}>
                    ₹{Math.max(0, Math.round(state.driverTodayKamai * 0.75)).toLocaleString("en-IN")}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className={themeSubtextClass}>{t("palledariEarnings", "Palledari Unloading Bonus")}</span>
                  <strong className="text-amber-500 font-mono">
                    +₹{Math.max(0, Math.round(state.driverTodayKamai * 0.15)).toLocaleString("en-IN")}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className={themeSubtextClass}>{t("returnBuybackEarnings", "Return Buyback Bonus")}</span>
                  <strong className="text-purple-600 dark:text-purple-400 font-mono">
                    +₹{Math.max(0, Math.round(state.driverTodayKamai * 0.10)).toLocaleString("en-IN")}
                  </strong>
                </div>
                {driverTipBonus > 0 && (
                  <div className="flex items-center justify-between pt-1 border-t border-amber-500/20">
                    <span className="text-amber-500 font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {lang === "hi" ? "ग्राहक चाय-पानी टिप" : "Customer Chai-Pani Tip"}
                    </span>
                    <strong className="text-amber-500 font-mono">
                      +₹{driverTipBonus.toLocaleString("en-IN")}
                    </strong>
                  </div>
                )}
              </div>

              {/* Instant Cashout Button */}
              <button
                type="button"
                onClick={handleInstantCashout}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <Zap className="w-4 h-4 text-slate-950" />
                <span>{t("withdrawUpiBtn", "⚡ Withdraw ₹ to UPI Instantly (NPCI 24x7)")}</span>
              </button>

              {(() => {
                const sync = useSafeCononMasterSync();
                const latestDriverPayout = (sync?.state.treasury?.ledger || []).find(
                  (r) => r.entryType === "DRIVER_PAYOUT" && r.status === "SETTLED"
                );
                if (!latestDriverPayout) return null;
                return (
                  <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-between gap-2">
                    <span>
                      ✓ {lang === "hi"
                        ? `बैंक/UPI ${latestDriverPayout.toAccountRef} में भुगतान • UTR: ${latestDriverPayout.utrNumber}`
                        : `Paid to ${latestDriverPayout.toAccountRef} • UTR: ${latestDriverPayout.utrNumber}`}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        downloadPaymentAdvicePdf(
                          latestDriverPayout,
                          sync?.state.treasury?.companyAccounts || []
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 text-[10px] font-black cursor-pointer shrink-0"
                    >
                      {lang === "hi" ? "पेमेंट एडवाइस" : "View Payment Advice"}
                    </button>
                  </div>
                );
              })()}

              {/* Daily Diesel Streak Bonus Bar */}
              <div className={`p-3.5 rounded-2xl border space-y-2 ${themeInnerCardClass}`}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold flex items-center gap-1.5 text-amber-500">
                    <Fuel className="w-3.5 h-3.5" />
                    {t("dieselStreakTitle", "Daily Diesel Bonus Streak")}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {currentStreak} / {streakGoal}
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${streakPercent}%` }}
                  />
                </div>
                <p className={`text-[10px] ${themeSubtextClass}`}>
                  {tripsUntilBonus > 0
                    ? lang === "hi"
                      ? `${currentStreak}/${streakGoal} ट्रिप्स पूरी हुईं — +₹250 डीजल बोनस के लिए ${tripsUntilBonus} ट्रिप बाकी!`
                      : `${currentStreak}/${streakGoal} Trips Completed — ${tripsUntilBonus} more trip to unlock +₹250 Diesel Bonus!`
                    : t("dieselStreakUnlocked", "🎉 +₹250 Daily Diesel Bonus Unlocked & Added to Wallet!")}
                </p>
              </div>
            </div>

            {/* 2. Driver Trust & Gold Pilot Card */}
            <div className={`p-5 rounded-3xl border shadow-xl space-y-3.5 ${
              isDark
                ? "bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 border-amber-500/40 text-slate-100"
                : "bg-gradient-to-br from-amber-50/80 via-white to-white border-amber-300 text-slate-900"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  {lang === "hi" ? "गोल्ड पायलट व ट्रस्ट स्कोर" : "Gold Pilot & Driver Trust"}
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                  {lang === "hi" ? "गोल्ड पायलट एक्टिव" : "GOLD PILOT ACTIVE"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className={`text-[10px] uppercase font-bold block ${themeSubtextClass}`}>
                    {lang === "hi" ? "ड्राइवर ट्रस्ट स्कोर" : "Driver Trust Score"}
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-3xl font-black text-amber-500 font-mono">94</span>
                    <span className="text-xs font-bold text-slate-400">/ 100</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] uppercase font-bold block ${themeSubtextClass}`}>
                    {lang === "hi" ? "शबाशी टिप्स कुल" : "Shabaashi Tips Earned"}
                  </span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    +₹{driverTipBonus.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className={`p-2.5 rounded-2xl border text-[11px] font-medium space-y-1 ${
                isDark ? "bg-slate-900/80 border-slate-800 text-slate-300" : "bg-amber-50/60 border-amber-200 text-amber-950"
              }`}>
                <p className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                  {lang === "hi" ? "प्राथमिकता थोक ऑर्डर (Priority Bulk Orders)" : "Priority Bulk Orders Unlocked"}
                </p>
                <p className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  {lang === "hi" ? "शून्य-शुल्क तत्काल यूपीआई कैशआउट (0% Fee Cashout)" : "Zero-Fee Instant UPI Cashout 24x7"}
                </p>
              </div>
            </div>

            {/* 2. "Khali Mat Lautna" Reverse Buyback Radar */}
            <div className={`p-5 rounded-3xl border shadow-xl space-y-3 ${themeCardClass}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  {t("buybackTitle", "Khali Mat Lautna! (Zero-Empty-Return)")}
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-500 border border-amber-400/20">
                  {t("buybackBonus", "Return Trip Bonus")}
                </span>
              </div>

              <div className={`p-3 rounded-2xl border space-y-1.5 ${themeInnerCardClass}`}>
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-bold ${themeTitleClass}`}>
                    {state.reverseBuyback.material}
                  </p>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    +₹{state.reverseBuyback.bonusAmount}
                  </span>
                </div>
                <p className={`text-[11px] ${themeSubtextClass}`}>
                  Pickup from {state.reverseBuyback.pickupSite} ({state.reverseBuyback.distanceKm} km away) ➔ Drop at {state.reverseBuyback.dropHub}.
                </p>
              </div>

              {state.reverseBuyback.status === "OFFERED" ? (
                <button
                  type="button"
                  onClick={acceptReverseBuyback}
                  className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-amber-400/20 transition cursor-pointer"
                >
                  {t("acceptBuybackBtn", "Accept Return Pickup (+₹220 Bonus)")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={completeReverseBuyback}
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-500/20 transition cursor-pointer"
                >
                  {t("completeBuybackBtn", "Mark Reverse Drop Complete ➔ Claim ₹220")}
                </button>
              )}
            </div>

            {/* 3. Vehicle Payload Guard & Compliance Health Shield */}
            <div className={`p-5 rounded-3xl border shadow-xl space-y-4 ${themeCardClass}`}>
              {/* Vehicle Mode Switcher */}
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-wider ${themeSubtextClass}`}>
                  {t("vehicleClassLabel", "Vehicle Category")}
                </span>
                <span className="text-[10px] font-mono text-amber-500 font-bold">
                  {activeVehiclePlate}
                </span>
              </div>

              <div className={`grid grid-cols-2 gap-2 p-1 rounded-2xl border ${themeInnerCardClass}`}>
                <button
                  type="button"
                  onClick={() => setDriverVehicle("LOADER")}
                  className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    state.driverVehicle === "LOADER"
                      ? "bg-amber-400 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>{t("vehicleLoader", "Loader (1.5T)")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDriverVehicle("BIKE")}
                  className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    state.driverVehicle === "BIKE"
                      ? "bg-amber-400 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Bike className="w-4 h-4" />
                  <span>{t("vehicleBike", "Bike (30kg)")}</span>
                </button>
              </div>

              {/* Payload Safety Bar */}
              <div className={`p-3 rounded-2xl border text-xs space-y-1.5 ${themeInnerCardClass}`}>
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className={themeSubtextClass}>{t("payloadGuard", "Payload Load Guard")}:</span>
                  <span className={payloadPercent > 85 ? "text-amber-500 font-black" : "text-emerald-500 font-black"}>
                    {currentWeight} kg / {maxPayload} kg ({payloadPercent}% {t("safeLoad", "Safe Load")})
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
                  <div
                    className={`h-full transition-all duration-500 ${
                      payloadPercent > 90
                        ? "bg-rose-500"
                        : payloadPercent > 70
                        ? "bg-amber-400"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${payloadPercent}%` }}
                  />
                </div>
              </div>

              {/* Compliance Documents Checklist */}
              <div className={`p-3 rounded-2xl border text-xs space-y-1.5 ${themeInnerCardClass}`}>
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className={themeTitleClass}>{t("complianceShieldTitle", "Fleet Compliance & Health Shield")}</span>
                  <button
                    type="button"
                    onClick={() => setShieldDrawerOpen(true)}
                    className="text-amber-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> Commercial DL
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> Vehicle RC Book
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> Goods Insurance
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> Heavy Tirpal
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Today's Completed Trips Timeline */}
            <div className={`p-5 rounded-3xl border shadow-xl space-y-3 ${themeCardClass}`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-wider ${themeSubtextClass}`}>
                  {t("todayTripsTitle", "Today's Completed Trips")}
                </span>
                <span className="text-[10px] font-mono text-emerald-500 font-bold">
                  {state.driverTotalTrips} Completed
                </span>
              </div>

              <div className="space-y-2">
                {[
                  {
                    id: "ORD-9912",
                    site: "Shaheed Path Sector 7 Villa",
                    pay: 680,
                    time: "1:45 PM",
                  },
                  {
                    id: "ORD-9884",
                    site: "Gomti Nagar Extn Foundation",
                    pay: 820,
                    time: "11:15 AM",
                  },
                ].map((trip) => (
                  <div
                    key={trip.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${themeInnerCardClass}`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-amber-500">#{trip.id}</span>
                        <span className={`truncate max-w-[150px] font-semibold ${themeTitleClass}`}>{trip.site}</span>
                      </div>
                      <p className={`text-[10px] ${themeSubtextClass}`}>
                        {trip.time} • {t("tripDelivered", "Site Delivered & Geo-Verified")}
                      </p>
                    </div>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      +₹{trip.pay}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          3. GEO-PHOTO ESCROW HUD MODAL (Sunlight-Proof & Night Mode)
      ────────────────────────────────────────────────────────────── */}
      {hudOpen && activeMission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`border rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${
              isDark ? "bg-[#111827] border-amber-500/40 text-slate-100" : "bg-white border-amber-300 text-slate-900"
            }`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${isDark ? "border-slate-800" : "border-slate-100"}`}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className={`text-base font-black ${themeTitleClass}`}>
                  {t("hudTitle", "Geo-Photo Escrow Verifier")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setHudOpen(false)}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition cursor-pointer ${
                  isDark ? "bg-slate-800 text-slate-400 hover:text-white border-slate-700" : "bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200"
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated GPS Radar Lock */}
            <div className={`p-3.5 rounded-2xl border space-y-1 text-xs ${themeInnerCardClass}`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase ${themeSubtextClass}`}>
                  {t("gpsRadarMatch", "GPS Radar Match")}
                </span>
                <span className="text-emerald-500 font-mono font-black flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  9m Distance (99% Match)
                </span>
              </div>
              <p className={`text-[11px] font-semibold ${themeTitleClass}`}>
                {t("gpsLockedText", "Locked to site coordinates:")} <strong className="text-amber-500">{activeMission.siteName}</strong>
              </p>
            </div>

            {/* Handover OTP Verifier */}
            <div>
              <label className={`text-[10px] font-black uppercase tracking-wider block mb-1.5 ${themeTitleClass}`}>
                {t("customerOtpLabel", "Customer 4-Digit Handover OTP:")}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={4}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="Enter 4-digit OTP (e.g. 2026)"
                  className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-mono font-black text-center outline-none focus:border-amber-400 border ${
                    isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setOtpInput("2026")}
                  className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl transition cursor-pointer shadow-xs"
                >
                  {t("oneTapDemoOtp", "1-Tap 2026")}
                </button>
              </div>
            </div>

            {/* Mandatory Snap Unloading Photo Proof */}
            <div>
              <label className={`text-[10px] font-black uppercase tracking-wider block mb-1.5 ${themeTitleClass}`}>
                {t("mandatoryUnloadProof", "Mandatory Site Unloading Proof:")}
              </label>
              {isPhotoUploaded ? (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> {t("photoVerifiedBadge", "✓ Photo Proof Verified")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsPhotoUploaded(false)}
                    className="text-[10px] text-amber-500 hover:underline cursor-pointer"
                  >
                    {t("changePhotoBtn", "Change")}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSimulatePhoto}
                  className={`w-full py-3.5 rounded-2xl border border-dashed text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                    isDark ? "bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800"
                  }`}
                >
                  <Camera className="w-4 h-4 text-amber-500" />
                  <span>{t("snapPhotoBtn", "Snap / Simulate Unloading Photo Proof")}</span>
                </button>
              )}
            </div>

            {/* Rain-Shield Tarpaulin Photo Gate */}
            {state.isRainModeActive && (
              <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-800/50 space-y-2 text-xs">
                <div className="flex items-center justify-between text-cyan-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                    {t("rainTirpalVerify", "Rain-Shield Tirpal Dry Verification:")}
                  </span>
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300">
                    {t("rainTirpalMandatory", "MANDATORY")}
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-[11px]">
                  <input
                    type="checkbox"
                    checked={isTarpaulinVerified}
                    onChange={(e) => setIsTarpaulinVerified(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-0 bg-slate-800 border-slate-600"
                  />
                  <span>{t("rainTirpalCheck", "Tarpaulin inspected: 100% moisture sealed & dry during road transit.")}</span>
                </label>
              </div>
            )}

            {/* Complete & Submit Button */}
            <button
              type="button"
              onClick={handleEscrowSubmit}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition cursor-pointer active:scale-98"
            >
              {t("submitEscrowCashoutBtn", "Submit Geo-Proof & Cashout")} (+₹{activeMission.deliveryFee + activeMission.palledariBonus})
            </button>
          </motion.div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. BREAKDOWN / DHALAI SOS MODAL
      ────────────────────────────────────────────────────────────── */}
      {sosModalOpen && activeMission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`border border-rose-500/60 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-4 ${
              isDark ? "bg-[#181116] text-slate-100" : "bg-white text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2 text-rose-500 border-b border-rose-900/30 pb-3">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <h3 className={`text-base font-black ${themeTitleClass}`}>
                {t("sosModalTitle", "Emergency Dhalai SOS Alert")}
              </h3>
            </div>

            <p className={`text-xs ${themeSubtextClass}`}>
              {t("sosModalDesc", "Pushes high-priority alert directly to CONON COMMAND OS God-Eye radar. A replacement loader or rescue mechanic will be dispatched immediately.")}
            </p>

            <div>
              <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${themeTitleClass}`}>
                {t("sosReasonLabel", "Reason for Breakdown / Delay:")}
              </label>
              <select
                value={sosReason}
                onChange={(e) => setSosReason(e.target.value)}
                className={`w-full rounded-xl p-2.5 text-xs outline-none border ${
                  isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              >
                <option value="Tyre Puncture / Overheat near Shaheed Path">Tyre Puncture / Overheat near Shaheed Path</option>
                <option value="Engine Stall with 25 Bags Cement on Board">Engine Stall with 25 Bags Cement on Board</option>
                <option value="Site Entry Blocked by Local Encroachment">Site Entry Blocked by Local Encroachment</option>
                <option value="Traffic Choke at Naka Hindola Cross">Traffic Choke at Naka Hindola Cross</option>
              </select>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSosModalOpen(false)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer border ${
                  isDark ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {t("cancelBtn", "Cancel")}
              </button>
              <button
                type="button"
                onClick={handleSosSubmit}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-rose-600/30 cursor-pointer active:scale-95 transition"
              >
                {t("broadcastSosBtn", "Broadcast SOS Alert 🚨")}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. INSTANT UPI CASHOUT CONFIRMATION MODAL
      ────────────────────────────────────────────────────────────── */}
      {cashoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`border rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 ${
              isDark ? "bg-[#111827] border-emerald-500/40 text-slate-100" : "bg-white border-emerald-300 text-slate-900"
            }`}
          >
            {isCashoutProcessing ? (
              <div className="py-6 space-y-3">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin mx-auto" />
                <h3 className={`text-base font-black ${themeTitleClass}`}>
                  {t("withdrawingUpi", "Transferring to UPI…")}
                </h3>
                <p className={`text-xs ${themeSubtextClass}`}>
                  Authenticating NPCI IMPS 24x7 instant settlement gateway
                </p>
              </div>
            ) : cashoutSuccess ? (
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className={`text-lg font-black ${themeTitleClass}`}>
                    {lang === "hi" ? "यूपीआई ट्रांसफर सफल! 🎉" : "Instant UPI Cashout Successful! 🎉"}
                  </h3>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                    ₹{state.driverTodayKamai.toLocaleString("en-IN")}
                  </p>
                  <p className={`text-xs mt-1 ${themeSubtextClass}`}>
                    Beneficiary: <strong className={themeTitleClass}>{driverSession?.firmOrName || currentApplication?.ownerOrDriverName || "Verified Driver Partner"}</strong> • NPCI Ref: IMPS-998124
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCashoutModalOpen(false)}
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer shadow-md"
                >
                  Done
                </button>
              </div>
            ) : null}
          </motion.div>
        </div>
      )}

      {/* Compliance Health Shield Drawer */}
      <ComplianceHealthShieldDrawer
        isOpen={shieldDrawerOpen}
        onClose={() => setShieldDrawerOpen(false)}
        driverName={activeDriverName}
        vehiclePlate={activeVehiclePlate}
      />

      {/* Driver Register Wizard Modal */}
      {registerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="my-8 w-full max-w-4xl">
            <DriverRegisterWizard
              onCancel={() => setRegisterModalOpen(false)}
              onSuccess={() => {
                setRegisterModalOpen(false);
                setActiveDriverMode("APPLICANT");
              }}
            />
          </div>
        </div>
      )}

      {/* Driver Site DNA & Road Intelligence Drawer */}
      <DriverSiteDnaDrawer
        isOpen={siteDnaDrawerOpen}
        onClose={() => setSiteDnaDrawerOpen(false)}
        orderId={activeMission?.id}
        siteName={activeMission?.siteName}
        siteAddress={activeMission?.siteAddress}
      />
    </div>
  );
}

export default LoaderRiderCockpit;
