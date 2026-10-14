---
name: idempotent lazy-seeding in GET handlers
description: How to lazily seed per-vendor demo data (catalog, earnings) safely on read so it survives concurrent first-hit requests.
---

# Idempotent lazy-seeding on read

CONON vendor data (inventory catalog, wallet earnings) is scoped by `vendor = vendorStore`, so a brand-new vendor has empty inventory and ₹0 wallet, which breaks the demo happy path (Update Inventory / Withdraw Money). Fix: lazy-seed on first `GET` (`/vendor/inventory`, `/vendor/wallet`) when the store has no rows yet.

**Rule:** any lazy seed inside a GET handler MUST be idempotent under concurrency.

**Why:** a check-then-insert (`select ... limit 1`, then insert with random UUIDs + `onConflictDoNothing`) is NOT safe — two parallel first-hit requests both pass the empty check, and random IDs never collide, so the seed is inserted twice and the balance/inventory doubles.

**How to apply:** give seed rows *deterministic* per-store `externalId`s (e.g. `seed-${sha1(store).slice(0,10)}-${i}` for orders, `v-${slug}-${key}` for catalog) and insert with `onConflictDoNothing`. The unique index then dedupes concurrent inserts. Keep the existence check only as a cheap fast-path, not for correctness. Verified with 5 parallel wallet GETs all returning exactly ₹45,500.
