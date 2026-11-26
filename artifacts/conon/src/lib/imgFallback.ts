import type { SyntheticEvent } from "react";

/* Zero-legacy empty fallback helpers: never inject fake stock or SVG product images */
export const CONON_FALLBACK_IMG = "";

export function onImgError(e: SyntheticEvent<HTMLImageElement>): void {
  const img = e.currentTarget;
  img.style.display = "none";
}

export function categoryPhoto(_category?: string | null): string {
  return "";
}
