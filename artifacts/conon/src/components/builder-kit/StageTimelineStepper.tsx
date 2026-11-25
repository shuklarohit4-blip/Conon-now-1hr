import React from "react";
import {
  Pickaxe,
  Zap,
  Layers,
  Building2,
  Paintbrush,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import type { StageBOQSummary } from "@/lib/builderKitEngine";

interface StageTimelineStepperProps {
  stages: StageBOQSummary[];
  activeStageId: number;
  onSelectStage: (stageId: number) => void;
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Pickaxe,
  Zap,
  Layers,
  Building2,
  Paintbrush,
  CheckCircle2,
};

export function StageTimelineStepper({
  stages,
  activeStageId,
  onSelectStage,
}: StageTimelineStepperProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-2 sm:p-3 overflow-hidden">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {stages.map((st, idx) => {
          const isActive = st.stageId === activeStageId;
          const IconComponent = ICONS[st.iconName] || Pickaxe;

          return (
            <React.Fragment key={st.stageId}>
              <button
                type="button"
                onClick={() => onSelectStage(st.stageId)}
                className={`flex-1 min-w-[140px] sm:min-w-0 p-2.5 sm:p-3 rounded-2xl transition text-left relative group ${
                  isActive
                    ? "bg-[#1E293B] text-white shadow-md"
                    : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                {/* Active Indicator Top Line */}
                {isActive && (
                  <div className="absolute top-0 left-4 right-4 h-1 bg-[#FDB813] rounded-b-full" />
                )}

                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition ${
                      isActive
                        ? "bg-[#FDB813] text-slate-950 shadow-sm"
                        : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider block leading-none ${
                        isActive ? "text-[#FDB813]" : "text-slate-400"
                      }`}
                    >
                      Stage {st.stageId}
                    </span>
                    <span className="text-xs font-bold truncate block mt-0.5">
                      {st.shortName.split(".")[1]?.trim() || st.stageName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-0.5">
                  <span
                    className={`font-black ${
                      isActive ? "text-emerald-400" : "text-emerald-700"
                    }`}
                  >
                    ₹{Math.round(st.subtotal).toLocaleString("en-IN")}
                  </span>
                  <span
                    className={`text-[10px] font-semibold ${
                      isActive ? "text-slate-300" : "text-slate-400"
                    }`}
                  >
                    {st.items.length} items
                  </span>
                </div>
              </button>

              {idx < stages.length - 1 && (
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 hidden lg:block" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
