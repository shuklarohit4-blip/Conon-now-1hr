import React from "react";

/**
 * Crisp inline vector illustrations for every Conon Now category.
 * Used seamlessly as instant zero-grey fallback whenever webp thumbnails
 * are loading or unavailable across Web tiles.
 */
export function CategoryIllustration({ slug }: { slug?: string }) {
  const s = (slug || "").toLowerCase();

  if (s.includes("rmc") || s.includes("concrete")) {
    return (
      <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
        <rect x="8" y="44" width="44" height="14" rx="3" fill="#12357A" />
        <path d="M52 38h13l6 10v10H52V38z" fill="#1E40AF" />
        <rect x="55" y="41" width="9" height="6" rx="1" fill="#BAE6FD" />
        <path d="M12 24c12-4 28-2 36 8l-5 12H14L12 24z" fill="#F59E0B" stroke="#0B1B3D" strokeWidth="2.5" />
        <path d="M22 25l12 16M32 26l10 14" stroke="#0B1B3D" strokeWidth="2" strokeLinecap="round" />
        <circle cx="22" cy="60" r="7" fill="#0F172A" stroke="#CBD5E1" strokeWidth="2.5" />
        <circle cx="60" cy="60" r="7" fill="#0F172A" stroke="#CBD5E1" strokeWidth="2.5" />
      </svg>
    );
  }

  if (s.includes("cctv") || s.includes("camera")) {
    return (
      <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
        <rect x="14" y="18" width="52" height="10" rx="5" fill="#1E293B" />
        <path d="M20 28c0 16 9 28 20 28s20-12 20-28H20z" fill="#E2E8F0" stroke="#0B1B3D" strokeWidth="2.5" />
        <circle cx="40" cy="40" r="9" fill="#0F172A" />
        <circle cx="40" cy="40" r="4" fill="#38BDF8" />
        <circle cx="52" cy="34" r="2.2" fill="#EF4444" />
      </svg>
    );
  }

  if (s.includes("solar")) {
    return (
      <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
        <circle cx="62" cy="18" r="9" fill="#F59E0B" />
        <path d="M14 34l42-6 10 30-42 6-10-30z" fill="#12357A" stroke="#0B1B3D" strokeWidth="2.5" />
        <path d="M24 33l8 28M38 31l8 28M19 46l42-6" stroke="#38BDF8" strokeWidth="1.8" />
        <path d="M36 64h14M43 58v6" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (s.includes("lighting") || s.includes("lamp")) {
    return (
      <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
        <ellipse cx="40" cy="28" rx="26" ry="12" fill="#E2E8F0" stroke="#12357A" strokeWidth="2.5" />
        <ellipse cx="40" cy="28" rx="19" ry="7.5" fill="#FEF08A" />
        <path d="M22 44l-5 14M40 46v16M58 44l5 14" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (s.includes("wire") || s.includes("electrical")) {
    return (
      <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
        <circle cx="40" cy="40" r="23" stroke="#B45309" strokeWidth="8" />
        <circle cx="40" cy="40" r="14" stroke="#DC2626" strokeWidth="5" />
        <circle cx="40" cy="40" r="7" fill="#F8FAFC" stroke="#0F172A" strokeWidth="2" />
        <path d="M56 54l12 10" stroke="#B45309" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  if (s.includes("tool") || s.includes("safety")) {
    return (
      <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
        <rect x="20" y="24" width="32" height="16" rx="4" fill="#12357A" />
        <rect x="52" y="28" width="14" height="8" rx="2" fill="#64748B" />
        <path d="M26 40l-4 22h11l4-22H26z" fill="#0B1B3D" />
        <circle cx="58" cy="46" r="11" fill="#E2E8F0" stroke="#F59E0B" strokeWidth="3" />
      </svg>
    );
  }

  if (s.includes("cpvc") || s.includes("plumb") || s.includes("sanitary") || s.includes("sink")) {
    return (
      <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
        <path d="M16 26h28a8 8 0 0 1 8 8v28" stroke="#E2B86B" strokeWidth="10" strokeLinecap="round" />
        <path d="M16 26h28a8 8 0 0 1 8 8v28" stroke="#0B1B3D" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" />
        <rect x="12" y="20" width="8" height="12" rx="2" fill="#12357A" />
        <rect x="46" y="56" width="12" height="8" rx="2" fill="#12357A" />
      </svg>
    );
  }

  if (s.includes("cement") || s.includes("brick") || s.includes("steel")) {
    return (
      <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
        <rect x="18" y="16" width="44" height="48" rx="6" fill="#E2E8F0" stroke="#0B1B3D" strokeWidth="2.5" />
        <rect x="24" y="28" width="32" height="18" rx="3" fill="#F59E0B" />
        <path d="M28 54h24" stroke="#12357A" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (s.includes("paint") || s.includes("waterproof") || s.includes("fevicol")) {
    return (
      <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
        <rect x="20" y="24" width="40" height="40" rx="5" fill="#12357A" />
        <rect x="18" y="20" width="44" height="7" rx="3" fill="#F59E0B" />
        <circle cx="40" cy="44" r="9" fill="#38BDF8" />
      </svg>
    );
  }

  // Crisp default tile/plywood/architectural hardware visual
  return (
    <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
      <rect x="14" y="16" width="24" height="24" rx="4" fill="#12357A" opacity="0.88" />
      <rect x="42" y="16" width="24" height="24" rx="4" fill="#F59E0B" opacity="0.9" />
      <rect x="14" y="44" width="24" height="20" rx="4" fill="#059669" opacity="0.85" />
      <rect x="42" y="44" width="24" height="20" rx="4" fill="#1E293B" opacity="0.85" />
    </svg>
  );
}
