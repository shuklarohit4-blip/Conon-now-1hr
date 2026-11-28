import React, { useState } from "react";
import { ShieldAlert, ShieldCheck, AlertTriangle, Upload, PhoneCall } from "lucide-react";
import { toast } from "sonner";
import { useSafeCononMasterSync } from "@/context/CononMasterSyncContext";
import { evaluatePartnerCompliance } from "@/utils/complianceEvaluator";
import { resolveApiUrl } from "@/lib/apiBase";

interface PartnerComplianceGuardProps {
  partnerId?: string;
  partnerName?: string;
  partnerType: "VENDOR" | "DRIVER";
  lang?: "en" | "hi";
  expirySource?: {
    dlExpiry?: string;
    insuranceExpiry?: string;
    pucExpiry?: string;
    fitnessExpiry?: string;
    documents?: Array<{ docType?: string; docName?: string; extractedExpiry?: string }>;
  };
  children: React.ReactNode;
}

export function PartnerComplianceBadge({
  partnerId,
}: {
  partnerId?: string;
}) {
  const masterSync = useSafeCononMasterSync();
  if (!partnerId || !masterSync) return null;
  const overlay = masterSync.state.compliance?.partnerStatuses?.[partnerId];
  if (!overlay?.physicallyInspected) return null;

  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-500 border border-amber-400/40"
      title={`Inspected by ${overlay.inspectionMeta?.inspectorName || "CONON Field Audit"} on ${overlay.inspectionMeta?.inspectedAt || ""}`}
    >
      <ShieldCheck className="w-3 h-3" />
      CONON Physically Inspected ✓
    </span>
  );
}

export function PartnerComplianceGuard({
  partnerId,
  partnerName,
  partnerType,
  lang = "en",
  expirySource,
  children,
}: PartnerComplianceGuardProps) {
  const masterSync = useSafeCononMasterSync();
  const overlay = partnerId
    ? masterSync?.state.compliance?.partnerStatuses?.[partnerId]
    : undefined;

  const evalResult = evaluatePartnerCompliance({
    ...(expirySource || {}),
    expiryDates: overlay?.expiryDates,
  });

  const [renewDocType, setRenewDocType] = useState(
    evalResult.expiredDocs[0]?.key || "insuranceExpiry"
  );
  const [renewDate, setRenewDate] = useState(
    new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10)
  );
  const [submitting, setSubmitting] = useState(false);

  // 1. Live Kill-Switch: SUSPENDED or BLACKLISTED
  if (overlay?.status === "SUSPENDED" || overlay?.status === "BLACKLISTED") {
    const isBlk = overlay.status === "BLACKLISTED";
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-lg w-full rounded-3xl border border-rose-500/40 bg-rose-950/30 p-6 text-center space-y-4 shadow-2xl">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-black text-white">
            {isBlk
              ? lang === "hi"
                ? "CONON सुरक्षा नीति के तहत खाता स्थायी रूप से प्रतिबंधित"
                : "Account Permanently Restricted by CONON HQ"
              : lang === "hi"
              ? "CONON HQ द्वारा खाता अस्थायी रूप से निलंबित"
              : "Account Temporarily Suspended by CONON HQ"}
          </h2>
          <p className="text-xs font-bold text-rose-200 bg-rose-500/15 border border-rose-500/30 rounded-xl p-3">
            Reason: {overlay.suspensionReason || "Compliance review in progress"}
          </p>
          <p className="text-xs text-slate-300">
            {lang === "hi"
              ? "नए ऑर्डर, बजर और पेआउट अस्थायी रूप से रोके गए हैं।"
              : "Incoming orders, live buzzers, and payouts are paused until CONON HQ clearance."}
          </p>
          <button
            type="button"
            onClick={() =>
              toast.info("Explanation logged for CONON HQ Compliance Desk (+91-522-CONON-HQ).")
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-black cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" />
            {lang === "hi" ? "CONON सपोर्ट से संपर्क करें" : "Contact CONON Support / Submit Explanation"}
          </button>
        </div>
      </div>
    );
  }

  // 2. Auto-Expiry Compliance Lock: AUTO_PAUSED_EXPIRED
  if (evalResult.status === "AUTO_PAUSED_EXPIRED" && partnerId) {
    const handleUploadRenewal = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      try {
        await masterSync?.submitPartnerRenewalExpiry({
          partnerId,
          partnerName,
          partnerType,
          docType: renewDocType,
          newExpiryDate: renewDate,
        });
        await fetch(resolveApiUrl("/kyc/partner/upload-renewal"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            partnerId,
            partnerType,
            docType: renewDocType,
            newExpiryDate: renewDate,
          }),
        }).catch(() => {});
        toast.success("Renewed paper submitted to Admin Partner KYC!");
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <form
          onSubmit={handleUploadRenewal}
          className="max-w-lg w-full rounded-3xl border border-rose-500/40 bg-rose-950/30 p-6 space-y-4 shadow-2xl text-white"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-rose-400 shrink-0" />
            <div>
              <h2 className="text-lg font-black">
                {lang === "hi"
                  ? "दस्तावेज़ समाप्त — लाइव डिस्पैच रोका गया"
                  : "Document Expired — Live Dispatch Paused"}
              </h2>
              <p className="text-xs text-rose-200">
                Expired: {evalResult.expiredDocs.map((d) => `${d.label} (${d.expiryDate})`).join(", ")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-bold block mb-1">Select Renewed Document</label>
              <select
                value={renewDocType}
                onChange={(e) => setRenewDocType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
              >
                {evalResult.expiredDocs.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold block mb-1">New Expiry Date *</label>
              <input
                type="date"
                required
                value={renewDate}
                onChange={(e) => setRenewDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black flex items-center justify-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            {submitting
              ? "Submitting..."
              : lang === "hi"
              ? "नवीनीकृत पेपर अपलोड करें"
              : "Upload Renewed Paper & New Expiry Date"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <>
      {evalResult.status === "EXPIRING_SOON" && (
        <div className="max-w-[1680px] mx-auto px-4 mt-2">
          <div className="px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-500 text-xs font-bold flex items-center justify-between gap-2">
            <span>
              ⚠️ {lang === "hi" ? "दस्तावेज़ जल्द समाप्त होने वाले हैं:" : "Document Expiring Soon:"}{" "}
              {evalResult.expiringDocs.map((d) => `${d.label} (${d.daysRemaining}d)`).join(", ")}
            </span>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
