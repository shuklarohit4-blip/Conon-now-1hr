---
name: CONON product image source of truth
description: Why product images are resolved from a local curated map, not the API's imageUrl
---

# Product images: prefer local resolver over API imageUrl

Both `conon` and `conon-store` consume the same `/api/materials`. Its `imageUrl`
is a **generic per-category Unsplash URL that is frequently mismatched** (e.g.
steel → wrenches, aggregate → a farm field). It loads fine, so an `onError`
fallback never fires — the wrong-but-valid image just shows.

**Rule:** For accurate product imagery, resolve from the curated local map
(`resolveProductImage(category, name)` → bundled `/public/products/*.jpg`), and
do **not** use `material.imageUrl` as the display source. Photos live in each
app's own `public/products/` (conon-store's copy was taken from conon's proven set).

**Why:** The API URLs are domain-generic and visibly wrong; curated local
assets are accurate, reliable, and need no network/hotlink. This was a
deliberate override.

**How to apply:** When rendering material/product images in either app, route
through the shared `ProductImage` component / `resolveProductImage` resolver.
If someone reintroduces `material.imageUrl` as the primary src, expect
mismatched stock photos to return.
