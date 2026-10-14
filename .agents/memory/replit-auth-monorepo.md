---
name: Replit Auth in this pnpm monorepo
description: Non-obvious constraints when adding/maintaining Replit Auth across api-server + web libs
---

# Replit Auth integration notes

- **Separate auth tables.** Auth schema uses `sessions` + `auth_users` (NOT the pre-existing `users` table, which has a `serial` id PK). Reusing `users` collides on PK type. Keep auth identity in `auth_users`.
  **Why:** existing `users` table predates auth and has incompatible shape.

- **Composite libs must be rebuilt for cross-package type changes to show up.** `@workspace/db` / `@workspace/api-zod` export `./src/*.ts` but consumers (api-server, conon) use TS project references that read built `dist/*.d.ts`. After editing a lib's exports or regenerating codegen, run `pnpm exec tsc -b tsconfig.json` (root) or typecheck fails with "no exported member". Any new lib (e.g. `lib/replit-auth-web`) referenced by another project MUST set `"composite": true`.

- **Web auth lib builds in isolation without vite/client types.** `lib/replit-auth-web` uses `import.meta.env.BASE_URL`. Add a `src/env.d.ts` declaring `ImportMetaEnv { readonly BASE_URL: string }` (matches vite/client shape so it merges in the consuming app). Otherwise the isolated lib build errors on `import.meta.env`.

- **CORS for the Replit proxy.** api-server reflects the request origin with `credentials: true` when `ALLOWED_ORIGINS` is empty, and honors the allowlist when set. Skill requires credentialed origin reflection for the browser cookie flow; pure allowlist returning `false` breaks auth on preview/deploy domains.
  **Why:** frontend and api are proxied; cookie auth needs `Access-Control-Allow-Credentials` + reflected origin.

- **No "Replit"/"Replit Auth" wording in user-facing UI text.** Login button reads "Log in Securely". No custom login forms — redirect to `/api/login`.

- **Dual-auth bridge: OIDC `useAuth()` must be bridged into the app's own session gate.** The conon app gates the whole UI on `UserContext.role` (localStorage), separate from OIDC. After a secure OIDC login the user is `isAuthenticated` but still has no `role`, so the app treats them as Guest. A small bridge component (rendered inside the provider) sets `role` once when `isAuthenticated && user && !role`. **Why:** the app has TWO independent auth systems (demo OTP/role login + OIDC); they don't know about each other unless explicitly bridged.

- **Logout must clear BOTH local session and server, but conditionally.** Combined logout calls `useUser().logout()` (clears localStorage role/name) AND, only when `isAuthenticated`, `authLogout()` (server `/api/logout`). Demo-only users (role set, not OIDC) must NOT be sent through `authLogout()` — it forces a server/OIDC redirect that's wrong for them; just route to `/login`. Wire EVERY logout button to this one handler (drawer + profile card both had bypasses). **Why:** dual-auth means a single mechanism can't cover both user types.
