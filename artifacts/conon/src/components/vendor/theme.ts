export const GREEN = "#15803d";
export const GREEN_DARK = "#14532d";

export type VendorTab = "dashboard" | "orders" | "products" | "inventory" | "khata";

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
export const inrShort = (n: number) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L` : `₹${(n / 1000).toFixed(0)}k`;
