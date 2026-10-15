/**
 * Client helpers for the server-side Google Maps proxy.
 *
 * The Google Maps API key lives ONLY on the server (process.env.GOOGLE_MAPS_API_KEY).
 * These helpers call our own api-server proxy endpoints, which attach the key and
 * forward to Google. The browser never sees the key.
 *
 * The API origin can be set to the Render service for production.
 */
import type { LatLng } from "@/lib/realtime";
import { API_ORIGIN } from "./apiBase";

const API = `${API_ORIGIN}/api`;

export interface PlacePrediction {
  description: string;
  placeId: string;
  mainText: string;
  secondaryText: string;
}

export interface PlaceDetails {
  address: string;
  name: string;
  lat: number;
  lng: number;
  pincode: string;
  city: string;
  area: string;
}

export interface DirectionsResult {
  path: LatLng[];
  distanceText: string | null;
  distanceMeters: number | null;
  durationText: string | null;
  durationSeconds: number | null;
}

/** A fresh session token groups autocomplete keystrokes + one details call for billing. */
export function newSessionToken(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* ignore */
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function fetchAutocomplete(
  input: string,
  sessionToken: string,
  signal?: AbortSignal,
): Promise<PlacePrediction[]> {
  const url =
    `${API}/maps/places/autocomplete` +
    `?input=${encodeURIComponent(input)}` +
    `&sessiontoken=${encodeURIComponent(sessionToken)}`;
  const r = await fetch(url, { credentials: "include", signal });
  if (!r.ok) throw new Error(`autocomplete ${r.status}`);
  const data = (await r.json()) as { predictions?: PlacePrediction[] };
  return data.predictions ?? [];
}

export async function fetchPlaceDetails(
  placeId: string,
  sessionToken: string,
): Promise<PlaceDetails> {
  const url =
    `${API}/maps/places/details` +
    `?place_id=${encodeURIComponent(placeId)}` +
    `&sessiontoken=${encodeURIComponent(sessionToken)}`;
  const r = await fetch(url, { credentials: "include" });
  if (!r.ok) throw new Error(`details ${r.status}`);
  return (await r.json()) as PlaceDetails;
}

export async function fetchDirections(
  origin: LatLng,
  destination: LatLng,
): Promise<DirectionsResult> {
  const o = `${origin.lat},${origin.lng}`;
  const d = `${destination.lat},${destination.lng}`;
  const url =
    `${API}/maps/directions` +
    `?origin=${encodeURIComponent(o)}` +
    `&destination=${encodeURIComponent(d)}`;
  const r = await fetch(url, { credentials: "include" });
  if (!r.ok) throw new Error(`directions ${r.status}`);
  return (await r.json()) as DirectionsResult;
}
