// Server-authoritative bill calculation for the 1-hour delivery checkout.
// Keeping this in one place means delivery, labour and GST rules are consistent
// and can't be tampered with from the client.

export interface BillItem {
  price: number;
  quantity: number;
  category: string;
}

export interface BillOptions {
  isB2B?: boolean;
  distanceKm?: number;
}

export interface Bill {
  subtotal: number;
  deliveryFee: number;
  labourFee: number;
  gstAmount: number;
  total: number;
}

// Heavy materials that require manual unloading labour at the site.
const HEAVY_CATEGORIES = new Set([
  "cement",
  "steel",
  "bricks",
  "sand",
  "aggregate",
]);

const GST_RATE = 0.18;
const FREE_DELIVERY_THRESHOLD = 50000;
const REDUCED_DELIVERY_THRESHOLD = 20000;
const BASE_DELIVERY_FEE = 199;
const REDUCED_DELIVERY_FEE = 99;
const FREE_DISTANCE_KM = 10;
const PER_KM_FEE = 12;
const LABOUR_PER_HEAVY_UNIT = 15;
const MIN_LABOUR_FEE = 99;

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function computeBill(items: BillItem[], opts: BillOptions = {}): Bill {
  const subtotal = round2(
    items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  );

  // Dynamic delivery fee: tiered by order value, with a distance surcharge
  // beyond the free radius.
  let deliveryFee: number;
  if (subtotal >= FREE_DELIVERY_THRESHOLD) {
    deliveryFee = 0;
  } else if (subtotal >= REDUCED_DELIVERY_THRESHOLD) {
    deliveryFee = REDUCED_DELIVERY_FEE;
  } else {
    deliveryFee = BASE_DELIVERY_FEE;
  }

  const distanceKm = opts.distanceKm ?? 0;
  if (distanceKm > FREE_DISTANCE_KM) {
    deliveryFee += Math.ceil(distanceKm - FREE_DISTANCE_KM) * PER_KM_FEE;
  }
  deliveryFee = round2(deliveryFee);

  // Labour / unloading fee based on the quantity of heavy materials.
  const heavyUnits = items
    .filter((i) => HEAVY_CATEGORIES.has(i.category.toLowerCase()))
    .reduce((sum, i) => sum + i.quantity, 0);
  const labourFee =
    heavyUnits > 0
      ? round2(Math.max(MIN_LABOUR_FEE, heavyUnits * LABOUR_PER_HEAVY_UNIT))
      : 0;

  // GST is charged explicitly on B2B invoices. B2C catalogue prices are treated
  // as tax-inclusive, so no separate GST line is added for them.
  const gstAmount = opts.isB2B
    ? round2((subtotal + deliveryFee + labourFee) * GST_RATE)
    : 0;

  const total = round2(subtotal + deliveryFee + labourFee + gstAmount);

  return { subtotal, deliveryFee, labourFee, gstAmount, total };
}
