import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { GOLD_WALLET_BALANCE } from "@/lib/wallet";

export interface WalletTxn {
  id: string;
  label: string;
  amt: string;       // display string e.g. "+₹2,000"
  date: string;      // display date e.g. "Mar 18"
  color: string;
  ts: number;
  category?: "credit" | "material_lock" | "redeem" | "referral" | "bonus" | "sos";
  details?: string;
}

const SEED_TXN: WalletTxn[] = [
  { id: "seed-1", label: "Referral — Ramesh Colony",  amt: "+₹2,000", date: "Mar 18", color: "#10b981", ts: 4, category: "referral", details: "Gomti Nagar Ext Site #41" },
  { id: "seed-2", label: "Order #CON-4821 Cashback",  amt: "+₹250",   date: "Mar 15", color: "#10b981", ts: 3, category: "credit", details: "UltraTech WeatherPlus 40 Bags" },
  { id: "seed-3", label: "Bulk Bonus — 200 bags OPC", amt: "+₹500",   date: "Mar 12", color: "#f59e0b", ts: 2, category: "bonus", details: "Monthly Target Tier 1 Achieved" },
  { id: "seed-4", label: "Redeemed on Order #4790",   amt: "−₹1,000", date: "Mar 10", color: "#ef4444", ts: 1, category: "redeem", details: "Applied at Checkout for Morang Sand" },
];

export interface MaterialHoldings {
  cementBags: number; // e.g. 2 bags
  brickPieces: number; // e.g. 50 pcs
  aacCbm: number; // e.g. 0.05 cbm
}

export interface SosCreditState {
  active: boolean;
  amount: number;
  hoursLeft: number;
  activatedAt?: number;
}

interface WalletState {
  balance: number;
  transactions: WalletTxn[];
  materialUnits: MaterialHoldings;
  sosCredit: SosCreditState;
  claimedRewards: Record<string, boolean>;
}

interface WalletContextType {
  balance: number;
  transactions: WalletTxn[];
  materialUnits: MaterialHoldings;
  sosCredit: SosCreditState;
  claimedRewards: Record<string, boolean>;
  addMoney: (amount: number, method?: string, customLabel?: string) => void;
  spend: (amount: number, label: string) => boolean;
  addCustomTxn: (txn: Omit<WalletTxn, "id" | "ts"> & { id?: string; ts?: number }) => void;
  convertCashToMaterial: (material: "cement" | "bricks" | "aac", cashAmount: number, unitsAdded: number) => boolean;
  deliverMaterialUnits: (material: "cement" | "bricks" | "aac", units: number) => boolean;
  activateSosCredit: () => void;
  markRewardClaimed: (key: string) => void;
}

const STORAGE_KEY = "conon_wallet_v1";

const WalletContext = createContext<WalletContextType | undefined>(undefined);

function sanitizeTxn(t: unknown): WalletTxn | null {
  if (!t || typeof t !== "object") return null;
  const o = t as Record<string, unknown>;
  if (typeof o.label !== "string" || typeof o.amt !== "string") return null;
  return {
    id: typeof o.id === "string" ? o.id : `txn-${Math.random().toString(36).slice(2)}`,
    label: o.label,
    amt: o.amt,
    date: typeof o.date === "string" ? o.date : "",
    color: typeof o.color === "string" ? o.color : "#64748b",
    ts: typeof o.ts === "number" && Number.isFinite(o.ts) ? o.ts : 0,
    category: typeof o.category === "string" ? (o.category as any) : "credit",
    details: typeof o.details === "string" ? o.details : undefined,
  };
}

const DEFAULT_HOLDINGS: MaterialHoldings = {
  cementBags: 2,
  brickPieces: 50,
  aacCbm: 0.05,
};

const DEFAULT_SOS: SosCreditState = {
  active: false,
  amount: 10000,
  hoursLeft: 48,
};

function loadState(): WalletState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const balanceOk =
        parsed && typeof parsed.balance === "number" && Number.isFinite(parsed.balance) && parsed.balance >= 0;
      if (balanceOk && Array.isArray(parsed.transactions)) {
        const transactions = parsed.transactions
          .map(sanitizeTxn)
          .filter((t: WalletTxn | null): t is WalletTxn => t !== null);
        return {
          balance: Math.round(parsed.balance),
          transactions,
          materialUnits: parsed.materialUnits || DEFAULT_HOLDINGS,
          sosCredit: parsed.sosCredit || DEFAULT_SOS,
          claimedRewards: parsed.claimedRewards || {},
        };
      }
    }
  } catch { /* ignore */ }
  return {
    balance: GOLD_WALLET_BALANCE,
    transactions: SEED_TXN,
    materialUnits: DEFAULT_HOLDINGS,
    sosCredit: DEFAULT_SOS,
    claimedRewards: {},
  };
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>(loadState);
  const balanceRef = useRef(state.balance);
  balanceRef.current = state.balance;

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  const addMoney = useCallback((amount: number, method = "UPI", customLabel?: string) => {
    if (!Number.isFinite(amount) || amount <= 0) return;
    const rounded = Math.round(amount);
    const now = new Date();
    const date = now.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    setState((prev) => ({
      ...prev,
      balance: prev.balance + rounded,
      transactions: [
        {
          id: `add-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          label: customLabel || `Added via ${method}`,
          amt: `+₹${rounded.toLocaleString("en-IN")}`,
          date,
          color: "#10b981",
          ts: Date.now(),
          category: "credit",
          details: `Processed via ${method}`,
        },
        ...prev.transactions,
      ],
    }));
  }, []);

  const spend = useCallback((amount: number, label: string) => {
    const rounded = Math.round(amount);
    if (!Number.isFinite(rounded) || rounded <= 0 || rounded > balanceRef.current) return false;
    balanceRef.current -= rounded;
    const now = new Date();
    const date = now.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    setState((prev) => ({
      ...prev,
      balance: prev.balance - rounded,
      transactions: [
        {
          id: `spend-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          label,
          amt: `−₹${rounded.toLocaleString("en-IN")}`,
          date,
          color: "#ef4444",
          ts: Date.now(),
          category: "redeem",
          details: "Site Dispatch Settlement",
        },
        ...prev.transactions,
      ],
    }));
    return true;
  }, []);

  const addCustomTxn = useCallback((txn: Omit<WalletTxn, "id" | "ts"> & { id?: string; ts?: number }) => {
    const now = new Date();
    const date = txn.date || now.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    const fullTxn: WalletTxn = {
      id: txn.id || `txn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: txn.label,
      amt: txn.amt,
      date,
      color: txn.color,
      ts: txn.ts || Date.now(),
      category: txn.category || "credit",
      details: txn.details,
    };
    setState((prev) => ({
      ...prev,
      transactions: [fullTxn, ...prev.transactions],
    }));
  }, []);

  const convertCashToMaterial = useCallback((material: "cement" | "bricks" | "aac", cashAmount: number, unitsAdded: number) => {
    const roundedCash = Math.round(cashAmount);
    if (roundedCash <= 0 || roundedCash > balanceRef.current) return false;
    balanceRef.current -= roundedCash;
    const now = new Date();
    const date = now.toLocaleDateString("en-IN", { month: "short", day: "numeric" });

    const labels = {
      cement: `Locked ${unitsAdded.toFixed(1)} Bags OPC 53 Cement`,
      bricks: `Locked ${Math.round(unitsAdded)} Avval Red Bricks`,
      aac: `Locked ${unitsAdded.toFixed(2)} cbm AAC Blocks`,
    };

    setState((prev) => {
      const updatedHoldings: MaterialHoldings = {
        ...prev.materialUnits,
        cementBags: material === "cement" ? prev.materialUnits.cementBags + unitsAdded : prev.materialUnits.cementBags,
        brickPieces: material === "bricks" ? prev.materialUnits.brickPieces + Math.round(unitsAdded) : prev.materialUnits.brickPieces,
        aacCbm: material === "aac" ? Number((prev.materialUnits.aacCbm + unitsAdded).toFixed(2)) : prev.materialUnits.aacCbm,
      };

      const newTxn: WalletTxn = {
        id: `lock-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        label: labels[material],
        amt: `−₹${roundedCash.toLocaleString("en-IN")}`,
        date,
        color: "#f59e0b",
        ts: Date.now(),
        category: "material_lock",
        details: `Converted into appreciating vault asset at live Lucknow Mandi rate`,
      };

      return {
        ...prev,
        balance: prev.balance - roundedCash,
        materialUnits: updatedHoldings,
        transactions: [newTxn, ...prev.transactions],
      };
    });
    return true;
  }, []);

  const deliverMaterialUnits = useCallback((material: "cement" | "bricks" | "aac", units: number) => {
    const now = new Date();
    const date = now.toLocaleDateString("en-IN", { month: "short", day: "numeric" });

    const labels = {
      cement: `Dispatched ${units} Bags Cement to Site`,
      bricks: `Dispatched ${units} Bricks to Site`,
      aac: `Dispatched ${units} cbm AAC to Site`,
    };

    setState((prev) => {
      const updatedHoldings: MaterialHoldings = {
        ...prev.materialUnits,
        cementBags: material === "cement" ? Math.max(0, prev.materialUnits.cementBags - units) : prev.materialUnits.cementBags,
        brickPieces: material === "bricks" ? Math.max(0, prev.materialUnits.brickPieces - units) : prev.materialUnits.brickPieces,
        aacCbm: material === "aac" ? Math.max(0, Number((prev.materialUnits.aacCbm - units).toFixed(2))) : prev.materialUnits.aacCbm,
      };

      const newTxn: WalletTxn = {
        id: `dispatch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        label: labels[material],
        amt: `0 (Prepaid)`,
        date,
        color: "#3b82f6",
        ts: Date.now(),
        category: "redeem",
        details: `60-Min Express Dispatch to Site PIN 226030`,
      };

      return {
        ...prev,
        materialUnits: updatedHoldings,
        transactions: [newTxn, ...prev.transactions],
      };
    });
    return true;
  }, []);

  const activateSosCredit = useCallback(() => {
    const now = new Date();
    const date = now.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    setState((prev) => ({
      ...prev,
      sosCredit: {
        active: true,
        amount: 10000,
        hoursLeft: 47.98,
        activatedAt: Date.now(),
      },
      transactions: [
        {
          id: `sos-${Date.now()}`,
          label: "Site Rescue SOS Credit Activated",
          amt: "+₹10,000",
          date,
          color: "#f43f5e",
          ts: Date.now(),
          category: "sos",
          details: "48-Hour Zero-Interest Slab Bridge Credit Active",
        },
        ...prev.transactions,
      ],
    }));
  }, []);

  const markRewardClaimed = useCallback((key: string) => {
    setState((prev) => ({
      ...prev,
      claimedRewards: { ...prev.claimedRewards, [key]: true },
    }));
  }, []);

  return (
    <WalletContext.Provider
      value={{
        balance: state.balance,
        transactions: state.transactions,
        materialUnits: state.materialUnits,
        sosCredit: state.sosCredit,
        claimedRewards: state.claimedRewards,
        addMoney,
        spend,
        addCustomTxn,
        convertCashToMaterial,
        deliverMaterialUnits,
        activateSosCredit,
        markRewardClaimed,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (ctx === undefined) throw new Error("useWallet must be used within a WalletProvider");
  return ctx;
}
