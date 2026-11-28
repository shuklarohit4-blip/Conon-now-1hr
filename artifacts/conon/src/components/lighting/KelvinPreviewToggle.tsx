import React from "react";
import type { CctKelvin } from "@/data/lightingCatalog";

export type CctOrColor = CctKelvin;

export const KELVIN_META: Record<
  CctKelvin,
  {
    short: string;
    name: string;
    dotHex: string;
    ringHex: string;
    glowCss: string;
  }
> = {
  "3000K": {
    short: "3000K",
    name: "Warm Gold",
    dotHex: "#F59E0B",
    ringHex: "#FBBF24",
    glowCss: "radial-gradient(circle, rgba(251,191,36,0.48) 0%, rgba(251,191,36,0.06) 72%, transparent 100%)",
  },
  "4000K": {
    short: "4000K",
    name: "Natural Day",
    dotHex: "#FDE047",
    ringHex: "#EAB308",
    glowCss: "radial-gradient(circle, rgba(254,240,138,0.52) 0%, rgba(254,240,138,0.08) 72%, transparent 100%)",
  },
  "6500K": {
    short: "6500K",
    name: "Cool White",
    dotHex: "#93C5FD",
    ringHex: "#3B82F6",
    glowCss: "radial-gradient(circle, rgba(147,197,253,0.48) 0%, rgba(147,197,253,0.06) 72%, transparent 100%)",
  },
};

export function KelvinPreviewToggle({
  supportedCcts,
  selectedCct,
  is3in1Cct,
  onSelectCct,
  compact = false,
}: {
  supportedCcts: CctKelvin[];
  selectedCct: CctKelvin;
  is3in1Cct?: boolean;
  onSelectCct: (cct: CctKelvin) => void;
  compact?: boolean;
}) {
  if (!supportedCcts || supportedCcts.length === 0) return null;

  return (
    <div
      className={`flex items-center justify-between gap-1.5 ${compact ? "mt-1.5" : "mt-2"}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-1.5">
        {supportedCcts.map((cct) => {
          const meta = KELVIN_META[cct];
          const isActive = selectedCct === cct;
          return (
            <button
              key={cct}
              type="button"
              onClick={() => onSelectCct(cct)}
              title={`Preview ${meta.short} ${meta.name}`}
              aria-label={`Select ${meta.short} ${meta.name}`}
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[10px] font-bold transition cursor-pointer ${
                isActive
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-2xs"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400"
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                style={{ backgroundColor: meta.dotHex }}
              />
              <span>{meta.short}</span>
            </button>
          );
        })}
      </div>

      {is3in1Cct && (
        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-100 via-yellow-100 to-blue-100 text-slate-800 border border-amber-200 shrink-0">
          3-in-1
        </span>
      )}
    </div>
  );
}
