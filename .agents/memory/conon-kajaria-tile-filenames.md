---
name: CONON Kajaria tile asset filenames are mislabeled
description: Two Kajaria 4×2 tile photos in attached_assets are named opposite to the tile they actually show; the imports look "wrong" on purpose.
---

In `artifacts/conon/src/pages/Home.tsx`, the Kajaria GVT/PGVT image imports intentionally
cross the filenames:

- `imgKajariaGvt` imports the file named `Kajaria_pGVT_4×2_ft_...png` (the photo actually shows a GVT tile).
- `imgKajariaPgvt` imports the file named `Kajaria_GVT_4×2_ft_...png` (the photo actually shows a PGVT tile).

**Why:** the source brand photos provided by the user have their printed labels swapped, so
matching the import variable to the *filename* would put the wrong picture on the product.
The crossed mapping makes the rendered image match the product name.

**How to apply:** do NOT "tidy" these imports to make the variable name match the filename —
that re-introduces the bug. The variable name reflects the visible tile, not the filename.
Filenames also contain a real U+00D7 "×" character (not a plain "x"); bash/rg may mangle it,
so trust the `read` tool / editor over shell output when touching these lines.
