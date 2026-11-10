---
bump: patch
---
### Five dashboard cards draw their header with `CardHeader` (November 2026)

`TeamCapacity`, `UserCapacity`, `CycleBurndown`, `CyclePerformance` and `ValueCards` each hand-drew the card's head (the `h2`, the ⓘ and the filters). They now use `CardHeader`, the one version `InCaseYouMissedIt` and `DomainBudgetSummary` already use, so every card's title, 16 info icon (40 press area), truncation and wrapping filters read the same. No props change. Small differences that come with sharing one header: the filters sit 12 apart (was 8) and the title and filters wrap with the same gaps as the other cards; titles that were not truncating (`CyclePerformance`, `ValueCards`) now truncate with "…" when too long.
