import React from "react";
import type { CctOrColor } from "@/components/lighting/KelvinPreviewToggle";
import type { LuminaireVisualKind } from "@/data/lightingCatalog";
import type { SolarVisualKind } from "@/data/solarCatalog";
import type { ToolVisualKind } from "@/data/toolsHardwareCatalog";

const CCT_CORE_COLORS: Record<string, { glow: string; rim: string; beam: string }> = {
  "3000K": { glow: "#FBBF24", rim: "#F59E0B", beam: "#FEF3C7" },
  "4000K": { glow: "#FDE68A", rim: "#EAB308", beam: "#FFFBEB" },
  "6500K": { glow: "#93C5FD", rim: "#3B82F6", beam: "#EFF6FF" },
};

export function LuminaireSvgGraphic({
  kind,
  cct = "4000K",
  compact = false,
}: {
  kind: LuminaireVisualKind;
  cct?: CctOrColor;
  compact?: boolean;
}) {
  const c = CCT_CORE_COLORS[cct] || CCT_CORE_COLORS["4000K"];
  const cls = compact ? "w-7 h-7" : "w-32 h-32";

  switch (kind) {
    case "concealed":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          <defs>
            <radialGradient id={`g-con-${cct}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={c.beam} />
              <stop offset="65%" stopColor={c.glow} />
              <stop offset="100%" stopColor={c.rim} stopOpacity="0.2" />
            </radialGradient>
          </defs>
          <circle cx="60" cy="60" r="42" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2.5" />
          <circle cx="60" cy="60" r="34" fill="#1E293B" />
          <circle cx="60" cy="60" r="28" fill={`url(#g-con-${cct})`} />
          <path d="M22 46 L14 38 M98 46 L106 38" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case "panel-round":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          <circle cx="60" cy="60" r="46" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="3" />
          <circle cx="60" cy="60" r="40" fill={c.glow} fillOpacity="0.88" stroke={c.rim} strokeWidth="2" />
          <circle cx="60" cy="60" r="26" fill={c.beam} fillOpacity="0.95" />
        </svg>
      );
    case "panel-square":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          <rect x="16" y="16" width="88" height="88" rx="10" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="3" />
          <rect x="23" y="23" width="74" height="74" rx="7" fill={c.glow} fillOpacity="0.85" stroke={c.rim} strokeWidth="1.5" />
          <rect x="33" y="33" width="54" height="54" rx="4" fill={c.beam} />
        </svg>
      );
    case "cob-spot":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          <circle cx="60" cy="54" r="38" fill="#1E293B" stroke="#94A3B8" strokeWidth="3" />
          <circle cx="60" cy="54" r="27" fill="#0F172A" stroke="#475569" strokeWidth="2" />
          <circle cx="60" cy="54" r="14" fill={c.glow} stroke={c.rim} strokeWidth="2" />
          <polygon points="46,68 74,68 92,108 28,108" fill={c.glow} fillOpacity="0.28" />
        </svg>
      );
    case "strip-coil":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          <circle cx="60" cy="60" r="42" fill="#0F172A" stroke="#475569" strokeWidth="3" />
          <circle cx="60" cy="60" r="34" fill="none" stroke={c.glow} strokeWidth="6" strokeDasharray="5 3" />
          <circle cx="60" cy="60" r="25" fill="none" stroke={c.rim} strokeWidth="4" strokeDasharray="4 3" />
          <circle cx="60" cy="60" r="14" fill="#334155" />
          <rect x="52" y="90" width="52" height="10" rx="5" fill={c.glow} />
        </svg>
      );
    case "smps-driver":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          <rect x="18" y="32" width="84" height="56" rx="8" fill="#CBD5E1" stroke="#475569" strokeWidth="2.5" />
          <rect x="26" y="40" width="68" height="22" rx="4" fill="#1E293B" />
          <text x="60" y="55" textAnchor="middle" fill="#FBBF24" fontSize="11" fontWeight="800">12V SMPS</text>
          <path d="M28 74 H92" stroke="#64748B" strokeWidth="3" strokeDasharray="6 4" />
          <circle cx="90" cy="74" r="3.5" fill="#10B981" />
        </svg>
      );
    case "alu-profile":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          <polygon points="18,76 92,30 106,44 32,90" fill="#94A3B8" stroke="#475569" strokeWidth="2" />
          <polygon points="22,74 92,31 100,39 30,82" fill={c.beam} stroke={c.glow} strokeWidth="2" />
          <polygon points="24,80 34,90 18,92" fill="#334155" />
        </svg>
      );
    case "batten":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          <g transform="rotate(-18 60 60)">
            <rect x="10" y="50" width="100" height="18" rx="6" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
            <rect x="16" y="53" width="88" height="12" rx="4" fill={c.beam} stroke={c.glow} strokeWidth="2" />
            <rect x="10" y="50" width="8" height="18" rx="2" fill="#1E293B" />
            <rect x="102" y="50" width="8" height="18" rx="2" fill="#1E293B" />
          </g>
        </svg>
      );
    case "inverter-bulb":
    case "bulb":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          <path d="M46 84 H74 L70 100 H50 Z" fill="#94A3B8" stroke="#475569" strokeWidth="2" />
          <rect x="44" y="68" width="32" height="16" rx="4" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
          <path d="M34 52 C34 26 86 26 86 52 C86 64 76 68 74 72 H46 C44 68 34 64 34 52 Z" fill={c.beam} stroke={c.glow} strokeWidth="2.5" />
          {kind === "inverter-bulb" && (
            <polygon points="62,36 53,51 60,51 57,63 68,47 61,47" fill="#10B981" />
          )}
        </svg>
      );
    case "track-rail":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          <rect x="14" y="34" width="92" height="16" rx="3" fill="#0F172A" stroke="#334155" strokeWidth="2" />
          <rect x="18" y="39" width="84" height="5" fill={c.glow} />
          <rect x="34" y="48" width="22" height="32" rx="4" fill="#1E293B" stroke="#475569" strokeWidth="2" />
          <circle cx="45" cy="80" r="6" fill={c.glow} />
          <rect x="68" y="48" width="22" height="26" rx="4" fill="#1E293B" stroke="#475569" strokeWidth="2" />
          <circle cx="79" cy="74" r="6" fill={c.glow} />
        </svg>
      );
    case "cabinet-bar":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          <rect x="14" y="48" width="92" height="18" rx="5" fill="#1E293B" stroke="#475569" strokeWidth="2" />
          <rect x="20" y="53" width="66" height="8" rx="3" fill={c.beam} />
          <circle cx="96" cy="57" r="4" fill="#10B981" />
          <polygon points="22,66 86,66 96,94 12,94" fill={c.glow} fillOpacity="0.25" />
        </svg>
      );
    case "flood-light":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          <path d="M30 88 L42 64 H78 L90 88" fill="none" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
          <rect x="22" y="24" width="76" height="52" rx="8" fill="#1E293B" stroke="#475569" strokeWidth="2.5" />
          <rect x="29" y="31" width="62" height="38" rx="4" fill={c.beam} stroke={c.glow} strokeWidth="2" />
          <circle cx="44" cy="44" r="4" fill={c.rim} />
          <circle cx="60" cy="44" r="4" fill={c.rim} />
          <circle cx="76" cy="44" r="4" fill={c.rim} />
          <circle cx="44" cy="56" r="4" fill={c.rim} />
          <circle cx="60" cy="56" r="4" fill={c.rim} />
          <circle cx="76" cy="56" r="4" fill={c.rim} />
        </svg>
      );
    case "updown-wall":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          <polygon points="44,44 76,44 92,16 28,16" fill={c.glow} fillOpacity="0.35" />
          <polygon points="44,76 76,76 92,104 28,104" fill={c.glow} fillOpacity="0.35" />
          <rect x="42" y="42" width="36" height="36" rx="6" fill="#0F172A" stroke="#475569" strokeWidth="2.5" />
          <circle cx="60" cy="60" r="6" fill={c.glow} />
        </svg>
      );
    case "gate-lamp":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          <rect x="34" y="88" width="52" height="14" rx="4" fill="#1E293B" />
          <rect x="40" y="34" width="40" height="54" rx="12" fill={c.beam} stroke="#334155" strokeWidth="3.5" />
          <path d="M36 36 L60 20 L84 36 Z" fill="#0F172A" />
        </svg>
      );
  }
}

export function SolarSvgGraphic({
  kind,
  compact = false,
}: {
  kind: SolarVisualKind;
  compact?: boolean;
}) {
  const cls = compact ? "w-7 h-7" : "w-32 h-32";

  switch (kind) {
    case "panel-dcr":
    case "panel-nondcr":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          <polygon points="24,22 98,16 88,96 14,102" fill="#0F172A" stroke="#CBD5E1" strokeWidth="3.5" />
          <polygon points="27,26 93,20 84,92 18,97" fill={kind === "panel-dcr" ? "#1E3A8A" : "#1E293B"} />
          <g stroke="#93C5FD" strokeWidth="1" opacity="0.65">
            <line x1="42" y1="24" x2="34" y2="96" />
            <line x1="60" y1="23" x2="51" y2="95" />
            <line x1="77" y1="21" x2="68" y2="93" />
            <line x1="25" y1="42" x2="91" y2="37" />
            <line x1="23" y1="60" x2="88" y2="55" />
            <line x1="20" y1="78" x2="86" y2="73" />
          </g>
          {kind === "panel-dcr" && (
            <circle cx="88" cy="28" r="10" fill="#10B981" />
          )}
        </svg>
      );
    case "rooftop-kit":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          <circle cx="94" cy="24" r="11" fill="#FBBF24" />
          <polygon points="14,52 72,38 66,86 10,98" fill="#1E3A8A" stroke="#CBD5E1" strokeWidth="2.5" />
          <g stroke="#60A5FA" strokeWidth="1">
            <line x1="34" y1="47" x2="29" y2="93" />
            <line x1="53" y1="43" x2="48" y2="89" />
            <line x1="12" y1="69" x2="69" y2="56" />
          </g>
          <rect x="74" y="48" width="34" height="46" rx="5" fill="#F8FAFC" stroke="#1E3A8A" strokeWidth="2.5" />
          <rect x="81" y="56" width="20" height="12" rx="2" fill="#0F172A" />
          <circle cx="91" cy="80" r="4" fill="#10B981" />
        </svg>
      );
    case "inverter-ongrid":
    case "inverter-hybrid":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          <rect x="24" y="16" width="72" height="88" rx="10" fill="#F8FAFC" stroke="#334155" strokeWidth="3" />
          <rect x="24" y="16" width="72" height="18" rx="8" fill={kind === "inverter-hybrid" ? "#047857" : "#12357A"} />
          <rect x="36" y="44" width="48" height="24" rx="4" fill="#0F172A" />
          <text x="60" y="60" textAnchor="middle" fill="#34D399" fontSize="10" fontWeight="800">MPPT</text>
          <circle cx="44" cy="84" r="4" fill="#10B981" />
          <circle cx="60" cy="84" r="4" fill="#F59E0B" />
          <circle cx="76" cy="84" r="4" fill="#3B82F6" />
        </svg>
      );
    case "battery-lithium":
    case "battery-tubular":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          <rect x="26" y="24" width="68" height="78" rx="8" fill={kind === "battery-lithium" ? "#0F172A" : "#1E3A8A"} stroke="#64748B" strokeWidth="2.5" />
          <rect x="34" y="16" width="14" height="8" rx="2" fill="#DC2626" />
          <rect x="72" y="16" width="14" height="8" rx="2" fill="#1E293B" />
          <rect x="36" y="38" width="48" height="20" rx="4" fill="#1E293B" />
          <polygon points="63,40 53,51 59,51 56,62 67,49 61,49" fill="#FBBF24" />
          <rect x="38" y="70" width="44" height="16" rx="3" fill="#10B981" fillOpacity="0.25" stroke="#10B981" />
        </svg>
      );
    case "acdb-dcdb":
    case "net-meter":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          <rect x="22" y="20" width="76" height="80" rx="8" fill="#E2E8F0" stroke="#475569" strokeWidth="3" />
          <rect x="31" y="30" width="58" height="60" rx="4" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" />
          <rect x="37" y="42" width="12" height="22" rx="2" fill="#1E293B" />
          <rect x="54" y="42" width="12" height="22" rx="2" fill="#DC2626" />
          <rect x="71" y="42" width="12" height="22" rx="2" fill="#2563EB" />
          <circle cx="43" cy="76" r="3" fill="#10B981" />
          <circle cx="60" cy="76" r="3" fill="#F59E0B" />
        </svg>
      );
    case "dc-cable":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          <circle cx="52" cy="56" r="34" fill="none" stroke="#DC2626" strokeWidth="8" />
          <circle cx="52" cy="56" r="24" fill="none" stroke="#EF4444" strokeWidth="4" />
          <circle cx="72" cy="64" r="30" fill="none" stroke="#0F172A" strokeWidth="8" />
          <circle cx="72" cy="64" r="20" fill="none" stroke="#334155" strokeWidth="4" />
        </svg>
      );
    case "mc4-connector":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          <rect x="18" y="44" width="38" height="28" rx="5" fill="#0F172A" stroke="#475569" strokeWidth="2" />
          <rect x="56" y="51" width="14" height="14" fill="#FBBF24" />
          <rect x="70" y="44" width="34" height="28" rx="5" fill="#1E293B" stroke="#475569" strokeWidth="2" />
        </svg>
      );
    case "earthing-kit":
    case "lightning-arrester":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          <rect x="55" y="24" width="10" height="78" rx="4" fill="#B45309" stroke="#78350F" strokeWidth="2" />
          <path d="M60 12 L44 30 M60 12 L76 30 M60 12 L60 32" stroke="#D97706" strokeWidth="3.5" strokeLinecap="round" />
          <rect x="26" y="76" width="68" height="26" rx="6" fill="#334155" />
          <text x="60" y="93" textAnchor="middle" fill="#FDE68A" fontSize="9" fontWeight="800">COPPER</text>
        </svg>
      );
    case "hdgi-structure":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          <line x1="22" y1="96" x2="22" y2="54" stroke="#64748B" strokeWidth="6" />
          <line x1="94" y1="96" x2="94" y2="34" stroke="#64748B" strokeWidth="6" />
          <line x1="16" y1="56" x2="104" y2="32" stroke="#334155" strokeWidth="6" />
          <line x1="22" y1="84" x2="94" y2="54" stroke="#94A3B8" strokeWidth="3" />
          <rect x="14" y="94" width="16" height="6" fill="#1E293B" />
          <rect x="86" y="94" width="16" height="6" fill="#1E293B" />
        </svg>
      );
    case "solar-street-light":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          <rect x="24" y="26" width="10" height="78" fill="#475569" />
          <polygon points="34,42 98,28 102,42 34,54" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
          <rect x="52" y="45" width="42" height="8" rx="3" fill="#FEF08A" />
          <polygon points="50,53 96,53 108,98 38,98" fill="#FDE047" fillOpacity="0.28" />
        </svg>
      );
  }
}

export function ToolSvgGraphic({
  kind,
  compact = false,
}: {
  kind: ToolVisualKind;
  compact?: boolean;
}) {
  const cls = compact ? "w-7 h-7" : "w-32 h-32";

  switch (kind) {
    case "angle-grinder":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          <rect x="44" y="48" width="58" height="22" rx="10" fill="#12357A" stroke="#0F172A" strokeWidth="2" />
          <rect x="86" y="51" width="18" height="16" rx="4" fill="#F59E0B" />
          <circle cx="38" cy="59" r="22" fill="#94A3B8" stroke="#334155" strokeWidth="3" />
          <path d="M18 46 A24 24 0 0 1 56 44 L38 59 Z" fill="#1E293B" />
          <circle cx="38" cy="59" r="7" fill="#F8FAFC" />
          <rect x="33" y="24" width="8" height="18" rx="3" fill="#334155" />
        </svg>
      );
    case "marble-cutter":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          <rect x="16" y="82" width="88" height="8" rx="3" fill="#475569" />
          <rect x="34" y="34" width="52" height="32" rx="8" fill="#12357A" stroke="#0F172A" strokeWidth="2" />
          <path d="M68 34 C84 34 94 42 94 54 H78 Z" fill="#1E293B" />
          <circle cx="44" cy="72" r="20" fill="#E2E8F0" stroke="#F59E0B" strokeWidth="3" />
          <circle cx="44" cy="72" r="5" fill="#1E293B" />
        </svg>
      );
    case "rotary-hammer":
    case "impact-drill":
    case "breaker":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          <rect x="26" y="34" width="58" height="24" rx="7" fill={kind === "breaker" ? "#F59E0B" : "#12357A"} stroke="#0F172A" strokeWidth="2" />
          <rect x="14" y="40" width="14" height="12" rx="3" fill="#1E293B" />
          <line x1="6" y1="46" x2="15" y2="46" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
          <rect x="58" y="56" width="16" height="34" rx="5" fill="#1E293B" transform="rotate(8 58 56)" />
          <rect x="44" y="88" width="38" height="12" rx="4" fill="#DC2626" />
          <rect x="32" y="58" width="9" height="20" rx="3" fill="#475569" />
        </svg>
      );
    case "diamond-blade":
    case "metal-disc":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          <circle cx="60" cy="60" r="44" fill={kind === "diamond-blade" ? "#1E3A8A" : "#047857"} stroke="#CBD5E1" strokeWidth="4" />
          <circle cx="60" cy="60" r="35" fill="none" stroke="#FBBF24" strokeWidth="2.5" strokeDasharray="8 5" />
          <circle cx="60" cy="60" r="10" fill="#F8FAFC" stroke="#334155" strokeWidth="3" />
        </svg>
      );
    case "drill-bit":
    case "carbon-brush":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          {kind === "carbon-brush" ? (
            <>
              <rect x="30" y="34" width="22" height="36" rx="3" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
              <path d="M41 70 Q41 90 54 94" fill="none" stroke="#D97706" strokeWidth="4" />
              <rect x="68" y="34" width="22" height="36" rx="3" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
              <path d="M79 70 Q79 90 66 94" fill="none" stroke="#D97706" strokeWidth="4" />
            </>
          ) : (
            <>
              <rect x="28" y="20" width="12" height="80" rx="3" fill="#64748B" />
              <rect x="54" y="16" width="14" height="84" rx="3" fill="#334155" />
              <rect x="82" y="26" width="10" height="74" rx="3" fill="#94A3B8" />
              <path d="M28 40 L40 46 M54 38 L68 46 M54 58 L68 66" stroke="#F8FAFC" strokeWidth="2.5" />
            </>
          )}
        </svg>
      );
    case "hand-kit":
    case "trowel":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          {kind === "trowel" ? (
            <>
              <polygon points="22,88 62,30 88,58" fill="#CBD5E1" stroke="#475569" strokeWidth="2.5" />
              <path d="M74 44 L88 30 L102 44" fill="none" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
            </>
          ) : (
            <>
              <rect x="18" y="26" width="84" height="68" rx="10" fill="#12357A" stroke="#0F172A" strokeWidth="3" />
              <rect x="44" y="18" width="32" height="10" rx="4" fill="#F59E0B" />
              <line x1="36" y1="46" x2="84" y2="46" stroke="#F8FAFC" strokeWidth="6" strokeLinecap="round" />
              <line x1="36" y1="68" x2="84" y2="68" stroke="#FBBF24" strokeWidth="6" strokeLinecap="round" />
            </>
          )}
        </svg>
      );
    case "spirit-level":
    case "measuring-tape":
    case "laser-meter":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          {kind === "measuring-tape" ? (
            <>
              <rect x="24" y="28" width="64" height="60" rx="14" fill="#F59E0B" stroke="#0F172A" strokeWidth="3" />
              <circle cx="56" cy="58" r="16" fill="#1E293B" />
              <rect x="84" y="74" width="22" height="10" rx="2" fill="#E2E8F0" stroke="#334155" strokeWidth="2" />
            </>
          ) : kind === "laser-meter" ? (
            <>
              <rect x="38" y="20" width="44" height="80" rx="8" fill="#12357A" stroke="#0F172A" strokeWidth="3" />
              <rect x="46" y="30" width="28" height="24" rx="4" fill="#0F172A" />
              <text x="60" y="45" textAnchor="middle" fill="#34D399" fontSize="9" fontWeight="800">12.4m</text>
              <circle cx="60" cy="70" r="7" fill="#DC2626" />
            </>
          ) : (
            <g transform="rotate(-14 60 60)">
              <rect x="12" y="46" width="96" height="24" rx="4" fill="#F59E0B" stroke="#1E293B" strokeWidth="2.5" />
              <rect x="50" y="50" width="20" height="16" rx="3" fill="#ECFDF5" stroke="#047857" strokeWidth="2" />
              <circle cx="60" cy="58" r="3" fill="#10B981" />
            </g>
          )}
        </svg>
      );
    case "fastener-box":
    case "sealant-gun":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          <rect x="24" y="30" width="72" height="62" rx="8" fill="#1E293B" stroke="#475569" strokeWidth="3" />
          <rect x="24" y="30" width="72" height="18" rx="6" fill="#F59E0B" />
          <path d="M44 62 V80 M60 62 V80 M76 62 V80" stroke="#CBD5E1" strokeWidth="5" strokeLinecap="round" />
        </svg>
      );
    case "helmet":
    case "goggles":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          {kind === "goggles" ? (
            <>
              <rect x="16" y="44" width="88" height="32" rx="12" fill="#E0F2FE" stroke="#12357A" strokeWidth="3.5" />
              <path d="M52 74 Q60 64 68 74" fill="none" stroke="#12357A" strokeWidth="3" />
            </>
          ) : (
            <>
              <path d="M22 68 C22 34 98 34 98 68 Z" fill="#FBBF24" stroke="#B45309" strokeWidth="3" />
              <rect x="16" y="68" width="88" height="10" rx="5" fill="#F59E0B" />
            </>
          )}
        </svg>
      );
    case "extension-reel":
    case "ladder":
    case "mortar-pan":
    case "tape-tarp":
      return (
        <svg viewBox="0 0 120 120" className={cls} aria-hidden="true">
          {kind === "ladder" ? (
            <>
              <line x1="34" y1="18" x2="22" y2="102" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
              <line x1="86" y1="18" x2="98" y2="102" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
              <line x1="31" y1="36" x2="89" y2="36" stroke="#12357A" strokeWidth="5" />
              <line x1="28" y1="58" x2="92" y2="58" stroke="#12357A" strokeWidth="5" />
              <line x1="25" y1="80" x2="95" y2="80" stroke="#12357A" strokeWidth="5" />
            </>
          ) : kind === "mortar-pan" ? (
            <>
              <ellipse cx="60" cy="48" rx="44" ry="14" fill="#64748B" stroke="#1E293B" strokeWidth="3" />
              <path d="M18 50 L32 88 H88 L102 50" fill="#475569" stroke="#1E293B" strokeWidth="3" />
            </>
          ) : (
            <>
              <circle cx="60" cy="58" r="38" fill="#DC2626" stroke="#1E293B" strokeWidth="4" />
              <circle cx="60" cy="58" r="20" fill="#0F172A" />
              <circle cx="52" cy="58" r="4" fill="#FBBF24" />
              <circle cx="68" cy="58" r="4" fill="#FBBF24" />
            </>
          )}
        </svg>
      );
  }
}
