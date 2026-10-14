import { getSocket, type LatLng } from "@/lib/realtime";

/**
 * Dev-only driver simulator.
 *
 * There is no separate driver app in this environment, so to demonstrate the
 * full real-time round-trip we walk a vehicle along the route and emit
 * `driver-location-update` over the same socket. The server then broadcasts
 * `live-truck-tracking` back to everyone in the order room — exactly as a real
 * driver device would. This is intentionally gated behind `import.meta.env.DEV`.
 */
export interface DriverSimulator {
  stop: () => void;
}

const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

function bearing(a: LatLng, b: LatLng): number {
  const φ1 = toRad(a.lat);
  const φ2 = toRad(b.lat);
  const Δλ = toRad(b.lng - a.lng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/**
 * Densify a coarse route into closely-spaced points so the emitted GPS stream
 * looks like a vehicle actually driving (not teleporting between waypoints).
 */
function densify(path: LatLng[], stepsPerLeg = 6): LatLng[] {
  const out: LatLng[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    for (let s = 0; s < stepsPerLeg; s++) {
      const t = s / stepsPerLeg;
      out.push({
        lat: a.lat + (b.lat - a.lat) * t,
        lng: a.lng + (b.lng - a.lng) * t,
      });
    }
  }
  out.push(path[path.length - 1]);
  return out;
}

export function startDriverSimulation(
  orderId: string,
  route: LatLng[],
  opts: { intervalMs?: number; onFinish?: () => void } = {},
): DriverSimulator {
  const socket = getSocket();
  const points = densify(route);
  const intervalMs = opts.intervalMs ?? 1500;
  let i = 0;

  const tick = () => {
    if (i >= points.length) {
      window.clearInterval(timer);
      opts.onFinish?.();
      return;
    }
    const here = points[i];
    const next = points[Math.min(i + 1, points.length - 1)];
    socket.emit("driver-location-update", {
      orderId,
      lat: here.lat,
      lng: here.lng,
      heading: bearing(here, next),
      speed: 8 + Math.random() * 4,
    });
    i += 1;
  };

  tick();
  const timer = window.setInterval(tick, intervalMs);

  return {
    stop: () => window.clearInterval(timer),
  };
}
