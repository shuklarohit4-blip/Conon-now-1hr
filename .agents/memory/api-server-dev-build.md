---
name: api-server dev build & OTP testing
description: How the api-server dev workflow builds, and how to test phone-OTP login locally without SMS.
---

The `artifacts/api-server` dev workflow runs `build && start` (esbuild → `dist/index.mjs`, then `node dist`). It does NOT watch source.

**Rule:** after editing any api-server source (routes, middleware, etc.), restart the `artifacts/api-server: API Server` workflow before testing — otherwise curl/e2e hits a stale build (symptom: newly-added routes 404, new auth logic ignored).

**Local OTP testing:** `SMS_API_KEY` is usually missing, so `/api/auth/send-otp` returns 502. But the OTP is generated and stored BEFORE the SMS call, and in dev it is logged as `DEV OTP generated` with the plaintext `otp`. The code is in the DB even when send returns 502. pino logs through an async worker, so the line is buffered — call `refresh_all_logs` to flush, then read the `otp` from the latest log file. Then POST `/api/auth/verify-otp` with `{phone, otp, role:"vendor", storeName, name}` to get a JWT.

**Vendor wallet balance** derives from `orders` rows where `vendor=<store>` and status `ready|delivered`, minus pending+approved payouts. To seed a testable balance, insert a `delivered` order with that `vendor` string.
