import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Calendar,
  X,
  FileCheck2,
  Truck,
  CloudRain,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useKyc } from "@/context/KycContext";
import { toast } from "sonner";

interface ComplianceHealthShieldDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  driverName?: string;
  vehiclePlate?: string;
}

export function ComplianceHealthShieldDrawer({
  isOpen,
  onClose,
  driverName = "Ravi Kumar",
  vehiclePlate = "UP 32 EL 8901",
}: ComplianceHealthShieldDrawerProps) {
  const { simulateComplianceExpiry, currentApplication, reuploadDocument } = useKyc();
  const [isSimulating, setIsSimulating] = useState(false);

  if (!isOpen) return null;

  const isPaused = currentApplication?.status === "COMPLIANCE_PAUSED";

  const handleSimulateExpired = async (type: "INSURANCE" | "PUC" | "DL") => {
    setIsSimulating(true);
    await simulateComplianceExpiry(currentApplication?.applicantId || "DRV-APP-4401", type);
    setIsSimulating(false);
    toast.error(`🚨 Auto-Expiry Kill-Switch Activated: ${type} Expired!`);
  };

  const handleRestoreCompliance = async () => {
    setIsSimulating(true);
    if (currentApplication?.documents[0]) {
      await reuploadDocument(
        currentApplication.documents[0].docId,
        "/images/kyc/sample-insurance-renewed.webp",
        "NIC-COMM-2027-NEW",
        driverName
      );
    }
    setIsSimulating(false);
    toast.success("✓ Policy Renewed! Fleet Dispatch re-enabled.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0F172A] border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isPaused
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}
            >
              {isPaused ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Fleet Compliance Health Shield</span>
                <span
                  className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                    isPaused
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  }`}
                >
                  {isPaused ? "SUSPENDED" : "100% COMPLIANT"}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {driverName} • {vehiclePlate} • RTO & Insurance Sentinel
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Body */}
        <div className="py-4 space-y-3">
          {/* Card 1: Goods Insurance */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Commercial Goods Insurance</p>
                <p className="text-[10px] text-slate-400">Policy: NIC-COMM-9918231</p>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  isPaused
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                }`}
              >
                {isPaused ? "EXPIRED" : "Valid • 214d left"}
              </span>
              <p className="text-[9px] text-slate-500 mt-0.5">Exp: 20 Nov 2026</p>
            </div>
          </div>

          {/* Card 2: Driving License */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center shrink-0">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Commercial Driving License (DL)</p>
                <p className="text-[10px] text-slate-400">UP32 20180049120 • Transport</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Valid • 1,980d left
              </span>
              <p className="text-[9px] text-slate-500 mt-0.5">Exp: 14 Aug 2031</p>
            </div>
          </div>

          {/* Card 3: Vehicle RC */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-400/10 text-indigo-400 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Vehicle Fitness & RC</p>
                <p className="text-[10px] text-slate-400">Tata Ace Gold • UP 32 EL 7710</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active & Roadworthy
              </span>
              <p className="text-[9px] text-slate-500 mt-0.5">Vahan RTO Lucknow</p>
            </div>
          </div>

          {/* Card 4: Waterproof Tarpaulin */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-400/10 text-cyan-400 flex items-center justify-center shrink-0">
                <CloudRain className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Monsoon Rain-Shield Tirpal</p>
                <p className="text-[10px] text-slate-400">Heavy Heavy-Duty Waterproof Tarpaulin</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                ✓ Inspected
              </span>
              <p className="text-[9px] text-slate-500 mt-0.5">Dhalai Cement Shield</p>
            </div>
          </div>
        </div>

        {/* Dev Test Sandbox Triggers */}
        <div className="pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              Auto-Expiry Kill-Switch Test Sentinel
            </span>
            <span className="text-[9px] text-slate-500">Live Simulation</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleSimulateExpired("INSURANCE")}
              disabled={isSimulating}
              className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/40 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Simulate Expired Insurance</span>
            </button>

            <button
              type="button"
              onClick={handleRestoreCompliance}
              disabled={isSimulating}
              className="px-3 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/40 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Restore Compliance Policy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
