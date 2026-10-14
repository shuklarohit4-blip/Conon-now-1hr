---
name: CONON brand-variant → detail modal cart identity
description: Why synthesized Products from brand-sheet variants must share cart identity with the row "+ Add" button, and the addFeedProduct price-guard asymmetry.
---

# Brand-sheet variant → ProductDetailModal

CONON's brand product-list bottom sheets (CementCatalog + generic BrandCatalog in Home.tsx) render lightweight variant objects (`{name, price, pack, tag, type?}`), not full `Product`s. To open the shared `ProductDetailModal` from a variant, a helper synthesizes a full Product.

**Rule:** the synthesized Product's cart identity MUST match the row's "+ Add" button or the two add-paths create duplicate/mismatched cart rows and the qty badge desyncs.
- `id` = `brand-<category>-<slug(name)>` (same string `productSlug` builds for `addProductToCart`).
- `materialTag` = the raw category key (e.g. `"cement"`), `title` = `prod.name`.
- Then `getCartQty(materialTag, title)` and `addFeedProduct(materialId=p.id, category=p.materialTag)` resolve to the SAME row as the row button's `onAddProduct({category, name})`.

**Why:** the two add code paths are separate (`addProductToCart` for rows, `addFeedProduct` for the detail modal). They only converge if identity inputs are kept in lockstep by hand.

**Guard asymmetry:** `addProductToCart` validates `price > 0`; `addFeedProduct` historically did not. Synthesized prices come from parsing `"₹410"`-style text and can be 0 on malformed data — `addFeedProduct` must guard `price > 0` too, else a zero-price add slips through the modal path.

**Synthesized fields** (rating/reviews/description/specs/features) are templated and acceptable for "item-specific detail" — set `mrp = price` so the modal hides the fabricated-discount UI (it only shows MRP/discount when `mrp > price`).

**Scope:** SteelCatalog uses a different rich non-brand flow and is intentionally NOT wired to the image→detail behavior.
