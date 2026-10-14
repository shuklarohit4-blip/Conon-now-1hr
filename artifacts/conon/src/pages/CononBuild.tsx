import React, { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useUI } from "@/context/UIContext";
import { toast } from "sonner";
import {
  HardHat, DraftingCompass, Pickaxe, Building2, Wrench, Paintbrush, KeyRound,
  ChevronRight, Check, Phone, MapPin, Ruler, IndianRupee, ShoppingCart,
  Sparkles, Crown, Shield, Star, X, Calculator, Zap, Layers, Hammer,
} from "lucide-react";

const BRAND = "#1b4366";
const AMBER = "#f59e0b";
const NEON  = "#84cc16";

const inr = (n: number) =>
  "₹" + Math.round(n).toLocaleString("en-IN");
const inrShort = (n: number) => {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return inr(n);
};

/* ════════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════════ */
export function CononBuild() {
  const [consultPkg, setConsultPkg] = useState<string | null>(null);

  return (
    <Layout>
      <div className="bg-slate-50 min-h-full pb-6">
        {/* Hero */}
        <div className="px-5 pt-7 pb-7 rounded-b-[36px] shadow-lg" style={{ background: BRAND }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)" }}>
              <HardHat className="w-5 h-5 text-amber-300" strokeWidth={2.4} />
            </span>
            <div>
              <h2 className="font-display font-black italic text-2xl text-white leading-none">Conon Build</h2>
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-[0.2em] mt-1">Turnkey Home Construction</p>
            </div>
          </div>
          <p className="text-sm text-blue-100/90 leading-snug mt-3">
            From blueprint to handover — premium materials, certified engineers and transparent
            pricing for your dream home. Built start to finish by CONON.
          </p>
          <div className="flex gap-2 mt-4">
            <Trust icon={<Shield className="w-3 h-3" />} label="ISI Certified" />
            <Trust icon={<Star className="w-3 h-3" />} label="500+ Homes" />
            <Trust icon={<Zap className="w-3 h-3" />} label="On-Time Promise" />
          </div>
        </div>

        <PackagesSection onBook={setConsultPkg} />
        <JourneySection />
        <EstimatorSection />
        <MaterialCalculatorSection />
      </div>

      <AnimatePresence>
        {consultPkg && <ConsultationSheet pkg={consultPkg} onClose={() => setConsultPkg(null)} />}
      </AnimatePresence>
    </Layout>
  );
}

function Trust({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }}>
      <span className="text-amber-300">{icon}</span>
      <span className="text-[10px] font-black text-white">{label}</span>
    </div>
  );
}

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: AMBER }}>{kicker}</p>
      <h3 className="text-xl font-display font-black text-slate-800 mt-0.5">{title}</h3>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   1. TURNKEY PACKAGES
════════════════════════════════════════════════════════════════ */
interface Pkg {
  id: string; name: string; tier: string; rate: number; accent: string;
  icon: React.ReactNode; popular?: boolean; features: string[];
}
const PACKAGES: Pkg[] = [
  {
    id: "silver", name: "Silver", tier: "Basic", rate: 1650, accent: "#64748b",
    icon: <Building2 className="w-5 h-5" />,
    features: ["Standard grade materials", "Basic 2D floor plan", "Structural RCC frame", "Standard fittings", "1-year warranty"],
  },
  {
    id: "gold", name: "Gold", tier: "Standard", rate: 2100, accent: AMBER, popular: true,
    icon: <Sparkles className="w-5 h-5" />,
    features: ["Premium branded materials", "Standard electrical & plumbing", "2D + elevation design", "Branded sanitaryware", "3-year warranty"],
  },
  {
    id: "platinum", name: "Platinum", tier: "Premium", rate: 2750, accent: BRAND,
    icon: <Crown className="w-5 h-5" />,
    features: ["High-end finishes", "Complete 3D layout videos", "Dedicated site engineer", "Designer modular kitchen", "5-year warranty"],
  },
  {
    id: "luxury", name: "Luxury", tier: "Mansion", rate: 3600, accent: "#7c3aed",
    icon: <Crown className="w-5 h-5" />,
    features: ["Custom architecture", "Smart home integration", "Ideal for G+2 structures", "Imported finishes", "Lifetime structural warranty"],
  },
];

function PackagesSection({ onBook }: { onBook: (pkg: string) => void }) {
  return (
    <div className="pt-7 px-5">
      <SectionTitle kicker="Choose your tier" title="Turnkey Packages" />
      <div className="flex gap-4 overflow-x-auto pb-3 -mx-5 px-5 scrollbar-hide snap-x snap-mandatory">
        {PACKAGES.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="snap-start shrink-0 w-[270px] bg-white rounded-[26px] border border-slate-200 overflow-hidden shadow-sm flex flex-col"
          >
            <div className="px-5 pt-5 pb-4 relative" style={{ background: `linear-gradient(160deg, ${p.accent}14, #ffffff)` }}>
              {p.popular && (
                <span className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-wide px-2 py-1 rounded-full text-white" style={{ background: AMBER }}>
                  Popular
                </span>
              )}
              <span className="w-11 h-11 rounded-2xl flex items-center justify-center text-white" style={{ background: p.accent }}>
                {p.icon}
              </span>
              <h4 className="font-display font-black text-xl text-slate-800 mt-3">{p.name}</h4>
              <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: p.accent }}>{p.tier}</p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-display font-black text-slate-800">{inr(p.rate)}</span>
                <span className="text-xs font-bold text-slate-400">/ sq ft</span>
              </div>
            </div>
            <div className="px-5 py-4 flex-1 space-y-2.5">
              {p.features.map(f => (
                <div key={f} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${p.accent}1a` }}>
                    <Check className="w-2.5 h-2.5" style={{ color: p.accent }} strokeWidth={3.5} />
                  </span>
                  <span className="text-[12px] font-semibold text-slate-600 leading-snug">{f}</span>
                </div>
              ))}
            </div>
            <div className="px-5 pb-5">
              <button
                onClick={() => onBook(`${p.name} / ${p.tier}`)}
                className="w-full py-3 rounded-2xl font-black text-[13px] text-white active:scale-[0.98] transition"
                style={{ background: p.accent }}
              >
                Book Free Consultation
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   2. CONSTRUCTION JOURNEY (vertical stepper)
════════════════════════════════════════════════════════════════ */
const JOURNEY = [
  { icon: <DraftingCompass className="w-5 h-5" />, title: "Architecture & Approvals", desc: "Site survey, architectural drawings, structural design and all government approvals & sanctions." },
  { icon: <Pickaxe className="w-5 h-5" />,         title: "Excavation & Foundation", desc: "Soil testing, excavation, anti-termite treatment and a strong RCC footing foundation." },
  { icon: <Building2 className="w-5 h-5" />,       title: "Superstructure (Brickwork & RCC)", desc: "Columns, beams, slabs and brick masonry — the structural skeleton of your home." },
  { icon: <Wrench className="w-5 h-5" />,          title: "Plastering & MEP", desc: "Internal/external plaster plus Mechanical, Electrical & Plumbing rough-in work." },
  { icon: <Paintbrush className="w-5 h-5" />,      title: "Interiors & Finishing", desc: "Flooring, painting, woodwork, fixtures, modular kitchen and final detailing." },
  { icon: <KeyRound className="w-5 h-5" />,        title: "Final Handover", desc: "Quality inspection, snag-free certification and the keys to your dream home." },
];

function JourneySection() {
  const [active, setActive] = useState(0);
  return (
    <div className="pt-9 px-5">
      <SectionTitle kicker="Start to finish" title="How We Build Your Dream Home" />
      <div className="relative">
        <div className="absolute left-[22px] top-2 bottom-2 w-0.5 bg-slate-200" />
        {JOURNEY.map((s, i) => {
          const isActive = active === i;
          return (
            <button
              key={s.title}
              onClick={() => setActive(i)}
              className="relative w-full text-left flex gap-4 pb-5 last:pb-0 group"
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 z-10 transition-all"
                style={{
                  background: isActive ? BRAND : "white",
                  color: isActive ? "white" : "#94a3b8",
                  border: isActive ? "none" : "2px solid #e2e8f0",
                  boxShadow: isActive ? "0 8px 18px -6px rgba(27,67,102,0.5)" : "none",
                }}
              >
                {s.icon}
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md" style={{ background: `${BRAND}12`, color: BRAND }}>
                    STEP {i + 1}
                  </span>
                  <h4 className="text-sm font-black text-slate-800">{s.title}</h4>
                </div>
                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="text-[12px] text-slate-500 leading-snug mt-1.5 overflow-hidden"
                    >
                      {s.desc}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   3. AI COST ESTIMATOR
════════════════════════════════════════════════════════════════ */
const EST_RATES: Record<string, number> = { silver: 1650, gold: 2100, platinum: 2750, luxury: 3600 };
const EST_LABELS: Record<string, string> = { silver: "Silver / Basic", gold: "Gold / Standard", platinum: "Platinum / Premium", luxury: "Luxury / Mansion" };
const FLOOR_OPTS = ["G", "G+1", "G+2", "G+3"];

function EstimatorSection() {
  const [city, setCity] = useState("Lucknow");
  const [area, setArea] = useState("6100");
  const [floors, setFloors] = useState("G+2");
  const [pkg, setPkg] = useState("platinum");

  const total = useMemo(() => {
    const a = parseFloat(area) || 0;
    return a * (EST_RATES[pkg] ?? 0);
  }, [area, pkg]);

  const breakdown = useMemo(() => ([
    { label: "Material", pct: 60, color: BRAND,  value: total * 0.6 },
    { label: "Labour",   pct: 25, color: AMBER,  value: total * 0.25 },
    { label: "Design",   pct: 15, color: "#7c3aed", value: total * 0.15 },
  ]), [total]);

  return (
    <div className="pt-9 px-5">
      <SectionTitle kicker="AI powered" title="Cost Estimator" />
      <div className="bg-white rounded-[26px] border border-slate-200 shadow-sm p-5">
        <div className="grid grid-cols-2 gap-3">
          <EstField label="City" icon={<MapPin className="w-3.5 h-3.5" />}>
            <input value={city} onChange={e => setCity(e.target.value)}
              className="w-full bg-transparent text-sm font-black text-slate-800 outline-none" />
          </EstField>
          <EstField label="Built-up Area (sq ft)" icon={<Ruler className="w-3.5 h-3.5" />}>
            <input value={area} onChange={e => setArea(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric"
              className="w-full bg-transparent text-sm font-black text-slate-800 outline-none" />
          </EstField>
        </div>
        <p className="text-[9px] font-semibold text-slate-400 mt-1.5 px-1">Total built-up area across all floors.</p>

        <div className="mt-3">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Number of Floors</p>
          <div className="grid grid-cols-4 gap-2">
            {FLOOR_OPTS.map(f => (
              <button key={f} onClick={() => setFloors(f)}
                className="py-2 rounded-xl text-xs font-black border-2 transition"
                style={{
                  borderColor: floors === f ? BRAND : "#e2e8f0",
                  background: floors === f ? "#f0f6ff" : "white",
                  color: floors === f ? BRAND : "#94a3b8",
                }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Preferred Package</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(EST_RATES).map(k => (
              <button key={k} onClick={() => setPkg(k)}
                className="py-2.5 px-3 rounded-xl text-left border-2 transition"
                style={{
                  borderColor: pkg === k ? BRAND : "#e2e8f0",
                  background: pkg === k ? "#f0f6ff" : "white",
                }}>
                <span className="block text-[11px] font-black" style={{ color: pkg === k ? BRAND : "#475569" }}>
                  {EST_LABELS[k].split(" / ")[0]}
                </span>
                <span className="block text-[9px] font-bold text-slate-400">{inr(EST_RATES[k])}/sqft</span>
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        <div className="mt-5 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estimated Total Cost</p>
              <p className="text-3xl font-display font-black italic" style={{ color: BRAND }}>{inrShort(total)}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">{city} · {floors} · {EST_LABELS[pkg]}</p>
            </div>
            <Donut segments={breakdown} />
          </div>
          <div className="space-y-2">
            {breakdown.map(b => (
              <div key={b.label} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: b.color }} />
                <span className="text-[12px] font-bold text-slate-600 flex-1">{b.label}</span>
                <span className="text-[11px] font-black text-slate-400">{b.pct}%</span>
                <span className="text-[12px] font-black text-slate-800 w-[88px] text-right">{inrShort(b.value)}</span>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-slate-400 mt-4 leading-snug">
            * Indicative estimate based on standard CONON rates. Final quote provided after site survey.
          </p>
        </div>
      </div>
    </div>
  );
}

function EstField({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-slate-50 rounded-2xl px-3.5 py-2.5 border border-slate-200">
      <div className="flex items-center gap-1 text-slate-400 mb-1">
        {icon}
        <p className="text-[9px] font-black uppercase tracking-wide leading-none">{label}</p>
      </div>
      {children}
    </div>
  );
}

function Donut({ segments }: { segments: { label: string; pct: number; color: string }[] }) {
  const r = 34, sw = 13, C = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width="92" height="92" viewBox="0 0 92 92" className="shrink-0">
      <g transform="rotate(-90 46 46)">
        <circle cx="46" cy="46" r={r} fill="none" stroke="#f1f5f9" strokeWidth={sw} />
        {segments.map(s => {
          const len = (s.pct / 100) * C;
          const el = (
            <circle
              key={s.label} cx="46" cy="46" r={r} fill="none"
              stroke={s.color} strokeWidth={sw}
              strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += len;
          return el;
        })}
      </g>
      <text x="46" y="44" textAnchor="middle" className="fill-slate-800" style={{ fontSize: 13, fontWeight: 900 }}>100%</text>
      <text x="46" y="56" textAnchor="middle" className="fill-slate-400" style={{ fontSize: 7, fontWeight: 700 }}>SPLIT</text>
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════
   4. SMART MATERIAL CALCULATOR
════════════════════════════════════════════════════════════════ */
const FT3_TO_M3 = 0.0283168;
const M3_TO_FT3 = 35.3147;
const BAG_M3 = 0.0347;

interface MatLine { id: string; name: string; qty: number; unit: string; price: number; category: string; }

type CalcType = "slab" | "brickwork" | "plaster";
const CALC_TABS: { id: CalcType; label: string; icon: React.ReactNode }[] = [
  { id: "slab",      label: "Slab",      icon: <Layers className="w-4 h-4" /> },
  { id: "brickwork", label: "Brickwork", icon: <Building2 className="w-4 h-4" /> },
  { id: "plaster",   label: "Plaster",   icon: <Hammer className="w-4 h-4" /> },
];

function MaterialCalculatorSection() {
  const [tab, setTab] = useState<CalcType>("slab");
  const [length, setLength] = useState("20");
  const [width, setWidth] = useState("15");
  const [thickness, setThickness] = useState("5");

  const addToCart = useAddToCart();
  const queryClient = useQueryClient();
  const { setCartOpen } = useUI();

  const lines = useMemo<MatLine[]>(() => {
    const L = parseFloat(length) || 0;
    const W = parseFloat(width) || 0;
    const T = parseFloat(thickness) || 0;
    if (L <= 0 || W <= 0 || T <= 0) return [];

    if (tab === "slab") {
      const volFt3 = L * W * (T / 12);
      const volM3 = volFt3 * FT3_TO_M3;
      const dry = volM3 * 1.54;
      const cementBags = Math.ceil((dry * (1 / 5.5)) / BAG_M3);
      const sandFt3 = Math.round(dry * (1.5 / 5.5) * M3_TO_FT3);
      const aggFt3 = Math.round(dry * (3 / 5.5) * M3_TO_FT3);
      const steelKg = Math.round(volM3 * 80);
      return [
        { id: "build-cement", name: "OPC 53 Cement", qty: cementBags, unit: "bags", price: 420, category: "Cement" },
        { id: "build-steel",  name: "TMT Steel Bars", qty: steelKg, unit: "kg", price: 65, category: "Steel" },
        { id: "build-sand",   name: "River Sand", qty: sandFt3, unit: "cft", price: 60, category: "Sand" },
        { id: "build-agg",    name: "Stone Aggregate (20mm)", qty: aggFt3, unit: "cft", price: 55, category: "Aggregate" },
      ];
    }
    if (tab === "brickwork") {
      const volFt3 = L * W * (T / 12);
      const volM3 = volFt3 * FT3_TO_M3;
      const bricks = Math.ceil(volM3 * 500);
      const cementBags = Math.ceil(volM3 * 1.26);
      const sandFt3 = Math.round(volM3 * 0.27 * M3_TO_FT3);
      return [
        { id: "build-bricks", name: "Red Clay Bricks", qty: bricks, unit: "pcs", price: 9, category: "Bricks" },
        { id: "build-cement", name: "OPC 53 Cement", qty: cementBags, unit: "bags", price: 420, category: "Cement" },
        { id: "build-sand",   name: "River Sand", qty: sandFt3, unit: "cft", price: 60, category: "Sand" },
      ];
    }
    // plaster
    const areaM2 = (L * 0.3048) * (W * 0.3048);
    const factor = T / 12;
    const cementBags = Math.ceil(areaM2 * 0.17 * factor);
    const sandFt3 = Math.round(areaM2 * 0.018 * factor * M3_TO_FT3);
    return [
      { id: "build-cement", name: "OPC 53 Cement", qty: cementBags, unit: "bags", price: 420, category: "Cement" },
      { id: "build-sand",   name: "River Sand", qty: sandFt3, unit: "cft", price: 60, category: "Sand" },
    ];
  }, [tab, length, width, thickness]);

  const grandTotal = lines.reduce((s, l) => s + l.qty * l.price, 0);
  const thirdLabel = tab === "plaster" ? "Thickness (mm)" : "Thickness (in)";

  const addAll = async () => {
    const valid = lines.filter(l => l.qty > 0);
    if (valid.length === 0) { toast.error("Enter valid dimensions first"); return; }
    let ok = 0;
    for (const l of valid) {
      try {
        await addToCart.mutateAsync({
          data: {
            materialId: l.id,
            quantity: Math.min(Math.max(Math.round(l.qty), 1), 10000),
            name: l.name,
            price: l.price,
            unit: l.unit,
            vendor: "CONON Build",
            category: l.category,
          },
        });
        ok++;
      } catch {
        /* keep going; report partial result below */
      }
    }
    queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
    if (ok === 0) {
      toast.error("Couldn't add materials", { description: "Please try again." });
      return;
    }
    if (ok < valid.length) {
      toast.warning(`Added ${ok} of ${valid.length} materials`, { description: "Some items couldn't be added — please retry." });
    } else {
      toast.success("Materials added to cart", { description: "Eligible for 1-Hour Delivery" });
    }
    setCartOpen(true);
  };

  return (
    <div className="pt-9 px-5">
      <SectionTitle kicker="Civil engineering thumb rules" title="Smart Material Calculator" />
      <div className="bg-white rounded-[26px] border border-slate-200 shadow-sm p-5">
        {/* Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {CALC_TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setThickness(t.id === "plaster" ? "12" : t.id === "brickwork" ? "9" : "5"); }}
              className="flex flex-col items-center gap-1 py-3 rounded-2xl border-2 transition"
              style={{
                borderColor: tab === t.id ? BRAND : "#e2e8f0",
                background: tab === t.id ? "#f0f6ff" : "white",
                color: tab === t.id ? BRAND : "#94a3b8",
              }}>
              {t.icon}
              <span className="text-[11px] font-black">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-3 gap-2">
          <CalcInput label="Length (ft)" value={length} onChange={setLength} />
          <CalcInput label={tab === "slab" ? "Width (ft)" : "Height (ft)"} value={width} onChange={setWidth} />
          <CalcInput label={thirdLabel} value={thickness} onChange={setThickness} />
        </div>

        {/* Results */}
        <div className="mt-4 space-y-2">
          {lines.length === 0 ? (
            <p className="text-center text-slate-400 text-sm font-semibold py-6">Enter dimensions to calculate.</p>
          ) : lines.map((l, i) => (
            <motion.div key={l.id + i}
              initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
              <div className="flex-1">
                <p className="text-[13px] font-black text-slate-800">{l.name}</p>
                <p className="text-[10px] font-bold text-slate-400">{l.category} · {inr(l.price)}/{l.unit}</p>
              </div>
              <div className="text-right">
                <p className="text-base font-display font-black" style={{ color: BRAND }}>
                  {l.qty.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] font-black text-slate-400 uppercase">{l.unit}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {lines.length > 0 && (
          <>
            <div className="flex justify-between items-center mt-4 px-1">
              <span className="text-[12px] font-bold text-slate-500">Estimated Material Cost</span>
              <span className="text-lg font-display font-black" style={{ color: BRAND }}>{inrShort(grandTotal)}</span>
            </div>
            <button
              onClick={addAll}
              disabled={addToCart.isPending}
              className="w-full mt-4 py-4 rounded-[20px] font-black text-sm text-white flex items-center justify-center gap-2 active:scale-[0.98] transition disabled:opacity-60"
              style={{ background: `linear-gradient(135deg, ${BRAND}, #2563eb)`, boxShadow: "0 10px 26px -8px rgba(27,67,102,0.6)" }}
            >
              <ShoppingCart className="w-4 h-4" />
              {addToCart.isPending ? "Adding…" : "Add all to Conon Cart for 1-Hour Delivery"}
            </button>
            <div className="flex items-center justify-center gap-1 mt-2.5">
              <Zap className="w-3 h-3" style={{ color: NEON }} fill="currentColor" />
              <span className="text-[10px] font-black" style={{ color: "#4d7c0f" }}>Delivered to your site in 60 minutes</span>
            </div>
          </>
        )}
        <p className="text-[9px] text-slate-400 mt-4 leading-snug">
          * Quantities use standard civil thumb rules (M20 1:1.5:3, 1:6 mortar). Verify with your engineer.
        </p>
      </div>
    </div>
  );
}

function CalcInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="bg-slate-50 rounded-2xl px-3 py-2.5 border border-slate-200">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide mb-1 leading-none">{label}</p>
      <input
        value={value}
        onChange={e => onChange(e.target.value.replace(/[^0-9.]/g, ""))}
        inputMode="decimal"
        className="w-full bg-transparent text-base font-black text-slate-800 outline-none"
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CONSULTATION SHEET
════════════════════════════════════════════════════════════════ */
function ConsultationSheet({ pkg, onClose }: { pkg: string; onClose: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [done, setDone] = useState(false);

  const submit = () => {
    if (!name.trim() || phone.length < 10) { toast.error("Enter your name and a valid phone number"); return; }
    setDone(true);
    setTimeout(onClose, 2200);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[60]" onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 240 }}
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white rounded-t-[34px] z-[70] p-6"
      >
        {done ? (
          <div className="py-10 flex flex-col items-center text-center">
            <span className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-600" strokeWidth={3} />
            </span>
            <h4 className="text-xl font-display font-black text-slate-800">Consultation Booked!</h4>
            <p className="text-sm text-slate-500 mt-1">Our build expert will call you within 24 hours.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-display font-black italic text-lg" style={{ color: BRAND }}>Free Consultation</h4>
              <button onClick={onClose} className="p-2 bg-slate-100 rounded-full"><X className="w-4 h-4 text-slate-500" /></button>
            </div>
            <p className="text-[11px] font-bold text-slate-400 mb-5">{pkg} package</p>

            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Your Name</p>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rakesh Kumar"
              className="w-full bg-slate-50 rounded-2xl px-4 py-3.5 border border-slate-200 text-sm font-semibold text-slate-800 outline-none focus:border-blue-400 mb-4" />

            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Phone Number</p>
            <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-4 py-3.5 border border-slate-200 focus-within:border-blue-400 mb-6">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-bold text-slate-400">+91</span>
              <input value={phone} onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                inputMode="numeric" placeholder="98765 43210"
                className="flex-1 bg-transparent text-sm font-bold text-slate-800 outline-none" />
            </div>

            <button onClick={submit}
              className="w-full py-4 rounded-[20px] font-black text-sm text-white active:scale-[0.98] transition"
              style={{ background: BRAND, boxShadow: "0 8px 24px rgba(27,67,102,0.3)" }}>
              Request Callback
            </button>
          </>
        )}
      </motion.div>
    </>
  );
}
