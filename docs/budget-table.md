# BudgetTable *(pattern)*

Where an admin sets each domain's development-point budget for a quarter. One row per domain: the points allocated (a number
field with an up/down stepper), what is consumed against it as a bar, what remains, and an optional note. Built to Figma's
`Domain Budget Edit` page (`Domain_Budget_Table` and its row, item and header pieces).

## Composed of

| Piece | Tier |
|---|---|
| `DataTable` | component |
| `DomainBudgetSummary` | component |
| `ProgressBar` | atom |
| `Skeleton` | atom |
| `Stepper` | atom |
| `Textarea` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `BudgetTable` | Editing every domain's quarterly allocation in one place |
| `DomainBudgetSummary` | Reading one domain's budget for a quarter |
| `DataTable` | Any other table |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `rows` | `BudgetRow[]` | required | `id`, `domain`, `allocated` (`number \| null`, `null` while no budget is set), `consumed`, `notes?` |
| `onAllocatedChange` | `(id, allocated: number \| null) => void` | — | A typed, nudged or cleared (`null`) allocation |
| `onNotesChange` | `(id, notes: string) => void` | — | A note was edited |
| `maxAllocated` | `number` | `9999` | The largest allocation a domain can be given |
| `disabled` | `boolean` | — | Locks every field — while a save is in flight |
| `loading` / `loadingRows` | `boolean` / `number` | — / `6` | Placeholder rows instead of `rows` while the budgets load; the headers stay. One status says "Loading domain budget" and the table is `aria-busy` |
| `commitDelay` | `number` (ms) | `600` | The quiet after typing in an allocation before it commits, so Remaining and the bar follow while it is typed. A nudge commits at once |
| `hints` | `{ allocated?, consumed?, remaining? }` | Figma's copy | What each column's ⓘ says (`BUDGET_COLUMN_HINTS` are the defaults) |
| `caption` | `string` | `Domain budget` | The table's accessible name |

It is **controlled and saves nothing**. The page owns the save, and the stories show the whole flow:

| Moment | What the page does |
|---|---|
| Saving | `Button` `loading` on "Save Changes", and `disabled` on the table and on the quarter and year controls |
| Saved | A success `Toast` — "Changes Saved" |
| **The save fails** | A `critical` `Toast` ("Changes not saved … your changes are still here — try again"); unlock the table and **keep what was typed**, so Save can be tried again (`SaveFails`) |
| Leaving with unsaved changes | The browser's own prompt: while there are edits, call `preventDefault()` on `beforeunload`, and stop once saved. The table has no prompt of its own |

**The page must include the quarter and year controls**, as Figma's edit page draws them: a Q1–Q4 `SegmentedControl` and a year
`Select`, top right above the table. **Both are 40 high** — the segmented control at `size="lg"` (its default is 48) and the
`Select` at `size="md"` — so they sit as one row; do not pair a 40 with a 32 (`sm`). Lock both with `disabled` while saving. The
`OnThePage` story composes them.

## The columns

| Column | What it is |
|---|---|
| Domain | The name. Never narrower than its text (`fit`) |
| Allocated Points | `Stepper` `up-down`, `sm`. Empty ("Set Budget") for a domain with no budget; clearing the field takes it back to unset. Only a number can be typed. A nudge commits at once; typing commits, clamped, after a brief pause (`commitDelay`) or on blur or Enter |
| Consumed | The points used, then a `ProgressBar` of how much of the allocation that is |
| Remaining | `allocated − consumed`, red when negative. A domain with no allocation counts as 0 |
| Optional Notes | One line, clipped, until it has focus; then it grows to show everything written. Empty, it says "Optional Note" |

**Remaining and the bar are derived from the row**, with no second state to keep in step, so they update the moment the
allocation does: at once for a nudge, after the brief pause (`commitDelay`) for typing — not on every keystroke, and not only
on blur.

## The bar's status

It is the Domain Budget card's, once (`budgetStatus`), drawn as **Figma's table draws it: brand blue, or its bright red
(`alert`, `accent.critical.outline.border`) at 100% and over. No amber**: the card has a 75–99% warning, the table does not
(decided 9 Nov 2026: follow Figma on each surface).
Importing it means this table and `DomainBudgetSummary` can never disagree about when a budget is in trouble. A domain with no
allocation and nothing consumed reads 0%; with no allocation and points consumed, it reads over budget.

## Tokens

Everything is on the type ramp: `body-sm-medium` for the names, points and notes, `text.primary`; the over-budget Remaining is
`accent.critical.outline.content`. Hints are `DataTable`'s `ColumnHint`. No new tokens.

**Differences from Figma, on purpose.** The bar is `ProgressBar`'s 8 high, without Figma's outline, and its warning fill is the
atom's accessible one. The notes field is a textarea that clips its single line, where Figma draws an ellipsis ("…"): a
textarea can't truncate with one, and the field has to be a textarea to grow. Vertical alignment in a grown row is centred
(Figma aligns to the top).

## Accessibility

- A real `<table>` (from `DataTable`), named by `caption`, with column headers; the headers' ⓘ glyphs are focusable buttons
  ("About allocated points") that open the definition on hover **and** focus.
- Every field is named for its row — "Development allocated points", "Development note" — so a screen reader never meets six
  identical "Allocated points" fields. The stepper's buttons carry the same name ("Increase Development allocated points").
- Each bar is a named `progressbar` ("Development budget usage"). Status is not colour alone: the points beside it, and a
  negative Remaining, say the same.
- The stepper's carets are a pointer affordance and leave the tab order; Arrow Up and Down in the field are the keyboard path.
- Contrast: names, points and notes `text.primary` (20.17:1 light / 14.63:1 dark); the red Remaining is
  `accent.critical.outline.content` (4.77:1 / 5.06:1).

## Don't

- **Don't keep Remaining or the bar in state.** Derive them from `allocated` and `consumed`.
- **Don't map a number to a bar tone at the call site.** The bands live in `budgetStatus`.
- **Don't put Save in the table.** One button for the whole page, with `disabled` on the table while it saves.
- **Don't clear the table when a save fails.** Keep what was typed and say so in the toast.
- **Don't use it to read a budget.** That is `DomainBudgetSummary`.
