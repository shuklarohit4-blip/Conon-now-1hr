# Threat Model

## Project Overview

CONON Infrabuilt is a pnpm-monorepo construction marketplace with a React + Vite frontend in `artifacts/conon`, an Express 5 API in `artifacts/api-server`, and a PostgreSQL database accessed through Drizzle in `lib/db`. Users can browse materials, manage carts, place orders, and book services. The deployed production scope is the web frontend, API server, generated shared client/schema packages, and the database layer.

Production-scope assumptions for this scan:
- `artifacts/mockup-sandbox` is dev-only and not deployed to production.
- Replit deployment terminates TLS for client↔server traffic.
- `NODE_ENV` is `production` in deployed environments.

## Assets

- **Order and delivery data** — order contents, delivery addresses, contact numbers, vendor names, timestamps, and totals stored in `orders`. Exposure reveals customer activity and location data.
- **Cart state and checkout integrity** — cart contents and quantities determine what gets purchased and charged. Cross-user modification can cause fraud or unintended purchases.
- **Service bookings** — service selections, booking dates, notes, and totals in `service_bookings` have business and user impact if abused or altered.
- **Operational/vendor data surfaced by the app** — vendor inventory, disputes, payouts, and delivery status become sensitive once connected to real operations.
- **Application secrets and database credentials** — `DATABASE_URL`, API keys, JWT signing keys, and any other backend secrets must stay out of tracked source/config files and be loaded from the deployment secret store.

## Trust Boundaries

- **Browser to API** — all frontend requests to `/api/*` cross from an untrusted client into the backend. Every read/write endpoint must treat the caller as untrusted and enforce authentication, authorization, and input validation.
- **API to PostgreSQL** — the Express server has broad database access via Drizzle. Any broken access control or injection at the API layer can expose or alter all tenant/user data.
- **Public versus authenticated application surfaces** — browsing materials may be public, but carts, orders, service bookings, vendor tools, and admin views require explicit server-side ownership or privilege enforcement if they represent real user data.
- **Production versus dev/demo surfaces** — `artifacts/mockup-sandbox`, generated previews, and attached assets are normally out of scope unless they become reachable from the deployed app. Demo-only UI behavior inside the production frontend still matters when it gates production routes or data.
- **Server to external services** — the frontend performs client-side geolocation and reverse-geocoding calls to OpenStreetMap; fallback product imagery hot-links Unsplash URLs. These are lower-risk than the core API/data boundary but still represent data leaving the platform.

## Scan Anchors

- **Production entry points:** `artifacts/api-server/src/index.ts`, `artifacts/api-server/src/app.ts`, `artifacts/conon/src/main.tsx`, `artifacts/conon/src/App.tsx`
- **Highest-risk code areas:** `artifacts/api-server/src/routes/*.ts`, `lib/db/src/schema/*.ts`, `artifacts/conon/src/components/CheckoutDialog.tsx`, `artifacts/conon/src/pages/Orders.tsx`, `artifacts/conon/src/pages/Login.tsx`, `artifacts/conon/src/context/UserContext.tsx`
- **Public surfaces:** `/api/materials`, `/api/mandi/prices`, SPA routes such as `/`, `/home`, `/login`
- **Authenticated/privileged candidates:** `/api/cart`, `/api/orders`, `/api/services`, `/api/admin/*`; frontend `/vendor`, `/admin`, `/orders`, `/profile`
- **Confirmed production-backed privileged surfaces:** `/api/admin/*` is publicly mounted server functionality and must always be audited for authentication, authorization, data exposure, and operator-only mutations
- **High-risk business-logic anchor:** `POST /api/orders/checkout` accepts both anonymous session context and B2B contractor identifiers, so checkout ownership and khata-credit binding must be reviewed whenever order logic changes
- **Current low-signal demo surfaces:** `/vendor` remains mostly frontend/demo-oriented unless future code adds production-backed vendor APIs or persistent mutations
- **Usually ignore unless proven reachable:** `artifacts/mockup-sandbox`, `attached_assets`, most of `scripts`, and development-only codegen inputs under `lib/api-spec`

## Threat Categories

### Spoofing

The application currently presents customer, vendor, and admin concepts, so it must reliably distinguish anonymous users from authenticated users and privileged operators. Any route that reads or mutates cart, order, vendor, or admin data must require a real user or service identity that is validated server-side; client-side role flags, demo OTPs, or hardcoded credentials are not sufficient.

### Tampering

Clients can submit cart quantities, service bookings, delivery addresses, and order placement requests. The backend must bind every mutable record to the correct user/session, calculate authoritative totals from server-side data, and prevent one caller from modifying another caller’s cart or order-related state.

### Information Disclosure

Order history, delivery addresses, phone numbers, and other operational data are sensitive in this product context. The API must only return data to the owning user or an authorized operator, and responses/logs must avoid exposing other customers’ orders, addresses, or internal operational information.

### Denial of Service

Public POST endpoints such as cart updates, order placement, and service booking can be abused for spam or cost amplification if left completely unauthenticated and unthrottled. The system should bound request sizes and apply rate limiting or equivalent abuse controls to public-facing write endpoints.

### Elevation of Privilege

Vendor and admin capabilities exist in the production frontend, and the backend owns all persistent business data. Any privileged workflow must be enforced on the server, not only in the SPA, and no caller should gain broader data access by guessing identifiers, reusing shared session state, or invoking protected routes directly.
