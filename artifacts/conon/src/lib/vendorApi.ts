import { api } from "./api";

/* ── Vendor Profile & Hub Shapes ───────────────────────────────────────────── */
export interface VendorProfile {
  id: string;
  shopCode: string;
  shopName: string;
  ownerName: string;
  phone: string;
  email: string;
  hubZone: string;
  hubAddress: string;
  gstin: string;
  categories: string[];
  isOpen: boolean;
  rating: number;
  slaScore: number;
  bankAccountMasked: string;
  upiId: string;
  operatingHours: string;
}

/* ── Order & Rider Shapes ─────────────────────────────────────────────────── */
export interface VendorRiderInfo {
  name: string;
  phone: string;
  vehicleType: "2W_BIKE" | "3W_ELECTRIC_LOADER" | "4W_PICKUP" | "TRACTOR_DUMPER";
  vehicleLabel: string;
  plateNumber: string;
  etaMins: number;
  distanceKm: number;
  avatarUrl?: string;
}

export interface VendorOrderItem {
  skuId: string;
  name: string;
  brand: string;
  category: string;
  unit: string;
  qty: number;
  customerPrice: number;
  dealerPayout: number;
  image?: string;
  batchGuardrail?: string;
}

export interface VendorOrder {
  id: string;
  shortId: string;
  buyer: string;
  customerName?: string;
  customerPhone?: string;
  deliveryArea?: string;
  deliveryAddress?: string;
  items: string;
  itemsDetailed?: VendorOrderItem[];
  time: string;
  placedAt?: string;
  minsLeft?: number;
  slaMins?: number;
  value: number;
  totalDealerPayout?: number;
  status: "new" | "packing" | "ready";
  rawStatus?: "NEW_REQUEST" | "PACKING_READY" | "HANDED_OVER" | "DELIVERED" | "FLAGGED_SHORTAGE";
  pickupOtp?: string;
  rider?: VendorRiderInfo;
  flaggedReason?: string;
}

/* ── Payout & Ledger Shapes ───────────────────────────────────────────────── */
export interface VendorPayoutLedgerRow {
  id: string;
  orderId?: string;
  date: string;
  description: string;
  amount: number;
  type: "EARNING" | "WITHDRAWAL" | "SETTLEMENT";
  status: "SETTLED" | "PENDING";
  utrNumber?: string;
  bankAccount: string;
}

export interface VendorWalletData {
  todayEarnings: number;
  pendingSettlement: number;
  totalSettledMonth: number;
  nextSettlementDate: string;
  bankAccountMasked: string;
  ledger: VendorPayoutLedgerRow[];
}

/* ── SSOT Catalog SKU Shape ───────────────────────────────────────────────── */
export interface MasterCatalogSKU {
  id: string;
  name: string;
  brand: string;
  category: string;
  categoryName?: string;
  unit: string;
  packSize?: string;
  sellingPrice: number;
  dealerLandingCost: number;
  mrp?: number;
  gstPercent?: number;
  hsnCode?: string;
  deliveryVehicleType?: string;
  expressDelivery?: boolean;
  inStock: boolean;
  featured?: boolean;
  imageUrl: string;
  fitGuardrailBadge?: string;
  bullets?: string[];
  specs?: Record<string, string>;
}

/* ── Legacy Compat Types ──────────────────────────────────────────────────── */
export interface ApiInventoryItem {
  id: string;
  name: string;
  price: number;
  sellingPrice?: number;
  inStock: boolean;
  unit: string;
  category: string;
  img: string;
  brand?: string;
  fitGuardrail?: string;
}

export interface ApiVendorOrder extends VendorOrder {}

export interface ApiLedgerEntry {
  id: string;
  date: string;
  label: string;
  amount: number;
  type: "payout";
  status: "Approved" | "Pending Admin Approval";
  utrNumber?: string;
}

export interface ApiWallet {
  balance: number;
  totalEarned: number;
  pendingPayouts: number;
  todayEarnings?: number;
  totalSettledMonth?: number;
  nextSettlementDate?: string;
  bankAccountMasked?: string;
  ledger: ApiLedgerEntry[];
}

export interface CreateProductPayload {
  name: string;
  price: number;
  unit: string;
  category: string;
  img?: string;
}

/* ── Vendor API Client ─────────────────────────────────────────────────────── */
export const vendorApi = {
  /** Fetch authenticated vendor profile and active hub info. */
  async getMe(): Promise<VendorProfile> {
    const { data } = await api.get<{ success: boolean; vendor: VendorProfile }>("/vendor/me");
    return data.vendor;
  },

  /** Get all 4 pre-seeded Lucknow hub stores for demo switching. */
  async getHubs(): Promise<VendorProfile[]> {
    const { data } = await api.get<{ success: boolean; hubs: VendorProfile[] }>("/vendor/hubs");
    return data.hubs;
  },

  /** 1-Click switch active demo store across the 4 Lucknow hubs. */
  async switchShop(shopCodeOrId: string): Promise<{ token: string; vendor: VendorProfile }> {
    const { data } = await api.post<{ success: boolean; token: string; vendor: VendorProfile }>(
      "/vendor/switch-shop",
      { shopCodeOrId },
    );
    return data;
  },

  /** Toggle store open/closed (Dukaan Chalu / Band). */
  async setStoreStatus(isOpen: boolean): Promise<{ isOpen: boolean; vendor: VendorProfile }> {
    const { data } = await api.patch<{ success: boolean; isOpen: boolean; vendor: VendorProfile }>(
      "/vendor/status",
      { isOpen },
    );
    return data;
  },

  /** Get live incoming and in-progress orders. */
  async getOrders(): Promise<VendorOrder[]> {
    const { data } = await api.get<VendorOrder[]>("/vendor/orders");
    return data;
  },

  /** Accept order, transition to PACKING_READY, and generate 4-digit pickup OTP. */
  async acceptOrder(orderId: string): Promise<{ id: string; status: string; pickupOtp?: string }> {
    const { data } = await api.post<{ id: string; status: string; pickupOtp?: string }>(
      `/vendor/orders/${orderId}/accept`,
      {},
    );
    return data;
  },

  /** Mark order handed over to rider (credits vendor wallet). */
  async markReady(orderId: string): Promise<{ id: string; status: string }> {
    const { data } = await api.post<{ id: string; status: string }>(
      `/vendor/orders/${orderId}/ready-for-pickup`,
      {},
    );
    return data;
  },

  /** Flag shortage / damaged stock for an incoming order. */
  async flagShortage(orderId: string, reason: string): Promise<any> {
    const { data } = await api.post(`/vendor/orders/${orderId}/flag-shortage`, { reason });
    return data;
  },

  /** Simulate a realistic incoming order with real catalog SKUs and 4-digit OTP. */
  async devTestOrder(): Promise<VendorOrder> {
    const { data } = await api.post<VendorOrder>("/vendor/dev/test-order", {});
    return data;
  },

  /** Get real SSOT catalog SKUs for this vendor's category. */
  async getProducts(): Promise<MasterCatalogSKU[]> {
    const { data } = await api.get<MasterCatalogSKU[]>("/vendor/products");
    return data;
  },

  /** 1-tap stock toggle or dealer landing cost update. */
  async updateProduct(
    skuId: string,
    patch: { inStock?: boolean; dealerLandingCost?: number; price?: number },
  ): Promise<MasterCatalogSKU> {
    const { data } = await api.patch<{ success: boolean; product: MasterCatalogSKU }>(
      `/vendor/products/${skuId}`,
      patch,
    );
    return data.product;
  },

  /** Get "Paisa Meter" wallet, T+1 settlement details, and passbook ledger with UTR numbers. */
  async getPayouts(): Promise<VendorWalletData> {
    const { data } = await api.get<{ success: boolean; wallet: VendorWalletData }>("/vendor/payouts");
    return data.wallet;
  },

  /** Request settlement withdrawal from available wallet balance. */
  async requestPayout(amount: number): Promise<ApiWallet> {
    const { data } = await api.post<ApiWallet>("/vendor/payouts/request", { amount });
    return data;
  },

  /* ── Legacy Backward Compatible Methods ── */
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

  async simulateOrder(): Promise<VendorOrder> {
    return this.devTestOrder();
  },

  async updateOrderStatus(
    id: string,
    status: "packing" | "ready",
  ): Promise<{ id: string; status: string }> {
    if (status === "packing") {
      return this.acceptOrder(id);
    }
    return this.markReady(id);
  },

  async getWallet(): Promise<ApiWallet> {
    const { data } = await api.get<ApiWallet>("/vendor/wallet");
    return data;
  },
};
