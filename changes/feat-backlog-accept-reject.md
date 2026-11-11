---
bump: minor
---
### `StatusProgression` / `AVHeader` — Accept and Reject on a Backlog AV (November 2026)

An admin can now decide a backlogged Added Value from its page: `Backlog` offers the admin an outline **Reject** and **Accept**, as Figma's admin Backlog page draws them (`1094:97734`), the same pair `Review` uses. Other roles still get no moves on `Backlog`, and moving it back to Pending or Draft stays in `DetailCardMenu`. `avTransitions({ role: 'admin', status: 'Backlog' })` returns the two.
