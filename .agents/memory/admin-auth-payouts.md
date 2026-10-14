---
name: Admin endpoints need server-validated auth
description: Why the CONON /admin/* router is JWT-gated and how admin auth is wired
---

The CONON admin panel login is a credential check that mints a server-signed
admin JWT; it is NOT a client-side-only role flag. Any admin endpoint that
mutates money or data (e.g. payout approval) must sit behind server-validated
authorization.

**Why:** Code review blocked a release where payout read/approve had no
server-side authz — the admin "login" only set a localStorage role and admin
routes were unauthenticated, so any caller could approve payouts.

**How to apply:** `requireAdmin` middleware (verifies JWT signature + role ===
"admin") is applied to the whole `/admin/*` router. The token comes from
`POST /api/auth/admin-login` (creds via ADMIN_EMAIL/ADMIN_PASSWORD env, demo
fallback). Frontend stores it under `conon_jwt` and sends it as a Bearer header.
Never gate a financial admin action on a client-supplied role claim alone.
