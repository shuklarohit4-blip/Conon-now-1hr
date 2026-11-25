import React from "react";
import {
  ShoppingCart,
  Printer,
  Share2,
  PhoneCall,
  Check,
  Truck,
  ArrowRight,
} from "lucide-react";
import type { StageBOQSummary } from "@/lib/builderKitEngine";

interface StageStickyActionBarProps {
  activeStage: StageBOQSummary;
  selectedCount: number;
  selectedTotal: number;
  onAddToCart: () => void;
  isAddingToCart: boolean;
  onPrintBOQ: () => void;
  onShareWhatsApp: () => void;
  onRequestQuote: () => void;
}

export function StageStickyActionBar({
  activeStage,
  selectedCount,
  selectedTotal,
  onAddToCart,
  isAddingToCart,
  onPrintBOQ,
  onShareWhatsApp,
  onRequestQuote,
}: StageStickyActionBarProps) {
  const vCounts = activeStage.vehicleCounts;

  return (
    <div className="sticky bottom-4 z-40 bg-slate-900/95 backdrop-blur-md text-white rounded-3xl p-4 shadow-2xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 animate-in slide-in-from-bottom duration-200">
      {/* Left: Total & Vehicle Split */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Stage {activeStage.stageId} Selected ({selectedCount} items)
          </span>
          <div className="text-xl sm:text-2xl font-black text-white leading-tight">
            ₹{Math.round(selectedTotal).toLocaleString("en-IN")}
            <span className="text-xs font-semibold text-emerald-400 ml-1.5">Incl. GST</span>
          </div>
        </div>

        {/* Vehicle Fleet Split Badges */}
        <div className="flex items-center gap-2 flex-wrap border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-4">
          {vCounts["2W_BIKE"] > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-200 border border-blue-700/50">
              ⚡ {vCounts["2W_BIKE"]} via 60-Min Bike
            </span>
          )}
          {vCounts["3W_ELECTRIC_LOADER"] > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-200 border border-emerald-700/50">
              🔋 {vCounts["3W_ELECTRIC_LOADER"]} via E-Loader
            </span>
          )}
          {vCounts["4W_PICKUP"] > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-200 border border-amber-700/50">
              🛻 {vCounts["4W_PICKUP"]} via Pickup
            </span>
          )}
          {vCounts["HEAVY_TRUCK"] > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-200 border border-purple-700/50">
              🚜 {vCounts["HEAVY_TRUCK"]} via Trolley
            </span>
          )}
        </div>
      </div>

      {/* Right: Actions (1-Click Add to Cart, Print PDF, Share, Request Quote) */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* WhatsApp Share Button */}
        <button
          type="button"
          onClick={onShareWhatsApp}
          className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition active:scale-95"
          title="Share BOQ on WhatsApp"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* Print / PDF Button */}
        <button
          type="button"
          onClick={onPrintBOQ}
          className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition active:scale-95"
          title="Print or Save A4 BOQ PDF"
        >
          <Printer className="w-4 h-4" />
        </button>

        {/* Request Civil Engineer Consultation / Bulk Quote */}
        <button
          type="button"
          onClick={onRequestQuote}
          className="px-3.5 py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs transition active:scale-95 flex items-center gap-1.5 border border-amber-500/40"
        >
          <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Engineer Call</span>
        </button>

        {/* Primary 1-Click Add Selected Stage to Cart */}
        <button
          type="button"
          disabled={selectedCount === 0 || isAddingToCart}
          onClick={onAddToCart}
          className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-[#15803D] hover:bg-[#166534] disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition active:scale-95 shadow-lg shadow-green-950/40 flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>
            {isAddingToCart
              ? "Adding to Cart..."
              : `Add Stage ${activeStage.stageId} to Cart`}
          </span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
