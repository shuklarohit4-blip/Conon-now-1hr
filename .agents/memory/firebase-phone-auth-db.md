---
name: Firebase Phone Auth → DB
description: How CONON wires Firebase Phone Auth to its PostgreSQL user table via a server-side ID token exchange.
---

## Rule
After `confirmResult.confirm(otp)`, the client calls `auth.currentUser.getIdToken()` and POSTs it to `POST /api/auth/firebase-verify`. The server verifies with Firebase identitytoolkit REST API, extracts the phone number, creates/finds the user in the DB, and returns a platform HS256 JWT. The phone number is NEVER taken from the client body.

**Why:** Token replay / phone spoofing — same reason as MSG91. The verified phone must come from the provider's server response, not the client payload.

**How to apply:**
- Backend route: `artifacts/api-server/src/routes/otpAuth.ts` → `POST /api/auth/firebase-verify`
- Frontend helper: `artifacts/conon/src/lib/authApi.ts` → `verifyFirebaseIdToken(idToken, opts?)`
- Both OtpLogin.tsx (auth gate) and Login.tsx (role portal) call this helper.
- Frontend uses invisible reCAPTCHA — needs a `<div id="..." />` in JSX and `new RecaptchaVerifier(auth, id, { size: "invisible" })`.

## Required env vars
| Package | Var | Purpose |
|---|---|---|
| api-server | `FIREBASE_WEB_API_KEY` | identitytoolkit REST verification |
| conon (frontend) | `VITE_FIREBASE_*` | Firebase client SDK init (in firebase.ts) |

## Firebase console setup required
1. Authentication → Sign-in method → Phone → Enable
2. Add the Replit dev domain to "Authorized domains"
3. Get the Web API Key from Project Settings → General
