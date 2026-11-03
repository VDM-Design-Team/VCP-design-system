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
| `hints` | `{ allocated?, consumed?, remaining? }` | Figma's copy | What each column's ⓘ says (`BUDGET_COLUMN_HINTS` are the defaults) |
| `caption` | `string` | `Domain budget` | The table's accessible name |

It is **controlled and saves nothing**. The "Save Changes" button, its loading state and the "Changes Saved" toast belong to
the page: compose them with `Button`'s `loading` and `Toast` (the `OnThePage` story shows it). Lock the table with
`disabled` while saving. The quarter and year pickers are the page's too.

## The columns

| Column | What it is |
|---|---|
| Domain | The name. Never narrower than its text (`fit`) |
| Allocated Points | `Stepper` `up-down`, `sm`. Empty ("Set Budget") for a domain with no budget; clearing the field takes it back to unset. Arrow Up and Down nudge; typing commits, clamped, on blur or Enter |
| Consumed | The points used, then a `ProgressBar` of how much of the allocation that is |
| Remaining | `allocated − consumed`, red when negative. A domain with no allocation counts as 0 |
| Optional Notes | One line, clipped, until it has focus; then it grows to show everything written. Empty, it says "Optional Note" |

**Remaining and the bar are derived from the row**, so they follow the allocation as it is typed, with no second state to
keep in step.

## The bar's status

It is the Domain Budget card's, once (`budgetStatus`): under 75% used is brand blue, 75–99% warning, 100% and over critical.
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
- **Don't use it to read a budget.** That is `DomainBudgetSummary`.
