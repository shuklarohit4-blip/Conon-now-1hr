import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchReverseGeocode } from "@/lib/mapsApi";

export const SERVICEABLE_PINS: Record<string, string> = {
  "226001": "Hazratganj",
  "226002": "Lucknow Cantt",
  "226003": "Chowk",
  "226004": "Charbagh",
  "226005": "Alambagh",
  "226006": "Mahanagar",
  "226009": "Amausi (Airport)",
  "226010": "Gomti Nagar",
  "226016": "Indira Nagar",
  "226017": "Rajajipuram",
  "226018": "Aminabad",
  "226020": "Aishbagh",
  "226021": "Jankipuram",
  "226022": "Vikas Nagar",
  "226024": "Aliganj",
  "226025": "Krishna Nagar",
  "226028": "Gomti Nagar Extension",
  "226029": "Telibagh",
  "226030": "Sushant Golf City (Ansal API)",
};

export const SERVICEABLE_PIN_COORDS: Record<string, { lat: number; lng: number }> = {
  "226001": { lat: 26.8512, lng: 80.9462 },
  "226002": { lat: 26.8124, lng: 80.9521 },
  "226003": { lat: 26.8682, lng: 80.9061 },
  "226004": { lat: 26.8276, lng: 80.9072 },
  "226005": { lat: 26.8138, lng: 80.8986 },
  "226006": { lat: 26.8778, lng: 80.9522 },
  "226009": { lat: 26.7606, lng: 80.8893 },
  "226010": { lat: 26.8547, lng: 80.9992 },
  "226016": { lat: 26.8834, lng: 80.9882 },
  "226017": { lat: 26.8372, lng: 80.8794 },
  "226018": { lat: 26.8458, lng: 80.9275 },
  "226020": { lat: 26.8329, lng: 80.9168 },
  "226021": { lat: 26.9189, lng: 80.9507 },
  "226022": { lat: 26.8911, lng: 80.9634 },
  "226024": { lat: 26.8867, lng: 80.9416 },
  "226025": { lat: 26.7924, lng: 80.8973 },
  "226028": { lat: 26.8398, lng: 81.0264 },
  "226029": { lat: 26.7915, lng: 80.9412 },
  "226030": { lat: 26.7824, lng: 81.0112 },
};

export interface DeliveryLocation {
  pincode: string;
  area: string;       // e.g. "Hazratganj"
  city: string;       // e.g. "Lucknow"
  fullLabel: string;  // e.g. "Lucknow — Hazratganj"
  lat?: number;
  lng?: number;
  confirmed: boolean;
}

// Default delivery location covers all of Lucknow so the app is usable
// out-of-the-box without forcing the location gate. Pincode 226001
// (Hazratganj, central Lucknow) is serviceable; users can still narrow it
// down to a specific locality from the header.
const DEFAULT_LOC: DeliveryLocation = {
  pincode: "226001",
  area: "Hazratganj",
  city: "Lucknow",
  fullLabel: "Lucknow — Hazratganj",
  lat: 26.8512,
  lng: 80.9462,
  confirmed: true,
};

interface LocationContextType {
  location: DeliveryLocation;
  setLocation: (loc: DeliveryLocation) => void;
  confirmLocation: (loc: Omit<DeliveryLocation, "confirmed">) => void;
  showLocationSheet: boolean;
  openLocationSheet: () => void;
  closeLocationSheet: () => void;
  isServiceable: (pin: string) => boolean;
  reverseGeocode: (lat: number, lng: number) => Promise<{ pincode: string; area: string; city: string; address?: string; lat?: number; lng?: number } | null>;
}

const LocationContext = createContext<LocationContextType>({
  location: DEFAULT_LOC,
  setLocation: () => {},
  confirmLocation: () => {},
  showLocationSheet: false,
  openLocationSheet: () => {},
  closeLocationSheet: () => {},
  isServiceable: () => false,
  reverseGeocode: async () => null,
});

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<DeliveryLocation>(() => {
    // Only the v2 key with an explicit confirmed flag is authoritative.
    // The legacy conon_pincode/conon_pinarea keys were auto-written as a
    // default (never a deliberate user choice), so we must NOT treat them
    // as a confirmed location — otherwise the confirmation sheet would be
    // permanently suppressed for every returning user.
    try {
      const stored = localStorage.getItem("conon_location_v3");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only honor a *deliberately confirmed* stored location. Stale
        // unconfirmed entries (auto-written defaults from older builds) are
        // ignored so every such user falls back to the new Lucknow-wide
        // default instead of being shown the gate again.
        if (parsed && parsed.confirmed === true) return parsed as DeliveryLocation;
      }
    } catch { /* ignore */ }
    return DEFAULT_LOC;
  });

  // Show the sheet on first open (when not yet confirmed)
  const [showLocationSheet, setShowLocationSheet] = useState(() => !location.confirmed);

  const setLocation = useCallback((loc: DeliveryLocation) => {
    setLocationState(loc);
    try { localStorage.setItem("conon_location_v3", JSON.stringify(loc)); } catch { /* ignore */ }
    // Keep old keys in sync for Layout
    localStorage.setItem("conon_pincode", loc.pincode);
    localStorage.setItem("conon_pinarea", loc.fullLabel);
  }, []);

  const confirmLocation = useCallback((loc: Omit<DeliveryLocation, "confirmed">) => {
    const coords = (loc.lat && loc.lng)
      ? { lat: loc.lat, lng: loc.lng }
      : SERVICEABLE_PIN_COORDS[loc.pincode] ?? { lat: 26.8512, lng: 80.9462 };

    const confirmed: DeliveryLocation = {
      ...loc,
      lat: loc.lat ?? coords.lat,
      lng: loc.lng ?? coords.lng,
      confirmed: true,
    };
    setLocation(confirmed);

    try {
      localStorage.setItem(
        "conon_last_address_coords",
        JSON.stringify({
          lat: confirmed.lat,
          lng: confirmed.lng,
          label: confirmed.fullLabel,
          pincode: confirmed.pincode,
        })
      );
    } catch {
      /* ignore */
    }

    setShowLocationSheet(false);
  }, [setLocation]);

  const openLocationSheet  = useCallback(() => setShowLocationSheet(true), []);
  const closeLocationSheet = useCallback(() => setShowLocationSheet(false), []);

  const isServiceable = useCallback((pin: string) => pin in SERVICEABLE_PINS, []);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    // 1. Try our Google Maps reverse geocoding proxy first
    const googleRes = await fetchReverseGeocode(lat, lng);
    if (googleRes && googleRes.pincode && /^\d{6}$/.test(googleRes.pincode)) {
      return {
        pincode: googleRes.pincode,
        area: SERVICEABLE_PINS[googleRes.pincode] ?? googleRes.area,
        city: googleRes.city || "Lucknow",
        address: googleRes.address,
        lat: googleRes.lat,
        lng: googleRes.lng,
      };
    }

    // 2. Fallback to Nominatim if available
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      if (res.ok) {
        const data = await res.json();
        const pincode = data?.address?.postcode?.replace(/\s+/g, "");
        if (pincode && /^\d{6}$/.test(pincode)) {
          const area = SERVICEABLE_PINS[pincode] ?? data?.address?.suburb ?? data?.address?.neighbourhood ?? "";
          const city = data?.address?.city ?? data?.address?.town ?? "Lucknow";
          return { pincode, area, city, lat, lng };
        }
      }
    } catch {
      /* ignore */
    }

    // 3. Fallback to nearest Lucknow coordinate
    const LUCKNOW_COORDS: Record<string, { name: string; lat: number; lng: number }> = {
      "226001": { name: "Hazratganj", lat: 26.8512, lng: 80.9462 },
      "226010": { name: "Gomti Nagar", lat: 26.8547, lng: 80.9992 },
      "226028": { name: "Gomti Nagar Extension", lat: 26.8398, lng: 81.0264 },
      "226016": { name: "Indira Nagar", lat: 26.8834, lng: 80.9882 },
      "226024": { name: "Aliganj", lat: 26.8867, lng: 80.9416 },
      "226004": { name: "Charbagh", lat: 26.8276, lng: 80.9072 },
      "226005": { name: "Alambagh", lat: 26.8138, lng: 80.8986 },
      "226006": { name: "Mahanagar", lat: 26.8778, lng: 80.9522 },
      "226021": { name: "Jankipuram", lat: 26.9189, lng: 80.9507 },
      "226022": { name: "Vikas Nagar", lat: 26.8911, lng: 80.9634 },
      "226030": { name: "Sushant Golf City (Ansal API)", lat: 26.7824, lng: 81.0112 },
    };
    let closestPin = "226001";
    let minD = Infinity;
    for (const [pin, info] of Object.entries(LUCKNOW_COORDS)) {
      const d = (info.lat - lat) ** 2 + (info.lng - lng) ** 2;
      if (d < minD) {
        minD = d;
        closestPin = pin;
      }
    }
    return {
      pincode: closestPin,
      area: SERVICEABLE_PINS[closestPin] || "Hazratganj",
      city: "Lucknow",
      lat,
      lng,
    };
  }, []);

  useEffect(() => {
    try { localStorage.setItem("conon_location_v3", JSON.stringify(location)); } catch { /* ignore */ }
  }, [location]);

  return (
    <LocationContext.Provider value={{
      location, setLocation, confirmLocation,
      showLocationSheet, openLocationSheet, closeLocationSheet,
      isServiceable, reverseGeocode,
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useDeliveryLocation = () => useContext(LocationContext);
