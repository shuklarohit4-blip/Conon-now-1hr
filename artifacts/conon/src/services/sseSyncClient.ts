import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/apiBase";

export type SseConnectionStatus = "CONNECTING" | "CONNECTED" | "RECONNECTING";

export type SseSyncEventType =
  | "CATEGORIES_UPDATED"
  | "CATALOG_UPDATED"
  | "SETTINGS_UPDATED"
  | "BANNERS_UPDATED"
  | "MERCHANDISING_UPDATED"
  | "SEARCH_UPDATED"
  | "ORDERS_UPDATED"
  | "PARTNERS_UPDATED"
  | "FORCE_SYNC";

export interface SseSyncMessage {
  type: SseSyncEventType | string;
  entityId?: string | null;
  summary?: string;
  timestamp: number;
  isoTimestamp?: string;
}

type Listener = (msg: SseSyncMessage) => void;
type StatusListener = (status: SseConnectionStatus) => void;

const listeners = new Set<Listener>();
const statusListeners = new Set<StatusListener>();

let source: EventSource | null = null;
let currentStatus: SseConnectionStatus = "CONNECTING";
let reconnectTimer: number | null = null;
let reconnectAttempt = 0;
let initialized = false;

function setStatus(next: SseConnectionStatus) {
  currentStatus = next;
  for (const fn of statusListeners) fn(next);
}

function dispatchMessage(msg: SseSyncMessage) {
  for (const fn of listeners) {
    try {
      fn(msg);
    } catch {
      // Isolate listener errors
    }
  }
}

function scheduleReconnect() {
  if (typeof window === "undefined") return;
  if (reconnectTimer !== null) return;
  const delay = Math.min(1500 * Math.pow(1.5, reconnectAttempt), 12000);
  reconnectAttempt++;
  setStatus("RECONNECTING");
  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    connectEventSource();
  }, delay);
}

function connectEventSource() {
  if (typeof window === "undefined" || typeof EventSource === "undefined") return;
  try {
    source?.close();
  } catch {}

  const role = window.location.pathname.startsWith("/admin")
    ? "ADMIN"
    : window.location.pathname.startsWith("/vendor")
    ? "VENDOR"
    : window.location.pathname.startsWith("/driver")
    ? "DRIVER"
    : "CUSTOMER";

  const streamUrl = apiUrl(`/api/events/stream?role=${role}`);
  try {
    const es = new EventSource(streamUrl);
    source = es;

    es.onopen = () => {
      reconnectAttempt = 0;
      setStatus("CONNECTED");
    };

    const handlePayload = (rawEvent: MessageEvent, fallbackType = "FORCE_SYNC") => {
      try {
        const parsed = JSON.parse(rawEvent.data || "{}");
        dispatchMessage({
          type: parsed.type || fallbackType,
          entityId: parsed.entityId,
          summary: parsed.summary,
          timestamp: parsed.timestamp || Date.now(),
          isoTimestamp: parsed.isoTimestamp,
        });
      } catch {
        dispatchMessage({ type: fallbackType, timestamp: Date.now() });
      }
    };

    es.addEventListener("connected", () => {
      reconnectAttempt = 0;
      setStatus("CONNECTED");
    });
    es.addEventListener("sync", (e) => handlePayload(e as MessageEvent));
    es.addEventListener("CATEGORIES_UPDATED", (e) => handlePayload(e as MessageEvent, "CATEGORIES_UPDATED"));
    es.addEventListener("CATALOG_UPDATED", (e) => handlePayload(e as MessageEvent, "CATALOG_UPDATED"));
    es.addEventListener("SETTINGS_UPDATED", (e) => handlePayload(e as MessageEvent, "SETTINGS_UPDATED"));
    es.addEventListener("BANNERS_UPDATED", (e) => handlePayload(e as MessageEvent, "BANNERS_UPDATED"));
    es.addEventListener("MERCHANDISING_UPDATED", (e) => handlePayload(e as MessageEvent, "MERCHANDISING_UPDATED"));
    es.addEventListener("SEARCH_UPDATED", (e) => handlePayload(e as MessageEvent, "SEARCH_UPDATED"));
    es.addEventListener("ORDERS_UPDATED", (e) => handlePayload(e as MessageEvent, "ORDERS_UPDATED"));
    es.addEventListener("PARTNERS_UPDATED", (e) => handlePayload(e as MessageEvent, "PARTNERS_UPDATED"));
    es.addEventListener("FORCE_SYNC", (e) => handlePayload(e as MessageEvent, "FORCE_SYNC"));
    es.addEventListener("order_created", (e) => handlePayload(e as MessageEvent, "ORDERS_UPDATED"));
    es.addEventListener("order_updated", (e) => handlePayload(e as MessageEvent, "ORDERS_UPDATED"));

    es.onerror = () => {
      try {
        es.close();
      } catch {}
      source = null;
      scheduleReconnect();
    };
  } catch {
    scheduleReconnect();
  }
}

export function ensureSseSyncClientStarted() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  connectEventSource();

  window.addEventListener("online", () => {
    connectEventSource();
    dispatchMessage({ type: "FORCE_SYNC", summary: "Network restored", timestamp: Date.now() });
  });
  window.addEventListener("focus", () => {
    if (!source || source.readyState === EventSource.CLOSED) {
      connectEventSource();
    }
  });
}

export function subscribeSseSync(listener: Listener): () => void {
  ensureSseSyncClientStarted();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSseSyncStatus(): SseConnectionStatus {
  const [status, setLocalStatus] = useState<SseConnectionStatus>(currentStatus);
  useEffect(() => {
    ensureSseSyncClientStarted();
    setLocalStatus(currentStatus);
    statusListeners.add(setLocalStatus);
    return () => {
      statusListeners.delete(setLocalStatus);
    };
  }, []);
  return status;
}
