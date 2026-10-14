---
name: db schema project references
description: Why dependent packages fail to see new @workspace/db exports until db is rebuilt
---

When you add/change a schema export in `lib/db` (a `composite: true` TS project with
`emitDeclarationOnly` to `dist`), dependent packages like `artifacts/api-server` consume
it via TS **project references** — i.e. through `lib/db`'s emitted `.d.ts`, not its source.

**Symptom:** `tsc` in the dependent package reports `Module '"@workspace/db"' has no
exported member 'XxxTable'` even though the export clearly exists in `lib/db/src`.

**Fix:** rebuild the db project's declarations first:
`pnpm --filter @workspace/db exec tsc -b`
Then typecheck the dependent package. (Runtime/Vite/esbuild resolve source directly, so
only `tsc` typecheck is affected.)

**How to apply:** after editing any `lib/db/src/schema/*` and before typechecking
`artifacts/*`, run the db `tsc -b`. Also run `pnpm --filter @workspace/db push` to apply
the schema to the database.
