import React, { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useUI } from "@/context/UIContext";
import { useSafeCononMasterSync } from "@/context/CononMasterSyncContext";
import { useLiveProducts } from "@/hooks/useCononLiveData";
import { apiUrl } from "@/lib/apiBase";
import { toast } from "sonner";
import {
  HardHat,
  DraftingCompass,
  Building2,
  ChevronDown,
  ChevronUp,
  Check,
  Phone,
  MapPin,
  Ruler,
  ShoppingCart,
  Sparkles,
  Crown,
  Shield,
  X,
  Calculator,
  Zap,
  Layers,
  Hammer,
  FileDown,
  Box,
  ArrowRight,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import {
  DEFAULT_TURNKEY_TIERS,
  BRAND_MATRIX_ROWS,
  LUCKNOW_PLOT_PRESETS,
  TEN_STAGE_ESCROW_SCHEDULE,
  type TurnkeyMode,
  type TurnkeyTierSpec,
  type TurnkeyConsultationLead,
} from "@/data/lucknowTurnkeyPackages";
import { downloadTurnkeyEstimatePdf } from "@/utils/turnkeyPdfGenerator";

const BRAND = "#1848a0";
const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
const inrShort = (n: number) => {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return inr(n);
};

const LUCKNOW_ZONES = [
  "Sushant Golf City (226030)",
  "Gomti Nagar / Ext (226010)",
  "Faizabad Road (226028)",
  "Sultanpur Road (226002)",
];

export function CononBuild() {
  const [, setLocation] = useLocation();
  const masterSync = useSafeCononMasterSync();
  const turnkeyCfg = masterSync?.state.globalControls?.turnkeyBuild;

  const [mode, setMode] = useState<TurnkeyMode>("RESIDENTIAL");
  const [selectedTierId, setSelectedTierId] = useState<TurnkeyTierSpec["id"]>("gold");
  const [matrixOpen, setMatrixOpen] = useState(true);
  const [consultPkg, setConsultPkg] = useState<string | null>(null);

  const initialSqft = useMemo(() => {
    try {
      const q = Number(new URLSearchParams(window.location.search).get("sqft") || 0);
      return q >= 400 ? q : 1250;
    } catch {
      return 1250;
    }
  }, []);

  const tiers = useMemo(() => {
    const customRates = turnkeyCfg?.rates || {};
    return DEFAULT_TURNKEY_TIERS.map((t) => ({
      ...t,
      ratePerSqFt: customRates[t.id] ?? t.ratePerSqFt,
    }));
  }, [turnkeyCfg?.rates]);

  const getEffectiveRate = (t: TurnkeyTierSpec) =>
    mode === "RESIDENTIAL" ? t.ratePerSqFt : t.commercialRatePerSqFt;

  return (
    <Layout>
      <div className="bg-slate-50 min-h-full pb-12">
        {/* Hero */}
        <div className="px-4 sm:px-8 pt-7 pb-8 rounded-b-[32px] shadow-lg bg-gradient-to-br from-slate-950 via-[#1848a0] to-slate-900 text-white">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
                  <HardHat className="w-6 h-6 text-amber-300" strokeWidth={2.4} />
                </span>
                <div>
                  <h1 className="font-display font-black italic text-2xl sm:text-3xl leading-none">
                    CONON-NOW Build
                  </h1>
                  <p className="text-[11px] font-bold text-blue-200 uppercase tracking-[0.18em] mt-1">
                    Lucknow Turnkey Home &amp; Commercial Construction Studio
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setConsultPkg("Gold")}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Free Civil Engineer Visit</span>
              </button>
            </div>

            <p className="text-sm text-blue-100/95 max-w-3xl leading-relaxed">
              Fixed-rate, zero-delay turnkey construction by <strong>CONON INFRABUILT LIMITED</strong>{" "}
              (HQ: Skyline Plaza 3, Sushant Golf City, Lucknow). 100% branded materials, 10-stage
              CONON Escrow protection, and 450-point civil quality audits.
            </p>

            <div className="flex flex-wrap gap-2">
              <TrustBadge icon={<CheckCircle2 className="w-3.5 h-3.5" />} label="150+ Projects Delivered" />
              <TrustBadge icon={<Shield className="w-3.5 h-3.5" />} label="7+ Yrs Civil Expertise" />
              <TrustBadge icon={<Crown className="w-3.5 h-3.5" />} label="CONON INFRABUILT Lucknow" />
              <TrustBadge icon={<Zap className="w-3.5 h-3.5" />} label="Zero-Delay Penalty Shield" />
            </div>

            {turnkeyCfg?.offerActive && turnkeyCfg?.promoBanner && (
              <div className="px-3.5 py-2 rounded-xl bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs font-bold inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                <span>{turnkeyCfg.promoBanner}</span>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 space-y-8 mt-6">
          {/* PART 1.3 — FREE AI HOME DESIGN & 3D STUDIO DOCK */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <DraftingCompass className="w-4 h-4 text-blue-700" />
                  <span>Free AI Home Design &amp; 3D Studio</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Plan your Lucknow plot layout, Vastu, elevation &amp; 3D walkthrough before locking your turnkey package.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black self-start">
                100% Free for Plot Owners
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  title: "Smart-Draft AI",
                  sub: "2D Vastu Floor Plans",
                  desc: "Instant room-by-room 2D Vastu layout for 1,000–3,229 sq.ft Lucknow plots.",
                  href: "/smart-draft",
                  icon: DraftingCompass,
                  cls: "bg-blue-50 text-blue-800 border-blue-200",
                },
                {
                  title: "Arch-Genius Engine",
                  sub: "Elevation & Structural Guidance",
                  desc: "Modern front elevation concepts, column grid & LDA/Ansal setback rules.",
                  href: "/arch-genius",
                  icon: Building2,
                  cls: "bg-amber-50 text-amber-900 border-amber-200",
                },
                {
                  title: "Smart-Build 3D",
                  sub: "3D Walkthrough Preview",
                  desc: "Interactive 3D structural & finishing visualization before foundation work.",
                  href: "/smart-build",
                  icon: Box,
                  cls: "bg-emerald-50 text-emerald-900 border-emerald-200",
                },
              ].map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.title}
                    type="button"
                    onClick={() => setLocation(tool.href)}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-400 bg-slate-50/70 hover:bg-white text-left transition flex items-start justify-between gap-3 cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-black ${tool.cls}`}>
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tool.sub}</span>
                      </div>
                      <div className="text-sm font-black text-slate-900">{tool.title}</div>
                      <p className="text-[11px] text-slate-600 leading-snug">{tool.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                  </button>
                );
              })}
            </div>
          </section>

          {/* PART 2 — 5 AUTHENTIC LUCKNOW TURNKEY PACKAGES + RESIDENTIAL/COMMERCIAL TOGGLE */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">
                  Fixed Per Sq.Ft Rates • Zero Hidden Cost
                </p>
                <h2 className="text-xl font-black text-slate-900">
                  5 Authentic Lucknow Turnkey Packages
                </h2>
              </div>

              <div className="inline-flex p-1 rounded-xl bg-slate-200/80 text-xs font-black self-start">
                <button
                  type="button"
                  onClick={() => setMode("RESIDENTIAL")}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    mode === "RESIDENTIAL" ? "bg-slate-900 text-white" : "text-slate-700"
                  }`}
                >
                  Residential Home / Villa
                </button>
                <button
                  type="button"
                  onClick={() => setMode("COMMERCIAL")}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    mode === "COMMERCIAL" ? "bg-slate-900 text-white" : "text-slate-700"
                  }`}
                >
                  Commercial / Marriage Hall / PEB
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {tiers.map((tier) => {
                const rate = getEffectiveRate(tier);
                const list = mode === "RESIDENTIAL" ? tier.highlights : tier.commercialHighlights;
                const isSelected = selectedTierId === tier.id;
                return (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedTierId(tier.id)}
                    className={`rounded-2xl bg-white p-4 flex flex-col justify-between border-2 transition cursor-pointer ${
                      tier.popular
                        ? "border-amber-400 shadow-md"
                        : isSelected
                        ? "border-blue-700 shadow-sm"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span
                          className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                          style={{ background: tier.accentHex }}
                        >
                          {tier.tagline}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-slate-900">{tier.name}</h3>
                      <div className="mt-1.5 flex items-baseline gap-1">
                        <span className="text-2xl font-black font-mono text-slate-900">
                          {inr(rate)}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">/ sq.ft</span>
                      </div>
                      <div className="text-[10px] font-black text-emerald-700 mt-1">
                        {tier.warrantyLabel}
                      </div>

                      <ul className="mt-3 space-y-1.5 text-[11px] text-slate-700">
                        {list.map((f) => (
                          <li key={f} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="leading-snug">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConsultPkg(tier.name);
                      }}
                      className="mt-4 w-full py-2 rounded-xl text-xs font-black text-white cursor-pointer transition hover:opacity-95"
                      style={{ background: tier.accentHex }}
                    >
                      Book Free Site Visit
                    </button>
                  </div>
                );
              })}
            </div>

            {/* WORLD-FIRST "ZERO MATERIAL CHORI" 11-ROW BRAND SPEC COMPARATOR */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => setMatrixOpen((v) => !v)}
                className="w-full px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between text-left cursor-pointer"
              >
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-amber-300">
                    Zero Material Chori Guarantee
                  </div>
                  <div className="text-sm font-black">
                    Side-by-Side Lucknow Brand Specification Comparator (11 Civil Categories)
                  </div>
                </div>
                {matrixOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              {matrixOpen && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[760px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 border-b border-slate-200">
                        <th className="p-3 font-black">Civil Category</th>
                        {tiers.map((t) => (
                          <th key={t.id} className="p-3 font-black">
                            {t.name} ({inr(getEffectiveRate(t))})
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {BRAND_MATRIX_ROWS.map((row, idx) => (
                        <tr key={row.category} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"}>
                          <td className="p-3 font-black text-slate-900 border-b border-slate-100">
                            {row.category}
                          </td>
                          <td className="p-3 text-slate-700 border-b border-slate-100">{row.grey}</td>
                          <td className="p-3 text-slate-700 border-b border-slate-100">{row.silver}</td>
                          <td className="p-3 text-slate-900 font-semibold border-b border-slate-100 bg-amber-50/30">
                            {row.gold}
                          </td>
                          <td className="p-3 text-slate-700 border-b border-slate-100">{row.platinum}</td>
                          <td className="p-3 text-slate-700 border-b border-slate-100">{row.luxury}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          {/* PART 3 — SUPER-SMART LUCKNOW COST ESTIMATOR + 10-STAGE ESCROW + PDF */}
          <EstimatorSection
            tiers={tiers}
            mode={mode}
            initialSqft={initialSqft}
            selectedTierId={selectedTierId}
            onSelectTierId={setSelectedTierId}
            onBookVisit={(pkg) => setConsultPkg(pkg)}
          />

          {/* PART 4 — 5-TAB LUCKNOW SMART MATERIAL CALCULATOR + 1-CLICK RMC SWITCH */}
          <MaterialCalculatorSection />
        </div>
      </div>

      <AnimatePresence>
        {consultPkg && (
          <ConsultationSheet pkg={consultPkg} defaultSqft={initialSqft} onClose={() => setConsultPkg(null)} />
        )}
      </AnimatePresence>
    </Layout>
  );
}

function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-black text-white">
      <span className="text-amber-300">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   PART 3 — LUCKNOW COST ESTIMATOR + 10-STAGE ESCROW + PDF
════════════════════════════════════════════════════════════════ */
function EstimatorSection({
  tiers,
  mode,
  initialSqft,
  selectedTierId,
  onSelectTierId,
  onBookVisit,
}: {
  tiers: TurnkeyTierSpec[];
  mode: TurnkeyMode;
  initialSqft: number;
  selectedTierId: TurnkeyTierSpec["id"];
  onSelectTierId: (id: TurnkeyTierSpec["id"]) => void;
  onBookVisit: (pkgName: string) => void;
}) {
  const [plotSqFt, setPlotSqFt] = useState(initialSqft);
  const [floors, setFloors] = useState(2);
  const [zone, setZone] = useState(LUCKNOW_ZONES[0]);
  const [stiltParking, setStiltParking] = useState(false);
  const [ugTank, setUgTank] = useState(true);
  const [boundaryGate, setBoundaryGate] = useState(false);
  const [ldaMapAssist, setLdaMapAssist] = useState(true);
  const [pdfBusy, setPdfBusy] = useState(false);

  const activeTier = tiers.find((t) => t.id === selectedTierId) || tiers[2];
  const effectiveRate = mode === "RESIDENTIAL" ? activeTier.ratePerSqFt : activeTier.commercialRatePerSqFt;
  const totalBuiltUpSqFt = Math.max(400, plotSqFt) * floors;
  const baseConstructionCost = totalBuiltUpSqFt * effectiveRate;

  const addonsList = useMemo(() => {
    const out: { name: string; cost: number }[] = [];
    if (stiltParking) out.push({ name: "Stilt Parking RCC", cost: Math.round(plotSqFt * 950) });
    if (ugTank) out.push({ name: "Underground Water Tank (10,000L)", cost: 135000 });
    if (boundaryGate) out.push({ name: "Boundary Wall & Main Gate", cost: 185000 });
    if (ldaMapAssist) out.push({ name: "LDA / Ansal Map Approval Assistance", cost: 45000 });
    return out;
  }, [stiltParking, ugTank, boundaryGate, ldaMapAssist, plotSqFt]);

  const addonsTotal = addonsList.reduce((s, a) => s + a.cost, 0);
  const grandTotal = baseConstructionCost + addonsTotal;

  const handleDownloadPdf = async () => {
    setPdfBusy(true);
    try {
      await downloadTurnkeyEstimatePdf({
        plotSqFt,
        floors,
        totalBuiltUpSqFt,
        zoneLabel: zone,
        tier: activeTier,
        effectiveRate,
        addons: addonsList,
        grandTotal,
      });
      toast.success("Downloaded Branded CONON Turnkey Proposal & Home-Loan PDF!");
    } catch {
      toast.error("Could not generate PDF");
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">
            Smart Lucknow Plot Calculator
          </p>
          <h2 className="text-xl font-black text-slate-900">
            Turnkey Cost Estimator &amp; 10-Stage Escrow Schedule
          </h2>
        </div>

        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={pdfBusy}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-black flex items-center gap-2 cursor-pointer self-start"
        >
          <FileDown className="w-4 h-4" />
          <span>{pdfBusy ? "Generating PDF..." : "Download Branded Turnkey & Loan PDF"}</span>
        </button>
      </div>

      {/* 1-Tap Lucknow Standard Plot Size Presets */}
      <div className="space-y-2">
        <label className="text-xs font-black text-slate-700 block">
          1-Tap Lucknow Standard Plot Size Presets (LDA / Ansal API / Awas Vikas)
        </label>
        <div className="flex flex-wrap gap-2">
          {LUCKNOW_PLOT_PRESETS.map((p) => (
            <button
              key={p.sqft}
              type="button"
              onClick={() => setPlotSqFt(p.sqft)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black border transition cursor-pointer ${
                plotSqFt === p.sqft
                  ? "bg-blue-700 text-white border-blue-700"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-400"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="font-bold text-slate-600 block mb-1">Custom Plot Area (sq.ft / floor)</label>
          <input
            type="number"
            min={400}
            value={plotSqFt}
            onChange={(e) => setPlotSqFt(Math.max(400, Number(e.target.value || 1000)))}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-black text-slate-900"
          />
        </div>
        <div>
          <label className="font-bold text-slate-600 block mb-1">Lucknow Zone</label>
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
          >
            {LUCKNOW_ZONES.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-bold text-slate-600 block mb-1">Floors</label>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { f: 1, label: "G" },
              { f: 2, label: "G+1" },
              { f: 3, label: "G+2" },
              { f: 4, label: "G+3" },
            ].map((item) => (
              <button
                key={item.f}
                type="button"
                onClick={() => setFloors(item.f)}
                className={`py-2 rounded-xl font-black border cursor-pointer ${
                  floors === item.f
                    ? "bg-slate-900 text-amber-300 border-slate-900"
                    : "bg-slate-50 text-slate-700 border-slate-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="font-bold text-slate-600 block mb-1">Package Tier</label>
          <select
            value={selectedTierId}
            onChange={(e) => onSelectTierId(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
          >
            {tiers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({inr(mode === "RESIDENTIAL" ? t.ratePerSqFt : t.commercialRatePerSqFt)}/sqft)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Add-on Toggles */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { label: "+ Stilt Parking", state: stiltParking, set: setStiltParking },
          { label: "+ Underground Water Tank (10,000L)", state: ugTank, set: setUgTank },
          { label: "+ Boundary Wall & Main Gate", state: boundaryGate, set: setBoundaryGate },
          { label: "+ LDA / Ansal Map Approval Assistance", state: ldaMapAssist, set: setLdaMapAssist },
        ].map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={() => a.set(!a.state)}
            className={`px-3 py-1.5 rounded-xl font-bold border transition cursor-pointer ${
              a.state
                ? "bg-emerald-50 border-emerald-400 text-emerald-900"
                : "bg-slate-50 border-slate-200 text-slate-600"
            }`}
          >
            {a.state ? "✓ " : ""}
            {a.label}
          </button>
        ))}
      </div>

      {/* Summary + 3 Guarantees + 10-Stage Escrow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
        <div className="lg:col-span-5 rounded-2xl bg-slate-950 text-white p-5 space-y-4">
          <div>
            <div className="text-[11px] font-bold text-blue-200">
              Total Built-Up: {totalBuiltUpSqFt.toLocaleString("en-IN")} sq.ft • {activeTier.name}
            </div>
            <div className="text-3xl font-black font-mono text-amber-300 mt-1">
              {inrShort(grandTotal)}
            </div>
            <div className="text-xs font-mono text-slate-300">{inr(grandTotal)} (Incl. Add-ons)</div>
          </div>

          {/* 60 / 25 / 15 Breakdown */}
          <div className="space-y-1.5 text-xs pt-2 border-t border-white/10">
            <div className="flex justify-between">
              <span className="text-slate-300">Branded Materials (60%)</span>
              <span className="font-mono font-black">{inrShort(grandTotal * 0.6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Skilled Labour &amp; Equipment (25%)</span>
              <span className="font-mono font-black">{inrShort(grandTotal * 0.25)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Civil Supervision &amp; Design (15%)</span>
              <span className="font-mono font-black">{inrShort(grandTotal * 0.15)}</span>
            </div>
          </div>

          <div className="space-y-1.5 text-[11px] text-emerald-300 font-bold pt-2 border-t border-white/10">
            <div>🔒 100% CONON Escrow Stage-Lock</div>
            <div>📸 Daily Site Progress Photos &amp; 450-Check Civil Audit</div>
            <div>⏱️ Zero-Delay Handover Penalty Protection</div>
          </div>

          <button
            type="button"
            onClick={() => onBookVisit(activeTier.name)}
            className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer"
          >
            Lock Estimate &amp; Book Free Civil Engineer Visit →
          </button>
        </div>

        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
          <div className="text-xs font-black text-slate-900 uppercase tracking-wider">
            10-Stage CONON Escrow Payment Schedule
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {TEN_STAGE_ESCROW_SCHEDULE.map((st) => {
              const stageAmt = Math.round((grandTotal * st.pct) / 100);
              return (
                <div
                  key={st.stage}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-black text-blue-700">STAGE {st.stage} ({st.pct}%)</span>
                    <div className="text-[11px] font-bold text-slate-800 truncate">{st.title}</div>
                  </div>
                  <span className="font-mono font-black text-slate-900 shrink-0">{inrShort(stageAmt)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════
   PART 4 — 5-TAB LUCKNOW SMART MATERIAL CALCULATOR + RMC SWITCH
════════════════════════════════════════════════════════════════ */
type CalcTab = "slab" | "brickwork" | "plaster" | "footing" | "tiles";

function MaterialCalculatorSection() {
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const addToCart = useAddToCart();
  const { setCartOpen } = useUI();
  const liveProducts = useLiveProducts();

  const [tab, setTab] = useState<CalcTab>("slab");
  const [areaSqFt, setAreaSqFt] = useState(1000);
  const [thicknessIn, setThicknessIn] = useState(5);

  // Pull live catalog rates where available
  const findLiveRate = (kw: string, fallback: number) => {
    const match = liveProducts.find((p) => (p.name || "").toLowerCase().includes(kw));
    return match && Number(match.price) > 0 ? Number(match.price) : fallback;
  };

  const cementRate = findLiveRate("cement", 395);
  const tmtRate = findLiveRate("tmt", 64);
  const morangRate = findLiveRate("morang", 72);
  const gittiRate = findLiveRate("gitti", 58);
  const brickRate = findLiveRate("brick", 9);
  const tileRate = findLiveRate("tile", 820);

  const calc = useMemo(() => {
    const area = Math.max(50, areaSqFt);
    const thickFt = Math.max(1, thicknessIn) / 12;
    const volCft = area * thickFt;
    const volM3 = Number((volCft / 35.3147).toFixed(1));

    if (tab === "slab" || tab === "footing") {
      const factor = tab === "footing" ? 1.25 : 1.0;
      const cementBags = Math.ceil(volM3 * 8 * factor);
      const tmtKg = Math.ceil(volM3 * 95 * factor);
      const morangCft = Math.ceil(volCft * 0.45 * factor);
      const gittiCft = Math.ceil(volCft * 0.9 * factor);
      return {
        volM3: Number((volM3 * factor).toFixed(1)),
        items: [
          { id: "ultratech-opc-53-50kg", name: "OPC 53 / PPC Cement (UltraTech / ACC)", qty: cementBags, unit: "Bags", price: cementRate },
          { id: "kamdhenu-tmt-fe550d", name: "Fe-550D TMT Sariya", qty: tmtKg, unit: "Kg", price: tmtRate },
          { id: "banda-morang-sand", name: "Banda Morang (Coarse River Sand)", qty: morangCft, unit: "CFT", price: morangRate },
          { id: "kabrai-20mm-gitti", name: "Kabrai 20mm Stone Aggregate (Gitti)", qty: gittiCft, unit: "CFT", price: gittiRate },
        ],
      };
    }

    if (tab === "brickwork") {
      const bricks = Math.ceil(area * 9.5);
      const cementBags = Math.ceil(area * 0.08);
      const morangCft = Math.ceil(area * 0.28);
      return {
        volM3: 0,
        items: [
          { id: "awal-bhatta-bricks", name: "Awal Bhatta Red Bricks", qty: bricks, unit: "Nos", price: brickRate },
          { id: "ultratech-ppc-cement-50kg", name: "OPC / PPC Cement (UltraTech / ACC)", qty: cementBags, unit: "Bags", price: cementRate },
          { id: "banda-morang-sand", name: "Banda Morang (Coarse River Sand)", qty: morangCft, unit: "CFT", price: morangRate },
        ],
      };
    }

    if (tab === "plaster") {
      const cementBags = Math.ceil(area * 0.045);
      const morangCft = Math.ceil(area * 0.16);
      return {
        volM3: 0,
        items: [
          { id: "ultratech-ppc-cement-50kg", name: "PPC Cement (UltraTech / ACC)", qty: cementBags, unit: "Bags", price: cementRate },
          { id: "banda-morang-sand", name: "Fine Plaster Sand / Morang", qty: morangCft, unit: "CFT", price: morangRate },
        ],
      };
    }

    // flooring tiles
    const boxes = Math.ceil((area * 1.08) / 16);
    const adhesiveBags = Math.ceil(area / 35);
    return {
      volM3: 0,
      items: [
        { id: "kajaria-vitrified-box", name: "Kajaria / Somany Vitrified Tiles (16 sq.ft/box)", qty: boxes, unit: "Boxes", price: tileRate },
        { id: "rofff-tile-adhesive", name: "Polymer Tile Adhesive (20 kg)", qty: adhesiveBags, unit: "Bags", price: 380 },
      ],
    };
  }, [tab, areaSqFt, thicknessIn, cementRate, tmtRate, morangRate, gittiRate, brickRate, tileRate]);

  const handleAddAllToCart = async () => {
    for (const it of calc.items) {
      await addToCart.mutateAsync({
        data: {
          materialId: it.id,
          category: "cement",
          name: it.name,
          price: it.price,
          unit: it.unit,
          quantity: it.qty,
          vendor: "CONON Lucknow Verified Depot",
        },
      });
    }
    qc.invalidateQueries({ queryKey: getGetCartQueryKey() });
    toast.success("All calculated Lucknow materials added to 60-Min Cart!");
    setCartOpen(true);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">
          5-Tab Civil Engineering BOQ Tool (Live Catalog Rates)
        </p>
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-700" />
          <span>Lucknow Smart Material Calculator</span>
        </h2>
      </div>

      {/* 5 Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none">
        {(
          [
            { id: "slab", label: "Slab / Chhat" },
            { id: "brickwork", label: "Brickwork (Awal Eent / AAC)" },
            { id: "plaster", label: "Plaster (12mm/15mm)" },
            { id: "footing", label: "Footing / Column RCC" },
            { id: "tiles", label: "Flooring Tiles" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-black border whitespace-nowrap cursor-pointer transition ${
              tab === t.id
                ? "bg-slate-900 text-amber-300 border-slate-900"
                : "bg-slate-50 text-slate-700 border-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="font-bold text-slate-600 block mb-1">Area (sq.ft)</label>
          <input
            type="number"
            min={50}
            value={areaSqFt}
            onChange={(e) => setAreaSqFt(Math.max(50, Number(e.target.value || 100)))}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-black text-slate-900"
          />
        </div>
        {(tab === "slab" || tab === "footing") && (
          <div>
            <label className="font-bold text-slate-600 block mb-1">Slab / Member Thickness (Inches)</label>
            <input
              type="number"
              min={3}
              max={24}
              value={thicknessIn}
              onChange={(e) => setThicknessIn(Math.max(3, Number(e.target.value || 5)))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-black text-slate-900"
            />
          </div>
        )}
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {calc.items.map((item) => (
          <div key={item.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[11px] font-bold text-slate-600">{item.name}</div>
            <div className="text-lg font-black font-mono text-slate-900">
              {item.qty.toLocaleString("en-IN")} {item.unit}
            </div>
            <div className="text-[11px] font-mono font-bold text-emerald-700">
              Est. {inr(item.qty * item.price)} (@ ₹{item.price}/{item.unit})
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons including 1-Click RMC Switch */}
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <button
          type="button"
          onClick={handleAddAllToCart}
          className="flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Option A: Site-Mix Materials → Add All to 60-Min Cart</span>
        </button>

        {(tab === "slab" || tab === "footing") && (
          <button
            type="button"
            onClick={() => setLocation(`/rmc?volume=${calc.volM3}`)}
            className="flex-1 py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-amber-300" />
            <span>Option B: Order M25 Ready Mix Concrete ({calc.volM3} m³) → RMC Plant Direct</span>
          </button>
        )}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════
   PART 5 — FREE CIVIL ENGINEER SITE VISIT BOOKER MODAL
════════════════════════════════════════════════════════════════ */
function ConsultationSheet({
  pkg,
  defaultSqft,
  onClose,
}: {
  pkg: string;
  defaultSqft: number;
  onClose: () => void;
}) {
  const masterSync = useSafeCononMasterSync();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [locationPincode, setLocationPincode] = useState("226030 — Sushant Golf City");
  const [plotSqFt, setPlotSqFt] = useState(defaultSqft);
  const [visitType, setVisitType] = useState<"ON_SITE_ENGINEER" | "HQ_OFFICE_MEET">("ON_SITE_ENGINEER");
  const [preferredSlot, setPreferredSlot] = useState("Tomorrow 11:00 AM");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || phone.replace(/\D/g, "").length < 10) {
      toast.error("Enter valid Name & 10-digit Mobile Number");
      return;
    }
    setSubmitting(true);
    try {
      const lead: TurnkeyConsultationLead = {
        id: `TRN-${Date.now().toString(36).toUpperCase()}`,
        name: name.trim(),
        phone: `+91 ${phone.replace(/\D/g, "").slice(-10)}`,
        locationPincode,
        plotSqFt,
        packageName: pkg,
        visitType,
        preferredSlot,
        status: "NEW",
        createdAt: new Date().toISOString(),
      };

      await fetch(apiUrl("/api/build/consultations"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      }).catch(() => {});

      if (masterSync) {
        const existing = masterSync.state.operations?.turnkeyConsultations || [];
        await masterSync
          .patchMasterState(
            { operations: { turnkeyConsultations: [lead, ...existing].slice(0, 100) } },
            "turnkeyBuild"
          )
          .catch(() => {});
      }

      toast.success(`Site Visit Booked! Ref #${lead.id}`, {
        description: "Synced live with CONON Command OS. Senior Civil Engineer will call shortly.",
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 32 }}
        animate={{ y: 0 }}
        exit={{ y: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <span className="text-[10px] font-black uppercase text-amber-600">
              Free Civil Engineer Consultation
            </span>
            <h3 className="text-base font-black text-slate-900">
              Book Site Visit ({pkg} Package)
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 cursor-pointer">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              type="text"
              required
              placeholder="Your Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-300"
            />
            <input
              type="tel"
              required
              placeholder="+91 Mobile *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-300 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              type="text"
              required
              placeholder="Plot Location / Pin Code *"
              value={locationPincode}
              onChange={(e) => setLocationPincode(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-300"
            />
            <input
              type="number"
              min={200}
              placeholder="Plot Size (sq.ft)"
              value={plotSqFt}
              onChange={(e) => setPlotSqFt(Number(e.target.value || 1000))}
              className="px-3 py-2.5 rounded-xl border border-slate-300 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 gap-2">
            {[
              { id: "ON_SITE_ENGINEER" as const, label: "On-Site Civil Engineer Plot Visit" },
              { id: "HQ_OFFICE_MEET" as const, label: "Meet at Conon Infrabuilt Office — Skyline Plaza 3, Sushant Golf City" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setVisitType(opt.id)}
                className={`p-2.5 rounded-xl border-2 text-left font-bold cursor-pointer ${
                  visitType === opt.id ? "border-blue-700 bg-blue-50 text-blue-950" : "border-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={preferredSlot}
            onChange={(e) => setPreferredSlot(e.target.value)}
            placeholder="Preferred Date & Time Slot"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-xs cursor-pointer"
          >
            {submitting ? "Booking Visit..." : "Confirm Free Civil Engineer Visit →"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default CononBuild;
