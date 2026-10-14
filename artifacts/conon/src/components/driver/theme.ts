/* Conon Fleet — Driver Partner App brand tokens.
   High-contrast, sunlight-readable colors with strict semantic coding:
   green = proceed/success, red = offline/danger, yellow = warning. */
export const GREEN = "#16a34a";
export const GREEN_DARK = "#15803d";
export const RED = "#dc2626";
export const RED_DARK = "#991b1b";
export const YELLOW = "#f59e0b";
export const INK = "#0f172a";

export type DriverTab = "duty" | "kamai";

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
