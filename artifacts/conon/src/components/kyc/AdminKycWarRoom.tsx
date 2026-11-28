import React, { useState, useMemo } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Store,
  Truck,
  FileCheck2,
  CreditCard,
  Scan,
  MapPin,
  Calendar,
  Clock,
  Eye,
  Check,
  X,
  Send,
  AlertCircle,
  ExternalLink,
  Search,
  Filter,
  User,
  Phone,
  RefreshCw,
  Zap,
  QrCode,
  Share2,
  Copy,
  Building2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useKyc, PartnerKycApplication, KycDocument, KycDocStatus } from "@/context/KycContext";
import { AdminComplianceKillSwitchPanel } from "@/components/kyc/AdminComplianceKillSwitchPanel";
import { toast } from "sonner";

export function AdminKycWarRoom() {
  const {
    applications,
    adminReviewDocument,
    adminDecideApplication,
    simulateComplianceExpiry,
    refreshKycQueue,
    isLoadingQueue,
  } = useKyc();

  // Tab Filter
  const [filterTab, setFilterTab] = useState<
    "ALL" | "VENDOR" | "DRIVER" | "REUPLOAD" | "EXPIRING" | "APPROVED"
  >("ALL");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppId, setSelectedAppId] = useState<string | null>(
    applications[0]?.id || null
  );

  // Lightbox Inspection Modal
  const [inspectDoc, setInspectDoc] = useState<KycDocument | null>(null);

  // Re-upload dialog
  const [reuploadPromptDocId, setReuploadPromptDocId] = useState<string | null>(null);
  const [reuploadReason, setReuploadReason] = useState("Blurry scan / unreadable text. Please re-upload high resolution photo.");

  // Filtered applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      if (filterTab === "VENDOR" && app.applicantType !== "VENDOR") return false;
      if (filterTab === "DRIVER" && app.applicantType !== "DRIVER") return false;
      if (filterTab === "REUPLOAD" && app.status !== "REUPLOAD_REQUESTED") return false;
      if (filterTab === "APPROVED" && app.status !== "APPROVED") return false;
      if (filterTab === "EXPIRING" && app.status !== "EXPIRING_SOON" && app.status !== "COMPLIANCE_PAUSED") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          app.firmOrName.toLowerCase().includes(q) ||
          app.ownerOrDriverName.toLowerCase().includes(q) ||
          app.zone.toLowerCase().includes(q) ||
          app.phone.includes(q) ||
          (app.vehiclePlate && app.vehiclePlate.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [applications, filterTab, searchQuery]);

  const selectedApp = useMemo(() => {
    return applications.find((a) => a.id === selectedAppId) || applications[0] || null;
  }, [applications, selectedAppId]);

  // Handle Verify Doc
  const handleVerifyDoc = async (docId: string) => {
    await adminReviewDocument(docId, "VERIFIED");
  };

  // Handle Request Re-upload
  const handleConfirmReupload = async () => {
    if (!reuploadPromptDocId) return;
    await adminReviewDocument(reuploadPromptDocId, "REUPLOAD_REQUIRED", reuploadReason);
    setReuploadPromptDocId(null);
  };

  // Final Decision
  const handleFinalDecision = async (decision: "APPROVE" | "REUPLOAD" | "REJECT") => {
    if (!selectedApp) return;
    await adminDecideApplication(selectedApp.id, decision);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#070B14] text-slate-100 overflow-hidden font-sans">
      {/* ─────────────────────────────────────────────────────────────
          1. WAR ROOM TOP BAR: STATS + SEARCH + REFRESH
      ────────────────────────────────────────────────────────────── */}
      <div className="bg-[#0B1120] border-b border-slate-800 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-400/20">
            <ShieldCheck className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                CONON KYC & Compliance War Room
              </h2>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                MODULE 7
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Lucknow Hardware Hub Paper Verification • RTO Sentinel • Auto-Expiry Kill-Switch
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search partner, phone, plate, zone…"
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 w-52 sm:w-64"
            />
          </div>

          {/* Refresh Queue */}
          <button
            type="button"
            onClick={() => refreshKycQueue()}
            disabled={isLoadingQueue}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isLoadingQueue ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Sync Queue</span>
          </button>
        </div>
      </div>

      {/* Security, Compliance Shield & Physical Field Inspection */}
      <div className="px-4 sm:px-6 pt-4">
        <AdminComplianceKillSwitchPanel applications={applications} />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. FILTER TABS ROW
      ────────────────────────────────────────────────────────────── */}
      <div className="bg-[#0D1322] border-b border-slate-800 px-4 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: "ALL", label: "All Applications", count: applications.length },
          {
            id: "VENDOR",
            label: "Hardware Dukaans",
            count: applications.filter((a) => a.applicantType === "VENDOR").length,
          },
          {
            id: "DRIVER",
            label: "Drivers & Loaders",
            count: applications.filter((a) => a.applicantType === "DRIVER").length,
          },
          {
            id: "REUPLOAD",
            label: "Re-Upload Requested",
            count: applications.filter((a) => a.status === "REUPLOAD_REQUESTED").length,
          },
          {
            id: "EXPIRING",
            label: "Expiring Soon / Paused",
            count: applications.filter(
              (a) => a.status === "EXPIRING_SOON" || a.status === "COMPLIANCE_PAUSED"
            ).length,
          },
          {
            id: "APPROVED",
            label: "Live & Approved",
            count: applications.filter((a) => a.status === "APPROVED").length,
          },
        ].map((tab) => {
          const isActive = filterTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-2 cursor-pointer ${
                isActive
                  ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20"
                  : "bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? "bg-slate-950 text-amber-300 font-mono" : "bg-slate-800 text-slate-300"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN SPLIT-SCREEN WORKSPACE
      ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT COLUMN: Queue List */}
        <div className="w-full lg:w-80 xl:w-96 bg-[#090D18] border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-3 border-b border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-500">
            Pending Inspection Queue ({filteredApps.length})
          </div>

          <div className="p-2 space-y-2">
            {filteredApps.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No applications matching current filter.
              </div>
            ) : (
              filteredApps.map((app) => {
                const isSelected = selectedApp?.id === app.id;
                const isApproved = app.status === "APPROVED";
                const isReupload = app.status === "REUPLOAD_REQUESTED";
                const isPaused = app.status === "COMPLIANCE_PAUSED";

                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => setSelectedAppId(app.id)}
                    className={`w-full text-left p-3 rounded-2xl transition border cursor-pointer ${
                      isSelected
                        ? "bg-[#161F32] border-amber-400/60 shadow-lg shadow-amber-400/5 text-white"
                        : "bg-[#0E1524] hover:bg-[#121B2C] border-slate-800/80 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        {app.applicantType === "VENDOR" ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20 flex items-center gap-1">
                            <Store className="w-2.5 h-2.5" />
                            DUKAAN
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-400/10 text-emerald-300 border border-emerald-400/20 flex items-center gap-1">
                            <Truck className="w-2.5 h-2.5" />
                            DRIVER
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-400">
                          {app.partnerId ? `${app.partnerId} (${app.applicantId})` : app.applicantId}
                        </span>
                      </div>

                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                          isApproved
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : isReupload
                            ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                            : isPaused
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <p className="text-xs font-black truncate text-white">{app.firmOrName}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {app.ownerOrDriverName} • {app.zone}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>AI Score: {app.aiAuthenticityScore}%</span>
                      <span>Penny-Drop: {app.pennyDropStatus}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: LUXURY SPLIT-SCREEN INSPECTOR */}
        {selectedApp ? (
          <div className="flex-1 flex flex-col overflow-y-auto bg-[#070B14]">
            {/* Applicant Summary Banner */}
            <div className="bg-[#0F172A] border-b border-slate-800 p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-400/20">
                    {selectedApp.applicantType === "VENDOR" ? <Store className="w-6 h-6" /> : <Truck className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-xl font-black text-white">
                        {selectedApp.firmOrName}
                      </h3>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {selectedApp.applicantId}
                      </span>
                      {selectedApp.partnerId && (
                        <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-amber-400 text-slate-950 border border-amber-300 shadow-sm flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-slate-950" />
                          <span>PARTNER ID: {selectedApp.partnerId}</span>
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                        AI Score: {selectedApp.aiAuthenticityScore}% Authentic
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Contact: <strong className="text-white">{selectedApp.ownerOrDriverName}</strong> ({selectedApp.phone}) • Zone: <strong className="text-white">{selectedApp.zone}</strong>
                    </p>
                  </div>
                </div>

                {/* Final Decision Bar */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleFinalDecision("APPROVE")}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Approve & Go Live 🚀</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFinalDecision("REUPLOAD")}
                    className="px-3.5 py-2 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/40 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Send Back for Re-Upload</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFinalDecision("REJECT")}
                    className="px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              {/* Sub-Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Bank Payout Verification</p>
                  <p className="font-mono text-emerald-400 font-bold mt-0.5">
                    ✓ {selectedApp.pennyDropStatus}
                  </p>
                  <p className="text-[9px] text-slate-500 truncate">{selectedApp.pennyDropRef}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">GPS Coordinate Pin</p>
                  <p className="font-mono text-white font-bold mt-0.5">
                    {selectedApp.shopLat || 26.7812}° N, {selectedApp.shopLng || 80.9981}° E
                  </p>
                  <p className="text-[9px] text-emerald-400">Within corridor bounds</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Loading / Fleet Mode</p>
                  <p className="text-white font-bold mt-0.5">
                    {selectedApp.vehicleMode || selectedApp.loadingBayAccess || "LOADER_FRIENDLY"}
                  </p>
                  <p className="text-[9px] text-slate-400">{selectedApp.vehiclePlate || "Wide Road Entry"}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Compliance Kill-Switch</p>
                  <button
                    type="button"
                    onClick={() => simulateComplianceExpiry(selectedApp.applicantId, "INSURANCE")}
                    className="mt-1 text-[10px] text-rose-300 bg-rose-950/60 hover:bg-rose-900/80 px-2 py-0.5 rounded border border-rose-800/40 transition cursor-pointer flex items-center gap-1 font-bold"
                  >
                    <Zap className="w-2.5 h-2.5 text-rose-400" />
                    <span>Simulate Expiry</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Document Inspection Grid */}
            <div className="p-4 sm:p-6 flex-1">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Scan className="w-4 h-4 text-amber-400" />
                  Submitted Verification Papers ({selectedApp.documents.length})
                </h4>
                <span className="text-xs text-slate-400">
                  Click any document to inspect in high-res lightbox
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedApp.documents.map((doc) => {
                  const isVerified = doc.status === "VERIFIED";
                  const isFlagged = doc.status === "REUPLOAD_REQUIRED";

                  return (
                    <div
                      key={doc.docId}
                      className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                        isVerified
                          ? "bg-slate-900/90 border-emerald-500/40 shadow-inner"
                          : isFlagged
                          ? "bg-amber-950/20 border-amber-400/50"
                          : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-black text-white truncate">
                            {doc.docName}
                          </span>
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                              isVerified
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : isFlagged
                                ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {doc.status}
                          </span>
                        </div>

                        {/* Thumbnail */}
                        <div
                          onClick={() => setInspectDoc(doc)}
                          className="h-32 bg-slate-950 rounded-xl overflow-hidden relative cursor-pointer group border border-slate-800 mb-3"
                        >
                          <img
                            src={doc.docUrl}
                            alt={doc.docName}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-80 group-hover:opacity-100"
                          />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 text-xs font-bold text-white">
                            <Eye className="w-4 h-4 text-amber-400" />
                            <span>Click to Zoom & Inspect</span>
                          </div>
                          {doc.extractedNumber && (
                            <span className="absolute bottom-1.5 left-2 text-[9px] font-mono text-emerald-300 bg-slate-950/90 px-1.5 py-0.5 rounded border border-slate-800">
                              {doc.extractedNumber}
                            </span>
                          )}
                        </div>

                        {/* Extracted Details */}
                        <div className="space-y-1 text-xs text-slate-300">
                          {doc.extractedName && (
                            <p className="text-[11px] text-slate-400 truncate">
                              Name on Paper: <strong className="text-white">{doc.extractedName}</strong>
                            </p>
                          )}
                          {doc.extractedExpiry && (
                            <p className="text-[11px] text-amber-300 font-mono">
                              Expiry: {doc.extractedExpiry}
                            </p>
                          )}
                          {doc.rejectionReason && (
                            <p className="text-[11px] text-amber-300 bg-amber-950/60 p-1.5 rounded border border-amber-500/30 mt-1">
                              Re-upload note: "{doc.rejectionReason}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Document Actions Bar */}
                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleVerifyDoc(doc.docId)}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                            isVerified
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black"
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isVerified ? "✓ Verified" : "Verify Paper"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setReuploadPromptDocId(doc.docId);
                            setReuploadReason(
                              doc.docType === "INSURANCE_PUC"
                                ? "Policy expired or invalid commercial goods coverage."
                                : "Blurry scan / unreadable text. Please re-upload high resolution photo."
                            );
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3 text-amber-400" />
                          <span>Flag Re-Upload</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Compliance Audit Log Timeline */}
              <div className="mt-8 pt-6 border-t border-slate-800">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Live Compliance Audit Log Timeline
                </h4>
                <div className="space-y-2">
                  {selectedApp.auditLogs.map((log) => (
                    <div
                      key={log.logId}
                      className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span className="font-bold text-white">{log.action}:</span>
                        <span className="text-slate-300">{log.note || log.action}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {log.actor} • {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto bg-[#070B14]">
            <div className="max-w-2xl w-full bg-[#0F172A] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-3xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto mb-4 text-amber-400 shadow-lg shadow-amber-400/10">
                  <ShieldCheck className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Partner KYC War Room — Clean Slate Standby
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-2">
                  All dummy partners have been cleared. Onboard real Lucknow hardware stores and fleet drivers with instant paper verification.
                </p>
              </div>

              {/* Real-Time Compliance Engine Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-6 text-center">
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-black uppercase text-emerald-400 flex items-center justify-center gap-1 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    ARMED
                  </span>
                  <div className="text-xs font-bold text-white">NPCI IMPS Penny-Drop</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">₹1 Name Match Bank Sync</div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-black uppercase text-sky-400 flex items-center justify-center gap-1 mb-1">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                    ONLINE
                  </span>
                  <div className="text-xs font-bold text-white">AI OCR Engine</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Automated Field Extractor</div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-black uppercase text-amber-400 flex items-center justify-center gap-1 mb-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    CONNECTED
                  </span>
                  <div className="text-xs font-bold text-white">4-Panel Relay</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Real-time Socket.io Bridge</div>
                </div>
              </div>

              {/* 1-Click WhatsApp Onboarding Invite Links */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 mb-6">
                <div className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>1-Click Partner WhatsApp Invite Links</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href="https://wa.me/?text=Namaste!%20Join%20CONON-NOW%20as%20a%20Verified%20Hardware%20Partner%20Shop%20in%20Lucknow.%20Register%20here%3A%20https%3A%2F%2Fconon.now%2Fvendor%2Fregister"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold transition flex items-center justify-between group cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-amber-400" />
                      <span>Invite Hardware Store</span>
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </a>

                  <a
                    href="https://wa.me/?text=Namaste!%20Join%20CONON-NOW%20as%20a%20Verified%20Fleet%20Driver%20(Chhota%20Hathi%20%2F%20Loader)%20in%20Lucknow.%20Register%20here%3A%20https%3A%2F%2Fconon.now%2Fdriver%2Fregister"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-emerald-400/10 hover:bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold transition flex items-center justify-between group cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-400" />
                      <span>Invite Fleet Driver</span>
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>

              {/* Onboarding Flow Preview */}
              <div className="text-[11px] text-slate-400 space-y-1.5 border-t border-slate-800/80 pt-4">
                <div className="font-bold text-slate-300 mb-1">How Real Partner Verification Works:</div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-[10px]">1</span>
                  <span>Partner fills quick KYC form on Dukaan OS or Driver Cockpit</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-[10px]">2</span>
                  <span>AI OCR verifies document clarity & NPCI runs ₹1 penny-drop validation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-[10px]">3</span>
                  <span>New submission instantly pops into this War Room queue for your 1-click approval</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. HIGH-RES LIGHTBOX MODAL
      ────────────────────────────────────────────────────────────── */}
      {inspectDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-150">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div>
                <h4 className="text-sm font-black text-white">{inspectDoc.docName}</h4>
                <p className="text-xs text-slate-400 font-mono">
                  Extracted: {inspectDoc.extractedNumber || "N/A"} • Quality: {inspectDoc.ocrReadQuality}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectDoc(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-96 bg-black rounded-2xl overflow-hidden flex items-center justify-center">
              <img
                src={inspectDoc.docUrl}
                alt={inspectDoc.docName}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                AI Authenticity Score: {inspectDoc.ocrAuthenticityScore}%
              </span>
              <button
                type="button"
                onClick={() => {
                  handleVerifyDoc(inspectDoc.docId);
                  setInspectDoc(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition"
              >
                ✓ Verify This Paper
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. RE-UPLOAD REASON PROMPT DIALOG
      ────────────────────────────────────────────────────────────── */}
      {reuploadPromptDocId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-150">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl">
            <h4 className="text-sm font-black text-white mb-2 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              Request Paper Re-Upload from Partner
            </h4>
            <p className="text-xs text-slate-300 mb-3">
              Select or type the exact reason. The partner will see this note live in their Dukaan / Driver panel.
            </p>

            <div className="space-y-1.5 mb-3">
              {[
                "Blurry scan / unreadable text. Please re-upload high resolution photo.",
                "Owner name mismatch with PAN card.",
                "Expired commercial goods insurance policy.",
                "Shop signboard photo missing geo-tag or GPS location.",
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setReuploadReason(preset)}
                  className={`w-full text-left p-2 rounded-xl text-xs transition ${
                    reuploadReason === preset
                      ? "bg-amber-400/20 border border-amber-400/40 text-amber-200"
                      : "bg-slate-950/60 hover:bg-slate-800 text-slate-400"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <textarea
              value={reuploadReason}
              onChange={(e) => setReuploadReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 mb-4"
              rows={3}
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setReuploadPromptDocId(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReupload}
                className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition"
              >
                Send Re-Upload Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
