---
name: image-search downloads in code_execution
description: How to reliably download imageSearch results into attached_assets from the JS sandbox
---

When downloading `imageSearch` results to `attached_assets/` from the code_execution sandbox:

- Prefer `result.thumbnail.src` (Brave-hosted CDN, e.g. `imgs.search.brave.com`) as the download URL. It is hotlink/CORS friendly and reliably returns 200 image/*. The original `result.properties.url` points at the source site (e.g. machineryline/linemedia) which frequently 403s or hangs on direct fetch.
- Send a browser `User-Agent` header on the fetch.
- Fall back to `properties.url` only if the thumbnail fetch fails.

**Why:** direct source image URLs block server-side hotlinking; the Brave thumbnail CDN does not. Thumbnails are ~500px wide — fine for card/tile imagery.

**Gotcha:** `AbortSignal.timeout(ms)` throws in this sandbox runtime, and if it's inside a try/catch the download fails silently (every item "FAILED" with no error). Do NOT pass a timeout signal to `fetch` here — omit it.
