import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  Clock,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  FileText,
  Upload,
  Sparkles,
  Camera,
  Play,
  Volume2,
  Bell,
  ArrowRight,
  LogOut,
  Store,
  Truck,
  IndianRupee,
  Check,
  Eye,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { resolveApiUrl } from "@/lib/apiBase";
import { getSocket } from "@/services/socket";
import { playOrderChime } from "@/lib/sound";
import { compressImageToWebP } from "@/services/adminMasterCatalog";
import {
  useKyc,
  type PartnerKycApplication,
  type KycDocument,
} from "@/context/KycContext";
import { useVendorTheme, VendorThemeToggle } from "@/context/VendorThemeContext";
import { useVendorLang, VendorLanguageToggle } from "@/context/VendorLanguageContext";
import { type PartnerSession } from "./PartnerAccessGate";

interface PartnerWaitingRoomProps {
  role: "vendor" | "driver";
  application: PartnerKycApplication;
  onUnlocked: (session: PartnerSession) => void;
  onLogout: () => void;
}

export function PartnerWaitingRoom({
  role,
  application: initialApp,
  onUnlocked,
  onLogout,
}: PartnerWaitingRoomProps) {
  const { applications, reuploadDocument } = useKyc();
  const { isDark } = useVendorTheme();
  const { t, lang } = useVendorLang();

  // Find latest application from KycContext or initial prop
  const currentApp =
    applications.find(
      (a) =>
        a.id === initialApp.id ||
        a.applicantId === initialApp.applicantId ||
        (a.phone && initialApp.phone && a.phone.replace(/\D/g, "").slice(-10) === initialApp.phone.replace(/\D/g, "").slice(-10))
    ) || initialApp;

  // Celebration overlay state
  const [showCelebration, setShowCelebration] = useState(false);
  const [unlockedPartnerId, setUnlockedPartnerId] = useState<string>("");

  // Re-upload state
  const [reuploadingDoc, setReuploadingDoc] = useState<KycDocument | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Practice Drill States
  const [practiceActive, setPracticeActive] = useState(false);
  const [practiceTimer, setPracticeTimer] = useState(180);
  const [practiceOrderAccepted, setPracticeOrderAccepted] = useState(false);
  const [practiceDriverPhotoUploaded, setPracticeDriverPhotoUploaded] = useState(false);

  const isVendor = role === "vendor";

  // Check if current application transitioned to APPROVED
  const checkApprovalAndUnlock = (app: PartnerKycApplication) => {
    if (app.status === "APPROVED" && !showCelebration) {
      const pId = app.partnerId || (isVendor ? "CN-VND-LKO-108" : "CN-DRV-LKO-204");
      setUnlockedPartnerId(pId);
      setShowCelebration(true);
      playOrderChime();

      const session: PartnerSession = {
        partnerId: pId,
        phone: app.phone,
        firmOrName: app.firmOrName,
        role,
        status: "APPROVED",
      };

      const storageKey = isVendor ? "conon_vendor_session" : "conon_driver_session";
      localStorage.setItem(storageKey, JSON.stringify(session));

      // After 2.5s celebration, transition into live dashboard
      setTimeout(() => {
        onUnlocked(session);
      }, 2500);
    }
  };

  useEffect(() => {
    checkApprovalAndUnlock(currentApp);
  }, [currentApp]);

  // Socket & BroadcastChannel Real-Time Listeners
  useEffect(() => {
    const socket = getSocket();

    const handleKycApproved = (data: any) => {
      const app = data?.application;
      if (
        app &&
        (app.id === currentApp.id ||
          app.applicantId === currentApp.applicantId ||
          app.phone?.slice(-10) === currentApp.phone?.slice(-10))
      ) {
        checkApprovalAndUnlock(app);
      }
    };

    const handlePartnerUnlocked = (data: any) => {
      if (
        data &&
        (data.applicantId === currentApp.applicantId ||
          data.phone?.slice(-10) === currentApp.phone?.slice(-10))
      ) {
        const pId = data.partnerId || (isVendor ? "CN-VND-LKO-108" : "CN-DRV-LKO-204");
        setUnlockedPartnerId(pId);
        setShowCelebration(true);
        playOrderChime();

        const session: PartnerSession = {
          partnerId: pId,
          phone: currentApp.phone,
          firmOrName: currentApp.firmOrName,
          role,
          status: "APPROVED",
        };

        const storageKey = isVendor ? "conon_vendor_session" : "conon_driver_session";
        localStorage.setItem(storageKey, JSON.stringify(session));

        setTimeout(() => {
          onUnlocked(session);
        }, 2500);
      }
    };

    if (socket) {
      socket.on("kyc:application_approved", handleKycApproved);
      socket.on("kyc:decision", handleKycApproved);
      socket.on("partner:unlocked", handlePartnerUnlocked);
    }

    // Storage listener (for cross-tab approval in same browser)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "conon_kyc_state_v2" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            const updated = parsed.find(
              (a: any) =>
                a.id === currentApp.id ||
                a.applicantId === currentApp.applicantId ||
                a.phone?.slice(-10) === currentApp.phone?.slice(-10)
            );
            if (updated) checkApprovalAndUnlock(updated);
          }
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Cross-tab BroadcastChannel listener
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== "undefined") {
        bc = new BroadcastChannel("conon_kyc_bus");
        bc.onmessage = (event) => {
          if (event.data?.type === "KYC_STATE_UPDATE" && Array.isArray(event.data.payload)) {
            const updated = event.data.payload.find(
              (a: any) =>
                a.id === currentApp.id ||
                a.applicantId === currentApp.applicantId ||
                a.phone?.slice(-10) === currentApp.phone?.slice(-10)
            );
            if (updated) checkApprovalAndUnlock(updated);
          }
        };
      }
    } catch {
      // ignore
    }

    return () => {
      if (socket) {
        socket.off("kyc:application_approved", handleKycApproved);
        socket.off("kyc:decision", handleKycApproved);
        socket.off("partner:unlocked", handlePartnerUnlocked);
      }
      window.removeEventListener("storage", handleStorageChange);
      if (bc) {
        try {
          bc.close();
        } catch {
          // ignore
        }
      }
    };
  }, [currentApp, isVendor]);

  // Practice Timer Countdown
  useEffect(() => {
    let interval: any;
    if (practiceActive && !practiceOrderAccepted && practiceTimer > 0) {
      interval = setInterval(() => {
        setPracticeTimer((t) => (t > 0 ? t - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [practiceActive, practiceOrderAccepted, practiceTimer]);

  // Handle Document Re-Upload
  const handleSelectReuploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !reuploadingDoc) return;

    try {
      setIsCompressing(true);
      const compressed = await compressImageToWebP(file, 800, 0.82);
      await reuploadDocument(reuploadingDoc.docId, compressed);

      toast.success(
        lang === "hi"
          ? `✓ ${reuploadingDoc.docName} सफलतापूर्वक पुनः अपलोड किया गया!`
          : `✓ ${reuploadingDoc.docName} re-uploaded successfully!`
      );
      setReuploadingDoc(null);
    } catch {
      toast.error("Failed to compress and upload paper");
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDark ? "bg-[#070B14] text-slate-100" : "bg-[#F6F7F9] text-slate-900"
      }`}
    >
      {/* ─────────────────────────────────────────────────────────────
          CELEBRATION OVERLAY (TRIGGERED INSTANTLY WHEN ADMIN APPROVES)
      ────────────────────────────────────────────────────────────── */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 to-emerald-400 p-1 shadow-2xl shadow-emerald-500/30 animate-bounce mb-6">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-12 h-12" />
            </div>
          </div>

          <span className="px-4 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 mb-3">
            VERIFICATION COMPLETED • 100% APPROVED
          </span>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            🎉 Badhai Ho! Account Verified!
          </h2>

          <p className="text-sm text-slate-300 max-w-lg mt-2 leading-relaxed">
            Conon HQ Admin has verified your papers and unlocked your live console.
          </p>

          <div className="my-6 p-4 rounded-2xl bg-slate-900 border border-amber-400/40 text-center max-w-sm w-full shadow-xl">
            <div className="text-xs text-slate-400">Assigned Official Partner ID:</div>
            <div className="text-2xl font-black font-mono text-amber-400 tracking-wider mt-1">
              {unlockedPartnerId}
            </div>
            <div className="text-[11px] text-emerald-400 font-bold mt-1">
              ✓ Active on Lucknow 7-Zone Supply Corridor
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Opening Live Workstation in 2 seconds...</span>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <header
        className={`sticky top-0 z-40 px-4 sm:px-6 py-3 border-b backdrop-blur-md transition-colors ${
          isDark ? "bg-[#0B1120]/90 border-slate-800" : "bg-white/90 border-slate-200 shadow-xs"
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 group">
              <img
                src={`${import.meta.env.BASE_URL}images/conon-logo-transparent.png`}
                alt="CONON-NOW"
                className="h-8 w-auto object-contain group-hover:scale-105 transition-transform"
              />
            </a>

            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-700/60">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                VERIFICATION WAITING ROOM
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                ({currentApp.applicantId})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <VendorLanguageToggle />
            <VendorThemeToggle />
            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              title="Sign Out to Login Gate"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Hero Card with Live Status Tracker */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/10 text-amber-400 border border-amber-400/30 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>
                    {currentApp.status === "REUPLOAD_REQUESTED"
                      ? "Action Required: Re-Upload Document"
                      : "Conon HQ Final Verification in Progress"}
                  </span>
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Zone: {currentApp.zone}
                </span>
              </div>

              <h2 className="text-2xl font-black text-white tracking-tight mt-2">
                {currentApp.firmOrName}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Proprietor: <strong className="text-slate-200">{currentApp.ownerOrDriverName}</strong> • Phone: {currentApp.phone}
              </p>
            </div>

            <div className="text-left md:text-right space-y-1">
              <div className="text-xs text-slate-400">AI OCR Authenticity Score:</div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {currentApp.aiAuthenticityScore}% Verified
              </div>
              <div className="text-[11px] text-slate-400 flex items-center md:justify-end gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>₹1 Penny-Drop Matched</span>
              </div>
            </div>
          </div>

          {/* 3-Stage Live Tracker */}
          <div className="pt-6">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Application Progress
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Stage 1: Submitted */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/40 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">1. Papers Submitted</div>
                  <div className="text-[10px] text-emerald-400">Upload package verified</div>
                </div>
              </div>

              {/* Stage 2: AI OCR & Penny-Drop */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/40 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">2. AI OCR &amp; ₹1 Penny-Drop</div>
                  <div className="text-[10px] text-emerald-400">Bank name matched ✓</div>
                </div>
              </div>

              {/* Stage 3: Admin Final Review */}
              <div
                className={`p-3.5 rounded-2xl flex items-center gap-3 border ${
                  currentApp.status === "REUPLOAD_REQUESTED"
                    ? "bg-rose-950/30 border-rose-500/40 text-rose-300"
                    : "bg-amber-950/30 border-amber-500/40 text-amber-300"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    currentApp.status === "REUPLOAD_REQUESTED"
                      ? "bg-rose-500/20 text-rose-400"
                      : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  <Clock className="w-4 h-4 animate-spin" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">3. Conon HQ Final Review</div>
                  <div className="text-[10px]">
                    {currentApp.status === "REUPLOAD_REQUESTED"
                      ? "Re-upload requested by Admin"
                      : "Live in admin war room queue..."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Document Status Cards Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>SUBMITTED COMPLIANCE PAPERS &amp; REVIEW STATUS</span>
            </h3>
            <span className="text-xs text-slate-400">
              {currentApp.documents.length} Documents Attached
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentApp.documents.map((doc) => {
              const isReupload = doc.status === "REUPLOAD_REQUIRED";
              const isVerified = doc.status === "VERIFIED";

              return (
                <div
                  key={doc.docId}
                  className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                    isReupload
                      ? "bg-rose-950/20 border-rose-500/60 ring-1 ring-rose-500/40 animate-pulse"
                      : isVerified
                      ? "bg-slate-900 border-emerald-500/30"
                      : "bg-slate-900 border-slate-800"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-slate-400">
                        {doc.docType.replace(/_/g, " ")}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isVerified
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : isReupload
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {isVerified
                          ? "Verified ✓"
                          : isReupload
                          ? "Re-Upload Needed"
                          : "Pending Review"}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white">{doc.docName}</h4>

                    {doc.extractedNumber && (
                      <div className="text-[11px] font-mono text-amber-400 mt-1">
                        No: {doc.extractedNumber}
                      </div>
                    )}

                    {/* Rejection / Note banner */}
                    {isReupload && doc.rejectionReason && (
                      <div className="mt-2.5 p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] space-y-1">
                        <div className="font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Admin Remark:</span>
                        </div>
                        <p className="text-[10px] text-slate-200">
                          {doc.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 pt-3 border-t border-slate-800">
                    {isReupload ? (
                      <button
                        type="button"
                        onClick={() => {
                          setReuploadingDoc(doc);
                          fileInputRef.current?.click();
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Clear Paper Now</span>
                      </button>
                    ) : (
                      <div className="text-[10px] text-slate-500 text-center">
                        {isVerified ? "✓ Verified by Admin" : "Awaiting final review"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hidden File Input for Re-upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleSelectReuploadFile}
            className="hidden"
          />
        </div>

        {/* ─────────────────────────────────────────────────────────────
            INTERACTIVE "2-MINUTE PRACTICE DRILL" (ISOLATED MINI-SANDBOX)
        ────────────────────────────────────────────────────────────── */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
                <Play className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">
                  {isVendor
                    ? "2-Minute Practice Drill: 180s Order Acceptance"
                    : "2-Minute Practice Drill: Unloading Photo & OTP Check"}
                </h3>
                <p className="text-xs text-slate-400">
                  {isVendor
                    ? "Safe isolated drill • Practice receiving and accepting high-priority Lucknow dhalai orders."
                    : "Safe isolated drill • Practice taking GPS site photos and confirming customer delivery OTP."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setPracticeActive(true);
                setPracticeTimer(180);
                setPracticeOrderAccepted(false);
                setPracticeDriverPhotoUploaded(false);
                playOrderChime();
                toast.info("Started 2-minute mock practice drill!");
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-amber-400/20 self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{practiceActive ? "Restart Drill" : "Start Practice Drill"}</span>
            </button>
          </div>

          {/* Practice Simulation Console */}
          {practiceActive && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 animate-in fade-in">
              {isVendor ? (
                /* Vendor Drill: 180s Flash Buzzer */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5 animate-pulse">
                      <Bell className="w-4 h-4" />
                      <span>SIMULATED FLASH ORDER: Dhalai Urgent (Sushant Golf City)</span>
                    </span>
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      ⏱️ {practiceTimer}s Left
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                    <div className="font-bold text-white">
                      50x UltraTech Super PPC 50kg + 10x Tata Tiscon 12mm
                    </div>
                    <div className="text-slate-400">
                      Total Order Value: <strong className="text-amber-400">₹27,550</strong> • Customer: Ramesh Singh
                    </div>
                    <div className="text-[10px] text-emerald-400">
                      Escrow Reserved &amp; Chhota Hathi Assigned
                    </div>
                  </div>

                  {practiceOrderAccepted ? (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Order Accepted in {180 - practiceTimer}s! KOT Print Dispatched. Drill Passed ✓</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setPracticeOrderAccepted(true);
                        playOrderChime();
                        toast.success("✓ Drill Order Accepted! Great speed.");
                      }}
                      className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition cursor-pointer"
                    >
                      ✓ 1-Tap Accept Order Now (Practice)
                    </button>
                  )}
                </div>
              ) : (
                /* Driver Drill: Photo & OTP */
                <div className="space-y-3">
                  <div className="text-xs font-bold text-amber-400">
                    SIMULATED MISSION: Deliver 30 Bags Cement to Gomti Nagar Site
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                    <div className="text-slate-300">
                      Step 1: Capture Unloading GPS Site Photo (Tarpaulin / Tirpal Check)
                    </div>

                    {practiceDriverPhotoUploaded ? (
                      <div className="text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>GPS Photo Captured (26.8467° N, 80.9462° E) ✓</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setPracticeDriverPhotoUploaded(true);
                          toast.success("Photo captured and geotagged!");
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700"
                      >
                        <Camera className="w-3.5 h-3.5 text-amber-400" />
                        <span>Take Mock Unloading Photo</span>
                      </button>
                    )}

                    <div className="pt-2 border-t border-slate-800 text-slate-300">
                      Step 2: Customer Delivery OTP: <strong className="text-amber-400 font-mono">4892</strong>
                    </div>

                    <button
                      type="button"
                      disabled={!practiceDriverPhotoUploaded}
                      onClick={() => toast.success("✓ Delivery Completed & ₹350 Payout Released to Driver Wallet!")}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs transition"
                    >
                      Complete Delivery (Practice)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
