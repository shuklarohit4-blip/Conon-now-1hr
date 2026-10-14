---
name: New artifact port mapping gotcha
description: Why a new react-vite artifact can fail with DIDNT_OPEN_A_PORT even though its dev server runs
---

When creating a new web artifact, `createArtifact` can silently fail on its first
call and never register the artifact's assigned port in `.replit` `[[ports]]`.
The dev server then runs but the proxy reports DIDNT_OPEN_A_PORT.

**Why:** Port mappings in `.replit` are owned by a dedicated tool. Direct `.replit`
edits are blocked, and `verifyAndReplaceArtifactToml` alone does NOT sync the
`[[ports]]` block. The fix that worked was a checkpoint that added the missing
`[[ports]]` mapping.

**How to apply:** After creating any new artifact, verify `.replit` has a
`[[ports]]` entry for its port. If missing and the workflow fails with
DIDNT_OPEN_A_PORT, get the port mapping added rather than re-editing artifact.toml.

Sandbox quirks seen while debugging this:
- `pkill -f "conon-store"` self-kills the running shell (pattern matches its own
  command) → exit 137. Kill by PID instead.
- `ss` is unreliable here (reports false NOT LISTENING). Trust `curl` to a port.
