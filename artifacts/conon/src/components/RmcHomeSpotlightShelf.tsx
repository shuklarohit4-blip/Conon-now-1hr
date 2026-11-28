import React from "react";
import { Link } from "wouter";
import { ArrowRight, Calculator, Sparkles } from "lucide-react";
import { CononProductMedia } from "@/components/CononProductMedia";
import { useLiveRmcGrades } from "@/hooks/useCononLiveData";

const SPOTLIGHT_IDS = [
  "rmc-m20-rcc",
  "rmc-m25-rcc",
  "rmc-m30-rcc",
  "rmc-waterproof-hydro",
  "rmc-dry-mix-bag-40kg",
];

export function RmcHomeSpotlightShelf() {
  const grades = useLiveRmcGrades();
  const featured = SPOTLIGHT_IDS.map((id) => grades.find((g) => g.id === id)).filter(
    (x): x is NonNullable<typeof x> => Boolean(x)
  );

  return (
    <section className="w-full px-3.5 sm:px-6 lg:px-8 my-4">
      <div className="bg-gradient-to-r from-[#0f172a] via-[#172554] to-[#1e3a8a] rounded-3xl p-4 sm:p-6 text-white shadow-lg border border-blue-900/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              PLANT DIRECT • 90-MIN FRESH (IS 456)
            </span>
            <h3 className="text-base sm:text-xl font-black tracking-tight mt-1">
              RMC Plant Direct — Lucknow Live Concrete Rates (Per m³)
            </h3>
          </div>
          <Link
            href="/category/rmc-ready-mix-concrete"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition shrink-0"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Open Volume Calculator &amp; All 18 RMC Mixes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {featured.map((g) => (
            <Link
              key={g.id}
              href="/category/rmc-ready-mix-concrete"
              className="bg-white text-slate-900 rounded-2xl overflow-hidden border border-white/20 hover:shadow-xl transition flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-28 bg-slate-100">
                  <CononProductMedia
                    mediaType="product"
                    itemId={g.id}
                    slug={g.slug}
                    src={g.imageUrl}
                    title={g.nameEn}
                    brand={`RMC ${g.gradeCode}`}
                    categorySlug="rmc-plant-direct"
                    unit={g.category === "DRY_MIX_BAGS" ? "40kg Bag" : "m³"}
                    variant="cover"
                  />
                  <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-slate-900/80 text-amber-300">
                    {g.gradeCode}
                  </span>
                </div>
                <div className="p-2.5">
                  <div className="text-xs font-black line-clamp-1">{g.nameEn}</div>
                  <div className="text-[10px] text-slate-500 line-clamp-1">{g.nameHi}</div>
                </div>
              </div>
              <div className="px-2.5 pb-2.5 flex items-center justify-between">
                <span className="text-sm font-black font-mono text-blue-700">
                  ₹{g.ratePerM3.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  /{g.category === "DRY_MIX_BAGS" ? "bag" : "m³"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
