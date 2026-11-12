# DomainBudgetEditPage *(pattern)*

The main content of the page where an admin sets each domain's development-point budget for a quarter: the title, the quarter and year controls, the budget table, and **Save Changes**. It goes inside `AppShell`,
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
| Always | The quarter control (Q1–Q4, `SegmentedControl` `lg`) and the year `Select` (`md`) are **both 40 high**, top right above the table, so they sit as one row. Never pair a 40 with a 32 |
| `saving` | **Save Changes** spins (`aria-busy`), and the table, the quarter and the year are all locked |
| `dirty` | The browser asks before the page is left (`beforeunload`). The browser's own prompt: there is no dialog to build |
| `table.loading` | The table shows placeholders, and Save is disabled: there is nothing to save |

## What the page does

It is **controlled and holds no data**. The page owns the rows, the quarter, the year, `saving` and `dirty`; this puts them in order, 16 apart and 32 in from the sides.

| Moment | What the page passes and does |
|---|---|
| Save Changes pressed | `onSave`: start the save and set `saving` |
| **Saved** | Clear `dirty`, and show a success `Toast`: "Changes Saved" |
| **The save fails** | Clear `saving`, **leave `dirty` on and keep what was typed**, and show a `critical` `Toast` ("Changes not saved … your changes are still here — try again"). Save stays available to try again |
| The quarter or year changes | `onQuarterChange` / `onYearChange`. What happens to unsaved edits is the page's: ask first, or carry them. (The design doesn't say: see the question in the PR) |
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

- **Don't pair the quarter control at 48 with the year select at 40.** The page draws both at 40.
- **Don't clear the table when a save fails.** Keep what was typed (`dirty` stays on), say so in the toast, and let Save be tried again.
- **Don't build a leave-page dialog.** Pass `dirty`; the browser asks.
- **Don't put Save in the table.** One button for the whole page.
- **Don't say "cycle" for the period.** A budget is per quarter; a cycle is a planning fortnight.
