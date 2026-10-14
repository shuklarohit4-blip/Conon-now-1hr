---
name: Vendor data is scoped by store name — must stay unique
description: Why users.vendorStore is the authz key for /vendor/* and must be unique
---

In CONON, vendor `/vendor/*` access is scoped by `users.vendorStore` (a store-name
string that also links materials.vendor / orders.vendor). Because it is the
authorization key, it MUST be globally unique — exactly one user per store.

**Why:** Code review blocked a release where vendor signup assigned a free-form
store name without uniqueness, so a second vendor could register with an existing
store name, pass `requireVendor`, and read/mutate another store's inventory,
orders, and wallet (broken access control / IDOR).

**How to apply:** Enforced by a unique index on `users.vendor_store` (NULLs are
distinct, so non-vendors are unaffected) AND a server-side conflict check at OTP
vendor signup/promotion that returns 409 when the requested store already belongs
to a different user. An existing vendor re-logging into their own store is allowed.
Never key vendor authorization on a mutable/display value that users can freely
claim without a uniqueness guarantee.
