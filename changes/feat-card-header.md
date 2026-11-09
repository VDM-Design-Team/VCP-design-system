---
bump: minor
---
### `CardHeader` — one title for every dashboard card (November 2026)

New component: the head of a dashboard card, with its title (the card's `h2`), an optional info icon (`InfoHint`, 4 from the title) and an optional slot for controls on the right (a filter, a period picker) that wraps under the title in a narrow card. The cards had each drawn this by hand with slightly different gaps and heading wiring.

`InCaseYouMissedIt` and `DomainBudgetSummary` use it now (no visual change beyond aligning their spacing to the one version); the other cards adopt it as their PRs land: `TeamCapacity`, `UserCapacity` and `CycleBurndown`, `CyclePerformance` and `ValueCards`.
