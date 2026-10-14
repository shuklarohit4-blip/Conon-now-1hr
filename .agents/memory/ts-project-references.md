---
name: TS project references rebuild
description: Why downstream typecheck fails to see new exports after editing a lib package, and how to fix it
---

This pnpm monorepo wires packages together with TypeScript **project references**
(`references` in each artifact's tsconfig). The referenced lib packages
(`lib/db`, `lib/api-zod`, etc.) are `composite: true` + `emitDeclarationOnly`,
emitting `.d.ts` into their `dist/` (tracked by `*.tsbuildinfo`).

**Symptom:** after editing a lib's source (e.g. adding a Drizzle column or
running orval codegen that adds a new export), a downstream package's
`pnpm typecheck` reports the new export/column as missing — even though the
source clearly has it. The downstream `tsc --noEmit` reads the lib's *stale*
emitted `.d.ts`, not the lib source.

**Fix:** rebuild the referenced declarations first, then typecheck downstream:
`pnpm exec tsc -b lib/db lib/api-zod` then `pnpm --filter @workspace/<pkg> run typecheck`.

**Why:** `tsc -p ... --noEmit` does not rebuild referenced projects; only `tsc -b` does.
**How to apply:** any time you change a lib package consumed via references and a
consumer's typecheck shows phantom-missing exports, rebuild refs before debugging further.
