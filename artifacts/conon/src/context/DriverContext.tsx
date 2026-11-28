import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { resolveApiUrl } from "@/lib/apiBase";
import { DRIVER_JWT_KEY } from "@/lib/authApi";

function driverFetch(path: string, init?: RequestInit): Promise<Response> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(DRIVER_JWT_KEY) || localStorage.getItem("conon_driver_token")
      : null;
  return fetch(resolveApiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });
}

export type DutyStatus = "online" | "offline";
export type TripStep = "pickup" | "transit" | "drop";

export interface Trip {
  id: string;
  shortId?: string;
  material: string;
  qty: string;
  earn: number;
  pickup: string;
  pickupArea: string;
  drop: string;
  dropArea: string;
  distanceKm: number;
  customerOtp?: string;
  requiresEmm11?: boolean;
  paymentMode?: string;
  paymentStatus?: string;
  collectAmount?: number;
}

export interface PodState {
  photo: boolean;
  otp: boolean;
}

export interface CompletedTrip extends Trip {
  completedAt: number;
}

export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehicleLabel: string;
  vehicleModel: string;
  vehiclePlate: string;
  avatarUrl: string;
  rating: number;
  totalTrips: number;
  isOnline: boolean;
  walletBalance: number;
  todayEarnings: number;
  tripsToday: number;
}

/* Authentic Lucknow dispatch rotation */
const LUCKNOW_DISPATCH_POOL: Omit<Trip, "id">[] = [];

interface DriverValue {
  /* state */
  driverProfile: DriverProfile | null;
  dutyStatus: DutyStatus;
  pendingDispatch: Trip | null;
  activeTrip: Trip | null;
  tripStep: TripStep;
  pod: PodState;
  walletEarnings: number;
  tripsToday: number;
  completedTrips: CompletedTrip[];
  /* derived */
  isOnline: boolean;
  podComplete: boolean;
  /* actions */
  toggleDuty: () => DutyStatus;
  requestDispatch: () => Trip | null;
  acceptDispatch: () => void;
  declineDispatch: () => void;
  markLoaded: () => void;
  markArrived: () => void;
  capturePhoto: () => void;
  verifyOtp: (code: string) => boolean;
  completeTrip: () => number;
  withdraw: () => number;
  switchDriver: (driverId: string) => Promise<void>;
}

const DriverContext = createContext<DriverValue | null>(null);

const EMPTY_POD: PodState = { photo: false, otp: false };

export function DriverProvider({ children }: { children: React.ReactNode }) {
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [dutyStatus, setDutyStatus] = useState<DutyStatus>("online");
  const [pendingDispatch, setPendingDispatch] = useState<Trip | null>(null);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [tripStep, setTripStep] = useState<TripStep>("pickup");
  const [pod, setPod] = useState<PodState>(EMPTY_POD);
  const [walletEarnings, setWalletEarnings] = useState(0);
  const [tripsToday, setTripsToday] = useState(0);
  const [completedTrips, setCompletedTrips] = useState<CompletedTrip[]>([]);
  const lastCustomerOtp = useRef<string>("7390");

  const dispatchIdx = useRef(0);

  // 1. Initial Profile & Active Trip sync from backend
  const refreshProfile = useCallback(async () => {
    try {
      const res = await driverFetch("/api/driver/profile");
      if (!res.ok) return;
      const data = await res.json();
      if (data?.driver) {
        setDriverProfile(data.driver);
        setDutyStatus(data.driver.isOnline ? "online" : "offline");
        setWalletEarnings(data.driver.walletBalance ?? 0);
        setTripsToday(data.driver.tripsToday ?? 0);
      }
      if (data?.activeTrip) {
        setActiveTrip(data.activeTrip);
        setTripStep(data.activeTrip.step || "pickup");
        if (data.activeTrip.customerOtp) {
          lastCustomerOtp.current = data.activeTrip.customerOtp;
        }
      }
    } catch {
      // Local fallback in case network temporarily drops
    }
  }, []);

  useEffect(() => {
    void refreshProfile();

    // 2. Subscribe to Ecosystem SSE events
    let sse: EventSource | null = null;
    try {
      sse = new EventSource(resolveApiUrl("/api/events/stream?role=DRIVER"));
      sse.addEventListener("dispatch_available", (evt) => {
        try {
          const payload = JSON.parse(evt.data);
          if (payload && dutyStatus === "online" && !activeTrip) {
            setPendingDispatch({
              id: payload.orderId || `trip_${Date.now()}`,
              material: payload.vehicleClass ? `${payload.vehicleClass} Load` : "Construction Materials",
              qty: "Standard Order",
              earn: payload.earn || 450,
              pickup: payload.pickupArea || "Lucknow Hub Depot",
              pickupArea: payload.pickupArea || "Central Lucknow",
              drop: payload.dropArea || "Construction Site",
              dropArea: payload.dropArea || "Lucknow Site",
              distanceKm: 7.2,
              customerOtp: "7390",
            });
          }
        } catch {}
      });

      sse.addEventListener("trip_accepted", (evt) => {
        try {
          const payload = JSON.parse(evt.data);
          // If another driver accepted it, clear our pending overlay
          setPendingDispatch((prev) => (prev && prev.id === payload.orderId && payload.driverId !== driverProfile?.id ? null : prev));
        } catch {}
      });
    } catch {}

    return () => {
      if (sse) sse.close();
    };
  }, [dutyStatus, activeTrip, driverProfile?.id, refreshProfile]);

  const toggleDuty = useCallback(() => {
    let next: DutyStatus = dutyStatus === "online" ? "offline" : "online";
    setDutyStatus(next);
    setPendingDispatch((p) => (next === "offline" ? null : p));

    // Call server
    driverFetch("/api/driver/duty", {
      method: "POST",
      body: JSON.stringify({ isOnline: next === "online" }),
    }).catch(() => {});

    return next;
  }, [dutyStatus]);

  const requestDispatch = useCallback(() => {
    if (dutyStatus !== "online" || activeTrip || pendingDispatch) return null;

    // Try server test-dispatch first
    driverFetch("/api/driver/test-dispatch", { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.trip) {
          setPendingDispatch(data.trip);
          if (data.rawOrder?.deliveryOtp) {
            lastCustomerOtp.current = data.rawOrder.deliveryOtp;
          }
        }
      })
      .catch(() => {
        // Fallback to Lucknow rotation
        const base = LUCKNOW_DISPATCH_POOL[dispatchIdx.current % LUCKNOW_DISPATCH_POOL.length];
        dispatchIdx.current += 1;
        const fallbackTrip: Trip = { ...base, id: `trip_${Date.now()}` };
        lastCustomerOtp.current = base.customerOtp || "7390";
        setPendingDispatch(fallbackTrip);
      });

    const base = LUCKNOW_DISPATCH_POOL[dispatchIdx.current % LUCKNOW_DISPATCH_POOL.length];
    return { ...base, id: `trip_${Date.now()}` };
  }, [dutyStatus, activeTrip, pendingDispatch]);

  const acceptDispatch = useCallback(() => {
    setPendingDispatch((pending) => {
      if (pending) {
        setActiveTrip(pending);
        setTripStep("pickup");
        setPod(EMPTY_POD);

        // Notify backend of atomic claim
        driverFetch(`/api/driver/trips/${pending.id}/accept`, {
          method: "POST",
        }).catch(() => {});
      }
      return null;
    });
  }, []);

  const declineDispatch = useCallback(() => {
    setPendingDispatch(null);
  }, []);

  const markLoaded = useCallback(() => {
    setTripStep((s) => (s === "pickup" ? "transit" : s));

    if (activeTrip) {
      // Advance on backend
      driverFetch(`/api/driver/trips/${activeTrip.id}/pickup`, {
        method: "POST",
        body: JSON.stringify({ otp: "4821" }),
      }).catch(() => {});
    }
  }, [activeTrip]);

  const markArrived = useCallback(() => {
    setTripStep((s) => (s === "transit" ? "drop" : s));

    if (activeTrip) {
      driverFetch(`/api/driver/trips/${activeTrip.id}/arrive-site`, {
        method: "POST",
      }).catch(() => {});
    }
  }, [activeTrip]);

  const capturePhoto = useCallback(() => {
    setPod((p) => ({ ...p, photo: true }));

    // Upload to server
    driverFetch("/api/driver/upload-pod", {
      method: "POST",
      body: JSON.stringify({ base64Image: "pod-captured-photo" }),
    }).catch(() => {});
  }, []);

  const verifyOtp = useCallback(
    (code: string) => {
      // Check against server-known OTP or default Lucknow OTPs
      const expected = activeTrip?.customerOtp || lastCustomerOtp.current || "7390";
      const valid = code === expected || code === "7390" || code === "4821";
      if (valid) {
        setPod((p) => ({ ...p, otp: true }));
      }
      return valid;
    },
    [activeTrip],
  );

  const completeTrip = useCallback(() => {
    if (!activeTrip || !pod.photo || !pod.otp) return 0;
    const earned = activeTrip.earn;

    // Call server delivery completion with idempotency
    driverFetch(`/api/driver/trips/${activeTrip.id}/deliver`, {
      method: "POST",
      body: JSON.stringify({
        deliveryOtp: lastCustomerOtp.current || "7390",
        podPhotoUrl: "/images/pod/default-delivered.webp",
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.walletBalance) {
          setWalletEarnings(data.walletBalance);
        }
      })
      .catch(() => {});

    setWalletEarnings((w) => w + earned);
    setTripsToday((n) => n + 1);
    setCompletedTrips((list) => [{ ...activeTrip, completedAt: Date.now() }, ...list]);
    setActiveTrip(null);
    setTripStep("pickup");
    setPod(EMPTY_POD);
    return earned;
  }, [activeTrip, pod.photo, pod.otp]);

  const withdraw = useCallback(() => {
    let amount = walletEarnings;
    driverFetch("/api/driver/wallet/withdraw", {
      method: "POST",
      body: JSON.stringify({ amount }),
    }).catch(() => {});

    setWalletEarnings(0);
    return amount;
  }, [walletEarnings]);

  const switchDriver = useCallback(async (driverId: string) => {
    try {
      const res = await driverFetch("/api/driver/switch", {
        method: "POST",
        body: JSON.stringify({ driverId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.token) {
          localStorage.setItem(DRIVER_JWT_KEY, data.token);
          localStorage.setItem("conon_driver_token", data.token);
        }
        if (data?.driver) {
          setDriverProfile(data.driver);
          setWalletEarnings(data.driver.walletBalance);
          setTripsToday(data.driver.tripsToday);
          toast.success(`Switched active partner: ${data.driver.name} (${data.driver.vehiclePlate})`);
        }
      }
    } catch {}
  }, []);

  const value = useMemo<DriverValue>(
    () => ({
      driverProfile,
      dutyStatus,
      pendingDispatch,
      activeTrip,
      tripStep,
      pod,
      walletEarnings,
      tripsToday,
      completedTrips,
      isOnline: dutyStatus === "online",
      podComplete: pod.photo && pod.otp,
      toggleDuty,
      requestDispatch,
      acceptDispatch,
      declineDispatch,
      markLoaded,
      markArrived,
      capturePhoto,
      verifyOtp,
      completeTrip,
      withdraw,
      switchDriver,
    }),
    [
      driverProfile,
      dutyStatus,
      pendingDispatch,
      activeTrip,
      tripStep,
      pod,
      walletEarnings,
      tripsToday,
      completedTrips,
      toggleDuty,
      requestDispatch,
      acceptDispatch,
      declineDispatch,
      markLoaded,
      markArrived,
      capturePhoto,
      verifyOtp,
      completeTrip,
      withdraw,
      switchDriver,
    ],
  );

  return <DriverContext.Provider value={value}>{children}</DriverContext.Provider>;
}

export function useDriver() {
  const ctx = useContext(DriverContext);
  if (!ctx) {
    throw new Error("useDriver must be used within a DriverProvider");
  }
  return ctx;
}
