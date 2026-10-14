import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  GoogleMap,
  Marker,
  OverlayView,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";
import { Link } from "wouter";
import {
  ChevronLeft, Phone, MapPin, Star, Navigation,
  CheckCircle2, Package, Truck, Radio, AlertTriangle, Play, Square,
} from "lucide-react";
import { useTruckTracking, distanceMeters } from "@/hooks/useTruckTracking";
import { startDriverSimulation, type DriverSimulator } from "@/lib/driverSimulator";
import { fetchDirections } from "@/lib/mapsApi";
import type { LatLng } from "@/lib/realtime";

const GREEN = "#2a7a3b";
const GREEN_DARK = "#1a6b30";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

export interface TrackedOrder {
  id: string;
  vendorName: string;
  origin: LatLng & { label: string };
  destination: LatLng & { label: string };
  driver: { name: string; truckNumber: string; phone: string; rating: number; trips: string };
}

/* ── stepper ─────────────────────────────────────────────────── */
const STEPS = ["Order Placed", "Loaded", "On the Way", "Reached"] as const;
type StepIndex = 0 | 1 | 2 | 3;

/* ── map look & feel: a clean, POI-free professional canvas ───── */
const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "labels", stylers: [{ visibility: "simplified" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#cfe3ee" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f3f5f0" }] },
];

const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  clickableIcons: false,
  gestureHandling: "greedy",
  styles: MAP_STYLES,
  backgroundColor: "#eef2ea",
};

/* SVG pin factory for origin / destination markers. */
function pinIcon(glyph: "warehouse" | "site"): google.maps.Icon | undefined {
  if (typeof google === "undefined") return undefined;
  const color = glyph === "warehouse" ? "#1d4ed8" : GREEN;
  const inner =
    glyph === "warehouse"
      ? `<path d="M11 19v-6h4v6M9 19v-8l5-3 5 3v8" fill="none" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/>`
      : `<circle cx="14" cy="11" r="2.4" fill="#fff"/><path d="M14 7v8" stroke="#fff" stroke-width="1.6"/>`;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 28 34">
      <path d="M14 0C6.8 0 1 5.8 1 13c0 9 13 21 13 21s13-12 13-21C27 5.8 21.2 0 14 0z"
            fill="${color}" stroke="#fff" stroke-width="2"/>
      ${inner}
    </svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(40, 48),
    anchor: new google.maps.Point(20, 46),
  };
}

/* ── truck overlay (rotates to travel bearing) ───────────────── */
function TruckMarker({ position, bearing }: { position: LatLng; bearing: number }) {
  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={(w, h) => ({ x: -w / 2, y: -h / 2 })}
    >
      <div style={{ width: 54, height: 54, position: "relative" }}>
        {/* pulsing accuracy ring */}
        <span
          style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: "rgba(42,122,59,0.18)",
            animation: "conon-pulse 1.8s ease-out infinite",
          }}
        />
        {/* rotating truck */}
        <div
          style={{
            position: "absolute", inset: 0, display: "flex",
            alignItems: "center", justifyContent: "center",
            transform: `rotate(${bearing}deg)`,
            transition: "transform 0.6s ease-out",
            filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.35))",
          }}
        >
          <svg width="34" height="34" viewBox="0 0 44 44">
            <rect x="14" y="11" width="16" height="25" rx="3.5" fill={GREEN_DARK} />
            <rect x="15.5" y="4" width="13" height="10" rx="3" fill={GREEN} />
            <rect x="17.5" y="5.5" width="9" height="4.5" rx="1.5" fill="#cfe9d6" />
            <rect x="10.5" y="15" width="3.5" height="7" rx="1.75" fill="#1f2937" />
            <rect x="30" y="15" width="3.5" height="7" rx="1.75" fill="#1f2937" />
            <rect x="10.5" y="26" width="3.5" height="7" rx="1.75" fill="#1f2937" />
            <rect x="30" y="26" width="3.5" height="7" rx="1.75" fill="#1f2937" />
          </svg>
        </div>
      </div>
    </OverlayView>
  );
}

/* ── progress stepper ────────────────────────────────────────── */
function Stepper({ current }: { current: StepIndex }) {
  return (
    <div className="flex items-center justify-between px-1">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex-1 flex flex-col items-center relative">
            {i > 0 && (
              <div
                className="absolute top-3 right-1/2 h-0.5 w-full"
                style={{ background: i <= current ? GREEN : "#e5e7eb" }}
              />
            )}
            <div
              className="relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
              style={{
                background: done || active ? GREEN : "#e5e7eb",
                color: done || active ? "#fff" : "#9ca3af",
                boxShadow: active ? "0 0 0 4px rgba(42,122,59,0.18)" : "none",
              }}
            >
              {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span
              className="mt-1.5 text-[9px] font-bold text-center leading-tight"
              style={{ color: done || active ? GREEN_DARK : "#9ca3af" }}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── main component ──────────────────────────────────────────── */
export function LiveOrderTracking({ order }: { order: TrackedOrder }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "conon-google-maps",
    googleMapsApiKey: API_KEY ?? "",
  });

  const { position, target, bearing, connected, lastUpdateAt } = useTruckTracking(order.id);

  const [routePath, setRoutePath] = useState<LatLng[]>([]);
  const [eta, setEta] = useState<{ text: string; mins: number } | null>(null);
  const [distRemaining, setDistRemaining] = useState<string | null>(null);
  const [simRunning, setSimRunning] = useState(false);

  const mapRef = useRef<google.maps.Map | null>(null);
  const simRef = useRef<DriverSimulator | null>(null);
  const lastEtaCallRef = useRef(0);

  // Truck position falls back to the warehouse until the first GPS ping.
  const truckPos = position ?? order.origin;
  const truckTarget = target ?? order.origin;

  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(order.origin);
      bounds.extend(order.destination);
      map.fitBounds(bounds, 80);
    },
    [order.origin, order.destination],
  );

  // Fetch the precise driving route from the secure server-side Directions
  // proxy. The Google Maps key stays on the server — never in the browser.
  useEffect(() => {
    let cancelled = false;
    fetchDirections(order.origin, order.destination)
      .then((res) => {
        if (cancelled) return;
        setRoutePath(res.path.length ? res.path : [order.origin, order.destination]);
      })
      .catch(() => {
        // Fall back to a straight segment if Directions is unavailable.
        if (!cancelled) setRoutePath([order.origin, order.destination]);
      });
    return () => {
      cancelled = true;
    };
  }, [order.origin, order.destination]);

  // Live ETA + distance remaining via the Distance Matrix API (throttled).
  useEffect(() => {
    if (!isLoaded || !target) return;
    const now = Date.now();
    if (now - lastEtaCallRef.current < 3000) return;
    lastEtaCallRef.current = now;

    const svc = new google.maps.DistanceMatrixService();
    svc.getDistanceMatrix(
      {
        origins: [truckTarget],
        destinations: [order.destination],
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (res, status) => {
        const el = res?.rows?.[0]?.elements?.[0];
        if (status === "OK" && el && el.status === "OK") {
          setEta({ text: el.duration.text, mins: Math.round(el.duration.value / 60) });
          setDistRemaining(el.distance.text);
        }
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, target]);

  // Keep the truck comfortably in view as it moves.
  useEffect(() => {
    if (mapRef.current && position) mapRef.current.panTo(position);
  }, [position]);

  // Derive the stepper stage from proximity (server sends coords, not status).
  const step: StepIndex = useMemo(() => {
    if (!target) return 0; // not moving yet → Order Placed
    const toDest = distanceMeters(truckTarget, order.destination);
    const toOrigin = distanceMeters(truckTarget, order.origin);
    if (toDest < 120) return 3; // Reached
    if (toOrigin < 250) return 1; // Loaded (still at warehouse)
    return 2; // On the Way
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, order.origin, order.destination]);

  const toggleSim = () => {
    if (simRunning) {
      simRef.current?.stop();
      simRef.current = null;
      setSimRunning(false);
    } else if (routePath.length > 1) {
      setSimRunning(true);
      simRef.current = startDriverSimulation(order.id, routePath, {
        intervalMs: 1400,
        onFinish: () => setSimRunning(false),
      });
    }
  };

  useEffect(() => () => simRef.current?.stop(), []);

  const stale = lastUpdateAt != null && Date.now() - lastUpdateAt > 15000;

  /* ── missing API key fallback ──────────────────────────────── */
  if (!API_KEY) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex flex-col items-center justify-center px-8 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-lg font-black text-gray-900 mb-2">Google Maps key required</h2>
        <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
          Add a <code className="font-mono text-xs">VITE_GOOGLE_MAPS_API_KEY</code> with the
          Maps JavaScript, Directions and Distance Matrix APIs enabled to see the live map.
        </p>
        <Link href="/home">
          <button className="mt-6 px-6 py-2.5 rounded-2xl text-white font-black text-sm" style={{ background: GREEN }}>
            Back to Home
          </button>
        </Link>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center px-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-sm text-gray-600">Failed to load Google Maps. Check the API key restrictions.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-200">
      <style>{`@keyframes conon-pulse{0%{transform:scale(0.6);opacity:0.9}100%{transform:scale(1.6);opacity:0}}`}</style>

      {/* ── Map ─────────────────────────────────────────────── */}
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={order.origin}
          zoom={13}
          options={MAP_OPTIONS}
          onLoad={onMapLoad}
        >
          {routePath.length > 1 && (
            <>
              <Polyline path={routePath} options={{ strokeColor: "#ffffff", strokeOpacity: 0.9, strokeWeight: 9 }} />
              <Polyline path={routePath} options={{ strokeColor: GREEN, strokeOpacity: 1, strokeWeight: 5 }} />
            </>
          )}
          <Marker position={order.origin} icon={pinIcon("warehouse")} title={order.origin.label} />
          <Marker position={order.destination} icon={pinIcon("site")} title={order.destination.label} />
          <TruckMarker position={truckPos} bearing={bearing} />
        </GoogleMap>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">Loading map…</div>
      )}

      {/* ── Floating header ─────────────────────────────────── */}
      <div className="absolute top-0 inset-x-0 p-4 flex items-center gap-3 pointer-events-none">
        <Link href="/home">
          <button className="pointer-events-auto w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
        </Link>
        <div className="pointer-events-auto flex-1 bg-white rounded-2xl shadow-lg px-4 py-2">
          <p className="text-[11px] text-gray-400 font-bold">Tracking order {order.id}</p>
          <p className="text-sm font-black text-gray-900 truncate">{order.vendorName}</p>
        </div>
        <div
          className="pointer-events-auto flex items-center gap-1.5 bg-white rounded-full shadow-lg px-3 py-2"
          title={connected ? "Live connection active" : "Reconnecting…"}
        >
          <Radio className="w-3.5 h-3.5" style={{ color: connected && !stale ? GREEN : "#9ca3af" }} />
          <span className="text-[11px] font-black" style={{ color: connected && !stale ? GREEN : "#9ca3af" }}>
            {connected ? (stale ? "Stale" : "Live") : "Offline"}
          </span>
        </div>
      </div>

      {/* ── Dev-only driver simulator ───────────────────────── */}
      {import.meta.env.DEV && (
        <button
          onClick={toggleSim}
          disabled={routePath.length < 2}
          className="absolute left-4 bottom-[19rem] z-10 flex items-center gap-2 px-3 py-2 rounded-xl text-white text-xs font-black shadow-lg disabled:opacity-40"
          style={{ background: simRunning ? "#b91c1c" : "#1f2937" }}
        >
          {simRunning ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {simRunning ? "Stop driver sim" : "Simulate driver"}
        </button>
      )}

      {/* ── Bottom sheet ────────────────────────────────────── */}
      <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl px-5 pt-3 pb-6">
        <div className="w-10 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />

        {/* ETA + distance */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
              <Navigation className="w-3 h-3" style={{ color: GREEN }} />
              {step === 3 ? "Arrived" : "Live ETA"}
            </p>
            <p className="text-2xl font-black text-gray-900 leading-tight">
              {step === 3
                ? "At your site"
                : eta
                  ? `Arriving in ${eta.mins} min${eta.mins === 1 ? "" : "s"}`
                  : "Calculating…"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1 justify-end">
              <MapPin className="w-3 h-3" /> Distance left
            </p>
            <p className="text-lg font-black" style={{ color: GREEN_DARK }}>{distRemaining ?? "—"}</p>
          </div>
        </div>

        {/* stepper */}
        <div className="mb-4">
          <Stepper current={step} />
        </div>

        {/* driver card */}
        <div className="bg-gray-50 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black shrink-0" style={{ background: "#d97706" }}>
            {order.driver.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-black text-gray-900 truncate">{order.driver.name}</p>
              <span className="flex items-center gap-0.5 text-[11px] font-bold text-gray-500">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />{order.driver.rating}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-semibold flex items-center gap-1 mt-0.5">
              <Truck className="w-3 h-3" /> {order.driver.truckNumber}
              <span className="text-gray-300">·</span>
              <Package className="w-3 h-3" /> {order.driver.trips} trips
            </p>
          </div>
          <a
            href={`tel:${order.driver.phone}`}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm font-black shrink-0"
            style={{ background: GREEN }}
          >
            <Phone className="w-4 h-4" /> Call
          </a>
        </div>
      </div>
    </div>
  );
}
