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
  type ApiLedgerEntry,
  type CreateProductPayload,
  type MasterCatalogSKU,
  type VendorOrder,
  type VendorProfile,
  type VendorWalletData,
} from "@/lib/vendorApi";
import { JWT_STORAGE_KEY, VENDOR_JWT_KEY, vendorLogin } from "@/lib/authApi";
import productAssetManifest from "@/lib/productAssetManifest.json";
import { resolveRealProductImage } from "@/utils/realMediaResolver";

const manifest = productAssetManifest as Record<string, string>;

export function resolveVendorImg(name: string, existingImg?: string): string {
  if (existingImg && (existingImg.startsWith("data:image/") || existingImg.startsWith("blob:"))) {
    return existingImg;
  }
  return resolveRealProductImage(existingImg || name, name);
}

/* ──────────────────────────────────────────────────────────────────────────
   VendorContext — "Conon-Friend" Dukandar Companion Engine
   Single source of truth for Vendor Portal, synchronized with:
   - Live SSOT Catalog (753+ SKUs)
   - 4 Pre-Seeded Lucknow Hubs (Katawala, Shree Balaji, Awasthi, Gomti Mart)
   - Rider OTP Handover & Real-Time Wallet Credits
   ────────────────────────────────────────────────────────────────────────── */

export type OrderStatus = "new" | "packing" | "ready";

export interface InventoryItem {
  id: string;
  name: string;
  emoji: string;
  bg: string;
  img: string;
  price: number;
  sellingPrice?: number;
  inStock: boolean;
  unit: string;
  category: string;
  brand?: string;
  fitGuardrail?: string;
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
  utrNumber?: string;
}

const FALLBACK_BG = "#f0f9ff";

function mapItem(a: ApiInventoryItem): InventoryItem {
  return {
    id: a.id,
    name: a.name,
    price: a.price,
    sellingPrice: a.sellingPrice || Math.round(a.price * 1.14),
    inStock: a.inStock,
    unit: a.unit,
    category: a.category,
    img: resolveVendorImg(a.name, a.img),
    emoji: "📦",
    bg: FALLBACK_BG,
    brand: a.brand,
    fitGuardrail: a.fitGuardrail,
  };
}

function mapLedger(a: any): LedgerEntry {
  return {
    id: a.id,
    date: a.date,
    label: a.description || a.label || "Payout Request",
    amount: a.amount,
    type: "payout",
    status: a.status === "SETTLED" || a.status === "Approved" ? "Approved" : "Pending Admin Approval",
    utrNumber: a.utrNumber,
  };
}

interface VendorContextValue {
  vendor: VendorProfile | null;
  hubs: VendorProfile[];
  orders: VendorOrder[];
  products: MasterCatalogSKU[];
  inventory: InventoryItem[];
  ledger: LedgerEntry[];
  wallet: VendorWalletData | null;
  balance: number;
  totalEarned: number;
  pendingPayouts: number;
  newOrdersCount: number;
  inStockCount: number;
  outOfStockCount: number;
  isOnline: boolean;
  loading: boolean;
  error: string | null;

  /** Actions */
  toggleStoreStatus: () => Promise<void>;
  switchDemoShop: (shopCodeOrId: string) => Promise<void>;
  acceptOrder: (id: string) => Promise<void>;
  markReady: (id: string) => Promise<void>;
  flagShortage: (id: string, reason: string) => Promise<void>;
  simulateTestOrder: () => Promise<VendorOrder>;
  updateProductStock: (skuId: string, inStock: boolean) => Promise<void>;
  updateProductPrice: (skuId: string, price: number) => Promise<void>;
  toggleStock: (id: string) => Promise<InventoryItem>;
  updatePrice: (id: string, price: number) => Promise<InventoryItem>;
  createProduct: (payload: CreateProductPayload) => Promise<InventoryItem>;
  requestPayout: (amount: number) => Promise<void>;
  addIncomingOrder: (order: VendorOrder) => void;
  refresh: () => Promise<void>;
}

const VendorContext = createContext<VendorContextValue | null>(null);

export function VendorProvider({ children }: { children: React.ReactNode }) {
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [hubs, setHubs] = useState<VendorProfile[]>([]);
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [products, setProducts] = useState<MasterCatalogSKU[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [wallet, setWallet] = useState<VendorWalletData | null>(null);
  const [balance, setBalance] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [pendingPayouts, setPendingPayouts] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applyWallet = useCallback((w: VendorWalletData | any) => {
    if (!w) return;
    setWallet(w);
    const pend = w.pendingSettlement ?? w.pendingPayouts ?? 0;
    const earned = w.totalEarned ?? (w.todayEarnings ? w.todayEarnings + (w.totalSettledMonth || 0) : 0);
    setBalance(pend);
    setPendingPayouts(pend);
    setTotalEarned(earned);
    if (Array.isArray(w.ledger)) {
      setLedger(w.ledger.map(mapLedger));
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch vendor profile
      let me: VendorProfile;
      try {
        me = await vendorApi.getMe();
      } catch (authErr) {
        setVendor(null);
        setLoading(false);
        return;
      }

      setVendor(me);
      setIsOnline(me.isOpen);

      // Clean up any stale garbage strings in localStorage
      const curStored = localStorage.getItem("conon_vendor_store");
      if (!curStored || curStored.toLowerCase().includes("undf") || curStored.length < 3) {
        localStorage.setItem("conon_vendor_store", me.shopName);
      }

      // 2. Load Hubs, Orders, Products, Wallet concurrently
      const [hubsList, ordersList, productsList, walletData] = await Promise.all([
        vendorApi.getHubs().catch(() => []),
        vendorApi.getOrders().catch(() => []),
        vendorApi.getProducts().catch(() => []),
        vendorApi.getPayouts().catch(() => null),
      ]);

      setHubs(hubsList);
      setOrders(ordersList);
      setProducts(productsList);

      // Map products to inventory format for backward compat
      const mappedInv: InventoryItem[] = productsList.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.dealerLandingCost || Math.round(p.sellingPrice * 0.88),
        sellingPrice: p.sellingPrice,
        inStock: p.inStock,
        unit: p.packSize || p.unit || "Unit",
        category: p.category,
        img: resolveVendorImg(p.name, p.imageUrl),
        emoji: "📦",
        bg: FALLBACK_BG,
        brand: p.brand,
        fitGuardrail: p.fitGuardrailBadge,
      }));
      setInventory(mappedInv);

      if (walletData) {
        applyWallet(walletData);
      }
    } catch (err: any) {
      console.error("[VendorContext] Refresh failed:", err);
      setError("Couldn't load your store. Please check your connection or sign in.");
    } finally {
      setLoading(false);
    }
  }, [applyWallet]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleStoreStatus = useCallback(async () => {
    const next = !isOnline;
    setIsOnline(next);
    try {
      const res = await vendorApi.setStoreStatus(next);
      if (res.vendor) {
        setVendor(res.vendor);
        setIsOnline(res.vendor.isOpen);
      }
    } catch (err) {
      setIsOnline(!next);
      throw err;
    }
  }, [isOnline]);

  const switchDemoShop = useCallback(
    async (shopCodeOrId: string) => {
      setLoading(true);
      try {
        const res = await vendorApi.switchShop(shopCodeOrId);
        if (res.token) {
          localStorage.setItem(JWT_STORAGE_KEY, res.token);
          localStorage.setItem("conon_vendor_store", res.vendor.shopName);
        }
        await refresh();
      } finally {
        setLoading(false);
      }
    },
    [refresh],
  );

  const acceptOrder = useCallback(async (id: string) => {
    const res = await vendorApi.acceptOrder(id);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id || o.shortId === id
          ? { ...o, status: "packing", rawStatus: "PACKING_READY", pickupOtp: res.pickupOtp || o.pickupOtp || "4829" }
          : o,
      ),
    );
  }, []);

  const markReady = useCallback(
    async (id: string) => {
      await vendorApi.markReady(id);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id || o.shortId === id ? { ...o, status: "ready", rawStatus: "HANDED_OVER" } : o,
        ),
      );
      const w = await vendorApi.getPayouts();
      applyWallet(w);
    },
    [applyWallet],
  );

  const flagShortage = useCallback(async (id: string, reason: string) => {
    await vendorApi.flagShortage(id, reason);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id || o.shortId === id ? { ...o, rawStatus: "FLAGGED_SHORTAGE", flaggedReason: reason } : o,
      ),
    );
  }, []);

  const simulateTestOrder = useCallback(async (): Promise<VendorOrder> => {
    const newOrd = await vendorApi.devTestOrder();
    setOrders((prev) => {
      if (prev.some((o) => o.id === newOrd.id)) return prev;
      return [newOrd, ...prev];
    });
    return newOrd;
  }, []);

  const updateProductStock = useCallback(
    async (skuId: string, inStock: boolean) => {
      // Optimistic update
      setProducts((prev) => prev.map((p) => (p.id === skuId ? { ...p, inStock } : p)));
      setInventory((prev) => prev.map((i) => (i.id === skuId ? { ...i, inStock } : i)));
      await vendorApi.updateProduct(skuId, { inStock });
    },
    [],
  );

  const updateProductPrice = useCallback(
    async (skuId: string, dealerLandingCost: number) => {
      // Optimistic update
      setProducts((prev) => prev.map((p) => (p.id === skuId ? { ...p, dealerLandingCost } : p)));
      setInventory((prev) =>
        prev.map((i) => (i.id === skuId ? { ...i, price: dealerLandingCost } : i)),
      );
      await vendorApi.updateProduct(skuId, { dealerLandingCost });
    },
    [],
  );

  const toggleStock = useCallback(
    async (id: string): Promise<InventoryItem> => {
      const current = inventory.find((x) => x.id === id);
      if (!current) throw new Error("Product not found.");
      const nextStock = !current.inStock;
      await updateProductStock(id, nextStock);
      return { ...current, inStock: nextStock };
    },
    [inventory, updateProductStock],
  );

  const updatePrice = useCallback(
    async (id: string, price: number): Promise<InventoryItem> => {
      const current = inventory.find((x) => x.id === id);
      if (!current) throw new Error("Product not found.");
      await updateProductPrice(id, price);
      return { ...current, price };
    },
    [inventory, updateProductPrice],
  );

  const createProduct = useCallback(
    async (payload: CreateProductPayload): Promise<InventoryItem> => {
      const created = await vendorApi.createProduct(payload);
      const mapped = mapItem(created);
      setInventory((prev) => [mapped, ...prev].sort((a, b) => a.name.localeCompare(b.name)));
      return mapped;
    },
    [],
  );

  const requestPayout = useCallback(
    async (amount: number) => {
      await vendorApi.requestPayout(amount);
      const w = await vendorApi.getPayouts();
      applyWallet(w);
    },
    [applyWallet],
  );

  const addIncomingOrder = useCallback((order: VendorOrder) => {
    setOrders((prev) => {
      if (prev.some((o) => o.id === order.id)) return prev;
      return [order, ...prev];
    });
  }, []);

  const newOrdersCount = useMemo(
    () => orders.filter((o) => o.status === "new" || o.rawStatus === "NEW_REQUEST").length,
    [orders],
  );
  const inStockCount = useMemo(() => inventory.filter((i) => i.inStock).length, [inventory]);
  const outOfStockCount = useMemo(
    () => inventory.filter((i) => !i.inStock).length,
    [inventory],
  );

  const value = useMemo<VendorContextValue>(
    () => ({
      vendor,
      hubs,
      orders,
      products,
      inventory,
      ledger,
      wallet,
      balance,
      totalEarned,
      pendingPayouts,
      newOrdersCount,
      inStockCount,
      outOfStockCount,
      isOnline,
      loading,
      error,
      toggleStoreStatus,
      switchDemoShop,
      acceptOrder,
      markReady,
      flagShortage,
      simulateTestOrder,
      updateProductStock,
      updateProductPrice,
      toggleStock,
      updatePrice,
      createProduct,
      requestPayout,
      addIncomingOrder,
      refresh,
    }),
    [
      vendor,
      hubs,
      orders,
      products,
      inventory,
      ledger,
      wallet,
      balance,
      totalEarned,
      pendingPayouts,
      newOrdersCount,
      inStockCount,
      outOfStockCount,
      isOnline,
      loading,
      error,
      toggleStoreStatus,
      switchDemoShop,
      acceptOrder,
      markReady,
      flagShortage,
      simulateTestOrder,
      updateProductStock,
      updateProductPrice,
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
