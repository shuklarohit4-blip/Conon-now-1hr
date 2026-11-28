import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Ban,
  RotateCcw,
  ClipboardCheck,
  History,
  ChevronDown,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { useSafeCononMasterSync } from "@/context/CononMasterSyncContext";
import type { PartnerKycApplication } from "@/context/KycContext";
import { evaluatePartnerCompliance } from "@/utils/complianceEvaluator";

const SUSPEND_REASONS = [
  "Quality / Torn Material Complaint",
  "Short Weight / CFT Dispute",
  "RMC Late / Failed Slump",
  "Repeated SLA Cancellation",
  "Customer Behaviour Issue",
];

export function AdminComplianceKillSwitchPanel({
  applications,
}: {
  applications: PartnerKycApplication[];
}) {
  const masterSync = useSafeCononMasterSync();
  const [selectedId, setSelectedId] = useState<string>("");
  const [suspendReason, setSuspendReason] = useState<string>(SUSPEND_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>("");
  const [blacklistPin, setBlacklistPin] = useState<string>("");
  const [blacklistReason, setBlacklistReason] = useState<string>("");
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);

  // Physical Inspection state
  const [inspectorName, setInspectorName] = useState("Rohiit Shukla / CONON Field Audit");
  const [inspectedAt, setInspectedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [inspectionNotes, setInspectionNotes] = useState("");
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    physicalPremisesVerified: true,
    equipmentOrScaleChecked: true,
    operatorOrLabVerified: true,
  });

  // Security Audit Log drawer
  const [auditOpen, setAuditOpen] = useState(false);

  if (!masterSync) return null;

  const partnerStatuses = masterSync.state.compliance?.partnerStatuses || {};
  const auditLog = masterSync.state.compliance?.auditLog || [];
  const targetApp = applications.find((a) => a.id === selectedId) || applications[0];

  const handleSuspend = async () => {
    if (!targetApp) return;
    const reason = customReason.trim() || suspendReason;
    await masterSync.suspendPartnerLive({
      partnerId: targetApp.id,
      partnerName: targetApp.firmOrName,
      partnerType: targetApp.applicantType,
      reason,
    });
    toast.warning(`Suspended "${targetApp.firmOrName}" live across all panels (<500ms)!`);
  };

  const handleReinstate = async () => {
    if (!targetApp) return;
    await masterSync.reinstatePartnerLive({
      partnerId: targetApp.id,
      partnerName: targetApp.firmOrName,
      partnerType: targetApp.applicantType,
    });
    toast.success(`Reinstated "${targetApp.firmOrName}" live!`);
  };

  const handleBlacklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetApp) return;
    if (blacklistPin.trim() !== "2026" && blacklistPin.trim() !== "1407") {
      toast.error("Invalid Founder Security PIN (required: 2026)");
      return;
    }
    const gstDoc = targetApp.documents.find((d) => d.docType === "GSTIN_CERTIFICATE");
    const panDoc = targetApp.documents.find((d) => d.docType === "PAN_CARD");
    await masterSync.blacklistPartnerLive({
      partnerId: targetApp.id,
      partnerName: targetApp.firmOrName,
      partnerType: targetApp.applicantType,
      phone: targetApp.phone,
      pan: panDoc?.extractedNumber,
      gstin: gstDoc?.extractedNumber,
      vehicleNo: targetApp.vehiclePlate,
      reason: blacklistReason.trim() || "Permanently blacklisted under CONON Safety Policy",
    });
    setShowBlacklistModal(false);
    setBlacklistPin("");
    setBlacklistReason("");
    toast.error(`PERMANENTLY BLACKLISTED "${targetApp.firmOrName}" (Mobile/PAN/GSTIN/Vehicle locked)`);
  };

  const handleAwardStamp = async () => {
    if (!targetApp) return;
    await masterSync.awardPhysicalInspectionStamp({
      partnerId: targetApp.id,
      partnerName: targetApp.firmOrName,
      partnerType: targetApp.applicantType,
      inspectorName: inspectorName.trim() || "Rohiit Shukla / CONON Field Audit",
      inspectedAt,
      notes: inspectionNotes.trim(),
      checklist,
    });
    toast.success(`Awarded "CONON Physically Inspected ✓" Stamp to ${targetApp.firmOrName}`);
  };

  const overlay = targetApp ? partnerStatuses[targetApp.id] : undefined;
  const evalComp = targetApp
    ? evaluatePartnerCompliance({
        dlExpiry: targetApp.dlExpiry,
        insuranceExpiry: targetApp.insuranceExpiry,
        pucExpiry: targetApp.pucExpiry,
        expiryDates: overlay?.expiryDates,
        documents: targetApp.documents,
      })
    : null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Security, Compliance Shield &amp; Physical Field Inspection
          </h3>
          <p className="text-[11px] text-slate-400">
            Zero-refresh live kill-switch, auto-expiry lock evaluator, permanent blacklist &amp; field audit stamp
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAuditOpen((p) => !p)}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <History className="w-3.5 h-3.5 text-amber-400" />
          <span>Security Audit Log ({auditLog.length})</span>
          <ChevronDown className={`w-3.5 h-3.5 transition ${auditOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      {applications.length === 0 ? (
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 text-center">
          No registered partners yet (Zero-Dummy Clean Slate). Partners appear here once they submit KYC.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Partner Selector + Kill-Switch */}
          <div className="lg:col-span-6 p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <select
                value={targetApp?.id || ""}
                onChange={(e) => setSelectedId(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white"
              >
                {applications.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.firmOrName} ({a.applicantType} • {a.phone})
                  </option>
                ))}
              </select>
              {evalComp && (
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 ${
                    evalComp.status === "AUTO_PAUSED_EXPIRED"
                      ? "bg-rose-500/20 text-rose-400"
                      : evalComp.status === "EXPIRING_SOON"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-emerald-500/20 text-emerald-400"
                  }`}
                >
                  {evalComp.status}
                </span>
              )}
            </div>

            {overlay?.physicallyInspected && (
              <div className="px-3 py-1.5 rounded-xl bg-amber-400/15 border border-amber-400/40 text-amber-300 text-xs font-black flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                CONON Physically Inspected ✓ ({overlay.inspectionMeta?.inspectedAt})
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              {SUSPEND_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSuspendReason(r)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                    suspendReason === r
                      ? "bg-amber-400 text-slate-950"
                      : "bg-slate-900 text-slate-300 border border-slate-800"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Optional custom suspension note..."
              className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
            />

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSuspend}
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black cursor-pointer"
              >
                Suspend Live Now
              </button>
              <button
                type="button"
                onClick={() => setShowBlacklistModal(true)}
                className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1 cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
                Permanent Blacklist (PIN)
              </button>
              {(overlay?.status === "SUSPENDED" || overlay?.status === "BLACKLISTED") && (
                <button
                  type="button"
                  onClick={handleReinstate}
                  className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reinstate Live
                </button>
              )}
            </div>
          </div>

          {/* Physical Field Inspection Panel */}
          <div className="lg:col-span-6 p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs">
            <div className="font-black text-amber-400 flex items-center gap-1.5">
              <ClipboardCheck className="w-4 h-4" />
              Physical Field Inspection Stamp
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                placeholder="Inspector Name"
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
              />
              <input
                type="date"
                value={inspectedAt}
                onChange={(e) => setInspectedAt(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
              />
            </div>
            <div className="flex flex-wrap gap-3 text-[11px]">
              {[
                ["physicalPremisesVerified", "Physical Shop/Yard Verified"],
                ["equipmentOrScaleChecked", "Scale / Chassis / Batcher Checked"],
                ["operatorOrLabVerified", "Loader / Lab / Operator Verified"],
              ].map(([k, lbl]) => (
                <label key={k} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(checklist[k])}
                    onChange={(e) => setChecklist((p) => ({ ...p, [k]: e.target.checked }))}
                  />
                  <span>{lbl}</span>
                </label>
              ))}
            </div>
            <input
              type="text"
              value={inspectionNotes}
              onChange={(e) => setInspectionNotes(e.target.value)}
              placeholder="Lucknow field visit notes..."
              className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
            />
            <button
              type="button"
              onClick={handleAwardStamp}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              Award Physical Inspection Stamp ✓
            </button>
          </div>
        </div>
      )}

      {/* Expandable Security Audit Log */}
      {auditOpen && (
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 max-h-48 overflow-y-auto text-[11px]">
          {auditLog.length === 0 ? (
            <div className="text-slate-500 text-center py-3">No compliance actions recorded yet.</div>
          ) : (
            auditLog.map((row) => (
              <div key={row.id} className="flex flex-wrap items-center justify-between gap-2 py-1 border-b border-slate-800/60">
                <span className="font-mono text-slate-400">{new Date(row.createdAt).toLocaleString("en-IN")}</span>
                <span className="font-black text-amber-400">{row.action}</span>
                <span className="font-bold">{row.partnerName || row.partnerId}</span>
                <span className="text-slate-300">{row.reason}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* PIN-Confirmed Blacklist Modal */}
      {showBlacklistModal && targetApp && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form onSubmit={handleBlacklist} className="w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-2xl p-5 space-y-3">
            <h4 className="text-sm font-black text-rose-400 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Confirm Permanent Blacklist — {targetApp.firmOrName}
            </h4>
            <p className="text-xs text-slate-300">
              Permanently bans Mobile ({targetApp.phone}), PAN, GSTIN &amp; Vehicle ({targetApp.vehiclePlate || "N/A"}).
            </p>
            <input
              type="password"
              required
              value={blacklistPin}
              onChange={(e) => setBlacklistPin(e.target.value)}
              placeholder="Enter Founder PIN (2026)"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white"
            />
            <textarea
              required
              value={blacklistReason}
              onChange={(e) => setBlacklistReason(e.target.value)}
              placeholder="Written reason for permanent blacklist..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowBlacklistModal(false)} className="px-3 py-1.5 text-xs font-bold cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="px-4 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-black cursor-pointer">
                Confirm Blacklist
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
