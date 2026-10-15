# MongoDB Atlas Persistence Migration Design

**Date:** 2026-10-15  
**Status:** Approved direction; implementation awaits review of this written spec

## Goal and scope

Replace all PostgreSQL/Drizzle persistence in the CONON API and seed tooling with MongoDB Atlas. The new Atlas database starts empty; the Render PostgreSQL Blueprint has not been provisioned, so there is no production PostgreSQL dataset to migrate. Preserve API behavior and public response shapes wherever possible. Update Render configuration to consume a secret Atlas URI instead of creating PostgreSQL.

The work covers `lib/db`, all `artifacts/api-server` database call sites (routes, auth, middleware, health and Socket.IO), the local seed script, package dependencies, tests/typechecks, Render Blueprint and deployment documentation. It does not include adding user secrets to the repository, creating a live Atlas cluster using unavailable credentials, or changing unrelated Vercel UI behavior.

## Persistence architecture

Use the official MongoDB Node.js driver and one cached `MongoClient` for the long-running Render API process. `lib/db` will own connection initialization, typed collection access, index creation, collection document types, and reusable repository operations. Remove Drizzle ORM, `pg`, Drizzle config and PostgreSQL table-specific scripts after all imports are migrated. Keep request validation in the existing Zod/API schemas.

Preserve current numeric IDs consumed by API contracts with a `counters` collection and atomic `findOneAndUpdate` allocation. Keep externally generated IDs stable. Define unique/partial indexes to match PostgreSQL constraints, including unique app-user phone, external IDs and vendor store only when the value is a string; use TTL indexes for expiring session/OTP documents. Avoid indexing fields not used by real query patterns.

Collections are shaped for existing reads/writes rather than mechanically copying SQL tables:

- `users`, `authUsers`, `materials`, `mandiPrices`, `services`, `serviceBookings`, `vendorPayouts`, and `khataLedger` remain independently queried collections.
- `carts` embed their bounded cart-item arrays; updates use atomic document operations.
- `orders` embed immutable item/price snapshots. Preserve owner/session identifiers and existing external IDs.
- `sessions` and `phoneOtps` remain separate due to independent lookup and expiry behavior.

The admin Khata dashboard currently uses hard-coded in-memory demo data rather than a PostgreSQL table. Do not silently migrate that demo state as production data; keep its behavior unchanged and identify it as mock/demo functionality during implementation review.

Use BSON Decimal128 for stored money values that need exact decimal representation; convert deliberately at API boundaries to preserve the current JSON contract. Never use JavaScript binary floating-point arithmetic for credit or payout mutations.

## Atomic business operations

MongoDB Atlas replica-set transactions will preserve the order placement operation that currently uses a PostgreSQL transaction. It must atomically create the order, debit/validate Khata credit when applicable, and clear/update cart state as required by existing behavior. Prefer conditional atomic updates (e.g. sufficient-credit predicate) inside the transaction to prevent concurrent orders from overdrawing credit. Other single-document changes use atomic update operators. Transaction failures return the existing API error contract and are logged without leaking secrets.

## Render and Atlas configuration

Remove the Render PostgreSQL database declaration, `DATABASE_URL` linkage, and Drizzle initialization hook from `render.yaml`. Add `MONGODB_URI` as a `sync: false` secret and a non-secret database name setting. Do not commit or request the Atlas URI in chat. Configure Atlas Network Access with Render service outbound addresses where available; do not recommend broad `0.0.0.0/0` access as the default. The Render health endpoint must verify a database ping and return a non-2xx response when Atlas is unavailable.

Document Atlas cluster/database/user creation, minimum required privileges, network allow-listing, adding the URI directly in Render, and the fact that the Render service cannot go live until the user provides valid Atlas credentials in the dashboard. No destructive DB migration is needed because the destination starts empty.

## Alternatives considered

- **Mongoose:** convenient ODM schemas and middleware, but duplicates the existing validation layer and adds another abstraction during a broad rewrite. Not selected.
- **MongoDB Node.js driver:** direct Atlas features, explicit typing/queries, less hidden behavior, and supports the transaction/index requirements. Recommended and selected.
- **Keep PostgreSQL/Drizzle:** lowest migration effort, but does not meet the requested Atlas destination. Not selected.

## Validation

1. Inventory and remove all `@workspace/db` Drizzle consumers, `pg`, SQL query imports, and `db.transaction` calls.
2. Run workspace library build/typecheck, API typecheck/build, and frontend production build to ensure API contracts remain compatible.
3. Add repository-level tests for unique constraints, TTL/index setup, session/OTP expiry, cart operations, authorization lookups, exact-money conversions, and transactional order/Khata concurrency. Tests should use an isolated MongoDB test instance or injected test database; never the production Atlas cluster by default.
4. Run a local API smoke test with a test-only MongoDB URI; verify health, CORS, cookies, and Socket.IO initialization.
5. Deploy only after a real Atlas URI is configured in Render. Verify `/api/healthz`, representative read/write routes, and authenticated/cookie-backed flows against the deployment.

## Risks and open operational constraints

- Numeric IDs require a counter document; sequence allocation is a serialized write, so monitor it as traffic grows.
- MongoDB transactions require a replica set, which Atlas provides; standalone local MongoDB must not be used to claim transaction validation.
- MongoDB Decimal128 values need explicit conversion at existing API boundaries to avoid response-shape regressions.
- Browser cross-site cookie policies can still interfere with Vercel-to-Render sessions. Test in a browser and use related custom domains for production reliability when possible.
- This code migration cannot create Atlas resources or safely store the connection URI without user-authorized Atlas/Render dashboard access.