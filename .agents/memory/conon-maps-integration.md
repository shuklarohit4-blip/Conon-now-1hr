---
name: CONON Google Maps integration
description: How CONON wires Google Maps — server-side Places proxy vs client-side map renderer; what "invalid API key" really means here.
---

# CONON Google Maps integration

CONON already has a complete Google Places location flow. Do NOT rebuild it with a
client-side autocomplete (`@react-google-maps/api` Autocomplete / `react-places-autocomplete`).

- **Places autocomplete/details/directions = server-side proxy.** Client calls
  `${BASE_URL}api/maps/places/autocomplete`, `/details`, `/directions` (see `lib/mapsApi.ts`);
  the api-server (`routes/maps.ts`) attaches `process.env.GOOGLE_MAPS_API_KEY` and forwards to
  Google. The key NEVER reaches the browser. UI component: `AddressAutocomplete.tsx`, used by
  `LocationConfirmSheet.tsx` (opened from the header location button via `openLocationSheet()`)
  and `CheckoutDialog.tsx`. Selection → `confirmLocation()` updates `LocationContext`.
- **Live map *rendering* = client-side.** `LiveOrderTracking.tsx` uses `@react-google-maps/api`
  with `import.meta.env.VITE_GOOGLE_MAPS_API_KEY` (a Maps JS map genuinely needs a browser key).
- So BOTH secrets are legitimately needed; the SAME Google key value works for both. Enable
  Places API, Maps JavaScript API, Geocoding, Directions; no HTTP-referrer restriction (server
  calls have no referrer).

**Why:** A request to "add Places autocomplete with VITE_GOOGLE_MAPS_API_KEY" looks like new work
but it's already built more securely. The trap is duplicating it client-side and leaking the key.

**Gotcha — "The provided API key is invalid":** that string is Google's response to the proxy,
i.e. the *key value* is bad/missing, not a code bug. Secrets are injected into workflows only
(not the interactive bash shell, not the code_execution sandbox via `process.env`). To test key
validity, add a temp route in the api-server (build-once dev → restart after edits) that calls
Google and returns only the status, then remove it. `viewEnvVars({type:"secret"})` only reports
existence (true/false), never values.
