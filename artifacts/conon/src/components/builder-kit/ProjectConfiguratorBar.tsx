import React from "react";
import {
  Layers,
  Sparkles,
  Shield,
  MapPin,
  Building,
  Home,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import type { ProjectInputs, QualityTier, WallType } from "@/lib/builderKitEngine";
import { LUCKNOW_ZONES } from "@/lib/builderKitEngine";

interface ProjectConfiguratorBarProps {
  inputs: ProjectInputs;
  onChange: (updated: Partial<ProjectInputs>) => void;
  costPerSqFt: number;
  grandTotal: number;
}

export function ProjectConfiguratorBar({
  inputs,
  onChange,
  costPerSqFt,
  grandTotal,
}: ProjectConfiguratorBarProps) {
  const handleFloorsChange = (f: number) => {
    const builtUp = inputs.plotAreaSqFt * f;
    const autoRooms = {
      bathrooms: Math.max(1, f * 1 + 1),
      kitchens: Math.max(1, f >= 3 ? 2 : 1),
      doorsCount: Math.max(4, f * 4 + 2),
    };
    onChange({
      floors: f,
      builtUpSqFt: builtUp,
      ...autoRooms,
    });
  };

  const handlePlotAreaChange = (sqFt: number) => {
    const clamped = Math.max(300, Math.min(15000, sqFt));
    const builtUp = clamped * inputs.floors;
    onChange({
      plotAreaSqFt: clamped,
      builtUpSqFt: builtUp,
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 space-y-5">
      {/* Top Bar: Brand Title + Quality Tier Selector + Live Budget Badges */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
              ⚡ 6-Stage Civil BOQ Engine
            </span>
            <span className="text-xs text-slate-500 font-medium">Lucknow IS-Code Compliant</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
            Home Construction Material Planner
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time material takeoff, brand quality selection & 60-min staged deliveries
          </p>
        </div>

        {/* Live Material Budget Pill */}
        <div className="flex items-center gap-3 self-start lg:self-auto">
          <div className="px-4 py-2 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-left">
            <span className="text-[10px] uppercase font-bold text-amber-800 block">
              Estimated Rate
            </span>
            <span className="text-base sm:text-lg font-black text-amber-950">
              ₹{costPerSqFt.toLocaleString("en-IN")}
              <span className="text-xs font-semibold text-amber-800">/sq ft</span>
            </span>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-left">
            <span className="text-[10px] uppercase font-bold text-emerald-800 block">
              Material Budget (All 6 Stages)
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-950">
              ₹{Math.round(grandTotal).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Input 1: Plot Area Slider & Input */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-700">Plot Footprint Area</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={300}
                max={15000}
                value={inputs.plotAreaSqFt}
                onChange={(e) => handlePlotAreaChange(Number(e.target.value) || 300)}
                className="w-16 px-1.5 py-0.5 bg-white border border-slate-300 rounded font-bold text-xs text-right text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
              <span className="text-[10px] font-bold text-slate-500">sq ft</span>
            </div>
          </div>
          <input
            type="range"
            min={400}
            max={5000}
            step={50}
            value={inputs.plotAreaSqFt}
            onChange={(e) => handlePlotAreaChange(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>400 sq ft</span>
            <span>1000 (Standard)</span>
            <span>5000+</span>
          </div>
        </div>

        {/* Input 2: Floors Selector (G to G+3) */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-700">Floors (G to G+3)</label>
            <span className="text-[10px] font-bold text-emerald-700">
              {inputs.builtUpSqFt.toLocaleString("en-IN")} sq ft built-up
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 pt-0.5">
            {[
              { f: 1, label: "G" },
              { f: 2, label: "G+1" },
              { f: 3, label: "G+2" },
              { f: 4, label: "G+3" },
            ].map(({ f, label }) => (
              <button
                key={f}
                type="button"
                onClick={() => handleFloorsChange(f)}
                className={`py-1.5 rounded-xl font-bold text-xs transition ${
                  inputs.floors === f
                    ? "bg-[#FDB813] text-slate-950 shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Input 3: Masonry Type Toggle (Red Bricks vs AAC Blocks) */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
          <label className="font-bold text-slate-700 block">Masonry Wall Material</label>
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => onChange({ wallType: "RED_BRICK" })}
              className={`py-1.5 px-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                inputs.wallType === "RED_BRICK"
                  ? "bg-[#991B1B] text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>🧱 Red Bricks</span>
            </button>

            <button
              type="button"
              onClick={() => onChange({ wallType: "AAC_BLOCK" })}
              className={`py-1.5 px-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                inputs.wallType === "AAC_BLOCK"
                  ? "bg-[#1E293B] text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>⬜ AAC Blocks</span>
            </button>
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            {inputs.wallType === "RED_BRICK"
              ? "Lucknow Avval kiln bricks (8.5 pcs/sq ft)"
              : "Lightweight thermal blocks (Magicrete/Birla)"}
          </span>
        </div>

        {/* Input 4: Lucknow Delivery Site Zone */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
          <label className="font-bold text-slate-700 block flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Lucknow Site Zone</span>
          </label>
          <select
            value={inputs.lucknowZone}
            onChange={(e) => onChange({ lucknowZone: e.target.value })}
            className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
          >
            {LUCKNOW_ZONES.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-emerald-700 font-semibold block">
            ✓ 60-min dealer fulfillment active
          </span>
        </div>
      </div>

      {/* Row 2: Brand Quality Tier Switcher + Secondary Steppers */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-1">
        {/* 3 Quality Tiers Switcher */}
        <div className="flex-1 bg-slate-100/90 p-1 rounded-2xl flex items-center gap-1 border border-slate-200/80">
          {[
            {
              id: "STANDARD" as QualityTier,
              label: "Standard Quality",
              sub: "ACC • Rathi • Anchor • Orient Bell",
            },
            {
              id: "PREMIUM" as QualityTier,
              label: "Premium Quality (Recommended)",
              sub: "UltraTech • Tata Tiscon • Havells • Kajaria",
            },
            {
              id: "LUXURY" as QualityTier,
              label: "Architectural Luxury",
              sub: "WeatherPlus • Astral • Legrand • Italian Slab",
            },
          ].map((tier) => {
            const isActive = inputs.qualityTier === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => onChange({ qualityTier: tier.id })}
                className={`flex-1 py-2 px-3 rounded-xl transition text-center relative ${
                  isActive
                    ? "bg-white text-slate-900 shadow-md font-black"
                    : "text-slate-600 hover:text-slate-900 font-medium"
                }`}
              >
                <div className="text-xs">{tier.label}</div>
                <div className="text-[9.5px] text-slate-400 truncate hidden sm:block">
                  {tier.sub}
                </div>
              </button>
            );
          })}
        </div>

        {/* Secondary Counts: Bathrooms, Kitchens, Doors */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Bathrooms Stepper */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <span className="text-[11px] font-bold text-slate-600">Baths:</span>
            <button
              type="button"
              onClick={() => onChange({ bathrooms: Math.max(1, inputs.bathrooms - 1) })}
              className="w-5 h-5 rounded bg-white border border-slate-300 font-bold text-xs flex items-center justify-center hover:bg-slate-100"
            >
              -
            </button>
            <span className="w-4 text-center font-bold text-xs text-slate-900">
              {inputs.bathrooms}
            </span>
            <button
              type="button"
              onClick={() => onChange({ bathrooms: inputs.bathrooms + 1 })}
              className="w-5 h-5 rounded bg-white border border-slate-300 font-bold text-xs flex items-center justify-center hover:bg-slate-100"
            >
              +
            </button>
          </div>

          {/* Kitchens Stepper */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <span className="text-[11px] font-bold text-slate-600">Kitchens:</span>
            <button
              type="button"
              onClick={() => onChange({ kitchens: Math.max(1, inputs.kitchens - 1) })}
              className="w-5 h-5 rounded bg-white border border-slate-300 font-bold text-xs flex items-center justify-center hover:bg-slate-100"
            >
              -
            </button>
            <span className="w-4 text-center font-bold text-xs text-slate-900">
              {inputs.kitchens}
            </span>
            <button
              type="button"
              onClick={() => onChange({ kitchens: inputs.kitchens + 1 })}
              className="w-5 h-5 rounded bg-white border border-slate-300 font-bold text-xs flex items-center justify-center hover:bg-slate-100"
            >
              +
            </button>
          </div>

          {/* Doors Stepper */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <span className="text-[11px] font-bold text-slate-600">Doors:</span>
            <button
              type="button"
              onClick={() => onChange({ doorsCount: Math.max(2, inputs.doorsCount - 1) })}
              className="w-5 h-5 rounded bg-white border border-slate-300 font-bold text-xs flex items-center justify-center hover:bg-slate-100"
            >
              -
            </button>
            <span className="w-5 text-center font-bold text-xs text-slate-900">
              {inputs.doorsCount}
            </span>
            <button
              type="button"
              onClick={() => onChange({ doorsCount: inputs.doorsCount + 1 })}
              className="w-5 h-5 rounded bg-white border border-slate-300 font-bold text-xs flex items-center justify-center hover:bg-slate-100"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
