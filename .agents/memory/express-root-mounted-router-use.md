---
name: Express root-mounted router.use gating
description: A bare router.use(mw) inside a router mounted at "/" runs for ALL requests, not just that router's routes.
---

# Bare `router.use(middleware)` in a root-mounted router is effectively global

When a sub-router is mounted at the app root (`app.use(adminRouter)` with no path
prefix), a bare `router.use(requireAdmin)` inside it runs for **every** request
that flows through that router — including routes defined in *other* routers that
are mounted *after* it. Express middleware with no path matches `/`, which matches
everything.

**Symptom seen:** after adding admin gating, vendor routes (`/api/vendor/*`,
mounted after the admin router) started returning `401 "Invalid or expired admin
session"` — the admin error, on a non-admin route. Routers mounted *before* the
admin router (auth, materials, cart, mandi) were unaffected because they respond
before the request reaches the admin router.

**Fix:** scope the guard to the path prefix the router actually owns:
`router.use("/admin", requireAdmin)` instead of `router.use(requireAdmin)`.

**Why:** mount order + bare `use` made one router's auth a near-global gate.
**How to apply:** when gating a whole router with `router.use(mw)`, confirm the
router is mounted with its own path prefix; if it's mounted at root, scope the
middleware to its path (`router.use("/prefix", mw)`) or apply per-route.
