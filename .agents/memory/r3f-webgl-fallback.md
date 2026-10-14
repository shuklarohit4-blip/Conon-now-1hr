---
name: R3F WebGL fallback for headless/e2e
description: R3F Canvas crashes in headless test browsers without WebGL; ship a detect + CSS/SVG fallback so e2e and low-end webviews don't hit a blocking error overlay.
---

A `@react-three/fiber` `<Canvas>` throws a runtime-error overlay (blocking) when the
browser can't create a WebGL context — which is the case in the headless e2e test
browser and some low-end mobile webviews.

**Why:** The first e2e run of any R3F page failed not on logic but because the test
browser had no WebGL. The 3D flow itself was fine.

**How to apply:** Probe with a `detectWebGL()` helper (try `canvas.getContext("webgl")
|| "experimental-webgl"`, guard with try/catch and `typeof window`) memoized once,
and conditionally render `<Canvas>` vs a static CSS/SVG fallback component. Keep phase
progression timer-driven (independent of the Canvas) so the flow still advances and
the rest of the page (e.g. checkout) stays testable without WebGL.
