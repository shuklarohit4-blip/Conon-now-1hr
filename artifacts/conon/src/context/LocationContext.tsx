import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

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
  area: "All Areas",
  city: "Lucknow",
  fullLabel: "Lucknow — All Areas",
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
  reverseGeocode: (lat: number, lng: number) => Promise<{ pincode: string; area: string; city: string } | null>;
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
    const confirmed = { ...loc, confirmed: true };
    setLocation(confirmed);
    setShowLocationSheet(false);
  }, [setLocation]);

  const openLocationSheet  = useCallback(() => setShowLocationSheet(true), []);
  const closeLocationSheet = useCallback(() => setShowLocationSheet(false), []);

  const isServiceable = useCallback((pin: string) => pin in SERVICEABLE_PINS, []);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { "Accept-Language": "en" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const pincode = data?.address?.postcode?.replace(/\s+/g, "");
    if (!pincode || !/^\d{6}$/.test(pincode)) return null;
    const area = SERVICEABLE_PINS[pincode] ?? data?.address?.suburb ?? data?.address?.neighbourhood ?? "";
    const city = data?.address?.city ?? data?.address?.town ?? "Lucknow";
    return { pincode, area, city };
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
