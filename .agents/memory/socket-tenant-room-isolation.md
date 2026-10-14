---
name: Socket.io singleton room tenant isolation
description: Why a shared client socket must explicitly leave tenant rooms on logout/account switch, and how the server must enforce it.
---

# Singleton Socket.io client + per-tenant rooms leaks across account switch

The CONON web client uses ONE module-singleton Socket.io connection (`artifacts/conon/src/lib/realtime.ts`, `getSocket()`). Vendor dashboards join a private room (`vendor:<store>`) to receive `new-order-received`. Because the socket is shared and survives navigation, joining a room is sticky: logging out and logging back in as a different vendor in the same browser tab reuses the same socket, so it stays subscribed to the previous vendor's room and starts receiving another tenant's order events.

**Why:** Room membership lives on the long-lived connection, not on the React component. A `useEffect` cleanup that only removes listeners (or only `socket.off('connect', ...)`) does NOT leave the server-side room. Server `socket.join(room)` with no corresponding leave/re-auth flow means stale membership persists across auth changes — a real cross-tenant data exposure.

**How to apply:** For any per-tenant (vendor/org/user) room on a shared client socket:
- Client: on cleanup/logout emit an explicit `leave-<scope>` event (and `socket.off` the reconnect re-join handler). Re-emit join on every `connect` because rooms are dropped on reconnect.
- Server: track the currently-joined room in `socket.data` (e.g. `vendorStore`), leave the prior room before joining a new one on re-auth, and handle an explicit `leave-<scope>` event. Resolve the tenant scope from the DB by verified JWT `sub`, never from a token claim.
- Regression test pattern: one client socket, `join` as A then `join` as B, trigger an A-scoped emit (assert NOT received) and a B-scoped emit (assert received). Mint vendor JWTs with `process.env.JWT_SECRET` (HS256) and hit `/api/vendor/orders/simulate` to drive `emitNewOrder`.
