---
name: Khata B2B credit debit must be atomic
description: Race-safety rule for charging the contractor credit ledger at checkout
---

The B2B Khata credit ledger (`khata_ledger`) must be debited with a **single
atomic conditional UPDATE**, never a read-check-then-write sequence:
`UPDATE ... SET outstanding_balance = outstanding_balance + :total
WHERE contractor_id = :id AND outstanding_balance + :total <= credit_limit RETURNING *`.
Zero rows returned => over limit => throw CreditExceededError (402).
First-time provisioning uses `INSERT ... ON CONFLICT (contractor_id) DO NOTHING`.

**Why:** select-then-update lets concurrent checkouts both pass the limit check
and overwrite each other (lost update / credit overrun). Verified by a 5-parallel
checkout test: exactly one 200, four 402.
**How to apply:** keep this pattern for any future ledger/balance/stock debit;
don't "simplify" it back to read-then-write inside a transaction.

**Known limitation (not yet fixed, out of scope):** checkout has no auth — any
session can pass any contractorId, and unknown contractorIds auto-provision at a
default credit limit. Tie contractorId to an authenticated principal and gate
provisioning behind admin before relying on this in production.
