export type PromoCode = {
  code: string;
  label: string;
  description: string;
  type: "flat" | "percent";
  value: number;
  minOrder: number;
  maxDiscount?: number;
};

export const PROMO_CODES: Record<string, PromoCode> = {
  CONON500: {
    code: "CONON500",
    label: "₹500 OFF",
    description: "Flat ₹500 off on orders above ₹2,000",
    type: "flat",
    value: 500,
    minOrder: 2000,
  },
  SAVE10: {
    code: "SAVE10",
    label: "10% OFF",
    description: "10% off (max ₹400) on orders above ₹1,000",
    type: "percent",
    value: 10,
    minOrder: 1000,
    maxDiscount: 400,
  },
  FIRSTSITE: {
    code: "FIRSTSITE",
    label: "₹200 OFF",
    description: "First-site discount: ₹200 off on orders above ₹500",
    type: "flat",
    value: 200,
    minOrder: 500,
  },
  LUCKNOW100: {
    code: "LUCKNOW100",
    label: "₹100 OFF",
    description: "Lucknow special: ₹100 off, no minimum order",
    type: "flat",
    value: 100,
    minOrder: 0,
  },
  CONONBULK: {
    code: "CONONBULK",
    label: "₹2,000 OFF",
    description: "Bulk offer: flat ₹2,000 off on orders of 100+ cement bags (min ₹35,000)",
    type: "flat",
    value: 2000,
    minOrder: 35000,
  },
};

export type PromoResult =
  | { ok: true; promo: PromoCode; discount: number; finalTotal: number }
  | { ok: false; reason: string };

export function validatePromo(rawCode: string, subtotal: number): PromoResult {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, reason: "Enter a promo code" };

  const promo = PROMO_CODES[code];
  if (!promo) return { ok: false, reason: "Invalid promo code" };

  if (subtotal < promo.minOrder) {
    return {
      ok: false,
      reason: `Add ₹${promo.minOrder - subtotal} more to use ${promo.code}`,
    };
  }

  let discount =
    promo.type === "flat"
      ? promo.value
      : Math.round((subtotal * promo.value) / 100);

  if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount);
  discount = Math.min(discount, subtotal);

  return { ok: true, promo, discount, finalTotal: Math.max(0, subtotal - discount) };
}

const LS_KEY = "conon_last_promo";

export function rememberPromo(code: string): void {
  try {
    localStorage.setItem(LS_KEY, code.trim().toUpperCase());
  } catch {
    /* noop */
  }
}

export function recallPromo(): string {
  try {
    return localStorage.getItem(LS_KEY) ?? "";
  } catch {
    return "";
  }
}

export function forgetPromo(): void {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {
    /* noop */
  }
}
