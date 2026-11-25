import React, { useState } from "react";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  UploadCloud,
  FileCheck2,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Store,
  Truck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useKyc, KycDocument } from "@/context/KycContext";
import { toast } from "sonner";

interface KycSandboxPendingBannerProps {
  onSwitchToVerifiedDemo?: () => void;
  type: "VENDOR" | "DRIVER";
}

export function KycSandboxPendingBanner({
  onSwitchToVerifiedDemo,
  type,
}: KycSandboxPendingBannerProps) {
  const { currentApplication, reuploadDocument, setActiveApplicantId } = useKyc();
  const [reuploadDoc, setReuploadDoc] = useState<KycDocument | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  if (!currentApplication) return null;

  const isPending = currentApplication.status === "PENDING_VERIFICATION";
  const isReupload = currentApplication.status === "REUPLOAD_REQUESTED";
  const isApproved = currentApplication.status === "APPROVED";
  const isPaused = currentApplication.status === "COMPLIANCE_PAUSED";

  const flaggedDocs = currentApplication.documents.filter(
    (d) => d.status === "REUPLOAD_REQUIRED"
  );

  const handleTriggerReupload = (doc: KycDocument) => {
    setReuploadDoc(doc);
    setIsScanning(true);
    setScanProgress(20);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 25;
      });
    }, 250);

    setTimeout(async () => {
      clearInterval(interval);
      setScanProgress(100);
      setIsScanning(false);
      await reuploadDocument(
        doc.docId,
        "/images/kyc/sample-fixed-doc.webp",
        doc.extractedNumber || "UP32-FIXED-9912",
        currentApplication.ownerOrDriverName
      );
      setReuploadDoc(null);
    }, 1200);
  };

  return (
    <div className="w-full">
      {/* 1. REUPLOAD REQUESTED WARNING */}
      {isReupload && (
        <div className="bg-gradient-to-r from-amber-950/90 via-amber-900/80 to-amber-950/90 border-b border-amber-500/50 px-4 py-3 text-amber-100 shadow-xl">
          <div className="max-w-[1680px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 animate-pulse">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                    PAPER RE-UPLOAD REQUIRED
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                    Action Needed by {type === "VENDOR" ? "Dukaan Owner" : "Driver"}
                  </span>
                </div>
                <p className="text-xs text-amber-200/90 mt-0.5">
                  Admin Verification Desk requested a clearer photo for:{" "}
                  <strong className="text-white underline">
                    {flaggedDocs.map((d) => d.docName).join(", ")}
                  </strong>
                  .
                  {flaggedDocs[0]?.rejectionReason && (
                    <span className="ml-1 text-amber-300 font-mono text-[11px] bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                      Reason: "{flaggedDocs[0].rejectionReason}"
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {flaggedDocs.map((doc) => (
                <button
                  key={doc.docId}
                  type="button"
                  onClick={() => handleTriggerReupload(doc)}
                  disabled={isScanning}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-400/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isScanning && reuploadDoc?.docId === doc.docId ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Scanning New Paper {scanProgress}%…</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>1-Tap Re-Upload Clear Scan</span>
                    </>
                  )}
                </button>
              ))}

              {onSwitchToVerifiedDemo && (
                <button
                  type="button"
                  onClick={onSwitchToVerifiedDemo}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Switch to Demo
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. PENDING UNDER ADMIN REVIEW */}
      {isPending && (
        <div className="bg-gradient-to-r from-slate-900/95 via-indigo-950/90 to-slate-900/95 border-b border-indigo-500/30 px-4 py-2.5 text-slate-200 shadow-lg">
          <div className="max-w-[1680px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  ⏳ Stage 2/3: KYC Under Verification
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-xs text-slate-300">
                  <strong className="text-white">{currentApplication.firmOrName}</strong>{" "}
                  ({currentApplication.zone})
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                  Practice Mode Active • SLA &lt;30m
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px] hidden md:inline">
                Papers: {currentApplication.documents.filter((d) => d.status === "VERIFIED").length}/
                {currentApplication.documents.length} Verified
              </span>

              {onSwitchToVerifiedDemo && (
                <button
                  type="button"
                  onClick={onSwitchToVerifiedDemo}
                  className="px-3 py-1 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-black transition cursor-pointer flex items-center gap-1"
                >
                  <span>Switch to Live Demo Hub</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. APPROVED CELEBRATION BANNER */}
      {isApproved && (
        <div className="bg-gradient-to-r from-emerald-950/90 via-emerald-900/80 to-emerald-950/90 border-b border-emerald-500/40 px-4 py-2 text-emerald-100 shadow-md">
          <div className="max-w-[1680px] mx-auto flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                ✓ KYC 100% VERIFIED & COMPLIANT —{" "}
                <strong className="text-white">{currentApplication.firmOrName}</strong> is LIVE in Lucknow!
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
              AI Score: {currentApplication.aiAuthenticityScore}% • Penny-Drop Matched
            </span>
          </div>
        </div>
      )}

      {/* 4. COMPLIANCE PAUSED ALERT */}
      {isPaused && (
        <div className="bg-gradient-to-r from-rose-950/95 via-rose-900/90 to-rose-950/95 border-b border-rose-500/50 px-4 py-3 text-rose-100 shadow-2xl">
          <div className="max-w-[1680px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-400 animate-bounce" />
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-rose-300">
                  🚨 FLEET DISPATCH SUSPENDED — COMPLIANCE AUTO-EXPIRY KILL-SWITCH ACTIVATED
                </p>
                <p className="text-xs text-rose-200/90">
                  Mandatory vehicle insurance or PUC has lapsed. Dispatch duty locked until valid papers are uploaded.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  toast.success("Renewed policy uploaded! Verifying RTO database…");
                  setTimeout(() => {
                    handleTriggerReupload(currentApplication.documents[0]);
                  }, 800);
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs transition shadow-lg shadow-rose-500/20 cursor-pointer"
              >
                Upload Renewed Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
