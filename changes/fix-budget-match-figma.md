---
bump: minor
---
### `DomainBudgetSummary` / `BudgetTable` / `ProgressBar` — budget bars and copy as Figma draws them (November 2026)

Decided 9 Nov 2026: follow Figma's colours and wording on each surface.

- **`BudgetTable`**: two fills only, as Figma's table draws: brand blue, or bright red when over budget. No amber at 75%.
- **`DomainBudgetSummary`**: Figma's fills: brand blue under 75%, its bright yellow (`accent.yellow.medium`) at 75–99%, its
  bright red at 100% and over. The Allocated ⓘ says "for the **selected** cycle", as Figma's does.
- **`ProgressBar`** gains a tone, `alert` (`accent.critical.outline.border`, Figma's bright red): 3.09:1 on the light track,
  2.17:1 on the dark one, so only beside a written value.
