---
name: MSG91 hosted-OTP phone binding
description: Why the server must bind the account to the MSG91-verified number, never a client-supplied one.
---

# MSG91 hosted-OTP: bind account to the verified number only

The MSG91 hosted OTP widget runs send+verify in the browser and hands back a short-lived
JWT "access-token". The server's verify route must call MSG91 `verifyAccessToken` (server-only
authkey), then recover the phone number **from MSG91's response/JWT payload** and use that for
vendor/user resolution.

**Rule:** never accept a client-supplied phone/mobile field in the verify request. Resolve identity
solely from what MSG91 verified.

**Why:** if the route trusted a caller-provided number, an attacker could OTP-verify their own
phone, obtain a valid access-token, then post it alongside someone else's number to claim that
account (token replay → phone spoofing). Binding to the MSG91-verified number closes this.

**How to apply:** any future change to the OTP verify route (or a new hosted-OTP provider) must keep
phone recovery server-side from the provider's verified payload, reject unrecoverable numbers (422),
return 503 when the provider authkey is not configured, and never read a phone from the request body.
