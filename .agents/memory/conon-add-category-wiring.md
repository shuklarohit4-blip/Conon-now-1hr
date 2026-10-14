---
name: CONON — adding a new storefront category touches several places
description: A new product category in Home.tsx is only fully wired when every one of these spots is updated; missing one leaves it half-broken.
---

To add a new product category to the CONON storefront (`artifacts/conon/src/pages/Home.tsx`),
update ALL of these — they are independent and easy to miss individually:

1. `ALL_BRAND_DATA[<dbCategory>]` — the brand/product data (drives `getCategoryProducts`).
2. `HOMERUN_CATEGORIES` — the home-page category tile (slug + dbCategory + tile image).
3. `STOREFRONT_CATEGORIES` — the left rail list; if omitted the category opens but the
   rail can't highlight/select it (no active state).
4. `CAT_CONFIG[<dbCategory>]` — label/icon/hinglish used by `getCatLabel` and the rail.
5. `resolveProductImage`'s `switch (c)` — a `case "<dbCategory>"` mapping product names to
   local images, or every item falls through to a generic.

**Why:** UI category identity is spread across these 5 structures rather than one registry,
so a new category typecheck-passes while being visually incomplete (e.g. no rail highlight).

**How to apply:** when adding/removing a category, grep for the old/new dbCategory string
across all 5 and keep slug == dbCategory for the new one to avoid mapping confusion.
