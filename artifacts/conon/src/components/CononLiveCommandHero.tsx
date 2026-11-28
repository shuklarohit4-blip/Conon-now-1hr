import React, { useMemo, useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Search,
  FileText,
  Calculator,
  ShieldCheck,
  Zap,
  Building2,
  Wrench,
  Truck,
  MapPin,
  ArrowRight,
  CloudRain,
  Sun,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useSafeCononMasterSync } from "@/context/CononMasterSyncContext";
import { useDeliveryLocation } from "@/context/LocationContext";
import {
  useLiveProducts,
  useLiveServices,
  useLiveRentals,
  useLiveRmcGrades,
} from "@/hooks/useCononLiveData";

export type HeroModeId = "materials" | "build_rmc" | "crew_fleet";
type ActionTabId = "quick_order" | "upload_parchi" | "site_calc";

const LUCKNOW_RADAR_ZONES = [
  { pincode: "226030", short: "Sushant Golf", area: "Sushant Golf City & Sultanpur Road", bikeEta: "22–28 min", lcvEta: "42–55 min" },
  { pincode: "226010", short: "Gomti Nagar", area: "Gomti Nagar & Gomti Nagar Extension", bikeEta: "24–30 min", lcvEta: "45–58 min" },
  { pincode: "226028", short: "Faizabad Rd", area: "Faizabad Road (Chinhat / Kamta / BBD)", bikeEta: "26–32 min", lcvEta: "48–60 min" },
  { pincode: "226002", short: "Sultanpur Rd", area: "Sultanpur Road (Arjunganj / Shaheed Path)", bikeEta: "20–26 min", lcvEta: "38–48 min" },
];

const HOT_CHIPS = [
  { label: "UltraTech PPC", href: "/categories?q=UltraTech" },
  { label: "Tata Tiscon", href: "/categories?q=Tiscon" },
  { label: "M25 RMC", href: "/rmc" },
  { label: "Plumber ₹249", href: "/services?trade=plumber" },
  { label: "JCB 3DX", href: "/rentals?machine=jcb-3dx" },
];

export function CononLiveCommandHero({
  onSelectCategory,
}: {
  onSelectCategory?: (dbCategory: string) => void;
}) {
  const [, setLocation] = useLocation();
  const masterSync = useSafeCononMasterSync();
  const { location: deliveryLoc, confirmLocation } = useDeliveryLocation();

  const liveProducts = useLiveProducts();
  const liveServices = useLiveServices();
  const liveRentals = useLiveRentals();
  const liveRmc = useLiveRmcGrades();

  const heroCfg = masterSync?.state.globalControls?.liveHero;
  const rainMode = Boolean(masterSync?.state.globalControls?.rainMode);
  const vipDiversion = Boolean(masterSync?.state.globalControls?.trafficPolicy?.vipDiversionActive);

  const [heroMode, setHeroMode] = useState<HeroModeId>(heroCfg?.defaultMode || "materials");
  const [actionTab, setActionTab] = useState<ActionTabId>("quick_order");
  const [quickQuery, setQuickQuery] = useState("");
  const [calcSqft, setCalcSqft] = useState(1250);
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    if (heroCfg?.defaultMode && !userInteracted) {
      setHeroMode(heroCfg.defaultMode);
    }
  }, [heroCfg?.defaultMode, userInteracted]);

  const activeZone =
    LUCKNOW_RADAR_ZONES.find((z) => z.pincode === deliveryLoc.pincode) || LUCKNOW_RADAR_ZONES[0];

  const searchHits = useMemo(() => {
    const q = quickQuery.trim().toLowerCase();
    if (!q) return [];
    return liveProducts
      .filter((p) =>
        `${p.name || ""} ${p.title || ""} ${p.categoryName || ""} ${p.categorySlug || ""} ${p.brand || ""}`
          .toLowerCase()
          .includes(q)
      )
      .slice(0, 5);
  }, [quickQuery, liveProducts]);

  // Live Mandi & Fleet Pulse values
  const m25Grade = liveRmc.find((g) => g.gradeCode === "M25") || liveRmc[0];
  const jcbRental = liveRentals.find((r) => r.id.includes("jcb")) || liveRentals[0];
  const tileService = liveServices.find((s) => s.slug.includes("tile")) || liveServices[0];

  // Instant Site Calc numbers
  const estCementBags = Math.max(40, Math.round(calcSqft * 0.42));
  const estRmcM3 = Number((calcSqft * 0.0145).toFixed(1));
  const estTurnkeyLakhs = ((calcSqft * 1190) / 100000).toFixed(1);

  const campaignPill = heroCfg?.campaignPill || "CONON INFRABUILT • 7+ Yrs • 150+ Projects";

  const modeCopy = {
    materials: {
      accent: "Construction ON.",
      rest: heroCfg?.headlineOverride || "Site Materials Delivered in 60 Minutes.",
      sub: "Wholesale Lucknow mandi rates • Verified brands • POD under ₹10,000 • 100% Escrow safe.",
    },
    build_rmc: {
      accent: "Plot to Possession.",
      rest: "RMC Plant Direct & Fixed-Rate Ghar Construction.",
      sub: "IS 456 M20–M50 RMC with 90-Min Freshness Clock • Turnkey from ₹1,190/sq.ft by Conon Infrabuilt.",
    },
    crew_fleet: {
      accent: "Site Crew & Heavy Fleet.",
      rest: "18 Verified Trades & 20 Machines on Demand.",
      sub: "Tool-Kit Verified Karigar (₹249+ visit) • JCB, Ajax & Cranes with Digital HMR Anti-Fraud Lock.",
    },
  }[heroMode];

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 pb-2">
      <div
        className="relative rounded-3xl overflow-hidden border border-emerald-900/40 shadow-xl text-white min-h-[340px] lg:min-h-[380px]"
        style={{
          background:
            "radial-gradient(circle at 18% 18%, rgba(16, 185, 129, 0.20), transparent 45%), linear-gradient(135deg, #062B22 0%, #0A3D31 52%, #0F172A 100%)",
        }}
      >
        {/* Lightweight CSS Blueprint Grid */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Optional Admin-Uploaded Site Backdrop Photo */}
        {heroCfg?.backdropImageUrl && (
          <img
            src={heroCfg.backdropImageUrl}
            alt="CONON Lucknow Site"
            className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-15 pointer-events-none mix-blend-luminosity"
          />
        )}

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 sm:p-6 lg:p-7 items-stretch">
          {/* LEFT STAGE (7 Cols) — Brand Ignition + Morphing Headline + 3-Tab Action Box */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            {/* 1. Brand Ignition Top Strip */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-[10px] font-black tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                CON•ON LIVE
              </span>
              <span className="text-[11px] font-bold text-emerald-100/80">
                Lucknow 60-Min Construction Grid • 4 Launch Zones Active
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-[10px] font-black">
                {campaignPill}
              </span>
            </div>

            {/* 2. Morphing Headline */}
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-black leading-[1.15] tracking-tight">
                <span className="bg-gradient-to-r from-emerald-300 via-amber-200 to-amber-400 bg-clip-text text-transparent">
                  {modeCopy.accent}
                </span>{" "}
                <span className="text-white">{modeCopy.rest}</span>
              </h1>
              <p className="text-xs sm:text-[13px] text-emerald-100/85 max-w-2xl font-medium">
                {modeCopy.sub}
              </p>
            </div>

            {/* 3. World-First "3-Tab Instant Site Action Box" */}
            <div className="rounded-2xl bg-white/95 backdrop-blur-md text-slate-900 p-3 shadow-lg border border-white/40 space-y-2.5">
              <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
                {(
                  [
                    { id: "quick_order", label: "⚡ Quick Order", icon: Search },
                    { id: "upload_parchi", label: "📄 Upload Parchi", icon: FileText },
                    { id: "site_calc", label: "📐 Instant Site Calc", icon: Calculator },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setActionTab(t.id);
                      setUserInteracted(true);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition cursor-pointer ${
                      actionTab === t.id
                        ? "bg-[#062B22] text-amber-300 shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {actionTab === "quick_order" && (
                <div className="space-y-2 relative">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (quickQuery.trim()) {
                        setLocation(`/categories?q=${encodeURIComponent(quickQuery.trim())}`);
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <div className="flex-1 flex items-center gap-2 px-3 h-10 rounded-xl bg-slate-100 border border-slate-200 focus-within:bg-white focus-within:border-emerald-700">
                      <Search className="w-4 h-4 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={quickQuery}
                        onFocus={() => setUserInteracted(true)}
                        onChange={(e) => setQuickQuery(e.target.value)}
                        placeholder="Search UltraTech PPC, Tata Tiscon, Astral CPVC, M25 RMC, JCB..."
                        className="w-full bg-transparent text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="h-10 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black cursor-pointer shrink-0"
                    >
                      Find
                    </button>
                  </form>

                  {searchHits.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 max-h-40 overflow-y-auto">
                      {searchHits.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setLocation(`/categories?q=${encodeURIComponent(item.name)}`)}
                          className="w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-emerald-50 cursor-pointer"
                        >
                          <span className="font-bold text-slate-800 truncate">{item.name}</span>
                          <span className="font-mono font-black text-emerald-700 shrink-0 ml-2">
                            ₹{Number(item.price).toLocaleString("en-IN")}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    {HOT_CHIPS.map((chip) => (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => setLocation(chip.href)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 text-[10.5px] font-bold text-slate-700 cursor-pointer transition"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {actionTab === "upload_parchi" && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="space-y-0.5 text-left">
                    <div className="text-xs font-black text-emerald-950">
                      Mistri / Contractor Parchi Photo → Instant Cart BOQ
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      Upload handwritten material list &amp; get wholesale Lucknow depot quote in 60 seconds.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocation("/parcha")}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Open Digital Parcha</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {actionTab === "site_calc" && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Plot / Slab Area:</span>
                    <span className="font-mono font-black text-emerald-800">
                      {calcSqft.toLocaleString("en-IN")} sq.ft
                    </span>
                  </div>
                  <input
                    type="range"
                    min={500}
                    max={3000}
                    step={50}
                    value={calcSqft}
                    onChange={(e) => setCalcSqft(Number(e.target.value))}
                    className="w-full accent-emerald-700 cursor-pointer"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] bg-slate-100 rounded-xl px-3 py-2">
                    <span className="font-black text-slate-900">
                      ~{estCementBags} Bags Cement • {estRmcM3} m³ M25 RMC • Turnkey from ₹{estTurnkeyLakhs}L
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setLocation(`/rmc?volume=${estRmcM3}`)}
                        className="px-2.5 py-1 rounded-lg bg-blue-700 text-white font-black cursor-pointer"
                      >
                        Book RMC →
                      </button>
                      <button
                        type="button"
                        onClick={() => setLocation(`/build?sqft=${calcSqft}`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 text-amber-300 font-black cursor-pointer"
                      >
                        Full Build Estimate →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Compact Verified Trust Strip */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-bold text-emerald-100/90">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" /> POD &lt; ₹10,000
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Escrow Protected
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-amber-300" /> GST Invoice Ready
              </span>
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-emerald-300" /> Zero-Challan Fleet
              </span>
            </div>
          </div>

          {/* RIGHT STAGE (5 Cols) — Live Lucknow 60-Min Dispatch Radar */}
          <div className="lg:col-span-5 rounded-2xl bg-slate-950/60 backdrop-blur-md border border-emerald-400/25 p-4 flex flex-col justify-between space-y-3 relative overflow-hidden">
            {/* Subtle CSS Radar Rings */}
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full border border-emerald-400/15 pointer-events-none" />
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full border border-emerald-400/25 pointer-events-none animate-ping opacity-20" />

            {/* 1. Interactive 4-Zone Lucknow Pin Code Selector */}
            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Live Lucknow 60-Min Radar
                </span>
                <span className="font-mono text-amber-300 font-black">{activeZone.pincode}</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {LUCKNOW_RADAR_ZONES.map((z) => {
                  const selected = activeZone.pincode === z.pincode;
                  return (
                    <button
                      key={z.pincode}
                      type="button"
                      onClick={() =>
                        confirmLocation({
                          pincode: z.pincode,
                          area: z.area,
                          city: "Lucknow",
                          fullLabel: `Lucknow — ${z.area}`,
                        })
                      }
                      className={`px-2.5 py-1.5 rounded-xl text-left border text-[11px] transition cursor-pointer ${
                        selected
                          ? "bg-emerald-500/25 border-emerald-400 text-white font-black"
                          : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      <span className="font-mono text-amber-300 mr-1">{z.pincode}</span>
                      <span>{z.short}</span>
                    </button>
                  );
                })}
              </div>

              {/* Fleet ETA Breakdown */}
              <div className="grid grid-cols-2 gap-1.5 text-[10.5px] pt-1">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-slate-300 font-bold">Bike Express (≤30 kg)</div>
                  <div className="font-mono font-black text-emerald-300">{activeZone.bikeEta}</div>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-slate-300 font-bold">3-Wheeler (≤700 kg)</div>
                  <div className="font-mono font-black text-emerald-300">38–48 min</div>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-slate-300 font-bold">Chhota Hathi (≤1.5T)</div>
                  <div className="font-mono font-black text-amber-300">{activeZone.lcvEta}</div>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-slate-300 font-bold">RMC Transit Mixer</div>
                  <div className="font-mono font-black text-sky-300">90-Min Fresh Clock</div>
                </div>
              </div>
            </div>

            {/* 2. Live Mandi & Fleet Pulse Ticker */}
            <div className="grid grid-cols-3 gap-1.5 text-[10px] relative z-10">
              <button
                type="button"
                onClick={() => setLocation("/rmc")}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-left cursor-pointer"
              >
                <div className="text-slate-300 font-bold truncate">M25 RMC</div>
                <div className="font-mono font-black text-amber-300">
                  ₹{(m25Grade?.ratePerM3 || 5065).toLocaleString("en-IN")}/m³
                </div>
              </button>
              <button
                type="button"
                onClick={() => setLocation("/rentals?machine=jcb-3dx")}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-left cursor-pointer"
              >
                <div className="text-slate-300 font-bold truncate">JCB 3DX</div>
                <div className="font-mono font-black text-emerald-300">
                  ₹{(jcbRental?.wetRates?.hour || 950).toLocaleString("en-IN")}/hr
                </div>
              </button>
              <button
                type="button"
                onClick={() => setLocation("/services?trade=tile-mason")}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-left cursor-pointer"
              >
                <div className="text-slate-300 font-bold truncate">Tile Mason</div>
                <div className="font-mono font-black text-white">
                  ₹{tileService?.shiftRate ? "24/sqft" : "24/sqft"}
                </div>
              </button>
            </div>

            {/* 3. Live Operations Shield Status Bar */}
            <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10.5px] font-bold relative z-10">
              <span className={`flex items-center gap-1 ${rainMode ? "text-cyan-300" : "text-emerald-300"}`}>
                {rainMode ? <CloudRain className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                {rainMode ? "Monsoon Tirpal Shield: ACTIVE" : "Clear Dispatch • 60-Min SLA"}
              </span>
              <span className={`flex items-center gap-1 ${vipDiversion ? "text-amber-300" : "text-slate-300"}`}>
                {vipDiversion ? <AlertTriangle className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                {vipDiversion ? "VIP Diversion: Smart Alt-Route" : "Zero-Challan Guard: ON"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM MODE SWITCHER BAR (3 Clean Interactive Pill Switches) */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
        {(
          [
            { id: "materials", label: "⚡ 60-Min Express Materials" },
            { id: "build_rmc", label: "🏗️ Turnkey Build & RMC Direct" },
            { id: "crew_fleet", label: "🛠️ Verified Karigar & Machines" },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              setHeroMode(m.id);
              setUserInteracted(true);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black border transition cursor-pointer ${
              heroMode === m.id
                ? "bg-[#062B22] text-amber-300 border-[#062B22] shadow-sm"
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </section>
  );
}
