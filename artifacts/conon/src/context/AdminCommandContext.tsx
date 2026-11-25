import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface DispatchOrder {
  id: string;
  shortId: string;
  customerName: string;
  customerPhone: string;
  siteName: string;
  lucknowZone: string;
  items: string;
  weightKg: number;
  vehicleTag: string; // e.g. "Bike Express • 18 kg", "Chhota Hathi Loader • 1,850 kg"
  isDhalaiPriority: boolean;
  minsLeft: number;
  hub: string;
  status: "PACKING" | "OUT_FOR_DELIVERY" | "ARRIVED" | "DELIVERED";
  totalAmount: number;
}

export interface MandiSKU {
  id: string;
  name: string;
  category: string;
  unit: string;
  dealerLandingCost: number;
  platformMarginPercent: number;
  liveRetailPrice: number;
  lastUpdated: string;
  trend: "up" | "down" | "stable";
}

export interface VaultExposure {
  lockedCementBags: number;
  lockedBrickUnits: number;
  marketHikeRiskInr: number;
  exposureStatus: "AMBER_EXPOSURE" | "HEDGED_100";
  hedgedPartnerDealer?: string;
}

export interface EscrowOrder {
  id: string;
  shortId: string;
  dealerName: string;
  dealerInvoiceNo: string;
  dealerPayoutAmount: number;
  customerSiteAddress: string;
  skuSummary: string;
  loadingTimestamp: string;
  unloadingPhotoUrl: string;
  invoicePhotoUrl: string;
  gpsDistanceMeters: number;
  gpsMatchPercent: number;
  status: "AWAITING_RELEASE" | "RELEASED" | "DISPUTE_HELD";
  disputeReason?: string;
}

export interface BillXrayItem {
  id: string;
  lucknowArea: string;
  sku: string;
  localShopPrice: number;
  cononPrice: number;
  savingsPercent: number;
  verifiedBillsCount: number;
}

export interface SosCreditUser {
  id: string;
  userName: string;
  phone: string;
  siteLocation: string;
  amountDrawn: number;
  hoursRemaining: number;
  trustScore: number; // 0 to 100
  status: "ACTIVE" | "SETTLED";
}

export interface MistriPass {
  id: string;
  ownerName: string;
  mistriName: string;
  siteName: string;
  dailyCap: number;
  spentToday: number;
  allowedCategories: string;
  isFrozen: boolean;
}

export interface BuilderBOQ {
  id: string;
  contractorName: string;
  siteName: string;
  lucknowZone: string;
  estimatedUnits: string;
  rawEstimateInr: number;
  quoteAmountInr?: number;
  status: "PENDING_QUOTE" | "QUOTED";
  requestDate: string;
}

export interface LeftoverBuyback {
  id: string;
  siteName: string;
  material: string;
  quantity: string;
  buybackGoldValue: number;
  matchedOrderShortId: string;
  matchedDistanceKm: number;
  status: "MATCHED_READY" | "COMPLETED";
}

export interface AdminCommandContextType {
  // Global Pulse Bar KPIs
  todayGmv: number;
  netCommissionMargin: number;
  netCommissionPercent: number;
  avgDeliveryMins: number;
  activeEscrowHold: number;
  settledPayouts: number;

  // Module 1: Dispatch Radar
  dispatchOrders: DispatchOrder[];
  reRouteHub: (orderId: string, newHub: string) => void;

  // Module 2: Mandi & Hedge
  mandiRates: MandiSKU[];
  updateMandiRate: (skuId: string, landingCost: number, marginPercent: number) => void;
  vaultExposure: VaultExposure;
  lockBulkHedge: (partnerDealer: string) => void;

  // Module 3: Geo-Photo Escrow
  escrowQueue: EscrowOrder[];
  releaseEscrowPayout: (orderId: string) => void;
  holdForDispute: (orderId: string, reason: string) => void;

  // Module 4: Bill X-Ray & Simulator
  billXrayIntel: BillXrayItem[];
  simDailyOrders: number;
  setSimDailyOrders: (v: number) => void;
  simAvgCommission: number;
  setSimAvgCommission: (v: number) => void;
  simCementVariance: number;
  setSimCementVariance: (v: number) => void;

  // Module 5: SOS Credit & Mistri Pass
  sosRescueUsers: SosCreditUser[];
  sendSosReminder: (id: string) => void;
  markSosSettled: (id: string) => void;
  activeMistriPasses: MistriPass[];
  toggleFreezeMistriPass: (id: string) => void;

  // Module 6: BOQ & Leftover Buyback
  builderBoqs: BuilderBOQ[];
  sendInstantQuote: (id: string, quoteAmount: number) => void;
  buybackRequests: LeftoverBuyback[];
  approveBuybackTransfer: (id: string) => void;

  // Voice Command Action Modal State
  pendingVoiceAction: {
    title: string;
    description: string;
    execute: () => void;
  } | null;
  setPendingVoiceAction: (action: { title: string; description: string; execute: () => void } | null) => void;
}

const INITIAL_DISPATCH_ORDERS: DispatchOrder[] = [
  {
    id: "ord_dhalai_01",
    shortId: "#7812",
    customerName: "Ramesh Singh (Civil Engg)",
    customerPhone: "98390 12450",
    siteName: "Sushant Golf City — Sector D Slab Pour",
    lucknowZone: "Shaheed Path / Sushant Golf City",
    items: "75 Bags Ultratech OPC 53 + 500 kg TMT 12mm Sariya",
    weightKg: 4250,
    vehicleTag: "Pickup Truck 407 • 4,250 kg",
    isDhalaiPriority: true,
    minsLeft: 16,
    hub: "Sushant Golf City Hub",
    status: "OUT_FOR_DELIVERY",
    totalAmount: 58900,
  },
  {
    id: "ord_dhalai_02",
    shortId: "#7815",
    customerName: "Manoj Builders",
    customerPhone: "94150 88210",
    siteName: "Gomti Nagar Extension — 3rd Floor Dhalai",
    lucknowZone: "Gomti Nagar",
    items: "90 Bags Ambuja Kawach Cement",
    weightKg: 4500,
    vehicleTag: "Chhota Hathi Loader • 4,500 kg",
    isDhalaiPriority: true,
    minsLeft: 22,
    hub: "Chinhat Supply Point",
    status: "OUT_FOR_DELIVERY",
    totalAmount: 37800,
  },
  {
    id: "ord_std_03",
    shortId: "#7818",
    customerName: "Vikas Verma",
    customerPhone: "87654 32109",
    siteName: "Latouche Rd Hardware Storefront",
    lucknowZone: "Latouche Road",
    items: "2 Boxes CPVC Ball Valves + 5 Fevicol Pro Drums",
    weightKg: 28,
    vehicleTag: "Bike Express • 28 kg",
    isDhalaiPriority: false,
    minsLeft: 34,
    hub: "Latouche Road Hub",
    status: "PACKING",
    totalAmount: 9400,
  },
  {
    id: "ord_std_04",
    shortId: "#7822",
    customerName: "Alok Construction",
    customerPhone: "70071 23456",
    siteName: "Alambagh Chander Nagar Site",
    lucknowZone: "Alambagh",
    items: "2000 Avval Red Clay Bricks + 10 Sand Bags",
    weightKg: 6500,
    vehicleTag: "Tata 709 Tipper • 6,500 kg",
    isDhalaiPriority: false,
    minsLeft: 47,
    hub: "Naka Market Hub",
    status: "PACKING",
    totalAmount: 26400,
  },
];

const INITIAL_MANDI_SKUS: MandiSKU[] = [
  {
    id: "mandi_opc53",
    name: "UltraTech / ACC OPC 53 Cement",
    category: "Cement",
    unit: "50 kg Bag",
    dealerLandingCost: 338,
    platformMarginPercent: 8.0,
    liveRetailPrice: 365,
    lastUpdated: "Today 08:30 AM",
    trend: "up",
  },
  {
    id: "mandi_tmt",
    name: "Tata Tiscon Fe 550D TMT Steel",
    category: "Steel & Sariya",
    unit: "per Kg",
    dealerLandingCost: 61.5,
    platformMarginPercent: 6.5,
    liveRetailPrice: 65.5,
    lastUpdated: "Today 08:00 AM",
    trend: "stable",
  },
  {
    id: "mandi_bricks",
    name: "Avval Red Clay Kiln Bricks",
    category: "Bricks & Blocks",
    unit: "per Piece",
    dealerLandingCost: 8.1,
    platformMarginPercent: 9.8,
    liveRetailPrice: 8.9,
    lastUpdated: "Yesterday",
    trend: "up",
  },
  {
    id: "mandi_aac",
    name: "Magicrete AAC Lightweight Blocks 6-inch",
    category: "Bricks & Blocks",
    unit: "per Block",
    dealerLandingCost: 57.0,
    platformMarginPercent: 8.7,
    liveRetailPrice: 62.0,
    lastUpdated: "Today 07:15 AM",
    trend: "down",
  },
];

const INITIAL_ESCROWS: EscrowOrder[] = [
  {
    id: "escrow_01",
    shortId: "#7798",
    dealerName: "Awadh Builders & Hardware (Latouche Rd)",
    dealerInvoiceNo: "INV-AWADH-9941",
    dealerPayoutAmount: 24500,
    customerSiteAddress: "Plot 42, Amar Shaheed Path, Sushant Golf City",
    skuSummary: "50 Bags UltraTech Super OPC + 400 kg TMT 10mm",
    loadingTimestamp: "10:14 AM (Dispatched from Naka Depot)",
    unloadingPhotoUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=800&auto=format&fit=crop&q=80",
    invoicePhotoUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80",
    gpsDistanceMeters: 12,
    gpsMatchPercent: 99,
    status: "AWAITING_RELEASE",
  },
  {
    id: "escrow_02",
    shortId: "#7804",
    dealerName: "Lucknow Sanitary & Pipes (Aminabad)",
    dealerInvoiceNo: "LSP-2026-881",
    dealerPayoutAmount: 18200,
    customerSiteAddress: "Sector 14, Indira Nagar, Lucknow",
    skuSummary: "12 Astral CPVC Pipes + 4 Concealed Cisterns",
    loadingTimestamp: "11:20 AM (Dispatched from Aminabad)",
    unloadingPhotoUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
    invoicePhotoUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80",
    gpsDistanceMeters: 24,
    gpsMatchPercent: 97,
    status: "AWAITING_RELEASE",
  },
];

const INITIAL_BILL_XRAY: BillXrayItem[] = [
  {
    id: "bx_01",
    lucknowArea: "Latouche Road",
    sku: "UltraTech OPC 53 (50 kg)",
    localShopPrice: 385,
    cononPrice: 365,
    savingsPercent: 5.2,
    verifiedBillsCount: 38,
  },
  {
    id: "bx_02",
    lucknowArea: "Aminabad & Naka",
    sku: "Tata Tiscon 12mm TMT (kg)",
    localShopPrice: 69.5,
    cononPrice: 65.5,
    savingsPercent: 5.8,
    verifiedBillsCount: 24,
  },
  {
    id: "bx_03",
    lucknowArea: "Chinhat Industrial",
    sku: "Dr. Fixit Fastflex 20kg",
    localShopPrice: 2850,
    cononPrice: 2640,
    savingsPercent: 7.4,
    verifiedBillsCount: 19,
  },
  {
    id: "bx_04",
    lucknowArea: "Alambagh",
    sku: "Asian Paints Royale Luxury 20L",
    localShopPrice: 7900,
    cononPrice: 7350,
    savingsPercent: 7.0,
    verifiedBillsCount: 31,
  },
];

const INITIAL_SOS_USERS: SosCreditUser[] = [
  {
    id: "sos_01",
    userName: "Verma Construction",
    phone: "98380 44102",
    siteLocation: "Vrindavan Yojna, Lucknow",
    amountDrawn: 12500,
    hoursRemaining: 34,
    trustScore: 92,
    status: "ACTIVE",
  },
  {
    id: "sos_02",
    userName: "Ramesh Mistri / Site 12",
    phone: "94500 77123",
    siteLocation: "Faizabad Road, Chinhat",
    amountDrawn: 8000,
    hoursRemaining: 18,
    trustScore: 78,
    status: "ACTIVE",
  },
  {
    id: "sos_03",
    userName: "Gomti Contractors",
    phone: "88081 22900",
    siteLocation: "Gomti Nagar Vibhuti Khand",
    amountDrawn: 25000,
    hoursRemaining: 44,
    trustScore: 96,
    status: "ACTIVE",
  },
];

const INITIAL_MISTRI_PASSES: MistriPass[] = [
  {
    id: "pass_01",
    ownerName: "Dr. Sandeep Awasthi",
    mistriName: "Kallu Mistri",
    siteName: "Vipul Khand Kothi #40",
    dailyCap: 5000,
    spentToday: 3200,
    allowedCategories: "Cement, Sand & Fasteners Only",
    isFrozen: false,
  },
  {
    id: "pass_02",
    ownerName: "Anand Gupta (Builder)",
    mistriName: "Dinesh Plumber",
    siteName: "Eldeco Udyan Villa 18",
    dailyCap: 7500,
    spentToday: 1450,
    allowedCategories: "CPVC Pipes & Sanitary Fittings",
    isFrozen: false,
  },
  {
    id: "pass_03",
    ownerName: "Sunil Mehrotra",
    mistriName: "Bablu Painter",
    siteName: "Mahanagar Civil Renovation",
    dailyCap: 4000,
    spentToday: 3950,
    allowedCategories: "Wall Putty, Primer & Brushes",
    isFrozen: true,
  },
];

const INITIAL_BUILDER_BOQS: BuilderBOQ[] = [
  {
    id: "boq_101",
    contractorName: "Shree Ram Infratech",
    siteName: "G+3 Apartment Complex, Sushant Golf City",
    lucknowZone: "Shaheed Path",
    estimatedUnits: "420 Bags OPC + 4.5 Ton TMT + 15,000 Bricks",
    rawEstimateInr: 642000,
    quoteAmountInr: 615000,
    status: "PENDING_QUOTE",
    requestDate: "Today 09:20 AM",
  },
  {
    id: "boq_102",
    contractorName: "Heritage Builders",
    siteName: "Commercial Showroom, Latouche Rd",
    lucknowZone: "Latouche Road",
    estimatedUnits: "250 Bags PPC + 2.1 Ton Steel + Electricals",
    rawEstimateInr: 328000,
    quoteAmountInr: 312000,
    status: "QUOTED",
    requestDate: "Yesterday",
  },
];

const INITIAL_BUYBACKS: LeftoverBuyback[] = [
  {
    id: "bb_01",
    siteName: "Site #412 — Gomti Nagar Phase 2",
    material: "UltraTech OPC 53 (Factory Sealed)",
    quantity: "6 Sealed Bags",
    buybackGoldValue: 2190,
    matchedOrderShortId: "#4892 (Sushant Golf City)",
    matchedDistanceKm: 1.8,
    status: "MATCHED_READY",
  },
  {
    id: "bb_02",
    siteName: "Site #88 — Alambagh Chander Nagar",
    material: "Astral CPVC Pipes 1-inch SDR 11",
    quantity: "4 Unused Lengths (10ft)",
    buybackGoldValue: 1420,
    matchedOrderShortId: "#4901 (Naka Market)",
    matchedDistanceKm: 2.3,
    status: "MATCHED_READY",
  },
];

const AdminCommandContext = createContext<AdminCommandContextType | undefined>(undefined);

export function AdminCommandProvider({ children }: { children: React.ReactNode }) {
  // Global Pulse Bar KPIs
  const [todayGmv, setTodayGmv] = useState(482450);
  const [netCommissionMargin, setNetCommissionMargin] = useState(58420);
  const [avgDeliveryMins, setAvgDeliveryMins] = useState(34.2);
  const [activeEscrowHold, setActiveEscrowHold] = useState(142800);
  const [settledPayouts, setSettledPayouts] = useState(339650);

  // Module 1: Dispatch Radar
  const [dispatchOrders, setDispatchOrders] = useState<DispatchOrder[]>(INITIAL_DISPATCH_ORDERS);

  // Module 2: Mandi & Vault Hedge
  const [mandiRates, setMandiRates] = useState<MandiSKU[]>(() => {
    try {
      const saved = localStorage.getItem("conon_mandi_overrides");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return INITIAL_MANDI_SKUS;
  });

  const [vaultExposure, setVaultExposure] = useState<VaultExposure>({
    lockedCementBags: 1420,
    lockedBrickUnits: 28500,
    marketHikeRiskInr: 46800,
    exposureStatus: "AMBER_EXPOSURE",
  });

  // Module 3: Escrow Queue
  const [escrowQueue, setEscrowQueue] = useState<EscrowOrder[]>(INITIAL_ESCROWS);

  // Module 4: Bill X-Ray & Simulator
  const [billXrayIntel] = useState<BillXrayItem[]>(INITIAL_BILL_XRAY);
  const [simDailyOrders, setSimDailyOrders] = useState(85);
  const [simAvgCommission, setSimAvgCommission] = useState(11);
  const [simCementVariance, setSimCementVariance] = useState(5);

  // Module 5: SOS Users & Mistri Passes
  const [sosRescueUsers, setSosRescueUsers] = useState<SosCreditUser[]>(INITIAL_SOS_USERS);
  const [activeMistriPasses, setActiveMistriPasses] = useState<MistriPass[]>(INITIAL_MISTRI_PASSES);

  // Module 6: BOQ & Leftover Buyback
  const [builderBoqs, setBuilderBoqs] = useState<BuilderBOQ[]>(INITIAL_BUILDER_BOQS);
  const [buybackRequests, setBuybackRequests] = useState<LeftoverBuyback[]>(INITIAL_BUYBACKS);

  // Pending Voice Action Modal
  const [pendingVoiceAction, setPendingVoiceAction] = useState<{
    title: string;
    description: string;
    execute: () => void;
  } | null>(null);

  // Re-route Hub in Module 1
  const reRouteHub = useCallback((orderId: string, newHub: string) => {
    setDispatchOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updatedMins = Math.max(12, ord.minsLeft - 4);
          return {
            ...ord,
            hub: newHub,
            minsLeft: updatedMins,
            status: "OUT_FOR_DELIVERY",
          };
        }
        return ord;
      })
    );
    toast.success(`Order ${orderId} Re-routed!`, {
      description: `Shifted dispatch to ${newHub}. Estimated ETA updated.`,
    });
  }, []);

  // Update Mandi Rate in Module 2
  const updateMandiRate = useCallback((skuId: string, landingCost: number, marginPercent: number) => {
    const updatedRates = mandiRates.map((sku) => {
      if (sku.id === skuId) {
        const retail = Math.round(landingCost * (1 + marginPercent / 100));
        return {
          ...sku,
          dealerLandingCost: landingCost,
          platformMarginPercent: marginPercent,
          liveRetailPrice: retail,
          lastUpdated: "Just Now by Admin",
        };
      }
      return sku;
    });

    setMandiRates(updatedRates);
    try {
      localStorage.setItem("conon_mandi_overrides", JSON.stringify(updatedRates));
    } catch (_) {}

    toast.success("Mandi Rate Published Live!", {
      description: "App Ticker and Living Vault prices synchronized instantly across Lucknow storefront.",
    });
  }, [mandiRates]);

  // Lock Bulk Hedge in Module 2
  const lockBulkHedge = useCallback((partnerDealer: string) => {
    setVaultExposure((prev) => ({
      ...prev,
      marketHikeRiskInr: 0,
      exposureStatus: "HEDGED_100",
      hedgedPartnerDealer: partnerDealer,
    }));
    toast.success("100% Vault Bulk Hedge Secured!", {
      description: `Locked forward contracts with ${partnerDealer}. Zero inflation risk on customer units.`,
    });
  }, []);

  // Release Escrow Payout in Module 3
  const releaseEscrowPayout = useCallback((orderId: string) => {
    let releasedAmount = 0;
    setEscrowQueue((prev) =>
      prev.map((esc) => {
        if (esc.id === orderId) {
          releasedAmount = esc.dealerPayoutAmount;
          return { ...esc, status: "RELEASED" };
        }
        return esc;
      })
    );

    if (releasedAmount > 0) {
      setActiveEscrowHold((prev) => Math.max(0, prev - releasedAmount));
      setSettledPayouts((prev) => prev + releasedAmount);
    }

    toast.success("Partner Payout Released!", {
      description: `₹${releasedAmount.toLocaleString("en-IN")} credited directly to dealer account after GPS photo match.`,
    });
  }, []);

  // Hold for Dispute in Module 3
  const holdForDispute = useCallback((orderId: string, reason: string) => {
    setEscrowQueue((prev) =>
      prev.map((esc) => {
        if (esc.id === orderId) {
          return { ...esc, status: "DISPUTE_HELD", disputeReason: reason };
        }
        return esc;
      })
    );
    toast.error("Escrow Payout Held for Inspection", {
      description: `Reason: ${reason}. Order marked for manager physical inspection.`,
    });
  }, []);

  // Send SOS Reminder in Module 5
  const sendSosReminder = useCallback((id: string) => {
    const user = sosRescueUsers.find((u) => u.id === id);
    toast.success("48-Hr SOS SMS / WhatsApp Sent", {
      description: `Payment reminder dispatched to ${user?.phone || "client"}.`,
    });
  }, [sosRescueUsers]);

  // Mark SOS Settled in Module 5
  const markSosSettled = useCallback((id: string) => {
    setSosRescueUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          return { ...u, status: "SETTLED", hoursRemaining: 0 };
        }
        return u;
      })
    );
    toast.success("SOS Credit Settled & Re-activated", {
      description: "Credit line restored for contractor emergency draw.",
    });
  }, []);

  // Freeze/Unfreeze Mistri Pass in Module 5
  const toggleFreezeMistriPass = useCallback((id: string) => {
    setActiveMistriPasses((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const next = !p.isFrozen;
          toast.info(next ? `🔒 Pass Frozen for ${p.mistriName}` : `🔓 Pass Activated for ${p.mistriName}`);
          return { ...p, isFrozen: next };
        }
        return p;
      })
    );
  }, []);

  // Send Instant BOQ Quote in Module 6
  const sendInstantQuote = useCallback((id: string, quoteAmount: number) => {
    setBuilderBoqs((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          return { ...b, status: "QUOTED", quoteAmountInr: quoteAmount };
        }
        return b;
      })
    );
    toast.success("Official Contractor Quote Sent!", {
      description: `Dispatched instant ₹${quoteAmount.toLocaleString("en-IN")} quote with GST breakdown.`,
    });
  }, []);

  // Approve Buyback Transfer in Module 6
  const approveBuybackTransfer = useCallback((id: string) => {
    let creditAmount = 0;
    setBuybackRequests((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          creditAmount = b.buybackGoldValue;
          return { ...b, status: "COMPLETED" };
        }
        return b;
      })
    );

    setTodayGmv((prev) => prev + creditAmount);
    toast.success("Buyback Approved & Gold Credited!", {
      description: `₹${creditAmount.toLocaleString("en-IN")} credited to customer Living Vault. Re-routed to nearby site.`,
    });
  }, []);

  const netCommissionPercent = todayGmv > 0 ? Number(((netCommissionMargin / todayGmv) * 100).toFixed(1)) : 12.1;

  return (
    <AdminCommandContext.Provider
      value={{
        todayGmv,
        netCommissionMargin,
        netCommissionPercent,
        avgDeliveryMins,
        activeEscrowHold,
        settledPayouts,
        dispatchOrders,
        reRouteHub,
        mandiRates,
        updateMandiRate,
        vaultExposure,
        lockBulkHedge,
        escrowQueue,
        releaseEscrowPayout,
        holdForDispute,
        billXrayIntel,
        simDailyOrders,
        setSimDailyOrders,
        simAvgCommission,
        setSimAvgCommission,
        simCementVariance,
        setSimCementVariance,
        sosRescueUsers,
        sendSosReminder,
        markSosSettled,
        activeMistriPasses,
        toggleFreezeMistriPass,
        builderBoqs,
        sendInstantQuote,
        buybackRequests,
        approveBuybackTransfer,
        pendingVoiceAction,
        setPendingVoiceAction,
      }}
    >
      {children}
    </AdminCommandContext.Provider>
  );
}

export function useAdminCommand() {
  const ctx = useContext(AdminCommandContext);
  if (!ctx) {
    throw new Error("useAdminCommand must be used within an AdminCommandProvider");
  }
  return ctx;
}
