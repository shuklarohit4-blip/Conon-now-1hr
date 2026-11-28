import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { apiUrl, adminFetch } from "@/lib/apiBase";
import { IS_LOCAL_ADMIN } from "@/config/adminGuard";
import { getSocket } from "@/services/socket";
import { subscribeSseSync } from "@/services/sseSyncClient";
import {
  saveLocalVaultOverride,
  type ProductMediaOverride,
} from "@/services/productMediaVault";
import type {
  CompanyBankAccount,
  CompanyBankRole,
  TreasuryLedgerEntry,
  TreasuryState,
} from "@/services/treasuryEngine";
import type {
  PartnerComplianceOverlay,
  BlacklistEntry,
  ComplianceAuditEntry,
} from "@/utils/complianceEvaluator";
import {
  DEFAULT_PAYMENT_POLICY_RULES,
  type PaymentPolicyRules,
} from "@/utils/paymentPolicy";
import {
  DEFAULT_SERVICEABILITY_CONFIG,
  type ServiceableZoneConfig,
  type PincodeWaitlistEntry,
} from "@/utils/serviceabilityPolicy";
import {
  DEFAULT_LUCKNOW_TRAFFIC_RULES,
  type LucknowTrafficRulesConfig,
} from "@/utils/lucknowTrafficPolicy";

export interface StorefrontBannerConfig {
  enabled: boolean;
  text: string;
  badge: string;
  tone: "emerald" | "amber" | "crimson";
}

import type { TurnkeyConsultationLead } from "@/data/lucknowTurnkeyPackages";

export interface PowerTrioSpotlightConfig {
  enabled: boolean;
  builderBadge: string;
  servicesBadge: string;
  rentalsBadge: string;
}

export interface TurnkeyBuildConfig {
  rates: Record<string, number>;
  promoBanner: string;
  offerActive: boolean;
}

export interface LiveHeroConfig {
  campaignPill: string;
  headlineOverride: string;
  defaultMode: "materials" | "build_rmc" | "crew_fleet";
  backdropImageUrl: string;
}

export interface GlobalControlsState {
  rainMode: boolean;
  storefrontBanner: StorefrontBannerConfig;
  deliverySlaMins: number;
  emergencyPause: boolean;
  paymentPolicy?: PaymentPolicyRules;
  serviceability?: ServiceableZoneConfig;
  trafficPolicy?: LucknowTrafficRulesConfig;
  powerTrioSpotlight?: PowerTrioSpotlightConfig;
  turnkeyBuild?: TurnkeyBuildConfig;
  liveHero?: LiveHeroConfig;
}

export interface MasterProductOverride extends Partial<ProductMediaOverride> {
  inStock?: boolean;
  adminLocked?: boolean;
  aliases?: string[];
}

export interface CononMasterState {
  version: number;
  updatedAt?: string;
  globalControls: GlobalControlsState;
  categories: {
    customCategories: Array<Record<string, any>>;
    hiddenCategorySlugs: string[];
    overrides: Record<string, Record<string, any>>;
  };
  products: {
    customProducts: Array<Record<string, any>>;
    hiddenProductIds: string[];
    overrides: Record<string, MasterProductOverride>;
  };
  mandiRates: Record<string, { price: number; delta?: string; updatedAt: string }>;
  servicesAndRentals: {
    serviceOverrides: Record<string, any>;
    customServices: any[];
    rentalOverrides: Record<string, any>;
    customRentals: any[];
  };
  operations: {
    orders: any[];
    kycApplications: any[];
    approvedVendors: any[];
    approvedDrivers: any[];
    escrowItems: any[];
    disputes: any[];
    feedback: any[];
    siteDna: Record<string, any>;
    pincodeWaitlist?: PincodeWaitlistEntry[];
    turnkeyConsultations?: TurnkeyConsultationLead[];
  };
  treasury: TreasuryState;
  compliance: {
    partnerStatuses: Record<string, PartnerComplianceOverlay>;
    blacklistRegistry: BlacklistEntry[];
    auditLog: ComplianceAuditEntry[];
  };
}

export const DEFAULT_CONON_MASTER_STATE: CononMasterState = {
  version: 1,
  globalControls: {
    rainMode: false,
    storefrontBanner: {
      enabled: false,
      text: "",
      badge: "LIVE",
      tone: "emerald",
    },
    deliverySlaMins: 60,
    emergencyPause: false,
    paymentPolicy: DEFAULT_PAYMENT_POLICY_RULES,
    serviceability: DEFAULT_SERVICEABILITY_CONFIG,
    trafficPolicy: DEFAULT_LUCKNOW_TRAFFIC_RULES,
    powerTrioSpotlight: {
      enabled: true,
      builderBadge: "PRO BUILDERS & GHAR CONSTRUCTION",
      servicesBadge: "60-MIN VISIT • ESCROW SAFE",
      rentalsBadge: "DIGITAL HMR BILLING • ZERO FRAUD",
    },
    turnkeyBuild: {
      rates: { grey: 1190, silver: 1650, gold: 2100, platinum: 2750, luxury: 3600 },
      promoBanner: "Free 2D Vastu + LDA/Ansal Map Support on Gold & Platinum Turnkey",
      offerActive: true,
    },
    liveHero: {
      campaignPill: "CONON INFRABUILT • 7+ Yrs • 150+ Projects",
      headlineOverride: "",
      defaultMode: "materials",
      backdropImageUrl: "",
    },
  },
  categories: {
    customCategories: [],
    hiddenCategorySlugs: [],
    overrides: {},
  },
  products: {
    customProducts: [],
    hiddenProductIds: [],
    overrides: {},
  },
  mandiRates: {},
  servicesAndRentals: {
    serviceOverrides: {},
    customServices: [],
    rentalOverrides: {},
    customRentals: [],
  },
  operations: {
    orders: [],
    kycApplications: [],
    approvedVendors: [],
    approvedDrivers: [],
    escrowItems: [],
    disputes: [],
    feedback: [],
    siteDna: {},
  },
  treasury: {
    companyAccounts: [],
    ledger: [],
  },
  compliance: {
    partnerStatuses: {},
    blacklistRegistry: [],
    auditLog: [],
  },
};

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<U>
    : T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};

function isPlainObject(v: unknown): v is Record<string, any> {
  return Boolean(v && typeof v === "object" && !Array.isArray(v));
}

export function deepMergeMasterState<T extends Record<string, any>>(
  target: T,
  patch: Record<string, any>
): T {
  const out: Record<string, any> = { ...target };
  for (const [k, v] of Object.entries(patch || {})) {
    if (v === undefined) continue;
    if (isPlainObject(v) && isPlainObject(out[k])) {
      out[k] = deepMergeMasterState(out[k], v);
    } else {
      out[k] = v;
    }
  }
  return out as T;
}

const CHANNEL_NAME = "conon_master_live_bus";
const TICK_STORAGE_KEY = "conon_master_bus_tick";
const STATE_CACHE_KEY = "conon_master_live_state_cache_v1";

export type MasterSyncStatus = "LIVE" | "SYNCING" | "ERROR";

export interface CononMasterSyncContextValue {
  state: CononMasterState;
  version: number;
  syncStatus: MasterSyncStatus;
  lastSyncError: string | null;
  liveTabsCount: number;
  isHydrated: boolean;
  refreshFromSources: () => Promise<void>;
  patchMasterState: (
    patch: DeepPartial<CononMasterState>,
    domain?: string
  ) => Promise<CononMasterState>;
  toggleRainMode: (nextValue?: boolean) => Promise<void>;
  updateStorefrontBanner: (banner: Partial<StorefrontBannerConfig>) => Promise<void>;
  updateDeliverySla: (mins: number) => Promise<void>;
  toggleEmergencyPause: (nextValue?: boolean) => Promise<void>;
  upsertProductOverride: (
    productId: string,
    override: MasterProductOverride
  ) => Promise<void>;
  updateMandiRate: (key: string, price: number, delta?: string) => Promise<void>;
  upsertCompanyBankAccount: (account: CompanyBankAccount) => Promise<void>;
  setPrimaryCompanyBankAccount: (id: string, role: CompanyBankRole) => Promise<void>;
  recordTreasuryEntry: (entry: TreasuryLedgerEntry) => Promise<void>;
  executeEscrowPayout: (params: {
    orderId: string;
    fromAccountId?: string;
    beneficiaryType: "VENDOR" | "DRIVER";
    beneficiaryName: string;
    toAccountLabel: string;
    toAccountRef: string;
    toIfsc?: string;
    grossAmount: number;
    platformMargin: number;
    taxAmount: number;
    netAmount: number;
    paymentMode: string;
    utrNumber: string;
    gatewayRefId?: string;
    pennyDropVerified: boolean;
  }) => Promise<TreasuryLedgerEntry>;
  suspendPartnerLive: (params: {
    partnerId: string;
    partnerName?: string;
    partnerType: string;
    reason: string;
  }) => Promise<void>;
  blacklistPartnerLive: (params: {
    partnerId: string;
    partnerName?: string;
    partnerType: string;
    phone?: string;
    pan?: string;
    gstin?: string;
    vehicleNo?: string;
    reason: string;
  }) => Promise<void>;
  reinstatePartnerLive: (params: {
    partnerId: string;
    partnerName?: string;
    partnerType: string;
    reason?: string;
  }) => Promise<void>;
  awardPhysicalInspectionStamp: (params: {
    partnerId: string;
    partnerName?: string;
    partnerType: string;
    inspectorName: string;
    inspectedAt: string;
    notes?: string;
    checklist?: Record<string, boolean>;
    photoUrl?: string;
  }) => Promise<void>;
  submitPartnerRenewalExpiry: (params: {
    partnerId: string;
    partnerName?: string;
    partnerType: string;
    docType: string;
    newExpiryDate: string;
  }) => Promise<void>;
  triggerTestPing: () => Promise<{ ok: boolean; tabs: number }>;
}

const CononMasterSyncContext = createContext<CononMasterSyncContextValue | null>(null);

export function CononMasterSyncProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CononMasterState>(() => DEFAULT_CONON_MASTER_STATE);
  const [syncStatus, setSyncStatus] = useState<MasterSyncStatus>("LIVE");
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);
  const [liveTabsCount, setLiveTabsCount] = useState<number>(1);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  const tabIdRef = useRef<string>(
    `tab-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`
  );
  const channelRef = useRef<BroadcastChannel | null>(null);
  const peersRef = useRef<Map<string, number>>(new Map());
  const stateRef = useRef<CononMasterState>(state);
  stateRef.current = state;

  const commitStateLocally = useCallback((next: CononMasterState) => {
    setState(next);
  }, []);

  const syncOverridesToMediaVault = useCallback(async (nextState: CononMasterState) => {
    const entries = Object.entries(nextState.products?.overrides || {});
    for (const [productId, ov] of entries) {
      if (!ov) continue;
      if ((ov.images && ov.images.length > 0) || ov.title || ov.description || ov.price !== undefined) {
        try {
          await saveLocalVaultOverride({
            productId,
            slug: ov.slug,
            categorySlug: ov.categorySlug,
            title: ov.title,
            brand: ov.brand,
            subcategory: ov.subcategory,
            description: ov.description,
            specBullets: ov.specBullets || [],
            images: ov.images || [],
            price: ov.price,
            mrp: ov.mrp,
            bulkPrice: ov.bulkPrice,
            bulkMinQty: ov.bulkMinQty,
            hsnCode: ov.hsnCode,
            gstRate: ov.gstRate,
            unit: ov.unit,
            isInStock: ov.isInStock ?? ov.inStock,
            isAdminVerifiedMedia: Boolean(ov.images && ov.images.length > 0),
            isCustomItem: ov.isCustomItem,
            updatedAt: ov.updatedAt || nextState.updatedAt || new Date().toISOString(),
          });
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const refreshFromSources = useCallback(async () => {
    const stamp = Date.now();
    let newest = stateRef.current;

    const tryApply = (incoming: any) => {
      if (!incoming || typeof incoming !== "object") return;
      const merged = deepMergeMasterState(DEFAULT_CONON_MASTER_STATE, incoming);
      if (Number(merged.version || 0) >= Number(newest.version || 0)) {
        newest = merged;
      }
    };

    // 1. Static / Dev disk file (/conon-live-state.json)
    try {
      const res = await fetch(`/conon-live-state.json?t=${stamp}`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        tryApply(json);
      }
    } catch {
      // ignore
    }

    // 2. Local Vite dev plugin (/__conon-live/state)
    if (IS_LOCAL_ADMIN) {
      try {
        const res = await fetch(`/__conon-live/state?t=${stamp}`, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json?.state) tryApply(json.state);
        }
      } catch {
        // ignore
      }
    }

    // 3. Backend PostgreSQL API (/api/live-state)
    try {
      const res = await fetch(apiUrl(`/api/live-state?t=${stamp}`), { cache: "no-store" });
      if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
        const json = await res.json();
        if (json?.state) tryApply(json.state);
      }
    } catch {
      // Backend optional in offline/static mode
    }

    commitStateLocally(newest);
    setIsHydrated(true);
    void syncOverridesToMediaVault(newest);
  }, [commitStateLocally, syncOverridesToMediaVault]);

  // Initial hydration on boot
  useEffect(() => {
    void refreshFromSources();
  }, [refreshFromSources]);

  // Cross-tab BroadcastChannel + localStorage + Socket.io listeners
  useEffect(() => {
    if (typeof window === "undefined") return;

    const prunePeers = () => {
      const now = Date.now();
      for (const [id, ts] of peersRef.current.entries()) {
        if (now - ts > 15_000) peersRef.current.delete(id);
      }
      setLiveTabsCount(Math.max(1, peersRef.current.size + 1));
    };

    let ch: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      try {
        ch = new BroadcastChannel(CHANNEL_NAME);
        channelRef.current = ch;
        ch.onmessage = (ev) => {
          const msg = ev.data;
          if (!msg || typeof msg !== "object") return;
          if (msg.senderId === tabIdRef.current) return;

          if (msg.type === "MASTER_STATE_SYNC") {
            if (msg.state) {
              const merged = deepMergeMasterState(DEFAULT_CONON_MASTER_STATE, msg.state);
              commitStateLocally(merged);
            } else {
              void refreshFromSources();
            }
          } else if (msg.type === "PING_TABS") {
            peersRef.current.set(msg.senderId, Date.now());
            prunePeers();
            ch?.postMessage({
              type: "PONG_TAB",
              senderId: tabIdRef.current,
              route: window.location.pathname,
            });
          } else if (msg.type === "PONG_TAB") {
            peersRef.current.set(msg.senderId, Date.now());
            prunePeers();
          } else if (msg.type === "TEST_PING_FLASH") {
            if (!window.location.pathname.startsWith("/admin")) {
              toast.success("⚡ Admin Command OS Connected Live!", {
                description: `Live sync verified (bus v${msg.version || stateRef.current.version})`,
              });
            }
          }
        };
        ch.postMessage({ type: "PING_TABS", senderId: tabIdRef.current });
      } catch {
        // BroadcastChannel unsupported
      }
    }

    const heartbeat = window.setInterval(() => {
      ch?.postMessage({ type: "PING_TABS", senderId: tabIdRef.current });
      prunePeers();
    }, 6000);

    const onStorage = (ev: StorageEvent) => {
      if (ev.key === TICK_STORAGE_KEY && ev.newValue) {
        void refreshFromSources();
      } else if (ev.key === STATE_CACHE_KEY && ev.newValue) {
        try {
          const parsed = JSON.parse(ev.newValue);
          commitStateLocally(deepMergeMasterState(DEFAULT_CONON_MASTER_STATE, parsed));
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener("storage", onStorage);

    const socket = getSocket() as any;
    const onSocketMasterUpdate = (payload: any) => {
      if (payload?.state) {
        const merged = deepMergeMasterState(DEFAULT_CONON_MASTER_STATE, payload.state);
        commitStateLocally(merged);
      } else {
        void refreshFromSources();
      }
    };
    socket?.on?.("conon:master_state_updated", onSocketMasterUpdate);
    socket?.on?.("conon:force_sync", () => void refreshFromSources());

    const unsubscribeSse = subscribeSseSync((msg) => {
      if (
        msg.type === "SETTINGS_UPDATED" ||
        msg.type === "BANNERS_UPDATED" ||
        msg.type === "CATEGORIES_UPDATED" ||
        msg.type === "CATALOG_UPDATED" ||
        msg.type === "FORCE_SYNC"
      ) {
        void refreshFromSources();
      }
    });

    const onFocus = () => void refreshFromSources();
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(heartbeat);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      unsubscribeSse();
      socket?.off?.("conon:master_state_updated", onSocketMasterUpdate);
      ch?.close();
      channelRef.current = null;
    };
  }, [commitStateLocally, refreshFromSources]);

  const broadcastSync = useCallback((next: CononMasterState, domain = "all") => {
    try {
      channelRef.current?.postMessage({
        type: "MASTER_STATE_SYNC",
        senderId: tabIdRef.current,
        version: next.version,
        domain,
        state: next,
      });
    } catch {
      // ignore
    }
    try {
      localStorage.setItem(
        TICK_STORAGE_KEY,
        JSON.stringify({ version: next.version, domain, at: Date.now() })
      );
    } catch {
      // ignore
    }
  }, []);

  const patchMasterState = useCallback(
    async (
      patch: DeepPartial<CononMasterState>,
      domain = "all"
    ): Promise<CononMasterState> => {
      setSyncStatus("SYNCING");
      setLastSyncError(null);

      const optimisticVersion = Math.max(
        Date.now(),
        Number(stateRef.current.version || 0) + 1
      );
      let nextState = deepMergeMasterState(stateRef.current, {
        ...patch,
        version: optimisticVersion,
        updatedAt: new Date().toISOString(),
      });
      commitStateLocally(nextState);
      broadcastSync(nextState, domain);

      let persistedAnywhere = false;
      let diskErrMsg: string | null = null;

      // Layer A: Local MacBook Vite Disk Writer (/__conon-live/patch)
      if (IS_LOCAL_ADMIN) {
        try {
          const res = await fetch("/__conon-live/patch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ patch, domain }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data?.ok) {
            throw new Error(data?.error || `Disk patch failed (${res.status})`);
          }
          if (data.state) {
            nextState = deepMergeMasterState(DEFAULT_CONON_MASTER_STATE, data.state);
            commitStateLocally(nextState);
          }
          persistedAnywhere = true;
        } catch (err: any) {
          diskErrMsg = err?.message || "Local disk sync failed";
        }
      }

      // Layer B: Cloud Backend API (/api/live-state)
      try {
        const res = await adminFetch("/api/live-state", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patch, domain }),
        });
        if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
          const data = await res.json();
          if (data?.state && !IS_LOCAL_ADMIN) {
            nextState = deepMergeMasterState(DEFAULT_CONON_MASTER_STATE, data.state);
            commitStateLocally(nextState);
          }
          persistedAnywhere = true;
        }
      } catch {
        // Cloud backend optional in local-only mode
      }

      broadcastSync(nextState, domain);

      if (diskErrMsg && !persistedAnywhere) {
        setSyncStatus("ERROR");
        setLastSyncError(diskErrMsg);
      } else {
        setSyncStatus("LIVE");
        setLastSyncError(null);
      }

      return nextState;
    },
    [broadcastSync, commitStateLocally]
  );

  const toggleRainMode = useCallback(
    async (nextValue?: boolean) => {
      const target = nextValue ?? !stateRef.current.globalControls.rainMode;
      await patchMasterState({ globalControls: { rainMode: target } }, "globalControls");
    },
    [patchMasterState]
  );

  const updateStorefrontBanner = useCallback(
    async (banner: Partial<StorefrontBannerConfig>) => {
      await patchMasterState(
        {
          globalControls: {
            storefrontBanner: {
              ...stateRef.current.globalControls.storefrontBanner,
              ...banner,
            },
          },
        },
        "globalControls"
      );
    },
    [patchMasterState]
  );

  const updateDeliverySla = useCallback(
    async (mins: number) => {
      const safe = Math.max(15, Math.min(240, Math.round(Number(mins) || 60)));
      await patchMasterState({ globalControls: { deliverySlaMins: safe } }, "globalControls");
    },
    [patchMasterState]
  );

  const toggleEmergencyPause = useCallback(
    async (nextValue?: boolean) => {
      const target = nextValue ?? !stateRef.current.globalControls.emergencyPause;
      await patchMasterState({ globalControls: { emergencyPause: target } }, "globalControls");
    },
    [patchMasterState]
  );

  const upsertProductOverride = useCallback(
    async (productId: string, override: MasterProductOverride) => {
      await patchMasterState(
        {
          products: {
            overrides: {
              [productId]: {
                ...override,
                productId,
                updatedAt: new Date().toISOString(),
              },
            },
          },
        },
        "products"
      );
    },
    [patchMasterState]
  );

  const updateMandiRate = useCallback(
    async (key: string, price: number, delta?: string) => {
      await patchMasterState(
        {
          mandiRates: {
            [key]: {
              price,
              delta,
              updatedAt: new Date().toISOString(),
            },
          },
        },
        "mandiRates"
      );
    },
    [patchMasterState]
  );

  const triggerTestPing = useCallback(async () => {
    let pingOk = true;
    if (IS_LOCAL_ADMIN) {
      try {
        const res = await fetch("/__conon-live/ping", { cache: "no-store" });
        const json = await res.json();
        pingOk = Boolean(res.ok && json?.ok);
        if (!pingOk) throw new Error(json?.error || "Ping failed");
      } catch (err: any) {
        setSyncStatus("ERROR");
        setLastSyncError(err?.message || "Local sync bus unreachable");
        return { ok: false, tabs: liveTabsCount };
      }
    }
    setSyncStatus("LIVE");
    setLastSyncError(null);
    channelRef.current?.postMessage({
      type: "TEST_PING_FLASH",
      senderId: tabIdRef.current,
      version: stateRef.current.version,
    });
    return { ok: pingOk, tabs: liveTabsCount };
  }, [liveTabsCount]);

  const upsertCompanyBankAccount = useCallback(
    async (account: CompanyBankAccount) => {
      const existing = stateRef.current.treasury?.companyAccounts || [];
      const cleared = account.isPrimary
        ? existing.map((a) => (a.role === account.role ? { ...a, isPrimary: false } : a))
        : existing;
      const idx = cleared.findIndex((a) => a.id === account.id);
      const nextAccounts =
        idx >= 0
          ? cleared.map((a, i) => (i === idx ? account : a))
          : [...cleared, account];

      await patchMasterState(
        { treasury: { ...stateRef.current.treasury, companyAccounts: nextAccounts } },
        "treasury"
      );

      if (IS_LOCAL_ADMIN) {
        adminFetch("/treasury/company-accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(account),
        }).catch(() => {});
      }
    },
    [patchMasterState]
  );

  const setPrimaryCompanyBankAccount = useCallback(
    async (id: string, role: CompanyBankRole) => {
      const existing = stateRef.current.treasury?.companyAccounts || [];
      const nextAccounts = existing.map((a) =>
        a.role === role ? { ...a, isPrimary: a.id === id } : a
      );
      await patchMasterState(
        { treasury: { ...stateRef.current.treasury, companyAccounts: nextAccounts } },
        "treasury"
      );
      if (IS_LOCAL_ADMIN) {
        adminFetch(`/treasury/company-accounts/${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPrimary: true, role }),
        }).catch(() => {});
      }
    },
    [patchMasterState]
  );

  const recordTreasuryEntry = useCallback(
    async (entry: TreasuryLedgerEntry) => {
      const currentLedger = stateRef.current.treasury?.ledger || [];
      if (currentLedger.some((r) => r.id === entry.id)) return;
      const nextLedger = [entry, ...currentLedger].slice(0, 1000);
      await patchMasterState(
        { treasury: { ...stateRef.current.treasury, ledger: nextLedger } },
        "treasury"
      );
    },
    [patchMasterState]
  );

  const executeEscrowPayout = useCallback(
    async (params: {
      orderId: string;
      fromAccountId?: string;
      beneficiaryType: "VENDOR" | "DRIVER";
      beneficiaryName: string;
      toAccountLabel: string;
      toAccountRef: string;
      toIfsc?: string;
      grossAmount: number;
      platformMargin: number;
      taxAmount: number;
      netAmount: number;
      paymentMode: string;
      utrNumber: string;
      gatewayRefId?: string;
      pennyDropVerified: boolean;
    }): Promise<TreasuryLedgerEntry> => {
      const accounts = stateRef.current.treasury?.companyAccounts || [];
      const fromAcct =
        accounts.find((a) => a.id === params.fromAccountId) ||
        accounts.find((a) => a.role === "PAYOUT" && a.isPrimary) ||
        accounts.find((a) => a.role === "PAYOUT") ||
        accounts[0];

      const entry: TreasuryLedgerEntry = {
        id: `tr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        orderId: params.orderId,
        entryType: params.beneficiaryType === "DRIVER" ? "DRIVER_PAYOUT" : "VENDOR_PAYOUT",
        direction: "DEBIT",
        fromAccountLabel: fromAcct?.label || "CONON Payout Current A/c",
        fromAccountRef: fromAcct ? `${fromAcct.bankName} ${fromAcct.accountNumberMasked}` : "CONON-PAYOUT",
        toAccountLabel: params.toAccountLabel,
        toAccountRef: params.toAccountRef,
        toIfsc: params.toIfsc || "",
        beneficiaryName: params.beneficiaryName,
        paymentMode: params.paymentMode,
        utrNumber: params.utrNumber,
        gatewayRefId: params.gatewayRefId,
        grossAmount: params.grossAmount,
        platformMargin: params.platformMargin,
        taxAmount: params.taxAmount,
        netAmount: params.netAmount,
        status: "SETTLED",
        createdAt: new Date().toISOString(),
        pennyDropVerified: params.pennyDropVerified,
      };

      await recordTreasuryEntry(entry);

      if (IS_LOCAL_ADMIN) {
        adminFetch("/treasury/release-payout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...params,
            fromAccountLabel: entry.fromAccountLabel,
            fromAccountRef: entry.fromAccountRef,
          }),
        }).catch(() => {});
      }

      return entry;
    },
    [recordTreasuryEntry]
  );

  const suspendPartnerLive = useCallback(
    async (params: {
      partnerId: string;
      partnerName?: string;
      partnerType: string;
      reason: string;
    }) => {
      const comp = stateRef.current.compliance || {
        partnerStatuses: {},
        blacklistRegistry: [],
        auditLog: [],
      };
      const prevOverlay = comp.partnerStatuses[params.partnerId] || {
        partnerId: params.partnerId,
        status: "APPROVED",
        updatedAt: new Date().toISOString(),
      };
      const nextOverlay: PartnerComplianceOverlay = {
        ...prevOverlay,
        partnerId: params.partnerId,
        status: "SUSPENDED",
        suspensionReason: params.reason,
        updatedAt: new Date().toISOString(),
      };
      const audit: ComplianceAuditEntry = {
        id: `aud_${Date.now()}`,
        partnerId: params.partnerId,
        partnerName: params.partnerName,
        partnerType: params.partnerType,
        action: "SUSPENDED",
        reason: params.reason,
        actor: "CONON HQ",
        createdAt: new Date().toISOString(),
      };
      await patchMasterState(
        {
          compliance: {
            ...comp,
            partnerStatuses: { ...comp.partnerStatuses, [params.partnerId]: nextOverlay },
            auditLog: [audit, ...(comp.auditLog || [])].slice(0, 500),
          },
        },
        "compliance"
      );
      if (IS_LOCAL_ADMIN) {
        adminFetch(`/admin/compliance/${encodeURIComponent(params.partnerId)}/suspend`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        }).catch(() => {});
      }
    },
    [patchMasterState]
  );

  const blacklistPartnerLive = useCallback(
    async (params: {
      partnerId: string;
      partnerName?: string;
      partnerType: string;
      phone?: string;
      pan?: string;
      gstin?: string;
      vehicleNo?: string;
      reason: string;
    }) => {
      const comp = stateRef.current.compliance || {
        partnerStatuses: {},
        blacklistRegistry: [],
        auditLog: [],
      };
      const prevOverlay = comp.partnerStatuses[params.partnerId] || {
        partnerId: params.partnerId,
        status: "APPROVED",
        updatedAt: new Date().toISOString(),
      };
      const nextOverlay: PartnerComplianceOverlay = {
        ...prevOverlay,
        partnerId: params.partnerId,
        status: "BLACKLISTED",
        suspensionReason: params.reason,
        updatedAt: new Date().toISOString(),
      };
      const blk: BlacklistEntry = {
        id: `blk_${Date.now()}`,
        partnerId: params.partnerId,
        phone: params.phone,
        pan: params.pan,
        gstin: params.gstin,
        vehicleNo: params.vehicleNo,
        reason: params.reason,
        blacklistedAt: new Date().toISOString(),
      };
      const audit: ComplianceAuditEntry = {
        id: `aud_${Date.now()}`,
        partnerId: params.partnerId,
        partnerName: params.partnerName,
        partnerType: params.partnerType,
        action: "BLACKLISTED",
        reason: params.reason,
        actor: "CONON HQ",
        createdAt: new Date().toISOString(),
      };
      await patchMasterState(
        {
          compliance: {
            ...comp,
            partnerStatuses: { ...comp.partnerStatuses, [params.partnerId]: nextOverlay },
            blacklistRegistry: [blk, ...(comp.blacklistRegistry || [])],
            auditLog: [audit, ...(comp.auditLog || [])].slice(0, 500),
          },
        },
        "compliance"
      );
      if (IS_LOCAL_ADMIN) {
        adminFetch(`/admin/compliance/${encodeURIComponent(params.partnerId)}/blacklist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        }).catch(() => {});
      }
    },
    [patchMasterState]
  );

  const reinstatePartnerLive = useCallback(
    async (params: {
      partnerId: string;
      partnerName?: string;
      partnerType: string;
      reason?: string;
    }) => {
      const comp = stateRef.current.compliance || {
        partnerStatuses: {},
        blacklistRegistry: [],
        auditLog: [],
      };
      const prevOverlay = comp.partnerStatuses[params.partnerId] || {
        partnerId: params.partnerId,
        status: "APPROVED",
        updatedAt: new Date().toISOString(),
      };
      const nextOverlay: PartnerComplianceOverlay = {
        ...prevOverlay,
        partnerId: params.partnerId,
        status: "APPROVED",
        suspensionReason: undefined,
        updatedAt: new Date().toISOString(),
      };
      const audit: ComplianceAuditEntry = {
        id: `aud_${Date.now()}`,
        partnerId: params.partnerId,
        partnerName: params.partnerName,
        partnerType: params.partnerType,
        action: "REINSTATED",
        reason: params.reason || "Reinstated by CONON HQ",
        actor: "CONON HQ",
        createdAt: new Date().toISOString(),
      };
      await patchMasterState(
        {
          compliance: {
            ...comp,
            partnerStatuses: { ...comp.partnerStatuses, [params.partnerId]: nextOverlay },
            auditLog: [audit, ...(comp.auditLog || [])].slice(0, 500),
          },
        },
        "compliance"
      );
      if (IS_LOCAL_ADMIN) {
        adminFetch(`/admin/compliance/${encodeURIComponent(params.partnerId)}/reinstate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        }).catch(() => {});
      }
    },
    [patchMasterState]
  );

  const awardPhysicalInspectionStamp = useCallback(
    async (params: {
      partnerId: string;
      partnerName?: string;
      partnerType: string;
      inspectorName: string;
      inspectedAt: string;
      notes?: string;
      checklist?: Record<string, boolean>;
      photoUrl?: string;
    }) => {
      const comp = stateRef.current.compliance || {
        partnerStatuses: {},
        blacklistRegistry: [],
        auditLog: [],
      };
      const prevOverlay = comp.partnerStatuses[params.partnerId] || {
        partnerId: params.partnerId,
        status: "APPROVED",
        updatedAt: new Date().toISOString(),
      };
      const nextOverlay: PartnerComplianceOverlay = {
        ...prevOverlay,
        partnerId: params.partnerId,
        physicallyInspected: true,
        inspectionMeta: {
          inspectorName: params.inspectorName,
          inspectedAt: params.inspectedAt,
          notes: params.notes,
          checklist: params.checklist,
          photoUrl: params.photoUrl,
        },
        updatedAt: new Date().toISOString(),
      };
      const audit: ComplianceAuditEntry = {
        id: `aud_${Date.now()}`,
        partnerId: params.partnerId,
        partnerName: params.partnerName,
        partnerType: params.partnerType,
        action: "FIELD_INSPECTED",
        reason: `CONON Physically Inspected ✓ by ${params.inspectorName}`,
        actor: params.inspectorName,
        createdAt: new Date().toISOString(),
      };
      await patchMasterState(
        {
          compliance: {
            ...comp,
            partnerStatuses: { ...comp.partnerStatuses, [params.partnerId]: nextOverlay },
            auditLog: [audit, ...(comp.auditLog || [])].slice(0, 500),
          },
        },
        "compliance"
      );
      if (IS_LOCAL_ADMIN) {
        adminFetch(`/admin/compliance/${encodeURIComponent(params.partnerId)}/physical-inspection`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        }).catch(() => {});
      }
    },
    [patchMasterState]
  );

  const submitPartnerRenewalExpiry = useCallback(
    async (params: {
      partnerId: string;
      partnerName?: string;
      partnerType: string;
      docType: string;
      newExpiryDate: string;
    }) => {
      const comp = stateRef.current.compliance || {
        partnerStatuses: {},
        blacklistRegistry: [],
        auditLog: [],
      };
      const prevOverlay = comp.partnerStatuses[params.partnerId] || {
        partnerId: params.partnerId,
        status: "APPROVED",
        updatedAt: new Date().toISOString(),
      };
      const nextOverlay: PartnerComplianceOverlay = {
        ...prevOverlay,
        partnerId: params.partnerId,
        expiryDates: {
          ...(prevOverlay.expiryDates || {}),
          [params.docType]: params.newExpiryDate,
        },
        updatedAt: new Date().toISOString(),
      };
      const audit: ComplianceAuditEntry = {
        id: `aud_${Date.now()}`,
        partnerId: params.partnerId,
        partnerName: params.partnerName,
        partnerType: params.partnerType,
        action: "RENEWAL_APPROVED",
        reason: `Renewed ${params.docType} -> ${params.newExpiryDate}`,
        actor: "Partner Renewal",
        createdAt: new Date().toISOString(),
      };
      await patchMasterState(
        {
          compliance: {
            ...comp,
            partnerStatuses: { ...comp.partnerStatuses, [params.partnerId]: nextOverlay },
            auditLog: [audit, ...(comp.auditLog || [])].slice(0, 500),
          },
        },
        "compliance"
      );
    },
    [patchMasterState]
  );

  const value = useMemo<CononMasterSyncContextValue>(
    () => ({
      state,
      version: state.version,
      syncStatus,
      lastSyncError,
      liveTabsCount,
      isHydrated,
      refreshFromSources,
      patchMasterState,
      toggleRainMode,
      updateStorefrontBanner,
      updateDeliverySla,
      toggleEmergencyPause,
      upsertProductOverride,
      updateMandiRate,
      upsertCompanyBankAccount,
      setPrimaryCompanyBankAccount,
      recordTreasuryEntry,
      executeEscrowPayout,
      suspendPartnerLive,
      blacklistPartnerLive,
      reinstatePartnerLive,
      awardPhysicalInspectionStamp,
      submitPartnerRenewalExpiry,
      triggerTestPing,
    }),
    [
      state,
      syncStatus,
      lastSyncError,
      liveTabsCount,
      isHydrated,
      refreshFromSources,
      patchMasterState,
      toggleRainMode,
      updateStorefrontBanner,
      updateDeliverySla,
      toggleEmergencyPause,
      upsertProductOverride,
      updateMandiRate,
      upsertCompanyBankAccount,
      setPrimaryCompanyBankAccount,
      recordTreasuryEntry,
      executeEscrowPayout,
      suspendPartnerLive,
      blacklistPartnerLive,
      reinstatePartnerLive,
      awardPhysicalInspectionStamp,
      submitPartnerRenewalExpiry,
      triggerTestPing,
    ]
  );

  return (
    <CononMasterSyncContext.Provider value={value}>
      {children}
    </CononMasterSyncContext.Provider>
  );
}

export function useCononMasterSync(): CononMasterSyncContextValue {
  const ctx = useContext(CononMasterSyncContext);
  if (!ctx) {
    throw new Error("useCononMasterSync must be used inside CononMasterSyncProvider");
  }
  return ctx;
}

export function useSafeCononMasterSync(): CononMasterSyncContextValue | null {
  return useContext(CononMasterSyncContext);
}
