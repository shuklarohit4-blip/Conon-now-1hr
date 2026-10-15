# Render Backend Deployment Design

> **Superseded:** This initial design proposed Render PostgreSQL. The approved [MongoDB Atlas migration design](2026-10-15-mongodb-atlas-migration-design.md) replaces that database plan; use the current [Render deployment guide](../../render-deployment.md) and `render.yaml` for setup.

**Date:** 2026-10-15  
**Status:** Approved direction; awaiting user review before implementation

## Goal

Deploy the existing Express API in `artifacts/api-server` to Render, provide a managed PostgreSQL database, and connect the existing Vercel frontend to that API without exposing server secrets.

## Selected approach

Use a Render Blueprint (`render.yaml`) at the monorepo root to declare one Node web service and one PostgreSQL database. Build from the repository root so pnpm workspace dependencies resolve; build the API with the existing `@workspace/api-server` script and start its compiled entrypoint. Configure Render's health check to call `/api/healthz`.

The Blueprint will link the database URL to the API service and set non-secret runtime configuration. Secret credentials will be supplied through Render's dashboard, never committed to the repository. Required server configuration includes `JWT_SECRET`, `ALLOWED_ORIGINS`, and the platform-provided `DATABASE_URL`. Integration credentials such as `MSG91_AUTH_KEY`, `GOOGLE_MAPS_API_KEY`, `FIREBASE_WEB_API_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `REPL_ID` will be treated as optional until the corresponding feature is enabled. The existing Replit OIDC login remains conditional on a working Replit client registration and external callback URL.

## Frontend/API integration

The frontend currently sends REST requests to its own origin and opens Socket.IO at that same origin. Add a build-time API base URL for the Render service, and use it consistently for REST, auth, maps, and Socket.IO. The API will allow the Vercel origin through `ALLOWED_ORIGINS`; credentials remain enabled where required.

Because the current Vercel and Render hostnames are cross-site, anonymous cookie-backed cart/order sessions must be tested in a real browser. Prefer a custom API hostname under the same registrable domain as the frontend (for example, `api.cononinfrabuilt.com`) if that domain is configured. If unavailable, use secure cross-site cookies and verify browser support; do not claim session-dependent flows are live until they pass that test.

## Database setup

Provision Render PostgreSQL and apply the repository's Drizzle schema using the existing database package's push command as a one-time deployment/setup step. Avoid destructive force-push. Validate a successful database connection separately from the lightweight `/api/healthz` liveness response.

## Validation and release

1. Verify the workspace install, API build, and API typecheck locally.
2. Deploy the Blueprint using Render's GitHub integration, then verify Render reports the service healthy and `/api/healthz` returns `{ "status": "ok" }`.
3. Verify CORS preflight and key API routes from the Vercel origin, including a cookie-backed session and Socket.IO connection.
4. If required secrets or Render account permissions are unavailable, complete the repository setup and provide exact dashboard steps; never request secrets in chat or commit them.

## Alternatives considered

- **Manual Render dashboard setup:** fewer repository files, but service settings and database wiring are less reproducible. Not selected.
- **Docker-based deployment:** offers more runtime control but adds an unnecessary container layer for the existing Node/pnpm service. Not selected.

## Scope and constraints

- Keep the current Express routes and authentication model; do not rewrite auth as part of deployment setup.
- Do not change the existing Vercel framework/build configuration.
- Do not expose private API keys as `VITE_*` variables.
- Do not add DNS records or alter domain ownership; custom-domain wiring requires access to the user's DNS/Vercel/Render settings.
- A Render deployment cannot be completed from the repository alone if Render account authorization, connected GitHub access, provider credentials, or DNS access are not available.
