import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useUser } from "@/context/UserContext";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Edges, Stars, Grid, Line } from "@react-three/drei";
import * as THREE from "three";
import {
  ArrowLeft, Search, Satellite, Sun, Boxes, Radar, Rocket, MapPin,
  Cpu, Layers, ShieldCheck, Zap, Building2, Activity, Crown,
} from "lucide-react";

/* ───────────────────────── palette (Stark / holographic) ───────────────────────── */
const BG = "#00040d";
const BG2 = "#001a33";
const CYAN = "#22d3ee";
const NEON = "#7dd3fc";
const AMBER = "#fbbf24";
const GRID = "rgba(34,211,238,0.18)";
const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
const lakh = (n: number) => "₹" + (n / 100000).toFixed(1) + " L";

type Phase = "input" | "scanning" | "solar" | "model";

/* ═══════════════════════════ MODULE 2/3 — 3D scene ═══════════════════════════ */

/** Animated sun orb tracing an East→West arc, casting a moving glow. */
function SunOrb({ radius = 7, height = 5 }: { radius?: number; height?: number }) {
  const ref = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    // 0 → PI over ~12s, loops; east (-x) to west (+x)
    const t = (state.clock.elapsedTime * 0.16) % Math.PI;
    const x = -Math.cos(t) * radius;
    const y = Math.sin(t) * height + 0.6;
    const z = -Math.cos(t) * 1.2;
    if (ref.current) ref.current.position.set(x, y, z);
    if (light.current) light.current.position.set(x, y, z);
  });
  // arc trail
  const trail = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 48; i++) {
      const t = (i / 48) * Math.PI;
      pts.push([-Math.cos(t) * radius, Math.sin(t) * height + 0.6, -Math.cos(t) * 1.2]);
    }
    return pts;
  }, [radius, height]);
  return (
    <>
      <Line points={trail} color={AMBER} lineWidth={1} transparent opacity={0.35} dashed dashSize={0.3} gapSize={0.2} />
      <pointLight ref={light} intensity={55} distance={30} color="#ffd27a" />
      <group ref={ref}>
        <mesh>
          <sphereGeometry args={[0.55, 32, 32]} />
          <meshStandardMaterial color="#fff1c2" emissive="#ffb300" emissiveIntensity={2.4} toneMapped={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.95, 32, 32]} />
          <meshBasicMaterial color="#ffcf6b" transparent opacity={0.18} />
        </mesh>
      </group>
    </>
  );
}

/** Glowing 3D zoning grid (the "Vastu-Solar matrix"). */
function VastuMatrix() {
  const zones = useMemo(
    () => [
      { pos: [-2.2, 0.02, -2.2] as const, color: "#38bdf8", label: "Jal · NE" },
      { pos: [2.2, 0.02, -2.2] as const, color: "#f97316", label: "Agneya · SE" },
      { pos: [-2.2, 0.02, 2.2] as const, color: "#a3e635", label: "Vayavya · NW" },
      { pos: [2.2, 0.02, 2.2] as const, color: "#f43f5e", label: "Nairutya · SW" },
    ],
    [],
  );
  return (
    <group>
      <Grid
        args={[13, 13]}
        cellSize={1.1}
        cellThickness={0.6}
        cellColor="#0e3a5c"
        sectionSize={3.3}
        sectionThickness={1.1}
        sectionColor={CYAN}
        fadeDistance={26}
        fadeStrength={1.5}
        infiniteGrid
        position={[0, -0.01, 0]}
      />
      {zones.map((z) => (
        <mesh key={z.label} position={[z.pos[0], z.pos[1], z.pos[2]]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.4, 2.4]} />
          <meshBasicMaterial color={z.color} transparent opacity={0.16} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

interface HotspotDef {
  pos: [number, number, number];
  title: string;
  desc: string;
}

/** A clickable holographic node anchored on the BIM model. */
function Hotspot({ spot, active, onClick }: { spot: HotspotDef; active: boolean; onClick: () => void }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.12;
      ref.current.scale.setScalar(active ? s * 1.3 : s);
    }
  });
  return (
    <group position={spot.pos}>
      <mesh
        ref={ref}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color={active ? AMBER : CYAN} emissive={active ? AMBER : CYAN} emissiveIntensity={1.8} toneMapped={false} />
      </mesh>
      {active && (
        <Html center distanceFactor={9} style={{ pointerEvents: "none" }}>
          <div
            style={{
              background: "rgba(0,12,26,0.92)",
              border: `1px solid ${CYAN}`,
              borderRadius: 10,
              padding: "8px 11px",
              width: 180,
              boxShadow: `0 0 24px -4px ${CYAN}`,
              transform: "translateY(-46px)",
            }}
          >
            <div style={{ color: CYAN, fontFamily: MONO, fontSize: 10, fontWeight: 800, letterSpacing: "0.06em" }}>{spot.title}</div>
            <div style={{ color: "rgba(191,230,255,0.8)", fontSize: 10, marginTop: 3, lineHeight: 1.35 }}>{spot.desc}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

/** A single transparent holographic floor box with wireframe edges. */
function FloorBox({ y, w, d, h, label }: { y: number; w: number; d: number; h: number; label?: string }) {
  return (
    <mesh position={[0, y + h / 2, 0]}>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial
        color={CYAN}
        transparent
        opacity={0.07}
        emissive={CYAN}
        emissiveIntensity={0.25}
        roughness={0.2}
        metalness={0.1}
        side={THREE.DoubleSide}
      />
      <Edges threshold={15} color={CYAN} />
      {label && (
        <Html position={[w / 2 + 0.2, 0, d / 2]} distanceFactor={11} style={{ pointerEvents: "none" }}>
          <div style={{ color: NEON, fontFamily: MONO, fontSize: 9, fontWeight: 700, whiteSpace: "nowrap", opacity: 0.8 }}>{label}</div>
        </Html>
      )}
    </mesh>
  );
}

/** The rotatable G+2 holographic BIM structure. */
function BIMHouse({ selected, setSelected }: { selected: number | null; setSelected: (i: number | null) => void }) {
  const group = useRef<THREE.Group>(null);
  const W = 5;
  const D = 4;
  const FLOOR_H = 1.7;
  const FLOORS = 3; // G + 2
  const SLAB = 0.12;

  // RCC column positions (corners + mid)
  const colXs = [-W / 2, 0, W / 2];
  const colZs = [-D / 2, 0, D / 2];

  const hotspots: HotspotDef[] = useMemo(
    () => [
      { pos: [-W / 2, FLOOR_H * 1.5, -D / 2], title: "RCC Column · M25", desc: "600×600mm RCC column · Fe550 TMT cage · M25 grade concrete." },
      { pos: [W / 2, FLOOR_H * 0.5, D / 2], title: "Cantilever Balcony", desc: "1.2m projection · waterproofed RCC slab with SS railing." },
      { pos: [0, FLOOR_H * FLOORS + 0.25, 0], title: "Solar-Ready Terrace", desc: "Brick-bat coba roof · 4kW rooftop solar provision." },
      { pos: [-W / 2, FLOOR_H * 0.5, D / 2], title: "Main Entrance · NE", desc: "Vastu-aligned entry in the Ishanya zone for positive flow." },
    ],
    [],
  );

  useFrame((state) => {
    if (group.current) group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.12) * 0.25;
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      {/* floors */}
      {Array.from({ length: FLOORS }).map((_, i) => (
        <FloorBox key={i} y={i * FLOOR_H} w={W} d={D} h={FLOOR_H} label={i === 0 ? "Ground" : `Floor ${i}`} />
      ))}
      {/* slabs between floors + roof */}
      {Array.from({ length: FLOORS + 1 }).map((_, i) => (
        <mesh key={`slab${i}`} position={[0, i * FLOOR_H, 0]}>
          <boxGeometry args={[W + 0.15, SLAB, D + 0.15]} />
          <meshStandardMaterial color={NEON} transparent opacity={0.25} emissive={CYAN} emissiveIntensity={0.4} />
        </mesh>
      ))}
      {/* RCC columns */}
      {colXs.map((x) =>
        colZs.map((z) => (
          <mesh key={`col${x}-${z}`} position={[x, (FLOORS * FLOOR_H) / 2, z]}>
            <boxGeometry args={[0.16, FLOORS * FLOOR_H, 0.16]} />
            <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.7} transparent opacity={0.55} />
          </mesh>
        )),
      )}
      {/* hotspots */}
      {hotspots.map((s, i) => (
        <Hotspot key={i} spot={s} active={selected === i} onClick={() => setSelected(selected === i ? null : i)} />
      ))}
    </group>
  );
}

function Scene({ phase, selected, setSelected }: { phase: Phase; selected: number | null; setSelected: (i: number | null) => void }) {
  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 14, 34]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 10, 6]} intensity={0.5} color={CYAN} />
      <Stars radius={60} depth={40} count={1400} factor={4} saturation={0} fade speed={1} />
      <VastuMatrix />
      <SunOrb />
      {phase === "model" && <BIMHouse selected={selected} setSelected={setSelected} />}
      <OrbitControls
        enablePan={false}
        minDistance={6}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2.05}
        autoRotate={phase === "solar"}
        autoRotateSpeed={0.8}
        target={[0, 1.6, 0]}
      />
    </>
  );
}

/* ═══════════════════════════ MODULE 1 — scanning overlay ═══════════════════════════ */
const SCAN_LOGS = [
  "Extracting Topography & Soil Data…",
  "Calculating Solar Path (Sun trajectory for UP region)…",
  "Analyzing local municipal setbacks…",
  "Triangulating plot boundary via satellite mesh…",
];

function ScanningOverlay({ place, onDone }: { place: string; onDone: () => void }) {
  const [line, setLine] = useState(0);
  useEffect(() => {
    const timers: number[] = [];
    for (let i = 1; i < SCAN_LOGS.length; i++) timers.push(window.setTimeout(() => setLine(i), i * 750));
    timers.push(window.setTimeout(onDone, SCAN_LOGS.length * 750 + 350));
    return () => timers.forEach(clearTimeout);
  }, [onDone]);
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center px-7"
      style={{ background: "rgba(0,4,13,0.97)", backdropFilter: "blur(6px)" }}
    >
      <motion.div
        animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ border: `2px dashed ${CYAN}`, boxShadow: `0 0 40px -8px ${CYAN}` }}
      >
        <Satellite className="w-8 h-8" style={{ color: CYAN }} />
      </motion.div>
      <span className="font-black tracking-[0.28em] text-[11px] uppercase mb-1.5" style={{ color: CYAN }}>Satellite Data Fetch</span>
      <span className="flex items-center gap-1.5 text-[11px] font-bold mb-6" style={{ color: NEON }}>
        <MapPin className="w-3.5 h-3.5" /> {place}
      </span>
      <div className="w-full max-w-[330px] space-y-2">
        {SCAN_LOGS.map((log, i) => (
          <motion.div
            key={log}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: i <= line ? 1 : 0.25, x: 0 }}
            className="flex items-center gap-2 text-[11px] font-semibold"
            style={{ color: i <= line ? "rgba(191,230,255,0.92)" : "rgba(191,230,255,0.3)", fontFamily: MONO }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: i < line ? NEON : i === line ? CYAN : "rgba(34,211,238,0.25)" }} />
            {log}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════ MODULE 2 — zoning ticker ═══════════════════════════ */
const SOLAR_STEPS = [
  "Aligning Master Bedroom to Nairutya (SW) to block harsh afternoon heat…",
  "Placing Kitchen in Agneya (SE) for morning UV purification…",
  "Locating water tank & pooja in Ishanya (NE) for the rising sun…",
  "Stress-testing slab for 6.5 seismic zone-IV resilience…",
];

/* ═══════════════════════════ MODULE 4 — material radar ═══════════════════════════ */
interface RadarItem {
  icon: string;
  txt: string;
}
const RADAR_ITEMS: RadarItem[] = [
  { icon: "📡", txt: "Detecting nearest Conon Smart-Warehouse…" },
  { icon: "🔥", txt: "450 Bags UltraTech Cement locked · VIP Road Godown" },
  { icon: "🔥", txt: "2 Metric Tons Tata Tiscon TMT reserved" },
  { icon: "🧱", txt: "18,000 AAC Blocks allocated · JIT dispatch ready" },
  { icon: "🚛", txt: "3 Conon Fleet trucks on standby (4.2 km)" },
];

function MaterialRadar({ ready, onReady }: { ready: boolean; onReady: () => void }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!ready) return;
    const timers: number[] = [];
    for (let i = 1; i <= RADAR_ITEMS.length; i++) timers.push(window.setTimeout(() => setShown(i), i * 600));
    timers.push(window.setTimeout(onReady, RADAR_ITEMS.length * 600 + 200));
    return () => timers.forEach(clearTimeout);
  }, [ready, onReady]);
  return (
    <div
      className="rounded-2xl p-4 backdrop-blur-xl"
      style={{ background: "rgba(0,26,51,0.55)", border: `1px solid ${GRID}`, boxShadow: `0 0 30px -10px ${CYAN}` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Radar className="w-4 h-4 animate-pulse" style={{ color: CYAN }} />
        <span className="font-black tracking-[0.18em] text-[11px] uppercase" style={{ color: CYAN }}>Material Radar · Live</span>
      </div>
      <div className="space-y-2">
        {RADAR_ITEMS.map((it, i) => (
          <motion.div
            key={it.txt}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: i < shown ? 1 : 0.2, y: 0 }}
            className="flex items-start gap-2 text-[11px] font-semibold leading-snug"
            style={{ color: "rgba(191,230,255,0.9)", fontFamily: MONO }}
          >
            <span>{it.icon}</span>
            <span>{it.txt}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* WebGL capability probe — some webviews / headless browsers can't create a context. */
function detectWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
  } catch {
    return false;
  }
}

/** Graceful CSS/SVG holographic fallback when WebGL is unavailable. */
const FALLBACK_SPOTS = [
  { title: "RCC Column · M25", desc: "600×600mm RCC column · Fe550 TMT cage · M25 grade concrete." },
  { title: "Cantilever Balcony", desc: "1.2m projection · waterproofed RCC slab with SS railing." },
  { title: "Solar-Ready Terrace", desc: "Brick-bat coba roof · 4kW rooftop solar provision." },
  { title: "Main Entrance · NE", desc: "Vastu-aligned entry in the Ishanya zone for positive flow." },
];

function Fallback3D({ phase, selected, setSelected }: { phase: Phase; selected: number | null; setSelected: (i: number | null) => void }) {
  return (
    <div
      className="w-full h-full relative flex flex-col items-center justify-center"
      style={{
        background:
          `radial-gradient(120% 90% at 50% 10%, ${BG2} 0%, ${BG} 70%),` +
          `repeating-linear-gradient(0deg, transparent 0 26px, ${GRID} 26px 27px),` +
          `repeating-linear-gradient(90deg, transparent 0 26px, ${GRID} 26px 27px)`,
      }}
    >
      <motion.svg
        width="170" height="190" viewBox="0 0 170 190"
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        style={{ filter: `drop-shadow(0 0 14px ${CYAN})` }}
      >
        {/* animated sun arc */}
        <motion.circle
          r="7" fill="#ffd27a"
          animate={{ cx: [18, 85, 152], cy: [120, 24, 120] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* isometric G+2 wireframe */}
        {[0, 1, 2].map((i) => {
          const y = 150 - i * 38;
          return (
            <g key={i} stroke={CYAN} strokeWidth="1.2" fill="rgba(34,211,238,0.05)">
              <polygon points={`45,${y} 85,${y - 18} 125,${y} 85,${y + 18}`} />
              <line x1="45" y1={y} x2="45" y2={y - 30} />
              <line x1="125" y1={y} x2="125" y2={y - 30} />
              <line x1="85" y1={y + 18} x2="85" y2={y - 12} />
            </g>
          );
        })}
      </motion.svg>
      <span className="text-[10px] font-bold tracking-widest uppercase mt-3" style={{ color: NEON, fontFamily: MONO }}>
        {phase === "model" ? "Holographic BIM · G+2" : "Rendering Solar Matrix…"}
      </span>
      {phase === "model" && (
        <div className="flex flex-wrap gap-1.5 justify-center px-4 mt-3 max-w-[300px]">
          {FALLBACK_SPOTS.map((s, i) => (
            <button
              key={s.title}
              onClick={() => setSelected(selected === i ? null : i)}
              className="px-2.5 py-1 rounded-full text-[9px] font-bold transition active:scale-95"
              style={{ background: selected === i ? "rgba(251,191,36,0.16)" : "rgba(34,211,238,0.08)", border: `1px solid ${selected === i ? AMBER : GRID}`, color: selected === i ? AMBER : NEON }}
            >
              {s.title}
            </button>
          ))}
        </div>
      )}
      <AnimatePresence>
        {phase === "model" && selected !== null && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
            className="absolute left-3 right-3 top-3 rounded-xl px-3 py-2 backdrop-blur-md"
            style={{ background: "rgba(0,4,13,0.8)", border: `1px solid ${CYAN}` }}
          >
            <div className="text-[10px] font-black" style={{ color: CYAN, fontFamily: MONO }}>{FALLBACK_SPOTS[selected].title}</div>
            <div className="text-[10px] mt-0.5" style={{ color: "rgba(191,230,255,0.85)" }}>{FALLBACK_SPOTS[selected].desc}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════ MAIN PAGE ═══════════════════════════ */
export function SmartBuild3D() {
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const { setName } = useUser();
  const addToCart = useAddToCart({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() }) },
  });

  const [place, setPlace] = useState("Shaheed Path, Lucknow");
  const [phase, setPhase] = useState<Phase>("input");
  const [solarStep, setSolarStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [radarDone, setRadarDone] = useState(false);
  const webgl = useMemo(detectWebGL, []);
  const navTimer = useRef<number | null>(null);
  useEffect(() => () => { if (navTimer.current) clearTimeout(navTimer.current); }, []);

  const DEPLOY_PRICE = Math.min(10_000_000, 1_850_000); // ₹18.5 L turnkey

  // Module 2 ticker + auto-advance to the 3D model.
  useEffect(() => {
    if (phase !== "solar") return;
    setSolarStep(0);
    const timers: number[] = [];
    for (let i = 1; i < SOLAR_STEPS.length; i++) timers.push(window.setTimeout(() => setSolarStep(i), i * 1300));
    timers.push(window.setTimeout(() => setPhase("model"), SOLAR_STEPS.length * 1300 + 600));
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  const scan = () => {
    if (!place.trim()) {
      toast.error("Drop a geo-pin first", { description: "Enter a plot location to begin the satellite scan." });
      return;
    }
    setPhase("scanning");
  };

  const deploy = () => {
    setName("ROHIIT SHUKLA");
    addToCart.mutate(
      {
        data: {
          materialId: "smartbuild-gp2-shaheedpath",
          quantity: 1,
          name: `Conon Smart-Build · G+2 Turnkey · ${place}`,
          price: DEPLOY_PRICE,
          unit: "Turnkey Project",
          vendor: "Conon Smart-Build",
          category: "design-kit",
        },
      },
      {
        onSuccess: () => {
          toast.success("Conon Fleet deployed — construction initialised!", {
            description: `G+2 turnkey project · ${lakh(DEPLOY_PRICE)} routed to the Khata Ledger.`,
            icon: <Rocket className="w-4 h-4" style={{ color: CYAN }} />,
          });
          navTimer.current = window.setTimeout(() => setLocation("/khata"), 900);
        },
        onError: () => toast.error("Deployment failed. Please retry."),
      },
    );
  };

  return (
    <Layout>
      <div className="min-h-full" style={{ background: `radial-gradient(120% 80% at 50% 0%, ${BG2} 0%, ${BG} 60%)` }}>
        {/* header */}
        <div className="px-5 pt-5 pb-4" style={{ borderBottom: `1px solid ${GRID}` }}>
          <button onClick={() => setLocation("/home")} className="flex items-center gap-1.5 text-[11px] font-bold mb-3" style={{ color: "rgba(191,230,255,0.6)" }}>
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(34,211,238,0.12)", border: `1px solid ${GRID}`, boxShadow: `0 0 22px -6px ${CYAN}` }}>
              <Boxes className="w-5 h-5" style={{ color: CYAN }} strokeWidth={2.2} />
            </span>
            <div>
              <h2 className="font-display font-black italic text-2xl text-white leading-none">Smart-Build 3D Engine</h2>
              <p className="text-[10px] font-bold tracking-[0.22em] uppercase mt-1.5" style={{ color: CYAN }}>Holographic BIM · Deep-Tech</p>
            </div>
          </div>
        </div>

        {/* ───────── MODULE 1 — Geo-Pin scanner ───────── */}
        {phase === "input" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="px-5 py-8">
            <div className="text-center mb-7">
              <motion.div
                animate={{ y: [0, -6, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex w-16 h-16 rounded-3xl items-center justify-center mb-4"
                style={{ background: "rgba(34,211,238,0.1)", border: `1px solid ${GRID}`, boxShadow: `0 0 40px -8px ${CYAN}` }}
              >
                <Satellite className="w-7 h-7" style={{ color: CYAN }} />
              </motion.div>
              <h3 className="text-white font-black text-lg">Geo-Pin & Plot Scanner</h3>
              <p className="text-[12px] mt-1.5 max-w-[300px] mx-auto" style={{ color: "rgba(191,230,255,0.6)" }}>
                Drop a pin on your plot. We fetch live topography, solar path & municipal setbacks — then render your home in 3D.
              </p>
            </div>

            {/* glowing search bar */}
            <div
              className="flex items-center gap-2 rounded-2xl px-4 py-3.5 mb-4"
              style={{ background: "rgba(0,26,51,0.6)", border: `1px solid ${CYAN}`, boxShadow: `0 0 28px -10px ${CYAN}` }}
            >
              <Search className="w-4 h-4 flex-shrink-0" style={{ color: CYAN }} />
              <input
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && scan()}
                placeholder="Search a plot location…"
                className="flex-1 bg-transparent outline-none text-sm font-bold text-white placeholder:text-slate-500"
                style={{ fontFamily: MONO }}
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-7">
              {["Shaheed Path, Lucknow", "Gomti Nagar Ext", "Sushant Golf City"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPlace(p)}
                  className="px-3 py-1.5 rounded-full text-[10px] font-bold transition active:scale-95"
                  style={{ background: place === p ? "rgba(34,211,238,0.16)" : "rgba(34,211,238,0.05)", border: `1px solid ${place === p ? CYAN : GRID}`, color: place === p ? CYAN : "rgba(191,230,255,0.6)" }}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={scan}
              className="w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 active:scale-[0.98] transition text-base"
              style={{ background: `linear-gradient(135deg, ${CYAN} 0%, #2563eb 100%)`, color: "#00131f", boxShadow: `0 8px 30px -8px ${CYAN}` }}
            >
              <Satellite className="w-5 h-5" /> Scan Plot & Generate 3D
            </button>

            <div className="grid grid-cols-3 gap-2 mt-6">
              {[
                { icon: Sun, t: "Solar-Path AI" },
                { icon: Layers, t: "Live BIM" },
                { icon: ShieldCheck, t: "Vastu Verified" },
              ].map((f) => (
                <div key={f.t} className="rounded-xl px-2 py-3 text-center" style={{ background: "rgba(0,26,51,0.4)", border: `1px solid ${GRID}` }}>
                  <f.icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: CYAN }} />
                  <span className="text-[9px] font-bold" style={{ color: "rgba(191,230,255,0.7)" }}>{f.t}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ───────── MODULES 2 & 3 — 3D holographic engine ───────── */}
        {(phase === "solar" || phase === "model") && (
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: NEON }}>
                <MapPin className="w-3.5 h-3.5" /> {place}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase" style={{ color: phase === "model" ? NEON : AMBER }}>
                <Activity className="w-3.5 h-3.5" /> {phase === "model" ? "BIM Live" : "Solar Sim"}
              </span>
            </div>

            {/* the canvas */}
            <div
              className="rounded-2xl overflow-hidden relative"
              style={{ height: 360, border: `1px solid ${GRID}`, boxShadow: `0 0 40px -16px ${CYAN}` }}
            >
              {webgl ? (
                <Canvas camera={{ position: [8, 6, 10], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true }}>
                  <Scene phase={phase} selected={selected} setSelected={setSelected} />
                </Canvas>
              ) : (
                <Fallback3D phase={phase} selected={selected} setSelected={setSelected} />
              )}

              {/* solar zoning ticker overlay */}
              {phase === "solar" && (
                <div className="absolute left-3 right-3 bottom-3">
                  <div className="rounded-xl px-3 py-2.5 backdrop-blur-md" style={{ background: "rgba(0,4,13,0.7)", border: `1px solid ${GRID}` }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sun className="w-3.5 h-3.5 animate-pulse" style={{ color: AMBER }} />
                      <span className="text-[9px] font-black tracking-widest uppercase" style={{ color: AMBER }}>Environmental Stress Test</span>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={solarStep}
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                        className="text-[11px] font-semibold leading-snug" style={{ color: "rgba(191,230,255,0.92)", fontFamily: MONO }}
                      >
                        {SOLAR_STEPS[solarStep]}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {phase === "model" && webgl && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ background: "rgba(0,4,13,0.65)", border: `1px solid ${GRID}` }}>
                  <Cpu className="w-3 h-3" style={{ color: CYAN }} />
                  <span className="text-[9px] font-bold" style={{ color: NEON }}>Drag to rotate · tap nodes</span>
                </div>
              )}
            </div>

            {/* ───────── MODULE 4 — Material Radar + Deploy ───────── */}
            {phase === "model" && (
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-4">
                <MaterialRadar ready onReady={() => setRadarDone(true)} />

                {/* admin context */}
                <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.3)" }}>
                  <Crown className="w-4 h-4 flex-shrink-0" style={{ color: AMBER }} />
                  <span className="text-[10px] font-bold" style={{ color: AMBER }}>Master Admin · ROHIIT SHUKLA · Khata Ledger linked</span>
                </div>

                <motion.button
                  onClick={deploy}
                  disabled={addToCart.isPending}
                  animate={radarDone ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 active:scale-[0.98] transition text-base disabled:opacity-60"
                  style={{ background: `linear-gradient(135deg, ${AMBER} 0%, #f97316 100%)`, color: "#1a0a00", boxShadow: `0 10px 34px -8px ${AMBER}` }}
                >
                  <Rocket className="w-5 h-5" /> Deploy Conon Fleet & Start Construction ({lakh(DEPLOY_PRICE)})
                </motion.button>

                <div className="grid grid-cols-3 gap-2 pb-2">
                  {[
                    { icon: Building2, t: "G+2 Structure" },
                    { icon: Zap, t: "60-Day Build" },
                    { icon: ShieldCheck, t: "10yr Warranty" },
                  ].map((f) => (
                    <div key={f.t} className="rounded-xl px-2 py-3 text-center" style={{ background: "rgba(0,26,51,0.4)", border: `1px solid ${GRID}` }}>
                      <f.icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: CYAN }} />
                      <span className="text-[9px] font-bold" style={{ color: "rgba(191,230,255,0.7)" }}>{f.t}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        <AnimatePresence>
          {phase === "scanning" && <ScanningOverlay key="scan" place={place} onDone={() => setPhase("solar")} />}
        </AnimatePresence>
      </div>
    </Layout>
  );
}

export default SmartBuild3D;
