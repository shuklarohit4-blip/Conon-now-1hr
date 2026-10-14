import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import {
  ArrowLeft, Compass, Ruler, Building2, Layers, Grid3x3, Zap,
  FileDown, ShieldCheck, PackageCheck, Cpu, ChevronRight,
} from "lucide-react";

/* ───────────────────────── palette (blueprint / CAD) ───────────────────────── */
const BG = "#001A33";
const BG2 = "#04223f";
const LINE = "#bfe6ff";
const CYAN = "#22d3ee";
const GRIDLINE = "#1d4b78";
const AMBER = "#f59e0b";
const NEON = "#84cc16";
const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

const FT_PER_M = 3.28084;
const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
const lakh = (n: number) => "₹" + (n / 100000).toFixed(2) + " L";

/* feet → architectural feet-inch string e.g. 12'-6" */
function ftIn(ft: number): string {
  const f = Math.floor(ft);
  let inch = Math.round((ft - f) * 12);
  let ff = f;
  if (inch === 12) { ff += 1; inch = 0; }
  return `${ff}'-${inch}"`;
}

type Unit = "ft" | "m";
type SystemType = "RCC" | "LB";

interface Inputs {
  plotX: number;   // width  (east-west)
  plotY: number;   // depth  (north-south)
  unit: Unit;
  road: number;    // road width
  front: number;   // front setback (south)
  rear: number;    // rear setback (north)
  side: number;    // side setback (east+west)
  north: number;   // true-north rotation 0..360
  system: SystemType;
  far: number;     // floor area ratio
}

/* ──────────── Vastu-zoned room program (fractions of buildable footprint) ────────────
   Origin top-left; TOP = North, BOTTOM = South, LEFT = West, RIGHT = East.
   Tiles the rectangle perfectly (rows sum to 1.0, each row's columns sum to 1.0). */
type Edge = "N" | "S" | "E" | "W";
interface RoomDef {
  key: string; name: string; type: "bed" | "bath" | "pooja" | "stair" | "living" | "foyer" | "kitchen";
  fx: number; fy: number; fw: number; fh: number;
  door: { edge: Edge; at: number; main?: boolean } | null;
  win: Edge[];
  zone: string;
}
const ROOMS: RoomDef[] = [
  { key: "bed2",    name: "Bedroom 2",      type: "bed",     fx: 0,    fy: 0,    fw: 0.42, fh: 0.30, door: { edge: "S", at: 0.72 }, win: ["W", "N"], zone: "NW" },
  { key: "toilet",  name: "Toilet",         type: "bath",    fx: 0.42, fy: 0,    fw: 0.20, fh: 0.30, door: { edge: "S", at: 0.5 },  win: ["N"],      zone: "N"  },
  { key: "pooja",   name: "Pooja Room",     type: "pooja",   fx: 0.62, fy: 0,    fw: 0.38, fh: 0.30, door: { edge: "S", at: 0.3 },  win: ["N", "E"], zone: "NE" },
  { key: "stair",   name: "Staircase",      type: "stair",   fx: 0,    fy: 0.30, fw: 0.24, fh: 0.40, door: null,                    win: ["W"],      zone: "W"  },
  { key: "living",  name: "Living / Dining", type: "living", fx: 0.24, fy: 0.30, fw: 0.50, fh: 0.40, door: null,                    win: [],         zone: "Brahmasthan" },
  { key: "foyer",   name: "Foyer / Entry",  type: "foyer",   fx: 0.74, fy: 0.30, fw: 0.26, fh: 0.40, door: { edge: "E", at: 0.5, main: true }, win: [], zone: "E" },
  { key: "master",  name: "Master Bedroom", type: "bed",     fx: 0,    fy: 0.70, fw: 0.50, fh: 0.30, door: { edge: "N", at: 0.7 },  win: ["W", "S"], zone: "SW" },
  { key: "kitchen", name: "Kitchen",        type: "kitchen", fx: 0.50, fy: 0.70, fw: 0.50, fh: 0.30, door: { edge: "N", at: 0.22 }, win: ["E", "S"], zone: "SE" },
];

/* ───────────────────────── geometry builder (the core engine) ───────────────────────── */
const PAD = 86;
const ROAD_H = 40;
const TITLE_H = 86;

function buildPlan(inp: Inputs) {
  const k = inp.unit === "m" ? FT_PER_M : 1;
  const plotXft = inp.plotX * k;
  const plotYft = inp.plotY * k;
  const rawSide = inp.side * k;
  const rawFront = inp.front * k;
  const rawRear = inp.rear * k;

  // Clamp setbacks RELATIVE to plot size so the buildable footprint always
  // stays inside the plot boundary (keeps the blueprint mathematically sound).
  const MIN_BUILD = 6; // ft — minimum buildable dimension
  const sideFt = Math.max(0, Math.min(rawSide, (plotXft - MIN_BUILD) / 2));
  let frontFt = Math.max(0, rawFront);
  let rearFt = Math.max(0, rawRear);
  if (frontFt + rearFt > plotYft - MIN_BUILD) {
    const avail = Math.max(0, plotYft - MIN_BUILD);
    const sum = frontFt + rearFt || 1;
    frontFt = (frontFt / sum) * avail;
    rearFt = (rearFt / sum) * avail;
  }
  const clamped =
    Math.abs(sideFt - rawSide) > 0.01 ||
    Math.abs(frontFt - rawFront) > 0.01 ||
    Math.abs(rearFt - rawRear) > 0.01;

  // buildable footprint (feet)
  const Wft = Math.max(MIN_BUILD, plotXft - 2 * sideFt);
  const Hft = Math.max(MIN_BUILD, plotYft - frontFt - rearFt);

  // scale: normalise plot width to a fixed on-screen size for consistent text
  const S = 880 / plotXft;
  const plotPxW = plotXft * S;
  const plotPxH = plotYft * S;

  // plot origin
  const PX = PAD, PY = PAD;
  // buildable origin (inset by setbacks)
  const BX = PX + sideFt * S;
  const BY = PY + rearFt * S;
  const BW = Wft * S;
  const BH = Hft * S;

  const doorW = Math.min(3 * S, 0.5 * Math.min(BW, BH));
  const winW = 4 * S;

  // rooms in px
  const rooms = ROOMS.map((r) => {
    const rx = BX + r.fx * BW;
    const ry = BY + r.fy * BH;
    const rw = r.fw * BW;
    const rh = r.fh * BH;
    const wFt = r.fw * Wft;
    const hFt = r.fh * Hft;
    return { ...r, rx, ry, rw, rh, wFt, hFt };
  });

  // doors → arc geometry
  type DoorGeo = { hx: number; hy: number; ox: number; oy: number; cx: number; cy: number; sweep: number; main?: boolean; lx: number; ly: number };
  const doors: DoorGeo[] = [];
  for (const r of rooms) {
    if (!r.door) continue;
    const { edge, at, main } = r.door;
    let hx = 0, hy = 0, wall: [number, number] = [0, 0], ind: [number, number] = [0, 0];
    if (edge === "N") { hx = r.rx + at * r.rw; hy = r.ry; wall = [-1, 0]; ind = [0, 1]; }
    if (edge === "S") { hx = r.rx + at * r.rw; hy = r.ry + r.rh; wall = [-1, 0]; ind = [0, -1]; }
    if (edge === "W") { hx = r.rx; hy = r.ry + at * r.rh; wall = [0, -1]; ind = [1, 0]; }
    if (edge === "E") { hx = r.rx + r.rw; hy = r.ry + at * r.rh; wall = [0, -1]; ind = main ? [1, 0] : [-1, 0]; }
    const cx = hx + wall[0] * doorW; // closed jamb (along wall)
    const cy = hy + wall[1] * doorW;
    const ox = hx + ind[0] * doorW;  // open leaf tip (into room)
    const oy = hy + ind[1] * doorW;
    // sweep flag chosen so arc bulges toward the interior
    const cross = wall[0] * ind[1] - wall[1] * ind[0];
    const sweep = cross > 0 ? 1 : 0;
    doors.push({ hx, hy, ox, oy, cx, cy, sweep, main, lx: hx, ly: hy });
  }

  // windows → segments on exterior edges
  type WinGeo = { x1: number; y1: number; x2: number; y2: number; horiz: boolean };
  const windows: WinGeo[] = [];
  for (const r of rooms) {
    for (const e of r.win) {
      const len = e === "N" || e === "S" ? Math.min(winW, r.rw * 0.6) : Math.min(winW, r.rh * 0.6);
      if (e === "N") { const cx = r.rx + r.rw / 2; windows.push({ x1: cx - len / 2, y1: r.ry, x2: cx + len / 2, y2: r.ry, horiz: true }); }
      if (e === "S") { const cx = r.rx + r.rw / 2; windows.push({ x1: cx - len / 2, y1: r.ry + r.rh, x2: cx + len / 2, y2: r.ry + r.rh, horiz: true }); }
      if (e === "W") { const cy = r.ry + r.rh / 2; windows.push({ x1: r.rx, y1: cy - len / 2, x2: r.rx, y2: cy + len / 2, horiz: false }); }
      if (e === "E") { const cy = r.ry + r.rh / 2; windows.push({ x1: r.rx + r.rw, y1: cy - len / 2, x2: r.rx + r.rw, y2: cy + len / 2, horiz: false }); }
    }
  }

  // structural column grid (≤ 5 m / ~16 ft span)
  const maxSpan = 16;
  const nx = Math.max(1, Math.ceil(Wft / maxSpan));
  const ny = Math.max(1, Math.ceil(Hft / maxSpan));
  const colXs = Array.from({ length: nx + 1 }, (_, i) => BX + (i * BW) / nx);
  const colYs = Array.from({ length: ny + 1 }, (_, i) => BY + (i * BH) / ny);
  const colSize = Math.max(7, 0.85 * S);

  // total drawing size
  const vbW = PAD + plotPxW + PAD;
  const dimGap = 30;
  const roadY = PY + plotPxH + dimGap + 14;
  const titleY = roadY + ROAD_H + 16;
  const vbH = titleY + TITLE_H + 18;

  return {
    Wft, Hft, plotXft, plotYft, S, PX, PY, plotPxW, plotPxH,
    BX, BY, BW, BH, rooms, doors, windows,
    colXs, colYs, colSize, nx, ny,
    vbW, vbH, dimGap, roadY, titleY, sideFt, frontFt, rearFt, clamped,
  };
}

type Plan = ReturnType<typeof buildPlan>;

/* ───────────────────────── BOQ (bill of quantities) ───────────────────────── */
function buildBOQ(plan: Plan, inp: Inputs) {
  const footprint = plan.Wft * plan.Hft;              // sq ft
  const plotArea = plan.plotXft * plan.plotYft;       // sq ft
  const permissible = inp.far * plotArea;
  const floors = Math.min(5, Math.max(1, Math.round(permissible / Math.max(footprint, 1))));
  const builtUp = footprint * floors;                 // sq ft

  const rcc = inp.system === "RCC";
  const concrete = builtUp * (rcc ? 0.041 : 0.030);   // cu.m M25
  const steel = (builtUp * (rcc ? 4.2 : 2.4)) / 1000; // metric tons Fe550
  const bricks = Math.round(builtUp * 8.5);           // nos
  const cement = Math.round(builtUp * 0.42);          // bags
  const ratePerSqft = rcc ? 1850 : 1650;
  // cart line price is stored as decimal(10,2) and validated ≤ 1,00,00,000 (₹100 L);
  // clamp so the displayed value always matches what is added to the cart.
  const kitTotal = Math.min(10_000_000, Math.round(builtUp * ratePerSqft));

  return { footprint, plotArea, floors, builtUp, concrete, steel, bricks, cement, kitTotal };
}

/* ───────────────────────── Vastu processing animation (Module 2) ───────────────────────── */
const VASTU_STEPS = [
  { cell: 2, color: "#38bdf8", el: "Water · Jal", txt: "Mapping Water Element (Ishanya / North-East) for underground tank & porch…" },
  { cell: 8, color: "#f97316", el: "Fire · Agni", txt: "Locating Fire Element (Agneya / South-East) for the kitchen…" },
  { cell: 6, color: "#a16207", el: "Earth · Prithvi", txt: "Securing Earth Element (Nairutya / South-West) for the master bedroom…" },
  { cell: 4, color: "#84cc16", el: "Ether · Akash", txt: "Calculating column spans (max 5 m) around the Brahmasthan (centre)…" },
];

function VastuProcessing({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timers: number[] = [];
    for (let i = 1; i < VASTU_STEPS.length; i++) {
      timers.push(window.setTimeout(() => setStep(i), i * 1000));
    }
    timers.push(window.setTimeout(onDone, VASTU_STEPS.length * 1000));
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  const active = VASTU_STEPS[step];
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center px-6"
      style={{ background: "rgba(0,12,26,0.96)", backdropFilter: "blur(4px)" }}
    >
      <div className="flex items-center gap-2 mb-5">
        <Cpu className="w-5 h-5 animate-pulse" style={{ color: CYAN }} />
        <span className="font-black tracking-[0.25em] text-xs uppercase" style={{ color: CYAN }}>Vastu Purusha Mandala</span>
      </div>

      {/* 3x3 grid */}
      <div className="grid grid-cols-3 gap-1.5 w-[230px] h-[230px]">
        {Array.from({ length: 9 }).map((_, i) => {
          const on = active.cell === i;
          const passed = VASTU_STEPS.slice(0, step).some((s) => s.cell === i);
          return (
            <motion.div
              key={i}
              animate={{ scale: on ? 1.04 : 1 }}
              className="rounded-lg border flex items-center justify-center text-[8px] font-black"
              style={{
                borderColor: on ? active.color : passed ? "rgba(132,204,22,0.5)" : "rgba(34,211,238,0.18)",
                background: on ? `${active.color}26` : passed ? "rgba(132,204,22,0.08)" : "rgba(34,211,238,0.04)",
                color: on ? active.color : "rgba(191,230,255,0.35)",
                boxShadow: on ? `0 0 22px -2px ${active.color}` : "none",
              }}
            >
              {i === 4 ? "BRAHMA" : ""}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 text-center max-w-[330px]">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: active.color }} />
          <span className="text-[11px] font-black tracking-widest uppercase" style={{ color: active.color }}>{active.el}</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="text-[12.5px] leading-relaxed font-semibold"
            style={{ color: LINE, fontFamily: MONO }}
          >
            {active.txt}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* progress */}
      <div className="mt-6 w-[230px] h-1 rounded-full overflow-hidden" style={{ background: "rgba(34,211,238,0.15)" }}>
        <motion.div
          initial={{ width: "0%" }} animate={{ width: "100%" }}
          transition={{ duration: VASTU_STEPS.length, ease: "linear" }}
          className="h-full" style={{ background: `linear-gradient(90deg, ${CYAN}, ${NEON})` }}
        />
      </div>
      <p className="mt-3 text-[9px] tracking-widest uppercase font-bold" style={{ color: "rgba(191,230,255,0.4)" }}>
        Generating mathematically-sound blueprint
      </p>
    </motion.div>
  );
}

/* ───────────────────────── SVG blueprint renderer (Module 3) ───────────────────────── */
function Blueprint({ plan, inp, svgRef }: { plan: Plan; inp: Inputs; svgRef: React.RefObject<SVGSVGElement | null> }) {
  const { PX, PY, plotPxW, plotPxH, BX, BY, BW, BH, rooms, doors, windows, colXs, colYs, colSize } = plan;
  const rcc = inp.system === "RCC";
  const extW = rcc ? 5 : 7;   // exterior wall stroke (230mm / heavier for load bearing)
  const intW = 2;             // interior wall stroke (115mm)
  const letters = "ABCDEFGH".split("");

  const bathFill = "url(#wetHatch)";
  const fillFor = (t: string) =>
    t === "bath" ? bathFill :
    t === "living" ? "rgba(34,211,238,0.06)" :
    t === "pooja" ? "rgba(245,158,11,0.08)" :
    t === "kitchen" ? "rgba(249,115,22,0.06)" :
    "rgba(34,211,238,0.03)";

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${plan.vbW} ${plan.vbH}`}
      width="100%"
      style={{ display: "block", background: BG, fontFamily: MONO }}
    >
      <defs>
        <pattern id="wetHatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="7" stroke="rgba(34,211,238,0.45)" strokeWidth="0.8" />
        </pattern>
        <pattern id="roadHatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="9" stroke="rgba(191,230,255,0.18)" strokeWidth="0.8" />
        </pattern>
        <pattern id="bgGrid" width="26" height="26" patternUnits="userSpaceOnUse">
          <path d="M26 0 L0 0 0 26" fill="none" stroke="rgba(34,211,238,0.06)" strokeWidth="0.6" />
        </pattern>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0,1 L7,4 L0,7" fill="none" stroke={CYAN} strokeWidth="1" />
        </marker>
      </defs>

      {/* drafting background grid */}
      <rect x="0" y="0" width={plan.vbW} height={plan.vbH} fill="url(#bgGrid)" />

      {/* plot boundary (dashed) */}
      <rect x={PX} y={PY} width={plotPxW} height={plotPxH} fill="none" stroke={CYAN} strokeWidth="1.2" strokeDasharray="9 5" opacity="0.7" />

      {/* setback annotation lines */}
      <rect x={BX} y={BY} width={BW} height={BH} fill="none" stroke="rgba(132,204,22,0.35)" strokeWidth="0.8" strokeDasharray="3 3" />
      <text x={PX + plotPxW / 2} y={BY - 5} fill="rgba(132,204,22,0.85)" fontSize="10" textAnchor="middle">REAR SETBACK {ftIn(plan.rearFt)}</text>
      <text x={PX + plotPxW / 2} y={BY + BH + 13} fill="rgba(132,204,22,0.85)" fontSize="10" textAnchor="middle">FRONT SETBACK {ftIn(plan.frontFt)}</text>

      {/* structural grid + columns (RCC only) */}
      {rcc && colXs.map((x, i) => (
        <line key={`gx${i}`} x1={x} y1={BY - 18} x2={x} y2={BY + BH} stroke={GRIDLINE} strokeWidth="0.7" strokeDasharray="2 4" />
      ))}
      {rcc && colYs.map((y, i) => (
        <line key={`gy${i}`} x1={BX - 18} y1={y} x2={BX + BW} y2={y} stroke={GRIDLINE} strokeWidth="0.7" strokeDasharray="2 4" />
      ))}
      {rcc && colXs.map((x, i) => (
        <g key={`gl${i}`}>
          <circle cx={x} cy={BY - 24} r="7.5" fill="none" stroke={GRIDLINE} strokeWidth="0.8" />
          <text x={x} y={BY - 21} fill={CYAN} fontSize="9" textAnchor="middle">{letters[i] ?? "?"}</text>
        </g>
      ))}
      {rcc && colYs.map((y, i) => (
        <g key={`nl${i}`}>
          <circle cx={BX - 24} cy={y} r="7.5" fill="none" stroke={GRIDLINE} strokeWidth="0.8" />
          <text x={BX - 24} y={y + 3} fill={CYAN} fontSize="9" textAnchor="middle">{i + 1}</text>
        </g>
      ))}

      {/* room fills + interior walls */}
      {rooms.map((r) => (
        <rect key={`rf${r.key}`} x={r.rx} y={r.ry} width={r.rw} height={r.rh} fill={fillFor(r.type)} stroke={LINE} strokeWidth={intW} strokeLinejoin="miter" />
      ))}

      {/* exterior wall (thick) */}
      <rect x={BX} y={BY} width={BW} height={BH} fill="none" stroke={LINE} strokeWidth={extW} strokeLinejoin="miter" />

      {/* RCC columns (solid squares at grid intersections) */}
      {rcc && colXs.map((x, i) =>
        colYs.map((y, j) => (
          <rect key={`c${i}-${j}`} x={x - colSize / 2} y={y - colSize / 2} width={colSize} height={colSize} fill="#000000" stroke={CYAN} strokeWidth="1.1" />
        )),
      )}

      {/* windows (cut wall + glazing lines) */}
      {windows.map((w, i) => (
        <g key={`w${i}`}>
          <line x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2} stroke={BG} strokeWidth={extW + 1} />
          {w.horiz ? (
            <>
              <line x1={w.x1} y1={w.y1 - 1.6} x2={w.x2} y2={w.y2 - 1.6} stroke={CYAN} strokeWidth="1" />
              <line x1={w.x1} y1={w.y1 + 1.6} x2={w.x2} y2={w.y2 + 1.6} stroke={CYAN} strokeWidth="1" />
            </>
          ) : (
            <>
              <line x1={w.x1 - 1.6} y1={w.y1} x2={w.x2 - 1.6} y2={w.y2} stroke={CYAN} strokeWidth="1" />
              <line x1={w.x1 + 1.6} y1={w.y1} x2={w.x2 + 1.6} y2={w.y2} stroke={CYAN} strokeWidth="1" />
            </>
          )}
        </g>
      ))}

      {/* doors (swing arcs) */}
      {doors.map((d, i) => (
        <g key={`d${i}`}>
          <line x1={d.hx} y1={d.hy} x2={d.cx} y2={d.cy} stroke={BG} strokeWidth={extW + 1} />
          <path d={`M ${d.cx} ${d.cy} A ${Math.hypot(d.ox - d.hx, d.oy - d.hy)} ${Math.hypot(d.ox - d.hx, d.oy - d.hy)} 0 0 ${d.sweep} ${d.ox} ${d.oy}`}
            fill="none" stroke={d.main ? AMBER : "rgba(245,158,11,0.7)"} strokeWidth="1" strokeDasharray={d.main ? "0" : "2 2"} />
          <line x1={d.hx} y1={d.hy} x2={d.ox} y2={d.oy} stroke={d.main ? AMBER : "rgba(245,158,11,0.85)"} strokeWidth={d.main ? 1.6 : 1.2} />
          {d.main && <text x={d.ox + 6} y={d.oy + 3} fill={AMBER} fontSize="9">MAIN ENTRY</text>}
        </g>
      ))}

      {/* room labels (name + computed dimensions) */}
      {rooms.map((r) => (
        <g key={`lb${r.key}`} pointerEvents="none">
          <text x={r.rx + r.rw / 2} y={r.ry + r.rh / 2 - 4} fill={LINE} fontSize="11" fontWeight={700} textAnchor="middle">{r.name.toUpperCase()}</text>
          <text x={r.rx + r.rw / 2} y={r.ry + r.rh / 2 + 10} fill={CYAN} fontSize="10" textAnchor="middle">{ftIn(r.wFt)} × {ftIn(r.hFt)}</text>
          <text x={r.rx + r.rw / 2} y={r.ry + r.rh / 2 + 23} fill="rgba(132,204,22,0.7)" fontSize="8" textAnchor="middle">{r.zone}</text>
        </g>
      ))}

      {/* dimension line — overall plot width (bottom) */}
      <g>
        <line x1={PX} y1={PY + plotPxH + plan.dimGap} x2={PX + plotPxW} y2={PY + plotPxH + plan.dimGap} stroke={CYAN} strokeWidth="0.9" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
        <line x1={PX} y1={PY + plotPxH + plan.dimGap - 5} x2={PX} y2={PY + plotPxH + plan.dimGap + 5} stroke={CYAN} strokeWidth="0.9" />
        <line x1={PX + plotPxW} y1={PY + plotPxH + plan.dimGap - 5} x2={PX + plotPxW} y2={PY + plotPxH + plan.dimGap + 5} stroke={CYAN} strokeWidth="0.9" />
        <rect x={PX + plotPxW / 2 - 34} y={PY + plotPxH + plan.dimGap - 9} width="68" height="16" fill={BG} />
        <text x={PX + plotPxW / 2} y={PY + plotPxH + plan.dimGap + 3} fill={CYAN} fontSize="11" textAnchor="middle">{ftIn(plan.plotXft)}</text>
      </g>

      {/* dimension line — overall plot depth (right) */}
      <g>
        <line x1={PX + plotPxW + plan.dimGap} y1={PY} x2={PX + plotPxW + plan.dimGap} y2={PY + plotPxH} stroke={CYAN} strokeWidth="0.9" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
        <line x1={PX + plotPxW + plan.dimGap - 5} y1={PY} x2={PX + plotPxW + plan.dimGap + 5} y2={PY} stroke={CYAN} strokeWidth="0.9" />
        <line x1={PX + plotPxW + plan.dimGap - 5} y1={PY + plotPxH} x2={PX + plotPxW + plan.dimGap + 5} y2={PY + plotPxH} stroke={CYAN} strokeWidth="0.9" />
        <g transform={`translate(${PX + plotPxW + plan.dimGap + 4}, ${PY + plotPxH / 2}) rotate(90)`}>
          <rect x="-34" y="-9" width="68" height="16" fill={BG} />
          <text x="0" y="3" fill={CYAN} fontSize="11" textAnchor="middle">{ftIn(plan.plotYft)}</text>
        </g>
      </g>

      {/* road (front / south) */}
      <g>
        <rect x={PX} y={plan.roadY} width={plotPxW} height={ROAD_H} fill="url(#roadHatch)" stroke="rgba(191,230,255,0.3)" strokeWidth="0.8" />
        <text x={PX + plotPxW / 2} y={plan.roadY + ROAD_H / 2 + 4} fill={LINE} fontSize="11" textAnchor="middle" letterSpacing="2">
          {ftIn(inp.road * (inp.unit === "m" ? FT_PER_M : 1))} WIDE B.T. ROAD
        </text>
      </g>

      {/* north compass (rotated by true-north input) */}
      <g transform={`translate(${PX + plotPxW + 40}, ${PY - 6})`}>
        <circle cx="0" cy="0" r="22" fill={BG2} stroke={GRIDLINE} strokeWidth="1" />
        <g transform={`rotate(${-inp.north})`}>
          <path d="M0,-17 L5,4 L0,-1 L-5,4 Z" fill={CYAN} stroke={CYAN} strokeWidth="0.5" />
          <text x="0" y="-23" fill={CYAN} fontSize="9" textAnchor="middle" fontWeight={700}>N</text>
        </g>
      </g>

      {/* title block (CAD) */}
      <g>
        <rect x={PX} y={plan.titleY} width={plotPxW} height={TITLE_H} fill={BG2} stroke={GRIDLINE} strokeWidth="1" />
        <line x1={PX + plotPxW * 0.42} y1={plan.titleY} x2={PX + plotPxW * 0.42} y2={plan.titleY + TITLE_H} stroke={GRIDLINE} strokeWidth="0.8" />
        <line x1={PX + plotPxW * 0.72} y1={plan.titleY} x2={PX + plotPxW * 0.72} y2={plan.titleY + TITLE_H} stroke={GRIDLINE} strokeWidth="0.8" />
        {/* left cell */}
        <text x={PX + 14} y={plan.titleY + 24} fill={CYAN} fontSize="14" fontWeight={800} letterSpacing="1">CONON ARCH-GENIUS</text>
        <text x={PX + 14} y={plan.titleY + 42} fill={LINE} fontSize="9">Procedural Vastu Floor Plan · Ground Floor</text>
        <text x={PX + 14} y={plan.titleY + 60} fill="rgba(132,204,22,0.8)" fontSize="9">{inp.system === "RCC" ? "RCC FRAMED STRUCTURE" : "LOAD-BEARING STRUCTURE"}</text>
        <text x={PX + 14} y={plan.titleY + 76} fill="rgba(191,230,255,0.55)" fontSize="8">Not for construction · Schematic design intent</text>
        {/* middle cell */}
        <text x={PX + plotPxW * 0.42 + 12} y={plan.titleY + 22} fill="rgba(191,230,255,0.6)" fontSize="8">PLOT</text>
        <text x={PX + plotPxW * 0.42 + 12} y={plan.titleY + 36} fill={LINE} fontSize="11">{ftIn(plan.plotXft)} × {ftIn(plan.plotYft)}</text>
        <text x={PX + plotPxW * 0.42 + 12} y={plan.titleY + 58} fill="rgba(191,230,255,0.6)" fontSize="8">BUILT-UP / FLOOR</text>
        <text x={PX + plotPxW * 0.42 + 12} y={plan.titleY + 72} fill={LINE} fontSize="11">{Math.round(plan.Wft * plan.Hft).toLocaleString("en-IN")} SQ.FT</text>
        {/* right cell */}
        <text x={PX + plotPxW * 0.72 + 12} y={plan.titleY + 22} fill="rgba(191,230,255,0.6)" fontSize="8">N-ALIGN</text>
        <text x={PX + plotPxW * 0.72 + 12} y={plan.titleY + 36} fill={LINE} fontSize="11">{inp.north}°</text>
        <text x={PX + plotPxW * 0.72 + 12} y={plan.titleY + 58} fill="rgba(191,230,255,0.6)" fontSize="8">FAR / DRG</text>
        <text x={PX + plotPxW * 0.72 + 12} y={plan.titleY + 72} fill={LINE} fontSize="11">{inp.far.toFixed(1)} · AG-01</text>
      </g>
    </svg>
  );
}

/* ───────────────────────── input panel field helpers ───────────────────────── */
function NumField({ label, value, set, min, max, step = 1, suffix }: {
  label: string; value: number; set: (n: number) => void; min: number; max: number; step?: number; suffix?: string;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  return (
    <div>
      <label className="block text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: "rgba(191,230,255,0.6)" }}>{label}</label>
      <div className="flex items-center rounded-xl overflow-hidden" style={{ background: BG2, border: `1px solid ${GRIDLINE}` }}>
        <button onClick={() => set(clamp(value - step))} className="w-8 h-9 text-lg font-black active:scale-90 transition" style={{ color: CYAN }}>−</button>
        <input
          type="number" value={value}
          onChange={(e) => set(clamp(parseFloat(e.target.value) || min))}
          className="flex-1 min-w-0 bg-transparent text-center text-sm font-black outline-none"
          style={{ color: LINE, fontFamily: MONO }}
        />
        {suffix && <span className="text-[9px] font-bold pr-1.5" style={{ color: "rgba(191,230,255,0.45)" }}>{suffix}</span>}
        <button onClick={() => set(clamp(value + step))} className="w-8 h-9 text-lg font-black active:scale-90 transition" style={{ color: CYAN }}>+</button>
      </div>
    </div>
  );
}

/* ───────────────────────── main page ───────────────────────── */
export function ArchGenius() {
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const addToCart = useAddToCart({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() }) },
  });

  const [inp, setInp] = useState<Inputs>({
    plotX: 40, plotY: 60, unit: "ft", road: 30, front: 10, rear: 5, side: 3, north: 0, system: "RCC", far: 1.8,
  });
  const set = <K extends keyof Inputs>(k: K, v: Inputs[K]) => setInp((p) => ({ ...p, [k]: v }));

  const [phase, setPhase] = useState<"idle" | "processing" | "done">("idle");
  const svgRef = useRef<SVGSVGElement>(null);

  const plan = useMemo(() => buildPlan(inp), [inp]);
  const boq = useMemo(() => buildBOQ(plan, inp), [plan, inp]);

  const generate = () => setPhase("processing");

  // regenerate (recompute) when inputs change after first generation — keep result live
  useEffect(() => {
    if (phase === "done") { /* plan/boq already memoised, nothing to do */ }
  }, [inp, phase]);

  const exportCAD = () => {
    if (!svgRef.current) return;
    const xml = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${xml}`], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conon-archgenius-${inp.plotX}x${inp.plotY}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CAD blueprint exported", { description: "Vector .svg downloaded — open in any CAD viewer or print to PDF." });
  };

  const requestAnalysis = () =>
    toast("Structural analysis requested", {
      description: "Our RCC consultant will share the load-bearing & seismic report within 24 hours.",
      icon: <ShieldCheck className="w-4 h-4" style={{ color: CYAN }} />,
    });

  const orderKit = () => {
    addToCart.mutate(
      {
        data: {
          materialId: `archkit-${inp.plotX}x${inp.plotY}`,
          quantity: 1,
          name: `Custom ${inp.plotX}×${inp.plotY} ${inp.unit} Builder Kit · ${boq.floors}F`,
          price: boq.kitTotal,
          unit: "Design Kit",
          vendor: "Conon Arch-Genius",
          category: "design-kit",
        },
      },
      {
        onSuccess: () =>
          toast.success("Full Builder Kit added to cart!", {
            description: `${Math.round(boq.builtUp).toLocaleString("en-IN")} sq.ft turnkey kit · ${lakh(boq.kitTotal)}.`,
          }),
        onError: () => toast.error("Couldn't add the kit. Please try again."),
      },
    );
  };

  return (
    <Layout>
      <div className="min-h-full" style={{ background: BG }}>
        {/* page header */}
        <div className="px-5 pt-5 pb-5" style={{ background: `linear-gradient(160deg, ${BG2} 0%, ${BG} 100%)`, borderBottom: `1px solid ${GRIDLINE}` }}>
          <button onClick={() => setLocation("/home")} className="flex items-center gap-1.5 text-[11px] font-bold mb-3" style={{ color: "rgba(191,230,255,0.6)" }}>
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(34,211,238,0.12)", border: `1px solid ${GRIDLINE}` }}>
              <Compass className="w-5 h-5" style={{ color: CYAN }} strokeWidth={2.2} />
            </span>
            <div>
              <h2 className="font-display font-black italic text-2xl text-white leading-none">Arch-Genius Engine</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-1" style={{ color: CYAN }}>Procedural Vastu Floor-Plan AI</p>
            </div>
          </div>
          <p className="text-[12px] leading-snug mt-3" style={{ color: "rgba(191,230,255,0.7)" }}>
            Parametric, mathematically-sound blueprints with live Vastu zoning, RCC column grids & an
            instant Bill of Quantities — exportable to CAD.
          </p>
        </div>

        {/* MODULE 1 — parametric input panel */}
        <div className="px-4 mt-4">
          <div className="flex items-center gap-2 mb-2.5">
            <Ruler className="w-4 h-4" style={{ color: CYAN }} />
            <h3 className="font-display font-black text-sm text-white">Parametric Constraints</h3>
            <div className="ml-auto flex rounded-lg overflow-hidden" style={{ border: `1px solid ${GRIDLINE}` }}>
              {(["ft", "m"] as Unit[]).map((u) => (
                <button key={u} onClick={() => set("unit", u)} className="px-2.5 py-1 text-[10px] font-black uppercase"
                  style={{ background: inp.unit === u ? CYAN : "transparent", color: inp.unit === u ? BG : "rgba(191,230,255,0.6)" }}>
                  {u}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-4" style={{ background: BG2, border: `1px solid ${GRIDLINE}` }}>
            <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: "rgba(191,230,255,0.45)" }}>Plot Dimensions</p>
            <div className="grid grid-cols-2 gap-3">
              <NumField label="Width (X)" value={inp.plotX} set={(n) => set("plotX", n)} min={15} max={300} suffix={inp.unit} />
              <NumField label="Depth (Y)" value={inp.plotY} set={(n) => set("plotY", n)} min={15} max={300} suffix={inp.unit} />
            </div>

            <p className="text-[9px] font-black uppercase tracking-widest mt-4 mb-2" style={{ color: "rgba(191,230,255,0.45)" }}>Setbacks & Road</p>
            <div className="grid grid-cols-2 gap-3">
              <NumField label="Front Margin" value={inp.front} set={(n) => set("front", n)} min={0} max={50} suffix={inp.unit} />
              <NumField label="Rear Margin" value={inp.rear} set={(n) => set("rear", n)} min={0} max={50} suffix={inp.unit} />
              <NumField label="Side Margin" value={inp.side} set={(n) => set("side", n)} min={0} max={30} suffix={inp.unit} />
              <NumField label="Road Width" value={inp.road} set={(n) => set("road", n)} min={8} max={120} suffix={inp.unit} />
            </div>

            <p className="text-[9px] font-black uppercase tracking-widest mt-4 mb-2" style={{ color: "rgba(191,230,255,0.45)" }}>Orientation & Structure</p>
            {/* north alignment dial */}
            <label className="block text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: "rgba(191,230,255,0.6)" }}>
              True North Alignment · {inp.north}°
            </label>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: BG, border: `1px solid ${GRIDLINE}` }}>
                <span style={{ transform: `rotate(${inp.north}deg)`, color: CYAN, transition: "transform 0.2s" }}>
                  <Compass className="w-5 h-5" />
                </span>
              </span>
              <input type="range" min={0} max={360} value={inp.north} onChange={(e) => set("north", parseInt(e.target.value))}
                className="flex-1 accent-cyan-400" style={{ accentColor: CYAN }} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: "rgba(191,230,255,0.6)" }}>Structural System</label>
                <select value={inp.system} onChange={(e) => set("system", e.target.value as SystemType)}
                  className="w-full h-9 rounded-xl px-2 text-sm font-black outline-none"
                  style={{ background: BG, color: LINE, border: `1px solid ${GRIDLINE}`, fontFamily: MONO }}>
                  <option value="RCC">RCC Framed</option>
                  <option value="LB">Load Bearing</option>
                </select>
              </div>
              <NumField label="FAR" value={inp.far} set={(n) => set("far", n)} min={0.5} max={4} step={0.1} />
            </div>

            {plan.clamped && (
              <p className="mt-3 text-[10px] font-bold rounded-lg px-3 py-2 leading-snug"
                style={{ background: "rgba(245,158,11,0.12)", color: AMBER, border: "1px solid rgba(245,158,11,0.3)" }}>
                ⚠ Setbacks exceed the plot — auto-adjusted to keep a buildable footprint inside the boundary.
              </p>
            )}

            <button
              onClick={generate}
              className="w-full mt-4 py-3.5 rounded-2xl font-black flex items-center justify-center gap-2 active:scale-[0.98] transition"
              style={{ background: `linear-gradient(135deg, ${CYAN} 0%, #2563eb 100%)`, color: "#001022" }}
            >
              <Cpu className="w-4 h-4" /> {phase === "done" ? "Re-Generate Blueprint" : "Generate Blueprint"}
            </button>
          </div>
        </div>

        {/* MODULE 3 — blueprint + MODULE 4 — BOQ */}
        {phase === "done" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="px-4 mt-5">
            <div className="flex items-center gap-2 mb-2.5">
              <Building2 className="w-4 h-4" style={{ color: CYAN }} />
              <h3 className="font-display font-black text-sm text-white">Generated Blueprint</h3>
              <span className="ml-auto text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(132,204,22,0.15)", color: NEON }}>VASTU-COMPLIANT</span>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${GRIDLINE}` }}>
              <div className="overflow-x-auto">
                <Blueprint plan={plan} inp={inp} svgRef={svgRef} />
              </div>
            </div>

            {/* legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 px-1">
              <Legend swatch={<span className="w-4 h-[3px] rounded" style={{ background: LINE }} />} label="230mm Ext. Wall" />
              <Legend swatch={<span className="w-4 h-[1.5px] rounded" style={{ background: LINE }} />} label="115mm Partition" />
              <Legend swatch={<span className="w-2.5 h-2.5" style={{ background: "#000", outline: `1px solid ${CYAN}` }} />} label="RCC Column" />
              <Legend swatch={<span className="w-3 h-3 rounded-sm" style={{ background: AMBER }} />} label="Door Swing" />
              <Legend swatch={<span className="w-3 h-3" style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(34,211,238,0.75) 0 1px, transparent 1px 4px)", outline: `1px solid ${CYAN}` }} />} label="Wet Area" />
            </div>

            {/* MODULE 4 — BOQ */}
            <div className="flex items-center gap-2 mb-2.5 mt-5">
              <Layers className="w-4 h-4" style={{ color: CYAN }} />
              <h3 className="font-display font-black text-sm text-white">Bill of Quantities (Est.)</h3>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <BoqCard label="Built-up Area" value={`${Math.round(boq.builtUp).toLocaleString("en-IN")}`} unit={`sq.ft · ${boq.floors} floor${boq.floors > 1 ? "s" : ""}`} />
              <BoqCard label="M25 Concrete" value={boq.concrete.toFixed(1)} unit="cu.m volume" />
              <BoqCard label="Fe550 TMT Steel" value={boq.steel.toFixed(2)} unit="metric tons" />
              <BoqCard label="Cement" value={boq.cement.toLocaleString("en-IN")} unit="bags (OPC 53)" />
              <BoqCard label="Bricks / Blocks" value={boq.bricks.toLocaleString("en-IN")} unit="nos" />
              <BoqCard label="Structure" value={inp.system === "RCC" ? "RCC" : "Load Bear"} unit={`FAR ${inp.far.toFixed(1)}`} />
            </div>

            {/* action buttons */}
            <div className="mt-4 space-y-2.5 pb-6">
              <button onClick={orderKit} disabled={addToCart.isPending}
                className="w-full py-4 rounded-2xl font-black flex items-center justify-between px-5 active:scale-[0.98] transition disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${AMBER} 0%, #f97316 100%)`, color: "#1a0e00" }}>
                <span className="flex items-center gap-2"><PackageCheck className="w-5 h-5" /> Order Full Builder Kit</span>
                <span className="flex items-center gap-1">{lakh(boq.kitTotal)} <ChevronRight className="w-4 h-4" /></span>
              </button>
              <div className="grid grid-cols-2 gap-2.5">
                <button onClick={exportCAD}
                  className="py-3 rounded-2xl font-black flex items-center justify-center gap-1.5 text-[12px] active:scale-[0.98] transition"
                  style={{ background: BG2, color: CYAN, border: `1px solid ${GRIDLINE}` }}>
                  <FileDown className="w-4 h-4" /> Export CAD / PDF
                </button>
                <button onClick={requestAnalysis}
                  className="py-3 rounded-2xl font-black flex items-center justify-center gap-1.5 text-[12px] active:scale-[0.98] transition"
                  style={{ background: BG2, color: NEON, border: `1px solid ${GRIDLINE}` }}>
                  <ShieldCheck className="w-4 h-4" /> Load Analysis
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {phase === "idle" && (
          <div className="px-4 mt-6 pb-10 text-center">
            <Grid3x3 className="w-10 h-10 mx-auto mb-2" style={{ color: "rgba(34,211,238,0.4)" }} />
            <p className="text-[12px] font-semibold" style={{ color: "rgba(191,230,255,0.55)" }}>
              Set your plot constraints and tap <span style={{ color: CYAN }}>Generate Blueprint</span> to run the Vastu engine.
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {phase === "processing" && <VastuProcessing onDone={() => setPhase("done")} />}
      </AnimatePresence>
    </Layout>
  );
}

function Legend({ swatch, label }: { swatch: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      {swatch}
      <span className="text-[9px] font-bold" style={{ color: "rgba(191,230,255,0.6)" }}>{label}</span>
    </span>
  );
}

function BoqCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-2xl p-3" style={{ background: BG2, border: `1px solid ${GRIDLINE}` }}>
      <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: "rgba(191,230,255,0.5)" }}>{label}</p>
      <p className="font-black text-xl mt-1" style={{ color: LINE, fontFamily: MONO }}>{value}</p>
      <p className="text-[9px] font-bold" style={{ color: CYAN }}>{unit}</p>
    </div>
  );
}
