import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { GOLD_WALLET_BALANCE } from "@/lib/wallet";

export interface WalletTxn {
  id: string;
  label: string;
  amt: string;       // display string e.g. "+₹2,000"
  date: string;      // display date e.g. "Mar 18"
  color: string;
  ts: number;
}

const SEED_TXN: WalletTxn[] = [
  { id: "seed-1", label: "Referral — Ramesh Colony",  amt: "+₹2,000", date: "Mar 18", color: "#10b981", ts: 4 },
  { id: "seed-2", label: "Order #CON-4821 cashback",  amt: "+₹350",   date: "Mar 15", color: "#10b981", ts: 3 },
  { id: "seed-3", label: "Bulk bonus — 200 bags OPC", amt: "+₹900",   date: "Mar 12", color: "#f59e0b", ts: 2 },
  { id: "seed-4", label: "Redeemed on Order #4790",   amt: "−₹1,000", date: "Mar 10", color: "#ef4444", ts: 1 },
];

interface WalletState {
  balance: number;
  transactions: WalletTxn[];
}

interface WalletContextType {
  balance: number;
  transactions: WalletTxn[];
  addMoney: (amount: number, method?: string) => void;
  spend: (amount: number, label: string) => boolean;
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
  };
}

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
        return { balance: Math.round(parsed.balance), transactions };
      }
    }
  } catch { /* ignore */ }
  return { balance: GOLD_WALLET_BALANCE, transactions: SEED_TXN };
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>(loadState);
  const balanceRef = useRef(state.balance);
  balanceRef.current = state.balance;

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  const addMoney = useCallback((amount: number, method = "UPI") => {
    if (!Number.isFinite(amount) || amount <= 0) return;
    const rounded = Math.round(amount);
    const now = new Date();
    const date = now.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    setState((prev) => ({
      balance: prev.balance + rounded,
      transactions: [
        {
          id: `add-${Date.now()}`,
          label: `Added via ${method}`,
          amt: `+₹${rounded.toLocaleString("en-IN")}`,
          date,
          color: "#10b981",
          ts: Date.now(),
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
      balance: prev.balance - rounded,
      transactions: [
        {
          id: `spend-${Date.now()}`,
          label,
          amt: `−₹${rounded.toLocaleString("en-IN")}`,
          date,
          color: "#ef4444",
          ts: Date.now(),
        },
        ...prev.transactions,
      ],
    }));
    return true;
  }, []);

  return (
    <WalletContext.Provider value={{ balance: state.balance, transactions: state.transactions, addMoney, spend }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (ctx === undefined) throw new Error("useWallet must be used within a WalletProvider");
  return ctx;
}
