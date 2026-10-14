import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Sparkles, PencilRuler, Compass, Car, Download,
  Clapperboard, PackageCheck, Crown, RefreshCw, Cpu, Loader2, X,
} from "lucide-react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";

/* ── Palette (Blueprint Blue + Amber) ───────────────────────────── */
const BLUEPRINT = "#003366";
const BLUEPRINT_DEEP = "#001f3f";
const CYAN = "#38bdf8";
const AMBER = "#f59e0b";

/* ── Domain types ───────────────────────────────────────────────── */
type Facing = "East" | "West" | "North" | "South";
type Requirement = "1bhk" | "2bhk" | "3bhk";

const FACINGS: Facing[] = ["East", "West", "North", "South"];
const REQUIREMENTS: { id: Requirement; label: string; sub: string }[] = [
  { id: "1bhk", label: "1 BHK", sub: "Compact home" },
  { id: "2bhk", label: "2 BHK", sub: "Family home" },
  { id: "3bhk", label: "3 BHK Mansion", sub: "Premium villa" },
];

type RoomType =
  | "living" | "bedroom" | "kitchen" | "bath"
  | "dining" | "pooja" | "store" | "balcony" | "parking";

type Room = {
  key: string;
  label: string;
  type: RoomType;
  c1: number; c2: number; r1: number; r2: number;
};

/* Subtle fills layered over the navy so each zone reads distinctly while
   keeping the AutoCAD aesthetic (thin cyan lines, white labels). */
const ROOM_FILL: Record<RoomType, string> = {
  living:  "rgba(56,189,248,0.12)",
  bedroom: "rgba(255,255,255,0.06)",
  kitchen: "rgba(245,158,11,0.14)",
  bath:    "rgba(34,211,238,0.16)",
  dining:  "rgba(163,230,53,0.12)",
  pooja:   "rgba(245,158,11,0.10)",
  store:   "rgba(255,255,255,0.045)",
  balcony: "rgba(56,189,248,0.07)",
  parking: "rgba(245,158,11,0.07)",
};

/* ── Parametric layout builder ──────────────────────────────────── */
function buildLayout(req: Requirement, parking: boolean): {
  cols: number; rows: number; rooms: Room[];
} {
  let cols: number, rows: number, rooms: Room[];

  if (req === "1bhk") {
    cols = 2; rows = 3;
    rooms = [
      { key: "living",  label: "Living / Hall",   type: "living",  c1: 1, c2: 3, r1: 1, r2: 2 },
      { key: "bed",     label: "Master Bedroom",  type: "bedroom", c1: 1, c2: 2, r1: 2, r2: 3 },
      { key: "kitchen", label: "Kitchen",         type: "kitchen", c1: 2, c2: 3, r1: 2, r2: 3 },
      { key: "bath",    label: "Bathroom",        type: "bath",    c1: 1, c2: 2, r1: 3, r2: 4 },
      { key: "store",   label: "Store / Utility", type: "store",   c1: 2, c2: 3, r1: 3, r2: 4 },
    ];
  } else if (req === "2bhk") {
    cols = 3; rows = 3;
    rooms = [
      { key: "living",  label: "Living / Hall",  type: "living",  c1: 1, c2: 3, r1: 1, r2: 2 },
      { key: "master",  label: "Master Bedroom", type: "bedroom", c1: 3, c2: 4, r1: 1, r2: 2 },
      { key: "kitchen", label: "Kitchen",        type: "kitchen", c1: 1, c2: 2, r1: 2, r2: 3 },
      { key: "dining",  label: "Dining",         type: "dining",  c1: 2, c2: 3, r1: 2, r2: 3 },
      { key: "balcony", label: "Balcony",        type: "balcony", c1: 3, c2: 4, r1: 2, r2: 3 },
      { key: "bed2",    label: "Bedroom 2",      type: "bedroom", c1: 1, c2: 3, r1: 3, r2: 4 },
      { key: "bath",    label: "Bathroom",       type: "bath",    c1: 3, c2: 4, r1: 3, r2: 4 },
    ];
  } else {
    cols = 3; rows = 4;
    rooms = [
      { key: "living",  label: "Living / Hall",  type: "living",  c1: 1, c2: 3, r1: 1, r2: 2 },
      { key: "master",  label: "Master Bedroom", type: "bedroom", c1: 3, c2: 4, r1: 1, r2: 2 },
      { key: "dining",  label: "Dining",         type: "dining",  c1: 1, c2: 2, r1: 2, r2: 3 },
      { key: "kitchen", label: "Kitchen",        type: "kitchen", c1: 2, c2: 3, r1: 2, r2: 3 },
      { key: "bed2",    label: "Bedroom 2",      type: "bedroom", c1: 3, c2: 4, r1: 2, r2: 3 },
      { key: "bed3",    label: "Bedroom 3",      type: "bedroom", c1: 1, c2: 2, r1: 3, r2: 4 },
      { key: "bath1",   label: "Bathroom",       type: "bath",    c1: 2, c2: 3, r1: 3, r2: 4 },
      { key: "bath2",   label: "Common Bath",    type: "bath",    c1: 3, c2: 4, r1: 3, r2: 4 },
      { key: "pooja",   label: "Pooja Room",     type: "pooja",   c1: 1, c2: 2, r1: 4, r2: 5 },
      { key: "store",   label: "Store",          type: "store",   c1: 2, c2: 3, r1: 4, r2: 5 },
      { key: "balcony", label: "Balcony",        type: "balcony", c1: 3, c2: 4, r1: 4, r2: 5 },
    ];
  }

  if (parking) {
    rows += 1;
    rooms.push({
      key: "parking", label: "Car Parking", type: "parking",
      c1: 1, c2: cols + 1, r1: rows, r2: rows + 1,
    });
  }

  return { cols, rows, rooms };
}

type Plan = {
  layout: ReturnType<typeof buildLayout>;
  rooms: (Room & { w: number; h: number; area: number })[];
  builtUp: number;
  plotArea: number;
};

function computePlan(L: number, W: number, req: Requirement, parking: boolean): Plan {
  const layout = buildLayout(req, parking);
  const cellW = W / layout.cols;
  const cellH = L / layout.rows;
  const rooms = layout.rooms.map((r) => {
    const w = (r.c2 - r.c1) * cellW;
    const h = (r.r2 - r.r1) * cellH;
    return { ...r, w, h, area: w * h };
  });
  const builtUp = rooms
    .filter((r) => r.type !== "parking")
    .reduce((s, r) => s + r.area, 0);
  return { layout, rooms, builtUp, plotArea: L * W };
}

/* ── SVG blueprint (rendered on screen AND exported) ────────────── */
const PAD = 56;
const VBW = 1000;
const WALL = 7;   // load-bearing wall thickness (hatched band)
const COL = 13;   // RCC structural column size
const DW = 64;    // entrance door opening / swing radius

function BlueprintSvg({
  plan, L, W, facing, svgRef,
}: {
  plan: Plan; L: number; W: number; facing: Facing;
  svgRef?: React.Ref<SVGSVGElement>;
}) {
  const innerW = VBW - PAD * 2;
  const innerH = innerW * (L / W);
  const VBH = innerH + PAD * 2;
  const cellW = innerW / plan.layout.cols;
  const cellH = innerH / plan.layout.rows;

  // Plan extents and centre.
  const cx = PAD + innerW / 2;
  const cy = PAD + innerH / 2;
  const eR = PAD + innerW;   // right edge x
  const eB = PAD + innerH;   // bottom edge y

  // Entrance door swing on the facing edge: hinge (h), closed leaf (c) along
  // the wall, open leaf (o) swinging inward 90°. Drawn as an amber arc + leaf.
  const door =
    facing === "North" ? { hx: cx - DW / 2, hy: PAD, cxp: cx + DW / 2, cyp: PAD, ox: cx - DW / 2, oy: PAD + DW, sweep: 1, lx: cx, ly: PAD - 40, anchor: "middle" as const } :
    facing === "South" ? { hx: cx + DW / 2, hy: eB, cxp: cx - DW / 2, cyp: eB, ox: cx + DW / 2, oy: eB - DW, sweep: 1, lx: cx, ly: eB + 30, anchor: "middle" as const } :
    facing === "East"  ? { hx: eR, hy: cy + DW / 2, cxp: eR, cyp: cy - DW / 2, ox: eR - DW, oy: cy + DW / 2, sweep: 0, lx: eR + 12, ly: cy, anchor: "start" as const } :
                         { hx: PAD, hy: cy - DW / 2, cxp: PAD, cyp: cy + DW / 2, ox: PAD + DW, oy: cy - DW / 2, sweep: 0, lx: PAD - 12, ly: cy, anchor: "end" as const };

  // RCC structural columns: four corners + every internal grid intersection.
  const columns: { x: number; y: number }[] = [
    { x: PAD, y: PAD }, { x: eR, y: PAD }, { x: PAD, y: eB }, { x: eR, y: eB },
  ];
  for (let i = 1; i < plan.layout.cols; i++)
    for (let j = 1; j < plan.layout.rows; j++)
      columns.push({ x: PAD + i * cellW, y: PAD + j * cellH });

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VBW} ${VBH}`}
      width="100%"
      role="img"
      aria-label="Generated 2D floor plan blueprint"
      style={{ display: "block", borderRadius: 16 }}
    >
      <defs>
        <pattern id="sd-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="rgba(56,189,248,0.12)" strokeWidth="1" />
        </pattern>
        {/* Architectural 45° hatch for the load-bearing walls */}
        <pattern id="sd-wall" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="6" stroke={CYAN} strokeWidth="1.2" opacity="0.55" />
        </pattern>
      </defs>

      <rect x="0" y="0" width={VBW} height={VBH} fill={BLUEPRINT} />
      <rect x={PAD} y={PAD} width={innerW} height={innerH} fill="url(#sd-grid)" />

      {/* Rooms */}
      {plan.rooms.map((r) => {
        const x = PAD + (r.c1 - 1) * cellW;
        const y = PAD + (r.r1 - 1) * cellH;
        const rw = (r.c2 - r.c1) * cellW;
        const rh = (r.r2 - r.r1) * cellH;
        const inset = 4;
        const showDims = rh > 46 && rw > 92;
        return (
          <g key={r.key}>
            <rect
              x={x + inset} y={y + inset}
              width={rw - inset * 2} height={rh - inset * 2}
              fill={ROOM_FILL[r.type]}
              stroke={CYAN}
              strokeWidth="1.6"
              strokeDasharray={r.type === "parking" ? "7 5" : undefined}
              rx="3"
            />
            <text
              x={x + rw / 2} y={y + rh / 2 - (showDims ? 6 : 0)}
              fill="#ffffff" fontSize="15" fontWeight="700"
              textAnchor="middle" dominantBaseline="middle"
              fontFamily="'Outfit', sans-serif"
            >
              {r.label}
            </text>
            {showDims && (
              <text
                x={x + rw / 2} y={y + rh / 2 + 14}
                fill={CYAN} fontSize="11.5" fontWeight="600"
                textAnchor="middle" dominantBaseline="middle"
                fontFamily="'DM Sans', sans-serif"
              >
                {Math.round(r.w)}×{Math.round(r.h)} ft · {Math.round(r.area)} sq.ft
              </text>
            )}
          </g>
        );
      })}

      {/* Load-bearing wall ring (hatched band) drawn over room edges */}
      <g fill="url(#sd-wall)">
        <rect x={PAD} y={PAD} width={innerW} height={WALL} />
        <rect x={PAD} y={eB - WALL} width={innerW} height={WALL} />
        <rect x={PAD} y={PAD} width={WALL} height={innerH} />
        <rect x={eR - WALL} y={PAD} width={WALL} height={innerH} />
      </g>
      <rect
        x={PAD} y={PAD} width={innerW} height={innerH}
        fill="none" stroke="#ffffff" strokeWidth="3"
      />

      {/* RCC structural columns */}
      {columns.map((p, i) => (
        <rect
          key={i}
          x={p.x - COL / 2} y={p.y - COL / 2} width={COL} height={COL}
          fill="#ffffff" stroke={BLUEPRINT_DEEP} strokeWidth="1" rx="1.5"
        />
      ))}

      {/* Entrance door swing (amber arc + leaf) on the facing edge */}
      <path
        d={`M ${door.cxp} ${door.cyp} A ${DW} ${DW} 0 0 ${door.sweep} ${door.ox} ${door.oy}`}
        fill="none" stroke={AMBER} strokeWidth="1.6" strokeDasharray="3 3"
      />
      <line
        x1={door.hx} y1={door.hy} x2={door.ox} y2={door.oy}
        stroke={AMBER} strokeWidth="4" strokeLinecap="round"
      />
      <text
        x={door.lx} y={door.ly} fill={AMBER} fontSize="12" fontWeight="700"
        textAnchor={door.anchor} dominantBaseline="middle"
        fontFamily="'DM Sans', sans-serif"
      >
        ▸ ENTRY
      </text>

      {/* Professional dimensioning — top (width) with end ticks */}
      <g stroke="#cbd5e1" strokeWidth="1">
        <line x1={PAD} y1={PAD - 30} x2={eR} y2={PAD - 30} />
        <line x1={PAD} y1={PAD - 36} x2={PAD} y2={PAD - 24} />
        <line x1={eR} y1={PAD - 36} x2={eR} y2={PAD - 24} />
      </g>
      <text
        x={cx} y={PAD - 38} fill="#e2e8f0" fontSize="13" fontWeight="700"
        textAnchor="middle" fontFamily="'DM Sans', sans-serif"
      >
        {W}&apos;-0&quot;
      </text>

      {/* Professional dimensioning — left (length) with end ticks */}
      <g stroke="#cbd5e1" strokeWidth="1">
        <line x1={PAD - 30} y1={PAD} x2={PAD - 30} y2={eB} />
        <line x1={PAD - 36} y1={PAD} x2={PAD - 24} y2={PAD} />
        <line x1={PAD - 36} y1={eB} x2={PAD - 24} y2={eB} />
      </g>
      <text
        x={PAD - 38} y={cy} fill="#e2e8f0" fontSize="13" fontWeight="700"
        textAnchor="middle" fontFamily="'DM Sans', sans-serif"
        transform={`rotate(-90 ${PAD - 38} ${cy})`}
      >
        {L}&apos;-0&quot;
      </text>

      {/* Scale note */}
      <text
        x={PAD} y={VBH - 12} fill="#94a3b8" fontSize="11"
        fontFamily="monospace" letterSpacing="2"
      >
        SCALE 1:100
      </text>

      {/* Compass */}
      <g transform={`translate(${VBW - PAD - 6}, ${PAD / 2 + 4})`}>
        <circle r="17" fill={BLUEPRINT_DEEP} stroke={CYAN} strokeWidth="1.3" />
        <path d="M0 -12 L4 2 L0 -1 L-4 2 Z" fill={AMBER} />
        <text x="0" y="-19" fill="#fff" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="'DM Sans', sans-serif">N</text>
      </g>
    </svg>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */
type Phase = "form" | "processing" | "result";

export default function SmartDraftAI() {
  const [, setLocation] = useLocation();

  const [length, setLength] = useState(50);
  const [width, setWidth] = useState(30);
  const [facing, setFacing] = useState<Facing>("East");
  const [requirement, setRequirement] = useState<Requirement>("2bhk");
  const [parking, setParking] = useState(true);

  const [phase, setPhase] = useState<Phase>("form");
  const [msgIdx, setMsgIdx] = useState(0);
  const [showPremium, setShowPremium] = useState(false);

  // Snapshot of the inputs the current blueprint was generated from.
  const [drafted, setDrafted] = useState<{
    L: number; W: number; facing: Facing; requirement: Requirement; parking: boolean;
  } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const reqLabel = REQUIREMENTS.find((r) => r.id === requirement)!.label;

  const processingMsgs = useMemo(() => [
    `Calculating Vastu logic for ${facing}-facing plot…`,
    `Optimizing structural load-bearing walls…`,
    `Allocating ${reqLabel} spatial grid across ${(length * width).toLocaleString("en-IN")} sq ft…`,
    parking ? `Reserving car-parking & porch setback…` : `Optimizing open-area & light setbacks…`,
    `Rendering blueprint…`,
  ], [facing, reqLabel, length, width, parking]);

  const plan = useMemo(
    () => drafted
      ? computePlan(drafted.L, drafted.W, drafted.requirement, drafted.parking)
      : null,
    [drafted],
  );

  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  const valid = length > 0 && width > 0;

  const generate = () => {
    if (!valid) { toast.error("Enter valid plot length & width"); return; }
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setMsgIdx(0);
    setPhase("processing");

    // Cycle the calculating text every 800ms, reveal after 3.5s.
    const total = processingMsgs.length;
    for (let i = 1; i < 6; i++) {
      timers.current.push(setTimeout(() => setMsgIdx(i % total), i * 800));
    }
    timers.current.push(setTimeout(() => {
      setDrafted({ L: length, W: width, facing, requirement, parking });
      setPhase("result");
      toast.success("Blueprint ready!", { description: `${reqLabel} · ${facing}-facing · ${(length * width).toLocaleString("en-IN")} sq ft` });
    }, 3500));
  };

  const startOver = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setDrafted(null);
    setPhase("form");
  };

  const downloadPdf = () => {
    const svg = svgRef.current;
    if (!svg || !plan || !drafted) return;
    const markup = new XMLSerializer().serializeToString(svg);
    const title = `CONON Smart-Draft — ${reqLabel} (${drafted.L}×${drafted.W} ft)`;
    const win = window.open("", "_blank");
    if (!win) {
      // Popup blocked → fall back to a real downloadable SVG file.
      const blob = new Blob([markup], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "conon-smart-draft.svg";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Blueprint downloaded (SVG)");
      return;
    }
    win.document.write(`<!doctype html><html><head><title>${title}</title>
      <meta charset="utf-8" />
      <style>
        @page { size: A4 landscape; margin: 12mm; }
        body { margin:0; font-family: 'DM Sans', system-ui, sans-serif; background:#fff; color:#003366; }
        h1 { font-size:18px; margin:0 0 4px; }
        p { margin:0 0 14px; font-size:12px; color:#475569; }
        .wrap { padding:18px; }
        svg { width:100%; height:auto; max-height:78vh; }
      </style></head><body>
      <div class="wrap">
        <h1>${title}</h1>
        <p>Vastu: ${drafted.facing}-facing · Built-up ≈ ${Math.round(plan.builtUp).toLocaleString("en-IN")} sq ft · Car parking: ${drafted.parking ? "Yes" : "No"} — Generated by CONON Smart-Draft AI</p>
        ${markup}
      </div>
      <script>window.onload=function(){setTimeout(function(){window.print();},250);};<\/script>
      </body></html>`);
    win.document.close();
    toast.success("Opening print / save as PDF…");
  };

  const orderBuilderKit = () => {
    toast.success("Builder Kit linked to your blueprint", {
      description: "Continue in Conon Build to confirm your ₹14.5 Lakh kit.",
    });
    setLocation("/build");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pb-28">
        {/* Header */}
        <div className="px-4 pt-5 pb-5 text-white relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${BLUEPRINT} 0%, #0a4a7a 100%)` }}>
          <div className="absolute inset-0 ar-grid opacity-30" />
          <div className="relative">
            <button onClick={() => setLocation("/home")}
              className="flex items-center gap-1.5 text-cyan-200 mb-4 text-xs font-bold hover:text-white transition">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-white/15 p-2.5 rounded-2xl backdrop-blur-sm">
                <PencilRuler className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h1 className="font-black text-xl uppercase tracking-wide">Smart-Draft AI</h1>
                <p className="text-cyan-200 text-[11px] font-bold flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  Instant AI-generated 2D floor plans
                </p>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* ── Module 1: Requirement Gatherer ─────────────────── */}
          {phase !== "result" && (
            <motion.div key="form"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="px-4 pt-4 space-y-4">

              {/* Plot dimensions */}
              <div className="rounded-2xl p-4 text-white relative overflow-hidden card-shadow"
                style={{ background: `linear-gradient(160deg, ${BLUEPRINT_DEEP}, ${BLUEPRINT})` }}>
                <div className="absolute inset-0 ar-grid opacity-25" />
                <div className="relative">
                  <p className="text-[10px] font-black text-cyan-300 uppercase tracking-widest mb-3">Plot Dimensions</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Length (ft)", value: length, set: setLength },
                      { label: "Width (ft)", value: width, set: setWidth },
                    ].map((f) => (
                      <div key={f.label}>
                        <label className="text-[10px] font-bold text-cyan-100/80">{f.label}</label>
                        <input
                          type="number" min={1} value={f.value}
                          onChange={(e) => f.set(Math.max(0, parseInt(e.target.value) || 0))}
                          className="mt-1 w-full bg-white/10 border border-cyan-400/40 rounded-xl py-2.5 px-3 font-black text-lg text-white placeholder-cyan-200/40 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] font-bold text-cyan-200">
                    Total plot area · <span className="text-amber-300">{(length * width).toLocaleString("en-IN")} sq ft</span>
                  </p>
                </div>
              </div>

              {/* Facing */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" /> Plot Facing
                </p>
                <p className="text-[10px] text-amber-600 font-bold mb-3">For Vastu Compliance</p>
                <div className="grid grid-cols-4 gap-2">
                  {FACINGS.map((f) => (
                    <button key={f} onClick={() => setFacing(f)}
                      className={`py-2.5 rounded-xl text-xs font-black border transition-all ${facing === f ? "border-blue-600 bg-blue-50 text-blue-900" : "border-gray-100 text-gray-500 hover:border-gray-200"}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Requirement */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Requirement</p>
                <div className="grid grid-cols-3 gap-2">
                  {REQUIREMENTS.map((r) => (
                    <button key={r.id} onClick={() => setRequirement(r.id)}
                      className={`py-3 px-2 rounded-xl flex flex-col items-center gap-0.5 border transition-all ${requirement === r.id ? "border-blue-600 bg-blue-50" : "border-gray-100 hover:border-gray-200"}`}>
                      <span className={`text-sm font-black ${requirement === r.id ? "text-blue-900" : "text-gray-700"}`}>{r.label}</span>
                      <span className="text-[9px] text-gray-400 font-bold">{r.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Car parking */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Car className="w-5 h-5 text-blue-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-gray-800">Car Parking</p>
                  <p className="text-[11px] text-gray-400 font-bold">Reserve covered porch space</p>
                </div>
                <button onClick={() => setParking((p) => !p)}
                  aria-pressed={parking}
                  className={`w-14 h-8 rounded-full p-1 transition-colors ${parking ? "bg-blue-600" : "bg-gray-300"}`}>
                  <motion.div layout className="w-6 h-6 rounded-full bg-white shadow"
                    style={{ marginLeft: parking ? "auto" : 0 }} />
                </button>
              </div>

              {/* Generate */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={generate}
                className="w-full py-4 rounded-2xl text-white font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${AMBER}, #ea580c)`, boxShadow: `0 8px 28px rgba(245,158,11,0.45)` }}>
                <span className="absolute inset-0 animate-pulse"
                  style={{ background: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.35), transparent 60%)" }} />
                <Sparkles className="w-4 h-4 relative" />
                <span className="relative">Generate 2D Blueprint via AI</span>
              </motion.button>
            </motion.div>
          )}

          {/* ── Module 3 + 4: Blueprint + Action Center ────────── */}
          {phase === "result" && plan && drafted && (
            <motion.div key="result"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="px-4 pt-4 space-y-4">

              {/* Summary strip */}
              <div className="flex items-center gap-2 bg-blue-50 rounded-2xl px-4 py-2.5 border border-blue-100">
                <PencilRuler className="w-4 h-4 text-blue-700 shrink-0" />
                <p className="flex-1 text-[11px] font-black text-blue-900">
                  {reqLabel} · {drafted.facing}-facing · {drafted.L}×{drafted.W} ft · Parking {drafted.parking ? "Yes" : "No"}
                </p>
                <button onClick={startOver} className="text-[10px] font-black text-blue-600 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> Edit
                </button>
              </div>

              {/* Blueprint */}
              <div className="rounded-2xl p-2.5 card-shadow" style={{ background: BLUEPRINT }}>
                <BlueprintSvg plan={plan} L={drafted.L} W={drafted.W} facing={drafted.facing} svgRef={svgRef} />
              </div>

              {/* Built-up summary */}
              <div className="rounded-2xl p-4 text-white grid grid-cols-3 gap-2"
                style={{ background: `linear-gradient(160deg, ${BLUEPRINT_DEEP}, ${BLUEPRINT})` }}>
                {[
                  { label: "Built-up Area", value: `${Math.round(plan.builtUp).toLocaleString("en-IN")}`, unit: "sq ft" },
                  { label: "Plot Area", value: `${plan.plotArea.toLocaleString("en-IN")}`, unit: "sq ft" },
                  { label: "Rooms", value: `${plan.rooms.filter((r) => r.type !== "parking").length}`, unit: "zones" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-[8.5px] font-black text-cyan-300 uppercase tracking-wide">{s.label}</p>
                    <p className="text-xl font-black text-white leading-tight mt-0.5">{s.value}</p>
                    <p className="text-[9px] text-cyan-200">{s.unit}</p>
                  </div>
                ))}
              </div>

              {/* Action center */}
              <div className="space-y-3 pt-1">
                <button onClick={downloadPdf}
                  className="w-full py-4 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 card-shadow"
                  style={{ background: BLUEPRINT }}>
                  <Download className="w-4.5 h-4.5" /> Download 2D Map (PDF)
                </button>

                <button onClick={() => setShowPremium(true)}
                  className="w-full py-4 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 8px 28px rgba(124,58,237,0.35)" }}>
                  <Crown className="w-4.5 h-4.5 text-amber-300" />
                  Convert to 3D Walkthrough Video
                  <span className="text-[9px] bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full font-black ml-1">PREMIUM</span>
                </button>

                <button onClick={orderBuilderKit}
                  className="w-full py-4 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #15803d, #166534)", boxShadow: "0 8px 28px rgba(21,128,61,0.35)" }}>
                  <PackageCheck className="w-4.5 h-4.5" /> Order Builder Kit · ₹14.5 Lakhs
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Module 2: "Illusion of AI" processing overlay ──────── */}
      <AnimatePresence>
        {phase === "processing" && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center text-center px-8"
            style={{ background: `radial-gradient(circle at 50% 40%, #0a2540, ${BLUEPRINT_DEEP} 70%)` }}>
            <div className="absolute inset-0 ar-grid opacity-20" />
            <div className="relative flex flex-col items-center">
              <div className="relative mb-8">
                <div className="w-20 h-20 rounded-2xl border-2 border-cyan-400/40 flex items-center justify-center">
                  <Cpu className="w-9 h-9 text-cyan-300 animate-pulse" />
                </div>
                <Loader2 className="w-28 h-28 text-amber-400/70 animate-spin absolute -top-4 -left-4" />
              </div>
              <p className="text-cyan-300 text-[10px] font-black uppercase tracking-[0.3em] mb-3">CONON Smart-Draft AI</p>
              <AnimatePresence mode="wait">
                <motion.p key={msgIdx}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="text-white font-bold text-base max-w-xs min-h-[3rem]">
                  {processingMsgs[msgIdx]}
                </motion.p>
              </AnimatePresence>
              <div className="mt-6 flex gap-1.5">
                {processingMsgs.map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all ${i <= msgIdx ? "w-8 bg-amber-400" : "w-3 bg-white/20"}`} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium 3D walkthrough upsell */}
      <AnimatePresence>
        {showPremium && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowPremium(false)}
            className="fixed inset-0 z-[110] bg-black/60 flex items-end justify-center p-4">
            <motion.div
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[440px] bg-white rounded-3xl p-5 relative">
              <button onClick={() => setShowPremium(false)} className="absolute top-4 right-4 text-gray-400">
                <X className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
                <Clapperboard className="w-6 h-6 text-amber-300" />
              </div>
              <h3 className="text-lg font-black text-gray-900">3D Walkthrough Video</h3>
              <p className="text-sm text-gray-500 mt-1 mb-4 font-medium">
                Turn this 2D blueprint into a cinematic 3D walkthrough render of your home — room by room, with furniture and lighting. A CONON Premium add-on.
              </p>
              <button
                onClick={() => {
                  setShowPremium(false);
                  toast.success("You're on the Premium waitlist!", { description: "We'll notify you when 3D walkthroughs go live." });
                }}
                className="w-full py-3.5 rounded-2xl text-white font-black text-sm"
                style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
                Join Premium Waitlist
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
