---
name: CONON virtual cart item ids
description: Length constraint when adding non-DB (virtual) products to the cart in the conon app
---

# Adding virtual products to the CONON cart

The `cart_items` table caps `material_id` at `varchar(50)` (also `category` 50, `unit` 30). When adding a product that is NOT a real DB material row (a "virtual" id, where the server honors the passed name/price/vendor), the `materialId` you send must be ≤ 50 chars or the POST /api/cart insert 500s with "value too long for type character varying(50)".

**Why:** The home page helper `addProductToCart` derives the virtual id via `productSlug(category, name)`, which slugifies the full product *name*. Long marketing titles (e.g. "First-Class Red Clay Bricks, Kiln Fired, Uniform Size — Pack of 1000") produce a slug well over 50 chars and overflow the column. The DB error surfaces the *vendor* value in the message, which is misleading — the real culprit is the long `material_id`.

**How to apply:** For any catalog with long titles, pass a short, stable, hand-authored `materialId` (e.g. the product's own `id` slug) directly to `addToCart.mutate({ data: { materialId, quantity, name, price, unit, vendor, category } })` instead of routing through `productSlug(category, longTitle)`. Keep ids descriptive but well under 50 chars.

## Cart line price is capped at ₹1,00,00,000

`AddToCartBody` (shared `@workspace/api-zod`) validates `price <= 10_000_000`, and `cart_items.price` is `decimal(10,2)` (max 99,999,999.99). High-value virtual items (e.g. a turnkey "builder kit" priced on built-up area) overflow this and the POST /api/cart 400s with a zod `too_big` on `price`.

**Why:** The cap lives in the shared zod, not the feature page — easy to miss until a large computed total fails at runtime.

**How to apply:** When a feature computes a potentially-large cart price, clamp it (`Math.min(10_000_000, total)`) so the displayed value matches what is actually added. Do NOT widen the shared zod/schema for one feature.
