import { LiveOrderTracking, type TrackedOrder } from "@/components/LiveOrderTracking";

/**
 * Demo order for the live tracking screen. The warehouse (origin) is a fixed
 * dummy depot; the destination is the address the user selected at checkout /
 * on the home location picker (falling back to a demo site). The driving route
 * between them is drawn via the secure server-side Directions proxy.
 */
const DEMO_ORDER: TrackedOrder = {
  id: "CON-28471",
  vendorName: "CONON Warehouse — Charbagh",
  origin: { lat: 26.8276, lng: 80.9072, label: "CONON Warehouse, Charbagh" },
  destination: { lat: 26.8512, lng: 80.9462, label: "Construction Site, Hazratganj" },
  driver: {
    name: "Rajesh Kumar",
    truckNumber: "UP32 GT 4521",
    phone: "+919876543210",
    rating: 4.8,
    trips: "1.2k",
  },
};

/** Resolve the delivery destination from the user's saved address, if any. */
function loadSavedDestination(): TrackedOrder["destination"] | null {
  try {
    const raw = localStorage.getItem("conon_last_address_coords");
    if (raw) {
      const c = JSON.parse(raw);
      if (typeof c?.lat === "number" && typeof c?.lng === "number") {
        return { lat: c.lat, lng: c.lng, label: c.label ?? "Delivery Address" };
      }
    }
    const loc = localStorage.getItem("conon_location_v3");
    if (loc) {
      const l = JSON.parse(loc);
      if (typeof l?.lat === "number" && typeof l?.lng === "number") {
        return { lat: l.lat, lng: l.lng, label: l.fullLabel ?? "Delivery Address" };
      }
    }
  } catch {
    /* ignore malformed storage */
  }
  return null;
}

export function LiveTracking() {
  const destination = loadSavedDestination() ?? DEMO_ORDER.destination;
  const order: TrackedOrder = { ...DEMO_ORDER, destination };
  return <LiveOrderTracking order={order} />;
}
