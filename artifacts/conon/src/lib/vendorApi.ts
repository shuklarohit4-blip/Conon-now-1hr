import { api } from "./api";

/* ── Server response shapes (mirror api-server/src/routes/vendor.ts) ───────── */
export interface ApiInventoryItem {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
  unit: string;
  category: string;
  img: string;
}

export interface ApiVendorOrder {
  id: string;
  shortId: string;
  buyer: string;
  items: string;
  time: string;
  value: number;
  status: string;
}

export interface ApiLedgerEntry {
  id: string;
  date: string;
  label: string;
  amount: number;
  type: "payout";
  status: "Approved" | "Pending Admin Approval";
}

export interface ApiWallet {
  balance: number;
  totalEarned: number;
  pendingPayouts: number;
  ledger: ApiLedgerEntry[];
}

export interface CreateProductPayload {
  name: string;
  price: number;
  unit: string;
  category: string;
  img?: string;
}

/* ── Vendor API calls ──────────────────────────────────────────────────────── */
export const vendorApi = {
  async getInventory(): Promise<ApiInventoryItem[]> {
    const { data } = await api.get<ApiInventoryItem[]>("/vendor/inventory");
    return data;
  },

  async updateInventory(
    id: string,
    patch: { price?: number; inStock?: boolean },
  ): Promise<ApiInventoryItem> {
    const { data } = await api.put<ApiInventoryItem>(`/vendor/inventory/${id}`, patch);
    return data;
  },

  async createProduct(payload: CreateProductPayload): Promise<ApiInventoryItem> {
    const { data } = await api.post<ApiInventoryItem>("/vendor/products", payload);
    return data;
  },

  async getOrders(): Promise<ApiVendorOrder[]> {
    const { data } = await api.get<ApiVendorOrder[]>("/vendor/orders");
    return data;
  },

  /** Demo: create a real incoming order for this store (Test New Order). */
  async simulateOrder(): Promise<ApiVendorOrder> {
    const { data } = await api.post<ApiVendorOrder>("/vendor/orders/simulate", {});
    return data;
  },

  async updateOrderStatus(
    id: string,
    status: "packing" | "ready",
  ): Promise<{ id: string; status: string }> {
    const { data } = await api.put<{ id: string; status: string }>(
      `/vendor/orders/${id}/status`,
      { status },
    );
    return data;
  },

  async getWallet(): Promise<ApiWallet> {
    const { data } = await api.get<ApiWallet>("/vendor/wallet");
    return data;
  },

  async requestPayout(amount: number): Promise<ApiWallet> {
    const { data } = await api.post<ApiWallet>("/vendor/payouts/request", { amount });
    return data;
  },
};
