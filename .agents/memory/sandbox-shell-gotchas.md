---
name: Replit sandbox shell gotchas
description: Non-obvious shell/process behaviors in this sandbox that silently waste debugging time
---

## `pkill -f "<pattern>"` self-matches your own command
If the pattern string also appears literally in the bash command you're running, `pkill -f` matches its own shell and kills it → the command exits 143 (SIGTERM) with **no output**.
**Why:** `-f` matches the full command line, and your invoking shell's command line contains the pattern.
**How to apply:** Never `pkill -f` a substring that appears in the same command. Kill by PID, or split the literal (still risky), or just rely on `restart_workflow` (it SIGTERM→SIGKILLs the managed process for you). A sudden exit-143-no-output almost always means a self-kill, not an infra failure.

## `ss -ltn` is blind here
`ss` reports **zero** listening sockets even when conon/api-server/mockup/proxy are all serving.
**How to apply:** Don't use `ss`/`/proc/net/tcp` to verify a port is open. Use `curl -s -o /dev/null -w '%{http_code}'` against the port instead.

## The bash tool kills backgrounded processes on return
A dev server started with `&` / `setsid nohup ... &` does **not** reliably survive past the bash tool call (group gets SIGTERM'd).
**How to apply:** You cannot keep a manual long-running server alive across tool calls. Only the workflow system keeps dev servers running.
