---
name: Testing backend artifacts locally
description: Why curl to the dev domain fails and how to test the api-server directly
---

The Replit dev domain ($REPLIT_DEV_DOMAIN) is served through an mTLS proxy, so
plain `curl` to it returns HTTP 000 / empty — it is NOT a sign the server is down.

**How to apply:** To test the Express `api-server` from the shell, curl its
internal port directly: `curl http://localhost:8080/api/...`. The api-server is
reverse-proxied under the web app's base path at `/api/*` (frontend calls
`${import.meta.env.BASE_URL}api/...`). In-browser calls go through the proxy fine;
only shell curl needs the direct localhost:PORT.
