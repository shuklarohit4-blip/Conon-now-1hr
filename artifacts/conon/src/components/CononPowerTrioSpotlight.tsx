import React, { useState } from "react";
import { useLocation } from "wouter";
import {
  Building2,
  Wrench,
  Tractor,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Gauge,
} from "lucide-react";
import { useSafeCononMasterSync } from "@/context/CononMasterSyncContext";

type BuilderStageId = "foundation" | "slab" | "brickwork" | "finishing";
type RentalRateMode = "HOURLY" | "SHIFT" | "MONTHLY";

const BUILDER_STAGES: Record<
  BuilderStageId,
  { label: string; materials: string; savings: string }
> = {
  foundation: {
    label: "Foundation",
    materials: "OPC 43/53 Cement + TMT 12–16mm + River Morang + Gitti 20mm",
    savings: "Save ~₹14,200 (11%)",
  },
  slab: {
    label: "Chhat / Slab",
    materials: "Cement + TMT Sariya + Binding Wire + Cover Blocks + Waterproofing",
    savings: "Save ~₹18,500 (12%)",
  },
  brickwork: {
    label: "Brick & Plaster",
    materials: "Red Bricks / AAC Blocks + PPC Cement + Plaster Sand + Wall Putty",
    savings: "Save ~₹9,800 (10%)",
  },
  finishing: {
    label: "Finishing",
    materials: "Tiles + Adhesive + CPVC Plumbing + Wires/MCB + Emulsion Paints",
    savings: "Save ~₹21,000 (12%)",
  },
};

const QUICK_TRADES = [
  { id: "plumber", label: "Plumber ₹249" },
  { id: "electrician", label: "Electrician ₹249" },
  { id: "tile-mason", label: "Tile Mason ₹24/sqft" },
  { id: "pvc-panel", label: "PVC Panel" },
  { id: "carpenter", label: "Carpenter" },
  { id: "raj-mistri", label: "Raj Mistri" },
];

const TOP_MACHINES = [
  {
    id: "jcb-3dx",
    name: "JCB 3DX",
    hourly: "₹950/hr",
    shift: "₹6,800/shift",
    monthly: "₹1.35L/mo",
  },
  {
    id: "ajax-fiori",
    name: "Ajax Fiori Mixer",
    hourly: "₹1,450/hr",
    shift: "₹9,800/shift",
    monthly: "₹1.95L/mo",
  },
  {
    id: "hydra-crane-14t",
    name: "Hydra Crane 14T",
    hourly: "₹1,250/hr",
    shift: "₹8,200/shift",
    monthly: "₹1.65L/mo",
  },
  {
    id: "silent-dg-62",
    name: "Silent DG 25–125kVA",
    hourly: "₹650/hr",
    shift: "₹3,800/shift",
    monthly: "₹68,000/mo",
  },
];

export function CononPowerTrioSpotlight() {
  const [, setLocation] = useLocation();
  const masterSync = useSafeCononMasterSync();
  const spotlightCfg = masterSync?.state.globalControls?.powerTrioSpotlight;

  const [selectedStage, setSelectedStage] = useState<BuilderStageId>("slab");
  const [rateMode, setRateMode] = useState<RentalRateMode>("SHIFT");

  if (spotlightCfg && spotlightCfg.enabled === false) {
    return null;
  }

  const builderBadge = spotlightCfg?.builderBadge || "PRO BUILDERS & GHAR CONSTRUCTION";
  const servicesBadge = spotlightCfg?.servicesBadge || "60-MIN VISIT • ESCROW SAFE";
  const rentalsBadge = spotlightCfg?.rentalsBadge || "DIGITAL HMR BILLING • ZERO FRAUD";

  const activeStage = BUILDER_STAGES[selectedStage];

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 pb-4">
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-3.5 pb-2 md:grid md:grid-cols-3 md:overflow-visible scrollbar-none">
        {/* CARD 1 — BUILDER ZONE */}
        <div className="min-w-[86vw] sm:min-w-[340px] md:min-w-0 snap-start rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden">
          <div>
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 text-white">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Sparkles className="w-3 h-3" />
                {builderBadge}
              </span>
              <h3 className="text-base font-black mt-1.5 leading-snug flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Complete Stage-Wise Builder Kits</span>
              </h3>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Save up to 12% on bulk bundles • GST ITC Ready • 1-Click Site Supply
              </p>
            </div>

            <div className="p-4 space-y-3">
              {/* 4 Clickable Stage Pills */}
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(BUILDER_STAGES) as BuilderStageId[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedStage(key)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black border transition cursor-pointer ${
                      selectedStage === key
                        ? "bg-slate-900 text-amber-300 border-slate-900"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    {BUILDER_STAGES[key].label}
                  </button>
                ))}
              </div>

              {/* Mini Preview Box */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-black text-slate-900">{activeStage.label} Bundle</span>
                  <span className="font-black text-emerald-700">{activeStage.savings}</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-snug font-medium">
                  {activeStage.materials}
                </p>
              </div>
            </div>
          </div>

          <div className="px-4 pb-4">
            <button
              type="button"
              onClick={() => setLocation(`/kits?stage=${selectedStage}`)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>Explore Builder Section</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CARD 2 — SKILLED SERVICES */}
        <div className="min-w-[86vw] sm:min-w-[340px] md:min-w-0 snap-start rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden">
          <div>
            <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 px-4 py-3 text-white">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-white/15 text-emerald-100 border border-white/25">
                <ShieldCheck className="w-3 h-3" />
                {servicesBadge}
              </span>
              <h3 className="text-base font-black mt-1.5 leading-snug flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-200 shrink-0" />
                <span>Verified Karigar &amp; Mistri on Demand</span>
              </h3>
              <p className="text-[11px] text-emerald-100 mt-0.5">
                Tool-Kit Verified • Shift, Per Sq.Ft Contract &amp; ₹249 Quick Visit
              </p>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TRADES.map((tr) => (
                  <button
                    key={tr.id}
                    type="button"
                    onClick={() => setLocation(`/services?trade=${tr.id}`)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition cursor-pointer"
                  >
                    {tr.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setLocation("/services")}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-black bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
                >
                  +12 More Trades
                </button>
              </div>

              <div className="flex items-center gap-3 text-[10px] font-black text-emerald-800 bg-emerald-50/60 border border-emerald-200/70 rounded-xl px-3 py-2">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> GPS Selfie Haziri
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Start/End OTP Escrow
                </span>
              </div>
            </div>
          </div>

          <div className="px-4 pb-4">
            <button
              type="button"
              onClick={() => setLocation("/services")}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>Book Verified Karigar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CARD 3 — MACHINES ON RENT */}
        <div className="min-w-[86vw] sm:min-w-[340px] md:min-w-0 snap-start rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden">
          <div>
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 text-slate-950">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-slate-950/15 text-slate-950 border border-slate-950/20">
                <Gauge className="w-3 h-3" />
                {rentalsBadge}
              </span>
              <h3 className="text-base font-black mt-1.5 leading-snug flex items-center gap-2">
                <Tractor className="w-4 h-4 text-slate-950 shrink-0" />
                <span>JCB, Ajax, Crane &amp; DG on Rent</span>
              </h3>
              <p className="text-[11px] text-slate-900/90 font-semibold mt-0.5">
                Wet/Dry Rates • Breakdown Pause Shield • Lucknow No-Entry Smart Slots
              </p>
            </div>

            <div className="p-4 space-y-2.5">
              {/* Rate Switcher */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 text-[10px] font-black">
                {(
                  [
                    { id: "HOURLY", label: "Hourly" },
                    { id: "SHIFT", label: "8-Hr Shift" },
                    { id: "MONTHLY", label: "Monthly" },
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setRateMode(mode.id)}
                    className={`flex-1 py-1 rounded-lg transition cursor-pointer ${
                      rateMode === mode.id
                        ? "bg-slate-900 text-amber-300 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {/* 4 Machine Chips */}
              <div className="grid grid-cols-2 gap-1.5">
                {TOP_MACHINES.map((m) => {
                  const price =
                    rateMode === "HOURLY" ? m.hourly : rateMode === "SHIFT" ? m.shift : m.monthly;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setLocation(`/rentals?machine=${m.id}`)}
                      className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-left transition cursor-pointer"
                    >
                      <div className="text-[11px] font-black text-slate-900 truncate">{m.name}</div>
                      <div className="text-[10px] font-mono font-bold text-amber-700">{price}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="px-4 pb-4">
            <button
              type="button"
              onClick={() => setLocation("/rentals")}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>Rent Site Machines</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
