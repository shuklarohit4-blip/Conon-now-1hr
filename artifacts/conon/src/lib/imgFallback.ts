import type { SyntheticEvent } from "react";

/* ─────────────────────────────────────────────────────────────────────
   Bulletproof image fallback.

   A single, LOCAL (data-URI) placeholder used whenever any remote image
   fails to load. Because it is inlined as an SVG data URI it has zero
   network dependency — it can never itself 404 or time out, so the UI is
   guaranteed to render a clean labelled card instead of a broken icon or
   blank space (even offline). This is intentionally local rather than an
   external service (e.g. placehold.co) so the "never-break" guarantee
   holds without a third-party request.
   ──────────────────────────────────────────────────────────────────── */
const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
  <rect width="600" height="400" fill="#f1f5f9"/>
  <rect x="262" y="150" width="76" height="58" rx="8" fill="none" stroke="#94a3b8" stroke-width="5"/>
  <path d="M262 188l24-22 20 18 26-26 30 28v22a8 8 0 0 1-8 8h-84a8 8 0 0 1-8-8z" fill="#cbd5e1"/>
  <circle cx="312" cy="170" r="9" fill="#cbd5e1"/>
  <text x="300" y="262" font-family="Outfit, Montserrat, Arial, sans-serif" font-size="30" font-weight="700" fill="#475569" text-anchor="middle">Conon Material</text>
</svg>`;

export const CONON_FALLBACK_IMG = `data:image/svg+xml;utf8,${encodeURIComponent(FALLBACK_SVG)}`;

/**
 * onError handler for any <img>. Swaps to the local Conon placeholder.
 *
 * Loop-safe by comparing against the placeholder itself rather than a sticky
 * flag: once src already equals the data-URI placeholder we no-op (and the
 * data URI cannot itself error). Because the guard is keyed on the current
 * src — not a one-time flag — a reused/virtualised <img> node whose src later
 * changes to a NEW broken url will correctly fall back again.
 *
 * Usage: <img src={url} onError={onImgError} ... />
 */
export function onImgError(e: SyntheticEvent<HTMLImageElement>): void {
  const img = e.currentTarget;
  if (img.src === CONON_FALLBACK_IMG) return;
  img.src = CONON_FALLBACK_IMG;
}

/* ─────────────────────────────────────────────────────────────────────
   Local-first material image resolver.

   Maps a DB category to a representative LOCAL product photo in
   /public/products/. Used wherever a material has no (local) imageUrl so the
   UI shows a real, on-brand photo instead of an empty icon — with zero remote
   dependency. Falls back to cement for unknown categories.
   ──────────────────────────────────────────────────────────────────── */
const CATEGORY_SLUG: Record<string, string> = {
  cement: "cement-bag", steel: "tmt-bars", sand: "sand", aggregate: "aggregate",
  bricks: "red-brick", electrical: "wire", plumbing: "pipe", paint: "paint-bucket",
  tiles: "floor-tile", finishing: "putty", hardware: "door-hardware", safety: "helmet",
  tools: "drill", shuttering: "scaffolding", wood: "plywood",
};

export function categoryPhoto(category?: string | null): string {
  const slug = CATEGORY_SLUG[(category || "").toLowerCase()] ?? "cement-bag";
  return `${import.meta.env.BASE_URL}products/${slug}.jpg`;
}
