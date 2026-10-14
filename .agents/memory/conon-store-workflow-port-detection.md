---
name: conon-store web workflow won't restart (DIDNT_OPEN_A_PORT)
description: The conon-store dev workflow fails restart detection even though vite is healthy — env quirk, not a code bug
---

## Symptom
`restart_workflow("artifacts/conon-store: web")` consistently fails with
`DIDNT_OPEN_A_PORT … didn't open port <N>`, while the workflow log shows vite
starting fine: `VITE v7.3.1 ready in ~280ms ➜ Local: http://localhost:<N>/store/`.
A manual `curl` of the port returns 200. The sibling `conon` workflow (identical
config, base `/`) stays RUNNING — but only because it was never restarted this session.

## What it is NOT (ruled out)
- Not a code/config bug: `conon-store` and `conon` `artifact.toml` + `vite.config.ts` are structurally identical (same `router="path"`, same service shape); only port and base path differ.
- Not port-specific: reassigning to a fresh port via `verifyAndReplaceArtifactToml` failed identically.
- Not `strictPort`: fails the same with it on or off.
- Not resources/orphans: ~3GB free, load ~0, no orphan vite processes.

## Likely cause
Environment/framework port-readiness probe can't detect the bound socket on
**restart** for the `/store/` (non-root base) artifact, even though vite is listening.
The detector worked at session boot (all artifacts start together) but not for a
single-workflow restart.
**Why it matters:** This is infra-level, not fixable from app code/config.

## How to apply
- Don't burn many cycles re-trying restart or rewriting conon-store config — verified dead end.
- Don't restart the working `conon` workflow to "test" — it may hit the same restart-detection failure and take down a working app.
- Be transparent with the user: app code is healthy; the dev workflow's port detector is the blocker. Offer checkpoint rollback or retry later.
