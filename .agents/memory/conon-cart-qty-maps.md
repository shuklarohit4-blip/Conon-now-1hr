---
name: CONON cart qty display vs mutation map
description: Why the storefront stepper's qty-display map and its mutation-target map must be one structure.
---

# CONON cart qty maps must share one source

The −/qty/+ stepper across product surfaces (Home, Categories) needs both the
**displayed quantity** for a product and the **cart line id(s)** to mutate. These
must come from a single map keyed by `category::name` (lowercased) that aggregates
BOTH the summed quantity AND every matching line id (`{ ids: string[], quantity }`).

**Why:** Earlier code had two separate maps — one that *summed* quantities across
matches and one that kept only the *first* matching id. When the same
`category::name` existed as multiple cart lines, the stepper displayed the summed
qty but updated/removed only one line, so display and mutation diverged.

**How to apply:** `getCartQty` reads `entry.quantity`; `setProductQty` updates the
primary id to the new qty and removes `entry.ids.slice(1)` so the key collapses to
a single line. Keep this shape if you add the stepper to another page.
