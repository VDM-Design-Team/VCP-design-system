---
bump: minor
---
### `DomainBudgetSummary` / `BudgetTable` / `ProgressBar` — budget bars and copy as Figma draws them (November 2026)

Decided 10 Nov 2026: follow Figma's colours on each surface. Wording: a budget is per **quarter**, and "quarter" and
"cycle" (a planning fortnight) are different things, so the budget never says "cycle", even where Figma's tooltips do.

- **`BudgetTable`**: two fills only, as Figma's table draws: brand blue, or bright red when over budget. No amber at 75%.
- **`DomainBudgetSummary`**: Figma's fills: brand blue under 75%, its bright yellow (`accent.yellow.medium`) at 75–99%, its
  bright red at 100% and over.
- **`ProgressBar`** gains a tone, `alert` (`accent.critical.outline.border`, Figma's bright red): 3.09:1 on the light track,
  2.17:1 on the dark one, so only beside a written value.
- **Both tooltips** say **quarter** where they said "cycle": Allocated is "Total development points assigned for the
  selected quarter. Unused points do not roll over." and Remaining is "Remaining = Allocated - Consumed points for the
  quarter. Negative values indicate overspend." (Figma's say "cycle" there: a Figma wording fix.) Consumed is unchanged.
