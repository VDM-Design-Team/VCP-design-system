# DashboardFilters

The global filter bar at the top of a dashboard: a **Reset Filters** link, the filters (the cycle, the year, the team) and an **Export** button, in one row on the right of the page title. Built to Figma's `Dashboard_Global_Filters_And_Export` (`7577:107312`).

## Composed of

| Piece | Tier |
|---|---|
| `Button` | atom |
| `Icon` | sub-atomic |
| `Select` | atom |
| `Menu` | component |
| `SearchSelect` | component |

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
| `filters` | `{ key, label, value, options, onChange, searchable?, searchPlaceholder?, className? }[]` | required | Each a quiet `Select` that hugs its longest option (`className` pins a width). With `searchable` it is a `SearchSelect` instead (a search box in its list, 19.5rem wide): the cycle's list is long. `label` names it for assistive tech ("Cycle", "Year", "Team") |
| `onReset` | `() => void` | — | Shows the reset button (tertiary) |
| `resetLabel` | `string` | `Reset Filters` | |
| `exportLabel` | `string` | — | Shows the export button (secondary, with a caret): "Export Cycle Report" |
| `exportOptions` | `{ key, label }[]` | — | The button opens a menu of these |
| `onExport` | `(key?) => void` | — | The export was chosen: with the option's `key` when there are options, with nothing for a single button |
| `className`, `ref` | | | On the group |

## What the Figma annotations say

Read off the annotated frame (`Main Views: Cycle & Quarter`), so the page knows what to wire:

- **The cycle is searchable.** "Searching by text like C39 or Aug 2026 should be possible": `searchable` on that filter, and the search matches every word you type in any order ("Aug 2026" finds the August 2026 cycles).
- **The year narrows the cycles.** The cycle's list shows the chosen year's cycles; a cycle that spans two years appears in both years' lists. This is the page's to do: pass the narrowed `options`.
- **Defaults:** the current cycle, the current year, All Teams. **Reset Filters** returns to those three: `onReset` sets the cycle to the current cycle, the year to the current year and the team to All Teams.
- **The filters affect every visible card on the page**, so the page passes what they choose to all of them.
- **Export** opens a list of file types (PDF, CSV); choosing one proceeds with the export in that type: `exportOptions` and `onExport(key)`.
- The filters are on the **Cycle view only**; the Quarter view has none (see `DashboardTemplate`).

## It does no filtering

It reports each choice (`onChange` per filter, `onReset`, `onExport`); the page changes what the charts and cards are given.

## Layout

A row, right-aligned, `space.8` apart, that wraps when the page is narrow instead of overflowing. **Every control is 36 high**, as Figma draws the row: the selects are `compact` (36), the buttons `sm` (36) and `DashboardTemplate`'s view switch beside the title `md` (36). A plain small select is 32, which is why the selects take the `compact` size. The selects are quiet (`emphasis="regular"`); **the selects hug their longest option** (capped at 20rem), so none carries empty space and the row stays short: at 1440 wide it fits beside the title and the view switch on one line. Pass a `className` width only to pin one.

## Accessibility

- A group named "Dashboard filters"; each select is a native select named by its `label`.
- Reset and Export are real buttons; the export menu is the system's `Menu` (arrow keys, Escape, focus returns to the button).

## Don't

- **Don't put the dashboard's filters in the charts** when the page has this bar.
- **Don't filter inside it.** Pass the filters; the page does the rest.
