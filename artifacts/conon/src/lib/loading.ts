/**
 * Tiny global loading store. Axios interceptors bump the in-flight counter on
 * every request and the <GlobalLoader> subscribes to render a top progress bar
 * whenever any request is pending.
 */
type Listener = (active: boolean) => void;

let inFlight = 0;
const listeners = new Set<Listener>();

function emit() {
  const active = inFlight > 0;
  for (const l of listeners) l(active);
}

export function beginLoading() {
  inFlight += 1;
  emit();
}

export function endLoading() {
  inFlight = Math.max(0, inFlight - 1);
  emit();
}

export function isLoading() {
  return inFlight > 0;
}

export function subscribeLoading(listener: Listener): () => void {
  listeners.add(listener);
  listener(inFlight > 0);
  return () => {
    listeners.delete(listener);
  };
}
