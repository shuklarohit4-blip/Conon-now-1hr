import { Router, type IRouter } from "express";

/**
 * Google Maps proxy routes.
 *
 * The Google Maps API key is read server-side from process.env.GOOGLE_MAPS_API_KEY
 * and is NEVER exposed to the browser. The frontend calls these endpoints and the
 * server forwards the request to Google with the secret key attached.
 *
 * Endpoints (all mounted under /api):
 *   GET /maps/places/autocomplete?input=&sessiontoken=
 *   GET /maps/places/details?place_id=&sessiontoken=
 *   GET /maps/directions?origin=lat,lng&destination=lat,lng
 */

const router: IRouter = Router();

const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Bias all results toward Lucknow, India (CONON's serviceable region).
const REGION = "in";
const LANGUAGE = "en";

function ensureKey(res: import("express").Response): boolean {
  if (!GOOGLE_KEY) {
    res
      .status(503)
      .json({ error: "Maps service is not configured on the server." });
    return false;
  }
  return true;
}

/**
 * Decode a Google "encoded polyline" string into an array of {lat, lng} points.
 * https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 */
function decodePolyline(encoded: string): { lat: number; lng: number }[] {
  const points: { lat: number; lng: number }[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  const len = encoded.length;

  while (index < len) {
    let result = 0;
    let shift = 0;
    let b: number;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    result = 0;
    shift = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return points;
}

/* ── Places Autocomplete ──────────────────────────────────────── */
router.get("/maps/places/autocomplete", async (req, res) => {
  if (!ensureKey(res)) return;

  const input = typeof req.query.input === "string" ? req.query.input.trim() : "";
  if (input.length < 2) {
    res.json({ predictions: [] });
    return;
  }

  const sessiontoken =
    typeof req.query.sessiontoken === "string" ? req.query.sessiontoken : "";

  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/autocomplete/json",
  );
  url.searchParams.set("input", input);
  url.searchParams.set("key", GOOGLE_KEY!);
  url.searchParams.set("components", "country:in");
  url.searchParams.set("language", LANGUAGE);
  if (sessiontoken) url.searchParams.set("sessiontoken", sessiontoken);

  try {
    const r = await fetch(url);
    const data = (await r.json()) as {
      status: string;
      error_message?: string;
      predictions?: Array<{
        description: string;
        place_id: string;
        structured_formatting?: {
          main_text?: string;
          secondary_text?: string;
        };
      }>;
    };

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      res
        .status(502)
        .json({ error: data.error_message ?? `Google error: ${data.status}` });
      return;
    }

    const predictions = (data.predictions ?? []).map((p) => ({
      description: p.description,
      placeId: p.place_id,
      mainText: p.structured_formatting?.main_text ?? p.description,
      secondaryText: p.structured_formatting?.secondary_text ?? "",
    }));

    res.json({ predictions });
  } catch {
    res.status(502).json({ error: "Failed to reach the maps service." });
  }
});

/* ── Place Details (resolve place_id → coordinates) ───────────── */
router.get("/maps/places/details", async (req, res) => {
  if (!ensureKey(res)) return;

  const placeId =
    typeof req.query.place_id === "string" ? req.query.place_id : "";
  if (!placeId) {
    res.status(400).json({ error: "place_id is required." });
    return;
  }

  const sessiontoken =
    typeof req.query.sessiontoken === "string" ? req.query.sessiontoken : "";

  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/details/json",
  );
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("key", GOOGLE_KEY!);
  url.searchParams.set(
    "fields",
    "geometry,formatted_address,address_component,name",
  );
  url.searchParams.set("language", LANGUAGE);
  if (sessiontoken) url.searchParams.set("sessiontoken", sessiontoken);

  try {
    const r = await fetch(url);
    const data = (await r.json()) as {
      status: string;
      error_message?: string;
      result?: {
        formatted_address?: string;
        name?: string;
        geometry?: { location?: { lat: number; lng: number } };
        address_components?: Array<{ types: string[]; long_name: string }>;
      };
    };

    if (data.status !== "OK" || !data.result?.geometry?.location) {
      res
        .status(502)
        .json({ error: data.error_message ?? `Google error: ${data.status}` });
      return;
    }

    const components = data.result.address_components ?? [];
    const findComp = (type: string) =>
      components.find((c) => c.types.includes(type))?.long_name ?? "";

    res.json({
      address: data.result.formatted_address ?? data.result.name ?? "",
      name: data.result.name ?? "",
      lat: data.result.geometry.location.lat,
      lng: data.result.geometry.location.lng,
      pincode: findComp("postal_code"),
      city:
        findComp("locality") ||
        findComp("administrative_area_level_2") ||
        "",
      area:
        findComp("sublocality_level_1") ||
        findComp("sublocality") ||
        findComp("neighborhood") ||
        "",
    });
  } catch {
    res.status(502).json({ error: "Failed to reach the maps service." });
  }
});

/* ── Directions (route between two coordinates) ───────────────── */
router.get("/maps/directions", async (req, res) => {
  if (!ensureKey(res)) return;

  const origin = typeof req.query.origin === "string" ? req.query.origin : "";
  const destination =
    typeof req.query.destination === "string" ? req.query.destination : "";
  if (!origin || !destination) {
    res
      .status(400)
      .json({ error: "origin and destination are required (lat,lng)." });
    return;
  }

  const url = new URL("https://maps.googleapis.com/maps/api/directions/json");
  url.searchParams.set("origin", origin);
  url.searchParams.set("destination", destination);
  url.searchParams.set("mode", "driving");
  url.searchParams.set("region", REGION);
  url.searchParams.set("language", LANGUAGE);
  url.searchParams.set("key", GOOGLE_KEY!);

  try {
    const r = await fetch(url);
    const data = (await r.json()) as {
      status: string;
      error_message?: string;
      routes?: Array<{
        overview_polyline?: { points?: string };
        legs?: Array<{
          distance?: { text: string; value: number };
          duration?: { text: string; value: number };
        }>;
      }>;
    };

    if (data.status !== "OK" || !data.routes?.length) {
      res
        .status(502)
        .json({ error: data.error_message ?? `Google error: ${data.status}` });
      return;
    }

    const route = data.routes[0];
    const encoded = route.overview_polyline?.points ?? "";
    const path = encoded ? decodePolyline(encoded) : [];
    const leg = route.legs?.[0];

    res.json({
      path,
      distanceText: leg?.distance?.text ?? null,
      distanceMeters: leg?.distance?.value ?? null,
      durationText: leg?.duration?.text ?? null,
      durationSeconds: leg?.duration?.value ?? null,
    });
  } catch {
    res.status(502).json({ error: "Failed to reach the maps service." });
  }
});

export default router;
