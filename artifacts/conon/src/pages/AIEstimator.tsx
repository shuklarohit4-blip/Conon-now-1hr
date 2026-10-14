import React, { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Cpu, Sparkles, Loader2, Plus, Minus,
  ShoppingBag, ChevronRight, Home, Building2, Layers, DoorOpen,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import {
  useGetMaterials, useAddToCart, getGetCartQueryKey,
} from "@workspace/api-client-react";

const BRAND = "#1b4366";
const GREEN = "#2a7a3b";

/* ── Room types ──────────────────────────────────────────────── */
type RoomType = "bedroom" | "living" | "kitchen" | "bath" | "office" | "hall";
const ROOMS: Record<RoomType, { label: string; icon: string; L: number; W: number; H: number }> = {
  bedroom: { label: "Bedroom",     icon: "🛏️", L: 12, W: 10, H: 10 },
  living:  { label: "Living Room", icon: "🛋️", L: 16, W: 14, H: 10 },
  kitchen: { label: "Kitchen",     icon: "🍳", L: 10, W:  8, H: 10 },
  bath:    { label: "Bathroom",    icon: "🚿", L:  8, W:  6, H:  9 },
  office:  { label: "Office",      icon: "💼", L: 14, W: 12, H: 10 },
  hall:    { label: "Passage/Hall",icon: "🚪", L: 20, W:  6, H: 10 },
};

/* ── Project types ───────────────────────────────────────────── */
type ProjectType = "new" | "renovation" | "extension";
const PROJECTS: { id: ProjectType; label: string; desc: string; icon: LucideIcon; multiplier: number }[] = [
  { id: "new",        label: "New Construction", desc: "Full build",    icon: Building2, multiplier: 1.0 },
  { id: "renovation", label: "Renovation",       desc: "Refurbish",    icon: Home,      multiplier: 0.6 },
  { id: "extension",  label: "Extension",        desc: "Add room",     icon: Layers,    multiplier: 0.8 },
];

/* ── Estimation formulas (Indian standard) ───────────────────── */
function calcRoom(L: number, W: number, H: number, floors: number, projMul: number) {
  const wall       = Math.max(0, 2 * (L + W) * H - 20) * floors;
  const floor      = L * W * floors;
  return {
    wallArea:    Math.round(wall),
    floorArea:   Math.round(floor),
    bricks:      Math.round(wall * 10 * projMul),
    cementBags:  Math.max(1, Math.round(wall * 0.05 * projMul + floor * 0.04 * projMul)),
    sandBags:    Math.max(1, Math.round(wall * 0.06 * projMul)),
    paintLitres: Math.max(4, Math.round(wall * 0.02)),
    tileBoxes:   Math.max(1, Math.ceil((floor * 1.10) / 16)),
    steelKg:     Math.round(floor * 4.5 * projMul),
  };
}

type LineKey = "bricks" | "cement" | "sand" | "paint" | "tiles" | "steel";
const LINE_CATS: Record<LineKey, string> = {
  bricks: "bricks", cement: "cement", sand: "sand",
  paint: "paint", tiles: "tiles", steel: "steel",
};

export default function AIEstimator() {
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const { data: materials, isLoading } = useGetMaterials({});
  const addToCart = useAddToCart({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() }) },
  });

  const [room, setRoom]         = useState<RoomType>("bedroom");
  const [project, setProject]   = useState<ProjectType>("new");
  const [floors, setFloors]     = useState(1);
  const [length, setLength]     = useState(ROOMS.bedroom.L);
  const [width, setWidth]       = useState(ROOMS.bedroom.W);
  const [height, setHeight]     = useState(ROOMS.bedroom.H);
  const [qtyOverride, setQtyOverride] = useState<Partial<Record<LineKey, number>>>({});
  const [submitting, setSubmitting]   = useState(false);
  const [activeStep, setActiveStep]   = useState<0 | 1 | 2>(0);

  const projMul = PROJECTS.find(p => p.id === project)?.multiplier ?? 1;
  const est = useMemo(() => calcRoom(length, width, height, floors, projMul), [length, width, height, floors, projMul]);

  const lineItems: { key: LineKey; label: string; qty: number; unit: string }[] = useMemo(() => [
    { key: "bricks", label: "Red Clay Bricks",      qty: est.bricks,      unit: "pcs"  },
    { key: "cement", label: "Cement (UltraTech OPC)",qty: est.cementBags,  unit: "bags" },
    { key: "sand",   label: "River Sand",            qty: est.sandBags,    unit: "bags" },
    { key: "steel",  label: "TMT Steel (Fe500D)",    qty: est.steelKg,     unit: "kg"   },
    { key: "paint",  label: "Wall Paint",            qty: est.paintLitres, unit: "L"    },
    { key: "tiles",  label: "Floor Tiles",           qty: est.tileBoxes,   unit: "boxes"},
  ], [est]);

  const categoryToId = useMemo(() => {
    const map: Record<string, string> = {};
    if (!materials) return map;
    for (const m of materials) { if (!map[m.category]) map[m.category] = m.id; }
    return map;
  }, [materials]);

  const finalQty = (key: LineKey, base: number) => qtyOverride[key] ?? base;

  const adjust = (key: LineKey, base: number, delta: number) =>
    setQtyOverride(s => ({ ...s, [key]: Math.max(0, (s[key] ?? base) + delta) }));

  const setPreset = (r: RoomType) => {
    setRoom(r);
    setLength(ROOMS[r].L); setWidth(ROOMS[r].W); setHeight(ROOMS[r].H);
    setQtyOverride({});
  };

  const addAllToCart = async () => {
    const toAdd = lineItems.filter(li => finalQty(li.key, li.qty) > 0 && categoryToId[LINE_CATS[li.key]]);
    if (!toAdd.length) { toast.error("Nothing to add"); return; }
    setSubmitting(true);
    let added = 0;
    for (const li of toAdd) {
      const qty = finalQty(li.key, li.qty);
      const matQty = li.key === "bricks" ? Math.max(1, Math.ceil(qty / 1000)) : Math.max(1, Math.ceil(qty));
      try {
        await addToCart.mutateAsync({ data: { materialId: categoryToId[LINE_CATS[li.key]], quantity: matQty } });
        added++;
      } catch { toast.error(`Couldn't add ${li.label}`); }
    }
    setSubmitting(false);
    if (added > 0) {
      toast.success(`${added} items added to cart`, {
        description: `${ROOMS[room].label} · ${floors} floor${floors > 1 ? "s" : ""} · ${PROJECTS.find(p => p.id === project)?.label}`,
      });
      setLocation("/home");
    }
  };

  const stepTitles = ["Project Setup", "Dimensions", "Material Review"];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pb-28">

        {/* ── Header ────────────────────────────────────────────── */}
        <div className="px-4 pt-5 pb-5 text-white relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #1e40af 100%)` }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 0%, transparent 50%)" }} />
          <button onClick={() => setLocation("/home")}
            className="flex items-center gap-1.5 text-blue-200 mb-4 text-xs font-bold hover:text-white transition">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-white/15 p-2.5 rounded-2xl backdrop-blur-sm">
              <Cpu className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h1 className="font-black text-xl uppercase tracking-wide">AI Estimator</h1>
              <p className="text-blue-200 text-[11px] font-bold flex items-center gap-1 mt-0.5">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Auto-calculate exact materials for your project
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex gap-2 mt-4">
            {stepTitles.map((t, i) => (
              <button key={i} onClick={() => setActiveStep(i as 0|1|2)}
                className={`flex-1 text-center py-1.5 rounded-xl text-[10px] font-black transition-all ${activeStep === i ? "bg-white text-blue-900" : "bg-white/15 text-white/70"}`}>
                {i + 1}. {t}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 pt-4 space-y-4">

          {/* ── Step 0: Project Setup ─────────────────────────── */}
          <AnimatePresence mode="wait">
            {activeStep === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">

                {/* Project type */}
                <div className="bg-white rounded-2xl p-4 border border-gray-200">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Project Type</p>
                  <div className="space-y-2">
                    {PROJECTS.map(p => {
                      const Icon = p.icon;
                      return (
                        <button key={p.id} onClick={() => setProject(p.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${project === p.id ? "border-blue-600 bg-blue-50" : "border-gray-100 hover:border-gray-200"}`}>
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${project === p.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className={`text-sm font-black ${project === p.id ? "text-blue-900" : "text-gray-800"}`}>{p.label}</p>
                            <p className="text-[11px] text-gray-400">{p.desc} · {Math.round(p.multiplier * 100)}% material load</p>
                          </div>
                          {project === p.id && <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: BRAND }}><span className="text-white text-[8px] font-black">✓</span></div>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Floors */}
                <div className="bg-white rounded-2xl p-4 border border-gray-200">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Number of Floors</p>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setFloors(f => Math.max(1, f - 1))}
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-black text-gray-600 hover:bg-gray-200">
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="flex-1 text-center">
                      <p className="text-4xl font-black" style={{ color: BRAND }}>{floors}</p>
                      <p className="text-[10px] text-gray-400 font-bold">Floor{floors > 1 ? "s" : ""}</p>
                    </div>
                    <button onClick={() => setFloors(f => Math.min(10, f + 1))}
                      className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white" style={{ background: BRAND }}>
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Room type */}
                <div className="bg-white rounded-2xl p-4 border border-gray-200">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Room / Space Type</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.entries(ROOMS) as [RoomType, typeof ROOMS[RoomType]][]).map(([r, info]) => (
                      <button key={r} onClick={() => setPreset(r)}
                        className={`py-3 px-2 rounded-xl flex flex-col items-center gap-1 text-center transition-all border ${room === r ? "border-blue-600 bg-blue-50" : "border-gray-100 bg-white hover:border-gray-200"}`}>
                        <span className="text-xl">{info.icon}</span>
                        <p className={`text-[10px] font-black leading-tight ${room === r ? "text-blue-900" : "text-gray-600"}`}>{info.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={() => setActiveStep(1)}
                  className="w-full py-3.5 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2"
                  style={{ background: BRAND }}>
                  Next: Enter Dimensions <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* ── Step 1: Dimensions ─────────────────────────── */}
            {activeStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">

                <div className="bg-white rounded-2xl p-4 border border-gray-200">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Room Dimensions (feet)</p>
                  <div className="space-y-3">
                    {[
                      { label: "Length", value: length, set: setLength, hint: "Longer wall" },
                      { label: "Width",  value: width,  set: setWidth,  hint: "Shorter wall" },
                      { label: "Height", value: height, set: setHeight, hint: "Floor to ceiling" },
                    ].map(f => (
                      <div key={f.label} className="flex items-center gap-4">
                        <div className="w-20">
                          <p className="text-xs font-black text-gray-700">{f.label}</p>
                          <p className="text-[9px] text-gray-400">{f.hint}</p>
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                          <button onClick={() => { f.set(Math.max(1, f.value - 1)); setQtyOverride({}); }}
                            className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center font-black text-gray-600">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input type="number" min="1" step="0.5" value={f.value}
                            onChange={e => { f.set(parseFloat(e.target.value) || 1); setQtyOverride({}); }}
                            className="flex-1 text-center bg-gray-50 border border-gray-200 rounded-xl py-2 font-black text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                          <button onClick={() => { f.set(f.value + 1); setQtyOverride({}); }}
                            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white" style={{ background: BRAND }}>
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-gray-400 w-5">ft</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Area summary card */}
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 grid grid-cols-3 gap-3">
                  {[
                    { label: "Wall Area",  value: est.wallArea,  unit: "sq.ft" },
                    { label: "Floor Area", value: est.floorArea, unit: "sq.ft" },
                    { label: "Total Area", value: est.wallArea + est.floorArea, unit: "sq.ft" },
                  ].map(s => (
                    <div key={s.label} className="text-center">
                      <p className="text-[9px] font-black text-blue-500 uppercase">{s.label}</p>
                      <p className="text-xl font-black" style={{ color: BRAND }}>{s.value.toLocaleString("en-IN")}</p>
                      <p className="text-[9px] text-blue-400">{s.unit}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setActiveStep(0)}
                    className="flex-1 py-3.5 rounded-2xl font-black text-sm border-2 text-gray-600" style={{ borderColor: BRAND }}>
                    ← Back
                  </button>
                  <button onClick={() => setActiveStep(2)}
                    className="flex-1 py-3.5 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2"
                    style={{ background: BRAND }}>
                    View Estimate <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Material Review ────────────────────── */}
            {activeStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-3">

                {/* Summary pill */}
                <div className="flex items-center gap-2 bg-green-50 rounded-2xl px-4 py-2.5 border border-green-100">
                  <span className="text-base">{ROOMS[room].icon}</span>
                  <p className="flex-1 text-xs font-black text-green-800">
                    {ROOMS[room].label} · {length}×{width}×{height} ft · {floors} floor{floors > 1 ? "s" : ""} · {PROJECTS.find(p => p.id === project)?.label}
                  </p>
                  <button onClick={() => setActiveStep(0)} className="text-[10px] font-black text-green-600">Edit</button>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-semibold">Calculating…</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {lineItems.map((li, idx) => {
                      const qty = finalQty(li.key, li.qty);
                      const inStock = !!categoryToId[LINE_CATS[li.key]];
                      const step = li.key === "bricks" ? 500 : li.key === "steel" ? 50 : 1;
                      return (
                        <motion.div key={li.key}
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`bg-white rounded-2xl p-4 border flex items-center gap-3 ${inStock ? "border-gray-200" : "border-gray-100 opacity-60"}`}>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-gray-800">{li.label}</p>
                            <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                              {inStock ? `Suggested: ${li.qty.toLocaleString("en-IN")} ${li.unit}` : "Not available in your area"}
                            </p>
                          </div>
                          {inStock ? (
                            <div className="flex items-center gap-2 shrink-0">
                              <button onClick={() => adjust(li.key, li.qty, -step)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200">
                                <Minus className="w-3 h-3" />
                              </button>
                              <div className="text-center w-20">
                                <p className="font-black text-sm" style={{ color: BRAND }}>{qty.toLocaleString("en-IN")}</p>
                                <p className="text-[8px] text-gray-400">{li.unit}</p>
                              </div>
                              <button onClick={() => adjust(li.key, li.qty, step)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ background: BRAND }}>
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] font-black text-gray-400 shrink-0">Out of stock</span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                <button onClick={() => setActiveStep(1)}
                  className="w-full py-2.5 rounded-xl text-sm font-black text-gray-500 border border-gray-200">
                  ← Adjust Dimensions
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Sticky CTA ──────────────────────────────────────────── */}
        {activeStep === 2 && (
          <div className="fixed bottom-16 left-0 right-0 px-4 pb-2 bg-gradient-to-t from-gray-50 to-transparent pt-4">
            <button onClick={addAllToCart} disabled={submitting || isLoading}
              className="w-full py-4 rounded-2xl text-white font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg"
              style={{ background: GREEN, boxShadow: "0 4px 20px rgba(42,122,59,0.35)" }}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />}
              {submitting ? "Adding to Cart…" : "Add Estimate to Cart →"}
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
