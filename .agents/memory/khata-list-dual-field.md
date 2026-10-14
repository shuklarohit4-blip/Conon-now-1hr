---
name: Khata list dual-field contract
description: Why /admin/khata returns both clamped `pending` and signed `outstanding`, and the printable-HTML escaping rule.
---

# Khata list endpoint: `pending` vs `outstanding`

`GET /admin/khata` (api-server admin route) must return BOTH:
- `pending` — clamped to `>= 0`.
- `outstanding` — the true **signed** balance (negative = customer is in advance/credit).

**Why:** the older AdminDashboard KhataModule sums `pending` as "Total Outstanding". If an
advance account exposes a negative value there, it silently nets the org-wide total down.
The newer KhataManager page needs the signed value to render "Advance" (green, `+₹`) vs
"Outstanding". So the two consumers need different shapes from the same payload.

**How to apply:** when adding fields or changing the khata list item, keep `pending` non-negative
for legacy consumers and put any signed/true balance under a distinct key. Summary/active-account
counts also clamp with `Math.max(0, outstandingOf(c))`.

# Printable statement/invoice are server-rendered HTML — escape everything

`GET /admin/khata/:id/statement` and `/invoice` interpolate values into a `text/html` page that
opens in a browser tab. Free-text from `POST .../payment` (`reference`, `proofName`, `mode`) lands
in ledger descriptions, so it reaches that HTML.

**Why:** without escaping this is stored XSS in the rendered statement.

**How to apply:** HTML-escape every interpolated string (descriptions, names, phone, ids) with the
`esc()` helper, allowlist `mode`, and strip/length-cap free-text on write. Numbers are safe.
