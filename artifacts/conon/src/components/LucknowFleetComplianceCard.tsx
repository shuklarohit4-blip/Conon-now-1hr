import React from "react";
import { Truck, Moon, Zap, AlertTriangle, ShieldCheck } from "lucide-react";
import type { DispatchComplianceResult } from "@/utils/lucknowTrafficPolicy";

export type DispatchSlotChoice = "STANDARD" | "NIGHT_WINDOW" | "DAYTIME_SPLIT";

interface LucknowFleetComplianceCardProps {
  compliance: DispatchComplianceResult;
  dispatchMode: DispatchSlotChoice;
  onSelectDispatchMode: (mode: DispatchSlotChoice) => void;
}

export function LucknowFleetComplianceCard({
  compliance,
  dispatchMode,
  onSelectDispatchMode,
}: LucknowFleetComplianceCardProps) {
  const needsChoice = compliance.isNoEntryWindow;

  return (
    <div className="space-y-2.5">
      {/* CONON Legal Vehicle & Route Badge */}
      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-black text-slate-900">
            <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="truncate">{compliance.badgeText}</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 shrink-0 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Zero-Challan
          </span>
        </div>

        <p className="text-[11px] text-slate-600 leading-snug">
          {compliance.zoneIntel.routeAdvisoryEn}
        </p>

        {(compliance.requiresTarpaulinCover || compliance.requiresLongLoadFolding || compliance.isPeakHourCaution) && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {compliance.requiresTarpaulinCover && (
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold">
                Tarpaulin (Tirpal) Cover Locked
              </span>
            )}
            {compliance.requiresLongLoadFolding && (
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold">
                Folded / Red-Flag Lashing Required
              </span>
            )}
            {compliance.isPeakHourCaution && (
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold">
                Peak-Hour Service Lane Route
              </span>
            )}
          </div>
        )}
      </div>

      {/* Admin VIP / Shaheed Path Diversion Alert */}
      {compliance.vipDiversionActive && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-2 text-[11px] text-amber-950">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <div className="font-black text-amber-900">
              VIP / Shaheed Path Diversion Active
            </div>
            <p className="text-amber-800 mt-0.5">
              {compliance.vipDiversionNote ||
                "Shaheed Path main carriageway restricted — routing via Kisan Path / Service Lane (+15–20 min ETA buffer)."}
            </p>
          </div>
        </div>
      )}

      {/* Daytime No-Entry Choice Card (06:00–23:00 for Heavy Trucks / RMC / Heavy Machines) */}
      {needsChoice && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-2.5 text-xs">
          <div className="flex items-start gap-2 text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-black text-amber-900">
                Lucknow Daytime Heavy No-Entry Active ({compliance.nightWindowLabel} Legal)
              </div>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Heavy vehicles &gt; 1,700 kg are banned inside city corridors during daytime (₹20,000 fine). Choose a 100% compliant dispatch option:
              </p>
            </div>
          </div>

          <div className={`grid gap-2 ${compliance.canSplitDaytime ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
            <button
              type="button"
              onClick={() => onSelectDispatchMode("NIGHT_WINDOW")}
              className={`p-2.5 rounded-xl border-2 text-left transition cursor-pointer ${
                dispatchMode === "NIGHT_WINDOW"
                  ? "border-blue-700 bg-blue-50 text-blue-950"
                  : "border-amber-200 bg-white text-slate-800 hover:border-blue-400"
              }`}
            >
              <div className="font-black flex items-center gap-1.5 text-[11px]">
                <Moon className="w-3.5 h-3.5 text-blue-700" />
                <span>Book Legal Night Window ({compliance.nightWindowLabel})</span>
              </div>
              <div className="text-[10px] text-slate-600 mt-0.5">
                Zero ₹20,000 No-Entry risk • Full-load direct trip
              </div>
            </button>

            {compliance.canSplitDaytime && compliance.daytimeSplitVehicle && (
              <button
                type="button"
                onClick={() => onSelectDispatchMode("DAYTIME_SPLIT")}
                className={`p-2.5 rounded-xl border-2 text-left transition cursor-pointer ${
                  dispatchMode === "DAYTIME_SPLIT"
                    ? "border-emerald-700 bg-emerald-50 text-emerald-950"
                    : "border-amber-200 bg-white text-slate-800 hover:border-emerald-400"
                }`}
              >
                <div className="font-black flex items-center gap-1.5 text-[11px]">
                  <Zap className="w-3.5 h-3.5 text-emerald-700" />
                  <span>
                    Daytime Split ({compliance.daytimeSplitTripCount}× {compliance.daytimeSplitVehicle.label.split(" ")[0]})
                  </span>
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5">
                  60-min daytime delivery • Legal ≤ {compliance.daytimeSplitVehicle.maxPayloadKg} kg/trip
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
