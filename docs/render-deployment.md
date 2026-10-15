# Deploy the API to Render

The repository includes a root-level Render Blueprint, `render.yaml`, for the API service. MongoDB Atlas is provisioned separately; no PostgreSQL resources are created.

## Create the Render resources

1. In the Render Dashboard, create a new Blueprint from the GitHub repository `shuklarohit4-blip/Conon-now-1hr` and select the `main` branch.
2. Review the web service plan and price before applying. Free Render web services spin down while idle and are not suitable for production traffic.
3. Apply the Blueprint. It builds the API from the repository root and generates `JWT_SECRET`. It requests `MONGODB_URI` as a dashboard secret and sets `MONGODB_DATABASE=conon`.
4. In MongoDB Atlas, create a cluster, a dedicated database user with least-privilege access to the `conon` database, and a database named `conon`. Add the Render service's outbound IP addresses to Atlas Network Access. Avoid allowing access from `0.0.0.0/0` unless you knowingly accept that broader exposure and have strong database credentials.
5. Copy the Atlas SRV connection URI from Atlas and paste it directly into Render's `MONGODB_URI` environment variable field. Do not put the URI in Git, a build-time `VITE_*` variable, or chat. The API initializes its required unique and TTL indexes on startup; there is no SQL schema push step.
6. Copy the deployed service's public URL from Render. `/api/healthz` should return `{ "status": "ok" }` only after MongoDB Atlas is reachable.

## Point Vercel at Render

In the Vercel project for `conon`, add the following **production build** environment variable, replacing the value with the exact Render service origin (no trailing slash and no `/api`):

```text
VITE_API_BASE_URL=https://<render-service-host>
```

Redeploy the Vercel frontend after setting it. The frontend uses this origin for REST requests, auth, maps, admin downloads, and Socket.IO. The API Blueprint currently permits `https://conon.vercel.app` through `ALLOWED_ORIGINS`; add the exact production frontend origin in Render if it changes or a custom frontend domain is used.

## Optional integration credentials

Add these in Render only for features that are enabled; never put their values in Git or chat:

- `MSG91_AUTH_KEY` for server-verified MSG91 OTP.
- `FIREBASE_WEB_API_KEY` for Firebase token verification.
- `GOOGLE_MAPS_API_KEY` for server-side Maps proxy routes.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` for the production admin login.
- `REPL_ID` only if Replit OIDC login is configured for the Render callback URL. A valid Replit OIDC client registration must allow the external Render URL.

`MONGODB_URI` is a secret entered in Render; `MONGODB_DATABASE`, `JWT_SECRET`, `NODE_ENV`, and `ALLOWED_ORIGINS` are configured by the Blueprint.

## Cookie/session note

Production API cookies use `SameSite=None; Secure` for cross-origin credentialed requests. Browser third-party-cookie policies may still block anonymous cart/order sessions between `*.vercel.app` and `*.onrender.com`. For reliable production sessions, use a custom frontend domain and a matching API subdomain (for example, `app.cononinfrabuilt.com` and `api.cononinfrabuilt.com`), configure both domains in their providers, and test cookie-backed flows and Socket.IO in a real browser.

The Vercel project currently has Vercel Authentication / Deployment Protection enabled. Disable it in Vercel project settings if the frontend is intended to be publicly accessible.
