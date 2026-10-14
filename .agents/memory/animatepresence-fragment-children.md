---
name: AnimatePresence fragment children
description: Framer Motion AnimatePresence drops removals when its direct child is a Fragment; symptom is a modal/drawer that won't close.
---

# AnimatePresence must have direct, keyed children (no Fragment wrapper)

When conditionally rendering multiple elements (e.g. a backdrop + a sheet) inside
`<AnimatePresence>`, do NOT wrap them in a Fragment:

```tsx
// BROKEN — AnimatePresence sees one untracked child (the fragment)
<AnimatePresence>{open && (<><motion.div/><motion.div/></>)}</AnimatePresence>

// CORRECT — each element is a direct, keyed child
<AnimatePresence>
  {open && <motion.div key="backdrop" .../>}
  {open && <motion.div key="sheet" .../>}
</AnimatePresence>
```

**Why:** `AnimatePresence` only inspects its *direct* children to detect mounts/
unmounts. A `<>` Fragment is a single child with no key, so it can't be tracked.
The breakage is intermittent — it surfaced as a drawer that refused to close only
when a **sibling** `AnimatePresence` list did an insert animation in the *same*
React commit (the drawer's removal got dropped while Motion was busy). An
identical drawer elsewhere with no concurrent list animation closed fine, which
makes this look like a non-structural / flaky bug. It is structural.

**How to apply:** Any time a modal/drawer/toast group "sometimes won't dismiss"
under Framer Motion, check for a Fragment directly under `AnimatePresence` and
for a sibling `AnimatePresence`/`layout` animation firing in the same update.
Split into separately-keyed direct children.
