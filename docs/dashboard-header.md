# DashboardHeader

The band at the top of a dashboard: the page's title, an optional **view switch** beside it (Cycle / Quarter), and the role's **filters** on its right. Read off the Figma `Main Views: Cycle & Quarter` and `SuperAdmin Dashboard Examples`.

## Composed of

| Piece | Tier |
|---|---|
| `PageTitle` | component |
| `SegmentedControl` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `DashboardHeader` | The top of any role's dashboard: pass the switch and the filters that role has |
| `PageTitle` | The band of any other page |
| `DashboardFilters` | The global filters that go in this header's `filters` slot |

## One header; the role is what you put in it

The header does not know roles. It takes the view switch as data and the filters as a slot, so each role is a composition (the stories, `Patterns / DashboardHeader`). This table is design's reading of the Figma dashboards, not a requirement the header enforces.

| Role | View switch | Filters |
|---|---|---|
| **Development admin** | Cycle / Quarter | Cycle, year, team, Reset Filters, Export (Cycle view only: the Quarter view's chart has its own) |
| **Development user** | Cycle / Quarter | Cycle, year, Reset Filters; no team, no export (Cycle view only) |
| **Super admin** | none | Domain and month (`SuperAdminFilters`, 36 high) |
| **Design user** | none | none |
| **Design admin** | not designed yet | not designed yet |

The development user and design user rows come from the product's description, not from a Figma frame.

## Props

Everything `PageTitle` takes except `title`, `beside` and `actions` (which the header fills), plus:

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | `Dashboard` | The page's `h1` |
| `views` | `{ value, label }[]` | — | The views the dashboard has. Leave it out for a dashboard with one: there is then no switch |
| `view` / `onViewChange` | `string` / `(view) => void` | — | The chosen view, and the change. **The switch is yours to wire**: render the chosen view's sections yourself |
| `viewsLabel` | `string` | `Dashboard view` | The switch's accessible name |
| `filters` | `ReactNode` | — | The role's filters, on the right of the title: a `DashboardFilters` or the super admin's `SuperAdminFilters`. Leave it out when a page has none |

## Layout

The title, the switch and the filters are one row. Every control is **36 high** (the switch is `SegmentedControl` `md`, the selects are `compact`, the buttons `sm`), as Figma draws it, and a one-line title shares a **centre line** with them. With a switch beside the title there is no column gap between the title group and the filters, so they get the room: at 1440 wide the whole band fits one line. When it does not fit, the band wraps (the switch drops under the title, the filters onto a second line, still right-aligned) instead of overflowing.

## Tokens

None of its own: the band is `PageTitle`'s (inset 32, 32 above and 16 below), and the controls bring theirs.

## Accessibility

- The title is the page's one `h1` (the top bar has none).
- The switch is a named `radiogroup` ("Dashboard view"); the filters are `DashboardFilters`' named group ("Dashboard filters").
- The header owns no state: changing the view or a filter is the page's, so it moves focus nowhere.

## Don't

- Don't put role logic in the header: pass the switch and the filters that role has.
- Don't draw the filters under the title on a wide page; they belong on its right.
- Don't mix control heights in the row: all 36.
