/* ────────────────────────────────────────────────────────────────
   Payment utilities & gateway stubs for CONON checkout.

   The actual gateway (Razorpay / Stripe) is NOT wired yet. The
   `processPayment` function is a placeholder that simulates a real
   async charge so the full UI flow (processing → success / failure)
   can be exercised today and swapped for a live SDK call later.

   To integrate a real gateway later, replace the body of
   `processPayment` with the gateway's checkout call and keep the
   same return contract.
   ──────────────────────────────────────────────────────────────── */

export type PaymentMethod = "upi" | "card" | "netbanking" | "cod" | "khata";

/** Which overall payment plan the buyer chose for a high-ticket order. */
export type PaymentPlan = "full" | "token" | "khata";

/** Fraction of the order paid up-front when the buyer picks the token plan. */
export const TOKEN_FRACTION = 0.2;

/** Compute the up-front advance (rounded up) for the 20% token plan. */
export function tokenAdvance(amount: number): number {
  return Math.ceil(amount * TOKEN_FRACTION);
}

/** Fire device haptic feedback if the browser supports it. Safe no-op otherwise. */
export function haptic(pattern: number | number[] = 14): void {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* vibration unsupported / blocked — ignore */
  }
}

export interface UpiDetails    { upiId: string }
export interface CardDetails   { number: string; expiry: string; cvv: string; name: string }
export interface BankDetails   { bankCode: string }

export interface PaymentRequest {
  method: PaymentMethod;
  amount: number;
  upi?: UpiDetails;
  card?: CardDetails;
  bank?: BankDetails;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  /** Human-readable failure reason when success === false */
  error?: string;
}

/* ── UPI apps (display only — real intents handled by gateway) ── */
export const UPI_APPS = [
  { id: "gpay",    name: "Google Pay", color: "#1a73e8", short: "G Pay"   },
  { id: "phonepe", name: "PhonePe",    color: "#5f259f", short: "PhonePe" },
  { id: "paytm",   name: "Paytm",      color: "#00baf2", short: "Paytm"   },
] as const;

/* ── Supported net-banking banks ──────────────────────────────── */
export const BANKS = [
  { code: "SBIN", name: "State Bank of India" },
  { code: "HDFC", name: "HDFC Bank" },
  { code: "ICIC", name: "ICICI Bank" },
  { code: "UTIB", name: "Axis Bank" },
  { code: "KKBK", name: "Kotak Mahindra Bank" },
  { code: "PUNB", name: "Punjab National Bank" },
  { code: "BARB", name: "Bank of Baroda" },
  { code: "YESB", name: "Yes Bank" },
] as const;

/* ────────────────────────── Validators ─────────────────────────── */

/** Strip non-digits */
const digits = (s: string) => s.replace(/\D/g, "");

/** Format a raw card number into 4-digit groups: "4111 1111 1111 1111" */
export function formatCardNumber(raw: string): string {
  return digits(raw).slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

/** Format an expiry input into MM/YY */
export function formatExpiry(raw: string): string {
  const d = digits(raw).slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

export type CardBrand = "visa" | "mastercard" | "amex" | "rupay" | "unknown";

/** Best-effort card brand detection from the leading digits */
export function detectCardBrand(raw: string): CardBrand {
  const n = digits(raw);
  if (/^4/.test(n)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  if (/^(60|65|81|82|508)/.test(n)) return "rupay";
  return "unknown";
}

/** Luhn checksum + length validation */
export function validateCardNumber(raw: string): boolean {
  const n = digits(raw);
  if (n.length < 15 || n.length > 16) return false;
  let sum = 0, alt = false;
  for (let i = n.length - 1; i >= 0; i--) {
    let d = parseInt(n[i], 10);
    if (alt) { d *= 2; if (d > 9) d -= 9; }
    sum += d; alt = !alt;
  }
  return sum % 10 === 0;
}

/** Validate MM/YY expiry is well-formed AND in the future */
export function validateExpiry(value: string): boolean {
  const m = value.match(/^(\d{2})\/(\d{2})$/);
  if (!m) return false;
  const month = parseInt(m[1], 10);
  const year  = 2000 + parseInt(m[2], 10);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const exp = new Date(year, month, 0, 23, 59, 59); // last day of month
  return exp >= now;
}

/** CVV: 3 digits (4 for Amex) */
export function validateCVV(value: string, brand: CardBrand = "unknown"): boolean {
  const n = digits(value);
  return brand === "amex" ? n.length === 4 : n.length === 3;
}

/** Basic UPI VPA validation: handle@bank */
export function validateUpiId(value: string): boolean {
  return /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(value.trim());
}

/* ────────────────────── Gateway placeholder ────────────────────── */

const genTxnId = () =>
  "TXN" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();

/**
 * Placeholder for the real payment gateway charge.
 *
 * Simulates network latency and returns a success/failure result.
 * Deterministic test triggers (so the failure UI is reachable):
 *   • UPI id containing "fail"            → declined
 *   • Card number 4000 0000 0000 0002     → declined (Stripe-style test)
 * Everything else (incl. COD) succeeds.
 *
 * Replace this body with Razorpay/Stripe SDK calls when going live.
 */
export function processPayment(req: PaymentRequest): Promise<PaymentResult> {
  return new Promise((resolve) => {
    const latency = req.method === "cod" ? 600 : req.method === "khata" ? 1300 : 1900;
    setTimeout(() => {
      // Simulated declines for testing the failure path
      if (req.method === "upi" && /fail/i.test(req.upi?.upiId ?? "")) {
        resolve({ success: false, error: "Payment declined by your UPI app. Please try again." });
        return;
      }
      if (req.method === "card" && digits(req.card?.number ?? "") === "4000000000000002") {
        resolve({ success: false, error: "Your card was declined. Please use a different card." });
        return;
      }
      // COD and Khata (business credit) post instantly with no live charge.
      resolve({ success: true, transactionId: genTxnId() });
    }, latency);
  });
}
