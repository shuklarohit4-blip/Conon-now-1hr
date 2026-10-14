/**
 * Single source of truth for the customer's CONON Gold Wallet balance.
 * Used by the header wallet box (Layout) and the Gold Wallet tab (BulkRewards)
 * so they never drift apart.
 */
export const GOLD_WALLET_BALANCE = 1250;

export function formatINR(n: number): string {
  return n.toLocaleString("en-IN");
}
