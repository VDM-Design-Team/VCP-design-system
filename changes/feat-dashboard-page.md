---
bump: minor
---
### New `DashboardPage` (pattern): the Cycle and Quarter dashboard, from `DashboardHeader` and the cards (November 2026)

The main content of a dashboard, built to Figma's `Main Views: Cycle & Quarter`: the title band with the Cycle / Quarter switch and the filters, then the chosen view's cards in Figma's order. **Cycle:** Cycle Summary, Value Cards, In Case You Missed it, Team Capacity, User Capacity, Sprint Metrics, Cycle Burndown. **Quarter:** Domain Budget, Value Cards, Cycle Performance.

The page passes each card's own props in `cycle` and `quarter` (typed sections), and a card shows only when it is passed, so a role is what the page passes. With one view there is no switch. The global `filters` sit on the title's right in the Cycle view only. It is controlled and holds no data: `view` / `onViewChange` (or `defaultView`) are the only state it owns. Composed of `DashboardHeader`, `DashboardFilters`, `CycleSummary`, `ValueCards`, `InCaseYouMissedIt`, `TeamCapacity`, `UserCapacity`, `SprintMetrics`, `CycleBurndown`, `DomainBudgetSummary` and `CyclePerformance`; nothing existing changes.

Not covered: the Super admin's dashboard (no switch, its own `SuperAdminMetrics`) and Design admin (not designed yet).
