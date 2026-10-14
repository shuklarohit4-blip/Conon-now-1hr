/* ────────────────────────────────────────────────────────────────
   Construction logistics estimator for CONON checkout.

   Estimates the gross shipment weight from the cart, picks the right
   truck tier and computes a dynamic Delivery & Logistics Fee plus an
   optional Unloading / Labour Service fee. Heavy materials → bigger
   truck → higher fee, which is what makes the bill "construction
   specific" rather than a flat Zepto-style delivery charge.
   ──────────────────────────────────────────────────────────────── */

export interface LogisticsItem {
  category?: string | null;
  unit?: string | null;
  name?: string | null;
  quantity: number;
}

export interface TruckTier {
  id: string;
  /** Friendly truck name shown to the user */
  label: string;
  /** Inclusive upper weight bound for this tier (kg) */
  maxKg: number;
  /** Base delivery & logistics fee for this truck (₹) */
  fee: number;
  /** Unloading / labour service fee for this truck (₹) */
  unloadFee: number;
}

export const TRUCK_TIERS: TruckTier[] = [
  { id: "ace",     label: "Tata Ace (Mini Truck)", maxKg: 750,      fee: 250,  unloadFee: 199 },
  { id: "pickup",  label: "Pickup (1.5 Tonne)",    maxKg: 1500,     fee: 450,  unloadFee: 349 },
  { id: "six",     label: "6-Wheeler (9 Tonne)",   maxKg: 9000,     fee: 1200, unloadFee: 899 },
  { id: "ten",     label: "10-Wheeler (16 Tonne)", maxKg: 16000,    fee: 2200, unloadFee: 1499 },
  { id: "trailer", label: "Heavy Trailer (25T+)",  maxKg: Infinity, fee: 3800, unloadFee: 2400 },
];

/** Approximate weight in kg for one unit of an item, from its unit + category. */
function unitWeightKg(category: string, unit: string): number {
  const u = unit.toLowerCase();
  const c = category.toLowerCase();

  /* Unit-driven estimates take priority — they are the most reliable. */
  if (/tonne|\bton\b|\bmt\b/.test(u)) return 1000;
  if (/quintal/.test(u)) return 100;
  if (/\bkg\b|kilogram/.test(u)) return 1;
  if (/bag/.test(u)) return 50;            // cement / additive bag ≈ 50 kg
  if (/cft|cubic\s*feet/.test(u)) return 45; // aggregate / sand ≈ 45 kg/cft
  if (/bundle/.test(u)) return 25;
  if (/bucket|drum|pail/.test(u)) return 20;
  if (/box|carton/.test(u)) return 18;
  if (/litre|liter|\bltr\b/.test(u)) return 1.3;
  if (/brick/.test(u)) return 3;
  if (/sheet|panel/.test(u)) return 12;

  /* Per-piece / generic units fall back to category. */
  if (c.includes("cement")) return 50;
  if (c.includes("steel") || c.includes("tmt") || c.includes("iron")) return 8;
  if (c.includes("sand") || c.includes("aggregate") || c.includes("morang") || c.includes("gravel")) return 50;
  if (c.includes("brick") || c.includes("block")) return 3;
  if (c.includes("tile")) return 18;
  if (c.includes("paint")) return 5;
  if (c.includes("plumb") || c.includes("pipe")) return 4;
  if (c.includes("electric")) return 1.5;
  if (c.includes("tool") || c.includes("hardware")) return 2;

  return 5; // sensible default for misc items
}

export interface LogisticsEstimate {
  /** Estimated gross shipment weight, kg (rounded) */
  weightKg: number;
  /** The selected truck tier */
  truck: TruckTier;
  /** Delivery & logistics fee (₹) */
  fee: number;
  /** Unloading / labour service fee for this shipment (₹) */
  unloadFee: number;
}

/** Estimate shipment weight, choose a truck and compute logistics fees. */
export function estimateLogistics(items: LogisticsItem[]): LogisticsEstimate {
  const weightKg = items.reduce(
    (sum, it) => sum + unitWeightKg(it.category ?? "", it.unit ?? "") * (it.quantity || 0),
    0,
  );
  const truck = TRUCK_TIERS.find((t) => weightKg <= t.maxKg) ?? TRUCK_TIERS[TRUCK_TIERS.length - 1];
  return {
    weightKg: Math.round(weightKg),
    truck,
    fee: truck.fee,
    unloadFee: truck.unloadFee,
  };
}

/** Format a weight for display: 845 kg → "845 kg", 2400 kg → "2.4 T". */
export function formatWeight(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(kg % 1000 === 0 ? 0 : 1)} T`;
  return `${kg} kg`;
}
