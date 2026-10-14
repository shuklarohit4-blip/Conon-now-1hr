---
name: CONON z-index layering bands
description: Which z-index band the pinned header vs modals/overlays must occupy in the conon web app shell
---

# CONON shell z-index layering

The conon app shell (`artifacts/conon/src/components/Layout.tsx`) renders the pinned
top region (MandiTicker + green delivery header) as a sticky flex sibling **above**
an inner-scroll `<main className="flex-1 overflow-y-auto">`.

**Rule:** the pinned header region must stay in a **low** z-band (currently `z-30`),
**below** every blocking overlay. All modals/sheets live at **z-40+** (cart, menu
drawer, location gate, payment sheet, AR/voice flows, etc.).

**Why:** because the header is a flex sibling over an inner scroll container, it never
overlaps page content no matter its z-index — z only matters relative to `fixed`
overlays. A previous high value (`z-[100]`) made the header punch *through* modals
(it rendered on top of the "Where should we deliver?" location gate on first load).

**How to apply:**
- Keep the pinned header below 40. Reserve 40+ for overlays that must cover the header.
- Do NOT convert the header to `position: fixed` with `left-0 right-0` — that spans the
  full desktop viewport and breaks the centered `max-w-[480px]` phone frame. A fixed
  header would also need a magic-number spacer; the flex-sibling + inner-scroll model
  needs none.
- `GlobalLoader` owns `z-[9999]` (top progress bar) — never reuse that for the header.
