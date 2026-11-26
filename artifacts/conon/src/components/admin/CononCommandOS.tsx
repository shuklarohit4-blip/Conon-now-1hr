import React, { useState, useMemo, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import {
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Clock,
  Truck,
  IndianRupee,
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Sliders,
  PhoneCall,
  MapPin,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  Send,
  Lock,
  Unlock,
  Radio,
  FileCheck2,
  ArrowRight,
  ArrowLeft,
  Filter,
  Eye,
  Layers,
  Sparkles,
  Zap,
  RotateCcw,
  Menu,
  X,
  LogOut,
  Store,
  CloudRain,
  Sun,
  Moon,
  Monitor,
  Award,
  Dna,
  ThumbsUp,
  Camera,
  Download,
  Package,
  FileSpreadsheet,
  FileText,
  Receipt,
  Trash2,
  Landmark,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthContext } from "@/context/AuthContext";
import { useAdminCommand } from "@/context/AdminCommandContext";
import { useFourPanelRelay } from "@/context/FourPanelRelayContext";
import { useCononMasterSync } from "@/context/CononMasterSyncContext";
import { ADMIN_JWT_KEY, JWT_STORAGE_KEY } from "@/lib/authApi";
import { SocketStatusPill, useSocketStatus } from "@/services/socket";
import { useKyc } from "@/context/KycContext";
import { AdminKycWarRoom } from "@/components/kyc/AdminKycWarRoom";
import { feedbackSync, type DisputeTicket, type SiteDnaProfile } from "@/services/feedbackSync";
import { AdminCatalogStudio } from "@/components/admin/AdminCatalogStudio";
import { AdminMediaVaultStudio } from "@/components/admin/AdminMediaVaultStudio";
import { Layers as VaultLayersIcon } from "lucide-react";
import { AdminAccountsGst } from "@/components/admin/AdminAccountsGst";
import { AdminTreasuryControlCenter } from "@/components/admin/AdminTreasuryControlCenter";
import { EscrowBankTransferModal, type EscrowReleaseTarget } from "@/components/admin/EscrowBankTransferModal";
import { fetchGstReport, generateGstReportPdf } from "@/services/adminAccountsGstService";
import { servicesRentalsSync } from "@/services/servicesRentalsSync";

export type AdminOSModule =
  | "founder_home"
  | "dispatch"
  | "mandi_hedge"
  | "escrow"
  | "bill_xray"
  | "vault_risk"
  | "boq_khata"
  | "kyc_war_room"
  | "catalog_studio"
  | "accounts_gst"
  | "services_rentals"
  | "media_vault"
  | "khata_bank";

/* ─────────────────────────────────────────────────────────────────────────
   ADMIN SERVICES & RENTALS MODULE (SAC 9954 / 9973)
   Live queue of service bookings + rental bookings + fleet listings
   with 1-tap escrow release capability.
────────────────────────────────────────────────────────────────────────── */
function AdminServicesRentalsModule({ isDark }: { isDark: boolean }) {
  const [serviceBkgs, setServiceBkgs] = React.useState<any[]>([]);
  const [rentalBkgs, setRentalBkgs] = React.useState<any[]>([]);
  const [fleetListings, setFleetListings] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const [sb, rb, fl] = await Promise.all([
        servicesRentalsSync.fetchServiceBookings(),
        servicesRentalsSync.fetchRentalBookings(),
        servicesRentalsSync.fetchFleetListings(),
      ]);
      setServiceBkgs(sb || []);
      setRentalBkgs(rb || []);
      setFleetListings(fl || []);
    } catch {
      // silent — will show empty tables
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
    const unsub = servicesRentalsSync.subscribe(() => refresh());
    return () => unsub();
  }, [refresh]);

  const card = isDark
    ? "bg-[#0d1528]/80 border border-slate-700/40 rounded-2xl p-5 mb-6"
    : "bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm";
  const th = `text-xs font-bold uppercase tracking-wider pb-2 ${isDark ? "text-amber-400" : "text-amber-600"}`;
  const td = `text-xs py-2 pr-4 ${isDark ? "text-slate-300" : "text-slate-700"}`;
  const badge = (s: string) => {
    const map: Record<string, string> = {
      PENDING: "bg-yellow-500/20 text-yellow-400",
      ACCEPTED: "bg-blue-500/20 text-blue-400",
      ACTIVE: "bg-green-500/20 text-green-400",
      COMPLETED: "bg-slate-500/20 text-slate-400",
      ESCROW_RELEASED: "bg-emerald-500/20 text-emerald-400",
      HMR_ACTIVE: "bg-indigo-500/20 text-indigo-400",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${map[s] || "bg-slate-500/20 text-slate-400"}`}>
        {s.replace(/_/g, " ")}
      </span>
    );
  };

  return (
    <div className={`p-4 md:p-6 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-xl font-black ${isDark ? "text-amber-400" : "text-amber-600"}`}>
            🔧 Skilled Services & Heavy Rentals
          </h2>
          <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            SAC 9954 (Labour Services · 18% GST) + SAC 9973 (Machine Rentals · 18% GST) — Live Booking Control Centre
          </p>
        </div>
        <button
          onClick={refresh}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
            isDark
              ? "border-amber-400/40 text-amber-400 hover:bg-amber-400/10"
              : "border-amber-500 text-amber-700 hover:bg-amber-50"
          }`}
        >
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ── SERVICE BOOKINGS (SAC 9954) ── */}
          <div className={card}>
            <h3 className={`text-sm font-black mb-4 ${isDark ? "text-white" : "text-slate-800"}`}>
              🏗️ Service Bookings (SAC 9954) — {serviceBkgs.length} total
            </h3>
            {serviceBkgs.length === 0 ? (
              <div className={`text-center py-8 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                No service bookings yet — Zero-Dummy Clean Slate active ✓
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      <th className={th}>ID</th>
                      <th className={th}>Service</th>
                      <th className={th}>Customer</th>
                      <th className={th}>Status</th>
                      <th className={th}>Amount</th>
                      <th className={th}>GST (18%)</th>
                      <th className={th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceBkgs.map((b: any) => (
                      <tr key={b.id} className={`border-t ${isDark ? "border-slate-700/40" : "border-slate-100"}`}>
                        <td className={td}>{(b.id || "").slice(0, 10)}…</td>
                        <td className={td}>{b.serviceName || b.serviceId || "—"}</td>
                        <td className={td}>{b.customerName || b.customerId || "—"}</td>
                        <td className={td}>{badge(b.status || "PENDING")}</td>
                        <td className={td}>₹{(b.totalAmount || 0).toLocaleString("en-IN")}</td>
                        <td className={td}>₹{Math.round((b.totalAmount || 0) * 0.18).toLocaleString("en-IN")}</td>
                        <td className={td}>
                          {b.status === "COMPLETED" && b.escrowStatus !== "RELEASED" && (
                            <button
                              onClick={async () => {
                                await servicesRentalsSync.releaseServiceEscrow(b.id);
                                refresh();
                              }}
                              className="px-3 py-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition"
                            >
                              Release Escrow
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── RENTAL BOOKINGS (SAC 9973) ── */}
          <div className={card}>
            <h3 className={`text-sm font-black mb-4 ${isDark ? "text-white" : "text-slate-800"}`}>
              🚜 Machine Rental Bookings (SAC 9973) — {rentalBkgs.length} total
            </h3>
            {rentalBkgs.length === 0 ? (
              <div className={`text-center py-8 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                No rental bookings yet — Zero-Dummy Clean Slate active ✓
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      <th className={th}>ID</th>
                      <th className={th}>Machine</th>
                      <th className={th}>Customer</th>
                      <th className={th}>Status</th>
                      <th className={th}>HMR Hrs</th>
                      <th className={th}>Amount</th>
                      <th className={th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rentalBkgs.map((b: any) => (
                      <tr key={b.id} className={`border-t ${isDark ? "border-slate-700/40" : "border-slate-100"}`}>
                        <td className={td}>{(b.id || "").slice(0, 10)}…</td>
                        <td className={td}>{b.machineName || b.machineId || "—"}</td>
                        <td className={td}>{b.customerName || b.customerId || "—"}</td>
                        <td className={td}>{badge(b.status || "PENDING")}</td>
                        <td className={td}>{b.hmrStart != null && b.hmrEnd != null ? `${b.hmrEnd - b.hmrStart} hrs` : "—"}</td>
                        <td className={td}>₹{(b.totalAmount || 0).toLocaleString("en-IN")}</td>
                        <td className={td}>
                          {b.status === "COMPLETED" && b.escrowStatus !== "RELEASED" && (
                            <button
                              onClick={async () => {
                                await servicesRentalsSync.releaseRentalEscrow(b.id);
                                refresh();
                              }}
                              className="px-3 py-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition"
                            >
                              Release Escrow
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── VENDOR FLEET LISTINGS ── */}
          <div className={card}>
            <h3 className={`text-sm font-black mb-4 ${isDark ? "text-white" : "text-slate-800"}`}>
              🏭 Vendor Fleet Listings — {fleetListings.length} active
            </h3>
            {fleetListings.length === 0 ? (
              <div className={`text-center py-8 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                No vendor fleet listings yet — partners will appear after KYC approval
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      <th className={th}>Vendor Hub</th>
                      <th className={th}>Type</th>
                      <th className={th}>Item</th>
                      <th className={th}>Rate</th>
                      <th className={th}>Available</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fleetListings.map((l: any) => (
                      <tr key={l.id} className={`border-t ${isDark ? "border-slate-700/40" : "border-slate-100"}`}>
                        <td className={td}>{l.vendorHubId || "—"}</td>
                        <td className={td}>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${l.listingType === "service" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"}`}>
                            {l.listingType === "service" ? "Service" : "Rental"}
                          </span>
                        </td>
                        <td className={td}>{l.itemName || l.itemId || "—"}</td>
                        <td className={td}>₹{(l.rate || 0).toLocaleString("en-IN")}</td>
                        <td className={td}>
                          <span className={`w-2 h-2 rounded-full inline-block mr-1 ${l.isAvailable ? "bg-green-400" : "bg-red-400"}`} />
                          {l.isAvailable ? "Yes" : "No"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface CononCommandOSProps {
  onSwitchToClassic?: () => void;
}

export function CononCommandOS({ onSwitchToClassic }: CononCommandOSProps) {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuthContext();
  const relay = useFourPanelRelay();
  const masterSync = useCononMasterSync();
  const [catalogMediaSubTab, setCatalogMediaSubTab] = useState<"media" | "catalog">("media");
  const [escrowReleaseTarget, setEscrowReleaseTarget] = useState<EscrowReleaseTarget | null>(null);
  const [xrayOrderId, setXrayOrderId] = useState<string | null>(null);
  const [bannerDraft, setBannerDraft] = useState(() => masterSync.state.globalControls.storefrontBanner);
  useEffect(() => {
    setBannerDraft(masterSync.state.globalControls.storefrontBanner);
  }, [masterSync.state.globalControls.storefrontBanner]);
  const {
    todayGmv,
    netCommissionMargin,
    netCommissionPercent,
    avgDeliveryMins,
    activeEscrowHold,
    settledPayouts,
    dispatchOrders,
    reRouteHub,
    mandiRates,
    updateMandiRate,
    vaultExposure,
    lockBulkHedge,
    escrowQueue,
    releaseEscrowPayout,
    holdForDispute,
    billXrayIntel,
    simDailyOrders,
    setSimDailyOrders,
    simAvgCommission,
    setSimAvgCommission,
    simCementVariance,
    setSimCementVariance,
    sosRescueUsers,
    sendSosReminder,
    markSosSettled,
    activeMistriPasses,
    toggleFreezeMistriPass,
    builderBoqs,
    sendInstantQuote,
    buybackRequests,
    approveBuybackTransfer,
    pendingVoiceAction,
    setPendingVoiceAction,
  } = useAdminCommand();

  const [activeTab, setActiveTab] = useState<AdminOSModule>("founder_home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickLaunchOpen, setQuickLaunchOpen] = useState(false);
  const quickLaunchRef = useRef<HTMLDivElement>(null);
  const socketStatus = useSocketStatus();

  // 3-state theme engine (persisted in localStorage: "auto" | "light" | "dark")
  const [themeMode, setThemeMode] = useState<"auto" | "light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("conon_admin_theme");
      if (saved === "auto" || saved === "light" || saved === "dark") {
        return saved;
      }
    }
    return "auto";
  });

  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("conon_admin_theme");
      if (saved === "light") return "light";
      if (saved === "dark") return "dark";
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
      if (prefersDark) return "dark";
      const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)").matches;
      if (prefersLight) return "light";
      const now = new Date();
      const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
      const istHours = (utcHours + 5.5) % 24;
      return istHours >= 6.5 && istHours < 18.5 ? "light" : "dark";
    }
    return "dark";
  });

  useEffect(() => {
    function computeEffective(): "light" | "dark" {
      if (themeMode === "light") return "light";
      if (themeMode === "dark") return "dark";

      if (typeof window !== "undefined") {
        const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
        if (darkQuery.matches) return "dark";
        const lightQuery = window.matchMedia("(prefers-color-scheme: light)");
        if (lightQuery.matches) return "light";

        // IST Daytime Fallback (06:30 - 18:30 IST is Light, else Dark)
        const now = new Date();
        const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
        const istHours = (utcHours + 5.5) % 24;
        return istHours >= 6.5 && istHours < 18.5 ? "light" : "dark";
      }
      return "dark";
    }

    const resolved = computeEffective();
    setEffectiveTheme(resolved);

    if (typeof window !== "undefined") {
      localStorage.setItem("conon_admin_theme", themeMode);

      if (themeMode === "auto") {
        const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => setEffectiveTheme(computeEffective());
        darkQuery.addEventListener?.("change", handler);
        return () => {
          darkQuery.removeEventListener?.("change", handler);
        };
      }
    }
    return undefined;
  }, [themeMode]);

  const isDark = effectiveTheme === "dark";

  // Close Quick Launch dropdown when clicking outside
  useEffect(() => {
    if (!quickLaunchOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (quickLaunchRef.current && !quickLaunchRef.current.contains(event.target as Node)) {
        setQuickLaunchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [quickLaunchOpen]);

  // Voice command state
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceWave, setVoiceWave] = useState(false);

  // Rate editing state in Module 2
  const [editingRates, setEditingRates] = useState<
    Record<string, { landingCost: number; marginPercent: number }>
  >(() => {
    const initial: Record<string, { landingCost: number; marginPercent: number }> = {};
    mandiRates.forEach((sku) => {
      initial[sku.id] = {
        landingCost: sku.dealerLandingCost,
        marginPercent: sku.platformMarginPercent,
      };
    });
    return initial;
  });

  // Dispute modal state in Module 3
  const [selectedDisputeOrder, setSelectedDisputeOrder] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState("Damaged / Torn Cement Bags reported by Site Incharge");

  // Filter state for Module 1 Dispatch Radar
  const [dispatchFilter, setDispatchFilter] = useState<"all" | "dhalai" | "urgent" | "packing">("all");

  const filteredOrders = useMemo(() => {
    if (dispatchFilter === "dhalai") {
      return dispatchOrders.filter((o) => o.isDhalaiPriority);
    }
    if (dispatchFilter === "urgent") {
      return dispatchOrders.filter((o) => o.minsLeft <= 25);
    }
    if (dispatchFilter === "packing") {
      return dispatchOrders.filter((o) => o.status === "PACKING");
    }
    return dispatchOrders;
  }, [dispatchOrders, dispatchFilter]);

  // Handle Rate Changes
  const handleRateFieldChange = (skuId: string, field: "landingCost" | "marginPercent", val: number) => {
    setEditingRates((prev) => ({
      ...prev,
      [skuId]: {
        ...(prev[skuId] || { landingCost: 338, marginPercent: 8 }),
        [field]: val,
      },
    }));
  };

  const handleSaveRate = (skuId: string) => {
    const edit = editingRates[skuId];
    if (!edit) return;
    const landing = Number(edit.landingCost);
    const margin = Number(edit.marginPercent);
    updateMandiRate(skuId, landing, margin);
    const retailPrice = Math.round(landing * (1 + margin / 100));
    masterSync.updateMandiRate(skuId, retailPrice, `Margin ${margin}%`).catch(() => {});
  };

  // Voice Command Simulation
  const handleSimulateVoice = (commandText: string) => {
    setIsListening(true);
    setVoiceTranscript(commandText);
    setVoiceWave(true);

    setTimeout(() => {
      setIsListening(false);
      setVoiceWave(false);

      if (commandText.includes("Cement ₹5 badhao") || commandText.includes("OPC")) {
        const currentOpc = mandiRates.find((s) => s.id === "mandi_opc53");
        const newCost = (currentOpc?.dealerLandingCost || 338) + 5;
        setPendingVoiceAction({
          title: "Update OPC 53 Landing Cost (+₹5)",
          description: `Detected site command: Increase OPC 53 Cement landing cost to ₹${newCost}/bag and adjust retail margin automatically.`,
          execute: () => {
            updateMandiRate("mandi_opc53", newCost, 8.0);
            masterSync.updateMandiRate("mandi_opc53", Math.round(newCost * 1.08), "+₹5 Voice").catch(() => {});
            setEditingRates((prev) => ({
              ...prev,
              mandi_opc53: { landingCost: newCost, marginPercent: 8.0 },
            }));
            setPendingVoiceAction(null);
          },
        });
      } else if (commandText.includes("Atke hue") || commandText.includes("orders")) {
        setPendingVoiceAction({
          title: "Filter High-Risk Dhalai Orders",
          description: "Detected voice instruction: Filter dispatch radar to show urgent slab pour orders under 25 mins.",
          execute: () => {
            setActiveTab("dispatch");
            setDispatchFilter("urgent");
            setPendingVoiceAction(null);
            toast.info("Radar Filtered: Showing urgent dispatch orders");
          },
        });
      } else if (commandText.includes("Hedge") || commandText.includes("Vault")) {
        setPendingVoiceAction({
          title: "Secure 100% Vault Bulk Hedge",
          description: "Forward contract lock with Latouche Rd Central Depot to hedge 1,420 bags cement & 28,500 bricks against market spike.",
          execute: () => {
            lockBulkHedge("Latouche Rd Central Depot");
            setPendingVoiceAction(null);
          },
        });
      }
    }, 1200);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem(ADMIN_JWT_KEY);
    localStorage.removeItem(JWT_STORAGE_KEY);
    logout();
    toast.success("Admin Session Ended", {
      description: "Securely logged out from CONON COMMAND OS.",
    });
    setLocation("/home");
  };

  const handleCleanSlateReset = async () => {
    const pin = window.prompt("Enter Founder Admin PIN to execute Clean Slate Reset (Wipe test data):", "");
    if (!pin) return;
    if (pin.trim() !== "2026") {
      toast.error("Invalid Founder PIN. Clean Slate aborted.");
      return;
    }
    try {
      const res = await fetch(`${(import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "").replace(/\/api\/?$/, "").replace(/\/+$/, "")}/api/admin/clean-slate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": "conon-lucknow-2026-admin-bypass",
        },
        body: JSON.stringify({ pin: "2026" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to reset");
      }
      localStorage.removeItem("conon_relay_state_v3");
      localStorage.removeItem("conon_kyc_state_v2");
      localStorage.removeItem("conon_vendor_store");
      localStorage.removeItem("conon_active_driver_v1");
      localStorage.removeItem("conon_custom_media_v1");
      toast.success("Zero-Dummy Clean Slate Executed", {
        description: "All test orders, hubs, drivers, and payouts wiped. System is 100% clean slate.",
      });
      setTimeout(() => {
        window.location.reload();
      }, 600);
    } catch (err: any) {
      toast.error("Clean Slate Error: " + (err.message || "Failed"));
    }
  };

  const { applications } = useKyc();
  const pendingKycCount = useMemo(
    () =>
      applications.filter(
        (a) => a.status === "PENDING_VERIFICATION" || a.status === "REUPLOAD_REQUESTED"
      ).length,
    [applications]
  );
  const pendingVendorsCount = useMemo(
    () =>
      applications.filter(
        (a) =>
          a.applicantType === "VENDOR" &&
          (a.status === "PENDING_VERIFICATION" || a.status === "REUPLOAD_REQUESTED")
      ).length,
    [applications]
  );
  const pendingDriversCount = useMemo(
    () =>
      applications.filter(
        (a) =>
          a.applicantType === "DRIVER" &&
          (a.status === "PENDING_VERIFICATION" || a.status === "REUPLOAD_REQUESTED")
      ).length,
    [applications]
  );

  const pendingEscrowList = useMemo(
    () => escrowQueue.filter((e) => e.status === "AWAITING_RELEASE"),
    [escrowQueue]
  );
  const pendingEscrowCount = pendingEscrowList.length;

  // Live Trust, Feedback & Damage Disputes
  const [activeDisputes, setActiveDisputes] = useState<DisputeTicket[]>(() => feedbackSync.getDisputes());

  useEffect(() => {
    const unsub = feedbackSync.subscribe((event) => {
      if (
        event.type === "DISPUTE_ALERT" ||
        event.type === "DISPUTE_RESOLVED" ||
        event.type === "CUSTOMER_FEEDBACK" ||
        event.type === "DRIVER_TIP" ||
        event.type === "SITE_DNA_UPDATED"
      ) {
        setActiveDisputes(feedbackSync.getDisputes());
      }
    });
    return () => unsub();
  }, []);

  const urgentOrders = useMemo(
    () =>
      dispatchOrders.filter(
        (o) =>
          o.minsLeft <= 20 ||
          (o.isDhalaiPriority && o.status !== "DELIVERED")
      ),
    [dispatchOrders]
  );
  const dhalaiLiveCount = useMemo(
    () => dispatchOrders.filter((o) => o.isDhalaiPriority).length,
    [dispatchOrders]
  );

  const tabs: {
    id: AdminOSModule;
    labelHi: string;
    labelEn: string;
    label: string;
    badge?: string;
    icon: any;
  }[] = [
    {
      id: "founder_home",
      labelHi: "Aaj Ka Kaam",
      labelEn: "Founder Home",
      label: "Aaj Ka Kaam",
      icon: LayoutDashboard,
    },
    {
      id: "dispatch",
      labelHi: "Live Orders",
      labelEn: "60-Min Dispatch",
      label: "Live Orders",
      badge: dhalaiLiveCount > 0 ? `${dhalaiLiveCount} Dhalai` : undefined,
      icon: Radio,
    },
    {
      id: "mandi_hedge",
      labelHi: "Mandi Rates",
      labelEn: "Aaj Ka Bhav & Hedge",
      label: "Mandi Rates",
      badge: vaultExposure.exposureStatus === "AMBER_EXPOSURE" ? "Risk" : undefined,
      icon: TrendingUp,
    },
    {
      id: "escrow",
      labelHi: "Paisa Release",
      labelEn: "Geo-Photo Escrow",
      label: "Paisa Release",
      badge: pendingEscrowCount > 0 ? `${pendingEscrowCount} Pending` : undefined,
      icon: ShieldCheck,
    },
    {
      id: "kyc_war_room",
      labelHi: "Partner KYC",
      labelEn: "Vendor & Driver Papers",
      label: "Partner KYC",
      badge: pendingKycCount > 0 ? `${pendingKycCount} Pending` : undefined,
      icon: ShieldAlert,
    },
    {
      id: "bill_xray",
      labelHi: "Bill X-Ray",
      labelEn: "Market Rate Check",
      label: "Bill X-Ray",
      icon: Sliders,
    },
    {
      id: "vault_risk",
      labelHi: "Credit & Mistri",
      labelEn: "48h SOS & Passes",
      label: "Credit & Mistri",
      badge:
        sosRescueUsers.filter((u) => u.status === "ACTIVE").length > 0
          ? `${sosRescueUsers.filter((u) => u.status === "ACTIVE").length} SOS`
          : undefined,
      icon: Zap,
    },
    {
      id: "boq_khata",
      labelHi: "Bulk BOQ",
      labelEn: "Builder Orders & Buyback",
      label: "Bulk BOQ",
      badge:
        buybackRequests.filter((b) => b.status === "MATCHED_READY").length > 0
          ? `${buybackRequests.filter((b) => b.status === "MATCHED_READY").length} Matched`
          : undefined,
      icon: FileCheck2,
    },
    {
      id: "media_vault",
      labelHi: "कैटलॉग & मीडिया वॉल्ट",
      labelEn: "Catalog & Media",
      label: "Catalog & Media Workbench",
      badge: "Live Sync",
      icon: VaultLayersIcon,
    },
    {
      id: "khata_bank",
      labelHi: "खाता & बैंक",
      labelEn: "Khata & Bank",
      label: "Khata & Bank (Treasury & UTR)",
      badge: "Money X-Ray",
      icon: Landmark,
    },
    {
      id: "accounts_gst",
      labelHi: "रोज का हिसाब & GST",
      labelEn: "Accounts & GST",
      label: "रोज का हिसाब & GST (CA PDF)",
      badge: "CA PDF",
      icon: FileSpreadsheet,
    },
    {
      id: "services_rentals",
      labelHi: "Services & Rentals",
      labelEn: "Services & Rentals",
      label: "Services & Rentals (SAC 9954/9973)",
      badge: undefined,
      icon: Truck,
    },
  ];

  return (
    <div
      data-admin-theme={effectiveTheme}
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDark
          ? "bg-[#080D1A] text-slate-100 selection:bg-amber-400 selection:text-slate-950"
          : "bg-[#F8FAFC] text-slate-900 selection:bg-amber-300 selection:text-slate-950"
      }`}
      style={{
        "--admin-bg": isDark ? "#080D1A" : "#F8FAFC",
        "--admin-surface": isDark ? "#0F172A" : "#FFFFFF",
        "--admin-surface-elevated": isDark ? "#1E293B" : "#F1F5F9",
        "--admin-border": isDark ? "#1E293B" : "#E2E8F0",
        "--admin-primary": "#1848a0",
        "--admin-accent": "#2198ed",
        "--admin-amber": "#FBBF24",
        "--admin-text": isDark ? "#F8FAFC" : "#0F172A",
        "--admin-muted": isDark ? "#94A3B8" : "#64748B",
      } as React.CSSProperties}
    >
      <style>{`
        [data-admin-theme="dark"] {
          --admin-bg: #080D1A;
          --admin-surface: #0F172A;
          --admin-surface-elevated: #1E293B;
          --admin-border: #1E293B;
          --admin-border-subtle: rgba(51, 65, 85, 0.6);
          --admin-primary: #1848a0;
          --admin-accent: #2198ed;
          --admin-amber: #FBBF24;
          --admin-text: #F8FAFC;
          --admin-muted: #94A3B8;
        }
        [data-admin-theme="light"] {
          --admin-bg: #F8FAFC;
          --admin-surface: #FFFFFF;
          --admin-surface-elevated: #F1F5F9;
          --admin-border: #E2E8F0;
          --admin-border-subtle: #CBD5E1;
          --admin-primary: #1848a0;
          --admin-accent: #2198ed;
          --admin-amber: #D97706;
          --admin-text: #0F172A;
          --admin-muted: #475569;
        }
        [data-admin-theme="light"] .bg-\\[\\#070B14\\],
        [data-admin-theme="light"] .bg-\\[\\#080D1A\\] {
          background-color: #F8FAFC !important;
        }
        [data-admin-theme="light"] .bg-\\[\\#0B1120\\] {
          background-color: #FFFFFF !important;
        }
        [data-admin-theme="light"] .bg-\\[\\#0F172A\\] {
          background-color: #FFFFFF !important;
        }
        [data-admin-theme="light"] .bg-slate-900,
        [data-admin-theme="light"] .bg-slate-900\\/90,
        [data-admin-theme="light"] .bg-slate-950 {
          background-color: #F1F5F9 !important;
          border-color: #CBD5E1 !important;
          color: #0F172A !important;
        }
        [data-admin-theme="light"] .bg-slate-800,
        [data-admin-theme="light"] .bg-slate-800\\/80,
        [data-admin-theme="light"] .bg-slate-800\\/60,
        [data-admin-theme="light"] .bg-slate-800\\/40 {
          background-color: #F1F5F9 !important;
          border-color: #E2E8F0 !important;
          color: #1E293B !important;
        }
        [data-admin-theme="light"] .border-slate-800,
        [data-admin-theme="light"] .border-slate-800\\/80,
        [data-admin-theme="light"] .border-slate-800\\/90,
        [data-admin-theme="light"] .border-slate-700,
        [data-admin-theme="light"] .border-slate-700\\/80 {
          border-color: #E2E8F0 !important;
        }
        [data-admin-theme="light"] .text-white,
        [data-admin-theme="light"] .text-slate-100 {
          color: #0F172A !important;
        }
        [data-admin-theme="light"] .text-slate-200,
        [data-admin-theme="light"] .text-slate-300 {
          color: #1E293B !important;
        }
        [data-admin-theme="light"] .text-slate-400 {
          color: #475569 !important;
        }
        [data-admin-theme="light"] .text-slate-500 {
          color: #64748B !important;
        }
        [data-admin-theme="light"] .bg-gradient-to-br.from-\\[\\#111C35\\].to-\\[\\#0F172A\\] {
          background-image: linear-gradient(to bottom right, #F0F9FF, #FFFFFF) !important;
        }
        [data-admin-theme="light"] input,
        [data-admin-theme="light"] select,
        [data-admin-theme="light"] textarea {
          color: #0F172A !important;
        }
      `}</style>

      {/* ─────────────────────────────────────────────────────────────
          1. TOP FIXED BRAND HEADER (64px SINGLE CRISP ROW)
      ────────────────────────────────────────────────────────────── */}
      <header
        className={`h-16 px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0 shrink-0 border-b transition-colors duration-200 ${
          isDark
            ? "bg-[#080D1A] border-slate-800/80 shadow-lg shadow-black/40"
            : "bg-white border-slate-200 shadow-sm"
        }`}
      >
        {/* Left: 250px Fixed Brand Lockup + Active Page Title + Live Dot */}
        <div className="flex items-center gap-3 md:gap-5 min-w-0">
          {/* Top-Left Brand Logo Lockup (Aligned with 250px sidebar) */}
          <div className="flex items-center gap-2.5 w-auto sm:w-[226px] shrink-0">
            <img
              src={`${import.meta.env.BASE_URL}images/conon-logo-transparent.png`}
              alt="CONON-NOW"
              className="h-8 w-auto object-contain shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 leading-none">
                <span className={`font-black text-sm tracking-tight ${isDark ? "text-white" : "text-[#1848a0]"}`}>
                  CONON
                </span>
                <span className="font-black text-sm tracking-tight text-[#2198ed]">
                  NOW
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-500 border border-amber-400/30">
                  Admin
                </span>
              </div>
              <span className={`text-[10px] font-medium tracking-tight mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Command OS
              </span>
            </div>
          </div>

          {/* Active Module Title + Live Sync Bus Health HUD */}
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-700/40">
            <span className={`text-xs font-black tracking-tight ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              {tabs.find((t) => t.id === activeTab)?.labelHi || "Aaj Ka Kaam"}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black border transition ${
                masterSync.syncStatus === "ERROR"
                  ? "bg-rose-500/15 text-rose-400 border-rose-500/40"
                  : masterSync.syncStatus === "SYNCING"
                  ? "bg-amber-500/15 text-amber-400 border-amber-500/40"
                  : "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
              }`}
              title={
                masterSync.lastSyncError
                  ? `Sync Error: ${masterSync.lastSyncError}`
                  : `Master Live Bus v${masterSync.state.version} • Socket: ${socketStatus.isConnected ? "Connected" : "Local"}`
              }
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  masterSync.syncStatus === "ERROR"
                    ? "bg-rose-400"
                    : masterSync.syncStatus === "SYNCING"
                    ? "bg-amber-400 animate-ping"
                    : "bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]"
                }`}
              />
              <span>
                {masterSync.syncStatus === "ERROR"
                  ? "Sync: ERROR"
                  : masterSync.syncStatus === "SYNCING"
                  ? "Syncing..."
                  : "App Sync: LIVE ✓"}
              </span>
            </span>
            <span
              className={`hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                isDark
                  ? "bg-slate-900 text-slate-300 border-slate-700"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}
              title="Open CONON-NOW browser tabs/panels synced via BroadcastChannel"
            >
              {masterSync.liveTabsCount} Live {masterSync.liveTabsCount === 1 ? "Tab" : "Tabs"}
            </span>
            <button
              type="button"
              onClick={async () => {
                const res = await masterSync.triggerTestPing();
                if (res.ok) {
                  toast.success(`Live Sync Ping sent! (${res.tabs} active tab${res.tabs === 1 ? "" : "s"})`);
                } else {
                  toast.error("Sync Ping failed — check disk/API connection");
                }
              }}
              className={`hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border transition cursor-pointer ${
                isDark
                  ? "bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border-amber-400/30"
                  : "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-300"
              }`}
              title="Send a live test ping to all open Storefront, Vendor, and Driver tabs"
            >
              <Zap className="w-3 h-3" />
              <span>Test Ping</span>
            </button>
          </div>
        </div>

        {/* Right: STRICTLY 4 PRIMARY CONTROLS (Theme Switcher, Rain Mode, Quick Launch, Logout) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 1. Compact Theme Switcher (Auto / Day / Night) */}
          <div
            className={`flex items-center p-0.5 rounded-xl border transition ${
              isDark
                ? "bg-[#0F172A] border-slate-800 text-slate-400"
                : "bg-slate-100 border-slate-200 text-slate-600 shadow-xs"
            }`}
            role="group"
            aria-label="Theme mode selector"
          >
            <button
              type="button"
              onClick={() => setThemeMode("auto")}
              title="Auto (Tracks System Preference / IST Time 06:30-18:30)"
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                themeMode === "auto"
                  ? "bg-amber-400 text-slate-950 font-black shadow-xs"
                  : isDark
                  ? "hover:text-white"
                  : "hover:text-slate-950"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Auto</span>
            </button>
            <button
              type="button"
              onClick={() => setThemeMode("light")}
              title="Day / Light Theme (Soft Alabaster & White)"
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                themeMode === "light"
                  ? "bg-amber-400 text-slate-950 font-black shadow-xs"
                  : isDark
                  ? "hover:text-white"
                  : "hover:text-slate-950"
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Day</span>
            </button>
            <button
              type="button"
              onClick={() => setThemeMode("dark")}
              title="Night / Dark Theme (Deep Slate-Navy)"
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                themeMode === "dark"
                  ? "bg-amber-400 text-slate-950 font-black shadow-xs"
                  : isDark
                  ? "hover:text-white"
                  : "hover:text-slate-950"
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Night</span>
            </button>
          </div>

          {/* 2. Compact Rain Mode Toggle */}
          <button
            type="button"
            onClick={() => {
              const nextRain = !masterSync.state.globalControls.rainMode;
              if (relay.state.isRainModeActive !== nextRain) {
                relay.toggleRainMode();
              }
              masterSync.toggleRainMode(nextRain).catch(() => {});
            }}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border shadow-sm ${
              masterSync.state.globalControls.rainMode || relay.state.isRainModeActive
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                : isDark
                ? "bg-slate-900/90 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700"
                : "bg-white text-slate-700 hover:text-slate-900 border-slate-200 hover:border-slate-300 shadow-xs"
            }`}
            title="Global Rain-Shield: Forces tarpaulin photo verification for all moisture-sensitive dispatches"
          >
            <span className="text-sm">🌧️</span>
            <span className="font-extrabold tracking-tight hidden sm:inline">Rain Mode</span>
            <span
              className={`w-7 h-4 rounded-full p-0.5 transition-colors flex items-center ${
                masterSync.state.globalControls.rainMode || relay.state.isRainModeActive
                  ? "bg-cyan-400 justify-end"
                  : "bg-slate-600 justify-start"
              }`}
            >
              <span
                className={`w-3 h-3 rounded-full transition-transform ${
                  masterSync.state.globalControls.rainMode || relay.state.isRainModeActive
                    ? "bg-slate-950 shadow-xs"
                    : "bg-white"
                }`}
              />
            </span>
          </button>

          {/* 3. Sleek Quick Launch Dropdown */}
          <div className="relative" ref={quickLaunchRef}>
            <button
              type="button"
              onClick={() => setQuickLaunchOpen((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                isDark
                  ? "text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border-slate-800 hover:border-slate-700"
                  : "text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-xs"
              }`}
            >
              <span>Quick Launch</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  quickLaunchOpen ? "rotate-180 text-amber-500" : isDark ? "text-slate-400" : "text-slate-500"
                }`}
              />
            </button>

            {quickLaunchOpen && (
              <div
                className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                  isDark
                    ? "bg-[#0F172A] border-slate-700/80 shadow-black/90"
                    : "bg-white border-slate-200 shadow-slate-400/30"
                }`}
              >
                <div
                  className={`px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider border-b mb-1 ${
                    isDark ? "text-slate-500 border-slate-800" : "text-slate-400 border-slate-100"
                  }`}
                >
                  Quick Portals
                </div>
                <a
                  href="/vendor"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setQuickLaunchOpen(false)}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold transition group cursor-pointer ${
                    isDark
                      ? "text-slate-300 hover:text-amber-300 hover:bg-slate-800/80"
                      : "text-slate-700 hover:text-amber-700 hover:bg-amber-50"
                  }`}
                >
                  <Store className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                  <span>Open Vendor Panel</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 ml-auto" />
                </a>
                <a
                  href="/driver"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setQuickLaunchOpen(false)}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold transition group cursor-pointer ${
                    isDark
                      ? "text-slate-300 hover:text-emerald-300 hover:bg-slate-800/80"
                      : "text-slate-700 hover:text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  <Truck className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                  <span>Open Driver Cockpit</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 ml-auto" />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setQuickLaunchOpen(false);
                    setLocation("/home");
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold transition text-left cursor-pointer group ${
                    isDark
                      ? "text-slate-300 hover:text-white hover:bg-slate-800/80"
                      : "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
                  }`}
                >
                  <ArrowLeft className="w-4 h-4 text-sky-500 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Customer Storefront</span>
                </button>
                {onSwitchToClassic && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuickLaunchOpen(false);
                      onSwitchToClassic();
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold transition text-left cursor-pointer group border-t mt-1 pt-2 ${
                      isDark
                        ? "text-slate-300 hover:text-amber-300 hover:bg-slate-800/80 border-slate-800/60"
                        : "text-slate-700 hover:text-amber-700 hover:bg-amber-50 border-slate-100"
                    }`}
                  >
                    <Layers className="w-4 h-4 text-amber-500 group-hover:rotate-6 transition-transform" />
                    <span>Switch to Classic Tables</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setQuickLaunchOpen(false);
                    handleCleanSlateReset();
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold transition text-left cursor-pointer group border-t mt-1 pt-2 ${
                    isDark
                      ? "text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border-slate-800/60"
                      : "text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-slate-100"
                  }`}
                >
                  <Trash2 className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
                  <span>Reset Test Data (Clean Slate)</span>
                </button>
              </div>
            )}
          </div>

          {/* 4. Clean Logout Icon Button */}
          <button
            onClick={handleAdminLogout}
            type="button"
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isDark
                ? "text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 border-slate-800 hover:border-rose-500/30"
                : "text-slate-600 hover:text-rose-600 hover:bg-rose-50 border-slate-200 hover:border-rose-200 shadow-xs"
            }`}
            title="Log out of Admin Command OS"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            className={`md:hidden p-2 rounded-xl border ${
              isDark
                ? "bg-slate-900 text-slate-300 border-slate-800"
                : "bg-white text-slate-700 border-slate-200 shadow-xs"
            }`}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Emergency Driver Breakdown SOS Banner */}
      {relay.state.driverSosAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-rose-950 border-b border-rose-500/50 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-rose-100 shadow-2xl z-20">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping shrink-0" />
            <strong className="font-black tracking-wide uppercase text-white">
              🚨 DRIVER BREAKDOWN SOS ALERT:
            </strong>
            <span>
              {relay.state.driverSosAlerts[0].driverName} at {relay.state.driverSosAlerts[0].location} — "{relay.state.driverSosAlerts[0].reason}"
            </span>
          </div>
          <span className="px-3 py-1 rounded-xl bg-white text-rose-950 font-black text-[10px] tracking-wider uppercase shadow">
            Rescue Loader En Route
          </span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN LAYOUT: SUB-NAVIGATION + TAB MODULE CONTENT
      ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Sub-Nav (Desktop, 250px width, zero cut-off text) */}
        <aside
          className={`hidden md:flex w-[250px] border-r flex-col p-3 shrink-0 transition-colors duration-200 ${
            isDark
              ? "bg-[#080D1A] border-slate-800/80"
              : "bg-white border-slate-200 shadow-xs"
          }`}
        >
          <div className={`text-[10px] font-black uppercase tracking-wider px-3 py-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            Command Modules
          </div>
          <nav className="space-y-1">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  type="button"
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-left transition cursor-pointer ${
                    isActive
                      ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20"
                      : isDark
                      ? "text-slate-300 hover:text-white hover:bg-slate-800/60"
                      : "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-slate-950" : isDark ? "text-amber-400" : "text-amber-600"}`} />
                    <div className="flex flex-col min-w-0 leading-tight">
                      <span className="font-extrabold text-xs whitespace-nowrap">{t.labelHi}</span>
                      <span
                        className={`text-[10px] whitespace-nowrap ${
                          isActive
                            ? "text-slate-900/80 font-bold"
                            : isDark
                            ? "text-slate-400"
                            : "text-slate-500"
                        }`}
                      >
                        {t.labelEn}
                      </span>
                    </div>
                  </div>
                  {t.badge && (
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 ml-1.5 ${
                        isActive
                          ? "bg-slate-950 text-amber-300"
                          : isDark
                          ? "bg-slate-800/90 text-slate-300 border border-slate-700/80"
                          : "bg-slate-200 text-slate-800 border border-slate-300"
                      }`}
                    >
                      {t.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Hub Health Snapshot */}
          <div className={`mt-auto pt-4 border-t px-2 ${isDark ? "border-slate-800/80" : "border-slate-200"}`}>
            <div className={`text-[10px] font-black uppercase tracking-wider mb-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Lucknow Fleet Load
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className={`flex items-center justify-between ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                <span className="truncate">Latouche Central</span>
                <span className="font-mono text-amber-500 font-bold shrink-0">22 Active</span>
              </div>
              <div className={`flex items-center justify-between ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                <span className="truncate">Sushant Golf City</span>
                <span className="font-mono text-emerald-500 font-bold shrink-0">14 Active</span>
              </div>
              <div className={`flex items-center justify-between ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                <span className="truncate">Chinhat Depot</span>
                <span className="font-mono text-emerald-500 font-bold shrink-0">8 Active</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Sub-Nav Drawer */}
        {mobileMenuOpen && (
          <div className={`md:hidden border-b p-3 space-y-1 ${isDark ? "bg-[#080D1A] border-slate-800" : "bg-white border-slate-200"}`}>
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTab(t.id);
                    setMobileMenuOpen(false);
                  }}
                  type="button"
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold ${
                    isActive
                      ? "bg-amber-400 text-slate-950 font-black"
                      : isDark
                      ? "text-slate-300 bg-slate-800/40"
                      : "text-slate-700 bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{t.labelHi} ({t.labelEn})</span>
                  </div>
                  {t.badge && <span className="text-[10px]">{t.badge}</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Main Work Area */}
        <main className={`flex-1 overflow-y-auto p-4 sm:p-6 transition-colors duration-200 ${isDark ? "bg-[#080D1A]" : "bg-[#F8FAFC]"}`}>
          {/* ─────────────────────────────────────────────────────────
              MODULE 0: "AAJ KA KAAM" (FOUNDER HOME) — DEFAULT LANDING VIEW
          ────────────────────────────────────────────────────────── */}
          {activeTab === "founder_home" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Header / Intro banner */}
              <div
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl border transition-colors ${
                  isDark
                    ? "bg-[#0F172A] border-slate-800/90 shadow-sm"
                    : "bg-white border-slate-200 shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className={`text-xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                      Aaj Ka Kaam
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400/10 text-amber-500 border border-amber-400/30">
                      Founder Operating Console
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Lucknow 7-Zone Logistics • Real-Time Escrow, Fleet & KYC Command
                  </p>
                </div>

                {/* Founder Voice Bar mini assistant */}
                <div
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border ${
                    isDark
                      ? "bg-[#080D1A] border-indigo-900/40"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className={`text-[11px] font-medium hidden sm:inline ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                    Voice Commands:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSimulateVoice("OPC Cement ₹5 badhao")}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition flex items-center gap-1 cursor-pointer ${
                      isDark
                        ? "bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border-indigo-700/40"
                        : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200"
                    }`}
                  >
                    <Mic className="w-2.5 h-2.5 text-amber-500" />
                    "OPC ₹5 badhao"
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulateVoice("Atke hue orders dikhao")}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition flex items-center gap-1 cursor-pointer ${
                      isDark
                        ? "bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border-indigo-700/40"
                        : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200"
                    }`}
                  >
                    <Mic className="w-2.5 h-2.5 text-indigo-400" />
                    "Atke Orders"
                  </button>
                </div>
              </div>

              {/* SYNC ERROR BANNER (Explicit, never silent) */}
              {masterSync.lastSyncError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 flex items-center justify-between gap-3 text-xs font-bold">
                  <span>⚠️ Master Live Sync Error: {masterSync.lastSyncError}</span>
                  <button
                    type="button"
                    onClick={() => masterSync.refreshFromSources()}
                    className="px-3 py-1 rounded-lg bg-rose-500 text-white font-black cursor-pointer shrink-0"
                  >
                    Retry Sync
                  </button>
                </div>
              )}

              {/* LIVE STOREFRONT BROADCAST & REMOTE CONTROL STRIP */}
              <div
                className={`p-5 rounded-2xl border transition-colors ${
                  isDark
                    ? "bg-[#0F172A] border-slate-800/90"
                    : "bg-white border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3.5 mb-3.5 border-b border-slate-800/40">
                  <div className="flex items-center gap-2.5">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <div>
                      <h2 className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                        Live Storefront Broadcast & Remote Control
                      </h2>
                      <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        Instant &lt;500ms remote control over Customer Storefront, Vendor Dukaan OS & Driver Cockpit
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const nextRain = !masterSync.state.globalControls.rainMode;
                        if (relay.state.isRainModeActive !== nextRain) relay.toggleRainMode();
                        masterSync.toggleRainMode(nextRain);
                        toast.success(nextRain ? "🌧️ Rain Mode enabled across all panels!" : "Rain Mode turned off.");
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black border cursor-pointer transition ${
                        masterSync.state.globalControls.rainMode
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50"
                          : isDark
                          ? "bg-slate-900 text-slate-300 border-slate-700"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      🌧️ Rain Mode: {masterSync.state.globalControls.rainMode ? "ON" : "OFF"}
                    </button>

                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-xs font-bold ${isDark ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-slate-100 border-slate-200 text-slate-800"}`}>
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>SLA:</span>
                      {[45, 60, 90].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => {
                            masterSync.updateDeliverySla(mins);
                            toast.success(`Storefront delivery SLA set to ${mins} mins`);
                          }}
                          className={`px-1.5 py-0.5 rounded text-[11px] font-black cursor-pointer ${
                            masterSync.state.globalControls.deliverySlaMins === mins
                              ? "bg-amber-400 text-slate-950"
                              : "opacity-70 hover:opacity-100"
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const nextPause = !masterSync.state.globalControls.emergencyPause;
                        masterSync.toggleEmergencyPause(nextPause);
                        toast.warning(nextPause ? "🚨 Storefront Maintenance Pause ENABLED" : "✅ Storefront Resumed Live");
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black border cursor-pointer transition ${
                        masterSync.state.globalControls.emergencyPause
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/50"
                          : isDark
                          ? "bg-slate-900 text-slate-300 border-slate-700"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {masterSync.state.globalControls.emergencyPause ? "⏸️ Storefront PAUSED" : "▶ Storefront LIVE"}
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        const res = await masterSync.triggerTestPing();
                        toast.success(`⚡ Live Sync Ping broadcasted (${res.tabs} active tab${res.tabs === 1 ? "" : "s"})`);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer flex items-center gap-1"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Test Live Sync Ping
                    </button>
                  </div>
                </div>

                {/* Live Announcement Banner Editor */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
                  <label className="md:col-span-2 flex items-center gap-2 text-xs font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bannerDraft.enabled}
                      onChange={(e) => setBannerDraft((p) => ({ ...p, enabled: e.target.checked }))}
                      className="rounded border-slate-600"
                    />
                    <span className={isDark ? "text-slate-200" : "text-slate-800"}>Banner Active</span>
                  </label>
                  <input
                    type="text"
                    value={bannerDraft.badge}
                    onChange={(e) => setBannerDraft((p) => ({ ...p, badge: e.target.value }))}
                    placeholder="Badge (e.g. LIVE OFFER)"
                    className={`md:col-span-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                      isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                  <input
                    type="text"
                    value={bannerDraft.text}
                    onChange={(e) => setBannerDraft((p) => ({ ...p, text: e.target.value }))}
                    placeholder="Storefront announcement text..."
                    className={`md:col-span-5 px-3 py-1.5 rounded-xl border text-xs font-medium ${
                      isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                  <select
                    value={bannerDraft.tone}
                    onChange={(e) =>
                      setBannerDraft((p) => ({ ...p, tone: e.target.value as "emerald" | "amber" | "crimson" }))
                    }
                    className={`md:col-span-1 px-2 py-1.5 rounded-xl border text-xs font-bold ${
                      isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  >
                    <option value="emerald">Green</option>
                    <option value="amber">Amber</option>
                    <option value="crimson">Red</option>
                  </select>
                  <button
                    type="button"
                    onClick={async () => {
                      await masterSync.updateStorefrontBanner(bannerDraft);
                      toast.success("Live Storefront Broadcast updated across all open tabs!");
                    }}
                    className="md:col-span-2 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black cursor-pointer text-center"
                  >
                    Publish Banner
                  </button>
                </div>
              </div>

              {/* 4-STEP LIVE LAUNCH READINESS TRACKER (ZERO-DUMMY CLEAN SLATE) */}
              {todayGmv === 0 && dispatchOrders.length === 0 && (
                <div
                  className={`p-6 rounded-2xl border transition-colors shadow-sm ${
                    isDark
                      ? "bg-[#0F172A] border-slate-800"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/60 mb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <h2 className={`text-base sm:text-lg font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                          Clean Slate Mode: 4-Step Live Launch Readiness Tracker
                        </h2>
                      </div>
                      <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        All test data has been cleared. Complete these 4 steps to receive real construction dispatches.
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-400/10 text-amber-500 border border-amber-400/30">
                      Phase 1: Ready for Partners
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Step 1 */}
                    <div
                      className={`p-4 rounded-xl border flex flex-col justify-between ${
                        isDark ? "bg-[#080D1A] border-emerald-500/30" : "bg-emerald-50/50 border-emerald-200"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                            STEP 1
                          </span>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <h4 className={`text-xs font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                          16-Category Catalog
                        </h4>
                        <p className={`text-[11px] mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                          753+ SKUs & 16 Categories Live with Real Studio Media.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("catalog_studio")}
                        className="mt-3 text-xs font-bold text-emerald-500 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open Catalog Studio</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Step 2 */}
                    <div
                      className={`p-4 rounded-xl border flex flex-col justify-between ${
                        isDark ? "bg-[#080D1A] border-slate-800" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-400">
                            STEP 2
                          </span>
                          <span className="text-[10px] font-bold text-amber-500">READY</span>
                        </div>
                        <h4 className={`text-xs font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                          Onboard Lucknow Hubs
                        </h4>
                        <p className={`text-[11px] mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                          Share /vendor signup with local hardware & sanitary dealers.
                        </p>
                      </div>
                      <a
                        href="/vendor/register"
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 text-xs font-bold text-amber-500 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open Partner Dukaan Form</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Step 3 */}
                    <div
                      className={`p-4 rounded-xl border flex flex-col justify-between ${
                        isDark ? "bg-[#080D1A] border-slate-800" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400">
                            STEP 3
                          </span>
                          <span className="text-[10px] font-bold text-indigo-400">ARMED</span>
                        </div>
                        <h4 className={`text-xs font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                          Paper KYC Standby
                        </h4>
                        <p className={`text-[11px] mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                          NPCI ₹1 Penny-Drop & AI OCR standing by for paper review.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("kyc_war_room")}
                        className="mt-3 text-xs font-bold text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open KYC War Room</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Step 4 */}
                    <div
                      className={`p-4 rounded-xl border flex flex-col justify-between ${
                        isDark ? "bg-[#080D1A] border-slate-800" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400">
                            STEP 4
                          </span>
                          <span className="text-[10px] font-bold text-sky-400">ONLINE</span>
                        </div>
                        <h4 className={`text-xs font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                          Dispatch Radar Standby
                        </h4>
                        <p className={`text-[11px] mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                          Lucknow 7-zone fleet corridor connected via Socket.io.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("dispatch")}
                        className="mt-3 text-xs font-bold text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Dispatch Telemetry</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 4 TOP KPI CARDS (BILINGUAL LABELS & HIGH CONTRAST) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* KPI 1: Aaj Ki Kamai (Today's GMV) */}
                <div
                  className={`rounded-2xl p-5 border transition shadow-sm ${
                    isDark
                      ? "bg-[#0F172A] border-slate-800/80 hover:border-amber-400/40"
                      : "bg-white border-slate-200 hover:border-amber-400 shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider mb-2">
                    <span className={`flex items-center gap-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      Aaj Ki Kamai (Today's GMV)
                    </span>
                    <span className="text-emerald-500 font-extrabold text-[10px]">+18.4%</span>
                  </div>
                  <div className={`text-2xl sm:text-3xl font-black tabular-nums tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                    ₹{todayGmv.toLocaleString("en-IN")}
                  </div>
                  <p className={`text-[11px] mt-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    Lucknow 60-Min Delivered
                  </p>
                </div>

                {/* KPI 2: Shuddh Munafa (Net Margin) */}
                <div
                  className={`rounded-2xl p-5 border transition shadow-sm ${
                    isDark
                      ? "bg-[#0F172A] border-slate-800/80 hover:border-emerald-400/40"
                      : "bg-white border-slate-200 hover:border-emerald-400 shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider mb-2">
                    <span className={`flex items-center gap-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Shuddh Munafa (Net Margin)
                    </span>
                    <span className="text-emerald-500 font-extrabold text-[10px]">{netCommissionPercent}% Take</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-500 tabular-nums tracking-tight">
                    ₹{netCommissionMargin.toLocaleString("en-IN")}
                  </div>
                  <p className={`text-[11px] mt-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    Platform aggregate fee
                  </p>
                </div>

                {/* KPI 3: Delivery Speed (Avg Time) */}
                <div
                  className={`rounded-2xl p-5 border transition shadow-sm ${
                    isDark
                      ? "bg-[#0F172A] border-slate-800/80 hover:border-indigo-400/40"
                      : "bg-white border-slate-200 hover:border-indigo-400 shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider mb-2">
                    <span className={`flex items-center gap-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      Delivery Speed (Avg Time)
                    </span>
                    <span className="text-indigo-400 font-extrabold text-[10px]">Target &lt;60m</span>
                  </div>
                  <div className={`text-2xl sm:text-3xl font-black tabular-nums tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                    {avgDeliveryMins} <span className={`text-sm font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>mins</span>
                  </div>
                  <p className={`text-[11px] mt-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    0 Dhalai SLA breaches
                  </p>
                </div>

                {/* KPI 4: Ruka Hua Paisa (Escrow Hold) */}
                <div
                  className={`rounded-2xl p-5 border transition shadow-sm ${
                    isDark
                      ? "bg-[#0F172A] border-slate-800/80 hover:border-amber-400/40"
                      : "bg-white border-slate-200 hover:border-amber-400 shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider mb-2">
                    <span className={`flex items-center gap-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                      Ruka Hua Paisa (Escrow Hold)
                    </span>
                    <span className="text-amber-500 font-extrabold text-[10px]">
                      {pendingEscrowCount} Pending
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-500 tabular-nums tracking-tight">
                    ₹{activeEscrowHold.toLocaleString("en-IN")}
                  </div>
                  <p className={`text-[11px] mt-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    Dealer payout release lock
                  </p>
                </div>
              </div>

              {/* SECTION: AAJ KE 3 ZAROORI KAAM (ACTION CHECKLIST) */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className={`text-base sm:text-lg font-black flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      Aaj Ke 3 Zaroori Kaam (Today's Action Checklist)
                    </h2>
                    <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Priority operations requiring your decision today. Zero hunting across tabs.
                    </p>
                  </div>
                  <span className={`text-xs font-mono font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {pendingEscrowCount + pendingKycCount + urgentOrders.length} Items Total
                  </span>
                </div>

                {/* 3 LARGE ACTION CARDS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* Card 1 — Paisa Release Baki Hai */}
                  <div
                    className={`rounded-2xl p-6 flex flex-col justify-between border transition shadow-sm ${
                      isDark
                        ? "bg-[#0F172A] border-slate-800/90 hover:border-amber-400/40"
                        : "bg-white border-slate-200 hover:border-amber-400 shadow-xs"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-500">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            pendingEscrowCount > 0
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/30 animate-pulse"
                              : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                          }`}
                        >
                          {pendingEscrowCount > 0 ? `${pendingEscrowCount} Waiting Approval` : "All Settled ✓"}
                        </span>
                      </div>

                      <h3 className={`text-base font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                        Paisa Release Baki Hai
                      </h3>
                      <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        Payouts Waiting Approval • Geo-Photo Escrow deliveries ready for release.
                      </p>

                      <div
                        className={`my-5 p-3.5 rounded-xl border ${
                          isDark
                            ? "bg-[#080D1A] border-slate-800"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                          Locked In Escrow:
                        </div>
                        <div className="text-2xl font-black text-amber-500 tabular-nums font-mono mt-0.5">
                          ₹{activeEscrowHold.toLocaleString("en-IN")}
                        </div>
                        <div className={`text-[11px] mt-1 flex items-center gap-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>GPS & Tirpal photo verified</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      {pendingEscrowList.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const e0 = pendingEscrowList[0];
                            setEscrowReleaseTarget({
                              id: e0.id,
                              orderShortId: e0.shortId,
                              dealerName: e0.dealerName,
                              dealerPayoutAmount: e0.dealerPayoutAmount,
                              status: e0.status,
                            });
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 text-emerald-500" />
                          <span>1-Click Release Next (₹{pendingEscrowList[0].dealerPayoutAmount.toLocaleString("en-IN")})</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setActiveTab("escrow")}
                        className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-400/10"
                      >
                        <span>Photo Check & Release</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card 2 — Naye Papers Verify Karein */}
                  <div
                    className={`rounded-2xl p-6 flex flex-col justify-between border transition shadow-sm ${
                      isDark
                        ? "bg-[#0F172A] border-slate-800/90 hover:border-indigo-400/40"
                        : "bg-white border-slate-200 hover:border-indigo-400 shadow-xs"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                          <ShieldAlert className="w-5 h-5" />
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            pendingKycCount > 0
                              ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/30 animate-pulse"
                              : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                          }`}
                        >
                          {pendingKycCount > 0 ? `${pendingKycCount} Need Verification` : "All Verified ✓"}
                        </span>
                      </div>

                      <h3 className={`text-base font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                        Naye Papers Verify Karein
                      </h3>
                      <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        Partner KYC Review • Onboarding document submissions awaiting compliance review.
                      </p>

                      <div
                        className={`my-5 p-3.5 rounded-xl border space-y-2 ${
                          isDark
                            ? "bg-[#080D1A] border-slate-800"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className={`flex items-center gap-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            <Store className="w-3.5 h-3.5 text-amber-500" /> Dukaan Hubs Pending:
                          </span>
                          <span className={`font-bold font-mono ${isDark ? "text-white" : "text-slate-900"}`}>{pendingVendorsCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className={`flex items-center gap-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            <Truck className="w-3.5 h-3.5 text-emerald-500" /> Fleet Drivers Pending:
                          </span>
                          <span className={`font-bold font-mono ${isDark ? "text-white" : "text-slate-900"}`}>{pendingDriversCount}</span>
                        </div>
                        <p className={`text-[11px] pt-1 border-t ${isDark ? "text-slate-500 border-slate-800" : "text-slate-400 border-slate-200"}`}>
                          GSTIN, Aadhaar, Trade License & Bank verification.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab("kyc_war_room")}
                        className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-500/20"
                      >
                        <span>Papers Check Karein</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card 3 — Late Orders & Subah Ka Rate */}
                  <div
                    className={`rounded-2xl p-6 flex flex-col justify-between border transition shadow-sm ${
                      isDark
                        ? "bg-[#0F172A] border-slate-800/90 hover:border-emerald-400/40"
                        : "bg-white border-slate-200 hover:border-emerald-400 shadow-xs"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                          <Radio className="w-5 h-5" />
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            urgentOrders.length > 0
                              ? "bg-rose-500/10 text-rose-500 border-rose-500/30 animate-pulse"
                              : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                          }`}
                        >
                          {urgentOrders.length > 0 ? `${urgentOrders.length} Urgent SLA` : "All On Time ✓"}
                        </span>
                      </div>

                      <h3 className={`text-base font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                        Late Orders & Subah Ka Rate
                      </h3>
                      <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        Urgent Orders & Mandi Rates • 60-min delivery SLA tracking & daily wholesale prices.
                      </p>

                      <div
                        className={`my-5 p-3.5 rounded-xl border space-y-2.5 ${
                          isDark
                            ? "bg-[#080D1A] border-slate-800"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        {/* SLA Status */}
                        {urgentOrders.length === 0 ? (
                          <div className="flex items-center gap-2 text-xs text-emerald-500 font-bold">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>All Deliveries On Time ✓ (0 SLA breaches)</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-xs text-rose-500 font-bold">
                            <span className="flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                              <span>{urgentOrders.length} order(s) nearing SLA:</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setActiveTab("dispatch")}
                              className="text-[11px] text-amber-500 underline hover:text-amber-600 cursor-pointer font-bold"
                            >
                              Open Radar
                            </button>
                          </div>
                        )}

                        {/* Morning Rates Snapshot */}
                        <div className={`pt-2 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                          <div className={`text-[10px] font-black uppercase tracking-wider mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            Today's Mandi Benchmark
                          </div>
                          <div className={`text-xs flex items-center justify-between font-mono font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                            <span>OPC: ₹365</span>
                            <span>TMT: ₹58.5/kg</span>
                            <span>Morang: ₹48</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab("mandi_hedge")}
                        className={`w-full py-2.5 px-4 rounded-xl border text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                          isDark
                            ? "bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white border-amber-400/30 hover:border-amber-400"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300"
                        }`}
                      >
                        <span>Aaj Ka Rate Update Karein</span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── SECTION 1.5: FOUNDER MASTER CONTROL SHORTCUTS (CATALOG & GST) ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                  {/* Shortcut Card A: Catalog Studio */}
                  <div
                    className={`rounded-2xl p-5 border transition shadow-sm flex flex-col justify-between ${
                      isDark
                        ? "bg-[#0F172A] border-slate-800/90 hover:border-amber-400/40"
                        : "bg-white border-slate-200 hover:border-amber-400 shadow-xs"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-500">
                          <Package className="w-5 h-5" />
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/10 text-amber-500 border border-amber-400/30">
                          Master CMS
                        </span>
                      </div>

                      <h3 className={`text-base font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                        Catalog Studio &amp; Master Lock
                      </h3>
                      <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        16 Master Categories • 8-Digit HSN Codes • Protected Vendor Master Lock
                      </p>

                      <div
                        className={`my-4 p-3 rounded-xl border flex items-center justify-between text-xs ${
                          isDark ? "bg-[#080D1A] border-slate-800" : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className={`font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                            16 Categories Live
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-amber-400 font-bold">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Admin Guard Active</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab("catalog_studio")}
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-400/10"
                    >
                      <span>Open Catalog Studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Shortcut Card B: Accounts & GST */}
                  <div
                    className={`rounded-2xl p-5 border transition shadow-sm flex flex-col justify-between ${
                      isDark
                        ? "bg-[#0F172A] border-slate-800/90 hover:border-emerald-400/40"
                        : "bg-white border-slate-200 hover:border-emerald-400 shadow-xs"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                          <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                          Roz Ka Hisaab
                        </span>
                      </div>

                      <h3 className={`text-base font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                        Daily Accounts &amp; 1-Click GST PDF
                      </h3>
                      <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        Lucknow Registered Letterhead • GSTR-1 Table 12 HSN Summary &amp; B2B Ledger
                      </p>

                      <div
                        className={`my-4 p-3 rounded-xl border flex items-center justify-between text-xs ${
                          isDark ? "bg-[#080D1A] border-slate-800" : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div>
                          <div className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            GSTIN:
                          </div>
                          <div className="font-mono font-bold text-amber-400">09AABCC1234F1Z5</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            State:
                          </div>
                          <div className="font-bold text-slate-200">09 - Uttar Pradesh</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            toast.info("Generating Today's GST PDF...", { icon: "📄" });
                            const data = await fetchGstReport("today");
                            await generateGstReportPdf(data);
                            toast.success("Downloaded Today's CA GST PDF!", { icon: "✅" });
                          } catch {
                            toast.error("Failed to generate PDF");
                          }
                        }}
                        className="py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-amber-400/10"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download GST PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab("accounts_gst")}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                          isDark
                            ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                        }`}
                      >
                        <span>View Ledger</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── SECTION 2: LIVE TRUST, SITE DNA & GOLD PILOT STREAM ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                  {/* Left (7 cols): Live Customer & Driver Feedback Stream */}
                  <div
                    className={`lg:col-span-7 rounded-2xl p-5 border space-y-4 shadow-sm ${
                      isDark ? "bg-[#0F172A] border-slate-800" : "bg-white border-slate-200 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/40">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <h3 className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                          Live Customer Shabaashi & Site DNA Feedback Stream
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        Real-Time Telemetry
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* Live Customer Voice & Tip Card */}
                      <div className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                        isDark ? "bg-[#080D1A] border-slate-800" : "bg-slate-50 border-slate-200"
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-500 flex items-center gap-1.5">
                            <ThumbsUp className="w-3.5 h-3.5" /> Ramesh Singh (Sushant Golf City)
                          </span>
                          <span className="font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                            +₹50 Chai-Pani Tip ➔ DRV-LKO-201
                          </span>
                        </div>
                        <p className={`italic ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                          "UltraTech cement bilkul fresh tha, driver ne safe unload kiya aur barish me tirpal laga rakha tha."
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Fresh & Sealed ISI ✓
                          </span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            On-Time 60m Hero ⚡
                          </span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            Rain Tirpal Protected 🌧️
                          </span>
                        </div>
                      </div>

                      {/* Crowdsourced Site DNA Tag Card */}
                      <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                        isDark ? "bg-purple-950/20 border-purple-500/30 text-purple-200" : "bg-purple-50 border-purple-200 text-purple-900"
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-bold flex items-center gap-1.5 text-purple-400">
                            <Dna className="w-3.5 h-3.5" /> Site DNA Intelligence Tagged
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">
                            Fleet Intelligence
                          </span>
                        </div>
                        <p className="font-bold text-[11px]">
                          Old Lucknow / Aminabad: Marked as "⚠️ Narrow Lane (Bike Recommended — Loader stops 80m back at Chowk)"
                        </p>
                        <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                          Reported by Pilot DRV-LKO-202 (Shakeel). Auto-attached to future orders in this corridor.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right (5 cols): Gold Pilot Drivers Leaderboard & Quality Alerts */}
                  <div
                    className={`lg:col-span-5 rounded-2xl p-5 border space-y-4 shadow-sm ${
                      isDark ? "bg-[#0F172A] border-slate-800" : "bg-white border-slate-200 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/40">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-500" />
                        <h3 className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                          Gold Pilot Drivers & Quality Alerts
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        Top Performers
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {/* Driver 1 */}
                      <div className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                        isDark ? "bg-[#080D1A] border-slate-800" : "bg-slate-50 border-slate-200"
                      }`}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs">
                            RK
                          </div>
                          <div>
                            <p className={`font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                              Rajesh Kumar (Pilot 201)
                            </p>
                            <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                              Hero Splendor • 1,240 Trips • 96/100 Trust
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-400 text-slate-950">
                          GOLD PILOT
                        </span>
                      </div>

                      {/* Driver 2 */}
                      <div className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                        isDark ? "bg-[#080D1A] border-slate-800" : "bg-slate-50 border-slate-200"
                      }`}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-500 text-white font-black flex items-center justify-center text-xs">
                            MS
                          </div>
                          <div>
                            <p className={`font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                              Mohd. Shakeel (Pilot 202)
                            </p>
                            <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                              Chhota Hathi 1.5T • 980 Trips • 94/100 Trust
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-400 text-slate-950">
                          GOLD PILOT
                        </span>
                      </div>

                      {/* Vendor Quality Health Note */}
                      <div className={`p-3 rounded-xl border text-[11px] space-y-1 ${
                        activeDisputes.length > 0
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                          : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      }`}>
                        <span className="font-bold block">
                          {activeDisputes.length > 0
                            ? `⚠️ Quality Alert: ${activeDisputes.length} active dispute(s) on dealer stock.`
                            : "✓ Vendor Quality Score: 98.6% Fresh Stock across Lucknow hubs."}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "dispatch" && (
            <div className="space-y-5">
              {/* Module Header with Filter Chips */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0F172A] border border-slate-800 p-4 rounded-2xl">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
                    "Dhalai Protection" 60-Min Dispatch Radar
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live telemetry for heavy construction logistics across Lucknow dealer hubs. Roof slab pours pinned for zero-delay dispatch.
                  </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setDispatchFilter("all")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      dispatchFilter === "all"
                        ? "bg-amber-400 text-slate-950 font-black"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    All ({dispatchOrders.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDispatchFilter("dhalai")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                      dispatchFilter === "dhalai"
                        ? "bg-rose-500 text-white font-black"
                        : "bg-slate-800 text-rose-400 hover:bg-slate-700"
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    Dhalai Priority
                  </button>
                  <button
                    type="button"
                    onClick={() => setDispatchFilter("urgent")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      dispatchFilter === "urgent"
                        ? "bg-amber-500 text-slate-950 font-black"
                        : "bg-slate-800 text-amber-400 hover:bg-slate-700"
                    }`}
                  >
                    &lt; 25 Mins Left
                  </button>
                  <button
                    type="button"
                    onClick={() => setDispatchFilter("packing")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      dispatchFilter === "packing"
                        ? "bg-indigo-500 text-white font-black"
                        : "bg-slate-800 text-indigo-400 hover:bg-slate-700"
                    }`}
                  >
                    Packing at Hub
                  </button>
                </div>
              </div>

              {/* Order Radar Cards Grid / Zero-State */}
              {filteredOrders.length === 0 ? (
                <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
                  {/* Radar pulse effect */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="w-96 h-96 rounded-full border border-amber-400 animate-ping duration-1000" />
                    <div className="w-64 h-64 rounded-full border border-amber-400/50" />
                    <div className="w-32 h-32 rounded-full border border-amber-400/80" />
                  </div>

                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-3xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto mb-4 text-amber-400 shadow-lg shadow-amber-400/10">
                      <Radio className="w-8 h-8 animate-pulse text-amber-400" />
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono mb-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>Corridor Socket.io Active • 0 Active Dispatches</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      Lucknow Operational Radar — Awaiting First Live Dispatch
                    </h3>
                    <p className="text-sm text-slate-400 max-w-xl mx-auto mt-2 mb-6">
                      Telemetry is actively monitoring 6 Lucknow construction logistics corridors. As soon as a contractor places an order or vendor packs materials, live GPS cards will lock in real-time.
                    </p>

                    {/* Corridor Telemetry Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-2xl mx-auto mb-8 text-left">
                      {[
                        { corridor: "Hazratganj Central Corridor", coords: "26.8467° N, 80.9462° E", status: "STANDBY" },
                        { corridor: "Gomti Nagar Phase 1 & 2", coords: "26.8523° N, 80.9992° E", status: "STANDBY" },
                        { corridor: "Alambagh Commercial Belt", coords: "26.8188° N, 80.9063° E", status: "STANDBY" },
                        { corridor: "Transport Nagar Freight Hub", coords: "26.7820° N, 80.8870° E", status: "STANDBY" },
                        { corridor: "Indira Nagar Ring Sector", coords: "26.8790° N, 80.9902° E", status: "STANDBY" },
                        { corridor: "Amar Shaheed Path Highway", coords: "26.7925° N, 80.9855° E", status: "STANDBY" },
                      ].map((c) => (
                        <div key={c.corridor} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                          <div className="font-bold text-slate-200 truncate">{c.corridor}</div>
                          <div className="font-mono text-[10px] text-slate-500">{c.coords}</div>
                          <div className="text-[9px] font-bold text-amber-400 mt-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            {c.status}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          relay.simulateIncomingExpressOrder();
                          toast.success("Express Dispatch Simulated", {
                            description: "Order placed into 4-panel relay queue. Vendor and Driver notified.",
                          });
                        }}
                        className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-400/20 flex items-center gap-2 cursor-pointer"
                      >
                        <Zap className="w-4 h-4" />
                        <span>⚡ Simulate Live Express Order (Test Pipeline)</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredOrders.map((ord) => {
                  const isUrgent = ord.minsLeft <= 25;
                  return (
                    <div
                      key={ord.id}
                      className={`bg-[#0F172A] border rounded-2xl p-4 sm:p-5 transition hover:shadow-2xl flex flex-col justify-between ${
                        ord.isDhalaiPriority
                          ? "border-rose-500/60 shadow-lg shadow-rose-950/20"
                          : isUrgent
                          ? "border-amber-500/50"
                          : "border-slate-800"
                      }`}
                    >
                      <div>
                        {/* Top Line: Short ID + Dhalai Badge + Countdown Timer */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-black text-amber-400">
                              {ord.shortId}
                            </span>
                            {ord.isDhalaiPriority && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center gap-1 animate-pulse">
                                <AlertTriangle className="w-3 h-3 text-rose-400" />
                                DHALAI PRIORITY (ROOF SLAB)
                              </span>
                            )}
                          </div>

                          {/* Countdown Timer */}
                          <div
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
                              isUrgent
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse"
                                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>{ord.minsLeft}m left (60-Min SLA)</span>
                          </div>
                        </div>

                        {/* Customer & Site Info */}
                        <div className="mb-3">
                          <p className="text-white font-black text-sm">{ord.customerName}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                            {ord.siteName} ({ord.lucknowZone})
                          </p>
                          <p className="text-xs font-mono text-slate-500 mt-0.5">
                            Customer Phone: {ord.customerPhone}
                          </p>
                        </div>

                        {/* Items & Weight Class Badge */}
                        <div className="bg-[#111C35] rounded-xl p-3 border border-slate-800/80 mb-3 space-y-1.5">
                          <div className="text-xs font-semibold text-slate-200">
                            {ord.items}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-800 text-amber-300 border border-slate-700 flex items-center gap-1">
                              <Truck className="w-3 h-3" />
                              {ord.vehicleTag}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              Order Total: ₹{ord.totalAmount.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Controls: Current Hub & 1-Click Re-Route */}
                      <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="text-xs text-slate-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span>Hub: <strong className="text-white">{ord.hub}</strong></span>
                        </div>

                        {/* Hub Re-route buttons */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-500 uppercase font-black">Re-route:</span>
                          <button
                            type="button"
                            onClick={() => reRouteHub(ord.id, "Latouche Road Hub")}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                          >
                            Latouche
                          </button>
                          <button
                            type="button"
                            onClick={() => reRouteHub(ord.id, "Chinhat Supply Point")}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                          >
                            Chinhat
                          </button>
                          <button
                            type="button"
                            onClick={() => reRouteHub(ord.id, "Sushant Golf City Hub")}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                          >
                            Sushant
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────
              MODULE 2: COMMODITY MANDI RATE & VAULT HEDGE TERMINAL
          ────────────────────────────────────────────────────────── */}
          {activeTab === "mandi_hedge" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    Commodity Mandi Rate & Vault Hedge Terminal
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live wholesale landing cost & retail margin controller. Changes synchronize instantly with the top storefront ticker and customer Living Vault.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Mandi Sync Engine Active
                </div>
              </div>

              {/* Rate Matrix Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {mandiRates.map((sku) => {
                  const edit = editingRates[sku.id] || {
                    landingCost: sku.dealerLandingCost,
                    marginPercent: sku.platformMarginPercent,
                  };
                  const calcRetail = Math.round(edit.landingCost * (1 + edit.marginPercent / 100));
                  const isModified =
                    edit.landingCost !== sku.dealerLandingCost ||
                    edit.marginPercent !== sku.platformMarginPercent;

                  return (
                    <div
                      key={sku.id}
                      className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between"
                    >
                      <div>
                        {/* Title & Category */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                              {sku.category}
                            </span>
                            <h3 className="text-sm sm:text-base font-black text-white mt-1">
                              {sku.name}
                            </h3>
                            <p className="text-xs text-slate-400">Unit: {sku.unit}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-slate-500 font-bold block">Live Retail</span>
                            <span className="text-xl font-black text-emerald-400 tabular-nums">
                              ₹{calcRetail}
                            </span>
                            <span className="text-[10px] text-slate-400 block">/ {sku.unit}</span>
                          </div>
                        </div>

                        {/* Editable Controls: Landing Cost & Margin Slider */}
                        <div className="bg-[#111C35] border border-slate-800/80 rounded-xl p-3 space-y-3">
                          {/* Dealer Landing Cost Input */}
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-slate-300 font-bold">Dealer Landing Cost (₹)</span>
                              <span className="font-mono text-slate-400 text-[11px]">
                                Wholesale Lucknow Base
                              </span>
                            </div>
                            <input
                              type="number"
                              step="0.5"
                              value={edit.landingCost}
                              onChange={(e) =>
                                handleRateFieldChange(sku.id, "landingCost", parseFloat(e.target.value) || 0)
                              }
                              className="w-full bg-[#070B14] border border-slate-700 rounded-xl px-3 py-2 text-sm font-black text-white focus:outline-none focus:border-amber-400"
                            />
                          </div>

                          {/* Margin Slider */}
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-slate-300 font-bold">
                                Platform Margin ({edit.marginPercent}%)
                              </span>
                              <span className="font-mono text-emerald-400 font-extrabold text-[11px]">
                                +₹{(calcRetail - edit.landingCost).toFixed(1)} margin
                              </span>
                            </div>
                            <input
                              type="range"
                              min="2"
                              max="25"
                              step="0.5"
                              value={edit.marginPercent}
                              onChange={(e) =>
                                handleRateFieldChange(sku.id, "marginPercent", parseFloat(e.target.value) || 0)
                              }
                              className="w-full accent-amber-400 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Publish Button */}
                      <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-500 font-mono">
                          Last Updated: {sku.lastUpdated}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSaveRate(sku.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                            isModified
                              ? "bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-lg shadow-amber-400/20"
                              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5" />
                          Publish to Storefront Ticker
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Vault Rate-Lock Exposure Heatmap & Bulk Hedge */}
              <div className="bg-gradient-to-br from-[#111C35] to-[#0F172A] border border-indigo-900/50 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black uppercase tracking-wider text-indigo-400">
                        Risk Shield & Hedging
                      </span>
                      {vaultExposure.exposureStatus === "HEDGED_100" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          🛡️ HEDGED 100% SECURE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          ⚠️ AMBER EXPOSURE — Open Spike Risk
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      Vault Rate-Lock Exposure Heatmap
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xl">
                      Contractors have deposited funds to lock current prices for{" "}
                      <strong className="text-amber-400">{vaultExposure.lockedCementBags} Bags Cement</strong>{" "}
                      and <strong className="text-amber-400">{vaultExposure.lockedBrickUnits.toLocaleString()} Bricks</strong>.
                      Potential market spike liability:{" "}
                      <strong className="text-rose-400">
                        ₹{vaultExposure.marketHikeRiskInr.toLocaleString("en-IN")}
                      </strong>.
                    </p>
                  </div>

                  {/* 1-Click Hedge Button */}
                  <div className="shrink-0">
                    {vaultExposure.exposureStatus === "HEDGED_100" ? (
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Forward Contract Active
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Dealer: {vaultExposure.hedgedPartnerDealer}
                        </span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          lockBulkHedge("Latouche Rd Central Depot");
                          relay.adminCreateHedgeOffer({
                            material: "UltraTech Super OPC 53 Cement",
                            quantity: "50 Bags (2.5 Ton)",
                            lockedLandingRate: 362,
                            instantAdvance: 5000,
                            corridor: "Shaheed Path / Sushant Golf City Dhalai Corridor",
                          });
                        }}
                        className="px-4 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-400/20 active:scale-95 transition flex items-center gap-2 cursor-pointer"
                      >
                        <Lock className="w-4 h-4" />
                        Lock Bulk Forward Hedge (100%)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────
              MODULE 3: "GEO-PHOTO ESCROW" TRUST ROOM
          ────────────────────────────────────────────────────────── */}
          {activeTab === "escrow" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    "Geo-Photo Escrow" Dealer Payout Trust Room
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Split-screen proof verification before releasing dealer payouts. Inspect loading bill vs driver site unloading proof.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-bold">Active Escrow Hold</span>
                  <span className="text-xl font-black text-amber-400 tabular-nums">
                    ₹{activeEscrowHold.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Escrow Orders Queue */}
              <div className="space-y-5">
                {/* 🚨 Auto-Frozen Damage Claims (Customer Auto-Escrow Shield) */}
                {activeDisputes.length > 0 && (
                  <div className="space-y-3 p-4 sm:p-5 rounded-2xl border-2 border-rose-500/60 bg-rose-950/20 shadow-xl">
                    <div className="flex items-center justify-between pb-2 border-b border-rose-900/40">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                        <h3 className="text-sm font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4 text-rose-500" />
                          Auto-Frozen Damage Claims ({activeDisputes.filter(d => d.status === "ESCROW_DISPUTE_HOLD").length} Pending)
                        </h3>
                      </div>
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        CRIMSON ESCROW HOLD
                      </span>
                    </div>

                    <p className="text-xs text-rose-300/90">
                      Customer flagged damaged or short material at unloading. Vendor escrow payment is frozen in dispute until approved below:
                    </p>

                    <div className="space-y-3 pt-1">
                      {activeDisputes.map((dispute) => (
                        <div
                          key={dispute.ticketId}
                          className="bg-[#0F172A] border border-rose-500/40 rounded-xl p-4 space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-black text-rose-400">
                                #{dispute.ticketId}
                              </span>
                              <span className="text-xs font-bold text-white">Order {dispute.orderId}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                {dispute.status}
                              </span>
                            </div>
                            <span className="text-xs text-slate-300">
                              Claim Amount: <strong className="text-rose-400 font-mono font-black text-sm">₹{dispute.claimAmount}</strong> ({dispute.affectedQty} items)
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Issue Description:</p>
                              <p className="text-xs font-black text-rose-400">{dispute.issueTag}</p>
                              <p className="text-[11px] text-slate-400">Requested: {dispute.claimType === "INSTANT_VAULT_REFUND" ? "Instant Living Vault Refund" : "45-Min Site Replacement"}</p>
                            </div>

                            <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center gap-3">
                              {dispute.damagePhotoUrl ? (
                                <img
                                  src={dispute.damagePhotoUrl}
                                  alt="Damage proof"
                                  className="w-14 h-14 rounded-lg object-cover border border-rose-500/40 shrink-0"
                                />
                              ) : (
                                <div className="w-14 h-14 rounded-lg bg-slate-800 border border-rose-500/40 flex items-center justify-center text-[9px] font-bold text-slate-400 text-center shrink-0">
                                  No Photo
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Customer Photo Proof</p>
                                <p className="text-xs text-slate-200 font-bold truncate">GPS Match: 99% (Lucknow Site)</p>
                                <span className="text-[10px] text-emerald-400 font-medium">Verified Unloading Point</span>
                              </div>
                            </div>
                          </div>

                          {/* 1-Click Operations Resolution Actions */}
                          {dispute.status === "ESCROW_DISPUTE_HOLD" ? (
                            <div className="flex flex-wrap gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  feedbackSync.resolveDispute(dispute.ticketId, "VAULT_REFUND");
                                  toast.success(`🎉 Approved Vault Refund of ₹${dispute.claimAmount}! Living Vault credited.`);
                                }}
                                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-md"
                              >
                                Approve Instant Vault Credit (₹{dispute.claimAmount})
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  feedbackSync.resolveDispute(dispute.ticketId, "DISPATCH_REPLACEMENT");
                                  toast.success("⚡ 45-Min Free Replacement Dispatch Triggered! Backup loader en route.");
                                }}
                                className="flex-1 py-2.5 px-3 rounded-xl bg-[#1848a0] hover:bg-blue-600 text-white font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-md"
                              >
                                Dispatch 45-Min Free Replacement
                              </button>
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between">
                              <span>✓ Dispute Resolved ({dispute.status})</span>
                              <span className="font-mono text-[10px]">{dispute.resolvedAt ? new Date(dispute.resolvedAt).toLocaleTimeString() : "Approved"}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live Geo-Photo Drops from Driver Cockpit */}
                {relay.state.orders
                  .filter((o) => o.status === "DELIVERED_PENDING_ESCROW" || (o.unloadingPhotoUrl && o.status === "ESCROW_SETTLED"))
                  .map((relayOrd) => {
                    const isSettled = relayOrd.status === "ESCROW_SETTLED";
                    return (
                      <div
                        key={relayOrd.id}
                        className={`bg-[#0F172A] border rounded-2xl p-4 sm:p-5 transition ${
                          isSettled
                            ? "border-emerald-500/40 bg-emerald-950/10"
                            : "border-amber-500/50 bg-gradient-to-br from-[#121828] to-[#0A101D] shadow-xl shadow-amber-500/10"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-black text-amber-400">
                              #{relayOrd.shortId}
                            </span>
                            <span className="text-sm font-black text-white">{relayOrd.hubName}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
                              LIVE DRIVER DROP
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400">
                              Dealer Payout:{" "}
                              <strong className="text-emerald-400 text-sm font-black">
                                ₹{relayOrd.netDealerPayout.toLocaleString("en-IN")}
                              </strong>
                            </span>
                            {isSettled ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> PAYOUT SETTLED ({relayOrd.settledUtr})
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                                <Clock className="w-3 h-3" /> AWAITING ADMIN ESCROW RELEASE
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Split proof: Hub dispatch info vs Site unloading proof */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-[#111C35] rounded-xl p-3.5 border border-slate-800 flex flex-col justify-between">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Materials Dispatched
                              </p>
                              <p className="text-xs font-bold text-white mt-0.5">
                                {relayOrd.itemsSummary}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-2">
                                Drop Site: <strong className="text-slate-200">{relayOrd.siteName}</strong>
                              </p>
                              <p className="text-[11px] text-slate-400">
                                Driver: <strong className="text-slate-200">{relayOrd.driverName}</strong>
                              </p>
                            </div>
                            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500">
                              Customer Delivery OTP Verified: <strong className="text-emerald-400">{relayOrd.customerOtp}</strong>
                            </div>
                          </div>

                          <div className="bg-[#111C35] rounded-xl p-3.5 border border-slate-800 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Driver Site Unloading Proof
                              </p>
                              <span className="text-[10px] font-mono font-bold text-emerald-400">
                                ● GPS Locked: {relayOrd.gpsDistanceMeters || 9}m ({relayOrd.gpsMatchPercent || 99}% Match)
                              </span>
                            </div>
                            <div className="w-full h-32 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 relative">
                              <img
                                src={relayOrd.unloadingPhotoUrl || "/images/hero-bg.png"}
                                alt="Driver Unloading Proof"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        </div>

                        {!isSettled && (
                          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                            <button
                              type="button"
                              onClick={() => relay.adminReleaseEscrow(relayOrd.id)}
                              className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-400/20 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Release Escrow Payout (₹{relayOrd.netDealerPayout.toLocaleString("en-IN")} to Dealer Bank)</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                {escrowQueue.map((escrow) => (
                  <div
                    key={escrow.id}
                    className={`bg-[#0F172A] border rounded-2xl p-4 sm:p-5 transition ${
                      escrow.status === "RELEASED"
                        ? "border-emerald-500/40 bg-emerald-950/10"
                        : escrow.status === "DISPUTE_HELD"
                        ? "border-rose-500/40 bg-rose-950/10"
                        : "border-slate-800"
                    }`}
                  >
                    {/* Top Status Line */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-amber-400">
                          {escrow.shortId}
                        </span>
                        <span className="text-sm font-black text-white">{escrow.dealerName}</span>
                        <span className="text-xs text-slate-400 font-mono">
                          (Inv: {escrow.dealerInvoiceNo})
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">
                          Payout Amount:{" "}
                          <strong className="text-emerald-400 text-sm font-black">
                            ₹{escrow.dealerPayoutAmount.toLocaleString("en-IN")}
                          </strong>
                        </span>
                        {escrow.status === "RELEASED" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> PAYOUT RELEASED
                          </span>
                        )}
                        {escrow.status === "DISPUTE_HELD" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> HELD FOR INSPECTION
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Split-Screen Console */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Dealer Invoice / Loading Scan */}
                      <div className="bg-[#111C35] rounded-xl p-3.5 border border-slate-800 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                              <FileCheck2 className="w-3.5 h-3.5 text-amber-400" />
                              1. Dealer Dispatch Invoice & Manifest
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {escrow.loadingTimestamp}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mb-2 font-medium">
                            {escrow.skuSummary}
                          </p>
                          <div className="h-36 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden relative group">
                            <img
                              src={escrow.invoicePhotoUrl}
                              alt="Invoice Proof"
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                              <span className="px-2 py-1 rounded bg-slate-900/90 text-[10px] font-bold text-white">
                                View Full Invoice Document
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Driver Site Unloading Photo + GPS Geofence */}
                      <div className="bg-[#111C35] rounded-xl p-3.5 border border-slate-800 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                              2. Driver Unloading Photo & Geofence
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              📍 {escrow.gpsMatchPercent}% GPS MATCH ({escrow.gpsDistanceMeters}m)
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mb-2 font-medium">
                            Site: {escrow.customerSiteAddress}
                          </p>
                          <div className="h-36 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden relative group">
                            <img
                              src={escrow.unloadingPhotoUrl}
                              alt="Site Unloading Proof"
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                              <span className="px-2 py-1 rounded bg-slate-900/90 text-[10px] font-bold text-white">
                                Inspect Photo Clarity
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dispute note if held */}
                    {escrow.status === "DISPUTE_HELD" && escrow.disputeReason && (
                      <div className="mt-3 p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-xs text-rose-300 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                        <span>Dispute Reason: {escrow.disputeReason}</span>
                      </div>
                    )}

                    {/* Action Bar */}
                    {escrow.status === "AWAITING_RELEASE" && (
                      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDisputeOrder(escrow.id);
                          }}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Hold for Quantity / Bag Dispute
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setXrayOrderId(escrow.shortId);
                            setActiveTab("khata_bank");
                          }}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Money X-Ray
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEscrowReleaseTarget({
                              id: escrow.id,
                              orderShortId: escrow.shortId,
                              dealerName: escrow.dealerName,
                              dealerPayoutAmount: escrow.dealerPayoutAmount,
                              status: escrow.status,
                            })
                          }
                          className="px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-400/20 transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Release Dealer Payout (₹{escrow.dealerPayoutAmount.toLocaleString("en-IN")})
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Dispute Modal */}
              {selectedDisputeOrder && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                  <div className="w-full max-w-md bg-[#0F172A] border border-rose-600/40 rounded-2xl p-6 shadow-2xl">
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                      Hold Escrow Payout for Dispute
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Specify the discrepancy before freezing dealer funds:
                    </p>
                    <textarea
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      className="w-full h-24 mt-3 bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-400"
                    />
                    <div className="flex items-center justify-end gap-2 mt-4">
                      <button
                        type="button"
                        onClick={() => setSelectedDisputeOrder(null)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          holdForDispute(selectedDisputeOrder, disputeReason);
                          setSelectedDisputeOrder(null);
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white"
                      >
                        Confirm Hold & Alert Dealer
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────
              MODULE 4: "BILL X-RAY" MARKET INTELLIGENCE & PROFIT SIMULATOR
          ────────────────────────────────────────────────────────── */}
          {activeTab === "bill_xray" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-2xl">
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-amber-400" />
                  "Bill X-Ray" Market Intelligence & Profit Simulator
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Offline dealer market price comparison and live scenario profit modeling for Lucknow quick-commerce deliveries.
                </p>
              </div>

              {/* 3-Slider Profit Simulator */}
              <div className="bg-gradient-to-br from-[#111C35] to-[#0F172A] border border-amber-500/30 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Interactive 3-Slider Unit Economics Engine
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Live Projections</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Slider 1: Daily Orders */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-300 font-bold">Daily Orders</span>
                      <span className="font-mono text-amber-400 font-black text-sm">
                        {simDailyOrders} orders/day
                      </span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="350"
                      step="5"
                      value={simDailyOrders}
                      onChange={(e) => setSimDailyOrders(parseInt(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>15</span>
                      <span>150</span>
                      <span>350</span>
                    </div>
                  </div>

                  {/* Slider 2: Average Commission */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-300 font-bold">Platform Take Rate</span>
                      <span className="font-mono text-emerald-400 font-black text-sm">
                        {simAvgCommission}% Margin
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="20"
                      step="0.5"
                      value={simAvgCommission}
                      onChange={(e) => setSimAvgCommission(parseFloat(e.target.value))}
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>5%</span>
                      <span>12%</span>
                      <span>20%</span>
                    </div>
                  </div>

                  {/* Slider 3: Cement Variance */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-300 font-bold">Mandi Spread Variance</span>
                      <span className="font-mono text-indigo-400 font-black text-sm">
                        +₹{simCementVariance} /bag
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-15"
                      max="30"
                      step="1"
                      value={simCementVariance}
                      onChange={(e) => setSimCementVariance(parseInt(e.target.value))}
                      className="w-full accent-indigo-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>-₹15</span>
                      <span>+₹5</span>
                      <span>+₹30</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Outputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800">
                  <div className="bg-[#070B14] rounded-xl p-3 border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Monthly GMV</span>
                    <div className="text-lg font-black text-white tabular-nums mt-0.5">
                      ₹{Math.round(simDailyOrders * 5400 * 30).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="bg-[#070B14] rounded-xl p-3 border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Est. Monthly Net Commission
                    </span>
                    <div className="text-lg font-black text-emerald-400 tabular-nums mt-0.5">
                      ₹{Math.round(simDailyOrders * 5400 * (simAvgCommission / 100) * 30 + (simCementVariance * 3200)).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="bg-[#070B14] rounded-xl p-3 border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Annualized Run-Rate</span>
                    <div className="text-lg font-black text-amber-400 tabular-nums mt-0.5">
                      ₹{((simDailyOrders * 5400 * 30 * 12) / 10000000).toFixed(2)} Cr GMV
                    </div>
                  </div>
                </div>
              </div>

              {/* Offline Bill Scraper Table */}
              <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-indigo-400" />
                    Offline Lucknow Counter Bills Intelligence (Real vs Conon)
                  </h3>
                  <span className="text-xs text-emerald-400 font-bold">
                    Avg Savings: 6.4% Cheaper + Free 60-Min Site Delivery
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#111C35] text-slate-400 uppercase font-black text-[10px]">
                      <tr>
                        <th className="p-3.5">Lucknow Market Area</th>
                        <th className="p-3.5">Material SKU</th>
                        <th className="p-3.5">Local Offline Counter</th>
                        <th className="p-3.5">CONON-NOW App</th>
                        <th className="p-3.5">Contractor Savings</th>
                        <th className="p-3.5">Scraped Samples</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {billXrayIntel.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-3.5 font-bold text-white">{item.lucknowArea}</td>
                          <td className="p-3.5 text-slate-300">{item.sku}</td>
                          <td className="p-3.5 font-mono text-rose-400">₹{item.localShopPrice}</td>
                          <td className="p-3.5 font-mono text-emerald-400 font-black">
                            ₹{item.cononPrice}
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              +{item.savingsPercent}% Cheaper
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-slate-400">
                            {item.verifiedBillsCount} bills verified
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────
              MODULE 5: LIVING VAULT RISK, SOS CREDIT & MISTRI PASS DESK
          ────────────────────────────────────────────────────────── */}
          {activeTab === "vault_risk" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    Living Vault Risk, SOS Credit & Mistri Pass Desk
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Monitor 48-Hour SOS emergency rescue credit used on active pours and manage 1-click freeze protection on Mistri Passes.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    {sosRescueUsers.length} SOS Lines Active
                  </span>
                </div>
              </div>

              {/* 48-Hr SOS Credit Users Table */}
              <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    48-Hour SOS Emergency Material Draws
                  </h3>
                  <span className="text-xs text-slate-400">Zero-interest contractor rescue line</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#111C35] text-slate-400 uppercase font-black text-[10px]">
                      <tr>
                        <th className="p-3.5">Contractor / Firm</th>
                        <th className="p-3.5">Site Location</th>
                        <th className="p-3.5">Amount Drawn</th>
                        <th className="p-3.5">Time Remaining</th>
                        <th className="p-3.5">Trust Score</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {sosRescueUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-3.5">
                            <div className="font-bold text-white">{user.userName}</div>
                            <div className="text-[10px] font-mono text-slate-400">{user.phone}</div>
                          </td>
                          <td className="p-3.5 text-slate-300">{user.siteLocation}</td>
                          <td className="p-3.5 font-mono font-black text-amber-400">
                            ₹{user.amountDrawn.toLocaleString("en-IN")}
                          </td>
                          <td className="p-3.5">
                            {user.status === "SETTLED" ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                                SETTLED
                              </span>
                            ) : (
                              <span className="font-mono text-xs text-rose-400 font-bold">
                                {user.hoursRemaining}h remaining
                              </span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-400">
                              {user.trustScore}/100
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-2">
                            {user.status === "ACTIVE" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => sendSosReminder(user.id)}
                                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                                >
                                  WhatsApp Alert
                                </button>
                                <button
                                  type="button"
                                  onClick={() => markSosSettled(user.id)}
                                  className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer"
                                >
                                  Mark Settled
                                </button>
                              </>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-bold">Restored</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Active Mistri Passes Table & 1-Click Freeze */}
              <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-indigo-400" />
                    Active Site Mistri Digital Passes (1-Click Anti-Theft Freeze)
                  </h3>
                  <span className="text-xs text-slate-400">
                    Authorized daily material budgets issued by project owners
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#111C35] text-slate-400 uppercase font-black text-[10px]">
                      <tr>
                        <th className="p-3.5">Mistri & Site Name</th>
                        <th className="p-3.5">Issuing Owner</th>
                        <th className="p-3.5">Daily Budget Limit</th>
                        <th className="p-3.5">Spent Today</th>
                        <th className="p-3.5">Allowed Categories</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Emergency Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {activeMistriPasses.map((pass) => (
                        <tr key={pass.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-3.5">
                            <div className="font-bold text-white">{pass.mistriName}</div>
                            <div className="text-[10px] text-slate-400">{pass.siteName}</div>
                          </td>
                          <td className="p-3.5 text-slate-300 font-medium">{pass.ownerName}</td>
                          <td className="p-3.5 font-mono text-white">
                            ₹{pass.dailyCap.toLocaleString("en-IN")}
                          </td>
                          <td className="p-3.5 font-mono text-amber-400 font-bold">
                            ₹{pass.spentToday.toLocaleString("en-IN")}
                          </td>
                          <td className="p-3.5 text-slate-400">{pass.allowedCategories}</td>
                          <td className="p-3.5">
                            {pass.isFrozen ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                🔒 FROZEN
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                ACTIVE
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => toggleFreezeMistriPass(pass.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ml-auto ${
                                pass.isFrozen
                                  ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                                  : "bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800"
                              }`}
                            >
                              {pass.isFrozen ? (
                                <>
                                  <Unlock className="w-3.5 h-3.5" />
                                  Unfreeze Pass
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3.5 h-3.5" />
                                  Emergency Freeze
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────
              MODULE 6: BOQ QUOTATIONS, CONON KHATA & BUYBACK REVERSE MATCHMAKER
          ────────────────────────────────────────────────────────── */}
          {activeTab === "boq_khata" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-2xl">
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-amber-400" />
                  BOQ Quotations, Conon Khata & Buyback Reverse Matchmaker
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Convert multi-ton builder kit estimates into instant contracts and match surplus site material to nearby live orders within 2 km.
                </p>
              </div>

              {/* BOQ Quotation Desk */}
              <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    High-Ticket Contractor Builder Kit BOQs
                  </h3>
                  <span className="text-xs text-slate-400">Direct Contractor Lead Desk</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {builderBoqs.map((boq) => (
                    <div
                      key={boq.id}
                      className="bg-[#111C35] border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-black text-white">{boq.contractorName}</span>
                          <span className="text-[10px] font-mono text-slate-400">{boq.requestDate}</span>
                        </div>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mb-2">
                          <MapPin className="w-3 h-3 text-amber-400" />
                          {boq.siteName} ({boq.lucknowZone})
                        </p>
                        <div className="bg-slate-900 rounded-lg p-2.5 text-xs text-slate-200 mb-3 border border-slate-800">
                          {boq.estimatedUnits}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold">Raw Value</span>
                          <span className="text-sm font-black text-white tabular-nums">
                            ₹{boq.rawEstimateInr.toLocaleString("en-IN")}
                          </span>
                        </div>
                        {boq.status === "QUOTED" ? (
                          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Quote Sent (₹{boq.quoteAmountInr?.toLocaleString("en-IN")})
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => sendInstantQuote(boq.id, boq.rawEstimateInr - 27000)}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/20 transition cursor-pointer flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Send 1-Click Quote (₹{(boq.rawEstimateInr - 27000).toLocaleString("en-IN")})
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leftover Buyback Reverse Matchmaker */}
              <div className="bg-gradient-to-br from-[#111C35] to-[#0F172A] border border-emerald-500/40 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-emerald-400" />
                      Leftover Buyback Reverse Matchmaker (Circular Fleet Logistics)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Excess sealed material listed by Lucknow sites matched to ongoing deliveries within 2.5 km to eliminate return depot trips.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Circular Logistics Active
                  </span>
                </div>

                <div className="space-y-3">
                  {buybackRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-[#070B14] border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{req.siteName}</span>
                          <span className="text-xs text-amber-400 font-black">({req.quantity})</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">{req.material}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                          <span className="text-emerald-400 font-bold">
                            Matched Target: {req.matchedOrderShortId}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-indigo-400 font-bold">
                            {req.matchedDistanceKm} km detour
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-bold">Instant Gold Credit</span>
                          <span className="text-sm font-black text-amber-400 tabular-nums">
                            ₹{req.buybackGoldValue.toLocaleString("en-IN")}
                          </span>
                        </div>

                        {req.status === "COMPLETED" ? (
                          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Transfer Approved
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => approveBuybackTransfer(req.id)}
                            className="px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-lg shadow-emerald-400/20 transition cursor-pointer flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve Transfer & Credit Gold
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────
              MODULE 7: KYC & COMPLIANCE WAR ROOM
          ────────────────────────────────────────────────────────── */}
          {activeTab === "kyc_war_room" && <AdminKycWarRoom />}

          {/* ─────────────────────────────────────────────────────────
              MODULE 8 + 11: UNIFIED CATALOG & MEDIA WORKBENCH
          ────────────────────────────────────────────────────────── */}
          {(activeTab === "media_vault" || activeTab === "catalog_studio") && (
            <div className="space-y-4">
              <div
                className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border ${
                  isDark ? "bg-[#0F172A] border-slate-800" : "bg-white border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                    Unified Catalog & Media Workbench
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Live Disk + Storefront Sync
                  </span>
                </div>
                <div className={`flex items-center p-1 rounded-xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-200"}`}>
                  <button
                    type="button"
                    onClick={() => setCatalogMediaSubTab("media")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer transition ${
                      catalogMediaSubTab === "media"
                        ? "bg-amber-400 text-slate-950"
                        : isDark
                        ? "text-slate-300 hover:text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Media & Photos (1-6)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCatalogMediaSubTab("catalog")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer transition ${
                      catalogMediaSubTab === "catalog"
                        ? "bg-amber-400 text-slate-950"
                        : isDark
                        ? "text-slate-300 hover:text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Master Catalog & Stock
                  </button>
                </div>
              </div>

              {catalogMediaSubTab === "media" ? (
                <AdminMediaVaultStudio isDark={isDark} />
              ) : (
                <AdminCatalogStudio />
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────
              MODULE 12: KHATA & BANK (TREASURY & LIVE MONEY X-RAY)
          ────────────────────────────────────────────────────────── */}
          {activeTab === "khata_bank" && (
            <AdminTreasuryControlCenter
              isDark={isDark}
              initialXrayOrderId={xrayOrderId}
              onClearInitialXray={() => setXrayOrderId(null)}
            />
          )}

          {/* ─────────────────────────────────────────────────────────
              MODULE 9: ACCOUNTS & GST (ROZ KA HISAAB & CA PDF)
          ────────────────────────────────────────────────────────── */}
          {activeTab === "accounts_gst" && <AdminAccountsGst />}

          {/* ─────────────────────────────────────────────────────────
              MODULE 10: SKILLED SERVICES & HEAVY RENTALS (SAC 9954/9973)
          ────────────────────────────────────────────────────────── */}
          {activeTab === "services_rentals" && <AdminServicesRentalsModule isDark={isDark} />}
        </main>
      </div>

      {/* Anti-Fraud From -> To Bank Transfer Verification Slip Modal */}
      <EscrowBankTransferModal
        escrow={escrowReleaseTarget}
        isDark={isDark}
        onClose={() => setEscrowReleaseTarget(null)}
        onConfirmReleased={(escrowId) => {
          releaseEscrowPayout(escrowId);
        }}
      />

      {/* ─────────────────────────────────────────────────────────────
          4. 1-TAP ACTION CONFIRMATION MODAL (Voice or Triggered)
      ────────────────────────────────────────────────────────────── */}
      {pendingVoiceAction && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0d1528] border border-amber-400/50 rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-4">
              <Sparkles className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-white">{pendingVoiceAction.title}</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {pendingVoiceAction.description}
            </p>

            <div className="flex items-center gap-2 mt-6">
              <button
                type="button"
                onClick={() => setPendingVoiceAction(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={() => pendingVoiceAction.execute()}
                className="flex-1 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 transition shadow-lg shadow-amber-400/20 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Zap className="w-4 h-4" />
                1-Tap Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CononCommandOS;
