---
bump: minor
---
### `SuperAdminMetrics` — the super admin dashboard's numbers (November 2026)

New pattern, built to Figma's `SuperAdmin_Dashboard_Metrics`: a domain `Select` and a `MonthField`, four single `StatCard`s (Values Created, Values Completed, Overdue Value Rate, Active / Total Users) and two `StatCardGroup`s (Avg. Time, Review), each figure with its tooltip. It owns no arithmetic: counts read `0`, a rate or average that cannot be worked out is `null` and reads `--`, as Figma's empty state does. `loading` shows a placeholder per figure. It reflows by its own width.
