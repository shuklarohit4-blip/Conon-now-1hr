import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  vendorApi,
  type ApiInventoryItem,
  type ApiVendorOrder,
  type ApiLedgerEntry,
  type CreateProductPayload,
} from "@/lib/vendorApi";

/* ──────────────────────────────────────────────────────────────────────────
   VendorContext — the single source of truth for the Vendor Panel.

   Backed entirely by the api-server (no localStorage mock). On mount it loads
   the vendor's own inventory, orders and wallet (scoped server-side by the
   vendor JWT). Every mutation hits the backend first and only updates local
   state on success, so the UI never drifts from the database.
   ────────────────────────────────────────────────────────────────────────── */

export type OrderStatus = "new" | "packing" | "ready";

export interface VendorOrder {
  id: string;
  shortId: string;
  buyer: string;
  items: string;
  time: string;
  value: number;
  status: OrderStatus;
}

export interface InventoryItem {
  id: string;
  name: string;
  emoji: string;
  bg: string;
  img: string;
  price: number;
  inStock: boolean;
  unit: string;
  category: string;
}

export type LedgerStatus = "Pending Admin Approval" | "Approved";
export type LedgerType = "payout";

export interface LedgerEntry {
  id: string;
  date: string;
  label: string;
  amount: number;
  type: LedgerType;
  status: LedgerStatus;
}

const FALLBACK_BG = "#f0f9ff";

function mapItem(a: ApiInventoryItem): InventoryItem {
  return {
    id: a.id,
    name: a.name,
    price: a.price,
    inStock: a.inStock,
    unit: a.unit,
    category: a.category,
    img: a.img,
    emoji: "📦",
    bg: FALLBACK_BG,
  };
}

function mapOrder(a: ApiVendorOrder): VendorOrder {
  return {
    id: a.id,
    shortId: a.shortId,
    buyer: a.buyer,
    items: a.items,
    time: a.time,
    value: a.value,
    status: (a.status as OrderStatus) ?? "new",
  };
}

function mapLedger(a: ApiLedgerEntry): LedgerEntry {
  return {
    id: a.id,
    date: a.date,
    label: a.label,
    amount: a.amount,
    type: "payout",
    status: a.status,
  };
}

interface VendorContextValue {
  orders: VendorOrder[];
  inventory: InventoryItem[];
  ledger: LedgerEntry[];
  balance: number;
  totalEarned: number;
  pendingPayouts: number;
  newOrdersCount: number;
  inStockCount: number;
  outOfStockCount: number;
  /** True during the initial data load. */
  loading: boolean;
  /** Set when the initial load fails. */
  error: string | null;
  /** Actions — all hit the backend and throw on failure. */
  acceptOrder: (id: string) => Promise<void>;
  markReady: (id: string) => Promise<void>;
  toggleStock: (id: string) => Promise<InventoryItem>;
  updatePrice: (id: string, price: number) => Promise<InventoryItem>;
  createProduct: (payload: CreateProductPayload) => Promise<InventoryItem>;
  requestPayout: (amount: number) => Promise<void>;
  /** Insert an order pushed over the socket (deduped). */
  addIncomingOrder: (order: VendorOrder) => void;
  refresh: () => Promise<void>;
}

const VendorContext = createContext<VendorContextValue | null>(null);

export function VendorProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [balance, setBalance] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [pendingPayouts, setPendingPayouts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applyWallet = useCallback(
    (w: { balance: number; totalEarned: number; pendingPayouts: number; ledger: ApiLedgerEntry[] }) => {
      setBalance(w.balance);
      setTotalEarned(w.totalEarned);
      setPendingPayouts(w.pendingPayouts);
      setLedger(w.ledger.map(mapLedger));
    },
    [],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [inv, ord, wallet] = await Promise.all([
        vendorApi.getInventory(),
        vendorApi.getOrders(),
        vendorApi.getWallet(),
      ]);
      setInventory(inv.map(mapItem));
      setOrders(ord.map(mapOrder));
      applyWallet(wallet);
    } catch {
      setError("Couldn't load your store. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [applyWallet]);

  const refreshWallet = useCallback(async () => {
    const wallet = await vendorApi.getWallet();
    applyWallet(wallet);
  }, [applyWallet]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const acceptOrder = useCallback(async (id: string) => {
    await vendorApi.updateOrderStatus(id, "packing");
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "packing" } : o)),
    );
  }, []);

  const markReady = useCallback(
    async (id: string) => {
      await vendorApi.updateOrderStatus(id, "ready");
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: "ready" } : o)),
      );
      // "ready" realizes earnings, so the wallet balance changes.
      await refreshWallet();
    },
    [refreshWallet],
  );

  const toggleStock = useCallback(
    async (id: string): Promise<InventoryItem> => {
      const current = inventory.find((x) => x.id === id);
      if (!current) throw new Error("Product not found.");
      const updated = await vendorApi.updateInventory(id, { inStock: !current.inStock });
      const mapped = mapItem(updated);
      setInventory((prev) => prev.map((x) => (x.id === id ? mapped : x)));
      return mapped;
    },
    [inventory],
  );

  const updatePrice = useCallback(
    async (id: string, price: number): Promise<InventoryItem> => {
      const updated = await vendorApi.updateInventory(id, { price });
      const mapped = mapItem(updated);
      setInventory((prev) => prev.map((x) => (x.id === id ? mapped : x)));
      return mapped;
    },
    [],
  );

  const createProduct = useCallback(
    async (payload: CreateProductPayload): Promise<InventoryItem> => {
      const created = await vendorApi.createProduct(payload);
      const mapped = mapItem(created);
      setInventory((prev) =>
        [mapped, ...prev].sort((a, b) => a.name.localeCompare(b.name)),
      );
      return mapped;
    },
    [],
  );

  const requestPayout = useCallback(
    async (amount: number) => {
      const wallet = await vendorApi.requestPayout(amount);
      applyWallet(wallet);
    },
    [applyWallet],
  );

  const addIncomingOrder = useCallback((order: VendorOrder) => {
    setOrders((prev) => {
      if (prev.some((o) => o.id === order.id)) return prev;
      return [order, ...prev];
    });
  }, []);

  const newOrdersCount = useMemo(() => orders.filter((o) => o.status === "new").length, [orders]);
  const inStockCount = useMemo(() => inventory.filter((i) => i.inStock).length, [inventory]);
  const outOfStockCount = useMemo(
    () => inventory.filter((i) => !i.inStock).length,
    [inventory],
  );

  const value = useMemo<VendorContextValue>(
    () => ({
      orders,
      inventory,
      ledger,
      balance,
      totalEarned,
      pendingPayouts,
      newOrdersCount,
      inStockCount,
      outOfStockCount,
      loading,
      error,
      acceptOrder,
      markReady,
      toggleStock,
      updatePrice,
      createProduct,
      requestPayout,
      addIncomingOrder,
      refresh,
    }),
    [
      orders,
      inventory,
      ledger,
      balance,
      totalEarned,
      pendingPayouts,
      newOrdersCount,
      inStockCount,
      outOfStockCount,
      loading,
      error,
      acceptOrder,
      markReady,
      toggleStock,
      updatePrice,
      createProduct,
      requestPayout,
      addIncomingOrder,
      refresh,
    ],
  );

  return <VendorContext.Provider value={value}>{children}</VendorContext.Provider>;
}

export function useVendor() {
  const ctx = useContext(VendorContext);
  if (!ctx) throw new Error("useVendor must be used within a VendorProvider");
  return ctx;
}
