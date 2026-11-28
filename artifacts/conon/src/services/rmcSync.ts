import { resolveApiUrl } from "@/lib/apiBase";
import { getSocket } from "@/services/socket";

export interface RmcTransitTruck {
  tmIndex: number;
  truckRegNo?: string;
  volumeM3: number;
  status: "QUEUED" | "BATCHING" | "EN_ROUTE" | "SLUMP_VERIFIED" | "POURING" | "COMPLETED";
  batchTime?: string;
  wcRatio?: string;
  plantTempC?: number;
  batchSlipUrl?: string;
  slumpMm?: number;
  slumpPhotoUrl?: string;
}

export interface RmcCubeLabReport {
  day7Mpa?: number;
  day7ReportUrl?: string;
  day28Mpa?: number;
  day28ReportUrl?: string;
  passed?: boolean;
}

export interface RmcConvoyOrder {
  id: string;
  shortId: string;
  gradeId: string;
  gradeCode: string;
  gradeName: string;
  volumeM3: number;
  pumpId: string;
  pumpName: string;
  admixtureId?: string;
  admixtureName?: string;
  tmCount: number;
  trucks: RmcTransitTruck[];
  customerName: string;
  customerPhone: string;
  customerGstin?: string;
  siteAddress: string;
  lucknowZone: string;
  subtotalAmount: number;
  gstAmount: number;
  totalAmount: number;
  hsnCode: "38245010";
  ewayBillRequired: boolean;
  ewayBillNo?: string;
  paymentMode: "LIVING_VAULT" | "UPI";
  pourStartOtp: string;
  pourEndOtp: string;
  status: "BOOKED" | "PLANT_ACCEPTED" | "CONVOY_ACTIVE" | "COMPLETED";
  escrowStatus: "LOCKED" | "AWAITING_RELEASE" | "SETTLED";
  settledUtr?: string;
  assignedPlantName?: string;
  cubeLab: RmcCubeLabReport;
  freshnessClaimFlag?: boolean;
  createdAt: string;
}

const STORAGE_KEY = "conon_rmc_convoy_orders_v1";
const CHANNEL_NAME = "conon_rmc_sync_bus";

const listeners = new Set<() => void>();

function readOrders(): RmcConvoyOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeOrders(orders: RmcConvoyOrder[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // ignore
  }
  try {
    const ch = new BroadcastChannel(CHANNEL_NAME);
    ch.postMessage({ type: "RMC_UPDATED" });
    ch.close();
  } catch {
    // ignore
  }
  listeners.forEach((fn) => fn());
}

if (typeof window !== "undefined") {
  try {
    const ch = new BroadcastChannel(CHANNEL_NAME);
    ch.onmessage = () => listeners.forEach((fn) => fn());
  } catch {
    // ignore
  }
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) listeners.forEach((fn) => fn());
  });
}

export const rmcSync = {
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },

  async fetchConvoyOrders(): Promise<RmcConvoyOrder[]> {
    const local = readOrders();
    try {
      const res = await fetch(resolveApiUrl("/rmc/orders"));
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.orders) && data.orders.length > 0) {
          return data.orders;
        }
      }
    } catch {
      // offline fallback
    }
    return local;
  },

  async createConvoyBooking(input: {
    gradeId: string;
    gradeCode: string;
    gradeName: string;
    volumeM3: number;
    pumpId: string;
    pumpName: string;
    admixtureId?: string;
    admixtureName?: string;
    customerName: string;
    customerPhone: string;
    customerGstin?: string;
    siteAddress: string;
    lucknowZone: string;
    subtotalAmount: number;
    gstAmount: number;
    totalAmount: number;
    paymentMode: "LIVING_VAULT" | "UPI";
  }): Promise<RmcConvoyOrder> {
    const tmCount = Math.max(1, Math.ceil(input.volumeM3 / 6));
    let remaining = input.volumeM3;
    const trucks: RmcTransitTruck[] = Array.from({ length: tmCount }, (_, idx) => {
      const vol = Number(Math.min(6, remaining).toFixed(2));
      remaining = Math.max(0, Number((remaining - vol).toFixed(2)));
      return {
        tmIndex: idx + 1,
        volumeM3: vol,
        status: idx === 0 ? "BATCHING" : "QUEUED",
      };
    });

    const order: RmcConvoyOrder = {
      id: `rmc_${Date.now()}`,
      shortId: `RMC-${Math.floor(1000 + Math.random() * 8999)}`,
      ...input,
      tmCount,
      trucks,
      hsnCode: "38245010",
      ewayBillRequired: input.totalAmount >= 50000,
      pourStartOtp: String(Math.floor(1000 + Math.random() * 8999)),
      pourEndOtp: String(Math.floor(1000 + Math.random() * 8999)),
      status: "BOOKED",
      escrowStatus: "LOCKED",
      cubeLab: {},
      createdAt: new Date().toISOString(),
    };

    const next = [order, ...readOrders()];
    writeOrders(next);

    try {
      await fetch(resolveApiUrl("/rmc/orders"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      getSocket()?.emit("rmc:convoy_updated", order);
    } catch {
      // offline safe
    }

    return order;
  },

  async dispatchTransitTruck(
    orderId: string,
    tmIndex: number,
    payload: {
      truckRegNo?: string;
      wcRatio?: string;
      plantTempC?: number;
      ewayBillNo?: string;
      batchSlipUrl?: string;
    }
  ) {
    const orders = readOrders();
    const updated = orders.map((o) => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        status: "CONVOY_ACTIVE" as const,
        ewayBillNo: payload.ewayBillNo || o.ewayBillNo,
        trucks: o.trucks.map((t) =>
          t.tmIndex === tmIndex
            ? {
                ...t,
                ...payload,
                batchTime: new Date().toISOString(),
                status: "EN_ROUTE" as const,
              }
            : t
        ),
      };
    });
    writeOrders(updated);
  },

  async submitSlumpCheckin(
    orderId: string,
    tmIndex: number,
    slumpMm: number,
    slumpPhotoUrl = "slump-verified-site.webp"
  ) {
    const orders = readOrders();
    const updated = orders.map((o) => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        trucks: o.trucks.map((t) =>
          t.tmIndex === tmIndex
            ? { ...t, slumpMm, slumpPhotoUrl, status: "POURING" as const }
            : t
        ),
      };
    });
    writeOrders(updated);
  },

  async uploadCubeLabReport(
    orderId: string,
    report: { day7Mpa?: number; day28Mpa?: number; targetMpa: number }
  ) {
    const orders = readOrders();
    const updated = orders.map((o) => {
      if (o.id !== orderId) return o;
      const day7 = report.day7Mpa ?? o.cubeLab.day7Mpa;
      const day28 = report.day28Mpa ?? o.cubeLab.day28Mpa;
      return {
        ...o,
        cubeLab: {
          ...o.cubeLab,
          day7Mpa: day7,
          day28Mpa: day28,
          passed: day28 !== undefined ? day28 >= report.targetMpa : o.cubeLab.passed,
        },
      };
    });
    writeOrders(updated);
  },

  async markFreshnessClaim(orderId: string) {
    const orders = readOrders();
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, freshnessClaimFlag: true, escrowStatus: "LOCKED" as const } : o
    );
    writeOrders(updated);
  },
};
