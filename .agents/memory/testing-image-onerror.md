---
name: Testing image onError fallbacks in e2e
description: How to reliably trigger an <img> error event in the Playwright e2e sandbox to verify onError fallbacks
---

# Triggering <img> onError in e2e

To verify an image `onError` fallback in the e2e/Playwright sandbox, set the
`img.src` to an **undecodable data URI** (e.g. `data:image/png;base64,iVBORw0KGgoBROKEN==`).
This fires the `error` event **instantly** and is network-independent.

**Why:** pointing `img.src` at an unreachable external host (e.g.
`https://example.com/broken.jpg`) does NOT work — outbound requests to such hosts
**hang/pend** in the sandbox rather than returning an error, so the `error` event
never fires within the test wait window and the fallback appears "broken" when it
actually works. A same-origin 404 also works but can be served the SPA index.html
(200) by the dev server; the bad-data-URI approach avoids that ambiguity.

**How to apply:** when a force-fail image test shows zero fallbacks AND zero other
changes (e.g. no React unmounts either), suspect the request is hanging, not that
the handler is broken. Switch to the bad-data-URI source and re-test.
