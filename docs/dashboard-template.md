# DashboardTemplate

The dashboard page: the app shell, a title band with an optional **view switch** beside the title (Cycle / Quarter) and the **global filters** on its right, then the sections, stacked 16 apart. Read off the Figma `Main Views: Cycle & Quarter` and `SuperAdmin Dashboard Examples`.

## Composed of

| Piece | Tier |
|---|---|
| `AppShell` | template |
| `PageTitle` | component |
| `SegmentedControl` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `DashboardTemplate` | Any role's dashboard: pass the sections that role sees |
| `AppShell` | Any other signed-in page |

## One layout; the roles differ in their sections

What differs between a development admin, a development user, a design user and the super admin is **which sections they see**, not how the page is arranged. So the template takes the sections as `children` and does not know roles; each role is a composition (the stories, `Templates/Dashboard`). The sections are patterns, each a full-width card that reflows by its own width, so the page needs no breakpoints.

| Role | Rail (`userType`) | View switch | Global filters | Cycle view | Quarter view |
|---|---|---|---|---|---|
| **Development admin** | `admin-dev` | Cycle / Quarter | Cycle, year, team, reset, export (Cycle view only) | `CycleSummary`, `ValueCards`, `InCaseYouMissedIt`, `TeamCapacity`, `UserCapacity`, `SprintMetrics`, `CycleBurndown` | `DomainBudgetSummary`, `ValueCards`, `CyclePerformance` (with its own filters) |
| **Development user** | `user` | Cycle / Quarter | Cycle, year (no team) | `ValueCards`, `TeamCapacity` titled "My Capacity", `CycleBurndown` titled "My Cycle Burndown" | `ValueCards`, `CyclePerformance` titled "My Cycle Performance" |
| **Design user** | `user` | none | none | `ValueCards`, `InCaseYouMissedIt` | |
| **Super admin** | `super-admin` | none | none (its own domain and month filters are inside the metrics) | `SuperAdminMetrics` | |
| **Design admin** | `admin` | not yet designed | | | |

The development user and design user rows come from the product's description, not from a Figma frame; the development admin and super admin rows are read off Figma.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `sidebar` | `ReactNode` | required | The rail: a `Sidebar` (see `AppShell`) |
| `topBar` | `ReactNode` | required | The app bar: a `TopBar` |
| `title` | `string` | `Dashboard` | The page's `h1` |
| `views` | `{ value, label }[]` | — | The views the dashboard has. Leave it out for a dashboard with one: no switch |
| `view` / `onViewChange` | `string` / `(view) => void` | — | The chosen view, and its change. Render the sections of the chosen view as `children` |
| `viewsLabel` | `string` | `Dashboard view` | The switch's accessible name |
| `filters` | `ReactNode` | — | The global filters, on the right of the title: a `DashboardFilters`. Leave it out when there are none, or the filters are inside a section |
| `children` | `ReactNode` | required | The sections, stacked 16 apart |
| `footer`, `className` | | | As `AppShell` |

## The view switch is yours to wire

The switch is a `SegmentedControl` (a radio group), not tabs, at `md` (36 high, the same as the filters' selects and buttons; its own default is 48): it swaps which sections the page shows, and the page does the swapping. The page also decides whether the filters belong to a view (the development admin's global filters are on the Cycle view and not the Quarter one).

## Layout

The shell is `AppShell`'s (the rail and bar stay put, the page scrolls). The title band is `PageTitle`: the title and the switch on the left (the switch wraps under the title in a narrow page rather than squeezing it), the filters on the right (they wrap, right-aligned). The sections are a column with `space.16` between.

## Accessibility

- The page has one `h1` ("Dashboard"); each section is a `section` named by its own heading.
- The view switch is a radio group named "Dashboard view"; the filters are a group named "Dashboard filters", each select named by its label.
- Reading order is title, switch, filters, then the sections top to bottom.

## Gaps (what the Figma pages do not settle)

1. **Design admin's dashboard:** not drawn, so not composed. The rail has an `admin` type for it.
2. **Development user and design user dashboards:** composed from the product's description, with no Figma frame; the user's filters (which, if any) are assumed.
3. **Other domains** (Quality, and so on): no dashboards seen; each would be one more composition.
4. **A narrow window:** Figma draws a 658 wide dashboard without the rail. `AppShell` has no behaviour for hiding the rail at that width; the sections reflow, the shell does not.
5. **Value cards are not interactive** in Figma (no click-through to a filtered list), so `ValueCards` does not link.
6. **The global filters:** the cycle's text, the year's and the team's options, the export's formats (one button or a menu), and whether Reset also resets the cycle, are the product's.
7. **Empty, loading and error states** exist per section (each pattern has `loading` and `empty`); the page-level states (a failed fetch, a cycle with no data at all) are not drawn.
8. **What each burndown line measures**, and what "My Capacity" counts, are the product's to define.

## Don't

- **Don't build a template per role.** Compose the sections for the role.
- **Don't put page breakpoints in the dashboard.** The sections reflow by their own width.
- **Don't put the filters inside a section when the page has global ones.** Pass `filters` once.
