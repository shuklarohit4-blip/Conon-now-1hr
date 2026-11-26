import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { toast } from "sonner";
import {
  playOrderChime,
  playFlashBuzzer,
  playCashoutChime,
  playSosAlarm,
  speakHinglish,
} from "@/lib/sound";
import {
  getSocket,
  joinAdminRoom,
  joinVendorRoom,
  joinDriverRoom,
  joinOrderRoom,
  enqueueBasementAction,
  flushBasementQueue,
} from "@/services/socket";

export type RelayOrderStatus =
  | "NEW_INCOMING"
  | "ACCEPTED_PACKING"
  | "LOADED_DISPATCHED"
  | "OUT_FOR_DELIVERY"
  | "ARRIVED_AT_SITE"
  | "DELIVERED_PENDING_ESCROW"
  | "ESCROW_SETTLED";

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface OrderStop {
  stopId: string;
  hubId: string;
  hubName: string;
  sequenceNo: number;
  pickupQrToken: string;
  isLoaded: boolean;
  materialSummary?: string;
}

export interface RelayOrder {
  id: string;
  shortId: string;
  customerName: string;
  customerPhone: string;
  siteName: string;
  siteAddress: string;
  hubName: string;
  itemsSummary: string;
  weightKg: number;
  vehicleTag: string; // e.g. "Chhota Hathi Loader • 1,040 kg" or "Bike Express • 14 kg"
  vehicleType: "LOADER" | "BIKE";
  netDealerPayout: number;
  totalAmount: number;
  deliveryFee: number;
  palledariBonus: number;
  status: RelayOrderStatus;
  incomingSecondsLeft: number; // 180s timer
  checklist: ChecklistItem[];
  customerOtp: string; // e.g. "2026"
  pickupOtp: string; // e.g. "4912"
  driverName?: string;
  driverPhone?: string;
  driverVehiclePlate?: string;
  unloadingPhotoUrl?: string;
  tarpaulinPhotoUrl?: string;
  tarpaulinPhotoVerified?: boolean;
  gpsDistanceMeters?: number;
  gpsMatchPercent?: number;
  escrowProgress: "LOADED" | "EN_ROUTE" | "VERIFIED" | "SETTLED";
  settledUtr?: string;
  stops?: OrderStop[];
  arrivedAt?: number;
  detentionMinutes?: number;
  detentionCharge?: number;
  createdAt: number;
  deliveredAt?: number;
}

export interface StockItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  inStock: boolean;
  quantityLabel: string;
  dealerRate: number;
  retailRate: number;
  img: string;
}

export interface BulkHedgeOffer {
  id: string;
  material: string;
  quantity: string;
  lockedLandingRate: number;
  instantAdvance: number;
  corridor: string;
  status: "PENDING" | "LOCKED";
  lockedAt?: string;
}

export interface DriverSosAlert {
  id: string;
  orderId: string;
  shortId: string;
  driverName: string;
  location: string;
  reason: string;
  timestamp: string;
  status: "ACTIVE_RESCUE" | "RESOLVED";
}

export interface ReverseBuybackTrip {
  active: boolean;
  orderId: string;
  bonusAmount: number;
  material: string;
  pickupSite: string;
  dropHub: string;
  distanceKm: number;
  status: "OFFERED" | "ACCEPTED" | "COMPLETED";
}

export interface FourPanelRelayState {
  vendorHub: string;
  vendorOnline: boolean;
  vendorTodayEarnings: number;
  vendorStock: Record<string, StockItem>;
  hedgeOffers: BulkHedgeOffer[];
  orders: RelayOrder[];
  driverVehicle: "LOADER" | "BIKE";
  driverOnline: boolean;
  driverTodayKamai: number;
  driverTotalTrips: number;
  driverSosAlerts: DriverSosAlert[];
  reverseBuyback: ReverseBuybackTrip;
  isRainModeActive: boolean;
  lastUpdated: number;
}

const STORAGE_KEY = "conon_four_panel_relay_v2";
const BROADCAST_NAME = "conon_4panel_relay_bus";

const INITIAL_STOCK: Record<string, StockItem> = {
  "cement-opc53": {
    id: "cement-opc53",
    name: "UltraTech Super Cement (OPC 53)",
    category: "Cement",
    unit: "50kg Bag",
    inStock: true,
    quantityLabel: "450 Bags in Yard",
    dealerRate: 352,
    retailRate: 390,
    img: "",
  },
  "steel-tmt550d": {
    id: "steel-tmt550d",
    name: "Kamdhenu PAS 10000 TMT (Fe-550D)",
    category: "Steel",
    unit: "kg",
    inStock: true,
    quantityLabel: "3.2 Ton Bundles",
    dealerRate: 49.5,
    retailRate: 54.5,
    img: "",
  },
  "bricks-avval": {
    id: "bricks-avval",
    name: "First Class Red Clay Bricks (Avval)",
    category: "Bricks",
    unit: "Piece",
    inStock: true,
    quantityLabel: "14,000 Pcs Stacked",
    dealerRate: 7.2,
    retailRate: 8.5,
    img: "",
  },
  "aac-blocks": {
    id: "aac-blocks",
    name: "Magicrete Aerated AAC Blocks (4\")",
    category: "AAC Blocks",
    unit: "Piece",
    inStock: true,
    quantityLabel: "540 Blocks",
    dealerRate: 49,
    retailRate: 58,
    img: "",
  },
  "cpvc-pipes": {
    id: "cpvc-pipes",
    name: "Astral CPVC Pro Pipes & Fittings (1\")",
    category: "Plumbing",
    unit: "Length (10ft)",
    inStock: true,
    quantityLabel: "85 Pipes in Rack",
    dealerRate: 285,
    retailRate: 340,
    img: "",
  },
  "wall-putty": {
    id: "wall-putty",
    name: "Birla White All-Weather Putty (40kg)",
    category: "Finishing",
    unit: "Bag",
    inStock: true,
    quantityLabel: "65 Bags",
    dealerRate: 720,
    retailRate: 830,
    img: "",
  },
};

const INITIAL_HEDGE_OFFERS: BulkHedgeOffer[] = [];

const INITIAL_ORDERS: RelayOrder[] = [];

const INITIAL_REVERSE_BUYBACK: ReverseBuybackTrip = {
  active: false,
  orderId: "BUYBACK-LKO-310",
  bonusAmount: 220,
  material: "6 Sealed Bags UltraTech OPC 53 Cement",
  pickupSite: "Omaxe Heights Gate 2, Gomti Nagar Extn",
  dropHub: "Naka Market Hardware Hub",
  distanceKm: 1.4,
  status: "OFFERED",
};

export interface FourPanelRelayContextType {
  state: FourPanelRelayState;
  // Vendor Actions
  toggleVendorDuty: () => void;
  setVendorHub: (hub: string) => void;
  simulateIncomingExpressOrder: (customTitle?: string) => void;
  acceptVendorOrder: (orderId: string) => void;
  toggleChecklistItem: (orderId: string, itemId: string) => void;
  markOrderLoaded: (orderId: string) => void;
  toggleStockKillSwitch: (skuId: string) => void;
  lockBulkHedge: (hedgeId: string) => void;
  readoutHinglishOrder: (order: RelayOrder, lang?: "en" | "hi") => void;
  splitHubOrder: (
    orderId: string,
    missingItem: string,
    splitHub: string,
    splitPayout: number
  ) => void;
  // Driver Actions
  setDriverVehicle: (type: "LOADER" | "BIKE") => void;
  toggleDriverDuty: () => void;
  readoutHinglishRoute: (order: RelayOrder, lang?: "en" | "hi") => void;
  markDriverArrivedAtSite: (orderId: string) => void;
  simulateDetentionFastForward: (orderId: string) => void;
  markStopLoaded: (orderId: string, stopId: string) => void;
  completeGeoPhotoEscrow: (
    orderId: string,
    payload: {
      otp: string;
      gpsDistanceMeters: number;
      gpsMatchPercent: number;
      photoUrl: string;
      tarpaulinPhotoUrl?: string;
      tarpaulinPhotoVerified?: boolean;
    }
  ) => boolean;
  triggerDriverSos: (orderId: string, reason: string) => void;
  acceptReverseBuyback: () => void;
  completeReverseBuyback: () => void;
  // Admin Relay Actions
  toggleRainMode: () => Promise<void>;
  adminReleaseEscrow: (orderId: string) => void;
  adminCreateHedgeOffer: (offer: Omit<BulkHedgeOffer, "id" | "status">) => void;
}

const FourPanelRelayContext = createContext<FourPanelRelayContextType | null>(null);

export const DEFAULT_LUCKNOW_HUB = "Lucknow Partner Hub";

export interface LucknowPartnerHubInfo {
  id: string;
  name: string;
  shortName: string;
  owner: string;
  phone: string;
  zone: string;
  rating: string;
  verifiedBadge: string;
}

export const LUCKNOW_PARTNER_HUBS: LucknowPartnerHubInfo[] = [];

function loadSavedState(): FourPanelRelayState {
  if (typeof window === "undefined") {
    return {
      vendorHub: DEFAULT_LUCKNOW_HUB,
      vendorOnline: true,
      vendorTodayEarnings: 0,
      vendorStock: INITIAL_STOCK,
      hedgeOffers: INITIAL_HEDGE_OFFERS,
      orders: INITIAL_ORDERS,
      driverVehicle: "LOADER",
      driverOnline: true,
      driverTodayKamai: 0,
      driverTotalTrips: 0,
      driverSosAlerts: [],
      reverseBuyback: INITIAL_REVERSE_BUYBACK,
      isRainModeActive: false,
      lastUpdated: Date.now(),
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.orders) && parsed.vendorStock) {
        if (parsed.isRainModeActive === undefined) parsed.isRainModeActive = false;
        if (!parsed.vendorHub || parsed.vendorHub === "Naka Market Hardware Hub") {
          parsed.vendorHub = DEFAULT_LUCKNOW_HUB;
        }
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return {
    vendorHub: DEFAULT_LUCKNOW_HUB,
    vendorOnline: true,
    vendorTodayEarnings: 0,
    vendorStock: INITIAL_STOCK,
    hedgeOffers: INITIAL_HEDGE_OFFERS,
    orders: INITIAL_ORDERS,
    driverVehicle: "LOADER",
    driverOnline: true,
    driverTodayKamai: 0,
    driverTotalTrips: 0,
    driverSosAlerts: [],
    reverseBuyback: INITIAL_REVERSE_BUYBACK,
    isRainModeActive: false,
    lastUpdated: Date.now(),
  };
}

export function FourPanelRelayProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FourPanelRelayState>(loadSavedState);
  const broadcastRef = useRef<BroadcastChannel | null>(null);

  // Initialize BroadcastChannel
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return undefined;
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(BROADCAST_NAME);
      broadcastRef.current = channel;

      channel.onmessage = (event) => {
        if (event.data?.type === "RELAY_STATE_UPDATE" && event.data.payload) {
          setState(event.data.payload);
        }
      };
    } catch {
      // ignore
    }

    return () => {
      if (channel) channel.close();
    };
  }, []);

  // Listen for storage events across tabs
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setState(parsed);
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Sync state mutation helper
  const updateAndBroadcast = useCallback(
    (updater: (prev: FourPanelRelayState) => FourPanelRelayState) => {
      setState((prev) => {
        const next = updater(prev);
        next.lastUpdated = Date.now();
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          if (broadcastRef.current) {
            broadcastRef.current.postMessage({
              type: "RELAY_STATE_UPDATE",
              payload: next,
            });
          }
        } catch (err) {
          console.error("[FourPanelRelay] storage error:", err);
        }
        return next;
      });
    },
    []
  );

  // Connect to Live Socket.io Relay Engine
  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const socket = getSocket();
    joinAdminRoom();
    joinVendorRoom(state.vendorHub);
    joinDriverRoom();

    // 1. Weather Rain Mode
    const onRainModeChanged = (payload: any) => {
      const active = Boolean(payload?.rainMode);
      updateAndBroadcast((prev) => ({ ...prev, isRainModeActive: active }));
      if (active) {
        toast.warning("🌧️ Rain-Shield Tirpal Mode ACTIVATED!", {
          description: "Tarpaulin photo proof mandatory for all moisture-sensitive material dispatches.",
        });
      } else {
        toast.success("☀️ Rain-Shield mode deactivated. Normal dispatch restored.");
      }
    };

    const onSystemReady = (payload: any) => {
      if (payload?.rainMode !== undefined) {
        updateAndBroadcast((prev) => ({ ...prev, isRainModeActive: Boolean(payload.rainMode) }));
      }
    };

    // 2. Incoming Order Buzzer from Backend
    const onVendorNewOrder = (order: any) => {
      playFlashBuzzer();
      updateAndBroadcast((prev) => {
        const orderId = order.id || order.orderId;
        const exists = prev.orders.some((o) => o.id === orderId);
        if (exists) return prev;

        const incomingOrder: RelayOrder = {
          id: orderId,
          shortId: order.shortId || orderId.slice(-4),
          customerName: order.customerName || order.buyer || "Lucknow Site Customer",
          customerPhone: order.customerPhone || "+91 94150 99887",
          siteName: order.siteName || "Lucknow Construction Site",
          siteAddress: order.deliveryAddress || "Lucknow Corridor Site",
          hubName: prev.vendorHub,
          itemsSummary: order.itemsSummary || (Array.isArray(order.items) ? order.items.map((i: any) => i.name).join(", ") : "Cement & Civil Load"),
          weightKg: order.weightKg || 1040,
          vehicleTag: (order.weightKg || 1040) <= 30 ? "Bike Express • 14 kg" : "Chhota Hathi Loader • 1,040 kg",
          vehicleType: (order.weightKg || 1040) <= 30 ? "BIKE" : "LOADER",
          netDealerPayout: order.netDealerPayout || order.dealerPayable || 8420,
          totalAmount: order.totalAmount || 9650,
          deliveryFee: order.deliveryFee || 480,
          palledariBonus: order.palledariBonus || 120,
          status: "NEW_INCOMING",
          incomingSecondsLeft: 180,
          customerOtp: order.customerOtp || "2026",
          pickupOtp: order.pickupOtp || "4912",
          escrowProgress: "LOADED",
          checklist: [
            { id: "c1", label: "Material Count & Grade Inspected", checked: false },
            { id: "c2", label: "Tirpal / Moisture Seal Attached", checked: false },
          ],
          createdAt: Date.now(),
        };

        return { ...prev, orders: [incomingOrder, ...prev.orders] };
      });
      toast.success("⚡ Live Express Order Dispatched from Socket Relay!");
    };

    // 3. Driver New Mission
    const onDriverNewMission = (mission: any) => {
      playOrderChime();
      updateAndBroadcast((prev) => {
        const orderId = mission.orderId;
        const existing = prev.orders.find((o) => o.id === orderId);
        if (existing) {
          const updated = prev.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  stops: mission.stops,
                  pickupOtp: mission.pickupQrToken?.split("-")?.pop() || o.pickupOtp,
                  status: "ACCEPTED_PACKING" as RelayOrderStatus,
                }
              : o
          );
          return { ...prev, orders: updated };
        }
        return prev;
      });
      toast.info("🚚 New Delivery Mission Assigned to your Cockpit!");
    };

    // 4. Reverse Buyback Bonus Ping
    const onReverseBuybackPing = (buyback: any) => {
      playCashoutChime();
      updateAndBroadcast((prev) => ({
        ...prev,
        reverseBuyback: {
          active: true,
          orderId: buyback.buybackId || "BUYBACK-LKO-310",
          bonusAmount: buyback.bonusAmount || 220,
          material: buyback.material || "6 Sealed Bags UltraTech OPC 53 Cement",
          pickupSite: buyback.pickupSite || "Omaxe Heights Gate 2, Gomti Nagar Extn",
          dropHub: buyback.dropHub || "Naka Market Hardware Hub",
          distanceKm: buyback.distanceKm || 1.4,
          status: "OFFERED",
        },
      }));
      toast.success("♻️ Khali Mat Lautna! Return Trip Reverse Buyback Bonus (+₹220) Unlocked!");
    };

    // 5. Order Status Updated
    const onOrderStatusUpdated = (payload: any) => {
      updateAndBroadcast((prev) => {
        const updated = prev.orders.map((o) => {
          if (o.id === payload.orderId) {
            return {
              ...o,
              status: (payload.status || o.status) as RelayOrderStatus,
              escrowProgress: payload.escrowProgress || o.escrowProgress,
              settledUtr: payload.settledUtr || o.settledUtr,
              unloadingPhotoUrl: payload.unloadingPhotoUrl || o.unloadingPhotoUrl,
            };
          }
          return o;
        });
        return { ...prev, orders: updated };
      });
    };

    // 6. Detention Warning
    const onDetentionWarning = (payload: any) => {
      toast.error(`⚠️ Site Detention Warning (Order #${payload.orderId?.slice(-4) || ""})`, {
        description: `Waiting SLA exceeded by ${payload.minutesOver} mins. Current detention fee: ₹${payload.detentionCharge}`,
      });
      updateAndBroadcast((prev) => {
        const updated = prev.orders.map((o) => {
          if (o.id === payload.orderId) {
            return {
              ...o,
              detentionMinutes: payload.minutesOver,
              detentionCharge: payload.detentionCharge,
            };
          }
          return o;
        });
        return { ...prev, orders: updated };
      });
    };

    // 7. SOS Alert
    const onDriverSos = (alert: any) => {
      playSosAlarm();
      updateAndBroadcast((prev) => ({
        ...prev,
        driverSosAlerts: [alert, ...prev.driverSosAlerts],
      }));
      toast.error(`🚨 DRIVER BREAKDOWN SOS: ${alert.driverName}`, {
        description: `${alert.location} • Reason: ${alert.reason}`,
      });
    };

    // 8. Vendor Payout Settled
    const onVendorPayoutSettled = (payload: any) => {
      playCashoutChime();
      updateAndBroadcast((prev) => {
        const orderId = payload.orderId;
        const amount = Number(payload.amount || 8420);
        const updatedOrders = prev.orders.map((o) => {
          if (o.id === orderId) {
            return {
              ...o,
              status: "ESCROW_SETTLED" as RelayOrderStatus,
              escrowProgress: "SETTLED" as const,
              settledUtr: payload.utr || "HDFC9021882194",
            };
          }
          return o;
        });
        return {
          ...prev,
          orders: updatedOrders,
          vendorTodayEarnings: prev.vendorTodayEarnings + amount,
        };
      });
      toast.success(`💳 Escrow Released! ₹${payload.amount} Settled via UPI (UTR: ${payload.utr})`);
    };

    socket.on("system:rain_mode_changed", onRainModeChanged);
    socket.on("system:ready", onSystemReady);
    socket.on("vendor:new_order", onVendorNewOrder);
    socket.on("driver:new_mission", onDriverNewMission);
    socket.on("driver:reverse_buyback_ping", onReverseBuybackPing);
    socket.on("order:status_updated", onOrderStatusUpdated);
    socket.on("order:detention_warning", onDetentionWarning);
    socket.on("admin:driver_sos", onDriverSos);
    socket.on("vendor:payout_settled", onVendorPayoutSettled);

    return () => {
      socket.off("system:rain_mode_changed", onRainModeChanged);
      socket.off("system:ready", onSystemReady);
      socket.off("vendor:new_order", onVendorNewOrder);
      socket.off("driver:new_mission", onDriverNewMission);
      socket.off("driver:reverse_buyback_ping", onReverseBuybackPing);
      socket.off("order:status_updated", onOrderStatusUpdated);
      socket.off("order:detention_warning", onDetentionWarning);
      socket.off("admin:driver_sos", onDriverSos);
      socket.off("vendor:payout_settled", onVendorPayoutSettled);
    };
  }, [state.vendorHub, updateAndBroadcast]);

  // Live 180s countdown ticker for incoming orders
  useEffect(() => {
    const interval = setInterval(() => {
      updateAndBroadcast((prev) => {
        let changed = false;
        const updatedOrders = prev.orders.map((o) => {
          if (o.status === "NEW_INCOMING" && o.incomingSecondsLeft > 0) {
            changed = true;
            return { ...o, incomingSecondsLeft: o.incomingSecondsLeft - 1 };
          }
          return o;
        });
        if (!changed) return prev;
        return { ...prev, orders: updatedOrders };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [updateAndBroadcast]);

  // 1. Vendor: Toggle Duty
  const toggleVendorDuty = useCallback(() => {
    updateAndBroadcast((prev) => {
      const nextOnline = !prev.vendorOnline;
      if (nextOnline) {
        playOrderChime();
        toast.success("🟢 Dukaan Live & Online! Receiving orders from Lucknow sites.");
      } else {
        toast.info("🟡 Shop marked Busy / Offline.");
      }
      return { ...prev, vendorOnline: nextOnline };
    });
  }, [updateAndBroadcast]);

  // Vendor: Change Hub
  const setVendorHub = useCallback(
    (hub: string) => {
      updateAndBroadcast((prev) => ({ ...prev, vendorHub: hub }));
      toast.success(`Switched active partner hub to: ${hub}`);
    },
    [updateAndBroadcast]
  );

  // 2. Simulate Incoming Express Order
  const simulateIncomingExpressOrder = useCallback(
    (customTitle?: string) => {
      const randId = Math.floor(1000 + Math.random() * 9000).toString();
      const newOrder: RelayOrder = {
        id: `ORD-LKO-${randId}`,
        shortId: randId,
        customerName: customTitle || "Chaudhary Infra (Civil Contractor)",
        customerPhone: "+91 98394 88120",
        siteName: "Shaheed Path Pocket 9 Commercial Site",
        siteAddress: "Plot 88, Near Omaxe City Gate, Shaheed Path, Lucknow",
        hubName: state.vendorHub,
        itemsSummary: "UltraTech OPC 53 (25 Bags) + Birla Putty (5 Bags)",
        weightKg: 1450,
        vehicleTag: "Chhota Hathi Loader • 1,450 kg",
        vehicleType: "LOADER",
        netDealerPayout: 10450,
        totalAmount: 11800,
        deliveryFee: 520,
        palledariBonus: 120,
        status: "NEW_INCOMING",
        incomingSecondsLeft: 180,
        customerOtp: "2026",
        pickupOtp: String(Math.floor(1000 + Math.random() * 9000)),
        driverName: "Suresh S. (Loader UP 32 EL 8901)",
        driverPhone: "+91 94500 23411",
        driverVehiclePlate: "UP 32 EL 8901",
        escrowProgress: "LOADED",
        checklist: [
          { id: "c1", label: "UltraTech Super OPC 53 — 25 Bags (Fresh Stock)", checked: false },
          { id: "c2", label: "Birla White All-Weather Putty — 5 Bags (40kg)", checked: false },
          { id: "c3", label: "ISI Mark Verified & Anti-Moisture Sealed", checked: false },
          { id: "c4", label: "Chhota Hathi Loading Bay Cleared", checked: false },
        ],
        createdAt: Date.now(),
      };

      playFlashBuzzer();
      updateAndBroadcast((prev) => ({
        ...prev,
        orders: [newOrder, ...prev.orders],
      }));

      toast.success(`⚡ [180s Buzzer] New Express Order #${randId}!`, {
        description: `Net Payout ₹10,450 • Shaheed Path Site • Accept within 180s`,
      });
    },
    [state.vendorHub, updateAndBroadcast]
  );

  // 3. Accept Vendor Order -> PACKING
  const acceptVendorOrder = useCallback(
    (orderId: string) => {
      playOrderChime();
      updateAndBroadcast((prev) => {
        const nextOrders = prev.orders.map((o) => {
          if (o.id === orderId) {
            return {
              ...o,
              status: "ACCEPTED_PACKING" as RelayOrderStatus,
              incomingSecondsLeft: 0,
            };
          }
          return o;
        });
        return { ...prev, orders: nextOrders };
      });

      // Synchronize with backend REST API
      fetch(`/api/vendor/orders/${orderId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hubId: state.vendorHub }),
      }).catch(() => {});

      toast.success("✅ Order Accepted! Loading checklist activated.");
    },
    [state.vendorHub, updateAndBroadcast]
  );

  // 4. Checklist Item Check
  const toggleChecklistItem = useCallback(
    (orderId: string, itemId: string) => {
      updateAndBroadcast((prev) => {
        const nextOrders = prev.orders.map((o) => {
          if (o.id === orderId) {
            const nextList = o.checklist.map((item) =>
              item.id === itemId ? { ...item, checked: !item.checked } : item
            );
            return { ...o, checklist: nextList };
          }
          return o;
        });
        return { ...prev, orders: nextOrders };
      });
    },
    [updateAndBroadcast]
  );

  // 5. Vendor: Scan QR & Mark Loaded -> Transfer to Driver Cockpit!
  const markOrderLoaded = useCallback(
    (orderId: string) => {
      playOrderChime();
      updateAndBroadcast((prev) => {
        let acceptedPayout = 0;
        const nextOrders = prev.orders.map((o) => {
          if (o.id === orderId) {
            acceptedPayout = o.netDealerPayout;
            return {
              ...o,
              status: "OUT_FOR_DELIVERY" as RelayOrderStatus,
              escrowProgress: "EN_ROUTE" as const,
            };
          }
          return o;
        });
        return {
          ...prev,
          orders: nextOrders,
          vendorTodayEarnings: prev.vendorTodayEarnings + acceptedPayout,
        };
      });

      // Synchronize with backend REST API
      fetch(`/api/vendor/orders/${orderId}/handover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hubId: state.vendorHub }),
      }).catch(() => {});

      toast.success("🚚 Material Loaded on Driver Vehicle!", {
        description: "Dispatched! Handed off to Driver Cockpit & live tracking active.",
      });
    },
    [state.vendorHub, updateAndBroadcast]
  );

  // 6. Stock Kill-Switch
  const toggleStockKillSwitch = useCallback(
    (skuId: string) => {
      updateAndBroadcast((prev) => {
        const currentItem = prev.vendorStock[skuId];
        if (!currentItem) return prev;
        const updatedItem = { ...currentItem, inStock: !currentItem.inStock };
        if (updatedItem.inStock) {
          toast.success(`🟢 ${updatedItem.name} marked IN STOCK.`);
        } else {
          toast.error(`🔴 ${updatedItem.name} KILLED! Marked OUT OF STOCK across Storefront.`);
        }

        fetch("/api/vendor/hub/hub-naka/stock-toggle", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sku: skuId, inStock: updatedItem.inStock }),
        }).catch(() => {});

        return {
          ...prev,
          vendorStock: { ...prev.vendorStock, [skuId]: updatedItem },
        };
      });
    },
    [updateAndBroadcast]
  );

  // 7. Lock Bulk Hedge Offer
  const lockBulkHedge = useCallback(
    (hedgeId: string) => {
      playCashoutChime();
      updateAndBroadcast((prev) => {
        let advanceAmt = 0;
        const updatedOffers = prev.hedgeOffers.map((h) => {
          if (h.id === hedgeId) {
            advanceAmt = h.instantAdvance;
            return { ...h, status: "LOCKED" as const, lockedAt: new Date().toLocaleTimeString() };
          }
          return h;
        });

        fetch(`/api/vendor/hedges/${hedgeId}/lock`, { method: "POST" }).catch(() => {});

        return {
          ...prev,
          hedgeOffers: updatedOffers,
          vendorTodayEarnings: prev.vendorTodayEarnings + advanceAmt,
        };
      });
      toast.success("🤝 Bulk Hedge Locked with Admin Command OS!", {
        description: "Instant Advance credited! Admin Vault Exposure updated to 100% Hedged.",
      });
    },
    [updateAndBroadcast]
  );

  // 8. Hinglish / English Munim Voice Readout (Web Speech API)
  const readoutHinglishOrder = useCallback((order: RelayOrder, lang: "en" | "hi" = "hi") => {
    let text = "";
    if (lang === "hi") {
      text = `नया ऑर्डर आया है! ऑर्डर नंबर ${order.shortId}। ${order.itemsSummary}। डिलीवरी साइट ${order.siteName}। छोटा हाथी लोडर। आपकी नेट दुकान कमाई ₹${order.netDealerPayout} पक्की है।`;
    } else {
      text = `New express order received! Order number ${order.shortId}. ${order.itemsSummary}. Delivery to ${order.siteName}. Chhota Hathi loader assigned. Your net store payout is ₹${order.netDealerPayout} guaranteed.`;
    }
    speakHinglish(text, () => {
      toast.info(lang === "hi" ? "ऑर्डर वॉइस विवरण पूरा हुआ।" : "Order voice readout complete.");
    }, lang);
  }, []);

  // 8B. World-First "Invisible Warehouse" (1-Tap Split-Hub Sharing)
  const splitHubOrder = useCallback(
    (orderId: string, missingItem: string, splitHub: string, splitPayout: number) => {
      playOrderChime();
      updateAndBroadcast((prev) => {
        const nextOrders = prev.orders.map((o) => {
          if (o.id === orderId) {
            const currentHubPayout = Math.max(0, o.netDealerPayout - splitPayout);
            const stop1: OrderStop = {
              stopId: `stop-${o.shortId}-1`,
              hubId: "hub-latouche",
              hubName: prev.vendorHub,
              sequenceNo: 1,
              pickupQrToken: `CON-PICKUP-${o.shortId}-STOP1`,
              isLoaded: true,
              materialSummary: `Primary Hub Items (Dealer Net: ₹${currentHubPayout.toLocaleString("en-IN")})`,
            };
            const stop2: OrderStop = {
              stopId: `stop-${o.shortId}-2`,
              hubId: "hub-aminabad",
              hubName: splitHub,
              sequenceNo: 2,
              pickupQrToken: `CON-PICKUP-${o.shortId}-STOP2`,
              isLoaded: false,
              materialSummary: `${missingItem} (Neighbour Net: ₹${splitPayout.toLocaleString("en-IN")})`,
            };
            return {
              ...o,
              stops: [stop1, stop2],
              netDealerPayout: currentHubPayout,
              itemsSummary: `${o.itemsSummary} [Split: ${missingItem} from ${splitHub}]`,
            };
          }
          return o;
        });
        return { ...prev, orders: nextOrders };
      });

      toast.success("🤝 Invisible Warehouse Split Activated!", {
        description: `Split ${missingItem} with ${splitHub}. Upgraded to 2-stop single-loader dispatch!`,
      });
    },
    [updateAndBroadcast]
  );

  // 9. Driver: Toggle Vehicle Type
  const setDriverVehicle = useCallback(
    (type: "LOADER" | "BIKE") => {
      updateAndBroadcast((prev) => ({ ...prev, driverVehicle: type }));
      toast.success(`Switched vehicle to: ${type === "LOADER" ? "Chhota Hathi Loader (Max 1,500 kg)" : "Bike Express (Max 30 kg)"}`);
    },
    [updateAndBroadcast]
  );

  // 10. Driver: Toggle Duty
  const toggleDriverDuty = useCallback(() => {
    updateAndBroadcast((prev) => {
      const nextOnline = !prev.driverOnline;
      if (nextOnline) {
        playOrderChime();
        toast.success("🟢 Driver Cockpit Online! GPS active in Lucknow corridor.");
      } else {
        toast.info("🔴 Driver Cockpit Offline.");
      }
      return { ...prev, driverOnline: nextOnline };
    });
  }, [updateAndBroadcast]);

  // 11. Driver: Hinglish / Bilingual Route Voice
  const readoutHinglishRoute = useCallback((order: RelayOrder, lang?: "en" | "hi") => {
    const isHindi = lang === "hi";
    const text = isHindi
      ? `रूट शुरू हो गया है। ${order.hubName} से सामान लोड करें। शहीद पथ होते हुए ${order.siteName} पर डिलीवरी करनी है। ग्राहक से ओटीपी ${order.customerOtp} लेने के बाद अनलोड करें। कुल कमाई ₹${order.deliveryFee + order.palledariBonus} सीधे यूपीआई में मिलेगी।`
      : `Mission active. Pick up payload from ${order.hubName}. Proceed via Shaheed Path corridor to site at ${order.siteName}. Obtain 4-digit handover OTP ${order.customerOtp} before unloading. Total guaranteed payout is ₹${order.deliveryFee + order.palledariBonus}.`;
    speakHinglish(
      text,
      () => {
        toast.info(isHindi ? "रूट वॉयस निर्देश पूरा हुआ।" : "Turn-by-turn route voice complete.");
      },
      lang || "hi"
    );
  }, []);

  // 11b. Driver: Simulate Detention Fast-Forward (+15 Mins Test)
  const simulateDetentionFastForward = useCallback(
    (orderId: string) => {
      playSosAlarm();
      updateAndBroadcast((prev) => {
        const nextOrders = prev.orders.map((o) => {
          if (o.id === orderId) {
            const nextMinutes = (o.detentionMinutes || 0) + 15;
            const nextCharge = nextMinutes * 2;
            return {
              ...o,
              detentionMinutes: nextMinutes,
              detentionCharge: nextCharge,
            };
          }
          return o;
        });
        return { ...prev, orders: nextOrders };
      });
      toast.warning("⚡ Fast-Forward: 15m Detention Added (+₹30 charge)", {
        description: "Auto-waiting fee synced to Customer & Admin God-Eye radar at ₹2/min.",
      });
    },
    [updateAndBroadcast]
  );

  // 12. Driver: Mark Arrived at Site
  const markDriverArrivedAtSite = useCallback(
    (orderId: string) => {
      playOrderChime();
      updateAndBroadcast((prev) => {
        const nextOrders = prev.orders.map((o) => {
          if (o.id === orderId) {
            return {
              ...o,
              status: "ARRIVED_AT_SITE" as RelayOrderStatus,
              arrivedAt: Date.now(),
            };
          }
          return o;
        });
        return { ...prev, orders: nextOrders };
      });

      // Synchronize with backend REST API
      fetch(`/api/driver/orders/${orderId}/arrived`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: 26.7824, lng: 80.9892 }),
      }).catch(() => {});

      toast.success("📍 Arrived at Construction Site Gate!", {
        description: "GPS Verified 9m from pin. 15-min free unloading window started.",
      });
    },
    [updateAndBroadcast]
  );

  // Driver: Multi-Stop Stop Loaded
  const markStopLoaded = useCallback(
    (orderId: string, stopId: string) => {
      playOrderChime();
      updateAndBroadcast((prev) => {
        const nextOrders = prev.orders.map((o) => {
          if (o.id === orderId && o.stops) {
            const nextStops = o.stops.map((s) => (s.stopId === stopId ? { ...s, isLoaded: true } : s));
            const allLoaded = nextStops.every((s) => s.isLoaded);
            return {
              ...o,
              stops: nextStops,
              status: (allLoaded ? "OUT_FOR_DELIVERY" : o.status) as RelayOrderStatus,
            };
          }
          return o;
        });
        return { ...prev, orders: nextOrders };
      });
      toast.success("✅ Stop Loaded! Material scanned and loaded on vehicle.");
    },
    [updateAndBroadcast]
  );

  // 13. Driver: Complete Geo-Photo Escrow Drop (with Rain-Shield Check & Offline Basement Queue)
  const completeGeoPhotoEscrow = useCallback(
    (
      orderId: string,
      payload: {
        otp: string;
        gpsDistanceMeters: number;
        gpsMatchPercent: number;
        photoUrl: string;
        tarpaulinPhotoUrl?: string;
        tarpaulinPhotoVerified?: boolean;
      }
    ): boolean => {
      let success = false;
      let orderEarn = 0;

      const targetOrder = state.orders.find((o) => o.id === orderId);
      if (!targetOrder) return false;

      // Check Rain Mode requirement
      if (state.isRainModeActive) {
        const isMoisture = targetOrder.itemsSummary.toLowerCase().includes("cement") || targetOrder.itemsSummary.toLowerCase().includes("putty");
        if (isMoisture && !payload.tarpaulinPhotoVerified) {
          toast.error("🌧️ Rain-Shield Verification Required!", {
            description: "Rain Mode is ACTIVE! Upload and verify Tarpaulin proof before site release.",
          });
          return false;
        }
      }

      // Verify OTP: Allow real customer OTP or master demo OTP '2026'
      const isOtpValid = payload.otp === targetOrder.customerOtp || payload.otp === "2026";
      if (!isOtpValid) {
        toast.error("❌ Invalid Handover OTP! Ask the Site Engineer / Builder for 4-digit OTP.");
        return false;
      }

      success = true;
      orderEarn = targetOrder.deliveryFee + targetOrder.palledariBonus;

      updateAndBroadcast((prev) => {
        const nextOrders = prev.orders.map((o) => {
          if (o.id === orderId) {
            return {
              ...o,
              status: "DELIVERED_PENDING_ESCROW" as RelayOrderStatus,
              escrowProgress: "VERIFIED" as const,
              unloadingPhotoUrl: payload.photoUrl,
              tarpaulinPhotoUrl: payload.tarpaulinPhotoUrl,
              tarpaulinPhotoVerified: payload.tarpaulinPhotoVerified,
              gpsDistanceMeters: payload.gpsDistanceMeters,
              gpsMatchPercent: payload.gpsMatchPercent,
              deliveredAt: Date.now(),
            };
          }
          return o;
        });

        return {
          ...prev,
          orders: nextOrders,
          driverTodayKamai: prev.driverTodayKamai + orderEarn,
          driverTotalTrips: prev.driverTotalTrips + 1,
          reverseBuyback: {
            ...prev.reverseBuyback,
            active: true, // Trigger "Khali Mat Lautna" Reverse Return Trip Card!
          },
        };
      });

      // Send to backend or enqueue to Offline Basement Action Queue
      const escrowPayload = {
        id: `escrow-${Date.now()}`,
        orderId,
        driverId: "DRV-LKO-CH-01",
        otp: payload.otp,
        photoUrl: payload.photoUrl,
        tarpaulinPhotoUrl: payload.tarpaulinPhotoUrl,
        tarpaulinPhotoVerified: payload.tarpaulinPhotoVerified,
        gpsDistanceMeters: payload.gpsDistanceMeters,
        gpsMatchPercent: payload.gpsMatchPercent,
        timestamp: Date.now(),
      };

      if (typeof window !== "undefined" && !navigator.onLine) {
        enqueueBasementAction(escrowPayload);
        toast.warning("📦 Offline Basement Mode: Action queued locally. Will auto-sync when network returns!");
      } else {
        fetch(`/api/driver/orders/${orderId}/complete-escrow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(escrowPayload),
        }).catch(() => {
          enqueueBasementAction(escrowPayload);
          toast.warning("📦 Network drop detected. Queued in Offline Basement Queue!");
        });
      }

      playCashoutChime();
      toast.success(`🎉 Delivery Complete! +₹${orderEarn} Credited to Kamai Wallet!`, {
        description: "Unloading photo & GPS proof sent to Admin Geo-Photo Escrow Room.",
      });

      return success;
    },
    [state.orders, state.isRainModeActive, updateAndBroadcast]
  );

  // 14. Driver: Trigger Breakdown / Dhalai SOS
  const triggerDriverSos = useCallback(
    (orderId: string, reason: string) => {
      playSosAlarm();
      const alert: DriverSosAlert = {
        id: `SOS-${Date.now()}`,
        orderId,
        shortId: orderId.replace(/^ORD-LKO-/, ""),
        driverName: "Suresh S. (Loader UP 32 EL 8901)",
        location: "Shaheed Path near Phoenix Palassio (Kilometer 14)",
        reason: reason || "Tyre Puncture / Engine Overheat with 20 Bags Cement",
        timestamp: new Date().toLocaleTimeString(),
        status: "ACTIVE_RESCUE",
      };

      updateAndBroadcast((prev) => ({
        ...prev,
        driverSosAlerts: [alert, ...prev.driverSosAlerts],
      }));

      fetch(`/api/driver/orders/${orderId}/sos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alert),
      }).catch(() => {});

      toast.error("🚨 EMERGENCY DHALAI SOS TRANSMITTED!", {
        description: "Rescue unit dispatched from nearest hub. Alert pushed to Admin Command OS.",
      });
    },
    [updateAndBroadcast]
  );

  // 15. Driver: Accept Reverse Buyback Trip
  const acceptReverseBuyback = useCallback(() => {
    playOrderChime();
    updateAndBroadcast((prev) => ({
      ...prev,
      reverseBuyback: {
        ...prev.reverseBuyback,
        status: "ACCEPTED",
      },
    }));

    fetch("/api/driver/buyback/BUYBACK-LKO-310/accept", { method: "POST" }).catch(() => {});

    toast.success("♻️ Reverse Buyback Mission Accepted!", {
      description: "Pickup 6 sealed cement bags from Omaxe Heights -> Drop at Naka Hub (+₹220 bonus).",
    });
  }, [updateAndBroadcast]);

  // 16. Driver: Complete Reverse Buyback Trip
  const completeReverseBuyback = useCallback(() => {
    playCashoutChime();
    updateAndBroadcast((prev) => ({
      ...prev,
      driverTodayKamai: prev.driverTodayKamai + prev.reverseBuyback.bonusAmount,
      reverseBuyback: {
        ...prev.reverseBuyback,
        active: false,
        status: "COMPLETED",
      },
    }));
    toast.success("💰 +₹220 Khali Mat Lautna Bonus Credited!", {
      description: "Sealed bags returned to Naka Hub. Zero empty return completed!",
    });
  }, [updateAndBroadcast]);

  // 17. Admin: Release Escrow Payout
  const adminReleaseEscrow = useCallback(
    (orderId: string) => {
      playCashoutChime();
      const utr = `UPI${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      updateAndBroadcast((prev) => {
        let payoutAmount = 8420;
        const nextOrders = prev.orders.map((o) => {
          if (o.id === orderId) {
            payoutAmount = o.netDealerPayout || 8420;
            return {
              ...o,
              status: "ESCROW_SETTLED" as RelayOrderStatus,
              escrowProgress: "SETTLED" as const,
              settledUtr: utr,
            };
          }
          return o;
        });
        return {
          ...prev,
          orders: nextOrders,
          vendorTodayEarnings: prev.vendorTodayEarnings + payoutAmount,
        };
      });

      fetch(`/api/admin/orders/${orderId}/release-escrow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utr }),
      }).catch(() => {});

      toast.success(`💳 Escrow Released to Dealer! UTR: ${utr}`, {
        description: "Payment instantly credited via Razorpay / HDFC UPI.",
      });
    },
    [updateAndBroadcast]
  );

  // 18. Admin: Create Hedge Offer
  const adminCreateHedgeOffer = useCallback(
    (offer: Omit<BulkHedgeOffer, "id" | "status">) => {
      const newOffer: BulkHedgeOffer = {
        ...offer,
        id: `hedge-${Date.now()}`,
        status: "PENDING",
      };
      updateAndBroadcast((prev) => ({
        ...prev,
        hedgeOffers: [newOffer, ...prev.hedgeOffers],
      }));
      toast.success("📢 Bulk Rate-Lock Hedge Broadcast to Partner Dukaan Inbox!");
    },
    [updateAndBroadcast]
  );

  // 19. Admin: Toggle Rain Mode
  const toggleRainMode = useCallback(async () => {
    const nextState = !state.isRainModeActive;
    updateAndBroadcast((prev) => ({ ...prev, isRainModeActive: nextState }));

    try {
      await fetch("/api/admin/weather-rain-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rainMode: nextState }),
      });
    } catch {}

    if (nextState) {
      toast.warning("🌧️ Rain-Shield Tirpal Mode ACTIVATED!", {
        description: "Tarpaulin photo proof mandatory for all moisture-sensitive material dispatches.",
      });
    } else {
      toast.success("☀️ Rain-Shield mode deactivated. Normal dispatch restored.");
    }
  }, [state.isRainModeActive, updateAndBroadcast]);

  const value = {
    state,
    toggleVendorDuty,
    setVendorHub,
    simulateIncomingExpressOrder,
    acceptVendorOrder,
    toggleChecklistItem,
    markOrderLoaded,
    toggleStockKillSwitch,
    lockBulkHedge,
    readoutHinglishOrder,
    splitHubOrder,
    setDriverVehicle,
    toggleDriverDuty,
    readoutHinglishRoute,
    markDriverArrivedAtSite,
    simulateDetentionFastForward,
    markStopLoaded,
    completeGeoPhotoEscrow,
    triggerDriverSos,
    acceptReverseBuyback,
    completeReverseBuyback,
    toggleRainMode,
    adminReleaseEscrow,
    adminCreateHedgeOffer,
  };

  return (
    <FourPanelRelayContext.Provider value={value}>
      {children}
    </FourPanelRelayContext.Provider>
  );
}

export function useFourPanelRelay() {
  const context = useContext(FourPanelRelayContext);
  if (!context) {
    throw new Error("useFourPanelRelay must be used within a FourPanelRelayProvider");
  }
  return context;
}
