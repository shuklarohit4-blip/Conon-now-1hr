import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

/* ──────────────────────────────────────────────────────────────────────────
   Conon Fleet — Driver Partner state machine (frontend-only).

   A single source of truth for the entire driver journey:
     duty (offline ⇄ online) → dispatch → 3-step trip → paid (wallet).

   Everything is held in React state so the whole "Go Online → Accept → PoD →
   Get Paid" flow runs with zero page reloads. There is no backend; trips are
   synthesized locally to simulate a real-time dispatch system.
   ────────────────────────────────────────────────────────────────────────── */

export type DutyStatus = "online" | "offline";
export type TripStep = "pickup" | "transit" | "drop";

export interface Trip {
  id: string;
  material: string;
  qty: string;
  earn: number;
  pickup: string;
  pickupArea: string;
  drop: string;
  dropArea: string;
  distanceKm: number;
  customerOtp: string;
}

export interface PodState {
  photo: boolean;
  otp: boolean;
}

/* A small rotation of realistic loads so repeated "Test Dispatch" taps feel
   live. The first entry matches the canonical demo: 50 Bags Cement / ₹450. */
const DISPATCH_POOL: Omit<Trip, "id">[] = [
  {
    material: "UltraTech Cement",
    qty: "50 Bags",
    earn: 450,
    pickup: "Conon Depot",
    pickupArea: "Sushant Lok, Gurugram",
    drop: "Site Block 45",
    dropArea: "Sector 45, Gurugram",
    distanceKm: 8.4,
    customerOtp: "4821",
  },
  {
    material: "Tata Tiscon TMT",
    qty: "2 Ton",
    earn: 620,
    pickup: "Conon Steel Yard",
    pickupArea: "Udyog Vihar, Gurugram",
    drop: "Tower B Site",
    dropArea: "Sector 62, Noida",
    distanceKm: 14.2,
    customerOtp: "7390",
  },
  {
    material: "River Sand (Morang)",
    qty: "4 Ton",
    earn: 540,
    pickup: "Conon Aggregates",
    pickupArea: "Manesar",
    drop: "Villa Project",
    dropArea: "Sohna Road",
    distanceKm: 11.7,
    customerOtp: "1265",
  },
  {
    material: "Red Bricks (A-Grade)",
    qty: "1000 Pcs",
    earn: 380,
    pickup: "Conon Brick Hub",
    pickupArea: "Dharuhera",
    drop: "Farmhouse Site",
    dropArea: "Golf Course Ext",
    distanceKm: 9.1,
    customerOtp: "5043",
  },
];

export interface CompletedTrip extends Trip {
  completedAt: number;
}

interface DriverValue {
  /* state */
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
}

const DriverContext = createContext<DriverValue | null>(null);

const EMPTY_POD: PodState = { photo: false, otp: false };

export function DriverProvider({ children }: { children: React.ReactNode }) {
  const [dutyStatus, setDutyStatus] = useState<DutyStatus>("offline");
  const [pendingDispatch, setPendingDispatch] = useState<Trip | null>(null);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [tripStep, setTripStep] = useState<TripStep>("pickup");
  const [pod, setPod] = useState<PodState>(EMPTY_POD);
  const [walletEarnings, setWalletEarnings] = useState(0);
  const [tripsToday, setTripsToday] = useState(0);
  const [completedTrips, setCompletedTrips] = useState<CompletedTrip[]>([]);

  const dispatchIdx = useRef(0);

  const toggleDuty = useCallback(() => {
    let next: DutyStatus = "offline";
    setDutyStatus((prev) => {
      next = prev === "online" ? "offline" : "online";
      return next;
    });
    /* Leaving duty clears any unaccepted request so a stale overlay can't linger. */
    setPendingDispatch((p) => (next === "offline" ? null : p));
    return next;
  }, []);

  const requestDispatch = useCallback(() => {
    let created: Trip | null = null;
    setDutyStatus((status) => {
      if (status !== "online") return status; // ignore while offline
      setActiveTrip((trip) => {
        setPendingDispatch((pending) => {
          if (trip || pending) return pending; // already busy — don't stack requests
          const base = DISPATCH_POOL[dispatchIdx.current % DISPATCH_POOL.length];
          dispatchIdx.current += 1;
          created = { ...base, id: `trip_${Date.now()}` };
          return created;
        });
        return trip;
      });
      return status;
    });
    return created;
  }, []);

  const acceptDispatch = useCallback(() => {
    setPendingDispatch((pending) => {
      if (pending) {
        setActiveTrip(pending);
        setTripStep("pickup");
        setPod(EMPTY_POD);
      }
      return null;
    });
  }, []);

  const declineDispatch = useCallback(() => setPendingDispatch(null), []);

  const markLoaded = useCallback(() => {
    setTripStep((s) => (s === "pickup" ? "transit" : s));
  }, []);

  const markArrived = useCallback(() => {
    setTripStep((s) => (s === "transit" ? "drop" : s));
  }, []);

  const capturePhoto = useCallback(() => setPod((p) => ({ ...p, photo: true })), []);

  const verifyOtp = useCallback(
    (code: string) => {
      if (!activeTrip) return false;
      const ok = code === activeTrip.customerOtp;
      if (ok) setPod((p) => ({ ...p, otp: true }));
      return ok;
    },
    [activeTrip],
  );

  const completeTrip = useCallback(() => {
    if (!activeTrip || !pod.photo || !pod.otp) return 0;
    const earned = activeTrip.earn;
    setWalletEarnings((w) => w + earned);
    setTripsToday((n) => n + 1);
    setCompletedTrips((list) => [{ ...activeTrip, completedAt: Date.now() }, ...list]);
    setActiveTrip(null);
    setTripStep("pickup");
    setPod(EMPTY_POD);
    return earned;
  }, [activeTrip, pod.photo, pod.otp]);

  const withdraw = useCallback(() => {
    let amount = 0;
    setWalletEarnings((w) => {
      amount = w;
      return 0;
    });
    return amount;
  }, []);

  const value = useMemo<DriverValue>(
    () => ({
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
    }),
    [
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
    ],
  );

  return <DriverContext.Provider value={value}>{children}</DriverContext.Provider>;
}

export function useDriver() {
  const ctx = useContext(DriverContext);
  if (!ctx) throw new Error("useDriver must be used within a DriverProvider");
  return ctx;
}
