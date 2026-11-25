/**
 * TypeScript Schema Definitions for CONON-NOW Living Material Vault Engine
 * Corresponds to PostgreSQL DDL Migration (001_conon_living_vault.sql)
 */

export type LedgerTxType =
  | "DEPOSIT"
  | "ORDER_SPEND"
  | "RATE_LOCK_DEBIT"
  | "SOS_DRAW"
  | "SOS_REPAY"
  | "BILL_XRAY_REWARD"
  | "BUYBACK_CREDIT"
  | "CRANE_DROP"
  | "REFERRAL"
  | "SPONSOR_BONUS";

export type RateLockStatus = "ACTIVE" | "PARTIAL" | "REDEEMED" | "EXPIRED_REFUNDED";

export type BuybackStatus = "PICKUP_SCHEDULED" | "VERIFIED_CREDITED" | "REJECTED";

/** 1. Main User Vault */
export interface CononWallet {
  walletId: string; // UUID
  userId: string; // UUID
  cashBalance: number; // NUMERIC(12, 2)
  goldBonusBalance: number; // NUMERIC(12, 2)
  sosCreditLimit: number; // NUMERIC(12, 2)
  sosCreditUsed: number; // NUMERIC(12, 2)
  sosDueAt?: string | null; // TIMESTAMPTZ ISO string
  siteTrustScore: number; // 0 - 100
  createdAt: string;
  updatedAt: string;
}

/** 2. Immutable Fintech Ledger */
export interface WalletLedgerEntry {
  txId: string; // UUID
  walletId: string; // UUID
  idempotencyKey: string;
  txType: LedgerTxType;
  amount: number; // Positive (+) for credit, Negative (-) for debit
  balanceAfter: number;
  referenceId?: string | null;
  metadata?: Record<string, any>;
  createdAt: string;
}

/** 3. Material-Backed Rate Lock Units */
export interface MaterialRateLock {
  lockId: string; // UUID
  walletId: string; // UUID
  partnerVendorId?: string | null;
  skuCode: string; // 'OPC53_CEMENT', 'AVVAL_BRICK', 'MAGICRETE_AAC'
  unitLabel: string; // 'bags', 'pcs', 'cbm', 'tons'
  lockedQty: number;
  redeemedQty: number;
  lockedUnitPrice: number;
  expiresAt: string;
  status: RateLockStatus;
  createdAt: string;
}

/** 4. Mistri / Contractor Zero-Leakage Pass */
export interface MistriPass {
  passId: string; // UUID
  ownerWalletId: string; // UUID
  siteName: string;
  contractorName: string;
  contractorPhone: string;
  pinHash: string; // Bcrypt / Argon2 hash
  dailyLimit: number;
  spentToday: number;
  allowedCategories: string[]; // e.g. ['PLUMBING', 'ADHESIVES']
  isActive: boolean;
  createdAt: string;
}

/** 5. Leftover Material Reverse Buyback */
export interface BuybackRequest {
  buybackId: string; // UUID
  walletId: string; // UUID
  skuCode: string;
  qty: number;
  photoUrl: string;
  siteLat?: number | null;
  siteLng?: number | null;
  estimatedGoldCredit: number;
  status: BuybackStatus;
  createdAt: string;
}
