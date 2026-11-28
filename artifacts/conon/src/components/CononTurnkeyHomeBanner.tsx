import React, { useState } from "react";
import { useLocation } from "wouter";
import { Crown, ShieldCheck, ArrowRight, Building2, CheckCircle2 } from "lucide-react";
import { useSafeCononMasterSync } from "@/context/CononMasterSyncContext";

const PLOT_PREVIEWS = [
  { label: "1,000 sq.ft", sqft: 1000 },
  { label: "1,250 sq.ft", sqft: 1250 },
  { label: "1,500 sq.ft", sqft: 1500 },
  { label: "2,152 sq.ft LDA", sqft: 2152 },
];

const formatLakhs = (n: number) => `₹${(n / 100000).toFixed(2)} L`;

export function CononTurnkeyHomeBanner() {
  const [, setLocation] = useLocation();
  const masterSync = useSafeCononMasterSync();
  const [selectedSqft, setSelectedSqft] = useState(1250);

  const customRates = masterSync?.state.globalControls?.turnkeyBuild?.rates;
  const greyRate = customRates?.grey ?? 1190;
  const goldRate = customRates?.gold ?? 2100;

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 pb-4">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-950 via-[#10254d] to-slate-900 text-white p-4 sm:p-5 shadow-md overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Headline + Credentials */}
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-wider">
              <Crown className="w-3 h-3" />
              <span>Apna Ghar Banwana Hai? — Lucknow Turnkey Studio</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black leading-snug">
              Build Your Dream Home in Lucknow — Fixed Rate, Zero Delay, 100% Branded Materials
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-blue-100 font-semibold">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                150+ Projects Delivered
              </span>
              <span>•</span>
              <span>7+ Yrs Civil Engineering</span>
              <span>•</span>
              <span>CONON INFRABUILT HQ: Skyline Plaza 3, Sushant Golf City</span>
            </div>
          </div>

          {/* Right: Interactive Mini Plot-Rate Preview */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-3.5 space-y-2.5 lg:min-w-[390px]">
            <div className="flex flex-wrap gap-1.5">
              {PLOT_PREVIEWS.map((p) => (
                <button
                  key={p.sqft}
                  type="button"
                  onClick={() => setSelectedSqft(p.sqft)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition cursor-pointer ${
                    selectedSqft === p.sqft
                      ? "bg-amber-400 text-slate-950"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 text-xs pt-0.5">
              <div>
                <div className="text-[10px] text-blue-200 font-bold">
                  Est. Turnkey ({selectedSqft.toLocaleString("en-IN")} sq.ft • G Floor)
                </div>
                <div className="font-mono font-black text-sm text-amber-300">
                  {formatLakhs(selectedSqft * greyRate)} (Grey) – {formatLakhs(selectedSqft * goldRate)} (Gold)
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLocation(`/build?sqft=${selectedSqft}`)}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 shrink-0 cursor-pointer transition"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Open Build Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
