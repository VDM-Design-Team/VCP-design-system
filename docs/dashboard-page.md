# DashboardPage *(pattern)*

The main content of a dashboard: the title band (with the Cycle / Quarter switch and the filters) and the chosen view's cards in the order Figma draws them.
It goes inside `AppShell`, which draws the sidebar, the top bar and the footer.

Built to Figma's `Main Views: Cycle & Quarter` (the Development admin's dashboard, `Admin Dashboard Cycle overview` and `Quarterly overview` in Pages & Flows).

## Composed of

| Piece | Tier |
|---|---|
| `CycleSummary` | component |
| `DomainBudgetSummary` | component |
| `SprintMetrics` | component |
| `CycleBurndown` | pattern |
| `CyclePerformance` | pattern |
| `DashboardFilters` | pattern |
| `DashboardHeader` | pattern |
| `InCaseYouMissedIt` | pattern |
| `TeamCapacity` | pattern |
| `UserCapacity` | pattern |
| `ValueCards` | pattern |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `DashboardPage` | A dashboard with Figma's cards: the Development admin's, or a role's version of it |
| `DashboardHeader` on its own | A dashboard whose body is not these cards (the Super admin's, with `SuperAdminMetrics`) |
| `PageTitle` | Any page that is not a dashboard |

## What each view shows

| View | Cards, top to bottom |
|---|---|
| **Cycle** | Cycle Summary · Value Cards · In Case You Missed it · Team Capacity · User Capacity · Sprint Metrics · Cycle Burndown |
| **Quarter** | Domain Budget · Value Cards · Cycle Performance |

The global filters (cycle, year, team, Reset, Export) are on the right of the title **in the Cycle view only**. The Quarter view has none: the budget and the chart carry
their own pickers, as Figma draws it.

## Typed sections: the page passes each card's own props

```tsx
<DashboardPage
  filters={{ filters: [cycle, year, team], onReset, exportLabel: 'Export Cycle Report', onExport }}
  cycle={{
    summary: { committed: 180, completed: 142, carriedOver: 38, completion: 79 },
    valueCards: { items, filter },
    teamCapacity: { segments, remaining: 40 },
    // …
  }}
  quarter={{ budget: { allocated: 120, consumed: 70, quarter: 1, year: 2026, years, period }, valueCards: { items }, performance: { data, filters } }}
/>
```

`cycle.summary` is `CycleSummary`'s props, `quarter.budget` is `DomainBudgetSummary`'s, and so on. This only puts them in order, 16 apart, 32 in from the sides.

**A card shows only when the page gives it, and a view only when the page gives its sections.** That is how roles differ:

| Role | What the page passes |
|---|---|
| **Development admin** | `cycle` and `quarter`, `filters` with a team and Export |
| **Development user** | The same, without `cycle.teamCapacity`, and `filters` without a team or `exportLabel` (from the product's description, not a Figma frame) |
| **Design admin** | Not designed yet |
| **Super admin** | Not this pattern: no switch, its own `SuperAdminMetrics` |

With only `cycle` (or only `quarter`) there is **no switch**: there is nothing to switch to. Asking for a view the dashboard does not have shows the first one it does.

## It is controlled and holds no data

It fetches nothing: every number, every filter value and every callback is the page's. It owns only which view is showing: controlled with `view` and `onViewChange`, or
uncontrolled from `defaultView`. Each card keeps its own `loading` and `empty` states, passed in its section.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `cycle` | `DashboardCycleSections` | — | `summary`, `valueCards`, `missed`, `teamCapacity`, `userCapacity`, `sprintMetrics`, `burndown`. Leave out: no Cycle view |
| `quarter` | `DashboardQuarterSections` | — | `budget`, `valueCards`, `performance`. Leave out: no Quarter view |
| `filters` | `DashboardFiltersProps` | — | The global filters, on the right of the title, Cycle view only |
| `view` / `defaultView` | `'cycle' \| 'quarter'` | first view | Controlled / uncontrolled |
| `onViewChange` | `(view) => void` | — | The switch was used |
| `title` | `string` | `Dashboard` | The page's `h1` |
| `viewsLabel` | `string` | `Dashboard view` | The switch's accessible name |

## Layout

The title band is `DashboardHeader`'s (the title, the switch and the filters in one 36-high row). Under it the cards stack in one column, **16 apart** and **32 in from the sides**
(Figma's content inset, as `SettingsPage`), with 32 below the last. The cards bring their own surface, so this draws none.

## Accessibility

- The page has one `h1`, from the header. Every card is a labelled region named by its heading.
- The switch is `DashboardHeader`'s named `radiogroup` ("Dashboard view"). Changing the view moves no focus: it stays on the switch, so a keyboard user can flip back and forth.
- Each card keeps its own keyboard behaviour (the "missed" strip's arrows, the charts' keyboard reading).

## Don't

- Don't fetch inside the cards' props: pass numbers in, handle changes out.
- Don't put role logic in here: leave out what a role does not have.
- Don't draw a card around the sections: each brings its own.
