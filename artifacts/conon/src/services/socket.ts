import { io, Socket } from "socket.io-client";
import { API_ORIGIN, apiUrl } from "@/lib/apiBase";
import React, { useState, useEffect } from "react";

let socketInstance: Socket | null = null;

export interface BasementQueuedAction {
  id: string;
  orderId: string;
  driverId: string;
  otp: string;
  photoUrl: string;
  tarpaulinPhotoUrl?: string;
  tarpaulinPhotoVerified?: boolean;
  gpsDistanceMeters?: number;
  gpsMatchPercent?: number;
  lat?: number;
  lng?: number;
  timestamp: number;
}

const BASEMENT_QUEUE_KEY = "conon_basement_queue";

export function getBasementQueue(): BasementQueuedAction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BASEMENT_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function enqueueBasementAction(action: BasementQueuedAction): void {
  if (typeof window === "undefined") return;
  try {
    const current = getBasementQueue();
    current.push(action);
    localStorage.setItem(BASEMENT_QUEUE_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }
}

export function clearBasementQueue(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(BASEMENT_QUEUE_KEY);
  } catch {
    // ignore
  }
}

export async function flushBasementQueue(
  onSuccess?: (flushed: BasementQueuedAction[]) => void
): Promise<BasementQueuedAction[]> {
  const queue = getBasementQueue();
  if (queue.length === 0) return [];

  const successfullyFlushed: BasementQueuedAction[] = [];
  const remainingQueue: BasementQueuedAction[] = [];

  for (const item of queue) {
    try {
      const res = await fetch(apiUrl(`/api/driver/orders/${item.orderId}/complete-escrow`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        successfullyFlushed.push(item);
      } else {
        remainingQueue.push(item);
      }
    } catch {
      remainingQueue.push(item);
    }
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(BASEMENT_QUEUE_KEY, JSON.stringify(remainingQueue));
    } catch {}
  }

  if (successfullyFlushed.length > 0 && onSuccess) {
    onSuccess(successfullyFlushed);
  }

  return successfullyFlushed;
}

export function getSocket(): Socket {
  if (socketInstance) return socketInstance;

  const hasExplicitBackend = Boolean(
    import.meta.env.VITE_API_URL?.trim() || import.meta.env.VITE_API_BASE_URL?.trim()
  );
  const isStaticNetlifyWithoutBackend =
    typeof window !== "undefined" &&
    !hasExplicitBackend &&
    window.location.hostname.endsWith(".netlify.app");

  socketInstance = io(API_ORIGIN, {
    path: "/api/socket.io",
    transports: ["websocket", "polling"],
    reconnection: !isStaticNetlifyWithoutBackend,
    reconnectionAttempts: isStaticNetlifyWithoutBackend ? 0 : Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
    withCredentials: true,
    autoConnect: !isStaticNetlifyWithoutBackend,
  });

  socketInstance.on("connect", () => {
    // Auto-flush basement queue whenever socket comes online
    void flushBasementQueue();
  });

  if (typeof window !== "undefined") {
    window.addEventListener("online", () => {
      if (socketInstance && !socketInstance.connected) {
        socketInstance.connect();
      }
      void flushBasementQueue();
    });
  }

  return socketInstance;
}

export function joinAdminRoom(adminKey?: string, token?: string): void {
  const s = getSocket();
  const key = adminKey || (import.meta.env.VITE_MAC_ADMIN_KEY as string) || "";
  if (!key && !token) return;
  s.emit("join:admin", { adminKey: key, token });
}

export function joinVendorRoom(hubId?: string, store?: string): void {
  const s = getSocket();
  s.emit("join:vendor", { hubId: hubId || "hub-naka", store });
}

export function joinDriverRoom(driverId?: string): void {
  const s = getSocket();
  s.emit("join:driver", { driverId: driverId || "DRV-LKO-CH-01" });
}

export function joinOrderRoom(orderId: string): void {
  const s = getSocket();
  s.emit("join:order", { orderId });
  s.emit("track-order", orderId);
}

export function joinApplicantRoom(applicantId: string): void {
  const s = getSocket();
  s.emit("join:applicant", applicantId);
}

export function useSocketStatus(): { isConnected: boolean; queueCount: number } {
  const [isConnected, setIsConnected] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return Boolean(socketInstance?.connected);
  });
  const [queueCount, setQueueCount] = useState<number>(() => getBasementQueue().length);

  useEffect(() => {
    const s = getSocket();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    if (s.connected) {
      setIsConnected(true);
    }

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);

    const checkQueue = () => {
      setQueueCount(getBasementQueue().length);
    };

    window.addEventListener("storage", checkQueue);
    const interval = setInterval(checkQueue, 3000);

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      window.removeEventListener("storage", checkQueue);
      clearInterval(interval);
    };
  }, []);

  return { isConnected, queueCount };
}

export function SocketStatusPill({ className = "" }: { className?: string }): React.ReactElement {
  const { isConnected, queueCount } = useSocketStatus();

  if (isConnected) {
    return React.createElement(
      "span",
      {
        title: "Live WebSocket Relay connected to Lucknow Real-Time Bus",
        className: `inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.2)] ${className}`,
      },
      React.createElement("span", { className: "w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" }),
      "Live Relay"
    );
  }

  return React.createElement(
    "span",
    {
      title:
        queueCount > 0
          ? `Local Fallback Active • ${queueCount} action(s) stored in Basement Queue`
          : "Local Fallback Active • Auto-reconnecting to server",
      className: `inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.2)] ${className}`,
    },
    React.createElement("span", { className: "w-1.5 h-1.5 rounded-full bg-amber-400" }),
    queueCount > 0 ? `Basement (${queueCount} Q)` : "Local Fallback"
  );
}
