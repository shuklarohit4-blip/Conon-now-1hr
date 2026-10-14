---
name: Global overlay route suppression
description: App-level overlays mounted outside the router switch leak onto new role routes unless explicitly suppressed.
---

In CONON (`artifacts/conon`), `<LocationConfirmSheet />` is mounted once in `App.tsx`
outside the Wouter route switch, so it can appear over ANY page. It self-suppresses
on non-customer routes via a prefix regex (`/^\/(vendor|admin|login|driver)(\/|$)/`).

**Rule:** when you add a new top-level role/section route (e.g. `/driver`), add it to
that suppression regex or the customer "Where should we deliver?" sheet will overlay it.

**Why:** the location prompt is a customer-only onboarding flow; it auto-opens when no
delivery location is confirmed, regardless of route.

**How to apply:** search for the suppression regex in `LocationConfirmSheet.tsx` and any
other globally-mounted overlay/provider whenever introducing a new route family.

Related, separate lesson: a "permanent"/always-available UI control must not live only
in a header that gets unmounted during full-screen states. The driver EN|हिंदी toggle
was extracted into a shared `LanguageToggle` and ALSO rendered as a floating overlay
during the full-screen Active Trip / Success screens so it stays reachable everywhere.
