---
bump: patch
---
### `DomainBudgetSummary`: over budget the label says the real percentage (November 2026)

At 170 of 120 the bar's label said "100%". The bar still stops at full, but the number beside it is now the real figure: **142%** (new `budgetUsagePercent`, not capped; with no allocation there is no percentage). It is passed as the bar's `valueLabel`, so a screen reader hears 142% as well. The `OverBudget` story asserts it.
