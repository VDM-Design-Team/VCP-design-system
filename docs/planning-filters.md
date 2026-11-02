# PlanningFilters

The row above the Planning list: a search box, a status filter, a priority filter, Reset, and the View Cycle button.
Built to Figma's `_Planning_Filters` (`4617:56260`) and the Planning Page frame.

It is **only what that page needs**. The library's Filters page draws a much larger bar (tags, a period, user filters, a
Filters toggle, a mobile layout); that is a separate piece, `FilterBar`, and none of it is here.

## Composed of

| Piece | Tier |
|---|---|
| `Button` | atom |
| `Icon` | sub-atomic |
| `Input` | atom |
| `SearchSelect` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `PlanningFilters` | Above the Planning list (`PlanningTable`) |
| `FilterBar` (to build) | A page with tags, a period, users and a collapsible panel |
| `SearchSelect` | A single dropdown in a form |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `{ search, status, priority }` | required | Strings; `''` is none. The bar holds no state |
| `onChange` | `(value) => void` | required | The next value, on every keystroke and pick. Debounce the search on your side if the list is on a server |
| `statusOptions` | `(string \| { value, label, group? })[]` | required | The domain's steps — Design and Development differ |
| `priorityOptions` | same | Low, Normal, High, Urgent | |
| `onReset` | `() => void` | required | The page clears its filters |
| `onViewCycle` | `() => void` | — | Omit it and the button is not drawn. What it opens is the page's |
| `statusPlaceholder` / `priorityPlaceholder` / `searchPlaceholder` | `string` | "Select status" / "Search priority" / "Search by title or ID" | Figma's copy |
| `resetLabel` / `viewCycleLabel` | `string` | "Reset" / "View Cycle" | |

## Layout

Search on the left (up to 300 wide), then the status (160) and priority (176) selects, Reset (a ghost button) and View Cycle (primary,
with the calendar glyph) on the right. The row wraps on a narrow screen rather than overflowing.

## Accessibility

- A `role="search"` region named "Filter the planning list"; the search is a real `type="search"` field named by its placeholder text.
- The two selects are `SearchSelect`s (keyboard, listbox, announcements — see docs/search-select.md), named "Status" and "Priority".
- "Search priority" is Figma's copy for the priority placeholder, though the dropdown is a short pick list with no search box; pass
  `priorityPlaceholder` to change it.

## Don't

- **Don't put tags, a date period or user filters here.** That is `FilterBar`.
- **Don't filter inside the bar.** It reports the value; the page (or the server) filters the list.
