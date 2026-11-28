import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchReverseGeocode } from "@/lib/mapsApi";
import { useSafeCononMasterSync } from "@/context/CononMasterSyncContext";
import {
  checkPincodeServiceability,
  DEFAULT_SERVICEABLE_ZONES,
} from "@/utils/serviceabilityPolicy";

export const SERVICEABLE_PINS: Record<string, string> = {
  "226030": "Sushant Golf City & Sultanpur Road",
  "226010": "Gomti Nagar & Gomti Nagar Extension",
  "226028": "Faizabad Road (Chinhat / Kamta / BBD)",
  "226002": "Sultanpur Road (Arjunganj / Shaheed Path)",
};

export const SERVICEABLE_PIN_COORDS: Record<string, { lat: number; lng: number }> = {
  "226030": { lat: 26.7824, lng: 81.0112 },
  "226010": { lat: 26.8547, lng: 80.9992 },
  "226028": { lat: 26.8398, lng: 81.0264 },
  "226002": { lat: 26.8124, lng: 80.9521 },
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

// Default delivery location strictly locked to Launch Zone #1 (226030 - Sushant Golf City).
const DEFAULT_LOC: DeliveryLocation = {
  pincode: "226030",
  area: "Sushant Golf City & Sultanpur Road",
  city: "Lucknow",
  fullLabel: "Lucknow — Sushant Golf City & Sultanpur Road",
  lat: 26.7824,
  lng: 81.0112,
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

  const masterSync = useSafeCononMasterSync();

  const isServiceable = useCallback(
    (pin: string) =>
      checkPincodeServiceability(pin, masterSync?.state.globalControls?.serviceability).serviceable,
    [masterSync?.state.globalControls?.serviceability]
  );

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
