import { Router, type IRouter } from "express";

/**
 * Google Maps proxy routes.
 *
 * The Google Maps API key is read server-side from process.env.GOOGLE_MAPS_API_KEY
 * or VITE_GOOGLE_MAPS_API_KEY and is forwarded to Google with requests.
 *
 * Endpoints (mounted under /api):
 *   GET /maps/places/autocomplete?input=&sessiontoken=
 *   GET /maps/places/details?place_id=&sessiontoken=
 *   GET /maps/geocode/reverse?lat=&lng=
 *   GET /maps/directions?origin=lat,lng&destination=lat,lng
 */

const router: IRouter = Router();

function getGoogleKey(): string | undefined {
  return (
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    "AIzaSyCKldUsNWdT7u7MKxQ0fmGiQufHpxH0go4"
  );
}

// Bias all results toward Lucknow, Uttar Pradesh, India
const REGION = "in";
const LANGUAGE = "en";

interface LucknowLocation {
  pincode: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
}

const LUCKNOW_LOCALITIES: LucknowLocation[] = [
  { pincode: "226001", name: "Hazratganj", lat: 26.8512, lng: 80.9462, description: "Hazratganj, Lucknow, Uttar Pradesh 226001" },
  { pincode: "226010", name: "Gomti Nagar", lat: 26.8547, lng: 80.9992, description: "Gomti Nagar, Lucknow, Uttar Pradesh 226010" },
  { pincode: "226028", name: "Gomti Nagar Extension", lat: 26.8398, lng: 81.0264, description: "Gomti Nagar Extension, Shaheed Path, Lucknow 226028" },
  { pincode: "226016", name: "Indira Nagar", lat: 26.8834, lng: 80.9882, description: "Indira Nagar, Lucknow, Uttar Pradesh 226016" },
  { pincode: "226024", name: "Aliganj", lat: 26.8867, lng: 80.9416, description: "Aliganj, Lucknow, Uttar Pradesh 226024" },
  { pincode: "226004", name: "Charbagh", lat: 26.8276, lng: 80.9072, description: "Charbagh, Lucknow, Uttar Pradesh 226004" },
  { pincode: "226005", name: "Alambagh", lat: 26.8138, lng: 80.8986, description: "Alambagh, Lucknow, Uttar Pradesh 226005" },
  { pincode: "226006", name: "Mahanagar", lat: 26.8778, lng: 80.9522, description: "Mahanagar, Lucknow, Uttar Pradesh 226006" },
  { pincode: "226021", name: "Jankipuram", lat: 26.9189, lng: 80.9507, description: "Jankipuram, Lucknow, Uttar Pradesh 226021" },
  { pincode: "226022", name: "Vikas Nagar", lat: 26.8911, lng: 80.9634, description: "Vikas Nagar, Lucknow, Uttar Pradesh 226022" },
  { pincode: "226030", name: "Sushant Golf City (Ansal API)", lat: 26.7824, lng: 81.0112, description: "Sushant Golf City, Sultanpur Road, Lucknow 226030" },
  { pincode: "226002", name: "Lucknow Cantt", lat: 26.8124, lng: 80.9521, description: "Lucknow Cantt, Lucknow, Uttar Pradesh 226002" },
  { pincode: "226003", name: "Chowk", lat: 26.8682, lng: 80.9061, description: "Chowk, Old Lucknow, Uttar Pradesh 226003" },
  { pincode: "226017", name: "Rajajipuram", lat: 26.8372, lng: 80.8794, description: "Rajajipuram, Lucknow, Uttar Pradesh 226017" },
  { pincode: "226018", name: "Aminabad", lat: 26.8458, lng: 80.9275, description: "Aminabad, Lucknow, Uttar Pradesh 226018" },
  { pincode: "226020", name: "Aishbagh", lat: 26.8329, lng: 80.9168, description: "Aishbagh, Lucknow, Uttar Pradesh 226020" },
  { pincode: "226025", name: "Krishna Nagar", lat: 26.7924, lng: 80.8973, description: "Krishna Nagar, Kanpur Road, Lucknow 226025" },
  { pincode: "226029", name: "Telibagh", lat: 26.7915, lng: 80.9412, description: "Telibagh, Raebareli Road, Lucknow 226029" },
  { pincode: "226009", name: "Amausi (Airport)", lat: 26.7606, lng: 80.8893, description: "Amausi Airport Area, Lucknow 226009" }
];

function findNearestLucknow(lat: number, lng: number): LucknowLocation {
  let best = LUCKNOW_LOCALITIES[0];
  let minD = Infinity;
  for (const loc of LUCKNOW_LOCALITIES) {
    const d = (loc.lat - lat) ** 2 + (loc.lng - lng) ** 2;
    if (d < minD) {
      minD = d;
      best = loc;
    }
  }
  return best;
}

/**
 * Decode a Google "encoded polyline" string into an array of {lat, lng} points.
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

/** Generate a realistic road-like waypoint curve between origin and destination */
function generateRoadPath(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
  const points: { lat: number; lng: number }[] = [origin];
  const steps = 12;
  const dLat = destination.lat - origin.lat;
  const dLng = destination.lng - origin.lng;
  const perpLat = -dLng * 0.15;
  const perpLng = dLat * 0.15;

  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const bend = Math.sin(t * Math.PI) * (i % 2 === 0 ? 1 : 0.6);
    points.push({
      lat: origin.lat + dLat * t + perpLat * bend,
      lng: origin.lng + dLng * t + perpLng * bend,
    });
  }
  points.push(destination);
  return points;
}

/* ── Places Autocomplete ──────────────────────────────────────── */
router.get("/maps/places/autocomplete", async (req, res) => {
  const input = typeof req.query.input === "string" ? req.query.input.trim() : "";
  if (input.length < 2) {
    res.json({ predictions: [] });
    return;
  }

  const sessiontoken = typeof req.query.sessiontoken === "string" ? req.query.sessiontoken : "";
  const googleKey = getGoogleKey();

  if (googleKey) {
    try {
      const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
      url.searchParams.set("input", input);
      url.searchParams.set("key", googleKey);
      url.searchParams.set("components", "country:in");
      url.searchParams.set("location", "26.8467,80.9462"); // Lucknow center
      url.searchParams.set("radius", "35000"); // 35km radius
      url.searchParams.set("language", LANGUAGE);
      if (sessiontoken) url.searchParams.set("sessiontoken", sessiontoken);

      const r = await fetch(url.toString(), { signal: AbortSignal.timeout(4000) });
      if (r.ok) {
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

        if (data.status === "OK" && data.predictions && data.predictions.length > 0) {
          const predictions = data.predictions.map((p) => ({
            description: p.description,
            placeId: p.place_id,
            mainText: p.structured_formatting?.main_text ?? p.description,
            secondaryText: p.structured_formatting?.secondary_text ?? "",
          }));
          res.json({ predictions });
          return;
        }
      }
    } catch {
      // Fallback gracefully on timeout or network error
    }
  }

  // Graceful Lucknow locality fallback matching user query
  const qLower = input.toLowerCase();
  const matched = LUCKNOW_LOCALITIES.filter(
    (l) => l.name.toLowerCase().includes(qLower) || l.pincode.includes(qLower) || l.description.toLowerCase().includes(qLower)
  );

  const fallbackList = (matched.length > 0 ? matched : LUCKNOW_LOCALITIES.slice(0, 6)).map((l) => ({
    description: l.description,
    placeId: `conon_loc_${l.pincode}`,
    mainText: l.name,
    secondaryText: `Lucknow, Uttar Pradesh · ${l.pincode}`,
  }));

  res.json({ predictions: fallbackList });
});

/* ── Place Details (resolve place_id → coordinates) ───────────── */
router.get("/maps/places/details", async (req, res) => {
  const placeId = typeof req.query.place_id === "string" ? req.query.place_id : "";
  if (!placeId) {
    res.status(400).json({ error: "place_id is required." });
    return;
  }

  // Handle local fallback place_ids
  if (placeId.startsWith("conon_loc_")) {
    const pin = placeId.replace("conon_loc_", "");
    const found = LUCKNOW_LOCALITIES.find((l) => l.pincode === pin) || LUCKNOW_LOCALITIES[0];
    res.json({
      address: found.description,
      name: found.name,
      lat: found.lat,
      lng: found.lng,
      pincode: found.pincode,
      city: "Lucknow",
      area: found.name,
    });
    return;
  }

  const sessiontoken = typeof req.query.sessiontoken === "string" ? req.query.sessiontoken : "";
  const googleKey = getGoogleKey();

  if (googleKey) {
    try {
      const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
      url.searchParams.set("place_id", placeId);
      url.searchParams.set("key", googleKey);
      url.searchParams.set("fields", "geometry,formatted_address,address_component,name");
      url.searchParams.set("language", LANGUAGE);
      if (sessiontoken) url.searchParams.set("sessiontoken", sessiontoken);

      const r = await fetch(url.toString(), { signal: AbortSignal.timeout(4000) });
      if (r.ok) {
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

        if (data.status === "OK" && data.result?.geometry?.location) {
          const components = data.result.address_components ?? [];
          const findComp = (type: string) => components.find((c) => c.types.includes(type))?.long_name ?? "";

          let pincode = findComp("postal_code");
          let area = findComp("sublocality_level_1") || findComp("sublocality") || findComp("neighborhood") || data.result.name || "";
          let city = findComp("locality") || findComp("administrative_area_level_2") || "Lucknow";

          if (!pincode) {
            const nearest = findNearestLucknow(data.result.geometry.location.lat, data.result.geometry.location.lng);
            pincode = nearest.pincode;
            if (!area) area = nearest.name;
          }

          res.json({
            address: data.result.formatted_address ?? data.result.name ?? "",
            name: data.result.name ?? "",
            lat: data.result.geometry.location.lat,
            lng: data.result.geometry.location.lng,
            pincode,
            city,
            area,
          });
          return;
        }
      }
    } catch {
      // Fallback below
    }
  }

  const fallback = LUCKNOW_LOCALITIES[0];
  res.json({
    address: fallback.description,
    name: fallback.name,
    lat: fallback.lat,
    lng: fallback.lng,
    pincode: fallback.pincode,
    city: "Lucknow",
    area: fallback.name,
  });
});

/* ── Reverse Geocode (lat, lng → address, pincode, area) ─────── */
router.get("/maps/geocode/reverse", async (req, res) => {
  const latStr = typeof req.query.lat === "string" ? req.query.lat : "";
  const lngStr = typeof req.query.lng === "string" ? req.query.lng : "";
  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  if (isNaN(lat) || isNaN(lng)) {
    res.status(400).json({ error: "lat and lng must be valid numbers." });
    return;
  }

  const googleKey = getGoogleKey();

  if (googleKey) {
    try {
      const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
      url.searchParams.set("latlng", `${lat},${lng}`);
      url.searchParams.set("key", googleKey);
      url.searchParams.set("language", LANGUAGE);

      const r = await fetch(url.toString(), { signal: AbortSignal.timeout(4000) });
      if (r.ok) {
        const data = (await r.json()) as {
          status: string;
          results?: Array<{
            formatted_address: string;
            address_components: Array<{ types: string[]; long_name: string }>;
          }>;
        };

        if (data.status === "OK" && data.results && data.results.length > 0) {
          const first = data.results[0];
          const comps = first.address_components ?? [];
          const findComp = (type: string) => comps.find((c) => c.types.includes(type))?.long_name ?? "";

          let pincode = findComp("postal_code");
          let area = findComp("sublocality_level_1") || findComp("sublocality") || findComp("neighborhood") || "";
          let city = findComp("locality") || findComp("administrative_area_level_2") || "Lucknow";

          if (!pincode) {
            const nearest = findNearestLucknow(lat, lng);
            pincode = nearest.pincode;
            if (!area) area = nearest.name;
          }

          res.json({
            address: first.formatted_address,
            pincode,
            area,
            city,
            lat,
            lng,
          });
          return;
        }
      }
    } catch {
      // Fallback below
    }
  }

  // Nearest Lucknow locality fallback
  const nearest = findNearestLucknow(lat, lng);
  res.json({
    address: nearest.description,
    pincode: nearest.pincode,
    area: nearest.name,
    city: "Lucknow",
    lat,
    lng,
  });
});

/* ── Directions (route between two coordinates) ───────────────── */
router.get("/maps/directions", async (req, res) => {
  const origin = typeof req.query.origin === "string" ? req.query.origin : "";
  const destination = typeof req.query.destination === "string" ? req.query.destination : "";
  if (!origin || !destination) {
    res.status(400).json({ error: "origin and destination are required (lat,lng)." });
    return;
  }

  const [oLat, oLng] = origin.split(",").map((s) => parseFloat(s.trim()));
  const [dLat, dLng] = destination.split(",").map((s) => parseFloat(s.trim()));

  const googleKey = getGoogleKey();

  if (googleKey && !isNaN(oLat) && !isNaN(oLng) && !isNaN(dLat) && !isNaN(dLng)) {
    try {
      const url = new URL("https://maps.googleapis.com/maps/api/directions/json");
      url.searchParams.set("origin", origin);
      url.searchParams.set("destination", destination);
      url.searchParams.set("mode", "driving");
      url.searchParams.set("region", REGION);
      url.searchParams.set("language", LANGUAGE);
      url.searchParams.set("key", googleKey);

      const r = await fetch(url.toString(), { signal: AbortSignal.timeout(4500) });
      if (r.ok) {
        const data = (await r.json()) as {
          status: string;
          routes?: Array<{
            overview_polyline?: { points?: string };
            legs?: Array<{
              distance?: { text: string; value: number };
              duration?: { text: string; value: number };
            }>;
          }>;
        };

        if (data.status === "OK" && data.routes && data.routes.length > 0) {
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
          return;
        }
      }
    } catch {
      // Fallback below
    }
  }

  // Realistic routing fallback
  const startPt = { lat: isNaN(oLat) ? 26.8276 : oLat, lng: isNaN(oLng) ? 80.9072 : oLng };
  const endPt = { lat: isNaN(dLat) ? 26.8512 : dLat, lng: isNaN(dLng) ? 80.9462 : dLng };
  const path = generateRoadPath(startPt, endPt);

  // Approximate distance (Haversine)
  const dLatRad = ((endPt.lat - startPt.lat) * Math.PI) / 180;
  const dLngRad = ((endPt.lng - startPt.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLatRad / 2) ** 2 +
    Math.cos((startPt.lat * Math.PI) / 180) * Math.cos((endPt.lat * Math.PI) / 180) * Math.sin(dLngRad / 2) ** 2;
  const distMeters = Math.round(6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.35); // 1.35x road curvature factor
  const distKm = (distMeters / 1000).toFixed(1);
  const durationMins = Math.max(3, Math.round(distMeters / (30 * 16.66))); // ~30 km/h city average

  res.json({
    path,
    distanceText: `${distKm} km`,
    distanceMeters: distMeters,
    durationText: `${durationMins} mins`,
    durationSeconds: durationMins * 60,
  });
});

export default router;
