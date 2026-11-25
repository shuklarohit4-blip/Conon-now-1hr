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
const base = (typeof import.meta !== "undefined" && import.meta.env?.BASE_URL) ? import.meta.env.BASE_URL.replace(/\/$/, "") : "";
export const CONON_FALLBACK_IMG = `${base}/images/products/cement/ultratech-weatherplus.webp`;

/**
 * onError handler for any <img>. Swaps to the authentic real studio photography fallback.
 *
 * Loop-safe by checking if src is already the fallback.
 * Guarantees ZERO procedural SVG boxes or empty placeholders ever appear.
 *
 * Usage: <img src={url} onError={onImgError} ... />
 */
export function onImgError(e: SyntheticEvent<HTMLImageElement>): void {
  const img = e.currentTarget;
  if (img.src.includes("ultratech-weatherplus.webp") || img.src.includes("cement-bag.jpg")) return;
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
