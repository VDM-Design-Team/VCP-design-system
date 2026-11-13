# DomainBudgetEditPage *(pattern)*

The main content of the page where an admin sets each domain's development-point budget for a quarter: the title with the quarter and year controls on its row, the budget table, and **Save Changes**. It goes inside `AppShell`,
which draws the sidebar, the top bar and the footer.

Built to Figma's `Domain Budget Edit` page in Pages & Flows (`Domain Budgeting`, with its saving and saved frames and the allocated-points input flow).

## Composed of

| Piece | Tier |
|---|---|
| `Button` | atom |
| `SegmentedControl` | atom |
| `Select` | atom |
| `PageTitle` | component |
| `BudgetTable` | pattern |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `DomainBudgetEditPage` | The whole edit page for one quarter's budgets |
| `BudgetTable` on its own | The table inside something else |
| `DomainBudgetSummary` | Reading one domain's budget on the dashboard |

## What it guarantees

| Moment | What the page does for you |
|---|---|
| Always | The quarter control (Q1–Q4, `SegmentedControl` `md`) and the year `Select` (`compact`) are **both 36 high**, the dashboard header's size, on the title's row at the right (as the dashboard's filters are), so they sit as one row. Never pair a 36 with a 32. The year takes the lighter `edge="neutral"`, as every filter outside a form does |
| `saving` | **Save Changes** spins (`aria-busy`), and the table, the quarter and the year are all locked |
| `dirty` | The browser asks before the tab is closed or reloaded (`beforeunload`): the browser's own prompt. It does not cover a change of quarter or year, or a move to another page inside the app: those are the page's, below |
| `table.loading` | The table shows placeholders, and Save is disabled: there is nothing to save |

## What the page does

It is **controlled and holds no data**. The page owns the rows, the quarter, the year, `saving` and `dirty`; this puts them in order, 16 apart and 32 in from the sides.

| Moment | What the page passes and does |
|---|---|
| Save Changes pressed | `onSave`: start the save and set `saving` |
| **Saved** | Clear `dirty`, and show a success `Toast`: "Changes Saved" |
| **The save fails** | Clear `saving`, **leave `dirty` on and keep what was typed**, and show a `critical` `Toast` ("Changes not saved … your changes are still here — try again"). Save stays available to try again |
| The quarter or year changes | `onQuarterChange` / `onYearChange`. **With unsaved edits, ask first** (decided 10 Nov 2026; the design doesn't draw it): a `critical` `Modal`, "Leave without saving?", saying whose changes are lost ("Your changes to Q1 2026's budgets aren't saved. If you leave now, they're lost."), with **Keep editing** and **Leave**. Leave drops the edits and switches; Keep editing changes nothing. Never carry edits over to another quarter |
| Another page in the app is opened | The same dialog. The browser's prompt only fires when the tab closes or reloads, so the app's own navigation has to ask |
| The budgets load | `table.loading` while they do |

The toasts are the page's because the app owns the toast viewport; the stories show the whole flow with `ToastProvider`.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | `Domain Budget` | The `h1`. Figma's frames say the placeholder "Page Title" |
| `quarter`, `onQuarterChange` | `string`, `(q) => void` | required | The chosen quarter |
| `quarters` | `string[]` | `Q1`–`Q4` | `BUDGET_QUARTERS` |
| `year`, `years`, `onYearChange` | `string`, `string[]`, `(y) => void` | required | The year `Select` |
| `table` | `BudgetTableProps` without `disabled` | required | The rows and their change handlers; `disabled` follows `saving` |
| `saving` | `boolean` | `false` | A save is in flight |
| `dirty` | `boolean` | `false` | There are unsaved edits |
| `onSave` | `() => void` | required | Save Changes was pressed |
| `saveLabel` | `string` | `Save Changes` | |
| `className`, rest | | | On the wrapping `div` |

## Accessibility

- The page title is the `h1`. The quarter control is a named radio group ("Quarter"); the year is a named select ("Year").
- Save Changes is a real button: while saving it is `aria-busy` and stays focusable, so focus is not lost when the save ends.
- The toasts are announced by the live regions in `ToastViewport` (polite for success, assertive for the failure); focus does not move to them.
- Everything else is `BudgetTable`'s: each field is named for its row ("Development allocated points").

## Don't

- **Don't pair the quarter control at its default 48 with the year select at 36.** The page draws both at 36, as the dashboard does.
- **Don't clear the table when a save fails.** Keep what was typed (`dirty` stays on), say so in the toast, and let Save be tried again.
- **Don't rely on the browser's prompt alone.** Pass `dirty` for a closed or reloaded tab, and ask with the "Leave without saving?" dialog before the quarter, the year or the page changes with unsaved edits.
- **Don't carry unsaved edits to another quarter.** They belong to the quarter they were typed for.
- **Don't put Save in the table.** One button for the whole page.
- **Don't say "cycle" for the period.** A budget is per quarter; a cycle is a planning fortnight.
