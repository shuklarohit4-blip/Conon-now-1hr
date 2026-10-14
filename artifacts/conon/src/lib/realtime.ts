import { io, type Socket } from "socket.io-client";

/**
 * Shared Socket.io client for CONON real-time features.
 *
 * The API server mounts Socket.io at `/api/socket.io` so the Replit path-router
 * proxies it to the API service (only `/api/*` is routed there). We therefore
 * connect to the *same origin* the app is served from — this also means no CORS
 * negotiation is needed.
 */
let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(window.location.origin, {
      path: "/api/socket.io",
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export interface IncomingVendorOrder {
  id: string;
  shortId: string;
  buyer: string;
  items: string;
  time: string;
  value: number;
  status: string;
}

/**
 * Join the vendor's private room so the server can push `new-order-received`
 * events scoped to this store. Re-emits on every (re)connect because rooms are
 * not preserved across socket reconnections.
 */
export function joinVendorRoom(token: string): () => void {
  const s = getSocket();
  const join = () => s.emit("join-vendor", token);
  if (s.connected) join();
  s.on("connect", join);
  return () => {
    s.off("connect", join);
    // Explicitly leave the room so the shared singleton socket stops receiving
    // this store's events after logout / account switch / dashboard unmount.
    if (s.connected) s.emit("leave-vendor");
  };
}

export function onNewOrder(cb: (order: IncomingVendorOrder) => void): () => void {
  const s = getSocket();
  s.on("new-order-received", cb);
  return () => {
    s.off("new-order-received", cb);
  };
}

export interface TruckUpdate {
  orderId: string;
  lat: number;
  lng: number;
  heading: number | null;
  speed: number | null;
  at: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}
