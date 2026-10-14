---
name: conon product image system
description: How product item photos are resolved/displayed across the conon app, and the location-gate gotcha that blocks app-preview screenshots.
---

# conon product images

Product items in `artifacts/conon` (CementCatalog, BrandCatalog, MaterialList) get a photo via
`resolveProductImage(category, name)` — a keyword resolver mapping each product to one of ~60 local
photos stored in `artifacts/conon/public/products/<slug>.jpg`, referenced as
`${import.meta.env.BASE_URL}products/<slug>.jpg` (BASE_URL is `/`).

**Decision:** representative-photo-per-material-subtype, clean white-studio product shots produced by
`generateImage` (media-generation), NOT brand-exact, NOT web-scraped.
**Why:** user chose reliability ("no broken images") + "correct category photos everywhere" over per-
product brand accuracy; 600+ products make brand photos impractical. `stockImage` (media-generation)
returned WILDLY irrelevant results for India construction terms (chess pieces→"pop", keys→"sand",
autumn leaves→"earthing") and `imageSearch` downloads kept failing (CDN blocks) — `generateImage` with a
strict prompt suffix ("single product centered, clean light grey seamless studio background, no text/logo")
is the reliable path. Keep new products consistent: add a subtype photo (generate .png → `magick` convert
to 600x600 .jpg in public/products) + a keyword branch; don't hotlink external URLs.

**How to apply / gotchas:**
- AUDIT the whole library fast with an ImageMagick labeled montage:
  `montage -label '%t' -font /usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf -pointsize 14 -fill black
  -background white *.jpg -tile 7x -geometry 130x105+4+3 out.png` — then `read` the png. `-label` MUST
  precede the input glob or labels silently don't render; a real font path is required (default font errors).
- Substring matching pitfall: `has("polish")` wrongly matched tile names containing "Polished" → routed to
  the cleaner image. Prefer multi-word tokens ("tile polish") over bare substrings that appear inside
  legit product words. Same risk class: `has("adh")`, `has("glass")`.
- Resolver order matters: check specific subtypes before generic (plumbing "mixer/cock/faucet" before
  "basin"; paint "gloss/enamel" + "distemper" + "texture" before the "paint-bucket" fallback).
- A category's photo % being high is fine when that subtype genuinely dominates — not a bug.

**Preview gotcha:** the conon `/home` route shows a "Where should we deliver?" location gate
(`LocationConfirmSheet`) before product sections render. The `app_preview` screenshot tool cannot click
through it, so visual verification of product lists isn't possible via screenshot alone — use the testing
(Playwright) skill to click past the gate, or verify via typecheck + HTTP 200 on `/products/*.jpg` +
programmatic resolver distribution check.
