import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Store,
  Zap,
  Volume2,
  CheckSquare,
  Square,
  QrCode,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Clock,
  Truck,
  IndianRupee,
  RefreshCw,
  Power,
  ChevronDown,
  Lock,
  ArrowUpRight,
  Sparkles,
  Layers,
  PhoneCall,
  MapPin,
  CheckCircle2,
  Radio,
  Mic,
  MicOff,
  ExternalLink,
  Split,
  Check,
  Flame,
  PackageCheck,
  Navigation,
  FileCheck2,
  PlusCircle,
  Camera,
  PackageX,
  Eye,
  Grid,
  Search,
  Filter,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useFourPanelRelay,
  RelayOrder,
  LUCKNOW_PARTNER_HUBS,
  type LucknowPartnerHubInfo,
} from "@/context/FourPanelRelayContext";
import { SocketStatusPill } from "@/services/socket";
import { IS_LOCAL_ADMIN } from "@/config/adminGuard";
import { toast } from "sonner";
import { playOrderChime, playCashoutChime } from "@/lib/sound";
import { useKyc } from "@/context/KycContext";
import { KycSandboxPendingBanner } from "@/components/kyc/KycSandboxPendingBanner";
import { VendorRegisterWizard } from "@/components/kyc/VendorRegisterWizard";
import { VendorCatalogStudio, CATEGORY_ICON_MAP } from "./VendorCatalogStudio";
import { ProductImageUploader } from "./ProductImageUploader";
import { VendorServicesFleetWorkspace } from "./VendorServicesFleetWorkspace";
import { HOME_CATEGORIES } from "@/data/homeCategories";
import { updateProductImageApi, resetProductImageApi, toggleCategoryApi } from "@/services/vendorCatalogSync";
import { useVendorTheme, VendorThemeToggle } from "@/context/VendorThemeContext";
import { useVendorLang, VendorLanguageToggle } from "@/context/VendorLanguageContext";
import { feedbackSync, type DisputeTicket } from "@/services/feedbackSync";

export interface PartnerDukaanOSProps {
  onLogout?: () => void;
  session?: any;
}

export function PartnerDukaanOS({ onLogout, session }: PartnerDukaanOSProps = {}) {
  const { isDark } = useVendorTheme();
  const { t, lang } = useVendorLang();

  const {
    state,
    toggleVendorDuty,
    setVendorHub,
    simulateIncomingExpressOrder,
    acceptVendorOrder,
    toggleChecklistItem,
    markOrderLoaded,
    toggleStockKillSwitch,
    lockBulkHedge,
    readoutHinglishOrder,
    splitHubOrder,
    adminReleaseEscrow,
  } = useFourPanelRelay();

  // Navigation / UI States
  const { currentApplication, applications, setActiveApplicantId } = useKyc();
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [catalogStudioOpen, setCatalogStudioOpen] = useState(false);
  const [stripSearch, setStripSearch] = useState("");
  const [stripOnlyActive, setStripOnlyActive] = useState(false);
  const [categoryPowerState, setCategoryPowerState] = useState<Record<string, boolean>>({});
  const [inlinePhotoProduct, setInlinePhotoProduct] = useState<{
    id: string;
    name: string;
    price: number;
    category: string;
    image?: string;
  } | null>(null);
  const [hubDropdownOpen, setHubDropdownOpen] = useState(false);
  const [activeVoiceOrder, setActiveVoiceOrder] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"buzzer" | "stock" | "payouts" | "services_fleet">("buzzer");

  // Voice Command Bar State
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null);
  const [waveActive, setWaveActive] = useState(false);

  // Invisible Warehouse Split Modal / Inline State
  const [splitOrderId, setSplitOrderId] = useState<string | null>(null);
  const [selectedMissingItem, setSelectedMissingItem] = useState("Astral CPVC Pro Pipes 1\" (4 Lengths)");
  const [selectedSplitHub, setSelectedSplitHub] = useState("Shri Balaji Traders — Aminabad Hardware Mandi (1.2 km)");
  const [splitPayoutCut, setSplitPayoutCut] = useState(1200);

  // Find active hub metadata
  const currentHubInfo: LucknowPartnerHubInfo = useMemo(() => {
    return (
      LUCKNOW_PARTNER_HUBS.find((h) => h.name === state.vendorHub) ||
      LUCKNOW_PARTNER_HUBS[0]
    );
  }, [state.vendorHub]);

  // Live Shop Quality Pulse & Escrow Dispute Sync
  const [activeDisputes, setActiveDisputes] = useState<DisputeTicket[]>(() => feedbackSync.getDisputes());

  useEffect(() => {
    const unsub = feedbackSync.subscribe((event) => {
      if (event.type === "DISPUTE_ALERT" || event.type === "DISPUTE_RESOLVED" || event.type === "CUSTOMER_FEEDBACK") {
        setActiveDisputes(feedbackSync.getDisputes());
      }
    });
    return () => unsub();
  }, []);

  const openDamageDispute = useMemo(() => {
    return activeDisputes.find((d) => d.status === "ESCROW_DISPUTE_HOLD");
  }, [activeDisputes]);

  // Derived metrics
  const activeIncomingOrders = useMemo(
    () => state.orders.filter((o) => o.status === "NEW_INCOMING" || o.status === "ACCEPTED_PACKING"),
    [state.orders]
  );

  const activeInFlightOrders = useMemo(
    () => state.orders.filter((o) => o.status !== "ESCROW_SETTLED"),
    [state.orders]
  );

  const escrowDispatchedOrders = useMemo(
    () => state.orders.filter((o) => o.status !== "NEW_INCOMING"),
    [state.orders]
  );

  const escrowLockedAmount = useMemo(() => {
    return activeInFlightOrders.reduce((sum, o) => sum + (o.netDealerPayout || 0), 0);
  }, [activeInFlightOrders]);

  // Handle Speech / Hinglish Readout with language sync
  const handleVoicePlay = (order: RelayOrder) => {
    setActiveVoiceOrder(order.id);
    readoutHinglishOrder(order, lang);
    setTimeout(() => setActiveVoiceOrder(null), 5500);
  };

  // Hands-Free Voice Demo Chip Trigger
  const triggerVoiceCommand = (command: "ACCEPT_ORDER" | "STOCK_OUT" | "SIMULATE_ORDER") => {
    setWaveActive(true);
    setIsListening(true);

    if (command === "ACCEPT_ORDER") {
      setVoiceTranscript(lang === "hi" ? 'सुना: "नया आर्डर तुरंत स्वीकार करो"' : 'Transcribed: "Naya order turant accept karo"');
      setTimeout(() => {
        setIsListening(false);
        setWaveActive(false);
        const target = activeIncomingOrders.find((o) => o.status === "NEW_INCOMING");
        if (target) {
          acceptVendorOrder(target.id);
          toast.success(lang === "hi" ? `वॉयस आदेश पूरा: #${target.shortId} स्वीकार किया!` : `Voice Command Executed: Order #${target.shortId} Accepted!`);
        } else {
          toast.info(lang === "hi" ? "कतार में कोई नया आर्डर नहीं है।" : "Voice Command: No pending new order in queue to accept.");
        }
      }, 1200);
    } else if (command === "STOCK_OUT") {
      setVoiceTranscript(lang === "hi" ? 'सुना: "ओपीसी 53 सीमेंट आउट ऑफ स्टॉक करो"' : 'Transcribed: "OPC 53 Cement Out of Stock karo"');
      setTimeout(() => {
        setIsListening(false);
        setWaveActive(false);
        toggleStockKillSwitch("cement-opc53");
        toast.success(lang === "hi" ? "वॉयस आदेश: ओपीसी 53 सीमेंट स्टॉक बदला गया!" : "Voice Command Executed: OPC 53 Cement stock status toggled!");
      }, 1200);
    } else if (command === "SIMULATE_ORDER") {
      setVoiceTranscript(lang === "hi" ? 'सुना: "नया एक्सप्रेस आर्डर सिम्युलेट करो"' : 'Transcribed: "Naya express order simulate karo"');
      setTimeout(() => {
        setIsListening(false);
        setWaveActive(false);
        simulateIncomingExpressOrder(lang === "hi" ? "सिविल ठेकेदार (वॉयस ट्रिगर)" : "Civil Contractor (Voice Triggered)");
      }, 1200);
    }
  };

  // Close dropdown on outside click
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setHubDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Visual Theme Classes
  const themeCardClass = isDark
    ? "bg-[#111827] border-slate-800 text-slate-100 shadow-xl"
    : "bg-white border-slate-200 text-slate-900 shadow-sm";

  const themeInnerClass = isDark
    ? "bg-[#161F30] border-slate-800/80"
    : "bg-slate-50 border-slate-200";

  const themeSubtextClass = isDark ? "text-slate-400" : "text-slate-500";
  const themeTitleClass = isDark ? "text-white" : "text-slate-900";

  return (
    <div
      className={`min-h-screen flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950 pb-16 transition-colors duration-200 ${
        isDark ? "bg-[#0B1120] text-slate-100" : "bg-[#F6F7F9] text-slate-900"
      }`}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. TOP COMMAND HEADER BAR (High-Contrast Shop Counter Layout)
      ────────────────────────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-md border-b px-4 sm:px-6 py-2.5 shadow-md transition-colors duration-200 ${
          isDark ? "bg-[#111827]/95 border-slate-800" : "bg-white/95 border-slate-200"
        }`}
      >
        <div className="max-w-[1680px] mx-auto flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          {/* LEFT: Official CONON Brand Lockup & Master Hub Switcher Dropdown */}
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
              <Store className="w-4 h-4 text-slate-950" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-black tracking-widest uppercase ${
                    isDark ? "text-amber-400" : "text-amber-600"
                  }`}
                >
                  {t("brandTagline", "CONON PARTNER")}
                </span>
                <span
                  className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                    isDark
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                      : "bg-emerald-50 text-emerald-700 border-emerald-300"
                  }`}
                >
                  {t("dukaanOsVersion", "DUKAAN OS v3.0")}
                </span>
                <span className={`hidden sm:inline-flex items-center gap-1 text-[9px] font-bold ${themeSubtextClass}`}>
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  {currentHubInfo.verifiedBadge}
                </span>
                {session?.partnerId && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 border border-amber-300">
                    {session.partnerId}
                  </span>
                )}
              </div>

              {/* 1-Click Hub Switcher Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setHubDropdownOpen(!hubDropdownOpen)}
                  className={`flex items-center gap-1.5 text-sm sm:text-base font-black transition cursor-pointer text-left ${
                    isDark ? "text-white hover:text-amber-400" : "text-slate-900 hover:text-amber-600"
                  }`}
                >
                  <span className="truncate max-w-[220px] sm:max-w-md">{state.vendorHub}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      hubDropdownOpen ? "rotate-180 text-amber-500" : ""
                    }`}
                  />
                </button>

                {hubDropdownOpen && (
                  <div
                    className={`absolute top-full left-0 mt-2 w-80 sm:w-96 border rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
                      isDark
                        ? "bg-[#161F30] border-slate-700/80 text-slate-100"
                        : "bg-white border-slate-200 text-slate-900 shadow-slate-300/50"
                    }`}
                  >
                    <div
                      className={`px-3 py-2 border-b flex items-center justify-between ${
                        isDark ? "border-slate-800" : "border-slate-100"
                      }`}
                    >
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-wider">
                        {t("hubSwitcherTitle", "1-Click Lucknow Hub Switcher")}
                      </p>
                      <span className={`text-[9px] ${themeSubtextClass}`}>
                        {t("zeroReloadNote", "Zero Page Reload")}
                      </span>
                    </div>

                    <div className="space-y-1.5 mt-2 max-h-72 overflow-y-auto pr-1">
                      {LUCKNOW_PARTNER_HUBS.map((hub) => {
                        const isCurrent = state.vendorHub === hub.name;
                        return (
                          <button
                            key={hub.id}
                            type="button"
                            onClick={() => {
                              setVendorHub(hub.name);
                              setHubDropdownOpen(false);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-between ${
                              isCurrent
                                ? isDark
                                  ? "bg-amber-400/15 border border-amber-500/40 text-amber-300 font-black shadow-inner"
                                  : "bg-amber-50 border border-amber-300 text-amber-900 font-black shadow-xs"
                                : isDark
                                ? "text-slate-300 hover:bg-slate-800/80 hover:text-white border border-transparent"
                                : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <p className="font-bold truncate text-xs">{hub.name}</p>
                              <p className={`text-[10px] truncate mt-0.5 ${themeSubtextClass}`}>
                                {hub.owner} • {hub.zone}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                  isDark
                                    ? "bg-slate-900 text-amber-400"
                                    : "bg-slate-100 text-amber-700"
                                }`}
                              >
                                {hub.rating}
                              </span>
                              {isCurrent && (
                                <Check className="w-4 h-4 text-amber-500 ml-auto mt-1" />
                              )}
                            </div>
                          </button>
                        );
                      })}

                      {/* Fresh Onboarded / Pending Dukaan Applicants */}
                      {applications
                        .filter((a) => a.applicantType === "VENDOR")
                        .map((app) => {
                          const isCurrent = state.vendorHub === app.firmOrName;
                          return (
                            <button
                              key={app.id}
                              type="button"
                              onClick={() => {
                                setVendorHub(app.firmOrName);
                                setActiveApplicantId(app.applicantId);
                                setHubDropdownOpen(false);
                              }}
                              className={`w-full text-left p-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-between ${
                                isCurrent
                                  ? isDark
                                    ? "bg-amber-400/15 border border-amber-500/40 text-amber-300 font-black shadow-inner"
                                    : "bg-amber-50 border border-amber-300 text-amber-900 font-black"
                                  : isDark
                                  ? "text-slate-300 hover:bg-slate-800/80 hover:text-white border border-slate-800"
                                  : "text-slate-700 hover:bg-slate-100 border border-slate-200"
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[8px] font-black px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                    {app.status === "APPROVED" ? "VERIFIED" : t("underKycBadge", "UNDER KYC")}
                                  </span>
                                  <p className={`font-bold truncate text-xs ${themeTitleClass}`}>{app.firmOrName}</p>
                                </div>
                                <p className={`text-[10px] truncate mt-0.5 ${themeSubtextClass}`}>
                                  {app.ownerOrDriverName} • {app.zone}
                                </p>
                              </div>
                              {isCurrent && <Check className="w-4 h-4 text-amber-500 ml-auto shrink-0" />}
                            </button>
                          );
                        })}
                    </div>

                    {/* Register New Hardware Dukaan Button */}
                    <div className={`mt-2 pt-2 border-t ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                      <button
                        type="button"
                        onClick={() => {
                          setHubDropdownOpen(false);
                          setRegisterModalOpen(true);
                        }}
                        className={`w-full py-2 px-3 rounded-xl border font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                          isDark
                            ? "bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border-amber-400/40"
                            : "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300"
                        }`}
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>{t("registerNewShop", "+ Register New Hardware Dukaan")}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Online / Busy Duty Master Toggle */}
            <button
              type="button"
              onClick={toggleVendorDuty}
              className={`ml-2 px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-sm ${
                state.vendorOnline
                  ? "bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-emerald-500/20 border border-emerald-400/30"
                  : isDark
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                  : "bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200"
              }`}
              title={t("toggleDutyTitle", "Click to toggle shop between Online and Busy/Rush mode")}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  state.vendorOnline ? "bg-emerald-400 animate-ping" : "bg-amber-500"
                }`}
              />
              <span className="tracking-wide">
                {state.vendorOnline ? t("onlineDuty", "ONLINE") : t("busyDuty", "BUSY")}
              </span>
            </button>
          </div>

          {/* CENTRE: Hands-Free Voice Command Bar */}
          <div className="w-full lg:w-auto flex-1 max-w-2xl px-1">
            <div
              className={`p-1.5 rounded-2xl border shadow-inner flex flex-wrap items-center justify-between gap-2 transition-colors ${
                isDark
                  ? "bg-[#161F30] border-slate-700/80"
                  : "bg-slate-100 border-slate-200"
              }`}
            >
              {/* Mic Icon & Waveform */}
              <div className="flex items-center gap-2 pl-1.5">
                <button
                  type="button"
                  onClick={() => triggerVoiceCommand("ACCEPT_ORDER")}
                  className={`p-2 rounded-xl text-slate-950 font-black transition flex items-center justify-center cursor-pointer shadow ${
                    isListening || waveActive
                      ? "bg-emerald-400 shadow-emerald-400/40 animate-pulse"
                      : "bg-amber-400 hover:bg-amber-300 shadow-amber-400/20"
                  }`}
                  title="Click to trigger voice command readout"
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>

                {/* Animated Waveform Display */}
                <div className="flex items-center gap-0.5 h-4 px-1">
                  {[40, 75, 100, 60, 90, 45, 80].map((h, idx) => (
                    <span
                      key={idx}
                      className={`w-0.5 rounded-full transition-all duration-150 ${
                        waveActive
                          ? "bg-amber-500"
                          : isDark
                          ? "bg-slate-600"
                          : "bg-slate-300"
                      }`}
                      style={{
                        height: waveActive ? `${Math.max(4, Math.round(h * Math.random()))}px` : "4px",
                      }}
                    />
                  ))}
                </div>

                <div className="hidden sm:block text-left">
                  <p className={`text-[11px] font-semibold truncate max-w-[190px] ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}>
                    {voiceTranscript || t("voicePrompt", "Bol Kar Kahein...")}
                  </p>
                </div>
              </div>

              {/* 3 Interactive Voice Demo Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-0.5">
                <button
                  type="button"
                  onClick={() => triggerVoiceCommand("ACCEPT_ORDER")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer shrink-0 border ${
                    isDark
                      ? "bg-slate-800/90 hover:bg-amber-400 hover:text-slate-950 text-slate-300 border-slate-700"
                      : "bg-white hover:bg-amber-400 hover:text-slate-950 text-slate-700 border-slate-200 shadow-xs"
                  }`}
                >
                  {t("voiceChipAccept", '✨ "Accept New Order"')}
                </button>

                <button
                  type="button"
                  onClick={() => triggerVoiceCommand("STOCK_OUT")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer shrink-0 border ${
                    isDark
                      ? "bg-slate-800/90 hover:bg-rose-500 hover:text-white text-slate-300 border-slate-700"
                      : "bg-white hover:bg-rose-500 hover:text-white text-slate-700 border-slate-200 shadow-xs"
                  }`}
                >
                  {t("voiceChipStockOut", '⚡ "Mark OPC Out of Stock"')}
                </button>

                <button
                  type="button"
                  onClick={() => triggerVoiceCommand("SIMULATE_ORDER")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition cursor-pointer shrink-0 border ${
                    isDark
                      ? "bg-amber-400/15 hover:bg-amber-400 hover:text-slate-950 text-amber-300 border-amber-500/30"
                      : "bg-amber-100 hover:bg-amber-400 hover:text-slate-950 text-amber-900 border-amber-300"
                  }`}
                >
                  {t("voiceChipSimulate", '📦 "Simulate Express Order"')}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Language Toggle, Theme Toggle, Socket & KPIs */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Language Switcher Pill (EN | हिंदी) */}
            <VendorLanguageToggle />

            {/* Auto / Light / Dark Theme Toggle */}
            <VendorThemeToggle />

            {/* Live Socket Status Pill */}
            <SocketStatusPill />

            {/* Shop Quality Pulse Badge */}
            <div
              className={`px-2.5 py-1 rounded-xl border text-left transition-all ${
                openDamageDispute
                  ? "bg-rose-500/15 border-rose-500/50 text-rose-500 animate-pulse"
                  : isDark
                  ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-400"
                  : "bg-emerald-50 border-emerald-200 text-emerald-800 shadow-xs"
              }`}
            >
              <span className={`text-[8px] uppercase tracking-wider block font-bold opacity-80`}>
                {lang === "hi" ? "दुकान क्वालिटी पल्स" : "Shop Quality Pulse"}
              </span>
              <span className="text-xs font-black font-mono flex items-center gap-1">
                {openDamageDispute ? (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                    <span>{lang === "hi" ? "1 कटी बोरी अलर्ट (होल्ड)" : "1 Torn Bag Alert (Hold)"}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{lang === "hi" ? "98% ताज़ा स्टॉक स्कोर • 0 कटी बोरी" : "98% Fresh Stock Score • 0 Torn Bags"}</span>
                  </>
                )}
              </span>
            </div>

            {/* KPI 1: Active Orders */}
            <div
              className={`px-2.5 py-1 rounded-xl border text-left ${
                isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-xs"
              }`}
            >
              <span className={`text-[8px] uppercase tracking-wider block font-bold ${themeSubtextClass}`}>
                {t("kpiActiveOrders", "Active Orders")}
              </span>
              <span className="text-xs font-black text-amber-500 font-mono">
                {activeInFlightOrders.length} {t("kpiInFlight", "In Flight")}
              </span>
            </div>

            {/* KPI 2: Today's Settled Earnings ₹ */}
            <div
              className={`px-2.5 py-1 rounded-xl border text-left shadow-xs ${
                isDark
                  ? "bg-emerald-950/40 border-emerald-500/30"
                  : "bg-emerald-50 border-emerald-300 text-emerald-950"
              }`}
            >
              <span
                className={`text-[8px] uppercase tracking-wider block font-bold ${
                  isDark ? "text-emerald-300" : "text-emerald-700"
                }`}
              >
                {t("kpiSettledToday", "Settled UPI (Aaj)")}
              </span>
              <span
                className={`text-xs font-black font-mono ${
                  isDark ? "text-emerald-400" : "text-emerald-700"
                }`}
              >
                ₹{state.vendorTodayEarnings.toLocaleString("en-IN")}
              </span>
            </div>

            {/* KPI 3: Escrow Locked ₹ */}
            <div
              className={`px-2.5 py-1 rounded-xl border text-left ${
                isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-xs"
              }`}
            >
              <span className={`text-[8px] uppercase tracking-wider block font-bold ${themeSubtextClass}`}>
                {t("kpiEscrowLocked", "Escrow Hold")}
              </span>
              <span className="text-xs font-black text-sky-500 font-mono">
                ₹{escrowLockedAmount.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Cross-Launch Links */}
            <div className="flex items-center gap-1.5 pl-1">
              <a
                href="/driver"
                target="_blank"
                rel="noreferrer"
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  isDark
                    ? "bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700"
                    : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs"
                }`}
                title="Open Driver Cockpit in new tab"
              >
                <span>{t("openDriverCockpit", "Driver Tab")}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>

              {IS_LOCAL_ADMIN && (
                <a
                  href="/admin"
                  target="_blank"
                  rel="noreferrer"
                  className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    isDark
                      ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30"
                      : "bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200 shadow-xs"
                  }`}
                  title="Open CONON COMMAND OS Admin Panel"
                >
                  <span>{t("openAdminPanel", "Admin OS")}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              )}

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
        </div>

        {/* MOBILE TAB SELECTOR (Hidden on xl screens) */}
        <div
          className={`xl:hidden max-w-[1680px] mx-auto mt-2.5 pt-2 border-t flex items-center gap-1.5 overflow-x-auto scrollbar-hide ${
            isDark ? "border-slate-800" : "border-slate-200"
          }`}
        >
          <button
            type="button"
            onClick={() => setMobileTab("buzzer")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 ${
              mobileTab === "buzzer"
                ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                : isDark
                ? "text-slate-400 hover:bg-slate-800"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{t("col1Title", "180s Flash Buzzer Queue")}</span>
            {activeIncomingOrders.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-slate-950 text-amber-400">
                {activeIncomingOrders.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileTab("stock")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 ${
              mobileTab === "stock"
                ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                : isDark
                ? "text-slate-400 hover:bg-slate-800"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{t("col2Title", "16-Category Visual Catalog & Hedge")}</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab("payouts")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 ${
              mobileTab === "payouts"
                ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                : isDark
                ? "text-slate-400 hover:bg-slate-800"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t("col3Title", "Escrow-to-UPI Pipeline & Driver Radar")}</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab("services_fleet")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 ${
              mobileTab === "services_fleet"
                ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                : isDark
                ? "text-slate-400 hover:bg-slate-800"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>{t("col4Title", "Services & Fleet")}</span>
          </button>
        </div>
      </header>

      {/* KYC SANDBOX PENDING BANNER / REUPLOAD ALERT */}
      <KycSandboxPendingBanner
        type="VENDOR"
        onSwitchToVerifiedDemo={() => {
          const approved = applications.find(
            (a) => a.applicantType === "VENDOR" && a.status === "APPROVED"
          );
          if (approved) setVendorHub(approved.firmOrName);
        }}
      />

      {/* ─────────────────────────────────────────────────────────────
          2. MASTERPIECE 3-ZONE OPERATIONS COMMAND LAYOUT
      ────────────────────────────────────────────────────────────── */}
      <main className="max-w-[1680px] mx-auto w-full px-4 sm:px-6 mt-6 flex-1 space-y-4">
        {/* Quality Dispute Warning Banner */}
        {openDamageDispute && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
                <AlertCircle className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <p className="text-xs font-black">
                  {lang === "hi"
                    ? `गुणवत्ता अलर्ट: आर्डर #${openDamageDispute.orderId.slice(-4)} पर ${openDamageDispute.affectedQty} कटी/भीगी बोरी की रिपोर्ट दर्ज हुई!`
                    : `Quality Alert: Customer reported ${openDamageDispute.affectedQty} Torn/Wet Bags on Order #${openDamageDispute.orderId.slice(-4)}!`}
                </p>
                <p className="text-[11px] opacity-80">
                  {lang === "hi"
                    ? "एस्क्रो भुगतान होल्ड पर है। एडमिन द्वारा रिफंड या रिप्लेसमेंट अप्रूव होने पर समाधान होगा।"
                    : `Escrow payout of ₹${openDamageDispute.claimAmount} is in Dispute Hold. Awaiting Admin clearance.`}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-rose-500 text-white">
              ESCROW DISPUTE HOLD
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* ═════════════════════════════════════════════════════════
              COLUMN 1 (LEFT ZONE) — 180s FLASH BUZZER & INVISIBLE WAREHOUSE
              Span: xl:col-span-5
          ══════════════════════════════════════════════════════════ */}
          <section
            className={`xl:col-span-5 space-y-4 ${
              mobileTab === "buzzer" ? "block" : "hidden xl:block"
            }`}
          >
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className={`text-base font-black flex items-center gap-2 ${themeTitleClass}`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  {t("col1Title", "180s Flash Buzzer Queue")}
                </h2>
                <p className={`text-xs ${themeSubtextClass}`}>
                  {t("col1Subtitle", "Live site orders awaiting immediate loading")}
                </p>
              </div>
              <span
                className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border ${
                  isDark
                    ? "text-amber-400 bg-amber-400/10 border-amber-500/20"
                    : "text-amber-800 bg-amber-50 border-amber-300"
                }`}
              >
                {activeIncomingOrders.length} {t("kpiInFlight", "In Flight")}
              </span>
            </div>

            {/* Empty State / Magical Live Zero-State */}
            {activeIncomingOrders.length === 0 ? (
              <div
                className={`p-6 sm:p-8 text-center rounded-3xl border transition-all relative overflow-hidden ${
                  isDark
                    ? "bg-gradient-to-b from-[#161F32] to-[#0E1524] border-amber-400/30 shadow-2xl shadow-amber-400/5 ring-1 ring-amber-400/20"
                    : "bg-gradient-to-b from-amber-50/60 to-white border-amber-300 shadow-xl ring-1 ring-amber-400/30"
                }`}
              >
                {/* Glowing status badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono mb-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>
                    {lang === "hi"
                      ? "आपकी दुकान CONON-NOW पर लाइव है"
                      : "Aapki Dukaan CONON-NOW par Live Hai"}
                  </span>
                </div>

                <div className="w-16 h-16 rounded-3xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto mb-3 text-amber-500 shadow-lg shadow-amber-400/10">
                  <Store className="w-8 h-8 text-amber-500" />
                </div>

                <h3 className={`text-base sm:text-lg font-black ${themeTitleClass}`}>
                  {lang === "hi"
                    ? "नए कंस्ट्रक्शन ऑर्डर्स के लिए तैयार"
                    : "Ready for First Site Order"}
                </h3>

                <p className={`text-xs max-w-sm mx-auto mt-1 mb-5 ${themeSubtextClass}`}>
                  {lang === "hi"
                    ? "लखनऊ एक्सप्रेस 60-मिनट डिलीवरी कॉरिडोर एक्टिव है। ठेकेदार का ऑर्डर आते ही 180s लाउड बजर बजेगा।"
                    : "Your hardware counter is live on Lucknow 60-min express radar. Incoming site orders will trigger the 180-second loud buzzer."}
                </p>

                {/* Live System Feature Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-md mx-auto mb-6 text-left">
                  <div className={`p-2.5 rounded-xl border text-xs ${isDark ? "bg-[#090D18] border-slate-800" : "bg-white border-slate-200"}`}>
                    <div className="text-[10px] font-bold text-amber-500">16 CATEGORIES</div>
                    <div className={`font-bold mt-0.5 truncate ${themeTitleClass}`}>Catalog Active</div>
                    <div className="text-[10px] text-emerald-500 font-bold mt-1">✓ 753+ Base SKUs</div>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-xs ${isDark ? "bg-[#090D18] border-slate-800" : "bg-white border-slate-200"}`}>
                    <div className="text-[10px] font-bold text-cyan-400">RAIN SHIELD</div>
                    <div className={`font-bold mt-0.5 truncate ${themeTitleClass}`}>Tirpal Guard</div>
                    <div className="text-[10px] text-cyan-400 font-bold mt-1">✓ Auto-Armed</div>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-xs col-span-2 sm:col-span-1 ${isDark ? "bg-[#090D18] border-slate-800" : "bg-white border-slate-200"}`}>
                    <div className="text-[10px] font-bold text-emerald-400">ESCROW SETTLEMENT</div>
                    <div className={`font-bold mt-0.5 truncate ${themeTitleClass}`}>UPI Payout</div>
                    <div className="text-[10px] text-emerald-400 font-bold mt-1">✓ Instant Payouts</div>
                  </div>
                </div>

                {/* Action Buttons: Buzzer Audio Test & Order Simulation */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      playOrderChime();
                      toast.info("Counter Buzzer Test: Sound Active", {
                        description: "High-pitch 180s alert will sound here whenever site contractors place orders.",
                      });
                    }}
                    className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 cursor-pointer ${
                      isDark
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200"
                    }`}
                  >
                    <Volume2 className="w-4 h-4 text-amber-500" />
                    <span>{lang === "hi" ? "🔔 बजर साउंड टेस्ट करें" : "🔔 Test 180s Buzzer Audio"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => simulateIncomingExpressOrder()}
                    className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-400/20 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-4 h-4" />
                    <span>{t("simulateOrderBtn", "⚡ Simulate Live Contractor Order")}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {activeIncomingOrders.map((order) => {
                  const isNew = order.status === "NEW_INCOMING";
                  const isPacking = order.status === "ACCEPTED_PACKING";
                  const allChecked = order.checklist.every((c) => c.checked);
                  const isSplit = (order.stops && order.stops.length > 1) || order.itemsSummary.includes("Split");

                  return (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`rounded-3xl p-5 border transition-all ${
                        isNew
                          ? isDark
                            ? "bg-gradient-to-br from-[#1C1608] via-[#111827] to-[#111827] border-amber-500 shadow-2xl shadow-amber-500/10 ring-2 ring-amber-500/30"
                            : "bg-gradient-to-br from-amber-50/70 via-white to-white border-amber-400 shadow-xl ring-2 ring-amber-400/30"
                          : themeCardClass
                      }`}
                    >
                      {/* Card Header: Short ID, Vehicle Tag & Site */}
                      <div
                        className={`flex items-start justify-between gap-3 pb-3 border-b ${
                          isDark ? "border-slate-800" : "border-slate-100"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-black uppercase tracking-wider font-mono ${themeTitleClass}`}>
                              #{order.shortId}
                            </span>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                              {order.vehicleTag}
                            </span>
                            {isSplit && (
                              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30 flex items-center gap-1">
                                <Split className="w-2.5 h-2.5" />
                                {lang === "hi" ? "2-स्टॉप स्प्लिट हब" : "2-Stop Split Hub"}
                              </span>
                            )}
                          </div>
                          <h3 className={`text-sm font-bold mt-1 flex items-center gap-1.5 ${themeTitleClass}`}>
                            <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="truncate max-w-[260px]">{order.siteName}</span>
                          </h3>
                        </div>

                        {/* 180s Countdown or Status Badge */}
                        {isNew ? (
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-300 font-mono text-xs font-black animate-pulse">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{order.incomingSecondsLeft}s {lang === "hi" ? "शेष" : "Left"}</span>
                            </div>
                            <span className="text-[9px] text-rose-500 font-semibold mt-1">
                              {lang === "hi" ? "180s में ऑटो-रीरूट" : "Auto-reroutes on 180s breach"}
                            </span>
                          </div>
                        ) : (
                          <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-black flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t("orderAcceptedBadge", "PACKING READY")}</span>
                          </span>
                        )}
                      </div>

                      {/* Items Summary & Customer Details */}
                      <div className="py-3 text-xs space-y-2">
                        <div className={`p-3 rounded-2xl border ${themeInnerClass}`}>
                          <p className={`text-[10px] font-black uppercase tracking-wider ${themeSubtextClass}`}>
                            {lang === "hi" ? "सामग्री सूची (मटेरियल):" : "Required Materials:"}
                          </p>
                          <p className={`font-bold text-sm mt-0.5 leading-snug ${themeTitleClass}`}>
                            {order.itemsSummary}
                          </p>
                          <div className={`flex flex-wrap items-center gap-3 mt-2 text-[11px] font-medium ${themeSubtextClass}`}>
                            <span>
                              {t("weightLabel", "Weight")}: <strong className={`font-mono ${themeTitleClass}`}>{order.weightKg} kg</strong>
                            </span>
                            <span>•</span>
                            <span>
                              {lang === "hi" ? "ग्राहक" : "Customer"}: <strong className={themeTitleClass}>{order.customerName}</strong>
                            </span>
                            <span>•</span>
                            <span className={`font-mono ${themeTitleClass}`}>{order.customerPhone}</span>
                          </div>
                        </div>

                        {/* Guaranteed Payout & Speak Order Readout */}
                        <div className="flex items-center justify-between pt-1">
                          <div>
                            <p className={`text-[10px] font-bold uppercase tracking-wider ${themeSubtextClass}`}>
                              {t("guaranteedNetPayout", "Guaranteed Net Payout")}
                            </p>
                            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                              ₹{order.netDealerPayout.toLocaleString("en-IN")}
                              <span className={`text-[10px] font-bold ml-1.5 font-sans ${themeSubtextClass}`}>
                                (100% Escrow)
                              </span>
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleVoicePlay(order)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                              isDark
                                ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                                : "bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-xs"
                            }`}
                            title="Speak order readout using Speech Synthesis"
                          >
                            <Volume2
                              className={`w-4 h-4 ${
                                activeVoiceOrder === order.id ? "text-amber-500 animate-spin" : themeSubtextClass
                              }`}
                            />
                            <span>
                              {activeVoiceOrder === order.id
                                ? lang === "hi" ? "बोल रहे हैं..." : "Speaking..."
                                : t("speakReadoutBtn", "🔊 Speak Order")}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* "INVISIBLE WAREHOUSE" (1-TAP SPLIT-HUB SHARING) */}
                      <div className={`mt-2 pt-2 border-t ${isDark ? "border-slate-800/60" : "border-slate-100"}`}>
                        {splitOrderId === order.id ? (
                          <div
                            className={`p-3.5 rounded-2xl border space-y-3 ${
                              isDark
                                ? "bg-[#161F30] border-purple-500/40"
                                : "bg-purple-50/60 border-purple-200"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black text-purple-700 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                                <Split className="w-3.5 h-3.5" />
                                {t("splitItemModalTitle", "Invisible Warehouse • Split Missing Item")}
                              </span>
                              <button
                                type="button"
                                onClick={() => setSplitOrderId(null)}
                                className={`text-[10px] hover:underline ${themeSubtextClass}`}
                              >
                                {lang === "hi" ? "रद्द करें" : "Cancel"}
                              </button>
                            </div>

                            <p className={`text-[11px] ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                              {t("splitItemDesc", "Never lose a customer sale. Transfer missing SKUs seamlessly to a 1.5 km partner depot.")}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div>
                                <label className={`text-[10px] block font-bold mb-1 ${themeSubtextClass}`}>
                                  {lang === "hi" ? "कमी वाला सामान (SKU):" : "Missing SKU to Split:"}
                                </label>
                                <input
                                  type="text"
                                  value={selectedMissingItem}
                                  onChange={(e) => setSelectedMissingItem(e.target.value)}
                                  className={`w-full rounded-lg p-2 text-xs font-bold border ${
                                    isDark
                                      ? "bg-[#111827] border-slate-700 text-white"
                                      : "bg-white border-slate-300 text-slate-900"
                                  }`}
                                />
                              </div>

                              <div>
                                <label className={`text-[10px] block font-bold mb-1 ${themeSubtextClass}`}>
                                  {t("neighbourHubLabel", "Select Neighbouring Partner Hub")}:
                                </label>
                                <select
                                  value={selectedSplitHub}
                                  onChange={(e) => setSelectedSplitHub(e.target.value)}
                                  className={`w-full rounded-lg p-2 text-xs font-bold border ${
                                    isDark
                                      ? "bg-[#111827] border-slate-700 text-white"
                                      : "bg-white border-slate-300 text-slate-900"
                                  }`}
                                >
                                  <option value="Shri Balaji Traders — Aminabad Hardware Mandi (1.2 km)">
                                    Aminabad Hardware Mandi (1.2 km)
                                  </option>
                                  <option value="Gomti Nagar Express Depot — Vibhuti Khand (3.4 km)">
                                    Gomti Nagar Depot (3.4 km)
                                  </option>
                                  <option value="Alambagh Heavy Yard — Transport Nagar (4.1 km)">
                                    Alambagh Yard (4.1 km)
                                  </option>
                                </select>
                              </div>
                            </div>

                            <div
                              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                                isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                              }`}
                            >
                              <div>
                                <span className={`text-[10px] block ${themeSubtextClass}`}>
                                  {lang === "hi" ? "आपकी शुद्ध कमाई" : "Your Net Share"}
                                </span>
                                <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                                  ₹{(order.netDealerPayout - splitPayoutCut).toLocaleString("en-IN")}
                                </strong>
                              </div>
                              <span className="text-slate-400 font-bold">+</span>
                              <div>
                                <span className={`text-[10px] block ${themeSubtextClass}`}>
                                  {t("payoutSplitCut", "Sub-Vendor Payout Share")}
                                </span>
                                <strong className="text-purple-600 dark:text-purple-400 font-mono">
                                  ₹{splitPayoutCut.toLocaleString("en-IN")}
                                </strong>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold">
                                1 Chhota Hathi • 2 Stops
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                splitHubOrder(order.id, selectedMissingItem, selectedSplitHub, splitPayoutCut);
                                setSplitOrderId(null);
                              }}
                              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-500/20 transition cursor-pointer"
                            >
                              {t("confirmSplitBtn", "Confirm Split & Dispatch Multi-Stop Route")}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSplitOrderId(order.id)}
                            className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                              isDark
                                ? "bg-[#161F30] hover:bg-slate-800 text-purple-300 border-purple-500/30"
                                : "bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-200"
                            }`}
                          >
                            <Split className="w-3.5 h-3.5 text-purple-500" />
                            <span>{t("splitItemBtn", "Split Missing Item (Invisible Warehouse)")}</span>
                          </button>
                        )}
                      </div>

                      {/* STEP 1: 1-TAP ACCEPT ORDER */}
                      {isNew && (
                        <div className={`mt-3 pt-3 border-t ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                          <button
                            type="button"
                            onClick={() => acceptVendorOrder(order.id)}
                            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{t("acceptOrderBtn", "Accept Order & Start Loading")}</span>
                          </button>
                        </div>
                      )}

                      {/* STEP 2 & 3: LOADING CHECKLIST & SCAN QR HANDOVER */}
                      {isPacking && (
                        <div className={`mt-3 pt-3 border-t space-y-3 ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                          <div>
                            <p className="text-[10px] font-black uppercase text-amber-500 tracking-wider mb-2 flex items-center gap-1.5">
                              <PackageCheck className="w-3.5 h-3.5" />
                              {t("loadingChecklist", "Material Loading Checklist")}:
                            </p>
                            <div className="space-y-1.5">
                              {order.checklist.map((item) => (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => toggleChecklistItem(order.id, item.id)}
                                  className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer border ${
                                    item.checked
                                      ? isDark
                                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                                        : "bg-emerald-50 text-emerald-900 border-emerald-300"
                                      : isDark
                                      ? "bg-[#161F30] text-slate-300 hover:bg-slate-800 border-slate-800"
                                      : "bg-slate-50 text-slate-800 hover:bg-slate-100 border-slate-200"
                                  }`}
                                >
                                  {item.checked ? (
                                    <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                                  ) : (
                                    <Square className="w-4 h-4 text-slate-400 shrink-0" />
                                  )}
                                  <span className={item.checked ? "line-through opacity-80" : ""}>
                                    {item.label}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Fleet Driver Info */}
                          <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${themeInnerClass}`}>
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                                <Truck className="w-4 h-4" />
                              </div>
                              <div>
                                <p className={`font-bold ${themeTitleClass}`}>{order.driverName}</p>
                                <p className={`text-[10px] ${themeSubtextClass}`}>
                                  {t("driverOtpLabel", "Pickup Gate Pass OTP")}:{" "}
                                  <strong className="text-amber-500 font-mono">{order.pickupOtp}</strong>
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] px-2 py-1 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-bold">
                              {lang === "hi" ? "दुकान पर मौजूद" : "At Bay Waiting"}
                            </span>
                          </div>

                          {/* Confirm Loaded & Hand Off */}
                          <button
                            type="button"
                            onClick={() => markOrderLoaded(order.id)}
                            className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-2 cursor-pointer ${
                              allChecked
                                ? "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20 active:scale-98"
                                : isDark
                                ? "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                                : "bg-slate-200 text-slate-500 hover:bg-slate-300 hover:text-slate-900"
                            }`}
                          >
                            <QrCode className="w-4 h-4" />
                            <span>{t("confirmLoadedBtn", "Confirm Material Loaded & Release Driver")}</span>
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ═════════════════════════════════════════════════════════
              COLUMN 2 (CENTRE ZONE) — STOCK KILL-SWITCH, BULK HEDGES & DEMAND RADAR
              Span: xl:col-span-4
          ══════════════════════════════════════════════════════════ */}
          <section
            className={`xl:col-span-4 space-y-6 ${
              mobileTab === "stock" ? "block" : "hidden xl:block"
            }`}
          >
            {/* 2A: 1-Tap Stock Kill-Switch & 16-Category Catalog Strip */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-base font-black flex items-center gap-2 ${themeTitleClass}`}>
                    <Power className="w-4 h-4 text-emerald-500" />
                    {t("col2Title", "16-Category Visual Catalog & Hedge")}
                  </h2>
                  <p className={`text-xs ${themeSubtextClass}`}>
                    {t("col2Subtitle", "1-tap in/out of stock switches and admin rate locks")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCatalogStudioOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-md shadow-amber-400/20 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{lang === "hi" ? "16 कैटलॉग स्टूडियो" : "16-Category Studio"}</span>
                </button>
              </div>

              {/* 16-Category Horizontal Pill Strip */}
              <div className={`p-3 rounded-2xl border space-y-2.5 ${themeCardClass}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Grid className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                      {lang === "hi" ? "16 केटेगरी और स्टॉक पावर स्विच" : "16 Storefront Categories & Power Toggles"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCatalogStudioOpen(true)}
                    className="text-[10px] font-black text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{t("openFullStudioBtn", "Open 16-Category Catalog Studio")}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Filter and Quick Search Controls */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className={`w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 ${themeSubtextClass}`} />
                    <input
                      type="text"
                      value={stripSearch}
                      onChange={(e) => setStripSearch(e.target.value)}
                      placeholder={t("searchCatalogPlaceholder", "Search cement, sariya, pipes, paints, locks...")}
                      className={`w-full rounded-xl pl-7 pr-2 py-1 text-[11px] focus:outline-none focus:border-amber-400 border transition ${
                        isDark
                          ? "bg-[#161F30] border-slate-700/80 text-white placeholder-slate-500"
                          : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
                      }`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setStripOnlyActive(!stripOnlyActive)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-black tracking-wide border transition flex items-center gap-1 cursor-pointer shrink-0 ${
                      stripOnlyActive
                        ? isDark
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-emerald-100 text-emerald-900 border-emerald-300"
                        : isDark
                        ? "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                        : "bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900"
                    }`}
                  >
                    <Filter className="w-2.5 h-2.5" />
                    <span>{lang === "hi" ? "सिर्फ सक्रिय" : "Active Only"}</span>
                  </button>
                </div>

                {/* Category Horizontal Scrolling Strip */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
                  {HOME_CATEGORIES.slice(0, 16)
                    .filter((cat) => {
                      const isEnabled = categoryPowerState[cat.slug] ?? true;
                      if (stripOnlyActive && !isEnabled) return false;
                      if (stripSearch && !cat.title.toLowerCase().includes(stripSearch.toLowerCase())) {
                        return false;
                      }
                      return true;
                    })
                    .map((cat, idx) => {
                      const IconComp = CATEGORY_ICON_MAP[cat.slug] || Grid;
                      const isEnabled = categoryPowerState[cat.slug] ?? true;
                      const stockCount = Math.max(8, 14 - (idx % 4));
                      const totalCount = stockCount + (idx % 3 === 0 ? 2 : 0);

                      return (
                        <div
                          key={cat.slug}
                          className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-2 shrink-0 transition ${
                            isEnabled
                              ? isDark
                                ? "bg-[#161F30] border-slate-700/80 text-slate-200"
                                : "bg-slate-50 border-slate-200 text-slate-800"
                              : isDark
                              ? "bg-rose-950/20 border-rose-900/50 text-slate-400 opacity-60"
                              : "bg-rose-50 border-rose-200 text-slate-500 opacity-60"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setCatalogStudioOpen(true)}
                            className="flex items-center gap-1.5 cursor-pointer hover:text-amber-500 text-left"
                            title={`Open ${cat.title} in Catalog Studio`}
                          >
                            <IconComp className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="truncate max-w-[110px]">{cat.title}</span>
                          </button>

                          {/* Live Stock Ratio Badge */}
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold shrink-0 ${
                              stockCount === totalCount
                                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {stockCount}/{totalCount}
                          </span>

                          {/* Quick 1-Tap Category Power Toggle */}
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();
                              const next = !isEnabled;
                              setCategoryPowerState((prev) => ({ ...prev, [cat.slug]: next }));
                              await toggleCategoryApi(currentHubInfo.id || "hub-naka", cat.slug, next);
                              toast.info(
                                lang === "hi"
                                  ? `केटेगरी "${cat.title}" ${next ? "सक्रिय की गई" : "रोक दी गई"}`
                                  : `Category "${cat.title}" ${next ? "Enabled" : "Paused"}`
                              );
                            }}
                            className={`p-0.5 rounded transition cursor-pointer ${
                              isEnabled
                                ? "text-emerald-500 hover:text-rose-500"
                                : "text-rose-500 hover:text-emerald-500"
                            }`}
                            title={isEnabled ? "Category is ON (Tap to Pause)" : "Category is OFF (Tap to Enable)"}
                          >
                            <Power className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* 1-Tap Stock Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.values(state.vendorStock).map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-2xl p-3.5 border transition-all ${
                      item.inStock
                        ? themeCardClass
                        : isDark
                        ? "bg-rose-950/20 border-rose-900/60 opacity-80"
                        : "bg-rose-50/70 border-rose-200 opacity-80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                        {item.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setInlinePhotoProduct({
                              id: item.id,
                              name: item.name,
                              price: item.dealerRate,
                              category: item.category,
                            })
                          }
                          className={`p-1 rounded-lg transition ${
                            isDark
                              ? "bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-amber-600"
                          }`}
                          title={t("updatePhotoBtn", "Update Photo")}
                        >
                          <Camera className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleStockKillSwitch(item.id)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-black tracking-wide transition flex items-center gap-1 cursor-pointer ${
                            item.inStock
                              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 hover:bg-rose-500/20 hover:text-rose-500"
                              : "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40 hover:bg-emerald-500/20 hover:text-emerald-500"
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          <span>{item.inStock ? t("inStockBadge", "IN STOCK") : t("outOfStockBadge", "OUT")}</span>
                        </button>
                      </div>
                    </div>

                    <h3 className={`text-xs font-bold mt-1 line-clamp-1 ${themeTitleClass}`}>
                      {item.name}
                    </h3>
                    <p className={`text-[10px] mt-0.5 font-medium ${themeSubtextClass}`}>
                      {item.quantityLabel}
                    </p>

                    <div className={`mt-2 pt-2 border-t flex items-center justify-between text-[11px] font-mono ${
                      isDark ? "border-slate-800/80" : "border-slate-100"
                    }`}>
                      <div>
                        <span className={`text-[9px] block font-sans ${themeSubtextClass}`}>
                          {lang === "hi" ? "लागत (डीलर)" : "Landing"}
                        </span>
                        <strong className={themeTitleClass}>₹{item.dealerRate}</strong>
                      </div>
                      <div className="text-right">
                        <span className={`text-[9px] block font-sans ${themeSubtextClass}`}>
                          {lang === "hi" ? "खुदरा (रिटेल)" : "Retail"}
                        </span>
                        <strong className="text-amber-500 font-bold">₹{item.retailRate}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Expand Studio Full Width Button */}
              <button
                type="button"
                onClick={() => setCatalogStudioOpen(true)}
                className={`w-full py-3 rounded-2xl border text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                  isDark
                    ? "bg-[#161F30] hover:bg-slate-800 text-amber-300 hover:text-amber-200 border-amber-500/30"
                    : "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300"
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{t("openFullStudioBtn", "Open 16-Category Catalog Studio")}</span>
              </button>
            </div>

            {/* 2B: Admin Rate-Lock Bulk Hedge Inbox */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-base font-black flex items-center gap-2 ${themeTitleClass}`}>
                    <Lock className="w-4 h-4 text-amber-500" />
                    {t("bulkHedgeTitle", "Admin Rate-Lock Bulk Hedge Inbox")}
                  </h2>
                  <p className={`text-xs ${themeSubtextClass}`}>
                    {t("bulkHedgeSubtitle", "Pre-committed builder volume with advance cash credit")}
                  </p>
                </div>
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  {lang === "hi" ? "शून्य जोखिम" : "Zero Risk"}
                </span>
              </div>

              <div className="space-y-3">
                {state.hedgeOffers.map((hedge) => {
                  const isLocked = hedge.status === "LOCKED";
                  return (
                    <div
                      key={hedge.id}
                      className={`rounded-2xl p-4 border transition-all ${
                        isLocked
                          ? isDark
                            ? "bg-[#111827]/70 border-slate-800 opacity-90"
                            : "bg-slate-100/70 border-slate-200 opacity-90"
                          : isDark
                          ? "bg-[#161F30] border-amber-500/40 shadow-xl shadow-amber-500/5"
                          : "bg-white border-amber-300 shadow-md shadow-amber-100"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-400/10 text-amber-600 dark:text-amber-400 border border-amber-400/20">
                            {t("adminLockOffer", "CONON Admin Volume Commitment")}
                          </span>
                          <h3 className={`text-xs font-black mt-1 ${themeTitleClass}`}>
                            {lang === "hi" ? "लॉक करें" : "Lock"} {hedge.quantity} — {hedge.material}
                          </h3>
                          <p className={`text-[11px] mt-0.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                            {t("lockedRateLabel", "Locked Landing Rate")}:{" "}
                            <strong className="text-amber-500 font-mono">₹{hedge.lockedLandingRate}</strong> •{" "}
                            {t("instantAdvanceLabel", "Instant Advance Credit")}:{" "}
                            <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                              +₹{hedge.instantAdvance.toLocaleString("en-IN")}
                            </strong>
                          </p>
                          <p className={`text-[10px] mt-1 ${themeSubtextClass}`}>
                            Corridor: {hedge.corridor}
                          </p>
                        </div>

                        <div>
                          {isLocked ? (
                            <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {t("hedgeLockedBadge", "100% Hedged • Advance Credited")}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => lockBulkHedge(hedge.id)}
                              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] uppercase tracking-wide shadow-md shadow-amber-400/20 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>{t("lockHedgeBtn", "🤝 Lock Bulk Hedge & Take Advance")}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2C: Next 2-Hour Zone Demand Radar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-base font-black flex items-center gap-2 ${themeTitleClass}`}>
                    <TrendingUp className="w-4 h-4 text-sky-500" />
                    {t("demandRadarTitle", "Next 2-Hour Zone Demand Radar")}
                  </h2>
                  <p className={`text-xs ${themeSubtextClass}`}>
                    {t("demandRadarSubtitle", "Live contractor carts forming in your 4 km radius")}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  {
                    zone: lang === "hi" ? "गोमती नगर एक्सटेंशन (नींव ढलाई)" : "Gomti Nagar Extn (Foundation Pours)",
                    surge: lang === "hi" ? "400 बोरी सीमेंट की मांग संभावित" : "400 Bags Cement Surge Expected",
                    readiness: lang === "hi" ? "तैयार (450 यार्ड में)" : "Ready (450 In Yard)",
                    percent: 85,
                    color: "bg-emerald-500",
                  },
                  {
                    zone: lang === "hi" ? "सुशांत गोल्फ सिटी (छत ढलाई)" : "Sushant Golf City (Slab Casting / Dhalai)",
                    surge: lang === "hi" ? "2.8 टन टीएमटी सरिया की भारी मांग" : "2.8 Ton TMT Steel High Demand",
                    readiness: lang === "hi" ? "तैयार (3.2 टन बंडल)" : "Ready (3.2 Ton Bundles)",
                    percent: 92,
                    color: "bg-amber-500",
                  },
                  {
                    zone: lang === "hi" ? "आलमबाग कमर्शियल (प्लंबिंग कार्य)" : "Alambagh Commercial (Plumbing Rough-in)",
                    surge: lang === "hi" ? "सीपीवीसी व ब्रास फिटिंग्स तेज मांग" : "CPVC & Brass Fittings Spike",
                    readiness: lang === "hi" ? "तैयार (85 पाइप रैक)" : "Ready (85 Pipes Rack)",
                    percent: 74,
                    color: "bg-sky-500",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-2xl border text-xs space-y-1.5 ${themeCardClass}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${themeTitleClass}`}>{item.zone}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {item.readiness}
                      </span>
                    </div>
                    <p className={`text-[11px] ${themeSubtextClass}`}>{item.surge}</p>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
                      <div
                        className={`h-full ${item.color} rounded-full`}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ═════════════════════════════════════════════════════════
              COLUMN 3 (RIGHT ZONE) — ESCROW-TO-UPI PAYOUT PIPELINE & DRIVER RADAR
              Span: xl:col-span-3
          ══════════════════════════════════════════════════════════ */}
          <section
            className={`xl:col-span-3 space-y-4 ${
              mobileTab === "payouts" ? "block" : "hidden xl:block"
            }`}
          >
            <div>
              <h2 className={`text-base font-black flex items-center gap-2 ${themeTitleClass}`}>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                {t("col3Title", "Escrow-to-UPI Pipeline & Driver Radar")}
              </h2>
              <p className={`text-xs ${themeSubtextClass}`}>
                {t("col3Subtitle", "Instant bank settlement upon site photo verification")}
              </p>
            </div>

            {/* Driver Fleet Telemetry Card */}
            <div className={`p-4 rounded-3xl border shadow-xl space-y-3 ${themeCardClass}`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${themeSubtextClass}`}>
                  <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                  {t("driverRadarTitle", "Driver Dispatch Radar")}
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                  {lang === "hi" ? "जीपीएस कनेक्टेड" : "GPS Linked"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <p className={`font-bold ${themeTitleClass}`}>Ramesh Yadav</p>
                  <p className={`text-[10px] font-mono ${themeSubtextClass}`}>Chhota Hathi • UP 32 CH 8912</p>
                </div>
                <a
                  href="tel:+919415088219"
                  className={`p-2 rounded-xl text-emerald-600 dark:text-emerald-400 transition cursor-pointer border ${
                    isDark
                      ? "bg-slate-800 hover:bg-slate-700 border-slate-700"
                      : "bg-slate-100 hover:bg-slate-200 border-slate-200"
                  }`}
                  title={t("callDriverBtn", "Call Driver")}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className={`p-2.5 rounded-xl border text-[11px] flex items-center gap-2 ${themeInnerClass}`}>
                <Navigation className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className={themeTitleClass}>
                  Shaheed Path Corridor • {t("driverEtaLabel", "Estimated Arrival")}: 14 mins
                </span>
              </div>
            </div>

            {/* Escrow Orders Pipeline List */}
            <div className="space-y-3">
              {escrowDispatchedOrders.map((order) => {
                const isSettled = order.escrowProgress === "SETTLED" || order.status === "ESCROW_SETTLED";
                const isVerified = order.escrowProgress === "VERIFIED" || order.status === "DELIVERED_PENDING_ESCROW";
                const isEnRoute = order.escrowProgress === "EN_ROUTE" || order.status === "OUT_FOR_DELIVERY" || order.status === "ARRIVED_AT_SITE";

                return (
                  <div
                    key={order.id}
                    className={`rounded-2xl p-4 border transition-all ${
                      isSettled
                        ? isDark
                          ? "bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-500/5"
                          : "bg-emerald-50 border-emerald-300 shadow-md shadow-emerald-100"
                        : isVerified
                        ? isDark
                          ? "bg-blue-950/20 border-blue-500/40 animate-pulse"
                          : "bg-blue-50 border-blue-300 animate-pulse"
                        : themeCardClass
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`font-mono text-xs font-bold ${themeTitleClass}`}>
                          #{order.shortId}
                        </span>
                        <p className={`text-[11px] font-semibold truncate max-w-[170px] mt-0.5 ${
                          isDark ? "text-slate-300" : "text-slate-700"
                        }`}>
                          {order.siteName}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                          ₹{order.netDealerPayout.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* 4-Step Pipeline Visualizer */}
                    <div className={`mt-3 pt-2.5 border-t ${isDark ? "border-slate-800/80" : "border-slate-100"}`}>
                      <div className={`grid grid-cols-4 gap-1 text-[8px] font-black uppercase text-center mb-1 ${themeSubtextClass}`}>
                        <span className={themeTitleClass}>{t("stageLoaded", "Loaded at Dukaan")}</span>
                        <span className={isEnRoute || isVerified || isSettled ? "text-amber-500 font-bold" : ""}>
                          {t("stageEnRoute", "En Route to Site")}
                        </span>
                        <span className={isVerified || isSettled ? "text-blue-500 font-bold" : ""}>
                          {t("stageVerified", "Geo-Photo Verified")}
                        </span>
                        <span className={isSettled ? "text-emerald-500 font-bold" : ""}>
                          {t("stageSettled", "UPI Settled")}
                        </span>
                      </div>

                      <div className={`w-full h-1.5 rounded-full flex overflow-hidden ${
                        isDark ? "bg-slate-800" : "bg-slate-200"
                      }`}>
                        <div className="w-1/4 h-full bg-emerald-500" />
                        <div
                          className={`w-1/4 h-full ${
                            isEnRoute || isVerified || isSettled ? "bg-amber-500" : "bg-transparent"
                          }`}
                        />
                        <div
                          className={`w-1/4 h-full ${
                            isVerified || isSettled ? "bg-blue-500" : "bg-transparent"
                          }`}
                        />
                        <div
                          className={`w-1/4 h-full ${
                            isSettled ? "bg-emerald-500" : "bg-transparent"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Bottom Status / Settlement Badge */}
                    <div className={`mt-3 pt-2 border-t flex items-center justify-between text-[11px] ${
                      isDark ? "border-slate-800/60" : "border-slate-100"
                    }`}>
                      {isSettled ? (
                        <div className="w-full flex items-center justify-between">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            ✓ {t("stageSettled", "UPI Settled")}
                          </span>
                          <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-300 font-bold">
                            {order.settledUtr || "HDFC9021882194"}
                          </span>
                        </div>
                      ) : isVerified ? (
                        <div className="w-full space-y-1.5">
                          <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                            <FileCheck2 className="w-3.5 h-3.5" />
                            {t("stageVerified", "Geo-Photo Verified")}
                          </span>
                          <button
                            type="button"
                            onClick={() => adminReleaseEscrow(order.id)}
                            className="w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] uppercase tracking-wider transition cursor-pointer shadow"
                          >
                            ⚡ {lang === "hi" ? "1-टैप एडमिन यूपीआई रिलीज़" : "1-Tap Trigger Admin UPI Release"}
                          </button>
                        </div>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5" />
                          {t("stageEnRoute", "En Route to Site")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* ── SERVICES & FLEET WORKSPACE (4th panel, mobile + desktop) ── */}
        {mobileTab === "services_fleet" && (
          <section className="max-w-[1680px] mx-auto w-full p-4 xl:p-6">
            <VendorServicesFleetWorkspace
              vendorHubId={currentHubInfo.id || "hub-naka"}
              vendorName={currentHubInfo.name || "CONON Partner Hub"}
              vendorZone={currentHubInfo.zone || "Lucknow"}
            />
          </section>
        )}
      </main>

      {/* VENDOR REGISTRATION WIZARD MODAL */}
      {registerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="my-8 w-full max-w-4xl">
            <VendorRegisterWizard
              onCancel={() => setRegisterModalOpen(false)}
              onSuccess={(app) => {
                setRegisterModalOpen(false);
                if (app?.firmOrName) setVendorHub(app.firmOrName);
              }}
            />
          </div>
        </div>
      )}

      {/* FULL 16-CATEGORY CATALOG STUDIO MODAL / DRAWER */}
      {catalogStudioOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className={`border rounded-3xl w-full max-w-7xl h-[92vh] shadow-2xl overflow-hidden flex flex-col ${
              isDark ? "bg-[#0B1120] border-slate-700" : "bg-white border-slate-300"
            }`}
          >
            <VendorCatalogStudio
              hubId={currentHubInfo.id || "hub-naka"}
              isDrawer
              onClose={() => setCatalogStudioOpen(false)}
            />
          </div>
        </div>
      )}

      {/* INLINE PRODUCT PHOTO UPLOADER */}
      {inlinePhotoProduct && (
        <ProductImageUploader
          productId={inlinePhotoProduct.id}
          productName={inlinePhotoProduct.name}
          categoryName={inlinePhotoProduct.category}
          dealerPrice={inlinePhotoProduct.price}
          currentImageUrl={inlinePhotoProduct.image || ""}
          onSaveImage={async (id, dataUrl) => {
            await updateProductImageApi(currentHubInfo.id || "hub-naka", id, dataUrl);
            setInlinePhotoProduct(null);
          }}
          onResetImage={async (id) => {
            await resetProductImageApi(currentHubInfo.id || "hub-naka", id);
            setInlinePhotoProduct(null);
          }}
          onClose={() => setInlinePhotoProduct(null)}
        />
      )}
    </div>
  );
}

export default PartnerDukaanOS;
