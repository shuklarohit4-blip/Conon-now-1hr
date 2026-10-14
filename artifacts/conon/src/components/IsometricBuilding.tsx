import React, { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  activeStage: string;
  onStageSelect: (stage: string) => void;
}

const BRAND_DARK = "#1b4366";
const BRAND_MID  = "#5c92b1";
const AMBER      = "#f59e0b";

const ZONE_LABELS: Record<string, string> = {
  foundation:   "Foundation",
  walls:        "Walls",
  roofing:      "Roof",
  finishing:    "Finishing",
  miscellaneous:"Chhota Saaman",
};

export function IsometricBuilding({ activeStage, onStageSelect }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  const isActive = (z: string) => activeStage === z;
  const isHover  = (z: string) => hovered === z && !isActive(z);

  const fill = (z: string) =>
    isActive(z) ? "rgba(27,67,102,0.14)" : isHover(z) ? "rgba(92,146,177,0.10)" : "rgba(27,67,102,0.04)";

  const stroke = (z: string) =>
    isActive(z) ? BRAND_DARK : isHover(z) ? BRAND_MID : "#c8d8e8";

  const strokeW = (z: string) => (isActive(z) ? 2 : 1.2);

  const zp = (zone: string) => ({
    fill: fill(zone),
    stroke: stroke(zone),
    strokeWidth: strokeW(zone),
    style: { cursor: "pointer" },
    onClick: () => onStageSelect(zone),
    onMouseEnter: () => setHovered(zone),
    onMouseLeave: () => setHovered(null),
  });

  return (
    <div className="relative w-full flex flex-col items-center select-none">
      <svg
        viewBox="0 0 310 245"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[300px]"
      >
        <defs>
          <pattern id="bp-dots-light" width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="9" cy="9" r="0.7" fill="#c8d8e8" opacity="0.7" />
          </pattern>
          <filter id="zone-glow-light">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <rect width="310" height="245" fill="url(#bp-dots-light)" />

        {/* ── MISC SHED ── */}
        <polygon {...zp("miscellaneous")} points="8,166 48,144 80,166 40,188"
          filter={isActive("miscellaneous") ? "url(#zone-glow-light)" : undefined} />
        <polygon {...zp("miscellaneous")} points="8,140 8,166 40,188 40,162"
          filter={isActive("miscellaneous") ? "url(#zone-glow-light)" : undefined} />
        <polygon {...zp("miscellaneous")} points="8,166 48,144 80,166 80,172 48,150 8,172"
          filter={isActive("miscellaneous") ? "url(#zone-glow-light)" : undefined} />
        {/* Shed window */}
        <polygon
          points="18,148 30,142 30,160 18,166"
          fill={isActive("miscellaneous") ? "rgba(27,67,102,0.12)" : "rgba(27,67,102,0.03)"}
          stroke={isActive("miscellaneous") ? BRAND_DARK : "#c8d8e8"}
          strokeWidth="0.8"
          style={{ pointerEvents: "none" }}
        />

        {/* ── FOUNDATION ── */}
        <polygon {...zp("foundation")} points="80,162 155,119 230,162 155,205"
          filter={isActive("foundation") ? "url(#zone-glow-light)" : undefined} />
        <polygon {...zp("foundation")} points="230,162 230,179 155,222 155,205"
          filter={isActive("foundation") ? "url(#zone-glow-light)" : undefined} />
        <polygon {...zp("foundation")} points="80,162 155,205 155,222 80,179"
          filter={isActive("foundation") ? "url(#zone-glow-light)" : undefined} />

        {/* ── WALLS ── */}
        <polygon {...zp("walls")} points="80,74 80,162 155,205 155,117"
          filter={isActive("walls") ? "url(#zone-glow-light)" : undefined} />
        <polygon {...zp("walls")} points="230,74 230,162 155,205 155,117"
          filter={isActive("walls") ? "url(#zone-glow-light)" : undefined} />

        {/* ── ROOFING ── */}
        <polygon {...zp("roofing")} points="80,74 155,31 230,74 155,117"
          filter={isActive("roofing") ? "url(#zone-glow-light)" : undefined} />

        {/* ── FINISHING windows ── */}
        {[
          "96,104 115,115 115,147 96,136",
          "122,116 141,127 141,160 122,149",
          "214,104 195,115 195,147 214,136",
          "188,116 169,127 169,160 188,149",
          "167,158 155,164 155,205 167,199",
        ].map((pts, i) => (
          <polygon key={i} {...zp("finishing")} points={pts}
            filter={isActive("finishing") ? "url(#zone-glow-light)" : undefined} />
        ))}

        {/* Structural dashes */}
        <line x1="80" y1="74" x2="230" y2="74" stroke="#c8d8e8" strokeWidth="0.6" strokeDasharray="3,4" />
        <line x1="155" y1="31" x2="155" y2="117" stroke="#c8d8e8" strokeWidth="0.6" strokeDasharray="3,4" />
        <line x1="80" y1="162" x2="230" y2="162" stroke="#c8d8e8" strokeWidth="0.5" strokeDasharray="3,4" />

        {/* Labels */}
        {[
          { x: 155, y: 74, text: "ROOF", zone: "roofing", anchor: "middle", rot: undefined },
          { x: 102, y: 155, text: "WALLS", zone: "walls", anchor: "middle", rot: "rotate(-27,102,155)" },
          { x: 208, y: 155, text: "WALLS", zone: "walls", anchor: "middle", rot: "rotate(27,208,155)" },
          { x: 155, y: 168, text: "FOUNDATION", zone: "foundation", anchor: "middle", rot: undefined },
          { x: 44, y: 170, text: "MISC", zone: "miscellaneous", anchor: "middle", rot: undefined },
        ].map(({ x, y, text, zone, anchor, rot }, i) => (
          <text key={i} x={x} y={y} textAnchor={anchor as any}
            fontSize={text === "FOUNDATION" ? 6.5 : text === "MISC" ? 6 : 7}
            fontFamily="'Outfit',sans-serif" fontWeight="800" letterSpacing="2"
            fill={isActive(zone) ? BRAND_DARK : "#94a3b8"}
            transform={rot}
            style={{ pointerEvents: "none" }}
          >
            {text}
          </text>
        ))}
      </svg>

      {/* Active label badge */}
      <motion.div
        key={activeStage}
        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
        className="mt-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.18em] border"
        style={{ background: "rgba(27,67,102,0.06)", borderColor: "#c8d8e8", color: BRAND_DARK }}
      >
        {ZONE_LABELS[activeStage] ?? activeStage} — selected
      </motion.div>
    </div>
  );
}
