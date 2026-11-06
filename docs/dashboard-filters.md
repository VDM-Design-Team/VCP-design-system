# DashboardFilters

The global filter bar at the top of a dashboard: a **Reset Filters** link, the filters (the cycle, the year, the team) and an **Export** button, in one row on the right of the page title. Built to Figma's `Dashboard_Global_Filters_And_Export` (`7577:107312`).

## Composed of

| Piece | Tier |
|---|---|
| `Button` | atom |
| `Icon` | sub-atomic |
| `Select` | atom |
| `Menu` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `DashboardFilters` | The filters that apply to a whole dashboard, in the page title's actions |
| `CyclePerformance`'s `filters` | A chart's own filters, when the page has no global bar |
| `FilterBar` | An Added Value list's filters |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `filters` | `{ key, label, value, options, onChange, className? }[]` | required | Each a quiet `Select`. `label` names it for assistive tech ("Cycle", "Year", "Team") |
| `onReset` | `() => void` | — | Shows the reset button (tertiary) |
| `resetLabel` | `string` | `Reset Filters` | |
| `exportLabel` | `string` | — | Shows the export button (secondary, with a caret): "Export Cycle Report" |
| `exportOptions` | `{ key, label }[]` | — | The button opens a menu of these |
| `onExport` | `(key?) => void` | — | The export was chosen: with the option's `key` when there are options, with nothing for a single button |
| `className`, `ref` | | | On the group |

## It does no filtering

It reports each choice (`onChange` per filter, `onReset`, `onExport`); the page changes what the charts and cards are given.

## Layout

A row, right-aligned, `space.8` apart, that wraps when the page is narrow instead of overflowing. **Every control is 40 high:** the selects and the buttons are all `md`, the one size they share (a small select is 32 and a small button 36), and `DashboardTemplate`'s view switch beside the title is the same 40. Figma draws this row at 36, a height the system's selects do not have. The selects are quiet (`emphasis="regular"`); a wide one (the cycle's name and dates) takes a wider `className`.

## Accessibility

- A group named "Dashboard filters"; each select is a native select named by its `label`.
- Reset and Export are real buttons; the export menu is the system's `Menu` (arrow keys, Escape, focus returns to the button).

## Don't

- **Don't put the dashboard's filters in the charts** when the page has this bar.
- **Don't filter inside it.** Pass the filters; the page does the rest.
