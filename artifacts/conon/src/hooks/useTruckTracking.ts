import { useEffect, useRef, useState } from "react";
import { getSocket, type LatLng, type TruckUpdate } from "@/lib/realtime";

/* ── geo helpers ─────────────────────────────────────────────── */
const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

/** Initial bearing (degrees, 0–360 clockwise from north) from `a` to `b`. */
export function computeBearing(a: LatLng, b: LatLng): number {
  const φ1 = toRad(a.lat);
  const φ2 = toRad(b.lat);
  const Δλ = toRad(b.lng - a.lng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Great-circle distance in metres between two points. */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const φ1 = toRad(a.lat);
  const φ2 = toRad(b.lat);
  const Δφ = toRad(b.lat - a.lat);
  const Δλ = toRad(b.lng - a.lng);
  const h =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

const easeInOutQuad = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;

interface Tween {
  start: LatLng;
  end: LatLng;
  startedAt: number;
  duration: number;
}

export interface TruckTrackingState {
  /** Smoothly interpolated position used for rendering the marker. */
  position: LatLng | null;
  /** Latest raw coordinate received from the socket (no interpolation). */
  target: LatLng | null;
  /** Continuous (unwrapped) bearing in degrees — safe for CSS rotation. */
  bearing: number;
  speed: number | null;
  connected: boolean;
  lastUpdateAt: number | null;
}

/**
 * Subscribe to live truck GPS for an order and expose a smoothly animated
 * position plus a travel bearing.
 *
 * - Joins the order's room (`track-order`) and listens for `live-truck-tracking`.
 * - Tweens the marker between consecutive coordinates with requestAnimationFrame
 *   so it glides instead of jumping.
 * - Derives a bearing (from the server `heading` when present, else from the
 *   movement vector) and unwraps it so the icon rotates the short way around.
 */
export function useTruckTracking(orderId: string): TruckTrackingState {
  const [position, setPosition] = useState<LatLng | null>(null);
  const [target, setTarget] = useState<LatLng | null>(null);
  const [bearing, setBearing] = useState(0);
  const [speed, setSpeed] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdateAt, setLastUpdateAt] = useState<number | null>(null);

  // Mutable animation state (kept in refs so the rAF loop sees fresh values).
  const displayedRef = useRef<LatLng | null>(null);
  const tweenRef = useRef<Tween | null>(null);
  const prevTargetRef = useRef<LatLng | null>(null);
  const bearingContRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Continuous rAF loop: advances the active tween toward the latest target.
  useEffect(() => {
    const frame = (now: number) => {
      const tw = tweenRef.current;
      if (tw) {
        const t = Math.min(1, (now - tw.startedAt) / tw.duration);
        const e = easeInOutQuad(t);
        const next = {
          lat: tw.start.lat + (tw.end.lat - tw.start.lat) * e,
          lng: tw.start.lng + (tw.end.lng - tw.start.lng) * e,
        };
        displayedRef.current = next;
        setPosition(next);
        if (t >= 1) tweenRef.current = null;
      }
      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();

    const join = () => {
      setConnected(true);
      socket.emit("track-order", orderId);
    };

    const handleUpdate = (u: TruckUpdate) => {
      if (!u || u.orderId !== orderId) return;
      if (typeof u.lat !== "number" || typeof u.lng !== "number") return;

      const incoming: LatLng = { lat: u.lat, lng: u.lng };
      setTarget(incoming);
      setSpeed(typeof u.speed === "number" ? u.speed : null);
      setLastUpdateAt(Date.now());

      const prev = prevTargetRef.current;

      // Bearing: prefer the server-reported heading, else derive from movement.
      let rawBearing = bearingContRef.current % 360;
      if (typeof u.heading === "number") {
        rawBearing = u.heading;
      } else if (prev && distanceMeters(prev, incoming) > 0.5) {
        rawBearing = computeBearing(prev, incoming);
      }
      // Unwrap so the marker always rotates the shortest way (no 359°→1° spin).
      const cont = bearingContRef.current;
      const diff = (((rawBearing - (cont % 360)) % 360) + 540) % 360 - 180;
      bearingContRef.current = cont + diff;
      setBearing(bearingContRef.current);

      if (!displayedRef.current) {
        displayedRef.current = incoming;
        setPosition(incoming);
      } else {
        tweenRef.current = {
          start: displayedRef.current,
          end: incoming,
          startedAt: performance.now(),
          duration: 1200,
        };
      }
      prevTargetRef.current = incoming;
    };

    const onDisconnect = () => setConnected(false);

    socket.on("connect", join);
    socket.on("disconnect", onDisconnect);
    socket.on("live-truck-tracking", handleUpdate);
    if (socket.connected) join();

    return () => {
      socket.emit("untrack-order", orderId);
      socket.off("connect", join);
      socket.off("disconnect", onDisconnect);
      socket.off("live-truck-tracking", handleUpdate);
    };
  }, [orderId]);

  return { position, target, bearing, speed, connected, lastUpdateAt };
}
