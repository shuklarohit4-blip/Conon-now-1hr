---
name: grep/rg token-display mangling
description: Some rg output in this environment collapses certain tokens, making code look broken when it isn't
---
In this workspace, ripgrep/grep observation output sometimes mangles specific
substrings on display (e.g. `admin` renders as `n`, `wallet` as `ln`,
`./admin` import shows as `./n`). The underlying files are correct — only the
displayed match text is collapsed.

**Why:** Twice this caused a false conclusion that the api-server admin router
was "not mounted" (the `router.use(adminRouter)` line displayed as
`router.use(nRouter)`), and that routes had a `/n/...` prefix. They were fine.

**How to apply:** Never conclude a symbol/import/route is missing or misnamed
from grep output alone. Confirm by READING the file with the read tool, or by
hitting the endpoint live (curl) before acting on a "missing" finding.
