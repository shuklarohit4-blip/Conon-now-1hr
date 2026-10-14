---
name: CONON local-first images
description: Why CONON's storefront never renders remote image URLs and how material images are resolved.
---

# CONON storefront images are local-first

The storefront (categories, products, rental fleet, checkout "you might also like")
must render images from LOCAL assets only — never a remote URL.

**Why:** a stale/hallucinated remote stock-photo host (e.g. Unsplash) can HANG
forever without ever firing the `<img>` `onError` event, so an `onError` fallback
does NOT protect against it — the box stays permanently blank. Only a local src
(or the inlined SVG data-URI fallback) is safe.

**How to apply:**
- The materials API (`api-server/src/routes/materials.ts` `resolveImage`) strips any
  `http(s)://` value to `""`. This neutralises legacy/remote URLs already in the DB
  for EVERY consumer, so the fix lives at the boundary, not per-component.
- Never seed remote URLs into `materialsTable.imageUrl` (vendor seed catalog stores
  `""`).
- Client resolves the real photo locally: `categoryPhoto(category)` (shared in
  `conon/src/lib/imgFallback.ts`) maps a DB category → `/public/products/<slug>.jpg`;
  `resolveProductImage(category, name)` in `Home.tsx` does brand-level matching.
- Any new component that renders a material image must use a local resolver +
  `CononImage`/`onImgError`, never raw `material.imageUrl` in a bare `<img>`.
- Decorative non-store pages (ProjectTimeline, DesignersHub) still use Unsplash but
  are out of this scope and guarded by `onImgError`.
