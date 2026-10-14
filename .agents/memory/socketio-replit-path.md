---
name: Socket.io on Replit path-router
description: Why Socket.io must mount under /api/socket.io in this monorepo, and the Maps client-key constraint.
---

# Socket.io must mount under `/api/socket.io`

On the Replit path-router for this monorepo, **only `/api/*` is proxied to the API
service**. Socket.io's default path `/socket.io` is NOT proxied, so the browser
handshake 404s.

**Rule:** mount the Socket.io server with `path: "/api/socket.io"` and connect the
client to `window.location.origin` with the same `path`. Same-origin means no CORS
negotiation is needed (leave `cors.origin` false unless a real cross-origin client
exists). Add `withCredentials: true` on the client so the `_sid` session cookie
rides along for authorization.

**Why:** the path router decides routing purely by URL prefix; a non-`/api` path
hits the web artifact, not the API server.

**How to apply:** any websocket/SSE/long-poll endpoint added to `api-server` must
live under `/api/...`. Verify with
`curl "https://$REPLIT_DEV_DOMAIN/api/socket.io/?EIO=4&transport=polling"` → expect
`200` + a `sid` payload.

# Socket authorization mirrors the anonymous `_sid` session

The app has no real login — identity is an anonymous `_sid` cookie and orders are
owned by that session. Socket `track-order` / `driver-location-update` therefore
authorize by looking up the order's `sessionId` and matching the socket's cookie.
Orders absent from the DB (the hard-coded demo order) are allowed in dev only
(`NODE_ENV !== "production"`) so the showcase works while prod stays locked.

# Google Maps browser key

The Maps JS key must be named `VITE_GOOGLE_MAPS_API_KEY` (Vite only exposes
`VITE_`-prefixed vars to the client). It is inherently public (shipped to the
browser), so it must be restricted by HTTP referrer in Google Cloud and have Maps
JavaScript + Directions + Distance Matrix APIs enabled. `InvalidKeyMapError` at
runtime is always a Google Cloud config problem (referrer / API-not-enabled /
billing), never a code bug.
