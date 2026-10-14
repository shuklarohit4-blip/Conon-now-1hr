---
name: R3F global JSX augmentation breaks React.ElementType
description: Installing @react-three/fiber breaks unrelated dynamic-component (icon) typing across the whole app
---

Importing `@react-three/fiber` anywhere loads its `declare module 'react' { namespace JSX { interface IntrinsicElements extends ThreeElements }}` augmentation (also for jsx-runtime / jsx-dev-runtime). This is global to the whole tsc program — not scoped to the file that imports R3F.

**Symptom:** unrelated files that type dynamic components as `React.ElementType` (e.g. `icon: React.ElementType` holding a lucide icon) suddenly fail with `TS2322: Type 'string' is not assignable to type 'never'` on `className`/`style`/`strokeWidth`. `<div>`/`<span>` intrinsics stay fine — only the dynamic-component (`<current.Icon ...>`) usages break.

**Why:** `React.ElementType` enumerates `keyof JSX.IntrinsicElements`. R3F balloons that set with hundreds of THREE elements; non-constructor THREE exports map to `never`, so the union's common props collapse to `never`.

**Fix (applied in conon):** type dynamic icons concretely — `import type { LucideIcon } from "lucide-react"` and use `LucideIcon` instead of `React.ElementType`. Switching tsconfig `jsx` preserve↔react-jsx does NOT help (augmentation hits both). Do not widen/edit R3F's d.ts.

**How to apply:** before/after adding R3F to a package, run `tsc -b`; if unrelated icon files break with never-props, replace their `React.ElementType` icon fields with `LucideIcon` (or a concrete `React.ComponentType<...>`).
