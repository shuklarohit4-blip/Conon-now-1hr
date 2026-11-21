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
  CheckCircle2, Package, Truck, Radio, Play, Square,
  Plus, Minus, RotateCcw, Info,
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

/* SVG pin factory for origin / destination markers (Google Maps). */
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
              style={{ color: active ? "#111827" : done ? GREEN : "#9ca3af" }}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Web Mercator math for fallback OpenStreetMap viewer ───── */
function latLngToWorldPixel(lat: number, lng: number, zoom: number) {
  const scale = 256 * Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * scale;
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const clampedSin = Math.max(-0.9999, Math.min(0.9999, sinLat));
  const y = (0.5 - Math.log((1 + clampedSin) / (1 - clampedSin)) / (4 * Math.PI)) * scale;
  return { x, y };
}

function worldPixelToLatLng(x: number, y: number, zoom: number): LatLng {
  const scale = 256 * Math.pow(2, zoom);
  const lng = (x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return { lat, lng };
}

function generateRoadPath(origin: LatLng, dest: LatLng): LatLng[] {
  const points: LatLng[] = [];
  const steps = 14;
  const dLat = dest.lat - origin.lat;
  const dLng = dest.lng - origin.lng;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const curve = Math.sin(t * Math.PI) * 0.0035;
    points.push({
      lat: origin.lat + dLat * t + curve,
      lng: origin.lng + dLng * t - curve * 0.45,
    });
  }
  return points;
}

/* ── Fallback Live Map (OpenStreetMap & Vector overlay) ────── */
function FallbackMap({
  origin,
  destination,
  routePath,
  truckPos,
  bearing,
}: {
  origin: LatLng & { label: string };
  destination: LatLng & { label: string };
  routePath: LatLng[];
  truckPos: LatLng;
  bearing: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(14);
  const [center, setCenter] = useState<LatLng>(() => ({
    lat: (origin.lat + destination.lat) / 2,
    lng: (origin.lng + destination.lng) / 2,
  }));
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, centerWorld: { x: 0, y: 0 } });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setSize({
          width: containerRef.current.clientWidth || window.innerWidth,
          height: containerRef.current.clientHeight || window.innerHeight,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const centerPixel = useMemo(
    () => latLngToWorldPixel(center.lat, center.lng, zoom),
    [center.lat, center.lng, zoom],
  );

  const toScreen = useCallback(
    (lat: number, lng: number) => {
      const p = latLngToWorldPixel(lat, lng, zoom);
      return {
        x: size.width / 2 + (p.x - centerPixel.x),
        y: size.height / 2 + (p.y - centerPixel.y),
      };
    },
    [centerPixel, size.width, size.height, zoom],
  );

  const tiles = useMemo(() => {
    const numTiles = 1 << zoom;
    const minTx = Math.floor((centerPixel.x - size.width / 2) / 256) - 1;
    const maxTx = Math.floor((centerPixel.x + size.width / 2) / 256) + 1;
    const minTy = Math.floor((centerPixel.y - size.height / 2) / 256) - 1;
    const maxTy = Math.floor((centerPixel.y + size.height / 2) / 256) + 1;

    const list: { key: string; url: string; left: number; top: number }[] = [];
    for (let ty = Math.max(0, minTy); ty <= Math.min(numTiles - 1, maxTy); ty++) {
      for (let tx = minTx; tx <= maxTx; tx++) {
        const wrappedTx = ((tx % numTiles) + numTiles) % numTiles;
        const left = tx * 256 - (centerPixel.x - size.width / 2);
        const top = ty * 256 - (centerPixel.y - size.height / 2);
        list.push({
          key: `${zoom}-${tx}-${ty}`,
          url: `https://tile.openstreetmap.org/${zoom}/${wrappedTx}/${ty}.png`,
          left,
          top,
        });
      }
    }
    return list;
  }, [centerPixel, size.width, size.height, zoom]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      centerWorld: { ...centerPixel },
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const newWorldX = dragStartRef.current.centerWorld.x - dx;
    const newWorldY = dragStartRef.current.centerWorld.y - dy;
    setCenter(worldPixelToLatLng(newWorldX, newWorldY, zoom));
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const originScreen = toScreen(origin.lat, origin.lng);
  const destScreen = toScreen(destination.lat, destination.lng);
  const truckScreen = toScreen(truckPos.lat, truckPos.lng);

  const polylinePoints = routePath
    .map((pt) => {
      const s = toScreen(pt.lat, pt.lng);
      return `${s.x.toFixed(1)},${s.y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="relative w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing bg-[#eef2ea]"
    >
      {/* OSM Tiles Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {tiles.map((t) => (
          <img
            key={t.key}
            src={t.url}
            alt=""
            loading="lazy"
            className="absolute w-[256px] h-[256px] opacity-90 transition-opacity duration-300"
            style={{ left: t.left, top: t.top }}
          />
        ))}
      </div>

      {/* Route SVG Polyline */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {polylinePoints && (
          <>
            <polyline
              points={polylinePoints}
              fill="none"
              stroke="#ffffff"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity="0.9"
            />
            <polyline
              points={polylinePoints}
              fill="none"
              stroke={GREEN}
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity="1"
            />
          </>
        )}
      </svg>

      {/* Origin Marker */}
      <div
        className="absolute pointer-events-none flex flex-col items-center"
        style={{
          left: originScreen.x,
          top: originScreen.y,
          transform: "translate(-50%, -100%)",
        }}
      >
        <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md mb-1 whitespace-nowrap">
          Warehouse
        </span>
        <svg width="28" height="34" viewBox="0 0 28 34">
          <path
            d="M14 0C6.8 0 1 5.8 1 13c0 9 13 21 13 21s13-12 13-21C27 5.8 21.2 0 14 0z"
            fill="#1d4ed8"
            stroke="#fff"
            strokeWidth="2"
          />
          <path
            d="M11 19v-6h4v6M9 19v-8l5-3 5 3v8"
            fill="none"
            stroke="#fff"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Destination Marker */}
      <div
        className="absolute pointer-events-none flex flex-col items-center"
        style={{
          left: destScreen.x,
          top: destScreen.y,
          transform: "translate(-50%, -100%)",
        }}
      >
        <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md mb-1 whitespace-nowrap">
          Your Site
        </span>
        <svg width="28" height="34" viewBox="0 0 28 34">
          <path
            d="M14 0C6.8 0 1 5.8 1 13c0 9 13 21 13 21s13-12 13-21C27 5.8 21.2 0 14 0z"
            fill={GREEN}
            stroke="#fff"
            strokeWidth="2"
          />
          <circle cx="14" cy="11" r="2.4" fill="#fff" />
          <path d="M14 7v8" stroke="#fff" strokeWidth="1.6" />
        </svg>
      </div>

      {/* Truck Marker with bearing rotation and pulsing green radar */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: truckScreen.x,
          top: truckScreen.y,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="w-[54px] h-[54px] relative">
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background: "rgba(42,122,59,0.22)",
              animation: "conon-pulse 1.8s ease-out infinite",
            }}
          />
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-out"
            style={{
              transform: `rotate(${bearing}deg)`,
              filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.35))",
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
      </div>

      {/* Map Zoom & Reset Controls */}
      <div className="absolute right-4 top-20 z-10 flex flex-col gap-1.5 shadow-lg rounded-2xl bg-white/95 backdrop-blur-sm p-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setZoom((z) => Math.min(18, z + 1));
          }}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-700 hover:bg-gray-100 font-bold active:scale-95 transition-transform"
          title="Zoom in"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setZoom((z) => Math.max(11, z - 1));
          }}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-700 hover:bg-gray-100 font-bold active:scale-95 transition-transform"
          title="Zoom out"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCenter({
              lat: (origin.lat + destination.lat) / 2,
              lng: (origin.lng + destination.lng) / 2,
            });
            setZoom(14);
          }}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-700 hover:bg-gray-100 font-bold active:scale-95 transition-transform"
          title="Reset View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ── main component ──────────────────────────────────────────── */
export function LiveOrderTracking({ order }: { order: TrackedOrder }) {
  const hasKey = Boolean(API_KEY && API_KEY.trim().length > 0);
  const { isLoaded, loadError } = useJsApiLoader({
    id: "conon-google-maps",
    googleMapsApiKey: hasKey ? API_KEY! : "",
  });

  const canUseGoogle = hasKey && isLoaded && !loadError;

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

  // Fetch the driving route from server Directions proxy, with smooth curve fallback.
  useEffect(() => {
    let cancelled = false;
    fetchDirections(order.origin, order.destination)
      .then((res) => {
        if (cancelled) return;
        if (res.path && res.path.length > 1) {
          setRoutePath(res.path);
        } else {
          setRoutePath(generateRoadPath(order.origin, order.destination));
        }
      })
      .catch(() => {
        if (cancelled) return;
        setRoutePath(generateRoadPath(order.origin, order.destination));
      });
    return () => {
      cancelled = true;
    };
  }, [order.origin, order.destination]);

  // Live ETA + distance remaining (works with DistanceMatrix if available, or real-time geometric fallback).
  useEffect(() => {
    const toDestMeters = distanceMeters(truckTarget, order.destination);
    const speedMps = 8.33; // ~30 km/h average city transit speed
    const calculatedMins = Math.max(1, Math.round(toDestMeters / (speedMps * 60)));
    const calculatedDist =
      toDestMeters >= 1000
        ? `${(toDestMeters / 1000).toFixed(1)} km`
        : `${Math.round(toDestMeters)} m`;

    setEta({ text: `${calculatedMins} min${calculatedMins === 1 ? "" : "s"}`, mins: calculatedMins });
    setDistRemaining(calculatedDist);

    if (!canUseGoogle || !target) return;
    const now = Date.now();
    if (now - lastEtaCallRef.current < 4000) return;
    lastEtaCallRef.current = now;

    if (typeof google !== "undefined" && google.maps?.DistanceMatrixService) {
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
    }
  }, [canUseGoogle, target, truckTarget, order.destination]);

  // Keep the truck in view on Google Maps as it moves.
  useEffect(() => {
    if (mapRef.current && position) mapRef.current.panTo(position);
  }, [position]);

  // Derive the stepper stage from proximity.
  const step: StepIndex = useMemo(() => {
    if (!target) return 0; // not moving yet → Order Placed
    const toDest = distanceMeters(truckTarget, order.destination);
    const toOrigin = distanceMeters(truckTarget, order.origin);
    if (toDest < 120) return 3; // Reached
    if (toOrigin < 250) return 1; // Loaded (still at warehouse)
    return 2; // On the Way
  }, [target, order.origin, order.destination, truckTarget]);

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

  return (
    <div className="fixed inset-0 bg-gray-200">
      <style>{`@keyframes conon-pulse{0%{transform:scale(0.6);opacity:0.9}100%{transform:scale(1.6);opacity:0}}`}</style>

      {/* ── Map (Google Maps if configured, or Fallback OpenStreetMap viewer) ── */}
      {canUseGoogle ? (
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
        <FallbackMap
          origin={order.origin}
          destination={order.destination}
          routePath={routePath}
          truckPos={truckPos}
          bearing={bearing}
        />
      )}

      {/* ── Top Info Banner (when running on OpenStreetMap) ── */}
      {!canUseGoogle && (
        <div className="absolute top-16 inset-x-0 mx-auto max-w-sm px-4 z-10 pointer-events-none">
          <div className="bg-emerald-800/90 backdrop-blur-md text-white rounded-2xl px-3.5 py-1.5 shadow-md flex items-center justify-between text-[11px] font-bold pointer-events-auto">
            <div className="flex items-center gap-1.5 truncate">
              <Info className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="truncate">OpenStreetMap Live Mode · Add <code className="font-mono text-[10px] text-amber-200">VITE_GOOGLE_MAPS_API_KEY</code> for Google Maps</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating header ─────────────────────────────────── */}
      <div className="absolute top-0 inset-x-0 p-4 flex items-center gap-3 pointer-events-none z-20">
        <Link href="/home">
          <button className="pointer-events-auto w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center active:scale-95 transition-transform">
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
          className="absolute left-4 bottom-[19rem] z-20 flex items-center gap-2 px-3.5 py-2 rounded-xl text-white text-xs font-black shadow-lg disabled:opacity-40 active:scale-95 transition-transform"
          style={{ background: simRunning ? "#b91c1c" : "#1f2937" }}
        >
          {simRunning ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {simRunning ? "Stop driver sim" : "Simulate driver"}
        </button>
      )}

      {/* ── Bottom sheet ────────────────────────────────────── */}
      <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl px-5 pt-3 pb-6 z-20">
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
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm font-black shrink-0 active:scale-95 transition-transform"
            style={{ background: GREEN }}
          >
            <Phone className="w-4 h-4" /> Call
          </a>
        </div>
      </div>
    </div>
  );
}
